import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AnalysisProvider } from "./context/AnalysisContext";
import MainLayout from "./components/layout/MainLayout";
import DashboardPage from "./pages/DashboardPage";
import ScanPage from "./pages/ScanPage";
import ReportsPage from "./pages/ReportsPage";
import WelcomePage from "./pages/WelcomePage";
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';


export default function App() {
  return (
    <AnalysisProvider>
      <BrowserRouter>
        <Routes>
          {/* ZONE 1: Public Pages (Full Screen, No Sidebar) */}
          <Route path="/" element={<WelcomePage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* ZONE 2: Dashboard Pages (Wrapped in MainLayout for Sidebar & TopBar) */}
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/scan" element={<ScanPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Route>

          {/* Fallback: If a user types a random URL, send them to the Welcome page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AnalysisProvider>
  );
}