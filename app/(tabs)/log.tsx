import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Send } from 'lucide-react-native';
import Colors from '../../constants/Colors';
import ActivityCard from '../../components/ActivityCard';
import { Activity } from '../../types';
import { calculateCarbonImpact } from '../../utils/carbonCalculator';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function LogScreen() {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const { session } = useAuth();

  useEffect(() => {
    fetchActivities();
  }, []);

  async function fetchActivities() {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', session?.user?.id)
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

  const handleSubmit = async () => {
    if (!inputText.trim()) {
      return;
    }

    setIsLoading(true);

    try {
      const { carbonImpact, category } = calculateCarbonImpact(inputText);
      
      const { data, error } = await supabase
        .from('activities')
        .insert([
          {
            user_id: session?.user?.id,
            description: inputText,
            category: category,
            co2_score: carbonImpact
          }
        ])
        .select()
        .single();

      if (error) {
        Alert.alert('Error', 'Could not save activity. Please try again.');
        return;
      }

      if (data) {
        const newActivity: Activity = {
          id: data.id,
          description: data.description,
          date: data.created_at,
          carbonImpact: data.co2_score,
          category: data.category,
          createdAt: data.created_at,
        };

        setActivities([newActivity, ...activities]);
        setInputText('');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not process activity. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Log Your Activity</Text>
        <Text style={styles.subtitle}>
          Track what you do in your daily life to calculate your carbon footprint
        </Text>
      </View>

      <ScrollView
        style={styles.activitiesContainer}
        contentContainerStyle={styles.activitiesContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="What did you do today? (e.g., drove 10km, ate beef)"
            placeholderTextColor={Colors.neutral.grey5}
            value={inputText}
            onChangeText={setInputText}
            multiline
            blurOnSubmit
            onSubmitEditing={handleSubmit}
          />
          <TouchableOpacity 
            style={[
              styles.submitButton, 
              !inputText.trim() && styles.disabledButton
            ]} 
            onPress={handleSubmit}
            disabled={!inputText.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.text.inverse} size="small" />
            ) : (
              <Send size={20} color={Colors.text.inverse} />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.activitiesListHeader}>
          <Text style={styles.activitiesTitle}>Your Activities</Text>
        </View>

        {activities.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No activities logged yet. Start by describing what you did today!
            </Text>
          </View>
        ) : (
          activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
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
  activitiesContainer: {
    flex: 1,
  },
  activitiesContent: {
    padding: 16,
    paddingBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.background.primary,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    minHeight: 50,
    padding: 12,
    fontSize: 16,
    color: Colors.text.primary,
  },
  submitButton: {
    backgroundColor: Colors.primary.main,
    borderRadius: 8,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: Colors.neutral.grey4,
  },
  activitiesListHeader: {
    marginBottom: 12,
  },
  activitiesTitle: {
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