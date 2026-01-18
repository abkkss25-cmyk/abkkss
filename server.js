const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '/')));

// MongoDB Connection Logic for Serverless
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://abkkss25_db_user:Py6BxC6fV8xDSOXL@cluster0.kjzhusu.mongodb.net/?appName=Cluster0";

let isConnected = false;

const connectToDatabase = async () => {
    if (isConnected) return;
    try {
        const db = await mongoose.connect(MONGO_URI);
        isConnected = db.connections[0].readyState;
        console.log("✅ MongoDB Connected");
    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err);
    }
};

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

const Farmer = mongoose.models.Farmer || mongoose.model('Farmer', farmerSchema);

// API Routes
app.post('/api/farmers', async (req, res) => {
    await connectToDatabase();
    try {
        const newFarmer = new Farmer(req.body);
        await newFarmer.save();
        res.status(201).json({ message: "Success" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/farmers', async (req, res) => {
    await connectToDatabase();
    try {
        const farmers = await Farmer.find().sort({ registeredAt: -1 });
        res.json(farmers);
    } catch (error) {
        res.status(500).json({ error: "डाटा प्राप्त करने में त्रुटि आई" });
    }
});

// Serve the index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// For Vercel, we export the app instead of just calling app.listen
// This allows Vercel to handle the serverless execution
module.exports = app;

// Keep local development working
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Local Server: http://localhost:${PORT}`));
}
