/* eslint-disable @typescript-eslint/no-var-requires */
// const fs = require('fs');
var typescriptTransform = require('i18next-scanner-typescript');

// eslint-disable-next-line no-undef
module.exports = {
  input: ['src/**/*.{js,jsx,ts,tsx}', '!src/**/*.test.*', '!src/i18n/**', '!**/node_modules/**'],
  output: './src/config/',
  options: {
    sort: true,
    debug: true,
    func: {
      list: ['i18n.t'],
      extensions: ['.js', '.ts', '.tsx']
    },
    removeUnusedKeys: true,
    trans: {
      component: 'Trans'
    },
    lngs: ['dev'],
    ns: ['defaults'],
    defaultLng: 'dev',
    defaultNs: 'defaults',
    resource: {
      loadPath: 'i18n/[[ns]].json',
      savePath: 'i18n/[[ns]].json',
      jsonIndent: 2,
      lineEnding: '\n'
    },
    // nsSeparator: false,
    // keySeparator: false,
    interpolation: {
      prefix: '[[',
      suffix: ']]'
    }
  },
  transform: typescriptTransform({ extensions: ['.tsx'] })
  /* transform: function(file, enc, done) {
    const parser = this.parser;
    const content = fs.readFileSync(file.path, enc);
    parser.parseFuncFromString(content, { list: ['i18n.t'] }, function(key) {
      parser.set(key, key);
    });

    done();
  }*/
};
