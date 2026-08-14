import { NativeModulesProxy, requireOptionalNativeModule } from 'expo-modules-core';

type GlanceNative = {
  writeGlance: (payload: string) => Promise<void>;
};

export function getGlanceNative(): GlanceNative | null {
  return (
    requireOptionalNativeModule<GlanceNative>('ShubhGlance') ??
    (NativeModulesProxy.ShubhGlance as GlanceNative | undefined) ??
    null
  );
}
