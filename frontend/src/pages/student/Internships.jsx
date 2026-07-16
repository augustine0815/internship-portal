import { useState, useEffect } from 'react';
import { getInternships, applyToInternship } from '../../services/api';

const Internships = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [applying, setApplying] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async (params = {}) => {
    try {
      const res = await getInternships(params);
      setInternships(res.data.internships);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchInternships({ search });
  };

  const handleApply = async (id) => {
    setApplying(id);
    try {
      await applyToInternship(id, { cover_letter: 'I am interested in this position.' });
      setMessage('Application submitted successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to apply');
      setTimeout(() => setMessage(''), 3000);
    }
    setApplying(null);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Browse Internships</h2>

      {message && <div style={styles.message}>{message}</div>}

      <form onSubmit={handleSearch} style={styles.searchBar}>
        <input
          style={styles.searchInput}
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button style={styles.searchBtn} type="submit">Search</button>
        <button style={styles.clearBtn} type="button" onClick={() => { setSearch(''); fetchInternships(); }}>
          Clear
        </button>
      </form>

      {loading ? (
        <p>Loading internships...</p>
      ) : internships.length === 0 ? (
        <p style={styles.empty}>No internships found.</p>
      ) : (
        <div style={styles.grid}>
          {internships.map(i => (
            <div key={i.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.title}>{i.title}</h3>
                <span style={styles.badge}>{i.is_remote ? '🌐 Remote' : '📍 ' + i.location}</span>
              </div>
              <p style={styles.company}>🏢 {i.company?.company_name}</p>
              <p style={styles.desc}>{i.description?.slice(0, 120)}...</p>
              <div style={styles.details}>
                <span>💰 RM{i.stipend}/month</span>
                <span>⏱ {i.duration_weeks} weeks</span>
                <span>👥 {i.openings} openings</span>
              </div>
              <div style={styles.skills}>
                {(i.required_skills || []).map(s => (
                  <span key={s} style={styles.skill}>{s}</span>
                ))}
              </div>
              <button
                style={styles.applyBtn}
                onClick={() => handleApply(i.id)}
                disabled={applying === i.id}
              >
                {applying === i.id ? 'Applying...' : 'Apply Now'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { padding: '2rem', maxWidth: '1100px', margin: '0 auto' },
  heading: { fontSize: '1.8rem', marginBottom: '1.5rem', color: '#1a1a2e' },
  message: {
    padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem',
    backgroundColor: '#e8f5e9', color: '#2e7d32', textAlign: 'center',
  },
  searchBar: { display: 'flex', gap: '0.75rem', marginBottom: '2rem' },
  searchInput: {
    flex: 1, padding: '0.75rem', borderRadius: '6px',
    border: '1px solid #ddd', fontSize: '1rem',
  },
  searchBtn: {
    padding: '0.75rem 1.5rem', backgroundColor: '#1a1a2e',
    color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer',
  },
  clearBtn: {
    padding: '0.75rem 1.5rem', backgroundColor: '#95a5a6',
    color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer',
  },
  empty: { textAlign: 'center', color: '#666', marginTop: '3rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' },
  card: {
    backgroundColor: 'white', borderRadius: '10px',
    padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' },
  title: { fontSize: '1.1rem', color: '#1a1a2e', margin: 0 },
  badge: { fontSize: '0.8rem', backgroundColor: '#e8f0fe', padding: '0.2rem 0.6rem', borderRadius: '20px' },
  company: { color: '#555', marginBottom: '0.75rem' },
  desc: { color: '#666', fontSize: '0.9rem', marginBottom: '1rem' },
  details: { display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem', fontSize: '0.85rem' },
  skills: { display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' },
  skill: { backgroundColor: '#f0f2f5', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem' },
  applyBtn: {
    width: '100%', padding: '0.75rem', backgroundColor: '#2ecc71',
    color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600',
  },
};

export default Internships;