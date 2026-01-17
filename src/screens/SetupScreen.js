import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorageService from '../storage/AsyncStorageService';
import { COLORS, DEFAULT_TURN_CONFIG } from '../constants';
import { hapticLight, hapticError } from '../utils/haptics';
import CustomAlert from '../components/CustomAlert';

const { width, height } = Dimensions.get('window');

const SetupScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [hourlyRate, setHourlyRate] = useState('10');
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    type: 'error',
    title: '',
    message: '',
  });

  const showAlert = (type, title, message) => {
    setAlertConfig({ type, title, message });
    setAlertVisible(true);
  };

  const handleComplete = async () => {
    if (!name.trim()) {
      hapticError();
      showAlert('error', 'Error', 'Por favor ingresa tu nombre');
      return;
    }

    const rate = parseFloat(hourlyRate);
    if (isNaN(rate) || rate <= 0) {
      hapticError();
      showAlert('error', 'Error', 'Por favor ingresa un pago por hora válido');
      return;
    }

    hapticLight();
    setLoading(true);

    try {
      const config = {
        name: name.trim(),
        hourlyRate: rate,
        turnConfig: DEFAULT_TURN_CONFIG,
        weekSchedule: [],
        setupCompleted: false,
      };

      await AsyncStorageService.saveWorkerConfig(config);
      navigation.navigate('SetupSchedule');
    } catch (error) {
      console.error('Error saving setup:', error);
      hapticError();
      showAlert('error', 'Error', 'No se pudo guardar la configuración');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.emojiContainer}>
                <Text style={styles.emoji}>👋</Text>
              </View>
              <Text style={styles.title}>¡Bienvenido!</Text>
              <Text style={styles.subtitle}>
                Configura tu aplicación para comenzar
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <View style={styles.labelRow}>
                  <Ionicons name="person" size={20} color={COLORS.primary} />
                  <Text style={styles.label}>¿Cómo te llamas?</Text>
                </View>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Tu nombre"
                    placeholderTextColor={COLORS.placeholder}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    autoCorrect={false}
                    maxLength={50}
                  />
                </View>
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
                <Text style={styles.hint}>
                  💡 Este valor se puede cambiar después en ajustes
                </Text>
              </View>

              <View style={styles.infoBox}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="time" size={24} color={COLORS.info} />
                </View>
                <Text style={styles.infoText}>
                  En el siguiente paso configurarás tus días de trabajo y turnos habituales
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleComplete}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Guardando...' : 'Siguiente'}
            </Text>
            <Ionicons name="arrow-forward" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <CustomAlert
        visible={alertVisible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={[{ text: 'Entendido', onPress: () => {}, style: 'default' }]}
        onClose={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Math.min(24, width * 0.06),
    paddingTop: height * 0.03,
  },
  header: {
    alignItems: 'center',
    marginBottom: height * 0.04,
  },
  emojiContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emoji: {
    fontSize: 50,
  },
  title: {
    fontSize: Math.min(32, width * 0.08),
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 24,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 14,
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
  hint: {
    fontSize: 13,
    color: COLORS.gray,
    marginTop: 8,
    paddingLeft: 4,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: `${COLORS.info}10`,
    borderRadius: 14,
    padding: 16,
    marginTop: 12,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.info,
  },
  infoIconContainer: {
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.darkSecondary,
    lineHeight: 20,
  },
  buttonContainer: {
    padding: Math.min(20, width * 0.05),
    paddingBottom: Platform.OS === 'ios' ? 10 : 20,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  button: {
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
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SetupScreen;
