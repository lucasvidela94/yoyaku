import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import LicenseModal from './LicenseModal'

describe('LicenseModal', () => {
  const mockOnClose = vi.fn()
  const mockOnActivate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not render when isOpen is false', () => {
    render(
      <LicenseModal
        isOpen={false}
        onClose={mockOnClose}
        onActivate={mockOnActivate}
      />
    )

    expect(screen.queryByText('Activar Licencia')).not.toBeInTheDocument()
  })

  it('should render when isOpen is true', () => {
    render(
      <LicenseModal
        isOpen={true}
        onClose={mockOnClose}
        onActivate={mockOnActivate}
      />
    )

    expect(screen.getByRole('button', { name: /.activar licencia/i })).toBeInTheDocument()
    expect(screen.getByText('Bienvenido a Yoyaku - Sistema de Gestión de Turnos')).toBeInTheDocument()
  })

  it('should display license model information', () => {
    render(
      <LicenseModal
        isOpen={true}
        onClose={mockOnClose}
        onActivate={mockOnActivate}
      />
    )

    expect(screen.getByText('Modelo de Licenciamiento')).toBeInTheDocument()
    expect(screen.getByText('Licencia perpetua - pago único')).toBeInTheDocument()
    expect(screen.getByText('Incluye 1 año de actualizaciones')).toBeInTheDocument()
    expect(screen.getByText('El software sigue funcionando después del año')).toBeInTheDocument()
    expect(screen.getByText('Renovación opcional para nuevas versiones')).toBeInTheDocument()
  })

  it('should format license key input correctly', () => {
    render(
      <LicenseModal
        isOpen={true}
        onClose={mockOnClose}
        onActivate={mockOnActivate}
      />
    )

    const input = screen.getByPlaceholderText('YOY2024-XXXX-XXXX')
    
    fireEvent.change(input, { target: { value: 'yoy2024abcd1234' } })
    
    expect(input.value).toBe('YOY2-024A-BCD1-234')
  })

  it('should disable submit button when license key is incomplete', () => {
    render(
      <LicenseModal
        isOpen={true}
        onClose={mockOnClose}
        onActivate={mockOnActivate}
      />
    )

    const submitButton = screen.getByRole('button', { name: /.activar licencia/i })
    expect(submitButton).toBeDisabled()

    const input = screen.getByPlaceholderText('YOY2024-XXXX-XXXX')
    fireEvent.change(input, { target: { value: 'YOY2024-TEST' } })
    
    expect(submitButton).toBeDisabled()
  })

  it('should enable submit button when license key is complete', () => {
    render(
      <LicenseModal
        isOpen={true}
        onClose={mockOnClose}
        onActivate={mockOnActivate}
      />
    )

    const input = screen.getByPlaceholderText('YOY2024-XXXX-XXXX')
    fireEvent.change(input, { target: { value: 'YOY2024-ABCD-EFGH' } })

    const submitButton = screen.getByRole('button', { name: /.activar licencia/i })
    expect(submitButton).not.toBeDisabled()
  })

  it('should call onActivate with license key when form is submitted', async () => {
    mockOnActivate.mockResolvedValueOnce({})

    render(
      <LicenseModal
        isOpen={true}
        onClose={mockOnClose}
        onActivate={mockOnActivate}
      />
    )

    const input = screen.getByPlaceholderText('YOY2024-XXXX-XXXX')
    fireEvent.change(input, { target: { value: 'YOY2024-ABCD-EFGH' } })

    const submitButton = screen.getByRole('button', { name: /.activar licencia/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockOnActivate).toHaveBeenCalledWith('YOY2024-ABCD-EFGH')
    })
  })

  it('should display error message when activation fails', async () => {
    mockOnActivate.mockRejectedValueOnce(new Error('Licencia inválida'))

    render(
      <LicenseModal
        isOpen={true}
        onClose={mockOnClose}
        onActivate={mockOnActivate}
      />
    )

    const input = screen.getByPlaceholderText('YOY2024-XXXX-XXXX')
    fireEvent.change(input, { target: { value: 'YOY2024-ABCD-EFGH' } })

    const submitButton = screen.getByRole('button', { name: /.activar licencia/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Licencia inválida')).toBeInTheDocument()
    })
  })

  it('should show loading state during activation', async () => {
    mockOnActivate.mockImplementation(() => new Promise(() => {}))

    render(
      <LicenseModal
        isOpen={true}
        onClose={mockOnClose}
        onActivate={mockOnActivate}
      />
    )

    const input = screen.getByPlaceholderText('YOY2024-XXXX-XXXX')
    fireEvent.change(input, { target: { value: 'YOY2024-ABCD-EFGH' } })

    const submitButton = screen.getByRole('button', { name: /activar licencia/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Activando...')).toBeInTheDocument()
    })
    expect(input).toBeDisabled()
  })

  it('should clear input when modal is reopened', () => {
    const { rerender } = render(
      <LicenseModal
        isOpen={true}
        onClose={mockOnClose}
        onActivate={mockOnActivate}
      />
    )

    const input = screen.getByPlaceholderText('YOY2024-XXXX-XXXX')
    fireEvent.change(input, { target: { value: 'YOY2024-ABCD-EFGH' } })
    expect(input.value).toBe('YOY2-024A-BCDE-FGH')

    // Close and reopen modal
    rerender(
      <LicenseModal
        isOpen={false}
        onClose={mockOnClose}
        onActivate={mockOnActivate}
      />
    )

    rerender(
      <LicenseModal
        isOpen={true}
        onClose={mockOnClose}
        onActivate={mockOnActivate}
      />
    )

    const newInput = screen.getByPlaceholderText('YOY2024-XXXX-XXXX')
    expect(newInput.value).toBe('')
  })

  it('should display support contact information', () => {
    render(
      <LicenseModal
        isOpen={true}
        onClose={mockOnClose}
        onActivate={mockOnActivate}
      />
    )

    expect(screen.getByText('¿Necesita una licencia?')).toBeInTheDocument()
    expect(screen.getByText('Contactar soporte')).toHaveAttribute('href', 'mailto:soporte@yoyaku.com')
  })
})