/**
 * London Reporting House — institutional brand tokens.
 *
 * Mirrors the CSS variables in `src/styles.css`. Use these constants in
 * TypeScript / inline style situations where Tailwind utilities aren't
 * convenient. For everything else, prefer the CSS variable directly:
 *   className="text-[var(--lrh-blue-500)]"
 *   className="font-heading text-[var(--lrh-text-h1)]"
 *
 * Rules:
 *  1. Never hard-code colors in slide components.
 *  2. Body copy = navy-700, muted body = navy-500.
 *  3. Highlighted keywords & accents = blue-500.
 *  4. Dark sections = navy-900 background, white-on-navy text.
 *  5. Card surfaces = surface-0 with a hairline border.
 *  6. Stick to the spacing scale (multiples of 4px).
 */
export const BRAND = {
  color: {
    navy: {
      900: "var(--lrh-navy-900)",
      800: "var(--lrh-navy-800)",
      700: "var(--lrh-navy-700)",
      600: "var(--lrh-navy-600)",
      500: "var(--lrh-navy-500)",
    },
    blue: {
      700: "var(--lrh-blue-700)",
      600: "var(--lrh-blue-600)",
      500: "var(--lrh-blue-500)",
      400: "var(--lrh-blue-400)",
      300: "var(--lrh-blue-300)",
      200: "var(--lrh-blue-200)",
      100: "var(--lrh-blue-100)",
    },
    surface: {
      0: "var(--lrh-surface-0)",
      50: "var(--lrh-surface-50)",
      100: "var(--lrh-surface-100)",
      200: "var(--lrh-surface-200)",
      300: "var(--lrh-surface-300)",
      400: "var(--lrh-surface-400)",
    },
    status: {
      success: "var(--lrh-success)",
      warning: "var(--lrh-warning)",
      danger: "var(--lrh-danger)",
    },
  },
  font: {
    heading: "var(--font-heading)",
    body: "var(--font-body)",
  },
  text: {
    eyebrow: "var(--lrh-text-eyebrow)",
    caption: "var(--lrh-text-caption)",
    body: "var(--lrh-text-body)",
    bodyLg: "var(--lrh-text-body-lg)",
    h4: "var(--lrh-text-h4)",
    h3: "var(--lrh-text-h3)",
    h2: "var(--lrh-text-h2)",
    h1: "var(--lrh-text-h1)",
    display: "var(--lrh-text-display)",
  },
  tracking: {
    eyebrow: "var(--lrh-tracking-eyebrow)",
    tight: "var(--lrh-tracking-tight)",
    display: "var(--lrh-tracking-display)",
  },
  leading: {
    display: "var(--lrh-leading-display)",
    heading: "var(--lrh-leading-heading)",
    body: "var(--lrh-leading-body)",
  },
  weight: {
    body: "var(--lrh-weight-body)",
    medium: "var(--lrh-weight-medium)",
    bold: "var(--lrh-weight-bold)",
  },
  space: {
    1: "var(--lrh-space-1)",
    2: "var(--lrh-space-2)",
    3: "var(--lrh-space-3)",
    4: "var(--lrh-space-4)",
    5: "var(--lrh-space-5)",
    6: "var(--lrh-space-6)",
    8: "var(--lrh-space-8)",
    10: "var(--lrh-space-10)",
    12: "var(--lrh-space-12)",
    16: "var(--lrh-space-16)",
    20: "var(--lrh-space-20)",
  },
  layout: {
    paddingX: "var(--lrh-slide-padding-x)",
    paddingY: "var(--lrh-slide-padding-y)",
    gutter: "var(--lrh-slide-gutter)",
  },
  radius: {
    sm: "var(--lrh-radius-sm)",
    md: "var(--lrh-radius-md)",
    lg: "var(--lrh-radius-lg)",
    xl: "var(--lrh-radius-xl)",
  },
  shadow: {
    sm: "var(--lrh-shadow-sm)",
    md: "var(--lrh-shadow-md)",
    lg: "var(--lrh-shadow-lg)",
    card: "var(--lrh-shadow-card)",
  },
  motion: {
    ease: "var(--lrh-ease)",
    fast: "var(--lrh-duration-fast)",
    base: "var(--lrh-duration)",
    slow: "var(--lrh-duration-slow)",
  },
} as const;

/**
 * Reusable Tailwind class fragments for the four canonical text styles.
 * Use these instead of repeating typography declarations across slides.
 */
export const textStyles = {
  display:
    "font-heading font-bold leading-[var(--lrh-leading-display)] tracking-[var(--lrh-tracking-display)] text-[var(--lrh-text-display)] text-[var(--lrh-navy-700)]",
  h1: "font-heading font-bold leading-[var(--lrh-leading-display)] tracking-[var(--lrh-tracking-tight)] text-[var(--lrh-text-h1)] text-[var(--lrh-navy-700)]",
  h2: "font-heading font-bold leading-[var(--lrh-leading-heading)] tracking-[var(--lrh-tracking-tight)] text-[var(--lrh-text-h2)] text-[var(--lrh-navy-700)]",
  h3: "font-heading font-bold leading-[var(--lrh-leading-heading)] tracking-[var(--lrh-tracking-tight)] text-[var(--lrh-text-h3)] text-[var(--lrh-navy-700)]",
  h4: "font-heading font-medium leading-[var(--lrh-leading-heading)] text-[var(--lrh-text-h4)] text-[var(--lrh-navy-700)]",
  body: "font-body font-normal leading-[var(--lrh-leading-body)] text-[var(--lrh-text-body)] text-[var(--lrh-navy-700)]",
  bodyLg:
    "font-body font-normal leading-[var(--lrh-leading-body)] text-[var(--lrh-text-body-lg)] text-[var(--lrh-navy-700)]",
  bodyMuted:
    "font-body font-normal leading-[var(--lrh-leading-body)] text-[var(--lrh-text-body)] text-[var(--lrh-navy-500)]",
  caption:
    "font-body font-normal text-[var(--lrh-text-caption)] text-[var(--lrh-navy-500)]",
  eyebrow:
    "font-body font-medium uppercase text-[var(--lrh-text-eyebrow)] tracking-[var(--lrh-tracking-eyebrow)] text-[var(--lrh-blue-500)]",
} as const;

export type BrandTextStyle = keyof typeof textStyles;
