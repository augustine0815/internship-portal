import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    close();
  };

  const getLinks = () => {
    if (!user) return null;

    if (user.role === 'student') return (
      <>
        <Link to="/student/internships" style={styles.link} onClick={close}>Browse</Link>
        <Link to="/student/applications" style={styles.link} onClick={close}>My Applications</Link>
        <Link to="/student/offers" style={styles.link} onClick={close}>My Offers</Link>
        <Link to="/student/chat" style={styles.link} onClick={close}>Chat</Link>
        <Link to="/student/logbook" style={styles.link} onClick={close}>📔 Logbook</Link>
        <Link to="/student/grades" style={styles.link} onClick={close}>📊 My Grades</Link>
        <Link to="/student/profile" style={styles.link} onClick={close}>My Profile</Link>
      </>
    );

    if (user.role === 'company') return (
      <>
        <Link to="/company/internships" style={styles.link} onClick={close}>My Postings</Link>
        <Link to="/company/post" style={styles.link} onClick={close}>Post Internship</Link>
        <Link to="/company/offers" style={styles.link} onClick={close}>💼 Offers &amp; Hired</Link>
        <Link to="/company/chat" style={styles.link} onClick={close}>Chat</Link>
      </>
    );

    if (user.role === 'admin') return (
      <>
        <Link to="/admin/dashboard" style={styles.link} onClick={close}>Dashboard</Link>
        <Link to="/admin/users" style={styles.link} onClick={close}>Users</Link>
      </>
    );

    if (user.role === 'coordinator') return (
      <>
        <Link to="/coordinator/dashboard" style={styles.link} onClick={close}>Dashboard</Link>
        <Link to="/coordinator/students" style={styles.link} onClick={close}>👨‍🎓 Students</Link>
        <Link to="/coordinator/applications" style={styles.link} onClick={close}>📋 Applications</Link>
        <Link to="/coordinator/logbooks" style={styles.link} onClick={close}>📔 Logbooks</Link>
        <Link to="/coordinator/grades" style={styles.link} onClick={close}>📊 Grades</Link>
        <Link to="/coordinator/internships" style={styles.link} onClick={close}>💼 Internships</Link>
        <Link to="/coordinator/chat" style={styles.link} onClick={close}>💬 Chat</Link>
      </>
    );

    return null;
  };

  return (
    <>
      <button className="sidebar-toggle" onClick={() => setOpen(!open)} aria-label="Toggle menu">
        ☰
      </button>

      <div className={`sidebar-overlay${open ? ' open' : ''}`} onClick={close} />

      <nav className={`sidebar${open ? ' open' : ''}`}>
        <Link to="/" style={styles.brand} onClick={close}>🎓 Internship Portal</Link>
        <div className="sidebar-links">
          {getLinks()}
        </div>
        {user && (
          <div className="sidebar-bottom">
            <NotificationBell />
            <button onClick={handleLogout} style={styles.logout}>
              Logout ({user.email})
            </button>
          </div>
        )}
      </nav>
    </>
  );
};

const styles = {
  brand: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    marginBottom: '2rem',
    display: 'block',
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    padding: '0.6rem 0.75rem',
    borderRadius: '6px',
    display: 'block',
  },
  logout: {
    background: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '0.6rem 0.75rem',
    borderRadius: '6px',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
  },
};

export default Navbar;