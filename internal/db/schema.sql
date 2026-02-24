-- Tabla de pacientes
CREATE TABLE IF NOT EXISTS pacientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    telefono TEXT NOT NULL,
    email TEXT,
    notas TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de turnos
CREATE TABLE IF NOT EXISTS turnos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente_id INTEGER NOT NULL,
    fecha DATE NOT NULL,
    hora TEXT NOT NULL,
    duracion INTEGER DEFAULT 30,
    motivo TEXT,
    estado TEXT DEFAULT 'pendiente',
    notas TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
);

-- Tabla de historial de no-shows
CREATE TABLE IF NOT EXISTS historial_no_shows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente_id INTEGER NOT NULL,
    turno_id INTEGER NOT NULL,
    fecha DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
    FOREIGN KEY (turno_id) REFERENCES turnos(id) ON DELETE CASCADE
);

-- Tabla de configuración del consultorio
CREATE TABLE IF NOT EXISTS configuracion (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    nombre_consultorio TEXT DEFAULT 'Consultorio Médico',
    nombre_medico TEXT,
    telefono_consultorio TEXT,
    direccion TEXT,
    mensaje_confirmacion TEXT DEFAULT 'Hola {nombre}, le confirmamos su turno para el {fecha} a las {hora}. Por favor responda "CONFIRMAR" o "CANCELAR".',
    mensaje_recordatorio TEXT DEFAULT 'Hola {nombre}, le recordamos su turno mañana {fecha} a las {hora}.',
    mensaje_demora TEXT DEFAULT 'Hola {nombre}, le informamos que el consultorio tiene {minutos} minutos de demora. Su turno será atendido lo antes posible.',
    horario_atencion TEXT DEFAULT 'Lunes a Viernes de 9:00 a 18:00',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insertar configuración por defecto si no existe
INSERT OR IGNORE INTO configuracion (id) VALUES (1);

-- Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_turnos_fecha ON turnos(fecha);
CREATE INDEX IF NOT EXISTS idx_turnos_paciente ON turnos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_turnos_estado ON turnos(estado);
CREATE INDEX IF NOT EXISTS idx_historial_paciente ON historial_no_shows(paciente_id);
CREATE INDEX IF NOT EXISTS idx_historial_fecha ON historial_no_shows(fecha);
