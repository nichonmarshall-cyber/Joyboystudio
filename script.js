const year = document.querySelector('[data-year]');
if (year) year.textContent = String(new Date().getFullYear());

const header = document.querySelector('#site-header');
const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 40);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const revealItems = document.querySelectorAll('.reveal');
if (reducedMotion.matches || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('visible'));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  revealItems.forEach((item) => observer.observe(item));
}

const depthLayers = [...document.querySelectorAll('[data-depth]')];
let frameRequested = false;
const updateDepth = () => {
  frameRequested = false;
  if (reducedMotion.matches) return;
  const viewportHeight = window.innerHeight;
  depthLayers.forEach((layer) => {
    const section = layer.closest('section');
    const bounds = section?.getBoundingClientRect();
    if (!bounds || bounds.bottom < -150 || bounds.top > viewportHeight + 150) return;
    const depth = Number(layer.dataset.depth || 0);
    const movement = Math.max(-120, Math.min(120, -bounds.top * depth));
    layer.style.transform = `translate3d(0, ${movement.toFixed(1)}px, 0)`;
  });
};
const requestDepthUpdate = () => {
  if (frameRequested || reducedMotion.matches) return;
  frameRequested = true;
  requestAnimationFrame(updateDepth);
};
window.addEventListener('scroll', requestDepthUpdate, { passive: true });
window.addEventListener('resize', requestDepthUpdate, { passive: true });
requestDepthUpdate();

const hoursRows = document.querySelectorAll('#hours-list [data-day]');
try {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', weekday: 'short' }).formatToParts(new Date());
  const weekday = parts.find((part) => part.type === 'weekday')?.value;
  const dayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const currentDay = dayMap[weekday];
  hoursRows.forEach((row) => row.classList.toggle('today', Number(row.dataset.day) === currentDay));
} catch (_) {
  // Hours remain readable if timezone formatting is unavailable.
}
