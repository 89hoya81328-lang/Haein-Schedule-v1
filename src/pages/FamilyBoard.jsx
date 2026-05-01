import React, { useState, useEffect, useRef } from 'react';
import { Send, Heart, Grid, MessageSquare, X, ChevronLeft, ChevronRight, Play, Settings2, Upload, Pencil, Trash2, Check, Loader } from 'lucide-react';
import { useColors } from '../store/ColorContext';
import { MemberSettings } from '../components/MemberSettings';
import { supabase, uploadFile, getThumbnailUrl, getOriginalUrl, deleteFiles, fetchMediaList, insertMedia, updateMediaCaption, deleteMediaRows, fetchMessages, insertMessage, updateMessage, deleteMessage } from '../lib/supabase';
import './FamilyBoard.css';

const MediaItem = ({ item, className, useThumbnail = false }) => {
  const src = useThumbnail && item.storage_path ? getThumbnailUrl(item.storage_path, 400) : (item.url || getOriginalUrl(item.storage_path));
  if (item.type === 'video') {
    return <video className={className} src={src} poster={item.poster} style={{ filter: item.cssFilter || 'none' }} autoPlay muted loop playsInline />;
  }
  return <img src={src} alt={item.caption} className={className} style={{ filter: item.cssFilter || 'none' }} loading="lazy" />;
};

const compressImage = (file) => new Promise((resolve) => {
  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      const MAX = 1200;
      let w = img.width, h = img.height;
      if (w > h && w > MAX) { h *= MAX / w; w = MAX; }
      else if (h > MAX) { w *= MAX / h; h = MAX; }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      canvas.toBlob((blob) => resolve(blob), 'image/webp', 0.7);
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

const FamilyBoard = () => {
  const { caretakerColors, caretakerEmojis, authors, currentUser, setCurrentUser } = useColors();
  const [activeTab, setActiveTab] = useState('gallery'); // 'gallery' or 'board'
  const [showSettings, setShowSettings] = useState(false);
  const [showAuthorSelect, setShowAuthorSelect] = useState(false);
  const [media, setMedia] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [msgAuthor, setMsgAuthor] = useState('');
  const [mediaIndex, setMediaIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editingMsgText, setEditingMsgText] = useState('');
  const [viewingMedia, setViewingMedia] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [editingCaptionId, setEditingCaptionId] = useState(null);
  const [captionText, setCaptionText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);
  
  // Touch Handlers for Photo Swipe
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  const handleTouchStart = (e) => {
    if (e.touches.length > 1) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEndFullscreen = (e) => {
    if (touchStartX.current === null || touchStartY.current === null || !viewingMedia) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      const idx = media.findIndex(m => m.id === viewingMedia.id);
      if (idx !== -1) {
        if (dx < 0 && idx < media.length - 1) {
          setViewingMedia(media[idx + 1]);
        } else if (dx > 0 && idx > 0) {
          setViewingMedia(media[idx - 1]);
        }
      }
      e.stopPropagation();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const handleTouchEndCarousel = (e) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0 && mediaIndex < media.length - 1) {
        setMediaIndex(prev => prev + 1);
      } else if (dx > 0 && mediaIndex > 0) {
        setMediaIndex(prev => Math.max(0, prev - 1));
      }
      e.stopPropagation();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };
  const getEmoji = (a) => caretakerEmojis[a] || '💬';

  useEffect(() => {
    if (currentUser && !msgAuthor) {
      setMsgAuthor(currentUser);
    }
  }, [currentUser]);

  useEffect(() => {
    const loadBoardData = async () => {
      setLoading(true);
      const [mediaData, msgData] = await Promise.all([fetchMediaList(), fetchMessages()]);
      setMedia(mediaData || []);
      setMessages(msgData || []);
      setLoading(false);
    };

    loadBoardData();

    const channelMedia = supabase.channel('realtime_media')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'media' }, async () => {
        const mediaData = await fetchMediaList();
        setMedia(mediaData || []);
      })
      .subscribe();

    const channelMessages = supabase.channel('realtime_messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, async () => {
        const msgData = await fetchMessages();
        setMessages(msgData || []);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channelMedia);
      supabase.removeChannel(channelMessages);
    };
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !msgAuthor) return;
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const dateStr = `${now.getFullYear().toString().slice(2)}.${pad(now.getMonth()+1)}.${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const row = { author: msgAuthor, text: newMsg, date: dateStr };
    const saved = await insertMessage(row);
    if (saved) setMessages(prev => [saved, ...prev]);
    setNewMsg('');
  };

  const startEditMsg = (m) => { setEditingMsgId(m.id); setEditingMsgText(m.text); };

  const saveEditMsg = async (id) => {
    if (!editingMsgText.trim()) return;
    const ok = await updateMessage(id, editingMsgText);
    if (ok) setMessages(prev => prev.map(m => m.id === id ? { ...m, text: editingMsgText } : m));
    setEditingMsgId(null);
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm('정말로 삭제하시겠습니까?')) return;
    
    const success = await deleteMessage(id);
    if (success) {
      setMessages(prev => prev.filter(m => m.id !== id));
    }
  };

  const startEditCaption = (m) => { setEditingCaptionId(m.id); setCaptionText(m.caption); };

  const saveCaption = async (id) => {
    if (!captionText.trim()) { setEditingCaptionId(null); return; }
    const ok = await updateMediaCaption(id, captionText.trim());
    if (ok) setMedia(prev => prev.map(m => m.id === id ? { ...m, caption: captionText.trim() } : m));
    setEditingCaptionId(null);
  };

  const deleteSelectedMediaHandler = async () => {
    if (selectedMedia.length === 0) return;
    if (!window.confirm('선택한 사진을 정말로 삭제하시겠습니까?')) return;
    
    const toDelete = media.filter(m => selectedMedia.includes(m.id));
    const paths = toDelete.map(m => m.storage_path).filter(Boolean);
    const ids = toDelete.map(m => m.id);
    if (paths.length) await deleteFiles(paths);
    await deleteMediaRows(ids);
    setMedia(prev => prev.filter(m => !ids.includes(m.id)));
    setSelectedMedia([]);
    setIsSelecting(false);
    setMediaIndex(0);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith('video/');
    if (isVideo && file.size > 50 * 1024 * 1024) { alert('동영상은 최대 50MB까지만 업로드할 수 있습니다.'); return; }

    setUploading(true);
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const dateStr = `${now.getFullYear().toString().slice(2)}.${pad(now.getMonth()+1)}.${pad(now.getDate())}`;
    const ts = Date.now();
    const ext = isVideo ? 'mp4' : 'webp';
    const storagePath = `uploads/${ts}.${ext}`;

    let uploadBlob = file;
    if (!isVideo) uploadBlob = await compressImage(file);

    const publicUrl = await uploadFile(uploadBlob, storagePath);
    if (!publicUrl) { setUploading(false); alert('업로드 실패. 다시 시도해주세요.'); return; }

    const row = { type: isVideo ? 'video' : 'photo', storage_path: storagePath, url: publicUrl, caption: `${currentUser}의 ${isVideo ? '영상' : '사진'}`, date: dateStr, size: uploadBlob.size || file.size };
    const saved = await insertMedia(row);
    if (saved) { setMedia(prev => [saved, ...prev]); setMediaIndex(0); }
    setUploading(false);
    setShowGallery(false);
    e.target.value = '';
  };

  const currentMedia = media[mediaIndex] || null;
  const totalMediaMB = (media.reduce((a, m) => a + (m.size || 0), 0) / (1024 * 1024)).toFixed(1);

  if (loading) return <div className="board-container page-transition" style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh'}}><Loader size={32} className="spin" style={{animation:'spin 1s linear infinite'}}/></div>;

  return (
    <div className="board-container page-transition">
      {/* Gallery */}
      <section>
        <div className="sec-hdr">
          <h2 className="sec-t"><Heart size={16} color="#ff8fa3"/> 해인이 갤러리</h2>
          <div style={{display:'flex', gap:'8px'}}>
            <button className="viewall-btn" onClick={() => fileInputRef.current?.click()} style={{background: 'var(--text-main)', color: 'white'}} disabled={uploading}>{uploading ? <Loader size={14} style={{animation:'spin 1s linear infinite'}}/> : <Upload size={14}/>} {uploading ? '업로드 중...' : '업로드'}</button>
            <button className="viewall-btn" onClick={() => setShowGallery(true)}><Grid size={16}/> 전체보기</button>
          </div>
        </div>
        {media.length > 0 && currentMedia ? (
        <div className="photo-carousel" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEndCarousel}>
          <button className="car-btn" onClick={() => setMediaIndex(i => Math.max(0, i-1))} disabled={mediaIndex===0}><ChevronLeft size={18}/></button>
          <div className="car-body">
            <div className="car-media-wrap" onClick={() => setViewingMedia(currentMedia)} style={{cursor:'pointer', position: 'relative'}}>
              <MediaItem item={currentMedia} className="car-img" useThumbnail />
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
        ) : (
          <div style={{textAlign:'center', padding:'40px 20px', color:'#999'}}>
            <p>📷 아직 사진이 없어요. 업로드 버튼을 눌러 추가하세요!</p>
          </div>
        )}
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
                    <button onClick={() => startEditMsg(m)} style={{background: 'none', border:'none', color:'#999', cursor:'pointer'}}><Pencil size={12}/></button>
                    <button onClick={() => handleDeleteMessage(m.id)} style={{background: 'none', border:'none', color:'#ff6b6b', cursor:'pointer'}}><Trash2 size={12}/></button>
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
                  <div style={{display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>{m.text}</div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
          <span style={{fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-muted)'}}>현재 작성자:</span>
          <button onClick={() => setShowAuthorSelect(true)} style={{background: 'var(--text-main)', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '16px', fontSize: '0.9rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}>
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
        <div className="modal-overlay" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEndFullscreen} onClick={() => setViewingMedia(null)} style={{zIndex: 9000, background: 'rgba(0,0,0,0.85)'}}>
          <button onClick={() => setViewingMedia(null)} style={{position: 'absolute', top: '20px', right: '20px', background:'rgba(255,255,255,0.2)', border:'none', color:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', width:'40px', height:'40px', borderRadius:'50%', zIndex: 9001}}><X size={24}/></button>
          <div onClick={e => e.stopPropagation()} style={{display:'flex', width:'100%', height:'100%', alignItems:'center', justifyContent:'center', padding:'20px'}}>
            {viewingMedia.type === 'video' ? (
              <video src={viewingMedia.url || getOriginalUrl(viewingMedia.storage_path)} style={{maxWidth:'100%', maxHeight:'90vh', borderRadius:'12px', boxShadow:'0 8px 30px rgba(0,0,0,0.3)'}} controls autoPlay playsInline/>
            ) : (
              <img src={viewingMedia.url || getOriginalUrl(viewingMedia.storage_path)} style={{maxWidth:'100%', maxHeight:'90vh', objectFit:'contain', borderRadius:'12px', boxShadow:'0 8px 30px rgba(0,0,0,0.3)'}}/>
            )}
          </div>
        </div>
      )}
      {showGallery && (
        <div className="gal-overlay" onClick={() => setShowGallery(false)}>
          <div className="gal-modal" onClick={e => e.stopPropagation()}>
            <div className="gal-head">
              <span>📷 전체 미디어 <span style={{fontSize: '0.8rem', color: '#666'}}>({totalMediaMB} MB)</span></span>
              <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
                {selectedMedia.length > 0 && <button onClick={deleteSelectedMediaHandler} style={{background:'#fff0f0', color:'#ff3b3b', border:'1px solid #ffebeb', borderRadius:'14px', padding:'6px 10px', fontSize:'0.8rem', fontWeight:'900', cursor:'pointer'}}><Trash2 size={12}/> 삭제 ({selectedMedia.length})</button>}
                <button onClick={() => { setIsSelecting(!isSelecting); setSelectedMedia([]); }} style={{background: isSelecting ? 'var(--text-main)' : '#f0f0f0', color: isSelecting ? 'white' : '#333', border:'none', borderRadius:'14px', padding:'6px 12px', fontSize:'0.85rem', fontWeight:'900', cursor:'pointer'}}>{isSelecting ? '취소' : '선택'}</button>
                <button onClick={() => { setShowGallery(false); setIsSelecting(false); setSelectedMedia([]); }} style={{background:'none', border:'none'}}><X size={22}/></button>
              </div>
            </div>
            <div className="gal-grid">
              {media.map((m) => {
                const isSelected = selectedMedia.includes(m.id);
                const thumbSrc = m.storage_path ? getThumbnailUrl(m.storage_path, 300) : (m.poster || m.url);
                return (
                <div key={m.id} className="gal-thumb" onClick={() => {
                  if (isSelecting) setSelectedMedia(prev => isSelected ? prev.filter(id => id !== m.id) : [...prev, m.id]);
                  else setViewingMedia(m);
                }} style={{opacity: isSelecting && !isSelected ? 0.6 : 1, transition:'all 0.2s', position:'relative'}}>
                  {m.type === 'video' ? (<><img src={thumbSrc} alt={m.caption}/><span className="gal-video-icon"><Play size={20}/></span></>) : (<img src={thumbSrc} alt={m.caption}/>)}
                  <div className="gal-info"><span>{m.caption}</span><span className="gal-sm-date">{m.date}</span></div>
                  {isSelecting && (
                    <div style={{position:'absolute', top:'6px', right:'6px', background: isSelected ? 'var(--text-main)' : 'rgba(255,255,255,0.8)', border: isSelected ? 'none' : '2px solid #ddd', width:'24px', height:'24px', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', zIndex: 2}}>
                      {isSelected && <Check size={16} color="white"/>}
                    </div>
                  )}
                </div>
              )})}
              <div className="gal-thumb gal-add" onClick={() => fileInputRef.current?.click()} style={{cursor:'pointer'}}><span>+ 사진 업로드</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Author Select Modal */}
      {showAuthorSelect && (() => {
        const CIRCLE_RADIUS = 110;
        return (
        <div className="modal-overlay" onClick={() => setShowAuthorSelect(false)} style={{zIndex: 9000}}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{padding: '24px', maxWidth: '380px', margin: 'auto', borderRadius: '24px', height: 'auto', maxHeight: '90vh'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center'}}>
              <h4 style={{margin: 0, fontSize: '1.2rem', fontWeight: '900'}}>작성자 선택</h4>
              <button onClick={() => setShowAuthorSelect(false)} style={{background: '#f0f0f0', border: 'none', cursor: 'pointer', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><X size={18}/></button>
            </div>
            <div style={{position: 'relative', width: `${CIRCLE_RADIUS*2 + 80}px`, height: `${CIRCLE_RADIUS*2 + 80}px`, margin: '0 auto'}}>
              {authors.map((a, i) => {
                const angle = (i * 360) / authors.length;
                const rad = angle * Math.PI / 180;
                const x = Math.sin(rad) * CIRCLE_RADIUS;
                const y = -Math.cos(rad) * CIRCLE_RADIUS;
                const isSelected = a === currentUser;
                return (
                  <button
                    key={a}
                    onClick={() => { setCurrentUser(a); setShowAuthorSelect(false); }}
                    style={{
                      position: 'absolute', top: '50%', left: '50%',
                      transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                      width: '76px', height: '76px', borderRadius: '50%', border: isSelected ? '3px solid var(--text-main)' : 'none',
                      background: caretakerColors[a] || '#f8f9fa',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', boxShadow: isSelected ? '0 0 0 3px rgba(0,0,0,0.1)' : '0 4px 10px rgba(0,0,0,0.1)',
                      transition: 'transform 0.2s', padding: '0'
                    }}
                    onPointerDown={e => e.currentTarget.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(0.9)`}
                    onPointerUp={e => e.currentTarget.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(1)`}
                    onPointerLeave={e => e.currentTarget.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(1)`}
                  >
                    <span style={{fontSize: '1.8rem', marginBottom: '2px'}}>{getEmoji(a)}</span>
                    <span style={{fontSize: '0.75rem', fontWeight: 'bold', color: '#333', background: 'rgba(255,255,255,0.7)', padding: '2px 6px', borderRadius: '10px'}}>{a}</span>
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
        </div>
        );
      })()}

      {showSettings && <MemberSettings onClose={() => setShowSettings(false)} />}
      <input type="file" ref={fileInputRef} style={{display:'none'}} accept="image/*,video/*" onChange={handleFileUpload} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default FamilyBoard;
