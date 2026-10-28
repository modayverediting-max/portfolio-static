/* ========================================
   Language Switch (AR / EN)
   Arabic lives in the HTML. English lives in translations.js.
   Mark text with data-i18n="key", attributes with
   data-i18n-attr="alt:key;placeholder:key".
   ======================================== */
var LANG_KEY = 'modayver-lang';

function getSavedLang() {
  try {
    // ?lang=… wins; the English home page (en.html, served at /en) says so itself
    var fromUrl = new URLSearchParams(window.location.search).get('lang') ||
                  document.documentElement.getAttribute('data-force-lang');
    if (fromUrl === 'ar' || fromUrl === 'en') {
      localStorage.setItem(LANG_KEY, fromUrl);
      return fromUrl;
    }
    return localStorage.getItem(LANG_KEY) === 'en' ? 'en' : 'ar';
  } catch (e) {
    return 'ar';
  }
}

// Keeps the address bar shareable (no reload, no extra history entry):
// the home page is modayver.com/en in English and modayver.com in Arabic;
// other pages add ?lang=en in English and keep the clean address in Arabic.
function isHomePage() {
  var path = window.location.pathname;
  return /\/$/.test(path) || /\/(index|en)(\.html)?$/.test(path);
}

function syncLangUrl(lang) {
  try {
    var url = new URL(window.location.href);
    url.searchParams.delete('lang');
    if (isHomePage()) {
      // On the live site GitHub Pages serves en.html at /en; locally use the file name
      var live = /(^|\.)modayver\.com$/.test(url.hostname);
      var home = lang === 'en' ? (live ? '/en' : 'en.html') : (live ? '/' : 'index.html');
      url.pathname = new URL(home, url).pathname;
    } else if (lang === 'en') {
      url.searchParams.set('lang', 'en');
    }
    if (url.href !== window.location.href) {
      history.replaceState(history.state, '', url.href);
    }
  } catch (e) {}
}

function applyLang(lang) {
  var en = window.TRANSLATIONS_EN || {};
  var html = document.documentElement;
  html.lang = lang;
  html.dir = lang === 'en' ? 'ltr' : 'rtl';
  syncLangUrl(lang);

  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    var key = el.getAttribute('data-i18n');
    if (el._arHTML === undefined) el._arHTML = el.innerHTML;
    if (lang === 'en' && en[key] !== undefined) {
      el.innerHTML = en[key];
    } else {
      if (lang === 'en') console.warn('Missing English text for: ' + key);
      el.innerHTML = el._arHTML;
    }
  });

  document.querySelectorAll('[data-i18n-attr]').forEach(function(el) {
    el._arAttrs = el._arAttrs || {};
    el.getAttribute('data-i18n-attr').split(';').forEach(function(pair) {
      var parts = pair.split(':');
      var attr = parts[0].trim();
      var key = parts[1].trim();
      if (!(attr in el._arAttrs)) el._arAttrs[attr] = el.getAttribute(attr);
      if (lang === 'en' && en[key] !== undefined) {
        el.setAttribute(attr, en[key]);
      } else {
        el.setAttribute(attr, el._arAttrs[attr]);
      }
    });
  });

  markSwitch(lang);
  html.classList.remove('i18n-pending');
}

// Moves the white pill of the AR / EN switch (style.css reads data-lang-ui)
function markSwitch(lang) {
  document.documentElement.setAttribute('data-lang-ui', lang);
  document.querySelectorAll('[data-lang-opt]').forEach(function(opt) {
    opt.classList.toggle('active', opt.getAttribute('data-lang-opt') === lang);
  });
}

/* Switching: the header frame and the switch stay still. The page never
   disappears — it only goes softly out of focus while a gentle light rises
   from the switch, the language changes at the peak, then the page comes
   back into focus as the light fades (حركة هادية ← هبوط ناعم). */
var langSwitching = false;

// Same shape as the white flash at a cut: accelerates into the peak, calms out
function playLangLight() {
  var sw = document.querySelector('.lang-switch');
  var light = document.createElement('div');
  light.className = 'lang-light';
  light.setAttribute('aria-hidden', 'true');
  if (sw) {
    var r = sw.getBoundingClientRect();
    light.style.setProperty('--lx', Math.round(r.left + r.width / 2) + 'px');
    light.style.setProperty('--ly', Math.round(r.top + r.height / 2) + 'px');
  }
  document.body.appendChild(light);
  var anim = light.animate([
    { opacity: 0, easing: 'cubic-bezier(1, 0, 0.67, 1)' },
    { opacity: 1, offset: 0.25, easing: 'cubic-bezier(0.33, 0, 0, 1)' },
    { opacity: 0 }
  ], { duration: 880 });
  anim.onfinish = anim.oncancel = function() { light.remove(); };
}

function toggleLang() {
  if (langSwitching) return;
  var next = document.documentElement.lang === 'en' ? 'ar' : 'en';
  try { localStorage.setItem(LANG_KEY, next); } catch (e) {}
  markSwitch(next);

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var parts = Array.prototype.slice.call(document.querySelectorAll(
    'body > section, body > footer, .contact-wrapper, .site-header .desktop-nav, .site-header .header-cta, .mobile-menu-inner'
  ));
  if (reduce || !document.body.animate || parts.length === 0) {
    applyLang(next);
    return;
  }
  langSwitching = true;

  // Keep the visitor's place on the page while the text reflows
  var anchor = null;
  parts.some(function(el) {
    if (el.closest('.site-header')) return false;
    if (el.getBoundingClientRect().bottom > 80) { anchor = el; return true; }
    return false;
  });
  var anchorTop = anchor ? anchor.getBoundingClientRect().top : 0;

  playLangLight();
  var fadeOut = parts.map(function(el) {
    return el.animate([
      { opacity: 1, filter: 'blur(0px)' },
      { opacity: 0.85, filter: 'blur(6px)' }
    ], { duration: 220, easing: 'cubic-bezier(0.33, 0, 0, 1)', fill: 'forwards' });
  });

  Promise.all(fadeOut.map(function(a) { return a.finished; })).then(function() {
    applyLang(next);
    if (anchor) window.scrollBy({ top: anchor.getBoundingClientRect().top - anchorTop, behavior: 'instant' });

    var fadeIn = parts.map(function(el) {
      return el.animate([
        { opacity: 0.85, filter: 'blur(6px)' },
        { opacity: 1, filter: 'blur(0px)' }
      ], { duration: 650, easing: 'cubic-bezier(0.05, 0, 0, 1)' });
    });
    fadeOut.forEach(function(a) { a.cancel(); });
    return Promise.all(fadeIn.map(function(a) { return a.finished; }));
  }).catch(function() {}).then(function() {
    // Safety net: never leave the page hidden or half-switched
    fadeOut.forEach(function(a) { a.cancel(); });
    if (document.documentElement.lang !== next) applyLang(next);
    langSwitching = false;
  });
}

applyLang(getSavedLang());
