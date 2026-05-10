import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { BorderRadius, Spacing, Shadows } from '../constants/theme';

// Список всех достижений с их описаниями
export const ACHIEVEMENT_DEFINITIONS: Record<string, { title: string; description: string; icon: string }> = {
  first_assessment: {
    title: 'Первый шаг',
    description: 'Пройдите первую оценку ресурса',
    icon: '🌟',
  },
  week_streak: {
    title: 'Недельная серия',
    description: 'Проходите оценку 7 дней подряд',
    icon: '🔥',
  },
  month_streak: {
    title: 'Месячная серия',
    description: 'Проходите оценку 30 дней подряд',
    icon: '💪',
  },
  high_resource: {
    title: 'На пике формы',
    description: 'Достигните 90%+ интегрального ресурса',
    icon: '⚡',
  },
  ten_tasks: {
    title: 'Трудоголик',
    description: 'Выполните 10 задач',
    icon: '✅',
  },
  fifty_tasks: {
    title: 'Мастер продуктивности',
    description: 'Выполните 50 задач',
    icon: '🏆',
  },
  team_player: {
    title: 'Игрок команды',
    description: 'Получите 100 камней силы',
    icon: '💎',
  },
  boss_first_task: {
    title: 'Лидер',
    description: 'Создайте первую задачу как руководитель',
    icon: '👑',
  },
};

interface AchievementBadgeProps {
  type: string;
  unlocked?: boolean;
  size?: 'small' | 'large';
}

export default function AchievementBadge({
  type,
  unlocked = true,
  size = 'large',
}: AchievementBadgeProps) {
  const def = ACHIEVEMENT_DEFINITIONS[type];

  if (!def) {
    return (
      <View style={[styles.container, !unlocked && styles.locked]}>
        <Text style={styles.icon}>❓</Text>
        <Text style={styles.title}>Неизвестно</Text>
      </View>
    );
  }

  if (size === 'small') {
    return (
      <View style={[styles.smallContainer, !unlocked && styles.lockedSmall]}>
        <Text style={styles.smallIcon}>{unlocked ? def.icon : '🔒'}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, !unlocked && styles.locked]}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{def.icon}</Text>
      </View>
      <Text style={[styles.title, !unlocked && styles.lockedText]}>
        {def.title}
      </Text>
      <Text style={[styles.description, !unlocked && styles.lockedText]}>
        {def.description}
      </Text>
      {!unlocked && (
        <View style={styles.lockOverlay}>
          <Text style={styles.lockIcon}>🔒</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    width: '47%',
    marginBottom: Spacing.md,
    ...Shadows.card,
    position: 'relative',
  },
  locked: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  icon: {
    fontSize: 28,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  description: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 15,
  },
  lockedText: {
    color: Colors.textLight,
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockIcon: {
    fontSize: 24,
  },
  // Small size
  smallContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedSmall: {
    opacity: 0.4,
  },
  smallIcon: {
    fontSize: 18,
  },
});
