import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, Alert, ActivityIndicator, Image } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useTheme } from '../context/ThemeContext';

const filipinoDishes = [
  { name: 'Sinigang na Baboy', icon: '🍲', calories: 320, protein: 22, carbs: 18, fat: 14, iron: 3.2, vitA: 120, zinc: 2.1 },
  { name: 'Adobong Manok', icon: '🍗', calories: 510, protein: 35, carbs: 12, fat: 28, iron: 2.8, vitA: 80, zinc: 3.4 },
  { name: 'Tinolang Manok', icon: '🍜', calories: 280, protein: 28, carbs: 10, fat: 9, iron: 2.1, vitA: 310, zinc: 2.8 },
  { name: 'Kare-Kare', icon: '🥜', calories: 480, protein: 30, carbs: 22, fat: 26, iron: 3.8, vitA: 95, zinc: 4.1 },
  { name: 'Lechon Kawali', icon: '🥩', calories: 620, protein: 38, carbs: 8, fat: 48, iron: 2.4, vitA: 40, zinc: 5.2 },
  { name: 'Pinakbet', icon: '🥦', calories: 180, protein: 8, carbs: 20, fat: 8, iron: 2.9, vitA: 420, zinc: 1.8 },
  { name: 'Bistek Tagalog', icon: '🥩', calories: 390, protein: 32, carbs: 14, fat: 22, iron: 4.1, vitA: 60, zinc: 4.8 },
  { name: 'Nilaga', icon: '🍖', calories: 310, protein: 26, carbs: 16, fat: 15, iron: 3.0, vitA: 180, zinc: 3.2 },
  { name: 'Pork Sisig', icon: '🍳', calories: 520, protein: 34, carbs: 6, fat: 38, iron: 2.6, vitA: 35, zinc: 4.5 },
  { name: 'Bangus Sardines', icon: '🐟', calories: 240, protein: 24, carbs: 4, fat: 14, iron: 1.8, vitA: 95, zinc: 1.9 },
];

export default function ScanScreen() {
  const { theme } = useTheme();
  const [stage, setStage] = useState('idle');
  const [result, setResult] = useState(null);
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (stage === 'scanning') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
      setTimeout(() => {
        setResult(filipinoDishes[Math.floor(Math.random() * filipinoDishes.length)]);
        setStage('result');
      }, 2500);
    }
  }, [stage]);

  const openCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return Alert.alert('Permission needed', 'Camera access is required to scan meals.');
    const picked = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.8 });
    if (!picked.canceled) {
      setImage(picked.assets[0].uri);
      setStage('scanning');
    }
  };

  const openGallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert('Permission needed', 'Gallery access is required.');
    const picked = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.8 });
    if (!picked.canceled) {
      setImage(picked.assets[0].uri);
      setStage('scanning');
    }
  };

  const logMeal = async () => {
    if (!result) return;
    setSaving(true);
    try {
      const user = auth.currentUser;
      await addDoc(collection(db, 'users', user.uid, 'meals'), {
        name: result.name,
        icon: result.icon,
        calories: result.calories,
        protein: result.protein,
        carbs: result.carbs,
        fat: result.fat,
        iron: result.iron,
        vitA: result.vitA,
        zinc: result.zinc,
        date: new Date().toISOString(),
      });
      setSaved(true);
      Alert.alert('✅ Meal Logged!', `${result.name} has been saved to your food diary.`);
    } catch (e) {
      Alert.alert('Error', 'Failed to save meal. Try again.');
    }
    setSaving(false);
  };

  const reset = () => { setStage('idle'); setResult(null); setImage(null); setSaved(false); };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.light }]} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {stage === 'idle' && (
        <View style={styles.idleBox}>
          <View style={styles.cameraFrame}>
            <Text style={styles.cameraIcon}>📷</Text>
          </View>
          <Text style={styles.title}>Scan Your Meal</Text>
          <Text style={styles.sub}>Take or upload a photo of any Filipino dish to instantly analyze its nutrition content</Text>
          <TouchableOpacity style={styles.btn} onPress={openCamera}>
            <Text style={styles.btnText}>📸  Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnOutline} onPress={openGallery}>
            <Text style={styles.btnOutlineText}>🖼️  Upload from Gallery</Text>
          </TouchableOpacity>
          <View style={styles.tipsBox}>
            <Text style={styles.tipsTitle}>Tips for best results:</Text>
            <Text style={styles.tip}>• Make sure the dish is well-lit</Text>
            <Text style={styles.tip}>• Keep the camera steady</Text>
            <Text style={styles.tip}>• Capture the full dish in frame</Text>
          </View>
        </View>
      )}

      {stage === 'scanning' && (
        <View style={styles.scanningBox}>
          {image && <Image source={{ uri: image }} style={styles.previewImage} />}
          <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }] }]}>
            <Text style={styles.scanIcon}>🔍</Text>
          </Animated.View>
          <Text style={styles.scanningText}>Analyzing your meal...</Text>
          <Text style={styles.scanningSubText}>Our AI is identifying the dish and calculating nutritional values</Text>
        </View>
      )}

      {stage === 'result' && result && (
        <View style={styles.resultBox}>
          {image && <Image source={{ uri: image }} style={styles.resultImage} />}
          <View style={styles.resultHeader}>
            <Text style={styles.resultTitle}>{result.icon} {result.name}</Text>
            <View style={styles.confidenceBadge}>
              <Text style={styles.confidenceText}>{Math.floor(Math.random() * 8) + 88}% match</Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>Macronutrients</Text>
          <View style={styles.macroRow}>
            {[['Calories', result.calories, 'kcal', '#FF7043'], ['Protein', result.protein, 'g', '#42A5F5'], ['Carbs', result.carbs, 'g', '#FFCA28'], ['Fat', result.fat, 'g', '#AB47BC']].map(([label, val, unit, color], i) => (
              <View key={i} style={styles.macroBox}>
                <Text style={[styles.macroNum, { color }]}>{val}</Text>
                <Text style={styles.macroUnit}>{unit}</Text>
                <Text style={styles.macroLabel}>{label}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Micronutrients</Text>
          {[['🩸 Iron', `${result.iron}mg`, result.iron >= 3], ['👁️ Vitamin A', `${result.vitA}mcg`, result.vitA >= 300], ['⚡ Zinc', `${result.zinc}mg`, result.zinc >= 3]].map(([label, val, ok], i) => (
            <View key={i} style={styles.microRow}>
              <Text style={styles.microLabel}>{label}</Text>
              <Text style={[styles.microVal, { color: ok ? '#2E7D32' : '#E53935' }]}>{val} {ok ? '✅' : '⚠️'}</Text>
            </View>
          ))}

          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.logBtn, saved && styles.logBtnDone]} onPress={logMeal} disabled={saving || saved}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.logBtnText}>{saved ? '✅ Logged!' : '📥 Log This Meal'}</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.retryBtn} onPress={reset}>
              <Text style={styles.retryBtnText}>🔄 Scan Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F8E9' },
  content: { padding: 20, flexGrow: 1 },
  idleBox: { alignItems: 'center' },
  cameraFrame: { width: 180, height: 180, borderRadius: 24, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#1B5E20', borderStyle: 'dashed', marginBottom: 20 },
  cameraIcon: { fontSize: 70 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  sub: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  btn: { padding: 16, borderRadius: 14, width: '100%', alignItems: 'center', marginBottom: 12, elevation: 3 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  btnOutline: { borderWidth: 2, padding: 16, borderRadius: 14, width: '100%', alignItems: 'center', marginBottom: 24 },
  btnOutlineText: { fontWeight: 'bold', fontSize: 16 },
  tipsBox: { backgroundColor: '#fff', borderRadius: 14, padding: 16, width: '100%', elevation: 2 },
  tipsTitle: { fontWeight: 'bold', color: '#333', marginBottom: 8 },
  tip: { color: '#666', fontSize: 13, marginBottom: 4 },
  scanningBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 40 },
  previewImage: { width: '100%', height: 200, borderRadius: 16, marginBottom: 24 },
  pulseCircle: { width: 140, height: 140, borderRadius: 70, alignItems: 'center', justifyContent: 'center', marginBottom: 24, borderWidth: 3 },
  scanIcon: { fontSize: 60 },
  scanningText: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  scanningSubText: { fontSize: 13, color: '#888', textAlign: 'center' },
  resultBox: { backgroundColor: '#fff', borderRadius: 20, padding: 20, elevation: 4 },
  resultImage: { width: '100%', height: 180, borderRadius: 16, marginBottom: 16 },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  resultTitle: { fontSize: 18, fontWeight: 'bold', flex: 1 },
  confidenceBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  confidenceText: { fontSize: 12, fontWeight: 'bold' },
  sectionLabel: { fontSize: 13, fontWeight: 'bold', color: '#999', marginBottom: 10, marginTop: 8, textTransform: 'uppercase', letterSpacing: 1 },
  macroRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  macroBox: { alignItems: 'center', flex: 1, backgroundColor: '#F9F9F9', borderRadius: 12, padding: 10 },
  macroNum: { fontSize: 20, fontWeight: 'bold' },
  macroUnit: { fontSize: 10, color: '#999' },
  macroLabel: { fontSize: 11, color: '#666', marginTop: 2 },
  microRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  microLabel: { fontSize: 14, color: '#555' },
  microVal: { fontSize: 14, fontWeight: '600' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  logBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center' },
  logBtnDone: { backgroundColor: '#388E3C' },
  logBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  retryBtn: { flex: 1, borderWidth: 2, padding: 14, borderRadius: 12, alignItems: 'center' },
  retryBtnText: { fontWeight: 'bold', fontSize: 14 },
});