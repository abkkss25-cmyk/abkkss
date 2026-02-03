const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('./models/Admin');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI);

(async () => {
  const exists = await Admin.findOne({ username: 'admin' });
  if (exists) {
    console.log('Admin already exists');
    process.exit();
  }

  const hash = await bcrypt.hash('admin123', 10);

  await Admin.create({
    username: 'admin',
    password: hash
  });

  console.log('✅ Admin created | user: admin | pass: admin123');
  process.exit();
})();
