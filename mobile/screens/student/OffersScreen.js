import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { getMyOffers, respondToOffer } from '../../services';

export default function OffersScreen() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchOffers(); }, []);

  const fetchOffers = async () => {
    try {
      const res = await getMyOffers();
      setOffers(res.data.offers);
    } catch (err) { console.error(err); }
    setLoading(false);
    setRefreshing(false);
  };

  const handleRespond = async (offerId, decision) => {
    try {
      await respondToOffer(offerId, decision);
      Alert.alert('Success', `Offer ${decision} successfully!`);
      fetchOffers();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to respond');
    }
  };

  const statusColor = { pending: '#f39c12', accepted: '#2ecc71', declined: '#e74c3c', expired: '#95a5a6' };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.title}>{item.internship?.title}</Text>
        <View style={[styles.badge, { backgroundColor: statusColor[item.status] }]}>
          <Text style={styles.badgeText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.company}>🏢 {item.internship?.company?.company_name}</Text>
      <View style={styles.details}>
        <Text style={styles.detail}>💰 RM{item.offered_stipend}/month</Text>
        <Text style={styles.detail}>📅 {item.start_date} → {item.end_date}</Text>
      </View>
      {item.status === 'pending' && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.acceptBtn}
            onPress={() => handleRespond(item.id, 'accepted')}
          >
            <Text style={styles.actionBtnText}>✅ Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.declineBtn}
            onPress={() => handleRespond(item.id, 'declined')}
          >
            <Text style={styles.actionBtnText}>❌ Decline</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#1a1a2e" style={styles.loader} />
      ) : (
        <FlatList
          data={offers}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOffers(); }} />
          }
          ListEmptyComponent={
            <Text style={styles.empty}>No offers yet.</Text>
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
  card: { backgroundColor: 'white', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  title: { fontSize: 15, fontWeight: '700', color: '#1a1a2e', flex: 1, marginRight: 8 },
  badge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { color: 'white', fontSize: 10, fontWeight: '700' },
  company: { color: '#555', marginBottom: 10, fontSize: 13 },
  details: { gap: 4, marginBottom: 12 },
  detail: { fontSize: 13, color: '#444' },
  actions: { flexDirection: 'row', gap: 10 },
  acceptBtn: { flex: 1, backgroundColor: '#2ecc71', borderRadius: 8, padding: 10, alignItems: 'center' },
  declineBtn: { flex: 1, backgroundColor: '#e74c3c', borderRadius: 8, padding: 10, alignItems: 'center' },
  actionBtnText: { color: 'white', fontWeight: '700' },
  empty: { textAlign: 'center', color: '#888', marginTop: 40, fontSize: 16 },
});