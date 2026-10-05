export const config = {
  api: {
    bodyParser: false, // Disables body parsing so raw multipart stream forwards directly
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.PLANTNET_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'PLANTNET_API_KEY environment variable is missing in Vercel.' });
    }

    const plantnetUrl = `https://my-api.plantnet.org/v2/identify/all?api-key=${apiKey.trim()}`;

    const plantnetResponse = await fetch(plantnetUrl, {
      method: 'POST',
      headers: {
        'content-type': req.headers['content-type'],
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      body: req,
      duplex: 'half',
    });

    const data = await plantnetResponse.json();

    if (!plantnetResponse.ok) {
      // Return the detailed error message from PlantNet if available
      return res.status(plantnetResponse.status).json({
        error: data.message || `PlantNet API returned HTTP ${plantnetResponse.status}`,
        details: data
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
