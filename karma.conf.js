// Karma configuration
// Generated on Fri Sep 21 2018 16:06:36 GMT-0700 (PDT)

let BROWSERS = ['ChromeHeadless'];
if (process.env.BROWSER_STACK_USERNAME || process.env.TRAVIS)
  BROWSERS = ['bs_ie_11', 'bs_chrome_windows'];
const BS_PROJECT = 'equivalency';

module.exports = function(config) {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha'],

    // list of files / patterns to load in the browser
    files: ['index.js', '*.test.js'],

    // list of files / patterns to exclude
    exclude: ['index-chai.test.js'],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'index.js': ['webpack'],
      '*.test.js': ['webpack'],
    },
    webpack: {},
    webpackMiddleware: {
      stats: 'errors-only',
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: BROWSERS,

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,

    // Browserstack test won't run without this, even though it's empty.
    browserStack: {},
    customLaunchers: {
      bs_ie_11: {
        base: 'BrowserStack',
        browser: 'ie',
        browser_version: '11.0',
        build: 'bs_equivalency',
        name: 'bs_ie_11',
        os: 'Windows',
        os_version: '10',
        project: BS_PROJECT,
      },
      bs_chrome_windows: {
        base: 'BrowserStack',
        browser: 'chrome',
        build: 'bs_equivalency',
        name: 'bs_chrome_windows',
        os: 'Windows',
        os_version: '10',
        project: BS_PROJECT,
      },
    },
  });
};
