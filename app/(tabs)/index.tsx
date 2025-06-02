import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import Colors from '../../constants/Colors';
import EcoTip from '../../components/EcoTip';
import ActivityCard from '../../components/ActivityCard';
import { mockActivities, mockTips } from '../../data/mockData';
import CarbonScoreCard from '../../components/CarbonScoreCard';

export default function HomeScreen() {
  const [activities] = useState(mockActivities.slice(0, 3));
  const randomTipIndex = Math.floor(Math.random() * mockTips.length);
  const todaysTip = mockTips[randomTipIndex];
  
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
        
        {activities.map((activity) => (
          <ActivityCard 
            key={activity.id} 
            activity={activity} 
          />
        ))}
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
});