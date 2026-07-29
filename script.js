/* ========================================
   Video Modal (works on file:// and http)
   ======================================== */
var isLocal = window.location.protocol === 'file:';

function openVideo(youtubeId) {
  if (isLocal) {
    window.open('https://www.youtube.com/watch?v=' + youtubeId, '_blank');
    return;
  }
  var modal = document.getElementById('videoModal');
  var iframe = document.getElementById('modalIframe');
  iframe.src = 'https://www.youtube.com/embed/' + youtubeId + '?autoplay=1&rel=0';
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeVideo(e) {
  var modal = document.getElementById('videoModal');
  var iframe = document.getElementById('modalIframe');
  modal.classList.remove('active');
  iframe.src = '';
  document.body.style.overflow = '';
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
   Scroll Reveal Animations
   ======================================== */
document.addEventListener('DOMContentLoaded', function() {
  var reveals = document.querySelectorAll('.reveal-box');

  if (reveals.length === 0) return;

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      } else {
        entry.target.classList.remove('revealed');
      }
    });
  }, { threshold: 0.12 });

  reveals.forEach(function(el) {
    observer.observe(el);
  });
});
