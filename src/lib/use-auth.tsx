import * as React from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);
const RETURN_KEY = "nexus-auth-next";

/** Social sign-in returns to the site root; send the visitor where they started. */
function resumeIntendedPath() {
  try {
    const target = window.sessionStorage.getItem(RETURN_KEY);
    window.sessionStorage.removeItem(RETURN_KEY);
    if (target && target.startsWith("/") && !target.startsWith("//")) {
      if (window.location.pathname !== target) window.location.replace(target);
    }
  } catch {
    // storage can be unavailable
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
      if (event === "SIGNED_IN" && nextSession) resumeIntendedPath();
    });

    supabase.auth.getSession().then(({ data: current }) => {
      setSession(current.session);
      setLoading(false);
      if (current.session) resumeIntendedPath();
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
