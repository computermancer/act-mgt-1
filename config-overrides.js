const { override, addWebpackModuleRule } = require('customize-cra');

module.exports = override(
  // Disable source map loading for react-datepicker
  (config) => {
    // Find and modify the source-map-loader rule
    const sourceMapRule = config.module.rules.find(
      rule => rule.enforce === 'pre' && rule.use?.some(use => use.loader?.includes('source-map-loader'))
    );

    if (sourceMapRule) {
      // Add react-datepicker to exclude list
      sourceMapRule.exclude = [
        ...(sourceMapRule.exclude || []),
        /node_modules\/react-datepicker/,
      ];
    }

    return config;
  },
  // Disable source maps in development
  process.env.NODE_ENV === 'development' && (config => {
    config.devtool = 'eval-source-map';
    return config;
  })
);
