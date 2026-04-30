import { create } from "zustand";
import { Session } from "@supabase/supabase-js";

type AuthStore = {
  session: Session | null;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  session: null,
  isLoading: true,
  setSession: (session) => set({ session, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
