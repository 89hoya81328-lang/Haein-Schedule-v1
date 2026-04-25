import { createClient } from '@supabase/supabase-js';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const url = 'https://pulmrcpcanasdqrukugk.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1bG1yY3BjYW5hc2RxcnVrdWdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3NDQyMzcsImV4cCI6MjA5MjMyMDIzN30.rHUwCr3kh1w2_DXzhYONiaFwQgPuav8NiZcvUnZZaQ4';

const supabase = createClient(url, key);

async function testConnection() {
  console.log('1. DB 연결 테스트 중...');
  const { data: dbData, error: dbError } = await supabase.from('schedules').select('*');
  if (dbError) {
    console.error('❌ DB 조회 에러:', dbError);
  } else {
    console.log('✅ DB 조회 성공! 데이터 수:', dbData.length);
    console.log(dbData);
  }
  
  const { error: upsertError } = await supabase.from('schedules').upsert({ week_id: 'test', day_index: 0, date: 1, day: 'Mon' }, { onConflict: 'week_id,day_index' });
  if (upsertError) {
    console.error('❌ DB 저장 에러:', upsertError);
  } else {
    console.log('✅ DB 저장 성공!');
  }

  console.log('\n2. Storage 연결 테스트 중...');
  const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
  if (storageError) {
    console.error('❌ Storage 에러:', storageError.message);
  } else {
    const names = buckets.map(b => b.name);
    console.log(`✅ Storage 연결 성공! 발견된 버킷: ${names.join(', ')}`);
    if (!names.includes('files')) {
       console.log('⚠️ 경고: files 라는 이름의 버킷이 없습니다!');
    }
  }

  console.log('\n3. 파일 업로드 권한 테스트 중...');
  const testFile = new Blob(['hello'], { type: 'text/plain' });
  const { data: uploadData, error: uploadError } = await supabase.storage.from('files').upload('test.txt', testFile, { upsert: true });
  if (uploadError) {
    console.error('❌ 업로드 권한 에러:', uploadError);
  } else {
    console.log('✅ 업로드 테스트 성공!', uploadData);
  }
}

testConnection();
