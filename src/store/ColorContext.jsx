import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase, fetchSettings, upsertSettings } from '../lib/supabase';

const ColorContext = createContext();

export const ColorProvider = ({ children }) => {
  const [boardColors, setBoardColors] = useState({ 아빠: '#b5c0d0', 엄마: '#ffcfdf', 할머니: '#d5ebd1' });
  const [boardEmojis, setBoardEmojis] = useState({ 아빠: '⭐', 엄마: '🌸', 할머니: '🍀' });
  const [schedColors, setSchedColors] = useState({ 아빠: '#b5c0d0', 엄마: '#ffcfdf', 할머니: '#d5ebd1' });
  const [schedEmojis, setSchedEmojis] = useState({ 아빠: '⭐', 엄마: '🌸', 할머니: '🍀' });
  const [loaded, setLoaded] = useState(false);

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

  const getContextValue = (type) => {
    const isSched = type === 'schedule';
    const setColors = isSched ? setSchedColors : setBoardColors;
    const setEmojis = isSched ? setSchedEmojis : setBoardEmojis;
    const colors = isSched ? schedColors : boardColors;
    const emojis = isSched ? schedEmojis : boardEmojis;
    const keyPrefix = isSched ? 'sched' : 'board';

    return {
      caretakerColors: colors,
      caretakerEmojis: emojis,
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

  return (
    <ColorContext.Provider value={getContextValue}>
      {children}
    </ColorContext.Provider>
  );
};

export const useColors = (type = 'board') => {
  const factory = useContext(ColorContext);
  return factory(type);
};
