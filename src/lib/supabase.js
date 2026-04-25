import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase 환경 변수가 설정되지 않았습니다. .env 파일을 확인하세요.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ========== 스케줄 CRUD ==========

/**
 * 모든 스케줄 데이터를 Supabase에서 불러옵니다.
 */
export async function fetchSchedules() {
  const { data, error } = await supabase
    .from('schedules')
    .select('*')
    .order('week_id', { ascending: true })
    .order('day_index', { ascending: true });

  if (error) {
    console.error('스케줄 로드 실패:', error);
    return null;
  }
  return data;
}

/**
 * 스케줄 한 행을 upsert(없으면 생성, 있으면 업데이트)합니다.
 */
export async function upsertSchedule(row) {
  const { error } = await supabase
    .from('schedules')
    .upsert(row, { onConflict: 'week_id,day_index' });

  if (error) {
    console.error('스케줄 저장 실패:', error);
    return false;
  }
  return true;
}

// ========== 미디어 스토리지 ==========

/**
 * 이미지 파일을 Supabase Storage files 버킷에 업로드합니다.
 * @param {File|Blob} file - 업로드할 파일
 * @param {string} fileName - 저장 경로/이름
 * @returns {string|null} 공개 URL 또는 null
 */
export async function uploadFile(file, fileName) {
  const { data, error } = await supabase
    .storage
    .from('files')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    console.error('파일 업로드 실패:', error);
    return null;
  }

  // 공개 URL 반환
  const { data: urlData } = supabase
    .storage
    .from('files')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

/**
 * 썸네일용 URL을 생성합니다 (Supabase Image Transformation 활용).
 * @param {string} path - 파일 경로
 * @param {number} width - 썸네일 너비 (기본 300px)
 */
export function getThumbnailUrl(path, width = 300) {
  const { data } = supabase
    .storage
    .from('files')
    .getPublicUrl(path, {
      transform: {
        width,
        height: width,
        resize: 'contain',
      },
    });
  return data.publicUrl;
}

/**
 * 파일의 원본 공개 URL을 반환합니다.
 */
export function getOriginalUrl(path) {
  const { data } = supabase
    .storage
    .from('files')
    .getPublicUrl(path);
  return data.publicUrl;
}

/**
 * 파일을 삭제합니다.
 * @param {string[]} paths - 삭제할 파일 경로 배열
 */
export async function deleteFiles(paths) {
  const { error } = await supabase
    .storage
    .from('files')
    .remove(paths);

  if (error) {
    console.error('파일 삭제 실패:', error);
    return false;
  }
  return true;
}

// ========== 미디어 메타 데이터 (DB) ==========

export async function fetchMediaList() {
  const { data, error } = await supabase
    .from('media')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('미디어 목록 로드 실패:', error);
    return [];
  }
  return data;
}

export async function insertMedia(row) {
  const { data, error } = await supabase
    .from('media')
    .insert(row)
    .select()
    .single();

  if (error) {
    console.error('미디어 메타 저장 실패:', error);
    return null;
  }
  return data;
}

export async function updateMediaCaption(id, caption) {
  const { error } = await supabase
    .from('media')
    .update({ caption })
    .eq('id', id);

  if (error) console.error('캡션 업데이트 실패:', error);
  return !error;
}

export async function deleteMediaRows(ids) {
  const { error } = await supabase
    .from('media')
    .delete()
    .in('id', ids);

  if (error) console.error('미디어 메타 삭제 실패:', error);
  return !error;
}

// ========== 방명록 메시지 ==========

export async function fetchMessages() {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('메시지 로드 실패:', error);
    return [];
  }
  return data;
}

export async function insertMessage(row) {
  const { data, error } = await supabase
    .from('messages')
    .insert(row)
    .select()
    .single();

  if (error) {
    console.error('메시지 저장 실패:', error);
    return null;
  }
  return data;
}

export async function updateMessage(id, text) {
  const { error } = await supabase
    .from('messages')
    .update({ text })
    .eq('id', id);

  if (error) console.error('메시지 수정 실패:', error);
  return !error;
}

export async function deleteMessage(id) {
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', id);

  if (error) console.error('메시지 삭제 실패:', error);
  return !error;
}

// ========== 쇼핑 리스트 ==========
export async function fetchShoppingItems() {
  const { data, error } = await supabase.from('shopping_items').select('*').order('created_at', { ascending: true });
  if (error) { console.error('쇼핑 로드 실패:', error); return []; }
  return data;
}

export async function upsertShoppingItem(row) {
  const { data, error } = await supabase.from('shopping_items').upsert(row).select().single();
  if (error) { console.error('쇼핑 아이템 저장 실패:', error); return null; }
  return data;
}

export async function deleteShoppingItem(id) {
  const { error } = await supabase.from('shopping_items').delete().eq('id', id);
  if (error) console.error('쇼핑 삭제 실패:', error);
  return !error;
}

// ========== 육아 가이드 ==========
export async function fetchGuides() {
  const { data, error } = await supabase.from('guide_sections').select('*').order('sort_order', { ascending: true });
  if (error) { console.error('가이드 로드 실패:', error); return []; }
  return data;
}

export async function upsertGuide(row) {
  const { data, error } = await supabase.from('guide_sections').upsert(row).select().single();
  if (error) { console.error('가이드 저장 실패:', error); return null; }
  return data;
}

export async function deleteGuide(id) {
  const { error } = await supabase.from('guide_sections').delete().eq('id', id);
  if (error) console.error('가이드 삭제 실패:', error);
  return !error;
}

// ========== 앱 설정 (구성원 등) ==========
export async function fetchSettings(key) {
  const { data, error } = await supabase.from('app_settings').select('value').eq('key', key).single();
  if (error && error.code !== 'PGRST116') { console.error('설정 로드 실패:', error); return null; }
  return data ? data.value : null;
}

export async function upsertSettings(key, value) {
  const { error } = await supabase.from('app_settings').upsert({ key, value });
  if (error) console.error('설정 저장 실패:', error);
  return !error;
}

// ========== 실시간 동기화 (Realtime) ==========
export function subscribeToTable(tableName, onUpdate) {
  const channel = supabase
    .channel(`realtime_${tableName}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: tableName },
      (payload) => onUpdate(payload)
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`${tableName} 실시간 구독 성공`);
      }
    });
  return channel;
}


