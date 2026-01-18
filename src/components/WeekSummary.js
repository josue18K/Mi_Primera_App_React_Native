import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatHours, formatMoney } from '../utils/calculations';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const WeekSummary = ({ 
  totalHours, 
  totalPay, 
  normalHours = 0, 
  extraHours = 0,
  normalPay = 0,
  extraPay = 0,
  startDate, 
  endDate 
}) => {
  const { colors } = useTheme();
  const [showDetails, setShowDetails] = useState(false);
  const hasExtraHours = extraHours > 0;
  
  const styles = createStyles(colors);

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
          <View style={[styles.statIcon, { backgroundColor: `${colors.primary}20` }]}>
            <Text style={styles.statIconText}>⏱️</Text>
          </View>
          <Text style={styles.statValue}>{formatHours(totalHours)}</Text>
          <Text style={styles.statLabel}>Total Horas</Text>
          
          {hasExtraHours && (
            <View style={styles.extraBadge}>
              <Ionicons name="flash" size={12} color={colors.warning} />
              <Text style={styles.extraBadgeText}>{formatHours(extraHours)}</Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.statBox}>
          <View style={[styles.statIcon, { backgroundColor: `${colors.success}20` }]}>
            <Text style={styles.statIconText}>💰</Text>
          </View>
          <Text style={[styles.statValue, styles.moneyValue]}>
            {formatMoney(totalPay)}
          </Text>
          <Text style={styles.statLabel}>A Cobrar</Text>
          
          {hasExtraHours && (
            <View style={[styles.extraBadge, styles.extraBadgeMoney]}>
              <Ionicons name="flash" size={12} color={colors.warning} />
              <Text style={styles.extraBadgeText}>+{formatMoney(extraPay)}</Text>
            </View>
          )}
        </View>
      </View>

      {hasExtraHours && (
        <TouchableOpacity 
          style={styles.detailsButton}
          onPress={() => setShowDetails(!showDetails)}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={showDetails ? "chevron-up" : "chevron-down"} 
            size={20} 
            color={colors.primary} 
          />
          <Text style={styles.detailsButtonText}>
            {showDetails ? 'Ocultar detalles' : 'Ver detalles'}
          </Text>
        </TouchableOpacity>
      )}

      {showDetails && hasExtraHours && (
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="time-outline" size={16} color={colors.primary} />
            </View>
            <Text style={styles.detailLabel}>Horas normales</Text>
            <Text style={styles.detailValue}>{formatHours(normalHours)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <View style={[styles.detailIcon, { backgroundColor: `${colors.warning}20` }]}>
              <Ionicons name="flash" size={16} color={colors.warning} />
            </View>
            <Text style={styles.detailLabel}>Horas extras (+50%)</Text>
            <Text style={[styles.detailValue, styles.extraValue]}>
              {formatHours(extraHours)}
            </Text>
          </View>

          <View style={styles.detailDivider} />

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="cash-outline" size={16} color={colors.success} />
            </View>
            <Text style={styles.detailLabel}>Pago normal</Text>
            <Text style={styles.detailValue}>{formatMoney(normalPay)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <View style={[styles.detailIcon, { backgroundColor: `${colors.warning}20` }]}>
              <Ionicons name="flash" size={16} color={colors.warning} />
            </View>
            <Text style={styles.detailLabel}>Pago extras</Text>
            <Text style={[styles.detailValue, styles.extraValue]}>
              {formatMoney(extraPay)}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.infoBox}>
        <Text style={styles.infoIcon}>📅</Text>
        <Text style={styles.infoText}>
          Cobrarás el próximo miércoles
        </Text>
      </View>
    </View>
  );
};

const createStyles = (colors) => StyleSheet.create({
  container: {
    backgroundColor: colors.card,
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
    color: colors.dark,
    marginBottom: 4,
  },
  dateRange: {
    fontSize: 14,
    color: colors.gray,
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
    position: 'relative',
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
    backgroundColor: colors.border,
    marginHorizontal: 8,
  },
  statValue: {
    fontSize: Math.min(26, width * 0.065),
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  moneyValue: {
    color: colors.success,
  },
  statLabel: {
    fontSize: 13,
    color: colors.gray,
    fontWeight: '500',
  },
  extraBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.warning}20`,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 6,
    gap: 4,
  },
  extraBadgeMoney: {
    backgroundColor: `${colors.success}20`,
  },
  extraBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.warning,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 8,
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  detailsContainer: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.gray,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.dark,
  },
  extraValue: {
    color: colors.warning,
  },
  detailDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.primary}10`,
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    marginTop: 12,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.darkSecondary,
    fontWeight: '500',
  },
});

export default WeekSummary;
