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

  /* ---------- מדידה: לחיצות על וואטסאפ / טלפון / מייל (נשלח רק אם ניתנה הסכמה – ראו consent.js) ---------- */
  function track(name, params) { if (window.kicTrack) window.kicTrack(name, params); }
  doc.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    var where = a.classList.contains('wa-fab') ? 'floating' : (a.closest('header') ? 'header' : a.closest('.hero') ? 'hero' : a.closest('.row') ? 'activity' : a.closest('footer') ? 'footer' : 'contact');
    if (/wa\.me/.test(href)) track('contact', { method: 'whatsapp', location: where, activity: a.getAttribute('data-wa-activity') || undefined });
    else if (/^tel:/.test(href)) track('contact', { method: 'phone', location: where });
    else if (/^mailto:/.test(href)) track('contact', { method: 'email', location: where });
  });

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

  /* ---------- טופס יצירת קשר: ולידציה ושליחה ---------- */
  var form = doc.getElementById('leadForm');
  if (form) {
    form.setAttribute('novalidate', ''); // עם JS – ולידציה שלנו (נגישה, בעברית); בלי JS – של הדפדפן
    var status = doc.getElementById('form-status');
    var submitBtn = doc.getElementById('f-submit');
    var normPhone = function (v) {
      var d = v.replace(/[\s\-().]/g, '');
      if (/^\+972/.test(d)) d = '0' + d.slice(4);
      else if (/^972/.test(d)) d = '0' + d.slice(3);
      return d;
    };
    // נייד/VoIP: 05X/07X + 7 ספרות · קווי: 02/03/04/08/09 + 7 ספרות
    var phoneOk = function (v) { return /^0(?:5\d|7\d)\d{7}$|^0[23489]\d{7}$/.test(normPhone(v)); };
    var emailOk = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); };
    var rules = {
      'f-name': function (v) { return !v ? 'נא למלא שם מלא' : v.length < 2 ? 'השם קצר מדי' : ''; },
      'f-phone': function (v) { return !v ? 'נא למלא מספר טלפון' : !phoneOk(v) ? 'מספר הטלפון אינו תקין (לדוגמה: 052-1234567)' : ''; },
      'f-email': function (v) { return !v ? 'נא למלא כתובת דוא״ל' : !emailOk(v) ? 'כתובת הדוא״ל אינה תקינה (לדוגמה: name@company.co.il)' : ''; },
      'f-msg': function (v) { return v.length > 2000 ? 'ההודעה ארוכה מדי (עד 2000 תווים)' : ''; }
    };
    var tried = false;
    var check = function (id) {
      var el = doc.getElementById(id), err = doc.getElementById(id + '-err');
      var msg = rules[id](el.value.trim());
      if (msg) { el.setAttribute('aria-invalid', 'true'); err.textContent = msg; err.hidden = false; }
      else { el.removeAttribute('aria-invalid'); err.textContent = ''; err.hidden = true; }
      return !msg;
    };
    Object.keys(rules).forEach(function (id) {
      var el = doc.getElementById(id);
      // אחרי ניסיון השליחה הראשון – בדיקה חיה; לפני כן רק ביציאה משדה שכבר מולא
      el.addEventListener('blur', function () { if (tried || el.value.trim()) check(id); });
      el.addEventListener('input', function () { if (el.hasAttribute('aria-invalid')) check(id); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      tried = true;
      var bad = Object.keys(rules).filter(function (id) { return !check(id); });
      if (bad.length) {
        status.className = 'form-status is-error';
        status.textContent = bad.length === 1 ? 'יש שדה אחד שצריך לתקן.' : 'יש ' + bad.length + ' שדות שצריך לתקן.';
        doc.getElementById(bad[0]).focus();
        return;
      }
      if (form.elements._honey.value) return; // ספאם
      var data = {};
      Array.prototype.forEach.call(form.elements, function (el) {
        if (el.name && el.name !== '_honey') data[el.name] = el.name === 'טלפון' ? normPhone(el.value) : el.value.trim();
      });
      data._replyto = data['דוא״ל']; // "השב" במייל יגיע ישר לפונה
      submitBtn.disabled = true;
      submitBtn.textContent = 'שולח…';
      status.className = 'form-status';
      status.textContent = 'שולחים את הפנייה…';
      // FormData (ולא JSON) – בקשה "פשוטה" בלי preflight של CORS
      var fd = new FormData();
      Object.keys(data).forEach(function (k) { fd.append(k, data[k]); });
      fetch(C.FORM_ENDPOINT || form.action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: fd
      }).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) {
          if (!r.ok || j.success === false || j.success === 'false') throw new Error(j.message || r.status);
        });
      }).then(function () {
        form.reset();
        tried = false;
        track('generate_lead', { form: 'contact' });
        status.className = 'form-status is-ok';
        status.textContent = 'תודה! הפנייה נשלחה, ונחזור אליכם בהקדם.';
      }).catch(function (err) {
        var reason = String((err && err.message) || err || '');
        // הסיבה האמיתית – לקונסול (F12), כדי שאפשר יהיה לאבחן
        if (window.console) console.warn('[טופס] השליחה נכשלה:', reason);
        var hint = '';
        if (/activat/i.test(reason)) hint = ' (הטופס עדיין לא הופעל: יש לאשר את מייל ההפעלה של FormSubmit שנשלח ל-' + (C.EMAIL || '') + ')';
        else if (/web server|file/i.test(reason) || location.protocol === 'file:') hint = ' (העמוד נפתח מקובץ מקומי – הטופס עובד רק מאתר שעלה לאוויר)';
        status.className = 'form-status is-error';
        status.textContent = 'השליחה לא הצליחה' + hint + '. אפשר לנסות שוב, או לפנות אלינו בוואטסאפ, בטלפון ' + (C.PHONE_DISPLAY || '') + ' או ב-' + (C.EMAIL || '') + '.';
      }).then(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = 'שליחה';
      });
    });
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
