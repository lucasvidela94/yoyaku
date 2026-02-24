package db

import (
	"yoyaku/internal/models"
)

type ConfigRepo struct {
	db *DB
}

func NewConfigRepo(db *DB) *ConfigRepo {
	return &ConfigRepo{db: db}
}

func (r *ConfigRepo) Obtener() (*models.Configuracion, error) {
	query := `
		SELECT id, nombre_consultorio, nombre_medico, telefono_consultorio, 
		       direccion, mensaje_confirmacion, mensaje_recordatorio, 
		       mensaje_demora, horario_atencion, updated_at
		FROM configuracion 
		WHERE id = 1
	`

	config := &models.Configuracion{}
	err := r.db.Conn().QueryRow(query).Scan(
		&config.ID,
		&config.NombreConsultorio,
		&config.NombreMedico,
		&config.TelefonoConsultorio,
		&config.Direccion,
		&config.MensajeConfirmacion,
		&config.MensajeRecordatorio,
		&config.MensajeDemora,
		&config.HorarioAtencion,
		&config.UpdatedAt,
	)
	if err != nil {
		// Si no existe, crear configuración por defecto
		config = &models.Configuracion{
			ID:                  1,
			NombreConsultorio:   "Consultorio Médico",
			MensajeConfirmacion: "Hola {nombre}, le confirmamos su turno para el {fecha} a las {hora}. Por favor responda \"CONFIRMAR\" o \"CANCELAR\".",
			MensajeRecordatorio: "Hola {nombre}, le recordamos su turno mañana {fecha} a las {hora}.",
			MensajeDemora:       "Hola {nombre}, le informamos que el consultorio tiene {minutos} minutos de demora. Su turno será atendido lo antes posible.",
			HorarioAtencion:     "Lunes a Viernes de 9:00 a 18:00",
		}
		// Insertar en la base de datos
		insertQuery := `
			INSERT OR REPLACE INTO configuracion 
			(id, nombre_consultorio, nombre_medico, telefono_consultorio, 
			 direccion, mensaje_confirmacion, mensaje_recordatorio, 
			 mensaje_demora, horario_atencion)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
		`
		_, insertErr := r.db.Conn().Exec(insertQuery,
			config.ID,
			config.NombreConsultorio,
			config.NombreMedico,
			config.TelefonoConsultorio,
			config.Direccion,
			config.MensajeConfirmacion,
			config.MensajeRecordatorio,
			config.MensajeDemora,
			config.HorarioAtencion,
		)
		if insertErr != nil {
			return nil, insertErr
		}
		return config, nil
	}

	return config, nil
}

func (r *ConfigRepo) Guardar(config *models.Configuracion) error {
	query := `
		UPDATE configuracion SET
			nombre_consultorio = ?,
			nombre_medico = ?,
			telefono_consultorio = ?,
			direccion = ?,
			mensaje_confirmacion = ?,
			mensaje_recordatorio = ?,
			mensaje_demora = ?,
			horario_atencion = ?,
			updated_at = CURRENT_TIMESTAMP
		WHERE id = 1
	`

	_, err := r.db.Conn().Exec(
		query,
		config.NombreConsultorio,
		config.NombreMedico,
		config.TelefonoConsultorio,
		config.Direccion,
		config.MensajeConfirmacion,
		config.MensajeRecordatorio,
		config.MensajeDemora,
		config.HorarioAtencion,
	)

	return err
}
