import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { Colors } from '../../../constants/colors';
import { BorderRadius, Spacing, Shadows } from '../../../constants/theme';
import { Profile, DailyAssessment } from '../../../lib/supabase';

interface MemberWithData {
  profile: Profile;
  latestAssessment?: DailyAssessment;
  tasksCount: number;
  tasksDone: number;
}

export default function TeamScreen() {
  const [members, setMembers] = useState<MemberWithData[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [bossProfile, setBossProfile] = useState<Profile | null>(null);

  useEffect(() => {
    loadTeam();
    loadBossProfile();
  }, []);

  const loadBossProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (data) setBossProfile(data);
    }
  };

  const loadTeam = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Получаем членов команды
    const { data: teamData } = await supabase
      .from('team')
      .select('member_id')
      .eq('boss_id', user.id);

    if (!teamData || teamData.length === 0) {
      setMembers([]);
      return;
    }

    const membersList: MemberWithData[] = [];

    for (const tm of teamData) {
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', tm.member_id)
        .single();

      if (!prof) continue;

      const { data: assess } = await supabase
        .from('daily_assessments')
        .select('*')
        .eq('user_id', tm.member_id)
        .order('date', { ascending: false })
        .limit(1)
        .single();

      const { data: tasks, count: tasksCount } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_to', tm.member_id);

      const { data: tasksDone, count: tasksDoneCount } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_to', tm.member_id)
        .eq('status', 'done');

      membersList.push({
        profile: prof,
        latestAssessment: assess || undefined,
        tasksCount: tasksCount || 0,
        tasksDone: tasksDoneCount || 0,
      });
    }

    setMembers(membersList);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTeam();
    setRefreshing(false);
  };

  const isOverloaded = (member: MemberWithData) => {
    return member.tasksCount > 5 && (
      !member.latestAssessment ||
      member.latestAssessment.integral_pct < 40
    );
  };

  const resourceText = (member: MemberWithData) => {
    if (!member.latestAssessment) return 'Нет данных';
    return `${member.latestAssessment.integral_pct}%`;
  };

  const resourceColor = (member: MemberWithData) => {
    if (!member.latestAssessment) return Colors.textLight;
    if (member.latestAssessment.integral_pct < 40) return Colors.lowResource;
    if (member.latestAssessment.integral_pct < 70) return Colors.mediumResource;
    return Colors.highResource;
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        <Text style={styles.title}>Моя команда</Text>
        <Text style={styles.subtitle}>
          {members.length} {members.length === 1 ? 'сотрудник' : 'сотрудников'}
        </Text>

        {members.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyText}>В команде пока никого нет</Text>
            <Text style={styles.emptySubtext}>
              Сотрудники присоединятся после регистрации
            </Text>
          </View>
        ) : (
          members.map((member) => (
            <View key={member.profile.id} style={styles.memberCard}>
              <View style={styles.memberHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {member.profile.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.profile.name}</Text>
                  <Text style={styles.memberEmail}>{member.profile.email}</Text>
                </View>
                {isOverloaded(member) && (
                  <View style={styles.warningBadge}>
                    <Text style={styles.warningIcon}>⚠️</Text>
                  </View>
                )}
              </View>

              <View style={styles.memberStats}>
                <View style={styles.statBox}>
                  <Text
                    style={[styles.statValue, { color: resourceColor(member) }]}
                  >
                    {resourceText(member)}
                  </Text>
                  <Text style={styles.statLabel}>Ресурс</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{member.tasksCount}</Text>
                  <Text style={styles.statLabel}>Задачи</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>
                    {member.tasksCount > 0
                      ? Math.round((member.tasksDone / member.tasksCount) * 100)
                      : 0}
                    %
                  </Text>
                  <Text style={styles.statLabel}>Готово</Text>
                </View>
              </View>

              {isOverloaded(member) && (
                <View style={styles.alertBanner}>
                  <Text style={styles.alertText}>
                    ⚠️ Перегружен — низкий ресурс и много задач
                  </Text>
                </View>
              )}
            </View>
          ))
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
  empty: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  memberCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  memberInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  memberEmail: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  warningBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.lowResource + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningIcon: {
    fontSize: 16,
  },
  memberStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 2,
  },
  alertBanner: {
    marginTop: Spacing.md,
    backgroundColor: Colors.lowResource + '10',
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
  },
  alertText: {
    fontSize: 12,
    color: Colors.lowResource,
    fontWeight: '500',
  },
});
