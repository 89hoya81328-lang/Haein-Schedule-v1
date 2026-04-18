import React, { useState } from 'react';
import { Pencil, Check, Plus, Trash2, X } from 'lucide-react';
import './HaeinReadme.css';

const formatDateTime = () => {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${now.getFullYear().toString().slice(2)}.${pad(now.getMonth()+1)}.${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

const SECTION_COLORS = ['#f5f0ff', '#f0f8f4', '#f0f5ff', '#fff5f5'];

const INITIAL_SECTIONS = [
  {
    id: 1,
    title: '🌟 요즘 최애 관심사',
    items: [
      '뽀로로 시대는 갔습니다. 무조건 티니핑 (그중에서도 하츄핑)',
      '잠들기 전 꼭 읽어야 하는 책: "달님 안녕"',
    ],
    updatedAt: '26.04.14 09:30',
    bgColor: SECTION_COLORS[0],
  },
  {
    id: 2,
    title: '🍴 식사 & 간식 매뉴얼',
    items: [
      '파란색 숟가락으로 주면 밥 투정이 50% 감소합니다.',
      '간식 빈도: 하원 후 1회, 저녁 식사 전까지.',
      '당근은 아주 잘게 다져야 먹습니다 (편식 주의).',
    ],
    updatedAt: '26.04.13 21:00',
    bgColor: SECTION_COLORS[1],
  },
  {
    id: 3,
    title: '🌙 수면 프로토콜',
    items: [
      '취침 시간: 21:00 딱 맞춰서 불 끄기',
      '잠자리 유튜브: 지브리 오르골 자장가 재생',
      '토끼 인형이 침대에 있는지 확인 필수!',
    ],
    updatedAt: '26.04.12 08:00',
    bgColor: SECTION_COLORS[2],
  },
  {
    id: 4,
    title: '⚠️ 현재 HOTFIX',
    items: [
      '아침/저녁 일교차로 콧물 조금 있음. 외출 시 얇은 카디건 챙겨주세요.',
      '병원은 아직 안 가도 될 수준.',
    ],
    updatedAt: '26.04.14 19:45',
    isWarning: true,
    bgColor: SECTION_COLORS[3],
  },
];

const ReadmeSection = ({ section, onSave, onDelete }) => {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(section.title);
  const [items, setItems] = useState([...section.items]);
  const [newItem, setNewItem] = useState('');
  const [hovered, setHovered] = useState(false);

  const handleSave = () => {
    onSave(section.id, title, items);
    setEditing(false);
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    setItems(prev => [...prev, newItem.trim()]);
    setNewItem('');
  };

  const handleRemoveItem = (idx) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  return (
    <div
      className={`readme-section ${section.isWarning ? 'warning-section' : ''}`}
      style={{ backgroundColor: section.bgColor || '#fff' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Header */}
      <div className="readme-section-header">
        {editing ? (
          <input
            className="title-input"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        ) : (
          <h3 className="readme-section-title">{section.title}</h3>
        )}

        <div className="section-header-actions">
          <span className="updated-at">{section.updatedAt}</span>
          {(hovered || editing) && !editing && (
            <button className="edit-icon-btn" onClick={() => setEditing(true)}>
              <Pencil size={14} />
            </button>
          )}
          {editing && (
            <>
              <button className="save-icon-btn" onClick={handleSave}><Check size={14} /></button>
              <button className="cancel-icon-btn" onClick={() => { setEditing(false); setTitle(section.title); setItems([...section.items]); }}><X size={14} /></button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <ul className="readme-items">
        {items.map((item, idx) => (
          <li key={idx} className="readme-item">
            <span className="item-dot">›</span>
            {editing ? (
              <div className="editing-row">
                <input
                  className="item-input"
                  value={item}
                  onChange={e => setItems(items.map((v, i) => i === idx ? e.target.value : v))}
                />
                <button className="remove-item-btn" onClick={() => handleRemoveItem(idx)}><Trash2 size={13} /></button>
              </div>
            ) : (
              <span className="item-text">{item}</span>
            )}
          </li>
        ))}
      </ul>

      {/* Add item in edit mode */}
      {editing && (
        <form className="add-item-form" onSubmit={handleAddItem}>
          <input type="text" placeholder="새 항목 추가..." value={newItem} onChange={e => setNewItem(e.target.value)} />
          <button type="submit"><Plus size={15} /></button>
        </form>
      )}

      {/* Delete section */}
      {editing && (
        <button className="delete-section-btn" onClick={() => onDelete(section.id)}>
          <Trash2 size={14} /> 섹션 삭제
        </button>
      )}
    </div>
  );
};

const HaeinReadme = () => {
  const [sections, setSections] = useState(INITIAL_SECTIONS);
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');

  const handleSave = (id, title, items) => {
    setSections(secs => secs.map(s =>
      s.id === id ? { ...s, title, items, updatedAt: formatDateTime() } : s
    ));
  };

  const handleDelete = (id) => {
    setSections(secs => secs.filter(s => s.id !== id));
  };

  const handleAddSection = (e) => {
    e.preventDefault();
    if (!newSectionTitle.trim()) return;
    setSections(prev => [...prev, {
      id: Date.now(),
      title: newSectionTitle,
      items: [],
      updatedAt: formatDateTime(),
      bgColor: SECTION_COLORS[prev.length % SECTION_COLORS.length],
    }]);
    setNewSectionTitle('');
    setShowAddSection(false);
  };

  return (
    <div className="readme-container page-transition">
      <div className="readme-header">
        <div>
          <h2 className="readme-main-title">해인이 쑥쑥 가이드 🍼</h2>
        </div>
      </div>

      <div className="sections-list">
        {sections.map(section => (
          <ReadmeSection
            key={section.id}
            section={section}
            onSave={handleSave}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Add new section */}
      {showAddSection ? (
        <form className="add-section-form" onSubmit={handleAddSection}>
          <input
            type="text"
            placeholder="새 섹션 제목..."
            value={newSectionTitle}
            onChange={e => setNewSectionTitle(e.target.value)}
            autoFocus
          />
          <div className="form-row">
            <button type="submit" className="add-confirm-btn"><Check size={16} /> 추가</button>
            <button type="button" className="add-cancel-btn" onClick={() => setShowAddSection(false)}><X size={16} /></button>
          </div>
        </form>
      ) : (
        <button className="add-section-btn" onClick={() => setShowAddSection(true)}>
          <Plus size={16} /> 새 섹션 추가
        </button>
      )}
    </div>
  );
};

export default HaeinReadme;
