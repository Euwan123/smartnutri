import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Animated } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export default function SignupScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const animateStep = () => {
    Animated.sequence([
      Animated.timing(slideAnim, { toValue: -30, duration: 150, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const nextStep = () => { animateStep(); setStep(2); };

  const signup = async () => {
    if (!name || !email || !password || !confirm) return Alert.alert('Error', 'Please fill in all fields');
    if (password !== confirm) return Alert.alert('Error', 'Passwords do not match');
    if (password.length < 6) return Alert.alert('Error', 'Password must be at least 6 characters');
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(result.user, { displayName: name });
      await setDoc(doc(db, 'users', result.user.uid), {
        name, email: email.trim(), createdAt: new Date().toISOString(),
        calorieGoal: 2000, location: 'Davao City', children: [],
        isPublic: true,
      });
    } catch (e) {
      const msg = e.code === 'auth/email-already-in-use' ? 'Email already registered' : e.message;
      Alert.alert('Signup Failed', msg);
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.topSection}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>🥗</Text>
        </View>
        <Text style={styles.appName}>Create Account</Text>
        <View style={styles.stepRow}>
          <View style={[styles.stepDot, step === 1 && styles.stepDotActive]} />
          <View style={styles.stepLine} />
          <View style={[styles.stepDot, step === 2 && styles.stepDotActive]} />
        </View>
        <Text style={styles.stepLabel}>Step {step} of 2</Text>
      </View>

      <Animated.View style={[styles.form, { transform: [{ translateY: slideAnim }] }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {step === 1 ? (
            <>
              <Text style={styles.title}>Your Name 👤</Text>
              <Text style={styles.sub}>Let's start with the basics</Text>
              <View style={[styles.inputWrapper, focusedField === 'name' && styles.inputFocused]}>
                <Text style={styles.inputIcon}>👤</Text>
                <TextInput style={styles.input} placeholder="Full name" placeholderTextColor="#bbb" value={name} onChangeText={setName} onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)} />
              </View>
              <View style={[styles.inputWrapper, focusedField === 'email' && styles.inputFocused]}>
                <Text style={styles.inputIcon}>📧</Text>
                <TextInput style={styles.input} placeholder="Email address" placeholderTextColor="#bbb" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)} />
              </View>
              <TouchableOpacity style={styles.btn} onPress={nextStep}>
                <Text style={styles.btnText}>Continue →</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.title}>Set Password 🔒</Text>
              <Text style={styles.sub}>Make it strong and memorable</Text>
              <View style={[styles.inputWrapper, focusedField === 'password' && styles.inputFocused]}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput style={styles.input} placeholder="Password (min 6 chars)" placeholderTextColor="#bbb" secureTextEntry={!showPass} value={password} onChangeText={setPassword} onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)} />
                <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                  <Text style={styles.eyeIcon}>{showPass ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
              <View style={[styles.inputWrapper, focusedField === 'confirm' && styles.inputFocused]}>
                <Text style={styles.inputIcon}>✅</Text>
                <TextInput style={styles.input} placeholder="Confirm password" placeholderTextColor="#bbb" secureTextEntry={!showPass} value={confirm} onChangeText={setConfirm} onFocus={() => setFocusedField('confirm')} onBlur={() => setFocusedField(null)} />
              </View>
              <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={signup} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create Account 🎉</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}>
                <Text style={styles.backBtnText}>← Back</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.switchBtn}>
            <Text style={styles.switchText}>Already have an account? <Text style={styles.switchLink}>Sign In</Text></Text>
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1B5E20' },
  topSection: { flex: 0.38, alignItems: 'center', justifyContent: 'center', paddingTop: 20 },
  logoCircle: { width: 75, height: 75, borderRadius: 38, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  logoEmoji: { fontSize: 38 },
  appName: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  stepDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.3)' },
  stepDotActive: { backgroundColor: '#fff', width: 24, borderRadius: 12 },
  stepLine: { width: 40, height: 2, backgroundColor: 'rgba(255,255,255,0.3)' },
  stepLabel: { color: '#A5D6A7', fontSize: 12 },
  form: { flex: 0.62, backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 28, paddingTop: 32 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 4 },
  sub: { fontSize: 13, color: '#999', marginBottom: 24 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#eee', borderRadius: 14, paddingHorizontal: 14, marginBottom: 14, backgroundColor: '#FAFAFA', height: 54 },
  inputFocused: { borderColor: '#1B5E20', backgroundColor: '#F1F8E9' },
  inputIcon: { fontSize: 18, marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#333' },
  eyeIcon: { fontSize: 18, paddingLeft: 8 },
  btn: { backgroundColor: '#1B5E20', padding: 16, borderRadius: 14, alignItems: 'center', elevation: 4, shadowColor: '#1B5E20', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, marginBottom: 12 },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  backBtn: { alignItems: 'center', padding: 10, marginBottom: 8 },
  backBtnText: { color: '#1B5E20', fontWeight: '600', fontSize: 15 },
  switchBtn: { alignItems: 'center', marginTop: 8 },
  switchText: { color: '#999', fontSize: 14 },
  switchLink: { color: '#1B5E20', fontWeight: 'bold' },
});