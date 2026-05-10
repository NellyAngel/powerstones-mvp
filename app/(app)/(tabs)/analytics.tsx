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
import WarningBanner from '../../../components/WarningBanner';
import { Profile, DailyAssessment, Task } from '../../../lib/supabase';

interface MemberAnalytics {
  profile: Profile;
  tasks: Task[];
  latestAssessment?: DailyAssessment;
}

export default function AnalyticsScreen() {
  const [members, setMembers] = useState<MemberAnalytics[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: teamData } = await supabase
      .from('team')
      .select('member_id')
      .eq('boss_id', user.id);

    if (!teamData || teamData.length === 0) return;

    const analytics: MemberAnalytics[] = [];

    for (const tm of teamData) {
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', tm.member_id)
        .single();
      if (!prof) continue;

      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('assigned_to', tm.member_id);

      const { data: assess } = await supabase
        .from('daily_assessments')
        .select('*')
        .eq('user_id', tm.member_id)
        .order('date', { ascending: false })
        .limit(1)
        .single();

      analytics.push({
        profile: prof,
        tasks: tasks || [],
        latestAssessment: assess || undefined,
      });
    }

    setMembers(analytics);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  // Вычисления
  const totalTasks = members.reduce((sum, m) => sum + m.tasks.length, 0);
  const doneTasks = members.reduce(
    (sum, m) => sum + m.tasks.filter(t => t.status === 'done').length,
    0
  );
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const inProgressTasks = members.reduce(
    (sum, m) => sum + m.tasks.filter(t => t.status === 'in_progress').length,
    0
  );

  const overloadedMembers = members.filter(m => {
    const inProgress = m.tasks.filter(t => t.status !== 'done').length;
    return inProgress > 3 && m.latestAssessment && m.latestAssessment.integral_pct < 40;
  });

  const avgResource = members.reduce((sum, m) => {
    if (!m.latestAssessment) return sum;
    return sum + m.latestAssessment.integral_pct;
  }, 0) / (members.filter(m => m.latestAssessment).length || 1);

  const memberTasks = members.map(m => ({
    name: m.profile.name,
    total: m.tasks.length,
    done: m.tasks.filter(t => t.status === 'done').length,
    resource: m.latestAssessment?.integral_pct || 0,
  }));

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        <Text style={styles.title}>Аналитика команды</Text>
        <Text style={styles.subtitle}>
          {members.length} {members.length === 1 ? 'сотрудник' : 'сотрудников'}
        </Text>

        {overloadedMembers.length > 0 && (
          <WarningBanner
            message={`${overloadedMembers.length} ${overloadedMembers.length === 1 ? 'сотрудник' : 'сотрудника'} перегружен(ы)`}
            type="danger"
          />
        )}

        {/* Основные метрики */}
        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, { backgroundColor: Colors.highResource + '10' }]}>
            <Text style={[styles.metricValue, { color: Colors.highResource }]}>
              {avgResource.toFixed(0)}%
            </Text>
            <Text style={styles.metricLabel}>Средний ресурс</Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: Colors.inProgress + '10' }]}>
            <Text style={[styles.metricValue, { color: Colors.inProgress }]}>
              {completionRate}%
            </Text>
            <Text style={styles.metricLabel}>Выполнено задач</Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: Colors.warmAccent + '15' }]}>
            <Text style={[styles.metricValue, { color: Colors.warmAccent }]}>
              {inProgressTasks}
            </Text>
            <Text style={styles.metricLabel}>В работе</Text>
          </View>
        </View>

        {/* Детальная статистика по сотрудникам */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Загрузка сотрудников</Text>

          {memberTasks.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Нет данных</Text>
            </View>
          ) : (
            memberTasks.map((m, i) => (
              <View key={i} style={styles.memberRow}>
                <View style={styles.memberNameBox}>
                  <Text style={styles.memberRowName}>{m.name}</Text>
                </View>

                <View style={styles.memberBarInfo}>
                  <View style={styles.memberBarBg}>
                    <View
                      style={[
                        styles.memberBarFill,
                        {
                          width: `${m.total > 0 ? (m.done / m.total) * 100 : 0}%`,
                          backgroundColor:
                            m.resource < 40 ? Colors.lowResource : Colors.highResource,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.memberBarLabel}>
                    {m.done}/{m.total}
                  </Text>
                </View>

                <View style={styles.resourceIndicator}>
                  <View
                    style={[
                      styles.resourceDot,
                      {
                        backgroundColor:
                          m.resource < 40
                            ? Colors.lowResource
                            : m.resource < 70
                            ? Colors.mediumResource
                            : Colors.highResource,
                      },
                    ]}
                  />
                  <Text style={styles.resourcePct}>{m.resource}%</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Сложность задач */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>По сложности</Text>
          <View style={styles.complexityRow}>
            {(['low', 'medium', 'high'] as const).map((c) => {
              const count = members.reduce(
                (sum, m) => sum + m.tasks.filter(t => t.complexity === c).length,
                0
              );
              const labels = { low: 'Простые', medium: 'Средние', high: 'Сложные' };
              const colors = { low: Colors.highResource, medium: Colors.mediumResource, high: Colors.lowResource };
              return (
                <View key={c} style={styles.complexityCard}>
                  <Text style={[styles.complexityCount, { color: colors[c] }]}>
                    {count}
                  </Text>
                  <Text style={styles.complexityLabel}>{labels[c]}</Text>
                </View>
              );
            })}
          </View>
        </View>
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
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  metricCard: {
    flex: 1,
    minWidth: '30%',
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadows.card,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  metricLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  empty: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    ...Shadows.card,
  },
  memberNameBox: {
    width: 80,
  },
  memberRowName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  memberBarInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.sm,
  },
  memberBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: Spacing.sm,
  },
  memberBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  memberBarLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    width: 36,
    textAlign: 'right',
  },
  resourceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 60,
    justifyContent: 'flex-end',
  },
  resourceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  resourcePct: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  complexityRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  complexityCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadows.card,
  },
  complexityCount: {
    fontSize: 24,
    fontWeight: '700',
  },
  complexityLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});
