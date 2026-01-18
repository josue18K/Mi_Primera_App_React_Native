/**
 * Utilidades para manejo de tiempo y cálculos de turnos
 */

import { TURN_SCHEDULES } from "../constants";

/**
 * Formatea una fecha a string de hora (HH:MM AM/PM)
 */
export const formatTime = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

/**
 * Formatea una fecha a string de hora 24h (HH:MM)
 */
export const formatTime24 = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

/**
 * Convierte string de hora (HH:MM) a Date de hoy
 */
export const timeStringToDate = (timeString, baseDate = new Date()) => {
  if (!timeString) return null;
  const [hours, minutes] = timeString.split(":").map(Number);
  const date = new Date(baseDate);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

/**
 * Calcula la diferencia en horas decimales entre dos fechas
 */
export const calculateHoursDifference = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end - start;
  const diffHours = diffMs / (1000 * 60 * 60);
  return Math.max(0, diffHours);
};

/**
 * Calcula la diferencia en minutos entre dos fechas
 */
export const calculateMinutesDifference = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end - start;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  return Math.max(0, diffMinutes);
};

/**
 * Formatea minutos a formato "Xh Ymin"
 */
export const formatMinutesToHours = (totalMinutes) => {
  if (!totalMinutes || totalMinutes === 0) return "0h";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes}min`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}min`;
};

/**
 * Formatea horas decimales a formato "Xh Ymin"
 */
export const formatDecimalHours = (decimalHours) => {
  if (!decimalHours || decimalHours === 0) return "0h";
  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);

  if (hours === 0) return `${minutes}min`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}min`;
};

/**
 * Obtiene el horario esperado de un turno
 */
export const getTurnSchedule = (turnType) => {
  return TURN_SCHEDULES[turnType] || null;
};

/**
 * Calcula si llegó temprano, puntual o tarde
 */
export const getArrivalStatus = (checkInTime, turnType) => {
  if (!checkInTime || !turnType) return null;

  const schedule = getTurnSchedule(turnType);
  if (!schedule) return null;

  const checkIn = new Date(checkInTime);
  const expectedStart = timeStringToDate(schedule.start);

  const diffMinutes = (checkIn - expectedStart) / (1000 * 60);

  if (diffMinutes < -5) return "early"; // Llegó 5+ minutos temprano
  if (diffMinutes <= 5) return "ontime"; // Puntual (± 5 minutos)
  return "late"; // Llegó tarde
};

/**
 * Calcula si hay horas extras
 */
export const calculateOvertime = (checkInTime, checkOutTime, turnType) => {
  if (!checkInTime || !checkOutTime || !turnType) return 0;

  const schedule = getTurnSchedule(turnType);
  if (!schedule) return 0;

  const workedMinutes = calculateMinutesDifference(checkInTime, checkOutTime);
  const expectedMinutes = schedule.duration * 60;

  const overtimeMinutes = Math.max(0, workedMinutes - expectedMinutes);
  return overtimeMinutes / 60; // Convertir a horas decimales
};

/**
 * Verifica si un turno está activo (check-in sin check-out)
 */
export const isTurnActive = (turn) => {
  return turn.checkInTime && !turn.checkOutTime;
};

/**
 * Calcula el tiempo transcurrido de un turno activo
 */
export const getActiveTurnDuration = (checkInTime) => {
  if (!checkInTime) return 0;
  const now = new Date();
  const checkIn = new Date(checkInTime);
  return calculateMinutesDifference(checkIn, now);
};

/**
 * Obtiene un string descriptivo del estado del turno
 */
export const getTurnStatusText = (turn) => {
  if (!turn.checkInTime) return "Sin iniciar";
  if (!turn.checkOutTime) return "En progreso";

  const arrivalStatus = getArrivalStatus(turn.checkInTime, turn.type);
  const overtime = calculateOvertime(
    turn.checkInTime,
    turn.checkOutTime,
    turn.type,
  );

  let status = "Completado";
  if (arrivalStatus === "late") status += " (llegó tarde)";
  if (overtime > 0) status += ` +${formatDecimalHours(overtime)} extras`;

  return status;
};

/**
 * Redondea minutos a intervalos de 5 (5, 10, 15, etc.)
 */
export const roundToNearestFive = (minutes) => {
  return Math.round(minutes / 5) * 5;
};

/**
 * Crea un objeto de turno con estructura completa
 */
export const createTurnObject = (
  type,
  checkInTime = null,
  checkOutTime = null,
  isExtra = false,
  note = "",
) => {
  return {
    type,
    checkInTime,
    checkOutTime,
    isExtra,
    note,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

/**
 * Valida si un turno tiene datos válidos
 */
export const isValidTurn = (turn) => {
  if (!turn || !turn.type) return false;
  if (!turn.checkInTime) return false;
  return true;
};
