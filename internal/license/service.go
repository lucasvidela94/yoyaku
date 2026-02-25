package license

import (
	"fmt"
	"time"

	"yoyaku/internal/models"
)

type LicenseRepository interface {
	Obtener() (*models.Licencia, error)
	Guardar(licencia *models.Licencia) error
}

type Service struct {
	repo      LicenseRepository
	generator *Generator
}

func NewService(repo LicenseRepository) *Service {
	return &Service{
		repo:      repo,
		generator: NewGenerator("yoyaku_secret_2024"),
	}
}

func (s *Service) ValidarLicencia(key string) (*models.InfoLicencia, error) {
	valid, year, err := s.generator.ValidateLicenseKey(key)
	if err != nil {
		return nil, err
	}

	if !valid {
		return nil, fmt.Errorf("licencia inválida")
	}

	activationDate := time.Now()
	expirationDate := s.generator.GetExpirationDate(activationDate)

	licencia := &models.Licencia{
		LicenseKey:      key,
		FechaActivacion: activationDate,
		FechaExpiracion: expirationDate,
		Activa:          true,
		Version:         fmt.Sprintf("%d.0.0", year),
	}

	if err := s.repo.Guardar(licencia); err != nil {
		return nil, fmt.Errorf("error guardando licencia: %w", err)
	}

	return s.ObtenerInfoLicencia()
}

func (s *Service) ObtenerInfoLicencia() (*models.InfoLicencia, error) {
	licencia, err := s.repo.Obtener()
	if err != nil {
		return nil, err
	}

	if licencia == nil {
		return &models.InfoLicencia{
			Estado:  models.LicenciaNoConfigurada,
			Mensaje: "No hay licencia configurada. Por favor, active su licencia.",
		}, nil
	}

	status, daysRemaining := s.generator.GetLicenseStatus(licencia.FechaActivacion, licencia.FechaExpiracion)

	info := &models.InfoLicencia{
		FechaActivacion: licencia.FechaActivacion,
		FechaExpiracion: licencia.FechaExpiracion,
		DiasRestantes:   daysRemaining,
	}

	switch status {
	case "activa":
		info.Estado = models.LicenciaActiva
		info.Mensaje = fmt.Sprintf("Licencia activa. Actualizaciones disponibles hasta %s (%d días restantes)",
			licencia.FechaExpiracion.Format("02/01/2006"), daysRemaining)
	case "por_expirar":
		info.Estado = models.LicenciaActiva
		info.Mensaje = fmt.Sprintf("Su período de actualizaciones expira pronto (%d días). El software seguirá funcionando.",
			daysRemaining)
	case "expirada":
		info.Estado = models.LicenciaExpirada
		info.Mensaje = fmt.Sprintf("Período de actualizaciones finalizado el %s. El software sigue funcionando. Contacte soporte para renovar.",
			licencia.FechaExpiracion.Format("02/01/2006"))
	}

	return info, nil
}

func (s *Service) RequiereActivacion() (bool, error) {
	licencia, err := s.repo.Obtener()
	if err != nil {
		return false, err
	}
	return licencia == nil, nil
}
