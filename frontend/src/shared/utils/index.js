// wailsbridge/index.js
// Capa intermedia entre React y los bindings de Go generados por Wails
// Este es el ÚNICO archivo que importa directamente de wailsjs

import {
  GetTurnosDelDia,
  GetTurno,
  CrearTurno,
  ActualizarTurno,
  EliminarTurno,
  CambiarEstadoTurno,
  GetPaciente,
  BuscarPacientes,
  CrearPaciente,
  ActualizarPaciente,
  EliminarPaciente,
  GetHistorialPaciente,
  GetConfiguracion,
  GuardarConfiguracion,
} from '../../wailsjs/go/main/App'

// ==================== TURNOS ====================

export const getTurnosDelDia = (fecha) => GetTurnosDelDia(fecha)

export const getTurno = (id) => GetTurno(id)

export const crearTurno = (turno) => CrearTurno(turno)

export const actualizarTurno = (turno) => ActualizarTurno(turno)

export const eliminarTurno = (id) => EliminarTurno(id)

export const cambiarEstadoTurno = (id, estado) => CambiarEstadoTurno(id, estado)

// ==================== PACIENTES ====================

export const getPaciente = (id) => GetPaciente(id)

export const buscarPacientes = (termino) => BuscarPacientes(termino)

export const crearPaciente = (paciente) => CrearPaciente(paciente)

export const actualizarPaciente = (paciente) => ActualizarPaciente(paciente)

export const eliminarPaciente = (id) => EliminarPaciente(id)

export const getHistorialPaciente = (pacienteId) => GetHistorialPaciente(pacienteId)

// ==================== CONFIGURACIÓN ====================

export const getConfiguracion = () => GetConfiguracion()

export const guardarConfiguracion = (config) => GuardarConfiguracion(config)

// ==================== UTILIDADES ====================

export const formatFecha = (date) => {
  return date.toISOString().split('T')[0]
}

export const getHoy = () => {
  return formatFecha(new Date())
}

export const parseHora = (horaStr) => {
  const [horas, minutos] = horaStr.split(':').map(Number)
  return horas * 60 + minutos
}

export const formatHora = (minutos) => {
  const h = Math.floor(minutos / 60)
  const m = minutos % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}
