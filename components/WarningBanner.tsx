import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { BorderRadius, Spacing } from '../constants/theme';

interface WarningBannerProps {
  message: string;
  type?: 'warning' | 'danger' | 'info';
}

export default function WarningBanner({
  message,
  type = 'warning',
}: WarningBannerProps) {
  const colors = {
    warning: { bg: Colors.mediumResource + '15', text: Colors.mediumResource, icon: '⚠️' },
    danger: { bg: Colors.lowResource + '15', text: Colors.lowResource, icon: '🚨' },
    info: { bg: Colors.inProgress + '15', text: Colors.inProgress, icon: 'ℹ️' },
  };

  const config = colors[type];

  return (
    <View style={[styles.container, { backgroundColor: config.bg }]}>
      <Text style={styles.icon}>{config.icon}</Text>
      <Text style={[styles.message, { color: config.text }]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  icon: {
    fontSize: 18,
    marginRight: Spacing.sm,
  },
  message: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    lineHeight: 20,
  },
});
