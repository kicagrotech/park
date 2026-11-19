/* הסכמה לעוגיות + טעינת Google Analytics 4 ו-Meta Pixel רק אחרי הסכמה.
   - המזהים מוגדרים ב-js/config.js (GA4_ID, META_PIXEL_ID). כל עוד הם ריקים – שום סקריפט צד שלישי לא נטען, והבאנר לא מוצג.
   - ההסכמה נשמרת ב-localStorage ('kic-consent') ל-12 חודשים. "הגדרות עוגיות" בפוטר פותח את הבאנר מחדש.
   - window.kicTrack(name, params) – שליחת אירוע לשני הכלים (רק אם ניתנה הסכמה לכלי). */
(function () {
  'use strict';
  var C = window.KIC_CONFIG || {};
  var doc = document, KEY = 'kic-consent', VERSION = 1, MAX_AGE = 365 * 24 * 3600 * 1000;
  var GA = C.GA4_ID || '', PX = C.META_PIXEL_ID || '';
  var state = null;
  var loaded = { ga: false, px: false };

  function read() {
    try {
      var s = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (s && s.v === VERSION && Date.now() - s.ts < MAX_AGE) return s;
    } catch (e) { /* חסום – נשאל שוב */ }
    return null;
  }
  function save(analytics, marketing) {
    state = { v: VERSION, ts: Date.now(), analytics: !!analytics, marketing: !!marketing };
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* יחול לביקור הנוכחי בלבד */ }
    apply();
  }

  /* ---------- טעינת הכלים ---------- */
  function loadGA() {
    if (loaded.ga || !GA) return;
    loaded.ga = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'granted' });
    window.gtag('js', new Date());
    window.gtag('config', GA);
    var s = doc.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA);
    doc.head.appendChild(s);
  }
  function loadPixel() {
    if (loaded.px || !PX) return;
    loaded.px = true;
    /* קוד הבסיס הרשמי של Meta Pixel */
    !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, doc, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', PX);
    window.fbq('track', 'PageView');
  }
  function apply() {
    if (!state) return;
    if (state.analytics) loadGA();
    else if (loaded.ga && window.gtag) window.gtag('consent', 'update', { analytics_storage: 'denied' });
    if (state.marketing) loadPixel();
    else if (loaded.px && window.fbq) window.fbq('consent', 'revoke');
    if (state.marketing && loaded.px && window.fbq) window.fbq('consent', 'grant');
  }

  /* אירועים: שמות GA4 מומלצים ↔ אירועים סטנדרטיים של Meta */
  var PIXEL_MAP = { generate_lead: 'Lead', contact: 'Contact' };
  window.kicTrack = function (name, params) {
    if (!state) return;
    if (state.analytics && loaded.ga && window.gtag) window.gtag('event', name, params || {});
    if (state.marketing && loaded.px && window.fbq) {
      if (PIXEL_MAP[name]) window.fbq('track', PIXEL_MAP[name], params || {});
      else window.fbq('trackCustom', name, params || {});
    }
  };

  /* ---------- באנר ---------- */
  var banner = null;
  function build() {
    banner = doc.createElement('section');
    banner.className = 'cookie-bar';
    banner.setAttribute('aria-labelledby', 'cookie-title');
    banner.hidden = true;
    banner.innerHTML =
      '<h2 id="cookie-title" class="cookie-title">אנחנו משתמשים בעוגיות</h2>' +
      '<p class="cookie-text">נשמח לאשר שימוש בעוגיות לסטטיסטיקה (Google Analytics) ולשיווק (Meta Pixel), כדי להבין איך משתמשים בעמוד ולשפר את הפרסום שלנו. אפשר לאשר, לדחות או לבחור. ' +
      '<a href="privacy.html#cookies">למדיניות הפרטיות</a></p>' +
      '<div class="cookie-prefs" id="cookie-prefs" hidden>' +
      '<label class="cookie-opt"><input type="checkbox" checked disabled> <span><b>הכרחיות</b> – שמירת הבחירה הזו והגדרות הנגישות. תמיד פעילות.</span></label>' +
      '<label class="cookie-opt"><input type="checkbox" id="ck-analytics"> <span><b>סטטיסטיקה</b> – Google Analytics: כמה מבקרים, מאילו מקורות ומה עשו בעמוד.</span></label>' +
      '<label class="cookie-opt"><input type="checkbox" id="ck-marketing"> <span><b>שיווק</b> – Meta Pixel: מדידת קמפיינים בפייסבוק ובאינסטגרם והצגת מודעות רלוונטיות.</span></label>' +
      '</div>' +
      '<div class="cookie-actions">' +
      '<button type="button" class="cookie-btn cookie-btn--solid" data-ck="all">אישור הכל</button>' +
      '<button type="button" class="cookie-btn" data-ck="none">דחייה</button>' +
      '<button type="button" class="cookie-btn cookie-btn--link" data-ck="prefs" aria-expanded="false" aria-controls="cookie-prefs">התאמה אישית</button>' +
      '<button type="button" class="cookie-btn cookie-btn--solid" data-ck="save" hidden>שמירת הבחירה</button>' +
      '</div>';
    var skip = doc.querySelector('.skip');
    // ראשון ב-DOM (אחרי "דלג לתוכן") – כדי שמשתמשי מקלדת וקורא מסך יגיעו אליו מיד
    if (skip && skip.nextSibling) doc.body.insertBefore(banner, skip.nextSibling); else doc.body.insertBefore(banner, doc.body.firstChild);

    var prefs = banner.querySelector('#cookie-prefs');
    var prefsBtn = banner.querySelector('[data-ck="prefs"]');
    var saveBtn = banner.querySelector('[data-ck="save"]');
    banner.addEventListener('click', function (e) {
      var b = e.target.closest('[data-ck]');
      if (!b) return;
      var k = b.getAttribute('data-ck');
      if (k === 'all') { save(true, true); close(); }
      else if (k === 'none') { save(false, false); close(); }
      else if (k === 'save') { save(banner.querySelector('#ck-analytics').checked, banner.querySelector('#ck-marketing').checked); close(); }
      else if (k === 'prefs') {
        var open = prefs.hidden;
        prefs.hidden = !open; saveBtn.hidden = !open;
        prefsBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (open) banner.querySelector('#ck-analytics').focus();
      }
    });
  }
  var opener = null;
  function open(fromLink) {
    if (!banner) build();
    banner.querySelector('#ck-analytics').checked = !!(state && state.analytics);
    banner.querySelector('#ck-marketing').checked = !!(state && state.marketing);
    banner.hidden = false;
    doc.documentElement.classList.add('has-cookie-bar');
    if (fromLink) { opener = doc.activeElement; banner.querySelector('.cookie-btn').focus(); }
  }
  function close() {
    banner.hidden = true;
    doc.documentElement.classList.remove('has-cookie-bar');
    if (opener && doc.contains(opener)) opener.focus();
    opener = null;
  }

  /* ---------- התחלה ---------- */
  state = read();
  var hasTools = !!(GA || PX);
  doc.querySelectorAll('[data-cookie-settings]').forEach(function (el) {
    if (!hasTools) { el.closest('li') ? el.closest('li').remove() : el.remove(); return; }
    el.addEventListener('click', function (e) { e.preventDefault(); open(true); });
  });
  if (!hasTools) return;     // אין כלים מוגדרים → אין עוגיות → אין באנר
  if (state) apply(); else open(false);
})();
