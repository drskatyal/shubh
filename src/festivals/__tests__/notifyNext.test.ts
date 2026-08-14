import { describe, expect, it } from 'vitest';

import { FIXTURE_FESTIVALS } from '../../tathaastu/fixtures';
import { NEXT_FESTIVAL_ID, nextFestival, reminderForFestival, scheduleNextFestival } from '../notifyNext';

describe('next festival notification', () => {
  it('picks the next festival on or after today', () => {
    const next = nextFestival(FIXTURE_FESTIVALS, '2026-08-14');
    expect(next?.key).toBe('FESTIVAL_EKADASHI');
    expect(next?.date).toBe('2026-08-16');
  });

  it('builds an 08:00 local reminder and schedules it once', async () => {
    const festival = nextFestival(FIXTURE_FESTIVALS, '2026-08-14');
    expect(festival).toBeTruthy();
    const reminder = reminderForFestival(festival!, {
      lat: 28.6139,
      lon: 77.209,
      language: 'en',
      now: new Date('2026-08-14T06:00:00+05:30'),
    });
    expect(reminder?.id).toBe(NEXT_FESTIVAL_ID);
    expect(reminder?.title).toBe('Ekadashi');
    expect(reminder?.fireAt.toISOString()).toBe('2026-08-16T02:30:00.000Z');

    const calls: string[] = [];
    const scheduled = await scheduleNextFestival(FIXTURE_FESTIVALS, {
      lat: 28.6139,
      lon: 77.209,
      language: 'hi',
      todayIso: '2026-08-14',
      now: new Date('2026-08-14T06:00:00+05:30'),
      scheduler: {
        requestPermissions: async () => true,
        cancel: async (id) => {
          calls.push(`cancel:${id}`);
        },
        schedule: async (item) => {
          calls.push(`schedule:${item.title}`);
        },
      },
    });
    expect(scheduled?.title).toBe('Ekadashi');
    expect(calls).toEqual(['cancel:shubh.next-festival', 'schedule:Ekadashi']);
  });
});
