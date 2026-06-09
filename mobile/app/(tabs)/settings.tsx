import { View, Text, Switch, TouchableOpacity, StyleSheet } from "react-native";
import { useAuth } from "../../src/contexts/AuthContext";
import { useTheme } from "../../src/contexts/ThemeContext";

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.row, { borderBottomColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.text }]}>Conta</Text>
        <Text style={{ color: colors.textSecondary }}>{user?.email}</Text>
      </View>

      {/* REQUISITO 6: alternância de dark mode (persistida em AsyncStorage) */}
      <View style={[styles.row, { borderBottomColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.text }]}>Modo escuro</Text>
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          trackColor={{ true: colors.primary }}
        />
      </View>

      <TouchableOpacity
        style={[styles.logout, { borderColor: colors.danger }]}
        onPress={signOut}
      >
        <Text style={{ color: colors.danger, fontWeight: "700" }}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    borderBottomWidth: 1,
  },
  label: { fontSize: 16, fontWeight: "600" },
  logout: {
    marginTop: 32,
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
  },
});
