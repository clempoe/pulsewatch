export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { url, simple } = req.body;
    
        // Choix du type de scraping (Puppeteer ou Axios + Cheerio)
        const endpoint = simple ? 'scrape-simple' : 'scrape';
    
        try {
            const response = await fetch(`http://localhost:5000/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url }),
            });
    
        const data = await response.json();
        res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: 'Erreur lors de la communication avec le microservice' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
