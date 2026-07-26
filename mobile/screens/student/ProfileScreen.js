import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useContext } from 'react';
import { AuthContext } from '../../App';
import { getMyProfile } from '../../services';

export default function ProfileScreen({ navigation }) {
    const { signOut } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [completion, setCompletion] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await AsyncStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  };

  const fetchProfile = async () => {
    try {
      const res = await getMyProfile();
      setProfile(res.data.profile);
      setCompletion(res.data.completion);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  if (loading) return <ActivityIndicator size="large" color="#1a1a2e" style={styles.loader} />;

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || '?'}
          </Text>
        </View>
        <Text style={styles.name}>{profile?.full_name || 'Student'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      {/* Completion Bar */}
      <View style={styles.card}>
        <View style={styles.completionHeader}>
          <Text style={styles.completionLabel}>Profile Completion</Text>
          <Text style={styles.completionPct}>{completion}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, {
            width: `${completion}%`,
            backgroundColor: completion < 50 ? '#e74c3c' : completion < 80 ? '#f39c12' : '#2ecc71'
          }]} />
        </View>
      </View>

      {/* Info Cards */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Personal Information</Text>
        {[
          { label: 'University', value: profile?.university },
          { label: 'Degree', value: profile?.degree },
          { label: 'Graduation Year', value: profile?.graduation_year },
          { label: 'Phone', value: profile?.phone },
        ].map(item => (
          <View key={item.label} style={styles.infoRow}>
            <Text style={styles.infoLabel}>{item.label}</Text>
            <Text style={styles.infoValue}>{item.value || 'Not set'}</Text>
          </View>
        ))}
      </View>

      {/* Skills */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Skills</Text>
        <View style={styles.skills}>
          {(profile?.skills || []).length > 0 ? (
            (profile?.skills || []).map(s => (
              <View key={s} style={styles.skill}>
                <Text style={styles.skillText}>{s}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.empty}>No skills added yet</Text>
          )}
        </View>
      </View>

      {/* Bio */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Bio</Text>
        <Text style={styles.bio}>{profile?.bio || 'No bio yet.'}</Text>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪 Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  loader: { flex: 1 },
  header: { backgroundColor: '#1a1a2e', padding: 30, alignItems: 'center' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#3498db', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 32, color: 'white', fontWeight: 'bold' },
  name: { fontSize: 22, fontWeight: 'bold', color: 'white', marginBottom: 4 },
  email: { fontSize: 14, color: '#aaa' },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 16, margin: 16, marginTop: 8, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a2e', marginBottom: 12 },
  completionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  completionLabel: { fontSize: 14, fontWeight: '600', color: '#333' },
  completionPct: { fontSize: 14, fontWeight: '700', color: '#1a1a2e' },
  progressBar: { height: 8, backgroundColor: '#f0f2f5', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  infoLabel: { fontSize: 13, color: '#666' },
  infoValue: { fontSize: 13, color: '#1a1a2e', fontWeight: '500' },
  skills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skill: { backgroundColor: '#e8f0fe', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  skillText: { fontSize: 13, color: '#1a1a2e' },
  bio: { fontSize: 14, color: '#555', lineHeight: 20 },
  empty: { color: '#aaa', fontStyle: 'italic' },
  logoutBtn: { margin: 16, backgroundColor: '#e74c3c', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 32 },
  logoutText: { color: 'white', fontSize: 16, fontWeight: '700' },
});