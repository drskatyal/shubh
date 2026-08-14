import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-native', () => ({
  Share: { share: vi.fn(async () => undefined) },
}));

import { Share } from 'react-native';
import { sharePanchang } from '../sharePanchang';

describe('sharePanchang', () => {
  beforeEach(() => {
    vi.mocked(Share.share).mockClear();
  });

  it('throws when the 1:1 image is not ready — no text fallback', async () => {
    await expect(sharePanchang('Shubh', async () => null)).rejects.toThrow(/not ready/i);
    expect(Share.share).not.toHaveBeenCalled();
  });

  it('throws when no capture is supplied', async () => {
    await expect(sharePanchang('Shubh')).rejects.toThrow(/not ready/i);
    expect(Share.share).not.toHaveBeenCalled();
  });
});
