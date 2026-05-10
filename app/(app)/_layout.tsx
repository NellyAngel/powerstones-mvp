import { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

export default function AppLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/(auth)/login');
      } else {
        setIsAuthenticated(true);
      }
    };
    checkSession();
  }, []);

  if (isAuthenticated === null) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="assessment" />
      <Stack.Screen name="result" />
      <Stack.Screen name="task/[id]" />
      <Stack.Screen name="create-task" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
});
