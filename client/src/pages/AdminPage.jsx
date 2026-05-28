import React, { useContext } from 'react'
import SuperAdminPortal from '../components/SuperAdminPortal'
import { AppContext } from '../context/AppContext'

function AdminPage() {
  const { merchants, fetchData, user, showToast } = useContext(AppContext);
  
  return (
    <SuperAdminPortal 
      merchants={merchants} 
      onRefresh={fetchData} 
      user={user}
      showToast={showToast}
    />
  )
}

export default AdminPage
