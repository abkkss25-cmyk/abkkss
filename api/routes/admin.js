const express = require('express');
const bcrypt = require('bcrypt');
const Admin = require('../models/Admin');

const router = express.Router();

/* LOGIN */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const admin = await Admin.findOne({ username });
  if (!admin) return res.status(401).json({ message: 'Invalid login' });

  const match = await bcrypt.compare(password, admin.password);
  if (!match) return res.status(401).json({ message: 'Invalid login' });

  res.json({ success: true });
});

/* CHANGE PASSWORD */
router.put('/update-password', async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const admin = await Admin.findOne({ username: 'admin' });
  const ok = await bcrypt.compare(oldPassword, admin.password);

  if (!ok) return res.status(400).json({ message: 'Wrong old password' });

  admin.password = await bcrypt.hash(newPassword, 10);
  await admin.save();

  res.json({ success: true });
});

module.exports = router;
