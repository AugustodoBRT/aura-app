import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Link } from "expo-router";
import { useAuth } from "../src/contexts/AuthContext";
import { useTheme } from "../src/contexts/ThemeContext";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Atenção", "Preencha e-mail e senha.");
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      // navegação tratada pelo gate em _layout
    } catch (e) {
      // REQUISITO 8: tratamento de erro (rede/credenciais)
      Alert.alert("Erro ao entrar", e instanceof Error ? e.message : "Falha de conexão");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Text style={[styles.logo, { color: colors.primary }]}>Aura</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Suas notas em Markdown
      </Text>

      <TextInput
        style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
        placeholder="E-mail"
        placeholderTextColor={colors.textSecondary}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
        placeholder="Senha"
        placeholderTextColor={colors.textSecondary}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.primaryText} />
        ) : (
          <Text style={[styles.buttonText, { color: colors.primaryText }]}>Entrar</Text>
        )}
      </TouchableOpacity>

      <Link href="/register" style={[styles.link, { color: colors.primary }]}>
        Não tem conta? Cadastre-se
      </Link>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24 },
  logo: { fontSize: 48, fontWeight: "800", textAlign: "center" },
  subtitle: { fontSize: 16, textAlign: "center", marginBottom: 32 },
  input: { borderWidth: 1, borderRadius: 10, padding: 14, fontSize: 16, marginBottom: 14 },
  button: { borderRadius: 10, padding: 16, alignItems: "center", marginTop: 8 },
  buttonText: { fontSize: 16, fontWeight: "700" },
  link: { textAlign: "center", marginTop: 20, fontSize: 15 },
});
