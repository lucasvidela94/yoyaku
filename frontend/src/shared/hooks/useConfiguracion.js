import { useState, useEffect, useCallback } from 'react'
import { getConfiguracion, guardarConfiguracion } from '../wailsbridge'

export function useConfiguracion() {
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchConfig = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('Fetching configuration...')
      const data = await getConfiguracion()
      console.log('Configuration loaded:', data)
      setConfig(data)
    } catch (err) {
      console.error('Error loading configuration:', err)
      setError(err.message || 'Error cargando configuración')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchConfig()
  }, [fetchConfig])

  const guardar = async (nuevaConfig) => {
    try {
      await guardarConfiguracion(nuevaConfig)
      setConfig(nuevaConfig)
      return true
    } catch (err) {
      setError(err.message || 'Error guardando configuración')
      return false
    }
  }

  return {
    config,
    loading,
    error,
    refresh: fetchConfig,
    guardar,
  }
}
