(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Hero title: one span per letter so they can animate in ---------- */
  var title = document.querySelector('.hero-title');
  function splitTitle() {
    if (!title || reduceMotion) return;
    var text = title.textContent;
    var i = 0;
    title.setAttribute('aria-label', text);
    title.innerHTML = text.split(' ').map(function (word) {
      var letters = word.split('').map(function (ch) {
        return '<span class="ch" aria-hidden="true" style="--i:' + (i++) + '">' + ch + '</span>';
      }).join('');
      return '<span class="w">' + letters + '</span>';
    }).join(' ');
  }

  /* ---------- Serious / goofy mode ---------- */
  var moodBtn = document.getElementById('mood');
  var hint = document.getElementById('mood-hint');
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
    splitTitle();
    try { localStorage.setItem('mood', mood); } catch (e) {}
    if (goofy && celebrate && !reduceMotion) pillRain();
    window.dispatchEvent(new CustomEvent('moodchange', { detail: mood }));
  }

  var COLORS = ['#4B0F1F', '#7A3F56', '#B78793', '#E8C9D0', '#F7EFEF', '#FFFCFA'];
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

  function toggleMood() {
    applyMood(root.dataset.mood === 'goofy' ? 'serious' : 'goofy', true);
  }
  moodBtn.addEventListener('click', toggleMood);
  if (hint) hint.addEventListener('click', toggleMood);
  applyMood(root.dataset.mood === 'goofy' ? 'goofy' : 'serious', false);

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.getElementById('menu-btn');
  var links = document.getElementById('nav-links');
  function setMenu(open) {
    links.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    root.classList.toggle('menu-open', open);
    updateHint();
  }
  menuBtn.addEventListener('click', function () { setMenu(!links.classList.contains('open')); });
  links.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Scroll driven bits: progress bar, toggle pointer, timeline fill ---------- */
  var progress = document.getElementById('progress');
  var timeline = document.querySelector('.timeline');
  var ticking = false;

  function updateHint() {
    var away = window.scrollY > window.innerHeight * 0.45;
    root.classList.toggle('hint-off', away || root.classList.contains('menu-open'));
  }

  function onScroll() {
    ticking = false;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.transform = 'scaleX(' + (max > 0 ? window.scrollY / max : 0) + ')';
    updateHint();
    if (timeline) {
      var r = timeline.getBoundingClientRect();
      var p = (window.innerHeight * 0.6 - r.top) / r.height;
      timeline.style.setProperty('--fill', Math.max(0, Math.min(1, p)).toFixed(3));
    }
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- Count up ---------- */
  function countUp(el) {
    var to = parseFloat(el.dataset.to);
    var dec = parseInt(el.dataset.dec || '0', 10);
    var start = performance.now();
    var dur = 1400;
    function fmt(v) {
      return dec ? v.toFixed(dec) : Math.round(v).toLocaleString('en-US');
    }
    (function step(now) {
      var t = Math.min(1, (now - start) / dur);
      var eased = 1 - Math.pow(1 - t, 4);
      el.textContent = fmt(to * eased);
      if (t < 1) requestAnimationFrame(step);
    })(start);
  }

  /* ---------- Reveal on scroll + active nav link ---------- */
  document.querySelectorAll('.chips').forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (chip, n) { chip.style.setProperty('--n', n); });
  });

  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var index = Array.prototype.indexOf.call(el.parentNode.children, el);
        el.style.transitionDelay = Math.min(index, 5) * 70 + 'ms';
        el.classList.add('in');
        el.querySelectorAll('.count').forEach(countUp);
        setTimeout(function () { el.style.transitionDelay = ''; }, 1200);
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
    document.querySelectorAll('.chips').forEach(function (c) { c.classList.add('in'); });
  }

  /* ---------- Cards tilt toward the cursor ---------- */
  if (finePointer && !reduceMotion) {
    document.querySelectorAll('.card, .stat, .edu, .group, .photo-card').forEach(function (el) {
      el.classList.add('tilt');
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = 'perspective(900px) translateY(-6px) rotateX(' + (-y * 7).toFixed(2) + 'deg) rotateY(' + (x * 9).toFixed(2) + 'deg)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
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
