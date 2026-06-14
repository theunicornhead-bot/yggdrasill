const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");

const inputDir = __dirname;
const outputDir = path.join(inputDir, "transparent");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function rgbToHsv(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;

    h *= 60;
    if (h < 0) h += 360;
  }

  return { h, s, v };
}

function isGreenBackgroundCandidate(r, g, b) {
  const { h, s, v } = rgbToHsv(r, g, b);

  return (
    h >= 70 &&
    h <= 170 &&
    s >= 0.25 &&
    v >= 0.25 &&
    g > r * 1.15 &&
    g > b * 1.15
  );
}

function indexOf(x, y, width) {
  return y * width + x;
}

function dataIndex(x, y, width) {
  return (y * width + x) * 4;
}

function processImage(filePath) {
  const buffer = fs.readFileSync(filePath);
  const png = PNG.sync.read(buffer);

  const { width, height, data } = png;
  const total = width * height;

  const green = new Uint8Array(total);
  const bg = new Uint8Array(total);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const di = dataIndex(x, y, width);
      const r = data[di];
      const g = data[di + 1];
      const b = data[di + 2];

      if (isGreenBackgroundCandidate(r, g, b)) {
        green[indexOf(x, y, width)] = 1;
      }
    }
  }

  // 外周からつながっている緑だけ背景にする
  const queue = [];
  let head = 0;

  function pushIfGreen(x, y) {
    if (x < 0 || y < 0 || x >= width || y >= height) return;

    const idx = indexOf(x, y, width);
    if (green[idx] !== 1 || bg[idx] === 1) return;

    bg[idx] = 1;
    queue.push([x, y]);
  }

  for (let x = 0; x < width; x++) {
    pushIfGreen(x, 0);
    pushIfGreen(x, height - 1);
  }

  for (let y = 0; y < height; y++) {
    pushIfGreen(0, y);
    pushIfGreen(width - 1, y);
  }

  while (head < queue.length) {
    const [x, y] = queue[head++];

    pushIfGreen(x + 1, y);
    pushIfGreen(x - 1, y);
    pushIfGreen(x, y + 1);
    pushIfGreen(x, y - 1);
  }

  // 背景を1pxだけ広げる。緑フチ対策
  const expandedBg = new Uint8Array(bg);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = indexOf(x, y, width);
      if (bg[idx] !== 1) continue;

      expandedBg[indexOf(x + 1, y, width)] = 1;
      expandedBg[indexOf(x - 1, y, width)] = 1;
      expandedBg[indexOf(x, y + 1, width)] = 1;
      expandedBg[indexOf(x, y - 1, width)] = 1;
    }
  }

  // アルファ化
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = indexOf(x, y, width);
      const di = dataIndex(x, y, width);

      if (expandedBg[idx] === 1) {
        data[di + 3] = 0;
        continue;
      }

      // 透明背景の近くは少しだけ半透明にして境界をなじませる
      let nearBg = false;

      for (let oy = -1; oy <= 1; oy++) {
        for (let ox = -1; ox <= 1; ox++) {
          const nx = x + ox;
          const ny = y + oy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;

          if (expandedBg[indexOf(nx, ny, width)] === 1) {
            nearBg = true;
          }
        }
      }

      if (nearBg) {
        data[di + 3] = Math.min(data[di + 3], 220);

        // 緑かぶりを軽く落とす
        const r = data[di];
        const g = data[di + 1];
        const b = data[di + 2];

        const maxRb = Math.max(r, b);
        const excessGreen = Math.max(g - maxRb, 0);

        data[di + 1] = Math.max(0, Math.min(255, Math.round(g - excessGreen * 0.75)));
      }
    }
  }

  const baseName = path.basename(filePath, ".png");
  const outPath = path.join(outputDir, `${baseName}_transparent.png`);

  fs.writeFileSync(outPath, PNG.sync.write(png));
  console.log(`saved: ${outPath}`);
}

const files = fs
  .readdirSync(inputDir)
  .filter((name) => name.toLowerCase().endsWith(".png"))
  .filter((name) => !name.endsWith("_transparent.png"))
  .filter((name) => name !== "remove_green.png");

for (const file of files) {
  processImage(path.join(inputDir, file));
}

console.log("done");