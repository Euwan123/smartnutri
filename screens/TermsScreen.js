import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

export default function TermsScreen({ navigation }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [accepted, setAccepted] = useState(false);

  const termsText = `Terms of Service for Smart Nutri Scanner

Last Updated: May 5, 2026

1. Acceptance of Terms
By accessing and using Smart Nutri Scanner, you accept and agree to be bound by the terms and provision of this agreement.

2. Use License
Permission is granted to temporarily use Smart Nutri Scanner for personal, non-commercial transitory viewing only.

3. Disclaimer
The information on this app is provided on an 'as is' basis. To the fullest extent permitted by law, this Company excludes all representations and warranties relating to this app and its contents.

4. Limitations
In no event shall Smart Nutri Scanner or its suppliers be liable for any damages arising out of the use or inability to use this app.

5. Privacy Policy
Your privacy is important to us. We collect personal information you provide and usage data to improve our services.

6. Data Storage
Meal data, profile information, and images are stored securely in Firebase. You retain ownership of your data.

7. AI Scanning
The app uses AI technology to analyze food images. Results are estimates and should not replace professional nutritional advice.

8. User Responsibilities
You agree to provide accurate information and use the app responsibly for health tracking purposes.

9. Termination
We may terminate or suspend access to our service immediately, without prior notice, for any reason.

10. Governing Law
These terms shall be interpreted and governed by the laws of the Philippines.`;

  const acceptTerms = () => {
    if (!accepted) {
      Alert.alert('Required', 'Please accept the terms to continue');
      return;
    }
    navigation.navigate('Login');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.light }]} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={[theme.primary, theme.secondary]} style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View style={styles.logoCircle}>
          <Ionicons name="document-text" size={40} color="#fff" />
        </View>
        <Text style={styles.title}>Terms of Service</Text>
        <Text style={styles.sub}>Please read and accept to continue</Text>
      </LinearGradient>

      <View style={styles.content}>
        <ScrollView style={styles.termsBox} showsVerticalScrollIndicator={false}>
          <Text style={styles.termsText}>{termsText}</Text>
        </ScrollView>

        <View style={styles.checkboxRow}>
          <TouchableOpacity style={[styles.checkbox, accepted && { backgroundColor: theme.primary }]} onPress={() => setAccepted(!accepted)}>
            {accepted && <Ionicons name="checkmark" size={16} color="#fff" />}
          </TouchableOpacity>
          <Text style={styles.checkboxText}>I have read and agree to the Terms of Service</Text>
        </View>

        <TouchableOpacity style={[styles.btn, { backgroundColor: theme.primary }]} onPress={acceptTerms}>
          <Text style={styles.btnText}>Accept & Continue</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.declineBtn} onPress={() => Alert.alert('Required', 'You must accept the terms to use this app')}>
          <Text style={styles.declineText}>I Decline</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  logoCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  sub: { color: 'rgba(255,255,255,0.75)', fontSize: 14, textAlign: 'center', marginTop: 6 },
  content: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 28, marginTop: -20, flex: 1 },
  termsBox: { backgroundColor: '#f8f9fa', borderRadius: 16, padding: 20, marginBottom: 24, maxHeight: 300 },
  termsText: { fontSize: 14, lineHeight: 20, color: '#333' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#ddd', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  checkboxText: { fontSize: 14, color: '#333', flex: 1 },
  btn: { backgroundColor: '#4CAF50', paddingVertical: 16, paddingHorizontal: 24, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', marginBottom: 16 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  declineBtn: { alignItems: 'center', paddingVertical: 12 },
  declineText: { color: '#666', fontSize: 14 },
});
