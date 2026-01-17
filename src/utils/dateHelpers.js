import { addDays, startOfWeek, endOfWeek, format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

// Obtiene el miércoles de inicio de semana laboral
export const getWorkWeekStart = (date) => {
  const dayOfWeek = date.getDay();
  let daysToWednesday;
  
  if (dayOfWeek >= 3) {
    daysToWednesday = dayOfWeek - 3;
  } else {
    daysToWednesday = dayOfWeek + 4;
  }
  
  return addDays(date, -daysToWednesday);
};

// Obtiene el martes de fin de semana laboral
export const getWorkWeekEnd = (startDate) => {
  return addDays(startDate, 6);
};

// Formatea fecha para storage (YYYY-MM-DD)
export const formatDateKey = (date) => {
  return format(date, 'yyyy-MM-dd');
};

// Genera ID único para la semana
export const generateWeekId = (startDate) => {
  return `week_${formatDateKey(startDate)}`;
};

// Obtiene array de 7 días de la semana laboral
export const getWorkWeekDates = (startDate) => {
  const dates = [];
  for (let i = 0; i < 7; i++) {
    dates.push(addDays(startDate, i));
  }
  return dates;
};

// Formatea fecha corta (ej: "15 Ene")
export const formatDateShort = (date) => {
  return format(date, 'dd MMM', { locale: es });
};

// Obtiene nombre del día
export const getDayName = (date) => {
  return format(date, 'EEEE', { locale: es });
};

// Compara si dos fechas son el mismo día
export const isSameDayHelper = (date1, date2) => {
  return isSameDay(date1, date2);
};

// Verifica si una fecha está en el rango de una semana
export const isDateInWeek = (date, weekStartDate) => {
  const start = new Date(weekStartDate);
  const end = addDays(start, 6);
  return date >= start && date <= end;
};
