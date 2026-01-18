import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useWeek } from "../context/WeekContext";
import { useWorker } from "../context/WorkerContext";
import WeekSummary from "../components/WeekSummary";
import DayCard from "../components/DayCard";
import TurnEditModal from "../components/TurnEditModal";
import { calculateWeekStats } from "../utils/calculations";
import { TURN_TYPES, TURN_SCHEDULES } from "../constants";

const HomeScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { workerConfig } = useWorker();
  const {
    currentWeek,
    initializeWeek,
    addTurn,
    updateTurn,
    deleteTurn,
    checkInTurn,
    closeWeek,
  } = useWeek();

  const [selectedDay, setSelectedDay] = useState(null);
  const [showTurnMenu, setShowTurnMenu] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editingTurn, setEditingTurn] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const styles = createStyles(colors);

  useEffect(() => {
    if (!currentWeek) {
      // Inicializar semana automáticamente (Miércoles a Martes)
      const today = new Date();
      const dayOfWeek = today.getDay();

      // Calcular el miércoles de esta semana
      const daysUntilWednesday = (3 - dayOfWeek + 7) % 7;
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - daysUntilWednesday);
      startDate.setHours(0, 0, 0, 0);

      // Fin de semana es el martes siguiente
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);

      initializeWeek(startDate, endDate);
    }
  }, [currentWeek]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simular refresh (aquí podrías recargar datos si es necesario)
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleDayPress = (day) => {
    setSelectedDay(day);
    setShowTurnMenu(true);
  };

  const handleAddTurn = (turnType) => {
    if (!selectedDay) return;

    // Mostrar opciones: Check-in ahora o Agregar manualmente
    Alert.alert(
      "Agregar Turno",
      "¿Cómo deseas registrar este turno?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "⏱️ Check-in Ahora",
          onPress: () => {
            checkInTurn(selectedDay.date, turnType);
            setShowTurnMenu(false);
          },
        },
        {
          text: "✏️ Agregar Manual",
          onPress: () => {
            // Crear turno vacío y abrir editor
            addTurn(selectedDay.date, turnType, false);
            setShowTurnMenu(false);

            // Esperar un momento para que se actualice el estado
            setTimeout(() => {
              const day = currentWeek.days.find(
                (d) =>
                  new Date(d.date).toDateString() ===
                  new Date(selectedDay.date).toDateString(),
              );
              const turn = day?.turns.find((t) => t.type === turnType);
              if (turn) {
                setEditingTurn(turn);
                setShowEditModal(true);
              }
            }, 100);
          },
        },
      ],
      { cancelable: true },
    );
  };

  const handleCloseWeek = () => {
    Alert.alert(
      "Cerrar Semana",
      "¿Estás seguro de cerrar esta semana? Los datos se guardarán en el historial.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cerrar",
          style: "destructive",
          onPress: async () => {
            await closeWeek();
            Alert.alert("Éxito", "Semana cerrada y guardada en el historial");
          },
        },
      ],
    );
  };

  if (!currentWeek) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  const weekStats = calculateWeekStats(currentWeek, workerConfig.hourlyRate);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola, {workerConfig.name}! 👋</Text>
          <Text style={styles.subtitle}>Gestiona tus turnos de la semana</Text>
        </View>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate("Settings")}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-outline" size={24} color={colors.dark} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Week Summary */}
        <WeekSummary
          totalHours={weekStats.totalHours}
          totalPay={weekStats.totalPay}
          normalHours={weekStats.normalHours}
          extraHours={weekStats.extraHours}
          normalPay={weekStats.normalPay}
          extraPay={weekStats.extraPay}
          startDate={currentWeek.startDate}
          endDate={currentWeek.endDate}
        />

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("History")}
            activeOpacity={0.7}
          >
            <Ionicons
              name="calendar-outline"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.actionButtonText}>Historial</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCloseWeek}
            activeOpacity={0.7}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={20}
              color={colors.success}
            />
            <Text style={styles.actionButtonText}>Cerrar Semana</Text>
          </TouchableOpacity>
        </View>

        {/* Days List */}
        <View style={styles.daysContainer}>
          <Text style={styles.sectionTitle}>Días de la Semana</Text>
          {currentWeek.days.map((day) => (
            <View key={day.date}>
              <DayCard day={day} workerConfig={workerConfig} />

              {/* Botón para agregar turno */}
              <TouchableOpacity
                style={styles.addTurnButton}
                onPress={() => handleDayPress(day)}
                activeOpacity={0.7}
              >
                <Ionicons name="add-circle" size={20} color={colors.primary} />
                <Text style={styles.addTurnButtonText}>Agregar Turno</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Footer spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Turn Menu Modal */}
      {showTurnMenu && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowTurnMenu(false)}
          />
          <View style={styles.turnMenu}>
            <View style={styles.turnMenuHeader}>
              <Text style={styles.turnMenuTitle}>
                Selecciona el tipo de turno
              </Text>
              <TouchableOpacity
                onPress={() => setShowTurnMenu(false)}
                style={styles.closeMenuButton}
              >
                <Ionicons name="close" size={24} color={colors.gray} />
              </TouchableOpacity>
            </View>

            <View style={styles.turnMenuOptions}>
              {Object.keys(TURN_TYPES).map((type) => {
                const schedule = TURN_SCHEDULES[type];
                return (
                  <TouchableOpacity
                    key={type}
                    style={styles.turnOption}
                    onPress={() => handleAddTurn(type)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.turnOptionLeft}>
                      <Text style={styles.turnOptionEmoji}>
                        {schedule.emoji}
                      </Text>
                      <View>
                        <Text style={styles.turnOptionLabel}>
                          Turno {schedule.label}
                        </Text>
                        <Text style={styles.turnOptionTime}>
                          {schedule.start} - {schedule.end}
                        </Text>
                      </View>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={colors.gray}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      )}

      {/* Modal de edición de turno */}
      <TurnEditModal
        visible={showEditModal}
        turn={editingTurn}
        onSave={(updatedTurn) => {
          updateTurn(selectedDay.date, editingTurn.type, updatedTurn);
          setShowEditModal(false);
          setEditingTurn(null);
        }}
        onDelete={(turn) => {
          deleteTurn(selectedDay.date, turn.type);
          setShowEditModal(false);
          setEditingTurn(null);
        }}
        onCancel={() => {
          setShowEditModal(false);
          setEditingTurn(null);
        }}
      />
    </View>
  );
};

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingContainer: {
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      fontSize: 16,
      color: colors.gray,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 20,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    greeting: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.dark,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: colors.gray,
    },
    settingsButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.backgroundSecondary,
      justifyContent: "center",
      alignItems: "center",
    },
    scrollView: {
      flex: 1,
    },
    quickActions: {
      flexDirection: "row",
      paddingHorizontal: 20,
      gap: 12,
      marginBottom: 24,
    },
    actionButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 14,
      gap: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    actionButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.dark,
    },
    daysContainer: {
      paddingHorizontal: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.dark,
      marginBottom: 16,
    },
    addTurnButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: `${colors.primary}10`,
      borderRadius: 12,
      padding: 12,
      marginBottom: 16,
      gap: 6,
      borderWidth: 1,
      borderColor: `${colors.primary}30`,
      borderStyle: "dashed",
    },
    addTurnButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.primary,
    },
    modalOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "flex-end",
    },
    modalBackdrop: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.overlay,
    },
    turnMenu: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingBottom: 40,
    },
    turnMenuHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    turnMenuTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.dark,
    },
    closeMenuButton: {
      padding: 4,
    },
    turnMenuOptions: {
      paddingHorizontal: 20,
      paddingTop: 16,
      gap: 12,
    },
    turnOption: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    turnOptionLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    turnOptionEmoji: {
      fontSize: 32,
    },
    turnOptionLabel: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.dark,
      marginBottom: 2,
    },
    turnOptionTime: {
      fontSize: 13,
      color: colors.gray,
    },
  });

export default HomeScreen;
