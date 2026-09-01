/**
 * Claquete typography.
 * Bebas Neue -> headings and score numbers (movie poster feel).
 * Inter      -> body copy, keeps small screens readable.
 */
export const fonts = {
  display: 'BebasNeue_400Regular',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodyBold: 'Inter_700Bold',
} as const;

export const typography = {
  hero: { fontFamily: fonts.display, fontSize: 56, letterSpacing: 2 },
  title: { fontFamily: fonts.display, fontSize: 32, letterSpacing: 1 },
  subtitle: { fontFamily: fonts.bodyMedium, fontSize: 18, lineHeight: 26 },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22 },
  caption: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18 },
  label: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 1.5 },
  score: { fontFamily: fonts.display, fontSize: 40, letterSpacing: 1 },
} as const;
