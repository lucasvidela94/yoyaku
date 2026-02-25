import { useConfiguracion } from '../hooks/useConfiguracion'
import { ConfigForm } from '../components/ConfigForm'
import LicenseStatus from '../../license/components/LicenseStatus'
import { useLicense } from '../../license/hooks/useLicense'
import './ConfiguracionPage.css'

export default function ConfiguracionPage() {
  const { config, loading, guardar } = useConfiguracion()
  const { licenseInfo } = useLicense()

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-text">Cargando configuración...</div>
      </div>
    )
  }

  return (
    <div className="configuracion-page">
      <header className="page-header">
        <h1 className="page-title">Configuración</h1>
        <span className="page-subtitle">
          Personalice los datos de su consultorio
        </span>
      </header>

      <LicenseStatus info={licenseInfo} />

      <ConfigForm config={config} onSave={guardar} />
    </div>
  )
}
