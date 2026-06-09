// REQUISITO 6: sistema de cores centralizado para dark mode

export const lightColors = {
  background: "#ffffff",
  surface: "#f5f5f5",
  card: "#ffffff",
  text: "#1a1a1a",
  textSecondary: "#666666",
  border: "#e0e0e0",
  primary: "#6c5ce7",
  primaryText: "#ffffff",
  danger: "#e74c3c",
  success: "#27ae60",
  inputBg: "#ffffff",
};

export const darkColors = {
  background: "#121212",
  surface: "#1e1e1e",
  card: "#1e1e1e",
  text: "#f5f5f5",
  textSecondary: "#a0a0a0",
  border: "#333333",
  primary: "#a29bfe",
  primaryText: "#121212",
  danger: "#ff6b6b",
  success: "#55efc4",
  inputBg: "#2a2a2a",
};

export type AppColors = typeof lightColors;
