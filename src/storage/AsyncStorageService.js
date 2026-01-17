import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';

class AsyncStorageService {
  // Worker Config
  async saveWorkerConfig(config) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.WORKER_CONFIG, JSON.stringify(config));
    } catch (error) {
      console.error('Error saving worker config:', error);
      throw error;
    }
  }

  async getWorkerConfig() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.WORKER_CONFIG);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting worker config:', error);
      return null;
    }
  }

  // Current Week
  async saveCurrentWeek(week) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_WEEK, JSON.stringify(week));
    } catch (error) {
      console.error('Error saving current week:', error);
      throw error;
    }
  }

  async getCurrentWeek() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_WEEK);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting current week:', error);
      return null;
    }
  }

  // Week History
  async getWeekHistory() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.WEEK_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting week history:', error);
      return [];
    }
  }

  async addWeekToHistory(week) {
    try {
      const history = await this.getWeekHistory();
      history.unshift(week);
      await AsyncStorage.setItem(STORAGE_KEYS.WEEK_HISTORY, JSON.stringify(history));
    } catch (error) {
      console.error('Error adding week to history:', error);
      throw error;
    }
  }

  // Clear all data
  async clearAllData() {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.WORKER_CONFIG,
        STORAGE_KEYS.CURRENT_WEEK,
        STORAGE_KEYS.WEEK_HISTORY,
      ]);
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }
}

export default new AsyncStorageService();
