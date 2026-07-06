import { createContext, useState, useEffect, useContext } from 'react';

const DeliveryAuthContext = createContext();

export const DeliveryAuthProvider = ({ children }) => {
  const [deliveryUser, setDeliveryUser] = useState(() => {
    const saved = localStorage.getItem('deliveryUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [deliveryToken, setDeliveryToken] = useState(
    () => localStorage.getItem('deliveryToken') || null
  );
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!deliveryToken && !!deliveryUser;

  useEffect(() => {
    const verifyToken = async () => {
      if (deliveryToken) {
        try {
          const response = await fetch('http://localhost:5000/api/delivery/profile', {
            headers: { Authorization: `Bearer ${deliveryToken}` },
          });
          const data = await response.json();
          if (data.success) {
            setDeliveryUser(data.data);
            localStorage.setItem('deliveryUser', JSON.stringify(data.data));
          } else {
            // Token invalid — clear auth
            setDeliveryUser(null);
            setDeliveryToken(null);
            localStorage.removeItem('deliveryToken');
            localStorage.removeItem('deliveryUser');
            localStorage.removeItem('deliveryRole');
          }
        } catch (error) {
          console.error('Error verifying delivery token:', error);
          // Keep local data on network error
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, [deliveryToken]);

  const login = (userData, token) => {
    setDeliveryUser(userData);
    setDeliveryToken(token);
    localStorage.setItem('deliveryUser', JSON.stringify(userData));
    localStorage.setItem('deliveryToken', token);
    localStorage.setItem('deliveryRole', 'delivery');
  };

  const logout = async () => {
    try {
      if (deliveryToken) {
        await fetch('http://localhost:5000/api/delivery/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${deliveryToken}` },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setDeliveryUser(null);
      setDeliveryToken(null);
      localStorage.removeItem('deliveryToken');
      localStorage.removeItem('deliveryUser');
      localStorage.removeItem('deliveryRole');
    }
  };

  const updateProfile = (updatedData) => {
    const newUser = { ...deliveryUser, ...updatedData };
    setDeliveryUser(newUser);
    localStorage.setItem('deliveryUser', JSON.stringify(newUser));
  };

  return (
    <DeliveryAuthContext.Provider
      value={{
        deliveryUser,
        deliveryToken,
        loading,
        isAuthenticated,
        login,
        logout,
        updateProfile,
        setDeliveryUser,
      }}
    >
      {children}
    </DeliveryAuthContext.Provider>
  );
};

export const useDeliveryAuth = () => useContext(DeliveryAuthContext);
