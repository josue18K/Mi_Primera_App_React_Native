import React from "react";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider } from "./src/context/ThemeContext";
import { WorkerProvider } from "./src/context/WorkerContext";
import { WeekProvider } from "./src/context/WeekContext";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <ThemeProvider>
      <WorkerProvider>
        <WeekProvider>
          <AppNavigator />
          <StatusBar style="auto" />
        </WeekProvider>
      </WorkerProvider>
    </ThemeProvider>
  );
}
