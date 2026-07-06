const express = require('express');
const { getMedicines, searchMedicines, getMedicineById, getMedicinesByCategory } = require('../controllers/medicineController');

const router = express.Router();

router.get('/search', searchMedicines);
router.get('/category/:category', getMedicinesByCategory);
router.get('/:id', getMedicineById);
router.get('/', getMedicines);

module.exports = router;
