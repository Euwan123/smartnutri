import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Dimensions, Image } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { auth } from '../firebase';
import { useTheme } from '../context/ThemeContext';

export default function LoginScreen({ navigation }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const loadSavedCredentials = async () => {
      try {
        const savedEmail = await SecureStore.getItemAsync('saved_email');
        const savedPassword = await SecureStore.getItemAsync('saved_password');
        const savedRemember = await SecureStore.getItemAsync('remember_me');
        if (savedEmail && savedPassword && savedRemember === 'true') {
          setEmail(savedEmail);
          setPassword(savedPassword);
          setRememberMe(true);
        }
      } catch (error) {
        console.log('Error loading saved credentials:', error);
      }
    };
    loadSavedCredentials();
  }, []);

  const login = async () => {
    if (!email || !password) return Alert.alert('Error', 'Please fill in all fields');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      if (rememberMe) {
        await SecureStore.setItemAsync('saved_email', email.trim());
        await SecureStore.setItemAsync('saved_password', password);
        await SecureStore.setItemAsync('remember_me', 'true');
      } else {
        await SecureStore.deleteItemAsync('saved_email');
        await SecureStore.deleteItemAsync('saved_password');
        await SecureStore.setItemAsync('remember_me', 'false');
      }
    } catch (e) {
      const msg = e.code === 'auth/invalid-credential' ? 'Invalid email or password' : e.message;
      Alert.alert('Login Failed', msg);
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
        <LinearGradient colors={[theme.primary, theme.secondary]} style={[styles.topSection, { paddingTop: insets.top + 20 }]}>
          <View style={styles.logoCircle}>
            <Ionicons name="leaf" size={44} color="#fff" />
          </View>
          <Text style={styles.appName}>Smart Nutri Scanner</Text>
          <Text style={styles.tagline}>AI-Powered Filipino Meal Analyzer</Text>
        </LinearGradient>

        <View style={styles.form}>
          <Text style={styles.title}>Welcome Back 👋</Text>
          <Text style={styles.sub}>Sign in to continue tracking your nutrition</Text>

          <Text style={styles.label}>Email</Text>
          <View style={[styles.inputWrapper, focusedField === 'email' && { borderColor: theme.primary, backgroundColor: theme.light }]}>
            <Ionicons name="mail-outline" size={20} color={focusedField === 'email' ? theme.primary : '#bbb'} style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Email address" placeholderTextColor="#bbb" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)} />
          </View>

          <Text style={styles.label}>Password</Text>
          <View style={[styles.inputWrapper, focusedField === 'password' && { borderColor: theme.primary, backgroundColor: theme.light }]}>
            <Ionicons name="lock-closed-outline" size={20} color={focusedField === 'password' ? theme.primary : '#bbb'} style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#bbb" secureTextEntry={!showPass} value={password} onChangeText={setPassword} onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)} />
            <TouchableOpacity onPress={() => setShowPass(!showPass)}>
              <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color="#bbb" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotBtn} onPress={async () => {
            if (!email) {
              Alert.alert('Error', 'Please enter your email address first');
              return;
            }
            try {
              await sendPasswordResetEmail(auth, email.trim());
              Alert.alert('✅ Reset Email Sent', 'Check your email for password reset instructions.');
            } catch (error) {
              Alert.alert('Error', 'Failed to send reset email. Please try again.');
            }
          }}>
            <Text style={[styles.forgotText, { color: theme.primary }]}>Forgot Password?</Text>
          </TouchableOpacity>

          <View style={styles.checkboxRow}>
            <TouchableOpacity style={[styles.checkbox, rememberMe && { backgroundColor: theme.primary }]} onPress={() => setRememberMe(!rememberMe)}>
              {rememberMe && <Ionicons name="checkmark" size={16} color="#fff" />}
            </TouchableOpacity>
            <Text style={styles.checkboxText}>Remember me</Text>
          </View>

          <TouchableOpacity style={[styles.btn, { backgroundColor: theme.primary }, loading && styles.btnDisabled]} onPress={login} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Sign In</Text>}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity style={styles.googleBtn}>
            <Ionicons name="logo-google" size={20} color="#DB4437" />
            <Text style={styles.googleBtnText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={styles.switchBtn}>
            <Text style={styles.switchText}>Don't have an account? <Text style={[styles.switchLink, { color: theme.primary }]}>Sign Up</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  topSection: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, paddingHorizontal: 20 },
  logoCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  appName: { color: '#fff', fontSize: 26, fontWeight: 'bold', textAlign: 'center' },
  tagline: { color: 'rgba(255,255,255,0.75)', fontSize: 13, textAlign: 'center', marginTop: 6 },
  form: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 28, paddingTop: 32, marginTop: -20, flex: 1 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 4 },
  sub: { fontSize: 13, color: '#999', marginBottom: 24 },
  label: { fontSize: 12, fontWeight: '700', color: '#555', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#eee', borderRadius: 14, paddingHorizontal: 14, marginBottom: 16, backgroundColor: '#FAFAFA', height: 54 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#333' },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 20, marginTop: -8 },
  forgotText: { fontSize: 13, fontWeight: '600' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: '#ddd', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  checkboxText: { fontSize: 14, color: '#333' },
  btn: { padding: 16, borderRadius: 14, alignItems: 'center', elevation: 4, shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  divider: { flex: 1, height: 1, backgroundColor: '#eee' },
  dividerText: { marginHorizontal: 12, color: '#bbb', fontSize: 12 },
  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#eee', padding: 14, borderRadius: 14, marginBottom: 20, gap: 10, backgroundColor: '#FAFAFA' },
  googleBtnText: { fontSize: 15, fontWeight: '600', color: '#333' },
  switchBtn: { alignItems: 'center', paddingBottom: 20 },
  switchText: { color: '#999', fontSize: 14 },
  switchLink: { fontWeight: 'bold' },
});
