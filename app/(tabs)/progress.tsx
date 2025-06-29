import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
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
  const { session } = useAuth();

  useEffect(() => {
    if (session?.user?.id) {
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  async function fetchData() {
    if (!session?.user?.id) {
      console.log('No user session available');
      setIsLoading(false);
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
    }
  }

  async function fetchActivities() {
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
  }

  async function fetchAchievements() {
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
  }

  // Calculate stats from real activities
  const calcStats = () => {
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
  };

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
        </View>

        {achievements.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No achievements yet. Keep logging activities to unlock achievements!
            </Text>
          </View>
        ) : (
          achievements.map((achievement) => (
            <AchievementBadge key={achievement.id} achievement={achievement} />
          ))
        )}
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
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text.secondary,
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
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
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
  },
});