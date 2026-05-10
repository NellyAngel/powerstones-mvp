import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { Colors } from '../../../constants/colors';
import { BorderRadius, Spacing, Shadows } from '../../../constants/theme';
import { Profile } from '../../../lib/supabase';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState({
    assessmentsCount: 0,
    tasksDone: 0,
    stonesTotal: 0,
    streakDays: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: prof } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (prof) setProfile(prof);

    // Количество оценок
    const { count: assessCount } = await supabase
      .from('daily_assessments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Выполненные задачи
    const { count: doneCount } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_to', user.id)
      .eq('status', 'done');

    // Камни
    const { data: assessments } = await supabase
      .from('daily_assessments')
      .select('stones_awarded')
      .eq('user_id', user.id);

    const totalStones = assessments
      ? assessments.reduce((sum, a) => sum + (a.stones_awarded || 0), 0)
      : 0;

    setStats({
      assessmentsCount: assessCount || 0,
      tasksDone: doneCount || 0,
      stonesTotal: totalStones,
      streakDays: 0, // Simplified
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert('Выход', 'Вы уверены?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Выйти',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const roleLabel = profile?.role === 'boss' ? 'Руководитель' : 'Сотрудник';

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        {/* Профиль */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile?.name?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </View>
          <Text style={styles.name}>{profile?.name || 'Пользователь'}</Text>
          <Text style={styles.email}>{profile?.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{roleLabel}</Text>
          </View>
        </View>

        {/* Уровень */}
        {profile && (
          <View style={styles.levelCard}>
            <View style={styles.levelHeader}>
              <Text style={styles.levelTitle}>Уровень {profile.level}</Text>
              <Text style={styles.xpText}>{profile.xp} XP</Text>
            </View>
            <View style={styles.xpBarContainer}>
              <View
                style={[
                  styles.xpBarFill,
                  {
                    width: `${((profile.xp % 100) / 100) * 100}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.xpNext}>
              {100 - (profile.xp % 100)} XP до следующего уровня
            </Text>
          </View>
        )}

        {/* Статистика */}
        <Text style={styles.sectionTitle}>Статистика</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📊</Text>
            <Text style={styles.statValue}>{stats.assessmentsCount}</Text>
            <Text style={styles.statLabel}>Оценок</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>✅</Text>
            <Text style={styles.statValue}>{stats.tasksDone}</Text>
            <Text style={styles.statLabel}>Задач выполнено</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>💎</Text>
            <Text style={styles.statValue}>{stats.stonesTotal}</Text>
            <Text style={styles.statLabel}>Камней всего</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={styles.statValue}>{stats.streakDays}</Text>
            <Text style={styles.statLabel}>Дней подряд</Text>
          </View>
        </View>

        {/* Достижения */}
        <View style={styles.achievementLink}>
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => router.push('/(app)/(tabs)/achievements')}
          >
            <Text style={styles.linkIcon}>🏆</Text>
            <Text style={styles.linkText}>Мои достижения</Text>
            <Text style={styles.linkArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Выход */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪 Выйти из аккаунта</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.xl,
  },
  profileCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xxl,
    alignItems: 'center',
    ...Shadows.card,
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.white,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  roleBadge: {
    backgroundColor: Colors.secondary + '20',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  roleText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.secondary,
  },
  levelCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.xxl,
    ...Shadows.card,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  xpText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  xpBarContainer: {
    height: 10,
    backgroundColor: Colors.border,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 5,
  },
  xpNext: {
    fontSize: 12,
    color: Colors.textLight,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadows.card,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  achievementLink: {
    marginBottom: Spacing.xxl,
  },
  linkButton: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadows.card,
  },
  linkIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  linkText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
    flex: 1,
  },
  linkArrow: {
    fontSize: 18,
    color: Colors.textLight,
  },
  logoutButton: {
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: 40,
  },
  logoutText: {
    fontSize: 15,
    color: Colors.lowResource,
    fontWeight: '500',
  },
});
