import { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, RefreshControl
} from 'react-native';
import { getInternships, applyToInternship } from '../../services';

export default function InternshipsScreen() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [applying, setApplying] = useState(null);

  useEffect(() => { fetchInternships(); }, []);

  const fetchInternships = async (params = {}) => {
    try {
      const res = await getInternships(params);
      setInternships(res.data.internships);
    } catch (err) { console.error(err); }
    setLoading(false);
    setRefreshing(false);
  };

  const handleSearch = () => {
    setLoading(true);
    fetchInternships(search ? { search } : {});
  };

  const handleApply = async (id) => {
    setApplying(id);
    try {
      await applyToInternship(id, { cover_letter: 'I am very interested in this position.' });
      Alert.alert('Success! ✅', 'Application submitted successfully!');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to apply');
    }
    setApplying(null);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.title}>{item.title}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {item.is_remote ? '🌐 Remote' : `📍 ${item.location}`}
          </Text>
        </View>
      </View>

      <Text style={styles.company}>🏢 {item.company?.company_name}</Text>
      <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>

      <View style={styles.details}>
        <Text style={styles.detail}>💰 RM{item.stipend}/mo</Text>
        <Text style={styles.detail}>⏱ {item.duration_weeks}w</Text>
        <Text style={styles.detail}>👥 {item.openings}</Text>
      </View>

      <View style={styles.skills}>
        {(item.required_skills || []).slice(0, 3).map(s => (
          <View key={s} style={styles.skill}>
            <Text style={styles.skillText}>{s}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.applyBtn, applying === item.id && styles.applyBtnDisabled]}
        onPress={() => handleApply(item.id)}
        disabled={applying === item.id}
      >
        {applying === item.id ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text style={styles.applyBtnText}>Apply Now</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Search internships..."
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Text style={styles.searchBtnText}>Search</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1a1a2e" style={styles.loader} />
      ) : (
        <FlatList
          data={internships}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchInternships(); }}
            />
          }
          ListEmptyComponent={
            <Text style={styles.empty}>No internships found</Text>
          }
          ListHeaderComponent={
            <Text style={styles.count}>{internships.length} internship(s) found</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  searchBar: { flexDirection: 'row', padding: 16, gap: 8, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#eee' },
  searchInput: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, fontSize: 15, backgroundColor: '#fafafa' },
  searchBtn: { backgroundColor: '#1a1a2e', borderRadius: 8, paddingHorizontal: 16, justifyContent: 'center' },
  searchBtnText: { color: 'white', fontWeight: '600' },
  loader: { flex: 1, justifyContent: 'center' },
  list: { padding: 16, gap: 12 },
  count: { color: '#666', fontSize: 13, marginBottom: 8 },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  title: { fontSize: 16, fontWeight: '700', color: '#1a1a2e', flex: 1, marginRight: 8 },
  badge: { backgroundColor: '#e8f0fe', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 11, color: '#1a1a2e' },
  company: { color: '#555', marginBottom: 6, fontSize: 13 },
  desc: { color: '#666', fontSize: 13, marginBottom: 10, lineHeight: 18 },
  details: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  detail: { fontSize: 12, color: '#444' },
  skills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  skill: { backgroundColor: '#f0f2f5', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  skillText: { fontSize: 11, color: '#444' },
  applyBtn: { backgroundColor: '#2ecc71', borderRadius: 8, padding: 12, alignItems: 'center' },
  applyBtnDisabled: { backgroundColor: '#95a5a6' },
  applyBtnText: { color: 'white', fontWeight: '700', fontSize: 15 },
  empty: { textAlign: 'center', color: '#888', marginTop: 40, fontSize: 16 },
});