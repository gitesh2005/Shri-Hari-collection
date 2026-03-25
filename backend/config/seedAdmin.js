const bcrypt = require('bcryptjs');
const User   = require('../models/User');

const seedAdmin = async () => {
  try {
    const email = process.env.ADMIN_EMAIL || 'anshu123@gmail.com';
    const existing = await User.findOne({ email });

    if (!existing) {
      const password = process.env.ADMIN_PASSWORD || '830755';
      const hashed   = await bcrypt.hash(password, 12);
      await User.create({ name: 'Admin', email, password: hashed, role: 'admin' });
      console.log(`👑  Admin seeded → ${email}`);
    }
  } catch (err) {
    console.error('Admin seed error:', err.message);
  }
};

module.exports = seedAdmin;
