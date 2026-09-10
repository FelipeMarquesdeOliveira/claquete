import { StyleSheet, Text, View } from 'react-native';

import { useClubStore } from '@/store/useClubStore';
import { colors, radius, spacing, typography } from '@/theme';

/**
 * Mostra a última falha de escrita, quando existe.
 *
 * Enquanto os dados eram um JSON em memória nada podia dar errado. Com o banco
 * do outro lado da rede pode — e uma falha silenciosa é pior do que uma falha:
 * a tela recarrega igual e a pessoa acha que salvou. Este aviso existe para que
 * isso apareça, tanto na apresentação quanto no uso.
 */
export function Aviso() {
  const error = useClubStore((state) => state.error);
  if (!error) return null;

  return (
    <View style={styles.aviso} accessibilityRole="alert">
      <Text style={styles.texto}>{error}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  aviso: {
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderColor: colors.danger,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  texto: { ...typography.caption, color: colors.text },
});
