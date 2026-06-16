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
  const revealArea = revealCanvas?.closest('.home-intro');
  const revealCue = document.querySelector('[data-reveal-cue]');
  const dragHint = document.querySelector('[data-drag-hint]');

  if (revealCanvas instanceof HTMLCanvasElement && revealArea) {
    const context = revealCanvas.getContext('2d');
    const overlayImage = new Image();
    const brushRadius = () => window.matchMedia('(max-width: 767px)').matches ? 145 : 205;
    let lastPoint = null;
    let touchPainting = false;
    let hasRevealed = false;

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

    const drawOverlayMist = (x, y) => {
      if (!overlayImage.complete || !overlayImage.naturalWidth) return;

      const width = revealArea.clientWidth;
      const height = revealArea.clientHeight;
      const scale = Math.max(width / overlayImage.naturalWidth, height / overlayImage.naturalHeight);
      const drawWidth = overlayImage.naturalWidth * scale;
      const drawHeight = overlayImage.naturalHeight * scale;
      const drawX = (width - drawWidth) / 2 + width * 0.035;
      const drawY = (height - drawHeight) / 2;
      const radius = brushRadius();
      const layers = [
        { size: 1, alpha: 0.035 },
        { size: 0.88, alpha: 0.055 },
        { size: 0.74, alpha: 0.085 },
        { size: 0.6, alpha: 0.13 },
        { size: 0.46, alpha: 0.2 },
        { size: 0.32, alpha: 0.32 }
      ];

      layers.forEach((layer) => {
        context.save();
        context.globalAlpha = layer.alpha;
        context.beginPath();
        context.arc(x, y, radius * layer.size, 0, Math.PI * 2);
        context.clip();
        context.drawImage(overlayImage, drawX, drawY, drawWidth, drawHeight);
        context.restore();
      });
    };

    const paintTo = (x, y) => {
      if (!lastPoint) {
        drawOverlayMist(x, y);
        lastPoint = { x, y };
        return;
      }

      const dx = x - lastPoint.x;
      const dy = y - lastPoint.y;
      const distance = Math.hypot(dx, dy);
      const spacing = Math.max(10, brushRadius() * 0.1);
      const steps = Math.max(1, Math.ceil(distance / spacing));

      for (let step = 1; step <= steps; step += 1) {
        const progress = step / steps;
        drawOverlayMist(lastPoint.x + dx * progress, lastPoint.y + dy * progress);
      }

      lastPoint = { x, y };

      if (!hasRevealed) {
        hasRevealed = true;
        revealCue?.classList.add('is-revealed');
        if (revealCue) revealCue.textContent = 'Scroll ↓';
      }
    };

    revealArea.addEventListener('pointerleave', () => {
      lastPoint = null;
    });
    revealArea.addEventListener('pointerdown', (event) => {
      touchPainting = event.pointerType !== 'mouse';
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
      if (event.pointerType !== 'mouse' && !touchPainting) return;

      const rect = revealArea.getBoundingClientRect();
      paintTo(event.clientX - rect.left, event.clientY - rect.top);
    });

    overlayImage.addEventListener('load', sizeCanvas);
    overlayImage.src = revealCanvas.dataset.overlaySrc;
    window.addEventListener('resize', sizeCanvas);
  }

  if (revealArea && dragHint) {
    const firstProject = document.getElementById('forever-yours');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let lastScrollY = window.scrollY;
    let hasAutoJumped = false;

    const revealBottom = () => revealArea.getBoundingClientRect().bottom + window.scrollY;

    const toggleDragHint = () => {
      dragHint.classList.toggle('is-visible', window.scrollY >= revealBottom() - 80);
    };

    const jumpToProjects = () => {
      if (!firstProject) return;
      hasAutoJumped = true;
      dragHint.classList.add('is-visible');
      firstProject.scrollIntoView({
        block: 'start',
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    };

    revealCue?.addEventListener('click', (event) => {
      event.preventDefault();
      jumpToProjects();
    });

    toggleDragHint();
    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      const scrollingDown = currentScrollY > lastScrollY;
      const triggerY = revealBottom() * 0.42;

      toggleDragHint();

      if (currentScrollY < 12) hasAutoJumped = false;
      if (scrollingDown && !hasAutoJumped && currentScrollY > triggerY && currentScrollY < revealBottom() - 24) {
        jumpToProjects();
      }

      lastScrollY = currentScrollY;
    }, { passive: true });
    window.addEventListener('resize', toggleDragHint);
  }

  const videos = document.querySelectorAll('video');

  videos.forEach((video) => {
    video.removeAttribute('controls');
    video.controls = false;
    video.autoplay = true;
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute('autoplay', '');
    video.setAttribute('muted', '');
    video.setAttribute('loop', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.setAttribute('controlslist', 'nodownload noplaybackrate noremoteplayback');
    video.setAttribute('disablepictureinpicture', '');
    video.setAttribute('disableremoteplayback', '');
    video.disablePictureInPicture = true;
    video.disableRemotePlayback = true;
    video.play().catch(() => {});
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
