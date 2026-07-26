import { useState, useEffect } from 'react';
import { getAllLogbooksAdmin, reviewLogbook } from '../../services/api';

const statusColors = {
  submitted: '#3498db',
  reviewed: '#2ecc71',
};

export default function LogbookReview() {
  const [logbooks, setLogbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => { fetchLogbooks(); }, []);

  const fetchLogbooks = async () => {
    try {
      const res = await getAllLogbooksAdmin();
      setLogbooks(res.data.logbooks);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleReview = async (id) => {
    try {
      await reviewLogbook(id, { reviewer_comment: comment });
      setMessage('Logbook reviewed successfully!');
      setSelected(null);
      setComment('');
      fetchLogbooks();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to review');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>📔 Student Logbooks</h2>

      {message && <div style={styles.message}>{message}</div>}

      {/* Summary Stats */}
      <div style={styles.stats}>
        <div style={styles.statCard}>
          <p style={styles.statNum}>{logbooks.length}</p>
          <p style={styles.statLabel}>Total Submitted</p>
        </div>
        <div style={styles.statCard}>
          <p style={{ ...styles.statNum, color: '#3498db' }}>
            {logbooks.filter(l => l.status === 'submitted').length}
          </p>
          <p style={styles.statLabel}>Pending Review</p>
        </div>
        <div style={styles.statCard}>
          <p style={{ ...styles.statNum, color: '#2ecc71' }}>
            {logbooks.filter(l => l.status === 'reviewed').length}
          </p>
          <p style={styles.statLabel}>Reviewed</p>
        </div>
      </div>

      {loading ? <p>Loading...</p> : (
        <div style={styles.grid}>
          {/* List */}
          <div style={styles.list}>
            {logbooks.length === 0 ? (
              <p style={styles.empty}>No submitted logbooks yet.</p>
            ) : logbooks.map(log => (
              <div
                key={log.id}
                style={{
                  ...styles.card,
                  border: selected?.id === log.id ? '2px solid #1a1a2e' : '1px solid #eee',
                }}
                onClick={() => { setSelected(log); setComment(''); }}
              >
                <div style={styles.cardTop}>
                  <div>
                    <p style={styles.studentName}>
                      👤 {log.student?.full_name || 'Student'}
                    </p>
                    <p style={styles.studentUni}>{log.student?.university}</p>
                  </div>
                  <span style={{ ...styles.badge, backgroundColor: statusColors[log.status] }}>
                    {log.status}
                  </span>
                </div>
                <p style={styles.logTitle}>{log.title}</p>
                <p style={styles.logDate}>
                  📅 {new Date(log.date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>

          {/* Detail */}
          {selected && (
            <div style={styles.detail}>
              <div style={styles.detailHeader}>
                <h3 style={styles.detailTitle}>{selected.title}</h3>
                <span style={{ ...styles.badge, backgroundColor: statusColors[selected.status] }}>
                  {selected.status}
                </span>
              </div>

              <p style={styles.detailMeta}>
                👤 {selected.student?.full_name} •
                📅 {new Date(selected.date).toLocaleDateString()} •
                🎓 {selected.student?.university}
              </p>

              <div style={styles.section}>
                <h4 style={styles.sectionTitle}>📝 Student Notes</h4>
                <p style={styles.contentText}>{selected.notes || 'No notes'}</p>
              </div>

              <div style={styles.section}>
                <h4 style={styles.sectionTitle}>📄 Final Content</h4>
                <div style={styles.contentBox}>
                  {(selected.final_content || 'No content submitted').split('\n').map((p, i) => (
                    p ? <p key={i} style={styles.contentPara}>{p}</p> : <br key={i} />
                  ))}
                </div>
              </div>

              {(selected.photo_urls || []).length > 0 && (
                <div style={styles.section}>
                  <h4 style={styles.sectionTitle}>📷 Photos</h4>
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
                </div>
              )}

              {selected.status === 'submitted' && (
                <div style={styles.reviewSection}>
                  <h4 style={styles.sectionTitle}>💬 Add Review Comment</h4>
                  <textarea
                    style={styles.commentInput}
                    placeholder="Add your feedback or comments for the student..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                  />
                  <button
                    style={styles.reviewBtn}
                    onClick={() => handleReview(selected.id)}
                  >
                    ✅ Mark as Reviewed
                  </button>
                </div>
              )}

              {selected.reviewer_comment && (
                <div style={{ ...styles.section, borderLeft: '4px solid #2ecc71', paddingLeft: '1rem' }}>
                  <h4 style={styles.sectionTitle}>💬 Review Comment</h4>
                  <p style={{ color: '#2e7d32', fontStyle: 'italic' }}>{selected.reviewer_comment}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '2rem', maxWidth: '1200px', margin: '0 auto' },
  heading: { fontSize: '1.8rem', color: '#1a1a2e', marginBottom: '1.5rem' },
  message: { padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', backgroundColor: '#e8f5e9', color: '#2e7d32' },
  stats: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' },
  statCard: { backgroundColor: 'white', borderRadius: '10px', padding: '1.25rem', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' },
  statNum: { fontSize: '2rem', fontWeight: 'bold', color: '#1a1a2e', margin: '0 0 0.25rem 0' },
  statLabel: { color: '#666', fontSize: '0.85rem', margin: 0 },
  grid: { display: 'grid', gridTemplateColumns: '350px 1fr', gap: '1.5rem' },
  list: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  card: { backgroundColor: 'white', borderRadius: '10px', padding: '1rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' },
  studentName: { fontWeight: '700', color: '#1a1a2e', margin: 0, fontSize: '0.95rem' },
  studentUni: { color: '#888', fontSize: '0.8rem', margin: '0.2rem 0 0 0' },
  badge: { color: 'white', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600' },
  logTitle: { color: '#333', fontSize: '0.9rem', margin: '0 0 0.25rem 0' },
  logDate: { color: '#888', fontSize: '0.8rem', margin: 0 },
  empty: { textAlign: 'center', color: '#888', padding: '2rem' },
  detail: { backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', height: 'fit-content' },
  detailHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' },
  detailTitle: { fontSize: '1.3rem', color: '#1a1a2e', margin: 0 },
  detailMeta: { color: '#666', fontSize: '0.85rem', marginBottom: '1.5rem' },
  section: { marginBottom: '1.5rem' },
  sectionTitle: { fontSize: '0.95rem', fontWeight: '700', color: '#1a1a2e', marginBottom: '0.5rem' },
  contentText: { color: '#555', lineHeight: '1.6', whiteSpace: 'pre-wrap' },
  contentBox: { backgroundColor: '#f8f9fa', borderRadius: '8px', padding: '1rem', maxHeight: '300px', overflowY: 'auto' },
  contentPara: { marginBottom: '0.75rem', lineHeight: '1.7', color: '#333' },
  photoGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' },
  photo: { width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer' },
  reviewSection: { borderTop: '1px solid #eee', paddingTop: '1rem' },
  commentInput: { width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', height: '100px', resize: 'vertical', marginBottom: '0.75rem', boxSizing: 'border-box' },
  reviewBtn: { padding: '0.75rem 1.5rem', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
};