import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View } from 'react-native';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import HomeScreen from './screens/HomeScreen';
import ScanScreen from './screens/ScanScreen';
import HistoryScreen from './screens/HistoryScreen';
import CommunityScreen from './screens/CommunityScreen';
import ProfileScreen from './screens/ProfileScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import ChildScreen from './screens/ChildScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabIcon({ emoji, label, focused }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: focused ? 24 : 20, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#1B5E20', elevation: 0, shadowOpacity: 0 },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold', fontSize: 18 },
        tabBarStyle: { height: 65, paddingBottom: 10, paddingTop: 6, borderTopWidth: 0, elevation: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, backgroundColor: '#fff' },
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700', marginTop: -2 },
        tabBarActiveTintColor: '#1B5E20',
        tabBarInactiveTintColor: '#bbb',
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: (p) => <TabIcon emoji="🏠" {...p} />, tabBarLabel: 'Home' }} />
      <Tab.Screen name="Scan Meal" component={ScanScreen} options={{ tabBarIcon: (p) => <TabIcon emoji="📷" {...p} />, tabBarLabel: 'Scan' }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ tabBarIcon: (p) => <TabIcon emoji="📅" {...p} />, tabBarLabel: 'History' }} />
      <Tab.Screen name="Community" component={CommunityScreen} options={{ tabBarIcon: (p) => <TabIcon emoji="👥" {...p} />, tabBarLabel: 'Community' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: (p) => <TabIcon emoji="👤" {...p} />, tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => { setUser(u); setLoading(false); });
    return unsub;
  }, []);

  if (loading) return (
    <View style={{ flex: 1, backgroundColor: '#1B5E20', alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 60 }}>🥗</Text>
      <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold', marginTop: 16 }}>Smart Nutri Scanner</Text>
    </View>
  );

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="Child" component={ChildScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}