import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { Navbar, DbBanner } from './components/Navbar'
import { BottomNav } from './components/BottomNav'
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute'
import { useAuth } from './contexts/AuthContext'
import { Landing } from './pages/Landing'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { PublicTracking } from './pages/PublicTracking'
import { Dashboard } from './pages/Dashboard'
import { Transfer } from './pages/Transfer'
import { Deposit } from './pages/Deposit'
import { ParcelTracker } from './pages/ParcelTracker'
import { History } from './pages/History'
import { Settings } from './pages/Settings'
import { ProfilePage } from './pages/Profile'
import { Notifications } from './pages/Notifications'
import { AdminDashboard } from './pages/Admin/AdminDashboard'
import { AdminUsers } from './pages/Admin/AdminUsers'
import { AdminTransactions } from './pages/Admin/AdminTransactions'
import { AdminTracking } from './pages/Admin/AdminTracking'
import './App.css'

function AppLayout() {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const isDashboard = pathname.startsWith('/dashboard') || pathname.startsWith('/transfer') ||
    pathname.startsWith('/deposit') || pathname.startsWith('/track') ||
    pathname.startsWith('/history') || pathname.startsWith('/settings') ||
    pathname.startsWith('/profile') || pathname.startsWith('/admin') ||
    pathname.startsWith('/notifications')

  return (
    <div className="app">
      <DbBanner />
      <Navbar />
      <div className="app-content">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/track/:code" element={<PublicTracking />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/transfer" element={<ProtectedRoute><Transfer /></ProtectedRoute>} />
          <Route path="/deposit" element={<ProtectedRoute><Deposit /></ProtectedRoute>} />
          <Route path="/track" element={<ProtectedRoute><ParcelTracker /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/transactions" element={<AdminRoute><AdminTransactions /></AdminRoute>} />
          <Route path="/admin/tracking" element={<AdminRoute><AdminTracking /></AdminRoute>} />
        </Routes>
      </div>
      {user && isDashboard && <BottomNav />}
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppLayout />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
