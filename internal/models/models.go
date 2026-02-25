package models

import "time"

type Paciente struct {
	ID        int64     `json:"id"`
	Nombre    string    `json:"nombre"`
	Telefono  string    `json:"telefono"`
	Email     string    `json:"email,omitempty"`
	Notas     string    `json:"notas,omitempty"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type EstadoTurno string

const (
	EstadoConfirmado EstadoTurno = "confirmado"
	EstadoPendiente  EstadoTurno = "pendiente"
	EstadoAtendido   EstadoTurno = "atendido"
	EstadoAusente    EstadoTurno = "ausente"
	EstadoCancelado  EstadoTurno = "cancelado"
)

type Turno struct {
	ID           int64       `json:"id"`
	PacienteID   int64       `json:"pacienteId"`
	Paciente     *Paciente   `json:"paciente,omitempty"`
	Fecha        time.Time   `json:"fecha"`
	Hora         string      `json:"hora"`
	Duracion     int         `json:"duracion"`
	Motivo       string      `json:"motivo"`
	Estado       EstadoTurno `json:"estado"`
	Notas        string      `json:"notas,omitempty"`
	RiesgoNoShow bool        `json:"riesgoNoShow"`
	CreatedAt    time.Time   `json:"createdAt"`
	UpdatedAt    time.Time   `json:"updatedAt"`
}

type HistorialNoShow struct {
	ID         int64     `json:"id"`
	PacienteID int64     `json:"pacienteId"`
	TurnoID    int64     `json:"turnoId"`
	Fecha      time.Time `json:"fecha"`
	CreatedAt  time.Time `json:"createdAt"`
}

type AgendaDia struct {
	Fecha            string  `json:"fecha"`
	Turnos           []Turno `json:"turnos"`
	AtrasoMinutos    int     `json:"atrasoMinutos"`
	TotalTurnos      int     `json:"totalTurnos"`
	TurnosPendientes int     `json:"turnosPendientes"`
}

type Configuracion struct {
	ID                  int64     `json:"id"`
	NombreConsultorio   string    `json:"nombreConsultorio"`
	NombreMedico        string    `json:"nombreMedico"`
	TelefonoConsultorio string    `json:"telefonoConsultorio"`
	Direccion           string    `json:"direccion"`
	MensajeConfirmacion string    `json:"mensajeConfirmacion"`
	MensajeRecordatorio string    `json:"mensajeRecordatorio"`
	MensajeDemora       string    `json:"mensajeDemora"`
	HorarioAtencion     string    `json:"horarioAtencion"`
	UpdatedAt           time.Time `json:"updatedAt"`
}

type Licencia struct {
	ID              int64     `json:"id"`
	LicenseKey      string    `json:"licenseKey"`
	FechaActivacion time.Time `json:"fechaActivacion"`
	FechaExpiracion time.Time `json:"fechaExpiracion"`
	Activa          bool      `json:"activa"`
	Version         string    `json:"version"`
}

type EstadoLicencia string

const (
	LicenciaActiva        EstadoLicencia = "activa"
	LicenciaExpirada      EstadoLicencia = "expirada"
	LicenciaNoConfigurada EstadoLicencia = "no_configurada"
)

type InfoLicencia struct {
	Estado          EstadoLicencia `json:"estado"`
	FechaActivacion time.Time      `json:"fechaActivacion,omitempty"`
	FechaExpiracion time.Time      `json:"fechaExpiracion,omitempty"`
	DiasRestantes   int            `json:"diasRestantes"`
	Mensaje         string         `json:"mensaje"`
}
