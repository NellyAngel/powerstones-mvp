import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing, Shadows } from '../../constants/theme';
import { Profile } from '../../lib/supabase';

type Complexity = 'low' | 'medium' | 'high';
type Priority = 'low' | 'medium' | 'high';

const COMPLEXITY_OPTIONS: { key: Complexity; label: string; stones: number }[] = [
  { key: 'low', label: 'Простая', stones: 5 },
  { key: 'medium', label: 'Средняя', stones: 15 },
  { key: 'high', label: 'Сложная', stones: 30 },
];

const PRIORITY_OPTIONS: { key: Priority; label: string }[] = [
  { key: 'low', label: 'Низкий' },
  { key: 'medium', label: 'Средний' },
  { key: 'high', label: 'Высокий' },
];

export default function CreateTaskScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [complexity, setComplexity] = useState<Complexity>('medium');
  const [priority, setPriority] = useState<Priority>('medium');
  const [stoneCost, setStoneCost] = useState('15');
  const [deadline, setDeadline] = useState('');
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(true);

  useEffect(() => {
    loadTeamMembers();
  }, []);

  useEffect(() => {
    // Auto-fill stone cost based on complexity
    const comp = COMPLEXITY_OPTIONS.find(c => c.key === complexity);
    if (comp) setStoneCost(String(comp.stones));
  }, [complexity]);

  const loadTeamMembers = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: teamData } = await supabase
      .from('team')
      .select('member_id')
      .eq('boss_id', user.id);

    if (teamData && teamData.length > 0) {
      const memberIds = teamData.map(t => t.member_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', memberIds);
      if (profiles) {
        setMembers(profiles);
        if (profiles.length > 0) setSelectedMember(profiles[0].id);
      }
    }
    setLoadingMembers(false);
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Ошибка', 'Введите название задачи');
      return;
    }
    if (!selectedMember) {
      Alert.alert('Ошибка', 'Выберите сотрудника');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Ошибка', 'Необходимо авторизоваться');
        return;
      }

      const cost = parseInt(stoneCost) || 0;

      const { error } = await supabase.from('tasks').insert({
        title: title.trim(),
        description: description.trim(),
        assigned_to: selectedMember,
        created_by: user.id,
        complexity,
        deadline: deadline || null,
        priority,
        stone_cost: cost,
        status: 'planned',
      });

      if (error) {
        Alert.alert('Ошибка', error.message);
        return;
      }

      Alert.alert('✅ Готово', 'Задача создана', [
        { text: 'Отлично', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert('Ошибка', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Создание задачи</Text>
        <Text style={styles.subtitle}>Назначьте задачу сотруднику</Text>
      </View>

      {/* Название */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Название задачи</Text>
        <TextInput
          style={styles.input}
          placeholder="Например: Разработать экран аналитики"
          placeholderTextColor={Colors.textLight}
          value={title}
          onChangeText={setTitle}
        />
      </View>

      {/* Описание */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Описание (необязательно)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Подробное описание задачи"
          placeholderTextColor={Colors.textLight}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Сотрудник */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Назначить</Text>
        {loadingMembers ? (
          <ActivityIndicator color={Colors.primary} />
        ) : members.length === 0 ? (
          <Text style={styles.emptyText}>
            Нет сотрудников в команде. Сначала добавьте их.
          </Text>
        ) : (
          <View style={styles.memberList}>
            {members.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={[
                  styles.memberOption,
                  selectedMember === m.id && styles.memberOptionActive,
                ]}
                onPress={() => setSelectedMember(m.id)}
              >
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberAvatarText}>
                    {m.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.memberName,
                    selectedMember === m.id && styles.memberNameActive,
                  ]}
                >
                  {m.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Сложность */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Сложность</Text>
        <View style={styles.optionRow}>
          {COMPLEXITY_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[
                styles.optionButton,
                complexity === opt.key && styles.optionActive,
                complexity === opt.key && {
                  borderColor:
                    opt.key === 'low'
                      ? Colors.highResource
                      : opt.key === 'medium'
                      ? Colors.mediumResource
                      : Colors.lowResource,
                  backgroundColor:
                    opt.key === 'low'
                      ? Colors.highResource + '15'
                      : opt.key === 'medium'
                      ? Colors.mediumResource + '15'
                      : Colors.lowResource + '15',
                },
              ]}
              onPress={() => setComplexity(opt.key)}
            >
              <Text
                style={[
                  styles.optionText,
                  complexity === opt.key && {
                    color:
                      opt.key === 'low'
                        ? Colors.highResource
                        : opt.key === 'medium'
                        ? Colors.mediumResource
                        : Colors.lowResource,
                  },
                ]}
              >
                {opt.label}
              </Text>
              <Text style={styles.stoneHint}>💎 {opt.stones}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Приоритет */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Приоритет</Text>
        <View style={styles.optionRow}>
          {PRIORITY_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[
                styles.optionButtonSmall,
                priority === opt.key && styles.optionActive,
              ]}
              onPress={() => setPriority(opt.key)}
            >
              <Text
                style={[
                  styles.optionTextSmall,
                  priority === opt.key && styles.optionTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Стоимость в камнях */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Стоимость (💎 камни силы)</Text>
        <TextInput
          style={styles.input}
          value={stoneCost}
          onChangeText={setStoneCost}
          keyboardType="numeric"
          placeholder="15"
          placeholderTextColor={Colors.textLight}
        />
      </View>

      {/* Дедлайн */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Дедлайн (ГГГГ-ММ-ДД, необязательно)</Text>
        <TextInput
          style={styles.input}
          placeholder="2026-05-20"
          placeholderTextColor={Colors.textLight}
          value={deadline}
          onChangeText={setDeadline}
          keyboardType={Platform.OS === 'web' ? 'default' : 'numbers-and-punctuation'}
        />
      </View>

      {/* Кнопка создания */}
      <TouchableOpacity
        style={[styles.createButton, loading && styles.buttonDisabled]}
        onPress={handleCreate}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <Text style={styles.createButtonText}>Создать задачу</Text>
        )}
      </TouchableOpacity>
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
    paddingBottom: 60,
  },
  header: {
    marginBottom: Spacing.xxl,
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
  },
  inputGroup: {
    marginBottom: Spacing.xl,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    fontSize: 16,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textLight,
    fontStyle: 'italic',
  },
  memberList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  memberOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  memberOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  memberAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  memberAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  memberNameActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  optionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  optionButton: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  optionActive: {
    borderWidth: 2,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  stoneHint: {
    fontSize: 12,
    color: Colors.warmAccent,
    marginTop: 4,
    fontWeight: '500',
  },
  optionButtonSmall: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  optionTextSmall: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  optionTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  createButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.lg,
    ...Shadows.button,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});
