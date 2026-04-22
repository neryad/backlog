import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && SUPABASE_ANON_KEY,
);

// Migrates a key from AsyncStorage to SecureStore once, then cleans up.
async function migrateKeyIfNeeded(key: string): Promise<void> {
  try {
    const already = await SecureStore.getItemAsync(key);
    if (already) return;
    const legacy = await AsyncStorage.getItem(key);
    if (!legacy) return;
    await SecureStore.setItemAsync(key, legacy);
    await AsyncStorage.removeItem(key);
  } catch {
    // Non-fatal: worst case the user is re-prompted to log in.
  }
}

const SecureStoreAdapter = {
  getItem: async (key: string) => {
    await migrateKeyIfNeeded(key);
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(
  SUPABASE_URL ?? "https://placeholder.supabase.co",
  SUPABASE_ANON_KEY ?? "placeholder-anon-key",
  {
    auth: {
      storage: SecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);
