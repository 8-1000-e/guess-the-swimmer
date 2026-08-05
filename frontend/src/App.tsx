import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { AuthProvider } from '@/auth/AuthContext'
import { ToastProvider } from '@/toast/ToastContext'
import Toaster from '@/toast/Toaster'
import ProtectedRoute from '@/components/ProtectedRoute'
import AuthCallback from '@/pages/AuthCallback'
import Game from '@/pages/Game'
import HowItWorks from '@/pages/HowItWorks'
import Leaderboard from '@/pages/Leaderboard'
import Login from '@/pages/Login'
import Profile from '@/pages/Profile'
import Roster from '@/pages/Roster'
import Sign from '@/pages/Sign'

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/sign/:token" element={<Sign />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Game />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute>
                  <Leaderboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/comment-ca-marche"
              element={
                <ProtectedRoute>
                  <HowItWorks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trombinoscope"
              element={
                <ProtectedRoute>
                  <Roster />
                </ProtectedRoute>
              }
            />
            <Route
              path="/u/:login"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
        <Toaster />
      </ToastProvider>
      <Analytics />
    </BrowserRouter>
  )
}
