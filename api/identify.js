export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.PLANTNET_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'PLANTNET_API_KEY is not configured in Vercel environment variables.' });
    }

    const { base64Image } = req.body;

    if (!base64Image) {
      return res.status(400).json({ error: 'No image payload provided.' });
    }

    // Extract base64 header and decode raw image buffer
    const matches = base64Image.match(/^data:(.+);base64,(.+)$/);
    let mimeType = 'image/jpeg';
    let base64Data = base64Image;

    if (matches && matches.length === 3) {
      mimeType = matches[1];
      base64Data = matches[2];
    }

    const imageBuffer = Buffer.from(base64Data, 'base64');
    const imageBlob = new Blob([imageBuffer], { type: mimeType });

    // Construct server-side multipart/form-data required by PlantNet
    const formData = new FormData();
    formData.append('images', imageBlob, 'plant.jpg');
    formData.append('organs', 'auto');

    const plantnetUrl = `https://my-api.plantnet.org/v2/identify/all?api-key=${apiKey.trim()}`;

    const response = await fetch(plantnetUrl, {
      method: 'POST',
      body: formData,
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
