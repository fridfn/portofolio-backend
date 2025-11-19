import fetch from "node-fetch";
import { get } from "@vercel/edge-config";
import { handleCors } from "../utils/handleCors.js"

export default async function Spotify(req, res) {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "Missing query parameter 'q'" });
  
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const cacheKey = `${q}`;
    const cached = await get(cacheKey);
    console.log(cached)
    if (cached) {
      console.log(`✅ Cache hit for "${q}"`);
      return res.status(200).json({ ...cached, cached: true });
    }

    console.log(`🔄 Cache miss for "${q}", fetching from Spotify...`);

    const auth = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString("base64");

    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      timeout: 5000,
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      return res.status(500).json({
        error: "Failed to get Spotify access token",
        details: tokenData,
      });
    }

    const accessToken = tokenData.access_token;

    const searchRes = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&limit=5`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const data = await searchRes.json();
    if (!searchRes.ok) {
      return res.status(500).json({
        error: "Spotify search failed",
        details: data,
      });
    }
    const result = {
      result: data.tracks.items.map((track) => ({
        id: track.id,
        name: track.name,
        album: {
         album_type: track.album.album_type,
         artists: track.album.artists,
         href: track.album.href,
         id: track.album.id,
         images: track.album.images,
         name: track.album.name,
         release_date: track.album.release_date,
         total_tracks: track.album.name,
         type: track.album.type,
         uri: track.album.uri,
        },
        artist: track.artists.map((a) => a.name).join(", "),
        image: track.album.images[0]?.url,
        spotify_url: track.external_urls.spotify,
        artist_data: track.album.artists,
      })),
    };
    // 💾 Save to Edge Config manually using REST API
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
        console.warn("⚠️ Failed to cache in Edge Config:", err);
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

Nov 18 22:16:15.79
GET
500
pwa-notification-phi.vercel.app
/api/spotify
2
🔄 Cache miss for "h", fetching from Spotify...
Nov 18 22:16:11.80
GET
500
pwa-notification-phi.vercel.app
/api/spotify
2
🔄 Cache miss for "haloo", fetching from Spotify...
Nov 18 22:16:10.67
GET
200
pwa-notification-phi.vercel.app
/api/spotify
2
✅ Cache hit for "to_the_bone"
Nov 18 22:15:59.37
GET
200
pwa-notification-phi.vercel.app
/api/spotify
2
✅ Cache hit for "to_the_bone"
Nov 18 22:15:52.90
GET
200
pwa-notification-phi.vercel.app
