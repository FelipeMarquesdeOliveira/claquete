import type { ImageSourcePropType } from 'react-native';

/**
 * Poster art for the mocked catalogue.
 *
 * The bundler needs a literal path in every `require`, so the mapping lives
 * here instead of inside the JSON. From CP6 the posters come from the TMDB API
 * and this file goes away.
 */
export const POSTERS: Record<string, ImageSourcePropType> = {
  'cidade-de-deus': require('../../../assets/mock/posters/poster-cidade-de-deus.jpg'),
  'ainda-estou-aqui': require('../../../assets/mock/posters/poster-ainda-estou-aqui.jpg'),
  'tropa-de-elite': require('../../../assets/mock/posters/poster-tropa-de-elite.jpg'),
  'central-do-brasil': require('../../../assets/mock/posters/poster-central-do-brasil.jpg'),
  'cidade-dos-homens': require('../../../assets/mock/posters/poster-cidade-dos-homens.jpg'),
  'cidade-baixa': require('../../../assets/mock/posters/poster-cidade-baixa.jpg'),
  bacurau: require('../../../assets/mock/posters/poster-bacurau.jpg'),
  'auto-da-compadecida': require('../../../assets/mock/posters/poster-auto-da-compadecida.jpg'),
  'que-horas-ela-volta': require('../../../assets/mock/posters/poster-que-horas-ela-volta.jpg'),
};
