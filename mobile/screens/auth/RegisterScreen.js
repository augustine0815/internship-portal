import { useContext } from 'react';
import { AuthContext } from '../../App';
import { registerUser } from '../../services';

export default function RegisterScreen({ navigation }) {
    const { signIn } = useContext(AuthContext);
  const { signUp } = useContext(AuthContext);
  const [form, setForm] = useState({
    email: '', password: '', role: 'student',
    full_name: '', company_name: '',
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!form.email || !form.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await registerUser(form);
      await signUp(res.data.token, res.data.user);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.emoji}>🎓</Text>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the Internship Portal</Text>

          <Text style={styles.label}>I am a</Text>
          <View style={styles.roleContainer}>
            {['student', 'company'].map(r => (
              <TouchableOpacity
                key={r}
                style={[styles.roleBtn, form.role === r && styles.roleBtnActive]}
                onPress={() => setForm({ ...form, role: r })}
              >
                <Text style={[styles.roleBtnText, form.role === r && styles.roleBtnTextActive]}>
                  {r === 'student' ? '👨‍🎓 Student' : '🏢 Company'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {form.role === 'student' && (
            <>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="John Smith"
                value={form.full_name}
                onChangeText={v => setForm({ ...form, full_name: v })}
              />
            </>
          )}

          {form.role === 'company' && (
            <>
              <Text style={styles.label}>Company Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Tech Corp Sdn Bhd"
                value={form.company_name}
                onChangeText={v => setForm({ ...form, company_name: v })}
              />
            </>
          )}

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@email.com"
            value={form.email}
            onChangeText={v => setForm({ ...form, email: v })}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            value={form.password}
            onChangeText={v => setForm({ ...form, password: v })}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>Already have an account? Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5', padding: 20 },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 28, marginVertical: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  emoji: { fontSize: 40, textAlign: 'center', marginBottom: 8 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#1a1a2e', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 16, backgroundColor: '#fafafa' },
  roleContainer: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  roleBtn: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 2, borderColor: '#ddd', alignItems: 'center' },
  roleBtnActive: { borderColor: '#1a1a2e', backgroundColor: '#1a1a2e' },
  roleBtnText: { fontSize: 14, color: '#666', fontWeight: '600' },
  roleBtnTextActive: { color: 'white' },
  button: { backgroundColor: '#1a1a2e', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 8, marginBottom: 16 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  link: { textAlign: 'center', color: '#3498db', fontSize: 14 },
});