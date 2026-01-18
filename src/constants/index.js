import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

// Horarios de turnos (hora de entrada - hora de salida)
export const TURN_SCHEDULES = {
  M: {
    start: "08:30",
    end: "12:30",
    duration: 4, // horas
    label: "Mañana",
    emoji: "🌅",
  },
  T: {
    start: "12:30",
    end: "16:30",
    duration: 4, // horas
    label: "Tarde",
    emoji: "☀️",
  },
  N: {
    start: "16:30",
    end: "20:30",
    duration: 4, // horas
    label: "Noche",
    emoji: "🌙",
  },
};

// Estados de llegada
export const ARRIVAL_STATUS = {
  early: {
    label: "Temprano",
    emoji: "⚡",
    color: "success",
  },
  ontime: {
    label: "Puntual",
    emoji: "✅",
    color: "primary",
  },
  late: {
    label: "Tarde",
    emoji: "⚠️",
    color: "warning",
  },
};

// Colores principales (Tema claro)
export const COLORS = {
  primary: "#6366f1",
  primaryDark: "#4f46e5",
  primaryLight: "#818cf8",
  secondary: "#8b5cf6",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#3b82f6",
  dark: "#1f2937",
  darkSecondary: "#374151",
  gray: "#6b7280",
  grayLight: "#9ca3af",
  light: "#f3f4f6",
  white: "#ffffff",
  turnM: "#10b981",
  turnT: "#3b82f6",
  turnN: "#8b5cf6",
  background: "#f9fafb",
  backgroundSecondary: "#f3f4f6",
  card: "#ffffff",
  border: "#e5e7eb",
  borderLight: "#f3f4f6",
  overlay: "rgba(0, 0, 0, 0.5)",
  overlayLight: "rgba(0, 0, 0, 0.3)",
  disabled: "#d1d5db",
  placeholder: "#9ca3af",
};

// Tema oscuro
export const DARK_COLORS = {
  primary: "#818cf8",
  primaryDark: "#6366f1",
  primaryLight: "#a5b4fc",
  secondary: "#a78bfa",
  success: "#34d399",
  warning: "#fbbf24",
  danger: "#f87171",
  info: "#60a5fa",
  dark: "#f9fafb",
  darkSecondary: "#e5e7eb",
  gray: "#9ca3af",
  grayLight: "#6b7280",
  light: "#1f2937",
  white: "#111827",
  turnM: "#34d399",
  turnT: "#60a5fa",
  turnN: "#a78bfa",
  background: "#111827",
  backgroundSecondary: "#1f2937",
  backgroundTertiary: "#374151",
  card: "#1f2937",
  border: "#374151",
  borderLight: "#4b5563",
  overlay: "rgba(0, 0, 0, 0.7)",
  overlayLight: "rgba(0, 0, 0, 0.5)",
  disabled: "#4b5563",
  placeholder: "#6b7280",
};

// Tipos de turnos
export const TURN_TYPES = {
  M: "M", // Mañana
  T: "T", // Tarde
  N: "N", // Noche
};

// Labels de turnos
export const TURN_LABELS = {
  M: "Mañana",
  T: "Tarde",
  N: "Noche",
};

// Emojis de turnos
export const TURN_EMOJIS = {
  M: "🌅",
  T: "☀️",
  N: "🌙",
};

// Configuración por defecto de turnos (horas)
export const DEFAULT_TURN_CONFIG = {
  M: 4,
  T: 4,
  N: 4,
};

// Tipos de pago
export const PAY_TYPES = {
  NORMAL: "normal",
  EXTRA: "extra",
};

// Labels para tipos de pago
export const PAY_TYPE_LABELS = {
  [PAY_TYPES.NORMAL]: "Normal",
  [PAY_TYPES.EXTRA]: "Extra",
};

// Emojis para tipos de pago
export const PAY_TYPE_EMOJIS = {
  [PAY_TYPES.NORMAL]: "⏰",
  [PAY_TYPES.EXTRA]: "⚡",
};

// Multiplicador de horas extras (ejemplo: 1.5x = 50% más)
export const EXTRA_PAY_MULTIPLIER = 1.5;

// Días de la semana
export const DAYS_OF_WEEK = {
  0: "Domingo",
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
};

// Configuración por defecto de la semana laboral
// La semana laboral va de Miércoles a Martes
export const DEFAULT_WEEK_SCHEDULE = [
  { dayOfWeek: 0, isWorkDay: false, turns: [] }, // Domingo
  { dayOfWeek: 1, isWorkDay: true, turns: ["M"] }, // Lunes
  { dayOfWeek: 2, isWorkDay: true, turns: ["M"] }, // Martes
  { dayOfWeek: 3, isWorkDay: true, turns: ["M"] }, // Miércoles (inicio semana laboral)
  { dayOfWeek: 4, isWorkDay: true, turns: ["M"] }, // Jueves
  { dayOfWeek: 5, isWorkDay: true, turns: ["M"] }, // Viernes
  { dayOfWeek: 6, isWorkDay: false, turns: [] }, // Sábado
];

// Storage keys
export const STORAGE_KEYS = {
  WORKER_CONFIG: "@worker_config",
  CURRENT_WEEK: "@current_week",
  WEEK_HISTORY: "@week_history",
  THEME: "@theme_mode",
  NOTIFICATIONS_ENABLED: "@notifications_enabled",
  EXTRA_PAY_MULTIPLIER: "@extra_pay_multiplier",
};

// Contraseña maestra para resetear la app
export const MASTER_PASSWORD = "admin123";

// Dimensiones de pantalla
export const SCREEN = {
  width,
  height,
  isSmall: width < 375,
  isMedium: width >= 375 && width < 414,
  isLarge: width >= 414,
};

// Tamaños de fuente responsivos
export const FONT_SIZES = {
  xs: SCREEN.isSmall ? 10 : 12,
  sm: SCREEN.isSmall ? 12 : 14,
  md: SCREEN.isSmall ? 14 : 16,
  lg: SCREEN.isSmall ? 16 : 18,
  xl: SCREEN.isSmall ? 18 : 20,
  xxl: SCREEN.isSmall ? 22 : 24,
  xxxl: SCREEN.isSmall ? 28 : 32,
};

// Espaciados
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Border radius
export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

// Shadows
export const SHADOWS = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
};

// Configuración de animaciones
export const ANIMATION = {
  fast: 150,
  normal: 250,
  slow: 350,
  verySlow: 500,
};

// Mensajes de la app
export const MESSAGES = {
  WELCOME: "¡Bienvenido a TurnosApp!",
  SETUP_COMPLETE: "Configuración completada exitosamente",
  WEEK_CLOSED: "Semana cerrada y guardada en el historial",
  DATA_SAVED: "Datos guardados correctamente",
  ERROR_GENERIC: "Ocurrió un error. Intenta nuevamente.",
  NO_INTERNET: "No hay conexión a internet",
  LOADING: "Cargando...",
};

// Validaciones
export const VALIDATIONS = {
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 50,
  MIN_HOURLY_RATE: 1,
  MAX_HOURLY_RATE: 1000,
  MAX_NOTE_LENGTH: 200,
  MIN_HOURS_PER_TURN: 1,
  MAX_HOURS_PER_TURN: 24,
};

// Configuración de notificaciones
export const NOTIFICATION_CONFIG = {
  DAILY_REMINDER_HOUR: 8, // 8:00 AM
  DAILY_REMINDER_MINUTE: 0,
  PAYDAY_REMINDER_HOUR: 7, // 7:00 AM
  PAYDAY_REMINDER_MINUTE: 0,
  PAYDAY_WEEKDAY: 4, // Miércoles (1=Domingo, 4=Miércoles)
};

// Exportar todo como default también
export default {
  TURN_SCHEDULES,
  ARRIVAL_STATUS,
  COLORS,
  DARK_COLORS,
  TURN_TYPES,
  TURN_LABELS,
  TURN_EMOJIS,
  DEFAULT_TURN_CONFIG,
  PAY_TYPES,
  PAY_TYPE_LABELS,
  PAY_TYPE_EMOJIS,
  EXTRA_PAY_MULTIPLIER,
  DAYS_OF_WEEK,
  DEFAULT_WEEK_SCHEDULE,
  STORAGE_KEYS,
  MASTER_PASSWORD,
  SCREEN,
  FONT_SIZES,
  SPACING,
  RADIUS,
  SHADOWS,
  ANIMATION,
  MESSAGES,
  VALIDATIONS,
  NOTIFICATION_CONFIG,
};
