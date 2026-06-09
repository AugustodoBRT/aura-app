import * as SecureStore from "expo-secure-store";

// REQUISITO 5: expo-secure-store para TOKENS sensíveis
const TOKEN_KEY = "aura.access_token";

export async function saveToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (e) {
    console.error("Erro ao salvar token no SecureStore:", e);
  }
}

export async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (e) {
    console.error("Erro ao ler token do SecureStore:", e);
    return null;
  }
}

export async function deleteToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (e) {
    console.error("Erro ao apagar token do SecureStore:", e);
  }
}
