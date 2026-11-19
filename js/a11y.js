/* תפריט נגישות – vanilla JS, בלי צד שלישי.
   ההעדפות נשמרות ב-localStorage ('kic-a11y') ומוחלות לפני הרינדור ע"י הסקריפט שב-<head>. */
(function () {
  'use strict';
  var doc = document, html = doc.documentElement, KEY = 'kic-a11y';
  var FS_MAX = 3;
  // קישור להצהרת הנגישות (של אתר KIC) – מוגדר ב-config.js; ריק = בלי קישור
  var A11Y_URL = (window.KIC_CONFIG && window.KIC_CONFIG.ACCESSIBILITY_URL) || '';
  var prefs = {};
  try { prefs = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { prefs = {}; }

  var TOGGLES = [
    { key: 'contrast', val: 'high', label: 'ניגודיות גבוהה' },
    { key: 'contrast', val: 'light', label: 'ניגודיות הפוכה (רקע בהיר)' },
    { key: 'gray', val: true, label: 'גווני אפור' },
    { key: 'links', val: true, label: 'הדגשת קישורים' },
    { key: 'font', val: true, label: 'גופן קריא' },
    { key: 'spacing', val: true, label: 'ריווח שורות ואותיות' },
    { key: 'motion', val: 'off', label: 'עצירת אנימציות ווידאו' },
    { key: 'cursor', val: true, label: 'סמן עכבר גדול' }
  ];

  function save() { try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch (e) { /* פרטי / חסום – ההגדרות יחולו לעמוד הנוכחי בלבד */ } }
  function apply() {
    ['fs', 'contrast', 'gray', 'links', 'font', 'spacing', 'motion', 'cursor', 'flow'].forEach(function (k) { html.removeAttribute('data-' + k); });
    Object.keys(prefs).forEach(function (k) { if (prefs[k]) html.setAttribute('data-' + k, prefs[k] === true ? '' : prefs[k]); });
    if (prefs.fs || prefs.spacing || prefs.font) html.setAttribute('data-flow', '');
  }

  /* ---------- כפתור ---------- */
  var ICON = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor"><circle cx="12" cy="3.6" r="2.1"/><path d="M20.6 7.1c-.2-.6-.8-.9-1.4-.8-2.3.6-4.8.9-7.2.9s-4.9-.3-7.2-.9c-.6-.1-1.2.2-1.4.8-.2.6.2 1.3.8 1.4 1.9.5 3.9.8 5.8.9-.1 2.9-.4 5.5-1.3 8.7l-1.2 4.2c-.2.6.2 1.3.8 1.4.6.2 1.2-.2 1.4-.8l1.3-4.6c.1-.4.4-.6.8-.6h.4c.4 0 .7.2.8.6l1.3 4.6c.2.6.8 1 1.4.8.6-.2 1-.8.8-1.4l-1.2-4.2c-.9-3.2-1.2-5.8-1.3-8.7 2-.1 3.9-.4 5.8-.9.7-.1 1.1-.8.8-1.4z"/></svg>';

  var btn = doc.createElement('button');
  btn.type = 'button';
  btn.className = 'a11y-btn';
  btn.setAttribute('aria-label', 'תפריט נגישות');
  btn.setAttribute('aria-haspopup', 'dialog');
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', 'a11y-panel');
  btn.innerHTML = ICON;

  /* ---------- פאנל ---------- */
  var panel = doc.createElement('div');
  panel.className = 'a11y-panel';
  panel.id = 'a11y-panel';
  panel.hidden = true;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-labelledby', 'a11y-title');
  panel.innerHTML =
    '<div class="a11y-head"><h2 id="a11y-title">תפריט נגישות</h2>' +
    '<button type="button" class="a11y-close" aria-label="סגירת תפריט הנגישות"><span aria-hidden="true">×</span></button></div>' +
    '<div class="a11y-group" role="group" aria-labelledby="a11y-fs-l"><p class="a11y-sub" id="a11y-fs-l">גודל טקסט</p>' +
    '<div class="a11y-size"><button type="button" class="a11y-opt" data-fs="-1">הקטנת טקסט <span aria-hidden="true" dir="ltr">A−</span></button>' +
    '<output id="a11y-fs-out" aria-live="polite"></output>' +
    '<button type="button" class="a11y-opt" data-fs="1">הגדלת טקסט <span aria-hidden="true" dir="ltr">A+</span></button></div></div>' +
    '<div class="a11y-group" role="group" aria-labelledby="a11y-disp-l"><p class="a11y-sub" id="a11y-disp-l">תצוגה</p><div class="a11y-grid">' +
    TOGGLES.map(function (t, i) { return '<button type="button" class="a11y-opt" aria-pressed="false" data-i="' + i + '">' + t.label + '</button>'; }).join('') +
    '</div></div>' +
    '<div class="a11y-foot">' + (A11Y_URL ? '<a href="' + A11Y_URL + '" target="_blank" rel="noopener">הצהרת נגישות<span class="sr"> (נפתח בחלון חדש)</span></a>' : '<span></span>') +
    '<button type="button" class="a11y-reset">איפוס הגדרות</button></div>';

  doc.body.appendChild(btn);
  doc.body.appendChild(panel);

  var closeBtn = panel.querySelector('.a11y-close');
  var out = panel.querySelector('#a11y-fs-out');
  var fsDown = panel.querySelector('[data-fs="-1"]');
  var fsUp = panel.querySelector('[data-fs="1"]');
  var optBtns = Array.prototype.slice.call(panel.querySelectorAll('[data-i]'));

  function sync() {
    var fs = prefs.fs || 0;
    out.innerHTML = fs === 0 ? 'רגיל' : '<span aria-hidden="true" dir="ltr">' + fs + '/' + FS_MAX + '</span><span class="sr">גודל טקסט: רמה ' + fs + ' מתוך ' + FS_MAX + '</span>';
    fsDown.disabled = fs <= 0;
    fsUp.disabled = fs >= FS_MAX;
    optBtns.forEach(function (b) {
      var t = TOGGLES[+b.getAttribute('data-i')];
      b.setAttribute('aria-pressed', prefs[t.key] === t.val ? 'true' : 'false');
    });
  }
  function motionEvent() {
    doc.dispatchEvent(new CustomEvent('kic:motion', { detail: { off: prefs.motion === 'off' } }));
  }

  panel.addEventListener('click', function (e) {
    var t = e.target.closest('button');
    if (!t) return;
    if (t.hasAttribute('data-fs')) {
      var fs = Math.max(0, Math.min(FS_MAX, (prefs.fs || 0) + +t.getAttribute('data-fs')));
      prefs.fs = fs || undefined;
      if (t.disabled) (t === fsUp ? fsDown : fsUp).focus();
    } else if (t.hasAttribute('data-i')) {
      var o = TOGGLES[+t.getAttribute('data-i')];
      prefs[o.key] = prefs[o.key] === o.val ? undefined : o.val;
      if (o.key === 'motion') { apply(); motionEvent(); }
    } else if (t.classList.contains('a11y-reset')) {
      var hadMotion = prefs.motion;
      prefs = {};
      if (hadMotion) { apply(); motionEvent(); }
    } else return;
    Object.keys(prefs).forEach(function (k) { if (prefs[k] === undefined) delete prefs[k]; });
    save(); apply(); sync();
  });

  /* ---------- dialog: פתיחה, סגירה, לכידת פוקוס ---------- */
  var lastFocus = null;
  var siblings = function () { return Array.prototype.filter.call(doc.body.children, function (el) { return el !== panel && el !== btn && el.tagName !== 'SCRIPT'; }); };
  function focusables() {
    return Array.prototype.filter.call(panel.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])'), function (el) { return !el.disabled && el.offsetParent !== null; });
  }
  function openPanel() {
    lastFocus = doc.activeElement;
    panel.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    siblings().forEach(function (el) { el.setAttribute('inert', ''); el.setAttribute('data-a11y-inert', ''); });
    sync();
    closeBtn.focus();
  }
  function closePanel() {
    panel.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    siblings().forEach(function (el) { if (el.hasAttribute('data-a11y-inert')) { el.removeAttribute('inert'); el.removeAttribute('data-a11y-inert'); } });
    btn.focus();
  }
  btn.addEventListener('click', function () { if (panel.hidden) openPanel(); else closePanel(); });
  closeBtn.addEventListener('click', closePanel);
  doc.addEventListener('keydown', function (e) {
    if (panel.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); closePanel(); return; }
    if (e.key !== 'Tab') return;
    // לכידה מפורשת: מחשבים בעצמנו את האלמנט הבא (הכפתור הצף נשאר בסבב כדי שאפשר יהיה לסגור דרכו)
    e.preventDefault();
    var f = focusables(); f.push(btn);
    var i = f.indexOf(doc.activeElement);
    var next = i === -1 ? 0 : (i + (e.shiftKey ? -1 : 1) + f.length) % f.length;
    f[next].focus();
  });
  doc.addEventListener('mousedown', function (e) {
    if (!panel.hidden && !panel.contains(e.target) && !btn.contains(e.target)) closePanel();
  });

  apply();
  sync();
})();
