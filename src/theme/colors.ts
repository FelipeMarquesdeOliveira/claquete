/**
 * Claquete official palette.
 * Reference: dark movie theater + amber projector light.
 * Defined in CP4 (docs/02-marca.md) and used as the single source of truth.
 */
export const colors = {
  // surfaces
  background: '#0E0E12', // theater black
  surface: '#1A1A21', // card / seat
  surfaceAlt: '#24242D', // hover states and dividers
  border: '#2E2E38',

  // brand
  primary: '#FFC53D', // projector amber - primary action, scores, highlights
  primaryDark: '#E0A517',
  secondary: '#E23E57', // seat red - alerts and "your turn"

  // text
  text: '#F5F5F7',
  textMuted: '#9A9AA5',
  textInverse: '#0E0E12',

  // semantic
  success: '#4ADE80',
  warning: '#FBBF24',
  danger: '#EF4444',
} as const;

export type ColorToken = keyof typeof colors;
