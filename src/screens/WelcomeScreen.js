import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorageService from '../storage/AsyncStorageService';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSetup();
  }, []);

  const checkSetup = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const workerConfig = await AsyncStorageService.getWorkerConfig();

      if (workerConfig && workerConfig.setupCompleted) {
        navigation.replace('Home');
      } else {
        navigation.replace('Setup');
      }
    } catch (error) {
      console.error('Error checking setup:', error);
      navigation.replace('Setup');
    } finally {
      setLoading(false);
    }
  };

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      <View style={[styles.background, { backgroundColor: colors.primary }]} />
      
      <SafeAreaView style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>⏰</Text>
          </View>
          <Text style={styles.title}>TurnosApp</Text>
          <Text style={styles.subtitle}>
            Control de turnos y pagos
          </Text>
          <Text style={styles.version}>v1.0.0</Text>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.white} />
            <Text style={styles.loadingText}>Cargando...</Text>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
};

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: height * 0.1,
  },
  iconCircle: {
    width: Math.min(140, width * 0.35),
    height: Math.min(140, width * 0.35),
    borderRadius: Math.min(70, width * 0.175),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  iconText: {
    fontSize: Math.min(70, width * 0.17),
  },
  title: {
    fontSize: Math.min(48, width * 0.12),
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    fontWeight: '500',
  },
  version: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 12,
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: colors.white,
    fontWeight: '500',
  },
});

export default WelcomeScreen;
