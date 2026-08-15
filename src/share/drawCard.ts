import type { ShareCardModel } from '../home/shareDay';

export type DrawnCard = {
  brand?: string;
  kicker?: string;
  title: string;
  lines: string[];
};

export function panchangDrawInput(card: ShareCardModel): DrawnCard {
  return {
    brand: card.app,
    kicker: `${card.city} · ${card.dateLabel}`,
    title: card.tithi,
    lines: [card.paksha, card.nakshatra, card.startLabel, card.rule, card.windowName, card.rahu].filter(
      (line): line is string => Boolean(line),
    ),
  };
}

export function textDrawInput(title: string, message: string): DrawnCard {
  const lines = message.split('\n').map((line) => line.trim()).filter(Boolean);
  return {
    brand: title,
    title: lines[0] ?? title,
    lines: lines.slice(1),
  };
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const rows: string[] = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && current) {
      rows.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) rows.push(current);
  return rows;
}

/** Night + gold PNG for WhatsApp / download. Browser only. */
export async function drawSharePng(card: DrawnCard): Promise<Blob> {
  if (typeof document === 'undefined') {
    throw new Error('Share card image was not ready');
  }
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Share card image was not ready');

  const night = ctx.createLinearGradient(0, 0, 0, 1080);
  night.addColorStop(0, '#0A0814');
  night.addColorStop(1, '#06070E');
  ctx.fillStyle = night;
  ctx.fillRect(0, 0, 1080, 1080);

  ctx.strokeStyle = 'rgba(232, 197, 120, 0.4)';
  ctx.lineWidth = 4;
  ctx.strokeRect(48, 48, 984, 984);

  let y = 160;
  ctx.fillStyle = '#E8C578';
  ctx.font = '700 36px "Noto Sans Devanagari", "Noto Sans", sans-serif';
  ctx.textAlign = 'center';
  if (card.brand) {
    ctx.fillText(card.brand, 540, y);
    y += 70;
  }
  if (card.kicker) {
    ctx.fillStyle = 'rgba(232, 197, 120, 0.85)';
    ctx.font = '500 32px "Noto Sans Devanagari", "Noto Sans", sans-serif';
    ctx.fillText(card.kicker, 540, y);
    y += 64;
  }
  ctx.fillStyle = '#F4EEE0';
  ctx.font = '700 64px "Noto Sans Devanagari", "Noto Sans", sans-serif';
  for (const row of wrap(ctx, card.title, 860)) {
    ctx.fillText(row, 540, y);
    y += 78;
  }
  y += 20;
  ctx.fillStyle = 'rgba(244, 238, 224, 0.72)';
  ctx.font = '500 36px "Noto Sans Devanagari", "Noto Sans", sans-serif';
  for (const line of card.lines.slice(0, 8)) {
    for (const row of wrap(ctx, line, 860)) {
      ctx.fillText(row, 540, y);
      y += 50;
    }
  }

  return await new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Share card image was not ready'));
    }, 'image/png');
  });
}
