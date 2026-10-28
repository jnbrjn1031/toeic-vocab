// 앱 아이콘 PNG 생성(의존성 없음): 딥그린 바탕에 겹친 플래시카드 두 장.
// node:zlib로 PNG를 직접 인코딩하고, 픽셀마다 4×4 슈퍼샘플링으로 안티앨리어싱한다.
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';

const ACCENT = [0x1e, 0x5b, 0x45];
const WHITE = [255, 255, 255];
const SS = 4;

// 회전된 둥근 사각형의 부호 거리(안쪽이 음수). 좌표는 아이콘 크기 1 기준.
function roundedRect(px, py, { cx, cy, w, h, r, angle }) {
  const cos = Math.cos(-angle);
  const sin = Math.sin(-angle);
  const dx = px - cx;
  const dy = py - cy;
  const x = Math.abs(dx * cos - dy * sin) - (w / 2 - r);
  const y = Math.abs(dx * sin + dy * cos) - (h / 2 - r);
  return Math.hypot(Math.max(x, 0), Math.max(y, 0)) + Math.min(Math.max(x, y), 0) - r;
}

// 카드 안쪽 좌표계로 옮긴 점(글줄 막대를 카드와 함께 기울이기 위해)
function local(px, py, card) {
  const cos = Math.cos(-card.angle);
  const sin = Math.sin(-card.angle);
  const dx = px - card.cx;
  const dy = py - card.cy;
  return [dx * cos - dy * sin, dx * sin + dy * cos];
}

function layers({ scale, bgRadius }) {
  const deg = Math.PI / 180;
  const s = scale;
  const back = { cx: 0.5 + 0.06 * s, cy: 0.5 - 0.035 * s, w: 0.42 * s, h: 0.52 * s, r: 0.05 * s, angle: 11 * deg };
  const front = { cx: 0.5 - 0.035 * s, cy: 0.5 + 0.03 * s, w: 0.42 * s, h: 0.52 * s, r: 0.05 * s, angle: -5 * deg };
  const lines = [
    { x: -0.12 * s, y: -0.07 * s, w: 0.2 * s, h: 0.045 * s },
    { x: -0.12 * s, y: 0.02 * s, w: 0.13 * s, h: 0.03 * s },
  ];
  return (x, y) => {
    let rgb = null;
    let a = 0;
    const paint = (color, alpha) => {
      rgb = rgb ? rgb.map((c, i) => c * (1 - alpha) + color[i] * alpha) : color;
      a = a + alpha * (1 - a);
    };
    const bg = bgRadius > 0 ? roundedRect(x, y, { cx: 0.5, cy: 0.5, w: 1, h: 1, r: bgRadius, angle: 0 }) : -1;
    if (bg > 0) return [0, 0, 0, 0];
    paint(ACCENT, 1);
    if (roundedRect(x, y, back) < 0) paint(WHITE, 0.45);
    if (roundedRect(x, y, front) < 0) {
      paint(WHITE, 1);
      const [lx, ly] = local(x, y, front);
      for (const l of lines) {
        if (lx >= l.x && lx <= l.x + l.w && Math.abs(ly - l.y) <= l.h / 2) paint(ACCENT, 1);
      }
    }
    return [...rgb, a];
  };
}

function render(size, opts) {
  const sample = layers(opts);
  const rows = Buffer.alloc((size * 4 + 1) * size);
  for (let py = 0; py < size; py++) {
    rows[py * (size * 4 + 1)] = 0; // filter: none
    for (let px = 0; px < size; px++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const [cr, cg, cb, ca] = sample((px + (sx + 0.5) / SS) / size, (py + (sy + 0.5) / SS) / size);
          r += cr * ca; g += cg * ca; b += cb * ca; a += ca;
        }
      }
      const o = py * (size * 4 + 1) + 1 + px * 4;
      const n = SS * SS;
      rows[o] = a ? Math.round(r / a) : 0;
      rows[o + 1] = a ? Math.round(g / a) : 0;
      rows[o + 2] = a ? Math.round(b / a) : 0;
      rows[o + 3] = Math.round((a / n) * 255);
    }
  }
  return png(size, rows);
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function png(size, rows) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(rows, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const out = new URL('../icons/', import.meta.url);
mkdirSync(out, { recursive: true });
const icons = [
  ['icon-192.png', 192, { scale: 1, bgRadius: 0.22 }],
  ['icon-512.png', 512, { scale: 1, bgRadius: 0.22 }],
  ['icon-maskable-512.png', 512, { scale: 0.74, bgRadius: 0 }], // 마크가 가운데 80% 안전 영역 안에 들어가게
  ['apple-touch-icon.png', 180, { scale: 1, bgRadius: 0 }], // iOS가 직접 모서리를 깎는다
];
for (const [name, size, opts] of icons) {
  writeFileSync(new URL(name, out), render(size, opts));
  console.log(`icons/${name} ${size}×${size}`);
}
