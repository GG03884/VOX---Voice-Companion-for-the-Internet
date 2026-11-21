import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPng(width, height, r, g, b, a = 255) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // bit depth 8
  ihdrData.writeUInt8(6, 9); // color type 6: RGBA
  ihdrData.writeUInt8(0, 10); // compression 0
  ihdrData.writeUInt8(0, 11); // filter 0
  ihdrData.writeUInt8(0, 12); // interlace 0

  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Raw image data: height scanlines, each with 1 filter byte (0) + width * 4 bytes RGBA
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData.writeUInt8(0, rowOffset); // filter byte: none
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      // Gradient / border effect
      const border = (x === 0 || y === 0 || x === width - 1 || y === height - 1);
      const isMic = (x > width * 0.4 && x < width * 0.6 && y > height * 0.3 && y < height * 0.7);

      if (isMic) {
        rawData.writeUInt8(255, pxOffset);     // White mic
        rawData.writeUInt8(255, pxOffset + 1);
        rawData.writeUInt8(255, pxOffset + 2);
        rawData.writeUInt8(255, pxOffset + 3);
      } else {
        rawData.writeUInt8(border ? 2 : r, pxOffset);
        rawData.writeUInt8(border ? 107 : g, pxOffset + 1);
        rawData.writeUInt8(border ? 201 : b, pxOffset + 2);
        rawData.writeUInt8(a, pxOffset + 3);
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = data.length;
  const chunk = Buffer.alloc(8 + length + 4);
  chunk.writeUInt32BE(length, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crc = crc32(chunk.subarray(4, 8 + length));
  chunk.writeInt32BE(crc, 8 + length);
  return chunk;
}

// CRC32 implementation
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return crc ^ -1;
}

const iconsDir = path.resolve('public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

fs.writeFileSync(path.join(iconsDir, 'icon-16.png'), createPng(16, 16, 12, 135, 235));
fs.writeFileSync(path.join(iconsDir, 'icon-48.png'), createPng(48, 48, 12, 135, 235));
fs.writeFileSync(path.join(iconsDir, 'icon-128.png'), createPng(128, 128, 12, 135, 235));

console.log('Generated extension icons successfully.');
