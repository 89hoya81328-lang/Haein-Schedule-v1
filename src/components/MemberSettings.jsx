import React, { useState } from 'react';
import { X, Plus, Trash2, Check, ChevronUp, ChevronDown, GripVertical } from 'lucide-react';
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

const EditMemberModal = ({ author, emoji, color, onSave, onRemove, onSetAsProfile, onEmojiClick, onClose }) => {
  const [editingName, setEditingName] = useState(author);
  const [editingColor, setEditingColor] = useState(color);

  const handleSave = () => {
    if (!editingName.trim()) return;
    onSave(author, editingName.trim(), editingColor);
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{zIndex: 9995, background: 'rgba(0,0,0,0.6)'}}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{padding: '24px', maxWidth: '340px', margin: 'auto', borderRadius: '24px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center'}}>
          <h4 style={{margin: 0, fontSize: '1.2rem', fontWeight: '900'}}>{author} 수정</h4>
          <button onClick={onClose} style={{background: '#f0f0f0', border: 'none', cursor: 'pointer', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><X size={18}/></button>
        </div>
        
        <div style={{display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px'}}>
          <button 
            onClick={onEmojiClick}
            style={{
              width: '50px', height: '50px', fontSize: '1.5rem', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid #ddd', borderRadius: '16px', background: '#fff', cursor: 'pointer',
              flexShrink: 0
            }}
          >
            {emoji}
          </button>
          <div style={{flex: 1}}>
            <input 
              type="text" 
              value={editingName} 
              onChange={(e) => setEditingName(e.target.value)} 
              style={{width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '1.05rem'}}
            />
          </div>
          <input 
            type="color" 
            value={editingColor} 
            onChange={e => setEditingColor(e.target.value)} 
            style={{width: '50px', height: '50px', border: 'none', borderRadius: '16px', cursor: 'pointer', padding: 0, flexShrink: 0}} 
          />
        </div>

        <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
          <button onClick={handleSave} style={{width: '100%', padding: '14px', borderRadius: '14px', border: 'none', background: 'var(--text-main)', color: 'white', fontWeight: 'bold', fontSize: '1.05rem', cursor: 'pointer'}}>
            저장
          </button>
          <button 
            onClick={() => { onSetAsProfile(author); onClose(); }} 
            style={{width: '100%', padding: '14px', borderRadius: '14px', border: '2px solid var(--text-main)', background: '#fff', color: 'var(--text-main)', fontWeight: 'bold', fontSize: '1.05rem', cursor: 'pointer'}}
          >
            이 프로필을 내 역할로 설정
          </button>
          <button 
            onClick={() => { onRemove(author); onClose(); }} 
            style={{width: '100%', padding: '14px', borderRadius: '14px', border: 'none', background: '#fff5f5', color: '#e74c3c', fontWeight: 'bold', fontSize: '1.05rem', cursor: 'pointer'}}
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
};

export const MemberSettings = ({ onClose }) => {
  const { caretakerColors, caretakerEmojis, updateColor, updateEmoji, addCaretaker, removeCaretaker, renameCaretaker, setCurrentUser, authors } = useColors();
  const [pickingFor, setPickingFor] = useState(null);
  const [editingAuthor, setEditingAuthor] = useState(null);
  const [addingNew, setAddingNew] = useState(false);
  const [newName, setNewName] = useState('');

  const CIRCLE_RADIUS = 110;

  const handleAddPerson = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    addCaretaker(newName.trim());
    setNewName('');
    setAddingNew(false);
  };

  const handleSaveEdit = (author, newNameVal, newColor) => {
    if (newColor !== caretakerColors[author]) {
      updateColor(author, newColor);
    }
    if (newNameVal !== author) {
      renameCaretaker(author, newNameVal);
    }
    setEditingAuthor(null);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-title">
          <span>구성원 관리</span>
          <button onClick={onClose}><X size={20}/></button>
        </div>
        
        <div className="settings-body" style={{padding: '30px 20px', minHeight: '340px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{
            position: 'relative', width: `${CIRCLE_RADIUS*2 + 80}px`, height: `${CIRCLE_RADIUS*2 + 80}px`, 
            margin: '0 auto'
          }}>
            {authors.map((author, i) => {
              const angle = (i * 360) / authors.length;
              const rad = angle * Math.PI / 180;
              const x = Math.sin(rad) * CIRCLE_RADIUS;
              const y = -Math.cos(rad) * CIRCLE_RADIUS;
              
              return (
                <button
                  key={author}
                  onClick={() => setEditingAuthor(author)}
                  style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                    width: '76px', height: '76px', borderRadius: '50%', border: 'none',
                    background: caretakerColors[author] || '#f8f9fa',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                    transition: 'transform 0.2s', padding: '0', zIndex: 2
                  }}
                  onPointerDown={e => e.currentTarget.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(0.9)`}
                  onPointerUp={e => e.currentTarget.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(1)`}
                  onPointerLeave={e => e.currentTarget.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(1)`}
                >
                  <span style={{fontSize: '1.8rem', marginBottom: '2px'}}>{caretakerEmojis[author]}</span>
                  <span style={{fontSize: '0.75rem', fontWeight: 'bold', color: '#333', background: 'rgba(255,255,255,0.7)', padding: '2px 6px', borderRadius: '10px'}}>{author}</span>
                </button>
              );
            })}
            
            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              textAlign: 'center', width: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center'
            }}>
              <span style={{fontSize: '1.2rem', marginBottom: '4px'}}>✨</span>
              <span style={{fontWeight: '900', fontSize: '1.2rem', color: 'var(--text-main)', letterSpacing: '2px'}}>최해인</span>
              <span style={{fontSize: '1.2rem', marginTop: '4px'}}>✨</span>
            </div>
          </div>
        </div>

        <div style={{display: 'flex', gap: '10px', margin: '0 20px 20px'}}>
          <button 
            onClick={() => setAddingNew(true)} 
            style={{flex: 1, padding: '16px', background: '#fff', color: 'var(--text-main)', border: '2px dashed var(--text-main)', borderRadius: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer'}}
          >
            <Plus size={20}/> 새 가족 추가
          </button>
          <button className="close-btn" onClick={onClose} style={{flex: 1, padding: '16px', background: 'var(--text-main)', color: 'white', borderRadius: '14px', fontWeight: '800', border: 'none', cursor: 'pointer'}}>닫기</button>
        </div>
      </div>

      {editingAuthor && (
        <EditMemberModal
          author={editingAuthor}
          emoji={caretakerEmojis[editingAuthor]}
          color={caretakerColors[editingAuthor]}
          onSave={handleSaveEdit}
          onRemove={removeCaretaker}
          onSetAsProfile={setCurrentUser}
          onEmojiClick={() => setPickingFor(editingAuthor)}
          onClose={() => setEditingAuthor(null)}
        />
      )}

      {addingNew && (
        <div className="modal-overlay" onClick={() => setAddingNew(false)} style={{zIndex: 9995, background: 'rgba(0,0,0,0.6)'}}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{padding: '24px', maxWidth: '340px', margin: 'auto', borderRadius: '24px'}}>
            <h4 style={{margin: '0 0 16px', fontSize: '1.2rem', fontWeight: '900'}}>새 구성원 추가</h4>
            <form onSubmit={handleAddPerson} style={{display: 'flex', gap: '8px'}}>
              <input type="text" placeholder="이름 (예: 삼촌)" value={newName} onChange={e => setNewName(e.target.value)} style={{flex: 1, padding: '12px 14px', borderRadius: '12px', border: '1px solid #ddd'}} autoFocus />
              <button type="submit" style={{background: 'var(--text-main)', color: 'white', border: 'none', borderRadius: '12px', padding: '0 16px', cursor: 'pointer', fontWeight: 'bold'}}>추가</button>
            </form>
          </div>
        </div>
      )}

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
