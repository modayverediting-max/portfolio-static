/* ========================================
   Motion helpers — MODAYVER easing
   Curves taken from Khalid's After Effects keyframes (see style.css)
   ======================================== */
var EASE_LAND = 'cubic-bezier(0.05, 0, 0, 1)';  // هبوط ناعم
var EASE_EXIT = 'cubic-bezier(1, 0, 0.63, 1)';  // خروج عنصر
var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

// Same curve as After Effects keyframe influence: Out% on the first key, In% on the next
function aeEase(outInfluence, inInfluence) {
  var x1 = outInfluence;
  var x2 = 1 - inInfluence;
  function bezier(t, a, b) {
    return 3 * a * t * (1 - t) * (1 - t) + 3 * b * t * t * (1 - t) + t * t * t;
  }
  return function(p) {
    if (p <= 0) return 0;
    if (p >= 1) return 1;
    var lo = 0, hi = 1, t = p;
    for (var i = 0; i < 30; i++) {
      t = (lo + hi) / 2;
      if (bezier(t, x1, x2) < p) lo = t; else hi = t;
    }
    return bezier(t, 0, 1);
  };
}

/* ========================================
   Video Modal (works on file:// and http)
   The player grows out of the clicked thumbnail with a short
   blur + flash at the "cut", and shrinks back into it on close.
   ======================================== */
var isLocal = window.location.protocol === 'file:';
var lastVideoSource = null;
var modalClosing = false;

// Remember which thumbnail was clicked (runs before the inline onclick)
document.addEventListener('click', function(e) {
  var source = e.target.closest && e.target.closest('.video-thumbnail, .vfx-card');
  if (source) lastVideoSource = source;
}, true);

function thumbRect() {
  var img = lastVideoSource && lastVideoSource.querySelector('img');
  if (!img) return null;
  var r = img.getBoundingClientRect();
  return (r.width && r.bottom > 0 && r.top < window.innerHeight) ? r : null;
}

// Transform that places a box with rect `box` over rect `target`
function flipTransform(target, box) {
  var dx = (target.left + target.width / 2) - (box.left + box.width / 2);
  var dy = (target.top + target.height / 2) - (box.top + box.height / 2);
  return 'translate(' + dx + 'px, ' + dy + 'px) scale(' + (target.width / box.width) + ', ' + (target.height / box.height) + ')';
}

function openVideo(youtubeId) {
  if (isLocal) {
    window.open('https://www.youtube.com/watch?v=' + youtubeId, '_blank');
    return;
  }
  var modal = document.getElementById('videoModal');
  var content = modal.querySelector('.modal-content');
  var iframe = document.getElementById('modalIframe');
  var poster = document.getElementById('modalPoster');
  var img = lastVideoSource && lastVideoSource.querySelector('img');

  modalClosing = false;
  modal.getAnimations({ subtree: true }).forEach(function(a) { a.cancel(); });

  // The thumbnail stays on screen until YouTube's player is ready
  poster.src = img ? (img.currentSrc || img.src) : 'https://img.youtube.com/vi/' + youtubeId + '/hqdefault.jpg';
  content.classList.remove('video-ready');
  content.classList.add('video-loading');
  iframe.onload = function() {
    if (!iframe.getAttribute('src')) return;
    content.classList.remove('video-loading');
    content.classList.add('video-ready');
  };
  iframe.src = 'https://www.youtube.com/embed/' + youtubeId + '?autoplay=1&rel=0';
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  if (reduceMotion) return;

  var from = thumbRect();
  var to = content.getBoundingClientRect();
  modal.animate([
    { backgroundColor: 'rgba(0,28,64,0)', backdropFilter: 'blur(0px)' },
    { backgroundColor: 'rgba(0,28,64,0.85)', backdropFilter: 'blur(10px)' }
  ], { duration: 600, easing: EASE_LAND });

  content.animate(from ? [
    { transform: flipTransform(from, to), borderRadius: '10px', filter: 'blur(0px) brightness(1)' },
    { offset: 0.3, filter: 'blur(5px) brightness(1.3)' },
    { transform: 'none', borderRadius: '16px', filter: 'blur(0px) brightness(1)' }
  ] : [
    { opacity: 0, transform: 'scale(0.9)', filter: 'blur(14px)' },
    { opacity: 1, transform: 'none', filter: 'blur(0px)' }
  ], { duration: 800, easing: EASE_LAND });

  content.querySelector('.modal-close').animate([
    { opacity: 0, transform: 'scale(0.6) rotate(-90deg)' },
    { opacity: 1, transform: 'none' }
  ], { duration: 600, delay: 350, easing: EASE_LAND, fill: 'backwards' });
}

function closeVideo(e) {
  var modal = document.getElementById('videoModal');
  if (!modal || !modal.classList.contains('active') || modalClosing) return;
  var content = modal.querySelector('.modal-content');
  var iframe = document.getElementById('modalIframe');

  modalClosing = true;
  iframe.onload = null;
  iframe.src = '';  // stops the sound right away; the poster stays visible
  content.classList.remove('video-ready', 'video-loading');

  function finish() {
    modal.getAnimations({ subtree: true }).forEach(function(a) { a.cancel(); });
    modal.classList.remove('active');
    document.body.style.overflow = '';
    modalClosing = false;
  }

  if (reduceMotion) {
    finish();
    return;
  }

  content.getAnimations().forEach(function(a) { a.cancel(); });
  var thumb = thumbRect();
  var box = content.getBoundingClientRect();
  modal.animate([
    { backgroundColor: 'rgba(0,28,64,0.85)', backdropFilter: 'blur(10px)' },
    { backgroundColor: 'rgba(0,28,64,0)', backdropFilter: 'blur(0px)' }
  ], { duration: 450, easing: EASE_EXIT, fill: 'forwards' });

  var shrink = content.animate(thumb ? [
    { transform: 'none', borderRadius: '16px' },
    { transform: flipTransform(thumb, box), borderRadius: '10px' }
  ] : [
    { opacity: 1, transform: 'none', filter: 'blur(0px)' },
    { opacity: 0, transform: 'scale(0.92)', filter: 'blur(10px)' }
  ], { duration: 450, easing: EASE_EXIT, fill: 'forwards' });
  shrink.onfinish = finish;
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeVideo();
  }
});

/* ========================================
   Mobile Menu
   ======================================== */
function toggleMobileMenu() {
  var menu = document.getElementById('mobileMenu');
  var menuIcon = document.querySelector('.menu-icon');
  var closeIcon = document.querySelector('.close-icon');

  menu.classList.toggle('open');

  if (menu.classList.contains('open')) {
    menuIcon.style.display = 'none';
    closeIcon.style.display = 'block';
  } else {
    menuIcon.style.display = 'block';
    closeIcon.style.display = 'none';
  }
}

/* ========================================
   Smooth Scroll to Section
   ======================================== */
function scrollToSection(id) {
  var menu = document.getElementById('mobileMenu');
  if (menu.classList.contains('open')) {
    toggleMobileMenu();
  }

  var el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}

/* ========================================
   Stats Count-Up (400+, 235M+, 4+)
   ======================================== */
function countUp(el) {
  var m = el.textContent.trim().match(/^(\D*)([\d.]+)(.*)$/);
  if (!m || reduceMotion) return;
  var prefix = m[1];
  var target = parseFloat(m[2]);
  var suffix = m[3];
  var decimals = (m[2].split('.')[1] || '').length;
  var ease = aeEase(0.05, 1);
  var duration = 1800;
  var start = null;

  function frame(now) {
    if (start === null) start = now;
    var p = Math.min((now - start) / duration, 1);
    el.textContent = prefix + (target * ease(p)).toFixed(decimals) + suffix;
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* ========================================
   Liquid glass: the glare on the service, channel and stat cards follows the cursor
   ======================================== */
document.querySelectorAll('.service-card, .channel-card, .stat-item').forEach(function(card) {
  card.addEventListener('pointermove', function(e) {
    var r = card.getBoundingClientRect();
    card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
    card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
  });
});

/* ========================================
   Scroll Reveal Animations
   Elements fade in when they enter the screen and fade out when they
   leave, scrolling down or up. They come back from the side the page is
   moving toward (from below when scrolling down, from above when scrolling
   up), and elements that appear together enter one after another.
   ======================================== */
var lastScrollY = window.scrollY;
var scrollingUp = false;
window.addEventListener('scroll', function() {
  scrollingUp = window.scrollY < lastScrollY;
  lastScrollY = window.scrollY;
}, { passive: true });

document.addEventListener('DOMContentLoaded', function() {
  var reveals = document.querySelectorAll('.reveal-box');

  if (reveals.length === 0) return;

  var observer = new IntersectionObserver(function(entries) {
    var shown = [];
    entries.forEach(function(entry) {
      var el = entry.target;
      if (entry.isIntersecting) {
        shown.push(entry);
      } else if (el.classList.contains('revealed')) {
        // Left through the top: wait above, so it comes back down
        clearTimeout(el._revealDoneTimer);
        el.style.setProperty('--reveal-delay', '0ms');
        el.classList.toggle('reveal-from-top', entry.boundingClientRect.top < 0);
        el.classList.remove('revealed', 'reveal-done');
      }
    });

    // Stagger from the edge the page is moving toward
    shown.sort(function(a, b) { return a.boundingClientRect.top - b.boundingClientRect.top; });
    if (scrollingUp) shown.reverse();

    shown.forEach(function(entry, i) {
      var el = entry.target;
      var delay = reduceMotion ? 0 : Math.min(i, 8) * 90;
      el.style.setProperty('--reveal-delay', delay + 'ms');
      el.classList.add('revealed');
      el._revealDoneTimer = setTimeout(function() { el.classList.add('reveal-done'); }, delay + 1100);

      // The numbers count up the first time only
      var stat = el.querySelector('.stat-value');
      if (stat && !stat._counted) {
        stat._counted = true;
        setTimeout(function() { countUp(stat); }, delay);
      }
    });
  }, { threshold: 0.12 });

  reveals.forEach(function(el) {
    observer.observe(el);
  });
});

/* Home page: the retention drawing plays like a video being watched.
   A playhead crosses the four parts (hook, intro, cuts, ending) at one steady speed, never stopping between them;
   a line under the clips fills as it goes, the part under it lights up with its sentence, and a face pops in
   on the line when the playhead reaches it. At the end it rests a moment, clears, and plays again.
   A tap on a clip jumps to that part. */
(function() {
  var box = document.querySelector('.home-keep');
  if (!box) return;
  var segs = box.querySelectorAll('.k-seg');
  var bands = box.querySelectorAll('.k-band');
  var says = box.querySelectorAll('.home-keep-say');
  var faces = box.querySelectorAll('.k-emo');
  var head = box.querySelector('.k-head');
  var dot = box.querySelector('.k-dot');
  var prog = box.querySelector('.k-prog');
  var lineB = box.querySelector('.k-b');
  var lineA = box.querySelector('.k-a');
  if (!segs.length || !head || !dot || !lineB || !lineB.getPointAtLength) return;

  var X0 = 20, X1 = 500;
  // How high a line is above every point of the timeline, read once
  var heights = function(path) {
    var len = path.getTotalLength(), out = [], d = 0, p = path.getPointAtLength(0);
    for (var x = X0; x <= X1; x++) {
      while (p.x < x && d < len) { d += 0.5; p = path.getPointAtLength(d); }
      out.push(p.y);
    }
    return out;
  };
  var HB = heights(lineB), HA = lineA ? heights(lineA) : HB;
  var heightAt = function(table, x) {
    var i = Math.max(0, Math.min(table.length - 1, x - X0)), a = Math.floor(i), b = Math.min(table.length - 1, a + 1);
    return table[a] + (table[b] - table[a]) * (i - a);
  };

  var starts = [], k;
  for (k = 0; k < segs.length; k++) starts.push(parseFloat(segs[k].getAttribute('data-from')));
  for (k = 0; k < faces.length; k++) {
    faces[k]._x = parseFloat(faces[k].getAttribute('data-x'));
    faces[k].parentNode.setAttribute('transform', 'translate(' + faces[k]._x + ' ' +
      heightAt(faces[k].getAttribute('data-line') === 'a' ? HA : HB, faces[k]._x).toFixed(1) + ')');
  }

  var part = -1;
  var light = function(i) {
    if (i === part) return;
    part = i;
    for (var n = 0; n < segs.length; n++) {
      segs[n].classList.toggle('is-on', n === i);
      segs[n].setAttribute('aria-pressed', n === i ? 'true' : 'false');
      if (bands[n]) bands[n].classList.toggle('is-on', n === i);
      if (says[n]) says[n].classList.toggle('is-on', n === i);
    }
  };

  // No motion wanted: everything is simply there, and a tap on a clip shows its sentence
  var calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (calm || !window.requestAnimationFrame) {
    box.classList.add('is-calm');
    for (k = 0; k < faces.length; k++) faces[k].classList.add('is-on');
    light(0);
    for (k = 0; k < segs.length; k++) (function(n) { segs[n].addEventListener('click', function() { light(n); }); })(k);
    return;
  }

  var TRAVEL = 17000;   // one pass from the first second to the last, at one steady speed
  var REST = 1900;      // the finished picture stays a moment
  var CLEAR = 600;      // then it clears, and the next pass starts
  var x = X0, phase = 'clear', left = 900, last = 0, raf = 0, seen = false;
  var place = function() {
    head.setAttribute('transform', 'translate(' + x.toFixed(2) + ' 0)');
    dot.setAttribute('transform', 'translate(' + x.toFixed(2) + ' ' + heightAt(HB, x).toFixed(2) + ')');
    if (prog) prog.setAttribute('x2', x.toFixed(2));
    var now = 0;
    for (var n = 0; n < starts.length; n++) if (x >= starts[n]) now = n;
    light(now);
    for (n = 0; n < faces.length; n++) faces[n].classList.toggle('is-on', x >= faces[n]._x - 5);
  };
  var frame = function(ts) {
    raf = requestAnimationFrame(frame);
    var dt = last ? Math.min(ts - last, 80) : 0;
    last = ts;
    if (document.hidden) return;
    if (phase === 'run') {
      x += (X1 - X0) * dt / TRAVEL;
      if (x >= X1) { x = X1; phase = 'rest'; left = REST; }
      place();
    } else if (phase === 'rest') {
      left -= dt;
      if (left <= 0) {
        phase = 'clear'; left = CLEAR;
        box.classList.add('is-clearing');
        for (var n = 0; n < faces.length; n++) faces[n].classList.remove('is-on');
      }
    } else {
      left -= dt;
      if (left <= 0) { x = X0; phase = 'run'; place(); box.classList.remove('is-clearing'); }
    }
  };
  for (k = 0; k < segs.length; k++) {
    (function(n) {
      var jump = function() { x = starts[n]; phase = 'run'; box.classList.remove('is-clearing'); place(); };
      segs[n].addEventListener('click', jump);
      segs[n].addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); jump(); }
      });
    })(k);
  }
  box.classList.add('is-clearing');
  light(0);
  place();
  // It only runs while it is on screen
  var run = function(on) {
    if (on && !raf) { last = 0; raf = requestAnimationFrame(frame); }
    if (!on && raf) { cancelAnimationFrame(raf); raf = 0; }
  };
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function(e) { seen = e[e.length - 1].isIntersecting; run(seen); }).observe(box);
  } else {
    run(true);
  }
})();
