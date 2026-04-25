import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase, fetchSettings, upsertSettings } from '../lib/supabase';

const ColorContext = createContext();

export const ColorProvider = ({ children }) => {
  const [colors, setColors] = useState({ 아빠: '#b5c0d0', 엄마: '#ffcfdf', 할머니: '#d5ebd1' });
  const [emojis, setEmojis] = useState({ 아빠: '⭐', 엄마: '🌸', 할머니: '🍀' });
  const [order, setOrder] = useState(['아빠', '엄마', '할머니']);
  const [loaded, setLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState(localStorage.getItem('haein_current_user') || null);

  useEffect(() => {
    const loadSettings = async () => {
      const [c, e, o] = await Promise.all([
        fetchSettings('memberColors'),
        fetchSettings('memberEmojis'),
        fetchSettings('memberOrder')
      ]);
      if (c) setColors(c);
      if (e) setEmojis(e);
      if (o && Array.isArray(o)) {
        setOrder(o);
      } else if (c) {
        setOrder(Object.keys(c)); // Fallback
      }
      setLoaded(true);
    };

    loadSettings();

    const channel = supabase.channel('realtime_settings_colors')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_settings' }, () => {
        loadSettings();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const saveSettings = async (key, val) => {
    await upsertSettings(key, val);
  };

  const handleSetCurrentUser = (name) => {
    setCurrentUser(name);
    localStorage.setItem('haein_current_user', name);
  };

  const resetCurrentUser = () => {
    setCurrentUser(null);
    localStorage.removeItem('haein_current_user');
  };

  const getContextValue = () => {
    // Sync order with colors if new ones exist
    const currentKeys = Object.keys(colors);
    let validOrder = order.filter(k => currentKeys.includes(k));
    currentKeys.forEach(k => { if (!validOrder.includes(k)) validOrder.push(k); });

    // 현재 사용자를 맨 앞으로 끌어올린 배열 생성
    let baseAuthors = [...validOrder];
    if (currentUser && baseAuthors.includes(currentUser)) {
      baseAuthors = [currentUser, ...baseAuthors.filter(a => a !== currentUser)];
    }

    return {
      caretakerColors: colors,
      caretakerEmojis: emojis,
      authors: baseAuthors,
      currentUser,
      setCurrentUser: handleSetCurrentUser,
      resetCurrentUser,
      updateColor: (name, color) => {
        setColors(prev => { const n = {...prev, [name]: color}; saveSettings('memberColors', n); return n; });
      },
      updateEmoji: (name, emoji) => {
        setEmojis(prev => { const n = {...prev, [name]: emoji}; saveSettings('memberEmojis', n); return n; });
      },
      addCaretaker: (name) => {
        if (!colors[name]) {
          setColors(prev => { const n = {...prev, [name]: '#e0e0e0'}; saveSettings('memberColors', n); return n; });
          setEmojis(prev => { const n = {...prev, [name]: '👤'}; saveSettings('memberEmojis', n); return n; });
          setOrder(prev => { const o = [...prev, name]; saveSettings('memberOrder', o); return o; });
        }
      },
      removeCaretaker: (name) => {
        setColors(prev => { const n = {...prev}; delete n[name]; saveSettings('memberColors', n); return n; });
        setEmojis(prev => { const n = {...prev}; delete n[name]; saveSettings('memberEmojis', n); return n; });
        setOrder(prev => { const o = prev.filter(k => k !== name); saveSettings('memberOrder', o); return o; });
      },
      renameCaretaker: (oldName, newName) => {
        setColors(prev => {
          const n = {...prev}; n[newName] = n[oldName]; delete n[oldName];
          saveSettings('memberColors', n); return n;
        });
        setEmojis(prev => {
          const n = {...prev}; n[newName] = n[oldName]; delete n[oldName];
          saveSettings('memberEmojis', n); return n;
        });
        setOrder(prev => {
          const o = prev.map(k => k === oldName ? newName : k);
          saveSettings('memberOrder', o); return o;
        });
        if (currentUser === oldName) handleSetCurrentUser(newName);
      },
      reorderCaretakers: (sourceIndex, destIndex) => {
        setOrder(prev => {
          const next = [...prev];
          const [moved] = next.splice(sourceIndex, 1);
          next.splice(destIndex, 0, moved);
          saveSettings('memberOrder', next);
          return next;
        });
      }
    };
  };

  const currentKeys = Object.keys(colors);
  let allAuthors = order.filter(k => currentKeys.includes(k));
  currentKeys.forEach(k => { if (!allAuthors.includes(k)) allAuthors.push(k); });

  const needsProfileSelect = loaded && allAuthors.length > 0 && (!currentUser || !allAuthors.includes(currentUser));
  const isProfileChanged = currentUser && !allAuthors.includes(currentUser);

  // Circle Layout Math
  const CIRCLE_RADIUS = 110;

  return (
    <ColorContext.Provider value={getContextValue}>
      {children}
      
      {/* 본인 인증 (최초 1회 접속 또는 프로필 삭제/변경 시) */}
      {needsProfileSelect && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', zIndex: 99999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: 'white', padding: '40px 20px', borderRadius: '24px',
            width: '100%', maxWidth: '380px', textAlign: 'center',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)', position: 'relative'
          }}>
            <div style={{fontSize: '3rem', marginBottom: '10px'}}>👋</div>
            <h2 style={{margin: '0 0 10px', fontSize: '1.4rem'}}>
              {isProfileChanged ? '프로필이 변경되었습니다' : '환영합니다!'}
            </h2>
            <p style={{color: '#666', margin: '0 0 40px', fontSize: '0.95rem', lineHeight: 1.5}}>
              {isProfileChanged ? (
                <>기존에 선택하셨던 역할 이름이 수정되거나 삭제되었습니다.<br/><b>다시 본인의 역할을 선택해 주세요.</b></>
              ) : (
                <>원활한 가족 소통을 위해<br/><b>본인의 프로필</b>을 먼저 선택해 주세요.</>
              )}
            </p>
            
            <div style={{
              position: 'relative', width: `${CIRCLE_RADIUS*2 + 80}px`, height: `${CIRCLE_RADIUS*2 + 80}px`, 
              margin: '0 auto'
            }}>
              {allAuthors.map((author, i) => {
                const angle = (i * 360) / allAuthors.length;
                const rad = angle * Math.PI / 180;
                const x = Math.sin(rad) * CIRCLE_RADIUS;
                const y = -Math.cos(rad) * CIRCLE_RADIUS;
                
                return (
                  <button
                    key={author}
                    onClick={() => handleSetCurrentUser(author)}
                    style={{
                      position: 'absolute', top: '50%', left: '50%',
                      transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                      width: '76px', height: '76px', borderRadius: '50%', border: 'none',
                      background: colors[author] || '#f8f9fa',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                      transition: 'transform 0.2s', padding: '0'
                    }}
                    onPointerDown={e => e.currentTarget.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(0.9)`}
                    onPointerUp={e => e.currentTarget.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(1)`}
                    onPointerLeave={e => e.currentTarget.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(1)`}
                  >
                    <span style={{fontSize: '1.8rem', marginBottom: '2px'}}>{emojis[author]}</span>
                    <span style={{fontSize: '0.75rem', fontWeight: 'bold', color: '#333', background: 'rgba(255,255,255,0.7)', padding: '2px 6px', borderRadius: '10px'}}>{author}</span>
                  </button>
                );
              })}
              
              <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                color: '#aaa', fontSize: '0.85rem', textAlign: 'center', width: '100px'
              }}>
                동등한 우리 가족<br/>둥글게 둥글게!
              </div>
            </div>
          </div>
        </div>
      )}
            
    </ColorContext.Provider>
  );
};

export const useColors = () => {
  const factory = useContext(ColorContext);
  return factory();
};
