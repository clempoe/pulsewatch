function normalizeKeyword(keyword) {
    return keyword.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Exemple d'une fonction qui retourne une URL en fonction des mots-clés
function getURLFromKeywords(keywords) {
    const keywordMapping = {
        "tendances stream": "https://www.twitch.tv/directory/game",
        "test": "https://www.google.com",
        "jeux videos": "https://www.jeuxvideo.com/toutes-les-news/",
        "concurrents": "https://www.youtube.com/results?search_query=" + encodeURIComponent(keywords),
    };

    const normalizedKeywords = normalizeKeyword(keywords); // Normaliser les mots-clés reçus
    console.log("Mots-clés normalisés :", normalizedKeywords); // Pour déboguer

    // return keywordMapping[normalizeKeyword] || null;

    const url = keywordMapping[normalizedKeywords]; // Vérifiez si l'URL est trouvée
    console.log("URL générée :", url); // Pour déboguer

    return url || null; // Retourner l'URL ou null
}

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { keywords, simple } = req.body;

        console.log("Mots-clés reçus :", keywords);

        // Vérification des mots-clés pour s'assurer qu'ils ne sont pas vides
        if (!keywords || keywords.trim() === "") {
            return res.status(400).json({ error: "Les mots-clés ne peuvent pas être vides." });
        }

        // Trouver une URL en fonction des mots-clés fournis
        const normalizedKeywords = normalizeKeyword(keywords);
        const url = getURLFromKeywords(keywords);
        
        console.log("Mots-clés saisis :", keywords);
        console.log("Mots-clés normalisés :", normalizedKeywords);
        console.log("URL générée :", url);

        if (!url) {
            console.log("URL envoyée au microservice:", url);  
            return res.status(400).json({ error: "Aucune URL trouvée pour les mots-clés spécifiés." });
        }

        // Choisir le bon type de scraping (Puppeteer ou Axios + Cheerio)
        const endpoint = simple ? 'scrape-simple' : 'scrape';

        try {
            const response = await fetch(`http://localhost:5000/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36',
                },
                body: JSON.stringify({ url }),
            });

            const data = await response.json();
            console.log("Réponse du microservice :", data);
            res.status(200).json(data);
        } catch (error) {
            console.error("Erreur lors de la requête vers le microservice:", error);
            res.status(500).json({ error: 'Erreur lors de la communication avec le microservice' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
