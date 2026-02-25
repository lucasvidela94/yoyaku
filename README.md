# Yoyaku

Medical appointment scheduling desktop application built with Go, Wails, and React. Features offline-first architecture with local SQLite database and cryptographic license validation.

## Stack

- **Backend**: Go 1.24, Wails v2
- **Frontend**: React 18, Vite, React Router v7
- **Database**: SQLite (modernc.org/sqlite)
- **Testing**: Vitest, Testing Library, Go test
- **Build**: Wails CLI

## Project Structure

```
yoyaku/
├── cmd/license-generator/    # CLI tool for license generation
├── frontend/
│   ├── src/features/         # Feature-based architecture
│   │   ├── agenda/           # Appointment scheduling
│   │   ├── pacientes/        # Patient management
│   │   ├── configuracion/    # Settings management
│   │   └── license/          # License activation UI
│   └── test/                 # Test setup
├── internal/
│   ├── agenda/               # Business logic
│   ├── db/                   # Data access layer
│   ├── license/              # License validation (SHA-256)
│   └── models/               # Domain models
└── docs/                     # Documentation
```

## Key Features

- Offline-first license system with local cryptographic validation
- Feature-based frontend architecture
- SQLite with modernc driver (CGO-free)
- Comprehensive test coverage (backend + frontend)
- Desktop-native UI via Wails/WebView2

## Development

```bash
# Install dependencies
cd frontend && npm install

# Run dev server
wails dev

# Run tests
./test.sh

# Build production
wails build
```

## License

Proprietary
