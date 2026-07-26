import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await loginUser(form);
      login(res.data.user, res.data.token);
      const role = res.data.user.role;
      if (role === 'student') navigate('/student/internships');
      else if (role === 'company') navigate('/company/internships');
      else if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'coordinator') navigate('/coordinator/dashboard');

    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>🎓 Welcome Back</h2>
        <p style={styles.subtitle}>Sign in to your account</p>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              name="email"
              placeholder="you@email.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p style={styles.footer}>
  Don't have an account?{' '}
  <Link to="/register" style={{ color: '#3498db', fontWeight: '600' }}>
    Register here
  </Link>
</p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f2f5',
  },
  card: {
    backgroundColor: 'white',
    padding: '2.5rem',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '420px',
  },
  title: {
    textAlign: 'center',
    marginBottom: '0.5rem',
    color: '#1a1a2e',
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: '1.5rem',
  },
  error: {
    backgroundColor: '#ffe0e0',
    color: '#c0392b',
    padding: '0.75rem',
    borderRadius: '6px',
    marginBottom: '1rem',
    textAlign: 'center',
  },
  field: { marginBottom: '1rem' },
  label: {
    display: 'block',
    marginBottom: '0.4rem',
    fontWeight: '600',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '1rem',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '0.85rem',
    backgroundColor: '#1a1a2e',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
  footer: {
    textAlign: 'center',
    marginTop: '1.5rem',
    color: '#666',
  },
};

export default Login;