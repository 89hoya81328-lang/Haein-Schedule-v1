import React from 'react';
import { NavLink } from 'react-router-dom';
import { Calendar, Image, ShoppingCart, BookHeart } from 'lucide-react';

const Navigation = () => {
  return (
    <nav className="bottom-nav">
      <div className="nav-inner">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Calendar />
          <span>스케쥴</span>
        </NavLink>
        <NavLink to="/board" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Image />
          <span>가족방명록</span>
        </NavLink>
        <NavLink to="/shopping" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <ShoppingCart />
          <span>장바구니</span>
        </NavLink>
        <NavLink to="/readme" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <BookHeart />
          <span>육아가이드</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default Navigation;
