export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.PLANTNET_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'PLANTNET_API_KEY is not configured in Vercel.' });
    }

    const { base64Image } = req.body;

    if (!base64Image) {
      return res.status(400).json({ error: 'No base64Image provided.' });
    }

    // Pass the image data directly to PlantNet API via JSON format
    const plantnetUrl = `https://my-api.plantnet.org/v2/identify/all?api-key=${apiKey.trim()}`;

    const response = await fetch(plantnetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        images: [base64Image],
        organs: ['auto']
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.message || `PlantNet returned HTTP ${response.status}`,
        details: data,
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
