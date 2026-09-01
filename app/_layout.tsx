import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View } from 'react-native';

import { colors } from '@/theme';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular,
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
  });

  // Avoids a flash of system fonts before the brand fonts are ready.
  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </SafeAreaProvider>
  );
}
