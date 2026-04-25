import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase, fetchSettings, upsertSettings } from '../lib/supabase';

const ColorContext = createContext();

export const ColorProvider = ({ children }) => {
  const [boardColors, setBoardColors] = useState({ 아빠: '#b5c0d0', 엄마: '#ffcfdf', 할머니: '#d5ebd1' });
  const [boardEmojis, setBoardEmojis] = useState({ 아빠: '⭐', 엄마: '🌸', 할머니: '🍀' });
  const [schedColors, setSchedColors] = useState({ 아빠: '#b5c0d0', 엄마: '#ffcfdf', 할머니: '#d5ebd1' });
  const [schedEmojis, setSchedEmojis] = useState({ 아빠: '⭐', 엄마: '🌸', 할머니: '🍀' });
  const [loaded, setLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState(localStorage.getItem('haein_current_user') || null);

  useEffect(() => {
    const loadSettings = async () => {
      const [bc, be, sc, se] = await Promise.all([
        fetchSettings('boardColors'),
        fetchSettings('boardEmojis'),
        fetchSettings('schedColors'),
        fetchSettings('schedEmojis')
      ]);
      if (bc) setBoardColors(bc);
      if (be) setBoardEmojis(be);
      if (sc) setSchedColors(sc);
      if (se) setSchedEmojis(se);
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

  const getContextValue = (type) => {
    const isSched = type === 'schedule';
    const setColors = isSched ? setSchedColors : setBoardColors;
    const setEmojis = isSched ? setSchedEmojis : setBoardEmojis;
    const colors = isSched ? schedColors : boardColors;
    const emojis = isSched ? schedEmojis : boardEmojis;
    const keyPrefix = isSched ? 'sched' : 'board';

    // 현재 사용자를 맨 앞으로 끌어올린 배열 생성
    let baseAuthors = Object.keys(emojis);
    if (currentUser && baseAuthors.includes(currentUser)) {
      baseAuthors = [currentUser, ...baseAuthors.filter(a => a !== currentUser)];
    }

    return {
      caretakerColors: colors,
      caretakerEmojis: emojis,
      authors: baseAuthors,
      currentUser,
      setCurrentUser: handleSetCurrentUser,
      updateColor: (name, color) => {
        setColors(prev => { const n = {...prev, [name]: color}; saveSettings(`${keyPrefix}Colors`, n); return n; });
      },
      updateEmoji: (name, emoji) => {
        setEmojis(prev => { const n = {...prev, [name]: emoji}; saveSettings(`${keyPrefix}Emojis`, n); return n; });
      },
      addCaretaker: (name) => {
        if (!name.trim()) return;
        setColors(prev => { const n = {...prev, [name]: '#f0f0f0'}; saveSettings(`${keyPrefix}Colors`, n); return n; });
        setEmojis(prev => { const n = {...prev, [name]: '💬'}; saveSettings(`${keyPrefix}Emojis`, n); return n; });
      },
      removeCaretaker: (name) => {
        setColors(prev => { const n = {...prev}; delete n[name]; saveSettings(`${keyPrefix}Colors`, n); return n; });
        setEmojis(prev => { const n = {...prev}; delete n[name]; saveSettings(`${keyPrefix}Emojis`, n); return n; });
      },
      renameCaretaker: (oldName, newName) => {
        if (!newName.trim() || oldName === newName) return;
        setColors(prev => { const n = {...prev}; n[newName] = n[oldName]; delete n[oldName]; saveSettings(`${keyPrefix}Colors`, n); return n; });
        setEmojis(prev => { const n = {...prev}; n[newName] = n[oldName]; delete n[oldName]; saveSettings(`${keyPrefix}Emojis`, n); return n; });
      },
      reorderCaretakers: (sourceIndex, destIndex) => {
        setColors(prev => {
          const keys = Object.keys(prev);
          const [moved] = keys.splice(sourceIndex, 1);
          keys.splice(destIndex, 0, moved);
          const next = {}; keys.forEach(k => next[k] = prev[k]);
          saveSettings(`${keyPrefix}Colors`, next);
          return next;
        });
        setEmojis(prev => {
          const keys = Object.keys(prev);
          const [moved] = keys.splice(sourceIndex, 1);
          keys.splice(destIndex, 0, moved);
          const next = {}; keys.forEach(k => next[k] = prev[k]);
          saveSettings(`${keyPrefix}Emojis`, next);
          return next;
        });
      }
    };
  };

  const allAuthors = Object.keys(boardEmojis);

  return (
    <ColorContext.Provider value={getContextValue}>
      {children}
      
      {/* 본인 인증 (최초 1회 접속 시) */}
      {!currentUser && loaded && allAuthors.length > 0 && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', zIndex: 99999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: 'white', padding: '30px', borderRadius: '24px',
            width: '100%', maxWidth: '360px', textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            <div style={{fontSize: '3rem', marginBottom: '10px'}}>👋</div>
            <h2 style={{margin: '0 0 10px', fontSize: '1.4rem'}}>환영합니다!</h2>
            <p style={{color: '#666', margin: '0 0 24px', fontSize: '0.95rem', lineHeight: 1.5}}>
              원활한 가족 소통을 위해<br/><b>본인의 프로필</b>을 먼저 선택해 주세요.<br/>
              <span style={{fontSize: '0.8rem', color: '#999'}}>(이후 내 이름이 항상 맨 위에 고정됩니다)</span>
            </p>
            
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
              {allAuthors.map(author => (
                <button
                  key={author}
                  onClick={() => handleSetCurrentUser(author)}
                  style={{
                    padding: '16px', borderRadius: '16px', border: '1px solid #eee',
                    background: '#f8f9fa', fontSize: '1.1rem', fontWeight: 'bold',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px',
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{fontSize: '1.5rem'}}>{boardEmojis[author]}</span>
                  <span>{author}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </ColorContext.Provider>
  );
};

export const useColors = (type = 'board') => {
  const factory = useContext(ColorContext);
  return factory(type);
};
