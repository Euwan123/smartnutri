import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useTheme } from '../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

const nutrientIcons = { iron: '🩸', vitA: '👁️', zinc: '⚡', calcium: '🦴' };
const nutrientLabels = { iron: 'Iron', vitA: 'Vitamin A', zinc: 'Zinc', calcium: 'Calcium' };
const nutrientUnits = { iron: 'mg', vitA: 'mcg', zinc: 'mg', calcium: 'mg' };
const nutrientMax = { iron: 10, vitA: 400, zinc: 5, calcium: 700 };

const getStatus = (child) => {
  const low = child.iron < 6 || child.vitA < 240 || child.zinc < 3;
  return low ? { label: 'Needs Attention', color: '#E53935' } : { label: 'Healthy', color: '#2E7D32' };
};

export default function ChildScreen() {
  const { theme } = useTheme();
  const [children, setChildren] = useState([]);
  const [selected, setSelected] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', age: '', weight: '', height: '', iron: '', vitA: '', zinc: '', calcium: '' });

  const fetchChildren = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      const snap = await getDocs(collection(db, 'users', user.uid, 'children'));
      setChildren(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.log(e); }
    setLoading(false);
  };

  useFocusEffect(useCallback(() => { fetchChildren(); }, []));

  const addChild = async () => {
    if (!form.name || !form.age) return Alert.alert('Error', 'Name and age are required');
    setSaving(true);
    try {
      const user = auth.currentUser;
      await addDoc(collection(db, 'users', user.uid, 'children'), {
        name: form.name,
        age: parseInt(form.age),
        weight: parseFloat(form.weight) || 0,
        height: parseFloat(form.height) || 0,
        iron: parseFloat(form.iron) || 0,
        vitA: parseFloat(form.vitA) || 0,
        zinc: parseFloat(form.zinc) || 0,
        calcium: parseFloat(form.calcium) || 0,
        createdAt: new Date().toISOString(),
      });
      setForm({ name: '', age: '', weight: '', height: '', iron: '', vitA: '', zinc: '', calcium: '' });
      setModalVisible(false);
      fetchChildren();
    } catch (e) { Alert.alert('Error', 'Failed to save child profile'); }
    setSaving(false);
  };

  const deleteChild = (id, name) => {
    Alert.alert('Remove Child', `Remove ${name}'s profile?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
        await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'children', id));
        fetchChildren();
      }},
    ]);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.light }]} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={[theme.primary, theme.secondary || theme.primary]} style={styles.headerBox}>
        <Text style={styles.heading}>👶 Child Nutrition Monitor</Text>
        <Text style={styles.headingSub}>Track your children's daily nutrient intake</Text>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
      ) : children.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>👶</Text>
          <Text style={styles.emptyTitle}>No children added yet</Text>
          <Text style={styles.emptySub}>Add a child profile to start monitoring their nutrition</Text>
        </View>
      ) : (
        children.map((child, i) => {
          const status = getStatus(child);
          const isOpen = selected === i;
          const nutrients = { iron: child.iron, vitA: child.vitA, zinc: child.zinc, calcium: child.calcium };
          return (
            <TouchableOpacity key={child.id} style={styles.card} onPress={() => setSelected(isOpen ? null : i)} activeOpacity={0.85}>
              <View style={styles.cardHeader}>
                <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                  <Text style={styles.avatarText}>{child.name[0]}</Text>
                </View>
                <View style={styles.childInfo}>
                  <Text style={styles.childName}>{child.name}</Text>
                  <Text style={styles.childDetails}>Age {child.age} · {child.weight}kg · {child.height}cm</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: status.color }]}>
                  <Text style={styles.badgeText}>{status.label}</Text>
                </View>
              </View>

              {isOpen && (
                <View style={styles.detail}>
                  {Object.entries(nutrients).map(([key, val]) => {
                    const max = nutrientMax[key];
                    const pct = Math.min((val / max) * 100, 100);
                    const color = pct < 60 ? '#E53935' : pct < 85 ? '#FFA000' : '#2E7D32';
                    return (
                      <View key={key} style={styles.nutrientRow}>
                        <Text style={styles.nutrientIcon}>{nutrientIcons[key]}</Text>
                        <View style={styles.nutrientInfo}>
                          <View style={styles.nutrientTop}>
                            <Text style={styles.nutrientLabel}>{nutrientLabels[key]}</Text>
                            <Text style={[styles.nutrientVal, { color }]}>{val}/{max}{nutrientUnits[key]}</Text>
                          </View>
                          <View style={styles.bar}>
                            <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: color }]} />
                          </View>
                        </View>
                      </View>
                    );
                  })}
                  {status.label === 'Needs Attention' && (
                    <View style={styles.tipBox}>
                      <Text style={styles.tipText}>💡 Add malunggay, sitaw, or kangkong to boost nutrient intake.</Text>
                    </View>
                  )}
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteChild(child.id, child.name)}>
                    <Text style={styles.deleteBtnText}>🗑️ Remove Profile</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          );
        })
      )}

      <TouchableOpacity style={[styles.addBtn, { backgroundColor: theme.primary }]} onPress={() => setModalVisible(true)}>
        <Text style={styles.addBtnText}>+ Add Child Profile</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalBox} showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>Add Child Profile</Text>
            {[['name', 'Full name', 'default'], ['age', 'Age', 'numeric'], ['weight', 'Weight (kg)', 'decimal-pad'], ['height', 'Height (cm)', 'decimal-pad']].map(([key, ph, kb]) => (
              <TextInput key={key} style={styles.input} placeholder={ph} keyboardType={kb} value={form[key]} onChangeText={v => setForm({ ...form, [key]: v })} />
            ))}
            <Text style={styles.sectionLabel}>Daily Nutrient Intake</Text>
            {[['iron', 'Iron (mg)'], ['vitA', 'Vitamin A (mcg)'], ['zinc', 'Zinc (mg)'], ['calcium', 'Calcium (mg)']].map(([key, ph]) => (
              <TextInput key={key} style={styles.input} placeholder={ph} keyboardType="decimal-pad" value={form[key]} onChangeText={v => setForm({ ...form, [key]: v })} />
            ))}
            <TouchableOpacity style={[styles.btn, { backgroundColor: theme.primary }]} onPress={addChild} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Save Child Profile</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBox: { padding: 24 },
  heading: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  headingSub: { color: '#fff', fontSize: 13, marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: 16, margin: 12, marginBottom: 0, padding: 16, elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  childInfo: { flex: 1 },
  childName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  childDetails: { fontSize: 12, color: '#999', marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  detail: { marginTop: 16 },
  nutrientRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  nutrientIcon: { fontSize: 20, marginRight: 10 },
  nutrientInfo: { flex: 1 },
  nutrientTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  nutrientLabel: { fontSize: 13, color: '#555', fontWeight: '500' },
  nutrientVal: { fontSize: 13, fontWeight: 'bold' },
  bar: { height: 6, backgroundColor: '#eee', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 4 },
  tipBox: { backgroundColor: '#FFF8E1', borderRadius: 10, padding: 12, marginTop: 4, marginBottom: 12 },
  tipText: { fontSize: 13, color: '#795548', lineHeight: 20 },
  deleteBtn: { padding: 10, alignItems: 'center', marginTop: 4 },
  deleteBtnText: { color: '#E53935', fontSize: 14, fontWeight: '600' },
  addBtn: { margin: 12, marginTop: 16, padding: 16, borderRadius: 14, alignItems: 'center', elevation: 3 },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  emptyBox: { alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 60, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#888', textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  sectionLabel: { fontSize: 13, fontWeight: 'bold', color: '#999', marginBottom: 10, marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 14, fontSize: 15, marginBottom: 12, backgroundColor: '#FAFAFA' },
  btn: { padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 10 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  cancelBtn: { alignItems: 'center', padding: 10 },
  cancelBtnText: { color: '#999', fontSize: 15 },
});