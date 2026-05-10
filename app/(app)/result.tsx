import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing, Shadows } from '../../constants/theme';
import CircularResource from '../../components/CircularResource';
import ResourceBar from '../../components/ResourceBar';
import { AssessmentResult } from '../../lib/calculations';

export default function ResultScreen() {
  const params = useLocalSearchParams<{ result: string }>();
  let result: AssessmentResult | null = null;

  try {
    if (params.result) {
      result = JSON.parse(params.result);
    }
  } catch {
    // ignore
  }

  if (!result) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.errorText}>Нет данных результата</Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/(app)/assessment')}
          >
            <Text style={styles.primaryButtonText}>Пройти оценку</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'low': return 'Низкий';
      case 'medium': return 'Средний';
      case 'high': return 'Высокий';
      default: return level;
    }
  };

  const getRecommendationColor = (level: string) => {
    switch (level) {
      case 'low': return Colors.lowResource;
      case 'medium': return Colors.mediumResource;
      case 'high': return Colors.highResource;
      default: return Colors.textSecondary;
    }
  };

  const formatDate = () => {
    const now = new Date();
    return now.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const resourceBarColor = (pct: number) => {
    if (pct < 40) return Colors.lowResource;
    if (pct < 70) return Colors.mediumResource;
    return Colors.highResource;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Заголовок */}
        <View style={styles.header}>
          <Text style={styles.title}>Результаты латерометрии</Text>
          <Text style={styles.timestamp}>
            🕒 {formatTime()}, {formatDate()}
          </Text>
        </View>

        {/* Интегральный показатель */}
        <View style={styles.integralCard}>
          <CircularResource
            percent={result.integral_pct}
            size={130}
            strokeWidth={12}
            label="Интегральный"
          />
        </View>

        {/* Энергия */}
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricTitle}>
              ЭНЕРГИЯ (dT_max)
            </Text>
            <View
              style={[
                styles.levelBadge,
                { backgroundColor: resourceBarColor(result.energy_pct) + '20' },
              ]}
            >
              <Text
                style={[
                  styles.levelBadgeText,
                  { color: resourceBarColor(result.energy_pct) },
                ]}
              >
                {getLevelLabel(result.energy_level)}
              </Text>
            </View>
          </View>
          <ResourceBar
            percent={result.energy_pct}
            color={resourceBarColor(result.energy_pct)}
            height={12}
          />
          <Text
            style={[
              styles.percentValue,
              { color: resourceBarColor(result.energy_pct) },
            ]}
          >
            {result.energy_pct}%
          </Text>
        </View>

        {/* Гибкость */}
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricTitle}>
              ГИБКОСТЬ (dT_min)
            </Text>
            <View
              style={[
                styles.levelBadge,
                { backgroundColor: resourceBarColor(result.flexibility_pct) + '20' },
              ]}
            >
              <Text
                style={[
                  styles.levelBadgeText,
                  { color: resourceBarColor(result.flexibility_pct) },
                ]}
              >
                {getLevelLabel(result.flexibility_level)}
              </Text>
            </View>
          </View>
          <ResourceBar
            percent={result.flexibility_pct}
            color={resourceBarColor(result.flexibility_pct)}
            height={12}
          />
          <Text
            style={[
              styles.percentValue,
              { color: resourceBarColor(result.flexibility_pct) },
            ]}
          >
            {result.flexibility_pct}%
          </Text>
        </View>

        {/* Стабильность */}
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricTitle}>
              СТАБИЛЬНОСТЬ (dT_rash)
            </Text>
            <View
              style={[
                styles.levelBadge,
                { backgroundColor: resourceBarColor(result.stability_pct) + '20' },
              ]}
            >
              <Text
                style={[
                  styles.levelBadgeText,
                  { color: resourceBarColor(result.stability_pct) },
                ]}
              >
                {getLevelLabel(result.stability_level)}
              </Text>
            </View>
          </View>
          <ResourceBar
            percent={result.stability_pct}
            color={resourceBarColor(result.stability_pct)}
            height={12}
          />
          <Text
            style={[
              styles.percentValue,
              { color: resourceBarColor(result.stability_pct) },
            ]}
          >
            {result.stability_pct}%
          </Text>
        </View>

        {/* Разделитель */}
        <View style={styles.divider} />

        {/* Камни силы */}
        <View style={styles.stonesCard}>
          <Text style={styles.stonesIcon}>💎</Text>
          <View>
            <Text style={styles.stonesLabel}>Получено камней силы</Text>
            <Text style={styles.stonesValue}>+{result.stones_awarded}</Text>
          </View>
        </View>

        {/* Рекомендация */}
        <View style={styles.recommendationCard}>
          <Text style={styles.recommendationTitle}>
            💡 Рекомендация на день
          </Text>
          <Text style={styles.recommendationText}>
            {result.recommendation}
          </Text>
        </View>

        {/* Кнопки */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/(app)/(tabs)/home')}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>
              📋 К задачам
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/(app)/assessment')}
          >
            <Text style={styles.secondaryButtonText}>
              🔄 Повторить тест
            </Text>
          </TouchableOpacity>
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
    paddingBottom: 40,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 60,
    marginBottom: Spacing.xl,
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
  timestamp: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  integralCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xxl,
    alignItems: 'center',
    ...Shadows.card,
    marginBottom: Spacing.xl,
  },
  metricCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  metricTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  levelBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  levelBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  percentValue: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'right',
    marginTop: Spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.lg,
  },
  stonesCard: {
    backgroundColor: Colors.softAccent + '30',
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  stonesIcon: {
    fontSize: 36,
    marginRight: Spacing.md,
  },
  stonesLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  stonesValue: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.warmAccent,
  },
  recommendationCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.xxl,
    ...Shadows.card,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  recommendationText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  buttonRow: {
    gap: Spacing.md,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadows.button,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  secondaryButton: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
});
