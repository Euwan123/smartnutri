import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  USER: 'smartnutri_user',
  MEALS: 'smartnutri_meals',
  SETTINGS: 'smartnutri_settings'
};

export const StorageService = {
  async getUser() {
    try {
      const user = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  },

  async setUser(user) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error('Set user error:', error);
    }
  },

  async removeUser() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    } catch (error) {
      console.error('Remove user error:', error);
    }
  },

  async getMeals() {
    try {
      const meals = await AsyncStorage.getItem(STORAGE_KEYS.MEALS);
      return meals ? JSON.parse(meals) : [];
    } catch (error) {
      console.error('Get meals error:', error);
      return [];
    }
  },

  async addMeal(meal) {
    try {
      const meals = await this.getMeals();
      meals.push({
        ...meal,
        id: Date.now().toString(),
        date: new Date().toISOString()
      });
      await AsyncStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(meals));
    } catch (error) {
      console.error('Add meal error:', error);
    }
  },

  async getSettings() {
    try {
      const settings = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      return settings ? JSON.parse(settings) : {
        calorieGoal: 2000,
        location: 'Davao City',
        isPublic: true
      };
    } catch (error) {
      console.error('Get settings error:', error);
      return {
        calorieGoal: 2000,
        location: 'Davao City',
        isPublic: true
      };
    }
  },

  async setSettings(settings) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Set settings error:', error);
    }
  }
};
