// Contraseña maestra para reset
export const MASTER_PASSWORD = 'Josue1348033';

// Configuración por defecto de turnos (en horas)
export const DEFAULT_TURN_CONFIG = {
  M: 4, // Mañana: 4 horas
  T: 4, // Tarde: 4 horas
  N: 4, // Noche: 4 horas
};

// Pago por hora por defecto
export const DEFAULT_HOURLY_RATE = 10;

// Horario por defecto
export const DEFAULT_WEEK_SCHEDULE = [
  { dayOfWeek: 0, isWorkDay: true, turns: ['M'] }, // Domingo
  { dayOfWeek: 1, isWorkDay: true, turns: ['M'] }, // Lunes
  { dayOfWeek: 2, isWorkDay: true, turns: ['M'] }, // Martes
  { dayOfWeek: 3, isWorkDay: true, turns: ['M'] }, // Miércoles
  { dayOfWeek: 4, isWorkDay: false, turns: [] }, // Jueves - DESCANSO
  { dayOfWeek: 5, isWorkDay: true, turns: ['M'] }, // Viernes
  { dayOfWeek: 6, isWorkDay: true, turns: ['T', 'N'] }, // Sábado - 2 turnos
];

// Días de la semana
export const DAYS_OF_WEEK = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];

export const DAYS_OF_WEEK_SHORT = [
  'Dom',
  'Lun',
  'Mar',
  'Mié',
  'Jue',
  'Vie',
  'Sáb',
];

// Día de pago (miércoles = 3)
export const PAY_DAY = 3;

// Textos de turnos
export const TURN_LABELS = {
  M: 'Mañana',
  T: 'Tarde',
  N: 'Noche',
};

// Emojis de turnos
export const TURN_EMOJIS = {
  M: '🟢',
  T: '🔵',
  N: '🟣',
};

// Colores de la app
export const COLORS = {
  primary: '#6366f1',
  primaryDark: '#4f46e5',
  primaryLight: '#818cf8',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  dark: '#1f2937',
  darkSecondary: '#374151',
  gray: '#6b7280',
  grayLight: '#9ca3af',
  light: '#f9fafb',
  white: '#ffffff',
  turnM: '#10b981',
  turnT: '#3b82f6',
  turnN: '#8b5cf6',
  background: '#ffffff',
  backgroundSecondary: '#f3f4f6',
  backgroundTertiary: '#e5e7eb',
  card: '#ffffff',
  border: '#e5e7eb',
  borderLight: '#f3f4f6',
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  disabled: '#d1d5db',
  placeholder: '#9ca3af',
};

// Keys para AsyncStorage
export const STORAGE_KEYS = {
  WORKER_CONFIG: '@worker_config',
  CURRENT_WEEK: '@current_week',
  WEEK_HISTORY: '@week_history',
};
