import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Share } from 'react-native';
import { useState } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function ExportScreen() {
  const { theme } = useTheme();
  const [exporting, setExporting] = useState(false);
  const [exportType, setExportType] = useState('meals');

  const exportData = async (dataType) => {
    setExporting(true);
    try {
      const user = auth.currentUser;
      let data = [];
      let filename = '';

      if (dataType === 'meals') {
        const q = query(collection(db, 'users', user.uid, 'meals'), orderBy('date', 'desc'));
        const snapshot = await getDocs(q);
        data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        filename = 'meal_history';
      } else if (dataType === 'children') {
        const q = query(collection(db, 'users', user.uid, 'children'));
        const snapshot = await getDocs(q);
        data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        filename = 'children_data';
      } else if (dataType === 'water') {
        const q = query(collection(db, 'users', user.uid, 'water'), orderBy('date', 'desc'));
        const snapshot = await getDocs(q);
        data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        filename = 'water_tracking';
      } else if (dataType === 'exercises') {
        const q = query(collection(db, 'users', user.uid, 'exercises'), orderBy('date', 'desc'));
        const snapshot = await getDocs(q);
        data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        filename = 'exercise_history';
      } else if (dataType === 'all') {
        const [mealsSnap, childrenSnap, waterSnap, exerciseSnap] = await Promise.all([
          getDocs(query(collection(db, 'users', user.uid, 'meals'), orderBy('date', 'desc'))),
          getDocs(collection(db, 'users', user.uid, 'children')),
          getDocs(query(collection(db, 'users', user.uid, 'water'), orderBy('date', 'desc'))),
          getDocs(query(collection(db, 'users', user.uid, 'exercises'), orderBy('date', 'desc'))),
        ]);

        data = {
          meals: mealsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
          children: childrenSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
          water: waterSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
          exercises: exerciseSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
          exportDate: new Date().toISOString(),
        };
        filename = 'all_health_data';
      }

      const jsonData = JSON.stringify(data, null, 2);
      const csvData = dataType === 'all' ? jsonData : convertToCSV(data);

      await Share.share({
        message: dataType === 'all' ? jsonData : csvData,
        title: `${filename}.json`,
      });

      Alert.alert('✅ Export Complete', `Your ${dataType} data has been exported successfully.`);
    } catch (error) {
      console.log('Export error:', error);
      Alert.alert('Error', 'Failed to export data. Please try again.');
    }
    setExporting(false);
  };

  const convertToCSV = (data) => {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row =>
      Object.values(row).map(value =>
        typeof value === 'string' && value.includes(',') ? `"${value}"` : value
      ).join(',')
    );

    return [headers, ...rows].join('\n');
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
            All data is exported as-is from your account.
          </Text>
        </View>
      </View>

      {exportOptions.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.exportCard, { backgroundColor: theme.card }]}
          onPress={() => exportData(option.type)}
          disabled={exporting}
        >
          <View style={styles.exportHeader}>
            <Text style={styles.exportIcon}>{option.icon}</Text>
            <View style={styles.exportInfo}>
              <Text style={styles.exportTitle}>{option.title}</Text>
              <Text style={styles.exportDescription}>{option.description}</Text>
            </View>
            <TouchableOpacity
              style={[styles.exportBtn, { backgroundColor: theme.primary }]}
              onPress={() => exportData(option.type)}
              disabled={exporting}
            >
              {exporting && exportType === option.type ? (
                <Ionicons name="hourglass-outline" size={16} color="#fff" />
              ) : (
                <Ionicons name="download-outline" size={16} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}

      <View style={[styles.disclaimerCard, { backgroundColor: theme.card }]}>
        <Ionicons name="shield-checkmark-outline" size={24} color="#2E7D32" />
        <View style={styles.disclaimerContent}>
          <Text style={styles.disclaimerTitle}>Privacy & Security</Text>
          <Text style={styles.disclaimerText}>
            Your exported data contains personal health information. Keep it secure and only share with trusted parties.
            This export is for your personal use only.
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
  infoCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 20, elevation: 4, flexDirection: 'row', alignItems: 'flex-start' },
  infoContent: { flex: 1, marginLeft: 12 },
  infoTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  infoText: { fontSize: 14, color: '#666', lineHeight: 20 },
  exportCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 16, elevation: 4 },
  exportHeader: { flexDirection: 'row', alignItems: 'center' },
  exportIcon: { fontSize: 32, marginRight: 16 },
  exportInfo: { flex: 1 },
  exportTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  exportDescription: { fontSize: 14, color: '#666', lineHeight: 20 },
  exportBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  disclaimerCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 40, elevation: 4, flexDirection: 'row', alignItems: 'flex-start' },
  disclaimerContent: { flex: 1, marginLeft: 12 },
  disclaimerTitle: { fontSize: 16, fontWeight: 'bold', color: '#2E7D32', marginBottom: 8 },
  disclaimerText: { fontSize: 14, color: '#666', lineHeight: 20 },
});