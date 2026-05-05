import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const exercises = [
  { name: 'Walking', icon: '🚶', caloriesPerHour: 200, category: 'Cardio' },
  { name: 'Running', icon: '🏃', caloriesPerHour: 500, category: 'Cardio' },
  { name: 'Cycling', icon: '🚴', caloriesPerHour: 400, category: 'Cardio' },
  { name: 'Swimming', icon: '🏊', caloriesPerHour: 400, category: 'Cardio' },
  { name: 'Push-ups', icon: '💪', caloriesPerHour: 300, category: 'Strength' },
  { name: 'Squats', icon: '🦵', caloriesPerHour: 250, category: 'Strength' },
  { name: 'Yoga', icon: '🧘', caloriesPerHour: 150, category: 'Flexibility' },
  { name: 'Dancing', icon: '💃', caloriesPerHour: 300, category: 'Cardio' },
];

export default function ExerciseScreen() {
  const { theme } = useTheme();
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [duration, setDuration] = useState('');
  const [todayLogs, setTodayLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCalories, setTotalCalories] = useState(0);

  const today = new Date().toDateString();

  useEffect(() => {
    loadExerciseData();
  }, []);

  const loadExerciseData = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      const q = query(
        collection(db, 'users', user.uid, 'exercises'),
        where('date', '==', today),
        orderBy('timestamp', 'desc')
      );
      const snapshot = await getDocs(q);
      const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTodayLogs(logs);
      const total = logs.reduce((sum, log) => sum + log.calories, 0);
      setTotalCalories(total);
    } catch (error) {
      console.log('Error loading exercise data:', error);
    }
    setLoading(false);
  };

  const logExercise = async () => {
    if (!selectedExercise || !duration || duration <= 0) {
      Alert.alert('Error', 'Please select an exercise and enter duration');
      return;
    }

    const hours = parseFloat(duration) / 60;
    const calories = Math.round(selectedExercise.caloriesPerHour * hours);

    try {
      const user = auth.currentUser;
      await addDoc(collection(db, 'users', user.uid, 'exercises'), {
        name: selectedExercise.name,
        icon: selectedExercise.icon,
        duration: parseFloat(duration),
        calories,
        timestamp: new Date().toISOString(),
        date: today,
      });

      setTodayLogs(prev => [{ name: selectedExercise.name, icon: selectedExercise.icon, duration: parseFloat(duration), calories, timestamp: new Date().toISOString() }, ...prev]);
      setTotalCalories(prev => prev + calories);
      setSelectedExercise(null);
      setDuration('');
      Alert.alert('✅ Exercise Logged!', `Burned ${calories} calories from ${selectedExercise.name}.`);
    } catch (error) {
      Alert.alert('Error', 'Failed to log exercise');
    }
  };

  const categories = ['All', ...new Set(exercises.map(e => e.category))];
  const [selectedCategory, setSelectedCategory] = useState('All');
  const filteredExercises = selectedCategory === 'All' ? exercises : exercises.filter(e => e.category === selectedCategory);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.light }]} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.primary }]}>🏋️ Exercise Tracker</Text>
        <Text style={styles.sub}>Track your workouts and burn calories</Text>
      </View>

      <View style={[styles.statsCard, { backgroundColor: theme.card }]}>
        <View style={styles.statRow}>
          <View style={styles.stat}>
            <Text style={[styles.statNum, { color: theme.primary }]}>{totalCalories}</Text>
            <Text style={styles.statLabel}>Calories Burned</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statNum, { color: theme.primary }]}>{todayLogs.length}</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </View>
        </View>
      </View>

      <View style={styles.categories}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              style={[styles.categoryBtn, selectedCategory === category && { backgroundColor: theme.primary }]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[styles.categoryText, selectedCategory === category && { color: '#fff' }]}>{category}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.exercises}>
        <Text style={[styles.sectionTitle, { color: theme.primary }]}>Choose Exercise</Text>
        <View style={styles.exerciseGrid}>
          {filteredExercises.map((exercise, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.exerciseCard, { backgroundColor: theme.card }, selectedExercise?.name === exercise.name && { borderColor: theme.primary, borderWidth: 2 }]}
              onPress={() => setSelectedExercise(exercise)}
            >
              <Text style={styles.exerciseIcon}>{exercise.icon}</Text>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <Text style={styles.exerciseCal}>{exercise.caloriesPerHour} cal/hr</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {selectedExercise && (
        <View style={[styles.logCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.logTitle, { color: theme.primary }]}>Log {selectedExercise.name}</Text>
          <View style={styles.durationRow}>
            <TextInput
              style={[styles.durationInput, { borderColor: theme.primary }]}
              placeholder="Duration (minutes)"
              keyboardType="numeric"
              value={duration}
              onChangeText={setDuration}
            />
            <Text style={styles.durationLabel}>minutes</Text>
          </View>
          <TouchableOpacity style={[styles.logBtn, { backgroundColor: theme.primary }]} onPress={logExercise}>
            <Text style={styles.logBtnText}>Log Exercise</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.todayLogs}>
        <Text style={[styles.sectionTitle, { color: theme.primary }]}>Today's Workouts</Text>
        {todayLogs.length === 0 ? (
          <Text style={styles.emptyText}>No exercises logged today. Start working out!</Text>
        ) : (
          todayLogs.map((log, index) => (
            <View key={index} style={[styles.logItem, { backgroundColor: theme.card }]}>
              <Text style={styles.logIcon}>{log.icon}</Text>
              <View style={styles.logDetails}>
                <Text style={styles.logName}>{log.name}</Text>
                <Text style={styles.logMeta}>{log.duration} min • {log.calories} cal</Text>
              </View>
              <Text style={styles.logTime}>
                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  sub: { fontSize: 14, color: '#666' },
  statsCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 24, elevation: 4 },
  statRow: { flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  statNum: { fontSize: 32, fontWeight: 'bold' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 4 },
  categories: { marginBottom: 24 },
  categoryBtn: { backgroundColor: '#f0f0f0', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 12 },
  categoryText: { fontSize: 14, fontWeight: '600' },
  exercises: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  exerciseGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  exerciseCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, width: '48%', marginBottom: 12, alignItems: 'center', elevation: 2 },
  exerciseIcon: { fontSize: 32, marginBottom: 8 },
  exerciseName: { fontSize: 14, fontWeight: '600', textAlign: 'center', marginBottom: 4 },
  exerciseCal: { fontSize: 12, color: '#666' },
  logCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 24, elevation: 4 },
  logTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  durationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  durationInput: { flex: 1, borderWidth: 1, borderRadius: 8, padding: 12, marginRight: 12, fontSize: 16 },
  durationLabel: { fontSize: 14, color: '#666' },
  logBtn: { padding: 16, borderRadius: 12, alignItems: 'center' },
  logBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  todayLogs: { marginBottom: 40 },
  emptyText: { textAlign: 'center', color: '#666', fontStyle: 'italic', padding: 20 },
  logItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, marginBottom: 8 },
  logIcon: { fontSize: 24, marginRight: 12 },
  logDetails: { flex: 1 },
  logName: { fontSize: 16, fontWeight: '600' },
  logMeta: { fontSize: 12, color: '#666', marginTop: 2 },
  logTime: { fontSize: 12, color: '#666' },
});