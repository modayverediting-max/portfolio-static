/* ========================================
   Liquid background (trial, 2026-11-04): the layer of drifting glows that
   liquid.css paints. To take it out, see the note at the top of liquid.css.
   ======================================== */
(function() {
  var layer = document.createElement('div');
  layer.className = 'liquid';
  layer.setAttribute('aria-hidden', 'true');
  layer.innerHTML = '<span></span><span></span><span></span><span></span>';
  document.body.insertBefore(layer, document.body.firstChild);
})();
