import { useState, useEffect } from 'react';
import { getCoordinatorInternships, approveInternshipCoordinator } from '../../services/api';

const statusColors = { draft: '#95a5a6', open: '#2ecc71', closed: '#e74c3c', filled: '#3498db' };

export default function CoordinatorInternships() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchInternships(); }, []);

  const fetchInternships = async () => {
    try {
      const res = await getCoordinatorInternships();
      setInternships(res.data.internships);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleApprove = async (id, approved) => {
    try {
      await approveInternshipCoordinator(id, approved);
      setMessage(`Internship ${approved ? 'approved' : 'rejected'} successfully!`);
      fetchInternships();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { setMessage('Failed to update'); }
  };

  const filtered = internships.filter(i => {
    if (filter === 'pending') return !i.approved_by_admin;
    if (filter === 'approved') return i.approved_by_admin;
    return true;
  });

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>💼 Manage Internship Listings</h2>

      {message && <div style={styles.message}>{message}</div>}

      <div style={styles.filterBar}>
        {[
          { key: 'all', label: 'All' },
          { key: 'pending', label: '⏳ Pending Approval' },
          { key: 'approved', label: '✅ Approved' },
        ].map(f => (
          <button
            key={f.key}
            style={{ ...styles.filterBtn, backgroundColor: filter === f.key ? '#1a1a2e' : '#f0f2f5', color: filter === f.key ? 'white' : '#333' }}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
            {f.key === 'pending' && (
              <span style={styles.pendingCount}>
                {internships.filter(i => !i.approved_by_admin).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? <p>Loading...</p> : filtered.length === 0 ? (
        <p style={styles.empty}>No internships found.</p>
      ) : (
        <div style={styles.list}>
          {filtered.map(i => (
            <div key={i.id} style={styles.card}>
              <div style={styles.cardTop}>
                <div style={styles.cardLeft}>
                  <h3 style={styles.title}>{i.title}</h3>
                  <p style={styles.company}>🏢 {i.company?.company_name} • {i.company?.industry}</p>
                  <p style={styles.details}>
                    📍 {i.location} | 💰 RM{i.stipend}/month | ⏱ {i.duration_weeks} weeks | 👥 {i.openings} openings
                  </p>
                </div>
                <div style={styles.cardRight}>
                  <span style={{ ...styles.statusBadge, backgroundColor: statusColors[i.status] }}>
                    {i.status.toUpperCase()}
                  </span>
                  <span style={{ ...styles.approvalBadge, backgroundColor: i.approved_by_admin ? '#2ecc71' : '#f39c12' }}>
                    {i.approved_by_admin ? '✅ Approved' : '⏳ Pending'}
                  </span>
                </div>
              </div>

              <p style={styles.desc}>{i.description?.slice(0, 150)}...</p>

              <div style={styles.skills}>
                {(i.required_skills || []).map(s => (
                  <span key={s} style={styles.skill}>{s}</span>
                ))}
              </div>

              <div style={styles.actions}>
                {!i.approved_by_admin ? (
                  <>
                    <button style={styles.approveBtn} onClick={() => handleApprove(i.id, true)}>
                      ✅ Approve
                    </button>
                    <button style={styles.rejectBtn} onClick={() => handleApprove(i.id, false)}>
                      ❌ Reject
                    </button>
                  </>
                ) : (
                  <button style={styles.revokeBtn} onClick={() => handleApprove(i.id, false)}>
                    🔄 Revoke Approval
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '2rem', maxWidth: '1000px', margin: '0 auto' },
  heading: { fontSize: '1.8rem', color: '#1a1a2e', marginBottom: '1.5rem' },
  message: { padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', backgroundColor: '#e8f5e9', color: '#2e7d32' },
  filterBar: { display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' },
  filterBtn: { padding: '0.6rem 1.25rem', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  pendingCount: { backgroundColor: '#e74c3c', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' },
  empty: { textAlign: 'center', color: '#888', padding: '3rem' },
  list: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  card: { backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' },
  cardLeft: { flex: 1 },
  cardRight: { display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' },
  title: { fontSize: '1.1rem', color: '#1a1a2e', margin: '0 0 0.3rem 0' },
  company: { color: '#555', margin: '0 0 0.25rem 0', fontSize: '0.9rem' },
  details: { color: '#888', margin: 0, fontSize: '0.85rem' },
  statusBadge: { color: 'white', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600' },
  approvalBadge: { color: 'white', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600' },
  desc: { color: '#666', fontSize: '0.9rem', marginBottom: '0.75rem' },
  skills: { display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' },
  skill: { backgroundColor: '#f0f2f5', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem' },
  actions: { display: 'flex', gap: '0.75rem' },
  approveBtn: { padding: '0.6rem 1.25rem', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  rejectBtn: { padding: '0.6rem 1.25rem', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  revokeBtn: { padding: '0.6rem 1.25rem', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
};