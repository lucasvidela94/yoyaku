package db

import (
	"database/sql"
	"fmt"
	"time"

	"yoyaku/internal/models"
)

type TurnoRepo struct {
	db *DB
}

func NewTurnoRepo(db *DB) *TurnoRepo {
	return &TurnoRepo{db: db}
}

func (r *TurnoRepo) Crear(turno *models.Turno) error {
	query := `
		INSERT INTO turnos (paciente_id, fecha, hora, duracion, motivo, estado, notas)
		VALUES (?, ?, ?, ?, ?, ?, ?)
		RETURNING id, created_at, updated_at
	`

	return r.db.Conn().QueryRow(
		query,
		turno.PacienteID,
		turno.Fecha.Format("2006-01-02"),
		turno.Hora,
		turno.Duracion,
		turno.Motivo,
		string(turno.Estado),
		turno.Notas,
	).Scan(&turno.ID, &turno.CreatedAt, &turno.UpdatedAt)
}

func (r *TurnoRepo) ObtenerPorID(id int64) (*models.Turno, error) {
	query := `
		SELECT t.id, t.paciente_id, t.fecha, t.hora, t.duracion, t.motivo, t.estado, t.notas, t.created_at, t.updated_at,
		       p.id, p.nombre, p.telefono, p.email, p.notas, p.created_at, p.updated_at
		FROM turnos t
		JOIN pacientes p ON t.paciente_id = p.id
		WHERE t.id = ?
	`

	turno := &models.Turno{}
	paciente := &models.Paciente{}
	var fechaStr string

	err := r.db.Conn().QueryRow(query, id).Scan(
		&turno.ID, &turno.PacienteID, &fechaStr, &turno.Hora, &turno.Duracion, &turno.Motivo, &turno.Estado, &turno.Notas, &turno.CreatedAt, &turno.UpdatedAt,
		&paciente.ID, &paciente.Nombre, &paciente.Telefono, &paciente.Email, &paciente.Notas, &paciente.CreatedAt, &paciente.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	turno.Fecha, _ = time.Parse("2006-01-02", fechaStr)
	turno.Paciente = paciente

	return turno, nil
}

func (r *TurnoRepo) ListarPorFecha(fecha time.Time) ([]models.Turno, error) {
	query := `
		SELECT t.id, t.paciente_id, t.fecha, t.hora, t.duracion, t.motivo, t.estado, t.notas, t.created_at, t.updated_at,
		       p.id, p.nombre, p.telefono, p.email, p.notas, p.created_at, p.updated_at
		FROM turnos t
		JOIN pacientes p ON t.paciente_id = p.id
		WHERE t.fecha = ?
		ORDER BY t.hora
	`

	rows, err := r.db.Conn().Query(query, fecha.Format("2006-01-02"))
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return r.scanRows(rows)
}

func (r *TurnoRepo) ListarPorPaciente(pacienteID int64) ([]models.Turno, error) {
	query := `
		SELECT t.id, t.paciente_id, t.fecha, t.hora, t.duracion, t.motivo, t.estado, t.notas, t.created_at, t.updated_at,
		       p.id, p.nombre, p.telefono, p.email, p.notas, p.created_at, p.updated_at
		FROM turnos t
		JOIN pacientes p ON t.paciente_id = p.id
		WHERE t.paciente_id = ?
		ORDER BY t.fecha DESC, t.hora DESC
	`

	rows, err := r.db.Conn().Query(query, pacienteID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return r.scanRows(rows)
}

func (r *TurnoRepo) ActualizarEstado(id int64, estado models.EstadoTurno) error {
	query := `UPDATE turnos SET estado = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
	_, err := r.db.Conn().Exec(query, string(estado), id)
	return err
}

func (r *TurnoRepo) Actualizar(turno *models.Turno) error {
	query := `
		UPDATE turnos 
		SET paciente_id = ?, fecha = ?, hora = ?, duracion = ?, motivo = ?, estado = ?, notas = ?, updated_at = CURRENT_TIMESTAMP
		WHERE id = ?
	`
	_, err := r.db.Conn().Exec(
		query,
		turno.PacienteID,
		turno.Fecha.Format("2006-01-02"),
		turno.Hora,
		turno.Duracion,
		turno.Motivo,
		string(turno.Estado),
		turno.Notas,
		turno.ID,
	)
	return err
}

func (r *TurnoRepo) Eliminar(id int64) error {
	query := `DELETE FROM turnos WHERE id = ?`
	_, err := r.db.Conn().Exec(query, id)
	return err
}

func (r *TurnoRepo) scanRows(rows *sql.Rows) ([]models.Turno, error) {
	var turnos []models.Turno

	for rows.Next() {
		turno := models.Turno{}
		paciente := models.Paciente{}
		var fechaStr string

		err := rows.Scan(
			&turno.ID, &turno.PacienteID, &fechaStr, &turno.Hora, &turno.Duracion, &turno.Motivo, &turno.Estado, &turno.Notas, &turno.CreatedAt, &turno.UpdatedAt,
			&paciente.ID, &paciente.Nombre, &paciente.Telefono, &paciente.Email, &paciente.Notas, &paciente.CreatedAt, &paciente.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("error escaneando turno: %w", err)
		}

		turno.Fecha, _ = time.Parse("2006-01-02", fechaStr)
		turno.Paciente = &paciente
		turnos = append(turnos, turno)
	}

	return turnos, rows.Err()
}
