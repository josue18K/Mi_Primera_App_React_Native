import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  Platform,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorageService from "../storage/AsyncStorageService";
import { MASTER_PASSWORD, STORAGE_KEYS } from "../constants";
import {
  hapticSuccess,
  hapticError,
  hapticWarning,
  hapticLight,
} from "../utils/haptics";
import CustomAlert from "../components/CustomAlert";
import LoadingScreen from "../components/LoadingScreen";
import { useTheme } from "../context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SettingsScreen = ({ navigation }) => {
  const { isDark, toggleTheme, colors } = useTheme();
  const [worker, setWorker] = useState(null);
  const [name, setName] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    type: "info",
    title: "",
    message: "",
    buttons: [],
  });
  const [resetPasswordModalVisible, setResetPasswordModalVisible] =
    useState(false);
  const [resetPassword, setResetPassword] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const workerConfig = await AsyncStorageService.getWorkerConfig();
      if (workerConfig) {
        setWorker(workerConfig);
        setName(workerConfig.name);
        setHourlyRate(workerConfig.hourlyRate.toString());
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      hapticError();
      Alert.alert("Error", "Por favor ingresa tu nombre");
      return;
    }

    const rate = parseFloat(hourlyRate);
    if (isNaN(rate) || rate <= 0) {
      hapticError();
      Alert.alert("Error", "Por favor ingresa un pago por hora válido");
      return;
    }

    setSaving(true);

    try {
      const updatedConfig = {
        ...worker,
        name: name.trim(),
        hourlyRate: rate,
      };

      await AsyncStorageService.saveWorkerConfig(updatedConfig);
      setWorker(updatedConfig);

      hapticSuccess();
      setAlertConfig({
        type: "success",
        title: "¡Guardado!",
        message: "Tu configuración se actualizó correctamente",
        buttons: [{ text: "OK", onPress: () => {}, style: "default" }],
      });
      setAlertVisible(true);
    } catch (error) {
      console.error("Error saving settings:", error);
      hapticError();
      Alert.alert("Error", "No se pudo guardar la configuración");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleTheme = () => {
    hapticLight();
    toggleTheme();
  };

  const handleReset = () => {
    hapticWarning();
    setResetPasswordModalVisible(true);
  };

  const validateAndReset = () => {
    if (resetPassword === MASTER_PASSWORD) {
      setResetPasswordModalVisible(false);
      setResetPassword("");
      confirmReset();
    } else {
      hapticError();
      Alert.alert("Error", "Contraseña incorrecta");
      setResetPassword("");
    }
  };

  const confirmReset = () => {
    setAlertConfig({
      type: "warning",
      title: "⚠️ ¿Estás seguro?",
      message:
        "Se borrarán TODOS los datos:\n\n• Configuración personal\n• Semana actual\n• Historial completo\n• Preferencias de tema\n\nEsta acción no se puede deshacer.",
      buttons: [
        { text: "Cancelar", onPress: () => {}, style: "cancel" },
        {
          text: "Borrar todo",
          onPress: () => executeReset(),
          style: "destructive",
        },
      ],
    });
    setAlertVisible(true);
  };

  const executeReset = async () => {
    try {
      await AsyncStorageService.clearAllData();
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.THEME,
        STORAGE_KEYS.NOTIFICATIONS_ENABLED,
      ]);
      hapticSuccess();
      navigation.replace("Welcome");
    } catch (error) {
      console.error("Error resetting app:", error);
      hapticError();
      Alert.alert("Error", "No se pudo resetear la aplicación");
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.white}
      />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configuración</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Sección: Apariencia */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Apariencia</Text>

            <View style={styles.settingCard}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Ionicons
                    name={isDark ? "moon" : "sunny"}
                    size={24}
                    color={isDark ? colors.warning : colors.warning}
                  />
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Modo oscuro</Text>
                    <Text style={styles.settingSubtitle}>
                      {isDark ? "Tema oscuro activado" : "Tema claro activado"}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={isDark}
                  onValueChange={handleToggleTheme}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.white}
                />
              </View>
            </View>
          </View>

          {/* Sección: Información Personal */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información Personal</Text>

            <View style={styles.inputContainer}>
              <View style={styles.labelRow}>
                <Ionicons name="person" size={20} color={colors.primary} />
                <Text style={styles.label}>Nombre</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Tu nombre"
                placeholderTextColor={colors.placeholder}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                maxLength={50}
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.labelRow}>
                <Ionicons name="cash" size={20} color={colors.success} />
                <Text style={styles.label}>Pago por hora</Text>
              </View>
              <View style={styles.inputWrapper}>
                <Text style={styles.currencySymbol}>S/</Text>
                <TextInput
                  style={[styles.input, styles.inputWithSymbol]}
                  placeholder="10.00"
                  placeholderTextColor={colors.placeholder}
                  value={hourlyRate}
                  onChangeText={setHourlyRate}
                  keyboardType="decimal-pad"
                  maxLength={10}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={colors.white}
              />
              <Text style={styles.saveButtonText}>
                {saving ? "Guardando..." : "Guardar Cambios"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Sección: Horas Extras */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Horas Extras</Text>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={styles.infoRowLeft}>
                  <Ionicons name="flash" size={20} color={colors.warning} />
                  <Text style={styles.infoLabel}>Multiplicador</Text>
                </View>
                <Text style={styles.infoValue}>1.5x (+50%)</Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <View style={styles.infoRowLeft}>
                  <Ionicons name="calculator" size={20} color={colors.info} />
                  <Text style={styles.infoLabel}>Ejemplo</Text>
                </View>
                <Text style={styles.infoValue}>
                  S/ {(parseFloat(hourlyRate || 0) * 1.5).toFixed(2)}/h
                </Text>
              </View>
            </View>

            <View style={styles.warningBox}>
              <Ionicons
                name="information-circle"
                size={20}
                color={colors.info}
              />
              <Text style={styles.warningText}>
                Las horas marcadas como "extra" se pagan con un 50% adicional
                sobre tu tarifa normal
              </Text>
            </View>
          </View>

          {/* Sección: Información de la App */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información de la App</Text>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Versión</Text>
                <Text style={styles.infoValue}>1.0.0</Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Desarrollador</Text>
                <Text style={styles.infoValue}>Josue</Text>
              </View>
            </View>
          </View>

          {/* Sección: Zona de Peligro */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Zona de Peligro</Text>

            <TouchableOpacity style={styles.dangerButton} onPress={handleReset}>
              <Ionicons name="trash" size={24} color={colors.danger} />
              <View style={styles.dangerButtonText}>
                <Text style={styles.dangerButtonTitle}>Resetear App</Text>
                <Text style={styles.dangerButtonSubtitle}>
                  Borra todos los datos y vuelve a empezar
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={24}
                color={colors.danger}
              />
            </TouchableOpacity>

            <View style={styles.warningBox}>
              <Ionicons name="warning" size={20} color={colors.warning} />
              <Text style={styles.warningText}>
                Se requiere contraseña maestra para resetear
              </Text>
            </View>
          </View>
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

      {/* Modal de contraseña para reset */}
      {resetPasswordModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.passwordModal}>
            <Text style={styles.passwordModalTitle}>Contraseña Maestra</Text>
            <Text style={styles.passwordModalSubtitle}>
              Ingresa la contraseña para resetear la aplicación
            </Text>

            <TextInput
              style={styles.passwordInput}
              placeholder="Contraseña"
              placeholderTextColor={colors.placeholder}
              value={resetPassword}
              onChangeText={setResetPassword}
              secureTextEntry
              autoFocus
            />

            <View style={styles.passwordModalButtons}>
              <TouchableOpacity
                style={[
                  styles.passwordModalButton,
                  styles.cancelPasswordButton,
                ]}
                onPress={() => {
                  setResetPasswordModalVisible(false);
                  setResetPassword("");
                }}
              >
                <Text style={styles.cancelPasswordButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.passwordModalButton,
                  styles.confirmPasswordButton,
                ]}
                onPress={validateAndReset}
              >
                <Text style={styles.confirmPasswordButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundSecondary,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 16,
      backgroundColor: colors.white,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      width: 44,
      height: 44,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 12,
      backgroundColor: colors.backgroundSecondary,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.dark,
    },
    content: {
      padding: 16,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.dark,
      marginBottom: 16,
    },
    settingCard: {
      backgroundColor: colors.white,
      borderRadius: 12,
      padding: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    settingRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    settingInfo: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      gap: 12,
    },
    settingText: {
      flex: 1,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.dark,
      marginBottom: 2,
    },
    settingSubtitle: {
      fontSize: 13,
      color: colors.gray,
    },
    inputContainer: {
      marginBottom: 16,
    },
    labelRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
      gap: 8,
    },
    label: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.dark,
    },
    inputWrapper: {
      position: "relative",
    },
    input: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: colors.dark,
      borderWidth: 2,
      borderColor: colors.border,
    },
    inputWithSymbol: {
      paddingLeft: 48,
    },
    currencySymbol: {
      position: "absolute",
      left: 18,
      top: 18,
      fontSize: 16,
      fontWeight: "bold",
      color: colors.success,
      zIndex: 1,
    },
    saveButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginTop: 8,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    saveButtonDisabled: {
      opacity: 0.6,
    },
    saveButtonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: "bold",
    },
    infoCard: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 8,
    },
    infoDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 8,
    },
    infoLabel: {
      fontSize: 15,
      color: colors.gray,
    },
    infoValue: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.dark,
    },
    dangerButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      borderWidth: 2,
      borderColor: colors.danger + "30",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    dangerButtonText: {
      flex: 1,
      marginLeft: 12,
    },
    dangerButtonTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.danger,
      marginBottom: 2,
    },
    dangerButtonSubtitle: {
      fontSize: 13,
      color: colors.gray,
    },
    warningBox: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#fef3c7",
      borderRadius: 12,
      padding: 12,
      marginTop: 12,
      gap: 8,
    },
    warningText: {
      flex: 1,
      fontSize: 13,
      color: "#92400e",
    },
    infoRowLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    modalOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    passwordModal: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 24,
      width: "100%",
      maxWidth: 400,
    },
    passwordModalTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.dark,
      marginBottom: 8,
    },
    passwordModalSubtitle: {
      fontSize: 14,
      color: colors.gray,
      marginBottom: 20,
    },
    passwordInput: {
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: colors.dark,
      borderWidth: 2,
      borderColor: colors.border,
      marginBottom: 20,
    },
    passwordModalButtons: {
      flexDirection: "row",
      gap: 12,
    },
    passwordModalButton: {
      flex: 1,
      padding: 16,
      borderRadius: 12,
      alignItems: "center",
    },
    cancelPasswordButton: {
      backgroundColor: colors.backgroundSecondary,
    },
    cancelPasswordButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.gray,
    },
    confirmPasswordButton: {
      backgroundColor: colors.danger,
    },
    confirmPasswordButtonText: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.white,
    },
  });

export default SettingsScreen;
