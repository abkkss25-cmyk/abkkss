const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// THIS LINE is the magic: It serves your HTML files automatically
app.use(express.static(__dirname)); 

// MongoDB Connection
const MONGO_URI = "mongodb+srv://abkkss25_db_user:Py6BxC6fV8xDSOXL@cluster0.kjzhusu.mongodb.net/?appName=Cluster0" || "your_standard_connection_string_here";

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Farmer Schema
// Update this part in your server.js
const farmerSchema = new mongoose.Schema({
    name: String,
    mobile: String,
    village: String,
    district: String,
    state: String,
    pincode: String,
    farmSize: String,       // Received as String '5'
    cropType: String,      // Received as 'धान'
    farmingMethod: String, // Received as 'पारंपरिक'
    registeredAt: { type: Date, default: Date.now }
});

const Farmer = mongoose.model('Farmer', farmerSchema);

// API Routes
app.post('/api/farmers', async (req, res) => {
    try {
        console.log("Data Received:", req.body); // This will show you what the form sent
        const newFarmer = new Farmer(req.body);
        await newFarmer.save();
        res.status(201).json({ message: "Success" });
    } catch (error) {
        console.error("Database Error:", error); // This tells you WHY it failed
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

// Home Route
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));