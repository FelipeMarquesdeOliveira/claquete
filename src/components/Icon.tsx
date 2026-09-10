import type { ColorValue } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

export type IconName = 'calendar' | 'clock' | 'trophy' | 'claquete' | 'lock';

type Props = { name: IconName; color: ColorValue; size?: number };

/** Small line icons used inside the screens, drawn to match the CP4 mockups. */
export function Icon({ name, color, size = 16 }: Props) {
  const line = {
    stroke: color as string,
    strokeWidth: 2,
    fill: 'none' as const,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'calendar' && (
        <>
          <Rect x={3} y={5} width={18} height={16} rx={2} {...line} />
          <Path d="M8 3v4M16 3v4M3 10h18" {...line} />
        </>
      )}
      {name === 'clock' && (
        <>
          <Path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" {...line} />
          <Path d="M12 7v5l3 2" {...line} />
        </>
      )}
      {name === 'trophy' && (
        <>
          <Path d="M8 4h8v5a4 4 0 0 1-8 0z" {...line} />
          <Path d="M8 5H5v2a3 3 0 0 0 3 3M16 5h3v2a3 3 0 0 1-3 3" {...line} />
          <Path d="M10 20h4M12 13v7" {...line} />
        </>
      )}
      {name === 'claquete' && (
        <>
          <Rect x={3} y={4} width={18} height={16} rx={5} {...line} />
          <Path d="M3.4 13.8 20.6 10.2" {...line} />
        </>
      )}
      {name === 'lock' && (
        <>
          <Rect x={5} y={11} width={14} height={10} rx={2} {...line} />
          <Path d="M8 11V8a4 4 0 0 1 8 0v3" {...line} />
        </>
      )}
    </Svg>
  );
}
