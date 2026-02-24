import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './Layout'


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
  return (
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
  )
}

export default App
