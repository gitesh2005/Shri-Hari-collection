const Product                              = require('../models/Product');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

// ── @GET /api/products ────────────────────────────────────────────────────────
exports.getAllProducts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;

    const query = {};
    if (category) query.category = category;
    if (search)   query.name = { $regex: search, $options: 'i' };

    const skip     = (Number(page) - 1) * Number(limit);
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data:    products,
      total,
      pages:   Math.ceil(total / Number(limit)),
      page:    Number(page),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── @GET /api/products/:id ────────────────────────────────────────────────────
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ success: false, message: 'Product not found' });

    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── @POST /api/products  (admin) ──────────────────────────────────────────────
exports.createProduct = async (req, res) => {
  try {
    const { name, price, category, description } = req.body;

    // Validate required fields
    if (!name || !price || !category || !description)
      return res.status(400).json({ success: false, message: 'All fields are required' });

    if (!req.file)
      return res.status(400).json({ success: false, message: 'Product image is required' });

    // Upload image to Cloudinary
    const { url, publicId } = await uploadToCloudinary(req.file.buffer);

    const product = await Product.create({
      name,
      price:         Number(price),
      category,
      description,
      imageUrl:      url,
      imagePublicId: publicId,
      createdBy:     req.user.id,
    });

    res.status(201).json({ success: true, data: product });
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── @PUT /api/products/:id  (admin) ──────────────────────────────────────────
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ success: false, message: 'Product not found' });

    const { name, price, category, description } = req.body;

    // If a new image was uploaded, replace Cloudinary image
    if (req.file) {
      // Delete old image
      await deleteFromCloudinary(product.imagePublicId);

      // Upload new image
      const { url, publicId }  = await uploadToCloudinary(req.file.buffer);
      product.imageUrl         = url;
      product.imagePublicId    = publicId;
    }

    if (name)        product.name        = name;
    if (price)       product.price       = Number(price);
    if (category)    product.category    = category;
    if (description) product.description = description;

    await product.save();
    res.json({ success: true, data: product });
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── @DELETE /api/products/:id  (admin) ───────────────────────────────────────
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ success: false, message: 'Product not found' });

    // Delete image from Cloudinary
    await deleteFromCloudinary(product.imagePublicId);

    await product.deleteOne();
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
