/* ==========================================================
   WATER CHARITY — design mockup
   No dependencies. Arabic ships in the markup; EN is the toggle.

   The donation panel is a working *interface* over a payment
   system that does not exist yet. Nothing here takes money,
   and the Apple Pay button is deliberately inert.
   ========================================================== */
(function () {
  'use strict';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* Illustrative only. Set this to the organisation's real cost per litre
     before the page is shown to a donor. */
  var LITRES_PER_RIYAL = 10;

  var AR_D = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
  function arDig(s) { return String(s).replace(/\d/g, function (d) { return AR_D[+d]; }); }
  function isAr() { return document.documentElement.getAttribute('lang') === 'ar'; }
  function fmt(n) {
    var s = String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return isAr() ? arDig(s).replace(/,/g, '٬') : s;
  }

  /* ---------- 1. MOCKUP BAR ---------- */
  /* keeps the fixed nav clear of the banner without magic numbers */
  var bar = $('#mockbar');
  function sizeBar() {
    document.documentElement.style.setProperty(
      '--bar', (bar && !bar.classList.contains('gone')) ? bar.offsetHeight + 'px' : '0px');
  }
  if (bar) {
    sizeBar();
    window.addEventListener('resize', sizeBar);
    $('#mockClose').addEventListener('click', function () {
      bar.classList.add('gone');
      sizeBar();
    });
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
    paintAmounts();
    paintImpact();
    if (tallyState !== 'run') paintTally(1);
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

  /* ---------- 6. DONATION AMOUNT ---------- */
  var amountEls = $$('.amt'), customEl = $('#customAmt'), litresEl = $('#litres');
  var amount = 50;

  function paintAmounts() {
    amountEls.forEach(function (b) {
      b.textContent = fmt(parseInt(b.getAttribute('data-amt'), 10));
      b.classList.toggle('is-on', !customHasValue() && parseInt(b.getAttribute('data-amt'), 10) === amount);
      b.setAttribute('aria-pressed', b.classList.contains('is-on') ? 'true' : 'false');
    });
  }
  function customHasValue() {
    return !!(customEl && customEl.value !== '' && parseFloat(customEl.value) > 0);
  }
  function paintImpact() {
    if (litresEl) litresEl.textContent = fmt(amount * LITRES_PER_RIYAL);
  }

  amountEls.forEach(function (b) {
    b.addEventListener('click', function () {
      amount = parseInt(b.getAttribute('data-amt'), 10);
      if (customEl) customEl.value = '';
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

  /* ---------- 7. APPLE PAY (not wired up) ---------- */
  /* Apple Pay cannot run from static hosting. It needs:
       - a payment provider account (Moyasar, Tap, Checkout.com, Stripe…)
       - the domain verified with Apple, with their file served from
         /.well-known/apple-developer-merchantid-domain-association
       - a server endpoint to validate the merchant session
     Until all three exist, this button must not look like it works. */
  var ap = $('#applePay');
  if (ap) {
    ap.setAttribute('disabled', 'disabled');
    ap.setAttribute('aria-disabled', 'true');
    ap.addEventListener('click', function (e) {
      e.preventDefault();
      var note = $('#payNote');
      if (note) {
        note.style.transition = 'transform .3s';
        note.style.transform = 'scale(1.03)';
        setTimeout(function () { note.style.transform = ''; }, 320);
      }
    });
  }

  /* ---------- 8. COUNTERS ---------- */
  var tallies = $$('.tal b[data-count]');
  var tallyState = 'idle';

  function paintTally(p) {
    tallies.forEach(function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10) || 0;
      el.textContent = fmt(target * p);
    });
  }
  /* time-based, not frame-based: background tabs clamp timers to ~1s ticks
     and a fixed step count would crawl there */
  function runTally() {
    if (tallyState !== 'idle') return;
    tallyState = 'run';
    var t0 = Date.now();
    var iv = setInterval(function () {
      var p = Math.min(1, (Date.now() - t0) / 1500);
      paintTally(1 - Math.pow(1 - p, 3));
      if (p >= 1) { clearInterval(iv); tallyState = 'done'; paintTally(1); }
    }, 30);
  }

  /* ---------- 9. SCROLL ---------- */
  var reveals = $$('.rv');
  var heroMedia = $('.hero__media');
  var progFill = $('#progFill');
  var tallyEl = $('.tally');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lastY = 0, ticking = false;

  function onScroll() {
    var vh = window.innerHeight, y = window.scrollY;

    if (progFill) {
      var max = document.documentElement.scrollHeight - vh;
      progFill.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    }

    if (nav) {
      nav.classList.toggle('stuck', y > 30);
      var open = menu && menu.classList.contains('open');
      if (!open) {
        if (y > 420 && y > lastY + 4) nav.classList.add('slid');
        else if (y < lastY - 4 || y <= 420) nav.classList.remove('slid');
      }
    }
    lastY = y;

    if (heroMedia && !reduceMotion && y < vh * 1.3) {
      heroMedia.style.transform = 'translate3d(0,' + (y * 0.12).toFixed(1) + 'px,0)';
    }

    if (tallyEl && tallyEl.getBoundingClientRect().top < vh * 0.9) runTally();

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

  window.__mock = { setRate: function (r) { LITRES_PER_RIYAL = r; paintImpact(); }, amount: function () { return amount; } };
})();
