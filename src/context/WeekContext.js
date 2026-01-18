import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../constants";
import { createTurnObject } from "../utils/timeHelpers";

const WeekContext = createContext();

export const useWeek = () => {
  const context = useContext(WeekContext);
  if (!context) {
    throw new Error("useWeek must be used within a WeekProvider");
  }
  return context;
};

export const WeekProvider = ({ children }) => {
  const [currentWeek, setCurrentWeek] = useState(null);
  const [weekHistory, setWeekHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar datos al iniciar
  useEffect(() => {
    loadWeekData();
  }, []);

  // Guardar automáticamente cuando cambia la semana
  useEffect(() => {
    if (currentWeek && !loading) {
      saveCurrentWeek();
    }
  }, [currentWeek]);

  const loadWeekData = async () => {
    try {
      const [weekData, historyData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.CURRENT_WEEK),
        AsyncStorage.getItem(STORAGE_KEYS.WEEK_HISTORY),
      ]);

      if (weekData) {
        setCurrentWeek(JSON.parse(weekData));
      }

      if (historyData) {
        setWeekHistory(JSON.parse(historyData));
      }
    } catch (error) {
      console.error("Error loading week data:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveCurrentWeek = async () => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.CURRENT_WEEK,
        JSON.stringify(currentWeek),
      );
    } catch (error) {
      console.error("Error saving current week:", error);
    }
  };

  const saveWeekHistory = async (history) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.WEEK_HISTORY,
        JSON.stringify(history),
      );
    } catch (error) {
      console.error("Error saving week history:", error);
    }
  };

  const initializeWeek = (startDate, endDate) => {
    const days = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push({
        date: new Date(d).toISOString(),
        turns: [],
      });
    }

    const newWeek = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      days,
      createdAt: new Date().toISOString(),
    };

    setCurrentWeek(newWeek);
    return newWeek;
  };

  const addTurn = (date, turnType, isCheckInNow = false) => {
    if (!currentWeek) return;

    const updatedWeek = { ...currentWeek };
    const dayIndex = updatedWeek.days.findIndex(
      (day) =>
        new Date(day.date).toDateString() === new Date(date).toDateString(),
    );

    if (dayIndex === -1) return;

    // Verificar si ya existe un turno de ese tipo
    const existingTurnIndex = updatedWeek.days[dayIndex].turns.findIndex(
      (t) => t.type === turnType,
    );

    if (existingTurnIndex !== -1) {
      alert("Ya existe un turno de este tipo en este día");
      return;
    }

    // Crear nuevo turno
    const newTurn = createTurnObject(
      turnType,
      isCheckInNow ? new Date().toISOString() : null,
      null,
      false,
      "",
    );

    updatedWeek.days[dayIndex].turns.push(newTurn);
    setCurrentWeek(updatedWeek);
  };

  const updateTurn = (date, turnType, updatedTurnData) => {
    if (!currentWeek) return;

    const updatedWeek = { ...currentWeek };
    const dayIndex = updatedWeek.days.findIndex(
      (day) =>
        new Date(day.date).toDateString() === new Date(date).toDateString(),
    );

    if (dayIndex === -1) return;

    const turnIndex = updatedWeek.days[dayIndex].turns.findIndex(
      (t) => t.type === turnType,
    );

    if (turnIndex === -1) return;

    updatedWeek.days[dayIndex].turns[turnIndex] = {
      ...updatedWeek.days[dayIndex].turns[turnIndex],
      ...updatedTurnData,
      updatedAt: new Date().toISOString(),
    };

    setCurrentWeek(updatedWeek);
  };

  const deleteTurn = (date, turnType) => {
    if (!currentWeek) return;

    const updatedWeek = { ...currentWeek };
    const dayIndex = updatedWeek.days.findIndex(
      (day) =>
        new Date(day.date).toDateString() === new Date(date).toDateString(),
    );

    if (dayIndex === -1) return;

    updatedWeek.days[dayIndex].turns = updatedWeek.days[dayIndex].turns.filter(
      (t) => t.type !== turnType,
    );

    setCurrentWeek(updatedWeek);
  };

  const checkInTurn = (date, turnType) => {
    if (!currentWeek) return;

    const updatedWeek = { ...currentWeek };
    const dayIndex = updatedWeek.days.findIndex(
      (day) =>
        new Date(day.date).toDateString() === new Date(date).toDateString(),
    );

    if (dayIndex === -1) return;

    const turnIndex = updatedWeek.days[dayIndex].turns.findIndex(
      (t) => t.type === turnType,
    );

    if (turnIndex === -1) {
      // Si no existe, crear turno con check-in
      addTurn(date, turnType, true);
    } else {
      // Si existe, actualizar check-in
      updatedWeek.days[dayIndex].turns[turnIndex] = {
        ...updatedWeek.days[dayIndex].turns[turnIndex],
        checkInTime: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setCurrentWeek(updatedWeek);
    }
  };

  const checkOutTurn = (date, turnType) => {
    if (!currentWeek) return;

    const updatedWeek = { ...currentWeek };
    const dayIndex = updatedWeek.days.findIndex(
      (day) =>
        new Date(day.date).toDateString() === new Date(date).toDateString(),
    );

    if (dayIndex === -1) return;

    const turnIndex = updatedWeek.days[dayIndex].turns.findIndex(
      (t) => t.type === turnType,
    );

    if (
      turnIndex === -1 ||
      !updatedWeek.days[dayIndex].turns[turnIndex].checkInTime
    ) {
      alert("Debes hacer check-in primero");
      return;
    }

    updatedWeek.days[dayIndex].turns[turnIndex] = {
      ...updatedWeek.days[dayIndex].turns[turnIndex],
      checkOutTime: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCurrentWeek(updatedWeek);
  };

  const closeWeek = async () => {
    if (!currentWeek) return;

    const closedWeek = {
      ...currentWeek,
      closedAt: new Date().toISOString(),
    };

    const updatedHistory = [...weekHistory, closedWeek];
    setWeekHistory(updatedHistory);
    await saveWeekHistory(updatedHistory);

    // Limpiar semana actual
    setCurrentWeek(null);
    await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_WEEK);
  };

  const resetWeek = async () => {
    setCurrentWeek(null);
    await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_WEEK);
  };

  const clearHistory = async () => {
    setWeekHistory([]);
    await AsyncStorage.removeItem(STORAGE_KEYS.WEEK_HISTORY);
  };

  const value = {
    currentWeek,
    weekHistory,
    loading,
    initializeWeek,
    addTurn,
    updateTurn,
    deleteTurn,
    checkInTurn,
    checkOutTurn,
    closeWeek,
    resetWeek,
    clearHistory,
  };

  return <WeekContext.Provider value={value}>{children}</WeekContext.Provider>;
};
