import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useWeek } from "../context/WeekContext";
import { TURN_SCHEDULES } from "../constants";
import {
  formatTime,
  formatDecimalHours,
  isTurnActive,
  getArrivalStatus,
  calculateOvertime,
} from "../utils/timeHelpers";
import { calculateDayStats } from "../utils/calculations";
import TurnTimerModal from "./TurnTimerModal";
import TurnEditModal from "./TurnEditModal";

const { width } = Dimensions.get("window");

const DayCard = ({ day, workerConfig }) => {
  const { colors } = useTheme();
  const { updateTurn, deleteTurn } = useWeek();
  const [activeTimerTurn, setActiveTimerTurn] = useState(null);
  const [editingTurn, setEditingTurn] = useState(null);
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const styles = createStyles(colors);

  // Calcular estadísticas del día
  const dayStats = calculateDayStats(day, workerConfig.hourlyRate);

  const handleTurnPress = (turn) => {
    // Si el turno está activo (sin check-out), mostrar timer
    if (isTurnActive(turn)) {
      setActiveTimerTurn(turn);
      setShowTimerModal(true);
    } else {
      // Si está completo, mostrar editor
      setEditingTurn(turn);
      setShowEditModal(true);
    }
  };

  const handleCheckOut = () => {
    if (!activeTimerTurn) return;

    const updatedTurn = {
      ...activeTimerTurn,
      checkOutTime: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    updateTurn(day.date, activeTimerTurn.type, updatedTurn);
    setShowTimerModal(false);
    setActiveTimerTurn(null);
  };

  const handleSaveEdit = (updatedTurn) => {
    updateTurn(day.date, editingTurn.type, updatedTurn);
    setShowEditModal(false);
    setEditingTurn(null);
  };

  const handleDelete = (turn) => {
    deleteTurn(day.date, turn.type);
    setShowEditModal(false);
    setEditingTurn(null);
  };

  const renderTurnBadge = (turn) => {
    const schedule = TURN_SCHEDULES[turn.type];
    const isActive = isTurnActive(turn);
    const isCompleted = turn.checkInTime && turn.checkOutTime;

    let badgeStyle = [styles.turnBadge];
    let badgeColor = colors[`turn${turn.type}`];

    if (isActive) {
      badgeStyle.push(styles.turnBadgeActive);
    }

    // Obtener estado de llegada si está completo
    const arrivalStatus = isCompleted
      ? getArrivalStatus(turn.checkInTime, turn.type)
      : null;
    const overtime = isCompleted
      ? calculateOvertime(turn.checkInTime, turn.checkOutTime, turn.type)
      : 0;

    return (
      <TouchableOpacity
        key={turn.type}
        style={[
          badgeStyle,
          { backgroundColor: `${badgeColor}20`, borderColor: badgeColor },
        ]}
        onPress={() => handleTurnPress(turn)}
        activeOpacity={0.7}
      >
        <View style={styles.turnBadgeTop}>
          <View style={styles.turnBadgeHeader}>
            <Text style={styles.turnEmoji}>{schedule?.emoji}</Text>
            <Text style={[styles.turnType, { color: badgeColor }]}>
              {turn.type}
            </Text>
            {isActive && (
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>EN VIVO</Text>
              </View>
            )}
          </View>

          {/* Badges adicionales */}
          <View style={styles.turnBadges}>
            {turn.isExtra && (
              <View style={styles.extraBadge}>
                <Ionicons name="flash" size={10} color={colors.warning} />
              </View>
            )}
            {turn.note && (
              <View style={styles.noteBadge}>
                <Ionicons name="document-text" size={10} color={colors.info} />
              </View>
            )}
            {arrivalStatus === "early" && (
              <View style={styles.statusBadge}>
                <Text style={styles.statusEmoji}>⚡</Text>
              </View>
            )}
            {arrivalStatus === "late" && (
              <View style={styles.statusBadge}>
                <Text style={styles.statusEmoji}>⚠️</Text>
              </View>
            )}
          </View>
        </View>

        {/* Información de tiempos */}
        {turn.checkInTime && (
          <View style={styles.turnTimes}>
            <View style={styles.turnTimeRow}>
              <Ionicons
                name="log-in-outline"
                size={12}
                color={colors.success}
              />
              <Text style={styles.turnTimeText}>
                {formatTime(turn.checkInTime)}
              </Text>
            </View>
            {turn.checkOutTime && (
              <>
                <Text style={styles.turnTimeSeparator}>→</Text>
                <View style={styles.turnTimeRow}>
                  <Ionicons
                    name="log-out-outline"
                    size={12}
                    color={colors.danger}
                  />
                  <Text style={styles.turnTimeText}>
                    {formatTime(turn.checkOutTime)}
                  </Text>
                </View>
              </>
            )}
          </View>
        )}

        {/* Horas extras si aplica */}
        {overtime > 0 && (
          <View style={styles.overtimeIndicator}>
            <Ionicons name="flash" size={10} color={colors.warning} />
            <Text style={styles.overtimeText}>
              +{formatDecimalHours(overtime)}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const dayName = new Date(day.date).toLocaleDateString("es-PE", {
    weekday: "long",
  });
  const dayNumber = new Date(day.date).getDate();
  const isToday =
    new Date(day.date).toDateString() === new Date().toDateString();

  return (
    <View style={styles.container}>
      {/* Header del día */}
      <View style={styles.header}>
        <View style={styles.dateContainer}>
          <View style={[styles.dayNumber, isToday && styles.dayNumberToday]}>
            <Text
              style={[
                styles.dayNumberText,
                isToday && styles.dayNumberTextToday,
              ]}
            >
              {dayNumber}
            </Text>
          </View>
          <View>
            <Text style={styles.dayName}>{dayName}</Text>
            {isToday && <Text style={styles.todayLabel}>Hoy</Text>}
          </View>
        </View>

        {/* Resumen del día */}
        {dayStats.totalHours > 0 && (
          <View style={styles.summaryContainer}>
            <View style={styles.summaryItem}>
              <Ionicons name="time-outline" size={14} color={colors.primary} />
              <Text style={styles.summaryText}>
                {formatDecimalHours(dayStats.totalHours)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="cash-outline" size={14} color={colors.success} />
              <Text style={styles.summaryText}>
                S/ {dayStats.totalPay.toFixed(2)}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Turnos */}
      <View style={styles.turnsContainer}>
        {day.turns && day.turns.length > 0 ? (
          <View style={styles.turnsList}>
            {day.turns.map((turn) => renderTurnBadge(turn))}
          </View>
        ) : (
          <Text style={styles.noTurnsText}>Sin turnos registrados</Text>
        )}
      </View>

      {/* Modals */}
      <TurnTimerModal
        visible={showTimerModal}
        turn={activeTimerTurn}
        onCheckOut={handleCheckOut}
        onCancel={() => {
          setShowTimerModal(false);
          setActiveTimerTurn(null);
        }}
      />

      <TurnEditModal
        visible={showEditModal}
        turn={editingTurn}
        onSave={handleSaveEdit}
        onDelete={handleDelete}
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
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    dateContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    dayNumber: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.backgroundSecondary,
      justifyContent: "center",
      alignItems: "center",
    },
    dayNumberToday: {
      backgroundColor: colors.primary,
    },
    dayNumberText: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.dark,
    },
    dayNumberTextToday: {
      color: colors.white,
    },
    dayName: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.dark,
      textTransform: "capitalize",
    },
    todayLabel: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: "600",
    },
    summaryContainer: {
      flexDirection: "row",
      gap: 12,
    },
    summaryItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    summaryText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.dark,
    },
    turnsContainer: {
      minHeight: 60,
    },
    turnsList: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    turnBadge: {
      borderRadius: 12,
      padding: 10,
      borderWidth: 1.5,
      minWidth: 100,
    },
    turnBadgeActive: {
      borderWidth: 2,
    },
    turnBadgeTop: {
      marginBottom: 8,
    },
    turnBadgeHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 6,
    },
    turnEmoji: {
      fontSize: 18,
    },
    turnType: {
      fontSize: 16,
      fontWeight: "bold",
    },
    liveIndicator: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginLeft: "auto",
    },
    liveDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.danger,
    },
    liveText: {
      fontSize: 9,
      fontWeight: "bold",
      color: colors.danger,
    },
    turnBadges: {
      flexDirection: "row",
      gap: 4,
    },
    extraBadge: {
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: `${colors.warning}30`,
      justifyContent: "center",
      alignItems: "center",
    },
    noteBadge: {
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: `${colors.info}30`,
      justifyContent: "center",
      alignItems: "center",
    },
    statusBadge: {
      width: 18,
      height: 18,
      borderRadius: 9,
      justifyContent: "center",
      alignItems: "center",
    },
    statusEmoji: {
      fontSize: 12,
    },
    turnTimes: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    turnTimeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    turnTimeText: {
      fontSize: 11,
      fontWeight: "500",
      color: colors.dark,
    },
    turnTimeSeparator: {
      fontSize: 11,
      color: colors.gray,
    },
    overtimeIndicator: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginTop: 6,
      paddingTop: 6,
      borderTopWidth: 1,
      borderTopColor: `${colors.warning}30`,
    },
    overtimeText: {
      fontSize: 10,
      fontWeight: "bold",
      color: colors.warning,
    },
    noTurnsText: {
      fontSize: 14,
      color: colors.gray,
      textAlign: "center",
      paddingVertical: 20,
    },
  });

export default DayCard;
