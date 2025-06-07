import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import Colors from '../../constants/Colors';
import { LogOut, CreditCard as Edit2, Save, X } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  eco_goals: string | null;
  created_at: string;
}

interface UserStats {
  activitiesLogged: number;
  streak: number;
  achievementsCount: number;
  carbonReduction: number;
}

export default function ProfileScreen() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats>({
    activitiesLogged: 0,
    streak: 0,
    achievementsCount: 0,
    carbonReduction: 0
  });
  const [editedName, setEditedName] = useState('');
  const [editedEcoGoals, setEditedEcoGoals] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { session } = useAuth();

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserData();
    } else {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  async function fetchUserData() {
    if (!session?.user?.id) {
      console.log('No user session available');
      setIsLoading(false);
      return;
    }

    try {
      await Promise.all([
        fetchProfile(),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchProfile() {
    if (!session?.user?.id) {
      console.log('No user ID available for fetching profile');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setProfile(data);
        setEditedName(data.name || '');
        setEditedEcoGoals(data.eco_goals || '');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async function fetchStats() {
    if (!session?.user?.id) {
      console.log('No user ID available for fetching stats');
      return;
    }

    try {
      // Fetch activities count
      const { data: activities, error: activitiesError } = await supabase
        .from('activities')
        .select('id, created_at, co2_score')
        .eq('user_id', session.user.id);

      if (activitiesError) {
        console.error('Error fetching activities:', activitiesError);
        return;
      }

      // Fetch achievements count
      const { data: achievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('id')
        .eq('user_id', session.user.id);

      if (achievementsError) {
        console.error('Error fetching achievements:', achievementsError);
        return;
      }

      // Calculate streak
      let streak = 0;
      const today = new Date();
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const hasActivity = activities?.some(a => {
          const activityDate = new Date(a.created_at);
          return activityDate.toDateString() === checkDate.toDateString();
        });
        if (hasActivity) {
          streak++;
        } else if (i > 0) {
          break;
        }
      }

      // Calculate carbon reduction (mock calculation - compare to average)
      const totalCarbon = activities?.reduce((sum, a) => sum + a.co2_score, 0) || 0;
      const averageDaily = activities?.length ? totalCarbon / activities.length : 0;
      const globalAverage = 16; // kg CO2 per day (global average)
      const reduction = globalAverage > averageDaily ? ((globalAverage - averageDaily) / globalAverage) * 100 : 0;

      setStats({
        activitiesLogged: activities?.length || 0,
        streak: streak,
        achievementsCount: achievements?.length || 0,
        carbonReduction: reduction
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  }

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        Alert.alert('Error', 'Failed to sign out. Please try again.');
        return;
      }
      router.replace('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  const handleSave = async () => {
    if (!profile || !session?.user?.id) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: editedName,
          eco_goals: editedEcoGoals || null
        })
        .eq('id', session.user.id);

      if (error) {
        Alert.alert('Error', 'Failed to update profile. Please try again.');
        return;
      }

      // Update local state
      setProfile({
        ...profile,
        name: editedName,
        eco_goals: editedEcoGoals || null
      });
      
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedName(profile?.name || '');
    setEditedEcoGoals(profile?.eco_goals || '');
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <LogOut size={24} color={Colors.text.inverse} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  if (!session?.user?.id) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <LogOut size={24} color={Colors.text.inverse} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Please log in to view your profile</Text>
        </View>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <LogOut size={24} color={Colors.text.inverse} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load profile data.</Text>
          <TouchableOpacity onPress={fetchUserData} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <LogOut size={24} color={Colors.text.inverse} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            {!isEditing ? (
              <TouchableOpacity onPress={() => setIsEditing(true)}>
                <Edit2 size={20} color={Colors.primary.main} />
              </TouchableOpacity>
            ) : (
              <View style={styles.editActions}>
                <TouchableOpacity onPress={handleCancel} style={styles.editButton}>
                  <X size={20} color={Colors.error.main} />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={handleSave} 
                  style={styles.editButton}
                  disabled={isSaving}
                >
                  <Save size={20} color={isSaving ? Colors.neutral.grey5 : Colors.success.main} />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {isEditing ? (
            <View style={styles.form}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  value={editedName}
                  onChangeText={setEditedName}
                  placeholder="Your name"
                  placeholderTextColor={Colors.neutral.grey5}
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.emailText}>{profile.email}</Text>
                <Text style={styles.emailNote}>Email cannot be changed</Text>
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Eco Goals</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={editedEcoGoals}
                  onChangeText={setEditedEcoGoals}
                  placeholder="Your eco-friendly goals"
                  placeholderTextColor={Colors.neutral.grey5}
                  multiline
                  numberOfLines={4}
                />
              </View>
            </View>
          ) : (
            <View style={styles.info}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Name</Text>
                <Text style={styles.infoValue}>{profile.name}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{profile.email}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Eco Goals</Text>
                <Text style={styles.infoValue}>
                  {profile.eco_goals || 'No eco goals set yet'}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Member Since</Text>
                <Text style={styles.infoValue}>
                  {new Date(profile.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.activitiesLogged}</Text>
              <Text style={styles.statLabel}>Activities Logged</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.streak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.achievementsCount}</Text>
              <Text style={styles.statLabel}>Achievements</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: Colors.success.main }]}>
                {stats.carbonReduction.toFixed(1)}%
              </Text>
              <Text style={styles.statLabel}>Below Average</Text>
            </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.inverse,
  },
  logoutButton: {
    padding: 8,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error.main,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: Colors.primary.main,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.text.inverse,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    backgroundColor: Colors.background.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    padding: 4,
  },
  form: {
    gap: 16,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  input: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.neutral.grey3,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  emailText: {
    fontSize: 16,
    color: Colors.text.primary,
    padding: 12,
    backgroundColor: Colors.neutral.grey2,
    borderRadius: 8,
  },
  emailNote: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },
  info: {
    gap: 16,
  },
  infoItem: {
    gap: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 8,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.background.secondary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary.main,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});