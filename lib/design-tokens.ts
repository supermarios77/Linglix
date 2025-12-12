/**
 * Design Tokens
 * 
 * Centralized design token system for consistent styling across the application.
 * All design decisions should reference these tokens instead of hardcoded values.
 */

/**
 * Color Tokens
 * Use these instead of hardcoded hex colors
 */
export const colors = {
  // Brand Colors
  brand: {
    primary: "hsl(var(--brand-primary))",
    primaryDark: "hsl(var(--brand-primary-dark))",
    primaryLight: "hsl(var(--brand-primary-light))",
  },
  // Semantic Colors
  success: "hsl(var(--color-success))",
  error: "hsl(var(--color-error))",
  warning: "hsl(var(--color-warning))",
  info: "hsl(var(--color-info))",
  // Neutral Colors
  gray: {
    50: "hsl(var(--gray-50))",
    100: "hsl(var(--gray-100))",
    200: "hsl(var(--gray-200))",
    300: "hsl(var(--gray-300))",
    400: "hsl(var(--gray-400))",
    500: "hsl(var(--gray-500))",
    600: "hsl(var(--gray-600))",
    700: "hsl(var(--gray-700))",
    800: "hsl(var(--gray-800))",
    900: "hsl(var(--gray-900))",
  },
} as const;

/**
 * Spacing Tokens (8px grid system)
 * Use these for consistent spacing
 */
export const spacing = {
  1: "var(--space-1)", // 4px
  2: "var(--space-2)", // 8px
  3: "var(--space-3)", // 12px
  4: "var(--space-4)", // 16px
  5: "var(--space-5)", // 20px
  6: "var(--space-6)", // 24px
  8: "var(--space-8)", // 32px
  10: "var(--space-10)", // 40px
  12: "var(--space-12)", // 48px
  16: "var(--space-16)", // 64px
  20: "var(--space-20)", // 80px
  24: "var(--space-24)", // 96px
} as const;

/**
 * Typography Tokens
 * Use these for consistent text sizing
 */
export const typography = {
  fontSize: {
    xs: "var(--text-xs)", // 12px
    sm: "var(--text-sm)", // 14px
    base: "var(--text-base)", // 16px
    lg: "var(--text-lg)", // 18px
    xl: "var(--text-xl)", // 20px
    "2xl": "var(--text-2xl)", // 24px
    "3xl": "var(--text-3xl)", // 30px
    "4xl": "var(--text-4xl)", // 36px
    "5xl": "var(--text-5xl)", // 48px
    "6xl": "var(--text-6xl)", // 60px
    "7xl": "var(--text-7xl)", // 72px
    "8xl": "var(--text-8xl)", // 96px
  },
  lineHeight: {
    tight: "var(--leading-tight)",
    snug: "var(--leading-snug)",
    normal: "var(--leading-normal)",
    relaxed: "var(--leading-relaxed)",
    loose: "var(--leading-loose)",
  },
  letterSpacing: {
    tighter: "var(--tracking-tighter)",
    tight: "var(--tracking-tight)",
    normal: "var(--tracking-normal)",
    wide: "var(--tracking-wide)",
    wider: "var(--tracking-wider)",
  },
} as const;

/**
 * Border Radius Tokens
 * Use these for consistent rounded corners
 */
export const radius = {
  sm: "var(--radius-sm)", // 8px
  md: "var(--radius-md)", // 12px
  lg: "var(--radius-lg)", // 16px
  xl: "var(--radius-xl)", // 24px
  "2xl": "var(--radius-2xl)", // 32px
  full: "var(--radius-full)", // 9999px
} as const;

/**
 * Shadow Tokens
 * Use these for consistent elevation
 */
export const shadows = {
  sm: "var(--shadow-sm)",
  DEFAULT: "var(--shadow)",
  md: "var(--shadow-md)",
  lg: "var(--shadow-lg)",
  xl: "var(--shadow-xl)",
  "2xl": "var(--shadow-2xl)",
} as const;

/**
 * Opacity Tokens
 * Use these for consistent transparency
 */
export const opacity = {
  disabled: "var(--opacity-disabled)",
  hover: "var(--opacity-hover)",
  active: "var(--opacity-active)",
  backdrop: "var(--opacity-backdrop)",
  overlay: "var(--opacity-overlay)",
} as const;
