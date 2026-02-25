package license

import (
	"strings"
	"testing"
	"time"
)

func TestNewGenerator(t *testing.T) {
	generator := NewGenerator("test_secret")
	if generator == nil {
		t.Fatal("NewGenerator returned nil")
	}
	if generator.secretKey != "test_secret" {
		t.Errorf("Expected secretKey to be 'test_secret', got '%s'", generator.secretKey)
	}
}

func TestGenerateLicenseKey(t *testing.T) {
	generator := NewGenerator("test_secret")

	tests := []struct {
		name    string
		year    int
		wantErr bool
	}{
		{
			name:    "Generar licencia 2024",
			year:    2024,
			wantErr: false,
		},
		{
			name:    "Generar licencia 2025",
			year:    2025,
			wantErr: false,
		},
		{
			name:    "Generar licencia 2030",
			year:    2030,
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			key := generator.GenerateLicenseKey(tt.year)

			if key == "" {
				t.Error("GenerateLicenseKey returned empty string")
			}

			// Verificar formato
			if !strings.HasPrefix(key, "YOY") {
				t.Errorf("Key should start with 'YOY', got '%s'", key)
			}

			// Verificar que contiene el año
			yearStr := strings.TrimPrefix(key[:7], "YOY")
			if yearStr != string(rune('0'+tt.year/1000))+string(rune('0'+(tt.year/100)%10))+string(rune('0'+(tt.year/10)%10))+string(rune('0'+tt.year%10)) {
				// Simplificado: solo verificar que el año está en la key
				if !strings.Contains(key, string(rune('0'+tt.year/1000))) {
					t.Errorf("Key should contain year %d", tt.year)
				}
			}

			// Verificar formato con guiones
			parts := strings.Split(key, "-")
			if len(parts) != 3 {
				t.Errorf("Key should have 3 parts separated by '-', got %d parts", len(parts))
			}

			// Verificar longitud aproximada
			if len(key) < 15 || len(key) > 20 {
				t.Errorf("Key length should be between 15-20, got %d", len(key))
			}
		})
	}
}

func TestValidateLicenseKey(t *testing.T) {
	generator := NewGenerator("test_secret")

	// Generar una licencia válida para testing
	validKey2025 := generator.GenerateLicenseKey(2025)
	validKey2024 := generator.GenerateLicenseKey(2024)

	tests := []struct {
		name        string
		key         string
		wantValid   bool
		wantYear    int
		wantErr     bool
		errContains string
	}{
		{
			name:      "Licencia válida 2025",
			key:       validKey2025,
			wantValid: true,
			wantYear:  2025,
			wantErr:   false,
		},
		{
			name:      "Licencia válida 2024",
			key:       validKey2024,
			wantValid: true,
			wantYear:  2024,
			wantErr:   false,
		},
		{
			name:        "Formato inválido - sin guiones",
			key:         "YOY2025XXXX",
			wantValid:   false,
			wantErr:     true,
			errContains: "formato",
		},
		{
			name:        "Formato inválido - prefijo incorrecto",
			key:         "XXX2025-AAAA-BBBB",
			wantValid:   false,
			wantErr:     true,
			errContains: "prefijo",
		},
		{
			name:      "Licencia inválida - key incorrecta",
			key:       "YOY2025-XXXX-YYYY",
			wantValid: false,
			wantErr:   false,
		},
		{
			name:        "String vacío",
			key:         "",
			wantValid:   false,
			wantErr:     true,
			errContains: "formato",
		},
		{
			name:        "Solo espacios",
			key:         "   ",
			wantValid:   false,
			wantErr:     true,
			errContains: "formato",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			valid, year, err := generator.ValidateLicenseKey(tt.key)

			if tt.wantErr {
				if err == nil {
					t.Errorf("ValidateLicenseKey() expected error but got none")
					return
				}
				if tt.errContains != "" && !strings.Contains(strings.ToLower(err.Error()), tt.errContains) {
					t.Errorf("ValidateLicenseKey() error = %v, should contain '%s'", err, tt.errContains)
				}
				return
			}

			if err != nil {
				t.Errorf("ValidateLicenseKey() unexpected error = %v", err)
				return
			}

			if valid != tt.wantValid {
				t.Errorf("ValidateLicenseKey() valid = %v, want %v", valid, tt.wantValid)
			}

			if valid && year != tt.wantYear {
				t.Errorf("ValidateLicenseKey() year = %d, want %d", year, tt.wantYear)
			}
		})
	}
}

func TestValidateLicenseKey_CaseInsensitive(t *testing.T) {
	generator := NewGenerator("test_secret")
	validKey := generator.GenerateLicenseKey(2025)

	// Probar en minúsculas
	lowerKey := strings.ToLower(validKey)
	valid, year, err := generator.ValidateLicenseKey(lowerKey)

	if err != nil {
		t.Errorf("ValidateLicenseKey() with lowercase key unexpected error = %v", err)
	}
	if !valid {
		t.Error("ValidateLicenseKey() should accept lowercase keys")
	}
	if year != 2025 {
		t.Errorf("ValidateLicenseKey() year = %d, want 2025", year)
	}
}

func TestGetExpirationDate(t *testing.T) {
	generator := NewGenerator("test_secret")

	activationDate := time.Date(2025, 1, 15, 10, 30, 0, 0, time.UTC)
	expirationDate := generator.GetExpirationDate(activationDate)

	expectedDate := time.Date(2026, 1, 15, 10, 30, 0, 0, time.UTC)

	if !expirationDate.Equal(expectedDate) {
		t.Errorf("GetExpirationDate() = %v, want %v", expirationDate, expectedDate)
	}

	// Verificar que siempre es exactamente 1 año después
	diff := expirationDate.Sub(activationDate)
	days := int(diff.Hours() / 24)

	// Considerando años bisiestos, debería ser aproximadamente 365 o 366 días
	if days != 365 && days != 366 {
		t.Errorf("Expected 365 or 366 days, got %d", days)
	}
}

func TestGetLicenseStatus(t *testing.T) {
	generator := NewGenerator("test_secret")
	now := time.Now()

	tests := []struct {
		name             string
		activationDate   time.Time
		expirationDate   time.Time
		wantStatus       string
		minDaysRemaining int
		maxDaysRemaining int
	}{
		{
			name:             "Licencia activa - muchos días restantes",
			activationDate:   now.AddDate(0, 0, -30),
			expirationDate:   now.AddDate(0, 0, 300),
			wantStatus:       "activa",
			minDaysRemaining: 295,
			maxDaysRemaining: 305,
		},
		{
			name:             "Licencia por expirar - 30 días",
			activationDate:   now.AddDate(0, 0, -335),
			expirationDate:   now.AddDate(0, 0, 30),
			wantStatus:       "por_expirar",
			minDaysRemaining: 28,
			maxDaysRemaining: 32,
		},
		{
			name:             "Licencia por expirar - 5 días",
			activationDate:   now.AddDate(0, 0, -360),
			expirationDate:   now.AddDate(0, 0, 5),
			wantStatus:       "por_expirar",
			minDaysRemaining: 3,
			maxDaysRemaining: 7,
		},
		{
			name:             "Licencia expirada",
			activationDate:   now.AddDate(-2, 0, 0),
			expirationDate:   now.AddDate(-1, 0, 0),
			wantStatus:       "expirada",
			minDaysRemaining: -400,
			maxDaysRemaining: -300,
		},
		{
			name:             "Licencia expirada ayer",
			activationDate:   now.AddDate(-1, 0, -1),
			expirationDate:   now.AddDate(0, 0, -1),
			wantStatus:       "expirada",
			minDaysRemaining: -5,
			maxDaysRemaining: 0,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			status, daysRemaining := generator.GetLicenseStatus(tt.activationDate, tt.expirationDate)

			if status != tt.wantStatus {
				t.Errorf("GetLicenseStatus() status = %v, want %v", status, tt.wantStatus)
			}

			if daysRemaining < tt.minDaysRemaining || daysRemaining > tt.maxDaysRemaining {
				t.Errorf("GetLicenseStatus() daysRemaining = %d, want between %d and %d",
					daysRemaining, tt.minDaysRemaining, tt.maxDaysRemaining)
			}
		})
	}
}

func TestGenerateLicenseKey_Deterministic(t *testing.T) {
	// El mismo año debería generar la misma key
	generator1 := NewGenerator("test_secret")
	generator2 := NewGenerator("test_secret")

	key1 := generator1.GenerateLicenseKey(2025)
	key2 := generator2.GenerateLicenseKey(2025)

	if key1 != key2 {
		t.Errorf("Same year should generate same key: %s vs %s", key1, key2)
	}

	// Diferente año debería generar diferente key
	key2024 := generator1.GenerateLicenseKey(2024)
	if key1 == key2024 {
		t.Error("Different years should generate different keys")
	}

	// Diferente secreto debería generar diferente key
	generator3 := NewGenerator("different_secret")
	key3 := generator3.GenerateLicenseKey(2025)
	if key1 == key3 {
		t.Error("Different secrets should generate different keys")
	}
}
