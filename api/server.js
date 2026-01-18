const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs'); // Added to check if files exist
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// 1. Setup paths correctly for Vercel environment
const publicPath = path.join(__dirname, '../public');

// 2. Serve static files (CSS, JS, Images)
app.use(express.static(publicPath));

// MongoDB Connection
const MONGO_URI = "mongodb+srv://abkkss25_db_user:Py6BxC6fV8xDSOXL@cluster0.kjzhusu.mongodb.net/?appName=Cluster0";

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Farmer Schema (Keep this exactly as you have it)
const farmerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    fatherName: String,
    gender: String,
    mobile: { type: String, required: true },
    village: String,
    postOffice: String,
    block: String,
    tehsil: String,
    district: String,
    state: String,
    pincode: String,
    farmSize: String,
    landType: String,
    cropType: String,
    farmingMethod: String,
    interestedScheme: String,
    aadharLast4: String,
    coordinatorName: String,
    registeredAt: { type: Date, default: Date.now }
});

const Farmer = mongoose.model('Farmer', farmerSchema);

// --- API ROUTES ---

app.post('/api/farmers', async (req, res) => {
    try {
        const newFarmer = new Farmer(req.body);
        await newFarmer.save();
        res.status(201).json({ message: "Success" });
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/farmers', async (req, res) => {
    try {
        const farmers = await Farmer.find().sort({ registeredAt: -1 });
        res.json(farmers);
    } catch (error) {
        res.status(500).json({ error: "डाटा प्राप्त करने में त्रुटि आई" });
    }
});

// --- PAGE ROUTING ---

// Fix for direct page access (e.g., /admin or /register)
app.get('/:page', (req, res, next) => {
    let page = req.params.page;
    
    // Ignore API calls so they don't get treated as HTML pages
    if (page === 'api') return next();

    // Ensure extension is .html
    if (!page.endsWith('.html')) {
        page += '.html';
    }

    const filePath = path.join(publicPath, page);

    // Check if file exists before sending to prevent server crash
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        next(); // If file doesn't exist, move to 404/Home
    }
});

// Home Route
app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

// 404 Catch-all (Redirect to home if page not found)
app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

// VERCEL EXPORT
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
}

module.exports = app;
