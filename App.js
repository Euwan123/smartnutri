import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { auth } from './firebase';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import HomeScreen from './screens/HomeScreen';
import ScanScreen from './screens/ScanScreen';
import HistoryScreen from './screens/HistoryScreen';
import CommunityScreen from './screens/CommunityScreen';
import ProfileScreen from './screens/ProfileScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import TermsScreen from './screens/TermsScreen';
import ChildScreen from './screens/ChildScreen';
import WaterScreen from './screens/WaterScreen';
import ExerciseScreen from './screens/ExerciseScreen';
import MealPlanScreen from './screens/MealPlanScreen';
import ExportScreen from './screens/ExportScreen';
import RecipeScreen from './screens/RecipeScreen';
import RecipeDetailScreen from './screens/RecipeDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function CustomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const tabs = [
    { name: 'Home', icon: 'home', iconOutline: 'home-outline' },
    { name: 'History', icon: 'calendar', iconOutline: 'calendar-outline' },
    { name: 'ScanTab', icon: 'camera', iconOutline: 'camera-outline', isCenter: true },
    { name: 'Community', icon: 'people', iconOutline: 'people-outline' },
    { name: 'Profile', icon: 'person', iconOutline: 'person-outline' },
  ];

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom + 8, backgroundColor: theme.card }]}>
      {tabs.map((tab, index) => {
        const route = state.routes[index];
        const isFocused = state.index === index;
        if (tab.isCenter) {
          return (
            <TouchableOpacity key={index} style={styles.centerBtn} onPress={() => navigation.navigate('ScanTab')} activeOpacity={0.8}>
              <View style={[styles.centerBtnInner, { backgroundColor: theme.primary }]}>
                <Ionicons name="camera" size={28} color="#fff" />
              </View>
            </TouchableOpacity>
          );
        }
        return (
          <TouchableOpacity key={index} style={styles.tabItem} onPress={() => navigation.navigate(route.name)} activeOpacity={0.7}>
            <Ionicons name={isFocused ? tab.icon : tab.iconOutline} size={24} color={isFocused ? theme.primary : '#bbb'} />
            <Text style={[styles.tabLabel, { color: isFocused ? theme.primary : '#bbb' }]}>{tab.name === 'ScanTab' ? 'Scan' : tab.name}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="ScanTab" component={ScanScreen} options={{ title: 'Scan Meal' }} />
      <Tab.Screen name="Community" component={CommunityScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => { setUser(u); setLoading(false); });
    return unsub;
  }, []);

  if (loading) return (
    <View style={[styles.splash, { backgroundColor: theme.primary }]}>
      <Ionicons name="leaf" size={60} color="#fff" />
      <Text style={styles.splashTitle}>Smart Nutri Scanner</Text>
      <Text style={styles.splashSub}>AI-Powered Filipino Meal Analyzer</Text>
    </View>
  );

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="Child" component={ChildScreen} />
            <Stack.Screen name="Water" component={WaterScreen} />
            <Stack.Screen name="Exercise" component={ExerciseScreen} />
            <Stack.Screen name="MealPlan" component={MealPlanScreen} />
            <Stack.Screen name="Export" component={ExportScreen} />
            <Stack.Screen name="Recipe" component={RecipeScreen} />
            <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Terms" component={TermsScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: { flexDirection: 'row', alignItems: 'center', paddingTop: 10, borderTopWidth: 0, elevation: 20, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 20 },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 4 },
  tabLabel: { fontSize: 10, fontWeight: '600', marginTop: 3 },
  centerBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: -24 },
  centerBtnInner: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', elevation: 8, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, borderWidth: 3, borderColor: '#fff' },
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  splashTitle: { color: '#fff', fontSize: 26, fontWeight: 'bold' },
  splashSub: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
});
