import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function WaterScreen() {
  const { theme } = useTheme();
  const [waterIntake, setWaterIntake] = useState(0);
  const [goal] = useState(8);
  const [todayLogs, setTodayLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toDateString();

  useEffect(() => {
    loadWaterData();
  }, []);

  const loadWaterData = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      let logs = [];

      try {
        const q = query(
          collection(db, 'users', user.uid, 'water'),
          where('date', '==', today),
          orderBy('timestamp', 'desc')
        );
        const snapshot = await getDocs(q);
        logs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (indexError) {
        const q = query(
          collection(db, 'users', user.uid, 'water'),
          where('date', '==', today)
        );
        const snapshot = await getDocs(q);
        logs = snapshot.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      }

      setTodayLogs(logs);
      setWaterIntake(logs.reduce((sum, log) => sum + log.amount, 0));
    } catch (error) {
      console.log('Error loading water data:', error);
    }
    setLoading(false);
  };

  const addWater = async (amount) => {
    try {
      const user = auth.currentUser;
      const entry = {
        amount,
        timestamp: new Date().toISOString(),
        date: today,
      };
      await addDoc(collection(db, 'users', user.uid, 'water'), entry);
      setWaterIntake(prev => prev + amount);
      setTodayLogs(prev => [entry, ...prev]);
      Alert.alert('Water Logged!', `Added ${amount} glass${amount > 1 ? 'es' : ''} of water.`);
    } catch (error) {
      Alert.alert('Error', 'Failed to log water intake');
    }
  };

  const progress = Math.min((waterIntake / goal) * 100, 100);
  const remaining = Math.max(goal - waterIntake, 0);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.light }]} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.primary }]}>💧 Water Tracker</Text>
        <Text style={styles.sub}>Stay hydrated for better health</Text>
      </View>

      <View style={[styles.progressCard, { backgroundColor: theme.card }]}>
        <View style={styles.progressCircle}>
          <Text style={[styles.progressNum, { color: theme.primary }]}>{waterIntake}</Text>
          <Text style={styles.progressUnit}>glasses</Text>
          <Text style={styles.progressGoal}>of {goal}</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: theme.primary }]} />
        </View>
        <Text style={styles.progressText}>
          {remaining > 0 ? `${remaining} more glass${remaining > 1 ? 'es' : ''} to go!` : '🎉 Goal achieved!'}
        </Text>
      </View>

      <View style={styles.quickAdd}>
        <Text style={[styles.sectionTitle, { color: theme.primary }]}>Quick Add</Text>
        <View style={styles.buttonRow}>
          {[1, 2, 3].map(amount => (
            <TouchableOpacity
              key={amount}
              style={[styles.addBtn, { backgroundColor: theme.primary }]}
              onPress={() => addWater(amount)}
            >
              <Ionicons name="water" size={20} color="#fff" />
              <Text style={styles.addBtnText}>{amount} Glass{amount > 1 ? 'es' : ''}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.todayLogs}>
        <Text style={[styles.sectionTitle, { color: theme.primary }]}>Today's Intake</Text>
        {todayLogs.length === 0 ? (
          <Text style={styles.emptyText}>No water logged today. Start drinking! 💧</Text>
        ) : (
          todayLogs.map((log, index) => (
            <View key={index} style={[styles.logItem, { backgroundColor: theme.card }]}>
              <Ionicons name="water" size={20} color={theme.primary} />
              <Text style={styles.logText}>{log.amount} glass{log.amount > 1 ? 'es' : ''}</Text>
              <Text style={styles.logTime}>
                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.tips}>
        <Text style={[styles.sectionTitle, { color: theme.primary }]}>💡 Hydration Tips</Text>
        <View style={[styles.tipCard, { backgroundColor: theme.card }]}>
          <Text style={styles.tipText}>• Drink water before meals to aid digestion</Text>
          <Text style={styles.tipText}>• Keep a water bottle with you at all times</Text>
          <Text style={styles.tipText}>• Drink an extra glass after exercise</Text>
          <Text style={styles.tipText}>• Herbal teas count toward your daily intake</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  sub: { fontSize: 14, color: '#666' },
  progressCard: { borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 24, elevation: 4 },
  progressCircle: { alignItems: 'center', marginBottom: 20 },
  progressNum: { fontSize: 48, fontWeight: 'bold' },
  progressUnit: { fontSize: 16, color: '#666', marginTop: -8 },
  progressGoal: { fontSize: 14, color: '#666' },
  progressBar: { width: '100%', height: 8, backgroundColor: '#eee', borderRadius: 4, marginBottom: 12 },
  progressFill: { height: '100%', borderRadius: 4 },
  progressText: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
  quickAdd: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  addBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, marginHorizontal: 4 },
  addBtnText: { color: '#fff', fontWeight: '600', marginLeft: 8 },
  todayLogs: { marginBottom: 24 },
  emptyText: { textAlign: 'center', color: '#666', fontStyle: 'italic', padding: 20 },
  logItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, marginBottom: 8 },
  logText: { flex: 1, fontSize: 16, marginLeft: 12 },
  logTime: { fontSize: 12, color: '#666' },
  tips: { marginBottom: 40 },
  tipCard: { borderRadius: 12, padding: 16 },
  tipText: { fontSize: 14, color: '#555', marginBottom: 8, lineHeight: 20 },
});