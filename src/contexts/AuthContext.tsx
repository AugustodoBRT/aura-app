import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { supabase } from "../lib/supabase";

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

  // Verificar se o usuário já está autenticado ao carregar
  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || "",
          });
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();

    // Listener para mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || "",
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const ensureUsuarioRow = async (email: string, fullName: string) => {
    console.log("[ensureUsuarioRow] Checking for email:", email);
    // Check if row already exists
    const { data: existing, error: selectError } = await supabase
      .from("usuario")
      .select("id_usuario")
      .eq("email", email)
      .maybeSingle();

    console.log("[ensureUsuarioRow] SELECT result:", { existing, selectError });

    if (!existing) {
      console.log("[ensureUsuarioRow] Inserting new usuario row...");
      const { data: inserted, error: insertError } = await supabase
        .from("usuario")
        .insert({
          nome_usuario: fullName,
          email: email,
          login: email,
          senha: "",
        })
        .select();

      console.log("[ensureUsuarioRow] INSERT result:", { inserted, insertError });

      if (insertError) {
        console.error("[ensureUsuarioRow] INSERT FAILED:", insertError);
      }
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      // Insert into usuario table so the app services can find the user
      if (data.user) {
        await ensureUsuarioRow(email, fullName);
      }
    } catch (error) {
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      // Backfill: ensure usuario row exists for users who signed up before this fix
      if (data.user) {
        const fullName = data.user.user_metadata?.full_name || email;
        await ensureUsuarioRow(email, fullName);
      }
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      throw error;
    }
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
