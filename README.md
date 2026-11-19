# KIC – עמוד נחיתה (פארק ההייטק של הצפון)

אתר סטטי: HTML / CSS / JS נקיים, בלי framework ובלי תלויות בזמן ריצה.
העיצוב זהה ל-`design-reference/index.html`. השינויים מהייחוס מסומנים ב-CSS בתגיות `[a11y]` / `[prod]` / `[bugfix]`.

## מבנה

```
site/
  index.html            עמוד הנחיתה
  accessibility.html    הצהרת נגישות (תבנית – יש placeholders למילוי)
  privacy.html          מדיניות פרטיות (תבנית)
  css/styles.css        כל העיצוב, כולל מצבי תפריט הנגישות
  js/config.js          ← פרטי קשר, קישורים והודעות וואטסאפ. כאן מעדכנים.
  js/main.js            קישורים מה-config, אקורדיון, וידאו, קווי נחושת
  js/a11y.js            כפתור + תפריט נגישות (vanilla, בלי צד שלישי)
  assets/img            תמונות WebP ברוחבים שונים + תמונת OG
  assets/video          וידאו Hero (MP4 + WebM, דסקטופ/מובייל) + poster
  assets/logo           לוגו SVG + אייקונים
  scripts/              סקריפטי בנייה (לא לפריסה)
  robots.txt  sitemap.xml  site.webmanifest  favicon.*  apple-touch-icon.png
```

## הרצה מקומית

מתיקיית הפרויקט (מעל `site/`):

```bash
npm install          # sharp + כלי QA (פעם אחת)
npm run serve        # http://localhost:8080
```

## בנייה מחדש של מדיה

המקורות נמצאים ב-`_source/` (חילוץ ה-ZIP-ים). לא מעלים את התיקייה הזו לאוויר.

```bash
npm run images                         # node site/scripts/optimize-images.mjs
bash site/scripts/encode-video.sh      # דורש ffmpeg ב-PATH (או FFMPEG=/path/to/ffmpeg)
bash site/scripts/encode-video.sh poster   # רק ה-poster
```

- **תמונות:** WebP באיכות 76–82, ברוחבים 480/800/1200/1600/2000 (לא מגדילים מעבר למקור).
  - פנורמת הבניין היא חיתוך 1090×454 מ-`hadshanut_erezbit041.jpg`, זהה לייחוס.
  - המקור ברוחב 1600px בלבד, ולכן הרוחב המקסימלי הוא 1090px (ראו TODO).
- **וידאו:** `DJI_20250716130216_0096_D.MP4` משנייה 13 עד 33, חיתוך אנכי זהה לייחוס, 30fps, בלי אודיו.
  - דסקטופ 960px: MP4 בגודל 3.0MB, WebM בגודל 3.1MB.
  - מובייל 640px: MP4 בגודל 1.1MB, WebM בגודל 1.4MB.
- **טעינת הווידאו:**
  - הווידאו נטען רק אחרי `load`, כדי לא להתחרות עם ה-poster (שהוא ה-LCP).
  - ב-Save-Data או בחיבור 2G מוצג רק ה-poster.
  - ב-`prefers-reduced-motion`, או כשבתפריט הנגישות בוחרים "עצירת אנימציות", הווידאו לא נטען עד שלוחצים PLAY.

## העלאה לאוויר

1. מחליפים את `https://example.com/` בדומיין הסופי (חיפוש-והחלפה בכל `site/`):
   `index.html` (canonical, og, twitter, JSON-LD), `accessibility.html`, `privacy.html`, `robots.txt`, `sitemap.xml`.
2. מעלים **רק את תוכן `site/`**, בלי `scripts/` ובלי `README.md`. לא מעלים את `_source/`, `design-reference/`, `qa/` ו-`node_modules/`.
3. בשרת:
   - דחיסת gzip/brotli ל-HTML/CSS/JS/SVG.
   - `Cache-Control` ארוך לתיקיית `assets/`.
   - HTTPS.
4. אחרי ההעלאה:
   - בודקים תצוגה מקדימה בשיתוף ב-[Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/). וואטסאפ משתמש באותן תגיות OG.
   - בודקים את ה-JSON-LD ב-[Rich Results Test](https://search.google.com/test/rich-results).

## עדכון פרטים

כל פרטי הקשר נמצאים ב-`js/config.js`, ו-`main.js` מחיל אותם על כל הקישורים בעמוד.
ב-HTML יש ערכי ברירת מחדל זהים, למקרה ש-JS לא נטען. אם משנים טלפון או מייל, כדאי לעדכן גם אותם, וגם את ה-JSON-LD וההצהרות.

## QA

בתיקייה `qa/` (לא לפריסה). השרתים צריכים לרוץ: site על 8080 ו-design-reference על 8081.

```bash
node qa/shots.mjs shots   # צילומי מסך: ייחוס מול אתר ב-390/768/1280/1440 → qa/out
node qa/shots.mjs axe     # axe-core על כל הדפים ובמצבי הנגישות
node qa/shots.mjs modes   # צילומי מצבי הנגישות
node qa/contrast.mjs      # ניגודיות של טקסט על תמונות (axe לא מודד את זה)
node qa/interact.mjs      # מקלדת, אקורדיון, dialog, וידאו, Save-Data, קישורים
```

## TODO למילוי

- [ ] **קישור מרכז המבקרים:** `VISITOR_CENTER_URL` ב-`js/config.js` (וגם ברירת המחדל ב-`index.html`, `data-link="VISITOR_CENTER_URL"`).
- [ ] **רכז/ת נגישות:** שם וטלפון ב-`accessibility.html`. גם נגישות המבנה ותאריך עדכון.
- [ ] **קואורדינטות:** לאמת את 32.70°N 35.58°E (בעמוד וב-JSON-LD `geo`).
- [ ] **דומיין סופי:** במקום `https://example.com/`.
- [ ] **sameAs ב-JSON-LD:** כתובות הלינקדאין והפייסבוק הרשמיות.
- [ ] **מדיניות פרטיות:** לעבור עם יועץ/ת משפטי/ת, ולהשלים אם יתווספו כלי אנליטיקה.
- [ ] **פנורמת הבניין:** אם יש מקור של `hadshanut_erezbit041.jpg` ברזולוציה גבוהה מ-1600px, להריץ שוב `npm run images`. היום התמונה מוצגת קצת מוגדלת במסכים רחבים, בדיוק כמו בייחוס.
- [ ] **בדיקה עם קורא מסך אמיתי** (NVDA או VoiceOver): הבדיקות האוטומטיות עברו, אבל בדיקה ידנית עדיין לא בוצעה.
