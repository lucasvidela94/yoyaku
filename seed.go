package main

import (
	"context"
	"time"

	"yoyaku/internal/db"
	"yoyaku/internal/models"
)

type SeedService struct {
	db           *db.DB
	turnoRepo    *db.TurnoRepo
	pacienteRepo *db.PacienteRepo
}

func NewSeedService(database *db.DB) *SeedService {
	return &SeedService{
		db:           database,
		turnoRepo:    db.NewTurnoRepo(database),
		pacienteRepo: db.NewPacienteRepo(database),
	}
}

func (s *SeedService) SeedData(ctx context.Context) error {
	// Verificar si ya hay datos
	pacientes, err := s.pacienteRepo.ListarTodos()
	if err != nil {
		return err
	}
	if len(pacientes) > 0 {
		return nil // Ya hay datos, no hacer nada
	}

	// Crear pacientes de prueba
	pacientesData := []models.Paciente{
		{Nombre: "María González", Telefono: "+54 11 1234-5678", Email: "maria@email.com"},
		{Nombre: "Juan Pérez", Telefono: "+54 11 2345-6789", Email: "juan@email.com"},
		{Nombre: "Ana Rodríguez", Telefono: "+54 11 3456-7890", Email: "ana@email.com"},
		{Nombre: "Carlos López", Telefono: "+54 11 4567-8901", Email: "carlos@email.com"},
		{Nombre: "Laura Martínez", Telefono: "+54 11 5678-9012", Email: "laura@email.com"},
		{Nombre: "Pedro Sánchez", Telefono: "+54 11 6789-0123", Notas: "Paciente con historial de no-show"},
	}

	var pacientesCreados []models.Paciente
	for _, p := range pacientesData {
		if err := s.pacienteRepo.Crear(&p); err != nil {
			return err
		}
		pacientesCreados = append(pacientesCreados, p)
	}

	hoy := time.Now()
	fechaHoy := time.Date(hoy.Year(), hoy.Month(), hoy.Day(), 0, 0, 0, 0, hoy.Location())

	turnosData := []models.Turno{
		{
			PacienteID: pacientesCreados[0].ID,
			Fecha:      fechaHoy,
			Hora:       "09:00",
			Duracion:   30,
			Motivo:     "Consulta general",
			Estado:     models.EstadoAtendido,
		},
		{
			PacienteID: pacientesCreados[1].ID,
			Fecha:      fechaHoy,
			Hora:       "09:30",
			Duracion:   30,
			Motivo:     "Control de presión",
			Estado:     models.EstadoAtendido,
		},
		{
			PacienteID: pacientesCreados[2].ID,
			Fecha:      fechaHoy,
			Hora:       "10:00",
			Duracion:   30,
			Motivo:     "Dolor de cabeza",
			Estado:     models.EstadoConfirmado,
		},
		{
			PacienteID: pacientesCreados[3].ID,
			Fecha:      fechaHoy,
			Hora:       "10:30",
			Duracion:   30,
			Motivo:     "Chequeo anual",
			Estado:     models.EstadoConfirmado,
		},
		{
			PacienteID: pacientesCreados[4].ID,
			Fecha:      fechaHoy,
			Hora:       "11:00",
			Duracion:   30,
			Motivo:     "Receta médica",
			Estado:     models.EstadoPendiente,
		},
		{
			PacienteID: pacientesCreados[5].ID,
			Fecha:      fechaHoy,
			Hora:       "11:30",
			Duracion:   30,
			Motivo:     "Seguimiento",
			Estado:     models.EstadoPendiente,
		},
		{
			PacienteID: pacientesCreados[0].ID,
			Fecha:      fechaHoy,
			Hora:       "12:00",
			Duracion:   30,
			Motivo:     "Resultados de laboratorio",
			Estado:     models.EstadoConfirmado,
		},
		{
			PacienteID: pacientesCreados[2].ID,
			Fecha:      fechaHoy,
			Hora:       "12:30",
			Duracion:   30,
			Motivo:     "Consulta de seguimiento",
			Estado:     models.EstadoPendiente,
		},
	}

	for _, t := range turnosData {
		if err := s.turnoRepo.Crear(&t); err != nil {
			return err
		}
	}

	// Registrar un no-show para Pedro Sánchez (índice 5)
	if err := s.pacienteRepo.RegistrarNoShow(
		pacientesCreados[5].ID,
		1, // turno_id ficticio
		time.Now().AddDate(0, -1, 0),
	); err != nil {
		return err
	}

	return nil
}
