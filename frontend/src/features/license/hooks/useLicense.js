import { useState, useEffect, useCallback } from 'react';

export const useLicense = () => {
  const [licenseInfo, setLicenseInfo] = useState(null);
  const [requiresActivation, setRequiresActivation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkLicense = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const needsActivation = await window.go.main.App.RequiereActivacion();
      setRequiresActivation(needsActivation);
      
      if (!needsActivation) {
        const info = await window.go.main.App.ObtenerInfoLicencia();
        setLicenseInfo(info);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const activateLicense = useCallback(async (key) => {
    try {
      setError(null);
      const info = await window.go.main.App.ValidarLicencia(key);
      setLicenseInfo(info);
      setRequiresActivation(false);
      return info;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  useEffect(() => {
    checkLicense();
  }, [checkLicense]);

  return {
    licenseInfo,
    requiresActivation,
    loading,
    error,
    activateLicense,
    refreshLicense: checkLicense
  };
};