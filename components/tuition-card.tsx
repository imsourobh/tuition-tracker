import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface TuitionCardProps {
  id: string;
  name: string;
  color: string;
  currentCount: number;
  monthlyLimit: number;
  icon: string;
  isChecked: boolean;
  paymentStatus: boolean;
  isSelected: boolean;
  onToggle: () => void;
  onPress: () => void;
  onNamePress: () => void;
}

export const TuitionCard: React.FC<TuitionCardProps> = ({
  id,
  name,
  color,
  currentCount,
  monthlyLimit,
  icon,
  isChecked,
  paymentStatus,
  isSelected,
  onToggle,
  onPress,
  onNamePress,
}) => {
  return (
    <Pressable
      style={[
        styles.card,
        { backgroundColor: '#2a2a2a' },
        isSelected && { borderColor: color, borderWidth: 2, shadowColor: color, shadowOpacity: 0.5, shadowRadius: 8, elevation: 6 },
      ]}
      onPress={onPress}
    >
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon as any} size={24} color={color} />
        </View>
        <View style={styles.textContainer}>
          <Pressable onPress={onNamePress}>
            <View style={styles.nameRow}>
              <Text style={[styles.name, isSelected && { color }]}>{name}</Text>
              <View
                style={[
                  styles.paymentIndicator,
                  { backgroundColor: paymentStatus ? '#4CAF50' : '#FF6B6B' },
                ]}
              />
            </View>
          </Pressable>
          <Text style={styles.progressText}>
            {currentCount} / {monthlyLimit} this month
          </Text>
        </View>
      </View>
      <View style={styles.actions}>
        <Pressable
          style={[styles.checkButton, isChecked && { backgroundColor: color }]}
          onPress={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        >
          {isChecked ? (
            <Ionicons name="checkmark" size={24} color="#fff" />
          ) : (
            <Text style={styles.countText}>+1</Text>
          )}
        </Pressable>
        <View style={styles.settingsHint}>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 8,
    borderRadius: 12,
    marginHorizontal: 16,
    borderWidth: 0,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  paymentIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
    marginBottom: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#888',
  },
  actions: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  checkButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3a3a3a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4a4a4a',
  },
  countText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  settingsHint: {
    width: 28,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
