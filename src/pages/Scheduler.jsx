import React, { useState } from 'react';
import { useColors } from '../store/ColorContext';
import { Settings2, Calendar as CalendarIcon, X, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import './Scheduler.css';

const INITIAL_WEEKS = [
  {
    weekId: 'w0', label: '지난 주', monthLabel: '4월', month: 4,
    days: [
      { date: 8, day: '월', isWeekend: false, holiday: '', drop: '아빠', pick: '엄마', notes: [] },
      { date: 9, day: '화', isWeekend: false, holiday: '', drop: '엄마', pick: '할머니', notes: ['치과 검진일'] },
      { date: 10, day: '수', isWeekend: false, holiday: '', drop: '할머니', pick: '아빠', notes: [] },
      { date: 11, day: '목', isWeekend: false, holiday: '', drop: '엄마', pick: '엄마', notes: [] },
      { date: 12, day: '금', isWeekend: false, holiday: '', drop: '아빠', pick: '할머니', notes: [] },
      { date: 13, day: '토', isWeekend: true, holiday: '', family: '집콕 휴식', notes: [] },
      { date: 14, day: '일', isWeekend: true, holiday: '', family: '마트 장보기', notes: [] },
    ]
  },
  {
    weekId: 'w1', label: '이번 주', monthLabel: '4월', month: 4,
    days: [
      { date: 15, day: '월', isWeekend: false, holiday: '', drop: '엄마', pick: '아빠', notes: ['준비물 챙기기', '우산 준비'] },
      { date: 16, day: '화', isWeekend: false, holiday: '', drop: '아빠', pick: '할머니', notes: ['체육복 입는 날'] },
      { date: 17, day: '수', isWeekend: false, holiday: '', drop: '엄마', pick: '엄마', notes: ['특별 활동 (요리)'] },
      { date: 18, day: '목', isWeekend: false, holiday: '', drop: '할머니', pick: '아빠', notes: ['병원 예약 하원'] },
      { date: 19, day: '금', isWeekend: false, holiday: '', drop: '아빠', pick: '엄마', notes: ['이불 가져오기'] },
      { date: 20, day: '토', isWeekend: true, holiday: '', family: '할아버지 댁 방문', notes: ['오전 10시 출발'] },
      { date: 21, day: '일', isWeekend: true, holiday: '', family: '동물원 나들이', notes: ['유모차, 간식 챙기기'] },
    ]
  },
  {
    weekId: 'w2', label: '다음 주', monthLabel: '4월', month: 4,
    days: [
      { date: 22, day: '월', isWeekend: false, holiday: '', drop: '엄마', pick: '아빠', notes: [] },
      { date: 23, day: '화', isWeekend: false, holiday: '', drop: '할머니', pick: '할머니', notes: ['소풍 (도시락)'] },
      { date: 24, day: '수', isWeekend: false, holiday: '크리스마스이브', drop: '', pick: '', notes: ['홈파티 준비'] },
      { date: 25, day: '목', isWeekend: false, holiday: '크리스마스', drop: '', pick: '', notes: ['산타 선물'] },
      { date: 26, day: '금', isWeekend: false, holiday: '', drop: '아빠', pick: '엄마', notes: [] },
      { date: 27, day: '토', isWeekend: true, holiday: '', family: '집콕 휴식', notes: [] },
      { date: 28, day: '일', isWeekend: true, holiday: '', family: '마트 장보기', notes: [] },
    ]
  },
  {
    weekId: 'w3', label: '3주 후', monthLabel: '4~5월', month: 5,
    days: [
      { date: 29, day: '월', isWeekend: false, holiday: '', drop: '아빠', pick: '엄마', notes: [] },
      { date: 30, day: '화', isWeekend: false, holiday: '', drop: '엄마', pick: '할머니', notes: [] },
      { date: 1, day: '수', isWeekend: false, holiday: '', drop: '할머니', pick: '아빠', notes: [] },
      { date: 2, day: '목', isWeekend: false, holiday: '', drop: '엄마', pick: '엄마', notes: [] },
      { date: 3, day: '금', isWeekend: false, holiday: '', drop: '아빠', pick: '할머니', notes: [] },
      { date: 4, day: '토', isWeekend: true, holiday: '', family: '근교 나들이', notes: [] },
      { date: 5, day: '일', isWeekend: true, holiday: '어린이날', family: '어린이날 행사', notes: ['놀이동산 11시'] },
    ]
  }
];

function generateMonth(year, month) {
  const HOLIDAYS = { '04-25': '크리스마스', '05-05': '어린이날', '06-06': '현충일' };
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
  const { caretakerColors, updateColor, addCaretaker } = useColors();
  const [weeks, setWeeks] = useState(INITIAL_WEEKS);
  const [weekIndex, setWeekIndex] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [newName, setNewName] = useState('');
  const [picker, setPicker] = useState(null); // { dayIdx, type }

  const caretakers = Object.keys(caretakerColors);
  const week = weeks[weekIndex];
  const getColor = (person) => caretakerColors[person] || '#f0f0f0';

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
    setPicker(null);
  };

  const handleAddPerson = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    addCaretaker(newName.trim());
    setNewName('');
  };

  const handleCalendarDateClick = (date, month) => {
    const idx = INITIAL_WEEKS.findIndex(w => w.days.some(d => d.date === date && (w.month === month || (month === 5 && w.month === 5))));
    if (idx >= 0) { setWeekIndex(idx); setShowCalendar(false); }
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
        <button className="act-btn" onClick={() => setShowSettings(true)}><Settings2 size={14}/> 설정</button>
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
          return (
            <div key={i} className={`sched-row ${isH ? 'row-holiday' : ''} ${isW ? 'row-weekend' : ''}`}>
              <div className="td-date">
                <span className="td-date-num">{d.date}</span>
                <span className="td-date-day">{d.day}</span>
              </div>
              {(isH || isW) ? (
                <div className="td-family-span">
                  {isH && <span className="hol-tag">{d.holiday}</span>}
                  <span className="fam-text">{d.family}</span>
                </div>
              ) : (
                <>
                  <div className="td-shift-wrap">
                    <div className="td-shift" onClick={() => openPicker(i, 'drop')}><span className="badge" style={{backgroundColor: getColor(d.drop)}}>{d.drop}</span></div>
                    {picker && picker.dayIdx === i && picker.type === 'drop' && (
                      <div className="picker-popup">
                        {caretakers.map(p => (
                          <div key={p} className={`picker-item ${p === d.drop ? 'picker-active' : ''}`} onClick={() => selectCaretaker(p)}>
                            <span className="picker-dot" style={{backgroundColor: getColor(p)}}/>
                            <span>{p}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="td-shift-wrap">
                    <div className="td-shift" onClick={() => openPicker(i, 'pick')}><span className="badge" style={{backgroundColor: getColor(d.pick)}}>{d.pick}</span></div>
                    {picker && picker.dayIdx === i && picker.type === 'pick' && (
                      <div className="picker-popup">
                        {caretakers.map(p => (
                          <div key={p} className={`picker-item ${p === d.pick ? 'picker-active' : ''}`} onClick={() => selectCaretaker(p)}>
                            <span className="picker-dot" style={{backgroundColor: getColor(p)}}/>
                            <span>{p}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
              <div className="td-notes">
                {d.notes.length > 0 ? d.notes.map((n,ni) => <span key={ni} className="note-line">· {n}</span>) : <span className="note-empty">-</span>}
              </div>
            </div>
          );
        })}
      </div>

      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-title"><span>설정</span><button onClick={() => setShowSettings(false)}><X size={20}/></button></div>
            <div className="settings-body">
              <section className="settings-section">
              <h4>담당자 관리</h4>
              {caretakers.map(p => (
                <div key={p} className="color-row">
                  <span className="p-name">{p}</span>
                  <input type="color" className="color-input" value={caretakerColors[p]} onChange={e => updateColor(p, e.target.value)}/>
                </div>
              ))}
              <form className="add-p-form" onSubmit={handleAddPerson}>
                <input type="text" placeholder="새 이름..." value={newName} onChange={e => setNewName(e.target.value)}/>
                <button type="submit"><Plus size={16}/></button>
              </form>
              </section>
            </div>
            <button className="close-btn" onClick={() => setShowSettings(false)}>완료</button>
          </div>
        </div>
      )}

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
                      <div key={i} className={`cal-d ${d.holiday?'cal-hol':''} ${d.isWeekend?'cal-we':''} ${d.isToday?'cal-today':''}`} onClick={() => handleCalendarDateClick(d.date, m.month)}>
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
    </div>
  );
};

export default Scheduler;
