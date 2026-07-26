import { useState, useEffect } from 'react';
import { gradeStudent, getAllGrades, getCoordinatorStudents } from '../../services/api';

const gradeColors = {
  'A+': '#2ecc71', 'A': '#27ae60', 'B+': '#3498db', 'B': '#2980b9',
  'C+': '#f39c12', 'C': '#e67e22', 'D': '#e74c3c', 'F': '#c0392b',
};

export default function CoordinatorGrades() {
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    student_id: '',
    performance_score: '',
    attitude_score: '',
    technical_score: '',
    comments: '',
  });

  useEffect(() => {
    fetchGrades();
    fetchStudents();
  }, []);

  const fetchGrades = async () => {
    try {
      const res = await getAllGrades();
      setGrades(res.data.grades);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const fetchStudents = async () => {
    try {
      const res = await getCoordinatorStudents({ limit: 100 });
      setStudents(res.data.students);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        student_id: parseInt(form.student_id),
        performance_score: parseInt(form.performance_score),
        attitude_score: parseInt(form.attitude_score),
        technical_score: parseInt(form.technical_score),
      };
      await gradeStudent(payload);
      setMessage('Grade saved successfully!');
      setShowForm(false);
      setForm({ student_id: '', performance_score: '', attitude_score: '', technical_score: '', comments: '' });
      fetchGrades();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to save grade');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleEdit = (grade) => {
    setForm({
      student_id: grade.student_id,
      performance_score: grade.performance_score,
      attitude_score: grade.attitude_score,
      technical_score: grade.technical_score,
      comments: grade.comments || '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const average = (g) => Math.round((g.performance_score + g.attitude_score + g.technical_score) / 3);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.heading}>📊 Student Grades</h2>
        <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Grade'}
        </button>
      </div>

      {message && <div style={styles.message}>{message}</div>}

      {showForm && (
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>{form.student_id && grades.some(g => g.student_id === form.student_id) ? 'Edit Grade' : 'Grade a Student'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={styles.field}>
              <label style={styles.label}>Select Student</label>
              <select
                style={styles.input}
                value={form.student_id}
                onChange={e => setForm({ ...form, student_id: e.target.value })}
                disabled={grades.some(g => g.student_id === form.student_id) && form.student_id !== ''}
                required
              >
                <option value="">Choose a student...</option>
                {students.filter(s => s.studentProfile?.id).map(s => (
                  <option key={s.id} value={s.studentProfile.id}>
                    {s.studentProfile.full_name || s.email}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.scoreGrid}>
              {[
                { key: 'performance_score', label: '💼 Performance (0-100)' },
                { key: 'attitude_score', label: '😊 Attitude (0-100)' },
                { key: 'technical_score', label: '🔧 Technical (0-100)' },
              ].map(f => (
                <div key={f.key} style={styles.field}>
                  <label style={styles.label}>{f.label}</label>
                  <input
                    style={styles.input}
                    type="number"
                    min="0"
                    max="100"
                    value={form[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    required
                  />
                </div>
              ))}
            </div>

            {form.performance_score && form.attitude_score && form.technical_score && (
              <div style={styles.preview}>
                Average: {Math.round((parseInt(form.performance_score) + parseInt(form.attitude_score) + parseInt(form.technical_score)) / 3)}%
              </div>
            )}

            <div style={styles.field}>
              <label style={styles.label}>💬 Comments</label>
              <textarea
                style={{ ...styles.input, height: '100px', resize: 'vertical' }}
                placeholder="Add comments about the student's performance..."
                value={form.comments}
                onChange={e => setForm({ ...form, comments: e.target.value })}
              />
            </div>

            <button type="submit" style={styles.submitBtn}>
              💾 {grades.some(g => g.student_id === form.student_id) && form.student_id !== '' ? 'Update Grade' : 'Save Grade'}
            </button>
          </form>
        </div>
      )}

      {loading ? <p>Loading...</p> : (
        <div style={styles.gradesList}>
          {grades.length === 0 ? (
            <p style={styles.empty}>No grades yet. Add your first grade!</p>
          ) : grades.map(grade => (
            <div key={grade.id} style={styles.gradeCard}>
              <div style={styles.gradeLeft}>
                <div style={{ ...styles.gradeBadge, backgroundColor: gradeColors[grade.overall_grade] || '#666' }}>
                  {grade.overall_grade}
                </div>
              </div>
              <div style={styles.gradeInfo}>
                <p style={styles.gradeName}>{grade.student?.full_name}</p>
                <p style={styles.gradeUni}>{grade.student?.university}</p>
                <div style={styles.scores}>
                  <span style={styles.score}>💼 {grade.performance_score}</span>
                  <span style={styles.score}>😊 {grade.attitude_score}</span>
                  <span style={styles.score}>🔧 {grade.technical_score}</span>
                  <span style={{ ...styles.score, fontWeight: 'bold' }}>Avg: {average(grade)}%</span>
                </div>
                {grade.comments && <p style={styles.gradeComment}>{grade.comments}</p>}
              </div>
              <div style={styles.gradeDate}>
                {new Date(grade.created_at).toLocaleDateString()}
                <button style={styles.editBtn} onClick={() => handleEdit(grade)}>
                  ✏️ Edit
                </button>
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
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  heading: { fontSize: '1.8rem', color: '#1a1a2e', margin: 0 },
  addBtn: { padding: '0.7rem 1.5rem', backgroundColor: '#1a1a2e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  message: { padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', backgroundColor: '#e8f5e9', color: '#2e7d32' },
  formCard: { backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
  formTitle: { color: '#1a1a2e', marginTop: 0, marginBottom: '1rem' },
  field: { marginBottom: '1rem' },
  label: { display: 'block', fontWeight: '600', color: '#333', marginBottom: '0.4rem', fontSize: '0.9rem' },
  input: { width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.95rem', boxSizing: 'border-box' },
  scoreGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' },
  preview: { padding: '0.75rem', backgroundColor: '#e8f0fe', borderRadius: '8px', marginBottom: '1rem', fontWeight: '600', color: '#1a1a2e', textAlign: 'center' },
  submitBtn: { padding: '0.75rem 2rem', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  gradesList: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  gradeCard: { backgroundColor: 'white', borderRadius: '10px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  gradeLeft: { flexShrink: 0 },
  gradeBadge: { width: '60px', height: '60px', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', fontWeight: 'bold' },
  gradeInfo: { flex: 1 },
  gradeName: { margin: '0 0 0.2rem 0', fontWeight: '700', color: '#1a1a2e' },
  gradeUni: { margin: '0 0 0.5rem 0', color: '#888', fontSize: '0.85rem' },
  scores: { display: 'flex', gap: '1rem', marginBottom: '0.5rem' },
  score: { fontSize: '0.85rem', color: '#555' },
  gradeComment: { margin: 0, color: '#666', fontSize: '0.85rem', fontStyle: 'italic' },
  gradeDate: { color: '#888', fontSize: '0.8rem', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' },
  editBtn: { padding: '0.4rem 0.8rem', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' },
  empty: { textAlign: 'center', color: '#888', padding: '2rem' },
};