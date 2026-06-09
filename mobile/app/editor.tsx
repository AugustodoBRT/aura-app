import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import {
  getNoteById,
  createNote,
  updateNote,
} from "../src/services/notesService";
import { useTheme } from "../src/contexts/ThemeContext";
import { handlePermissionResult } from "../src/lib/permissions";
import MarkdownPreview from "../src/components/MarkdownPreview";

export default function EditorScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isNew = !id;
  const router = useRouter();
  const { colors } = useTheme();

  const [titulo, setTitulo] = useState("");
  const [texto, setTexto] = useState("");
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew) return;
    (async () => {
      try {
        const note = await getNoteById(Number(id));
        setTitulo(note.titulo);
        setTexto(note.texto);
      } catch (e) {
        // REQUISITO 8: erro de rede
        Alert.alert("Erro", e instanceof Error ? e.message : "Falha ao carregar");
        router.back();
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isNew) await createNote(titulo, texto);
      else await updateNote(Number(id), titulo, texto);
      router.back();
    } catch (e) {
      Alert.alert("Erro ao salvar", e instanceof Error ? e.message : "Falha de conexao");
    } finally {
      setSaving(false);
    }
  };

  // RECURSO NATIVO 1: expo-image-picker (substitui Camera/File API do PWA)
  const handlePickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    // REQUISITO 11: conceder / negar / abrir Configuracoes
    if (!handlePermissionResult(perm.granted, perm.canAskAgain, "suas fotos")) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.6,
    });
    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      // Insere a imagem como Markdown no texto da nota
      setTexto((t) => `${t}\n\n![imagem](${asset.uri})\n`);
    }
  };

  // RECURSO NATIVO 2: expo-location (substitui Geolocation API do PWA)
  const handleAddLocation = async () => {
    const perm = await Location.requestForegroundPermissionsAsync();
    if (!handlePermissionResult(perm.granted, perm.canAskAgain, "sua localizacao")) return;

    try {
      const loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;
      setTexto(
        (t) => `${t}\n\nLocal: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}\n`
      );
    } catch {
      Alert.alert("Erro", "Nao foi possivel obter a localizacao.");
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: isNew ? "Nova nota" : "Editar nota",
          headerRight: () => (
            <TouchableOpacity onPress={handleSave} disabled={saving}>
              {saving ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Text style={{ color: colors.primary, fontWeight: "700", fontSize: 16 }}>
                  Salvar
                </Text>
              )}
            </TouchableOpacity>
          ),
        }}
      />

      <TextInput
        style={[styles.title, { color: colors.text, borderBottomColor: colors.border }]}
        placeholder="Titulo"
        placeholderTextColor={colors.textSecondary}
        value={titulo}
        onChangeText={setTitulo}
      />

      <View style={styles.toolbar}>
        <TouchableOpacity onPress={handlePickImage} style={styles.toolBtn}>
          <Ionicons name="image-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleAddLocation} style={styles.toolBtn}>
          <Ionicons name="location-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setMode(mode === "edit" ? "preview" : "edit")}
          style={styles.toolBtn}
        >
          <Ionicons
            name={mode === "edit" ? "eye-outline" : "create-outline"}
            size={22}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      {mode === "edit" ? (
        <TextInput
          style={[styles.editor, { color: colors.text }]}
          placeholder="Escreva em Markdown..."
          placeholderTextColor={colors.textSecondary}
          value={texto}
          onChangeText={setTexto}
          multiline
          textAlignVertical="top"
        />
      ) : (
        <ScrollView style={styles.preview}>
          <MarkdownPreview content={texto} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "700", borderBottomWidth: 1, paddingVertical: 8 },
  toolbar: { flexDirection: "row", gap: 8, paddingVertical: 10 },
  toolBtn: { padding: 8 },
  editor: { flex: 1, fontSize: 16, lineHeight: 24 },
  preview: { flex: 1 },
});
