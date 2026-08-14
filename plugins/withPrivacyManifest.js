const { withXcodeProject, IOSConfig } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Copies PrivacyInfo.xcprivacy into the iOS project so location use is declared.
 */
function withPrivacyManifest(config) {
  return withXcodeProject(config, async (cfg) => {
    const projectRoot = cfg.modRequest.projectRoot;
    const source = path.join(projectRoot, 'PrivacyInfo.xcprivacy');
    if (!fs.existsSync(source)) {
      return cfg;
    }
    const projectName = IOSConfig.XcodeUtils.getProjectName(projectRoot);
    const destDir = path.join(cfg.modRequest.platformProjectRoot, projectName);
    if (!fs.existsSync(destDir)) {
      return cfg;
    }
    fs.copyFileSync(source, path.join(destDir, 'PrivacyInfo.xcprivacy'));
    return cfg;
  });
}

module.exports = withPrivacyManifest;
