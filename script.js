const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

// Content is visible immediately; optional dialog feedback respects reduced motion.
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const activeMotion = new Map();
function playMotion(element, frames, options = {}) {
  if (motionPreference.matches || typeof element.animate !== 'function') return;
  const animation = element.animate(frames, {
    duration: 650, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards', ...options
  });
  activeMotion.set(animation, element);
  const forget = () => activeMotion.delete(animation);
  animation.addEventListener('finish', forget, { once: true });
  animation.addEventListener('cancel', forget, { once: true });
  return animation;
}
function cancelMotionWithin(target) {
  activeMotion.forEach((element, animation) => {
    if (!target || element === target || element.contains(target) || target.contains(element)) animation.cancel();
  });
}
document.addEventListener('focusin', event => cancelMotionWithin(event.target));
document.addEventListener('visibilitychange', () => {
  if (document.hidden) cancelMotionWithin();
});

// A lightweight reading indicator follows native scrolling, including disclosure changes.
const header = document.querySelector('.site-header');
if (header) {
  const progress = document.createElement('span');
  progress.className = 'reading-progress';
  progress.setAttribute('aria-hidden', 'true');
  header.append(progress);
  let progressFrame = 0;
  const updateProgress = () => {
    progressFrame = 0;
    const distance = document.documentElement.scrollHeight - window.innerHeight;
    const value = distance > 0 ? Math.max(0, Math.min(1, window.scrollY / distance)) : 0;
    progress.style.setProperty('--reading-progress', value);
  };
  const scheduleProgress = () => {
    if (!progressFrame) progressFrame = requestAnimationFrame(updateProgress);
  };
  window.addEventListener('scroll', scheduleProgress, { passive: true });
  window.addEventListener('resize', scheduleProgress, { passive: true });
  document.addEventListener('toggle', scheduleProgress, true);
  if ('ResizeObserver' in window) new ResizeObserver(scheduleProgress).observe(document.body);
  scheduleProgress();
}

// Pointer motion stays on the artwork; touch and reduced-motion visitors get a static hero.
const heroVisual = document.querySelector('.hero-visual');
if (heroVisual) {
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  let pointerFrame = 0;
  let bounds;
  let pointerX = 0;
  let pointerY = 0;
  function resetHero() {
    cancelAnimationFrame(pointerFrame);
    pointerFrame = 0;
    bounds = null;
    ['--hero-rx','--hero-ry','--hero-x','--hero-y'].forEach(name => heroVisual.style.removeProperty(name));
  }
  heroVisual.addEventListener('pointermove', event => {
    if (!finePointer.matches || motionPreference.matches || event.pointerType !== 'mouse') return;
    bounds ||= heroVisual.getBoundingClientRect();
    pointerX = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - .5) * 2));
    pointerY = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - .5) * 2));
    if (pointerFrame) return;
    pointerFrame = requestAnimationFrame(() => {
      pointerFrame = 0;
      heroVisual.style.setProperty('--hero-rx', (-pointerY * 3).toFixed(2) + 'deg');
      heroVisual.style.setProperty('--hero-ry', (pointerX * 3).toFixed(2) + 'deg');
      heroVisual.style.setProperty('--hero-x', (pointerX * 9).toFixed(2) + 'px');
      heroVisual.style.setProperty('--hero-y', (pointerY * 9).toFixed(2) + 'px');
    });
  });
  heroVisual.addEventListener('pointerleave', resetHero);
  window.addEventListener('blur', resetHero);
  window.addEventListener('scroll', resetHero, { passive: true });
  window.addEventListener('resize', resetHero, { passive: true });
  finePointer.addEventListener('change', resetHero);
  motionPreference.addEventListener('change', resetHero);
  document.addEventListener('visibilitychange', () => { if (document.hidden) resetHero(); });
}

// Keep the compact homepage navigation oriented to the section being read.
const primaryLinks = [...document.querySelectorAll('.portfolio-header nav a[href^="#"]')];
if (primaryLinks.length && 'IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const section = entry.target.id === 'background' ? 'about' : entry.target.id;
      primaryLinks.forEach(link => {
        if (link.hash === '#' + section) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-15% 0px -60% 0px', threshold: 0 });
  document.querySelectorAll('main > section[id]').forEach(section => sectionObserver.observe(section));
}

const previewLinks = document.querySelectorAll('a[data-preview]');
if (previewLinks.length && typeof HTMLDialogElement !== 'undefined') {
  const dialog = document.createElement('dialog');
  dialog.className = 'image-viewer';
  dialog.setAttribute('aria-labelledby', 'viewer-title');
  dialog.setAttribute('aria-describedby', 'viewer-meta');
  dialog.innerHTML = '<div class="viewer-head"><div><h2 id="viewer-title"></h2><p id="viewer-meta"></p></div><button type="button" class="viewer-close" aria-label="Close image preview">Close <span aria-hidden="true">×</span></button></div><div class="viewer-toolbar"><button type="button" class="viewer-zoom" aria-pressed="false">Zoom in</button><a class="viewer-original" target="_blank" rel="noopener noreferrer">Open original ↗</a><span class="viewer-help">Escape or Close to return</span></div><div class="viewer-stage" tabindex="0" aria-label="Image preview. Scroll to explore when zoomed."><div class="viewer-frame"><img alt=""></div></div><p class="viewer-status" role="status"></p>';
  document.body.append(dialog);
  const title = dialog.querySelector('#viewer-title');
  const meta = dialog.querySelector('#viewer-meta');
  const close = dialog.querySelector('.viewer-close');
  const zoom = dialog.querySelector('.viewer-zoom');
  const help = dialog.querySelector('.viewer-help');
  const original = dialog.querySelector('.viewer-original');
  const stage = dialog.querySelector('.viewer-stage');
  const frame = dialog.querySelector('.viewer-frame');
  const img = dialog.querySelector('img');
  const status = dialog.querySelector('.viewer-status');
  let opener;
  let zoomed = false;
  let crop = null;

  function applyFrame() {
    if (!img.naturalWidth) return;
    const [x,y,w,h] = crop || [0,0,img.naturalWidth,img.naturalHeight];
    frame.style.aspectRatio = w + ' / ' + h;
    frame.style.width = zoomed ? Math.max(w, stage.clientWidth * 2) + 'px' : '100%';
    img.style.width = (img.naturalWidth / w * 100) + '%';
    img.style.marginLeft = (-x / w * 100) + '%';
    img.style.marginTop = (-y / w * 100) + '%';
    stage.scrollTop = 0;
    stage.scrollLeft = 0;
  }
  img.addEventListener('load', () => {
    status.textContent = '';
    frame.hidden = false;
    zoom.disabled = false;
    applyFrame();
  });
  img.addEventListener('error', () => {
    frame.hidden = true;
    zoom.disabled = true;
    status.textContent = 'This image could not be loaded. Close the preview and try again.';
  });
  previewLinks.forEach(link => link.addEventListener('click', event => {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    opener = link;
    zoomed = false;
    crop = link.dataset.previewCrop ? link.dataset.previewCrop.split(',').map(Number) : null;
    title.textContent = link.dataset.previewTitle || 'Image preview';
    meta.textContent = link.dataset.previewMeta || '';
    img.alt = link.querySelector('img')?.alt || title.textContent;
    original.href = link.href;
    zoom.textContent = 'Zoom in';
    zoom.setAttribute('aria-pressed', 'false');
    zoom.disabled = true;
    help.textContent = 'Escape or Close to return';
    status.textContent = 'Loading image…';
    frame.hidden = true;
    dialog.showModal();
    img.src = link.href;
    document.body.classList.add('viewer-open');
    close.focus();
    playMotion(dialog, [
      { opacity: 0, translate: '0 12px', scale: '.98' },
      { opacity: 1, translate: '0 0', scale: '1' }
    ], { duration: 220 });
  }));
  zoom.addEventListener('click', () => {
    zoomed = !zoomed;
    zoom.textContent = zoomed ? 'Fit image' : 'Zoom in';
    zoom.setAttribute('aria-pressed', String(zoomed));
    help.textContent = zoomed ? 'Scroll to explore the image' : 'Escape or Close to return';
    applyFrame();
  });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    cancelMotionWithin(dialog);
    document.body.classList.remove('viewer-open');
    if (opener && opener.isConnected) opener.focus({preventScroll:true});
  });
}

// Progressive enhancement: the visible email links remain usable without JavaScript.
document.querySelectorAll('[data-copy-email]').forEach(button => {
  button.hidden = false;
  button.addEventListener('click', async () => {
    const status = button.parentElement.querySelector('.copy-status');
    try {
      if (!navigator.clipboard || !window.isSecureContext) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText('ianvan.gutierrez@gmail.com');
      status.textContent = 'Email address copied.';
    } catch {
      status.textContent = 'Select and copy the email address shown above.';
    }
  });
});
