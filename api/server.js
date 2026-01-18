const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // Added path module
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

/** * UPDATED STATIC SERVING:
 * Since server.js is inside /api, we go up one level to find the /public folder
 */
app.use(express.static(path.join(__dirname, '../public')));

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://abkkss25_db_user:Py6BxC6fV8xDSOXL@cluster0.kjzhusu.mongodb.net/?appName=Cluster0";

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Farmer Schema
const farmerSchema = new mongoose.Schema({
    name: String,
    mobile: String,
    village: String,
    district: String,
    state: String,
    pincode: String,
    farmSize: String,
    cropType: String,
    farmingMethod: String,
    registeredAt: { type: Date, default: Date.now }
});

const Farmer = mongoose.model('Farmer', farmerSchema);

// API Routes
app.post('/api/farmers', async (req, res) => {
    try {
        const newFarmer = new Farmer(req.body);
        await newFarmer.save();
        res.status(201).json({ message: "Success" });
    } catch (error) {
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

/**
 * UPDATED HOME ROUTE:
 * Pointing to the public folder version of index.html
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// IMPORTANT FOR VERCEL: 
// Local development uses app.listen, but Vercel needs the app exported.
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
}

module.exports = app;
