export default async function handler(req, res) {
  const { videoId } = req.query;
  if (!videoId) {
    return res.status(400).json({ error: 'videoId is required' });
  }

  const pipedInstances = [
    'https://pipedapi.kavin.rocks',
    'https://api.piped.privacydev.net',
    'https://piped-api.lunar.icu'
  ];

  for (const base of pipedInstances) {
    try {
      const response = await fetch(`${base}/streams/${encodeURIComponent(videoId)}`);
      if (response.ok) {
        const data = await response.json();
        const audioStreams = data.audioStreams || [];
        const bestAudio = audioStreams.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0];
        if (bestAudio && bestAudio.url) {
          return res.redirect(302, bestAudio.url);
        }
      }
    } catch (e) {
      continue;
    }
  }

  return res.status(502).json({ error: 'Failed to extract audio stream' });
}
