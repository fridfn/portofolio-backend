import { get } from "@vercel/edge-config";
import { handleCors } from "../utils/handleCors.js";

export default async function Spotify(req, res) {
  const { q, limit } = req.query;
  const parsedLimit = parseInt(limit) || 5;

  if (!q) return res.status(400).json({ error: "Missing query parameter 'q'" });

  if (handleCors(req, res)) return;
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const rawCacheKey = `raw_${q}`;
    const cached = await get(rawCacheKey);

    let data;

    if (cached) {
      console.log(`✅ Cache hit raw for "${q}"`);
      data = cached;
    } else {
      console.log(`🔄 Fetching from Deezer for "${q}"...`);

      const searchRes = await fetch(
        `https://api.deezer.com/search?q=${encodeURIComponent(q)}`
      );

      data = await searchRes.json();

      await fetch(`${process.env.EDGE_CONFIG}/items/${rawCacheKey}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${process.env.EDGE_CONFIG_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value: data }),
      });
    }

    const result = {
      result: (data.data || [])
        .slice(0, parsedLimit)
        .map((track) => ({
          id: track.id,
          name: track.title,

          ...(track.album && {
            album: {
              id: track.album.id,
              name: track.album.title,
              images: track.album.cover_medium
                ? [{ url: track.album.cover_medium }]
                : [],
            },
          }),

          artist: track.artist?.name,
          image: track.album?.cover_medium,
          spotify_url: track.link,
          artist_data: track.artist ? [track.artist] : [],
          preview: track.preview,
          duration: track.duration,
        })),
    };

    return res.status(200).json({ ...result, cached: !!cached });

  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: err.message });
  }
}