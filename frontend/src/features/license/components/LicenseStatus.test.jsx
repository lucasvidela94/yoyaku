import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import LicenseStatus from './LicenseStatus'

describe('LicenseStatus', () => {
  it('should return null when info is null', () => {
    const { container } = render(<LicenseStatus info={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('should render active license status', () => {
    const mockInfo = {
      estado: 'activa',
      diasRestantes: 300,
      mensaje: 'Licencia activa. Actualizaciones disponibles hasta 31/12/2025 (300 días restantes)',
    }

    render(<LicenseStatus info={mockInfo} />)

    expect(screen.getByText(mockInfo.mensaje)).toBeInTheDocument()
    expect(screen.getByText('✅')).toBeInTheDocument()
  })

  it('should render warning status when license is about to expire', () => {
    const mockInfo = {
      estado: 'activa',
      diasRestantes: 25,
      mensaje: 'Su período de actualizaciones expira pronto (25 días). El software seguirá funcionando.',
    }

    render(<LicenseStatus info={mockInfo} />)

    expect(screen.getByText(mockInfo.mensaje)).toBeInTheDocument()
    expect(screen.getByText('⚠️')).toBeInTheDocument()
  })

  it('should render expired license status', () => {
    const mockInfo = {
      estado: 'expirada',
      diasRestantes: -30,
      mensaje: 'Período de actualizaciones finalizado el 01/01/2025. El software sigue funcionando.',
    }

    render(<LicenseStatus info={mockInfo} />)

    expect(screen.getByText(mockInfo.mensaje)).toBeInTheDocument()
    expect(screen.getByText('ℹ️')).toBeInTheDocument()
  })

  it('should render inactive license status', () => {
    const mockInfo = {
      estado: 'no_configurada',
      diasRestantes: 0,
      mensaje: 'No hay licencia configurada',
    }

    render(<LicenseStatus info={mockInfo} />)

    expect(screen.getByText(mockInfo.mensaje)).toBeInTheDocument()
    expect(screen.getByText('❌')).toBeInTheDocument()
  })

  it('should render progress bar for active licenses', () => {
    const mockInfo = {
      estado: 'activa',
      diasRestantes: 180,
      mensaje: 'Licencia activa',
    }

    render(<LicenseStatus info={mockInfo} />)

    const progressBar = document.querySelector('.license-status-progress')
    expect(progressBar).toBeInTheDocument()
    
    // 180 days should be approximately 49% of 365
    const expectedWidth = Math.min(100, (180 / 365) * 100)
    expect(progressBar.style.width).toBe(`${expectedWidth}%`)
  })

  it('should not render progress bar for expired licenses', () => {
    const mockInfo = {
      estado: 'expirada',
      diasRestantes: -30,
      mensaje: 'Licencia expirada',
    }

    render(<LicenseStatus info={mockInfo} />)

    const progressBar = document.querySelector('.license-status-progress')
    expect(progressBar).not.toBeInTheDocument()
  })

  it('should apply correct CSS classes for active status', () => {
    const mockInfo = {
      estado: 'activa',
      diasRestantes: 300,
      mensaje: 'Licencia activa',
    }

    render(<LicenseStatus info={mockInfo} />)

    const statusElement = document.querySelector('.license-status')
    expect(statusElement).toHaveClass('active')
    expect(statusElement).not.toHaveClass('warning')
    expect(statusElement).not.toHaveClass('expired')
  })

  it('should apply warning CSS class when license is about to expire', () => {
    const mockInfo = {
      estado: 'activa',
      diasRestantes: 25,
      mensaje: 'Licencia por expirar',
    }

    render(<LicenseStatus info={mockInfo} />)

    const statusElement = document.querySelector('.license-status')
    expect(statusElement).toHaveClass('warning')
    expect(statusElement).not.toHaveClass('active')
  })

  it('should apply expired CSS class for expired licenses', () => {
    const mockInfo = {
      estado: 'expirada',
      diasRestantes: -30,
      mensaje: 'Licencia expirada',
    }

    render(<LicenseStatus info={mockInfo} />)

    const statusElement = document.querySelector('.license-status')
    expect(statusElement).toHaveClass('expired')
  })

  it('should cap progress bar at 100%', () => {
    const mockInfo = {
      estado: 'activa',
      diasRestantes: 400, // More than 365 days
      mensaje: 'Licencia activa',
    }

    render(<LicenseStatus info={mockInfo} />)

    const progressBar = document.querySelector('.license-status-progress')
    expect(progressBar.style.width).toBe('100%')
  })
})