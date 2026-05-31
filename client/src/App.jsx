import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppContextProvider } from './context/AppContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import WisatawanPage from './pages/WisatawanPage'
import UmkmPage from './pages/UmkmPage'
import ItSecPage from './pages/ItSecPage'
import AdminPage from './pages/AdminPage'
import AccessDeniedPage from './pages/AccessDeniedPage'

function App() {
  return (
    <AppContextProvider>
      <Routes>
        {/* Main Gateway/Landing Page (Full width, no sidebar layout) */}
        <Route path="/" element={<LandingPage />} />

        {/* Main Portals with Sidebar Layout */}
        <Route element={<Layout />}>
          {/* Public Routes */}
          <Route path="/wisatawan" element={<WisatawanPage />} />
          <Route path="/denied" element={<AccessDeniedPage />} />

          {/* Protected Route: UMKM (Mitra, IT Security, Super Admin) */}
          <Route element={<ProtectedRoute allowedRoles={['umkm', 'itsec', 'superadmin']} />}>
            <Route path="/umkm" element={<UmkmPage />} />
          </Route>

          {/* Protected Route: IT Security only */}
          <Route element={<ProtectedRoute allowedRoles={['itsec']} />}>
            <Route path="/itsec" element={<ItSecPage />} />
          </Route>

          {/* Protected Route: Super Admin & IT Security */}
          <Route element={<ProtectedRoute allowedRoles={['superadmin', 'itsec']} />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AppContextProvider>
  )
}

export default App
