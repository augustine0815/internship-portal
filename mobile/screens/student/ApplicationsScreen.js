import { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { getMyApplications } from '../../services';

const statusColors = {
  applied: '#3498db', under_review: '#f39c12', shortlisted: '#9b59b6',
  rejected: '#e74c3c', offered: '#2ecc71', withdrawn: '#95a5a6',
};

export default function ApplicationsScreen() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchApplications(); }, []);

  const fetchApplications = async () => {
    try {
      const res = await getMyApplications();
      setApplications(res.data.applications);
    } catch (err) { console.error(err); }
    setLoading(false);
    setRefreshing(false);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardLeft}>
          <Text style={styles.title}>{item.internship?.title}</Text>
          <Text style={styles.company}>🏢 {item.internship?.company?.company_name}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: statusColors[item.status] }]}>
          <Text style={styles.badgeText}>{item.status.replace('_', ' ').toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.date}>
        Applied: {new Date(item.applied_at).toLocaleDateString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#1a1a2e" style={styles.loader} />
      ) : (
        <FlatList
          data={applications}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchApplications(); }} />
          }
          ListEmptyComponent={
            <Text style={styles.empty}>No applications yet. Start applying!</Text>
          }
          ListHeaderComponent={
            <Text style={styles.count}>{applications.length} application(s)</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  loader: { flex: 1 },
  list: { padding: 16, gap: 12 },
  count: { color: '#666', fontSize: 13, marginBottom: 8 },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  cardLeft: { flex: 1, marginRight: 8 },
  title: { fontSize: 15, fontWeight: '700', color: '#1a1a2e', marginBottom: 4 },
  company: { fontSize: 13, color: '#555' },
  badge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { color: 'white', fontSize: 10, fontWeight: '700' },
  date: { fontSize: 12, color: '#888' },
  empty: { textAlign: 'center', color: '#888', marginTop: 40, fontSize: 16 },
});