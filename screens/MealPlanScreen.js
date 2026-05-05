import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
const sampleMeals = {
  'Breakfast': [
    { name: 'Oatmeal with Fruits', icon: '🥣', calories: 250, protein: 8, carbs: 45, fat: 5 },
    { name: 'Eggs and Toast', icon: '🍳', calories: 320, protein: 18, carbs: 25, fat: 15 },
    { name: 'Smoothie Bowl', icon: '🍓', calories: 280, protein: 12, carbs: 40, fat: 8 },
    { name: 'Pancakes', icon: '🥞', calories: 350, protein: 10, carbs: 50, fat: 12 },
  ],
  'Lunch': [
    { name: 'Chicken Salad', icon: '🥗', calories: 380, protein: 32, carbs: 15, fat: 18 },
    { name: 'Grilled Fish', icon: '🐟', calories: 320, protein: 35, carbs: 8, fat: 14 },
    { name: 'Vegetable Stir Fry', icon: '🥦', calories: 280, protein: 12, carbs: 35, fat: 10 },
    { name: 'Pasta with Sauce', icon: '🍝', calories: 420, protein: 15, carbs: 65, fat: 12 },
  ],
  'Dinner': [
    { name: 'Grilled Chicken', icon: '🍗', calories: 350, protein: 40, carbs: 5, fat: 16 },
    { name: 'Beef Stew', icon: '🍲', calories: 380, protein: 32, carbs: 20, fat: 18 },
    { name: 'Salmon with Rice', icon: '🍚', calories: 420, protein: 35, carbs: 30, fat: 20 },
    { name: 'Vegetable Curry', icon: '🍛', calories: 320, protein: 12, carbs: 45, fat: 14 },
  ],
  'Snacks': [
    { name: 'Apple with Nuts', icon: '🍎', calories: 180, protein: 5, carbs: 25, fat: 10 },
    { name: 'Yogurt', icon: '🥛', calories: 150, protein: 12, carbs: 15, fat: 5 },
    { name: 'Banana', icon: '🍌', calories: 105, protein: 1, carbs: 27, fat: 0 },
    { name: 'Protein Bar', icon: '📦', calories: 220, protein: 20, carbs: 20, fat: 8 },
  ],
};

export default function MealPlanScreen() {
  const { theme } = useTheme();
  const [selectedDate, setSelectedDate] = useState(new Date().toDateString());
  const [plannedMeals, setPlannedMeals] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMealPlan();
  }, [selectedDate]);

  const loadMealPlan = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      const q = query(
        collection(db, 'users', user.uid, 'mealPlans'),
        where('date', '==', selectedDate)
      );
      const snapshot = await getDocs(q);
      const plans = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        plans[data.mealType] = { ...data, id: doc.id };
      });
      setPlannedMeals(plans);
    } catch (error) {
      console.log('Error loading meal plan:', error);
    }
    setLoading(false);
  };

  const addMealToPlan = async (mealType, meal) => {
    try {
      const user = auth.currentUser;
      const existingMeal = plannedMeals[mealType];

      if (existingMeal) {
        await deleteDoc(doc(db, 'users', user.uid, 'mealPlans', existingMeal.id));
      }

      await addDoc(collection(db, 'users', user.uid, 'mealPlans'), {
        mealType,
        ...meal,
        date: selectedDate,
        timestamp: new Date().toISOString(),
      });

      setPlannedMeals(prev => ({
        ...prev,
        [mealType]: meal
      }));

      Alert.alert('✅ Meal Planned!', `${meal.name} added to ${mealType}.`);
    } catch (error) {
      Alert.alert('Error', 'Failed to plan meal');
    }
  };

  const removeMealFromPlan = async (mealType) => {
    try {
      const user = auth.currentUser;
      const meal = plannedMeals[mealType];
      if (meal && meal.id) {
        await deleteDoc(doc(db, 'users', user.uid, 'mealPlans', meal.id));
      }

      setPlannedMeals(prev => {
        const newPlans = { ...prev };
        delete newPlans[mealType];
        return newPlans;
      });

      Alert.alert('✅ Meal Removed', `${meal.name} removed from ${mealType}.`);
    } catch (error) {
      Alert.alert('Error', 'Failed to remove meal');
    }
  };

  const getTotalNutrition = () => {
    let total = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    Object.values(plannedMeals).forEach(meal => {
      if (meal.calories) {
        total.calories += meal.calories;
        total.protein += meal.protein || 0;
        total.carbs += meal.carbs || 0;
        total.fat += meal.fat || 0;
      }
    });
    return total;
  };

  const totalNutrition = getTotalNutrition();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.light }]} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.primary }]}>📅 Meal Planner</Text>
        <Text style={styles.sub}>Plan your meals for the day</Text>
      </View>

      <View style={[styles.dateCard, { backgroundColor: theme.card }]}>
        <Text style={[styles.dateText, { color: theme.primary }]}>
          {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </Text>
        <View style={styles.dateButtons}>
          <TouchableOpacity
            style={[styles.dateBtn, { backgroundColor: theme.primary }]}
            onPress={() => setSelectedDate(new Date(Date.now() - 86400000).toDateString())}
          >
            <Text style={styles.dateBtnText}>Yesterday</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.dateBtn, { backgroundColor: theme.primary }]}
            onPress={() => setSelectedDate(new Date().toDateString())}
          >
            <Text style={styles.dateBtnText}>Today</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.dateBtn, { backgroundColor: theme.primary }]}
            onPress={() => setSelectedDate(new Date(Date.now() + 86400000).toDateString())}
          >
            <Text style={styles.dateBtnText}>Tomorrow</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.nutritionCard, { backgroundColor: theme.card }]}>
        <Text style={[styles.nutritionTitle, { color: theme.primary }]}>Daily Nutrition Summary</Text>
        <View style={styles.nutritionRow}>
          <View style={styles.nutritionItem}>
            <Text style={[styles.nutritionNum, { color: theme.primary }]}>{totalNutrition.calories}</Text>
            <Text style={styles.nutritionLabel}>Calories</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={[styles.nutritionNum, { color: theme.primary }]}>{totalNutrition.protein}g</Text>
            <Text style={styles.nutritionLabel}>Protein</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={[styles.nutritionNum, { color: theme.primary }]}>{totalNutrition.carbs}g</Text>
            <Text style={styles.nutritionLabel}>Carbs</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={[styles.nutritionNum, { color: theme.primary }]}>{totalNutrition.fat}g</Text>
            <Text style={styles.nutritionLabel}>Fat</Text>
          </View>
        </View>
      </View>

      {mealTypes.map(mealType => (
        <View key={mealType} style={[styles.mealSection, { backgroundColor: theme.card }]}>
          <View style={styles.mealHeader}>
            <Text style={[styles.mealType, { color: theme.primary }]}>{mealType}</Text>
            {plannedMeals[mealType] && (
              <TouchableOpacity onPress={() => removeMealFromPlan(mealType)}>
                <Ionicons name="trash-outline" size={20} color="#E53935" />
              </TouchableOpacity>
            )}
          </View>

          {plannedMeals[mealType] ? (
            <View style={styles.plannedMeal}>
              <Text style={styles.plannedIcon}>{plannedMeals[mealType].icon}</Text>
              <View style={styles.plannedDetails}>
                <Text style={styles.plannedName}>{plannedMeals[mealType].name}</Text>
                <Text style={styles.plannedNutrition}>
                  {plannedMeals[mealType].calories} cal • {plannedMeals[mealType].protein}g protein
                </Text>
              </View>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mealOptions}>
              {sampleMeals[mealType].map((meal, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.mealOption}
                  onPress={() => addMealToPlan(mealType, meal)}
                >
                  <Text style={styles.optionIcon}>{meal.icon}</Text>
                  <Text style={styles.optionName}>{meal.name}</Text>
                  <Text style={styles.optionCal}>{meal.calories} cal</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  sub: { fontSize: 14, color: '#666' },
  dateCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 20, elevation: 4 },
  dateText: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  dateButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  dateBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  dateBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  nutritionCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 20, elevation: 4 },
  nutritionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 16 },
  nutritionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  nutritionItem: { alignItems: 'center' },
  nutritionNum: { fontSize: 18, fontWeight: 'bold' },
  nutritionLabel: { fontSize: 12, color: '#666', marginTop: 4 },
  mealSection: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 16, elevation: 4 },
  mealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  mealType: { fontSize: 18, fontWeight: 'bold' },
  plannedMeal: { flexDirection: 'row', alignItems: 'center' },
  plannedIcon: { fontSize: 32, marginRight: 16 },
  plannedDetails: { flex: 1 },
  plannedName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  plannedNutrition: { fontSize: 12, color: '#666' },
  mealOptions: { marginHorizontal: -20, paddingHorizontal: 20 },
  mealOption: { backgroundColor: '#f8f9fa', borderRadius: 12, padding: 16, marginRight: 12, width: 140, alignItems: 'center' },
  optionIcon: { fontSize: 24, marginBottom: 8 },
  optionName: { fontSize: 12, fontWeight: '600', textAlign: 'center', marginBottom: 4 },
  optionCal: { fontSize: 10, color: '#666' },
});