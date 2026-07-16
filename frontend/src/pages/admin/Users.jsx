import { useState, useEffect } from 'react';
import { getAllUsers, updateUserStatus } from '../../services/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async (params = {}) => {
    try {
      const res = await getAllUsers(params);
      setUsers(res.data.users);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers({ search, role });
  };

  const handleToggleStatus = async (user) => {
    try {
      await updateUserStatus(user.id, !user.is_verified);
      setMessage(`User ${!user.is_verified ? 'activated' : 'suspended'}.`);
      fetchUsers({ search, role });
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { setMessage('Failed to update user'); }
  };

  const roleColor = { student: '#3498db', company: '#2ecc71', admin: '#e74c3c' };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>User Management</h2>
      {message && <div style={styles.message}>{message}</div>}
      <form onSubmit={handleSearch} style={styles.filters}>
        <input style={styles.input} type="text" placeholder="Search by email..." value={search} onChange={e => setSearch(e.target.value)} />
        <select style={styles.input} value={role} onChange={e => setRole(e.target.value)}>
          <option value="">All Roles</option>
          <option value="student">Student</option>
          <option value="company">Company</option>
          <option value="admin">Admin</option>
        </select>
        <button style={styles.searchBtn} type="submit">Filter</button>
        <button style={styles.clearBtn} type="button" onClick={() => { setSearch(''); setRole(''); fetchUsers(); }}>Clear</button>
      </form>
      {loading ? <p>Loading...</p> : (
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Joined</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} style={styles.tableRow}>
                <td style={styles.td}>{user.id}</td>
                <td style={styles.td}>{user.email}</td>
                <td style={styles.td}>
                  <span style={{ ...styles.badge, backgroundColor: roleColor[user.role] }}>
                    {user.role}
                  </span>
                </td>
                <td style={styles.td}>
                  <span style={{ color: user.is_verified ? '#2ecc71' : '#e74c3c', fontWeight: '600' }}>
                    {user.is_verified ? 'Active' : 'Suspended'}
                  </span>
                </td>
                <td style={styles.td}>{new Date(user.created_at).toLocaleDateString()}</td>
                <td style={styles.td}>
                  <button
                    style={{ ...styles.actionBtn, backgroundColor: user.is_verified ? '#e74c3c' : '#2ecc71' }}
                    onClick={() => handleToggleStatus(user)}
                  >
                    {user.is_verified ? 'Suspend' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const styles = {
  container: { padding: '2rem', maxWidth: '1100px', margin: '0 auto' },
  heading: { fontSize: '1.8rem', color: '#1a1a2e', marginBottom: '1.5rem' },
  message: { padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', backgroundColor: '#e8f5e9', color: '#2e7d32' },
  filters: { display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
  input: { padding: '0.65rem', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem' },
  searchBtn: { padding: '0.65rem 1.25rem', backgroundColor: '#1a1a2e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  clearBtn: { padding: '0.65rem 1.25rem', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  table: { width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
  tableHeader: { backgroundColor: '#1a1a2e', color: 'white' },
  th: { padding: '1rem', textAlign: 'left' },
  tableRow: { borderBottom: '1px solid #eee' },
  td: { padding: '0.85rem 1rem' },
  badge: { color: 'white', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem' },
  actionBtn: { color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
};

export default AdminUsers;