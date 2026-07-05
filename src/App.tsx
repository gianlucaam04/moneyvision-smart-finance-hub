
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { FinanceProvider } from './contexts/FinanceContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Categories from './pages/Categories';
import Analytics from './pages/Analytics';
import Goals from './pages/Goals';
import Investments from './pages/Investments';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Testing from './pages/Testing';
import NotFound from './pages/NotFound';
import PrivateRoute from './components/Auth/PrivateRoute';
import ResetPassword from './pages/ResetPassword';
import { Toaster } from 'sonner';
import ThemeProvider from './components/ThemeProvider';
import PreferencesApplier from './components/PreferencesApplier';

import HistoricalData from './pages/HistoricalData';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider attribute="class" defaultTheme="light">
          <FinanceProvider>
            <PreferencesApplier />
            <Toaster />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/transactions" element={
              <PrivateRoute>
                <Transactions />
              </PrivateRoute>
            } />
            <Route path="/categories" element={
              <PrivateRoute>
                <Categories />
              </PrivateRoute>
            } />
            <Route path="/analytics" element={
              <PrivateRoute>
                <Analytics />
              </PrivateRoute>
            } />
            <Route path="/goals" element={
              <PrivateRoute>
                <Goals />
              </PrivateRoute>
            } />
            <Route path="/investments" element={
              <PrivateRoute>
                <Investments />
              </PrivateRoute>
            } />
            <Route path="/historical" element={
              <PrivateRoute>
                <HistoricalData />
              </PrivateRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />
            <Route path="/settings" element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            } />
            <Route path="/testing" element={
              <PrivateRoute>
                <Testing />
              </PrivateRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </FinanceProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
