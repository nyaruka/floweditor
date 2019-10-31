module.exports = {
  input: ['src/**/*.{js,jsx,ts}', '!src/**/*.spec.{js,jsx}', '!src/i18n/**', '!**/node_modules/**'],
  output: './src/',
  options: {
    debug: true,
    func: {
      list: ['i18next.t', 'i18n.t'],
      extensions: ['.js', '.jsx', '.ts']
    },
    removeUnusedKeys: false,
    trans: {
      component: 'Trans',
      i18nKey: 'i18nKey',
      defaultsKey: 'defaults',
      extensions: ['.js', '.jsx'],
      fallbackKey: function(ns, value) {
        return value;
      },
      acorn: {
        ecmaVersion: 10,
        sourceType: 'module'
      }
    },
    lngs: ['en', 'pt', 'es'],
    ns: ['locale', 'resource'],
    defaultLng: 'en',
    defaultNs: 'resource',
    defaultValue: '__STRING_NOT_TRANSLATED__',
    resource: {
      loadPath: 'i18n/{{lng}}/{{ns}}.json',
      savePath: 'i18n/{{lng}}/{{ns}}.json',
      jsonIndent: 2,
      lineEnding: '\n'
    },
    nsSeparator: false,
    keySeparator: false,
    interpolation: {
      prefix: '{{',
      suffix: '}}'
    }
  }
};
