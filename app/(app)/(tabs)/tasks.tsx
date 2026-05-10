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
import { BorderRadius, Spacing } from '../../../constants/theme';
import TaskCard from '../../../components/TaskCard';
import { Task } from '../../../lib/supabase';

type FilterStatus = 'all' | 'planned' | 'in_progress' | 'done';

const FILTER_LABELS: Record<FilterStatus, string> = {
  all: 'Все',
  planned: 'В плане',
  in_progress: 'В работе',
  done: 'Выполнено',
};

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    loadTasks();
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

  const loadTasks = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('assigned_to', user.id)
      .order('created_at', { ascending: false });
    if (data) setTasks(data);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };

  const filteredTasks = filter === 'all'
    ? tasks
    : tasks.filter(t => t.status === filter);

  const isBoss = profile?.role === 'boss';

  return (
    <View style={styles.container}>
      {/* Фильтры */}
      <View style={styles.filters}>
        {(['all', 'planned', 'in_progress', 'done'] as FilterStatus[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterButton, filter === f && styles.filterActive]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                styles.filterText,
                filter === f && styles.filterTextActive,
              ]}
            >
              {FILTER_LABELS[f]}
            </Text>
            {filter === f && (
              <View style={styles.filterIndicator} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Список задач */}
      <ScrollView
        style={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          {filteredTasks.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>Нет задач</Text>
              <Text style={styles.emptySubtext}>
                {filter === 'all'
                  ? 'Задач пока нет'
                  : `Нет задач со статусом "${FILTER_LABELS[filter].toLowerCase()}"`}
              </Text>
            </View>
          ) : (
            filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onPress={() => router.push(`/(app)/task/${task.id}`)}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Кнопка создания задачи (только для босса) */}
      {isBoss && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/(app)/create-task')}
          activeOpacity={0.8}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    position: 'relative',
  },
  filterActive: {},
  filterText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  filterIndicator: {
    position: 'absolute',
    bottom: -Spacing.sm,
    left: Spacing.md,
    right: Spacing.md,
    height: 3,
    backgroundColor: Colors.primary,
    borderRadius: 1.5,
  },
  list: {
    flex: 1,
  },
  content: {
    padding: Spacing.xl,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
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
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabText: {
    fontSize: 28,
    color: Colors.white,
    fontWeight: '300',
    marginTop: -2,
  },
});
