package license

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"strconv"
	"strings"
	"time"
)

const (
	LicensePrefix    = "YOY"
	LicenseSeparator = "-"
	LicenseLength    = 16
	Version          = "1.0.0"
)

type Generator struct {
	secretKey string
}

func NewGenerator(secretKey string) *Generator {
	return &Generator{secretKey: secretKey}
}

func (g *Generator) GenerateLicenseKey(year int) string {
	raw := fmt.Sprintf("%s%d%s", g.secretKey, year, Version)
	hash := sha256.Sum256([]byte(raw))
	hexStr := hex.EncodeToString(hash[:])

	key := fmt.Sprintf("%s%d%s%s%s%s",
		LicensePrefix,
		year,
		LicenseSeparator,
		hexStr[0:4],
		LicenseSeparator,
		hexStr[4:8],
	)

	return strings.ToUpper(key)
}

func (g *Generator) ValidateLicenseKey(key string) (bool, int, error) {
	key = strings.ToUpper(strings.TrimSpace(key))
	parts := strings.Split(key, LicenseSeparator)

	if len(parts) != 3 {
		return false, 0, fmt.Errorf("formato de licencia inválido")
	}

	if !strings.HasPrefix(parts[0], LicensePrefix) {
		return false, 0, fmt.Errorf("prefijo de licencia inválido")
	}

	yearStr := strings.TrimPrefix(parts[0], LicensePrefix)
	year, err := strconv.Atoi(yearStr)
	if err != nil {
		return false, 0, fmt.Errorf("año inválido en licencia")
	}

	expectedKey := g.GenerateLicenseKey(year)

	return key == expectedKey, year, nil
}

func (g *Generator) GetExpirationDate(activationDate time.Time) time.Time {
	return activationDate.AddDate(1, 0, 0)
}

func (g *Generator) GetLicenseStatus(activationDate, expirationDate time.Time) (string, int) {
	now := time.Now()
	daysRemaining := int(expirationDate.Sub(now).Hours() / 24)

	if now.After(expirationDate) {
		return "expirada", daysRemaining
	}

	if daysRemaining <= 30 {
		return "por_expirar", daysRemaining
	}

	return "activa", daysRemaining
}
