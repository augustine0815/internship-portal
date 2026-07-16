import { useState, useEffect } from 'react';
import { getMyApplications, withdrawApplication } from '../../services/api';

const statusColors = {
  applied: '#3498db', under_review: '#f39c12', shortlisted: '#9b59b6',
  rejected: '#e74c3c', offered: '#2ecc71', withdrawn: '#95a5a6',
};

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => { fetchApplications(); }, []);

  const fetchApplications = async () => {
    try {
      const res = await getMyApplications();
      setApplications(res.data.applications);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleWithdraw = async (id) => {
    if (!window.confirm('Withdraw this application?')) return;
    try {
      await withdrawApplication(id);
      setMessage('Application withdrawn.');
      fetchApplications();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to withdraw');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>My Applications</h2>
      {message && <div style={styles.message}>{message}</div>}
      {loading ? <p>Loading...</p> : applications.length === 0 ? (
        <p style={styles.empty}>You haven't applied to any internships yet.</p>
      ) : (
        <div style={styles.list}>
          {applications.map(app => (
            <div key={app.id} style={styles.card}>
              <div style={styles.cardTop}>
                <div>
                  <h3 style={styles.title}>{app.internship?.title}</h3>
                  <p style={styles.company}>🏢 {app.internship?.company?.company_name}</p>
                </div>
                <span style={{ ...styles.badge, backgroundColor: statusColors[app.status] }}>
                  {app.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <p style={styles.date}>Applied: {new Date(app.applied_at).toLocaleDateString()}</p>
              {app.status === 'applied' && (
                <button style={styles.withdrawBtn} onClick={() => handleWithdraw(app.id)}>
                  Withdraw
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { padding: '2rem', maxWidth: '800px', margin: '0 auto' },
  heading: { fontSize: '1.8rem', marginBottom: '1.5rem', color: '#1a1a2e' },
  message: { padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', backgroundColor: '#e8f5e9', color: '#2e7d32' },
  empty: { textAlign: 'center', color: '#666', marginTop: '3rem' },
  list: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  card: { backgroundColor: 'white', borderRadius: '10px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' },
  title: { fontSize: '1.1rem', color: '#1a1a2e', margin: 0 },
  company: { color: '#555', margin: '0.25rem 0' },
  badge: { color: 'white', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' },
  date: { color: '#888', fontSize: '0.85rem', marginBottom: '0.75rem' },
  withdrawBtn: { padding: '0.5rem 1rem', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
};

export default MyApplications;