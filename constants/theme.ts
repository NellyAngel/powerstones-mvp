import { StyleSheet, Platform } from 'react-native';
import { Colors } from './colors';

// Шрифты (системные fallback до загрузки кастомных)
export const Fonts = {
  heading: Platform.select({
    ios: 'MontserratAlternates',
    android: 'MontserratAlternates',
    default: 'sans-serif',
  }),
  body: Platform.select({
    ios: 'DidactGothic',
    android: 'DidactGothic',
    default: 'sans-serif',
  }),
} as const;

export const Shadows = StyleSheet.create({
  card: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  button: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
});

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const getResourceColor = (percent: number): string => {
  if (percent < 40) return Colors.lowResource;
  if (percent < 70) return Colors.mediumResource;
  return Colors.highResource;
};
