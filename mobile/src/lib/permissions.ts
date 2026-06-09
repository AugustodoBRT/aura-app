import { Alert, Linking } from "react-native";

// REQUISITO 11: trata os três fluxos de permissão.
// status: resultado de requestPermissionsAsync()
// Retorna true se concedida; caso negada, oferece abrir Configurações.
export function handlePermissionResult(
  granted: boolean,
  canAskAgain: boolean,
  featureName: string
): boolean {
  if (granted) return true;

  if (!canAskAgain) {
    // Permissão negada permanentemente -> redireciona para Configurações
    Alert.alert(
      "Permissão necessária",
      `O acesso a ${featureName} foi negado. Abra as Configurações para habilitar manualmente.`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Abrir Configurações", onPress: () => Linking.openSettings() },
      ]
    );
  } else {
    // Permissão negada (mas pode pedir de novo)
    Alert.alert(
      "Permissão negada",
      `Não foi possível acessar ${featureName} sem a permissão.`
    );
  }
  return false;
}
