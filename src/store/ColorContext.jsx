import React, { createContext, useState, useContext } from 'react';

const ColorContext = createContext();

export const ColorProvider = ({ children }) => {
  const [boardColors, setBoardColors] = useState({
    아빠: '#b5c0d0', 엄마: '#ffcfdf', 할머니: '#d5ebd1'
  });
  const [boardEmojis, setBoardEmojis] = useState({
    아빠: '⭐', 엄마: '🌸', 할머니: '🍀'
  });

  const [schedColors, setSchedColors] = useState({
    아빠: '#b5c0d0', 엄마: '#ffcfdf', 할머니: '#d5ebd1'
  });
  const [schedEmojis, setSchedEmojis] = useState({
    아빠: '⭐', 엄마: '🌸', 할머니: '🍀'
  });

  const getContextValue = (type) => {
    const isSched = type === 'schedule';
    const setColors = isSched ? setSchedColors : setBoardColors;
    const setEmojis = isSched ? setSchedEmojis : setBoardEmojis;
    const colors = isSched ? schedColors : boardColors;
    const emojis = isSched ? schedEmojis : boardEmojis;

    return {
      caretakerColors: colors,
      caretakerEmojis: emojis,
      updateColor: (name, color) => setColors(prev => ({...prev, [name]: color})),
      updateEmoji: (name, emoji) => setEmojis(prev => ({...prev, [name]: emoji})),
      addCaretaker: (name) => {
        if (!name.trim()) return;
        setColors(prev => ({...prev, [name]: '#f0f0f0'}));
        setEmojis(prev => ({...prev, [name]: '💬'}));
      },
      removeCaretaker: (name) => {
        setColors(prev => { const n = {...prev}; delete n[name]; return n; });
        setEmojis(prev => { const n = {...prev}; delete n[name]; return n; });
      },
      renameCaretaker: (oldName, newName) => {
        if (!newName.trim() || oldName === newName) return;
        setColors(prev => {
          const n = {...prev}; n[newName] = n[oldName]; delete n[oldName]; return n;
        });
        setEmojis(prev => {
          const n = {...prev}; n[newName] = n[oldName]; delete n[oldName]; return n;
        });
      },
      reorderCaretakers: (sourceIndex, destIndex) => {
        setColors(prev => {
          const keys = Object.keys(prev);
          const [moved] = keys.splice(sourceIndex, 1);
          keys.splice(destIndex, 0, moved);
          const next = {}; keys.forEach(k => next[k] = prev[k]); return next;
        });
        setEmojis(prev => {
          const keys = Object.keys(prev);
          const [moved] = keys.splice(sourceIndex, 1);
          keys.splice(destIndex, 0, moved);
          const next = {}; keys.forEach(k => next[k] = prev[k]); return next;
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
