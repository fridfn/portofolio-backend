const BASE_URL = "https://api.deezer.com";

export const fetchDeezer = async (enpoint) => {
  const res = await fetch(`${BASE_URL}${enpoint}`)
  return res.json();
}

export const getTrackById = async (id) => {
  return fetchDeezer(`/track/${id}`)
}

export const searchTrack = async (query) => {
  return fetchDeezer(`/search?q=${encodeURIComponent(query)}`)
}