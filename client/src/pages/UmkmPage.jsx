import React, { useContext } from 'react'
import UmkmPortal from '../components/UmkmPortal'
import { AppContext } from '../context/AppContext'

function UmkmPage() {
  const { merchants, reviews, globalApiKey, fetchData, user, showToast } = useContext(AppContext);
  
  return (
    <UmkmPortal 
      merchants={merchants} 
      reviews={reviews} 
      globalApiKey={globalApiKey}
      onRefresh={fetchData} 
      user={user}
      showToast={showToast}
    />
  )
}

export default UmkmPage
