import { useState, useEffect } from 'react';
import { getInternships, applyToInternship } from '../../services/api';

const Internships = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);
  const [message, setMessage] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    is_remote: '',
    min_stipend: '',
    max_stipend: '',
    duration_weeks: '',
    sort: 'newest',
  });

  useEffect(() => { fetchInternships(); }, []);

  const fetchInternships = async (params = {}) => {
    setLoading(true);
    try {
      const cleanParams = {};
      Object.entries(params).forEach(([k, v]) => {
        if (v !== '' && v !== null && v !== undefined) cleanParams[k] = v;
      });
      const res = await getInternships(cleanParams);
      let data = res.data.internships;

      // Client-side sorting
      if (params.sort === 'stipend_high') {
        data = data.sort((a, b) => b.stipend - a.stipend);
      } else if (params.sort === 'stipend_low') {
        data = data.sort((a, b) => a.stipend - b.stipend);
      } else if (params.sort === 'duration') {
        data = data.sort((a, b) => a.duration_weeks - b.duration_weeks);
      }

      // Client-side stipend range filter
      if (params.min_stipend) {
        data = data.filter(i => i.stipend >= parseFloat(params.min_stipend));
      }
      if (params.max_stipend) {
        data = data.filter(i => i.stipend <= parseFloat(params.max_stipend));
      }
      if (params.duration_weeks) {
        data = data.filter(i => i.duration_weeks <= parseInt(params.duration_weeks));
      }

      setInternships(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchInternships(filters);
  };

  const handleClearFilters = () => {
    const cleared = {
      search: '', location: '', is_remote: '',
      min_stipend: '', max_stipend: '',
      duration_weeks: '', sort: 'newest',
    };
    setFilters(cleared);
    fetchInternships({});
  };

  const handleApply = async (id) => {
    setApplying(id);
    try {
      await applyToInternship(id, { cover_letter: 'I am very interested in this position.' });
      setMessage('✅ Application submitted successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to apply');
      setTimeout(() => setMessage(''), 3000);
    }
    setApplying(null);
  };

  const activeFiltersCount = Object.entries(filters)
    .filter(([k, v]) => v !== '' && k !== 'sort').length;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.heading}>Browse Internships</h2>
        <span style={styles.count}>
          {loading ? 'Loading...' : `${internships.length} internship${internships.length !== 1 ? 's' : ''} found`}
        </span>
      </div>

      {message && <div style={styles.message}>{message}</div>}

      {/* Search Bar */}
      <form onSubmit={handleSearch} style={styles.searchBar}>
        <input
          style={styles.searchInput}
          type="text"
          name="search"
          placeholder="🔍 Search by job title..."
          value={filters.search}
          onChange={handleFilterChange}
        />
        <button style={styles.searchBtn} type="submit">Search</button>
        <button
          type="button"
          style={{ ...styles.filterToggleBtn, backgroundColor: showFilters ? '#1a1a2e' : '#f0f2f5', color: showFilters ? 'white' : '#333' }}
          onClick={() => setShowFilters(!showFilters)}
        >
          ⚙️ Filters {activeFiltersCount > 0 && <span style={styles.filterBadge}>{activeFiltersCount}</span>}
        </button>
        {activeFiltersCount > 0 && (
          <button type="button" style={styles.clearBtn} onClick={handleClearFilters}>
            ✕ Clear All
          </button>
        )}
      </form>

      {/* Filter Panel */}
      {showFilters && (
        <div style={styles.filterPanel}>
          <div style={styles.filterGrid}>
            {/* Location */}
            <div style={styles.filterField}>
              <label style={styles.filterLabel}>📍 Location</label>
              <input
                style={styles.filterInput}
                type="text"
                name="location"
                placeholder="e.g. Kuching"
                value={filters.location}
                onChange={handleFilterChange}
              />
            </div>

            {/* Work Type */}
            <div style={styles.filterField}>
              <label style={styles.filterLabel}>💻 Work Type</label>
              <select
                style={styles.filterInput}
                name="is_remote"
                value={filters.is_remote}
                onChange={handleFilterChange}
              >
                <option value="">All Types</option>
                <option value="false">On-site</option>
                <option value="true">Remote</option>
              </select>
            </div>

            {/* Min Stipend */}
            <div style={styles.filterField}>
              <label style={styles.filterLabel}>💰 Min Stipend (RM)</label>
              <input
                style={styles.filterInput}
                type="number"
                name="min_stipend"
                placeholder="e.g. 500"
                value={filters.min_stipend}
                onChange={handleFilterChange}
              />
            </div>

            {/* Max Stipend */}
            <div style={styles.filterField}>
              <label style={styles.filterLabel}>💰 Max Stipend (RM)</label>
              <input
                style={styles.filterInput}
                type="number"
                name="max_stipend"
                placeholder="e.g. 2000"
                value={filters.max_stipend}
                onChange={handleFilterChange}
              />
            </div>

            {/* Duration */}
            <div style={styles.filterField}>
              <label style={styles.filterLabel}>⏱ Max Duration (weeks)</label>
              <input
                style={styles.filterInput}
                type="number"
                name="duration_weeks"
                placeholder="e.g. 12"
                value={filters.duration_weeks}
                onChange={handleFilterChange}
              />
            </div>

            {/* Sort */}
            <div style={styles.filterField}>
              <label style={styles.filterLabel}>↕️ Sort By</label>
              <select
                style={styles.filterInput}
                name="sort"
                value={filters.sort}
                onChange={handleFilterChange}
              >
                <option value="newest">Newest First</option>
                <option value="stipend_high">Highest Stipend</option>
                <option value="stipend_low">Lowest Stipend</option>
                <option value="duration">Shortest Duration</option>
              </select>
            </div>
          </div>

          <button style={styles.applyFilterBtn} onClick={() => fetchInternships(filters)}>
            Apply Filters
          </button>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div style={styles.loadingBox}>
          <p>Loading internships...</p>
        </div>
      ) : internships.length === 0 ? (
        <div style={styles.emptyBox}>
          <p style={styles.emptyText}>😔 No internships found.</p>
          <p style={styles.emptySubtext}>Try adjusting your filters or search terms.</p>
          <button style={styles.clearBtn} onClick={handleClearFilters}>Clear Filters</button>
        </div>
      ) : (
        <div style={styles.grid}>
          {internships.map(i => (
            <div key={i.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.cardHeaderLeft}>
                  <h3 style={styles.title}>{i.title}</h3>
                  <p style={styles.company}>🏢 {i.company?.company_name}</p>
                </div>
                <span style={styles.badge}>
                  {i.is_remote ? '🌐 Remote' : `📍 ${i.location}`}
                </span>
              </div>

              <p style={styles.desc}>{i.description?.slice(0, 120)}...</p>

              <div style={styles.details}>
                <span style={styles.detail}>💰 RM{i.stipend}/month</span>
                <span style={styles.detail}>⏱ {i.duration_weeks} weeks</span>
                <span style={styles.detail}>👥 {i.openings} openings</span>
              </div>

              {i.application_deadline && (
                <p style={styles.deadline}>
                  📅 Deadline: {new Date(i.application_deadline).toLocaleDateString()}
                </p>
              )}

              <div style={styles.skills}>
                {(i.required_skills || []).slice(0, 4).map(s => (
                  <span key={s} style={styles.skill}>{s}</span>
                ))}
                {(i.required_skills || []).length > 4 && (
                  <span style={styles.moreSkills}>+{i.required_skills.length - 4} more</span>
                )}
              </div>

              <button
                style={{
                  ...styles.applyBtn,
                  backgroundColor: applying === i.id ? '#95a5a6' : '#2ecc71',
                }}
                onClick={() => handleApply(i.id)}
                disabled={applying === i.id}
              >
                {applying === i.id ? 'Applying...' : 'Apply Now'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { padding: '2rem', maxWidth: '1100px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  heading: { fontSize: '1.8rem', color: '#1a1a2e', margin: 0 },
  count: { color: '#666', fontSize: '0.95rem' },
  message: { padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', backgroundColor: '#e8f5e9', color: '#2e7d32', textAlign: 'center' },
  searchBar: { display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' },
  searchInput: { flex: 1, minWidth: '200px', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1rem' },
  searchBtn: { padding: '0.75rem 1.5rem', backgroundColor: '#1a1a2e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  filterToggleBtn: { padding: '0.75rem 1.25rem', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  filterBadge: { backgroundColor: '#e74c3c', color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' },
  clearBtn: { padding: '0.75rem 1.25rem', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  filterPanel: { backgroundColor: 'white', borderRadius: '10px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
  filterGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' },
  filterField: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  filterLabel: { fontSize: '0.85rem', fontWeight: '600', color: '#555' },
  filterInput: { padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.9rem' },
  applyFilterBtn: { padding: '0.75rem 2rem', backgroundColor: '#1a1a2e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  loadingBox: { textAlign: 'center', padding: '3rem', color: '#666' },
  emptyBox: { textAlign: 'center', padding: '3rem' },
  emptyText: { fontSize: '1.2rem', color: '#555', margin: '0 0 0.5rem 0' },
  emptySubtext: { color: '#888', marginBottom: '1rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' },
  card: { backgroundColor: 'white', borderRadius: '10px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardHeaderLeft: { flex: 1 },
  title: { fontSize: '1.1rem', color: '#1a1a2e', margin: '0 0 0.25rem 0' },
  company: { color: '#555', margin: 0, fontSize: '0.9rem' },
  badge: { fontSize: '0.8rem', backgroundColor: '#e8f0fe', padding: '0.2rem 0.6rem', borderRadius: '20px', whiteSpace: 'nowrap', marginLeft: '0.5rem' },
  desc: { color: '#666', fontSize: '0.9rem', margin: 0 },
  details: { display: 'flex', gap: '1rem', flexWrap: 'wrap' },
  detail: { fontSize: '0.85rem', color: '#444' },
  deadline: { fontSize: '0.85rem', color: '#e74c3c', margin: 0 },
  skills: { display: 'flex', flexWrap: 'wrap', gap: '0.4rem' },
  skill: { backgroundColor: '#f0f2f5', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem', color: '#444' },
  moreSkills: { backgroundColor: '#e8f0fe', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem', color: '#1a1a2e' },
  applyBtn: { padding: '0.75rem', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', marginTop: 'auto' },
};

export default Internships;