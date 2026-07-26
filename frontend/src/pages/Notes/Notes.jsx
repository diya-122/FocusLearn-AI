import { useState, useEffect } from 'react';
import { HiOutlinePencilSquare, HiPlus, HiTrash, HiDocumentArrowDown } from 'react-icons/hi2';
import plannerService from '../../services/plannerService';
import styles from './Notes.module.css';

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', content: '' });

  useEffect(() => {
    fetchNotes();
  }, [search]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await plannerService.getNotes(search);
      setNotes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async () => {
    try {
      const res = await plannerService.createNote({
        title: 'New Note',
        content: ''
      });
      fetchNotes();
      setSelectedNote(res.data);
      setEditForm({ title: res.data.title, content: res.data.content });
      setIsEditing(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveNote = async () => {
    if (!selectedNote) return;
    try {
      const res = await plannerService.updateNote(selectedNote.id, editForm);
      setSelectedNote(res.data);
      setIsEditing(false);
      fetchNotes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      await plannerService.deleteNote(id);
      if (selectedNote?.id === id) {
        setSelectedNote(null);
        setIsEditing(false);
      }
      fetchNotes();
    } catch (err) {
      console.error(err);
    }
  };

  const downloadPDF = () => {
    if (!selectedNote) return;
    // Basic client-side print for PDF download
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(`
      <html>
        <head>
          <title>${selectedNote.title}</title>
          <style>
            body { font-family: sans-serif; padding: 2rem; color: #333; line-height: 1.6; }
            h1 { color: #2563EB; border-bottom: 2px solid #E2E8F0; padding-bottom: 0.5rem; }
            p { white-space: pre-wrap; }
          </style>
        </head>
        <body>
          <h1>${selectedNote.title}</h1>
          <p>${selectedNote.content || 'No content'}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>My Notes</h2>
          <button className={styles.addBtn} onClick={handleCreateNote}>
            <HiPlus />
          </button>
        </div>
        <div className={styles.searchBox}>
          <input 
            type="text" 
            placeholder="Search notes..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.noteList}>
          {notes.map(note => (
            <div 
              key={note.id} 
              className={`${styles.noteCard} ${selectedNote?.id === note.id ? styles.active : ''}`}
              onClick={() => {
                setSelectedNote(note);
                setEditForm({ title: note.title, content: note.content });
                setIsEditing(false);
              }}
            >
              <h3>{note.title}</h3>
              <p>{note.content ? note.content.substring(0, 50) + '...' : 'Empty note'}</p>
              <span className={styles.date}>{new Date(note.updated_at).toLocaleDateString()}</span>
            </div>
          ))}
          {notes.length === 0 && !loading && (
            <div className={styles.emptyState}>No notes found. Create one!</div>
          )}
        </div>
      </div>

      <div className={styles.editorArea}>
        {selectedNote ? (
          <div className={styles.editorCard}>
            <div className={styles.editorHeader}>
              {isEditing ? (
                <input 
                  type="text" 
                  value={editForm.title} 
                  onChange={e => setEditForm({...editForm, title: e.target.value})}
                  className={styles.titleInput}
                />
              ) : (
                <h1>{selectedNote.title}</h1>
              )}
              
              <div className={styles.editorActions}>
                <button className="btn btn-secondary" onClick={downloadPDF} title="Download as PDF">
                  <HiDocumentArrowDown /> PDF
                </button>
                {isEditing ? (
                  <button className="btn btn-primary" onClick={handleSaveNote}>Save</button>
                ) : (
                  <button className="btn btn-secondary" onClick={() => setIsEditing(true)}>Edit</button>
                )}
                <button className="btn btn-danger" onClick={() => handleDeleteNote(selectedNote.id)}>
                  <HiTrash />
                </button>
              </div>
            </div>
            
            <div className={styles.editorContent}>
              {isEditing ? (
                <textarea 
                  value={editForm.content || ''} 
                  onChange={e => setEditForm({...editForm, content: e.target.value})}
                  className={styles.contentInput}
                  placeholder="Start writing..."
                />
              ) : (
                <div className={styles.contentDisplay}>
                  {selectedNote.content ? selectedNote.content : <span className={styles.placeholder}>No content yet. Click Edit to start writing.</span>}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.noSelection}>
            <HiOutlinePencilSquare className={styles.icon} />
            <p>Select a note to view or create a new one.</p>
          </div>
        )}
      </div>
    </div>
  );
}
