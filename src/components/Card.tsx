import { StyleSheet, View, type ViewProps } from 'react-native';

import { colors, radius, spacing } from '@/theme';

type Props = ViewProps & {
  /** Dashed outline, for what comes next rather than what is happening now. */
  outlined?: boolean;
};

export function Card({ outlined, style, ...rest }: Props) {
  return <View style={[styles.card, outlined && styles.outlined, style]} {...rest} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  outlined: { backgroundColor: 'transparent', borderStyle: 'dashed' },
});
