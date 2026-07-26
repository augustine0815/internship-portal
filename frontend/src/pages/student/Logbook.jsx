import { useState, useEffect, useRef } from 'react';
import {
  getMyLogbooks, createLogbook, getLogbookById,
  updateLogbook, submitLogbook, chatWithLogbookAI,
  uploadLogbookPhoto,
} from '../../services/api';

const statusColors = {
  draft: '#95a5a6',
  submitted: '#3498db',
  reviewed: '#2ecc71',
};

const statusIcons = {
  draft: '📝',
  submitted: '📤',
  reviewed: '✅',
};

export default function Logbook() {
  const [logbooks, setLogbooks] = useState([]);
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState('list'); // list | create | detail
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [photoFile, setPhotoFile] = useState(null);

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    title: '',
    notes: '',
  });

  const [editContent, setEditContent] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatScrollRef = useRef(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, chatLoading]);

  useEffect(() => { fetchLogbooks(); }, []);

  const fetchLogbooks = async () => {
    try {
      const res = await getMyLogbooks();
      setLogbooks(res.data.logbooks);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await createLogbook(form);
      setMessage('Logbook entry created!');
      fetchLogbooks();
      openDetail(res.data.logbook);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to create');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const openDetail = async (logbook) => {
    try {
      const res = await getLogbookById(logbook.id);
      setSelected(res.data.logbook);
      setEditContent(res.data.logbook.final_content || '');
      setChatMessages([]);
      setChatInput('');
      setShowChat(false);
      setView('detail');
    } catch (err) { console.error(err); }
  };

  const handleSaveContent = async () => {
    try {
      await updateLogbook(selected.id, {
        title: selected.title,
        notes: selected.notes,
        final_content: editContent,
      });
      setMessage('Content saved!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to save');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;

    const newMessages = [...chatMessages, { role: 'user', text: chatInput.trim() }];
    setChatMessages(newMessages);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await chatWithLogbookAI(selected.id, newMessages);
      setChatMessages([...newMessages, { role: 'assistant', text: res.data.reply }]);
    } catch (err) {
      setChatMessages([...newMessages, {
        role: 'assistant',
        text: '⚠️ Sorry, something went wrong. Please try again.',
      }]);
    }
    setChatLoading(false);
  };

  const handleSubmit = async () => {
    if (!window.confirm('Submit this logbook? You cannot edit it after submission.')) return;
    setSubmitting(true);
    try {
      await handleSaveContent();
      await submitLogbook(selected.id);
      setMessage('Logbook submitted successfully! ✅');
      fetchLogbooks();
      const updated = await getLogbookById(selected.id);
      setSelected(updated.data.logbook);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to submit');
      setTimeout(() => setMessage(''), 3000);
    }
    setSubmitting(false);
  };

  const handlePhotoUpload = async () => {
    if (!photoFile) return;
    try {
      const formData = new FormData();
      formData.append('photo', photoFile);
      await uploadLogbookPhoto(selected.id, formData);
      setMessage('Photo uploaded!');
      const updated = await getLogbookById(selected.id);
      setSelected(updated.data.logbook);
      setPhotoFile(null);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to upload photo');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // LIST VIEW
  if (view === 'list') return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.heading}>📔 My Logbook</h2>
        <button style={styles.createBtn} onClick={() => setView('create')}>
          + New Entry
        </button>
      </div>

      {message && <div style={styles.message}>{message}</div>}

      {loading ? <p>Loading...</p> : logbooks.length === 0 ? (
        <div style={styles.emptyBox}>
          <p style={styles.emptyIcon}>📔</p>
          <p style={styles.emptyText}>No logbook entries yet.</p>
          <p style={styles.emptySubtext}>Start documenting your internship journey!</p>
          <button style={styles.createBtn} onClick={() => setView('create')}>
            Create First Entry
          </button>
        </div>
      ) : (
        <div style={styles.list}>
          {logbooks.map(log => (
            <div key={log.id} style={styles.card} onClick={() => openDetail(log)}>
              <div style={styles.cardLeft}>
                <div style={styles.dateBox}>
                  <span style={styles.dateDay}>
                    {new Date(log.date).getDate()}
                  </span>
                  <span style={styles.dateMonth}>
                    {new Date(log.date).toLocaleString('default', { month: 'short' })}
                  </span>
                </div>
              </div>
              <div style={styles.cardContent}>
                <h3 style={styles.cardTitle}>{log.title}</h3>
                <p style={styles.cardNotes} numberOfLines={2}>
                  {log.notes?.slice(0, 100) || 'No notes yet...'}
                </p>
              </div>
              <div style={styles.cardRight}>
                <span style={{ ...styles.statusBadge, backgroundColor: statusColors[log.status] }}>
                  {statusIcons[log.status]} {log.status}
                </span>
                {(log.photo_urls || []).length > 0 && (
                  <span style={styles.photoBadge}>
                    📷 {log.photo_urls.length}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // CREATE VIEW
  if (view === 'create') return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => setView('list')}>
          ← Back
        </button>
        <h2 style={styles.heading}>New Logbook Entry</h2>
      </div>

      {message && <div style={styles.message}>{message}</div>}

      <div style={styles.formCard}>
        <form onSubmit={handleCreate}>
          <div style={styles.field}>
            <label style={styles.label}>📅 Date</label>
            <input
              style={styles.input}
              type="date"
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>📌 Title</label>
            <input
              style={styles.input}
              type="text"
              placeholder="e.g. Day 1 - Setting up Development Environment"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>
              📝 Notes / Keywords
              <span style={styles.labelHint}> (The AI will expand these into a full logbook)</span>
            </label>
            <textarea
              style={{ ...styles.input, height: '150px', resize: 'vertical' }}
              placeholder="Write your rough notes here... e.g.&#10;- Learned how to use VS Code&#10;- Installed Node.js and npm&#10;- Fixed a bug in the login page&#10;- Had a meeting with supervisor"
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <div style={styles.formButtons}>
            <button type="button" style={styles.cancelBtn} onClick={() => setView('list')}>
              Cancel
            </button>
            <button type="submit" style={styles.submitBtn}>
              Create Entry →
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // DETAIL VIEW
  if (view === 'detail' && selected) return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => { setView('list'); fetchLogbooks(); }}>
          ← Back
        </button>
        <div style={styles.headerRight}>
          <span style={{ ...styles.statusBadge, backgroundColor: statusColors[selected.status] }}>
            {statusIcons[selected.status]} {selected.status.toUpperCase()}
          </span>
        </div>
      </div>

      {message && <div style={styles.message}>{message}</div>}

      <div style={styles.detailGrid}>
        {/* Left Column */}
        <div style={styles.detailLeft}>

          {/* Info */}
          <div style={styles.detailCard}>
            <h2 style={styles.detailTitle}>{selected.title}</h2>
            <p style={styles.detailDate}>
              📅 {new Date(selected.date).toLocaleDateString('en-MY', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
              })}
            </p>
          </div>

          {/* Notes */}
          <div style={styles.detailCard}>
            <h3 style={styles.sectionTitle}>📝 My Notes / Keywords</h3>
            {selected.status !== 'reviewed' ? (
              <textarea
                style={{ ...styles.input, height: '120px', resize: 'vertical' }}
                value={selected.notes || ''}
                onChange={e => setSelected({ ...selected, notes: e.target.value })}
                placeholder="Add your notes here..."
              />
            ) : (
              <p style={styles.notesText}>{selected.notes || 'No notes'}</p>
            )}
          </div>

          {/* Photos */}
          <div style={styles.detailCard}>
            <h3 style={styles.sectionTitle}>📷 Photos</h3>
            {(selected.photo_urls || []).length > 0 ? (
              <div style={styles.photoGrid}>
                {selected.photo_urls.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Photo ${i + 1}`}
                    style={styles.photo}
                    onClick={() => window.open(url, '_blank')}
                  />
                ))}
              </div>
            ) : (
              <p style={styles.emptyText}>No photos yet</p>
            )}
            {selected.status !== 'reviewed' && (
              <div style={styles.photoUpload}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setPhotoFile(e.target.files[0])}
                  style={{ display: 'none' }}
                  id="photo-input"
                />
                <label htmlFor="photo-input" style={styles.photoLabel}>
                  📎 Choose Photo
                </label>
                {photoFile && (
                  <button style={styles.uploadBtn} onClick={handlePhotoUpload}>
                    ⬆️ Upload
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Reviewer Comment */}
          {selected.reviewer_comment && (
            <div style={{ ...styles.detailCard, borderLeft: '4px solid #2ecc71' }}>
              <h3 style={styles.sectionTitle}>💬 Reviewer Comment</h3>
              <p style={styles.reviewerComment}>{selected.reviewer_comment}</p>
            </div>
          )}
        </div>

        {/* Right Column - AI Content */}
        <div style={styles.detailRight}>
          <div style={styles.detailCard}>
            <div style={styles.aiHeader}>
              <h3 style={styles.sectionTitle}>📝 Logbook Content</h3>
              {selected.status !== 'reviewed' && (
                <button style={styles.aiBtn} onClick={() => setShowChat(!showChat)}>
                  {showChat ? '✖️ Close Assistant' : '🤖 AI Writing Assistant'}
                </button>
              )}
            </div>

            {selected.status !== 'reviewed' ? (
              <textarea
                style={{ ...styles.input, height: '300px', resize: 'vertical', fontFamily: 'Georgia, serif', lineHeight: '1.8' }}
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                placeholder="Your logbook content will appear here. You can write it manually or chat with the AI assistant below to help you write it."
              />
            ) : (
              <div style={styles.finalContent}>
                {(selected.final_content || selected.ai_generated_content || 'No content').split('\n').map((para, i) => (
                  para ? <p key={i} style={styles.contentPara}>{para}</p> : <br key={i} />
                ))}
              </div>
            )}

            {selected.status !== 'reviewed' && showChat && (
              <div style={styles.chatPanel}>
                <div style={styles.chatHeader}>
                  🤖 Chat with your AI writing assistant — ask it to draft, shorten, add detail, or rewrite your entry.
                </div>

                <div style={styles.chatMessages} ref={chatScrollRef}>
                  {chatMessages.length === 0 && (
                    <div style={styles.chatEmptyHint}>
                      💡 Try: "Write a draft based on my notes" or "Make it more formal"
                    </div>
                  )}
                  {chatMessages.map((m, i) => (
                    <div key={i} style={m.role === 'user' ? styles.chatBubbleUser : styles.chatBubbleAI}>
                      <p style={styles.chatBubbleText}>{m.text}</p>
                      {m.role === 'assistant' && (
                        <button
                          style={styles.useThisBtn}
                          onClick={() => setEditContent(m.text)}
                        >
                          ✅ Use this as my entry
                        </button>
                      )}
                    </div>
                  ))}
                  {chatLoading && (
                    <div style={styles.chatBubbleAI}>
                      <p style={styles.chatBubbleText}>🤖 Thinking...</p>
                    </div>
                  )}
                </div>

                <div style={styles.chatInputRow}>
                  <input
                    style={styles.chatInput}
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                    placeholder="Type a message to the AI assistant..."
                    disabled={chatLoading}
                  />
                  <button style={styles.chatSendBtn} onClick={handleSendChat} disabled={chatLoading || !chatInput.trim()}>
                    ➤
                  </button>
                </div>
              </div>
            )}

            {selected.status !== 'reviewed' && (
              <>
                {!editContent && (
                  <p style={{ color: '#e74c3c', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                    ⚠️ Write your logbook content above (or use the AI Assistant) before you can submit.
                  </p>
                )}
                {selected.status === 'submitted' && (
                  <p style={{ color: '#3498db', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                    ℹ️ This entry has been submitted. You can still make changes until your coordinator reviews it.
                  </p>
                )}
                <div style={styles.actionButtons}>
                  <button style={styles.saveBtn} onClick={handleSaveContent}>
                    {selected.status === 'submitted' ? '💾 Save Changes' : '💾 Save Draft'}
                  </button>
                  {selected.status === 'draft' && (
                    <button
                      style={styles.submitFinalBtn}
                      onClick={handleSubmit}
                      disabled={submitting || !editContent}
                    >
                      {submitting ? 'Submitting...' : '📤 Submit Logbook'}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '2rem', maxWidth: '1100px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  heading: { fontSize: '1.8rem', color: '#1a1a2e', margin: 0 },
  headerRight: { display: 'flex', alignItems: 'center', gap: '1rem' },
  createBtn: { padding: '0.7rem 1.5rem', backgroundColor: '#1a1a2e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  backBtn: { padding: '0.5rem 1rem', backgroundColor: '#f0f2f5', color: '#333', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  message: { padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', backgroundColor: '#e8f5e9', color: '#2e7d32', textAlign: 'center' },
  emptyBox: { textAlign: 'center', padding: '4rem 2rem' },
  emptyIcon: { fontSize: '4rem', marginBottom: '1rem' },
  emptyText: { fontSize: '1.2rem', color: '#555', marginBottom: '0.5rem' },
  emptySubtext: { color: '#888', marginBottom: '1.5rem' },
  list: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  card: { backgroundColor: 'white', borderRadius: '10px', padding: '1.25rem', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'transform 0.1s', border: '1px solid #eee' },
  cardLeft: { flexShrink: 0 },
  dateBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#1a1a2e', color: 'white', borderRadius: '8px', padding: '0.5rem 0.75rem', minWidth: '50px' },
  dateDay: { fontSize: '1.4rem', fontWeight: 'bold', lineHeight: 1 },
  dateMonth: { fontSize: '0.75rem', opacity: 0.8 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: '1rem', fontWeight: '700', color: '#1a1a2e', margin: '0 0 0.3rem 0' },
  cardNotes: { fontSize: '0.85rem', color: '#666', margin: 0 },
  cardRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' },
  statusBadge: { color: 'white', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' },
  photoBadge: { fontSize: '0.8rem', color: '#555' },
  formCard: { backgroundColor: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
  field: { marginBottom: '1.25rem' },
  label: { display: 'block', fontWeight: '600', color: '#333', marginBottom: '0.5rem' },
  labelHint: { fontWeight: 'normal', color: '#888', fontSize: '0.85rem' },
  input: { width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.95rem', boxSizing: 'border-box' },
  formButtons: { display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' },
  cancelBtn: { padding: '0.75rem 1.5rem', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  submitBtn: { padding: '0.75rem 1.5rem', backgroundColor: '#1a1a2e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  detailGrid: { display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem' },
  detailLeft: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  detailRight: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  detailCard: { backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' },
  detailTitle: { fontSize: '1.4rem', color: '#1a1a2e', margin: '0 0 0.5rem 0' },
  detailDate: { color: '#666', fontSize: '0.9rem', margin: 0 },
  sectionTitle: { fontSize: '1rem', fontWeight: '700', color: '#1a1a2e', marginTop: 0, marginBottom: '0.75rem' },
  notesText: { color: '#555', lineHeight: '1.6', whiteSpace: 'pre-wrap' },
  photoGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' },
  photo: { width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer' },
  photoUpload: { display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '0.5rem' },
  photoLabel: { padding: '0.5rem 1rem', backgroundColor: '#f0f2f5', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', border: '1px dashed #ddd' },
  uploadBtn: { padding: '0.5rem 1rem', backgroundColor: '#1a1a2e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
  reviewerComment: { color: '#2e7d32', lineHeight: '1.6', fontStyle: 'italic' },
  aiHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  aiBtn: { padding: '0.6rem 1.25rem', backgroundColor: '#9b59b6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' },
  chatPanel: { marginTop: '1rem', border: '1px solid #e0e0e0', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#fafafa' },
  chatHeader: { padding: '0.75rem 1rem', backgroundColor: '#9b59b6', color: 'white', fontSize: '0.85rem' },
  chatMessages: { height: '260px', overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  chatEmptyHint: { textAlign: 'center', color: '#999', fontSize: '0.85rem', marginTop: '2rem' },
  chatBubbleUser: { alignSelf: 'flex-end', backgroundColor: '#3498db', color: 'white', padding: '0.6rem 0.9rem', borderRadius: '14px 14px 2px 14px', maxWidth: '85%' },
  chatBubbleAI: { alignSelf: 'flex-start', backgroundColor: 'white', color: '#1a1a2e', padding: '0.6rem 0.9rem', borderRadius: '14px 14px 14px 2px', maxWidth: '90%', border: '1px solid #e0e0e0' },
  chatBubbleText: { margin: 0, fontSize: '0.9rem', lineHeight: '1.5', whiteSpace: 'pre-wrap' },
  useThisBtn: { marginTop: '0.5rem', padding: '0.35rem 0.7rem', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600' },
  chatInputRow: { display: 'flex', gap: '0.5rem', padding: '0.75rem', borderTop: '1px solid #e0e0e0', backgroundColor: 'white' },
  chatInput: { flex: 1, padding: '0.6rem 0.8rem', borderRadius: '20px', border: '1px solid #ddd', fontSize: '0.9rem', color: '#1a1a2e' },
  chatSendBtn: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#9b59b6', color: 'white', border: 'none', cursor: 'pointer', fontSize: '1.1rem' },
  generatingBox: { backgroundColor: '#f8f0ff', borderRadius: '8px', padding: '1rem', marginBottom: '1rem', textAlign: 'center', color: '#9b59b6' },
  generatingSubtext: { fontSize: '0.85rem', opacity: 0.7, margin: 0 },
  finalContent: { lineHeight: '1.8', color: '#333' },
  contentPara: { marginBottom: '1rem' },
  actionButtons: { display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end' },
  saveBtn: { padding: '0.75rem 1.5rem', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  submitFinalBtn: { padding: '0.75rem 1.5rem', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
};