import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { formatDateShort, getDayName, isSameDayHelper } from '../utils/dateHelpers';
import { hapticSelection } from '../utils/haptics';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');
const DAY_BUTTON_WIDTH = Math.min(70, (width - 48) / 5);

const DaySelector = ({ dates, selectedDate, onSelectDate, workDaysData }) => {
  const { colors } = useTheme();
  const today = new Date();
  const scrollViewRef = useRef(null);

  const handleDayPress = (date) => {
    hapticSelection();
    onSelectDate(date);
  };

  const styles = createStyles(colors);

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

const createStyles = (colors) => StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
    backgroundColor: colors.backgroundSecondary,
    position: 'relative',
    minHeight: 90,
  },
  dayButtonSelected: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  dayButtonToday: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.card,
  },
  todayBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: colors.success,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  todayBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.white,
    textTransform: 'uppercase',
  },
  dayName: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.gray,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dayNameSelected: {
    color: colors.white,
  },
  dayNameToday: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  dayNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: 6,
  },
  dayNumberSelected: {
    color: colors.white,
  },
  dayNumberToday: {
    color: colors.primary,
  },
  indicator: {
    backgroundColor: colors.success,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 4,
    shadowColor: colors.success,
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
    color: colors.white,
  },
});

export default DaySelector;
