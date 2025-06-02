import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DailyTip } from '../types';
import Colors from '../constants/Colors';
import { Leaf } from 'lucide-react-native';

interface EcoTipProps {
  tip: DailyTip;
}

export default function EcoTip({ tip }: EcoTipProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Leaf size={20} color={Colors.primary.main} />
        <Text style={styles.title}>{tip.title}</Text>
      </View>
      <Text style={styles.content}>{tip.content}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary.extraLight,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary.main,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary.dark,
    marginLeft: 8,
  },
  content: {
    fontSize: 14,
    color: Colors.text.primary,
    lineHeight: 20,
  },
});