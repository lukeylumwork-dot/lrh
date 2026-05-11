import { useEffect, useState } from "react";

export interface SubdomainStripRules {
  /** Subdomains that should be stripped from displayed URLs. */
  deny: string[];
  /** Subdomains that should NEVER be stripped (overrides deny). */
  allow: string[];
}

export const DEFAULT_DENY = ["www", "m", "mobile", "amp", "en"];

export const DEFAULT_RULES: SubdomainStripRules = {
  deny: [...DEFAULT_DENY],
  allow: [],
};

const STORAGE_PREFIX = "subdomainStripRules:";
const CHANGE_EVENT = "subdomain-strip-rules-changed";

function storageKey(deckId: string) {
  return `${STORAGE_PREFIX}${deckId}`;
}

export function loadRules(deckId: string): SubdomainStripRules {
  if (typeof window === "undefined") return DEFAULT_RULES;
  try {
    const raw = window.localStorage.getItem(storageKey(deckId));
    if (!raw) return DEFAULT_RULES;
    const parsed = JSON.parse(raw) as Partial<SubdomainStripRules>;
    return {
      deny: sanitize(parsed.deny) ?? [...DEFAULT_DENY],
      allow: sanitize(parsed.allow) ?? [],
    };
  } catch {
    return DEFAULT_RULES;
  }
}

export function saveRules(deckId: string, rules: SubdomainStripRules) {
  if (typeof window === "undefined") return;
  const cleaned: SubdomainStripRules = {
    deny: sanitize(rules.deny) ?? [],
    allow: sanitize(rules.allow) ?? [],
  };
  window.localStorage.setItem(storageKey(deckId), JSON.stringify(cleaned));
  window.dispatchEvent(
    new CustomEvent(CHANGE_EVENT, { detail: { deckId, rules: cleaned } }),
  );
}

function sanitize(list: unknown): string[] | null {
  if (!Array.isArray(list)) return null;
  const cleaned = list
    .map((v) => String(v ?? "").trim().toLowerCase())
    .filter((v) => /^[a-z0-9-]+$/.test(v));
  return Array.from(new Set(cleaned));
}

/** Reactive hook reading per-deck rules from localStorage with cross-tab sync. */
export function useSubdomainStripRules(deckId: string | null | undefined) {
  const [rules, setRules] = useState<SubdomainStripRules>(() =>
    deckId ? loadRules(deckId) : DEFAULT_RULES,
  );

  useEffect(() => {
    if (!deckId) {
      setRules(DEFAULT_RULES);
      return;
    }
    setRules(loadRules(deckId));
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent).detail as
        | { deckId?: string; rules?: SubdomainStripRules }
        | undefined;
      if (detail?.deckId === deckId && detail.rules) setRules(detail.rules);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === storageKey(deckId)) setRules(loadRules(deckId));
    };
    window.addEventListener(CHANGE_EVENT, onChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(CHANGE_EVENT, onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, [deckId]);

  return [rules, (next: SubdomainStripRules) => deckId && saveRules(deckId, next)] as const;
}

/**
 * Strip a hostname's leading subdomain when it is in the deny list and not in
 * the allow list. Mirrors the previous hard-coded behavior when called with
 * DEFAULT_RULES.
 */
export function applyHostRules(host: string, rules: SubdomainStripRules): string {
  const lower = host.toLowerCase();
  const parts = lower.split(".");
  if (parts.length <= 2) return lower;
  const head = parts[0];
  const allow = new Set(rules.allow.map((s) => s.toLowerCase()));
  const deny = new Set(rules.deny.map((s) => s.toLowerCase()));
  if (allow.has(head)) return lower;
  if (deny.has(head)) return parts.slice(1).join(".");
  return lower;
}
