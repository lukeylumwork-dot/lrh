/**
 * Client-side fetch interceptor that attaches the current Supabase session
 * access token to every TanStack `_serverFn` request. Server functions guarded
 * by `requireSupabaseAuth` need this Authorization header to authenticate.
 *
 * Safe to call multiple times — installs at most once per page.
 */
import { supabase } from "./client";

let installed = false;

export function installServerFnAuth() {
  if (installed) return;
  if (typeof window === "undefined") return;
  installed = true;

  const original = window.fetch.bind(window);

  window.fetch = async (input, init) => {
    try {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input instanceof Request
              ? input.url
              : "";
      if (url.includes("/_serverFn/")) {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        if (token) {
          const headers = new Headers(
            init?.headers ?? (input instanceof Request ? input.headers : undefined),
          );
          if (!headers.has("authorization")) {
            headers.set("authorization", `Bearer ${token}`);
          }
          return original(input, { ...init, headers });
        }
      }
    } catch (err) {
      console.warn("[serverFn auth] failed to attach token", err);
    }
    return original(input, init);
  };
}
