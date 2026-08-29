/* ==========================================================
   WATER CHARITY — design mockup
   No dependencies of its own. Arabic ships in the markup.

   PAYMENT: set MOYASAR_KEY below and the real Moyasar form
   (card + Apple Pay) mounts into #moyasarForm. While the key
   is empty, no payment UI is shown at all — a donate button
   that looks live and takes nothing is worse than none.
   ========================================================== */
(function () {
  'use strict';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ══════════ CONFIG — the two numbers that must be real ══════════ */

  /* Moyasar publishable key, e.g. 'pk_live_...' (or pk_test_ while testing).
     Publishable keys are safe in frontend code; the secret key never is. */
  var MOYASAR_KEY = '';

  /* Where the donor lands after paying. Must be a real page you host. */
  var CALLBACK_URL = window.location.origin + window.location.pathname + '?paid=1';

  /* Cost basis. A 48-bottle carton of 200 ml bottles retails around 21 SAR
     in Saudi (Berain/Arwa, 2026), so ~0.44 SAR per bottle. A charity buying
     in bulk should pay less — put the supplier's real price here. */
  var SAR_PER_BOTTLE = 0.44;
  var LITRES_PER_BOTTLE = 0.2;

  /* ══════════════════════════════════════════════════════════════ */

  var AR_D = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
  function arDig(s) { return String(s).replace(/\d/g, function (d) { return AR_D[+d]; }); }
  function isAr() { return document.documentElement.getAttribute('lang') === 'ar'; }
  function fmt(n) {
    var s = String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return isAr() ? arDig(s).replace(/,/g, '٬') : s;
  }
  function fmt1(n) {
    var s = (Math.round(n * 10) / 10).toString();
    return isAr() ? arDig(s).replace('.', '٫') : s;
  }

  /* ---------- 1. MOCKUP BAR ---------- */
  var bar = $('#mockbar');
  function sizeBar() {
    document.documentElement.style.setProperty(
      '--bar', (bar && !bar.classList.contains('gone')) ? bar.offsetHeight + 'px' : '0px');
  }
  if (bar) {
    sizeBar();
    window.addEventListener('resize', sizeBar);
    $('#mockClose').addEventListener('click', function () { bar.classList.add('gone'); sizeBar(); });
  }

  /* ---------- 2. LANGUAGE ---------- */
  var KEY = 'ch-lang';
  var lngBtn = $('#lngBtn'), lngTx = $('#lngTx');

  function apply(lang) {
    var html = document.documentElement;
    html.setAttribute('lang', lang);
    html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    $$('[data-en]').forEach(function (el) {
      var v = el.getAttribute(lang === 'ar' ? 'data-ar' : 'data-en');
      if (v != null) el.innerHTML = v;
    });
    if (lngTx) lngTx.textContent = lang === 'ar' ? 'EN' : 'ع';
    document.title = lang === 'ar'
      ? 'سقيا — نموذج موقع جمعية خيرية لتوفير المياه'
      : 'Water Relief — charity website mockup';
    paintAmounts(); paintImpact(); paintGoal(goalShown);
    splitWords($('#heroH'));
    sizeBar();
  }

  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  if (saved === 'en') apply('en');

  if (lngBtn) lngBtn.addEventListener('click', function () {
    var next = isAr() ? 'en' : 'ar';
    apply(next);
    try { localStorage.setItem(KEY, next); } catch (e) {}
  });

  /* ---------- 3. HEADLINE ---------- */
  /* Words, never characters. Arabic is cursive — a span per letter breaks
     the joining and the word renders as loose, disconnected glyphs. */
  function splitWords(el) {
    if (!el) return;
    var txt = (el.textContent || '').trim();
    if (!txt) return;
    el.textContent = '';
    txt.split(/\s+/).forEach(function (w, i) {
      var mask = document.createElement('span');
      mask.className = 'wm';
      var inner = document.createElement('i');
      inner.textContent = w;
      inner.style.setProperty('--i', i);
      mask.appendChild(inner);
      el.appendChild(mask);
      el.appendChild(document.createTextNode(' '));
    });
  }
  splitWords($('#heroH'));

  /* ---------- 4. HERO IMAGE ---------- */
  var heroImg = $('#heroImg');
  if (heroImg) {
    var show = function () { heroImg.classList.add('seen'); };
    if (heroImg.complete && heroImg.naturalWidth) show();
    else { heroImg.addEventListener('load', show); heroImg.addEventListener('error', show); }
    setTimeout(show, 3000);           // never leave it stranded at opacity 0
  }

  /* ---------- 5. NAV ---------- */
  var nav = $('#nav'), brg = $('#brg'), menu = $('#menu');
  function closeMenu() {
    if (!menu) return;
    menu.classList.remove('open');
    brg.classList.remove('on');
    brg.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('lock');
  }
  if (brg && menu) {
    brg.addEventListener('click', function () {
      nav.classList.remove('slid');
      var open = menu.classList.toggle('open');
      brg.classList.toggle('on', open);
      brg.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.classList.toggle('lock', open);
    });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', closeMenu); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
  }

  /* ---------- 6. AMOUNT + IMPACT ---------- */
  var amountEls = $$('.amt'), customEl = $('#customAmt');
  var bottlesEl = $('#bottles'), litresEl = $('#litres'), dockAmt = $('#dockAmt');
  var vizGrid = $('#vizGrid'), vizMore = $('#vizMore');
  var amount = 50;
  var VIZ_MAX = 120;

  function bottlesFor(sar) { return Math.floor(sar / SAR_PER_BOTTLE); }

  function customHasValue() {
    return !!(customEl && customEl.value !== '' && parseFloat(customEl.value) > 0);
  }

  function paintAmounts() {
    amountEls.forEach(function (b) {
      var v = parseInt(b.getAttribute('data-amt'), 10);
      var num = b.querySelector('b');
      if (num) num.textContent = fmt(v);
      var on = !customHasValue() && v === amount;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    if (dockAmt) dockAmt.textContent = fmt(amount);
    if (customEl) customEl.placeholder = isAr() ? '٠' : '0';
  }

  function paintImpact() {
    var n = bottlesFor(amount);
    if (bottlesEl) bottlesEl.textContent = fmt(n);
    if (litresEl) litresEl.textContent = fmt1(n * LITRES_PER_BOTTLE);
    paintViz(n);
  }

  /* turn the number into something you can actually see */
  function paintViz(n) {
    if (!vizGrid) return;
    var shown = Math.min(n, VIZ_MAX);
    var frag = document.createDocumentFragment();
    for (var i = 0; i < shown; i++) {
      var b = document.createElement('span');
      b.className = 'viz__b';
      b.style.setProperty('--k', i);
      frag.appendChild(b);
    }
    vizGrid.innerHTML = '';
    vizGrid.appendChild(frag);
    if (vizMore) {
      vizMore.textContent = n > VIZ_MAX
        ? (isAr() ? '+ ' + fmt(n - VIZ_MAX) + ' عبوة أخرى' : '+ ' + fmt(n - VIZ_MAX) + ' more')
        : '';
    }
  }

  amountEls.forEach(function (b) {
    b.addEventListener('click', function () {
      amount = parseInt(b.getAttribute('data-amt'), 10);
      if (customEl) customEl.value = '';
      b.classList.remove('rip');
      void b.offsetWidth;                 // restart the ripple
      b.classList.add('rip');
      paintAmounts(); paintImpact();
    });
  });

  if (customEl) {
    customEl.addEventListener('input', function () {
      var v = parseFloat(customEl.value);
      amount = (isFinite(v) && v > 0) ? v : 0;
      paintAmounts(); paintImpact();
    });
  }
  paintAmounts(); paintImpact();

  /* ---------- 7. MOYASAR ---------- */
  /* Mounts the real card + Apple Pay form once a publishable key exists.
     Moyasar validates the Apple Pay merchant session through its own
     endpoint, so this page needs no server of its own to take a payment. */
  function mountPayment() {
    var gate = $('#payGate');
    if (!MOYASAR_KEY) return;           // no key: the gate message stays put

    var css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://cdn.moyasar.com/mpf/1.15.0/moyasar.css';
    document.head.appendChild(css);

    var js = document.createElement('script');
    js.src = 'https://cdn.moyasar.com/mpf/1.15.0/moyasar.js';
    js.onload = function () {
      if (!window.Moyasar) return;
      window.Moyasar.init({
        element: '#moyasarForm',
        /* Moyasar takes the smallest currency unit — halalas, not riyals */
        amount: Math.round(amount * 100),
        currency: 'SAR',
        description: 'Donation',
        publishable_api_key: MOYASAR_KEY,
        callback_url: CALLBACK_URL,
        methods: ['creditcard', 'applepay'],
        apple_pay: {
          country: 'SA',
          label: 'Water Donation',
          validate_merchant_url: 'https://api.moyasar.com/v1/applepay/initiate'
        }
      });
      if (gate) gate.style.display = 'none';
    };
    js.onerror = function () {
      if (gate) gate.style.display = '';
    };
    document.head.appendChild(js);
  }
  mountPayment();

  /* ---------- 8. GOAL + SCROLL ---------- */
  var GOAL_TARGET = 50000;              // illustrative
  var GOAL_RAISED = 31400;              // illustrative
  var goalNow = $('#goalNow'), goalBar = $('#goalBar');
  var goalShown = 0, goalState = 'idle';

  function paintGoal(v) { if (goalNow) goalNow.textContent = fmt(v); }

  function runGoal() {
    if (goalState !== 'idle') return;
    goalState = 'run';
    if (goalBar) goalBar.style.width = (GOAL_RAISED / GOAL_TARGET * 100).toFixed(1) + '%';
    var t0 = Date.now();
    var iv = setInterval(function () {
      var p = Math.min(1, (Date.now() - t0) / 1600);
      goalShown = GOAL_RAISED * (1 - Math.pow(1 - p, 3));
      paintGoal(goalShown);
      if (p >= 1) { clearInterval(iv); goalState = 'done'; goalShown = GOAL_RAISED; paintGoal(goalShown); }
    }, 30);
  }

  var reveals = $$('.rv');
  var heroMedia = $('.hero__media');
  var progFill = $('#progFill');
  var rise = $('#rise');
  var heroEl = $('.hero');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lastY = 0, ticking = false;

  function onScroll() {
    var vh = window.innerHeight, y = window.scrollY;
    var max = document.documentElement.scrollHeight - vh;

    if (progFill) progFill.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';

    if (nav) {
      nav.classList.toggle('stuck', y > 40);
      var open = menu && menu.classList.contains('open');
      if (!open) {
        if (y > 460 && y > lastY + 4) nav.classList.add('slid');
        else if (y < lastY - 4 || y <= 460) nav.classList.remove('slid');
      }
    }
    lastY = y;

    if (heroMedia && !reduceMotion && y < vh * 1.3) {
      heroMedia.style.transform = 'translate3d(0,' + (y * 0.12).toFixed(1) + 'px,0)';
    }

    /* the water level tracks how far into the page you have read */
    if (rise && heroEl && !reduceMotion) {
      var h = heroEl.offsetHeight || 1;
      rise.style.height = Math.max(0, Math.min(1, y / h)) * 62 + '%';
    }

    if (goalBar && goalBar.getBoundingClientRect().top < vh * 0.95) runGoal();

    /* one-way: once revealed it stays revealed, so an anchor jump can never
       strand a section at opacity 0 */
    for (var i = reveals.length - 1; i >= 0; i--) {
      var el = reveals[i];
      if (el.getBoundingClientRect().top < vh * 0.9) {
        el.classList.add('in');
        reveals.splice(i, 1);
      }
    }
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
  setTimeout(onScroll, 300);

  window.__mock = {
    amount: function () { return amount; },
    bottles: function () { return bottlesFor(amount); },
    rate: function () { return SAR_PER_BOTTLE; },
    paymentMounted: function () { return !!MOYASAR_KEY; }
  };
})();
