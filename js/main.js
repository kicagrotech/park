/* KIC – עמוד נחיתה: קישורים מה-config, אקורדיון הפעילויות, וידאו ה-Hero וקווי הנחושת. */
(function () {
  'use strict';
  var C = window.KIC_CONFIG || {};
  var doc = document, html = doc.documentElement;
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || doc).querySelectorAll(sel)); };

  /* ---------- קישורים מה-config ---------- */
  function wa(msg) { return C.WHATSAPP + (msg ? '?text=' + encodeURIComponent(C.WA_PREFIX + msg) : ''); }
  if (C.WHATSAPP) {
    $$('[data-wa]').forEach(function (a) { a.href = wa(C.WA_MESSAGES[a.getAttribute('data-wa')]); });
    $$('[data-wa-activity]').forEach(function (a) { a.href = wa(C.WA_MESSAGES.activity + a.getAttribute('data-wa-activity')); });
  }
  if (C.PHONE_TEL) $$('[data-tel]').forEach(function (a) { a.href = C.PHONE_TEL; });
  if (C.PHONE_DISPLAY) $$('[data-phone-text]').forEach(function (s) { s.textContent = C.PHONE_DISPLAY; });
  if (C.EMAIL) {
    $$('[data-mail]').forEach(function (a) { a.href = 'mailto:' + C.EMAIL + (C.EMAIL_SUBJECT ? '?subject=' + encodeURIComponent(C.EMAIL_SUBJECT) : ''); });
    $$('[data-mail-text]').forEach(function (s) { s.textContent = C.EMAIL; });
  }
  $$('[data-link]').forEach(function (a) { var u = C[a.getAttribute('data-link')]; if (u) a.href = u; });
  $$('[data-year]').forEach(function (s) { s.textContent = new Date().getFullYear(); });

  /* ---------- אקורדיון הפעילויות ---------- */
  var rowsEl = doc.getElementById('rows');
  if (rowsEl) {
    var rows = $$('.row', rowsEl);
    var btns = rows.map(function (r) { return r.querySelector('.row-toggle'); });
    var open = function (i) {
      rows.forEach(function (r, j) {
        var on = j === i, panel = doc.getElementById(btns[j].getAttribute('aria-controls'));
        r.classList.toggle('on', on);
        btns[j].setAttribute('aria-expanded', on ? 'true' : 'false');
        if (on) panel.removeAttribute('hidden'); else panel.setAttribute('hidden', '');
      });
    };
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () { open(i); });
      // ניווט בין כותרות האקורדיון בחיצים / Home / End (Enter ו-Space – התנהגות מובנית של <button>)
      b.addEventListener('keydown', function (e) {
        var k = e.key, n = btns.length, t = null;
        if (k === 'ArrowDown') t = (i + 1) % n;
        else if (k === 'ArrowUp') t = (i - 1 + n) % n;
        else if (k === 'Home') t = 0;
        else if (k === 'End') t = n - 1;
        if (t !== null) { e.preventDefault(); btns[t].focus(); }
      });
    });
  }

  /* ---------- וידאו ה-Hero ---------- */
  var v = doc.getElementById('heroVideo');
  var vb = doc.getElementById('vctl');
  var vbText = doc.getElementById('vctlText');
  var poster = doc.getElementById('heroPoster');
  var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  // Save-Data או חיבור 2G/slow-2g → poster בלבד
  var lowData = !!(conn && (conn.saveData || /2g$/.test(conn.effectiveType || '')));
  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var motionOff = function () { return mq.matches || html.hasAttribute('data-motion'); };
  var loaded = false;

  function loadVideo() {
    if (loaded || !v) return;
    loaded = true;
    var small = window.matchMedia('(max-width: 900px)').matches;
    var name = small ? 'mobile' : 'desktop';
    [['webm', 'video/webm'], ['mp4', 'video/mp4']].forEach(function (f) {
      var s = doc.createElement('source');
      s.src = 'assets/video/hero-' + name + '.' + f[0];
      s.type = f[1];
      v.appendChild(s);
    });
    v.load();
    v.addEventListener('playing', function () { v.hidden = false; if (poster) poster.alt = ''; }, { once: true });
  }
  function setPaused(p) {
    if (!v || !vb) return;
    if (p) { v.pause(); }
    else { loadVideo(); var pr = v.play(); if (pr && pr.catch) pr.catch(function () { setPaused(true); }); }
    vb.setAttribute('aria-pressed', p ? 'true' : 'false');
    vbText.textContent = p ? '▶ PLAY' : '❚❚ PAUSE';
  }
  if (v && vb && !lowData) {
    // Save-Data / חיבור איטי: נשארים עם ה-poster בלבד (בלי וידאו ובלי כפתור)
    vb.hidden = false;
    if (motionOff()) setPaused(true);
    else {
      // הווידאו נטען רק אחרי שהעמוד (וה-poster, שהוא ה-LCP) סיים להיטען – כדי לא להתחרות על רוחב הפס
      var start = function () { if (vb.getAttribute('aria-pressed') !== 'true' && !motionOff()) setPaused(false); };
      if (doc.readyState === 'complete') start(); else window.addEventListener('load', start, { once: true });
    }
    vb.addEventListener('click', function () { setPaused(!v.paused); });
    if (mq.addEventListener) mq.addEventListener('change', function () { if (mq.matches) setPaused(true); });
    // תפריט הנגישות: "עצירת אנימציות" עוצרת גם את הווידאו
    doc.addEventListener('kic:motion', function (e) { setPaused(!!e.detail.off || mq.matches); });
    // לא מבזבזים מעבד כשהווידאו מחוץ למסך
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (vb.getAttribute('aria-pressed') === 'true' || !loaded) return;
          if (e.isIntersecting) { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); } else v.pause();
        });
      }).observe(v.parentNode);
    }
  }

  /* ---------- קווי הנחושת בגלילה ---------- */
  var slats = doc.querySelector('.slats');
  if (slats) {
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es, o) {
        es.forEach(function (e) { if (e.isIntersecting) { slats.classList.add('in'); o.disconnect(); } });
      }, { threshold: 0.4 }).observe(slats);
    } else slats.classList.add('in');
  }
})();
