import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Achievement } from '../types';
import Colors from '../constants/Colors';
import { Trophy, Award } from 'lucide-react-native';

interface AchievementBadgeProps {
  achievement: Achievement;
}

export default function AchievementBadge({ achievement }: AchievementBadgeProps) {
  const progress = achievement.progress / achievement.totalRequired;

  return (
    <View style={[styles.container, achievement.isUnlocked ? styles.unlockedContainer : {}]}>
      <View style={styles.iconContainer}>
        {achievement.isUnlocked ? (
          <Award size={32} color={Colors.accent.main} />
        ) : (
          <Trophy size={32} color={Colors.neutral.grey5} />
        )}
      </View>
      <View style={styles.contentContainer}>
        <Text style={[styles.title, achievement.isUnlocked ? styles.unlockedTitle : {}]}>
          {achievement.title}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {achievement.description}
        </Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBarFill, 
                { 
                  width: `${progress * 100}%`,
                  backgroundColor: achievement.isUnlocked ? Colors.accent.main : Colors.primary.main
                }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {achievement.progress}/{achievement.totalRequired}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.background.primary,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  unlockedContainer: {
    backgroundColor: Colors.accent.extraLight,
    borderWidth: 1,
    borderColor: Colors.accent.light,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.background.secondary,
    marginRight: 16,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  unlockedTitle: {
    color: Colors.accent.dark,
  },
  description: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.neutral.grey2,
    borderRadius: 4,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.neutral.grey3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: Colors.text.secondary,
    minWidth: 40,
    textAlign: 'right',
  },
});