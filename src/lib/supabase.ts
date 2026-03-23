import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://efrsbecoezerbvihqwlf.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_snftsybmKYiAhmL8K0HzGg_M1rsxuGu";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
