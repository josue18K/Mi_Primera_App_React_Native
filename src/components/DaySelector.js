import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { COLORS } from '../constants';
import { formatDateShort, getDayName, isSameDayHelper } from '../utils/dateHelpers';
import { hapticSelection } from '../utils/haptics';

const { width } = Dimensions.get('window');
const DAY_BUTTON_WIDTH = Math.min(70, (width - 48) / 5);

const DaySelector = ({ dates, selectedDate, onSelectDate, workDaysData }) => {
  const today = new Date();
  const scrollViewRef = useRef(null);

  const handleDayPress = (date) => {
    hapticSelection();
    onSelectDate(date);
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        ref={scrollViewRef}
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={DAY_BUTTON_WIDTH + 8}
      >
        {dates.map((date, index) => {
          const isSelected = isSameDayHelper(date, selectedDate);
          const isToday = isSameDayHelper(date, today);
          const dateKey = date.toISOString().split('T')[0];
          const hours = workDaysData.get(dateKey) || 0;
          const hasWork = hours > 0;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayButton,
                { width: DAY_BUTTON_WIDTH },
                isSelected && styles.dayButtonSelected,
                isToday && !isSelected && styles.dayButtonToday,
              ]}
              onPress={() => handleDayPress(date)}
              activeOpacity={0.7}
            >
              {isToday && (
                <View style={styles.todayBadge}>
                  <Text style={styles.todayBadgeText}>Hoy</Text>
                </View>
              )}
              <Text style={[
                styles.dayName,
                isSelected && styles.dayNameSelected,
                isToday && !isSelected && styles.dayNameToday,
              ]}>
                {getDayName(date).substring(0, 3)}
              </Text>
              <Text style={[
                styles.dayNumber,
                isSelected && styles.dayNumberSelected,
                isToday && !isSelected && styles.dayNumberToday,
              ]}>
                {date.getDate()}
              </Text>
              {hasWork && (
                <View style={[
                  styles.indicator,
                  isSelected && styles.indicatorSelected,
                ]}>
                  <Text style={styles.indicatorText}>{hours}h</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  dayButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 14,
    backgroundColor: COLORS.backgroundSecondary,
    position: 'relative',
    minHeight: 90,
  },
  dayButtonSelected: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  dayButtonToday: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  todayBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: COLORS.success,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  todayBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.white,
    textTransform: 'uppercase',
  },
  dayName: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.gray,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dayNameSelected: {
    color: COLORS.white,
  },
  dayNameToday: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  dayNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 6,
  },
  dayNumberSelected: {
    color: COLORS.white,
  },
  dayNumberToday: {
    color: COLORS.primary,
  },
  indicator: {
    backgroundColor: COLORS.success,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 4,
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  indicatorSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  indicatorText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});

export default DaySelector;
