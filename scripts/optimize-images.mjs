// אופטימיזציית תמונות לעמוד הנחיתה של KIC.
// הרצה מתיקיית הפרויקט:  node site/scripts/optimize-images.mjs   (או: npm run images)
// קורא מ-_source/ (לא נוגע במקור) וכותב ל-site/assets/ ול-site/.
import sharp from 'sharp';
import { mkdir, readFile, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SRC = path.join(ROOT, '_source');
const SITE = path.join(ROOT, 'site');
const IMG = path.join(SITE, 'assets/img');
const LOGO = path.join(SITE, 'assets/logo');
const WIDTHS = [480, 800, 1200, 1600, 2000];
const BG = '#373D41';
const COPPER = '#C07A52';

const src = (...p) => path.join(SRC, ...p);

// כל תמונה: מקור, חיתוך (אם יש) ואיכות. החיתוכים זהים לייחוס ב-design-reference/img.
const IMAGES = [
  {
    // פנורמת הבניין: חיתוך 1090x454 מ-(190,22) – בדיוק כמו בייחוס. המקור ברוחב 1600 בלבד.
    name: 'building-pano',
    file: src('תמונות בנין חוץ', 'hadshanut_erezbit041.jpg'),
    crop: { left: 190, top: 22, width: 1090, height: 454 },
    quality: 82,
  },
  // תמונת הבניין בסקשן "פארק ההייטק של הצפון" (מחליפה את building-pano בעמוד)
  { name: 'kic-building', file: src('תמונות בנין חוץ', 'Zemach-Cam002.jpg'), quality: 76 },
  { name: 'meeting-golan', file: src('תמונות פנים ', 'חדרי ישיבות', 'חדר ישיבות גולן.jpeg'), quality: 80 },
  { name: 'greenhouse', file: src('תמונות פנים ', 'green house', 'כנס-Ai-7.jpg'), quality: 78 },
  { name: 'lake-coast', file: src('סרטונים', 'צילומי רחפן חדשים - מאור אטיאס', 'DJI_20250716130719_0102_D.JPG'), quality: 76 },
  { name: 'openspace-event', file: src('תמונות פנים ', 'אופן ספייס', 'אופן ספייס- כיסאות באירוע.jpg'), quality: 78 },
];

const kb = async (f) => ((await stat(f)).size / 1024).toFixed(0) + 'KB';

async function responsive({ name, file, crop, quality }) {
  let base = sharp(file).rotate(); // rotate() = auto-orient לפי EXIF
  if (crop) base = sharp(await base.extract(crop).toBuffer());
  const { width: srcW, height: srcH } = await sharp(await base.clone().toBuffer()).metadata();
  // לא מגדילים מעבר למקור: הרוחב הגדול ביותר הוא min(2000, רוחב המקור)
  const widths = [...new Set(WIDTHS.map((w) => Math.min(w, srcW)))];
  const out = [];
  for (const w of widths) {
    const f = path.join(IMG, `${name}-${w}.webp`);
    await base.clone().resize({ width: w, withoutEnlargement: true }).webp({ quality, effort: 6 }).toFile(f);
    out.push(`${name}-${w}.webp ${await kb(f)}`);
  }
  console.log(`${name} (${srcW}x${srcH}):`, out.join(' · '));
}

// לוגו: SVG נקי (בלי ה-<image> השבור, הפילטר וה-clipPath שהגיעו מהייצוא)
async function cleanSvg(inFile, outFile) {
  let svg = await readFile(inFile, 'utf8');
  svg = svg
    .replace(/<\?xml[^>]*>\s*/, '')
    .replace(/<filter[\s\S]*?<\/filter>\s*/g, '')
    .replace(/<clipPath[\s\S]*?<\/clipPath>\s*/g, '')
    .replace(/<g class="cls-2">[\s\S]*?<image[\s\S]*?<\/g>\s*<\/g>\s*/g, '')
    .replace(/ xmlns:xlink="[^"]*"/, '')
    .replace(/ id="Layer_1" data-name="Layer 1"/, '')
    .replace(/\n\s*\n/g, '\n');
  await writeFile(outFile, svg);
  return svg;
}

async function logos() {
  await cleanSvg(src('לוגואים KIC', 'לוגו _ לרקע כהה.svg'), path.join(LOGO, 'kic-logo-light.svg'));
  await cleanSvg(src('לוגואים KIC', 'לוגו _ שם מלא.svg'), path.join(LOGO, 'kic-logo-dark.svg')); // למצב "ניגודיות הפוכה"
  // PNG לשימוש ב-JSON-LD / שיתופים
  await sharp(src('לוגואים KIC', 'לוגו _ לרקע כהה- High Quality.png')).resize({ width: 600 }).png({ compressionLevel: 9 }).toFile(path.join(LOGO, 'kic-logo-light.png'));
  await sharp(src('לוגואים KIC', 'לוגו _ שם מלא- High Quality.png')).resize({ width: 600 }).png({ compressionLevel: 9 }).toFile(path.join(LOGO, 'kic-logo.png'));

  // אייקון: ריבוע גרפיט, לוגוטייפ KIC בהיר, קו נחושת – בלי פינות מעוגלות
  const typeSvg = await readFile(src('לוגואים KIC', 'לוגו _ לוגוטייפ בלבד- בהיר.svg'), 'utf8');
  const paths = [...typeSvg.matchAll(/<path class="cls-3" d="([^"]+)"/g)].map((m) => m[1]);
  const icon = (pad) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
<rect width="512" height="512" fill="${BG}"/>
<g transform="translate(${256 - (184.13 * pad) / 2} ${236 - (86.47 * pad) / 2}) scale(${pad})" fill="#F3F1EC">${paths.map((d) => `<path d="${d}"/>`).join('')}</g>
<rect x="${256 - (184.13 * pad) / 2}" y="${236 + (86.47 * pad) / 2 + 34}" width="${184.13 * pad * 0.62}" height="14" fill="${COPPER}"/>
</svg>`;
  const iconSvg = icon(2.1);
  await writeFile(path.join(SITE, 'favicon.svg'), iconSvg);
  const iconBuf = Buffer.from(iconSvg);
  const maskBuf = Buffer.from(icon(1.7)); // maskable: אזור בטוח
  await sharp(iconBuf).resize(180).png().toFile(path.join(SITE, 'apple-touch-icon.png'));
  await sharp(iconBuf).resize(192).png().toFile(path.join(SITE, 'assets/logo/icon-192.png'));
  await sharp(iconBuf).resize(512).png().toFile(path.join(SITE, 'assets/logo/icon-512.png'));
  await sharp(maskBuf).resize(512).png().toFile(path.join(SITE, 'assets/logo/icon-maskable-512.png'));
  // favicon.ico (ICO שמכיל PNG 32x32 – נתמך בכל הדפדפנים)
  const png32 = await sharp(iconBuf).resize(32).png().toBuffer();
  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(1, 4);
  header.writeUInt8(32, 6); header.writeUInt8(32, 7); header.writeUInt8(0, 8); header.writeUInt8(0, 9);
  header.writeUInt16LE(1, 10); header.writeUInt16LE(32, 12);
  header.writeUInt32LE(png32.length, 14); header.writeUInt32LE(22, 18);
  await writeFile(path.join(SITE, 'favicon.ico'), Buffer.concat([header, png32]));
  console.log('logo + icons: done');
}

// תמונת OG 1200x630 – פנורמת הבניין והכנרת (בלי הבניין הישן מימין)
async function og() {
  const base = sharp(src('תמונות בנין חוץ', 'hadshanut_erezbit041.jpg'))
    .extract({ left: 190, top: 0, width: 1090, height: 572 })
    .resize(1200, 630, { kernel: 'lanczos3' })
    .sharpen({ sigma: 0.6 });
  const buf = await base.toBuffer();
  await sharp(buf).jpeg({ quality: 84, mozjpeg: true }).toFile(path.join(IMG, 'og-kic.jpg'));
  await sharp(buf).webp({ quality: 82 }).toFile(path.join(IMG, 'og-kic.webp'));
  console.log('og-kic:', await kb(path.join(IMG, 'og-kic.jpg')), '/', await kb(path.join(IMG, 'og-kic.webp')));
}

await mkdir(IMG, { recursive: true });
await mkdir(LOGO, { recursive: true });
for (const im of IMAGES) await responsive(im);
await logos();
await og();
