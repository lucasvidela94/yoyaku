package db

import (
	"os"
	"testing"
	"time"
	"yoyaku/internal/models"
)

func setupTestDB(t *testing.T) (*DB, func()) {
	tempDir, err := os.MkdirTemp("", "yoyaku-test-*")
	if err != nil {
		t.Fatalf("Failed to create temp dir: %v", err)
	}

	db, err := NewDB(tempDir)
	if err != nil {
		os.RemoveAll(tempDir)
		t.Fatalf("Failed to create test database: %v", err)
	}

	cleanup := func() {
		db.Close()
		os.RemoveAll(tempDir)
	}

	return db, cleanup
}

func TestNewLicenseRepo(t *testing.T) {
	db, cleanup := setupTestDB(t)
	defer cleanup()

	repo := NewLicenseRepo(db)
	if repo == nil {
		t.Fatal("NewLicenseRepo returned nil")
	}

	if repo.db != db {
		t.Error("Repository database not set correctly")
	}
}

func TestLicenseRepo_Obtener(t *testing.T) {
	db, cleanup := setupTestDB(t)
	defer cleanup()

	repo := NewLicenseRepo(db)

	t.Run("Sin licencia guardada", func(t *testing.T) {
		licencia, err := repo.Obtener()
		if err != nil {
			t.Errorf("Obtener() unexpected error = %v", err)
		}
		if licencia != nil {
			t.Error("Obtener() should return nil when no license exists")
		}
	})

	t.Run("Con licencia guardada", func(t *testing.T) {
		// Crear y guardar una licencia
		expectedLicencia := &models.Licencia{
			LicenseKey:      "YOY2025-TEST-TEST",
			FechaActivacion: time.Date(2025, 1, 1, 0, 0, 0, 0, time.UTC),
			FechaExpiracion: time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC),
			Activa:          true,
			Version:         "2025.0.0",
		}

		err := repo.Guardar(expectedLicencia)
		if err != nil {
			t.Fatalf("Guardar() failed: %v", err)
		}

		// Obtener la licencia
		licencia, err := repo.Obtener()
		if err != nil {
			t.Fatalf("Obtener() failed: %v", err)
		}

		if licencia == nil {
			t.Fatal("Obtener() returned nil after saving")
		}

		// Verificar campos
		if licencia.LicenseKey != expectedLicencia.LicenseKey {
			t.Errorf("LicenseKey = %v, want %v", licencia.LicenseKey, expectedLicencia.LicenseKey)
		}

		if !licencia.FechaActivacion.Equal(expectedLicencia.FechaActivacion) {
			t.Errorf("FechaActivacion = %v, want %v", licencia.FechaActivacion, expectedLicencia.FechaActivacion)
		}

		if !licencia.FechaExpiracion.Equal(expectedLicencia.FechaExpiracion) {
			t.Errorf("FechaExpiracion = %v, want %v", licencia.FechaExpiracion, expectedLicencia.FechaExpiracion)
		}

		if licencia.Activa != expectedLicencia.Activa {
			t.Errorf("Activa = %v, want %v", licencia.Activa, expectedLicencia.Activa)
		}

		if licencia.Version != expectedLicencia.Version {
			t.Errorf("Version = %v, want %v", licencia.Version, expectedLicencia.Version)
		}
	})
}

func TestLicenseRepo_Guardar(t *testing.T) {
	db, cleanup := setupTestDB(t)
	defer cleanup()

	repo := NewLicenseRepo(db)

	t.Run("Guardar nueva licencia", func(t *testing.T) {
		licencia := &models.Licencia{
			LicenseKey:      "YOY2025-NEW-TEST",
			FechaActivacion: time.Now(),
			FechaExpiracion: time.Now().AddDate(1, 0, 0),
			Activa:          true,
			Version:         "2025.0.0",
		}

		err := repo.Guardar(licencia)
		if err != nil {
			t.Errorf("Guardar() error = %v", err)
		}

		// Verificar que se guardó
		saved, err := repo.Obtener()
		if err != nil {
			t.Fatalf("Obtener() failed: %v", err)
		}

		if saved == nil {
			t.Fatal("License was not saved")
		}

		if saved.LicenseKey != licencia.LicenseKey {
			t.Errorf("Saved LicenseKey = %v, want %v", saved.LicenseKey, licencia.LicenseKey)
		}
	})

	t.Run("Actualizar licencia existente", func(t *testing.T) {
		// Primera licencia
		licencia1 := &models.Licencia{
			LicenseKey:      "YOY2025-FIRST",
			FechaActivacion: time.Now(),
			FechaExpiracion: time.Now().AddDate(1, 0, 0),
			Activa:          true,
			Version:         "2025.0.0",
		}

		err := repo.Guardar(licencia1)
		if err != nil {
			t.Fatalf("First Guardar() failed: %v", err)
		}

		// Segunda licencia (debería reemplazar la primera)
		licencia2 := &models.Licencia{
			LicenseKey:      "YOY2026-SECOND",
			FechaActivacion: time.Now().AddDate(1, 0, 0),
			FechaExpiracion: time.Now().AddDate(2, 0, 0),
			Activa:          true,
			Version:         "2026.0.0",
		}

		err = repo.Guardar(licencia2)
		if err != nil {
			t.Fatalf("Second Guardar() failed: %v", err)
		}

		// Verificar que se actualizó
		saved, err := repo.Obtener()
		if err != nil {
			t.Fatalf("Obtener() failed: %v", err)
		}

		if saved.LicenseKey != licencia2.LicenseKey {
			t.Errorf("License was not updated. Got %v, want %v", saved.LicenseKey, licencia2.LicenseKey)
		}

		if saved.Version != "2026.0.0" {
			t.Errorf("Version was not updated. Got %v, want 2026.0.0", saved.Version)
		}
	})
}

func TestLicenseRepo_TieneLicenciaActiva(t *testing.T) {
	db, cleanup := setupTestDB(t)
	defer cleanup()

	repo := NewLicenseRepo(db)

	t.Run("Sin licencia", func(t *testing.T) {
		activa, err := repo.TieneLicenciaActiva()
		if err != nil {
			t.Errorf("TieneLicenciaActiva() error = %v", err)
		}
		if activa {
			t.Error("TieneLicenciaActiva() should return false when no license exists")
		}
	})

	t.Run("Licencia activa y vigente", func(t *testing.T) {
		licencia := &models.Licencia{
			LicenseKey:      "YOY2025-ACTIVE",
			FechaActivacion: time.Now().AddDate(0, 0, -30),
			FechaExpiracion: time.Now().AddDate(0, 0, 335),
			Activa:          true,
			Version:         "2025.0.0",
		}

		err := repo.Guardar(licencia)
		if err != nil {
			t.Fatalf("Guardar() failed: %v", err)
		}

		activa, err := repo.TieneLicenciaActiva()
		if err != nil {
			t.Errorf("TieneLicenciaActiva() error = %v", err)
		}
		if !activa {
			t.Error("TieneLicenciaActiva() should return true for active license")
		}
	})

	t.Run("Licencia inactiva", func(t *testing.T) {
		// Crear nueva DB para este test
		db2, cleanup2 := setupTestDB(t)
		defer cleanup2()
		repo2 := NewLicenseRepo(db2)

		licencia := &models.Licencia{
			LicenseKey:      "YOY2025-INACTIVE",
			FechaActivacion: time.Now(),
			FechaExpiracion: time.Now().AddDate(1, 0, 0),
			Activa:          false,
			Version:         "2025.0.0",
		}

		err := repo2.Guardar(licencia)
		if err != nil {
			t.Fatalf("Guardar() failed: %v", err)
		}

		activa, err := repo2.TieneLicenciaActiva()
		if err != nil {
			t.Errorf("TieneLicenciaActiva() error = %v", err)
		}
		if activa {
			t.Error("TieneLicenciaActiva() should return false for inactive license")
		}
	})

	t.Run("Licencia expirada", func(t *testing.T) {
		// Crear nueva DB para este test
		db3, cleanup3 := setupTestDB(t)
		defer cleanup3()
		repo3 := NewLicenseRepo(db3)

		licencia := &models.Licencia{
			LicenseKey:      "YOY2024-EXPIRED",
			FechaActivacion: time.Now().AddDate(-2, 0, 0),
			FechaExpiracion: time.Now().AddDate(-1, 0, 0),
			Activa:          true,
			Version:         "2024.0.0",
		}

		err := repo3.Guardar(licencia)
		if err != nil {
			t.Fatalf("Guardar() failed: %v", err)
		}

		activa, err := repo3.TieneLicenciaActiva()
		if err != nil {
			t.Errorf("TieneLicenciaActiva() error = %v", err)
		}
		if activa {
			t.Error("TieneLicenciaActiva() should return false for expired license")
		}
	})
}

func TestLicenseRepo_ConcurrentAccess(t *testing.T) {
	db, cleanup := setupTestDB(t)
	defer cleanup()

	repo := NewLicenseRepo(db)

	// Guardar una licencia inicial
	licencia := &models.Licencia{
		LicenseKey:      "YOY2025-CONCURRENT",
		FechaActivacion: time.Now(),
		FechaExpiracion: time.Now().AddDate(1, 0, 0),
		Activa:          true,
		Version:         "2025.0.0",
	}

	err := repo.Guardar(licencia)
	if err != nil {
		t.Fatalf("Initial Guardar() failed: %v", err)
	}

	// Realizar múltiples lecturas concurrentes
	done := make(chan bool, 10)
	for i := 0; i < 10; i++ {
		go func() {
			_, err := repo.Obtener()
			if err != nil {
				t.Errorf("Concurrent Obtener() error = %v", err)
			}
			done <- true
		}()
	}

	// Esperar a que todas las goroutines terminen
	for i := 0; i < 10; i++ {
		<-done
	}
}
