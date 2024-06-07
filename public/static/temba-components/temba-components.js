!(function() {
  'use strict';
  function t(t, e, i, o) {
    var n,
      s = arguments.length,
      r = s < 3 ? e : null === o ? (o = Object.getOwnPropertyDescriptor(e, i)) : o;
    if ('object' == typeof Reflect && 'function' == typeof Reflect.decorate)
      r = Reflect.decorate(t, e, i, o);
    else
      for (var a = t.length - 1; a >= 0; a--)
        (n = t[a]) && (r = (s < 3 ? n(r) : s > 3 ? n(e, i, r) : n(e, i)) || r);
    return s > 3 && r && Object.defineProperty(e, i, r), r;
  }
  'function' == typeof SuppressedError && SuppressedError;
  /**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
  const e = globalThis,
    i =
      e.ShadowRoot &&
      (void 0 === e.ShadyCSS || e.ShadyCSS.nativeShadow) &&
      'adoptedStyleSheets' in Document.prototype &&
      'replace' in CSSStyleSheet.prototype,
    o = Symbol(),
    n = new WeakMap();
  let s = class {
    constructor(t, e, i) {
      if (((this._$cssResult$ = !0), i !== o))
        throw Error('CSSResult is not constructable. Use `unsafeCSS` or `css` instead.');
      (this.cssText = t), (this.t = e);
    }
    get styleSheet() {
      let t = this.o;
      const e = this.t;
      if (i && void 0 === t) {
        const i = void 0 !== e && 1 === e.length;
        i && (t = n.get(e)),
          void 0 === t &&
            ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), i && n.set(e, t));
      }
      return t;
    }
    toString() {
      return this.cssText;
    }
  };
  const r = (t, ...e) => {
      const i =
        1 === t.length
          ? t[0]
          : e.reduce(
              (e, i, o) =>
                e +
                (t => {
                  if (!0 === t._$cssResult$) return t.cssText;
                  if ('number' == typeof t) return t;
                  throw Error(
                    "Value passed to 'css' function must be a 'css' function result: " +
                      t +
                      ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security."
                  );
                })(i) +
                t[o + 1],
              t[0]
            );
      return new s(i, t, o);
    },
    a = i
      ? t => t
      : t =>
          t instanceof CSSStyleSheet
            ? (t => {
                let e = '';
                for (const i of t.cssRules) e += i.cssText;
                return (t => new s('string' == typeof t ? t : t + '', void 0, o))(e);
              })(t)
            : t,
    /**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */ {
      is: l,
      defineProperty: h,
      getOwnPropertyDescriptor: c,
      getOwnPropertyNames: d,
      getOwnPropertySymbols: u,
      getPrototypeOf: p
    } = Object,
    m = globalThis,
    g = m.trustedTypes,
    f = g ? g.emptyScript : '',
    v = m.reactiveElementPolyfillSupport,
    b = (t, e) => t,
    y = {
      toAttribute(t, e) {
        switch (e) {
          case Boolean:
            t = t ? f : null;
            break;
          case Object:
          case Array:
            t = null == t ? t : JSON.stringify(t);
        }
        return t;
      },
      fromAttribute(t, e) {
        let i = t;
        switch (e) {
          case Boolean:
            i = null !== t;
            break;
          case Number:
            i = null === t ? null : Number(t);
            break;
          case Object:
          case Array:
            try {
              i = JSON.parse(t);
            } catch (t) {
              i = null;
            }
        }
        return i;
      }
    },
    _ = (t, e) => !l(t, e),
    x = { attribute: !0, type: String, converter: y, reflect: !1, hasChanged: _ };
  (Symbol.metadata ??= Symbol('metadata')), (m.litPropertyMetadata ??= new WeakMap());
  class w extends HTMLElement {
    static addInitializer(t) {
      this._$Ei(), (this.l ??= []).push(t);
    }
    static get observedAttributes() {
      return this.finalize(), this._$Eh && [...this._$Eh.keys()];
    }
    static createProperty(t, e = x) {
      if (
        (e.state && (e.attribute = !1),
        this._$Ei(),
        this.elementProperties.set(t, e),
        !e.noAccessor)
      ) {
        const i = Symbol(),
          o = this.getPropertyDescriptor(t, i, e);
        void 0 !== o && h(this.prototype, t, o);
      }
    }
    static getPropertyDescriptor(t, e, i) {
      const { get: o, set: n } = c(this.prototype, t) ?? {
        get() {
          return this[e];
        },
        set(t) {
          this[e] = t;
        }
      };
      return {
        get() {
          return o?.call(this);
        },
        set(e) {
          const s = o?.call(this);
          n.call(this, e), this.requestUpdate(t, s, i);
        },
        configurable: !0,
        enumerable: !0
      };
    }
    static getPropertyOptions(t) {
      return this.elementProperties.get(t) ?? x;
    }
    static _$Ei() {
      if (this.hasOwnProperty(b('elementProperties'))) return;
      const t = p(this);
      t.finalize(),
        void 0 !== t.l && (this.l = [...t.l]),
        (this.elementProperties = new Map(t.elementProperties));
    }
    static finalize() {
      if (this.hasOwnProperty(b('finalized'))) return;
      if (((this.finalized = !0), this._$Ei(), this.hasOwnProperty(b('properties')))) {
        const t = this.properties,
          e = [...d(t), ...u(t)];
        for (const i of e) this.createProperty(i, t[i]);
      }
      const t = this[Symbol.metadata];
      if (null !== t) {
        const e = litPropertyMetadata.get(t);
        if (void 0 !== e) for (const [t, i] of e) this.elementProperties.set(t, i);
      }
      this._$Eh = new Map();
      for (const [t, e] of this.elementProperties) {
        const i = this._$Eu(t, e);
        void 0 !== i && this._$Eh.set(i, t);
      }
      this.elementStyles = this.finalizeStyles(this.styles);
    }
    static finalizeStyles(t) {
      const e = [];
      if (Array.isArray(t)) {
        const i = new Set(t.flat(1 / 0).reverse());
        for (const t of i) e.unshift(a(t));
      } else void 0 !== t && e.push(a(t));
      return e;
    }
    static _$Eu(t, e) {
      const i = e.attribute;
      return !1 === i
        ? void 0
        : 'string' == typeof i
        ? i
        : 'string' == typeof t
        ? t.toLowerCase()
        : void 0;
    }
    constructor() {
      super(),
        (this._$Ep = void 0),
        (this.isUpdatePending = !1),
        (this.hasUpdated = !1),
        (this._$Em = null),
        this._$Ev();
    }
    _$Ev() {
      (this._$ES = new Promise(t => (this.enableUpdating = t))),
        (this._$AL = new Map()),
        this._$E_(),
        this.requestUpdate(),
        this.constructor.l?.forEach(t => t(this));
    }
    addController(t) {
      (this._$EO ??= new Set()).add(t),
        void 0 !== this.renderRoot && this.isConnected && t.hostConnected?.();
    }
    removeController(t) {
      this._$EO?.delete(t);
    }
    _$E_() {
      const t = new Map(),
        e = this.constructor.elementProperties;
      for (const i of e.keys()) this.hasOwnProperty(i) && (t.set(i, this[i]), delete this[i]);
      t.size > 0 && (this._$Ep = t);
    }
    createRenderRoot() {
      const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
      return (
        ((t, o) => {
          if (i) t.adoptedStyleSheets = o.map(t => (t instanceof CSSStyleSheet ? t : t.styleSheet));
          else
            for (const i of o) {
              const o = document.createElement('style'),
                n = e.litNonce;
              void 0 !== n && o.setAttribute('nonce', n),
                (o.textContent = i.cssText),
                t.appendChild(o);
            }
        })(t, this.constructor.elementStyles),
        t
      );
    }
    connectedCallback() {
      (this.renderRoot ??= this.createRenderRoot()),
        this.enableUpdating(!0),
        this._$EO?.forEach(t => t.hostConnected?.());
    }
    enableUpdating(t) {}
    disconnectedCallback() {
      this._$EO?.forEach(t => t.hostDisconnected?.());
    }
    attributeChangedCallback(t, e, i) {
      this._$AK(t, i);
    }
    _$EC(t, e) {
      const i = this.constructor.elementProperties.get(t),
        o = this.constructor._$Eu(t, i);
      if (void 0 !== o && !0 === i.reflect) {
        const n = (void 0 !== i.converter?.toAttribute ? i.converter : y).toAttribute(e, i.type);
        (this._$Em = t),
          null == n ? this.removeAttribute(o) : this.setAttribute(o, n),
          (this._$Em = null);
      }
    }
    _$AK(t, e) {
      const i = this.constructor,
        o = i._$Eh.get(t);
      if (void 0 !== o && this._$Em !== o) {
        const t = i.getPropertyOptions(o),
          n =
            'function' == typeof t.converter
              ? { fromAttribute: t.converter }
              : void 0 !== t.converter?.fromAttribute
              ? t.converter
              : y;
        (this._$Em = o), (this[o] = n.fromAttribute(e, t.type)), (this._$Em = null);
      }
    }
    requestUpdate(t, e, i) {
      if (void 0 !== t) {
        if (((i ??= this.constructor.getPropertyOptions(t)), !(i.hasChanged ?? _)(this[t], e)))
          return;
        this.P(t, e, i);
      }
      !1 === this.isUpdatePending && (this._$ES = this._$ET());
    }
    P(t, e, i) {
      this._$AL.has(t) || this._$AL.set(t, e),
        !0 === i.reflect && this._$Em !== t && (this._$Ej ??= new Set()).add(t);
    }
    async _$ET() {
      this.isUpdatePending = !0;
      try {
        await this._$ES;
      } catch (t) {
        Promise.reject(t);
      }
      const t = this.scheduleUpdate();
      return null != t && (await t), !this.isUpdatePending;
    }
    scheduleUpdate() {
      return this.performUpdate();
    }
    performUpdate() {
      if (!this.isUpdatePending) return;
      if (!this.hasUpdated) {
        if (((this.renderRoot ??= this.createRenderRoot()), this._$Ep)) {
          for (const [t, e] of this._$Ep) this[t] = e;
          this._$Ep = void 0;
        }
        const t = this.constructor.elementProperties;
        if (t.size > 0)
          for (const [e, i] of t)
            !0 !== i.wrapped || this._$AL.has(e) || void 0 === this[e] || this.P(e, this[e], i);
      }
      let t = !1;
      const e = this._$AL;
      try {
        (t = this.shouldUpdate(e)),
          t
            ? (this.willUpdate(e), this._$EO?.forEach(t => t.hostUpdate?.()), this.update(e))
            : this._$EU();
      } catch (e) {
        throw ((t = !1), this._$EU(), e);
      }
      t && this._$AE(e);
    }
    willUpdate(t) {}
    _$AE(t) {
      this._$EO?.forEach(t => t.hostUpdated?.()),
        this.hasUpdated || ((this.hasUpdated = !0), this.firstUpdated(t)),
        this.updated(t);
    }
    _$EU() {
      (this._$AL = new Map()), (this.isUpdatePending = !1);
    }
    get updateComplete() {
      return this.getUpdateComplete();
    }
    getUpdateComplete() {
      return this._$ES;
    }
    shouldUpdate(t) {
      return !0;
    }
    update(t) {
      (this._$Ej &&= this._$Ej.forEach(t => this._$EC(t, this[t]))), this._$EU();
    }
    updated(t) {}
    firstUpdated(t) {}
  }
  (w.elementStyles = []),
    (w.shadowRootOptions = { mode: 'open' }),
    (w[b('elementProperties')] = new Map()),
    (w[b('finalized')] = new Map()),
    v?.({ ReactiveElement: w }),
    (m.reactiveElementVersions ??= []).push('2.0.4');
  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
  const k = globalThis,
    A = k.trustedTypes,
    C = A ? A.createPolicy('lit-html', { createHTML: t => t }) : void 0,
    S = '$lit$',
    E = `lit$${(Math.random() + '').slice(9)}$`,
    T = '?' + E,
    $ = `<${T}>`,
    O = document,
    M = () => O.createComment(''),
    z = t => null === t || ('object' != typeof t && 'function' != typeof t),
    P = Array.isArray,
    D = t => P(t) || 'function' == typeof t?.[Symbol.iterator],
    I = '[ \t\n\f\r]',
    N = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,
    B = /-->/g,
    R = />/g,
    q = RegExp(`>|${I}(?:([^\\s"'>=/]+)(${I}*=${I}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, 'g'),
    U = /'/g,
    F = /"/g,
    Z = /^(?:script|style|textarea|title)$/i,
    j = (t => (e, ...i) => ({ _$litType$: t, strings: e, values: i }))(1),
    H = Symbol.for('lit-noChange'),
    V = Symbol.for('lit-nothing'),
    W = new WeakMap(),
    G = O.createTreeWalker(O, 129);
  function Q(t, e) {
    if (!Array.isArray(t) || !t.hasOwnProperty('raw'))
      throw Error('invalid template strings array');
    return void 0 !== C ? C.createHTML(e) : e;
  }
  const K = (t, e) => {
    const i = t.length - 1,
      o = [];
    let n,
      s = 2 === e ? '<svg>' : '',
      r = N;
    for (let e = 0; e < i; e++) {
      const i = t[e];
      let a,
        l,
        h = -1,
        c = 0;
      for (; c < i.length && ((r.lastIndex = c), (l = r.exec(i)), null !== l); )
        (c = r.lastIndex),
          r === N
            ? '!--' === l[1]
              ? (r = B)
              : void 0 !== l[1]
              ? (r = R)
              : void 0 !== l[2]
              ? (Z.test(l[2]) && (n = RegExp('</' + l[2], 'g')), (r = q))
              : void 0 !== l[3] && (r = q)
            : r === q
            ? '>' === l[0]
              ? ((r = n ?? N), (h = -1))
              : void 0 === l[1]
              ? (h = -2)
              : ((h = r.lastIndex - l[2].length),
                (a = l[1]),
                (r = void 0 === l[3] ? q : '"' === l[3] ? F : U))
            : r === F || r === U
            ? (r = q)
            : r === B || r === R
            ? (r = N)
            : ((r = q), (n = void 0));
      const d = r === q && t[e + 1].startsWith('/>') ? ' ' : '';
      s +=
        r === N
          ? i + $
          : h >= 0
          ? (o.push(a), i.slice(0, h) + S + i.slice(h) + E + d)
          : i + E + (-2 === h ? e : d);
    }
    return [Q(t, s + (t[i] || '<?>') + (2 === e ? '</svg>' : '')), o];
  };
  class Y {
    constructor({ strings: t, _$litType$: e }, i) {
      let o;
      this.parts = [];
      let n = 0,
        s = 0;
      const r = t.length - 1,
        a = this.parts,
        [l, h] = K(t, e);
      if (((this.el = Y.createElement(l, i)), (G.currentNode = this.el.content), 2 === e)) {
        const t = this.el.content.firstChild;
        t.replaceWith(...t.childNodes);
      }
      for (; null !== (o = G.nextNode()) && a.length < r; ) {
        if (1 === o.nodeType) {
          if (o.hasAttributes())
            for (const t of o.getAttributeNames())
              if (t.endsWith(S)) {
                const e = h[s++],
                  i = o.getAttribute(t).split(E),
                  r = /([.?@])?(.*)/.exec(e);
                a.push({
                  type: 1,
                  index: n,
                  name: r[2],
                  strings: i,
                  ctor: '.' === r[1] ? it : '?' === r[1] ? ot : '@' === r[1] ? nt : et
                }),
                  o.removeAttribute(t);
              } else t.startsWith(E) && (a.push({ type: 6, index: n }), o.removeAttribute(t));
          if (Z.test(o.tagName)) {
            const t = o.textContent.split(E),
              e = t.length - 1;
            if (e > 0) {
              o.textContent = A ? A.emptyScript : '';
              for (let i = 0; i < e; i++)
                o.append(t[i], M()), G.nextNode(), a.push({ type: 2, index: ++n });
              o.append(t[e], M());
            }
          }
        } else if (8 === o.nodeType)
          if (o.data === T) a.push({ type: 2, index: n });
          else {
            let t = -1;
            for (; -1 !== (t = o.data.indexOf(E, t + 1)); )
              a.push({ type: 7, index: n }), (t += E.length - 1);
          }
        n++;
      }
    }
    static createElement(t, e) {
      const i = O.createElement('template');
      return (i.innerHTML = t), i;
    }
  }
  function J(t, e, i = t, o) {
    if (e === H) return e;
    let n = void 0 !== o ? i._$Co?.[o] : i._$Cl;
    const s = z(e) ? void 0 : e._$litDirective$;
    return (
      n?.constructor !== s &&
        (n?._$AO?.(!1),
        void 0 === s ? (n = void 0) : ((n = new s(t)), n._$AT(t, i, o)),
        void 0 !== o ? ((i._$Co ??= [])[o] = n) : (i._$Cl = n)),
      void 0 !== n && (e = J(t, n._$AS(t, e.values), n, o)),
      e
    );
  }
  class X {
    constructor(t, e) {
      (this._$AV = []), (this._$AN = void 0), (this._$AD = t), (this._$AM = e);
    }
    get parentNode() {
      return this._$AM.parentNode;
    }
    get _$AU() {
      return this._$AM._$AU;
    }
    u(t) {
      const {
          el: { content: e },
          parts: i
        } = this._$AD,
        o = (t?.creationScope ?? O).importNode(e, !0);
      G.currentNode = o;
      let n = G.nextNode(),
        s = 0,
        r = 0,
        a = i[0];
      for (; void 0 !== a; ) {
        if (s === a.index) {
          let e;
          2 === a.type
            ? (e = new tt(n, n.nextSibling, this, t))
            : 1 === a.type
            ? (e = new a.ctor(n, a.name, a.strings, this, t))
            : 6 === a.type && (e = new st(n, this, t)),
            this._$AV.push(e),
            (a = i[++r]);
        }
        s !== a?.index && ((n = G.nextNode()), s++);
      }
      return (G.currentNode = O), o;
    }
    p(t) {
      let e = 0;
      for (const i of this._$AV)
        void 0 !== i &&
          (void 0 !== i.strings ? (i._$AI(t, i, e), (e += i.strings.length - 2)) : i._$AI(t[e])),
          e++;
    }
  }
  class tt {
    get _$AU() {
      return this._$AM?._$AU ?? this._$Cv;
    }
    constructor(t, e, i, o) {
      (this.type = 2),
        (this._$AH = V),
        (this._$AN = void 0),
        (this._$AA = t),
        (this._$AB = e),
        (this._$AM = i),
        (this.options = o),
        (this._$Cv = o?.isConnected ?? !0);
    }
    get parentNode() {
      let t = this._$AA.parentNode;
      const e = this._$AM;
      return void 0 !== e && 11 === t?.nodeType && (t = e.parentNode), t;
    }
    get startNode() {
      return this._$AA;
    }
    get endNode() {
      return this._$AB;
    }
    _$AI(t, e = this) {
      (t = J(this, t, e)),
        z(t)
          ? t === V || null == t || '' === t
            ? (this._$AH !== V && this._$AR(), (this._$AH = V))
            : t !== this._$AH && t !== H && this._(t)
          : void 0 !== t._$litType$
          ? this.$(t)
          : void 0 !== t.nodeType
          ? this.T(t)
          : D(t)
          ? this.k(t)
          : this._(t);
    }
    S(t) {
      return this._$AA.parentNode.insertBefore(t, this._$AB);
    }
    T(t) {
      this._$AH !== t && (this._$AR(), (this._$AH = this.S(t)));
    }
    _(t) {
      this._$AH !== V && z(this._$AH)
        ? (this._$AA.nextSibling.data = t)
        : this.T(O.createTextNode(t)),
        (this._$AH = t);
    }
    $(t) {
      const { values: e, _$litType$: i } = t,
        o =
          'number' == typeof i
            ? this._$AC(t)
            : (void 0 === i.el && (i.el = Y.createElement(Q(i.h, i.h[0]), this.options)), i);
      if (this._$AH?._$AD === o) this._$AH.p(e);
      else {
        const t = new X(o, this),
          i = t.u(this.options);
        t.p(e), this.T(i), (this._$AH = t);
      }
    }
    _$AC(t) {
      let e = W.get(t.strings);
      return void 0 === e && W.set(t.strings, (e = new Y(t))), e;
    }
    k(t) {
      P(this._$AH) || ((this._$AH = []), this._$AR());
      const e = this._$AH;
      let i,
        o = 0;
      for (const n of t)
        o === e.length
          ? e.push((i = new tt(this.S(M()), this.S(M()), this, this.options)))
          : (i = e[o]),
          i._$AI(n),
          o++;
      o < e.length && (this._$AR(i && i._$AB.nextSibling, o), (e.length = o));
    }
    _$AR(t = this._$AA.nextSibling, e) {
      for (this._$AP?.(!1, !0, e); t && t !== this._$AB; ) {
        const e = t.nextSibling;
        t.remove(), (t = e);
      }
    }
    setConnected(t) {
      void 0 === this._$AM && ((this._$Cv = t), this._$AP?.(t));
    }
  }
  class et {
    get tagName() {
      return this.element.tagName;
    }
    get _$AU() {
      return this._$AM._$AU;
    }
    constructor(t, e, i, o, n) {
      (this.type = 1),
        (this._$AH = V),
        (this._$AN = void 0),
        (this.element = t),
        (this.name = e),
        (this._$AM = o),
        (this.options = n),
        i.length > 2 || '' !== i[0] || '' !== i[1]
          ? ((this._$AH = Array(i.length - 1).fill(new String())), (this.strings = i))
          : (this._$AH = V);
    }
    _$AI(t, e = this, i, o) {
      const n = this.strings;
      let s = !1;
      if (void 0 === n)
        (t = J(this, t, e, 0)), (s = !z(t) || (t !== this._$AH && t !== H)), s && (this._$AH = t);
      else {
        const o = t;
        let r, a;
        for (t = n[0], r = 0; r < n.length - 1; r++)
          (a = J(this, o[i + r], e, r)),
            a === H && (a = this._$AH[r]),
            (s ||= !z(a) || a !== this._$AH[r]),
            a === V ? (t = V) : t !== V && (t += (a ?? '') + n[r + 1]),
            (this._$AH[r] = a);
      }
      s && !o && this.j(t);
    }
    j(t) {
      t === V
        ? this.element.removeAttribute(this.name)
        : this.element.setAttribute(this.name, t ?? '');
    }
  }
  class it extends et {
    constructor() {
      super(...arguments), (this.type = 3);
    }
    j(t) {
      this.element[this.name] = t === V ? void 0 : t;
    }
  }
  class ot extends et {
    constructor() {
      super(...arguments), (this.type = 4);
    }
    j(t) {
      this.element.toggleAttribute(this.name, !!t && t !== V);
    }
  }
  class nt extends et {
    constructor(t, e, i, o, n) {
      super(t, e, i, o, n), (this.type = 5);
    }
    _$AI(t, e = this) {
      if ((t = J(this, t, e, 0) ?? V) === H) return;
      const i = this._$AH,
        o =
          (t === V && i !== V) ||
          t.capture !== i.capture ||
          t.once !== i.once ||
          t.passive !== i.passive,
        n = t !== V && (i === V || o);
      o && this.element.removeEventListener(this.name, this, i),
        n && this.element.addEventListener(this.name, this, t),
        (this._$AH = t);
    }
    handleEvent(t) {
      'function' == typeof this._$AH
        ? this._$AH.call(this.options?.host ?? this.element, t)
        : this._$AH.handleEvent(t);
    }
  }
  let st = class {
    constructor(t, e, i) {
      (this.element = t),
        (this.type = 6),
        (this._$AN = void 0),
        (this._$AM = e),
        (this.options = i);
    }
    get _$AU() {
      return this._$AM._$AU;
    }
    _$AI(t) {
      J(this, t);
    }
  };
  const rt = {
      P: S,
      A: E,
      C: T,
      M: 1,
      L: K,
      R: X,
      D: D,
      V: J,
      I: tt,
      H: et,
      N: ot,
      U: nt,
      B: it,
      F: st
    },
    at = k.litHtmlPolyfillSupport;
  at?.(Y, tt), (k.litHtmlVersions ??= []).push('3.1.2');
  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
  let lt = class extends w {
    constructor() {
      super(...arguments), (this.renderOptions = { host: this }), (this._$Do = void 0);
    }
    createRenderRoot() {
      const t = super.createRenderRoot();
      return (this.renderOptions.renderBefore ??= t.firstChild), t;
    }
    update(t) {
      const e = this.render();
      this.hasUpdated || (this.renderOptions.isConnected = this.isConnected),
        super.update(t),
        (this._$Do = ((t, e, i) => {
          const o = i?.renderBefore ?? e;
          let n = o._$litPart$;
          if (void 0 === n) {
            const t = i?.renderBefore ?? null;
            o._$litPart$ = n = new tt(e.insertBefore(M(), t), t, void 0, i ?? {});
          }
          return n._$AI(t), n;
        })(e, this.renderRoot, this.renderOptions));
    }
    connectedCallback() {
      super.connectedCallback(), this._$Do?.setConnected(!0);
    }
    disconnectedCallback() {
      super.disconnectedCallback(), this._$Do?.setConnected(!1);
    }
    render() {
      return H;
    }
  };
  (lt._$litElement$ = !0),
    (lt.finalized = !0),
    globalThis.litElementHydrateSupport?.({ LitElement: lt });
  const ht = globalThis.litElementPolyfillSupport;
  ht?.({ LitElement: lt }), (globalThis.litElementVersions ??= []).push('4.0.4');
  var ct,
    dt,
    ut,
    pt,
    mt,
    gt,
    ft,
    vt,
    bt,
    yt,
    _t,
    xt,
    wt,
    kt,
    At,
    Ct,
    St,
    Et,
    Tt = function(t, e, i) {
      if (!e.has(t)) throw new TypeError('attempted to set private field on non-instance');
      return e.set(t, i), i;
    },
    $t = function(t, e) {
      if (!e.has(t)) throw new TypeError('attempted to get private field on non-instance');
      return e.get(t);
    };
  const Ot = function(t) {
      var e = 0;
      t += 'x';
      var i = Math.floor(65745979961613.07);
      for (let o = 0; o < t.length; o++)
        e > i && (e = Math.floor(e / 137)), (e = 131 * e + t.charCodeAt(o));
      return e;
    },
    Mt = '0123456789abcdef'.split(''),
    Lt = [-2147483648, 8388608, 32768, 128],
    zt = [24, 16, 8, 0],
    Pt = [
      1116352408,
      1899447441,
      3049323471,
      3921009573,
      961987163,
      1508970993,
      2453635748,
      2870763221,
      3624381080,
      310598401,
      607225278,
      1426881987,
      1925078388,
      2162078206,
      2614888103,
      3248222580,
      3835390401,
      4022224774,
      264347078,
      604807628,
      770255983,
      1249150122,
      1555081692,
      1996064986,
      2554220882,
      2821834349,
      2952996808,
      3210313671,
      3336571891,
      3584528711,
      113926993,
      338241895,
      666307205,
      773529912,
      1294757372,
      1396182291,
      1695183700,
      1986661051,
      2177026350,
      2456956037,
      2730485921,
      2820302411,
      3259730800,
      3345764771,
      3516065817,
      3600352804,
      4094571909,
      275423344,
      430227734,
      506948616,
      659060556,
      883997877,
      958139571,
      1322822218,
      1537002063,
      1747873779,
      1955562222,
      2024104815,
      2227730452,
      2361852424,
      2428436474,
      2756734187,
      3204031479,
      3329325298
    ],
    Dt = [];
  class It {
    constructor(t = !1, e = !1) {
      ct.set(this, void 0),
        dt.set(this, void 0),
        ut.set(this, void 0),
        pt.set(this, void 0),
        mt.set(this, void 0),
        gt.set(this, void 0),
        ft.set(this, void 0),
        vt.set(this, void 0),
        bt.set(this, void 0),
        yt.set(this, void 0),
        _t.set(this, void 0),
        xt.set(this, void 0),
        wt.set(this, void 0),
        kt.set(this, void 0),
        At.set(this, void 0),
        Ct.set(this, void 0),
        St.set(this, 0),
        Et.set(this, void 0),
        this.init(t, e);
    }
    init(t, e) {
      e
        ? ((Dt[0] = Dt[16] = Dt[1] = Dt[2] = Dt[3] = Dt[4] = Dt[5] = Dt[6] = Dt[7] = Dt[8] = Dt[9] = Dt[10] = Dt[11] = Dt[12] = Dt[13] = Dt[14] = Dt[15] = 0),
          Tt(this, dt, Dt))
        : Tt(this, dt, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
        t
          ? (Tt(this, gt, 3238371032),
            Tt(this, ft, 914150663),
            Tt(this, vt, 812702999),
            Tt(this, bt, 4144912697),
            Tt(this, yt, 4290775857),
            Tt(this, _t, 1750603025),
            Tt(this, xt, 1694076839),
            Tt(this, wt, 3204075428))
          : (Tt(this, gt, 1779033703),
            Tt(this, ft, 3144134277),
            Tt(this, vt, 1013904242),
            Tt(this, bt, 2773480762),
            Tt(this, yt, 1359893119),
            Tt(this, _t, 2600822924),
            Tt(this, xt, 528734635),
            Tt(this, wt, 1541459225)),
        Tt(this, ct, Tt(this, Et, Tt(this, ut, Tt(this, At, 0)))),
        Tt(this, pt, Tt(this, kt, !1)),
        Tt(this, mt, !0),
        Tt(this, Ct, t);
    }
    update(t) {
      if ($t(this, pt)) return this;
      let e;
      e = t instanceof ArrayBuffer ? new Uint8Array(t) : t;
      let i = 0;
      const o = e.length,
        n = $t(this, dt);
      for (; i < o; ) {
        let t;
        if (
          ($t(this, kt) &&
            (Tt(this, kt, !1),
            (n[0] = $t(this, ct)),
            (n[16] = n[1] = n[2] = n[3] = n[4] = n[5] = n[6] = n[7] = n[8] = n[9] = n[10] = n[11] = n[12] = n[13] = n[14] = n[15] = 0)),
          'string' != typeof e)
        )
          for (t = $t(this, Et); i < o && t < 64; ++i) n[t >> 2] |= e[i] << zt[3 & t++];
        else
          for (t = $t(this, Et); i < o && t < 64; ++i) {
            let o = e.charCodeAt(i);
            o < 128
              ? (n[t >> 2] |= o << zt[3 & t++])
              : o < 2048
              ? ((n[t >> 2] |= (192 | (o >> 6)) << zt[3 & t++]),
                (n[t >> 2] |= (128 | (63 & o)) << zt[3 & t++]))
              : o < 55296 || o >= 57344
              ? ((n[t >> 2] |= (224 | (o >> 12)) << zt[3 & t++]),
                (n[t >> 2] |= (128 | ((o >> 6) & 63)) << zt[3 & t++]),
                (n[t >> 2] |= (128 | (63 & o)) << zt[3 & t++]))
              : ((o = 65536 + (((1023 & o) << 10) | (1023 & e.charCodeAt(++i)))),
                (n[t >> 2] |= (240 | (o >> 18)) << zt[3 & t++]),
                (n[t >> 2] |= (128 | ((o >> 12) & 63)) << zt[3 & t++]),
                (n[t >> 2] |= (128 | ((o >> 6) & 63)) << zt[3 & t++]),
                (n[t >> 2] |= (128 | (63 & o)) << zt[3 & t++]));
          }
        Tt(this, St, t),
          Tt(this, ut, $t(this, ut) + (t - $t(this, Et))),
          t >= 64
            ? (Tt(this, ct, n[16]), Tt(this, Et, t - 64), this.hash(), Tt(this, kt, !0))
            : Tt(this, Et, t);
      }
      return (
        $t(this, ut) > 4294967295 &&
          (Tt(this, At, $t(this, At) + (($t(this, ut) / 4294967296) | 0)),
          Tt(this, ut, $t(this, ut) % 4294967296)),
        this
      );
    }
    finalize() {
      if ($t(this, pt)) return;
      Tt(this, pt, !0);
      const t = $t(this, dt),
        e = $t(this, St);
      (t[16] = $t(this, ct)),
        (t[e >> 2] |= Lt[3 & e]),
        Tt(this, ct, t[16]),
        e >= 56 &&
          ($t(this, kt) || this.hash(),
          (t[0] = $t(this, ct)),
          (t[16] = t[1] = t[2] = t[3] = t[4] = t[5] = t[6] = t[7] = t[8] = t[9] = t[10] = t[11] = t[12] = t[13] = t[14] = t[15] = 0)),
        (t[14] = ($t(this, At) << 3) | ($t(this, ut) >>> 29)),
        (t[15] = $t(this, ut) << 3),
        this.hash();
    }
    hash() {
      let t = $t(this, gt),
        e = $t(this, ft),
        i = $t(this, vt),
        o = $t(this, bt),
        n = $t(this, yt),
        s = $t(this, _t),
        r = $t(this, xt),
        a = $t(this, wt);
      const l = $t(this, dt);
      let h, c, d, u, p, m, g, f, v, b;
      for (let t = 16; t < 64; ++t)
        (u = l[t - 15]),
          (h = ((u >>> 7) | (u << 25)) ^ ((u >>> 18) | (u << 14)) ^ (u >>> 3)),
          (u = l[t - 2]),
          (c = ((u >>> 17) | (u << 15)) ^ ((u >>> 19) | (u << 13)) ^ (u >>> 10)),
          (l[t] = (l[t - 16] + h + l[t - 7] + c) | 0);
      b = e & i;
      for (let y = 0; y < 64; y += 4)
        $t(this, mt)
          ? ($t(this, Ct)
              ? ((g = 300032),
                (u = l[0] - 1413257819),
                (a = (u - 150054599) | 0),
                (o = (u + 24177077) | 0))
              : ((g = 704751109),
                (u = l[0] - 210244248),
                (a = (u - 1521486534) | 0),
                (o = (u + 143694565) | 0)),
            Tt(this, mt, !1))
          : ((h = ((t >>> 2) | (t << 30)) ^ ((t >>> 13) | (t << 19)) ^ ((t >>> 22) | (t << 10))),
            (c = ((n >>> 6) | (n << 26)) ^ ((n >>> 11) | (n << 21)) ^ ((n >>> 25) | (n << 7))),
            (g = t & e),
            (d = g ^ (t & i) ^ b),
            (m = (n & s) ^ (~n & r)),
            (u = a + c + m + Pt[y] + l[y]),
            (p = h + d),
            (a = (o + u) | 0),
            (o = (u + p) | 0)),
          (h = ((o >>> 2) | (o << 30)) ^ ((o >>> 13) | (o << 19)) ^ ((o >>> 22) | (o << 10))),
          (c = ((a >>> 6) | (a << 26)) ^ ((a >>> 11) | (a << 21)) ^ ((a >>> 25) | (a << 7))),
          (f = o & t),
          (d = f ^ (o & e) ^ g),
          (m = (a & n) ^ (~a & s)),
          (u = r + c + m + Pt[y + 1] + l[y + 1]),
          (p = h + d),
          (r = (i + u) | 0),
          (i = (u + p) | 0),
          (h = ((i >>> 2) | (i << 30)) ^ ((i >>> 13) | (i << 19)) ^ ((i >>> 22) | (i << 10))),
          (c = ((r >>> 6) | (r << 26)) ^ ((r >>> 11) | (r << 21)) ^ ((r >>> 25) | (r << 7))),
          (v = i & o),
          (d = v ^ (i & t) ^ f),
          (m = (r & a) ^ (~r & n)),
          (u = s + c + m + Pt[y + 2] + l[y + 2]),
          (p = h + d),
          (s = (e + u) | 0),
          (e = (u + p) | 0),
          (h = ((e >>> 2) | (e << 30)) ^ ((e >>> 13) | (e << 19)) ^ ((e >>> 22) | (e << 10))),
          (c = ((s >>> 6) | (s << 26)) ^ ((s >>> 11) | (s << 21)) ^ ((s >>> 25) | (s << 7))),
          (b = e & i),
          (d = b ^ (e & o) ^ v),
          (m = (s & r) ^ (~s & a)),
          (u = n + c + m + Pt[y + 3] + l[y + 3]),
          (p = h + d),
          (n = (t + u) | 0),
          (t = (u + p) | 0);
      Tt(this, gt, ($t(this, gt) + t) | 0),
        Tt(this, ft, ($t(this, ft) + e) | 0),
        Tt(this, vt, ($t(this, vt) + i) | 0),
        Tt(this, bt, ($t(this, bt) + o) | 0),
        Tt(this, yt, ($t(this, yt) + n) | 0),
        Tt(this, _t, ($t(this, _t) + s) | 0),
        Tt(this, xt, ($t(this, xt) + r) | 0),
        Tt(this, wt, ($t(this, wt) + a) | 0);
    }
    hex() {
      this.finalize();
      const t = $t(this, gt),
        e = $t(this, ft),
        i = $t(this, vt),
        o = $t(this, bt),
        n = $t(this, yt),
        s = $t(this, _t),
        r = $t(this, xt),
        a = $t(this, wt);
      let l =
        Mt[(t >> 28) & 15] +
        Mt[(t >> 24) & 15] +
        Mt[(t >> 20) & 15] +
        Mt[(t >> 16) & 15] +
        Mt[(t >> 12) & 15] +
        Mt[(t >> 8) & 15] +
        Mt[(t >> 4) & 15] +
        Mt[15 & t] +
        Mt[(e >> 28) & 15] +
        Mt[(e >> 24) & 15] +
        Mt[(e >> 20) & 15] +
        Mt[(e >> 16) & 15] +
        Mt[(e >> 12) & 15] +
        Mt[(e >> 8) & 15] +
        Mt[(e >> 4) & 15] +
        Mt[15 & e] +
        Mt[(i >> 28) & 15] +
        Mt[(i >> 24) & 15] +
        Mt[(i >> 20) & 15] +
        Mt[(i >> 16) & 15] +
        Mt[(i >> 12) & 15] +
        Mt[(i >> 8) & 15] +
        Mt[(i >> 4) & 15] +
        Mt[15 & i] +
        Mt[(o >> 28) & 15] +
        Mt[(o >> 24) & 15] +
        Mt[(o >> 20) & 15] +
        Mt[(o >> 16) & 15] +
        Mt[(o >> 12) & 15] +
        Mt[(o >> 8) & 15] +
        Mt[(o >> 4) & 15] +
        Mt[15 & o] +
        Mt[(n >> 28) & 15] +
        Mt[(n >> 24) & 15] +
        Mt[(n >> 20) & 15] +
        Mt[(n >> 16) & 15] +
        Mt[(n >> 12) & 15] +
        Mt[(n >> 8) & 15] +
        Mt[(n >> 4) & 15] +
        Mt[15 & n] +
        Mt[(s >> 28) & 15] +
        Mt[(s >> 24) & 15] +
        Mt[(s >> 20) & 15] +
        Mt[(s >> 16) & 15] +
        Mt[(s >> 12) & 15] +
        Mt[(s >> 8) & 15] +
        Mt[(s >> 4) & 15] +
        Mt[15 & s] +
        Mt[(r >> 28) & 15] +
        Mt[(r >> 24) & 15] +
        Mt[(r >> 20) & 15] +
        Mt[(r >> 16) & 15] +
        Mt[(r >> 12) & 15] +
        Mt[(r >> 8) & 15] +
        Mt[(r >> 4) & 15] +
        Mt[15 & r];
      return (
        $t(this, Ct) ||
          (l +=
            Mt[(a >> 28) & 15] +
            Mt[(a >> 24) & 15] +
            Mt[(a >> 20) & 15] +
            Mt[(a >> 16) & 15] +
            Mt[(a >> 12) & 15] +
            Mt[(a >> 8) & 15] +
            Mt[(a >> 4) & 15] +
            Mt[15 & a]),
        l
      );
    }
    toString() {
      return this.hex();
    }
    digest() {
      this.finalize();
      const t = $t(this, gt),
        e = $t(this, ft),
        i = $t(this, vt),
        o = $t(this, bt),
        n = $t(this, yt),
        s = $t(this, _t),
        r = $t(this, xt),
        a = $t(this, wt),
        l = [
          (t >> 24) & 255,
          (t >> 16) & 255,
          (t >> 8) & 255,
          255 & t,
          (e >> 24) & 255,
          (e >> 16) & 255,
          (e >> 8) & 255,
          255 & e,
          (i >> 24) & 255,
          (i >> 16) & 255,
          (i >> 8) & 255,
          255 & i,
          (o >> 24) & 255,
          (o >> 16) & 255,
          (o >> 8) & 255,
          255 & o,
          (n >> 24) & 255,
          (n >> 16) & 255,
          (n >> 8) & 255,
          255 & n,
          (s >> 24) & 255,
          (s >> 16) & 255,
          (s >> 8) & 255,
          255 & s,
          (r >> 24) & 255,
          (r >> 16) & 255,
          (r >> 8) & 255,
          255 & r
        ];
      return $t(this, Ct) || l.push((a >> 24) & 255, (a >> 16) & 255, (a >> 8) & 255, 255 & a), l;
    }
    array() {
      return this.digest();
    }
    arrayBuffer() {
      this.finalize();
      const t = new ArrayBuffer($t(this, Ct) ? 28 : 32),
        e = new DataView(t);
      return (
        e.setUint32(0, $t(this, gt)),
        e.setUint32(4, $t(this, ft)),
        e.setUint32(8, $t(this, vt)),
        e.setUint32(12, $t(this, bt)),
        e.setUint32(16, $t(this, yt)),
        e.setUint32(20, $t(this, _t)),
        e.setUint32(24, $t(this, xt)),
        $t(this, Ct) || e.setUint32(28, $t(this, wt)),
        t
      );
    }
  }
  function Nt(t) {
    const e = new It();
    return e.update(t), parseInt(e.hex().substring(0, 8), 16);
  }
  (ct = new WeakMap()),
    (dt = new WeakMap()),
    (ut = new WeakMap()),
    (pt = new WeakMap()),
    (mt = new WeakMap()),
    (gt = new WeakMap()),
    (ft = new WeakMap()),
    (vt = new WeakMap()),
    (bt = new WeakMap()),
    (yt = new WeakMap()),
    (_t = new WeakMap()),
    (xt = new WeakMap()),
    (wt = new WeakMap()),
    (kt = new WeakMap()),
    (At = new WeakMap()),
    (Ct = new WeakMap()),
    (St = new WeakMap()),
    (Et = new WeakMap());
  const Bt = function(t, e, i) {
    var o = i < 0.5 ? i * (1 + e) : i + e - i * e,
      n = 2 * i - o;
    return [(t /= 360) + 1 / 3, t, t - 1 / 3].map(function(t) {
      return (
        t < 0 && t++,
        t > 1 && t--,
        (t =
          t < 1 / 6
            ? n + 6 * (o - n) * t
            : t < 0.5
            ? o
            : t < 2 / 3
            ? n + 6 * (o - n) * (2 / 3 - t)
            : n),
        Math.round(255 * t)
      );
    });
  };
  const Rt = '/api/v2/media.json',
    qt = new (class {
      constructor(t = {}) {
        const [e, i] = [t.lightness, t.saturation].map(function(t) {
          return (t = void 0 !== t ? t : [0.35, 0.5, 0.65]), Array.isArray(t) ? t.concat() : [t];
        });
        (this.L = e),
          (this.S = i),
          'number' == typeof t.hue && (t.hue = { min: t.hue, max: t.hue }),
          'object' != typeof t.hue || Array.isArray(t.hue) || (t.hue = [t.hue]),
          void 0 === t.hue && (t.hue = []),
          (this.hueRanges = t.hue.map(function(t) {
            return { min: void 0 === t.min ? 0 : t.min, max: void 0 === t.max ? 360 : t.max };
          })),
          (this.hash = Nt),
          'function' == typeof t.hash && (this.hash = t.hash),
          'bkdr' === t.hash && (this.hash = Ot);
      }
      hsl(t) {
        var e,
          i,
          o = this.hash(t);
        if (this.hueRanges.length) {
          const t = this.hueRanges[o % this.hueRanges.length];
          e = (((o / this.hueRanges.length) % 727) * (t.max - t.min)) / 727 + t.min;
        } else e = o % 359;
        return (
          (o = Math.ceil(o / 360)),
          (i = this.S[o % this.S.length]),
          (o = Math.ceil(o / this.S.length)),
          [e, i, this.L[o % this.L.length]]
        );
      }
      rgb(t) {
        var e = this.hsl(t);
        return Bt.apply(this, e);
      }
      hex(t) {
        var e,
          i = this.rgb(t);
        return (
          (e = '#'),
          i.forEach(function(t) {
            t < 16 && (e += 0), (e += t.toString(16));
          }),
          e
        );
      }
    })();
  var Ut;
  !(function(t) {
    (t.BLUE = 'color:#5078b5;'),
      (t.GREEN = 'color:#62bd6a;'),
      (t.RED = 'color:#e36049;'),
      (t.PURPLE = 'color:#a626a4;');
  })(Ut || (Ut = {}));
  const Ft = (t, e = '', i = []) => {
      '' !== e
        ? 'object' != typeof t
          ? console.log('%c' + t, e, ...i)
          : console.log('%c' + JSON.stringify(t, null, 2), e)
        : console.log(t);
    },
    Zt = (t = {}) => {
      let e = (t => {
        for (const e of document.cookie.split(';')) {
          const i = e.indexOf('=');
          let o = e.substr(0, i),
            n = e.substr(i + 1);
          if (((o = o.trim()), (n = n.trim()), o === t)) return n;
        }
        return null;
      })('csrftoken');
      if (!e) {
        const t = document.querySelector('[name=csrfmiddlewaretoken]');
        t && (e = t.value);
      }
      const i = e ? { 'X-CSRFToken': e } : {};
      return (
        (i['X-Requested-With'] = 'XMLHttpRequest'),
        Object.keys(t).forEach(e => {
          i[e] = t[e];
        }),
        i
      );
    },
    jt = (t, e = null, i = {}) =>
      new Promise((o, n) => {
        const s = { method: 'GET', headers: Zt(i) };
        e && (s.signal = e.signal),
          fetch(t, s)
            .then(t => {
              t.text().then(i => {
                let n = {};
                try {
                  n = JSON.parse(i);
                } catch (t) {}
                o({
                  controller: e,
                  body: i,
                  json: n,
                  url: t.url,
                  headers: t.headers,
                  status: t.status
                });
              });
            })
            .catch(t => {
              n(t);
            });
      }),
    Ht = t => {
      const e = [];
      Object.keys(t).forEach(i => {
        t[i] && e.push(i);
      });
      let i = e.join(' ');
      return i.trim().length > 0 && (i = ' ' + i), i.trim();
    },
    Vt = (t, e = null) =>
      new Promise((i, o) => {
        jt(t, e)
          .then(t => {
            i({ results: t.json.results, next: t.json.next });
          })
          .catch(t => o(t));
      }),
    Wt = async t => {
      if (!t) return new Promise(t => t([]));
      let e = [],
        i = t;
      for (; i; ) {
        const t = await Vt(i);
        t.results && (e = e.concat(t.results)), (i = t.next);
      }
      return e;
    },
    Gt = t =>
      new Promise((e, i) => {
        jt(t)
          .then(t => {
            t.status >= 200 && t.status < 300
              ? e({ assets: t.json.results, next: t.json.next })
              : i(t);
          })
          .catch(t => i(t));
      }),
    Qt = async t => {
      if (!t) return new Promise(t => t([]));
      let e = [],
        i = t;
      for (; i; ) {
        const t = await Gt(i);
        t.assets ? ((e = e.concat(t.assets)), (i = t.next)) : (i = null);
      }
      return e;
    },
    Kt = (t, e, i = {}, o = null) => {
      const n = Zt(i);
      o && (n['Content-Type'] = o);
      const s = { method: 'POST', headers: n, body: e };
      return new Promise((e, i) => {
        fetch(t, s)
          .then(async t => {
            if (t.status >= 500) return void i(t);
            const o = t.headers.get('x-temba-toasts');
            if (o) {
              const t = document.querySelector('temba-toast');
              t && t.addMessages(JSON.parse(o));
            }
            t.text().then(i => {
              let o = {};
              try {
                o = JSON.parse(i);
              } catch (t) {}
              e({
                body: i,
                json: o,
                headers: t.headers,
                status: t.status,
                redirected: t.redirected,
                url: t.url
              });
            });
          })
          .catch(t => {
            i(t);
          });
      });
    },
    Yt = (t, e) => Kt(t, JSON.stringify(e), !1, 'application/json'),
    Jt = (t, e, i = {}) =>
      new Promise((o, n) => {
        Kt(t, e, i)
          .then(e => {
            e.status >= 200 && e.status < 400 ? o(e) : n(t === Rt ? e : 'Server failure');
          })
          .catch(t => {
            console.error(t), n(t);
          });
      }),
    Xt = t => {
      const e = t.parentNode || t.host;
      if (e) {
        const t = e instanceof HTMLElement && window.getComputedStyle(e).overflowY,
          i = t && !(t.includes('hidden') || t.includes('visible'));
        return e ? (i && e.scrollHeight >= e.clientHeight ? e : Xt(e)) : null;
      }
      return null;
    },
    te = (t, e, i = !1) => {
      let o;
      return function(...n) {
        const s = this,
          r = i && !o;
        clearTimeout(o),
          (o = setTimeout(function() {
            (o = null), i || t.apply(s, n);
          }, e)),
          r && t.apply(s, n);
      };
    },
    ee = (t, e) => {
      let i = !0;
      return function(...o) {
        i &&
          ((i = !1),
          t.apply(this, o),
          setTimeout(() => {
            i = !0;
          }, e));
      };
    },
    ie = (t, e = 'and') =>
      1 === t.length
        ? t[0]
        : 2 === t.length
        ? 'object' == typeof t[0]
          ? j`${t[0]} ${e} ${t[1]}`
          : t.join(' ' + e + ' ')
        : 'object' == typeof t[0]
        ? t.map((i, o) => (o < t.length - 1 ? j`${i}, ` : j`${e} ${i}`))
        : t.join(', ') + e + t[t.length - 1],
    oe = (t, e, i = 'and') => ie(t.map(e), i),
    ne = t => {
      let e = null;
      if (document.cookie && '' != document.cookie) {
        const i = document.cookie.split(';');
        for (let o = 0; o < i.length; o++) {
          const n = i[o].trim();
          if (n.substring(0, t.length + 1) == t + '=') {
            e = decodeURIComponent(n.substring(t.length + 1));
            break;
          }
        }
      }
      return e;
    };
  var se;
  !(function(t) {
    (t.SETTINGS = 'settings'),
      (t.MENU_COLLAPSED = 'menu-collapsed'),
      (t.TICKET_SHOW_DETAILS = 'tickets.show-details');
  })(se || (se = {}));
  const re = ([t, ...e], i = navigator.language) =>
      void 0 === t ? '' : t.toLocaleUpperCase(i) + e.join(''),
    ae = t => {
      t && (t.stopPropagation(), t.preventDefault());
    },
    le = t => {
      let e = (t = t.trim()).match(/(([\p{L}\p{N}]+-[\p{L}\p{N}]+)|([\p{L}\p{N}]+))/gu) || [];
      if ((1 == e.length && (e = t.match(/[\p{L}\p{N}]+/gu)), 0 == e.length)) return '?';
      if (1 == e.length) return e[0].substring(0, 2).toUpperCase();
      const i = e.map(t => t.substring(0, 1)),
        o = i.filter((t, e) => t == t.toUpperCase() || 0 == e);
      return o.length >= 2 ? (o[0] + o[1]).toUpperCase() : (i[0] + i[1]).toUpperCase();
    },
    he = (t, e, i) => {
      i /= 100;
      const o = (e * Math.min(i, 1 - i)) / 100,
        n = e => {
          const n = (e + t / 30) % 12,
            s = i - o * Math.max(Math.min(n - 3, 9 - n, 1), -1);
          return Math.round(255 * s)
            .toString(16)
            .padStart(2, '0');
        };
      return `#${n(0)}${n(8)}${n(4)}`;
    },
    ce = (t, e, i = !1) => {
      if ((t.DEBUG_UPDATES || t.DEBUG) && e.size > 0) {
        const o = {};
        for (const i of e.keys()) o[i] = [e[i], t[i]];
        Ft(t.tagName, Ut.PURPLE, [i ? '<first-updated>' : '<updated>', o]);
      }
    },
    de = (t, e, i = void 0) => {
      (t.DEBUG_EVENTS || t.DEBUG) && Ft(t.tagName, Ut.GREEN, void 0 !== i ? [e, i] : [e]);
    };
  class ue extends lt {
    constructor() {
      super(...arguments),
        (this.DEBUG = !1),
        (this.DEBUG_UPDATES = !1),
        (this.DEBUG_EVENTS = !1),
        (this.eles = {});
    }
    getEventHandlers() {
      return [];
    }
    connectedCallback() {
      super.connectedCallback();
      for (const t of this.getEventHandlers())
        t.isDocument
          ? document.addEventListener(t.event, t.method.bind(this))
          : t.isWindow
          ? window.addEventListener(t.event, t.method.bind(this))
          : this.addEventListener(t.event, t.method.bind(this));
    }
    disconnectedCallback() {
      for (const t of this.getEventHandlers())
        t.isDocument
          ? document.removeEventListener(t.event, t.method)
          : t.isWindow
          ? window.removeEventListener(t.event, t.method)
          : this.removeEventListener(t.event, t.method);
      super.disconnectedCallback();
    }
    firstUpdated(t) {
      super.firstUpdated(t), ce(this, t, !0);
    }
    updated(t) {
      super.updated(t), ce(this, t, !1);
    }
    fireEvent(t) {
      return de(this, t), this.dispatchEvent(new Event(t, { bubbles: !0, composed: !0 }));
    }
    swallowEvent(t) {
      t.stopPropagation(), t.preventDefault();
    }
    fireCustomEvent(t, e = {}) {
      this.DEBUG_EVENTS && de(this, t, e);
      const i = new CustomEvent(t, { detail: e, bubbles: !0, composed: !0 });
      return this.dispatchEvent(i);
    }
    dispatchEvent(t) {
      super.dispatchEvent(t);
      const e = t.target;
      if (e) {
        const i = e['-' + t.type];
        if (i) return i(t);
        return new Function(
          'event',
          `\n          with(document) {\n            with(this) {\n              let handler = ${e.getAttribute(
            '-' + t.type
          )};\n              if(typeof handler === 'function') { \n                handler(event);\n              }\n            }\n          }\n        `
        ).call(e, t);
      }
    }
    closestElement(t, e = this) {
      return (function e(i) {
        if (!i || i === document || i === window) return null;
        i.assignedSlot && (i = i.assignedSlot);
        const o = i.closest(t);
        return o || e(i.getRootNode().host);
      })(e);
    }
    getDiv(t) {
      let e = this.eles[t];
      return e || ((e = this.shadowRoot.querySelector(t)), e && (this.eles[t] = e), e);
    }
    stopEvent(t) {
      t && (t.stopPropagation(), t.preventDefault());
    }
    isMobile() {
      const t = window;
      return !!t.isMobile && t.isMobile();
    }
  }
  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */ const pe = { attribute: !0, type: String, converter: y, reflect: !1, hasChanged: _ },
    me = (t = pe, e, i) => {
      const { kind: o, metadata: n } = i;
      let s = globalThis.litPropertyMetadata.get(n);
      if (
        (void 0 === s && globalThis.litPropertyMetadata.set(n, (s = new Map())),
        s.set(i.name, t),
        'accessor' === o)
      ) {
        const { name: o } = i;
        return {
          set(i) {
            const n = e.get.call(this);
            e.set.call(this, i), this.requestUpdate(o, n, t);
          },
          init(e) {
            return void 0 !== e && this.P(o, void 0, t), e;
          }
        };
      }
      if ('setter' === o) {
        const { name: o } = i;
        return function(i) {
          const n = this[o];
          e.call(this, i), this.requestUpdate(o, n, t);
        };
      }
      throw Error('Unsupported decorator location: ' + o);
    };
  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */ function ge(t) {
    return (e, i) =>
      'object' == typeof i
        ? me(t, e, i)
        : ((t, e, i) => {
            const o = e.hasOwnProperty(i);
            return (
              e.constructor.createProperty(i, o ? { ...t, wrapped: !0 } : t),
              o ? Object.getOwnPropertyDescriptor(e, i) : void 0
            );
          })(t, e, i);
  }
  class fe extends ue {
    constructor() {
      super(),
        (this.name = ''),
        (this.value = null),
        (this.inputRoot = this),
        (this.disabled = !1),
        (this.internals = this.attachInternals());
    }
    updated(t) {
      super.updated(t), t.has('value') && this.internals.setFormValue(this.value);
    }
    get form() {
      return this.internals.form;
    }
    setValue(t) {
      this.value = this.serializeValue(t);
    }
    getDeserializedValue() {
      return JSON.parse(this.value);
    }
    serializeValue(t) {
      return JSON.stringify(t);
    }
  }
  (fe.formAssociated = !0),
    t([ge({ type: String })], fe.prototype, 'name', void 0),
    t([ge({ type: String, attribute: 'help_text' })], fe.prototype, 'helpText', void 0),
    t([ge({ type: Boolean, attribute: 'help_always' })], fe.prototype, 'helpAlways', void 0),
    t([ge({ type: Boolean, attribute: 'widget_only' })], fe.prototype, 'widgetOnly', void 0),
    t([ge({ type: Boolean, attribute: 'hide_label' })], fe.prototype, 'hideLabel', void 0),
    t([ge({ type: String })], fe.prototype, 'label', void 0),
    t([ge({ type: Array })], fe.prototype, 'errors', void 0),
    t([ge({ type: String })], fe.prototype, 'value', void 0),
    t([ge({ attribute: !1 })], fe.prototype, 'inputRoot', void 0),
    t([ge({ type: Boolean })], fe.prototype, 'disabled', void 0);
  var ve;
  !(function(t) {
    (t.alert_warning = 'alert-square'),
      (t.account = 'user-01'),
      (t.active = 'play'),
      (t.add = 'plus'),
      (t.add_note = 'file-02'),
      (t.airtime = 'bank-note-01'),
      (t.analytics = 'bar-chart-01'),
      (t.archive = 'archive'),
      (t.arrow_up = 'chevron-up'),
      (t.arrow_down = 'chevron-down'),
      (t.arrow_left = 'chevron-left'),
      (t.arrow_right = 'chevron-right'),
      (t.attachment = 'paperclip'),
      (t.attachment_audio = 'volume-min'),
      (t.attachment_document = 'file-06'),
      (t.attachment_image = 'image-01'),
      (t.attachment_location = 'marker-pin-01'),
      (t.attachment_video = 'video-recorder'),
      (t.branding = 'brush-02'),
      (t.branding_hostname = 'server-05'),
      (t.branding_notifications = 'mail-01'),
      (t.branding_styling = 'palette'),
      (t.branding_raw = 'pencil-01'),
      (t.broadcast = 'announcement-01'),
      (t.call = 'phone-call-01'),
      (t.call_missed = 'phone-call-02'),
      (t.campaign = 'clock-refresh'),
      (t.campaign_active = 'play'),
      (t.campaign_archived = 'archive'),
      (t.campaigns = 'clock-refresh'),
      (t.channel = 'zap'),
      (t.children = 'git-branch-01'),
      (t.check = 'check'),
      (t.checkbox = 'square'),
      (t.checkbox_checked = 'check-square'),
      (t.checkbox_partial = 'stop-square'),
      (t.classifier_wit = 'classifier-wit'),
      (t.classifier_luis = 'classifier-luis'),
      (t.classifier_bothub = 'classifier-bothub'),
      (t.close = 'x'),
      (t.compose = 'send-01'),
      (t.contact = 'user-01'),
      (t.contact_archived = 'archive'),
      (t.contact_blocked = 'message-x-square'),
      (t.contact_export = 'download-cloud-01'),
      (t.contact_import = 'upload-cloud-01'),
      (t.contact_stopped = 'slash-octagon'),
      (t.contact_updated = 'user-edit'),
      (t.contacts = 'user-01'),
      (t.copy = 'copy-04'),
      (t.dashboard = 'pie-chart-01'),
      (t.definitions_export = 'download-cloud-01'),
      (t.delete = 'trash-03'),
      (t.delete_small = 'x'),
      (t.down = 'chevron-down'),
      (t.download = 'download-01'),
      (t.edit = 'edit-03'),
      (t.email = 'mail-01'),
      (t.error = 'alert-circle'),
      (t.event = 'zap'),
      (t.expressions = 'at-sign'),
      (t.fields = 'user-edit'),
      (t.filter = 'filter-funnel-01'),
      (t.flow = 'flow'),
      (t.flow_background = 'layers-two-01'),
      (t.flow_interrupted = 'x-close'),
      (t.flow_ivr = 'phone'),
      (t.flow_message = 'message-square-02'),
      (t.flow_surveyor = 'tablet-01'),
      (t.flow_user = 'hard-drive'),
      (t.flows = 'flow'),
      (t.global = 'at-sign'),
      (t.grid = 'dots-grid'),
      (t.group = 'users-01'),
      (t.group_exclude = 'users-x'),
      (t.group_include = 'users-check'),
      (t.group_smart = 'atom-01'),
      (t.help = 'help-circle'),
      (t.hide = 'eye-off'),
      (t.home = 'settings-02'),
      (t.image = 'image-01'),
      (t.inbox = 'inbox-01'),
      (t.incidents = 'alert-square'),
      (t.incoming_call = 'phone-incoming-01'),
      (t.integrations = 'layers-three-01'),
      (t.info = 'user-square'),
      (t.issue = 'alert-square'),
      (t.label = 'tag-01'),
      (t.language = 'translate-01'),
      (t.link = 'link-external-01'),
      (t.location = 'marker-pin-01'),
      (t.log = 'file-02'),
      (t.logout = 'log-out-04'),
      (t.menu = 'menu-01'),
      (t.menu_collapse = 'chevron-left-double'),
      (t.message = 'message-square-02'),
      (t.message_export = 'download-cloud-01'),
      (t.messages = 'message-square-02'),
      (t.missing = 'maximize-02'),
      (t.missed_call = 'phone-x'),
      (t.new = 'plus'),
      (t.next_schedule = 'alarm-clock'),
      (t.notification = 'bell-01'),
      (t.number = 'hash-01'),
      (t.optin_requested = 'message-notification-circle'),
      (t.optin = 'message-check-circle'),
      (t.optout = 'message-x-circle'),
      (t.org_active = 'credit-card-02'),
      (t.org_anonymous = 'glasses-01'),
      (t.org_bulk = 'credit-card-plus'),
      (t.org_flagged = 'flag-01'),
      (t.org_new = 'stars-02'),
      (t.org_suspended = 'slash-circle-01'),
      (t.org_verified = 'check-verified-02'),
      (t.overview = 'pie-chart-01'),
      (t.prometheus = 'prometheus'),
      (t.progress_spinner = 'refresh-cw-04'),
      (t.featured = 'star-01'),
      (t.quick_replies = 'dotpoints-01'),
      (t.recording = 'microphone-01'),
      (t.resend = 'refresh-cw-05'),
      (t.reset = 'flip-backward'),
      (t.resthooks = 'share-07'),
      (t.restore = 'play'),
      (t.results_export = 'download-cloud-01'),
      (t.retry = 'refresh-cw-05'),
      (t.revisions = 'clock-rewind'),
      (t.rocketchat = 'rocketchat'),
      (t.runs = 'rows-03'),
      (t.schedule = 'calendar'),
      (t.search = 'search-refraction'),
      (t.select_open = 'chevron-down'),
      (t.select_clear = 'x'),
      (t.send = 'send-03'),
      (t.service = 'magic-wand-01'),
      (t.service_end = 'log-out-04'),
      (t.settings = 'settings-02'),
      (t.show = 'eye'),
      (t.simulator = 'phone-02'),
      (t.sort = 'chevron-selector-vertical'),
      (t.sort_down = 'sort-arrow-down'),
      (t.sort_up = 'sort-arrow-up'),
      (t.staff = 'hard-drive'),
      (t.submit = 'check'),
      (t.success = 'check'),
      (t.template_approved = 'check-circle'),
      (t.template_pending = 'hourglass-01'),
      (t.template_rejected = 'alert-circle'),
      (t.template_unsupported = 'alert-circle'),
      (t.tickets = 'agent'),
      (t.tickets_all = 'archive'),
      (t.tickets_closed = 'check'),
      (t.tickets_mine = 'coffee'),
      (t.tickets_open = 'inbox-01'),
      (t.tickets_export = 'download-cloud-01'),
      (t.tickets_unassigned = 'inbox-01'),
      (t.topic = 'message-text-circle-02'),
      (t.two_factor_enabled = 'shield-02'),
      (t.two_factor_disabled = 'shield-01'),
      (t.trigger = 'signal-01'),
      (t.trigger_active = 'play'),
      (t.trigger_archived = 'archive'),
      (t.trigger_new = 'plus'),
      (t.trigger_keyword = 'message-check-square'),
      (t.trigger_catch_all = 'message-question-square'),
      (t.trigger_inbound_call = 'phone-incoming-01'),
      (t.trigger_missed_call = 'phone-hang-up'),
      (t.trigger_schedule = 'calendar'),
      (t.trigger_new_conversation = 'message-chat-square'),
      (t.trigger_referral = 'user-right-01'),
      (t.trigger_closed_ticket = 'agent'),
      (t.trigger_opt_in = 'message-check-circle'),
      (t.trigger_opt_out = 'message-x-circle'),
      (t.triggers = 'signal-01'),
      (t.updated = 'edit-02'),
      (t.up = 'chevron-up'),
      (t.upload = 'upload-cloud-01'),
      (t.upload_image = 'camera-01'),
      (t.usages = 'link-04'),
      (t.user = 'users-01'),
      (t.users = 'users-01'),
      (t.user_beta = 'shield-zap'),
      (t.video = 'video-recorder'),
      (t.webhook = 'link-external-01'),
      (t.wit = 'wit'),
      (t.workspace = 'folder'),
      (t.zapier = 'zapier'),
      (t.zendesk = 'zendesk'),
      (t.channel_a = 'channel-android'),
      (t.channel_ac = 'zap'),
      (t.channel_at = 'zap'),
      (t.channel_bs = 'zap'),
      (t.channel_bw = 'zap'),
      (t.channel_cs = 'zap'),
      (t.channel_ct = 'channel-clickatell'),
      (t.channel_d3 = 'channel-whatsapp'),
      (t.channel_d3c = 'channel-whatsapp'),
      (t.channel_da = 'zap'),
      (t.channel_ds = 'channel-discord'),
      (t.channel_ex = 'zap'),
      (t.channel_fb = 'channel-facebook'),
      (t.channel_fba = 'channel-facebook'),
      (t.channel_fc = 'channel-freshchat'),
      (t.channel_fcm = 'channel-firebase'),
      (t.channel_hm = 'zap'),
      (t.channel_ib = 'zap'),
      (t.channel_ig = 'channel-instagram'),
      (t.channel_jc = 'channel-jiochat'),
      (t.channel_kn = 'channel-kannel'),
      (t.channel_kwa = 'channel-whatsapp'),
      (t.channel_ln = 'channel-line'),
      (t.channel_mt = 'channel-mtarget'),
      (t.channel_mtn = 'zap'),
      (t.channel_nx = 'channel-vonage'),
      (t.channel_pl = 'channel-plivo'),
      (t.channel_rc = 'channel-rocketchat'),
      (t.channel_sl = 'channel-slack'),
      (t.channel_sq = 'zap'),
      (t.channel_st = 'zap'),
      (t.channel_sw = 'channel-signalwire'),
      (t.channel_t = 'channel-twilio'),
      (t.channel_tg = 'channel-telegram'),
      (t.channel_tms = 'channel-twilio'),
      (t.channel_tq = 'channel-thinq'),
      (t.channel_tw = 'zap'),
      (t.channel_twa = 'channel-whatsapp'),
      (t.channel_twc = 'zap'),
      (t.channel_twt = 'channel-twitter'),
      (t.channel_vk = 'channel-vk'),
      (t.channel_vp = 'channel-viber'),
      (t.channel_wa = 'channel-whatsapp'),
      (t.channel_wac = 'channel-whatsapp'),
      (t.channel_wc = 'channel-wechat'),
      (t.channel_yo = 'zap'),
      (t.channel_zvw = 'channel-whatsapp'),
      (t.bothub = 'bothub'),
      (t.chatbase = 'chatbase'),
      (t.dtone = 'dtone'),
      (t.default = 'list'),
      (t.datepicker = 'calendar'),
      (t.slider = 'sliders-02'),
      (t.select = 'browser'),
      (t.input = 'edit-05');
  })(ve || (ve = {}));
  class be extends fe {
    constructor() {
      super(...arguments),
        (this.name = ''),
        (this.disabled = !1),
        (this.size = 1.2),
        (this.animateChange = 'pulse');
    }
    static get styles() {
      return r`
      :host {
        color: var(--color-text);
        display: inline-block;
      }

      :host([label]) {
        width: 100%;
      }

      .wrapper.label {
        padding: var(--checkbox-padding, 10px);
        border-radius: var(--curvature);
      }

      .wrapper.label:hover {
        background: #f9f9f9;
      }

      temba-field {
        --help-text-margin-left: 24px;
        cursor: pointer;
      }

      .checkbox-container {
        cursor: pointer;
        display: flex;
        user-select: none;
        -webkit-user-select: none;
      }

      .checkbox-label {
        font-family: var(--font-family);
        padding: 0px;
        margin-left: 8px;
        font-size: 14px;
        line-height: 19px;
        flex-grow: 1;
      }

      .far {
        height: 16px;
        margin-top: 1px;
      }

      .disabled {
        cursor: not-allowed;
        --icon-color: #ccc;
      }
    `;
    }
    updated(t) {
      super.updated(t),
        (t.has('checked') || t.has('value')) &&
          (this.checked || this.partial
            ? this.internals.setFormValue(this.value || '1')
            : this.internals.setFormValue(void 0),
          this.fireEvent('change'));
    }
    serializeValue(t) {
      return t;
    }
    handleClick() {
      this.disabled || (this.checked = !this.checked);
    }
    click() {
      this.handleClick(), super.click();
    }
    render() {
      const t = j`<temba-icon
      name="${
        this.checked ? ve.checkbox_checked : this.partial ? ve.checkbox_partial : ve.checkbox
      }"
      size="${this.size}"
      animatechange="${this.animateChange}"
    />`;
      return (
        (this.label = this.label ? this.label.trim() : null),
        j`
      <div class="wrapper ${this.label ? 'label' : ''}">
        <temba-field
          name=${this.name}
          .helpText=${this.helpText}
          .errors=${this.errors}
          .widgetOnly=${this.widgetOnly}
          .helpAlways=${!0}
          ?disabled=${this.disabled}
          @click=${this.handleClick}
        >
          <div class="checkbox-container ${this.disabled ? 'disabled' : ''}">
            ${t}
            ${this.label ? j`<div class="checkbox-label">${this.label}</div>` : null}
          </div>
        </temba-field>
      </div>
    `
      );
    }
  }
  t([ge({ type: String })], be.prototype, 'name', void 0),
    t([ge({ type: Boolean })], be.prototype, 'checked', void 0),
    t([ge({ type: Boolean })], be.prototype, 'partial', void 0),
    t([ge({ type: Boolean })], be.prototype, 'disabled', void 0),
    t([ge({ type: Number })], be.prototype, 'size', void 0),
    t([ge({ type: String })], be.prototype, 'animateChange', void 0);
  /**
   * @license
   * Copyright 2018 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
  const ye = t => t ?? V,
    /**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */ _e = 1,
    xe = 2,
    we = t => (...e) => ({ _$litDirective$: t, values: e });
  let ke = class {
    constructor(t) {}
    get _$AU() {
      return this._$AM._$AU;
    }
    _$AT(t, e, i) {
      (this._$Ct = t), (this._$AM = e), (this._$Ci = i);
    }
    _$AS(t, e) {
      return this.update(t, e);
    }
    update(t, e) {
      return this.render(...e);
    }
  };
  /**
   * @license
   * Copyright 2018 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */ const Ae = 'important',
    Ce = ' !' + Ae,
    Se = we(
      class extends ke {
        constructor(t) {
          if ((super(t), t.type !== _e || 'style' !== t.name || t.strings?.length > 2))
            throw Error(
              'The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.'
            );
        }
        render(t) {
          return Object.keys(t).reduce((e, i) => {
            const o = t[i];
            return null == o
              ? e
              : e +
                  `${(i = i.includes('-')
                    ? i
                    : i.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g, '-$&').toLowerCase())}:${o};`;
          }, '');
        }
        update(t, [e]) {
          const { style: i } = t.element;
          if (void 0 === this.ft) return (this.ft = new Set(Object.keys(e))), this.render(e);
          for (const t of this.ft)
            null == e[t] &&
              (this.ft.delete(t), t.includes('-') ? i.removeProperty(t) : (i[t] = null));
          for (const t in e) {
            const o = e[t];
            if (null != o) {
              this.ft.add(t);
              const e = 'string' == typeof o && o.endsWith(Ce);
              t.includes('-') || e
                ? i.setProperty(t, e ? o.slice(0, -11) : o, e ? Ae : '')
                : (i[t] = o);
            }
          }
          return H;
        }
      }
    );
  var Ee, Te, $e, Oe, Me;
  !(function(t) {
    (t.Text = 'text'), (t.Password = 'password'), (t.Number = 'number');
  })(Ee || (Ee = {}));
  class Le extends fe {
    static get styles() {
      return r`
      .input-container {
        border-radius: var(--curvature-widget);
        cursor: var(--input-cursor);
        background: var(--color-widget-bg);
        border: 1px solid var(--color-widget-border);
        transition: all ease-in-out var(--transition-speed);
        display: flex;
        flex-direction: row;
        align-items: stretch;
        box-shadow: var(--widget-box-shadow);
        caret-color: var(--input-caret);
      }

      .clear-icon {
        --icon-color: var(--color-text-dark-secondary);
        cursor: pointer;
        margin: auto;
        padding-right: 10px;
        line-height: 1;
      }

      .clear-icon:hover {
        --icon-color: var(--color-text-dark);
      }

      .hidden {
        visibility: hidden;
        position: absolute;
      }

      .input-container:focus-within {
        border-color: var(--color-focus);
        background: var(--color-widget-bg-focused);
        box-shadow: var(--widget-box-shadow-focused);
        position: relative;
      }

      .input-container:hover {
      }

      textarea {
        height: var(--textarea-height);
        min-height: var(--textarea-min-height, var(--textarea-height));
        transition: height var(--transition-speed) ease-in-out;
      }

      .textinput {
        padding: var(--temba-textinput-padding);
        border: none;
        flex: 1;
        margin: 0;
        background: none;
        background-color: transparent;
        color: var(--color-widget-text);
        font-family: var(--font-family);
        font-size: var(--temba-textinput-font-size);
        line-height: normal;
        cursor: var(--input-cursor);
        resize: none;
        width: 100%;
      }

      .textinput:focus {
        outline: none;
        box-shadow: none;
        cursor: text;
        color: var(--color-widget-text-focused, var(--color-widget-text));
      }

      .textinput::placeholder {
        color: var(--color-placeholder);
      }

      .grow-wrap {
        display: flex;
        align-items: stretch;
        width: 100%;
      }

      .grow-wrap > div {
        border: 0px solid green;
        width: 100%;
        padding: var(--temba-textinput-padding);
        flex: 1;
        margin: 0;
        background: none;
        color: var(--color-widget-text);
        font-family: var(--font-family);
        font-size: var(--temba-textinput-font-size);
        line-height: normal;
        cursor: text;
        resize: none;
        width: 100%;
        visibility: hidden;
        word-break: break-word;
      }

      .grow-wrap textarea {
        margin-left: -100%;
      }

      input[type='number'] {
        appearance: none;
      }

      input[type='number']::-webkit-inner-spin-button {
        display: none;
      }

      .type-icon {
        color: #e3e3e3;
      }
    `;
    }
    constructor() {
      super(),
        (this.placeholder = ''),
        (this.loading = !0),
        (this.submitOnEnter = !0),
        (this.autogrow = !1),
        (this.type = Ee.Text),
        (this.counterElement = null),
        (this.cursorStart = -1),
        (this.cursorEnd = -1);
    }
    firstUpdated(t) {
      if (
        (super.firstUpdated(t),
        (this.inputElement = this.shadowRoot.querySelector('.textinput')),
        t.has('counter'))
      ) {
        let t = this.getParentModax();
        t && (t = t.shadowRoot),
          t || (t = document),
          (this.counterElement = t.querySelector(this.counter)),
          (this.counterElement.text = this.value);
      }
    }
    updated(t) {
      if ((super.updated(t), t.has('value'))) {
        if (
          (void 0 !== t.get('value') && this.fireEvent('change'), this.textarea && this.autogrow)
        ) {
          this.shadowRoot.querySelector('.grow-wrap > div').innerText =
            this.value + String.fromCharCode(10);
        }
        this.cursorStart > -1 &&
          this.cursorEnd > -1 &&
          (this.inputElement.setSelectionRange(this.cursorStart, this.cursorEnd),
          (this.cursorStart = -1),
          (this.cursorEnd = -1));
      }
    }
    getDisplayValue() {
      return this.inputElement.value;
    }
    handleClear(t) {
      t.stopPropagation(), t.preventDefault(), (this.value = null);
    }
    updateValue(t) {
      const e = this.inputElement.selectionStart,
        i = this.inputElement.selectionEnd,
        o = this.sanitizeGSM(t);
      o !== t && ((this.cursorStart = e), (this.cursorEnd = i)),
        (this.value = o),
        this.textarea && (this.inputElement.value = this.value),
        this.counterElement && (this.counterElement.text = t);
    }
    sanitizeGSM(t) {
      return this.gsm
        ? (t =>
            t
              ? t
                  .replace(/[\u2018\u2019]/g, "'")
                  .replace(/[\u201C\u201D]/g, '"')
                  .replace(/[\u2013\u2014]/g, '-')
                  .replace(/\u2026/g, '...')
                  .replace(/\u2002/g, ' ')
              : t)(t)
        : t;
    }
    handleChange(t) {
      this.disabled || (this.updateValue(t.target.value), this.fireEvent('change'));
    }
    handleContainerClick() {
      this.disabled || (this.inputElement && this.inputElement.click());
    }
    handleContainerFocus() {
      this.disabled || (this.inputElement && this.inputElement.focus());
    }
    handleInput(t) {
      this.disabled || (this.updateValue(t.target.value), this.fireEvent('input'));
    }
    serializeValue(t) {
      return t;
    }
    getParentModax() {
      let t = this;
      for (; t; ) {
        if (((t = t.parentElement ? t.parentElement : t.getRootNode().host), !t)) return null;
        if ('TEMBA-MODAX' == t.tagName) return t;
      }
    }
    getParentForm() {
      let t = this;
      for (; t; ) {
        if (((t = t.parentElement ? t.parentElement : t.getRootNode().host), !t)) return null;
        if ('FORM' === t.tagName) return t;
      }
    }
    click() {
      super.click(), this.handleContainerClick();
    }
    focus() {
      super.focus(), this.handleContainerFocus();
    }
    render() {
      const t = { height: '' + (this.textarea ? '100%' : 'auto') },
        e =
          this.clearable && this.inputElement && this.inputElement.value
            ? j`<temba-icon
            name="x"
            class="clear-icon"
            @click=${this.handleClear}
          />`
            : null;
      let i = j`
      <input
        class="textinput"
        autocomplete="off"
        name=${this.name}
        type="${this.password || this.type === Ee.Password ? 'password' : this.type}"
        maxlength="${ye(this.maxlength)}"
        @change=${this.handleChange}
        @input=${this.handleInput}
        @blur=${this.blur}
        @keydown=${t => {
          if ('Enter' === t.key) {
            const t = this;
            if (this.submitOnEnter) {
              const e = t.getParentModax(),
                i = e ? null : t.getParentForm();
              if (!e && !i) return !1;
              if (e && e.disabled) return !1;
              t.blur(),
                window.setTimeout(function() {
                  const e = t.getParentModax();
                  if (e) t.blur(), e.submit();
                  else {
                    const e = t.getParentForm();
                    if (e) {
                      const t = e.querySelector("input[type='submit']");
                      t ? t.click() : e.submit();
                    }
                  }
                }, 10);
            }
          }
        }}
        placeholder=${this.placeholder}
        .value=${this.value}
        .disabled=${this.disabled}
      />
    `;
      return (
        this.textarea &&
          ((i = j`
        <textarea
          class="textinput"
          name=${this.name}
          maxlength="${ye(this.maxlength)}"
          placeholder=${this.placeholder}
          @change=${this.handleChange}
          @input=${this.handleInput}
          @blur=${this.blur}
          .value=${this.value}
          .disabled=${this.disabled}
        ></textarea>
      `),
          this.autogrow &&
            (i = j` <div class="grow-wrap">
          <div></div>
          ${i}
        </div>`)),
        j`
      <temba-field
        name=${this.name}
        .label="${this.label}"
        .helpText="${this.helpText}"
        .errors=${this.errors}
        .widgetOnly=${this.widgetOnly}
        .hideLabel=${this.hideLabel}
        .disabled=${this.disabled}
      >
        <div
          class="input-container"
          style=${Se(t)}
          @click=${this.handleContainerClick}
        >
          <slot name="prefix"></slot>

          ${i} ${e}
          <slot name="type" class="type-icon"
            >${this.type === Ee.Number ? j`<temba-icon name="number"></temba-icon>` : null}</slot
          >
          <slot></slot>
        </div>
      </temba-field>
    `
      );
    }
  }
  t([ge({ type: Boolean })], Le.prototype, 'textarea', void 0),
    t([ge({ type: String })], Le.prototype, 'placeholder', void 0),
    t([ge({ type: Boolean })], Le.prototype, 'password', void 0),
    t([ge({ type: Number })], Le.prototype, 'maxlength', void 0),
    t([ge({ type: Object })], Le.prototype, 'inputElement', void 0),
    t([ge({ type: Boolean })], Le.prototype, 'clearable', void 0),
    t([ge({ type: Boolean })], Le.prototype, 'gsm', void 0),
    t([ge({ type: String })], Le.prototype, 'counter', void 0),
    t([ge({ type: Boolean })], Le.prototype, 'loading', void 0),
    t([ge({ type: Boolean })], Le.prototype, 'submitOnEnter', void 0),
    t([ge()], Le.prototype, 'onBlur', void 0),
    t([ge({ type: Boolean })], Le.prototype, 'autogrow', void 0),
    t([ge({ type: String })], Le.prototype, 'type', void 0),
    (function(t) {
      (t.DayFirst = 'day_first'), (t.MonthFirst = 'month_first'), (t.YearFirst = 'year_first');
    })(Te || (Te = {})),
    (function(t) {
      (t.CampaignEvent = 'campaign_event'),
        (t.ScheduledBroadcast = 'scheduled_broadcast'),
        (t.ScheduledTrigger = 'scheduled_trigger');
    })($e || ($e = {})),
    (function(t) {
      (t.Open = 'open'), (t.Closed = 'closed');
    })(Oe || (Oe = {})),
    (function(t) {
      (t.Loaded = 'temba-loaded'),
        (t.Canceled = 'temba-canceled'),
        (t.CursorChanged = 'temba-cursor-changed'),
        (t.Refreshed = 'temba-refreshed'),
        (t.Selection = 'temba-selection'),
        (t.ButtonClicked = 'temba-button-clicked'),
        (t.DialogHidden = 'temba-dialog-hidden'),
        (t.ScrollThreshold = 'temba-scroll-threshold'),
        (t.ContentChanged = 'temba-content-changed'),
        (t.ContextChanged = 'temba-context-changed'),
        (t.FetchComplete = 'temba-fetch-complete'),
        (t.MessageSent = 'temba-message-sent'),
        (t.Submitted = 'temba-submitted'),
        (t.Redirected = 'temba-redirected'),
        (t.NoPath = 'temba-no-path'),
        (t.StoreUpdated = 'temba-store-updated'),
        (t.Ready = 'temba-ready'),
        (t.OrderChanged = 'temba-order-changed'),
        (t.DragStart = 'temba-drag-start'),
        (t.DragStop = 'temba-drag-stop'),
        (t.Resized = 'temba-resized');
    })(Me || (Me = {}));
  /**
   * tiny-lru
   *
   * @copyright 2023 Jason Mulligan <jason.mulligan@avoidwork.com>
   * @license BSD-3-Clause
   * @version 11.2.5
   */
  class ze {
    constructor(t = 0, e = 0, i = !1) {
      (this.first = null),
        (this.items = Object.create(null)),
        (this.last = null),
        (this.max = t),
        (this.resetTtl = i),
        (this.size = 0),
        (this.ttl = e);
    }
    clear() {
      return (
        (this.first = null),
        (this.items = Object.create(null)),
        (this.last = null),
        (this.size = 0),
        this
      );
    }
    delete(t) {
      if (this.has(t)) {
        const e = this.items[t];
        delete this.items[t],
          this.size--,
          null !== e.prev && (e.prev.next = e.next),
          null !== e.next && (e.next.prev = e.prev),
          this.first === e && (this.first = e.next),
          this.last === e && (this.last = e.prev);
      }
      return this;
    }
    entries(t = this.keys()) {
      return t.map(t => [t, this.get(t)]);
    }
    evict(t = !1) {
      if (t || this.size > 0) {
        const t = this.first;
        delete this.items[t.key],
          0 == --this.size
            ? ((this.first = null), (this.last = null))
            : ((this.first = t.next), (this.first.prev = null));
      }
      return this;
    }
    expiresAt(t) {
      let e;
      return this.has(t) && (e = this.items[t].expiry), e;
    }
    get(t) {
      let e;
      if (this.has(t)) {
        const i = this.items[t];
        this.ttl > 0 && i.expiry <= Date.now()
          ? this.delete(t)
          : ((e = i.value), this.set(t, e, !0));
      }
      return e;
    }
    has(t) {
      return t in this.items;
    }
    keys() {
      const t = [];
      let e = this.first;
      for (; null !== e; ) t.push(e.key), (e = e.next);
      return t;
    }
    set(t, e, i = !1, o = this.resetTtl) {
      let n;
      if (i || this.has(t)) {
        if (
          ((n = this.items[t]),
          (n.value = e),
          !1 === i && o && (n.expiry = this.ttl > 0 ? Date.now() + this.ttl : this.ttl),
          this.last !== n)
        ) {
          const t = this.last,
            e = n.next,
            i = n.prev;
          this.first === n && (this.first = n.next),
            (n.next = null),
            (n.prev = this.last),
            (t.next = n),
            null !== i && (i.next = e),
            null !== e && (e.prev = i);
        }
      } else
        this.max > 0 && this.size === this.max && this.evict(!0),
          (n = this.items[t] = {
            expiry: this.ttl > 0 ? Date.now() + this.ttl : this.ttl,
            key: t,
            prev: this.last,
            next: null,
            value: e
          }),
          1 == ++this.size ? (this.first = n) : (this.last.next = n);
      return (this.last = n), this;
    }
    values(t = this.keys()) {
      return t.map(t => this.get(t));
    }
  }
  function Pe(t = 1e3, e = 0, i = !1) {
    if (isNaN(t) || t < 0) throw new TypeError('Invalid max value');
    if (isNaN(e) || e < 0) throw new TypeError('Invalid ttl value');
    if ('boolean' != typeof i) throw new TypeError('Invalid resetTtl value');
    return new ze(t, e, i);
  }
  class De extends Error {}
  class Ie extends De {
    constructor(t) {
      super(`Invalid DateTime: ${t.toMessage()}`);
    }
  }
  class Ne extends De {
    constructor(t) {
      super(`Invalid Interval: ${t.toMessage()}`);
    }
  }
  class Be extends De {
    constructor(t) {
      super(`Invalid Duration: ${t.toMessage()}`);
    }
  }
  class Re extends De {}
  class qe extends De {
    constructor(t) {
      super(`Invalid unit ${t}`);
    }
  }
  class Ue extends De {}
  class Fe extends De {
    constructor() {
      super('Zone is an abstract class');
    }
  }
  const Ze = 'numeric',
    je = 'short',
    He = 'long',
    Ve = { year: Ze, month: Ze, day: Ze },
    We = { year: Ze, month: je, day: Ze },
    Ge = { year: Ze, month: je, day: Ze, weekday: je },
    Qe = { year: Ze, month: He, day: Ze },
    Ke = { year: Ze, month: He, day: Ze, weekday: He },
    Ye = { hour: Ze, minute: Ze },
    Je = { hour: Ze, minute: Ze, second: Ze },
    Xe = { hour: Ze, minute: Ze, second: Ze, timeZoneName: je },
    ti = { hour: Ze, minute: Ze, second: Ze, timeZoneName: He },
    ei = { hour: Ze, minute: Ze, hourCycle: 'h23' },
    ii = { hour: Ze, minute: Ze, second: Ze, hourCycle: 'h23' },
    oi = { hour: Ze, minute: Ze, second: Ze, hourCycle: 'h23', timeZoneName: je },
    ni = { hour: Ze, minute: Ze, second: Ze, hourCycle: 'h23', timeZoneName: He },
    si = { year: Ze, month: Ze, day: Ze, hour: Ze, minute: Ze },
    ri = { year: Ze, month: Ze, day: Ze, hour: Ze, minute: Ze, second: Ze },
    ai = { year: Ze, month: je, day: Ze, hour: Ze, minute: Ze },
    li = { year: Ze, month: je, day: Ze, hour: Ze, minute: Ze, second: Ze },
    hi = { year: Ze, month: je, day: Ze, weekday: je, hour: Ze, minute: Ze },
    ci = { year: Ze, month: He, day: Ze, hour: Ze, minute: Ze, timeZoneName: je },
    di = { year: Ze, month: He, day: Ze, hour: Ze, minute: Ze, second: Ze, timeZoneName: je },
    ui = { year: Ze, month: He, day: Ze, weekday: He, hour: Ze, minute: Ze, timeZoneName: He },
    pi = {
      year: Ze,
      month: He,
      day: Ze,
      weekday: He,
      hour: Ze,
      minute: Ze,
      second: Ze,
      timeZoneName: He
    };
  function mi(t) {
    return void 0 === t;
  }
  function gi(t) {
    return 'number' == typeof t;
  }
  function fi(t) {
    return 'number' == typeof t && t % 1 == 0;
  }
  function vi() {
    try {
      return 'undefined' != typeof Intl && !!Intl.RelativeTimeFormat;
    } catch (t) {
      return !1;
    }
  }
  function bi(t, e, i) {
    if (0 !== t.length)
      return t.reduce((t, o) => {
        const n = [e(o), o];
        return t && i(t[0], n[0]) === t[0] ? t : n;
      }, null)[1];
  }
  function yi(t, e) {
    return Object.prototype.hasOwnProperty.call(t, e);
  }
  function _i(t, e, i) {
    return fi(t) && t >= e && t <= i;
  }
  function xi(t, e = 2) {
    let i;
    return (i = t < 0 ? '-' + ('' + -t).padStart(e, '0') : ('' + t).padStart(e, '0')), i;
  }
  function wi(t) {
    return mi(t) || null === t || '' === t ? void 0 : parseInt(t, 10);
  }
  function ki(t) {
    return mi(t) || null === t || '' === t ? void 0 : parseFloat(t);
  }
  function Ai(t) {
    if (!mi(t) && null !== t && '' !== t) {
      const e = 1e3 * parseFloat('0.' + t);
      return Math.floor(e);
    }
  }
  function Ci(t, e, i = !1) {
    const o = 10 ** e;
    return (i ? Math.trunc : Math.round)(t * o) / o;
  }
  function Si(t) {
    return t % 4 == 0 && (t % 100 != 0 || t % 400 == 0);
  }
  function Ei(t) {
    return Si(t) ? 366 : 365;
  }
  function Ti(t, e) {
    const i =
      (function(t, e) {
        return t - e * Math.floor(t / e);
      })(e - 1, 12) + 1;
    return 2 === i
      ? Si(t + (e - i) / 12)
        ? 29
        : 28
      : [31, null, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][i - 1];
  }
  function $i(t) {
    let e = Date.UTC(t.year, t.month - 1, t.day, t.hour, t.minute, t.second, t.millisecond);
    return (
      t.year < 100 &&
        t.year >= 0 &&
        ((e = new Date(e)), e.setUTCFullYear(e.getUTCFullYear() - 1900)),
      +e
    );
  }
  function Oi(t) {
    const e = (t + Math.floor(t / 4) - Math.floor(t / 100) + Math.floor(t / 400)) % 7,
      i = t - 1,
      o = (i + Math.floor(i / 4) - Math.floor(i / 100) + Math.floor(i / 400)) % 7;
    return 4 === e || 3 === o ? 53 : 52;
  }
  function Mi(t) {
    return t > 99 ? t : t > 60 ? 1900 + t : 2e3 + t;
  }
  function Li(t, e, i, o = null) {
    const n = new Date(t),
      s = {
        hourCycle: 'h23',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      };
    o && (s.timeZone = o);
    const r = { timeZoneName: e, ...s },
      a = new Intl.DateTimeFormat(i, r)
        .formatToParts(n)
        .find(t => 'timezonename' === t.type.toLowerCase());
    return a ? a.value : null;
  }
  function zi(t, e) {
    let i = parseInt(t, 10);
    Number.isNaN(i) && (i = 0);
    const o = parseInt(e, 10) || 0;
    return 60 * i + (i < 0 || Object.is(i, -0) ? -o : o);
  }
  function Pi(t) {
    const e = Number(t);
    if ('boolean' == typeof t || '' === t || Number.isNaN(e))
      throw new Ue(`Invalid unit value ${t}`);
    return e;
  }
  function Di(t, e) {
    const i = {};
    for (const o in t)
      if (yi(t, o)) {
        const n = t[o];
        if (null == n) continue;
        i[e(o)] = Pi(n);
      }
    return i;
  }
  function Ii(t, e) {
    const i = Math.trunc(Math.abs(t / 60)),
      o = Math.trunc(Math.abs(t % 60)),
      n = t >= 0 ? '+' : '-';
    switch (e) {
      case 'short':
        return `${n}${xi(i, 2)}:${xi(o, 2)}`;
      case 'narrow':
        return `${n}${i}${o > 0 ? `:${o}` : ''}`;
      case 'techie':
        return `${n}${xi(i, 2)}${xi(o, 2)}`;
      default:
        throw new RangeError(`Value format ${e} is out of range for property format`);
    }
  }
  function Ni(t) {
    return (function(t, e) {
      return e.reduce((e, i) => ((e[i] = t[i]), e), {});
    })(t, ['hour', 'minute', 'second', 'millisecond']);
  }
  const Bi = /[A-Za-z_+-]{1,256}(?::?\/[A-Za-z0-9_+-]{1,256}(?:\/[A-Za-z0-9_+-]{1,256})?)?/,
    Ri = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ],
    qi = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    Ui = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
  function Fi(t) {
    switch (t) {
      case 'narrow':
        return [...Ui];
      case 'short':
        return [...qi];
      case 'long':
        return [...Ri];
      case 'numeric':
        return ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
      case '2-digit':
        return ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
      default:
        return null;
    }
  }
  const Zi = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    ji = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    Hi = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  function Vi(t) {
    switch (t) {
      case 'narrow':
        return [...Hi];
      case 'short':
        return [...ji];
      case 'long':
        return [...Zi];
      case 'numeric':
        return ['1', '2', '3', '4', '5', '6', '7'];
      default:
        return null;
    }
  }
  const Wi = ['AM', 'PM'],
    Gi = ['Before Christ', 'Anno Domini'],
    Qi = ['BC', 'AD'],
    Ki = ['B', 'A'];
  function Yi(t) {
    switch (t) {
      case 'narrow':
        return [...Ki];
      case 'short':
        return [...Qi];
      case 'long':
        return [...Gi];
      default:
        return null;
    }
  }
  function Ji(t, e) {
    let i = '';
    for (const o of t) o.literal ? (i += o.val) : (i += e(o.val));
    return i;
  }
  const Xi = {
    D: Ve,
    DD: We,
    DDD: Qe,
    DDDD: Ke,
    t: Ye,
    tt: Je,
    ttt: Xe,
    tttt: ti,
    T: ei,
    TT: ii,
    TTT: oi,
    TTTT: ni,
    f: si,
    ff: ai,
    fff: ci,
    ffff: ui,
    F: ri,
    FF: li,
    FFF: di,
    FFFF: pi
  };
  class to {
    static create(t, e = {}) {
      return new to(t, e);
    }
    static parseFormat(t) {
      let e = null,
        i = '',
        o = !1;
      const n = [];
      for (let s = 0; s < t.length; s++) {
        const r = t.charAt(s);
        "'" === r
          ? (i.length > 0 && n.push({ literal: o, val: i }), (e = null), (i = ''), (o = !o))
          : o || r === e
          ? (i += r)
          : (i.length > 0 && n.push({ literal: !1, val: i }), (i = r), (e = r));
      }
      return i.length > 0 && n.push({ literal: o, val: i }), n;
    }
    static macroTokenToFormatOpts(t) {
      return Xi[t];
    }
    constructor(t, e) {
      (this.opts = e), (this.loc = t), (this.systemLoc = null);
    }
    formatWithSystemDefault(t, e) {
      null === this.systemLoc && (this.systemLoc = this.loc.redefaultToSystem());
      return this.systemLoc.dtFormatter(t, { ...this.opts, ...e }).format();
    }
    formatDateTime(t, e = {}) {
      return this.loc.dtFormatter(t, { ...this.opts, ...e }).format();
    }
    formatDateTimeParts(t, e = {}) {
      return this.loc.dtFormatter(t, { ...this.opts, ...e }).formatToParts();
    }
    resolvedOptions(t, e = {}) {
      return this.loc.dtFormatter(t, { ...this.opts, ...e }).resolvedOptions();
    }
    num(t, e = 0) {
      if (this.opts.forceSimple) return xi(t, e);
      const i = { ...this.opts };
      return e > 0 && (i.padTo = e), this.loc.numberFormatter(i).format(t);
    }
    formatDateTimeFromString(t, e) {
      const i = 'en' === this.loc.listingMode(),
        o = this.loc.outputCalendar && 'gregory' !== this.loc.outputCalendar,
        n = (e, i) => this.loc.extract(t, e, i),
        s = e =>
          t.isOffsetFixed && 0 === t.offset && e.allowZ
            ? 'Z'
            : t.isValid
            ? t.zone.formatOffset(t.ts, e.format)
            : '',
        r = () =>
          i
            ? (function(t) {
                return Wi[t.hour < 12 ? 0 : 1];
              })(t)
            : n({ hour: 'numeric', hourCycle: 'h12' }, 'dayperiod'),
        a = (e, o) =>
          i
            ? (function(t, e) {
                return Fi(e)[t.month - 1];
              })(t, e)
            : n(o ? { month: e } : { month: e, day: 'numeric' }, 'month'),
        l = (e, o) =>
          i
            ? (function(t, e) {
                return Vi(e)[t.weekday - 1];
              })(t, e)
            : n(o ? { weekday: e } : { weekday: e, month: 'long', day: 'numeric' }, 'weekday'),
        h = e => {
          const i = to.macroTokenToFormatOpts(e);
          return i ? this.formatWithSystemDefault(t, i) : e;
        },
        c = e =>
          i
            ? (function(t, e) {
                return Yi(e)[t.year < 0 ? 0 : 1];
              })(t, e)
            : n({ era: e }, 'era');
      return Ji(to.parseFormat(e), e => {
        switch (e) {
          case 'S':
            return this.num(t.millisecond);
          case 'u':
          case 'SSS':
            return this.num(t.millisecond, 3);
          case 's':
            return this.num(t.second);
          case 'ss':
            return this.num(t.second, 2);
          case 'uu':
            return this.num(Math.floor(t.millisecond / 10), 2);
          case 'uuu':
            return this.num(Math.floor(t.millisecond / 100));
          case 'm':
            return this.num(t.minute);
          case 'mm':
            return this.num(t.minute, 2);
          case 'h':
            return this.num(t.hour % 12 == 0 ? 12 : t.hour % 12);
          case 'hh':
            return this.num(t.hour % 12 == 0 ? 12 : t.hour % 12, 2);
          case 'H':
            return this.num(t.hour);
          case 'HH':
            return this.num(t.hour, 2);
          case 'Z':
            return s({ format: 'narrow', allowZ: this.opts.allowZ });
          case 'ZZ':
            return s({ format: 'short', allowZ: this.opts.allowZ });
          case 'ZZZ':
            return s({ format: 'techie', allowZ: this.opts.allowZ });
          case 'ZZZZ':
            return t.zone.offsetName(t.ts, { format: 'short', locale: this.loc.locale });
          case 'ZZZZZ':
            return t.zone.offsetName(t.ts, { format: 'long', locale: this.loc.locale });
          case 'z':
            return t.zoneName;
          case 'a':
            return r();
          case 'd':
            return o ? n({ day: 'numeric' }, 'day') : this.num(t.day);
          case 'dd':
            return o ? n({ day: '2-digit' }, 'day') : this.num(t.day, 2);
          case 'c':
          case 'E':
            return this.num(t.weekday);
          case 'ccc':
            return l('short', !0);
          case 'cccc':
            return l('long', !0);
          case 'ccccc':
            return l('narrow', !0);
          case 'EEE':
            return l('short', !1);
          case 'EEEE':
            return l('long', !1);
          case 'EEEEE':
            return l('narrow', !1);
          case 'L':
            return o ? n({ month: 'numeric', day: 'numeric' }, 'month') : this.num(t.month);
          case 'LL':
            return o ? n({ month: '2-digit', day: 'numeric' }, 'month') : this.num(t.month, 2);
          case 'LLL':
            return a('short', !0);
          case 'LLLL':
            return a('long', !0);
          case 'LLLLL':
            return a('narrow', !0);
          case 'M':
            return o ? n({ month: 'numeric' }, 'month') : this.num(t.month);
          case 'MM':
            return o ? n({ month: '2-digit' }, 'month') : this.num(t.month, 2);
          case 'MMM':
            return a('short', !1);
          case 'MMMM':
            return a('long', !1);
          case 'MMMMM':
            return a('narrow', !1);
          case 'y':
            return o ? n({ year: 'numeric' }, 'year') : this.num(t.year);
          case 'yy':
            return o ? n({ year: '2-digit' }, 'year') : this.num(t.year.toString().slice(-2), 2);
          case 'yyyy':
            return o ? n({ year: 'numeric' }, 'year') : this.num(t.year, 4);
          case 'yyyyyy':
            return o ? n({ year: 'numeric' }, 'year') : this.num(t.year, 6);
          case 'G':
            return c('short');
          case 'GG':
            return c('long');
          case 'GGGGG':
            return c('narrow');
          case 'kk':
            return this.num(t.weekYear.toString().slice(-2), 2);
          case 'kkkk':
            return this.num(t.weekYear, 4);
          case 'W':
            return this.num(t.weekNumber);
          case 'WW':
            return this.num(t.weekNumber, 2);
          case 'o':
            return this.num(t.ordinal);
          case 'ooo':
            return this.num(t.ordinal, 3);
          case 'q':
            return this.num(t.quarter);
          case 'qq':
            return this.num(t.quarter, 2);
          case 'X':
            return this.num(Math.floor(t.ts / 1e3));
          case 'x':
            return this.num(t.ts);
          default:
            return h(e);
        }
      });
    }
    formatDurationFromString(t, e) {
      const i = t => {
          switch (t[0]) {
            case 'S':
              return 'millisecond';
            case 's':
              return 'second';
            case 'm':
              return 'minute';
            case 'h':
              return 'hour';
            case 'd':
              return 'day';
            case 'w':
              return 'week';
            case 'M':
              return 'month';
            case 'y':
              return 'year';
            default:
              return null;
          }
        },
        o = to.parseFormat(e),
        n = o.reduce((t, { literal: e, val: i }) => (e ? t : t.concat(i)), []),
        s = t.shiftTo(...n.map(i).filter(t => t));
      return Ji(
        o,
        (t => e => {
          const o = i(e);
          return o ? this.num(t.get(o), e.length) : e;
        })(s)
      );
    }
  }
  class eo {
    constructor(t, e) {
      (this.reason = t), (this.explanation = e);
    }
    toMessage() {
      return this.explanation ? `${this.reason}: ${this.explanation}` : this.reason;
    }
  }
  class io {
    get type() {
      throw new Fe();
    }
    get name() {
      throw new Fe();
    }
    get ianaName() {
      return this.name;
    }
    get isUniversal() {
      throw new Fe();
    }
    offsetName(t, e) {
      throw new Fe();
    }
    formatOffset(t, e) {
      throw new Fe();
    }
    offset(t) {
      throw new Fe();
    }
    equals(t) {
      throw new Fe();
    }
    get isValid() {
      throw new Fe();
    }
  }
  let oo = null;
  class no extends io {
    static get instance() {
      return null === oo && (oo = new no()), oo;
    }
    get type() {
      return 'system';
    }
    get name() {
      return new Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
    get isUniversal() {
      return !1;
    }
    offsetName(t, { format: e, locale: i }) {
      return Li(t, e, i);
    }
    formatOffset(t, e) {
      return Ii(this.offset(t), e);
    }
    offset(t) {
      return -new Date(t).getTimezoneOffset();
    }
    equals(t) {
      return 'system' === t.type;
    }
    get isValid() {
      return !0;
    }
  }
  let so = {};
  const ro = { year: 0, month: 1, day: 2, era: 3, hour: 4, minute: 5, second: 6 };
  let ao = {};
  class lo extends io {
    static create(t) {
      return ao[t] || (ao[t] = new lo(t)), ao[t];
    }
    static resetCache() {
      (ao = {}), (so = {});
    }
    static isValidSpecifier(t) {
      return this.isValidZone(t);
    }
    static isValidZone(t) {
      if (!t) return !1;
      try {
        return new Intl.DateTimeFormat('en-US', { timeZone: t }).format(), !0;
      } catch (t) {
        return !1;
      }
    }
    constructor(t) {
      super(), (this.zoneName = t), (this.valid = lo.isValidZone(t));
    }
    get type() {
      return 'iana';
    }
    get name() {
      return this.zoneName;
    }
    get isUniversal() {
      return !1;
    }
    offsetName(t, { format: e, locale: i }) {
      return Li(t, e, i, this.name);
    }
    formatOffset(t, e) {
      return Ii(this.offset(t), e);
    }
    offset(t) {
      const e = new Date(t);
      if (isNaN(e)) return NaN;
      const i =
        ((o = this.name),
        so[o] ||
          (so[o] = new Intl.DateTimeFormat('en-US', {
            hour12: !1,
            timeZone: o,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            era: 'short'
          })),
        so[o]);
      var o;
      let [n, s, r, a, l, h, c] = i.formatToParts
        ? (function(t, e) {
            const i = t.formatToParts(e),
              o = [];
            for (let t = 0; t < i.length; t++) {
              const { type: e, value: n } = i[t],
                s = ro[e];
              'era' === e ? (o[s] = n) : mi(s) || (o[s] = parseInt(n, 10));
            }
            return o;
          })(i, e)
        : (function(t, e) {
            const i = t.format(e).replace(/\u200E/g, ''),
              o = /(\d+)\/(\d+)\/(\d+) (AD|BC),? (\d+):(\d+):(\d+)/.exec(i),
              [, n, s, r, a, l, h, c] = o;
            return [r, n, s, a, l, h, c];
          })(i, e);
      'BC' === a && (n = 1 - Math.abs(n));
      let d = +e;
      const u = d % 1e3;
      return (
        (d -= u >= 0 ? u : 1e3 + u),
        ($i({
          year: n,
          month: s,
          day: r,
          hour: 24 === l ? 0 : l,
          minute: h,
          second: c,
          millisecond: 0
        }) -
          d) /
          6e4
      );
    }
    equals(t) {
      return 'iana' === t.type && t.name === this.name;
    }
    get isValid() {
      return this.valid;
    }
  }
  let ho = null;
  class co extends io {
    static get utcInstance() {
      return null === ho && (ho = new co(0)), ho;
    }
    static instance(t) {
      return 0 === t ? co.utcInstance : new co(t);
    }
    static parseSpecifier(t) {
      if (t) {
        const e = t.match(/^utc(?:([+-]\d{1,2})(?::(\d{2}))?)?$/i);
        if (e) return new co(zi(e[1], e[2]));
      }
      return null;
    }
    constructor(t) {
      super(), (this.fixed = t);
    }
    get type() {
      return 'fixed';
    }
    get name() {
      return 0 === this.fixed ? 'UTC' : `UTC${Ii(this.fixed, 'narrow')}`;
    }
    get ianaName() {
      return 0 === this.fixed ? 'Etc/UTC' : `Etc/GMT${Ii(-this.fixed, 'narrow')}`;
    }
    offsetName() {
      return this.name;
    }
    formatOffset(t, e) {
      return Ii(this.fixed, e);
    }
    get isUniversal() {
      return !0;
    }
    offset() {
      return this.fixed;
    }
    equals(t) {
      return 'fixed' === t.type && t.fixed === this.fixed;
    }
    get isValid() {
      return !0;
    }
  }
  class uo extends io {
    constructor(t) {
      super(), (this.zoneName = t);
    }
    get type() {
      return 'invalid';
    }
    get name() {
      return this.zoneName;
    }
    get isUniversal() {
      return !1;
    }
    offsetName() {
      return null;
    }
    formatOffset() {
      return '';
    }
    offset() {
      return NaN;
    }
    equals() {
      return !1;
    }
    get isValid() {
      return !1;
    }
  }
  function po(t, e) {
    if (mi(t) || null === t) return e;
    if (t instanceof io) return t;
    if (
      (function(t) {
        return 'string' == typeof t;
      })(t)
    ) {
      const i = t.toLowerCase();
      return 'local' === i || 'system' === i
        ? e
        : 'utc' === i || 'gmt' === i
        ? co.utcInstance
        : co.parseSpecifier(i) || lo.create(t);
    }
    return gi(t)
      ? co.instance(t)
      : 'object' == typeof t && t.offset && 'number' == typeof t.offset
      ? t
      : new uo(t);
  }
  let mo,
    go = () => Date.now(),
    fo = 'system',
    vo = null,
    bo = null,
    yo = null;
  class _o {
    static get now() {
      return go;
    }
    static set now(t) {
      go = t;
    }
    static set defaultZone(t) {
      fo = t;
    }
    static get defaultZone() {
      return po(fo, no.instance);
    }
    static get defaultLocale() {
      return vo;
    }
    static set defaultLocale(t) {
      vo = t;
    }
    static get defaultNumberingSystem() {
      return bo;
    }
    static set defaultNumberingSystem(t) {
      bo = t;
    }
    static get defaultOutputCalendar() {
      return yo;
    }
    static set defaultOutputCalendar(t) {
      yo = t;
    }
    static get throwOnInvalid() {
      return mo;
    }
    static set throwOnInvalid(t) {
      mo = t;
    }
    static resetCaches() {
      Mo.resetCache(), lo.resetCache();
    }
  }
  let xo = {};
  let wo = {};
  function ko(t, e = {}) {
    const i = JSON.stringify([t, e]);
    let o = wo[i];
    return o || ((o = new Intl.DateTimeFormat(t, e)), (wo[i] = o)), o;
  }
  let Ao = {};
  let Co = {};
  let So = null;
  function Eo(t, e, i, o, n) {
    const s = t.listingMode(i);
    return 'error' === s ? null : 'en' === s ? o(e) : n(e);
  }
  class To {
    constructor(t, e, i) {
      (this.padTo = i.padTo || 0), (this.floor = i.floor || !1);
      const { padTo: o, floor: n, ...s } = i;
      if (!e || Object.keys(s).length > 0) {
        const e = { useGrouping: !1, ...i };
        i.padTo > 0 && (e.minimumIntegerDigits = i.padTo),
          (this.inf = (function(t, e = {}) {
            const i = JSON.stringify([t, e]);
            let o = Ao[i];
            return o || ((o = new Intl.NumberFormat(t, e)), (Ao[i] = o)), o;
          })(t, e));
      }
    }
    format(t) {
      if (this.inf) {
        const e = this.floor ? Math.floor(t) : t;
        return this.inf.format(e);
      }
      return xi(this.floor ? Math.floor(t) : Ci(t, 3), this.padTo);
    }
  }
  class $o {
    constructor(t, e, i) {
      let o;
      if (((this.opts = i), t.zone.isUniversal)) {
        const e = (t.offset / 60) * -1,
          n = e >= 0 ? `Etc/GMT+${e}` : `Etc/GMT${e}`;
        0 !== t.offset && lo.create(n).valid
          ? ((o = n), (this.dt = t))
          : ((o = 'UTC'),
            i.timeZoneName
              ? (this.dt = t)
              : (this.dt = 0 === t.offset ? t : Ls.fromMillis(t.ts + 60 * t.offset * 1e3)));
      } else 'system' === t.zone.type ? (this.dt = t) : ((this.dt = t), (o = t.zone.name));
      const n = { ...this.opts };
      o && (n.timeZone = o), (this.dtf = ko(e, n));
    }
    format() {
      return this.dtf.format(this.dt.toJSDate());
    }
    formatToParts() {
      return this.dtf.formatToParts(this.dt.toJSDate());
    }
    resolvedOptions() {
      return this.dtf.resolvedOptions();
    }
  }
  class Oo {
    constructor(t, e, i) {
      (this.opts = { style: 'long', ...i }),
        !e &&
          vi() &&
          (this.rtf = (function(t, e = {}) {
            const { base: i, ...o } = e,
              n = JSON.stringify([t, o]);
            let s = Co[n];
            return s || ((s = new Intl.RelativeTimeFormat(t, e)), (Co[n] = s)), s;
          })(t, i));
    }
    format(t, e) {
      return this.rtf
        ? this.rtf.format(t, e)
        : (function(t, e, i = 'always', o = !1) {
            const n = {
                years: ['year', 'yr.'],
                quarters: ['quarter', 'qtr.'],
                months: ['month', 'mo.'],
                weeks: ['week', 'wk.'],
                days: ['day', 'day', 'days'],
                hours: ['hour', 'hr.'],
                minutes: ['minute', 'min.'],
                seconds: ['second', 'sec.']
              },
              s = -1 === ['hours', 'minutes', 'seconds'].indexOf(t);
            if ('auto' === i && s) {
              const i = 'days' === t;
              switch (e) {
                case 1:
                  return i ? 'tomorrow' : `next ${n[t][0]}`;
                case -1:
                  return i ? 'yesterday' : `last ${n[t][0]}`;
                case 0:
                  return i ? 'today' : `this ${n[t][0]}`;
              }
            }
            const r = Object.is(e, -0) || e < 0,
              a = Math.abs(e),
              l = 1 === a,
              h = n[t],
              c = o ? (l ? h[1] : h[2] || h[1]) : l ? n[t][0] : t;
            return r ? `${a} ${c} ago` : `in ${a} ${c}`;
          })(e, t, this.opts.numeric, 'long' !== this.opts.style);
    }
    formatToParts(t, e) {
      return this.rtf ? this.rtf.formatToParts(t, e) : [];
    }
  }
  class Mo {
    static fromOpts(t) {
      return Mo.create(t.locale, t.numberingSystem, t.outputCalendar, t.defaultToEN);
    }
    static create(t, e, i, o = !1) {
      const n = t || _o.defaultLocale,
        s =
          n ||
          (o ? 'en-US' : So || ((So = new Intl.DateTimeFormat().resolvedOptions().locale), So)),
        r = e || _o.defaultNumberingSystem,
        a = i || _o.defaultOutputCalendar;
      return new Mo(s, r, a, n);
    }
    static resetCache() {
      (So = null), (wo = {}), (Ao = {}), (Co = {});
    }
    static fromObject({ locale: t, numberingSystem: e, outputCalendar: i } = {}) {
      return Mo.create(t, e, i);
    }
    constructor(t, e, i, o) {
      const [n, s, r] = (function(t) {
        const e = t.indexOf('-u-');
        if (-1 === e) return [t];
        {
          let i;
          const o = t.substring(0, e);
          try {
            i = ko(t).resolvedOptions();
          } catch (t) {
            i = ko(o).resolvedOptions();
          }
          const { numberingSystem: n, calendar: s } = i;
          return [o, n, s];
        }
      })(t);
      (this.locale = n),
        (this.numberingSystem = e || s || null),
        (this.outputCalendar = i || r || null),
        (this.intl = (function(t, e, i) {
          return i || e ? ((t += '-u'), i && (t += `-ca-${i}`), e && (t += `-nu-${e}`), t) : t;
        })(this.locale, this.numberingSystem, this.outputCalendar)),
        (this.weekdaysCache = { format: {}, standalone: {} }),
        (this.monthsCache = { format: {}, standalone: {} }),
        (this.meridiemCache = null),
        (this.eraCache = {}),
        (this.specifiedLocale = o),
        (this.fastNumbersCached = null);
    }
    get fastNumbers() {
      var t;
      return (
        null == this.fastNumbersCached &&
          (this.fastNumbersCached =
            (!(t = this).numberingSystem || 'latn' === t.numberingSystem) &&
            ('latn' === t.numberingSystem ||
              !t.locale ||
              t.locale.startsWith('en') ||
              'latn' === new Intl.DateTimeFormat(t.intl).resolvedOptions().numberingSystem)),
        this.fastNumbersCached
      );
    }
    listingMode() {
      const t = this.isEnglish(),
        e = !(
          (null !== this.numberingSystem && 'latn' !== this.numberingSystem) ||
          (null !== this.outputCalendar && 'gregory' !== this.outputCalendar)
        );
      return t && e ? 'en' : 'intl';
    }
    clone(t) {
      return t && 0 !== Object.getOwnPropertyNames(t).length
        ? Mo.create(
            t.locale || this.specifiedLocale,
            t.numberingSystem || this.numberingSystem,
            t.outputCalendar || this.outputCalendar,
            t.defaultToEN || !1
          )
        : this;
    }
    redefaultToEN(t = {}) {
      return this.clone({ ...t, defaultToEN: !0 });
    }
    redefaultToSystem(t = {}) {
      return this.clone({ ...t, defaultToEN: !1 });
    }
    months(t, e = !1, i = !0) {
      return Eo(this, t, i, Fi, () => {
        const i = e ? { month: t, day: 'numeric' } : { month: t },
          o = e ? 'format' : 'standalone';
        return (
          this.monthsCache[o][t] ||
            (this.monthsCache[o][t] = (function(t) {
              const e = [];
              for (let i = 1; i <= 12; i++) {
                const o = Ls.utc(2016, i, 1);
                e.push(t(o));
              }
              return e;
            })(t => this.extract(t, i, 'month'))),
          this.monthsCache[o][t]
        );
      });
    }
    weekdays(t, e = !1, i = !0) {
      return Eo(this, t, i, Vi, () => {
        const i = e
            ? { weekday: t, year: 'numeric', month: 'long', day: 'numeric' }
            : { weekday: t },
          o = e ? 'format' : 'standalone';
        return (
          this.weekdaysCache[o][t] ||
            (this.weekdaysCache[o][t] = (function(t) {
              const e = [];
              for (let i = 1; i <= 7; i++) {
                const o = Ls.utc(2016, 11, 13 + i);
                e.push(t(o));
              }
              return e;
            })(t => this.extract(t, i, 'weekday'))),
          this.weekdaysCache[o][t]
        );
      });
    }
    meridiems(t = !0) {
      return Eo(
        this,
        void 0,
        t,
        () => Wi,
        () => {
          if (!this.meridiemCache) {
            const t = { hour: 'numeric', hourCycle: 'h12' };
            this.meridiemCache = [Ls.utc(2016, 11, 13, 9), Ls.utc(2016, 11, 13, 19)].map(e =>
              this.extract(e, t, 'dayperiod')
            );
          }
          return this.meridiemCache;
        }
      );
    }
    eras(t, e = !0) {
      return Eo(this, t, e, Yi, () => {
        const e = { era: t };
        return (
          this.eraCache[t] ||
            (this.eraCache[t] = [Ls.utc(-40, 1, 1), Ls.utc(2017, 1, 1)].map(t =>
              this.extract(t, e, 'era')
            )),
          this.eraCache[t]
        );
      });
    }
    extract(t, e, i) {
      const o = this.dtFormatter(t, e)
        .formatToParts()
        .find(t => t.type.toLowerCase() === i);
      return o ? o.value : null;
    }
    numberFormatter(t = {}) {
      return new To(this.intl, t.forceSimple || this.fastNumbers, t);
    }
    dtFormatter(t, e = {}) {
      return new $o(t, this.intl, e);
    }
    relFormatter(t = {}) {
      return new Oo(this.intl, this.isEnglish(), t);
    }
    listFormatter(t = {}) {
      return (function(t, e = {}) {
        const i = JSON.stringify([t, e]);
        let o = xo[i];
        return o || ((o = new Intl.ListFormat(t, e)), (xo[i] = o)), o;
      })(this.intl, t);
    }
    isEnglish() {
      return (
        'en' === this.locale ||
        'en-us' === this.locale.toLowerCase() ||
        new Intl.DateTimeFormat(this.intl).resolvedOptions().locale.startsWith('en-us')
      );
    }
    equals(t) {
      return (
        this.locale === t.locale &&
        this.numberingSystem === t.numberingSystem &&
        this.outputCalendar === t.outputCalendar
      );
    }
  }
  function Lo(...t) {
    const e = t.reduce((t, e) => t + e.source, '');
    return RegExp(`^${e}$`);
  }
  function zo(...t) {
    return e =>
      t
        .reduce(
          ([t, i, o], n) => {
            const [s, r, a] = n(e, o);
            return [{ ...t, ...s }, r || i, a];
          },
          [{}, null, 1]
        )
        .slice(0, 2);
  }
  function Po(t, ...e) {
    if (null == t) return [null, null];
    for (const [i, o] of e) {
      const e = i.exec(t);
      if (e) return o(e);
    }
    return [null, null];
  }
  function Do(...t) {
    return (e, i) => {
      const o = {};
      let n;
      for (n = 0; n < t.length; n++) o[t[n]] = wi(e[i + n]);
      return [o, null, i + n];
    };
  }
  const Io = /(?:(Z)|([+-]\d\d)(?::?(\d\d))?)/,
    No = /(\d\d)(?::?(\d\d)(?::?(\d\d)(?:[.,](\d{1,30}))?)?)?/,
    Bo = RegExp(`${No.source}${`(?:${Io.source}?(?:\\[(${Bi.source})\\])?)?`}`),
    Ro = RegExp(`(?:T${Bo.source})?`),
    qo = Do('weekYear', 'weekNumber', 'weekDay'),
    Uo = Do('year', 'ordinal'),
    Fo = RegExp(`${No.source} ?(?:${Io.source}|(${Bi.source}))?`),
    Zo = RegExp(`(?: ${Fo.source})?`);
  function jo(t, e, i) {
    const o = t[e];
    return mi(o) ? i : wi(o);
  }
  function Ho(t, e) {
    return [
      {
        hours: jo(t, e, 0),
        minutes: jo(t, e + 1, 0),
        seconds: jo(t, e + 2, 0),
        milliseconds: Ai(t[e + 3])
      },
      null,
      e + 4
    ];
  }
  function Vo(t, e) {
    const i = !t[e] && !t[e + 1],
      o = zi(t[e + 1], t[e + 2]);
    return [{}, i ? null : co.instance(o), e + 3];
  }
  function Wo(t, e) {
    return [{}, t[e] ? lo.create(t[e]) : null, e + 1];
  }
  const Go = RegExp(`^T?${No.source}$`),
    Qo = /^-?P(?:(?:(-?\d{1,20}(?:\.\d{1,20})?)Y)?(?:(-?\d{1,20}(?:\.\d{1,20})?)M)?(?:(-?\d{1,20}(?:\.\d{1,20})?)W)?(?:(-?\d{1,20}(?:\.\d{1,20})?)D)?(?:T(?:(-?\d{1,20}(?:\.\d{1,20})?)H)?(?:(-?\d{1,20}(?:\.\d{1,20})?)M)?(?:(-?\d{1,20})(?:[.,](-?\d{1,20}))?S)?)?)$/;
  function Ko(t) {
    const [e, i, o, n, s, r, a, l, h] = t,
      c = '-' === e[0],
      d = l && '-' === l[0],
      u = (t, e = !1) => (void 0 !== t && (e || (t && c)) ? -t : t);
    return [
      {
        years: u(ki(i)),
        months: u(ki(o)),
        weeks: u(ki(n)),
        days: u(ki(s)),
        hours: u(ki(r)),
        minutes: u(ki(a)),
        seconds: u(ki(l), '-0' === l),
        milliseconds: u(Ai(h), d)
      }
    ];
  }
  const Yo = {
    GMT: 0,
    EDT: -240,
    EST: -300,
    CDT: -300,
    CST: -360,
    MDT: -360,
    MST: -420,
    PDT: -420,
    PST: -480
  };
  function Jo(t, e, i, o, n, s, r) {
    const a = {
      year: 2 === e.length ? Mi(wi(e)) : wi(e),
      month: qi.indexOf(i) + 1,
      day: wi(o),
      hour: wi(n),
      minute: wi(s)
    };
    return (
      r && (a.second = wi(r)),
      t && (a.weekday = t.length > 3 ? Zi.indexOf(t) + 1 : ji.indexOf(t) + 1),
      a
    );
  }
  const Xo = /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|(?:([+-]\d\d)(\d\d)))$/;
  function tn(t) {
    const [, e, i, o, n, s, r, a, l, h, c, d] = t,
      u = Jo(e, n, o, i, s, r, a);
    let p;
    return (p = l ? Yo[l] : h ? 0 : zi(c, d)), [u, new co(p)];
  }
  const en = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun), (\d\d) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4}) (\d\d):(\d\d):(\d\d) GMT$/,
    on = /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday), (\d\d)-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-(\d\d) (\d\d):(\d\d):(\d\d) GMT$/,
    nn = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) ( \d|\d\d) (\d\d):(\d\d):(\d\d) (\d{4})$/;
  function sn(t) {
    const [, e, i, o, n, s, r, a] = t;
    return [Jo(e, n, o, i, s, r, a), co.utcInstance];
  }
  function rn(t) {
    const [, e, i, o, n, s, r, a] = t;
    return [Jo(e, a, i, o, n, s, r), co.utcInstance];
  }
  const an = Lo(/([+-]\d{6}|\d{4})(?:-?(\d\d)(?:-?(\d\d))?)?/, Ro),
    ln = Lo(/(\d{4})-?W(\d\d)(?:-?(\d))?/, Ro),
    hn = Lo(/(\d{4})-?(\d{3})/, Ro),
    cn = Lo(Bo),
    dn = zo(
      function(t, e) {
        return [{ year: jo(t, e), month: jo(t, e + 1, 1), day: jo(t, e + 2, 1) }, null, e + 3];
      },
      Ho,
      Vo,
      Wo
    ),
    un = zo(qo, Ho, Vo, Wo),
    pn = zo(Uo, Ho, Vo, Wo),
    mn = zo(Ho, Vo, Wo);
  const gn = zo(Ho);
  const fn = Lo(/(\d{4})-(\d\d)-(\d\d)/, Zo),
    vn = Lo(Fo),
    bn = zo(Ho, Vo, Wo);
  const yn = {
      weeks: { days: 7, hours: 168, minutes: 10080, seconds: 604800, milliseconds: 6048e5 },
      days: { hours: 24, minutes: 1440, seconds: 86400, milliseconds: 864e5 },
      hours: { minutes: 60, seconds: 3600, milliseconds: 36e5 },
      minutes: { seconds: 60, milliseconds: 6e4 },
      seconds: { milliseconds: 1e3 }
    },
    _n = {
      years: {
        quarters: 4,
        months: 12,
        weeks: 52,
        days: 365,
        hours: 8760,
        minutes: 525600,
        seconds: 31536e3,
        milliseconds: 31536e6
      },
      quarters: {
        months: 3,
        weeks: 13,
        days: 91,
        hours: 2184,
        minutes: 131040,
        seconds: 7862400,
        milliseconds: 78624e5
      },
      months: {
        weeks: 4,
        days: 30,
        hours: 720,
        minutes: 43200,
        seconds: 2592e3,
        milliseconds: 2592e6
      },
      ...yn
    },
    xn = 365.2425,
    wn = 30.436875,
    kn = {
      years: {
        quarters: 4,
        months: 12,
        weeks: 52.1775,
        days: xn,
        hours: 8765.82,
        minutes: 525949.2,
        seconds: 525949.2 * 60,
        milliseconds: 525949.2 * 60 * 1e3
      },
      quarters: {
        months: 3,
        weeks: 13.044375,
        days: 91.310625,
        hours: 2191.455,
        minutes: 131487.3,
        seconds: (525949.2 * 60) / 4,
        milliseconds: 7889237999.999999
      },
      months: {
        weeks: 4.3481250000000005,
        days: wn,
        hours: 730.485,
        minutes: 43829.1,
        seconds: 2629746,
        milliseconds: 2629746e3
      },
      ...yn
    },
    An = [
      'years',
      'quarters',
      'months',
      'weeks',
      'days',
      'hours',
      'minutes',
      'seconds',
      'milliseconds'
    ],
    Cn = An.slice(0).reverse();
  function Sn(t, e, i = !1) {
    const o = {
      values: i ? e.values : { ...t.values, ...(e.values || {}) },
      loc: t.loc.clone(e.loc),
      conversionAccuracy: e.conversionAccuracy || t.conversionAccuracy
    };
    return new Tn(o);
  }
  function En(t, e, i, o, n) {
    const s = t[n][i],
      r = e[i] / s,
      a =
        !(Math.sign(r) === Math.sign(o[n])) && 0 !== o[n] && Math.abs(r) <= 1
          ? (function(t) {
              return t < 0 ? Math.floor(t) : Math.ceil(t);
            })(r)
          : Math.trunc(r);
    (o[n] += a), (e[i] -= a * s);
  }
  class Tn {
    constructor(t) {
      const e = 'longterm' === t.conversionAccuracy || !1;
      (this.values = t.values),
        (this.loc = t.loc || Mo.create()),
        (this.conversionAccuracy = e ? 'longterm' : 'casual'),
        (this.invalid = t.invalid || null),
        (this.matrix = e ? kn : _n),
        (this.isLuxonDuration = !0);
    }
    static fromMillis(t, e) {
      return Tn.fromObject({ milliseconds: t }, e);
    }
    static fromObject(t, e = {}) {
      if (null == t || 'object' != typeof t)
        throw new Ue(
          'Duration.fromObject: argument expected to be an object, got ' +
            (null === t ? 'null' : typeof t)
        );
      return new Tn({
        values: Di(t, Tn.normalizeUnit),
        loc: Mo.fromObject(e),
        conversionAccuracy: e.conversionAccuracy
      });
    }
    static fromDurationLike(t) {
      if (gi(t)) return Tn.fromMillis(t);
      if (Tn.isDuration(t)) return t;
      if ('object' == typeof t) return Tn.fromObject(t);
      throw new Ue(`Unknown duration argument ${t} of type ${typeof t}`);
    }
    static fromISO(t, e) {
      const [i] = (function(t) {
        return Po(t, [Qo, Ko]);
      })(t);
      return i
        ? Tn.fromObject(i, e)
        : Tn.invalid('unparsable', `the input "${t}" can't be parsed as ISO 8601`);
    }
    static fromISOTime(t, e) {
      const [i] = (function(t) {
        return Po(t, [Go, gn]);
      })(t);
      return i
        ? Tn.fromObject(i, e)
        : Tn.invalid('unparsable', `the input "${t}" can't be parsed as ISO 8601`);
    }
    static invalid(t, e = null) {
      if (!t) throw new Ue('need to specify a reason the Duration is invalid');
      const i = t instanceof eo ? t : new eo(t, e);
      if (_o.throwOnInvalid) throw new Be(i);
      return new Tn({ invalid: i });
    }
    static normalizeUnit(t) {
      const e = {
        year: 'years',
        years: 'years',
        quarter: 'quarters',
        quarters: 'quarters',
        month: 'months',
        months: 'months',
        week: 'weeks',
        weeks: 'weeks',
        day: 'days',
        days: 'days',
        hour: 'hours',
        hours: 'hours',
        minute: 'minutes',
        minutes: 'minutes',
        second: 'seconds',
        seconds: 'seconds',
        millisecond: 'milliseconds',
        milliseconds: 'milliseconds'
      }[t ? t.toLowerCase() : t];
      if (!e) throw new qe(t);
      return e;
    }
    static isDuration(t) {
      return (t && t.isLuxonDuration) || !1;
    }
    get locale() {
      return this.isValid ? this.loc.locale : null;
    }
    get numberingSystem() {
      return this.isValid ? this.loc.numberingSystem : null;
    }
    toFormat(t, e = {}) {
      const i = { ...e, floor: !1 !== e.round && !1 !== e.floor };
      return this.isValid
        ? to.create(this.loc, i).formatDurationFromString(this, t)
        : 'Invalid Duration';
    }
    toHuman(t = {}) {
      const e = An.map(e => {
        const i = this.values[e];
        return mi(i)
          ? null
          : this.loc
              .numberFormatter({ style: 'unit', unitDisplay: 'long', ...t, unit: e.slice(0, -1) })
              .format(i);
      }).filter(t => t);
      return this.loc
        .listFormatter({ type: 'conjunction', style: t.listStyle || 'narrow', ...t })
        .format(e);
    }
    toObject() {
      return this.isValid ? { ...this.values } : {};
    }
    toISO() {
      if (!this.isValid) return null;
      let t = 'P';
      return (
        0 !== this.years && (t += this.years + 'Y'),
        (0 === this.months && 0 === this.quarters) || (t += this.months + 3 * this.quarters + 'M'),
        0 !== this.weeks && (t += this.weeks + 'W'),
        0 !== this.days && (t += this.days + 'D'),
        (0 === this.hours && 0 === this.minutes && 0 === this.seconds && 0 === this.milliseconds) ||
          (t += 'T'),
        0 !== this.hours && (t += this.hours + 'H'),
        0 !== this.minutes && (t += this.minutes + 'M'),
        (0 === this.seconds && 0 === this.milliseconds) ||
          (t += Ci(this.seconds + this.milliseconds / 1e3, 3) + 'S'),
        'P' === t && (t += 'T0S'),
        t
      );
    }
    toISOTime(t = {}) {
      if (!this.isValid) return null;
      const e = this.toMillis();
      if (e < 0 || e >= 864e5) return null;
      t = {
        suppressMilliseconds: !1,
        suppressSeconds: !1,
        includePrefix: !1,
        format: 'extended',
        ...t
      };
      const i = this.shiftTo('hours', 'minutes', 'seconds', 'milliseconds');
      let o = 'basic' === t.format ? 'hhmm' : 'hh:mm';
      (t.suppressSeconds && 0 === i.seconds && 0 === i.milliseconds) ||
        ((o += 'basic' === t.format ? 'ss' : ':ss'),
        (t.suppressMilliseconds && 0 === i.milliseconds) || (o += '.SSS'));
      let n = i.toFormat(o);
      return t.includePrefix && (n = 'T' + n), n;
    }
    toJSON() {
      return this.toISO();
    }
    toString() {
      return this.toISO();
    }
    toMillis() {
      return this.as('milliseconds');
    }
    valueOf() {
      return this.toMillis();
    }
    plus(t) {
      if (!this.isValid) return this;
      const e = Tn.fromDurationLike(t),
        i = {};
      for (const t of An)
        (yi(e.values, t) || yi(this.values, t)) && (i[t] = e.get(t) + this.get(t));
      return Sn(this, { values: i }, !0);
    }
    minus(t) {
      if (!this.isValid) return this;
      const e = Tn.fromDurationLike(t);
      return this.plus(e.negate());
    }
    mapUnits(t) {
      if (!this.isValid) return this;
      const e = {};
      for (const i of Object.keys(this.values)) e[i] = Pi(t(this.values[i], i));
      return Sn(this, { values: e }, !0);
    }
    get(t) {
      return this[Tn.normalizeUnit(t)];
    }
    set(t) {
      if (!this.isValid) return this;
      return Sn(this, { values: { ...this.values, ...Di(t, Tn.normalizeUnit) } });
    }
    reconfigure({ locale: t, numberingSystem: e, conversionAccuracy: i } = {}) {
      const o = { loc: this.loc.clone({ locale: t, numberingSystem: e }) };
      return i && (o.conversionAccuracy = i), Sn(this, o);
    }
    as(t) {
      return this.isValid ? this.shiftTo(t).get(t) : NaN;
    }
    normalize() {
      if (!this.isValid) return this;
      const t = this.toObject();
      return (
        (function(t, e) {
          Cn.reduce((i, o) => (mi(e[o]) ? i : (i && En(t, e, i, e, o), o)), null);
        })(this.matrix, t),
        Sn(this, { values: t }, !0)
      );
    }
    shiftTo(...t) {
      if (!this.isValid) return this;
      if (0 === t.length) return this;
      t = t.map(t => Tn.normalizeUnit(t));
      const e = {},
        i = {},
        o = this.toObject();
      let n;
      for (const s of An)
        if (t.indexOf(s) >= 0) {
          n = s;
          let t = 0;
          for (const e in i) (t += this.matrix[e][s] * i[e]), (i[e] = 0);
          gi(o[s]) && (t += o[s]);
          const r = Math.trunc(t);
          (e[s] = r), (i[s] = (1e3 * t - 1e3 * r) / 1e3);
          for (const t in o) An.indexOf(t) > An.indexOf(s) && En(this.matrix, o, t, e, s);
        } else gi(o[s]) && (i[s] = o[s]);
      for (const t in i) 0 !== i[t] && (e[n] += t === n ? i[t] : i[t] / this.matrix[n][t]);
      return Sn(this, { values: e }, !0).normalize();
    }
    negate() {
      if (!this.isValid) return this;
      const t = {};
      for (const e of Object.keys(this.values)) t[e] = 0 === this.values[e] ? 0 : -this.values[e];
      return Sn(this, { values: t }, !0);
    }
    get years() {
      return this.isValid ? this.values.years || 0 : NaN;
    }
    get quarters() {
      return this.isValid ? this.values.quarters || 0 : NaN;
    }
    get months() {
      return this.isValid ? this.values.months || 0 : NaN;
    }
    get weeks() {
      return this.isValid ? this.values.weeks || 0 : NaN;
    }
    get days() {
      return this.isValid ? this.values.days || 0 : NaN;
    }
    get hours() {
      return this.isValid ? this.values.hours || 0 : NaN;
    }
    get minutes() {
      return this.isValid ? this.values.minutes || 0 : NaN;
    }
    get seconds() {
      return this.isValid ? this.values.seconds || 0 : NaN;
    }
    get milliseconds() {
      return this.isValid ? this.values.milliseconds || 0 : NaN;
    }
    get isValid() {
      return null === this.invalid;
    }
    get invalidReason() {
      return this.invalid ? this.invalid.reason : null;
    }
    get invalidExplanation() {
      return this.invalid ? this.invalid.explanation : null;
    }
    equals(t) {
      if (!this.isValid || !t.isValid) return !1;
      if (!this.loc.equals(t.loc)) return !1;
      for (const o of An)
        if (
          ((e = this.values[o]),
          (i = t.values[o]),
          !(void 0 === e || 0 === e ? void 0 === i || 0 === i : e === i))
        )
          return !1;
      var e, i;
      return !0;
    }
  }
  const $n = 'Invalid Interval';
  class On {
    constructor(t) {
      (this.s = t.start),
        (this.e = t.end),
        (this.invalid = t.invalid || null),
        (this.isLuxonInterval = !0);
    }
    static invalid(t, e = null) {
      if (!t) throw new Ue('need to specify a reason the Interval is invalid');
      const i = t instanceof eo ? t : new eo(t, e);
      if (_o.throwOnInvalid) throw new Ne(i);
      return new On({ invalid: i });
    }
    static fromDateTimes(t, e) {
      const i = zs(t),
        o = zs(e),
        n = (function(t, e) {
          return t && t.isValid
            ? e && e.isValid
              ? e < t
                ? On.invalid(
                    'end before start',
                    `The end of an interval must be after its start, but you had start=${t.toISO()} and end=${e.toISO()}`
                  )
                : null
              : On.invalid('missing or invalid end')
            : On.invalid('missing or invalid start');
        })(i, o);
      return null == n ? new On({ start: i, end: o }) : n;
    }
    static after(t, e) {
      const i = Tn.fromDurationLike(e),
        o = zs(t);
      return On.fromDateTimes(o, o.plus(i));
    }
    static before(t, e) {
      const i = Tn.fromDurationLike(e),
        o = zs(t);
      return On.fromDateTimes(o.minus(i), o);
    }
    static fromISO(t, e) {
      const [i, o] = (t || '').split('/', 2);
      if (i && o) {
        let t, n, s, r;
        try {
          (t = Ls.fromISO(i, e)), (n = t.isValid);
        } catch (o) {
          n = !1;
        }
        try {
          (s = Ls.fromISO(o, e)), (r = s.isValid);
        } catch (o) {
          r = !1;
        }
        if (n && r) return On.fromDateTimes(t, s);
        if (n) {
          const i = Tn.fromISO(o, e);
          if (i.isValid) return On.after(t, i);
        } else if (r) {
          const t = Tn.fromISO(i, e);
          if (t.isValid) return On.before(s, t);
        }
      }
      return On.invalid('unparsable', `the input "${t}" can't be parsed as ISO 8601`);
    }
    static isInterval(t) {
      return (t && t.isLuxonInterval) || !1;
    }
    get start() {
      return this.isValid ? this.s : null;
    }
    get end() {
      return this.isValid ? this.e : null;
    }
    get isValid() {
      return null === this.invalidReason;
    }
    get invalidReason() {
      return this.invalid ? this.invalid.reason : null;
    }
    get invalidExplanation() {
      return this.invalid ? this.invalid.explanation : null;
    }
    length(t = 'milliseconds') {
      return this.isValid ? this.toDuration(t).get(t) : NaN;
    }
    count(t = 'milliseconds') {
      if (!this.isValid) return NaN;
      const e = this.start.startOf(t),
        i = this.end.startOf(t);
      return Math.floor(i.diff(e, t).get(t)) + 1;
    }
    hasSame(t) {
      return !!this.isValid && (this.isEmpty() || this.e.minus(1).hasSame(this.s, t));
    }
    isEmpty() {
      return this.s.valueOf() === this.e.valueOf();
    }
    isAfter(t) {
      return !!this.isValid && this.s > t;
    }
    isBefore(t) {
      return !!this.isValid && this.e <= t;
    }
    contains(t) {
      return !!this.isValid && (this.s <= t && this.e > t);
    }
    set({ start: t, end: e } = {}) {
      return this.isValid ? On.fromDateTimes(t || this.s, e || this.e) : this;
    }
    splitAt(...t) {
      if (!this.isValid) return [];
      const e = t
          .map(zs)
          .filter(t => this.contains(t))
          .sort(),
        i = [];
      let { s: o } = this,
        n = 0;
      for (; o < this.e; ) {
        const t = e[n] || this.e,
          s = +t > +this.e ? this.e : t;
        i.push(On.fromDateTimes(o, s)), (o = s), (n += 1);
      }
      return i;
    }
    splitBy(t) {
      const e = Tn.fromDurationLike(t);
      if (!this.isValid || !e.isValid || 0 === e.as('milliseconds')) return [];
      let i,
        { s: o } = this,
        n = 1;
      const s = [];
      for (; o < this.e; ) {
        const t = this.start.plus(e.mapUnits(t => t * n));
        (i = +t > +this.e ? this.e : t), s.push(On.fromDateTimes(o, i)), (o = i), (n += 1);
      }
      return s;
    }
    divideEqually(t) {
      return this.isValid ? this.splitBy(this.length() / t).slice(0, t) : [];
    }
    overlaps(t) {
      return this.e > t.s && this.s < t.e;
    }
    abutsStart(t) {
      return !!this.isValid && +this.e == +t.s;
    }
    abutsEnd(t) {
      return !!this.isValid && +t.e == +this.s;
    }
    engulfs(t) {
      return !!this.isValid && (this.s <= t.s && this.e >= t.e);
    }
    equals(t) {
      return !(!this.isValid || !t.isValid) && (this.s.equals(t.s) && this.e.equals(t.e));
    }
    intersection(t) {
      if (!this.isValid) return this;
      const e = this.s > t.s ? this.s : t.s,
        i = this.e < t.e ? this.e : t.e;
      return e >= i ? null : On.fromDateTimes(e, i);
    }
    union(t) {
      if (!this.isValid) return this;
      const e = this.s < t.s ? this.s : t.s,
        i = this.e > t.e ? this.e : t.e;
      return On.fromDateTimes(e, i);
    }
    static merge(t) {
      const [e, i] = t
        .sort((t, e) => t.s - e.s)
        .reduce(
          ([t, e], i) =>
            e ? (e.overlaps(i) || e.abutsStart(i) ? [t, e.union(i)] : [t.concat([e]), i]) : [t, i],
          [[], null]
        );
      return i && e.push(i), e;
    }
    static xor(t) {
      let e = null,
        i = 0;
      const o = [],
        n = t.map(t => [{ time: t.s, type: 's' }, { time: t.e, type: 'e' }]),
        s = Array.prototype.concat(...n).sort((t, e) => t.time - e.time);
      for (const t of s)
        (i += 's' === t.type ? 1 : -1),
          1 === i
            ? (e = t.time)
            : (e && +e != +t.time && o.push(On.fromDateTimes(e, t.time)), (e = null));
      return On.merge(o);
    }
    difference(...t) {
      return On.xor([this].concat(t))
        .map(t => this.intersection(t))
        .filter(t => t && !t.isEmpty());
    }
    toString() {
      return this.isValid ? `[${this.s.toISO()} – ${this.e.toISO()})` : $n;
    }
    toISO(t) {
      return this.isValid ? `${this.s.toISO(t)}/${this.e.toISO(t)}` : $n;
    }
    toISODate() {
      return this.isValid ? `${this.s.toISODate()}/${this.e.toISODate()}` : $n;
    }
    toISOTime(t) {
      return this.isValid ? `${this.s.toISOTime(t)}/${this.e.toISOTime(t)}` : $n;
    }
    toFormat(t, { separator: e = ' – ' } = {}) {
      return this.isValid ? `${this.s.toFormat(t)}${e}${this.e.toFormat(t)}` : $n;
    }
    toDuration(t, e) {
      return this.isValid ? this.e.diff(this.s, t, e) : Tn.invalid(this.invalidReason);
    }
    mapEndpoints(t) {
      return On.fromDateTimes(t(this.s), t(this.e));
    }
  }
  class Mn {
    static hasDST(t = _o.defaultZone) {
      const e = Ls.now()
        .setZone(t)
        .set({ month: 12 });
      return !t.isUniversal && e.offset !== e.set({ month: 6 }).offset;
    }
    static isValidIANAZone(t) {
      return lo.isValidZone(t);
    }
    static normalizeZone(t) {
      return po(t, _o.defaultZone);
    }
    static months(
      t = 'long',
      {
        locale: e = null,
        numberingSystem: i = null,
        locObj: o = null,
        outputCalendar: n = 'gregory'
      } = {}
    ) {
      return (o || Mo.create(e, i, n)).months(t);
    }
    static monthsFormat(
      t = 'long',
      {
        locale: e = null,
        numberingSystem: i = null,
        locObj: o = null,
        outputCalendar: n = 'gregory'
      } = {}
    ) {
      return (o || Mo.create(e, i, n)).months(t, !0);
    }
    static weekdays(
      t = 'long',
      { locale: e = null, numberingSystem: i = null, locObj: o = null } = {}
    ) {
      return (o || Mo.create(e, i, null)).weekdays(t);
    }
    static weekdaysFormat(
      t = 'long',
      { locale: e = null, numberingSystem: i = null, locObj: o = null } = {}
    ) {
      return (o || Mo.create(e, i, null)).weekdays(t, !0);
    }
    static meridiems({ locale: t = null } = {}) {
      return Mo.create(t).meridiems();
    }
    static eras(t = 'short', { locale: e = null } = {}) {
      return Mo.create(e, null, 'gregory').eras(t);
    }
    static features() {
      return { relative: vi() };
    }
  }
  function Ln(t, e) {
    const i = t =>
        t
          .toUTC(0, { keepLocalTime: !0 })
          .startOf('day')
          .valueOf(),
      o = i(e) - i(t);
    return Math.floor(Tn.fromMillis(o).as('days'));
  }
  function zn(t, e, i, o) {
    let [n, s, r, a] = (function(t, e, i) {
      const o = [
          ['years', (t, e) => e.year - t.year],
          ['quarters', (t, e) => e.quarter - t.quarter],
          ['months', (t, e) => e.month - t.month + 12 * (e.year - t.year)],
          [
            'weeks',
            (t, e) => {
              const i = Ln(t, e);
              return (i - (i % 7)) / 7;
            }
          ],
          ['days', Ln]
        ],
        n = {};
      let s, r;
      for (const [a, l] of o)
        if (i.indexOf(a) >= 0) {
          s = a;
          let i = l(t, e);
          (r = t.plus({ [a]: i })),
            r > e ? ((t = t.plus({ [a]: i - 1 })), (i -= 1)) : (t = r),
            (n[a] = i);
        }
      return [t, n, r, s];
    })(t, e, i);
    const l = e - n,
      h = i.filter(t => ['hours', 'minutes', 'seconds', 'milliseconds'].indexOf(t) >= 0);
    0 === h.length &&
      (r < e && (r = n.plus({ [a]: 1 })), r !== n && (s[a] = (s[a] || 0) + l / (r - n)));
    const c = Tn.fromObject(s, o);
    return h.length > 0
      ? Tn.fromMillis(l, o)
          .shiftTo(...h)
          .plus(c)
      : c;
  }
  const Pn = {
      arab: '[٠-٩]',
      arabext: '[۰-۹]',
      bali: '[᭐-᭙]',
      beng: '[০-৯]',
      deva: '[०-९]',
      fullwide: '[０-９]',
      gujr: '[૦-૯]',
      hanidec: '[〇|一|二|三|四|五|六|七|八|九]',
      khmr: '[០-៩]',
      knda: '[೦-೯]',
      laoo: '[໐-໙]',
      limb: '[᥆-᥏]',
      mlym: '[൦-൯]',
      mong: '[᠐-᠙]',
      mymr: '[၀-၉]',
      orya: '[୦-୯]',
      tamldec: '[௦-௯]',
      telu: '[౦-౯]',
      thai: '[๐-๙]',
      tibt: '[༠-༩]',
      latn: '\\d'
    },
    Dn = {
      arab: [1632, 1641],
      arabext: [1776, 1785],
      bali: [6992, 7001],
      beng: [2534, 2543],
      deva: [2406, 2415],
      fullwide: [65296, 65303],
      gujr: [2790, 2799],
      khmr: [6112, 6121],
      knda: [3302, 3311],
      laoo: [3792, 3801],
      limb: [6470, 6479],
      mlym: [3430, 3439],
      mong: [6160, 6169],
      mymr: [4160, 4169],
      orya: [2918, 2927],
      tamldec: [3046, 3055],
      telu: [3174, 3183],
      thai: [3664, 3673],
      tibt: [3872, 3881]
    },
    In = Pn.hanidec.replace(/[\[|\]]/g, '').split('');
  function Nn({ numberingSystem: t }, e = '') {
    return new RegExp(`${Pn[t || 'latn']}${e}`);
  }
  const Bn = 'missing Intl.DateTimeFormat.formatToParts support';
  function Rn(t, e = t => t) {
    return {
      regex: t,
      deser: ([t]) =>
        e(
          (function(t) {
            let e = parseInt(t, 10);
            if (isNaN(e)) {
              e = '';
              for (let i = 0; i < t.length; i++) {
                const o = t.charCodeAt(i);
                if (-1 !== t[i].search(Pn.hanidec)) e += In.indexOf(t[i]);
                else
                  for (const t in Dn) {
                    const [i, n] = Dn[t];
                    o >= i && o <= n && (e += o - i);
                  }
              }
              return parseInt(e, 10);
            }
            return e;
          })(t)
        )
    };
  }
  const qn = `[ ${String.fromCharCode(160)}]`,
    Un = new RegExp(qn, 'g');
  function Fn(t) {
    return t.replace(/\./g, '\\.?').replace(Un, qn);
  }
  function Zn(t) {
    return t
      .replace(/\./g, '')
      .replace(Un, ' ')
      .toLowerCase();
  }
  function jn(t, e) {
    return null === t
      ? null
      : {
          regex: RegExp(t.map(Fn).join('|')),
          deser: ([i]) => t.findIndex(t => Zn(i) === Zn(t)) + e
        };
  }
  function Hn(t, e) {
    return { regex: t, deser: ([, t, e]) => zi(t, e), groups: e };
  }
  function Vn(t) {
    return { regex: t, deser: ([t]) => t };
  }
  const Wn = {
    year: { '2-digit': 'yy', numeric: 'yyyyy' },
    month: { numeric: 'M', '2-digit': 'MM', short: 'MMM', long: 'MMMM' },
    day: { numeric: 'd', '2-digit': 'dd' },
    weekday: { short: 'EEE', long: 'EEEE' },
    dayperiod: 'a',
    dayPeriod: 'a',
    hour: { numeric: 'h', '2-digit': 'hh' },
    minute: { numeric: 'm', '2-digit': 'mm' },
    second: { numeric: 's', '2-digit': 'ss' }
  };
  let Gn = null;
  function Qn(t, e) {
    if (t.literal) return t;
    const i = to.macroTokenToFormatOpts(t.val);
    if (!i) return t;
    const o = to
      .create(e, i)
      .formatDateTimeParts((Gn || (Gn = Ls.fromMillis(1555555555555)), Gn))
      .map(t =>
        (function(t, e, i) {
          const { type: o, value: n } = t;
          if ('literal' === o) return { literal: !0, val: n };
          const s = i[o];
          let r = Wn[o];
          return 'object' == typeof r && (r = r[s]), r ? { literal: !1, val: r } : void 0;
        })(t, 0, i)
      );
    return o.includes(void 0) ? t : o;
  }
  function Kn(t, e, i) {
    const o = (function(t, e) {
        return Array.prototype.concat(...t.map(t => Qn(t, e)));
      })(to.parseFormat(i), t),
      n = o.map(e =>
        (function(t, e) {
          const i = Nn(e),
            o = Nn(e, '{2}'),
            n = Nn(e, '{3}'),
            s = Nn(e, '{4}'),
            r = Nn(e, '{6}'),
            a = Nn(e, '{1,2}'),
            l = Nn(e, '{1,3}'),
            h = Nn(e, '{1,6}'),
            c = Nn(e, '{1,9}'),
            d = Nn(e, '{2,4}'),
            u = Nn(e, '{4,6}'),
            p = t => {
              return {
                regex: RegExp(((e = t.val), e.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&'))),
                deser: ([t]) => t,
                literal: !0
              };
              var e;
            },
            m = (m => {
              if (t.literal) return p(m);
              switch (m.val) {
                case 'G':
                  return jn(e.eras('short', !1), 0);
                case 'GG':
                  return jn(e.eras('long', !1), 0);
                case 'y':
                  return Rn(h);
                case 'yy':
                case 'kk':
                  return Rn(d, Mi);
                case 'yyyy':
                case 'kkkk':
                  return Rn(s);
                case 'yyyyy':
                  return Rn(u);
                case 'yyyyyy':
                  return Rn(r);
                case 'M':
                case 'L':
                case 'd':
                case 'H':
                case 'h':
                case 'm':
                case 'q':
                case 's':
                case 'W':
                  return Rn(a);
                case 'MM':
                case 'LL':
                case 'dd':
                case 'HH':
                case 'hh':
                case 'mm':
                case 'qq':
                case 'ss':
                case 'WW':
                  return Rn(o);
                case 'MMM':
                  return jn(e.months('short', !0, !1), 1);
                case 'MMMM':
                  return jn(e.months('long', !0, !1), 1);
                case 'LLL':
                  return jn(e.months('short', !1, !1), 1);
                case 'LLLL':
                  return jn(e.months('long', !1, !1), 1);
                case 'o':
                case 'S':
                  return Rn(l);
                case 'ooo':
                case 'SSS':
                  return Rn(n);
                case 'u':
                  return Vn(c);
                case 'uu':
                  return Vn(a);
                case 'uuu':
                case 'E':
                case 'c':
                  return Rn(i);
                case 'a':
                  return jn(e.meridiems(), 0);
                case 'EEE':
                  return jn(e.weekdays('short', !1, !1), 1);
                case 'EEEE':
                  return jn(e.weekdays('long', !1, !1), 1);
                case 'ccc':
                  return jn(e.weekdays('short', !0, !1), 1);
                case 'cccc':
                  return jn(e.weekdays('long', !0, !1), 1);
                case 'Z':
                case 'ZZ':
                  return Hn(new RegExp(`([+-]${a.source})(?::(${o.source}))?`), 2);
                case 'ZZZ':
                  return Hn(new RegExp(`([+-]${a.source})(${o.source})?`), 2);
                case 'z':
                  return Vn(/[a-z_+-/]{1,256}?/i);
                default:
                  return p(m);
              }
            })(t) || { invalidReason: Bn };
          return (m.token = t), m;
        })(e, t)
      ),
      s = n.find(t => t.invalidReason);
    if (s) return { input: e, tokens: o, invalidReason: s.invalidReason };
    {
      const [t, i] = (function(t) {
          const e = t.map(t => t.regex).reduce((t, e) => `${t}(${e.source})`, '');
          return [`^${e}$`, t];
        })(n),
        s = RegExp(t, 'i'),
        [r, a] = (function(t, e, i) {
          const o = t.match(e);
          if (o) {
            const t = {};
            let e = 1;
            for (const n in i)
              if (yi(i, n)) {
                const s = i[n],
                  r = s.groups ? s.groups + 1 : 1;
                !s.literal && s.token && (t[s.token.val[0]] = s.deser(o.slice(e, e + r))), (e += r);
              }
            return [o, t];
          }
          return [o, {}];
        })(e, s, i),
        [l, h, c] = a
          ? (function(t) {
              let e,
                i = null;
              mi(t.z) || (i = lo.create(t.z)),
                mi(t.Z) || (i || (i = new co(t.Z)), (e = t.Z)),
                mi(t.q) || (t.M = 3 * (t.q - 1) + 1),
                mi(t.h) ||
                  (t.h < 12 && 1 === t.a ? (t.h += 12) : 12 === t.h && 0 === t.a && (t.h = 0)),
                0 === t.G && t.y && (t.y = -t.y),
                mi(t.u) || (t.S = Ai(t.u));
              const o = Object.keys(t).reduce((e, i) => {
                const o = (t => {
                  switch (t) {
                    case 'S':
                      return 'millisecond';
                    case 's':
                      return 'second';
                    case 'm':
                      return 'minute';
                    case 'h':
                    case 'H':
                      return 'hour';
                    case 'd':
                      return 'day';
                    case 'o':
                      return 'ordinal';
                    case 'L':
                    case 'M':
                      return 'month';
                    case 'y':
                      return 'year';
                    case 'E':
                    case 'c':
                      return 'weekday';
                    case 'W':
                      return 'weekNumber';
                    case 'k':
                      return 'weekYear';
                    case 'q':
                      return 'quarter';
                    default:
                      return null;
                  }
                })(i);
                return o && (e[o] = t[i]), e;
              }, {});
              return [o, i, e];
            })(a)
          : [null, null, void 0];
      if (yi(a, 'a') && yi(a, 'H'))
        throw new Re("Can't include meridiem when specifying 24-hour format");
      return {
        input: e,
        tokens: o,
        regex: s,
        rawMatches: r,
        matches: a,
        result: l,
        zone: h,
        specificOffset: c
      };
    }
  }
  const Yn = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334],
    Jn = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];
  function Xn(t, e) {
    return new eo(
      'unit out of range',
      `you specified ${e} (of type ${typeof e}) as a ${t}, which is invalid`
    );
  }
  function ts(t, e, i) {
    const o = new Date(Date.UTC(t, e - 1, i));
    t < 100 && t >= 0 && o.setUTCFullYear(o.getUTCFullYear() - 1900);
    const n = o.getUTCDay();
    return 0 === n ? 7 : n;
  }
  function es(t, e, i) {
    return i + (Si(t) ? Jn : Yn)[e - 1];
  }
  function is(t, e) {
    const i = Si(t) ? Jn : Yn,
      o = i.findIndex(t => t < e);
    return { month: o + 1, day: e - i[o] };
  }
  function os(t) {
    const { year: e, month: i, day: o } = t,
      n = es(e, i, o),
      s = ts(e, i, o);
    let r,
      a = Math.floor((n - s + 10) / 7);
    return (
      a < 1 ? ((r = e - 1), (a = Oi(r))) : a > Oi(e) ? ((r = e + 1), (a = 1)) : (r = e),
      { weekYear: r, weekNumber: a, weekday: s, ...Ni(t) }
    );
  }
  function ns(t) {
    const { weekYear: e, weekNumber: i, weekday: o } = t,
      n = ts(e, 1, 4),
      s = Ei(e);
    let r,
      a = 7 * i + o - n - 3;
    a < 1 ? ((r = e - 1), (a += Ei(r))) : a > s ? ((r = e + 1), (a -= Ei(e))) : (r = e);
    const { month: l, day: h } = is(r, a);
    return { year: r, month: l, day: h, ...Ni(t) };
  }
  function ss(t) {
    const { year: e, month: i, day: o } = t;
    return { year: e, ordinal: es(e, i, o), ...Ni(t) };
  }
  function rs(t) {
    const { year: e, ordinal: i } = t,
      { month: o, day: n } = is(e, i);
    return { year: e, month: o, day: n, ...Ni(t) };
  }
  function as(t) {
    const e = fi(t.year),
      i = _i(t.month, 1, 12),
      o = _i(t.day, 1, Ti(t.year, t.month));
    return e ? (i ? !o && Xn('day', t.day) : Xn('month', t.month)) : Xn('year', t.year);
  }
  function ls(t) {
    const { hour: e, minute: i, second: o, millisecond: n } = t,
      s = _i(e, 0, 23) || (24 === e && 0 === i && 0 === o && 0 === n),
      r = _i(i, 0, 59),
      a = _i(o, 0, 59),
      l = _i(n, 0, 999);
    return s
      ? r
        ? a
          ? !l && Xn('millisecond', n)
          : Xn('second', o)
        : Xn('minute', i)
      : Xn('hour', e);
  }
  const hs = 'Invalid DateTime',
    cs = 864e13;
  function ds(t) {
    return new eo('unsupported zone', `the zone "${t.name}" is not supported`);
  }
  function us(t) {
    return null === t.weekData && (t.weekData = os(t.c)), t.weekData;
  }
  function ps(t, e) {
    const i = { ts: t.ts, zone: t.zone, c: t.c, o: t.o, loc: t.loc, invalid: t.invalid };
    return new Ls({ ...i, ...e, old: i });
  }
  function ms(t, e, i) {
    let o = t - 60 * e * 1e3;
    const n = i.offset(o);
    if (e === n) return [o, e];
    o -= 60 * (n - e) * 1e3;
    const s = i.offset(o);
    return n === s ? [o, n] : [t - 60 * Math.min(n, s) * 1e3, Math.max(n, s)];
  }
  function gs(t, e) {
    const i = new Date((t += 60 * e * 1e3));
    return {
      year: i.getUTCFullYear(),
      month: i.getUTCMonth() + 1,
      day: i.getUTCDate(),
      hour: i.getUTCHours(),
      minute: i.getUTCMinutes(),
      second: i.getUTCSeconds(),
      millisecond: i.getUTCMilliseconds()
    };
  }
  function fs(t, e, i) {
    return ms($i(t), e, i);
  }
  function vs(t, e) {
    const i = t.o,
      o = t.c.year + Math.trunc(e.years),
      n = t.c.month + Math.trunc(e.months) + 3 * Math.trunc(e.quarters),
      s = {
        ...t.c,
        year: o,
        month: n,
        day: Math.min(t.c.day, Ti(o, n)) + Math.trunc(e.days) + 7 * Math.trunc(e.weeks)
      },
      r = Tn.fromObject({
        years: e.years - Math.trunc(e.years),
        quarters: e.quarters - Math.trunc(e.quarters),
        months: e.months - Math.trunc(e.months),
        weeks: e.weeks - Math.trunc(e.weeks),
        days: e.days - Math.trunc(e.days),
        hours: e.hours,
        minutes: e.minutes,
        seconds: e.seconds,
        milliseconds: e.milliseconds
      }).as('milliseconds'),
      a = $i(s);
    let [l, h] = ms(a, i, t.zone);
    return 0 !== r && ((l += r), (h = t.zone.offset(l))), { ts: l, o: h };
  }
  function bs(t, e, i, o, n, s) {
    const { setZone: r, zone: a } = i;
    if (t && 0 !== Object.keys(t).length) {
      const o = e || a,
        n = Ls.fromObject(t, { ...i, zone: o, specificOffset: s });
      return r ? n : n.setZone(a);
    }
    return Ls.invalid(new eo('unparsable', `the input "${n}" can't be parsed as ${o}`));
  }
  function ys(t, e, i = !0) {
    return t.isValid
      ? to.create(Mo.create('en-US'), { allowZ: i, forceSimple: !0 }).formatDateTimeFromString(t, e)
      : null;
  }
  function _s(t, e) {
    const i = t.c.year > 9999 || t.c.year < 0;
    let o = '';
    return (
      i && t.c.year >= 0 && (o += '+'),
      (o += xi(t.c.year, i ? 6 : 4)),
      e
        ? ((o += '-'), (o += xi(t.c.month)), (o += '-'), (o += xi(t.c.day)))
        : ((o += xi(t.c.month)), (o += xi(t.c.day))),
      o
    );
  }
  function xs(t, e, i, o, n, s) {
    let r = xi(t.c.hour);
    return (
      e
        ? ((r += ':'), (r += xi(t.c.minute)), (0 === t.c.second && i) || (r += ':'))
        : (r += xi(t.c.minute)),
      (0 === t.c.second && i) ||
        ((r += xi(t.c.second)),
        (0 === t.c.millisecond && o) || ((r += '.'), (r += xi(t.c.millisecond, 3)))),
      n &&
        (t.isOffsetFixed && 0 === t.offset && !s
          ? (r += 'Z')
          : t.o < 0
          ? ((r += '-'),
            (r += xi(Math.trunc(-t.o / 60))),
            (r += ':'),
            (r += xi(Math.trunc(-t.o % 60))))
          : ((r += '+'),
            (r += xi(Math.trunc(t.o / 60))),
            (r += ':'),
            (r += xi(Math.trunc(t.o % 60))))),
      s && (r += '[' + t.zone.ianaName + ']'),
      r
    );
  }
  const ws = { month: 1, day: 1, hour: 0, minute: 0, second: 0, millisecond: 0 },
    ks = { weekNumber: 1, weekday: 1, hour: 0, minute: 0, second: 0, millisecond: 0 },
    As = { ordinal: 1, hour: 0, minute: 0, second: 0, millisecond: 0 },
    Cs = ['year', 'month', 'day', 'hour', 'minute', 'second', 'millisecond'],
    Ss = ['weekYear', 'weekNumber', 'weekday', 'hour', 'minute', 'second', 'millisecond'],
    Es = ['year', 'ordinal', 'hour', 'minute', 'second', 'millisecond'];
  function Ts(t) {
    const e = {
      year: 'year',
      years: 'year',
      month: 'month',
      months: 'month',
      day: 'day',
      days: 'day',
      hour: 'hour',
      hours: 'hour',
      minute: 'minute',
      minutes: 'minute',
      quarter: 'quarter',
      quarters: 'quarter',
      second: 'second',
      seconds: 'second',
      millisecond: 'millisecond',
      milliseconds: 'millisecond',
      weekday: 'weekday',
      weekdays: 'weekday',
      weeknumber: 'weekNumber',
      weeksnumber: 'weekNumber',
      weeknumbers: 'weekNumber',
      weekyear: 'weekYear',
      weekyears: 'weekYear',
      ordinal: 'ordinal'
    }[t.toLowerCase()];
    if (!e) throw new qe(t);
    return e;
  }
  function $s(t, e) {
    const i = po(e.zone, _o.defaultZone),
      o = Mo.fromObject(e),
      n = _o.now();
    let s, r;
    if (mi(t.year)) s = n;
    else {
      for (const e of Cs) mi(t[e]) && (t[e] = ws[e]);
      const e = as(t) || ls(t);
      if (e) return Ls.invalid(e);
      const o = i.offset(n);
      [s, r] = fs(t, o, i);
    }
    return new Ls({ ts: s, zone: i, loc: o, o: r });
  }
  function Os(t, e, i) {
    const o = !!mi(i.round) || i.round,
      n = (t, n) => {
        t = Ci(t, o || i.calendary ? 0 : 2, !0);
        return e.loc
          .clone(i)
          .relFormatter(i)
          .format(t, n);
      },
      s = o =>
        i.calendary
          ? e.hasSame(t, o)
            ? 0
            : e
                .startOf(o)
                .diff(t.startOf(o), o)
                .get(o)
          : e.diff(t, o).get(o);
    if (i.unit) return n(s(i.unit), i.unit);
    for (const t of i.units) {
      const e = s(t);
      if (Math.abs(e) >= 1) return n(e, t);
    }
    return n(t > e ? -0 : 0, i.units[i.units.length - 1]);
  }
  function Ms(t) {
    let e,
      i = {};
    return (
      t.length > 0 && 'object' == typeof t[t.length - 1]
        ? ((i = t[t.length - 1]), (e = Array.from(t).slice(0, t.length - 1)))
        : (e = Array.from(t)),
      [i, e]
    );
  }
  class Ls {
    constructor(t) {
      const e = t.zone || _o.defaultZone;
      let i =
        t.invalid ||
        (Number.isNaN(t.ts) ? new eo('invalid input') : null) ||
        (e.isValid ? null : ds(e));
      this.ts = mi(t.ts) ? _o.now() : t.ts;
      let o = null,
        n = null;
      if (!i) {
        if (t.old && t.old.ts === this.ts && t.old.zone.equals(e)) [o, n] = [t.old.c, t.old.o];
        else {
          const t = e.offset(this.ts);
          (o = gs(this.ts, t)),
            (i = Number.isNaN(o.year) ? new eo('invalid input') : null),
            (o = i ? null : o),
            (n = i ? null : t);
        }
      }
      (this._zone = e),
        (this.loc = t.loc || Mo.create()),
        (this.invalid = i),
        (this.weekData = null),
        (this.c = o),
        (this.o = n),
        (this.isLuxonDateTime = !0);
    }
    static now() {
      return new Ls({});
    }
    static local() {
      const [t, e] = Ms(arguments),
        [i, o, n, s, r, a, l] = e;
      return $s({ year: i, month: o, day: n, hour: s, minute: r, second: a, millisecond: l }, t);
    }
    static utc() {
      const [t, e] = Ms(arguments),
        [i, o, n, s, r, a, l] = e;
      return (
        (t.zone = co.utcInstance),
        $s({ year: i, month: o, day: n, hour: s, minute: r, second: a, millisecond: l }, t)
      );
    }
    static fromJSDate(t, e = {}) {
      const i = (function(t) {
        return '[object Date]' === Object.prototype.toString.call(t);
      })(t)
        ? t.valueOf()
        : NaN;
      if (Number.isNaN(i)) return Ls.invalid('invalid input');
      const o = po(e.zone, _o.defaultZone);
      return o.isValid ? new Ls({ ts: i, zone: o, loc: Mo.fromObject(e) }) : Ls.invalid(ds(o));
    }
    static fromMillis(t, e = {}) {
      if (gi(t))
        return t < -cs || t > cs
          ? Ls.invalid('Timestamp out of range')
          : new Ls({ ts: t, zone: po(e.zone, _o.defaultZone), loc: Mo.fromObject(e) });
      throw new Ue(
        `fromMillis requires a numerical input, but received a ${typeof t} with value ${t}`
      );
    }
    static fromSeconds(t, e = {}) {
      if (gi(t))
        return new Ls({ ts: 1e3 * t, zone: po(e.zone, _o.defaultZone), loc: Mo.fromObject(e) });
      throw new Ue('fromSeconds requires a numerical input');
    }
    static fromObject(t, e = {}) {
      t = t || {};
      const i = po(e.zone, _o.defaultZone);
      if (!i.isValid) return Ls.invalid(ds(i));
      const o = _o.now(),
        n = mi(e.specificOffset) ? i.offset(o) : e.specificOffset,
        s = Di(t, Ts),
        r = !mi(s.ordinal),
        a = !mi(s.year),
        l = !mi(s.month) || !mi(s.day),
        h = a || l,
        c = s.weekYear || s.weekNumber,
        d = Mo.fromObject(e);
      if ((h || r) && c)
        throw new Re("Can't mix weekYear/weekNumber units with year/month/day or ordinals");
      if (l && r) throw new Re("Can't mix ordinal dates with month/day");
      const u = c || (s.weekday && !h);
      let p,
        m,
        g = gs(o, n);
      u
        ? ((p = Ss), (m = ks), (g = os(g)))
        : r
        ? ((p = Es), (m = As), (g = ss(g)))
        : ((p = Cs), (m = ws));
      let f = !1;
      for (const t of p) {
        mi(s[t]) ? (s[t] = f ? m[t] : g[t]) : (f = !0);
      }
      const v = u
          ? (function(t) {
              const e = fi(t.weekYear),
                i = _i(t.weekNumber, 1, Oi(t.weekYear)),
                o = _i(t.weekday, 1, 7);
              return e
                ? i
                  ? !o && Xn('weekday', t.weekday)
                  : Xn('week', t.week)
                : Xn('weekYear', t.weekYear);
            })(s)
          : r
          ? (function(t) {
              const e = fi(t.year),
                i = _i(t.ordinal, 1, Ei(t.year));
              return e ? !i && Xn('ordinal', t.ordinal) : Xn('year', t.year);
            })(s)
          : as(s),
        b = v || ls(s);
      if (b) return Ls.invalid(b);
      const y = u ? ns(s) : r ? rs(s) : s,
        [_, x] = fs(y, n, i),
        w = new Ls({ ts: _, zone: i, o: x, loc: d });
      return s.weekday && h && t.weekday !== w.weekday
        ? Ls.invalid(
            'mismatched weekday',
            `you can't specify both a weekday of ${s.weekday} and a date of ${w.toISO()}`
          )
        : w;
    }
    static fromISO(t, e = {}) {
      const [i, o] = (function(t) {
        return Po(t, [an, dn], [ln, un], [hn, pn], [cn, mn]);
      })(t);
      return bs(i, o, e, 'ISO 8601', t);
    }
    static fromRFC2822(t, e = {}) {
      const [i, o] = (function(t) {
        return Po(
          (function(t) {
            return t
              .replace(/\([^()]*\)|[\n\t]/g, ' ')
              .replace(/(\s\s+)/g, ' ')
              .trim();
          })(t),
          [Xo, tn]
        );
      })(t);
      return bs(i, o, e, 'RFC 2822', t);
    }
    static fromHTTP(t, e = {}) {
      const [i, o] = (function(t) {
        return Po(t, [en, sn], [on, sn], [nn, rn]);
      })(t);
      return bs(i, o, e, 'HTTP', e);
    }
    static fromFormat(t, e, i = {}) {
      if (mi(t) || mi(e)) throw new Ue('fromFormat requires an input string and a format');
      const { locale: o = null, numberingSystem: n = null } = i,
        s = Mo.fromOpts({ locale: o, numberingSystem: n, defaultToEN: !0 }),
        [r, a, l, h] = (function(t, e, i) {
          const { result: o, zone: n, specificOffset: s, invalidReason: r } = Kn(t, e, i);
          return [o, n, s, r];
        })(s, t, e);
      return h ? Ls.invalid(h) : bs(r, a, i, `format ${e}`, t, l);
    }
    static fromString(t, e, i = {}) {
      return Ls.fromFormat(t, e, i);
    }
    static fromSQL(t, e = {}) {
      const [i, o] = (function(t) {
        return Po(t, [fn, dn], [vn, bn]);
      })(t);
      return bs(i, o, e, 'SQL', t);
    }
    static invalid(t, e = null) {
      if (!t) throw new Ue('need to specify a reason the DateTime is invalid');
      const i = t instanceof eo ? t : new eo(t, e);
      if (_o.throwOnInvalid) throw new Ie(i);
      return new Ls({ invalid: i });
    }
    static isDateTime(t) {
      return (t && t.isLuxonDateTime) || !1;
    }
    get(t) {
      return this[t];
    }
    get isValid() {
      return null === this.invalid;
    }
    get invalidReason() {
      return this.invalid ? this.invalid.reason : null;
    }
    get invalidExplanation() {
      return this.invalid ? this.invalid.explanation : null;
    }
    get locale() {
      return this.isValid ? this.loc.locale : null;
    }
    get numberingSystem() {
      return this.isValid ? this.loc.numberingSystem : null;
    }
    get outputCalendar() {
      return this.isValid ? this.loc.outputCalendar : null;
    }
    get zone() {
      return this._zone;
    }
    get zoneName() {
      return this.isValid ? this.zone.name : null;
    }
    get year() {
      return this.isValid ? this.c.year : NaN;
    }
    get quarter() {
      return this.isValid ? Math.ceil(this.c.month / 3) : NaN;
    }
    get month() {
      return this.isValid ? this.c.month : NaN;
    }
    get day() {
      return this.isValid ? this.c.day : NaN;
    }
    get hour() {
      return this.isValid ? this.c.hour : NaN;
    }
    get minute() {
      return this.isValid ? this.c.minute : NaN;
    }
    get second() {
      return this.isValid ? this.c.second : NaN;
    }
    get millisecond() {
      return this.isValid ? this.c.millisecond : NaN;
    }
    get weekYear() {
      return this.isValid ? us(this).weekYear : NaN;
    }
    get weekNumber() {
      return this.isValid ? us(this).weekNumber : NaN;
    }
    get weekday() {
      return this.isValid ? us(this).weekday : NaN;
    }
    get ordinal() {
      return this.isValid ? ss(this.c).ordinal : NaN;
    }
    get monthShort() {
      return this.isValid ? Mn.months('short', { locObj: this.loc })[this.month - 1] : null;
    }
    get monthLong() {
      return this.isValid ? Mn.months('long', { locObj: this.loc })[this.month - 1] : null;
    }
    get weekdayShort() {
      return this.isValid ? Mn.weekdays('short', { locObj: this.loc })[this.weekday - 1] : null;
    }
    get weekdayLong() {
      return this.isValid ? Mn.weekdays('long', { locObj: this.loc })[this.weekday - 1] : null;
    }
    get offset() {
      return this.isValid ? +this.o : NaN;
    }
    get offsetNameShort() {
      return this.isValid
        ? this.zone.offsetName(this.ts, { format: 'short', locale: this.locale })
        : null;
    }
    get offsetNameLong() {
      return this.isValid
        ? this.zone.offsetName(this.ts, { format: 'long', locale: this.locale })
        : null;
    }
    get isOffsetFixed() {
      return this.isValid ? this.zone.isUniversal : null;
    }
    get isInDST() {
      return (
        !this.isOffsetFixed &&
        (this.offset > this.set({ month: 1, day: 1 }).offset ||
          this.offset > this.set({ month: 5 }).offset)
      );
    }
    get isInLeapYear() {
      return Si(this.year);
    }
    get daysInMonth() {
      return Ti(this.year, this.month);
    }
    get daysInYear() {
      return this.isValid ? Ei(this.year) : NaN;
    }
    get weeksInWeekYear() {
      return this.isValid ? Oi(this.weekYear) : NaN;
    }
    resolvedLocaleOptions(t = {}) {
      const { locale: e, numberingSystem: i, calendar: o } = to
        .create(this.loc.clone(t), t)
        .resolvedOptions(this);
      return { locale: e, numberingSystem: i, outputCalendar: o };
    }
    toUTC(t = 0, e = {}) {
      return this.setZone(co.instance(t), e);
    }
    toLocal() {
      return this.setZone(_o.defaultZone);
    }
    setZone(t, { keepLocalTime: e = !1, keepCalendarTime: i = !1 } = {}) {
      if ((t = po(t, _o.defaultZone)).equals(this.zone)) return this;
      if (t.isValid) {
        let o = this.ts;
        if (e || i) {
          const e = t.offset(this.ts),
            i = this.toObject();
          [o] = fs(i, e, t);
        }
        return ps(this, { ts: o, zone: t });
      }
      return Ls.invalid(ds(t));
    }
    reconfigure({ locale: t, numberingSystem: e, outputCalendar: i } = {}) {
      return ps(this, {
        loc: this.loc.clone({ locale: t, numberingSystem: e, outputCalendar: i })
      });
    }
    setLocale(t) {
      return this.reconfigure({ locale: t });
    }
    set(t) {
      if (!this.isValid) return this;
      const e = Di(t, Ts),
        i = !mi(e.weekYear) || !mi(e.weekNumber) || !mi(e.weekday),
        o = !mi(e.ordinal),
        n = !mi(e.year),
        s = !mi(e.month) || !mi(e.day),
        r = n || s,
        a = e.weekYear || e.weekNumber;
      if ((r || o) && a)
        throw new Re("Can't mix weekYear/weekNumber units with year/month/day or ordinals");
      if (s && o) throw new Re("Can't mix ordinal dates with month/day");
      let l;
      i
        ? (l = ns({ ...os(this.c), ...e }))
        : mi(e.ordinal)
        ? ((l = { ...this.toObject(), ...e }),
          mi(e.day) && (l.day = Math.min(Ti(l.year, l.month), l.day)))
        : (l = rs({ ...ss(this.c), ...e }));
      const [h, c] = fs(l, this.o, this.zone);
      return ps(this, { ts: h, o: c });
    }
    plus(t) {
      if (!this.isValid) return this;
      return ps(this, vs(this, Tn.fromDurationLike(t)));
    }
    minus(t) {
      if (!this.isValid) return this;
      return ps(this, vs(this, Tn.fromDurationLike(t).negate()));
    }
    startOf(t) {
      if (!this.isValid) return this;
      const e = {},
        i = Tn.normalizeUnit(t);
      switch (i) {
        case 'years':
          e.month = 1;
        case 'quarters':
        case 'months':
          e.day = 1;
        case 'weeks':
        case 'days':
          e.hour = 0;
        case 'hours':
          e.minute = 0;
        case 'minutes':
          e.second = 0;
        case 'seconds':
          e.millisecond = 0;
      }
      if (('weeks' === i && (e.weekday = 1), 'quarters' === i)) {
        const t = Math.ceil(this.month / 3);
        e.month = 3 * (t - 1) + 1;
      }
      return this.set(e);
    }
    endOf(t) {
      return this.isValid
        ? this.plus({ [t]: 1 })
            .startOf(t)
            .minus(1)
        : this;
    }
    toFormat(t, e = {}) {
      return this.isValid
        ? to.create(this.loc.redefaultToEN(e)).formatDateTimeFromString(this, t)
        : hs;
    }
    toLocaleString(t = Ve, e = {}) {
      return this.isValid ? to.create(this.loc.clone(e), t).formatDateTime(this) : hs;
    }
    toLocaleParts(t = {}) {
      return this.isValid ? to.create(this.loc.clone(t), t).formatDateTimeParts(this) : [];
    }
    toISO({
      format: t = 'extended',
      suppressSeconds: e = !1,
      suppressMilliseconds: i = !1,
      includeOffset: o = !0,
      extendedZone: n = !1
    } = {}) {
      if (!this.isValid) return null;
      const s = 'extended' === t;
      let r = _s(this, s);
      return (r += 'T'), (r += xs(this, s, e, i, o, n)), r;
    }
    toISODate({ format: t = 'extended' } = {}) {
      return this.isValid ? _s(this, 'extended' === t) : null;
    }
    toISOWeekDate() {
      return ys(this, "kkkk-'W'WW-c");
    }
    toISOTime({
      suppressMilliseconds: t = !1,
      suppressSeconds: e = !1,
      includeOffset: i = !0,
      includePrefix: o = !1,
      extendedZone: n = !1,
      format: s = 'extended'
    } = {}) {
      if (!this.isValid) return null;
      return (o ? 'T' : '') + xs(this, 'extended' === s, e, t, i, n);
    }
    toRFC2822() {
      return ys(this, 'EEE, dd LLL yyyy HH:mm:ss ZZZ', !1);
    }
    toHTTP() {
      return ys(this.toUTC(), "EEE, dd LLL yyyy HH:mm:ss 'GMT'");
    }
    toSQLDate() {
      return this.isValid ? _s(this, !0) : null;
    }
    toSQLTime({ includeOffset: t = !0, includeZone: e = !1, includeOffsetSpace: i = !0 } = {}) {
      let o = 'HH:mm:ss.SSS';
      return (e || t) && (i && (o += ' '), e ? (o += 'z') : t && (o += 'ZZ')), ys(this, o, !0);
    }
    toSQL(t = {}) {
      return this.isValid ? `${this.toSQLDate()} ${this.toSQLTime(t)}` : null;
    }
    toString() {
      return this.isValid ? this.toISO() : hs;
    }
    valueOf() {
      return this.toMillis();
    }
    toMillis() {
      return this.isValid ? this.ts : NaN;
    }
    toSeconds() {
      return this.isValid ? this.ts / 1e3 : NaN;
    }
    toUnixInteger() {
      return this.isValid ? Math.floor(this.ts / 1e3) : NaN;
    }
    toJSON() {
      return this.toISO();
    }
    toBSON() {
      return this.toJSDate();
    }
    toObject(t = {}) {
      if (!this.isValid) return {};
      const e = { ...this.c };
      return (
        t.includeConfig &&
          ((e.outputCalendar = this.outputCalendar),
          (e.numberingSystem = this.loc.numberingSystem),
          (e.locale = this.loc.locale)),
        e
      );
    }
    toJSDate() {
      return new Date(this.isValid ? this.ts : NaN);
    }
    diff(t, e = 'milliseconds', i = {}) {
      if (!this.isValid || !t.isValid) return Tn.invalid('created by diffing an invalid DateTime');
      const o = { locale: this.locale, numberingSystem: this.numberingSystem, ...i },
        n = ((a = e), Array.isArray(a) ? a : [a]).map(Tn.normalizeUnit),
        s = t.valueOf() > this.valueOf(),
        r = zn(s ? this : t, s ? t : this, n, o);
      var a;
      return s ? r.negate() : r;
    }
    diffNow(t = 'milliseconds', e = {}) {
      return this.diff(Ls.now(), t, e);
    }
    until(t) {
      return this.isValid ? On.fromDateTimes(this, t) : this;
    }
    hasSame(t, e) {
      if (!this.isValid) return !1;
      const i = t.valueOf(),
        o = this.setZone(t.zone, { keepLocalTime: !0 });
      return o.startOf(e) <= i && i <= o.endOf(e);
    }
    equals(t) {
      return (
        this.isValid &&
        t.isValid &&
        this.valueOf() === t.valueOf() &&
        this.zone.equals(t.zone) &&
        this.loc.equals(t.loc)
      );
    }
    toRelative(t = {}) {
      if (!this.isValid) return null;
      const e = t.base || Ls.fromObject({}, { zone: this.zone }),
        i = t.padding ? (this < e ? -t.padding : t.padding) : 0;
      let o = ['years', 'months', 'days', 'hours', 'minutes', 'seconds'],
        n = t.unit;
      return (
        Array.isArray(t.unit) && ((o = t.unit), (n = void 0)),
        Os(e, this.plus(i), { ...t, numeric: 'always', units: o, unit: n })
      );
    }
    toRelativeCalendar(t = {}) {
      return this.isValid
        ? Os(t.base || Ls.fromObject({}, { zone: this.zone }), this, {
            ...t,
            numeric: 'auto',
            units: ['years', 'months', 'days'],
            calendary: !0
          })
        : null;
    }
    static min(...t) {
      if (!t.every(Ls.isDateTime)) throw new Ue('min requires all arguments be DateTimes');
      return bi(t, t => t.valueOf(), Math.min);
    }
    static max(...t) {
      if (!t.every(Ls.isDateTime)) throw new Ue('max requires all arguments be DateTimes');
      return bi(t, t => t.valueOf(), Math.max);
    }
    static fromFormatExplain(t, e, i = {}) {
      const { locale: o = null, numberingSystem: n = null } = i;
      return Kn(Mo.fromOpts({ locale: o, numberingSystem: n, defaultToEN: !0 }), t, e);
    }
    static fromStringExplain(t, e, i = {}) {
      return Ls.fromFormatExplain(t, e, i);
    }
    static get DATE_SHORT() {
      return Ve;
    }
    static get DATE_MED() {
      return We;
    }
    static get DATE_MED_WITH_WEEKDAY() {
      return Ge;
    }
    static get DATE_FULL() {
      return Qe;
    }
    static get DATE_HUGE() {
      return Ke;
    }
    static get TIME_SIMPLE() {
      return Ye;
    }
    static get TIME_WITH_SECONDS() {
      return Je;
    }
    static get TIME_WITH_SHORT_OFFSET() {
      return Xe;
    }
    static get TIME_WITH_LONG_OFFSET() {
      return ti;
    }
    static get TIME_24_SIMPLE() {
      return ei;
    }
    static get TIME_24_WITH_SECONDS() {
      return ii;
    }
    static get TIME_24_WITH_SHORT_OFFSET() {
      return oi;
    }
    static get TIME_24_WITH_LONG_OFFSET() {
      return ni;
    }
    static get DATETIME_SHORT() {
      return si;
    }
    static get DATETIME_SHORT_WITH_SECONDS() {
      return ri;
    }
    static get DATETIME_MED() {
      return ai;
    }
    static get DATETIME_MED_WITH_SECONDS() {
      return li;
    }
    static get DATETIME_MED_WITH_WEEKDAY() {
      return hi;
    }
    static get DATETIME_FULL() {
      return ci;
    }
    static get DATETIME_FULL_WITH_SECONDS() {
      return di;
    }
    static get DATETIME_HUGE() {
      return ui;
    }
    static get DATETIME_HUGE_WITH_SECONDS() {
      return pi;
    }
  }
  function zs(t) {
    if (Ls.isDateTime(t)) return t;
    if (t && t.valueOf && gi(t.valueOf())) return Ls.fromJSDate(t);
    if (t && 'object' == typeof t) return Ls.fromObject(t);
    throw new Ue(`Unknown datetime argument: ${t}, of type ${typeof t}`);
  }
  /**
   * @license
   * Copyright 2021 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */ const Ps = (t, e, i) => {
      let o = t[0];
      for (let n = 1; n < t.length; n++) (o += e[i ? i[n - 1] : n - 1]), (o += t[n]);
      return o;
    },
    Ds = t => {
      return 'string' != typeof (e = t) && 'strTag' in e ? Ps(t.strings, t.values) : t;
      var e;
    };
  /**
   * @license
   * Copyright 2020 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
  class Is {
    constructor() {
      (this.settled = !1),
        (this.promise = new Promise((t, e) => {
          (this._resolve = t), (this._reject = e);
        }));
    }
    resolve(t) {
      (this.settled = !0), this._resolve(t);
    }
    reject(t) {
      (this.settled = !0), this._reject(t);
    }
  }
  /**
   * @license
   * Copyright 2014 Travis Webb
   * SPDX-License-Identifier: MIT
   */ const Ns = [];
  for (let t = 0; t < 256; t++) Ns[t] = ((t >> 4) & 15).toString(16) + (15 & t).toString(16);
  /**
   * @license
   * Copyright 2020 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
  const Bs = '',
    Rs = 'h',
    qs = 's';
  function Us(t, e) {
    return (
      (e ? Rs : qs) +
      (function(t) {
        let e = 0,
          i = 8997,
          o = 0,
          n = 33826,
          s = 0,
          r = 40164,
          a = 0,
          l = 52210;
        for (let h = 0; h < t.length; h++)
          (i ^= t.charCodeAt(h)),
            (e = 435 * i),
            (o = 435 * n),
            (s = 435 * r),
            (a = 435 * l),
            (s += i << 8),
            (a += n << 8),
            (o += e >>> 16),
            (i = 65535 & e),
            (s += o >>> 16),
            (n = 65535 & o),
            (l = (a + (s >>> 16)) & 65535),
            (r = 65535 & s);
        return (
          Ns[l >> 8] +
          Ns[255 & l] +
          Ns[r >> 8] +
          Ns[255 & r] +
          Ns[n >> 8] +
          Ns[255 & n] +
          Ns[i >> 8] +
          Ns[255 & i]
        );
      })('string' == typeof t ? t : t.join(Bs))
    );
  }
  /**
   * @license
   * Copyright 2021 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */ const Fs = new WeakMap(),
    Zs = new Map();
  function js(t, e, i) {
    if (t) {
      const o =
          i?.id ??
          (function(t) {
            const e = 'string' == typeof t ? t : t.strings;
            let i = Zs.get(e);
            void 0 === i && ((i = Us(e, 'string' != typeof t && !('strTag' in t))), Zs.set(e, i));
            return i;
          })(
            /**
             * @license
             * Copyright 2021 Google LLC
             * SPDX-License-Identifier: BSD-3-Clause
             */ e
          ),
        n = t[o];
      if (n) {
        if ('string' == typeof n) return n;
        if ('strTag' in n) return Ps(n.strings, e.values, n.values);
        {
          let t = Fs.get(n);
          return (
            void 0 === t && ((t = n.values), Fs.set(n, t)),
            { ...n, values: t.map(t => e.values[t]) }
          );
        }
      }
    }
    return Ds(e);
  }
  function Hs(t) {
    window.dispatchEvent(new CustomEvent('lit-localize-status', { detail: t }));
  }
  let Vs,
    Ws,
    Gs,
    Qs,
    Ks,
    Ys = '',
    Js = new Is();
  Js.resolve();
  let Xs = 0;
  const tr = () => Ys,
    er = t => {
      if (t === (Vs ?? Ys)) return Js.promise;
      if (!Gs || !Qs) throw new Error('Internal error');
      if (!Gs.has(t)) throw new Error('Invalid locale code');
      Xs++;
      const e = Xs;
      (Vs = t), Js.settled && (Js = new Is()), Hs({ status: 'loading', loadingLocale: t });
      return (
        (t === Ws ? Promise.resolve({ templates: void 0 }) : Qs(t)).then(
          i => {
            Xs === e &&
              ((Ys = t),
              (Vs = void 0),
              (Ks = i.templates),
              Hs({ status: 'ready', readyLocale: t }),
              Js.resolve());
          },
          i => {
            Xs === e &&
              (Hs({ status: 'error', errorLocale: t, errorMessage: i.toString() }), Js.reject(i));
          }
        ),
        Js.promise
      );
    };
  /**
   * @license
   * Copyright 2020 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
  let ir = Ds,
    or = !1;
  const nr = ['es', 'fr', 'pt'],
    { setLocale: sr } = (t => (
      (function(t) {
        if (or) throw new Error('lit-localize can only be configured once');
        (ir = t), (or = !0);
      })((t, e) => js(Ks, t, e)),
      (Ys = Ws = t.sourceLocale),
      (Gs = new Set(t.targetLocales)),
      Gs.add(t.sourceLocale),
      (Qs = t.loadLocale),
      { getLocale: tr, setLocale: er }
    ))({ sourceLocale: 'en', targetLocales: nr, loadLocale: t => import(`./locales/${t}.js`) });
  class rr extends ue {
    constructor() {
      super(...arguments),
        (this.settings = {}),
        (this.ttl = 6e4),
        (this.max = 20),
        (this.ready = !1),
        (this.loader = !1),
        (this.keyedAssets = {}),
        (this.locale = [...navigator.languages]),
        (this.fields = {}),
        (this.groups = {}),
        (this.languages = {}),
        (this.featuredFields = []),
        (this.pendingResolves = {}),
        (this.fetching = {});
    }
    static get styles() {
      return r`
      :host {
        position: fixed;
        z-index: 1000;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        top: 0.5em;
      }
    `;
    }
    getLocale() {
      return this.locale[0];
    }
    clearCache() {
      this.cache = Pe(this.max, this.ttl);
    }
    reset() {
      (this.ready = !1), this.clearCache(), (this.settings = JSON.parse(ne('settings') || '{}'));
      const t = [];
      this.completionEndpoint &&
        t.push(
          jt(this.completionEndpoint).then(t => {
            (this.schema = t.json.context), (this.fnOptions = t.json.functions);
          })
        ),
        this.fieldsEndpoint && t.push(this.refreshFields()),
        this.globalsEndpoint &&
          t.push(
            Qt(this.globalsEndpoint).then(t => {
              this.keyedAssets.globals = t.map(t => t.key);
            })
          ),
        this.languagesEndpoint &&
          t.push(
            Qt(this.languagesEndpoint).then(t => {
              this.languages = t.reduce(function(t, e) {
                return (t[e.value] = e.name), t;
              }, {});
            })
          ),
        this.groupsEndpoint &&
          t.push(
            Qt(this.groupsEndpoint).then(t => {
              t.forEach(t => {
                this.groups[t.uuid] = t;
              });
            })
          ),
        this.workspaceEndpoint &&
          t.push(
            jt(this.workspaceEndpoint).then(t => {
              this.workspace = t.json;
              const e = t.headers.get('content-language');
              e && (this.locale = [e, ...this.locale]);
            })
          ),
        this.usersEndpoint &&
          t.push(
            Qt(this.usersEndpoint).then(t => {
              this.users = t;
            })
          ),
        (this.initialHttpComplete = Promise.all(t)),
        this.initialHttpComplete.then(() => {
          this.ready = !0;
        });
    }
    getAssignableUsers() {
      return this.users.filter(t => ['administrator', 'editor', 'agent'].includes(t.role));
    }
    getUser(t) {
      return this.users.find(e => e.email === t);
    }
    firstUpdated() {
      this.reset();
    }
    getLanguageCode() {
      return this.locale.length > 0 ? this.locale[0].split('-')[0] : 'en';
    }
    refreshGlobals() {
      Qt(this.globalsEndpoint).then(t => {
        this.keyedAssets.globals = t.map(t => t.key);
      });
    }
    refreshFields() {
      return Qt(this.fieldsEndpoint).then(t => {
        (this.keyedAssets.fields = []),
          (this.featuredFields = []),
          t.forEach(t => {
            this.keyedAssets.fields.push(t.key),
              (this.fields[t.key] = t),
              t.featured && this.featuredFields.push(t);
          }),
          this.featuredFields.sort((t, e) => e.priority - t.priority),
          this.keyedAssets.fields.sort(),
          this.fireCustomEvent(Me.StoreUpdated, {
            url: this.fieldsEndpoint,
            data: this.keyedAssets.fields
          });
      });
    }
    getShortDuration(t, e = null) {
      const i = e || Ls.now();
      return t.setLocale(this.locale[0]).toRelative({ base: i, style: 'long' });
    }
    getShortDurationFromIso(t, e = null) {
      const i = Ls.fromISO(t),
        o = e ? Ls.fromISO(e) : Ls.now();
      return this.getShortDuration(i, o);
    }
    setKeyedAssets(t, e) {
      this.keyedAssets[t] = e;
    }
    updated(t) {
      if ((super.updated(t), t.has('ready') && this.ready)) {
        const t = this.getLanguageCode(),
          e = nr.find(e => e === t);
        e && sr(e);
      }
    }
    getCompletionSchema() {
      return this.schema;
    }
    getFunctions() {
      return this.fnOptions;
    }
    getKeyedAssets() {
      return this.keyedAssets;
    }
    getFieldKeys() {
      return this.keyedAssets.fields || [];
    }
    getContactField(t) {
      return this.fields[t];
    }
    getFeaturedFields() {
      return this.featuredFields;
    }
    getLanguageName(t) {
      return this.languages[t];
    }
    isDynamicGroup(t) {
      const e = this.groups[t];
      return e || console.warn('No group for ' + t), !(e && !e.query);
    }
    getWorkspace() {
      return this.workspace;
    }
    formatDate(t) {
      return Ls.fromISO(t)
        .setLocale(this.getLocale())
        .toLocaleString(Ls.DATETIME_SHORT);
    }
    postJSON(t, e = '') {
      return Yt(t, e);
    }
    postForm(t, e, i = {}) {
      return ((t, e, i = {}) => {
        const o = new FormData();
        return (
          Object.keys(e).forEach(t => {
            o.append(t, e[t]);
          }),
          Jt(t, o, i)
        );
      })(t, e, i);
    }
    postUrl(t, e = '', i = {}, o = null) {
      return Kt(t, e, i, o);
    }
    getUrl(t, e) {
      return !(e = e || {}).force && this.cache.has(t)
        ? new Promise(e => {
            e(this.cache.get(t));
          })
        : jt(t, e.controller, e.headers || {}).then(
            e =>
              new Promise((i, o) => {
                e.status >= 200 && e.status <= 300
                  ? (this.cache.set(t, e), i(e))
                  : o('Status: ' + e.status);
              })
          );
    }
    getResults(t, e) {
      e = e || {};
      const i = 'results_' + t,
        o = this.cache.get(i);
      return !e.force && o
        ? new Promise(t => {
            t(o);
          })
        : new Promise(e => {
            const o = this.pendingResolves[t] || [];
            o.push(e),
              (this.pendingResolves[t] = o),
              o.length <= 1 &&
                Wt(t).then(e => {
                  this.cache.set(i, e);
                  const o = this.pendingResolves[t] || [];
                  for (; o.length > 0; ) {
                    o.pop()(e);
                  }
                });
          });
    }
    updateCache(t, e) {
      this.cache.set(t, e), this.fireCustomEvent(Me.StoreUpdated, { url: t, data: e });
    }
    makeRequest(t, e) {
      const i = this.fetching[t],
        o = new Date().getTime();
      if (i && o - i < 500) return;
      (this.fetching[t] = o), (e = e || {});
      const n = this.cache.get(t);
      n && !e.force
        ? this.fireCustomEvent(Me.StoreUpdated, { url: t, data: n })
        : Wt(t).then(i => {
            i
              ? ((i = e.prepareData ? e.prepareData(i) : i),
                this.cache.set(t, i),
                this.fireCustomEvent(Me.StoreUpdated, { url: t, data: i }),
                delete this.fetching[t])
              : delete this.fetching[t];
          });
    }
    get(t, e = null) {
      return this.settings[t] || e;
    }
    set(t, e) {
      this.settings[t] = e;
    }
    render() {
      if (!this.ready && this.loader) return j`<temba-loading size="10" units="8"></temba-loading>`;
    }
  }
  t([ge({ type: Number })], rr.prototype, 'ttl', void 0),
    t([ge({ type: Number })], rr.prototype, 'max', void 0),
    t([ge({ type: Boolean })], rr.prototype, 'ready', void 0),
    t([ge({ type: Boolean })], rr.prototype, 'loader', void 0),
    t([ge({ type: String, attribute: 'completion' })], rr.prototype, 'completionEndpoint', void 0),
    t([ge({ type: String, attribute: 'fields' })], rr.prototype, 'fieldsEndpoint', void 0),
    t([ge({ type: String, attribute: 'groups' })], rr.prototype, 'groupsEndpoint', void 0),
    t([ge({ type: String, attribute: 'globals' })], rr.prototype, 'globalsEndpoint', void 0),
    t([ge({ type: String, attribute: 'languages' })], rr.prototype, 'languagesEndpoint', void 0),
    t([ge({ type: String, attribute: 'workspace' })], rr.prototype, 'workspaceEndpoint', void 0),
    t([ge({ type: String, attribute: 'users' })], rr.prototype, 'usersEndpoint', void 0),
    t([ge({ type: Object, attribute: !1 })], rr.prototype, 'schema', void 0),
    t([ge({ type: Object, attribute: !1 })], rr.prototype, 'fnOptions', void 0),
    t([ge({ type: Object, attribute: !1 })], rr.prototype, 'keyedAssets', void 0);
  class ar extends ue {
    constructor() {
      super(...arguments),
        (this.marginHorizontal = 0),
        (this.marginVertical = 7),
        (this.scrollPct = 75),
        (this.cursorIndex = -1),
        (this.internalFocusDisabled = !1),
        (this.nameKey = 'name'),
        (this.loading = !1),
        (this.hideShadow = !1),
        (this.getName = function(t) {
          return t[this.nameKey || 'name'];
        }),
        (this.renderInputOption = function() {
          return null;
        }),
        (this.scrollHeight = 0),
        (this.triggerScroll = !1),
        (this.scrollParent = null),
        (this.setCursor = ee(function(t) {
          this.internalFocusDisabled || (t !== this.cursorIndex && (this.cursorIndex = t));
        }, 50));
    }
    static get styles() {
      return r`
      .options-container {
        background: var(--color-options-bg);
        user-select: none;
        border-radius: var(--curvature-widget);
        overflow: hidden;
        margin-top: var(--options-margin-top);
        display: flex;
        flex-direction: column;
        transform: scaleY(0.5) translateY(-5em);
        transition: transform var(--transition-speed)
            cubic-bezier(0.71, 0.18, 0.61, 1.33),
          opacity var(--transition-speed) cubic-bezier(0.71, 0.18, 0.61, 1.33);
        opacity: 0;
        border: 1px transparent;
      }

      .shadow {
        box-shadow: var(--options-shadow);
      }

      .anchored {
        position: fixed;
      }

      :host([block]) .options-container {
        flex-grow: 1;
        height: 100%;
        border: none;
      }

      :host([block]) .options-scroll {
        height: 100%;
        visibility: visible;
        overflow-y: auto;
        flex-grow: 1;
        -webkit-mask-image: -webkit-radial-gradient(white, black);
      }

      :host([block]) {
        border-radius: var(--curvature);
        display: block;
        height: 100%;
      }

      :host([block]) .shadow {
        box-shadow: var(--options-block-shadow);
      }

      .bordered {
        border: 1px solid var(--color-widget-border) !important;
      }

      :host([block]) .options {
        margin-bottom: 1.5em;
      }

      .options-scroll {
        display: flex;
        flex-direction: column;
      }

      :host([collapsed]) temba-icon {
        flex-grow: 1;
        margin-right: 0px !important;
        padding-top: 0.25em;
        padding-bottom: 0.25em;
      }

      :host([collapsed]) .name {
        display: none;
      }

      :host([collapsed]) .count {
        display: none;
      }

      .options {
        border-radius: var(--curvature-widget);
        overflow-y: auto;
        max-height: 225px;
        border: none;
      }

      .show {
        transform: scaleY(1) translateY(0);
        border: 1px solid var(--color-widget-border);
        opacity: 1;
        z-index: 1;
      }

      .option {
        font-size: var(--temba-options-font-size);
        padding: 5px 10px;
        border-radius: 4px;
        margin: 0.3em;
        cursor: pointer;
        color: var(--color-text-dark);
      }

      .option * {
        user-select: none;
        -webkit-user-select: none;
        -ms-user-select: none;
        overflow-wrap: break-word;
        word-wrap: break-word;
        -ms-word-break: break-all;
        word-break: break-word;
        -ms-hyphens: auto;
        -moz-hyphens: auto;
        -webkit-hyphens: auto;
        hyphens: auto;
      }

      .option .detail {
        font-size: 85%;
        color: rgba(0, 0, 0, 0.4);
      }

      code {
        background: rgba(0, 0, 0, 0.05);
        padding: 1px 5px;
        border-radius: var(--curvature-widget);
      }

      :host([block]) {
        position: relative;
      }

      :host([block]) .options {
        overflow-y: initial;
      }

      temba-loading {
        align-self: center;
        margin-top: 0.025em;
      }

      .loader-bar {
        pointer-events: none;
        align-items: center;
        background: #eee;
        max-height: 0;
        transition: max-height var(--transition-speed) ease-in-out;
        border-bottom-left-radius: var(--curvature-widget);
        border-bottom-right-radius: var(--curvature-widget);
        display: flex;
        overflow: hidden;
      }

      .loading .loader-bar {
        max-height: 1.1em;
      }

      .option:hover {
        background: var(--option-hover-bg);
        color: var(--option-hover-text);
      }

      .option.focused {
        background: var(--color-selection);
        color: var(--color-text-dark);
      }
    `;
    }
    firstUpdated() {
      this.block ||
        ((this.scrollParent = Xt(this)),
        (this.calculatePosition = this.calculatePosition.bind(this)),
        this.scrollParent && this.scrollParent.addEventListener('scroll', this.calculatePosition),
        this.calculatePosition()),
        (this.resolvedRenderOption = (this.renderOption || this.renderOptionDefault).bind(this));
    }
    disconnectedCallback() {
      this.block ||
        (this.scrollParent &&
          this.scrollParent.removeEventListener('scroll', this.calculatePosition));
    }
    isFocused() {
      return this.closestElement(document.activeElement.tagName) === document.activeElement;
    }
    updated(t) {
      if ((super.updated(t), !this.internalFocusDisabled && t.has('cursorIndex'))) {
        const t = this.shadowRoot.querySelector(`div[data-option-index="${this.cursorIndex}"]`);
        if (t) {
          const e = this.shadowRoot.querySelector('.options-container'),
            i = e.getBoundingClientRect().height,
            o = t.getBoundingClientRect().height;
          if (t.offsetTop + o > e.scrollTop + i - 5) {
            const n = t.offsetTop - i + o + 5;
            e.scrollTop = n;
          } else if (t.offsetTop < e.scrollTop) {
            const i = t.offsetTop - 5;
            e.scrollTop = i;
          }
        }
        this.fireCustomEvent(Me.CursorChanged, { index: this.cursorIndex });
      }
      if (
        (t.has('visible') &&
          t.has('options') &&
          (this.visible ||
            0 != this.options.length ||
            ((this.tempOptions = t.get('options')),
            window.setTimeout(() => {
              this.tempOptions = [];
            }, 300))),
        t.has('options'))
      ) {
        this.calculatePosition(), (this.triggerScroll = !0);
        const e = t.get('options'),
          i = e ? e.length : 0,
          o = this.options ? this.options.length : 0;
        (-1 === this.cursorIndex || o < i || (0 === i && o > 0 && !t.has('cursorIndex'))) &&
          (this.internalFocusDisabled ||
            (this.block
              ? this.cursorIndex >= o && (this.cursorIndex = o - 1)
              : (this.cursorIndex = 0),
            this.block && this.handleSelection(!1)));
        const n = this.shadowRoot.querySelector('.options');
        n.scrollHeight == n.clientHeight && this.fireCustomEvent(Me.ScrollThreshold);
      }
      t.has('visible') &&
        window.setTimeout(() => {
          this.calculatePosition();
        }, 100);
    }
    renderOptionDefault(t, e) {
      const i = (this.renderOptionName || this.renderOptionNameDefault).bind(this),
        o = (this.renderOptionDetail || this.renderOptionDetailDefault).bind(this);
      return e
        ? j`
        <div class="name">${i(t, e)}</div>
        <div class="detail">${o(t, e)}</div>
      `
        : j`
        <div class="name">${i(t, e)}</div>
      `;
    }
    renderOptionNameDefault(t) {
      return j`<div style="display:flex; align-items:flex-start">
      ${
        t.icon
          ? j`<temba-icon
            name="${t.icon}"
            style="margin-right:0.5em; fill: var(--color-text-dark);"
          ></temba-icon>`
          : null
      }
      <div style="flex-grow:1">${t.prefix}${this.getName(t)}</div>
    </div>`;
    }
    renderOptionDetailDefault(t) {
      return j` ${t.detail} `;
    }
    handleSelection(t = !1, e = -1) {
      this.internalFocusDisabled || (-1 === e && (e = this.cursorIndex));
      const i = this.options[e];
      this.fireCustomEvent(Me.Selection, { selected: i, tabbed: t, index: e });
    }
    moveCursor(t) {
      if (!this.internalFocusDisabled) {
        const e = Math.max(Math.min(this.cursorIndex + t, this.options.length - 1), 0);
        this.setCursor(e);
      }
    }
    scrollToTop() {
      this.shadowRoot.querySelector('.options-scroll').scrollTop = 0;
    }
    handleKeyDown(t) {
      this.internalFocusDisabled ||
        (this.block && !this.isFocused()) ||
        (this.options &&
          this.options.length > 0 &&
          ((t.ctrlKey && 'n' === t.key) || 'ArrowDown' === t.key
            ? (this.moveCursor(1),
              t.preventDefault(),
              t.stopPropagation(),
              this.block && this.handleSelection(!1))
            : (t.ctrlKey && 'p' === t.key) || 'ArrowUp' === t.key
            ? (this.moveCursor(-1), t.preventDefault(), this.block && this.handleSelection(!1))
            : ('Enter' === t.key || 'Tab' === t.key || (this.spaceSelect && ' ' === t.key)) &&
              (t.preventDefault(), t.stopPropagation(), this.handleSelection('Tab' === t.key)),
          'Escape' === t.key && this.fireCustomEvent(Me.Canceled)));
    }
    handleInnerScroll(t) {
      const e = t.target;
      if (
        (e.scrollHeight > this.scrollHeight &&
          ((this.scrollHeight = e.scrollHeight), (this.triggerScroll = !0)),
        this.triggerScroll)
      ) {
        100 * (e.scrollTop / (e.scrollHeight - e.clientHeight)) > this.scrollPct &&
          (this.fireCustomEvent(Me.ScrollThreshold), (this.triggerScroll = !1));
      }
    }
    calculatePosition() {
      if (this.visible && !this.block) {
        const t = this.shadowRoot.querySelector('.options-container').getBoundingClientRect();
        if (this.anchorTo) {
          const e = this.anchorTo.getBoundingClientRect(),
            i = e.top - t.height;
          this.anchorTo &&
            this.scrollParent &&
            ((t, e) => {
              e = e || document.body;
              const { top: i, bottom: o } = t.getBoundingClientRect(),
                n = e.getBoundingClientRect();
              i <= n.top ? n.top : n.bottom;
            })(this.anchorTo, this.scrollParent),
            i > 0 && e.bottom + t.height > window.innerHeight
              ? ((this.top = i), (this.poppedTop = !0))
              : ((this.top = e.bottom), (this.poppedTop = !1)),
            (this.left = e.left),
            (this.width =
              this.staticWidth > 0 ? this.staticWidth : e.width - 2 - 2 * this.marginHorizontal),
            this.anchorRight && (this.left = e.right - this.width);
        }
      }
    }
    getEventHandlers() {
      return [
        { event: 'keydown', method: this.handleKeyDown, isDocument: !0 },
        { event: 'scroll', method: this.calculatePosition, isDocument: !0 }
      ];
    }
    handleMouseMove(t) {
      if (!this.block && Math.abs(t.movementX) + Math.abs(t.movementY) > 0) {
        const e = t.currentTarget.getAttribute('data-option-index');
        this.setCursor(parseInt(e));
      }
    }
    handleMouseDown(t) {
      t.preventDefault(), t.stopPropagation();
    }
    handleOptionClick(t) {
      t.preventDefault(), t.stopPropagation();
      const e = t.currentTarget.getAttribute('data-option-index');
      if (e) {
        const t = parseInt(e);
        this.setCursor(t), this.handleSelection(!1, t);
      }
    }
    render() {
      let t = this.block ? 0 : this.marginVertical;
      this.poppedTop && (t *= -1);
      const e = { 'margin-left': `${this.marginHorizontal}px`, 'margin-top': `${t}px` };
      this.top && (e.top = `${this.top}px`), this.left && (e.left = `${this.left}px`);
      const i = {};
      this.width && (i.width = `${this.width}px`);
      const o = Ht({
          'options-container': !0,
          show: this.visible,
          top: this.poppedTop,
          anchored: !this.block,
          loading: this.loading,
          shadow: !this.hideShadow,
          bordered: this.hideShadow
        }),
        n = Ht({ options: !0 });
      let s = this.options || [];
      return (
        0 == s.length && this.tempOptions && this.tempOptions.length > 0 && (s = this.tempOptions),
        j`
      <div class=${o} style=${Se(e)}>
        <div
          class="options-scroll"
          @scroll=${this.handleInnerScroll}
          @mousedown=${this.handleMouseDown}
        >
          <div class="${n}" style=${Se(i)}>
            ${s.map(
              (t, e) => j`<div
                data-option-index="${e}"
                @mousemove=${this.handleMouseMove}
                @click=${this.handleOptionClick}
                @mousedown=${this.handleMouseDown}
                class="option ${
                  e !== this.cursorIndex || this.internalFocusDisabled ? '' : 'focused'
                }"
              >
                ${this.resolvedRenderOption(t, e === this.cursorIndex)}
              </div>`
            )}
            ${this.block ? j`<div style="height:0.1em"></div>` : null}
          </div>
          <slot></slot>
        </div>

        <div class="loader-bar">
          <temba-loading></temba-loading>
        </div>
      </div>
    `
      );
    }
  }
  t([ge({ type: Number })], ar.prototype, 'top', void 0),
    t([ge({ type: Number })], ar.prototype, 'left', void 0),
    t([ge({ type: Number })], ar.prototype, 'width', void 0),
    t([ge({ type: Number, attribute: 'static-width' })], ar.prototype, 'staticWidth', void 0),
    t([ge({ type: Boolean, attribute: 'anchor-right' })], ar.prototype, 'anchorRight', void 0),
    t([ge({ type: Number })], ar.prototype, 'marginHorizontal', void 0),
    t([ge({ type: Number })], ar.prototype, 'marginVertical', void 0),
    t([ge({ type: Object })], ar.prototype, 'anchorTo', void 0),
    t([ge({ type: Boolean })], ar.prototype, 'visible', void 0),
    t([ge({ type: Boolean })], ar.prototype, 'block', void 0),
    t([ge({ type: Number })], ar.prototype, 'scrollPct', void 0),
    t([ge({ type: Number })], ar.prototype, 'cursorIndex', void 0),
    t([ge({ type: Boolean })], ar.prototype, 'internalFocusDisabled', void 0),
    t([ge({ type: Array })], ar.prototype, 'options', void 0),
    t([ge({ type: Array })], ar.prototype, 'tempOptions', void 0),
    t([ge({ type: Boolean })], ar.prototype, 'poppedTop', void 0),
    t([ge({ type: Boolean })], ar.prototype, 'spaceSelect', void 0),
    t([ge({ type: String })], ar.prototype, 'nameKey', void 0),
    t([ge({ type: Boolean })], ar.prototype, 'loading', void 0),
    t([ge({ type: Boolean })], ar.prototype, 'collapsed', void 0),
    t([ge({ type: Boolean })], ar.prototype, 'hideShadow', void 0),
    t([ge({ attribute: !1 })], ar.prototype, 'getName', void 0),
    t([ge({ attribute: !1 })], ar.prototype, 'renderInputOption', void 0),
    t([ge({ attribute: !1 })], ar.prototype, 'renderOption', void 0),
    t([ge({ attribute: !1 })], ar.prototype, 'renderOptionName', void 0),
    t([ge({ attribute: !1 })], ar.prototype, 'renderOptionDetail', void 0),
    t([ge({ type: Number })], ar.prototype, 'scrollHeight', void 0),
    t([ge({ type: Boolean })], ar.prototype, 'triggerScroll', void 0);
  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
  class lr extends ke {
    constructor(t) {
      if ((super(t), (this.it = V), t.type !== xe))
        throw Error(this.constructor.directiveName + '() can only be used in child bindings');
    }
    render(t) {
      if (t === V || null == t) return (this._t = void 0), (this.it = t);
      if (t === H) return t;
      if ('string' != typeof t)
        throw Error(this.constructor.directiveName + '() called with a non-string value');
      if (t === this.it) return this._t;
      this.it = t;
      const e = [t];
      return (
        (e.raw = e), (this._t = { _$litType$: this.constructor.resultType, strings: e, values: [] })
      );
    }
  }
  (lr.directiveName = 'unsafeHTML'), (lr.resultType = 1);
  const hr = we(lr),
    cr = (t, e, i) => {
      const o = t.substring(1);
      if ('(' === o[0]) return !0;
      {
        const t = o.split('.')[0].toLowerCase();
        if (!i) return e.indexOf(t) >= 0;
        for (const i of e) if (((n = t), 0 === i.indexOf(n, 0))) return !0;
        return !1;
      }
      var n;
    },
    dr = t =>
      (t >= 'a' && t <= 'z') || (t >= 'A' && t <= 'Z') || (t >= '0' && t <= '9') || '_' === t,
    ur = t => {
      let e = 0;
      for (const i of t) '"' === i && e++;
      return e % 2 != 0;
    };
  class pr {
    constructor(t, e) {
      (this.expressionPrefix = t), (this.allowedTopLevels = e);
    }
    expressionContext(t) {
      const e = this.findExpressions(t);
      if (0 === e.length) return null;
      const i = e[e.length - 1];
      return i.end < t.length || i.closed ? null : i.text.substring(1);
    }
    autoCompleteContext(t) {
      if (ur(t)) return null;
      const e = [];
      let i = '',
        o = !1,
        n = !1,
        s = '';
      for (let r = t.length - 1; r >= 0; r--) {
        const a = t[r];
        if (
          (' ' === a && (o = !0),
          ',' === a && ((o = !0), '(' !== e[e.length - 1] && e.push('(')),
          ')' !== a || n || ((o = !0), e.push('('), e.push('(')),
          '"' === a && (n = !n),
          o && ('(' !== a || n || ('(' === e[e.length - 1] && e.pop(), 0 === e.length && (o = !1))),
          '(' === a && '' === i && (s = '#'),
          !(o || n || ('(' === a && '' === i)))
        ) {
          if (!dr(a) && '.' !== a) break;
          i = a + i;
        }
      }
      return i.match(/[A-Za-z][\w]*(\.[\w]+)*/) ? s + i : null;
    }
    functionContext(t) {
      let e = ur(t) ? 4 : 6,
        i = '',
        o = '(' === t[-1] ? 0 : 1;
      for (let n = t.length - 1; n >= 0; n--) {
        const s = t[n];
        if ('@' === s) return '';
        if (6 === e)
          0 !== o || (!dr(s) && '.' !== s)
            ? '"' === s
              ? (e = 4)
              : '(' === s
              ? o--
              : ')' === s && o++
            : ((e = 2), (i = s + i));
        else if (2 === e) {
          if (!dr(s) && '.' !== s) return i;
          i = s + i;
        } else 4 === e && '"' === s && (e = 6);
      }
      return '';
    }
    getContactFields(t) {
      const e = {},
        i = /((parent|child\.)*contact\.)*fields\.([a-z0-9_]+)/g,
        o = this.findExpressions(t);
      for (const t of o) {
        let o;
        for (; (o = i.exec(t.text)); ) e[o[3]] = !0;
      }
      return Object.keys(e);
    }
    findExpressions(t) {
      const e = [];
      let i = 0,
        o = null,
        n = 0;
      for (let s = 0; s < t.length; s++) {
        const r = t[s],
          a = s < t.length - 1 ? t[s + 1] : 0,
          l = s < t.length - 2 ? t[s + 2] : 0;
        if (
          (0 === i
            ? r !== this.expressionPrefix || (!dr(a) && '(' !== a)
              ? r === this.expressionPrefix && a === this.expressionPrefix && (i = 5)
              : ((i = 1), (o = { start: s, end: null, text: r, closed: !1 }))
            : 1 === i
            ? (dr(r) ? (i = 2) : '(' === r && ((i = 3), (n += 1)), (o.text += r))
            : 2 === i
            ? (o.text += r)
            : 3 === i
            ? ('(' === r ? (n += 1) : ')' === r ? (n -= 1) : '"' === r && (i = 4),
              (o.text += r),
              0 === n && (o.end = s + 1))
            : 4 === i
            ? ('"' === r && (i = 3), (o.text += r))
            : 5 === i && (i = 0),
          2 === i && ((!dr(a) && '.' !== a) || ('.' === a && !dr(l))) && (o.end = s + 1),
          null != o && (null != o.end || 0 === a))
        ) {
          const t = 0 === a;
          cr(o.text, this.allowedTopLevels, t) &&
            ((o.closed = '(' === o.text[1] && 0 === n), (o.end = s + 1), e.push(o)),
            (o = null),
            (i = 0);
        }
      }
      return e;
    }
  }
  var mr = {
      Aacute: 'Á',
      aacute: 'á',
      Abreve: 'Ă',
      abreve: 'ă',
      ac: '∾',
      acd: '∿',
      acE: '∾̳',
      Acirc: 'Â',
      acirc: 'â',
      acute: '´',
      Acy: 'А',
      acy: 'а',
      AElig: 'Æ',
      aelig: 'æ',
      af: '⁡',
      Afr: '𝔄',
      afr: '𝔞',
      Agrave: 'À',
      agrave: 'à',
      alefsym: 'ℵ',
      aleph: 'ℵ',
      Alpha: 'Α',
      alpha: 'α',
      Amacr: 'Ā',
      amacr: 'ā',
      amalg: '⨿',
      AMP: '&',
      amp: '&',
      And: '⩓',
      and: '∧',
      andand: '⩕',
      andd: '⩜',
      andslope: '⩘',
      andv: '⩚',
      ang: '∠',
      ange: '⦤',
      angle: '∠',
      angmsd: '∡',
      angmsdaa: '⦨',
      angmsdab: '⦩',
      angmsdac: '⦪',
      angmsdad: '⦫',
      angmsdae: '⦬',
      angmsdaf: '⦭',
      angmsdag: '⦮',
      angmsdah: '⦯',
      angrt: '∟',
      angrtvb: '⊾',
      angrtvbd: '⦝',
      angsph: '∢',
      angst: 'Å',
      angzarr: '⍼',
      Aogon: 'Ą',
      aogon: 'ą',
      Aopf: '𝔸',
      aopf: '𝕒',
      ap: '≈',
      apacir: '⩯',
      apE: '⩰',
      ape: '≊',
      apid: '≋',
      apos: "'",
      ApplyFunction: '⁡',
      approx: '≈',
      approxeq: '≊',
      Aring: 'Å',
      aring: 'å',
      Ascr: '𝒜',
      ascr: '𝒶',
      Assign: '≔',
      ast: '*',
      asymp: '≈',
      asympeq: '≍',
      Atilde: 'Ã',
      atilde: 'ã',
      Auml: 'Ä',
      auml: 'ä',
      awconint: '∳',
      awint: '⨑',
      backcong: '≌',
      backepsilon: '϶',
      backprime: '‵',
      backsim: '∽',
      backsimeq: '⋍',
      Backslash: '∖',
      Barv: '⫧',
      barvee: '⊽',
      Barwed: '⌆',
      barwed: '⌅',
      barwedge: '⌅',
      bbrk: '⎵',
      bbrktbrk: '⎶',
      bcong: '≌',
      Bcy: 'Б',
      bcy: 'б',
      bdquo: '„',
      becaus: '∵',
      Because: '∵',
      because: '∵',
      bemptyv: '⦰',
      bepsi: '϶',
      bernou: 'ℬ',
      Bernoullis: 'ℬ',
      Beta: 'Β',
      beta: 'β',
      beth: 'ℶ',
      between: '≬',
      Bfr: '𝔅',
      bfr: '𝔟',
      bigcap: '⋂',
      bigcirc: '◯',
      bigcup: '⋃',
      bigodot: '⨀',
      bigoplus: '⨁',
      bigotimes: '⨂',
      bigsqcup: '⨆',
      bigstar: '★',
      bigtriangledown: '▽',
      bigtriangleup: '△',
      biguplus: '⨄',
      bigvee: '⋁',
      bigwedge: '⋀',
      bkarow: '⤍',
      blacklozenge: '⧫',
      blacksquare: '▪',
      blacktriangle: '▴',
      blacktriangledown: '▾',
      blacktriangleleft: '◂',
      blacktriangleright: '▸',
      blank: '␣',
      blk12: '▒',
      blk14: '░',
      blk34: '▓',
      block: '█',
      bne: '=⃥',
      bnequiv: '≡⃥',
      bNot: '⫭',
      bnot: '⌐',
      Bopf: '𝔹',
      bopf: '𝕓',
      bot: '⊥',
      bottom: '⊥',
      bowtie: '⋈',
      boxbox: '⧉',
      boxDL: '╗',
      boxDl: '╖',
      boxdL: '╕',
      boxdl: '┐',
      boxDR: '╔',
      boxDr: '╓',
      boxdR: '╒',
      boxdr: '┌',
      boxH: '═',
      boxh: '─',
      boxHD: '╦',
      boxHd: '╤',
      boxhD: '╥',
      boxhd: '┬',
      boxHU: '╩',
      boxHu: '╧',
      boxhU: '╨',
      boxhu: '┴',
      boxminus: '⊟',
      boxplus: '⊞',
      boxtimes: '⊠',
      boxUL: '╝',
      boxUl: '╜',
      boxuL: '╛',
      boxul: '┘',
      boxUR: '╚',
      boxUr: '╙',
      boxuR: '╘',
      boxur: '└',
      boxV: '║',
      boxv: '│',
      boxVH: '╬',
      boxVh: '╫',
      boxvH: '╪',
      boxvh: '┼',
      boxVL: '╣',
      boxVl: '╢',
      boxvL: '╡',
      boxvl: '┤',
      boxVR: '╠',
      boxVr: '╟',
      boxvR: '╞',
      boxvr: '├',
      bprime: '‵',
      Breve: '˘',
      breve: '˘',
      brvbar: '¦',
      Bscr: 'ℬ',
      bscr: '𝒷',
      bsemi: '⁏',
      bsim: '∽',
      bsime: '⋍',
      bsol: '\\',
      bsolb: '⧅',
      bsolhsub: '⟈',
      bull: '•',
      bullet: '•',
      bump: '≎',
      bumpE: '⪮',
      bumpe: '≏',
      Bumpeq: '≎',
      bumpeq: '≏',
      Cacute: 'Ć',
      cacute: 'ć',
      Cap: '⋒',
      cap: '∩',
      capand: '⩄',
      capbrcup: '⩉',
      capcap: '⩋',
      capcup: '⩇',
      capdot: '⩀',
      CapitalDifferentialD: 'ⅅ',
      caps: '∩︀',
      caret: '⁁',
      caron: 'ˇ',
      Cayleys: 'ℭ',
      ccaps: '⩍',
      Ccaron: 'Č',
      ccaron: 'č',
      Ccedil: 'Ç',
      ccedil: 'ç',
      Ccirc: 'Ĉ',
      ccirc: 'ĉ',
      Cconint: '∰',
      ccups: '⩌',
      ccupssm: '⩐',
      Cdot: 'Ċ',
      cdot: 'ċ',
      cedil: '¸',
      Cedilla: '¸',
      cemptyv: '⦲',
      cent: '¢',
      CenterDot: '·',
      centerdot: '·',
      Cfr: 'ℭ',
      cfr: '𝔠',
      CHcy: 'Ч',
      chcy: 'ч',
      check: '✓',
      checkmark: '✓',
      Chi: 'Χ',
      chi: 'χ',
      cir: '○',
      circ: 'ˆ',
      circeq: '≗',
      circlearrowleft: '↺',
      circlearrowright: '↻',
      circledast: '⊛',
      circledcirc: '⊚',
      circleddash: '⊝',
      CircleDot: '⊙',
      circledR: '®',
      circledS: 'Ⓢ',
      CircleMinus: '⊖',
      CirclePlus: '⊕',
      CircleTimes: '⊗',
      cirE: '⧃',
      cire: '≗',
      cirfnint: '⨐',
      cirmid: '⫯',
      cirscir: '⧂',
      ClockwiseContourIntegral: '∲',
      CloseCurlyDoubleQuote: '”',
      CloseCurlyQuote: '’',
      clubs: '♣',
      clubsuit: '♣',
      Colon: '∷',
      colon: ':',
      Colone: '⩴',
      colone: '≔',
      coloneq: '≔',
      comma: ',',
      commat: '@',
      comp: '∁',
      compfn: '∘',
      complement: '∁',
      complexes: 'ℂ',
      cong: '≅',
      congdot: '⩭',
      Congruent: '≡',
      Conint: '∯',
      conint: '∮',
      ContourIntegral: '∮',
      Copf: 'ℂ',
      copf: '𝕔',
      coprod: '∐',
      Coproduct: '∐',
      COPY: '©',
      copy: '©',
      copysr: '℗',
      CounterClockwiseContourIntegral: '∳',
      crarr: '↵',
      Cross: '⨯',
      cross: '✗',
      Cscr: '𝒞',
      cscr: '𝒸',
      csub: '⫏',
      csube: '⫑',
      csup: '⫐',
      csupe: '⫒',
      ctdot: '⋯',
      cudarrl: '⤸',
      cudarrr: '⤵',
      cuepr: '⋞',
      cuesc: '⋟',
      cularr: '↶',
      cularrp: '⤽',
      Cup: '⋓',
      cup: '∪',
      cupbrcap: '⩈',
      CupCap: '≍',
      cupcap: '⩆',
      cupcup: '⩊',
      cupdot: '⊍',
      cupor: '⩅',
      cups: '∪︀',
      curarr: '↷',
      curarrm: '⤼',
      curlyeqprec: '⋞',
      curlyeqsucc: '⋟',
      curlyvee: '⋎',
      curlywedge: '⋏',
      curren: '¤',
      curvearrowleft: '↶',
      curvearrowright: '↷',
      cuvee: '⋎',
      cuwed: '⋏',
      cwconint: '∲',
      cwint: '∱',
      cylcty: '⌭',
      Dagger: '‡',
      dagger: '†',
      daleth: 'ℸ',
      Darr: '↡',
      dArr: '⇓',
      darr: '↓',
      dash: '‐',
      Dashv: '⫤',
      dashv: '⊣',
      dbkarow: '⤏',
      dblac: '˝',
      Dcaron: 'Ď',
      dcaron: 'ď',
      Dcy: 'Д',
      dcy: 'д',
      DD: 'ⅅ',
      dd: 'ⅆ',
      ddagger: '‡',
      ddarr: '⇊',
      DDotrahd: '⤑',
      ddotseq: '⩷',
      deg: '°',
      Del: '∇',
      Delta: 'Δ',
      delta: 'δ',
      demptyv: '⦱',
      dfisht: '⥿',
      Dfr: '𝔇',
      dfr: '𝔡',
      dHar: '⥥',
      dharl: '⇃',
      dharr: '⇂',
      DiacriticalAcute: '´',
      DiacriticalDot: '˙',
      DiacriticalDoubleAcute: '˝',
      DiacriticalGrave: '`',
      DiacriticalTilde: '˜',
      diam: '⋄',
      Diamond: '⋄',
      diamond: '⋄',
      diamondsuit: '♦',
      diams: '♦',
      die: '¨',
      DifferentialD: 'ⅆ',
      digamma: 'ϝ',
      disin: '⋲',
      div: '÷',
      divide: '÷',
      divideontimes: '⋇',
      divonx: '⋇',
      DJcy: 'Ђ',
      djcy: 'ђ',
      dlcorn: '⌞',
      dlcrop: '⌍',
      dollar: '$',
      Dopf: '𝔻',
      dopf: '𝕕',
      Dot: '¨',
      dot: '˙',
      DotDot: '⃜',
      doteq: '≐',
      doteqdot: '≑',
      DotEqual: '≐',
      dotminus: '∸',
      dotplus: '∔',
      dotsquare: '⊡',
      doublebarwedge: '⌆',
      DoubleContourIntegral: '∯',
      DoubleDot: '¨',
      DoubleDownArrow: '⇓',
      DoubleLeftArrow: '⇐',
      DoubleLeftRightArrow: '⇔',
      DoubleLeftTee: '⫤',
      DoubleLongLeftArrow: '⟸',
      DoubleLongLeftRightArrow: '⟺',
      DoubleLongRightArrow: '⟹',
      DoubleRightArrow: '⇒',
      DoubleRightTee: '⊨',
      DoubleUpArrow: '⇑',
      DoubleUpDownArrow: '⇕',
      DoubleVerticalBar: '∥',
      DownArrow: '↓',
      Downarrow: '⇓',
      downarrow: '↓',
      DownArrowBar: '⤓',
      DownArrowUpArrow: '⇵',
      DownBreve: '̑',
      downdownarrows: '⇊',
      downharpoonleft: '⇃',
      downharpoonright: '⇂',
      DownLeftRightVector: '⥐',
      DownLeftTeeVector: '⥞',
      DownLeftVector: '↽',
      DownLeftVectorBar: '⥖',
      DownRightTeeVector: '⥟',
      DownRightVector: '⇁',
      DownRightVectorBar: '⥗',
      DownTee: '⊤',
      DownTeeArrow: '↧',
      drbkarow: '⤐',
      drcorn: '⌟',
      drcrop: '⌌',
      Dscr: '𝒟',
      dscr: '𝒹',
      DScy: 'Ѕ',
      dscy: 'ѕ',
      dsol: '⧶',
      Dstrok: 'Đ',
      dstrok: 'đ',
      dtdot: '⋱',
      dtri: '▿',
      dtrif: '▾',
      duarr: '⇵',
      duhar: '⥯',
      dwangle: '⦦',
      DZcy: 'Џ',
      dzcy: 'џ',
      dzigrarr: '⟿',
      Eacute: 'É',
      eacute: 'é',
      easter: '⩮',
      Ecaron: 'Ě',
      ecaron: 'ě',
      ecir: '≖',
      Ecirc: 'Ê',
      ecirc: 'ê',
      ecolon: '≕',
      Ecy: 'Э',
      ecy: 'э',
      eDDot: '⩷',
      Edot: 'Ė',
      eDot: '≑',
      edot: 'ė',
      ee: 'ⅇ',
      efDot: '≒',
      Efr: '𝔈',
      efr: '𝔢',
      eg: '⪚',
      Egrave: 'È',
      egrave: 'è',
      egs: '⪖',
      egsdot: '⪘',
      el: '⪙',
      Element: '∈',
      elinters: '⏧',
      ell: 'ℓ',
      els: '⪕',
      elsdot: '⪗',
      Emacr: 'Ē',
      emacr: 'ē',
      empty: '∅',
      emptyset: '∅',
      EmptySmallSquare: '◻',
      emptyv: '∅',
      EmptyVerySmallSquare: '▫',
      emsp: ' ',
      emsp13: ' ',
      emsp14: ' ',
      ENG: 'Ŋ',
      eng: 'ŋ',
      ensp: ' ',
      Eogon: 'Ę',
      eogon: 'ę',
      Eopf: '𝔼',
      eopf: '𝕖',
      epar: '⋕',
      eparsl: '⧣',
      eplus: '⩱',
      epsi: 'ε',
      Epsilon: 'Ε',
      epsilon: 'ε',
      epsiv: 'ϵ',
      eqcirc: '≖',
      eqcolon: '≕',
      eqsim: '≂',
      eqslantgtr: '⪖',
      eqslantless: '⪕',
      Equal: '⩵',
      equals: '=',
      EqualTilde: '≂',
      equest: '≟',
      Equilibrium: '⇌',
      equiv: '≡',
      equivDD: '⩸',
      eqvparsl: '⧥',
      erarr: '⥱',
      erDot: '≓',
      Escr: 'ℰ',
      escr: 'ℯ',
      esdot: '≐',
      Esim: '⩳',
      esim: '≂',
      Eta: 'Η',
      eta: 'η',
      ETH: 'Ð',
      eth: 'ð',
      Euml: 'Ë',
      euml: 'ë',
      euro: '€',
      excl: '!',
      exist: '∃',
      Exists: '∃',
      expectation: 'ℰ',
      ExponentialE: 'ⅇ',
      exponentiale: 'ⅇ',
      fallingdotseq: '≒',
      Fcy: 'Ф',
      fcy: 'ф',
      female: '♀',
      ffilig: 'ﬃ',
      fflig: 'ﬀ',
      ffllig: 'ﬄ',
      Ffr: '𝔉',
      ffr: '𝔣',
      filig: 'ﬁ',
      FilledSmallSquare: '◼',
      FilledVerySmallSquare: '▪',
      fjlig: 'fj',
      flat: '♭',
      fllig: 'ﬂ',
      fltns: '▱',
      fnof: 'ƒ',
      Fopf: '𝔽',
      fopf: '𝕗',
      ForAll: '∀',
      forall: '∀',
      fork: '⋔',
      forkv: '⫙',
      Fouriertrf: 'ℱ',
      fpartint: '⨍',
      frac12: '½',
      frac13: '⅓',
      frac14: '¼',
      frac15: '⅕',
      frac16: '⅙',
      frac18: '⅛',
      frac23: '⅔',
      frac25: '⅖',
      frac34: '¾',
      frac35: '⅗',
      frac38: '⅜',
      frac45: '⅘',
      frac56: '⅚',
      frac58: '⅝',
      frac78: '⅞',
      frasl: '⁄',
      frown: '⌢',
      Fscr: 'ℱ',
      fscr: '𝒻',
      gacute: 'ǵ',
      Gamma: 'Γ',
      gamma: 'γ',
      Gammad: 'Ϝ',
      gammad: 'ϝ',
      gap: '⪆',
      Gbreve: 'Ğ',
      gbreve: 'ğ',
      Gcedil: 'Ģ',
      Gcirc: 'Ĝ',
      gcirc: 'ĝ',
      Gcy: 'Г',
      gcy: 'г',
      Gdot: 'Ġ',
      gdot: 'ġ',
      gE: '≧',
      ge: '≥',
      gEl: '⪌',
      gel: '⋛',
      geq: '≥',
      geqq: '≧',
      geqslant: '⩾',
      ges: '⩾',
      gescc: '⪩',
      gesdot: '⪀',
      gesdoto: '⪂',
      gesdotol: '⪄',
      gesl: '⋛︀',
      gesles: '⪔',
      Gfr: '𝔊',
      gfr: '𝔤',
      Gg: '⋙',
      gg: '≫',
      ggg: '⋙',
      gimel: 'ℷ',
      GJcy: 'Ѓ',
      gjcy: 'ѓ',
      gl: '≷',
      gla: '⪥',
      glE: '⪒',
      glj: '⪤',
      gnap: '⪊',
      gnapprox: '⪊',
      gnE: '≩',
      gne: '⪈',
      gneq: '⪈',
      gneqq: '≩',
      gnsim: '⋧',
      Gopf: '𝔾',
      gopf: '𝕘',
      grave: '`',
      GreaterEqual: '≥',
      GreaterEqualLess: '⋛',
      GreaterFullEqual: '≧',
      GreaterGreater: '⪢',
      GreaterLess: '≷',
      GreaterSlantEqual: '⩾',
      GreaterTilde: '≳',
      Gscr: '𝒢',
      gscr: 'ℊ',
      gsim: '≳',
      gsime: '⪎',
      gsiml: '⪐',
      GT: '>',
      Gt: '≫',
      gt: '>',
      gtcc: '⪧',
      gtcir: '⩺',
      gtdot: '⋗',
      gtlPar: '⦕',
      gtquest: '⩼',
      gtrapprox: '⪆',
      gtrarr: '⥸',
      gtrdot: '⋗',
      gtreqless: '⋛',
      gtreqqless: '⪌',
      gtrless: '≷',
      gtrsim: '≳',
      gvertneqq: '≩︀',
      gvnE: '≩︀',
      Hacek: 'ˇ',
      hairsp: ' ',
      half: '½',
      hamilt: 'ℋ',
      HARDcy: 'Ъ',
      hardcy: 'ъ',
      hArr: '⇔',
      harr: '↔',
      harrcir: '⥈',
      harrw: '↭',
      Hat: '^',
      hbar: 'ℏ',
      Hcirc: 'Ĥ',
      hcirc: 'ĥ',
      hearts: '♥',
      heartsuit: '♥',
      hellip: '…',
      hercon: '⊹',
      Hfr: 'ℌ',
      hfr: '𝔥',
      HilbertSpace: 'ℋ',
      hksearow: '⤥',
      hkswarow: '⤦',
      hoarr: '⇿',
      homtht: '∻',
      hookleftarrow: '↩',
      hookrightarrow: '↪',
      Hopf: 'ℍ',
      hopf: '𝕙',
      horbar: '―',
      HorizontalLine: '─',
      Hscr: 'ℋ',
      hscr: '𝒽',
      hslash: 'ℏ',
      Hstrok: 'Ħ',
      hstrok: 'ħ',
      HumpDownHump: '≎',
      HumpEqual: '≏',
      hybull: '⁃',
      hyphen: '‐',
      Iacute: 'Í',
      iacute: 'í',
      ic: '⁣',
      Icirc: 'Î',
      icirc: 'î',
      Icy: 'И',
      icy: 'и',
      Idot: 'İ',
      IEcy: 'Е',
      iecy: 'е',
      iexcl: '¡',
      iff: '⇔',
      Ifr: 'ℑ',
      ifr: '𝔦',
      Igrave: 'Ì',
      igrave: 'ì',
      ii: 'ⅈ',
      iiiint: '⨌',
      iiint: '∭',
      iinfin: '⧜',
      iiota: '℩',
      IJlig: 'Ĳ',
      ijlig: 'ĳ',
      Im: 'ℑ',
      Imacr: 'Ī',
      imacr: 'ī',
      image: 'ℑ',
      ImaginaryI: 'ⅈ',
      imagline: 'ℐ',
      imagpart: 'ℑ',
      imath: 'ı',
      imof: '⊷',
      imped: 'Ƶ',
      Implies: '⇒',
      in: '∈',
      incare: '℅',
      infin: '∞',
      infintie: '⧝',
      inodot: 'ı',
      Int: '∬',
      int: '∫',
      intcal: '⊺',
      integers: 'ℤ',
      Integral: '∫',
      intercal: '⊺',
      Intersection: '⋂',
      intlarhk: '⨗',
      intprod: '⨼',
      InvisibleComma: '⁣',
      InvisibleTimes: '⁢',
      IOcy: 'Ё',
      iocy: 'ё',
      Iogon: 'Į',
      iogon: 'į',
      Iopf: '𝕀',
      iopf: '𝕚',
      Iota: 'Ι',
      iota: 'ι',
      iprod: '⨼',
      iquest: '¿',
      Iscr: 'ℐ',
      iscr: '𝒾',
      isin: '∈',
      isindot: '⋵',
      isinE: '⋹',
      isins: '⋴',
      isinsv: '⋳',
      isinv: '∈',
      it: '⁢',
      Itilde: 'Ĩ',
      itilde: 'ĩ',
      Iukcy: 'І',
      iukcy: 'і',
      Iuml: 'Ï',
      iuml: 'ï',
      Jcirc: 'Ĵ',
      jcirc: 'ĵ',
      Jcy: 'Й',
      jcy: 'й',
      Jfr: '𝔍',
      jfr: '𝔧',
      jmath: 'ȷ',
      Jopf: '𝕁',
      jopf: '𝕛',
      Jscr: '𝒥',
      jscr: '𝒿',
      Jsercy: 'Ј',
      jsercy: 'ј',
      Jukcy: 'Є',
      jukcy: 'є',
      Kappa: 'Κ',
      kappa: 'κ',
      kappav: 'ϰ',
      Kcedil: 'Ķ',
      kcedil: 'ķ',
      Kcy: 'К',
      kcy: 'к',
      Kfr: '𝔎',
      kfr: '𝔨',
      kgreen: 'ĸ',
      KHcy: 'Х',
      khcy: 'х',
      KJcy: 'Ќ',
      kjcy: 'ќ',
      Kopf: '𝕂',
      kopf: '𝕜',
      Kscr: '𝒦',
      kscr: '𝓀',
      lAarr: '⇚',
      Lacute: 'Ĺ',
      lacute: 'ĺ',
      laemptyv: '⦴',
      lagran: 'ℒ',
      Lambda: 'Λ',
      lambda: 'λ',
      Lang: '⟪',
      lang: '⟨',
      langd: '⦑',
      langle: '⟨',
      lap: '⪅',
      Laplacetrf: 'ℒ',
      laquo: '«',
      Larr: '↞',
      lArr: '⇐',
      larr: '←',
      larrb: '⇤',
      larrbfs: '⤟',
      larrfs: '⤝',
      larrhk: '↩',
      larrlp: '↫',
      larrpl: '⤹',
      larrsim: '⥳',
      larrtl: '↢',
      lat: '⪫',
      lAtail: '⤛',
      latail: '⤙',
      late: '⪭',
      lates: '⪭︀',
      lBarr: '⤎',
      lbarr: '⤌',
      lbbrk: '❲',
      lbrace: '{',
      lbrack: '[',
      lbrke: '⦋',
      lbrksld: '⦏',
      lbrkslu: '⦍',
      Lcaron: 'Ľ',
      lcaron: 'ľ',
      Lcedil: 'Ļ',
      lcedil: 'ļ',
      lceil: '⌈',
      lcub: '{',
      Lcy: 'Л',
      lcy: 'л',
      ldca: '⤶',
      ldquo: '“',
      ldquor: '„',
      ldrdhar: '⥧',
      ldrushar: '⥋',
      ldsh: '↲',
      lE: '≦',
      le: '≤',
      LeftAngleBracket: '⟨',
      LeftArrow: '←',
      Leftarrow: '⇐',
      leftarrow: '←',
      LeftArrowBar: '⇤',
      LeftArrowRightArrow: '⇆',
      leftarrowtail: '↢',
      LeftCeiling: '⌈',
      LeftDoubleBracket: '⟦',
      LeftDownTeeVector: '⥡',
      LeftDownVector: '⇃',
      LeftDownVectorBar: '⥙',
      LeftFloor: '⌊',
      leftharpoondown: '↽',
      leftharpoonup: '↼',
      leftleftarrows: '⇇',
      LeftRightArrow: '↔',
      Leftrightarrow: '⇔',
      leftrightarrow: '↔',
      leftrightarrows: '⇆',
      leftrightharpoons: '⇋',
      leftrightsquigarrow: '↭',
      LeftRightVector: '⥎',
      LeftTee: '⊣',
      LeftTeeArrow: '↤',
      LeftTeeVector: '⥚',
      leftthreetimes: '⋋',
      LeftTriangle: '⊲',
      LeftTriangleBar: '⧏',
      LeftTriangleEqual: '⊴',
      LeftUpDownVector: '⥑',
      LeftUpTeeVector: '⥠',
      LeftUpVector: '↿',
      LeftUpVectorBar: '⥘',
      LeftVector: '↼',
      LeftVectorBar: '⥒',
      lEg: '⪋',
      leg: '⋚',
      leq: '≤',
      leqq: '≦',
      leqslant: '⩽',
      les: '⩽',
      lescc: '⪨',
      lesdot: '⩿',
      lesdoto: '⪁',
      lesdotor: '⪃',
      lesg: '⋚︀',
      lesges: '⪓',
      lessapprox: '⪅',
      lessdot: '⋖',
      lesseqgtr: '⋚',
      lesseqqgtr: '⪋',
      LessEqualGreater: '⋚',
      LessFullEqual: '≦',
      LessGreater: '≶',
      lessgtr: '≶',
      LessLess: '⪡',
      lesssim: '≲',
      LessSlantEqual: '⩽',
      LessTilde: '≲',
      lfisht: '⥼',
      lfloor: '⌊',
      Lfr: '𝔏',
      lfr: '𝔩',
      lg: '≶',
      lgE: '⪑',
      lHar: '⥢',
      lhard: '↽',
      lharu: '↼',
      lharul: '⥪',
      lhblk: '▄',
      LJcy: 'Љ',
      ljcy: 'љ',
      Ll: '⋘',
      ll: '≪',
      llarr: '⇇',
      llcorner: '⌞',
      Lleftarrow: '⇚',
      llhard: '⥫',
      lltri: '◺',
      Lmidot: 'Ŀ',
      lmidot: 'ŀ',
      lmoust: '⎰',
      lmoustache: '⎰',
      lnap: '⪉',
      lnapprox: '⪉',
      lnE: '≨',
      lne: '⪇',
      lneq: '⪇',
      lneqq: '≨',
      lnsim: '⋦',
      loang: '⟬',
      loarr: '⇽',
      lobrk: '⟦',
      LongLeftArrow: '⟵',
      Longleftarrow: '⟸',
      longleftarrow: '⟵',
      LongLeftRightArrow: '⟷',
      Longleftrightarrow: '⟺',
      longleftrightarrow: '⟷',
      longmapsto: '⟼',
      LongRightArrow: '⟶',
      Longrightarrow: '⟹',
      longrightarrow: '⟶',
      looparrowleft: '↫',
      looparrowright: '↬',
      lopar: '⦅',
      Lopf: '𝕃',
      lopf: '𝕝',
      loplus: '⨭',
      lotimes: '⨴',
      lowast: '∗',
      lowbar: '_',
      LowerLeftArrow: '↙',
      LowerRightArrow: '↘',
      loz: '◊',
      lozenge: '◊',
      lozf: '⧫',
      lpar: '(',
      lparlt: '⦓',
      lrarr: '⇆',
      lrcorner: '⌟',
      lrhar: '⇋',
      lrhard: '⥭',
      lrm: '‎',
      lrtri: '⊿',
      lsaquo: '‹',
      Lscr: 'ℒ',
      lscr: '𝓁',
      Lsh: '↰',
      lsh: '↰',
      lsim: '≲',
      lsime: '⪍',
      lsimg: '⪏',
      lsqb: '[',
      lsquo: '‘',
      lsquor: '‚',
      Lstrok: 'Ł',
      lstrok: 'ł',
      LT: '<',
      Lt: '≪',
      lt: '<',
      ltcc: '⪦',
      ltcir: '⩹',
      ltdot: '⋖',
      lthree: '⋋',
      ltimes: '⋉',
      ltlarr: '⥶',
      ltquest: '⩻',
      ltri: '◃',
      ltrie: '⊴',
      ltrif: '◂',
      ltrPar: '⦖',
      lurdshar: '⥊',
      luruhar: '⥦',
      lvertneqq: '≨︀',
      lvnE: '≨︀',
      macr: '¯',
      male: '♂',
      malt: '✠',
      maltese: '✠',
      Map: '⤅',
      map: '↦',
      mapsto: '↦',
      mapstodown: '↧',
      mapstoleft: '↤',
      mapstoup: '↥',
      marker: '▮',
      mcomma: '⨩',
      Mcy: 'М',
      mcy: 'м',
      mdash: '—',
      mDDot: '∺',
      measuredangle: '∡',
      MediumSpace: ' ',
      Mellintrf: 'ℳ',
      Mfr: '𝔐',
      mfr: '𝔪',
      mho: '℧',
      micro: 'µ',
      mid: '∣',
      midast: '*',
      midcir: '⫰',
      middot: '·',
      minus: '−',
      minusb: '⊟',
      minusd: '∸',
      minusdu: '⨪',
      MinusPlus: '∓',
      mlcp: '⫛',
      mldr: '…',
      mnplus: '∓',
      models: '⊧',
      Mopf: '𝕄',
      mopf: '𝕞',
      mp: '∓',
      Mscr: 'ℳ',
      mscr: '𝓂',
      mstpos: '∾',
      Mu: 'Μ',
      mu: 'μ',
      multimap: '⊸',
      mumap: '⊸',
      nabla: '∇',
      Nacute: 'Ń',
      nacute: 'ń',
      nang: '∠⃒',
      nap: '≉',
      napE: '⩰̸',
      napid: '≋̸',
      napos: 'ŉ',
      napprox: '≉',
      natur: '♮',
      natural: '♮',
      naturals: 'ℕ',
      nbsp: ' ',
      nbump: '≎̸',
      nbumpe: '≏̸',
      ncap: '⩃',
      Ncaron: 'Ň',
      ncaron: 'ň',
      Ncedil: 'Ņ',
      ncedil: 'ņ',
      ncong: '≇',
      ncongdot: '⩭̸',
      ncup: '⩂',
      Ncy: 'Н',
      ncy: 'н',
      ndash: '–',
      ne: '≠',
      nearhk: '⤤',
      neArr: '⇗',
      nearr: '↗',
      nearrow: '↗',
      nedot: '≐̸',
      NegativeMediumSpace: '​',
      NegativeThickSpace: '​',
      NegativeThinSpace: '​',
      NegativeVeryThinSpace: '​',
      nequiv: '≢',
      nesear: '⤨',
      nesim: '≂̸',
      NestedGreaterGreater: '≫',
      NestedLessLess: '≪',
      NewLine: '\n',
      nexist: '∄',
      nexists: '∄',
      Nfr: '𝔑',
      nfr: '𝔫',
      ngE: '≧̸',
      nge: '≱',
      ngeq: '≱',
      ngeqq: '≧̸',
      ngeqslant: '⩾̸',
      nges: '⩾̸',
      nGg: '⋙̸',
      ngsim: '≵',
      nGt: '≫⃒',
      ngt: '≯',
      ngtr: '≯',
      nGtv: '≫̸',
      nhArr: '⇎',
      nharr: '↮',
      nhpar: '⫲',
      ni: '∋',
      nis: '⋼',
      nisd: '⋺',
      niv: '∋',
      NJcy: 'Њ',
      njcy: 'њ',
      nlArr: '⇍',
      nlarr: '↚',
      nldr: '‥',
      nlE: '≦̸',
      nle: '≰',
      nLeftarrow: '⇍',
      nleftarrow: '↚',
      nLeftrightarrow: '⇎',
      nleftrightarrow: '↮',
      nleq: '≰',
      nleqq: '≦̸',
      nleqslant: '⩽̸',
      nles: '⩽̸',
      nless: '≮',
      nLl: '⋘̸',
      nlsim: '≴',
      nLt: '≪⃒',
      nlt: '≮',
      nltri: '⋪',
      nltrie: '⋬',
      nLtv: '≪̸',
      nmid: '∤',
      NoBreak: '⁠',
      NonBreakingSpace: ' ',
      Nopf: 'ℕ',
      nopf: '𝕟',
      Not: '⫬',
      not: '¬',
      NotCongruent: '≢',
      NotCupCap: '≭',
      NotDoubleVerticalBar: '∦',
      NotElement: '∉',
      NotEqual: '≠',
      NotEqualTilde: '≂̸',
      NotExists: '∄',
      NotGreater: '≯',
      NotGreaterEqual: '≱',
      NotGreaterFullEqual: '≧̸',
      NotGreaterGreater: '≫̸',
      NotGreaterLess: '≹',
      NotGreaterSlantEqual: '⩾̸',
      NotGreaterTilde: '≵',
      NotHumpDownHump: '≎̸',
      NotHumpEqual: '≏̸',
      notin: '∉',
      notindot: '⋵̸',
      notinE: '⋹̸',
      notinva: '∉',
      notinvb: '⋷',
      notinvc: '⋶',
      NotLeftTriangle: '⋪',
      NotLeftTriangleBar: '⧏̸',
      NotLeftTriangleEqual: '⋬',
      NotLess: '≮',
      NotLessEqual: '≰',
      NotLessGreater: '≸',
      NotLessLess: '≪̸',
      NotLessSlantEqual: '⩽̸',
      NotLessTilde: '≴',
      NotNestedGreaterGreater: '⪢̸',
      NotNestedLessLess: '⪡̸',
      notni: '∌',
      notniva: '∌',
      notnivb: '⋾',
      notnivc: '⋽',
      NotPrecedes: '⊀',
      NotPrecedesEqual: '⪯̸',
      NotPrecedesSlantEqual: '⋠',
      NotReverseElement: '∌',
      NotRightTriangle: '⋫',
      NotRightTriangleBar: '⧐̸',
      NotRightTriangleEqual: '⋭',
      NotSquareSubset: '⊏̸',
      NotSquareSubsetEqual: '⋢',
      NotSquareSuperset: '⊐̸',
      NotSquareSupersetEqual: '⋣',
      NotSubset: '⊂⃒',
      NotSubsetEqual: '⊈',
      NotSucceeds: '⊁',
      NotSucceedsEqual: '⪰̸',
      NotSucceedsSlantEqual: '⋡',
      NotSucceedsTilde: '≿̸',
      NotSuperset: '⊃⃒',
      NotSupersetEqual: '⊉',
      NotTilde: '≁',
      NotTildeEqual: '≄',
      NotTildeFullEqual: '≇',
      NotTildeTilde: '≉',
      NotVerticalBar: '∤',
      npar: '∦',
      nparallel: '∦',
      nparsl: '⫽⃥',
      npart: '∂̸',
      npolint: '⨔',
      npr: '⊀',
      nprcue: '⋠',
      npre: '⪯̸',
      nprec: '⊀',
      npreceq: '⪯̸',
      nrArr: '⇏',
      nrarr: '↛',
      nrarrc: '⤳̸',
      nrarrw: '↝̸',
      nRightarrow: '⇏',
      nrightarrow: '↛',
      nrtri: '⋫',
      nrtrie: '⋭',
      nsc: '⊁',
      nsccue: '⋡',
      nsce: '⪰̸',
      Nscr: '𝒩',
      nscr: '𝓃',
      nshortmid: '∤',
      nshortparallel: '∦',
      nsim: '≁',
      nsime: '≄',
      nsimeq: '≄',
      nsmid: '∤',
      nspar: '∦',
      nsqsube: '⋢',
      nsqsupe: '⋣',
      nsub: '⊄',
      nsubE: '⫅̸',
      nsube: '⊈',
      nsubset: '⊂⃒',
      nsubseteq: '⊈',
      nsubseteqq: '⫅̸',
      nsucc: '⊁',
      nsucceq: '⪰̸',
      nsup: '⊅',
      nsupE: '⫆̸',
      nsupe: '⊉',
      nsupset: '⊃⃒',
      nsupseteq: '⊉',
      nsupseteqq: '⫆̸',
      ntgl: '≹',
      Ntilde: 'Ñ',
      ntilde: 'ñ',
      ntlg: '≸',
      ntriangleleft: '⋪',
      ntrianglelefteq: '⋬',
      ntriangleright: '⋫',
      ntrianglerighteq: '⋭',
      Nu: 'Ν',
      nu: 'ν',
      num: '#',
      numero: '№',
      numsp: ' ',
      nvap: '≍⃒',
      nVDash: '⊯',
      nVdash: '⊮',
      nvDash: '⊭',
      nvdash: '⊬',
      nvge: '≥⃒',
      nvgt: '>⃒',
      nvHarr: '⤄',
      nvinfin: '⧞',
      nvlArr: '⤂',
      nvle: '≤⃒',
      nvlt: '<⃒',
      nvltrie: '⊴⃒',
      nvrArr: '⤃',
      nvrtrie: '⊵⃒',
      nvsim: '∼⃒',
      nwarhk: '⤣',
      nwArr: '⇖',
      nwarr: '↖',
      nwarrow: '↖',
      nwnear: '⤧',
      Oacute: 'Ó',
      oacute: 'ó',
      oast: '⊛',
      ocir: '⊚',
      Ocirc: 'Ô',
      ocirc: 'ô',
      Ocy: 'О',
      ocy: 'о',
      odash: '⊝',
      Odblac: 'Ő',
      odblac: 'ő',
      odiv: '⨸',
      odot: '⊙',
      odsold: '⦼',
      OElig: 'Œ',
      oelig: 'œ',
      ofcir: '⦿',
      Ofr: '𝔒',
      ofr: '𝔬',
      ogon: '˛',
      Ograve: 'Ò',
      ograve: 'ò',
      ogt: '⧁',
      ohbar: '⦵',
      ohm: 'Ω',
      oint: '∮',
      olarr: '↺',
      olcir: '⦾',
      olcross: '⦻',
      oline: '‾',
      olt: '⧀',
      Omacr: 'Ō',
      omacr: 'ō',
      Omega: 'Ω',
      omega: 'ω',
      Omicron: 'Ο',
      omicron: 'ο',
      omid: '⦶',
      ominus: '⊖',
      Oopf: '𝕆',
      oopf: '𝕠',
      opar: '⦷',
      OpenCurlyDoubleQuote: '“',
      OpenCurlyQuote: '‘',
      operp: '⦹',
      oplus: '⊕',
      Or: '⩔',
      or: '∨',
      orarr: '↻',
      ord: '⩝',
      order: 'ℴ',
      orderof: 'ℴ',
      ordf: 'ª',
      ordm: 'º',
      origof: '⊶',
      oror: '⩖',
      orslope: '⩗',
      orv: '⩛',
      oS: 'Ⓢ',
      Oscr: '𝒪',
      oscr: 'ℴ',
      Oslash: 'Ø',
      oslash: 'ø',
      osol: '⊘',
      Otilde: 'Õ',
      otilde: 'õ',
      Otimes: '⨷',
      otimes: '⊗',
      otimesas: '⨶',
      Ouml: 'Ö',
      ouml: 'ö',
      ovbar: '⌽',
      OverBar: '‾',
      OverBrace: '⏞',
      OverBracket: '⎴',
      OverParenthesis: '⏜',
      par: '∥',
      para: '¶',
      parallel: '∥',
      parsim: '⫳',
      parsl: '⫽',
      part: '∂',
      PartialD: '∂',
      Pcy: 'П',
      pcy: 'п',
      percnt: '%',
      period: '.',
      permil: '‰',
      perp: '⊥',
      pertenk: '‱',
      Pfr: '𝔓',
      pfr: '𝔭',
      Phi: 'Φ',
      phi: 'φ',
      phiv: 'ϕ',
      phmmat: 'ℳ',
      phone: '☎',
      Pi: 'Π',
      pi: 'π',
      pitchfork: '⋔',
      piv: 'ϖ',
      planck: 'ℏ',
      planckh: 'ℎ',
      plankv: 'ℏ',
      plus: '+',
      plusacir: '⨣',
      plusb: '⊞',
      pluscir: '⨢',
      plusdo: '∔',
      plusdu: '⨥',
      pluse: '⩲',
      PlusMinus: '±',
      plusmn: '±',
      plussim: '⨦',
      plustwo: '⨧',
      pm: '±',
      Poincareplane: 'ℌ',
      pointint: '⨕',
      Popf: 'ℙ',
      popf: '𝕡',
      pound: '£',
      Pr: '⪻',
      pr: '≺',
      prap: '⪷',
      prcue: '≼',
      prE: '⪳',
      pre: '⪯',
      prec: '≺',
      precapprox: '⪷',
      preccurlyeq: '≼',
      Precedes: '≺',
      PrecedesEqual: '⪯',
      PrecedesSlantEqual: '≼',
      PrecedesTilde: '≾',
      preceq: '⪯',
      precnapprox: '⪹',
      precneqq: '⪵',
      precnsim: '⋨',
      precsim: '≾',
      Prime: '″',
      prime: '′',
      primes: 'ℙ',
      prnap: '⪹',
      prnE: '⪵',
      prnsim: '⋨',
      prod: '∏',
      Product: '∏',
      profalar: '⌮',
      profline: '⌒',
      profsurf: '⌓',
      prop: '∝',
      Proportion: '∷',
      Proportional: '∝',
      propto: '∝',
      prsim: '≾',
      prurel: '⊰',
      Pscr: '𝒫',
      pscr: '𝓅',
      Psi: 'Ψ',
      psi: 'ψ',
      puncsp: ' ',
      Qfr: '𝔔',
      qfr: '𝔮',
      qint: '⨌',
      Qopf: 'ℚ',
      qopf: '𝕢',
      qprime: '⁗',
      Qscr: '𝒬',
      qscr: '𝓆',
      quaternions: 'ℍ',
      quatint: '⨖',
      quest: '?',
      questeq: '≟',
      QUOT: '"',
      quot: '"',
      rAarr: '⇛',
      race: '∽̱',
      Racute: 'Ŕ',
      racute: 'ŕ',
      radic: '√',
      raemptyv: '⦳',
      Rang: '⟫',
      rang: '⟩',
      rangd: '⦒',
      range: '⦥',
      rangle: '⟩',
      raquo: '»',
      Rarr: '↠',
      rArr: '⇒',
      rarr: '→',
      rarrap: '⥵',
      rarrb: '⇥',
      rarrbfs: '⤠',
      rarrc: '⤳',
      rarrfs: '⤞',
      rarrhk: '↪',
      rarrlp: '↬',
      rarrpl: '⥅',
      rarrsim: '⥴',
      Rarrtl: '⤖',
      rarrtl: '↣',
      rarrw: '↝',
      rAtail: '⤜',
      ratail: '⤚',
      ratio: '∶',
      rationals: 'ℚ',
      RBarr: '⤐',
      rBarr: '⤏',
      rbarr: '⤍',
      rbbrk: '❳',
      rbrace: '}',
      rbrack: ']',
      rbrke: '⦌',
      rbrksld: '⦎',
      rbrkslu: '⦐',
      Rcaron: 'Ř',
      rcaron: 'ř',
      Rcedil: 'Ŗ',
      rcedil: 'ŗ',
      rceil: '⌉',
      rcub: '}',
      Rcy: 'Р',
      rcy: 'р',
      rdca: '⤷',
      rdldhar: '⥩',
      rdquo: '”',
      rdquor: '”',
      rdsh: '↳',
      Re: 'ℜ',
      real: 'ℜ',
      realine: 'ℛ',
      realpart: 'ℜ',
      reals: 'ℝ',
      rect: '▭',
      REG: '®',
      reg: '®',
      ReverseElement: '∋',
      ReverseEquilibrium: '⇋',
      ReverseUpEquilibrium: '⥯',
      rfisht: '⥽',
      rfloor: '⌋',
      Rfr: 'ℜ',
      rfr: '𝔯',
      rHar: '⥤',
      rhard: '⇁',
      rharu: '⇀',
      rharul: '⥬',
      Rho: 'Ρ',
      rho: 'ρ',
      rhov: 'ϱ',
      RightAngleBracket: '⟩',
      RightArrow: '→',
      Rightarrow: '⇒',
      rightarrow: '→',
      RightArrowBar: '⇥',
      RightArrowLeftArrow: '⇄',
      rightarrowtail: '↣',
      RightCeiling: '⌉',
      RightDoubleBracket: '⟧',
      RightDownTeeVector: '⥝',
      RightDownVector: '⇂',
      RightDownVectorBar: '⥕',
      RightFloor: '⌋',
      rightharpoondown: '⇁',
      rightharpoonup: '⇀',
      rightleftarrows: '⇄',
      rightleftharpoons: '⇌',
      rightrightarrows: '⇉',
      rightsquigarrow: '↝',
      RightTee: '⊢',
      RightTeeArrow: '↦',
      RightTeeVector: '⥛',
      rightthreetimes: '⋌',
      RightTriangle: '⊳',
      RightTriangleBar: '⧐',
      RightTriangleEqual: '⊵',
      RightUpDownVector: '⥏',
      RightUpTeeVector: '⥜',
      RightUpVector: '↾',
      RightUpVectorBar: '⥔',
      RightVector: '⇀',
      RightVectorBar: '⥓',
      ring: '˚',
      risingdotseq: '≓',
      rlarr: '⇄',
      rlhar: '⇌',
      rlm: '‏',
      rmoust: '⎱',
      rmoustache: '⎱',
      rnmid: '⫮',
      roang: '⟭',
      roarr: '⇾',
      robrk: '⟧',
      ropar: '⦆',
      Ropf: 'ℝ',
      ropf: '𝕣',
      roplus: '⨮',
      rotimes: '⨵',
      RoundImplies: '⥰',
      rpar: ')',
      rpargt: '⦔',
      rppolint: '⨒',
      rrarr: '⇉',
      Rrightarrow: '⇛',
      rsaquo: '›',
      Rscr: 'ℛ',
      rscr: '𝓇',
      Rsh: '↱',
      rsh: '↱',
      rsqb: ']',
      rsquo: '’',
      rsquor: '’',
      rthree: '⋌',
      rtimes: '⋊',
      rtri: '▹',
      rtrie: '⊵',
      rtrif: '▸',
      rtriltri: '⧎',
      RuleDelayed: '⧴',
      ruluhar: '⥨',
      rx: '℞',
      Sacute: 'Ś',
      sacute: 'ś',
      sbquo: '‚',
      Sc: '⪼',
      sc: '≻',
      scap: '⪸',
      Scaron: 'Š',
      scaron: 'š',
      sccue: '≽',
      scE: '⪴',
      sce: '⪰',
      Scedil: 'Ş',
      scedil: 'ş',
      Scirc: 'Ŝ',
      scirc: 'ŝ',
      scnap: '⪺',
      scnE: '⪶',
      scnsim: '⋩',
      scpolint: '⨓',
      scsim: '≿',
      Scy: 'С',
      scy: 'с',
      sdot: '⋅',
      sdotb: '⊡',
      sdote: '⩦',
      searhk: '⤥',
      seArr: '⇘',
      searr: '↘',
      searrow: '↘',
      sect: '§',
      semi: ';',
      seswar: '⤩',
      setminus: '∖',
      setmn: '∖',
      sext: '✶',
      Sfr: '𝔖',
      sfr: '𝔰',
      sfrown: '⌢',
      sharp: '♯',
      SHCHcy: 'Щ',
      shchcy: 'щ',
      SHcy: 'Ш',
      shcy: 'ш',
      ShortDownArrow: '↓',
      ShortLeftArrow: '←',
      shortmid: '∣',
      shortparallel: '∥',
      ShortRightArrow: '→',
      ShortUpArrow: '↑',
      shy: '­',
      Sigma: 'Σ',
      sigma: 'σ',
      sigmaf: 'ς',
      sigmav: 'ς',
      sim: '∼',
      simdot: '⩪',
      sime: '≃',
      simeq: '≃',
      simg: '⪞',
      simgE: '⪠',
      siml: '⪝',
      simlE: '⪟',
      simne: '≆',
      simplus: '⨤',
      simrarr: '⥲',
      slarr: '←',
      SmallCircle: '∘',
      smallsetminus: '∖',
      smashp: '⨳',
      smeparsl: '⧤',
      smid: '∣',
      smile: '⌣',
      smt: '⪪',
      smte: '⪬',
      smtes: '⪬︀',
      SOFTcy: 'Ь',
      softcy: 'ь',
      sol: '/',
      solb: '⧄',
      solbar: '⌿',
      Sopf: '𝕊',
      sopf: '𝕤',
      spades: '♠',
      spadesuit: '♠',
      spar: '∥',
      sqcap: '⊓',
      sqcaps: '⊓︀',
      sqcup: '⊔',
      sqcups: '⊔︀',
      Sqrt: '√',
      sqsub: '⊏',
      sqsube: '⊑',
      sqsubset: '⊏',
      sqsubseteq: '⊑',
      sqsup: '⊐',
      sqsupe: '⊒',
      sqsupset: '⊐',
      sqsupseteq: '⊒',
      squ: '□',
      Square: '□',
      square: '□',
      SquareIntersection: '⊓',
      SquareSubset: '⊏',
      SquareSubsetEqual: '⊑',
      SquareSuperset: '⊐',
      SquareSupersetEqual: '⊒',
      SquareUnion: '⊔',
      squarf: '▪',
      squf: '▪',
      srarr: '→',
      Sscr: '𝒮',
      sscr: '𝓈',
      ssetmn: '∖',
      ssmile: '⌣',
      sstarf: '⋆',
      Star: '⋆',
      star: '☆',
      starf: '★',
      straightepsilon: 'ϵ',
      straightphi: 'ϕ',
      strns: '¯',
      Sub: '⋐',
      sub: '⊂',
      subdot: '⪽',
      subE: '⫅',
      sube: '⊆',
      subedot: '⫃',
      submult: '⫁',
      subnE: '⫋',
      subne: '⊊',
      subplus: '⪿',
      subrarr: '⥹',
      Subset: '⋐',
      subset: '⊂',
      subseteq: '⊆',
      subseteqq: '⫅',
      SubsetEqual: '⊆',
      subsetneq: '⊊',
      subsetneqq: '⫋',
      subsim: '⫇',
      subsub: '⫕',
      subsup: '⫓',
      succ: '≻',
      succapprox: '⪸',
      succcurlyeq: '≽',
      Succeeds: '≻',
      SucceedsEqual: '⪰',
      SucceedsSlantEqual: '≽',
      SucceedsTilde: '≿',
      succeq: '⪰',
      succnapprox: '⪺',
      succneqq: '⪶',
      succnsim: '⋩',
      succsim: '≿',
      SuchThat: '∋',
      Sum: '∑',
      sum: '∑',
      sung: '♪',
      Sup: '⋑',
      sup: '⊃',
      sup1: '¹',
      sup2: '²',
      sup3: '³',
      supdot: '⪾',
      supdsub: '⫘',
      supE: '⫆',
      supe: '⊇',
      supedot: '⫄',
      Superset: '⊃',
      SupersetEqual: '⊇',
      suphsol: '⟉',
      suphsub: '⫗',
      suplarr: '⥻',
      supmult: '⫂',
      supnE: '⫌',
      supne: '⊋',
      supplus: '⫀',
      Supset: '⋑',
      supset: '⊃',
      supseteq: '⊇',
      supseteqq: '⫆',
      supsetneq: '⊋',
      supsetneqq: '⫌',
      supsim: '⫈',
      supsub: '⫔',
      supsup: '⫖',
      swarhk: '⤦',
      swArr: '⇙',
      swarr: '↙',
      swarrow: '↙',
      swnwar: '⤪',
      szlig: 'ß',
      Tab: '\t',
      target: '⌖',
      Tau: 'Τ',
      tau: 'τ',
      tbrk: '⎴',
      Tcaron: 'Ť',
      tcaron: 'ť',
      Tcedil: 'Ţ',
      tcedil: 'ţ',
      Tcy: 'Т',
      tcy: 'т',
      tdot: '⃛',
      telrec: '⌕',
      Tfr: '𝔗',
      tfr: '𝔱',
      there4: '∴',
      Therefore: '∴',
      therefore: '∴',
      Theta: 'Θ',
      theta: 'θ',
      thetasym: 'ϑ',
      thetav: 'ϑ',
      thickapprox: '≈',
      thicksim: '∼',
      ThickSpace: '  ',
      thinsp: ' ',
      ThinSpace: ' ',
      thkap: '≈',
      thksim: '∼',
      THORN: 'Þ',
      thorn: 'þ',
      Tilde: '∼',
      tilde: '˜',
      TildeEqual: '≃',
      TildeFullEqual: '≅',
      TildeTilde: '≈',
      times: '×',
      timesb: '⊠',
      timesbar: '⨱',
      timesd: '⨰',
      tint: '∭',
      toea: '⤨',
      top: '⊤',
      topbot: '⌶',
      topcir: '⫱',
      Topf: '𝕋',
      topf: '𝕥',
      topfork: '⫚',
      tosa: '⤩',
      tprime: '‴',
      TRADE: '™',
      trade: '™',
      triangle: '▵',
      triangledown: '▿',
      triangleleft: '◃',
      trianglelefteq: '⊴',
      triangleq: '≜',
      triangleright: '▹',
      trianglerighteq: '⊵',
      tridot: '◬',
      trie: '≜',
      triminus: '⨺',
      TripleDot: '⃛',
      triplus: '⨹',
      trisb: '⧍',
      tritime: '⨻',
      trpezium: '⏢',
      Tscr: '𝒯',
      tscr: '𝓉',
      TScy: 'Ц',
      tscy: 'ц',
      TSHcy: 'Ћ',
      tshcy: 'ћ',
      Tstrok: 'Ŧ',
      tstrok: 'ŧ',
      twixt: '≬',
      twoheadleftarrow: '↞',
      twoheadrightarrow: '↠',
      Uacute: 'Ú',
      uacute: 'ú',
      Uarr: '↟',
      uArr: '⇑',
      uarr: '↑',
      Uarrocir: '⥉',
      Ubrcy: 'Ў',
      ubrcy: 'ў',
      Ubreve: 'Ŭ',
      ubreve: 'ŭ',
      Ucirc: 'Û',
      ucirc: 'û',
      Ucy: 'У',
      ucy: 'у',
      udarr: '⇅',
      Udblac: 'Ű',
      udblac: 'ű',
      udhar: '⥮',
      ufisht: '⥾',
      Ufr: '𝔘',
      ufr: '𝔲',
      Ugrave: 'Ù',
      ugrave: 'ù',
      uHar: '⥣',
      uharl: '↿',
      uharr: '↾',
      uhblk: '▀',
      ulcorn: '⌜',
      ulcorner: '⌜',
      ulcrop: '⌏',
      ultri: '◸',
      Umacr: 'Ū',
      umacr: 'ū',
      uml: '¨',
      UnderBar: '_',
      UnderBrace: '⏟',
      UnderBracket: '⎵',
      UnderParenthesis: '⏝',
      Union: '⋃',
      UnionPlus: '⊎',
      Uogon: 'Ų',
      uogon: 'ų',
      Uopf: '𝕌',
      uopf: '𝕦',
      UpArrow: '↑',
      Uparrow: '⇑',
      uparrow: '↑',
      UpArrowBar: '⤒',
      UpArrowDownArrow: '⇅',
      UpDownArrow: '↕',
      Updownarrow: '⇕',
      updownarrow: '↕',
      UpEquilibrium: '⥮',
      upharpoonleft: '↿',
      upharpoonright: '↾',
      uplus: '⊎',
      UpperLeftArrow: '↖',
      UpperRightArrow: '↗',
      Upsi: 'ϒ',
      upsi: 'υ',
      upsih: 'ϒ',
      Upsilon: 'Υ',
      upsilon: 'υ',
      UpTee: '⊥',
      UpTeeArrow: '↥',
      upuparrows: '⇈',
      urcorn: '⌝',
      urcorner: '⌝',
      urcrop: '⌎',
      Uring: 'Ů',
      uring: 'ů',
      urtri: '◹',
      Uscr: '𝒰',
      uscr: '𝓊',
      utdot: '⋰',
      Utilde: 'Ũ',
      utilde: 'ũ',
      utri: '▵',
      utrif: '▴',
      uuarr: '⇈',
      Uuml: 'Ü',
      uuml: 'ü',
      uwangle: '⦧',
      vangrt: '⦜',
      varepsilon: 'ϵ',
      varkappa: 'ϰ',
      varnothing: '∅',
      varphi: 'ϕ',
      varpi: 'ϖ',
      varpropto: '∝',
      vArr: '⇕',
      varr: '↕',
      varrho: 'ϱ',
      varsigma: 'ς',
      varsubsetneq: '⊊︀',
      varsubsetneqq: '⫋︀',
      varsupsetneq: '⊋︀',
      varsupsetneqq: '⫌︀',
      vartheta: 'ϑ',
      vartriangleleft: '⊲',
      vartriangleright: '⊳',
      Vbar: '⫫',
      vBar: '⫨',
      vBarv: '⫩',
      Vcy: 'В',
      vcy: 'в',
      VDash: '⊫',
      Vdash: '⊩',
      vDash: '⊨',
      vdash: '⊢',
      Vdashl: '⫦',
      Vee: '⋁',
      vee: '∨',
      veebar: '⊻',
      veeeq: '≚',
      vellip: '⋮',
      Verbar: '‖',
      verbar: '|',
      Vert: '‖',
      vert: '|',
      VerticalBar: '∣',
      VerticalLine: '|',
      VerticalSeparator: '❘',
      VerticalTilde: '≀',
      VeryThinSpace: ' ',
      Vfr: '𝔙',
      vfr: '𝔳',
      vltri: '⊲',
      vnsub: '⊂⃒',
      vnsup: '⊃⃒',
      Vopf: '𝕍',
      vopf: '𝕧',
      vprop: '∝',
      vrtri: '⊳',
      Vscr: '𝒱',
      vscr: '𝓋',
      vsubnE: '⫋︀',
      vsubne: '⊊︀',
      vsupnE: '⫌︀',
      vsupne: '⊋︀',
      Vvdash: '⊪',
      vzigzag: '⦚',
      Wcirc: 'Ŵ',
      wcirc: 'ŵ',
      wedbar: '⩟',
      Wedge: '⋀',
      wedge: '∧',
      wedgeq: '≙',
      weierp: '℘',
      Wfr: '𝔚',
      wfr: '𝔴',
      Wopf: '𝕎',
      wopf: '𝕨',
      wp: '℘',
      wr: '≀',
      wreath: '≀',
      Wscr: '𝒲',
      wscr: '𝓌',
      xcap: '⋂',
      xcirc: '◯',
      xcup: '⋃',
      xdtri: '▽',
      Xfr: '𝔛',
      xfr: '𝔵',
      xhArr: '⟺',
      xharr: '⟷',
      Xi: 'Ξ',
      xi: 'ξ',
      xlArr: '⟸',
      xlarr: '⟵',
      xmap: '⟼',
      xnis: '⋻',
      xodot: '⨀',
      Xopf: '𝕏',
      xopf: '𝕩',
      xoplus: '⨁',
      xotime: '⨂',
      xrArr: '⟹',
      xrarr: '⟶',
      Xscr: '𝒳',
      xscr: '𝓍',
      xsqcup: '⨆',
      xuplus: '⨄',
      xutri: '△',
      xvee: '⋁',
      xwedge: '⋀',
      Yacute: 'Ý',
      yacute: 'ý',
      YAcy: 'Я',
      yacy: 'я',
      Ycirc: 'Ŷ',
      ycirc: 'ŷ',
      Ycy: 'Ы',
      ycy: 'ы',
      yen: '¥',
      Yfr: '𝔜',
      yfr: '𝔶',
      YIcy: 'Ї',
      yicy: 'ї',
      Yopf: '𝕐',
      yopf: '𝕪',
      Yscr: '𝒴',
      yscr: '𝓎',
      YUcy: 'Ю',
      yucy: 'ю',
      Yuml: 'Ÿ',
      yuml: 'ÿ',
      Zacute: 'Ź',
      zacute: 'ź',
      Zcaron: 'Ž',
      zcaron: 'ž',
      Zcy: 'З',
      zcy: 'з',
      Zdot: 'Ż',
      zdot: 'ż',
      zeetrf: 'ℨ',
      ZeroWidthSpace: '​',
      Zeta: 'Ζ',
      zeta: 'ζ',
      Zfr: 'ℨ',
      zfr: '𝔷',
      ZHcy: 'Ж',
      zhcy: 'ж',
      zigrarr: '⇝',
      Zopf: 'ℤ',
      zopf: '𝕫',
      Zscr: '𝒵',
      zscr: '𝓏',
      zwj: '‍',
      zwnj: '‌'
    },
    gr = Object.prototype.hasOwnProperty;
  function fr(t) {
    return (i = t), (e = mr) && gr.call(e, i) ? mr[t] : t;
    var e, i;
  }
  var vr = Object.prototype.hasOwnProperty;
  function br(t) {
    return (
      [].slice.call(arguments, 1).forEach(function(e) {
        if (e) {
          if ('object' != typeof e) throw new TypeError(e + 'must be object');
          Object.keys(e).forEach(function(i) {
            t[i] = e[i];
          });
        }
      }),
      t
    );
  }
  var yr = /\\([\\!"#$%&'()*+,.\/:;<=>?@[\]^_`{|}~-])/g;
  function _r(t) {
    return t.indexOf('\\') < 0 ? t : t.replace(yr, '$1');
  }
  function xr(t) {
    return (
      !(t >= 55296 && t <= 57343) &&
      (!(t >= 64976 && t <= 65007) &&
        (!!(65535 & ~t && 65534 != (65535 & t)) &&
          (!(t >= 0 && t <= 8) &&
            (11 !== t && (!(t >= 14 && t <= 31) && (!(t >= 127 && t <= 159) && !(t > 1114111)))))))
    );
  }
  function wr(t) {
    if (t > 65535) {
      var e = 55296 + ((t -= 65536) >> 10),
        i = 56320 + (1023 & t);
      return String.fromCharCode(e, i);
    }
    return String.fromCharCode(t);
  }
  var kr = /&([a-z#][a-z0-9]{1,31});/gi,
    Ar = /^#((?:x[a-f0-9]{1,8}|[0-9]{1,8}))/i;
  function Cr(t, e) {
    var i = 0,
      o = fr(e);
    return e !== o
      ? o
      : 35 === e.charCodeAt(0) &&
        Ar.test(e) &&
        xr((i = 'x' === e[1].toLowerCase() ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)))
      ? wr(i)
      : t;
  }
  function Sr(t) {
    return t.indexOf('&') < 0 ? t : t.replace(kr, Cr);
  }
  var Er = /[&<>"]/,
    Tr = /[&<>"]/g,
    $r = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
  function Or(t) {
    return $r[t];
  }
  function Mr(t) {
    return Er.test(t) ? t.replace(Tr, Or) : t;
  }
  var Lr = {};
  function zr(t, e) {
    return ++e >= t.length - 2
      ? e
      : 'paragraph_open' === t[e].type &&
        t[e].tight &&
        'inline' === t[e + 1].type &&
        0 === t[e + 1].content.length &&
        'paragraph_close' === t[e + 2].type &&
        t[e + 2].tight
      ? zr(t, e + 2)
      : e;
  }
  (Lr.blockquote_open = function() {
    return '<blockquote>\n';
  }),
    (Lr.blockquote_close = function(t, e) {
      return '</blockquote>' + Pr(t, e);
    }),
    (Lr.code = function(t, e) {
      return t[e].block
        ? '<pre><code>' + Mr(t[e].content) + '</code></pre>' + Pr(t, e)
        : '<code>' + Mr(t[e].content) + '</code>';
    }),
    (Lr.fence = function(t, e, i, o, n) {
      var s,
        r,
        a,
        l,
        h = t[e],
        c = '',
        d = i.langPrefix;
      if (h.params) {
        if (
          ((r = (s = h.params.split(/\s+/g)).join(' ')),
          (a = n.rules.fence_custom),
          (l = s[0]),
          a && vr.call(a, l))
        )
          return n.rules.fence_custom[s[0]](t, e, i, o, n);
        c = ' class="' + d + Mr(Sr(_r(r))) + '"';
      }
      return (
        '<pre><code' +
        c +
        '>' +
        ((i.highlight && i.highlight.apply(i.highlight, [h.content].concat(s))) || Mr(h.content)) +
        '</code></pre>' +
        Pr(t, e)
      );
    }),
    (Lr.fence_custom = {}),
    (Lr.heading_open = function(t, e) {
      return '<h' + t[e].hLevel + '>';
    }),
    (Lr.heading_close = function(t, e) {
      return '</h' + t[e].hLevel + '>\n';
    }),
    (Lr.hr = function(t, e, i) {
      return (i.xhtmlOut ? '<hr />' : '<hr>') + Pr(t, e);
    }),
    (Lr.bullet_list_open = function() {
      return '<ul>\n';
    }),
    (Lr.bullet_list_close = function(t, e) {
      return '</ul>' + Pr(t, e);
    }),
    (Lr.list_item_open = function() {
      return '<li>';
    }),
    (Lr.list_item_close = function() {
      return '</li>\n';
    }),
    (Lr.ordered_list_open = function(t, e) {
      var i = t[e];
      return '<ol' + (i.order > 1 ? ' start="' + i.order + '"' : '') + '>\n';
    }),
    (Lr.ordered_list_close = function(t, e) {
      return '</ol>' + Pr(t, e);
    }),
    (Lr.paragraph_open = function(t, e) {
      return t[e].tight ? '' : '<p>';
    }),
    (Lr.paragraph_close = function(t, e) {
      var i = !(t[e].tight && e && 'inline' === t[e - 1].type && !t[e - 1].content);
      return (t[e].tight ? '' : '</p>') + (i ? Pr(t, e) : '');
    }),
    (Lr.link_open = function(t, e, i) {
      var o = t[e].title ? ' title="' + Mr(Sr(t[e].title)) + '"' : '',
        n = i.linkTarget ? ' target="' + i.linkTarget + '"' : '';
      return '<a href="' + Mr(t[e].href) + '"' + o + n + '>';
    }),
    (Lr.link_close = function() {
      return '</a>';
    }),
    (Lr.image = function(t, e, i) {
      var o = ' src="' + Mr(t[e].src) + '"',
        n = t[e].title ? ' title="' + Mr(Sr(t[e].title)) + '"' : '';
      return (
        '<img' +
        o +
        (' alt="' + (t[e].alt ? Mr(Sr(_r(t[e].alt))) : '') + '"') +
        n +
        (i.xhtmlOut ? ' /' : '') +
        '>'
      );
    }),
    (Lr.table_open = function() {
      return '<table>\n';
    }),
    (Lr.table_close = function() {
      return '</table>\n';
    }),
    (Lr.thead_open = function() {
      return '<thead>\n';
    }),
    (Lr.thead_close = function() {
      return '</thead>\n';
    }),
    (Lr.tbody_open = function() {
      return '<tbody>\n';
    }),
    (Lr.tbody_close = function() {
      return '</tbody>\n';
    }),
    (Lr.tr_open = function() {
      return '<tr>';
    }),
    (Lr.tr_close = function() {
      return '</tr>\n';
    }),
    (Lr.th_open = function(t, e) {
      var i = t[e];
      return '<th' + (i.align ? ' style="text-align:' + i.align + '"' : '') + '>';
    }),
    (Lr.th_close = function() {
      return '</th>';
    }),
    (Lr.td_open = function(t, e) {
      var i = t[e];
      return '<td' + (i.align ? ' style="text-align:' + i.align + '"' : '') + '>';
    }),
    (Lr.td_close = function() {
      return '</td>';
    }),
    (Lr.strong_open = function() {
      return '<strong>';
    }),
    (Lr.strong_close = function() {
      return '</strong>';
    }),
    (Lr.em_open = function() {
      return '<em>';
    }),
    (Lr.em_close = function() {
      return '</em>';
    }),
    (Lr.del_open = function() {
      return '<del>';
    }),
    (Lr.del_close = function() {
      return '</del>';
    }),
    (Lr.ins_open = function() {
      return '<ins>';
    }),
    (Lr.ins_close = function() {
      return '</ins>';
    }),
    (Lr.mark_open = function() {
      return '<mark>';
    }),
    (Lr.mark_close = function() {
      return '</mark>';
    }),
    (Lr.sub = function(t, e) {
      return '<sub>' + Mr(t[e].content) + '</sub>';
    }),
    (Lr.sup = function(t, e) {
      return '<sup>' + Mr(t[e].content) + '</sup>';
    }),
    (Lr.hardbreak = function(t, e, i) {
      return i.xhtmlOut ? '<br />\n' : '<br>\n';
    }),
    (Lr.softbreak = function(t, e, i) {
      return i.breaks ? (i.xhtmlOut ? '<br />\n' : '<br>\n') : '\n';
    }),
    (Lr.text = function(t, e) {
      return Mr(t[e].content);
    }),
    (Lr.htmlblock = function(t, e) {
      return t[e].content;
    }),
    (Lr.htmltag = function(t, e) {
      return t[e].content;
    }),
    (Lr.abbr_open = function(t, e) {
      return '<abbr title="' + Mr(Sr(t[e].title)) + '">';
    }),
    (Lr.abbr_close = function() {
      return '</abbr>';
    }),
    (Lr.footnote_ref = function(t, e) {
      var i = Number(t[e].id + 1).toString(),
        o = 'fnref' + i;
      return (
        t[e].subId > 0 && (o += ':' + t[e].subId),
        '<sup class="footnote-ref"><a href="#fn' + i + '" id="' + o + '">[' + i + ']</a></sup>'
      );
    }),
    (Lr.footnote_block_open = function(t, e, i) {
      return (
        (i.xhtmlOut ? '<hr class="footnotes-sep" />\n' : '<hr class="footnotes-sep">\n') +
        '<section class="footnotes">\n<ol class="footnotes-list">\n'
      );
    }),
    (Lr.footnote_block_close = function() {
      return '</ol>\n</section>\n';
    }),
    (Lr.footnote_open = function(t, e) {
      return '<li id="fn' + Number(t[e].id + 1).toString() + '"  class="footnote-item">';
    }),
    (Lr.footnote_close = function() {
      return '</li>\n';
    }),
    (Lr.footnote_anchor = function(t, e) {
      var i = 'fnref' + Number(t[e].id + 1).toString();
      return (
        t[e].subId > 0 && (i += ':' + t[e].subId),
        ' <a href="#' + i + '" class="footnote-backref">↩</a>'
      );
    }),
    (Lr.dl_open = function() {
      return '<dl>\n';
    }),
    (Lr.dt_open = function() {
      return '<dt>';
    }),
    (Lr.dd_open = function() {
      return '<dd>';
    }),
    (Lr.dl_close = function() {
      return '</dl>\n';
    }),
    (Lr.dt_close = function() {
      return '</dt>\n';
    }),
    (Lr.dd_close = function() {
      return '</dd>\n';
    });
  var Pr = (Lr.getBreak = function(t, e) {
    return (e = zr(t, e)) < t.length && 'list_item_close' === t[e].type ? '' : '\n';
  });
  function Dr() {
    (this.rules = br({}, Lr)), (this.getBreak = Lr.getBreak);
  }
  function Ir() {
    (this.__rules__ = []), (this.__cache__ = null);
  }
  function Nr(t, e, i, o, n) {
    (this.src = t),
      (this.env = o),
      (this.options = i),
      (this.parser = e),
      (this.tokens = n),
      (this.pos = 0),
      (this.posMax = this.src.length),
      (this.level = 0),
      (this.pending = ''),
      (this.pendingLevel = 0),
      (this.cache = []),
      (this.isInLabel = !1),
      (this.linkLevel = 0),
      (this.linkContent = ''),
      (this.labelUnmatchedScopes = 0);
  }
  function Br(t, e) {
    var i,
      o,
      n,
      s = -1,
      r = t.posMax,
      a = t.pos,
      l = t.isInLabel;
    if (t.isInLabel) return -1;
    if (t.labelUnmatchedScopes) return t.labelUnmatchedScopes--, -1;
    for (t.pos = e + 1, t.isInLabel = !0, i = 1; t.pos < r; ) {
      if (91 === (n = t.src.charCodeAt(t.pos))) i++;
      else if (93 === n && 0 === --i) {
        o = !0;
        break;
      }
      t.parser.skipToken(t);
    }
    return (
      o ? ((s = t.pos), (t.labelUnmatchedScopes = 0)) : (t.labelUnmatchedScopes = i - 1),
      (t.pos = a),
      (t.isInLabel = l),
      s
    );
  }
  function Rr(t, e, i, o) {
    var n, s, r, a, l, h;
    if (42 !== t.charCodeAt(0)) return -1;
    if (91 !== t.charCodeAt(1)) return -1;
    if (-1 === t.indexOf(']:')) return -1;
    if ((s = Br((n = new Nr(t, e, i, o, [])), 1)) < 0 || 58 !== t.charCodeAt(s + 1)) return -1;
    for (a = n.posMax, r = s + 2; r < a && 10 !== n.src.charCodeAt(r); r++);
    return (
      (l = t.slice(2, s)),
      0 === (h = t.slice(s + 2, r).trim()).length
        ? -1
        : (o.abbreviations || (o.abbreviations = {}),
          void 0 === o.abbreviations[':' + l] && (o.abbreviations[':' + l] = h),
          r)
    );
  }
  function qr(t) {
    var e = Sr(t);
    try {
      e = decodeURI(e);
    } catch (t) {}
    return encodeURI(e);
  }
  function Ur(t, e) {
    var i,
      o,
      n,
      s = e,
      r = t.posMax;
    if (60 === t.src.charCodeAt(e)) {
      for (e++; e < r; ) {
        if (10 === (i = t.src.charCodeAt(e))) return !1;
        if (62 === i)
          return (
            (n = qr(_r(t.src.slice(s + 1, e)))),
            !!t.parser.validateLink(n) && ((t.pos = e + 1), (t.linkContent = n), !0)
          );
        92 === i && e + 1 < r ? (e += 2) : e++;
      }
      return !1;
    }
    for (o = 0; e < r && 32 !== (i = t.src.charCodeAt(e)) && !(i < 32 || 127 === i); )
      if (92 === i && e + 1 < r) e += 2;
      else {
        if (40 === i && ++o > 1) break;
        if (41 === i && --o < 0) break;
        e++;
      }
    return (
      s !== e &&
      ((n = _r(t.src.slice(s, e))),
      !!t.parser.validateLink(n) && ((t.linkContent = n), (t.pos = e), !0))
    );
  }
  function Fr(t, e) {
    var i,
      o = e,
      n = t.posMax,
      s = t.src.charCodeAt(e);
    if (34 !== s && 39 !== s && 40 !== s) return !1;
    for (e++, 40 === s && (s = 41); e < n; ) {
      if ((i = t.src.charCodeAt(e)) === s)
        return (t.pos = e + 1), (t.linkContent = _r(t.src.slice(o + 1, e))), !0;
      92 === i && e + 1 < n ? (e += 2) : e++;
    }
    return !1;
  }
  function Zr(t) {
    return t
      .trim()
      .replace(/\s+/g, ' ')
      .toUpperCase();
  }
  function jr(t, e, i, o) {
    var n, s, r, a, l, h, c, d, u;
    if (91 !== t.charCodeAt(0)) return -1;
    if (-1 === t.indexOf(']:')) return -1;
    if ((s = Br((n = new Nr(t, e, i, o, [])), 0)) < 0 || 58 !== t.charCodeAt(s + 1)) return -1;
    for (a = n.posMax, r = s + 2; r < a && (32 === (l = n.src.charCodeAt(r)) || 10 === l); r++);
    if (!Ur(n, r)) return -1;
    for (
      c = n.linkContent, h = r = n.pos, r += 1;
      r < a && (32 === (l = n.src.charCodeAt(r)) || 10 === l);
      r++
    );
    for (
      r < a && h !== r && Fr(n, r) ? ((d = n.linkContent), (r = n.pos)) : ((d = ''), (r = h));
      r < a && 32 === n.src.charCodeAt(r);

    )
      r++;
    return r < a && 10 !== n.src.charCodeAt(r)
      ? -1
      : ((u = Zr(t.slice(1, s))),
        void 0 === o.references[u] && (o.references[u] = { title: d, href: c }),
        r);
  }
  (Dr.prototype.renderInline = function(t, e, i) {
    for (var o = this.rules, n = t.length, s = 0, r = ''; n--; )
      r += o[t[s].type](t, s++, e, i, this);
    return r;
  }),
    (Dr.prototype.render = function(t, e, i) {
      for (var o = this.rules, n = t.length, s = -1, r = ''; ++s < n; )
        'inline' === t[s].type
          ? (r += this.renderInline(t[s].children, e, i))
          : (r += o[t[s].type](t, s, e, i, this));
      return r;
    }),
    (Ir.prototype.__find__ = function(t) {
      for (var e = this.__rules__.length, i = -1; e--; )
        if (this.__rules__[++i].name === t) return i;
      return -1;
    }),
    (Ir.prototype.__compile__ = function() {
      var t = this,
        e = [''];
      t.__rules__.forEach(function(t) {
        t.enabled &&
          t.alt.forEach(function(t) {
            e.indexOf(t) < 0 && e.push(t);
          });
      }),
        (t.__cache__ = {}),
        e.forEach(function(e) {
          (t.__cache__[e] = []),
            t.__rules__.forEach(function(i) {
              i.enabled && ((e && i.alt.indexOf(e) < 0) || t.__cache__[e].push(i.fn));
            });
        });
    }),
    (Ir.prototype.at = function(t, e, i) {
      var o = this.__find__(t),
        n = i || {};
      if (-1 === o) throw new Error('Parser rule not found: ' + t);
      (this.__rules__[o].fn = e), (this.__rules__[o].alt = n.alt || []), (this.__cache__ = null);
    }),
    (Ir.prototype.before = function(t, e, i, o) {
      var n = this.__find__(t),
        s = o || {};
      if (-1 === n) throw new Error('Parser rule not found: ' + t);
      this.__rules__.splice(n, 0, { name: e, enabled: !0, fn: i, alt: s.alt || [] }),
        (this.__cache__ = null);
    }),
    (Ir.prototype.after = function(t, e, i, o) {
      var n = this.__find__(t),
        s = o || {};
      if (-1 === n) throw new Error('Parser rule not found: ' + t);
      this.__rules__.splice(n + 1, 0, { name: e, enabled: !0, fn: i, alt: s.alt || [] }),
        (this.__cache__ = null);
    }),
    (Ir.prototype.push = function(t, e, i) {
      var o = i || {};
      this.__rules__.push({ name: t, enabled: !0, fn: e, alt: o.alt || [] }),
        (this.__cache__ = null);
    }),
    (Ir.prototype.enable = function(t, e) {
      (t = Array.isArray(t) ? t : [t]),
        e &&
          this.__rules__.forEach(function(t) {
            t.enabled = !1;
          }),
        t.forEach(function(t) {
          var e = this.__find__(t);
          if (e < 0) throw new Error('Rules manager: invalid rule name ' + t);
          this.__rules__[e].enabled = !0;
        }, this),
        (this.__cache__ = null);
    }),
    (Ir.prototype.disable = function(t) {
      (t = Array.isArray(t) ? t : [t]).forEach(function(t) {
        var e = this.__find__(t);
        if (e < 0) throw new Error('Rules manager: invalid rule name ' + t);
        this.__rules__[e].enabled = !1;
      }, this),
        (this.__cache__ = null);
    }),
    (Ir.prototype.getRules = function(t) {
      return null === this.__cache__ && this.__compile__(), this.__cache__[t] || [];
    }),
    (Nr.prototype.pushPending = function() {
      this.tokens.push({ type: 'text', content: this.pending, level: this.pendingLevel }),
        (this.pending = '');
    }),
    (Nr.prototype.push = function(t) {
      this.pending && this.pushPending(), this.tokens.push(t), (this.pendingLevel = this.level);
    }),
    (Nr.prototype.cacheSet = function(t, e) {
      for (var i = this.cache.length; i <= t; i++) this.cache.push(0);
      this.cache[t] = e;
    }),
    (Nr.prototype.cacheGet = function(t) {
      return t < this.cache.length ? this.cache[t] : 0;
    });
  var Hr = ' \n()[]\'".,!?-';
  function Vr(t) {
    return t.replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, '\\$1');
  }
  var Wr = /\+-|\.\.|\?\?\?\?|!!!!|,,|--/,
    Gr = /\((c|tm|r|p)\)/gi,
    Qr = { c: '©', r: '®', p: '§', tm: '™' };
  var Kr = /['"]/,
    Yr = /['"]/g,
    Jr = /[-\s()\[\]]/;
  function Xr(t, e) {
    return !(e < 0 || e >= t.length) && !Jr.test(t[e]);
  }
  function ta(t, e, i) {
    return t.substr(0, e) + i + t.substr(e + 1);
  }
  var ea = [
    [
      'block',
      function(t) {
        t.inlineMode
          ? t.tokens.push({
              type: 'inline',
              content: t.src.replace(/\n/g, ' ').trim(),
              level: 0,
              lines: [0, 1],
              children: []
            })
          : t.block.parse(t.src, t.options, t.env, t.tokens);
      }
    ],
    [
      'abbr',
      function(t) {
        var e,
          i,
          o,
          n,
          s = t.tokens;
        if (!t.inlineMode)
          for (e = 1, i = s.length - 1; e < i; e++)
            if (
              'paragraph_open' === s[e - 1].type &&
              'inline' === s[e].type &&
              'paragraph_close' === s[e + 1].type
            ) {
              for (o = s[e].content; o.length && !((n = Rr(o, t.inline, t.options, t.env)) < 0); )
                o = o.slice(n).trim();
              (s[e].content = o), o.length || ((s[e - 1].tight = !0), (s[e + 1].tight = !0));
            }
      }
    ],
    [
      'references',
      function(t) {
        var e,
          i,
          o,
          n,
          s = t.tokens;
        if (((t.env.references = t.env.references || {}), !t.inlineMode))
          for (e = 1, i = s.length - 1; e < i; e++)
            if (
              'inline' === s[e].type &&
              'paragraph_open' === s[e - 1].type &&
              'paragraph_close' === s[e + 1].type
            ) {
              for (o = s[e].content; o.length && !((n = jr(o, t.inline, t.options, t.env)) < 0); )
                o = o.slice(n).trim();
              (s[e].content = o), o.length || ((s[e - 1].tight = !0), (s[e + 1].tight = !0));
            }
      }
    ],
    [
      'inline',
      function(t) {
        var e,
          i,
          o,
          n = t.tokens;
        for (i = 0, o = n.length; i < o; i++)
          'inline' === (e = n[i]).type && t.inline.parse(e.content, t.options, t.env, e.children);
      }
    ],
    [
      'footnote_tail',
      function(t) {
        var e,
          i,
          o,
          n,
          s,
          r,
          a,
          l,
          h,
          c = 0,
          d = !1,
          u = {};
        if (
          t.env.footnotes &&
          ((t.tokens = t.tokens.filter(function(t) {
            return 'footnote_reference_open' === t.type
              ? ((d = !0), (l = []), (h = t.label), !1)
              : 'footnote_reference_close' === t.type
              ? ((d = !1), (u[':' + h] = l), !1)
              : (d && l.push(t), !d);
          })),
          t.env.footnotes.list)
        ) {
          for (
            r = t.env.footnotes.list,
              t.tokens.push({ type: 'footnote_block_open', level: c++ }),
              e = 0,
              i = r.length;
            e < i;
            e++
          ) {
            for (
              t.tokens.push({ type: 'footnote_open', id: e, level: c++ }),
                r[e].tokens
                  ? ((a = []).push({ type: 'paragraph_open', tight: !1, level: c++ }),
                    a.push({ type: 'inline', content: '', level: c, children: r[e].tokens }),
                    a.push({ type: 'paragraph_close', tight: !1, level: --c }))
                  : r[e].label && (a = u[':' + r[e].label]),
                t.tokens = t.tokens.concat(a),
                s =
                  'paragraph_close' === t.tokens[t.tokens.length - 1].type ? t.tokens.pop() : null,
                n = r[e].count > 0 ? r[e].count : 1,
                o = 0;
              o < n;
              o++
            )
              t.tokens.push({ type: 'footnote_anchor', id: e, subId: o, level: c });
            s && t.tokens.push(s), t.tokens.push({ type: 'footnote_close', level: --c });
          }
          t.tokens.push({ type: 'footnote_block_close', level: --c });
        }
      }
    ],
    [
      'abbr2',
      function(t) {
        var e,
          i,
          o,
          n,
          s,
          r,
          a,
          l,
          h,
          c,
          d,
          u,
          p = t.tokens;
        if (t.env.abbreviations)
          for (
            t.env.abbrRegExp ||
              ((u =
                '(^|[' +
                Hr.split('')
                  .map(Vr)
                  .join('') +
                '])(' +
                Object.keys(t.env.abbreviations)
                  .map(function(t) {
                    return t.substr(1);
                  })
                  .sort(function(t, e) {
                    return e.length - t.length;
                  })
                  .map(Vr)
                  .join('|') +
                ')($|[' +
                Hr.split('')
                  .map(Vr)
                  .join('') +
                '])'),
              (t.env.abbrRegExp = new RegExp(u, 'g'))),
              c = t.env.abbrRegExp,
              i = 0,
              o = p.length;
            i < o;
            i++
          )
            if ('inline' === p[i].type)
              for (e = (n = p[i].children).length - 1; e >= 0; e--)
                if ('text' === (s = n[e]).type) {
                  for (
                    l = 0, r = s.content, c.lastIndex = 0, h = s.level, a = [];
                    (d = c.exec(r));

                  )
                    c.lastIndex > l &&
                      a.push({
                        type: 'text',
                        content: r.slice(l, d.index + d[1].length),
                        level: h
                      }),
                      a.push({
                        type: 'abbr_open',
                        title: t.env.abbreviations[':' + d[2]],
                        level: h++
                      }),
                      a.push({ type: 'text', content: d[2], level: h }),
                      a.push({ type: 'abbr_close', level: --h }),
                      (l = c.lastIndex - d[3].length);
                  a.length &&
                    (l < r.length && a.push({ type: 'text', content: r.slice(l), level: h }),
                    (p[i].children = n = [].concat(n.slice(0, e), a, n.slice(e + 1))));
                }
      }
    ],
    [
      'replacements',
      function(t) {
        var e, i, o, n, s, r;
        if (t.options.typographer)
          for (s = t.tokens.length - 1; s >= 0; s--)
            if ('inline' === t.tokens[s].type)
              for (e = (n = t.tokens[s].children).length - 1; e >= 0; e--)
                'text' === (i = n[e]).type &&
                  ((o = i.content),
                  (o =
                    (r = o).indexOf('(') < 0
                      ? r
                      : r.replace(Gr, function(t, e) {
                          return Qr[e.toLowerCase()];
                        })),
                  Wr.test(o) &&
                    (o = o
                      .replace(/\+-/g, '±')
                      .replace(/\.{2,}/g, '…')
                      .replace(/([?!])…/g, '$1..')
                      .replace(/([?!]){4,}/g, '$1$1$1')
                      .replace(/,{2,}/g, ',')
                      .replace(/(^|[^-])---([^-]|$)/gm, '$1—$2')
                      .replace(/(^|\s)--(\s|$)/gm, '$1–$2')
                      .replace(/(^|[^-\s])--([^-\s]|$)/gm, '$1–$2')),
                  (i.content = o));
      }
    ],
    [
      'smartquotes',
      function(t) {
        var e, i, o, n, s, r, a, l, h, c, d, u, p, m, g, f, v;
        if (t.options.typographer)
          for (v = [], g = t.tokens.length - 1; g >= 0; g--)
            if ('inline' === t.tokens[g].type)
              for (f = t.tokens[g].children, v.length = 0, e = 0; e < f.length; e++)
                if ('text' === (i = f[e]).type && !Kr.test(i.text)) {
                  for (a = f[e].level, p = v.length - 1; p >= 0 && !(v[p].level <= a); p--);
                  (v.length = p + 1), (s = 0), (r = (o = i.content).length);
                  t: for (; s < r && ((Yr.lastIndex = s), (n = Yr.exec(o))); )
                    if (
                      ((l = !Xr(o, n.index - 1)),
                      (s = n.index + 1),
                      (m = "'" === n[0]),
                      (h = !Xr(o, s)) || l)
                    ) {
                      if (((d = !h), (u = !l)))
                        for (p = v.length - 1; p >= 0 && ((c = v[p]), !(v[p].level < a)); p--)
                          if (c.single === m && v[p].level === a) {
                            (c = v[p]),
                              m
                                ? ((f[c.token].content = ta(
                                    f[c.token].content,
                                    c.pos,
                                    t.options.quotes[2]
                                  )),
                                  (i.content = ta(i.content, n.index, t.options.quotes[3])))
                                : ((f[c.token].content = ta(
                                    f[c.token].content,
                                    c.pos,
                                    t.options.quotes[0]
                                  )),
                                  (i.content = ta(i.content, n.index, t.options.quotes[1]))),
                              (v.length = p);
                            continue t;
                          }
                      d
                        ? v.push({ token: e, pos: n.index, single: m, level: a })
                        : u && m && (i.content = ta(i.content, n.index, '’'));
                    } else m && (i.content = ta(i.content, n.index, '’'));
                }
      }
    ]
  ];
  function ia() {
    (this.options = {}), (this.ruler = new Ir());
    for (var t = 0; t < ea.length; t++) this.ruler.push(ea[t][0], ea[t][1]);
  }
  function oa(t, e, i, o, n) {
    var s, r, a, l, h, c, d;
    for (
      this.src = t,
        this.parser = e,
        this.options = i,
        this.env = o,
        this.tokens = n,
        this.bMarks = [],
        this.eMarks = [],
        this.tShift = [],
        this.blkIndent = 0,
        this.line = 0,
        this.lineMax = 0,
        this.tight = !1,
        this.parentType = 'root',
        this.ddIndent = -1,
        this.level = 0,
        this.result = '',
        c = 0,
        d = !1,
        a = l = c = 0,
        h = (r = this.src).length;
      l < h;
      l++
    ) {
      if (((s = r.charCodeAt(l)), !d)) {
        if (32 === s) {
          c++;
          continue;
        }
        d = !0;
      }
      (10 !== s && l !== h - 1) ||
        (10 !== s && l++,
        this.bMarks.push(a),
        this.eMarks.push(l),
        this.tShift.push(c),
        (d = !1),
        (c = 0),
        (a = l + 1));
    }
    this.bMarks.push(r.length),
      this.eMarks.push(r.length),
      this.tShift.push(0),
      (this.lineMax = this.bMarks.length - 1);
  }
  function na(t, e) {
    var i, o, n;
    return (o = t.bMarks[e] + t.tShift[e]) >= (n = t.eMarks[e]) ||
      (42 !== (i = t.src.charCodeAt(o++)) && 45 !== i && 43 !== i) ||
      (o < n && 32 !== t.src.charCodeAt(o))
      ? -1
      : o;
  }
  function sa(t, e) {
    var i,
      o = t.bMarks[e] + t.tShift[e],
      n = t.eMarks[e];
    if (o + 1 >= n) return -1;
    if ((i = t.src.charCodeAt(o++)) < 48 || i > 57) return -1;
    for (;;) {
      if (o >= n) return -1;
      if (!((i = t.src.charCodeAt(o++)) >= 48 && i <= 57)) {
        if (41 === i || 46 === i) break;
        return -1;
      }
    }
    return o < n && 32 !== t.src.charCodeAt(o) ? -1 : o;
  }
  (ia.prototype.process = function(t) {
    var e, i, o;
    for (e = 0, i = (o = this.ruler.getRules('')).length; e < i; e++) o[e](t);
  }),
    (oa.prototype.isEmpty = function(t) {
      return this.bMarks[t] + this.tShift[t] >= this.eMarks[t];
    }),
    (oa.prototype.skipEmptyLines = function(t) {
      for (var e = this.lineMax; t < e && !(this.bMarks[t] + this.tShift[t] < this.eMarks[t]); t++);
      return t;
    }),
    (oa.prototype.skipSpaces = function(t) {
      for (var e = this.src.length; t < e && 32 === this.src.charCodeAt(t); t++);
      return t;
    }),
    (oa.prototype.skipChars = function(t, e) {
      for (var i = this.src.length; t < i && this.src.charCodeAt(t) === e; t++);
      return t;
    }),
    (oa.prototype.skipCharsBack = function(t, e, i) {
      if (t <= i) return t;
      for (; t > i; ) if (e !== this.src.charCodeAt(--t)) return t + 1;
      return t;
    }),
    (oa.prototype.getLines = function(t, e, i, o) {
      var n,
        s,
        r,
        a,
        l,
        h = t;
      if (t >= e) return '';
      if (h + 1 === e)
        return (
          (s = this.bMarks[h] + Math.min(this.tShift[h], i)),
          (r = o ? this.eMarks[h] + 1 : this.eMarks[h]),
          this.src.slice(s, r)
        );
      for (a = new Array(e - t), n = 0; h < e; h++, n++)
        (l = this.tShift[h]) > i && (l = i),
          l < 0 && (l = 0),
          (s = this.bMarks[h] + l),
          (r = h + 1 < e || o ? this.eMarks[h] + 1 : this.eMarks[h]),
          (a[n] = this.src.slice(s, r));
      return a.join('');
    });
  var ra = {};
  [
    'article',
    'aside',
    'button',
    'blockquote',
    'body',
    'canvas',
    'caption',
    'col',
    'colgroup',
    'dd',
    'div',
    'dl',
    'dt',
    'embed',
    'fieldset',
    'figcaption',
    'figure',
    'footer',
    'form',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'header',
    'hgroup',
    'hr',
    'iframe',
    'li',
    'map',
    'object',
    'ol',
    'output',
    'p',
    'pre',
    'progress',
    'script',
    'section',
    'style',
    'table',
    'tbody',
    'td',
    'textarea',
    'tfoot',
    'th',
    'tr',
    'thead',
    'ul',
    'video'
  ].forEach(function(t) {
    ra[t] = !0;
  });
  var aa = /^<([a-zA-Z]{1,15})[\s\/>]/,
    la = /^<\/([a-zA-Z]{1,15})[\s>]/;
  function ha(t, e) {
    var i = t.bMarks[e] + t.blkIndent,
      o = t.eMarks[e];
    return t.src.substr(i, o - i);
  }
  function ca(t, e) {
    var i,
      o,
      n = t.bMarks[e] + t.tShift[e],
      s = t.eMarks[e];
    return n >= s ||
      (126 !== (o = t.src.charCodeAt(n++)) && 58 !== o) ||
      n === (i = t.skipSpaces(n)) ||
      i >= s
      ? -1
      : i;
  }
  var da = [
    [
      'code',
      function(t, e, i) {
        var o, n;
        if (t.tShift[e] - t.blkIndent < 4) return !1;
        for (n = o = e + 1; o < i; )
          if (t.isEmpty(o)) o++;
          else {
            if (!(t.tShift[o] - t.blkIndent >= 4)) break;
            n = ++o;
          }
        return (
          (t.line = o),
          t.tokens.push({
            type: 'code',
            content: t.getLines(e, n, 4 + t.blkIndent, !0),
            block: !0,
            lines: [e, t.line],
            level: t.level
          }),
          !0
        );
      }
    ],
    [
      'fences',
      function(t, e, i, o) {
        var n,
          s,
          r,
          a,
          l,
          h = !1,
          c = t.bMarks[e] + t.tShift[e],
          d = t.eMarks[e];
        if (c + 3 > d) return !1;
        if (126 !== (n = t.src.charCodeAt(c)) && 96 !== n) return !1;
        if (((l = c), (s = (c = t.skipChars(c, n)) - l) < 3)) return !1;
        if ((r = t.src.slice(c, d).trim()).indexOf('`') >= 0) return !1;
        if (o) return !0;
        for (
          a = e;
          !(++a >= i) &&
          !((c = l = t.bMarks[a] + t.tShift[a]) < (d = t.eMarks[a]) && t.tShift[a] < t.blkIndent);

        )
          if (
            t.src.charCodeAt(c) === n &&
            !(
              t.tShift[a] - t.blkIndent >= 4 ||
              (c = t.skipChars(c, n)) - l < s ||
              (c = t.skipSpaces(c)) < d
            )
          ) {
            h = !0;
            break;
          }
        return (
          (s = t.tShift[e]),
          (t.line = a + (h ? 1 : 0)),
          t.tokens.push({
            type: 'fence',
            params: r,
            content: t.getLines(e + 1, a, s, !0),
            lines: [e, t.line],
            level: t.level
          }),
          !0
        );
      },
      ['paragraph', 'blockquote', 'list']
    ],
    [
      'blockquote',
      function(t, e, i, o) {
        var n,
          s,
          r,
          a,
          l,
          h,
          c,
          d,
          u,
          p,
          m,
          g = t.bMarks[e] + t.tShift[e],
          f = t.eMarks[e];
        if (g > f) return !1;
        if (62 !== t.src.charCodeAt(g++)) return !1;
        if (t.level >= t.options.maxNesting) return !1;
        if (o) return !0;
        for (
          32 === t.src.charCodeAt(g) && g++,
            l = t.blkIndent,
            t.blkIndent = 0,
            a = [t.bMarks[e]],
            t.bMarks[e] = g,
            s = (g = g < f ? t.skipSpaces(g) : g) >= f,
            r = [t.tShift[e]],
            t.tShift[e] = g - t.bMarks[e],
            d = t.parser.ruler.getRules('blockquote'),
            n = e + 1;
          n < i && !((g = t.bMarks[n] + t.tShift[n]) >= (f = t.eMarks[n]));
          n++
        )
          if (62 !== t.src.charCodeAt(g++)) {
            if (s) break;
            for (m = !1, u = 0, p = d.length; u < p; u++)
              if (d[u](t, n, i, !0)) {
                m = !0;
                break;
              }
            if (m) break;
            a.push(t.bMarks[n]), r.push(t.tShift[n]), (t.tShift[n] = -1337);
          } else
            32 === t.src.charCodeAt(g) && g++,
              a.push(t.bMarks[n]),
              (t.bMarks[n] = g),
              (s = (g = g < f ? t.skipSpaces(g) : g) >= f),
              r.push(t.tShift[n]),
              (t.tShift[n] = g - t.bMarks[n]);
        for (
          h = t.parentType,
            t.parentType = 'blockquote',
            t.tokens.push({ type: 'blockquote_open', lines: (c = [e, 0]), level: t.level++ }),
            t.parser.tokenize(t, e, n),
            t.tokens.push({ type: 'blockquote_close', level: --t.level }),
            t.parentType = h,
            c[1] = t.line,
            u = 0;
          u < r.length;
          u++
        )
          (t.bMarks[u + e] = a[u]), (t.tShift[u + e] = r[u]);
        return (t.blkIndent = l), !0;
      },
      ['paragraph', 'blockquote', 'list']
    ],
    [
      'hr',
      function(t, e, i, o) {
        var n,
          s,
          r,
          a = t.bMarks[e],
          l = t.eMarks[e];
        if ((a += t.tShift[e]) > l) return !1;
        if (42 !== (n = t.src.charCodeAt(a++)) && 45 !== n && 95 !== n) return !1;
        for (s = 1; a < l; ) {
          if ((r = t.src.charCodeAt(a++)) !== n && 32 !== r) return !1;
          r === n && s++;
        }
        return (
          !(s < 3) &&
          (o ||
            ((t.line = e + 1), t.tokens.push({ type: 'hr', lines: [e, t.line], level: t.level })),
          !0)
        );
      },
      ['paragraph', 'blockquote', 'list']
    ],
    [
      'list',
      function(t, e, i, o) {
        var n,
          s,
          r,
          a,
          l,
          h,
          c,
          d,
          u,
          p,
          m,
          g,
          f,
          v,
          b,
          y,
          _,
          x,
          w,
          k,
          A,
          C = !0;
        if ((d = sa(t, e)) >= 0) g = !0;
        else {
          if (!((d = na(t, e)) >= 0)) return !1;
          g = !1;
        }
        if (t.level >= t.options.maxNesting) return !1;
        if (((m = t.src.charCodeAt(d - 1)), o)) return !0;
        for (
          v = t.tokens.length,
            g
              ? ((c = t.bMarks[e] + t.tShift[e]),
                (p = Number(t.src.substr(c, d - c - 1))),
                t.tokens.push({
                  type: 'ordered_list_open',
                  order: p,
                  lines: (y = [e, 0]),
                  level: t.level++
                }))
              : t.tokens.push({ type: 'bullet_list_open', lines: (y = [e, 0]), level: t.level++ }),
            n = e,
            b = !1,
            x = t.parser.ruler.getRules('list');
          !(
            !(n < i) ||
            ((u = (f = t.skipSpaces(d)) >= t.eMarks[n] ? 1 : f - d) > 4 && (u = 1),
            u < 1 && (u = 1),
            (s = d - t.bMarks[n] + u),
            t.tokens.push({ type: 'list_item_open', lines: (_ = [e, 0]), level: t.level++ }),
            (a = t.blkIndent),
            (l = t.tight),
            (r = t.tShift[e]),
            (h = t.parentType),
            (t.tShift[e] = f - t.bMarks[e]),
            (t.blkIndent = s),
            (t.tight = !0),
            (t.parentType = 'list'),
            t.parser.tokenize(t, e, i, !0),
            (t.tight && !b) || (C = !1),
            (b = t.line - e > 1 && t.isEmpty(t.line - 1)),
            (t.blkIndent = a),
            (t.tShift[e] = r),
            (t.tight = l),
            (t.parentType = h),
            t.tokens.push({ type: 'list_item_close', level: --t.level }),
            (n = e = t.line),
            (_[1] = n),
            (f = t.bMarks[e]),
            n >= i) ||
            t.isEmpty(n) ||
            t.tShift[n] < t.blkIndent
          );

        ) {
          for (A = !1, w = 0, k = x.length; w < k; w++)
            if (x[w](t, n, i, !0)) {
              A = !0;
              break;
            }
          if (A) break;
          if (g) {
            if ((d = sa(t, n)) < 0) break;
          } else if ((d = na(t, n)) < 0) break;
          if (m !== t.src.charCodeAt(d - 1)) break;
        }
        return (
          t.tokens.push({ type: g ? 'ordered_list_close' : 'bullet_list_close', level: --t.level }),
          (y[1] = n),
          (t.line = n),
          C &&
            (function(t, e) {
              var i,
                o,
                n = t.level + 2;
              for (i = e + 2, o = t.tokens.length - 2; i < o; i++)
                t.tokens[i].level === n &&
                  'paragraph_open' === t.tokens[i].type &&
                  ((t.tokens[i + 2].tight = !0), (t.tokens[i].tight = !0), (i += 2));
            })(t, v),
          !0
        );
      },
      ['paragraph', 'blockquote']
    ],
    [
      'footnote',
      function(t, e, i, o) {
        var n,
          s,
          r,
          a,
          l,
          h = t.bMarks[e] + t.tShift[e],
          c = t.eMarks[e];
        if (h + 4 > c) return !1;
        if (91 !== t.src.charCodeAt(h)) return !1;
        if (94 !== t.src.charCodeAt(h + 1)) return !1;
        if (t.level >= t.options.maxNesting) return !1;
        for (a = h + 2; a < c; a++) {
          if (32 === t.src.charCodeAt(a)) return !1;
          if (93 === t.src.charCodeAt(a)) break;
        }
        return (
          a !== h + 2 &&
          (!(a + 1 >= c || 58 !== t.src.charCodeAt(++a)) &&
            (o ||
              (a++,
              t.env.footnotes || (t.env.footnotes = {}),
              t.env.footnotes.refs || (t.env.footnotes.refs = {}),
              (l = t.src.slice(h + 2, a - 2)),
              (t.env.footnotes.refs[':' + l] = -1),
              t.tokens.push({ type: 'footnote_reference_open', label: l, level: t.level++ }),
              (n = t.bMarks[e]),
              (s = t.tShift[e]),
              (r = t.parentType),
              (t.tShift[e] = t.skipSpaces(a) - a),
              (t.bMarks[e] = a),
              (t.blkIndent += 4),
              (t.parentType = 'footnote'),
              t.tShift[e] < t.blkIndent &&
                ((t.tShift[e] += t.blkIndent), (t.bMarks[e] -= t.blkIndent)),
              t.parser.tokenize(t, e, i, !0),
              (t.parentType = r),
              (t.blkIndent -= 4),
              (t.tShift[e] = s),
              (t.bMarks[e] = n),
              t.tokens.push({ type: 'footnote_reference_close', level: --t.level })),
            !0))
        );
      },
      ['paragraph']
    ],
    [
      'heading',
      function(t, e, i, o) {
        var n,
          s,
          r,
          a = t.bMarks[e] + t.tShift[e],
          l = t.eMarks[e];
        if (a >= l) return !1;
        if (35 !== (n = t.src.charCodeAt(a)) || a >= l) return !1;
        for (s = 1, n = t.src.charCodeAt(++a); 35 === n && a < l && s <= 6; )
          s++, (n = t.src.charCodeAt(++a));
        return (
          !(s > 6 || (a < l && 32 !== n)) &&
          (o ||
            ((l = t.skipCharsBack(l, 32, a)),
            (r = t.skipCharsBack(l, 35, a)) > a && 32 === t.src.charCodeAt(r - 1) && (l = r),
            (t.line = e + 1),
            t.tokens.push({ type: 'heading_open', hLevel: s, lines: [e, t.line], level: t.level }),
            a < l &&
              t.tokens.push({
                type: 'inline',
                content: t.src.slice(a, l).trim(),
                level: t.level + 1,
                lines: [e, t.line],
                children: []
              }),
            t.tokens.push({ type: 'heading_close', hLevel: s, level: t.level })),
          !0)
        );
      },
      ['paragraph', 'blockquote']
    ],
    [
      'lheading',
      function(t, e, i) {
        var o,
          n,
          s,
          r = e + 1;
        return (
          !(r >= i) &&
          (!(t.tShift[r] < t.blkIndent) &&
            (!(t.tShift[r] - t.blkIndent > 3) &&
              (!((n = t.bMarks[r] + t.tShift[r]) >= (s = t.eMarks[r])) &&
                ((45 === (o = t.src.charCodeAt(n)) || 61 === o) &&
                  ((n = t.skipChars(n, o)),
                  !((n = t.skipSpaces(n)) < s) &&
                    ((n = t.bMarks[e] + t.tShift[e]),
                    (t.line = r + 1),
                    t.tokens.push({
                      type: 'heading_open',
                      hLevel: 61 === o ? 1 : 2,
                      lines: [e, t.line],
                      level: t.level
                    }),
                    t.tokens.push({
                      type: 'inline',
                      content: t.src.slice(n, t.eMarks[e]).trim(),
                      level: t.level + 1,
                      lines: [e, t.line - 1],
                      children: []
                    }),
                    t.tokens.push({
                      type: 'heading_close',
                      hLevel: 61 === o ? 1 : 2,
                      level: t.level
                    }),
                    !0))))))
        );
      }
    ],
    [
      'htmlblock',
      function(t, e, i, o) {
        var n,
          s,
          r,
          a = t.bMarks[e],
          l = t.eMarks[e],
          h = t.tShift[e];
        if (((a += h), !t.options.html)) return !1;
        if (h > 3 || a + 2 >= l) return !1;
        if (60 !== t.src.charCodeAt(a)) return !1;
        if (33 === (n = t.src.charCodeAt(a + 1)) || 63 === n) {
          if (o) return !0;
        } else {
          if (
            47 !== n &&
            !(function(t) {
              var e = 32 | t;
              return e >= 97 && e <= 122;
            })(n)
          )
            return !1;
          if (47 === n) {
            if (!(s = t.src.slice(a, l).match(la))) return !1;
          } else if (!(s = t.src.slice(a, l).match(aa))) return !1;
          if (!0 !== ra[s[1].toLowerCase()]) return !1;
          if (o) return !0;
        }
        for (r = e + 1; r < t.lineMax && !t.isEmpty(r); ) r++;
        return (
          (t.line = r),
          t.tokens.push({
            type: 'htmlblock',
            level: t.level,
            lines: [e, t.line],
            content: t.getLines(e, r, 0, !0)
          }),
          !0
        );
      },
      ['paragraph', 'blockquote']
    ],
    [
      'table',
      function(t, e, i, o) {
        var n, s, r, a, l, h, c, d, u, p, m;
        if (e + 2 > i) return !1;
        if (((l = e + 1), t.tShift[l] < t.blkIndent)) return !1;
        if ((r = t.bMarks[l] + t.tShift[l]) >= t.eMarks[l]) return !1;
        if (124 !== (n = t.src.charCodeAt(r)) && 45 !== n && 58 !== n) return !1;
        if (((s = ha(t, e + 1)), !/^[-:| ]+$/.test(s))) return !1;
        if ((h = s.split('|')) <= 2) return !1;
        for (d = [], a = 0; a < h.length; a++) {
          if (!(u = h[a].trim())) {
            if (0 === a || a === h.length - 1) continue;
            return !1;
          }
          if (!/^:?-+:?$/.test(u)) return !1;
          58 === u.charCodeAt(u.length - 1)
            ? d.push(58 === u.charCodeAt(0) ? 'center' : 'right')
            : 58 === u.charCodeAt(0)
            ? d.push('left')
            : d.push('');
        }
        if (-1 === (s = ha(t, e).trim()).indexOf('|')) return !1;
        if (((h = s.replace(/^\||\|$/g, '').split('|')), d.length !== h.length)) return !1;
        if (o) return !0;
        for (
          t.tokens.push({ type: 'table_open', lines: (p = [e, 0]), level: t.level++ }),
            t.tokens.push({ type: 'thead_open', lines: [e, e + 1], level: t.level++ }),
            t.tokens.push({ type: 'tr_open', lines: [e, e + 1], level: t.level++ }),
            a = 0;
          a < h.length;
          a++
        )
          t.tokens.push({ type: 'th_open', align: d[a], lines: [e, e + 1], level: t.level++ }),
            t.tokens.push({
              type: 'inline',
              content: h[a].trim(),
              lines: [e, e + 1],
              level: t.level,
              children: []
            }),
            t.tokens.push({ type: 'th_close', level: --t.level });
        for (
          t.tokens.push({ type: 'tr_close', level: --t.level }),
            t.tokens.push({ type: 'thead_close', level: --t.level }),
            t.tokens.push({ type: 'tbody_open', lines: (m = [e + 2, 0]), level: t.level++ }),
            l = e + 2;
          l < i && !(t.tShift[l] < t.blkIndent) && -1 !== (s = ha(t, l).trim()).indexOf('|');
          l++
        ) {
          for (
            h = s.replace(/^\||\|$/g, '').split('|'),
              t.tokens.push({ type: 'tr_open', level: t.level++ }),
              a = 0;
            a < h.length;
            a++
          )
            t.tokens.push({ type: 'td_open', align: d[a], level: t.level++ }),
              (c = h[a]
                .substring(
                  124 === h[a].charCodeAt(0) ? 1 : 0,
                  124 === h[a].charCodeAt(h[a].length - 1) ? h[a].length - 1 : h[a].length
                )
                .trim()),
              t.tokens.push({ type: 'inline', content: c, level: t.level, children: [] }),
              t.tokens.push({ type: 'td_close', level: --t.level });
          t.tokens.push({ type: 'tr_close', level: --t.level });
        }
        return (
          t.tokens.push({ type: 'tbody_close', level: --t.level }),
          t.tokens.push({ type: 'table_close', level: --t.level }),
          (p[1] = m[1] = l),
          (t.line = l),
          !0
        );
      },
      ['paragraph']
    ],
    [
      'deflist',
      function(t, e, i, o) {
        var n, s, r, a, l, h, c, d, u, p, m, g, f, v;
        if (o) return !(t.ddIndent < 0) && ca(t, e) >= 0;
        if (((c = e + 1), t.isEmpty(c) && ++c > i)) return !1;
        if (t.tShift[c] < t.blkIndent) return !1;
        if ((n = ca(t, c)) < 0) return !1;
        if (t.level >= t.options.maxNesting) return !1;
        (h = t.tokens.length),
          t.tokens.push({ type: 'dl_open', lines: (l = [e, 0]), level: t.level++ }),
          (r = e),
          (s = c);
        t: for (;;) {
          for (
            v = !0,
              f = !1,
              t.tokens.push({ type: 'dt_open', lines: [r, r], level: t.level++ }),
              t.tokens.push({
                type: 'inline',
                content: t.getLines(r, r + 1, t.blkIndent, !1).trim(),
                level: t.level + 1,
                lines: [r, r],
                children: []
              }),
              t.tokens.push({ type: 'dt_close', level: --t.level });
            ;

          ) {
            if (
              (t.tokens.push({ type: 'dd_open', lines: (a = [c, 0]), level: t.level++ }),
              (g = t.tight),
              (u = t.ddIndent),
              (d = t.blkIndent),
              (m = t.tShift[s]),
              (p = t.parentType),
              (t.blkIndent = t.ddIndent = t.tShift[s] + 2),
              (t.tShift[s] = n - t.bMarks[s]),
              (t.tight = !0),
              (t.parentType = 'deflist'),
              t.parser.tokenize(t, s, i, !0),
              (t.tight && !f) || (v = !1),
              (f = t.line - s > 1 && t.isEmpty(t.line - 1)),
              (t.tShift[s] = m),
              (t.tight = g),
              (t.parentType = p),
              (t.blkIndent = d),
              (t.ddIndent = u),
              t.tokens.push({ type: 'dd_close', level: --t.level }),
              (a[1] = c = t.line),
              c >= i)
            )
              break t;
            if (t.tShift[c] < t.blkIndent) break t;
            if ((n = ca(t, c)) < 0) break;
            s = c;
          }
          if (c >= i) break;
          if (((r = c), t.isEmpty(r))) break;
          if (t.tShift[r] < t.blkIndent) break;
          if ((s = r + 1) >= i) break;
          if ((t.isEmpty(s) && s++, s >= i)) break;
          if (t.tShift[s] < t.blkIndent) break;
          if ((n = ca(t, s)) < 0) break;
        }
        return (
          t.tokens.push({ type: 'dl_close', level: --t.level }),
          (l[1] = c),
          (t.line = c),
          v &&
            (function(t, e) {
              var i,
                o,
                n = t.level + 2;
              for (i = e + 2, o = t.tokens.length - 2; i < o; i++)
                t.tokens[i].level === n &&
                  'paragraph_open' === t.tokens[i].type &&
                  ((t.tokens[i + 2].tight = !0), (t.tokens[i].tight = !0), (i += 2));
            })(t, h),
          !0
        );
      },
      ['paragraph']
    ],
    [
      'paragraph',
      function(t, e) {
        var i,
          o,
          n,
          s,
          r,
          a,
          l = e + 1;
        if (l < (i = t.lineMax) && !t.isEmpty(l))
          for (a = t.parser.ruler.getRules('paragraph'); l < i && !t.isEmpty(l); l++)
            if (!(t.tShift[l] - t.blkIndent > 3)) {
              for (n = !1, s = 0, r = a.length; s < r; s++)
                if (a[s](t, l, i, !0)) {
                  n = !0;
                  break;
                }
              if (n) break;
            }
        return (
          (o = t.getLines(e, l, t.blkIndent, !1).trim()),
          (t.line = l),
          o.length &&
            (t.tokens.push({
              type: 'paragraph_open',
              tight: !1,
              lines: [e, t.line],
              level: t.level
            }),
            t.tokens.push({
              type: 'inline',
              content: o,
              level: t.level + 1,
              lines: [e, t.line],
              children: []
            }),
            t.tokens.push({ type: 'paragraph_close', tight: !1, level: t.level })),
          !0
        );
      }
    ]
  ];
  function ua() {
    this.ruler = new Ir();
    for (var t = 0; t < da.length; t++)
      this.ruler.push(da[t][0], da[t][1], { alt: (da[t][2] || []).slice() });
  }
  ua.prototype.tokenize = function(t, e, i) {
    for (
      var o, n = this.ruler.getRules(''), s = n.length, r = e, a = !1;
      r < i && ((t.line = r = t.skipEmptyLines(r)), !(r >= i)) && !(t.tShift[r] < t.blkIndent);

    ) {
      for (o = 0; o < s && !n[o](t, r, i, !1); o++);
      if (((t.tight = !a), t.isEmpty(t.line - 1) && (a = !0), (r = t.line) < i && t.isEmpty(r))) {
        if (((a = !0), ++r < i && 'list' === t.parentType && t.isEmpty(r))) break;
        t.line = r;
      }
    }
  };
  var pa = /[\n\t]/g,
    ma = /\r[\n\u0085]|[\u2424\u2028\u0085]/g,
    ga = /\u00a0/g;
  function fa(t) {
    switch (t) {
      case 10:
      case 92:
      case 96:
      case 42:
      case 95:
      case 94:
      case 91:
      case 93:
      case 33:
      case 38:
      case 60:
      case 62:
      case 123:
      case 125:
      case 36:
      case 37:
      case 64:
      case 126:
      case 43:
      case 61:
      case 58:
        return !0;
      default:
        return !1;
    }
  }
  ua.prototype.parse = function(t, e, i, o) {
    var n,
      s = 0,
      r = 0;
    if (!t) return [];
    (t = (t = t.replace(ga, ' ')).replace(ma, '\n')).indexOf('\t') >= 0 &&
      (t = t.replace(pa, function(e, i) {
        var o;
        return 10 === t.charCodeAt(i)
          ? ((s = i + 1), (r = 0), e)
          : ((o = '    '.slice((i - s - r) % 4)), (r = i - s + 1), o);
      })),
      (n = new oa(t, this, e, i, o)),
      this.tokenize(n, n.line, n.lineMax);
  };
  for (var va = [], ba = 0; ba < 256; ba++) va.push(0);
  function ya(t) {
    return (t >= 48 && t <= 57) || (t >= 65 && t <= 90) || (t >= 97 && t <= 122);
  }
  function _a(t, e) {
    var i,
      o,
      n,
      s = e,
      r = !0,
      a = !0,
      l = t.posMax,
      h = t.src.charCodeAt(e);
    for (i = e > 0 ? t.src.charCodeAt(e - 1) : -1; s < l && t.src.charCodeAt(s) === h; ) s++;
    return (
      s >= l && (r = !1),
      (n = s - e) >= 4
        ? (r = a = !1)
        : ((32 !== (o = s < l ? t.src.charCodeAt(s) : -1) && 10 !== o) || (r = !1),
          (32 !== i && 10 !== i) || (a = !1),
          95 === h && (ya(i) && (r = !1), ya(o) && (a = !1))),
      { can_open: r, can_close: a, delims: n }
    );
  }
  '\\!"#$%&\'()*+,./:;<=>?@[]^_`{|}~-'.split('').forEach(function(t) {
    va[t.charCodeAt(0)] = 1;
  });
  var xa = /\\([ \\!"#$%&'()*+,.\/:;<=>?@[\]^_`{|}~-])/g;
  var wa = /\\([ \\!"#$%&'()*+,.\/:;<=>?@[\]^_`{|}~-])/g;
  var ka = [
      'coap',
      'doi',
      'javascript',
      'aaa',
      'aaas',
      'about',
      'acap',
      'cap',
      'cid',
      'crid',
      'data',
      'dav',
      'dict',
      'dns',
      'file',
      'ftp',
      'geo',
      'go',
      'gopher',
      'h323',
      'http',
      'https',
      'iax',
      'icap',
      'im',
      'imap',
      'info',
      'ipp',
      'iris',
      'iris.beep',
      'iris.xpc',
      'iris.xpcs',
      'iris.lwz',
      'ldap',
      'mailto',
      'mid',
      'msrp',
      'msrps',
      'mtqp',
      'mupdate',
      'news',
      'nfs',
      'ni',
      'nih',
      'nntp',
      'opaquelocktoken',
      'pop',
      'pres',
      'rtsp',
      'service',
      'session',
      'shttp',
      'sieve',
      'sip',
      'sips',
      'sms',
      'snmp',
      'soap.beep',
      'soap.beeps',
      'tag',
      'tel',
      'telnet',
      'tftp',
      'thismessage',
      'tn3270',
      'tip',
      'tv',
      'urn',
      'vemmi',
      'ws',
      'wss',
      'xcon',
      'xcon-userid',
      'xmlrpc.beep',
      'xmlrpc.beeps',
      'xmpp',
      'z39.50r',
      'z39.50s',
      'adiumxtra',
      'afp',
      'afs',
      'aim',
      'apt',
      'attachment',
      'aw',
      'beshare',
      'bitcoin',
      'bolo',
      'callto',
      'chrome',
      'chrome-extension',
      'com-eventbrite-attendee',
      'content',
      'cvs',
      'dlna-playsingle',
      'dlna-playcontainer',
      'dtn',
      'dvb',
      'ed2k',
      'facetime',
      'feed',
      'finger',
      'fish',
      'gg',
      'git',
      'gizmoproject',
      'gtalk',
      'hcp',
      'icon',
      'ipn',
      'irc',
      'irc6',
      'ircs',
      'itms',
      'jar',
      'jms',
      'keyparc',
      'lastfm',
      'ldaps',
      'magnet',
      'maps',
      'market',
      'message',
      'mms',
      'ms-help',
      'msnim',
      'mumble',
      'mvn',
      'notes',
      'oid',
      'palm',
      'paparazzi',
      'platform',
      'proxy',
      'psyc',
      'query',
      'res',
      'resource',
      'rmi',
      'rsync',
      'rtmp',
      'secondlife',
      'sftp',
      'sgn',
      'skype',
      'smb',
      'soldat',
      'spotify',
      'ssh',
      'steam',
      'svn',
      'teamspeak',
      'things',
      'udp',
      'unreal',
      'ut2004',
      'ventrilo',
      'view-source',
      'webcal',
      'wtai',
      'wyciwyg',
      'xfire',
      'xri',
      'ymsgr'
    ],
    Aa = /^<([a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)>/,
    Ca = /^<([a-zA-Z.\-]{1,25}):([^<>\x00-\x20]*)>/;
  function Sa(t, e) {
    return (
      (t = t.source),
      (e = e || ''),
      function i(o, n) {
        return o ? ((n = n.source || n), (t = t.replace(o, n)), i) : new RegExp(t, e);
      }
    );
  }
  var Ea = Sa(/(?:unquoted|single_quoted|double_quoted)/)('unquoted', /[^"'=<>`\x00-\x20]+/)(
      'single_quoted',
      /'[^']*'/
    )('double_quoted', /"[^"]*"/)(),
    Ta = Sa(/(?:\s+attr_name(?:\s*=\s*attr_value)?)/)('attr_name', /[a-zA-Z_:][a-zA-Z0-9:._-]*/)(
      'attr_value',
      Ea
    )(),
    $a = Sa(/<[A-Za-z][A-Za-z0-9]*attribute*\s*\/?>/)('attribute', Ta)(),
    Oa = Sa(/^(?:open_tag|close_tag|comment|processing|declaration|cdata)/)('open_tag', $a)(
      'close_tag',
      /<\/[A-Za-z][A-Za-z0-9]*\s*>/
    )('comment', /<!---->|<!--(?:-?[^>-])(?:-?[^-])*-->/)('processing', /<[?].*?[?]>/)(
      'declaration',
      /<![A-Z]+\s+[^>]*>/
    )('cdata', /<!\[CDATA\[[\s\S]*?\]\]>/)();
  var Ma = /^&#((?:x[a-f0-9]{1,8}|[0-9]{1,8}));/i,
    La = /^&([a-z][a-z0-9]{1,31});/i;
  var za = [
    [
      'text',
      function(t, e) {
        for (var i = t.pos; i < t.posMax && !fa(t.src.charCodeAt(i)); ) i++;
        return i !== t.pos && (e || (t.pending += t.src.slice(t.pos, i)), (t.pos = i), !0);
      }
    ],
    [
      'newline',
      function(t, e) {
        var i,
          o,
          n = t.pos;
        if (10 !== t.src.charCodeAt(n)) return !1;
        if (((i = t.pending.length - 1), (o = t.posMax), !e))
          if (i >= 0 && 32 === t.pending.charCodeAt(i))
            if (i >= 1 && 32 === t.pending.charCodeAt(i - 1)) {
              for (var s = i - 2; s >= 0; s--)
                if (32 !== t.pending.charCodeAt(s)) {
                  t.pending = t.pending.substring(0, s + 1);
                  break;
                }
              t.push({ type: 'hardbreak', level: t.level });
            } else
              (t.pending = t.pending.slice(0, -1)), t.push({ type: 'softbreak', level: t.level });
          else t.push({ type: 'softbreak', level: t.level });
        for (n++; n < o && 32 === t.src.charCodeAt(n); ) n++;
        return (t.pos = n), !0;
      }
    ],
    [
      'escape',
      function(t, e) {
        var i,
          o = t.pos,
          n = t.posMax;
        if (92 !== t.src.charCodeAt(o)) return !1;
        if (++o < n) {
          if ((i = t.src.charCodeAt(o)) < 256 && 0 !== va[i])
            return e || (t.pending += t.src[o]), (t.pos += 2), !0;
          if (10 === i) {
            for (
              e || t.push({ type: 'hardbreak', level: t.level }), o++;
              o < n && 32 === t.src.charCodeAt(o);

            )
              o++;
            return (t.pos = o), !0;
          }
        }
        return e || (t.pending += '\\'), t.pos++, !0;
      }
    ],
    [
      'backticks',
      function(t, e) {
        var i,
          o,
          n,
          s,
          r,
          a = t.pos;
        if (96 !== t.src.charCodeAt(a)) return !1;
        for (i = a, a++, o = t.posMax; a < o && 96 === t.src.charCodeAt(a); ) a++;
        for (n = t.src.slice(i, a), s = r = a; -1 !== (s = t.src.indexOf('`', r)); ) {
          for (r = s + 1; r < o && 96 === t.src.charCodeAt(r); ) r++;
          if (r - s === n.length)
            return (
              e ||
                t.push({
                  type: 'code',
                  content: t.src
                    .slice(a, s)
                    .replace(/[ \n]+/g, ' ')
                    .trim(),
                  block: !1,
                  level: t.level
                }),
              (t.pos = r),
              !0
            );
        }
        return e || (t.pending += n), (t.pos += n.length), !0;
      }
    ],
    [
      'del',
      function(t, e) {
        var i,
          o,
          n,
          s,
          r,
          a = t.posMax,
          l = t.pos;
        if (126 !== t.src.charCodeAt(l)) return !1;
        if (e) return !1;
        if (l + 4 >= a) return !1;
        if (126 !== t.src.charCodeAt(l + 1)) return !1;
        if (t.level >= t.options.maxNesting) return !1;
        if (((s = l > 0 ? t.src.charCodeAt(l - 1) : -1), (r = t.src.charCodeAt(l + 2)), 126 === s))
          return !1;
        if (126 === r) return !1;
        if (32 === r || 10 === r) return !1;
        for (o = l + 2; o < a && 126 === t.src.charCodeAt(o); ) o++;
        if (o > l + 3) return (t.pos += o - l), e || (t.pending += t.src.slice(l, o)), !0;
        for (t.pos = l + 2, n = 1; t.pos + 1 < a; ) {
          if (
            126 === t.src.charCodeAt(t.pos) &&
            126 === t.src.charCodeAt(t.pos + 1) &&
            ((s = t.src.charCodeAt(t.pos - 1)),
            126 !== (r = t.pos + 2 < a ? t.src.charCodeAt(t.pos + 2) : -1) &&
              126 !== s &&
              (32 !== s && 10 !== s ? n-- : 32 !== r && 10 !== r && n++, n <= 0))
          ) {
            i = !0;
            break;
          }
          t.parser.skipToken(t);
        }
        return i
          ? ((t.posMax = t.pos),
            (t.pos = l + 2),
            e ||
              (t.push({ type: 'del_open', level: t.level++ }),
              t.parser.tokenize(t),
              t.push({ type: 'del_close', level: --t.level })),
            (t.pos = t.posMax + 2),
            (t.posMax = a),
            !0)
          : ((t.pos = l), !1);
      }
    ],
    [
      'ins',
      function(t, e) {
        var i,
          o,
          n,
          s,
          r,
          a = t.posMax,
          l = t.pos;
        if (43 !== t.src.charCodeAt(l)) return !1;
        if (e) return !1;
        if (l + 4 >= a) return !1;
        if (43 !== t.src.charCodeAt(l + 1)) return !1;
        if (t.level >= t.options.maxNesting) return !1;
        if (((s = l > 0 ? t.src.charCodeAt(l - 1) : -1), (r = t.src.charCodeAt(l + 2)), 43 === s))
          return !1;
        if (43 === r) return !1;
        if (32 === r || 10 === r) return !1;
        for (o = l + 2; o < a && 43 === t.src.charCodeAt(o); ) o++;
        if (o !== l + 2) return (t.pos += o - l), e || (t.pending += t.src.slice(l, o)), !0;
        for (t.pos = l + 2, n = 1; t.pos + 1 < a; ) {
          if (
            43 === t.src.charCodeAt(t.pos) &&
            43 === t.src.charCodeAt(t.pos + 1) &&
            ((s = t.src.charCodeAt(t.pos - 1)),
            43 !== (r = t.pos + 2 < a ? t.src.charCodeAt(t.pos + 2) : -1) &&
              43 !== s &&
              (32 !== s && 10 !== s ? n-- : 32 !== r && 10 !== r && n++, n <= 0))
          ) {
            i = !0;
            break;
          }
          t.parser.skipToken(t);
        }
        return i
          ? ((t.posMax = t.pos),
            (t.pos = l + 2),
            e ||
              (t.push({ type: 'ins_open', level: t.level++ }),
              t.parser.tokenize(t),
              t.push({ type: 'ins_close', level: --t.level })),
            (t.pos = t.posMax + 2),
            (t.posMax = a),
            !0)
          : ((t.pos = l), !1);
      }
    ],
    [
      'mark',
      function(t, e) {
        var i,
          o,
          n,
          s,
          r,
          a = t.posMax,
          l = t.pos;
        if (61 !== t.src.charCodeAt(l)) return !1;
        if (e) return !1;
        if (l + 4 >= a) return !1;
        if (61 !== t.src.charCodeAt(l + 1)) return !1;
        if (t.level >= t.options.maxNesting) return !1;
        if (((s = l > 0 ? t.src.charCodeAt(l - 1) : -1), (r = t.src.charCodeAt(l + 2)), 61 === s))
          return !1;
        if (61 === r) return !1;
        if (32 === r || 10 === r) return !1;
        for (o = l + 2; o < a && 61 === t.src.charCodeAt(o); ) o++;
        if (o !== l + 2) return (t.pos += o - l), e || (t.pending += t.src.slice(l, o)), !0;
        for (t.pos = l + 2, n = 1; t.pos + 1 < a; ) {
          if (
            61 === t.src.charCodeAt(t.pos) &&
            61 === t.src.charCodeAt(t.pos + 1) &&
            ((s = t.src.charCodeAt(t.pos - 1)),
            61 !== (r = t.pos + 2 < a ? t.src.charCodeAt(t.pos + 2) : -1) &&
              61 !== s &&
              (32 !== s && 10 !== s ? n-- : 32 !== r && 10 !== r && n++, n <= 0))
          ) {
            i = !0;
            break;
          }
          t.parser.skipToken(t);
        }
        return i
          ? ((t.posMax = t.pos),
            (t.pos = l + 2),
            e ||
              (t.push({ type: 'mark_open', level: t.level++ }),
              t.parser.tokenize(t),
              t.push({ type: 'mark_close', level: --t.level })),
            (t.pos = t.posMax + 2),
            (t.posMax = a),
            !0)
          : ((t.pos = l), !1);
      }
    ],
    [
      'emphasis',
      function(t, e) {
        var i,
          o,
          n,
          s,
          r,
          a,
          l,
          h = t.posMax,
          c = t.pos,
          d = t.src.charCodeAt(c);
        if (95 !== d && 42 !== d) return !1;
        if (e) return !1;
        if (((i = (l = _a(t, c)).delims), !l.can_open))
          return (t.pos += i), e || (t.pending += t.src.slice(c, t.pos)), !0;
        if (t.level >= t.options.maxNesting) return !1;
        for (t.pos = c + i, a = [i]; t.pos < h; )
          if (t.src.charCodeAt(t.pos) !== d) t.parser.skipToken(t);
          else {
            if (((o = (l = _a(t, t.pos)).delims), l.can_close)) {
              for (s = a.pop(), r = o; s !== r; ) {
                if (r < s) {
                  a.push(s - r);
                  break;
                }
                if (((r -= s), 0 === a.length)) break;
                (t.pos += s), (s = a.pop());
              }
              if (0 === a.length) {
                (i = s), (n = !0);
                break;
              }
              t.pos += o;
              continue;
            }
            l.can_open && a.push(o), (t.pos += o);
          }
        return n
          ? ((t.posMax = t.pos),
            (t.pos = c + i),
            e ||
              ((2 !== i && 3 !== i) || t.push({ type: 'strong_open', level: t.level++ }),
              (1 !== i && 3 !== i) || t.push({ type: 'em_open', level: t.level++ }),
              t.parser.tokenize(t),
              (1 !== i && 3 !== i) || t.push({ type: 'em_close', level: --t.level }),
              (2 !== i && 3 !== i) || t.push({ type: 'strong_close', level: --t.level })),
            (t.pos = t.posMax + i),
            (t.posMax = h),
            !0)
          : ((t.pos = c), !1);
      }
    ],
    [
      'sub',
      function(t, e) {
        var i,
          o,
          n = t.posMax,
          s = t.pos;
        if (126 !== t.src.charCodeAt(s)) return !1;
        if (e) return !1;
        if (s + 2 >= n) return !1;
        if (t.level >= t.options.maxNesting) return !1;
        for (t.pos = s + 1; t.pos < n; ) {
          if (126 === t.src.charCodeAt(t.pos)) {
            i = !0;
            break;
          }
          t.parser.skipToken(t);
        }
        return i && s + 1 !== t.pos
          ? (o = t.src.slice(s + 1, t.pos)).match(/(^|[^\\])(\\\\)*\s/)
            ? ((t.pos = s), !1)
            : ((t.posMax = t.pos),
              (t.pos = s + 1),
              e || t.push({ type: 'sub', level: t.level, content: o.replace(xa, '$1') }),
              (t.pos = t.posMax + 1),
              (t.posMax = n),
              !0)
          : ((t.pos = s), !1);
      }
    ],
    [
      'sup',
      function(t, e) {
        var i,
          o,
          n = t.posMax,
          s = t.pos;
        if (94 !== t.src.charCodeAt(s)) return !1;
        if (e) return !1;
        if (s + 2 >= n) return !1;
        if (t.level >= t.options.maxNesting) return !1;
        for (t.pos = s + 1; t.pos < n; ) {
          if (94 === t.src.charCodeAt(t.pos)) {
            i = !0;
            break;
          }
          t.parser.skipToken(t);
        }
        return i && s + 1 !== t.pos
          ? (o = t.src.slice(s + 1, t.pos)).match(/(^|[^\\])(\\\\)*\s/)
            ? ((t.pos = s), !1)
            : ((t.posMax = t.pos),
              (t.pos = s + 1),
              e || t.push({ type: 'sup', level: t.level, content: o.replace(wa, '$1') }),
              (t.pos = t.posMax + 1),
              (t.posMax = n),
              !0)
          : ((t.pos = s), !1);
      }
    ],
    [
      'links',
      function(t, e) {
        var i,
          o,
          n,
          s,
          r,
          a,
          l,
          h,
          c = !1,
          d = t.pos,
          u = t.posMax,
          p = t.pos,
          m = t.src.charCodeAt(p);
        if ((33 === m && ((c = !0), (m = t.src.charCodeAt(++p))), 91 !== m)) return !1;
        if (t.level >= t.options.maxNesting) return !1;
        if (((i = p + 1), (o = Br(t, p)) < 0)) return !1;
        if ((a = o + 1) < u && 40 === t.src.charCodeAt(a)) {
          for (a++; a < u && (32 === (h = t.src.charCodeAt(a)) || 10 === h); a++);
          if (a >= u) return !1;
          for (
            p = a, Ur(t, a) ? ((s = t.linkContent), (a = t.pos)) : (s = ''), p = a;
            a < u && (32 === (h = t.src.charCodeAt(a)) || 10 === h);
            a++
          );
          if (a < u && p !== a && Fr(t, a))
            for (
              r = t.linkContent, a = t.pos;
              a < u && (32 === (h = t.src.charCodeAt(a)) || 10 === h);
              a++
            );
          else r = '';
          if (a >= u || 41 !== t.src.charCodeAt(a)) return (t.pos = d), !1;
          a++;
        } else {
          if (t.linkLevel > 0) return !1;
          for (; a < u && (32 === (h = t.src.charCodeAt(a)) || 10 === h); a++);
          if (
            (a < u &&
              91 === t.src.charCodeAt(a) &&
              ((p = a + 1), (a = Br(t, a)) >= 0 ? (n = t.src.slice(p, a++)) : (a = p - 1)),
            n || (void 0 === n && (a = o + 1), (n = t.src.slice(i, o))),
            !(l = t.env.references[Zr(n)]))
          )
            return (t.pos = d), !1;
          (s = l.href), (r = l.title);
        }
        return (
          e ||
            ((t.pos = i),
            (t.posMax = o),
            c
              ? t.push({
                  type: 'image',
                  src: s,
                  title: r,
                  alt: t.src.substr(i, o - i),
                  level: t.level
                })
              : (t.push({ type: 'link_open', href: s, title: r, level: t.level++ }),
                t.linkLevel++,
                t.parser.tokenize(t),
                t.linkLevel--,
                t.push({ type: 'link_close', level: --t.level }))),
          (t.pos = a),
          (t.posMax = u),
          !0
        );
      }
    ],
    [
      'footnote_inline',
      function(t, e) {
        var i,
          o,
          n,
          s,
          r = t.posMax,
          a = t.pos;
        return (
          !(a + 2 >= r) &&
          (94 === t.src.charCodeAt(a) &&
            (91 === t.src.charCodeAt(a + 1) &&
              (!(t.level >= t.options.maxNesting) &&
                ((i = a + 2),
                !((o = Br(t, a + 1)) < 0) &&
                  (e ||
                    (t.env.footnotes || (t.env.footnotes = {}),
                    t.env.footnotes.list || (t.env.footnotes.list = []),
                    (n = t.env.footnotes.list.length),
                    (t.pos = i),
                    (t.posMax = o),
                    t.push({ type: 'footnote_ref', id: n, level: t.level }),
                    t.linkLevel++,
                    (s = t.tokens.length),
                    t.parser.tokenize(t),
                    (t.env.footnotes.list[n] = { tokens: t.tokens.splice(s) }),
                    t.linkLevel--),
                  (t.pos = o + 1),
                  (t.posMax = r),
                  !0)))))
        );
      }
    ],
    [
      'footnote_ref',
      function(t, e) {
        var i,
          o,
          n,
          s,
          r = t.posMax,
          a = t.pos;
        if (a + 3 > r) return !1;
        if (!t.env.footnotes || !t.env.footnotes.refs) return !1;
        if (91 !== t.src.charCodeAt(a)) return !1;
        if (94 !== t.src.charCodeAt(a + 1)) return !1;
        if (t.level >= t.options.maxNesting) return !1;
        for (o = a + 2; o < r; o++) {
          if (32 === t.src.charCodeAt(o)) return !1;
          if (10 === t.src.charCodeAt(o)) return !1;
          if (93 === t.src.charCodeAt(o)) break;
        }
        return (
          o !== a + 2 &&
          (!(o >= r) &&
            (o++,
            (i = t.src.slice(a + 2, o - 1)),
            void 0 !== t.env.footnotes.refs[':' + i] &&
              (e ||
                (t.env.footnotes.list || (t.env.footnotes.list = []),
                t.env.footnotes.refs[':' + i] < 0
                  ? ((n = t.env.footnotes.list.length),
                    (t.env.footnotes.list[n] = { label: i, count: 0 }),
                    (t.env.footnotes.refs[':' + i] = n))
                  : (n = t.env.footnotes.refs[':' + i]),
                (s = t.env.footnotes.list[n].count),
                t.env.footnotes.list[n].count++,
                t.push({ type: 'footnote_ref', id: n, subId: s, level: t.level })),
              (t.pos = o),
              (t.posMax = r),
              !0)))
        );
      }
    ],
    [
      'autolink',
      function(t, e) {
        var i,
          o,
          n,
          s,
          r,
          a = t.pos;
        return (
          60 === t.src.charCodeAt(a) &&
          (!((i = t.src.slice(a)).indexOf('>') < 0) &&
            ((o = i.match(Ca))
              ? !(ka.indexOf(o[1].toLowerCase()) < 0) &&
                ((r = qr((s = o[0].slice(1, -1)))),
                !!t.parser.validateLink(s) &&
                  (e ||
                    (t.push({ type: 'link_open', href: r, level: t.level }),
                    t.push({ type: 'text', content: s, level: t.level + 1 }),
                    t.push({ type: 'link_close', level: t.level })),
                  (t.pos += o[0].length),
                  !0))
              : !!(n = i.match(Aa)) &&
                ((r = qr('mailto:' + (s = n[0].slice(1, -1)))),
                !!t.parser.validateLink(r) &&
                  (e ||
                    (t.push({ type: 'link_open', href: r, level: t.level }),
                    t.push({ type: 'text', content: s, level: t.level + 1 }),
                    t.push({ type: 'link_close', level: t.level })),
                  (t.pos += n[0].length),
                  !0))))
        );
      }
    ],
    [
      'htmltag',
      function(t, e) {
        var i,
          o,
          n,
          s = t.pos;
        return (
          !!t.options.html &&
          ((n = t.posMax),
          !(60 !== t.src.charCodeAt(s) || s + 2 >= n) &&
            (!(
              33 !== (i = t.src.charCodeAt(s + 1)) &&
              63 !== i &&
              47 !== i &&
              !(function(t) {
                var e = 32 | t;
                return e >= 97 && e <= 122;
              })(i)
            ) &&
              (!!(o = t.src.slice(s).match(Oa)) &&
                (e ||
                  t.push({
                    type: 'htmltag',
                    content: t.src.slice(s, s + o[0].length),
                    level: t.level
                  }),
                (t.pos += o[0].length),
                !0))))
        );
      }
    ],
    [
      'entity',
      function(t, e) {
        var i,
          o,
          n = t.pos,
          s = t.posMax;
        if (38 !== t.src.charCodeAt(n)) return !1;
        if (n + 1 < s)
          if (35 === t.src.charCodeAt(n + 1)) {
            if ((o = t.src.slice(n).match(Ma)))
              return (
                e ||
                  ((i =
                    'x' === o[1][0].toLowerCase()
                      ? parseInt(o[1].slice(1), 16)
                      : parseInt(o[1], 10)),
                  (t.pending += xr(i) ? wr(i) : wr(65533))),
                (t.pos += o[0].length),
                !0
              );
          } else if ((o = t.src.slice(n).match(La))) {
            var r = fr(o[1]);
            if (o[1] !== r) return e || (t.pending += r), (t.pos += o[0].length), !0;
          }
        return e || (t.pending += '&'), t.pos++, !0;
      }
    ]
  ];
  function Pa() {
    this.ruler = new Ir();
    for (var t = 0; t < za.length; t++) this.ruler.push(za[t][0], za[t][1]);
    this.validateLink = Da;
  }
  function Da(t) {
    var e = t.trim().toLowerCase();
    return (
      -1 === (e = Sr(e)).indexOf(':') ||
      -1 === ['vbscript', 'javascript', 'file', 'data'].indexOf(e.split(':')[0])
    );
  }
  (Pa.prototype.skipToken = function(t) {
    var e,
      i,
      o = this.ruler.getRules(''),
      n = o.length,
      s = t.pos;
    if ((i = t.cacheGet(s)) > 0) t.pos = i;
    else {
      for (e = 0; e < n; e++) if (o[e](t, !0)) return void t.cacheSet(s, t.pos);
      t.pos++, t.cacheSet(s, t.pos);
    }
  }),
    (Pa.prototype.tokenize = function(t) {
      for (var e, i, o = this.ruler.getRules(''), n = o.length, s = t.posMax; t.pos < s; ) {
        for (i = 0; i < n && !(e = o[i](t, !1)); i++);
        if (e) {
          if (t.pos >= s) break;
        } else t.pending += t.src[t.pos++];
      }
      t.pending && t.pushPending();
    }),
    (Pa.prototype.parse = function(t, e, i, o) {
      var n = new Nr(t, this, e, i, o);
      this.tokenize(n);
    });
  var Ia = {
    default: {
      options: {
        html: !1,
        xhtmlOut: !1,
        breaks: !1,
        langPrefix: 'language-',
        linkTarget: '',
        typographer: !1,
        quotes: '“”‘’',
        highlight: null,
        maxNesting: 20
      },
      components: {
        core: {
          rules: [
            'block',
            'inline',
            'references',
            'replacements',
            'smartquotes',
            'references',
            'abbr2',
            'footnote_tail'
          ]
        },
        block: {
          rules: [
            'blockquote',
            'code',
            'fences',
            'footnote',
            'heading',
            'hr',
            'htmlblock',
            'lheading',
            'list',
            'paragraph',
            'table'
          ]
        },
        inline: {
          rules: [
            'autolink',
            'backticks',
            'del',
            'emphasis',
            'entity',
            'escape',
            'footnote_ref',
            'htmltag',
            'links',
            'newline',
            'text'
          ]
        }
      }
    },
    full: {
      options: {
        html: !1,
        xhtmlOut: !1,
        breaks: !1,
        langPrefix: 'language-',
        linkTarget: '',
        typographer: !1,
        quotes: '“”‘’',
        highlight: null,
        maxNesting: 20
      },
      components: { core: {}, block: {}, inline: {} }
    },
    commonmark: {
      options: {
        html: !0,
        xhtmlOut: !0,
        breaks: !1,
        langPrefix: 'language-',
        linkTarget: '',
        typographer: !1,
        quotes: '“”‘’',
        highlight: null,
        maxNesting: 20
      },
      components: {
        core: { rules: ['block', 'inline', 'references', 'abbr2'] },
        block: {
          rules: [
            'blockquote',
            'code',
            'fences',
            'heading',
            'hr',
            'htmlblock',
            'lheading',
            'list',
            'paragraph'
          ]
        },
        inline: {
          rules: [
            'autolink',
            'backticks',
            'emphasis',
            'entity',
            'escape',
            'htmltag',
            'links',
            'newline',
            'text'
          ]
        }
      }
    }
  };
  function Na(t, e, i) {
    (this.src = e),
      (this.env = i),
      (this.options = t.options),
      (this.tokens = []),
      (this.inlineMode = !1),
      (this.inline = t.inline),
      (this.block = t.block),
      (this.renderer = t.renderer),
      (this.typographer = t.typographer);
  }
  function Ba(t, e) {
    'string' != typeof t && ((e = t), (t = 'default')),
      e &&
        null != e.linkify &&
        console.warn(
          "linkify option is removed. Use linkify plugin instead:\n\nimport Remarkable from 'remarkable';\nimport linkify from 'remarkable/linkify';\nnew Remarkable().use(linkify)\n"
        ),
      (this.inline = new Pa()),
      (this.block = new ua()),
      (this.core = new ia()),
      (this.renderer = new Dr()),
      (this.ruler = new Ir()),
      (this.options = {}),
      this.configure(Ia[t]),
      this.set(e || {});
  }
  (Ba.prototype.set = function(t) {
    br(this.options, t);
  }),
    (Ba.prototype.configure = function(t) {
      var e = this;
      if (!t) throw new Error('Wrong `remarkable` preset, check name/content');
      t.options && e.set(t.options),
        t.components &&
          Object.keys(t.components).forEach(function(i) {
            t.components[i].rules && e[i].ruler.enable(t.components[i].rules, !0);
          });
    }),
    (Ba.prototype.use = function(t, e) {
      return t(this, e), this;
    }),
    (Ba.prototype.parse = function(t, e) {
      var i = new Na(this, t, e);
      return this.core.process(i), i.tokens;
    }),
    (Ba.prototype.render = function(t, e) {
      return (e = e || {}), this.renderer.render(this.parse(t, e), this.options, e);
    }),
    (Ba.prototype.parseInline = function(t, e) {
      var i = new Na(this, t, e);
      return (i.inlineMode = !0), this.core.process(i), i.tokens;
    }),
    (Ba.prototype.renderInline = function(t, e) {
      return (e = e || {}), this.renderer.render(this.parseInline(t, e), this.options, e);
    });
  const Ra = new Ba(),
    qa = new pr('@', ['contact', 'fields', 'globals', 'urns']),
    Ua = new pr('@', [
      'contact',
      'fields',
      'globals',
      'urns',
      'results',
      'input',
      'run',
      'child',
      'parent',
      'node',
      'webhook',
      'ticket',
      'trigger',
      'resume'
    ]);
  const Fa = we(
      class extends ke {
        constructor(t) {
          if ((super(t), t.type !== xe))
            throw new Error('renderMarkdown only supports child expressions');
        }
        update(t, [e]) {
          return this.render(e);
        }
        render(t) {
          return void 0 === this.value && (this.value = t), j`${hr(Ra.render(this.value))}`;
        }
      }
    ),
    Za = (t, e) => {
      if (t.signature) {
        const i = t.signature.indexOf('('),
          o = t.signature.substr(0, i),
          n = t.signature.substr(i);
        return j`
      <div style="${e ? 'font-weight: 400' : ''}">
        <div style="display:inline-block;margin-right: 5px">ƒ</div>
        <div style="display:inline-block">${o}</div>
        ${
          e
            ? j`
              <div
                style="display:inline-block; font-weight: 300; font-size: 85%"
              >
                ${n}
              </div>
              <div class="detail">${Fa(t.summary)}</div>
            `
            : null
        }
      </div>
    `;
      }
      return j`
    <div>
      <div style="${e ? 'font-weight: 400' : ''}">${t.name}</div>
      ${e ? j` <div style="font-size: 85%">${t.summary}</div> ` : null}
    </div>
  `;
    },
    ja = (t, e) =>
      e ? t.filter(t => !!t.signature && 0 === t.signature.indexOf((e || '').toLowerCase())) : t,
    Ha = (t, e, i = {}, o) => {
      const n = (e || '').split('.');
      let s = o ? t.root : t.root_no_session;
      if (!s) return [];
      let r = '',
        a = '';
      for (; n.length > 0; )
        if (((a = n.shift()), a)) {
          const e = s.find(t => t.key === a);
          if (!e) {
            s = s.filter(t => t.key.startsWith(a.toLowerCase()));
            break;
          }
          {
            const o = t.types.find(t => t.name === e.type);
            if (o && o.properties) (s = o.properties), (r += a + '.');
            else {
              if (!o || !o.property_template) {
                s = s.filter(t => t.key.startsWith(a.toLowerCase()));
                break;
              }
              {
                r += a + '.';
                const t = o.property_template;
                s = i[o.name]
                  ? i[o.name].map(e => ({
                      key: t.key.replace('{key}', e),
                      help: t.help.replace('{key}', e),
                      type: t.type
                    }))
                  : [];
              }
            }
          }
        }
      return s.map(t => ({
        name: '__default__' === t.key ? r.substr(0, r.length - 1) : r + t.key,
        summary: t.help
      }));
    },
    Va = (t, e) => {
      const { offsetLeft: i, offsetTop: o } = t,
        n = document.createElement('div'),
        s = getComputedStyle(t);
      for (const t of s) n.style[t] = s[t];
      n.style.position = 'relative';
      const r = 'INPUT' === t.tagName ? t.value.replace(/ /g, '.') : t.value,
        a = r.substr(0, e);
      (n.textContent = a),
        'TEXTAREA' === t.tagName && (n.style.height = 'auto'),
        'INPUT' === t.tagName && (n.style.width = 'auto');
      const l = document.createElement('span');
      (l.textContent = r.substr(e) || '.'), n.appendChild(l), document.body.appendChild(n);
      const { offsetLeft: h, offsetTop: c } = l;
      return document.body.removeChild(n), { left: i + h, top: o + c };
    },
    Wa = (t, e, i) => {
      let o = '';
      o = i.signature ? i.signature.substr(0, i.signature.indexOf('(') + 1) : i.name;
      const n = t.length;
      if (e) {
        const t = e.value,
          i = e.selectionStart - n,
          s = t.substr(0, i),
          r = t.substr(i + n),
          a = s.length + o.length;
        (e.value = s + o + r), e.setSelectionRange(a, a);
        const l = Va(e, a);
        l.left > e.width && (e.scrollLeft = l.left), e.dispatchEvent(new Event('input'));
      }
    },
    Ga = (t, e, i) => {
      const o = { currentFunction: null, options: [], anchorPosition: null, query: null };
      if (!t) return;
      if (!e) return o;
      const n = t.selectionStart,
        s = t.value.substring(0, n),
        r = i ? Ua : qa,
        a = r
          .findExpressions(s)
          .find(t => t.start <= n && (t.end > n || (t.end === n && !t.closed)));
      if (a) {
        const n = a.text.indexOf('(') > -1;
        if (n) {
          const t = r.functionContext(a.text);
          if (t) {
            const i = ja(e.getFunctions(), t);
            i.length > 0 && (o.currentFunction = i[0]);
          }
        }
        for (let s = a.text.length; s >= 0; s--) {
          const r = a.text[s];
          if ('@' === r || '(' === r || ' ' === r || ',' === r || ')' === r || 0 === s) {
            ('(' !== r && ' ' !== r && ',' !== r && ')' !== r && '@' !== r) || s++;
            const l = Va(t, a.start + s);
            return (
              (o.anchorPosition = { left: l.left - 2 - t.scrollLeft, top: l.top - t.scrollTop }),
              (o.query = a.text.substr(s, a.text.length - s)),
              (o.options = [
                ...Ha(e.getCompletionSchema(), o.query, e.getKeyedAssets(), i),
                ...(n ? ja(e.getFunctions(), o.query) : [])
              ]),
              o
            );
          }
        }
      } else (o.options = []), (o.query = '');
      return o;
    };
  class Qa extends fe {
    constructor() {
      super(...arguments),
        (this.hiddenInputs = []),
        (this.multi = !1),
        (this.searchOnFocus = !1),
        (this.placeholder = ''),
        (this.name = ''),
        (this.nameKey = 'name'),
        (this.valueKey = 'value'),
        (this.queryParam = null),
        (this.input = ''),
        (this.visibleOptions = []),
        (this.completionOptions = []),
        (this.quietMillis = 0),
        (this.searchable = !1),
        (this.cache = !0),
        (this.cacheKey = ''),
        (this.focused = !1),
        (this.disabled = !1),
        (this.selectedIndex = -1),
        (this.anchorPosition = { left: 0, top: 0 }),
        (this.tags = !1),
        (this.flavor = 'default'),
        (this.infoText = ''),
        (this.values = []),
        (this.getName = t => t[this.nameKey || 'name']),
        (this.isMatch = (t, e) => (this.getName(t) || '').toLowerCase().indexOf(e) > -1),
        (this.getValue = t => t[this.valueKey || 'value'] || t.id),
        (this.renderOptionDetail = () => j``),
        (this.renderSelectedItem = this.renderSelectedItemDefault),
        (this.createArbitraryOption = this.createArbitraryOptionDefault),
        (this.getOptions = this.getOptionsDefault),
        (this.isComplete = this.isCompleteDefault),
        (this.staticOptions = []),
        (this.next = null),
        (this.lruCache = Pe(20, 6e4)),
        (this.getNameInternal = t => this.getName(t));
    }
    static get styles() {
      return r`
      :host {
        font-family: var(--font-family);
        transition: all ease-in-out var(--transition-speed);
        display: inline;
        line-height: normal;
        outline: none;
        position: relative;
        --icon-color: var(--color-text-dark-secondary);
      }

      temba-options {
        --temba-options-font-size: var(--temba-select-selected-font-size);
        --icon-color: var(--color-text-dark);
      }

      :host:focus {
        outline: none;
      }

      #anchor {
        position: absolute;
        visibility: hidden;
        width: 250px;
        height: 25px;
      }

      .remove-item {
        cursor: pointer;
        display: inline-block;
        padding: 3px 6px;
        border-right: 1px solid rgba(100, 100, 100, 0.2);
        margin: 0;
        background: rgba(100, 100, 100, 0.05);
      }

      .selected-item.multi .remove-item {
        display: none;
      }

      .remove-item:hover {
        background: rgba(100, 100, 100, 0.1);
      }

      input:focus {
        outline: none;
        box-shadow: none;
        cursor: text;
      }

      .wrapper-bg {
        background: #f3f3f3;
        box-shadow: inset 0px 0px 4px rgb(0 0 0 / 10%);
        border-radius: var(--curvature-widget);
      }

      .select-container {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        align-items: center;
        border: 1px solid var(--color-widget-border);
        transition: all ease-in-out var(--transition-speed);
        cursor: pointer;
        border-radius: var(--curvature-widget);
        background: var(--color-widget-bg);
        padding-top: 1px;
        box-shadow: var(--widget-box-shadow);
        position: relative;
      }

      temba-icon.select-open:hover,
      .clear-button:hover {
        --icon-color: var(--color-text-dark);
      }

      .select-container:focus {
        outline: none;
      }

      .select-container.multi {
        /* background: var(--color-widget-bg); */
      }

      .select-container.focused {
        background: var(--color-widget-bg-focused);
        border-color: var(--color-focus);
        box-shadow: var(--widget-box-shadow-focused);
      }

      .left-side {
        flex: 1;
        overflow: hidden;
      }

      .empty .placeholder {
        display: block;
      }

      .selected {
        display: flex;
        flex-direction: row;
        align-items: stretch;
        user-select: none;
        padding: var(--temba-select-selected-padding);
      }

      .searchable .selected {
        padding: 4px !important;
      }

      .multi .selected {
        flex-wrap: wrap;
        padding: 4px;
      }

      .multi.empty .selected {
        padding: var(--temba-select-selected-padding);
      }

      .selected .selected-item {
        display: flex;
        overflow: hidden;
        color: var(--color-widget-text);
        line-height: var(--temba-select-selected-line-height);
        --icon-color: var(--color-text-dark);
      }

      .multi .selected .selected-item {
        vertical-align: middle;
        background: rgba(100, 100, 100, 0.1);
        user-select: none;
        border-radius: 2px;
        align-items: stretch;
        flex-direction: row;
        flex-wrap: nowrap;
        margin: 2px 2px;
      }

      .selected-item .option-name {
        padding: 0px;
        font-size: var(--temba-select-selected-font-size);
        align-self: center;
      }

      .multi .selected-item .option-name {
        flex: 1 1 auto;
        align-self: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 12px;
        padding: 2px 8px;
      }

      .multi .selected .selected-item.focused {
        background: rgba(100, 100, 100, 0.3);
      }

      input {
        font-size: 13px;
        width: 0px;
        cursor: pointer;
        background: none;
        resize: none;
        border: none !important;
        visibility: visible;
        line-height: inherit !important;
        height: var(--search-input-height) !important;
        margin: 0px !important;
        padding: 0px !important;
        box-shadow: none !important;
        font-family: var(--font-family);
        caret-color: var(--input-caret);
      }

      input:focus {
        box-shadow: none !important;
      }

      .searchable.no-search-input .input-wrapper {
        flex-grow: inherit;
        min-width: 1px;
      }

      .searchable.no-search-input.empty .input-wrapper {
        flex-grow: 1;
        min-width: 1px;
      }

      .searchable.no-search-input .input-wrapper .searchbox {
        flex-grow: inherit;
        min-width: 1px;
      }

      .searchable .input-wrapper .searchbox {
        flex-grow: 1;
        min-width: 80%;
        height: 100%;
      }

      .searchable.single.search-input .selected .selected-item {
        display: none;
      }

      .searchable.single.no-search-input
        .selected
        .input-wrapper
        input.searchbox {
        padding: 6px 2px !important;
      }

      .searchable.single.no-search-input.empty
        .selected
        .input-wrapper
        input.searchbox {
        padding: 6px 6px !important;
      }

      .empty input {
        width: 100%;
      }

      .searchable input {
        padding: 6px 4px !important;
      }

      .searchable input {
        visibility: visible;
        cursor: pointer;
        background: none;
        color: var(--color-text);
        resize: none;
        box-shadow: none !important;
        flex-grow: 1;
        border: none;
        caret-color: var(--input-caret);
      }

      .searchable input:focus {
        box-shadow: none !important;
      }

      .input-wrapper {
        flex-grow: 1;
      }

      .input-wrapper .searchbox {
      }

      .searchbox {
        border: 0px;
      }

      .searchbox::placeholder {
        color: var(--color-placeholder);
        font-size: 1em;
        line-height: var(--temba-select-selected-line-height);
        padding-left: 1px;
      }

      .placeholder {
        font-size: var(--temba-select-selected-font-size);
        color: var(--color-placeholder);
        display: none;
        line-height: var(--temba-select-selected-line-height);
      }

      .footer {
        padding: 5px 10px;
        background: var(--color-primary-light);
        color: rgba(0, 0, 0, 0.5);
        font-size: 80%;
        border-bottom-left-radius: var(--curvature-widget);
        border-bottom-right-radius: var(--curvature-widget);
      }

      .small {
        --temba-select-selected-padding: 7px;
        --temba-select-selected-line-height: 13px;
        --temba-select-selected-font-size: 12px;
        --search-input-height: 7px !important;
      }

      .info-text {
        opacity: 1;
        transition: padding-top var(--transition-speed) ease-in-out,
          padding-bottom var(--transition-speed) ease-in-out;
        margin-bottom: 16px;
        padding: 0.5em 1em;
        border-radius: var(--curvature);
        font-size: 0.9em;
        color: rgba(0, 0, 0, 0.5);
        position: relative;
      }

      .info-text.focused {
        opacity: 1;
      }

      .info-text.hide {
        opacity: 0;
        max-height: 0;
        margin-bottom: 0px;
        pointer-events: none;
        padding: 0px;
      }
    `;
    }
    handleSlotChange() {
      if (0 === this.staticOptions.length)
        for (const t of this.children)
          if ('TEMBA-OPTION' === t.tagName) {
            const e = {};
            for (const i of t.attributes) e[i.name] = i.value;
            e &&
              (this.staticOptions.push(e),
              (null === t.getAttribute('selected') && this.getValue(e) != this.value) ||
                (null !== this.getAttribute('multi') ? this.addValue(e) : this.setValues([e])));
          }
      this.checkSelectedOption(),
        this.searchable && 0 === this.staticOptions.length && (this.quietMillis = 200);
    }
    checkSelectedOption() {
      if (0 === this.values.length && (!this.placeholder || this.value))
        if (0 == this.staticOptions.length && this.endpoint) {
          const t = this.value;
          Wt(this.endpoint).then(e => {
            if (e && e.length > 0) {
              if (t) {
                const i = e.find(e => this.getValue(e) === t);
                if (i) return void this.setValues([i]);
              }
              this.setValues([e[0]]);
            }
          });
        } else
          this.staticOptions.length > 0 &&
            (null !== this.getAttribute('multi')
              ? this.addValue(this.staticOptions[0])
              : this.setValues([this.staticOptions[0]]));
    }
    firstUpdated(t) {
      super.firstUpdated(t),
        (this.anchorElement = this.shadowRoot.querySelector('.select-container')),
        (this.anchorExpressions = this.shadowRoot.querySelector('#anchor')),
        this.shadowRoot.addEventListener('slotchange', this.handleSlotChange.bind(this)),
        this.checkSelectedOption();
    }
    updated(t) {
      super.updated(t),
        t.has('values') &&
          (this.updateInputs(),
          (this.multi ||
            1 === this.values.length ||
            (0 == this.values.length && t.get('values') && t.get('values').length > 0)) &&
            this.fireEvent('change')),
        t.has('cacheKey') && this.lruCache.clear(),
        t.has('input') &&
          !t.has('values') &&
          !t.has('options') &&
          this.focused &&
          (this.lastQuery && window.clearTimeout(this.lastQuery),
          (this.lastQuery = window.setTimeout(() => {
            this.expressions && this.input.indexOf('@') > -1
              ? this.fetchExpressions()
              : this.fetchOptions(this.input);
          }, this.quietMillis))),
        this.endpoint &&
          t.has('fetching') &&
          (this.fetching || this.isPastFetchThreshold() || this.fireCustomEvent(Me.FetchComplete)),
        (t.has('cursorIndex') || t.has('visibleOptions')) &&
          this.endpoint &&
          !this.fetching &&
          this.isPastFetchThreshold() &&
          this.fetchOptions(this.query, this.page + 1),
        t.has('value') && this.value && !this.values.length && this.setSelectedValue(this.value),
        0 === this.values.length &&
          !this.placeholder &&
          this.staticOptions.length > 0 &&
          this.setValues([this.staticOptions[0]]);
    }
    setSelectedValue(t) {
      if (this.staticOptions.length > 0) {
        const e = this.staticOptions.find(e => this.getValue(e) === t);
        e && this.setValues([e]);
      }
    }
    updateInputs() {
      for (let t = null; (t = this.hiddenInputs.pop()); ) t.remove();
      if (0 === this.values.length) this.value = null;
      else {
        const t = this.getAttribute('name');
        t &&
          (this.multi || 1 !== this.values.length
            ? this.inputRoot.parentElement &&
              this.values.forEach(e => {
                const i = document.createElement('input');
                i.setAttribute('type', 'hidden'),
                  i.setAttribute('name', t),
                  i.setAttribute('value', this.serializeValue(e)),
                  this.hiddenInputs.push(i),
                  this.inputRoot.parentElement.appendChild(i);
              })
            : ((this.selection = this.values[0]),
              (this.value = this.serializeValue(this.values[0]))));
      }
    }
    setSelectedOption(t) {
      this.multi ? this.addValue(t) : this.setValues([t]),
        (this.multi && this.searchable) || (this.blur(), (this.focused = !1)),
        (this.visibleOptions = []),
        (this.input = ''),
        (this.next = null),
        (this.complete = !0),
        (this.selectedIndex = -1);
    }
    isPastFetchThreshold() {
      return (
        (this.visibleOptions.length > 0 || this.next) &&
        !this.complete &&
        (this.cursorIndex || 0) > this.visibleOptions.length - 20
      );
    }
    handleOptionSelection(t) {
      const e = t.detail.selected;
      e.post && this.endpoint
        ? Yt(this.endpoint, e).then(t => {
            t.status >= 200 && t.status < 300
              ? (this.setSelectedOption(t.json), (this.lruCache = Pe(20, 6e4)))
              : this.blur();
          })
        : this.setSelectedOption(e);
    }
    handleExpressionSelection(t) {
      const e = t.detail.selected,
        i = t.detail.tabbed,
        o = this.shadowRoot.querySelector('.searchbox');
      Wa(this.query, o, e),
        (this.query = ''),
        (this.completionOptions = []),
        i ? this.fetchExpressions() : -1 === this.input.indexOf('(') && this.addInputAsValue();
    }
    getOptionsDefault(t) {
      return t.json.results;
    }
    isCompleteDefault(t, e) {
      const i = e.json;
      return !i.more && !i.next;
    }
    handleRemoveSelection(t) {
      this.removeValue(t), (this.visibleOptions = []);
    }
    createArbitraryOptionDefault() {
      return null;
    }
    open() {
      this.requestUpdate('input');
    }
    isOpen() {
      return this.visibleOptions.length > 0;
    }
    setOptions(t) {
      this.staticOptions = t;
    }
    setVisibleOptions(t) {
      if (
        ((t = t.filter(
          t => !!this.getNameInternal(t) && (!this.shouldExclude || !this.shouldExclude(t))
        )),
        this.input)
      ) {
        if (this.searchable && !this.queryParam) {
          const e = this.input.trim().toLowerCase();
          t = t.filter(t => this.isMatch(t, e));
        }
        const e = this.createArbitraryOption(this.input, t);
        if (e) {
          e.arbitrary = !0;
          t.find(t => this.getValue(t) === this.getValue(e)) ||
            (t.length > 0 && t[0].arbitrary ? (t[0] = e) : t.unshift(e));
        }
      }
      this.values.length > 0 &&
        (this.multi
          ? (t = t.filter(t => !this.values.find(e => this.getValue(e) === this.getValue(t))))
          : (this.input
              ? (this.cursorIndex = 0)
              : (this.cursorIndex = t.findIndex(
                  t => this.getValue(t) === this.getValue(this.values[0])
                )),
            this.requestUpdate('cursorIndex'))),
        this.sortFunction && t.sort(this.sortFunction),
        (this.visibleOptions = t),
        this.fireCustomEvent(Me.ContentChanged, { options: this.visibleOptions });
    }
    fetchExpressions() {
      const t = document.querySelector('temba-store');
      if (this.expressions && t) {
        const e = this.shadowRoot.querySelector('.searchbox'),
          i = Ga(e, t, 'session' === this.expressions);
        return (
          (this.query = i.query),
          (this.completionOptions = i.options),
          (this.visibleOptions = []),
          (this.anchorPosition = i.anchorPosition),
          void this.fireCustomEvent(Me.FetchComplete)
        );
      }
    }
    fetchOptions(t, e = 0) {
      if (((this.completionOptions = []), !this.fetching)) {
        this.fetching = !0;
        const i = [...this.staticOptions],
          o = (t || '').trim().toLowerCase();
        if (
          (this.tags &&
            o &&
            (i.find(t => this.getValue(t) && this.getValue(t).toLowerCase() === o) ||
              i.splice(0, 0, { name: t, value: t })),
          this.endpoint)
        ) {
          let n = this.endpoint;
          t &&
            this.queryParam &&
            (n.indexOf('?') > -1 ? (n += '&') : (n += '?'),
            (n += this.queryParam + '=' + encodeURIComponent(t))),
            e && (n.indexOf('?') > -1 ? (n += '&') : (n += '?'), (n += 'page=' + e)),
            this.next && (n = this.next);
          const s = this.lruCache.get(n);
          if (this.cache && !this.tags && s)
            return (
              0 !== e || this.next
                ? this.setVisibleOptions([...this.visibleOptions, ...s.options])
                : ((this.cursorIndex = 0), this.setVisibleOptions([...i, ...s.options])),
              (this.complete = s.complete),
              (this.next = s.next),
              void (this.fetching = !1)
            );
          this.searchable && !this.queryParam
            ? Wt(n).then(t => {
                this.cache &&
                  !this.tags &&
                  (this.lruCache.set(n, { options: t, complete: !0, next: null }),
                  (this.complete = !0),
                  (this.next = null),
                  this.setVisibleOptions([...i, ...t]),
                  (this.fetching = !1));
              })
            : jt(n)
                .then(s => {
                  const r = this.getOptions(s).filter(t => this.isMatch(t, o)),
                    a = s.json;
                  a.next && (this.next = a.next),
                    0 !== e || this.next
                      ? (r.length > 0 && this.setVisibleOptions([...this.visibleOptions, ...r]),
                        (this.complete = this.isComplete(r, s)))
                      : ((this.cursorIndex = 0),
                        this.setVisibleOptions([...i, ...r]),
                        (this.query = t),
                        (this.complete = this.isComplete(this.visibleOptions, s))),
                    this.cache &&
                      !this.tags &&
                      this.lruCache.set(n, {
                        options: r,
                        complete: this.complete,
                        next: this.next
                      }),
                    (this.fetching = !1),
                    (this.page = e);
                })
                .catch(t => {
                  (this.fetching = !1), console.error(t);
                });
        } else (this.fetching = !1), this.setVisibleOptions(i);
      }
    }
    handleFocus() {
      this.focused ||
        0 !== this.visibleOptions.length ||
        ((this.focused = !0),
        this.searchOnFocus && !this.removingSelection && this.requestUpdate('input'));
    }
    handleBlur() {
      (this.focused = !1),
        this.visibleOptions.length > 0 &&
          ((this.input = ''),
          (this.next = null),
          (this.complete = !0),
          (this.visibleOptions = []),
          (this.cursorIndex = 0));
    }
    handleClick() {
      (this.selectedIndex = -1), this.requestUpdate('input');
    }
    addInputAsValue() {
      const t = this.shadowRoot.querySelector('.searchbox'),
        e = { name: t.value, value: t.value, expression: !0 };
      this.multi
        ? this.values.find(
            t =>
              t.expression &&
              t.value &&
              e.value &&
              t.value.toLowerCase().trim() == e.value.toLowerCase().trim()
          ) || this.addValue(e)
        : this.setValues([e]),
        (this.input = ''),
        this.multi || this.blur();
    }
    handleKeyDown(t) {
      if (
        ('Enter' === t.key &&
          this.expressions &&
          0 === this.completionOptions.length &&
          this.input.indexOf('@') > -1 &&
          this.addInputAsValue(),
        ('Enter' === t.key || 'ArrowDown' === t.key || ('n' === t.key && t.ctrlKey)) &&
          0 === this.visibleOptions.length &&
          0 === this.completionOptions.length)
      )
        this.requestUpdate('input');
      else if (this.multi && 'Backspace' === t.key && !this.input) {
        if (this.visibleOptions.length > 0) return void (this.visibleOptions = []);
        -1 === this.selectedIndex
          ? ((this.selectedIndex = this.values.length - 1), (this.visibleOptions = []))
          : (this.popValue(), (this.selectedIndex = -1));
      } else this.selectedIndex = -1;
    }
    getStaticOptions() {
      return this.staticOptions;
    }
    handleInput(t) {
      const e = t.currentTarget;
      this.input = e.value;
    }
    handleCancel() {
      this.visibleOptions = [];
    }
    handleCursorChanged(t) {
      this.cursorIndex = t.detail.index;
    }
    handleContainerClick(t) {
      if (((this.focused = !0), 'INPUT' !== t.target.tagName)) {
        const e = this.shadowRoot.querySelector('input');
        if (e) return e.click(), void e.focus();
        this.visibleOptions.length > 0
          ? ((this.visibleOptions = []), t.preventDefault(), t.stopPropagation())
          : this.requestUpdate('input');
      }
    }
    getEventHandlers() {
      return [
        { event: Me.Canceled, method: this.handleCancel },
        { event: Me.CursorChanged, method: this.handleCursorChanged },
        { event: 'blur', method: this.handleBlur },
        { event: 'focus', method: this.handleFocus }
      ];
    }
    handleArrowClick(t) {
      this.visibleOptions.length > 0 &&
        ((this.visibleOptions = []), t.preventDefault(), t.stopPropagation());
    }
    renderSelectedItemDefault(t) {
      return t
        ? j`
      <div class="option-name" style="display:flex">
        ${
          t.icon
            ? j`<temba-icon
              name="${t.icon}"
              style="margin-right:0.5em;"
            ></temba-icon>`
            : null
        }<span>${this.getName(t)}</span>
      </div>
    `
        : null;
    }
    serializeValue(t) {
      return !this.jsonValue && (this.staticOptions.length > 0 || this.tags)
        ? t.value
        : super.serializeValue(t);
    }
    setSelection(t) {
      for (const e of this.staticOptions)
        if (this.getValue(e.value) === t)
          return void (
            (0 !== this.values.length && this.values[0].value === '' + t) ||
            this.setValues([e])
          );
    }
    handleClear(t) {
      t.preventDefault(), t.stopPropagation(), this.setValues([]);
    }
    setValues(t) {
      (this.values = t), this.requestUpdate('values');
    }
    addValue(t) {
      this.values.push(t), this.requestUpdate('values');
    }
    removeValue(t) {
      const e = this.values.indexOf(t);
      e > -1 && this.values.splice(e, 1), this.requestUpdate('values');
    }
    popValue() {
      this.values.pop(), this.requestUpdate('values');
    }
    clear() {
      (this.values = []), this.requestUpdate('values');
    }
    render() {
      const t = 0 === this.values.length ? this.placeholder : '',
        e = j`
      <div class="placeholder">${t}</div>
    `,
        i =
          this.clearable && this.values.length > 0 && !this.multi
            ? j`<temba-icon
            name="${ve.select_clear}"
            size="1.1"
            class="clear-button"
            @click=${this.handleClear}
          />`
            : null,
        o = Ht({
          multi: this.multi,
          single: !this.multi,
          searchable: this.searchable,
          empty: 0 === this.values.length,
          options: this.visibleOptions.length > 0,
          focused: this.focused,
          'search-input': this.input.length > 0,
          'no-search-input': 0 === this.input.length,
          [this.flavor]: null !== this.flavor,
          disabled: this.disabled
        }),
        n = this.anchorPosition ? { top: '0px', left: this.anchorPosition.left - 10 + 'px' } : {},
        s = this.searchable
          ? j`
          <div class="input-wrapper">
            <input
              class="searchbox"
              @input=${this.handleInput}
              @keydown=${this.handleKeyDown}
              @click=${this.handleClick}
              type="text"
              placeholder=${t}
              .value=${this.input}
            />
            <div id="anchor" style=${Se(n)}></div>
          </div>
        `
          : e;
      return j`
      <temba-field
        name=${this.name}
        .label=${this.label}
        .helpText=${this.helpText}
        .errors=${this.errors}
        .widgetOnly=${this.widgetOnly}
        .hideErrors=${this.hideErrors}
        ?disabled=${this.disabled}
      >
        <slot></slot>
        <div class="wrapper-bg">
        <div
          tabindex="0"
          class="select-container ${o}"
          @click=${this.handleContainerClick}
        >          
          <div class="left-side">
            <div class="selected">
              ${this.multi ? null : s}
              ${this.values.map(
                (t, e) => j`
                  <div
                    class="selected-item ${e === this.selectedIndex ? 'focused' : ''}"
                  >
                    ${
                      this.multi
                        ? j`
                          <div
                            class="remove-item"
                            style="margin-top:1px"
                            @mousedown=${() => {
                              this.removingSelection = !0;
                            }}
                            @mouseup=${() => {
                              this.removingSelection = !1;
                            }}
                            @click=${e => {
                              e.preventDefault(),
                                e.stopPropagation(),
                                this.handleRemoveSelection(t);
                            }}
                          >
                            <temba-icon
                              name="${ve.delete_small}"
                              size="1"
                            ></temba-icon>
                          </div>
                        `
                        : null
                    }
                    ${this.renderSelectedItem(t)}
                  </div>
                `
              )}
              ${this.multi ? s : null}
            </div>

          </div>

          ${i}

          <slot name="right"></slot>
          ${
            this.tags
              ? null
              : j`<div
                  class="right-side"
                  style="display:block;margin-right:5px"
                  @click=${this.handleArrowClick}
                >
                  <temba-icon
                    size="1.5"
                    name="${ve.select_open}"
                    class="select-open ${this.visibleOptions.length > 0 ? 'open' : ''}"
                  ></temba-icon>
                </div>`
          }
          </div>
          
        
        <div class="info-text ${this.infoText ? '' : 'hide'} ${this.focused ? 'focused' : ''}">${
        this.infoText
      }</div></div></div>

    
    <temba-options
    @temba-selection=${this.handleOptionSelection}
    .cursorIndex=${this.cursorIndex}
    .renderOptionDetail=${this.renderOptionDetail}
    .renderOptionName=${this.renderOptionName}
    .renderOption=${this.renderOption}
    .anchorTo=${this.anchorElement}
    .options=${this.visibleOptions}
    .spaceSelect=${this.spaceSelect}
    .nameKey=${this.nameKey}
    .getName=${this.getNameInternal}
    static-width=${this.optionWidth}
    ?anchor-right=${this.anchorRight}
    ?visible=${this.visibleOptions.length > 0}
    ></temba-options>

    <temba-options
    @temba-selection=${this.handleExpressionSelection}
    @temba-canceled=${() => {}}
    .anchorTo=${this.anchorExpressions}
    .options=${this.completionOptions}
    .renderOption=${Za}
    ?visible=${this.completionOptions.length > 0}
    >
      ${
        this.currentFunction
          ? j`
              <div class="current-fn">
                ${Za(this.currentFunction, !0)}
              </div>
            `
          : null
      }
      ${
        this.completionOptions.length > 0
          ? j`<div class="footer">
              ${ir('Tab to complete, enter to select')}
            </div>`
          : null
      }
    </temba-options>
  </temba-field>
  `;
    }
  }
  t([ge({ type: Boolean })], Qa.prototype, 'multi', void 0),
    t([ge({ type: Boolean })], Qa.prototype, 'searchOnFocus', void 0),
    t([ge({ type: String })], Qa.prototype, 'placeholder', void 0),
    t([ge()], Qa.prototype, 'name', void 0),
    t([ge()], Qa.prototype, 'endpoint', void 0),
    t([ge({ type: String })], Qa.prototype, 'nameKey', void 0),
    t([ge({ type: String })], Qa.prototype, 'valueKey', void 0),
    t([ge({ attribute: !1 })], Qa.prototype, 'currentFunction', void 0),
    t([ge({ type: String })], Qa.prototype, 'queryParam', void 0),
    t([ge({ type: String })], Qa.prototype, 'input', void 0),
    t([ge({ type: Array })], Qa.prototype, 'visibleOptions', void 0),
    t([ge({ type: Array })], Qa.prototype, 'completionOptions', void 0),
    t([ge({ type: Number })], Qa.prototype, 'quietMillis', void 0),
    t([ge({ type: Boolean })], Qa.prototype, 'fetching', void 0),
    t([ge({ type: Boolean })], Qa.prototype, 'searchable', void 0),
    t([ge({ type: String })], Qa.prototype, 'expressions', void 0),
    t([ge({ type: Boolean })], Qa.prototype, 'cache', void 0),
    t([ge({ type: String })], Qa.prototype, 'cacheKey', void 0),
    t([ge({ type: Boolean })], Qa.prototype, 'focused', void 0),
    t([ge({ type: Boolean })], Qa.prototype, 'disabled', void 0),
    t([ge({ attribute: !1 })], Qa.prototype, 'selectedIndex', void 0),
    t([ge({ type: Number })], Qa.prototype, 'cursorIndex', void 0),
    t([ge({ attribute: !1 })], Qa.prototype, 'anchorElement', void 0),
    t([ge({ attribute: !1 })], Qa.prototype, 'anchorExpressions', void 0),
    t([ge({ type: Object })], Qa.prototype, 'anchorPosition', void 0),
    t([ge({ type: Boolean })], Qa.prototype, 'tags', void 0),
    t([ge({ type: Boolean, attribute: 'space_select' })], Qa.prototype, 'spaceSelect', void 0),
    t([ge({ type: Boolean })], Qa.prototype, 'jsonValue', void 0),
    t([ge({ type: Boolean })], Qa.prototype, 'hideErrors', void 0),
    t([ge({ type: Boolean })], Qa.prototype, 'clearable', void 0),
    t([ge({ type: String })], Qa.prototype, 'flavor', void 0),
    t([ge({ type: String, attribute: 'info_text' })], Qa.prototype, 'infoText', void 0),
    t([ge({ type: Array })], Qa.prototype, 'values', void 0),
    t([ge({ type: Object })], Qa.prototype, 'selection', void 0),
    t([ge({ attribute: !1 })], Qa.prototype, 'getName', void 0),
    t([ge({ attribute: !1 })], Qa.prototype, 'isMatch', void 0),
    t([ge({ attribute: !1 })], Qa.prototype, 'getValue', void 0),
    t([ge({ type: Number, attribute: 'option-width' })], Qa.prototype, 'optionWidth', void 0),
    t([ge({ type: Boolean, attribute: 'anchor-right' })], Qa.prototype, 'anchorRight', void 0),
    t([ge({ attribute: !1 })], Qa.prototype, 'shouldExclude', void 0),
    t([ge({ attribute: !1 })], Qa.prototype, 'sortFunction', void 0),
    t([ge({ attribute: !1 })], Qa.prototype, 'renderOption', void 0),
    t([ge({ attribute: !1 })], Qa.prototype, 'renderOptionName', void 0),
    t([ge({ attribute: !1 })], Qa.prototype, 'renderOptionDetail', void 0),
    t([ge({ attribute: !1 })], Qa.prototype, 'renderSelectedItem', void 0),
    t([ge({ attribute: !1 })], Qa.prototype, 'createArbitraryOption', void 0),
    t([ge({ attribute: !1 })], Qa.prototype, 'getOptions', void 0),
    t([ge({ attribute: !1 })], Qa.prototype, 'isComplete', void 0),
    t([ge({ type: Array, attribute: 'options' })], Qa.prototype, 'staticOptions', void 0);
  class Ka extends fe {
    constructor() {
      super(...arguments),
        (this.submitOnEnter = !1),
        (this.anchorPosition = { left: 0, top: 0 }),
        (this.placeholder = ''),
        (this.options = []),
        (this.name = ''),
        (this.value = ''),
        (this.autogrow = !1);
    }
    static get styles() {
      return r`
      :host {
        display: block;
      }

      temba-options {
        --widget-box-shadow-focused: 0 0 4px rgba(0, 0, 0, 0.15);
        --color-focus: #e6e6e6;
      }

      .comp-container {
        position: relative;
        height: 100%;
      }

      #anchor {
        /* background: rgba(132, 40, 158, .1); */
        position: absolute;
        visibility: hidden;
        width: 250px;
        height: 20px;
      }

      .fn-marker {
        font-weight: bold;
        font-size: 42px;
      }

      .option-slot {
        background: #fff;
      }

      .current-fn {
        padding: 10px;
        margin: 5px;
        background: var(--color-primary-light);
        color: rgba(0, 0, 0, 0.5);
        border-radius: var(--curvature-widget);
        font-size: 90%;
      }

      .footer {
        padding: 5px 10px;
        background: var(--color-primary-light);
        color: rgba(0, 0, 0, 0.5);
        font-size: 80%;
        border-bottom-left-radius: var(--curvature-widget);
        border-bottom-right-radius: var(--curvature-widget);
      }

      code {
        background: rgba(0, 0, 0, 0.1);
        padding: 1px 5px;
        border-radius: var(--curvature);
      }
    `;
    }
    firstUpdated() {
      (this.textInputElement = this.shadowRoot.querySelector('temba-textinput')),
        (this.anchorElement = this.shadowRoot.querySelector('#anchor')),
        (this.hiddenElement = document.createElement('input')),
        this.hiddenElement.setAttribute('type', 'hidden'),
        this.hiddenElement.setAttribute('name', this.getAttribute('name')),
        this.hiddenElement.setAttribute('value', this.getAttribute('value') || ''),
        this.appendChild(this.hiddenElement);
    }
    handleKeyUp(t) {
      if (this.options && this.options.length > 0) {
        if ('ArrowUp' === t.key || 'ArrowDown' === t.key) return;
        if (t.ctrlKey && ('n' === t.key || 'p' === t.key)) return;
        if (
          'Enter' === t.key ||
          'Escape' === t.key ||
          'Tab' === t.key ||
          t.key.startsWith('Control')
        )
          return t.stopPropagation(), void t.preventDefault();
        this.executeQuery(t.currentTarget);
      }
    }
    hasVisibleOptions() {
      return this.options.length > 0;
    }
    executeQuery(t) {
      const e = document.querySelector('temba-store');
      if (!t.inputElement) return;
      const i = Ga(t.inputElement, e, this.session);
      (this.query = i.query), (this.options = i.options), (this.anchorPosition = i.anchorPosition);
    }
    handleClick(t) {
      this.executeQuery(t.currentTarget);
    }
    updated(t) {
      super.updated(t), t.has('value') && this.hiddenElement.setAttribute('value', this.value);
    }
    handleInput(t) {
      const e = t.currentTarget;
      this.executeQuery(e), (this.value = e.inputElement.value), this.fireEvent('change');
    }
    handleOptionCanceled() {
      window.setTimeout(() => {
        (this.options = []), (this.query = '');
      }, 100);
    }
    handleOptionSelection(t) {
      const e = t.detail.selected,
        i = t.detail.tabbed;
      Wa(this.query, this.textInputElement.inputElement, e),
        (this.query = ''),
        (this.options = []),
        i && this.executeQuery(this.textInputElement);
    }
    click() {
      super.click();
      const t = this.shadowRoot.querySelector('temba-textinput');
      t && t.click();
    }
    focus() {
      super.focus();
      const t = this.shadowRoot.querySelector('temba-textinput');
      t && t.focus();
    }
    render() {
      const t = this.anchorPosition
          ? { top: `${this.anchorPosition.top}px`, left: `${this.anchorPosition.left}px` }
          : {},
        e = this.options && this.options.length > 0;
      return j`
      <temba-field
        name=${this.name}
        .label=${this.label}
        .helpText=${this.helpText}
        .errors=${this.errors}
        .widgetOnly=${this.widgetOnly}
      >
        <div class="comp-container">
          <div id="anchor" style=${Se(t)}></div>
          <temba-textinput
            name=${this.name}
            placeholder=${this.placeholder}
            gsm=${this.gsm}
            counter=${ye(this.counter)}
            @keyup=${this.handleKeyUp}
            @click=${this.handleClick}
            @input=${this.handleInput}
            @blur=${this.handleOptionCanceled}
            maxlength="${ye(this.maxLength)}"
            .value=${this.value}
            ?autogrow=${this.autogrow}
            ?textarea=${this.textarea}
            ?submitOnEnter=${this.submitOnEnter}
          >
          </temba-textinput>
          <temba-options
            @temba-selection=${this.handleOptionSelection}
            @temba-canceled=${this.handleOptionCanceled}
            .renderOption=${Za}
            .anchorTo=${this.anchorElement}
            .options=${this.options}
            ?visible=${e}
          >
            ${
              this.currentFunction
                ? j`
                  <div class="current-fn">
                    ${Za(this.currentFunction, !0)}
                  </div>
                `
                : null
            }
            <div class="footer" style="${e ? null : 'display:none'}">
              ${ir('Tab to complete, enter to select')}
            </div>
          </temba-options>
        </div>
      </temba-field>
    `;
    }
  }
  t([ge({ type: Number })], Ka.prototype, 'maxLength', void 0),
    t([ge({ type: Boolean })], Ka.prototype, 'session', void 0),
    t([ge({ type: Boolean })], Ka.prototype, 'submitOnEnter', void 0),
    t([ge({ type: Object })], Ka.prototype, 'anchorPosition', void 0),
    t([ge({ attribute: !1 })], Ka.prototype, 'currentFunction', void 0),
    t([ge({ type: String })], Ka.prototype, 'placeholder', void 0),
    t([ge({ attribute: !1 })], Ka.prototype, 'textInputElement', void 0),
    t([ge({ attribute: !1 })], Ka.prototype, 'anchorElement', void 0),
    t([ge({ type: Array })], Ka.prototype, 'options', void 0),
    t([ge({ type: String })], Ka.prototype, 'name', void 0),
    t([ge({ type: String })], Ka.prototype, 'value', void 0),
    t([ge({ type: Boolean })], Ka.prototype, 'textarea', void 0),
    t([ge({ type: Boolean })], Ka.prototype, 'gsm', void 0),
    t([ge({ type: String })], Ka.prototype, 'counter', void 0),
    t([ge({ type: Boolean })], Ka.prototype, 'autogrow', void 0);
  class Ya extends ue {
    handleResize() {
      this.requestUpdate();
    }
    getEventHandlers() {
      return [{ event: 'resize', method: ee(this.handleResize, 50), isWindow: !0 }];
    }
  }
  var Ja;
  !(function(t) {
    (t.PRIMARY = 'primary'), (t.SECONDARY = 'secondary'), (t.DESTRUCTIVE = 'destructive');
  })(Ja || (Ja = {}));
  class Xa extends Ya {
    static get widths() {
      return { small: '400px', medium: '600px', large: '655px' };
    }
    static get styles() {
      return r`
      :host {
        position: absolute;
        z-index: 10000;
        font-family: var(--font-family);
        background: white;
      }

      .flex-grow {
        flex-grow: 1;
      }

      .flex {
        display: flex;
        flex-direction: column;
        width: 100%;
        position: relative;
        left: 0px;
        top: 0px;
        align-items: center;
        height: 100vh;
      }

      .mobile .flex {
        height: 100%;
        position: fixed;
      }

      .mobile .grow-top {
        flex-grow: 0;
      }

      .mobile .grow-bottom {
        flex-grow: 0;
      }

      .grow-top {
        flex-grow: 1;
      }

      .grow-bottom {
        flex-grow: 3;
      }

      .bottom-padding {
        padding: 3rem;
      }

      .dialog-mask {
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        opacity: 0;
        position: fixed;
        top: 0px;
        left: 0px;
        transition: opacity linear calc(var(--transition-speed) / 2ms);
        pointer-events: none;
      }

      .mobile.dialog-mask .dialog-container {
        border-radius: 0px;
      }

      .dialog-mask .dialog-container {
        position: relative;
        transition: transform var(--transition-speed) var(--bounce),
          opacity ease-in-out calc(var(--transition-speed) - 50ms);
        border-radius: var(--curvature);
        box-shadow: 0px 0px 2px 4px rgba(0, 0, 0, 0.06);
        overflow: hidden;
        transform: scale(0.9) translatey(2em);
        background: white;
        margin: auto;
        display: flex;
        flex-direction: column;
      }

      .dialog-body {
        background: #fff;
        overflow-y: auto;
        flex-grow: 1;
      }

      .dialog-mask.dialog-open {
        opacity: 1;
        pointer-events: auto;
      }

      .dialog-mask.dialog-open .dialog-container {
        top: inherit;
      }

      .dialog-mask.dialog-animation-end .dialog-container {
        transform: scale(1) !important;
      }

      .dialog-mask.dialog-ready .dialog-container {
        transform: none;
      }

      .dialog-mask.dialog-loading .dialog-container {
        margin-top: -10000px;
      }

      .header-text {
        display: flex;
        flex-direction: row;
        align-items: center;
        font-size: 20px;
        padding: 12px 20px;
        color: var(--header-text);
        background: var(--header-bg);
      }

      .header-text .title {
        flex-grow: 1;
      }

      .header-text .status {
        font-size: 0.6em;
        font-weight: bold;
      }

      .dialog-footer {
        background: var(--color-primary-light);
        padding: 10px;
        display: flex;
        flex-flow: row;
        align-items: center;
      }

      temba-button {
        margin-left: 10px;
      }

      .dialog-body temba-loading {
        position: absolute;
        right: 12px;
        margin-top: -30px;
        padding-bottom: 9px;
        display: none;
      }

      #page-loader {
        text-align: center;
        display: block;
        position: relative;
        opacity: 0;
        margin: auto;
        margin-top: 30px;
        width: 154px;
        transition: opacity calc(var(--transition-speed) * 5ms) ease-in
          calc(var(--transition-speed * 2));
        visibility: hidden;
      }

      .dialog-mask.dialog-loading #page-loader {
        opacity: 1;
        visibility: visible;
      }

      #submit-loader {
        flex-grow: 1;
        text-align: right;
      }
    `;
    }
    constructor() {
      super(),
        (this.size = 'medium'),
        (this.primaryButtonName = 'Ok'),
        (this.cancelButtonName = 'Cancel'),
        (this.width = null),
        (this.submittingName = 'Saving'),
        (this.buttons = []),
        (this.scrollOffset = 0);
    }
    firstUpdated(t) {
      t.has('cancelButtonName') &&
        this.cancelButtonName &&
        this.buttons.push({ name: this.cancelButtonName, type: Ja.SECONDARY, closes: !0 }),
        t.has('primaryButtonName') &&
          this.primaryButtonName &&
          this.buttons.push({ name: this.primaryButtonName, type: Ja.PRIMARY });
    }
    updated(t) {
      if (t.has('open')) {
        const e = document.querySelector('body');
        this.open
          ? ((this.animationEnd = !0),
            window.setTimeout(() => {
              (this.ready = !0), (this.animationEnd = !1);
            }, 400),
            (this.scrollOffset = -document.documentElement.scrollTop),
            (e.style.position = 'fixed'),
            (e.style.overflowY = 'scroll'),
            (e.style.top = this.scrollOffset + 'px'),
            (e.style.width = '100%'),
            (e.style.overflowY = 'hidden'))
          : ((e.style.position = ''),
            (e.style.overflowY = ''),
            (e.style.width = ''),
            (e.style.marginRight = ''),
            (e.style.paddingRight = '0px'),
            window.scrollTo(0, -1 * parseInt(this.scrollOffset || '0'))),
          this.open && !t.get('open')
            ? (this.shadowRoot.querySelectorAll('temba-button').forEach(t => {
                t && (t.submitting = !1);
              }),
              this.noFocus || this.focusFirstInput())
            : window.setTimeout(() => {
                this.ready = !1;
              }, 400);
      }
    }
    focusFirstInput() {
      window.setTimeout(() => {
        let t = this.querySelector(
          'temba-textinput, temba-completion, input[type="text"], textarea'
        );
        t &&
          ((t = t.textInputElement || t.inputElement || t), t.readOnly || (t.focus(), t.click()));
      }, 100);
    }
    handleClick(t) {
      const e = t.currentTarget;
      if (!e.disabled) {
        let t = {};
        e.index >= 0 && e.index < this.buttons.length && (t = this.buttons[e.index]),
          this.fireCustomEvent(Me.ButtonClicked, { button: e, detail: t }),
          (e.name === this.cancelButtonName || (t && t.closes)) && (this.open = !1);
      }
    }
    getDocumentHeight() {
      const t = document.body,
        e = document.documentElement;
      return Math.max(
        t.scrollHeight,
        t.offsetHeight,
        e.clientHeight,
        e.scrollHeight,
        e.offsetHeight
      );
    }
    clickCancel() {
      const t = this.getCancelButton();
      t && t.click();
    }
    getCancelButton() {
      return this.shadowRoot.querySelector(`temba-button[name='${this.cancelButtonName}']`);
    }
    getPrimaryButton() {
      return this.shadowRoot.querySelector('temba-button[primary]');
    }
    handleKeyUp(t) {
      'Escape' === t.key && this.clickCancel();
    }
    handleClickMask(t) {
      if (this.hideOnClick) {
        const e = t.target.id;
        ('dialog-mask' !== e && 'dialog-bg' !== e) ||
          (this.fireCustomEvent(Me.DialogHidden), this.clickCancel());
      }
    }
    show() {
      this.open = !0;
    }
    hide() {
      this.open = !1;
    }
    render() {
      const t = { width: this.width, minWidth: '250px', maxWidth: '600px' };
      this.width || (t.width = Xa.widths[this.size]),
        this.isMobile() && ((t.width = '100%'), (t.height = '100%'), delete t.maxWidth);
      const e = this.header
        ? j`
          <div class="dialog-header">
            <div class="header-text">
              <div class="title">${this.header}</div>
            </div>
          </div>
        `
        : null;
      return j`
      <div
        id="dialog-mask"
        @click=${this.handleClickMask}
        class="dialog-mask ${Ht({
          'dialog-open': this.open,
          'dialog-loading': this.loading,
          'dialog-animation-end': this.animationEnd,
          'dialog-ready': this.ready,
          mobile: this.isMobile()
        })}"
      >
        <div style="position: absolute; width: 100%;">
          <temba-loading
            id="page-loader"
            units="6"
            size="12"
            color="#ccc"
          ></temba-loading>
        </div>

        <div class="flex">
          <div class="grow-top" style="${this.isMobile() ? 'flex-grow:0' : ''}"></div>
          <div
            @keyup=${this.handleKeyUp}
            style=${Se(t)}
            class="dialog-container"
          >
            ${e}
            <div class="dialog-body" @keypress=${this.handleKeyUp}>
              ${this.body ? this.body : j`<slot></slot>`}
              <temba-loading units="6" size="8"></temba-loading>
            </div>

            <div class="dialog-footer">
              <div class="flex-grow">
                <slot name="gutter"></slot>
              </div>
              ${this.buttons.map(
                (t, e) => j`
                  <temba-button
                    name=${t.name}
                    ?destructive=${'primary' == t.type && this.destructive}
                    ?primary=${'primary' == t.type && !this.destructive}
                    ?secondary=${'secondary' == t.type}
                    ?submitting=${this.submitting}
                    ?disabled=${this.disabled && !t.closes}
                    index=${e}
                    @click=${this.handleClick}
                  ></temba-button>
                `
              )}
              </div>
            </div>
            <div class="grow-bottom"></div>
          </div>
        </div>
      </div>
    `;
    }
  }
  t([ge({ type: Boolean })], Xa.prototype, 'open', void 0),
    t([ge()], Xa.prototype, 'header', void 0),
    t([ge()], Xa.prototype, 'body', void 0),
    t([ge({ type: Boolean })], Xa.prototype, 'submitting', void 0),
    t([ge({ type: Boolean })], Xa.prototype, 'destructive', void 0),
    t([ge({ type: Boolean })], Xa.prototype, 'disabled', void 0),
    t([ge({ type: Boolean })], Xa.prototype, 'loading', void 0),
    t([ge({ type: Boolean })], Xa.prototype, 'hideOnClick', void 0),
    t([ge({ type: Boolean })], Xa.prototype, 'noFocus', void 0),
    t([ge()], Xa.prototype, 'size', void 0),
    t([ge({ type: String })], Xa.prototype, 'primaryButtonName', void 0),
    t([ge({ type: String })], Xa.prototype, 'cancelButtonName', void 0),
    t([ge({ type: String })], Xa.prototype, 'width', void 0),
    t([ge()], Xa.prototype, 'submittingName', void 0),
    t([ge()], Xa.prototype, 'animationEnd', void 0),
    t([ge()], Xa.prototype, 'ready', void 0),
    t([ge({ type: Array })], Xa.prototype, 'buttons', void 0),
    t([ge({ attribute: !1 })], Xa.prototype, 'onButtonClicked', void 0);
  class tl extends ue {
    constructor() {
      super(...arguments),
        (this.header = ''),
        (this.open = !1),
        (this.fetching = !1),
        (this.headers = {}),
        (this.body = this.getLoading()),
        (this.disabled = !1),
        (this.buttons = []),
        (this.wizardStep = 0),
        (this.wizardStepCount = 0),
        (this.suspendSubmit = !1);
    }
    static get styles() {
      return r`
      fieldset {
        border: none;
        margin: 0;
        padding: 0;
      }

      .control-group {
        margin-bottom: var(--control-margin-bottom);
      }

      .form-actions {
        display: none;
      }

      button[type='submit'],
      input[type='submit'] {
        display: none;
      }

      .modax-body {
        padding: 20px;
        display: block;
        position: relative;
        background: var(--body-bg);
      }

      .modax-body.submitting:before {
        display: inline-block;
        content: '';
        height: 100%;
        width: 100%;
        margin-left: -20px;
        margin-top: -20px;
        background: rgba(200, 200, 200, 0.1);
        position: absolute;
        z-index: 10000;
      }

      temba-loading {
        margin: 0 auto;
        display: block;
        width: 150px;
      }

      ul.errorlist {
        margin-top: 0px;
        list-style-type: none;
        padding-left: 0;
        padding-bottom: 7px;
      }

      ul.errorlist li {
        color: var(--color-error);
        background: rgba(255, 181, 181, 0.17);
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1),
          0 1px 2px 0 rgba(0, 0, 0, 0.06);
        color: tomato;
        padding: 10px;
        margin-bottom: 10px;
        border-radius: 6px;
      }

      .step-ball {
        background: rgba(var(--primary-rgb), 0.2);
        width: 1.2em;
        height: 1.2em;
        border-radius: 100%;
        margin-right: 0.5em;
        border: 0.15em solid transparent;
      }

      .step-ball.complete {
        background: rgba(var(--primary-rgb), 0.7);
        cursor: pointer;
      }
      .step-ball.complete:hover {
        background: rgba(var(--primary-rgb), 0.8);
      }

      .step-ball.active {
        border: 0.15em solid var(--color-primary-dark);
      }

      .wizard-steps {
        display: flex;
        flex-direction: row;
        margin-left: 0.6em;
      }
    `;
    }
    handleSlotClicked() {
      this.open = !0;
    }
    updated(t) {
      if (
        (super.updated(t),
        t.has('open') &&
          (this.open
            ? this.fetchForm()
            : void 0 !== t.get('open') &&
              (this.open
                ? window.setTimeout(() => {
                    (this.body = this.getLoading()), (this.submitting = !1);
                  }, 500)
                : this.setBody(''))),
        t.has('body') && this.open && this.body && !this.fetching)
      ) {
        this.shadowRoot.querySelector('temba-dialog').focusFirstInput();
      }
    }
    getLoading() {
      return j`<temba-loading units="6" size="8"></temba-loading>`;
    }
    updatePrimaryButton() {
      const t = this.shadowRoot.querySelector('#wizard-form');
      t &&
        ((this.wizardStep = parseInt(t.dataset.step)),
        (this.wizardStepCount = parseInt(t.dataset.steps))),
        this.noSubmit ||
          this.updateComplete.then(() => {
            const t = this.shadowRoot.querySelector("input[type='submit'],button[type='submit']");
            (this.buttons = t
              ? [
                  { type: Ja.SECONDARY, name: 'Cancel', closes: !0 },
                  { type: Ja.PRIMARY, name: t.value }
                ]
              : [{ type: Ja.SECONDARY, name: 'Ok', closes: !0 }]),
              (this.submitting = !1);
          });
    }
    setBody(t) {
      const e = this.shadowRoot.querySelector('.scripts');
      for (const t of e.children) t.remove();
      const i = this.ownerDocument.createElement('div');
      i.innerHTML = t;
      const o = i.getElementsByTagName('script'),
        n = [];
      for (let t = o.length - 1; t >= 0; t--) {
        const e = this.ownerDocument.createElement('script'),
          i = o[t].innerText;
        o[t].src && -1 === o[t].src.indexOf('web-dev-server')
          ? ((e.src = o[t].src),
            (e.type = 'text/javascript'),
            (e.async = !0),
            (e.onload = function() {}),
            n.push(e))
          : i && (e.appendChild(this.ownerDocument.createTextNode(i)), n.push(e)),
          o[t].remove();
      }
      const s = !!i.querySelector('.success-script');
      return (
        s || (this.body = hr(i.innerHTML)),
        this.updateComplete.then(() => {
          for (const t of n) e.appendChild(t);
        }),
        !s
      );
    }
    getHeaders() {
      const t = this.headers;
      return (t['X-PJAX'] = 1), t;
    }
    fetchForm() {
      (this.fetching = !0),
        (this.body = this.getLoading()),
        jt(this.endpoint, null, this.getHeaders()).then(t => {
          0 == t.body.indexOf('<!DOCTYPE HTML>')
            ? (document.location = t.url)
            : (this.setBody(t.body),
              (this.fetching = !1),
              this.updateComplete.then(() => {
                this.updatePrimaryButton(),
                  this.fireCustomEvent(Me.Loaded, { body: this.getBody() });
              }));
        });
    }
    submit(t = {}) {
      this.submitting = !0;
      const e = this.shadowRoot.querySelector('form');
      let i = e
        ? (function(t) {
            const e = [];
            for (let i = 0; i < t.elements.length; i++) {
              const o = t.elements[i];
              if (
                o.name &&
                !o.disabled &&
                'file' !== o.type &&
                'reset' !== o.type &&
                'submit' !== o.type &&
                'button' !== o.type
              )
                if ('select-multiple' === o.type)
                  for (let t = 0; t < o.options.length; t++)
                    o.options[t].selected &&
                      o.options[t].value &&
                      e.push(
                        encodeURIComponent(o.name) + '=' + encodeURIComponent(o.options[t].value)
                      );
                else if (('checkbox' !== o.type && 'radio' !== o.type) || o.checked) {
                  let t = o.value;
                  !t && o.checked && (t = '1'),
                    t && e.push(encodeURIComponent(o.name) + '=' + encodeURIComponent(t));
                }
            }
            return e.join('&');
          })(e)
        : '';
      t &&
        Object.keys(t).forEach(e => {
          i += (i.length > 1 ? '&' : '') + encodeURIComponent(e) + '=' + encodeURIComponent(t[e]);
        }),
        Kt(this.endpoint, i, this.getHeaders(), 'application/x-www-form-urlencoded')
          .then(t => {
            window.setTimeout(() => {
              let e = t.headers.get('temba-success');
              !e && t.url && -1 === t.url.indexOf(this.endpoint) && (e = t.url),
                e
                  ? 'hide' === e
                    ? this.updateComplete.then(() => {
                        (this.open = !1), this.fireCustomEvent(Me.Submitted);
                      })
                    : (this.fireCustomEvent(Me.Redirected, { url: e }), (this.open = !1))
                  : this.setBody(t.body) &&
                    this.updateComplete.then(() => {
                      this.updatePrimaryButton();
                    });
            }, 1e3);
          })
          .catch(t => {
            console.error(t);
          });
    }
    handleDialogClick(t) {
      const e = t.detail.button,
        i = t.detail.detail;
      e.disabled ||
        e.submitting ||
        ((e.primary || e.destructive) && (this.suspendSubmit || this.submit())),
        i.closes && ((this.open = !1), (this.fetching = !1), (this.cancelName = void 0));
    }
    handleDialogHidden() {
      (this.open = !1), (this.fetching = !1);
    }
    isDestructive() {
      return this.endpoint && this.endpoint.indexOf('delete') > -1;
    }
    handleGotoStep(t) {
      const e = t.target.dataset.gotoStep;
      e && this.submit({ wizard_goto_step: e });
    }
    getBody() {
      return this.shadowRoot.querySelector('.modax-body');
    }
    render() {
      const t = [],
        e = this.shadowRoot.querySelector('#wizard-form');
      if (e) {
        const i = (e.getAttribute('data-completed') || '').split(',').filter(t => t.length > 0);
        for (let e = 0; e < this.wizardStepCount; e++)
          t.push(j`<div
            data-goto-step=${i[e]}
            @click=${this.handleGotoStep.bind(this)}
            class="${Ht({
              'step-ball': !0,
              active: this.wizardStep - 1 === e,
              complete: e < i.length
            })}"
          ></div>`);
      }
      return j`
      <temba-dialog
        .header=${this.header}
        .buttons=${this.buttons}
        ?open=${this.open}
        ?loading=${this.fetching}
        ?submitting=${this.submitting}
        ?destructive=${this.isDestructive()}
        ?noFocus=${!0}
        ?disabled=${this.disabled}
        @temba-button-clicked=${this.handleDialogClick.bind(this)}
        @temba-dialog-hidden=${this.handleDialogHidden.bind(this)}
      >
        <div
          class="modax-body ${this.submitting ? 'submitting' : ''}"
          style="${this.isMobile() ? 'flex-grow:1' : ''}"
        >
          ${this.body}
        </div>
        <div class="scripts"></div>
        <div slot="gutter">
          <div class="wizard-steps">${t}</div>
        </div>
      </temba-dialog>
      <div class="slot-wrapper" @click=${this.handleSlotClicked}>
        <slot></slot>
      </div>
    `;
    }
  }
  t([ge({ type: String })], tl.prototype, 'header', void 0),
    t([ge({ type: String })], tl.prototype, 'endpoint', void 0),
    t([ge({ type: Boolean, reflect: !0 })], tl.prototype, 'open', void 0),
    t([ge({ type: Boolean })], tl.prototype, 'fetching', void 0),
    t([ge({ type: Boolean })], tl.prototype, 'submitting', void 0),
    t([ge({ type: String })], tl.prototype, 'primaryName', void 0),
    t([ge({ type: String })], tl.prototype, 'cancelName', void 0),
    t([ge({ type: String })], tl.prototype, 'onLoaded', void 0),
    t([ge({ type: Boolean })], tl.prototype, 'noSubmit', void 0),
    t([ge({ type: Object })], tl.prototype, 'headers', void 0),
    t([ge({ type: String })], tl.prototype, 'body', void 0),
    t([ge({ type: Boolean })], tl.prototype, 'disabled', void 0),
    t([ge({ type: Array })], tl.prototype, 'buttons', void 0),
    t([ge({ type: Number })], tl.prototype, 'wizardStep', void 0),
    t([ge({ type: Number })], tl.prototype, 'wizardStepCount', void 0),
    t([ge({ type: Boolean })], tl.prototype, 'suspendSubmit', void 0);
  class el extends lt {
    constructor() {
      super(...arguments), (this.v = 1);
    }
    static get styles() {
      return r`
      :host {
        display: inline-block;
        font-family: var(--font-family);
        font-weight: 400;
      }

      .small {
        font-size: 0.8em;
        --button-y: 0px;
        --button-x: 0.5em;
      }

      .v-2.button-container {
        background: var(--button-bg);
        background-image: var(--button-bg-img);
        color: var(--button-text);
        box-shadow: var(--button-shadow);
        transition: all calc(var(--transition-speed) / 2) ease-in;
      }

      .button-container {
        color: #fff;
        cursor: pointer;
        display: block;
        border-radius: var(--curvature);
        outline: none;
        transition: background ease-in var(--transition-speed);
        user-select: none;
        -webkit-user-select: none;
        text-align: center;
      }

      .button-name {
        white-space: nowrap;
      }

      .secondary-button:hover .button-mask {
        border: 1px solid var(--color-button-secondary);
      }

      .button-mask:hover {
        background: rgba(0, 0, 0, 0.05);
      }

      .button-container:focus {
        outline: none;
        margin: 0;
      }

      .button-container:focus {
        box-shadow: var(--widget-box-shadow-focused);
      }

      .button-container.secondary-button:focus .button-mask {
        background: transparent;
      }

      .button-mask {
        padding: var(--button-y) var(--button-x);
        border-radius: var(--curvature);
        border: 1px solid transparent;
        transition: var(--transition-speed);
        background: var(--button-mask);
      }

      .button-container.disabled-button {
        background: rgba(0, 0, 0, 0.05);
        color: rgba(255, 255, 255, 0.45);
        cursor: default;
      }

      .button-container.disabled-button .button-mask {
        box-shadow: 0 0 0px 1px var(--color-button-disabled);
      }

      .button-container.disabled-button:hover .button-mask {
        box-shadow: 0 0 0px 1px var(--color-button-disabled);
        background: rgba(0, 0, 0, 0.05);
      }

      .button-container.active-button .button-mask {
      }

      .secondary-button.active-button {
        background: transparent;
        color: var(--color-text);
      }

      .secondary-button.active-button .button-mask {
        border: none;
      }

      .button-container.secondary-button.active-button:focus .button-mask {
        background: transparent;
        box-shadow: none;
      }

      .primary-button {
        background: var(--color-button-primary);
        color: var(--color-button-primary-text);
      }

      .light-button {
        background: var(--color-button-light);
        color: var(--color-button-light-text);
      }

      .attention-button {
        background: var(--color-button-attention);
        color: var(--color-button-primary-text);
      }

      .secondary-button {
        background: transparent;
        color: var(--color-text);
      }

      .destructive-button {
        background: var(--color-button-destructive);
        color: var(--color-button-destructive-text);
      }

      .button-mask.disabled-button {
        background: rgba(0, 0, 0, 0.1);
      }

      .secondary-button .button-mask:hover {
        background: transparent;
      }

      .submit-animation {
        padding: 1px 4px;
      }

      .submit-animation temba-loading {
        margin-bottom: -3px;
        line-height: normal;
      }
    `;
    }
    handleClick(t) {
      this.disabled && (t.preventDefault(), t.stopPropagation()),
        this.href &&
          !this.disabled &&
          ((this.ownerDocument.location.href = this.href), t.preventDefault(), t.stopPropagation());
    }
    handleKeyUp(t) {
      (this.active = !1), 'Enter' === t.key && this.click();
    }
    handleMouseDown() {
      this.disabled || this.submitting || ((this.active = !0), this.classList.add('active'));
    }
    handleMouseUp() {
      (this.active = !1), this.classList.remove('active');
    }
    render() {
      const t = this.submitting
        ? j`<div class="submit-animation">
          <temba-loading units="3" size="8" color="#eee"></temba-loading>
        </div>`
        : this.name;
      return j`
      <div
        class="button-container 
          v-${this.v}
          ${Ht({
            'primary-button':
              this.primary || (!this.primary && !this.secondary && !this.attention && 1 == this.v),
            'secondary-button': this.secondary,
            'disabled-button': this.disabled,
            'active-button': this.active,
            'attention-button': this.attention,
            'destructive-button': this.destructive,
            'light-button': this.light,
            small: this.small
          })}"
        tabindex="0"
        @mousedown=${this.handleMouseDown}
        @mouseup=${this.handleMouseUp}
        @mouseleave=${this.handleMouseUp}
        @keyup=${this.handleKeyUp}
        @click=${this.handleClick}
      >
        <div class="button-mask">
          <div class="button-name"><slot name="name">${t}</slot></div>
        </div>
      </div>
    `;
    }
  }
  t([ge({ type: Boolean })], el.prototype, 'primary', void 0),
    t([ge({ type: Boolean })], el.prototype, 'secondary', void 0),
    t([ge({ type: Boolean })], el.prototype, 'attention', void 0),
    t([ge({ type: Number })], el.prototype, 'v', void 0),
    t([ge({ type: Boolean })], el.prototype, 'destructive', void 0),
    t([ge({ type: Boolean })], el.prototype, 'light', void 0),
    t([ge()], el.prototype, 'name', void 0),
    t([ge({ type: Boolean })], el.prototype, 'disabled', void 0),
    t([ge({ type: Boolean })], el.prototype, 'submitting', void 0),
    t([ge({ type: Boolean })], el.prototype, 'active', void 0),
    t([ge({ type: Boolean })], el.prototype, 'small', void 0),
    t([ge({ type: String })], el.prototype, 'href', void 0),
    t([ge({ type: Number })], el.prototype, 'index', void 0);
  class il extends lt {
    constructor() {
      super(...arguments),
        (this.hideLabel = !1),
        (this.widgetOnly = !1),
        (this.errors = []),
        (this.hideErrors = !1),
        (this.helpText = ''),
        (this.helpAlways = !0),
        (this.label = ''),
        (this.name = ''),
        (this.disabled = !1);
    }
    static get styles() {
      return r`
      :host {
        font-family: var(--font-family);
      }

      label {
        margin-bottom: 5px;
        margin-left: 4px;
        display: block;
        font-weight: 400;
        font-size: var(--label-size);
        letter-spacing: 0.05em;
        line-height: normal;
        color: #777;
      }

      .help-text {
        font-size: var(--help-text-size);
        line-height: normal;
        color: var(--color-text-help);
        margin-left: var(--help-text-margin-left);
        margin-top: -16px;
        opacity: 0;
        transition: opacity ease-in-out 100ms, margin-top ease-in-out 200ms;
        pointer-events: none;
      }

      .help-text.help-always {
        opacity: 1;
        margin-top: 6px;
        margin-left: var(--help-text-margin-left);
      }

      .field:focus-within .help-text {
        margin-top: 6px;
        opacity: 1;
      }

      .alert-error {
        background: rgba(255, 181, 181, 0.17);
        border: none;
        border-left: 0px solid var(--color-error);
        color: var(--color-error);
        padding: 10px;
        margin: 15px 0px;
        border-radius: var(--curvature);
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1),
          0 1px 2px 0 rgba(0, 0, 0, 0.06);
      }

      .disabled {
        opacity: var(--disabled-opacity) !important;
        pointer-events: none !important;
      }
    `;
    }
    render() {
      const t = this.hideErrors
        ? []
        : (this.errors || []).map(t => j` <div class="alert-error">${t}</div> `);
      return this.widgetOnly
        ? j`
        <div class="${this.disabled ? 'disabled' : ''}"><slot></slot></div>
        ${t}
      `
        : j`
      <div class="field ${this.disabled ? 'disabled' : ''}">
        ${
          this.name && !this.hideLabel && this.label
            ? j`
              <label class="control-label" for="${this.name}"
                >${this.label}</label
              >
            `
            : null
        }
        <div class="widget">
          <slot></slot>
        </div>
        ${
          this.helpText && 'None' !== this.helpText
            ? j`
              <div class="help-text ${this.helpAlways ? 'help-always' : null}">
                ${this.helpText}
              </div>
            `
            : null
        }
        ${t}
      </div>
    `;
    }
  }
  t([ge({ type: Boolean, attribute: 'hide_label' })], il.prototype, 'hideLabel', void 0),
    t([ge({ type: Boolean, attribute: 'widget_only' })], il.prototype, 'widgetOnly', void 0),
    t([ge({ type: Array, attribute: !1 })], il.prototype, 'errors', void 0),
    t([ge({ type: Boolean })], il.prototype, 'hideErrors', void 0),
    t([ge({ type: String, attribute: 'help_text' })], il.prototype, 'helpText', void 0),
    t([ge({ type: Boolean, attribute: 'help_always' })], il.prototype, 'helpAlways', void 0),
    t([ge({ type: String })], il.prototype, 'label', void 0),
    t([ge({ type: String })], il.prototype, 'name', void 0),
    t([ge({ type: Boolean })], il.prototype, 'disabled', void 0);
  class ol extends lt {
    constructor() {
      super(...arguments),
        (this.color = 'var(--color-primary-dark)'),
        (this.size = 5),
        (this.units = 5),
        (this.direction = 'row');
    }
    static get styles() {
      return r`
      :host {
        display: block;
      }

      .loading-unit {
        border: 1px inset rgba(0, 0, 0, 0.05);
        animation: loading-pulse 0.9s cubic-bezier(0.3, 0, 0.7, 1) infinite;
      }

      .loading-container {
        display: flex;
      }

      @keyframes loading-pulse {
        0% {
          transform: scale(0.2);
          opacity: 0.1;
        }
        20% {
          transform: scale(1);
          opacity: 1;
        }
        100% {
          transform: scale(0.2);
          opacity: 0.1;
        }
      }
    `;
    }
    render() {
      const t = this.size / 2;
      return j`
      <div class="loading-container" style="flex-direction:${this.direction}">
        ${((e = 0), (i = this.units), Array.from({ length: i - e }, (t, i) => i + e)).map(e => {
          const i = {
            'border-radius': this.square ? '0' : '50%',
            width: this.size + 'px',
            height: this.size + 'px',
            margin: t + 'px',
            animationDelay: `-${1 - e * (1 / this.units)}s`,
            background: this.color
          };
          return j`
            <div class="loading-unit" style=${Se(i)}></div>
          `;
        })}
      </div>
    `;
      var e, i;
      /*!
       * Serialize all form data into a query string
       * (c) 2018 Chris Ferdinandi, MIT License, https://gomakethings.com
       * @param  {Node}   form The form to serialize
       * @return {String}      The serialized form data
       */
    }
  }
  t([ge({ type: String })], ol.prototype, 'color', void 0),
    t([ge({ type: Number })], ol.prototype, 'size', void 0),
    t([ge({ type: Number })], ol.prototype, 'units', void 0),
    t([ge({ type: Boolean })], ol.prototype, 'square', void 0),
    t([ge({ type: String })], ol.prototype, 'direction', void 0);
  const nl = [
      10,
      12,
      13,
      32,
      33,
      34,
      35,
      36,
      37,
      38,
      39,
      40,
      41,
      42,
      43,
      44,
      45,
      46,
      47,
      48,
      49,
      50,
      51,
      52,
      53,
      54,
      55,
      56,
      57,
      58,
      59,
      60,
      61,
      62,
      63,
      64,
      65,
      66,
      67,
      68,
      69,
      70,
      71,
      72,
      73,
      74,
      75,
      76,
      77,
      78,
      79,
      80,
      81,
      82,
      83,
      84,
      85,
      86,
      87,
      88,
      89,
      90,
      91,
      92,
      93,
      94,
      95,
      97,
      98,
      99,
      100,
      101,
      102,
      103,
      104,
      105,
      106,
      107,
      108,
      109,
      110,
      111,
      112,
      113,
      114,
      115,
      116,
      117,
      118,
      119,
      120,
      121,
      122,
      123,
      124,
      125,
      126,
      161,
      163,
      164,
      165,
      167,
      191,
      196,
      197,
      198,
      199,
      201,
      209,
      214,
      216,
      220,
      223,
      224,
      228,
      229,
      230,
      232,
      233,
      236,
      241,
      242,
      246,
      248,
      249,
      252,
      915,
      916,
      920,
      923,
      926,
      928,
      931,
      934,
      936,
      937,
      8364
    ],
    sl = [12, 91, 92, 93, 94, 123, 124, 125, 126, 8364];
  function rl(t, e) {
    const i = e.length;
    let o = 0;
    for (; o < i; ) {
      if (t === e[o]) return !0;
      o++;
    }
    return !1;
  }
  function al(t) {
    return rl(t.charCodeAt(0), nl);
  }
  function ll(t) {
    return t >= 55296 && t <= 56319;
  }
  function hl(t) {
    return t >= 55296 && t <= 56319;
  }
  const cl = function(t, e = {}) {
      const i = e && e.characterset;
      e = { summary: e && e.summary };
      const o =
        (void 0 === i &&
          (function(t) {
            for (let e = 0; e < t.length; e++) if (!al(t.charAt(e))) return !1;
            return !0;
          })(t)) ||
        'GSM' === i;
      let n, s, r, a;
      o
        ? ((n = (function(t, e) {
            if (((e = e || { summary: !1 }), '' === t))
              return {
                parts: [{ content: e.summary ? void 0 : '', length: 0, bytes: 0 }],
                totalLength: 0,
                totalBytes: 0
              };
            const i = [];
            let o = 0,
              n = 0,
              s = 0,
              r = 0,
              a = '';
            function l() {
              const t = { content: e.summary ? void 0 : a, length: o, bytes: n };
              i.push(t), (r += o), (o = 0), (s += n), (n = 0), (a = '');
            }
            for (let i = 0, s = t.length; i < s; i++) {
              let s = t.charAt(i);
              al(s)
                ? rl(s.charCodeAt(0), sl) && (152 === n && l(), n++)
                : (ll(s.charCodeAt(0)) && i++, (s = ' ')),
                n++,
                o++,
                e.summary || (a += s),
                153 === n && l();
            }
            return (
              n > 0 && l(),
              i[1] && s <= 160
                ? {
                    parts: [
                      {
                        content: e.summary ? void 0 : i[0].content + i[1].content,
                        length: r,
                        bytes: s
                      }
                    ],
                    totalLength: r,
                    totalBytes: s
                  }
                : { parts: i, totalLength: r, totalBytes: s }
            );
          })(t, e)),
          (s = 160),
          (r = 153),
          (a = 1))
        : ((n = (function(t, e) {
            if (((e = e || { summary: !1 }), '' === t))
              return {
                parts: [{ content: e.summary ? void 0 : '', length: 0, bytes: 0 }],
                totalLength: 0,
                totalBytes: 0
              };
            const i = [];
            let o = 0,
              n = 0,
              s = 0,
              r = 0,
              a = 0;
            function l(l = void 0) {
              const h = {
                content: e.summary ? void 0 : l ? t.substring(a, l + 1) : t.substring(a),
                length: o,
                bytes: n
              };
              i.push(h), (a = l + 1), (r += o), (o = 0), (s += n), (n = 0);
            }
            for (let e = 0, i = t.length; e < i; e++)
              hl(t.charCodeAt(e)) && (132 === n && l(e - 1), (n += 2), e++),
                (n += 2),
                o++,
                134 === n && l(e);
            return (
              n > 0 && l(),
              i[1] && s <= 140
                ? {
                    parts: [{ content: e.summary ? void 0 : t, length: r, bytes: s }],
                    totalLength: r,
                    totalBytes: s
                  }
                : { parts: i, totalLength: r, totalBytes: s }
            );
          })(t, e)),
          (s = 140),
          (r = 134),
          (a = 2));
      const l = (function(t, e, i, o) {
        return ((1 === t.length ? e : i) - t[t.length - 1].bytes) / o;
      })(n.parts, s, r, a);
      return {
        characterSet: o ? 'GSM' : 'Unicode',
        parts: n.parts,
        bytes: n.totalBytes,
        length: n.totalLength,
        remainingInPart: l
      };
    },
    dl = {
      0: 48,
      1: 49,
      2: 50,
      3: 51,
      4: 52,
      5: 53,
      6: 54,
      7: 55,
      8: 56,
      9: 57,
      '\n': 10,
      '\f': 12,
      '\r': 13,
      ' ': 32,
      '!': 33,
      '"': 34,
      '#': 35,
      $: 36,
      '%': 37,
      '&': 38,
      "'": 39,
      '(': 40,
      ')': 41,
      '*': 42,
      '+': 43,
      ',': 44,
      '-': 45,
      '.': 46,
      '/': 47,
      ':': 58,
      ';': 59,
      '<': 60,
      '=': 61,
      '>': 62,
      '?': 63,
      '@': 64,
      A: 65,
      B: 66,
      C: 67,
      D: 68,
      E: 69,
      F: 70,
      G: 71,
      H: 72,
      I: 73,
      J: 74,
      K: 75,
      L: 76,
      M: 77,
      N: 78,
      O: 79,
      P: 80,
      Q: 81,
      R: 82,
      S: 83,
      T: 84,
      U: 85,
      V: 86,
      W: 87,
      X: 88,
      Y: 89,
      Z: 90,
      '[': 91,
      '\\': 92,
      ']': 93,
      '^': 94,
      _: 95,
      a: 97,
      b: 98,
      c: 99,
      d: 100,
      e: 101,
      f: 102,
      g: 103,
      h: 104,
      i: 105,
      j: 106,
      k: 107,
      l: 108,
      m: 109,
      n: 110,
      o: 111,
      p: 112,
      q: 113,
      r: 114,
      s: 115,
      t: 116,
      u: 117,
      v: 118,
      w: 119,
      x: 120,
      y: 121,
      z: 122,
      '{': 123,
      '|': 124,
      '}': 125,
      '~': 126,
      '¡': 161,
      '£': 163,
      '¤': 164,
      '¥': 165,
      '§': 167,
      '¿': 191,
      Ä: 196,
      Å: 197,
      Æ: 198,
      Ç: 199,
      É: 201,
      Ñ: 209,
      Ö: 214,
      Ø: 216,
      Ü: 220,
      ß: 223,
      à: 224,
      ä: 228,
      å: 229,
      æ: 230,
      è: 232,
      é: 233,
      ì: 236,
      ñ: 241,
      ò: 242,
      ö: 246,
      ø: 248,
      ù: 249,
      ü: 252,
      Γ: 915,
      Δ: 916,
      Θ: 920,
      Λ: 923,
      Ξ: 926,
      Π: 928,
      Σ: 931,
      Φ: 934,
      Ψ: 936,
      Ω: 937,
      '€': 8364
    };
  class ul extends ue {
    constructor() {
      super(...arguments), (this.extended = []);
    }
    static get styles() {
      return r`
      :host {
        overflow: auto;
      }

      :host::after {
        content: '';
        clear: both;
        display: table;
      }

      .counter {
        float: right;
        text-align: right;
        position: relative;
      }

      .extended {
        font-size: 14px;
        display: flex;
        margin-top: 4px;
      }

      .extended-char {
        border: 1px solid #e6e6e6;
        border-radius: var(--curvature-widget);
        padding: 4px;
        text-align: center;
        line-height: 20px;
        margin-right: 4px;
      }

      .summary {
        width: 180px;
        padding: 8px 12px;
        font-size: 12px;
        background: white;
        border-radius: var(--curvature-widget);
        overflow: hidden;
        opacity: 0.3;
        transform: scale(0.7);
        box-shadow: var(--shadow);
        transition: transform cubic-bezier(0.71, 0.18, 0.61, 1.33)
          var(--transition-speed);
        visibility: hidden;
        margin-top: var(--temba-charcount-summary-margin-top);
        right: var(--temba-charcount-summary-right);
        bottom: var(--temba-charcount-summary-bottom);
        text-align: left;
        position: var(--temba-charcount-summary-position);
        z-index: 1000;
      }

      .fine-print {
        margin-top: 8px;
        margin-left: -12px;
        margin-right: -12px;
        margin-bottom: -8px;
        padding: 8px 12px;
        color: #999;
        background: #f5f5f5;
        font-size: 10px;
      }

      .extended-warning {
        margin-top: 8px;
      }

      .note {
        font-weight: 600;
        display: inline-block;
        margin-right: 2px;
      }

      .counts {
        cursor: pointer;
        transition: all cubic-bezier(0.71, 0.18, 0.61, 1.33) 200ms;
        transform: scale(0.9);
        display: inline-block;
        padding: 2px 6px;
        border-radius: var(--curvature);
        margin-top: var(--temba-charcount-counts-margin-top);
      }

      .segments {
        font-size: 85%;
        display: inline-block;
      }

      .attention .counts {
        transform: scale(0.95);
        background: var(--color-overlay-light);
        color: var(--color-overlay-light-text);
      }

      .attention .segments {
        font-weight: 600;
      }

      .counter:hover .summary {
        opacity: 1;
        transform: scale(1);
        visibility: visible;
      }
    `;
    }
    updated(t) {
      super.updated(t), t.has('text') && this.updateSegments();
    }
    updateSegments() {
      const t = cl(this.text);
      (this.count = t.length),
        (this.segments = t.parts.length),
        (this.extended = (t => {
          const e = {};
          for (const o of t) (i = o), dl.hasOwnProperty(i) || (e[o] = !0);
          var i;
          return Object.keys(e);
        })(this.text)),
        (this.count = this.text.length);
    }
    render() {
      const t = this.text && this.text.indexOf('@') > -1;
      let e = j`.`;
      e =
        this.segments > 1
          ? j`and will use ${t ? j`at least` : null}
        <b>${this.segments} messages</b> to send over SMS.`
          : j`and will use ${t ? j`at least` : null} one
      message to send over SMS.`;
      let i = null;
      this.extended.length > 0 &&
        (this.segments > 1 || t) &&
        ((i = this.extended.map(t => j`<div class="extended-char">${t}</div>`)),
        (i = j`
        <div class="extended-warning">
          Some characters require more space over SMS. To save on fees, consider
          replacing them.
          <div class="extended">${i}</div>
        </div>
      `));
      const o =
        this.count > 1
          ? j` <div class="summary">
            This message is <b>${this.count} characters</b>
            ${e} ${i}
            ${
              t
                ? j`
                  <div class="fine-print">
                    <div class="note">NOTE</div>
                    Using variables may result in more messages when sending
                    over SMS than this estimate.
                  </div>
                `
                : null
            }
          </div>`
          : null;
      return j`<div class="counter${i ? ' attention' : ''}"><div class="counts">${this.count}${
        this.segments > 1 || t
          ? j`<div class="segments">
            &nbsp;/&nbsp;${this.segments}${t ? j`+` : null}
            <div></div>
          </div>`
          : null
      }</div> ${o}</div></div>`;
    }
  }
  t([ge({ type: String })], ul.prototype, 'text', void 0),
    t([ge({ type: Number })], ul.prototype, 'count', void 0),
    t([ge({ type: Number, attribute: !1 })], ul.prototype, 'segments', void 0),
    t([ge({ type: Object, attribute: !1 })], ul.prototype, 'extended', void 0);
  class pl extends ue {
    constructor() {
      super(...arguments), (this.showLoading = !1);
    }
    handleStoreUpdated(t) {
      this.store.initialHttpComplete.then(() => {
        this.storeUpdated(t);
      });
    }
    storeUpdated(t) {}
    updated(t) {
      super.updated(t);
    }
    connectedCallback() {
      super.connectedCallback(),
        (this.store = document.querySelector('temba-store')),
        (this.handleStoreUpdated = this.handleStoreUpdated.bind(this)),
        this.store && this.store.addEventListener(Me.StoreUpdated, this.handleStoreUpdated);
    }
    disconnectedCallback() {
      super.disconnectedCallback(),
        this.store && this.store.removeEventListener(Me.StoreUpdated, this.handleStoreUpdated);
    }
    render() {
      if (!this.store.ready && this.showLoading) return j`<temba-loading></temba-loading>`;
    }
  }
  t([ge({ type: String })], pl.prototype, 'url', void 0),
    t([ge({ type: Boolean })], pl.prototype, 'showLoading', void 0);
  class ml extends pl {
    constructor() {
      super(...arguments), (this.showLoading = !1);
    }
    prepareData(t) {
      return t;
    }
    refresh() {
      this.store.makeRequest(this.url, { prepareData: this.prepareData, force: !0 });
    }
    storeUpdated(t) {
      if (t.detail.url === this.url) {
        const e = this.data;
        (this.data = t.detail.data),
          this.fireCustomEvent(Me.Refreshed, { data: t.detail.data, previous: e });
      }
    }
    updated(t) {
      super.updated(t),
        t.has('url') &&
          (this.url
            ? this.store.makeRequest(this.url, { prepareData: this.prepareData })
            : (this.data = null));
    }
    connectedCallback() {
      super.connectedCallback(), (this.prepareData = this.prepareData.bind(this));
    }
  }
  t([ge({ type: String })], ml.prototype, 'url', void 0),
    t([ge({ type: Boolean })], ml.prototype, 'showLoading', void 0),
    t([ge({ type: Object, attribute: !1 })], ml.prototype, 'data', void 0);
  class gl extends ml {
    constructor() {
      super(...arguments), (this.endpoint = '/api/v2/contacts.json?uuid=');
    }
    prepareData(t) {
      return t && t.length > 0
        ? ((t = t[0]).groups.forEach(t => {
            t.is_dynamic = this.store.isDynamicGroup(t.uuid);
          }),
          t.groups.sort((t, e) => {
            if (!t.is_dynamic || !e.is_dynamic) {
              if (t.is_dynamic) return -1;
              if (e.is_dynamic) return 1;
            }
            return t.name.localeCompare(e.name);
          }),
          t)
        : null;
    }
    setContact(t) {
      (this.data = this.prepareData([t])),
        this.store.updateCache(`${this.endpoint}${this.contact}`, this.data);
    }
    updated(t) {
      super.updated(t),
        t.has('contact') &&
          (this.contact ? (this.url = `${this.endpoint}${this.contact}`) : (this.url = null));
    }
  }
  t([ge({ type: String })], gl.prototype, 'contact', void 0),
    t([ge({ type: Object, attribute: !1 })], gl.prototype, 'data', void 0),
    t([ge({ type: String })], gl.prototype, 'endpoint', void 0);
  class fl extends gl {
    static get styles() {
      return r`
      :host {
        flex-grow: 1;
        display: flex;
        flex-direction: row;
        min-height: 0;
        --compose-shadow: none;
        --compose-border: none;
        --compose-padding: 3px;
        --compose-curvature: none;
      }

      .chat-wrapper {
        display: flex;
        flex-grow: 1;
        flex-direction: column;
        min-height: 0;
      }

      temba-contact-history {
        border-bottom: 1px solid #f6f6f6;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;
      }

      .chatbox {
        box-shadow: 0px -5px 1rem 0rem rgba(0, 0, 0, 0.07);
        display: flex;
        flex-direction: column;
        --textarea-min-height: 1em;
        --textarea-height: 1.2em;
        --widget-box-shadow-focused: none;
      }

      .chatbox:focus-within {
        --textarea-height: 4em;
      }

      .chatbox.full {
        border-bottom-right-radius: 0 !important;
      }

      .closed-footer {
        padding: 1em;
        background: #f2f2f2;
        border-top: 3px solid #e1e1e1;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      a {
        color: var(--color-link-primary);
      }

      a:hover {
        text-decoration: underline;
        color: var(--color-link-primary-hover);
      }

      temba-button#reopen-button {
        --button-y: 1px;
        --button-x: 12px;
      }

      temba-completion {
        --widget-box-shadow: none;
        --color-widget-border: transparent;
        --widget-box-shadow-focused: none;
        --color-focus: transparent;
        --color-widget-bg-focused: transparent;
      }
    `;
    }
    constructor() {
      super(),
        (this.contactsEndpoint = '/api/v2/contacts.json'),
        (this.currentNote = ''),
        (this.showDetails = !0),
        (this.monitor = !1),
        (this.currentTicket = null),
        (this.currentContact = null),
        (this.agent = ''),
        (this.refreshInterval = null);
    }
    connectedCallback() {
      super.connectedCallback(),
        this.monitor &&
          (this.refreshInterval = setInterval(() => {
            (this.currentTicket && this.currentTicket.closed_on) || this.refresh();
          }, 1e4));
    }
    disconnectedCallback() {
      this.refreshInterval && clearInterval(this.refreshInterval);
    }
    getContactHistory() {
      return this.shadowRoot.querySelector('temba-contact-history');
    }
    refresh(t = !1) {
      const e = this.getContactHistory();
      e && (t && e.scrollToBottom(), e.refresh());
    }
    updated(t) {
      super.updated(t),
        (t.has('data') || t.has('currentContact')) && (this.currentContact = this.data);
    }
    handleSend(t) {
      const e = t.detail.name;
      if ('Send' === e) {
        const i = { contact: this.currentContact.uuid },
          o = t.currentTarget;
        if (o) {
          const t = o.currentText;
          t && t.length > 0 && (i.text = t);
          const e = o.currentAttachments;
          if (e && e.length > 0) {
            const t = e.map(t => t.uuid);
            i.attachments = t;
          }
        }
        this.currentTicket && (i.ticket = this.currentTicket.uuid);
        const n = e + ' failed, please try again.';
        Yt('/api/v2/messages.json', i)
          .then(t => {
            if (t.status < 400)
              o.reset(), this.refresh(!0), this.fireCustomEvent(Me.MessageSent, { msg: i });
            else if (t.status < 500)
              if (t.json.text && t.json.text.length > 0 && t.json.text[0].length > 0) {
                let e = t.json.text[0];
                (e = e.replace('Ensure this field has no more than', 'Maximum allowed text is')),
                  (o.buttonError = e);
              } else if (
                t.json.attachments &&
                t.json.attachments.length > 0 &&
                t.json.attachments[0].length > 0
              ) {
                let e = t.json.attachments[0];
                (e = e
                  .replace('Ensure this field has no more than', 'Maximum allowed attachments is')
                  .replace('elements', 'files')),
                  (o.buttonError = e);
              } else o.buttonError = n;
            else o.buttonError = n;
          })
          .catch(t => {
            console.error(t), (o.buttonError = n);
          });
      }
    }
    render() {
      const t = this.currentContact ? this.getTembaContactHistory() : null,
        e = this.currentContact ? this.getTembaChatbox() : null,
        i = j`
      <div class="chat-wrapper">${t} ${e}</div>
    `;
      return j`${i}`;
    }
    getTembaContactHistory() {
      return j` <temba-contact-history
      .uuid=${this.currentContact.uuid}
      .contact=${this.currentContact}
      .ticket=${this.currentTicket ? this.currentTicket.uuid : null}
      .endDate=${this.currentTicket ? this.currentTicket.closed_on : null}
      .agent=${this.agent}
    >
    </temba-contact-history>`;
    }
    getTembaChatbox() {
      return this.currentTicket
        ? (this.currentContact && 'active' !== this.currentContact.status) ||
          this.currentTicket.closed_on
          ? null
          : this.getChatbox()
        : this.currentContact && 'active' !== this.currentContact.status
        ? null
        : this.getChatbox();
    }
    getChatbox() {
      return j`<div class="chatbox">
      <temba-compose
        chatbox
        attachments
        counter
        button
        @temba-button-clicked=${this.handleSend.bind(this)}
      >
      </temba-compose>
    </div>`;
    }
  }
  t([ge({ type: String, attribute: 'ticket' })], fl.prototype, 'ticketUUID', void 0),
    t([ge({ type: String })], fl.prototype, 'contactsEndpoint', void 0),
    t([ge({ type: String })], fl.prototype, 'currentNote', void 0),
    t([ge({ type: Boolean })], fl.prototype, 'showDetails', void 0),
    t([ge({ type: Boolean })], fl.prototype, 'monitor', void 0),
    t([ge({ type: Object })], fl.prototype, 'currentTicket', void 0),
    t([ge({ type: Object })], fl.prototype, 'currentContact', void 0),
    t([ge({ type: String })], fl.prototype, 'agent', void 0);
  let vl = [];
  const bl = (t, e, i, o = void 0, n = void 0) => (
      t &&
        (vl.forEach(t => {
          t.abort();
        }),
        (vl = [])),
      new Promise(t => {
        const s = new AbortController();
        vl.push(s);
        let r = e;
        o && (r += `&before=${o}`),
          n && (r += `&after=${n}`),
          i && (r += `&ticket=${i}`),
          jt(r, s)
            .then(e => {
              (vl = vl.filter(t => e.controller === t)), t(e.json);
            })
            .catch(() => {});
      })
    ),
    yl = t =>
      t
        ? t.first_name && t.last_name
          ? `${t.first_name} ${t.last_name}`
          : t.first_name
          ? t.first_name
          : t.email
        : 'Somebody';
  var _l;
  !(function(t) {
    (t.MESSAGE_CREATED = 'msg_created'),
      (t.MESSAGE_RECEIVED = 'msg_received'),
      (t.BROADCAST_CREATED = 'broadcast_created'),
      (t.IVR_CREATED = 'ivr_created'),
      (t.FLOW_ENTERED = 'flow_entered'),
      (t.FLOW_EXITED = 'flow_exited'),
      (t.RUN_RESULT_CHANGED = 'run_result_changed'),
      (t.CONTACT_FIELD_CHANGED = 'contact_field_changed'),
      (t.CONTACT_GROUPS_CHANGED = 'contact_groups_changed'),
      (t.CONTACT_NAME_CHANGED = 'contact_name_changed'),
      (t.CONTACT_URNS_CHANGED = 'contact_urns_changed'),
      (t.CAMPAIGN_FIRED = 'campaign_fired'),
      (t.CHANNEL_EVENT = 'channel_event'),
      (t.CONTACT_LANGUAGE_CHANGED = 'contact_language_changed'),
      (t.WEBHOOK_CALLED = 'webhook_called'),
      (t.AIRTIME_TRANSFERRED = 'airtime_transferred'),
      (t.CALL_STARTED = 'call_started'),
      (t.EMAIL_SENT = 'email_sent'),
      (t.INPUT_LABELS_ADDED = 'input_labels_added'),
      (t.NOTE_CREATED = 'note_created'),
      (t.TICKET_ASSIGNED = 'ticket_assigned'),
      (t.TICKET_NOTE_ADDED = 'ticket_note_added'),
      (t.TICKET_CLOSED = 'ticket_closed'),
      (t.TICKET_OPENED = 'ticket_opened'),
      (t.TICKET_REOPENED = 'ticket_reopened'),
      (t.OPTIN_REQUESTED = 'optin_requested'),
      (t.ERROR = 'error'),
      (t.FAILURE = 'failure');
  })(_l || (_l = {}));
  const xl = (t, e) => {
      if (!t) return 'messages';
      switch (t.type) {
        case _l.TICKET_ASSIGNED:
        case _l.TICKET_OPENED:
        case _l.TICKET_CLOSED:
        case _l.TICKET_REOPENED:
          if (!e) return 'verbose';
          if (t.ticket.uuid === e) return 'tickets';
          break;
        case _l.FLOW_ENTERED:
        case _l.FLOW_EXITED:
          return 'flows';
        case _l.BROADCAST_CREATED:
        case _l.MESSAGE_CREATED:
        case _l.MESSAGE_RECEIVED:
        case _l.IVR_CREATED:
        case _l.TICKET_NOTE_ADDED:
        case _l.NOTE_CREATED:
          return 'messages';
      }
      return 'verbose';
    },
    wl = t => {
      const e = t.type === _l.MESSAGE_RECEIVED,
        i = 'E' === t.status,
        o = 'F' === t.status,
        n = [];
      return (
        t.logs_url
          ? n.push(j` <div class="icon-link">
      <temba-icon
        onclick="goto(event)"
        href="${t.logs_url}"
        name="${ve.log}"
        class="log ${i || o ? 'error' : ''}"
      ></temba-icon>
    </div>`)
          : i
          ? n.push(j`<temba-icon
        title="Message delivery error"
        name="${ve.error}"
        class="delivery-error"
      ></temba-icon>`)
          : o &&
            n.push(j`<temba-icon
        title="Message delivery failure: ${t.failed_reason_display}"
        name="${ve.error}"
        class="delivery-error"
      ></temba-icon>`),
        'broadcast_created' == t.type &&
          (n.push(j`<temba-icon
      size="1"
      class="broadcast"
      name="${ve.broadcast}"
    ></temba-icon>`),
          t.recipient_count > 1 &&
            n.push(j`<div class="recipients">${t.recipient_count} contacts</div>`),
          n.push(j`<div class="separator">•</div>`)),
        t.optin &&
          n.push(j`<div class="optin">${t.optin.name}</div>
        <div class="separator">•</div>`),
        'Q' === t.status && n.push(j`<div>Queued</div>`),
        n.push(j`<temba-date
      class="time"
      value="${t.created_on}"
      display="duration"
    ></temba-date>`),
        j`<div
    style="display:flex;align-items:flex-start"
    class=${Ht({ queued: 'Q' === t.status })}
  >
    <div style="display:flex;flex-direction:column">
      <div
        class="${t.msg.text ? '' : 'no-message'} attachments-${
          (t.msg.attachments || []).length
        } ${Ht({ msg: !0, automated: !e && !t.created_by })}"
      >
        ${t.msg.text ? j` <div class="text">${t.msg.text}</div> ` : null}
        ${
          t.msg.attachments
            ? j`<div class="attachments">
              ${t.msg.attachments.map(
                t => j` <div class="attachment">
                    ${(t => {
                      const e = t.indexOf(':'),
                        i = t.substr(0, e),
                        o = t.substr(e + 1),
                        [n, s] = i.split('/', 2);
                      let r = null;
                      if ('image' !== n) {
                        if ('pdf' === s)
                          return j`<div
      style="width:100%;height:300px;border-radius:calc(var(--curvature) * 2.5);box-shadow:0px 0px 12px 0px rgba(0,0,0,.1), 0px 0px 2px 0px rgba(0,0,0,.15);overflow:hidden"
    ><embed src="${o}#view=Fit" type="application/pdf" frameBorder="0" scrolling="auto" height="100%" width="100%"></embed></div>`;
                        if ('video' === n)
                          return j`<video
      style="border-radius:var(--curvature);box-shadow:0px 0px 12px 0px rgba(0,0,0,.1), 0px 0px 2px 0px rgba(0,0,0,.15);max-width:400px"
      height="auto"
      controls
    >
      <source src="${o}" type="video/mp4" />
    </video> `;
                        if ('audio' === n)
                          return j`<audio
      style="border-radius: 99px; box-shadow:0px 0px 12px 0px rgba(0,0,0,.1), 0px 0px 2px 0px rgba(0,0,0,.15);"
      src="${o}"
      type="${i}"
      controls
    >
      <a target="_" href="${o}">${o}</a>
    </audio>`;
                        if ('geo' === i) {
                          const [t, e] = o.split(','),
                            i = parseFloat(t),
                            n = parseFloat(e);
                          return j` <iframe
      style="border-radius: var(--curvature);box-shadow:0px 0px 12px 0px rgba(0,0,0,.1), 0px 0px 2px 0px rgba(0,0,0,.15);"
      width="300"
      height="300"
      frameborder="0"
      scrolling="no"
      marginheight="0"
      marginwidth="0"
      src="https://www.openstreetmap.org/export/embed.html?bbox=${n - 0.005}000000%2C${i -
                            0.005}%2C${n + 0.005}000000%2C${i +
                            0.005}000000&amp;layer=mapnik&amp;marker=${`${t}000000%2C${e}000000`}"
    ></iframe>`;
                        }
                        return j`<div style="display:flex">
      <temba-icon name="${ve.download}"></temba-icon>
      <div>Attachment ${s}</div>
    </div>`;
                      }
                      return (
                        (r = j`
      <img src="${o}" style="height:auto;width:100%;display:block;" />
    `),
                        j`<div style="">${r}</div>`
                      );
                    })(t)}
                  </div>`
              )}
            </div> `
            : null
        }
      </div>

      ${
        t.msg.text || t.msg.attachments || t.optin
          ? null
          : j`<div class="unsupported">Unsupported Message</div>`
      }

      <div
        class="msg-summary"
        style="align-items:center;flex-direction:row${e ? '-reverse' : ''}"
      >
        <div style="flex-grow:1"></div>
        ${n}
      </div>
    </div>

    ${
      !e && t.created_by
        ? j`<temba-user
          style="margin-left:0.5em"
          email=${t.created_by.email}
        ></temba-user>`
        : null
    }
  </div>`
      );
    },
    kl = t => j`
    <temba-icon name="${ve.label}"></temba-icon>
    <div class="description">
      Message labeled with
      <div class="attn">${((t, e = 'and') => oe(t, t => t.name, e))(t.labels, 'and')}</div>
    </div>
  `,
    Al = (t, e, i) =>
      i
        ? j`<div class="" style="display: flex">
      <temba-icon name="${ve.inbox}"></temba-icon>
      <div class="description">
        ${yl(t.created_by)} ${e} a
        <span
          onclick="goto(event)"
          class="linked"
          href="/ticket/all/open/${t.ticket.uuid}/"
        >
          ticket
        </span>
      </div>
    </div>`
        : j`
    <div class="assigned active">
      <div style="text-align:center">
        ${t.created_by ? j` ${yl(t.created_by)} ${e} this ticket ` : j` This ticket was ${e} `}
      </div>
      <div class="subtext" style="justify-content:center">
        <temba-date
          class="time"
          value="${t.created_on}"
          display="duration"
        ></temba-date>
      </div>
    </div>
  `,
    Cl = function(t) {
      const e = t.target,
        i = this.host.getEventsPane();
      'IMG' == e.tagName &&
        (this.host.showMessageAlert ||
          (i.scrollTop > e.offsetTop - 1e3 &&
            e.offsetTop > i.scrollHeight - 500 &&
            this.host.scrollToBottom()));
    };
  class Sl extends ue {
    constructor() {
      super(),
        (this.eventGroups = []),
        (this.refreshing = !1),
        (this.fetching = !1),
        (this.complete = !1),
        (this.debug = !1),
        (this.showMessageAlert = !1),
        (this.ticket = null),
        (this.endDate = null),
        (this.tickets = null),
        (this.ticketEvents = {}),
        (this.lastHeight = 0),
        (this.refreshTimeout = null),
        (this.empty = !1);
    }
    connectedCallback() {
      super.connectedCallback(),
        this.shadowRoot.addEventListener('load', Cl, !0),
        (this.store = document.querySelector('temba-store'));
    }
    disconnectedCallback() {
      super.disconnectedCallback(), this.shadowRoot.removeEventListener('load', Cl, !0);
    }
    getTicketForEvent(t) {
      return this.getTicket(t.ticket.uuid);
    }
    getTicket(t) {
      return (this.tickets || []).find(e => e.uuid === t);
    }
    static get styles() {
      return r`
      ${r`
    .grouping {
      margin-top: 1em;
    }

    .grouping.verbose {
      background: #f9f9f9;
      color: var(--color-dark);
      --color-link-primary: rgba(38, 166, 230, 1);
      pointer-events: none;
      background: #fefefe;
      box-shadow: -8px 0px 8px 1px rgba(0, 0, 0, 0.05) inset;
      margin-right: -16px;
      padding-right: 16px;
      margin-bottom: 1.3em;
      max-width: 100%;
    }

    .grouping .items {
      display: block;
    }

    .grouping.verbose .items {
      opacity: 0;
      max-height: 0;
      display: flex;
      flex-direction: column;
      user-select: auto;
    }

    .grouping.flows .items {
      padding: 0;
    }

    .grouping.messages .items {
      display: flex;
      flex-direction: column;
      margin: 0em 0.75em;
    }

    .grouping.verbose.expanded .items {
      transition: max-height var(--transition-speed) ease-in-out,
        opacity var(--transition-speed) ease-in-out;
      opacity: 1;
      max-height: 1000px;
      padding: 1em 1em;
    }

    .grouping.verbose.expanded {
      border-top: 1px solid #f3f3f3;
      border-bottom: 1px solid #f3f3f3;
    }

    .grouping.verbose.expanded,
    .grouping.verbose .event-count {
      pointer-events: auto;
    }

    .grouping.verbose temba-icon {
    }

    .grouping.verbose > .event,
    .grouping.verbose > pre {
      max-height: 0px;
      padding-top: 0;
      padding-bottom: 0;
      margin-top: 0;
      margin-bottom: 0;
      opacity: 0;
    }

    .grouping.verbose .attn {
      color: #666;
    }

    .event-count {
      position: relative;
      font-size: 0.8em;
      text-align: center;
      margin: 0 auto;
      display: table;
      padding: 3px 10px;
      font-weight: 400;
      color: #999;
      cursor: pointer;
      width: 100%;
      opacity: 1;
    }

    .event-count temba-icon {
      display: inline-block;
      position: absolute;
      right: 5px;
      top: 5px;
    }

    .event-count:hover {
      color: var(--color-link-primary-hover);
    }

    .expanded .event-count {
      padding: 0;
      pointer-events: none;
    }

    .grouping.flows {
      margin-left: 1em;
      margin-right: 1em;
      margin-bottom: 1.5em;

      border: 1px solid #f2f2f2;
      border-radius: var(--curvature);
      padding: 0.5em 1em;
    }

    .grouping.flows .event {
      margin: 0;
      padding: 0;
    }

    .grouping.tickets {
      margin-bottom: 2em;
    }

    pre {
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    .grouping.verbose.expanded .event,
    .grouping.verbose.expanded pre {
      max-height: 500px;
      opacity: 1;
    }

    .grouping-close-button {
      position: relative;
      display: inline-block;
      opacity: 0;
      float: right;
      --icon-color: #666;
    }

    .grouping.verbose.expanded:hover .grouping-close-button {
      opacity: 1;
    }

    .grouping.messages,
    .grouping.tickets {
      display: flex;
      flex-direction: column;
    }

    .event {
      margin: 0.25em 0.5em;
      border-radius: var(--curvature);
      flex-grow: 1;
    }

    .msg {
      border-radius: calc(var(--curvature) * 2.5);
      border: 2px solid rgba(100, 100, 100, 0.1);
      max-width: 300px;
      word-break: break-word;
      overflow: hidden;
    }

    .msg.attachments-1.no-message {
      border: 2px solid transparent;
      background-color: transparent !important;
    }

    .msg .text {
      padding: var(--event-padding);
    }

    .event.msg_received .msg {
      background: rgba(200, 200, 200, 0.1);
    }

    .event.msg_created,
    .event.broadcast_created,
    .event.ivr_created,
    .event.ticket_note_added {
      align-self: flex-end;
    }

    .event.msg_created .msg,
    .event.broadcast_created .msg,
    .event.ivr_created .msg {
      background: var(--color-primary-dark);
      color: white;
      font-weight: 400;
    }

    .msg.automated {
      background: var(--color-automated) !important;
    }

    .queued {
      opacity: 0.3;
    }

    .optin_requested {
      --icon-color: var(--color-primary-dark);
    }

    .webhook_called {
      --icon-color: #e68628;
      word-break: break-all;
    }

    .webhook_called .failed {
      --icon-color: var(--color-error);
      color: var(--color-error);
    }

    .input_labels_added,
    .contact_name_changed,
    .contact_field_changed,
    .contact_urns_changed,
    .contact_language_changed,
    .run_result_changed {
      --icon-color: rgba(1, 193, 175, 1);
    }

    .email_sent {
      --icon-color: #8e5ea7;
    }

    .contact_groups_changed .added {
      --icon-color: #309c42;
    }
    .contact_groups_changed .removed {
      --icon-color: var(--color-error);
    }

    .event.error .description,
    .event.failure .description {
      color: var(--color-error);
    }

    .description.error {
      color: var(--color-error);
    }

    .info {
      border: 1px solid rgba(100, 100, 100, 0.2);
      background: rgba(10, 10, 10, 0.02);
    }

    .ticket_note_added {
      max-width: 300px;
    }

    .note-summary {
      display: flex;
      flex-direction: row;
      font-size: 85%;
      margin-top: -0.5em;
      color: rgba(0, 0, 0, 0.6);
      padding: 8px 3px;
    }

    .ticket_note_added .description {
      border: 2px solid rgba(100, 100, 100, 0.1);
      background: rgb(255, 249, 194);
      padding: var(--event-padding);
      font-weight: 400;
      color: rgba(0, 0, 0, 0.6);
      border-radius: calc(var(--curvature) * 2.5);
    }

    .channel_event {
      --icon-color: rgb(200, 200, 200);
    }

    .airtime_transferred,
    .flow_exited,
    .flow_entered,
    .ticket_opened,
    .ticket_reopened,
    .ticket_closed,
    .call_started,
    .campaign_fired {
      --icon-color: rgba(223, 65, 159, 1);
    }

    .active-ticket.ticket_opened {
      padding: 0em 1em;
    }

    .ticket_closed .inactive .subtext {
      display: none;
    }

    .attn {
      color: var(--color-text);
    }

    .flow_exited,
    .flow_entered {
      align-self: center;
      max-width: 80%;
      display: flex;
      flex-direction: row;
    }

    .flow_exited temba-icon,
    .flow_entered temba-icon {
    }

    .event {
      display: flex;
      align-items: center;
    }

    .event .description {
      flex-grow: 1;
    }

    .msg-summary {
      display: flex;
      font-size: 85%;
      color: rgba(0, 0, 0, 0.6);
      padding: 6px 3px;
      margin-bottom: 0.5em;
      margin-top: -0.5em;
    }

    .msg-summary temba-icon.log {
      --icon-color: rgba(0, 0, 0, 0.2);
    }

    .msg-summary temba-icon.log:hover {
      --icon-color: var(--color-link-primary-hover);
      cursor: pointer;
    }

    .msg-summary temba-icon.error {
      --icon-color: rgba(var(--error-rgb), 0.75);
    }

    .msg-summary temba-icon.error:hover {
      --icon-color: var(--color-error);
      cursor: pointer;
    }

    .msg-summary temba-icon.broadcast {
      --icon-color: rgba(90, 90, 90, 0.5);
    }

    .msg-summary * {
      display: flex;
      margin-right: 1px;
      margin-left: 1px;
    }

    .unsupported {
      border: 1px solid #f2f2f2;
      color: #999;
      padding: 0.5em 1em;
      border-radius: var(--curvature);
    }

    .optin {
      align-items: center;
      padding: 0 0.2em;
    }

    .time {
      padding: 0.3em 1px;
    }

    .subtext .time {
      padding: 0em;
    }

    .status {
      padding: 0.3em 3px;
    }

    .separator {
      padding: 0.3em 0px;
    }

    .recipients {
      padding: 0.3em 3px;
    }

    .verbose temba-icon,
    .flows temba-icon,
    .tickets temba-icon {
      margin-right: 0.75em;
    }

    .attn {
      display: inline-block;
      font-weight: 500;
      margin: 0px 2px;
      word-break: break-all;
      white-space: break-spaces;
    }

    .subtext {
      font-size: 80%;
    }

    .body-pre {
      white-space: pre-wrap;
      word-wrap: break-word;
      font-size: 90%;
    }

    a,
    .linked {
      color: var(--color-link-primary);
      cursor: pointer;
    }

    a:hover,
    .linked:hover {
      text-decoration: underline;
      color: var(--color-link-primary-hover);
    }

    temba-icon.error {
      --icon-color: var(--color-error);
    }

    .delivery-error {
      --icon-color: var(--color-error);
      margin-right: 0.25em;
    }

    .flow {
      --icon-color: #ddd;
      background: #fff;
      width: 18px;
      height: 18px;
      padding-top: 4px;
      padding-left: 9px;
      border: 0px solid #f3f3f3;
    }

    .assigned {
      color: #777;
      max-width: 300px;
      margin-left: auto;
      margin-right: auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 10px;
    }

    .assigned .attn {
      color: #777;
    }

    .attachments {
      display: flex;
      flex-wrap: wrap;
      margin: -0.2em;
    }

    .attachment {
      flex: 1 0 45%;
      border-top: 0.05em solid transparent;
      border-left: 0.05em solid transparent;
      margin-top: 0.05em;
      margin-left: 0.05em;
    }
  `}

      .wrapper {
        border: 0px solid green;
        display: flex;
        flex-direction: column;
        align-items: items-stretch;
        flex-grow: 1;
        min-height: 0;
      }

      .events {
        overflow-y: scroll;
        overflow-x: hidden;
        background: #fff;
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        min-height: 0;
        padding-top: 3em;
        padding-bottom: 1em;
      }

      temba-loading {
        align-self: center;
        margin-top: 0.025em;
        position: absolute;
        z-index: 250;
        padding-top: 1em;
      }

      .new-messages-container {
        display: flex;
        z-index: 1;
        background: pink;
        margin-bottom: 0px;
      }

      .new-messages {
        pointer-events: none;
        margin: 0 auto;
        margin-top: 0em;
        margin-bottom: -2.5em;
        padding: 0.25em 1em;
        border-radius: var(--curvature);
        background: var(--color-primary-dark);
        color: var(--color-text-light);
        opacity: 0;
        cursor: pointer;
        transition: all var(--transition-speed) ease-in-out;
        box-shadow: rgb(0 0 0 / 15%) 0px 3px 3px 0px;
      }

      .new-messages.expanded {
        margin-top: -2.5em;
        margin-bottom: 0.5em;
        pointer-events: auto;
        opacity: 1;
        pointer: cursor;
      }

      .scroll-title {
        display: flex;
        flex-direction: column;
        z-index: 2;
        border-top-left-radius: var(--curvature);
        overflow: hidden;
        box-shadow: 0px 3px 3px 0px rgba(0, 0, 0, 0.15);
        background: rgb(240, 240, 240);
        padding: 1em 1.2em;
        font-size: 1.2em;
        font-weight: 400;
      }

      .attachment img {
        cursor: pointer;
      }
    `;
    }
    firstUpdated(t) {
      super.firstUpdated(t), (this.handleClose = this.handleClose.bind(this));
    }
    updated(t) {
      if (
        (super.updated(t),
        t.has('mostRecentEvent') &&
          t.get('mostRecentEvent') &&
          this.mostRecentEvent &&
          this.fireCustomEvent(Me.Refreshed),
        t.has('endDate') &&
          this.refreshTimeout &&
          this.endDate &&
          window.clearTimeout(this.refreshTimeout),
        t.has('uuid'))
      )
        if (null == this.uuid) this.reset();
        else {
          const t = `/contact/history/${this.uuid}/?_format=json`;
          if (this.endpoint !== t) {
            if ((this.reset(), this.endDate)) {
              const t = new Date(this.endDate);
              this.nextBefore = 1e3 * t.getTime() + 1e3;
            }
            (this.endpoint = t), this.refreshTickets();
          }
        }
      if (
        (t.has('ticket') && ((this.endpoint = null), this.requestUpdate('uuid')),
        t.has('refreshing') && this.refreshing && this.endpoint && !this.endDate)
      ) {
        const t = 1e3 * (this.getLastEventTime() - 1);
        let e = !1;
        bl(!1, this.endpoint, this.ticket, null, t)
          .then(t => {
            t.events && t.events.length > 0 && this.updateMostRecent(t.events[0]),
              t.events.forEach(t => {
                if (t.type === _l.TICKET_OPENED) {
                  const e = t;
                  this.ticketEvents[e.ticket.uuid] = e;
                }
              });
            const i = t.events.reverse();
            let o = 0;
            this.eventGroups.forEach(t => {
              const e = t.events.length;
              (t.events = t.events.filter(
                t => !i.find(e => t.created_on == e.created_on && t.type === e.type)
              )),
                (o += e - t.events.length);
            }),
              (this.lastRefreshAdded = i.length - o);
            const n = [...this.eventGroups];
            if (this.eventGroups.length > 0) {
              const t = n.splice(n.length - 1, 1)[0];
              (e = t.open), t.events.length > 0 && i.splice(0, 0, ...t.events);
            }
            const s = this.getEventGroups(i);
            s.length &&
              (e && (s[s.length - 1].open = e),
              (this.eventGroups = [...n, ...s].filter(t => t.events.length > 0))),
              (this.refreshing = !1),
              this.scheduleRefresh();
          })
          .catch(() => {
            (this.refreshing = !1), this.scheduleRefresh();
          });
      }
      if (
        (t.has('fetching') &&
          this.fetching &&
          (this.nextBefore || (this.nextBefore = 1e3 * new Date().getTime() - 1e3),
          (this.httpComplete = bl(
            this.empty,
            this.endpoint,
            this.ticket,
            this.nextBefore,
            this.nextAfter
          ).then(t => {
            t.events &&
              t.events.length > 0 &&
              (this.updateMostRecent(t.events[0]),
              t.events.forEach(t => {
                if (t.type === _l.TICKET_OPENED) {
                  const e = t;
                  this.ticketEvents[e.ticket.uuid] = e;
                }
              }));
            let e = !1;
            const i = t.events ? t.events.reverse() : [];
            if (this.eventGroups.length > 0) {
              const t = this.eventGroups.splice(0, 1)[0];
              (e = t.open), i.push(...t.events);
            }
            const o = this.getEventGroups(i);
            o.length &&
              (e && (o[o.length - 1].open = e), (this.eventGroups = [...o, ...this.eventGroups])),
              t.next_before === this.nextBefore && (this.complete = !0),
              (this.nextBefore = t.next_before),
              (this.nextAfter = t.next_after),
              (this.fetching = !1),
              (this.empty = !1);
          }))),
        t.has('refreshing') && !this.refreshing && this.lastRefreshAdded > 0)
      ) {
        const t = this.getEventsPane();
        if (this.lastHeight > 0) {
          const e = t.scrollHeight - this.lastHeight;
          t.scrollHeight - t.scrollTop - e - t.clientHeight < 500
            ? this.scrollToBottom()
            : (this.showMessageAlert = !0);
        }
        this.eventGroups.length > 0 && (this.lastHeight = t.scrollHeight);
      }
      if (t.has('fetching') && !this.fetching && void 0 !== t.get('fetching')) {
        const t = this.getEventsPane();
        if (this.lastHeight && t.scrollHeight > this.lastHeight) {
          const e = t.scrollTop + t.scrollHeight - this.lastHeight;
          t.scrollTop = e;
        }
        this.lastHeight || this.scrollToBottom(),
          this.eventGroups.length > 0 && (this.lastHeight = t.scrollHeight);
      }
      t.has('endpoint') && this.endpoint && ((this.fetching = !0), (this.empty = !0));
    }
    refreshTickets() {
      if (this.ticket) {
        let t = `/api/v2/tickets.json?contact=${this.uuid}`;
        this.ticket && (t = `${t}&ticket=${this.ticket}`),
          Qt(t).then(t => {
            this.tickets = t.reverse();
          });
      }
    }
    getEventsPane() {
      return this.getDiv('.events');
    }
    scrollToBottom(t = !1) {
      const e = this.getEventsPane();
      e.scrollTo({ top: e.scrollHeight, behavior: t ? 'smooth' : 'auto' }),
        (this.showMessageAlert = !1),
        window.setTimeout(() => {
          e.scrollTo({ top: e.scrollHeight, behavior: t ? 'smooth' : 'auto' });
        }, 0);
    }
    refresh() {
      this.scheduleRefresh(500);
    }
    getEventGroups(t) {
      const e = [];
      let i;
      for (const o of t) {
        const t = xl(o, this.ticket);
        i && i.type === t
          ? i.events.push(o)
          : (i && e.push(i), (i = { open: !1, events: [o], type: t }));
      }
      return i && i.events.length > 0 && e.push(i), e;
    }
    scheduleRefresh(t = -1) {
      if (this.endDate) return;
      let e = t;
      if (-1 === t) {
        const t = this.getLastEventTime();
        e = Math.max(Math.min((new Date().getTime() - t) / 2, 1e4), 500);
      }
      t > -1 && this.refreshTimeout && window.clearTimeout(this.refreshTimeout),
        (this.refreshTimeout = window.setTimeout(() => {
          this.refreshing
            ? (this.scheduleRefresh(), (this.refreshing = !1))
            : (this.refreshing = !0);
        }, e));
    }
    reset() {
      (this.endpoint = null),
        (this.tickets = null),
        (this.ticketEvents = {}),
        (this.eventGroups = []),
        (this.fetching = !1),
        (this.complete = !1),
        (this.nextBefore = null),
        (this.nextAfter = null),
        (this.lastHeight = 0);
    }
    handleEventGroupShow(t) {
      const e = t.currentTarget,
        i = parseInt(e.getAttribute('data-group-index'));
      (this.eventGroups[this.eventGroups.length - i - 1].open = !0),
        this.requestUpdate('eventGroups');
    }
    handleEventGroupHide(t) {
      t.preventDefault(), t.stopPropagation();
      const e = t.currentTarget,
        i = parseInt(e.getAttribute('data-group-index'));
      (this.eventGroups[this.eventGroups.length - i - 1].open = !1),
        this.requestUpdate('eventGroups');
    }
    handleScroll() {
      this.getEventsPane().scrollTop <= 100 &&
        this.eventGroups.length > 0 &&
        !this.fetching &&
        !this.complete &&
        (this.fetching = !0);
    }
    updateMostRecent(t) {
      (this.mostRecentEvent &&
        this.mostRecentEvent.type === t.type &&
        this.mostRecentEvent.created_on === t.created_on) ||
        (this.mostRecentEvent = t);
    }
    getLastEventTime() {
      const t = this.eventGroups[this.eventGroups.length - 1];
      if (t) {
        const e = t.events[t.events.length - 1];
        return new Date(e.created_on).getTime();
      }
      return 0;
    }
    renderEvent(t) {
      switch (t.type) {
        case _l.IVR_CREATED:
        case _l.MESSAGE_CREATED:
        case _l.MESSAGE_RECEIVED:
        case _l.BROADCAST_CREATED:
          return t.created_by && (t.created_by = this.store.getUser(t.created_by.email)), wl(t);
        case _l.FLOW_ENTERED:
        case _l.FLOW_EXITED:
          return (t => {
            let e = 'Interrupted',
              i = ve.flow_interrupted;
            return (
              'I' !== t.status &&
                (t.type === _l.FLOW_ENTERED
                  ? ((e = 'Started'), (i = ve.flow))
                  : ((e = 'Completed'), (i = ve.flow))),
              j`
    <temba-icon name="${i}"></temba-icon>
    <div class="description">
      ${e}
      <span
        class="linked"
        href="/flow/editor/${t.flow.uuid}/"
        onclick="goto(event)"
      >
        ${t.flow.name}
      </span>
    </div>
  `
            );
          })(t);
        case _l.RUN_RESULT_CHANGED:
          return (t =>
            t.name.startsWith('_')
              ? null
              : j`
    <temba-icon name="${ve.updated}"></temba-icon>
    <div class="description">
      Updated
      <div class="attn">${t.name}</div>
      to
      <div class="attn">${t.value}</div>
      ${
        t.category
          ? j`with category
            <div class="attn">${t.category}</div>`
          : null
      }
    </div>
  `)(t);
        case _l.CONTACT_FIELD_CHANGED:
          return (t => j`
    <temba-icon name="${ve.contact_updated}"></temba-icon>
    <div class="description">
      ${
        t.value
          ? j`Updated
            <div class="attn">${t.field.name}</div>
            to
            <div class="attn">${t.value.text}</div>`
          : j`Cleared
            <div class="attn">${t.field.name}</div>`
      }
    </div>
  `)(t);
        case _l.CONTACT_NAME_CHANGED:
          return (t => j`
    <temba-icon name="${ve.contact_updated}"></temba-icon>
    <div class="description">
      Updated
      <div class="attn">Name</div>
      to
      <div class="attn">${t.name}</div>
    </div>
  `)(t);
        case _l.CONTACT_URNS_CHANGED:
          return (t => j`
    <temba-icon name="${ve.contact_updated}"></temba-icon>
    <div class="description">
      Updated
      <div class="attn">URNs</div>
      to
        ${oe(t.urns, t => j`<div class="attn">${t.split(':')[1].split('?')[0]}</div>`)}
      </div>
    </div>
  `)(t);
        case _l.EMAIL_SENT:
          return (t => j`
    <temba-icon name="${ve.email}"></temba-icon>
    <div class="description">
      Email sent to
      <div class="attn">${ie(t.to, 'and')}</div>
      with subject
      <div class="attn">${t.subject}</div>
    </div>
  `)(t);
        case _l.INPUT_LABELS_ADDED:
          return kl(t);
        case _l.TICKET_OPENED:
          return Al(t, 'opened', !this.ticket);
        case _l.TICKET_NOTE_ADDED:
          return (t => j` <div style="display:flex;align-items:flex-start">
    <div style="display:flex;flex-direction:column">
      <div class="description">${t.note}</div>
      <div class="note-summary">
        <div style="flex-grow:1"></div>
        <temba-date
          class="time"
          value="${t.created_on}"
          display="duration"
        ></temba-date>
      </div>
    </div>
    <temba-user email=${t.created_by.email}></temba-user>
  </div>`)(t);
        case _l.TICKET_ASSIGNED:
          return (t => j`
    <div class="assigned active">
      <div style="text-align:center">
        ${
          t.assignee
            ? t.assignee.id === t.created_by.id
              ? j`${yl(t.created_by)} took this ticket`
              : j`${yl(t.created_by)} assigned this ticket to
                <div class="attn">${yl(t.assignee)}</div>`
            : j`${yl(t.created_by)} unassigned this ticket`
        }
      </div>
      <div class="subtext" style="justify-content:center">
        <temba-date
          class="time"
          value="${t.created_on}"
          display="duration"
        ></temba-date>
      </div>
    </div>
  `)(t);
        case _l.TICKET_REOPENED:
          return Al(t, 'reopened', !this.ticket);
        case _l.TICKET_CLOSED:
          return Al(t, 'closed', !this.ticket);
        case _l.ERROR:
        case _l.FAILURE:
          return (t => j`
    <temba-icon
      name="${ve.error}"
      style="--icon-color:var(--color-error)"
    ></temba-icon>
    <div class="description">
      ${t.text}
      ${t.type === _l.FAILURE ? j`<div>Run ended prematurely, check the flow design.</div>` : null}
    </div>
  `)(t);
        case _l.CONTACT_GROUPS_CHANGED:
          return (t => {
            const e = t.groups_added || t.groups_removed,
              i = !!t.groups_added;
            return j`
    <temba-icon
      name="${ve.users}"
      class="${Ht({ added: i, removed: !i })}"
    ></temba-icon>
    <div class="description">
      ${i ? 'Added to' : 'Removed from'}
      ${oe(
        e,
        t => j`<span
            class="linked"
            onclick="goto(event)"
            href="/contact/filter/${t.uuid}"
            >${t.name}</span
          >`
      )}
      ${t.type === _l.FAILURE ? j`<div>Run ended prematurely, check the flow design.</div>` : null}
    </div>
  `;
          })(t);
        case _l.WEBHOOK_CALLED:
          return (t => j`
    <div
      class="${'success' === t.status ? '' : 'failed'}"
      style="display: flex"
    >
      <temba-icon name="${ve.webhook}"></temba-icon>
      <div class="description">
        ${'success' === t.status ? j`Successfully called ${t.url}` : j`Failed to call ${t.url}`}
      </div>
    </div>
  `)(t);
        case _l.AIRTIME_TRANSFERRED:
          return (t =>
            0 === parseFloat(t.actual_amount)
              ? j`<temba-icon
        name="${ve.error}"
        style="--icon-color: var(--color-error)"
      ></temba-icon>
      <div class="description error">Airtime transfer failed</div>`
              : j`<temba-icon name="${ve.airtime}"></temba-icon>
    <div class="description">
      Transferred
      <div class="attn">${t.actual_amount} ${t.currency}</div>
      of airtime
    </div>`)(t);
        case _l.CALL_STARTED:
          return j`<temba-icon name="${ve.call}"></temba-icon>
    <div class="description">Call Started</div>`;
        case _l.CAMPAIGN_FIRED:
          return (t => j`<temba-icon name="${ve.campaign}"></temba-icon>
    <div class="description">
      Campaign
      <span
        class="linked"
        onclick="goto(event, this)"
        href="/campaign/read/${t.campaign.uuid}/"
        >${t.campaign.name}</span
      >
      ${'S' === t.fired_result ? 'skipped' : 'triggered'}
      <span
        class="linked"
        onclick="goto(event, this)"
        href="/campaignevent/read/${t.campaign.uuid}/${t.campaign_event.id}/"
      >
        ${t.campaign_event.offset_display}
        ${t.campaign_event.relative_to.name}</span
      >
    </div>`)(t);
        case _l.CHANNEL_EVENT:
          return (t => {
            var e, i;
            let o = '',
              n = ve.call;
            return (
              'mt_miss' === t.event.type
                ? ((o = 'Missed outgoing call'), (n = ve.call_missed))
                : 'mo_miss' === t.event.type
                ? ((o = 'Missed incoming call'), (n = ve.call_missed))
                : 'new_conversation' === t.event.type
                ? ((o = 'Started Conversation'), (n = ve.event))
                : 'welcome_message' === t.channel_event_type
                ? ((o = 'Welcome Message Sent'), (n = ve.event))
                : 'referral' === t.event.type
                ? ((o = 'Referred'), (n = ve.event))
                : 'follow' === t.event.type
                ? ((o = 'Followed'), (n = ve.event))
                : 'stop_contact' === t.event.type
                ? ((o = 'Stopped'), (n = ve.contact_stopped))
                : 'mt_call' === t.event.type
                ? (o = 'Outgoing Phone Call')
                : 'mo_call' == t.event.type
                ? (o = 'Incoming Phone call')
                : 'optin' == t.event.type
                ? ((o = j`Opted in to
      <span class="attn">${null === (e = t.event.optin) || void 0 === e ? void 0 : e.name}</span>`),
                  (n = ve.optin))
                : 'optout' == t.event.type &&
                  ((o = j`Opted out of
      <span class="attn">${null === (i = t.event.optin) || void 0 === i ? void 0 : i.name}</span>`),
                  (n = ve.optout)),
              j`<temba-icon name="${n}"></temba-icon>
    <div class="description">${o}</div>`
            );
          })(t);
        case _l.CONTACT_LANGUAGE_CHANGED:
          return (t => j`<temba-icon name="${ve.contact_updated}"></temba-icon>
    <div class="description">
      Language updated to <span class="attn">${t.language}</span>
    </div>`)(t);
        case _l.OPTIN_REQUESTED:
          return (t => j`<temba-icon name="${ve.optin_requested}"></temba-icon>
    <div class="description">
      Requested opt-in for <span class="attn">${t.optin.name}</span>
    </div>`)(t);
      }
      return j`<temba-icon
        name="alert-triangle"
        style="fill:var(--color-error)"
      ></temba-icon>
      <div class="description">${t.type}</div>`;
    }
    handleClose(t) {
      this.httpComplete = Yt('/api/v2/ticket_actions.json', { tickets: [t], action: 'close' })
        .then(() => {
          this.refreshTickets(),
            this.refresh(),
            this.fireCustomEvent(Me.ContentChanged, { ticket: { uuid: t, status: 'closed' } });
        })
        .catch(t => {
          console.error(t);
        });
    }
    checkForAgentAssignmentEvent(t) {
      this.httpComplete = Qt(`/api/v2/tickets.json?uuid=${this.ticket}`).then(e => {
        if (1 === e.length) {
          const i = e[0];
          i.assignee && i.assignee.email === t
            ? this.fireCustomEvent(Me.ContentChanged, {
                ticket: { uuid: this.ticket, assigned: 'self' }
              })
            : this.fireCustomEvent(Me.ContentChanged, {
                ticket: { uuid: this.ticket, assigned: i.assignee ? i.assignee : null }
              });
        }
      });
    }
    getEventHandlers() {
      return [{ event: 'scroll', method: ee(this.handleScroll, 50) }];
    }
    isPurged(t) {
      return !this.ticketEvents[t.uuid];
    }
    handleEventClicked(t) {
      const e = t.target;
      if ('IMG' == e.tagName) {
        const t = document.querySelector('temba-lightbox');
        t && t.showElement(e);
      }
    }
    renderEventContainer(t) {
      return j`
      <div
        @click=${this.handleEventClicked}
        class="${this.ticket ? 'active-ticket' : ''} event ${t.type}"
      >
        ${this.renderEvent(t)}
      </div>
      ${this.debug ? j`<pre>${JSON.stringify(t, null, 2)}</pre>` : null}
    `;
    }
    render() {
      return j`
      ${
        this.fetching
          ? j`<temba-loading units="5" size="10"></temba-loading>`
          : j`<div style="height:0em"></div>`
      }
      <div class="events" @scroll=${this.handleScroll}>
        ${this.eventGroups.map((t, e) => {
          const i = xl(t.events[0], this.ticket),
            o = this.eventGroups.length - e - 1,
            n = Ht({ grouping: !0, [i]: !0, expanded: t.open });
          return j`<div class="${n}">
            ${
              'verbose' === i
                ? j`<div
                  class="event-count"
                  @click=${this.handleEventGroupShow}
                  data-group-index="${o}"
                >
                  ${
                    t.open
                      ? j`<temba-icon
                        @click=${this.handleEventGroupHide}
                        data-group-index="${o}"
                        name="x"
                        clickable
                      ></temba-icon>`
                      : j`${t.events.length}
                      ${1 === t.events.length ? j`event` : j`events`} `
                  }
                </div>`
                : null
            }

            <div class="items">
              ${t.events.map(t => {
                if (t.type === _l.TICKET_ASSIGNED && t.note) {
                  const e = { ...t };
                  return (
                    (e.type = _l.TICKET_NOTE_ADDED),
                    j`${this.renderEventContainer(e)}${this.renderEventContainer(t)}`
                  );
                }
                return this.renderEventContainer(t);
              })}
            </div>
          </div>`;
        })}
      </div>

      ${
        this.contact && 'active' === this.contact.status
          ? j`<div class="new-messages-container">
              <div
                @click=${() => {
                  this.scrollToBottom(!0);
                }}
                class="new-messages ${Ht({ expanded: this.showMessageAlert })}"
              >
                New Messages
              </div>
            </div>`
          : null
      }
      
      </div>
    `;
    }
  }
  t([ge({ type: Object })], Sl.prototype, 'contact', void 0),
    t([ge({ type: String })], Sl.prototype, 'uuid', void 0),
    t([ge({ type: String })], Sl.prototype, 'agent', void 0),
    t([ge({ type: Array })], Sl.prototype, 'eventGroups', void 0),
    t([ge({ type: Boolean })], Sl.prototype, 'refreshing', void 0),
    t([ge({ type: Boolean })], Sl.prototype, 'fetching', void 0),
    t([ge({ type: Boolean })], Sl.prototype, 'complete', void 0),
    t([ge({ type: String })], Sl.prototype, 'endpoint', void 0),
    t([ge({ type: Boolean })], Sl.prototype, 'debug', void 0),
    t([ge({ type: Boolean })], Sl.prototype, 'showMessageAlert', void 0),
    t([ge({ attribute: !1, type: Object })], Sl.prototype, 'mostRecentEvent', void 0),
    t([ge({ type: String })], Sl.prototype, 'ticket', void 0),
    t([ge({ type: String })], Sl.prototype, 'endDate', void 0),
    t([ge({ type: Array })], Sl.prototype, 'tickets', void 0);
  class El extends ue {
    static get styles() {
      return r`
      temba-options {
        display: block;
        width: 100%;
        flex-grow: 1;
      }
    `;
    }
    constructor() {
      super(),
        (this.items = []),
        (this.cursorIndex = -1),
        (this.tabIndex = 1),
        (this.valueKey = 'id'),
        (this.loading = !1),
        (this.paused = !1),
        (this.internalFocusDisabled = !1),
        (this.refreshKey = '0'),
        (this.reverseRefresh = !0),
        (this.nextPage = null),
        (this.pages = 0),
        (this.pending = []),
        (this.refreshInterval = null),
        (this.store = document.querySelector('temba-store')),
        this.handleSelection.bind(this);
    }
    reset() {
      (this.selected = null),
        (this.nextPage = null),
        (this.cursorIndex = -1),
        (this.mostRecentItem = null),
        (this.items = []);
    }
    connectedCallback() {
      super.connectedCallback(),
        (this.refreshInterval = setInterval(() => {
          this.paused || (this.refreshKey = 'default_' + new Date().getTime());
        }, 1e4));
    }
    disconnectedCallback() {
      clearInterval(this.refreshInterval);
    }
    updated(t) {
      super.updated(t),
        t.has('endpoint') &&
          this.endpoint &&
          (this.reset(), (this.loading = !0), this.fetchItems()),
        t.has('loading') && (this.loading || this.fireCustomEvent(Me.FetchComplete)),
        t.has('refreshKey') && !t.has('endpoint') && this.refreshTop(),
        t.has('mostRecentItem') && this.mostRecentItem && this.fireCustomEvent(Me.Refreshed),
        t.has('cursorIndex') &&
          this.cursorIndex > -1 &&
          ((this.selected = this.items[this.cursorIndex]), this.handleSelected(this.selected)),
        t.has('items');
    }
    handleSelected(t) {
      const e = new Event('change', { bubbles: !0 });
      this.dispatchEvent(e);
    }
    getValue(t) {
      if (!t) return null;
      const e = this.valueKey.split('.');
      let i = t;
      for (; e.length > 0; ) {
        i = i[e.shift()];
      }
      return i;
    }
    setSelection(t) {
      const e = this.items.findIndex(e => this.getValue(e) === t);
      (this.cursorIndex = e), (this.selected = this.items[e]);
      const i = new Event('change', { bubbles: !0 });
      this.dispatchEvent(i);
    }
    getItemIndex(t) {
      return this.items.findIndex(e => this.getValue(e) === t);
    }
    removeItem(t) {
      const e = this.getItemIndex(t);
      this.items.splice(e, 1),
        (this.items = [...this.items]),
        (this.cursorIndex = Math.max(0, Math.min(this.items.length - 1, this.cursorIndex - 1))),
        this.requestUpdate('cursorIndex'),
        this.requestUpdate('items');
    }
    getSelection() {
      return this.selected;
    }
    refresh() {
      this.refreshKey = 'requested_' + new Date().getTime();
    }
    setEndpoint(t, e = null) {
      (this.endpoint = t), (this.nextSelection = e);
    }
    getRefreshEndpoint() {
      return this.endpoint;
    }
    async refreshTop() {
      if (!this.getRefreshEndpoint()) return;
      for (; this.pending.length > 0; ) {
        this.pending.pop().abort();
      }
      const t = new AbortController();
      this.pending.push(t);
      const e = this.items[this.cursorIndex];
      try {
        const i = await Vt(this.getRefreshEndpoint(), t),
          o = [...this.items];
        if (i.results) {
          i.results.forEach(t => {
            this.sanitizeOption && this.sanitizeOption(t);
            const e = this.getValue(t),
              i = o.findIndex(t => this.getValue(t) === e);
            i > -1 && o.splice(i, 1);
          });
          let t = i.results;
          this.reverseRefresh && (t = i.results.reverse());
          const n = [...t, ...o],
            s = n[0];
          if (
            ((this.mostRecentItem && JSON.stringify(this.mostRecentItem) === JSON.stringify(s)) ||
              (this.mostRecentItem = s),
            e)
          ) {
            const t = n[this.cursorIndex],
              i = this.getValue(e);
            if (i !== this.getValue(t)) {
              const t = n.findIndex(t => this.getValue(t) === i);
              (this.cursorIndex = t),
                window.setTimeout(() => {
                  const t = this.shadowRoot.querySelector('temba-options');
                  if (t) {
                    const e = t.shadowRoot.querySelector('.option.focused');
                    e && e.scrollIntoView({ block: 'end', inline: 'nearest' });
                  }
                }, 0);
            }
          }
          this.items = n;
        }
      } catch (t) {}
    }
    async fetchItems() {
      for (; this.pending.length > 0; ) {
        this.pending.pop().abort();
      }
      let t = this.endpoint,
        e = this.pages || 1,
        i = 0,
        o = null,
        n = [];
      for (; e > 0 && t; ) {
        const s = new AbortController();
        this.pending.push(s);
        try {
          const r = await Vt(t, s);
          this.sanitizeOption && r.results.forEach(this.sanitizeOption),
            r.results && (n = n.concat(r.results)),
            (o = r.next),
            (t = o),
            e--,
            i++;
        } catch (t) {
          return this.reset(), void console.log(t);
        }
        this.nextPage = o;
      }
      this.pages = i;
      const s = n[0];
      (this.mostRecentItem && JSON.stringify(this.mostRecentItem) === JSON.stringify(s)) ||
        (this.mostRecentItem = s);
      const r = n[this.cursorIndex];
      if (
        !this.nextSelection &&
        this.selected &&
        r &&
        this.getValue(r) !== this.getValue(this.selected)
      ) {
        const t = n.findIndex(t => this.getValue(t) === this.getValue(this.selected));
        t > -1
          ? (this.cursorIndex = t)
          : 0 === this.cursorIndex
          ? this.requestUpdate('cursorIndex')
          : (this.cursorIndex = 0);
      }
      if (
        ((this.items = n),
        (this.loading = !1),
        (this.pending = []),
        this.nextSelection
          ? (this.setSelection(this.nextSelection), (this.nextSelection = !1))
          : -1 !== this.cursorIndex || this.isMobile() || (this.cursorIndex = 0),
        this.value)
      )
        this.setSelection(this.value), (this.value = null);
      else if (this.isMobile() && !this.selected) {
        (this.cursorIndex = -1), (this.value = null), (this.selected = null);
        const t = new Event('change', { bubbles: !0 });
        this.dispatchEvent(t);
      }
      return Promise.resolve();
    }
    handleScrollThreshold() {
      this.nextPage &&
        !this.loading &&
        ((this.loading = !0),
        Vt(this.nextPage).then(t => {
          this.sanitizeOption && t.results.forEach(this.sanitizeOption),
            (this.items = [...this.items, ...t.results]),
            (this.nextPage = t.next),
            this.pages++,
            (this.loading = !1);
        }));
    }
    renderHeader() {
      return null;
    }
    renderFooter() {
      return null;
    }
    getListStyle() {
      return '';
    }
    handleSelection(t) {
      const { selected: e, index: i } = t.detail;
      (this.selected = e), (this.cursorIndex = i), t.stopPropagation(), t.preventDefault();
    }
    render() {
      return j`
      ${this.renderHeader()}
      <temba-options
        style="${this.getListStyle()}"
        ?visible=${!0}
        ?block=${!0}
        ?hideShadow=${this.hideShadow}
        ?collapsed=${this.collapsed}
        ?loading=${this.loading}
        ?internalFocusDisabled=${this.internalFocusDisabled}
        .renderOption=${this.renderOption}
        .renderOptionDetail=${this.renderOptionDetail}
        @temba-scroll-threshold=${this.handleScrollThreshold}
        @temba-selection=${this.handleSelection.bind(this)}
        .options=${this.items}
        .cursorIndex=${this.cursorIndex}
      >
        <slot></slot>
      </temba-options>
      ${this.renderFooter()}
    `;
    }
  }
  t([ge({ type: Array, attribute: !1 })], El.prototype, 'items', void 0),
    t([ge({ type: Object, attribute: !1 })], El.prototype, 'selected', void 0),
    t([ge({ type: Number })], El.prototype, 'cursorIndex', void 0),
    t([ge({ type: String })], El.prototype, 'endpoint', void 0),
    t([ge({ type: String })], El.prototype, 'nextSelection', void 0),
    t([ge({ type: Number })], El.prototype, 'tabIndex', void 0),
    t([ge({ type: String })], El.prototype, 'valueKey', void 0),
    t([ge({ type: String })], El.prototype, 'value', void 0),
    t([ge({ type: Boolean })], El.prototype, 'loading', void 0),
    t([ge({ type: Boolean })], El.prototype, 'collapsed', void 0),
    t([ge({ type: Boolean })], El.prototype, 'hideShadow', void 0),
    t([ge({ type: Boolean })], El.prototype, 'paused', void 0),
    t([ge({ type: Boolean })], El.prototype, 'internalFocusDisabled', void 0),
    t([ge({ attribute: !1 })], El.prototype, 'getNextRefresh', void 0),
    t([ge({ attribute: !1 })], El.prototype, 'sanitizeOption', void 0),
    t([ge({ attribute: !1 })], El.prototype, 'renderOption', void 0),
    t([ge({ attribute: !1 })], El.prototype, 'renderOptionDetail', void 0),
    t([ge({ attribute: !1, type: Object })], El.prototype, 'mostRecentItem', void 0),
    t([ge({ type: String })], El.prototype, 'refreshKey', void 0);
  class Tl extends El {
    getRefreshEndpoint() {
      if (this.items.length > 0) {
        const t = this.items[0].ticket.last_activity_on;
        return this.endpoint + '?after=' + 1e3 * new Date(t).getTime();
      }
      return this.endpoint;
    }
    constructor() {
      super(),
        (this.agent = ''),
        (this.valueKey = 'ticket.uuid'),
        (this.renderOption = t => j`
        <div
          style="align-items:center; margin-top: 0.1em; margin-bottom: 0.1em"
        >
          <div
            style="display:flex; align-items: flex-start;border:0px solid red;"
          >
            <div style="flex: 1; color:#333;">
              <div
                style="font-weight:400;line-height:1.6;padding-right:0.5em;display:-webkit-box;-webkit-box-orient: vertical; -webkit-line-clamp: 1;overflow: hidden;"
              >
                ${t.name}
              </div>
              ${
                t.ticket.closed_on
                  ? null
                  : t.last_msg
                  ? j`
                    <div
                      style="font-size: 0.9em; display: -webkit-box;  -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;"
                    >
                      ${
                        'I' === t.last_msg.direction
                          ? j`<div
                              style="border-radius:9999px; background:var(--color-primary-dark);width:6px;height:6px;display:inline-block;margin:0px 2px;margin-bottom:1px;"
                            ></div>`
                          : null
                      }
                      ${
                        t.last_msg.text
                          ? t.last_msg.text
                          : t.last_msg.attachments
                          ? j`<div style="display:inline-block">
                              <div style="display:flex; margin-left:0.2em">
                                <temba-icon
                                  name="${ve.attachment}"
                                ></temba-icon>
                                <div style="flex-grow:1;margin-left:0.2em">
                                  Attachment
                                </div>
                              </div>
                            </div>`
                          : 'Unsupported Message'
                      }
                    </div></div>
                  `
                  : null
              }
            </div>
            <div
              style="margin-right: -5px; margin-top: 0px;display:flex;flex-direction:column;align-items:flex-end;max-width:60px;min-width:30px;border:0px solid green;text-align:right"
            >
              <div>
                ${
                  !t.ticket.closed_on && t.ticket.assignee
                    ? j`<temba-user
                      email=${t.ticket.assignee.email}
                      scale="0.8"
                    ></temba-user>`
                    : null
                }
              </div>
            </div>
          </div>

          <div style="font-size:0.8em;text-align:right;border:0px solid red;">
            <temba-date
              value=${t.ticket.closed_on || t.ticket.last_activity_on}
              display="duration"
            ></temba-date>
          </div>
        </div>
      `);
    }
  }
  t([ge({ type: String })], Tl.prototype, 'agent', void 0);
  const $l = { active: 'Active', blocked: 'Blocked', stopped: 'Stopped', archived: 'Archived' },
    Ol = {
      tel: 'Phone',
      whatsapp: 'WhatsApp',
      fcm: 'Firebase Cloud Messaging',
      twitter: 'Twitter'
    };
  class Ml extends lt {
    constructor() {
      super(...arguments), (this.level = 'info');
    }
    static get styles() {
      return r`
      :host {
        display: block;
      }

      .temba-alert {
        color: rgba(0, 0, 0, 0.8);
        padding: 0.65rem 1rem;
        border: 1px solid rgba(0, 0, 0, 0.35);
        border-left: 10px solid rgba(0, 0, 0, 0.35);
        border-radius: var(--curvature-widget);
        box-shadow: var(--shadow);
      }

      .temba-info {
        background: var(--color-info);
        border-color: var(--color-info-border);
      }

      .temba-warning {
        background: var(--color-warning);
        border-color: var(--color-warning-border);
      }

      .temba-error {
        border-color: var(--color-error);
        background: #fff;
        border: 1px solid var(--color-error);
        border-left: 10px solid var(--color-error);
      }
    `;
    }
    render() {
      return j`
      <div class="temba-alert temba-${this.level}"><slot></slot></div>
    `;
    }
  }
  t([ge({ type: String })], Ml.prototype, 'level', void 0);
  class Ll extends fe {
    constructor() {
      super(...arguments),
        (this.placeholder = ''),
        (this.name = ''),
        (this.query = ''),
        (this.inactiveThreshold = 1e3),
        (this.inactiveDays = 90),
        (this.recipients = []),
        (this.advanced = !1),
        (this.refreshKey = '0'),
        (this.exclusions = {}),
        (this.initialized = !1);
    }
    static get styles() {
      return r`
      :host {
        color: var(--color-text);
      }

      .urn {
        width: 120px;
      }

      .name {
        width: 160px;
      }

      .date {
        text-align: right;
      }

      .field-header {
        font-size: 80%;
        color: var(--color-text-dark);
      }

      .field-header.date {
        text-align: right;
      }

      .more {
        font-size: 90%;
        padding-top: 5px;
        padding-right: 3px;
        text-align: right;
        width: 100px;
        vertical-align: top;
      }

      table {
        width: 100%;
      }

      .contact td {
        border-bottom: 1px solid var(--color-borders);
        padding: 5px 3px;
      }

      .table-footer td {
        padding: 10px 3px;
      }

      .query-replaced,
      .count-replaced {
        display: inline-block;
        background: var(--color-primary-light);
        color: var(--color-text-dark);
        padding: 3px 6px;
        border-radius: var(--curvature);
        font-size: 85%;
        margin: 0px 3px;
      }

      temba-loading {
        transform: scale(0);
        max-width: 0;
        opacity: 0;
        transition: transform 200ms ease-in-out;
      }

      .fetching temba-loading {
        transform: scale(1);
        max-width: 500px;
        opacity: 1;
        display: block;
      }

      .error {
        margin-top: 10px;
      }

      .match-count {
        padding: 4px;
        margin-top: 6px;
      }

      .linked {
        color: var(--color-link-primary);
        text-decoration: none;
        cursor: pointer;
      }

      .header td {
        border-bottom: 0px solid var(--color-borders);
        padding: 5px 3px;
      }

      .expanded .header td {
        border-bottom: 2px solid var(--color-borders);
      }

      td.field-header,
      tr.table-footer,
      tr.contact {
        display: none;
      }

      .expanded td.field-header {
        display: table-cell;
      }

      .expanded tr.contact,
      .expanded tr.table-footer {
        display: table-row;
      }

      .query {
        display: var(--contact-search-query-display);
        margin-bottom: 10px;
      }

      .results {
        display: none;
      }

      .summary {
        min-height: 2.2em;
        display: flex;
        flex-grow: 1;
        align-items: center;
      }

      .summary .result-count {
        flex-grow: 1;
      }

      .results.empty {
        display: none !important;
      }

      .results.initialized {
        display: flex;
        align-items: center;
        margin-top: 0.5em;
        margin-left: 0.6em;
      }

      .advanced-icon {
        cursor: pointer;
        margin-right: 0.5em;
      }

      .query .advanced-icon {
        margin-top: 1em;
        margin-right: 1em;
      }

      .advanced-icon:hover {
        --icon-color: var(--color-link-primary-hover) !important;
      }

      .query {
        --textarea-height: 5em;
      }

      #recipients {
        margin-bottom: 1em;
        display: block;
      }

      temba-alert {
        margin: 1em 0;
      }
    `;
    }
    refresh() {
      this.refreshKey = 'requested_' + new Date().getTime();
    }
    updated(t) {
      super.updated(t),
        (t.has('advanced') && this.advanced) ||
          (t.has('in_a_flow') &&
            !this.in_a_flow &&
            (delete this.exclusions.in_a_flow, this.requestUpdate('exclusions')),
          ((t.has('query') && this.advanced) || (t.has('refreshKey') && '0' !== this.refreshKey)) &&
            ((this.summary = null),
            this.fireCustomEvent(Me.ContentChanged, { reset: !0 }),
            this.lastQuery && (window.clearTimeout(this.lastQuery), (this.fetching = !1)),
            (this.query.trim().length > 0 || this.recipients.length > 0) &&
              ((this.fetching = !0),
              (this.lastQuery = window.setTimeout(() => {
                this.fetchSummary();
              }, 2e3)))));
    }
    fetchSummary() {
      if (this.endpoint) {
        const t = this.recipients.filter(t => 'group' === t.type).map(t => t.id),
          e = this.recipients.filter(t => 'contact' === t.type).map(t => t.id);
        Yt(this.endpoint, {
          include: this.advanced ? { query: this.query } : { contact_uuids: e, group_uuids: t },
          exclude: this.exclusions
        }).then(t => {
          (this.fetching = !1),
            200 === t.status
              ? ((this.summary = t.json),
                this.advanced || (this.query = this.summary.query),
                this.setValue({
                  advanced: this.advanced,
                  query: this.query,
                  exclusions: this.exclusions,
                  recipients: this.recipients
                }),
                this.summary.error ? (this.errors = [this.summary.error]) : (this.errors = []),
                this.requestUpdate('errors'),
                this.fireCustomEvent(Me.ContentChanged, this.summary))
              : ((this.summary = t.json),
                this.summary.error && (this.errors = [this.summary.error]),
                this.requestUpdate('errors'),
                this.fireCustomEvent(Me.ContentChanged, this.summary));
        });
      }
    }
    handleAdvancedToggle(t) {
      ae(t),
        (this.recipients = []),
        (this.exclusions = {}),
        this.advanced && ((this.query = ''), (this.value = null)),
        (this.advanced = !this.advanced),
        this.setValue({
          advanced: this.advanced,
          query: this.query,
          exclusions: this.exclusions,
          recipients: this.recipients
        });
    }
    handleQueryChange(t) {
      const e = t.target;
      this.query = e.inputElement.value;
    }
    handleRecipientsChanged() {
      '0' !== this.refreshKey || this.initialized ? this.refresh() : (this.initialized = !0);
    }
    handleExclusionChanged(t) {
      if ('TEMBA-CHECKBOX' === t.target.tagName) {
        const e = JSON.stringify(this.exclusions),
          i = t.target;
        let o = i.checked;
        o
          ? ('not_seen_since_days' === i.name && (o = 90), (this.exclusions[i.name] = o))
          : delete this.exclusions[i.name],
          e !== JSON.stringify(this.exclusions) && this.refresh();
      }
    }
    render() {
      let t;
      if (this.summary && !this.summary.error) {
        const e = this.summary.total || 0;
        t = j`
          <div class="result-count">
            Found
            <a
              class="linked"
              target="_"
              href="/contact/?search=${encodeURIComponent(this.summary.query)}"
            >
              ${e.toLocaleString()}
            </a>
            contact${1 !== e ? 's' : ''}
          </div>
          <temba-button
            class="edit"
            name="edit"
            secondary
            small
            @click=${this.handleAdvancedToggle}
          >
            <div slot="name">
              <div style="display: flex; align-items: center;">
                ${
                  this.advanced
                    ? j` <temba-icon
                        name="reset"
                        style="margin-right:0.5em"
                      ></temba-icon>
                      Start Over`
                    : j` <temba-icon
                        name="edit"
                        style="margin-right:0.5em"
                      ></temba-icon>
                      Edit Query`
                }
              </div>
            </div>
          </temba-button>
        `;
      }
      return this.summary && this.summary.blockers && this.summary.blockers.length > 0
        ? j`${this.summary.blockers.map(t => j`<temba-alert level="error">${hr(t)}</temba-alert>`)}`
        : j`
      ${
        this.advanced
          ? j`<div class="query">
            <temba-textinput
              .label=${this.label}
              .helpText=${this.helpText}
              .widgetOnly=${this.widgetOnly}
              .errors=${this.errors}
              name=${this.name}
              .inputRoot=${this}
              @input=${this.handleQueryChange}
              placeholder=${this.placeholder}
              .value=${this.query}
              textarea
              autogrow
            >
            </temba-textinput>
          </div>`
          : j`<temba-omnibox
              placeholder="Search for contacts or groups"
              widget_only=""
              groups=""
              contacts=""
              label="Recipients"
              help_text="The contacts to send the message to."
              .errors=${this.errors}
              id="recipients"
              name="recipients"
              .value=${this.recipients}
              endpoint="/contact/omnibox/?"
              @change=${this.handleRecipientsChanged}
            >
            </temba-omnibox>

            ${
              this.not_seen_since_days
                ? j`<temba-checkbox
                  name="not_seen_since_days"
                  label="${ir('Skip inactive contacts')}"
                  help_text="${ir(
                    'Only include contacts who have sent a message in the last 90 days.'
                  )}"
                  ?checked=${90 === this.exclusions.not_seen_since_days}
                  @change=${this.handleExclusionChanged}
                ></temba-checkbox>`
                : null
            }
            ${
              this.in_a_flow
                ? j`<temba-checkbox
                  name="in_a_flow"
                  label="${ir('Skip contacts currently in a flow')}"
                  help_text="${ir('Avoid interrupting a contact who is already in a flow.')}"
                  ?checked=${this.exclusions.in_a_flow}
                  @change=${this.handleExclusionChanged}
                ></temba-checkbox>`
                : null
            }
            ${
              this.started_previously
                ? j`<temba-checkbox
                  name="started_previously"
                  label="${ir('Skip repeat contacts')}"
                  help_text="${ir(
                    'Avoid restarting a contact who has been in this flow in the last 90 days.'
                  )}"
                  ?checked=${this.exclusions.started_previously}
                  @change=${this.handleExclusionChanged}
                ></temba-checkbox>`
                : null
            }`
      }

      <div
        class="results ${Ht({
          fetching: this.fetching,
          initialized: this.initialized || this.fetching,
          empty: ((this.summary && this.summary.error) || !this.summary) && !this.fetching
        })}"
      >
        <temba-loading units="6" size="8"></temba-loading>
        <div class="summary ${this.expanded ? 'expanded' : ''}">${t}</div>
      </div>

      ${
        this.summary && this.summary.warnings
          ? this.summary.warnings.map(
              t => j`<temba-alert level="warning"
                >${hr(t)}</temba-alert
              >`
            )
          : ''
      }
    `;
    }
  }
  t([ge({ type: Boolean })], Ll.prototype, 'in_a_flow', void 0),
    t([ge({ type: Boolean })], Ll.prototype, 'started_previously', void 0),
    t([ge({ type: Boolean })], Ll.prototype, 'not_seen_since_days', void 0),
    t([ge({ type: Boolean })], Ll.prototype, 'fetching', void 0),
    t([ge({ type: Boolean })], Ll.prototype, 'expanded', void 0),
    t([ge({ type: String })], Ll.prototype, 'endpoint', void 0),
    t([ge({ type: String })], Ll.prototype, 'placeholder', void 0),
    t([ge({ type: String })], Ll.prototype, 'name', void 0),
    t([ge({ type: String })], Ll.prototype, 'query', void 0),
    t([ge({ type: Number })], Ll.prototype, 'inactiveThreshold', void 0),
    t([ge({ type: Number })], Ll.prototype, 'inactiveDays', void 0),
    t([ge({ type: Object, attribute: !1 })], Ll.prototype, 'summary', void 0),
    t([ge({ type: Object, attribute: !1 })], Ll.prototype, 'flow', void 0),
    t([ge({ type: Array })], Ll.prototype, 'recipients', void 0),
    t([ge({ type: Boolean })], Ll.prototype, 'advanced', void 0),
    t([ge({ type: String })], Ll.prototype, 'refreshKey', void 0),
    t([ge({ type: Object })], Ll.prototype, 'exclusions', void 0);
  class zl extends lt {
    static get styles() {
      return r`
      :host {
        align-items: center;
        align-self: center;
      }

      .sheet {
        color: var(--icon-color);
        transform: scale(1);
        transition: fill 100ms ease-in-out,
          background 200ms cubic-bezier(0.68, -0.55, 0.265, 1.55),
          padding 200ms cubic-bezier(0.68, -0.55, 0.265, 1.55),
          margin 200ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
      }

      .sheet.spin {
        transform: rotate(0deg);
      }

      .sheet.spin-1 {
        transform: rotate(180deg);
      }

      .sheet.spin-2 {
        transform: rotate(360deg);
      }

      .sheet.spin-3 {
        transform: rotate(0deg);
        transition-duration: 0ms !important;
      }

      .sheet.pulse {
        transform: scale(1);
      }

      .sheet.pulse-1 {
        transform: scale(1.2);
      }

      .clickable:hover {
        cursor: pointer;
        fill: var(--color-link-primary) !important;
        background: rgb(255, 255, 255);
      }

      .circled {
        background: var(--icon-color-circle);
        padding: 0.15em;
        margin: -0.15em;
        box-shadow: var(--shadow);
      }

      .wrapper {
        display: flex;
        flex-direction: column;
        border-radius: 999px;
        transition: background 200ms linear,
          transform 300ms cubic-bezier(0.68, -0.55, 0.265, 1.55),
          padding 150ms linear, margin 150ms linear;
      }

      .wrapper.clickable {
        transform: scale(1);
      }

      .wrapper.clickable:hover {
        --icon-circle-size: 0.35em;
        --icon-background: var(--icon-color-circle-hover);
      }

      .wrapper.clickable {
        padding: var(--icon-circle-size);
        margin: calc(-1 * var(--icon-circle-size));
        background: var(--icon-background);
      }

      .spin-forever {
        animation-name: spin;
        animation-duration: 2000ms;
        animation-iteration-count: infinite;
        animation-timing-function: linear;
      }

      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
    `;
    }
    constructor() {
      super(),
        (this.size = 1),
        (this.animationDuration = 200),
        (this.src = ''),
        (this.steps = 2),
        (this.easing = 'cubic-bezier(0.68, -0.55, 0.265, 1.55)');
    }
    firstUpdated(t) {
      super.firstUpdated(t),
        t.has('animateChange') &&
          (t.has('animationDuration') ||
            (this.animationDuration = this.steps * this.animationDuration),
          'spin' === this.animateChange &&
            ((this.steps = 3), (this.animationDuration = 400), (this.easing = 'linear')));
    }
    handleClicked() {
      this.animateClick && (this.animationStep = 1);
    }
    updated(t) {
      super.updated(t),
        t.has('animationStep') &&
          (this.lastName &&
            this.animationStep >= this.steps / 2 &&
            ((this.lastName = null), this.requestUpdate()),
          setTimeout(() => {
            this.animationStep > 0 && this.animationStep < this.steps
              ? this.animationStep++
              : (this.animationStep = 0);
          }, this.animationDuration / this.steps)),
        t.has('name') &&
          this.animateChange &&
          ((this.lastName = t.get('name')),
          this.lastName && this.animateChange && (this.animationStep = 1));
    }
    render() {
      if (!this.name) return null;
      let t = this.lastName || this.name;
      return (
        (t = t.startsWith('channel_') && !ve[t] ? ve.channel_ex : ve[t.replace('icon.', '')] || t),
        t || (t = this.id),
        j`
      <div
        @click=${this.handleClicked}
        class="wrapper ${Ht({
          clickable: this.clickable,
          circled: this.circled,
          animate: !!this.animateChange || !!this.animateClick,
          'spin-forever': this.spin
        })}"
      >
        <svg
          style="height:${this.size}em;width:${this.size}em;transition:transform ${this
          .animationDuration / this.steps}ms
          ${this.easing}"
          class="${Ht({
            sheet: '' === this.src,
            [this.animateChange]: !!this.animateChange,
            [this.animateChange + '-' + this.animationStep]: this.animationStep > 0,
            [this.animateClick]: !!this.animateClick,
            [this.animateClick + '-' + this.animationStep]: this.animationStep > 0
          })}"
        >
          <use
            href="${
              this.src
                ? this.src
                : `${this.prefix ||
                    window.static_url ||
                    '/static/'}svg/index.svg?v=e5bcaf1a10896e9b870da4b40474d67b#${t}`
            }"
          />
        </svg>
      </div>
    `
      );
    }
  }
  var Pl;
  t([ge({ type: String })], zl.prototype, 'name', void 0),
    t([ge({ type: String })], zl.prototype, 'prefix', void 0),
    t([ge({ type: String })], zl.prototype, 'id', void 0),
    t([ge({ type: Number })], zl.prototype, 'size', void 0),
    t([ge({ type: Boolean })], zl.prototype, 'spin', void 0),
    t([ge({ type: Boolean })], zl.prototype, 'clickable', void 0),
    t([ge({ type: Boolean })], zl.prototype, 'circled', void 0),
    t([ge({ type: String })], zl.prototype, 'animateChange', void 0),
    t([ge({ type: String })], zl.prototype, 'animateClick', void 0),
    t([ge({ type: Number })], zl.prototype, 'animationDuration', void 0),
    t([ge({ type: String })], zl.prototype, 'src', void 0),
    t([ge({ type: Number, attribute: !1 })], zl.prototype, 'steps', void 0),
    t([ge({ type: Number, attribute: !1 })], zl.prototype, 'animationStep', void 0),
    t([ge({ type: String })], zl.prototype, 'easing', void 0),
    (function(t) {
      (t.Group = 'group'), (t.Contact = 'contact');
    })(Pl || (Pl = {}));
  const Dl = { color: 'var(--color-text-dark)', padding: '0px 6px', fontSize: '12px' };
  class Il extends ue {
    constructor() {
      super(...arguments),
        (this.groups = !1),
        (this.contacts = !1),
        (this.value = []),
        (this.placeholder = 'Select recipients'),
        (this.disabled = !1),
        (this.infoText = '');
    }
    static get styles() {
      return r`
      temba-select:focus {
        outline: none;
        box-shadow: none;
      }

      :host {
      }
    `;
    }
    renderOption(t) {
      return j`
      <div style="display:flex;">
        <div style="margin-right: 8px">${this.getIcon(t)}</div>
        <div style="flex: 1">${t.name}</div>
        <div
          style="background: rgba(50, 50, 50, 0.15); margin-left: 5px; display: flex; align-items: center; border-radius: 4px"
        >
          ${this.getPostName(t)}
        </div>
      </div>
    `;
    }
    getPostName(t) {
      const e = { ...Dl };
      return t.urn && t.type === Pl.Contact && t.urn !== t.name
        ? j`<div style=${Se(e)}>${t.urn}</div>`
        : t.type === Pl.Group
        ? j`
        <div style=${Se(e)}>${t.count.toLocaleString()}</div>
      `
        : null;
    }
    renderSelection(t) {
      return j`
      <div
        style="flex:1 1 auto; display: flex; align-items: stretch; color: var(--color-text-dark); font-size: 12px;"
      >
        <div style="align-self: center; padding: 0px 7px; color: #bbb">
          ${this.getIcon(t)}
        </div>
        <div
          class="name"
          style="align-self: center; padding: 0px; font-size: 12px;"
        >
          ${t.name}
        </div>
        <div
          style="background: rgba(100, 100, 100, 0.05); border-left: 1px solid rgba(100, 100, 100, 0.1); margin-left: 12px; display: flex; align-items: center"
        >
          ${this.getPostName(t)}
        </div>
      </div>
    `;
    }
    getIcon(t) {
      return t.type === Pl.Group
        ? j`<temba-icon name="${ve.group}"></temba-icon>`
        : t.type === Pl.Contact
        ? j`<temba-icon name="${ve.contact}"></temba-icon>`
        : void 0;
    }
    getEndpoint() {
      const t = this.endpoint;
      let e = '&types=';
      return this.groups && (e += 'g'), this.contacts && (e += 'c'), t + e;
    }
    getValues() {
      return this.shadowRoot.querySelector('temba-select').values;
    }
    isMatch() {
      return !0;
    }
    render() {
      return j`
      <temba-select
        name=${this.name}
        endpoint=${this.getEndpoint()}
        placeholder=${this.placeholder}
        queryParam="search"
        .label=${this.label}
        .helpText=${this.helpText}
        .widgetOnly=${this.widgetOnly}
        ?disabled=${this.disabled}
        .errors=${this.errors}
        .values=${this.value}
        .renderOption=${this.renderOption.bind(this)}
        .renderSelectedItem=${this.renderSelection.bind(this)}
        .inputRoot=${this}
        .isMatch=${this.isMatch}
        .infoText=${this.infoText}
        searchable
        searchOnFocus
        multi
        ><div slot="right">
          <slot name="right"></slot></div
      ></temba-select>
    `;
    }
  }
  t([ge()], Il.prototype, 'endpoint', void 0),
    t([ge()], Il.prototype, 'name', void 0),
    t([ge({ type: Boolean })], Il.prototype, 'groups', void 0),
    t([ge({ type: Boolean })], Il.prototype, 'contacts', void 0),
    t([ge({ type: Array })], Il.prototype, 'value', void 0),
    t([ge({ type: Array })], Il.prototype, 'errors', void 0),
    t([ge()], Il.prototype, 'placeholder', void 0),
    t([ge({ type: Boolean })], Il.prototype, 'disabled', void 0),
    t([ge({ type: String, attribute: 'help_text' })], Il.prototype, 'helpText', void 0),
    t([ge({ type: Boolean, attribute: 'help_always' })], Il.prototype, 'helpAlways', void 0),
    t([ge({ type: Boolean, attribute: 'widget_only' })], Il.prototype, 'widgetOnly', void 0),
    t([ge({ type: Boolean, attribute: 'hide_label' })], Il.prototype, 'hideLabel', void 0),
    t([ge({ type: String })], Il.prototype, 'label', void 0),
    t([ge({ type: String, attribute: 'info_text' })], Il.prototype, 'infoText', void 0);
  const Nl = (t, e) => t.top + t.height / 2 - e.height / 2,
    Bl = (t, e) => t.left + t.width / 2 - e.width / 2;
  class Rl extends ue {
    constructor() {
      super(...arguments),
        (this.visible = !1),
        (this.position = 'auto'),
        (this.lastEnter = 0),
        (this.failSafe = 0);
    }
    static get styles() {
      return r`
      .tip {
        transition: opacity 200ms ease-in-out;
        margin: 0px;
        position: fixed;
        opacity: 0;
        background: #fff;
        padding: 4px 8px;
        pointer-events: none;
        border-radius: var(--curvature-widget);
        box-shadow: 0 1px 10px 10px rgba(0, 0, 0, 0.035),
          0 1px 3px 0px rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
        font-size: 14px;
        z-index: 10000;
        color: #333;
      }

      .tip.hide-on-change {
        transition: none;
      }

      .show {
        opacity: 1;
      }

      .slot {
        display: flex;
        flex-direction: column;
      }

      .arrow {
        position: absolute;
        color: #fff;
        font-size: 10px;
        line-height: 0px;
      }

      .◀ {
        text-shadow: -1px 2px 2px rgba(0, 0, 0, 0.1);
      }

      .▶ {
        text-shadow: 1px 2px 2px rgba(0, 0, 0, 0.1);
      }

      .▼ {
        text-shadow: 0px 3px 3px rgba(0, 0, 0, 0.1);
      }

      .▲ {
        text-shadow: 0px -1px 1px rgba(0, 0, 0, 0.1);
      }
    `;
    }
    updated(t) {
      (t.has('visible') || t.has('text')) && this.visible && this.calculatePosition(),
        t.has('text') && this.hideOnChange && (this.visible = !1);
    }
    calculatePosition() {
      if (this.visible) {
        const t = this.getDiv('.tip').getBoundingClientRect(),
          e = this.getDiv('.slot').getBoundingClientRect();
        let i = this.position;
        'auto' === i && (i = 'left'),
          (this.arrowLeft = 0),
          (this.arrowTop = 0),
          'left' === i
            ? ((this.left = e.left - t.width - 16),
              (this.top = Nl(e, t)),
              (this.arrowTop = t.height / 2),
              (this.arrowLeft = t.width - 1),
              (this.arrow = '▶'))
            : 'right' === i
            ? ((this.left = e.right + 12),
              (this.top = Nl(e, t)),
              (this.arrowTop = t.height / 2),
              (this.arrowLeft = -8),
              (this.arrow = '◀'))
            : 'top' === i
            ? ((this.top = e.top - t.height - 12),
              (this.left = Bl(e, t)),
              (this.arrowTop = t.height + 2),
              (this.arrowLeft = t.width / 2 - 4),
              (this.arrow = '▼'))
            : 'bottom' === i &&
              ((this.top = e.bottom + 10),
              (this.left = Bl(e, t)),
              (this.arrowTop = -2),
              (this.arrowLeft = t.width / 2 - 3),
              (this.arrow = '▲'));
      }
    }
    handleMouseEnter() {
      this.lastEnter = window.setTimeout(() => {
        (this.visible = !0),
          (this.failSafe = window.setTimeout(() => {
            this.visible = !1;
          }, 2e3));
      }, 600);
    }
    handleMouseLeave() {
      window.clearTimeout(this.lastEnter), window.clearTimeout(this.failSafe), (this.visible = !1);
    }
    render() {
      const t = {
          top: this.top ? `${this.top}px` : '0px',
          left: this.left ? `${this.left}px` : '0px'
        },
        e = {
          top: this.arrowTop ? `${this.arrowTop}px` : '0px',
          left: this.arrowLeft ? `${this.arrowLeft}px` : '0px'
        };
      this.width && (t.width = `${this.width}px`);
      const i = Ht({
        tip: !0,
        show: this.visible,
        top: this.poppedTop,
        'hide-on-change': this.hideOnChange
      });
      return j`
      <div
        class="slot"
        @click=${this.handleMouseLeave}
        @mouseenter=${this.handleMouseEnter}
        @mouseleave=${this.handleMouseLeave}
      >
        <slot></slot>
      </div>
      <div class="${i}" style=${Se(t)}>
        ${this.text}
        <div class="arrow ${this.arrow}" style=${Se(e)}>
          ${this.arrow}
        </div>
      </div>
    `;
    }
  }
  t([ge({ type: String })], Rl.prototype, 'text', void 0),
    t([ge({ type: Boolean })], Rl.prototype, 'visible', void 0),
    t([ge({ type: String })], Rl.prototype, 'position', void 0),
    t([ge({ type: Boolean })], Rl.prototype, 'hideOnChange', void 0),
    t([ge({ type: Number, attribute: !1 })], Rl.prototype, 'top', void 0),
    t([ge({ type: Number, attribute: !1 })], Rl.prototype, 'left', void 0),
    t([ge({ type: Number, attribute: !1 })], Rl.prototype, 'width', void 0),
    t([ge({ type: Boolean, attribute: !1 })], Rl.prototype, 'poppedTop', void 0);
  const ql = (t, e) => {
    const i = t || [],
      o = i.findIndex(t => t.id == e || t.vanity_id == e);
    if (o > -1) {
      return { item: i[o], index: o };
    }
    return { item: null, index: -1 };
  };
  class Ul extends Ya {
    static get styles() {
      return r`
      :host {
        width: 100%;
        display: block;
        --color-widget-bg-focused: transparent;
        --options-block-shadow: none;
      }

      .bubble {
        width: 0.6em;
        height: 0.6em;
        right: 0em;
        bottom: 0em;
        border-radius: 99em;
        border: 0.12em solid rgba(0, 0, 0, 0.1);
        position: absolute;
      }

      .bubble.count {
        position: relative;
        width: inherit;
        height: inherit;
        right: inherit;
        bottom: inherit;
        color: #fff;
        line-height: 1em;
        padding: 0.12em;
        min-width: 1em;
        text-align: center;
      }

      .section {
        font-size: 1.5em;
        margin-bottom: 0.2em;
        color: var(--color-text-dark);
      }

      .collapse-toggle {
        width: 0.5em;
        cursor: pointer;
        display: block;
        margin-right: 5px;
        margin-top: 3px;
        margin-bottom: 3px;
      }

      .collapse-toggle:hover {
        background: rgb(100, 100, 100, 0.05);
      }

      .item {
        cursor: pointer;
        user-select: none;
        -webkit-user-select: none;
        display: flex;
        --icon-color: var(--color-text-dark);
      }

      .item.selected,
      .item.pressed {
        background: var(--color-selection);
        color: var(--color-primary-dark);
        --icon-color: var(--color-primary-dark);
      }

      .root {
        display: flex;
        flex-direction: row;
        height: 100%;
      }

      .level {
        display: flex;
        flex-direction: column;
      }

      .level.hidden {
        display: none;
      }

      .popup {
        --icon-color: rgba(255, 255, 255, 0.7);
      }

      .level-0 > .item,
      .level-0 > temba-dropdown > div[slot='toggle'] > .avatar {
        padding: 0px;
        --icon-color: rgba(255, 255, 255, 0.7);
        flex-direction: column;
        border: 0px solid green;
        width: 100%;
        display: flex;
        align-items: center;
      }

      .level-0 > temba-dropdown .icon-wrapper {
        padding: 0.2em 0.4em 0.2em 0.4em;
      }

      .level-0 > .item.selected::before,
      .level-0 > .item.selected::after {
        content: ' ';
        height: var(--curvature);
        background: var(--color-primary-dark);
        display: block;
        width: 100%;
      }

      .level-0 > .item.selected::before {
        border-bottom-right-radius: var(--curvature);
      }

      .level-0 .item > temba-tip {
        padding: 0.5em 0em;
      }

      .level-0 > .item.selected::after {
        border-top-right-radius: var(--curvature);
      }

      .level-0 {
        padding-top: var(--menu-padding) !important;
      }

      .level-0 > .empty {
        background: var(--color-primary-dark);
        align-self: stretch;
        flex-grow: 1;
      }

      .level-0 > .bottom {
        height: 1em;
        background: var(--color-primary-dark);
      }

      .level-0 > temba-dropdown.open > div[slot='toggle'] > .avatar {
        background: transparent !important;
      }

      .level-0 {
        background: var(--color-primary-dark);
      }

      temba-dropdown {
      }

      temba-dropdown > div[slot='dropdown'] .avatar > .details {
        margin-left: 0.75em;
      }

      temba-dropdown > div[slot='dropdown'] .bubble.count {
        margin-right: 0.75em;
      }

      .level-0 > .item > .details,
      .level-0 > temba-dropdown > div[slot='toggle'] .details {
        display: none !important;
      }

      .avatar {
        align-items: center;
      }

      temba-dropdown > div[slot='dropdown'] {
      }

      temba-dropdown > div[slot='dropdown'] .avatar .avatar-circle,
      temba-dropdown > div[slot='dropdown'] .avatar .bubble {
        font-size: 0.7em;
      }

      .level-0.expanded {
        background: inherit;
      }

      .level-0 > .item.selected {
        background: white;
        --icon-color: var(--color-primary-dark);
      }

      .level {
        padding: var(--menu-padding);
      }

      .level-0 {
        padding: 0px;
      }

      .top {
        display: flex;
        align-items: center;
        flex-direction: column;
      }

      .item {
        padding: 0.2em 0.75em;
        margin-top: 0.1em;
        border-radius: var(--curvature);
        display: flex;
        min-width: 12em;
        position: relative;
      }

      .item > temba-icon {
        margin-right: 0.5em;
      }

      .item > .details > .name {
        flex-grow: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 0;
      }

      .level-0 .item {
        margin-top: 0em;
        border-radius: 0px;
        min-width: inherit;
        max-width: inherit;
      }

      .popup:hover {
        --icon-color: #fff;
      }

      .level-0 > .item > temba-icon {
        margin-right: 0px;
      }

      .level-0 > .item > .name {
        min-width: 0px;
      }

      .count {
        align-self: center;
        margin-left: 1em;
        font-size: 0.8em;
        font-weight: 400;
      }

      .level-0 > .item-top {
        background: var(--color-primary-dark);
        min-height: var(--curvature);
      }

      .level-0 > .item-bottom {
        background: var(--color-primary-dark);
        min-height: var(--curvature);
      }

      .level-0 > .item-bottom.selected {
        border-top-right-radius: var(--curvature);
      }

      .level-0 > .item-top.selected {
        border-bottom-right-radius: var(--curvature);
      }

      .level-0 > .item:hover {
        background: rgba(255, 255, 255, 0.15);
        --icon-color: #fff;
      }

      .level-0 > .item.selected:hover {
        background: white;
        --icon-color: var(--color-primary-dark);
        cursor: default;
      }

      .item.inline {
        border: 0px solid transparent;
      }

      .level-1,
      .level-2 {
        border-right: 1px solid rgba(0 0 0 / 8%);
        box-shadow: rgb(0 0 0 / 6%) 4px 0px 6px 1px;
      }

      .level-1 {
        transition: opacity 100ms linear, margin 200ms linear;
        overflow-y: scroll;
      }

      .mobile.root {
        height: 100svh;
      }

      .mobile.root.fully-collapsed {
        height: initial;
      }

      .root.fully-collapsed.mobile .level.level-0 {
        padding-right: 0.5em;
      }

      .root.fully-collapsed.mobile .level.level-0 {
        flex-direction: row;
      }

      .root.fully-collapsed.mobile .level.level-0 > .item {
        display: none;
      }

      .root.fully-collapsed.mobile .level.level-0 > .empty {
        display: block;
        width: 100%;
        min-width: inherit;
        max-width: inherit;
      }

      .root .level.level-0 > .show-mobile {
        display: none;
      }

      .root.mobile .level.level-0 > .show-mobile {
        display: flex;
      }

      .root.fully-collapsed.mobile .level.level-0 > .show-mobile {
        display: contents !important;
      }

      .root.fully-collapsed.mobile .level.level-0 .expand-icon {
        max-height: 100%;
        padding: 1em;
      }

      .mobile.fully-collapsed.root {
        flex-direction: column;
      }

      .mobile.fully-collapsed.root .level-0 {
        padding-top: 0px !important;
      }

      .mobile.fully-collapsed .level-1 {
        display: none;
      }

      .mobile .level-1 {
        flex-grow: 1;
      }

      .mobile .level-1 .item {
        max-width: inherit;
        min-width: inherit;
      }

      .mobile .level-1 .section {
        max-width: inherit;
        min-width: inherit;
      }

      .mobile.fully-collapsed .item {
      }

      .mobile .expand-icon {
        transition: none;
        transform: rotate(-90deg);
        align-self: center;
      }

      .mobile.fully-collapsed .level-0 .empty {
        flex-grow: 1;
      }

      .mobile.fully-collapsed .top-spacer {
        flex-grow: 0;
      }

      .mobile.fully-collapsed #dd-workspace {
        display: none;
      }

      .mobile.fully-collapsed .expand-icon {
        transform: none;
      }

      .level-2 {
        background: #fbfbfb;
        overflow-y: auto;
      }

      .level-2 .item .details {
        overflow: hidden;
      }

      .level-2 .item {
        min-width: 12em;
        max-width: 12em;
      }

      .level-1 .item {
        overflow: hidden;
        max-width: 12em;
        min-width: 12em;
        min-height: 1.5em;
        max-height: 1.5em;
        transition: min-width var(--transition-speed) !important;
      }

      .collapsed .item {
        overflow: hidden;
        min-width: 0;
        margin: 0;
      }

      .item .details {
        opacity: 1;
        min-height: 1.5em;
        max-height: 1.5em;
        align-items: center;
      }

      .collapsed .item {
        margin-bottom: 0.5em;
      }

      .collapsed .item .details {
        overflow: hidden;
        max-height: 0em;
        max-width: 0em;
      }

      .collapsed .item .details {
        max-height: 0em;
      }

      .collapsed .item temba-icon {
        margin-right: 0;
      }

      .section {
        max-width: 12em;
      }

      .collapsed .section {
        opacity: 0;
        max-width: 0em;
        max-height: 0.6em;
      }

      .collapsed.level-1 {
        overflow: hidden;
        padding: 0.5em;
        --icon-color: #999;
      }

      .collapsed .item .right {
        flex-grow: 1;
      }

      .collapse-icon {
        display: none;
      }

      .collapsed .collapse-icon {
        --icon-color: #ccc;
        display: block;
      }

      .collapsed .item.iconless {
        max-height: 0em;
        padding: 0em;
        min-height: 0em;
        margin-bottom: 0em;
      }

      .divider {
        height: 1px;
        background: #f3f3f3;
        margin: 0.5em 0.75em;
        min-height: 1px;
      }

      .space {
        margin: 0.5em;
      }

      .collapsed .divider {
        height: 0;
        margin: 0;
        padding: 0;
        min-height: 0px;
      }

      .sub-section {
        font-size: 0.9rem;
        color: #888;
        margin-top: 1rem;
        margin-left: 0.3rem;
      }

      .fully-collapsed .level-1 {
        margin-left: -208px;
        pointer-events: none;
        border: none;
        overflow: hidden;
      }

      .fully-collapsed .level-1 > * {
        opacity: 0;
      }

      .fully-collapsed .level-1 .item,
      .fully-collapsed .level-1 .divider {
        opacity: 0;
      }

      .fully-collapsed .level-2,
      .fully-collapsed .level-3 {
        display: none;
      }

      temba-button {
        margin-top: 0.2em;
        margin-bottom: 0.2em;
        margin-left: 0.75em;
        margin-right: 0.75em;
      }

      .expand-icon {
        transform: rotate(180deg);
        --icon-color: rgba(255, 255, 255, 0.5);
        cursor: pointer;
        max-height: 0px;
        overflow: hidden;
        opacity: 0;
        transition: all 400ms ease-in-out 400ms;
      }

      .expand-icon:hover {
        --icon-color: #fff;
      }

      .fully-collapsed .expand-icon {
        padding-top: 0.5em;
        max-height: 2em;
        opacity: 1;
      }

      .section-header {
        display: flex;
        align-items: center;
      }

      .section-header .section {
        flex-grow: 1;
      }

      .section-header temba-icon {
        --icon-color: #ddd;
        cursor: pointer;
        padding-bottom: 0.5em;
        padding-right: 0.5em;
      }

      .section-header temba-icon:hover {
        --icon-color: var(--color-link-primary);
      }

      a {
        text-decoration: none;
        color: var(--color-text-dark);
      }

      slot[name='header'] {
        display: none;
      }

      slot[name='header'].show-header {
        display: block;
      }

      .icon-wrapper {
        position: relative;
        padding: 0.2em 0.4em 0.2em 0em;
      }

      .level-0 .icon-wrapper {
        padding: 0.4em 0.9em;
      }
    `;
    }
    constructor() {
      super(),
        (this.wraps = !1),
        (this.selection = []),
        (this.state = {}),
        (this.refresh = te(this.doRefresh, 200)),
        (this.renderMenuItem = (t, e = null) => {
          if ('divider' === t.type) return j`<div class="divider"></div>`;
          if ('temba-notification-list' === t.type)
            return j`<temba-notification-list
        endpoint=${t.href}
      ></temba-notification-list>`;
          if ('space' === t.type) return j`<div class="space"></div>`;
          if ('section' === t.type || t.inline) return j`<div class="sub-section">${t.name}</div>`;
          if ('modax-button' === t.type)
            return j`<temba-button
        name=${t.name}
        @click=${e => {
          this.handleItemClicked(e, t);
        }}
      />`;
          const i = this.isSelected(t),
            o = i && this.selection.length > t.level + 1;
          let n = t.icon
            ? j`<div class="icon-wrapper">
          <temba-icon
            size="${0 === t.level ? '1.5' : '1'}"
            name="${t.icon}"
          ></temba-icon
          >${
            t.bubble && !t.count
              ? j`<div
                style="background-color: ${t.bubble}"
                class="bubble"
              ></div>`
              : null
          }
        </div>`
            : null;
          const s = t.collapsed_icon
              ? j`<temba-icon
          size="${0 === t.level ? '1.5' : '1'}"
          name="${t.collapsed_icon}"
          class="collapse-icon"
        ></temba-icon>`
              : null,
            r = Ht({
              ['menu-' + t.id]: !0,
              'child-selected': o,
              selected: i,
              item: !(t.avatar && 0 === t.level),
              avatar: !!t.avatar,
              popup: t.popup,
              inline: t.inline,
              expanding: this.expanding && this.expanding === t.id,
              expanded: this.isExpanded(t),
              iconless: !n && !s && !t.avatar,
              pressed: this.pressedItem && this.pressedItem.id == t.id,
              'show-mobile': t.mobile
            });
          t.avatar &&
            ((n = (t => {
              t.position || (t.position = 'right');
              let e = t.name;
              if (
                (t.user &&
                  t.user.first_name &&
                  t.user.last_name &&
                  (e = `${t.user.first_name} ${t.user.last_name}`),
                !e)
              )
                return null;
              let i = '',
                o = qt.hex(e);
              t.user && t.user.avatar
                ? (o = `url('${t.user.avatar}') center / contain no-repeat`)
                : e && (i = le(e));
              const n = j`
    <div
      style="display:flex; flex-direction: column; align-items:center;transform:scale(${t.scale ||
        1});"
    >
      <div
        class="avatar-circle"
        style="
            display: flex;
            height: 30px;
            width: 30px;
            flex-direction: row;
            align-items: center;
            color: #fff;
            border-radius: 100%;
            font-weight: 400;
            overflow: hidden;
            font-size: 12px;
            box-shadow: inset 0 0 0 3px rgba(0, 0, 0, 0.1);
            background:${o}"
      >
        ${
          i
            ? j` <div
              style="border: 0px solid red; display:flex; flex-direction: column; align-items:center;flex-grow:1"
            >
              <div style="border:0px solid blue;">${i}</div>
            </div>`
            : null
        }
      </div>
    </div>
  `;
              return t.tip
                ? j`
        <temba-tip text=${e} position=${t.position}>
          ${n}
        </temba-tip>
      `
                : n;
            })({ name: t.avatar, tip: !1, scale: e ? 0.9 : 1.2 })),
            t.bubble &&
              (n = j`${n}${
                t.bubble
                  ? j`<div
              style="background-color: ${t.bubble}"
              class="bubble"
            ></div>`
                  : null
              }`),
            (n = j`<div style="position:relative; padding: 0em">${n}</div>`));
          const a = j`
      <a
        href=${ye(t.href ? t.href : void 0)}
        id="menu-${t.id}"
        class="${r}"
        @click=${i => {
          i.preventDefault(), (this.pressedItem = null), this.handleItemClicked(i, t, e);
        }}
        @mousedown=${() => {
          t.level > 0 && (this.pressedItem = t);
        }}
        @mouseleave=${() => {
          this.pressedItem = null;
        }}
      >
        ${
          0 === t.level
            ? t.avatar
              ? n
              : j`<temba-tip style="display:flex;" text="${t.name}"
                >${n}</temba-tip
              >`
            : j`${n}${s}`
        }

        <div class="details" style="flex-grow:1;display:flex">
          <div
            class="name"
            style="flex-grow:1; flex-shrink:0; white-space: ${this.wraps ? 'normal' : 'nowrap'};"
          >
            ${t.name}
          </div>
          ${
            t.level > 0
              ? t.inline
                ? j`<temba-icon
                  name="${i || o ? ve.arrow_up : ve.arrow_down}"
                ></temba-icon>`
                : j`${
                    t.count || 0 == t.count
                      ? j`
                      <div
                        class="count ${t.bubble ? 'bubble' : ''}"
                        style="background-color: ${t.bubble}"
                      >
                        ${t.count.toLocaleString()}
                      </div>
                    `
                      : j`<div class="count"></div>`
                  }`
              : null
          }
        </div>
        <div class="right"></div>
      </a>
    `;
          return t.popup
            ? j`
        <temba-dropdown
          offsetx="10"
          arrowoffset="8"
          arrowSize="0"
          drop_align="left"
          id="dd-${t.id}"
        >
          <div slot="toggle">${a}</div>
          <div slot="dropdown" style="width:300px;overflow:hidden;">
            <div style="max-height:400px;overflow-y:auto">
              ${(t.items || []).map(
                e => ((e.level = t.level + 1), j`${this.renderMenuItem(e, t)}`)
              )}
            </div>
          </div>
        </temba-dropdown>
      `
            : a;
        }),
        (this.doRefresh = this.doRefresh.bind(this)),
        this.addEventListener('blur', () => {
          this.shadowRoot.querySelectorAll('temba-list, temba-notification-list').forEach(t => {
            t.scrollToTop();
          });
        });
    }
    setBubble(t, e) {
      const i = ql(this.root.items, t);
      return !(!i || !i.item) && ((i.item.bubble = e), this.requestUpdate('root'), !0);
    }
    getMenuItemState(t) {
      let e = {};
      return t && ((e = this.state[t]), e || ((e = {}), (this.state[t] = e))), e;
    }
    updated(t) {
      t.has('endpoint') &&
        ((this.root = { level: -1, endpoint: this.endpoint }),
        this.wait ? this.fireCustomEvent(Me.Ready) : this.loadItems(this.root)),
        t.has('root') && this.value && (this.setFocusedItem(this.value), (this.value = null));
    }
    reset() {
      this.loadItems(this.root);
    }
    async doRefresh() {
      const t = [...this.selection];
      let e = this.root;
      for (; t.length > 0; ) {
        this.loadItems(e), await this.httpComplete;
        const i = t.shift();
        e = (e.items || []).find(t => t.id == i);
      }
      this.loadItems(e),
        this.shadowRoot.querySelectorAll('temba-notification-list').forEach(t => {
          t.refresh();
        });
    }
    loadItems(t, e = null) {
      t &&
        t.endpoint &&
        ((t.loading = !0),
        (this.httpComplete = Wt(t.endpoint).then(i => {
          if (
            (i.forEach(e => {
              if (!e.items) {
                const i = (t.items || []).find(t => t.id == e.id);
                i && i.items && (e.items = i.items);
              }
            }),
            i.forEach(e => {
              (e.level = t.level + 1),
                e.items &&
                  e.items.forEach(e => {
                    e.level = t.level + 2;
                  });
            }),
            (t.items = i),
            (t.loading = !1),
            this.submenu && 0 == this.selection.length)
          ) {
            const t = this.getMenuItemForSelection([this.submenu]);
            this.handleItemClicked(e, t);
          }
          this.wait || (this.fireCustomEvent(Me.Ready), (this.wait = !0)),
            this.requestUpdate('root'),
            this.scrollSelectedIntoView();
        })));
    }
    handleItemClicked(t, e, i = null) {
      if (i && i.popup) {
        const o = this.shadowRoot.querySelector('temba-dropdown');
        return (
          o && o.blur(),
          void (
            t &&
            this.fireCustomEvent(Me.ButtonClicked, {
              item: e,
              selection: this.getSelection(),
              parent: i
            })
          )
        );
      }
      if (e.popup)
        t &&
          this.fireCustomEvent(Me.ButtonClicked, {
            item: e,
            selection: this.getSelection(),
            parent: i
          });
      else if (t && (t.preventDefault(), t.stopPropagation(), t.metaKey && e.href))
        window.open(e.href, '_blank');
      else if (
        (i && i.inline && this.handleItemClicked(null, i),
        this.collapsed && !this.isMobile() && (this.collapsed = !1),
        this.isMobile() && (this.collapsed = !0),
        e.trigger || e.event)
      )
        this.fireCustomEvent(Me.ButtonClicked, {
          item: e,
          selection: this.getSelection(),
          parent: i
        });
      else {
        if (
          (e.level >= this.selection.length
            ? this.selection.push(e.vanity_id || e.id)
            : this.selection.splice(e.level, this.selection.length - e.level, e.vanity_id || e.id),
          e.endpoint)
        ) {
          if ((this.loadItems(e, t), !e.href)) return;
        } else this.requestUpdate();
        e.href && this.dispatchEvent(new Event('change')),
          this.fireCustomEvent(Me.ButtonClicked, {
            item: e,
            selection: this.getSelection(),
            parent: i
          });
      }
    }
    scrollSelectedIntoView() {
      window.setTimeout(() => {
        this.shadowRoot.querySelectorAll('.selected').forEach(t => {
          t.scrollIntoView({ block: 'end', behavior: 'smooth' });
        });
      }, 0);
    }
    clickItem(t) {
      const e = [...this.selection];
      e.splice(e.length - 1, 1, t);
      const i = this.getMenuItemForSelection(e);
      return !!i && (this.handleItemClicked(null, i), this.scrollSelectedIntoView(), !0);
    }
    getMenuItem() {
      return this.getMenuItemForSelection([...this.selection]);
    }
    getMenuItemForSelection(t) {
      const e = [...t];
      let i = this.root.items,
        o = null;
      for (; e.length > 0; ) {
        const t = e.splice(0, 1)[0];
        if (!i) break;
        if (((o = ql(i, t).item), !o)) break;
        i = o.items;
      }
      return o;
    }
    getSelection() {
      return this.selection;
    }
    handleExpand() {
      this.collapsed = !1;
    }
    handleCollapse() {
      this.collapsed = !0;
    }
    async setFocusedItem(t) {
      const e = t.split('/').filter(t => !!t);
      if (!this.root) return;
      if (e.length > 0) {
        if (!ql(this.root.items, e[0]).item) return;
      }
      const i = [];
      let o = this.root;
      for (; e.length > 0; ) {
        const t = e.shift();
        t &&
          (o.items || (this.loadItems(o), await this.httpComplete),
          (o = ql(o.items, t).item),
          o ? i.push(t) : e.splice(0, e.length));
      }
      (this.selection = i), this.refresh(), this.requestUpdate('root');
    }
    isSelected(t) {
      if (t.level < this.selection.length) {
        return this.selection[t.level] == (t.vanity_id || t.id);
      }
      return !1;
    }
    isExpanded(t) {
      return !!this.selection.find(e => e === t.vanity_id || t.id);
    }
    render() {
      if (!this.root || !this.root.items) return null;
      let t = this.root.items || [];
      const e = [],
        i = this.isMobile() ? ve.menu : ve.menu_collapse;
      e.push(j`<div class="level level-0 ${this.submenu ? 'hidden' : ''}">
        <div class="top">
          <div class="expand-icon" @click=${this.handleExpand}>
            <temba-icon
              name="${i}"
              class="collapse expand"
              size="1.4"
            ></temba-icon>
          </div>
        </div>
        <div class="top-spacer"></div>

        ${t.filter(t => !t.bottom).map(t => this.renderMenuItem(t))}

        <div class="empty"></div>
        ${t.filter(t => !!t.bottom).map(t => this.renderMenuItem(t))}
        <div class="bottom"></div>
      </div>`),
        this.selection.forEach((i, o) => {
          const n = ql(t, i).item;
          let s = !1;
          if (n) {
            t = n.items;
            const e = this.getMenuItemState(n.id);
            e.collapsed
              ? (s = 'collapsed' === e.collapsed)
              : this.selection.length > n.level + 2 && (s = !1);
          } else t = null;
          const r = this.isMobile() ? ve.close : ve.menu_collapse;
          t &&
            t.length > 0 &&
            !n.inline &&
            e.push(j`<div
            class="${Ht({ level: !0, ['level-' + (o + 1)]: !0, collapsed: s })}"
          >
            ${
              this.submenu
                ? null
                : j`
                  <slot
                    class="${Ht({ 'show-header': n.show_header })}"
                    name="header"
                  ></slot>
                  <div class="section-header">
                    <div class="section">${n.name}</div>

                    ${
                      0 != o || this.collapsed
                        ? null
                        : j`<temba-icon
                          name=${r}
                          size="1.5"
                          @click=${this.handleCollapse}
                        ></temba-icon>`
                    }
                  </div>
                `
            }
            ${t.map(t =>
              t.inline && t.items
                ? j`${this.renderMenuItem(t)}
                  <div class="inline-children">
                    ${(t.items || []).map(e => this.renderMenuItem(e, t))}
                  </div>`
                : this.renderMenuItem(t)
            )}
          </div>`);
        });
      const o = j`<div
      class="${Ht({ root: !0, 'fully-collapsed': this.collapsed, mobile: this.isMobile() })}"
    >
      ${e}
    </div>`;
      return j`${o}`;
    }
  }
  t([ge({ type: Boolean })], Ul.prototype, 'wraps', void 0),
    t([ge({ type: Boolean })], Ul.prototype, 'wait', void 0),
    t([ge({ type: String })], Ul.prototype, 'endpoint', void 0),
    t([ge({ type: String })], Ul.prototype, 'expanding', void 0),
    t([ge({ type: String })], Ul.prototype, 'value', void 0),
    t([ge({ type: String })], Ul.prototype, 'submenu', void 0),
    t([ge({ type: Boolean })], Ul.prototype, 'collapsed', void 0),
    t([ge({ type: Object })], Ul.prototype, 'pressedItem', void 0);
  class Fl extends lt {
    static get styles() {
      return r`
      :host {
        color: var(--color-link-primary);
        display: inline-block;
      }

      slot:hover {
        cursor: pointer;
        text-decoration: underline;
      }
    `;
    }
    handleClick(t) {
      window.goto(t);
    }
    render() {
      return j`<slot href="${this.href}" @click="${this.handleClick}"></slot>`;
    }
  }
  t([ge({ type: String })], Fl.prototype, 'href', void 0);
  class Zl extends ue {
    static get styles() {
      return r`
      .wrapper {
        position: relative;
      }

      .toggle {
        cursor: pointer;
      }

      .dropdown-wrapper {
        position: relative;
        overflow: auto;
      }

      .dropdown {
        position: absolute;
        opacity: 0;
        z-index: 2;
        pointer-events: none;
        padding: 0;
        border-radius: var(--curvature);
        background: #fff;
        transform: translateY(1em) scale(0.9);
        transition: all calc(0.8 * var(--transition-speed)) var(--bounce);
        user-select: none;
        margin-top: 0px;
        margin-left: 0px;
        box-shadow: var(--dropdown-shadow);
      }

      .dropdown:focus {
        outline: none;
      }

      .arrow {
        content: '';
        width: 0px;
        height: 0;
        top: -6px;
        z-index: 10;
        position: absolute;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-bottom: 6px solid white;
      }

      .open .dropdown {
        opacity: 1;
        pointer-events: auto;
        transform: translateY(0.5em) scale(1);
      }

      .mask {
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        opacity: 0;
        transition: opacity var(--transition-speed) ease-in-out;
        pointer-events: none;
        z-index: 1;
      }

      .mask.open {
        opacity: 1;
        pointer-events: auto;
      }

      .right {
        right: 0;
      }
    `;
    }
    constructor() {
      super(),
        (this.open = !1),
        (this.top = !1),
        (this.bottom = !1),
        (this.left = !1),
        (this.right = !1),
        (this.arrowSize = 6),
        (this.arrowOffset = 2 * this.arrowSize),
        (this.offsetX = 0),
        (this.offsetY = 0),
        (this.mask = !1),
        (this.ensureOnScreen = this.ensureOnScreen.bind(this));
    }
    firstUpdated(t) {
      super.firstUpdated(t);
      const e = this.shadowRoot.querySelector('.arrow');
      (e.style.borderWidth = this.arrowSize + 'px'),
        (e.style.top = '-' + this.arrowSize + 'px'),
        this.arrowOffset < 0
          ? (e.style.right = Math.abs(this.arrowOffset) + 'px')
          : (e.style.left = this.arrowOffset + 'px');
      this.shadowRoot.querySelector('.dropdown').addEventListener('blur', () => {
        window.setTimeout(() => {
          (this.open = !1), this.shadowRoot.host.blur();
        }, 200);
      });
    }
    updated(t) {
      super.updated(t);
      const e = this.shadowRoot.querySelector('.dropdown');
      (t.has('offsetY') || t.has('offsetX')) &&
        ((e.style.marginTop = this.offsetY + 'px'),
        e.offsetLeft + e.clientWidth > window.outerWidth
          ? (e.style.marginLeft = '-' + (e.clientWidth - this.clientWidth - this.offsetX) + 'px')
          : this.right
          ? (e.style.marginRight = this.offsetX + 'px')
          : (e.style.marginLeft = this.offsetX + 'px')),
        t.has('open') &&
          (window.setTimeout(this.ensureOnScreen, 0), window.setTimeout(this.ensureOnScreen, 100));
    }
    ensureOnScreen() {
      const t = this.shadowRoot.querySelector('.dropdown');
      if (t) {
        const e = this.querySelector('div[slot="toggle"]');
        if (!e) return;
        t.getBoundingClientRect().bottom > window.innerHeight - 100
          ? this.bottom
            ? (t.style.top = e.clientHeight + 'px')
            : ((t.style.top = ''), (t.style.bottom = e.clientHeight + 'px'))
          : t.getBoundingClientRect().top < 0 &&
            (this.bottom
              ? (t.style.top = e.clientHeight + 'px')
              : ((t.style.top = e.clientHeight + 'px'), (t.style.bottom = ''))),
          t.getBoundingClientRect().right > window.innerWidth
            ? ((t.style.left = ''), (t.style.right = '0px'))
            : t.getBoundingClientRect().left < 0 && ((t.style.left = '0px'), (t.style.right = ''));
      }
    }
    handleToggleClicked(t) {
      if ((t.preventDefault(), t.stopPropagation(), !this.open)) {
        this.open = !0;
        this.shadowRoot.querySelector('.dropdown').focus();
      }
    }
    handleDropdownMouseDown(t) {
      t.preventDefault(), t.stopPropagation();
    }
    render() {
      return j`
      ${this.mask ? j`<div class="mask  ${this.open ? 'open' : ''}" />` : null}

      <div class="wrapper ${this.open ? 'open' : ''}">
        <slot
          name="toggle"
          class="toggle"
          @click=${this.handleToggleClicked}
        ></slot>
        <div
          class="${Ht({
            dropdown: !0,
            right: this.right,
            left: this.left,
            top: this.top,
            bottom: this.bottom
          })}"
          tabindex="0"
          @mousedown=${this.handleDropdownMouseDown}
        >
          <div class="arrow"></div>
          <div class="dropdown-wrapper">
            <slot name="dropdown" tabindex="1"></slot>
          </div>
        </div>
      </div>
    `;
    }
  }
  t([ge({ type: Boolean })], Zl.prototype, 'open', void 0),
    t([ge({ type: Boolean })], Zl.prototype, 'top', void 0),
    t([ge({ type: Boolean })], Zl.prototype, 'bottom', void 0),
    t([ge({ type: Boolean })], Zl.prototype, 'left', void 0),
    t([ge({ type: Boolean })], Zl.prototype, 'right', void 0),
    t([ge({ type: Number })], Zl.prototype, 'arrowSize', void 0),
    t([ge({ type: Number })], Zl.prototype, 'arrowOffset', void 0),
    t([ge({ type: Number })], Zl.prototype, 'offsetX', void 0),
    t([ge({ type: Number })], Zl.prototype, 'offsetY', void 0),
    t([ge({ type: Boolean })], Zl.prototype, 'mask', void 0);
  class jl extends ue {
    constructor() {
      super(...arguments),
        (this.embedded = !1),
        (this.collapses = !1),
        (this.bottom = !1),
        (this.focusedName = !1),
        (this.index = -1),
        (this.refresh = ''),
        (this.tabs = []);
    }
    static get styles() {
      return r`
      :host {
        display: flex;
        flex-direction: column;
        min-height: 0;
        flex-grow: 1;
      }

      .tabs {
        display: flex;
        align-items: stretch;
      }

      .tab {
        user-select: none;
        padding: 0.5em 0.7em;
        margin: 0em 0em;
        cursor: pointer;
        display: flex;
        font-size: 1.01em;
        align-items: center;
        border-radius: var(--curvature);
        border-bottom-right-radius: 0px;
        border-bottom-left-radius: 0px;
        border: 0px solid rgba(0, 0, 0, 0.45);
        color: var(--color-text-dark);
        --icon-color: var(--color-text-dark);
        white-space: nowrap;
        transition: all 100ms linear;
      }

      .focusedname .tab .name {
        transition: all 0s linear !important;
      }

      .focusedname .tab.selected .name {
        transition: all 200ms linear !important;
      }

      .tab.hidden {
        display: none;
      }

      .tab temba-icon {
      }

      .tab .name {
        margin-left: 0.4em;
        max-width: 80px;
        overflow: hidden;
        transition: max-width 500ms ease-in-out, margin 500ms ease-in-out;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .tab .badge {
        margin-left: 0.4em;
      }

      @media (max-width: 900px) {
        .collapses .tab .name {
          max-width: 0px;
          margin: 0;
        }
      }

      @media (max-width: 600px) {
        .collapses .tab .badge {
          display: none;
        }
      }

      .focusedname .tab.selected {
        transform: none;
      }

      .focusedname .tab .name {
        max-width: 0px;
        margin: 0;
        transition: max-width 200ms linear, margin 200ms linear;
      }

      .focusedname .tab.selected .name {
        margin-left: 0.4em;
        max-width: 200px;
      }

      .tab {
        transform: scale(0.9) translate(0em, -0.05em);
        --icon-color: #aaa;
        color: #aaa;
      }

      .tab.selected {
      }

      .tab.selected,
      .tab.selected:hover {
        cursor: default;
        box-shadow: 0px -3px 3px 1px rgba(0, 0, 0, 0.02);
        background: var(--focused-tab-color, #fff);
        transform: scale(1) translateY(0em);
        --icon-color: #666;
        color: #666;
      }

      .bottom .tab.selected {
      }

      .tab:hover {
        --icon-color: #666;
        color: #666;
        background: rgba(0, 0, 0, 0.02);
      }

      .pane {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        background: var(--focused-tab-color, #fff);
        border-radius: var(--curvature);
        box-shadow: var(
          --tabs-shadow,
          rgba(0, 0, 0, 0.1) 0px 1px 3px 0px,
          rgba(0, 0, 0, 0.03) 0px 1px 2px 0px
        );
        min-height: 0;
      }

      .pane.first {
        border-top-left-radius: 0px;
        overflow: hidden;
      }

      .badge {
      }

      .count {
        border-radius: 99px;
        background: rgba(0, 0, 0, 0.05);
        color: rgba(0, 0, 0, 0.5);
        font-size: 0.6em;
        font-weight: 400;
        padding: 0.1em 0.4em;
        min-width: 1em;
        text-align: center;
      }

      .notify .count {
        background: var(--color-alert);
        color: #fff;
      }

      .bottom.tabs .tab {
        border-radius: 0em;
      }

      .bottom.pane {
        border-radius: 0em;
      }

      .bottom.pane.first {
        border-bottom-left-radius: 0px;
      }

      .bottom .tab.first {
        border-bottom-left-radius: var(--curvature);
      }

      .embedded.pane {
        box-shadow: none;
        margin: 0;
      }

      .embedded.tabs {
        margin: 0;
      }

      .embedded .tab {
      }

      .embedded.tabs .tab.selected {
        box-shadow: none !important;
      }

      .embedded.pane {
        // padding: 0.3em;
      }

      .check {
        margin-left: 0.4em;
      }

      .pane {
        display: flex;
      }
    `;
    }
    handleTabClick(t) {
      (this.index = parseInt(t.currentTarget.dataset.index)),
        t.preventDefault(),
        t.stopPropagation(),
        this.requestUpdate('index');
    }
    handleSlotChange() {
      const t = [];
      for (const e of this.children)
        if ('TEMBA-TAB' === e.tagName) {
          const i = e;
          t.push(i);
        }
      this.tabs = t;
    }
    firstUpdated(t) {
      super.firstUpdated(t),
        this.shadowRoot.addEventListener('slotchange', this.handleSlotChange.bind(this));
    }
    updated(t) {
      if (
        (super.updated(t),
        (t.has('index') || t.has('tabs')) &&
          (this.tabs.forEach((t, e) => {
            t.selected = e == this.index;
          }),
          this.fireEvent(Me.ContextChanged)),
        this.index > this.tabs.length)
      ) {
        const t = this.tabs[this.index];
        if (t && t.hidden)
          for (let t = 0; t < this.tabs.length; t++) {
            const e = this.tabs[t];
            if (e && !e.hidden) return void (this.index = t);
          }
      }
    }
    setTabDetails(t, e) {
      if (t < this.tabs.length) {
        const i = this.tabs[t];
        (i.count = e.count), (i.hidden = e.hidden), this.requestUpdate();
      } else
        setTimeout(() => {
          this.setTabDetails(t, e);
        }, 100);
    }
    getCurrentTab() {
      return this.tabs[this.index];
    }
    getTab(t) {
      return this.tabs[t];
    }
    handleTabContentChanged() {
      this.requestUpdate();
    }
    render() {
      return j`
      ${
        this.bottom
          ? j`<div
            class="pane ${Ht({
              first: 0 == this.index,
              embedded: this.embedded,
              bottom: this.bottom
            })}"
          >
            <slot></slot>
          </div>`
          : null
      }

      <div
        class="tabs ${Ht({
          tabs: !0,
          bottom: this.bottom,
          collapses: this.collapses,
          embedded: this.embedded,
          focusedname: this.focusedName
        })}"
      >
        ${this.tabs.map(
          (t, e) => j`
            <div
              @click=${this.handleTabClick}
              data-index=${e}
              class="${Ht({
                tab: !0,
                first: 0 == e,
                selected: e == this.index,
                hidden: t.hidden,
                notify: t.notify
              })}"
              style="${
                t.selectionColor && e == this.index
                  ? `color:${t.selectionColor};--icon-color:${t.selectionColor};`
                  : ''
              } ${
            t.selectionBackground && e == this.index
              ? `background-color:${t.selectionBackground};`
              : ''
          }"
            >
              ${t.icon ? j`<temba-icon name=${t.icon} />` : null}
              <div class="name">${t.name}</div>
              ${
                t.hasBadge()
                  ? j`
                    <div class="badge">
                      ${
                        t.count > 0
                          ? j`<div class="count">
                            ${t.count.toLocaleString()}
                          </div>`
                          : null
                      }
                    </div>
                  `
                  : null
              }
              ${t.checked ? j`<temba-icon class="check" name="check"></temba-icon>` : null}
            </div>
          `
        )}

        <div style="flex-grow:1"></div>
        <div style="display:flex; align-items:center">
          <slot name="tab-right"></slot>
        </div>
      </div>
      ${
        this.bottom
          ? null
          : j`<div
            class="pane ${Ht({
              first: 0 == this.index,
              embedded: this.embedded,
              bottom: this.bottom
            })}"
          >
            <slot></slot>
          </div>`
      }
    `;
    }
  }
  t([ge({ type: Boolean })], jl.prototype, 'embedded', void 0),
    t([ge({ type: Boolean })], jl.prototype, 'collapses', void 0),
    t([ge({ type: Boolean })], jl.prototype, 'bottom', void 0),
    t([ge({ type: Boolean })], jl.prototype, 'focusedName', void 0),
    t([ge({ type: Number })], jl.prototype, 'index', void 0),
    t([ge({ type: String })], jl.prototype, 'refresh', void 0),
    t([ge({ type: Array, attribute: !1 })], jl.prototype, 'tabs', void 0);
  class Hl extends ue {
    constructor() {
      super(...arguments),
        (this.selected = !1),
        (this.notify = !1),
        (this.hidden = !1),
        (this.count = 0),
        (this.checked = !1);
    }
    static get styles() {
      return r`
      :host {
        display: none;
        flex-direction: column;
        min-height: 0;
      }

      :host(.selected) {
        display: flex;
        flex-grow: 1;
      }
    `;
    }
    updated(t) {
      super.updated(t), t.has('selected') && this.classList.toggle('selected', this.selected);
    }
    hasBadge() {
      return this.count > 0;
    }
    render() {
      return j`<slot
      class="${Ht({ selected: this.selected })}"
    ></slot> `;
    }
  }
  t([ge({ type: String })], Hl.prototype, 'name', void 0),
    t([ge({ type: String })], Hl.prototype, 'icon', void 0),
    t([ge({ type: String })], Hl.prototype, 'selectionColor', void 0),
    t([ge({ type: String })], Hl.prototype, 'selectionBackground', void 0),
    t([ge({ type: Boolean })], Hl.prototype, 'selected', void 0),
    t([ge({ type: Boolean })], Hl.prototype, 'notify', void 0),
    t([ge({ type: Boolean })], Hl.prototype, 'hidden', void 0),
    t([ge({ type: Number })], Hl.prototype, 'count', void 0),
    t([ge({ type: Boolean })], Hl.prototype, 'checked', void 0);
  class Vl extends lt {
    static get styles() {
      return r`
      :host {
        display: inline-block;
      }

      slot {
        white-space: nowrap;
        overflow-x: hidden;
        text-overflow: ellipsis;
        display: block;
      }

      .mask {
        padding: 3px 8px;
        border-radius: 12px;
        display: flex;
      }

      temba-icon {
        margin-right: 0.3em;
        padding-bottom: 0.1em;
      }

      .label.clickable .mask:hover {
        background: var(--color-background-hover, rgb(0, 0, 0, 0.05));
      }

      .label {
        font-size: 0.8em;
        font-weight: 400;
        border-radius: 12px;
        box-shadow: var(--widget-shadow, 0 0.04em 0.08em rgba(0, 0, 0, 0.15));
        background: var(--color-overlay-light);
        color: var(--color-overlay-light-text);
        --icon-color: var(--color-overlay-light-text);
        text-shadow: none;
      }

      .danger {
        background: tomato;
        color: #fff;
        --icon-color: #fff;
      }

      .primary {
        background: var(--color-primary-dark);
        color: var(--color-text-light);
        --icon-color: var(--color-text-light);
      }

      .secondary {
        background: var(--color-secondary-dark);
        color: var(--color-text-light);
        --icon-color: var(--color-text-light);
      }

      .tertiary {
        background: var(--color-tertiary);
        color: var(--color-text-light);
        --icon-color: var(--color-text-light);
      }

      .dark {
        background: var(--color-overlay-dark);
        text-shadow: none;
      }

      .clickable {
        cursor: pointer;
      }

      .shadow {
        box-shadow: 1px 1px 2px 1px rgba(0, 0, 0, 0.1);
      }
    `;
    }
    render() {
      const t = {};
      return (
        this.backgroundColor && (t.background = this.backgroundColor),
        this.textColor && ((t.color = this.textColor), (t['--icon-color'] = this.textColor)),
        j`
      <div
        class="label ${Ht({
          clickable: this.clickable,
          primary: this.primary,
          secondary: this.secondary,
          tertiary: this.tertiary,
          shadow: this.shadow,
          danger: this.danger,
          dark: this.dark
        })}"
        style=${Se(t)}
      >
        <div class="mask">
          ${this.icon ? j`<temba-icon name=${this.icon} />` : null}
          <slot></slot>
        </div>
      </div>
    `
      );
    }
  }
  t([ge({ type: Boolean })], Vl.prototype, 'clickable', void 0),
    t([ge({ type: Boolean })], Vl.prototype, 'primary', void 0),
    t([ge({ type: Boolean })], Vl.prototype, 'secondary', void 0),
    t([ge({ type: Boolean })], Vl.prototype, 'tertiary', void 0),
    t([ge({ type: Boolean })], Vl.prototype, 'danger', void 0),
    t([ge({ type: Boolean })], Vl.prototype, 'dark', void 0),
    t([ge({ type: Boolean })], Vl.prototype, 'shadow', void 0),
    t([ge({ type: String })], Vl.prototype, 'icon', void 0),
    t([ge()], Vl.prototype, 'backgroundColor', void 0),
    t([ge()], Vl.prototype, 'textColor', void 0);
  class Wl extends ue {
    constructor() {
      super(...arguments), (this.size = 20);
    }
    static get styles() {
      return r`
      :host {
        display: flex;
        align-items: center;
      }

      temba-urn {
        margin-right: 0.2em;
      }

      .name {
        font-size: var(--contact-name-font-size, 1.5rem);
        overflow: hidden;
        max-height: 2rem;
        line-height: 2rem;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 1;
        text-overflow: ellipsis;
      }
    `;
    }
    render() {
      const t = this.urn ? j`<temba-urn size=${this.size} urn=${this.urn}></temba-urn>` : null;
      return j`
      ${t}
      <div class="name">
        ${this.name ? this.name : this.urn ? this.urn.split(':')[1] : ''}
      </div>
      <slot></slot>
    `;
    }
  }
  t([ge({ type: String })], Wl.prototype, 'name', void 0),
    t([ge({ type: String })], Wl.prototype, 'urn', void 0),
    t([ge({ type: Number, attribute: 'icon-size' })], Wl.prototype, 'size', void 0);
  class Gl extends ue {
    constructor() {
      super(...arguments), (this.size = 20);
    }
    static get styles() {
      return r`
      :host {
        display: flex;
        align-items: center;
      }
      .urn {
        box-shadow: 0 0 2px 2px rgba(0, 0, 0, 0.04) inset;
        padding: 3px;
        border: 1px solid #ddd;
        border-radius: 18rem;
        background: #eee;
        margin-right: 0.2em;
      }

      .small {
        padding: 0px;
        border: 0px;
        box-shadow: none;
        margin-right: 0.5em;
      }
    `;
    }
    render() {
      const t = this.scheme || this.urn.split(':')[0];
      return j`
      <img
        class="urn ${this.size < 20 ? 'small' : ''}"
        width="${this.size}em"
        height="${this.size}em"
        src="${this.prefix || window.static_url || '/static/'}img/schemes/${t}.svg"
      />
    `;
    }
  }
  t([ge({ type: String })], Gl.prototype, 'urn', void 0),
    t([ge({ type: String })], Gl.prototype, 'scheme', void 0),
    t([ge({ type: Number })], Gl.prototype, 'size', void 0);
  class Ql extends gl {
    constructor() {
      super(...arguments), (this.disabled = !1);
    }
    static get styles() {
      return r`
      .field {
        display: flex;
        margin: 0.3em 0.3em;
        box-shadow: 0 0 0.2em rgba(0, 0, 0, 0.15);
        border-radius: 0px;
        align-items: center;
        overflow: hidden;
      }

      .show-all .unset,
      .featured {
        display: block !important;
      }

      .unset {
        display: none;
      }

      .field:hover {
        box-shadow: 1px 1px 6px 2px rgba(0, 0, 0, 0.05),
          0px 0px 0px 2px var(--color-link-primary);
        cursor: pointer;
      }

      .label {
        padding: 0.25em 1em;
        border-top-left-radius: 0px;
        border-bottom-left-radius: 0px;
        color: #777;
        font-size: 0.9em;
        font-weight: 400;
        box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.1) inset;
      }

      .value {
        --icon-color: #ddd;
        max-width: 150px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        padding: 0.25em 1em;
        border-top-right-radius: 0px;
        border-bottom-right-radius: 0px;
        font-size: 0.9em;
      }

      .toggle {
        display: flex;
        background: #fff;
        align-items: center;
        margin-bottom: 0.5em;
      }

      .disabled .toggle {
        display: none;
      }
    `;
    }
    connectedCallback() {
      super.connectedCallback(), (this.handleFieldChanged = this.handleFieldChanged.bind(this));
    }
    isAgent() {
      return 'T' === this.role;
    }
    updated(t) {
      super.updated(t),
        t.has('data') && Object.keys(this.data.fields).length <= 10 && (this.showAll = !0);
    }
    handleFieldChanged(t) {
      const e = t.currentTarget,
        i = e.value;
      Yt('/api/v2/contacts.json?uuid=' + this.data.uuid, { fields: { [e.key]: i } })
        .then(t => {
          e.handleResponse(t), this.setContact(t.json);
        })
        .catch(t => {
          e.handleResponse(t);
        });
    }
    handleToggle(t) {
      const e = t.currentTarget;
      this.showAll = e.checked;
    }
    render() {
      if (this.data) {
        const t = Object.entries(this.data.fields).sort((t, e) => {
          const [i] = t,
            [o] = e,
            n = this.store.getContactField(i),
            s = this.store.getContactField(o);
          if ('ward' === n.type) return 1;
          if ('ward' === s.type) return -1;
          if ('district' === n.type && 'ward' !== s.type && 'district' !== s.type) return 1;
          if ('district' === s.type && 'ward' !== n.type && 'district' !== n.type) return -1;
          if (
            'state' === n.type &&
            'ward' !== s.type &&
            'district' !== s.type &&
            'state' !== s.type
          )
            return 1;
          if (
            'state' === s.type &&
            'ward' !== n.type &&
            'district' !== n.type &&
            'state' !== n.type
          )
            return -1;
          if (n.featured && !s.featured) return -1;
          if (s.featured && !n.featured) return 1;
          const r = s.priority - n.priority;
          return 0 !== r ? r : i.localeCompare(o);
        });
        if (0 == t.length) return j`<slot name="empty"></slot>`;
        const e = t.map(t => {
          const [e, i] = t,
            o = this.store.getContactField(e);
          return j`<temba-contact-field
          class=${Ht({ set: !!i, unset: !i, featured: o.featured })}
          key=${o.key}
          name=${o.label}
          value=${i}
          type=${o.value_type}
          @change=${this.handleFieldChanged}
          timezone=${this.timezone}
          ?disabled=${!!(
            (this.isAgent() && 'view' === o.agent_access) ||
            this.disabled ||
            'ward' === o.value_type ||
            'district' === o.value_type ||
            'state' === o.value_type
          )}
        ></temba-contact-field>`;
        });
        return j`
        <div class=${Ht({ disabled: this.disabled })}>
          <div class="fields ${this.showAll ? 'show-all' : ''}">${e}</div>
          ${
            Object.keys(this.data.fields).length >= 10
              ? j`<div class="toggle">
                <div style="flex-grow: 1"></div>
                <div>
                  <temba-checkbox
                    ?checked=${this.showAll}
                    @change=${this.handleToggle}
                    label="Show All"
                  ></temba-checkbox>
                </div>
              </div>`
              : null
          }
        </div>
      `;
      }
      return super.render();
    }
  }
  var Kl;
  t([ge({ type: Boolean })], Ql.prototype, 'system', void 0),
    t([ge({ type: Boolean })], Ql.prototype, 'dirty', void 0),
    t([ge({ type: Boolean })], Ql.prototype, 'showAll', void 0),
    t([ge({ type: String })], Ql.prototype, 'timezone', void 0),
    t([ge({ type: String })], Ql.prototype, 'role', void 0),
    t([ge({ type: Boolean })], Ql.prototype, 'disabled', void 0),
    (function(t) {
      (t.Success = 'success'), (t.Failure = 'failure'), (t.Saving = 'saving'), (t.Ready = 'ready');
    })(Kl || (Kl = {}));
  class Yl extends ue {
    constructor() {
      super(...arguments),
        (this.icon = navigator.clipboard ? ve.copy : ''),
        (this.iconClass = ''),
        (this.status = Kl.Ready),
        (this.disabled = !1),
        (this.dirty = !1);
    }
    static get styles() {
      return r`
      :host {
        --transition-speed: 0ms;
      }

      .wrapper {
        --temba-textinput-padding: 1.4em 0.8em 0.4em 0.8em;
        --disabled-opacity: 1;
        position: relative;
        --color-widget-bg: transparent;
        --color-widget-bg-focused: #fff;
        --widget-box-shadow: none;
        padding-bottom: 0.6em;
        border-bottom: 1px solid #ececec;
      }

      .wrapper.disabled {
        --color-widget-border: transparent;
      }

      .wrapper.mutable:hover {
      }

      .wrapper.mutable {
        --color-widget-border: rgb(235, 235, 235);
        --color-widget-bg: transparent;
        --input-cursor: pointer;

        border-bottom: none;
        margin-bottom: 0.5em;
        padding-bottom: 0em;
      }

      .mutable.success {
        --color-widget-border: rgba(var(--success-rgb), 0.6);
      }

      .mutable.failure {
        --color-widget-border: rgba(var(--error-rgb), 0.3) !important;
      }

      .mutable .dirty {
        --color-widget-border: rgb(235, 235, 235);
      }

      .prefix {
        border-top-left-radius: var(--curvature-widget);
        border-bottom-left-radius: var(--curvature-widget);
        cursor: pointer !important;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        display: flex;
        padding: 0em 0.5em;
        position: absolute;
        margin-top: 0.2em;
        pointer-events: none;
      }

      .wrapper {
        margin-bottom: 0.5em;
      }

      .prefix .name,
      .label .name {
        padding: 0em 0.4em;
        color: rgba(100, 100, 100, 0.7);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 0.8em;
      }

      .disabled .name {
        margin-top: 1em;
        margin-left: 0.75em;
      }

      .disabled .value {
        margin-left: 0.9em;
        margin-top: 0.1em;
        min-height: 1.75em;
      }

      .postfix {
        display: flex;
        align-items: stretch;
        margin-left: 1em;
      }

      .popper {
        background: rgba(0, 0, 0, 0.03);
        border-top-right-radius: var(--curvature-widget);
        border-bottom-right-radius: var(--curvature-widget);
        --icon-color: #888;
        display: flex;
        cursor: default;
        transition: all var(--transition-speed) ease-in-out;
        align-items: stretch;
        margin: -1px;
      }

      temba-icon[name='calendar'] {
        --icon-color: rgba(0, 0, 0, 0.2);
      }

      temba-icon:hover {
        --icon-color: rgba(0, 0, 0, 0.5);
      }

      temba-icon {
        cursor: pointer;
        --icon-color: rgba(0, 0, 0, 0.3);
      }

      temba-textinput:focus .popper,
      temba-textinput:hover .popper {
        display: flex;
      }

      .disabled temba-textinput .postfix {
        display: none;
        padding: none;
      }

      .unset temba-textinput .popper .copy,
      .unset temba-textinput .popper .search {
        display: none;
      }

      .unset temba-textinput:focus .popper .copy,
      .unset temba-textinput:hover .popper .copy,
      .unset temba-textinput:focus .popper .save,
      .unset temba-textinput:hover .popper .save {
        display: none;
      }

      .popper temba-icon {
        padding: 0.5em 0em;
        padding-right: 1em;
      }

      .popper:first-child {
        padding: 0.5em 0em;
        padding-right: 0.5em;
        padding-left: 1em;
      }

      .popper:last-child {
        padding-right: 0em;
      }

      .copy.clicked temba-icon {
        transform: scale(1.2);
      }

      temba-icon {
        transition: all 200ms ease-in-out;
      }

      temba-datepicker {
        position: relative;
      }

      .save-state {
        display: flex;
        align-items: center;
      }

      .save-button {
        padding-right: 1em;
      }

      .dirty .copy,
      .dirty .search {
        display: none;
      }

      .saving .copy,
      .saving .search {
        display: none;
      }

      .success .copy,
      .success .search {
        display: none;
      }

      .failure .copy,
      .failure .search {
        display: none;
      }

      .popper.success {
        background: rgb(var(--success-rgb));
      }

      .popper.failure {
        background: rgb(var(--error-rgb));
      }

      .popper.success temba-icon,
      .popper.failure temba-icon {
        --icon-color: #fff !important;
      }

      .popper.dirty {
        background: rgba(0, 0, 0, 0.03);
      }

      temba-datepicker .popper {
        border-radius: 0px;
      }

      temba-datepicker .popper:first-child {
        padding: 0;
      }

      .dirty temba-datepicker .popper:first-child {
        padding-left: 1em;
      }

      .success temba-datepicker .popper:first-child {
        padding-left: 1em;
      }

      .failure temba-datepicker .popper:first-child {
        padding-left: 1em;
      }

      .saving temba-datepicker .popper:first-child {
        padding-left: 1em;
      }

      temba-datepicker .postfix {
        margin-left: 0;
      }

      .saving temba-datepicker,
      .saving temba-textinput {
        pointer-events: none !important;
        cursor: default !important;
        opacity: 0.7;
      }
    `;
    }
    connectedCallback() {
      super.connectedCallback(),
        (this.handleInput = this.handleInput.bind(this)),
        (this.handleSubmit = this.handleSubmit.bind(this));
    }
    handleIconClick(t) {
      const e = t.target.getAttribute('icon-action'),
        i = this.shadowRoot.querySelector('temba-textinput');
      'copy' === e &&
        navigator.clipboard &&
        ((this.iconClass = 'clicked'),
        navigator.clipboard.writeText(i.getDisplayValue()).then(() => {
          window.setTimeout(() => {
            this.iconClass = '';
          }, 300);
        })),
        'search' === e &&
          this.fireCustomEvent(Me.ButtonClicked, { key: this.key, value: this.value }),
        t.preventDefault(),
        t.stopPropagation();
    }
    handleResponse(t) {
      200 === t.status
        ? ((this.value = t.json.fields[this.key]), (this.status = Kl.Ready), (this.dirty = !1))
        : ((this.status = Kl.Failure), (this.dirty = !1));
    }
    handleSubmit() {
      const t = this.shadowRoot.querySelector('temba-textinput, temba-datepicker');
      t.value !== this.value &&
        ((this.dirty = !0),
        (this.status = Kl.Saving),
        (this.value = t.value),
        this.fireEvent('change'));
    }
    handleChange(t) {
      t.preventDefault(), t.stopPropagation();
    }
    handleDateChange(t) {
      t.preventDefault(), t.stopPropagation(), (this.dirty = !0);
    }
    handleInput(t) {
      const e = t.currentTarget;
      'Enter' === t.key
        ? (e.blur(), this.handleSubmit())
        : e.value !== this.value && (this.dirty = !0);
    }
    getInputType(t) {
      return 'numeric' === t ? Ee.Number : Ee.Text;
    }
    render() {
      if (this.disabled)
        return j`<div
        class=${this.status +
          ' ' +
          Ht({
            wrapper: !0,
            set: !!this.value,
            unset: !this.value,
            disabled: this.disabled,
            mutable: !this.disabled,
            dirty: this.dirty
          })}
      >
        <div class="label"><div class="name">${this.name}</div></div>
        <div class="value">
          ${
            'datetime' === this.type
              ? this.value
                ? j`<temba-date
                  value=${this.value}
                  display="datetime"
                ></temba-date>`
                : null
              : this.value
          }
        </div>
      </div>`;
      const t = j`<div class="save-state">
      ${
        this.dirty
          ? j`<temba-button
            class="save-button"
            name="Save"
            small
            @click=${this.handleSubmit}
          ></temba-button>`
          : j` ${
              this.status === Kl.Saving
                ? j`<temba-icon
                spin
                name="${ve.progress_spinner}"
              ></temba-icon>`
                : null
            }
          ${
            this.status !== Kl.Success || this.dirty
              ? null
              : j`<temba-icon name="${ve.success}"></temba-icon>`
          }
          ${
            this.status === Kl.Failure
              ? j`<temba-tip text="Failed to save changes, try again later."
                ><temba-icon name="${ve.alert_warning}"></temba-icon
              ></temba-tip>`
              : null
          }`
      }
    </div>`;
      return j`
      <div
        class=${this.status +
          ' ' +
          Ht({
            wrapper: !0,
            set: !!this.value,
            unset: !this.value,
            disabled: this.disabled,
            mutable: !this.disabled,
            dirty: this.dirty
          })}
      >
        ${
          'datetime' === this.type
            ? j`
              <temba-datepicker
                timezone=${this.timezone}
                value="${this.value ? this.value : ''}"
                @change=${this.handleDateChange}
                ?disabled=${this.disabled}
                time
              >
                <div class="prefix" slot="prefix">
                  <div class="name">${this.name}</div>
                </div>
                <div class="postfix" slot="postfix">
                  <div
                    class="popper ${this.status}  ${this.dirty ? 'dirty' : ''}"
                  >
                    ${t}
                  </div>
                </div>
              </temba-datepicker>
            `
            : j`
              <temba-textinput
                class="${this.status} ${this.dirty ? 'dirty' : ''}"
                value="${this.value ? this.value : ''}"
                @keyup=${this.handleInput}
                @change=${this.handleChange}
                type=${this.getInputType(this.type)}
                ?disabled=${this.disabled}
              >
                <div class="prefix" slot="prefix">
                  <div class="name">${this.name}</div>
                </div>

                <div class="postfix">
                  <div
                    class="popper ${this.iconClass} ${this.status}  ${this.dirty ? 'dirty' : ''}"
                    @click=${this.handleIconClick}
                  >
                    ${t}

                    <temba-icon
                      class="search"
                      icon-action="search"
                      name="${ve.search}"
                      animateclick="pulse"
                    ></temba-icon>
                    <temba-icon
                      class="copy"
                      icon-action="copy"
                      name="${this.icon}"
                      animatechange="spin"
                      animateclick="pulse"
                    ></temba-icon>
                  </div>
                </div>
              </temba-textinput>
            `
        }
      </div>
    `;
    }
  }
  t([ge({ type: String })], Yl.prototype, 'key', void 0),
    t([ge({ type: String })], Yl.prototype, 'value', void 0),
    t([ge({ type: String })], Yl.prototype, 'name', void 0),
    t([ge({ type: String })], Yl.prototype, 'type', void 0),
    t([ge({ type: String })], Yl.prototype, 'timezone', void 0),
    t([ge({ type: String })], Yl.prototype, 'icon', void 0),
    t([ge({ type: String })], Yl.prototype, 'iconClass', void 0),
    t([ge({ type: String })], Yl.prototype, 'status', void 0),
    t([ge({ type: Boolean })], Yl.prototype, 'disabled', void 0),
    t([ge({ type: Boolean })], Yl.prototype, 'dirty', void 0);
  const Jl = {
    stopped: { name: 'Stopped' },
    blocked: { name: 'Blocked' },
    archived: { name: 'Archived' }
  };
  class Xl extends gl {
    constructor() {
      super(...arguments), (this.hasMore = !1), (this.expanded = !1);
    }
    static get styles() {
      return r`
      .wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      temba-label {
        margin: 0.3em;
      }

      .expanded .badges {
        max-height: inherit;
      }

      .expanded .show-button {
        opacity: 1;
        margin-bottom: 0em;
        margin-top: -0.5em;
      }

      .expanded .show-line {
        width: 98%;
        opacity: 1;
      }

      .badges {
        display: flex;
        overflow: hidden;
        flex-wrap: wrap;
        max-height: 2.2em;
        align-self: flex-start;
      }

      .show-button {
        transition: all var(--transition-speed) ease-in-out
          var(--transition-speed);
        opacity: 0;
        display: flex;
        padding: 0em 1em;
        margin-top: -0.8em;
        cursor: pointer;
        --icon-color-circle: #fff;
        margin-bottom: -1.5em;
      }

      .show-line {
        height: 1px;
        width: 100%;
        background: rgba(0, 0, 0, 0.05);
        margin-top: 1em;
        width: 0px;
        transition: width calc(var(--transition-speed) * 2) linear
          var(--transition-speed);
      }

      .has-more .show-line {
        width: 98%;
      }

      .has-more .show-button {
        opacity: 1;
        margin-bottom: 0em;
        margin-top: -0.5em;
      }

      .show-button temba-icon {
        border-radius: 9999px;
      }
    `;
    }
    handleResized() {
      if (this.shadowRoot) {
        const t = this.shadowRoot.querySelector('.badges');
        t && (this.hasMore = t.scrollHeight > t.clientHeight);
      }
    }
    updated(t) {
      if ((super.updated(t), t.has('data') && !t.get('data'))) {
        const t = this.shadowRoot.querySelector('.badges');
        new ResizeObserver(te(this.handleResized.bind(this), 200)).observe(t);
      }
    }
    render() {
      if (this.data) {
        const t = Jl[this.data.status];
        return j`
        <div
          class=${Ht({ wrapper: !0, 'has-more': this.hasMore, expanded: this.expanded })}
        >
          <div class="badges">
            ${
              t && 'active' !== this.data.status
                ? j`
                  <temba-label
                    icon="icon.contact_${this.data.status}"
                    onclick="goto(event)"
                    href="/contact/${t.name.toLowerCase()}/"
                    secondary
                    clickable
                    shadow
                  >
                    ${t.name}
                  </temba-label>
                `
                : null
            }
            ${
              this.data.flow
                ? j`
                  <temba-label
                    icon="flow"
                    onclick="goto(event)"
                    href="/contact/?search=flow+%3D+${encodeURIComponent(
                      '"' + this.data.flow.name + '"'
                    )}"
                    clickable
                    primary
                    shadow
                  >
                    ${this.data.flow.name}
                  </temba-label>
                `
                : null
            }
            ${
              this.data.language
                ? j`
                  <temba-label
                    icon=${ve.language}
                    onclick="goto(event)"
                    href="/contact/?search=language+%3D+${encodeURIComponent(
                      '"' + this.data.language + '"'
                    )}"
                    clickable
                    primary
                    shadow
                  >
                    ${this.store.getLanguageName(this.data.language)}
                  </temba-label>
                `
                : null
            }
            ${this.data.groups.map(
              t => j`
                <temba-label
                  class="group"
                  onclick="goto(event)"
                  href="/contact/filter/${t.uuid}/"
                  icon=${t.is_dynamic ? ve.group_smart : ve.group}
                  clickable
                  shadow
                >
                  ${t.name}
                </temba-label>
              `
            )}
          </div>
          <div class="show-line"></div>

          <div class="show-button">
            <temba-icon
              @click=${() => {
                this.expanded = !this.expanded;
              }}
              circled
              name=${this.expanded ? ve.up : ve.down}
              animateChange="spin"
            ></temba-icon>
          </div>
        </div>
      `;
      }
      return null;
    }
  }
  t([ge({ type: Boolean })], Xl.prototype, 'hasMore', void 0),
    t([ge({ type: Boolean })], Xl.prototype, 'expanded', void 0);
  const th = {
    [$e.CampaignEvent]: ve.campaign,
    [$e.ScheduledBroadcast]: ve.message,
    [$e.ScheduledTrigger]: ve.trigger
  };
  class eh extends ml {
    static get styles() {
      return r`
      :host {
      }

      a,
      .linked {
        color: var(--color-link-primary);
        cursor: pointer;
      }

      a:hover,
      .linked:hover {
        text-decoration: underline;
        color: var(--color-link-primary-hover);
      }

      .type {
        background: rgba(0, 0, 0, 0.02);
        padding: 1em;
        display: flex;
        align-self: stretch;
        --icon-color: rgba(50, 50, 50, 0.25);
        border-top-left-radius: var(--curvature);
        border-bottom-left-radius: var(--curvature);
      }

      .details {
        display: flex;
        flex-direction: column;
        padding: 0.5em 1em;
        flex-grow: 1;
      }

      .campaign {
        display: flex;
        color: var(--text-color);
        --icon-color: var(--text-color);
        align-self: center;
        white-space: nowrap;
      }

      .message {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        padding: 0.1em;
      }

      .event {
        margin-bottom: 0.5em;
        border-radius: var(--curvature);
        display: flex;
        flex-direction: row;
        align-items: center;
        box-shadow: 0 0 8px 1px rgba(0, 0, 0, 0.055),
          0 0 0px 1px rgba(0, 0, 0, 0.02);
      }

      .event:hover {
        cursor: pointer;
        box-shadow: 0 0 8px 1px rgba(0, 0, 0, 0.055),
          0 0 0px 2px var(--color-link-primary);
      }

      .time {
        white-space: nowrap;
        background: rgba(0, 0, 0, 0.02);
        border-top-right-radius: var(--curvature);
        border-bottom-right-radius: var(--curvature);
        display: flex;
        align-self: stretch;
        padding: 0 1em;
        min-width: 5em;
      }

      .duration {
        align-self: center;
        flex-grow: 1;
        text-align: center;
      }

      .flow {
        display: inline-block;
      }

      temba-tip {
        cursor: default;
      }

      .scheduled-by {
        font-size: 0.85em;
        display: flex;
        color: var(--text-color);
        --icon-color: var(--text-color);
      }

      .scheduled-by temba-icon {
        margin-right: 0.25em;
      }

      .scheduled-by .name {
        flex-grow: 1;
      }
    `;
    }
    constructor() {
      super(),
        (this.lang_weekly = 'Weekly'),
        (this.lang_daily = 'Daily'),
        (this.lang_once = 'Once'),
        (this.REPEAT_PERIOD = { O: this.lang_once, D: this.lang_daily, W: this.lang_weekly }),
        (this.handleEventClicked = this.handleEventClicked.bind(this));
    }
    updated(t) {
      super.updated(t),
        t.has('contact') &&
          (this.contact ? (this.url = `/contact/scheduled/${this.contact}/`) : (this.url = null));
    }
    handleEventClicked(t) {
      this.fireCustomEvent(Me.Selection, t);
    }
    renderEvent(t) {
      return j`
      <div
        class="event ${t.type}"
        @click="${() => this.handleEventClicked(t)}"
      >
        <div class="type">
          <temba-icon
            size="2"
            name="${t.message ? ve.message : ve.flow}"
          ></temba-icon>
        </div>

        <div class="details">
          <div>
            ${t.flow ? j` Start ${t.flow.name}` : null}
            ${t.message ? j` <div class="message">${t.message}</div> ` : null}
          </div>

          <div class="scheduled-by">
            ${
              t.campaign
                ? j`<div style="display:flex">
                  <temba-icon name="${ve.campaign}"></temba-icon>
                  <div class="name">${t.campaign.name}</div>
                </div>`
                : j`
                  ${
                    t.type === $e.ScheduledTrigger
                      ? j`<temba-icon
                        name="${th[t.type]}"
                      ></temba-icon>`
                      : null
                  }
                  <div class="name">
                    ${this.REPEAT_PERIOD[t.repeat_period]}
                  </div>
                `
            }
          </div>
        </div>

        <div class="time">
          <div class="duration">
            <temba-tip
              text=${this.store.formatDate(t.scheduled)}
              position="left"
            >
              ${this.store.getShortDurationFromIso(t.scheduled)}
            </temba-tip>
          </div>
        </div>
      </div>
    `;
    }
    render() {
      if (this.data)
        return this.data.length > 0
          ? j`
          ${this.data.map(t => this.renderEvent(t))}
        `
          : j`<slot name="empty"></slot>`;
    }
  }
  t([ge({ type: String })], eh.prototype, 'contact', void 0),
    t([ge({ type: Object, attribute: !1 })], eh.prototype, 'data', void 0),
    t([ge({ type: String })], eh.prototype, 'lang_weekly', void 0),
    t([ge({ type: String })], eh.prototype, 'lang_daily', void 0),
    t([ge({ type: String })], eh.prototype, 'lang_once', void 0);
  class ih extends ml {
    constructor() {
      super(...arguments), (this.clickable = !1), (this.expandable = !1), (this.expanded = !1);
    }
    static get styles() {
      return r`
      :host {
      }

      :hover {
      }

      .ticket.expandable:hover,
      .ticket.clickable:hover {
        cursor: pointer;
        box-shadow: 0 0 8px 1px rgba(0, 0, 0, 0.055),
          0 0 0px 2px var(--color-link-primary);
      }

      .header {
        display: flex;
        flex-direction: row;
        flex-grow: 1;
      }

      .tickets {
        display: flex;
        flex-direction: column;
        padding: 0.3em 0.8em;
      }

      .count {
        margin-left: 0.5em;
      }

      .ticket {
        background: #fff;
        display: flex;
        flex-direction: column;
        margin-bottom: 0.5em;
        border-radius: var(--curvature);
        display: flex;
        flex-direction: column;
        align-items: stretch;
        box-shadow: 0 0 8px 1px rgba(0, 0, 0, 0.055),
          0 0 0px 1px rgba(0, 0, 0, 0.02);
        transition: all 200ms ease-in-out;
      }

      .ticket .topic {
        overflow: hidden;
        text-overflow: ellipsis;
        margin: 0.5em 0.75em 0.5em 0.75em;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 1;
        flex-grow: 2;
      }

      .ticket .body {
        max-height: 0px;
        overflow-y: auto;
        -webkit-line-clamp: none;
        white-space: normal;
        width: initial;
        padding: 0.5em 0.75em 0em 0.75em;
        max-height: 40vh;
        display: none;
        margin-bottom: 0.5em;
        border-top: 1px solid #e6e6e6;
      }

      .ticket.expanded .body {
        display: block;
      }

      .status {
        --icon-color: #999;
      }

      .ticket.closed {
        background: #f9f9f9;
        color: #888;
      }

      .resolve {
        color: var(--color-primary-dark);
      }

      .dropdown {
        color: rgb(45, 45, 45);
        z-index: 50;
        width: 18em;
      }

      .option-group {
        padding: 0.4em;
        border-bottom: 1px solid #f3f3f3;
      }

      .option-group temba-user {
        flex-grow: 1;
      }

      .assigned .user {
        flex-grow: 1;
      }

      .assigned {
        display: flex;
        align-items: center;
      }

      .assigned temba-button {
        margin-right: 0.75em;
      }

      .assigned .user:hover {
        cursor: default;
        background: none;
      }

      .options {
        max-height: 40vh;
        overflow-y: auto;
        border-bottom: none;
      }

      .user {
        display: flex;
        align-items: center;
        border-radius: var(--curvature);
        cursor: pointer;
      }

      .user:hover {
        background: var(--color-selection);
      }

      .user .name {
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
        flex-grow: 1;
      }

      .user temba-button {
        margin-left: 0.5em;
      }

      .current-user {
        font-weight: 400;
      }

      .details {
        display: flex;
        align-items: center;
        flex-shrink: 1;
        margin-right: 0.5em;
      }

      .details .date {
        padding: 0em 0.5em;
      }

      .details .toggle {
        padding-right: 0.5em;
      }
    `;
    }
    prepareData(t) {
      return (
        t &&
          t.length &&
          t.sort((t, e) =>
            t.status == Oe.Open && e.status == Oe.Closed
              ? -1
              : e.status == Oe.Open && t.status == Oe.Closed
              ? 1
              : t.status == Oe.Closed && e.status == Oe.Closed
              ? new Date(e.closed_on).getTime() - new Date(t.closed_on).getTime()
              : new Date(e.opened_on).getTime() - new Date(t.opened_on).getTime()
          ),
        t
      );
    }
    updated(t) {
      super.updated(t),
        (t.has('contact') || t.has('ticket')) &&
          (this.contact
            ? (this.url = `/api/v2/tickets.json?contact=${this.contact}${
                this.ticket ? '&ticket=' + this.ticket : ''
              }`)
            : (this.url = null));
    }
    handleClose(t) {
      Yt('/api/v2/ticket_actions.json', { tickets: [t], action: 'close' })
        .then(() => {
          this.refresh();
        })
        .catch(t => {
          console.error(t);
        });
    }
    handleReopen(t) {
      Yt('/api/v2/ticket_actions.json', { tickets: [t], action: 'reopen' })
        .then(() => {
          this.refresh();
        })
        .catch(t => {
          console.error(t);
        });
    }
    handleTicketAssignment(t, e) {
      const i = this.data.find(e => e.uuid === t);
      if (!i.assignee || i.assignee.email !== e)
        return (
          this.blur(),
          Yt('/api/v2/ticket_actions.json', { tickets: [t], action: 'assign', assignee: e })
            .then(() => {
              this.refresh();
            })
            .catch(t => {
              console.error(t);
            }),
          !0
        );
    }
    renderTicket(t) {
      const e = t.opened_on,
        i = this.store.getAssignableUsers().find(t => t.email === this.agent);
      return j`
      <div
        @click=${() => {
          this.clickable
            ? this.fireCustomEvent(Me.ButtonClicked, { ticket: t })
            : this.expandable && (this.expanded = !this.expanded);
        }}
        class="ticket ${t.status} ${Ht({
        clickable: this.clickable,
        expandable: this.expandable,
        expanded: this.expanded
      })}"
      >
        <div class="header">
          <div class="topic">${t.topic.name}</div>

          <div class="details">
            <div class="date">
              <temba-date value="${e}" display="duration"></temba-date>
            </div>

            ${
              t.status === Oe.Closed
                ? j`<div class="reopen">
                  <temba-button
                    primary
                    small
                    name="Reopen"
                    @click=${e => {
                      e.preventDefault(), e.stopPropagation(), this.handleReopen(t.uuid);
                    }}
                  ></temba-button>
                </div>`
                : j`
                  <div>
                    <temba-dropdown
                      right
                      arrowsize="8"
                      arrowoffset="-44"
                      offsety="8"
                      offsetx=${t.assignee ? -42 : -28}
                    >
                      <div slot="toggle" class="toggle">
                        ${
                          t.assignee
                            ? j`
                              <temba-user
                                email=${t.assignee.email}
                                scale="${0.8}"
                              ></temba-user>
                            `
                            : j`
                              <temba-button
                                name="Assign"
                                primary
                                small
                              ></temba-button>
                            `
                        }
                      </div>

                      <div
                        slot="dropdown"
                        class="dropdown"
                        @click=${t => {
                          ae(t);
                        }}
                      >
                        ${
                          t.assignee
                            ? j`
                              <div
                                class="assigned option-group ${
                                  i && t.assignee.email == i.email ? 'current-user' : ''
                                }"
                              >
                                <temba-user
                                  email=${t.assignee.email}
                                  name
                                  scale="${0.7}"
                                ></temba-user>
                                <temba-button
                                  name="Unassign"
                                  primary
                                  small
                                  @click=${e => {
                                    ae(e), this.handleTicketAssignment(t.uuid, null);
                                  }}
                                ></temba-button>
                              </div>
                            `
                            : null
                        }
                        ${
                          !i || (t.assignee && i.email === t.assignee.email)
                            ? null
                            : j`
                              <div
                                class="current-user option-group"
                                @click=${e => {
                                  ae(e), this.handleTicketAssignment(t.uuid, i.email);
                                }}
                              >
                                <temba-user
                                  email=${i.email}
                                  name
                                  scale="${0.7}"
                                ></temba-user>
                              </div>
                            `
                        }

                        <div class="options option-group">
                          ${this.store.getAssignableUsers().map(e =>
                            (t.assignee && e.email === t.assignee.email) || e.email === this.agent
                              ? null
                              : j`<div
                              @click=${i => {
                                ae(i), this.handleTicketAssignment(t.uuid, e.email);
                              }}
                            >
                              <temba-user
                                email=${e.email}
                                scale="${0.7}"
                                name
                              ></temba-user>
                            </div>`
                          )}
                        </div>
                      </div>
                    </temba-dropdown>
                  </div>
                  <temba-tip
                    text="Resolve"
                    position="left"
                    style="width:1.5em"
                    class="resolve"
                  >
                    <temba-icon
                      size="1.25"
                      name="${ve.check}"
                      @click=${e => {
                        e.preventDefault(), e.stopPropagation(), this.handleClose(t.uuid);
                      }}
                      ?clickable=${open}
                    />
                  </temba-tip>
                `
            }
          </div>
        </div>
        <div class="body">${t.body}</div>
      </div>
    `;
    }
    render() {
      if (this.data && this.data.length > 0) {
        const t = this.data.map(t => this.renderTicket(t));
        return j`${t}`;
      }
      return j`<slot name="empty"></slot>`;
    }
  }
  t([ge({ type: String })], ih.prototype, 'agent', void 0),
    t([ge({ type: String })], ih.prototype, 'contact', void 0),
    t([ge({ type: String })], ih.prototype, 'ticket', void 0),
    t([ge({ type: Boolean })], ih.prototype, 'clickable', void 0),
    t([ge({ type: Boolean })], ih.prototype, 'expandable', void 0),
    t([ge({ type: Boolean })], ih.prototype, 'expanded', void 0),
    t([ge({ type: Object, attribute: !1 })], ih.prototype, 'data', void 0);
  class oh extends fe {
    constructor() {
      super(...arguments),
        (this.range = !1),
        (this.min = 0),
        (this.max = 100),
        (this.circleX = 0),
        (this.grabbed = !1);
    }
    static get styles() {
      return r`
      :host {
        display: block;
      }

      .track {
        height: 2px;
        border-top: 0.5em solid #fff;
        border-bottom: 0.5em solid #fff;
        background: #ddd;
        flex-grow: 1;
      }

      .circle {
        margin-bottom: -1.05em;
        margin-left: -0.5em;
        width: 0.75em;
        height: 0.75em;
        border: 2px solid #999;
        border-radius: 999px;
        position: relative;
        background: #fff;
        box-shadow: 0 0 0 4px rgb(255, 255, 255);
        transition: transform 200ms ease-in-out;
      }

      .grabbed .track {
        cursor: pointer;
      }

      :hover .circle {
        border-color: #777;
        cursor: pointer;
      }

      .grabbed .circle {
        border-color: var(--color-primary-dark);
        background: #fff;
      }

      .grabbed .circle {
        transform: scale(1.2);
      }

      .wrapper {
        display: flex;
        align-items: center;
      }

      .pre,
      .post {
        font-size: 0.9em;
        color: #999;
        padding: 0em 1em;
      }
    `;
    }
    firstUpdated(t) {
      super.firstUpdated(t),
        (this.handleMouseMove = this.handleMouseMove.bind(this)),
        (this.handleMouseUp = this.handleMouseUp.bind(this));
    }
    updated(t) {
      t.has('value') && this.updateCircle();
    }
    updateValue(t) {
      const e = this.shadowRoot.querySelector('.track'),
        i = (t.pageX - e.offsetLeft) / e.offsetWidth,
        o = (this.max - this.min) * i + this.min;
      this.value = '' + Math.max(this.min, Math.min(Math.round(o), this.max));
    }
    handleMouseMove(t) {
      this.grabbed && this.updateValue(t);
    }
    handleTrackDown(t) {
      (this.grabbed = !0),
        document.addEventListener('mousemove', this.handleMouseMove),
        document.addEventListener('mouseup', this.handleMouseUp),
        document.querySelector('html').classList.add('dragging'),
        this.updateValue(t),
        this.requestUpdate();
    }
    handleMouseUp(t) {
      (this.grabbed = !1),
        this.updateValue(t),
        this.requestUpdate(),
        document.removeEventListener('mousemove', this.handleMouseMove),
        document.removeEventListener('mouseup', this.handleMouseUp),
        document.querySelector('html').classList.remove('dragging');
    }
    updateCircle() {
      const t = this.shadowRoot.querySelector('.track'),
        e = this.shadowRoot.querySelector('.pre'),
        i = this.max - this.min;
      let o = parseInt(this.value);
      !o || o < this.min ? (o = this.min) : o > this.max && (o = this.max), (this.value = '' + o);
      const n = (o - this.min) / i,
        s = t.offsetWidth * n;
      (this.circleX = s + (e ? e.offsetWidth : 0)), this.requestUpdate();
    }
    render() {
      return j` <div class="${Ht({ grabbed: this.grabbed })}">
      <div
        style=${Se({ left: this.circleX + 'px' })}
        class="circle"
        @mousedown=${this.handleTrackDown}
      ></div>
      <div class="wrapper">
        ${this.range ? j`<div class="pre">${this.min}</div>` : null}
        <div class="track" @mousedown=${this.handleTrackDown}></div>
        ${this.range ? j`<div class="post">${this.max}</div>` : null}
      </div>
    </div>`;
    }
  }
  t([ge({ type: Boolean })], oh.prototype, 'range', void 0),
    t([ge({ type: Number })], oh.prototype, 'min', void 0),
    t([ge({ type: Number })], oh.prototype, 'max', void 0);
  const nh = 'rgb(223, 65, 159)';
  class sh extends El {
    static get styles() {
      return r`
      :host {
        overflow-y: auto !important;
        --contact-name-font-size: 1em;
      }

      @media only screen and (max-height: 768px) {
        temba-options {
          max-height: 20vh;
        }
      }

      temba-options {
        display: block;
        width: 100%;
        flex-grow: 1;
      }
    `;
    }
    firstUpdated(t) {
      super.firstUpdated(t);
    }
    updated(t) {
      if (
        (super.updated(t),
        (t.has('responses') || t.has('flow')) &&
          this.flow &&
          (this.endpoint = `/api/v2/runs.json?flow=${this.flow}${
            this.responses ? '&responded=1' : ''
          }`),
        t.has('resultPreview') && this.createRenderOption(),
        t.has('results') && this.results)
      ) {
        this.shadowRoot.querySelector('temba-select').setOptions(this.results),
          (this.resultKeys = this.results.reduce((t, e) => ({ ...t, [e.key]: e }), {}));
      }
    }
    renderResultPreview(t) {
      if (this.resultPreview) {
        const e = t.values[this.resultPreview.key];
        if (e) {
          if (!(this.resultPreview.categories.length > 1)) return e.value;
          if (e.category) return e.category;
        }
      }
      return null;
    }
    removeRun(t) {
      (this.items = this.items.filter(e => e.id !== t)),
        (this.cursorIndex = Math.min(this.cursorIndex, this.items.length)),
        this.requestUpdate('cursorIndex');
    }
    getIcon(t) {
      let e = null;
      return (
        'completed' == t.exit_type
          ? (e = j`<temba-icon
        name="check"
        style="--icon-color:#666;margin-left:0.5em"
      />`)
          : 'interrupted' == t.exit_type
          ? (e = j`<temba-icon
        name="x-octagon"
        style="--icon-color:${nh};margin-left:0.5em"
      />`)
          : 'expired' == t.exit_type
          ? (e = j`<temba-icon
        name="clock"
        style="--icon-color:${nh};margin-left:0.5em"
      />`)
          : t.exit_type ||
            (e = t.responded
              ? j`<temba-icon
          name="activity"
          style="--icon-color:var(--color-primary-dark);margin-left:0.5em"
        />`
              : j`<temba-icon
          name="hourglass"
          style="--icon-color:var(--color-primary-dark);margin-left:0.5em"
        />`),
        e
      );
    }
    createRenderOption() {
      this.renderOption = t => {
        let e = '';
        return (
          t.exited_on || (e = 'font-weight:400;'),
          t.responded || (e += ''),
          j`
        <div class="row" style="${e}display:flex;align-items:center">
          <div
            style="width:16em;white-space:nowrap;overflow: hidden; text-overflow: ellipsis;"
          >
            <temba-contact-name
              name=${t.contact.name || t.contact.anon_display}
              urn=${t.contact.urn}
              icon-size="15"
            />
          </div>

          <div
            style="margin: 0em 1em;flex:1;white-space:nowrap; overflow:hidden; text-overflow: ellipsis;"
          >
            ${this.renderResultPreview(t)}
          </div>

          <div style="flex-shrink:1">
            <temba-date value="${t.modified_on}" display="duration" />
          </div>
          ${this.getIcon(t)}
        </div>
      `
        );
      };
    }
    getRefreshEndpoint() {
      if (this.items.length > 0) {
        const t = this.items[0].modified_on;
        return this.endpoint + '&after=' + t;
      }
      return this.endpoint;
    }
    toggleResponded() {
      this.responses = this.shadowRoot.querySelector('#responded').checked;
    }
    handleColumnChanged(t) {
      t.target.values.length > 0
        ? (this.resultPreview = t.target.values[0])
        : (this.resultPreview = null);
    }
    handleSelected(t) {
      this.selectedRun = t;
    }
    getListStyle() {
      return '';
    }
    renderHeader() {
      return j`
      <div style="display:flex;width:100%;margin-bottom: 1em;">
        <div style="flex-grow:1">
          ${
            this.results
              ? j`
                <temba-select
                  clearable
                  placeholder="Result Preview"
                  @change=${this.handleColumnChanged}
                />
              `
              : null
          }
        </div>
        <div style="margin-left:1em;">
          <temba-checkbox
            id="responded"
            label="Responses Only"
            checked="true"
            @click=${this.toggleResponded}
          />
        </div>
      </div>
      <div
        style="
        font-size:0.8em;
        color:rgba(0,0,0,.4);
        text-align:right;
        background:#f9f9f9;
        border: 1px solid var(--color-widget-border);
        margin-bottom:-0.5em; 
        padding-bottom: 0.6em;
        padding-top: 0.3em;
        padding-right: 4.5em;
        border-top-right-radius: var(--curvature);
        border-top-left-radius: var(--curvature)
    "
      >
        Last Updated
      </div>
    `;
    }
    renderFooter() {
      if (!this.selectedRun || !this.resultKeys) return null;
      const t = Object.keys(this.selectedRun.values);
      return j` <div
      style="margin-top: 1.5em; margin-bottom:0.5em;flex-grow:1;border-radius:var(--curvature); border: 1px solid var(--color-widget-border);"
    >
      <div style="display:flex;flex-direction:column;">
        <div
          style="font-size:1.5em;background:#f9f9f9;padding:.75em;padding-top:.35em;display:flex;align-items:center;border-top-right-radius:var(--curvature);border-top-left-radius:var(--curvature)"
        >
          <div>
            <temba-contact-name
              style="cursor:pointer"
              name=${this.selectedRun.contact.name || this.selectedRun.contact.anon_display}
              urn=${this.selectedRun.contact.urn}
              onclick="goto(event, this)"
              href="/contact/read/${this.selectedRun.contact.uuid}/"
            ></temba-contact-name>
            <div
              style="display:flex;margin-left:-0.2em;margin-top:0.25em;font-size: 0.65em"
            >
              ${
                this.selectedRun.exit_type
                  ? j`
                    <div style="margin-left:2em;flex-grow:1;display:flex">
                      ${this.getIcon(this.selectedRun)}
                      <div style="margin-left:0.5em">
                        ${re(this.selectedRun.exit_type)}&nbsp;
                      </div>
                      <temba-date
                        value="${this.selectedRun.exited_on}"
                        compare="${this.selectedRun.created_on}"
                        display="duration"
                      />
                    </div>
                  `
                  : j`${this.getIcon(this.selectedRun)}
                    <div style="margin-left:1.5em;flex-grow:1;display:flex">
                      <div>Started&nbsp;</div>
                      <temba-date
                        value="${this.selectedRun.created_on}"
                        display="duration"
                      ></temba-date>
                    </div>`
              }
            </div>
          </div>
          <div style="flex-grow:1"></div>
          <div style="display:flex;flex-direction: column">
            <div style="font-size:0.75em">
              ${new Date(this.selectedRun.created_on).toLocaleString()}
            </div>
            <div
              style="font-size:0.6em;align-self:flex-end;color:#888;line-height:0.75em"
            >
              Started
            </div>
          </div>
          <temba-icon
            clickable
            style="margin-left:0.75em;"
            name=${ve.delete}
            onclick="deleteRun(${this.selectedRun.id});"
          ></temba-icon>
        </div>

        ${
          t.length > 0
            ? j`
              <div style="padding:1em;">
                <div
                  style="display:flex;font-size:1.2em;position:relative;right:0px"
                >
                  <div style="flex-grow:1"></div>
                </div>

                <table width="100%">
                  <tr>
                    <th style="text-align:left" width="25%">Result</th>
                    <th style="text-align:left" width="25%">Category</th>
                    <th style="text-align:left">Value</th>
                  </tr>

                  ${Object.keys(this.selectedRun.values).map(t => {
                    const e = this.selectedRun.values[t],
                      i = this.resultKeys[t];
                    return i
                      ? j`<tr>
                        <td>${e.name}</td>
                        <td>
                          ${i.categories.length > 1 ? e.category : '--'}
                        </td>
                        <td>${e.value}</td>
                      </tr>`
                      : null;
                  })}
                </table>
              </div>
            `
            : null
        }
      </div>
    </div>`;
    }
    constructor() {
      super(),
        (this.responses = !0),
        (this.resultKeys = {}),
        (this.reverseRefresh = !1),
        (this.valueKey = 'uuid'),
        (this.hideShadow = !0),
        this.createRenderOption();
    }
  }
  t([ge({ type: String })], sh.prototype, 'flow', void 0),
    t([ge({ type: Object, attribute: !1 })], sh.prototype, 'results', void 0),
    t([ge({ type: Boolean })], sh.prototype, 'responses', void 0),
    t([ge({ type: Object })], sh.prototype, 'resultPreview', void 0),
    t([ge({ type: Object })], sh.prototype, 'selectedRun', void 0);
  class rh extends ml {
    constructor() {
      super(...arguments), (this.endpoint = '/api/v2/flows.json?uuid=');
    }
    prepareData(t) {
      return t && t.length > 0 && (t = t[0]), t;
    }
    updated(t) {
      super.updated(t),
        t.has('flow') &&
          (this.flow ? (this.url = `${this.endpoint}${this.flow}`) : (this.url = null));
    }
    render() {
      if (this.data) return j`<div></div>`;
    }
  }
  t([ge({ type: String })], rh.prototype, 'flow', void 0),
    t([ge({ type: Object, attribute: !1 })], rh.prototype, 'data', void 0),
    t([ge({ type: String })], rh.prototype, 'endpoint', void 0);
  class ah extends gl {
    constructor() {
      super(...arguments), (this.size = 20);
    }
    static get styles() {
      return r`
      :host {
        display: flex;
      }

      temba-urn {
        margin-right: 0.2em;
        margin-top: 2px;
      }
    `;
    }
    render() {
      return this.data
        ? j` <temba-contact-name
          name=${this.data.name || this.data.anon_display}
          urn=${this.data.urns.length > 0 ? this.data.urns[0] : null}
        ></temba-contact-name>
        <slot></slot>`
        : super.render();
    }
  }
  t([ge({ type: Number, attribute: 'icon-size' })], ah.prototype, 'size', void 0);
  class lh extends fe {
    static get styles() {
      return r`
      :host {
        display: block;
      }

      input {
        width: inherit;
      }

      .container {
        border-radius: var(--curvature);
        border: 1px solid var(--color-widget-border);
        display: flex;
        cursor: pointer;
        box-shadow: var(--widget-box-shadow);
        flex-wrap: wrap;
        overflow: hidden;
      }

      .input-wrapper {
        padding: var(--temba-textinput-padding);
        flex-grow: 1;
      }

      .tz {
        margin-left: 0.5em;
        font-size: 0.8em;
        flex-direction: column;
        align-self: stretch;
        color: #888;
        display: flex;
        align-items: flex-start;
        flex-direction: column;
        padding: 0em 1em;
        font-weight: 400;
        cursor: pointer;
        margin: auto 0;
      }

      .tz .label {
        font-size: 0.8em;
        color: #aaa;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .tz .zone {
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .tz-wrapper {
        background: #efefef;
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 0.4em 0em;
      }

      .container:focus-within {
        border-color: var(--color-focus);
        background: var(--color-widget-bg-focused);
        box-shadow: var(--widget-box-shadow-focused);
      }

      input {
        color: var(--color-widget-text);
        border: 0px;
        font-family: var(--font-family);
        outline: none;
        width: 100%;
        font-size: 13px;
        padding: 0px;
        margin: 0px;
        line-height: 1em;
      }

      input.unset {
        color: #ddd;
      }

      input.unset:focus {
        color: var(--color-widget-text);
      }

      input:focus {
        outline: none;
      }

      .disabled ::-webkit-calendar-picker-indicator {
        display: none;
      }

      .disabled .tz-wrapper {
        border-radius: var(--curvature);
      }

      ::-webkit-calendar-picker-indicator {
        background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="15" viewBox="0 0 24 24"><path fill="%23bbbbbb" d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/></svg>');
        cursor: pointer;
        margin: 0;
        padding: 0;
      }

      ::-webkit-calendar-picker-indicator:hover {
        background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="15" viewBox="0 0 24 24"><path fill="%23777777" d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/></svg>');
        cursor: pointer;
        margin: 0;
        padding: 0;
      }
    `;
    }
    serializeValue(t) {
      return t;
    }
    constructor() {
      super(),
        (this.timezone = ''),
        (this.timezoneFriendly = ''),
        (this.datetime = null),
        (this.time = !1);
    }
    firstUpdated(t) {
      if (t.has('value'))
        if (this.time) {
          if (
            ((this.timezone = this.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone),
            (this.timezoneFriendly = this.timezone.replace('_', ' ').replace('/', ', ')),
            this.value)
          ) {
            let t = Ls.fromSQL(this.value).setZone(this.timezone);
            t.invalid && (t = Ls.fromISO(this.value).setZone(this.timezone)),
              (this.datetime = t),
              (this.value = this.datetime.toUTC().toISO());
          }
        } else (this.datetime = Ls.fromSQL(this.value)), (this.value = this.datetime.toISODate());
    }
    updated(t) {
      super.updated(t),
        t.has('timezone') &&
          this.time &&
          ((this.timezone = this.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone),
          (this.timezoneFriendly = this.timezone.replace('_', ' ').replace('/', ', ')),
          this.requestUpdate('value'));
    }
    handleChange(t) {
      t.preventDefault(),
        t.stopPropagation(),
        this.time
          ? ((this.datetime = Ls.fromISO(t.target.value, { zone: this.timezone })),
            (this.value = this.datetime.toUTC().toISO()))
          : (this.value = t.target.value),
        this.fireEvent('change');
    }
    handleClicked() {
      this.shadowRoot.querySelector('input').focus();
    }
    render() {
      const t = Ht({ unset: !this.value });
      let e = null;
      return (
        this.time && this.datetime && !this.datetime.invalid
          ? (e = this.datetime.toFormat("yyyy-LL-dd'T'HH:mm"))
          : this.time || (e = this.value),
        j`
      <temba-field
        class=${Ht({ disabled: this.disabled })}
        name=${this.name}
        .label="${this.label}"
        .helpText="${this.helpText}"
        .errors=${this.errors}
        .widgetOnly=${this.widgetOnly}
        .hideLabel=${this.hideLabel}
        .disabled=${this.disabled}
      >
        <div class="container" @click=${this.handleClicked}>
          <slot name="prefix"></slot>
          <div class="input-wrapper">
            <input
              class=${t}
              name=${this.label}
              value=${e}
              type="${this.time ? 'datetime-local' : 'date'}"
              @change=${this.handleChange}
            />
          </div>
          ${
            this.time
              ? j`
                <div class="tz-wrapper">
                  <div class="tz">
                    <div class="label">Time Zone</div>
                    <div class="zone">${this.timezoneFriendly}</div>
                  </div>
                </div>
              `
              : null
          }
          <slot name="postfix"></slot>
        </div>
      </temba-field>
    `
      );
    }
  }
  t([ge({ type: String })], lh.prototype, 'timezone', void 0),
    t([ge({ type: String })], lh.prototype, 'timezoneFriendly', void 0),
    t([ge({ type: Object })], lh.prototype, 'datetime', void 0),
    t([ge({ type: Boolean })], lh.prototype, 'time', void 0);
  const hh = {
      text: 'Text',
      numeric: 'Number',
      number: 'Number',
      datetime: 'Date & Time',
      state: 'State',
      ward: 'Ward',
      district: 'District'
    },
    ch = (t, e) => {
      if (!e) return !0;
      return (
        (t.label + t.key + hh[t.value_type])
          .toLowerCase()
          .toLowerCase()
          .indexOf(e) > -1
      );
    };
  class dh extends ml {
    constructor() {
      super(...arguments), (this.otherFieldKeys = []), (this.query = '');
    }
    static get styles() {
      return r`
      :host {
        display: flex;
        flex-grow: 1;
        flex-direction: column;
        min-height: 0px;
      }

      .featured,
      .other-fields {
        background: #fff;
        border-radius: var(--curvature);
        box-shadow: var(--shadow);
        margin-bottom: 1em;
        display: flex;
        flex-direction: column;
      }

      .featured {
        max-height: 40%;
      }

      .other-fields {
        flex-grow: 2;
        min-height: 0px;
        margin-bottom: 0px;
      }

      temba-textinput {
        margin-bottom: 1em;
      }

      .scroll-box {
        overflow-y: auto;
        flex-grow: 1;
        flex-direction: column;
        display: flex;
      }

      .header temba-icon {
        margin-right: 0.5em;
      }

      .label {
        flex-grow: 1;
      }

      .header {
        padding: 0.5em 1em;
        display: flex;
        align-items: flex-start;
        border-bottom: 1px solid var(--color-widget-border);
      }

      .featured-field {
        user-select: none;
      }

      temba-sortable-list {
        padding: 0.5em 0em;
        width: 100%;
        overflow-y: auto;
      }

      .scroll-box {
        padding: 0.5em 0em;
      }

      temba-icon[name='usages']:hover {
        --icon-color: var(--color-link-primary);
      }

      .field:hover temba-icon[name='delete_small'] {
        opacity: 1 !important;
        cursor: pointer !important;
        pointer-events: all !important;
      }

      temba-icon[name='delete_small']:hover {
        --icon-color: var(--color-link-primary);
      }

      .field {
        border: 1px solid transparent;
        margin: 0 0.5em;
        border-radius: var(--curvature);
      }

      .featured temba-sortable-list .field:hover {
        cursor: move;
        border-color: #e6e6e6;
        background: #fcfcfc;
      }
    `;
    }
    firstUpdated(t) {
      super.firstUpdated(t), (this.url = this.store.fieldsEndpoint);
    }
    filterFields() {
      const t = this.store.getFieldKeys().filter(t => {
        const e = this.store.getContactField(t);
        return !e.featured && ch(e, this.query);
      });
      t.sort((t, e) =>
        this.store.getContactField(t).label.localeCompare(this.store.getContactField(e).label)
      );
      const e = [];
      this.store.getFeaturedFields().forEach(t => {
        ch(t, this.query) && e.push(t);
      }),
        (this.otherFieldKeys = t),
        (this.featuredFields = e);
    }
    updated(t) {
      super.update(t), (t.has('data') || t.has('query')) && this.filterFields();
    }
    handleSaveOrder(t) {
      const e = t.currentTarget;
      Yt(
        this.priorityEndpoint,
        e
          .getIds()
          .reverse()
          .reduce((t, e, i) => ((t[e] = i), t), {})
      ).then(() => {
        this.store.refreshFields();
      });
    }
    handleOrderChanged(t) {
      const e = t.detail,
        i = this.featuredFields[e.fromIdx];
      (this.featuredFields[e.fromIdx] = this.featuredFields[e.toIdx]),
        (this.featuredFields[e.toIdx] = i),
        this.requestUpdate('featuredFields');
    }
    handleDragStart(t) {
      this.draggingId = t.detail.id;
    }
    handleDragStop() {
      this.draggingId = null;
    }
    handleFieldAction(t) {
      const e = t.target,
        i = e.dataset.key,
        o = e.dataset.action;
      this.fireCustomEvent(Me.Selection, { key: i, action: o });
    }
    handleSearch(t) {
      this.query = (t.target.value || '').trim();
    }
    hasUsages(t) {
      return t.usages.campaign_events + t.usages.flows + t.usages.groups > 0;
    }
    renderField(t) {
      return j`
      <div
        class="field sortable"
        id="${t.key}"
        style="
            display: flex; 
            flex-direction: row; 
            align-items: center;
            padding: 0.25em 1em; 
            ${t.key === this.draggingId ? 'background: var(--color-selection)' : ''}"
      >
        <div
          style="display: flex; min-width: 200px; width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-right: 2em"
        >
          <span
            @click=${this.handleFieldAction}
            data-key=${t.key}
            data-action="update"
            style="color: var(--color-link-primary); cursor:pointer;"
          >
            ${t.label}
          </span>
          ${
            this.hasUsages(t)
              ? j`
                <temba-icon
                  size="0.8"
                  style="color: #ccc; margin-left: 0.7em;"
                  name="usages"
                  data-key=${t.key}
                  data-action="usages"
                  @click=${this.handleFieldAction}
                  clickable
                ></temba-icon>
              `
              : null
          }
          <div class="flex-grow:1"></div>
        </div>
        <div
          style="flex-grow:1; font-family: Roboto Mono, monospace; font-size:0.8em;"
        >
          @fields.${t.key}
        </div>
        <div>${hh[t.value_type]}</div>
        <temba-icon
          style="pointer-events:none;color:#ccc;margin-left:0.3em;margin-right:-0.5em;opacity:0"
          name="delete_small"
          data-key=${t.key}
          data-action="delete"
          @click=${this.handleFieldAction}
        ></temba-icon>
      </div>
    `;
    }
    render() {
      return this.featuredFields
        ? j`
      <temba-textinput
        id="search"
        placeholder="Search"
        @change=${this.handleSearch}
        clearable
        value=${this.query}
      ></temba-textinput>

      ${
        this.featuredFields.length > 0
          ? j`
            <div class="featured">
              <div class="header">
                <temba-icon name="featured"></temba-icon>
                <div class="label">Featured</div>
              </div>
              ${
                this.query
                  ? j`
                    <div class="scroll-box">
                      ${this.featuredFields.map(t => this.renderField(t))}
                    </div>
                  `
                  : j`
                    <temba-sortable-list
                      @change=${this.handleSaveOrder}
                      @temba-order-changed=${this.handleOrderChanged}
                      @temba-drag-start=${this.handleDragStart}
                      @temba-drag-stop=${this.handleDragStop}
                    >
                      ${this.featuredFields.map(t => this.renderField(t))}
                    </temba-sortable-list>
                  `
              }
            </div>
          `
          : null
      }

      <div class="other-fields">
        <div class="header">
          <temba-icon name="fields"></temba-icon>
          <div class="label">Everything Else</div>
        </div>
        <div class="scroll-box">
          ${this.otherFieldKeys.map(t => this.renderField(this.store.getContactField(t)))}
        </div>
      </div>
    `
        : null;
    }
  }
  t(
    [ge({ type: String, attribute: 'priority-endpoint' })],
    dh.prototype,
    'priorityEndpoint',
    void 0
  ),
    t([ge({ type: Object, attribute: !1 })], dh.prototype, 'featuredFields', void 0),
    t([ge({ type: Object, attribute: !1 })], dh.prototype, 'otherFieldKeys', void 0),
    t([ge({ type: String })], dh.prototype, 'draggingId', void 0),
    t([ge({ type: String })], dh.prototype, 'query', void 0);
  class uh extends ue {
    static get styles() {
      return r`
      :host {
        margin: auto;
      }

      .container {
        user-select: none;
      }

      .dragging {
        background: var(--color-selection);
      }

      .sortable {
        transition: all 300ms ease-in-out;
        display: flex;
        padding: 0.4em 0;
      }

      .sortable:hover temba-icon {
        opacity: 1;
        cursor: move;
      }

      .ghost {
        position: absolute;
        opacity: 0.5;
        transition: none;
      }

      .slot {
        flex-grow: 1;
      }

      slot > * {
        user-select: none;
      }

      temba-icon {
        opacity: 0.1;
        padding: 0.2em 0.5em;
        transition: all 300ms ease-in-out;
      }
    `;
    }
    constructor() {
      super(),
        (this.ghostElement = null),
        (this.downEle = null),
        (this.xOffset = 0),
        (this.yOffset = 0),
        (this.yDown = 0),
        (this.draggingIdx = -1),
        (this.draggingEle = null),
        (this.handleMouseMove = this.handleMouseMove.bind(this)),
        (this.handleMouseUp = this.handleMouseUp.bind(this)),
        (this.handleMouseDown = this.handleMouseDown.bind(this));
    }
    firstUpdated(t) {
      super.firstUpdated(t);
    }
    getIds() {
      return this.shadowRoot
        .querySelector('slot')
        .assignedElements()
        .map(t => t.id);
    }
    getRowIndex(t) {
      return this.shadowRoot
        .querySelector('slot')
        .assignedElements()
        .findIndex(e => e.id === t);
    }
    getOverlappingElement(t) {
      const e = this.ghostElement.getBoundingClientRect();
      return this.shadowRoot
        .querySelector('slot')
        .assignedElements()
        .find(i => {
          const o = i.getBoundingClientRect();
          return (
            i.id !== this.ghostElement.id &&
            (t > this.yDown
              ? e.top < o.bottom && e.bottom > o.bottom
              : o.top < e.bottom && o.bottom > e.bottom)
          );
        });
    }
    handleMouseDown(t) {
      let e = t.target;
      (e = e.closest('.sortable')),
        e &&
          ((this.downEle = e),
          (this.draggingId = e.id),
          (this.draggingIdx = this.getRowIndex(e.id)),
          (this.draggingEle = e),
          (this.xOffset = t.clientX - e.offsetLeft),
          (this.yOffset = t.clientY - e.offsetTop),
          (this.yDown = t.clientY),
          document.addEventListener('mousemove', this.handleMouseMove),
          document.addEventListener('mouseup', this.handleMouseUp));
    }
    handleMouseMove(t) {
      const e = this.shadowRoot.querySelector('slot').assignedElements()[0].parentElement.scrollTop;
      if (!this.ghostElement && this.downEle && Math.abs(t.clientY - this.yDown) > 5) {
        this.fireCustomEvent(Me.DragStart, { id: this.downEle.id }),
          (this.ghostElement = this.downEle.cloneNode(!0)),
          this.ghostElement.classList.add('ghost');
        const t = getComputedStyle(this.downEle);
        this.ghostElement.style.width =
          this.downEle.clientWidth - parseFloat(t.paddingLeft) - parseFloat(t.paddingRight) + 'px';
        this.shadowRoot.querySelector('.container').appendChild(this.ghostElement),
          (this.downEle = null);
      }
      if (this.ghostElement) {
        (this.ghostElement.style.left = t.clientX - this.xOffset + 'px'),
          (this.ghostElement.style.top = t.clientY - this.yOffset - e + 'px');
        const i = this.getOverlappingElement(t.clientY);
        if (i) {
          const t = this.getRowIndex(i.id),
            e = this.ghostElement.id,
            o = i.id;
          this.fireCustomEvent(Me.OrderChanged, {
            from: e,
            to: o,
            fromIdx: this.draggingIdx,
            toIdx: t
          }),
            (this.draggingIdx = t),
            (this.draggingId = o);
        }
      }
    }
    handleMouseUp() {
      this.draggingId &&
        (this.fireCustomEvent(Me.DragStop, { id: this.draggingId }),
        (this.draggingId = null),
        (this.downEle = null),
        this.ghostElement && (this.ghostElement.remove(), (this.ghostElement = null))),
        document.removeEventListener('mousemove', this.handleMouseMove),
        document.removeEventListener('mouseup', this.handleMouseUp),
        this.dispatchEvent(new Event('change'));
    }
    render() {
      return j`
      <div class="container">
        <slot @mousedown=${this.handleMouseDown}></slot>
      </div>
    `;
    }
  }
  t([ge({ type: String })], uh.prototype, 'draggingId', void 0);
  const ph = { 'Temba-Content-Menu': '1', 'Temba-Spa': '1' };
  var mh;
  !(function(t) {
    (t.LINK = 'link'),
      (t.JS = 'js'),
      (t.URL_POST = 'url_post'),
      (t.MODAX = 'modax'),
      (t.DIVIDER = 'divider');
  })(mh || (mh = {}));
  class gh extends ue {
    constructor() {
      super(...arguments), (this.buttons = []), (this.items = []);
    }
    static get styles() {
      return r`
      .container {
        --button-y: 0.4em;
        --button-x: 1em;
        display: flex;
      }

      .button_item,
      .primary_button_item {
        margin-left: 1rem;
      }

      .toggle {
        --icon-color: rgb(102, 102, 102);
        padding: 0.5rem;
        margin-left: 0.5rem;
      }

      .toggle:hover {
        background: rgba(0, 0, 0, 0.05);
        border-radius: var(--curvature);
        --icon-color: rgb(136, 136, 136);
      }

      .dropdown {
        padding: 1rem 1.5rem;
        color: rgb(45, 45, 45);
        z-index: 50;
        min-width: 200px;
      }

      .divider {
        border-bottom: 1px solid rgb(237, 237, 237);
        margin: 1rem -1.5em;
      }

      .item {
        white-space: nowrap;
        margin: 0.2em 0em;
        font-size: 1.1rem;
        cursor: pointer;
        font-weight: 400;
      }

      .item:hover {
        color: var(--color-link-primary);
      }
    `;
    }
    fetchContentMenu() {
      const t = this.endpoint;
      if (t) {
        const e = this.legacy,
          i = ph;
        e && delete i['Temba-Spa'],
          jt(t, null, i)
            .then(t => {
              const e = t.json.items;
              e
                ? ((this.buttons = e.filter(t => t.as_button)),
                  (this.items = e.filter(t => !t.as_button)))
                : ((this.buttons = []), (this.items = [])),
                this.fireCustomEvent(Me.Loaded, { buttons: this.buttons, items: this.items });
            })
            .catch(t => {
              console.error(t);
            });
      }
    }
    refresh() {
      this.fetchContentMenu();
    }
    updated(t) {
      super.updated(t), (t.has('endpoint') || t.has('legacy')) && this.fetchContentMenu();
    }
    handleItemClicked(t, e) {
      this.fireCustomEvent(Me.Selection, { item: t, event: e });
    }
    render() {
      return j`
      <div class="container">
        ${this.buttons.map(
          t => j`<temba-button
            class="${t.primary ? 'primary_button_item' : 'button_item'}"
            name=${t.label}
            @click=${e => this.handleItemClicked(t, e)}
          >
            ${t.label}
          </temba-button>`
        )}
        ${
          this.items && this.items.length > 0
            ? j`<temba-dropdown
              arrowsize="8"
              arrowoffset="-12"
              offsety="6"
              bottom
            >
              <div slot="toggle" class="toggle">
                <temba-icon name="menu" size="1.5"></temba-icon>
              </div>
              <div slot="dropdown" class="dropdown">
                ${this.items.map(t =>
                  t.type === mh.DIVIDER
                    ? j` <div class="divider"></div>`
                    : j` <div
                      class="item"
                      name=${t.label}
                      @click=${e => this.handleItemClicked(t, e)}
                    >
                      ${t.label}
                    </div>`
                )}
              </div>
            </temba-dropdown>`
            : null
        }
      </div>
    `;
    }
  }
  t([ge({ type: String })], gh.prototype, 'endpoint', void 0),
    t([ge({ type: Number })], gh.prototype, 'legacy', void 0),
    t([ge({ type: Array, attribute: !1 })], gh.prototype, 'buttons', void 0),
    t([ge({ type: Array, attribute: !1 })], gh.prototype, 'items', void 0);
  const fh = {
    date: Ls.DATE_SHORT,
    datetime: Ls.DATETIME_SHORT,
    time: Ls.TIME_SIMPLE,
    timedate: 'timedate',
    duration: 'duration',
    relative: 'relative',
    day: 'LLL d'
  };
  class vh extends ue {
    constructor() {
      super(...arguments), (this.display = 'date');
    }
    static get styles() {
      return r`
      .date {
        display: inline;
      }
    `;
    }
    firstUpdated(t) {
      super.firstUpdated(t), (this.store = document.querySelector('temba-store'));
    }
    updated(t) {
      super.updated(t), t.has('value') && (this.datetime = Ls.fromISO(this.value));
    }
    connectedCallback() {
      super.connectedCallback();
    }
    render() {
      if (this.datetime && this.store) {
        this.datetime.setLocale(this.store.getLocale());
        let t = '';
        if (this.display === fh.timedate) {
          const e = Math.abs(this.datetime.diffNow().milliseconds / 1e3 / 60 / 60);
          t =
            e < 24
              ? this.datetime.toLocaleString(fh.time)
              : e < 8760
              ? this.datetime.toFormat(fh.day)
              : this.datetime.toLocaleString(fh.date);
        } else if (this.display === fh.relative) {
          if (Math.abs(this.datetime.diffNow().milliseconds / 1e3 / 60) < 1)
            return j`<span
            class="date"
            title="${this.datetime.toLocaleString(fh.datetime)}"
            >just now</span
          >`;
          t = this.store.getShortDuration(this.datetime);
        } else if (this.display === fh.duration) {
          if (Math.abs(this.datetime.diffNow().milliseconds / 1e3 / 60) < 1)
            return j`<span
            class="date"
            title="${this.datetime.toLocaleString(fh.datetime)}"
            >just now</span
          >`;
          t = this.store.getShortDuration(this.datetime);
        } else
          t =
            this.display === fh.day
              ? this.datetime.toLocaleString(fh.day)
              : this.datetime.toLocaleString(fh[this.display]);
        return j`<span
        class="date"
        title="${this.datetime.toLocaleString(fh.datetime)}"
        >${t}</span
      >`;
      }
    }
  }
  t([ge({ type: String })], vh.prototype, 'value', void 0),
    t([ge({ type: String })], vh.prototype, 'display', void 0),
    t([ge({ type: Object, attribute: !1 })], vh.prototype, 'datetime', void 0);
  let bh = class extends ue {
    constructor() {
      super(...arguments), (this.body = j`<temba-loading></temba-loading>`);
    }
    static get styles() {
      return r``;
    }
    updated(t) {
      super.updated(t),
        t.has('endpoint') &&
          jt(this.endpoint).then(t => {
            this.body = hr(t.body);
          });
    }
    render() {
      return j`${this.body}`;
    }
  };
  t([ge({ type: String })], bh.prototype, 'endpoint', void 0),
    t([ge({ attribute: !1 })], bh.prototype, 'body', void 0),
    (bh = t(
      [
        (t => (e, i) => {
          void 0 !== i
            ? i.addInitializer(() => {
                customElements.define(t, e);
              })
            : customElements.define(t, e);
        })('temba-remote')
      ],
      bh
    ));
  var yh = bh;
  class _h extends fe {
    static get styles() {
      return r`
      .container {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        position: relative;

        border-radius: var(--curvature-widget);
        background: var(--color-widget-bg);
        border: var(--compose-border, 1px solid var(--color-widget-border));
        transition: all ease-in-out var(--transition-speed);
        box-shadow: var(--compose-shadow, var(--widget-box-shadow));
        caret-color: var(--input-caret);
      }

      .chatbox {
        --color-widget-border: none;
        --curvature-widget: var(
          --compose-curvature,
          var(--curvature) var(--curvature) 0px 0px
        );
        --textarea-min-height: var(--textarea-min-height, 4em);
        --widget-box-shadow: none;
        padding: var(--compose-padding, 0px);
      }

      .actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0em;
        background: #f9f9f9;
        border-bottom-left-radius: var(--curvature);
        border-bottom-right-radius: var(--curvature);
        border-top: solid 1px var(--color-widget-border);
      }

      .actions-right {
        display: flex;
        align-items: center;
      }

      temba-charcount {
        margin-right: 5px;
        overflow: hidden;
        --temba-charcount-counts-margin-top: 0px;
        --temba-charcount-summary-margin-top: 0px;
        --temba-charcount-summary-position: fixed;
        --temba-charcount-summary-right: 105px;
        --temba-charcount-summary-bottom: 105px;
      }

      temba-button {
        --button-y: 1px;
        --button-x: 12px;
      }

      .send-error {
        color: rgba(250, 0, 0, 0.75);
        font-size: var(--help-text-size);
      }

      .language {
        margin-bottom: 0.6em;
        display: block;
      }

      .top-right {
        align-items: center;
        display: flex;
      }

      #send-button {
        margin: 0.3em;
      }

      temba-tabs {
        --focused-tab-color: #f4f4f4;
      }

      .quick-replies {
        margin: 0.8em;
      }

      .optins {
        padding: 1em;
      }

      .attachments {
      }
    `;
    }
    constructor() {
      super(),
        (this.index = 1),
        (this.maxAttachments = 3),
        (this.maxLength = 640),
        (this.currentText = ''),
        (this.initialText = ''),
        (this.accept = ''),
        (this.endpoint = Rt),
        (this.languages = []),
        (this.currentAttachments = []),
        (this.currentQuickReplies = []),
        (this.currentOptin = []),
        (this.optinEndpoint = '/api/v2/optins.json'),
        (this.buttonName = 'Send'),
        (this.buttonDisabled = !0),
        (this.buttonError = ''),
        (this.langValues = {}),
        (this.currentLanguage = 'und');
    }
    isBaseLanguage() {
      return 'und' == this.currentLanguage || this.currentLanguage == this.languages[0].iso;
    }
    handleTabChanged() {
      const t = this.shadowRoot.querySelector('temba-tabs').getCurrentTab();
      t && t.icon;
    }
    getEventHandlers() {
      return [{ event: Me.ContextChanged, method: this.handleTabChanged }];
    }
    firstUpdated(t) {
      super.firstUpdated(t),
        t.has('languages') &&
          this.languages.length > 0 &&
          (this.currentLanguage = this.languages[0].iso),
        t.has('value') && (this.langValues = this.getDeserializedValue() || {}),
        this.setFocusOnChatbox();
    }
    updated(t) {
      if ((super.updated(t), t.has('currentLanguage') && this.langValues)) {
        let t = { text: '', attachments: [], quick_replies: [] };
        this.currentLanguage in this.langValues && (t = this.langValues[this.currentLanguage]),
          (this.currentText = t.text),
          (this.initialText = t.text),
          (this.currentAttachments = t.attachments),
          (this.currentQuickReplies = (t.quick_replies || []).map(t => ({ name: t, value: t }))),
          (this.currentOptin = t.optin ? [t.optin] : []),
          this.setFocusOnChatbox();
        const e = this.shadowRoot.querySelector('.chatbox');
        e && (e.value = this.initialText),
          this.resetTabs(),
          this.requestUpdate('currentAttachments');
      }
      if (
        (this.langValues &&
          (t.has('currentText') || t.has('currentAttachments') || t.has('currentQuickReplies'))) ||
        t.has('currentOptin')
      ) {
        this.toggleButton();
        const t = this.currentText ? this.currentText.trim() : '';
        t || this.currentAttachments.length > 0 || this.currentQuickReplies.length > 0
          ? (this.langValues[this.currentLanguage] = {
              text: t,
              attachments: this.currentAttachments,
              quick_replies: this.currentQuickReplies.map(t => t.value),
              optin: this.currentOptin.length > 0 ? this.currentOptin[0] : null
            })
          : delete this.langValues[this.currentLanguage],
          this.fireCustomEvent(Me.ContentChanged, this.langValues),
          this.requestUpdate('langValues'),
          this.setValue(this.langValues);
      }
    }
    handleAttachmentsChanged(t) {
      const e = t.target;
      (this.currentAttachments = e.attachments), this.requestUpdate();
    }
    setFocusOnChatbox() {
      if (this.chatbox) {
        const t = this.shadowRoot.querySelector('.chatbox');
        t &&
          window.setTimeout(() => {
            t.focus();
          }, 0);
      }
    }
    reset() {
      (this.shadowRoot.querySelector('.chatbox').value = ''),
        (this.initialText = ''),
        (this.currentText = ''),
        (this.currentQuickReplies = []),
        (this.currentAttachments = []),
        (this.buttonError = '');
    }
    handleQuickReplyChange() {
      this.requestUpdate('currentQuickReplies');
    }
    handleOptInChange(t) {
      (this.currentOptin = t.target.values), this.requestUpdate('optIn');
    }
    handleChatboxChange(t) {
      const e = t.target;
      this.currentText = e.value;
    }
    toggleButton() {
      if (this.button) {
        this.buttonError = '';
        const t = 0 === this.currentText.trim().length,
          e = 0 === this.currentAttachments.length;
        this.chatbox && this.attachments
          ? (this.buttonDisabled = t && e)
          : this.chatbox
          ? (this.buttonDisabled = t)
          : this.attachments
          ? (this.buttonDisabled = e)
          : (this.buttonDisabled = !0);
      }
    }
    handleSendClick(t) {
      t.stopPropagation(), this.handleSend();
    }
    handleSendEnter(t) {
      if (this.button && 'Enter' === t.key && !t.shiftKey)
        if (this.completion) {
          t.target.hasVisibleOptions() || this.handleSend();
        } else this.handleSend();
    }
    handleSend() {
      if (!this.buttonDisabled) {
        this.buttonDisabled = !0;
        const t = this.buttonName;
        this.fireCustomEvent(Me.ButtonClicked, { name: t });
      }
    }
    handleLanguageChange(t) {
      const e = t.target;
      this.currentLanguage = e.values[0].iso;
    }
    resetTabs() {
      this.shadowRoot.querySelector('temba-tabs').index = -1;
    }
    render() {
      return j`
      <temba-field
        name=${this.name}
        .errors=${this.errors}
        .widgetOnly=${this.widgetOnly}
        .value=${this.value}
      >
        ${
          this.languages.length > 1
            ? j`<temba-select
              @change=${this.handleLanguageChange}
              class="language"
              name="language"
              .staticOptions=${this.languages}
              valueKey="iso"
            >
            </temba-select>`
            : null
        }
        <div class="container">
          ${this.chatbox ? j`${this.getChatbox()}` : null}
          <div class="items actions">${this.getActions()}</div>
        </div>
      </temba-field>
    `;
    }
    getChatbox() {
      return this.completion
        ? j`<temba-completion
        class="chatbox"
        .value=${this.initialText}
        gsm
        textarea
        autogrow
        maxlength=${this.maxLength}
        @change=${this.handleChatboxChange}
        @keydown=${this.handleSendEnter}
        placeholder="Write something here"
      >
      </temba-completion>`
        : j`<temba-textinput
        class="chatbox"
        gsm
        textarea
        autogrow
        maxlength=${this.maxLength}
        .value=${this.initialText}
        @change=${this.handleChatboxChange}
        @keydown=${this.handleSendEnter}
        placeholder="Write something here"
      >
      </temba-textinput>`;
    }
    getActions() {
      const t = this.optIns && this.isBaseLanguage();
      return j`
      <temba-tabs
        embedded
        focusedname
        bottom
        refresh="${this.currentAttachments.length}|${this.index}|${
        this.currentQuickReplies.length
      }|${t}|${this.currentOptin}"
      >
        ${
          this.attachments
            ? j`<temba-tab
              name="Attachments"
              icon="attachment"
              .count=${this.currentAttachments.length}
            >
              <div class="items attachments">
                <temba-media-picker
                  accept=${this.accept}
                  max=${this.maxAttachments}
                  attachments=${JSON.stringify(this.currentAttachments)}
                  @change=${this.handleAttachmentsChanged.bind(this)}
                ></temba-media-picker>
              </div>
            </temba-tab>`
            : null
        }
        ${
          this.quickReplies
            ? j`<temba-tab
              name="Quick Replies"
              icon="quick_replies"
              .count=${this.currentQuickReplies.length}
            >
              <temba-select
                @change=${this.handleQuickReplyChange}
                .values=${this.currentQuickReplies}
                class="quick-replies"
                tags
                multi
                searchable
                expressions
                placeholder="Add Quick Reply"
              ></temba-select>
            </temba-tab>`
            : null
        }
        <temba-tab
          name="Opt-in"
          icon="channel_fba"
          ?hidden=${!t}
          ?checked=${this.currentOptin.length > 0}
        >
          <temba-select
            @change=${this.handleOptInChange}
            .values=${this.currentOptin}
            endpoint="${this.optinEndpoint}"
            class="optins"
            searchable
            clearable
            placeholder="Select an opt-in to use for Facebook (optional)"
          ></temba-select>
        </temba-tab>

        <div slot="tab-right" class="top-right">
          ${this.buttonError ? j`<div class="send-error">${this.buttonError}</div>` : null}
          ${this.counter ? this.getCounter() : null}
          ${this.button ? this.getButton() : null}
        </div>
      </temba-tabs>
    `;
    }
    getCounter() {
      return j`<temba-charcount
      .text="${this.currentText}"
    ></temba-charcount>`;
    }
    getButton() {
      return j` <temba-button
      id="send-button"
      name=${this.buttonName}
      @click=${this.handleSendClick}
      ?disabled=${this.buttonDisabled}
    ></temba-button>`;
    }
  }
  t([ge({ type: Number })], _h.prototype, 'index', void 0),
    t([ge({ type: Number })], _h.prototype, 'maxAttachments', void 0),
    t([ge({ type: Number })], _h.prototype, 'maxLength', void 0),
    t([ge({ type: Boolean })], _h.prototype, 'completion', void 0),
    t([ge({ type: Boolean })], _h.prototype, 'chatbox', void 0),
    t([ge({ type: Boolean })], _h.prototype, 'attachments', void 0),
    t([ge({ type: Boolean })], _h.prototype, 'quickReplies', void 0),
    t([ge({ type: Boolean })], _h.prototype, 'optIns', void 0),
    t([ge({ type: Boolean })], _h.prototype, 'counter', void 0),
    t([ge({ type: Boolean })], _h.prototype, 'button', void 0),
    t([ge({ type: String })], _h.prototype, 'currentText', void 0),
    t([ge({ type: String })], _h.prototype, 'initialText', void 0),
    t([ge({ type: String })], _h.prototype, 'accept', void 0),
    t([ge({ type: String, attribute: !1 })], _h.prototype, 'endpoint', void 0),
    t([ge({ type: Boolean, attribute: !1 })], _h.prototype, 'uploading', void 0),
    t([ge({ type: Array })], _h.prototype, 'languages', void 0),
    t([ge({ type: Array })], _h.prototype, 'currentAttachments', void 0),
    t([ge({ type: Array })], _h.prototype, 'currentQuickReplies', void 0),
    t([ge({ type: Array })], _h.prototype, 'currentOptin', void 0),
    t([ge({ type: String })], _h.prototype, 'optinEndpoint', void 0),
    t([ge({ type: String })], _h.prototype, 'buttonName', void 0),
    t([ge({ type: Boolean, attribute: !1 })], _h.prototype, 'buttonDisabled', void 0),
    t([ge({ type: String, attribute: !1 })], _h.prototype, 'buttonError', void 0),
    t([ge({ type: Boolean, attribute: 'widget_only' })], _h.prototype, 'widgetOnly', void 0),
    t([ge({ type: Array })], _h.prototype, 'errors', void 0),
    t([ge({ type: Object })], _h.prototype, 'langValues', void 0),
    t([ge({ type: String })], _h.prototype, 'currentLanguage', void 0);
  class xh extends ue {
    constructor() {
      super(...arguments),
        (this.animationTime = 300),
        (this.show = !1),
        (this.zoom = !1),
        (this.zoomPct = 0.9),
        (this.scale = 1),
        (this.xTrans = '0px'),
        (this.yTrans = '0px');
    }
    static get styles() {
      return r`
      :host {
        position: absolute;
      }

      .mask {
        display: flex;
        opacity: 0;
        background: rgba(0, 0, 0, 0.5);
        position: absolute;
        height: 100svh;
        width: 100svw;
        pointer-events: none;
      }

      .zoom .mask {
        opacity: 1;
        pointer-events: auto;
      }

      .matte {
        position: absolute;
        transform: translate(400, 400) scale(3, 3);
        border-radius: 2%;
        overflow: hidden;
        box-shadow: 0 0 12px 3px rgba(0, 0, 0, 0.15);
      }
    `;
    }
    updated(t) {
      t.has('show') &&
        this.show &&
        window.setTimeout(() => {
          this.zoom = !0;
        }, 0),
        t.has('zoom') &&
          !this.zoom &&
          this.show &&
          window.setTimeout(() => {
            this.show = !1;
          }, this.animationTime);
    }
    showElement(t) {
      const e = t.getBoundingClientRect();
      (this.ele = t.cloneNode()),
        (this.left = e.left),
        (this.top = e.top),
        (this.width = e.width),
        (this.height = e.height),
        (this.xTrans = '0px'),
        (this.yTrans = '0px'),
        (this.scale = 1);
      let i = this.width,
        o = this.height,
        n = this.scale;
      const s = window.innerHeight * this.zoomPct,
        r = window.innerWidth * this.zoomPct;
      this.width * (s / this.height) < r
        ? ((o = window.innerHeight * this.zoomPct), (n = o / this.height), (i = this.width * n))
        : ((i = window.innerWidth * this.zoomPct), (n = i / this.width), (o = this.height * n));
      const a = (i - this.width) / 2,
        l = (window.innerWidth - i) / 2;
      this.xTrans = l - this.left + a + 'px';
      const h = (o - this.height) / 2,
        c = (window.innerHeight - o) / 2;
      (this.yTrans = c - this.top + h + 'px'), (this.scale = n), (this.show = !0);
    }
    handleClick() {
      this.zoom = !1;
    }
    render() {
      const t = {
        transition: `transform ${this.animationTime}ms ease, box-shadow ${this.animationTime}ms ease`
      };
      return (
        this.show &&
          ((t.left = this.left + 'px'),
          (t.top = this.top + 'px'),
          (t.width = this.width + 'px'),
          (t.height = this.height + 'px')),
        this.zoom &&
          (t.transform = `translate(${this.xTrans}, ${this.yTrans}) scale(${this.scale}, ${this.scale})`),
        j`
      <div
        class=${Ht({ container: !0, show: this.show, zoom: this.zoom })}
        @click=${this.handleClick}
      >
        <div
          class=${Ht({ mask: !0 })}
          style="transition: all ${this.animationTime}ms; ease"
        ></div>
        <div class=${Ht({ matte: !0 })} style=${Se(t)}>
          ${this.show ? this.ele : null}
        </div>
      </div>
    `
      );
    }
  }
  t([ge({ type: Number })], xh.prototype, 'animationTime', void 0),
    t([ge({ type: Boolean })], xh.prototype, 'show', void 0),
    t([ge({ type: Boolean })], xh.prototype, 'zoom', void 0),
    t([ge({ type: Number })], xh.prototype, 'zoomPct', void 0);
  class wh extends fe {
    constructor() {
      super(...arguments),
        (this.expanded = !1),
        (this.previewColor = '#ffffff'),
        (this.labelColor = '#ffffffee'),
        (this.selecting = !1),
        (this.saturation = 100),
        (this.lightness = 50),
        (this.hex = '');
    }
    static get styles() {
      return r`
      :host {
        color: var(--color-text);
        display: inline-block;
        --curvature: 0.55em;
        width: 100%;

        --temba-textinput-padding: 0.4em;
      }

      temba-textinput {
        margin-left: 0.3em;
        width: 5em;
      }

      temba-field {
        display: block;
        width: 100%;
      }

      .wrapper {
        border: 1px solid var(--color-widget-border);
        padding: calc(var(--curvature) / 2);
        border-radius: calc(var(--curvature) * 1.5);
        transition: all calc(var(--transition-speed) * 2) var(--bounce);

        display: flex;
        flex-grow: 0;
      }

      .picker-wrapper {
        display: flex;
        flex-direction: row;
        align-items: stretch;
        transition: all calc(var(--transition-speed) * 2) var(--bounce);
        flex-grow: 0;
      }

      .preview {
        width: initial;
        border-radius: var(--curvature);
        padding: 0.2em 0.5em;
        font-weight: 400;
        border: 2px solid rgba(0, 0, 0, 0.1);
        white-space: nowrap;
        cursor: pointer;
        transition: transform calc(var(--transition-speed) * 0.5) var(--bounce);
      }

      .preview.selecting {
        transform: scale(1.05);
      }

      .wrapper.expanded {
        flex-grow: 1 !important;
      }

      .wrapper.expanded .picker-wrapper {
        flex-grow: 1 !important;
      }

      .wrapper.expanded .preview {
        pointer-events: none;
      }

      .wrapper.expanded .color-picker {
        margin-left: calc(var(--curvature) / 2);
      }

      .wrapper.expanded temba-textinput {
        display: block;
      }

      .color-picker {
        border-radius: var(--curvature);
        cursor: pointer;
        transition: all calc(var(--transition-speed) * 2) var(--bounce);
        flex-grow: 1;
        position: relative;
        width: 100%;
        height: 100%;
        background-image: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0) 60%,
            rgba(0, 0, 0, 0.5) 90%,
            rgba(0, 0, 0, 1)
          ),
          linear-gradient(
            to top,
            rgba(255, 255, 255, 0) 60%,
            rgba(255, 255, 255, 0.8) 90%,
            rgba(255, 255, 255, 1)
          ),
          linear-gradient(
            to right,
            hsla(0, 100%, 50%, 1),
            hsla(60, 100%, 50%, 1),
            hsla(120, 100%, 50%, 1),
            hsla(180, 100%, 50%, 1),
            hsla(240, 100%, 50%, 1),
            hsla(300, 100%, 50%, 1),
            hsla(360, 100%, 50%, 1)
          );
        mix-blend-mode: multiply;
      }

      .color-picker:focus {
        outline: none;
      }
    `;
    }
    firstUpdated(t) {
      super.firstUpdated(t);
    }
    updated(t) {
      super.updated(t),
        t.has('value') && ((this.previewColor = this.value || '#9c9c9c'), (this.hex = this.value)),
        t.has('selecting') &&
          this.selecting &&
          window.setTimeout(() => {
            this.selecting = !1;
          }, 100),
        t.has('previewLabel') &&
          this.hue &&
          (this.hex = he(this.hue, this.saturation, this.lightness));
    }
    handleBlur() {
      this.expanded && (this.expanded = !1);
    }
    handleMouseOut() {
      (this.previewColor = this.value), (this.hex = this.value);
    }
    handleMouseMove(t) {
      if (this.expanded) {
        const e = t.target.getBoundingClientRect(),
          i = t.clientX - e.left,
          o = t.clientY - e.top;
        (this.hue = (i / e.width) * 360),
          (this.lightness = 100 - (o / e.height) * 100),
          (this.previewColor = `hsla(${this.hue}, ${this.saturation}%, ${this.lightness}%, 1)`),
          (this.hex = he(this.hue, this.saturation, this.lightness));
      }
    }
    handlePreviewClick() {
      (this.expanded = !this.expanded),
        (this.selecting = !0),
        this.shadowRoot.querySelector('.color-picker').focus();
    }
    handleColorClick(t) {
      if (this.expanded) {
        const e = t.target.getBoundingClientRect(),
          i = t.clientX - e.left,
          o = t.clientY - e.top;
        (this.hue = (i / e.width) * 360),
          (this.lightness = 100 - (o / e.height) * 100),
          (this.previewColor = `hsla(${this.hue}, ${this.saturation}%, ${this.lightness}%, 1)`),
          (this.value = this.hex),
          (this.selecting = !0),
          (this.expanded = !1);
      }
      this.expanded;
    }
    handleHexInput(t) {
      const e = t.target.value;
      e.startsWith('#') && ((this.previewColor = e), (this.value = e));
    }
    serializeValue(t) {
      return t;
    }
    render() {
      return j`
      <temba-field
        name=${this.name}
        .helpText=${this.helpText}
        .errors=${this.errors}
        .widgetOnly=${this.widgetOnly}
        .hideLabel=${this.hideLabel}
        .disabled=${this.disabled}
      >
        <div style="display:flex" tabindex="0">
          <div class=${Ht({ wrapper: !0, expanded: this.expanded })}>
            <div class=${Ht({ 'picker-wrapper': !0 })}>
              <div
                class=${Ht({ preview: !0, selecting: this.selecting })}
                style="color:${this.labelColor};background:${this.previewColor}"
                @click=${this.handlePreviewClick}
              >
                ${this.label}
              </div>
              <div
                class="color-picker"
                tabindex="0"
                @blur=${this.handleBlur}
                @mousemove=${this.handleMouseMove}
                @mouseout=${this.handleMouseOut}
                @click=${this.handleColorClick}
              ></div>
            </div>
            <temba-textinput
              value=${this.hex}
              @input=${this.handleHexInput}
              placeholder="#000000"
            ></temba-textinput>
          </div>
        </div>
      </temba-field>
    `;
    }
  }
  t([ge({ type: Boolean })], wh.prototype, 'expanded', void 0),
    t([ge({ type: String })], wh.prototype, 'previewColor', void 0),
    t([ge({ type: String })], wh.prototype, 'labelColor', void 0),
    t([ge({ type: Boolean })], wh.prototype, 'selecting', void 0),
    t([ge({ type: Number })], wh.prototype, 'hue', void 0),
    t([ge({ type: Number })], wh.prototype, 'saturation', void 0),
    t([ge({ type: Number })], wh.prototype, 'lightness', void 0),
    t([ge({ type: String })], wh.prototype, 'hex', void 0);
  class kh extends Ya {
    constructor() {
      super(),
        (this.minWidth = 200),
        (this.maxWidth = 2e3),
        (this.resizing = !1),
        (this.startResize = this.startResize.bind(this)),
        (this.resize = this.resize.bind(this)),
        (this.stopResize = this.stopResize.bind(this));
    }
    updated(t) {
      super.updated(t),
        t.has('currentWidth') && this.style.setProperty('--box-width', `${this.currentWidth}px`);
    }
    setWidth(t) {
      const e = Math.min(Math.max(t, this.minWidth), this.maxWidth);
      this.currentWidth = e;
    }
    startResize(t) {
      (this.initialX = t.x),
        (this.boxWidth = this.offsetWidth),
        (document.body.style.userSelect = 'none'),
        (this.resizing = !0),
        window.addEventListener('mousemove', this.resize),
        window.addEventListener('mouseup', this.stopResize),
        this.requestUpdate();
    }
    resize(t) {
      const e = t.x - this.initialX;
      this.setWidth(this.boxWidth + e);
    }
    stopResize() {
      (document.body.style.userSelect = 'initial'),
        window.removeEventListener('mousemove', this.resize),
        window.removeEventListener('mouseup', this.stopResize),
        this.requestUpdate(),
        (this.resizing = !1),
        this.fireCustomEvent(Me.Resized, { width: this.currentWidth });
    }
    render() {
      return j`
      <div
        class=${Ht({ resizer: !0, resizing: this.resizing })}
        @mousedown="${this.startResize}"
      >
        <div class=${Ht({ 'resizer-handle': !0 })}></div>
      </div>
      <slot></slot>
    `;
    }
  }
  (kh.styles = r`
    :host {
      display: block;
      position: relative;
      width: var(--box-width, 200px);
      --resizer-handle-size: 15px;
    }

    .resizer {
      position: absolute;
      right: calc(var(--resizer-handle-size) * -1);
      height: 100%;
      cursor: col-resize;
      padding: 0 calc(var(--resizer-handle-size) / 2);
      z-index: 1;
    }

    .resizer-handle {
      position: relative;
      width: 4px;
      background: rgba(0, 0, 0, 0);
      height: 100%;
    }

    .resizer:hover .resizer-handle {
      background: rgba(0, 0, 0, 0.05);
      width: 3px;
      margin-right: -1px;
    }

    .resizing .resizer-handle {
      background: rgba(0, 0, 0, 0.1) !important;
      width: 3px;
      margin-right: -1px;
    }

    slot {
      margin-right: var(--resizer-handle-size);
      background: red;
    }
  `),
    t([ge({ type: Number })], kh.prototype, 'minWidth', void 0),
    t([ge({ type: Number })], kh.prototype, 'maxWidth', void 0),
    t([ge({ type: Boolean })], kh.prototype, 'resizing', void 0),
    t([ge({ type: Number })], kh.prototype, 'currentWidth', void 0);
  class Ah extends ue {
    constructor() {
      super(...arguments), (this.zoom = !0), (this.zooming = !1);
    }
    static get styles() {
      return r`
      :host {
        display: inline;
      }

      .zooming.wrapper {
        padding: 0 !important;
        border-radius: 0;
      }

      .zooming .thumb {
        border-radius: 0;
      }

      .wrapper {
        padding: var(--thumb-padding, 0.4em);
        background: #fff;
        border-radius: var(--curvature);
        box-shadow: var(--widget-box-shadow);
      }

      .thumb {
      }
    `;
    }
    handleClick() {
      window.setTimeout(() => {
        document.querySelector('temba-lightbox').showElement(this);
      }, 0);
    }
    render() {
      if (this.zooming) {
        const t = {
          backgroundColor: '#fafafa',
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          maxHeight: 'var(--thumb-size, 4em)',
          height: 'var(--thumb-size, 4em)',
          width: 'var(--thumb-size, 4em)',
          borderRadius: '0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '400',
          color: '#bbb'
        };
        return (
          this.url && (t.backgroundImage = `url(${this.url})`),
          j`
        <div
          class="${Ht({ wrapper: !0 })}"
          style=${Se({
            background: 'red',
            borderRadius: '0',
            boxShadow: 'var(--widget-box-shadow)'
          })}
        >
          <div class="thumb" style=${Se(t)}>${this.label}</div>
        </div>
      `
        );
      }
      {
        const t = {
          backgroundColor: '#fafafa',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          maxHeight: 'var(--thumb-size, 4em)',
          height: 'var(--thumb-size, 4em)',
          width: 'var(--thumb-size, 4em)',
          borderRadius: 'var(--curvature)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '400',
          color: '#bbb'
        };
        return (
          this.url && (t.backgroundImage = `url(${this.url})`),
          j`
      <div class="${Ht({ wrapper: !0 })}" style=${Se({
            padding: 'var(--thumb-padding, 0.4em)',
            background: '#fff',
            borderRadius: 'var(--curvature)',
            boxShadow: 'var(--widget-box-shadow)'
          })}">
          <div class="thumb" style=${Se(t)}>
            ${this.label}
          </div>
      </div>
    `
        );
      }
    }
  }
  t([ge({ type: String })], Ah.prototype, 'url', void 0),
    t([ge({ type: String })], Ah.prototype, 'label', void 0),
    t([ge({ type: Boolean })], Ah.prototype, 'zoom', void 0),
    t([ge({ type: Boolean })], Ah.prototype, 'zooming', void 0);
  const Ch =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAfQAAAH0CAYAAADL1t+KAAAABGdBTUEAALGOfPtRkwAAACBjSFJNAACHDwAAjA8AAP1SAACBQAAAfXkAAOmLAAA85QAAGcxzPIV3AAAKL2lDQ1BJQ0MgUHJvZmlsZQAASMedlndUVNcWh8+9d3qhzTDSGXqTLjCA9C4gHQRRGGYGGMoAwwxNbIioQEQREQFFkKCAAaOhSKyIYiEoqGAPSBBQYjCKqKhkRtZKfHl57+Xl98e939pn73P32XuftS4AJE8fLi8FlgIgmSfgB3o401eFR9Cx/QAGeIABpgAwWempvkHuwUAkLzcXerrICfyL3gwBSPy+ZejpT6eD/0/SrFS+AADIX8TmbE46S8T5Ik7KFKSK7TMipsYkihlGiZkvSlDEcmKOW+Sln30W2VHM7GQeW8TinFPZyWwx94h4e4aQI2LER8QFGVxOpohvi1gzSZjMFfFbcWwyh5kOAIoktgs4rHgRm4iYxA8OdBHxcgBwpLgvOOYLFnCyBOJDuaSkZvO5cfECui5Lj25qbc2ge3IykzgCgaE/k5XI5LPpLinJqUxeNgCLZ/4sGXFt6aIiW5paW1oamhmZflGo/7r4NyXu7SK9CvjcM4jW94ftr/xS6gBgzIpqs+sPW8x+ADq2AiB3/w+b5iEAJEV9a7/xxXlo4nmJFwhSbYyNMzMzjbgclpG4oL/rfzr8DX3xPSPxdr+Xh+7KiWUKkwR0cd1YKUkpQj49PZXJ4tAN/zzE/zjwr/NYGsiJ5fA5PFFEqGjKuLw4Ubt5bK6Am8Kjc3n/qYn/MOxPWpxrkSj1nwA1yghI3aAC5Oc+gKIQARJ5UNz13/vmgw8F4psXpjqxOPefBf37rnCJ+JHOjfsc5xIYTGcJ+RmLa+JrCdCAACQBFcgDFaABdIEhMANWwBY4AjewAviBYBAO1gIWiAfJgA8yQS7YDApAEdgF9oJKUAPqQSNoASdABzgNLoDL4Dq4Ce6AB2AEjIPnYAa8AfMQBGEhMkSB5CFVSAsygMwgBmQPuUE+UCAUDkVDcRAPEkK50BaoCCqFKqFaqBH6FjoFXYCuQgPQPWgUmoJ+hd7DCEyCqbAyrA0bwwzYCfaGg+E1cBycBufA+fBOuAKug4/B7fAF+Dp8Bx6Bn8OzCECICA1RQwwRBuKC+CERSCzCRzYghUg5Uoe0IF1IL3ILGUGmkXcoDIqCoqMMUbYoT1QIioVKQ21AFaMqUUdR7age1C3UKGoG9QlNRiuhDdA2aC/0KnQcOhNdgC5HN6Db0JfQd9Dj6DcYDIaG0cFYYTwx4ZgEzDpMMeYAphVzHjOAGcPMYrFYeawB1g7rh2ViBdgC7H7sMew57CB2HPsWR8Sp4sxw7rgIHA+XhyvHNeHO4gZxE7h5vBReC2+D98Oz8dn4Enw9vgt/Az+OnydIE3QIdoRgQgJhM6GC0EK4RHhIeEUkEtWJ1sQAIpe4iVhBPE68QhwlviPJkPRJLqRIkpC0k3SEdJ50j/SKTCZrkx3JEWQBeSe5kXyR/Jj8VoIiYSThJcGW2ChRJdEuMSjxQhIvqSXpJLlWMkeyXPKk5A3JaSm8lLaUixRTaoNUldQpqWGpWWmKtKm0n3SydLF0k/RV6UkZrIy2jJsMWyZf5rDMRZkxCkLRoLhQWJQtlHrKJco4FUPVoXpRE6hF1G+o/dQZWRnZZbKhslmyVbJnZEdoCE2b5kVLopXQTtCGaO+XKC9xWsJZsmNJy5LBJXNyinKOchy5QrlWuTty7+Xp8m7yifK75TvkHymgFPQVAhQyFQ4qXFKYVqQq2iqyFAsVTyjeV4KV9JUCldYpHVbqU5pVVlH2UE5V3q98UXlahabiqJKgUqZyVmVKlaJqr8pVLVM9p/qMLkt3oifRK+g99Bk1JTVPNaFarVq/2ry6jnqIep56q/ojDYIGQyNWo0yjW2NGU1XTVzNXs1nzvhZei6EVr7VPq1drTltHO0x7m3aH9qSOnI6XTo5Os85DXbKug26abp3ubT2MHkMvUe+A3k19WN9CP16/Sv+GAWxgacA1OGAwsBS91Hopb2nd0mFDkqGTYYZhs+GoEc3IxyjPqMPohbGmcYTxbuNe408mFiZJJvUmD0xlTFeY5pl2mf5qpm/GMqsyu21ONnc332jeaf5ymcEyzrKDy+5aUCx8LbZZdFt8tLSy5Fu2WE5ZaVpFW1VbDTOoDH9GMeOKNdra2Xqj9WnrdzaWNgKbEza/2BraJto22U4u11nOWV6/fMxO3Y5pV2s3Yk+3j7Y/ZD/ioObAdKhzeOKo4ch2bHCccNJzSnA65vTC2cSZ79zmPOdi47Le5bwr4urhWuja7ybjFuJW6fbYXd09zr3ZfcbDwmOdx3lPtKe3527PYS9lL5ZXo9fMCqsV61f0eJO8g7wrvZ/46Pvwfbp8Yd8Vvnt8H67UWslb2eEH/Lz89vg98tfxT/P/PgAT4B9QFfA00DQwN7A3iBIUFdQU9CbYObgk+EGIbogwpDtUMjQytDF0Lsw1rDRsZJXxqvWrrocrhHPDOyOwEaERDRGzq91W7109HmkRWRA5tEZnTdaaq2sV1iatPRMlGcWMOhmNjg6Lbor+wPRj1jFnY7xiqmNmWC6sfaznbEd2GXuKY8cp5UzE2sWWxk7G2cXtiZuKd4gvj5/munAruS8TPBNqEuYS/RKPJC4khSW1JuOSo5NP8WR4ibyeFJWUrJSBVIPUgtSRNJu0vWkzfG9+QzqUvia9U0AV/Uz1CXWFW4WjGfYZVRlvM0MzT2ZJZ/Gy+rL1s3dkT+S453y9DrWOta47Vy13c+7oeqf1tRugDTEbujdqbMzfOL7JY9PRzYTNiZt/yDPJK817vSVsS1e+cv6m/LGtHlubCyQK+AXD22y31WxHbedu799hvmP/jk+F7MJrRSZF5UUfilnF174y/ariq4WdsTv7SyxLDu7C7OLtGtrtsPtoqXRpTunYHt897WX0ssKy13uj9l4tX1Zes4+wT7hvpMKnonO/5v5d+z9UxlfeqXKuaq1Wqt5RPXeAfWDwoOPBlhrlmqKa94e4h+7WetS212nXlR/GHM44/LQ+tL73a8bXjQ0KDUUNH4/wjowcDTza02jV2Nik1FTSDDcLm6eORR67+Y3rN50thi21rbTWouPguPD4s2+jvx064X2i+yTjZMt3Wt9Vt1HaCtuh9uz2mY74jpHO8M6BUytOdXfZdrV9b/T9kdNqp6vOyJ4pOUs4m3924VzOudnzqeenL8RdGOuO6n5wcdXF2z0BPf2XvC9duex++WKvU++5K3ZXTl+1uXrqGuNax3XL6+19Fn1tP1j80NZv2d9+w+pG503rm10DywfODjoMXrjleuvyba/b1++svDMwFDJ0dzhyeOQu++7kvaR7L+9n3J9/sOkh+mHhI6lH5Y+VHtf9qPdj64jlyJlR19G+J0FPHoyxxp7/lP7Th/H8p+Sn5ROqE42TZpOnp9ynbj5b/Wz8eerz+emCn6V/rn6h++K7Xxx/6ZtZNTP+kv9y4dfiV/Kvjrxe9rp71n/28ZvkN/NzhW/l3x59x3jX+z7s/cR85gfsh4qPeh+7Pnl/eriQvLDwG/eE8/s3BCkeAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAIXRFWHRDcmVhdGlvbiBUaW1lADIwMjI6MDg6MTEgMDE6MjY6MTB2N148AAAbLUlEQVR4Xu3dC7RddX3g8f8lLyCQlBAeAgJxWlbAKlMWrUCV1IoOaHFcUysya8YWZkpBIgW0dRzn6VotzlTBKWkt2EGWUx8I+EB5g0OqlqACgyhPTQLm/SIJeT/und//nJ14k9wk996cc+/Z//P5rPVb+5GFJhHzzX+fvffp6evrSwxsxqx5Y2NzYszrYk6OmRZzbMzUfjMpZny/GRfTEwPA3uX4bI3ZErOp2q6LWdFvlsTMi5kfMzfm5dkzp22LLQMQ9ErEe0ps3hRzeswbYn49ZnpMjjQAoy9H/7mYn8Q8HfNUzGMR+VWx7XpdG/QIeF5pnxfzlpg3x5waY2UNUC85Ys/GfC/muzEPReDzyr7rdE3QI+AHxeasmAtizo85IyafA6AcvTFPxNwXc2/MnAh8Ple8ooMeEc8r7nwZ/aKYP4g5PgaA7rEw5vaY22Ly5flio1dk0CPkJ8Tm0pg/isk3sgHAvJhbY26JsC9onClIMUGvLqnny+mXxbwzJt+hDgC7y3fK3xNzU8y9pazaax/0CPnBsflAzDUx+a50ABisfNf8DTFfiLDnx+dqq7ZBj5BPjM2VMdfGHJPPAcAwLY25PmZWhH1D40zN1C7o1Yo8X1b/WEx+9AwAWiU/8nZdzM11W7HXJugR8nzH+r+N+YuYfNMbALRLvmnu4zH/py6fsdci6BHz/Pz4Z2LyI2gAMFLmxFwdUX+sedi5OjroEfL8OtZPxeTHz7zFDYDRkEOZH3f7SIS9Y18z27FBj5i/LzZ/HeOGNwA6Qb5x7qqI+lebh52l44IeIc8Bvznm3Y0TANBZ7oq5LMKeA98xOiroEfP8QphbYqzKAehkOeaXRNTz++I7QkcEPUKeH0X7q5j8XLnPygGogxzQG2M+GmEf9UfcRj3oEfOTYnNHzJmNEwBQLz+KeW9E/aXm4egY1a8PjZi/IzaPx4g5AHWVG/Z41bRRM2pBj1/4h2OTX45/ZOMEANRXbtk9VdtGxYhfco9fbP4WtPw42hWNEwBQls/G5Mfb8re6jZgRDXrE/LDYfCXmXY0TAFCmu2PeH1Ff1zxsvxELesT8iNjk2/u9vhWAbpBfF3tBRP2V5mF7jUjQI+ZHx+aBmNMbJwCgOzwV846I+rLmYfu0PegR8+Nj81DM9MYJAOguz8WcF1Ff2Dxsj7YGvVqZz44RcwC6WY76jHau1Nv22Fr1mXm+zC7mAHS73MIHqja2RVuCHj/hfDd7vgHOZ+YA0JSbeG/VyJZredDjJzomNvnRNHezA8Cuchu/XLWypdqxQs8vqvecOQAM7Pdi8gvWWqqlQY+/ceRX3nkDHADs2werZrZMy+5yj5/Y22OTPzdv+WUEACjQ9pj84pkHm4cHpiVBj5ifHJv89XG+aAUABm9lzJkR9fnNw+E74EvuEfNDYnNnjJgDwNDkdt5ZtfSAtOIz9E/FnNHcBQCGKDf0r5q7w3dAl9zjbxT5Tr27YnoaJwCA4cgxvnD2zGn5W9qGZdhBj5gfG5v80vn8elcA4MDk18K+MaK+tHk4NAdyyf3mGDEHgNbITf1cc3fohhX0WJ2/PzYXNo8AgBa5sGrskA35knv8F+U78p6JsToHgNbLl95Pmz1zWn6kbdCGs0L/dIyYA0B75Mbm1g7JkFbosTo/Kzb/FOOudgBonxznc2KVPqd5uH+DDnrEPEc8/wf/VuMEANBOP4g5K6I+qFAP5ZL7v4kRcwAYGbm5ub2DMqgVeqzOD47NizEnNE4AACNhQcyvxSp9U/Nw7wa7Qv+TGDEHgJGV25sbvF/7XaHH6nxibH4ec0zjBAAwkvKb4/5ZrNLXNw8HNpgV+pUxYg4AoyM3OLd4n/a5Qq8+O58Xk9/bDgCMjiUx0/b1Wfr+Vuj57joxB4DRlVu8zzve97pCr547/2nMqY0TAMBoejbm9Xt7Ln1fK/R3xog5AHSG3OTc5gHtK+iXV1sAoDPstc0DXnKfMWtefu5tfsyYxgkAoBNsjzl59sxp+YUzu9jbCv3SGDEHgM6S23xJc3dXe6zQq5vh5sac3DgBAHSSfAX9dbvfHDfQCj1/RaqYA0Bnyo3Ord7FQEG/qNoCAJ3pfdV2p10uuc+YNS8H/uWY4xsnAIBOtDDmxNkzp/U2D/dcoZ8dI+YA0Nlyq3Ozd9o96BdUWwCgs+3SbEEHgHrapdk7P0OfMWtefvH7onyucQIA6GQ54MfNnjktfxPbLiv0t8eIOQDUQ252bndD/6C/udoCAPWws939g/7b1RYAqIed7W58hj5j1rwjYn9FzO43yQEAnSs/hz519sxpr+wIeH6FnJgDQL3kdjdeA7sj4qdXWwCgXhoN3xH0N1ZbAKBeGg0XdACot0bDe869ce742K6PGZtPAAC1sjXmsLxCPzFGzAGgnsbFnJiDPq1xCADU1ck56Cc39wGAmppmhQ4A9ddYoR/T3AcAaurYHPSpzX0AoKaOzEE/srkPANTUVCt0AKi/xgp9UnMfAKipSTno+U1xAEB9TchBn9DcBwBqarwVOgDUX2OFnt8BCwDU17gc9J7mPgBQUz056ABAzQk6ABRA0AGgAIIOAAUQdAAogKADQAEEHQAKIOgAUABBB4ACCDoAFEDQAaAAgg4ABRB0ACiAoANAAQQdAAog6ABQAEEHgAIIOgAUQNABoACCDgAFEHQAKICgA0ABBB0ACiDoAFAAQQeAAgg6ABRA0AGgAIIOAAUQdAAogKADQAEEHQAKIOgAUABBB4ACCDoAFEDQAaAAgg4ABRB0ACiAoANAAQQdAAog6ABQAEEHgAIIOgAUQNABoACCDgAFEHQAKICgA0ABBB0ACiDoAFAAQQeAAgg6ABRA0AGgAIIOAAUQdAAogKADQAEEHQAKIOgAUABBB4ACCDoAFEDQAaAAgg4ABRB0AChAz7k3zu2r9mGffuWQMemUoyek4yaNTYeMOygd1FP9AHSZ7b19ad2W3rRg9bb0/LLNaePW3upHYPQIOvs0YexB6YJTD4s5PE0/enx1Fthhe7T8iYUb07d/+mqa/fMNqa/PH6mMDkFnr952ymHpyt+eko6cOKY6A+zL3JVb0/WzV6SnF22qzsDIEXT2MG5MT/rIW6em86cfVp0BBqs3/kT9+zmvpC8+vro6AyPDTXHsIsf8k793rJjDMOV7Sy47+4j0obccWZ2BkSHo7OKjbzsqnfnag6sjYLjee/qkdNFvTK6OoP0EnZ3On354evspE6sj4ED9ydlT0ilHTaiOoL0EnYZDxx+UPvjmKdUR0Apj4k/Yq2e49M7IEHQaLnz94Wnywf51gFZ7/bET0hknHFIdQfv4E5yGd512eLUHtNo7/f+LESDopNdMGpdOOmJcdQS02lknHZJ6erxakfYSdNL0Y9y0A+10+ISD0vGTx1ZH0B6CTuPd7EB7HTfJVTDaS9BJE8f71wDa7dDxLrnTXv4kx7emwQgY4zN02kzQAaAAgg4ABRB0ACiAoANAAQQdAAog6ABQAEEHgAIIOgAUQNABoACCDgAFEHQAKICgA0ABes69cW5ftU+XuvycKeniMyZXR0A7fOL+5enhF9dVR790xgmHpD8++4jq6Jc2be1Ly9ZtS88u3Zwee2ljWrx2a/UjMDArdIBRNOngg9Jpx0zYY8444eB0/vTD0jUzjkxf+cAJ6Yb3vCa94biDq38K9iToADWQAz/rX70mXfs7U9P4Mb6KlT0JOkCN/MtfPzxdH6v1ieP98c2u/BsBUDNveM2E9JfvOiaNPchKnV8SdIAa+ufHH5wuedOeN9PRvQQdoKbe/xuT0/GTx1VHdDtBB6ipsfEnuEdO2UHQAWrsd3/tsDTWXe8EQQeosYnjexrPrYOgA9Tc644cX+3RzQQdoOamHDqm2qObCTpAzY3zGTpB0AGgAIIOAAUQdAAogKADQAEEHQAKIOgAUABBB4ACCDoAFEDQAaAAgg4ABRB0ACiAoANAAQQdAAog6ABQAEEHKNSxk8alOy45cY/56h++Nn3uouPTR946Nf3miYeknh5fv1oCQQcoVP6a9KMmjtljjjl8bDrlqPHpwtcfnj717mPT3190XDr1mAnVP0VdCTpAl/vVqePT3/z+cem8Uw6rzlBHgg5AGhM1+Pjbj0q/ddKh1RnqRtABaDioJ6WPvW1qmjheGurI/2oA7DTl0DHp90+fVB1RJ4IOwC7+xfTDqz3qRNAB2MUJk8emIyeOrY6oC0EHYA/50TbqRdAB2MP4/BA7tSLoAFAAQQeAAgg6ABRA0AGgAIIOAAUQdAAogKADQAEEHQAKIOgAUABBB4ACCDoAFEDQAaAAgg4ABRB0ACiAoANAAQQdAAog6ABQAEEHgAIIOgAUQNABoACCDgAFEHQAKICgA0ABBB0ACiDoAFAAQQeAAgg6ABRA0AGgAIIOAAUQdAAogKADQAEEHQAKIOgAUABBB4ACCDoAFEDQAaAAgg4ABRB0ACiAoANAAQQdAAog6ABQAEEHgAIIOgAUQNABoACCDgAFEHQAKICgA0ABBB0ACiDoAFAAQQeAAgg6ABRA0AGgAIIOAAUQdAAogKADQAEEHQAKIOgAUABBB4ACCDoAFEDQAaAAgg4ABRB0ACiAoANAAQQdAAog6ABQAEEHgAIIOgAUQNABoACCDgAFEHQAKICgA0ABBB0ACiDoAFAAQQeAAgg6ABRA0AGgAIIOAAUQdAAogKADQAEEHYA9bNneV+1RF4IOwB6WrN1a7VEXgg7ALhas2ZZWbdheHVEXgg7ALu5/7tVqjzoRdAB2emVjb7rzqbXVEXUi6AA09Pal9MmHl6f1W3qrM9SJoAOQtkfDr3toeZozf0N1hroRdIAu97MVW9KVdy5KDzy/rjpDHQk6QKHyo+T5bvXdZ8X67enFiPjdz6xLf/atpenf37YoPbt0c/VPUVc9594419sDutzl50xJF58xuToC2uET9y9PD7+45wr4d351Yvrv5x9dHQ3Pl55Yk276p1XVEd3KCh0ACiDoAFAAQQeAAgg6ABRA0AGgAIIOAAUQdAAogKADQAEEHQAKIOgAUABBB4ACCDoAFEDQAaAAgg4ABRB0gJrbmr/4nK4n6AA1t2rD9mqPbiboADU3d+WWao9uJugANbZ+S196Zunm6ohuJugANfadF9elbT5DJwg6QE1t603py0+sqY7odoIOUFNfenx1Wrhma3VEtxN0gBp6cuGmdOsPV1dHIOgAtfP04s3p43cvTdt7fXbOLwk6QI188yevpmu/sTit39JbnYEmQQeogScWbEozv7Y4Xf/IirTFXe0MQNABRtHaTb2N58h3nxzw+55bl26YvTK9/wsL0jWxKn960abqn4I99Zx741x/1etyl58zJV18xuTqCGiHT9y/PD384rrqCFrPCh0ACiDoAFAAQQeAAgg6ABRA0AGgAIIOAAUQdAAogKADQAEEHQAKIOgAUABBB4ACCDoAFEDQAUbA9j7fg0V7CTrACNiwRdBpL0EHGAGL1m6t9qA9BB2gzV7d3JsWrtlWHUF7CDpAm815aWPq8xk6bSboAG12zzOvVnvQPoIO0EY/XbI5PbFgY3UE7SPoAG2yvTelz8xeWR1Bewk6QJvc9Oiq9MLyzdURtJegA7TBHU+tTbc9uaY6gvYTdIAW6u1L6eZHX0k3fteldkaWoAO0yNyVW9NVX1+cvvj46uoMjBxBBzgA+ca3H/5iY/qv9y1Ll35lYXp60abqR2Bk9Zx741xvO+hyl58zJV18xuTqqJ4e+dn69MLyLdURtNf23r60bktvWrB6W3p+2ea0cWtUHUaZoFP7oN/6w9Xp1h+s9iYuoKu55E5t5Uudn3x4Rfr8Y6+IOdD1BJ1a2rC1L/35t5ake5/1Sk2ATNCpneXrt6eZdy5KP/qF12kC7CDo1Ep+LOiK2xeln69wAxxAf4JObTy+YFO6Mlbmy9f5XmmA3Qk6tXDfc+vSn9+1JG3Y4vEggIEIOh3vCz9a3bibfVt+pyYAAxJ0Otb26Pf//M6K9L/neCwNYH8EnY60cWtf+g/fXprufsZjaQCDIeh0nJXrt6cPfW1x+sFLG6ozAOyPoNNR5q/amq64Y1F6cfnm6gwAgyHodIwnFzYfS1v6qsfSAIZK0OkIDz6/Pn3kriVp3WaPpQEMh6Az6v7h8TXpLx5anrbl29oBGBZBZ9Tkfn/6kZXpc4+u8lgawAESdEZFfizt43cvTXf9ZG11BoADIeiMuFUbtqervr44PTrfY2kArSLojKiXXsmPpS1OLyzzWBpAKwk6I+apRZvSlRHzJWu3VmcAaBVBZ0R858X16cPfXJJe3by9OgNAKwk6bffFx9ekTzywPG31WBpA2wg6bZO/7fT6R1ammz2WBtB2gk5bbNrWl/7TPcvSNz2WBjAiBJ2WW72xN1399cXp+/PWV2cAaDdBp6V+sbr5bWnPLvVYGsBIEnRa5unFm9MH71icFq3xWBrASBN0WuKRn61P135jcVq7yWNpAKNB0DlgX3lyTfpv9y9PWzyWBjBqBJ1hy4+l/a9/XJk++32PpQGMNkFnWDZv60v/+d5l6Ws/9lgaQCcQdNJQ19ZrNvWmq7+xJH1vrsfSADqFoJPWRqAHa8GabemK2xelZ5Zsqs4A0AkEnfTEgo3V3r79dEl+LG1RWuixNICOI+ik55dtTv84d0N1NLD849d8Y0las9FjaQCdSNBp+MsHl6c5Lw28Uv/yE2vSf7l3Wdq8bfCX5gEYWT3n3jjX80bs9JsnHpLOPvnQdMQhY9KSV7elh19Yn362wmtcATqdoANAAVxyB4ACCDoAFEDQAaAAgg4ABRB0ACiAoANAAQQdAAog6ABQAEEHgAIIOgAUQNABoACCDgAFEHQAKICgA0ABBB0ACiDoAFAAQQeAAgg6ABRA0AGgAIIOAAUQdAAogKADQAEEHQAKIOgAUIAc9L7mLgBQU3056Fub+wBATW3NQd/S3AcAampzDvrm5j4AUFNbrNABoP4aK/S1zX0AoKbW5qCvaO4DADW1Mgd9ZXMfAKipFVboAFB/jRX60uY+AFBTS3LQ5zX3AYCamp+DPr+5DwDU1DwrdACov8YK/eWYbY1DAKBu8neyvHzQ7JnT8pvinm+cAgDq5oXc8rxCz35cbQGAemk0XNABoN52CfpT1RYAqJdGw3cEfU5Mb3MXAKiJ3O7c8GbQZ8+c9kpsns37AEBtPFs1fOcKPft+tQUA6mFnu/sH/XvVFgCoh53t7h/0B2P6mrsAQIfLzc7tbtgZ9Nkzpy2JzZPNIwCgwz1Ztbuh/wo9u7faAgCdbZdmCzoA1NM+g/5ozMLmLgDQoXKrc7N32iXos2dOyw+o39E8AgA61O1Vs3fafYWe3VZtAYDO9NVqu9NAQc+vkJvf3AUAOkxudON1r/3tEfRYwufn2j7fPAIAOswtVat3MdAKPbslZntzFwDoELnNAy66Bwx6lH9BbDzCBgCd5d6q0XvY2wo9+7tqCwB0hr22eV9BvyfGV6oCQGfITc5tHtBeg1594H598wgAGGXXD3Qz3A77WqFn/xCz88XvAMCoyC3OTd6rfQY9/iawKTY3NI8AgFFyQ9XkvdrfCj37m5ilzV0AYITlBucW79N+gx5/I1gfm+uaRwDACLuuavE+DWaFnt0UM+BzbwBA2+T25gbv16CCXl23/4/NIwBghHxsf5+d7zDYFXqW767b42XwAEBb5OZ+sbm7fz19fXt9pG0PM2bNe1Ns8heq9zROAADtkON8VqzOf9A83L+hrNDzpffHYnNr8wgAaJPPDyXm2ZCCXvlIjMfYAKA9cmP/rLk7eEMOevyNYVVs/rR5BAC02J9WrR2SIX2G3t+MWfPuis2FzSMAoAW+FTF/d7U/JMO55L7DZTHLmrsAwAHKTf3j5u7QDTvo8TeI/KL4fxczvCU+ALBDbuml0dZh36N2ICv0HPVvx+azzSMAYJj+Npp6d7U/LAcU9Eq+6/2J5i4AMES5oUO+q313w74prr8Zs+adHJsfxRzZOAEADMbKmDNjdT6/eTh8rVih50vv+Sdyccz2xgkAYH9yMy9uRcyzlgQ9i5/Qg7H5aPMIANiPj1btbImWXHLvb8aseX8bmyuaRwDAAPJNcFdW+y3RshV6Px+KOaA79QCgYPkJsauau63T8hV6Fqv0w2LzUEz+djYAoCl/ydl5sTpf1zxsnbYEPYuoHxGb/xtzeuMEAHS3p2LeGjF/pXnYWm0LehZRPzo2s2OmN04AQHd6LmZGxLxtr0xvx2foO1U/8fNi8i8EALpRbmC+zN7W7z9pa9Cz+AUsjM2MmHypAQC6SW5fXpnnFrZV24OeVX8reWtMvhkAALpBbl7+zLytK/MdRiToWfyC8k0A+fK7R9oAKF1uXb7M3pYb4AYyYkHP4heWb9N/T4xvaAOgVLlx76maN2Laepf7vsyYNe/DsfkfMWMaJwCg3vK72fPrXD/dPBxZoxb0LKL+jth8Kca3tAFQZ/lb0/51xPyB5uHIG9WgZxH1k2JzR8yZjRMAUC/568PfGzF/qXk4Okb0M/SBVL8Bb4mZFTO6f7sAgMHLzfrrmLeMdsyzUV+h9xer9XfG5paYYxonAKAzLY25JEJ+b/Nw9I36Cr2/+I25Jzb53e93NU4AQOfJjTq9k2KeddQKvb9Yrb8vNvlShtU6AJ0gr8qvipB/tXnYWTpqhd5f9Rt2WsznY3y2DsBoyQ3KLTqtU2OedewKvb9YrZ8Vm8/E+H51AEbSnJirI+Qd/+ryjl2h9xe/kfk39OyYP4xZkM8BQBvl1uTmnFOHmGe1WKH3F6v1g2NzWczHYo7N5wCgRZbEXBdzc4R8U+NMTdQu6DtE2CfG5sqYa2PcOAfAgcg3vF0fMytCvqFxpmZqG/QdqhX7B2KuiZmezwHAID0Xc0PMF+q2It9d7YO+Q4Q93w9wQUy+HJ9fUDM2BgB2ty0mv/fkpph7I+RFhLCYoPcXcT8hNpfG/FHMtHwOgK43L+bWmFsi4sXdYF1k0HeIsPfEJj/qdlHMH8QcHwNA91gYc3vMbTGPlbIaH0jRQe+vuiSfn2fPl+XPjzkjphaP7QEwaL0xT8TcF5NfzTonIp7PFa9rgr67CHx+5O28mPxNb2+OOTUmr+gBqI8csWdjvhfz3ZiHIuD50bOu07VB310Efkps8str8pfDvCHmjTGnxLi5DqAz5JvZXoj5cczTMf8vJq/AV8W26wn6PkTkJ8TmtTGvq+bEmPzM+9R+MylmfL8ZF2OlD7BvOT5bY7bE5MfF8nZdzIp+k58NfzlmbjW/iHhvji17SOn/A6bddTBuigQoAAAAAElFTkSuQmCC';
  var Sh;
  !(function(t) {
    (t.DISCONNECTED = 'disconnected'), (t.CONNECTING = 'connecting'), (t.CONNECTED = 'connected');
  })(Sh || (Sh = {}));
  const Eh = 18e5,
    Th = { hour: 'numeric', minute: '2-digit' },
    $h = { weekday: void 0, year: 'numeric', month: 'short', day: 'numeric' },
    Oh = {
      weekday: void 0,
      year: void 0,
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    };
  class Mh extends lt {
    static get styles() {
      return r`
      :host {
        display: flex;
        align-items: center;
        align-self: center;
        --curvature: 0.6em;
        --color-primary: hsla(208, 70%, 55%, 1);
        font-family: 'Roboto', 'Helvetica Neue', sans-serif;
        font-weight: 400;
        --toggle-speed: 80ms;
        position: fixed;
        right: 0;
        bottom: 0;
        z-index: 10000;
      }

      .header {
        background: var(--color-primary);
        height: 3em;
        display: flex;
        align-items: center;
        width: 100%;
        color: rgba(255, 255, 255, 0.8);
        font-size: 0.8em;
      }

      .header slot {
        flex-grow: 1;
        padding: 1em;
        color: rgba(255, 255, 255, 0.9);
        font-size: 1.2em;
        display: block;
      }

      .header .close-button {
        margin: 0.5em;
        color: rgba(255, 255, 255, 0.5);
        cursor: pointer;
      }

      .header .close-button:hover {
        cursor: pointer;
        color: rgba(255, 255, 255, 1);
      }

      .block {
        margin-bottom: 1em;
      }

      .time {
        text-align: center;
        font-size: 0.8em;
        color: #999;
        margin-top: 2em;
        border-top: 1px solid #f8f8f8;
        padding: 1em;
        margin-left: 4em;
        margin-right: 4em;
      }

      .first .time {
        margin-top: 0;
        border-top: none;
        padding-top: 0;
      }

      .row {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
      }

      .input-panel {
        padding: 1em;
        background: #fff;
      }

      .avatar {
        margin-top: 0.6em;
        margin-right: 0.6em;
        flex-shrink: 0;
        width: 2em;
        height: 2em;
        overflow: hidden;
        border-radius: 100%;
        box-shadow: rgba(0, 0, 0, 0.1) 0px 3px 7px 0px,
          rgba(0, 0, 0, 0.2) 0px 1px 2px 0px,
          inset 0 0 0 0.15em rgba(0, 0, 0, 0.1);
      }

      .toggle {
        flex-shrink: 0;
        width: 4em;
        height: 4em;
        overflow: hidden;
        border-radius: 100%;
        box-shadow: rgba(0, 0, 0, 0.1) 0px 0px 1em 0.7em,
          rgba(0, 0, 0, 0.2) 0px 1px 2px 0px,
          inset 0 0 0 0.25em rgba(0, 0, 0, 0.1);
        cursor: pointer;
        transition: box-shadow var(--toggle-speed) ease-out;
        position: absolute;
        bottom: 1em;
        right: 1em;
      }

      .toggle:hover {
        box-shadow: rgba(0, 0, 0, 0.1) 0px 0px 1em 0.7em,
          rgba(0, 0, 0, 0.4) 0px 1px 2px 0px,
          inset 0 0 0 0.25em rgba(0, 0, 0, 0.2);
      }

      .incoming .row {
        flex-direction: row-reverse;
        margin-left: 1em;
      }

      .bubble {
        padding: 1em;
        padding-bottom: 0.5em;
        background: #fafafa;
        border-radius: var(--curvature);
        max-width: 70%;
      }

      .bubble .name {
        font-size: 0.95em;
        font-weight: 400;
        color: #888;
        margin-bottom: 0.25em;
      }

      .outgoing .bubble {
        border-top-left-radius: 0;
      }

      .incoming .bubble {
        background: var(--color-primary);
        color: white;
        border-top-right-radius: 0;
        text-align: right;
      }

      .message {
        margin-bottom: 0.5em;
        line-height: 1.2em;
      }

      .chat {
        width: 28rem;
        border-radius: var(--curvature);
        overflow: hidden;
        box-shadow: rgba(0, 0, 0, 0.1) 0px 3px 7px 0px,
          rgba(0, 0, 0, 0.2) 0px 1px 2px 0px, rgba(0, 0, 0, 0.1) 5em 5em 5em 5em;
        position: absolute;
        bottom: 3em;
        right: 1em;
        transition: all var(--toggle-speed) ease-out;
        transform: scale(0.9);
        pointer-events: none;
        opacity: 0;
      }

      .chat.open {
        bottom: 6em;
        opacity: 1;
        transform: scale(1);
        pointer-events: initial;
      }

      .messages {
        background: #fff;
      }

      .scroll {
        height: 40rem;
        max-height: 60vh;
        overflow: auto;
        -webkit-overflow-scrolling: touch;
        overflow-scrolling: touch;
        padding: 1em 1em 0 1em;
        display: flex;
        flex-direction: column-reverse;
      }

      .messages:before {
        content: '';
        background:     /* Shadow TOP */ radial-gradient(
            farthest-side at 50% 0,
            rgba(0, 0, 0, 0.2),
            rgba(0, 0, 0, 0)
          )
          center top;
        height: 10px;
        display: block;
        position: absolute;
        width: 28rem;
        transition: opacity var(--toggle-speed) ease-out;
      }

      .messages:after {
        content: '';
        background:       /* Shadow BOTTOM */ radial-gradient(
            farthest-side at 50% 100%,
            rgba(0, 0, 0, 0.2),
            rgba(0, 0, 0, 0)
          )
          center bottom;
        height: 10px;
        display: block;
        position: absolute;
        margin-top: -10px;
        width: 28rem;
        margin-right: 5em;
        transition: opacity var(--toggle-speed) ease-out;
      }

      .scroll-at-top .messages:before {
        opacity: 0;
      }

      .scroll-at-bottom .messages:after {
        opacity: 0;
      }

      .input {
        border: none;
        flex-grow: 1;
        color: #333;
        font-size: 1em;
      }

      .input:focus {
        outline: none;
      }

      input::placeholder {
        opacity: 0.3;
      }

      .input.inactive {
        // pointer-events: none;
        // opacity: 0.3;
      }

      .active {
      }

      .send-icon {
        color: #eee;
        pointer-events: none;
        transform: rotate(-45deg);
        transition: transform 0.2s ease-out;
      }

      .pending .send-icon {
        color: var(--color-primary);
        pointer-events: initial;
        transform: rotate(0deg);
      }

      .notice {
        padding: 1em;
        background: #f8f8f8;
        color: #666;
        text-align: center;
        cursor: pointer;
      }

      .connecting .notice {
        display: flex;
        justify-content: center;
      }

      .connecting .notice temba-icon {
        margin-left: 0.5em;
      }

      .reconnect {
        color: var(--color-primary);
        text-decoration: underline;
        font-size: 0.9em;
      }

      .input:disabled {
        background: transparent !important;
      }

      temba-loading {
        justify-content: center;
        margin: 0.5em auto;
        margin-bottom: 2em;
      }

      temba-loading.hidden {
        display: none;
      }
    `;
    }
    constructor() {
      super(),
        (this.messageGroups = []),
        (this.status = Sh.DISCONNECTED),
        (this.open = !1),
        (this.fetching = !1),
        (this.hasPendingText = !1),
        (this.hideTopScroll = !0),
        (this.hideBottomScroll = !0),
        (this.blockHistoryFetching = !1),
        (this.msgMap = new Map()),
        (this.newMessageCount = 0);
    }
    handleReconnect() {
      this.openSocket();
    }
    sendSockMessage(t) {
      console.log('MO', t), this.sock.send(JSON.stringify(t));
    }
    openSocket() {
      if (this.status !== Sh.DISCONNECTED) return;
      this.status = Sh.CONNECTING;
      const t = this;
      let e = `wss://localhost.textit.com/connect/${this.channel}/`;
      this.urn && (e = `${e}?chat_id=${this.urn}`);
      const i = new WebSocket(e);
      (this.sock = i),
        (this.sock.onclose = function(e) {
          console.log('Socket closed', e), (t.status = Sh.DISCONNECTED);
        }),
        (this.sock.onopen = function(e) {
          console.log('Socket opened', e),
            (t.status = Sh.CONNECTED),
            (t.urn = ne('temba-chat-urn'));
          const i = { type: 'start_chat' };
          t.urn && (i.chat_id = t.urn), t.sendSockMessage(i);
        }),
        (this.sock.onmessage = function(e) {
          t.status = Sh.CONNECTED;
          const i = JSON.parse(e.data);
          console.log('MT', i),
            'chat_started' === i.type
              ? (t.urn !== i.chat_id && (t.messageGroups = []),
                (t.urn = i.chat_id),
                ((t, e, i) => {
                  if (!i) {
                    const t = document.location.pathname;
                    i = t.substring(0, t.indexOf('/', 1));
                  }
                  const o = new Date();
                  o.setTime(o.getTime() + 2592e6),
                    (document.cookie = `${t}=${e};expires=${o.toUTCString()};path=${i}`);
                })('temba-chat-urn', i.chat_id),
                t.requestUpdate('messageGroups'))
              : 'chat_resumed' === i.type
              ? ((t.oldestMessageDate = new Date(i.time)),
                (t.urn = i.chat_id),
                t.fetchPreviousMessages())
              : 'msg_out' === i.type
              ? (t.addMessage(i), t.insertGroups(t.groupMessages([i.msg_id]), !0))
              : 'history' === i.type && t.handleHistoryResponse(i);
        });
    }
    isSameGroup(t, e) {
      var i, o;
      return (
        !(!t || !e) &&
        (t.origin === e.origin &&
          (null === (i = t.user) || void 0 === i ? void 0 : i.name) ===
            (null === (o = e.user) || void 0 === o ? void 0 : o.name) &&
          Math.abs(t.timeAsDate.getTime() - e.timeAsDate.getTime()) < Eh)
      );
    }
    insertGroups(t, e = !1) {
      t.reverse();
      for (const i of t) {
        const t = this.messageGroups[e ? 0 : this.messageGroups.length - 1];
        if (t) {
          const o = t[t.length - 1],
            n = this.msgMap.get(o),
            s = this.msgMap.get(i[0]);
          this.isSameGroup(n, s)
            ? t.push(...i)
            : e
            ? this.messageGroups.splice(0, 0, i)
            : this.messageGroups.push(i);
        } else e ? this.messageGroups.splice(0, 0, i) : this.messageGroups.push(i);
      }
      this.requestUpdate('messageGroups');
    }
    groupMessages(t) {
      const e = [];
      let i = [],
        o = null;
      for (const n of t) {
        const t = this.msgMap.get(n);
        this.isSameGroup(t, o) || ((i = []), e.push(i)), i.push(n), (o = t);
      }
      return e;
    }
    fetchPreviousMessages() {
      if (!this.blockHistoryFetching) {
        (this.blockHistoryFetching = !0), (this.fetching = !0);
        const t = { type: 'get_history' };
        this.oldestMessageDate && (t.before = this.oldestMessageDate.toISOString()),
          (this.fetchRequested = new Date()),
          this.sendSockMessage(t);
      }
    }
    handleHistoryResponse(t) {
      const e = new Date().getTime() - this.fetchRequested.getTime();
      window.setTimeout(
        () => {
          this.fetching = !1;
          const e = t.history.reverse(),
            i = [];
          for (const t of e) this.addMessage(t) && i.push(t.msg_id);
          if (0 === i.length) return;
          this.insertGroups(this.groupMessages(i));
          const o = this.shadowRoot.querySelector('.scroll'),
            n = o.scrollTop;
          window.setTimeout(() => {
            (o.scrollTop = n), (this.blockHistoryFetching = !1);
          }, 100);
        },
        0 === this.messageGroups.length ? 0 : Math.max(0, 250 - e)
      );
    }
    firstUpdated(t) {
      super.firstUpdated(t);
    }
    focusInput() {
      const t = this.shadowRoot.querySelector('.input');
      t && t.focus();
    }
    updated(t) {
      if ((super.updated(t), this.open && t.has('open') && void 0 !== t.get('open'))) {
        const t = this.shadowRoot.querySelector('.scroll'),
          e = t.scrollHeight > t.clientHeight;
        (this.hideBottomScroll = !0),
          (this.hideTopScroll = !e),
          this.scrollToBottom(),
          this.status === Sh.DISCONNECTED && this.openSocket();
      }
      t.has('status') && this.status === Sh.CONNECTED && this.focusInput();
    }
    addMessage(t) {
      var e;
      t.time && !t.timeAsDate && (t.timeAsDate = new Date(t.time)),
        (!this.oldestMessageDate || t.timeAsDate.getTime() < this.oldestMessageDate.getTime()) &&
          (this.oldestMessageDate = t.timeAsDate);
      const i = !this.msgMap.has(t.msg_id);
      return (
        this.msgMap.set(t.msg_id, t),
        (null === (e = t.user) || void 0 === e ? void 0 : e.avatar) &&
          (this.activeUserAvatar = t.user.avatar),
        i
      );
    }
    openChat() {
      this.open = !0;
    }
    handleKeyUp(t) {
      this.hasPendingText && 'Enter' === t.key && this.sendPendingMessage(),
        (this.hasPendingText = t.target.value.length > 0);
    }
    sendPendingMessage() {
      if (this.status === Sh.CONNECTED) {
        const t = this.shadowRoot.querySelector('.input'),
          e = t.value;
        t.value = '';
        const i = {
          msg_id: 'pending-' + this.newMessageCount++,
          type: 'send_msg',
          text: e,
          time: new Date().toISOString()
        };
        this.addMessage(i),
          this.insertGroups(this.groupMessages([i.msg_id]), !0),
          this.sendSockMessage(i),
          (this.hasPendingText = t.value.length > 0);
      }
    }
    scrollToBottom() {
      const t = this.shadowRoot.querySelector('.scroll');
      t && ((t.scrollTop = t.scrollHeight), (this.hideBottomScroll = !0));
    }
    renderMessageGroup(t, e, i) {
      var o, n;
      const s = new Date();
      let r;
      if (e > 0) {
        const t = i[e - 1];
        t && t.length > 0 && (r = this.msgMap.get(t[0]));
      }
      const a = this.msgMap.get(t[t.length - 1]);
      let l = null;
      if (r && !this.isSameGroup(r, a) && r.timeAsDate.getTime() - a.timeAsDate.getTime() > Eh) {
        l =
          !r || r.timeAsDate.getDate() !== a.timeAsDate.getDate()
            ? j`<div class="time">
          ${r.timeAsDate.toLocaleDateString(void 0, $h)}
        </div>`
            : r.timeAsDate.getDate() !== s.getDate()
            ? j`<div class="time">
            ${r.timeAsDate.toLocaleTimeString(void 0, Oh)}
          </div>`
            : j`<div class="time">
            ${r.timeAsDate.toLocaleTimeString(void 0, Th)}
          </div>`;
      }
      const h = new Date(this.msgMap.get(t[t.length - 1]).time),
        c = this.msgMap.get(t[0]),
        d = !c.origin,
        u = null === (o = c.user) || void 0 === o ? void 0 : o.avatar,
        p = null === (n = c.user) || void 0 === n ? void 0 : n.name;
      return j` <div
      class="block  ${d ? 'incoming' : 'outgoing'} ${0 === e ? 'first' : ''}"
      title="${h.toLocaleTimeString(void 0, Oh)}"
    >
      <div class="row">
        ${
          d
            ? null
            : j`
              <div
                class="avatar"
                style="background: center / contain no-repeat url(${u || Ch})"
              ></div>
            `
        }

        <div class="bubble">
          ${d ? null : j`<div class="name">${p}</div>`}
          ${t.map(
            t => j`<div class="message">${this.msgMap.get(t).text}</div>
                <!--div style="font-size:10px">
                  ${this.msgMap.get(t).timeAsDate.toLocaleDateString(void 0, Oh)}
                </div-->`
          )}
        </div>
      </div>
      ${l}
    </div>`;
    }
    handleScroll(t) {
      const e = t.target,
        i = e.scrollHeight - e.clientHeight,
        o = Math.round(i + e.scrollTop) / i;
      (this.hideTopScroll = o <= 0.01),
        (this.hideBottomScroll = o >= 0.99),
        this.blockHistoryFetching || (o < 0.05 && this.fetchPreviousMessages());
    }
    handleClickInputPanel(t) {
      t.preventDefault(), t.stopPropagation();
      this.shadowRoot.querySelector('.input').focus();
    }
    toggleChat() {
      this.open = !this.open;
    }
    render() {
      return j`
      <div
        class="chat ${this.status} ${this.hideTopScroll ? 'scroll-at-top' : ''} ${
        this.hideBottomScroll ? 'scroll-at-bottom' : ''
      } ${this.open ? 'open' : ''}"
      >
        <div class="header">
          <slot name="header">${this.urn ? this.urn : 'Chat'}</slot>
          <temba-icon
            name="close"
            size="1.3"
            class="close-button"
            @click=${this.toggleChat}
          ></temba-icon>
        </div>
        <div class="messages">
          <div class="scroll" @scroll=${this.handleScroll}>
            ${
              this.messageGroups
                ? this.messageGroups.map((t, e, i) => j`${this.renderMessageGroup(t, e, i)}`)
                : null
            }

            <temba-loading
              class="${this.fetching ? '' : 'hidden'}"
            ></temba-loading>
          </div>
        </div>

        ${
          this.status === Sh.DISCONNECTED
            ? j`<div class="notice">
              <div>This chat is not currently connected.</div>
              <div class="reconnect" @click=${this.handleReconnect}>
                Click here to reconnect
                <div></div>
              </div>
            </div>`
            : null
        }
        ${
          this.status === Sh.CONNECTING
            ? j`<div class="notice">
              <div>Connecting</div>
              <temba-icon name="progress_spinner" spin></temba-icon>
            </div>`
            : null
        }
        ${
          this.status === Sh.CONNECTED
            ? j` <div
              class="row input-panel ${this.hasPendingText ? 'pending' : ''}"
              @click=${this.handleClickInputPanel}
            >
              <input
                class="input ${this.status === Sh.CONNECTED ? 'active' : 'inactive'}"
                type="text"
                placeholder="Message.."
                ?disabled=${this.status !== Sh.CONNECTED}
                @keydown=${this.handleKeyUp}
              />
              <temba-icon
                tabindex="1"
                class="send-icon"
                name="send"
                size="1"
                clickable
                @click=${this.sendPendingMessage}
              ></temba-icon>
            </div>`
            : null
        }
      </div>

      <div @click=${this.toggleChat}>
        <div
          class="toggle"
          style="background: center / contain no-repeat url(${this.activeUserAvatar || Ch})"
        ></div>
      </div>
    `;
    }
  }
  t([ge({ type: String })], Mh.prototype, 'channel', void 0),
    t([ge({ type: String })], Mh.prototype, 'urn', void 0),
    t([ge({ type: Array })], Mh.prototype, 'messageGroups', void 0),
    t([ge({ type: String })], Mh.prototype, 'status', void 0),
    t([ge({ type: Boolean })], Mh.prototype, 'open', void 0),
    t([ge({ type: Boolean })], Mh.prototype, 'fetching', void 0),
    t([ge({ type: Boolean })], Mh.prototype, 'hasPendingText', void 0),
    t([ge({ type: Boolean, attribute: !1 })], Mh.prototype, 'hideTopScroll', void 0),
    t([ge({ type: Boolean, attribute: !1 })], Mh.prototype, 'hideBottomScroll', void 0),
    t([ge({ type: Boolean, attribute: !1 })], Mh.prototype, 'blockHistoryFetching', void 0),
    t([ge({ type: String })], Mh.prototype, 'host', void 0),
    t([ge({ type: String })], Mh.prototype, 'activeUserAvatar', void 0);
  const Lh = r`
  .croppie-container {
    width: 100%;
    height: 100%;
  }

  .croppie-container .cr-image {
    z-index: -1;
    position: absolute;
    top: 0;
    left: 0;
    transform-origin: 0 0;
    max-height: none;
    max-width: none;
  }

  .croppie-container .cr-boundary {
    position: relative;
    overflow: hidden;
    margin: 0 auto;
    z-index: 1;
    width: 100%;
    height: 100%;
  }

  .croppie-container .cr-viewport,
  .croppie-container .cr-resizer {
    position: absolute;
    border: 2px solid #fff;
    margin: auto;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    box-shadow: 0 0 2000px 2000px rgba(0, 0, 0, 0.5);
    z-index: 0;
  }

  .croppie-container .cr-resizer {
    z-index: 2;
    box-shadow: none;
    pointer-events: none;
  }

  .croppie-container .cr-resizer-vertical,
  .croppie-container .cr-resizer-horisontal {
    position: absolute;
    pointer-events: all;
  }

  .croppie-container .cr-resizer-vertical::after,
  .croppie-container .cr-resizer-horisontal::after {
    display: block;
    position: absolute;
    box-sizing: border-box;
    border: 1px solid black;
    background: #fff;
    width: 10px;
    height: 10px;
    content: '';
  }

  .croppie-container .cr-resizer-vertical {
    bottom: -5px;
    cursor: row-resize;
    width: 100%;
    height: 10px;
  }

  .croppie-container .cr-resizer-vertical::after {
    left: 50%;
    margin-left: -5px;
  }

  .croppie-container .cr-resizer-horisontal {
    right: -5px;
    cursor: col-resize;
    width: 10px;
    height: 100%;
  }

  .croppie-container .cr-resizer-horisontal::after {
    top: 50%;
    margin-top: -5px;
  }

  .croppie-container .cr-original-image {
    display: none;
  }

  .croppie-container .cr-vp-circle {
    border-radius: 50%;
  }

  .croppie-container .cr-overlay {
    z-index: 1;
    position: absolute;
    cursor: move;
    touch-action: none;
  }

  .croppie-container .cr-slider-wrap {
    width: 75%;
    margin: 15px auto;
    text-align: center;
  }

  .croppie-result {
    position: relative;
    overflow: hidden;
  }

  .croppie-result img {
    position: absolute;
  }

  .croppie-container .cr-image,
  .croppie-container .cr-overlay,
  .croppie-container .cr-viewport {
    -webkit-transform: translateZ(0);
    -moz-transform: translateZ(0);
    -ms-transform: translateZ(0);
    transform: translateZ(0);
  }

  /*************************************/
  /***** STYLING RANGE INPUT ***********/
  /*************************************/
  /*http://brennaobrien.com/blog/2014/05/style-input-type-range-in-every-browser.html */
  /*************************************/

  .cr-slider {
    -webkit-appearance: none;
    /*removes default webkit styles*/
    /*border: 1px solid white; */ /*fix for FF unable to apply focus style bug */
    width: 300px;
    /*required for proper track sizing in FF*/
    max-width: 100%;
    padding-top: 8px;
    padding-bottom: 8px;
    background-color: transparent;
  }

  .cr-slider::-webkit-slider-runnable-track {
    width: 100%;
    height: 3px;
    background: rgba(0, 0, 0, 0.5);
    border: 0;
    border-radius: 3px;
  }

  .cr-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    border: none;
    height: 16px;
    width: 16px;
    border-radius: 50%;
    background: #ddd;
    margin-top: -6px;
  }

  .cr-slider:focus {
    outline: none;
  }
  /*
.cr-slider:focus::-webkit-slider-runnable-track {
background: #ccc;
}
*/

  .cr-slider::-moz-range-track {
    width: 100%;
    height: 3px;
    background: rgba(0, 0, 0, 0.5);
    border: 0;
    border-radius: 3px;
  }

  .cr-slider::-moz-range-thumb {
    border: none;
    height: 16px;
    width: 16px;
    border-radius: 50%;
    background: #ddd;
    margin-top: -6px;
  }

  /*hide the outline behind the border*/
  .cr-slider:-moz-focusring {
    outline: 1px solid white;
    outline-offset: -1px;
  }

  .cr-slider::-ms-track {
    width: 100%;
    height: 5px;
    background: transparent;
    /*remove bg colour from the track, we'll use ms-fill-lower and ms-fill-upper instead */
    border-color: transparent; /*leave room for the larger thumb to overflow with a transparent border */
    border-width: 6px 0;
    color: transparent; /*remove default tick marks*/
  }
  .cr-slider::-ms-fill-lower {
    background: rgba(0, 0, 0, 0.5);
    border-radius: 10px;
  }
  .cr-slider::-ms-fill-upper {
    background: rgba(0, 0, 0, 0.5);
    border-radius: 10px;
  }
  .cr-slider::-ms-thumb {
    border: none;
    height: 16px;
    width: 16px;
    border-radius: 50%;
    background: #ddd;
    margin-top: 1px;
  }
  .cr-slider:focus::-ms-fill-lower {
    background: rgba(0, 0, 0, 0.5);
  }
  .cr-slider:focus::-ms-fill-upper {
    background: rgba(0, 0, 0, 0.5);
  }
  /*******************************************/

  /***********************************/
  /* Rotation Tools */
  /***********************************/
  .cr-rotate-controls {
    position: absolute;
    bottom: 5px;
    left: 5px;
    z-index: 1;
  }
  .cr-rotate-controls button {
    border: 0;
    background: none;
  }
  .cr-rotate-controls i:before {
    display: inline-block;
    font-style: normal;
    font-weight: 900;
    font-size: 22px;
  }
  .cr-rotate-l i:before {
    content: '↺';
  }
  .cr-rotate-r i:before {
    content: '↻';
  }
`;
  class zh extends fe {
    constructor() {
      super(...arguments),
        (this.shape = 'square'),
        (this.showCroppie = !1),
        (this.uploadReader = new FileReader());
    }
    firstUpdated(t) {
      super.firstUpdated(t);
      const e = this;
      this.uploadReader.onload = function() {
        e.launchCroppie(e.uploadReader.result);
      };
    }
    updated(t) {
      super.updated(t), t.has('url') && this.setAttribute('url', this.url);
    }
    closeCroppie() {
      this.showCroppie = !1;
      const t = this.shadowRoot.querySelector('.croppie .embed');
      t.firstChild && t.removeChild(t.firstChild);
    }
    launchCroppie(t) {
      const e = this.shadowRoot.querySelector('.croppie .embed');
      e.firstChild && e.removeChild(e.firstChild), (this.showCroppie = !0);
      const i = document.createElement('div');
      e.appendChild(i);
      const o = window.Croppie;
      (this.croppie = new o(i, {
        enableExif: !0,
        viewport: { width: 300, height: 300, type: this.shape },
        boundary: { width: 400, height: 400 }
      })),
        this.croppie.bind({ url: t });
    }
    saveResult() {
      const t = this;
      this.croppie
        .result({ type: 'blob', size: 'viewport', format: 'webp', quality: 1, circle: !1 })
        .then(function(e) {
          const i = e;
          t.url = URL.createObjectURL(i);
          const o = new FormData();
          o.append(t.name, i, 'filename.webp'), (t.value = o), t.closeCroppie();
        });
    }
    handleToggleClicked() {
      this.shadowRoot.querySelector('#file').click();
    }
    handleFileChanged(t) {
      const e = t.target;
      e.files.length > 0 && this.uploadReader.readAsDataURL(e.files[0]), (e.value = '');
    }
    render() {
      return j`
    <div class="wrapper ${this.shape} ${this.label ? 'label' : ''}">
      <temba-field
        name=${this.name}
        label=${this.label}
        .helpText=${this.helpText}
        .errors=${this.errors}
        .widgetOnly=${this.widgetOnly}
        .helpAlways=${!0}
        ?disabled=${this.disabled}
      >
        <input class='hidden' type="file" accept="image/*" capture="camera" id="file" name="file" @change=${
          this.handleFileChanged
        }/>
        <div class='toggle ${this.url ? 'set' : ''}  ${this.showCroppie ? 'hidden' : ''}' @click=${
        this.handleToggleClicked
      } style="background: ${
        this.url ? `url('${this.url}') center / contain no-repeat` : 'rgba(0, 0, 0, 0.1)'
      }">
          <temba-icon name=${ve.upload_image} size="1.5"></temba-icon>
        </div>
        
        <temba-mask ?show=${this.showCroppie} class="${this.showCroppie ? 'editing' : ''}">
          <div class='croppie'>
            <div class='embed'></div>
            <div class='controls'>
              <temba-icon class="close" size="1" name=${ve.close} @click=${
        this.closeCroppie
      }></temba-icon>
              <div style="flex-grow:1"></div>
              <temba-icon class="submit" size="1" name=${ve.submit} @click=${
        this.saveResult
      }></temba-icon>
            </div>
        </temba-mask>
      </temba-field>
    </div>
    `;
    }
  }
  (zh.styles = r`
    ${Lh}

    .croppie {
      max-width: 400px;
      border: 0px solid #ccc;
      border-radius: 0.5em;
      overflow: hidden;
      background: #fff;
      margin-top: -20%;
      box-shadow: 0 0 15px 5px rgba(0, 0, 0, 0.1);
    }

    .croppie .controls {
      display: flex;
      align-items: center;
      flex-direction: row;
      justify-content: center;
      position: absolute;
      z-index: 1;
      width: 400px;
      margin-top: -42px;
    }

    .toggle {
      height: 110px;
      width: 110px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .circle .toggle {
      border-radius: 50%;
    }

    .toggle.set {
      box-shadow: rgba(0, 0, 0, 0.1) 0px 3px 7px 0px,
        rgba(0, 0, 0, 0.2) 0px 1px 2px 0px, inset 0 0 0 5px rgba(0, 0, 0, 0.1);
    }

    .toggle.set:hover {
      box-shadow: rgba(0, 0, 0, 0.1) 0px 3px 7px 0px,
        rgba(0, 0, 0, 0.2) 0px 1px 2px 0px, inset 0 0 0 5px rgba(0, 0, 0, 0.2);
    }

    .toggle temba-icon {
      color: rgba(0, 0, 0, 0.2);
      padding: 5px;
    }

    toggle:hover temba-icon {
      color: rgba(0, 0, 0, 0.8);
    }

    .toggle.set temba-icon {
      border-radius: 50%;
      margin-right: -90%;
      margin-bottom: -50%;
      background: rgba(240, 240, 240, 1);
      box-shadow: rgba(0, 0, 0, 0.2) 0px 1px 2px 0px;
    }

    .toggle.set:hover temba-icon {
      background: #fff;
      color: var(--color-primary-dark);
    }

    .circle .toggle.set temba-icon {
      margin-right: -70%;
      margin-bottom: -70%;
    }

    .hidden {
      display: none;
    }

    .controls temba-icon {
      margin: 0em 0.75em;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 50%;
      padding: 6px;
      transition: all 0.1s ease-in-out;
    }

    .controls {
      pointer-events: none;
      display: flex;
    }

    .controls temba-icon {
      pointer-events: all;
    }

    .controls temba-icon.close {
      color: rgba(0, 0, 0, 0.2);
      background: rgba(255, 255, 255, 0.2);
    }

    .controls temba-icon.submit {
      color: rgba(0, 0, 0, 0.2);
      box-shadow: inset 0 0 0 2px rgba(0, 0, 0, 0.1);
    }

    .controls temba-icon:hover {
      color: white;
      cursor: pointer;
      background: var(--color-primary-dark);
    }
  `),
    t([ge({ type: String })], zh.prototype, 'tempImage', void 0),
    t([ge({ type: String })], zh.prototype, 'url', void 0),
    t([ge({ type: String })], zh.prototype, 'shape', void 0),
    t([ge({ type: Boolean, attribute: !1 })], zh.prototype, 'showCroppie', void 0);
  class Ph extends lt {
    constructor() {
      super(...arguments), (this.show = !1);
    }
    render() {
      return j` <div class="mask  ${this.show ? 'show' : ''}">
      <slot></slot>
    </div>`;
    }
  }
  (Ph.styles = r`
    .mask {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 100;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.6);
      display: none;
      align-items: center;
      justify-content: center;
    }

    .show {
      display: flex;
    }
  `),
    t([ge({ type: Boolean })], Ph.prototype, 'show', void 0);
  class Dh extends pl {
    updated(t) {
      super.updated(t),
        t.has('email') &&
          ((this.user = this.store.getUser(this.email)),
          this.user &&
            ((this.fullName = [this.user.first_name, this.user.last_name].join(' ')),
            this.user.avatar
              ? ((this.background = `url('${this.user.avatar}') center / contain no-repeat`),
                (this.initials = ''))
              : ((this.background = qt.hex(this.fullName)), (this.initials = le(this.fullName)))));
    }
    render() {
      return this.user
        ? j` <div class="wrapper">
      <div
        class="avatar-circle"
        style="
              transform:scale(${this.scale || 1});
              display: flex;
              height: 30px;
              width: 30px;
              flex-direction: row;
              align-items: center;
              color: #fff;
              border-radius: 100%;
              font-weight: 400;
              overflow: hidden;
              font-size: 12px;
              box-shadow: inset 0 0 0 3px rgba(0, 0, 0, 0.1);
              background:${this.background}"
      >
        ${
          this.initials
            ? j` <div
              style="border: 0px solid red; display:flex; flex-direction: column; align-items:center;flex-grow:1"
            >
              <div style="border:0px solid blue;">${this.initials}</div>
            </div>`
            : null
        }
      </div>
      ${
        this.name
          ? j`<div
            class="name"
            style="margin: 0px ${this.scale - 0.5}em;font-size:${this.scale + 0.2}em"
          >
            ${this.fullName}
          </div>`
          : null
      }
    </div>`
        : null;
    }
  }
  (Dh.styles = r`
    :host {
      display: flex;
    }

    .wrapper {
      display: flex;
      flex-direction: row;
      align-items: center;
      flex-grow: 1;
    }

    .name {
      flex-grow: 1;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `),
    t([ge({ type: String })], Dh.prototype, 'email', void 0),
    t([ge({ type: Number })], Dh.prototype, 'scale', void 0),
    t([ge({ type: Boolean })], Dh.prototype, 'name', void 0),
    t([ge({ type: Object, attribute: !1 })], Dh.prototype, 'user', void 0),
    t([ge({ type: String, attribute: !1 })], Dh.prototype, 'background', void 0),
    t([ge({ type: String, attribute: !1 })], Dh.prototype, 'initials', void 0),
    t([ge({ type: String, attribute: !1 })], Dh.prototype, 'fullName', void 0);
  class Ih extends fe {
    constructor() {
      super(...arguments), (this.lang = 'eng-US');
    }
    static get styles() {
      return r`
      .component {
        background: #fff;
        border: 1px solid var(--color-widget-border);
        border-radius: var(--curvature);
        padding: 1em;
        margin-top: 1em;
      }

      .content {
        margin-bottom: 1em;
      }

      .picker {
        margin-bottom: 0.5em;
        display: block;
      }
      .param {
        display: flex;
        margin-bottom: 0.5em;
        align-items: center;
      }
      label {
        margin-right: 0.5em;
      }

      .content span {
        margin-right: 0.25em;
      }

      .error-message {
        padding-left: 0.5em;
      }

      .variable {
        display: inline-block;
        margin: 0.25em 0em;
        margin-right: 0.25em;
      }

      .button-wrapper {
        background: #f9f9f9;
        border-radius: var(--curvature);
        padding: 0.5em;
        display: flex;
        flex-direction: column;
      }

      .button-header {
        font-weight: normal;
        margin-left: 0.25em;
        margin-bottom: -0.5em;
        font-size: 0.9em;
        color: #777;
      }

      .buttons {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
      }

      .button {
        background: #fff;
        padding: 0.3em 1em;
        border: 1px solid #e6e6e6;
        border-radius: var(--curvature);
        min-height: 23px;
        display: flex;
        flex-direction: row;
        align-items: center;
        margin-right: 0.5em;
        margin-top: 0.5em;
        align-items: center;
      }

      .button .display {
        margin-right: 0.5em;
        background: #f9f9f9;
        padding: 0.25em 1em;
        border-radius: var(--curvature);
      }

      temba-textinput,
      temba-completion {
        --temba-textinput-padding: 5px 5px;
        --temba-textinput-font-size: 0.9em;
        line-height: initial;
      }

      .template {
        background: #fff;
        border-radius: var(--curvature);
        border: 1px solid var(--color-widget-border);
        padding: 1em;
        line-height: 2.2em;
        max-height: 50vh;
        overflow-y: auto;
        overflow-x: hidden;
      }
    `;
    }
    firstUpdated(t) {
      super.firstUpdated(t);
    }
    updated(t) {
      super.updated(t);
    }
    handleTemplateChanged(t) {
      const e = this.selectedTemplate;
      this.selectedTemplate = t.target.values[0];
      const [i, o] = this.lang.split('-');
      this.selectedTemplate
        ? this.selectedTemplate.translations.forEach(t => {
            if (t.locale === this.lang || (!o && t.locale.split('-')[0] === i)) {
              this.translation = t;
              const i = new Array((t.variables || []).length).fill('');
              e ||
                (this.variables &&
                  this.variables.forEach((t, e) => {
                    i[e] = t;
                  })),
                (this.variables = i);
            }
          })
        : (this.translation = null),
        this.fireCustomEvent(Me.ContextChanged, {
          template: this.selectedTemplate,
          translation: this.translation,
          variables: this.variables
        });
    }
    handleAttachmentsChanged(t) {
      const e = t.target,
        i = parseInt(e.getAttribute('index'));
      if (0 === e.attachments.length) this.variables[i] = '';
      else {
        const t = e.attachments[0];
        t.url && t.content_type
          ? (this.variables[i] = `${t.content_type}:${t.url}`)
          : (this.variables[i] = '');
      }
      this.fireContentChange();
    }
    handleVariableChanged(t) {
      const e = t.target,
        i = parseInt(e.getAttribute('index'));
      (this.variables[i] = e.value), this.fireContentChange();
    }
    fireContentChange() {
      this.fireCustomEvent(Me.ContentChanged, {
        template: this.selectedTemplate,
        translation: this.translation,
        variables: this.variables
      });
    }
    renderVariables(t) {
      var e;
      const i = new RegExp(`{{(${Object.keys(t.variables || []).join('|')})}}`, 'g');
      let o = null;
      const n = (null === (e = t.content) || void 0 === e ? void 0 : e.split(i)) || [];
      return (
        (o =
          n.length > 0
            ? n.map((e, i) => {
                if (i % 2 == 0) return j`<span class="text">${e}</span>`;
                const o = t.variables[e];
                return j`<temba-completion
          class="variable"
          type="text"
          value=${o < this.variables.length ? this.variables[o] : null}
          @keyup=${this.handleVariableChanged}
          name="${t.name}"
          index="${o}"
          placeholder="{{${e}}}"
        ></temba-completion>`;
              })
            : t.params.map(e => {
                if (
                  'image' === e.type ||
                  'document' === e.type ||
                  'audio' === e.type ||
                  'video' === e.type
                ) {
                  const i = Object.values(t.variables)[0];
                  let o = [];
                  if (this.variables[i]) {
                    const t = this.variables[i].split(':');
                    o = [{ url: t[1], content_type: t[0] }];
                  }
                  return j`<div
            style="
              display: flex; 
              align-items: center; 
              border-radius: var(--curvature);
              ${0 === o.length ? 'background-color:rgba(255,0,0,.07);' : ''}
            "
          >
            <temba-media-picker
              accept="${'document' === e.type ? 'application/pdf' : e.type + '/*'}"
              max="1"
              index=${i}
              icon="attachment_${e.type}"
              attachments=${JSON.stringify(o)}
              @change=${this.handleAttachmentsChanged.bind(this)}
            ></temba-media-picker>
            <div>
              ${0 == o.length ? j`Attach ${e.type} to continue` : ''}
            </div>
          </div>`;
                }
              })),
        j`<div class="content">${o}</div> `
      );
    }
    renderComponents(t) {
      const e = t
          .filter(t => !t.type.startsWith('button/'))
          .map(
            t => j`<div class="${t.name}">
            ${this.renderVariables(t)}
          </div>`
          ),
        i = t.filter(t => t.type.startsWith('button/')),
        o = i.length > 0 ? this.renderButtons(i) : null;
      return j`<div class="main">${e}</div>
      <div class="buttons">
        ${o}
        <div></div>
      </div>`;
    }
    renderButtons(t) {
      const e = t.map(t =>
        t.display
          ? j`
          <div class="button">
            <div class="display">${t.display}</div>
            ${this.renderVariables(t)}
          </div>
        `
          : j`
          <div class="button">${this.renderVariables(t)}</div>
        `
      );
      return j`<div class="button-wrapper">
      <div class="button-header">Template Buttons</div>
      <div class="buttons">${e}</div>
    </div>`;
    }
    render() {
      let t = null;
      return (
        (t = this.translation
          ? this.renderComponents(this.translation.components)
          : j`<div class="error-message">
        No approved translation was found for current language.
      </div>`),
        j`
      <div>
        <temba-select
          searchable
          ?clearable=${!this.translating}
          ?disabled=${this.translating}
          valuekey="uuid"
          class="picker"
          value="${this.template}"
          endpoint="${this.url}?comps_as_list=true"
          shouldExclude=${t => 'approved' !== t.status}
          placeholder="Select a template"
          @temba-content-changed=${this.swallowEvent}
          @change=${this.handleTemplateChanged}
        >
        </temba-select>

        ${this.template ? j` <div class="template">${t}</div>` : null}
      </div>
    `
      );
    }
  }
  (Ih.shadowRootOptions = { ...lt.shadowRootOptions, delegatesFocus: !0 }),
    t([ge({ type: String })], Ih.prototype, 'url', void 0),
    t([ge({ type: String })], Ih.prototype, 'template', void 0),
    t([ge({ type: Object })], Ih.prototype, 'selectedTemplate', void 0),
    t([ge({ type: String })], Ih.prototype, 'lang', void 0),
    t([ge({ type: Array })], Ih.prototype, 'variables', void 0),
    t([ge({ type: Object, attribute: !1 })], Ih.prototype, 'translation', void 0),
    t([ge({ type: Boolean })], Ih.prototype, 'translating', void 0);
  /**
   * @license
   * Copyright 2020 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
  const { I: Nh } = rt,
    Bh = () => document.createComment(''),
    Rh = (t, e, i) => {
      const o = t._$AA.parentNode,
        n = void 0 === e ? t._$AB : e._$AA;
      if (void 0 === i) {
        const e = o.insertBefore(Bh(), n),
          s = o.insertBefore(Bh(), n);
        i = new Nh(e, s, t, t.options);
      } else {
        const e = i._$AB.nextSibling,
          s = i._$AM,
          r = s !== t;
        if (r) {
          let e;
          i._$AQ?.(t), (i._$AM = t), void 0 !== i._$AP && (e = t._$AU) !== s._$AU && i._$AP(e);
        }
        if (e !== n || r) {
          let t = i._$AA;
          for (; t !== e; ) {
            const e = t.nextSibling;
            o.insertBefore(t, n), (t = e);
          }
        }
      }
      return i;
    },
    qh = (t, e, i = t) => (t._$AI(e, i), t),
    Uh = {},
    Fh = t => {
      t._$AP?.(!1, !0);
      let e = t._$AA;
      const i = t._$AB.nextSibling;
      for (; e !== i; ) {
        const t = e.nextSibling;
        e.remove(), (e = t);
      }
    },
    Zh = (t, e, i) => {
      const o = new Map();
      for (let n = e; n <= i; n++) o.set(t[n], n);
      return o;
    },
    jh = we(
      class extends ke {
        constructor(t) {
          if ((super(t), t.type !== xe))
            throw Error('repeat() can only be used in text expressions');
        }
        dt(t, e, i) {
          let o;
          void 0 === i ? (i = e) : void 0 !== e && (o = e);
          const n = [],
            s = [];
          let r = 0;
          for (const e of t) (n[r] = o ? o(e, r) : r), (s[r] = i(e, r)), r++;
          return { values: s, keys: n };
        }
        render(t, e, i) {
          return this.dt(t, e, i).values;
        }
        update(t, [e, i, o]) {
          const n = (t => t._$AH)(t),
            { values: s, keys: r } = this.dt(e, i, o);
          if (!Array.isArray(n)) return (this.ut = r), s;
          const a = (this.ut ??= []),
            l = [];
          let h,
            c,
            d = 0,
            u = n.length - 1,
            p = 0,
            m = s.length - 1;
          for (; d <= u && p <= m; )
            if (null === n[d]) d++;
            else if (null === n[u]) u--;
            else if (a[d] === r[p]) (l[p] = qh(n[d], s[p])), d++, p++;
            else if (a[u] === r[m]) (l[m] = qh(n[u], s[m])), u--, m--;
            else if (a[d] === r[m]) (l[m] = qh(n[d], s[m])), Rh(t, l[m + 1], n[d]), d++, m--;
            else if (a[u] === r[p]) (l[p] = qh(n[u], s[p])), Rh(t, n[d], n[u]), u--, p++;
            else if ((void 0 === h && ((h = Zh(r, p, m)), (c = Zh(a, d, u))), h.has(a[d])))
              if (h.has(a[u])) {
                const e = c.get(r[p]),
                  i = void 0 !== e ? n[e] : null;
                if (null === i) {
                  const e = Rh(t, n[d]);
                  qh(e, s[p]), (l[p] = e);
                } else (l[p] = qh(i, s[p])), Rh(t, n[d], i), (n[e] = null);
                p++;
              } else Fh(n[u]), u--;
            else Fh(n[d]), d++;
          for (; p <= m; ) {
            const e = Rh(t, l[m + 1]);
            qh(e, s[p]), (l[p++] = e);
          }
          for (; d <= u; ) {
            const t = n[d++];
            null !== t && Fh(t);
          }
          return (
            (this.ut = r),
            ((t, e = Uh) => {
              t._$AH = e;
            })(t, l),
            H
          );
        }
      }
    );
  /**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */ class Hh extends ue {
    constructor() {
      super(...arguments),
        (this.messages = []),
        (this.staleDuration = 5e3),
        (this.animationDuration = 200),
        (this.errorSticky = !1),
        (this.warningSticky = !1),
        (this.infoSticky = !1),
        (this.messageId = 0);
    }
    checkForStaleMessages() {
      const t = new Date();
      this.messages
        .filter(
          t =>
            ('error' !== t.level || !this.errorSticky) &&
            (('warning' !== t.level || !this.warningSticky) &&
              ('info' !== t.level || !this.infoSticky))
        )
        .forEach(e => {
          t.getTime() - e.time.getTime() > this.staleDuration && this.removeMessage(e);
        }),
        0 === this.messages.length &&
          this.checker &&
          (window.clearInterval(this.checker), (this.checker = 0));
    }
    addMessages(t) {
      t.forEach(t => {
        this.addMessage(t.text, t.level);
      });
    }
    addMessage(t, e) {
      const i = { id: ++this.messageId, text: t, level: e, time: new Date() };
      this.messages.push(i),
        window.setTimeout(() => {
          (i.visible = !0), this.requestUpdate('messages');
        }, 100),
        this.requestUpdate('messages'),
        this.checker && (window.clearInterval(this.checker), (this.checker = 0)),
        (this.checker = window.setInterval(this.checkForStaleMessages.bind(this), 1e3));
    }
    info(t) {
      this.addMessage(t, 'info');
    }
    warning(t) {
      this.addMessage(t, 'warning');
    }
    error(t) {
      this.addMessage(t, 'error');
    }
    removeMessage(t) {
      (t.removeTime = new Date()),
        window.setTimeout(() => {
          (this.messages = this.messages.filter(e => e !== t)), this.requestUpdate('messages');
        }, this.animationDuration),
        this.requestUpdate('messages');
    }
    handleMessageClicked(t) {
      const e = t.target,
        i = parseInt(e.getAttribute('message_id')),
        o = this.messages.find(t => t.id === i);
      o && this.removeMessage(o);
    }
    render() {
      return j`
      ${jh(
        this.messages,
        t => t.id,
        t => j`
          <div
            style="transition-duration: ${this.animationDuration}ms"
            class="message ${t.level} ${t.visible ? 'visible' : ''} ${
          t.removeTime ? 'removing' : ''
        }"
          >
            <div class="text">${t.text}</div>
            <temba-icon
              name="close"
              size="1.3"
              message_id="${t.id}"
              @click=${this.handleMessageClicked}
            ></temba-icon>
          </div>
        `
      )}
    `;
    }
  }
  (Hh.styles = r`
    :host {
      position: fixed;
      width: 400px;
      z-index: 10000;
      right: 0;
    }

    .message {
      background-color: rgba(50, 50, 50, 0.85);
      background-color: rgba(255, 255, 255, 0.97);
      color: rgba(0, 0, 0, 0.85);
      padding: 0.5em 1em;
      margin: 0.75em;
      border-radius: 0.5em;
      display: flex;
      transition-property: transform, opacity;
      transition-timing-function: ease-in-out;
      transform: translateY(-100%);
      opacity: 0;
      box-shadow: rgba(0, 0, 0, 0.2) 0px 0px 3em 2px;
      border: 2px solid rgba(0, 0, 0, 0.3);
    }

    .message.visible {
      transform: translateY(0);
      opacity: 1;
    }

    .message.info {
    }

    .message.warning {
      color: rgba(255, 167, 0, 0.9);
    }

    .message.error {
      border-color: var(--color-error);
      color: var(--color-error);
    }

    .message.removing {
      opacity: 0;
      transform: translateY(-100%);
    }

    temba-icon {
      cursor: pointer;
      padding-left: 1em;
      opacity: 0;
      transition: all 200ms ease-in-out;
    }

    .message:hover temba-icon {
      opacity: 1;
    }

    temba-icon:hover {
      transform: scale(1.3) translateX(-0.1em);
    }

    .message .text {
      flex-grow: 1;
    }

    .info {
    }
  `),
    t([ge({ type: Array })], Hh.prototype, 'messages', void 0),
    t([ge({ type: Number, attribute: 'duration' })], Hh.prototype, 'staleDuration', void 0),
    t([ge({ type: Number, attribute: 'animation' })], Hh.prototype, 'animationDuration', void 0),
    t([ge({ type: Boolean, attribute: 'error-sticky' })], Hh.prototype, 'errorSticky', void 0),
    t([ge({ type: Boolean, attribute: 'warning-sticky' })], Hh.prototype, 'warningSticky', void 0),
    t([ge({ type: Boolean, attribute: 'info-sticky' })], Hh.prototype, 'infoSticky', void 0);
  const Vh = (t, e) => {
    if (e) {
      const i = e.split(',').map(t => t.trim());
      return i.includes(t) || i.includes(t.split('/')[0] + '/*');
    }
    return !0;
  };
  class Wh extends ue {
    constructor() {
      super(...arguments),
        (this.endpoint = Rt),
        (this.icon = ve.add),
        (this.accept = ''),
        (this.max = 3),
        (this.attachments = []);
    }
    static get styles() {
      return r`
      .drop-mask {
        border-radius: var(--curvature-widget);
        transition: opacity ease-in-out var(--transition-speed);
      }

      .highlight .drop-mask {
        background: rgba(210, 243, 184, 0.8);
      }

      .drop-mask > div {
        margin: auto;
        border-radius: var(--curvature-widget);
        font-weight: 400;
        color: rgba(0, 0, 0, 0.5);
      }

      .attachments {
      }

      .attachments-list {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        padding: 0.2em;
      }

      .attachment-item {
        padding: 0.4em;
        padding-top: 1em;
      }

      .attachment-item.error {
        background: #fff;
        color: rgba(250, 0, 0, 0.75);
        padding: 0.2em;
        margin: 0.3em 0.5em;
        border-radius: var(--curvature);
        display: block;
      }

      .remove-item {
        --icon-color: #ccc;
        background: #fff;
        border-radius: 99%;
        transition: transform 200ms linear;
        transform: scale(0);
        display: block;
        margin-bottom: -24px;
        margin-left: 10px;
        width: 1em;
        height: 1em;
      }

      .attachment-item:hover .remove-item {
        transform: scale(1);
      }

      .remove-item:hover {
        --icon-color: #333;
        cursor: pointer;
      }

      .attachment-name {
        align-self: center;
        font-size: 12px;
        padding: 2px 8px;
      }

      #upload-input {
        display: none;
      }

      .upload-label {
        display: flex;
        align-items: center;
      }

      .upload-icon {
        color: rgb(102, 102, 102);
      }

      .add-attachment {
        padding: 1em;
        background-color: rgba(0, 0, 0, 0.05);
        border-radius: var(--curvature);
        color: #aaa;
        margin: 0.5em;
      }

      .add-attachment:hover {
        background-color: rgba(0, 0, 0, 0.07);
        cursor: pointer;
      }
    `;
    }
    updated(t) {
      super.updated(t),
        t.has('attachments') &&
          setTimeout(() => {
            this.dispatchEvent(new Event('change'));
          }, 0);
    }
    getAcceptableFiles(t) {
      const e = t.dataTransfer;
      if (e) {
        return [...e.files].filter(t => Vh(t.type, this.accept));
      }
    }
    handleDragEnter(t) {
      this.highlight(t);
    }
    handleDragOver(t) {
      this.highlight(t);
    }
    handleDragLeave(t) {
      this.unhighlight(t);
    }
    handleDrop(t) {
      this.unhighlight(t),
        this.canAcceptAttachments() && this.uploadFiles(this.getAcceptableFiles(t));
    }
    canAcceptAttachments() {
      return this.attachments.length < this.max;
    }
    highlight(t) {
      t.preventDefault(),
        t.stopPropagation(),
        this.canAcceptAttachments() && (this.pendingDrop = !0);
    }
    unhighlight(t) {
      t.preventDefault(), t.stopPropagation(), (this.pendingDrop = !1);
    }
    addCurrentAttachment(t) {
      this.attachments.push(t), this.requestUpdate('attachments');
    }
    removeCurrentAttachment(t) {
      (this.attachments = this.attachments.filter(e => e !== t)), this.requestUpdate('attachments');
    }
    handleRemoveFileClicked(t) {
      const e = t.target,
        i = this.attachments.find(({ url: t }) => t === e.id);
      i && this.removeCurrentAttachment(i);
    }
    handleUploadFileInputChanged(t) {
      const e = t.target.files;
      this.uploadFiles([...e]);
    }
    uploadFiles(t) {
      let e = [];
      (e = t.filter(t => {
        if (this.accept && !Vh(t.type, this.accept)) return !1;
        return -1 === this.attachments.findIndex(e => e.filename === t.name && e.size === t.size)
          ? t
          : void 0;
      })),
        e.map(t => {
          this.uploadFile(t);
        });
    }
    uploadFile(t) {
      this.uploading = !0;
      const e = this.endpoint,
        i = new FormData();
      i.append('file', t),
        Jt(e, i)
          .then(t => {
            if (this.attachments.length < this.max) {
              const e = t.json;
              e && this.addCurrentAttachment(e);
            }
          })
          .catch(t => {
            let e = '';
            (e = 400 === t.status ? t.json.file[0] : 'Server failure'), console.error(e);
          })
          .finally(() => {
            this.uploading = !1;
          });
    }
    renderUploader() {
      return this.uploading
        ? j`<temba-loading units="3" size="12"></temba-loading>`
        : this.attachments.length < this.max
        ? j`<input
              type="file"
              id="upload-input"
              ?multiple=${this.max > 1}
              accept="${this.accept}"
              @change="${this.handleUploadFileInputChanged}"
            />
            <label
              id="upload-label"
              class="actions-left upload-label"
              for="upload-input"
            >
              <div class="add-attachment">
                <temba-icon name="${this.icon}" size="1.5"></temba-icon>
              </div>
            </label>`
        : null;
    }
    render() {
      return j` <div
      class=${Ht({ container: !0, highlight: this.pendingDrop })}
      @dragenter="${this.handleDragEnter}"
      @dragover="${this.handleDragOver}"
      @dragleave="${this.handleDragLeave}"
      @drop="${this.handleDrop}"
    >
      <div class="drop-mask">
        <div class="attachments-list">
          ${this.attachments.map(t => {
            return j`<div class="attachment-item">
              <temba-icon
                class="remove-item"
                @click="${this.handleRemoveFileClicked}"
                id="${t.url}"
                name="${ve.delete_small}"
              ></temba-icon>
              ${((e = t),
              e && 'image' === e.content_type.split('/')[0]
                ? j`<temba-thumbnail
                    url="${t.url}"
                  ></temba-thumbnail>`
                : j`<temba-thumbnail
                    label="${t.content_type.split('/')[1]}"
                  ></temba-thumbnail>`)}
            </div>`;
            var e;
          })}
          ${this.renderUploader()}
        </div>
      </div>
    </div>`;
    }
  }
  function Gh(t, e) {
    window.customElements.get(t) || window.customElements.define(t, e);
  }
  t([ge({ type: String, attribute: !1 })], Wh.prototype, 'endpoint', void 0),
    t([ge({ type: Boolean })], Wh.prototype, 'pendingDrop', void 0),
    t([ge({ type: String })], Wh.prototype, 'icon', void 0),
    t([ge({ type: String })], Wh.prototype, 'accept', void 0),
    t([ge({ type: Number })], Wh.prototype, 'max', void 0),
    t([ge({ type: Array })], Wh.prototype, 'attachments', void 0),
    t([ge({ type: Boolean, attribute: !1 })], Wh.prototype, 'uploading', void 0),
    Gh('temba-anchor', Fl),
    Gh('temba-alert', Ml),
    Gh('temba-store', rr),
    Gh('temba-textinput', Le),
    Gh('temba-datepicker', lh),
    Gh('temba-date', vh),
    Gh('temba-completion', Ka),
    Gh('temba-checkbox', be),
    Gh('temba-select', Qa),
    Gh('temba-options', ar),
    Gh('temba-loading', ol),
    Gh('temba-lightbox', xh),
    Gh('temba-button', el),
    Gh('temba-omnibox', Il),
    Gh('temba-tip', Rl),
    Gh('temba-contact-name', Wl),
    Gh('temba-contact-name-fetch', ah),
    Gh('temba-contact-field', Yl),
    Gh('temba-contact-fields', Ql),
    Gh('temba-field-manager', dh),
    Gh('temba-urn', Gl),
    Gh('temba-content-menu', gh),
    Gh('temba-field', il),
    Gh('temba-dialog', Xa),
    Gh('temba-modax', tl),
    Gh('temba-charcount', ul),
    Gh('temba-contact-history', Sl),
    Gh('temba-contact-chat', fl),
    Gh(
      'temba-contact-details',
      class extends gl {
        static get styles() {
          return r`
      .urn {
        display: flex;
        padding: 0.4em 1em 0.8em 1em;
        border-bottom: 1px solid #e6e6e6;
        margin-bottom: 0.5em;
      }

      .urn .path {
        margin-left: 0.2em;
      }

      .wrapper {
        padding-top: 0em;
      }

      .groups {
        padding: 0.4em 0.5em 0.6em 0.5em;
        border-bottom: 1px solid #e6e6e6;
        margin-bottom: 0.4em;
      }
      .group {
        margin-right: 0.7em;
        margin-bottom: 0.7em;
      }

      .label {
        font-size: 0.8em;
        color: rgb(136, 136, 136);
        margin-left: 0.5em;
        margin-bottom: 0.4em;
      }
    `;
        }
        render() {
          if (!this.data) return;
          const t = this.store.getLanguageName(this.data.language);
          return j`
      <div class="wrapper">
        ${
          this.data.groups.length > 0
            ? j` <div class="groups">
              <div class="label">Groups</div>
              ${this.data.groups.map(
                t => j`<temba-label
                  class="group"
                  onclick="goto(event)"
                  href="/contact/filter/${t.uuid}/"
                  icon=${t.is_dynamic ? ve.group_smart : ve.group}
                  clickable
                >
                  ${t.name}
                </temba-label>`
              )}
            </div>`
            : null
        }
        ${this.data.urns.map(t => {
          const e = t.split(':');
          let i = Ol[e[0]];
          return (
            i || (i = re(e[0])),
            j`<temba-contact-field
            name=${i}
            value=${e[1]}
            disabled
          ></temba-contact-field>`
          );
        })}

        <temba-contact-field
          name="Status"
          value=${$l[this.data.status]}
          disabled
        ></temba-contact-field>
        ${
          t
            ? j`<temba-contact-field
              name="Language"
              value=${t}
              disabled
            ></temba-contact-field>`
            : null
        }

        <temba-contact-field
          name="Created"
          value=${this.data.created_on}
          type="datetime"
          disabled
        ></temba-contact-field>
        <temba-contact-field
          name="Last Seen"
          value=${this.data.last_seen_on}
          type="datetime"
          disabled
        ></temba-contact-field>
      </div>
    `;
        }
      }
    ),
    Gh('temba-ticket-list', Tl),
    Gh(
      'temba-notification-list',
      class extends El {
        static get styles() {
          return r`
      :host {
        --option-hover-bg: #f9f9f9;
      }

      .header {
        padding: 0.25em 1em;
        background: #f9f9f9;
        border-top-left-radius: var(--curvature);
        border-top-right-radius: var(--curvature);
        display: flex;
        color: #999;
        border-bottom: 1px solid #f3f3f3;
      }

      .header temba-icon {
        margin-right: 0.35em;
      }

      .footer {
        background: #f9f9f9;
      }

      .title {
        font-weight: normal;
      }
    `;
        }
        constructor() {
          super(),
            (this.reverseRefresh = !1),
            (this.internalFocusDisabled = !0),
            (this.valueKey = 'target_url'),
            (this.renderOption = t => {
              let e = null,
                i = null;
              return (
                'incident:started' === t.type
                  ? 'org:flagged' === t.incident.type
                    ? ((e = ve.incidents),
                      (i = 'Your workspace was flagged, please contact support for assistance.'))
                    : 'org:suspended' === t.incident.type
                    ? ((e = ve.incidents),
                      (i = 'Your workspace was suspended, please contact support for assistance.'))
                    : 'channel:disconnected' === t.incident.type
                    ? ((e = ve.channel), (i = 'Your android channel is not connected'))
                    : 'channel:templates_failed' === t.incident.type
                    ? ((e = ve.channel), (i = 'Your WhatsApp channel templates failed syncing'))
                    : 'webhooks:unhealthy' === t.incident.type &&
                      ((e = ve.webhook), (i = 'Your webhook calls are not working properly.'))
                  : 'import:finished' === t.type
                  ? 'contact' === t.import.type &&
                    ((e = ve.contact_import),
                    (i = `Imported ${t.import.num_records.toLocaleString()} contacts`))
                  : 'export:finished' === t.type
                  ? 'contact' === t.export.type
                    ? ((e = ve.contact_export),
                      (i = `Exported ${t.export.num_records.toLocaleString()} contacts`))
                    : 'message' === t.export.type
                    ? ((e = ve.message_export),
                      (i = `Exported ${t.export.num_records.toLocaleString()} messages`))
                    : 'results' === t.export.type
                    ? ((e = ve.results_export), (i = 'Exported flow results'))
                    : 'ticket' === t.export.type
                    ? ((e = ve.tickets_export),
                      (i = `Exported ${t.export.num_records.toLocaleString()} tickets`))
                    : 'definition' === t.export.type &&
                      ((e = ve.definitions_export), (i = 'Exported definitions'))
                  : 'tickets:activity' === t.type
                  ? ((e = ve.tickets), (i = 'New ticket activity'))
                  : 'tickets:opened' === t.type &&
                    ((e = ve.tickets), (i = 'New unassigned ticket')),
                j`<div
        style="color:${'#333'};display:flex;align-items:flex-start;flex-direction:row;font-weight:${
                  t.is_seen ? 400 : 500
                }"
      >
        ${
          e
            ? j`<div style="margin-right:0.6em">
              <temba-icon name="${e}"></temba-icon>
            </div>`
            : null
        }
        <div style="display:flex;flex-direction:column">
          <div style="line-height:1.1em">${i}</div>
          <temba-date
            style="font-size:80%"
            value=${t.created_on}
            display="duration"
          ></temba-date>
        </div>
      </div>`
              );
            });
        }
        renderHeader() {
          return j`<div class="header">
      <temba-icon name="notification"></temba-icon>
      <div class="title">Notifications</div>
    </div>`;
        }
        handleSelection(t) {
          super.handleSelected(t);
        }
        scrollToTop() {
          window.setTimeout(() => {
            this.shadowRoot.querySelector('temba-options').scrollToTop();
          }, 1e3);
        }
      }
    ),
    Gh('temba-list', El),
    Gh('temba-sortable-list', uh),
    Gh('temba-run-list', sh),
    Gh('temba-flow-details', rh),
    Gh('temba-label', Vl),
    Gh('temba-menu', Ul),
    Gh('temba-remote', yh),
    Gh('temba-contact-search', Ll),
    Gh('temba-icon', zl),
    Gh('temba-dropdown', Zl),
    Gh('temba-tabs', jl),
    Gh('temba-tab', Hl),
    Gh('temba-contact-badges', Xl),
    Gh('temba-contact-pending', eh),
    Gh('temba-contact-tickets', ih),
    Gh('temba-slider', oh),
    Gh('temba-content-menu', gh),
    Gh('temba-compose', _h),
    Gh('temba-color-picker', wh),
    Gh('temba-resizer', kh),
    Gh('temba-thumbnail', Ah),
    Gh('temba-webchat', Mh),
    Gh('temba-image-picker', zh),
    Gh('temba-mask', Ph),
    Gh('temba-user', Dh),
    Gh('temba-template-editor', Ih),
    Gh('temba-toast', Hh),
    Gh('temba-media-picker', Wh);
  class Qh extends lt {
    static get styles() {
      return r`
      :host {
        line-height: normal;
      }

      temba-textinput {
        height: 150px;
      }

      #left-column {
        display: inline-block;
        margin-left: 10px;
        width: 300px;
        z-index: 100;
      }

      .search {
        margin-bottom: 10px;
      }

      .feature {
        padding: 4px 14px;
        font-size: 16px;
      }

      .level-0 {
        margin-left: 0px;
      }

      .level-1 {
        margin-left: 5px;
        font-size: 95%;
      }

      .level-2 {
        margin-left: 10px;
        font-size: 90%;
      }

      .level-3 {
        margin-left: 15px;
        font-size: 85%;
      }

      .feature-name {
        display: inline-block;
      }

      .clickable {
        text-decoration: none;
        cursor: pointer;
        color: var(--color-link-primary);
      }

      .clickable.secondary {
        color: var(--color-link-secondary);
      }

      .clickable:hover {
        text-decoration: underline;
        color: var(--color-link-primary-hover);
      }

      .feature:hover .showonhover {
        visibility: visible;
      }

      .showonhover {
        visibility: hidden;
      }

      .aliases {
        color: #bbb;
        font-size: 80%;
        display: inline;
        margin-left: 5px;
      }

      temba-label {
        margin-right: 3px;
        margin-bottom: 3px;
        vertical-align: top;
      }

      .selected {
        display: flex;
        flex-direction: column;
        padding: 15px;
        padding-bottom: 40px;
      }

      .selected .name {
        font-size: 18px;
        padding: 5px;
      }

      .selected .help {
        padding: 5px 2px;
        font-size: 11px;
        color: var(--color-secondary-light);
      }

      #right-column {
        vertical-align: top;
        margin-left: 20px;
        display: inline-block;
      }

      leaflet-map {
        height: 600px;
        width: 800px;
        border: 0px solid #999;
        border-radius: var(--curvature);
      }

      .edit {
        display: inline-block;
        margin-right: 0px;
      }
    `;
    }
    constructor() {
      super(), (this.path = []);
    }
    updated(t) {
      if (t.has('osmId')) {
        const t = [];
        for (const e of this.path)
          if ((t.push(e), e.osm_id === this.osmId))
            return (this.path = [...t]), void this.hideAliasDialog();
        this.fetchFeature();
      }
    }
    fetchFeature() {
      jt(this.getEndpoint() + 'boundaries/' + this.osmId + '/').then(t => {
        (this.path = t.json), this.hideAliasDialog();
      });
    }
    handleMapClicked(t) {
      (this.hovered = null), (t && t.osm_id === this.osmId) || (this.osmId = t.osm_id);
    }
    handlePlaceClicked(t) {
      this.osmId = t.osm_id;
    }
    handleSearchSelection(t) {
      const e = t.detail.selected;
      this.showAliasDialog(e);
      this.shadowRoot.querySelector('temba-select').clear();
    }
    isMatch(t, e) {
      return `${t.name} ${t.aliases}`.toLowerCase().indexOf(e) > -1;
    }
    renderFeature(t, e) {
      const i = this.path[this.path.length - 1],
        o = (t.has_children || 0 === t.level) && t !== i,
        n = j`
      <div class="feature">
        <div
          @mouseover=${() => {
            t.level > 0 && (this.hovered = t);
          }}
          @mouseout=${() => {
            this.hovered = null;
          }}
          class="level-${t.level}"
        >
          <div
            class="feature-name ${o ? 'clickable' : ''}"
            @click=${() => {
              o && this.handlePlaceClicked(t);
            }}
          >
            ${t.name}
          </div>

          <div class="aliases">
            ${t.aliases.split('\n').map(e =>
              e.trim().length > 0
                ? j`
                    <temba-label
                      class="alias"
                      @click=${() => {
                        this.showAliasDialog(t);
                      }}
                      light
                      clickable
                      >${e}</temba-label
                    >
                  `
                : null
            )}
            ${
              t.level > 0
                ? j`
                  <div
                    class="edit clickable showonhover"
                    @click=${e => {
                      this.showAliasDialog(t), e.preventDefault(), e.stopPropagation();
                    }}
                  >
                    <temba-icon name="${ve.updated}" />
                  </div>
                `
                : ''
            }
          </div>
        </div>
      </div>
    `,
        s = (t.children || []).map(t =>
          e.length > 0 && e[0].osm_id === t.osm_id
            ? this.renderFeature(e[0], e.slice(1))
            : 0 === e.length || 0 === e[0].children.length
            ? this.renderFeature(t, e)
            : null
        );
      return j` ${n} ${s} `;
    }
    showAliasDialog(t) {
      (this.editFeatureAliases = t.aliases), (this.editFeature = t);
      const e = this.shadowRoot.getElementById('alias-dialog');
      e && e.setAttribute('open', '');
    }
    hideAliasDialog() {
      const t = this.shadowRoot.getElementById('alias-dialog');
      (this.editFeature = null),
        (this.editFeatureAliases = null),
        t && t.removeAttribute('open'),
        this.requestUpdate();
    }
    getEndpoint() {
      return this.endpoint + (this.endpoint.endsWith('/') ? '' : '/');
    }
    handleDialogClick(t) {
      const e = t.detail.button;
      if ('Save' === e.name) {
        const t = this.shadowRoot.getElementById(this.editFeature.osm_id).inputElement.value,
          e = { osm_id: this.editFeature.osm_id, aliases: t };
        Yt(this.getEndpoint() + 'boundaries/' + this.editFeature.osm_id + '/', e).then(() => {
          this.fetchFeature();
        });
      }
      'Cancel' === e.name && this.hideAliasDialog();
    }
    getOptions(t) {
      return t.json.filter(t => t.level > 0);
    }
    getOptionsComplete(t) {
      return 0 === t.length;
    }
    renderOptionDetail(t) {
      const e = { marginTop: '3px', marginRight: '3px' },
        i = t.aliases.split('\n').map(t =>
          t.trim().length > 0
            ? j`
            <temba-label style=${Se(e)} class="alias" dark
              >${t}</temba-label
            >
          `
            : null
        );
      return j`
      <div class="path">${t.path.replace(/>/gi, '‣')}</div>
      <div class="aliases">${i}</div>
    `;
    }
    render() {
      if (0 === this.path.length) return j``;
      const t = this.path[this.path.length - 1],
        e = 0 === t.children.length ? this.path[this.path.length - 2] : t,
        i = this.editFeature ? this.editFeature.osm_id : null,
        o = this.editFeature ? this.editFeature.name : null;
      return j`
      <div id="left-column">
        <div class="search">
          <temba-select
            placeholder="Search"
            endpoint="${this.getEndpoint()}boundaries/${this.path[0].osm_id}/?"
            .renderOptionDetail=${this.renderOptionDetail}
            .getOptions=${this.getOptions}
            .isComplete=${this.getOptionsComplete}
            .isMatch=${this.isMatch}
            @temba-selection=${this.handleSearchSelection.bind(this)}
            queryParam="q"
            searchable
          ></temba-select>
        </div>
        <div class="feature-tree">
          ${this.renderFeature(this.path[0], this.path.slice(1))}
        </div>
      </div>

      <div id="right-column">
        <leaflet-map
          endpoint=${this.getEndpoint()}
          .feature=${e}
          .osmId=${e.osm_id}
          .hovered=${this.hovered}
          .onFeatureClicked=${this.handleMapClicked.bind(this)}
        >
        </leaflet-map>
      </div>

      <temba-dialog
        id="alias-dialog"
        header="Aliases for ${o}"
        primaryButtonName="Save"
        @temba-button-clicked=${this.handleDialogClick.bind(this)}
      >
        <div class="selected">
          <temba-textinput
            .helpText="Enter other aliases for ${o}, one per line"
            name="aliases"
            id=${i}
            .value=${this.editFeatureAliases}
            textarea
          ></temba-textinput>
        </div>
      </temba-dialog>
    `;
    }
  }
  t([ge({ type: Array, attribute: !1 })], Qh.prototype, 'path', void 0),
    t([ge()], Qh.prototype, 'endpoint', void 0),
    t([ge()], Qh.prototype, 'osmId', void 0),
    t([ge({ type: Object })], Qh.prototype, 'hovered', void 0),
    t([ge({ type: Object })], Qh.prototype, 'editFeature', void 0),
    t([ge({ type: String, attribute: !1 })], Qh.prototype, 'editFeatureAliases', void 0);
  'undefined' != typeof globalThis
    ? globalThis
    : 'undefined' != typeof window
    ? window
    : 'undefined' != typeof global
    ? global
    : 'undefined' != typeof self && self;
  var Kh = { exports: {} };
  (function(t) {
    var e = '1.5.1+build.2e3e0ffb',
      i = Object.freeze;
    function o(t) {
      var e, i, o, n;
      for (i = 1, o = arguments.length; i < o; i++) for (e in (n = arguments[i])) t[e] = n[e];
      return t;
    }
    Object.freeze = function(t) {
      return t;
    };
    var n =
      Object.create ||
      (function() {
        function t() {}
        return function(e) {
          return (t.prototype = e), new t();
        };
      })();
    function s(t, e) {
      var i = Array.prototype.slice;
      if (t.bind) return t.bind.apply(t, i.call(arguments, 1));
      var o = i.call(arguments, 2);
      return function() {
        return t.apply(e, o.length ? o.concat(i.call(arguments)) : arguments);
      };
    }
    var r = 0;
    function a(t) {
      return (t._leaflet_id = t._leaflet_id || ++r), t._leaflet_id;
    }
    function l(t, e, i) {
      var o, n, s, r;
      return (
        (r = function() {
          (o = !1), n && (s.apply(i, n), (n = !1));
        }),
        (s = function() {
          o ? (n = arguments) : (t.apply(i, arguments), setTimeout(r, e), (o = !0));
        }),
        s
      );
    }
    function h(t, e, i) {
      var o = e[1],
        n = e[0],
        s = o - n;
      return t === o && i ? t : ((((t - n) % s) + s) % s) + n;
    }
    function c() {
      return !1;
    }
    function d(t, e) {
      return (e = void 0 === e ? 6 : e), +(Math.round(t + 'e+' + e) + 'e-' + e);
    }
    function u(t) {
      return t.trim ? t.trim() : t.replace(/^\s+|\s+$/g, '');
    }
    function p(t) {
      return u(t).split(/\s+/);
    }
    function m(t, e) {
      for (var i in (t.hasOwnProperty('options') || (t.options = t.options ? n(t.options) : {}), e))
        t.options[i] = e[i];
      return t.options;
    }
    function g(t, e, i) {
      var o = [];
      for (var n in t)
        o.push(encodeURIComponent(i ? n.toUpperCase() : n) + '=' + encodeURIComponent(t[n]));
      return (e && -1 !== e.indexOf('?') ? '&' : '?') + o.join('&');
    }
    var f = /\{ *([\w_-]+) *\}/g;
    function v(t, e) {
      return t.replace(f, function(t, i) {
        var o = e[i];
        if (void 0 === o) throw new Error('No value provided for variable ' + t);
        return 'function' == typeof o && (o = o(e)), o;
      });
    }
    var b =
      Array.isArray ||
      function(t) {
        return '[object Array]' === Object.prototype.toString.call(t);
      };
    function y(t, e) {
      for (var i = 0; i < t.length; i++) if (t[i] === e) return i;
      return -1;
    }
    var _ = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
    function x(t) {
      return window['webkit' + t] || window['moz' + t] || window['ms' + t];
    }
    var w = 0;
    function k(t) {
      var e = +new Date(),
        i = Math.max(0, 16 - (e - w));
      return (w = e + i), window.setTimeout(t, i);
    }
    var A = window.requestAnimationFrame || x('RequestAnimationFrame') || k,
      C =
        window.cancelAnimationFrame ||
        x('CancelAnimationFrame') ||
        x('CancelRequestAnimationFrame') ||
        function(t) {
          window.clearTimeout(t);
        };
    function S(t, e, i) {
      if (!i || A !== k) return A.call(window, s(t, e));
      t.call(e);
    }
    function E(t) {
      t && C.call(window, t);
    }
    var T = (Object.freeze || Object)({
      freeze: i,
      extend: o,
      create: n,
      bind: s,
      lastId: r,
      stamp: a,
      throttle: l,
      wrapNum: h,
      falseFn: c,
      formatNum: d,
      trim: u,
      splitWords: p,
      setOptions: m,
      getParamString: g,
      template: v,
      isArray: b,
      indexOf: y,
      emptyImageUrl: _,
      requestFn: A,
      cancelFn: C,
      requestAnimFrame: S,
      cancelAnimFrame: E
    });
    function $() {}
    function O(t) {
      if ('undefined' != typeof L && L && L.Mixin) {
        t = b(t) ? t : [t];
        for (var e = 0; e < t.length; e++)
          t[e] === L.Mixin.Events &&
            console.warn(
              'Deprecated include of L.Mixin.Events: this property will be removed in future releases, please inherit from L.Evented instead.',
              new Error().stack
            );
      }
    }
    ($.extend = function(t) {
      var e = function() {
          this.initialize && this.initialize.apply(this, arguments), this.callInitHooks();
        },
        i = (e.__super__ = this.prototype),
        s = n(i);
      for (var r in ((s.constructor = e), (e.prototype = s), this))
        this.hasOwnProperty(r) && 'prototype' !== r && '__super__' !== r && (e[r] = this[r]);
      return (
        t.statics && (o(e, t.statics), delete t.statics),
        t.includes && (O(t.includes), o.apply(null, [s].concat(t.includes)), delete t.includes),
        s.options && (t.options = o(n(s.options), t.options)),
        o(s, t),
        (s._initHooks = []),
        (s.callInitHooks = function() {
          if (!this._initHooksCalled) {
            i.callInitHooks && i.callInitHooks.call(this), (this._initHooksCalled = !0);
            for (var t = 0, e = s._initHooks.length; t < e; t++) s._initHooks[t].call(this);
          }
        }),
        e
      );
    }),
      ($.include = function(t) {
        return o(this.prototype, t), this;
      }),
      ($.mergeOptions = function(t) {
        return o(this.prototype.options, t), this;
      }),
      ($.addInitHook = function(t) {
        var e = Array.prototype.slice.call(arguments, 1),
          i =
            'function' == typeof t
              ? t
              : function() {
                  this[t].apply(this, e);
                };
        return (
          (this.prototype._initHooks = this.prototype._initHooks || []),
          this.prototype._initHooks.push(i),
          this
        );
      });
    var M = {
      on: function(t, e, i) {
        if ('object' == typeof t) for (var o in t) this._on(o, t[o], e);
        else for (var n = 0, s = (t = p(t)).length; n < s; n++) this._on(t[n], e, i);
        return this;
      },
      off: function(t, e, i) {
        if (t)
          if ('object' == typeof t) for (var o in t) this._off(o, t[o], e);
          else for (var n = 0, s = (t = p(t)).length; n < s; n++) this._off(t[n], e, i);
        else delete this._events;
        return this;
      },
      _on: function(t, e, i) {
        this._events = this._events || {};
        var o = this._events[t];
        o || ((o = []), (this._events[t] = o)), i === this && (i = void 0);
        for (var n = { fn: e, ctx: i }, s = o, r = 0, a = s.length; r < a; r++)
          if (s[r].fn === e && s[r].ctx === i) return;
        s.push(n);
      },
      _off: function(t, e, i) {
        var o, n, s;
        if (this._events && (o = this._events[t]))
          if (e) {
            if ((i === this && (i = void 0), o))
              for (n = 0, s = o.length; n < s; n++) {
                var r = o[n];
                if (r.ctx === i && r.fn === e)
                  return (
                    (r.fn = c),
                    this._firingCount && (this._events[t] = o = o.slice()),
                    void o.splice(n, 1)
                  );
              }
          } else {
            for (n = 0, s = o.length; n < s; n++) o[n].fn = c;
            delete this._events[t];
          }
      },
      fire: function(t, e, i) {
        if (!this.listens(t, i)) return this;
        var n = o({}, e, { type: t, target: this, sourceTarget: (e && e.sourceTarget) || this });
        if (this._events) {
          var s = this._events[t];
          if (s) {
            this._firingCount = this._firingCount + 1 || 1;
            for (var r = 0, a = s.length; r < a; r++) {
              var l = s[r];
              l.fn.call(l.ctx || this, n);
            }
            this._firingCount--;
          }
        }
        return i && this._propagateEvent(n), this;
      },
      listens: function(t, e) {
        var i = this._events && this._events[t];
        if (i && i.length) return !0;
        if (e) for (var o in this._eventParents) if (this._eventParents[o].listens(t, e)) return !0;
        return !1;
      },
      once: function(t, e, i) {
        if ('object' == typeof t) {
          for (var o in t) this.once(o, t[o], e);
          return this;
        }
        var n = s(function() {
          this.off(t, e, i).off(t, n, i);
        }, this);
        return this.on(t, e, i).on(t, n, i);
      },
      addEventParent: function(t) {
        return (
          (this._eventParents = this._eventParents || {}), (this._eventParents[a(t)] = t), this
        );
      },
      removeEventParent: function(t) {
        return this._eventParents && delete this._eventParents[a(t)], this;
      },
      _propagateEvent: function(t) {
        for (var e in this._eventParents)
          this._eventParents[e].fire(
            t.type,
            o({ layer: t.target, propagatedFrom: t.target }, t),
            !0
          );
      }
    };
    (M.addEventListener = M.on),
      (M.removeEventListener = M.clearAllEventListeners = M.off),
      (M.addOneTimeEventListener = M.once),
      (M.fireEvent = M.fire),
      (M.hasEventListeners = M.listens);
    var z = $.extend(M);
    function P(t, e, i) {
      (this.x = i ? Math.round(t) : t), (this.y = i ? Math.round(e) : e);
    }
    var D =
      Math.trunc ||
      function(t) {
        return t > 0 ? Math.floor(t) : Math.ceil(t);
      };
    function I(t, e, i) {
      return t instanceof P
        ? t
        : b(t)
        ? new P(t[0], t[1])
        : null == t
        ? t
        : 'object' == typeof t && 'x' in t && 'y' in t
        ? new P(t.x, t.y)
        : new P(t, e, i);
    }
    function N(t, e) {
      if (t) for (var i = e ? [t, e] : t, o = 0, n = i.length; o < n; o++) this.extend(i[o]);
    }
    function B(t, e) {
      return !t || t instanceof N ? t : new N(t, e);
    }
    function R(t, e) {
      if (t) for (var i = e ? [t, e] : t, o = 0, n = i.length; o < n; o++) this.extend(i[o]);
    }
    function q(t, e) {
      return t instanceof R ? t : new R(t, e);
    }
    function U(t, e, i) {
      if (isNaN(t) || isNaN(e)) throw new Error('Invalid LatLng object: (' + t + ', ' + e + ')');
      (this.lat = +t), (this.lng = +e), void 0 !== i && (this.alt = +i);
    }
    function F(t, e, i) {
      return t instanceof U
        ? t
        : b(t) && 'object' != typeof t[0]
        ? 3 === t.length
          ? new U(t[0], t[1], t[2])
          : 2 === t.length
          ? new U(t[0], t[1])
          : null
        : null == t
        ? t
        : 'object' == typeof t && 'lat' in t
        ? new U(t.lat, 'lng' in t ? t.lng : t.lon, t.alt)
        : void 0 === e
        ? null
        : new U(t, e, i);
    }
    (P.prototype = {
      clone: function() {
        return new P(this.x, this.y);
      },
      add: function(t) {
        return this.clone()._add(I(t));
      },
      _add: function(t) {
        return (this.x += t.x), (this.y += t.y), this;
      },
      subtract: function(t) {
        return this.clone()._subtract(I(t));
      },
      _subtract: function(t) {
        return (this.x -= t.x), (this.y -= t.y), this;
      },
      divideBy: function(t) {
        return this.clone()._divideBy(t);
      },
      _divideBy: function(t) {
        return (this.x /= t), (this.y /= t), this;
      },
      multiplyBy: function(t) {
        return this.clone()._multiplyBy(t);
      },
      _multiplyBy: function(t) {
        return (this.x *= t), (this.y *= t), this;
      },
      scaleBy: function(t) {
        return new P(this.x * t.x, this.y * t.y);
      },
      unscaleBy: function(t) {
        return new P(this.x / t.x, this.y / t.y);
      },
      round: function() {
        return this.clone()._round();
      },
      _round: function() {
        return (this.x = Math.round(this.x)), (this.y = Math.round(this.y)), this;
      },
      floor: function() {
        return this.clone()._floor();
      },
      _floor: function() {
        return (this.x = Math.floor(this.x)), (this.y = Math.floor(this.y)), this;
      },
      ceil: function() {
        return this.clone()._ceil();
      },
      _ceil: function() {
        return (this.x = Math.ceil(this.x)), (this.y = Math.ceil(this.y)), this;
      },
      trunc: function() {
        return this.clone()._trunc();
      },
      _trunc: function() {
        return (this.x = D(this.x)), (this.y = D(this.y)), this;
      },
      distanceTo: function(t) {
        var e = (t = I(t)).x - this.x,
          i = t.y - this.y;
        return Math.sqrt(e * e + i * i);
      },
      equals: function(t) {
        return (t = I(t)).x === this.x && t.y === this.y;
      },
      contains: function(t) {
        return (t = I(t)), Math.abs(t.x) <= Math.abs(this.x) && Math.abs(t.y) <= Math.abs(this.y);
      },
      toString: function() {
        return 'Point(' + d(this.x) + ', ' + d(this.y) + ')';
      }
    }),
      (N.prototype = {
        extend: function(t) {
          return (
            (t = I(t)),
            this.min || this.max
              ? ((this.min.x = Math.min(t.x, this.min.x)),
                (this.max.x = Math.max(t.x, this.max.x)),
                (this.min.y = Math.min(t.y, this.min.y)),
                (this.max.y = Math.max(t.y, this.max.y)))
              : ((this.min = t.clone()), (this.max = t.clone())),
            this
          );
        },
        getCenter: function(t) {
          return new P((this.min.x + this.max.x) / 2, (this.min.y + this.max.y) / 2, t);
        },
        getBottomLeft: function() {
          return new P(this.min.x, this.max.y);
        },
        getTopRight: function() {
          return new P(this.max.x, this.min.y);
        },
        getTopLeft: function() {
          return this.min;
        },
        getBottomRight: function() {
          return this.max;
        },
        getSize: function() {
          return this.max.subtract(this.min);
        },
        contains: function(t) {
          var e, i;
          return (
            (t = 'number' == typeof t[0] || t instanceof P ? I(t) : B(t)) instanceof N
              ? ((e = t.min), (i = t.max))
              : (e = i = t),
            e.x >= this.min.x && i.x <= this.max.x && e.y >= this.min.y && i.y <= this.max.y
          );
        },
        intersects: function(t) {
          t = B(t);
          var e = this.min,
            i = this.max,
            o = t.min,
            n = t.max,
            s = n.x >= e.x && o.x <= i.x,
            r = n.y >= e.y && o.y <= i.y;
          return s && r;
        },
        overlaps: function(t) {
          t = B(t);
          var e = this.min,
            i = this.max,
            o = t.min,
            n = t.max,
            s = n.x > e.x && o.x < i.x,
            r = n.y > e.y && o.y < i.y;
          return s && r;
        },
        isValid: function() {
          return !(!this.min || !this.max);
        }
      }),
      (R.prototype = {
        extend: function(t) {
          var e,
            i,
            o = this._southWest,
            n = this._northEast;
          if (t instanceof U) (e = t), (i = t);
          else {
            if (!(t instanceof R)) return t ? this.extend(F(t) || q(t)) : this;
            if (((e = t._southWest), (i = t._northEast), !e || !i)) return this;
          }
          return (
            o || n
              ? ((o.lat = Math.min(e.lat, o.lat)),
                (o.lng = Math.min(e.lng, o.lng)),
                (n.lat = Math.max(i.lat, n.lat)),
                (n.lng = Math.max(i.lng, n.lng)))
              : ((this._southWest = new U(e.lat, e.lng)), (this._northEast = new U(i.lat, i.lng))),
            this
          );
        },
        pad: function(t) {
          var e = this._southWest,
            i = this._northEast,
            o = Math.abs(e.lat - i.lat) * t,
            n = Math.abs(e.lng - i.lng) * t;
          return new R(new U(e.lat - o, e.lng - n), new U(i.lat + o, i.lng + n));
        },
        getCenter: function() {
          return new U(
            (this._southWest.lat + this._northEast.lat) / 2,
            (this._southWest.lng + this._northEast.lng) / 2
          );
        },
        getSouthWest: function() {
          return this._southWest;
        },
        getNorthEast: function() {
          return this._northEast;
        },
        getNorthWest: function() {
          return new U(this.getNorth(), this.getWest());
        },
        getSouthEast: function() {
          return new U(this.getSouth(), this.getEast());
        },
        getWest: function() {
          return this._southWest.lng;
        },
        getSouth: function() {
          return this._southWest.lat;
        },
        getEast: function() {
          return this._northEast.lng;
        },
        getNorth: function() {
          return this._northEast.lat;
        },
        contains: function(t) {
          t = 'number' == typeof t[0] || t instanceof U || 'lat' in t ? F(t) : q(t);
          var e,
            i,
            o = this._southWest,
            n = this._northEast;
          return (
            t instanceof R ? ((e = t.getSouthWest()), (i = t.getNorthEast())) : (e = i = t),
            e.lat >= o.lat && i.lat <= n.lat && e.lng >= o.lng && i.lng <= n.lng
          );
        },
        intersects: function(t) {
          t = q(t);
          var e = this._southWest,
            i = this._northEast,
            o = t.getSouthWest(),
            n = t.getNorthEast(),
            s = n.lat >= e.lat && o.lat <= i.lat,
            r = n.lng >= e.lng && o.lng <= i.lng;
          return s && r;
        },
        overlaps: function(t) {
          t = q(t);
          var e = this._southWest,
            i = this._northEast,
            o = t.getSouthWest(),
            n = t.getNorthEast(),
            s = n.lat > e.lat && o.lat < i.lat,
            r = n.lng > e.lng && o.lng < i.lng;
          return s && r;
        },
        toBBoxString: function() {
          return [this.getWest(), this.getSouth(), this.getEast(), this.getNorth()].join(',');
        },
        equals: function(t, e) {
          return (
            !!t &&
            ((t = q(t)),
            this._southWest.equals(t.getSouthWest(), e) &&
              this._northEast.equals(t.getNorthEast(), e))
          );
        },
        isValid: function() {
          return !(!this._southWest || !this._northEast);
        }
      }),
      (U.prototype = {
        equals: function(t, e) {
          return (
            !!t &&
            ((t = F(t)),
            Math.max(Math.abs(this.lat - t.lat), Math.abs(this.lng - t.lng)) <=
              (void 0 === e ? 1e-9 : e))
          );
        },
        toString: function(t) {
          return 'LatLng(' + d(this.lat, t) + ', ' + d(this.lng, t) + ')';
        },
        distanceTo: function(t) {
          return j.distance(this, F(t));
        },
        wrap: function() {
          return j.wrapLatLng(this);
        },
        toBounds: function(t) {
          var e = (180 * t) / 40075017,
            i = e / Math.cos((Math.PI / 180) * this.lat);
          return q([this.lat - e, this.lng - i], [this.lat + e, this.lng + i]);
        },
        clone: function() {
          return new U(this.lat, this.lng, this.alt);
        }
      });
    var Z = {
        latLngToPoint: function(t, e) {
          var i = this.projection.project(t),
            o = this.scale(e);
          return this.transformation._transform(i, o);
        },
        pointToLatLng: function(t, e) {
          var i = this.scale(e),
            o = this.transformation.untransform(t, i);
          return this.projection.unproject(o);
        },
        project: function(t) {
          return this.projection.project(t);
        },
        unproject: function(t) {
          return this.projection.unproject(t);
        },
        scale: function(t) {
          return 256 * Math.pow(2, t);
        },
        zoom: function(t) {
          return Math.log(t / 256) / Math.LN2;
        },
        getProjectedBounds: function(t) {
          if (this.infinite) return null;
          var e = this.projection.bounds,
            i = this.scale(t);
          return new N(
            this.transformation.transform(e.min, i),
            this.transformation.transform(e.max, i)
          );
        },
        infinite: !1,
        wrapLatLng: function(t) {
          var e = this.wrapLng ? h(t.lng, this.wrapLng, !0) : t.lng;
          return new U(this.wrapLat ? h(t.lat, this.wrapLat, !0) : t.lat, e, t.alt);
        },
        wrapLatLngBounds: function(t) {
          var e = t.getCenter(),
            i = this.wrapLatLng(e),
            o = e.lat - i.lat,
            n = e.lng - i.lng;
          if (0 === o && 0 === n) return t;
          var s = t.getSouthWest(),
            r = t.getNorthEast();
          return new R(new U(s.lat - o, s.lng - n), new U(r.lat - o, r.lng - n));
        }
      },
      j = o({}, Z, {
        wrapLng: [-180, 180],
        R: 6371e3,
        distance: function(t, e) {
          var i = Math.PI / 180,
            o = t.lat * i,
            n = e.lat * i,
            s = Math.sin(((e.lat - t.lat) * i) / 2),
            r = Math.sin(((e.lng - t.lng) * i) / 2),
            a = s * s + Math.cos(o) * Math.cos(n) * r * r,
            l = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          return this.R * l;
        }
      }),
      H = 6378137,
      V = {
        R: H,
        MAX_LATITUDE: 85.0511287798,
        project: function(t) {
          var e = Math.PI / 180,
            i = this.MAX_LATITUDE,
            o = Math.max(Math.min(i, t.lat), -i),
            n = Math.sin(o * e);
          return new P(this.R * t.lng * e, (this.R * Math.log((1 + n) / (1 - n))) / 2);
        },
        unproject: function(t) {
          var e = 180 / Math.PI;
          return new U(
            (2 * Math.atan(Math.exp(t.y / this.R)) - Math.PI / 2) * e,
            (t.x * e) / this.R
          );
        },
        bounds: (function() {
          var t = H * Math.PI;
          return new N([-t, -t], [t, t]);
        })()
      };
    function W(t, e, i, o) {
      if (b(t)) return (this._a = t[0]), (this._b = t[1]), (this._c = t[2]), void (this._d = t[3]);
      (this._a = t), (this._b = e), (this._c = i), (this._d = o);
    }
    function G(t, e, i, o) {
      return new W(t, e, i, o);
    }
    W.prototype = {
      transform: function(t, e) {
        return this._transform(t.clone(), e);
      },
      _transform: function(t, e) {
        return (
          (e = e || 1),
          (t.x = e * (this._a * t.x + this._b)),
          (t.y = e * (this._c * t.y + this._d)),
          t
        );
      },
      untransform: function(t, e) {
        return (e = e || 1), new P((t.x / e - this._b) / this._a, (t.y / e - this._d) / this._c);
      }
    };
    var Q = o({}, j, {
        code: 'EPSG:3857',
        projection: V,
        transformation: (function() {
          var t = 0.5 / (Math.PI * V.R);
          return G(t, 0.5, -t, 0.5);
        })()
      }),
      K = o({}, Q, { code: 'EPSG:900913' });
    function Y(t) {
      return document.createElementNS('http://www.w3.org/2000/svg', t);
    }
    function J(t, e) {
      var i,
        o,
        n,
        s,
        r,
        a,
        l = '';
      for (i = 0, n = t.length; i < n; i++) {
        for (o = 0, s = (r = t[i]).length; o < s; o++)
          l += (o ? 'L' : 'M') + (a = r[o]).x + ' ' + a.y;
        l += e ? ($t ? 'z' : 'x') : '';
      }
      return l || 'M0 0';
    }
    var X = document.documentElement.style,
      tt = 'ActiveXObject' in window,
      et = tt && !document.addEventListener,
      it = 'msLaunchUri' in navigator && !('documentMode' in document),
      ot = Mt('webkit'),
      nt = Mt('android'),
      st = Mt('android 2') || Mt('android 3'),
      rt = parseInt(/WebKit\/([0-9]+)|$/.exec(navigator.userAgent)[1], 10),
      at = nt && Mt('Google') && rt < 537 && !('AudioNode' in window),
      lt = !!window.opera,
      ht = Mt('chrome'),
      ct = Mt('gecko') && !ot && !lt && !tt,
      dt = !ht && Mt('safari'),
      ut = Mt('phantom'),
      pt = 'OTransition' in X,
      mt = 0 === navigator.platform.indexOf('Win'),
      gt = tt && 'transition' in X,
      ft = 'WebKitCSSMatrix' in window && 'm11' in new window.WebKitCSSMatrix() && !st,
      vt = 'MozPerspective' in X,
      bt = !window.L_DISABLE_3D && (gt || ft || vt) && !pt && !ut,
      yt = 'undefined' != typeof orientation || Mt('mobile'),
      _t = yt && ot,
      xt = yt && ft,
      wt = !window.PointerEvent && window.MSPointerEvent,
      kt = !(!window.PointerEvent && !wt),
      At =
        !window.L_NO_TOUCH &&
        (kt ||
          'ontouchstart' in window ||
          (window.DocumentTouch && document instanceof window.DocumentTouch)),
      Ct = yt && lt,
      St = yt && ct,
      Et = (window.devicePixelRatio || window.screen.deviceXDPI / window.screen.logicalXDPI) > 1,
      Tt = !!document.createElement('canvas').getContext,
      $t = !(!document.createElementNS || !Y('svg').createSVGRect),
      Ot =
        !$t &&
        (function() {
          try {
            var t = document.createElement('div');
            t.innerHTML = '<v:shape adj="1"/>';
            var e = t.firstChild;
            return (e.style.behavior = 'url(#default#VML)'), e && 'object' == typeof e.adj;
          } catch (t) {
            return !1;
          }
        })();
    function Mt(t) {
      return navigator.userAgent.toLowerCase().indexOf(t) >= 0;
    }
    var Lt = (Object.freeze || Object)({
        ie: tt,
        ielt9: et,
        edge: it,
        webkit: ot,
        android: nt,
        android23: st,
        androidStock: at,
        opera: lt,
        chrome: ht,
        gecko: ct,
        safari: dt,
        phantom: ut,
        opera12: pt,
        win: mt,
        ie3d: gt,
        webkit3d: ft,
        gecko3d: vt,
        any3d: bt,
        mobile: yt,
        mobileWebkit: _t,
        mobileWebkit3d: xt,
        msPointer: wt,
        pointer: kt,
        touch: At,
        mobileOpera: Ct,
        mobileGecko: St,
        retina: Et,
        canvas: Tt,
        svg: $t,
        vml: Ot
      }),
      zt = wt ? 'MSPointerDown' : 'pointerdown',
      Pt = wt ? 'MSPointerMove' : 'pointermove',
      Dt = wt ? 'MSPointerUp' : 'pointerup',
      It = wt ? 'MSPointerCancel' : 'pointercancel',
      Nt = ['INPUT', 'SELECT', 'OPTION'],
      Bt = {},
      Rt = !1,
      qt = 0;
    function Ut(t, e, i, o) {
      return (
        'touchstart' === e
          ? Zt(t, i, o)
          : 'touchmove' === e
          ? Gt(t, i, o)
          : 'touchend' === e && Qt(t, i, o),
        this
      );
    }
    function Ft(t, e, i) {
      var o = t['_leaflet_' + e + i];
      return (
        'touchstart' === e
          ? t.removeEventListener(zt, o, !1)
          : 'touchmove' === e
          ? t.removeEventListener(Pt, o, !1)
          : 'touchend' === e &&
            (t.removeEventListener(Dt, o, !1), t.removeEventListener(It, o, !1)),
        this
      );
    }
    function Zt(t, e, i) {
      var o = s(function(t) {
        if (
          'mouse' !== t.pointerType &&
          t.MSPOINTER_TYPE_MOUSE &&
          t.pointerType !== t.MSPOINTER_TYPE_MOUSE
        ) {
          if (!(Nt.indexOf(t.target.tagName) < 0)) return;
          Ze(t);
        }
        Wt(t, e);
      });
      (t['_leaflet_touchstart' + i] = o),
        t.addEventListener(zt, o, !1),
        Rt ||
          (document.documentElement.addEventListener(zt, jt, !0),
          document.documentElement.addEventListener(Pt, Ht, !0),
          document.documentElement.addEventListener(Dt, Vt, !0),
          document.documentElement.addEventListener(It, Vt, !0),
          (Rt = !0));
    }
    function jt(t) {
      (Bt[t.pointerId] = t), qt++;
    }
    function Ht(t) {
      Bt[t.pointerId] && (Bt[t.pointerId] = t);
    }
    function Vt(t) {
      delete Bt[t.pointerId], qt--;
    }
    function Wt(t, e) {
      for (var i in ((t.touches = []), Bt)) t.touches.push(Bt[i]);
      (t.changedTouches = [t]), e(t);
    }
    function Gt(t, e, i) {
      var o = function(t) {
        ((t.pointerType !== t.MSPOINTER_TYPE_MOUSE && 'mouse' !== t.pointerType) ||
          0 !== t.buttons) &&
          Wt(t, e);
      };
      (t['_leaflet_touchmove' + i] = o), t.addEventListener(Pt, o, !1);
    }
    function Qt(t, e, i) {
      var o = function(t) {
        Wt(t, e);
      };
      (t['_leaflet_touchend' + i] = o),
        t.addEventListener(Dt, o, !1),
        t.addEventListener(It, o, !1);
    }
    var Kt = wt ? 'MSPointerDown' : kt ? 'pointerdown' : 'touchstart',
      Yt = wt ? 'MSPointerUp' : kt ? 'pointerup' : 'touchend',
      Jt = '_leaflet_';
    function Xt(t, e, i) {
      var o,
        n,
        s = !1,
        r = 250;
      function a(t) {
        var e;
        if (kt) {
          if (!it || 'mouse' === t.pointerType) return;
          e = qt;
        } else e = t.touches.length;
        if (!(e > 1)) {
          var i = Date.now(),
            a = i - (o || i);
          (n = t.touches ? t.touches[0] : t), (s = a > 0 && a <= r), (o = i);
        }
      }
      function l(t) {
        if (s && !n.cancelBubble) {
          if (kt) {
            if (!it || 'mouse' === t.pointerType) return;
            var i,
              r,
              a = {};
            for (r in n) (i = n[r]), (a[r] = i && i.bind ? i.bind(n) : i);
            n = a;
          }
          (n.type = 'dblclick'), (n.button = 0), e(n), (o = null);
        }
      }
      return (
        (t[Jt + Kt + i] = a),
        (t[Jt + Yt + i] = l),
        (t[Jt + 'dblclick' + i] = e),
        t.addEventListener(Kt, a, !1),
        t.addEventListener(Yt, l, !1),
        t.addEventListener('dblclick', e, !1),
        this
      );
    }
    function te(t, e) {
      var i = t[Jt + Kt + e],
        o = t[Jt + Yt + e],
        n = t[Jt + 'dblclick' + e];
      return (
        t.removeEventListener(Kt, i, !1),
        t.removeEventListener(Yt, o, !1),
        it || t.removeEventListener('dblclick', n, !1),
        this
      );
    }
    var ee,
      ie,
      oe,
      ne,
      se,
      re = ke(['transform', 'webkitTransform', 'OTransform', 'MozTransform', 'msTransform']),
      ae = ke(['webkitTransition', 'transition', 'OTransition', 'MozTransition', 'msTransition']),
      le = 'webkitTransition' === ae || 'OTransition' === ae ? ae + 'End' : 'transitionend';
    function he(t) {
      return 'string' == typeof t ? document.getElementById(t) : t;
    }
    function ce(t, e) {
      var i = t.style[e] || (t.currentStyle && t.currentStyle[e]);
      if ((!i || 'auto' === i) && document.defaultView) {
        var o = document.defaultView.getComputedStyle(t, null);
        i = o ? o[e] : null;
      }
      return 'auto' === i ? null : i;
    }
    function de(t, e, i) {
      var o = document.createElement(t);
      return (o.className = e || ''), i && i.appendChild(o), o;
    }
    function ue(t) {
      var e = t.parentNode;
      e && e.removeChild(t);
    }
    function pe(t) {
      for (; t.firstChild; ) t.removeChild(t.firstChild);
    }
    function me(t) {
      var e = t.parentNode;
      e && e.lastChild !== t && e.appendChild(t);
    }
    function ge(t) {
      var e = t.parentNode;
      e && e.firstChild !== t && e.insertBefore(t, e.firstChild);
    }
    function fe(t, e) {
      if (void 0 !== t.classList) return t.classList.contains(e);
      var i = _e(t);
      return i.length > 0 && new RegExp('(^|\\s)' + e + '(\\s|$)').test(i);
    }
    function ve(t, e) {
      if (void 0 !== t.classList)
        for (var i = p(e), o = 0, n = i.length; o < n; o++) t.classList.add(i[o]);
      else if (!fe(t, e)) {
        var s = _e(t);
        ye(t, (s ? s + ' ' : '') + e);
      }
    }
    function be(t, e) {
      void 0 !== t.classList
        ? t.classList.remove(e)
        : ye(t, u((' ' + _e(t) + ' ').replace(' ' + e + ' ', ' ')));
    }
    function ye(t, e) {
      void 0 === t.className.baseVal ? (t.className = e) : (t.className.baseVal = e);
    }
    function _e(t) {
      return (
        t.correspondingElement && (t = t.correspondingElement),
        void 0 === t.className.baseVal ? t.className : t.className.baseVal
      );
    }
    function xe(t, e) {
      'opacity' in t.style ? (t.style.opacity = e) : 'filter' in t.style && we(t, e);
    }
    function we(t, e) {
      var i = !1,
        o = 'DXImageTransform.Microsoft.Alpha';
      try {
        i = t.filters.item(o);
      } catch (t) {
        if (1 === e) return;
      }
      (e = Math.round(100 * e)),
        i
          ? ((i.Enabled = 100 !== e), (i.Opacity = e))
          : (t.style.filter += ' progid:' + o + '(opacity=' + e + ')');
    }
    function ke(t) {
      for (var e = document.documentElement.style, i = 0; i < t.length; i++)
        if (t[i] in e) return t[i];
      return !1;
    }
    function Ae(t, e, i) {
      var o = e || new P(0, 0);
      t.style[re] =
        (gt
          ? 'translate(' + o.x + 'px,' + o.y + 'px)'
          : 'translate3d(' + o.x + 'px,' + o.y + 'px,0)') + (i ? ' scale(' + i + ')' : '');
    }
    function Ce(t, e) {
      (t._leaflet_pos = e),
        bt ? Ae(t, e) : ((t.style.left = e.x + 'px'), (t.style.top = e.y + 'px'));
    }
    function Se(t) {
      return t._leaflet_pos || new P(0, 0);
    }
    if ('onselectstart' in document)
      (ee = function() {
        De(window, 'selectstart', Ze);
      }),
        (ie = function() {
          Ne(window, 'selectstart', Ze);
        });
    else {
      var Ee = ke([
        'userSelect',
        'WebkitUserSelect',
        'OUserSelect',
        'MozUserSelect',
        'msUserSelect'
      ]);
      (ee = function() {
        if (Ee) {
          var t = document.documentElement.style;
          (oe = t[Ee]), (t[Ee] = 'none');
        }
      }),
        (ie = function() {
          Ee && ((document.documentElement.style[Ee] = oe), (oe = void 0));
        });
    }
    function Te() {
      De(window, 'dragstart', Ze);
    }
    function $e() {
      Ne(window, 'dragstart', Ze);
    }
    function Oe(t) {
      for (; -1 === t.tabIndex; ) t = t.parentNode;
      t.style &&
        (Me(),
        (ne = t),
        (se = t.style.outline),
        (t.style.outline = 'none'),
        De(window, 'keydown', Me));
    }
    function Me() {
      ne && ((ne.style.outline = se), (ne = void 0), (se = void 0), Ne(window, 'keydown', Me));
    }
    function Le(t) {
      do {
        t = t.parentNode;
      } while (!((t.offsetWidth && t.offsetHeight) || t === document.body));
      return t;
    }
    function ze(t) {
      var e = t.getBoundingClientRect();
      return {
        x: e.width / t.offsetWidth || 1,
        y: e.height / t.offsetHeight || 1,
        boundingClientRect: e
      };
    }
    var Pe = (Object.freeze || Object)({
      TRANSFORM: re,
      TRANSITION: ae,
      TRANSITION_END: le,
      get: he,
      getStyle: ce,
      create: de,
      remove: ue,
      empty: pe,
      toFront: me,
      toBack: ge,
      hasClass: fe,
      addClass: ve,
      removeClass: be,
      setClass: ye,
      getClass: _e,
      setOpacity: xe,
      testProp: ke,
      setTransform: Ae,
      setPosition: Ce,
      getPosition: Se,
      disableTextSelection: ee,
      enableTextSelection: ie,
      disableImageDrag: Te,
      enableImageDrag: $e,
      preventOutline: Oe,
      restoreOutline: Me,
      getSizedParentNode: Le,
      getScale: ze
    });
    function De(t, e, i, o) {
      if ('object' == typeof e) for (var n in e) Be(t, n, e[n], i);
      else for (var s = 0, r = (e = p(e)).length; s < r; s++) Be(t, e[s], i, o);
      return this;
    }
    var Ie = '_leaflet_events';
    function Ne(t, e, i, o) {
      if ('object' == typeof e) for (var n in e) Re(t, n, e[n], i);
      else if (e) for (var s = 0, r = (e = p(e)).length; s < r; s++) Re(t, e[s], i, o);
      else {
        for (var a in t[Ie]) Re(t, a, t[Ie][a]);
        delete t[Ie];
      }
      return this;
    }
    function Be(t, e, i, o) {
      var n = e + a(i) + (o ? '_' + a(o) : '');
      if (t[Ie] && t[Ie][n]) return this;
      var s = function(e) {
          return i.call(o || t, e || window.event);
        },
        r = s;
      kt && 0 === e.indexOf('touch')
        ? Ut(t, e, s, n)
        : !At || 'dblclick' !== e || !Xt || (kt && ht)
        ? 'addEventListener' in t
          ? 'mousewheel' === e
            ? t.addEventListener('onwheel' in t ? 'wheel' : 'mousewheel', s, !1)
            : 'mouseenter' === e || 'mouseleave' === e
            ? ((s = function(e) {
                (e = e || window.event), Je(t, e) && r(e);
              }),
              t.addEventListener('mouseenter' === e ? 'mouseover' : 'mouseout', s, !1))
            : ('click' === e &&
                nt &&
                (s = function(t) {
                  Xe(t, r);
                }),
              t.addEventListener(e, s, !1))
          : 'attachEvent' in t && t.attachEvent('on' + e, s)
        : Xt(t, s, n),
        (t[Ie] = t[Ie] || {}),
        (t[Ie][n] = s);
    }
    function Re(t, e, i, o) {
      var n = e + a(i) + (o ? '_' + a(o) : ''),
        s = t[Ie] && t[Ie][n];
      if (!s) return this;
      kt && 0 === e.indexOf('touch')
        ? Ft(t, e, n)
        : !At || 'dblclick' !== e || !te || (kt && ht)
        ? 'removeEventListener' in t
          ? 'mousewheel' === e
            ? t.removeEventListener('onwheel' in t ? 'wheel' : 'mousewheel', s, !1)
            : t.removeEventListener(
                'mouseenter' === e ? 'mouseover' : 'mouseleave' === e ? 'mouseout' : e,
                s,
                !1
              )
          : 'detachEvent' in t && t.detachEvent('on' + e, s)
        : te(t, n),
        (t[Ie][n] = null);
    }
    function qe(t) {
      return (
        t.stopPropagation
          ? t.stopPropagation()
          : t.originalEvent
          ? (t.originalEvent._stopped = !0)
          : (t.cancelBubble = !0),
        Ye(t),
        this
      );
    }
    function Ue(t) {
      return Be(t, 'mousewheel', qe), this;
    }
    function Fe(t) {
      return De(t, 'mousedown touchstart dblclick', qe), Be(t, 'click', Ke), this;
    }
    function Ze(t) {
      return t.preventDefault ? t.preventDefault() : (t.returnValue = !1), this;
    }
    function je(t) {
      return Ze(t), qe(t), this;
    }
    function He(t, e) {
      if (!e) return new P(t.clientX, t.clientY);
      var i = ze(e),
        o = i.boundingClientRect;
      return new P(
        (t.clientX - o.left) / i.x - e.clientLeft,
        (t.clientY - o.top) / i.y - e.clientTop
      );
    }
    var Ve = mt && ht ? 2 * window.devicePixelRatio : ct ? window.devicePixelRatio : 1;
    function We(t) {
      return it
        ? t.wheelDeltaY / 2
        : t.deltaY && 0 === t.deltaMode
        ? -t.deltaY / Ve
        : t.deltaY && 1 === t.deltaMode
        ? 20 * -t.deltaY
        : t.deltaY && 2 === t.deltaMode
        ? 60 * -t.deltaY
        : t.deltaX || t.deltaZ
        ? 0
        : t.wheelDelta
        ? (t.wheelDeltaY || t.wheelDelta) / 2
        : t.detail && Math.abs(t.detail) < 32765
        ? 20 * -t.detail
        : t.detail
        ? (t.detail / -32765) * 60
        : 0;
    }
    var Ge,
      Qe = {};
    function Ke(t) {
      Qe[t.type] = !0;
    }
    function Ye(t) {
      var e = Qe[t.type];
      return (Qe[t.type] = !1), e;
    }
    function Je(t, e) {
      var i = e.relatedTarget;
      if (!i) return !0;
      try {
        for (; i && i !== t; ) i = i.parentNode;
      } catch (t) {
        return !1;
      }
      return i !== t;
    }
    function Xe(t, e) {
      var i = t.timeStamp || (t.originalEvent && t.originalEvent.timeStamp),
        o = Ge && i - Ge;
      (o && o > 100 && o < 500) || (t.target._simulatedClick && !t._simulated)
        ? je(t)
        : ((Ge = i), e(t));
    }
    var ti = (Object.freeze || Object)({
        on: De,
        off: Ne,
        stopPropagation: qe,
        disableScrollPropagation: Ue,
        disableClickPropagation: Fe,
        preventDefault: Ze,
        stop: je,
        getMousePosition: He,
        getWheelDelta: We,
        fakeStop: Ke,
        skipped: Ye,
        isExternalTarget: Je,
        addListener: De,
        removeListener: Ne
      }),
      ei = z.extend({
        run: function(t, e, i, o) {
          this.stop(),
            (this._el = t),
            (this._inProgress = !0),
            (this._duration = i || 0.25),
            (this._easeOutPower = 1 / Math.max(o || 0.5, 0.2)),
            (this._startPos = Se(t)),
            (this._offset = e.subtract(this._startPos)),
            (this._startTime = +new Date()),
            this.fire('start'),
            this._animate();
        },
        stop: function() {
          this._inProgress && (this._step(!0), this._complete());
        },
        _animate: function() {
          (this._animId = S(this._animate, this)), this._step();
        },
        _step: function(t) {
          var e = +new Date() - this._startTime,
            i = 1e3 * this._duration;
          e < i ? this._runFrame(this._easeOut(e / i), t) : (this._runFrame(1), this._complete());
        },
        _runFrame: function(t, e) {
          var i = this._startPos.add(this._offset.multiplyBy(t));
          e && i._round(), Ce(this._el, i), this.fire('step');
        },
        _complete: function() {
          E(this._animId), (this._inProgress = !1), this.fire('end');
        },
        _easeOut: function(t) {
          return 1 - Math.pow(1 - t, this._easeOutPower);
        }
      }),
      ii = z.extend({
        options: {
          crs: Q,
          center: void 0,
          zoom: void 0,
          minZoom: void 0,
          maxZoom: void 0,
          layers: [],
          maxBounds: void 0,
          renderer: void 0,
          zoomAnimation: !0,
          zoomAnimationThreshold: 4,
          fadeAnimation: !0,
          markerZoomAnimation: !0,
          transform3DLimit: 8388608,
          zoomSnap: 1,
          zoomDelta: 1,
          trackResize: !0
        },
        initialize: function(t, e) {
          (e = m(this, e)),
            (this._handlers = []),
            (this._layers = {}),
            (this._zoomBoundLayers = {}),
            (this._sizeChanged = !0),
            this._initContainer(t),
            this._initLayout(),
            (this._onResize = s(this._onResize, this)),
            this._initEvents(),
            e.maxBounds && this.setMaxBounds(e.maxBounds),
            void 0 !== e.zoom && (this._zoom = this._limitZoom(e.zoom)),
            e.center && void 0 !== e.zoom && this.setView(F(e.center), e.zoom, { reset: !0 }),
            this.callInitHooks(),
            (this._zoomAnimated = ae && bt && !Ct && this.options.zoomAnimation),
            this._zoomAnimated &&
              (this._createAnimProxy(), De(this._proxy, le, this._catchTransitionEnd, this)),
            this._addLayers(this.options.layers);
        },
        setView: function(t, e, i) {
          return (
            (e = void 0 === e ? this._zoom : this._limitZoom(e)),
            (t = this._limitCenter(F(t), e, this.options.maxBounds)),
            (i = i || {}),
            this._stop(),
            this._loaded &&
            !i.reset &&
            !0 !== i &&
            (void 0 !== i.animate &&
              ((i.zoom = o({ animate: i.animate }, i.zoom)),
              (i.pan = o({ animate: i.animate, duration: i.duration }, i.pan))),
            this._zoom !== e
              ? this._tryAnimatedZoom && this._tryAnimatedZoom(t, e, i.zoom)
              : this._tryAnimatedPan(t, i.pan))
              ? (clearTimeout(this._sizeTimer), this)
              : (this._resetView(t, e), this)
          );
        },
        setZoom: function(t, e) {
          return this._loaded
            ? this.setView(this.getCenter(), t, { zoom: e })
            : ((this._zoom = t), this);
        },
        zoomIn: function(t, e) {
          return (t = t || (bt ? this.options.zoomDelta : 1)), this.setZoom(this._zoom + t, e);
        },
        zoomOut: function(t, e) {
          return (t = t || (bt ? this.options.zoomDelta : 1)), this.setZoom(this._zoom - t, e);
        },
        setZoomAround: function(t, e, i) {
          var o = this.getZoomScale(e),
            n = this.getSize().divideBy(2),
            s = (t instanceof P ? t : this.latLngToContainerPoint(t))
              .subtract(n)
              .multiplyBy(1 - 1 / o),
            r = this.containerPointToLatLng(n.add(s));
          return this.setView(r, e, { zoom: i });
        },
        _getBoundsCenterZoom: function(t, e) {
          (e = e || {}), (t = t.getBounds ? t.getBounds() : q(t));
          var i = I(e.paddingTopLeft || e.padding || [0, 0]),
            o = I(e.paddingBottomRight || e.padding || [0, 0]),
            n = this.getBoundsZoom(t, !1, i.add(o));
          if ((n = 'number' == typeof e.maxZoom ? Math.min(e.maxZoom, n) : n) === 1 / 0)
            return { center: t.getCenter(), zoom: n };
          var s = o.subtract(i).divideBy(2),
            r = this.project(t.getSouthWest(), n),
            a = this.project(t.getNorthEast(), n);
          return {
            center: this.unproject(
              r
                .add(a)
                .divideBy(2)
                .add(s),
              n
            ),
            zoom: n
          };
        },
        fitBounds: function(t, e) {
          if (!(t = q(t)).isValid()) throw new Error('Bounds are not valid.');
          var i = this._getBoundsCenterZoom(t, e);
          return this.setView(i.center, i.zoom, e);
        },
        fitWorld: function(t) {
          return this.fitBounds([[-90, -180], [90, 180]], t);
        },
        panTo: function(t, e) {
          return this.setView(t, this._zoom, { pan: e });
        },
        panBy: function(t, e) {
          if (((e = e || {}), !(t = I(t).round()).x && !t.y)) return this.fire('moveend');
          if (!0 !== e.animate && !this.getSize().contains(t))
            return (
              this._resetView(
                this.unproject(this.project(this.getCenter()).add(t)),
                this.getZoom()
              ),
              this
            );
          if (
            (this._panAnim ||
              ((this._panAnim = new ei()),
              this._panAnim.on(
                { step: this._onPanTransitionStep, end: this._onPanTransitionEnd },
                this
              )),
            e.noMoveStart || this.fire('movestart'),
            !1 !== e.animate)
          ) {
            ve(this._mapPane, 'leaflet-pan-anim');
            var i = this._getMapPanePos()
              .subtract(t)
              .round();
            this._panAnim.run(this._mapPane, i, e.duration || 0.25, e.easeLinearity);
          } else this._rawPanBy(t), this.fire('move').fire('moveend');
          return this;
        },
        flyTo: function(t, e, i) {
          if (!1 === (i = i || {}).animate || !bt) return this.setView(t, e, i);
          this._stop();
          var o = this.project(this.getCenter()),
            n = this.project(t),
            s = this.getSize(),
            r = this._zoom;
          (t = F(t)), (e = void 0 === e ? r : e);
          var a = Math.max(s.x, s.y),
            l = a * this.getZoomScale(r, e),
            h = n.distanceTo(o) || 1,
            c = 1.42,
            d = c * c;
          function u(t) {
            var e = (l * l - a * a + (t ? -1 : 1) * d * d * h * h) / (2 * (t ? l : a) * d * h),
              i = Math.sqrt(e * e + 1) - e;
            return i < 1e-9 ? -18 : Math.log(i);
          }
          function p(t) {
            return (Math.exp(t) - Math.exp(-t)) / 2;
          }
          function m(t) {
            return (Math.exp(t) + Math.exp(-t)) / 2;
          }
          function g(t) {
            return p(t) / m(t);
          }
          var f = u(0);
          function v(t) {
            return a * (m(f) / m(f + c * t));
          }
          function b(t) {
            return (a * (m(f) * g(f + c * t) - p(f))) / d;
          }
          function y(t) {
            return 1 - Math.pow(1 - t, 1.5);
          }
          var _ = Date.now(),
            x = (u(1) - f) / c,
            w = i.duration ? 1e3 * i.duration : 1e3 * x * 0.8;
          function k() {
            var i = (Date.now() - _) / w,
              s = y(i) * x;
            i <= 1
              ? ((this._flyToFrame = S(k, this)),
                this._move(
                  this.unproject(o.add(n.subtract(o).multiplyBy(b(s) / h)), r),
                  this.getScaleZoom(a / v(s), r),
                  { flyTo: !0 }
                ))
              : this._move(t, e)._moveEnd(!0);
          }
          return this._moveStart(!0, i.noMoveStart), k.call(this), this;
        },
        flyToBounds: function(t, e) {
          var i = this._getBoundsCenterZoom(t, e);
          return this.flyTo(i.center, i.zoom, e);
        },
        setMaxBounds: function(t) {
          return (t = q(t)).isValid()
            ? (this.options.maxBounds && this.off('moveend', this._panInsideMaxBounds),
              (this.options.maxBounds = t),
              this._loaded && this._panInsideMaxBounds(),
              this.on('moveend', this._panInsideMaxBounds))
            : ((this.options.maxBounds = null), this.off('moveend', this._panInsideMaxBounds));
        },
        setMinZoom: function(t) {
          var e = this.options.minZoom;
          return (
            (this.options.minZoom = t),
            this._loaded &&
            e !== t &&
            (this.fire('zoomlevelschange'), this.getZoom() < this.options.minZoom)
              ? this.setZoom(t)
              : this
          );
        },
        setMaxZoom: function(t) {
          var e = this.options.maxZoom;
          return (
            (this.options.maxZoom = t),
            this._loaded &&
            e !== t &&
            (this.fire('zoomlevelschange'), this.getZoom() > this.options.maxZoom)
              ? this.setZoom(t)
              : this
          );
        },
        panInsideBounds: function(t, e) {
          this._enforcingBounds = !0;
          var i = this.getCenter(),
            o = this._limitCenter(i, this._zoom, q(t));
          return i.equals(o) || this.panTo(o, e), (this._enforcingBounds = !1), this;
        },
        panInside: function(t, e) {
          var i = I((e = e || {}).paddingTopLeft || e.padding || [0, 0]),
            o = I(e.paddingBottomRight || e.padding || [0, 0]),
            n = this.getCenter(),
            s = this.project(n),
            r = this.project(t),
            a = this.getPixelBounds(),
            l = a.getSize().divideBy(2),
            h = B([a.min.add(i), a.max.subtract(o)]);
          if (!h.contains(r)) {
            this._enforcingBounds = !0;
            var c = s.subtract(r),
              d = I(r.x + c.x, r.y + c.y);
            (r.x < h.min.x || r.x > h.max.x) &&
              ((d.x = s.x - c.x), c.x > 0 ? (d.x += l.x - i.x) : (d.x -= l.x - o.x)),
              (r.y < h.min.y || r.y > h.max.y) &&
                ((d.y = s.y - c.y), c.y > 0 ? (d.y += l.y - i.y) : (d.y -= l.y - o.y)),
              this.panTo(this.unproject(d), e),
              (this._enforcingBounds = !1);
          }
          return this;
        },
        invalidateSize: function(t) {
          if (!this._loaded) return this;
          t = o({ animate: !1, pan: !0 }, !0 === t ? { animate: !0 } : t);
          var e = this.getSize();
          (this._sizeChanged = !0), (this._lastCenter = null);
          var i = this.getSize(),
            n = e.divideBy(2).round(),
            r = i.divideBy(2).round(),
            a = n.subtract(r);
          return a.x || a.y
            ? (t.animate && t.pan
                ? this.panBy(a)
                : (t.pan && this._rawPanBy(a),
                  this.fire('move'),
                  t.debounceMoveend
                    ? (clearTimeout(this._sizeTimer),
                      (this._sizeTimer = setTimeout(s(this.fire, this, 'moveend'), 200)))
                    : this.fire('moveend')),
              this.fire('resize', { oldSize: e, newSize: i }))
            : this;
        },
        stop: function() {
          return (
            this.setZoom(this._limitZoom(this._zoom)),
            this.options.zoomSnap || this.fire('viewreset'),
            this._stop()
          );
        },
        locate: function(t) {
          if (
            ((t = this._locateOptions = o({ timeout: 1e4, watch: !1 }, t)),
            !('geolocation' in navigator))
          )
            return (
              this._handleGeolocationError({ code: 0, message: 'Geolocation not supported.' }), this
            );
          var e = s(this._handleGeolocationResponse, this),
            i = s(this._handleGeolocationError, this);
          return (
            t.watch
              ? (this._locationWatchId = navigator.geolocation.watchPosition(e, i, t))
              : navigator.geolocation.getCurrentPosition(e, i, t),
            this
          );
        },
        stopLocate: function() {
          return (
            navigator.geolocation &&
              navigator.geolocation.clearWatch &&
              navigator.geolocation.clearWatch(this._locationWatchId),
            this._locateOptions && (this._locateOptions.setView = !1),
            this
          );
        },
        _handleGeolocationError: function(t) {
          var e = t.code,
            i =
              t.message ||
              (1 === e ? 'permission denied' : 2 === e ? 'position unavailable' : 'timeout');
          this._locateOptions.setView && !this._loaded && this.fitWorld(),
            this.fire('locationerror', { code: e, message: 'Geolocation error: ' + i + '.' });
        },
        _handleGeolocationResponse: function(t) {
          var e = new U(t.coords.latitude, t.coords.longitude),
            i = e.toBounds(2 * t.coords.accuracy),
            o = this._locateOptions;
          if (o.setView) {
            var n = this.getBoundsZoom(i);
            this.setView(e, o.maxZoom ? Math.min(n, o.maxZoom) : n);
          }
          var s = { latlng: e, bounds: i, timestamp: t.timestamp };
          for (var r in t.coords) 'number' == typeof t.coords[r] && (s[r] = t.coords[r]);
          this.fire('locationfound', s);
        },
        addHandler: function(t, e) {
          if (!e) return this;
          var i = (this[t] = new e(this));
          return this._handlers.push(i), this.options[t] && i.enable(), this;
        },
        remove: function() {
          if ((this._initEvents(!0), this._containerId !== this._container._leaflet_id))
            throw new Error('Map container is being reused by another instance');
          try {
            delete this._container._leaflet_id, delete this._containerId;
          } catch (t) {
            (this._container._leaflet_id = void 0), (this._containerId = void 0);
          }
          var t;
          for (t in (void 0 !== this._locationWatchId && this.stopLocate(),
          this._stop(),
          ue(this._mapPane),
          this._clearControlPos && this._clearControlPos(),
          this._resizeRequest && (E(this._resizeRequest), (this._resizeRequest = null)),
          this._clearHandlers(),
          this._loaded && this.fire('unload'),
          this._layers))
            this._layers[t].remove();
          for (t in this._panes) ue(this._panes[t]);
          return (
            (this._layers = []),
            (this._panes = []),
            delete this._mapPane,
            delete this._renderer,
            this
          );
        },
        createPane: function(t, e) {
          var i = de(
            'div',
            'leaflet-pane' + (t ? ' leaflet-' + t.replace('Pane', '') + '-pane' : ''),
            e || this._mapPane
          );
          return t && (this._panes[t] = i), i;
        },
        getCenter: function() {
          return (
            this._checkIfLoaded(),
            this._lastCenter && !this._moved()
              ? this._lastCenter
              : this.layerPointToLatLng(this._getCenterLayerPoint())
          );
        },
        getZoom: function() {
          return this._zoom;
        },
        getBounds: function() {
          var t = this.getPixelBounds();
          return new R(this.unproject(t.getBottomLeft()), this.unproject(t.getTopRight()));
        },
        getMinZoom: function() {
          return void 0 === this.options.minZoom ? this._layersMinZoom || 0 : this.options.minZoom;
        },
        getMaxZoom: function() {
          return void 0 === this.options.maxZoom
            ? void 0 === this._layersMaxZoom
              ? 1 / 0
              : this._layersMaxZoom
            : this.options.maxZoom;
        },
        getBoundsZoom: function(t, e, i) {
          (t = q(t)), (i = I(i || [0, 0]));
          var o = this.getZoom() || 0,
            n = this.getMinZoom(),
            s = this.getMaxZoom(),
            r = t.getNorthWest(),
            a = t.getSouthEast(),
            l = this.getSize().subtract(i),
            h = B(this.project(a, o), this.project(r, o)).getSize(),
            c = bt ? this.options.zoomSnap : 1,
            d = l.x / h.x,
            u = l.y / h.y,
            p = e ? Math.max(d, u) : Math.min(d, u);
          return (
            (o = this.getScaleZoom(p, o)),
            c &&
              ((o = Math.round(o / (c / 100)) * (c / 100)),
              (o = e ? Math.ceil(o / c) * c : Math.floor(o / c) * c)),
            Math.max(n, Math.min(s, o))
          );
        },
        getSize: function() {
          return (
            (this._size && !this._sizeChanged) ||
              ((this._size = new P(
                this._container.clientWidth || 0,
                this._container.clientHeight || 0
              )),
              (this._sizeChanged = !1)),
            this._size.clone()
          );
        },
        getPixelBounds: function(t, e) {
          var i = this._getTopLeftPoint(t, e);
          return new N(i, i.add(this.getSize()));
        },
        getPixelOrigin: function() {
          return this._checkIfLoaded(), this._pixelOrigin;
        },
        getPixelWorldBounds: function(t) {
          return this.options.crs.getProjectedBounds(void 0 === t ? this.getZoom() : t);
        },
        getPane: function(t) {
          return 'string' == typeof t ? this._panes[t] : t;
        },
        getPanes: function() {
          return this._panes;
        },
        getContainer: function() {
          return this._container;
        },
        getZoomScale: function(t, e) {
          var i = this.options.crs;
          return (e = void 0 === e ? this._zoom : e), i.scale(t) / i.scale(e);
        },
        getScaleZoom: function(t, e) {
          var i = this.options.crs;
          e = void 0 === e ? this._zoom : e;
          var o = i.zoom(t * i.scale(e));
          return isNaN(o) ? 1 / 0 : o;
        },
        project: function(t, e) {
          return (e = void 0 === e ? this._zoom : e), this.options.crs.latLngToPoint(F(t), e);
        },
        unproject: function(t, e) {
          return (e = void 0 === e ? this._zoom : e), this.options.crs.pointToLatLng(I(t), e);
        },
        layerPointToLatLng: function(t) {
          var e = I(t).add(this.getPixelOrigin());
          return this.unproject(e);
        },
        latLngToLayerPoint: function(t) {
          return this.project(F(t))
            ._round()
            ._subtract(this.getPixelOrigin());
        },
        wrapLatLng: function(t) {
          return this.options.crs.wrapLatLng(F(t));
        },
        wrapLatLngBounds: function(t) {
          return this.options.crs.wrapLatLngBounds(q(t));
        },
        distance: function(t, e) {
          return this.options.crs.distance(F(t), F(e));
        },
        containerPointToLayerPoint: function(t) {
          return I(t).subtract(this._getMapPanePos());
        },
        layerPointToContainerPoint: function(t) {
          return I(t).add(this._getMapPanePos());
        },
        containerPointToLatLng: function(t) {
          var e = this.containerPointToLayerPoint(I(t));
          return this.layerPointToLatLng(e);
        },
        latLngToContainerPoint: function(t) {
          return this.layerPointToContainerPoint(this.latLngToLayerPoint(F(t)));
        },
        mouseEventToContainerPoint: function(t) {
          return He(t, this._container);
        },
        mouseEventToLayerPoint: function(t) {
          return this.containerPointToLayerPoint(this.mouseEventToContainerPoint(t));
        },
        mouseEventToLatLng: function(t) {
          return this.layerPointToLatLng(this.mouseEventToLayerPoint(t));
        },
        _initContainer: function(t) {
          var e = (this._container = he(t));
          if (!e) throw new Error('Map container not found.');
          if (e._leaflet_id) throw new Error('Map container is already initialized.');
          De(e, 'scroll', this._onScroll, this), (this._containerId = a(e));
        },
        _initLayout: function() {
          var t = this._container;
          (this._fadeAnimated = this.options.fadeAnimation && bt),
            ve(
              t,
              'leaflet-container' +
                (At ? ' leaflet-touch' : '') +
                (Et ? ' leaflet-retina' : '') +
                (et ? ' leaflet-oldie' : '') +
                (dt ? ' leaflet-safari' : '') +
                (this._fadeAnimated ? ' leaflet-fade-anim' : '')
            );
          var e = ce(t, 'position');
          'absolute' !== e && 'relative' !== e && 'fixed' !== e && (t.style.position = 'relative'),
            this._initPanes(),
            this._initControlPos && this._initControlPos();
        },
        _initPanes: function() {
          var t = (this._panes = {});
          (this._paneRenderers = {}),
            (this._mapPane = this.createPane('mapPane', this._container)),
            Ce(this._mapPane, new P(0, 0)),
            this.createPane('tilePane'),
            this.createPane('shadowPane'),
            this.createPane('overlayPane'),
            this.createPane('markerPane'),
            this.createPane('tooltipPane'),
            this.createPane('popupPane'),
            this.options.markerZoomAnimation ||
              (ve(t.markerPane, 'leaflet-zoom-hide'), ve(t.shadowPane, 'leaflet-zoom-hide'));
        },
        _resetView: function(t, e) {
          Ce(this._mapPane, new P(0, 0));
          var i = !this._loaded;
          (this._loaded = !0), (e = this._limitZoom(e)), this.fire('viewprereset');
          var o = this._zoom !== e;
          this._moveStart(o, !1)
            ._move(t, e)
            ._moveEnd(o),
            this.fire('viewreset'),
            i && this.fire('load');
        },
        _moveStart: function(t, e) {
          return t && this.fire('zoomstart'), e || this.fire('movestart'), this;
        },
        _move: function(t, e, i) {
          void 0 === e && (e = this._zoom);
          var o = this._zoom !== e;
          return (
            (this._zoom = e),
            (this._lastCenter = t),
            (this._pixelOrigin = this._getNewPixelOrigin(t)),
            (o || (i && i.pinch)) && this.fire('zoom', i),
            this.fire('move', i)
          );
        },
        _moveEnd: function(t) {
          return t && this.fire('zoomend'), this.fire('moveend');
        },
        _stop: function() {
          return E(this._flyToFrame), this._panAnim && this._panAnim.stop(), this;
        },
        _rawPanBy: function(t) {
          Ce(this._mapPane, this._getMapPanePos().subtract(t));
        },
        _getZoomSpan: function() {
          return this.getMaxZoom() - this.getMinZoom();
        },
        _panInsideMaxBounds: function() {
          this._enforcingBounds || this.panInsideBounds(this.options.maxBounds);
        },
        _checkIfLoaded: function() {
          if (!this._loaded) throw new Error('Set map center and zoom first.');
        },
        _initEvents: function(t) {
          (this._targets = {}), (this._targets[a(this._container)] = this);
          var e = t ? Ne : De;
          e(
            this._container,
            'click dblclick mousedown mouseup mouseover mouseout mousemove contextmenu keypress keydown keyup',
            this._handleDOMEvent,
            this
          ),
            this.options.trackResize && e(window, 'resize', this._onResize, this),
            bt &&
              this.options.transform3DLimit &&
              (t ? this.off : this.on).call(this, 'moveend', this._onMoveEnd);
        },
        _onResize: function() {
          E(this._resizeRequest),
            (this._resizeRequest = S(function() {
              this.invalidateSize({ debounceMoveend: !0 });
            }, this));
        },
        _onScroll: function() {
          (this._container.scrollTop = 0), (this._container.scrollLeft = 0);
        },
        _onMoveEnd: function() {
          var t = this._getMapPanePos();
          Math.max(Math.abs(t.x), Math.abs(t.y)) >= this.options.transform3DLimit &&
            this._resetView(this.getCenter(), this.getZoom());
        },
        _findEventTargets: function(t, e) {
          for (
            var i,
              o = [],
              n = 'mouseout' === e || 'mouseover' === e,
              s = t.target || t.srcElement,
              r = !1;
            s;

          ) {
            if (
              (i = this._targets[a(s)]) &&
              ('click' === e || 'preclick' === e) &&
              !t._simulated &&
              this._draggableMoved(i)
            ) {
              r = !0;
              break;
            }
            if (i && i.listens(e, !0)) {
              if (n && !Je(s, t)) break;
              if ((o.push(i), n)) break;
            }
            if (s === this._container) break;
            s = s.parentNode;
          }
          return o.length || r || n || !Je(s, t) || (o = [this]), o;
        },
        _handleDOMEvent: function(t) {
          if (this._loaded && !Ye(t)) {
            var e = t.type;
            ('mousedown' !== e && 'keypress' !== e && 'keyup' !== e && 'keydown' !== e) ||
              Oe(t.target || t.srcElement),
              this._fireDOMEvent(t, e);
          }
        },
        _mouseEvents: ['click', 'dblclick', 'mouseover', 'mouseout', 'contextmenu'],
        _fireDOMEvent: function(t, e, i) {
          if ('click' === t.type) {
            var n = o({}, t);
            (n.type = 'preclick'), this._fireDOMEvent(n, n.type, i);
          }
          if (!t._stopped && (i = (i || []).concat(this._findEventTargets(t, e))).length) {
            var s = i[0];
            'contextmenu' === e && s.listens(e, !0) && Ze(t);
            var r = { originalEvent: t };
            if ('keypress' !== t.type && 'keydown' !== t.type && 'keyup' !== t.type) {
              var a = s.getLatLng && (!s._radius || s._radius <= 10);
              (r.containerPoint = a
                ? this.latLngToContainerPoint(s.getLatLng())
                : this.mouseEventToContainerPoint(t)),
                (r.layerPoint = this.containerPointToLayerPoint(r.containerPoint)),
                (r.latlng = a ? s.getLatLng() : this.layerPointToLatLng(r.layerPoint));
            }
            for (var l = 0; l < i.length; l++)
              if (
                (i[l].fire(e, r, !0),
                r.originalEvent._stopped ||
                  (!1 === i[l].options.bubblingMouseEvents && -1 !== y(this._mouseEvents, e)))
              )
                return;
          }
        },
        _draggableMoved: function(t) {
          return (
            ((t = t.dragging && t.dragging.enabled() ? t : this).dragging && t.dragging.moved()) ||
            (this.boxZoom && this.boxZoom.moved())
          );
        },
        _clearHandlers: function() {
          for (var t = 0, e = this._handlers.length; t < e; t++) this._handlers[t].disable();
        },
        whenReady: function(t, e) {
          return this._loaded ? t.call(e || this, { target: this }) : this.on('load', t, e), this;
        },
        _getMapPanePos: function() {
          return Se(this._mapPane) || new P(0, 0);
        },
        _moved: function() {
          var t = this._getMapPanePos();
          return t && !t.equals([0, 0]);
        },
        _getTopLeftPoint: function(t, e) {
          return (t && void 0 !== e
            ? this._getNewPixelOrigin(t, e)
            : this.getPixelOrigin()
          ).subtract(this._getMapPanePos());
        },
        _getNewPixelOrigin: function(t, e) {
          var i = this.getSize()._divideBy(2);
          return this.project(t, e)
            ._subtract(i)
            ._add(this._getMapPanePos())
            ._round();
        },
        _latLngToNewLayerPoint: function(t, e, i) {
          var o = this._getNewPixelOrigin(i, e);
          return this.project(t, e)._subtract(o);
        },
        _latLngBoundsToNewLayerBounds: function(t, e, i) {
          var o = this._getNewPixelOrigin(i, e);
          return B([
            this.project(t.getSouthWest(), e)._subtract(o),
            this.project(t.getNorthWest(), e)._subtract(o),
            this.project(t.getSouthEast(), e)._subtract(o),
            this.project(t.getNorthEast(), e)._subtract(o)
          ]);
        },
        _getCenterLayerPoint: function() {
          return this.containerPointToLayerPoint(this.getSize()._divideBy(2));
        },
        _getCenterOffset: function(t) {
          return this.latLngToLayerPoint(t).subtract(this._getCenterLayerPoint());
        },
        _limitCenter: function(t, e, i) {
          if (!i) return t;
          var o = this.project(t, e),
            n = this.getSize().divideBy(2),
            s = new N(o.subtract(n), o.add(n)),
            r = this._getBoundsOffset(s, i, e);
          return r.round().equals([0, 0]) ? t : this.unproject(o.add(r), e);
        },
        _limitOffset: function(t, e) {
          if (!e) return t;
          var i = this.getPixelBounds(),
            o = new N(i.min.add(t), i.max.add(t));
          return t.add(this._getBoundsOffset(o, e));
        },
        _getBoundsOffset: function(t, e, i) {
          var o = B(this.project(e.getNorthEast(), i), this.project(e.getSouthWest(), i)),
            n = o.min.subtract(t.min),
            s = o.max.subtract(t.max);
          return new P(this._rebound(n.x, -s.x), this._rebound(n.y, -s.y));
        },
        _rebound: function(t, e) {
          return t + e > 0
            ? Math.round(t - e) / 2
            : Math.max(0, Math.ceil(t)) - Math.max(0, Math.floor(e));
        },
        _limitZoom: function(t) {
          var e = this.getMinZoom(),
            i = this.getMaxZoom(),
            o = bt ? this.options.zoomSnap : 1;
          return o && (t = Math.round(t / o) * o), Math.max(e, Math.min(i, t));
        },
        _onPanTransitionStep: function() {
          this.fire('move');
        },
        _onPanTransitionEnd: function() {
          be(this._mapPane, 'leaflet-pan-anim'), this.fire('moveend');
        },
        _tryAnimatedPan: function(t, e) {
          var i = this._getCenterOffset(t)._trunc();
          return !(
            (!0 !== (e && e.animate) && !this.getSize().contains(i)) ||
            (this.panBy(i, e), 0)
          );
        },
        _createAnimProxy: function() {
          var t = (this._proxy = de('div', 'leaflet-proxy leaflet-zoom-animated'));
          this._panes.mapPane.appendChild(t),
            this.on(
              'zoomanim',
              function(t) {
                var e = re,
                  i = this._proxy.style[e];
                Ae(this._proxy, this.project(t.center, t.zoom), this.getZoomScale(t.zoom, 1)),
                  i === this._proxy.style[e] && this._animatingZoom && this._onZoomTransitionEnd();
              },
              this
            ),
            this.on(
              'load moveend',
              function() {
                var t = this.getCenter(),
                  e = this.getZoom();
                Ae(this._proxy, this.project(t, e), this.getZoomScale(e, 1));
              },
              this
            ),
            this._on('unload', this._destroyAnimProxy, this);
        },
        _destroyAnimProxy: function() {
          ue(this._proxy), delete this._proxy;
        },
        _catchTransitionEnd: function(t) {
          this._animatingZoom &&
            t.propertyName.indexOf('transform') >= 0 &&
            this._onZoomTransitionEnd();
        },
        _nothingToAnimate: function() {
          return !this._container.getElementsByClassName('leaflet-zoom-animated').length;
        },
        _tryAnimatedZoom: function(t, e, i) {
          if (this._animatingZoom) return !0;
          if (
            ((i = i || {}),
            !this._zoomAnimated ||
              !1 === i.animate ||
              this._nothingToAnimate() ||
              Math.abs(e - this._zoom) > this.options.zoomAnimationThreshold)
          )
            return !1;
          var o = this.getZoomScale(e),
            n = this._getCenterOffset(t)._divideBy(1 - 1 / o);
          return !(
            (!0 !== i.animate && !this.getSize().contains(n)) ||
            (S(function() {
              this._moveStart(!0, !1)._animateZoom(t, e, !0);
            }, this),
            0)
          );
        },
        _animateZoom: function(t, e, i, o) {
          this._mapPane &&
            (i &&
              ((this._animatingZoom = !0),
              (this._animateToCenter = t),
              (this._animateToZoom = e),
              ve(this._mapPane, 'leaflet-zoom-anim')),
            this.fire('zoomanim', { center: t, zoom: e, noUpdate: o }),
            setTimeout(s(this._onZoomTransitionEnd, this), 250));
        },
        _onZoomTransitionEnd: function() {
          this._animatingZoom &&
            (this._mapPane && be(this._mapPane, 'leaflet-zoom-anim'),
            (this._animatingZoom = !1),
            this._move(this._animateToCenter, this._animateToZoom),
            S(function() {
              this._moveEnd(!0);
            }, this));
        }
      });
    function oi(t, e) {
      return new ii(t, e);
    }
    var ni = $.extend({
        options: { position: 'topright' },
        initialize: function(t) {
          m(this, t);
        },
        getPosition: function() {
          return this.options.position;
        },
        setPosition: function(t) {
          var e = this._map;
          return (
            e && e.removeControl(this), (this.options.position = t), e && e.addControl(this), this
          );
        },
        getContainer: function() {
          return this._container;
        },
        addTo: function(t) {
          this.remove(), (this._map = t);
          var e = (this._container = this.onAdd(t)),
            i = this.getPosition(),
            o = t._controlCorners[i];
          return (
            ve(e, 'leaflet-control'),
            -1 !== i.indexOf('bottom') ? o.insertBefore(e, o.firstChild) : o.appendChild(e),
            this._map.on('unload', this.remove, this),
            this
          );
        },
        remove: function() {
          return this._map
            ? (ue(this._container),
              this.onRemove && this.onRemove(this._map),
              this._map.off('unload', this.remove, this),
              (this._map = null),
              this)
            : this;
        },
        _refocusOnMap: function(t) {
          this._map && t && t.screenX > 0 && t.screenY > 0 && this._map.getContainer().focus();
        }
      }),
      si = function(t) {
        return new ni(t);
      };
    ii.include({
      addControl: function(t) {
        return t.addTo(this), this;
      },
      removeControl: function(t) {
        return t.remove(), this;
      },
      _initControlPos: function() {
        var t = (this._controlCorners = {}),
          e = 'leaflet-',
          i = (this._controlContainer = de('div', e + 'control-container', this._container));
        function o(o, n) {
          var s = e + o + ' ' + e + n;
          t[o + n] = de('div', s, i);
        }
        o('top', 'left'), o('top', 'right'), o('bottom', 'left'), o('bottom', 'right');
      },
      _clearControlPos: function() {
        for (var t in this._controlCorners) ue(this._controlCorners[t]);
        ue(this._controlContainer), delete this._controlCorners, delete this._controlContainer;
      }
    });
    var ri = ni.extend({
        options: {
          collapsed: !0,
          position: 'topright',
          autoZIndex: !0,
          hideSingleBase: !1,
          sortLayers: !1,
          sortFunction: function(t, e, i, o) {
            return i < o ? -1 : o < i ? 1 : 0;
          }
        },
        initialize: function(t, e, i) {
          for (var o in (m(this, i),
          (this._layerControlInputs = []),
          (this._layers = []),
          (this._lastZIndex = 0),
          (this._handlingClick = !1),
          t))
            this._addLayer(t[o], o);
          for (o in e) this._addLayer(e[o], o, !0);
        },
        onAdd: function(t) {
          this._initLayout(),
            this._update(),
            (this._map = t),
            t.on('zoomend', this._checkDisabledLayers, this);
          for (var e = 0; e < this._layers.length; e++)
            this._layers[e].layer.on('add remove', this._onLayerChange, this);
          return this._container;
        },
        addTo: function(t) {
          return ni.prototype.addTo.call(this, t), this._expandIfNotCollapsed();
        },
        onRemove: function() {
          this._map.off('zoomend', this._checkDisabledLayers, this);
          for (var t = 0; t < this._layers.length; t++)
            this._layers[t].layer.off('add remove', this._onLayerChange, this);
        },
        addBaseLayer: function(t, e) {
          return this._addLayer(t, e), this._map ? this._update() : this;
        },
        addOverlay: function(t, e) {
          return this._addLayer(t, e, !0), this._map ? this._update() : this;
        },
        removeLayer: function(t) {
          t.off('add remove', this._onLayerChange, this);
          var e = this._getLayer(a(t));
          return (
            e && this._layers.splice(this._layers.indexOf(e), 1), this._map ? this._update() : this
          );
        },
        expand: function() {
          ve(this._container, 'leaflet-control-layers-expanded'),
            (this._section.style.height = null);
          var t = this._map.getSize().y - (this._container.offsetTop + 50);
          return (
            t < this._section.clientHeight
              ? (ve(this._section, 'leaflet-control-layers-scrollbar'),
                (this._section.style.height = t + 'px'))
              : be(this._section, 'leaflet-control-layers-scrollbar'),
            this._checkDisabledLayers(),
            this
          );
        },
        collapse: function() {
          return be(this._container, 'leaflet-control-layers-expanded'), this;
        },
        _initLayout: function() {
          var t = 'leaflet-control-layers',
            e = (this._container = de('div', t)),
            i = this.options.collapsed;
          e.setAttribute('aria-haspopup', !0), Fe(e), Ue(e);
          var o = (this._section = de('section', t + '-list'));
          i &&
            (this._map.on('click', this.collapse, this),
            nt || De(e, { mouseenter: this.expand, mouseleave: this.collapse }, this));
          var n = (this._layersLink = de('a', t + '-toggle', e));
          (n.href = '#'),
            (n.title = 'Layers'),
            At
              ? (De(n, 'click', je), De(n, 'click', this.expand, this))
              : De(n, 'focus', this.expand, this),
            i || this.expand(),
            (this._baseLayersList = de('div', t + '-base', o)),
            (this._separator = de('div', t + '-separator', o)),
            (this._overlaysList = de('div', t + '-overlays', o)),
            e.appendChild(o);
        },
        _getLayer: function(t) {
          for (var e = 0; e < this._layers.length; e++)
            if (this._layers[e] && a(this._layers[e].layer) === t) return this._layers[e];
        },
        _addLayer: function(t, e, i) {
          this._map && t.on('add remove', this._onLayerChange, this),
            this._layers.push({ layer: t, name: e, overlay: i }),
            this.options.sortLayers &&
              this._layers.sort(
                s(function(t, e) {
                  return this.options.sortFunction(t.layer, e.layer, t.name, e.name);
                }, this)
              ),
            this.options.autoZIndex &&
              t.setZIndex &&
              (this._lastZIndex++, t.setZIndex(this._lastZIndex)),
            this._expandIfNotCollapsed();
        },
        _update: function() {
          if (!this._container) return this;
          pe(this._baseLayersList), pe(this._overlaysList), (this._layerControlInputs = []);
          var t,
            e,
            i,
            o,
            n = 0;
          for (i = 0; i < this._layers.length; i++)
            (o = this._layers[i]),
              this._addItem(o),
              (e = e || o.overlay),
              (t = t || !o.overlay),
              (n += o.overlay ? 0 : 1);
          return (
            this.options.hideSingleBase &&
              ((t = t && n > 1), (this._baseLayersList.style.display = t ? '' : 'none')),
            (this._separator.style.display = e && t ? '' : 'none'),
            this
          );
        },
        _onLayerChange: function(t) {
          this._handlingClick || this._update();
          var e = this._getLayer(a(t.target)),
            i = e.overlay
              ? 'add' === t.type
                ? 'overlayadd'
                : 'overlayremove'
              : 'add' === t.type
              ? 'baselayerchange'
              : null;
          i && this._map.fire(i, e);
        },
        _createRadioElement: function(t, e) {
          var i =
              '<input type="radio" class="leaflet-control-layers-selector" name="' +
              t +
              '"' +
              (e ? ' checked="checked"' : '') +
              '/>',
            o = document.createElement('div');
          return (o.innerHTML = i), o.firstChild;
        },
        _addItem: function(t) {
          var e,
            i = document.createElement('label'),
            o = this._map.hasLayer(t.layer);
          t.overlay
            ? (((e = document.createElement('input')).type = 'checkbox'),
              (e.className = 'leaflet-control-layers-selector'),
              (e.defaultChecked = o))
            : (e = this._createRadioElement('leaflet-base-layers_' + a(this), o)),
            this._layerControlInputs.push(e),
            (e.layerId = a(t.layer)),
            De(e, 'click', this._onInputClick, this);
          var n = document.createElement('span');
          n.innerHTML = ' ' + t.name;
          var s = document.createElement('div');
          return (
            i.appendChild(s),
            s.appendChild(e),
            s.appendChild(n),
            (t.overlay ? this._overlaysList : this._baseLayersList).appendChild(i),
            this._checkDisabledLayers(),
            i
          );
        },
        _onInputClick: function() {
          var t,
            e,
            i = this._layerControlInputs,
            o = [],
            n = [];
          this._handlingClick = !0;
          for (var s = i.length - 1; s >= 0; s--)
            (t = i[s]),
              (e = this._getLayer(t.layerId).layer),
              t.checked ? o.push(e) : t.checked || n.push(e);
          for (s = 0; s < n.length; s++) this._map.hasLayer(n[s]) && this._map.removeLayer(n[s]);
          for (s = 0; s < o.length; s++) this._map.hasLayer(o[s]) || this._map.addLayer(o[s]);
          (this._handlingClick = !1), this._refocusOnMap();
        },
        _checkDisabledLayers: function() {
          for (
            var t, e, i = this._layerControlInputs, o = this._map.getZoom(), n = i.length - 1;
            n >= 0;
            n--
          )
            (t = i[n]),
              (e = this._getLayer(t.layerId).layer),
              (t.disabled =
                (void 0 !== e.options.minZoom && o < e.options.minZoom) ||
                (void 0 !== e.options.maxZoom && o > e.options.maxZoom));
        },
        _expandIfNotCollapsed: function() {
          return this._map && !this.options.collapsed && this.expand(), this;
        },
        _expand: function() {
          return this.expand();
        },
        _collapse: function() {
          return this.collapse();
        }
      }),
      ai = function(t, e, i) {
        return new ri(t, e, i);
      },
      li = ni.extend({
        options: {
          position: 'topleft',
          zoomInText: '+',
          zoomInTitle: 'Zoom in',
          zoomOutText: '&#x2212;',
          zoomOutTitle: 'Zoom out'
        },
        onAdd: function(t) {
          var e = 'leaflet-control-zoom',
            i = de('div', e + ' leaflet-bar'),
            o = this.options;
          return (
            (this._zoomInButton = this._createButton(
              o.zoomInText,
              o.zoomInTitle,
              e + '-in',
              i,
              this._zoomIn
            )),
            (this._zoomOutButton = this._createButton(
              o.zoomOutText,
              o.zoomOutTitle,
              e + '-out',
              i,
              this._zoomOut
            )),
            this._updateDisabled(),
            t.on('zoomend zoomlevelschange', this._updateDisabled, this),
            i
          );
        },
        onRemove: function(t) {
          t.off('zoomend zoomlevelschange', this._updateDisabled, this);
        },
        disable: function() {
          return (this._disabled = !0), this._updateDisabled(), this;
        },
        enable: function() {
          return (this._disabled = !1), this._updateDisabled(), this;
        },
        _zoomIn: function(t) {
          !this._disabled &&
            this._map._zoom < this._map.getMaxZoom() &&
            this._map.zoomIn(this._map.options.zoomDelta * (t.shiftKey ? 3 : 1));
        },
        _zoomOut: function(t) {
          !this._disabled &&
            this._map._zoom > this._map.getMinZoom() &&
            this._map.zoomOut(this._map.options.zoomDelta * (t.shiftKey ? 3 : 1));
        },
        _createButton: function(t, e, i, o, n) {
          var s = de('a', i, o);
          return (
            (s.innerHTML = t),
            (s.href = '#'),
            (s.title = e),
            s.setAttribute('role', 'button'),
            s.setAttribute('aria-label', e),
            Fe(s),
            De(s, 'click', je),
            De(s, 'click', n, this),
            De(s, 'click', this._refocusOnMap, this),
            s
          );
        },
        _updateDisabled: function() {
          var t = this._map,
            e = 'leaflet-disabled';
          be(this._zoomInButton, e),
            be(this._zoomOutButton, e),
            (this._disabled || t._zoom === t.getMinZoom()) && ve(this._zoomOutButton, e),
            (this._disabled || t._zoom === t.getMaxZoom()) && ve(this._zoomInButton, e);
        }
      });
    ii.mergeOptions({ zoomControl: !0 }),
      ii.addInitHook(function() {
        this.options.zoomControl &&
          ((this.zoomControl = new li()), this.addControl(this.zoomControl));
      });
    var hi = function(t) {
        return new li(t);
      },
      ci = ni.extend({
        options: { position: 'bottomleft', maxWidth: 100, metric: !0, imperial: !0 },
        onAdd: function(t) {
          var e = 'leaflet-control-scale',
            i = de('div', e),
            o = this.options;
          return (
            this._addScales(o, e + '-line', i),
            t.on(o.updateWhenIdle ? 'moveend' : 'move', this._update, this),
            t.whenReady(this._update, this),
            i
          );
        },
        onRemove: function(t) {
          t.off(this.options.updateWhenIdle ? 'moveend' : 'move', this._update, this);
        },
        _addScales: function(t, e, i) {
          t.metric && (this._mScale = de('div', e, i)),
            t.imperial && (this._iScale = de('div', e, i));
        },
        _update: function() {
          var t = this._map,
            e = t.getSize().y / 2,
            i = t.distance(
              t.containerPointToLatLng([0, e]),
              t.containerPointToLatLng([this.options.maxWidth, e])
            );
          this._updateScales(i);
        },
        _updateScales: function(t) {
          this.options.metric && t && this._updateMetric(t),
            this.options.imperial && t && this._updateImperial(t);
        },
        _updateMetric: function(t) {
          var e = this._getRoundNum(t),
            i = e < 1e3 ? e + ' m' : e / 1e3 + ' km';
          this._updateScale(this._mScale, i, e / t);
        },
        _updateImperial: function(t) {
          var e,
            i,
            o,
            n = 3.2808399 * t;
          n > 5280
            ? ((e = n / 5280),
              (i = this._getRoundNum(e)),
              this._updateScale(this._iScale, i + ' mi', i / e))
            : ((o = this._getRoundNum(n)), this._updateScale(this._iScale, o + ' ft', o / n));
        },
        _updateScale: function(t, e, i) {
          (t.style.width = Math.round(this.options.maxWidth * i) + 'px'), (t.innerHTML = e);
        },
        _getRoundNum: function(t) {
          var e = Math.pow(10, (Math.floor(t) + '').length - 1),
            i = t / e;
          return e * (i = i >= 10 ? 10 : i >= 5 ? 5 : i >= 3 ? 3 : i >= 2 ? 2 : 1);
        }
      }),
      di = function(t) {
        return new ci(t);
      },
      ui = ni.extend({
        options: {
          position: 'bottomright',
          prefix:
            '<a href="https://leafletjs.com" title="A JS library for interactive maps">Leaflet</a>'
        },
        initialize: function(t) {
          m(this, t), (this._attributions = {});
        },
        onAdd: function(t) {
          for (var e in ((t.attributionControl = this),
          (this._container = de('div', 'leaflet-control-attribution')),
          Fe(this._container),
          t._layers))
            t._layers[e].getAttribution && this.addAttribution(t._layers[e].getAttribution());
          return this._update(), this._container;
        },
        setPrefix: function(t) {
          return (this.options.prefix = t), this._update(), this;
        },
        addAttribution: function(t) {
          return t
            ? (this._attributions[t] || (this._attributions[t] = 0),
              this._attributions[t]++,
              this._update(),
              this)
            : this;
        },
        removeAttribution: function(t) {
          return t
            ? (this._attributions[t] && (this._attributions[t]--, this._update()), this)
            : this;
        },
        _update: function() {
          if (this._map) {
            var t = [];
            for (var e in this._attributions) this._attributions[e] && t.push(e);
            var i = [];
            this.options.prefix && i.push(this.options.prefix),
              t.length && i.push(t.join(', ')),
              (this._container.innerHTML = i.join(' | '));
          }
        }
      });
    ii.mergeOptions({ attributionControl: !0 }),
      ii.addInitHook(function() {
        this.options.attributionControl && new ui().addTo(this);
      });
    var pi = function(t) {
      return new ui(t);
    };
    (ni.Layers = ri),
      (ni.Zoom = li),
      (ni.Scale = ci),
      (ni.Attribution = ui),
      (si.layers = ai),
      (si.zoom = hi),
      (si.scale = di),
      (si.attribution = pi);
    var mi = $.extend({
      initialize: function(t) {
        this._map = t;
      },
      enable: function() {
        return this._enabled || ((this._enabled = !0), this.addHooks()), this;
      },
      disable: function() {
        return this._enabled ? ((this._enabled = !1), this.removeHooks(), this) : this;
      },
      enabled: function() {
        return !!this._enabled;
      }
    });
    mi.addTo = function(t, e) {
      return t.addHandler(e, this), this;
    };
    var gi,
      fi = { Events: M },
      vi = At ? 'touchstart mousedown' : 'mousedown',
      bi = {
        mousedown: 'mouseup',
        touchstart: 'touchend',
        pointerdown: 'touchend',
        MSPointerDown: 'touchend'
      },
      yi = {
        mousedown: 'mousemove',
        touchstart: 'touchmove',
        pointerdown: 'touchmove',
        MSPointerDown: 'touchmove'
      },
      _i = z.extend({
        options: { clickTolerance: 3 },
        initialize: function(t, e, i, o) {
          m(this, o),
            (this._element = t),
            (this._dragStartTarget = e || t),
            (this._preventOutline = i);
        },
        enable: function() {
          this._enabled ||
            (De(this._dragStartTarget, vi, this._onDown, this), (this._enabled = !0));
        },
        disable: function() {
          this._enabled &&
            (_i._dragging === this && this.finishDrag(),
            Ne(this._dragStartTarget, vi, this._onDown, this),
            (this._enabled = !1),
            (this._moved = !1));
        },
        _onDown: function(t) {
          if (
            !t._simulated &&
            this._enabled &&
            ((this._moved = !1),
            !fe(this._element, 'leaflet-zoom-anim') &&
              !(
                _i._dragging ||
                t.shiftKey ||
                (1 !== t.which && 1 !== t.button && !t.touches) ||
                ((_i._dragging = this),
                this._preventOutline && Oe(this._element),
                Te(),
                ee(),
                this._moving)
              ))
          ) {
            this.fire('down');
            var e = t.touches ? t.touches[0] : t,
              i = Le(this._element);
            (this._startPoint = new P(e.clientX, e.clientY)),
              (this._parentScale = ze(i)),
              De(document, yi[t.type], this._onMove, this),
              De(document, bi[t.type], this._onUp, this);
          }
        },
        _onMove: function(t) {
          if (!t._simulated && this._enabled)
            if (t.touches && t.touches.length > 1) this._moved = !0;
            else {
              var e = t.touches && 1 === t.touches.length ? t.touches[0] : t,
                i = new P(e.clientX, e.clientY)._subtract(this._startPoint);
              (i.x || i.y) &&
                (Math.abs(i.x) + Math.abs(i.y) < this.options.clickTolerance ||
                  ((i.x /= this._parentScale.x),
                  (i.y /= this._parentScale.y),
                  Ze(t),
                  this._moved ||
                    (this.fire('dragstart'),
                    (this._moved = !0),
                    (this._startPos = Se(this._element).subtract(i)),
                    ve(document.body, 'leaflet-dragging'),
                    (this._lastTarget = t.target || t.srcElement),
                    window.SVGElementInstance &&
                      this._lastTarget instanceof SVGElementInstance &&
                      (this._lastTarget = this._lastTarget.correspondingUseElement),
                    ve(this._lastTarget, 'leaflet-drag-target')),
                  (this._newPos = this._startPos.add(i)),
                  (this._moving = !0),
                  E(this._animRequest),
                  (this._lastEvent = t),
                  (this._animRequest = S(this._updatePosition, this, !0))));
            }
        },
        _updatePosition: function() {
          var t = { originalEvent: this._lastEvent };
          this.fire('predrag', t), Ce(this._element, this._newPos), this.fire('drag', t);
        },
        _onUp: function(t) {
          !t._simulated && this._enabled && this.finishDrag();
        },
        finishDrag: function() {
          for (var t in (be(document.body, 'leaflet-dragging'),
          this._lastTarget &&
            (be(this._lastTarget, 'leaflet-drag-target'), (this._lastTarget = null)),
          yi))
            Ne(document, yi[t], this._onMove, this), Ne(document, bi[t], this._onUp, this);
          $e(),
            ie(),
            this._moved &&
              this._moving &&
              (E(this._animRequest),
              this.fire('dragend', { distance: this._newPos.distanceTo(this._startPos) })),
            (this._moving = !1),
            (_i._dragging = !1);
        }
      });
    function xi(t, e) {
      if (!e || !t.length) return t.slice();
      var i = e * e;
      return (t = Ai((t = Si(t, i)), i));
    }
    function wi(t, e, i) {
      return Math.sqrt(Mi(t, e, i, !0));
    }
    function ki(t, e, i) {
      return Mi(t, e, i);
    }
    function Ai(t, e) {
      var i = t.length,
        o = new (typeof Uint8Array != void 0 + '' ? Uint8Array : Array)(i);
      (o[0] = o[i - 1] = 1), Ci(t, o, e, 0, i - 1);
      var n,
        s = [];
      for (n = 0; n < i; n++) o[n] && s.push(t[n]);
      return s;
    }
    function Ci(t, e, i, o, n) {
      var s,
        r,
        a,
        l = 0;
      for (r = o + 1; r <= n - 1; r++) (a = Mi(t[r], t[o], t[n], !0)) > l && ((s = r), (l = a));
      l > i && ((e[s] = 1), Ci(t, e, i, o, s), Ci(t, e, i, s, n));
    }
    function Si(t, e) {
      for (var i = [t[0]], o = 1, n = 0, s = t.length; o < s; o++)
        Oi(t[o], t[n]) > e && (i.push(t[o]), (n = o));
      return n < s - 1 && i.push(t[s - 1]), i;
    }
    function Ei(t, e, i, o, n) {
      var s,
        r,
        a,
        l = o ? gi : $i(t, i),
        h = $i(e, i);
      for (gi = h; ; ) {
        if (!(l | h)) return [t, e];
        if (l & h) return !1;
        (a = $i((r = Ti(t, e, (s = l || h), i, n)), i)),
          s === l ? ((t = r), (l = a)) : ((e = r), (h = a));
      }
    }
    function Ti(t, e, i, o, n) {
      var s,
        r,
        a = e.x - t.x,
        l = e.y - t.y,
        h = o.min,
        c = o.max;
      return (
        8 & i
          ? ((s = t.x + (a * (c.y - t.y)) / l), (r = c.y))
          : 4 & i
          ? ((s = t.x + (a * (h.y - t.y)) / l), (r = h.y))
          : 2 & i
          ? ((s = c.x), (r = t.y + (l * (c.x - t.x)) / a))
          : 1 & i && ((s = h.x), (r = t.y + (l * (h.x - t.x)) / a)),
        new P(s, r, n)
      );
    }
    function $i(t, e) {
      var i = 0;
      return (
        t.x < e.min.x ? (i |= 1) : t.x > e.max.x && (i |= 2),
        t.y < e.min.y ? (i |= 4) : t.y > e.max.y && (i |= 8),
        i
      );
    }
    function Oi(t, e) {
      var i = e.x - t.x,
        o = e.y - t.y;
      return i * i + o * o;
    }
    function Mi(t, e, i, o) {
      var n,
        s = e.x,
        r = e.y,
        a = i.x - s,
        l = i.y - r,
        h = a * a + l * l;
      return (
        h > 0 &&
          ((n = ((t.x - s) * a + (t.y - r) * l) / h) > 1
            ? ((s = i.x), (r = i.y))
            : n > 0 && ((s += a * n), (r += l * n))),
        (a = t.x - s),
        (l = t.y - r),
        o ? a * a + l * l : new P(s, r)
      );
    }
    function Li(t) {
      return !b(t[0]) || ('object' != typeof t[0][0] && void 0 !== t[0][0]);
    }
    function zi(t) {
      return console.warn('Deprecated use of _flat, please use L.LineUtil.isFlat instead.'), Li(t);
    }
    var Pi = (Object.freeze || Object)({
      simplify: xi,
      pointToSegmentDistance: wi,
      closestPointOnSegment: ki,
      clipSegment: Ei,
      _getEdgeIntersection: Ti,
      _getBitCode: $i,
      _sqClosestPointOnSegment: Mi,
      isFlat: Li,
      _flat: zi
    });
    function Di(t, e, i) {
      var o,
        n,
        s,
        r,
        a,
        l,
        h,
        c,
        d,
        u = [1, 4, 2, 8];
      for (n = 0, h = t.length; n < h; n++) t[n]._code = $i(t[n], e);
      for (r = 0; r < 4; r++) {
        for (c = u[r], o = [], n = 0, s = (h = t.length) - 1; n < h; s = n++)
          (a = t[n]),
            (l = t[s]),
            a._code & c
              ? l._code & c || (((d = Ti(l, a, c, e, i))._code = $i(d, e)), o.push(d))
              : (l._code & c && (((d = Ti(l, a, c, e, i))._code = $i(d, e)), o.push(d)), o.push(a));
        t = o;
      }
      return t;
    }
    var Ii = (Object.freeze || Object)({ clipPolygon: Di }),
      Ni = {
        project: function(t) {
          return new P(t.lng, t.lat);
        },
        unproject: function(t) {
          return new U(t.y, t.x);
        },
        bounds: new N([-180, -90], [180, 90])
      },
      Bi = {
        R: 6378137,
        R_MINOR: 6356752.314245179,
        bounds: new N([-20037508.34279, -15496570.73972], [20037508.34279, 18764656.23138]),
        project: function(t) {
          var e = Math.PI / 180,
            i = this.R,
            o = t.lat * e,
            n = this.R_MINOR / i,
            s = Math.sqrt(1 - n * n),
            r = s * Math.sin(o),
            a = Math.tan(Math.PI / 4 - o / 2) / Math.pow((1 - r) / (1 + r), s / 2);
          return (o = -i * Math.log(Math.max(a, 1e-10))), new P(t.lng * e * i, o);
        },
        unproject: function(t) {
          for (
            var e,
              i = 180 / Math.PI,
              o = this.R,
              n = this.R_MINOR / o,
              s = Math.sqrt(1 - n * n),
              r = Math.exp(-t.y / o),
              a = Math.PI / 2 - 2 * Math.atan(r),
              l = 0,
              h = 0.1;
            l < 15 && Math.abs(h) > 1e-7;
            l++
          )
            (e = s * Math.sin(a)),
              (e = Math.pow((1 - e) / (1 + e), s / 2)),
              (a += h = Math.PI / 2 - 2 * Math.atan(r * e) - a);
          return new U(a * i, (t.x * i) / o);
        }
      },
      Ri = (Object.freeze || Object)({ LonLat: Ni, Mercator: Bi, SphericalMercator: V }),
      qi = o({}, j, {
        code: 'EPSG:3395',
        projection: Bi,
        transformation: (function() {
          var t = 0.5 / (Math.PI * Bi.R);
          return G(t, 0.5, -t, 0.5);
        })()
      }),
      Ui = o({}, j, {
        code: 'EPSG:4326',
        projection: Ni,
        transformation: G(1 / 180, 1, -1 / 180, 0.5)
      }),
      Fi = o({}, Z, {
        projection: Ni,
        transformation: G(1, 0, -1, 0),
        scale: function(t) {
          return Math.pow(2, t);
        },
        zoom: function(t) {
          return Math.log(t) / Math.LN2;
        },
        distance: function(t, e) {
          var i = e.lng - t.lng,
            o = e.lat - t.lat;
          return Math.sqrt(i * i + o * o);
        },
        infinite: !0
      });
    (Z.Earth = j),
      (Z.EPSG3395 = qi),
      (Z.EPSG3857 = Q),
      (Z.EPSG900913 = K),
      (Z.EPSG4326 = Ui),
      (Z.Simple = Fi);
    var Zi = z.extend({
      options: { pane: 'overlayPane', attribution: null, bubblingMouseEvents: !0 },
      addTo: function(t) {
        return t.addLayer(this), this;
      },
      remove: function() {
        return this.removeFrom(this._map || this._mapToAdd);
      },
      removeFrom: function(t) {
        return t && t.removeLayer(this), this;
      },
      getPane: function(t) {
        return this._map.getPane(t ? this.options[t] || t : this.options.pane);
      },
      addInteractiveTarget: function(t) {
        return (this._map._targets[a(t)] = this), this;
      },
      removeInteractiveTarget: function(t) {
        return delete this._map._targets[a(t)], this;
      },
      getAttribution: function() {
        return this.options.attribution;
      },
      _layerAdd: function(t) {
        var e = t.target;
        if (e.hasLayer(this)) {
          if (((this._map = e), (this._zoomAnimated = e._zoomAnimated), this.getEvents)) {
            var i = this.getEvents();
            e.on(i, this),
              this.once(
                'remove',
                function() {
                  e.off(i, this);
                },
                this
              );
          }
          this.onAdd(e),
            this.getAttribution &&
              e.attributionControl &&
              e.attributionControl.addAttribution(this.getAttribution()),
            this.fire('add'),
            e.fire('layeradd', { layer: this });
        }
      }
    });
    ii.include({
      addLayer: function(t) {
        if (!t._layerAdd) throw new Error('The provided object is not a Layer.');
        var e = a(t);
        return (
          this._layers[e] ||
            ((this._layers[e] = t),
            (t._mapToAdd = this),
            t.beforeAdd && t.beforeAdd(this),
            this.whenReady(t._layerAdd, t)),
          this
        );
      },
      removeLayer: function(t) {
        var e = a(t);
        return this._layers[e]
          ? (this._loaded && t.onRemove(this),
            t.getAttribution &&
              this.attributionControl &&
              this.attributionControl.removeAttribution(t.getAttribution()),
            delete this._layers[e],
            this._loaded && (this.fire('layerremove', { layer: t }), t.fire('remove')),
            (t._map = t._mapToAdd = null),
            this)
          : this;
      },
      hasLayer: function(t) {
        return !!t && a(t) in this._layers;
      },
      eachLayer: function(t, e) {
        for (var i in this._layers) t.call(e, this._layers[i]);
        return this;
      },
      _addLayers: function(t) {
        for (var e = 0, i = (t = t ? (b(t) ? t : [t]) : []).length; e < i; e++) this.addLayer(t[e]);
      },
      _addZoomLimit: function(t) {
        (!isNaN(t.options.maxZoom) && isNaN(t.options.minZoom)) ||
          ((this._zoomBoundLayers[a(t)] = t), this._updateZoomLevels());
      },
      _removeZoomLimit: function(t) {
        var e = a(t);
        this._zoomBoundLayers[e] && (delete this._zoomBoundLayers[e], this._updateZoomLevels());
      },
      _updateZoomLevels: function() {
        var t = 1 / 0,
          e = -1 / 0,
          i = this._getZoomSpan();
        for (var o in this._zoomBoundLayers) {
          var n = this._zoomBoundLayers[o].options;
          (t = void 0 === n.minZoom ? t : Math.min(t, n.minZoom)),
            (e = void 0 === n.maxZoom ? e : Math.max(e, n.maxZoom));
        }
        (this._layersMaxZoom = e === -1 / 0 ? void 0 : e),
          (this._layersMinZoom = t === 1 / 0 ? void 0 : t),
          i !== this._getZoomSpan() && this.fire('zoomlevelschange'),
          void 0 === this.options.maxZoom &&
            this._layersMaxZoom &&
            this.getZoom() > this._layersMaxZoom &&
            this.setZoom(this._layersMaxZoom),
          void 0 === this.options.minZoom &&
            this._layersMinZoom &&
            this.getZoom() < this._layersMinZoom &&
            this.setZoom(this._layersMinZoom);
      }
    });
    var ji = Zi.extend({
        initialize: function(t, e) {
          var i, o;
          if ((m(this, e), (this._layers = {}), t))
            for (i = 0, o = t.length; i < o; i++) this.addLayer(t[i]);
        },
        addLayer: function(t) {
          var e = this.getLayerId(t);
          return (this._layers[e] = t), this._map && this._map.addLayer(t), this;
        },
        removeLayer: function(t) {
          var e = t in this._layers ? t : this.getLayerId(t);
          return (
            this._map && this._layers[e] && this._map.removeLayer(this._layers[e]),
            delete this._layers[e],
            this
          );
        },
        hasLayer: function(t) {
          return !!t && (t in this._layers || this.getLayerId(t) in this._layers);
        },
        clearLayers: function() {
          return this.eachLayer(this.removeLayer, this);
        },
        invoke: function(t) {
          var e,
            i,
            o = Array.prototype.slice.call(arguments, 1);
          for (e in this._layers) (i = this._layers[e])[t] && i[t].apply(i, o);
          return this;
        },
        onAdd: function(t) {
          this.eachLayer(t.addLayer, t);
        },
        onRemove: function(t) {
          this.eachLayer(t.removeLayer, t);
        },
        eachLayer: function(t, e) {
          for (var i in this._layers) t.call(e, this._layers[i]);
          return this;
        },
        getLayer: function(t) {
          return this._layers[t];
        },
        getLayers: function() {
          var t = [];
          return this.eachLayer(t.push, t), t;
        },
        setZIndex: function(t) {
          return this.invoke('setZIndex', t);
        },
        getLayerId: function(t) {
          return a(t);
        }
      }),
      Hi = function(t, e) {
        return new ji(t, e);
      },
      Vi = ji.extend({
        addLayer: function(t) {
          return this.hasLayer(t)
            ? this
            : (t.addEventParent(this),
              ji.prototype.addLayer.call(this, t),
              this.fire('layeradd', { layer: t }));
        },
        removeLayer: function(t) {
          return this.hasLayer(t)
            ? (t in this._layers && (t = this._layers[t]),
              t.removeEventParent(this),
              ji.prototype.removeLayer.call(this, t),
              this.fire('layerremove', { layer: t }))
            : this;
        },
        setStyle: function(t) {
          return this.invoke('setStyle', t);
        },
        bringToFront: function() {
          return this.invoke('bringToFront');
        },
        bringToBack: function() {
          return this.invoke('bringToBack');
        },
        getBounds: function() {
          var t = new R();
          for (var e in this._layers) {
            var i = this._layers[e];
            t.extend(i.getBounds ? i.getBounds() : i.getLatLng());
          }
          return t;
        }
      }),
      Wi = function(t) {
        return new Vi(t);
      },
      Gi = $.extend({
        options: { popupAnchor: [0, 0], tooltipAnchor: [0, 0] },
        initialize: function(t) {
          m(this, t);
        },
        createIcon: function(t) {
          return this._createIcon('icon', t);
        },
        createShadow: function(t) {
          return this._createIcon('shadow', t);
        },
        _createIcon: function(t, e) {
          var i = this._getIconUrl(t);
          if (!i) {
            if ('icon' === t) throw new Error('iconUrl not set in Icon options (see the docs).');
            return null;
          }
          var o = this._createImg(i, e && 'IMG' === e.tagName ? e : null);
          return this._setIconStyles(o, t), o;
        },
        _setIconStyles: function(t, e) {
          var i = this.options,
            o = i[e + 'Size'];
          'number' == typeof o && (o = [o, o]);
          var n = I(o),
            s = I(('shadow' === e && i.shadowAnchor) || i.iconAnchor || (n && n.divideBy(2, !0)));
          (t.className = 'leaflet-marker-' + e + ' ' + (i.className || '')),
            s && ((t.style.marginLeft = -s.x + 'px'), (t.style.marginTop = -s.y + 'px')),
            n && ((t.style.width = n.x + 'px'), (t.style.height = n.y + 'px'));
        },
        _createImg: function(t, e) {
          return ((e = e || document.createElement('img')).src = t), e;
        },
        _getIconUrl: function(t) {
          return (Et && this.options[t + 'RetinaUrl']) || this.options[t + 'Url'];
        }
      });
    function Qi(t) {
      return new Gi(t);
    }
    var Ki = Gi.extend({
        options: {
          iconUrl: 'marker-icon.png',
          iconRetinaUrl: 'marker-icon-2x.png',
          shadowUrl: 'marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          tooltipAnchor: [16, -28],
          shadowSize: [41, 41]
        },
        _getIconUrl: function(t) {
          return (
            Ki.imagePath || (Ki.imagePath = this._detectIconPath()),
            (this.options.imagePath || Ki.imagePath) + Gi.prototype._getIconUrl.call(this, t)
          );
        },
        _detectIconPath: function() {
          var t = de('div', 'leaflet-default-icon-path', document.body),
            e = ce(t, 'background-image') || ce(t, 'backgroundImage');
          return (
            document.body.removeChild(t),
            (e =
              null === e || 0 !== e.indexOf('url')
                ? ''
                : e.replace(/^url\(["']?/, '').replace(/marker-icon\.png["']?\)$/, ''))
          );
        }
      }),
      Yi = mi.extend({
        initialize: function(t) {
          this._marker = t;
        },
        addHooks: function() {
          var t = this._marker._icon;
          this._draggable || (this._draggable = new _i(t, t, !0)),
            this._draggable
              .on(
                {
                  dragstart: this._onDragStart,
                  predrag: this._onPreDrag,
                  drag: this._onDrag,
                  dragend: this._onDragEnd
                },
                this
              )
              .enable(),
            ve(t, 'leaflet-marker-draggable');
        },
        removeHooks: function() {
          this._draggable
            .off(
              {
                dragstart: this._onDragStart,
                predrag: this._onPreDrag,
                drag: this._onDrag,
                dragend: this._onDragEnd
              },
              this
            )
            .disable(),
            this._marker._icon && be(this._marker._icon, 'leaflet-marker-draggable');
        },
        moved: function() {
          return this._draggable && this._draggable._moved;
        },
        _adjustPan: function(t) {
          var e = this._marker,
            i = e._map,
            o = this._marker.options.autoPanSpeed,
            n = this._marker.options.autoPanPadding,
            s = Se(e._icon),
            r = i.getPixelBounds(),
            a = i.getPixelOrigin(),
            l = B(r.min._subtract(a).add(n), r.max._subtract(a).subtract(n));
          if (!l.contains(s)) {
            var h = I(
              (Math.max(l.max.x, s.x) - l.max.x) / (r.max.x - l.max.x) -
                (Math.min(l.min.x, s.x) - l.min.x) / (r.min.x - l.min.x),
              (Math.max(l.max.y, s.y) - l.max.y) / (r.max.y - l.max.y) -
                (Math.min(l.min.y, s.y) - l.min.y) / (r.min.y - l.min.y)
            ).multiplyBy(o);
            i.panBy(h, { animate: !1 }),
              this._draggable._newPos._add(h),
              this._draggable._startPos._add(h),
              Ce(e._icon, this._draggable._newPos),
              this._onDrag(t),
              (this._panRequest = S(this._adjustPan.bind(this, t)));
          }
        },
        _onDragStart: function() {
          (this._oldLatLng = this._marker.getLatLng()),
            this._marker
              .closePopup()
              .fire('movestart')
              .fire('dragstart');
        },
        _onPreDrag: function(t) {
          this._marker.options.autoPan &&
            (E(this._panRequest), (this._panRequest = S(this._adjustPan.bind(this, t))));
        },
        _onDrag: function(t) {
          var e = this._marker,
            i = e._shadow,
            o = Se(e._icon),
            n = e._map.layerPointToLatLng(o);
          i && Ce(i, o),
            (e._latlng = n),
            (t.latlng = n),
            (t.oldLatLng = this._oldLatLng),
            e.fire('move', t).fire('drag', t);
        },
        _onDragEnd: function(t) {
          E(this._panRequest),
            delete this._oldLatLng,
            this._marker.fire('moveend').fire('dragend', t);
        }
      }),
      Ji = Zi.extend({
        options: {
          icon: new Ki(),
          interactive: !0,
          keyboard: !0,
          title: '',
          alt: '',
          zIndexOffset: 0,
          opacity: 1,
          riseOnHover: !1,
          riseOffset: 250,
          pane: 'markerPane',
          shadowPane: 'shadowPane',
          bubblingMouseEvents: !1,
          draggable: !1,
          autoPan: !1,
          autoPanPadding: [50, 50],
          autoPanSpeed: 10
        },
        initialize: function(t, e) {
          m(this, e), (this._latlng = F(t));
        },
        onAdd: function(t) {
          (this._zoomAnimated = this._zoomAnimated && t.options.markerZoomAnimation),
            this._zoomAnimated && t.on('zoomanim', this._animateZoom, this),
            this._initIcon(),
            this.update();
        },
        onRemove: function(t) {
          this.dragging &&
            this.dragging.enabled() &&
            ((this.options.draggable = !0), this.dragging.removeHooks()),
            delete this.dragging,
            this._zoomAnimated && t.off('zoomanim', this._animateZoom, this),
            this._removeIcon(),
            this._removeShadow();
        },
        getEvents: function() {
          return { zoom: this.update, viewreset: this.update };
        },
        getLatLng: function() {
          return this._latlng;
        },
        setLatLng: function(t) {
          var e = this._latlng;
          return (
            (this._latlng = F(t)),
            this.update(),
            this.fire('move', { oldLatLng: e, latlng: this._latlng })
          );
        },
        setZIndexOffset: function(t) {
          return (this.options.zIndexOffset = t), this.update();
        },
        getIcon: function() {
          return this.options.icon;
        },
        setIcon: function(t) {
          return (
            (this.options.icon = t),
            this._map && (this._initIcon(), this.update()),
            this._popup && this.bindPopup(this._popup, this._popup.options),
            this
          );
        },
        getElement: function() {
          return this._icon;
        },
        update: function() {
          if (this._icon && this._map) {
            var t = this._map.latLngToLayerPoint(this._latlng).round();
            this._setPos(t);
          }
          return this;
        },
        _initIcon: function() {
          var t = this.options,
            e = 'leaflet-zoom-' + (this._zoomAnimated ? 'animated' : 'hide'),
            i = t.icon.createIcon(this._icon),
            o = !1;
          i !== this._icon &&
            (this._icon && this._removeIcon(),
            (o = !0),
            t.title && (i.title = t.title),
            'IMG' === i.tagName && (i.alt = t.alt || '')),
            ve(i, e),
            t.keyboard && (i.tabIndex = '0'),
            (this._icon = i),
            t.riseOnHover &&
              this.on({ mouseover: this._bringToFront, mouseout: this._resetZIndex });
          var n = t.icon.createShadow(this._shadow),
            s = !1;
          n !== this._shadow && (this._removeShadow(), (s = !0)),
            n && (ve(n, e), (n.alt = '')),
            (this._shadow = n),
            t.opacity < 1 && this._updateOpacity(),
            o && this.getPane().appendChild(this._icon),
            this._initInteraction(),
            n && s && this.getPane(t.shadowPane).appendChild(this._shadow);
        },
        _removeIcon: function() {
          this.options.riseOnHover &&
            this.off({ mouseover: this._bringToFront, mouseout: this._resetZIndex }),
            ue(this._icon),
            this.removeInteractiveTarget(this._icon),
            (this._icon = null);
        },
        _removeShadow: function() {
          this._shadow && ue(this._shadow), (this._shadow = null);
        },
        _setPos: function(t) {
          Ce(this._icon, t),
            this._shadow && Ce(this._shadow, t),
            (this._zIndex = t.y + this.options.zIndexOffset),
            this._resetZIndex();
        },
        _updateZIndex: function(t) {
          this._icon.style.zIndex = this._zIndex + t;
        },
        _animateZoom: function(t) {
          var e = this._map._latLngToNewLayerPoint(this._latlng, t.zoom, t.center).round();
          this._setPos(e);
        },
        _initInteraction: function() {
          if (
            this.options.interactive &&
            (ve(this._icon, 'leaflet-interactive'), this.addInteractiveTarget(this._icon), Yi)
          ) {
            var t = this.options.draggable;
            this.dragging && ((t = this.dragging.enabled()), this.dragging.disable()),
              (this.dragging = new Yi(this)),
              t && this.dragging.enable();
          }
        },
        setOpacity: function(t) {
          return (this.options.opacity = t), this._map && this._updateOpacity(), this;
        },
        _updateOpacity: function() {
          var t = this.options.opacity;
          this._icon && xe(this._icon, t), this._shadow && xe(this._shadow, t);
        },
        _bringToFront: function() {
          this._updateZIndex(this.options.riseOffset);
        },
        _resetZIndex: function() {
          this._updateZIndex(0);
        },
        _getPopupAnchor: function() {
          return this.options.icon.options.popupAnchor;
        },
        _getTooltipAnchor: function() {
          return this.options.icon.options.tooltipAnchor;
        }
      });
    function Xi(t, e) {
      return new Ji(t, e);
    }
    var to = Zi.extend({
        options: {
          stroke: !0,
          color: '#3388ff',
          weight: 3,
          opacity: 1,
          lineCap: 'round',
          lineJoin: 'round',
          dashArray: null,
          dashOffset: null,
          fill: !1,
          fillColor: null,
          fillOpacity: 0.2,
          fillRule: 'evenodd',
          interactive: !0,
          bubblingMouseEvents: !0
        },
        beforeAdd: function(t) {
          this._renderer = t.getRenderer(this);
        },
        onAdd: function() {
          this._renderer._initPath(this), this._reset(), this._renderer._addPath(this);
        },
        onRemove: function() {
          this._renderer._removePath(this);
        },
        redraw: function() {
          return this._map && this._renderer._updatePath(this), this;
        },
        setStyle: function(t) {
          return (
            m(this, t),
            this._renderer &&
              (this._renderer._updateStyle(this),
              this.options.stroke && t.hasOwnProperty('weight') && this._updateBounds()),
            this
          );
        },
        bringToFront: function() {
          return this._renderer && this._renderer._bringToFront(this), this;
        },
        bringToBack: function() {
          return this._renderer && this._renderer._bringToBack(this), this;
        },
        getElement: function() {
          return this._path;
        },
        _reset: function() {
          this._project(), this._update();
        },
        _clickTolerance: function() {
          return (
            (this.options.stroke ? this.options.weight / 2 : 0) + this._renderer.options.tolerance
          );
        }
      }),
      eo = to.extend({
        options: { fill: !0, radius: 10 },
        initialize: function(t, e) {
          m(this, e), (this._latlng = F(t)), (this._radius = this.options.radius);
        },
        setLatLng: function(t) {
          return (this._latlng = F(t)), this.redraw(), this.fire('move', { latlng: this._latlng });
        },
        getLatLng: function() {
          return this._latlng;
        },
        setRadius: function(t) {
          return (this.options.radius = this._radius = t), this.redraw();
        },
        getRadius: function() {
          return this._radius;
        },
        setStyle: function(t) {
          var e = (t && t.radius) || this._radius;
          return to.prototype.setStyle.call(this, t), this.setRadius(e), this;
        },
        _project: function() {
          (this._point = this._map.latLngToLayerPoint(this._latlng)), this._updateBounds();
        },
        _updateBounds: function() {
          var t = this._radius,
            e = this._radiusY || t,
            i = this._clickTolerance(),
            o = [t + i, e + i];
          this._pxBounds = new N(this._point.subtract(o), this._point.add(o));
        },
        _update: function() {
          this._map && this._updatePath();
        },
        _updatePath: function() {
          this._renderer._updateCircle(this);
        },
        _empty: function() {
          return this._radius && !this._renderer._bounds.intersects(this._pxBounds);
        },
        _containsPoint: function(t) {
          return t.distanceTo(this._point) <= this._radius + this._clickTolerance();
        }
      });
    function io(t, e) {
      return new eo(t, e);
    }
    var oo = eo.extend({
      initialize: function(t, e, i) {
        if (
          ('number' == typeof e && (e = o({}, i, { radius: e })),
          m(this, e),
          (this._latlng = F(t)),
          isNaN(this.options.radius))
        )
          throw new Error('Circle radius cannot be NaN');
        this._mRadius = this.options.radius;
      },
      setRadius: function(t) {
        return (this._mRadius = t), this.redraw();
      },
      getRadius: function() {
        return this._mRadius;
      },
      getBounds: function() {
        var t = [this._radius, this._radiusY || this._radius];
        return new R(
          this._map.layerPointToLatLng(this._point.subtract(t)),
          this._map.layerPointToLatLng(this._point.add(t))
        );
      },
      setStyle: to.prototype.setStyle,
      _project: function() {
        var t = this._latlng.lng,
          e = this._latlng.lat,
          i = this._map,
          o = i.options.crs;
        if (o.distance === j.distance) {
          var n = Math.PI / 180,
            s = this._mRadius / j.R / n,
            r = i.project([e + s, t]),
            a = i.project([e - s, t]),
            l = r.add(a).divideBy(2),
            h = i.unproject(l).lat,
            c =
              Math.acos(
                (Math.cos(s * n) - Math.sin(e * n) * Math.sin(h * n)) /
                  (Math.cos(e * n) * Math.cos(h * n))
              ) / n;
          (isNaN(c) || 0 === c) && (c = s / Math.cos((Math.PI / 180) * e)),
            (this._point = l.subtract(i.getPixelOrigin())),
            (this._radius = isNaN(c) ? 0 : l.x - i.project([h, t - c]).x),
            (this._radiusY = l.y - r.y);
        } else {
          var d = o.unproject(o.project(this._latlng).subtract([this._mRadius, 0]));
          (this._point = i.latLngToLayerPoint(this._latlng)),
            (this._radius = this._point.x - i.latLngToLayerPoint(d).x);
        }
        this._updateBounds();
      }
    });
    function no(t, e, i) {
      return new oo(t, e, i);
    }
    var so = to.extend({
      options: { smoothFactor: 1, noClip: !1 },
      initialize: function(t, e) {
        m(this, e), this._setLatLngs(t);
      },
      getLatLngs: function() {
        return this._latlngs;
      },
      setLatLngs: function(t) {
        return this._setLatLngs(t), this.redraw();
      },
      isEmpty: function() {
        return !this._latlngs.length;
      },
      closestLayerPoint: function(t) {
        for (var e, i, o = 1 / 0, n = null, s = Mi, r = 0, a = this._parts.length; r < a; r++)
          for (var l = this._parts[r], h = 1, c = l.length; h < c; h++) {
            var d = s(t, (e = l[h - 1]), (i = l[h]), !0);
            d < o && ((o = d), (n = s(t, e, i)));
          }
        return n && (n.distance = Math.sqrt(o)), n;
      },
      getCenter: function() {
        if (!this._map) throw new Error('Must add layer to map before using getCenter()');
        var t,
          e,
          i,
          o,
          n,
          s,
          r,
          a = this._rings[0],
          l = a.length;
        if (!l) return null;
        for (t = 0, e = 0; t < l - 1; t++) e += a[t].distanceTo(a[t + 1]) / 2;
        if (0 === e) return this._map.layerPointToLatLng(a[0]);
        for (t = 0, o = 0; t < l - 1; t++)
          if (((n = a[t]), (s = a[t + 1]), (o += i = n.distanceTo(s)) > e))
            return (
              (r = (o - e) / i),
              this._map.layerPointToLatLng([s.x - r * (s.x - n.x), s.y - r * (s.y - n.y)])
            );
      },
      getBounds: function() {
        return this._bounds;
      },
      addLatLng: function(t, e) {
        return (
          (e = e || this._defaultShape()),
          (t = F(t)),
          e.push(t),
          this._bounds.extend(t),
          this.redraw()
        );
      },
      _setLatLngs: function(t) {
        (this._bounds = new R()), (this._latlngs = this._convertLatLngs(t));
      },
      _defaultShape: function() {
        return Li(this._latlngs) ? this._latlngs : this._latlngs[0];
      },
      _convertLatLngs: function(t) {
        for (var e = [], i = Li(t), o = 0, n = t.length; o < n; o++)
          i ? ((e[o] = F(t[o])), this._bounds.extend(e[o])) : (e[o] = this._convertLatLngs(t[o]));
        return e;
      },
      _project: function() {
        var t = new N();
        (this._rings = []),
          this._projectLatlngs(this._latlngs, this._rings, t),
          this._bounds.isValid() && t.isValid() && ((this._rawPxBounds = t), this._updateBounds());
      },
      _updateBounds: function() {
        var t = this._clickTolerance(),
          e = new P(t, t);
        this._pxBounds = new N([this._rawPxBounds.min.subtract(e), this._rawPxBounds.max.add(e)]);
      },
      _projectLatlngs: function(t, e, i) {
        var o,
          n,
          s = t[0] instanceof U,
          r = t.length;
        if (s) {
          for (n = [], o = 0; o < r; o++)
            (n[o] = this._map.latLngToLayerPoint(t[o])), i.extend(n[o]);
          e.push(n);
        } else for (o = 0; o < r; o++) this._projectLatlngs(t[o], e, i);
      },
      _clipPoints: function() {
        var t = this._renderer._bounds;
        if (((this._parts = []), this._pxBounds && this._pxBounds.intersects(t)))
          if (this.options.noClip) this._parts = this._rings;
          else {
            var e,
              i,
              o,
              n,
              s,
              r,
              a,
              l = this._parts;
            for (e = 0, o = 0, n = this._rings.length; e < n; e++)
              for (i = 0, s = (a = this._rings[e]).length; i < s - 1; i++)
                (r = Ei(a[i], a[i + 1], t, i, !0)) &&
                  ((l[o] = l[o] || []),
                  l[o].push(r[0]),
                  (r[1] === a[i + 1] && i !== s - 2) || (l[o].push(r[1]), o++));
          }
      },
      _simplifyPoints: function() {
        for (var t = this._parts, e = this.options.smoothFactor, i = 0, o = t.length; i < o; i++)
          t[i] = xi(t[i], e);
      },
      _update: function() {
        this._map && (this._clipPoints(), this._simplifyPoints(), this._updatePath());
      },
      _updatePath: function() {
        this._renderer._updatePoly(this);
      },
      _containsPoint: function(t, e) {
        var i,
          o,
          n,
          s,
          r,
          a,
          l = this._clickTolerance();
        if (!this._pxBounds || !this._pxBounds.contains(t)) return !1;
        for (i = 0, s = this._parts.length; i < s; i++)
          for (o = 0, n = (r = (a = this._parts[i]).length) - 1; o < r; n = o++)
            if ((e || 0 !== o) && wi(t, a[n], a[o]) <= l) return !0;
        return !1;
      }
    });
    function ro(t, e) {
      return new so(t, e);
    }
    so._flat = zi;
    var ao = so.extend({
      options: { fill: !0 },
      isEmpty: function() {
        return !this._latlngs.length || !this._latlngs[0].length;
      },
      getCenter: function() {
        if (!this._map) throw new Error('Must add layer to map before using getCenter()');
        var t,
          e,
          i,
          o,
          n,
          s,
          r,
          a,
          l,
          h = this._rings[0],
          c = h.length;
        if (!c) return null;
        for (s = r = a = 0, t = 0, e = c - 1; t < c; e = t++)
          (i = h[t]),
            (o = h[e]),
            (n = i.y * o.x - o.y * i.x),
            (r += (i.x + o.x) * n),
            (a += (i.y + o.y) * n),
            (s += 3 * n);
        return (l = 0 === s ? h[0] : [r / s, a / s]), this._map.layerPointToLatLng(l);
      },
      _convertLatLngs: function(t) {
        var e = so.prototype._convertLatLngs.call(this, t),
          i = e.length;
        return i >= 2 && e[0] instanceof U && e[0].equals(e[i - 1]) && e.pop(), e;
      },
      _setLatLngs: function(t) {
        so.prototype._setLatLngs.call(this, t),
          Li(this._latlngs) && (this._latlngs = [this._latlngs]);
      },
      _defaultShape: function() {
        return Li(this._latlngs[0]) ? this._latlngs[0] : this._latlngs[0][0];
      },
      _clipPoints: function() {
        var t = this._renderer._bounds,
          e = this.options.weight,
          i = new P(e, e);
        if (
          ((t = new N(t.min.subtract(i), t.max.add(i))),
          (this._parts = []),
          this._pxBounds && this._pxBounds.intersects(t))
        )
          if (this.options.noClip) this._parts = this._rings;
          else
            for (var o, n = 0, s = this._rings.length; n < s; n++)
              (o = Di(this._rings[n], t, !0)).length && this._parts.push(o);
      },
      _updatePath: function() {
        this._renderer._updatePoly(this, !0);
      },
      _containsPoint: function(t) {
        var e,
          i,
          o,
          n,
          s,
          r,
          a,
          l,
          h = !1;
        if (!this._pxBounds || !this._pxBounds.contains(t)) return !1;
        for (n = 0, a = this._parts.length; n < a; n++)
          for (s = 0, r = (l = (e = this._parts[n]).length) - 1; s < l; r = s++)
            (i = e[s]),
              (o = e[r]),
              i.y > t.y != o.y > t.y &&
                t.x < ((o.x - i.x) * (t.y - i.y)) / (o.y - i.y) + i.x &&
                (h = !h);
        return h || so.prototype._containsPoint.call(this, t, !0);
      }
    });
    function lo(t, e) {
      return new ao(t, e);
    }
    var ho = Vi.extend({
      initialize: function(t, e) {
        m(this, e), (this._layers = {}), t && this.addData(t);
      },
      addData: function(t) {
        var e,
          i,
          o,
          n = b(t) ? t : t.features;
        if (n) {
          for (e = 0, i = n.length; e < i; e++)
            ((o = n[e]).geometries || o.geometry || o.features || o.coordinates) && this.addData(o);
          return this;
        }
        var s = this.options;
        if (s.filter && !s.filter(t)) return this;
        var r = co(t, s);
        return r
          ? ((r.feature = vo(t)),
            (r.defaultOptions = r.options),
            this.resetStyle(r),
            s.onEachFeature && s.onEachFeature(t, r),
            this.addLayer(r))
          : this;
      },
      resetStyle: function(t) {
        return (
          (t.options = o({}, t.defaultOptions)), this._setLayerStyle(t, this.options.style), this
        );
      },
      setStyle: function(t) {
        return this.eachLayer(function(e) {
          this._setLayerStyle(e, t);
        }, this);
      },
      _setLayerStyle: function(t, e) {
        t.setStyle && ('function' == typeof e && (e = e(t.feature)), t.setStyle(e));
      }
    });
    function co(t, e) {
      var i,
        o,
        n,
        s,
        r = 'Feature' === t.type ? t.geometry : t,
        a = r ? r.coordinates : null,
        l = [],
        h = e && e.pointToLayer,
        c = (e && e.coordsToLatLng) || uo;
      if (!a && !r) return null;
      switch (r.type) {
        case 'Point':
          return (i = c(a)), h ? h(t, i) : new Ji(i);
        case 'MultiPoint':
          for (n = 0, s = a.length; n < s; n++) (i = c(a[n])), l.push(h ? h(t, i) : new Ji(i));
          return new Vi(l);
        case 'LineString':
        case 'MultiLineString':
          return (o = po(a, 'LineString' === r.type ? 0 : 1, c)), new so(o, e);
        case 'Polygon':
        case 'MultiPolygon':
          return (o = po(a, 'Polygon' === r.type ? 1 : 2, c)), new ao(o, e);
        case 'GeometryCollection':
          for (n = 0, s = r.geometries.length; n < s; n++) {
            var d = co({ geometry: r.geometries[n], type: 'Feature', properties: t.properties }, e);
            d && l.push(d);
          }
          return new Vi(l);
        default:
          throw new Error('Invalid GeoJSON object.');
      }
    }
    function uo(t) {
      return new U(t[1], t[0], t[2]);
    }
    function po(t, e, i) {
      for (var o, n = [], s = 0, r = t.length; s < r; s++)
        (o = e ? po(t[s], e - 1, i) : (i || uo)(t[s])), n.push(o);
      return n;
    }
    function mo(t, e) {
      return (
        (e = 'number' == typeof e ? e : 6),
        void 0 !== t.alt ? [d(t.lng, e), d(t.lat, e), d(t.alt, e)] : [d(t.lng, e), d(t.lat, e)]
      );
    }
    function go(t, e, i, o) {
      for (var n = [], s = 0, r = t.length; s < r; s++)
        n.push(e ? go(t[s], e - 1, i, o) : mo(t[s], o));
      return !e && i && n.push(n[0]), n;
    }
    function fo(t, e) {
      return t.feature ? o({}, t.feature, { geometry: e }) : vo(e);
    }
    function vo(t) {
      return 'Feature' === t.type || 'FeatureCollection' === t.type
        ? t
        : { type: 'Feature', properties: {}, geometry: t };
    }
    var bo = {
      toGeoJSON: function(t) {
        return fo(this, { type: 'Point', coordinates: mo(this.getLatLng(), t) });
      }
    };
    function yo(t, e) {
      return new ho(t, e);
    }
    Ji.include(bo),
      oo.include(bo),
      eo.include(bo),
      so.include({
        toGeoJSON: function(t) {
          var e = !Li(this._latlngs);
          return fo(this, {
            type: (e ? 'Multi' : '') + 'LineString',
            coordinates: go(this._latlngs, e ? 1 : 0, !1, t)
          });
        }
      }),
      ao.include({
        toGeoJSON: function(t) {
          var e = !Li(this._latlngs),
            i = e && !Li(this._latlngs[0]),
            o = go(this._latlngs, i ? 2 : e ? 1 : 0, !0, t);
          return e || (o = [o]), fo(this, { type: (i ? 'Multi' : '') + 'Polygon', coordinates: o });
        }
      }),
      ji.include({
        toMultiPoint: function(t) {
          var e = [];
          return (
            this.eachLayer(function(i) {
              e.push(i.toGeoJSON(t).geometry.coordinates);
            }),
            fo(this, { type: 'MultiPoint', coordinates: e })
          );
        },
        toGeoJSON: function(t) {
          var e = this.feature && this.feature.geometry && this.feature.geometry.type;
          if ('MultiPoint' === e) return this.toMultiPoint(t);
          var i = 'GeometryCollection' === e,
            o = [];
          return (
            this.eachLayer(function(e) {
              if (e.toGeoJSON) {
                var n = e.toGeoJSON(t);
                if (i) o.push(n.geometry);
                else {
                  var s = vo(n);
                  'FeatureCollection' === s.type ? o.push.apply(o, s.features) : o.push(s);
                }
              }
            }),
            i
              ? fo(this, { geometries: o, type: 'GeometryCollection' })
              : { type: 'FeatureCollection', features: o }
          );
        }
      });
    var _o = yo,
      xo = Zi.extend({
        options: {
          opacity: 1,
          alt: '',
          interactive: !1,
          crossOrigin: !1,
          errorOverlayUrl: '',
          zIndex: 1,
          className: ''
        },
        initialize: function(t, e, i) {
          (this._url = t), (this._bounds = q(e)), m(this, i);
        },
        onAdd: function() {
          this._image || (this._initImage(), this.options.opacity < 1 && this._updateOpacity()),
            this.options.interactive &&
              (ve(this._image, 'leaflet-interactive'), this.addInteractiveTarget(this._image)),
            this.getPane().appendChild(this._image),
            this._reset();
        },
        onRemove: function() {
          ue(this._image), this.options.interactive && this.removeInteractiveTarget(this._image);
        },
        setOpacity: function(t) {
          return (this.options.opacity = t), this._image && this._updateOpacity(), this;
        },
        setStyle: function(t) {
          return t.opacity && this.setOpacity(t.opacity), this;
        },
        bringToFront: function() {
          return this._map && me(this._image), this;
        },
        bringToBack: function() {
          return this._map && ge(this._image), this;
        },
        setUrl: function(t) {
          return (this._url = t), this._image && (this._image.src = t), this;
        },
        setBounds: function(t) {
          return (this._bounds = q(t)), this._map && this._reset(), this;
        },
        getEvents: function() {
          var t = { zoom: this._reset, viewreset: this._reset };
          return this._zoomAnimated && (t.zoomanim = this._animateZoom), t;
        },
        setZIndex: function(t) {
          return (this.options.zIndex = t), this._updateZIndex(), this;
        },
        getBounds: function() {
          return this._bounds;
        },
        getElement: function() {
          return this._image;
        },
        _initImage: function() {
          var t = 'IMG' === this._url.tagName,
            e = (this._image = t ? this._url : de('img'));
          ve(e, 'leaflet-image-layer'),
            this._zoomAnimated && ve(e, 'leaflet-zoom-animated'),
            this.options.className && ve(e, this.options.className),
            (e.onselectstart = c),
            (e.onmousemove = c),
            (e.onload = s(this.fire, this, 'load')),
            (e.onerror = s(this._overlayOnError, this, 'error')),
            (this.options.crossOrigin || '' === this.options.crossOrigin) &&
              (e.crossOrigin = !0 === this.options.crossOrigin ? '' : this.options.crossOrigin),
            this.options.zIndex && this._updateZIndex(),
            t ? (this._url = e.src) : ((e.src = this._url), (e.alt = this.options.alt));
        },
        _animateZoom: function(t) {
          var e = this._map.getZoomScale(t.zoom),
            i = this._map._latLngBoundsToNewLayerBounds(this._bounds, t.zoom, t.center).min;
          Ae(this._image, i, e);
        },
        _reset: function() {
          var t = this._image,
            e = new N(
              this._map.latLngToLayerPoint(this._bounds.getNorthWest()),
              this._map.latLngToLayerPoint(this._bounds.getSouthEast())
            ),
            i = e.getSize();
          Ce(t, e.min), (t.style.width = i.x + 'px'), (t.style.height = i.y + 'px');
        },
        _updateOpacity: function() {
          xe(this._image, this.options.opacity);
        },
        _updateZIndex: function() {
          this._image &&
            void 0 !== this.options.zIndex &&
            null !== this.options.zIndex &&
            (this._image.style.zIndex = this.options.zIndex);
        },
        _overlayOnError: function() {
          this.fire('error');
          var t = this.options.errorOverlayUrl;
          t && this._url !== t && ((this._url = t), (this._image.src = t));
        }
      }),
      wo = function(t, e, i) {
        return new xo(t, e, i);
      },
      ko = xo.extend({
        options: { autoplay: !0, loop: !0, keepAspectRatio: !0 },
        _initImage: function() {
          var t = 'VIDEO' === this._url.tagName,
            e = (this._image = t ? this._url : de('video'));
          if (
            (ve(e, 'leaflet-image-layer'),
            this._zoomAnimated && ve(e, 'leaflet-zoom-animated'),
            (e.onselectstart = c),
            (e.onmousemove = c),
            (e.onloadeddata = s(this.fire, this, 'load')),
            t)
          ) {
            for (var i = e.getElementsByTagName('source'), o = [], n = 0; n < i.length; n++)
              o.push(i[n].src);
            this._url = i.length > 0 ? o : [e.src];
          } else {
            b(this._url) || (this._url = [this._url]),
              !this.options.keepAspectRatio &&
                e.style.hasOwnProperty('objectFit') &&
                (e.style.objectFit = 'fill'),
              (e.autoplay = !!this.options.autoplay),
              (e.loop = !!this.options.loop);
            for (var r = 0; r < this._url.length; r++) {
              var a = de('source');
              (a.src = this._url[r]), e.appendChild(a);
            }
          }
        }
      });
    function Ao(t, e, i) {
      return new ko(t, e, i);
    }
    var Co = xo.extend({
      _initImage: function() {
        var t = (this._image = this._url);
        ve(t, 'leaflet-image-layer'),
          this._zoomAnimated && ve(t, 'leaflet-zoom-animated'),
          (t.onselectstart = c),
          (t.onmousemove = c);
      }
    });
    function So(t, e, i) {
      return new Co(t, e, i);
    }
    var Eo = Zi.extend({
        options: { offset: [0, 7], className: '', pane: 'popupPane' },
        initialize: function(t, e) {
          m(this, t), (this._source = e);
        },
        onAdd: function(t) {
          (this._zoomAnimated = t._zoomAnimated),
            this._container || this._initLayout(),
            t._fadeAnimated && xe(this._container, 0),
            clearTimeout(this._removeTimeout),
            this.getPane().appendChild(this._container),
            this.update(),
            t._fadeAnimated && xe(this._container, 1),
            this.bringToFront();
        },
        onRemove: function(t) {
          t._fadeAnimated
            ? (xe(this._container, 0),
              (this._removeTimeout = setTimeout(s(ue, void 0, this._container), 200)))
            : ue(this._container);
        },
        getLatLng: function() {
          return this._latlng;
        },
        setLatLng: function(t) {
          return (
            (this._latlng = F(t)), this._map && (this._updatePosition(), this._adjustPan()), this
          );
        },
        getContent: function() {
          return this._content;
        },
        setContent: function(t) {
          return (this._content = t), this.update(), this;
        },
        getElement: function() {
          return this._container;
        },
        update: function() {
          this._map &&
            ((this._container.style.visibility = 'hidden'),
            this._updateContent(),
            this._updateLayout(),
            this._updatePosition(),
            (this._container.style.visibility = ''),
            this._adjustPan());
        },
        getEvents: function() {
          var t = { zoom: this._updatePosition, viewreset: this._updatePosition };
          return this._zoomAnimated && (t.zoomanim = this._animateZoom), t;
        },
        isOpen: function() {
          return !!this._map && this._map.hasLayer(this);
        },
        bringToFront: function() {
          return this._map && me(this._container), this;
        },
        bringToBack: function() {
          return this._map && ge(this._container), this;
        },
        _prepareOpen: function(t, e, i) {
          if ((e instanceof Zi || ((i = e), (e = t)), e instanceof Vi))
            for (var o in t._layers) {
              e = t._layers[o];
              break;
            }
          if (!i)
            if (e.getCenter) i = e.getCenter();
            else {
              if (!e.getLatLng) throw new Error('Unable to get source layer LatLng.');
              i = e.getLatLng();
            }
          return (this._source = e), this.update(), i;
        },
        _updateContent: function() {
          if (this._content) {
            var t = this._contentNode,
              e =
                'function' == typeof this._content
                  ? this._content(this._source || this)
                  : this._content;
            if ('string' == typeof e) t.innerHTML = e;
            else {
              for (; t.hasChildNodes(); ) t.removeChild(t.firstChild);
              t.appendChild(e);
            }
            this.fire('contentupdate');
          }
        },
        _updatePosition: function() {
          if (this._map) {
            var t = this._map.latLngToLayerPoint(this._latlng),
              e = I(this.options.offset),
              i = this._getAnchor();
            this._zoomAnimated ? Ce(this._container, t.add(i)) : (e = e.add(t).add(i));
            var o = (this._containerBottom = -e.y),
              n = (this._containerLeft = -Math.round(this._containerWidth / 2) + e.x);
            (this._container.style.bottom = o + 'px'), (this._container.style.left = n + 'px');
          }
        },
        _getAnchor: function() {
          return [0, 0];
        }
      }),
      To = Eo.extend({
        options: {
          maxWidth: 300,
          minWidth: 50,
          maxHeight: null,
          autoPan: !0,
          autoPanPaddingTopLeft: null,
          autoPanPaddingBottomRight: null,
          autoPanPadding: [5, 5],
          keepInView: !1,
          closeButton: !0,
          autoClose: !0,
          closeOnEscapeKey: !0,
          className: ''
        },
        openOn: function(t) {
          return t.openPopup(this), this;
        },
        onAdd: function(t) {
          Eo.prototype.onAdd.call(this, t),
            t.fire('popupopen', { popup: this }),
            this._source &&
              (this._source.fire('popupopen', { popup: this }, !0),
              this._source instanceof to || this._source.on('preclick', qe));
        },
        onRemove: function(t) {
          Eo.prototype.onRemove.call(this, t),
            t.fire('popupclose', { popup: this }),
            this._source &&
              (this._source.fire('popupclose', { popup: this }, !0),
              this._source instanceof to || this._source.off('preclick', qe));
        },
        getEvents: function() {
          var t = Eo.prototype.getEvents.call(this);
          return (
            (void 0 !== this.options.closeOnClick
              ? this.options.closeOnClick
              : this._map.options.closePopupOnClick) && (t.preclick = this._close),
            this.options.keepInView && (t.moveend = this._adjustPan),
            t
          );
        },
        _close: function() {
          this._map && this._map.closePopup(this);
        },
        _initLayout: function() {
          var t = 'leaflet-popup',
            e = (this._container = de(
              'div',
              t + ' ' + (this.options.className || '') + ' leaflet-zoom-animated'
            )),
            i = (this._wrapper = de('div', t + '-content-wrapper', e));
          if (
            ((this._contentNode = de('div', t + '-content', i)),
            Fe(i),
            Ue(this._contentNode),
            De(i, 'contextmenu', qe),
            (this._tipContainer = de('div', t + '-tip-container', e)),
            (this._tip = de('div', t + '-tip', this._tipContainer)),
            this.options.closeButton)
          ) {
            var o = (this._closeButton = de('a', t + '-close-button', e));
            (o.href = '#close'),
              (o.innerHTML = '&#215;'),
              De(o, 'click', this._onCloseButtonClick, this);
          }
        },
        _updateLayout: function() {
          var t = this._contentNode,
            e = t.style;
          (e.width = ''), (e.whiteSpace = 'nowrap');
          var i = t.offsetWidth;
          (i = Math.min(i, this.options.maxWidth)),
            (i = Math.max(i, this.options.minWidth)),
            (e.width = i + 1 + 'px'),
            (e.whiteSpace = ''),
            (e.height = '');
          var o = t.offsetHeight,
            n = this.options.maxHeight,
            s = 'leaflet-popup-scrolled';
          n && o > n ? ((e.height = n + 'px'), ve(t, s)) : be(t, s),
            (this._containerWidth = this._container.offsetWidth);
        },
        _animateZoom: function(t) {
          var e = this._map._latLngToNewLayerPoint(this._latlng, t.zoom, t.center),
            i = this._getAnchor();
          Ce(this._container, e.add(i));
        },
        _adjustPan: function() {
          if (this.options.autoPan) {
            this._map._panAnim && this._map._panAnim.stop();
            var t = this._map,
              e = parseInt(ce(this._container, 'marginBottom'), 10) || 0,
              i = this._container.offsetHeight + e,
              o = this._containerWidth,
              n = new P(this._containerLeft, -i - this._containerBottom);
            n._add(Se(this._container));
            var s = t.layerPointToContainerPoint(n),
              r = I(this.options.autoPanPadding),
              a = I(this.options.autoPanPaddingTopLeft || r),
              l = I(this.options.autoPanPaddingBottomRight || r),
              h = t.getSize(),
              c = 0,
              d = 0;
            s.x + o + l.x > h.x && (c = s.x + o - h.x + l.x),
              s.x - c - a.x < 0 && (c = s.x - a.x),
              s.y + i + l.y > h.y && (d = s.y + i - h.y + l.y),
              s.y - d - a.y < 0 && (d = s.y - a.y),
              (c || d) && t.fire('autopanstart').panBy([c, d]);
          }
        },
        _onCloseButtonClick: function(t) {
          this._close(), je(t);
        },
        _getAnchor: function() {
          return I(
            this._source && this._source._getPopupAnchor ? this._source._getPopupAnchor() : [0, 0]
          );
        }
      }),
      $o = function(t, e) {
        return new To(t, e);
      };
    ii.mergeOptions({ closePopupOnClick: !0 }),
      ii.include({
        openPopup: function(t, e, i) {
          return (
            t instanceof To || (t = new To(i).setContent(t)),
            e && t.setLatLng(e),
            this.hasLayer(t)
              ? this
              : (this._popup && this._popup.options.autoClose && this.closePopup(),
                (this._popup = t),
                this.addLayer(t))
          );
        },
        closePopup: function(t) {
          return (
            (t && t !== this._popup) || ((t = this._popup), (this._popup = null)),
            t && this.removeLayer(t),
            this
          );
        }
      }),
      Zi.include({
        bindPopup: function(t, e) {
          return (
            t instanceof To
              ? (m(t, e), (this._popup = t), (t._source = this))
              : ((this._popup && !e) || (this._popup = new To(e, this)), this._popup.setContent(t)),
            this._popupHandlersAdded ||
              (this.on({
                click: this._openPopup,
                keypress: this._onKeyPress,
                remove: this.closePopup,
                move: this._movePopup
              }),
              (this._popupHandlersAdded = !0)),
            this
          );
        },
        unbindPopup: function() {
          return (
            this._popup &&
              (this.off({
                click: this._openPopup,
                keypress: this._onKeyPress,
                remove: this.closePopup,
                move: this._movePopup
              }),
              (this._popupHandlersAdded = !1),
              (this._popup = null)),
            this
          );
        },
        openPopup: function(t, e) {
          return (
            this._popup &&
              this._map &&
              ((e = this._popup._prepareOpen(this, t, e)), this._map.openPopup(this._popup, e)),
            this
          );
        },
        closePopup: function() {
          return this._popup && this._popup._close(), this;
        },
        togglePopup: function(t) {
          return this._popup && (this._popup._map ? this.closePopup() : this.openPopup(t)), this;
        },
        isPopupOpen: function() {
          return !!this._popup && this._popup.isOpen();
        },
        setPopupContent: function(t) {
          return this._popup && this._popup.setContent(t), this;
        },
        getPopup: function() {
          return this._popup;
        },
        _openPopup: function(t) {
          var e = t.layer || t.target;
          this._popup &&
            this._map &&
            (je(t),
            e instanceof to
              ? this.openPopup(t.layer || t.target, t.latlng)
              : this._map.hasLayer(this._popup) && this._popup._source === e
              ? this.closePopup()
              : this.openPopup(e, t.latlng));
        },
        _movePopup: function(t) {
          this._popup.setLatLng(t.latlng);
        },
        _onKeyPress: function(t) {
          13 === t.originalEvent.keyCode && this._openPopup(t);
        }
      });
    var Oo = Eo.extend({
        options: {
          pane: 'tooltipPane',
          offset: [0, 0],
          direction: 'auto',
          permanent: !1,
          sticky: !1,
          interactive: !1,
          opacity: 0.9
        },
        onAdd: function(t) {
          Eo.prototype.onAdd.call(this, t),
            this.setOpacity(this.options.opacity),
            t.fire('tooltipopen', { tooltip: this }),
            this._source && this._source.fire('tooltipopen', { tooltip: this }, !0);
        },
        onRemove: function(t) {
          Eo.prototype.onRemove.call(this, t),
            t.fire('tooltipclose', { tooltip: this }),
            this._source && this._source.fire('tooltipclose', { tooltip: this }, !0);
        },
        getEvents: function() {
          var t = Eo.prototype.getEvents.call(this);
          return At && !this.options.permanent && (t.preclick = this._close), t;
        },
        _close: function() {
          this._map && this._map.closeTooltip(this);
        },
        _initLayout: function() {
          var t =
            'leaflet-tooltip ' +
            (this.options.className || '') +
            ' leaflet-zoom-' +
            (this._zoomAnimated ? 'animated' : 'hide');
          this._contentNode = this._container = de('div', t);
        },
        _updateLayout: function() {},
        _adjustPan: function() {},
        _setPosition: function(t) {
          var e = this._map,
            i = this._container,
            o = e.latLngToContainerPoint(e.getCenter()),
            n = e.layerPointToContainerPoint(t),
            s = this.options.direction,
            r = i.offsetWidth,
            a = i.offsetHeight,
            l = I(this.options.offset),
            h = this._getAnchor();
          'top' === s
            ? (t = t.add(I(-r / 2 + l.x, -a + l.y + h.y, !0)))
            : 'bottom' === s
            ? (t = t.subtract(I(r / 2 - l.x, -l.y, !0)))
            : 'center' === s
            ? (t = t.subtract(I(r / 2 + l.x, a / 2 - h.y + l.y, !0)))
            : 'right' === s || ('auto' === s && n.x < o.x)
            ? ((s = 'right'), (t = t.add(I(l.x + h.x, h.y - a / 2 + l.y, !0))))
            : ((s = 'left'), (t = t.subtract(I(r + h.x - l.x, a / 2 - h.y - l.y, !0)))),
            be(i, 'leaflet-tooltip-right'),
            be(i, 'leaflet-tooltip-left'),
            be(i, 'leaflet-tooltip-top'),
            be(i, 'leaflet-tooltip-bottom'),
            ve(i, 'leaflet-tooltip-' + s),
            Ce(i, t);
        },
        _updatePosition: function() {
          var t = this._map.latLngToLayerPoint(this._latlng);
          this._setPosition(t);
        },
        setOpacity: function(t) {
          (this.options.opacity = t), this._container && xe(this._container, t);
        },
        _animateZoom: function(t) {
          var e = this._map._latLngToNewLayerPoint(this._latlng, t.zoom, t.center);
          this._setPosition(e);
        },
        _getAnchor: function() {
          return I(
            this._source && this._source._getTooltipAnchor && !this.options.sticky
              ? this._source._getTooltipAnchor()
              : [0, 0]
          );
        }
      }),
      Mo = function(t, e) {
        return new Oo(t, e);
      };
    ii.include({
      openTooltip: function(t, e, i) {
        return (
          t instanceof Oo || (t = new Oo(i).setContent(t)),
          e && t.setLatLng(e),
          this.hasLayer(t) ? this : this.addLayer(t)
        );
      },
      closeTooltip: function(t) {
        return t && this.removeLayer(t), this;
      }
    }),
      Zi.include({
        bindTooltip: function(t, e) {
          return (
            t instanceof Oo
              ? (m(t, e), (this._tooltip = t), (t._source = this))
              : ((this._tooltip && !e) || (this._tooltip = new Oo(e, this)),
                this._tooltip.setContent(t)),
            this._initTooltipInteractions(),
            this._tooltip.options.permanent &&
              this._map &&
              this._map.hasLayer(this) &&
              this.openTooltip(),
            this
          );
        },
        unbindTooltip: function() {
          return (
            this._tooltip &&
              (this._initTooltipInteractions(!0), this.closeTooltip(), (this._tooltip = null)),
            this
          );
        },
        _initTooltipInteractions: function(t) {
          if (t || !this._tooltipHandlersAdded) {
            var e = t ? 'off' : 'on',
              i = { remove: this.closeTooltip, move: this._moveTooltip };
            this._tooltip.options.permanent
              ? (i.add = this._openTooltip)
              : ((i.mouseover = this._openTooltip),
                (i.mouseout = this.closeTooltip),
                this._tooltip.options.sticky && (i.mousemove = this._moveTooltip),
                At && (i.click = this._openTooltip)),
              this[e](i),
              (this._tooltipHandlersAdded = !t);
          }
        },
        openTooltip: function(t, e) {
          return (
            this._tooltip &&
              this._map &&
              ((e = this._tooltip._prepareOpen(this, t, e)),
              this._map.openTooltip(this._tooltip, e),
              this._tooltip.options.interactive &&
                this._tooltip._container &&
                (ve(this._tooltip._container, 'leaflet-clickable'),
                this.addInteractiveTarget(this._tooltip._container))),
            this
          );
        },
        closeTooltip: function() {
          return (
            this._tooltip &&
              (this._tooltip._close(),
              this._tooltip.options.interactive &&
                this._tooltip._container &&
                (be(this._tooltip._container, 'leaflet-clickable'),
                this.removeInteractiveTarget(this._tooltip._container))),
            this
          );
        },
        toggleTooltip: function(t) {
          return (
            this._tooltip && (this._tooltip._map ? this.closeTooltip() : this.openTooltip(t)), this
          );
        },
        isTooltipOpen: function() {
          return this._tooltip.isOpen();
        },
        setTooltipContent: function(t) {
          return this._tooltip && this._tooltip.setContent(t), this;
        },
        getTooltip: function() {
          return this._tooltip;
        },
        _openTooltip: function(t) {
          var e = t.layer || t.target;
          this._tooltip &&
            this._map &&
            this.openTooltip(e, this._tooltip.options.sticky ? t.latlng : void 0);
        },
        _moveTooltip: function(t) {
          var e,
            i,
            o = t.latlng;
          this._tooltip.options.sticky &&
            t.originalEvent &&
            ((e = this._map.mouseEventToContainerPoint(t.originalEvent)),
            (i = this._map.containerPointToLayerPoint(e)),
            (o = this._map.layerPointToLatLng(i))),
            this._tooltip.setLatLng(o);
        }
      });
    var Lo = Gi.extend({
      options: { iconSize: [12, 12], html: !1, bgPos: null, className: 'leaflet-div-icon' },
      createIcon: function(t) {
        var e = t && 'DIV' === t.tagName ? t : document.createElement('div'),
          i = this.options;
        if (
          (i.html instanceof Element
            ? (pe(e), e.appendChild(i.html))
            : (e.innerHTML = !1 !== i.html ? i.html : ''),
          i.bgPos)
        ) {
          var o = I(i.bgPos);
          e.style.backgroundPosition = -o.x + 'px ' + -o.y + 'px';
        }
        return this._setIconStyles(e, 'icon'), e;
      },
      createShadow: function() {
        return null;
      }
    });
    function zo(t) {
      return new Lo(t);
    }
    Gi.Default = Ki;
    var Po = Zi.extend({
      options: {
        tileSize: 256,
        opacity: 1,
        updateWhenIdle: yt,
        updateWhenZooming: !0,
        updateInterval: 200,
        zIndex: 1,
        bounds: null,
        minZoom: 0,
        maxZoom: void 0,
        maxNativeZoom: void 0,
        minNativeZoom: void 0,
        noWrap: !1,
        pane: 'tilePane',
        className: '',
        keepBuffer: 2
      },
      initialize: function(t) {
        m(this, t);
      },
      onAdd: function() {
        this._initContainer(),
          (this._levels = {}),
          (this._tiles = {}),
          this._resetView(),
          this._update();
      },
      beforeAdd: function(t) {
        t._addZoomLimit(this);
      },
      onRemove: function(t) {
        this._removeAllTiles(),
          ue(this._container),
          t._removeZoomLimit(this),
          (this._container = null),
          (this._tileZoom = void 0);
      },
      bringToFront: function() {
        return this._map && (me(this._container), this._setAutoZIndex(Math.max)), this;
      },
      bringToBack: function() {
        return this._map && (ge(this._container), this._setAutoZIndex(Math.min)), this;
      },
      getContainer: function() {
        return this._container;
      },
      setOpacity: function(t) {
        return (this.options.opacity = t), this._updateOpacity(), this;
      },
      setZIndex: function(t) {
        return (this.options.zIndex = t), this._updateZIndex(), this;
      },
      isLoading: function() {
        return this._loading;
      },
      redraw: function() {
        return this._map && (this._removeAllTiles(), this._update()), this;
      },
      getEvents: function() {
        var t = {
          viewprereset: this._invalidateAll,
          viewreset: this._resetView,
          zoom: this._resetView,
          moveend: this._onMoveEnd
        };
        return (
          this.options.updateWhenIdle ||
            (this._onMove || (this._onMove = l(this._onMoveEnd, this.options.updateInterval, this)),
            (t.move = this._onMove)),
          this._zoomAnimated && (t.zoomanim = this._animateZoom),
          t
        );
      },
      createTile: function() {
        return document.createElement('div');
      },
      getTileSize: function() {
        var t = this.options.tileSize;
        return t instanceof P ? t : new P(t, t);
      },
      _updateZIndex: function() {
        this._container &&
          void 0 !== this.options.zIndex &&
          null !== this.options.zIndex &&
          (this._container.style.zIndex = this.options.zIndex);
      },
      _setAutoZIndex: function(t) {
        for (
          var e, i = this.getPane().children, o = -t(-1 / 0, 1 / 0), n = 0, s = i.length;
          n < s;
          n++
        )
          (e = i[n].style.zIndex), i[n] !== this._container && e && (o = t(o, +e));
        isFinite(o) && ((this.options.zIndex = o + t(-1, 1)), this._updateZIndex());
      },
      _updateOpacity: function() {
        if (this._map && !et) {
          xe(this._container, this.options.opacity);
          var t = +new Date(),
            e = !1,
            i = !1;
          for (var o in this._tiles) {
            var n = this._tiles[o];
            if (n.current && n.loaded) {
              var s = Math.min(1, (t - n.loaded) / 200);
              xe(n.el, s),
                s < 1 ? (e = !0) : (n.active ? (i = !0) : this._onOpaqueTile(n), (n.active = !0));
            }
          }
          i && !this._noPrune && this._pruneTiles(),
            e && (E(this._fadeFrame), (this._fadeFrame = S(this._updateOpacity, this)));
        }
      },
      _onOpaqueTile: c,
      _initContainer: function() {
        this._container ||
          ((this._container = de('div', 'leaflet-layer ' + (this.options.className || ''))),
          this._updateZIndex(),
          this.options.opacity < 1 && this._updateOpacity(),
          this.getPane().appendChild(this._container));
      },
      _updateLevels: function() {
        var t = this._tileZoom,
          e = this.options.maxZoom;
        if (void 0 !== t) {
          for (var i in this._levels)
            this._levels[i].el.children.length || i === t
              ? ((this._levels[i].el.style.zIndex = e - Math.abs(t - i)), this._onUpdateLevel(i))
              : (ue(this._levels[i].el),
                this._removeTilesAtZoom(i),
                this._onRemoveLevel(i),
                delete this._levels[i]);
          var o = this._levels[t],
            n = this._map;
          return (
            o ||
              (((o = this._levels[t] = {}).el = de(
                'div',
                'leaflet-tile-container leaflet-zoom-animated',
                this._container
              )),
              (o.el.style.zIndex = e),
              (o.origin = n.project(n.unproject(n.getPixelOrigin()), t).round()),
              (o.zoom = t),
              this._setZoomTransform(o, n.getCenter(), n.getZoom()),
              c(o.el.offsetWidth),
              this._onCreateLevel(o)),
            (this._level = o),
            o
          );
        }
      },
      _onUpdateLevel: c,
      _onRemoveLevel: c,
      _onCreateLevel: c,
      _pruneTiles: function() {
        if (this._map) {
          var t,
            e,
            i = this._map.getZoom();
          if (i > this.options.maxZoom || i < this.options.minZoom) this._removeAllTiles();
          else {
            for (t in this._tiles) (e = this._tiles[t]).retain = e.current;
            for (t in this._tiles)
              if ((e = this._tiles[t]).current && !e.active) {
                var o = e.coords;
                this._retainParent(o.x, o.y, o.z, o.z - 5) ||
                  this._retainChildren(o.x, o.y, o.z, o.z + 2);
              }
            for (t in this._tiles) this._tiles[t].retain || this._removeTile(t);
          }
        }
      },
      _removeTilesAtZoom: function(t) {
        for (var e in this._tiles) this._tiles[e].coords.z === t && this._removeTile(e);
      },
      _removeAllTiles: function() {
        for (var t in this._tiles) this._removeTile(t);
      },
      _invalidateAll: function() {
        for (var t in this._levels)
          ue(this._levels[t].el), this._onRemoveLevel(t), delete this._levels[t];
        this._removeAllTiles(), (this._tileZoom = void 0);
      },
      _retainParent: function(t, e, i, o) {
        var n = Math.floor(t / 2),
          s = Math.floor(e / 2),
          r = i - 1,
          a = new P(+n, +s);
        a.z = +r;
        var l = this._tileCoordsToKey(a),
          h = this._tiles[l];
        return h && h.active
          ? ((h.retain = !0), !0)
          : (h && h.loaded && (h.retain = !0), r > o && this._retainParent(n, s, r, o));
      },
      _retainChildren: function(t, e, i, o) {
        for (var n = 2 * t; n < 2 * t + 2; n++)
          for (var s = 2 * e; s < 2 * e + 2; s++) {
            var r = new P(n, s);
            r.z = i + 1;
            var a = this._tileCoordsToKey(r),
              l = this._tiles[a];
            l && l.active
              ? (l.retain = !0)
              : (l && l.loaded && (l.retain = !0),
                i + 1 < o && this._retainChildren(n, s, i + 1, o));
          }
      },
      _resetView: function(t) {
        var e = t && (t.pinch || t.flyTo);
        this._setView(this._map.getCenter(), this._map.getZoom(), e, e);
      },
      _animateZoom: function(t) {
        this._setView(t.center, t.zoom, !0, t.noUpdate);
      },
      _clampZoom: function(t) {
        var e = this.options;
        return void 0 !== e.minNativeZoom && t < e.minNativeZoom
          ? e.minNativeZoom
          : void 0 !== e.maxNativeZoom && e.maxNativeZoom < t
          ? e.maxNativeZoom
          : t;
      },
      _setView: function(t, e, i, o) {
        var n = this._clampZoom(Math.round(e));
        ((void 0 !== this.options.maxZoom && n > this.options.maxZoom) ||
          (void 0 !== this.options.minZoom && n < this.options.minZoom)) &&
          (n = void 0);
        var s = this.options.updateWhenZooming && n !== this._tileZoom;
        (o && !s) ||
          ((this._tileZoom = n),
          this._abortLoading && this._abortLoading(),
          this._updateLevels(),
          this._resetGrid(),
          void 0 !== n && this._update(t),
          i || this._pruneTiles(),
          (this._noPrune = !!i)),
          this._setZoomTransforms(t, e);
      },
      _setZoomTransforms: function(t, e) {
        for (var i in this._levels) this._setZoomTransform(this._levels[i], t, e);
      },
      _setZoomTransform: function(t, e, i) {
        var o = this._map.getZoomScale(i, t.zoom),
          n = t.origin
            .multiplyBy(o)
            .subtract(this._map._getNewPixelOrigin(e, i))
            .round();
        bt ? Ae(t.el, n, o) : Ce(t.el, n);
      },
      _resetGrid: function() {
        var t = this._map,
          e = t.options.crs,
          i = (this._tileSize = this.getTileSize()),
          o = this._tileZoom,
          n = this._map.getPixelWorldBounds(this._tileZoom);
        n && (this._globalTileRange = this._pxBoundsToTileRange(n)),
          (this._wrapX = e.wrapLng &&
            !this.options.noWrap && [
              Math.floor(t.project([0, e.wrapLng[0]], o).x / i.x),
              Math.ceil(t.project([0, e.wrapLng[1]], o).x / i.y)
            ]),
          (this._wrapY = e.wrapLat &&
            !this.options.noWrap && [
              Math.floor(t.project([e.wrapLat[0], 0], o).y / i.x),
              Math.ceil(t.project([e.wrapLat[1], 0], o).y / i.y)
            ]);
      },
      _onMoveEnd: function() {
        this._map && !this._map._animatingZoom && this._update();
      },
      _getTiledPixelBounds: function(t) {
        var e = this._map,
          i = e._animatingZoom ? Math.max(e._animateToZoom, e.getZoom()) : e.getZoom(),
          o = e.getZoomScale(i, this._tileZoom),
          n = e.project(t, this._tileZoom).floor(),
          s = e.getSize().divideBy(2 * o);
        return new N(n.subtract(s), n.add(s));
      },
      _update: function(t) {
        var e = this._map;
        if (e) {
          var i = this._clampZoom(e.getZoom());
          if ((void 0 === t && (t = e.getCenter()), void 0 !== this._tileZoom)) {
            var o = this._getTiledPixelBounds(t),
              n = this._pxBoundsToTileRange(o),
              s = n.getCenter(),
              r = [],
              a = this.options.keepBuffer,
              l = new N(n.getBottomLeft().subtract([a, -a]), n.getTopRight().add([a, -a]));
            if (!(isFinite(n.min.x) && isFinite(n.min.y) && isFinite(n.max.x) && isFinite(n.max.y)))
              throw new Error('Attempted to load an infinite number of tiles');
            for (var h in this._tiles) {
              var c = this._tiles[h].coords;
              (c.z === this._tileZoom && l.contains(new P(c.x, c.y))) ||
                (this._tiles[h].current = !1);
            }
            if (Math.abs(i - this._tileZoom) > 1) this._setView(t, i);
            else {
              for (var d = n.min.y; d <= n.max.y; d++)
                for (var u = n.min.x; u <= n.max.x; u++) {
                  var p = new P(u, d);
                  if (((p.z = this._tileZoom), this._isValidTile(p))) {
                    var m = this._tiles[this._tileCoordsToKey(p)];
                    m ? (m.current = !0) : r.push(p);
                  }
                }
              if (
                (r.sort(function(t, e) {
                  return t.distanceTo(s) - e.distanceTo(s);
                }),
                0 !== r.length)
              ) {
                this._loading || ((this._loading = !0), this.fire('loading'));
                var g = document.createDocumentFragment();
                for (u = 0; u < r.length; u++) this._addTile(r[u], g);
                this._level.el.appendChild(g);
              }
            }
          }
        }
      },
      _isValidTile: function(t) {
        var e = this._map.options.crs;
        if (!e.infinite) {
          var i = this._globalTileRange;
          if (
            (!e.wrapLng && (t.x < i.min.x || t.x > i.max.x)) ||
            (!e.wrapLat && (t.y < i.min.y || t.y > i.max.y))
          )
            return !1;
        }
        if (!this.options.bounds) return !0;
        var o = this._tileCoordsToBounds(t);
        return q(this.options.bounds).overlaps(o);
      },
      _keyToBounds: function(t) {
        return this._tileCoordsToBounds(this._keyToTileCoords(t));
      },
      _tileCoordsToNwSe: function(t) {
        var e = this._map,
          i = this.getTileSize(),
          o = t.scaleBy(i),
          n = o.add(i);
        return [e.unproject(o, t.z), e.unproject(n, t.z)];
      },
      _tileCoordsToBounds: function(t) {
        var e = this._tileCoordsToNwSe(t),
          i = new R(e[0], e[1]);
        return this.options.noWrap || (i = this._map.wrapLatLngBounds(i)), i;
      },
      _tileCoordsToKey: function(t) {
        return t.x + ':' + t.y + ':' + t.z;
      },
      _keyToTileCoords: function(t) {
        var e = t.split(':'),
          i = new P(+e[0], +e[1]);
        return (i.z = +e[2]), i;
      },
      _removeTile: function(t) {
        var e = this._tiles[t];
        e &&
          (ue(e.el),
          delete this._tiles[t],
          this.fire('tileunload', { tile: e.el, coords: this._keyToTileCoords(t) }));
      },
      _initTile: function(t) {
        ve(t, 'leaflet-tile');
        var e = this.getTileSize();
        (t.style.width = e.x + 'px'),
          (t.style.height = e.y + 'px'),
          (t.onselectstart = c),
          (t.onmousemove = c),
          et && this.options.opacity < 1 && xe(t, this.options.opacity),
          nt && !st && (t.style.WebkitBackfaceVisibility = 'hidden');
      },
      _addTile: function(t, e) {
        var i = this._getTilePos(t),
          o = this._tileCoordsToKey(t),
          n = this.createTile(this._wrapCoords(t), s(this._tileReady, this, t));
        this._initTile(n),
          this.createTile.length < 2 && S(s(this._tileReady, this, t, null, n)),
          Ce(n, i),
          (this._tiles[o] = { el: n, coords: t, current: !0 }),
          e.appendChild(n),
          this.fire('tileloadstart', { tile: n, coords: t });
      },
      _tileReady: function(t, e, i) {
        e && this.fire('tileerror', { error: e, tile: i, coords: t });
        var o = this._tileCoordsToKey(t);
        (i = this._tiles[o]) &&
          ((i.loaded = +new Date()),
          this._map._fadeAnimated
            ? (xe(i.el, 0), E(this._fadeFrame), (this._fadeFrame = S(this._updateOpacity, this)))
            : ((i.active = !0), this._pruneTiles()),
          e || (ve(i.el, 'leaflet-tile-loaded'), this.fire('tileload', { tile: i.el, coords: t })),
          this._noTilesToLoad() &&
            ((this._loading = !1),
            this.fire('load'),
            et || !this._map._fadeAnimated
              ? S(this._pruneTiles, this)
              : setTimeout(s(this._pruneTiles, this), 250)));
      },
      _getTilePos: function(t) {
        return t.scaleBy(this.getTileSize()).subtract(this._level.origin);
      },
      _wrapCoords: function(t) {
        var e = new P(
          this._wrapX ? h(t.x, this._wrapX) : t.x,
          this._wrapY ? h(t.y, this._wrapY) : t.y
        );
        return (e.z = t.z), e;
      },
      _pxBoundsToTileRange: function(t) {
        var e = this.getTileSize();
        return new N(
          t.min.unscaleBy(e).floor(),
          t.max
            .unscaleBy(e)
            .ceil()
            .subtract([1, 1])
        );
      },
      _noTilesToLoad: function() {
        for (var t in this._tiles) if (!this._tiles[t].loaded) return !1;
        return !0;
      }
    });
    function Do(t) {
      return new Po(t);
    }
    var Io = Po.extend({
      options: {
        minZoom: 0,
        maxZoom: 18,
        subdomains: 'abc',
        errorTileUrl: '',
        zoomOffset: 0,
        tms: !1,
        zoomReverse: !1,
        detectRetina: !1,
        crossOrigin: !1
      },
      initialize: function(t, e) {
        (this._url = t),
          (e = m(this, e)).detectRetina &&
            Et &&
            e.maxZoom > 0 &&
            ((e.tileSize = Math.floor(e.tileSize / 2)),
            e.zoomReverse ? (e.zoomOffset--, e.minZoom++) : (e.zoomOffset++, e.maxZoom--),
            (e.minZoom = Math.max(0, e.minZoom))),
          'string' == typeof e.subdomains && (e.subdomains = e.subdomains.split('')),
          nt || this.on('tileunload', this._onTileRemove);
      },
      setUrl: function(t, e) {
        return (
          this._url === t && void 0 === e && (e = !0), (this._url = t), e || this.redraw(), this
        );
      },
      createTile: function(t, e) {
        var i = document.createElement('img');
        return (
          De(i, 'load', s(this._tileOnLoad, this, e, i)),
          De(i, 'error', s(this._tileOnError, this, e, i)),
          (this.options.crossOrigin || '' === this.options.crossOrigin) &&
            (i.crossOrigin = !0 === this.options.crossOrigin ? '' : this.options.crossOrigin),
          (i.alt = ''),
          i.setAttribute('role', 'presentation'),
          (i.src = this.getTileUrl(t)),
          i
        );
      },
      getTileUrl: function(t) {
        var e = {
          r: Et ? '@2x' : '',
          s: this._getSubdomain(t),
          x: t.x,
          y: t.y,
          z: this._getZoomForUrl()
        };
        if (this._map && !this._map.options.crs.infinite) {
          var i = this._globalTileRange.max.y - t.y;
          this.options.tms && (e.y = i), (e['-y'] = i);
        }
        return v(this._url, o(e, this.options));
      },
      _tileOnLoad: function(t, e) {
        et ? setTimeout(s(t, this, null, e), 0) : t(null, e);
      },
      _tileOnError: function(t, e, i) {
        var o = this.options.errorTileUrl;
        o && e.getAttribute('src') !== o && (e.src = o), t(i, e);
      },
      _onTileRemove: function(t) {
        t.tile.onload = null;
      },
      _getZoomForUrl: function() {
        var t = this._tileZoom,
          e = this.options.maxZoom;
        return this.options.zoomReverse && (t = e - t), t + this.options.zoomOffset;
      },
      _getSubdomain: function(t) {
        var e = Math.abs(t.x + t.y) % this.options.subdomains.length;
        return this.options.subdomains[e];
      },
      _abortLoading: function() {
        var t, e;
        for (t in this._tiles)
          this._tiles[t].coords.z !== this._tileZoom &&
            (((e = this._tiles[t].el).onload = c),
            (e.onerror = c),
            e.complete || ((e.src = _), ue(e), delete this._tiles[t]));
      },
      _removeTile: function(t) {
        var e = this._tiles[t];
        if (e) return at || e.el.setAttribute('src', _), Po.prototype._removeTile.call(this, t);
      },
      _tileReady: function(t, e, i) {
        if (this._map && (!i || i.getAttribute('src') !== _))
          return Po.prototype._tileReady.call(this, t, e, i);
      }
    });
    function No(t, e) {
      return new Io(t, e);
    }
    var Bo = Io.extend({
      defaultWmsParams: {
        service: 'WMS',
        request: 'GetMap',
        layers: '',
        styles: '',
        format: 'image/jpeg',
        transparent: !1,
        version: '1.1.1'
      },
      options: { crs: null, uppercase: !1 },
      initialize: function(t, e) {
        this._url = t;
        var i = o({}, this.defaultWmsParams);
        for (var n in e) n in this.options || (i[n] = e[n]);
        var s = (e = m(this, e)).detectRetina && Et ? 2 : 1,
          r = this.getTileSize();
        (i.width = r.x * s), (i.height = r.y * s), (this.wmsParams = i);
      },
      onAdd: function(t) {
        (this._crs = this.options.crs || t.options.crs),
          (this._wmsVersion = parseFloat(this.wmsParams.version));
        var e = this._wmsVersion >= 1.3 ? 'crs' : 'srs';
        (this.wmsParams[e] = this._crs.code), Io.prototype.onAdd.call(this, t);
      },
      getTileUrl: function(t) {
        var e = this._tileCoordsToNwSe(t),
          i = this._crs,
          o = B(i.project(e[0]), i.project(e[1])),
          n = o.min,
          s = o.max,
          r = (this._wmsVersion >= 1.3 && this._crs === Ui
            ? [n.y, n.x, s.y, s.x]
            : [n.x, n.y, s.x, s.y]
          ).join(','),
          a = Io.prototype.getTileUrl.call(this, t);
        return (
          a +
          g(this.wmsParams, a, this.options.uppercase) +
          (this.options.uppercase ? '&BBOX=' : '&bbox=') +
          r
        );
      },
      setParams: function(t, e) {
        return o(this.wmsParams, t), e || this.redraw(), this;
      }
    });
    function Ro(t, e) {
      return new Bo(t, e);
    }
    (Io.WMS = Bo), (No.wms = Ro);
    var qo = Zi.extend({
        options: { padding: 0.1, tolerance: 0 },
        initialize: function(t) {
          m(this, t), a(this), (this._layers = this._layers || {});
        },
        onAdd: function() {
          this._container ||
            (this._initContainer(),
            this._zoomAnimated && ve(this._container, 'leaflet-zoom-animated')),
            this.getPane().appendChild(this._container),
            this._update(),
            this.on('update', this._updatePaths, this);
        },
        onRemove: function() {
          this.off('update', this._updatePaths, this), this._destroyContainer();
        },
        getEvents: function() {
          var t = {
            viewreset: this._reset,
            zoom: this._onZoom,
            moveend: this._update,
            zoomend: this._onZoomEnd
          };
          return this._zoomAnimated && (t.zoomanim = this._onAnimZoom), t;
        },
        _onAnimZoom: function(t) {
          this._updateTransform(t.center, t.zoom);
        },
        _onZoom: function() {
          this._updateTransform(this._map.getCenter(), this._map.getZoom());
        },
        _updateTransform: function(t, e) {
          var i = this._map.getZoomScale(e, this._zoom),
            o = Se(this._container),
            n = this._map.getSize().multiplyBy(0.5 + this.options.padding),
            s = this._map.project(this._center, e),
            r = this._map.project(t, e).subtract(s),
            a = n
              .multiplyBy(-i)
              .add(o)
              .add(n)
              .subtract(r);
          bt ? Ae(this._container, a, i) : Ce(this._container, a);
        },
        _reset: function() {
          for (var t in (this._update(),
          this._updateTransform(this._center, this._zoom),
          this._layers))
            this._layers[t]._reset();
        },
        _onZoomEnd: function() {
          for (var t in this._layers) this._layers[t]._project();
        },
        _updatePaths: function() {
          for (var t in this._layers) this._layers[t]._update();
        },
        _update: function() {
          var t = this.options.padding,
            e = this._map.getSize(),
            i = this._map.containerPointToLayerPoint(e.multiplyBy(-t)).round();
          (this._bounds = new N(i, i.add(e.multiplyBy(1 + 2 * t)).round())),
            (this._center = this._map.getCenter()),
            (this._zoom = this._map.getZoom());
        }
      }),
      Uo = qo.extend({
        getEvents: function() {
          var t = qo.prototype.getEvents.call(this);
          return (t.viewprereset = this._onViewPreReset), t;
        },
        _onViewPreReset: function() {
          this._postponeUpdatePaths = !0;
        },
        onAdd: function() {
          qo.prototype.onAdd.call(this), this._draw();
        },
        _initContainer: function() {
          var t = (this._container = document.createElement('canvas'));
          De(t, 'mousemove', l(this._onMouseMove, 32, this), this),
            De(t, 'click dblclick mousedown mouseup contextmenu', this._onClick, this),
            De(t, 'mouseout', this._handleMouseOut, this),
            (this._ctx = t.getContext('2d'));
        },
        _destroyContainer: function() {
          E(this._redrawRequest),
            delete this._ctx,
            ue(this._container),
            Ne(this._container),
            delete this._container;
        },
        _updatePaths: function() {
          if (!this._postponeUpdatePaths) {
            for (var t in ((this._redrawBounds = null), this._layers)) this._layers[t]._update();
            this._redraw();
          }
        },
        _update: function() {
          if (!this._map._animatingZoom || !this._bounds) {
            qo.prototype._update.call(this);
            var t = this._bounds,
              e = this._container,
              i = t.getSize(),
              o = Et ? 2 : 1;
            Ce(e, t.min),
              (e.width = o * i.x),
              (e.height = o * i.y),
              (e.style.width = i.x + 'px'),
              (e.style.height = i.y + 'px'),
              Et && this._ctx.scale(2, 2),
              this._ctx.translate(-t.min.x, -t.min.y),
              this.fire('update');
          }
        },
        _reset: function() {
          qo.prototype._reset.call(this),
            this._postponeUpdatePaths && ((this._postponeUpdatePaths = !1), this._updatePaths());
        },
        _initPath: function(t) {
          this._updateDashArray(t), (this._layers[a(t)] = t);
          var e = (t._order = { layer: t, prev: this._drawLast, next: null });
          this._drawLast && (this._drawLast.next = e),
            (this._drawLast = e),
            (this._drawFirst = this._drawFirst || this._drawLast);
        },
        _addPath: function(t) {
          this._requestRedraw(t);
        },
        _removePath: function(t) {
          var e = t._order,
            i = e.next,
            o = e.prev;
          i ? (i.prev = o) : (this._drawLast = o),
            o ? (o.next = i) : (this._drawFirst = i),
            delete t._order,
            delete this._layers[a(t)],
            this._requestRedraw(t);
        },
        _updatePath: function(t) {
          this._extendRedrawBounds(t), t._project(), t._update(), this._requestRedraw(t);
        },
        _updateStyle: function(t) {
          this._updateDashArray(t), this._requestRedraw(t);
        },
        _updateDashArray: function(t) {
          if ('string' == typeof t.options.dashArray) {
            var e,
              i,
              o = t.options.dashArray.split(/[, ]+/),
              n = [];
            for (i = 0; i < o.length; i++) {
              if (((e = Number(o[i])), isNaN(e))) return;
              n.push(e);
            }
            t.options._dashArray = n;
          } else t.options._dashArray = t.options.dashArray;
        },
        _requestRedraw: function(t) {
          this._map &&
            (this._extendRedrawBounds(t),
            (this._redrawRequest = this._redrawRequest || S(this._redraw, this)));
        },
        _extendRedrawBounds: function(t) {
          if (t._pxBounds) {
            var e = (t.options.weight || 0) + 1;
            (this._redrawBounds = this._redrawBounds || new N()),
              this._redrawBounds.extend(t._pxBounds.min.subtract([e, e])),
              this._redrawBounds.extend(t._pxBounds.max.add([e, e]));
          }
        },
        _redraw: function() {
          (this._redrawRequest = null),
            this._redrawBounds && (this._redrawBounds.min._floor(), this._redrawBounds.max._ceil()),
            this._clear(),
            this._draw(),
            (this._redrawBounds = null);
        },
        _clear: function() {
          var t = this._redrawBounds;
          if (t) {
            var e = t.getSize();
            this._ctx.clearRect(t.min.x, t.min.y, e.x, e.y);
          } else this._ctx.clearRect(0, 0, this._container.width, this._container.height);
        },
        _draw: function() {
          var t,
            e = this._redrawBounds;
          if ((this._ctx.save(), e)) {
            var i = e.getSize();
            this._ctx.beginPath(), this._ctx.rect(e.min.x, e.min.y, i.x, i.y), this._ctx.clip();
          }
          this._drawing = !0;
          for (var o = this._drawFirst; o; o = o.next)
            (t = o.layer), (!e || (t._pxBounds && t._pxBounds.intersects(e))) && t._updatePath();
          (this._drawing = !1), this._ctx.restore();
        },
        _updatePoly: function(t, e) {
          if (this._drawing) {
            var i,
              o,
              n,
              s,
              r = t._parts,
              a = r.length,
              l = this._ctx;
            if (a) {
              for (l.beginPath(), i = 0; i < a; i++) {
                for (o = 0, n = r[i].length; o < n; o++)
                  (s = r[i][o]), l[o ? 'lineTo' : 'moveTo'](s.x, s.y);
                e && l.closePath();
              }
              this._fillStroke(l, t);
            }
          }
        },
        _updateCircle: function(t) {
          if (this._drawing && !t._empty()) {
            var e = t._point,
              i = this._ctx,
              o = Math.max(Math.round(t._radius), 1),
              n = (Math.max(Math.round(t._radiusY), 1) || o) / o;
            1 !== n && (i.save(), i.scale(1, n)),
              i.beginPath(),
              i.arc(e.x, e.y / n, o, 0, 2 * Math.PI, !1),
              1 !== n && i.restore(),
              this._fillStroke(i, t);
          }
        },
        _fillStroke: function(t, e) {
          var i = e.options;
          i.fill &&
            ((t.globalAlpha = i.fillOpacity),
            (t.fillStyle = i.fillColor || i.color),
            t.fill(i.fillRule || 'evenodd')),
            i.stroke &&
              0 !== i.weight &&
              (t.setLineDash && t.setLineDash((e.options && e.options._dashArray) || []),
              (t.globalAlpha = i.opacity),
              (t.lineWidth = i.weight),
              (t.strokeStyle = i.color),
              (t.lineCap = i.lineCap),
              (t.lineJoin = i.lineJoin),
              t.stroke());
        },
        _onClick: function(t) {
          for (
            var e, i, o = this._map.mouseEventToLayerPoint(t), n = this._drawFirst;
            n;
            n = n.next
          )
            (e = n.layer).options.interactive &&
              e._containsPoint(o) &&
              !this._map._draggableMoved(e) &&
              (i = e);
          i && (Ke(t), this._fireEvent([i], t));
        },
        _onMouseMove: function(t) {
          if (this._map && !this._map.dragging.moving() && !this._map._animatingZoom) {
            var e = this._map.mouseEventToLayerPoint(t);
            this._handleMouseHover(t, e);
          }
        },
        _handleMouseOut: function(t) {
          var e = this._hoveredLayer;
          e &&
            (be(this._container, 'leaflet-interactive'),
            this._fireEvent([e], t, 'mouseout'),
            (this._hoveredLayer = null));
        },
        _handleMouseHover: function(t, e) {
          for (var i, o, n = this._drawFirst; n; n = n.next)
            (i = n.layer).options.interactive && i._containsPoint(e) && (o = i);
          o !== this._hoveredLayer &&
            (this._handleMouseOut(t),
            o &&
              (ve(this._container, 'leaflet-interactive'),
              this._fireEvent([o], t, 'mouseover'),
              (this._hoveredLayer = o))),
            this._hoveredLayer && this._fireEvent([this._hoveredLayer], t);
        },
        _fireEvent: function(t, e, i) {
          this._map._fireDOMEvent(e, i || e.type, t);
        },
        _bringToFront: function(t) {
          var e = t._order;
          if (e) {
            var i = e.next,
              o = e.prev;
            i &&
              ((i.prev = o),
              o ? (o.next = i) : i && (this._drawFirst = i),
              (e.prev = this._drawLast),
              (this._drawLast.next = e),
              (e.next = null),
              (this._drawLast = e),
              this._requestRedraw(t));
          }
        },
        _bringToBack: function(t) {
          var e = t._order;
          if (e) {
            var i = e.next,
              o = e.prev;
            o &&
              ((o.next = i),
              i ? (i.prev = o) : o && (this._drawLast = o),
              (e.prev = null),
              (e.next = this._drawFirst),
              (this._drawFirst.prev = e),
              (this._drawFirst = e),
              this._requestRedraw(t));
          }
        }
      });
    function Fo(t) {
      return Tt ? new Uo(t) : null;
    }
    var Zo = (function() {
        try {
          return (
            document.namespaces.add('lvml', 'urn:schemas-microsoft-com:vml'),
            function(t) {
              return document.createElement('<lvml:' + t + ' class="lvml">');
            }
          );
        } catch (t) {
          return function(t) {
            return document.createElement(
              '<' + t + ' xmlns="urn:schemas-microsoft.com:vml" class="lvml">'
            );
          };
        }
      })(),
      jo = {
        _initContainer: function() {
          this._container = de('div', 'leaflet-vml-container');
        },
        _update: function() {
          this._map._animatingZoom || (qo.prototype._update.call(this), this.fire('update'));
        },
        _initPath: function(t) {
          var e = (t._container = Zo('shape'));
          ve(e, 'leaflet-vml-shape ' + (this.options.className || '')),
            (e.coordsize = '1 1'),
            (t._path = Zo('path')),
            e.appendChild(t._path),
            this._updateStyle(t),
            (this._layers[a(t)] = t);
        },
        _addPath: function(t) {
          var e = t._container;
          this._container.appendChild(e), t.options.interactive && t.addInteractiveTarget(e);
        },
        _removePath: function(t) {
          var e = t._container;
          ue(e), t.removeInteractiveTarget(e), delete this._layers[a(t)];
        },
        _updateStyle: function(t) {
          var e = t._stroke,
            i = t._fill,
            o = t.options,
            n = t._container;
          (n.stroked = !!o.stroke),
            (n.filled = !!o.fill),
            o.stroke
              ? (e || (e = t._stroke = Zo('stroke')),
                n.appendChild(e),
                (e.weight = o.weight + 'px'),
                (e.color = o.color),
                (e.opacity = o.opacity),
                o.dashArray
                  ? (e.dashStyle = b(o.dashArray)
                      ? o.dashArray.join(' ')
                      : o.dashArray.replace(/( *, *)/g, ' '))
                  : (e.dashStyle = ''),
                (e.endcap = o.lineCap.replace('butt', 'flat')),
                (e.joinstyle = o.lineJoin))
              : e && (n.removeChild(e), (t._stroke = null)),
            o.fill
              ? (i || (i = t._fill = Zo('fill')),
                n.appendChild(i),
                (i.color = o.fillColor || o.color),
                (i.opacity = o.fillOpacity))
              : i && (n.removeChild(i), (t._fill = null));
        },
        _updateCircle: function(t) {
          var e = t._point.round(),
            i = Math.round(t._radius),
            o = Math.round(t._radiusY || i);
          this._setPath(
            t,
            t._empty() ? 'M0 0' : 'AL ' + e.x + ',' + e.y + ' ' + i + ',' + o + ' 0,23592600'
          );
        },
        _setPath: function(t, e) {
          t._path.v = e;
        },
        _bringToFront: function(t) {
          me(t._container);
        },
        _bringToBack: function(t) {
          ge(t._container);
        }
      },
      Ho = Ot ? Zo : Y,
      Vo = qo.extend({
        getEvents: function() {
          var t = qo.prototype.getEvents.call(this);
          return (t.zoomstart = this._onZoomStart), t;
        },
        _initContainer: function() {
          (this._container = Ho('svg')),
            this._container.setAttribute('pointer-events', 'none'),
            (this._rootGroup = Ho('g')),
            this._container.appendChild(this._rootGroup);
        },
        _destroyContainer: function() {
          ue(this._container),
            Ne(this._container),
            delete this._container,
            delete this._rootGroup,
            delete this._svgSize;
        },
        _onZoomStart: function() {
          this._update();
        },
        _update: function() {
          if (!this._map._animatingZoom || !this._bounds) {
            qo.prototype._update.call(this);
            var t = this._bounds,
              e = t.getSize(),
              i = this._container;
            (this._svgSize && this._svgSize.equals(e)) ||
              ((this._svgSize = e), i.setAttribute('width', e.x), i.setAttribute('height', e.y)),
              Ce(i, t.min),
              i.setAttribute('viewBox', [t.min.x, t.min.y, e.x, e.y].join(' ')),
              this.fire('update');
          }
        },
        _initPath: function(t) {
          var e = (t._path = Ho('path'));
          t.options.className && ve(e, t.options.className),
            t.options.interactive && ve(e, 'leaflet-interactive'),
            this._updateStyle(t),
            (this._layers[a(t)] = t);
        },
        _addPath: function(t) {
          this._rootGroup || this._initContainer(),
            this._rootGroup.appendChild(t._path),
            t.addInteractiveTarget(t._path);
        },
        _removePath: function(t) {
          ue(t._path), t.removeInteractiveTarget(t._path), delete this._layers[a(t)];
        },
        _updatePath: function(t) {
          t._project(), t._update();
        },
        _updateStyle: function(t) {
          var e = t._path,
            i = t.options;
          e &&
            (i.stroke
              ? (e.setAttribute('stroke', i.color),
                e.setAttribute('stroke-opacity', i.opacity),
                e.setAttribute('stroke-width', i.weight),
                e.setAttribute('stroke-linecap', i.lineCap),
                e.setAttribute('stroke-linejoin', i.lineJoin),
                i.dashArray
                  ? e.setAttribute('stroke-dasharray', i.dashArray)
                  : e.removeAttribute('stroke-dasharray'),
                i.dashOffset
                  ? e.setAttribute('stroke-dashoffset', i.dashOffset)
                  : e.removeAttribute('stroke-dashoffset'))
              : e.setAttribute('stroke', 'none'),
            i.fill
              ? (e.setAttribute('fill', i.fillColor || i.color),
                e.setAttribute('fill-opacity', i.fillOpacity),
                e.setAttribute('fill-rule', i.fillRule || 'evenodd'))
              : e.setAttribute('fill', 'none'));
        },
        _updatePoly: function(t, e) {
          this._setPath(t, J(t._parts, e));
        },
        _updateCircle: function(t) {
          var e = t._point,
            i = Math.max(Math.round(t._radius), 1),
            o = 'a' + i + ',' + (Math.max(Math.round(t._radiusY), 1) || i) + ' 0 1,0 ',
            n = t._empty()
              ? 'M0 0'
              : 'M' + (e.x - i) + ',' + e.y + o + 2 * i + ',0 ' + o + 2 * -i + ',0 ';
          this._setPath(t, n);
        },
        _setPath: function(t, e) {
          t._path.setAttribute('d', e);
        },
        _bringToFront: function(t) {
          me(t._path);
        },
        _bringToBack: function(t) {
          ge(t._path);
        }
      });
    function Wo(t) {
      return $t || Ot ? new Vo(t) : null;
    }
    Ot && Vo.include(jo),
      ii.include({
        getRenderer: function(t) {
          var e =
            t.options.renderer ||
            this._getPaneRenderer(t.options.pane) ||
            this.options.renderer ||
            this._renderer;
          return (
            e || (e = this._renderer = this._createRenderer()),
            this.hasLayer(e) || this.addLayer(e),
            e
          );
        },
        _getPaneRenderer: function(t) {
          if ('overlayPane' === t || void 0 === t) return !1;
          var e = this._paneRenderers[t];
          return (
            void 0 === e && ((e = this._createRenderer({ pane: t })), (this._paneRenderers[t] = e)),
            e
          );
        },
        _createRenderer: function(t) {
          return (this.options.preferCanvas && Fo(t)) || Wo(t);
        }
      });
    var Go = ao.extend({
      initialize: function(t, e) {
        ao.prototype.initialize.call(this, this._boundsToLatLngs(t), e);
      },
      setBounds: function(t) {
        return this.setLatLngs(this._boundsToLatLngs(t));
      },
      _boundsToLatLngs: function(t) {
        return [(t = q(t)).getSouthWest(), t.getNorthWest(), t.getNorthEast(), t.getSouthEast()];
      }
    });
    function Qo(t, e) {
      return new Go(t, e);
    }
    (Vo.create = Ho),
      (Vo.pointsToPath = J),
      (ho.geometryToLayer = co),
      (ho.coordsToLatLng = uo),
      (ho.coordsToLatLngs = po),
      (ho.latLngToCoords = mo),
      (ho.latLngsToCoords = go),
      (ho.getFeature = fo),
      (ho.asFeature = vo),
      ii.mergeOptions({ boxZoom: !0 });
    var Ko = mi.extend({
      initialize: function(t) {
        (this._map = t),
          (this._container = t._container),
          (this._pane = t._panes.overlayPane),
          (this._resetStateTimeout = 0),
          t.on('unload', this._destroy, this);
      },
      addHooks: function() {
        De(this._container, 'mousedown', this._onMouseDown, this);
      },
      removeHooks: function() {
        Ne(this._container, 'mousedown', this._onMouseDown, this);
      },
      moved: function() {
        return this._moved;
      },
      _destroy: function() {
        ue(this._pane), delete this._pane;
      },
      _resetState: function() {
        (this._resetStateTimeout = 0), (this._moved = !1);
      },
      _clearDeferredResetState: function() {
        0 !== this._resetStateTimeout &&
          (clearTimeout(this._resetStateTimeout), (this._resetStateTimeout = 0));
      },
      _onMouseDown: function(t) {
        if (!t.shiftKey || (1 !== t.which && 1 !== t.button)) return !1;
        this._clearDeferredResetState(),
          this._resetState(),
          ee(),
          Te(),
          (this._startPoint = this._map.mouseEventToContainerPoint(t)),
          De(
            document,
            {
              contextmenu: je,
              mousemove: this._onMouseMove,
              mouseup: this._onMouseUp,
              keydown: this._onKeyDown
            },
            this
          );
      },
      _onMouseMove: function(t) {
        this._moved ||
          ((this._moved = !0),
          (this._box = de('div', 'leaflet-zoom-box', this._container)),
          ve(this._container, 'leaflet-crosshair'),
          this._map.fire('boxzoomstart')),
          (this._point = this._map.mouseEventToContainerPoint(t));
        var e = new N(this._point, this._startPoint),
          i = e.getSize();
        Ce(this._box, e.min),
          (this._box.style.width = i.x + 'px'),
          (this._box.style.height = i.y + 'px');
      },
      _finish: function() {
        this._moved && (ue(this._box), be(this._container, 'leaflet-crosshair')),
          ie(),
          $e(),
          Ne(
            document,
            {
              contextmenu: je,
              mousemove: this._onMouseMove,
              mouseup: this._onMouseUp,
              keydown: this._onKeyDown
            },
            this
          );
      },
      _onMouseUp: function(t) {
        if ((1 === t.which || 1 === t.button) && (this._finish(), this._moved)) {
          this._clearDeferredResetState(),
            (this._resetStateTimeout = setTimeout(s(this._resetState, this), 0));
          var e = new R(
            this._map.containerPointToLatLng(this._startPoint),
            this._map.containerPointToLatLng(this._point)
          );
          this._map.fitBounds(e).fire('boxzoomend', { boxZoomBounds: e });
        }
      },
      _onKeyDown: function(t) {
        27 === t.keyCode && this._finish();
      }
    });
    ii.addInitHook('addHandler', 'boxZoom', Ko), ii.mergeOptions({ doubleClickZoom: !0 });
    var Yo = mi.extend({
      addHooks: function() {
        this._map.on('dblclick', this._onDoubleClick, this);
      },
      removeHooks: function() {
        this._map.off('dblclick', this._onDoubleClick, this);
      },
      _onDoubleClick: function(t) {
        var e = this._map,
          i = e.getZoom(),
          o = e.options.zoomDelta,
          n = t.originalEvent.shiftKey ? i - o : i + o;
        'center' === e.options.doubleClickZoom
          ? e.setZoom(n)
          : e.setZoomAround(t.containerPoint, n);
      }
    });
    ii.addInitHook('addHandler', 'doubleClickZoom', Yo),
      ii.mergeOptions({
        dragging: !0,
        inertia: !st,
        inertiaDeceleration: 3400,
        inertiaMaxSpeed: 1 / 0,
        easeLinearity: 0.2,
        worldCopyJump: !1,
        maxBoundsViscosity: 0
      });
    var Jo = mi.extend({
      addHooks: function() {
        if (!this._draggable) {
          var t = this._map;
          (this._draggable = new _i(t._mapPane, t._container)),
            this._draggable.on(
              { dragstart: this._onDragStart, drag: this._onDrag, dragend: this._onDragEnd },
              this
            ),
            this._draggable.on('predrag', this._onPreDragLimit, this),
            t.options.worldCopyJump &&
              (this._draggable.on('predrag', this._onPreDragWrap, this),
              t.on('zoomend', this._onZoomEnd, this),
              t.whenReady(this._onZoomEnd, this));
        }
        ve(this._map._container, 'leaflet-grab leaflet-touch-drag'),
          this._draggable.enable(),
          (this._positions = []),
          (this._times = []);
      },
      removeHooks: function() {
        be(this._map._container, 'leaflet-grab'),
          be(this._map._container, 'leaflet-touch-drag'),
          this._draggable.disable();
      },
      moved: function() {
        return this._draggable && this._draggable._moved;
      },
      moving: function() {
        return this._draggable && this._draggable._moving;
      },
      _onDragStart: function() {
        var t = this._map;
        if ((t._stop(), this._map.options.maxBounds && this._map.options.maxBoundsViscosity)) {
          var e = q(this._map.options.maxBounds);
          (this._offsetLimit = B(
            this._map.latLngToContainerPoint(e.getNorthWest()).multiplyBy(-1),
            this._map
              .latLngToContainerPoint(e.getSouthEast())
              .multiplyBy(-1)
              .add(this._map.getSize())
          )),
            (this._viscosity = Math.min(1, Math.max(0, this._map.options.maxBoundsViscosity)));
        } else this._offsetLimit = null;
        t.fire('movestart').fire('dragstart'),
          t.options.inertia && ((this._positions = []), (this._times = []));
      },
      _onDrag: function(t) {
        if (this._map.options.inertia) {
          var e = (this._lastTime = +new Date()),
            i = (this._lastPos = this._draggable._absPos || this._draggable._newPos);
          this._positions.push(i), this._times.push(e), this._prunePositions(e);
        }
        this._map.fire('move', t).fire('drag', t);
      },
      _prunePositions: function(t) {
        for (; this._positions.length > 1 && t - this._times[0] > 50; )
          this._positions.shift(), this._times.shift();
      },
      _onZoomEnd: function() {
        var t = this._map.getSize().divideBy(2),
          e = this._map.latLngToLayerPoint([0, 0]);
        (this._initialWorldOffset = e.subtract(t).x),
          (this._worldWidth = this._map.getPixelWorldBounds().getSize().x);
      },
      _viscousLimit: function(t, e) {
        return t - (t - e) * this._viscosity;
      },
      _onPreDragLimit: function() {
        if (this._viscosity && this._offsetLimit) {
          var t = this._draggable._newPos.subtract(this._draggable._startPos),
            e = this._offsetLimit;
          t.x < e.min.x && (t.x = this._viscousLimit(t.x, e.min.x)),
            t.y < e.min.y && (t.y = this._viscousLimit(t.y, e.min.y)),
            t.x > e.max.x && (t.x = this._viscousLimit(t.x, e.max.x)),
            t.y > e.max.y && (t.y = this._viscousLimit(t.y, e.max.y)),
            (this._draggable._newPos = this._draggable._startPos.add(t));
        }
      },
      _onPreDragWrap: function() {
        var t = this._worldWidth,
          e = Math.round(t / 2),
          i = this._initialWorldOffset,
          o = this._draggable._newPos.x,
          n = ((o - e + i) % t) + e - i,
          s = ((o + e + i) % t) - e - i,
          r = Math.abs(n + i) < Math.abs(s + i) ? n : s;
        (this._draggable._absPos = this._draggable._newPos.clone()),
          (this._draggable._newPos.x = r);
      },
      _onDragEnd: function(t) {
        var e = this._map,
          i = e.options,
          o = !i.inertia || this._times.length < 2;
        if ((e.fire('dragend', t), o)) e.fire('moveend');
        else {
          this._prunePositions(+new Date());
          var n = this._lastPos.subtract(this._positions[0]),
            s = (this._lastTime - this._times[0]) / 1e3,
            r = i.easeLinearity,
            a = n.multiplyBy(r / s),
            l = a.distanceTo([0, 0]),
            h = Math.min(i.inertiaMaxSpeed, l),
            c = a.multiplyBy(h / l),
            d = h / (i.inertiaDeceleration * r),
            u = c.multiplyBy(-d / 2).round();
          u.x || u.y
            ? ((u = e._limitOffset(u, e.options.maxBounds)),
              S(function() {
                e.panBy(u, { duration: d, easeLinearity: r, noMoveStart: !0, animate: !0 });
              }))
            : e.fire('moveend');
        }
      }
    });
    ii.addInitHook('addHandler', 'dragging', Jo),
      ii.mergeOptions({ keyboard: !0, keyboardPanDelta: 80 });
    var Xo = mi.extend({
      keyCodes: {
        left: [37],
        right: [39],
        down: [40],
        up: [38],
        zoomIn: [187, 107, 61, 171],
        zoomOut: [189, 109, 54, 173]
      },
      initialize: function(t) {
        (this._map = t),
          this._setPanDelta(t.options.keyboardPanDelta),
          this._setZoomDelta(t.options.zoomDelta);
      },
      addHooks: function() {
        var t = this._map._container;
        t.tabIndex <= 0 && (t.tabIndex = '0'),
          De(t, { focus: this._onFocus, blur: this._onBlur, mousedown: this._onMouseDown }, this),
          this._map.on({ focus: this._addHooks, blur: this._removeHooks }, this);
      },
      removeHooks: function() {
        this._removeHooks(),
          Ne(
            this._map._container,
            { focus: this._onFocus, blur: this._onBlur, mousedown: this._onMouseDown },
            this
          ),
          this._map.off({ focus: this._addHooks, blur: this._removeHooks }, this);
      },
      _onMouseDown: function() {
        if (!this._focused) {
          var t = document.body,
            e = document.documentElement,
            i = t.scrollTop || e.scrollTop,
            o = t.scrollLeft || e.scrollLeft;
          this._map._container.focus(), window.scrollTo(o, i);
        }
      },
      _onFocus: function() {
        (this._focused = !0), this._map.fire('focus');
      },
      _onBlur: function() {
        (this._focused = !1), this._map.fire('blur');
      },
      _setPanDelta: function(t) {
        var e,
          i,
          o = (this._panKeys = {}),
          n = this.keyCodes;
        for (e = 0, i = n.left.length; e < i; e++) o[n.left[e]] = [-1 * t, 0];
        for (e = 0, i = n.right.length; e < i; e++) o[n.right[e]] = [t, 0];
        for (e = 0, i = n.down.length; e < i; e++) o[n.down[e]] = [0, t];
        for (e = 0, i = n.up.length; e < i; e++) o[n.up[e]] = [0, -1 * t];
      },
      _setZoomDelta: function(t) {
        var e,
          i,
          o = (this._zoomKeys = {}),
          n = this.keyCodes;
        for (e = 0, i = n.zoomIn.length; e < i; e++) o[n.zoomIn[e]] = t;
        for (e = 0, i = n.zoomOut.length; e < i; e++) o[n.zoomOut[e]] = -t;
      },
      _addHooks: function() {
        De(document, 'keydown', this._onKeyDown, this);
      },
      _removeHooks: function() {
        Ne(document, 'keydown', this._onKeyDown, this);
      },
      _onKeyDown: function(t) {
        if (!(t.altKey || t.ctrlKey || t.metaKey)) {
          var e,
            i = t.keyCode,
            o = this._map;
          if (i in this._panKeys)
            (o._panAnim && o._panAnim._inProgress) ||
              ((e = this._panKeys[i]),
              t.shiftKey && (e = I(e).multiplyBy(3)),
              o.panBy(e),
              o.options.maxBounds && o.panInsideBounds(o.options.maxBounds));
          else if (i in this._zoomKeys)
            o.setZoom(o.getZoom() + (t.shiftKey ? 3 : 1) * this._zoomKeys[i]);
          else {
            if (27 !== i || !o._popup || !o._popup.options.closeOnEscapeKey) return;
            o.closePopup();
          }
          je(t);
        }
      }
    });
    ii.addInitHook('addHandler', 'keyboard', Xo),
      ii.mergeOptions({ scrollWheelZoom: !0, wheelDebounceTime: 40, wheelPxPerZoomLevel: 60 });
    var tn = mi.extend({
      addHooks: function() {
        De(this._map._container, 'mousewheel', this._onWheelScroll, this), (this._delta = 0);
      },
      removeHooks: function() {
        Ne(this._map._container, 'mousewheel', this._onWheelScroll, this);
      },
      _onWheelScroll: function(t) {
        var e = We(t),
          i = this._map.options.wheelDebounceTime;
        (this._delta += e),
          (this._lastMousePos = this._map.mouseEventToContainerPoint(t)),
          this._startTime || (this._startTime = +new Date());
        var o = Math.max(i - (+new Date() - this._startTime), 0);
        clearTimeout(this._timer), (this._timer = setTimeout(s(this._performZoom, this), o)), je(t);
      },
      _performZoom: function() {
        var t = this._map,
          e = t.getZoom(),
          i = this._map.options.zoomSnap || 0;
        t._stop();
        var o = this._delta / (4 * this._map.options.wheelPxPerZoomLevel),
          n = (4 * Math.log(2 / (1 + Math.exp(-Math.abs(o))))) / Math.LN2,
          s = i ? Math.ceil(n / i) * i : n,
          r = t._limitZoom(e + (this._delta > 0 ? s : -s)) - e;
        (this._delta = 0),
          (this._startTime = null),
          r &&
            ('center' === t.options.scrollWheelZoom
              ? t.setZoom(e + r)
              : t.setZoomAround(this._lastMousePos, e + r));
      }
    });
    ii.addInitHook('addHandler', 'scrollWheelZoom', tn),
      ii.mergeOptions({ tap: !0, tapTolerance: 15 });
    var en = mi.extend({
      addHooks: function() {
        De(this._map._container, 'touchstart', this._onDown, this);
      },
      removeHooks: function() {
        Ne(this._map._container, 'touchstart', this._onDown, this);
      },
      _onDown: function(t) {
        if (t.touches) {
          if ((Ze(t), (this._fireClick = !0), t.touches.length > 1))
            return (this._fireClick = !1), void clearTimeout(this._holdTimeout);
          var e = t.touches[0],
            i = e.target;
          (this._startPos = this._newPos = new P(e.clientX, e.clientY)),
            i.tagName && 'a' === i.tagName.toLowerCase() && ve(i, 'leaflet-active'),
            (this._holdTimeout = setTimeout(
              s(function() {
                this._isTapValid() &&
                  ((this._fireClick = !1), this._onUp(), this._simulateEvent('contextmenu', e));
              }, this),
              1e3
            )),
            this._simulateEvent('mousedown', e),
            De(document, { touchmove: this._onMove, touchend: this._onUp }, this);
        }
      },
      _onUp: function(t) {
        if (
          (clearTimeout(this._holdTimeout),
          Ne(document, { touchmove: this._onMove, touchend: this._onUp }, this),
          this._fireClick && t && t.changedTouches)
        ) {
          var e = t.changedTouches[0],
            i = e.target;
          i && i.tagName && 'a' === i.tagName.toLowerCase() && be(i, 'leaflet-active'),
            this._simulateEvent('mouseup', e),
            this._isTapValid() && this._simulateEvent('click', e);
        }
      },
      _isTapValid: function() {
        return this._newPos.distanceTo(this._startPos) <= this._map.options.tapTolerance;
      },
      _onMove: function(t) {
        var e = t.touches[0];
        (this._newPos = new P(e.clientX, e.clientY)), this._simulateEvent('mousemove', e);
      },
      _simulateEvent: function(t, e) {
        var i = document.createEvent('MouseEvents');
        (i._simulated = !0),
          (e.target._simulatedClick = !0),
          i.initMouseEvent(
            t,
            !0,
            !0,
            window,
            1,
            e.screenX,
            e.screenY,
            e.clientX,
            e.clientY,
            !1,
            !1,
            !1,
            !1,
            0,
            null
          ),
          e.target.dispatchEvent(i);
      }
    });
    At && !kt && ii.addInitHook('addHandler', 'tap', en),
      ii.mergeOptions({ touchZoom: At && !st, bounceAtZoomLimits: !0 });
    var on = mi.extend({
      addHooks: function() {
        ve(this._map._container, 'leaflet-touch-zoom'),
          De(this._map._container, 'touchstart', this._onTouchStart, this);
      },
      removeHooks: function() {
        be(this._map._container, 'leaflet-touch-zoom'),
          Ne(this._map._container, 'touchstart', this._onTouchStart, this);
      },
      _onTouchStart: function(t) {
        var e = this._map;
        if (t.touches && 2 === t.touches.length && !e._animatingZoom && !this._zooming) {
          var i = e.mouseEventToContainerPoint(t.touches[0]),
            o = e.mouseEventToContainerPoint(t.touches[1]);
          (this._centerPoint = e.getSize()._divideBy(2)),
            (this._startLatLng = e.containerPointToLatLng(this._centerPoint)),
            'center' !== e.options.touchZoom &&
              (this._pinchStartLatLng = e.containerPointToLatLng(i.add(o)._divideBy(2))),
            (this._startDist = i.distanceTo(o)),
            (this._startZoom = e.getZoom()),
            (this._moved = !1),
            (this._zooming = !0),
            e._stop(),
            De(document, 'touchmove', this._onTouchMove, this),
            De(document, 'touchend', this._onTouchEnd, this),
            Ze(t);
        }
      },
      _onTouchMove: function(t) {
        if (t.touches && 2 === t.touches.length && this._zooming) {
          var e = this._map,
            i = e.mouseEventToContainerPoint(t.touches[0]),
            o = e.mouseEventToContainerPoint(t.touches[1]),
            n = i.distanceTo(o) / this._startDist;
          if (
            ((this._zoom = e.getScaleZoom(n, this._startZoom)),
            !e.options.bounceAtZoomLimits &&
              ((this._zoom < e.getMinZoom() && n < 1) || (this._zoom > e.getMaxZoom() && n > 1)) &&
              (this._zoom = e._limitZoom(this._zoom)),
            'center' === e.options.touchZoom)
          ) {
            if (((this._center = this._startLatLng), 1 === n)) return;
          } else {
            var r = i
              ._add(o)
              ._divideBy(2)
              ._subtract(this._centerPoint);
            if (1 === n && 0 === r.x && 0 === r.y) return;
            this._center = e.unproject(
              e.project(this._pinchStartLatLng, this._zoom).subtract(r),
              this._zoom
            );
          }
          this._moved || (e._moveStart(!0, !1), (this._moved = !0)), E(this._animRequest);
          var a = s(e._move, e, this._center, this._zoom, { pinch: !0, round: !1 });
          (this._animRequest = S(a, this, !0)), Ze(t);
        }
      },
      _onTouchEnd: function() {
        this._moved && this._zooming
          ? ((this._zooming = !1),
            E(this._animRequest),
            Ne(document, 'touchmove', this._onTouchMove),
            Ne(document, 'touchend', this._onTouchEnd),
            this._map.options.zoomAnimation
              ? this._map._animateZoom(
                  this._center,
                  this._map._limitZoom(this._zoom),
                  !0,
                  this._map.options.zoomSnap
                )
              : this._map._resetView(this._center, this._map._limitZoom(this._zoom)))
          : (this._zooming = !1);
      }
    });
    ii.addInitHook('addHandler', 'touchZoom', on),
      (ii.BoxZoom = Ko),
      (ii.DoubleClickZoom = Yo),
      (ii.Drag = Jo),
      (ii.Keyboard = Xo),
      (ii.ScrollWheelZoom = tn),
      (ii.Tap = en),
      (ii.TouchZoom = on),
      (Object.freeze = i),
      (t.version = e),
      (t.Control = ni),
      (t.control = si),
      (t.Browser = Lt),
      (t.Evented = z),
      (t.Mixin = fi),
      (t.Util = T),
      (t.Class = $),
      (t.Handler = mi),
      (t.extend = o),
      (t.bind = s),
      (t.stamp = a),
      (t.setOptions = m),
      (t.DomEvent = ti),
      (t.DomUtil = Pe),
      (t.PosAnimation = ei),
      (t.Draggable = _i),
      (t.LineUtil = Pi),
      (t.PolyUtil = Ii),
      (t.Point = P),
      (t.point = I),
      (t.Bounds = N),
      (t.bounds = B),
      (t.Transformation = W),
      (t.transformation = G),
      (t.Projection = Ri),
      (t.LatLng = U),
      (t.latLng = F),
      (t.LatLngBounds = R),
      (t.latLngBounds = q),
      (t.CRS = Z),
      (t.GeoJSON = ho),
      (t.geoJSON = yo),
      (t.geoJson = _o),
      (t.Layer = Zi),
      (t.LayerGroup = ji),
      (t.layerGroup = Hi),
      (t.FeatureGroup = Vi),
      (t.featureGroup = Wi),
      (t.ImageOverlay = xo),
      (t.imageOverlay = wo),
      (t.VideoOverlay = ko),
      (t.videoOverlay = Ao),
      (t.SVGOverlay = Co),
      (t.svgOverlay = So),
      (t.DivOverlay = Eo),
      (t.Popup = To),
      (t.popup = $o),
      (t.Tooltip = Oo),
      (t.tooltip = Mo),
      (t.Icon = Gi),
      (t.icon = Qi),
      (t.DivIcon = Lo),
      (t.divIcon = zo),
      (t.Marker = Ji),
      (t.marker = Xi),
      (t.TileLayer = Io),
      (t.tileLayer = No),
      (t.GridLayer = Po),
      (t.gridLayer = Do),
      (t.SVG = Vo),
      (t.svg = Wo),
      (t.Renderer = qo),
      (t.Canvas = Uo),
      (t.canvas = Fo),
      (t.Path = to),
      (t.CircleMarker = eo),
      (t.circleMarker = io),
      (t.Circle = oo),
      (t.circle = no),
      (t.Polyline = so),
      (t.polyline = ro),
      (t.Polygon = ao),
      (t.polygon = lo),
      (t.Rectangle = Go),
      (t.rectangle = Qo),
      (t.Map = ii),
      (t.map = oi);
    var nn = window.L;
    (t.noConflict = function() {
      return (window.L = nn), this;
    }),
      (window.L = t);
  })(Kh.exports);
  var Yh = Kh.exports;
  const Jh = { weight: 1, opacity: 1, color: 'white', fillOpacity: 0.7, fillColor: '#2387ca' },
    Xh = { weight: 3, color: 'white', fillOpacity: 1, fillColor: '#2387ca' },
    tc = () => Jh;
  class ec extends lt {
    static get styles() {
      return r`
      :host {
        display: block;
        padding: 0px;
      }

      #alias-map {
        top: 0px;
        height: 100%;
      }

      .leaflet-container {
        background: transparent;
      }

      .path {
        position: absolute;
        color: #666;
      }

      .path > .step {
        display: inline-block;
        font-size: 12px;
        margin-left: 5px;
      }

      .path > .step.hovered {
        color: #999;
      }

      .path > .step.linked {
        text-decoration: underline;
        color: var(--color-link-primary);
        cursor: pointer;
      }
    `;
    }
    constructor() {
      super(),
        (this.osmId = ''),
        (this.endpoint = ''),
        (this.hovered = null),
        (this.path = []),
        (this.renderedMap = null),
        (this.states = null),
        (this.paths = {}),
        (this.lastHovered = null);
    }
    getRenderRoot() {
      return this.renderRoot;
    }
    getEndpoint() {
      return this.endpoint + (this.endpoint.endsWith('/') ? '' : '/');
    }
    refreshMap() {
      const t = (t, e) => {
        (this.paths[t.properties.osm_id] = e),
          e.on({
            click: t => {
              const e = t.target.feature.properties;
              if (e.osm_id !== this.path[this.path.length - 1].osm_id) {
                const i = t.originalEvent;
                i.stopPropagation(),
                  i.preventDefault(),
                  this.onFeatureClicked && this.onFeatureClicked(e),
                  (this.hovered = null),
                  this.path.push(e),
                  (this.osmId = e.osm_id),
                  this.refreshMap();
              }
            },
            mouseover: t => {
              const e = t.target.feature.properties;
              e.osm_id !== this.path[this.path.length - 1].osm_id &&
                (t.target.setStyle(Xh), (this.hovered = e));
            },
            mouseout: t => {
              t.target.setStyle(Jh), (this.hovered = null);
            }
          });
      };
      jt(this.getEndpoint() + 'geometry/' + this.osmId + '/').then(e => {
        this.states && this.renderedMap.removeLayer(this.states);
        const i = e.json;
        0 === this.path.length && (this.path = [{ name: i.name, osm_id: this.osmId, level: 0 }]),
          (this.states = Yh.geoJSON(i.geometry, { style: tc, onEachFeature: t })),
          this.renderedMap.fitBounds(this.states.getBounds(), {}),
          this.states.addTo(this.renderedMap);
      });
    }
    updated(t) {
      if (t.has('hovered') && (this.lastHovered && this.lastHovered.setStyle(Jh), this.hovered)) {
        const t = this.paths[this.hovered.osm_id];
        (this.lastHovered = t), t && t.setStyle(Xh);
      }
      if (
        (t.has('feature') &&
          this.feature &&
          ((this.hovered = null),
          (0 !== this.path.length &&
            this.path[this.path.length - 1].osm_id === this.feature.osm_id) ||
            this.path.push(this.feature)),
        t.has('osmId'))
      ) {
        const t = [];
        for (const e of this.path)
          if ((t.push(e), e.osm_id === this.osmId)) {
            this.onFeatureClicked && this.onFeatureClicked(e);
            break;
          }
        (this.path = t), this.refreshMap();
      }
    }
    firstUpdated(t) {
      const e = this.getRenderRoot().getElementById('alias-map');
      (this.renderedMap = Yh.map(e, {
        attributionControl: !1,
        scrollWheelZoom: !1,
        zoomControl: !1
      }).setView([0, 1], 4)),
        this.renderedMap.dragging.disable(),
        this.renderedMap.doubleClickZoom.disable(),
        this.refreshMap(),
        super.firstUpdated(t);
    }
    handleClickedBreadcrumb(t) {
      this.osmId = t.currentTarget.getAttribute('data-osmid');
      const e = [];
      for (const t of this.path)
        if ((e.push(t), t.osm_id === this.osmId)) {
          this.onFeatureClicked && this.onFeatureClicked(t);
          break;
        }
      (this.path = e), this.refreshMap();
    }
    render() {
      return this.osmId
        ? j`
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.5.1/dist/leaflet.css"
      />
      <div id="alias-map"></div>
    `
        : j`<div>No osm map id</div>`;
    }
  }
  t([ge()], ec.prototype, 'feature', void 0),
    t([ge()], ec.prototype, 'osmId', void 0),
    t([ge()], ec.prototype, 'endpoint', void 0),
    t([ge()], ec.prototype, 'onFeatureClicked', void 0),
    t([ge()], ec.prototype, 'hovered', void 0),
    t([ge()], ec.prototype, 'path', void 0),
    Gh('leaflet-map', ec),
    Gh('alias-editor', Qh);
})();
//# sourceMappingURL=temba-components.js.map
