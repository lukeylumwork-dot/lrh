import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { installServerFnAuth } from "@/integrations/supabase/install-fetch-auth";

/**
 * Ensures:
 *   1. The server-fn fetch interceptor is installed BEFORE any server fn call.
 *   2. A Supabase session exists (signing in anonymously if needed).
 *   3. The session has a valid access_token.
 *
 * Only flips `authReady` to true once all three conditions are met, so callers
 * can safely invoke `requireSupabaseAuth`-guarded server functions.
 */
export function useAnonAuth() {
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Install the fetch interceptor synchronously, before anything else runs.
    try {
      installServerFnAuth();
    } catch (err) {
      console.warn("[useAnonAuth] failed to install fetch auth", err);
    }

    (async () => {
      try {
        let { data } = await supabase.auth.getSession();

        if (!data.session) {
          const { error } = await supabase.auth.signInAnonymously();
          if (error) {
            if (!cancelled)
              setAuthError(
                "Anonymous sign-in is disabled. Enable it in Cloud → Users → Auth settings.",
              );
            return;
          }
          ({ data } = await supabase.auth.getSession());
        }

        if (!data.session?.access_token) {
          if (!cancelled)
            setAuthError("Could not establish a session. Please reload.");
          return;
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
