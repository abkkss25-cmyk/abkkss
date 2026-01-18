const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '/')));

// This reads the variable from Vercel's settings
const MONGO_URI = process.env.MONGO_URI; 

let isConnected = false;
const connectToDatabase = async () => {
    if (isConnected) return;
    try {
        const db = await mongoose.connect(MONGO_URI);
        isConnected = db.connections[0].readyState;
    } catch (err) {
        console.error("MongoDB Error:", err);
    }
};

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
        res.status(500).json({ error: "Error fetching data" });
    }
});

// Important for Vercel: Export the app
module.exports = app;
