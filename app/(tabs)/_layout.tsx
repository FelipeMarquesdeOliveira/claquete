import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';

import { TabIcon, type TabName } from '@/components';
import { colors, fonts } from '@/theme';

const TABS: { name: string; title: string; icon: TabName }[] = [
  { name: 'clube', title: 'Clube', icon: 'clube' },
  { name: 'estante', title: 'Estante', icon: 'estante' },
  { name: 'placar', title: 'Placar', icon: 'placar' },
  { name: 'perfil', title: 'Perfil', icon: 'perfil' },
];

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.bar,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.label,
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color }) => <TabIcon name={tab.icon} color={color} />,
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: '#14141A',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: 76,
    paddingTop: 10,
  },
  label: { fontFamily: fonts.body, fontSize: 10, marginTop: 2 },
});
