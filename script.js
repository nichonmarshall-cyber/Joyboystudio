const year = document.querySelector('[data-year]');
if (year) year.textContent = String(new Date().getFullYear());

const header = document.querySelector('#site-header');
const setHeaderState = () => header?.classList.toggle('scrolled', window.scrollY > 32);
setHeaderState();
window.addEventListener('scroll', setHeaderState, { passive: true });

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

const gallery = document.querySelector('[data-gallery]');
const previousButton = document.querySelector('[data-gallery-prev]');
const nextButton = document.querySelector('[data-gallery-next]');
let galleryTimer;

const galleryStep = () => {
  const card = gallery?.querySelector('.gallery-card');
  if (!gallery || !card) return 0;
  const gap = Number.parseFloat(getComputedStyle(gallery).gap) || 0;
  return card.getBoundingClientRect().width + gap;
};

const moveGallery = (direction) => {
  if (!gallery) return;
  const step = galleryStep();
  const atEnd = gallery.scrollLeft + gallery.clientWidth >= gallery.scrollWidth - step * 0.5;
  const atStart = gallery.scrollLeft <= step * 0.25;
  if (direction > 0 && atEnd) gallery.scrollTo({ left: 0, behavior: 'smooth' });
  else if (direction < 0 && atStart) gallery.scrollTo({ left: gallery.scrollWidth, behavior: 'smooth' });
  else gallery.scrollBy({ left: step * direction, behavior: 'smooth' });
};

previousButton?.addEventListener('click', () => moveGallery(-1));
nextButton?.addEventListener('click', () => moveGallery(1));
gallery?.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') moveGallery(-1);
  if (event.key === 'ArrowRight') moveGallery(1);
});

const stopGallery = () => window.clearInterval(galleryTimer);
const startGallery = () => {
  stopGallery();
  if (!gallery || reducedMotion.matches) return;
  galleryTimer = window.setInterval(() => moveGallery(1), 4500);
};
gallery?.addEventListener('pointerenter', stopGallery);
gallery?.addEventListener('pointerleave', startGallery);
gallery?.addEventListener('focusin', stopGallery);
gallery?.addEventListener('focusout', startGallery);
document.addEventListener('visibilitychange', () => document.hidden ? stopGallery() : startGallery());
startGallery();

const depthLayers = [...document.querySelectorAll('[data-depth]')];
let frameRequested = false;
const updateDepth = () => {
  frameRequested = false;
  if (reducedMotion.matches) return;
  depthLayers.forEach((layer) => {
    const section = layer.closest('section');
    const bounds = section?.getBoundingClientRect();
    if (!bounds || bounds.bottom < -150 || bounds.top > window.innerHeight + 150) return;
    const depth = Number(layer.dataset.depth || 0);
    const movement = Math.max(-90, Math.min(90, -bounds.top * depth));
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

try {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', weekday: 'short' }).formatToParts(new Date());
  const weekday = parts.find((part) => part.type === 'weekday')?.value;
  const dayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const currentDay = dayMap[weekday];
  document.querySelectorAll('#hours-list [data-day]').forEach((row) => {
    row.classList.toggle('today', Number(row.dataset.day) === currentDay);
  });
} catch (_) {
  // Hours remain readable if timezone formatting is unavailable.
}
