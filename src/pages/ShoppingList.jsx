import React, { useState, useEffect } from 'react';
import { Apple, Baby, Plus, Trash2, X, Rocket, Loader } from 'lucide-react';
import { supabase, fetchShoppingItems, upsertShoppingItem, deleteShoppingItem } from '../lib/supabase';
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
  const [groceries, setGroceries] = useState([]);
  const [supplies, setSupplies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('g');
  const [modalOpen, setModalOpen] = useState(null);

  useEffect(() => {
    const loadItems = async () => {
      setLoading(true);
      const items = await fetchShoppingItems();
      setGroceries(items.filter(i => i.type === 'g'));
      setSupplies(items.filter(i => i.type === 's'));
      setLoading(false);
    };
    
    loadItems();

    const channel = supabase.channel('realtime_shopping_items')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shopping_items' }, async () => {
        // 데이터가 변경되면 최신 데이터를 다시 불러옴
        const items = await fetchShoppingItems();
        setGroceries(items.filter(i => i.type === 'g'));
        setSupplies(items.filter(i => i.type === 's'));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const toggle = async (id, type) => {
    const s = type === 'g' ? setGroceries : setSupplies;
    const list = type === 'g' ? groceries : supplies;
    const item = list.find(i => i.id === id);
    if (!item) return;
    
    // Optimistic UI update
    s(l => l.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
    
    await upsertShoppingItem({ id, checked: !item.checked });
  };

  const clear = async (type) => {
    const list = type === 'g' ? groceries : supplies;
    const doneItems = list.filter(i => i.checked);
    if (doneItems.length === 0) return;
    
    if (!window.confirm('완료된 항목을 모두 삭제하시겠습니까?')) return;

    const s = type === 'g' ? setGroceries : setSupplies;
    
    s(l => l.filter(i => !i.checked));
    
    for (const item of doneItems) {
      await deleteShoppingItem(item.id);
    }
  };

  const toggleCoupang = async (id, type) => {
    const s = type === 'g' ? setGroceries : setSupplies;
    const list = type === 'g' ? groceries : supplies;
    const item = list.find(i => i.id === id);
    if (!item) return;

    s(l => l.map(i => i.id === id ? { ...i, is_coupang: !i.is_coupang } : i));
    await upsertShoppingItem({ id, is_coupang: !item.is_coupang });
  };

  const addItem = async (text, isCoupang) => {
    const type = modalOpen === 'g' ? 'g' : 's';
    const s = type === 'g' ? setGroceries : setSupplies;
    
    const saved = await upsertShoppingItem({ text, type, is_coupang: isCoupang, checked: false });
    if (saved) {
      s(prev => [...prev, saved]);
    }
  };

  const currentItems = activeTab === 'g' ? groceries : supplies;
  const currentSetter = activeTab === 'g' ? setGroceries : setSupplies;
  const checkedCount = currentItems.filter(i => i.checked).length;
  const totalCount = currentItems.length;

  if (loading) return <div className="shopping-container page-transition" style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh'}}><Loader size={32} className="spin" style={{animation:'spin 1s linear infinite'}}/></div>;

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
              {item.is_coupang && (
                <span className="rocket-badge" onClick={(e) => { e.stopPropagation(); toggleCoupang(item.id, type); }}>
                  🚀
                </span>
              )}
              {!item.is_coupang && (
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
        <div className="shop-mobile-list" style={{gap: '8px', display: 'flex', flexDirection: 'row', padding: '12px 8px', overflowX: 'hidden'}}>
          
          {/* Groceries Area */}
          <div 
            onClick={() => setActiveTab('g')}
            style={{
              flex: 1, minWidth: 0,
              border: activeTab === 'g' ? '2px solid #2e7d32' : '2px solid transparent',
              borderRadius: '20px', padding: '10px 6px', 
              background: '#f0f9f1',
              transition: 'all 0.2s', opacity: activeTab === 'g' ? 1 : 0.6,
              boxShadow: activeTab === 'g' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
              display: 'flex', flexDirection: 'column', gap: '8px'
            }}
          >
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '8px', textAlign: 'center'}}>
              <h3 style={{display:'flex', alignItems:'center', gap:'6px', margin: '0 0 4px 0', fontSize: '1rem', color: '#2e7d32'}}>
                <Apple size={16}/> 식자재
              </h3>
              <span style={{fontSize: '0.75rem', color: '#555', fontWeight: 'bold'}}>{groceries.filter(i=>!i.checked).length}개 남음</span>
            </div>
            {groceries.length === 0 && (
              <div className="empty-state" style={{margin: '20px 0'}}>
                <span className="empty-icon" style={{fontSize: '1.5rem'}}>🥬</span>
                <p style={{fontSize: '0.8rem'}}>비었어요</p>
              </div>
            )}
            {groceries.map(item => (
              <div key={item.id} className={`shop-item-mobile ${item.checked ? 'done' : ''}`} onClick={(e) => { e.stopPropagation(); toggle(item.id, 'g'); }} style={{padding:'6px 4px', gap:'4px', display:'flex', alignItems:'center'}}>
                <div style={{flexShrink:0, width: '18px', height: '18px'}} className={`chk ${item.checked ? 'chk-on' : ''}`}/>
                <span className="item-text" style={{fontSize:'0.8rem', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', letterSpacing: '-0.02em'}}>{item.text}</span>
                {item.is_coupang ? (
                  <span className="rocket-badge" onClick={(e) => { e.stopPropagation(); toggleCoupang(item.id, 'g'); }} style={{padding:'2px', fontSize:'0.75rem', flexShrink: 0}}>🚀</span>
                ) : (
                  <button className="rocket-toggle-off" onClick={(e) => { e.stopPropagation(); toggleCoupang(item.id, 'g'); }} style={{padding:'2px', fontSize:'0.75rem', flexShrink: 0}}>🚀</button>
                )}
              </div>
            ))}
          </div>

          {/* Supplies Area */}
          <div 
            onClick={() => setActiveTab('s')}
            style={{
              flex: 1, minWidth: 0,
              border: activeTab === 's' ? '2px solid #c2185b' : '2px solid transparent',
              borderRadius: '20px', padding: '10px 6px', 
              background: '#fef0f5',
              transition: 'all 0.2s', opacity: activeTab === 's' ? 1 : 0.6,
              boxShadow: activeTab === 's' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
              display: 'flex', flexDirection: 'column', gap: '8px'
            }}
          >
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '8px', textAlign: 'center'}}>
              <h3 style={{display:'flex', alignItems:'center', gap:'6px', margin: '0 0 4px 0', fontSize: '1rem', color: '#c2185b'}}>
                <Baby size={16}/> 육아용품
              </h3>
              <span style={{fontSize: '0.75rem', color: '#555', fontWeight: 'bold'}}>{supplies.filter(i=>!i.checked).length}개 남음</span>
            </div>
            {supplies.length === 0 && (
              <div className="empty-state" style={{margin: '20px 0'}}>
                <span className="empty-icon" style={{fontSize: '1.5rem'}}>🍼</span>
                <p style={{fontSize: '0.8rem'}}>비었어요</p>
              </div>
            )}
            {supplies.map(item => (
              <div key={item.id} className={`shop-item-mobile ${item.checked ? 'done' : ''}`} onClick={(e) => { e.stopPropagation(); toggle(item.id, 's'); }} style={{padding:'6px 4px', gap:'4px', display:'flex', alignItems:'center'}}>
                <div style={{flexShrink:0, width: '18px', height: '18px'}} className={`chk ${item.checked ? 'chk-on' : ''}`}/>
                <span className="item-text" style={{fontSize:'0.8rem', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', letterSpacing: '-0.02em'}}>{item.text}</span>
                {item.is_coupang ? (
                  <span className="rocket-badge" onClick={(e) => { e.stopPropagation(); toggleCoupang(item.id, 's'); }} style={{padding:'2px', fontSize:'0.75rem', flexShrink: 0}}>🚀</span>
                ) : (
                  <button className="rocket-toggle-off" onClick={(e) => { e.stopPropagation(); toggleCoupang(item.id, 's'); }} style={{padding:'2px', fontSize:'0.75rem', flexShrink: 0}}>🚀</button>
                )}
              </div>
            ))}
          </div>
          
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
