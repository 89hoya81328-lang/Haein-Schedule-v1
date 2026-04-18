import React, { useState } from 'react';
import { Send, Heart, Grid, MessageSquare, X, ChevronLeft, ChevronRight, Play, Settings2, Plus, Upload, Pencil, Trash2, Palette, Check } from 'lucide-react';
import { useColors } from '../store/ColorContext';
import { MemberSettings } from '../components/MemberSettings';
import './FamilyBoard.css';

// type: 'photo' or 'video'
const MOCK_MEDIA = [
  { id: 1, type: 'photo', url: 'https://images.unsplash.com/photo-1543335785-84f728fa58fa?auto=format&fit=crop&w=600&q=80', caption: '주말 동물원 나들이', date: '26.04.13', size: 1850000 },
  { id: 2, type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', poster: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=600&q=80', caption: '어린이집에서 노는 모습 🎬', date: '26.04.11', size: 15400000 },
  { id: 3, type: 'photo', url: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=600&q=80', caption: '할머니랑 산책', date: '26.04.08', size: 2100000 },
  { id: 4, type: 'video', url: 'https://www.w3schools.com/html/movie.mp4', poster: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=600&q=80', caption: '집에서 춤추는 영상 🎬', date: '26.04.05', size: 12200000 },
  { id: 5, type: 'photo', url: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=600&q=80', caption: '어린이집 첫 등원!', date: '26.04.01', size: 2800000 },
];

const MOCK_MESSAGES = [
  { id: 1, author: '아빠', text: '오늘 하원할 때 미술 작품 가져왔어. 냉장고에 붙여놨다!', date: '26.04.15 18:20' },
  { id: 2, author: '엄마', text: '내일 등원 10분 일찍 해야 해! 사진 찍는 날이래.', date: '26.04.15 13:00' },
  { id: 3, author: '할머니', text: '할미가 좋아하는 반찬 해놨다. 아빠 퇴근길에 가져가렴~', date: '26.04.14 11:20' },
  { id: 4, author: '엄마', text: '오늘 등원할 때 해인이가 많이 울었어요 ㅠㅠ', date: '26.04.14 08:30' },
  { id: 5, author: '아빠', text: '주말에 비온대. 동물원 말고 키즈카페 알아볼게.', date: '26.04.13 21:00' },
];

// Media renderer (photo or video)
const MediaItem = ({ item, className }) => {
  if (item.type === 'video') {
    return (
      <video
        className={className}
        src={item.url}
        poster={item.poster}
        style={{ filter: item.cssFilter || 'none' }}
        autoPlay
        muted
        loop
        playsInline
      />
    );
  }
  return <img src={item.url} alt={item.caption} className={className} style={{ filter: item.cssFilter || 'none' }} />;
};

const FamilyBoard = () => {
  const { caretakerEmojis } = useColors();
  const authors = Object.keys(caretakerEmojis);
  const [currentUser, setCurrentUser] = useState(authors[0] || '엄마');
  const [showSettings, setShowSettings] = useState(false);
  const [showAuthorSelect, setShowAuthorSelect] = useState(false);

  const [media, setMedia] = useState(MOCK_MEDIA);
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [newMsg, setNewMsg] = useState('');
  const [mediaIndex, setMediaIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editingMsgText, setEditingMsgText] = useState('');
  
  const [viewingMedia, setViewingMedia] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [editingCaptionId, setEditingCaptionId] = useState(null);
  const [captionText, setCaptionText] = useState('');

  const fileInputRef = React.useRef(null);

  const getEmoji = (a) => caretakerEmojis[a] || '💬';

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const dateStr = `${now.getFullYear().toString().slice(2)}.${pad(now.getMonth()+1)}.${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    setMessages([{ id: Date.now(), author: currentUser, text: newMsg, date: dateStr }, ...messages]);
    setNewMsg('');
  };

  const startEditMsg = (m) => {
    setEditingMsgId(m.id);
    setEditingMsgText(m.text);
  };

  const saveEditMsg = (id) => {
    if (!editingMsgText.trim()) return;
    setMessages(prev => prev.map(m => m.id === id ? { ...m, text: editingMsgText } : m));
    setEditingMsgId(null);
  };

  const deleteMedia = (id) => {
    const updated = media.filter(m => m.id !== id);
    if (updated.length === 0) return; // Prevent deleting last for mock safety
    setMedia(updated);
    setMediaIndex(i => Math.min(i, updated.length - 1));
  };

  const startEditCaption = (m) => {
    setEditingCaptionId(m.id);
    setCaptionText(m.caption);
  };

  const saveCaption = (id) => {
    if (!captionText.trim()) { setEditingCaptionId(null); return; }
    setMedia(prev => prev.map(m => m.id === id ? { ...m, caption: captionText.trim() } : m));
    setEditingCaptionId(null);
  };

  const deleteSelectedMedia = () => {
    const updated = media.filter(m => !selectedMedia.includes(m.id));
    if (updated.length === 0) {
      alert('더 이상 삭제할 수 없습니다.');
      return; 
    }
    setMedia(updated);
    setSelectedMedia([]);
    setIsSelecting(false);
    setMediaIndex(0);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const reader = new FileReader();
    reader.onloadend = () => {
      const now = new Date();
      const pad = n => String(n).padStart(2, '0');
      const dateStr = `${now.getFullYear().toString().slice(2)}.${pad(now.getMonth()+1)}.${pad(now.getDate())}`;
      
      const newMedia = {
        id: Date.now(),
        type: isVideo ? 'video' : 'photo',
        url: reader.result,
        poster: isVideo ? '' : undefined,
        caption: `${currentUser}의 업로드`,
        date: dateStr,
        size: file.size
      };
      
      setMedia([newMedia, ...media]);
      setMediaIndex(0);
      setShowGallery(false);
    };
    reader.readAsDataURL(file);
  };

  const currentMedia = media[mediaIndex] || MOCK_MEDIA[0];
  const totalMediaBytes = media.reduce((acc, m) => acc + (m.size || 0), 0);
  const totalMediaMB = (totalMediaBytes / (1024 * 1024)).toFixed(1);

  return (
    <div className="board-container page-transition">
      {/* Gallery */}
      <section>
        <div className="sec-hdr">
          <h2 className="sec-t"><Heart size={16} color="#ff8fa3"/> 해인이 갤러리</h2>
          <div style={{display:'flex', gap:'8px'}}>
            <button className="viewall-btn" onClick={() => fileInputRef.current?.click()} style={{background: 'var(--text-main)', color: 'white'}}><Upload size={14}/> 업로드</button>
            <button className="viewall-btn" onClick={() => setShowGallery(true)}><Grid size={16}/> 전체보기</button>
          </div>
        </div>
        <div className="photo-carousel">
          <button className="car-btn" onClick={() => setMediaIndex(i => Math.max(0, i-1))} disabled={mediaIndex===0}><ChevronLeft size={18}/></button>
          <div className="car-body">
            <div className="car-media-wrap" onClick={() => setViewingMedia(currentMedia)} style={{cursor:'pointer', position: 'relative'}}>
              <MediaItem item={currentMedia} className="car-img" />
              {currentMedia.type === 'video' && <span className="video-badge"><Play size={12}/> 동영상</span>}
            </div>
            <div className="car-meta" style={{display:'flex', flexDirection:'column', gap:'6px'}}>
              {editingCaptionId === currentMedia.id ? (
                <div style={{display:'flex', gap:'8px', justifyContent:'center'}}>
                  <input type="text" value={captionText} onChange={e=>setCaptionText(e.target.value)} style={{flex:1, padding:'6px 10px', borderRadius:'6px', border:'1px solid #ddd', fontSize:'0.9rem'}} autoFocus/>
                  <button onClick={() => saveCaption(currentMedia.id)} style={{background:'var(--text-main)', color:'white', border:'none', borderRadius:'6px', padding:'0 12px', fontWeight:'700'}}><Check size={14}/></button>
                </div>
              ) : (
                <span className="car-cap">
                  {currentMedia.caption}
                  <button onClick={() => startEditCaption(currentMedia)} style={{background:'none', border:'none', color:'#999', cursor:'pointer', padding:'0 6px'}}><Pencil size={12}/></button>
                </span>
              )}
              <span className="car-date">{currentMedia.date}</span>
            </div>
            
            <div className="car-dots">{media.map((_,i) => <span key={i} className={`dot ${i===mediaIndex?'active':''}`} onClick={() => setMediaIndex(i)}/>)}</div>
          </div>
          <button className="car-btn" onClick={() => setMediaIndex(i => Math.min(media.length-1, i+1))} disabled={mediaIndex===media.length-1}><ChevronRight size={18}/></button>
        </div>
      </section>

      {/* Guestbook */}
      <section>
        <div className="sec-hdr" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h2 className="sec-t"><MessageSquare size={16}/> 사진/방명록</h2>
          <button className="viewall-btn" onClick={() => setShowSettings(true)}><Settings2 size={16}/> 구성원</button>
        </div>

        <div className="msg-feed" style={{ maxHeight: '360px', overflowY: 'auto' }}>
          {messages.map(m => (
            <div key={m.id} className="msg-item">
              <div className="msg-head">
                <span className="msg-emoji">{getEmoji(m.author)}</span>
                <span className="msg-who">{m.author}</span>
                <span className="msg-date">{m.date}</span>
                {m.author === currentUser && editingMsgId !== m.id && (
                  <div style={{marginLeft: 'auto', display:'flex', gap:'6px'}}>
                    <button onClick={() => startEditMsg(m)} style={{background: 'none', border:'none', color:'#999', cursor:'pointer'}}>
                      <Pencil size={12}/>
                    </button>
                    <button onClick={() => setMessages(prev => prev.filter(msg => msg.id !== m.id))} style={{background: 'none', border:'none', color:'#ff6b6b', cursor:'pointer'}}>
                      <Trash2 size={12}/>
                    </button>
                  </div>
                )}
              </div>
              <div className="msg-body">
                {editingMsgId === m.id ? (
                  <div style={{display:'flex', gap:'8px', marginTop:'4px'}}>
                    <input type="text" value={editingMsgText} onChange={e => setEditingMsgText(e.target.value)} style={{flex:1, padding:'6px', borderRadius:'8px', border:'1px solid #ddd'}} />
                    <button onClick={() => saveEditMsg(m.id)} style={{background:'var(--text-main)', color:'white', border:'none', borderRadius:'6px', padding:'0 12px', fontWeight:'700'}}><Check size={14}/></button>
                  </div>
                ) : (
                  <div style={{display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>
                    {m.text}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
          <span style={{fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-muted)'}}>현재 작성자:</span>
          <button 
            onClick={() => setShowAuthorSelect(true)}
            style={{
              background: 'var(--text-main)', color: 'white', border: 'none',
              padding: '6px 14px', borderRadius: '16px', fontSize: '0.9rem', fontWeight: '800',
              display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            {getEmoji(currentUser)} {currentUser}
          </button>
        </div>

        <form className="msg-form" onSubmit={handleSend}>
          <input type="text" placeholder={`${currentUser}님, 메모를 남겨주세요...`} value={newMsg} onChange={e => setNewMsg(e.target.value)}/>
          <button type="submit"><Send size={18}/></button>
        </form>
      </section>

      {/* Fullscreen View Modal */}
      {viewingMedia && (
        <div className="modal-overlay" onClick={() => setViewingMedia(null)} style={{zIndex: 9000, background: 'rgba(0,0,0,0.85)'}}>
          <button onClick={() => setViewingMedia(null)} style={{position: 'absolute', top: '20px', right: '20px', background:'rgba(255,255,255,0.2)', border:'none', color:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', width:'40px', height:'40px', borderRadius:'50%'}}>
            <X size={24}/>
          </button>
          <div onClick={e => e.stopPropagation()} style={{display:'flex', width:'100%', height:'100%', alignItems:'center', justifyContent:'center', padding:'20px'}}>
            {viewingMedia.type === 'video' ? (
              <video src={viewingMedia.url} style={{maxWidth:'100%', maxHeight:'90vh', borderRadius:'12px', boxShadow:'0 8px 30px rgba(0,0,0,0.3)'}} controls autoPlay playsInline/>
            ) : (
              <img src={viewingMedia.url} style={{maxWidth:'100%', maxHeight:'90vh', objectFit:'contain', borderRadius:'12px', boxShadow:'0 8px 30px rgba(0,0,0,0.3)'}}/>
            )}
          </div>
        </div>
      )}

      {/* Gallery Modal */}
      {showGallery && (
        <div className="gal-overlay" onClick={() => setShowGallery(false)}>
          <div className="gal-modal" onClick={e => e.stopPropagation()}>
            <div className="gal-head">
              <span>📷 전체 미디어 <span style={{fontSize: '0.8rem', color: '#666'}}>({totalMediaMB} MB)</span></span>
              <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
                {selectedMedia.length > 0 && <button onClick={deleteSelectedMedia} style={{background:'#fff0f0', color:'#ff3b3b', border:'1px solid #ffebeb', borderRadius:'14px', padding:'6px 10px', fontSize:'0.8rem', fontWeight:'900', cursor:'pointer'}}><Trash2 size={12}/> 삭제 ({selectedMedia.length})</button>}
                <button onClick={() => { setIsSelecting(!isSelecting); setSelectedMedia([]); }} style={{background: isSelecting ? 'var(--text-main)' : '#f0f0f0', color: isSelecting ? 'white' : '#333', border:'none', borderRadius:'14px', padding:'6px 12px', fontSize:'0.85rem', fontWeight:'900', cursor:'pointer'}}>{isSelecting ? '취소' : '선택'}</button>
                <button onClick={() => { setShowGallery(false); setIsSelecting(false); setSelectedMedia([]); }} style={{background:'none', border:'none'}}><X size={22}/></button>
              </div>
            </div>
            <div className="gal-grid">
              {media.map((m,i) => {
                const isSelected = selectedMedia.includes(m.id);
                return (
                <div key={m.id} className="gal-thumb" onClick={() => {
                  if (isSelecting) {
                    setSelectedMedia(prev => isSelected ? prev.filter(id => id !== m.id) : [...prev, m.id]);
                  } else {
                    setViewingMedia(m); 
                  }
                }} style={{opacity: isSelecting && !isSelected ? 0.6 : 1, transition:'all 0.2s', position:'relative'}}>
                  {m.type === 'video' ? (
                    <>
                      <img src={m.poster || m.url} alt={m.caption}/>
                      <span className="gal-video-icon"><Play size={20}/></span>
                    </>
                  ) : (
                    <img src={m.url} alt={m.caption}/>
                  )}
                  <div className="gal-info"><span>{m.caption}</span><span className="gal-sm-date">{m.date}</span></div>
                  {isSelecting && (
                    <div style={{position:'absolute', top:'6px', right:'6px', background: isSelected ? 'var(--text-main)' : 'rgba(255,255,255,0.8)', border: isSelected ? 'none' : '2px solid #ddd', width:'24px', height:'24px', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', zIndex: 2}}>
                      {isSelected && <Check size={16} color="white"/>}
                    </div>
                  )}
                </div>
              )})}
              <div className="gal-thumb gal-add" onClick={() => fileInputRef.current?.click()} style={{cursor:'pointer'}}>
                <span>+ 사진 업로드</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Author Select Modal */}
      {showAuthorSelect && (
        <div className="modal-overlay" onClick={() => setShowAuthorSelect(false)} style={{zIndex: 9000}}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{padding: '24px', maxWidth: '340px', margin: 'auto', borderRadius: '24px', height: 'auto', maxHeight: '90vh'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center'}}>
              <h4 style={{margin: 0, fontSize: '1.2rem', fontWeight: '900'}}>작성자 선택</h4>
              <button onClick={() => setShowAuthorSelect(false)} style={{background: '#f0f0f0', border: 'none', cursor: 'pointer', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><X size={18}/></button>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto', paddingBottom: '10px', scrollbarWidth: 'none'}}>
              {authors.map(a => (
                <button
                  key={a}
                  onClick={() => { setCurrentUser(a); setShowAuthorSelect(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px',
                    borderRadius: '20px', border: 'none',
                    background: a === currentUser ? '#f8e8ea' : '#fff',
                    color: a === currentUser ? 'var(--text-main)' : '#333',
                    fontWeight: a === currentUser ? '900' : '700',
                    fontSize: '1.05rem', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s',
                    boxShadow: a === currentUser ? '0 0 0 2px var(--text-main)' : '0 4px 12px rgba(0,0,0,0.03)'
                  }}
                  onPointerDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                  onPointerUp={e => e.currentTarget.style.transform = 'scale(1)'}
                  onPointerLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <span style={{fontSize: '1.5rem'}}>{getEmoji(a)}</span>
                  <span>{a}</span>
                  {a === currentUser && <Check size={18} style={{marginLeft: 'auto'}}/>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showSettings && <MemberSettings onClose={() => setShowSettings(false)} />}
      
      <input type="file" ref={fileInputRef} style={{display:'none'}} accept="image/*,video/*" onChange={handleFileUpload} />
    </div>
  );
};

export default FamilyBoard;
