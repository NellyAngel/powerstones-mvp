import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing, Shadows } from '../../constants/theme';
import ResourceBar from '../../components/ResourceBar';
import { performFullAssessment } from '../../lib/calculations';

// Нормы (мс) для отображения
const NORM_INFO = {
  excitability: { label: 'Энергия (возбудимость)', min: 500, max: 1200, optimal: '650-950', unit: 'мс' },
  lability: { label: 'Гибкость (лабильность)', min: 100, max: 400, optimal: '≤100', unit: 'мс' },
  stability: { label: 'Стабильность (устойчивость)', min: 1500, max: 2500, optimal: '≥2500', unit: 'мс' },
};

export default function AssessmentScreen() {
  const [step, setStep] = useState(0); // 0: intro, 1: input, 2: confirm
  const [excitability, setExcitability] = useState('800');
  const [lability, setLability] = useState('200');
  const [stability, setStability] = useState('2500');
  const [loading, setLoading] = useState(false);

  // Быстрая оценка для предпросмотра
  const previewResult = performFullAssessment({
    excitability_ms: parseInt(excitability) || 0,
    lability_ms: parseInt(lability) || 0,
    stability_ms: parseInt(stability) || 0,
  });

  const isValid =
    parseInt(excitability) > 0 &&
    parseInt(lability) > 0 &&
    parseInt(stability) > 0;

  const handleSubmit = async () => {
    if (!isValid) {
      Alert.alert('Ошибка', 'Введите корректные значения');
      return;
    }

    const values = {
      excitability_ms: parseInt(excitability),
      lability_ms: parseInt(lability),
      stability_ms: parseInt(stability),
    };

    setLoading(true);
    try {
      const result = performFullAssessment(values);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert('Ошибка', 'Необходимо авторизоваться');
        return;
      }

      const { error } = await supabase.from('daily_assessments').insert({
        user_id: user.id,
        date: new Date().toISOString().split('T')[0],
        ...values,
        ...result,
      });

      if (error) {
        if (error.code === '23505') {
          Alert.alert('Уже сегодня', 'Вы уже проходили оценку сегодня');
        } else {
          Alert.alert('Ошибка', error.message);
        }
        return;
      }

      router.replace({
        pathname: '/(app)/result',
        params: { result: JSON.stringify(result) },
      });
    } catch (e: any) {
      Alert.alert('Ошибка', e.message);
    } finally {
      setLoading(false);
    }
  };

  if (step === 0) {
    return <IntroStep onStart={() => setStep(1)} />;
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.content}>
        {/* Шаг 1: Ввод показателей */}
        {step === 1 && (
          <>
            <Text style={styles.title}>Введите показатели</Text>
            <Text style={styles.subtitle}>
              Введите ваши текущие показатели в миллисекундах
            </Text>

            {/* Энергия */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>
                {NORM_INFO.excitability.label}
              </Text>
              <Text style={styles.normText}>
                Норма: {NORM_INFO.excitability.optimal} {NORM_INFO.excitability.unit}
              </Text>
              <TextInput
                style={styles.input}
                value={excitability}
                onChangeText={setExcitability}
                keyboardType="numeric"
                placeholder="800"
                placeholderTextColor={Colors.textLight}
              />
              <ResourceBar
                percent={previewResult.energy_pct}
                height={6}
              />
              <Text style={[styles.previewText, { color: getColor(previewResult.energy_pct) }]}>
                {previewResult.energy_pct}%
              </Text>
            </View>

            {/* Гибкость */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>
                {NORM_INFO.lability.label}
              </Text>
              <Text style={styles.normText}>
                Норма: {NORM_INFO.lability.optimal} {NORM_INFO.lability.unit}
              </Text>
              <TextInput
                style={styles.input}
                value={lability}
                onChangeText={setLability}
                keyboardType="numeric"
                placeholder="200"
                placeholderTextColor={Colors.textLight}
              />
              <ResourceBar
                percent={previewResult.flexibility_pct}
                height={6}
              />
              <Text style={[styles.previewText, { color: getColor(previewResult.flexibility_pct) }]}>
                {previewResult.flexibility_pct}%
              </Text>
            </View>

            {/* Стабильность */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>
                {NORM_INFO.stability.label}
              </Text>
              <Text style={styles.normText}>
                Норма: {NORM_INFO.stability.optimal} {NORM_INFO.stability.unit}
              </Text>
              <TextInput
                style={styles.input}
                value={stability}
                onChangeText={setStability}
                keyboardType="numeric"
                placeholder="2500"
                placeholderTextColor={Colors.textLight}
              />
              <ResourceBar
                percent={previewResult.stability_pct}
                height={6}
              />
              <Text style={[styles.previewText, { color: getColor(previewResult.stability_pct) }]}>
                {previewResult.stability_pct}%
              </Text>
            </View>

            {/* Интегральный показатель */}
            <View style={styles.integralPreview}>
              <Text style={styles.integralLabel}>Интегральный показатель:</Text>
              <Text style={[styles.integralValue, { color: getColor(previewResult.integral_pct) }]}>
                {previewResult.integral_pct}%
              </Text>
              <Text style={styles.stonesPreview}>
                💎 +{previewResult.stones_awarded} камней силы
              </Text>
            </View>

            {/* Кнопки */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setStep(0)}
              >
                <Text style={styles.backButtonText}>Назад</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, (!isValid || loading) && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={!isValid || loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.submitButtonText}>Сохранить</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}

function IntroStep({ onStart }: { onStart: () => void }) {
  return (
    <View style={styles.introContainer}>
      <View style={styles.introContent}>
        <Text style={styles.introIcon}>🧘</Text>
        <Text style={styles.introTitle}>Оценка ресурса</Text>
        <Text style={styles.introText}>
          Сейчас вам нужно ввести три показателя вашего текущего состояния.
          Они измеряются в миллисекундах и отражают вашу энергию, гибкость и стабильность.
        </Text>
        <Text style={styles.introText}>
          Если у вас нет точных значений, используйте примерные или обратитесь к методике измерения.
        </Text>
      </View>
      <View style={styles.introButtonContainer}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={onStart}
          activeOpacity={0.8}
        >
          <Text style={styles.startButtonText}>Начать оценку</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelText}>Отмена</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function getColor(percent: number): string {
  if (percent < 40) return Colors.lowResource;
  if (percent < 70) return Colors.mediumResource;
  return Colors.highResource;
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
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.xxl,
  },
  inputSection: {
    marginBottom: Spacing.xl,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  normText: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  previewText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
    marginTop: 4,
  },
  integralPreview: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadows.card,
    marginBottom: Spacing.xxl,
  },
  integralLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  integralValue: {
    fontSize: 36,
    fontWeight: '700',
  },
  stonesPreview: {
    fontSize: 16,
    color: Colors.warmAccent,
    fontWeight: '600',
    marginTop: Spacing.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  backButton: {
    flex: 1,
    padding: Spacing.lg,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  submitButton: {
    flex: 2,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadows.button,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  // Intro styles
  introContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  introContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  introIcon: {
    fontSize: 80,
    marginBottom: 24,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  introText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  introButtonContainer: {
    padding: Spacing.xxl,
    paddingBottom: 40,
  },
  startButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadows.button,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  cancelButton: {
    padding: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  cancelText: {
    fontSize: 14,
    color: Colors.textLight,
  },
});
