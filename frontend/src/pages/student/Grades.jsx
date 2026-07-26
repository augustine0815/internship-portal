import { useState, useEffect } from 'react';
import { getMyGrades } from '../../services/api';

const gradeColors = {
  'A+': '#2ecc71', 'A': '#27ae60', 'B+': '#3498db', 'B': '#2980b9',
  'C+': '#f39c12', 'C': '#e67e22', 'D': '#e74c3c', 'F': '#c0392b',
};

export default function StudentGrades() {
  const [grades, setGrades] = useState([]);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchGrades(); }, []);

  const fetchGrades = async () => {
    try {
      const res = await getMyGrades();
      setGrades(res.data.grades);
      setStudent(res.data.student);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const average = (g) => Math.round((g.performance_score + g.attitude_score + g.technical_score) / 3);

  const handleDownload = (g) => {
    const content = `
INTERNSHIP PERFORMANCE REPORT
==============================
Student: ${student?.full_name || ''}
University: ${student?.university || ''}
Date Graded: ${new Date(g.created_at).toLocaleDateString()}

SCORES
------
Performance: ${g.performance_score}/100
Attitude: ${g.attitude_score}/100
Technical: ${g.technical_score}/100
Average: ${average(g)}%
Overall Grade: ${g.overall_grade}

COMMENTS
--------
${g.comments || 'No comments provided'}

Reviewed by: ${g.coordinator?.email || 'Coordinator'}
    `;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance_report_${student?.full_name || 'student'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>📊 My Grades &amp; Report</h2>

      {loading ? <p>Loading...</p> : grades.length === 0 ? (
        <div style={styles.emptyBox}>
          <p style={styles.emptyIcon}>📊</p>
          <p style={styles.emptyText}>No grades yet.</p>
          <p style={styles.emptySubtext}>Your coordinator hasn't graded your performance yet.</p>
        </div>
      ) : (
        <div style={styles.list}>
          {grades.map(g => (
            <div key={g.id} style={styles.card}>
              <div style={styles.cardTop}>
                <div>
                  <p style={styles.cardDate}>📅 Graded on {new Date(g.created_at).toLocaleDateString()}</p>
                  <span style={{ ...styles.badge, backgroundColor: gradeColors[g.overall_grade] || '#888' }}>
                    {g.overall_grade}
                  </span>
                </div>
                <button style={styles.downloadBtn} onClick={() => handleDownload(g)}>
                  ⬇️ Download Report
                </button>
              </div>

              <div style={styles.scoresGrid}>
                <div style={styles.scoreBox}>
                  <span style={styles.scoreLabel}>💼 Performance</span>
                  <span style={styles.scoreValue}>{g.performance_score}/100</span>
                </div>
                <div style={styles.scoreBox}>
                  <span style={styles.scoreLabel}>😊 Attitude</span>
                  <span style={styles.scoreValue}>{g.attitude_score}/100</span>
                </div>
                <div style={styles.scoreBox}>
                  <span style={styles.scoreLabel}>🛠️ Technical</span>
                  <span style={styles.scoreValue}>{g.technical_score}/100</span>
                </div>
              </div>

              <div style={styles.averageBox}>
                Average: <strong>{average(g)}%</strong>
              </div>

              {g.comments && (
                <div style={styles.commentsBox}>
                  <h4 style={styles.commentsTitle}>💬 Coordinator's Comments</h4>
                  <p style={styles.commentsText}>{g.comments}</p>
                </div>
              )}
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
  emptyBox: { textAlign: 'center', padding: '4rem 2rem' },
  emptyIcon: { fontSize: '4rem', marginBottom: '1rem' },
  emptyText: { fontSize: '1.2rem', color: '#555', marginBottom: '0.5rem' },
  emptySubtext: { color: '#888' },
  list: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  card: { backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' },
  cardDate: { color: '#666', fontSize: '0.9rem', margin: '0 0 0.4rem 0' },
  badge: { color: 'white', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '700' },
  downloadBtn: { padding: '0.6rem 1.1rem', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  scoresGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1rem' },
  scoreBox: { backgroundColor: '#f8f9fa', borderRadius: '8px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  scoreLabel: { fontSize: '0.8rem', color: '#888' },
  scoreValue: { fontSize: '1.2rem', fontWeight: '700', color: '#1a1a2e' },
  averageBox: { backgroundColor: '#e8f0fe', borderRadius: '8px', padding: '0.75rem 1rem', color: '#1a1a2e', marginBottom: '0.5rem' },
  commentsBox: { borderTop: '1px solid #eee', paddingTop: '1rem', marginTop: '0.5rem' },
  commentsTitle: { fontSize: '0.95rem', color: '#1a1a2e', marginBottom: '0.5rem' },
  commentsText: { color: '#555', lineHeight: '1.6', fontStyle: 'italic' },
};