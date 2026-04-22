import React, { useState, useEffect, useCallback } from 'react';
import { useColors } from '../store/ColorContext';
import { Settings2, Calendar as CalendarIcon, X, ChevronLeft, ChevronRight, Plus, Check } from 'lucide-react';
import { MemberSettings } from '../components/MemberSettings';
import { fetchSchedules, upsertSchedule } from '../lib/supabase';
import './Scheduler.css';

const INITIAL_WEEKS = [
  {
    weekId: 'w0', label: '지난 주', monthLabel: '4월', month: 4,
    days: [
      { date: 6, day: '월', isWeekend: false, holiday: '', drop: '아빠', pick: '엄마', notes: [] },
      { date: 7, day: '화', isWeekend: false, holiday: '', drop: '엄마', pick: '할머니', notes: [] },
      { date: 8, day: '수', isWeekend: false, holiday: '', drop: '할머니', pick: '아빠', notes: [] },
      { date: 9, day: '목', isWeekend: false, holiday: '', drop: '엄마', pick: '엄마', notes: [] },
      { date: 10, day: '금', isWeekend: false, holiday: '', drop: '아빠', pick: '할머니', notes: [] },
      { date: 11, day: '토', isWeekend: true, holiday: '', family: '집콕 휴식', notes: [] },
      { date: 12, day: '일', isWeekend: true, holiday: '', family: '마트 장보기', notes: [] },
    ]
  },
  {
    weekId: 'w1', label: '이번 주', monthLabel: '4월', month: 4,
    days: [
      { date: 13, day: '월', isWeekend: false, holiday: '', drop: '엄마', pick: '아빠', notes: [] },
      { date: 14, day: '화', isWeekend: false, holiday: '', drop: '아빠', pick: '할머니', notes: [] },
      { date: 15, day: '수', isWeekend: false, holiday: '', drop: '엄마', pick: '엄마', notes: [] },
      { date: 16, day: '목', isWeekend: false, holiday: '', drop: '할머니', pick: '아빠', notes: [] },
      { date: 17, day: '금', isWeekend: false, holiday: '', drop: '아빠', pick: '엄마', notes: [] },
      { date: 18, day: '토', isWeekend: true, holiday: '', family: '할아버지 댁 방문', notes: [] },
      { date: 19, day: '일', isWeekend: true, holiday: '', family: '동물원 나들이', notes: [] },
    ]
  },
  {
    weekId: 'w2', label: '다음 주', monthLabel: '4월', month: 4,
    days: [
      { date: 20, day: '월', isWeekend: false, holiday: '', drop: '엄마', pick: '아빠', notes: [] },
      { date: 21, day: '화', isWeekend: false, holiday: '', drop: '할머니', pick: '할머니', notes: [] },
      { date: 22, day: '수', isWeekend: false, holiday: '', drop: '아빠', pick: '엄마', notes: [] },
      { date: 23, day: '목', isWeekend: false, holiday: '', drop: '엄마', pick: '할머니', notes: [] },
      { date: 24, day: '금', isWeekend: false, holiday: '', drop: '아빠', pick: '엄마', notes: [] },
      { date: 25, day: '토', isWeekend: true, holiday: '', family: '집콕 휴식', notes: [] },
      { date: 26, day: '일', isWeekend: true, holiday: '', family: '마트 장보기', notes: [] },
    ]
  },
  {
    weekId: 'w3', label: '3주 후', monthLabel: '4~5월', month: 4,
    days: [
      { date: 27, day: '월', isWeekend: false, holiday: '', drop: '아빠', pick: '엄마', notes: [] },
      { date: 28, day: '화', isWeekend: false, holiday: '', drop: '엄마', pick: '할머니', notes: [] },
      { date: 29, day: '수', isWeekend: false, holiday: '', drop: '할머니', pick: '아빠', notes: [] },
      { date: 30, day: '목', isWeekend: false, holiday: '', drop: '엄마', pick: '엄마', notes: [] },
      { date: 1, day: '금', isWeekend: false, holiday: '', drop: '아빠', pick: '할머니', notes: [] },
      { date: 2, day: '토', isWeekend: true, holiday: '', family: '근교 나들이', notes: [] },
      { date: 3, day: '일', isWeekend: true, holiday: '', family: '가족 모임', notes: [] },
    ]
  }
];

function generateMonth(year, month) {
  const HOLIDAYS = { '01-01': '신정', '02-16': '설날', '02-17': '설날', '02-18': '설날', '03-01': '삼일절', '05-05': '어린이날', '05-24': '부처님오신날', '05-25': '대체공휴일', '06-06': '현충일', '08-15': '광복절', '09-24': '추석', '09-25': '추석', '09-26': '추석', '10-03': '개천절', '10-09': '한글날', '12-25': '크리스마스' };
  const firstDow = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const today = new Date();
  return {
    title: `${year}년 ${month}월`, year, month, firstDow,
    days: Array.from({ length: daysInMonth }, (_, i) => {
      const d = i + 1;
      const key = `${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const dow = (firstDow + i) % 7;
      return { date: d, isWeekend: dow === 0 || dow === 6, holiday: HOLIDAYS[key] || null, isToday: today.getFullYear() === year && today.getMonth() + 1 === month && today.getDate() === d };
    })
  };
}

const CALENDAR_MONTHS = [generateMonth(2026, 3), generateMonth(2026, 4), generateMonth(2026, 5), generateMonth(2026, 6)];

const Scheduler = () => {
  const { caretakerColors, caretakerEmojis, updateColor, updateEmoji, addCaretaker } = useColors('schedule');
  const [weeks, setWeeks] = useState(INITIAL_WEEKS);
  const [weekIndex, setWeekIndex] = useState(1);
  const [dbLoaded, setDbLoaded] = useState(false);

  // Load schedules from Supabase on mount
  useEffect(() => {
    (async () => {
      const rows = await fetchSchedules();
      if (rows && rows.length > 0) {
        const newWeeks = [...INITIAL_WEEKS].map(w => ({ ...w, days: w.days.map(d => ({ ...d })) }));
        rows.forEach(r => {
          const wIdx = newWeeks.findIndex(w => w.weekId === r.week_id);
          if (wIdx >= 0 && r.day_index >= 0 && r.day_index < newWeeks[wIdx].days.length) {
            const d = newWeeks[wIdx].days[r.day_index];
            if (r.drop_person) d.drop = r.drop_person;
            if (r.pick_person) d.pick = r.pick_person;
            if (r.family !== undefined && r.family !== null) d.family = r.family;
            if (r.notes && r.notes.length) d.notes = r.notes;
          }
        });
        setWeeks(newWeeks);
      }
      setDbLoaded(true);
    })();
  }, []);

  // Helper to persist a single day to Supabase
  const persistDay = useCallback(async (weekId, dayIndex, dayData) => {
    await upsertSchedule({
      week_id: weekId,
      day_index: dayIndex,
      date: dayData.date,
      day: dayData.day,
      is_weekend: dayData.isWeekend,
      holiday: dayData.holiday || '',
      drop_person: dayData.drop || '',
      pick_person: dayData.pick || '',
      family: dayData.family || '',
      notes: dayData.notes || [],
    });
  }, []);
  const [showSettings, setShowSettings] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [picker, setPicker] = useState(null); // { dayIdx, type }
  const [editNote, setEditNote] = useState(null); // { dayIdx, text }
  const [editFamily, setEditFamily] = useState(null); // { dayIdx, text }

  const caretakers = Object.keys(caretakerColors);
  const week = weeks[weekIndex];
  const getColor = (person) => caretakerColors[person] || '#f0f0f0';

  const openNoteEditor = (dayIdx, notesArr) => {
    setEditNote({ dayIdx, text: notesArr.join('\n') });
  };

  const saveNote = () => {
    if (!editNote) return;
    const notesArr = editNote.text.split('\n').map(s => s.trim()).filter(Boolean);
    const newWeeks = weeks.map((w, wi) => {
      if (wi !== weekIndex) return w;
      return { ...w, days: w.days.map((d, di) => {
        if (di !== editNote.dayIdx) return d;
        return { ...d, notes: notesArr };
      })};
    });
    setWeeks(newWeeks);
    const updatedDay = newWeeks[weekIndex].days[editNote.dayIdx];
    persistDay(newWeeks[weekIndex].weekId, editNote.dayIdx, updatedDay);
    setEditNote(null);
  };

  const openFamilyEditor = (dayIdx, text) => {
    setEditFamily({ dayIdx, text: text || '' });
  };

  const saveFamily = () => {
    if (!editFamily) return;
    const newWeeks = weeks.map((w, wi) => {
      if (wi !== weekIndex) return w;
      return { ...w, days: w.days.map((d, di) => {
        if (di !== editFamily.dayIdx) return d;
        return { ...d, family: editFamily.text.trim() };
      })};
    });
    setWeeks(newWeeks);
    const updatedDay = newWeeks[weekIndex].days[editFamily.dayIdx];
    persistDay(newWeeks[weekIndex].weekId, editFamily.dayIdx, updatedDay);
    setEditFamily(null);
  };

  const openPicker = (dayIdx, type) => {
    setPicker(picker && picker.dayIdx === dayIdx && picker.type === type ? null : { dayIdx, type });
  };

  const selectCaretaker = (person) => {
    if (!picker) return;
    const newWeeks = weeks.map((w, wi) => {
      if (wi !== weekIndex) return w;
      return { ...w, days: w.days.map((d, di) => {
        if (di !== picker.dayIdx) return d;
        return { ...d, [picker.type]: person };
      })};
    });
    setWeeks(newWeeks);
    const updatedDay = newWeeks[weekIndex].days[picker.dayIdx];
    persistDay(newWeeks[weekIndex].weekId, picker.dayIdx, updatedDay);
    setPicker(null);
  };

  const handleCalendarDateClick = (date, month) => {
    const targetWeekIdx = weeks.findIndex(w => 
      w.days.some(d => {
        // Since mock data dates are unique within this small window, matching date is mostly enough.
        // For month edge cases (e.g. May 1st to 3rd), w.month is 4 but it covers May 1-3. 
        if (month === 5 && date <= 3) return w.weekId === 'w3' && d.date === date;
        return d.date === date;
      })
    );
    if (targetWeekIdx >= 0) {
      setWeekIndex(targetWeekIdx);
      setShowCalendar(false);
    }
  };

  const curDate = new Date();
  const todayMatch = (dMonth, dDate) => {
    return curDate.getFullYear() === 2026 && 
           curDate.getMonth() + 1 === dMonth && 
           curDate.getDate() === dDate;
  };

  return (
    <div className="scheduler-container page-transition">
      <div className="week-nav">
        <button className="arrow-btn" onClick={() => setWeekIndex(i => Math.max(0, i - 1))} disabled={weekIndex === 0}><ChevronLeft size={20}/></button>
        <div className="week-center">
          <span className="week-label">{week.label}</span>
          <span className="week-sub">{week.month}/{week.days[0].date}({week.days[0].day}) ~ {week.days[6].date >= week.days[0].date ? week.month : week.month+1}/{week.days[6].date}({week.days[6].day})</span>
        </div>
        <button className="arrow-btn" onClick={() => setWeekIndex(i => Math.min(weeks.length - 1, i + 1))} disabled={weekIndex === weeks.length - 1}><ChevronRight size={20}/></button>
      </div>

      <div className="top-actions">
        <button className="act-btn" onClick={() => setShowCalendar(true)}><CalendarIcon size={14}/> 달력</button>
        <button className="act-btn" onClick={() => setShowSettings(true)}><Settings2 size={14}/> 구성원</button>
      </div>

      <div className="sched-table">
        <div className="sched-thead">
          <div className="th-cell">날짜</div>
          <div className="th-cell">등원</div>
          <div className="th-cell">하원</div>
          <div className="th-cell">특이사항</div>
        </div>
        {week.days.map((d, i) => {
          const isH = !!d.holiday;
          const isW = d.isWeekend;
          const currentDayMonth = d.date > 20 && week.monthLabel.includes('5') && d.date >= 1 && d.date <= 6 ? 5 : week.month;
          const isCurrentToday = todayMatch(currentDayMonth, d.date);
          
          return (
            <div key={i} className={`sched-row ${isH ? 'row-holiday' : ''} ${isW ? 'row-weekend' : ''}`}>
              <div className="td-date">
                <span className={`td-date-num ${isCurrentToday ? 'today-circle' : ''}`}>{d.date}</span>
                <span className="td-date-day">{d.day}</span>
              </div>
              {(isH || isW) ? (
                <div className="td-family-span" onClick={() => openFamilyEditor(i, d.family)} style={{cursor: 'pointer'}}>
                  {isH && <span className="hol-tag">{d.holiday}</span>}
                  <span className="fam-text">{d.family || '+ 일정 추가'}</span>
                </div>
              ) : (
                <>
                  <div className="td-shift-wrap">
                    <div className="td-shift" onClick={() => openPicker(i, 'drop')}><span className="badge" style={{backgroundColor: getColor(d.drop)}}>{d.drop}</span></div>
                  </div>
                  <div className="td-shift-wrap">
                    <div className="td-shift" onClick={() => openPicker(i, 'pick')}><span className="badge" style={{backgroundColor: getColor(d.pick)}}>{d.pick}</span></div>
                  </div>
                </>
              )}
              <div className="td-notes" onClick={() => openNoteEditor(i, d.notes)} style={{cursor: 'pointer'}}>
                {d.notes.length > 0 ? d.notes.map((n,ni) => <span key={ni} className="note-line">· {n}</span>) : <span className="note-empty">+ 메모 추가</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Caretaker Picker Modal */}
      {picker && (
        <div className="modal-overlay" onClick={() => setPicker(null)} style={{zIndex: 9000}}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{padding: '24px', maxWidth: '340px', margin: 'auto', borderRadius: '24px', height: 'auto', maxHeight: '90vh'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center'}}>
              <h4 style={{margin: 0, fontSize: '1.2rem', fontWeight: '900'}}>{picker.type === 'drop' ? '등원' : '하원'} 담당자 선택</h4>
              <button onClick={() => setPicker(null)} style={{background: '#f0f0f0', border: 'none', cursor: 'pointer', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><X size={18}/></button>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto', paddingBottom: '10px', scrollbarWidth: 'none'}}>
              {caretakers.map(p => {
                const isSelected = p === week.days[picker.dayIdx][picker.type];
                return (
                  <button
                    key={p}
                    onClick={() => selectCaretaker(p)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px',
                      borderRadius: '20px', border: 'none',
                      background: isSelected ? '#f8e8ea' : '#fff',
                      color: isSelected ? 'var(--text-main)' : '#333',
                      fontWeight: isSelected ? '900' : '700',
                      fontSize: '1.05rem', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s',
                      boxShadow: isSelected ? '0 0 0 2px var(--text-main)' : '0 4px 12px rgba(0,0,0,0.03)'
                    }}
                    onPointerDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                    onPointerUp={e => e.currentTarget.style.transform = 'scale(1)'}
                    onPointerLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <span style={{width: '24px', height: '24px', borderRadius: '50%', background: getColor(p), border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}/>
                    <span>{p}</span>
                    {isSelected && <Check size={18} style={{marginLeft: 'auto'}}/>}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {editNote && (
        <div className="modal-overlay" onClick={() => setEditNote(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h4>특이사항 수정</h4>
            <textarea
              value={editNote.text}
              onChange={e => setEditNote({ ...editNote, text: e.target.value })}
              placeholder="특이사항을 입력하세요 (엔터로 줄바꿈)"
              autoFocus
            />
            <button className="modal-save-btn" onClick={saveNote}>저장</button>
          </div>
        </div>
      )}

      {editFamily && (
        <div className="modal-overlay" onClick={saveFamily}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{padding: '24px', maxWidth: '340px', margin: 'auto', borderRadius: '24px'}}>
            <div className="sheet-title"><span>일정 수정</span><button onClick={() => setEditFamily(null)} style={{background: 'none', border: 'none', cursor: 'pointer'}}><X size={20}/></button></div>
            <div className="settings-body" style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
              <input
                type="text"
                value={editFamily.text}
                onChange={e => setEditFamily({ ...editFamily, text: e.target.value })}
                placeholder="예: 집콕 휴식, 마트 구경 등"
                autoFocus
                onKeyDown={e => { if (e.key === 'Enter') saveFamily(); }}
                style={{width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '1.05rem', outline: 'none'}}
              />
              <button 
                onClick={saveFamily}
                style={{background: 'var(--text-main)', color: 'white', padding: '14px', borderRadius: '12px', fontWeight: '800', fontSize: '1rem', border: 'none', width: '100%', cursor: 'pointer'}}
              >
                완료
              </button>
            </div>
          </div>
        </div>
      )}

      {showSettings && <MemberSettings onClose={() => setShowSettings(false)} type="schedule" />}

      {showCalendar && (
        <div className="modal-overlay" onClick={() => setShowCalendar(false)}>
          <div className="calendar-sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-title"><span>달력</span><button onClick={() => setShowCalendar(false)}><X size={20}/></button></div>
            <div className="cal-scroll">
              {CALENDAR_MONTHS.map((m, mi) => (
                <div key={mi} className="mon-block">
                  <div className="mon-name">{m.title}</div>
                  <div className="cal-grid">
                    {['일','월','화','수','목','금','토'].map(d => <div key={d} className="cal-dn">{d}</div>)}
                    {Array.from({length: m.firstDow}).map((_,i)=><div key={`p${i}`}/>)}
                    {m.days.map((d,i) => (
                      <div key={i} className={`cal-d ${d.holiday?'cal-hol':''} ${d.isWeekend?'cal-we':''} ${d.isToday?'today-circle':''}`} onClick={() => handleCalendarDateClick(d.date, m.month)}>
                        {d.date}
                        {d.holiday && <span className="cal-dot"/>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {editNote && (
        <div className="modal-overlay" onClick={() => setEditNote(null)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-title"><span>특이사항 편집</span><button onClick={() => setEditNote(null)}><X size={20}/></button></div>
            <div className="settings-body" style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
              <textarea 
                value={editNote.text}
                onChange={e => setEditNote({...editNote, text: e.target.value})}
                placeholder="특이사항을 입력하세요 (줄바꿈 가능)"
                style={{width: '100%', height: '120px', padding: '12px', borderRadius: '12px', border: '1px solid #ddd', resize: 'none', fontSize: '1rem', outline: 'none'}}
                autoFocus
              />
              <button 
                onClick={saveNote}
                style={{background: 'var(--text-main)', color: 'white', padding: '14px', borderRadius: '12px', fontWeight: '800', fontSize: '1rem'}}
              >저장하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scheduler;
