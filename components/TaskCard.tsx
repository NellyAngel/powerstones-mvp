import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { BorderRadius, Spacing, Shadows } from '../constants/theme';
import { Task } from '../lib/supabase';

interface TaskCardProps {
  task: Task;
  onPress?: () => void;
}

const complexityColors: Record<string, string> = {
  low: Colors.highResource,
  medium: Colors.mediumResource,
  high: Colors.lowResource,
};

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

export default function TaskCard({ task, onPress }: TaskCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>
          {task.title}
        </Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusColors[task.status] + '20' },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: statusColors[task.status] },
            ]}
          >
            {statusLabels[task.status]}
          </Text>
        </View>
      </View>

      {task.description ? (
        <Text style={styles.description} numberOfLines={2}>
          {task.description}
        </Text>
      ) : null}

      <View style={styles.footer}>
        <View style={styles.tag}>
          <Text
            style={[styles.tagText, { color: complexityColors[task.complexity] }]}
          >
            {task.complexity === 'low'
              ? 'Простая'
              : task.complexity === 'medium'
              ? 'Средняя'
              : 'Сложная'}
          </Text>
        </View>

        {task.stone_cost > 0 && (
          <View style={styles.stoneBadge}>
            <Text style={styles.stoneText}>💎 {task.stone_cost}</Text>
          </View>
        )}

        {task.deadline && (
          <Text style={styles.deadline}>
            {new Date(task.deadline).toLocaleDateString('ru-RU')}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  tag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.cardBackground,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  stoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stoneText: {
    fontSize: 13,
    color: Colors.warmAccent,
    fontWeight: '600',
  },
  deadline: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 'auto',
  },
});
