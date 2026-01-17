import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorageService from '../storage/AsyncStorageService';
import { COLORS, MASTER_PASSWORD } from '../constants';
import { hapticSuccess, hapticError, hapticWarning } from '../utils/haptics';
import CustomAlert from '../components/CustomAlert';
import LoadingScreen from '../components/LoadingScreen';

const SettingsScreen = ({ navigation }) => {
  const [worker, setWorker] = useState(null);
  const [name, setName] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    type: 'info',
    title: '',
    message: '',
    buttons: [],
  });

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
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      hapticError();
      Alert.alert('Error', 'Por favor ingresa tu nombre');
      return;
    }

    const rate = parseFloat(hourlyRate);
    if (isNaN(rate) || rate <= 0) {
      hapticError();
      Alert.alert('Error', 'Por favor ingresa un pago por hora válido');
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
        type: 'success',
        title: '¡Guardado!',
        message: 'Tu configuración se actualizó correctamente',
        buttons: [{ text: 'OK', onPress: () => {}, style: 'default' }],
      });
      setAlertVisible(true);
    } catch (error) {
      console.error('Error saving settings:', error);
      hapticError();
      Alert.alert('Error', 'No se pudo guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    hapticWarning();
    Alert.prompt(
      'Resetear App',
      'Ingresa la contraseña maestra para borrar todos los datos:',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Resetear',
          style: 'destructive',
          onPress: (password) => {
            if (password === MASTER_PASSWORD) {
              confirmReset();
            } else {
              hapticError();
              Alert.alert('Error', 'Contraseña incorrecta');
            }
          },
        },
      ],
      'secure-text'
    );
  };

  const confirmReset = () => {
    setAlertConfig({
      type: 'warning',
      title: '⚠️ ¿Estás seguro?',
      message: 'Se borrarán TODOS los datos:\n\n• Configuración personal\n• Semana actual\n• Historial completo\n\nEsta acción no se puede deshacer.',
      buttons: [
        { text: 'Cancelar', onPress: () => {}, style: 'cancel' },
        {
          text: 'Borrar todo',
          onPress: () => executeReset(),
          style: 'destructive',
        },
      ],
    });
    setAlertVisible(true);
  };

  const executeReset = async () => {
    try {
      await AsyncStorageService.clearAllData();
      hapticSuccess();
      navigation.replace('Welcome');
    } catch (error) {
      console.error('Error resetting app:', error);
      hapticError();
      Alert.alert('Error', 'No se pudo resetear la aplicación');
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

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
        <Text style={styles.headerTitle}>Configuración</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información Personal</Text>

            <View style={styles.inputContainer}>
              <View style={styles.labelRow}>
                <Ionicons name="person" size={20} color={COLORS.primary} />
                <Text style={styles.label}>Nombre</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Tu nombre"
                placeholderTextColor={COLORS.placeholder}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                maxLength={50}
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.labelRow}>
                <Ionicons name="cash" size={20} color={COLORS.success} />
                <Text style={styles.label}>Pago por hora</Text>
              </View>
              <View style={styles.inputWrapper}>
                <Text style={styles.currencySymbol}>S/</Text>
                <TextInput
                  style={[styles.input, styles.inputWithSymbol]}
                  placeholder="10.00"
                  placeholderTextColor={COLORS.placeholder}
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
              <Ionicons name="checkmark-circle" size={24} color={COLORS.white} />
              <Text style={styles.saveButtonText}>
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </Text>
            </TouchableOpacity>
          </View>

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

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Zona de Peligro</Text>

            <TouchableOpacity style={styles.dangerButton} onPress={handleReset}>
              <Ionicons name="trash" size={24} color={COLORS.danger} />
              <View style={styles.dangerButtonText}>
                <Text style={styles.dangerButtonTitle}>Resetear App</Text>
                <Text style={styles.dangerButtonSubtitle}>
                  Borra todos los datos y vuelve a empezar
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={COLORS.danger} />
            </TouchableOpacity>

            <View style={styles.warningBox}>
              <Ionicons name="warning" size={20} color={COLORS.warning} />
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.dark,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.dark,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  inputWithSymbol: {
    paddingLeft: 48,
  },
  currencySymbol: {
    position: 'absolute',
    left: 18,
    top: 18,
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.success,
    zIndex: 1,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
  infoLabel: {
    fontSize: 15,
    color: COLORS.gray,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.dark,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.danger + '30',
    shadowColor: '#000',
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
    fontWeight: 'bold',
    color: COLORS.danger,
    marginBottom: 2,
  },
  dangerButtonSubtitle: {
    fontSize: 13,
    color: COLORS.gray,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    gap: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#92400e',
  },
});

export default SettingsScreen;
