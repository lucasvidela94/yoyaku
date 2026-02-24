import { useState, useEffect, useCallback } from 'react'
import { getTurnosDelDia, cambiarEstadoTurno, crearTurno, getHoy } from '../wailsbridge'

export function useTurnos(fecha = getHoy()) {
  const [agenda, setAgenda] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTurnos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getTurnosDelDia(fecha)
      setAgenda(data)
    } catch (err) {
      setError(err.message || 'Error cargando turnos')
    } finally {
      setLoading(false)
    }
  }, [fecha])

  useEffect(() => {
    fetchTurnos()
  }, [fetchTurnos])

  const cambiarEstado = async (id, estado) => {
    try {
      await cambiarEstadoTurno(id, estado)
      // Actualizar estado local sin recargar todo
      setAgenda(prev => {
        if (!prev) return prev
        return {
          ...prev,
          turnos: prev.turnos.map(t => 
            t.id === id ? { ...t, estado } : t
          )
        }
      })
      return true
    } catch (err) {
      setError(err.message || 'Error cambiando estado')
      return false
    }
  }

  const agregarTurno = async (turno) => {
    try {
      await crearTurno(turno)
      await fetchTurnos() // Recargar para obtener el turno con ID
      return true
    } catch (err) {
      setError(err.message || 'Error creando turno')
      return false
    }
  }

  const getProximoTurno = () => {
    if (!agenda?.turnos) return null
    const ahora = new Date()
    const minutosActual = ahora.getHours() * 60 + ahora.getMinutes()
    
    return agenda.turnos.find(t => {
      const [h, m] = t.hora.split(':').map(Number)
      const minutosTurno = h * 60 + m
      return (t.estado === 'confirmado' || t.estado === 'pendiente') && 
             minutosTurno >= minutosActual - 30
    })
  }

  return {
    agenda,
    turnos: agenda?.turnos || [],
    atrasoMinutos: agenda?.atrasoMinutos || 0,
    loading,
    error,
    refresh: fetchTurnos,
    cambiarEstado,
    agregarTurno,
    getProximoTurno,
  }
}
