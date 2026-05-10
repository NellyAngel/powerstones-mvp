import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { BorderRadius, Spacing, Shadows } from '../constants/theme';
import ResourceBar from './ResourceBar';

interface TeamMemberCardProps {
  name: string;
  email: string;
  resourcePercent: number;
  tasksCount: number;
  tasksDone: number;
  isOverloaded?: boolean;
}

export default function TeamMemberCard({
  name,
  email,
  resourcePercent,
  tasksCount,
  tasksDone,
  isOverloaded = false,
}: TeamMemberCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.email}>{email}</Text>
        </View>
        {isOverloaded && (
          <View style={styles.warningBadge}>
            <Text style={styles.warningText}>⚠️</Text>
          </View>
        )}
      </View>

      <View style={styles.resourceSection}>
        <Text style={styles.resourceLabel}>
          Ресурс: {resourcePercent}%
        </Text>
        <ResourceBar percent={resourcePercent} />
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{tasksCount}</Text>
          <Text style={styles.statLabel}>Задач</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{tasksDone}</Text>
          <Text style={styles.statLabel}>Выполнено</Text>
        </View>
        <View style={styles.stat}>
          <Text
            style={[
              styles.statValue,
              {
                color:
                  tasksCount > 0
                    ? (tasksDone / tasksCount) * 100 >= 70
                      ? Colors.highResource
                      : Colors.mediumResource
                    : Colors.textSecondary,
              },
            ]}
          >
            {tasksCount > 0
              ? Math.round((tasksDone / tasksCount) * 100)
              : 0}
            %
          </Text>
          <Text style={styles.statLabel}>Готово</Text>
        </View>
      </View>
    </View>
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
  headerInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  email: {
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
  warningText: {
    fontSize: 16,
  },
  resourceSection: {
    marginBottom: Spacing.md,
  },
  resourceLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
  },
  stat: {
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
});
