import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { supabase } from '../../../lib/supabase';
import { Colors } from '../../../constants/colors';
import { BorderRadius, Spacing, Shadows } from '../../../constants/theme';
import AchievementBadge, { ACHIEVEMENT_DEFINITIONS } from '../../../components/AchievementBadge';
import { Profile, Achievement } from '../../../lib/supabase';

export default function AchievementsScreen() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: prof } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (prof) setProfile(prof);

    const { data } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', user.id);
    if (data) setAchievements(data);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const unlockedTypes = new Set(achievements.map(a => a.achievement_type));
  const unlockedCount = unlockedTypes.size;
  const totalCount = Object.keys(ACHIEVEMENT_DEFINITIONS).length;
  const progress = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        {/* Заголовок и прогресс */}
        <View style={styles.header}>
          <Text style={styles.title}>Достижения</Text>
          <View style={styles.progressCard}>
            <Text style={styles.progressCount}>
              {unlockedCount}
              <Text style={styles.progressTotal}>/{totalCount}</Text>
            </Text>
            <Text style={styles.progressLabel}>Открыто</Text>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${progress}%` }]}
              />
            </View>
          </View>
        </View>

        {/* Список достижений */}
        <View style={styles.grid}>
          {Object.entries(ACHIEVEMENT_DEFINITIONS).map(([type, def]) => (
            <AchievementBadge
              key={type}
              type={type}
              unlocked={unlockedTypes.has(type)}
            />
          ))}
        </View>

        {unlockedCount === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🏆</Text>
            <Text style={styles.emptyText}>
              Пока нет достижений. Проходите оценку и выполняйте задачи, чтобы открыть их!
            </Text>
          </View>
        )}
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
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  progressCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadows.card,
  },
  progressCount: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.primary,
  },
  progressTotal: {
    fontSize: 16,
    color: Colors.textLight,
    fontWeight: '400',
  },
  progressLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: Spacing.md,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  empty: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: Spacing.xxl,
  },
});
