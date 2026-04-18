import React, { useState } from 'react';
import { Apple, Baby, Plus, Trash2, X } from 'lucide-react';
import './ShoppingList.css';

const AddItemModal = ({ isOpen, onClose, onAdd, title }) => {
  const [val, setVal] = useState('');
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!val.trim()) return;
    onAdd(val.trim());
    setVal('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-title"><span>{title} 추가</span><button onClick={onClose}><X size={20}/></button></div>
        <form className="modal-form" onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="항목 이름을 입력하세요..." 
            value={val} 
            onChange={e => setVal(e.target.value)}
            autoFocus 
          />
          <button type="submit" className="modal-submit-btn">추가하기</button>
        </form>
      </div>
    </div>
  );
};

const ShoppingList = () => {
  const [groceries, setGroceries] = useState([
    { id: 1, text: '우유 2팩', checked: false },
    { id: 2, text: '바나나 1송이', checked: true },
    { id: 3, text: '아기 김', checked: false },
    { id: 4, text: '두부', checked: false },
  ]);

  const [supplies, setSupplies] = useState([
    { id: 10, text: '기저귀 (특대형)', checked: false },
    { id: 11, text: '물티슈', checked: true },
    { id: 12, text: '아기 로션', checked: false },
  ]);

  const [modalOpen, setModalOpen] = useState(null); // 'g' or 's'

  const toggle = (id, type) => {
    const s = type === 'g' ? setGroceries : setSupplies;
    s(l => l.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
  };

  const clear = (type) => {
    const s = type === 'g' ? setGroceries : setSupplies;
    s(l => l.filter(i => !i.checked));
  };

  const addItem = (text) => {
    if (modalOpen === 'g') {
      setGroceries(prev => [...prev, { id: Date.now(), text, checked: false }]);
    } else {
      setSupplies(prev => [...prev, { id: Date.now(), text, checked: false }]);
    }
  };

  const Col = ({ items, type, icon, title, color }) => {
    const cc = items.filter(i => i.checked).length;
    return (
      <div className="shop-col" style={{ backgroundColor: color }}>
        <div className="col-top">
          <h2 className="col-title">{icon} {title}</h2>
          <div className="col-btns">
            <button className="col-icon-btn plus-btn" onClick={() => setModalOpen(type)}><Plus size={16}/></button>
            {cc > 0 && <button className="col-icon-btn del-btn" onClick={() => clear(type)}><Trash2 size={14}/></button>}
          </div>
        </div>

        <div className="col-list">
          {items.map(item => (
            <div key={item.id} className={`shop-item ${item.checked ? 'done' : ''}`} onClick={() => toggle(item.id, type)}>
              <div className={`chk ${item.checked ? 'chk-on' : ''}`}/>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="shopping-container page-transition">
      <div className="shop-grid">
        <Col items={groceries} type="g" icon={<Apple size={16}/>} title="식자재" color="#ebf7ed"/>
        <Col items={supplies} type="s" icon={<Baby size={16}/>} title="육아 용품" color="#fef0f5"/>
      </div>

      <AddItemModal 
        isOpen={!!modalOpen} 
        onClose={() => setModalOpen(null)} 
        onAdd={addItem}
        title={modalOpen === 'g' ? '식자재' : '육아 용품'}
      />
    </div>
  );
};

export default ShoppingList;
