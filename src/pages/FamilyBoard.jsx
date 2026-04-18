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
  
  const [editingMedia, setEditingMedia] = useState(null); // { id, caption, cssFilter }

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

  const saveMediaEdit = () => {
    if (!editingMedia) return;
    setMedia(prev => prev.map(m => m.id === editingMedia.id ? { ...m, caption: editingMedia.caption, cssFilter: editingMedia.cssFilter } : m));
    setEditingMedia(null);
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
            <div className="car-media-wrap">
              <MediaItem item={currentMedia} className="car-img" />
              {currentMedia.type === 'video' && <span className="video-badge"><Play size={12}/> 동영상</span>}
            </div>
            <div className="car-meta">
              <span className="car-cap">{currentMedia.caption}</span>
              <span className="car-date">{currentMedia.date}</span>
            </div>
            
            <div style={{display:'flex', gap:'10px', justifyContent:'center', marginTop:'12px'}}>
              <button 
                onClick={() => setEditingMedia({ ...currentMedia })}
                style={{display:'flex', alignItems:'center', gap:'4px', background:'#f0f4f8', color:'#333', border:'none', padding:'6px 12px', borderRadius:'14px', fontSize:'0.85rem', fontWeight:'700', cursor:'pointer'}}
              >
                <Palette size={14}/> 꾸미기
              </button>
              <button 
                onClick={() => deleteMedia(currentMedia.id)}
                style={{display:'flex', alignItems:'center', gap:'4px', background:'#fff0f0', color:'#ff3b3b', border:'none', padding:'6px 12px', borderRadius:'14px', fontSize:'0.85rem', fontWeight:'700', cursor:'pointer'}}
              >
                <Trash2 size={14}/> 삭제
              </button>
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
                ) : m.text}
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

      {/* Media Edit/Decorate Modal */}
      {editingMedia && (
        <div className="overlay" onClick={() => setEditingMedia(null)} style={{zIndex: 2000}}>
          <div className="sheet" onClick={e => e.stopPropagation()} style={{maxWidth: '480px', margin:'auto'}}>
            <div className="gallery-hdr" style={{padding:'20px 24px', borderBottom:'1px solid #eee', display:'flex', justifyContent:'space-between'}}>
              <div style={{display:'flex', gap:'8px', alignItems:'center', fontWeight:'900'}}><Palette size={20}/> <span>미디어 꾸미기</span></div>
              <button className="icon-btn" onClick={() => setEditingMedia(null)} style={{border:'none', background:'none', cursor:'pointer'}}><X size={24}/></button>
            </div>
            <div style={{padding: '24px', display:'flex', flexDirection:'column', gap:'20px'}}>
              <div style={{textAlign:'center', background:'#f8f9fa', borderRadius:'16px', padding:'12px', maxHeight:'300px', display:'flex', justifyContent:'center'}}>
                {editingMedia.type === 'video' ? (
                  <video src={editingMedia.url} style={{filter: editingMedia.cssFilter || 'none', maxHeight:'260px', borderRadius:'12px'}} autoPlay muted loop/>
                ) : (
                  <img src={editingMedia.url} style={{filter: editingMedia.cssFilter || 'none', maxHeight:'260px', borderRadius:'12px', objectFit:'contain'}}/>
                )}
              </div>
              
              <div>
                <label style={{fontSize:'0.9rem', fontWeight:'900', color:'#444', marginBottom:'10px', display:'block'}}>사진 필터 (꾸미기)</label>
                <div style={{display:'flex', gap:'8px', overflowX:'auto', paddingBottom:'10px', scrollbarWidth:'none'}}>
                  {[{l:'원본',f:'none'}, {l:'화사하게',f:'brightness(1.15) contrast(1.1) saturate(1.2)'}, {l:'흑백',f:'grayscale(100%)'}, {l:'세피아',f:'sepia(80%)'}, {l:'따뜻하게',f:'sepia(30%) saturate(140%)'}].map(opt => (
                    <button 
                      key={opt.l} 
                      onClick={() => setEditingMedia({...editingMedia, cssFilter: opt.f})}
                      style={{
                        padding: '8px 16px', borderRadius: '20px', border: editingMedia.cssFilter === opt.f ? 'none' : '1px solid #ddd', whiteSpace:'nowrap',
                        background: editingMedia.cssFilter === opt.f ? 'var(--text-main)' : 'white',
                        color: editingMedia.cssFilter === opt.f ? 'white' : '#555', fontWeight: '800', cursor:'pointer', transition:'all 0.2s'
                      }}
                    >
                      {opt.l}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{fontSize:'0.9rem', fontWeight:'900', color:'#444', marginBottom:'10px', display:'block'}}>설명글(Caption) 수정</label>
                <input 
                  type="text" 
                  value={editingMedia.caption} 
                  onChange={e => setEditingMedia({...editingMedia, caption: e.target.value})}
                  style={{width:'100%', padding:'14px', borderRadius:'12px', border:'1px solid #ddd', fontSize:'1rem'}}
                />
              </div>

              <button 
                onClick={saveMediaEdit}
                style={{width:'100%', padding:'16px', borderRadius:'16px', background:'var(--text-main)', color:'white', fontWeight:'900', border:'none', fontSize:'1.05rem', marginTop:'10px', cursor:'pointer'}}
              >
                변경사항 저장하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Modal */}
      {showGallery && (
        <div className="gal-overlay" onClick={() => setShowGallery(false)}>
          <div className="gal-modal" onClick={e => e.stopPropagation()}>
            <div className="gal-head">
              <span>📷 전체 미디어 <span style={{fontSize: '0.8rem', color: '#666'}}>({totalMediaMB} MB)</span></span>
              <button onClick={() => setShowGallery(false)}><X size={22}/></button>
            </div>
            <div className="gal-grid">
              {media.map((m,i) => (
                <div key={m.id} className="gal-thumb" onClick={() => {setMediaIndex(i);setShowGallery(false);}}>
                  {m.type === 'video' ? (
                    <>
                      <img src={m.poster || m.url} alt={m.caption}/>
                      <span className="gal-video-icon"><Play size={20}/></span>
                    </>
                  ) : (
                    <img src={m.url} alt={m.caption}/>
                  )}
                  <div className="gal-info"><span>{m.caption}</span><span className="gal-sm-date">{m.date}</span></div>
                </div>
              ))}
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
