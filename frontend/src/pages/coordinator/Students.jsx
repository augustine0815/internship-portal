import { useState, useEffect } from 'react';
import { getCoordinatorStudents } from '../../services/api';

export default function CoordinatorStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async (params = {}) => {
    try {
      const res = await getCoordinatorStudents(params);
      setStudents(res.data.students);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const getHiredInfo = (student) => {
    const apps = student.studentProfile?.applications || [];
    return apps.find(a => a.status === 'hired');
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>👨‍🎓 Students</h2>

      <div style={styles.searchBar}>
        <input
          style={styles.input}
          type="text"
          placeholder="Search by email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && fetchStudents({ search })}
        />
        <button style={styles.searchBtn} onClick={() => fetchStudents({ search })}>
          Search
        </button>
        <button style={styles.clearBtn} onClick={() => { setSearch(''); fetchStudents(); }}>
          Clear
        </button>
      </div>

      {loading ? <p>Loading...</p> : (
        <div style={styles.grid}>
          <div style={styles.list}>
            {students.map(student => {
              const hired = getHiredInfo(student);
              return (
              <div
                key={student.id}
                style={{ ...styles.card, border: selected?.id === student.id ? '2px solid #1a1a2e' : '1px solid #eee' }}
                onClick={() => setSelected(student)}
              >
                <div style={styles.avatar}>
                  {student.studentProfile?.full_name?.charAt(0) || '?'}
                </div>
                <div style={styles.info}>
                  <p style={styles.name}>{student.studentProfile?.full_name || 'No name'}</p>
                  <p style={styles.email}>{student.email}</p>
                  <p style={styles.uni}>{student.studentProfile?.university || 'No university'}</p>
                </div>
                {hired ? (
                  <span style={styles.hiredBadge}>
                    ✅ Hired @ {hired.internship?.company?.company_name || 'Company'}
                  </span>
                ) : (
                  <div style={styles.appCount}>
                    <span style={styles.count}>{student.studentProfile?.applications?.length || 0}</span>
                    <span style={styles.countLabel}>apps</span>
                  </div>
                )}
              </div>
              );
            })}
          </div>

          {selected && (
            <div style={styles.detail}>
              <div style={styles.detailHeader}>
                <div style={styles.detailAvatar}>
                  {selected.studentProfile?.full_name?.charAt(0) || '?'}
                </div>
                <div>
                  <h3 style={styles.detailName}>{selected.studentProfile?.full_name}</h3>
                  <p style={styles.detailEmail}>{selected.email}</p>
                </div>
              </div>

              <div style={styles.detailSection}>
                <h4 style={styles.sectionTitle}>📚 Academic Info</h4>
                <div style={styles.infoGrid}>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>University</span>
                    <span style={styles.infoValue}>{selected.studentProfile?.university || 'N/A'}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Degree</span>
                    <span style={styles.infoValue}>{selected.studentProfile?.degree || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div style={styles.detailSection}>
                <h4 style={styles.sectionTitle}>💼 Applications</h4>
                {(selected.studentProfile?.applications || []).length === 0 ? (
                  <p style={styles.empty}>No applications yet</p>
                ) : (
                  selected.studentProfile.applications.map(app => (
                    <div
                      key={app.id}
                      style={{
                        ...styles.appItem,
                        ...(app.status === 'hired' ? styles.appItemHired : {}),
                      }}
                    >
                      <span style={styles.appInternship}>
                        {app.internship?.title || 'Unknown Internship'}
                        {app.internship?.company?.company_name && ` @ ${app.internship.company.company_name}`}
                      </span>
                      <span style={app.status === 'hired' ? styles.appStatusHired : styles.appStatus}>
                        {app.status === 'hired' ? '✅ Hired' : app.status}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div style={styles.detailSection}>
                <h4 style={styles.sectionTitle}>🛠 Skills</h4>
                <div style={styles.skills}>
                  {(selected.studentProfile?.skills || []).map(skill => (
                    <span key={skill} style={styles.skill}>{skill}</span>
                  ))}
                </div>
              </div>

              <a
                href={`/coordinator/grades?student_id=${selected.studentProfile?.id}`}
                style={styles.gradeBtn}
              >
                📊 Grade This Student
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '2rem', maxWidth: '1100px', margin: '0 auto' },
  heading: { fontSize: '1.8rem', color: '#1a1a2e', marginBottom: '1.5rem' },
  searchBar: { display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' },
  input: { flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' },
  searchBtn: { padding: '0.75rem 1.5rem', backgroundColor: '#1a1a2e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  clearBtn: { padding: '0.75rem 1.5rem', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' },
  list: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  card: { backgroundColor: 'white', borderRadius: '10px', padding: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  avatar: { width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#1a1a2e', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold', flexShrink: 0 },
  info: { flex: 1 },
  name: { margin: 0, fontWeight: '700', color: '#1a1a2e', fontSize: '0.95rem' },
  email: { margin: '0.2rem 0', color: '#666', fontSize: '0.8rem' },
  uni: { margin: 0, color: '#888', fontSize: '0.8rem' },
  appCount: { textAlign: 'center' },
  hiredBadge: { backgroundColor: '#2ecc71', color: 'white', padding: '0.4rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', whiteSpace: 'nowrap' },
  count: { display: 'block', fontSize: '1.4rem', fontWeight: 'bold', color: '#1a1a2e' },
  countLabel: { fontSize: '0.7rem', color: '#888' },
  detail: { backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
  detailHeader: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #eee' },
  detailAvatar: { width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#1a1a2e', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' },
  detailName: { margin: 0, fontSize: '1.2rem', color: '#1a1a2e' },
  detailEmail: { margin: '0.25rem 0 0 0', color: '#666', fontSize: '0.9rem' },
  detailSection: { marginBottom: '1.25rem' },
  sectionTitle: { fontSize: '0.95rem', fontWeight: '700', color: '#1a1a2e', marginBottom: '0.75rem' },
  infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' },
  infoItem: { display: 'flex', flexDirection: 'column', gap: '0.2rem' },
  infoLabel: { fontSize: '0.75rem', color: '#888' },
  infoValue: { fontSize: '0.9rem', color: '#333', fontWeight: '500' },
  appItem: { padding: '0.5rem 0.75rem', backgroundColor: '#f8f9fa', borderRadius: '6px', marginBottom: '0.4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' },
  appItemHired: { backgroundColor: '#eafaf1', border: '1px solid #2ecc71' },
  appInternship: { fontSize: '0.85rem', color: '#333' },
  appStatus: { fontSize: '0.8rem', color: '#555' },
  appStatusHired: { fontSize: '0.8rem', color: '#2ecc71', fontWeight: '700' },
  skills: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' },
  skill: { backgroundColor: '#e8f0fe', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem', color: '#1a1a2e' },
  empty: { color: '#888', fontSize: '0.9rem', fontStyle: 'italic' },
  gradeBtn: { display: 'block', padding: '0.75rem', backgroundColor: '#2ecc71', color: 'white', borderRadius: '8px', textAlign: 'center', textDecoration: 'none', fontWeight: '600', marginTop: '1rem' },
};