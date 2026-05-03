import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, TextInput } from 'react-native';
import { useState } from 'react';

const initialChildren = [
  { name: 'Juan', age: 4, weight: 15, height: 102, nutrients: { iron: { val: 4, max: 10 }, vitA: { val: 180, max: 400 }, zinc: { val: 3, max: 5 }, calcium: { val: 700, max: 700 } } },
  { name: 'Maria', age: 7, weight: 22, height: 120, nutrients: { iron: { val: 10, max: 10 }, vitA: { val: 400, max: 400 }, zinc: { val: 5, max: 5 }, calcium: { val: 700, max: 700 } } },
];

const getStatus = (nutrients) => {
  const low = Object.values(nutrients).some(n => n.val / n.max < 0.6);
  return low ? { label: 'Needs Attention', color: '#E53935' } : { label: 'Healthy', color: '#2E7D32' };
};

const nutrientIcons = { iron: '🩸', vitA: '👁️', zinc: '⚡', calcium: '🦴' };
const nutrientLabels = { iron: 'Iron', vitA: 'Vitamin A', zinc: 'Zinc', calcium: 'Calcium' };
const nutrientUnits = { iron: 'mg', vitA: 'mcg', zinc: 'mg', calcium: 'mg' };

export default function ChildScreen() {
  const [children, setChildren] = useState(initialChildren);
  const [selected, setSelected] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState('');

  const addChild = () => {
    if (!newName || !newAge) return;
    setChildren([...children, {
      name: newName, age: parseInt(newAge), weight: 0, height: 0,
      nutrients: { iron: { val: 0, max: 10 }, vitA: { val: 0, max: 400 }, zinc: { val: 0, max: 5 }, calcium: { val: 0, max: 700 } }
    }]);
    setNewName(''); setNewAge(''); setModalVisible(false);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerBox}>
        <Text style={styles.heading}>👶 Child Nutrition Monitor</Text>
        <Text style={styles.headingSub}>Track your children's daily nutrient intake</Text>
      </View>

      {children.map((child, i) => {
        const status = getStatus(child.nutrients);
        const isOpen = selected === i;
        return (
          <TouchableOpacity key={i} style={styles.card} onPress={() => setSelected(isOpen ? null : i)} activeOpacity={0.85}>
            <View style={styles.cardHeader}>
              <View style={styles.avatar}>
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
                {Object.entries(child.nutrients).map(([key, n]) => {
                  const pct = Math.min((n.val / n.max) * 100, 100);
                  const color = pct < 60 ? '#E53935' : pct < 85 ? '#FFA000' : '#2E7D32';
                  return (
                    <View key={key} style={styles.nutrientRow}>
                      <Text style={styles.nutrientIcon}>{nutrientIcons[key]}</Text>
                      <View style={styles.nutrientInfo}>
                        <View style={styles.nutrientTop}>
                          <Text style={styles.nutrientLabel}>{nutrientLabels[key]}</Text>
                          <Text style={[styles.nutrientVal, { color }]}>{n.val}/{n.max}{nutrientUnits[key]}</Text>
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
                    <Text style={styles.tipText}>💡 Tip: Add malunggay, sitaw, or kangkong to boost iron and vitamin intake.</Text>
                  </View>
                )}
                <TouchableOpacity style={styles.logMealBtn}>
                  <Text style={styles.logMealBtnText}>📷 Log Meal for {child.name}</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
        <Text style={styles.addBtnText}>+ Add Child Profile</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Add Child Profile</Text>
            <TextInput style={styles.input} placeholder="Child's name" value={newName} onChangeText={setNewName} />
            <TextInput style={styles.input} placeholder="Age" keyboardType="numeric" value={newAge} onChangeText={setNewAge} />
            <TouchableOpacity style={styles.btn} onPress={addChild}>
              <Text style={styles.btnText}>Add Child</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F8E9' },
  headerBox: { backgroundColor: '#1B5E20', padding: 24 },
  heading: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  headingSub: { color: '#A5D6A7', fontSize: 13, marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: 16, margin: 12, marginBottom: 0, padding: 16, elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#1B5E20', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
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
  logMealBtn: { backgroundColor: '#E8F5E9', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 4 },
  logMealBtnText: { color: '#1B5E20', fontWeight: 'bold', fontSize: 14 },
  addBtn: { backgroundColor: '#1B5E20', margin: 12, marginTop: 16, padding: 16, borderRadius: 14, alignItems: 'center', elevation: 3 },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1B5E20', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 14, fontSize: 15, marginBottom: 12 },
  btn: { backgroundColor: '#1B5E20', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 10 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  cancelBtn: { alignItems: 'center', padding: 10 },
  cancelBtnText: { color: '#999', fontSize: 15 },
});