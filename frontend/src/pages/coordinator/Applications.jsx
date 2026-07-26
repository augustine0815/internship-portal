import { useState, useEffect } from 'react';
import { getCoordinatorApplications } from '../../services/api';

const statusColors = {
  applied: '#3498db', under_review: '#f39c12', shortlisted: '#9b59b6',
  rejected: '#e74c3c', offered: '#2ecc71', withdrawn: '#95a5a6',
};

export default function CoordinatorApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchApplications(); }, []);

  const fetchApplications = async () => {
    try {
      const res = await getCoordinatorApplications();
      setApplications(res.data.applications);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const filtered = applications.filter(app =>
    !search ||
    app.student?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    app.internship?.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>📋 Student Applications</h2>

      <div style={styles.searchBar}>
        <input
          style={styles.input}
          type="text"
          placeholder="Search by student name or internship title..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <span style={styles.count}>{filtered.length} applications</span>
      </div>

      {/* Summary */}
      <div style={styles.summary}>
        {['applied', 'shortlisted', 'offered', 'rejected'].map(status => (
          <div key={status} style={styles.summaryCard}>
            <span style={{ ...styles.summaryDot, backgroundColor: statusColors[status] }} />
            <span style={styles.summaryCount}>
              {applications.filter(a => a.status === status).length}
            </span>
            <span style={styles.summaryLabel}>{status}</span>
          </div>
        ))}
      </div>

      {loading ? <p>Loading...</p> : (
        <div style={styles.table}>
          <div style={styles.tableHeader}>
            <span style={styles.th}>Student</span>
            <span style={styles.th}>Internship</span>
            <span style={styles.th}>Company</span>
            <span style={styles.th}>Status</span>
            <span style={styles.th}>Applied</span>
          </div>
          {filtered.map(app => (
            <div key={app.id} style={styles.tableRow}>
              <span style={styles.td}>
                <strong>{app.student?.full_name || 'N/A'}</strong>
                <br />
                <small style={{ color: '#888' }}>{app.student?.university}</small>
              </span>
              <span style={styles.td}>{app.internship?.title}</span>
              <span style={styles.td}>{app.internship?.company?.company_name}</span>
              <span style={styles.td}>
                <span style={{ ...styles.badge, backgroundColor: statusColors[app.status] }}>
                  {app.status.replace('_', ' ')}
                </span>
              </span>
              <span style={styles.td}>
                {new Date(app.applied_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '2rem', maxWidth: '1100px', margin: '0 auto' },
  heading: { fontSize: '1.8rem', color: '#1a1a2e', marginBottom: '1.5rem' },
  searchBar: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' },
  input: { flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' },
  count: { color: '#666', fontSize: '0.9rem', whiteSpace: 'nowrap' },
  summary: { display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
  summaryCard: { backgroundColor: 'white', borderRadius: '8px', padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' },
  summaryDot: { width: '10px', height: '10px', borderRadius: '50%' },
  summaryCount: { fontWeight: 'bold', fontSize: '1.1rem', color: '#1a1a2e' },
  summaryLabel: { color: '#666', fontSize: '0.85rem', textTransform: 'capitalize' },
  table: { backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
  tableHeader: { display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1fr', padding: '1rem 1.5rem', backgroundColor: '#1a1a2e', color: 'white', gap: '1rem' },
  th: { fontSize: '0.85rem', fontWeight: '600' },
  tableRow: { display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1fr', padding: '1rem 1.5rem', borderBottom: '1px solid #f0f0f0', alignItems: 'center', gap: '1rem' },
  td: { fontSize: '0.9rem', color: '#333' },
  badge: { color: 'white', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', textTransform: 'capitalize' },
};