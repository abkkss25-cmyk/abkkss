const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, '../public')));

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://abkkss25_db_user:Py6BxC6fV8xDSOXL@cluster0.kjzhusu.mongodb.net/?appName=Cluster0";

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// UPDATED Farmer Schema to match all new form fields
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

// API Routes
app.post('/api/farmers', async (req, res) => {
    try {
        console.log("Data Received:", req.body); // Useful for debugging in Vercel logs
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

// Home Route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Handle individual page requests if direct links are used
app.get('/:page', (req, res) => {
    const page = req.params.page;
    if (page.endsWith('.html')) {
        res.sendFile(path.join(__dirname, '../public', page));
    } else {
        res.sendFile(path.join(__dirname, '../public', `${page}.html`));
    }
});

// VERCEL EXPORT
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
}

module.exports = app;
