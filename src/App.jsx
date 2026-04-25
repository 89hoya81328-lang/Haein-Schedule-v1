import React, { useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ColorProvider } from './store/ColorContext';
import Navigation from './components/Navigation';

// Pages
import Scheduler from './pages/Scheduler';
import FamilyBoard from './pages/FamilyBoard';
import ShoppingList from './pages/ShoppingList';
import HaeinReadme from './pages/HaeinReadme';

const ROUTES_ORDER = ['/', '/board', '/shopping', '/readme'];

const SwipeableMain = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  const handleTouchStart = (e) => {
    // ignore if it's a multi-touch
    if (e.touches.length > 1) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const dx = touchEndX - touchStartX.current;
    const dy = touchEndY - touchStartY.current;
    
    // Only trigger swipe if horizontal movement is significant and larger than vertical
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 2) {
      const currentIndex = ROUTES_ORDER.indexOf(location.pathname);
      if (currentIndex !== -1) {
        if (dx < 0 && currentIndex < ROUTES_ORDER.length - 1) {
          // Swipe Left -> Next Page
          navigate(ROUTES_ORDER[currentIndex + 1]);
        } else if (dx > 0 && currentIndex > 0) {
          // Swipe Right -> Prev Page
          navigate(ROUTES_ORDER[currentIndex - 1]);
        }
      }
    }
    
    touchStartX.current = null;
    touchStartY.current = null;
  };

  return (
    <main 
      className="app-main"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </main>
  );
};

const AppContent = () => (
  <div className="app-container">
    <header className="app-header">
      <h1 className="app-title">해인이 등하원 시간표</h1>
    </header>
    
    <SwipeableMain>
      <Routes>
        <Route path="/" element={<Scheduler />} />
        <Route path="/board" element={<FamilyBoard />} />
        <Route path="/shopping" element={<ShoppingList />} />
        <Route path="/readme" element={<HaeinReadme />} />
      </Routes>
    </SwipeableMain>
    
    <Navigation />
  </div>
);

function App() {
  return (
    <ColorProvider>
      <Router>
        <AppContent />
      </Router>
    </ColorProvider>
  );
}

export default App;
