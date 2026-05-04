import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar, ActivityIndicator, Animated, Dimensions } from 'react-native';
import { useState, useCallback, useRef, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

function NutrientRing({ value, max, color, label, unit }) {
  const pct = Math.min(value / max, 1);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: pct, duration: 1000, useNativeDriver: false }).start();
  }, [value]);

  return (
    <View style={ringStyles.container}>
      <View style={[ringStyles.ring, { borderColor: '#eee' }]}>
        <View style={[ringStyles.fill, { borderColor: color, borderTopColor: pct > 0.25 ? color : 'transparent', borderRightColor: pct > 0.5 ? color : 'transparent', borderBottomColor: pct > 0.75 ? color : 'transparent' }]} />
        <View style={ringStyles.center}>
          <Text style={[ringStyles.num, { color }]}>{value}</Text>
          <Text style={ringStyles.unit}>{unit}</Text>
        </View>
      </View>
      <Text style={ringStyles.label}>{label}</Text>
    </View>
  );
}

const ringStyles = StyleSheet.create({
  container: { alignItems: 'center', flex: 1 },
  ring: { width: 68, height: 68, borderRadius: 34, borderWidth: 6, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  fill: { position: 'absolute', width: 68, height: 68, borderRadius: 34, borderWidth: 6 },
  center: { alignItems: 'center' },
  num: { fontSize: 14, fontWeight: 'bold' },
  unit: { fontSize: 9, color: '#999' },
  label: { fontSize: 11, color: '#666', marginTop: 6, fontWeight: '600' },
});

export default function HomeScreen({ navigation }) {
  const { theme } = useTheme();
  const [meals, setMeals] = useState([]);
  const [stats, setStats] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [streak, setStreak] = useState(0);
  const [childAlerts, setChildAlerts] = useState([]);
  const [aiTip, setAiTip] = useState('');
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 18) return 'Good Afternoon';
    return 'Good Evening';
  })();

  const fetchData = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;
      setUserName(user.displayName?.split(' ')[0] || 'there');

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const mealsRef = collection(db, 'users', user.uid, 'meals');
      const todayQ = query(mealsRef, where('date', '>=', today.toISOString()), orderBy('date', 'desc'));
      const recentQ = query(mealsRef, orderBy('date', 'desc'), limit(4));
      const [todaySnap, recentSnap] = await Promise.all([getDocs(todayQ), getDocs(recentQ)]);

      const todayMeals = todaySnap.docs.map(d => d.data());
      const totals = todayMeals.reduce((acc, m) => ({
        calories: acc.calories + (m.calories || 0),
        protein: acc.protein + (m.protein || 0),
        carbs: acc.carbs + (m.carbs || 0),
        fat: acc.fat + (m.fat || 0),
      }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

      const childSnap = await getDocs(collection(db, 'users', user.uid, 'children'));
      const alerts = childSnap.docs.filter(d => d.data().iron < 6 || d.data().vitA < 200).map(d => d.data().name);

      const allSnap = await getDocs(query(mealsRef, orderBy('date', 'desc')));
      const days = new Set(allSnap.docs.map(d => new Date(d.data().date).toDateString()));
      let s = 0;
      const check = new Date();
      while (days.has(check.toDateString())) { s++; check.setDate(check.getDate() - 1); }

      const missing = [];
      if (totals.protein < 40) missing.push('protein');
      if (totals.calories < 800) missing.push('calories');
      if (totals.fat < 20) missing.push('healthy fats');
      setAiTip(missing.length > 0 ? `You're low on ${missing.join(' and ')} today. Try adding ${totals.protein < 40 ? 'Tinolang Manok or Bangus' : 'Pinakbet or Sinigang'} to your next meal.` : 'Great job! Your nutrition looks balanced today. Keep it up! 💪');

      setStats({ calories: Math.round(totals.calories), protein: Math.round(totals.protein), carbs: Math.round(totals.carbs), fat: Math.round(totals.fat) });
      setMeals(recentSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setChildAlerts(alerts);
      setStreak(s);
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    } catch (e) { console.log(e); }
    setLoading(false);
  };

  useFocusEffect(useCallback(() => { fadeAnim.setValue(0); fetchData(); }, []));

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.light }]} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />
      <LinearGradient colors={[theme.primary, theme.secondary || theme.primary]} style={styles.banner}>
        <View style={styles.bannerTop}>
          <View>
            <Text style={styles.greeting}>{greeting}, {userName} 👋</Text>
            <Text style={styles.bannerTitle}>Smart Nutri Scanner</Text>
          </View>
          {streak > 0 && (
            <View style={styles.streakBadge}>
              <Ionicons name="flame" size={20} color="#FF7043" />
              <Text style={styles.streakNum}>{streak}</Text>
            </View>
          )}
        </View>
        <Text style={styles.bannerSub}>AI-Powered Filipino Meal Analyzer</Text>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 60 }} />
      ) : (
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={[styles.card, { backgroundColor: theme.light }]}>
            <View style={styles.cardHeaderRow}>
              <Text style={[styles.cardTitle, { color: theme.primary }]}>📊 Today's Nutrition</Text>
              <Text style={styles.cardSub}>{stats.calories} / 2000 kcal</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${Math.min((stats.calories / 2000) * 100, 100)}%`, backgroundColor: theme.primary }]} />
            </View>
            <View style={styles.ringsRow}>
              <NutrientRing value={stats.calories} max={2000} color="#FF7043" label="Calories" unit="kcal" />
              <NutrientRing value={stats.protein} max={60} color="#42A5F5" label="Protein" unit="g" />
              <NutrientRing value={stats.carbs} max={250} color="#FFCA28" label="Carbs" unit="g" />
              <NutrientRing value={stats.fat} max={65} color="#AB47BC" label="Fat" unit="g" />
            </View>
          </View>

          <View style={[styles.aiCard, { backgroundColor: theme.light, borderLeftColor: theme.primary }]}>
            <View style={styles.aiHeader}>
              <Text style={styles.aiIcon}>🤖</Text>
              <Text style={[styles.aiTitle, { color: theme.primary }]}>AI Nutrition Tip</Text>
            </View>
            <Text style={styles.aiText}>{aiTip}</Text>
          </View>

          {childAlerts.length > 0 && (
            <TouchableOpacity style={styles.alertCard} onPress={() => navigation.navigate('Child')}>
              <View style={styles.alertHeader}>
                <Text style={styles.alertIcon}>⚠️</Text>
                <Text style={styles.alertTitle}>Child Nutrition Alert</Text>
                <Text style={styles.alertArrow}>›</Text>
              </View>
              <Text style={styles.alertText}>{childAlerts.join(', ')} {childAlerts.length > 1 ? 'are' : 'is'} low on key nutrients. Tap to view details.</Text>
            </TouchableOpacity>
          )}

          <View style={[styles.card, { backgroundColor: theme.light }]}>
            <View style={styles.cardHeaderRow}>
              <Text style={[styles.cardTitle, { color: theme.primary }]}>🍽️ Recent Meals</Text>
              <TouchableOpacity onPress={() => navigation.navigate('History')}>
                <Text style={[styles.seeAll, { color: theme.primary }]}>See All →</Text>
              </TouchableOpacity>
            </View>
            {meals.length === 0 ? (
              <View style={styles.emptyMeals}>
                <Text style={styles.emptyIcon}>🍽️</Text>
                <Text style={styles.emptyText}>No meals logged yet</Text>
                <TouchableOpacity style={[styles.scanNowBtn, { backgroundColor: theme.primary }]} onPress={() => navigation.navigate('Scan Meal')}>
                  <Text style={styles.scanNowText}>📷 Scan Your First Meal</Text>
                </TouchableOpacity>
              </View>
            ) : (
              meals.map((meal, i) => (
                <View key={i} style={[styles.mealItem, { borderLeftColor: ['#FF7043', '#42A5F5', '#FFCA28', '#AB47BC'][i % 4] }]}>
                  <View style={styles.mealLeft}>
                    <Text style={styles.mealIcon}>{meal.icon || '🍽️'}</Text>
                    <View>
                      <Text style={styles.mealName}>{meal.name}</Text>
                      <Text style={styles.mealTime}>{new Date(meal.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                    </View>
                  </View>
                  <View style={styles.mealRight}>
                    <Text style={styles.mealCal}>{meal.calories}</Text>
                    <Text style={styles.mealCalLabel}>kcal</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </Animated.View>
      )}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  banner: { padding: 24, paddingTop: 40, paddingBottom: 28 },
  bannerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  greeting: { color: '#fff', fontSize: 13, marginBottom: 4 },
  bannerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  bannerSub: { color: '#fff', fontSize: 13 },
  streakBadge: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: 10, alignItems: 'center', minWidth: 54 },
  streakNum: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  card: { backgroundColor: '#fff', margin: 14, marginBottom: 0, borderRadius: 20, padding: 18, elevation: 3, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: 'bold' },
  cardSub: { fontSize: 12, color: '#999' },
  seeAll: { fontSize: 13, fontWeight: '600' },
  progressBarBg: { height: 6, backgroundColor: '#eee', borderRadius: 4, marginBottom: 16, overflow: 'hidden' },
  progressBarFill: { height: 6, borderRadius: 4 },
  ringsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  aiCard: { margin: 14, marginBottom: 0, borderRadius: 20, padding: 18, borderLeftWidth: 4 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  aiIcon: { fontSize: 20 },
  aiTitle: { fontSize: 15, fontWeight: 'bold' },
  aiText: { color: '#444', fontSize: 14, lineHeight: 22 },
  alertCard: { backgroundColor: '#FFF8E1', margin: 14, marginBottom: 0, borderRadius: 20, padding: 18, borderLeftWidth: 4, borderLeftColor: '#FFA000' },
  alertHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 8 },
  alertIcon: { fontSize: 18 },
  alertTitle: { fontSize: 15, fontWeight: 'bold', color: '#E65100', flex: 1 },
  alertArrow: { fontSize: 20, color: '#FFA000' },
  alertText: { color: '#666', fontSize: 13, lineHeight: 20 },
  mealItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5', borderLeftWidth: 3, paddingLeft: 10, marginLeft: -10 },
  mealLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  mealIcon: { fontSize: 28 },
  mealName: { fontSize: 14, fontWeight: '600', color: '#333' },
  mealTime: { fontSize: 12, color: '#999', marginTop: 2 },
  mealRight: { alignItems: 'flex-end' },
  mealCal: { fontSize: 16, fontWeight: 'bold', color: '#FF7043' },
  mealCalLabel: { fontSize: 10, color: '#999' },
  emptyMeals: { alignItems: 'center', paddingVertical: 24 },
  emptyIcon: { fontSize: 48, marginBottom: 8 },
  emptyText: { color: '#aaa', fontSize: 14, marginBottom: 16 },
  scanNowBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  scanNowText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});