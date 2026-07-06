const express = require('express');
const { addToCart, getCart, removeFromCart, updateCartQuantity, clearCart } = require('../controllers/cartController');

const router = express.Router();

router.post('/add', addToCart);
router.get('/user/:userId', getCart);
router.put('/update', updateCartQuantity);
router.delete('/remove/:id', removeFromCart);
router.delete('/clear/:userId', clearCart);

module.exports = router;
