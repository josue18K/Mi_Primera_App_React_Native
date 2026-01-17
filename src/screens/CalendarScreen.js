import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import AsyncStorageService from '../storage/AsyncStorageService';
import { COLORS, TURN_EMOJIS } from '../constants';
import { formatDateKey } from '../utils/dateHelpers';
import LoadingScreen from '../components/LoadingScreen';

const CalendarScreen = ({ navigation }) => {
  const [currentWeek, setCurrentWeek] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const week = await AsyncStorageService.getCurrentWeek();
      setCurrentWeek(week);
    } catch (error) {
      console.error('Error loading calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!currentWeek) {
    return <LoadingScreen />;
  }

  const markedDates = {};
  currentWeek.days.forEach(day => {
    if (day.totalHours > 0) {
      markedDates[day.date] = {
        marked: true,
        dotColor: COLORS.primary,
        customStyles: {
          container: {
            backgroundColor: COLORS.primary + '20',
            borderRadius: 8,
          },
          text: {
            color: COLORS.dark,
            fontWeight: 'bold',
          },
        },
      };
    }
  });

  markedDates[currentWeek.startDate] = {
    ...markedDates[currentWeek.startDate],
    startingDay: true,
    color: COLORS.primary + '30',
  };

  markedDates[currentWeek.endDate] = {
    ...markedDates[currentWeek.endDate],
    endingDay: true,
    color: COLORS.primary + '30',
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calendario</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Calendar
            current={currentWeek.startDate}
            minDate={currentWeek.startDate}
            maxDate={currentWeek.endDate}
            markedDates={markedDates}
            markingType="period"
            theme={{
              calendarBackground: COLORS.white,
              textSectionTitleColor: COLORS.gray,
              selectedDayBackgroundColor: COLORS.primary,
              selectedDayTextColor: COLORS.white,
              todayTextColor: COLORS.primary,
              dayTextColor: COLORS.dark,
              textDisabledColor: COLORS.disabled,
              monthTextColor: COLORS.dark,
              textMonthFontWeight: 'bold',
              textMonthFontSize: 18,
              textDayFontSize: 16,
              textDayHeaderFontSize: 14,
            }}
          />

          <View style={styles.legend}>
            <Text style={styles.legendTitle}>Semana Actual</Text>
            <Text style={styles.legendSubtitle}>
              {new Date(currentWeek.startDate).toLocaleDateString('es-PE', {
                day: 'numeric',
                month: 'long',
              })}
              {' - '}
              {new Date(currentWeek.endDate).toLocaleDateString('es-PE', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          </View>

          <View style={styles.daysContainer}>
            <Text style={styles.sectionTitle}>Días de la semana</Text>
            {currentWeek.days.map(day => {
              const date = new Date(day.date);
              const dayName = date.toLocaleDateString('es-PE', { weekday: 'long' });
              const dayNumber = date.toLocaleDateString('es-PE', {
                day: 'numeric',
                month: 'short',
              });

              return (
                <View key={day.date} style={styles.dayCard}>
                  <View style={styles.dayInfo}>
                    <Text style={styles.dayName}>{dayName}</Text>
                    <Text style={styles.dayDate}>{dayNumber}</Text>
                  </View>

                  <View style={styles.turnsInfo}>
                    {day.turns.length > 0 ? (
                      <View style={styles.turnsIcons}>
                        {day.turns.map((turn, index) => (
                          <Text key={index} style={styles.turnEmoji}>
                            {TURN_EMOJIS[turn.type]}
                          </Text>
                        ))}
                      </View>
                    ) : (
                      <Text style={styles.noTurns}>Sin turnos</Text>
                    )}
                    <Text
                      style={[
                        styles.hoursText,
                        day.totalHours > 0 && styles.hoursTextActive,
                      ]}
                    >
                      {day.totalHours}h
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: COLORS.backgroundSecondary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  content: {
    padding: 16,
  },
  legend: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 4,
  },
  legendSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    textTransform: 'capitalize',
  },
  daysContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 12,
  },
  dayCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  dayInfo: {
    flex: 1,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    textTransform: 'capitalize',
    marginBottom: 2,
  },
  dayDate: {
    fontSize: 13,
    color: COLORS.gray,
  },
  turnsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  turnsIcons: {
    flexDirection: 'row',
    gap: 4,
  },
  turnEmoji: {
    fontSize: 20,
  },
  noTurns: {
    fontSize: 13,
    color: COLORS.gray,
    fontStyle: 'italic',
  },
  hoursText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.gray,
    minWidth: 40,
    textAlign: 'right',
  },
  hoursTextActive: {
    color: COLORS.success,
  },
});

export default CalendarScreen;
