(() => {
  'use strict';
  const section = document.querySelector('#carousel');
  const stage = section.querySelector('.carousel-sticky');
  const viewport = section.querySelector('.carousel-window');
  const track = section.querySelector('.carousel-track');
  const slides = [...section.querySelectorAll('.carousel-slide')];
  const dots = [...section.querySelectorAll('.carousel-dots button')];
  const screenDots = [...section.querySelectorAll('.carousel-screen-dots i')];
  const previous = section.querySelector('#carousel-prev');
  const next = section.querySelector('#carousel-next');
  const reduced = () => document.body.classList.contains('reduced');
  const clamp = v => Math.max(0, Math.min(1, v));
  let active = -1, top = 0, distance = 1, pending = false;

  function paint(position) {
    track.style.transform = `translate3d(${-position * 100}%,0,0)`;
    const current = Math.round(position);
    if (current === active) return;
    active = current;
    section.querySelector('#carousel-position').textContent = `${String(active + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    section.querySelector('.carousel-phone-count').textContent = `${active + 1}/${slides.length}`;
    dots.forEach((dot, i) => dot.setAttribute('aria-pressed', String(i === active)));
    screenDots.forEach((dot, i) => dot.classList.toggle('active', i === active));
    slides.forEach((slide, i) => slide.setAttribute('aria-hidden', String(i !== active)));
    previous.disabled = active === 0;
    next.disabled = active === slides.length - 1;
  }

  function render() {
    pending = false;
    if (reduced()) return;
    const progress = clamp((scrollY - top) / distance);
    const raw = clamp((progress - .08) / .84) * (slides.length - 1);
    const whole = Math.floor(raw);
    // Each slide rests briefly, then moves as a physical swipe within the screen.
    const t = clamp((raw - whole - .16) / .68);
    paint(whole + t * t * (3 - 2 * t));
  }

  function schedule() {
    if (!pending) { pending = true; requestAnimationFrame(render); }
  }

  function measure() {
    const inset = parseFloat(getComputedStyle(stage).top) || 0;
    top = section.getBoundingClientRect().top + scrollY - inset;
    distance = Math.max(1, section.offsetHeight - stage.offsetHeight);
    schedule();
  }

  function choose(index) {
    const target = Math.max(0, Math.min(slides.length - 1, index));
    if (reduced()) { paint(target); return; }
    measure();
    window.scrollTo({top: top + distance * (.08 + .84 * target / (slides.length - 1)), behavior: 'smooth'});
  }

  dots.forEach((dot, i) => dot.addEventListener('click', () => choose(i)));
  previous.addEventListener('click', () => choose(active - 1));
  next.addEventListener('click', () => choose(active + 1));
  viewport.addEventListener('keydown', event => {
    const keys = {ArrowRight: active + 1, ArrowLeft: active - 1, Home: 0, End: slides.length - 1};
    if (!(event.key in keys)) return;
    event.preventDefault();
    choose(keys[event.key]);
  });
  let touch = null;
  viewport.addEventListener('touchstart', event => {
    const point = event.touches[0]; touch = {x: point.clientX, y: point.clientY};
  }, {passive: true});
  viewport.addEventListener('touchend', event => {
    if (!touch) return;
    const point = event.changedTouches[0];
    const dx = point.clientX - touch.x, dy = point.clientY - touch.y;
    if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy) * 1.4) choose(active + (dx < 0 ? 1 : -1));
    touch = null;
  }, {passive: true});
  viewport.addEventListener('touchcancel', () => { touch = null; }, {passive: true});
  window.addEventListener('scroll', schedule, {passive: true});
  window.addEventListener('resize', measure, {passive: true});
  window.addEventListener('load', measure);
  window.addEventListener('bagin-motion-change', () => { paint(Math.max(0, active)); measure(); });
  new ResizeObserver(measure).observe(document.body);
  document.fonts.ready.then(measure);
  paint(0); measure();
})();
