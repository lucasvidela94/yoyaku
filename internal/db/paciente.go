package db

import (
	"database/sql"
	"strings"
	"time"

	"yoyaku/internal/models"
)

type PacienteRepo struct {
	db *DB
}

func NewPacienteRepo(db *DB) *PacienteRepo {
	return &PacienteRepo{db: db}
}

func (r *PacienteRepo) Crear(paciente *models.Paciente) error {
	query := `
		INSERT INTO pacientes (nombre, telefono, email, notas)
		VALUES (?, ?, ?, ?)
		RETURNING id, created_at, updated_at
	`

	return r.db.Conn().QueryRow(
		query,
		paciente.Nombre,
		paciente.Telefono,
		paciente.Email,
		paciente.Notas,
	).Scan(&paciente.ID, &paciente.CreatedAt, &paciente.UpdatedAt)
}

func (r *PacienteRepo) ObtenerPorID(id int64) (*models.Paciente, error) {
	query := `SELECT id, nombre, telefono, email, notas, created_at, updated_at FROM pacientes WHERE id = ?`

	paciente := &models.Paciente{}
	err := r.db.Conn().QueryRow(query, id).Scan(
		&paciente.ID, &paciente.Nombre, &paciente.Telefono, &paciente.Email,
		&paciente.Notas, &paciente.CreatedAt, &paciente.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return paciente, nil
}

func (r *PacienteRepo) Buscar(termino string) ([]models.Paciente, error) {
	query := `
		SELECT id, nombre, telefono, email, notas, created_at, updated_at 
		FROM pacientes 
		WHERE nombre LIKE ? OR telefono LIKE ?
		ORDER BY nombre
		LIMIT 20
	`

	terminoBusqueda := "%" + strings.ToLower(termino) + "%"
	rows, err := r.db.Conn().Query(query, terminoBusqueda, terminoBusqueda)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return r.scanRows(rows)
}

func (r *PacienteRepo) ListarTodos() ([]models.Paciente, error) {
	query := `SELECT id, nombre, telefono, email, notas, created_at, updated_at FROM pacientes ORDER BY nombre`

	rows, err := r.db.Conn().Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return r.scanRows(rows)
}

func (r *PacienteRepo) Actualizar(paciente *models.Paciente) error {
	query := `
		UPDATE pacientes 
		SET nombre = ?, telefono = ?, email = ?, notas = ?, updated_at = CURRENT_TIMESTAMP
		WHERE id = ?
	`
	_, err := r.db.Conn().Exec(
		query,
		paciente.Nombre,
		paciente.Telefono,
		paciente.Email,
		paciente.Notas,
		paciente.ID,
	)
	return err
}

func (r *PacienteRepo) Eliminar(id int64) error {
	query := `DELETE FROM pacientes WHERE id = ?`
	_, err := r.db.Conn().Exec(query, id)
	return err
}

func (r *PacienteRepo) TieneNoShowReciente(pacienteID int64, meses int) (bool, error) {
	query := `
		SELECT COUNT(*) FROM historial_no_shows 
		WHERE paciente_id = ? AND fecha >= date('now', '-3 months')
	`

	var count int
	err := r.db.Conn().QueryRow(query, pacienteID).Scan(&count)
	if err != nil {
		return false, err
	}

	return count > 0, nil
}

func (r *PacienteRepo) RegistrarNoShow(pacienteID, turnoID int64, fecha time.Time) error {
	query := `
		INSERT INTO historial_no_shows (paciente_id, turno_id, fecha)
		VALUES (?, ?, ?)
	`
	_, err := r.db.Conn().Exec(query, pacienteID, turnoID, fecha.Format("2006-01-02"))
	return err
}

func (r *PacienteRepo) scanRows(rows *sql.Rows) ([]models.Paciente, error) {
	var pacientes []models.Paciente

	for rows.Next() {
		paciente := models.Paciente{}
		err := rows.Scan(
			&paciente.ID, &paciente.Nombre, &paciente.Telefono, &paciente.Email,
			&paciente.Notas, &paciente.CreatedAt, &paciente.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		pacientes = append(pacientes, paciente)
	}

	return pacientes, rows.Err()
}
