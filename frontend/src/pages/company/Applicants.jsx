import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getApplicants, updateApplicationStatus, createOffer } from '../../services/api';

const Applicants = () => {
  const { id } = useParams();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [offerForm, setOfferForm] = useState({ applicationId: null, stipend: '', start_date: '', end_date: '' });

  useEffect(() => { fetchApplicants(); }, []);

  const fetchApplicants = async () => {
    try {
      const res = await getApplicants(id);
      setApplicants(res.data.applications);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleStatus = async (appId, status) => {
    try {
      await updateApplicationStatus(appId, status);
      setMessage('Status updated!');
      fetchApplicants();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { setMessage('Failed to update'); }
  };

  const handleOffer = async (e) => {
    e.preventDefault();
    try {
      await createOffer(offerForm.applicationId, {
        offered_stipend: parseFloat(offerForm.stipend),
        start_date: offerForm.start_date,
        end_date: offerForm.end_date,
      });
      setMessage('Offer sent successfully!');
      setOfferForm({ applicationId: null, stipend: '', start_date: '', end_date: '' });
      fetchApplicants();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { setMessage(err.response?.data?.message || 'Failed to send offer'); }
  };

  const statusColor = { applied: '#3498db', under_review: '#f39c12', shortlisted: '#9b59b6', rejected: '#e74c3c', offered: '#2ecc71', withdrawn: '#95a5a6' };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Applicants</h2>
      {message && <div style={styles.message}>{message}</div>}
      {offerForm.applicationId && (
        <div style={styles.offerModal}>
          <h3>Send Offer</h3>
          <form onSubmit={handleOffer}>
            <input style={styles.input} type="number" placeholder="Stipend (RM)" value={offerForm.stipend} onChange={e => setOfferForm({ ...offerForm, stipend: e.target.value })} required />
            <input style={styles.input} type="date" value={offerForm.start_date} onChange={e => setOfferForm({ ...offerForm, start_date: e.target.value })} required />
            <input style={styles.input} type="date" value={offerForm.end_date} onChange={e => setOfferForm({ ...offerForm, end_date: e.target.value })} required />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button type="submit" style={styles.offerBtn}>Send Offer</button>
              <button type="button" style={styles.cancelBtn} onClick={() => setOfferForm({ applicationId: null, stipend: '', start_date: '', end_date: '' })}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      {loading ? <p>Loading...</p> : applicants.length === 0 ? (
        <p style={styles.empty}>No applicants yet.</p>
      ) : (
        <div style={styles.list}>
          {applicants.map(app => (
            <div key={app.id} style={styles.card}>
              <div style={styles.cardTop}>
                <div>
                  <h3 style={styles.name}>{app.student?.full_name || 'Student'}</h3>
                  <p style={styles.sub}>🎓 {app.student?.university} | {app.student?.degree}</p>
                  <div style={styles.skills}>
                    {(app.student?.skills || []).map(s => <span key={s} style={styles.skill}>{s}</span>)}
                  </div>
                </div>
                <span style={{ ...styles.badge, backgroundColor: statusColor[app.status] }}>
                  {app.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <div style={styles.actions}>
                <button style={styles.reviewBtn} onClick={() => handleStatus(app.id, 'under_review')}>Under Review</button>
                <button style={styles.shortlistBtn} onClick={() => handleStatus(app.id, 'shortlisted')}>Shortlist</button>
                <button style={styles.rejectBtn} onClick={() => handleStatus(app.id, 'rejected')}>Reject</button>
                {app.status === 'shortlisted' && (
                  <button style={styles.offerBtn} onClick={() => setOfferForm({ ...offerForm, applicationId: app.id })}>Send Offer</button>
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
  container: { padding: '2rem', maxWidth: '900px', margin: '0 auto' },
  heading: { fontSize: '1.8rem', color: '#1a1a2e', marginBottom: '1.5rem' },
  message: { padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', backgroundColor: '#e8f5e9', color: '#2e7d32' },
  offerModal: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '10px', marginBottom: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
  input: { width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd', marginBottom: '0.5rem', boxSizing: 'border-box' },
  empty: { textAlign: 'center', color: '#666' },
  list: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  card: { backgroundColor: 'white', borderRadius: '10px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
  cardTop: { display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' },
  name: { margin: '0 0 0.25rem 0', color: '#1a1a2e' },
  sub: { color: '#555', fontSize: '0.9rem', margin: '0 0 0.5rem 0' },
  skills: { display: 'flex', flexWrap: 'wrap', gap: '0.3rem' },
  skill: { backgroundColor: '#f0f2f5', padding: '0.2rem 0.5rem', borderRadius: '20px', fontSize: '0.75rem' },
  badge: { color: 'white', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', height: 'fit-content' },
  actions: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  reviewBtn: { padding: '0.4rem 0.8rem', backgroundColor: '#f39c12', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
  shortlistBtn: { padding: '0.4rem 0.8rem', backgroundColor: '#9b59b6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
  rejectBtn: { padding: '0.4rem 0.8rem', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
  offerBtn: { padding: '0.4rem 0.8rem', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
  cancelBtn: { padding: '0.4rem 0.8rem', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
};

export default Applicants;