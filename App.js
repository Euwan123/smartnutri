import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import ScanScreen from './screens/ScanScreen';
import ChildScreen from './screens/ChildScreen';
import ProfileScreen from './screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#1B5E20' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold', fontSize: 18 },
          tabBarActiveTintColor: '#1B5E20',
          tabBarInactiveTintColor: '#999',
          tabBarStyle: { paddingBottom: 8, paddingTop: 5, height: 65, borderTopWidth: 0, elevation: 10 },
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        }}
      >
        <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22 }}>🏠</Text> }} />
        <Tab.Screen name="Scan Meal" component={ScanScreen} options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22 }}>📷</Text> }} />
        <Tab.Screen name="Child" component={ChildScreen} options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22 }}>👶</Text> }} />
        <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 22 }}>👤</Text> }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}