import type { ColorValue } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type TabName = 'clube' | 'estante' | 'placar' | 'perfil';

type Props = { name: TabName; color: ColorValue; size?: number };

/**
 * Navigation icons drawn by hand instead of pulled from an icon set.
 *
 * The club tab is the brand mark itself — the block opened by the diagonal cut
 * described in docs/markdown/02-marca.md — so the identity shows up in the
 * chrome of the app and not only on the splash.
 */
export function TabIcon({ name, color, size = 22 }: Props) {
  const stroke = { stroke: color as string, strokeWidth: 2, fill: 'none' as const };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'clube' && (
        <>
          <Rect x={3} y={4} width={18} height={16} rx={5} {...stroke} />
          <Path d="M3.4 13.8 20.6 10.2" {...stroke} strokeLinecap="round" />
        </>
      )}
      {name === 'estante' && (
        <>
          <Rect x={4} y={4} width={5} height={16} rx={1} {...stroke} />
          <Rect x={11} y={4} width={4} height={16} rx={1} {...stroke} />
          <Path d="M17 5.2 20.4 20" {...stroke} strokeLinecap="round" />
        </>
      )}
      {name === 'placar' && (
        <>
          <Path d="M8 4h8v5a4 4 0 0 1-8 0z" {...stroke} strokeLinejoin="round" />
          <Path d="M8 5H5v2a3 3 0 0 0 3 3M16 5h3v2a3 3 0 0 1-3 3" {...stroke} />
          <Path d="M10 20h4M12 13v7" {...stroke} strokeLinecap="round" />
        </>
      )}
      {name === 'perfil' && (
        <>
          <Circle cx={12} cy={8} r={4} {...stroke} />
          <Path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" {...stroke} strokeLinecap="round" />
        </>
      )}
    </Svg>
  );
}
