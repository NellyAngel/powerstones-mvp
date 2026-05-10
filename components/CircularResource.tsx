import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '../constants/colors';
import { getResourceColor, BorderRadius } from '../constants/theme';

interface CircularResourceProps {
  percent: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  showPercent?: boolean;
}

export default function CircularResource({
  percent,
  size = 120,
  strokeWidth = 10,
  label,
  showPercent = true,
}: CircularResourceProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPercent = Math.min(100, Math.max(0, percent));
  const strokeDashoffset = circumference - (clampedPercent / 100) * circumference;
  const color = getResourceColor(clampedPercent);
  const center = size / 2;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={Colors.border}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      {showPercent && (
        <View style={styles.labelContainer}>
          <Text style={[styles.percentText, { color }]}>
            {clampedPercent}%
          </Text>
          {label && <Text style={styles.labelText}>{label}</Text>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  percentText: {
    fontSize: 24,
    fontWeight: '700',
  },
  labelText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
