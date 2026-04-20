/* =========================================================
   api/spotify.js — vercel serverless function
   returns { isPlaying, title, artist, albumArt, trackUrl }
   ========================================================= */

const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const NOW_URL = 'https://api.spotify.com/v1/me/player/currently-playing';
const RECENT_URL = 'https://api.spotify.com/v1/me/player/recently-played?limit=1';

async function getAccessToken() {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = process.env;
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) {
    throw new Error('missing spotify env vars');
  }

  const basic = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: SPOTIFY_REFRESH_TOKEN,
  });

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });
  if (!res.ok) throw new Error('failed to refresh token');
  const json = await res.json();
  return json.access_token;
}

function formatTrack(item, isPlaying) {
  if (!item) return null;
  return {
    isPlaying,
    title: item.name,
    artist: (item.artists || []).map((a) => a.name).join(', '),
    albumArt: item.album && item.album.images && item.album.images[0] ? item.album.images[0].url : null,
    trackUrl: item.external_urls ? item.external_urls.spotify : null,
  };
}

module.exports = async (req, res) => {
  try {
    const token = await getAccessToken();

    // check currently playing
    const nowRes = await fetch(NOW_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (nowRes.status === 200) {
      const data = await nowRes.json();
      if (data && data.item) {
        res.setHeader('Cache-Control', 's-maxage=20, stale-while-revalidate=40');
        return res.status(200).json(formatTrack(data.item, !!data.is_playing));
      }
    }

    // fall back to recently played
    const recentRes = await fetch(RECENT_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (recentRes.ok) {
      const data = await recentRes.json();
      const track = data.items && data.items[0] ? data.items[0].track : null;
      if (track) {
        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
        return res.status(200).json(formatTrack(track, false));
      }
    }

    return res.status(200).json({ isPlaying: false, title: null });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
