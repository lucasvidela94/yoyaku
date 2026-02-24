import './AtrasoDisplay.css'

export function AtrasoDisplay({ minutos }) {
  const getEstado = () => {
    if (minutos <= 0) return { tipo: 'atiempo', label: 'A TIEMPO', color: 'var(--color-confirmado)' }
    if (minutos <= 15) return { tipo: 'leve', label: 'DEMORA LEVE', color: 'var(--color-pendiente)' }
    return { tipo: 'grave', label: 'DEMORA SIGNIFICATIVA', color: 'var(--color-ausente)' }
  }

  const estado = getEstado()
  const horas = Math.floor(minutos / 60)
  const mins = minutos % 60
  
  const tiempoTexto = minutos <= 0 
    ? '00:00'
    : `${horas.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`

  return (
    <div className={`atraso-display ${estado.tipo}`}>
      <div className="atraso-main">
        <div className="atraso-tiempo" style={{ color: estado.color }}>
          <span className="tiempo-horas">{tiempoTexto}</span>
          <span className="tiempo-unidad">{minutos <= 0 ? '' : 'hrs'}</span>
        </div>
        <div className="atraso-label" style={{ color: estado.color }}>
          {estado.label}
        </div>
      </div>
      
      <div className="atraso-indicador" style={{ backgroundColor: estado.color }}></div>
    </div>
  )
}
