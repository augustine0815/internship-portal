import { useState, useEffect } from 'react';
import { getAdminOverview, getConversionFunnel, getPlacementRate } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [funnel, setFunnel] = useState([]);
  const [placement, setPlacement] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [ov, fn, pl] = await Promise.all([
          getAdminOverview(),
          getConversionFunnel(),
          getPlacementRate(),
        ]);
        setOverview(ov.data.overview);
        setFunnel(fn.data.funnel);
        setPlacement(pl.data.placement);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchAll();
  }, []);

  if (loading) return <div style={styles.loading}>Loading dashboard...</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Admin Dashboard</h2>

      {/* Overview Cards */}
      <div style={styles.cards}>
        {[
          { label: 'Total Students', value: overview?.total_students, color: '#3498db' },
          { label: 'Total Companies', value: overview?.total_companies, color: '#2ecc71' },
          { label: 'Total Internships', value: overview?.total_internships, color: '#9b59b6' },
          { label: 'Total Applications', value: overview?.total_applications, color: '#f39c12' },
          { label: 'Total Offers', value: overview?.total_offers, color: '#1abc9c' },
          { label: 'Pending Approvals', value: overview?.pending_approvals, color: '#e74c3c' },
        ].map(card => (
          <div key={card.label} style={{ ...styles.card, borderTop: `4px solid ${card.color}` }}>
            <p style={styles.cardLabel}>{card.label}</p>
            <p style={{ ...styles.cardValue, color: card.color }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Conversion Funnel Chart */}
      <div style={styles.chartBox}>
        <h3 style={styles.chartTitle}>Application Conversion Funnel</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={funnel}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="stage" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#1a1a2e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Placement Stats */}
      {placement && (
        <div style={styles.placementBox}>
          <h3 style={styles.chartTitle}>Placement Overview</h3>
          <div style={styles.placementGrid}>
            <div style={styles.placementCard}>
              <p style={styles.pLabel}>Placement Rate</p>
              <p style={styles.pValue}>{placement.placement_rate}</p>
            </div>
            <div style={styles.placementCard}>
              <p style={styles.pLabel}>Acceptance Rate</p>
              <p style={styles.pValue}>{placement.acceptance_rate}</p>
            </div>
            <div style={styles.placementCard}>
              <p style={styles.pLabel}>Students Placed</p>
              <p style={styles.pValue}>{placement.students_placed}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  loading: { padding: '2rem', textAlign: 'center' },
  container: { padding: '2rem', maxWidth: '1100px', margin: '0 auto' },
  heading: { fontSize: '1.8rem', color: '#1a1a2e', marginBottom: '1.5rem' },
  cards: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' },
  card: { backgroundColor: 'white', borderRadius: '10px', padding: '1.25rem', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
  cardLabel: { color: '#666', fontSize: '0.85rem', margin: '0 0 0.5rem 0' },
  cardValue: { fontSize: '2rem', fontWeight: 'bold', margin: 0 },
  chartBox: { backgroundColor: 'white', borderRadius: '10px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', marginBottom: '2rem' },
  chartTitle: { color: '#1a1a2e', marginBottom: '1rem' },
  placementBox: { backgroundColor: 'white', borderRadius: '10px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
  placementGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' },
  placementCard: { textAlign: 'center', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' },
  pLabel: { color: '#666', fontSize: '0.9rem', margin: '0 0 0.5rem 0' },
  pValue: { fontSize: '1.8rem', fontWeight: 'bold', color: '#1a1a2e', margin: 0 },
};

export default AdminDashboard;