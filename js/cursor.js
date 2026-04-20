/* =========================================================
   cursor.js — custom ladybug cursor
   hides native cursor on non-touch devices. state swaps on hover.
   ========================================================= */

(() => {
  const isCoarse = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  if (isCoarse) return;

  const cursor = document.getElementById('cursor');
  if (!cursor) return;

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let x = targetX;
  let y = targetY;

  // follow mouse with a tiny lag so it feels physical
  document.addEventListener('pointermove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
  });

  const raf = () => {
    x += (targetX - x) * 0.22;
    y += (targetY - y) * 0.22;
    cursor.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);

  // state swaps based on what's under the cursor
  const setState = (state) => {
    cursor.classList.remove('state-grab', 'state-grabbing', 'state-play');
    if (state) cursor.classList.add(`state-${state}`);
  };

  // hover states via delegation
  document.addEventListener('pointerover', (e) => {
    const target = e.target;
    if (!(target instanceof Element)) return;

    if (target.closest('.satellite')) {
      setState('grab');
    } else if (target.closest('.gif-hero, .satellite-motion')) {
      setState('play');
    } else {
      setState(null);
    }
  });

  // grabbing state while actively dragging
  document.addEventListener('pointerdown', (e) => {
    const target = e.target;
    if (target instanceof Element && target.closest('.satellite')) {
      setState('grabbing');
    }
  });
  document.addEventListener('pointerup', () => {
    // revert to whatever we should be showing
    const hovered = document.elementFromPoint(targetX, targetY);
    if (hovered && hovered.closest('.satellite')) setState('grab');
    else if (hovered && hovered.closest('.gif-hero, .satellite-motion')) setState('play');
    else setState(null);
  });

  // hide when leaving window
  document.addEventListener('pointerleave', () => cursor.style.opacity = '0');
  document.addEventListener('pointerenter', () => cursor.style.opacity = '1');
})();
