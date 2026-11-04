/* ========================================
   Folded paper on scroll (trial, 2026-11-04)
   A block swings open on its top edge as it rises in from the bottom of
   the screen, and folds shut on its bottom edge as it leaves through the
   top, scrolling down or up. The fold follows the scroll itself, not a timer.
   Only the blocks around the content move (section headers, video rows,
   card grids), so every card keeps its own reveal and hover.
   To take it out: delete the fold.js line at the end of home.html.
   ======================================== */
(function() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var FOLD_BLOCKS = [
    '#hero .text-center',
    '.section-header',
    '.grid-2', '.grid-3', '.grid-4',
    '.flex-center.gap-sm',
    '.about-grid',
    '.hero-stats',
    '#portfolio .container > .text-center',
    '.gradient-cta .text-center'
  ].join(', ');
  var OPEN_ZONE = 0.32;   // part of the screen height a block takes to open from the bottom
  var SHUT_ZONE = 0.22;   // and to fold shut at the top
  var blocks = [], spans = [], queued = false;

  function clamp01(n) { return n < 0 ? 0 : n > 1 ? 1 : n; }

  function collect() {
    var all = Array.prototype.slice.call(document.querySelectorAll(FOLD_BLOCKS));
    // a block inside another block folds with it
    blocks = all.filter(function(el) {
      return !all.some(function(other) { return other !== el && other.contains(el); });
    });
  }

  // Page positions, measured on layout changes only. Layout positions ignore
  // transforms, so the fold never feeds back into itself.
  function measure() {
    spans = blocks.map(function(el) {
      var top = 0;
      for (var n = el; n; n = n.offsetParent) top += n.offsetTop;
      return [top, top + el.offsetHeight];
    });
  }

  function fold() {
    queued = false;
    var h = window.innerHeight, y = window.scrollY;
    blocks.forEach(function(el, i) {
      var top = spans[i][0] - y, bottom = spans[i][1] - y;
      var opening = clamp01((h - top) / (h * OPEN_ZONE));
      var shutting = clamp01(bottom / (h * SHUT_ZONE));
      var p = Math.min(opening, shutting);
      var e = p * p * (3 - 2 * p);
      var entering = opening <= shutting;
      var t = e > 0.999 ? '' :
        'perspective(1100px) rotateX(' + ((entering ? -64 : 56) * (1 - e)).toFixed(2) + 'deg) scale(' + (0.9 + 0.1 * e).toFixed(3) + ')';
      if (t === el._fold) return;
      el._fold = t;
      el.style.willChange = t ? 'transform' : '';
      el.style.transformOrigin = t ? (entering ? '50% 0' : '50% 100%') : '';
      el.style.transform = t;
      el.style.opacity = t ? (0.12 + 0.88 * e).toFixed(3) : '';
    });
  }

  function queueFold() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(fold);
  }

  function remeasure() {
    measure();
    queueFold();
  }

  function start() {
    collect();
    if (!blocks.length) return;
    measure();
    fold();
    window.addEventListener('scroll', queueFold, { passive: true });
    window.addEventListener('resize', remeasure);
    window.addEventListener('load', remeasure);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(remeasure);
    // text and image sizes change with the language switch and late images
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(remeasure);
      ro.observe(document.body);
      blocks.forEach(function(el) { ro.observe(el); });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
