package main

import (
	"flag"
	"fmt"
	"os"
	"strconv"
	"yoyaku/internal/license"
)

func main() {
	var year int
	flag.IntVar(&year, "year", 0, "Año de la licencia (ej: 2024)")
	flag.Parse()

	if year == 0 {
		fmt.Println("Uso: go run cmd/license-generator/main.go -year=2024")
		fmt.Println("\nGenera una licencia válida para el año especificado")
		os.Exit(1)
	}

	if year < 2024 || year > 2030 {
		fmt.Printf("Error: El año debe estar entre 2024 y 2030\n")
		os.Exit(1)
	}

	generator := license.NewGenerator("yoyaku_secret_2024")
	licenseKey := generator.GenerateLicenseKey(year)

	fmt.Println("╔════════════════════════════════════════╗")
	fmt.Println("║     GENERADOR DE LICENCIAS YOYAKU      ║")
	fmt.Println("╚════════════════════════════════════════╝")
	fmt.Println()
	fmt.Printf("Año:        %d\n", year)
	fmt.Printf("Licencia:   %s\n", licenseKey)
	fmt.Println()
	fmt.Println("Esta licencia incluye:")
	fmt.Println("  ✓ Uso perpetuo del software")
	fmt.Println("  ✓ 1 año de actualizaciones")
	fmt.Println("  ✓ Soporte técnico durante el período")
	fmt.Println()
	fmt.Println("Instrucciones:")
	fmt.Println("  1. Copie la clave de licencia")
	fmt.Println("  2. Ingrese la clave en la aplicación")
	fmt.Println("  3. La licencia se activará inmediatamente")
	fmt.Println()

	// Validar que la licencia generada sea válida
	valid, validatedYear, err := generator.ValidateLicenseKey(licenseKey)
	if err != nil {
		fmt.Printf("Error validando licencia: %v\n", err)
		os.Exit(1)
	}

	if !valid {
		fmt.Println("Error: La licencia generada no es válida")
		os.Exit(1)
	}

	if strconv.Itoa(validatedYear) != strconv.Itoa(year) {
		fmt.Printf("Error: Año de validación no coincide (%d != %d)\n", validatedYear, year)
		os.Exit(1)
	}

	fmt.Println("✓ Licencia validada correctamente")
}
