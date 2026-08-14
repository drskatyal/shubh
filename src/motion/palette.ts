import type { Verdict, WindowKind } from './types';

export type SkyPalette = {
  skyDeep: string;
  skyMid: string;
  glow: string;
  orbit: string;
  sun: string;
  sunCore: string;
  moon: string;
  earth: string;
  star: string;
};

const WINDOWS: Record<WindowKind, SkyPalette> = {
  rahu: {
    skyDeep: '#0A0306',
    skyMid: '#2A1016',
    glow: '#8B2A32',
    orbit: '#6B3038',
    sun: '#C45A48',
    sunCore: '#F0C4A0',
    moon: '#C8B4B8',
    earth: '#4A6A72',
    star: '#E8C8C4',
  },
  yamaganda: {
    skyDeep: '#0C0603',
    skyMid: '#2C160C',
    glow: '#A04A22',
    orbit: '#7A4A2C',
    sun: '#D46832',
    sunCore: '#F2D2A8',
    moon: '#D0C0B0',
    earth: '#5A6E58',
    star: '#E8D4C0',
  },
  gulika: {
    skyDeep: '#070610',
    skyMid: '#1C1430',
    glow: '#6A4A8A',
    orbit: '#5A4878',
    sun: '#C4A070',
    sunCore: '#F0E0C8',
    moon: '#C8C0D8',
    earth: '#4A5A78',
    star: '#D8D0E8',
  },
  abhijit: {
    skyDeep: '#0A0804',
    skyMid: '#2A220E',
    glow: '#E0B040',
    orbit: '#C8A04A',
    sun: '#F0C44A',
    sunCore: '#FFF4C8',
    moon: '#E8DCC0',
    earth: '#5A7A68',
    star: '#F4E8C0',
  },
  labh: {
    skyDeep: '#040A08',
    skyMid: '#10241A',
    glow: '#3A8A58',
    orbit: '#3A6A4A',
    sun: '#E0C46A',
    sunCore: '#F8F0C8',
    moon: '#C8D8C8',
    earth: '#3A7A62',
    star: '#D0E8D4',
  },
  amrit: {
    skyDeep: '#04080C',
    skyMid: '#10242A',
    glow: '#7AD0D8',
    orbit: '#5A9AA4',
    sun: '#E8D8A0',
    sunCore: '#FFF8E8',
    moon: '#E8F0F4',
    earth: '#4A8A92',
    star: '#D8F0F4',
  },
  shubh: {
    skyDeep: '#0A0704',
    skyMid: '#26180C',
    glow: '#D4943A',
    orbit: '#B07A38',
    sun: '#E8A848',
    sunCore: '#FFE8B8',
    moon: '#E4D4B8',
    earth: '#5A7A60',
    star: '#F0E0C0',
  },
  other: {
    skyDeep: '#06070E',
    skyMid: '#141A2C',
    glow: '#5A6A9A',
    orbit: '#4A5A7A',
    sun: '#D4B878',
    sunCore: '#F4E8C8',
    moon: '#C8D0DC',
    earth: '#4A6A78',
    star: '#D0D8E8',
  },
};

/** Inauspicious windows sit in a heavier, duskier register. */
export const INAUSPICIOUS: ReadonlySet<WindowKind> = new Set([
  'rahu',
  'yamaganda',
  'gulika',
]);

export function windowPalette(windowKind: WindowKind): SkyPalette {
  return WINDOWS[windowKind];
}

export function resolvePalette(
  windowKind: WindowKind,
  verdict?: Verdict | null,
): SkyPalette {
  const base = WINDOWS[windowKind];
  if (verdict === 'now') {
    return {
      ...base,
      glow: WINDOWS.abhijit.glow,
      sun: WINDOWS.shubh.sun,
      sunCore: WINDOWS.abhijit.sunCore,
    };
  }
  if (verdict === 'wait') {
    return {
      ...base,
      glow: WINDOWS.gulika.glow,
      moon: WINDOWS.amrit.moon,
      skyMid: WINDOWS.other.skyMid,
    };
  }
  if (verdict === 'after') {
    return {
      ...base,
      orbit: WINDOWS.abhijit.orbit,
      glow: base.glow,
    };
  }
  return base;
}
