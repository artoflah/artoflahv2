/* =========================================================
   spotify.js — frontend widget for "currently listening"
   polls /api/spotify every 30s while tab is visible.
   ========================================================= */

(() => {
  const el = document.getElementById('now-playing');
  if (!el) return;
  const track = el.querySelector('.np-track');
  const headingLink = el.querySelector('.spotify-heading-link');
  const spotifyProfileUrl = 'https://open.spotify.com/user/1l39grb1pery2mq5jwj3hbhz5?si=714616ac8f304ea6';

  const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

  const render = (data) => {
    if (!data || !data.title) {
      track.textContent = 'nothing playing right now';
      if (headingLink) headingLink.href = spotifyProfileUrl;
      return;
    }
    const prefix = data.playing ? 'now: ' : 'last played: ';
    track.innerHTML = `${prefix}<span class="np-title">${escapeHtml(data.title)}</span> — ${escapeHtml(data.artist || '')}`;
  };

  const fetchNowPlaying = async () => {
    try {
      const res = await fetch('/api/spotify');
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      render(data);
    } catch (err) {
      track.textContent = 'spotify is shy right now';
      if (headingLink) headingLink.href = spotifyProfileUrl;
    }
  };

  if (headingLink) headingLink.href = spotifyProfileUrl;

  fetchNowPlaying();

  // poll every 30s, but pause when tab is hidden
  let interval = setInterval(fetchNowPlaying, 30000);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearInterval(interval);
    } else {
      fetchNowPlaying();
      interval = setInterval(fetchNowPlaying, 30000);
    }
  });
})();
