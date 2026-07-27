import { useState, useEffect } from 'react';
import { getCompanyOffers } from '../../services/api';

const statusColor = { pending: '#f39c12', accepted: '#2ecc71', declined: '#e74c3c' };
const statusLabel = { pending: 'Pending Response', accepted: '✅ Hired', declined: 'Declined' };

export default function CompanyOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    getCompanyOffers()
      .then(res => setOffers(res.data.offers))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? offers : offers.filter(o => o.status === filter);
  const hiredCount = offers.filter(o => o.status === 'accepted').length;

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>💼 Offers &amp; Hired Students</h2>

      <div style={styles.stats}>
        <div style={styles.stat}>
          <span style={styles.statNum}>{offers.length}</span>
          <span style={styles.statLabel}>Total Offers</span>
        </div>
        <div style={styles.stat}>
          <span style={{ ...styles.statNum, color: '#2ecc71' }}>{hiredCount}</span>
          <span style={styles.statLabel}>Students Hired</span>
        </div>
        <div style={styles.stat}>
          <span style={{ ...styles.statNum, color: '#f39c12' }}>{offers.filter(o => o.status === 'pending').length}</span>
          <span style={styles.statLabel}>Awaiting Response</span>
        </div>
      </div>

      <div style={styles.filterBar}>
        {['all', 'pending', 'accepted', 'declined'].map(f => (
          <button
            key={f}
            style={{ ...styles.filterBtn, ...(filter === f ? styles.filterBtnActive : {}) }}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : statusLabel[f] || f}
          </button>
        ))}
      </div>

      {loading ? <p>Loading...</p> : filtered.length === 0 ? (
        <p style={styles.empty}>No offers found for this filter.</p>
      ) : (
        <div style={styles.list}>
          {filtered.map(offer => (
            <div key={offer.id} style={styles.card}>
              <div style={styles.cardLeft}>
                <h4 style={styles.studentName}>{offer.student?.full_name || 'Unknown Student'}</h4>
                <p style={styles.university}>{offer.student?.university}</p>
                <p style={styles.internshipTitle}>📌 {offer.internship_title}</p>
                <p style={styles.details}>
                  RM{offer.offered_stipend}/month · {offer.start_date} to {offer.end_date}
                </p>
              </div>
              <span style={{ ...styles.badge, backgroundColor: statusColor[offer.status] }}>
                {statusLabel[offer.status] || offer.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '2rem', maxWidth: '900px', margin: '0 auto' },
  heading: { fontSize: '1.8rem', color: '#1a1a2e', marginBottom: '1.5rem' },
  stats: { display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' },
  stat: { backgroundColor: 'white', borderRadius: '10px', padding: '1rem 2rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  statNum: { fontSize: '1.6rem', fontWeight: '700', color: '#1a1a2e' },
  statLabel: { fontSize: '0.8rem', color: '#888' },
  filterBar: { display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' },
  filterBtn: { padding: '0.5rem 1.1rem', borderRadius: '20px', border: '1px solid #ddd', backgroundColor: 'white', color: '#333', cursor: 'pointer', fontSize: '0.85rem' },
  filterBtnActive: { backgroundColor: '#1a1a2e', color: 'white', border: '1px solid #1a1a2e' },
  empty: { color: '#888', textAlign: 'center', padding: '3rem' },
  list: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  card: { backgroundColor: 'white', borderRadius: '12px', padding: '1.25rem 1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' },
  cardLeft: { flex: 1, minWidth: '200px' },
  studentName: { margin: 0, fontSize: '1.1rem', color: '#1a1a2e' },
  university: { margin: '0.2rem 0', color: '#888', fontSize: '0.85rem' },
  internshipTitle: { margin: '0.4rem 0 0.2rem', color: '#333', fontWeight: '600' },
  details: { margin: 0, color: '#666', fontSize: '0.85rem' },
  badge: { color: 'white', padding: '0.4rem 0.9rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600', whiteSpace: 'nowrap' },
};