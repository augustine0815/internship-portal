import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyInternships, updateInternship, updateInternshipStatus, deleteInternship } from '../../services/api';

const ManageInternships = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});
  const navigate = useNavigate();

  useEffect(() => { fetchInternships(); }, []);

  const fetchInternships = async () => {
    try {
      const res = await getMyInternships();
      setInternships(res.data.internships);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateInternshipStatus(id, status);
      setMessage('Status updated!');
      fetchInternships();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { setMessage('Failed to update status'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this internship?')) return;
    try {
      await deleteInternship(id);
      setMessage('Internship deleted.');
      fetchInternships();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { setMessage('Failed to delete'); }
  };

  const openEdit = (i) => {
    setEditing(i);
    setEditForm({
      title: i.title,
      description: i.description || '',
      location: i.location || '',
      stipend: i.stipend || '',
      duration_weeks: i.duration_weeks || '',
      is_remote: i.is_remote || false,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateInternship(editing.id, editForm);
      setMessage('Internship updated!');
      setEditing(null);
      fetchInternships();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update internship');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const statusColor = { draft: '#95a5a6', open: '#2ecc71', closed: '#e74c3c', filled: '#3498db' };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.heading}>My Internship Postings</h2>
        <button style={styles.postBtn} onClick={() => navigate('/company/post')}>
          + Post New Internship
        </button>
      </div>
      {message && <div style={styles.message}>{message}</div>}
      {loading ? <p>Loading...</p> : internships.length === 0 ? (
        <p style={styles.empty}>No postings yet. Create your first internship!</p>
      ) : (
        <div style={styles.list}>
          {internships.map(i => (
            <div key={i.id} style={styles.card}>
              <div style={styles.cardTop}>
                <div>
                  <h3 style={styles.title}>{i.title}</h3>
                  <p style={styles.sub}>📍 {i.location} | 💰 RM{i.stipend}/month | ⏱ {i.duration_weeks} weeks</p>
                </div>
                <span style={{ ...styles.badge, backgroundColor: statusColor[i.status] }}>
                  {i.status.toUpperCase()}
                </span>
              </div>
              <div style={styles.actions}>
                {i.status === 'draft' && (
                  <button style={styles.openBtn} onClick={() => handleStatusChange(i.id, 'open')}>Open</button>
                )}
                {i.status === 'open' && (
                  <button style={styles.closeBtn} onClick={() => handleStatusChange(i.id, 'closed')}>Close</button>
                )}
                <button style={styles.viewBtn} onClick={() => navigate(`/company/applicants/${i.id}`)}>
                  View Applicants
                </button>
                <button style={styles.editBtn} onClick={() => openEdit(i)}>Edit</button>
                <button style={styles.deleteBtn} onClick={() => handleDelete(i.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div style={styles.modalOverlay} onClick={() => setEditing(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Edit Internship Posting</h3>
            <form onSubmit={handleUpdate}>
              <div style={styles.field}>
                <label style={styles.label}>Title</label>
                <input
                  style={styles.input}
                  value={editForm.title}
                  onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Description</label>
                <textarea
                  style={{ ...styles.input, height: '100px', resize: 'vertical' }}
                  value={editForm.description}
                  onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                />
              </div>
              <div style={styles.fieldRow}>
                <div style={styles.field}>
                  <label style={styles.label}>Location</label>
                  <input
                    style={styles.input}
                    value={editForm.location}
                    onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                  />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Stipend (RM/month)</label>
                  <input
                    style={styles.input}
                    type="number"
                    value={editForm.stipend}
                    onChange={e => setEditForm({ ...editForm, stipend: e.target.value })}
                  />
                </div>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Duration (weeks)</label>
                <input
                  style={styles.input}
                  type="number"
                  value={editForm.duration_weeks}
                  onChange={e => setEditForm({ ...editForm, duration_weeks: e.target.value })}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>
                  <input
                    type="checkbox"
                    checked={editForm.is_remote}
                    onChange={e => setEditForm({ ...editForm, is_remote: e.target.checked })}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Remote internship
                </label>
              </div>
              <div style={styles.modalActions}>
                <button type="button" style={styles.cancelBtn} onClick={() => setEditing(null)}>
                  Cancel
                </button>
                <button type="submit" style={styles.saveBtn}>
                  💾 Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { padding: '2rem', maxWidth: '900px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  heading: { fontSize: '1.8rem', color: '#1a1a2e', margin: 0 },
  postBtn: { padding: '0.75rem 1.5rem', backgroundColor: '#1a1a2e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  message: { padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', backgroundColor: '#e8f5e9', color: '#2e7d32' },
  empty: { textAlign: 'center', color: '#666', marginTop: '3rem' },
  list: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  card: { backgroundColor: 'white', borderRadius: '10px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' },
  title: { fontSize: '1.1rem', color: '#1a1a2e', margin: '0 0 0.25rem 0' },
  sub: { color: '#555', fontSize: '0.9rem', margin: 0 },
  badge: { color: 'white', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' },
  actions: { display: 'flex', gap: '0.75rem' },
  openBtn: { padding: '0.5rem 1rem', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  closeBtn: { padding: '0.5rem 1rem', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  viewBtn: { padding: '0.5rem 1rem', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  deleteBtn: { padding: '0.5rem 1rem', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  editBtn: { padding: '0.5rem 1rem', backgroundColor: '#f39c12', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem' },
  modal: { backgroundColor: 'white', borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' },
  modalTitle: { fontSize: '1.3rem', color: '#1a1a2e', marginTop: 0, marginBottom: '1.5rem' },
  field: { marginBottom: '1rem', flex: 1 },
  fieldRow: { display: 'flex', gap: '1rem' },
  label: { display: 'block', fontWeight: '600', color: '#333', marginBottom: '0.4rem', fontSize: '0.9rem' },
  input: { width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.9rem', color: '#1a1a2e', backgroundColor: 'white', boxSizing: 'border-box' },
  modalActions: { display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' },
  cancelBtn: { padding: '0.6rem 1.2rem', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  saveBtn: { padding: '0.6rem 1.2rem', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' },
};

export default ManageInternships;