(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Serious / goofy mode ---------- */
  var moodBtn = document.getElementById('mood');
  var swappable = Array.prototype.slice.call(document.querySelectorAll('[data-goofy]'));
  swappable.forEach(function (el) { el.dataset.serious = el.innerHTML; });

  function applyMood(mood, celebrate) {
    root.dataset.mood = mood;
    var goofy = mood === 'goofy';
    moodBtn.setAttribute('aria-checked', String(goofy));
    swappable.forEach(function (el) {
      if (goofy) el.textContent = el.dataset.goofy;
      else el.innerHTML = el.dataset.serious;
    });
    try { localStorage.setItem('mood', mood); } catch (e) {}
    if (goofy && celebrate && !reduceMotion) pillRain();
    window.dispatchEvent(new CustomEvent('moodchange', { detail: mood }));
  }

  var COLORS = ['#0F172A', '#334155', '#64748B', '#94A3B8', '#E2E8F0', '#F8FAFC'];
  function pillRain() {
    for (var i = 0; i < 26; i++) {
      var pill = document.createElement('span');
      pill.className = 'pill-rain';
      pill.style.left = (Math.random() * 100) + 'vw';
      pill.style.background = COLORS[i % COLORS.length];
      pill.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg');
      pill.style.setProperty('--d', (1.4 + Math.random() * 1.6) + 's');
      pill.style.animationDelay = (Math.random() * 0.5) + 's';
      pill.addEventListener('animationend', function () { this.remove(); });
      document.body.appendChild(pill);
    }
  }

  moodBtn.addEventListener('click', function () {
    applyMood(root.dataset.mood === 'goofy' ? 'serious' : 'goofy', true);
  });
  applyMood(root.dataset.mood === 'goofy' ? 'goofy' : 'serious', false);

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.getElementById('menu-btn');
  var links = document.getElementById('nav-links');
  function setMenu(open) {
    links.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
  }
  menuBtn.addEventListener('click', function () { setMenu(!links.classList.contains('open')); });
  links.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Reveal on scroll + active nav link ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var siblings = Array.prototype.indexOf.call(el.parentNode.children, el);
        el.style.transitionDelay = Math.min(siblings, 5) * 70 + 'ms';
        el.classList.add('in');
        el.addEventListener('transitionend', function clear() {
          el.style.transitionDelay = '';
          el.removeEventListener('transitionend', clear);
        });
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });

    var navLinks = document.querySelectorAll('.nav-links a');
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach(function (s) { spy.observe(s); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Marquee: duplicate the track so the loop is seamless ---------- */
  var track = document.querySelector('.marquee-track');
  if (track) track.innerHTML += track.innerHTML;

  /* ---------- Liquid metal wordmark ---------- */
  if (window.LiquidLogo) {
    var canvases = document.querySelectorAll('[data-liquid-logo]');
    var jobs = Array.prototype.map.call(canvases, function (canvas, i) {
      return window.LiquidLogo.mount(canvas, 'assets/img/logo-mask.png', {
        speed: i === 0 ? 0.22 : 0.3,
        patternScale: i === 0 ? 1.6 : 2.2,
        refraction: 0.02,
        liquid: 0.1,
        offset: i * 4000
      });
    });
    Promise.all(jobs).then(function () { root.classList.add('liquid-ready'); }).catch(function () {
      canvases.forEach(function (c) { c.style.display = 'none'; });
    });
  }

  document.getElementById('year').textContent = new Date().getFullYear();
})();
