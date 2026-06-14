/* =========================================================
   cursor.js — custom ladybug cursor
   hides native cursor on non-touch devices. state swaps on hover.
   ========================================================= */

(() => {
  const isCoarse = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  if (isCoarse) return;

  const cursor = document.getElementById('cursor');
  if (!cursor) return;

  const cursorMessage = document.createElement('span');
  cursorMessage.className = 'cursor-message';
  cursor.appendChild(cursorMessage);

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let x = targetX;
  let y = targetY;

  const getClockMessage = () => {
    const hour = Number(new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      hour: '2-digit',
      hourCycle: 'h23'
    }).format(new Date()));

    if (hour >= 5 && hour < 12) return 'good mornin, sleepyhead!';
    if (hour >= 12 && hour < 17) return 'like what you see? keep snooping';
    if (hour >= 17 && hour < 22) return 'evening looks good on you';
    return 'stalking? follow @artoflah while you’re here';
  };

  // follow mouse with a tiny lag so it feels physical
  document.addEventListener('pointermove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    cursor.style.opacity = '1';
    cursor.classList.toggle('near-right-edge', targetX > window.innerWidth - 260);
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
    cursor.classList.remove('state-grab', 'state-grabbing', 'state-play', 'state-clock');
    if (state) cursor.classList.add(`state-${state}`);
    if (state === 'clock') cursorMessage.textContent = getClockMessage();
  };

  // hover states via delegation
  document.addEventListener('pointerover', (e) => {
    const target = e.target;
    if (!(target instanceof Element)) return;

    if (target.closest('.home-clock')) {
      setState('clock');
    } else if (target.closest('.satellite, .draggable-art')) {
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
    if (target instanceof Element && target.closest('.satellite, .draggable-art')) {
      setState('grabbing');
    }
  });
  document.addEventListener('pointerup', () => {
    // revert to whatever we should be showing
    const hovered = document.elementFromPoint(targetX, targetY);
    if (hovered && hovered.closest('.home-clock')) setState('clock');
    else if (hovered && hovered.closest('.satellite, .draggable-art')) setState('grab');
    else if (hovered && hovered.closest('.gif-hero, .satellite-motion')) setState('play');
    else setState(null);
  });

  // hide when leaving window
  document.addEventListener('pointerleave', () => cursor.style.opacity = '0');
  document.addEventListener('pointerenter', () => cursor.style.opacity = '1');
})();
