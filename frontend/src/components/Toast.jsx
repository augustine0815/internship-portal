import { useState, useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: { bg: '#2ecc71', icon: '✅' },
    error: { bg: '#e74c3c', icon: '❌' },
    info: { bg: '#3498db', icon: 'ℹ️' },
    warning: { bg: '#f39c12', icon: '⚠️' },
  };

  const { bg, icon } = colors[type] || colors.info;

  return (
    <div style={{ ...styles.toast, backgroundColor: bg }}>
      <span style={styles.icon}>{icon}</span>
      <span style={styles.message}>{message}</span>
      <button style={styles.close} onClick={onClose}>✕</button>
    </div>
  );
};

const styles = {
  toast: {
    position: 'fixed',
    bottom: '2rem',
    right: '2rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem 1.5rem',
    borderRadius: '10px',
    color: 'white',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    zIndex: 9999,
    minWidth: '300px',
    maxWidth: '450px',
    animation: 'slideIn 0.3s ease',
  },
  icon: { fontSize: '1.2rem' },
  message: { flex: 1, fontSize: '0.95rem', fontWeight: '500' },
  close: {
    background: 'none',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    fontSize: '1rem',
    padding: 0,
    opacity: 0.8,
  },
};

export default Toast;