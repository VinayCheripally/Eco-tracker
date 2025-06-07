import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../constants/Colors';
import { Activity } from '../types';

interface ProgressChartProps {
  period: 'week' | 'month' | 'year';
  activities: Activity[];
}

export default function ProgressChart({ period, activities }: ProgressChartProps) {
  // Generate chart data based on real activities
  const generateChartData = () => {
    const now = new Date();
    
    if (period === 'week') {
      // Last 7 days
      const weekData = [];
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        
        const dayActivities = activities.filter(activity => {
          const activityDate = new Date(activity.date);
          return activityDate.toDateString() === date.toDateString();
        });
        
        const totalCarbon = dayActivities.reduce((sum, activity) => sum + activity.carbonImpact, 0);
        
        weekData.push({
          day: dayNames[date.getDay()],
          value: totalCarbon,
        });
      }
      return weekData;
    } else if (period === 'month') {
      // Last 4 weeks
      const monthData = [];
      
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - (i * 7) - 6);
        const weekEnd = new Date(now);
        weekEnd.setDate(now.getDate() - (i * 7));
        
        const weekActivities = activities.filter(activity => {
          const activityDate = new Date(activity.date);
          return activityDate >= weekStart && activityDate <= weekEnd;
        });
        
        const totalCarbon = weekActivities.reduce((sum, activity) => sum + activity.carbonImpact, 0);
        
        monthData.push({
          day: `Week ${4 - i}`,
          value: totalCarbon,
        });
      }
      return monthData;
    } else {
      // Last 12 months
      const yearData = [];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      for (let i = 11; i >= 0; i--) {
        const monthDate = new Date(now);
        monthDate.setMonth(now.getMonth() - i);
        
        const monthActivities = activities.filter(activity => {
          const activityDate = new Date(activity.date);
          return activityDate.getMonth() === monthDate.getMonth() && 
                 activityDate.getFullYear() === monthDate.getFullYear();
        });
        
        const totalCarbon = monthActivities.reduce((sum, activity) => sum + activity.carbonImpact, 0);
        
        yearData.push({
          day: monthNames[monthDate.getMonth()],
          value: totalCarbon,
        });
      }
      return yearData;
    }
  };

  const data = generateChartData();
  const maxValue = Math.max(...data.map(item => item.value), 1); // Ensure minimum of 1 to avoid division by zero

  const getBarColor = (value: number) => {
    if (value <= 5) return Colors.success.main;
    if (value <= 15) return Colors.accent.main;
    if (value <= 30) return Colors.warning.main;
    return Colors.error.main;
  };

  return (
    <View style={styles.container}>
      {data.length === 0 || data.every(item => item.value === 0) ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            No data available for this period
          </Text>
        </View>
      ) : (
        <View style={styles.chart}>
          {data.map((item, index) => {
            const barHeight = Math.max((item.value / maxValue) * 150, 5); // Minimum height of 5
            return (
              <View key={index} style={styles.barContainer}>
                <View style={styles.barLabelsContainer}>
                  <Text style={styles.barValue}>
                    {item.value > 0 ? item.value.toFixed(1) : '0'}
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
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