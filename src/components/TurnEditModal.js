import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "../context/ThemeContext";
import { TURN_SCHEDULES, VALIDATIONS } from "../constants";
import {
  formatTime,
  formatTime24,
  timeStringToDate,
} from "../utils/timeHelpers";

const TurnEditModal = ({ visible, turn, onSave, onDelete, onCancel }) => {
  const { colors } = useTheme();
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [isExtra, setIsExtra] = useState(false);
  const [note, setNote] = useState("");
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);

  useEffect(() => {
    if (visible && turn) {
      setCheckInTime(turn.checkInTime ? new Date(turn.checkInTime) : null);
      setCheckOutTime(turn.checkOutTime ? new Date(turn.checkOutTime) : null);
      setIsExtra(turn.isExtra || false);
      setNote(turn.note || "");
    }
  }, [visible, turn]);

  const handleSave = () => {
    if (!checkInTime || !checkOutTime) {
      alert("Debes ingresar hora de entrada y salida");
      return;
    }

    if (checkOutTime <= checkInTime) {
      alert("La hora de salida debe ser posterior a la entrada");
      return;
    }

    onSave({
      ...turn,
      checkInTime: checkInTime.toISOString(),
      checkOutTime: checkOutTime.toISOString(),
      isExtra,
      note,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleSetSuggestedTimes = () => {
    const schedule = TURN_SCHEDULES[turn.type];
    if (!schedule) return;

    const today = new Date();
    const suggestedCheckIn = timeStringToDate(schedule.start, today);
    const suggestedCheckOut = timeStringToDate(schedule.end, today);

    setCheckInTime(suggestedCheckIn);
    setCheckOutTime(suggestedCheckOut);
  };

  if (!turn) return null;

  const schedule = TURN_SCHEDULES[turn.type];
  const styles = createStyles(colors);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.emoji}>{schedule?.emoji}</Text>
              <Text style={styles.title}>Editar Turno {schedule?.label}</Text>
            </View>
            <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.gray} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Suggested Times Button */}
            <TouchableOpacity
              style={styles.suggestedButton}
              onPress={handleSetSuggestedTimes}
              activeOpacity={0.7}
            >
              <Ionicons name="time-outline" size={20} color={colors.primary} />
              <Text style={styles.suggestedButtonText}>
                Usar horario sugerido ({schedule?.start} - {schedule?.end})
              </Text>
            </TouchableOpacity>

            {/* Check-in Time */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Hora de Entrada</Text>
              <TouchableOpacity
                style={styles.timeInput}
                onPress={() => setShowCheckInPicker(true)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="log-in-outline"
                  size={20}
                  color={colors.success}
                />
                <Text style={styles.timeInputText}>
                  {checkInTime ? formatTime(checkInTime) : "Seleccionar hora"}
                </Text>
                <Ionicons name="chevron-down" size={20} color={colors.gray} />
              </TouchableOpacity>
            </View>

            {/* Check-out Time */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Hora de Salida</Text>
              <TouchableOpacity
                style={styles.timeInput}
                onPress={() => setShowCheckOutPicker(true)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="log-out-outline"
                  size={20}
                  color={colors.danger}
                />
                <Text style={styles.timeInputText}>
                  {checkOutTime ? formatTime(checkOutTime) : "Seleccionar hora"}
                </Text>
                <Ionicons name="chevron-down" size={20} color={colors.gray} />
              </TouchableOpacity>
            </View>

            {/* Extra Hours Toggle */}
            <View style={styles.section}>
              <View style={styles.toggleContainer}>
                <View style={styles.toggleLeft}>
                  <Ionicons
                    name="flash"
                    size={20}
                    color={isExtra ? colors.warning : colors.gray}
                  />
                  <View>
                    <Text style={styles.toggleLabel}>Horas Extra</Text>
                    <Text style={styles.toggleDescription}>
                      Pago con multiplicador de 1.5x
                    </Text>
                  </View>
                </View>
                <Switch
                  value={isExtra}
                  onValueChange={setIsExtra}
                  trackColor={{ false: colors.disabled, true: colors.warning }}
                  thumbColor={colors.white}
                />
              </View>
            </View>

            {/* Note Input */}
            <View style={styles.section}>
              <View style={styles.noteHeader}>
                <Text style={styles.sectionLabel}>Nota (opcional)</Text>
                <Text style={styles.characterCount}>
                  {note.length}/{VALIDATIONS.MAX_NOTE_LENGTH}
                </Text>
              </View>
              <TextInput
                style={styles.noteInput}
                placeholder="Ej: Trabajo extra por proyecto urgente"
                placeholderTextColor={colors.placeholder}
                value={note}
                onChangeText={setNote}
                maxLength={VALIDATIONS.MAX_NOTE_LENGTH}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Delete Button */}
            {onDelete && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => {
                  if (confirm("¿Estás seguro de eliminar este turno?")) {
                    onDelete(turn);
                  }
                }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color={colors.danger}
                />
                <Text style={styles.deleteButtonText}>Eliminar Turno</Text>
              </TouchableOpacity>
            )}
          </ScrollView>

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
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={colors.white}
              />
              <Text style={styles.saveButtonText}>Guardar</Text>
            </TouchableOpacity>
          </View>

          {/* DateTimePicker for Check-in */}
          {showCheckInPicker && (
            <DateTimePicker
              value={checkInTime || new Date()}
              mode="time"
              is24Hour={false}
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, selectedDate) => {
                setShowCheckInPicker(Platform.OS === "ios");
                if (selectedDate) {
                  setCheckInTime(selectedDate);
                }
              }}
            />
          )}

          {/* DateTimePicker for Check-out */}
          {showCheckOutPicker && (
            <DateTimePicker
              value={checkOutTime || new Date()}
              mode="time"
              is24Hour={false}
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, selectedDate) => {
                setShowCheckOutPicker(Platform.OS === "ios");
                if (selectedDate) {
                  setCheckOutTime(selectedDate);
                }
              }}
            />
          )}
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
      justifyContent: "flex-end",
    },
    container: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: 20,
      paddingBottom: 20,
      maxHeight: "90%",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    titleContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    emoji: {
      fontSize: 28,
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.dark,
    },
    closeButton: {
      padding: 4,
    },
    content: {
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    suggestedButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: `${colors.primary}10`,
      borderRadius: 12,
      padding: 14,
      marginBottom: 20,
      gap: 8,
      borderWidth: 1,
      borderColor: `${colors.primary}30`,
    },
    suggestedButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.primary,
    },
    section: {
      marginBottom: 20,
    },
    sectionLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.dark,
      marginBottom: 8,
    },
    timeInput: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 12,
      padding: 16,
      gap: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    timeInputText: {
      flex: 1,
      fontSize: 16,
      color: colors.dark,
      fontWeight: "500",
    },
    toggleContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    toggleLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      flex: 1,
    },
    toggleLabel: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.dark,
    },
    toggleDescription: {
      fontSize: 12,
      color: colors.gray,
      marginTop: 2,
    },
    noteHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    characterCount: {
      fontSize: 12,
      color: colors.gray,
    },
    noteInput: {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 12,
      padding: 16,
      fontSize: 14,
      color: colors.dark,
      minHeight: 80,
      textAlignVertical: "top",
      borderWidth: 1,
      borderColor: colors.border,
    },
    deleteButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: `${colors.danger}10`,
      borderRadius: 12,
      padding: 14,
      gap: 8,
      marginTop: 8,
      borderWidth: 1,
      borderColor: `${colors.danger}30`,
    },
    deleteButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.danger,
    },
    buttonContainer: {
      flexDirection: "row",
      paddingHorizontal: 20,
      paddingTop: 20,
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
    saveButton: {
      backgroundColor: colors.primary,
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.white,
    },
  });

export default TurnEditModal;
