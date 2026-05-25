/* =========================================================
   main.js — entry point
   wires up toc active state (intersection observer) + smooth scroll
   ========================================================= */

(() => {
  const assetFallbacks = new Map([
    ['assets/projects/foundry/page1(foundry).png', 'assets/page1(foundry).png'],
    ['assets/projects/foundry/page2(foundry).png', 'assets/page2(foundry).png'],
    ['assets/projects/foundry/page3(foundry).png', 'assets/page3(foundry).png'],
    ['assets/projects/foundry/envelope.png', 'assets/envelope.png'],
    ['assets/projects/foundry/pin1.png', 'assets/pin1.png'],
    ['assets/projects/foundry/pin2.png', 'assets/pin2.png'],
    ['assets/projects/foundry/pin3.png', 'assets/pin3.png'],
    ['assets/projects/foundry/pin4.png', 'assets/pin4.png'],
    ['assets/projects/foundry/pin5.png', 'assets/pin5.png'],
    ['assets/projects/foundry/pin6.png', 'assets/pin6.png'],
    ['assets/projects/foundry/pin7.png', 'assets/pin7.png'],
    ['assets/projects/foundry/pin8.png', 'assets/pin8.png'],
    ['assets/projects/foundry/pin9.png', 'assets/pin9.png'],
    ['assets/projects/foundry/pin10.png', 'assets/pin10.png'],
    ['assets/projects/foundry/pin11.png', 'assets/pin11.png'],
    ['assets/projects/foundry/pin12.png', 'assets/pin12.png'],
    ['assets/projects/forever-yours/foreveryours,ladybug.webp', 'assets/foreveryours,ladybug.webp'],
    ['assets/projects/come-home/comehome.webp', 'assets/comehome.webp'],
    ['assets/projects/come-home/home(drag).png', 'assets/home(drag).png'],
    ['assets/projects/come-home/home(drag2).png', 'assets/home(drag2).png'],
    ['assets/projects/scratched-into-being/scratchedintobeing.webp', 'assets/scratchedintobeing.webp'],
    ['assets/projects/scratched-into-being/scratchedintobeing.gif', 'assets/scratchedintobeing.gif'],
    ['assets/projects/scratched-into-being/sib(drag).png', 'assets/sib(drag).png'],
    ['assets/projects/scratched-into-being/sib(drag2).png', 'assets/sib(drag2).png'],
    ['assets/projects/scratched-into-being/sib(drag3).png', 'assets/sib(drag3).png']
  ]);

  const normalizeAssetPath = (url) => {
    try {
      return new URL(url, window.location.href).pathname.replace(/^\/+/, '');
    } catch (_) {
      return url.replace(/^\/+/, '');
    }
  };

  document.querySelectorAll('img').forEach((img) => {
    const tryFallback = () => {
      if (img.dataset.fallbackTried) return;
      const fallback = assetFallbacks.get(normalizeAssetPath(img.getAttribute('src') || ''));
      if (!fallback) return;
      img.dataset.fallbackTried = 'true';
      img.src = fallback;
    };

    img.addEventListener('error', tryFallback);
    if (img.complete && img.naturalWidth === 0) tryFallback();
  });

  document.querySelectorAll('video').forEach((video) => {
    video.controls = false;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.play().catch(() => {});
  });

  // smooth scroll on all internal nav links
  document.querySelectorAll('.project-nav a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', id);
    });
  });

  // active project indicator on project-nav links
  const projects = document.querySelectorAll('.project');
  const projectNavLinks = document.querySelectorAll('.project-nav a[href^="#"]');

  const setActive = (id) => {
    projectNavLinks.forEach((a) => {
      if (a.getAttribute('href') === `#${id}`) a.classList.add('active');
      else a.classList.remove('active');
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      // pick the entry with the greatest intersection ratio
      let best = null;
      for (const entry of entries) {
        if (entry.isIntersecting) {
          if (!best || entry.intersectionRatio > best.intersectionRatio) best = entry;
        }
      }
      if (best) setActive(best.target.id);
    },
    { rootMargin: '-30% 0px -60% 0px', threshold: [0.1, 0.25, 0.5] }
  );

  projects.forEach((p) => observer.observe(p));

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
