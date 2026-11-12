/*
 * Wires dashersw/liquid-glass-js into the hero.
 *
 * The library snapshots the page with html2canvas and refracts that snapshot
 * inside WebGL canvases. Here every element marked with data-glass keeps its
 * real markup (links stay links) and is moved inside a library Container, which
 * supplies the glass surface behind it. Without WebGL or on any failure the
 * CSS fallback styling in style.css stays in place.
 */
(function () {
  'use strict';

  var hero = document.getElementById('top');
  var targets = Array.prototype.slice.call(document.querySelectorAll('[data-glass]'));
  if (!hero || !targets.length) return;

  var probe = document.createElement('canvas');
  if (!(probe.getContext('webgl') || probe.getContext('experimental-webgl'))) return;

  var VENDOR = 'assets/vendor/';
  var realH2C = null;

  window.glassControls = {
    blurRadius: 4.0,
    edgeIntensity: 0.022,
    rimIntensity: 0.07,
    baseIntensity: 0.012,
    edgeDistance: 0.15,
    rimDistance: 0.8,
    baseDistance: 0.1,
    cornerBoost: 0.03,
    rippleEffect: 0.12
  };

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  /* Capture only the hero, without the nav, the glass elements or anything below. */
  function snapshotOptions(extra) {
    return Object.assign({}, extra || {}, {
      scale: 1,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
      width: document.documentElement.clientWidth,
      height: Math.ceil(hero.offsetTop + hero.offsetHeight),
      windowWidth: document.documentElement.clientWidth,
      backgroundColor: '#0F1B3D',
      logging: false,
      onclone: function (doc) {
        doc.documentElement.classList.add('snap');
        doc.querySelectorAll('.nav, .skip, [data-glass], .glass-container, main > section:not(#top), .footer, .pill-rain')
          .forEach(function (n) { n.remove(); });
      }
    });
  }

  function capture() {
    return realH2C(document.body, snapshotOptions());
  }

  function enhance() {
    targets.forEach(function (el) {
      var type = el.dataset.glass === 'pill' ? 'pill' : 'rounded';
      var container = new Container({
        type: type,
        borderRadius: parseInt(el.dataset.glassRadius, 10) || 24,
        tintOpacity: 0.18
      });
      var wrap = container.element;
      wrap.classList.add('lg-wrap');
      if (el.classList.contains('status')) wrap.classList.add('lg-status');
      el.parentNode.insertBefore(wrap, el);
      wrap.appendChild(el);
      container.updateSizeFromDOM();
    });
    document.documentElement.classList.add('glass-ready');
  }

  function renderAll() {
    Container.instances.forEach(function (c) { if (c.render) c.render(); });
  }

  /* Re-take the snapshot (resize, mood change) and push it into every instance. */
  var recapturing = false;
  function recapture() {
    if (recapturing || !Container.pageSnapshot) return;
    recapturing = true;
    capture().then(function (snap) {
      Container.pageSnapshot = snap;
      Container.instances.forEach(function (c) {
        var r = c.gl_refs;
        if (!r || !r.gl) return;
        r.gl.bindTexture(r.gl.TEXTURE_2D, r.texture);
        r.gl.texImage2D(r.gl.TEXTURE_2D, 0, r.gl.RGBA, r.gl.RGBA, r.gl.UNSIGNED_BYTE, snap);
        r.gl.uniform2f(r.textureSizeLoc, snap.width, snap.height);
        c.updateSizeFromDOM();
      });
      requestAnimationFrame(function () { requestAnimationFrame(renderAll); });
    }).catch(function () {}).then(function () { recapturing = false; });
  }

  function start() {
    loadScript(VENDOR + 'html2canvas.min.js')
      .then(function () {
        realH2C = window.html2canvas;
        // The library calls html2canvas(document.body, ...) itself; route that call through our options.
        window.html2canvas = function (node, opts) { return realH2C(node, snapshotOptions(opts)); };
        return loadScript(VENDOR + 'liquid-glass/container.js');
      })
      .then(enhance)
      .then(function () {
        // Keep refraction in step with the floating status card while the hero is on screen.
        var heroVisible = true;
        if ('IntersectionObserver' in window) {
          new IntersectionObserver(function (e) { heroVisible = e[0].isIntersecting; }).observe(hero);
        }
        (function loop() {
          if (heroVisible && !document.hidden) renderAll();
          requestAnimationFrame(loop);
        })();

        var timer = 0;
        var lastWidth = window.innerWidth;
        window.addEventListener('resize', function () {
          if (window.innerWidth === lastWidth) return;
          lastWidth = window.innerWidth;
          clearTimeout(timer);
          timer = setTimeout(recapture, 350);
        });
        window.addEventListener('moodchange', function () { setTimeout(recapture, 750); });
      })
      .catch(function (err) { console.warn('Liquid glass unavailable, using CSS fallback.', err); });
  }

  function whenReady() {
    var fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    fonts.then(function () { setTimeout(start, 120); });
  }

  if (document.readyState === 'complete') whenReady();
  else window.addEventListener('load', whenReady);
})();
