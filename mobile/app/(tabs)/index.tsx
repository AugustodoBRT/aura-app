import { useCallback, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getNotes, deleteNote } from "../../src/services/notesService";
import { useFetch } from "../../src/hooks/useFetch";
import { useMutation } from "../../src/hooks/useMutation";
import { useTheme } from "../../src/contexts/ThemeContext";
import type { Nota } from "../../src/types";

export default function NotesScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [search, setSearch] = useState("");

  // REQUISITO 3 + 8: hook customizado com loading/erro
  const { data, loading, error, refetch } = useFetch<Nota[]>(getNotes, []);
  const { mutate: removeNote } = useMutation(deleteNote);

  // Recarrega ao voltar para a tela (apos editar/criar)
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  const notes = (data ?? []).filter((n) =>
    n.titulo.toLowerCase().includes(search.toLowerCase())
  );

  const confirmDelete = (id: number) => {
    Alert.alert("Excluir nota", "Tem certeza?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await removeNote(id);
            refetch();
          } catch {
            Alert.alert("Erro", "Nao foi possivel excluir. Verifique sua conexao.");
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Nota }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => router.push({ pathname: "/editor", params: { id: String(item.id_nota) } })}
      onLongPress={() => confirmDelete(item.id_nota)}
    >
      <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
        {item.titulo || "Sem titulo"}
      </Text>
      <Text style={[styles.cardPreview, { color: colors.textSecondary }]} numberOfLines={2}>
        {item.texto}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TextInput
        style={[styles.search, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
        placeholder="Buscar por titulo..."
        placeholderTextColor={colors.textSecondary}
        value={search}
        onChangeText={setSearch}
      />

      {/* REQUISITO 8: estado de carregamento */}
      {loading && (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      )}

      {/* REQUISITO 8: erro de rede */}
      {!loading && error && (
        <View style={styles.center}>
          <Text style={{ color: colors.danger, textAlign: "center", marginBottom: 12 }}>
            {error}
          </Text>
          <TouchableOpacity onPress={refetch} style={[styles.retry, { borderColor: colors.primary }]}>
            <Text style={{ color: colors.primary }}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && (
        <FlatList
          data={notes}
          keyExtractor={(item) => String(item.id_nota)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={refetch} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <Text style={{ color: colors.textSecondary, textAlign: "center", marginTop: 40 }}>
              Nenhuma nota ainda. Toque em + para criar.
            </Text>
          }
        />
      )}

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => router.push("/editor")}
      >
        <Ionicons name="add" size={32} color={colors.primaryText} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  search: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 15, marginBottom: 12 },
  card: { borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 12 },
  cardTitle: { fontSize: 17, fontWeight: "700", marginBottom: 4 },
  cardPreview: { fontSize: 14 },
  center: { alignItems: "center", marginTop: 40, paddingHorizontal: 24 },
  retry: { borderWidth: 1, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16 },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
});
