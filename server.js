require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path'); 
const fs = require('fs'); 
const { db } = require('./db');
const { getClothes } = require('./nlpService');
const moment = require('moment'); 

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use('/uploads', express.static(uploadsDir));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname)));
app.use('/favicon.ico', express.static(path.join(__dirname, 'favicon.ico')));

app.get('/api/wardrobe', (req, res) => {
    const query = 'SELECT * FROM wardrobe_items';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

app.post('/api/query', async (req, res) => {
    const query = req.body.query;
    console.log("User Query:", query);

    const items = await getClothes(query);

    if (items === "Sorry, no items match your criteria.") {
        return res.json({
            message: "Sorry, no items match your criteria.",
            results: [] // Empty array when no items found
        });
    }

    res.json({
        message: "Here are your matching wardrobe items:",
        results: items  
    });
});

app.post('/api/upload-image', (req, res) => {
    const { image } = req.body;
    const base64Data = image.replace(/^data:image\/jpeg;base64,/, '');

    const formattedDateTime = moment().format('DD-MM-YYYY_hh-mm-ss');
    const imageName = `image_${formattedDateTime}.jpg`;

    const imagePath = path.join(uploadsDir, imageName);

    console.log("Received upload request");

    fs.writeFile(imagePath, base64Data, 'base64', (err) => {
        if (err) {
            console.log("Error saving image:", err);
            return res.status(500).json({ error: 'Error saving image' });
        }

        console.log("Image saved successfully");

        const imageUrl = `/uploads/${imageName}`;

        res.status(200).json({
            message: "Image saved successfully",
            imageUrl: imageUrl
        });

        const query = 'INSERT INTO wardrobe_items (image_url) VALUES (?)';
        db.query(query, [imageUrl], (err, result) => {
            if (err) {
                console.log("Error saving image path to DB:", err);
                return res.status(500).json({ error: 'Error saving image path' });
            }
            console.log("Result after uploading is:", result);
            const itemId = result.insertId;
            console.log("Image saved with ID:", itemId);
        });
    });
});

app.post('/api/save-clothing', (req, res) => {
    const { imageUrl, name, category, gender, material, colorPalette, season, dressType, status, brand, careInstructions, location, dateAdded, lastWorn } = req.body;

    if (!imageUrl) {
        return res.status(400).json({ error: 'Clothing ID is required' });
    }

    const query = `
        UPDATE wardrobe_items 
        SET name = ?, category = ?, gender = ?, material = ?, color_palette = ?, season = ?, 
            dress_type = ?, status = ?, brand = ?, care_instructions = ?, 
            location = ?, date_added = ?, last_worn = ? 
        WHERE image_url = ?
    `;
    const params = [name, category, gender, material, colorPalette, season, dressType, status, brand, careInstructions, location, dateAdded, lastWorn, imageUrl];
    res.status(200).json({ message: 'Clothing details saved successfully!' });

    db.query(query, params, (err, result) => {
        if (err) {
            console.error('Error saving clothing details:', err);
            return res.status(500).json({ error: 'Error saving clothing details' });
        }
         console.log('Clothing details saved successfully');
    });
});

app.post('/api/update', (req, res) => {
    const { image_url, name, category, gender, season, color_palette, status, material, location, last_worn } = req.body;

    console.log("Received update request with data:", req.body);

    console.log("Image URL received:", image_url);

    const query = `
        UPDATE wardrobe_items 
        SET 
            name = ?, category = ?, gender = ?, season = ?, 
            color_palette = ?, status = ?, material = ?, location = ?, last_worn = ?
        WHERE image_url = ?;
    `;
    
    const params = [
        name, category, gender, season, color_palette, status, material, location, last_worn, image_url
    ];
    
    console.log("Executing query with params:", params);
    
    db.query(query, params, (err, result) => {
        if (err) {
            console.error('Error updating clothing details:', err);
            return res.status(500).json({ error: 'Error updating clothing details' });
        }
        
        console.log("Update successful:", result);
        
        res.status(200).json({ message: 'Clothing details updated successfully!' });
    });
});


const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});