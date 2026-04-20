/* =========================================================
   spotify.js — frontend widget for "currently listening"
   polls /api/spotify every 30s while tab is visible.
   ========================================================= */

(() => {
  const el = document.getElementById('now-playing');
  if (!el) return;
  const track = el.querySelector('.np-track');

  const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

  const render = (data) => {
    if (!data || !data.title) {
      track.textContent = 'nothing playing right now';
      return;
    }
    const prefix = data.playing ? 'now: ' : 'last played: ';
    track.innerHTML = `${prefix}<span class="np-title">${escapeHtml(data.title)}</span> — ${escapeHtml(data.artist || '')}`;
    if (data.url) {
      track.innerHTML += ` <a href="${data.url}" target="_blank" rel="noopener">↗</a>`;
    }
  };

  const fetchNowPlaying = async () => {
    try {
      const res = await fetch('/api/spotify');
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      render(data);
    } catch (err) {
      track.textContent = 'spotify is shy right now';
    }
  };

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
