import './PacientesPage.css'

export default function PacientesPage() {
  return (
    <div className="pacientes-page">
      <header className="page-header">
        <h1 className="page-title">Pacientes</h1>
        <span className="page-subtitle">
          Gestión de pacientes del consultorio
        </span>
      </header>

      <div className="content-placeholder">
        <div className="placeholder-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <h2 className="placeholder-title">Próximamente</h2>
        <p className="placeholder-text">
          Esta funcionalidad está en desarrollo.
          <br />
          Pronto podrá gestionar su lista de pacientes, historiales y más.
        </p>
        
        <div className="placeholder-features">
          <div className="feature-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Búsqueda de pacientes</span>
          </div>
          <div className="feature-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Historial médico</span>
          </div>
          <div className="feature-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Estadísticas de visitas</span>
          </div>
        </div>
      </div>
    </div>
  )
}
