const {
  AndroidConfig,
  withAndroidManifest,
  withDangerousMod,
} = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    return;
  }
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(from, to);
    } else {
      fs.copyFileSync(from, to);
    }
  }
}

function withAndroidWidgetFiles(config) {
  return withDangerousMod(config, [
    'android',
    async (cfg) => {
      const root = cfg.modRequest.projectRoot;
      const platform = cfg.modRequest.platformProjectRoot;
      copyDir(
        path.join(root, 'widget/android/res'),
        path.join(platform, 'app/src/main/res'),
      );
      const javaDest = path.join(
        platform,
        'app/src/main/java/ai/flowrad/shubh',
      );
      copyDir(path.join(root, 'widget/android/java'), javaDest);
      return cfg;
    },
  ]);
}

function withAndroidWidgetManifest(config) {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults;
    const app = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);
    app.receiver = app.receiver ?? [];
    const already = app.receiver.some(
      (item) => item.$['android:name'] === 'ai.flowrad.shubh.ShubhWidgetProvider',
    );
    if (!already) {
      app.receiver.push({
        $: {
          'android:name': 'ai.flowrad.shubh.ShubhWidgetProvider',
          'android:exported': 'true',
        },
        'intent-filter': [
          {
            action: [
              { $: { 'android:name': 'android.appwidget.action.APPWIDGET_UPDATE' } },
            ],
          },
        ],
        'meta-data': [
          {
            $: {
              'android:name': 'android.appwidget.provider',
              'android:resource': '@xml/shubh_widget_info',
            },
          },
        ],
      });
    }
    return cfg;
  });
}

function withIosWidgetSources(config) {
  return withDangerousMod(config, [
    'ios',
    async (cfg) => {
      const root = cfg.modRequest.projectRoot;
      const dest = path.join(cfg.modRequest.platformProjectRoot, 'ShubhWidget');
      copyDir(path.join(root, 'targets/ShubhWidget'), dest);
      return cfg;
    },
  ]);
}

function withShubhWidgets(config) {
  config = withAndroidWidgetFiles(config);
  config = withAndroidWidgetManifest(config);
  config = withIosWidgetSources(config);
  return config;
}

module.exports = withShubhWidgets;
