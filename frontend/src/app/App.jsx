import { Suspense, lazy, useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './Layout'
import { LicenseModal } from '../features/license/components/LicenseModal'
import { useLicense } from '../features/license/hooks/useLicense'

// Lazy loading de features
const AgendaPage = lazy(() => import('../features/agenda/pages/AgendaPage'))
const PacientesPage = lazy(() => import('../features/pacientes/pages/PacientesPage'))
const ConfiguracionPage = lazy(() => import('../features/configuracion/pages/ConfiguracionPage'))

// Loading component
function PageLoader() {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh' 
    }}>
      <div style={{ 
        fontFamily: 'var(--font-body)', 
        fontStyle: 'italic',
        color: 'var(--color-text-muted)'
      }}>
        Cargando...
      </div>
    </div>
  )
}

function App() {
  const { requiresActivation, activateLicense, loading } = useLicense()
  const [showLicenseModal, setShowLicenseModal] = useState(false)

  useEffect(() => {
    if (!loading && requiresActivation) {
      setShowLicenseModal(true)
    }
  }, [loading, requiresActivation])

  const handleActivate = async (key) => {
    await activateLicense(key)
    setShowLicenseModal(false)
  }

  if (loading) {
    return <PageLoader />
  }

  return (
    <>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<AgendaPage />} />
              <Route path="pacientes" element={<PacientesPage />} />
              <Route path="configuracion" element={<ConfiguracionPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>

      <LicenseModal
        isOpen={showLicenseModal}
        onClose={() => {}}
        onActivate={handleActivate}
      />
    </>
  )
}

export default App
