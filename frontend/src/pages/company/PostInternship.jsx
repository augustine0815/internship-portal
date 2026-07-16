import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createInternship } from '../../services/api';

const PostInternship = () => {
  const [form, setForm] = useState({
    title: '', description: '', location: '', is_remote: false,
    stipend: '', duration_weeks: '', openings: 1,
    application_deadline: '', required_skills: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...form,
        stipend: parseFloat(form.stipend),
        duration_weeks: parseInt(form.duration_weeks),
        openings: parseInt(form.openings),
        required_skills: form.required_skills.split(',').map(s => s.trim()).filter(Boolean),
      };
      await createInternship(payload);
      navigate('/company/internships');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create internship');
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Post New Internship</h2>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          {[
            { label: 'Job Title', name: 'title', type: 'text', placeholder: 'Frontend Developer Intern' },
            { label: 'Location', name: 'location', type: 'text', placeholder: 'Kuching, Sarawak' },
            { label: 'Monthly Stipend (RM)', name: 'stipend', type: 'number', placeholder: '800' },
            { label: 'Duration (weeks)', name: 'duration_weeks', type: 'number', placeholder: '12' },
            { label: 'Number of Openings', name: 'openings', type: 'number', placeholder: '2' },
            { label: 'Application Deadline', name: 'application_deadline', type: 'date' },
            { label: 'Required Skills (comma separated)', name: 'required_skills', type: 'text', placeholder: 'React, JavaScript, CSS' },
          ].map(f => (
            <div key={f.name} style={styles.field}>
              <label style={styles.label}>{f.label}</label>
              <input
                style={styles.input}
                type={f.type}
                name={f.name}
                placeholder={f.placeholder}
                value={form[f.name]}
                onChange={handleChange}
                required
              />
            </div>
          ))}
          <div style={styles.field}>
            <label style={styles.label}>Description</label>
            <textarea
              style={{ ...styles.input, height: '120px', resize: 'vertical' }}
              name="description"
              placeholder="Describe the internship role..."
              value={form.description}
              onChange={handleChange}
              required
            />
          </div>
          <div style={styles.checkField}>
            <input
              type="checkbox"
              name="is_remote"
              checked={form.is_remote}
              onChange={handleChange}
              id="remote"
            />
            <label htmlFor="remote" style={{ marginLeft: '0.5rem' }}>Remote Internship</label>
          </div>
          <div style={styles.buttons}>
            <button type="button" style={styles.cancelBtn} onClick={() => navigate('/company/internships')}>
              Cancel
            </button>
            <button type="submit" style={styles.submitBtn} disabled={loading}>
              {loading ? 'Posting...' : 'Post Internship'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '2rem', display: 'flex', justifyContent: 'center' },
  card: { backgroundColor: 'white', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '100%', maxWidth: '600px' },
  title: { fontSize: '1.8rem', color: '#1a1a2e', marginBottom: '1.5rem' },
  error: { backgroundColor: '#ffe0e0', color: '#c0392b', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem' },
  field: { marginBottom: '1rem' },
  label: { display: 'block', marginBottom: '0.4rem', fontWeight: '600', color: '#333' },
  input: { width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem', boxSizing: 'border-box' },
  checkField: { display: 'flex', alignItems: 'center', marginBottom: '1.5rem' },
  buttons: { display: 'flex', gap: '1rem', justifyContent: 'flex-end' },
  cancelBtn: { padding: '0.75rem 1.5rem', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  submitBtn: { padding: '0.75rem 1.5rem', backgroundColor: '#1a1a2e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
};

export default PostInternship;