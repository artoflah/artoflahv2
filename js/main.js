/* =========================================================
   main.js — entry point
   wires up toc active state (intersection observer) + smooth scroll
   ========================================================= */

(() => {
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
