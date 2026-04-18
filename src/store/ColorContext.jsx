import React, { createContext, useState, useContext } from 'react';

const ColorContext = createContext();

export const ColorProvider = ({ children }) => {
  // Default elegant pastel colors
  const [caretakerColors, setCaretakerColors] = useState({
    아빠: '#b5c0d0', // pastel blue-grey
    엄마: '#ffcfdf', // pastel pink
    할머니: '#d5ebd1', // pastel green
  });

  const updateColor = (name, color) => {
    setCaretakerColors(prev => ({
      ...prev,
      [name]: color
    }));
  };

  const addCaretaker = (name) => {
    if (!name.trim()) return;
    setCaretakerColors(prev => ({
      ...prev,
      [name]: '#f0f0f0'
    }));
  };

  return (
    <ColorContext.Provider value={{ caretakerColors, updateColor, addCaretaker }}>
      {children}
    </ColorContext.Provider>
  );
};

export const useColors = () => useContext(ColorContext);
