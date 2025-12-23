const { withInfoPlist, withEntitlementsPlist, withXcodeProject } = require('@expo/config-plugins');

const APP_GROUP_ID = 'group.com.social.tether';

const withAppGroups = (config) => {
  config = withEntitlementsPlist(config, (config) => {
    config.modResults['com.apple.security.application-groups'] = [APP_GROUP_ID];
    return config;
  });

  return config;
};

const withWidgetExtension = (config) => {
  config = withAppGroups(config);

  config = withXcodeProject(config, async (config) => {
    const xcodeProject = config.modResults;

    return config;
  });

  return config;
};

module.exports = withWidgetExtension;
