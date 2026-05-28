import React, { useContext, useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

function ProtectedRoute({ allowedRoles }) {
  const { user, showToast } = useContext(AppContext);

  useEffect(() => {
    if (!user) {
      showToast("Silakan login terlebih dahulu untuk mengakses halaman ini.", "warning");
    } else if (allowedRoles && !allowedRoles.includes(user.role)) {
      showToast("Akses ditolak! Anda tidak memiliki izin untuk halaman tersebut.", "error");
    }
  }, [user, allowedRoles]);

  if (!user) {
    // If not logged in, redirect to the wisatawan portal (guest-accessible)
    return <Navigate to="/wisatawan" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If logged in but does not have the required role, redirect to Access Denied page
    return <Navigate to="/denied" replace />;
  }

  // Authorized, render the child route
  return <Outlet />;
}

export default ProtectedRoute
