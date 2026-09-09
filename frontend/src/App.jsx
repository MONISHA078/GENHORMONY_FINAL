import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import MainLayout from './layouts/MainLayout';
import AdminDashboard from './pages/AdminDashboard';
import { EmotionProvider } from './context/EmotionContext';
import { PlaybackProvider } from './context/PlaybackContext';
import Landing from './pages/Landing';
import DetectPage from './pages/DetectPage';
import RecommendedMusicPage from './pages/RecommendedMusicPage';
import GenerateMusicPage from './pages/GenerateMusicPage';
import HistoryPage from './pages/HistoryPage';
import MusicPlayerPage from './pages/MusicPlayerPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <EmotionProvider>
          <PlaybackProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Dashboard />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/detect"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <DetectPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recommended-music"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <RecommendedMusicPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/music-player"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <MusicPlayerPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/generate-music"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <GenerateMusicPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <HistoryPage />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Profile />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              {/* Admin Dashboard */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <MainLayout>
                      <AdminDashboard />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              {/* Landing Page & Redirects */}
              <Route path="/" element={<Landing />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </PlaybackProvider>
        </EmotionProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
