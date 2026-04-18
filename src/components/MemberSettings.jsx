import React, { useState } from 'react';
import { X, Plus, Smile } from 'lucide-react';
import { useColors } from '../store/ColorContext';

const EMOJI_CATEGORIES = [
  {
    name: '자연/사물',
    icon: '🌸',
    emojis: ['🌸', '🌷', '🌻', '🍀', '🌙', '⭐', '⛅', '🌈', '🍎', '🍓', '🍒', '🐾'],
  },
  {
    name: '얼굴/표정',
    icon: '😊',
    emojis: ['👨', '👩', '👵', '👴', '👦', '👧', '👶', '😊', '😍', '🥰', '😎', '😆'],
  }
];

const EmojiPickerModal = ({ currentEmoji, onSelect, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="modal-overlay" onClick={onClose} style={{zIndex: 9999}}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{padding: '16px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '16px'}}>
          <h4 style={{margin: 0}}>이모티콘 선택</h4>
          <button onClick={onClose} style={{background:'none', border:'none', cursor:'pointer'}}><X size={20}/></button>
        </div>
        
        <div style={{display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '8px'}}>
          {EMOJI_CATEGORIES.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              style={{
                flex: 1, padding: '8px', borderRadius: '8px', border: 'none',
                background: activeTab === idx ? '#f0f0f0' : 'transparent',
                fontWeight: activeTab === idx ? '800' : '500',
                cursor: 'pointer'
              }}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        <div style={{display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center'}}>
          {EMOJI_CATEGORIES[activeTab].emojis.map(emoji => (
            <button
              key={emoji}
              onClick={() => { onSelect(emoji); onClose(); }}
              style={{
                fontSize: '2rem', padding: '8px', border: 'none', background: 'transparent',
                cursor: 'pointer', borderRadius: '12px',
                boxShadow: currentEmoji === emoji ? '0 0 0 2px var(--text-main)' : 'none'
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export const MemberSettings = ({ onClose }) => {
  const { caretakerColors, caretakerEmojis, updateColor, updateEmoji, addCaretaker } = useColors();
  const authors = Object.keys(caretakerEmojis);
  const [newName, setNewName] = useState('');
  const [pickingFor, setPickingFor] = useState(null); // author name string if picker is open

  const handleAddPerson = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    addCaretaker(newName.trim());
    setNewName('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-title">
          <span>구성원 관리</span>
          <button onClick={onClose}><X size={20}/></button>
        </div>
        <div className="settings-body" style={{padding: '20px'}}>
          <section className="settings-section">
            <h4 style={{marginBottom: '16px', fontSize: '1rem', color: 'var(--text-main)'}}>담당자 목록</h4>
            {authors.map(p => (
              <div key={p} className="color-row" style={{display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center'}}>
                <span className="p-name" style={{fontWeight: '700'}}>{p}</span>
                <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
                  <button 
                    onClick={() => setPickingFor(p)}
                    style={{
                      width: '40px', height: '40px', fontSize: '1.2rem', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '1px solid #ddd', borderRadius: '10px', background: '#fff', cursor: 'pointer'
                    }}
                  >
                    {caretakerEmojis[p]}
                  </button>
                  <input type="color" className="color-input" value={caretakerColors[p]} onChange={e => updateColor(p, e.target.value)} style={{width: '40px', height: '40px', border: 'none', borderRadius: '10px', cursor: 'pointer', padding: 0}} />
                </div>
              </div>
            ))}
            <form className="add-p-form" onSubmit={handleAddPerson} style={{display: 'flex', gap: '8px', marginTop: '20px'}}>
              <input type="text" placeholder="새 이름..." value={newName} onChange={e => setNewName(e.target.value)} style={{flex: 1, padding: '12px 14px', borderRadius: '12px', border: '1px solid #ddd'}}/>
              <button type="submit" style={{padding: '12px 16px', background: 'var(--text-main)', color: 'white', borderRadius: '12px'}}><Plus size={16}/></button>
            </form>
          </section>
        </div>
        <button className="close-btn" onClick={onClose} style={{width: 'calc(100% - 40px)', margin: '0 20px 20px', padding: '16px', background: 'var(--text-main)', color: 'white', borderRadius: '14px', fontWeight: '800'}}>완료</button>
      </div>

      {pickingFor && (
        <EmojiPickerModal 
          currentEmoji={caretakerEmojis[pickingFor]} 
          onSelect={(emoji) => updateEmoji(pickingFor, emoji)} 
          onClose={() => setPickingFor(null)} 
        />
      )}
    </div>
  );
};
