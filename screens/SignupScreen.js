import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const signup = async () => {
    if (!name || !email || !password || !confirm) return Alert.alert('Error', 'Please fill in all fields');
    if (password !== confirm) return Alert.alert('Error', 'Passwords do not match');
    if (password.length < 6) return Alert.alert('Error', 'Password must be at least 6 characters');
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(result.user, { displayName: name }).catch(err => console.error('Profile update failed:', err));
      await setDoc(doc(db, 'users', result.user.uid), {
        name,
        email: email.trim(),
        createdAt: new Date().toISOString(),
        calorieGoal: 2000,
        location: 'Davao City',
        children: [],
      });
      setLoading(false);
    } catch (e) {
      Alert.alert('Signup Failed', e.message);
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.top}>
        <Text style={styles.logo}>🥗</Text>
        <Text style={styles.appName}>Smart Nutri Scanner</Text>
        <Text style={styles.tagline}>Create your free account</Text>
      </View>

      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Get Started</Text>
        <Text style={styles.sub}>Sign up to track your family's nutrition</Text>

        <Text style={styles.label}>Full Name</Text>
        <TextInput style={styles.input} placeholder="Juan Dela Cruz" placeholderTextColor="#aaa" value={name} onChangeText={setName} />

        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} placeholder="you@email.com" placeholderTextColor="#aaa" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />

        <Text style={styles.label}>Password</Text>
        <View style={styles.passRow}>
          <TextInput style={styles.passInput} placeholder="At least 6 characters" placeholderTextColor="#aaa" secureTextEntry={!showPass} value={password} onChangeText={setPassword} />
          <TouchableOpacity onPress={() => setShowPass(!showPass)}>
            <Text style={styles.showBtn}>{showPass ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Confirm Password</Text>
        <TextInput style={styles.input} placeholder="Repeat your password" placeholderTextColor="#aaa" secureTextEntry={!showPass} value={confirm} onChangeText={setConfirm} />

        <TouchableOpacity style={styles.btn} onPress={signup} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create Account</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.switchText}>Already have an account? <Text style={styles.switchLink}>Sign In</Text></Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1B5E20' },
  top: { alignItems: 'center', paddingTop: 60, paddingBottom: 24 },
  logo: { fontSize: 50 },
  appName: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginTop: 8 },
  tagline: { color: '#A5D6A7', fontSize: 13, marginTop: 4 },
  form: { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 28 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1B5E20', marginBottom: 4 },
  sub: { fontSize: 14, color: '#888', marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, padding: 14, fontSize: 15, marginBottom: 16, color: '#333', backgroundColor: '#FAFAFA' },
  passRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, marginBottom: 16, backgroundColor: '#FAFAFA' },
  passInput: { flex: 1, padding: 14, fontSize: 15, color: '#333' },
  showBtn: { paddingHorizontal: 14, fontSize: 18 },
  btn: { backgroundColor: '#1B5E20', padding: 16, borderRadius: 14, alignItems: 'center', marginBottom: 16, elevation: 3 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  switchText: { textAlign: 'center', color: '#888', fontSize: 14 },
  switchLink: { color: '#1B5E20', fontWeight: 'bold' },
});