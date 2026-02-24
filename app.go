package main

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/wailsapp/wails/v2/pkg/runtime"
	"yoyaku/internal/agenda"
	"yoyaku/internal/db"
	"yoyaku/internal/models"
)

type App struct {
	ctx          context.Context
	db           *db.DB
	turnoRepo    *db.TurnoRepo
	pacienteRepo *db.PacienteRepo
	configRepo   *db.ConfigRepo
	agendaSvc    *agenda.Service
}

func NewApp() *App {
	return &App{}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	dataDir := a.getDataDir()
	database, err := db.NewDB(dataDir)
	if err != nil {
		runtime.LogErrorf(ctx, "Error inicializando base de datos: %v", err)
		return
	}
	a.db = database

	a.turnoRepo = db.NewTurnoRepo(database)
	a.pacienteRepo = db.NewPacienteRepo(database)
	a.configRepo = db.NewConfigRepo(database)
	a.agendaSvc = agenda.NewService(a.turnoRepo, a.pacienteRepo)

	// Seed datos de prueba
	seedSvc := NewSeedService(database)
	if err := seedSvc.SeedData(ctx); err != nil {
		runtime.LogWarningf(ctx, "Error creando datos de prueba: %v", err)
	}

	runtime.LogInfo(ctx, "Yoyaku iniciado correctamente")
}

func (a *App) shutdown(ctx context.Context) {
	if a.db != nil {
		a.db.Close()
	}
}

func (a *App) getDataDir() string {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		homeDir = "."
	}
	return filepath.Join(homeDir, ".yoyaku")
}

func (a *App) GetTurnosDelDia(fecha string) (*models.AgendaDia, error) {
	t, err := time.Parse("2006-01-02", fecha)
	if err != nil {
		return nil, fmt.Errorf("fecha inválida: %w", err)
	}
	return a.agendaSvc.ObtenerAgendaDelDia(t)
}

func (a *App) GetTurno(id int64) (*models.Turno, error) {
	return a.turnoRepo.ObtenerPorID(id)
}

func (a *App) CrearTurno(turno *models.Turno) error {
	return a.turnoRepo.Crear(turno)
}

func (a *App) ActualizarTurno(turno *models.Turno) error {
	return a.turnoRepo.Actualizar(turno)
}

func (a *App) EliminarTurno(id int64) error {
	return a.turnoRepo.Eliminar(id)
}

func (a *App) CambiarEstadoTurno(id int64, estado string) error {
	switch models.EstadoTurno(estado) {
	case models.EstadoAtendido:
		return a.agendaSvc.MarcarAtendido(id)
	case models.EstadoAusente:
		return a.agendaSvc.MarcarAusente(id)
	case models.EstadoCancelado:
		return a.agendaSvc.MarcarCancelado(id)
	case models.EstadoConfirmado:
		return a.agendaSvc.ConfirmarTurno(id)
	default:
		return a.turnoRepo.ActualizarEstado(id, models.EstadoTurno(estado))
	}
}

func (a *App) GetPaciente(id int64) (*models.Paciente, error) {
	return a.pacienteRepo.ObtenerPorID(id)
}

func (a *App) BuscarPacientes(termino string) ([]models.Paciente, error) {
	return a.pacienteRepo.Buscar(termino)
}

func (a *App) CrearPaciente(paciente *models.Paciente) error {
	return a.pacienteRepo.Crear(paciente)
}

func (a *App) ActualizarPaciente(paciente *models.Paciente) error {
	return a.pacienteRepo.Actualizar(paciente)
}

func (a *App) EliminarPaciente(id int64) error {
	return a.pacienteRepo.Eliminar(id)
}

func (a *App) GetHistorialPaciente(pacienteID int64) ([]models.Turno, error) {
	return a.turnoRepo.ListarPorPaciente(pacienteID)
}

func (a *App) EmitirEvento(evento string, data interface{}) {
	runtime.EventsEmit(a.ctx, evento, data)
}

func (a *App) GetConfiguracion() (*models.Configuracion, error) {
	return a.configRepo.Obtener()
}

func (a *App) GuardarConfiguracion(config *models.Configuracion) error {
	return a.configRepo.Guardar(config)
}
