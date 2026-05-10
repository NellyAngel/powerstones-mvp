// Цветовая палитра приложения "Камни Силы"
export const Colors = {
  // Основные цвета
  primary: '#2C6E49',
  secondary: '#4C956C',
  background: '#FFFFFF',
  softAccent: '#FFC9B9',
  warmAccent: '#D68C45',

  // Семантические цвета
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  cardBackground: '#F9FAFB',

  // Цвета для индикаторов ресурса
  lowResource: '#EF4444',
  mediumResource: '#F59E0B',
  highResource: '#10B981',

  // Статусы задач
  planned: '#6B7280',
  inProgress: '#3B82F6',
  done: '#10B981',

  // Остальное
  error: '#DC2626',
  success: '#16A34A',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
} as const;

export type ResourceColor = keyof typeof resourceColors;

export const resourceColors = {
  low: Colors.lowResource,
  medium: Colors.mediumResource,
  high: Colors.highResource,
} as const;
