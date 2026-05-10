import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing, Shadows } from '../../constants/theme';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'boss' | 'employee'>('employee');
  const [loading, setLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Ошибка', 'Пароль должен быть минимум 6 символов');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name,
            role,
          },
        },
      });

      if (error) {
        Alert.alert('Ошибка регистрации', error.message);
      } else if (data.user) {
        setShowOnboarding(true);
      }
    } catch (e: any) {
      Alert.alert('Ошибка', e.message);
    } finally {
      setLoading(false);
    }
  };

  if (showOnboarding) {
    return <OnboardingStep role={role} />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.icon}>💎</Text>
            <Text style={styles.title}>Регистрация</Text>
            <Text style={styles.subtitle}>Начните свой путь</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Имя</Text>
              <TextInput
                style={styles.input}
                placeholder="Ваше имя"
                placeholderTextColor={Colors.textLight}
                value={name}
                onChangeText={setName}
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                placeholderTextColor={Colors.textLight}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Пароль</Text>
              <TextInput
                style={styles.input}
                placeholder="Минимум 6 символов"
                placeholderTextColor={Colors.textLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Вы —</Text>
              <View style={styles.roleSelector}>
                <TouchableOpacity
                  style={[
                    styles.roleOption,
                    role === 'employee' && styles.roleActive,
                  ]}
                  onPress={() => setRole('employee')}
                >
                  <Text style={styles.roleIcon}>🛠️</Text>
                  <Text
                    style={[
                      styles.roleText,
                      role === 'employee' && styles.roleTextActive,
                    ]}
                  >
                    Сотрудник
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.roleOption,
                    role === 'boss' && styles.roleActive,
                  ]}
                  onPress={() => setRole('boss')}
                >
                  <Text style={styles.roleIcon}>👑</Text>
                  <Text
                    style={[
                      styles.roleText,
                      role === 'boss' && styles.roleTextActive,
                    ]}
                  >
                    Руководитель
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.buttonText}>Создать аккаунт</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => router.back()}
            >
              <Text style={styles.linkText}>
                Уже есть аккаунт?{' '}
                <Text style={styles.linkTextBold}>Войти</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Встроенный онбординг после регистрации
function OnboardingStep({ role }: { role: 'boss' | 'employee' }) {
  const [step, setStep] = useState(0);

  const slides = [
    {
      icon: '💎',
      title: 'Камни Силы',
      description:
        'Ваша внутренняя энергия измеряется в "камнях силы". Каждый день вы проходите оценку своего состояния и получаете камни, которые отражают ваш текущий ресурс.',
    },
    {
      icon: '📋',
      title: 'Механика задач',
      description:
        role === 'boss'
          ? 'Как руководитель, вы создаёте задачи для своих сотрудников, устанавливаете их сложность и стоимость в камнях. Отслеживайте прогресс команды.'
          : 'Выполняйте задачи и получайте камни силы. Каждая задача имеет свою сложность и вознаграждение. Чем сложнее задача, тем больше камней вы получите.',
    },
    {
      icon: '🏆',
      title: 'Награды и рост',
      description:
        'Копите камни, повышайте уровень, открывайте достижения. Следите за своей энергией, гибкостью и стабильностью, чтобы быть на пике продуктивности.',
    },
  ];

  const handleNext = () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else {
      router.replace('/(app)/(tabs)/home');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.onboardingContent}>
        <Text style={styles.slideIcon}>{slides[step].icon}</Text>
        <Text style={styles.slideTitle}>{slides[step].title}</Text>
        <Text style={styles.slideDescription}>{slides[step].description}</Text>

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
            {step < slides.length - 1 ? 'Далее' : 'Начать!'}
          </Text>
        </TouchableOpacity>

        {step < slides.length - 1 && (
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => router.replace('/(app)/(tabs)/home')}
          >
            <Text style={styles.skipText}>Пропустить</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    fontSize: 16,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  roleSelector: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  roleOption: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  roleActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  roleIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  roleTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  button: {
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
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  linkButton: {
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  linkText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  linkTextBold: {
    color: Colors.primary,
    fontWeight: '600',
  },
  // Onboarding styles
  onboardingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  slideIcon: {
    fontSize: 80,
    marginBottom: 32,
  },
  slideTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  slideDescription: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing.lg,
  },
  dots: {
    flexDirection: 'row',
    marginTop: 40,
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
  skipButton: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
  },
  skipText: {
    fontSize: 14,
    color: Colors.textLight,
  },
});
