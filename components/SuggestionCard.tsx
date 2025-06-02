import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '../constants/Colors';
import { Suggestion } from '../types';
import { Zap, Car, ShoppingBag, Coffee, CircleHelp as HelpCircle, Lightbulb } from 'lucide-react-native';

interface SuggestionCardProps {
  suggestion: Suggestion;
  onPress?: () => void;
}

export default function SuggestionCard({ suggestion, onPress }: SuggestionCardProps) {
  const getCategoryIcon = () => {
    switch (suggestion.category) {
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

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          {getCategoryIcon()}
        </View>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{suggestion.title}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {suggestion.description}
          </Text>
          <View style={styles.impactContainer}>
            <Lightbulb size={16} color={Colors.success.main} />
            <Text style={styles.impactText}>
              Potential savings: <Text style={styles.highlightText}>{suggestion.potentialSaving} kg CO₂</Text>
            </Text>
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
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary.main,
  },
  iconContainer: {
    justifyContent: 'center',
    marginRight: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background.secondary,
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  impactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  impactText: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginLeft: 4,
  },
  highlightText: {
    color: Colors.success.main,
    fontWeight: '600',
  },
});