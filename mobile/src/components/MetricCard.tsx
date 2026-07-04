import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, getScoreColor } from '../constants/colors';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: string;
  change?: number;
  unit?: string;
  score?: number;
  onPress?: () => void;
  width?: number;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  change,
  unit,
  score,
  onPress,
  width = 140,
}) => {
  const color = score !== undefined ? getScoreColor(score) : Colors.primary;
  const isPositive = change !== undefined && change >= 0;

  return (
    <TouchableOpacity
      style={[styles.card, { width, borderLeftColor: color }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: color + '22' }]}>
          <MaterialCommunityIcons name={icon as any} size={18} color={color} />
        </View>
        {change !== undefined && (
          <View style={[styles.changeBadge, { backgroundColor: isPositive ? Colors.success + '22' : Colors.danger + '22' }]}>
            <MaterialCommunityIcons
              name={isPositive ? 'trending-up' : 'trending-down'}
              size={12}
              color={isPositive ? Colors.success : Colors.danger}
            />
            <Text style={[styles.changeText, { color: isPositive ? Colors.success : Colors.danger }]}>
              {Math.abs(change)}%
            </Text>
          </View>
        )}
      </View>

      <Text style={[styles.value, { color }]}>
        {value}
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </Text>

      <Text style={styles.title}>{title}</Text>

      {score !== undefined && (
        <View style={styles.scoreBar}>
          <View
            style={[
              styles.scoreBarFill,
              { width: `${score}%` as any, backgroundColor: color },
            ]}
          />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 3,
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  changeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  value: {
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 32,
    marginBottom: 4,
  },
  unit: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.7,
  },
  title: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
    marginBottom: 8,
  },
  scoreBar: {
    height: 3,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 2,
  },
});

export default MetricCard;
