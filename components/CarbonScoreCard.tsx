import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../constants/Colors';
import { Circle } from 'lucide-react-native';

interface CarbonScoreCardProps {
  score: number;
}

export default function CarbonScoreCard({ score }: CarbonScoreCardProps) {
  const getScoreColor = () => {
    if (score <= 5) return Colors.success.main;
    if (score <= 15) return Colors.accent.main;
    if (score <= 30) return Colors.warning.main;
    return Colors.error.main;
  };

  const getScoreCategory = () => {
    if (score <= 5) return 'Low Impact';
    if (score <= 15) return 'Moderate Impact';
    if (score <= 30) return 'High Impact';
    return 'Very High Impact';
  };

  const getImpactText = () => {
    if (score <= 5) return 'Great job! Your carbon footprint today is low.';
    if (score <= 15) return 'Your carbon footprint is moderate. Small changes can help reduce it further.';
    if (score <= 30) return 'Your carbon footprint is high. Consider some eco-friendly alternatives.';
    return 'Your carbon footprint is very high. Let\'s work together to bring it down.';
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Today's Carbon Score</Text>
        <View style={[styles.categoryBadge, { backgroundColor: getScoreColor() }]}>
          <Text style={styles.categoryText}>{getScoreCategory()}</Text>
        </View>
      </View>

      <View style={styles.scoreContainer}>
        <View style={[styles.scoreCircle, { borderColor: getScoreColor() }]}>
          <Text style={[styles.scoreValue, { color: getScoreColor() }]}>
            {score.toFixed(1)}
          </Text>
          <Text style={styles.scoreUnit}>kg CO₂</Text>
        </View>
      </View>

      <Text style={styles.impactText}>{getImpactText()}</Text>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <Circle size={12} fill={Colors.success.main} color={Colors.success.main} />
          <Text style={styles.legendText}>Low: 0-5kg</Text>
        </View>
        <View style={styles.legendItem}>
          <Circle size={12} fill={Colors.accent.main} color={Colors.accent.main} />
          <Text style={styles.legendText}>Moderate: 5-15kg</Text>
        </View>
        <View style={styles.legendItem}>
          <Circle size={12} fill={Colors.warning.main} color={Colors.warning.main} />
          <Text style={styles.legendText}>High: 15-30kg</Text>
        </View>
        <View style={styles.legendItem}>
          <Circle size={12} fill={Colors.error.main} color={Colors.error.main} />
          <Text style={styles.legendText}>Very High: 30kg+</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background.primary,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: Colors.text.inverse,
    fontWeight: '600',
    fontSize: 12,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  scoreUnit: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  impactText: {
    fontSize: 14,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 8,
  },
  legendText: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginLeft: 6,
  },
});