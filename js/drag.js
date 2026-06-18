/* =========================================================
   drag.js — draggable satellite objects
   hand-rolled. no libraries. pointer events for mouse + touch.
   ========================================================= */

(() => {
  const isMobileLayout = window.matchMedia('(max-width: 767px), (hover: none), (pointer: coarse)').matches;
  if (isMobileLayout) return;

  const draggableItems = document.querySelectorAll('.satellite');

  draggableItems.forEach((el) => {
    // state per element
    let startX = 0, startY = 0;
    let baseX = 0, baseY = 0;
    let currentX = 0, currentY = 0;
    let isDragging = false;
    const computedTransform = window.getComputedStyle(el).transform;
    const baseTransform = computedTransform && computedTransform !== 'none' ? computedTransform : '';
    const initialX = Number(el.dataset.dragX || 0);
    const initialY = Number(el.dataset.dragY || 0);

    if (initialX || initialY) {
      el.style.transform = `translate3d(${initialX}px, ${initialY}px, 0) ${baseTransform} scale(1)`;
    }
    const onPointerDown = (e) => {
      if (e.button !== undefined && e.button !== 0) return; // left click only
      e.preventDefault();

      startX = e.clientX;
      startY = e.clientY;
      baseX = Number(el.dataset.dragX || 0);
      baseY = Number(el.dataset.dragY || 0);
      currentX = baseX;
      currentY = baseY;

      el.classList.add('is-dragging');
      el.setPointerCapture(e.pointerId);
      isDragging = true;

      requestAnimationFrame(() => {
        el.style.transform = `translate3d(${baseX}px, ${baseY}px, 0) ${baseTransform} scale(1.04)`;
      });
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      currentX = baseX + dx;
      currentY = baseY + dy;

      el.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) ${baseTransform} scale(1.04)`;
    };

    const onPointerUp = (e) => {
      if (!isDragging) return;
      isDragging = false;

      el.classList.remove('is-dragging');
      el.dataset.dragX = String(currentX);
      el.dataset.dragY = String(currentY);

      el.style.transition = 'none';
      el.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) ${baseTransform} scale(1.04)`;

      requestAnimationFrame(() => {
        el.style.transition = '';
        el.classList.add('is-lifted');
        el.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) ${baseTransform} scale(1)`;
        setTimeout(() => el.classList.remove('is-lifted'), 300);
      });

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
