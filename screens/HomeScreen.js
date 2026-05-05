import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar, ActivityIndicator, Animated, Dimensions } from 'react-native';
import { useState, useCallback, useRef, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
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
        <View style={[ringStyles.fill, {
          borderColor: color,
          borderTopColor: pct > 0.25 ? color : 'transparent',
          borderRightColor: pct > 0.5 ? color : 'transparent',
          borderBottomColor: pct > 0.75 ? color : 'transparent',
        }]} />
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
  const [loading, setLoading] = useState(false);
  const [todayStats, setTodayStats] = useState({
    calories: 1250,
    protein: 45,
    carbs: 180,
    fat: 35,
    water: 6,
    meals: 3
  });

  const mockMeals = [
    { id: 1, name: 'Sinigang na Baboy', calories: 320, time: '12:30 PM', icon: '🍲' },
    { id: 2, name: 'Adobong Manok', calories: 280, time: '8:00 AM', icon: '🍗' },
    { id: 3, name: 'Pancit Canton', calories: 350, time: '6:00 PM', icon: '🍜' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.light }]} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />
      
      <LinearGradient colors={[theme.primary, theme.secondary]} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Good Morning!</Text>
            <Text style={styles.subGreeting}>Let's track your nutrition today</Text>
          </View>
          <TouchableOpacity style={styles.notificationBtn}>
            <Ionicons name="notifications-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.statsCard}>
          <Text style={styles.caloriesBig}>{todayStats.calories}</Text>
          <Text style={styles.caloriesLabel}>calories consumed</Text>
          <View style={styles.goalRow}>
            <Text style={styles.goalText}>Goal: 2000 kcal</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(todayStats.calories / 2000) * 100}%`, backgroundColor: theme.accent }]} />
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.nutrientsSection}>
        <Text style={styles.sectionTitle}>Today's Nutrients</Text>
        <View style={styles.nutrientsRow}>
          <NutrientRing value={todayStats.protein} max={60} color="#42A5F5" label="Protein" unit="g" />
          <NutrientRing value={todayStats.carbs} max={250} color="#FFCA28" label="Carbs" unit="g" />
          <NutrientRing value={todayStats.fat} max={65} color="#AB47BC" label="Fat" unit="g" />
        </View>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={[styles.actionCard, { backgroundColor: theme.card }]} onPress={() => navigation.navigate('ScanTab')}>
            <View style={[styles.actionIcon, { backgroundColor: theme.light }]}>
              <Ionicons name="camera" size={24} color={theme.primary} />
            </View>
            <Text style={styles.actionText}>Scan Meal</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionCard, { backgroundColor: theme.card }]} onPress={() => navigation.navigate('Water')}>
            <View style={[styles.actionIcon, { backgroundColor: theme.light }]}>
              <Ionicons name="water" size={24} color={theme.primary} />
            </View>
            <Text style={styles.actionText}>Water Intake</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionCard, { backgroundColor: theme.card }]} onPress={() => navigation.navigate('Exercise')}>
            <View style={[styles.actionIcon, { backgroundColor: theme.light }]}>
              <Ionicons name="fitness" size={24} color={theme.primary} />
            </View>
            <Text style={styles.actionText}>Exercise</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionCard, { backgroundColor: theme.card }]} onPress={() => navigation.navigate('MealPlan')}>
            <View style={[styles.actionIcon, { backgroundColor: theme.light }]}>
              <Ionicons name="restaurant" size={24} color={theme.primary} />
            </View>
            <Text style={styles.actionText}>Meal Plan</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.recentMeals}>
        <View style={styles.mealsHeader}>
          <Text style={styles.sectionTitle}>Recent Meals</Text>
          <TouchableOpacity onPress={() => navigation.navigate('History')}>
            <Text style={[styles.seeAll, { color: theme.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {mockMeals.map((meal) => (
          <TouchableOpacity key={meal.id} style={[styles.mealCard, { backgroundColor: theme.card }]}>
            <View style={styles.mealLeft}>
              <Text style={styles.mealIcon}>{meal.icon}</Text>
              <View style={styles.mealInfo}>
                <Text style={styles.mealName}>{meal.name}</Text>
                <Text style={styles.mealTime}>{meal.time}</Text>
              </View>
            </View>
            <View style={styles.mealRight}>
              <Text style={styles.mealCalories}>{meal.calories} kcal</Text>
              <Ionicons name="chevron-forward" size={16} color="#ccc" />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 50, paddingBottom: 30, paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  subGreeting: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  notificationBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  statsCard: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: 20, alignItems: 'center' },
  caloriesBig: { fontSize: 48, fontWeight: 'bold', color: '#fff' },
  caloriesLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  goalRow: { flexDirection: 'row', alignItems: 'center', marginTop: 15, width: '100%' },
  goalText: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginRight: 10 },
  progressBar: { flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3 },
  progressFill: { height: '100%', borderRadius: 3 },
  nutrientsSection: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  nutrientsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  quickActions: { padding: 20, paddingTop: 10 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actionCard: { width: '48%', backgroundColor: '#fff', borderRadius: 15, padding: 20, alignItems: 'center', marginBottom: 15, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
  actionIcon: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  actionText: { fontSize: 13, fontWeight: '600', color: '#333' },
  recentMeals: { padding: 20, paddingTop: 10 },
  mealsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  seeAll: { fontSize: 14, fontWeight: '600' },
  mealCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderRadius: 15, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
  mealLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  mealIcon: { fontSize: 30, marginRight: 15 },
  mealInfo: { flex: 1 },
  mealName: { fontSize: 15, fontWeight: '600', color: '#333' },
  mealTime: { fontSize: 12, color: '#999', marginTop: 2 },
  mealRight: { alignItems: 'flex-end' },
  mealCalories: { fontSize: 16, fontWeight: 'bold', color: '#1B5E20', marginBottom: 2 },
});
