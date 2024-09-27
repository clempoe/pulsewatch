const express = require('express');
const puppeteer = require('puppeteer');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = 5000;

// Middleware pour permettre les requêtes POST
app.use(express.json());

// Route de scraping via Puppeteer
app.post('/scrape', async (req, res) => {
    const { url } = req.body;
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url);
        const data = await page.evaluate(() => document.body.innerHTML); // Logique de scraping
        await browser.close();
        res.status(200).json({ data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors du scraping' });
    }
});

// Scraping basique avec Axios et Cheerio
app.post('/scrape-simple', async (req, res) => {
    const { url } = req.body;
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const title = $('title').text(); // Exemple de scraping d'un titre
        res.status(200).json({ title });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors du scraping simple' });
    }
});

app.listen(PORT, () => {
    console.log(`Scraping service running on port ${PORT}`);
});
