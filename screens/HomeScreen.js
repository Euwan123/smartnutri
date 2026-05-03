import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar, Animated, Dimensions, RefreshControl } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { BarChart } from 'react-native-chart-kit';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const meals = [
  { name: 'Sinigang na Baboy', cal: 320, icon: '🍲', time: '7:30 AM' },
  { name: 'Sinangag + Itlog', cal: 410, icon: '🍳', time: '12:00 PM' },
  { name: 'Adobong Manok', cal: 510, icon: '🍗', time: '6:00 PM' },
];

const nutrients = [
  { label: 'Calories', value: 1240, max: 2000, unit: 'kcal', color: '#FF7043' },
  { label: 'Protein', value: 48, max: 60, unit: 'g', color: '#42A5F5' },
  { label: 'Carbs', value: 160, max: 250, unit: 'g', color: '#FFCA28' },
  { label: 'Fat', value: 32, max: 65, unit: 'g', color: '#AB47BC' },
];

const chartData = {
  labels: nutrients.map(n => n.label.slice(0, 4)),
  datasets: [{
    data: nutrients.map(n => (n.value / n.max) * 100),
  }],
};

export default function HomeScreen() {
  const navigation = useNavigation();
  const [greeting] = useState(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 18) return 'Good Afternoon';
    return 'Good Evening';
  });
  const [refreshing, setRefreshing] = useState(false);

  const progressAnims = useRef(nutrients.map(() => new Animated.Value(0))).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    const animations = progressAnims.map((anim, i) =>
      Animated.timing(anim, {
        toValue: (nutrients[i].value / nutrients[i].max) * 100,
        duration: 1000,
        useNativeDriver: false,
      })
    );
    Animated.stagger(200, animations).start();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      progressAnims.forEach(anim => anim.setValue(0));
      const animations = progressAnims.map((anim, i) =>
        Animated.timing(anim, {
          toValue: (nutrients[i].value / nutrients[i].max) * 100,
          duration: 1000,
          useNativeDriver: false,
        })
      );
      Animated.stagger(200, animations).start();
      setRefreshing(false);
    }, 1000);
  };

  const handleMealPress = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1B5E20']} />}
      >
        <StatusBar barStyle="light-content" backgroundColor="#1B5E20" />

        <LinearGradient colors={['#1B5E20', '#2E7D32']} style={styles.banner}>
          <Text style={styles.greeting}>{greeting} 👋</Text>
          <Text style={styles.bannerTitle}>Smart Nutri Scanner</Text>
          <Text style={styles.bannerSub}>AI-Powered Meal Analyzer for Filipino Diets</Text>
        </LinearGradient>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Today's Nutrition</Text>
          <BarChart
            data={chartData}
            width={width - (width > 400 ? 64 : 48)}
            height={200}
            yAxisSuffix="%"
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(27, 94, 32, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: { borderRadius: 16 },
              propsForLabels: { fontSize: width > 400 ? 12 : 10 },
            }}
            style={styles.chart}
            showValuesOnTopOfBars
          />
        </View>

        <View style={styles.alertCard}>
          <View style={styles.alertHeader}>
            <Text style={styles.alertIcon}>⚠️</Text>
            <Text style={styles.alertTitle}>Child Nutrition Alert</Text>
          </View>
          <Text style={styles.alertText}>Juan (Age 4) is low on Iron today. Consider adding malunggay, sitaw, or kangkong to the next meal.</Text>
          <TouchableOpacity style={styles.alertBtn} onPress={() => navigation.navigate('Child')}>
            <Text style={styles.alertBtnText}>View Child Profile →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🍽️ Recent Meals</Text>
          {meals.map((meal, i) => (
            <TouchableOpacity key={i} style={styles.mealItem} activeOpacity={0.7} onPress={handleMealPress}>
              <View style={styles.mealLeft}>
                <Text style={styles.mealIcon}>{meal.icon}</Text>
                <View>
                  <Text style={styles.mealName}>{meal.name}</Text>
                  <Text style={styles.mealTime}>{meal.time}</Text>
                </View>
              </View>
              <Text style={styles.mealCal}>{meal.cal} kcal</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>💡 Meal Suggestion</Text>
          <Text style={styles.suggestionText}>Based on your intake today, try having <Text style={styles.bold}>Tinolang Manok</Text> for dinner — rich in Vitamin A and low in fat.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚡ Quick Actions</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Scan Meal')}>
              <Text style={styles.actionIcon}>📷</Text>
              <Text style={styles.actionText}>Scan Meal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Profile')}>
              <Text style={styles.actionIcon}>👤</Text>
              <Text style={styles.actionText}>View Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F8E9' },
  scroll: { flex: 1 },
  banner: { padding: width > 400 ? 32 : 24, paddingTop: width > 400 ? 40 : 32 },
  greeting: { color: '#A5D6A7', fontSize: width > 400 ? 16 : 14, marginBottom: 6 },
  bannerTitle: { color: '#fff', fontSize: width > 400 ? 26 : 22, fontWeight: 'bold' },
  bannerSub: { color: '#C8E6C9', fontSize: width > 400 ? 14 : 12, marginTop: 6 },
  card: { backgroundColor: '#fff', margin: width > 400 ? 16 : 12, marginBottom: 0, borderRadius: 18, padding: width > 400 ? 20 : 16, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  cardTitle: { fontSize: width > 400 ? 18 : 16, fontWeight: 'bold', color: '#1B5E20', marginBottom: 16 },
  chart: { marginVertical: 8, borderRadius: 16 },
  alertCard: { backgroundColor: '#FFF8E1', margin: width > 400 ? 16 : 12, marginBottom: 0, borderRadius: 18, padding: width > 400 ? 20 : 16, borderLeftWidth: 5, borderLeftColor: '#FFA000', elevation: 3 },
  alertHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  alertIcon: { fontSize: width > 400 ? 22 : 20, marginRight: 10 },
  alertTitle: { fontSize: width > 400 ? 18 : 16, fontWeight: 'bold', color: '#E65100' },
  alertText: { color: '#555', fontSize: width > 400 ? 15 : 14, lineHeight: 24 },
  alertBtn: { marginTop: 12 },
  alertBtnText: { color: '#1B5E20', fontWeight: 'bold', fontSize: width > 400 ? 14 : 13 },
  mealItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  mealLeft: { flexDirection: 'row', alignItems: 'center' },
  mealIcon: { fontSize: width > 400 ? 30 : 26, marginRight: 14 },
  mealName: { fontSize: width > 400 ? 15 : 14, fontWeight: '600', color: '#333' },
  mealTime: { fontSize: width > 400 ? 13 : 12, color: '#999', marginTop: 3 },
  mealCal: { fontSize: width > 400 ? 15 : 14, color: '#888', fontWeight: '500' },
  suggestionText: { fontSize: width > 400 ? 15 : 14, color: '#555', lineHeight: 24 },
  bold: { fontWeight: 'bold', color: '#1B5E20' },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  actionBtn: { alignItems: 'center', padding: 16, backgroundColor: '#E8F5E8', borderRadius: 12, flex: 1, marginHorizontal: 8 },
  actionIcon: { fontSize: 24, marginBottom: 8 },
  actionText: { fontSize: width > 400 ? 14 : 12, color: '#1B5E20', fontWeight: '600' },
});