import React, { useState } from 'react';
import { Apple, Baby, Plus, Trash2, X, Rocket } from 'lucide-react';
import './ShoppingList.css';

const AddItemModal = ({ isOpen, onClose, onAdd, title }) => {
  const [val, setVal] = useState('');
  const [isCoupang, setIsCoupang] = useState(false);
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!val.trim()) return;
    onAdd(val.trim(), isCoupang);
    setVal('');
    setIsCoupang(false);
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
          <label className="coupang-check-label">
            <input type="checkbox" checked={isCoupang} onChange={e => setIsCoupang(e.target.checked)} />
            <span className="coupang-check-icon">🚀</span>
            쿠팡 로켓배송 항목
          </label>
          <button type="submit" className="modal-submit-btn">추가하기</button>
        </form>
      </div>
    </div>
  );
};

const ShoppingList = () => {
  const [groceries, setGroceries] = useState([
    { id: 1, text: '우유 2팩', checked: false, isCoupang: false },
    { id: 2, text: '바나나 1송이', checked: true, isCoupang: false },
    { id: 3, text: '아기 김', checked: false, isCoupang: true },
    { id: 4, text: '두부', checked: false, isCoupang: false },
  ]);

  const [supplies, setSupplies] = useState([
    { id: 10, text: '기저귀 (특대형)', checked: false, isCoupang: true },
    { id: 11, text: '물티슈', checked: true, isCoupang: true },
    { id: 12, text: '아기 로션', checked: false, isCoupang: false },
  ]);

  const [activeTab, setActiveTab] = useState('g');
  const [modalOpen, setModalOpen] = useState(null);

  const toggle = (id, type) => {
    const s = type === 'g' ? setGroceries : setSupplies;
    s(l => l.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
  };

  const clear = (type) => {
    const s = type === 'g' ? setGroceries : setSupplies;
    s(l => l.filter(i => !i.checked));
  };

  const toggleCoupang = (id, type) => {
    const s = type === 'g' ? setGroceries : setSupplies;
    s(l => l.map(i => i.id === id ? { ...i, isCoupang: !i.isCoupang } : i));
  };

  const addItem = (text, isCoupang) => {
    if (modalOpen === 'g') {
      setGroceries(prev => [...prev, { id: Date.now(), text, checked: false, isCoupang }]);
    } else {
      setSupplies(prev => [...prev, { id: Date.now(), text, checked: false, isCoupang }]);
    }
  };

  const currentItems = activeTab === 'g' ? groceries : supplies;
  const currentSetter = activeTab === 'g' ? setGroceries : setSupplies;
  const checkedCount = currentItems.filter(i => i.checked).length;
  const totalCount = currentItems.length;

  /* Desktop two-column card */
  const Col = ({ items, type, icon, title, color }) => {
    const cc = items.filter(i => i.checked).length;
    return (
      <div className="shop-col" style={{ backgroundColor: color }}>
        <div className="col-top">
          <h2 className="col-title">{icon} {title}</h2>
          <span className="col-counter">{items.filter(i=>!i.checked).length}개 남음</span>
        </div>

        <div className="col-list">
          {items.map(item => (
            <div key={item.id} className={`shop-item ${item.checked ? 'done' : ''}`} onClick={() => toggle(item.id, type)}>
              <div className={`chk ${item.checked ? 'chk-on' : ''}`}/>
              <span className="item-text">{item.text}</span>
              {item.isCoupang && (
                <span className="rocket-badge" onClick={(e) => { e.stopPropagation(); toggleCoupang(item.id, type); }}>
                  🚀
                </span>
              )}
              {!item.isCoupang && (
                <button 
                  className="rocket-toggle-off"
                  onClick={(e) => { e.stopPropagation(); toggleCoupang(item.id, type); }}
                >
                  🚀
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="col-actions">
          <button className="col-action-btn add-action" onClick={() => setModalOpen(type)}>
            <Plus size={16}/> 추가
          </button>
          {cc > 0 && (
            <button className="col-action-btn del-action" onClick={() => clear(type)}>
              <Trash2 size={14}/> 완료 삭제 ({cc})
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="shopping-container page-transition">
      {/* ===== MOBILE LAYOUT ===== */}
      <div className="shop-mobile">
        {/* Tab Switcher */}
        <div className="shop-tabs">
          <button 
            className={`shop-tab ${activeTab === 'g' ? 'tab-active' : ''}`} 
            onClick={() => setActiveTab('g')}
          >
            <Apple size={16}/> 식자재
            <span className="tab-count">{groceries.filter(i=>!i.checked).length}</span>
          </button>
          <button 
            className={`shop-tab ${activeTab === 's' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('s')}
          >
            <Baby size={16}/> 육아 용품
            <span className="tab-count">{supplies.filter(i=>!i.checked).length}</span>
          </button>
        </div>

        {/* Item List */}
        <div className="shop-mobile-list">
          {currentItems.length === 0 && (
            <div className="empty-state">
              <span className="empty-icon">{activeTab === 'g' ? '🥬' : '🍼'}</span>
              <p>항목이 없어요</p>
            </div>
          )}
          {currentItems.map(item => (
            <div key={item.id} className={`shop-item-mobile ${item.checked ? 'done' : ''}`} onClick={() => toggle(item.id, activeTab)}>
              <div className={`chk ${item.checked ? 'chk-on' : ''}`}/>
              <span className="item-text">{item.text}</span>
              {item.isCoupang && (
                <span className="rocket-badge" onClick={(e) => { e.stopPropagation(); toggleCoupang(item.id, activeTab); }}>
                  🚀
                </span>
              )}
              {!item.isCoupang && (
                <button 
                  className="rocket-toggle-off"
                  onClick={(e) => { e.stopPropagation(); toggleCoupang(item.id, activeTab); }}
                >
                  🚀
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Bottom action bar */}
        <div className="mobile-action-bar">
          {checkedCount > 0 && (
            <button className="mobile-action-btn delete-btn" onClick={() => clear(activeTab)}>
              <Trash2 size={16}/> 완료 삭제 <span className="action-count">{checkedCount}</span>
            </button>
          )}
          <button className="mobile-action-btn add-btn" onClick={() => setModalOpen(activeTab)}>
            <Plus size={18}/> 추가
          </button>
        </div>
      </div>

      {/* ===== DESKTOP LAYOUT ===== */}
      <div className="shop-desktop">
        <div className="shop-grid">
          <Col items={groceries} type="g" icon={<Apple size={18}/>} title="식자재" color="#f0f9f1"/>
          <Col items={supplies} type="s" icon={<Baby size={18}/>} title="육아 용품" color="#fef0f5"/>
        </div>
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
