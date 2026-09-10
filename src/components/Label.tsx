import { StyleSheet, Text, type TextProps } from 'react-native';

import { colors, typography } from '@/theme';

/** Small uppercase caption used above blocks of content. */
export function Label({ style, ...rest }: TextProps) {
  return <Text style={[styles.label, style]} {...rest} />;
}

const styles = StyleSheet.create({
  label: { ...typography.label, color: colors.textMuted, textTransform: 'uppercase' },
});
