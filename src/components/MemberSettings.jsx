import React, { useState } from 'react';
import { X, Plus, Trash2, Check, ChevronUp, ChevronDown } from 'lucide-react';
import { useColors } from '../store/ColorContext';

const EMOJI_CATEGORIES = [
  {
    name: '자연/사물',
    icon: '🌸',
    emojis: [
      '🌸','🌷','🌻','🍀','🌙','⭐','⛅','🌈','🍎','🍓','🍒','🐾',
      '🌲','🌳','🌴','🌵','🌾','🌿','🍄','🌰','🌺','🌹','🌼','🍃',
      '🌍','☀️','🌝','🪐','🌟','🌠','☁️','🌤️','⛅','🌥️','🌦️','🌧️',
      '⛈️','🌩️','🌨️','❄️','⛄','🌬️','💨','🌪️','🌫️','🌊','💧','💦',
      '🍉','🍊','🍋','🍌','🍍','🥭','🍏','🍐','🍑','🍒','🍓','🫐',
      '🥝','🍅','🫒','🥥','🥑','🍆','🥔','🥕','🌽','🌶️','🫑','🥒',
      '🥬','🥦','🧄','🧅','🍄','🥜','🌰','🍞','🥐','🥖','🫓','🥨',
      '🥯','🥞','🧇','🧀','🍖','🍗','🥩','🥓','🍔','🍟','🍕','🌭',
      '🥪','🌮','🌯','🫔','🥙','🧆','🥚','🍳','🥘','🍲','🫕','🥣',
      '🥗','🍿','🧈','🧂','🥫','🍱','🍘','🍙','🍚','🍛','🍜','🍝',
      '🍠','🍢','🍣','🍤','🍥','🥮','🍡','🥟','🥠','🥡','🦀','🦞',
      '🦐','🦑','🦪','🍦','🍧','🍨','🍩','🍪','🎂','🍰','🧁','🥧'
    ],
  },
  {
    name: '얼굴/표정',
    icon: '😊',
    emojis: [
      '👨','👩','👵','👴','👦','👧','👶','😊','😍','🥰','😎','😆',
      '👱‍♂️','👱‍♀️','🧔','👨‍🦰','👩‍🦰','👨‍🦱','👩‍🦱','👨‍🦳','👩‍🦳','👨‍🦲','👩‍🦲','👮','🕵️','💂',
      '👷','🤴','👸','👳','👲','🧕','🤵','👰','🤰','🤱','👼','🎅','🤶',
      '🦸','🦹','🧙','🧚','🧛','🧜','🧝','🧞','🧟',
      '😀','😃','😄','😁','😅','😂','🤣','🥲','☺️','😇','🙂','🙃','😉','😌',
      '😋','😛','😝','😜','🤪','🤨','🧐','🤓','😎','🥸','🤩','🥳','😏','😒'
    ],
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

        <div style={{
          display: 'grid', 
          gridTemplateRows: 'repeat(4, 1fr)', 
          gridAutoFlow: 'column', 
          gap: '8px', 
          overflowX: 'auto', 
          paddingBottom: '16px',
          scrollbarWidth: 'none'
        }}>
          {EMOJI_CATEGORIES[activeTab].emojis.map((emoji, i) => (
            <button
              key={i}
              onClick={() => { onSelect(emoji); onClose(); }}
              style={{
                fontSize: '2rem', padding: '0', border: 'none', background: 'transparent',
                cursor: 'pointer', borderRadius: '12px',
                boxShadow: currentEmoji === emoji ? '0 0 0 2px var(--text-main)' : 'none',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
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

export const MemberSettings = ({ onClose, type = 'board' }) => {
  const { caretakerColors, caretakerEmojis, updateColor, updateEmoji, addCaretaker, removeCaretaker, renameCaretaker, reorderCaretakers } = useColors(type);
  const authors = Object.keys(caretakerEmojis);
  const [newName, setNewName] = useState('');
  const [pickingFor, setPickingFor] = useState(null);
  
  const [editingAuthor, setEditingAuthor] = useState(null);
  const [editingName, setEditingName] = useState('');

  const handleAddPerson = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    addCaretaker(newName.trim());
    setNewName('');
  };

  const startEdit = (author) => {
    setEditingAuthor(author);
    setEditingName(author);
  };

  const saveEdit = (author) => {
    if (editingName.trim() && editingName !== author) {
      renameCaretaker(author, editingName.trim());
    }
    setEditingAuthor(null);
  };

  const handleClose = () => {
    if (newName.trim()) {
      addCaretaker(newName.trim());
      setNewName('');
    }
    onClose();
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
            {authors.map((p, idx) => (
              <div 
                key={p} 
                className="color-row" 
                style={{
                  display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center',
                  background: 'white', padding: '8px 12px', borderRadius: '12px', border: '1px solid #eee'
                }}
              >
                <div style={{display:'flex', flexDirection:'column', alignItems:'center', color:'#ccc', marginRight:'12px'}}>
                  <button onClick={() => idx > 0 && reorderCaretakers(idx, idx - 1)} disabled={idx === 0} style={{background:'none', border:'none', color: idx === 0 ? '#eee' : '#999', cursor: idx === 0 ? 'default' : 'pointer', padding:0}}><ChevronUp size={20}/></button>
                  <button onClick={() => idx < authors.length - 1 && reorderCaretakers(idx, idx + 1)} disabled={idx === authors.length - 1} style={{background:'none', border:'none', color: idx === authors.length - 1 ? '#eee' : '#999', cursor: idx === authors.length - 1 ? 'default' : 'pointer', padding:0}}><ChevronDown size={20}/></button>
                </div>
                {editingAuthor === p ? (
                  <div style={{display:'flex', gap:'8px', flex:1, marginRight:'12px'}}>
                    <input 
                      type="text" 
                      value={editingName} 
                      onChange={(e) => setEditingName(e.target.value)} 
                      style={{flex:1, padding:'6px 10px', borderRadius:'8px', border:'1px solid #ddd', minWidth: '0'}}
                      autoFocus
                    />
                    <button onClick={() => saveEdit(p)} style={{background:'var(--text-main)', color:'white', border:'none', borderRadius:'8px', padding:'0 10px', cursor:'pointer', flexShrink: 0}}><Check size={16}/></button>
                    <button onClick={() => removeCaretaker(p)} style={{background:'#fff5f5', color:'#e74c3c', border:'none', borderRadius:'8px', padding:'0 10px', cursor:'pointer', flexShrink: 0}}><Trash2 size={16}/></button>
                  </div>
                ) : (
                  <span className="p-name" style={{fontWeight: '700', cursor:'pointer', flex:1, padding: '8px 0'}} onClick={() => startEdit(p)}>{p}</span>
                )}
                
                <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
                  <button 
                    onClick={() => setPickingFor(p)}
                    style={{
                      width: '40px', height: '40px', fontSize: '1.2rem', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '1px solid #ddd', borderRadius: '10px', background: '#fff', cursor: 'pointer',
                      flexShrink: 0
                    }}
                  >
                    {caretakerEmojis[p]}
                  </button>
                  <input type="color" className="color-input" value={caretakerColors[p]} onChange={e => updateColor(p, e.target.value)} style={{width: '40px', height: '40px', border: 'none', borderRadius: '10px', cursor: 'pointer', padding: 0, flexShrink: 0}} />
                </div>
              </div>
            ))}
            <form className="add-p-form" onSubmit={handleAddPerson} style={{display: 'flex', gap: '8px', marginTop: '20px'}}>
              <input type="text" placeholder="새 이름..." value={newName} onChange={e => setNewName(e.target.value)} style={{flex: 1, padding: '12px 14px', borderRadius: '12px', border: '1px solid #ddd'}}/>
            </form>
          </section>
        </div>
        <button className="close-btn" onClick={handleClose} style={{width: 'calc(100% - 40px)', margin: '0 20px 20px', padding: '16px', background: 'var(--text-main)', color: 'white', borderRadius: '14px', fontWeight: '800'}}>완료</button>
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
