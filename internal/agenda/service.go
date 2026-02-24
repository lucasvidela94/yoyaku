package agenda

import (
	"fmt"
	"time"

	"yoyaku/internal/db"
	"yoyaku/internal/models"
)

type Service struct {
	turnoRepo    *db.TurnoRepo
	pacienteRepo *db.PacienteRepo
}

func NewService(turnoRepo *db.TurnoRepo, pacienteRepo *db.PacienteRepo) *Service {
	return &Service{
		turnoRepo:    turnoRepo,
		pacienteRepo: pacienteRepo,
	}
}

func (s *Service) ObtenerAgendaDelDia(fecha time.Time) (*models.AgendaDia, error) {
	turnos, err := s.turnoRepo.ListarPorFecha(fecha)
	if err != nil {
		return nil, err
	}

	turnosConRiesgo := make([]models.Turno, len(turnos))
	for i, turno := range turnos {
		riesgo, err := s.pacienteRepo.TieneNoShowReciente(turno.PacienteID, 3)
		if err != nil {
			return nil, err
		}
		turno.RiesgoNoShow = riesgo
		turnosConRiesgo[i] = turno
	}

	atraso := s.CalcularAtraso(turnosConRiesgo)
	pendientes := s.contarPendientes(turnosConRiesgo)

	return &models.AgendaDia{
		Fecha:            fecha.Format("2006-01-02"),
		Turnos:           turnosConRiesgo,
		AtrasoMinutos:    atraso,
		TotalTurnos:      len(turnosConRiesgo),
		TurnosPendientes: pendientes,
	}, nil
}

func (s *Service) CalcularAtraso(turnos []models.Turno) int {
	if len(turnos) == 0 {
		return 0
	}

	now := time.Now()
	horaActual := now.Hour()*60 + now.Minute()

	var atrasoTotal int
	var turnosAtendidosOEnCurso int

	for _, turno := range turnos {
		horaTurno := s.parseHora(turno.Hora)

		switch turno.Estado {
		case models.EstadoAtendido:
			turnosAtendidosOEnCurso++
			if horaTurno < horaActual {
				diferencia := horaActual - horaTurno
				if diferencia > atrasoTotal {
					atrasoTotal = diferencia
				}
			}
		case models.EstadoConfirmado, models.EstadoPendiente:
			if horaTurno < horaActual {
				diferencia := horaActual - horaTurno
				if diferencia > atrasoTotal {
					atrasoTotal = diferencia
				}
			}
		}
	}

	return atrasoTotal
}

func (s *Service) ObtenerProximoTurno(turnos []models.Turno) *models.Turno {
	now := time.Now()
	horaActual := now.Hour()*60 + now.Minute()

	for _, turno := range turnos {
		if turno.Estado == models.EstadoConfirmado || turno.Estado == models.EstadoPendiente {
			horaTurno := s.parseHora(turno.Hora)
			if horaTurno >= horaActual-30 {
				return &turno
			}
		}
	}

	return nil
}

func (s *Service) MarcarAtendido(turnoID int64) error {
	return s.turnoRepo.ActualizarEstado(turnoID, models.EstadoAtendido)
}

func (s *Service) MarcarAusente(turnoID int64) error {
	turno, err := s.turnoRepo.ObtenerPorID(turnoID)
	if err != nil {
		return err
	}
	if turno == nil {
		return nil
	}

	if err := s.turnoRepo.ActualizarEstado(turnoID, models.EstadoAusente); err != nil {
		return err
	}

	return s.pacienteRepo.RegistrarNoShow(turno.PacienteID, turnoID, time.Now())
}

func (s *Service) MarcarCancelado(turnoID int64) error {
	return s.turnoRepo.ActualizarEstado(turnoID, models.EstadoCancelado)
}

func (s *Service) ConfirmarTurno(turnoID int64) error {
	return s.turnoRepo.ActualizarEstado(turnoID, models.EstadoConfirmado)
}

func (s *Service) parseHora(horaStr string) int {
	var hora, minuto int
	fmt.Sscanf(horaStr, "%d:%d", &hora, &minuto)
	return hora*60 + minuto
}

func (s *Service) contarPendientes(turnos []models.Turno) int {
	count := 0
	for _, turno := range turnos {
		if turno.Estado == models.EstadoConfirmado || turno.Estado == models.EstadoPendiente {
			count++
		}
	}
	return count
}
