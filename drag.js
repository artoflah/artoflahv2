/* =========================================================
   drag.js — draggable satellite objects
   hand-rolled. no libraries. pointer events for mouse + touch.
   ========================================================= */

(() => {
  // skip on touch devices — satellites become a scroll carousel on mobile
  const isCoarse = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  if (isCoarse) return;

  const satellites = document.querySelectorAll('.satellite');

  satellites.forEach((el) => {
    // state per element
    let startX = 0, startY = 0;         // pointer position at pickup
    let elStartX = 0, elStartY = 0;     // element position at pickup (px)
    let currentX = 0, currentY = 0;     // current element position (px, relative to container)
    let rotation = 0;                   // pickup rotation (random on grab)
    let baseRotation = 0;               // element's resting rotation
    let isDragging = false;
    let container = null;

    // read the resting rotation from the css var --r (e.g. "6deg")
    const cssR = el.style.getPropertyValue('--r').trim();
    baseRotation = cssR ? parseFloat(cssR) : 0;

    const onPointerDown = (e) => {
      if (e.button !== undefined && e.button !== 0) return; // left click only
      e.preventDefault();

      container = el.closest('.stage') || el.parentElement;
      const rect = el.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      // convert current position (which may be set via left/top %) to absolute px within container
      elStartX = rect.left - containerRect.left;
      elStartY = rect.top - containerRect.top;
      currentX = elStartX;
      currentY = elStartY;

      startX = e.clientX;
      startY = e.clientY;

      // random rotation on pickup between -6 and +6 deg
      rotation = (Math.random() * 12 - 6);

      // lock element to px coords for dragging
      el.style.left = elStartX + 'px';
      el.style.top = elStartY + 'px';
      el.style.setProperty('--x', 'auto');
      el.style.setProperty('--y', 'auto');

      el.classList.add('is-dragging');
      el.setPointerCapture(e.pointerId);
      isDragging = true;

      // scale up slightly, apply pickup rotation
      el.style.transform = `translate3d(0, 0, 0) rotate(${rotation}deg) scale(1.04)`;
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      // clamp within container bounds
      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const maxX = containerRect.width - elRect.width;
      const maxY = containerRect.height - elRect.height;

      currentX = Math.max(0, Math.min(maxX, elStartX + dx));
      currentY = Math.max(0, Math.min(maxY, elStartY + dy));

      const offsetX = currentX - elStartX;
      const offsetY = currentY - elStartY;

      el.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0) rotate(${rotation}deg) scale(1.04)`;
    };

    const onPointerUp = (e) => {
      if (!isDragging) return;
      isDragging = false;

      // commit position: bake offset into left/top, reset transform, settle
      el.style.left = currentX + 'px';
      el.style.top = currentY + 'px';
      el.classList.remove('is-dragging');
      el.classList.add('is-lifted');

      // settle: keep pickup rotation (feels like it stays where you placed it)
      el.style.transform = `translate3d(0, 0, 0) rotate(${rotation}deg) scale(1)`;

      setTimeout(() => el.classList.remove('is-lifted'), 300);

      try { el.releasePointerCapture(e.pointerId); } catch (_) {}
    };

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointercancel', onPointerUp);

    // prevent native drag of images
    el.addEventListener('dragstart', (e) => e.preventDefault());
  });
})();
