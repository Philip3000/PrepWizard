const express = require('express');
const fetch = require('node-fetch');
const app = express();
const port = process.env.PORT || 3000;

const API_KEY = process.env.API_KEY;  // Store API key in environment variable

app.use(express.json());

app.post('/generate-question', async (req, res) => {
    try {
        const requestBody = {
            contents: req.body.contents,
            safetySettings: req.body.safetySettings,
            generationConfig: req.body.generationConfig
        };

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        const responseData = await response.json();
        res.json(responseData);
    } catch (error) {
        console.error("Error generating content:", error);
        res.status(500).json({ error: "Error generating content" });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
