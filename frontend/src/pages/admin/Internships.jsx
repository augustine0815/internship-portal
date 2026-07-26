import { useState, useEffect } from 'react';
import { getAllInternshipsAdmin, approveInternship } from '../../services/api';

const AdminInternships = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => { fetchInternships(); }, []);

  const fetchInternships = async () => {
    try {
      const res = await getAllInternshipsAdmin();
      setInternships(res.data.internships);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleApprove = async (id, approved) => {
    try {
      await approveInternship(id, approved);
      setMessage(`Internship ${approved ? 'approved' : 'rejected'}.`);
      fetchInternships();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { setMessage('Failed to update'); }
  };

  const statusColor = { draft: '#95a5a6', open: '#2ecc71', closed: '#e74c3c', filled: '#3498db' };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Internship Overview (View Only)</h2>
      {message && <div style={styles.message}>{message}</div>}
      {loading ? <p>Loading...</p> : internships.length === 0 ? (
        <p style={styles.empty}>No internships found.</p>
      ) : (
        <div style={styles.list}>
          {internships.map(i => (
            <div key={i.id} style={styles.card}>
              <div style={styles.cardTop}>
                <div>
                  <h3 style={styles.title}>{i.title}</h3>
                  <p style={styles.company}>🏢 {i.company?.company_name}</p>
                  <p style={styles.sub}>📍 {i.location} | 💰 RM{i.stipend}/month</p>
                </div>
                <div style={styles.badges}>
                  <span style={{ ...styles.badge, backgroundColor: statusColor[i.status] }}>
                    {i.status.toUpperCase()}
                  </span>
                  <span style={{ ...styles.badge, backgroundColor: i.approved_by_admin ? '#2ecc71' : '#f39c12' }}>
                    {i.approved_by_admin ? 'Approved' : 'Pending'}
                  </span>
                </div>
              </div>
              <div style={styles.actions}>
                {!i.approved_by_admin && (
                  <button style={styles.approveBtn} onClick={() => handleApprove(i.id, true)}>
                    ✅ Approve
                  </button>
                )}
                {i.approved_by_admin && (
                  <button style={styles.rejectBtn} onClick={() => handleApprove(i.id, false)}>
                    ❌ Revoke Approval
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { padding: '2rem', maxWidth: '1000px', margin: '0 auto' },
  heading: { fontSize: '1.8rem', color: '#1a1a2e', marginBottom: '1.5rem' },
  message: { padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', backgroundColor: '#e8f5e9', color: '#2e7d32' },
  empty: { textAlign: 'center', color: '#666' },
  list: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  card: { backgroundColor: 'white', borderRadius: '10px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
  cardTop: { display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' },
  title: { fontSize: '1.1rem', color: '#1a1a2e', margin: '0 0 0.25rem 0' },
  company: { color: '#555', margin: '0 0 0.25rem 0' },
  sub: { color: '#888', fontSize: '0.9rem', margin: 0 },
  badges: { display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' },
  badge: { color: 'white', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' },
  actions: { display: 'flex', gap: '0.75rem' },
  approveBtn: { padding: '0.5rem 1.25rem', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  rejectBtn: { padding: '0.5rem 1.25rem', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
};

export default AdminInternships;