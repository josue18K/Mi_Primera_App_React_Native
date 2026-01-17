import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorageService from '../storage/AsyncStorageService';
import { COLORS, DAYS_OF_WEEK, DEFAULT_WEEK_SCHEDULE, TURN_EMOJIS, TURN_LABELS } from '../constants';
import {
  getWorkWeekStart,
  getWorkWeekEnd,
  formatDateKey,
  generateWeekId,
  getWorkWeekDates,
} from '../utils/dateHelpers';
import { hapticLight, hapticSuccess } from '../utils/haptics';

const SetupScheduleScreen = ({ navigation }) => {
  const [schedule, setSchedule] = useState(DEFAULT_WEEK_SCHEDULE);
  const [loading, setLoading] = useState(false);

  const toggleWorkDay = (dayOfWeek) => {
    hapticLight();
    setSchedule(prev =>
      prev.map(day =>
        day.dayOfWeek === dayOfWeek
          ? { ...day, isWorkDay: !day.isWorkDay, turns: !day.isWorkDay ? ['M'] : [] }
          : day
      )
    );
  };

  const toggleTurn = (dayOfWeek, turn) => {
    hapticLight();
    setSchedule(prev =>
      prev.map(day => {
        if (day.dayOfWeek === dayOfWeek && day.isWorkDay) {
          const hasTurn = day.turns.includes(turn);
          const newTurns = hasTurn
            ? day.turns.filter(t => t !== turn)
            : [...day.turns, turn].sort();
          return { ...day, turns: newTurns };
        }
        return day;
      })
    );
  };

  const createInitialWeek = (workerConfig) => {
    const startDate = getWorkWeekStart(new Date());
    const endDate = getWorkWeekEnd(startDate);
    const weekDates = getWorkWeekDates(startDate);

    const days = weekDates.map(date => {
      const dayOfWeek = date.getDay();
      const daySchedule = workerConfig.weekSchedule.find(s => s.dayOfWeek === dayOfWeek);
      
      const turns = daySchedule?.isWorkDay && daySchedule.turns.length > 0
        ? daySchedule.turns.map(type => ({
            type,
            hours: workerConfig.turnConfig[type],
          }))
        : [];

      const totalHours = turns.reduce((sum, turn) => sum + turn.hours, 0);

      return {
        date: formatDateKey(date),
        turns,
        totalHours,
      };
    });

    const totalHours = days.reduce((sum, day) => sum + day.totalHours, 0);
    const totalPay = totalHours * workerConfig.hourlyRate;

    return {
      id: generateWeekId(startDate),
      startDate: formatDateKey(startDate),
      endDate: formatDateKey(endDate),
      days,
      totalHours,
      totalPay,
      isClosed: false,
    };
  };

  const handleComplete = async () => {
    const hasWorkDays = schedule.some(day => day.isWorkDay && day.turns.length > 0);

    if (!hasWorkDays) {
      Alert.alert('Error', 'Debes configurar al menos un día de trabajo con turnos');
      return;
    }

    setLoading(true);

    try {
      const existingConfig = await AsyncStorageService.getWorkerConfig();

      if (!existingConfig) {
        Alert.alert('Error', 'No se encontró la configuración inicial');
        navigation.replace('Setup');
        return;
      }

      const updatedConfig = {
        ...existingConfig,
        weekSchedule: schedule,
        setupCompleted: true,
      };

      const initialWeek = createInitialWeek(updatedConfig);

      await AsyncStorageService.saveWorkerConfig(updatedConfig);
      await AsyncStorageService.saveCurrentWeek(initialWeek);

      hapticSuccess();
      navigation.replace('Home');
    } catch (error) {
      console.error('Error saving schedule:', error);
      Alert.alert('Error', 'No se pudo guardar la configuración');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configura tu horario</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.subtitle}>
            Selecciona los días que trabajas y los turnos de cada día
          </Text>

          {schedule.map((day) => (
            <View key={day.dayOfWeek} style={styles.dayCard}>
              <View style={styles.dayHeader}>
                <View style={styles.dayInfo}>
                  <Text style={styles.dayName}>{DAYS_OF_WEEK[day.dayOfWeek]}</Text>
                  <Text style={styles.dayStatus}>
                    {day.isWorkDay ? '✅ Trabajo' : '🚫 Descanso'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.workDayToggle,
                    day.isWorkDay && styles.workDayToggleActive,
                  ]}
                  onPress={() => toggleWorkDay(day.dayOfWeek)}
                >
                  <Ionicons
                    name={day.isWorkDay ? 'checkmark-circle' : 'close-circle'}
                    size={28}
                    color={day.isWorkDay ? COLORS.success : COLORS.gray}
                  />
                </TouchableOpacity>
              </View>

              {day.isWorkDay && (
                <View style={styles.turnsContainer}>
                  <Text style={styles.turnsLabel}>Turnos:</Text>
                  <View style={styles.turnsButtons}>
                    {['M', 'T', 'N'].map(turn => {
                      const isActive = day.turns.includes(turn);
                      return (
                        <TouchableOpacity
                          key={turn}
                          style={[
                            styles.turnButton,
                            isActive && styles.turnButtonActive,
                            isActive && { backgroundColor: COLORS[`turn${turn}`] },
                          ]}
                          onPress={() => toggleTurn(day.dayOfWeek, turn)}
                        >
                          <Text style={styles.turnEmoji}>{TURN_EMOJIS[turn]}</Text>
                          <Text
                            style={[
                              styles.turnButtonText,
                              isActive && styles.turnButtonTextActive,
                            ]}
                          >
                            {TURN_LABELS[turn]}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>
          ))}

          <View style={styles.infoBox}>
            <Ionicons name="bulb" size={24} color={COLORS.warning} />
            <Text style={styles.infoText}>
              Estos turnos se aplicarán automáticamente cada semana. Podrás
              editarlos manualmente en el calendario cuando necesites.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.completeButton, loading && styles.completeButtonDisabled]}
          onPress={handleComplete}
          disabled={loading}
        >
          <Text style={styles.completeButtonText}>
            {loading ? 'Guardando...' : 'Completar Configuración'}
          </Text>
          <Ionicons name="checkmark-circle" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>
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
  subtitle: {
    fontSize: 15,
    color: COLORS.gray,
    marginBottom: 20,
    lineHeight: 22,
  },
  dayCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayInfo: {
    flex: 1,
  },
  dayName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 4,
  },
  dayStatus: {
    fontSize: 14,
    color: COLORS.gray,
  },
  workDayToggle: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: COLORS.backgroundSecondary,
  },
  workDayToggleActive: {
    backgroundColor: `${COLORS.success}15`,
  },
  turnsContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
  },
  turnsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray,
    marginBottom: 10,
  },
  turnsButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  turnButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    minHeight: 48,
  },
  turnButtonActive: {
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  turnEmoji: {
    fontSize: 18,
    marginRight: 6,
  },
  turnButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray,
  },
  turnButtonTextActive: {
    color: COLORS.white,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#fef3c7',
    borderRadius: 14,
    padding: 16,
    marginTop: 12,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 10 : 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  completeButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  completeButtonDisabled: {
    opacity: 0.6,
  },
  completeButtonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: 'bold',
  },
});

export default SetupScheduleScreen;
