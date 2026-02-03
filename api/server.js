const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const app = express();

// --- CONFIGURATION ---
const MONGO_URI = "mongodb+srv://abkkss25_db_user:r51pyj4w4nvpcxjK@cluster0.kjzhusu.mongodb.net/?appName=Cluster0";
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Correct Pathing for your structure:
// server.js is inside /api → go up to /public
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

// --- DATABASE CONNECTION ---
mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

/* =======================
   SCHEMAS & MODELS
======================= */

// --- Admin Schema ---
const adminSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: { type: String, required: true }
});

const Admin = mongoose.model('Admin', adminSchema);

// Create default admin (one-time)
(async () => {
    const adminExists = await Admin.findOne({ username: 'admin' });
    if (!adminExists) {
        const hashed = await bcrypt.hash('admin123', 10);
        await Admin.create({ username: 'admin', password: hashed });
        console.log("🔐 Default admin created (username: admin, password: admin123)");
    }
})();

// --- Farmer Schema ---
const farmerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    fatherName: String,
    mobile: { type: String, required: true },
    village: String,
    block: String,
    district: String,
    state: String,
    farmSize: String,
    landType: String,
    cropType: String,
    farmingMethod: String,
    aadharLast4: String,
    coordinatorName: String,
    registeredAt: { type: Date, default: Date.now }
});

// --- Blog Schema ---
const blogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, default: "Admin" },
    createdAt: { type: Date, default: Date.now }
});

// --- Gallery Schema ---
const gallerySchema = new mongoose.Schema({
    url: { type: String, required: true },
    title: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Farmer = mongoose.model('Farmer', farmerSchema);
const Blog = mongoose.model('Blog', blogSchema);
const Gallery = mongoose.model('Gallery', gallerySchema);

/* =======================
   ADMIN AUTH ROUTES
======================= */

// 🔐 Admin Login
app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    res.json({ message: 'Login success' });
});

// 🔄 Change Password
app.put('/api/admin/update-password', async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const admin = await Admin.findOne({ username: 'admin' });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    const match = await bcrypt.compare(oldPassword, admin.password);
    if (!match) return res.status(401).json({ message: 'Old password incorrect' });

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();

    res.json({ message: 'Password updated successfully' });
});

/* =======================
   API ROUTES
======================= */

// FARMERS
app.get('/api/farmers', async (req, res) => {
    try {
        const farmers = await Farmer.find().sort({ registeredAt: -1 });
        res.json(farmers);
    } catch {
        res.status(500).json({ error: "डाटा प्राप्त करने में त्रुटि आई" });
    }
});

app.post('/api/farmers', async (req, res) => {
    try {
        await new Farmer(req.body).save();
        res.status(201).json({ message: "Success" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// BLOGS
app.get('/api/blogs', async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 });
        res.json(blogs);
    } catch {
        res.status(500).json({ error: "ब्लॉग लोड करने में त्रुटि आई" });
    }
});

app.post('/api/blogs', async (req, res) => {
    try {
        await new Blog(req.body).save();
        res.status(201).json({ message: "Blog Published" });
    } catch {
        res.status(500).json({ error: "ब्लॉग सेव नहीं हो सका" });
    }
});

// GALLERY
app.get('/api/gallery', async (req, res) => {
    try {
        const photos = await Gallery.find().sort({ createdAt: -1 });
        res.json(photos);
    } catch {
        res.status(500).json({ error: "गैलरी लोड करने में त्रुटि आई" });
    }
});

app.post('/api/gallery', async (req, res) => {
    try {
        await new Gallery(req.body).save();
        res.status(201).json({ message: "Photo added successfully" });
    } catch {
        res.status(500).json({ error: "फोटो सेव नहीं हो सकी" });
    }
});

/* =======================
   PAGE ROUTING
======================= */

app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

app.get('/:page', (req, res, next) => {
    let page = req.params.page;
    if (page.startsWith('api')) return next();
    if (!page.endsWith('.html')) page += '.html';

    const filePath = path.join(publicPath, page);
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).sendFile(path.join(publicPath, 'index.html'));
    }
});

/* =======================
   SERVER START
======================= */

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () =>
        console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
}

module.exports = app;
