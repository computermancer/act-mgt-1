import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ActivitiesPage from './pages/ActivitiesPage';
import CalendarPage from './pages/CalendarPage';
import NotesPage from './pages/NotesPage';
import Layout from './components/Layout';
import { TestConnection } from './components/TestConnection';

// App Routes Component
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<CalendarPage />} />
      <Route path="/activities" element={<ActivitiesPage />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/notes" element={<NotesPage />} />
      <Route path="*" element={<div>Page not found</div>} />
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
    </>
  );
};

export default App;
