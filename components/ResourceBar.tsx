import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { BorderRadius } from '../constants/theme';

interface ResourceBarProps {
  percent: number;
  color?: string;
  height?: number;
  animated?: boolean;
}

export default function ResourceBar({
  percent,
  color,
  height = 12,
}: ResourceBarProps) {
  const barColor = color || getBarColor(percent);
  const clampedPercent = Math.min(100, Math.max(0, percent));

  return (
    <View style={[styles.container, { height }]}>
      <View
        style={[
          styles.fill,
          {
            width: `${clampedPercent}%`,
            backgroundColor: barColor,
            height,
          },
        ]}
      />
    </View>
  );
}

function getBarColor(percent: number): string {
  if (percent < 40) return Colors.lowResource;
  if (percent < 70) return Colors.mediumResource;
  return Colors.highResource;
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: BorderRadius.full,
  },
});
