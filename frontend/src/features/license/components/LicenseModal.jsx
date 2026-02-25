import { useState, useEffect } from 'react'
import './LicenseModal.css'

export function LicenseModal({ isOpen, onActivate, onClose }) {
  const [licenseKey, setLicenseKey] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLicenseKey('')
      setError('')
      setSuccess(false)
      setLoading(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await onActivate(licenseKey.trim())
      setSuccess(true)
      setTimeout(() => {
        onClose?.()
      }, 1500)
    } catch (err) {
      setError(err.message || 'Error al activar la licencia')
    } finally {
      setLoading(false)
    }
  }

  const formatLicenseKey = (value) => {
    // Si ya tiene el formato correcto (YOY2025-XXXX-XXXX), no lo tocamos
    const cleanValue = value.replace(/[^A-Za-z0-9-]/g, '').toUpperCase()
    
    // Si ya tiene guiones, asumimos que está bien formateada
    if (cleanValue.includes('-')) {
      return cleanValue.slice(0, 17) // YOY2025-XXXX-XXXX = 17 chars
    }
    
    // Si no tiene guiones, formateamos automáticamente
    const cleaned = cleanValue.replace(/-/g, '')
    if (cleaned.length <= 7) {
      return cleaned // YOY2025
    }
    
    // Formato: YOY2025-XXXX-XXXX
    const part1 = cleaned.slice(0, 7) // YOY2025
    const part2 = cleaned.slice(7, 11) // XXXX
    const part3 = cleaned.slice(11, 15) // XXXX
    
    let result = part1
    if (part2) result += '-' + part2
    if (part3) result += '-' + part3
    
    return result
  }

  const handleChange = (e) => {
    const formatted = formatLicenseKey(e.target.value)
    setLicenseKey(formatted)
    if (error) setError('')
  }

  const isValidFormat = licenseKey.length >= 15 && licenseKey.includes('-')

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content license-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Activar Licencia</h2>
          {onClose && (
            <button className="modal-close" onClick={onClose}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {success ? (
            <div className="license-success">
              <div className="success-icon">✓</div>
              <h3>Licencia Activada</h3>
              <p>Su licencia ha sido activada correctamente.</p>
            </div>
          ) : (
            <>
              <div className="form-section">
                <h3 className="section-title">Información de Licencia</h3>
                
                <div className="license-info-box">
                  <p className="license-description">
                    Esta aplicación utiliza un modelo de licenciamiento <strong>perpetuo</strong>:
                  </p>
                  <ul className="license-features">
                    <li>Pago único - uso ilimitado</li>
                    <li>1 año de actualizaciones incluidas</li>
                    <li>Funciona 100% offline</li>
                    <li>Sin suscripciones ni renovaciones obligatorias</li>
                  </ul>
                </div>

                <div className="form-group">
                  <label className="form-label">Clave de Licencia</label>
                  <input
                    type="text"
                    className={`form-input license-input ${error ? 'error' : ''}`}
                    value={licenseKey}
                    onChange={handleChange}
                    placeholder="YOY2025-XXXX-XXXX"
                    maxLength={17}
                    disabled={loading}
                    autoFocus
                  />
                  <span className="form-hint">
                    Formato: YOYAAAA-XXXX-XXXX (se ingresa automáticamente)
                  </span>
                </div>

                {error && (
                  <div className="license-error">
                    <span className="error-icon">!</span>
                    {error}
                  </div>
                )}
              </div>

              <div className="modal-actions">
                {onClose && (
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={onClose}
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                )}
                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={loading || !isValidFormat}
                >
                  {loading ? 'Activando...' : 'Activar Licencia'}
                </button>
              </div>

              <div className="license-support">
                <p>¿Necesita adquirir una licencia?</p>
                <a 
                  href="mailto:soporte@yoyaku.com" 
                  className="support-link"
                  onClick={(e) => {
                    e.preventDefault()
                    if (window.runtime) {
                      window.runtime.BrowserOpenURL('mailto:soporte@yoyaku.com')
                    }
                  }}
                >
                  Contactar soporte →
                </a>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  )
}