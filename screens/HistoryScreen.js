import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { collection, getDocs, orderBy, query, deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const { width } = Dimensions.get('window');
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function HistoryScreen() {
  const [meals, setMeals] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toDateString());
  const [weekDays, setWeekDays] = useState([]);
  const [weekStats, setWeekStats] = useState([]);
  const [tab, setTab] = useState('daily');

  const fetchMeals = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      const snap = await getDocs(query(collection(db, 'users', user.uid, 'meals'), orderBy('date', 'desc')));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setMeals(data);

      const groups = {};
      data.forEach(m => {
        const key = new Date(m.date).toDateString();
        if (!groups[key]) groups[key] = [];
        groups[key].push(m);
      });
      setGrouped(groups);

      const days = [];
      const stats = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d);
        const key = d.toDateString();
        const dayMeals = groups[key] || [];
        stats.push(dayMeals.reduce((acc, m) => acc + (m.calories || 0), 0));
      }
      setWeekDays(days);
      setWeekStats(stats);
    } catch (e) { console.log(e); }
    setLoading(false);
  };

  useFocusEffect(useCallback(() => { fetchMeals(); }, []));

  const deleteMeal = async (id) => {
    await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'meals', id));
    fetchMeals();
  };

  const maxCal = Math.max(...weekStats, 1);
  const selectedMeals = grouped[selectedDate] || [];
  const totalCal = selectedMeals.reduce((a, m) => a + (m.calories || 0), 0);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📅 Meal History</Text>
        <Text style={styles.headerSub}>Track your eating patterns over time</Text>
      </View>

      <View style={styles.tabRow}>
        {['daily', 'weekly'].map(t => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t === 'daily' ? '📆 Daily' : '📊 Weekly'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1B5E20" style={{ marginTop: 60 }} />
      ) : (
        <>
          {tab === 'weekly' && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>This Week's Calories</Text>
              <View style={styles.chartRow}>
                {weekDays.map((d, i) => (
                  <TouchableOpacity key={i} style={styles.barCol} onPress={() => { setSelectedDate(d.toDateString()); setTab('daily'); }}>
                    <Text style={styles.barVal}>{weekStats[i] > 0 ? weekStats[i] : ''}</Text>
                    <View style={styles.barBg}>
                      <View style={[styles.barFill, { height: `${(weekStats[i] / maxCal) * 100}%`, backgroundColor: d.toDateString() === selectedDate ? '#1B5E20' : '#A5D6A7' }]} />
                    </View>
                    <Text style={[styles.barLabel, d.toDateString() === new Date().toDateString() && styles.barLabelToday]}>{DAYS[d.getDay()]}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {tab === 'daily' && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.datePicker}>
              {weekDays.map((d, i) => (
                <TouchableOpacity key={i} style={[styles.dateChip, d.toDateString() === selectedDate && styles.dateChipActive]} onPress={() => setSelectedDate(d.toDateString())}>
                  <Text style={[styles.dateDay, d.toDateString() === selectedDate && styles.dateDayActive]}>{DAYS[d.getDay()]}</Text>
                  <Text style={[styles.dateNum, d.toDateString() === selectedDate && styles.dateNumActive]}>{d.getDate()}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {tab === 'daily' && (
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}>{selectedDate === new Date().toDateString() ? "Today's Meals" : selectedDate}</Text>
                {totalCal > 0 && <Text style={styles.totalCal}>{totalCal} kcal total</Text>}
              </View>
              {selectedMeals.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyIcon}>🍽️</Text>
                  <Text style={styles.emptyText}>No meals logged this day</Text>
                </View>
              ) : (
                selectedMeals.map((meal, i) => (
                  <View key={i} style={styles.mealCard}>
                    <View style={styles.mealLeft}>
                      <Text style={styles.mealIcon}>{meal.icon || '🍽️'}</Text>
                      <View style={styles.mealInfo}>
                        <Text style={styles.mealName}>{meal.name}</Text>
                        <Text style={styles.mealTime}>{new Date(meal.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                        <View style={styles.macroRow}>
                          {[['P', meal.protein, '#42A5F5'], ['C', meal.carbs, '#FFCA28'], ['F', meal.fat, '#AB47BC']].map(([l, v, c]) => (
                            <View key={l} style={[styles.macroBadge, { backgroundColor: c + '20' }]}>
                              <Text style={[styles.macroText, { color: c }]}>{l}: {v}g</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    </View>
                    <View style={styles.mealRight}>
                      <Text style={styles.mealCal}>{meal.calories}</Text>
                      <Text style={styles.mealCalLabel}>kcal</Text>
                      <TouchableOpacity onPress={() => deleteMeal(meal.id)} style={styles.deleteBtn}>
                        <Text style={styles.deleteIcon}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}

          <View style={styles.statsCard}>
            <Text style={styles.cardTitle}>📈 All Time Stats</Text>
            <View style={styles.statsRow}>
              {[[meals.length, 'Total Meals'], [new Set(meals.map(m => new Date(m.date).toDateString())).size, 'Days Logged'], [Math.round(meals.reduce((a, m) => a + (m.calories || 0), 0) / Math.max(meals.length, 1)), 'Avg Kcal/Meal']].map(([val, label], i) => (
                <View key={i} style={styles.statBox}>
                  <Text style={styles.statNum}>{val}</Text>
                  <Text style={styles.statLabel}>{label}</Text>
                </View>
              ))}
            </View>
          </View>
        </>
      )}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F8E9' },
  header: { backgroundColor: '#1B5E20', padding: 24, paddingTop: 40 },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  headerSub: { color: '#A5D6A7', fontSize: 13, marginTop: 4 },
  tabRow: { flexDirection: 'row', margin: 14, marginBottom: 0, backgroundColor: '#E8F5E9', borderRadius: 14, padding: 4 },
  tab: { flex: 1, padding: 10, borderRadius: 12, alignItems: 'center' },
  tabActive: { backgroundColor: '#1B5E20' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#666' },
  tabTextActive: { color: '#fff' },
  card: { backgroundColor: '#fff', margin: 14, marginBottom: 0, borderRadius: 20, padding: 18, elevation: 3 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#1B5E20', marginBottom: 14 },
  totalCal: { fontSize: 13, color: '#FF7043', fontWeight: 'bold' },
  chartRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 140 },
  barCol: { flex: 1, alignItems: 'center', gap: 4 },
  barVal: { fontSize: 9, color: '#999' },
  barBg: { width: 28, height: 100, backgroundColor: '#F5F5F5', borderRadius: 8, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { width: '100%', borderRadius: 8 },
  barLabel: { fontSize: 11, color: '#999', fontWeight: '600' },
  barLabelToday: { color: '#1B5E20' },
  datePicker: { paddingHorizontal: 14, paddingVertical: 12 },
  dateChip: { width: 52, marginRight: 10, alignItems: 'center', padding: 10, borderRadius: 16, backgroundColor: '#fff', elevation: 2 },
  dateChipActive: { backgroundColor: '#1B5E20' },
  dateDay: { fontSize: 11, color: '#999', fontWeight: '600' },
  dateDayActive: { color: '#A5D6A7' },
  dateNum: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 4 },
  dateNumActive: { color: '#fff' },
  mealCard: { flexDirection: 'row', justifyContent: 'space-between', padding: 14, backgroundColor: '#FAFAFA', borderRadius: 14, marginBottom: 10 },
  mealLeft: { flexDirection: 'row', flex: 1, gap: 12 },
  mealIcon: { fontSize: 32 },
  mealInfo: { flex: 1 },
  mealName: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  mealTime: { fontSize: 12, color: '#999', marginBottom: 6 },
  macroRow: { flexDirection: 'row', gap: 6 },
  macroBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  macroText: { fontSize: 11, fontWeight: '600' },
  mealRight: { alignItems: 'flex-end', justifyContent: 'space-between' },
  mealCal: { fontSize: 18, fontWeight: 'bold', color: '#FF7043' },
  mealCalLabel: { fontSize: 10, color: '#999' },
  deleteBtn: { padding: 4 },
  deleteIcon: { fontSize: 16 },
  emptyBox: { alignItems: 'center', paddingVertical: 30 },
  emptyIcon: { fontSize: 48, marginBottom: 8 },
  emptyText: { color: '#aaa', fontSize: 14 },
  statsCard: { backgroundColor: '#fff', margin: 14, marginBottom: 0, borderRadius: 20, padding: 18, elevation: 3 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statBox: { alignItems: 'center' },
  statNum: { fontSize: 26, fontWeight: 'bold', color: '#1B5E20' },
  statLabel: { fontSize: 11, color: '#888', textAlign: 'center', marginTop: 4 },
});