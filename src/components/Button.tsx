import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Icon, type IconName } from './Icon';

import { colors, radius, typography } from '@/theme';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'ghost';
  disabled?: boolean;
  icon?: IconName;
  style?: ViewStyle;
};

export function Button({ label, onPress, variant = 'primary', disabled, icon, style }: Props) {
  const primary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.base,
        primary ? styles.primary : styles.ghost,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <View style={styles.content}>
        {icon && <Icon name={icon} color={primary ? colors.textInverse : colors.text} size={18} />}
        <Text style={[styles.label, primary ? styles.labelPrimary : styles.labelGhost]}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  content: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  primary: { backgroundColor: colors.primary },
  ghost: { borderWidth: 1, borderColor: colors.border },
  pressed: { opacity: 0.82 },
  disabled: { opacity: 0.4 },
  label: { ...typography.subtitle, fontSize: 15, fontWeight: '700' },
  labelPrimary: { color: colors.textInverse },
  labelGhost: { color: colors.text },
});
