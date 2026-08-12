/**
 * 零依赖 QR Code 编码器(字节模式,版本 1-10 自适应,掩码 0-7 按罚分择优)
 * 算法与数据表对齐 ISO/IEC 18004(实现思路参考公开领域的 Nayuki 参考实现)。
 */

export type QRErrorLevel = "L" | "M" | "Q" | "H";

const ECC_INDEX: Record<QRErrorLevel, number> = { L: 0, M: 1, Q: 2, H: 3 };
/** 格式信息中的纠错等级编码 */
const ECC_FORMAT_BITS: Record<QRErrorLevel, number> = { L: 1, M: 0, Q: 3, H: 2 };

/** 每块纠错码字数,[L,M,Q,H][version-1](版本 1-10) */
const ECC_CODEWORDS_PER_BLOCK = [
  [7, 10, 15, 20, 26, 18, 20, 24, 30, 18],
  [10, 16, 26, 18, 24, 16, 18, 22, 22, 26],
  [13, 22, 18, 26, 18, 24, 18, 22, 20, 24],
  [17, 28, 22, 16, 22, 28, 26, 26, 24, 28],
];

/** 纠错块数,[L,M,Q,H][version-1](版本 1-10) */
const NUM_ERROR_CORRECTION_BLOCKS = [
  [1, 1, 1, 1, 1, 2, 2, 2, 2, 4],
  [1, 1, 1, 2, 2, 4, 4, 4, 5, 5],
  [1, 1, 2, 2, 4, 4, 6, 6, 8, 8],
  [1, 1, 2, 4, 4, 4, 5, 6, 8, 8],
];

const MAX_VERSION = 10;

/** 版本对应的原始模块数(去除功能图形) */
function getNumRawDataModules(version: number): number {
  let result = (16 * version + 128) * version + 64;
  if (version >= 2) {
    const numAlign = Math.floor(version / 7) + 2;
    result -= (25 * numAlign - 10) * numAlign - 55;
    if (version >= 7) result -= 36;
  }
  return result;
}

function getNumDataCodewords(version: number, level: QRErrorLevel): number {
  const index = ECC_INDEX[level];
  return (
    Math.floor(getNumRawDataModules(version) / 8) -
    ECC_CODEWORDS_PER_BLOCK[index][version - 1] * NUM_ERROR_CORRECTION_BLOCKS[index][version - 1]
  );
}

/* ---------------- GF(256) Reed-Solomon ---------------- */

function gfMultiply(x: number, y: number): number {
  let z = 0;
  for (let i = 7; i >= 0; i -= 1) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z & 0xff;
}

function reedSolomonDivisor(degree: number): number[] {
  const result = new Array<number>(degree).fill(0);
  result[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i += 1) {
    for (let j = 0; j < degree; j += 1) {
      result[j] = gfMultiply(result[j], root);
      if (j + 1 < degree) result[j] ^= result[j + 1];
    }
    root = gfMultiply(root, 0x02);
  }
  return result;
}

function reedSolomonRemainder(data: number[], divisor: number[]): number[] {
  const result = new Array<number>(divisor.length).fill(0);
  for (const byte of data) {
    const factor = byte ^ (result.shift() as number);
    result.push(0);
    divisor.forEach((coef, index) => {
      result[index] ^= gfMultiply(coef, factor);
    });
  }
  return result;
}

/* ---------------- 编码主流程 ---------------- */

function toUtf8Bytes(text: string): number[] {
  return [...new TextEncoder().encode(text)];
}

/** 选择能容纳数据的最小版本 */
function chooseVersion(byteLength: number, level: QRErrorLevel): number {
  for (let version = 1; version <= MAX_VERSION; version += 1) {
    const countBits = version <= 9 ? 8 : 16;
    const needBits = 4 + countBits + byteLength * 8;
    if (needBits <= getNumDataCodewords(version, level) * 8) return version;
  }
  return -1;
}

function buildCodewords(bytes: number[], version: number, level: QRErrorLevel): number[] {
  const bits: number[] = [];
  const push = (value: number, length: number) => {
    for (let i = length - 1; i >= 0; i -= 1) bits.push((value >>> i) & 1);
  };

  /* 字节模式 0100 + 长度 + 数据 */
  push(0b0100, 4);
  push(bytes.length, version <= 9 ? 8 : 16);
  bytes.forEach((byte) => push(byte, 8));

  const capacity = getNumDataCodewords(version, level) * 8;
  /* 终止符 + 对齐到字节 */
  push(0, Math.min(4, capacity - bits.length));
  push(0, (8 - (bits.length % 8)) % 8);
  /* 交替填充 0xEC / 0x11 */
  for (let pad = 0xec; bits.length < capacity; pad ^= 0xec ^ 0x11) push(pad, 8);

  const codewords: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j += 1) byte = (byte << 1) | bits[i + j];
    codewords.push(byte);
  }
  return codewords;
}

/** 分块计算纠错并交错 */
function interleaveWithEcc(data: number[], version: number, level: QRErrorLevel): number[] {
  const index = ECC_INDEX[level];
  const numBlocks = NUM_ERROR_CORRECTION_BLOCKS[index][version - 1];
  const blockEccLen = ECC_CODEWORDS_PER_BLOCK[index][version - 1];
  const rawCodewords = Math.floor(getNumRawDataModules(version) / 8);
  const numShortBlocks = numBlocks - (rawCodewords % numBlocks);
  const shortBlockLen = Math.floor(rawCodewords / numBlocks);

  const blocks: number[][] = [];
  const divisor = reedSolomonDivisor(blockEccLen);
  let offset = 0;
  for (let i = 0; i < numBlocks; i += 1) {
    const dataLen = shortBlockLen - blockEccLen + (i < numShortBlocks ? 0 : 1);
    const block = data.slice(offset, offset + dataLen);
    offset += dataLen;
    const ecc = reedSolomonRemainder(block, divisor);
    if (i < numShortBlocks) block.push(0); /* 占位,交错时跳过 */
    blocks.push([...block, ...ecc]);
  }

  const result: number[] = [];
  for (let i = 0; i < blocks[0].length; i += 1) {
    blocks.forEach((block, j) => {
      if (i !== shortBlockLen - blockEccLen || j >= numShortBlocks) {
        result.push(block[i]);
      }
    });
  }
  return result;
}

/* ---------------- 矩阵绘制 ---------------- */

type Matrix = boolean[][];

function getAlignmentPositions(version: number): number[] {
  if (version === 1) return [];
  const size = version * 4 + 17;
  const numAlign = Math.floor(version / 7) + 2;
  const step = version === 32 ? 26 : Math.ceil((version * 4 + 4) / (numAlign * 2 - 2)) * 2;
  const result = [6];
  for (let pos = size - 7; result.length < numAlign; pos -= step) {
    result.splice(1, 0, pos);
  }
  return result;
}

interface DrawContext {
  size: number;
  modules: Matrix;
  isFunction: Matrix;
}

function setFunction(ctx: DrawContext, x: number, y: number, dark: boolean) {
  ctx.modules[y][x] = dark;
  ctx.isFunction[y][x] = true;
}

function drawFinder(ctx: DrawContext, cx: number, cy: number) {
  for (let dy = -4; dy <= 4; dy += 1) {
    for (let dx = -4; dx <= 4; dx += 1) {
      const dist = Math.max(Math.abs(dx), Math.abs(dy));
      const x = cx + dx;
      const y = cy + dy;
      if (x >= 0 && x < ctx.size && y >= 0 && y < ctx.size) {
        setFunction(ctx, x, y, dist !== 2 && dist !== 4);
      }
    }
  }
}

function drawAlignment(ctx: DrawContext, cx: number, cy: number) {
  for (let dy = -2; dy <= 2; dy += 1) {
    for (let dx = -2; dx <= 2; dx += 1) {
      setFunction(ctx, cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    }
  }
}

function drawFormatBits(ctx: DrawContext, level: QRErrorLevel, mask: number) {
  const data = (ECC_FORMAT_BITS[level] << 3) | mask;
  let rem = data;
  for (let i = 0; i < 10; i += 1) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
  const bits = ((data << 10) | rem) ^ 0x5412;

  const bit = (i: number) => ((bits >>> i) & 1) !== 0;
  /* 左上副本 */
  for (let i = 0; i <= 5; i += 1) setFunction(ctx, 8, i, bit(i));
  setFunction(ctx, 8, 7, bit(6));
  setFunction(ctx, 8, 8, bit(7));
  setFunction(ctx, 7, 8, bit(8));
  for (let i = 9; i < 15; i += 1) setFunction(ctx, 14 - i, 8, bit(i));
  /* 另一副本 */
  for (let i = 0; i < 8; i += 1) setFunction(ctx, ctx.size - 1 - i, 8, bit(i));
  for (let i = 8; i < 15; i += 1) setFunction(ctx, 8, ctx.size - 15 + i, bit(i));
  /* 固定暗模块 */
  setFunction(ctx, 8, ctx.size - 8, true);
}

function drawVersionInfo(ctx: DrawContext, version: number) {
  if (version < 7) return;
  let rem = version;
  for (let i = 0; i < 12; i += 1) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
  const bits = (version << 12) | rem;
  for (let i = 0; i < 18; i += 1) {
    const bit = ((bits >>> i) & 1) !== 0;
    const a = ctx.size - 11 + (i % 3);
    const b = Math.floor(i / 3);
    setFunction(ctx, a, b, bit);
    setFunction(ctx, b, a, bit);
  }
}

function drawFunctionPatterns(ctx: DrawContext, version: number, level: QRErrorLevel) {
  /* 时序线 */
  for (let i = 0; i < ctx.size; i += 1) {
    setFunction(ctx, 6, i, i % 2 === 0);
    setFunction(ctx, i, 6, i % 2 === 0);
  }
  drawFinder(ctx, 3, 3);
  drawFinder(ctx, ctx.size - 4, 3);
  drawFinder(ctx, 3, ctx.size - 4);

  const align = getAlignmentPositions(version);
  for (let i = 0; i < align.length; i += 1) {
    for (let j = 0; j < align.length; j += 1) {
      const skip =
        (i === 0 && j === 0) ||
        (i === 0 && j === align.length - 1) ||
        (i === align.length - 1 && j === 0);
      if (!skip) drawAlignment(ctx, align[i], align[j]);
    }
  }
  drawFormatBits(ctx, level, 0);
  drawVersionInfo(ctx, version);
}

function drawCodewords(ctx: DrawContext, codewords: number[]) {
  let bitIndex = 0;
  for (let right = ctx.size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < ctx.size; vert += 1) {
      for (let j = 0; j < 2; j += 1) {
        const x = right - j;
        const upward = ((right + 1) & 2) === 0;
        const y = upward ? ctx.size - 1 - vert : vert;
        if (!ctx.isFunction[y][x] && bitIndex < codewords.length * 8) {
          ctx.modules[y][x] =
            ((codewords[bitIndex >>> 3] >>> (7 - (bitIndex & 7))) & 1) !== 0;
          bitIndex += 1;
        }
      }
    }
  }
}

function maskBit(mask: number, x: number, y: number): boolean {
  switch (mask) {
    case 0: return (x + y) % 2 === 0;
    case 1: return y % 2 === 0;
    case 2: return x % 3 === 0;
    case 3: return (x + y) % 3 === 0;
    case 4: return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0;
    case 5: return ((x * y) % 2) + ((x * y) % 3) === 0;
    case 6: return (((x * y) % 2) + ((x * y) % 3)) % 2 === 0;
    default: return (((x + y) % 2) + ((x * y) % 3)) % 2 === 0;
  }
}

function applyMask(ctx: DrawContext, mask: number) {
  for (let y = 0; y < ctx.size; y += 1) {
    for (let x = 0; x < ctx.size; x += 1) {
      if (!ctx.isFunction[y][x] && maskBit(mask, x, y)) {
        ctx.modules[y][x] = !ctx.modules[y][x];
      }
    }
  }
}

function finderPenaltyCount(runHistory: number[]): number {
  const n = runHistory[1];
  const core =
    n > 0 &&
    runHistory[2] === n &&
    runHistory[3] === n * 3 &&
    runHistory[4] === n &&
    runHistory[5] === n;
  return (
    (core && runHistory[0] >= n * 4 && runHistory[6] >= n ? 1 : 0) +
    (core && runHistory[6] >= n * 4 && runHistory[0] >= n ? 1 : 0)
  );
}

function getPenaltyScore(ctx: DrawContext): number {
  let result = 0;
  const size = ctx.size;

  /* 行/列连续同色 + 类查找图形 */
  for (let axis = 0; axis < 2; axis += 1) {
    for (let i = 0; i < size; i += 1) {
      let runColor = false;
      let runLength = 0;
      const history = [0, 0, 0, 0, 0, 0, 0];
      const addRun = (len: number) => {
        if (!runColor) {
          history.pop();
          history.unshift(len);
        } else {
          history.pop();
          history.unshift(len);
        }
      };
      for (let j = 0; j < size; j += 1) {
        const color = axis === 0 ? ctx.modules[i][j] : ctx.modules[j][i];
        if (color === runColor) {
          runLength += 1;
          if (runLength === 5) result += 3;
          else if (runLength > 5) result += 1;
        } else {
          addRun(runLength);
          if (!runColor) result += finderPenaltyCount(history) * 40;
          runColor = color;
          runLength = 1;
        }
      }
      addRun(runLength);
      if (runColor) {
        history.pop();
        history.unshift(0);
      }
      result += finderPenaltyCount(history) * 40;
    }
  }

  /* 2x2 同色块 */
  for (let y = 0; y < size - 1; y += 1) {
    for (let x = 0; x < size - 1; x += 1) {
      const c = ctx.modules[y][x];
      if (c === ctx.modules[y][x + 1] && c === ctx.modules[y + 1][x] && c === ctx.modules[y + 1][x + 1]) {
        result += 3;
      }
    }
  }

  /* 暗模块占比 */
  let dark = 0;
  ctx.modules.forEach((row) => row.forEach((cell) => (dark += cell ? 1 : 0)));
  const total = size * size;
  const k = Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1;
  result += k * 10;
  return result;
}

export interface QRMatrixResult {
  size: number;
  modules: Matrix;
  version: number;
}

/**
 * 生成 QR 矩阵;内容超出版本 10 容量时返回 null
 */
export function generateQRMatrix(text: string, level: QRErrorLevel = "M"): QRMatrixResult | null {
  const bytes = toUtf8Bytes(text);
  const version = chooseVersion(bytes.length, level);
  if (version < 0) return null;

  const codewords = interleaveWithEcc(buildCodewords(bytes, version, level), version, level);
  const size = version * 4 + 17;
  const ctx: DrawContext = {
    size,
    modules: Array.from({ length: size }, () => new Array<boolean>(size).fill(false)),
    isFunction: Array.from({ length: size }, () => new Array<boolean>(size).fill(false)),
  };

  drawFunctionPatterns(ctx, version, level);
  drawCodewords(ctx, codewords);

  /* 掩码择优 */
  let bestMask = 0;
  let bestScore = Infinity;
  for (let mask = 0; mask < 8; mask += 1) {
    applyMask(ctx, mask);
    drawFormatBits(ctx, level, mask);
    const score = getPenaltyScore(ctx);
    if (score < bestScore) {
      bestScore = score;
      bestMask = mask;
    }
    applyMask(ctx, mask); /* 异或还原 */
  }
  applyMask(ctx, bestMask);
  drawFormatBits(ctx, level, bestMask);

  return { size, modules: ctx.modules, version };
}
