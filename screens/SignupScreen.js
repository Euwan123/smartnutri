import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
  ScrollView, Animated,
} from 'react-native';
import { useState, useRef } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { auth, db } from '../firebase';
import { useTheme } from '../context/ThemeContext';

export default function SignupScreen({ navigation }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
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
      Animated.timing(slideAnim, { toValue: -20, duration: 150, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start();
  };

  const nextStep = () => {
    if (!name || !email) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    animateStep();
    setStep(2);
  };

  const signup = async () => {
    if (!password || !confirm) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(result.user, { displayName: name });
      await setDoc(doc(db, 'users', result.user.uid), {
        name,
        email: email.trim(),
        createdAt: new Date().toISOString(),
        calorieGoal: 2000,
        location: 'Davao City',
        isPublic: true,
      });
    } catch (e) {
      const msg = e.code === 'auth/email-already-in-use'
        ? 'Email already registered'
        : 'Signup failed. Please try again.';
      Alert.alert('Signup Failed', msg);
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <LinearGradient
          colors={[theme.primary, theme.secondary]}
          style={[styles.topSection, { paddingTop: insets.top + 20 }]}
        >
          <View style={styles.logoCircle}>
            <Ionicons name="leaf" size={36} color="#fff" />
          </View>
          <Text style={styles.appName}>Create Account</Text>
          <View style={styles.stepRow}>
            <View style={[styles.stepDot, { backgroundColor: step >= 1 ? '#fff' : 'rgba(255,255,255,0.3)', width: step === 1 ? 24 : 10 }]} />
            <View style={styles.stepLine} />
            <View style={[styles.stepDot, { backgroundColor: step >= 2 ? '#fff' : 'rgba(255,255,255,0.3)', width: step === 2 ? 24 : 10 }]} />
          </View>
          <Text style={styles.stepLabel}>Step {step} of 2</Text>
        </LinearGradient>

        <Animated.View style={[styles.form, { transform: [{ translateY: slideAnim }] }]}>
          {step === 1 ? (
            <>
              <Text style={styles.title}>Your Info 👤</Text>
              <Text style={styles.sub}>Let's start with the basics</Text>

              <Text style={styles.label}>Full Name</Text>
              <View style={[styles.inputWrapper, focusedField === 'name' && { borderColor: theme.primary, backgroundColor: theme.light }]}>
                <Ionicons name="person-outline" size={20} color={focusedField === 'name' ? theme.primary : '#bbb'} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Juan Dela Cruz"
                  placeholderTextColor="#bbb"
                  value={name}
                  onChangeText={setName}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>

              <Text style={styles.label}>Email</Text>
              <View style={[styles.inputWrapper, focusedField === 'email' && { borderColor: theme.primary, backgroundColor: theme.light }]}>
                <Ionicons name="mail-outline" size={20} color={focusedField === 'email' ? theme.primary : '#bbb'} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="you@email.com"
                  placeholderTextColor="#bbb"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>

              <TouchableOpacity style={[styles.btn, { backgroundColor: theme.primary }]} onPress={nextStep}>
                <Text style={styles.btnText}>Continue</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.title}>Set Password 🔒</Text>
              <Text style={styles.sub}>Make it strong and memorable</Text>

              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputWrapper, focusedField === 'password' && { borderColor: theme.primary, backgroundColor: theme.light }]}>
                <Ionicons name="lock-closed-outline" size={20} color={focusedField === 'password' ? theme.primary : '#bbb'} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Min 6 characters"
                  placeholderTextColor="#bbb"
                  secureTextEntry={!showPass}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                />
                <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                  <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color="#bbb" />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Confirm Password</Text>
              <View style={[styles.inputWrapper, focusedField === 'confirm' && { borderColor: theme.primary, backgroundColor: theme.light }]}>
                <Ionicons name="checkmark-circle-outline" size={20} color={focusedField === 'confirm' ? theme.primary : '#bbb'} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Repeat password"
                  placeholderTextColor="#bbb"
                  secureTextEntry={!showPass}
                  value={confirm}
                  onChangeText={setConfirm}
                  onFocus={() => setFocusedField('confirm')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>

              <TouchableOpacity
                style={[styles.btn, { backgroundColor: theme.primary }, loading && styles.btnDisabled]}
                onPress={signup}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.btnText}>Create Account</Text>
                    <Ionicons name="checkmark" size={18} color="#fff" style={{ marginLeft: 8 }} />
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}>
                <Ionicons name="arrow-back" size={16} color={theme.primary} />
                <Text style={[styles.backBtnText, { color: theme.primary }]}>Back</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.switchBtn}>
            <Text style={styles.switchText}>
              Already have an account?{' '}
              <Text style={[styles.switchLink, { color: theme.primary }]}>Sign In</Text>
            </Text>
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  topSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  logoCircle: {
    width: 75,
    height: 75,
    borderRadius: 38,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  appName: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  stepDot: { height: 10, borderRadius: 5 },
  stepLine: { width: 40, height: 2, backgroundColor: 'rgba(255,255,255,0.3)' },
  stepLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  form: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 28,
    paddingTop: 32,
    marginTop: -20,
    flex: 1,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 4 },
  sub: { fontSize: 13, color: '#999', marginBottom: 24 },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#555',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#eee',
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 16,
    backgroundColor: '#FAFAFA',
    height: 54,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#333' },
  btn: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    marginBottom: 12,
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 10,
    marginBottom: 8,
  },
  backBtnText: { fontWeight: '600', fontSize: 15 },
  switchBtn: { alignItems: 'center', paddingBottom: 10 },
  switchText: { color: '#999', fontSize: 14 },
  switchLink: { fontWeight: 'bold' },
});