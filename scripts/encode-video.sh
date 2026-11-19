#!/usr/bin/env bash
# קידוד וידאו ה-Hero מהמקור (רחפן, 4K, מצולם אנכית).
# הרצה מתיקיית הפרויקט:  bash site/scripts/encode-video.sh
# דורש ffmpeg ב-PATH (או משתנה סביבה FFMPEG=/path/to/ffmpeg).
#
# החיתוך זהה לייחוס (design-reference/img/hero.mp4):
#   שניות 13–33 · מסגרת אנכית 2160x2518 מ-y=599 · 30fps · בלי אודיו.
set -euo pipefail

FFMPEG="${FFMPEG:-ffmpeg}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SRC="$ROOT/_source/סרטונים/DJI_20250716130216_0096_D.MP4"
OUT="$ROOT/site/assets/video"
mkdir -p "$OUT"

START=13
DUR=20
CROP="crop=2160:2518:0:599"

# "bash encode-video.sh poster" – מייצר רק את ה-poster (בלי לקודד מחדש את הווידאו)
if [ "${1:-}" != "poster" ]; then

# שלב 1: חיתוך ל-mezzanine באיכות גבוהה (פענוח ה-4K HEVC פעם אחת בלבד)
MEZ="$(mktemp -d)/hero-mez.mp4"
"$FFMPEG" -y -v error -stats -ss "$START" -t "$DUR" -i "$SRC" \
  -vf "$CROP,scale=1100:-2:flags=lanczos,fps=30" -an \
  -c:v libx264 -crf 12 -preset fast -pix_fmt yuv420p "$MEZ"

encode () { # $1=width  $2=suffix  $3=crf-h264  $4=crf-vp9  $5=vp9-maxrate
  local W="$1" S="$2"
  "$FFMPEG" -y -v error -stats -i "$MEZ" -vf "scale=$W:-2:flags=lanczos" -an \
    -c:v libx264 -profile:v high -crf "$3" -preset veryfast -pix_fmt yuv420p \
    -movflags +faststart "$OUT/hero-$S.mp4"
  "$FFMPEG" -y -v error -stats -i "$MEZ" -vf "scale=$W:-2:flags=lanczos" -an \
    -c:v libvpx-vp9 -crf "$4" -b:v "$5" -row-mt 1 -deadline good -cpu-used 2 \
    "$OUT/hero-$S.webm"
}

encode 960 desktop 28 40 1150k
encode 640 mobile  30 42 500k

rm -f "$MEZ"
fi

# poster: הפריים הראשון (שנייה 13 במקור, אותו חיתוך), WebP ב-4 רוחבים
"$FFMPEG" -y -v error -ss "$START" -i "$SRC" -frames:v 1 -vf "$CROP,scale=960:-2:flags=lanczos" "$OUT/poster-tmp.png"
cd "$ROOT"
node -e "
const sharp=require('sharp');
const p=process.argv[1], src=p+'/poster-tmp.png';
Promise.all([
  sharp(src).webp({quality:66,effort:6}).toFile(p+'/hero-poster.webp'),
  ...[480,640,800].map(w=>sharp(src).resize(w).webp({quality:66,effort:6}).toFile(p+'/hero-poster-'+w+'.webp'))
]).then(()=>require('fs').unlinkSync(src));
" "$OUT"

ls -la "$OUT"
