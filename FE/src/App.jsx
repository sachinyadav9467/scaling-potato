import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import ErrorBoundary from './components/ErrorBoundary';
import AppLoader from './components/AppLoader';
import Layout from './components/Layout';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import DailyView from './views/DailyView';
import DailyVideosView from './views/DailyVideosView';
import WeeklyView from './views/WeeklyView';
import MonthlyView from './views/MonthlyView';
import TabularView from './views/TabularView';
import './styles/index.css';

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppLoader>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/videos"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <DailyVideosView />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <DailyView />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/weekly"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <WeeklyView />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/daily"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <DailyView />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/monthly"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <MonthlyView />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/table"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <TabularView />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <DailyVideosView />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <DailyView />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AppLoader>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
