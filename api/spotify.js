/* =========================================================
   api/spotify.js — Vercel serverless function
   returns currently-playing track (or null if nothing playing)
   ========================================================= */

const CLIENT_ID     = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

const BASE64_CREDS  = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

async function getAccessToken() {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${BASE64_CREDS}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type:    'refresh_token',
      refresh_token: REFRESH_TOKEN,
    }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error(`token exchange failed: ${JSON.stringify(data)}`);
  return data.access_token;
}

async function getNowPlaying(accessToken) {
  const res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  console.log('spotify status:', res.status);
  if (res.status === 204) { console.log('204 — no active playback'); return null; }
  if (res.status > 400) { console.log('error status'); return null; }
  const data = await res.json();
  console.log('spotify data:', JSON.stringify(data).slice(0, 300));
  return data;
}

module.exports = async function handler(req, res) {
  try {
    const accessToken = await getAccessToken();
    const data = await getNowPlaying(accessToken);

    if (!data || !data.item) {
      return res.status(200).json({ playing: false, _debug: { hasData: !!data, isPlaying: data?.is_playing, itemType: data?.currently_playing_type } });
    }

    return res.status(200).json({
      playing:  data.is_playing,
      title:    data.item.name,
      artist:   data.item.artists.map((a) => a.name).join(', '),
      album:    data.item.album.name,
      albumArt: data.item.album.images[1]?.url ?? data.item.album.images[0]?.url,
      url:      data.item.external_urls.spotify,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
