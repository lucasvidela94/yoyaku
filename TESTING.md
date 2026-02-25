# Testing

Este proyecto incluye tests unitarios para el backend (Go) y frontend (React).

## Backend (Go)

### Ejecutar todos los tests
```bash
go test ./...
```

### Ejecutar tests con verbose
```bash
go test ./... -v
```

### Ejecutar tests con coverage
```bash
go test ./... -cover
```

### Ejecutar tests de un paquete específico
```bash
go test ./internal/license/... -v
```

## Frontend (React)

### Instalar dependencias
```bash
cd frontend
npm install
```

### Ejecutar tests
```bash
npm run test
```

### Ejecutar tests una sola vez
```bash
npm run test -- --run
```

### Ejecutar tests con coverage
```bash
npm run test -- --run --coverage
```

### Ejecutar tests en modo UI
```bash
npm run test:ui
```

## Todos los tests

### Script automatizado
```bash
./test.sh
```

## Estructura de tests

```
├── internal/
│   ├── license/
│   │   ├── generator_test.go      # Tests del generador de licencias
│   │   └── service_test.go        # Tests del servicio de licencias
│   └── db/
│       └── license_test.go        # Tests del repositorio
└── frontend/
    └── src/
        └── features/
            └── license/
                ├── components/
                │   ├── LicenseModal.test.jsx
                │   └── LicenseStatus.test.jsx
                └── hooks/
                    └── useLicense.test.js
```

## Tests de licencias

Los tests cubren:

### Generator
- Generación de claves de licencia
- Validación de formato
- Case-insensitive validation
- Determinismo (misma entrada = misma salida)

### Service
- Activación de licencias
- Obtención de información
- Detección de requerimiento de activación
- Manejo de errores

### Repository
- Guardar y obtener licencias
- Actualización de licencias existentes
- Detección de licencias activas
- Acceso concurrente

### Frontend
- Renderizado de componentes
- Interacción de usuario
- Manejo de estados
- Integración con hooks