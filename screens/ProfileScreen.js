import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export default function ProfileScreen() {
  const [notifications, setNotifications] = useState(true);
  const [childAlerts, setChildAlerts] = useState(true);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!user) {
          setLoading(false);
          return;
        }
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) setUserData(snap.data());
      } catch (err) {
        console.error('Error fetching user:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [user]);

  const logout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => signOut(auth) },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Please log in</Text>
      </View>
    );
  }

  const displayName = user?.displayName || userData?.name || 'User';
  const displayEmail = user?.email || '';
  const initial = displayName[0]?.toUpperCase() || 'U';

  const settingsItems = [
    { icon: '🎯', label: 'Daily Calorie Goal', value: `${userData?.calorieGoal || 2000} kcal` },
    { icon: '🚫', label: 'Dietary Restrictions', value: 'None' },
    { icon: '📍', label: 'Location', value: userData?.location || 'Davao City' },
    { icon: '🌐', label: 'Language', value: 'Filipino' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.email}>{displayEmail}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>👨‍👩‍👧 Parent & Health Tracker</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        {[['28', 'Meals\nLogged'], ['2', 'Children\nMonitored'], ['14', 'Day\nStreak']].map(([num, label], i) => (
          <View key={i} style={styles.statBox}>
            <Text style={styles.statNum}>{num}</Text>
            <Text style={styles.statLabel}>{label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>⚙️ Settings</Text>
        {settingsItems.map((item, i) => (
          <TouchableOpacity key={i} style={styles.settingRow}>
            <Text style={styles.settingIcon}>{item.icon}</Text>
            <Text style={styles.settingLabel}>{item.label}</Text>
            <Text style={styles.settingValue}>{item.value}</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔔 Notifications</Text>
        <View style={styles.toggleRow}>
          <View>
            <Text style={styles.toggleLabel}>Meal Reminders</Text>
            <Text style={styles.toggleSub}>Get reminded to log meals</Text>
          </View>
          <Switch value={notifications} onValueChange={setNotifications} trackColor={{ true: '#1B5E20' }} />
        </View>
        <View style={styles.toggleRow}>
          <View>
            <Text style={styles.toggleLabel}>Child Nutrition Alerts</Text>
            <Text style={styles.toggleSub}>Alerts when nutrients are low</Text>
          </View>
          <Switch value={childAlerts} onValueChange={setChildAlerts} trackColor={{ true: '#1B5E20' }} />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>ℹ️ About</Text>
        <Text style={styles.aboutText}>Smart Nutri Scanner v1.0.0</Text>
        <Text style={styles.aboutText}>AI-Powered Meal Analyzer for Filipino Diets</Text>
        <Text style={styles.aboutText}>Built with React Native + Expo + Firebase</Text>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>🚪 Log Out</Text>
      </TouchableOpacity>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F8E9' },
  loadingText: { flex: 1, textAlignVertical: 'center', textAlign: 'center', fontSize: 16, color: '#666' },
  header: { backgroundColor: '#1B5E20', alignItems: 'center', paddingVertical: 32, paddingHorizontal: 20 },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#A5D6A7', alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 3, borderColor: '#fff' },
  avatarText: { fontSize: 36, fontWeight: 'bold', color: '#1B5E20' },
  name: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  email: { color: '#A5D6A7', fontSize: 14, marginTop: 4 },
  roleBadge: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginTop: 10 },
  roleText: { color: '#fff', fontSize: 13 },
  statsRow: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 12, marginTop: 12, borderRadius: 16, padding: 16, elevation: 3, justifyContent: 'space-around' },
  statBox: { alignItems: 'center' },
  statNum: { fontSize: 26, fontWeight: 'bold', color: '#1B5E20' },
  statLabel: { fontSize: 11, color: '#888', textAlign: 'center', marginTop: 2 },
  card: { backgroundColor: '#fff', margin: 12, marginBottom: 0, borderRadius: 16, padding: 18, elevation: 3 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#1B5E20', marginBottom: 14 },
  settingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  settingIcon: { fontSize: 18, marginRight: 12 },
  settingLabel: { flex: 1, fontSize: 14, color: '#333' },
  settingValue: { fontSize: 13, color: '#999', marginRight: 6 },
  arrow: { fontSize: 20, color: '#ccc' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  toggleLabel: { fontSize: 14, color: '#333', fontWeight: '500' },
  toggleSub: { fontSize: 12, color: '#999', marginTop: 2 },
  aboutText: { fontSize: 13, color: '#888', marginBottom: 4 },
  logoutBtn: { margin: 16, marginTop: 16, padding: 16, borderRadius: 14, backgroundColor: '#FFEBEE', alignItems: 'center' },
  logoutText: { color: '#E53935', fontWeight: 'bold', fontSize: 16 },
});