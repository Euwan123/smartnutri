import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated } from 'react-native';
import { useState, useRef, useEffect } from 'react';

const results = [
  { name: 'Sinigang na Baboy', confidence: 95, cal: 320, protein: 22, carbs: 18, fat: 14, iron: '3.2mg ✅', vitA: '120mcg ⚠️', zinc: '2.1mg ✅' },
  { name: 'Adobong Manok', confidence: 91, cal: 510, protein: 35, carbs: 12, fat: 28, iron: '2.8mg ✅', vitA: '80mcg ⚠️', zinc: '3.4mg ✅' },
  { name: 'Tinolang Manok', confidence: 88, cal: 280, protein: 28, carbs: 10, fat: 9, iron: '2.1mg ✅', vitA: '310mcg ✅', zinc: '2.8mg ✅' },
];

export default function ScanScreen() {
  const [stage, setStage] = useState('idle');
  const [result, setResult] = useState(null);
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
        setResult(results[Math.floor(Math.random() * results.length)]);
        setStage('result');
      }, 2500);
    }
  }, [stage]);

  const reset = () => { setStage('idle'); setResult(null); };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {stage === 'idle' && (
        <View style={styles.idleBox}>
          <View style={styles.cameraFrame}>
            <Text style={styles.cameraIcon}>📷</Text>
          </View>
          <Text style={styles.title}>Scan Your Meal</Text>
          <Text style={styles.sub}>Take or upload a photo of any Filipino dish to instantly analyze its nutrition content</Text>
          <TouchableOpacity style={styles.btn} onPress={() => setStage('scanning')}>
            <Text style={styles.btnText}>📸  Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnOutline} onPress={() => setStage('scanning')}>
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
          <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }] }]}>
            <Text style={styles.scanIcon}>🔍</Text>
          </Animated.View>
          <Text style={styles.scanningText}>Analyzing your meal...</Text>
          <Text style={styles.scanningSubText}>Our AI is identifying the dish and calculating nutritional values</Text>
        </View>
      )}

      {stage === 'result' && result && (
        <View style={styles.resultBox}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultTitle}>🍽️ {result.name}</Text>
            <View style={styles.confidenceBadge}>
              <Text style={styles.confidenceText}>{result.confidence}% match</Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>Macronutrients</Text>
          <View style={styles.macroRow}>
            {[['Calories', result.cal, 'kcal', '#FF7043'], ['Protein', result.protein, 'g', '#42A5F5'], ['Carbs', result.carbs, 'g', '#FFCA28'], ['Fat', result.fat, 'g', '#AB47BC']].map(([label, val, unit, color], i) => (
              <View key={i} style={styles.macroBox}>
                <Text style={[styles.macroNum, { color }]}>{val}</Text>
                <Text style={styles.macroUnit}>{unit}</Text>
                <Text style={styles.macroLabel}>{label}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Micronutrients</Text>
          {[['Iron', result.iron], ['Vitamin A', result.vitA], ['Zinc', result.zinc]].map(([label, val], i) => (
            <View key={i} style={styles.microRow}>
              <Text style={styles.microLabel}>{label}</Text>
              <Text style={styles.microVal}>{val}</Text>
            </View>
          ))}

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.logBtn}>
              <Text style={styles.logBtnText}>✅ Log This Meal</Text>
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
  title: { fontSize: 22, fontWeight: 'bold', color: '#1B5E20', marginBottom: 8 },
  sub: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  btn: { backgroundColor: '#1B5E20', padding: 16, borderRadius: 14, width: '100%', alignItems: 'center', marginBottom: 12, elevation: 3 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  btnOutline: { borderWidth: 2, borderColor: '#1B5E20', padding: 16, borderRadius: 14, width: '100%', alignItems: 'center', marginBottom: 24 },
  btnOutlineText: { color: '#1B5E20', fontWeight: 'bold', fontSize: 16 },
  tipsBox: { backgroundColor: '#fff', borderRadius: 14, padding: 16, width: '100%', elevation: 2 },
  tipsTitle: { fontWeight: 'bold', color: '#333', marginBottom: 8 },
  tip: { color: '#666', fontSize: 13, marginBottom: 4 },
  scanningBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  pulseCircle: { width: 140, height: 140, borderRadius: 70, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center', marginBottom: 24, borderWidth: 3, borderColor: '#1B5E20' },
  scanIcon: { fontSize: 60 },
  scanningText: { fontSize: 20, fontWeight: 'bold', color: '#1B5E20', marginBottom: 8 },
  scanningSubText: { fontSize: 13, color: '#888', textAlign: 'center' },
  resultBox: { backgroundColor: '#fff', borderRadius: 20, padding: 20, elevation: 4 },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  resultTitle: { fontSize: 18, fontWeight: 'bold', color: '#1B5E20', flex: 1 },
  confidenceBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  confidenceText: { color: '#1B5E20', fontSize: 12, fontWeight: 'bold' },
  sectionLabel: { fontSize: 13, fontWeight: 'bold', color: '#999', marginBottom: 10, marginTop: 8, textTransform: 'uppercase', letterSpacing: 1 },
  macroRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  macroBox: { alignItems: 'center', flex: 1, backgroundColor: '#F9F9F9', borderRadius: 12, padding: 10 },
  macroNum: { fontSize: 20, fontWeight: 'bold' },
  macroUnit: { fontSize: 10, color: '#999' },
  macroLabel: { fontSize: 11, color: '#666', marginTop: 2 },
  microRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  microLabel: { fontSize: 14, color: '#555' },
  microVal: { fontSize: 14, fontWeight: '600', color: '#333' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  logBtn: { flex: 1, backgroundColor: '#1B5E20', padding: 14, borderRadius: 12, alignItems: 'center' },
  logBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  retryBtn: { flex: 1, borderWidth: 2, borderColor: '#1B5E20', padding: 14, borderRadius: 12, alignItems: 'center' },
  retryBtnText: { color: '#1B5E20', fontWeight: 'bold', fontSize: 14 },
});