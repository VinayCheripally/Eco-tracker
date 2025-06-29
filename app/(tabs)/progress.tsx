import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Colors from '../../constants/Colors';
import ProgressChart from '../../components/ProgressChart';
import AchievementBadge from '../../components/AchievementBadge';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Activity, Achievement } from '../../types';

type TimePeriod = 'week' | 'month' | 'year';

export default function ProgressScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('week');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { session } = useAuth();

  const fetchData = useCallback(async () => {
    if (!session?.user?.id) {
      console.log('No user session available');
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    try {
      await Promise.all([
        fetchActivities(),
        fetchAchievements()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [session?.user?.id]);

  const fetchActivities = useCallback(async () => {
    if (!session?.user?.id) {
      console.log('No user ID available for fetching activities');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching activities:', error);
        return;
      }

      if (data) {
        const formattedActivities: Activity[] = data.map(activity => ({
          id: activity.id,
          description: activity.description,
          date: activity.created_at,
          carbonImpact: activity.co2_score,
          category: activity.category,
          createdAt: activity.created_at
        }));
        setActivities(formattedActivities);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }, [session?.user?.id]);

  const fetchAchievements = useCallback(async () => {
    if (!session?.user?.id) {
      console.log('No user ID available for fetching achievements');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', session.user.id)
        .order('unlocked_on', { ascending: false });

      if (error) {
        console.error('Error fetching achievements:', error);
        return;
      }

      if (data) {
        const formattedAchievements: Achievement[] = data.map(achievement => ({
          id: achievement.id,
          title: achievement.badge_name,
          description: `Achievement unlocked on ${new Date(achievement.unlocked_on).toLocaleDateString()}`,
          icon: 'award',
          isUnlocked: true,
          progress: 1,
          totalRequired: 1,
        }));
        setAchievements(formattedAchievements);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }, [session?.user?.id]);

  // Fetch data when component mounts
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refresh data every time the tab comes into focus
  useFocusEffect(
    useCallback(() => {
      if (session?.user?.id) {
        fetchData();
      }
    }, [fetchData, session?.user?.id])
  );

  // Handle pull-to-refresh
  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchData();
  }, [fetchData]);

  // Calculate stats from real activities
  const calcStats = useCallback(() => {
    const now = new Date();
    const dayMs = 24 * 60 * 60 * 1000;
    const weekMs = 7 * dayMs;
    const monthMs = 30 * dayMs;
    
    const todayActivities = activities.filter(a => {
      const activityDate = new Date(a.date);
      return activityDate.toDateString() === now.toDateString();
    });
    
    const weekActivities = activities.filter(a => {
      const activityDate = new Date(a.date);
      return now.getTime() - activityDate.getTime() < weekMs;
    });
    
    const monthActivities = activities.filter(a => {
      const activityDate = new Date(a.date);
      return now.getTime() - activityDate.getTime() < monthMs;
    });

    // Calculate streak (consecutive days with activities)
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const hasActivity = activities.some(a => {
        const activityDate = new Date(a.date);
        return activityDate.toDateString() === checkDate.toDateString();
      });
      if (hasActivity) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    // Calculate improvement rate (compare this week vs last week)
    const lastWeekActivities = activities.filter(a => {
      const activityDate = new Date(a.date);
      const timeDiff = now.getTime() - activityDate.getTime();
      return timeDiff >= weekMs && timeDiff < (2 * weekMs);
    });

    const thisWeekTotal = weekActivities.reduce((sum, a) => sum + a.carbonImpact, 0);
    const lastWeekTotal = lastWeekActivities.reduce((sum, a) => sum + a.carbonImpact, 0);
    
    let improvementRate = 0;
    if (lastWeekTotal > 0) {
      improvementRate = ((lastWeekTotal - thisWeekTotal) / lastWeekTotal) * 100;
    }
    
    return {
      dailyFootprint: todayActivities.reduce((sum, a) => sum + a.carbonImpact, 0),
      weeklyFootprint: weekActivities.reduce((sum, a) => sum + a.carbonImpact, 0),
      monthlyFootprint: monthActivities.reduce((sum, a) => sum + a.carbonImpact, 0),
      activitiesLogged: activities.length,
      streak: streak,
      improvementRate: improvementRate,
    };
  }, [activities]);

  const stats = calcStats();

  const renderPeriodButton = (period: TimePeriod, label: string) => (
    <TouchableOpacity
      style={[
        styles.periodButton,
        selectedPeriod === period && styles.selectedPeriodButton,
      ]}
      onPress={() => setSelectedPeriod(period)}
    >
      <Text
        style={[
          styles.periodButtonText,
          selectedPeriod === period && styles.selectedPeriodButtonText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Progress</Text>
          <Text style={styles.subtitle}>
            Track your carbon reduction journey
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your progress...</Text>
        </View>
      </View>
    );
  }

  if (!session?.user?.id) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Progress</Text>
          <Text style={styles.subtitle}>
            Track your carbon reduction journey
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Please log in to view your progress</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Progress</Text>
        <Text style={styles.subtitle}>
          Track your carbon reduction journey
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary.main]}
            tintColor={Colors.primary.main}
          />
        }
      >
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Carbon Footprint</Text>
          
          <View style={styles.periodSelector}>
            {renderPeriodButton('week', 'Week')}
            {renderPeriodButton('month', 'Month')}
            {renderPeriodButton('year', 'Year')}
          </View>
          
          <View style={styles.chartContainer}>
            <ProgressChart period={selectedPeriod} activities={activities} />
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.dailyFootprint.toFixed(1)} kg</Text>
              <Text style={styles.statLabel}>Today</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.weeklyFootprint.toFixed(1)} kg</Text>
              <Text style={styles.statLabel}>This Week</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.streak} days</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[
                styles.statValue, 
                stats.improvementRate > 0 ? styles.improvementText : styles.worseningText
              ]}>
                {stats.improvementRate > 0 ? '+' : ''}{stats.improvementRate.toFixed(1)}%
              </Text>
              <Text style={styles.statLabel}>vs Last Week</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Achievements</Text>
          <Text style={styles.achievementCount}>
            {achievements.length} unlocked
          </Text>
        </View>

        {achievements.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No achievements yet. Keep logging activities to unlock achievements!
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Pull down to refresh and check for new achievements.
            </Text>
          </View>
        ) : (
          achievements.map((achievement) => (
            <AchievementBadge key={achievement.id} achievement={achievement} />
          ))
        )}

        {/* Progress Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Progress Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total activities logged:</Text>
            <Text style={styles.summaryValue}>{stats.activitiesLogged}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Current streak:</Text>
            <Text style={[styles.summaryValue, { color: Colors.success.main }]}>
              {stats.streak} days
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>This month's footprint:</Text>
            <Text style={[styles.summaryValue, { color: Colors.primary.main }]}>
              {stats.monthlyFootprint.toFixed(1)} kg CO₂
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  header: {
    backgroundColor: Colors.primary.main,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.inverse,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.inverse,
    opacity: 0.9,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  statsCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  periodButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: Colors.background.secondary,
  },
  selectedPeriodButton: {
    backgroundColor: Colors.primary.main,
  },
  periodButtonText: {
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  selectedPeriodButtonText: {
    color: Colors.text.inverse,
  },
  chartContainer: {
    height: 200,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  statItem: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  improvementText: {
    color: Colors.success.main,
  },
  worseningText: {
    color: Colors.error.main,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  achievementCount: {
    fontSize: 14,
    color: Colors.primary.main,
    fontWeight: '500',
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background.primary,
    borderRadius: 12,
    marginTop: 16,
  },
  emptyStateText: {
    textAlign: 'center',
    color: Colors.text.secondary,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    textAlign: 'center',
    color: Colors.text.secondary,
    fontSize: 14,
    opacity: 0.7,
  },
  summaryCard: {
    backgroundColor: Colors.accent.extraLight,
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent.main,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.accent.dark,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
});