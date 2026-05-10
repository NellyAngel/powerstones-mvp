import React, { useEffect, useState } from 'react';
import { Tabs, router } from 'expo-router';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { supabase } from '../../../lib/supabase';
import { Colors } from '../../../constants/colors';
import { Profile } from '../../../lib/supabase';

export default function TabLayout() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (data) setProfile(data);
    }
  };

  const isBoss = profile?.role === 'boss';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  };

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: Colors.border,
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
          color: Colors.textPrimary,
        },
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopColor: Colors.border,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        headerRight: () => (
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>🚪</Text>
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Главная',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size - 4 }}>🏠</Text>
          ),
        }}
        listeners={{
          tabPress: (e) => {
            if (isBoss) {
              // Boss sees different home, prevent default if needed
            }
          },
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Задачи',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size - 4 }}>📋</Text>
          ),
        }}
      />
      {isBoss && (
        <Tabs.Screen
          name="team"
          options={{
            title: 'Команда',
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: size - 4 }}>👥</Text>
            ),
          }}
        />
      )}
      {isBoss && (
        <Tabs.Screen
          name="analytics"
          options={{
            title: 'Аналитика',
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: size - 4 }}>📊</Text>
            ),
          }}
        />
      )}
      <Tabs.Screen
        name="achievements"
        options={{
          title: 'Достижения',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size - 4 }}>🏆</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Профиль',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size - 4 }}>👤</Text>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    marginRight: 16,
    padding: 4,
  },
  logoutText: {
    fontSize: 20,
  },
});
