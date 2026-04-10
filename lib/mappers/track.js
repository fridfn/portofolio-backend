export const mapTrack = (track) => ({
  id: track.id,
  name: track.title,

  album: track.album && {
    id: track.album.id,
    name: track.album.title,
    images: track.album.cover_medium
      ? [{ url: track.album.cover_medium }]
      : [],
  },

  artist: track.artist?.name,
  image: track.album?.cover_medium,
  spotify_url: track.link,
  artist_data: track.artist ? [track.artist] : [],
  preview: track.preview,
  duration: track.duration,
});