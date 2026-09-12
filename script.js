const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

// Content stays visible without JavaScript. Each entrance runs once, before reading.
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
if ('IntersectionObserver' in window && typeof Element.prototype.animate === 'function' && !motionPreference.matches) {
  const activeEntrances = new Set();
  const entranceObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entranceObserver.unobserve(entry.target);
      if (motionPreference.matches) return;
      const animation = entry.target.animate([
        { opacity: 0.35, transform: 'translateY(14px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], { duration: 550, easing: 'cubic-bezier(.2,.7,.2,1)' });
      activeEntrances.add(animation);
      animation.onfinish = () => activeEntrances.delete(animation);
      animation.oncancel = () => activeEntrances.delete(animation);
    });
  }, { rootMargin: '0px 0px 60px 0px', threshold: 0.01 });
  document.querySelectorAll('.section-heading,.project-card,.approach-card,.case-facts,.case-narrative section').forEach(element => {
    if (element.getBoundingClientRect().top > window.innerHeight) entranceObserver.observe(element);
  });
  motionPreference.addEventListener('change', event => {
    if (!event.matches) return;
    entranceObserver.disconnect();
    activeEntrances.forEach(animation => animation.cancel());
    activeEntrances.clear();
  });
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
