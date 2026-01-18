import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { TURN_SCHEDULES } from "../constants";
import {
  formatTime,
  getActiveTurnDuration,
  formatMinutesToHours,
} from "../utils/timeHelpers";

const { width } = Dimensions.get("window");

const TurnTimerModal = ({ visible, turn, onCheckOut, onCancel }) => {
  const { colors } = useTheme();
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    if (!visible || !turn || !turn.checkInTime) return;

    // Actualizar tiempo cada segundo
    const interval = setInterval(() => {
      const minutes = getActiveTurnDuration(turn.checkInTime);
      setElapsedMinutes(minutes);
    }, 1000);

    // Animación de pulso
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();

    return () => {
      clearInterval(interval);
      pulse.stop();
    };
  }, [visible, turn]);

  if (!turn) return null;

  const schedule = TURN_SCHEDULES[turn.type];
  const styles = createStyles(colors);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.turnBadge}>
              <Text style={styles.turnEmoji}>{schedule?.emoji}</Text>
              <Text style={styles.turnLabel}>Turno {schedule?.label}</Text>
            </View>
            <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.gray} />
            </TouchableOpacity>
          </View>

          {/* Timer Display */}
          <View style={styles.timerContainer}>
            <Animated.View
              style={[
                styles.timerCircle,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <View style={styles.recordingDot} />
              <Text style={styles.timerText}>
                {formatMinutesToHours(elapsedMinutes)}
              </Text>
              <Text style={styles.timerLabel}>Tiempo trabajado</Text>
            </Animated.View>
          </View>

          {/* Info Cards */}
          <View style={styles.infoContainer}>
            <View style={styles.infoCard}>
              <Ionicons
                name="log-in-outline"
                size={20}
                color={colors.success}
              />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Entrada</Text>
                <Text style={styles.infoValue}>
                  {formatTime(turn.checkInTime)}
                </Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <Ionicons name="time-outline" size={20} color={colors.primary} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Esperado</Text>
                <Text style={styles.infoValue}>
                  {schedule?.start} - {schedule?.end}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.checkOutButton]}
              onPress={onCheckOut}
              activeOpacity={0.8}
            >
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={colors.white}
              />
              <Text style={styles.checkOutButtonText}>Finalizar Turno</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (colors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    container: {
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 24,
      width: "100%",
      maxWidth: 400,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 24,
    },
    turnBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    turnEmoji: {
      fontSize: 24,
    },
    turnLabel: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.dark,
    },
    closeButton: {
      padding: 4,
    },
    timerContainer: {
      alignItems: "center",
      marginBottom: 32,
    },
    timerCircle: {
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: `${colors.primary}10`,
      borderWidth: 4,
      borderColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
    },
    recordingDot: {
      position: "absolute",
      top: 20,
      right: 20,
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.danger,
    },
    timerText: {
      fontSize: 36,
      fontWeight: "bold",
      color: colors.primary,
      marginBottom: 4,
    },
    timerLabel: {
      fontSize: 14,
      color: colors.gray,
    },
    infoContainer: {
      gap: 12,
      marginBottom: 24,
    },
    infoCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 12,
      padding: 16,
      gap: 12,
    },
    infoTextContainer: {
      flex: 1,
    },
    infoLabel: {
      fontSize: 12,
      color: colors.gray,
      marginBottom: 2,
    },
    infoValue: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.dark,
    },
    buttonContainer: {
      flexDirection: "row",
      gap: 12,
    },
    button: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
      borderRadius: 12,
      gap: 8,
    },
    cancelButton: {
      backgroundColor: colors.backgroundSecondary,
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.gray,
    },
    checkOutButton: {
      backgroundColor: colors.success,
    },
    checkOutButtonText: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.white,
    },
  });

export default TurnTimerModal;
