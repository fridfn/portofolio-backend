import { get } from "@vercel/edge-config";
import { handleCors } from "../utils/handleCors.js";
import { mapTrack } from "../lib/mappers/track.js";
import { getTrackById, searchTracks } from "../lib/deezer.js";

export default async function Spotify(req, res) {
  const { q, limit, id } = req.query;
  const parsedLimit = parseInt(limit) || 5;
  
  if (!q) return res.status(400).json({ error: "Missing query parameter 'q'" });
  
  if (handleCors(req, res)) return;
  
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  
  try {
    // =========================
    // 🎯 CASE 1: GET BY ID
    // =========================
    if (id) {
      console.log(`🎯 Fetch by ID: ${id}`);

      const track = await getTrackById(id);

      return res.status(200).json({
        result: mapTrack(track),
      });
    }
    
    // =========================
    // ❌ VALIDATION
    // =========================
    if (!q) {
      return res.status(400).json({
        error: "Missing query parameter 'q' or 'id'",
      });
    }
    
    // =========================
    // 🧠 CACHE HANDLING
    // =========================
    const rawCacheKey = `raw_${q}`;
    const cached = await get(rawCacheKey);

    let data;

    if (cached) {
      console.log(`✅ Cache hit for "${q}"`);
      data = cached;
    } else {
      console.log(`🔄 Fetching from Deezer: "${q}"`);

      data = await searchTracks(q);

      await fetch(`${process.env.EDGE_CONFIG}/items/${rawCacheKey}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${process.env.EDGE_CONFIG_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value: data }),
      });
    }
    
    // =========================
    // 🎯 RESPONSE
    // =========================
    return res.status(200).json({
      result: (data.data || [])
        .slice(0, parsedLimit)
        .map(mapTrack),
      cached: !!cached,
    });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: err.message });
  }
}