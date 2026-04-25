import React, { useState, useEffect } from 'react';
import { Pencil, Check, Plus, Trash2, X, Loader } from 'lucide-react';
import { supabase, fetchGuides, upsertGuide, deleteGuide, fetchSettings, upsertSettings } from '../lib/supabase';
import './HaeinReadme.css';

const formatDateTime = () => {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${now.getFullYear().toString().slice(2)}.${pad(now.getMonth()+1)}.${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

const SECTION_COLORS = ['#f5f0ff', '#f0f8f4', '#f0f5ff', '#fff5f5'];

const ReadmeSection = ({ section, onSave, onDelete }) => {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(section.title);
  const [items, setItems] = useState([...(section.items || [])]);
  const [newItem, setNewItem] = useState('');
  const [hovered, setHovered] = useState(false);

  const handleSave = () => {
    onSave(section.id, title, items);
    setEditing(false);
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    setItems(prev => [...prev, newItem.trim()]);
    setNewItem('');
  };

  const handleRemoveItem = (idx) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  return (
    <div
      className={`readme-section ${section.is_warning ? 'warning-section' : ''}`}
      style={{ backgroundColor: section.bg_color || '#fff' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Header */}
      <div className="readme-section-header">
        {editing ? (
          <input
            className="title-input"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        ) : (
          <h3 className="readme-section-title">{section.title}</h3>
        )}

        <div className="section-header-actions">
          <span className="updated-at">{section.updated_at}</span>
          {(hovered || editing) && !editing && (
            <button className="edit-icon-btn" onClick={() => setEditing(true)}>
              <Pencil size={14} />
            </button>
          )}
          {editing && (
            <>
              <button className="save-icon-btn" onClick={handleSave}><Check size={14} /></button>
              <button className="cancel-icon-btn" onClick={() => { setEditing(false); setTitle(section.title); setItems([...section.items]); }}><X size={14} /></button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <ul className="readme-items">
        {items.map((item, idx) => (
          <li key={idx} className="readme-item">
            <span className="item-dot">›</span>
            {editing ? (
              <div className="editing-row">
                <input
                  className="item-input"
                  value={item}
                  onChange={e => setItems(items.map((v, i) => i === idx ? e.target.value : v))}
                />
                <button className="remove-item-btn" onClick={() => handleRemoveItem(idx)}><Trash2 size={13} /></button>
              </div>
            ) : (
              <span className="item-text">{item}</span>
            )}
          </li>
        ))}
      </ul>

      {/* Add item in edit mode */}
      {editing && (
        <form className="add-item-form" onSubmit={handleAddItem}>
          <input type="text" placeholder="새 항목 추가..." value={newItem} onChange={e => setNewItem(e.target.value)} />
          <button type="submit"><Plus size={15} /></button>
        </form>
      )}

      {/* Delete section */}
      {editing && (
        <button className="delete-section-btn" onClick={() => onDelete(section.id)}>
          <Trash2 size={14} /> 섹션 삭제
        </button>
      )}
    </div>
  );
};

const HaeinReadme = () => {
  const [sections, setSections] = useState([]);
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [mainTitle, setMainTitle] = useState('해인이 쑥쑥 가이드 🍼');
  const [editingMainTitle, setEditingMainTitle] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGuides = async () => {
      setLoading(true);
      const [guides, title] = await Promise.all([
        fetchGuides(),
        fetchSettings('haein_readme_title')
      ]);
      setSections(guides || []);
      if (title) setMainTitle(title);
      setLoading(false);
    };

    loadGuides();

    const channelGuides = supabase.channel('realtime_guides')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'guide_sections' }, async () => {
        const guides = await fetchGuides();
        setSections(guides || []);
      })
      .subscribe();

    const channelSettings = supabase.channel('realtime_settings_readme')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_settings' }, async (payload) => {
        if (payload.new && payload.new.key === 'haein_readme_title') {
          setMainTitle(payload.new.value);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channelGuides);
      supabase.removeChannel(channelSettings);
    };
  }, []);

  const handleSaveMainTitle = async () => {
    await upsertSettings('haein_readme_title', mainTitle);
    setEditingMainTitle(false);
  };

  const handleSave = async (id, title, items) => {
    const updatedAt = formatDateTime();
    const sectionToUpdate = sections.find(s => s.id === id);
    if (!sectionToUpdate) return;
    const updated = { ...sectionToUpdate, title, items, updated_at: updatedAt };
    
    // Optimistic UI
    setSections(secs => secs.map(s => s.id === id ? updated : s));
    
    // DB Save
    await upsertGuide(updated);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('가이드 섹션을 정말로 삭제하시겠습니까?')) return;
    setSections(secs => secs.filter(s => s.id !== id));
    await deleteGuide(id);
  };

  const handleAddSection = async (e) => {
    e.preventDefault();
    if (!newSectionTitle.trim()) return;
    
    const newSection = {
      title: newSectionTitle,
      items: [],
      updated_at: formatDateTime(),
      bg_color: SECTION_COLORS[sections.length % SECTION_COLORS.length],
      sort_order: sections.length
    };
    
    const saved = await upsertGuide(newSection);
    if (saved) {
      setSections(prev => [...prev, saved]);
    }
    
    setNewSectionTitle('');
    setShowAddSection(false);
  };

  return (
    <div className="readme-container page-transition">
      <div className="readme-header">
        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          {editingMainTitle ? (
            <div style={{display:'flex', alignItems:'center', gap:'8px', width: '100%'}}>
              <input 
                type="text" 
                value={mainTitle} 
                onChange={e => setMainTitle(e.target.value)}
                style={{fontSize:'1.5rem', fontWeight:'800', border:'1px solid #ddd', borderRadius:'8px', padding:'4px 8px', flex:1}}
                autoFocus
              />
              <button className="save-icon-btn" onClick={handleSaveMainTitle}><Check size={18} /></button>
            </div>
          ) : (
            <>
              <h2 className="readme-main-title" style={{margin:0}}>{mainTitle}</h2>
              <button className="edit-icon-btn" onClick={() => setEditingMainTitle(true)}><Pencil size={18} color="#999" /></button>
            </>
          )}
        </div>
      </div>

      <div className="sections-list">
        {sections.map(section => (
          <ReadmeSection
            key={section.id}
            section={section}
            onSave={handleSave}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Add new section */}
      {showAddSection ? (
        <form className="add-section-form" onSubmit={handleAddSection}>
          <input
            type="text"
            placeholder="새 섹션 제목..."
            value={newSectionTitle}
            onChange={e => setNewSectionTitle(e.target.value)}
            autoFocus
          />
          <div className="form-row">
            <button type="submit" className="add-confirm-btn"><Check size={16} /> 추가</button>
            <button type="button" className="add-cancel-btn" onClick={() => setShowAddSection(false)}><X size={16} /></button>
          </div>
        </form>
      ) : (
        <button className="add-section-btn" onClick={() => setShowAddSection(true)}>
          <Plus size={16} /> 새 섹션 추가
        </button>
      )}
    </div>
  );
};

export default HaeinReadme;
