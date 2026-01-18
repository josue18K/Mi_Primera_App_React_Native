import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../constants";

const WorkerContext = createContext();

export const useWorker = () => {
  const context = useContext(WorkerContext);
  if (!context) {
    throw new Error("useWorker must be used within a WorkerProvider");
  }
  return context;
};

export const WorkerProvider = ({ children }) => {
  const [workerConfig, setWorkerConfig] = useState(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkerConfig();
  }, []);

  const loadWorkerConfig = async () => {
    try {
      const configData = await AsyncStorage.getItem(STORAGE_KEYS.WORKER_CONFIG);
      if (configData) {
        const config = JSON.parse(configData);
        setWorkerConfig(config);
        setIsConfigured(true);
      }
    } catch (error) {
      console.error("Error loading worker config:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveWorkerConfig = async (config) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.WORKER_CONFIG,
        JSON.stringify(config),
      );
      setWorkerConfig(config);
      setIsConfigured(true);
    } catch (error) {
      console.error("Error saving worker config:", error);
      throw error;
    }
  };

  const updateWorkerConfig = async (updates) => {
    try {
      const updatedConfig = {
        ...workerConfig,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      await saveWorkerConfig(updatedConfig);
    } catch (error) {
      console.error("Error updating worker config:", error);
      throw error;
    }
  };

  const resetWorkerConfig = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.WORKER_CONFIG);
      setWorkerConfig(null);
      setIsConfigured(false);
    } catch (error) {
      console.error("Error resetting worker config:", error);
      throw error;
    }
  };

  const value = {
    workerConfig,
    isConfigured,
    loading,
    saveWorkerConfig,
    updateWorkerConfig,
    resetWorkerConfig,
  };

  return (
    <WorkerContext.Provider value={value}>{children}</WorkerContext.Provider>
  );
};
