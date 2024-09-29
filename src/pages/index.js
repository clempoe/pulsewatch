import { useState } from 'react';

export default function Home() {
  const [keywords, setKeywords] = useState('');
  const [data, setData] = useState(null);
  const [simple, setSimple] = useState(false);

  const handleScrape = async () => {
    const response = await fetch('/api/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ keywords, simple }),
    });

    const result = await response.json();
    setData(result);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-4">
      <h1 className="text-4xl font-bold mb-5 text-center">Bienvenue sur PulseWatch</h1>
      <div className="w-full max-w-md flex flex-col space-y-4">
        <input
          type="text"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="Entrez les mots-clés à surveiller"
          className="w-full p-3 rounded-lg border border-gray-500 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={simple}
            onChange={() => setSimple(!simple)}
            className="form-checkbox h-4 w-4 text-blue-500"
          />
          <span>Mode Simple</span>
        </label>
        <button
          onClick={handleScrape}
          className="w-full p-3 rounded-lg bg-blue-500 hover:bg-blue-600 transition duration-200"
        >
          Scraper
        </button>
      </div>

      {data && (
        <div className="mt-5 p-4 w-full max-w-2xl border border-gray-700 rounded-lg bg-gray-900 text-left">
          <h2 className="text-xl font-semibold">Données scrappées :</h2>
          <pre className="mt-2 text-gray-300 whitespace-pre-wrap break-words">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
