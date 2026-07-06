const Medicine = require('../models/Medicine');

// @desc    Get all medicines
// @route   GET /api/medicines
// @access  Public
const getMedicines = async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};
    if (category && category !== 'All') {
      query.category = category;
    }
    const medicines = await Medicine.find(query);
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching medicines' });
  }
};

// @desc    Search medicines
// @route   GET /api/medicines/search
// @access  Public
const searchMedicines = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json([]);
    }
    const medicines = await Medicine.find({
      name: { $regex: q, $options: 'i' }
    });
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ message: 'Server error searching medicines' });
  }
};

// @desc    Get medicine by ID
// @route   GET /api/medicines/:id
// @access  Public
const getMedicineById = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (medicine) {
      res.json(medicine);
    } else {
      res.status(404).json({ message: 'Medicine not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching medicine' });
  }
};

// @desc    Get medicines by category
// @route   GET /api/medicines/category/:category
// @access  Public
const getMedicinesByCategory = async (req, res) => {
  try {
    const medicines = await Medicine.find({ category: req.params.category });
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching category' });
  }
};

module.exports = {
  getMedicines,
  searchMedicines,
  getMedicineById,
  getMedicinesByCategory
};
