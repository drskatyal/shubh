import type { SkyState } from './skyState';

export type {
  Language,
  SkyClock,
  SkyKind,
  SkyState,
  SkyWindow,
} from './skyState';

/**
 * Clock/home owns the real implementation. Ask takes `sky` as a prop so
 * this can be wired after merge. Do not invent Rahu (or any) times here.
 */
export async function getSkyState(_input?: unknown): Promise<SkyState> {
  throw new Error(
    'getSkyState is implemented by the clock/home engine. Pass sky into AskSheet.',
  );
}
