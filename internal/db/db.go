package db

import (
	"database/sql"
	"embed"
	"fmt"
	"os"
	"path/filepath"

	_ "modernc.org/sqlite"
)

//go:embed schema.sql
var schemaFS embed.FS

type DB struct {
	conn *sql.DB
}

func NewDB(dataDir string) (*DB, error) {
	if err := os.MkdirAll(dataDir, 0755); err != nil {
		return nil, fmt.Errorf("error creando directorio de datos: %w", err)
	}

	dbPath := filepath.Join(dataDir, "yoyaku.db")
	conn, err := sql.Open("sqlite", dbPath)
	if err != nil {
		return nil, fmt.Errorf("error abriendo base de datos: %w", err)
	}

	if err := conn.Ping(); err != nil {
		return nil, fmt.Errorf("error conectando a base de datos: %w", err)
	}

	db := &DB{conn: conn}
	if err := db.migrate(); err != nil {
		return nil, fmt.Errorf("error migrando base de datos: %w", err)
	}

	return db, nil
}

func (d *DB) migrate() error {
	schema, err := schemaFS.ReadFile("schema.sql")
	if err != nil {
		return fmt.Errorf("error leyendo schema: %w", err)
	}

	_, err = d.conn.Exec(string(schema))
	if err != nil {
		return fmt.Errorf("error ejecutando schema: %w", err)
	}

	return nil
}

func (d *DB) Close() error {
	return d.conn.Close()
}

func (d *DB) Conn() *sql.DB {
	return d.conn
}
