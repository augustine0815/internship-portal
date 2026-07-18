import { useState, useEffect } from 'react';
import { getMyProfile, updateMyProfile, uploadProfilePhoto, uploadResume } from '../../services/api';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [completion, setCompletion] = useState(0);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [skillInput, setSkillInput] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
const [resumeUploading, setResumeUploading] = useState(false);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await getMyProfile();
      setProfile(res.data.profile);
      setCompletion(res.data.completion);
      setForm({
        full_name: res.data.profile.full_name || '',
        phone: res.data.profile.phone || '',
        university: res.data.profile.university || '',
        degree: res.data.profile.degree || '',
        graduation_year: res.data.profile.graduation_year || '',
        bio: res.data.profile.bio || '',
        skills: res.data.profile.skills || [],
      });
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddSkill = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      if (!form.skills.includes(skillInput.trim())) {
        setForm({ ...form, skills: [...form.skills, skillInput.trim()] });
      }
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setForm({ ...form, skills: form.skills.filter(s => s !== skill) });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handlePhotoUpload = async () => {
    if (!photoFile) return;
    try {
      const formData = new FormData();
      formData.append('photo', photoFile);
      const res = await uploadProfilePhoto(formData);
      setMessage('Profile photo updated!');
      fetchProfile();
      setPhotoFile(null);
      setPhotoPreview(null);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to upload photo');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleResumeChange = (e) => {
  const file = e.target.files[0];
  if (file) setResumeFile(file);
};

const handleResumeUpload = async () => {
  if (!resumeFile) return;
  setResumeUploading(true);
  try {
    const formData = new FormData();
    formData.append('resume', resumeFile);
    const res = await uploadResume(formData);
    setMessage('Resume uploaded successfully!');
    fetchProfile();
    setResumeFile(null);
    setTimeout(() => setMessage(''), 3000);
  } catch (err) {
    setMessage('Failed to upload resume');
    setTimeout(() => setMessage(''), 3000);
  }
  setResumeUploading(false);
};

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateMyProfile(form);
      setMessage('Profile updated successfully!');
      setEditing(false);
      fetchProfile();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to update profile');
      setTimeout(() => setMessage(''), 3000);
    }
    setSaving(false);
  };

  if (loading) return <div style={styles.loading}>Loading profile...</div>;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.heading}>My Profile</h2>
        {!editing ? (
          <button style={styles.editBtn} onClick={() => setEditing(true)}>
            ✏️ Edit Profile
          </button>
        ) : (
          <div style={styles.headerBtns}>
            <button style={styles.saveBtn} onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : '💾 Save'}
            </button>
            <button style={styles.cancelBtn} onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        )}
      </div>

      {message && <div style={styles.message}>{message}</div>}

      {/* Profile Completion */}
      <div style={styles.completionBox}>
        <div style={styles.completionHeader}>
          <span>Profile Completion</span>
          <span style={styles.completionPct}>{completion}%</span>
        </div>
        <div style={styles.progressBar}>
          <div style={{
            ...styles.progressFill,
            width: `${completion}%`,
            backgroundColor: completion < 50 ? '#e74c3c' : completion < 80 ? '#f39c12' : '#2ecc71',
          }} />
        </div>
        {completion < 100 && (
          <p style={styles.completionTip}>
            Complete your profile to increase visibility to companies!
          </p>
        )}
      </div>

      <div style={styles.content}>
        {/* Left Column - Photo */}
        <div style={styles.leftCol}>
          <div style={styles.photoBox}>
            <img
              src={photoPreview || profile?.profile_photo_url || `https://ui-avatars.com/api/?name=${form.full_name || 'Student'}&size=150&background=1a1a2e&color=fff`}
              alt="Profile"
              style={styles.photo}
            />
            {editing && (
              <div style={styles.photoActions}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  style={{ display: 'none' }}
                  id="photo-input"
                />
                <label htmlFor="photo-input" style={styles.photoLabel}>
                  Choose Photo
                </label>
                {photoFile && (
                  <button style={styles.uploadPhotoBtn} onClick={handlePhotoUpload}>
                    Upload
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Skills */}
          <div style={styles.skillsBox}>
            <h3 style={styles.sectionTitle}>Skills</h3>
            <div style={styles.skillsList}>
              {(form.skills || []).map(skill => (
                <span key={skill} style={styles.skill}>
                  {skill}
                  {editing && (
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      style={styles.removeSkill}
                    >×</button>
                  )}
                </span>
              ))}
            </div>
            {editing && (
              <input
                style={styles.skillInput}
                type="text"
                placeholder="Type skill + Enter"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleAddSkill}
              />
            )}
          </div>
        </div>

        {/* Right Column - Details */}
        <div style={styles.rightCol}>
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Personal Information</h3>
            <div style={styles.grid}>
              {[
                { label: 'Full Name', name: 'full_name', placeholder: 'Your full name' },
                { label: 'Phone', name: 'phone', placeholder: '+60 12-345 6789' },
                { label: 'University', name: 'university', placeholder: 'University name' },
                { label: 'Degree', name: 'degree', placeholder: 'Bachelor of Computer Science' },
                { label: 'Graduation Year', name: 'graduation_year', placeholder: '2026' },
              ].map(field => (
                <div key={field.name} style={styles.field}>
                  <label style={styles.label}>{field.label}</label>
                  {editing ? (
                    <input
                      style={styles.input}
                      type="text"
                      name={field.name}
                      placeholder={field.placeholder}
                      value={form[field.name]}
                      onChange={handleChange}
                    />
                  ) : (
                    <p style={styles.value}>
                      {profile?.[field.name] || <span style={styles.empty}>Not set</span>}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Bio</h3>
            {editing ? (
              <textarea
                style={{ ...styles.input, height: '120px', resize: 'vertical' }}
                name="bio"
                placeholder="Tell companies about yourself..."
                value={form.bio}
                onChange={handleChange}
              />
            ) : (
              <p style={styles.value}>
                {profile?.bio || <span style={styles.empty}>No bio yet. Click Edit Profile to add one.</span>}
              </p>
            )}
          </div>
          
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Resume</h3>
            {profile?.resume_url ? (
              <div style={styles.resumeBox}>
                <a
                  href={profile.resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.resumeLink}
                >
                  📄 View My Resume
      </a>
      <span style={styles.resumeUploaded}>✅ Uploaded</span>
    </div>
  ) : (
    <p style={styles.empty}>No resume uploaded yet.</p>
  )}
  <div style={styles.resumeUpload}>
    <input
      type="file"
      accept=".pdf,.doc,.docx"
      onChange={handleResumeChange}
      style={{ display: 'none' }}
      id="resume-input"
    />
    <label htmlFor="resume-input" style={styles.resumeLabel}>
      📎 Choose Resume File
    </label>
    {resumeFile && (
      <div style={styles.resumeSelected}>
        <span style={styles.resumeFileName}>📄 {resumeFile.name}</span>
        <button
          style={styles.uploadResumeBtn}
          onClick={handleResumeUpload}
          disabled={resumeUploading}
        >
          {resumeUploading ? 'Uploading...' : '⬆️ Upload Resume'}
        </button>
      </div>
    )}
  </div>
</div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  loading: { padding: '2rem', textAlign: 'center' },
  container: { padding: '2rem', maxWidth: '1000px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  heading: { fontSize: '1.8rem', color: '#ffffff', margin: 0 },
  editBtn: { padding: '0.6rem 1.25rem', backgroundColor: '#1a1a2e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  headerBtns: { display: 'flex', gap: '0.75rem' },
  saveBtn: { padding: '0.6rem 1.25rem', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  cancelBtn: { padding: '0.6rem 1.25rem', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  message: { padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', backgroundColor: '#e8f5e9', color: '#2e7d32', textAlign: 'center' },
  completionBox: { backgroundColor: 'white', borderRadius: '10px', padding: '1.25rem', marginBottom: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
  completionHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: '600' },
  completionPct: { color: '#1a1a2e', fontSize: '1.1rem' },
  progressBar: { height: '10px', backgroundColor: '#f0f2f5', borderRadius: '5px', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: '5px', transition: 'width 0.3s ease' },
  completionTip: { color: '#666', fontSize: '0.85rem', marginTop: '0.5rem', margin: 0 },
  content: { display: 'grid', gridTemplateColumns: '250px 1fr', gap: '1.5rem' },
  leftCol: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  photoBox: { backgroundColor: 'white', borderRadius: '10px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', textAlign: 'center' },
  photo: { width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', marginBottom: '1rem', border: '3px solid #1a1a2e' },
  photoActions: { display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' },
  photoLabel: { padding: '0.5rem 1rem', backgroundColor: '#f0f2f5', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
  uploadPhotoBtn: { padding: '0.5rem 1rem', backgroundColor: '#1a1a2e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
  skillsBox: { backgroundColor: 'white', borderRadius: '10px', padding: '1.25rem', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
  skillsList: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' },
  skill: { backgroundColor: '#e8f0fe', color: '#1a1a2e', padding: '0.3rem 0.7rem', borderRadius: '20px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' },
  removeSkill: { background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c', fontWeight: 'bold', padding: 0 },
  skillInput: { width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.9rem', boxSizing: 'border-box' },
  rightCol: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  section: { backgroundColor: 'white', borderRadius: '10px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
  sectionTitle: { fontSize: '1.1rem', color: '#1a1a2e', marginBottom: '1rem', marginTop: 0 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: '0.85rem', color: '#666', marginBottom: '0.3rem', fontWeight: '600' },
  input: { padding: '0.65rem', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.95rem', width: '100%', boxSizing: 'border-box' },
  value: { margin: 0, color: '#333', fontSize: '0.95rem' },
  empty: { color: '#aaa', fontStyle: 'italic' },
  resumeLink: { color: '#1a1a2e', textDecoration: 'none', fontWeight: '600', fontSize: '1rem' },
  resumeTip: { color: '#888', fontSize: '0.8rem', marginTop: '0.5rem' },
  resumeBox: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' },
resumeUploaded: { color: '#2ecc71', fontSize: '0.85rem', fontWeight: '600' },
resumeUpload: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
resumeLabel: { 
  display: 'inline-block', padding: '0.6rem 1.25rem', 
  backgroundColor: '#f0f2f5', borderRadius: '6px', 
  cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600',
  border: '2px dashed #ddd', textAlign: 'center',
},
resumeSelected: { display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' },
resumeFileName: { color: '#555', fontSize: '0.9rem' },
uploadResumeBtn: { 
  padding: '0.5rem 1rem', backgroundColor: '#1a1a2e', 
  color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer',
},
};

export default Profile;