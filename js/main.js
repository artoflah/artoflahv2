/* =========================================================
   main.js — entry point
   keeps videos looping + handles hero modal
   ========================================================= */

(() => {
  const clock = document.getElementById('local-clock');

  if (clock) {
    const clockFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    const updateClock = () => {
      const now = new Date();
      clock.textContent = clockFormatter.format(now);
      clock.dateTime = now.toISOString();
    };

    updateClock();
    window.setInterval(updateClock, 1000);
  }

  const videos = document.querySelectorAll('video');

  videos.forEach((video) => {
    video.controls = false;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
  });

  if ('IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (!(video instanceof HTMLVideoElement)) return;

        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    }, { rootMargin: '300px 0px', threshold: 0.01 });

    videos.forEach((video) => videoObserver.observe(video));
  } else {
    videos.forEach((video) => video.play().catch(() => {}));
  }

  // hero modal — double-click to open, click overlay or Escape to close
  const overlay = document.getElementById('modal-overlay');
  const modalImg = document.getElementById('modal-img');

  if (overlay && modalImg) {
    // hero has pointer-events:none so satellites beneath are draggable.
    // detect dblclick by checking if coordinates fall within any hero img.
    document.addEventListener('dblclick', (e) => {
      document.querySelectorAll('.hero img').forEach((img) => {
        const r = img.getBoundingClientRect();
        if (e.clientX >= r.left && e.clientX <= r.right &&
            e.clientY >= r.top  && e.clientY <= r.bottom) {
          modalImg.src = img.src;
          modalImg.alt = img.alt;
          overlay.removeAttribute('hidden');
          requestAnimationFrame(() => overlay.classList.add('is-open'));
        }
      });
    });

    const closeModal = () => {
      overlay.classList.remove('is-open');
      overlay.addEventListener('transitionend', () => overlay.setAttribute('hidden', ''), { once: true });
    };

    overlay.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
  }
})();
