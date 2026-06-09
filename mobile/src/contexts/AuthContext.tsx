import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { supabase } from "../lib/supabase";
import { saveToken, deleteToken } from "../services/secureStore";

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email || "" });
          // REQUISITO 5: token sensível guardado no SecureStore
          if (session.access_token) await saveToken(session.access_token);
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email || "" });
        if (session.access_token) await saveToken(session.access_token);
      } else {
        setUser(null);
        await deleteToken();
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  const ensureUsuarioRow = async (email: string, fullName: string) => {
    const { data: existing } = await supabase
      .from("usuario")
      .select("id_usuario")
      .eq("email", email)
      .maybeSingle();

    if (!existing) {
      const { error: insertError } = await supabase.from("usuario").insert({
        nome_usuario: fullName,
        email,
        login: email,
        senha: "",
      });
      if (insertError) console.error("[ensureUsuarioRow] INSERT FAILED:", insertError);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw new Error(error.message);
    if (data.user) await ensureUsuarioRow(email, fullName);
  };

  const signIn = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw new Error(error.message);
    if (data.user) {
      const fullName = data.user.user_metadata?.full_name || email;
      await ensureUsuarioRow(email, fullName);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
}
