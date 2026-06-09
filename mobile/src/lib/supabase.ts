import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

// Mesmas credenciais do projeto PWA (anon/publishable key)
const SUPABASE_URL = "https://efrsbecoezerbvihqwlf.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_snftsybmKYiAhmL8K0HzGg_M1rsxuGu";

// REQUISITO 5: AsyncStorage como storage da sessão (cache/preferências de auth)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
