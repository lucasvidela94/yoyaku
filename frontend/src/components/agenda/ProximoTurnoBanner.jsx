import './ProximoTurnoBanner.css'

export function ProximoTurnoBanner({ turno, onAtender }) {
  return (
    <div className="proximo-banner">
      <div className="proximo-content">
        <div className="proximo-label">PRÓXIMO PACIENTE</div>
        
        <div className="proximo-main">
          <div className="proximo-hora-large">{turno.hora}</div>
          
          <div className="proximo-datos">
            <h2 className="proximo-nombre">{turno.paciente?.nombre}</h2>
            {turno.motivo && (
              <span className="proximo-motivo">{turno.motivo}</span>
            )}
          </div>
        </div>
      </div>
      
      <button className="btn-pasar" onClick={onAtender}>
        <span className="pasar-text">HACER PASAR</span>
        <svg 
          className="pasar-flecha" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </button>
      
      <div className="proximo-indicador"></div>
    </div>
  )
}
