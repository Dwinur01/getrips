import React, { useContext } from 'react'
import ItSecPortal from '../components/ItSecPortal'
import { AppContext } from '../context/AppContext'

function ItSecPage() {
  const { threats, globalApiKey, fetchData, user, showToast } = useContext(AppContext);
  
  return (
    <ItSecPortal 
      threats={threats} 
      globalApiKey={globalApiKey}
      onRefresh={fetchData} 
      user={user}
      showToast={showToast}
    />
  )
}

export default ItSecPage
