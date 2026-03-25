const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, 'Product name is required'],
      trim:     true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    price: {
      type:    Number,
      required: [true, 'Price is required'],
      min:     [0, 'Price cannot be negative'],
    },
    category: {
      type:     String,
      required: [true, 'Category is required'],
      enum:     {
        values:  ['Kurti', 'Suits'],
        message: 'Category must be either Kurti or Suits',
      },
    },
    description: {
      type:     String,
      required: [true, 'Description is required'],
      trim:     true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    imageUrl: {
      type:     String,
      required: [true, 'Product image is required'],
    },
    imagePublicId: {
      type: String,  // Cloudinary public_id – used for deletion
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
