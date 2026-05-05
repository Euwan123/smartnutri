import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '../firebase';

const recipes = [
  {
    id: 1,
    name: 'Chicken Tinola',
    image: '🍲',
    ingredients: ['Chicken', 'Ginger', 'Garlic', 'Onion', 'Calabaza', 'Malunggay'],
    calories: 280,
    protein: 25,
    carbs: 15,
    fat: 12,
    instructions: '1. Sauté garlic, onion, and ginger. 2. Add chicken and cook until brown. 3. Add water and calabaza. 4. Simmer until tender. 5. Add malunggay leaves.',
    prepTime: '45 mins',
    difficulty: 'Easy'
  },
  {
    id: 2,
    name: 'Tuna Pie',
    image: '🥧',
    ingredients: ['Tuna', 'Potatoes', 'Carrots', 'Onion', 'Pie crust', 'Cheese'],
    calories: 420,
    protein: 22,
    carbs: 35,
    fat: 18,
    instructions: '1. Cook tuna with vegetables. 2. Fill pie crust. 3. Top with cheese. 4. Bake at 375°F for 30 mins.',
    prepTime: '60 mins',
    difficulty: 'Medium'
  },
  {
    id: 3,
    name: 'Vegetable Sinigang',
    image: '🍜',
    ingredients: ['Tamarind', 'Tomatoes', 'Onion', 'Eggplant', 'Radish', 'Kangkong'],
    calories: 180,
    protein: 8,
    carbs: 25,
    fat: 4,
    instructions: '1. Boil tamarind soup base. 2. Add tomatoes and onion. 3. Add vegetables. 4. Simmer until tender.',
    prepTime: '40 mins',
    difficulty: 'Easy'
  },
  {
    id: 4,
    name: 'Beef Caldereta',
    image: '🍖',
    ingredients: ['Beef', 'Potatoes', 'Carrots', 'Bell peppers', 'Tomato sauce', 'Cheese'],
    calories: 450,
    protein: 30,
    carbs: 20,
    fat: 25,
    instructions: '1. Brown beef cubes. 2. Add tomato sauce and simmer. 3. Add vegetables. 4. Top with cheese before serving.',
    prepTime: '90 mins',
    difficulty: 'Medium'
  },
  {
    id: 5,
    name: 'Pancit Canton',
    image: '🍜',
    ingredients: ['Noodles', 'Chicken', 'Shrimp', 'Vegetables', 'Soy sauce', 'Calamansi'],
    calories: 380,
    protein: 18,
    carbs: 45,
    fat: 8,
    instructions: '1. Cook noodles. 2. Stir-fry meat and vegetables. 3. Mix with noodles. 4. Season with soy sauce.',
    prepTime: '30 mins',
    difficulty: 'Easy'
  }
];

export default function RecipeScreen({ navigation }) {
  const { theme } = useTheme();
  const [userMeals, setUserMeals] = useState([]);
  const [recommendedRecipes, setRecommendedRecipes] = useState([]);

  useEffect(() => {
    loadUserMeals();
  }, []);

  const loadUserMeals = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, 'users', user.uid, 'meals'),
        orderBy('date', 'desc'),
        limit(10)
      );
      const querySnapshot = await getDocs(q);
      const meals = querySnapshot.docs.map(doc => doc.data());
      setUserMeals(meals);
      generateRecommendations(meals);
    } catch (error) {
      console.error('Error loading meals:', error);
    }
  };

  const generateRecommendations = (meals) => {
    // Simple recommendation logic based on recent meals
    const recentFoods = meals.slice(0, 5).map(m => m.name.toLowerCase());

    let recommendations = [];

    if (recentFoods.some(f => f.includes('chicken'))) {
      recommendations.push(recipes.find(r => r.name === 'Chicken Tinola'));
    }
    if (recentFoods.some(f => f.includes('fish') || f.includes('tuna'))) {
      recommendations.push(recipes.find(r => r.name === 'Tuna Pie'));
    }
    if (recentFoods.some(f => f.includes('vegetable'))) {
      recommendations.push(recipes.find(r => r.name === 'Vegetable Sinigang'));
    }

    // Add popular recipes if no specific recommendations
    if (recommendations.length === 0) {
      recommendations = recipes.slice(0, 3);
    }

    setRecommendedRecipes(recommendations.filter(Boolean));
  };

  const RecipeCard = ({ recipe }) => (
    <TouchableOpacity
      style={[styles.recipeCard, { backgroundColor: theme.cardBackground }]}
      onPress={() => navigation.navigate('RecipeDetail', { recipe })}
    >
      <View style={styles.recipeHeader}>
        <Text style={styles.recipeEmoji}>{recipe.image}</Text>
        <View style={styles.recipeMeta}>
          <Text style={[styles.recipeTime, { color: theme.textSecondary }]}>{recipe.prepTime}</Text>
          <Text style={[styles.recipeDifficulty, {
            color: recipe.difficulty === 'Easy' ? '#4CAF50' : recipe.difficulty === 'Medium' ? '#FF9800' : '#F44336'
          }]}>
            {recipe.difficulty}
          </Text>
        </View>
      </View>

      <Text style={[styles.recipeName, { color: theme.text }]}>{recipe.name}</Text>

      <View style={styles.nutritionRow}>
        <Text style={[styles.nutritionText, { color: theme.textSecondary }]}>
          {recipe.calories} cal • {recipe.protein}g protein
        </Text>
      </View>

      <View style={styles.ingredientsPreview}>
        <Text style={[styles.ingredientsText, { color: theme.textSecondary }]}>
          {recipe.ingredients.slice(0, 3).join(', ')}{recipe.ingredients.length > 3 ? '...' : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>🍳 Recipe Suggestions</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Personalized recipes based on your recent meals
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Recommended for You</Text>
        {recommendedRecipes.map(recipe => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Popular Recipes</Text>
        {recipes.slice(0, 3).map(recipe => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 40 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666' },
  section: { padding: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  recipeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recipeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  recipeEmoji: { fontSize: 32 },
  recipeMeta: { alignItems: 'flex-end' },
  recipeTime: { fontSize: 12, fontWeight: '600' },
  recipeDifficulty: { fontSize: 12, fontWeight: 'bold' },
  recipeName: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  nutritionRow: { marginBottom: 8 },
  nutritionText: { fontSize: 14 },
  ingredientsPreview: { marginTop: 8 },
  ingredientsText: { fontSize: 13, fontStyle: 'italic' },
});