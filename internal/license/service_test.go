package license

import (
	"testing"
	"time"
	"yoyaku/internal/db"
	"yoyaku/internal/models"
)

// MockLicenseRepo es un mock del repositorio de licencias para testing
type MockLicenseRepo struct {
	licencia      *models.Licencia
	errObtener    error
	errGuardar    error
	guardarCalled bool
}

func (m *MockLicenseRepo) Obtener() (*models.Licencia, error) {
	return m.licencia, m.errObtener
}

func (m *MockLicenseRepo) Guardar(licencia *models.Licencia) error {
	m.guardarCalled = true
	m.licencia = licencia
	return m.errGuardar
}

func (m *MockLicenseRepo) TieneLicenciaActiva() (bool, error) {
	if m.errObtener != nil {
		return false, m.errObtener
	}
	if m.licencia == nil {
		return false, nil
	}
	return m.licencia.Activa && time.Now().Before(m.licencia.FechaExpiracion), nil
}

func TestNewService(t *testing.T) {
	mockRepo := &MockLicenseRepo{}
	service := NewService(mockRepo)

	if service == nil {
		t.Fatal("NewService returned nil")
	}

	if service.repo != mockRepo {
		t.Error("Service repository not set correctly")
	}

	if service.generator == nil {
		t.Error("Service generator not initialized")
	}
}

func TestValidarLicencia(t *testing.T) {
	mockRepo := &MockLicenseRepo{}
	service := NewService(mockRepo)

	// Generar una licencia válida
	generator := NewGenerator("yoyaku_secret_2024")
	validKey := generator.GenerateLicenseKey(2025)

	tests := []struct {
		name           string
		key            string
		mockErrGuardar error
		wantErr        bool
		errContains    string
		wantEstado     models.EstadoLicencia
	}{
		{
			name:       "Licencia válida 2025",
			key:        validKey,
			wantErr:    false,
			wantEstado: models.LicenciaActiva,
		},
		{
			name:        "Licencia inválida",
			key:         "YOY2025-XXXX-YYYY",
			wantErr:     true,
			errContains: "inválida",
		},
		{
			name:        "Formato inválido",
			key:         "invalid-key",
			wantErr:     true,
			errContains: "formato",
		},
		{
			name:           "Error al guardar",
			key:            validKey,
			mockErrGuardar: errTest,
			wantErr:        true,
			errContains:    "guardando",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo.guardarCalled = false
			mockRepo.errGuardar = tt.mockErrGuardar

			info, err := service.ValidarLicencia(tt.key)

			if tt.wantErr {
				if err == nil {
					t.Error("ValidarLicencia() expected error but got none")
					return
				}
				if tt.errContains != "" && !containsStr(err.Error(), tt.errContains) {
					t.Errorf("ValidarLicencia() error = %v, should contain '%s'", err, tt.errContains)
				}
				return
			}

			if err != nil {
				t.Errorf("ValidarLicencia() unexpected error = %v", err)
				return
			}

			if info == nil {
				t.Fatal("ValidarLicencia() returned nil info")
			}

			if info.Estado != tt.wantEstado {
				t.Errorf("ValidarLicencia() estado = %v, want %v", info.Estado, tt.wantEstado)
			}

			if !mockRepo.guardarCalled {
				t.Error("ValidarLicencia() should call Guardar")
			}

			// Verificar que la licencia se guardó correctamente
			if mockRepo.licencia != nil {
				if mockRepo.licencia.LicenseKey != tt.key {
					t.Errorf("Guardar() key = %v, want %v", mockRepo.licencia.LicenseKey, tt.key)
				}
				if !mockRepo.licencia.Activa {
					t.Error("Guardar() licencia should be active")
				}
			}
		})
	}
}

func TestObtenerInfoLicencia(t *testing.T) {
	now := time.Now()

	tests := []struct {
		name       string
		licencia   *models.Licencia
		mockErr    error
		wantEstado models.EstadoLicencia
		wantErr    bool
	}{
		{
			name:       "Sin licencia configurada",
			licencia:   nil,
			wantEstado: models.LicenciaNoConfigurada,
			wantErr:    false,
		},
		{
			name: "Licencia activa - muchos días",
			licencia: &models.Licencia{
				LicenseKey:      "YOY2025-TEST-TEST",
				FechaActivacion: now.AddDate(0, 0, -30),
				FechaExpiracion: now.AddDate(0, 0, 335),
				Activa:          true,
				Version:         "2025.0.0",
			},
			wantEstado: models.LicenciaActiva,
			wantErr:    false,
		},
		{
			name: "Licencia activa - por expirar",
			licencia: &models.Licencia{
				LicenseKey:      "YOY2025-TEST-TEST",
				FechaActivacion: now.AddDate(0, 0, -340),
				FechaExpiracion: now.AddDate(0, 0, 25),
				Activa:          true,
				Version:         "2025.0.0",
			},
			wantEstado: models.LicenciaActiva,
			wantErr:    false,
		},
		{
			name: "Licencia expirada",
			licencia: &models.Licencia{
				LicenseKey:      "YOY2024-TEST-TEST",
				FechaActivacion: now.AddDate(-2, 0, 0),
				FechaExpiracion: now.AddDate(-1, 0, 0),
				Activa:          true,
				Version:         "2024.0.0",
			},
			wantEstado: models.LicenciaExpirada,
			wantErr:    false,
		},
		{
			name:       "Error al obtener",
			licencia:   nil,
			mockErr:    errTest,
			wantEstado: "",
			wantErr:    true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := &MockLicenseRepo{
				licencia:   tt.licencia,
				errObtener: tt.mockErr,
			}
			service := NewService(mockRepo)

			info, err := service.ObtenerInfoLicencia()

			if tt.wantErr {
				if err == nil {
					t.Error("ObtenerInfoLicencia() expected error but got none")
				}
				return
			}

			if err != nil {
				t.Errorf("ObtenerInfoLicencia() unexpected error = %v", err)
				return
			}

			if info == nil {
				t.Fatal("ObtenerInfoLicencia() returned nil info")
			}

			if info.Estado != tt.wantEstado {
				t.Errorf("ObtenerInfoLicencia() estado = %v, want %v", info.Estado, tt.wantEstado)
			}

			// Verificar mensaje no vacío
			if info.Mensaje == "" {
				t.Error("ObtenerInfoLicencia() mensaje should not be empty")
			}

			// Verificar días restantes
			if tt.licencia != nil {
				expectedDays := int(tt.licencia.FechaExpiracion.Sub(now).Hours() / 24)
				// Permitir margen de error de 1 día por redondeo
				if abs(info.DiasRestantes-expectedDays) > 1 {
					t.Errorf("ObtenerInfoLicencia() diasRestantes = %d, want ~%d",
						info.DiasRestantes, expectedDays)
				}
			}
		})
	}
}

func TestRequiereActivacion(t *testing.T) {
	tests := []struct {
		name     string
		licencia *models.Licencia
		mockErr  error
		want     bool
		wantErr  bool
	}{
		{
			name:     "Sin licencia - requiere activación",
			licencia: nil,
			want:     true,
			wantErr:  false,
		},
		{
			name: "Con licencia - no requiere activación",
			licencia: &models.Licencia{
				LicenseKey:      "YOY2025-TEST-TEST",
				FechaActivacion: time.Now(),
				FechaExpiracion: time.Now().AddDate(1, 0, 0),
				Activa:          true,
			},
			want:    false,
			wantErr: false,
		},
		{
			name:     "Error al obtener",
			licencia: nil,
			mockErr:  errTest,
			want:     false,
			wantErr:  true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := &MockLicenseRepo{
				licencia:   tt.licencia,
				errObtener: tt.mockErr,
			}
			service := NewService(mockRepo)

			requiere, err := service.RequiereActivacion()

			if tt.wantErr {
				if err == nil {
					t.Error("RequiereActivacion() expected error but got none")
				}
				return
			}

			if err != nil {
				t.Errorf("RequiereActivacion() unexpected error = %v", err)
				return
			}

			if requiere != tt.want {
				t.Errorf("RequiereActivacion() = %v, want %v", requiere, tt.want)
			}
		})
	}
}

func TestValidarLicencia_Integration(t *testing.T) {
	// Test de integración que usa el generador real
	tempDir := t.TempDir()
	database, err := db.NewDB(tempDir)
	if err != nil {
		t.Fatalf("Failed to create test database: %v", err)
	}
	defer database.Close()

	repo := db.NewLicenseRepo(database)
	service := NewService(repo)

	// Generar licencia válida
	generator := NewGenerator("yoyaku_secret_2024")
	validKey := generator.GenerateLicenseKey(2025)

	// Validar y activar
	info, err := service.ValidarLicencia(validKey)
	if err != nil {
		t.Fatalf("ValidarLicencia() failed: %v", err)
	}

	if info.Estado != models.LicenciaActiva {
		t.Errorf("Expected estado activa, got %v", info.Estado)
	}

	// Verificar que se guardó en la base de datos
	licencia, err := repo.Obtener()
	if err != nil {
		t.Fatalf("Failed to get license from DB: %v", err)
	}

	if licencia == nil {
		t.Fatal("License not saved to database")
	}

	if licencia.LicenseKey != validKey {
		t.Errorf("License key mismatch: got %v, want %v", licencia.LicenseKey, validKey)
	}

	if !licencia.Activa {
		t.Error("License should be active")
	}

	// Verificar que ya no requiere activación
	requiere, err := service.RequiereActivacion()
	if err != nil {
		t.Fatalf("RequiereActivacion() failed: %v", err)
	}

	if requiere {
		t.Error("Should not require activation after validation")
	}

	// Obtener info de licencia
	info2, err := service.ObtenerInfoLicencia()
	if err != nil {
		t.Fatalf("ObtenerInfoLicencia() failed: %v", err)
	}

	if info2.Estado != models.LicenciaActiva {
		t.Errorf("Expected estado activa from ObtenerInfoLicencia, got %v", info2.Estado)
	}
}

// Helper functions
var errTest = errTestType{}

type errTestType struct{}

func (e errTestType) Error() string {
	return "test error"
}

func containsStr(s, substr string) bool {
	return len(s) >= len(substr) && (s == substr || len(substr) == 0 ||
		(s[0:len(substr)] == substr) || containsStr(s[1:], substr))
}

func abs(n int) int {
	if n < 0 {
		return -n
	}
	return n
}
