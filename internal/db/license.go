package db

import (
	"database/sql"
	"time"
	"yoyaku/internal/models"
)

type LicenseRepo struct {
	db *DB
}

func NewLicenseRepo(db *DB) *LicenseRepo {
	return &LicenseRepo{db: db}
}

func (r *LicenseRepo) Obtener() (*models.Licencia, error) {
	var licencia models.Licencia
	var fechaActivacion, fechaExpiracion sql.NullTime

	err := r.db.conn.QueryRow(`
		SELECT id, license_key, fecha_activacion, fecha_expiracion, activa, version
		FROM licencias
		WHERE id = 1
	`).Scan(
		&licencia.ID,
		&licencia.LicenseKey,
		&fechaActivacion,
		&fechaExpiracion,
		&licencia.Activa,
		&licencia.Version,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}

	if err != nil {
		return nil, err
	}

	if fechaActivacion.Valid {
		licencia.FechaActivacion = fechaActivacion.Time
	}
	if fechaExpiracion.Valid {
		licencia.FechaExpiracion = fechaExpiracion.Time
	}

	return &licencia, nil
}

func (r *LicenseRepo) Guardar(licencia *models.Licencia) error {
	_, err := r.db.conn.Exec(`
		INSERT INTO licencias (id, license_key, fecha_activacion, fecha_expiracion, activa, version)
		VALUES (1, ?, ?, ?, ?, ?)
		ON CONFLICT(id) DO UPDATE SET
			license_key = excluded.license_key,
			fecha_activacion = excluded.fecha_activacion,
			fecha_expiracion = excluded.fecha_expiracion,
			activa = excluded.activa,
			version = excluded.version
	`,
		licencia.LicenseKey,
		licencia.FechaActivacion,
		licencia.FechaExpiracion,
		licencia.Activa,
		licencia.Version,
	)
	return err
}

func (r *LicenseRepo) TieneLicenciaActiva() (bool, error) {
	licencia, err := r.Obtener()
	if err != nil {
		return false, err
	}

	if licencia == nil {
		return false, nil
	}

	return licencia.Activa && time.Now().Before(licencia.FechaExpiracion), nil
}
