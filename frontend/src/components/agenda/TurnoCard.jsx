import { useState } from 'react'
import { useConfiguracion } from '../../hooks/useConfiguracion'
import { getHoy } from '../../wailsbridge'
import './TurnoCard.css'

const ESTADOS_CONFIG = {
  confirmado: { 
    label: 'CONFIRMADO', 
    bgColor: 'var(--color-confirmado-bg)',
    textColor: 'var(--color-confirmado)',
    borderColor: 'var(--color-confirmado)'
  },
  pendiente: { 
    label: 'PENDIENTE', 
    bgColor: 'var(--color-pendiente-bg)',
    textColor: 'var(--color-pendiente)',
    borderColor: 'var(--color-pendiente)'
  },
  atendido: { 
    label: 'ATENDIDO', 
    bgColor: 'var(--color-atendido-bg)',
    textColor: 'var(--color-atendido)',
    borderColor: 'var(--color-atendido)'
  },
  ausente: { 
    label: 'AUSENTE', 
    bgColor: 'var(--color-ausente-bg)',
    textColor: 'var(--color-ausente)',
    borderColor: 'var(--color-ausente)'
  },
  cancelado: { 
    label: 'CANCELADO', 
    bgColor: '#F7F7F7',
    textColor: '#999',
    borderColor: '#CCC'
  },
}

export function TurnoCard({ turno, isExpanded, onToggle, onCambiarEstado, index }) {
  const config = ESTADOS_CONFIG[turno.estado] || ESTADOS_CONFIG.pendiente
  const { config: appConfig } = useConfiguracion()
  const [showMensajeModal, setShowMensajeModal] = useState(false)
  const [tipoMensaje, setTipoMensaje] = useState('confirmacion')

  const abrirWhatsApp = (mensajePersonalizado = null) => {
    const telefono = turno.paciente?.telefono?.replace(/\D/g, '')
    if (!telefono) {
      alert('El paciente no tiene número de teléfono')
      return
    }

    let mensaje = mensajePersonalizado
    
    if (!mensaje && appConfig) {
      // Usar template según el tipo seleccionado
      const template = tipoMensaje === 'confirmacion' 
        ? appConfig.mensajeConfirmacion 
        : tipoMensaje === 'recordatorio'
        ? appConfig.mensajeRecordatorio
        : appConfig.mensajeDemora
      
      mensaje = template
        .replace('{nombre}', turno.paciente?.nombre?.split(' ')[0] || '')
        .replace('{fecha}', turno.fecha || getHoy())
        .replace('{hora}', turno.hora)
        .replace('{minutos}', '0')
    }

    if (!mensaje) {
      mensaje = `Hola ${turno.paciente?.nombre?.split(' ')[0]}, le escribimos desde el consultorio para confirmar su turno.`
    }

    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`
    window.open(url, '_blank')
    setShowMensajeModal(false)
  }

  const limpiarTelefono = (tel) => {
    return tel?.replace(/\D/g, '')
  }

  return (
    <>
      <div 
        className={`turno-card ${turno.estado} ${isExpanded ? 'expanded' : ''}`}
        onClick={onToggle}
        style={{ 
          animationDelay: `${index * 0.05}s`,
          backgroundColor: config.bgColor,
          borderColor: config.borderColor
        }}
      >
        <div className="turno-main">
          <div className="turno-hora-block">
            <span className="turno-hora">{turno.hora}</span>
          </div>
          
          <div className="turno-content">
            <div className="turno-header">
              <span className="turno-nombre">{turno.paciente?.nombre}</span>
              
              <div className="turno-badges">
                {turno.riesgoNoShow && (
                  <span className="riesgo-badge" title="Historial de no-show">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                      <line x1="12" y1="9" x2="12" y2="13"></line>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                  </span>
                )}
                
                <span 
                  className="estado-badge"
                  style={{ 
                    color: config.textColor,
                    borderColor: config.borderColor
                  }}
                >
                  {config.label}
                </span>
              </div>
            </div>
            
            {turno.motivo && (
              <span className="turno-motivo">{turno.motivo}</span>
            )}
          </div>
          
          <div className="turno-expand-icon">
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>

        {isExpanded && (
          <div className="turno-detalles" onClick={e => e.stopPropagation()}>
            <div className="detalles-line"></div>
            
            <div className="detalles-grid">
              <div className="detalle-item">
                <span className="detalle-label">Teléfono</span>
                <span className="detalle-value">{turno.paciente?.telefono}</span>
              </div>
              
              {turno.paciente?.email && (
                <div className="detalle-item">
                  <span className="detalle-label">Email</span>
                  <span className="detalle-value">{turno.paciente.email}</span>
                </div>
              )}
              
              {turno.notas && (
                <div className="detalle-item full-width">
                  <span className="detalle-label">Notas</span>
                  <span className="detalle-value notas">{turno.notas}</span>
                </div>
              )}
            </div>

            <div className="acciones-grid">
              {turno.estado !== 'atendido' && (
                <button 
                  className="btn-accion btn-atender"
                  onClick={() => onCambiarEstado(turno.id, 'atendido')}
                >
                  <svg className="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Atender
                </button>
              )}
              
              {turno.estado === 'pendiente' && (
                <button 
                  className="btn-accion btn-confirmar"
                  onClick={() => onCambiarEstado(turno.id, 'confirmado')}
                >
                  <svg className="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  Confirmar
                </button>
              )}

              {turno.estado !== 'ausente' && (
                <button 
                  className="btn-accion btn-ausente"
                  onClick={() => onCambiarEstado(turno.id, 'ausente')}
                >
                  <svg className="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                  Ausente
                </button>
              )}

              <button 
                className="btn-accion btn-whatsapp"
                onClick={() => setShowMensajeModal(true)}
              >
                <svg className="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
                WhatsApp
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de selección de mensaje */}
      {showMensajeModal && (
        <div className="modal-overlay" onClick={() => setShowMensajeModal(false)}>
          <div className="modal-content mensaje-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Enviar mensaje a {turno.paciente?.nombre?.split(' ')[0]}</h3>
              <button className="modal-close" onClick={() => setShowMensajeModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="mensaje-opciones">
              <button 
                className={`mensaje-opcion ${tipoMensaje === 'confirmacion' ? 'active' : ''}`}
                onClick={() => setTipoMensaje('confirmacion')}
              >
                <span className="opcion-titulo">Confirmación</span>
                <span className="opcion-preview">{appConfig?.mensajeConfirmacion?.substring(0, 60)}...</span>
              </button>

              <button 
                className={`mensaje-opcion ${tipoMensaje === 'recordatorio' ? 'active' : ''}`}
                onClick={() => setTipoMensaje('recordatorio')}
              >
                <span className="opcion-titulo">Recordatorio</span>
                <span className="opcion-preview">{appConfig?.mensajeRecordatorio?.substring(0, 60)}...</span>
              </button>

              <button 
                className={`mensaje-opcion ${tipoMensaje === 'demora' ? 'active' : ''}`}
                onClick={() => setTipoMensaje('demora')}
              >
                <span className="opcion-titulo">Aviso de demora</span>
                <span className="opcion-preview">{appConfig?.mensajeDemora?.substring(0, 60)}...</span>
              </button>
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowMensajeModal(false)}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={() => abrirWhatsApp()}>
                Abrir WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
