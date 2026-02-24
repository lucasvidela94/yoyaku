import { useState } from 'react'
import { useTurnos } from '../hooks/useTurnos'
import { TurnoCard } from '../components/TurnoCard'
import { ProximoTurnoBanner } from '../components/ProximoTurnoBanner'
import { AtrasoDisplay } from '../components/AtrasoDisplay'
import './AgendaPage.css'

export default function AgendaPage() {
  const { turnos, atrasoMinutos, loading, error, cambiarEstado } = useTurnos()
  const [expandedTurno, setExpandedTurno] = useState(null)

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-text">Cargando agenda...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-error">
        <div className="error-text">Error: {error}</div>
      </div>
    )
  }

  const proximoTurno = turnos.find(t => 
    (t.estado === 'confirmado' || t.estado === 'pendiente')
  )

  const turnosPendientes = turnos.filter(t => 
    t.estado === 'confirmado' || t.estado === 'pendiente'
  ).length

  const turnosAtendidos = turnos.filter(t => 
    t.estado === 'atendido'
  ).length

  return (
    <div className="agenda-page">
      <header className="page-header">
        <h1 className="page-title">Agenda del Día</h1>
        <span className="page-subtitle">
          {new Date().toLocaleDateString('es-ES', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
          })}
        </span>
      </header>

      <div className="status-panel">
        <AtrasoDisplay minutos={atrasoMinutos} />
        
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-value">{turnos.length}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{turnosPendientes}</span>
            <span className="stat-label">Pendientes</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{turnosAtendidos}</span>
            <span className="stat-label">Atendidos</span>
          </div>
        </div>
      </div>

      {proximoTurno && (
        <ProximoTurnoBanner 
          turno={proximoTurno}
          onAtender={() => cambiarEstado(proximoTurno.id, 'atendido')}
        />
      )}

      <div className="turnos-section">
        <div className="section-header">
          <h2 className="section-title">Turnos</h2>
          <div className="section-line"></div>
        </div>
        
        <div className="turnos-lista">
          {turnos.map((turno, index) => (
            <TurnoCard
              key={turno.id}
              turno={turno}
              isExpanded={expandedTurno === turno.id}
              onToggle={() => setExpandedTurno(
                expandedTurno === turno.id ? null : turno.id
              )}
              onCambiarEstado={cambiarEstado}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
