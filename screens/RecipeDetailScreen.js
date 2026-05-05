import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function RecipeDetailScreen({ route, navigation }) {
  const { theme } = useTheme();
  const { recipe } = route.params;

  const addToMealPlan = () => {
    Alert.alert(
      'Add to Meal Plan',
      `Add ${recipe.name} to your meal plan?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Add', onPress: () => Alert.alert('Success', 'Recipe added to meal plan!') }
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={styles.recipeEmoji}>{recipe.image}</Text>
        <Text style={[styles.recipeName, { color: theme.text }]}>{recipe.name}</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={[styles.metaLabel, { color: theme.textSecondary }]}>Prep Time</Text>
            <Text style={[styles.metaValue, { color: theme.text }]}>{recipe.prepTime}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={[styles.metaLabel, { color: theme.textSecondary }]}>Difficulty</Text>
            <Text style={[styles.metaValue, {
              color: recipe.difficulty === 'Easy' ? '#4CAF50' : recipe.difficulty === 'Medium' ? '#FF9800' : '#F44336'
            }]}>
              {recipe.difficulty}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Nutrition Facts</Text>
        <View style={styles.nutritionGrid}>
          {[
            { label: 'Calories', value: recipe.calories, unit: 'kcal', color: '#FF7043' },
            { label: 'Protein', value: recipe.protein, unit: 'g', color: '#42A5F5' },
            { label: 'Carbs', value: recipe.carbs, unit: 'g', color: '#FFCA28' },
            { label: 'Fat', value: recipe.fat, unit: 'g', color: '#AB47BC' }
          ].map((item, index) => (
            <View key={index} style={[styles.nutritionItem, { backgroundColor: item.color + '20' }]}>
              <Text style={[styles.nutritionValue, { color: item.color }]}>{item.value}</Text>
              <Text style={[styles.nutritionUnit, { color: item.color }]}>{item.unit}</Text>
              <Text style={[styles.nutritionLabel, { color: theme.textSecondary }]}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Ingredients</Text>
        {recipe.ingredients.map((ingredient, index) => (
          <View key={index} style={styles.ingredientRow}>
            <Text style={[styles.bullet, { color: theme.primary }]}>•</Text>
            <Text style={[styles.ingredientText, { color: theme.text }]}>{ingredient}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Instructions</Text>
        {recipe.instructions.split('. ').map((step, index) => (
          <View key={index} style={styles.instructionRow}>
            <Text style={[styles.stepNumber, { backgroundColor: theme.primary, color: '#fff' }]}>
              {index + 1}
            </Text>
            <Text style={[styles.instructionText, { color: theme.text }]}>
              {step.trim()}{step.endsWith('.') ? '' : '.'}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.primary }]}
          onPress={addToMealPlan}
        >
          <Text style={styles.actionButtonText}>📅 Add to Meal Plan</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
          onPress={() => Alert.alert('Success', 'Recipe saved to favorites!')}
        >
          <Text style={styles.actionButtonText}>❤️ Save Recipe</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', padding: 20, paddingTop: 40 },
  recipeEmoji: { fontSize: 64, marginBottom: 16 },
  recipeName: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: 20 },
  metaItem: { alignItems: 'center' },
  metaLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  metaValue: { fontSize: 16, fontWeight: 'bold', marginTop: 4 },
  section: { padding: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  nutritionGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  nutritionItem: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  nutritionValue: { fontSize: 24, fontWeight: 'bold' },
  nutritionUnit: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  nutritionLabel: { fontSize: 12, marginTop: 4, textAlign: 'center' },
  ingredientRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  bullet: { fontSize: 16, marginRight: 12, marginTop: 2 },
  ingredientText: { fontSize: 16, flex: 1, lineHeight: 24 },
  instructionRow: { flexDirection: 'row', marginBottom: 16 },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 12,
    marginTop: 2,
  },
  instructionText: { fontSize: 16, flex: 1, lineHeight: 24 },
  actions: { padding: 20, paddingBottom: 40 },
  actionButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 3,
  },
  actionButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});