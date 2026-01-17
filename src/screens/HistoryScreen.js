import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorageService from '../storage/AsyncStorageService';
import { COLORS } from '../constants';
import { formatHours, formatMoney } from '../utils/calculations';
import LoadingScreen from '../components/LoadingScreen';

const HistoryScreen = ({ navigation }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const weekHistory = await AsyncStorageService.getWeekHistory();
      setHistory(weekHistory);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
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
        <Text style={styles.headerTitle}>Historial</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {history.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="time-outline" size={64} color={COLORS.gray} />
              </View>
              <Text style={styles.emptyTitle}>Sin historial</Text>
              <Text style={styles.emptySubtitle}>
                Aquí aparecerán tus semanas anteriores cuando completes tu primera semana de trabajo
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.sectionTitle}>
                Semanas completadas ({history.length})
              </Text>
              {history.map((week, index) => (
                <View key={week.id} style={styles.weekCard}>
                  <View style={styles.weekHeader}>
                    <View style={styles.weekBadge}>
                      <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                      <Text style={styles.weekBadgeText}>Completada</Text>
                    </View>
                    <Text style={styles.weekNumber}>Semana #{history.length - index}</Text>
                  </View>

                  <Text style={styles.weekDate}>
                    {new Date(week.startDate).toLocaleDateString('es-PE', {
                      day: 'numeric',
                      month: 'long',
                    })}
                    {' - '}
                    {new Date(week.endDate).toLocaleDateString('es-PE', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Text>

                  <View style={styles.weekStats}>
                    <View style={styles.statItem}>
                      <Ionicons name="time" size={20} color={COLORS.primary} />
                      <Text style={styles.statValue}>{formatHours(week.totalHours)}</Text>
                      <Text style={styles.statLabel}>trabajadas</Text>
                    </View>

                    <View style={styles.statDivider} />

                    <View style={styles.statItem}>
                      <Ionicons name="cash" size={20} color={COLORS.success} />
                      <Text style={[styles.statValue, styles.moneyValue]}>
                        {formatMoney(week.totalPay)}
                      </Text>
                      <Text style={styles.statLabel}>cobrado</Text>
                    </View>
                  </View>
                </View>
              ))}
            </>
          )}
        </View>
      </ScrollView>
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    marginBottom: 20,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 16,
  },
  weekCard: {
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
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  weekBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  weekBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.success,
  },
  weekNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray,
  },
  weekDate: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 16,
    textTransform: 'capitalize',
  },
  weekStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: COLORS.border,
    marginHorizontal: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 6,
    marginBottom: 2,
  },
  moneyValue: {
    color: COLORS.success,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray,
  },
});

export default HistoryScreen;
