if (!self.define) {
  let e,
    t = {};
  const o = (o, n) => (
    (o = new URL(o + '.js', n).href),
    t[o] ||
      new Promise(t => {
        if ('document' in self) {
          const e = document.createElement('script');
          (e.src = o), (e.onload = t), document.head.appendChild(e);
        } else (e = o), importScripts(o), t();
      }).then(() => {
        let e = t[o];
        if (!e) throw new Error(`Module ${o} didn’t register its module`);
        return e;
      })
  );
  self.define = (n, s) => {
    const i = e || ('document' in self ? document.currentScript.src : '') || location.href;
    if (t[i]) return;
    let r = {};
    const l = e => o(e, i),
      d = { module: { uri: i }, exports: r, require: l };
    t[i] = Promise.all(n.map(e => d[e] || l(e))).then(e => (s(...e), r));
  };
}
define(['./workbox-919adfb7'], function(e) {
  'use strict';
  self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        { url: '105420e8.js', revision: 'db002f361d5c351ec662dc2052b884bf' },
        { url: 'templates/components-body.html', revision: '7cfe3e1345be036343e287dd98f7fbb7' },
        { url: 'templates/components-head.html', revision: '55a46ded2a81db082c9223793a993434' }
      ],
      {}
    ),
    e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL('/index.html'))),
    e.registerRoute('polyfills/*.js', new e.CacheFirst(), 'GET');
});
//# sourceMappingURL=sw.js.map
