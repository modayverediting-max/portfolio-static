/* ========================================
   Light / dark theme
   Follows the visitor's phone or computer until they press the moon / sun
   button; that choice is remembered. Loaded in <head> (not deferred) so the
   page paints in the right colours from the first frame.
   ======================================== */
(function () {
  var KEY = 'modayver-theme';
  var root = document.documentElement;

  function saved() {
    try {
      var v = localStorage.getItem(KEY);
      return v === 'dark' || v === 'light' ? v : null;
    } catch (e) { return null; }
  }
  function system() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function apply(theme) {
    root.setAttribute('data-theme', theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0A1830' : '#3D7EE0');
  }

  apply(saved() || system());

  // The device switches between light and dark (e.g. at night): follow it,
  // unless the visitor picked a theme on the site
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var follow = function () { if (!saved()) apply(system()); };
    if (mq.addEventListener) mq.addEventListener('change', follow);
    else if (mq.addListener) mq.addListener(follow);
  }

  // The moon / sun button: a soft cross-fade between the two looks
  window.toggleTheme = function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(KEY, next); } catch (e) {}
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (document.startViewTransition && !reduce) {
      root.classList.add('theme-switching');
      var vt = document.startViewTransition(function () { apply(next); });
      vt.finished.then(function () { root.classList.remove('theme-switching'); }, function () { root.classList.remove('theme-switching'); });
    } else {
      apply(next);
    }
  };
})();
