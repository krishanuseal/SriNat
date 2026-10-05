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
      return res.status(500).json({ error: 'PLANTNET_API_KEY is not configured in Vercel environment variables.' });
    }

    const plantnetResponse = await fetch(
      `https://my-api.plantnet.org/v2/identify/all?api-key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'content-type': req.headers['content-type'],
        },
        body: req,
        duplex: 'half',
      }
    );

    const data = await plantnetResponse.json();
    return res.status(plantnetResponse.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
