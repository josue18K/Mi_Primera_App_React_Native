import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../constants';
import { formatHours, formatMoney } from '../utils/calculations';

const { width } = Dimensions.get('window');

const WeekSummary = ({ totalHours, totalPay, startDate, endDate }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Semana Actual</Text>
        <Text style={styles.dateRange}>
          {new Date(startDate).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}
          {' - '}
          {new Date(endDate).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <View style={[styles.statIcon, { backgroundColor: `${COLORS.primary}20` }]}>
            <Text style={styles.statIconText}>⏱️</Text>
          </View>
          <Text style={styles.statValue}>{formatHours(totalHours)}</Text>
          <Text style={styles.statLabel}>Total Horas</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statBox}>
          <View style={[styles.statIcon, { backgroundColor: `${COLORS.success}20` }]}>
            <Text style={styles.statIconText}>💰</Text>
          </View>
          <Text style={[styles.statValue, styles.moneyValue]}>
            {formatMoney(totalPay)}
          </Text>
          <Text style={styles.statLabel}>A Cobrar</Text>
        </View>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoIcon}>📅</Text>
        <Text style={styles.infoText}>
          Cobrarás el próximo miércoles
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 4,
  },
  dateRange: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIconText: {
    fontSize: 24,
  },
  divider: {
    width: 1,
    height: 70,
    backgroundColor: COLORS.border,
    marginHorizontal: 8,
  },
  statValue: {
    fontSize: Math.min(26, width * 0.065),
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  moneyValue: {
    color: COLORS.success,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.gray,
    fontWeight: '500',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.primary}10`,
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.darkSecondary,
    fontWeight: '500',
  },
});

export default WeekSummary;
