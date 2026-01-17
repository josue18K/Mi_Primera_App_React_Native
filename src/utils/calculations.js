// Formatea horas (ej: 24.5 -> "24.5h" o 24 -> "24h")
export const formatHours = (hours) => {
  return hours % 1 === 0 ? `${hours}h` : `${hours.toFixed(1)}h`;
};

// Formatea dinero (ej: 245.5 -> "S/ 245.50")
export const formatMoney = (amount) => {
  return `S/ ${amount.toFixed(2)}`;
};

// Calcula total de horas de una semana
export const calculateWeekHours = (days) => {
  return days.reduce((total, day) => total + day.totalHours, 0);
};

// Calcula pago total de una semana
export const calculateWeekPay = (totalHours, hourlyRate) => {
  return totalHours * hourlyRate;
};

// Crea un turno
export const createTurn = (type, hours) => {
  return { type, hours };
};

// Verifica si un día tiene un turno específico
export const hasTurn = (day, turnType) => {
  return day.turns.some(turn => turn.type === turnType);
};

// Agrega un turno a un día
export const addTurnToDay = (day, turn) => {
  const newTurns = [...day.turns, turn];
  const newTotalHours = newTurns.reduce((sum, t) => sum + t.hours, 0);
  
  return {
    ...day,
    turns: newTurns,
    totalHours: newTotalHours,
  };
};

// Remueve un turno de un día
export const removeTurnFromDay = (day, turnType) => {
  const newTurns = day.turns.filter(turn => turn.type !== turnType);
  const newTotalHours = newTurns.reduce((sum, t) => sum + t.hours, 0);
  
  return {
    ...day,
    turns: newTurns,
    totalHours: newTotalHours,
  };
};

// Calcula el total de horas de un día
export const calculateDayHours = (turns) => {
  return turns.reduce((sum, turn) => sum + turn.hours, 0);
};
