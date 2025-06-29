import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import Colors from '../../constants/Colors';
import EcoTip from '../../components/EcoTip';
import ActivityCard from '../../components/ActivityCard';
import { mockTips } from '../../data/mockData';
import CarbonScoreCard from '../../components/CarbonScoreCard';
import { supabase } from '../../lib/supabase';
import { Activity } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

export default function HomeScreen() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { session } = useAuth();
  
  const randomTipIndex = Math.floor(Math.random() * mockTips.length);
  const todaysTip = mockTips[randomTipIndex];
  
  const fetchRecentActivities = useCallback(async () => {
    if (!session?.user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(10); // Increased limit to show more recent activities

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
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [session?.user?.id]);

  // Fetch data when component mounts
  useEffect(() => {
    fetchRecentActivities();
  }, [fetchRecentActivities]);

  // Refresh data every time the tab comes into focus
  useFocusEffect(
    useCallback(() => {
      if (session?.user?.id) {
        fetchRecentActivities();
      }
    }, [fetchRecentActivities, session?.user?.id])
  );

  // Handle pull-to-refresh
  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchRecentActivities();
  }, [fetchRecentActivities]);
  
  // Calculate today's carbon score
  const todayActivities = activities.filter(activity => {
    const today = new Date();
    const activityDate = new Date(activity.date);
    return (
      activityDate.getDate() === today.getDate() &&
      activityDate.getMonth() === today.getMonth() &&
      activityDate.getFullYear() === today.getFullYear()
    );
  });
  
  const todayCarbonScore = todayActivities.reduce(
    (total, activity) => total + activity.carbonImpact,
    0
  );

  // Get recent activities (last 5 for display)
  const recentActivities = activities.slice(0, 5);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello there!</Text>
        <Text style={styles.title}>Your Carbon Footprint</Text>
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
        <CarbonScoreCard score={todayCarbonScore} />
        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Eco Tip</Text>
        </View>
        <EcoTip tip={todaysTip} />
        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activities</Text>
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All</Text>
            <ChevronRight size={16} color={Colors.primary.main} />
          </TouchableOpacity>
        </View>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading activities...</Text>
          </View>
        ) : recentActivities.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No activities logged yet. Start tracking your carbon footprint by logging your daily activities!
            </Text>
          </View>
        ) : (
          recentActivities.map((activity) => (
            <ActivityCard 
              key={activity.id} 
              activity={activity} 
            />
          ))
        )}

        {/* Today's Summary */}
        {todayActivities.length > 0 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Today's Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Activities logged:</Text>
              <Text style={styles.summaryValue}>{todayActivities.length}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total carbon footprint:</Text>
              <Text style={[styles.summaryValue, { color: Colors.primary.main }]}>
                {todayCarbonScore.toFixed(1)} kg CO₂
              </Text>
            </View>
          </View>
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
  greeting: {
    fontSize: 16,
    color: Colors.text.inverse,
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.inverse,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.primary.main,
    marginRight: 4,
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background.primary,
    borderRadius: 12,
    marginTop: 16,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text.secondary,
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
  },
  summaryCard: {
    backgroundColor: Colors.primary.extraLight,
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary.main,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary.dark,
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