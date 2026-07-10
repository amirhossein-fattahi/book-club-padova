// Generates QR codes (PNG + SVG) for the site URL.
// Usage: node scripts/generate-qr.mjs [url]
import QRCode from 'qrcode';
import { mkdir } from 'node:fs/promises';

const url = process.argv[2] || 'https://book-club-padova.vercel.app/it';
const opts = { errorCorrectionLevel: 'H', margin: 2 };

await mkdir('public', { recursive: true });
await QRCode.toFile('public/qr-code.png', url, { ...opts, width: 1200 });
await QRCode.toFile('public/qr-code.svg', url, { ...opts, type: 'svg' });

console.log('QR codes written for:', url);
