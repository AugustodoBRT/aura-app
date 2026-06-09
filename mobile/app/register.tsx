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
import { useRouter } from "expo-router";
import { useAuth } from "../src/contexts/AuthContext";
import { useTheme } from "../src/contexts/ThemeContext";

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      Alert.alert("Atenção", "Preencha todos os campos.");
      return;
    }
    setLoading(true);
    try {
      await signUp(email.trim(), password, fullName.trim());
      Alert.alert("Conta criada", "Verifique seu e-mail se necessário e faça login.");
      router.replace("/login");
    } catch (e) {
      Alert.alert("Erro no cadastro", e instanceof Error ? e.message : "Falha de conexão");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <TextInput
        style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
        placeholder="Nome completo"
        placeholderTextColor={colors.textSecondary}
        value={fullName}
        onChangeText={setFullName}
      />
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
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.primaryText} />
        ) : (
          <Text style={[styles.buttonText, { color: colors.primaryText }]}>Cadastrar</Text>
        )}
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24 },
  input: { borderWidth: 1, borderRadius: 10, padding: 14, fontSize: 16, marginBottom: 14 },
  button: { borderRadius: 10, padding: 16, alignItems: "center", marginTop: 8 },
  buttonText: { fontSize: 16, fontWeight: "700" },
});
