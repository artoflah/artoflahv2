/* =========================================================
   main.js — entry point
   wires up toc active state (intersection observer) + smooth scroll
   ========================================================= */

(() => {
  // smooth scroll on toc links
  document.querySelectorAll('.toc a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', id);
    });
  });

  // active project indicator in the toc
  const projects = document.querySelectorAll('.project');
  const tocLinks = document.querySelectorAll('.toc li');

  const setActive = (id) => {
    tocLinks.forEach((li) => {
      const a = li.querySelector('a');
      if (a && a.getAttribute('href') === `#${id}`) li.classList.add('active');
      else li.classList.remove('active');
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
})();
