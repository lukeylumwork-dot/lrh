/**
 * Per-slide keyword highlight mapping.
 *
 * The first occurrence of the configured keyword (case-insensitive) is colored
 * brand blue wherever it appears inside that slide's title, body text, bullets,
 * or eyebrow — via the <Highlighted /> helper or `useSlideKeyword()` hook.
 *
 * To override at runtime per user, the editor side panel writes to
 * `slide_overrides.highlight_keyword` for both LRH and imported decks. That
 * value, when present, takes precedence over this static mapping.
 *
 * Edit values here freely; restart-free, no codegen required.
 */
export const LRH_KEYWORDS: Record<string, string> = {
  title: "Repo",
  thesis: "data layer",
  problem: "No Market",
  solution: "all-to-all",
  competition: "differentiated",
  story: "London",
  pipeline: "pipeline",
  "sandbox-pilot": "sandbox",
  onboarding: "onboarding",
  "data-journey": "journey",
  "investment-ask": "ask",
  "product-roadmap": "roadmap",
  team: "team",
  "investment-summary": "summary",
  "marketing-strategy": "strategy",
  "appendix-use-cases-1": "use cases",
  "appendix-use-cases-2": "use cases",
  architecture: "architecture",
  "all-to-all": "all-to-all",
};

export type LrhSlideId = keyof typeof LRH_KEYWORDS;
