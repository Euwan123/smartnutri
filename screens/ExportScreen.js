import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Share, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function ExportScreen() {
  const { theme } = useTheme();
  const [loadingType, setLoadingType] = useState(null);

  const exportData = async (dataType) => {
    setLoadingType(dataType);
    try {
      const user = auth.currentUser;
      let data = [];

      if (dataType === 'meals') {
        const snap = await getDocs(query(collection(db, 'users', user.uid, 'meals'), orderBy('date', 'desc')));
        data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } else if (dataType === 'children') {
        const snap = await getDocs(collection(db, 'users', user.uid, 'children'));
        data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } else if (dataType === 'water') {
        const snap = await getDocs(query(collection(db, 'users', user.uid, 'water'), orderBy('date', 'desc')));
        data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } else if (dataType === 'exercises') {
        const snap = await getDocs(query(collection(db, 'users', user.uid, 'exercises'), orderBy('date', 'desc')));
        data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } else if (dataType === 'all') {
        const [mealsSnap, childrenSnap, waterSnap, exerciseSnap] = await Promise.all([
          getDocs(query(collection(db, 'users', user.uid, 'meals'), orderBy('date', 'desc'))),
          getDocs(collection(db, 'users', user.uid, 'children')),
          getDocs(query(collection(db, 'users', user.uid, 'water'), orderBy('date', 'desc'))),
          getDocs(query(collection(db, 'users', user.uid, 'exercises'), orderBy('date', 'desc'))),
        ]);
        data = {
          meals: mealsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
          children: childrenSnap.docs.map(d => ({ id: d.id, ...d.data() })),
          water: waterSnap.docs.map(d => ({ id: d.id, ...d.data() })),
          exercises: exerciseSnap.docs.map(d => ({ id: d.id, ...d.data() })),
          exportDate: new Date().toISOString(),
        };
      }

      const output = JSON.stringify(data, null, 2);
      await Share.share({ message: output, title: `${dataType}_export.json` });
      Alert.alert('Export Complete', `Your ${dataType} data has been exported successfully.`);
    } catch (error) {
      console.log('Export error:', error);
      Alert.alert('Error', 'Failed to export data. Please try again.');
    }
    setLoadingType(null);
  };

  const exportOptions = [
    { type: 'meals', title: 'Meal History', icon: '🍽️', description: 'Export all logged meals with nutrition data' },
    { type: 'children', title: 'Children Data', icon: '👶', description: 'Export child profiles and nutrition tracking' },
    { type: 'water', title: 'Water Tracking', icon: '💧', description: 'Export daily water intake records' },
    { type: 'exercises', title: 'Exercise History', icon: '🏋️', description: 'Export workout logs and calorie burn data' },
    { type: 'all', title: 'All Data', icon: '📊', description: 'Export complete health and nutrition data' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.light }]} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.primary }]}>📤 Export Data</Text>
        <Text style={styles.sub}>Download your health data for backup or analysis</Text>
      </View>

      <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
        <Ionicons name="information-circle-outline" size={24} color={theme.primary} />
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Data Export Information</Text>
          <Text style={styles.infoText}>
            Your data will be exported in JSON format. You can save it to your device or share it with health professionals.
          </Text>
        </View>
      </View>

      {exportOptions.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.exportCard, { backgroundColor: theme.card }]}
          onPress={() => exportData(option.type)}
          disabled={loadingType !== null}
        >
          <View style={styles.exportHeader}>
            <Text style={styles.exportIcon}>{option.icon}</Text>
            <View style={styles.exportInfo}>
              <Text style={styles.exportTitle}>{option.title}</Text>
              <Text style={styles.exportDescription}>{option.description}</Text>
            </View>
            <View style={[styles.exportBtn, { backgroundColor: theme.primary }]}>
              {loadingType === option.type ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons name="download-outline" size={16} color="#fff" />
              )}
            </View>
          </View>
        </TouchableOpacity>
      ))}

      <View style={[styles.disclaimerCard, { backgroundColor: theme.card }]}>
        <Ionicons name="shield-checkmark-outline" size={24} color="#2E7D32" />
        <View style={styles.disclaimerContent}>
          <Text style={styles.disclaimerTitle}>Privacy & Security</Text>
          <Text style={styles.disclaimerText}>
            Your exported data contains personal health information. Keep it secure and only share with trusted parties.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  sub: { fontSize: 14, color: '#666' },
  infoCard: { borderRadius: 20, padding: 20, marginBottom: 20, elevation: 4, flexDirection: 'row', alignItems: 'flex-start' },
  infoContent: { flex: 1, marginLeft: 12 },
  infoTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  infoText: { fontSize: 14, color: '#666', lineHeight: 20 },
  exportCard: { borderRadius: 20, padding: 20, marginBottom: 16, elevation: 4 },
  exportHeader: { flexDirection: 'row', alignItems: 'center' },
  exportIcon: { fontSize: 32, marginRight: 16 },
  exportInfo: { flex: 1 },
  exportTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  exportDescription: { fontSize: 14, color: '#666', lineHeight: 20 },
  exportBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  disclaimerCard: { borderRadius: 20, padding: 20, marginBottom: 40, elevation: 4, flexDirection: 'row', alignItems: 'flex-start' },
  disclaimerContent: { flex: 1, marginLeft: 12 },
  disclaimerTitle: { fontSize: 16, fontWeight: 'bold', color: '#2E7D32', marginBottom: 8 },
  disclaimerText: { fontSize: 14, color: '#666', lineHeight: 20 },
});