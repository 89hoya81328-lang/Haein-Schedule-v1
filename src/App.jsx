import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ColorProvider } from './store/ColorContext';
import Navigation from './components/Navigation';

// Pages
import Scheduler from './pages/Scheduler';
import FamilyBoard from './pages/FamilyBoard';
import ShoppingList from './pages/ShoppingList';
import HaeinReadme from './pages/HaeinReadme';

function App() {
  return (
    <ColorProvider>
      <Router>
        <div className="app-container">
          <header className="app-header">
            <h1 className="app-title">해인이 등하원 시간표</h1>
          </header>
          
          <main className="app-main">
            <Routes>
              <Route path="/" element={<Scheduler />} />
              <Route path="/board" element={<FamilyBoard />} />
              <Route path="/shopping" element={<ShoppingList />} />
              <Route path="/readme" element={<HaeinReadme />} />
            </Routes>
          </main>
          
          <Navigation />
        </div>
      </Router>
    </ColorProvider>
  );
}

export default App;
