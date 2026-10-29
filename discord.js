/* ========================================
   Discord buttons (contact page, About section, footer)
   Phones open the app from the normal link. On a computer, any link with
   data-discord="<user id>" opens a small glass menu under it: the desktop
   app (discord:// link) or the browser. After "open in the app" the menu
   says what is happening, and points to the browser if the app never opens.
   ======================================== */
(function() {
  var ua = navigator.userAgent;
  var phone = /Android|iPhone|iPad|iPod|Mobile/i.test(ua) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(ua));
  if (phone) return;

  // Arabic lives here; English comes from translations.js (contact.dc_*)
  var AR = {
    app: 'فتح في تطبيق ديسكورد',
    web: 'فتح في المتصفح',
    opening: 'جاري فتح تطبيق ديسكورد…',
    failed: 'ما انفتح التطبيق؟ لازم يكون تطبيق ديسكورد مثبّت على جهازك، أو افتح الحساب في المتصفح.'
  };
  function text(key) {
    if (document.documentElement.lang === 'en') {
      var en = (window.TRANSLATIONS_EN || {})['contact.dc_' + key];
      if (en) return en;
    }
    return AR[key];
  }

  var ICON_APP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>';
  var ICON_WEB = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';

  var menu, appLink, webLink, status, current = null, watch = null;

  function build() {
    menu = document.createElement('div');
    menu.className = 'dc-menu';
    menu.setAttribute('role', 'menu');
    menu.hidden = true;
    menu.innerHTML =
      '<a class="dc-option dc-option-app" role="menuitem">' + ICON_APP + '<span></span></a>' +
      '<a class="dc-option" role="menuitem" target="_blank" rel="noopener noreferrer">' + ICON_WEB + '<span></span></a>' +
      '<p class="dc-status" role="status" aria-live="polite" hidden></p>';
    document.body.appendChild(menu);
    appLink = menu.children[0];
    webLink = menu.children[1];
    status = menu.children[2];

    menu.addEventListener('click', function(e) {
      var link = e.target.closest('a');
      if (!link) return;
      if (link !== appLink) { setTimeout(close, 0); return; }
      // The link itself asks the browser to open the app. When the app (or the browser's
      // "Open Discord?" prompt) takes focus, the page loses it: then the menu can close.
      // If nothing takes focus within 2.5s, the app isn't there: point to the browser option.
      reset();
      menu.classList.add('is-waiting');
      say('opening');
      var left = false;
      function gone() { left = true; }
      window.addEventListener('blur', gone, { once: true });
      document.addEventListener('visibilitychange', gone, { once: true });
      watch = setTimeout(function() {
        window.removeEventListener('blur', gone);
        document.removeEventListener('visibilitychange', gone);
        menu.classList.remove('is-waiting');
        if (left) { close(); return; }
        menu.classList.add('is-failed');
        say('failed');
      }, 2500);
    });
  }

  function say(key) {
    status.textContent = text(key);
    status.hidden = false;
  }
  function reset() {
    clearTimeout(watch);
    menu.classList.remove('is-waiting', 'is-failed');
    status.hidden = true;
  }
  function place(btn) {
    var r = btn.getBoundingClientRect();
    var w = menu.offsetWidth, h = menu.offsetHeight;
    var left = Math.min(Math.max(12, r.left + r.width / 2 - w / 2), window.innerWidth - w - 12);
    var top = r.bottom + 10;
    if (top + h > window.innerHeight - 12) top = Math.max(12, r.top - h - 10);
    menu.style.left = left + 'px';
    menu.style.top = top + 'px';
  }
  function open(btn) {
    if (!menu) build();
    var id = btn.getAttribute('data-discord');
    appLink.href = 'discord://-/users/' + id;
    webLink.href = 'https://discord.com/users/' + id;
    appLink.lastChild.textContent = text('app');
    webLink.lastChild.textContent = text('web');
    reset();
    menu.hidden = false;
    place(btn);
    current = btn;
    btn.setAttribute('aria-expanded', 'true');
  }
  function close() {
    if (!menu || menu.hidden) return;
    menu.hidden = true;
    reset();
    if (current) current.setAttribute('aria-expanded', 'false');
    current = null;
  }

  document.addEventListener('click', function(e) {
    var btn = e.target.closest('a[data-discord]');
    if (btn) {
      e.preventDefault();
      if (current === btn) close(); else { close(); open(btn); }
      return;
    }
    if (menu && !menu.contains(e.target)) close();
  });
  document.addEventListener('keydown', function(e) { if (e.key === 'Escape') close(); });
  window.addEventListener('resize', close);
  window.addEventListener('scroll', function() {
    if (menu && !menu.classList.contains('is-waiting')) close();
  }, { passive: true });
})();
