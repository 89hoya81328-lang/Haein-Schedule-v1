import React, { useState } from 'react';
import { Send, Heart, Grid, MessageSquare, X, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Play } from 'lucide-react';
import './FamilyBoard.css';

const AUTHOR_EMOJI = { '엄마': '🌸', '아빠': '⭐', '할머니': '🍀', '엄마(나)': '🌸' };
const getEmoji = (a) => AUTHOR_EMOJI[a] || '💬';

// type: 'photo' or 'video'
const MOCK_MEDIA = [
  { id: 1, type: 'photo', url: 'https://images.unsplash.com/photo-1543335785-84f728fa58fa?auto=format&fit=crop&w=600&q=80', caption: '주말 동물원 나들이', date: '26.04.13' },
  { id: 2, type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', poster: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=600&q=80', caption: '어린이집에서 노는 모습 🎬', date: '26.04.11' },
  { id: 3, type: 'photo', url: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=600&q=80', caption: '할머니랑 산책', date: '26.04.08' },
  { id: 4, type: 'video', url: 'https://www.w3schools.com/html/movie.mp4', poster: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=600&q=80', caption: '집에서 춤추는 영상 🎬', date: '26.04.05' },
  { id: 5, type: 'photo', url: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=600&q=80', caption: '어린이집 첫 등원!', date: '26.04.01' },
];

const MOCK_MESSAGES = [
  { id: 1, author: '아빠', text: '오늘 하원할 때 미술 작품 가져왔어. 냉장고에 붙여놨다!', date: '26.04.15 18:20' },
  { id: 2, author: '엄마', text: '내일 등원 10분 일찍 해야 해! 사진 찍는 날이래.', date: '26.04.15 13:00' },
  { id: 3, author: '할머니', text: '할미가 좋아하는 반찬 해놨다. 아빠 퇴근길에 가져가렴~', date: '26.04.14 11:20' },
  { id: 4, author: '엄마', text: '오늘 등원할 때 해인이가 많이 울었어요 ㅠㅠ', date: '26.04.14 08:30' },
  { id: 5, author: '아빠', text: '주말에 비온대. 동물원 말고 키즈카페 알아볼게.', date: '26.04.13 21:00' },
];

const VISIBLE_COUNT = 3;

// Media renderer (photo or video)
const MediaItem = ({ item, className }) => {
  if (item.type === 'video') {
    return (
      <video
        className={className}
        src={item.url}
        poster={item.poster}
        autoPlay
        muted
        loop
        playsInline
      />
    );
  }
  return <img src={item.url} alt={item.caption} className={className} />;
};

const FamilyBoard = () => {
  const [media] = useState(MOCK_MEDIA);
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [newMsg, setNewMsg] = useState('');
  const [mediaIndex, setMediaIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [showOlder, setShowOlder] = useState(false);

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const dateStr = `${now.getFullYear().toString().slice(2)}.${pad(now.getMonth()+1)}.${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    setMessages([{ id: Date.now(), author: '엄마(나)', text: newMsg, date: dateStr }, ...messages]);
    setNewMsg('');
  };

  const currentMedia = media[mediaIndex];
  const recentMessages = messages.slice(0, VISIBLE_COUNT);
  const olderMessages = messages.slice(VISIBLE_COUNT);

  return (
    <div className="board-container page-transition">
      {/* Gallery */}
      <section>
        <div className="sec-hdr">
          <h2 className="sec-t"><Heart size={16} color="#ff8fa3"/> 해인이 갤러리</h2>
          <button className="viewall-btn" onClick={() => setShowGallery(true)}><Grid size={16}/> 전체보기</button>
        </div>
        <div className="photo-carousel">
          <button className="car-btn" onClick={() => setMediaIndex(i => Math.max(0, i-1))} disabled={mediaIndex===0}><ChevronLeft size={18}/></button>
          <div className="car-body">
            <div className="car-media-wrap">
              <MediaItem item={currentMedia} className="car-img" />
              {currentMedia.type === 'video' && <span className="video-badge"><Play size={12}/> 동영상</span>}
            </div>
            <div className="car-meta"><span className="car-cap">{currentMedia.caption}</span><span className="car-date">{currentMedia.date}</span></div>
            <div className="car-dots">{media.map((_,i) => <span key={i} className={`dot ${i===mediaIndex?'active':''}`} onClick={() => setMediaIndex(i)}/>)}</div>
          </div>
          <button className="car-btn" onClick={() => setMediaIndex(i => Math.min(media.length-1, i+1))} disabled={mediaIndex===media.length-1}><ChevronRight size={18}/></button>
        </div>
      </section>

      {/* Guestbook */}
      <section>
        <div className="sec-hdr">
          <h2 className="sec-t"><MessageSquare size={16}/> 가족 방명록</h2>
        </div>

        <div className="msg-feed">
          {recentMessages.map(m => (
            <div key={m.id} className="msg-item">
              <div className="msg-head"><span className="msg-emoji">{getEmoji(m.author)}</span><span className="msg-who">{m.author}</span><span className="msg-date">{m.date}</span></div>
              <div className="msg-body">{m.text}</div>
            </div>
          ))}

          {olderMessages.length > 0 && (
            <button className="older-btn" onClick={() => setShowOlder(!showOlder)}>
              {showOlder ? <><ChevronUp size={14}/> 접기</> : <><ChevronDown size={14}/> 이전 메시지 {olderMessages.length}개 더 보기</>}
            </button>
          )}

          {showOlder && olderMessages.map(m => (
            <div key={m.id} className="msg-item older">
              <div className="msg-head"><span className="msg-emoji">{getEmoji(m.author)}</span><span className="msg-who">{m.author}</span><span className="msg-date">{m.date}</span></div>
              <div className="msg-body">{m.text}</div>
            </div>
          ))}
        </div>

        <form className="msg-form" onSubmit={handleSend}>
          <input type="text" placeholder="메모를 남겨주세요..." value={newMsg} onChange={e => setNewMsg(e.target.value)}/>
          <button type="submit"><Send size={18}/></button>
        </form>
      </section>

      {/* Gallery Modal */}
      {showGallery && (
        <div className="gal-overlay" onClick={() => setShowGallery(false)}>
          <div className="gal-modal" onClick={e => e.stopPropagation()}>
            <div className="gal-head"><span>📷 전체 미디어</span><button onClick={() => setShowGallery(false)}><X size={22}/></button></div>
            <div className="gal-grid">
              {media.map((m,i) => (
                <div key={m.id} className="gal-thumb" onClick={() => {setMediaIndex(i);setShowGallery(false);}}>
                  {m.type === 'video' ? (
                    <>
                      <img src={m.poster} alt={m.caption}/>
                      <span className="gal-video-icon"><Play size={20}/></span>
                    </>
                  ) : (
                    <img src={m.url} alt={m.caption}/>
                  )}
                  <div className="gal-info"><span>{m.caption}</span><span className="gal-sm-date">{m.date}</span></div>
                </div>
              ))}
              <div className="gal-thumb gal-add"><span>+ 추가</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyBoard;
