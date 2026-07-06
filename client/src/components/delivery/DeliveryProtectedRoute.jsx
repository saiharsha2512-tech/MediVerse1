import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useDeliveryAuth } from '../../context/delivery/DeliveryAuthContext';

const DeliveryProtectedRoute = () => {
  const { isAuthenticated, loading } = useDeliveryAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0080FF 0%, #00C896 100%)',
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            border: '4px solid rgba(255,255,255,0.3)',
            borderTopColor: '#fff',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/delivery/login" replace />;
};

export default DeliveryProtectedRoute;
