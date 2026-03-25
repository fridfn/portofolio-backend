import { get } from "@vercel/edge-config";
import { handleCors } from "../utils/handleCors.js";

export default async function Spotify(req, res) {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "Missing query parameter 'q'" });

  if (handleCors(req, res)) return;
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const cacheKey = `${q}`;
    const cached = await get(cacheKey);

    if (cached) {
      console.log(`✅ Cache hit for "${q}"`);
      return res.status(200).json({ ...cached, cached: true });
    }

    console.log(`🔄 Fetching from Deezer for "${q}"...`);

    // 🔥 FETCH DEEZER
    const searchRes = await fetch(
      `https://api.deezer.com/search?q=${encodeURIComponent(q)}`
    );

    const raw = await searchRes.text();
    console.log("DEEZER RAW:", raw);

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return res.status(500).json({
        error: "Deezer response not JSON",
        raw,
      });
    }

    // 🔥 MAP KE FORMAT SPOTIFY KAMU
    const result = {
      result: data.data.map((track) => ({
        id: track.id,
        name: track.title,

        // album (opsional → kalau ada)
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

        spotify_url: track.link, // 🔁 ganti ke Deezer link

        artist_data: track.artist ? [track.artist] : [],

        // 🔥 tambahan (opsional kalau mau dipakai nanti)
        preview: track.preview,
        duration: track.duration,
      })),
    };

    // 💾 CACHE (tetap sama)
    try {
      const saveRes = await fetch(
        `${process.env.EDGE_CONFIG}/items/${cacheKey}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${process.env.EDGE_CONFIG_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ value: result }),
        }
      );

      if (!saveRes.ok) {
        const err = await saveRes.text();
        console.warn("⚠️ Failed to cache:", err);
      } else {
        console.log(`💾 Cached result for "${q}"`);
      }
    } catch (cacheErr) {
      console.warn("⚠️ Cache error:", cacheErr.message);
    }

    return res.status(200).json({ ...result, cached: false });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: err.message });
  }
}