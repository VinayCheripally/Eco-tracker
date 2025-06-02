import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Colors from '../../constants/Colors';
import SuggestionCard from '../../components/SuggestionCard';
import { mockSuggestions } from '../../data/mockData';
import { ActivityCategory } from '../../types';

export default function SuggestionsScreen() {
  const [activeFilter, setActiveFilter] = useState<ActivityCategory | 'all'>('all');
  const [suggestions] = useState(mockSuggestions);

  const filteredSuggestions = activeFilter === 'all' 
    ? suggestions 
    : suggestions.filter(suggestion => suggestion.category === activeFilter);

  const renderFilterButton = (
    category: ActivityCategory | 'all', 
    label: string
  ) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        activeFilter === category && styles.activeFilterButton,
      ]}
      onPress={() => setActiveFilter(category)}
    >
      <Text
        style={[
          styles.filterButtonText,
          activeFilter === category && styles.activeFilterButtonText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Eco-Friendly Tips</Text>
        <Text style={styles.subtitle}>
          Personalized suggestions to reduce your carbon footprint
        </Text>
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScrollContent}
        >
          {renderFilterButton('all', 'All')}
          {renderFilterButton('transportation', 'Transport')}
          {renderFilterButton('food', 'Food')}
          {renderFilterButton('energy', 'Energy')}
          {renderFilterButton('shopping', 'Shopping')}
          {renderFilterButton('other', 'Other')}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.resultsText}>
          {filteredSuggestions.length} suggestions found
        </Text>
        
        {filteredSuggestions.map((suggestion) => (
          <SuggestionCard key={suggestion.id} suggestion={suggestion} />
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
  filtersContainer: {
    backgroundColor: Colors.background.primary,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 1,
  },
  filtersScrollContent: {
    paddingHorizontal: 16,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: Colors.background.secondary,
  },
  activeFilterButton: {
    backgroundColor: Colors.primary.main,
  },
  filterButtonText: {
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: Colors.text.inverse,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  resultsText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 16,
  },
});