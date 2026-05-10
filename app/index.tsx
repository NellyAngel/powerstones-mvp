import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';
import { Colors } from '../constants/colors';

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(async () => {
      // Проверяем сессию пользователя
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        router.replace('/(app)/(tabs)/home');
      } else {
        router.replace('/(auth)/login');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        {/* Круговой элемент-логотип */}
        <View style={styles.circle}>
          <Text style={styles.circleText}>💎</Text>
        </View>
        <Text style={styles.title}>Камни Силы</Text>
        <Text style={styles.subtitle}>PowerStones</Text>
      </View>
      <Text style={styles.tagline}>Управляй своей энергией</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  circleText: {
    fontSize: 60,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  tagline: {
    position: 'absolute',
    bottom: 60,
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 2,
  },
});
