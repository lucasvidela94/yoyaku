import '@testing-library/jest-dom'

// Mock window.go for Wails
window.go = {
  main: {
    App: {
      ValidarLicencia: vi.fn(),
      ObtenerInfoLicencia: vi.fn(),
      RequiereActivacion: vi.fn(),
    }
  }
}