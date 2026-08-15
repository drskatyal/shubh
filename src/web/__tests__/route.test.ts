import { describe, expect, it } from 'vitest';

import {
  almanacTabForLevel,
  levelForAlmanacTab,
  levelToHash,
  pathToLevel,
  shotToLevel,
} from '../route';

describe('web routes', () => {
  it('reads hash and path levels', () => {
    expect(pathToLevel('/', '#/muhurat', '')).toBe('muhurat');
    expect(pathToLevel('/matching', '', '')).toBe('matching');
    expect(pathToLevel('/', '', '?level=ask')).toBe('ask');
    expect(pathToLevel('/', '#/', '')).toBe('home');
  });

  it('maps shots onto product levels', () => {
    expect(shotToLevel('milan')).toBe('matching');
    expect(shotToLevel('confirm')).toBe('matching');
    expect(shotToLevel('home')).toBe('home');
  });

  it('round-trips almanac tabs', () => {
    expect(almanacTabForLevel('matching')).toBe('match');
    expect(levelForAlmanacTab('match')).toBe('matching');
    expect(levelToHash('festivals')).toBe('#/festivals');
    expect(levelToHash('home')).toBe('#/');
  });
});
