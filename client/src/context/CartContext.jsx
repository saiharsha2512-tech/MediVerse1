import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // For demo purposes, we use a mock user ID
  const userId = "mock-user-123";

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5000/api/cart/user/${userId}`);
        if (res.data && res.data.items) {
          setCart(res.data.items);
        }
      } catch (error) {
        console.error("Error fetching cart", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [userId]);

  const addToCart = async (medicine, quantity = 1) => {
    try {
      const medicineId = medicine._id || medicine.id;
      const res = await axios.post('http://localhost:5000/api/cart/add', {
        userId,
        medicineId,
        quantity
      });
      if (res.data && res.data.items) {
        setCart(res.data.items);
        toast.success("Medicine added to cart", {
          style: {
            background: '#333',
            color: '#fff',
          },
        });
      }
    } catch (error) {
      console.error("Error adding to cart", error);
      toast.error("Failed to add to cart");
    }
  };

  const updateQuantity = async (medicineId, quantity) => {
    try {
      const res = await axios.put('http://localhost:5000/api/cart/update', {
        userId,
        medicineId,
        quantity
      });
      if (res.data && res.data.items) {
        setCart(res.data.items);
      }
    } catch (error) {
      console.error("Error updating quantity", error);
      toast.error("Failed to update quantity");
    }
  };

  const removeItem = async (medicineId) => {
    try {
      const res = await axios.delete(`http://localhost:5000/api/cart/remove/${medicineId}?userId=${userId}`);
      if (res.data && res.data.items) {
        setCart(res.data.items);
        toast.success("Item removed");
      }
    } catch (error) {
      console.error("Error removing item", error);
    }
  };

  const clearCart = async () => {
    try {
      const res = await axios.delete(`http://localhost:5000/api/cart/clear/${userId}`);
      if (res.data && res.data.cart) {
        setCart(res.data.cart.items);
      }
    } catch (error) {
      console.error("Error clearing cart", error);
    }
  };

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const cartTotal = cart.reduce((total, item) => {
    if (item.medicineId && item.medicineId.price) {
      return total + (item.medicineId.price * item.quantity);
    }
    return total;
  }, 0);

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      updateQuantity,
      removeItem,
      clearCart,
      cartItemCount, 
      cartTotal,
      loading 
    }}>
      {children}
    </CartContext.Provider>
  );
};
