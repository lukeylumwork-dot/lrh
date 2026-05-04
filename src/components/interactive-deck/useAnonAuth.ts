import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Ensures a Supabase session exists (signs in anonymously if needed) and
 * installs the server-fn fetch interceptor. Used by interactive deck routes.
 */
export function useAnonAuth() {
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    import("@/integrations/supabase/install-fetch-auth")
      .then((m) => m.installServerFnAuth())
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          const { error } = await supabase.auth.signInAnonymously();
          if (error) {
            if (!cancelled)
              setAuthError(
                "Anonymous sign-in is disabled. Enable it in Cloud → Users → Auth settings.",
              );
            return;
          }
        }
        if (!cancelled) setAuthReady(true);
      } catch (err) {
        if (!cancelled)
          setAuthError(err instanceof Error ? err.message : "Auth failed");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { authReady, authError };
}
