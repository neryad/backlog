import { create } from "zustand";
import { Session, User } from "@supabase/supabase-js";

type AuthStore = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  session: null,
  user: null,
  isLoading: true,
  setSession: (session) =>
    set({
      session,
      user: session?.user ?? null,
      isLoading: false,
    }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
