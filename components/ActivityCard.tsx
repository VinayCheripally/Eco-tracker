import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Activity } from '../types';
import { formatDate } from '../utils/dateUtils';
import { Car, ShoppingBag, Coffee, Zap, HelpCircle } from 'lucide-react-native';
import Colors from '../constants/Colors';

interface ActivityCardProps {
  activity: Activity;
  onPress?: () => void;
}

export default function ActivityCard({ activity, onPress }: ActivityCardProps) {
  const getCategoryIcon = () => {
    switch (activity.category) {
      case 'transportation':
        return <Car size={24} color={Colors.primary.main} />;
      case 'food':
        return <Coffee size={24} color={Colors.accent.main} />;
      case 'energy':
        return <Zap size={24} color={Colors.warning.main} />;
      case 'shopping':
        return <ShoppingBag size={24} color={Colors.secondary.main} />;
      default:
        return <HelpCircle size={24} color={Colors.neutral.grey6} />;
    }
  };

  const getImpactColor = () => {
    if (activity.carbonImpact <= 1) return Colors.success.main;
    if (activity.carbonImpact <= 5) return Colors.accent.main;
    if (activity.carbonImpact <= 15) return Colors.warning.main;
    return Colors.error.main;
  };

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.card}>
        <View style={styles.iconContainer}>{getCategoryIcon()}</View>
        <View style={styles.contentContainer}>
          <Text style={styles.description} numberOfLines={2}>
            {activity.description}
          </Text>
          <Text style={styles.date}>{formatDate(activity.date)}</Text>
        </View>
        <View style={styles.impactContainer}>
          <View style={[styles.impactBadge, { backgroundColor: getImpactColor() }]}>
            <Text style={styles.impactText}>{activity.carbonImpact} kg</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.background.primary,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    justifyContent: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  description: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  impactContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  impactBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  impactText: {
    color: Colors.text.inverse,
    fontWeight: '600',
    fontSize: 14,
  },
});