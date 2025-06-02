import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../constants/Colors';

interface ProgressChartProps {
  period: 'week' | 'month' | 'year';
}

export default function ProgressChart({ period }: ProgressChartProps) {
  // Mock data generation based on selected period
  const generateChartData = () => {
    if (period === 'week') {
      return [
        { day: 'Mon', value: 12.3 },
        { day: 'Tue', value: 8.7 },
        { day: 'Wed', value: 10.1 },
        { day: 'Thu', value: 6.5 },
        { day: 'Fri', value: 5.2 },
        { day: 'Sat', value: 9.8 },
        { day: 'Sun', value: 4.3 },
      ];
    } else if (period === 'month') {
      return Array.from({ length: 4 }, (_, i) => ({
        day: `Week ${i + 1}`,
        value: Math.random() * 40 + 10,
      }));
    } else {
      return Array.from({ length: 12 }, (_, i) => {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return {
          day: monthNames[i],
          value: Math.random() * 100 + 50,
        };
      });
    }
  };

  const data = generateChartData();
  const maxValue = Math.max(...data.map(item => item.value));

  const getBarColor = (value: number) => {
    if (value <= 5) return Colors.success.main;
    if (value <= 15) return Colors.accent.main;
    if (value <= 30) return Colors.warning.main;
    return Colors.error.main;
  };

  return (
    <View style={styles.container}>
      <View style={styles.chart}>
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * 150;
          return (
            <View key={index} style={styles.barContainer}>
              <View style={styles.barLabelsContainer}>
                <Text style={styles.barValue}>
                  {item.value.toFixed(1)}
                </Text>
              </View>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      backgroundColor: getBarColor(item.value),
                    },
                  ]}
                />
              </View>
              <Text style={styles.barLabel}>{item.day}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 200,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
  },
  barLabelsContainer: {
    height: 20,
  },
  barWrapper: {
    height: 150,
    justifyContent: 'flex-end',
  },
  bar: {
    width: 12,
    borderRadius: 6,
    minHeight: 5,
  },
  barValue: {
    fontSize: 10,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 8,
    textAlign: 'center',
  },
});