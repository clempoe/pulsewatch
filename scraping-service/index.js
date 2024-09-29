const express = require('express');
const puppeteer = require('puppeteer');
const axios = require('axios');
const https = require('https');
const cheerio = require('cheerio');
const { URL } = require('url'); // Pour la validation des URL

const app = express();
const PORT = 5000;

// Désactive la vérification SSL
const instance = axios.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    })
});

// Middleware pour permettre les requêtes POST
app.use(express.json());

// Fonction pour valider l'URL
function isValidUrl(userUrl) {
    try {
        const validatedUrl = new URL(userUrl);
        return validatedUrl.protocol === "http:" || validatedUrl.protocol === "https:";
    } catch (error) {
        return false;
    }
}

// Route de scraping via Puppeteer
app.post('/scrape', async (req, res) => {
    const { url } = req.body;

    console.log("URL reçue pour le scraping :", url); // Vérifie que l'URL est correctement reçue et utilisée

    // Vérifier si l'URL est valide
    if (!isValidUrl(url)) {
        console.error('URL invalide ou manquante:', url);
        return res.status(400).json({ error: 'URL invalide ou manquante' });
    }

    try {
        const browser = await puppeteer.launch({
            ignoreHTTPSErrors: true
        });
        const page = await browser.newPage();

        // Gérer les erreurs de navigation
        try {
            if (!url || typeof url !== 'string' || !url.startsWith('http')) {
                console.error('URL invalide:', url);
                return res.status(400).json({ error: 'URL invalide' });
            }
            console.log('Navigation vers l\'URL:', url);
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        } catch (navigationError) {
            console.error('Erreur lors de la navigation vers l\'URL:', url, navigationError);
            await browser.close();
            return res.status(500).json({ error: 'Erreur lors de la navigation vers le site web' });
        }

        // Extraction des données
        try {
            const data = await page.evaluate(() => document.body.innerHTML);
            await browser.close();
            res.status(200).json({ data });
        } catch (evaluationError) {
            console.error('Erreur lors de l\'évaluation du contenu de la page', evaluationError);
            await browser.close();
            res.status(500).json({ error: 'Erreur lors de l\'extraction des données de la page' });
        }

    } catch (error) {
        console.error('Erreur avec Puppeteer', error);
        res.status(500).json({ error: 'Erreur lors du scraping avec Puppeteer' });
    }
});

// Scraping basique avec Axios et Cheerio
app.post('/scrape-simple', async (req, res) => {
    const { url } = req.body;
    console.log("URL reçue pour le scraping simple :", url);

    // Vérifier si l'URL est valide
    if (!isValidUrl(url)) {
        console.error('URL invalide:', url);
        return res.status(400).json({ error: 'URL invalide' });
    }

    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const title = $('title').text();
        res.status(200).json({ title });
    } catch (error) {
        if (error.response) {
            console.error(`Erreur HTTP ${error.response.status} lors de la requête vers l'URL: ${url}`, error);
            res.status(500).json({ error: `Erreur HTTP ${error.response.status}` });
        } else if (error.request) {
            console.error('Erreur de connexion lors de la requête', error);
            res.status(500).json({ error: 'Erreur de connexion à l\'URL' });
        } else {
            console.error('Erreur lors de la requête', error);
            res.status(500).json({ error: 'Erreur lors de la requête' });
        }
    }
});

// Démarre le serveur
app.listen(PORT, () => {
    console.log(`Scraping service running on port ${PORT}`);
});
