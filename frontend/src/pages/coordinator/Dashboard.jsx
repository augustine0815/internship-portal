import { useState, useEffect } from 'react';
import { getCoordinatorOverview } from '../../services/api';

export default function CoordinatorDashboard() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await getCoordinatorOverview();
        setOverview(res.data.overview);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchOverview();
  }, []);

  if (loading) return <div style={styles.loading}>Loading dashboard...</div>;

  const cards = [
    { label: 'Total Students', value: overview?.total_students, color: '#3498db', icon: '👨‍🎓' },
    { label: 'Total Applications', value: overview?.total_applications, color: '#2ecc71', icon: '📋' },
    { label: 'Pending Logbooks', value: overview?.pending_logbooks, color: '#e74c3c', icon: '📔' },
    { label: 'Open Internships', value: overview?.total_internships, color: '#9b59b6', icon: '💼' },
    { label: 'Pending Approvals', value: overview?.pending_approvals, color: '#f39c12', icon: '⏳' },
    { label: 'Grades Given', value: overview?.total_grades, color: '#1abc9c', icon: '📊' },
  ];

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>👩‍💼 Coordinator Dashboard</h2>

      <div style={styles.cards}>
        {cards.map(card => (
          <div key={card.label} style={{ ...styles.card, borderTop: `4px solid ${card.color}` }}>
            <div style={styles.cardIcon}>{card.icon}</div>
            <p style={{ ...styles.cardValue, color: card.color }}>{card.value ?? 0}</p>
            <p style={styles.cardLabel}>{card.label}</p>
          </div>
        ))}
      </div>

      <div style={styles.quickLinks}>
        <h3 style={styles.quickTitle}>Quick Actions</h3>
        <div style={styles.linkGrid}>
          {[
            { label: '📔 Review Logbooks', href: '/coordinator/logbooks' },
            { label: '👨‍🎓 View Students', href: '/coordinator/students' },
            { label: '💼 Approve Internships', href: '/coordinator/internships' },
            { label: '📊 Grade Students', href: '/coordinator/grades' },
            { label: '📋 View Applications', href: '/coordinator/applications' },
          ].map(link => (
            <a key={link.label} href={link.href} style={styles.quickLink}>
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  loading: { padding: '2rem', textAlign: 'center' },
  container: { padding: '2rem', maxWidth: '1100px', margin: '0 auto' },
  heading: { fontSize: '1.8rem', color: '#1a1a2e', marginBottom: '1.5rem' },
  cards: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '1rem', marginBottom: '2rem' },
  card: { backgroundColor: 'white', borderRadius: '10px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', textAlign: 'center' },
  cardIcon: { fontSize: '2rem', marginBottom: '0.5rem' },
  cardValue: { fontSize: '2.2rem', fontWeight: 'bold', margin: '0 0 0.25rem 0' },
  cardLabel: { color: '#666', fontSize: '0.85rem', margin: 0 },
  quickLinks: { backgroundColor: 'white', borderRadius: '10px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
  quickTitle: { color: '#1a1a2e', marginTop: 0, marginBottom: '1rem' },
  linkGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' },
  quickLink: { display: 'block', padding: '0.75rem 1rem', backgroundColor: '#f0f2f5', borderRadius: '8px', color: '#1a1a2e', textDecoration: 'none', fontWeight: '600', textAlign: 'center' },
};