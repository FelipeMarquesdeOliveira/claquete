import { Image, StyleSheet, View } from 'react-native';

import { POSTERS } from '@/data/mock/posters';
import { colors, radius } from '@/theme';

type Props = { movieId?: string | null; posterUrl?: string | null; width: number };

/**
 * Movie poster in the 2:3 ratio the catalogue uses.
 *
 * Duas origens convivem: a arte dos nove filmes do CP4 está no repositório, e a
 * dos filmes buscados no TMDB vem por URL. A URL tem preferência porque é o que
 * acompanha um filme escolhido agora.
 */
export function Poster({ movieId, posterUrl, width }: Props) {
  const height = Math.round((width * 3) / 2);
  const source = posterUrl ? { uri: posterUrl } : movieId ? POSTERS[movieId] : undefined;

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
