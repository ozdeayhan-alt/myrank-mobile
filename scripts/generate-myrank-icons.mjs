/**
 * MyRank adaptive icon assets from assets/myrank-official-logo.png
 * Run: node scripts/generate-myrank-icons.mjs
 */
import { createRequire } from "module";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const Jimp = require("jimp-compact");

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "assets", "myrank-official-logo.png");
const SIZE = 1024;
/** Circular emblem — fill adaptive icon safe zone (~66% diameter). */
const LOGO_SCALE = 0.9;
const BG_HEX = "#000000";

function parseHex(hex) {
  const h = hex.replace("#", "");
  return (
    (parseInt(h.slice(0, 2), 16) << 24) |
    (parseInt(h.slice(2, 4), 16) << 16) |
    (parseInt(h.slice(4, 6), 16) << 8) |
    0xff
  );
}

function removeNearBlackBackground(image) {
  const copy = image.clone();
  copy.scan(0, 0, copy.bitmap.width, copy.bitmap.height, function (_x, _y, idx) {
    const r = this.bitmap.data[idx];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];
    if (r < 28 && g < 28 && b < 28) {
      this.bitmap.data[idx + 3] = 0;
    }
  });
  return copy;
}

function resizeToMaxWidth(image, maxWidth) {
  const scale = maxWidth / image.bitmap.width;
  const targetW = Math.round(image.bitmap.width * scale);
  const targetH = Math.round(image.bitmap.height * scale);
  return image.clone().resize(targetW, targetH, Jimp.RESIZE_BICUBIC);
}

function centerOnCanvas(layer, canvasSize) {
  const canvas = new Jimp(canvasSize, canvasSize, 0x00000000);
  const x = Math.round((canvasSize - layer.bitmap.width) / 2);
  const y = Math.round((canvasSize - layer.bitmap.height) / 2);
  canvas.composite(layer, x, y);
  return canvas;
}

function makeMonochromeFromForeground(foreground) {
  const mono = new Jimp(SIZE, SIZE, 0x00000000);
  mono.scan(0, 0, SIZE, SIZE, function (_x, _y, idx) {
    const alpha = foreground.bitmap.data[idx + 3];
    if (alpha > 32) {
      this.bitmap.data[idx] = 255;
      this.bitmap.data[idx + 1] = 255;
      this.bitmap.data[idx + 2] = 255;
      this.bitmap.data[idx + 3] = 255;
    }
  });
  return mono;
}

async function main() {
  const raw = await Jimp.read(SRC);
  const logo = removeNearBlackBackground(raw);
  const scaled = resizeToMaxWidth(logo, Math.round(SIZE * LOGO_SCALE));

  const foreground = centerOnCanvas(scaled, SIZE);
  const background = new Jimp(SIZE, SIZE, parseHex(BG_HEX));
  const icon = background.clone().composite(
    scaled,
    Math.round((SIZE - scaled.bitmap.width) / 2),
    Math.round((SIZE - scaled.bitmap.height) / 2)
  );
  const monochrome = makeMonochromeFromForeground(foreground);

  const out = (name) => join(ROOT, "assets", name);

  await foreground.writeAsync(out("android-icon-foreground.png"));
  await background.writeAsync(out("android-icon-background.png"));
  await monochrome.writeAsync(out("android-icon-monochrome.png"));
  await icon.writeAsync(out("icon.png"));
  await icon.writeAsync(out("splash-icon.png"));

  console.log("Generated MyRank icon assets at 1024x1024");
  console.log(`Foreground logo box: ${scaled.bitmap.width}x${scaled.bitmap.height} on ${SIZE}x${SIZE}`);
  console.log(`Background: ${BG_HEX}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
