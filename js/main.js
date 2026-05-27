/* =========================================================
   main.js — entry point
   keeps videos looping + handles hero modal
   ========================================================= */

(() => {
  document.querySelectorAll('video').forEach((video) => {
    video.controls = false;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.play().catch(() => {});
  });

  // hero modal — double-click to open, click overlay or Escape to close
  const overlay = document.getElementById('modal-overlay');
  const modalImg = document.getElementById('modal-img');

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
})();
