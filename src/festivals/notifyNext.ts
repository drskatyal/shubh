import { timezoneFor, zonedInstant } from '../engine/time';
import type { Language } from '../i18n/strings';
import { civilFromIso } from '../tathaastu/dates';
import type { Festival } from '../tathaastu/types';

export const NEXT_FESTIVAL_ID = 'shubh.next-festival';

export type FestivalReminder = {
  id: string;
  title: string;
  body: string;
  fireAt: Date;
  festival: Festival;
};

export function nextFestival(festivals: Festival[], todayIso: string): Festival | null {
  return festivals
    .filter((fest) => fest.date >= todayIso)
    .sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name))[0] ?? null;
}

export function reminderForFestival(
  festival: Festival,
  input: { lat: number; lon: number; language: Language; now?: Date },
): FestivalReminder | null {
  const zone = timezoneFor(input.lat, input.lon);
  const civil = civilFromIso(festival.date);
  const fireAt = zonedInstant(zone, civil.year, civil.month, civil.day, 8, 0, 0);
  if (fireAt.getTime() <= (input.now ?? new Date()).getTime()) return null;
  const hi = input.language === 'hi';
  return {
    id: NEXT_FESTIVAL_ID,
    title: festival.name,
    body: hi ? `${festival.date} — आज का त्योहार` : `${festival.date} — festival today`,
    fireAt,
    festival,
  };
}

export type NotificationScheduler = {
  requestPermissions?: () => Promise<boolean>;
  cancel: (id: string) => Promise<void>;
  schedule: (reminder: FestivalReminder) => Promise<void>;
};

export async function scheduleNextFestival(
  festivals: Festival[],
  input: {
    lat: number;
    lon: number;
    language: Language;
    todayIso: string;
    now?: Date;
    scheduler?: NotificationScheduler;
  },
): Promise<FestivalReminder | null> {
  const festival = nextFestival(festivals, input.todayIso);
  const reminder = festival ? reminderForFestival(festival, input) : null;
  const scheduler = input.scheduler ?? createExpoScheduler();
  if (!scheduler) return reminder;
  try {
    if (scheduler.requestPermissions && !(await scheduler.requestPermissions())) {
      return reminder;
    }
    await scheduler.cancel(NEXT_FESTIVAL_ID);
    if (reminder) await scheduler.schedule(reminder);
  } catch {
    // Local notifications are best-effort. Missing native module must not crash.
  }
  return reminder;
}

function createExpoScheduler(): NotificationScheduler | null {
  try {
    // Lazy require so node tests do not load Expo.
    const Notifications = require('expo-notifications') as {
      requestPermissionsAsync?: () => Promise<{ status?: string; granted?: boolean }>;
      cancelScheduledNotificationAsync?: (id: string) => Promise<void>;
      scheduleNotificationAsync?: (request: {
        identifier?: string;
        content: { title: string; body: string };
        trigger: { type?: string; date: Date } | Date;
      }) => Promise<string>;
    };
    return {
      requestPermissions: async () => {
        if (!Notifications.requestPermissionsAsync) return true;
        const result = await Notifications.requestPermissionsAsync();
        return result.granted === true || result.status === 'granted';
      },
      cancel: async (id) => {
        await Notifications.cancelScheduledNotificationAsync?.(id);
      },
      schedule: async (reminder) => {
        await Notifications.scheduleNotificationAsync?.({
          identifier: reminder.id,
          content: { title: reminder.title, body: reminder.body },
          trigger: { type: 'date', date: reminder.fireAt },
        });
      },
    };
  } catch {
    return null;
  }
}
