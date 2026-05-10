import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { Colors } from '../../../constants/colors';
import { BorderRadius, Spacing, Shadows } from '../../../constants/theme';
import CircularResource from '../../../components/CircularResource';
import TaskCard from '../../../components/TaskCard';
import WarningBanner from '../../../components/WarningBanner';
import { Profile, Task, DailyAssessment } from '../../../lib/supabase';

export default function EmployeeHomeScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [latestAssessment, setLatestAssessment] = useState<DailyAssessment | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [totalStones, setTotalStones] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Profile
    const { data: prof } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (prof) setProfile(prof);

    // Latest assessment
    const { data: assess } = await supabase
      .from('daily_assessments')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(1)
      .single();
    if (assess) setLatestAssessment(assess);

    // Tasks
    const { data: taskList } = await supabase
      .from('tasks')
      .select('*')
      .eq('assigned_to', user.id)
      .order('created_at', { ascending: false })
      .limit(5);
    if (taskList) setTasks(taskList);

    // Total stones from all assessments
    const { data: assessments } = await supabase
      .from('daily_assessments')
      .select('stones_awarded')
      .eq('user_id', user.id);
    if (assessments) {
      setTotalStones(assessments.reduce((sum, a) => sum + (a.stones_awarded || 0), 0));
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const needsAssessment = !latestAssessment ||
    new Date(latestAssessment.date).toDateString() !== new Date().toDateString();

  const incompleteTasks = tasks.filter(t => t.status !== 'done');

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
      }
    >
      <View style={styles.content}>
        {/* Приветствие */}
        <Text style={styles.greeting}>
          Привет, {profile?.name || 'Пользователь'}!
        </Text>

        {/* Круговая диаграмма ресурса */}
        {latestAssessment ? (
          <View style={styles.resourceCard}>
            <CircularResource
              percent={latestAssessment.integral_pct}
              size={140}
              strokeWidth={14}
              label="Интегральный ресурс"
            />
            <View style={styles.resourceStats}>
              <View style={styles.resourceRow}>
                <View style={[styles.dot, { backgroundColor: Colors.highResource }]} />
                <Text style={styles.resourceLabel}>Энергия</Text>
                <Text style={styles.resourceValue}>{latestAssessment.energy_pct}%</Text>
              </View>
              <View style={styles.resourceRow}>
                <View style={[styles.dot, { backgroundColor: Colors.mediumResource }]} />
                <Text style={styles.resourceLabel}>Гибкость</Text>
                <Text style={styles.resourceValue}>{latestAssessment.flexibility_pct}%</Text>
              </View>
              <View style={styles.resourceRow}>
                <View style={[styles.dot, { backgroundColor: Colors.softAccent }]} />
                <Text style={styles.resourceLabel}>Стабильность</Text>
                <Text style={styles.resourceValue}>{latestAssessment.stability_pct}%</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.emptyAssessment}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyTitle}>Нет данных оценки</Text>
            <Text style={styles.emptyText}>Пройдите первую оценку своего ресурса</Text>
          </View>
        )}

        {/* Кнопка оценки */}
        {needsAssessment ? (
          <TouchableOpacity
            style={styles.assessmentButton}
            onPress={() => router.push('/(app)/assessment')}
            activeOpacity={0.8}
          >
            <Text style={styles.assessmentButtonText}>
              {latestAssessment ? '🔄 Пройти оценку сегодня' : '🚀 Пройти первую оценку'}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.assessmentDone}>
            <Text style={styles.assessmentDoneText}>
              ✅ Оценка на сегодня пройдена
            </Text>
          </View>
        )}

        {/* Камни силы */}
        <View style={styles.stonesCard}>
          <Text style={styles.stonesIcon}>💎</Text>
          <View>
            <Text style={styles.stonesCount}>{totalStones}</Text>
            <Text style={styles.stonesLabel}>Камней силы</Text>
          </View>
          {latestAssessment && (
            <View style={styles.stonesToday}>
              <Text style={styles.stonesTodayText}>
                +{latestAssessment.stones_awarded} сегодня
              </Text>
            </View>
          )}
        </View>

        {/* Уровень */}
        {profile && (
          <View style={styles.levelCard}>
            <Text style={styles.levelText}>
              Уровень {profile.level} • {profile.xp} XP
            </Text>
            <View style={styles.xpBar}>
              <View
                style={[
                  styles.xpFill,
                  {
                    width: `${((profile.xp % 100) / 100) * 100}%`,
                  },
                ]}
              />
            </View>
          </View>
        )}

        {/* Предупреждения */}
        {incompleteTasks.length > 3 && (
          <WarningBanner
            message={`У вас ${incompleteTasks.length} незавершённых задач`}
            type="warning"
          />
        )}

        {/* Список недавних задач */}
        {tasks.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Недавние задачи</Text>
              <TouchableOpacity onPress={() => router.push('/(app)/(tabs)/tasks')}>
                <Text style={styles.seeAll}>Все</Text>
              </TouchableOpacity>
            </View>
            {tasks.slice(0, 3).map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onPress={() => router.push(`/(app)/task/${task.id}`)}
              />
            ))}
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
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xl,
  },
  resourceCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xxl,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadows.card,
    marginBottom: Spacing.lg,
  },
  resourceStats: {
    flex: 1,
    marginLeft: Spacing.xl,
  },
  resourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Spacing.sm,
  },
  resourceLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  resourceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  emptyAssessment: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xxl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  assessmentButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.button,
  },
  assessmentButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  assessmentDone: {
    backgroundColor: Colors.highResource + '15',
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  assessmentDoneText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.highResource,
  },
  stonesCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadows.card,
    marginBottom: Spacing.md,
  },
  stonesIcon: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  stonesCount: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.warmAccent,
  },
  stonesLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  stonesToday: {
    marginLeft: 'auto',
    backgroundColor: Colors.softAccent + '30',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  stonesTodayText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.warmAccent,
  },
  levelCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  xpBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  section: {
    marginTop: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  seeAll: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
});
