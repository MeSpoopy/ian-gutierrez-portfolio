// Public Cloudflare beacon identifier; this is not an account/API credential.
// Only measure the published portfolio. Local previews and admin are excluded.
(() => {
  const { hostname, pathname } = window.location;
  if (hostname !== 'mespoopy.github.io' ||
      !pathname.startsWith('/ian-gutierrez-portfolio/') ||
      pathname.endsWith('/admin.html')) return;
  if (document.querySelector('script[data-cf-beacon]')) return;
  const beacon = document.createElement('script');
  beacon.type = 'module';
  beacon.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  beacon.setAttribute('data-cf-beacon', JSON.stringify({token: '4a43e3c03769416cafe2ea0fb40d5864'}));
  document.body.appendChild(beacon);
})();
