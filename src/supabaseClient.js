import { createClient } from "@supabase/supabase-js";

// --- PASTE YOUR SUPABASE CREDENTIALS BELOW ---
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://jjnteeheaacaadksmmcj.supabase.co";
const SUPABASE_PUBLIC_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_qnq44-HlFlrUKzW4lmwz1Q_LYPeMCNP";

if (!SUPABASE_URL || SUPABASE_URL.includes("your-project-url")) {
  console.warn("Supabase URL is missing or using placeholder. Please set VITE_SUPABASE_URL in Settings.");
}

if (!SUPABASE_PUBLIC_KEY || SUPABASE_PUBLIC_KEY.startsWith("sb_publishable")) {
  console.warn("Supabase Anon Key is missing or using placeholder. Please set VITE_SUPABASE_ANON_KEY in Settings.");
}
// ----------------------------------------------

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
