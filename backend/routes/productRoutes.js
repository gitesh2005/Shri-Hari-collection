const router      = require('express').Router();
const protect     = require('../middleware/authMiddleware');
const restrictTo  = require('../middleware/roleMiddleware');
const uploadSingle = require('../middleware/uploadMiddleware');
const {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');

// Public routes
router.get('/',    getAllProducts);
router.get('/:id', getProduct);

// Admin-only routes
router.post(
  '/',
  protect, restrictTo('admin'),
  uploadSingle('image'),
  createProduct
);

router.put(
  '/:id',
  protect, restrictTo('admin'),
  uploadSingle('image'),
  updateProduct
);

router.delete(
  '/:id',
  protect, restrictTo('admin'),
  deleteProduct
);

module.exports = router;
