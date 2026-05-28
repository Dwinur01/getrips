import React, { useContext } from 'react'
import WisatawanPortal from '../components/WisatawanPortal'
import { AppContext } from '../context/AppContext'

function WisatawanPage() {
  const { merchants, reviews, globalApiKey, fetchData, user, showToast } = useContext(AppContext);
  
  return (
    <WisatawanPortal 
      merchants={merchants} 
      reviews={reviews} 
      globalApiKey={globalApiKey}
      onRefresh={fetchData} 
      user={user}
      showToast={showToast}
    />
  )
}

export default WisatawanPage
