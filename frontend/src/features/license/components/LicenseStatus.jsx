import React from 'react';
import './LicenseStatus.css';

const LicenseStatus = ({ info }) => {
  if (!info) return null;

  const getStatusClass = () => {
    switch (info.estado) {
      case 'activa':
        return info.diasRestantes <= 30 ? 'warning' : 'active';
      case 'expirada':
        return 'expired';
      default:
        return 'inactive';
    }
  };

  const getStatusIcon = () => {
    switch (info.estado) {
      case 'activa':
        return info.diasRestantes <= 30 ? '⚠️' : '✅';
      case 'expirada':
        return 'ℹ️';
      default:
        return '❌';
    }
  };

  return (
    <div className={`license-status ${getStatusClass()}`}>
      <div className="license-status-icon">{getStatusIcon()}</div>
      <div className="license-status-content">
        <p className="license-status-message">{info.mensaje}</p>
        {info.estado === 'activa' && info.diasRestantes > 0 && (
          <div className="license-status-bar">
            <div
              className="license-status-progress"
              style={{
                width: `${Math.min(100, (info.diasRestantes / 365) * 100)}%`
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default LicenseStatus;