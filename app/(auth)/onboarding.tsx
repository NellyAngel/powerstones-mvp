import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing, Shadows } from '../../constants/theme';

interface OnboardingSlide {
  icon: string;
  title: string;
  description: string;
}

const slides: OnboardingSlide[] = [
  {
    icon: '💎',
    title: 'Что такое Камни Силы?',
    description:
      'Камни Силы — это валюта вашей энергии. Каждый день вы проходите оценку, и система рассчитывает ваш текущий ресурс по трём показателям: энергия, гибкость и стабильность.',
  },
  {
    icon: '📋',
    title: 'Механика задач',
    description:
      'Задачи имеют сложность (низкая, средняя, высокая) и стоимость в камнях. Выполняя задачи, вы тратите камни, но получаете опыт и продвигаетесь по уровням.',
  },
  {
    icon: '🏆',
    title: 'Награды и достижения',
    description:
      'Система достижений поощряет регулярность и высокие результаты. Проходите оценку ежедневно, поддерживайте высокий ресурс и выполняйте задачи, чтобы открыть все достижения.',
  },
  {
    icon: '📊',
    title: 'Аналитика для лидеров',
    description:
      'Руководители видят ресурс команды, загрузку сотрудников и могут своевременно предотвратить выгорание, распределяя задачи равномерно.',
  },
];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else {
      router.replace('/(app)/(tabs)/home');
    }
  };

  const slide = slides[step];

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.skip}
        onPress={() => router.replace('/(app)/(tabs)/home')}
      >
        <Text style={styles.skipText}>Пропустить</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.icon}>{slide.icon}</Text>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.description}>{slide.description}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === step && styles.dotActive]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            {step < slides.length - 1 ? 'Далее' : 'Понятно!'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  skip: {
    position: 'absolute',
    top: 60,
    right: Spacing.xxl,
    zIndex: 10,
    padding: Spacing.sm,
  },
  skipText: {
    fontSize: 14,
    color: Colors.textLight,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  icon: {
    fontSize: 80,
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing.lg,
  },
  footer: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: 60,
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    marginBottom: 32,
    gap: Spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.border,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 28,
    borderRadius: 5,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg,
    paddingHorizontal: 48,
    alignItems: 'center',
    width: '100%',
    ...Shadows.button,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});
