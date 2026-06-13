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

  const revealCanvas = document.querySelector('.home-intro-overlay[data-overlay-src]');
  const revealBrush = document.querySelector('.home-reveal-brush');
  const revealArea = revealCanvas?.closest('.home-intro');

  if (revealCanvas instanceof HTMLCanvasElement && revealArea) {
    const context = revealCanvas.getContext('2d');
    const overlayImage = new Image();
    const brushRadius = () => window.matchMedia('(max-width: 767px)').matches ? 110 : 150;
    let lastPoint = null;
    let touchPainting = false;

    const sizeCanvas = () => {
      const rect = revealArea.getBoundingClientRect();
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      revealCanvas.width = Math.max(1, Math.round(rect.width * scale));
      revealCanvas.height = Math.max(1, Math.round(rect.height * scale));
      revealCanvas.style.width = `${rect.width}px`;
      revealCanvas.style.height = `${rect.height}px`;
      context.setTransform(scale, 0, 0, scale, 0, 0);
      lastPoint = null;
    };

    const drawOverlayCircle = (x, y) => {
      if (!overlayImage.complete || !overlayImage.naturalWidth) return;

      const width = revealArea.clientWidth;
      const height = revealArea.clientHeight;
      const scale = Math.max(width / overlayImage.naturalWidth, height / overlayImage.naturalHeight);
      const drawWidth = overlayImage.naturalWidth * scale;
      const drawHeight = overlayImage.naturalHeight * scale;
      const drawX = (width - drawWidth) / 2;
      const drawY = (height - drawHeight) / 2;

      context.save();
      context.beginPath();
      context.arc(x, y, brushRadius(), 0, Math.PI * 2);
      context.clip();
      context.drawImage(overlayImage, drawX, drawY, drawWidth, drawHeight);
      context.restore();
    };

    const paintTo = (x, y) => {
      if (!lastPoint) {
        drawOverlayCircle(x, y);
        lastPoint = { x, y };
        return;
      }

      const dx = x - lastPoint.x;
      const dy = y - lastPoint.y;
      const distance = Math.hypot(dx, dy);
      const spacing = Math.max(12, brushRadius() * 0.16);
      const steps = Math.max(1, Math.ceil(distance / spacing));

      for (let step = 1; step <= steps; step += 1) {
        const progress = step / steps;
        drawOverlayCircle(lastPoint.x + dx * progress, lastPoint.y + dy * progress);
      }

      lastPoint = { x, y };
    };

    const updateBrush = (event) => {
      if (!revealBrush) return;
      revealBrush.style.left = `${event.clientX}px`;
      revealBrush.style.top = `${event.clientY}px`;
      revealBrush.classList.add('is-visible');
    };

    revealArea.addEventListener('pointerenter', updateBrush);
    revealArea.addEventListener('pointerleave', () => {
      revealBrush?.classList.remove('is-visible');
      lastPoint = null;
    });
    revealArea.addEventListener('pointerdown', (event) => {
      touchPainting = event.pointerType !== 'mouse';
      updateBrush(event);
    });
    revealArea.addEventListener('pointerup', () => {
      touchPainting = false;
      lastPoint = null;
    });
    revealArea.addEventListener('pointercancel', () => {
      touchPainting = false;
      lastPoint = null;
    });
    revealArea.addEventListener('pointermove', (event) => {
      updateBrush(event);
      if (event.pointerType !== 'mouse' && !touchPainting) return;

      const rect = revealArea.getBoundingClientRect();
      paintTo(event.clientX - rect.left, event.clientY - rect.top);
    });

    overlayImage.addEventListener('load', sizeCanvas);
    overlayImage.src = revealCanvas.dataset.overlaySrc;
    window.addEventListener('resize', sizeCanvas);
    window.addEventListener('scroll', () => {
      if (window.scrollY >= revealArea.offsetHeight) {
        revealBrush?.classList.remove('is-visible');
      }
    }, { passive: true });
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
