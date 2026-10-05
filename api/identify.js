export const config = {
  api: {
    bodyParser: false, // Allows streaming raw multipart image uploads
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.PLANTNET_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'PLANTNET_API_KEY is not configured in Vercel settings.' });
    }

    const plantnetUrl = `https://my-api.plantnet.org/v2/identify/all?api-key=${apiKey.trim()}`;

    // Pass headers simulating a direct browser request to bypass Cloudflare IP blocks
    const response = await fetch(plantnetUrl, {
      method: 'POST',
      headers: {
        'content-type': req.headers['content-type'],
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'accept': 'application/json, text/plain, */*',
        'origin': 'https://my-api.plantnet.org',
        'referer': 'https://my-api.plantnet.org/',
      },
      body: req,
      duplex: 'half',
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.message || `PlantNet API returned status ${response.status}`,
        details: data,
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
