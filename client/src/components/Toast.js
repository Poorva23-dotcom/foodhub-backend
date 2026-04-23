import React, { useEffect } from 'react';

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch(type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  const getBgColor = () => {
    switch(type) {
      case 'success': return '#28a745';
      case 'error': return '#dc3545';
      case 'warning': return '#ffc107';
      default: return '#17a2b8';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      backgroundColor: getBgColor(),
      color: 'white',
      padding: '12px 20px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 9999,
      animation: 'slideIn 0.3s ease-out',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      cursor: 'pointer',
      maxWidth: '350px'
    }} onClick={onClose}>
      <span style={{ fontSize: '20px' }}>{getIcon()}</span>
      <span>{message}</span>
    </div>
  );
}

export default Toast;