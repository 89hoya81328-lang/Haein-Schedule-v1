import React, { createContext, useState, useContext } from 'react';

const ColorContext = createContext();

export const ColorProvider = ({ children }) => {
  // Default elegant pastel colors
  const [caretakerColors, setCaretakerColors] = useState({
    아빠: '#b5c0d0', // pastel blue-grey
    엄마: '#ffcfdf', // pastel pink
    할머니: '#d5ebd1', // pastel green
  });

  const [caretakerEmojis, setCaretakerEmojis] = useState({
    아빠: '⭐',
    엄마: '🌸',
    할머니: '🍀',
  });

  const updateColor = (name, color) => {
    setCaretakerColors(prev => ({
      ...prev,
      [name]: color
    }));
  };

  const updateEmoji = (name, emoji) => {
    setCaretakerEmojis(prev => ({
      ...prev,
      [name]: emoji
    }));
  };

  const addCaretaker = (name) => {
    if (!name.trim()) return;
    setCaretakerColors(prev => ({
      ...prev,
      [name]: '#f0f0f0'
    }));
    setCaretakerEmojis(prev => ({
      ...prev,
      [name]: '💬'
    }));
  };

  const removeCaretaker = (name) => {
    setCaretakerColors(prev => {
      const next = {...prev};
      delete next[name];
      return next;
    });
    setCaretakerEmojis(prev => {
      const next = {...prev};
      delete next[name];
      return next;
    });
  };

  const renameCaretaker = (oldName, newName) => {
    if (!newName.trim() || oldName === newName) return;
    setCaretakerColors(prev => {
      const next = {...prev};
      next[newName] = next[oldName];
      delete next[oldName];
      return next;
    });
    setCaretakerEmojis(prev => {
      const next = {...prev};
      next[newName] = next[oldName];
      delete next[oldName];
      return next;
    });
  };

  return (
    <ColorContext.Provider value={{ caretakerColors, caretakerEmojis, updateColor, updateEmoji, addCaretaker, removeCaretaker, renameCaretaker }}>
      {children}
    </ColorContext.Provider>
  );
};

export const useColors = () => useContext(ColorContext);
