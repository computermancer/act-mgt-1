import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Analytics } from "@vercel/analytics/react";
import ActivitiesPage from './pages/ActivitiesPage';
import ArchivedActivitiesPage from './pages/ArchivedActivitiesPage';
import CalendarPage from './pages/CalendarPage';
import NotesPage from './pages/NotesPage';
import Layout from './components/Layout';
import { TestConnection } from './components/TestConnection';
import ProtectedRoute from './components/auth/ProtectedRoute';

// App Routes Component
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={
        <ProtectedRoute>
          <CalendarPage />
        </ProtectedRoute>
      } />
      <Route path="/activities" element={
        <ProtectedRoute>
          <ActivitiesPage />
        </ProtectedRoute>
      } />
      <Route path="/archived-activities" element={
        <ProtectedRoute>
          <ArchivedActivitiesPage />
        </ProtectedRoute>
      } />
      <Route path="/calendar" element={
        <ProtectedRoute>
          <CalendarPage />
        </ProtectedRoute>
      } />
      <Route path="/notes" element={
        <ProtectedRoute>
          <NotesPage />
        </ProtectedRoute>
      } />
      <Route path="*" element={
        <ProtectedRoute>
          <div>Page not found</div>
        </ProtectedRoute>
      } />
    </Routes>
  );
};

// Main App Component
const App = () => {
  return (
    <>
      <TestConnection />
      <Layout>
        <AppRoutes />
      </Layout>
      <Analytics />
    </>
  );
};

export default App;
