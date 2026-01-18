import { EXTRA_PAY_MULTIPLIER } from "../constants";
import { calculateHoursDifference } from "./timeHelpers";

/**
 * Formatea horas decimales a string legible (Xh o X.Xh)
 */
export const formatHours = (hours) => {
  if (!hours || hours === 0) return "0h";

  // Redondear a 2 decimales
  const rounded = Math.round(hours * 100) / 100;

  // Si es número entero, mostrar sin decimales
  if (Number.isInteger(rounded)) {
    return `${rounded}h`;
  }

  // Si tiene decimales, mostrar con 1 decimal
  return `${rounded.toFixed(1)}h`;
};

/**
 * Formatea dinero a formato peruano (S/ X.XX)
 */
export const formatMoney = (amount) => {
  if (!amount || amount === 0) return "S/ 0.00";
  return `S/ ${amount.toFixed(2)}`;
};

/**
 * Calcula el pago de un turno individual
 * Ahora usa checkInTime y checkOutTime para calcular horas reales
 */
export const calculateTurnPay = (turn, hourlyRate) => {
  if (!turn || !hourlyRate) return 0;

  // Si tiene check-in y check-out, calcular horas reales
  if (turn.checkInTime && turn.checkOutTime) {
    const hoursWorked = calculateHoursDifference(
      turn.checkInTime,
      turn.checkOutTime,
    );
    const multiplier = turn.isExtra ? EXTRA_PAY_MULTIPLIER : 1;
    return hoursWorked * hourlyRate * multiplier;
  }

  // Fallback: si no tiene tiempos, retornar 0
  return 0;
};

/**
 * Calcula las horas trabajadas de un turno
 */
export const calculateTurnHours = (turn) => {
  if (!turn || !turn.checkInTime || !turn.checkOutTime) return 0;
  return calculateHoursDifference(turn.checkInTime, turn.checkOutTime);
};

/**
 * Calcula el total de horas de un día
 */
export const calculateDayHours = (day) => {
  if (!day || !day.turns || day.turns.length === 0) return 0;

  return day.turns.reduce((total, turn) => {
    return total + calculateTurnHours(turn);
  }, 0);
};

/**
 * Calcula el pago total de un día
 */
export const calculateDayPay = (day, hourlyRate) => {
  if (!day || !day.turns || day.turns.length === 0) return 0;

  return day.turns.reduce((total, turn) => {
    return total + calculateTurnPay(turn, hourlyRate);
  }, 0);
};

/**
 * Calcula estadísticas de la semana
 */
export const calculateWeekStats = (week, hourlyRate) => {
  if (!week || !week.days) {
    return {
      totalHours: 0,
      normalHours: 0,
      extraHours: 0,
      totalPay: 0,
      normalPay: 0,
      extraPay: 0,
    };
  }

  let totalHours = 0;
  let normalHours = 0;
  let extraHours = 0;
  let totalPay = 0;
  let normalPay = 0;
  let extraPay = 0;

  week.days.forEach((day) => {
    if (day.turns && day.turns.length > 0) {
      day.turns.forEach((turn) => {
        const hours = calculateTurnHours(turn);
        const pay = calculateTurnPay(turn, hourlyRate);

        totalHours += hours;
        totalPay += pay;

        if (turn.isExtra) {
          extraHours += hours;
          extraPay += pay;
        } else {
          normalHours += hours;
          normalPay += pay;
        }
      });
    }
  });

  return {
    totalHours,
    normalHours,
    extraHours,
    totalPay,
    normalPay,
    extraPay,
  };
};

/**
 * Calcula estadísticas de un día específico
 */
export const calculateDayStats = (day, hourlyRate) => {
  if (!day || !day.turns || day.turns.length === 0) {
    return {
      totalHours: 0,
      normalHours: 0,
      extraHours: 0,
      totalPay: 0,
      normalPay: 0,
      extraPay: 0,
    };
  }

  let totalHours = 0;
  let normalHours = 0;
  let extraHours = 0;
  let totalPay = 0;
  let normalPay = 0;
  let extraPay = 0;

  day.turns.forEach((turn) => {
    const hours = calculateTurnHours(turn);
    const pay = calculateTurnPay(turn, hourlyRate);

    totalHours += hours;
    totalPay += pay;

    if (turn.isExtra) {
      extraHours += hours;
      extraPay += pay;
    } else {
      normalHours += hours;
      normalPay += pay;
    }
  });

  return {
    totalHours,
    normalHours,
    extraHours,
    totalPay,
    normalPay,
    extraPay,
  };
};
