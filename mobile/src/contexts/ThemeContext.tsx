import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { lightColors, darkColors, type AppColors } from "../theme/colors";

type ThemeMode = "light" | "dark";

interface ThemeContextType {
  mode: ThemeMode;
  colors: AppColors;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const PREF_KEY = "aura.theme"; // REQUISITO 5: preferência em AsyncStorage

export function ThemeProvider({ children }: { children: ReactNode }) {
  // REQUISITO 6: useColorScheme define o tema inicial pelo sistema
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>(
    systemScheme === "dark" ? "dark" : "light"
  );

  useEffect(() => {
    AsyncStorage.getItem(PREF_KEY).then((saved) => {
      if (saved === "light" || saved === "dark") setMode(saved);
    });
  }, []);

  const toggleTheme = () => {
    setMode((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      AsyncStorage.setItem(PREF_KEY, next); // persiste preferência
      return next;
    });
  };

  const isDark = mode === "dark";
  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ mode, colors, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme deve ser usado dentro de ThemeProvider");
  return ctx;
}
