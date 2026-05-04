import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch, Alert, ActivityIndicator, TextInput, Modal, Image, Dimensions } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { signOut, updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { auth, db, storage } from '../firebase';
import { useTheme, THEMES } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [childAlerts, setChildAlerts] = useState(true);
  const [isPublic, setIsPublic] = useState(true);
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({ meals: 0, children: 0, streak: 0 });
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(false);
  const [themeModal, setThemeModal] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', birthdate: '', weight: '', height: '', location: '', calorieGoal: '' });
  const user = auth.currentUser;

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const [userSnap, mealsSnap, childrenSnap] = await Promise.all([
        getDoc(doc(db, 'users', user.uid)),
        getDocs(collection(db, 'users', user.uid, 'meals')),
        getDocs(collection(db, 'users', user.uid, 'children')),
      ]);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setUserData(data);
        setIsPublic(data.isPublic !== false);
        setEditForm({ name: data.name || '', birthdate: data.birthdate || '', weight: String(data.weight || ''), height: String(data.height || ''), location: data.location || '', calorieGoal: String(data.calorieGoal || 2000) });
      }
      const meals = mealsSnap.docs.map(d => d.data());
      const days = new Set(meals.map(m => new Date(m.date).toDateString()));
      let streak = 0;
      const check = new Date();
      while (days.has(check.toDateString())) { streak++; check.setDate(check.getDate() - 1); }
      setStats({ meals: meals.length, children: childrenSnap.size, streak });
    } catch (e) { console.log(e); }
    setLoading(false);
  };

  useFocusEffect(useCallback(() => { fetchProfile(); }, []));

  const saveProfile = async () => {
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        name: editForm.name,
        birthdate: editForm.birthdate,
        weight: parseFloat(editForm.weight) || 0,
        height: parseFloat(editForm.height) || 0,
        location: editForm.location,
        calorieGoal: parseInt(editForm.calorieGoal) || 2000,
      });
      if (editForm.name) await updateProfile(user, { displayName: editForm.name });
      setEditModal(false);
      fetchProfile();
      Alert.alert('✅ Profile Updated!');
    } catch (e) { Alert.alert('Error', 'Failed to update profile'); }
  };

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert('Permission needed', 'Gallery access required');
    const picked = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (!picked.canceled) {
      setUploadingPhoto(true);
      try {
        const response = await fetch(picked.assets[0].uri);
        const blob = await response.blob();
        const storageRef = ref(storage, `avatars/${user.uid}`);
        await uploadBytes(storageRef, blob);
        const url = await getDownloadURL(storageRef);
        await updateProfile(user, { photoURL: url });
        await updateDoc(doc(db, 'users', user.uid), { photoURL: url });
        fetchProfile();
      } catch (e) { Alert.alert('Error', 'Failed to upload photo'); }
      setUploadingPhoto(false);
    }
  };

  const logout = () => Alert.alert('Log Out', 'Are you sure?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Log Out', style: 'destructive', onPress: () => signOut(auth) },
  ]);

  const bmi = userData?.weight && userData?.height ? (userData.weight / Math.pow(userData.height / 100, 2)).toFixed(1) : null;
  const bmiLabel = bmi ? (bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese') : null;
  const bmiColor = bmi ? (bmi < 18.5 ? '#42A5F5' : bmi < 25 ? '#2E7D32' : bmi < 30 ? '#FFA000' : '#E53935') : null;
  const displayName = user?.displayName || userData?.name || 'User';
  const initial = displayName[0]?.toUpperCase() || 'U';
  const photoURL = user?.photoURL || userData?.photoURL;
  const age = userData?.birthdate ? Math.floor((Date.now() - new Date(userData.birthdate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.light }]} showsVerticalScrollIndicator={false}>
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <TouchableOpacity style={styles.avatarWrapper} onPress={pickPhoto} disabled={uploadingPhoto}>
          {uploadingPhoto ? (
            <ActivityIndicator color="#fff" size="large" />
          ) : photoURL ? (
            <Image source={{ uri: photoURL }} style={styles.avatarImage} />
          ) : (
            <View style={[styles.avatarCircle, { borderColor: theme.accent }]}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
          )}
          <View style={styles.cameraOverlay}>
            <Text style={styles.cameraOverlayIcon}>📷</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        {age && <Text style={styles.age}>Age {age} · {userData?.location || 'Davao City'}</Text>}
        <View style={styles.headerActions}>
          <TouchableOpacity style={[styles.headerBtn, { borderColor: theme.accent }]} onPress={() => setEditModal(true)}>
            <Text style={styles.headerBtnText}>✏️ Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.headerBtn, { borderColor: theme.accent }]} onPress={() => setThemeModal(true)}>
            <Text style={styles.headerBtnText}>🎨 Theme</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 30 }} />
      ) : (
        <>
          <View style={styles.statsRow}>
            {[[stats.meals, 'Meals\nLogged', '🍽️'], [stats.children, 'Children\nMonitored', '👶'], [stats.streak, 'Day\nStreak', '🔥']].map(([num, label, icon], i) => (
              <View key={i} style={styles.statBox}>
                <Text style={styles.statIcon}>{icon}</Text>
                <Text style={[styles.statNum, { color: theme.primary }]}>{num}</Text>
                <Text style={styles.statLabel}>{label}</Text>
              </View>
            ))}
          </View>

          {bmi && (
            <View style={styles.card}>
              <Text style={[styles.cardTitle, { color: theme.primary }]}>⚖️ Health Stats</Text>
              <View style={styles.healthRow}>
                {[['Weight', `${userData.weight}kg`, '#42A5F5'], ['Height', `${userData.height}cm`, '#AB47BC'], ['BMI', bmi, bmiColor]].map(([l, v, c]) => (
                  <View key={l} style={styles.healthBox}>
                    <Text style={[styles.healthVal, { color: c }]}>{v}</Text>
                    <Text style={styles.healthLabel}>{l}</Text>
                  </View>
                ))}
              </View>
              <View style={[styles.bmiBar, { backgroundColor: bmiColor + '20' }]}>
                <Text style={[styles.bmiLabel, { color: bmiColor }]}>BMI Status: {bmiLabel}</Text>
              </View>
            </View>
          )}

          <View style={styles.card}>
            <Text style={[styles.cardTitle, { color: theme.primary }]}>⚙️ Preferences</Text>
            {[
              { icon: '🎯', label: 'Daily Calorie Goal', value: `${userData?.calorieGoal || 2000} kcal` },
              { icon: '📍', label: 'Location', value: userData?.location || 'Davao City' },
              { icon: '⚖️', label: 'Current Weight', value: userData?.weight ? `${userData.weight}kg` : 'Not set' },
              { icon: '📏', label: 'Height', value: userData?.height ? `${userData.height}cm` : 'Not set' },
            ].map((item, i) => (
              <View key={i} style={styles.settingRow}>
                <Text style={styles.settingIcon}>{item.icon}</Text>
                <Text style={styles.settingLabel}>{item.label}</Text>
                <Text style={styles.settingValue}>{item.value}</Text>
              </View>
            ))}
          </View>

          <View style={styles.card}>
            <Text style={[styles.cardTitle, { color: theme.primary }]}>🔔 Notifications & Privacy</Text>
            {[
              { label: 'Meal Reminders', sub: 'Get reminded to log meals', val: notifications, set: setNotifications },
              { label: 'Child Nutrition Alerts', sub: 'Alerts when nutrients are low', val: childAlerts, set: setChildAlerts },
              { label: 'Public Profile', sub: 'Others can see your community posts', val: isPublic, set: async (v) => { setIsPublic(v); await updateDoc(doc(db, 'users', user.uid), { isPublic: v }); } },
            ].map((item, i) => (
              <View key={i} style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleLabel}>{item.label}</Text>
                  <Text style={styles.toggleSub}>{item.sub}</Text>
                </View>
                <Switch value={item.val} onValueChange={item.set} trackColor={{ true: theme.primary }} thumbColor="#fff" />
              </View>
            ))}
          </View>

          <View style={styles.card}>
            <Text style={[styles.cardTitle, { color: theme.primary }]}>ℹ️ About</Text>
            <Text style={styles.aboutText}>Smart Nutri Scanner v1.0.0</Text>
            <Text style={styles.aboutText}>AI-Powered Meal Analyzer for Filipino Diets</Text>
            <Text style={styles.aboutText}>Built with React Native + Expo + Firebase</Text>
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.logoutText}>🚪 Log Out</Text>
          </TouchableOpacity>
        </>
      )}

      <Modal visible={editModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalBox} showsVerticalScrollIndicator={false}>
            <Text style={[styles.modalTitle, { color: theme.primary }]}>✏️ Edit Profile</Text>
            {[['name', 'Full Name', 'default'], ['birthdate', 'Birthdate (YYYY-MM-DD)', 'default'], ['weight', 'Weight (kg)', 'decimal-pad'], ['height', 'Height (cm)', 'decimal-pad'], ['location', 'Location', 'default'], ['calorieGoal', 'Daily Calorie Goal', 'numeric']].map(([key, ph, kb]) => (
              <View key={key}>
                <Text style={styles.inputLabel}>{ph}</Text>
                <TextInput style={styles.input} placeholder={ph} keyboardType={kb} value={editForm[key]} onChangeText={v => setEditForm({ ...editForm, [key]: v })} />
              </View>
            ))}
            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.primary }]} onPress={saveProfile}>
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModal(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={themeModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.themeBox}>
            <Text style={[styles.modalTitle, { color: theme.primary }]}>🎨 Choose Theme</Text>
            {THEMES.map((t, i) => (
              <TouchableOpacity key={i} style={[styles.themeOption, theme.name === t.name && styles.themeOptionActive, { borderColor: t.primary }]} onPress={() => { setTheme(t); setThemeModal(false); }}>
                <View style={[styles.themePreview, { backgroundColor: t.primary }]} />
                <View style={[styles.themePreview, { backgroundColor: t.accent }]} />
                <View style={[styles.themePreview, { backgroundColor: t.light, borderWidth: 1, borderColor: '#eee' }]} />
                <Text style={[styles.themeLabel, { color: t.primary }]}>{t.name}</Text>
                {theme.name === t.name && <Text style={{ color: t.primary, fontSize: 18 }}>✓</Text>}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setThemeModal(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', paddingVertical: 36, paddingHorizontal: 20, paddingTop: 50 },
  avatarWrapper: { position: 'relative', marginBottom: 12 },
  avatarImage: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: '#fff' },
  avatarCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 3 },
  avatarText: { fontSize: 40, fontWeight: 'bold', color: '#fff' },
  cameraOverlay: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#fff', borderRadius: 14, padding: 4, elevation: 3 },
  cameraOverlayIcon: { fontSize: 14 },
  name: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  email: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  age: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 4 },
  headerActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  headerBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
  headerBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  statsRow: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 14, marginTop: 14, borderRadius: 20, padding: 16, elevation: 4, justifyContent: 'space-around' },
  statBox: { alignItems: 'center' },
  statIcon: { fontSize: 22, marginBottom: 4 },
  statNum: { fontSize: 24, fontWeight: 'bold' },
  statLabel: { fontSize: 10, color: '#888', textAlign: 'center', marginTop: 2 },
  card: { backgroundColor: '#fff', margin: 14, marginBottom: 0, borderRadius: 20, padding: 18, elevation: 3 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 14 },
  healthRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
  healthBox: { alignItems: 'center' },
  healthVal: { fontSize: 22, fontWeight: 'bold' },
  healthLabel: { fontSize: 12, color: '#888', marginTop: 2 },
  bmiBar: { borderRadius: 12, padding: 10, alignItems: 'center' },
  bmiLabel: { fontWeight: 'bold', fontSize: 14 },
  settingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  settingIcon: { fontSize: 18, marginRight: 12 },
  settingLabel: { flex: 1, fontSize: 14, color: '#333' },
  settingValue: { fontSize: 13, color: '#999' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  toggleInfo: { flex: 1, marginRight: 10 },
  toggleLabel: { fontSize: 14, color: '#333', fontWeight: '500' },
  toggleSub: { fontSize: 12, color: '#999', marginTop: 2 },
  aboutText: { fontSize: 13, color: '#888', marginBottom: 4 },
  logoutBtn: { margin: 14, marginTop: 14, padding: 16, borderRadius: 14, backgroundColor: '#FFEBEE', alignItems: 'center' },
  logoutText: { color: '#E53935', fontWeight: 'bold', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: '90%' },
  themeBox: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  inputLabel: { fontSize: 12, color: '#888', fontWeight: '600', marginBottom: 6, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { borderWidth: 1.5, borderColor: '#eee', borderRadius: 14, padding: 14, fontSize: 15, marginBottom: 12, backgroundColor: '#FAFAFA', color: '#333' },
  saveBtn: { padding: 16, borderRadius: 14, alignItems: 'center', marginBottom: 10, elevation: 3 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cancelBtn: { alignItems: 'center', padding: 12 },
  cancelBtnText: { color: '#999', fontSize: 15 },
  themeOption: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, marginBottom: 10, borderWidth: 2, gap: 10 },
  themeOptionActive: { elevation: 4 },
  themePreview: { width: 24, height: 24, borderRadius: 12 },
  themeLabel: { flex: 1, fontWeight: '600', fontSize: 14 },
});