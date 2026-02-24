import { useState } from 'react'
import './ConfigForm.css'

export function ConfigForm({ config, onSave }) {
  const [formData, setFormData] = useState(config || {})
  const [guardando, setGuardando] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGuardando(true)
    await onSave(formData)
    setGuardando(false)
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="config-form">
      <div className="form-section">
        <h3 className="section-title">Información General</h3>
        
        <div className="form-group">
          <label className="form-label">Nombre del Consultorio</label>
          <input
            type="text"
            className="form-input"
            value={formData.nombreConsultorio || ''}
            onChange={e => handleChange('nombreConsultorio', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Nombre del Médico</label>
          <input
            type="text"
            className="form-input"
            value={formData.nombreMedico || ''}
            onChange={e => handleChange('nombreMedico', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Teléfono del Consultorio</label>
          <input
            type="tel"
            className="form-input"
            value={formData.telefonoConsultorio || ''}
            onChange={e => handleChange('telefonoConsultorio', e.target.value)}
          />
        </div>
      </div>

      <div className="form-section">
        <h3 className="section-title">Mensajes de WhatsApp</h3>

        <div className="form-group">
          <label className="form-label">Mensaje de Confirmación</label>
          <textarea
            className="form-textarea"
            value={formData.mensajeConfirmacion || ''}
            onChange={e => handleChange('mensajeConfirmacion', e.target.value)}
            rows={3}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Mensaje de Recordatorio</label>
          <textarea
            className="form-textarea"
            value={formData.mensajeRecordatorio || ''}
            onChange={e => handleChange('mensajeRecordatorio', e.target.value)}
            rows={3}
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={guardando}>
          {guardando ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </form>
  )
}
