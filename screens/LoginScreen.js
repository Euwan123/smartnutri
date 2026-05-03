import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const login = async () => {
    if (!email || !password) return Alert.alert('Error', 'Please fill in all fields');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      setLoading(false);
    } catch (e) {
      Alert.alert('Login Failed', e.message);
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.top}>
        <Text style={styles.logo}>🥗</Text>
        <Text style={styles.appName}>Smart Nutri Scanner</Text>
        <Text style={styles.tagline}>AI-Powered Filipino Meal Analyzer</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.sub}>Sign in to your account</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="you@email.com"
          placeholderTextColor="#aaa"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Password</Text>
        <View style={styles.passRow}>
          <TextInput
            style={styles.passInput}
            placeholder="Enter your password"
            placeholderTextColor="#aaa"
            secureTextEntry={!showPass}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPass(!showPass)}>
            <Text style={styles.showBtn}>{showPass ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.btn} onPress={login} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Sign In</Text>}
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.divider} />
        </View>

        <TouchableOpacity style={styles.googleBtn}>
          <Text style={styles.googleBtnText}>🔵  Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.switchText}>Don't have an account? <Text style={styles.switchLink}>Sign Up</Text></Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1B5E20' },
  top: { alignItems: 'center', paddingTop: 70, paddingBottom: 30 },
  logo: { fontSize: 60 },
  appName: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginTop: 10 },
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
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  divider: { flex: 1, height: 1, backgroundColor: '#eee' },
  dividerText: { marginHorizontal: 12, color: '#aaa', fontSize: 13 },
  googleBtn: { borderWidth: 1.5, borderColor: '#ddd', padding: 14, borderRadius: 14, alignItems: 'center', marginBottom: 24, backgroundColor: '#FAFAFA' },
  googleBtnText: { fontSize: 15, fontWeight: '600', color: '#333' },
  switchText: { textAlign: 'center', color: '#888', fontSize: 14 },
  switchLink: { color: '#1B5E20', fontWeight: 'bold' },
});