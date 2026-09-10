import { Image, StyleSheet, View } from 'react-native';

import { POSTERS } from '@/data/mock/posters';
import { colors, radius } from '@/theme';

type Props = { movieId?: string | null; width: number };

/** Movie poster in the 2:3 ratio the catalogue uses. */
export function Poster({ movieId, width }: Props) {
  const height = Math.round((width * 3) / 2);
  const source = movieId ? POSTERS[movieId] : undefined;

  if (!source) return <View style={[styles.empty, { width, height }]} />;
  return <Image source={source} style={[styles.poster, { width, height }]} />;
}

const styles = StyleSheet.create({
  poster: { borderRadius: radius.sm, resizeMode: 'cover' },
  empty: {
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
