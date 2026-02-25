import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useLicense } from './useLicense'

describe('useLicense', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should check license status on mount', async () => {
    window.go.main.App.RequiereActivacion.mockResolvedValueOnce(false)
    window.go.main.App.ObtenerInfoLicencia.mockResolvedValueOnce({
      estado: 'activa',
      diasRestantes: 300,
      mensaje: 'Licencia activa',
    })

    const { result } = renderHook(() => useLicense())

    // Initially loading
    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.requiresActivation).toBe(false)
    expect(result.current.licenseInfo).toEqual({
      estado: 'activa',
      diasRestantes: 300,
      mensaje: 'Licencia activa',
    })
  })

  it('should detect when activation is required', async () => {
    window.go.main.App.RequiereActivacion.mockResolvedValueOnce(true)

    const { result } = renderHook(() => useLicense())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.requiresActivation).toBe(true)
    expect(result.current.licenseInfo).toBeNull()
  })

  it('should handle errors when checking license', async () => {
    window.go.main.App.RequiereActivacion.mockRejectedValueOnce(new Error('Database error'))

    const { result } = renderHook(() => useLicense())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Database error')
  })

  it('should activate license successfully', async () => {
    const mockLicenseInfo = {
      estado: 'activa',
      diasRestantes: 365,
      mensaje: 'Licencia activada correctamente',
    }

    window.go.main.App.ValidarLicencia.mockResolvedValueOnce(mockLicenseInfo)

    const { result } = renderHook(() => useLicense())

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Activate license
    await result.current.activateLicense('YOY2025-ABCD-EFGH')

    expect(window.go.main.App.ValidarLicencia).toHaveBeenCalledWith('YOY2025-ABCD-EFGH')
    
    await waitFor(() => {
      expect(result.current.licenseInfo).toEqual(mockLicenseInfo)
    })
    
    expect(result.current.requiresActivation).toBe(false)
  })

  it('should handle activation errors', async () => {
    window.go.main.App.ValidarLicencia.mockRejectedValueOnce(new Error('Invalid license key'))

    const { result } = renderHook(() => useLicense())

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Try to activate with invalid key
    await expect(result.current.activateLicense('INVALID-KEY')).rejects.toThrow('Invalid license key')

    await waitFor(() => {
      expect(result.current.error).toBe('Invalid license key')
    })
  })

  it('should refresh license status', async () => {
    window.go.main.App.RequiereActivacion.mockResolvedValue(false)
    window.go.main.App.ObtenerInfoLicencia
      .mockResolvedValueOnce({
        estado: 'activa',
        diasRestantes: 300,
        mensaje: 'Licencia activa',
      })
      .mockResolvedValueOnce({
        estado: 'expirada',
        diasRestantes: -30,
        mensaje: 'Licencia expirada',
      })

    const { result } = renderHook(() => useLicense())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.licenseInfo.estado).toBe('activa')

    // Refresh license status
    await result.current.refreshLicense()

    await waitFor(() => {
      expect(result.current.licenseInfo.estado).toBe('expirada')
    })
  })

  it('should clear error on successful activation', async () => {
    window.go.main.App.RequiereActivacion.mockRejectedValueOnce(new Error('Initial error'))

    const { result } = renderHook(() => useLicense())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Initial error')

    // Mock successful activation
    window.go.main.App.ValidarLicencia.mockResolvedValueOnce({
      estado: 'activa',
      diasRestantes: 365,
      mensaje: 'Licencia activada',
    })

    await result.current.activateLicense('YOY2025-ABCD-EFGH')

    await waitFor(() => {
      expect(result.current.error).toBeNull()
    })
  })
})