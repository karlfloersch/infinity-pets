import React from 'react';

interface PopupProps {
  message: string;
  isSuccess: boolean;
}

export const Popup: React.FC<PopupProps> = ({ message, isSuccess }) => (
  <div style={{
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    backgroundColor: 'white',
    padding: '10px',
    borderRadius: '5px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#333'
  }}>
    {isSuccess ? '✅' : '⏳'} {message}
  </div>
);

