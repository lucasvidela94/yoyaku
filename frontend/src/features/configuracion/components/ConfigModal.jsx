import { useState } from 'react'
import { useConfiguracion } from '../../hooks/useConfiguracion'
import './ConfigModal.css'

export function ConfigModal({ isOpen, onClose }) {
  const { config, loading, guardar } = useConfiguracion()
  const [formData, setFormData] = useState(null)
  const [guardando, setGuardando] = useState(false)

  // Inicializar form cuando se abre
  if (isOpen && config && !formData) {
    setFormData({ ...config })
  }

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGuardando(true)
    const exito = await guardar(formData)
    setGuardando(false)
    if (exito) {
      onClose()
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (loading || !formData) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-loading">Cargando configuración...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Configuración del Consultorio</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-section">
            <h3 className="section-title">Información General</h3>
            
            <div className="form-group">
              <label className="form-label">Nombre del Consultorio</label>
              <input
                type="text"
                className="form-input"
                value={formData.nombreConsultorio}
                onChange={e => handleChange('nombreConsultorio', e.target.value)}
                placeholder="Ej: Consultorio Dr. García"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nombre del Médico</label>
              <input
                type="text"
                className="form-input"
                value={formData.nombreMedico}
                onChange={e => handleChange('nombreMedico', e.target.value)}
                placeholder="Ej: Dr. Juan García"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Teléfono del Consultorio</label>
              <input
                type="tel"
                className="form-input"
                value={formData.telefonoConsultorio}
                onChange={e => handleChange('telefonoConsultorio', e.target.value)}
                placeholder="Ej: +54 11 1234-5678"
              />
              <span className="form-hint">Este número se usará para que los pacientes respondan</span>
            </div>

            <div className="form-group">
              <label className="form-label">Dirección</label>
              <input
                type="text"
                className="form-input"
                value={formData.direccion}
                onChange={e => handleChange('direccion', e.target.value)}
                placeholder="Ej: Av. Libertador 1234, Piso 3"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Horario de Atención</label>
              <input
                type="text"
                className="form-input"
                value={formData.horarioAtencion}
                onChange={e => handleChange('horarioAtencion', e.target.value)}
                placeholder="Ej: Lunes a Viernes de 9:00 a 18:00"
              />
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Mensajes de WhatsApp</h3>
            <p className="section-description">
              Use {'{nombre}'}, {'{fecha}'}, {'{hora}'} y {'{minutos}'} como variables.
            </p>

            <div className="form-group">
              <label className="form-label">Mensaje de Confirmación</label>
              <textarea
                className="form-textarea"
                value={formData.mensajeConfirmacion}
                onChange={e => handleChange('mensajeConfirmacion', e.target.value)}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mensaje de Recordatorio</label>
              <textarea
                className="form-textarea"
                value={formData.mensajeRecordatorio}
                onChange={e => handleChange('mensajeRecordatorio', e.target.value)}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mensaje de Demora</label>
              <textarea
                className="form-textarea"
                value={formData.mensajeDemora}
                onChange={e => handleChange('mensajeDemora', e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={guardando}>
              {guardando ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
