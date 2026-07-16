import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getLinks = () => {
    if (!user) return null;

    if (user.role === 'student') return (
      <>
        <Link to="/student/internships">Browse</Link>
        <Link to="/student/applications">My Applications</Link>
        <Link to="/student/offers">My Offers</Link>
        <Link to="/student/chat">Chat</Link>
      </>
    );

    if (user.role === 'company') return (
      <>
        <Link to="/company/internships">My Postings</Link>
        <Link to="/company/post">Post Internship</Link>
        <Link to="/company/chat">Chat</Link>
      </>
    );

    if (user.role === 'admin') return (
      <>
        <Link to="/admin/dashboard">Dashboard</Link>
        <Link to="/admin/users">Users</Link>
        <Link to="/admin/internships">Internships</Link>
      </>
    );
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>🎓 Internship Portal</Link>
      <div style={styles.links}>
        {getLinks()}
        {user && (
          <button onClick={handleLogout} style={styles.logout}>
            Logout ({user.email})
          </button>
        )}
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#1a1a2e',
    color: 'white',
  },
  brand: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '1.3rem',
    fontWeight: 'bold',
  },
  links: {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'center',
  },
  logout: {
    background: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '0.4rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default Navbar;