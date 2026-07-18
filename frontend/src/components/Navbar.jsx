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
    <Link to="/student/internships" style={styles.link}>Browse</Link>
    <Link to="/student/applications" style={styles.link}>My Applications</Link>
    <Link to="/student/offers" style={styles.link}>My Offers</Link>
    <Link to="/student/chat" style={styles.link}>Chat</Link>
    <Link to="/student/profile" style={styles.link}>My Profile</Link>
    </>
  );

    if (user.role === 'company') return (
  <>
    <Link to="/company/internships" style={styles.link}>My Postings</Link>
    <Link to="/company/post" style={styles.link}>Post Internship</Link>
    <Link to="/company/chat" style={styles.link}>Chat</Link>
  </>
);

if (user.role === 'admin') return (
  <>
    <Link to="/admin/dashboard" style={styles.link}>Dashboard</Link>
    <Link to="/admin/users" style={styles.link}>Users</Link>
    <Link to="/admin/internships" style={styles.link}>Internships</Link>
  </>
);

    if (user.role === 'admin') return (
      <>
        <Link to="/admin/dashboard" style={styles.link}>Dashboard</Link>
        <Link to="/admin/users" style={styles.link}>Users</Link>
        <Link to="/admin/internships" style={styles.link}>Internships</Link>
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
  link: {
  color: 'white',
  textDecoration: 'none',
  padding: '0.3rem 0.6rem',
  borderRadius: '4px',
},
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