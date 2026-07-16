import { useState, useEffect } from 'react';
import { getMyOffers, respondToOffer } from '../../services/api';

const MyOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => { fetchOffers(); }, []);

  const fetchOffers = async () => {
    try {
      const res = await getMyOffers();
      setOffers(res.data.offers);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleRespond = async (offerId, decision) => {
    try {
      await respondToOffer(offerId, decision);
      setMessage(`Offer ${decision} successfully!`);
      fetchOffers();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to respond');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const statusColor = { pending: '#f39c12', accepted: '#2ecc71', declined: '#e74c3c', expired: '#95a5a6' };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>My Offers</h2>
      {message && <div style={styles.message}>{message}</div>}
      {loading ? <p>Loading...</p> : offers.length === 0 ? (
        <p style={styles.empty}>No offers yet.</p>
      ) : (
        <div style={styles.list}>
          {offers.map(offer => (
            <div key={offer.id} style={styles.card}>
              <div style={styles.cardTop}>
                <h3 style={styles.title}>{offer.internship?.title}</h3>
                <span style={{ ...styles.badge, backgroundColor: statusColor[offer.status] }}>
                  {offer.status.toUpperCase()}
                </span>
              </div>
              <p style={styles.company}>🏢 {offer.internship?.company?.company_name}</p>
              <div style={styles.details}>
                <span>💰 RM{offer.offered_stipend}/month</span>
                <span>📅 {offer.start_date} → {offer.end_date}</span>
              </div>
              {offer.status === 'pending' && (
                <div style={styles.actions}>
                  <button style={styles.acceptBtn} onClick={() => handleRespond(offer.id, 'accepted')}>
                    ✅ Accept Offer
                  </button>
                  <button style={styles.declineBtn} onClick={() => handleRespond(offer.id, 'declined')}>
                    ❌ Decline
                  </button>
                </div>
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
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' },
  title: { fontSize: '1.1rem', color: '#1a1a2e', margin: 0 },
  badge: { color: 'white', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' },
  company: { color: '#555', marginBottom: '0.75rem' },
  details: { display: 'flex', gap: '1.5rem', marginBottom: '1rem', fontSize: '0.9rem' },
  actions: { display: 'flex', gap: '1rem' },
  acceptBtn: { padding: '0.6rem 1.5rem', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' },
  declineBtn: { padding: '0.6rem 1.5rem', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
};

export default MyOffers;