import { StyleSheet, Text, View } from 'react-native';

import type { Member } from '@/domain';
import { colors } from '@/theme';

type Props = {
  member: Member;
  size?: number;
  /** Draws a ring in the club background, so overlapping avatars stay legible. */
  ringed?: boolean;
};

export function Avatar({ member, size = 28, ringed = false }: Props) {
  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: member.color },
        ringed && styles.ring,
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.4 }]}>{member.initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { alignItems: 'center', justifyContent: 'center' },
  ring: { borderWidth: 2, borderColor: colors.background },
  initials: { color: colors.text, fontWeight: '700' },
});
