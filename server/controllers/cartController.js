const Cart = require('../models/Cart');

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Public (should ideally be private)
const addToCart = async (req, res) => {
  try {
    const { userId, medicineId, quantity = 1 } = req.body;

    let cart = await Cart.findOne({ userId });

    if (cart) {
      // Cart exists for user
      const itemIndex = cart.items.findIndex(p => p.medicineId == medicineId);

      if (itemIndex > -1) {
        // Product exists in cart, update quantity
        let item = cart.items[itemIndex];
        item.quantity += quantity;
        cart.items[itemIndex] = item;
      } else {
        // Product does not exist in cart, add new item
        cart.items.push({ medicineId, quantity });
      }
      cart = await cart.save();
      return res.status(201).json(cart);
    } else {
      // No cart for user, create new cart
      const newCart = await Cart.create({
        userId,
        items: [{ medicineId, quantity }]
      });
      return res.status(201).json(newCart);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error adding to cart' });
  }
};

// @desc    Get user cart
// @route   GET /api/cart/:userId
// @access  Public
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId }).populate('items.medicineId');
    if (!cart) {
      return res.json({ items: [] });
    }
    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching cart' });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:id
// @access  Public
const removeFromCart = async (req, res) => {
  try {
    const medicineId = req.params.id;
    const userId = req.query.userId || req.body.userId; // Read from query
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item.medicineId.toString() !== medicineId);
    cart = await cart.save();
    await cart.populate('items.medicineId');
    
    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error removing from cart' });
  }
};

const updateCartQuantity = async (req, res) => {
  try {
    const { userId, medicineId, quantity } = req.body;

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(p => p.medicineId.toString() === medicineId);
    if (itemIndex > -1) {
      if (quantity <= 0) {
        cart.items = cart.items.filter(item => item.medicineId.toString() !== medicineId);
      } else {
        cart.items[itemIndex].quantity = quantity;
      }
      cart = await cart.save();
      await cart.populate('items.medicineId');
      return res.json(cart);
    } else {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating cart' });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart/clear/:userId
// @access  Public
const clearCart = async (req, res) => {
  try {
    const { userId } = req.params;
    let cart = await Cart.findOne({ userId });

    if (cart) {
      cart.items = [];
      cart = await cart.save();
    }
    
    res.json({ message: 'Cart cleared', cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error clearing cart' });
  }
};

module.exports = {
  addToCart,
  getCart,
  removeFromCart,
  updateCartQuantity,
  clearCart
};
