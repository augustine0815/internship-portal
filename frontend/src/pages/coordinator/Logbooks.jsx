import { useState, useEffect } from 'react';
import { getCoordinatorLogbooks, reviewLogbookCoordinator } from '../../services/api';

const statusColors = { submitted: '#3498db', reviewed: '#2ecc71' };

export default function CoordinatorLogbooks() {
  const [logbooks, setLogbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => { fetchLogbooks(); }, []);

  const fetchLogbooks = async () => {
    try {
      const res = await getCoordinatorLogbooks();
      setLogbooks(res.data.logbooks);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleReview = async () => {
    try {
      await reviewLogbookCoordinator(selected.id, { reviewer_comment: comment });
      setMessage('Logbook reviewed!');
      setSelected(null);
      setComment('');
      fetchLogbooks();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { setMessage('Failed to review'); }
  };

  const handleDownload = (logbook) => {
    const content = `
INTERNSHIP LOGBOOK
==================
Student: ${logbook.student?.full_name}
University: ${logbook.student?.university}
Date: ${logbook.date}
Title: ${logbook.title}

NOTES:
${logbook.notes}

LOGBOOK CONTENT:
${logbook.final_content || logbook.ai_generated_content}

PHOTOS:
${(logbook.photo_urls && logbook.photo_urls.length > 0) ? logbook.photo_urls.join('\n') : 'No photos uploaded'}

${logbook.reviewer_comment ? `REVIEWER COMMENT:\n${logbook.reviewer_comment}` : ''}
    `;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logbook_${logbook.student?.full_name}_${logbook.date}.txt`;
    a.click();
  };

  const filteredLogbooks = logbooks.filter(log => {
    const matchesSearch = (log.student?.full_name || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>📔 Student Logbooks</h2>

      {message && <div style={styles.message}>{message}</div>}

      <div style={styles.stats}>
        <div
          style={{ ...styles.stat, cursor: 'pointer', outline: statusFilter === 'submitted' ? '2px solid #3498db' : 'none' }}
          onClick={() => setStatusFilter(statusFilter === 'submitted' ? 'all' : 'submitted')}
        >
          <span style={styles.statNum}>{logbooks.filter(l => l.status === 'submitted').length}</span>
          <span style={styles.statLabel}>Pending Review</span>
        </div>
        <div
          style={{ ...styles.stat, cursor: 'pointer', outline: statusFilter === 'reviewed' ? '2px solid #2ecc71' : 'none' }}
          onClick={() => setStatusFilter(statusFilter === 'reviewed' ? 'all' : 'reviewed')}
        >
          <span style={{ ...styles.statNum, color: '#2ecc71' }}>{logbooks.filter(l => l.status === 'reviewed').length}</span>
          <span style={styles.statLabel}>Reviewed</span>
        </div>
        <div
          style={{ ...styles.stat, cursor: 'pointer', outline: statusFilter === 'all' ? '2px solid #1a1a2e' : 'none' }}
          onClick={() => setStatusFilter('all')}
        >
          <span style={styles.statNum}>{logbooks.length}</span>
          <span style={styles.statLabel}>Total</span>
        </div>
      </div>

      <div style={styles.filterBar}>
        <input
          type="text"
          style={styles.searchInput}
          placeholder="🔍 Search by student name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          style={styles.filterSelect}
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="submitted">Pending Review</option>
          <option value="reviewed">Reviewed</option>
        </select>
        {(search || statusFilter !== 'all') && (
          <button style={styles.clearFilterBtn} onClick={() => { setSearch(''); setStatusFilter('all'); }}>
            Clear
          </button>
        )}
      </div>

      {loading ? <p>Loading...</p> : (
        <div style={styles.grid}>
          <div style={styles.list}>
            {filteredLogbooks.length === 0 ? (
              <p style={styles.empty}>No logbooks match your search/filter.</p>
            ) : filteredLogbooks.map(log => (
              <div
                key={log.id}
                style={{ ...styles.card, border: selected?.id === log.id ? '2px solid #1a1a2e' : '1px solid #eee' }}
                onClick={() => { setSelected(log); setComment(''); }}
              >
                <div style={styles.cardTop}>
                  <div>
                    <p style={styles.studentName}>{log.student?.full_name}</p>
                    <p style={styles.studentUni}>{log.student?.university}</p>
                  </div>
                  <span style={{ ...styles.badge, backgroundColor: statusColors[log.status] }}>
                    {log.status}
                  </span>
                </div>
                <p style={styles.logTitle}>{log.title}</p>
                <p style={styles.logDate}>📅 {new Date(log.date).toLocaleDateString()}</p>
              </div>
            ))}
          </div>

          {selected && (
            <div style={styles.detail}>
              <div style={styles.detailHeader}>
                <div>
                  <h3 style={styles.detailTitle}>{selected.title}</h3>
                  <p style={styles.detailMeta}>
                    👤 {selected.student?.full_name} • 📅 {new Date(selected.date).toLocaleDateString()}
                  </p>
                </div>
                <button style={styles.downloadBtn} onClick={() => handleDownload(selected)}>
                  ⬇️ Download
                </button>
              </div>

              <div style={styles.section}>
                <h4 style={styles.sectionTitle}>📝 Student Notes</h4>
                <p style={styles.contentText}>{selected.notes || 'No notes'}</p>
              </div>

              <div style={styles.section}>
                <h4 style={styles.sectionTitle}>📄 Logbook Content</h4>
                <div style={styles.contentBox}>
                  {(selected.final_content || 'No content').split('\n').map((p, i) => (
                    p ? <p key={i} style={styles.contentPara}>{p}</p> : <br key={i} />
                  ))}
                </div>
              </div>

              <div style={styles.section}>
                <h4 style={styles.sectionTitle}>📷 Photos</h4>
                {(selected.photo_urls || []).length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                    {selected.photo_urls.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt={`Photo ${i + 1}`}
                        style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer' }}
                        onClick={() => window.open(url, '_blank')}
                      />
                    ))}
                  </div>
                ) : (
                  <p style={styles.contentText}>No photos uploaded</p>
                )}
              </div>

              {selected.status === 'submitted' && (
                <div style={styles.reviewSection}>
                  <h4 style={styles.sectionTitle}>💬 Add Review Comment</h4>
                  <textarea
                    style={styles.commentInput}
                    placeholder="Add your feedback..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                  />
                  <button style={styles.reviewBtn} onClick={handleReview}>
                    ✅ Mark as Reviewed
                  </button>
                </div>
              )}

              {selected.reviewer_comment && (
                <div style={{ ...styles.section, borderLeft: '4px solid #2ecc71', paddingLeft: '1rem' }}>
                  <h4 style={styles.sectionTitle}>💬 Your Review</h4>
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
  heading: { fontSize: '1.8rem', color: '#1a1a2e', marginBottom: '1rem' },
  message: { padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', backgroundColor: '#e8f5e9', color: '#2e7d32' },
  stats: { display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' },
  stat: { backgroundColor: 'white', borderRadius: '10px', padding: '1rem 2rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  filterBar: { display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' },
  searchInput: { flex: 1, padding: '0.7rem 1rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.9rem', color: '#1a1a2e' },
  filterSelect: { padding: '0.7rem 1rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.9rem', color: '#1a1a2e', backgroundColor: 'white' },
  clearFilterBtn: { padding: '0.7rem 1.2rem', borderRadius: '8px', border: 'none', backgroundColor: '#95a5a6', color: 'white', cursor: 'pointer', fontWeight: '600' },
  statNum: { fontSize: '1.8rem', fontWeight: 'bold', color: '#1a1a2e' },
  statLabel: { fontSize: '0.8rem', color: '#888' },
  grid: { display: 'grid', gridTemplateColumns: '350px 1fr', gap: '1.5rem' },
  list: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  card: { backgroundColor: 'white', borderRadius: '10px', padding: '1rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' },
  studentName: { fontWeight: '700', color: '#1a1a2e', margin: 0, fontSize: '0.95rem' },
  studentUni: { color: '#888', fontSize: '0.8rem', margin: '0.2rem 0 0 0' },
  badge: { color: 'white', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600' },
  logTitle: { color: '#333', fontSize: '0.9rem', margin: '0 0 0.25rem 0' },
  logDate: { color: '#888', fontSize: '0.8rem', margin: 0 },
  empty: { textAlign: 'center', color: '#888' },
  detail: { backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
  detailHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #eee' },
  detailTitle: { fontSize: '1.2rem', color: '#1a1a2e', margin: '0 0 0.25rem 0' },
  detailMeta: { color: '#666', fontSize: '0.85rem', margin: 0 },
  downloadBtn: { padding: '0.5rem 1rem', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  section: { marginBottom: '1.5rem' },
  sectionTitle: { fontSize: '0.95rem', fontWeight: '700', color: '#1a1a2e', marginBottom: '0.5rem' },
  contentText: { color: '#555', lineHeight: '1.6', whiteSpace: 'pre-wrap' },
  contentBox: { backgroundColor: '#f8f9fa', borderRadius: '8px', padding: '1rem', maxHeight: '250px', overflowY: 'auto' },
  contentPara: { marginBottom: '0.75rem', lineHeight: '1.7', color: '#333' },
  reviewSection: { borderTop: '1px solid #eee', paddingTop: '1rem' },
  commentInput: { width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', height: '100px', resize: 'vertical', marginBottom: '0.75rem', boxSizing: 'border-box' },
  reviewBtn: { padding: '0.75rem 1.5rem', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
};