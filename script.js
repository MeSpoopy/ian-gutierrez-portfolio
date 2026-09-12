const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

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
