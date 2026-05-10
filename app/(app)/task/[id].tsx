import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { Colors } from '../../../constants/colors';
import { BorderRadius, Spacing, Shadows } from '../../../constants/theme';
import { Task, Profile } from '../../../lib/supabase';
import WarningBanner from '../../../components/WarningBanner';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [assignedProfile, setAssignedProfile] = useState<Profile | null>(null);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    if (id) loadTask();
  }, [id]);

  const loadTask = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: prof } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (prof) setCurrentProfile(prof);

    const { data: taskData } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();
    if (taskData) {
      setTask(taskData);

      const { data: assignProf } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', taskData.assigned_to)
        .single();
      if (assignProf) setAssignedProfile(assignProf);
    }
    setLoading(false);
  };

  const updateStatus = async (newStatus: 'planned' | 'in_progress' | 'done') => {
    if (!task) return;

    setStatusUpdating(true);
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', task.id);

      if (error) {
        Alert.alert('Ошибка', error.message);
        return;
      }

      setTask({ ...task, status: newStatus });

      if (newStatus === 'done') {
        Alert.alert(
          '🎉 Поздравляем!',
          `Задача "${task.title}" выполнена!\n💎 Стоимость: ${task.stone_cost} камней\n⭐ Опыт: +${getTaskXp(task.complexity)} XP`,
          [{ text: 'Отлично!' }]
        );
      }
    } catch (e: any) {
      Alert.alert('Ошибка', e.message);
    } finally {
      setStatusUpdating(false);
    }
  };

  const deleteTask = async () => {
    if (!task) return;
    Alert.alert(
      'Удалить задачу',
      'Вы уверены?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase
              .from('tasks')
              .delete()
              .eq('id', task.id);
            if (!error) router.back();
            else Alert.alert('Ошибка', error.message);
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Задача не найдена</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Назад</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isBoss = currentProfile?.role === 'boss';
  const isAssigned = currentProfile?.id === task.assigned_to;

  const statusLabels: Record<string, string> = {
    planned: 'Запланирована',
    in_progress: 'В работе',
    done: 'Выполнена',
  };

  const statusColors: Record<string, string> = {
    planned: Colors.planned,
    in_progress: Colors.inProgress,
    done: Colors.done,
  };

  const complexityLabels: Record<string, string> = {
    low: 'Простая',
    medium: 'Средняя',
    high: 'Сложная',
  };

  const priorityLabels: Record<string, string> = {
    low: 'Низкий',
    medium: 'Средний',
    high: 'Высокий',
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Заголовок */}
        <View style={styles.header}>
          <Text style={styles.title}>{task.title}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusColors[task.status] + '20' },
            ]}
          >
            <Text
              style={[styles.statusText, { color: statusColors[task.status] }]}
            >
              {statusLabels[task.status]}
            </Text>
          </View>
        </View>

        {/* Описание */}
        {task.description ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Описание</Text>
            <Text style={styles.description}>{task.description}</Text>
          </View>
        ) : null}

        {/* Детали */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Сложность</Text>
            <Text style={styles.detailValue}>
              {complexityLabels[task.complexity]}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Приоритет</Text>
            <Text style={styles.detailValue}>
              {priorityLabels[task.priority]}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Стоимость</Text>
            <Text style={[styles.detailValue, { color: Colors.warmAccent }]}>
              💎 {task.stone_cost}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Дедлайн</Text>
            <Text style={styles.detailValue}>
              {task.deadline
                ? new Date(task.deadline).toLocaleDateString('ru-RU')
                : 'Не указан'}
            </Text>
          </View>
        </View>

        {/* Кому назначена */}
        {assignedProfile && (
          <View style={styles.assignedSection}>
            <Text style={styles.assignedLabel}>
              {isBoss ? 'Назначена' : 'Моя задача'}
            </Text>
            {!isAssigned && (
              <View style={styles.assignedRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {assignedProfile.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.assignedName}>
                  {assignedProfile.name}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Действия */}
        <View style={styles.actions}>
          {isAssigned && task.status !== 'done' && (
            <>
              {task.status === 'planned' && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: Colors.inProgress }]}
                  onPress={() => updateStatus('in_progress')}
                  disabled={statusUpdating}
                >
                  {statusUpdating ? (
                    <ActivityIndicator color={Colors.white} />
                  ) : (
                    <Text style={styles.actionButtonText}>
                      🚀 Начать выполнение
                    </Text>
                  )}
                </TouchableOpacity>
              )}
              {task.status === 'in_progress' && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: Colors.highResource }]}
                  onPress={() => updateStatus('done')}
                  disabled={statusUpdating}
                >
                  {statusUpdating ? (
                    <ActivityIndicator color={Colors.white} />
                  ) : (
                    <Text style={styles.actionButtonText}>
                      ✅ Отметить выполненной
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </>
          )}

          {isBoss && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: Colors.lowResource }]}
              onPress={deleteTask}
            >
              <Text style={styles.actionButtonText}>
                🗑️ Удалить задачу
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

function getTaskXp(complexity: string): number {
  switch (complexity) {
    case 'low': return 10;
    case 'medium': return 25;
    case 'high': return 50;
    default: return 10;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: Spacing.xl,
    paddingBottom: 40,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  backLink: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xxl,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.md,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  detailItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    ...Shadows.card,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  assignedSection: {
    marginBottom: Spacing.xxl,
  },
  assignedLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  assignedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  assignedName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  actions: {
    gap: Spacing.md,
  },
  actionButton: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
    ...Shadows.button,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});
