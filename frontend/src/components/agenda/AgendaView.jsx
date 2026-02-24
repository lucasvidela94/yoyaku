import { useState } from 'react'
import { useTurnos } from '../../hooks/useTurnos'
import { TurnoCard } from './TurnoCard'
import { ProximoTurnoBanner } from './ProximoTurnoBanner'
import { AtrasoDisplay } from './AtrasoDisplay'
import { ConfigModal } from '../config/ConfigModal'
import './AgendaView.css'

export function AgendaView() {
  const { agenda, turnos, atrasoMinutos, loading, error, cambiarEstado } = useTurnos()
  const [expandedTurno, setExpandedTurno] = useState(null)
  const [showConfig, setShowConfig] = useState(false)

  if (loading) {
    return (
      <div className="agenda-loading">
        <div className="loading-text">Cargando agenda...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="agenda-error">
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
    <div className="agenda-view">
      {/* Header con identidad clínica */}
      <header className="agenda-header">
        <div className="header-brand">
          <h1 className="brand-name">YOYAKU</h1>
          <span className="brand-tagline">Sistema de Agenda Médica</span>
        </div>
        <div className="header-actions">
          <button 
            className="btn-config"
            onClick={() => setShowConfig(true)}
            title="Configuración"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
          <span className="meta-date">
            {new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            })}
          </span>
        </div>
      </header>

      {/* Panel de estado principal */}
      <div className="status-panel">
        <AtrasoDisplay minutos={atrasoMinutos} />
        
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-value">{turnos.length}</span>
            <span className="stat-label">Total turnos</span>
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

      {/* Banner del próximo paciente */}
      {proximoTurno && (
        <ProximoTurnoBanner 
          turno={proximoTurno}
          onAtender={() => cambiarEstado(proximoTurno.id, 'atendido')}
        />
      )}

      {/* Lista de turnos */}
      <div className="turnos-section">
        <div className="section-header">
          <h2 className="section-title">Agenda del día</h2>
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

      {/* Modal de configuración */}
      <ConfigModal 
        isOpen={showConfig} 
        onClose={() => setShowConfig(false)} 
      />
    </div>
  )
}
