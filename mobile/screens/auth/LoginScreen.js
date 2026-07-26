import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform
} from 'react-native';
import { useContext } from 'react';
import { AuthContext } from '../../App';
import { loginUser } from '../../services';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await loginUser({ email, password });
      await signIn(res.data.token, res.data.user);
    } catch (err) {
      Alert.alert('Login Failed', err.response?.data?.message || 'Invalid email or password');
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.emoji}>🎓</Text>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="you@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>Don't have an account? Register here</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 28, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  emoji: { fontSize: 40, textAlign: 'center', marginBottom: 8 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#1a1a2e', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 16, backgroundColor: '#fafafa' },
  button: { backgroundColor: '#1a1a2e', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 8, marginBottom: 16 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  link: { textAlign: 'center', color: '#3498db', fontSize: 14 },
});