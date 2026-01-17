import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorageService from '../storage/AsyncStorageService';
import { COLORS } from '../constants';
import {
  getWorkWeekStart,
  getWorkWeekEnd,
  formatDateKey,
  getWorkWeekDates,
  generateWeekId,
  isDateInWeek,
} from '../utils/dateHelpers';
import {
  calculateWeekHours,
  calculateWeekPay,
  createTurn,
  hasTurn,
  addTurnToDay,
  removeTurnFromDay,
  formatMoney,
  formatHours,
} from '../utils/calculations';
import WeekSummary from '../components/WeekSummary';
import DaySelector from '../components/DaySelector';
import TurnButton from '../components/TurnButton';
import LoadingScreen from '../components/LoadingScreen';
import CustomAlert from '../components/CustomAlert';
import { hapticSuccess, hapticError } from '../utils/haptics';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [worker, setWorker] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    type: 'info',
    title: '',
    message: '',
    buttons: [{ text: 'OK', onPress: () => {}, style: 'default' }],
  });

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const workerConfig = await AsyncStorageService.getWorkerConfig();
      const week = await AsyncStorageService.getCurrentWeek();

      if (!workerConfig || !week) {
        navigation.replace('Welcome');
        return;
      }

      setWorker(workerConfig);
      setCurrentWeek(week);

      const weekStart = new Date(week.startDate);
      if (!isDateInWeek(selectedDate, week.startDate)) {
        setSelectedDate(weekStart);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const createNewWeek = async () => {
    if (!worker) return;

    const startDate = getWorkWeekStart(new Date());
    const endDate = getWorkWeekEnd(startDate);
    const weekDates = getWorkWeekDates(startDate);

    const days = weekDates.map(date => {
      const dayOfWeek = date.getDay();
      const daySchedule = worker.weekSchedule.find(s => s.dayOfWeek === dayOfWeek);
      
      const turns = daySchedule?.isWorkDay && daySchedule.turns.length > 0
        ? daySchedule.turns.map(type => ({
            type,
            hours: worker.turnConfig[type],
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
    const totalPay = totalHours * worker.hourlyRate;

    const newWeek = {
      id: generateWeekId(startDate),
      startDate: formatDateKey(startDate),
      endDate: formatDateKey(endDate),
      days,
      totalHours,
      totalPay,
      isClosed: false,
    };

    await AsyncStorageService.saveCurrentWeek(newWeek);
    setCurrentWeek(newWeek);
    setSelectedDate(startDate);
  };

  const closeCurrentWeekAndStartNew = async () => {
    if (!currentWeek || !worker) return;

    try {
      const closedWeek = {
        ...currentWeek,
        isClosed: true,
      };

      await AsyncStorageService.addWeekToHistory(closedWeek);
      await createNewWeek();

      hapticSuccess();
      setAlertConfig({
        type: 'success',
        title: '¡Nueva semana! 🎉',
        message: `Tu semana anterior (${formatHours(closedWeek.totalHours)} trabajadas) se guardó en el historial.\n\n¡Comienza una nueva semana de trabajo!`,
        buttons: [{ text: 'Entendido', onPress: () => {}, style: 'default' }],
      });
      setAlertVisible(true);
    } catch (error) {
      console.error('Error closing week:', error);
      hapticError();
      setAlertConfig({
        type: 'error',
        title: 'Error',
        message: 'No se pudo cerrar la semana actual',
        buttons: [{ text: 'OK', onPress: () => {}, style: 'default' }],
      });
      setAlertVisible(true);
    }
  };

  const toggleTurn = async (turnType) => {
    if (!currentWeek || !worker) return;

    const dateKey = formatDateKey(selectedDate);
    const dayIndex = currentWeek.days.findIndex(day => day.date === dateKey);

    if (dayIndex === -1) return;

    const day = currentWeek.days[dayIndex];
    const hasThisTurn = hasTurn(day, turnType);

    let updatedDay;
    if (hasThisTurn) {
      updatedDay = removeTurnFromDay(day, turnType);
    } else {
      const turn = createTurn(turnType, worker.turnConfig[turnType]);
      updatedDay = addTurnToDay(day, turn);
    }

    const updatedDays = [...currentWeek.days];
    updatedDays[dayIndex] = updatedDay;

    const totalHours = calculateWeekHours(updatedDays);
    const totalPay = calculateWeekPay(totalHours, worker.hourlyRate);

    const updatedWeek = {
      ...currentWeek,
      days: updatedDays,
      totalHours,
      totalPay,
    };

    await AsyncStorageService.saveCurrentWeek(updatedWeek);
    setCurrentWeek(updatedWeek);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!worker || !currentWeek) {
    return <LoadingScreen />;
  }

  const selectedDay = currentWeek.days.find(
    day => day.date === formatDateKey(selectedDate)
  );

  const workDaysData = new Map(
    currentWeek.days.map(day => [day.date, day.totalHours])
  );

  const weekDates = getWorkWeekDates(new Date(currentWeek.startDate));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola, {worker.name} 👋</Text>
          <Text style={styles.subtitle}>Registra tus turnos aquí</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('History')}
          >
            <Ionicons name="time" size={24} color={COLORS.dark} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="settings" size={24} color={COLORS.dark} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <WeekSummary
          totalHours={currentWeek.totalHours}
          totalPay={currentWeek.totalPay}
          startDate={currentWeek.startDate}
          endDate={currentWeek.endDate}
        />

        <DaySelector
          dates={weekDates}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          workDaysData={workDaysData}
        />

        <View style={styles.turnsSection}>
          <Text style={styles.sectionTitle}>
            {selectedDate.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}
          </Text>
          <Text style={styles.sectionSubtitle}>
            Toca para agregar o quitar turnos
          </Text>

          <View style={styles.turnsContainer}>
            {['M', 'T', 'N'].map(turnType => (
              <TurnButton
                key={turnType}
                type={turnType}
                hours={worker.turnConfig[turnType]}
                isActive={selectedDay ? hasTurn(selectedDay, turnType) : false}
                onPress={() => toggleTurn(turnType)}
              />
            ))}
          </View>

          {selectedDay && (
            <View style={styles.dayTotal}>
              <Text style={styles.dayTotalLabel}>Total del día</Text>
              <Text style={styles.dayTotalValue}>
                {formatHours(selectedDay.totalHours)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.calendarButton}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Calendar')}
          >
            <Ionicons name="calendar" size={24} color={COLORS.white} />
            <Text style={styles.buttonText}>Ver Calendario Completo</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <CustomAlert
        visible={alertVisible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={() => setAlertVisible(false)}
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  greeting: {
    fontSize: Math.min(24, width * 0.06),
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 4,
  },
  iconButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: COLORS.backgroundSecondary,
  },
  turnsSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 16,
  },
  turnsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  dayTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  dayTotalLabel: {
    fontSize: 16,
    color: COLORS.gray,
    fontWeight: '500',
  },
  dayTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  calendarButton: {
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 20,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 12,
  },
});

export default HomeScreen;
