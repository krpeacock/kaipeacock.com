(() => {
  // node_modules/.pnpm/@webcomponents+shadycss@1.11.2/node_modules/@webcomponents/shadycss/src/style-settings.js
  var nativeShadow = !(window["ShadyDOM"] && window["ShadyDOM"]["inUse"]);
  var nativeCssVariables_;
  function calcCssVariables(settings) {
    if (settings && settings.shimcssproperties) {
      nativeCssVariables_ = false;
    } else {
      nativeCssVariables_ =
        nativeShadow ||
        Boolean(
          !navigator.userAgent.match(/AppleWebKit\/601|Edge\/15/) &&
            window.CSS &&
            CSS.supports &&
            CSS.supports("box-shadow", "0 0 0 var(--foo)")
        );
    }
  }
  var cssBuild;
  if (window.ShadyCSS && window.ShadyCSS.cssBuild !== void 0) {
    cssBuild = window.ShadyCSS.cssBuild;
  }
  var disableRuntime = Boolean(
    window.ShadyCSS && window.ShadyCSS.disableRuntime
  );
  if (window.ShadyCSS && window.ShadyCSS.nativeCss !== void 0) {
    nativeCssVariables_ = window.ShadyCSS.nativeCss;
  } else if (window.ShadyCSS) {
    calcCssVariables(window.ShadyCSS);
    window.ShadyCSS = void 0;
  } else {
    calcCssVariables(
      window["WebComponents"] && window["WebComponents"]["flags"]
    );
  }
  var nativeCssVariables =
    /** @type {boolean} */
    nativeCssVariables_;

  // node_modules/.pnpm/@webcomponents+shadycss@1.11.2/node_modules/@webcomponents/shadycss/src/css-parse.js
  var StyleNode = class {
    constructor() {
      this["start"] = 0;
      this["end"] = 0;
      this["previous"] = null;
      this["parent"] = null;
      this["rules"] = null;
      this["parsedCssText"] = "";
      this["cssText"] = "";
      this["atRule"] = false;
      this["type"] = 0;
      this["keyframesName"] = "";
      this["selector"] = "";
      this["parsedSelector"] = "";
    }
  };
  function parse(text) {
    text = clean(text);
    return parseCss(lex(text), text);
  }
  function clean(cssText) {
    return cssText.replace(RX.comments, "").replace(RX.port, "");
  }
  function lex(text) {
    let root2 = new StyleNode();
    root2["start"] = 0;
    root2["end"] = text.length;
    let n = root2;
    for (let i = 0, l = text.length; i < l; i++) {
      if (text[i] === OPEN_BRACE) {
        if (!n["rules"]) {
          n["rules"] = [];
        }
        let p2 = n;
        let previous = p2["rules"][p2["rules"].length - 1] || null;
        n = new StyleNode();
        n["start"] = i + 1;
        n["parent"] = p2;
        n["previous"] = previous;
        p2["rules"].push(n);
      } else if (text[i] === CLOSE_BRACE) {
        n["end"] = i + 1;
        n = n["parent"] || root2;
      }
    }
    return root2;
  }
  function parseCss(node, text) {
    let t = text.substring(node["start"], node["end"] - 1);
    node["parsedCssText"] = node["cssText"] = t.trim();
    if (node["parent"]) {
      let ss = node["previous"]
        ? node["previous"]["end"]
        : node["parent"]["start"];
      t = text.substring(ss, node["start"] - 1);
      t = _expandUnicodeEscapes(t);
      t = t.replace(RX.multipleSpaces, " ");
      t = t.substring(t.lastIndexOf(";") + 1);
      let s = (node["parsedSelector"] = node["selector"] = t.trim());
      node["atRule"] = s.indexOf(AT_START) === 0;
      if (node["atRule"]) {
        if (s.indexOf(MEDIA_START) === 0) {
          node["type"] = types.MEDIA_RULE;
        } else if (s.match(RX.keyframesRule)) {
          node["type"] = types.KEYFRAMES_RULE;
          node["keyframesName"] = node["selector"]
            .split(RX.multipleSpaces)
            .pop();
        }
      } else {
        if (s.indexOf(VAR_START) === 0) {
          node["type"] = types.MIXIN_RULE;
        } else {
          node["type"] = types.STYLE_RULE;
        }
      }
    }
    let r$ = node["rules"];
    if (r$) {
      for (let i = 0, l = r$.length, r; i < l && (r = r$[i]); i++) {
        parseCss(r, text);
      }
    }
    return node;
  }
  function _expandUnicodeEscapes(s) {
    return s.replace(/\\([0-9a-f]{1,6})\s/gi, function () {
      let code = arguments[1],
        repeat = 6 - code.length;
      while (repeat--) {
        code = "0" + code;
      }
      return "\\" + code;
    });
  }
  function stringify(node, preserveProperties, text = "") {
    let cssText = "";
    if (node["cssText"] || node["rules"]) {
      let r$ = node["rules"];
      if (r$ && !_hasMixinRules(r$)) {
        for (let i = 0, l = r$.length, r; i < l && (r = r$[i]); i++) {
          cssText = stringify(r, preserveProperties, cssText);
        }
      } else {
        cssText = preserveProperties
          ? node["cssText"]
          : removeCustomProps(node["cssText"]);
        cssText = cssText.trim();
        if (cssText) {
          cssText = "  " + cssText + "\n";
        }
      }
    }
    if (cssText) {
      if (node["selector"]) {
        text += node["selector"] + " " + OPEN_BRACE + "\n";
      }
      text += cssText;
      if (node["selector"]) {
        text += CLOSE_BRACE + "\n\n";
      }
    }
    return text;
  }
  function _hasMixinRules(rules) {
    let r = rules[0];
    return (
      Boolean(r) &&
      Boolean(r["selector"]) &&
      r["selector"].indexOf(VAR_START) === 0
    );
  }
  function removeCustomProps(cssText) {
    cssText = removeCustomPropAssignment(cssText);
    return removeCustomPropApply(cssText);
  }
  function removeCustomPropAssignment(cssText) {
    return cssText.replace(RX.customProp, "").replace(RX.mixinProp, "");
  }
  function removeCustomPropApply(cssText) {
    return cssText.replace(RX.mixinApply, "").replace(RX.varApply, "");
  }
  var types = {
    STYLE_RULE: 1,
    KEYFRAMES_RULE: 7,
    MEDIA_RULE: 4,
    MIXIN_RULE: 1e3,
  };
  var OPEN_BRACE = "{";
  var CLOSE_BRACE = "}";
  var RX = {
    comments: /\/\*[^*]*\*+([^/*][^*]*\*+)*\//gim,
    port: /@import[^;]*;/gim,
    customProp: /(?:^[^;\-\s}]+)?--[^;{}]*?:[^{};]*?(?:[;\n]|$)/gim,
    mixinProp: /(?:^[^;\-\s}]+)?--[^;{}]*?:[^{};]*?{[^}]*?}(?:[;\n]|$)?/gim,
    mixinApply: /@apply\s*\(?[^);]*\)?\s*(?:[;\n]|$)?/gim,
    varApply: /[^;:]*?:[^;]*?var\([^;]*\)(?:[;\n]|$)?/gim,
    keyframesRule: /^@[^\s]*keyframes/,
    multipleSpaces: /\s+/g,
  };
  var VAR_START = "--";
  var MEDIA_START = "@media";
  var AT_START = "@";

  // node_modules/.pnpm/@webcomponents+shadycss@1.11.2/node_modules/@webcomponents/shadycss/src/common-regex.js
  var VAR_ASSIGN =
    /(?:^|[;\s{]\s*)(--[\w-]*?)\s*:\s*(?:((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^)]*?\)|[^};{])+)|\{([^}]*)\}(?:(?=[;\s}])|$))/gi;
  var MIXIN_MATCH = /(?:^|\W+)@apply\s*\(?([^);\n]*)\)?/gi;
  var MEDIA_MATCH = /@media\s(.*)/;

  // node_modules/.pnpm/@webcomponents+shadycss@1.11.2/node_modules/@webcomponents/shadycss/src/unscoped-style-handler.js
  var styleTextSet = /* @__PURE__ */ new Set();
  var scopingAttribute = "shady-unscoped";
  function processUnscopedStyle(style) {
    const text = style.textContent;
    if (!styleTextSet.has(text)) {
      styleTextSet.add(text);
      const newStyle = document.createElement("style");
      newStyle.setAttribute("shady-unscoped", "");
      newStyle.textContent = text;
      document.head.appendChild(newStyle);
    }
  }
  function isUnscopedStyle(style) {
    return style.hasAttribute(scopingAttribute);
  }

  // node_modules/.pnpm/@webcomponents+shadycss@1.11.2/node_modules/@webcomponents/shadycss/src/style-util.js
  function toCssText(rules, callback) {
    if (!rules) {
      return "";
    }
    if (typeof rules === "string") {
      rules = parse(rules);
    }
    if (callback) {
      forEachRule(rules, callback);
    }
    return stringify(rules, nativeCssVariables);
  }
  function rulesForStyle(style) {
    if (!style["__cssRules"] && style.textContent) {
      style["__cssRules"] = parse(style.textContent);
    }
    return style["__cssRules"] || null;
  }
  function forEachRule(
    node,
    styleRuleCallback,
    keyframesRuleCallback,
    onlyActiveRules
  ) {
    if (!node) {
      return;
    }
    let skipRules = false;
    let type = node["type"];
    if (onlyActiveRules) {
      if (type === types.MEDIA_RULE) {
        let matchMedia = node["selector"].match(MEDIA_MATCH);
        if (matchMedia) {
          if (!window.matchMedia(matchMedia[1]).matches) {
            skipRules = true;
          }
        }
      }
    }
    if (type === types.STYLE_RULE) {
      styleRuleCallback(node);
    } else if (keyframesRuleCallback && type === types.KEYFRAMES_RULE) {
      keyframesRuleCallback(node);
    } else if (type === types.MIXIN_RULE) {
      skipRules = true;
    }
    let r$ = node["rules"];
    if (r$ && !skipRules) {
      for (let i = 0, l = r$.length, r; i < l && (r = r$[i]); i++) {
        forEachRule(
          r,
          styleRuleCallback,
          keyframesRuleCallback,
          onlyActiveRules
        );
      }
    }
  }
  function findMatchingParen(text, start) {
    let level = 0;
    for (let i = start, l = text.length; i < l; i++) {
      if (text[i] === "(") {
        level++;
      } else if (text[i] === ")") {
        if (--level === 0) {
          return i;
        }
      }
    }
    return -1;
  }
  function processVariableAndFallback(str, callback) {
    let start = str.indexOf("var(");
    if (start === -1) {
      return callback(str, "", "", "");
    }
    let end = findMatchingParen(str, start + 3);
    let inner = str.substring(start + 4, end);
    let prefix = str.substring(0, start);
    let suffix = processVariableAndFallback(str.substring(end + 1), callback);
    let comma = inner.indexOf(",");
    if (comma === -1) {
      return callback(prefix, inner.trim(), "", suffix);
    }
    let value = inner.substring(0, comma).trim();
    let fallback = inner.substring(comma + 1).trim();
    return callback(prefix, value, fallback, suffix);
  }
  var wrap =
    (window["ShadyDOM"] && window["ShadyDOM"]["wrap"]) || ((node) => node);
  function getIsExtends(element) {
    let localName = element["localName"];
    let is = "",
      typeExtension = "";
    if (localName) {
      if (localName.indexOf("-") > -1) {
        is = localName;
      } else {
        typeExtension = localName;
        is = (element.getAttribute && element.getAttribute("is")) || "";
      }
    } else {
      is = /** @type {?} */ element.is;
      typeExtension = /** @type {?} */ element.extends;
    }
    return { is, typeExtension };
  }
  function gatherStyleText(element) {
    const styleTextParts = [];
    const styles =
      /** @type {!NodeList<!HTMLStyleElement>} */
      element.querySelectorAll("style");
    for (let i = 0; i < styles.length; i++) {
      const style = styles[i];
      if (isUnscopedStyle(style)) {
        if (!nativeShadow) {
          processUnscopedStyle(style);
          style.parentNode.removeChild(style);
        }
      } else {
        styleTextParts.push(style.textContent);
        style.parentNode.removeChild(style);
      }
    }
    return styleTextParts.join("").trim();
  }
  var CSS_BUILD_ATTR = "css-build";
  function getCssBuild(element) {
    if (cssBuild !== void 0) {
      return (
        /** @type {string} */
        cssBuild
      );
    }
    if (element.__cssBuild === void 0) {
      const attrValue = element.getAttribute(CSS_BUILD_ATTR);
      if (attrValue) {
        element.__cssBuild = attrValue;
      } else {
        const buildComment = getBuildComment(element);
        if (buildComment !== "") {
          removeBuildComment(element);
        }
        element.__cssBuild = buildComment;
      }
    }
    return element.__cssBuild || "";
  }
  function elementHasBuiltCss(element) {
    return getCssBuild(element) !== "";
  }
  function getBuildComment(element) {
    const buildComment =
      element.localName === "template"
        ? /** @type {!HTMLTemplateElement} */
          element.content.firstChild
        : element.firstChild;
    if (buildComment instanceof Comment) {
      const commentParts = buildComment.textContent.trim().split(":");
      if (commentParts[0] === CSS_BUILD_ATTR) {
        return commentParts[1];
      }
    }
    return "";
  }
  function removeBuildComment(element) {
    const buildComment =
      element.localName === "template"
        ? /** @type {!HTMLTemplateElement} */
          element.content.firstChild
        : element.firstChild;
    buildComment.parentNode.removeChild(buildComment);
  }

  // node_modules/.pnpm/@webcomponents+shadycss@1.11.2/node_modules/@webcomponents/shadycss/src/common-utils.js
  function updateNativeProperties(element, properties) {
    for (let p2 in properties) {
      if (p2 === null) {
        element.style.removeProperty(p2);
      } else {
        element.style.setProperty(p2, properties[p2]);
      }
    }
  }
  function getComputedStyleValue(element, property) {
    const value = window.getComputedStyle(element).getPropertyValue(property);
    if (!value) {
      return "";
    } else {
      return value.trim();
    }
  }
  function detectMixin(cssText) {
    const has = MIXIN_MATCH.test(cssText) || VAR_ASSIGN.test(cssText);
    MIXIN_MATCH.lastIndex = 0;
    VAR_ASSIGN.lastIndex = 0;
    return has;
  }

  // node_modules/.pnpm/@webcomponents+shadycss@1.11.2/node_modules/@webcomponents/shadycss/src/apply-shim.js
  var APPLY_NAME_CLEAN = /;\s*/m;
  var INITIAL_INHERIT = /^\s*(initial)|(inherit)\s*$/;
  var IMPORTANT = /\s*!important/;
  var MIXIN_VAR_SEP = "_-_";
  var MixinMap = class {
    constructor() {
      this._map = {};
    }
    /**
     * @param {string} name
     * @param {!PropertyEntry} props
     */
    set(name, props) {
      name = name.trim();
      this._map[name] = {
        properties: props,
        dependants: {},
      };
    }
    /**
     * @param {string} name
     * @return {MixinMapEntry}
     */
    get(name) {
      name = name.trim();
      return this._map[name] || null;
    }
  };
  var invalidCallback = null;
  var ApplyShim = class {
    constructor() {
      this._currentElement = null;
      this._measureElement = null;
      this._map = new MixinMap();
    }
    /**
     * return true if `cssText` contains a mixin definition or consumption
     * @param {string} cssText
     * @return {boolean}
     */
    detectMixin(cssText) {
      return detectMixin(cssText);
    }
    /**
     * Gather styles into one style for easier processing
     * @param {!HTMLTemplateElement} template
     * @return {HTMLStyleElement}
     */
    gatherStyles(template4) {
      const styleText = gatherStyleText(template4.content);
      if (styleText) {
        const style =
          /** @type {!HTMLStyleElement} */
          document.createElement("style");
        style.textContent = styleText;
        template4.content.insertBefore(style, template4.content.firstChild);
        return style;
      }
      return null;
    }
    /**
     * @param {!HTMLTemplateElement} template
     * @param {string} elementName
     * @return {StyleNode}
     */
    transformTemplate(template4, elementName) {
      if (template4._gatheredStyle === void 0) {
        template4._gatheredStyle = this.gatherStyles(template4);
      }
      const style = template4._gatheredStyle;
      return style ? this.transformStyle(style, elementName) : null;
    }
    /**
     * @param {!HTMLStyleElement} style
     * @param {string} elementName
     * @return {StyleNode}
     */
    transformStyle(style, elementName = "") {
      let ast = rulesForStyle(style);
      this.transformRules(ast, elementName);
      style.textContent = toCssText(ast);
      return ast;
    }
    /**
     * @param {!HTMLStyleElement} style
     * @return {StyleNode}
     */
    transformCustomStyle(style) {
      let ast = rulesForStyle(style);
      forEachRule(ast, (rule) => {
        if (rule["selector"] === ":root") {
          rule["selector"] = "html";
        }
        this.transformRule(rule);
      });
      style.textContent = toCssText(ast);
      return ast;
    }
    /**
     * @param {StyleNode} rules
     * @param {string} elementName
     */
    transformRules(rules, elementName) {
      this._currentElement = elementName;
      forEachRule(rules, (r) => {
        this.transformRule(r);
      });
      this._currentElement = null;
    }
    /**
     * @param {!StyleNode} rule
     */
    transformRule(rule) {
      rule["cssText"] = this.transformCssText(rule["parsedCssText"], rule);
      if (rule["selector"] === ":root") {
        rule["selector"] = ":host > *";
      }
    }
    /**
     * @param {string} cssText
     * @param {!StyleNode} rule
     * @return {string}
     */
    transformCssText(cssText, rule) {
      cssText = cssText.replace(
        VAR_ASSIGN,
        (matchText, propertyName, valueProperty, valueMixin) =>
          this._produceCssProperties(
            matchText,
            propertyName,
            valueProperty,
            valueMixin,
            rule
          )
      );
      return this._consumeCssProperties(cssText, rule);
    }
    /**
     * @param {string} property
     * @return {string}
     */
    _getInitialValueForProperty(property) {
      if (!this._measureElement) {
        this._measureElement =
          /** @type {HTMLMetaElement} */
          document.createElement("meta");
        this._measureElement.setAttribute("apply-shim-measure", "");
        this._measureElement.style.all = "initial";
        document.head.appendChild(this._measureElement);
      }
      return window
        .getComputedStyle(this._measureElement)
        .getPropertyValue(property);
    }
    /**
     * Walk over all rules before this rule to find fallbacks for mixins
     *
     * @param {!StyleNode} startRule
     * @return {!Object}
     */
    _fallbacksFromPreviousRules(startRule) {
      let topRule = startRule;
      while (topRule["parent"]) {
        topRule = topRule["parent"];
      }
      const fallbacks = {};
      let seenStartRule = false;
      forEachRule(topRule, (r) => {
        seenStartRule = seenStartRule || r === startRule;
        if (seenStartRule) {
          return;
        }
        if (r["selector"] === startRule["selector"]) {
          Object.assign(fallbacks, this._cssTextToMap(r["parsedCssText"]));
        }
      });
      return fallbacks;
    }
    /**
     * replace mixin consumption with variable consumption
     * @param {string} text
     * @param {!StyleNode=} rule
     * @return {string}
     */
    _consumeCssProperties(text, rule) {
      let m = null;
      while ((m = MIXIN_MATCH.exec(text))) {
        let matchText = m[0];
        let mixinName = m[1];
        let idx = m.index;
        let applyPos = idx + matchText.indexOf("@apply");
        let afterApplyPos = idx + matchText.length;
        let textBeforeApply = text.slice(0, applyPos);
        let textAfterApply = text.slice(afterApplyPos);
        let defaults = rule ? this._fallbacksFromPreviousRules(rule) : {};
        Object.assign(defaults, this._cssTextToMap(textBeforeApply));
        let replacement = this._atApplyToCssProperties(mixinName, defaults);
        text = `${textBeforeApply}${replacement}${textAfterApply}`;
        MIXIN_MATCH.lastIndex = idx + replacement.length;
      }
      return text;
    }
    /**
     * produce variable consumption at the site of mixin consumption
     * `@apply` --foo; -> for all props (${propname}: var(--foo_-_${propname}, ${fallback[propname]}}))
     * Example:
     *  border: var(--foo_-_border); padding: var(--foo_-_padding, 2px)
     *
     * @param {string} mixinName
     * @param {Object} fallbacks
     * @return {string}
     */
    _atApplyToCssProperties(mixinName, fallbacks) {
      mixinName = mixinName.replace(APPLY_NAME_CLEAN, "");
      let vars = [];
      let mixinEntry = this._map.get(mixinName);
      if (!mixinEntry) {
        this._map.set(mixinName, {});
        mixinEntry = this._map.get(mixinName);
      }
      if (mixinEntry) {
        if (this._currentElement) {
          mixinEntry.dependants[this._currentElement] = true;
        }
        let p2, parts, f;
        const properties = mixinEntry.properties;
        for (p2 in properties) {
          f = fallbacks && fallbacks[p2];
          parts = [p2, ": var(", mixinName, MIXIN_VAR_SEP, p2];
          if (f) {
            parts.push(",", f.replace(IMPORTANT, ""));
          }
          parts.push(")");
          if (IMPORTANT.test(properties[p2])) {
            parts.push(" !important");
          }
          vars.push(parts.join(""));
        }
      }
      return vars.join("; ");
    }
    /**
     * @param {string} property
     * @param {string} value
     * @return {string}
     */
    _replaceInitialOrInherit(property, value) {
      let match = INITIAL_INHERIT.exec(value);
      if (match) {
        if (match[1]) {
          value = this._getInitialValueForProperty(property);
        } else {
          value = "apply-shim-inherit";
        }
      }
      return value;
    }
    /**
     * "parse" a mixin definition into a map of properties and values
     * cssTextToMap('border: 2px solid black') -> ('border', '2px solid black')
     * @param {string} text
     * @param {boolean=} replaceInitialOrInherit
     * @return {!Object<string, string>}
     */
    _cssTextToMap(text, replaceInitialOrInherit = false) {
      let props = text.split(";");
      let property, value;
      let out = {};
      for (let i = 0, p2, sp; i < props.length; i++) {
        p2 = props[i];
        if (p2) {
          sp = p2.split(":");
          if (sp.length > 1) {
            property = sp[0].trim();
            value = sp.slice(1).join(":");
            if (replaceInitialOrInherit) {
              value = this._replaceInitialOrInherit(property, value);
            }
            out[property] = value;
          }
        }
      }
      return out;
    }
    /**
     * @param {MixinMapEntry} mixinEntry
     */
    _invalidateMixinEntry(mixinEntry) {
      if (!invalidCallback) {
        return;
      }
      for (let elementName in mixinEntry.dependants) {
        if (elementName !== this._currentElement) {
          invalidCallback(elementName);
        }
      }
    }
    /**
     * @param {string} matchText
     * @param {string} propertyName
     * @param {?string} valueProperty
     * @param {?string} valueMixin
     * @param {!StyleNode} rule
     * @return {string}
     */
    _produceCssProperties(
      matchText,
      propertyName,
      valueProperty,
      valueMixin,
      rule
    ) {
      if (valueProperty) {
        processVariableAndFallback(valueProperty, (prefix2, value) => {
          if (value && this._map.get(value)) {
            valueMixin = `@apply ${value};`;
          }
        });
      }
      if (!valueMixin) {
        return matchText;
      }
      let mixinAsProperties = this._consumeCssProperties("" + valueMixin, rule);
      let prefix = matchText.slice(0, matchText.indexOf("--"));
      let mixinValues = this._cssTextToMap(mixinAsProperties, true);
      let combinedProps = mixinValues;
      let mixinEntry = this._map.get(propertyName);
      let oldProps = mixinEntry && mixinEntry.properties;
      if (oldProps) {
        combinedProps = Object.assign(Object.create(oldProps), mixinValues);
      } else {
        this._map.set(propertyName, combinedProps);
      }
      let out = [];
      let p2, v;
      let needToInvalidate = false;
      for (p2 in combinedProps) {
        v = mixinValues[p2];
        if (v === void 0) {
          v = "initial";
        }
        if (oldProps && !(p2 in oldProps)) {
          needToInvalidate = true;
        }
        out.push(`${propertyName}${MIXIN_VAR_SEP}${p2}: ${v}`);
      }
      if (needToInvalidate) {
        this._invalidateMixinEntry(mixinEntry);
      }
      if (mixinEntry) {
        mixinEntry.properties = combinedProps;
      }
      if (valueProperty) {
        prefix = `${matchText};${prefix}`;
      }
      return `${prefix}${out.join("; ")};`;
    }
  };
  ApplyShim.prototype["detectMixin"] = ApplyShim.prototype.detectMixin;
  ApplyShim.prototype["transformStyle"] = ApplyShim.prototype.transformStyle;
  ApplyShim.prototype["transformCustomStyle"] =
    ApplyShim.prototype.transformCustomStyle;
  ApplyShim.prototype["transformRules"] = ApplyShim.prototype.transformRules;
  ApplyShim.prototype["transformRule"] = ApplyShim.prototype.transformRule;
  ApplyShim.prototype["transformTemplate"] =
    ApplyShim.prototype.transformTemplate;
  ApplyShim.prototype["_separator"] = MIXIN_VAR_SEP;
  Object.defineProperty(ApplyShim.prototype, "invalidCallback", {
    /** @return {?function(string)} */
    get() {
      return invalidCallback;
    },
    /** @param {?function(string)} cb */
    set(cb) {
      invalidCallback = cb;
    },
  });
  var apply_shim_default = ApplyShim;

  // node_modules/.pnpm/@webcomponents+shadycss@1.11.2/node_modules/@webcomponents/shadycss/src/template-map.js
  var templateMap = {};
  var template_map_default = templateMap;

  // node_modules/.pnpm/@webcomponents+shadycss@1.11.2/node_modules/@webcomponents/shadycss/src/apply-shim-utils.js
  var CURRENT_VERSION = "_applyShimCurrentVersion";
  var NEXT_VERSION = "_applyShimNextVersion";
  var VALIDATING_VERSION = "_applyShimValidatingVersion";
  var promise = Promise.resolve();
  function invalidate(elementName) {
    let template4 = template_map_default[elementName];
    if (template4) {
      invalidateTemplate(template4);
    }
  }
  function invalidateTemplate(template4) {
    template4[CURRENT_VERSION] = template4[CURRENT_VERSION] || 0;
    template4[VALIDATING_VERSION] = template4[VALIDATING_VERSION] || 0;
    template4[NEXT_VERSION] = (template4[NEXT_VERSION] || 0) + 1;
  }
  function templateIsValid(template4) {
    return template4[CURRENT_VERSION] === template4[NEXT_VERSION];
  }
  function templateIsValidating(template4) {
    return (
      !templateIsValid(template4) &&
      template4[VALIDATING_VERSION] === template4[NEXT_VERSION]
    );
  }
  function startValidatingTemplate(template4) {
    template4[VALIDATING_VERSION] = template4[NEXT_VERSION];
    if (!template4._validating) {
      template4._validating = true;
      promise.then(function () {
        template4[CURRENT_VERSION] = template4[NEXT_VERSION];
        template4._validating = false;
      });
    }
  }

  // node_modules/.pnpm/@webcomponents+shadycss@1.11.2/node_modules/@webcomponents/shadycss/src/document-wait.js
  var readyPromise = null;
  var whenReady =
    (window["HTMLImports"] && window["HTMLImports"]["whenReady"]) || null;
  var resolveFn;
  function documentWait(callback) {
    requestAnimationFrame(function () {
      if (whenReady) {
        whenReady(callback);
      } else {
        if (!readyPromise) {
          readyPromise = new Promise((resolve2) => {
            resolveFn = resolve2;
          });
          if (document.readyState === "complete") {
            resolveFn();
          } else {
            document.addEventListener("readystatechange", () => {
              if (document.readyState === "complete") {
                resolveFn();
              }
            });
          }
        }
        readyPromise.then(function () {
          callback && callback();
        });
      }
    });
  }

  // node_modules/.pnpm/@webcomponents+shadycss@1.11.2/node_modules/@webcomponents/shadycss/src/custom-style-interface.js
  var SEEN_MARKER = "__seenByShadyCSS";
  var CACHED_STYLE = "__shadyCSSCachedStyle";
  var transformFn = null;
  var validateFn = null;
  var CustomStyleInterface = class {
    constructor() {
      this["customStyles"] = [];
      this["enqueued"] = false;
      documentWait(() => {
        if (window["ShadyCSS"]["flushCustomStyles"]) {
          window["ShadyCSS"]["flushCustomStyles"]();
        }
      });
    }
    /**
     * Queue a validation for new custom styles to batch style recalculations
     */
    enqueueDocumentValidation() {
      if (this["enqueued"] || !validateFn) {
        return;
      }
      this["enqueued"] = true;
      documentWait(validateFn);
    }
    /**
     * @param {!HTMLStyleElement} style
     */
    addCustomStyle(style) {
      if (!style[SEEN_MARKER]) {
        style[SEEN_MARKER] = true;
        this["customStyles"].push(style);
        this.enqueueDocumentValidation();
      }
    }
    /**
     * @param {!CustomStyleProvider} customStyle
     * @return {HTMLStyleElement}
     */
    getStyleForCustomStyle(customStyle) {
      if (customStyle[CACHED_STYLE]) {
        return customStyle[CACHED_STYLE];
      }
      let style;
      if (customStyle["getStyle"]) {
        style = customStyle["getStyle"]();
      } else {
        style = customStyle;
      }
      return style;
    }
    /**
     * @return {!Array<!CustomStyleProvider>}
     */
    processStyles() {
      const cs = this["customStyles"];
      for (let i = 0; i < cs.length; i++) {
        const customStyle = cs[i];
        if (customStyle[CACHED_STYLE]) {
          continue;
        }
        const style = this.getStyleForCustomStyle(customStyle);
        if (style) {
          const styleToTransform =
            /** @type {!HTMLStyleElement} */
            style["__appliedElement"] || style;
          if (transformFn) {
            transformFn(styleToTransform);
          }
          customStyle[CACHED_STYLE] = styleToTransform;
        }
      }
      return cs;
    }
  };
  CustomStyleInterface.prototype["addCustomStyle"] =
    CustomStyleInterface.prototype.addCustomStyle;
  CustomStyleInterface.prototype["getStyleForCustomStyle"] =
    CustomStyleInterface.prototype.getStyleForCustomStyle;
  CustomStyleInterface.prototype["processStyles"] =
    CustomStyleInterface.prototype.processStyles;
  Object.defineProperties(CustomStyleInterface.prototype, {
    transformCallback: {
      /** @return {?function(!HTMLStyleElement)} */
      get() {
        return transformFn;
      },
      /** @param {?function(!HTMLStyleElement)} fn */
      set(fn) {
        transformFn = fn;
      },
    },
    validateCallback: {
      /** @return {?function()} */
      get() {
        return validateFn;
      },
      /**
       * @param {?function()} fn
       * @this {CustomStyleInterface}
       */
      set(fn) {
        let needsEnqueue = false;
        if (!validateFn) {
          needsEnqueue = true;
        }
        validateFn = fn;
        if (needsEnqueue) {
          this.enqueueDocumentValidation();
        }
      },
    },
  });

  // node_modules/.pnpm/@webcomponents+shadycss@1.11.2/node_modules/@webcomponents/shadycss/entrypoints/apply-shim.js
  var applyShim = new apply_shim_default();
  var ApplyShimInterface = class {
    constructor() {
      this.customStyleInterface = null;
      applyShim["invalidCallback"] = invalidate;
    }
    ensure() {
      if (this.customStyleInterface) {
        return;
      }
      if (window.ShadyCSS.CustomStyleInterface) {
        this.customStyleInterface =
          /** @type {!CustomStyleInterfaceInterface} */
          window.ShadyCSS.CustomStyleInterface;
        this.customStyleInterface["transformCallback"] = (style) => {
          applyShim.transformCustomStyle(style);
        };
        this.customStyleInterface["validateCallback"] = () => {
          requestAnimationFrame(() => {
            if (this.customStyleInterface["enqueued"]) {
              this.flushCustomStyles();
            }
          });
        };
      }
    }
    /**
     * @param {!HTMLTemplateElement} template
     * @param {string} elementName
     */
    prepareTemplate(template4, elementName) {
      this.ensure();
      if (elementHasBuiltCss(template4)) {
        return;
      }
      template_map_default[elementName] = template4;
      let ast = applyShim.transformTemplate(template4, elementName);
      template4["_styleAst"] = ast;
    }
    flushCustomStyles() {
      this.ensure();
      if (!this.customStyleInterface) {
        return;
      }
      let styles = this.customStyleInterface["processStyles"]();
      if (!this.customStyleInterface["enqueued"]) {
        return;
      }
      for (let i = 0; i < styles.length; i++) {
        let cs = styles[i];
        let style = this.customStyleInterface["getStyleForCustomStyle"](cs);
        if (style) {
          applyShim.transformCustomStyle(style);
        }
      }
      this.customStyleInterface["enqueued"] = false;
    }
    /**
     * @param {HTMLElement} element
     * @param {Object=} properties
     */
    styleSubtree(element, properties) {
      this.ensure();
      if (properties) {
        updateNativeProperties(element, properties);
      }
      if (element.shadowRoot) {
        this.styleElement(element);
        let shadowChildren =
          /** @type {!ParentNode} */
          element.shadowRoot.children || element.shadowRoot.childNodes;
        for (let i = 0; i < shadowChildren.length; i++) {
          this.styleSubtree(
            /** @type {HTMLElement} */
            shadowChildren[i]
          );
        }
      } else {
        let children = element.children || element.childNodes;
        for (let i = 0; i < children.length; i++) {
          this.styleSubtree(
            /** @type {HTMLElement} */
            children[i]
          );
        }
      }
    }
    /**
     * @param {HTMLElement} element
     */
    styleElement(element) {
      this.ensure();
      let { is } = getIsExtends(element);
      let template4 = template_map_default[is];
      if (template4 && elementHasBuiltCss(template4)) {
        return;
      }
      if (template4 && !templateIsValid(template4)) {
        if (!templateIsValidating(template4)) {
          this.prepareTemplate(template4, is);
          startValidatingTemplate(template4);
        }
        let root2 = element.shadowRoot;
        if (root2) {
          let style =
            /** @type {HTMLStyleElement} */
            root2.querySelector("style");
          if (style) {
            style["__cssRules"] = template4["_styleAst"];
            style.textContent = toCssText(template4["_styleAst"]);
          }
        }
      }
    }
    /**
     * @param {Object=} properties
     */
    styleDocument(properties) {
      this.ensure();
      this.styleSubtree(document.body, properties);
    }
  };
  if (!window.ShadyCSS || !window.ShadyCSS.ScopingShim) {
    const applyShimInterface = new ApplyShimInterface();
    let CustomStyleInterface3 =
      window.ShadyCSS && window.ShadyCSS.CustomStyleInterface;
    window.ShadyCSS = {
      /**
       * @param {!HTMLTemplateElement} template
       * @param {string} elementName
       * @param {string=} elementExtends
       */
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      prepareTemplate(template4, elementName, elementExtends) {
        applyShimInterface.flushCustomStyles();
        applyShimInterface.prepareTemplate(template4, elementName);
      },
      /**
       * @param {!HTMLTemplateElement} template
       * @param {string} elementName
       * @param {string=} elementExtends
       */
      prepareTemplateStyles(template4, elementName, elementExtends) {
        window.ShadyCSS.prepareTemplate(template4, elementName, elementExtends);
      },
      /**
       * @param {!HTMLTemplateElement} template
       * @param {string} elementName
       */
      prepareTemplateDom(template4, elementName) {},
      // eslint-disable-line @typescript-eslint/no-unused-vars
      /**
       * @param {!HTMLElement} element
       * @param {Object=} properties
       */
      styleSubtree(element, properties) {
        applyShimInterface.flushCustomStyles();
        applyShimInterface.styleSubtree(element, properties);
      },
      /**
       * @param {!HTMLElement} element
       */
      styleElement(element) {
        applyShimInterface.flushCustomStyles();
        applyShimInterface.styleElement(element);
      },
      /**
       * @param {Object=} properties
       */
      styleDocument(properties) {
        applyShimInterface.flushCustomStyles();
        applyShimInterface.styleDocument(properties);
      },
      /**
       * @param {Element} element
       * @param {string} property
       * @return {string}
       */
      getComputedStyleValue(element, property) {
        return getComputedStyleValue(element, property);
      },
      flushCustomStyles() {
        applyShimInterface.flushCustomStyles();
      },
      nativeCss: nativeCssVariables,
      nativeShadow,
      cssBuild,
      disableRuntime,
    };
    if (CustomStyleInterface3) {
      window.ShadyCSS.CustomStyleInterface = CustomStyleInterface3;
    }
  }
  window.ShadyCSS.ApplyShim = applyShim;

  // node_modules/.pnpm/@polymer+polymer@3.5.1/node_modules/@polymer/polymer/lib/utils/boot.js
  window.JSCompiler_renameProperty = function (prop, obj) {
    return prop;
  };

  // node_modules/.pnpm/@polymer+polymer@3.5.1/node_modules/@polymer/polymer/lib/utils/resolve-url.js
  var CSS_URL_RX = /(url\()([^)]*)(\))/g;
  var ABS_URL = /(^\/[^\/])|(^#)|(^[\w-\d]*:)/;
  var workingURL;
  var resolveDoc;
  function resolveUrl(url, baseURI) {
    if (url && ABS_URL.test(url)) {
      return url;
    }
    if (url === "//") {
      return url;
    }
    if (workingURL === void 0) {
      workingURL = false;
      try {
        const u = new URL("b", "http://a");
        u.pathname = "c%20d";
        workingURL = u.href === "http://a/c%20d";
      } catch (e) {}
    }
    if (!baseURI) {
      baseURI = document.baseURI || window.location.href;
    }
    if (workingURL) {
      try {
        return new URL(url, baseURI).href;
      } catch (e) {
        return url;
      }
    }
    if (!resolveDoc) {
      resolveDoc = document.implementation.createHTMLDocument("temp");
      resolveDoc.base = resolveDoc.createElement("base");
      resolveDoc.head.appendChild(resolveDoc.base);
      resolveDoc.anchor = resolveDoc.createElement("a");
      resolveDoc.body.appendChild(resolveDoc.anchor);
    }
    resolveDoc.base.href = baseURI;
    resolveDoc.anchor.href = url;
    return resolveDoc.anchor.href || url;
  }
  function resolveCss(cssText, baseURI) {
    return cssText.replace(CSS_URL_RX, function (m, pre, url, post) {
      return (
        pre + "'" + resolveUrl(url.replace(/["']/g, ""), baseURI) + "'" + post
      );
    });
  }
  function pathFromUrl(url) {
    return url.substring(0, url.lastIndexOf("/") + 1);
  }

  // node_modules/.pnpm/@polymer+polymer@3.5.1/node_modules/@polymer/polymer/lib/utils/settings.js
  var useShadow = !window.ShadyDOM || !window.ShadyDOM.inUse;
  var useNativeCSSProperties = Boolean(
    !window.ShadyCSS || window.ShadyCSS.nativeCss
  );
  var useNativeCustomElements =
    !window.customElements.polyfillWrapFlushCallback;
  var supportsAdoptingStyleSheets =
    useShadow &&
    "adoptedStyleSheets" in Document.prototype &&
    "replaceSync" in CSSStyleSheet.prototype && // Since spec may change, feature detect exact API we need
    (() => {
      try {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync("");
        const host = document.createElement("div");
        host.attachShadow({ mode: "open" });
        host.shadowRoot.adoptedStyleSheets = [sheet];
        return host.shadowRoot.adoptedStyleSheets[0] === sheet;
      } catch (e) {
        return false;
      }
    })();
  var rootPath =
    (window.Polymer && window.Polymer.rootPath) ||
    pathFromUrl(document.baseURI || window.location.href);
  var sanitizeDOMValue =
    (window.Polymer && window.Polymer.sanitizeDOMValue) || void 0;
  var passiveTouchGestures =
    (window.Polymer && window.Polymer.setPassiveTouchGestures) || false;
  var strictTemplatePolicy =
    (window.Polymer && window.Polymer.strictTemplatePolicy) || false;
  var allowTemplateFromDomModule =
    (window.Polymer && window.Polymer.allowTemplateFromDomModule) || false;
  var legacyOptimizations =
    (window.Polymer && window.Polymer.legacyOptimizations) || false;
  var legacyWarnings =
    (window.Polymer && window.Polymer.legacyWarnings) || false;
  var syncInitialRender =
    (window.Polymer && window.Polymer.syncInitialRender) || false;
  var legacyUndefined =
    (window.Polymer && window.Polymer.legacyUndefined) || false;
  var orderedComputed =
    (window.Polymer && window.Polymer.orderedComputed) || false;
  var cancelSyntheticClickEvents = true;
  var removeNestedTemplates =
    (window.Polymer && window.Polymer.removeNestedTemplates) || false;
  var fastDomIf = (window.Polymer && window.Polymer.fastDomIf) || false;
  var suppressTemplateNotifications =
    (window.Polymer && window.Polymer.suppressTemplateNotifications) || false;
  var legacyNoObservedAttributes =
    (window.Polymer && window.Polymer.legacyNoObservedAttributes) || false;
  var useAdoptedStyleSheetsWithBuiltCSS =
    (window.Polymer && window.Polymer.useAdoptedStyleSheetsWithBuiltCSS) ||
    false;

  // node_modules/.pnpm/@polymer+polymer@3.5.1/node_modules/@polymer/polymer/lib/utils/mixin.js
  var dedupeId = 0;
  function MixinFunction() {}
  MixinFunction.prototype.__mixinApplications;
  MixinFunction.prototype.__mixinSet;
  var dedupingMixin = function (mixin) {
    let mixinApplications =
      /** @type {!MixinFunction} */
      mixin.__mixinApplications;
    if (!mixinApplications) {
      mixinApplications = /* @__PURE__ */ new WeakMap();
      mixin.__mixinApplications = mixinApplications;
    }
    let mixinDedupeId = dedupeId++;
    function dedupingMixin2(base) {
      let baseSet =
        /** @type {!MixinFunction} */
        base.__mixinSet;
      if (baseSet && baseSet[mixinDedupeId]) {
        return base;
      }
      let map = mixinApplications;
      let extended = map.get(base);
      if (!extended) {
        extended = /** @type {!Function} */ mixin(base);
        map.set(base, extended);
        let mixinSet = Object.create(
          /** @type {!MixinFunction} */
          extended.__mixinSet || baseSet || null
        );
        mixinSet[mixinDedupeId] = true;
        extended.__mixinSet = mixinSet;
      }
      return extended;
    }
    return dedupingMixin2;
  };

  // node_modules/.pnpm/@polymer+polymer@3.5.1/node_modules/@polymer/polymer/lib/elements/dom-module.js
  var modules = {};
  var lcModules = {};
  function setModule(id, module) {
    modules[id] = lcModules[id.toLowerCase()] = module;
  }
  function findModule(id) {
    return modules[id] || lcModules[id.toLowerCase()];
  }
  function styleOutsideTemplateCheck(inst) {
    if (inst.querySelector("style")) {
      console.warn("dom-module %s has style outside template", inst.id);
    }
  }
  var DomModule = class extends HTMLElement {
    /** @override */
    static get observedAttributes() {
      return ["id"];
    }
    /**
     * Retrieves the element specified by the css `selector` in the module
     * registered by `id`. For example, this.import('foo', 'img');
     * @param {string} id The id of the dom-module in which to search.
     * @param {string=} selector The css selector by which to find the element.
     * @return {Element} Returns the element which matches `selector` in the
     * module registered at the specified `id`.
     *
     * @export
     * @nocollapse Referred to indirectly in style-gather.js
     */
    static import(id, selector) {
      if (id) {
        let m = findModule(id);
        if (m && selector) {
          return m.querySelector(selector);
        }
        return m;
      }
      return null;
    }
    /* eslint-disable no-unused-vars */
    /**
     * @param {string} name Name of attribute.
     * @param {?string} old Old value of attribute.
     * @param {?string} value Current value of attribute.
     * @param {?string} namespace Attribute namespace.
     * @return {void}
     * @override
     */
    attributeChangedCallback(name, old, value, namespace) {
      if (old !== value) {
        this.register();
      }
    }
    /* eslint-enable no-unused-args */
    /**
     * The absolute URL of the original location of this `dom-module`.
     *
     * This value will differ from this element's `ownerDocument` in the
     * following ways:
     * - Takes into account any `assetpath` attribute added during bundling
     *   to indicate the original location relative to the bundled location
     * - Uses the HTMLImports polyfill's `importForElement` API to ensure
     *   the path is relative to the import document's location since
     *   `ownerDocument` is not currently polyfilled
     */
    get assetpath() {
      if (!this.__assetpath) {
        const owner =
          window.HTMLImports && HTMLImports.importForElement
            ? HTMLImports.importForElement(this) || document
            : this.ownerDocument;
        const url = resolveUrl(
          this.getAttribute("assetpath") || "",
          owner.baseURI
        );
        this.__assetpath = pathFromUrl(url);
      }
      return this.__assetpath;
    }
    /**
     * Registers the dom-module at a given id. This method should only be called
     * when a dom-module is imperatively created. For
     * example, `document.createElement('dom-module').register('foo')`.
     * @param {string=} id The id at which to register the dom-module.
     * @return {void}
     */
    register(id) {
      id = id || this.id;
      if (id) {
        if (strictTemplatePolicy && findModule(id) !== void 0) {
          setModule(id, null);
          throw new Error(
            `strictTemplatePolicy: dom-module ${id} re-registered`
          );
        }
        this.id = id;
        setModule(id, this);
        styleOutsideTemplateCheck(this);
      }
    }
  };
  DomModule.prototype["modules"] = modules;
  customElements.define("dom-module", DomModule);

  // node_modules/.pnpm/@polymer+polymer@3.5.1/node_modules/@polymer/polymer/lib/utils/style-gather.js
  var MODULE_STYLE_LINK_SELECTOR = "link[rel=import][type~=css]";
  var INCLUDE_ATTR = "include";
  var SHADY_UNSCOPED_ATTR = "shady-unscoped";
  function importModule(moduleId) {
    return (
      /** @type {?DomModule} */
      DomModule.import(moduleId)
    );
  }
  function styleForImport(importDoc) {
    let container = importDoc.body ? importDoc.body : importDoc;
    const importCss = resolveCss(container.textContent, importDoc.baseURI);
    const style = document.createElement("style");
    style.textContent = importCss;
    return style;
  }
  function stylesFromModules(moduleIds) {
    const modules2 = moduleIds.trim().split(/\s+/);
    const styles = [];
    for (let i = 0; i < modules2.length; i++) {
      styles.push(...stylesFromModule(modules2[i]));
    }
    return styles;
  }
  function stylesFromModule(moduleId) {
    const m = importModule(moduleId);
    if (!m) {
      console.warn("Could not find style data in module named", moduleId);
      return [];
    }
    if (m._styles === void 0) {
      const styles = [];
      styles.push(..._stylesFromModuleImports(m));
      const template4 =
        /** @type {?HTMLTemplateElement} */
        m.querySelector("template");
      if (template4) {
        styles.push(
          ...stylesFromTemplate(
            template4,
            /** @type {templateWithAssetPath} */
            m.assetpath
          )
        );
      }
      m._styles = styles;
    }
    return m._styles;
  }
  function stylesFromTemplate(template4, baseURI) {
    if (!template4._styles) {
      const styles = [];
      const e$ = template4.content.querySelectorAll("style");
      for (let i = 0; i < e$.length; i++) {
        let e = e$[i];
        let include = e.getAttribute(INCLUDE_ATTR);
        if (include) {
          styles.push(
            ...stylesFromModules(include).filter(function (item, index, self) {
              return self.indexOf(item) === index;
            })
          );
        }
        if (baseURI) {
          e.textContent = resolveCss(
            e.textContent,
            /** @type {string} */
            baseURI
          );
        }
        styles.push(e);
      }
      template4._styles = styles;
    }
    return template4._styles;
  }
  function stylesFromModuleImports(moduleId) {
    let m = importModule(moduleId);
    return m ? _stylesFromModuleImports(m) : [];
  }
  function _stylesFromModuleImports(module) {
    const styles = [];
    const p$ = module.querySelectorAll(MODULE_STYLE_LINK_SELECTOR);
    for (let i = 0; i < p$.length; i++) {
      let p2 = p$[i];
      if (p2.import) {
        const importDoc = p2.import;
        const unscoped = p2.hasAttribute(SHADY_UNSCOPED_ATTR);
        if (unscoped && !importDoc._unscopedStyle) {
          const style = styleForImport(importDoc);
          style.setAttribute(SHADY_UNSCOPED_ATTR, "");
          importDoc._unscopedStyle = style;
        } else if (!importDoc._style) {
          importDoc._style = styleForImport(importDoc);
        }
        styles.push(unscoped ? importDoc._unscopedStyle : importDoc._style);
      }
    }
    return styles;
  }
  function cssFromModules(moduleIds) {
    let modules2 = moduleIds.trim().split(/\s+/);
    let cssText = "";
    for (let i = 0; i < modules2.length; i++) {
      cssText += cssFromModule(modules2[i]);
    }
    return cssText;
  }
  function cssFromModule(moduleId) {
    let m = importModule(moduleId);
    if (m && m._cssText === void 0) {
      let cssText = _cssFromModuleImports(m);
      let t =
        /** @type {?HTMLTemplateElement} */
        m.querySelector("template");
      if (t) {
        cssText += cssFromTemplate(
          t,
          /** @type {templateWithAssetPath} */
          m.assetpath
        );
      }
      m._cssText = cssText || null;
    }
    if (!m) {
      console.warn("Could not find style data in module named", moduleId);
    }
    return (m && m._cssText) || "";
  }
  function cssFromTemplate(template4, baseURI) {
    let cssText = "";
    const e$ = stylesFromTemplate(template4, baseURI);
    for (let i = 0; i < e$.length; i++) {
      let e = e$[i];
      if (e.parentNode) {
        e.parentNode.removeChild(e);
      }
      cssText += e.textContent;
    }
    return cssText;
  }
  function _cssFromModuleImports(module) {
    let cssText = "";
    let styles = _stylesFromModuleImports(module);
    for (let i = 0; i < styles.length; i++) {
      cssText += styles[i].textContent;
    }
    return cssText;
  }

  // node_modules/.pnpm/@polymer+polymer@3.5.1/node_modules/@polymer/polymer/lib/utils/wrap.js
  var wrap2 =
    window["ShadyDOM"] &&
    window["ShadyDOM"]["noPatch"] &&
    window["ShadyDOM"]["wrap"]
      ? window["ShadyDOM"]["wrap"]
      : window["ShadyDOM"]
      ? (n) => ShadyDOM["patch"](n)
      : (n) => n;

  // node_modules/.pnpm/@polymer+polymer@3.5.1/node_modules/@polymer/polymer/lib/utils/path.js
  function isPath(path) {
    return path.indexOf(".") >= 0;
  }
  function root(path) {
    let dotIndex = path.indexOf(".");
    if (dotIndex === -1) {
      return path;
    }
    return path.slice(0, dotIndex);
  }
  function isAncestor(base, path) {
    return base.indexOf(path + ".") === 0;
  }
  function isDescendant(base, path) {
    return path.indexOf(base + ".") === 0;
  }
  function translate(base, newBase, path) {
    return newBase + path.slice(base.length);
  }
  function matches(base, path) {
    return base === path || isAncestor(base, path) || isDescendant(base, path);
  }
  function normalize(path) {
    if (Array.isArray(path)) {
      let parts = [];
      for (let i = 0; i < path.length; i++) {
        let args = path[i].toString().split(".");
        for (let j = 0; j < args.length; j++) {
          parts.push(args[j]);
        }
      }
      return parts.join(".");
    } else {
      return path;
    }
  }
  function split(path) {
    if (Array.isArray(path)) {
      return normalize(path).split(".");
    }
    return path.toString().split(".");
  }
  function get(root2, path, info) {
    let prop = root2;
    let parts = split(path);
    for (let i = 0; i < parts.length; i++) {
      if (!prop) {
        return;
      }
      let part = parts[i];
      prop = prop[part];
    }
    if (info) {
      info.path = parts.join(".");
    }
    return prop;
  }
  function set(root2, path, value) {
    let prop = root2;
    let parts = split(path);
    let last = parts[parts.length - 1];
    if (parts.length > 1) {
      for (let i = 0; i < parts.length - 1; i++) {
        let part = parts[i];
        prop = prop[part];
        if (!prop) {
          return;
        }
      }
      prop[last] = value;
    } else {
      prop[path] = value;
    }
    return parts.join(".");
  }

  // node_modules/.pnpm/@polymer+polymer@3.5.1/node_modules/@polymer/polymer/lib/utils/case-map.js
  var caseMap = {};
  var DASH_TO_CAMEL = /-[a-z]/g;
  var CAMEL_TO_DASH = /([A-Z])/g;
  function dashToCamelCase(dash) {
    return (
      caseMap[dash] ||
      (caseMap[dash] =
        dash.indexOf("-") < 0
          ? dash
          : dash.replace(DASH_TO_CAMEL, (m) => m[1].toUpperCase()))
    );
  }
  function camelToDashCase(camel) {
    return (
      caseMap[camel] ||
      (caseMap[camel] = camel.replace(CAMEL_TO_DASH, "-$1").toLowerCase())
    );
  }

  // node_modules/.pnpm/@polymer+polymer@3.5.1/node_modules/@polymer/polymer/lib/utils/async.js
  var microtaskCurrHandle = 0;
  var microtaskLastHandle = 0;
  var microtaskCallbacks = [];
  var microtaskNodeContent = 0;
  var microtaskScheduled = false;
  var microtaskNode = document.createTextNode("");
  new window.MutationObserver(microtaskFlush).observe(microtaskNode, {
    characterData: true,
  });
  function microtaskFlush() {
    microtaskScheduled = false;
    const len = microtaskCallbacks.length;
    for (let i = 0; i < len; i++) {
      let cb = microtaskCallbacks[i];
      if (cb) {
        try {
          cb();
        } catch (e) {
          setTimeout(() => {
            throw e;
          });
        }
      }
    }
    microtaskCallbacks.splice(0, len);
    microtaskLastHandle += len;
  }
  var timeOut = {
    /**
     * Returns a sub-module with the async interface providing the provided
     * delay.
     *
     * @memberof timeOut
     * @param {number=} delay Time to wait before calling callbacks in ms
     * @return {!AsyncInterface} An async timeout interface
     */
    after(delay) {
      return {
        run(fn) {
          return window.setTimeout(fn, delay);
        },
        cancel(handle) {
          window.clearTimeout(handle);
        },
      };
    },
    /**
     * Enqueues a function called in the next task.
     *
     * @memberof timeOut
     * @param {!Function} fn Callback to run
     * @param {number=} delay Delay in milliseconds
     * @return {number} Handle used for canceling task
     */
    run(fn, delay) {
      return window.setTimeout(fn, delay);
    },
    /**
     * Cancels a previously enqueued `timeOut` callback.
     *
     * @memberof timeOut
     * @param {number} handle Handle returned from `run` of callback to cancel
     * @return {void}
     */
    cancel(handle) {
      window.clearTimeout(handle);
    },
  };
  var microTask = {
    /**
     * Enqueues a function called at microtask timing.
     *
     * @memberof microTask
     * @param {!Function=} callback Callback to run
     * @return {number} Handle used for canceling task
     */
    run(callback) {
      if (!microtaskScheduled) {
        microtaskScheduled = true;
        microtaskNode.textContent = microtaskNodeContent++;
      }
      microtaskCallbacks.push(callback);
      return microtaskCurrHandle++;
    },
    /**
     * Cancels a previously enqueued `microTask` callback.
     *
     * @memberof microTask
     * @param {number} handle Handle returned from `run` of callback to cancel
     * @return {void}
     */
    cancel(handle) {
      const idx = handle - microtaskLastHandle;
      if (idx >= 0) {
        if (!microtaskCallbacks[idx]) {
          throw new Error("invalid async handle: " + handle);
        }
        microtaskCallbacks[idx] = null;
      }
    },
  };

  // node_modules/.pnpm/@polymer+polymer@3.5.1/node_modules/@polymer/polymer/lib/mixins/properties-changed.js
  var microtask = microTask;
  var PropertiesChanged = dedupingMixin(
    /**
     * @template T
     * @param {function(new:T)} superClass Class to apply mixin to.
     * @return {function(new:T)} superClass with mixin applied.
     */
    (superClass) => {
      class PropertiesChanged2 extends superClass {
        /**
         * Creates property accessors for the given property names.
         * @param {!Object} props Object whose keys are names of accessors.
         * @return {void}
         * @protected
         * @nocollapse
         */
        static createProperties(props) {
          const proto2 = this.prototype;
          for (let prop in props) {
            if (!(prop in proto2)) {
              proto2._createPropertyAccessor(prop);
            }
          }
        }
        /**
         * Returns an attribute name that corresponds to the given property.
         * The attribute name is the lowercased property name. Override to
         * customize this mapping.
         * @param {string} property Property to convert
         * @return {string} Attribute name corresponding to the given property.
         *
         * @protected
         * @nocollapse
         */
        static attributeNameForProperty(property) {
          return property.toLowerCase();
        }
        /**
         * Override point to provide a type to which to deserialize a value to
         * a given property.
         * @param {string} name Name of property
         *
         * @protected
         * @nocollapse
         */
        static typeForProperty(name) {}
        //eslint-disable-line no-unused-vars
        /**
         * Creates a setter/getter pair for the named property with its own
         * local storage.  The getter returns the value in the local storage,
         * and the setter calls `_setProperty`, which updates the local storage
         * for the property and enqueues a `_propertiesChanged` callback.
         *
         * This method may be called on a prototype or an instance.  Calling
         * this method may overwrite a property value that already exists on
         * the prototype/instance by creating the accessor.
         *
         * @param {string} property Name of the property
         * @param {boolean=} readOnly When true, no setter is created; the
         *   protected `_setProperty` function must be used to set the property
         * @return {void}
         * @protected
         * @override
         */
        _createPropertyAccessor(property, readOnly) {
          this._addPropertyToAttributeMap(property);
          if (
            !this.hasOwnProperty(
              JSCompiler_renameProperty("__dataHasAccessor", this)
            )
          ) {
            this.__dataHasAccessor = Object.assign({}, this.__dataHasAccessor);
          }
          if (!this.__dataHasAccessor[property]) {
            this.__dataHasAccessor[property] = true;
            this._definePropertyAccessor(property, readOnly);
          }
        }
        /**
         * Adds the given `property` to a map matching attribute names
         * to property names, using `attributeNameForProperty`. This map is
         * used when deserializing attribute values to properties.
         *
         * @param {string} property Name of the property
         * @override
         */
        _addPropertyToAttributeMap(property) {
          if (
            !this.hasOwnProperty(
              JSCompiler_renameProperty("__dataAttributes", this)
            )
          ) {
            this.__dataAttributes = Object.assign({}, this.__dataAttributes);
          }
          let attr2 = this.__dataAttributes[property];
          if (!attr2) {
            attr2 = this.constructor.attributeNameForProperty(property);
            this.__dataAttributes[attr2] = property;
          }
          return attr2;
        }
        /**
         * Defines a property accessor for the given property.
         * @param {string} property Name of the property
         * @param {boolean=} readOnly When true, no setter is created
         * @return {void}
         * @override
         */
        _definePropertyAccessor(property, readOnly) {
          Object.defineProperty(this, property, {
            /* eslint-disable valid-jsdoc */
            /** @this {PropertiesChanged} */
            get() {
              return this.__data[property];
            },
            /** @this {PropertiesChanged} */
            set: readOnly
              ? function () {}
              : function (value) {
                  if (this._setPendingProperty(property, value, true)) {
                    this._invalidateProperties();
                  }
                },
            /* eslint-enable */
          });
        }
        constructor() {
          super();
          this.__dataEnabled = false;
          this.__dataReady = false;
          this.__dataInvalid = false;
          this.__data = {};
          this.__dataPending = null;
          this.__dataOld = null;
          this.__dataInstanceProps = null;
          this.__dataCounter = 0;
          this.__serializing = false;
          this._initializeProperties();
        }
        /**
         * Lifecycle callback called when properties are enabled via
         * `_enableProperties`.
         *
         * Users may override this function to implement behavior that is
         * dependent on the element having its property data initialized, e.g.
         * from defaults (initialized from `constructor`, `_initializeProperties`),
         * `attributeChangedCallback`, or values propagated from host e.g. via
         * bindings.  `super.ready()` must be called to ensure the data system
         * becomes enabled.
         *
         * @return {void}
         * @public
         * @override
         */
        ready() {
          this.__dataReady = true;
          this._flushProperties();
        }
        /**
         * Initializes the local storage for property accessors.
         *
         * Provided as an override point for performing any setup work prior
         * to initializing the property accessor system.
         *
         * @return {void}
         * @protected
         * @override
         */
        _initializeProperties() {
          for (let p2 in this.__dataHasAccessor) {
            if (this.hasOwnProperty(p2)) {
              this.__dataInstanceProps = this.__dataInstanceProps || {};
              this.__dataInstanceProps[p2] = this[p2];
              delete this[p2];
            }
          }
        }
        /**
         * Called at ready time with bag of instance properties that overwrote
         * accessors when the element upgraded.
         *
         * The default implementation sets these properties back into the
         * setter at ready time.  This method is provided as an override
         * point for customizing or providing more efficient initialization.
         *
         * @param {Object} props Bag of property values that were overwritten
         *   when creating property accessors.
         * @return {void}
         * @protected
         * @override
         */
        _initializeInstanceProperties(props) {
          Object.assign(this, props);
        }
        /**
         * Updates the local storage for a property (via `_setPendingProperty`)
         * and enqueues a `_proeprtiesChanged` callback.
         *
         * @param {string} property Name of the property
         * @param {*} value Value to set
         * @return {void}
         * @protected
         * @override
         */
        _setProperty(property, value) {
          if (this._setPendingProperty(property, value)) {
            this._invalidateProperties();
          }
        }
        /**
         * Returns the value for the given property.
         * @param {string} property Name of property
         * @return {*} Value for the given property
         * @protected
         * @override
         */
        _getProperty(property) {
          return this.__data[property];
        }
        /* eslint-disable no-unused-vars */
        /**
         * Updates the local storage for a property, records the previous value,
         * and adds it to the set of "pending changes" that will be passed to the
         * `_propertiesChanged` callback.  This method does not enqueue the
         * `_propertiesChanged` callback.
         *
         * @param {string} property Name of the property
         * @param {*} value Value to set
         * @param {boolean=} ext Not used here; affordance for closure
         * @return {boolean} Returns true if the property changed
         * @protected
         * @override
         */
        _setPendingProperty(property, value, ext) {
          let old = this.__data[property];
          let changed = this._shouldPropertyChange(property, value, old);
          if (changed) {
            if (!this.__dataPending) {
              this.__dataPending = {};
              this.__dataOld = {};
            }
            if (this.__dataOld && !(property in this.__dataOld)) {
              this.__dataOld[property] = old;
            }
            this.__data[property] = value;
            this.__dataPending[property] = value;
          }
          return changed;
        }
        /* eslint-enable */
        /**
         * @param {string} property Name of the property
         * @return {boolean} Returns true if the property is pending.
         */
        _isPropertyPending(property) {
          return !!(
            this.__dataPending && this.__dataPending.hasOwnProperty(property)
          );
        }
        /**
         * Marks the properties as invalid, and enqueues an async
         * `_propertiesChanged` callback.
         *
         * @return {void}
         * @protected
         * @override
         */
        _invalidateProperties() {
          if (!this.__dataInvalid && this.__dataReady) {
            this.__dataInvalid = true;
            microtask.run(() => {
              if (this.__dataInvalid) {
                this.__dataInvalid = false;
                this._flushProperties();
              }
            });
          }
        }
        /**
         * Call to enable property accessor processing. Before this method is
         * called accessor values will be set but side effects are
         * queued. When called, any pending side effects occur immediately.
         * For elements, generally `connectedCallback` is a normal spot to do so.
         * It is safe to call this method multiple times as it only turns on
         * property accessors once.
         *
         * @return {void}
         * @protected
         * @override
         */
        _enableProperties() {
          if (!this.__dataEnabled) {
            this.__dataEnabled = true;
            if (this.__dataInstanceProps) {
              this._initializeInstanceProperties(this.__dataInstanceProps);
              this.__dataInstanceProps = null;
            }
            this.ready();
          }
        }
        /**
         * Calls the `_propertiesChanged` callback with the current set of
         * pending changes (and old values recorded when pending changes were
         * set), and resets the pending set of changes. Generally, this method
         * should not be called in user code.
         *
         * @return {void}
         * @protected
         * @override
         */
        _flushProperties() {
          this.__dataCounter++;
          const props = this.__data;
          const changedProps = this.__dataPending;
          const old = this.__dataOld;
          if (this._shouldPropertiesChange(props, changedProps, old)) {
            this.__dataPending = null;
            this.__dataOld = null;
            this._propertiesChanged(props, changedProps, old);
          }
          this.__dataCounter--;
        }
        /**
         * Called in `_flushProperties` to determine if `_propertiesChanged`
         * should be called. The default implementation returns true if
         * properties are pending. Override to customize when
         * `_propertiesChanged` is called.
         * @param {!Object} currentProps Bag of all current accessor values
         * @param {?Object} changedProps Bag of properties changed since the last
         *   call to `_propertiesChanged`
         * @param {?Object} oldProps Bag of previous values for each property
         *   in `changedProps`
         * @return {boolean} true if changedProps is truthy
         * @override
         */
        _shouldPropertiesChange(currentProps, changedProps, oldProps) {
          return Boolean(changedProps);
        }
        /**
         * Callback called when any properties with accessors created via
         * `_createPropertyAccessor` have been set.
         *
         * @param {!Object} currentProps Bag of all current accessor values
         * @param {?Object} changedProps Bag of properties changed since the last
         *   call to `_propertiesChanged`
         * @param {?Object} oldProps Bag of previous values for each property
         *   in `changedProps`
         * @return {void}
         * @protected
         * @override
         */
        _propertiesChanged(currentProps, changedProps, oldProps) {}
        /**
         * Method called to determine whether a property value should be
         * considered as a change and cause the `_propertiesChanged` callback
         * to be enqueued.
         *
         * The default implementation returns `true` if a strict equality
         * check fails. The method always returns false for `NaN`.
         *
         * Override this method to e.g. provide stricter checking for
         * Objects/Arrays when using immutable patterns.
         *
         * @param {string} property Property name
         * @param {*} value New property value
         * @param {*} old Previous property value
         * @return {boolean} Whether the property should be considered a change
         *   and enqueue a `_proeprtiesChanged` callback
         * @protected
         * @override
         */
        _shouldPropertyChange(property, value, old) {
          return (
            // Strict equality check
            old !== value && // This ensures (old==NaN, value==NaN) always returns false
            (old === old || value === value)
          );
        }
        /**
         * Implements native Custom Elements `attributeChangedCallback` to
         * set an attribute value to a property via `_attributeToProperty`.
         *
         * @param {string} name Name of attribute that changed
         * @param {?string} old Old attribute value
         * @param {?string} value New attribute value
         * @param {?string} namespace Attribute namespace.
         * @return {void}
         * @suppress {missingProperties} Super may or may not implement the callback
         * @override
         */
        attributeChangedCallback(name, old, value, namespace) {
          if (old !== value) {
            this._attributeToProperty(name, value);
          }
          if (super.attributeChangedCallback) {
            super.attributeChangedCallback(name, old, value, namespace);
          }
        }
        /**
         * Deserializes an attribute to its associated property.
         *
         * This method calls the `_deserializeValue` method to convert the string to
         * a typed value.
         *
         * @param {string} attribute Name of attribute to deserialize.
         * @param {?string} value of the attribute.
         * @param {*=} type type to deserialize to, defaults to the value
         * returned from `typeForProperty`
         * @return {void}
         * @override
         */
        _attributeToProperty(attribute, value, type) {
          if (!this.__serializing) {
            const map = this.__dataAttributes;
            const property = (map && map[attribute]) || attribute;
            this[property] = this._deserializeValue(
              value,
              type || this.constructor.typeForProperty(property)
            );
          }
        }
        /**
         * Serializes a property to its associated attribute.
         *
         * @suppress {invalidCasts} Closure can't figure out `this` is an element.
         *
         * @param {string} property Property name to reflect.
         * @param {string=} attribute Attribute name to reflect to.
         * @param {*=} value Property value to refect.
         * @return {void}
         * @override
         */
        _propertyToAttribute(property, attribute, value) {
          this.__serializing = true;
          value = arguments.length < 3 ? this[property] : value;
          this._valueToNodeAttribute(
            /** @type {!HTMLElement} */
            this,
            value,
            attribute || this.constructor.attributeNameForProperty(property)
          );
          this.__serializing = false;
        }
        /**
         * Sets a typed value to an HTML attribute on a node.
         *
         * This method calls the `_serializeValue` method to convert the typed
         * value to a string.  If the `_serializeValue` method returns `undefined`,
         * the attribute will be removed (this is the default for boolean
         * type `false`).
         *
         * @param {Element} node Element to set attribute to.
         * @param {*} value Value to serialize.
         * @param {string} attribute Attribute name to serialize to.
         * @return {void}
         * @override
         */
        _valueToNodeAttribute(node, value, attribute) {
          const str = this._serializeValue(value);
          if (
            attribute === "class" ||
            attribute === "name" ||
            attribute === "slot"
          ) {
            node = /** @type {?Element} */ wrap2(node);
          }
          if (str === void 0) {
            node.removeAttribute(attribute);
          } else {
            node.setAttribute(
              attribute,
              // Closure's type for `setAttribute`'s second parameter incorrectly
              // excludes `TrustedScript`.
              str === "" && window.trustedTypes
                ? /** @type {?} */
                  window.trustedTypes.emptyScript
                : str
            );
          }
        }
        /**
         * Converts a typed JavaScript value to a string.
         *
         * This method is called when setting JS property values to
         * HTML attributes.  Users may override this method to provide
         * serialization for custom types.
         *
         * @param {*} value Property value to serialize.
         * @return {string | undefined} String serialized from the provided
         * property  value.
         * @override
         */
        _serializeValue(value) {
          switch (typeof value) {
            case "boolean":
              return value ? "" : void 0;
            default:
              return value != null ? value.toString() : void 0;
          }
        }
        /**
         * Converts a string to a typed JavaScript value.
         *
         * This method is called when reading HTML attribute values to
         * JS properties.  Users may override this method to provide
         * deserialization for custom `type`s. Types for `Boolean`, `String`,
         * and `Number` convert attributes to the expected types.
         *
         * @param {?string} value Value to deserialize.
         * @param {*=} type Type to deserialize the string to.
         * @return {*} Typed value deserialized from the provided string.
         * @override
         */
        _deserializeValue(value, type) {
          switch (type) {
            case Boolean:
              return value !== null;
            case Number:
              return Number(value);
            default:
              return value;
          }
        }
      }
      return PropertiesChanged2;
    }
  );

  // node_modules/.pnpm/@polymer+polymer@3.5.1/node_modules/@polymer/polymer/lib/mixins/property-accessors.js
  var nativeProperties = {};
  var proto = HTMLElement.prototype;
  while (proto) {
    let props = Object.getOwnPropertyNames(proto);
    for (let i = 0; i < props.length; i++) {
      nativeProperties[props[i]] = true;
    }
    proto = Object.getPrototypeOf(proto);
  }
  var isTrustedType = (() => {
    if (!window.trustedTypes) {
      return () => false;
    }
    return (val) =>
      trustedTypes.isHTML(val) ||
      trustedTypes.isScript(val) ||
      trustedTypes.isScriptURL(val);
  })();
  function saveAccessorValue(model, property) {
    if (!nativeProperties[property]) {
      let value = model[property];
      if (value !== void 0) {
        if (model.__data) {
          model._setPendingProperty(property, value);
        } else {
          if (!model.__dataProto) {
            model.__dataProto = {};
          } else if (
            !model.hasOwnProperty(
              JSCompiler_renameProperty("__dataProto", model)
            )
          ) {
            model.__dataProto = Object.create(model.__dataProto);
          }
          model.__dataProto[property] = value;
        }
      }
    }
  }
  var PropertyAccessors = dedupingMixin((superClass) => {
    const base = PropertiesChanged(superClass);
    class PropertyAccessors2 extends base {
      /**
       * Generates property accessors for all attributes in the standard
       * static `observedAttributes` array.
       *
       * Attribute names are mapped to property names using the `dash-case` to
       * `camelCase` convention
       *
       * @return {void}
       * @nocollapse
       */
      static createPropertiesForAttributes() {
        let a$ =
          /** @type {?} */
          this.observedAttributes;
        for (let i = 0; i < a$.length; i++) {
          this.prototype._createPropertyAccessor(dashToCamelCase(a$[i]));
        }
      }
      /**
       * Returns an attribute name that corresponds to the given property.
       * By default, converts camel to dash case, e.g. `fooBar` to `foo-bar`.
       * @param {string} property Property to convert
       * @return {string} Attribute name corresponding to the given property.
       *
       * @protected
       * @nocollapse
       */
      static attributeNameForProperty(property) {
        return camelToDashCase(property);
      }
      /**
       * Overrides PropertiesChanged implementation to initialize values for
       * accessors created for values that already existed on the element
       * prototype.
       *
       * @return {void}
       * @protected
       * @override
       */
      _initializeProperties() {
        if (this.__dataProto) {
          this._initializeProtoProperties(this.__dataProto);
          this.__dataProto = null;
        }
        super._initializeProperties();
      }
      /**
       * Called at instance time with bag of properties that were overwritten
       * by accessors on the prototype when accessors were created.
       *
       * The default implementation sets these properties back into the
       * setter at instance time.  This method is provided as an override
       * point for customizing or providing more efficient initialization.
       *
       * @param {Object} props Bag of property values that were overwritten
       *   when creating property accessors.
       * @return {void}
       * @protected
       * @override
       */
      _initializeProtoProperties(props) {
        for (let p2 in props) {
          this._setProperty(p2, props[p2]);
        }
      }
      /**
       * Ensures the element has the given attribute. If it does not,
       * assigns the given value to the attribute.
       *
       * @suppress {invalidCasts} Closure can't figure out `this` is infact an
       *     element
       *
       * @param {string} attribute Name of attribute to ensure is set.
       * @param {string} value of the attribute.
       * @return {void}
       * @override
       */
      _ensureAttribute(attribute, value) {
        const el =
          /** @type {!HTMLElement} */
          this;
        if (!el.hasAttribute(attribute)) {
          this._valueToNodeAttribute(el, value, attribute);
        }
      }
      /**
       * Overrides PropertiesChanged implemention to serialize objects as JSON.
       *
       * @param {*} value Property value to serialize.
       * @return {string | undefined} String serialized from the provided property
       *     value.
       * @override
       */
      _serializeValue(value) {
        switch (typeof value) {
          case "object":
            if (value instanceof Date) {
              return value.toString();
            } else if (value) {
              if (isTrustedType(value)) {
                return (
                  /** @type {?} */
                  value
                );
              }
              try {
                return JSON.stringify(value);
              } catch (x) {
                return "";
              }
            }
          default:
            return super._serializeValue(value);
        }
      }
      /**
       * Converts a string to a typed JavaScript value.
       *
       * This method is called by Polymer when reading HTML attribute values to
       * JS properties.  Users may override this method on Polymer element
       * prototypes to provide deserialization for custom `type`s.  Note,
       * the `type` argument is the value of the `type` field provided in the
       * `properties` configuration object for a given property, and is
       * by convention the constructor for the type to deserialize.
       *
       *
       * @param {?string} value Attribute value to deserialize.
       * @param {*=} type Type to deserialize the string to.
       * @return {*} Typed value deserialized from the provided string.
       * @override
       */
      _deserializeValue(value, type) {
        let outValue;
        switch (type) {
          case Object:
            try {
              outValue = JSON.parse(
                /** @type {string} */
                value
              );
            } catch (x) {
              outValue = value;
            }
            break;
          case Array:
            try {
              outValue = JSON.parse(
                /** @type {string} */
                value
              );
            } catch (x) {
              outValue = null;
              console.warn(
                `Polymer::Attributes: couldn't decode Array as JSON: ${value}`
              );
            }
            break;
          case Date:
            outValue = isNaN(value) ? String(value) : Number(value);
            outValue = new Date(outValue);
            break;
          default:
            outValue = super._deserializeValue(value, type);
            break;
        }
        return outValue;
      }
      /* eslint-enable no-fallthrough */
      /**
       * Overrides PropertiesChanged implementation to save existing prototype
       * property value so that it can be reset.
       * @param {string} property Name of the property
       * @param {boolean=} readOnly When true, no setter is created
       *
       * When calling on a prototype, any overwritten values are saved in
       * `__dataProto`, and it is up to the subclasser to decide how/when
       * to set those properties back into the accessor.  When calling on an
       * instance, the overwritten value is set via `_setPendingProperty`,
       * and the user should call `_invalidateProperties` or `_flushProperties`
       * for the values to take effect.
       * @protected
       * @return {void}
       * @override
       */
      _definePropertyAccessor(property, readOnly) {
        saveAccessorValue(this, property);
        super._definePropertyAccessor(property, readOnly);
      }
      /**
       * Returns true if this library created an accessor for the given property.
       *
       * @param {string} property Property name
       * @return {boolean} True if an accessor was created
       * @override
       */
      _hasAccessor(property) {
        return this.__dataHasAccessor && this.__dataHasAccessor[property];
      }
      /**
       * Returns true if the specified property has a pending change.
       *
       * @param {string} prop Property name
       * @return {boolean} True if property has a pending change
       * @protected
       * @override
       */
      _isPropertyPending(prop) {
        return Boolean(this.__dataPending && prop in this.__dataPending);
      }
    }
    return PropertyAccessors2;
  });

  // node_modules/.pnpm/@polymer+polymer@3.5.1/node_modules/@polymer/polymer/lib/mixins/template-stamp.js
  var templateExtensions = {
    "dom-if": true,
    "dom-repeat": true,
  };
  var placeholderBugDetect = false;
  var placeholderBug = false;
  function hasPlaceholderBug() {
    if (!placeholderBugDetect) {
      placeholderBugDetect = true;
      const t = document.createElement("textarea");
      t.placeholder = "a";
      placeholderBug = t.placeholder === t.textContent;
    }
    return placeholderBug;
  }
  function fixPlaceholder(node) {
    if (
      hasPlaceholderBug() &&
      node.localName === "textarea" &&
      node.placeholder &&
      node.placeholder === node.textContent
    ) {
      node.textContent = null;
    }
  }
  var copyAttributeWithTemplateEventPolicy = (() => {
    const polymerTemplateEventAttributePolicy =
      window.trustedTypes &&
      window.trustedTypes.createPolicy(
        "polymer-template-event-attribute-policy",
        {
          createScript: (x) => x,
        }
      );
    return (dest, src, name) => {
      const value = src.getAttribute(name);
      if (polymerTemplateEventAttributePolicy && name.startsWith("on-")) {
        dest.setAttribute(
          name,
          polymerTemplateEventAttributePolicy.createScript(value, name)
        );
        return;
      }
      dest.setAttribute(name, value);
    };
  })();
  function wrapTemplateExtension(node) {
    let is = node.getAttribute("is");
    if (is && templateExtensions[is]) {
      let t = node;
      t.removeAttribute("is");
      node = t.ownerDocument.createElement(is);
      t.parentNode.replaceChild(node, t);
      node.appendChild(t);
      while (t.attributes.length) {
        const { name } = t.attributes[0];
        copyAttributeWithTemplateEventPolicy(node, t, name);
        t.removeAttribute(name);
      }
    }
    return node;
  }
  function findTemplateNode(root2, nodeInfo) {
    let parent =
      nodeInfo.parentInfo && findTemplateNode(root2, nodeInfo.parentInfo);
    if (parent) {
      for (let n = parent.firstChild, i = 0; n; n = n.nextSibling) {
        if (nodeInfo.parentIndex === i++) {
          return n;
        }
      }
    } else {
      return root2;
    }
  }
  function applyIdToMap(inst, map, node, nodeInfo) {
    if (nodeInfo.id) {
      map[nodeInfo.id] = node;
    }
  }
  function applyEventListener(inst, node, nodeInfo) {
    if (nodeInfo.events && nodeInfo.events.length) {
      for (
        let j = 0, e$ = nodeInfo.events, e;
        j < e$.length && (e = e$[j]);
        j++
      ) {
        inst._addMethodEventListenerToNode(node, e.name, e.value, inst);
      }
    }
  }
  function applyTemplateInfo(inst, node, nodeInfo, parentTemplateInfo) {
    if (nodeInfo.templateInfo) {
      node._templateInfo = nodeInfo.templateInfo;
      node._parentTemplateInfo = parentTemplateInfo;
    }
  }
  function createNodeEventHandler(context, eventName, methodName) {
    context = context._methodHost || context;
    let handler = function (e) {
      if (context[methodName]) {
        context[methodName](e, e.detail);
      } else {
        console.warn("listener method `" + methodName + "` not defined");
      }
    };
    return handler;
  }
  var TemplateStamp = dedupingMixin(
    /**
     * @template T
     * @param {function(new:T)} superClass Class to apply mixin to.
     * @return {function(new:T)} superClass with mixin applied.
     */
    (superClass) => {
      class TemplateStamp2 extends superClass {
        /**
         * Scans a template to produce template metadata.
         *
         * Template-specific metadata are stored in the object returned, and node-
         * specific metadata are stored in objects in its flattened `nodeInfoList`
         * array.  Only nodes in the template that were parsed as nodes of
         * interest contain an object in `nodeInfoList`.  Each `nodeInfo` object
         * contains an `index` (`childNodes` index in parent) and optionally
         * `parent`, which points to node info of its parent (including its index).
         *
         * The template metadata object returned from this method has the following
         * structure (many fields optional):
         *
         * ```js
         *   {
         *     // Flattened list of node metadata (for nodes that generated metadata)
         *     nodeInfoList: [
         *       {
         *         // `id` attribute for any nodes with id's for generating `$` map
         *         id: {string},
         *         // `on-event="handler"` metadata
         *         events: [
         *           {
         *             name: {string},   // event name
         *             value: {string},  // handler method name
         *           }, ...
         *         ],
         *         // Notes when the template contained a `<slot>` for shady DOM
         *         // optimization purposes
         *         hasInsertionPoint: {boolean},
         *         // For nested `<template>`` nodes, nested template metadata
         *         templateInfo: {object}, // nested template metadata
         *         // Metadata to allow efficient retrieval of instanced node
         *         // corresponding to this metadata
         *         parentInfo: {number},   // reference to parent nodeInfo>
         *         parentIndex: {number},  // index in parent's `childNodes` collection
         *         infoIndex: {number},    // index of this `nodeInfo` in `templateInfo.nodeInfoList`
         *       },
         *       ...
         *     ],
         *     // When true, the template had the `strip-whitespace` attribute
         *     // or was nested in a template with that setting
         *     stripWhitespace: {boolean},
         *     // For nested templates, nested template content is moved into
         *     // a document fragment stored here; this is an optimization to
         *     // avoid the cost of nested template cloning
         *     content: {DocumentFragment}
         *   }
         * ```
         *
         * This method kicks off a recursive treewalk as follows:
         *
         * ```
         *    _parseTemplate <---------------------+
         *      _parseTemplateContent              |
         *        _parseTemplateNode  <------------|--+
         *          _parseTemplateNestedTemplate --+  |
         *          _parseTemplateChildNodes ---------+
         *          _parseTemplateNodeAttributes
         *            _parseTemplateNodeAttribute
         *
         * ```
         *
         * These methods may be overridden to add custom metadata about templates
         * to either `templateInfo` or `nodeInfo`.
         *
         * Note that this method may be destructive to the template, in that
         * e.g. event annotations may be removed after being noted in the
         * template metadata.
         *
         * @param {!HTMLTemplateElement} template Template to parse
         * @param {TemplateInfo=} outerTemplateInfo Template metadata from the outer
         *   template, for parsing nested templates
         * @return {!TemplateInfo} Parsed template metadata
         * @nocollapse
         */
        static _parseTemplate(template4, outerTemplateInfo) {
          if (!template4._templateInfo) {
            let templateInfo = (template4._templateInfo = {});
            templateInfo.nodeInfoList = [];
            templateInfo.nestedTemplate = Boolean(outerTemplateInfo);
            templateInfo.stripWhiteSpace =
              (outerTemplateInfo && outerTemplateInfo.stripWhiteSpace) ||
              (template4.hasAttribute &&
                template4.hasAttribute("strip-whitespace"));
            this._parseTemplateContent(
              template4,
              templateInfo,
              /** @type {?} */
              { parent: null }
            );
          }
          return template4._templateInfo;
        }
        /**
         * See docs for _parseTemplateNode.
         *
         * @param {!HTMLTemplateElement} template .
         * @param {!TemplateInfo} templateInfo .
         * @param {!NodeInfo} nodeInfo .
         * @return {boolean} .
         * @nocollapse
         */
        static _parseTemplateContent(template4, templateInfo, nodeInfo) {
          return this._parseTemplateNode(
            template4.content,
            templateInfo,
            nodeInfo
          );
        }
        /**
         * Parses template node and adds template and node metadata based on
         * the current node, and its `childNodes` and `attributes`.
         *
         * This method may be overridden to add custom node or template specific
         * metadata based on this node.
         *
         * @param {Node} node Node to parse
         * @param {!TemplateInfo} templateInfo Template metadata for current template
         * @param {!NodeInfo} nodeInfo Node metadata for current template.
         * @return {boolean} `true` if the visited node added node-specific
         *   metadata to `nodeInfo`
         * @nocollapse
         */
        static _parseTemplateNode(node, templateInfo, nodeInfo) {
          let noted = false;
          let element =
            /** @type {!HTMLTemplateElement} */
            node;
          if (
            element.localName == "template" &&
            !element.hasAttribute("preserve-content")
          ) {
            noted =
              this._parseTemplateNestedTemplate(
                element,
                templateInfo,
                nodeInfo
              ) || noted;
          } else if (element.localName === "slot") {
            templateInfo.hasInsertionPoint = true;
          }
          fixPlaceholder(element);
          if (element.firstChild) {
            this._parseTemplateChildNodes(element, templateInfo, nodeInfo);
          }
          if (element.hasAttributes && element.hasAttributes()) {
            noted =
              this._parseTemplateNodeAttributes(
                element,
                templateInfo,
                nodeInfo
              ) || noted;
          }
          return noted || nodeInfo.noted;
        }
        /**
         * Parses template child nodes for the given root node.
         *
         * This method also wraps whitelisted legacy template extensions
         * (`is="dom-if"` and `is="dom-repeat"`) with their equivalent element
         * wrappers, collapses text nodes, and strips whitespace from the template
         * if the `templateInfo.stripWhitespace` setting was provided.
         *
         * @param {Node} root Root node whose `childNodes` will be parsed
         * @param {!TemplateInfo} templateInfo Template metadata for current template
         * @param {!NodeInfo} nodeInfo Node metadata for current template.
         * @return {void}
         */
        static _parseTemplateChildNodes(root2, templateInfo, nodeInfo) {
          if (root2.localName === "script" || root2.localName === "style") {
            return;
          }
          for (
            let node = root2.firstChild, parentIndex = 0, next;
            node;
            node = next
          ) {
            if (node.localName == "template") {
              node = wrapTemplateExtension(node);
            }
            next = node.nextSibling;
            if (node.nodeType === Node.TEXT_NODE) {
              let n = next;
              while (n && n.nodeType === Node.TEXT_NODE) {
                node.textContent += n.textContent;
                next = n.nextSibling;
                root2.removeChild(n);
                n = next;
              }
              if (templateInfo.stripWhiteSpace && !node.textContent.trim()) {
                root2.removeChild(node);
                continue;
              }
            }
            let childInfo =
              /** @type {!NodeInfo} */
              { parentIndex, parentInfo: nodeInfo };
            if (this._parseTemplateNode(node, templateInfo, childInfo)) {
              childInfo.infoIndex =
                templateInfo.nodeInfoList.push(childInfo) - 1;
            }
            if (node.parentNode) {
              parentIndex++;
            }
          }
        }
        /**
         * Parses template content for the given nested `<template>`.
         *
         * Nested template info is stored as `templateInfo` in the current node's
         * `nodeInfo`. `template.content` is removed and stored in `templateInfo`.
         * It will then be the responsibility of the host to set it back to the
         * template and for users stamping nested templates to use the
         * `_contentForTemplate` method to retrieve the content for this template
         * (an optimization to avoid the cost of cloning nested template content).
         *
         * @param {HTMLTemplateElement} node Node to parse (a <template>)
         * @param {TemplateInfo} outerTemplateInfo Template metadata for current template
         *   that includes the template `node`
         * @param {!NodeInfo} nodeInfo Node metadata for current template.
         * @return {boolean} `true` if the visited node added node-specific
         *   metadata to `nodeInfo`
         * @nocollapse
         */
        static _parseTemplateNestedTemplate(node, outerTemplateInfo, nodeInfo) {
          let element =
            /** @type {!HTMLTemplateElement} */
            node;
          let templateInfo = this._parseTemplate(element, outerTemplateInfo);
          let content = (templateInfo.content =
            element.content.ownerDocument.createDocumentFragment());
          content.appendChild(element.content);
          nodeInfo.templateInfo = templateInfo;
          return true;
        }
        /**
         * Parses template node attributes and adds node metadata to `nodeInfo`
         * for nodes of interest.
         *
         * @param {Element} node Node to parse
         * @param {!TemplateInfo} templateInfo Template metadata for current
         *     template
         * @param {!NodeInfo} nodeInfo Node metadata for current template.
         * @return {boolean} `true` if the visited node added node-specific
         *   metadata to `nodeInfo`
         * @nocollapse
         */
        static _parseTemplateNodeAttributes(node, templateInfo, nodeInfo) {
          let noted = false;
          let attrs = Array.from(node.attributes);
          for (let i = attrs.length - 1, a; (a = attrs[i]); i--) {
            noted =
              this._parseTemplateNodeAttribute(
                node,
                templateInfo,
                nodeInfo,
                a.name,
                a.value
              ) || noted;
          }
          return noted;
        }
        /**
         * Parses a single template node attribute and adds node metadata to
         * `nodeInfo` for attributes of interest.
         *
         * This implementation adds metadata for `on-event="handler"` attributes
         * and `id` attributes.
         *
         * @param {Element} node Node to parse
         * @param {!TemplateInfo} templateInfo Template metadata for current template
         * @param {!NodeInfo} nodeInfo Node metadata for current template.
         * @param {string} name Attribute name
         * @param {string} value Attribute value
         * @return {boolean} `true` if the visited node added node-specific
         *   metadata to `nodeInfo`
         * @nocollapse
         */
        static _parseTemplateNodeAttribute(
          node,
          templateInfo,
          nodeInfo,
          name,
          value
        ) {
          if (name.slice(0, 3) === "on-") {
            node.removeAttribute(name);
            nodeInfo.events = nodeInfo.events || [];
            nodeInfo.events.push({
              name: name.slice(3),
              value,
            });
            return true;
          } else if (name === "id") {
            nodeInfo.id = value;
            return true;
          }
          return false;
        }
        /**
         * Returns the `content` document fragment for a given template.
         *
         * For nested templates, Polymer performs an optimization to cache nested
         * template content to avoid the cost of cloning deeply nested templates.
         * This method retrieves the cached content for a given template.
         *
         * @param {HTMLTemplateElement} template Template to retrieve `content` for
         * @return {DocumentFragment} Content fragment
         * @nocollapse
         */
        static _contentForTemplate(template4) {
          let templateInfo =
            /** @type {HTMLTemplateElementWithInfo} */
            template4._templateInfo;
          return (templateInfo && templateInfo.content) || template4.content;
        }
        /**
         * Clones the provided template content and returns a document fragment
         * containing the cloned dom.
         *
         * The template is parsed (once and memoized) using this library's
         * template parsing features, and provides the following value-added
         * features:
         * * Adds declarative event listeners for `on-event="handler"` attributes
         * * Generates an "id map" for all nodes with id's under `$` on returned
         *   document fragment
         * * Passes template info including `content` back to templates as
         *   `_templateInfo` (a performance optimization to avoid deep template
         *   cloning)
         *
         * Note that the memoized template parsing process is destructive to the
         * template: attributes for bindings and declarative event listeners are
         * removed after being noted in notes, and any nested `<template>.content`
         * is removed and stored in notes as well.
         *
         * @param {!HTMLTemplateElement} template Template to stamp
         * @param {TemplateInfo=} templateInfo Optional template info associated
         *   with the template to be stamped; if omitted the template will be
         *   automatically parsed.
         * @return {!StampedTemplate} Cloned template content
         * @override
         */
        _stampTemplate(template4, templateInfo) {
          if (
            template4 &&
            !template4.content &&
            window.HTMLTemplateElement &&
            HTMLTemplateElement.decorate
          ) {
            HTMLTemplateElement.decorate(template4);
          }
          templateInfo =
            templateInfo || this.constructor._parseTemplate(template4);
          let nodeInfo = templateInfo.nodeInfoList;
          let content = templateInfo.content || template4.content;
          let dom2 =
            /** @type {DocumentFragment} */
            document.importNode(content, true);
          dom2.__noInsertionPoint = !templateInfo.hasInsertionPoint;
          let nodes = (dom2.nodeList = new Array(nodeInfo.length));
          dom2.$ = {};
          for (
            let i = 0, l = nodeInfo.length, info;
            i < l && (info = nodeInfo[i]);
            i++
          ) {
            let node = (nodes[i] = findTemplateNode(dom2, info));
            applyIdToMap(this, dom2.$, node, info);
            applyTemplateInfo(this, node, info, templateInfo);
            applyEventListener(this, node, info);
          }
          dom2 = /** @type {!StampedTemplate} */ dom2;
          return dom2;
        }
        /**
         * Adds an event listener by method name for the event provided.
         *
         * This method generates a handler function that looks up the method
         * name at handling time.
         *
         * @param {!EventTarget} node Node to add listener on
         * @param {string} eventName Name of event
         * @param {string} methodName Name of method
         * @param {*=} context Context the method will be called on (defaults
         *   to `node`)
         * @return {Function} Generated handler function
         * @override
         */
        _addMethodEventListenerToNode(node, eventName, methodName, context) {
          context = context || node;
          let handler = createNodeEventHandler(context, eventName, methodName);
          this._addEventListenerToNode(node, eventName, handler);
          return handler;
        }
        /**
         * Override point for adding custom or simulated event handling.
         *
         * @param {!EventTarget} node Node to add event listener to
         * @param {string} eventName Name of event
         * @param {function(!Event):void} handler Listener function to add
         * @return {void}
         * @override
         */
        _addEventListenerToNode(node, eventName, handler) {
          node.addEventListener(eventName, handler);
        }
        /**
         * Override point for adding custom or simulated event handling.
         *
         * @param {!EventTarget} node Node to remove event listener from
         * @param {string} eventName Name of event
         * @param {function(!Event):void} handler Listener function to remove
         * @return {void}
         * @override
         */
        _removeEventListenerFromNode(node, eventName, handler) {
          node.removeEventListener(eventName, handler);
        }
      }
      return TemplateStamp2;
    }
  );

  // node_modules/.pnpm/@polymer+polymer@3.5.1/node_modules/@polymer/polymer/lib/mixins/property-effects.js
  var dedupeId2 = 0;
  var NOOP = [];
  var TYPES = {
    COMPUTE: "__computeEffects",
    REFLECT: "__reflectEffects",
    NOTIFY: "__notifyEffects",
    PROPAGATE: "__propagateEffects",
    OBSERVE: "__observeEffects",
    READ_ONLY: "__readOnly",
  };
  var COMPUTE_INFO = "__computeInfo";
  var capitalAttributeRegex = /[A-Z]/;
  function ensureOwnEffectMap(model, type, cloneArrays) {
    let effects = model[type];
    if (!effects) {
      effects = model[type] = {};
    } else if (!model.hasOwnProperty(type)) {
      effects = model[type] = Object.create(model[type]);
      if (cloneArrays) {
        for (let p2 in effects) {
          let protoFx = effects[p2];
          let instFx = (effects[p2] = Array(protoFx.length));
          for (let i = 0; i < protoFx.length; i++) {
            instFx[i] = protoFx[i];
          }
        }
      }
    }
    return effects;
  }
  function runEffects(inst, effects, props, oldProps, hasPaths, extraArgs) {
    if (effects) {
      let ran = false;
      const id = dedupeId2++;
      for (let prop in props) {
        let rootProperty = hasPaths ? root(prop) : prop;
        let fxs = effects[rootProperty];
        if (fxs) {
          for (let i = 0, l = fxs.length, fx; i < l && (fx = fxs[i]); i++) {
            if (
              (!fx.info || fx.info.lastRun !== id) &&
              (!hasPaths || pathMatchesTrigger(prop, fx.trigger))
            ) {
              if (fx.info) {
                fx.info.lastRun = id;
              }
              fx.fn(inst, prop, props, oldProps, fx.info, hasPaths, extraArgs);
              ran = true;
            }
          }
        }
      }
      return ran;
    }
    return false;
  }
  function runEffectsForProperty(
    inst,
    effects,
    dedupeId3,
    prop,
    props,
    oldProps,
    hasPaths,
    extraArgs
  ) {
    let ran = false;
    let rootProperty = hasPaths ? root(prop) : prop;
    let fxs = effects[rootProperty];
    if (fxs) {
      for (let i = 0, l = fxs.length, fx; i < l && (fx = fxs[i]); i++) {
        if (
          (!fx.info || fx.info.lastRun !== dedupeId3) &&
          (!hasPaths || pathMatchesTrigger(prop, fx.trigger))
        ) {
          if (fx.info) {
            fx.info.lastRun = dedupeId3;
          }
          fx.fn(inst, prop, props, oldProps, fx.info, hasPaths, extraArgs);
          ran = true;
        }
      }
    }
    return ran;
  }
  function pathMatchesTrigger(path, trigger) {
    if (trigger) {
      let triggerPath =
        /** @type {string} */
        trigger.name;
      return (
        triggerPath == path ||
        !!(trigger.structured && isAncestor(triggerPath, path)) ||
        !!(trigger.wildcard && isDescendant(triggerPath, path))
      );
    } else {
      return true;
    }
  }
  function runObserverEffect(inst, property, props, oldProps, info) {
    let fn = typeof info.method === "string" ? inst[info.method] : info.method;
    let changedProp = info.property;
    if (fn) {
      fn.call(inst, inst.__data[changedProp], oldProps[changedProp]);
    } else if (!info.dynamicFn) {
      console.warn("observer method `" + info.method + "` not defined");
    }
  }
  function runNotifyEffects(inst, notifyProps, props, oldProps, hasPaths) {
    let fxs = inst[TYPES.NOTIFY];
    let notified;
    let id = dedupeId2++;
    for (let prop in notifyProps) {
      if (notifyProps[prop]) {
        if (
          fxs &&
          runEffectsForProperty(inst, fxs, id, prop, props, oldProps, hasPaths)
        ) {
          notified = true;
        } else if (hasPaths && notifyPath(inst, prop, props)) {
          notified = true;
        }
      }
    }
    let host;
    if (notified && (host = inst.__dataHost) && host._invalidateProperties) {
      host._invalidateProperties();
    }
  }
  function notifyPath(inst, path, props) {
    let rootProperty = root(path);
    if (rootProperty !== path) {
      let eventName = camelToDashCase(rootProperty) + "-changed";
      dispatchNotifyEvent(inst, eventName, props[path], path);
      return true;
    }
    return false;
  }
  function dispatchNotifyEvent(inst, eventName, value, path) {
    let detail = {
      value,
      queueProperty: true,
    };
    if (path) {
      detail.path = path;
    }
    wrap2(
      /** @type {!HTMLElement} */
      inst
    ).dispatchEvent(new CustomEvent(eventName, { detail }));
  }
  function runNotifyEffect(inst, property, props, oldProps, info, hasPaths) {
    let rootProperty = hasPaths ? root(property) : property;
    let path = rootProperty != property ? property : null;
    let value = path ? get(inst, path) : inst.__data[property];
    if (path && value === void 0) {
      value = props[property];
    }
    dispatchNotifyEvent(inst, info.eventName, value, path);
  }
  function handleNotification(event, inst, fromProp, toPath, negate) {
    let value;
    let detail =
      /** @type {Object} */
      event.detail;
    let fromPath = detail && detail.path;
    if (fromPath) {
      toPath = translate(fromProp, toPath, fromPath);
      value = detail && detail.value;
    } else {
      value = event.currentTarget[fromProp];
    }
    value = negate ? !value : value;
    if (!inst[TYPES.READ_ONLY] || !inst[TYPES.READ_ONLY][toPath]) {
      if (
        inst._setPendingPropertyOrPath(
          toPath,
          value,
          true,
          Boolean(fromPath)
        ) &&
        (!detail || !detail.queueProperty)
      ) {
        inst._invalidateProperties();
      }
    }
  }
  function runReflectEffect(inst, property, props, oldProps, info) {
    let value = inst.__data[property];
    if (sanitizeDOMValue) {
      value = sanitizeDOMValue(
        value,
        info.attrName,
        "attribute",
        /** @type {Node} */
        inst
      );
    }
    inst._propertyToAttribute(property, info.attrName, value);
  }
  function runComputedEffects(inst, changedProps, oldProps, hasPaths) {
    let computeEffects = inst[TYPES.COMPUTE];
    if (computeEffects) {
      if (orderedComputed) {
        dedupeId2++;
        const order = getComputedOrder(inst);
        const queue = [];
        for (let p2 in changedProps) {
          enqueueEffectsFor(p2, computeEffects, queue, order, hasPaths);
        }
        let info;
        while ((info = queue.shift())) {
          if (runComputedEffect(inst, "", changedProps, oldProps, info)) {
            enqueueEffectsFor(
              info.methodInfo,
              computeEffects,
              queue,
              order,
              hasPaths
            );
          }
        }
        Object.assign(
          /** @type {!Object} */
          oldProps,
          inst.__dataOld
        );
        Object.assign(
          /** @type {!Object} */
          changedProps,
          inst.__dataPending
        );
        inst.__dataPending = null;
      } else {
        let inputProps = changedProps;
        while (
          runEffects(inst, computeEffects, inputProps, oldProps, hasPaths)
        ) {
          Object.assign(
            /** @type {!Object} */
            oldProps,
            inst.__dataOld
          );
          Object.assign(
            /** @type {!Object} */
            changedProps,
            inst.__dataPending
          );
          inputProps = inst.__dataPending;
          inst.__dataPending = null;
        }
      }
    }
  }
  var insertEffect = (info, queue, order) => {
    let start = 0;
    let end = queue.length - 1;
    let idx = -1;
    while (start <= end) {
      const mid = (start + end) >> 1;
      const cmp = order.get(queue[mid].methodInfo) - order.get(info.methodInfo);
      if (cmp < 0) {
        start = mid + 1;
      } else if (cmp > 0) {
        end = mid - 1;
      } else {
        idx = mid;
        break;
      }
    }
    if (idx < 0) {
      idx = end + 1;
    }
    queue.splice(idx, 0, info);
  };
  var enqueueEffectsFor = (prop, computeEffects, queue, order, hasPaths) => {
    const rootProperty = hasPaths ? root(prop) : prop;
    const fxs = computeEffects[rootProperty];
    if (fxs) {
      for (let i = 0; i < fxs.length; i++) {
        const fx = fxs[i];
        if (
          fx.info.lastRun !== dedupeId2 &&
          (!hasPaths || pathMatchesTrigger(prop, fx.trigger))
        ) {
          fx.info.lastRun = dedupeId2;
          insertEffect(fx.info, queue, order);
        }
      }
    }
  };
  function getComputedOrder(inst) {
    let ordered = inst.constructor.__orderedComputedDeps;
    if (!ordered) {
      ordered = /* @__PURE__ */ new Map();
      const effects = inst[TYPES.COMPUTE];
      let { counts, ready, total } = dependencyCounts(inst);
      let curr;
      while ((curr = ready.shift())) {
        ordered.set(curr, ordered.size);
        const computedByCurr = effects[curr];
        if (computedByCurr) {
          computedByCurr.forEach((fx) => {
            const computedProp = fx.info.methodInfo;
            --total;
            if (--counts[computedProp] === 0) {
              ready.push(computedProp);
            }
          });
        }
      }
      if (total !== 0) {
        const el =
          /** @type {HTMLElement} */
          inst;
        console.warn(
          `Computed graph for ${el.localName} incomplete; circular?`
        );
      }
      inst.constructor.__orderedComputedDeps = ordered;
    }
    return ordered;
  }
  function dependencyCounts(inst) {
    const infoForComputed = inst[COMPUTE_INFO];
    const counts = {};
    const computedDeps = inst[TYPES.COMPUTE];
    const ready = [];
    let total = 0;
    for (let p2 in infoForComputed) {
      const info = infoForComputed[p2];
      total += counts[p2] =
        info.args.filter((a) => !a.literal).length + (info.dynamicFn ? 1 : 0);
    }
    for (let p2 in computedDeps) {
      if (!infoForComputed[p2]) {
        ready.push(p2);
      }
    }
    return { counts, ready, total };
  }
  function runComputedEffect(inst, property, changedProps, oldProps, info) {
    let result = runMethodEffect(inst, property, changedProps, oldProps, info);
    if (result === NOOP) {
      return false;
    }
    let computedProp = info.methodInfo;
    if (inst.__dataHasAccessor && inst.__dataHasAccessor[computedProp]) {
      return inst._setPendingProperty(computedProp, result, true);
    } else {
      inst[computedProp] = result;
      return false;
    }
  }
  function computeLinkedPaths(inst, path, value) {
    let links = inst.__dataLinkedPaths;
    if (links) {
      let link;
      for (let a in links) {
        let b = links[a];
        if (isDescendant(a, path)) {
          link = translate(a, b, path);
          inst._setPendingPropertyOrPath(link, value, true, true);
        } else if (isDescendant(b, path)) {
          link = translate(b, a, path);
          inst._setPendingPropertyOrPath(link, value, true, true);
        }
      }
    }
  }
  function addBinding(
    constructor,
    templateInfo,
    nodeInfo,
    kind,
    target,
    parts,
    literal
  ) {
    nodeInfo.bindings = nodeInfo.bindings || [];
    let binding = {
      kind,
      target,
      parts,
      literal,
      isCompound: parts.length !== 1,
    };
    nodeInfo.bindings.push(binding);
    if (shouldAddListener(binding)) {
      let { event, negate } = binding.parts[0];
      binding.listenerEvent = event || camelToDashCase(target) + "-changed";
      binding.listenerNegate = negate;
    }
    let index = templateInfo.nodeInfoList.length;
    for (let i = 0; i < binding.parts.length; i++) {
      let part = binding.parts[i];
      part.compoundIndex = i;
      addEffectForBindingPart(constructor, templateInfo, binding, part, index);
    }
  }
  function addEffectForBindingPart(
    constructor,
    templateInfo,
    binding,
    part,
    index
  ) {
    if (!part.literal) {
      if (binding.kind === "attribute" && binding.target[0] === "-") {
        console.warn(
          "Cannot set attribute " +
            binding.target +
            ' because "-" is not a valid attribute starting character'
        );
      } else {
        let dependencies = part.dependencies;
        let info = { index, binding, part, evaluator: constructor };
        for (let j = 0; j < dependencies.length; j++) {
          let trigger = dependencies[j];
          if (typeof trigger == "string") {
            trigger = parseArg(trigger);
            trigger.wildcard = true;
          }
          constructor._addTemplatePropertyEffect(
            templateInfo,
            trigger.rootProperty,
            {
              fn: runBindingEffect,
              info,
              trigger,
            }
          );
        }
      }
    }
  }
  function runBindingEffect(
    inst,
    path,
    props,
    oldProps,
    info,
    hasPaths,
    nodeList
  ) {
    let node = nodeList[info.index];
    let binding = info.binding;
    let part = info.part;
    if (
      hasPaths &&
      part.source &&
      path.length > part.source.length &&
      binding.kind == "property" &&
      !binding.isCompound &&
      node.__isPropertyEffectsClient &&
      node.__dataHasAccessor &&
      node.__dataHasAccessor[binding.target]
    ) {
      let value = props[path];
      path = translate(part.source, binding.target, path);
      if (node._setPendingPropertyOrPath(path, value, false, true)) {
        inst._enqueueClient(node);
      }
    } else {
      let value = info.evaluator._evaluateBinding(
        inst,
        part,
        path,
        props,
        oldProps,
        hasPaths
      );
      if (value !== NOOP) {
        applyBindingValue(inst, node, binding, part, value);
      }
    }
  }
  function applyBindingValue(inst, node, binding, part, value) {
    value = computeBindingValue(node, value, binding, part);
    if (sanitizeDOMValue) {
      value = sanitizeDOMValue(value, binding.target, binding.kind, node);
    }
    if (binding.kind == "attribute") {
      inst._valueToNodeAttribute(
        /** @type {Element} */
        node,
        value,
        binding.target
      );
    } else {
      let prop = binding.target;
      if (
        node.__isPropertyEffectsClient &&
        node.__dataHasAccessor &&
        node.__dataHasAccessor[prop]
      ) {
        if (!node[TYPES.READ_ONLY] || !node[TYPES.READ_ONLY][prop]) {
          if (node._setPendingProperty(prop, value)) {
            inst._enqueueClient(node);
          }
        }
      } else {
        inst._setUnmanagedPropertyToNode(node, prop, value);
      }
    }
  }
  function computeBindingValue(node, value, binding, part) {
    if (binding.isCompound) {
      let storage = node.__dataCompoundStorage[binding.target];
      storage[part.compoundIndex] = value;
      value = storage.join("");
    }
    if (binding.kind !== "attribute") {
      if (
        binding.target === "textContent" ||
        (binding.target === "value" &&
          (node.localName === "input" || node.localName === "textarea"))
      ) {
        value = value == void 0 ? "" : value;
      }
    }
    return value;
  }
  function shouldAddListener(binding) {
    return (
      Boolean(binding.target) &&
      binding.kind != "attribute" &&
      binding.kind != "text" &&
      !binding.isCompound &&
      binding.parts[0].mode === "{"
    );
  }
  function setupBindings(inst, templateInfo) {
    let { nodeList, nodeInfoList } = templateInfo;
    if (nodeInfoList.length) {
      for (let i = 0; i < nodeInfoList.length; i++) {
        let info = nodeInfoList[i];
        let node = nodeList[i];
        let bindings = info.bindings;
        if (bindings) {
          for (let i2 = 0; i2 < bindings.length; i2++) {
            let binding = bindings[i2];
            setupCompoundStorage(node, binding);
            addNotifyListener(node, inst, binding);
          }
        }
        node.__dataHost = inst;
      }
    }
  }
  function setupCompoundStorage(node, binding) {
    if (binding.isCompound) {
      let storage =
        node.__dataCompoundStorage || (node.__dataCompoundStorage = {});
      let parts = binding.parts;
      let literals = new Array(parts.length);
      for (let j = 0; j < parts.length; j++) {
        literals[j] = parts[j].literal;
      }
      let target = binding.target;
      storage[target] = literals;
      if (binding.literal && binding.kind == "property") {
        if (target === "className") {
          node = wrap2(node);
        }
        node[target] = binding.literal;
      }
    }
  }
  function addNotifyListener(node, inst, binding) {
    if (binding.listenerEvent) {
      let part = binding.parts[0];
      node.addEventListener(binding.listenerEvent, function (e) {
        handleNotification(e, inst, binding.target, part.source, part.negate);
      });
    }
  }
  function createMethodEffect(
    model,
    sig,
    type,
    effectFn,
    methodInfo,
    dynamicFn
  ) {
    dynamicFn =
      sig.static ||
      (dynamicFn &&
        (typeof dynamicFn !== "object" || dynamicFn[sig.methodName]));
    let info = {
      methodName: sig.methodName,
      args: sig.args,
      methodInfo,
      dynamicFn,
    };
    for (let i = 0, arg; i < sig.args.length && (arg = sig.args[i]); i++) {
      if (!arg.literal) {
        model._addPropertyEffect(arg.rootProperty, type, {
          fn: effectFn,
          info,
          trigger: arg,
        });
      }
    }
    if (dynamicFn) {
      model._addPropertyEffect(sig.methodName, type, {
        fn: effectFn,
        info,
      });
    }
    return info;
  }
  function runMethodEffect(inst, property, props, oldProps, info) {
    let context = inst._methodHost || inst;
    let fn = context[info.methodName];
    if (fn) {
      let args = inst._marshalArgs(info.args, property, props);
      return args === NOOP ? NOOP : fn.apply(context, args);
    } else if (!info.dynamicFn) {
      console.warn("method `" + info.methodName + "` not defined");
    }
  }
  var emptyArray = [];
  var IDENT = "(?:[a-zA-Z_$][\\w.:$\\-*]*)";
  var NUMBER = "(?:[-+]?[0-9]*\\.?[0-9]+(?:[eE][-+]?[0-9]+)?)";
  var SQUOTE_STRING = "(?:'(?:[^'\\\\]|\\\\.)*')";
  var DQUOTE_STRING = '(?:"(?:[^"\\\\]|\\\\.)*")';
  var STRING = "(?:" + SQUOTE_STRING + "|" + DQUOTE_STRING + ")";
  var ARGUMENT = "(?:(" + IDENT + "|" + NUMBER + "|" + STRING + ")\\s*)";
  var ARGUMENTS = "(?:" + ARGUMENT + "(?:,\\s*" + ARGUMENT + ")*)";
  var ARGUMENT_LIST = "(?:\\(\\s*(?:" + ARGUMENTS + "?)\\)\\s*)";
  var BINDING = "(" + IDENT + "\\s*" + ARGUMENT_LIST + "?)";
  var OPEN_BRACKET = "(\\[\\[|{{)\\s*";
  var CLOSE_BRACKET = "(?:]]|}})";
  var NEGATE = "(?:(!)\\s*)?";
  var EXPRESSION = OPEN_BRACKET + NEGATE + BINDING + CLOSE_BRACKET;
  var bindingRegex = new RegExp(EXPRESSION, "g");
  function literalFromParts(parts) {
    let s = "";
    for (let i = 0; i < parts.length; i++) {
      let literal = parts[i].literal;
      s += literal || "";
    }
    return s;
  }
  function parseMethod(expression) {
    let m = expression.match(/([^\s]+?)\(([\s\S]*)\)/);
    if (m) {
      let methodName = m[1];
      let sig = { methodName, static: true, args: emptyArray };
      if (m[2].trim()) {
        let args = m[2].replace(/\\,/g, "&comma;").split(",");
        return parseArgs(args, sig);
      } else {
        return sig;
      }
    }
    return null;
  }
  function parseArgs(argList, sig) {
    sig.args = argList.map(function (rawArg) {
      let arg = parseArg(rawArg);
      if (!arg.literal) {
        sig.static = false;
      }
      return arg;
    }, this);
    return sig;
  }
  function parseArg(rawArg) {
    let arg = rawArg
      .trim()
      .replace(/&comma;/g, ",")
      .replace(/\\(.)/g, "$1");
    let a = {
      name: arg,
      value: "",
      literal: false,
    };
    let fc = arg[0];
    if (fc === "-") {
      fc = arg[1];
    }
    if (fc >= "0" && fc <= "9") {
      fc = "#";
    }
    switch (fc) {
      case "'":
      case '"':
        a.value = arg.slice(1, -1);
        a.literal = true;
        break;
      case "#":
        a.value = Number(arg);
        a.literal = true;
        break;
    }
    if (!a.literal) {
      a.rootProperty = root(arg);
      a.structured = isPath(arg);
      if (a.structured) {
        a.wildcard = arg.slice(-2) == ".*";
        if (a.wildcard) {
          a.name = arg.slice(0, -2);
        }
      }
    }
    return a;
  }
  function getArgValue(data, props, path) {
    let value = get(data, path);
    if (value === void 0) {
      value = props[path];
    }
    return value;
  }
  function notifySplices(inst, array, path, splices) {
    const splicesData = { indexSplices: splices };
    if (legacyUndefined && !inst._overrideLegacyUndefined) {
      array.splices = splicesData;
    }
    inst.notifyPath(path + ".splices", splicesData);
    inst.notifyPath(path + ".length", array.length);
    if (legacyUndefined && !inst._overrideLegacyUndefined) {
      splicesData.indexSplices = [];
    }
  }
  function notifySplice(inst, array, path, index, addedCount, removed) {
    notifySplices(inst, array, path, [
      {
        index,
        addedCount,
        removed,
        object: array,
        type: "splice",
      },
    ]);
  }
  function upper(name) {
    return name[0].toUpperCase() + name.substring(1);
  }
  var PropertyEffects = dedupingMixin((superClass) => {
    const propertyEffectsBase = TemplateStamp(PropertyAccessors(superClass));
    class PropertyEffects2 extends propertyEffectsBase {
      constructor() {
        super();
        this.__isPropertyEffectsClient = true;
        this.__dataClientsReady;
        this.__dataPendingClients;
        this.__dataToNotify;
        this.__dataLinkedPaths;
        this.__dataHasPaths;
        this.__dataCompoundStorage;
        this.__dataHost;
        this.__dataTemp;
        this.__dataClientsInitialized;
        this.__data;
        this.__dataPending;
        this.__dataOld;
        this.__computeEffects;
        this.__computeInfo;
        this.__reflectEffects;
        this.__notifyEffects;
        this.__propagateEffects;
        this.__observeEffects;
        this.__readOnly;
        this.__templateInfo;
        this._overrideLegacyUndefined;
      }
      get PROPERTY_EFFECT_TYPES() {
        return TYPES;
      }
      /**
       * @override
       * @return {void}
       */
      _initializeProperties() {
        super._initializeProperties();
        this._registerHost();
        this.__dataClientsReady = false;
        this.__dataPendingClients = null;
        this.__dataToNotify = null;
        this.__dataLinkedPaths = null;
        this.__dataHasPaths = false;
        this.__dataCompoundStorage = this.__dataCompoundStorage || null;
        this.__dataHost = this.__dataHost || null;
        this.__dataTemp = {};
        this.__dataClientsInitialized = false;
      }
      _registerHost() {
        if (hostStack.length) {
          let host = hostStack[hostStack.length - 1];
          host._enqueueClient(this);
          this.__dataHost = host;
        }
      }
      /**
       * Overrides `PropertyAccessors` implementation to provide a
       * more efficient implementation of initializing properties from
       * the prototype on the instance.
       *
       * @override
       * @param {Object} props Properties to initialize on the prototype
       * @return {void}
       */
      _initializeProtoProperties(props) {
        this.__data = Object.create(props);
        this.__dataPending = Object.create(props);
        this.__dataOld = {};
      }
      /**
       * Overrides `PropertyAccessors` implementation to avoid setting
       * `_setProperty`'s `shouldNotify: true`.
       *
       * @override
       * @param {Object} props Properties to initialize on the instance
       * @return {void}
       */
      _initializeInstanceProperties(props) {
        let readOnly = this[TYPES.READ_ONLY];
        for (let prop in props) {
          if (!readOnly || !readOnly[prop]) {
            this.__dataPending = this.__dataPending || {};
            this.__dataOld = this.__dataOld || {};
            this.__data[prop] = this.__dataPending[prop] = props[prop];
          }
        }
      }
      // Prototype setup ----------------------------------------
      /**
       * Equivalent to static `addPropertyEffect` API but can be called on
       * an instance to add effects at runtime.  See that method for
       * full API docs.
       *
       * @override
       * @param {string} property Property that should trigger the effect
       * @param {string} type Effect type, from this.PROPERTY_EFFECT_TYPES
       * @param {Object=} effect Effect metadata object
       * @return {void}
       * @protected
       */
      _addPropertyEffect(property, type, effect) {
        this._createPropertyAccessor(property, type == TYPES.READ_ONLY);
        let effects = ensureOwnEffectMap(this, type, true)[property];
        if (!effects) {
          effects = this[type][property] = [];
        }
        effects.push(effect);
      }
      /**
       * Removes the given property effect.
       *
       * @override
       * @param {string} property Property the effect was associated with
       * @param {string} type Effect type, from this.PROPERTY_EFFECT_TYPES
       * @param {Object=} effect Effect metadata object to remove
       * @return {void}
       */
      _removePropertyEffect(property, type, effect) {
        let effects = ensureOwnEffectMap(this, type, true)[property];
        let idx = effects.indexOf(effect);
        if (idx >= 0) {
          effects.splice(idx, 1);
        }
      }
      /**
       * Returns whether the current prototype/instance has a property effect
       * of a certain type.
       *
       * @override
       * @param {string} property Property name
       * @param {string=} type Effect type, from this.PROPERTY_EFFECT_TYPES
       * @return {boolean} True if the prototype/instance has an effect of this
       *     type
       * @protected
       */
      _hasPropertyEffect(property, type) {
        let effects = this[type];
        return Boolean(effects && effects[property]);
      }
      /**
       * Returns whether the current prototype/instance has a "read only"
       * accessor for the given property.
       *
       * @override
       * @param {string} property Property name
       * @return {boolean} True if the prototype/instance has an effect of this
       *     type
       * @protected
       */
      _hasReadOnlyEffect(property) {
        return this._hasPropertyEffect(property, TYPES.READ_ONLY);
      }
      /**
       * Returns whether the current prototype/instance has a "notify"
       * property effect for the given property.
       *
       * @override
       * @param {string} property Property name
       * @return {boolean} True if the prototype/instance has an effect of this
       *     type
       * @protected
       */
      _hasNotifyEffect(property) {
        return this._hasPropertyEffect(property, TYPES.NOTIFY);
      }
      /**
       * Returns whether the current prototype/instance has a "reflect to
       * attribute" property effect for the given property.
       *
       * @override
       * @param {string} property Property name
       * @return {boolean} True if the prototype/instance has an effect of this
       *     type
       * @protected
       */
      _hasReflectEffect(property) {
        return this._hasPropertyEffect(property, TYPES.REFLECT);
      }
      /**
       * Returns whether the current prototype/instance has a "computed"
       * property effect for the given property.
       *
       * @override
       * @param {string} property Property name
       * @return {boolean} True if the prototype/instance has an effect of this
       *     type
       * @protected
       */
      _hasComputedEffect(property) {
        return this._hasPropertyEffect(property, TYPES.COMPUTE);
      }
      // Runtime ----------------------------------------
      /**
       * Sets a pending property or path.  If the root property of the path in
       * question had no accessor, the path is set, otherwise it is enqueued
       * via `_setPendingProperty`.
       *
       * This function isolates relatively expensive functionality necessary
       * for the public API (`set`, `setProperties`, `notifyPath`, and property
       * change listeners via {{...}} bindings), such that it is only done
       * when paths enter the system, and not at every propagation step.  It
       * also sets a `__dataHasPaths` flag on the instance which is used to
       * fast-path slower path-matching code in the property effects host paths.
       *
       * `path` can be a path string or array of path parts as accepted by the
       * public API.
       *
       * @override
       * @param {string | !Array<number|string>} path Path to set
       * @param {*} value Value to set
       * @param {boolean=} shouldNotify Set to true if this change should
       *  cause a property notification event dispatch
       * @param {boolean=} isPathNotification If the path being set is a path
       *   notification of an already changed value, as opposed to a request
       *   to set and notify the change.  In the latter `false` case, a dirty
       *   check is performed and then the value is set to the path before
       *   enqueuing the pending property change.
       * @return {boolean} Returns true if the property/path was enqueued in
       *   the pending changes bag.
       * @protected
       */
      _setPendingPropertyOrPath(path, value, shouldNotify, isPathNotification) {
        if (
          isPathNotification ||
          root(Array.isArray(path) ? path[0] : path) !== path
        ) {
          if (!isPathNotification) {
            let old = get(this, path);
            path = /** @type {string} */ set(this, path, value);
            if (!path || !super._shouldPropertyChange(path, value, old)) {
              return false;
            }
          }
          this.__dataHasPaths = true;
          if (
            this._setPendingProperty(
              /**@type{string}*/
              path,
              value,
              shouldNotify
            )
          ) {
            computeLinkedPaths(
              this,
              /**@type{string}*/
              path,
              value
            );
            return true;
          }
        } else {
          if (this.__dataHasAccessor && this.__dataHasAccessor[path]) {
            return this._setPendingProperty(
              /**@type{string}*/
              path,
              value,
              shouldNotify
            );
          } else {
            this[path] = value;
          }
        }
        return false;
      }
      /**
       * Applies a value to a non-Polymer element/node's property.
       *
       * The implementation makes a best-effort at binding interop:
       * Some native element properties have side-effects when
       * re-setting the same value (e.g. setting `<input>.value` resets the
       * cursor position), so we do a dirty-check before setting the value.
       * However, for better interop with non-Polymer custom elements that
       * accept objects, we explicitly re-set object changes coming from the
       * Polymer world (which may include deep object changes without the
       * top reference changing), erring on the side of providing more
       * information.
       *
       * Users may override this method to provide alternate approaches.
       *
       * @override
       * @param {!Node} node The node to set a property on
       * @param {string} prop The property to set
       * @param {*} value The value to set
       * @return {void}
       * @protected
       */
      _setUnmanagedPropertyToNode(node, prop, value) {
        if (value !== node[prop] || typeof value == "object") {
          if (prop === "className") {
            node = /** @type {!Node} */ wrap2(node);
          }
          node[prop] = value;
        }
      }
      /**
       * Overrides the `PropertiesChanged` implementation to introduce special
       * dirty check logic depending on the property & value being set:
       *
       * 1. Any value set to a path (e.g. 'obj.prop': 42 or 'obj.prop': {...})
       *    Stored in `__dataTemp`, dirty checked against `__dataTemp`
       * 2. Object set to simple property (e.g. 'prop': {...})
       *    Stored in `__dataTemp` and `__data`, dirty checked against
       *    `__dataTemp` by default implementation of `_shouldPropertyChange`
       * 3. Primitive value set to simple property (e.g. 'prop': 42)
       *    Stored in `__data`, dirty checked against `__data`
       *
       * The dirty-check is important to prevent cycles due to two-way
       * notification, but paths and objects are only dirty checked against any
       * previous value set during this turn via a "temporary cache" that is
       * cleared when the last `_propertiesChanged` exits. This is so:
       * a. any cached array paths (e.g. 'array.3.prop') may be invalidated
       *    due to array mutations like shift/unshift/splice; this is fine
       *    since path changes are dirty-checked at user entry points like `set`
       * b. dirty-checking for objects only lasts one turn to allow the user
       *    to mutate the object in-place and re-set it with the same identity
       *    and have all sub-properties re-propagated in a subsequent turn.
       *
       * The temp cache is not necessarily sufficient to prevent invalid array
       * paths, since a splice can happen during the same turn (with pathological
       * user code); we could introduce a "fixup" for temporarily cached array
       * paths if needed: https://github.com/Polymer/polymer/issues/4227
       *
       * @override
       * @param {string} property Name of the property
       * @param {*} value Value to set
       * @param {boolean=} shouldNotify True if property should fire notification
       *   event (applies only for `notify: true` properties)
       * @return {boolean} Returns true if the property changed
       */
      _setPendingProperty(property, value, shouldNotify) {
        let propIsPath = this.__dataHasPaths && isPath(property);
        let prevProps = propIsPath ? this.__dataTemp : this.__data;
        if (this._shouldPropertyChange(property, value, prevProps[property])) {
          if (!this.__dataPending) {
            this.__dataPending = {};
            this.__dataOld = {};
          }
          if (!(property in this.__dataOld)) {
            this.__dataOld[property] = this.__data[property];
          }
          if (propIsPath) {
            this.__dataTemp[property] = value;
          } else {
            this.__data[property] = value;
          }
          this.__dataPending[property] = value;
          if (
            propIsPath ||
            (this[TYPES.NOTIFY] && this[TYPES.NOTIFY][property])
          ) {
            this.__dataToNotify = this.__dataToNotify || {};
            this.__dataToNotify[property] = shouldNotify;
          }
          return true;
        }
        return false;
      }
      /**
       * Overrides base implementation to ensure all accessors set `shouldNotify`
       * to true, for per-property notification tracking.
       *
       * @override
       * @param {string} property Name of the property
       * @param {*} value Value to set
       * @return {void}
       */
      _setProperty(property, value) {
        if (this._setPendingProperty(property, value, true)) {
          this._invalidateProperties();
        }
      }
      /**
       * Overrides `PropertyAccessor`'s default async queuing of
       * `_propertiesChanged`: if `__dataReady` is false (has not yet been
       * manually flushed), the function no-ops; otherwise flushes
       * `_propertiesChanged` synchronously.
       *
       * @override
       * @return {void}
       */
      _invalidateProperties() {
        if (this.__dataReady) {
          this._flushProperties();
        }
      }
      /**
       * Enqueues the given client on a list of pending clients, whose
       * pending property changes can later be flushed via a call to
       * `_flushClients`.
       *
       * @override
       * @param {Object} client PropertyEffects client to enqueue
       * @return {void}
       * @protected
       */
      _enqueueClient(client) {
        this.__dataPendingClients = this.__dataPendingClients || [];
        if (client !== this) {
          this.__dataPendingClients.push(client);
        }
      }
      /**
       * Flushes any clients previously enqueued via `_enqueueClient`, causing
       * their `_flushProperties` method to run.
       *
       * @override
       * @return {void}
       * @protected
       */
      _flushClients() {
        if (!this.__dataClientsReady) {
          this.__dataClientsReady = true;
          this._readyClients();
          this.__dataReady = true;
        } else {
          this.__enableOrFlushClients();
        }
      }
      // NOTE: We ensure clients either enable or flush as appropriate. This
      // handles two corner cases:
      // (1) clients flush properly when connected/enabled before the host
      // enables; e.g.
      //   (a) Templatize stamps with no properties and does not flush and
      //   (b) the instance is inserted into dom and
      //   (c) then the instance flushes.
      // (2) clients enable properly when not connected/enabled when the host
      // flushes; e.g.
      //   (a) a template is runtime stamped and not yet connected/enabled
      //   (b) a host sets a property, causing stamped dom to flush
      //   (c) the stamped dom enables.
      __enableOrFlushClients() {
        let clients = this.__dataPendingClients;
        if (clients) {
          this.__dataPendingClients = null;
          for (let i = 0; i < clients.length; i++) {
            let client = clients[i];
            if (!client.__dataEnabled) {
              client._enableProperties();
            } else if (client.__dataPending) {
              client._flushProperties();
            }
          }
        }
      }
      /**
       * Perform any initial setup on client dom. Called before the first
       * `_flushProperties` call on client dom and before any element
       * observers are called.
       *
       * @override
       * @return {void}
       * @protected
       */
      _readyClients() {
        this.__enableOrFlushClients();
      }
      /**
       * Sets a bag of property changes to this instance, and
       * synchronously processes all effects of the properties as a batch.
       *
       * Property names must be simple properties, not paths.  Batched
       * path propagation is not supported.
       *
       * @override
       * @param {Object} props Bag of one or more key-value pairs whose key is
       *   a property and value is the new value to set for that property.
       * @param {boolean=} setReadOnly When true, any private values set in
       *   `props` will be set. By default, `setProperties` will not set
       *   `readOnly: true` root properties.
       * @return {void}
       * @public
       */
      setProperties(props, setReadOnly) {
        for (let path in props) {
          if (
            setReadOnly ||
            !this[TYPES.READ_ONLY] ||
            !this[TYPES.READ_ONLY][path]
          ) {
            this._setPendingPropertyOrPath(path, props[path], true);
          }
        }
        this._invalidateProperties();
      }
      /**
       * Overrides `PropertyAccessors` so that property accessor
       * side effects are not enabled until after client dom is fully ready.
       * Also calls `_flushClients` callback to ensure client dom is enabled
       * that was not enabled as a result of flushing properties.
       *
       * @override
       * @return {void}
       */
      ready() {
        this._flushProperties();
        if (!this.__dataClientsReady) {
          this._flushClients();
        }
        if (this.__dataPending) {
          this._flushProperties();
        }
      }
      /**
       * Implements `PropertyAccessors`'s properties changed callback.
       *
       * Runs each class of effects for the batch of changed properties in
       * a specific order (compute, propagate, reflect, observe, notify).
       *
       * @override
       * @param {!Object} currentProps Bag of all current accessor values
       * @param {?Object} changedProps Bag of properties changed since the last
       *   call to `_propertiesChanged`
       * @param {?Object} oldProps Bag of previous values for each property
       *   in `changedProps`
       * @return {void}
       */
      _propertiesChanged(currentProps, changedProps, oldProps) {
        let hasPaths = this.__dataHasPaths;
        this.__dataHasPaths = false;
        let notifyProps;
        runComputedEffects(this, changedProps, oldProps, hasPaths);
        notifyProps = this.__dataToNotify;
        this.__dataToNotify = null;
        this._propagatePropertyChanges(changedProps, oldProps, hasPaths);
        this._flushClients();
        runEffects(this, this[TYPES.REFLECT], changedProps, oldProps, hasPaths);
        runEffects(this, this[TYPES.OBSERVE], changedProps, oldProps, hasPaths);
        if (notifyProps) {
          runNotifyEffects(this, notifyProps, changedProps, oldProps, hasPaths);
        }
        if (this.__dataCounter == 1) {
          this.__dataTemp = {};
        }
      }
      /**
       * Called to propagate any property changes to stamped template nodes
       * managed by this element.
       *
       * @override
       * @param {Object} changedProps Bag of changed properties
       * @param {Object} oldProps Bag of previous values for changed properties
       * @param {boolean} hasPaths True with `props` contains one or more paths
       * @return {void}
       * @protected
       */
      _propagatePropertyChanges(changedProps, oldProps, hasPaths) {
        if (this[TYPES.PROPAGATE]) {
          runEffects(
            this,
            this[TYPES.PROPAGATE],
            changedProps,
            oldProps,
            hasPaths
          );
        }
        if (this.__templateInfo) {
          this._runEffectsForTemplate(
            this.__templateInfo,
            changedProps,
            oldProps,
            hasPaths
          );
        }
      }
      _runEffectsForTemplate(templateInfo, changedProps, oldProps, hasPaths) {
        const baseRunEffects = (changedProps2, hasPaths2) => {
          runEffects(
            this,
            templateInfo.propertyEffects,
            changedProps2,
            oldProps,
            hasPaths2,
            templateInfo.nodeList
          );
          for (
            let info = templateInfo.firstChild;
            info;
            info = info.nextSibling
          ) {
            this._runEffectsForTemplate(
              info,
              changedProps2,
              oldProps,
              hasPaths2
            );
          }
        };
        if (templateInfo.runEffects) {
          templateInfo.runEffects(baseRunEffects, changedProps, hasPaths);
        } else {
          baseRunEffects(changedProps, hasPaths);
        }
      }
      /**
       * Aliases one data path as another, such that path notifications from one
       * are routed to the other.
       *
       * @override
       * @param {string | !Array<string|number>} to Target path to link.
       * @param {string | !Array<string|number>} from Source path to link.
       * @return {void}
       * @public
       */
      linkPaths(to, from) {
        to = normalize(to);
        from = normalize(from);
        this.__dataLinkedPaths = this.__dataLinkedPaths || {};
        this.__dataLinkedPaths[to] = from;
      }
      /**
       * Removes a data path alias previously established with `_linkPaths`.
       *
       * Note, the path to unlink should be the target (`to`) used when
       * linking the paths.
       *
       * @override
       * @param {string | !Array<string|number>} path Target path to unlink.
       * @return {void}
       * @public
       */
      unlinkPaths(path) {
        path = normalize(path);
        if (this.__dataLinkedPaths) {
          delete this.__dataLinkedPaths[path];
        }
      }
      /**
       * Notify that an array has changed.
       *
       * Example:
       *
       *     this.items = [ {name: 'Jim'}, {name: 'Todd'}, {name: 'Bill'} ];
       *     ...
       *     this.items.splice(1, 1, {name: 'Sam'});
       *     this.items.push({name: 'Bob'});
       *     this.notifySplices('items', [
       *       { index: 1, removed: [{name: 'Todd'}], addedCount: 1,
       *         object: this.items, type: 'splice' },
       *       { index: 3, removed: [], addedCount: 1,
       *         object: this.items, type: 'splice'}
       *     ]);
       *
       * @param {string} path Path that should be notified.
       * @param {Array} splices Array of splice records indicating ordered
       *   changes that occurred to the array. Each record should have the
       *   following fields:
       *    * index: index at which the change occurred
       *    * removed: array of items that were removed from this index
       *    * addedCount: number of new items added at this index
       *    * object: a reference to the array in question
       *    * type: the string literal 'splice'
       *
       *   Note that splice records _must_ be normalized such that they are
       *   reported in index order (raw results from `Object.observe` are not
       *   ordered and must be normalized/merged before notifying).
       *
       * @override
       * @return {void}
       * @public
       */
      notifySplices(path, splices) {
        let info = { path: "" };
        let array =
          /** @type {Array} */
          get(this, path, info);
        notifySplices(this, array, info.path, splices);
      }
      /**
       * Convenience method for reading a value from a path.
       *
       * Note, if any part in the path is undefined, this method returns
       * `undefined` (this method does not throw when dereferencing undefined
       * paths).
       *
       * @override
       * @param {(string|!Array<(string|number)>)} path Path to the value
       *   to read.  The path may be specified as a string (e.g. `foo.bar.baz`)
       *   or an array of path parts (e.g. `['foo.bar', 'baz']`).  Note that
       *   bracketed expressions are not supported; string-based path parts
       *   *must* be separated by dots.  Note that when dereferencing array
       *   indices, the index may be used as a dotted part directly
       *   (e.g. `users.12.name` or `['users', 12, 'name']`).
       * @param {Object=} root Root object from which the path is evaluated.
       * @return {*} Value at the path, or `undefined` if any part of the path
       *   is undefined.
       * @public
       */
      get(path, root2) {
        return get(root2 || this, path);
      }
      /**
       * Convenience method for setting a value to a path and notifying any
       * elements bound to the same path.
       *
       * Note, if any part in the path except for the last is undefined,
       * this method does nothing (this method does not throw when
       * dereferencing undefined paths).
       *
       * @override
       * @param {(string|!Array<(string|number)>)} path Path to the value
       *   to write.  The path may be specified as a string (e.g. `'foo.bar.baz'`)
       *   or an array of path parts (e.g. `['foo.bar', 'baz']`).  Note that
       *   bracketed expressions are not supported; string-based path parts
       *   *must* be separated by dots.  Note that when dereferencing array
       *   indices, the index may be used as a dotted part directly
       *   (e.g. `'users.12.name'` or `['users', 12, 'name']`).
       * @param {*} value Value to set at the specified path.
       * @param {Object=} root Root object from which the path is evaluated.
       *   When specified, no notification will occur.
       * @return {void}
       * @public
       */
      set(path, value, root2) {
        if (root2) {
          set(root2, path, value);
        } else {
          if (
            !this[TYPES.READ_ONLY] ||
            !(
              /** @type {string} */
              this[TYPES.READ_ONLY][path]
            )
          ) {
            if (this._setPendingPropertyOrPath(path, value, true)) {
              this._invalidateProperties();
            }
          }
        }
      }
      /**
       * Adds items onto the end of the array at the path specified.
       *
       * The arguments after `path` and return value match that of
       * `Array.prototype.push`.
       *
       * This method notifies other paths to the same array that a
       * splice occurred to the array.
       *
       * @override
       * @param {string | !Array<string|number>} path Path to array.
       * @param {...*} items Items to push onto array
       * @return {number} New length of the array.
       * @public
       */
      push(path, ...items) {
        let info = { path: "" };
        let array =
          /** @type {Array}*/
          get(this, path, info);
        let len = array.length;
        let ret = array.push(...items);
        if (items.length) {
          notifySplice(this, array, info.path, len, items.length, []);
        }
        return ret;
      }
      /**
       * Removes an item from the end of array at the path specified.
       *
       * The arguments after `path` and return value match that of
       * `Array.prototype.pop`.
       *
       * This method notifies other paths to the same array that a
       * splice occurred to the array.
       *
       * @override
       * @param {string | !Array<string|number>} path Path to array.
       * @return {*} Item that was removed.
       * @public
       */
      pop(path) {
        let info = { path: "" };
        let array =
          /** @type {Array} */
          get(this, path, info);
        let hadLength = Boolean(array.length);
        let ret = array.pop();
        if (hadLength) {
          notifySplice(this, array, info.path, array.length, 0, [ret]);
        }
        return ret;
      }
      /**
       * Starting from the start index specified, removes 0 or more items
       * from the array and inserts 0 or more new items in their place.
       *
       * The arguments after `path` and return value match that of
       * `Array.prototype.splice`.
       *
       * This method notifies other paths to the same array that a
       * splice occurred to the array.
       *
       * @override
       * @param {string | !Array<string|number>} path Path to array.
       * @param {number} start Index from which to start removing/inserting.
       * @param {number=} deleteCount Number of items to remove.
       * @param {...*} items Items to insert into array.
       * @return {!Array} Array of removed items.
       * @public
       */
      splice(path, start, deleteCount, ...items) {
        let info = { path: "" };
        let array =
          /** @type {Array} */
          get(this, path, info);
        if (start < 0) {
          start = array.length - Math.floor(-start);
        } else if (start) {
          start = Math.floor(start);
        }
        let ret;
        if (arguments.length === 2) {
          ret = array.splice(start);
        } else {
          ret = array.splice(start, deleteCount, ...items);
        }
        if (items.length || ret.length) {
          notifySplice(this, array, info.path, start, items.length, ret);
        }
        return ret;
      }
      /**
       * Removes an item from the beginning of array at the path specified.
       *
       * The arguments after `path` and return value match that of
       * `Array.prototype.pop`.
       *
       * This method notifies other paths to the same array that a
       * splice occurred to the array.
       *
       * @override
       * @param {string | !Array<string|number>} path Path to array.
       * @return {*} Item that was removed.
       * @public
       */
      shift(path) {
        let info = { path: "" };
        let array =
          /** @type {Array} */
          get(this, path, info);
        let hadLength = Boolean(array.length);
        let ret = array.shift();
        if (hadLength) {
          notifySplice(this, array, info.path, 0, 0, [ret]);
        }
        return ret;
      }
      /**
       * Adds items onto the beginning of the array at the path specified.
       *
       * The arguments after `path` and return value match that of
       * `Array.prototype.push`.
       *
       * This method notifies other paths to the same array that a
       * splice occurred to the array.
       *
       * @override
       * @param {string | !Array<string|number>} path Path to array.
       * @param {...*} items Items to insert info array
       * @return {number} New length of the array.
       * @public
       */
      unshift(path, ...items) {
        let info = { path: "" };
        let array =
          /** @type {Array} */
          get(this, path, info);
        let ret = array.unshift(...items);
        if (items.length) {
          notifySplice(this, array, info.path, 0, items.length, []);
        }
        return ret;
      }
      /**
       * Notify that a path has changed.
       *
       * Example:
       *
       *     this.item.user.name = 'Bob';
       *     this.notifyPath('item.user.name');
       *
       * @override
       * @param {string} path Path that should be notified.
       * @param {*=} value Value at the path (optional).
       * @return {void}
       * @public
       */
      notifyPath(path, value) {
        let propPath;
        if (arguments.length == 1) {
          let info = { path: "" };
          value = get(this, path, info);
          propPath = info.path;
        } else if (Array.isArray(path)) {
          propPath = normalize(path);
        } else {
          propPath = /** @type{string} */ path;
        }
        if (this._setPendingPropertyOrPath(propPath, value, true, true)) {
          this._invalidateProperties();
        }
      }
      /**
       * Equivalent to static `createReadOnlyProperty` API but can be called on
       * an instance to add effects at runtime.  See that method for
       * full API docs.
       *
       * @override
       * @param {string} property Property name
       * @param {boolean=} protectedSetter Creates a custom protected setter
       *   when `true`.
       * @return {void}
       * @protected
       */
      _createReadOnlyProperty(property, protectedSetter) {
        this._addPropertyEffect(property, TYPES.READ_ONLY);
        if (protectedSetter) {
          this["_set" + upper(property)] =
            /** @this {PropertyEffects} */
            function (value) {
              this._setProperty(property, value);
            };
        }
      }
      /**
       * Equivalent to static `createPropertyObserver` API but can be called on
       * an instance to add effects at runtime.  See that method for
       * full API docs.
       *
       * @override
       * @param {string} property Property name
       * @param {string|function(*,*)} method Function or name of observer method
       *     to call
       * @param {boolean=} dynamicFn Whether the method name should be included as
       *   a dependency to the effect.
       * @return {void}
       * @protected
       */
      _createPropertyObserver(property, method, dynamicFn) {
        let info = { property, method, dynamicFn: Boolean(dynamicFn) };
        this._addPropertyEffect(property, TYPES.OBSERVE, {
          fn: runObserverEffect,
          info,
          trigger: { name: property },
        });
        if (dynamicFn) {
          this._addPropertyEffect(
            /** @type {string} */
            method,
            TYPES.OBSERVE,
            {
              fn: runObserverEffect,
              info,
              trigger: { name: method },
            }
          );
        }
      }
      /**
       * Equivalent to static `createMethodObserver` API but can be called on
       * an instance to add effects at runtime.  See that method for
       * full API docs.
       *
       * @override
       * @param {string} expression Method expression
       * @param {boolean|Object=} dynamicFn Boolean or object map indicating
       *   whether method names should be included as a dependency to the effect.
       * @return {void}
       * @protected
       */
      _createMethodObserver(expression, dynamicFn) {
        let sig = parseMethod(expression);
        if (!sig) {
          throw new Error("Malformed observer expression '" + expression + "'");
        }
        createMethodEffect(
          this,
          sig,
          TYPES.OBSERVE,
          runMethodEffect,
          null,
          dynamicFn
        );
      }
      /**
       * Equivalent to static `createNotifyingProperty` API but can be called on
       * an instance to add effects at runtime.  See that method for
       * full API docs.
       *
       * @override
       * @param {string} property Property name
       * @return {void}
       * @protected
       */
      _createNotifyingProperty(property) {
        this._addPropertyEffect(property, TYPES.NOTIFY, {
          fn: runNotifyEffect,
          info: {
            eventName: camelToDashCase(property) + "-changed",
            property,
          },
        });
      }
      /**
       * Equivalent to static `createReflectedProperty` API but can be called on
       * an instance to add effects at runtime.  See that method for
       * full API docs.
       *
       * @override
       * @param {string} property Property name
       * @return {void}
       * @protected
       * @suppress {missingProperties} go/missingfnprops
       */
      _createReflectedProperty(property) {
        let attr2 = this.constructor.attributeNameForProperty(property);
        if (attr2[0] === "-") {
          console.warn(
            "Property " +
              property +
              " cannot be reflected to attribute " +
              attr2 +
              ' because "-" is not a valid starting attribute name. Use a lowercase first letter for the property instead.'
          );
        } else {
          this._addPropertyEffect(property, TYPES.REFLECT, {
            fn: runReflectEffect,
            info: {
              attrName: attr2,
            },
          });
        }
      }
      /**
       * Equivalent to static `createComputedProperty` API but can be called on
       * an instance to add effects at runtime.  See that method for
       * full API docs.
       *
       * @override
       * @param {string} property Name of computed property to set
       * @param {string} expression Method expression
       * @param {boolean|Object=} dynamicFn Boolean or object map indicating
       *   whether method names should be included as a dependency to the effect.
       * @return {void}
       * @protected
       */
      _createComputedProperty(property, expression, dynamicFn) {
        let sig = parseMethod(expression);
        if (!sig) {
          throw new Error("Malformed computed expression '" + expression + "'");
        }
        const info = createMethodEffect(
          this,
          sig,
          TYPES.COMPUTE,
          runComputedEffect,
          property,
          dynamicFn
        );
        ensureOwnEffectMap(this, COMPUTE_INFO)[property] = info;
      }
      /**
       * Gather the argument values for a method specified in the provided array
       * of argument metadata.
       *
       * The `path` and `value` arguments are used to fill in wildcard descriptor
       * when the method is being called as a result of a path notification.
       *
       * @param {!Array<!MethodArg>} args Array of argument metadata
       * @param {string} path Property/path name that triggered the method effect
       * @param {Object} props Bag of current property changes
       * @return {!Array<*>} Array of argument values
       * @private
       */
      _marshalArgs(args, path, props) {
        const data = this.__data;
        const values = [];
        for (let i = 0, l = args.length; i < l; i++) {
          let { name, structured, wildcard, value, literal } = args[i];
          if (!literal) {
            if (wildcard) {
              const matches2 = isDescendant(name, path);
              const pathValue = getArgValue(
                data,
                props,
                matches2 ? path : name
              );
              value = {
                path: matches2 ? path : name,
                value: pathValue,
                base: matches2 ? get(data, name) : pathValue,
              };
            } else {
              value = structured ? getArgValue(data, props, name) : data[name];
            }
          }
          if (
            legacyUndefined &&
            !this._overrideLegacyUndefined &&
            value === void 0 &&
            args.length > 1
          ) {
            return NOOP;
          }
          values[i] = value;
        }
        return values;
      }
      // -- static class methods ------------
      /**
       * Ensures an accessor exists for the specified property, and adds
       * to a list of "property effects" that will run when the accessor for
       * the specified property is set.  Effects are grouped by "type", which
       * roughly corresponds to a phase in effect processing.  The effect
       * metadata should be in the following form:
       *
       *     {
       *       fn: effectFunction, // Reference to function to call to perform effect
       *       info: { ... }       // Effect metadata passed to function
       *       trigger: {          // Optional triggering metadata; if not provided
       *         name: string      // the property is treated as a wildcard
       *         structured: boolean
       *         wildcard: boolean
       *       }
       *     }
       *
       * Effects are called from `_propertiesChanged` in the following order by
       * type:
       *
       * 1. COMPUTE
       * 2. PROPAGATE
       * 3. REFLECT
       * 4. OBSERVE
       * 5. NOTIFY
       *
       * Effect functions are called with the following signature:
       *
       *     effectFunction(inst, path, props, oldProps, info, hasPaths)
       *
       * @param {string} property Property that should trigger the effect
       * @param {string} type Effect type, from this.PROPERTY_EFFECT_TYPES
       * @param {Object=} effect Effect metadata object
       * @return {void}
       * @protected
       * @nocollapse
       */
      static addPropertyEffect(property, type, effect) {
        this.prototype._addPropertyEffect(property, type, effect);
      }
      /**
       * Creates a single-property observer for the given property.
       *
       * @param {string} property Property name
       * @param {string|function(*,*)} method Function or name of observer method to call
       * @param {boolean=} dynamicFn Whether the method name should be included as
       *   a dependency to the effect.
       * @return {void}
       * @protected
       * @nocollapse
       */
      static createPropertyObserver(property, method, dynamicFn) {
        this.prototype._createPropertyObserver(property, method, dynamicFn);
      }
      /**
       * Creates a multi-property "method observer" based on the provided
       * expression, which should be a string in the form of a normal JavaScript
       * function signature: `'methodName(arg1, [..., argn])'`.  Each argument
       * should correspond to a property or path in the context of this
       * prototype (or instance), or may be a literal string or number.
       *
       * @param {string} expression Method expression
       * @param {boolean|Object=} dynamicFn Boolean or object map indicating
       * @return {void}
       *   whether method names should be included as a dependency to the effect.
       * @protected
       * @nocollapse
       */
      static createMethodObserver(expression, dynamicFn) {
        this.prototype._createMethodObserver(expression, dynamicFn);
      }
      /**
       * Causes the setter for the given property to dispatch `<property>-changed`
       * events to notify of changes to the property.
       *
       * @param {string} property Property name
       * @return {void}
       * @protected
       * @nocollapse
       */
      static createNotifyingProperty(property) {
        this.prototype._createNotifyingProperty(property);
      }
      /**
       * Creates a read-only accessor for the given property.
       *
       * To set the property, use the protected `_setProperty` API.
       * To create a custom protected setter (e.g. `_setMyProp()` for
       * property `myProp`), pass `true` for `protectedSetter`.
       *
       * Note, if the property will have other property effects, this method
       * should be called first, before adding other effects.
       *
       * @param {string} property Property name
       * @param {boolean=} protectedSetter Creates a custom protected setter
       *   when `true`.
       * @return {void}
       * @protected
       * @nocollapse
       */
      static createReadOnlyProperty(property, protectedSetter) {
        this.prototype._createReadOnlyProperty(property, protectedSetter);
      }
      /**
       * Causes the setter for the given property to reflect the property value
       * to a (dash-cased) attribute of the same name.
       *
       * @param {string} property Property name
       * @return {void}
       * @protected
       * @nocollapse
       */
      static createReflectedProperty(property) {
        this.prototype._createReflectedProperty(property);
      }
      /**
       * Creates a computed property whose value is set to the result of the
       * method described by the given `expression` each time one or more
       * arguments to the method changes.  The expression should be a string
       * in the form of a normal JavaScript function signature:
       * `'methodName(arg1, [..., argn])'`
       *
       * @param {string} property Name of computed property to set
       * @param {string} expression Method expression
       * @param {boolean|Object=} dynamicFn Boolean or object map indicating whether
       *   method names should be included as a dependency to the effect.
       * @return {void}
       * @protected
       * @nocollapse
       */
      static createComputedProperty(property, expression, dynamicFn) {
        this.prototype._createComputedProperty(property, expression, dynamicFn);
      }
      /**
       * Parses the provided template to ensure binding effects are created
       * for them, and then ensures property accessors are created for any
       * dependent properties in the template.  Binding effects for bound
       * templates are stored in a linked list on the instance so that
       * templates can be efficiently stamped and unstamped.
       *
       * @param {!HTMLTemplateElement} template Template containing binding
       *   bindings
       * @return {!TemplateInfo} Template metadata object
       * @protected
       * @nocollapse
       */
      static bindTemplate(template4) {
        return this.prototype._bindTemplate(template4);
      }
      // -- binding ----------------------------------------------
      /*
       * Overview of binding flow:
       *
       * During finalization (`instanceBinding==false`, `wasPreBound==false`):
       *  `_bindTemplate(t, false)` called directly during finalization - parses
       *  the template (for the first time), and then assigns that _prototypical_
       *  template info to `__preboundTemplateInfo` _on the prototype_; note in
       *  this case `wasPreBound` is false; this is the first time we're binding
       *  it, thus we create accessors.
       *
       * During first stamping (`instanceBinding==true`, `wasPreBound==true`):
       *   `_stampTemplate` calls `_bindTemplate(t, true)`: the `templateInfo`
       *   returned matches the prebound one, and so this is `wasPreBound == true`
       *   state; thus we _skip_ creating accessors, but _do_ create an instance
       *   of the template info to serve as the start of our linked list (needs to
       *   be an instance, not the prototypical one, so that we can add `nodeList`
       *   to it to contain the `nodeInfo`-ordered list of instance nodes for
       *   bindings, and so we can chain runtime-stamped template infos off of
       *   it). At this point, the call to `_stampTemplate` calls
       *   `applyTemplateInfo` for each nested `<template>` found during parsing
       *   to hand prototypical `_templateInfo` to them; we also pass the _parent_
       *   `templateInfo` to the `<template>` so that we have the instance-time
       *   parent to link the `templateInfo` under in the case it was
       *   runtime-stamped.
       *
       * During subsequent runtime stamping (`instanceBinding==true`,
       *   `wasPreBound==false`): `_stampTemplate` calls `_bindTemplate(t, true)`
       *   - here `templateInfo` is guaranteed to _not_ match the prebound one,
       *   because it was either a different template altogether, or even if it
       *   was the same template, the step above created a instance of the info;
       *   in this case `wasPreBound == false`, so we _do_ create accessors, _and_
       *   link a instance into the linked list.
       */
      /**
       * Equivalent to static `bindTemplate` API but can be called on an instance
       * to add effects at runtime.  See that method for full API docs.
       *
       * This method may be called on the prototype (for prototypical template
       * binding, to avoid creating accessors every instance) once per prototype,
       * and will be called with `runtimeBinding: true` by `_stampTemplate` to
       * create and link an instance of the template metadata associated with a
       * particular stamping.
       *
       * @override
       * @param {!HTMLTemplateElement} template Template containing binding
       * bindings
       * @param {boolean=} instanceBinding When false (default), performs
       * "prototypical" binding of the template and overwrites any previously
       * bound template for the class. When true (as passed from
       * `_stampTemplate`), the template info is instanced and linked into the
       * list of bound templates.
       * @return {!TemplateInfo} Template metadata object; for `runtimeBinding`,
       * this is an instance of the prototypical template info
       * @protected
       * @suppress {missingProperties} go/missingfnprops
       */
      _bindTemplate(template4, instanceBinding) {
        let templateInfo = this.constructor._parseTemplate(template4);
        let wasPreBound = this.__preBoundTemplateInfo == templateInfo;
        if (!wasPreBound) {
          for (let prop in templateInfo.propertyEffects) {
            this._createPropertyAccessor(prop);
          }
        }
        if (instanceBinding) {
          templateInfo =
            /** @type {!TemplateInfo} */
            Object.create(templateInfo);
          templateInfo.wasPreBound = wasPreBound;
          if (!this.__templateInfo) {
            this.__templateInfo = templateInfo;
          } else {
            const parent = template4._parentTemplateInfo || this.__templateInfo;
            const previous = parent.lastChild;
            templateInfo.parent = parent;
            parent.lastChild = templateInfo;
            templateInfo.previousSibling = previous;
            if (previous) {
              previous.nextSibling = templateInfo;
            } else {
              parent.firstChild = templateInfo;
            }
          }
        } else {
          this.__preBoundTemplateInfo = templateInfo;
        }
        return templateInfo;
      }
      /**
       * Adds a property effect to the given template metadata, which is run
       * at the "propagate" stage of `_propertiesChanged` when the template
       * has been bound to the element via `_bindTemplate`.
       *
       * The `effect` object should match the format in `_addPropertyEffect`.
       *
       * @param {Object} templateInfo Template metadata to add effect to
       * @param {string} prop Property that should trigger the effect
       * @param {Object=} effect Effect metadata object
       * @return {void}
       * @protected
       * @nocollapse
       */
      static _addTemplatePropertyEffect(templateInfo, prop, effect) {
        let hostProps = (templateInfo.hostProps = templateInfo.hostProps || {});
        hostProps[prop] = true;
        let effects = (templateInfo.propertyEffects =
          templateInfo.propertyEffects || {});
        let propEffects = (effects[prop] = effects[prop] || []);
        propEffects.push(effect);
      }
      /**
       * Stamps the provided template and performs instance-time setup for
       * Polymer template features, including data bindings, declarative event
       * listeners, and the `this.$` map of `id`'s to nodes.  A document fragment
       * is returned containing the stamped DOM, ready for insertion into the
       * DOM.
       *
       * This method may be called more than once; however note that due to
       * `shadycss` polyfill limitations, only styles from templates prepared
       * using `ShadyCSS.prepareTemplate` will be correctly polyfilled (scoped
       * to the shadow root and support CSS custom properties), and note that
       * `ShadyCSS.prepareTemplate` may only be called once per element. As such,
       * any styles required by in runtime-stamped templates must be included
       * in the main element template.
       *
       * @param {!HTMLTemplateElement} template Template to stamp
       * @param {TemplateInfo=} templateInfo Optional bound template info associated
       *   with the template to be stamped; if omitted the template will be
       *   automatically bound.
       * @return {!StampedTemplate} Cloned template content
       * @override
       * @protected
       */
      _stampTemplate(template4, templateInfo) {
        templateInfo =
          templateInfo ||
          /** @type {!TemplateInfo} */
          this._bindTemplate(template4, true);
        hostStack.push(this);
        let dom2 = super._stampTemplate(template4, templateInfo);
        hostStack.pop();
        templateInfo.nodeList = dom2.nodeList;
        if (!templateInfo.wasPreBound) {
          let nodes = (templateInfo.childNodes = []);
          for (let n = dom2.firstChild; n; n = n.nextSibling) {
            nodes.push(n);
          }
        }
        dom2.templateInfo = templateInfo;
        setupBindings(this, templateInfo);
        if (this.__dataClientsReady) {
          this._runEffectsForTemplate(templateInfo, this.__data, null, false);
          this._flushClients();
        }
        return dom2;
      }
      /**
       * Removes and unbinds the nodes previously contained in the provided
       * DocumentFragment returned from `_stampTemplate`.
       *
       * @override
       * @param {!StampedTemplate} dom DocumentFragment previously returned
       *   from `_stampTemplate` associated with the nodes to be removed
       * @return {void}
       * @protected
       */
      _removeBoundDom(dom2) {
        const templateInfo = dom2.templateInfo;
        const { previousSibling, nextSibling, parent } = templateInfo;
        if (previousSibling) {
          previousSibling.nextSibling = nextSibling;
        } else if (parent) {
          parent.firstChild = nextSibling;
        }
        if (nextSibling) {
          nextSibling.previousSibling = previousSibling;
        } else if (parent) {
          parent.lastChild = previousSibling;
        }
        templateInfo.nextSibling = templateInfo.previousSibling = null;
        let nodes = templateInfo.childNodes;
        for (let i = 0; i < nodes.length; i++) {
          let node = nodes[i];
          wrap2(wrap2(node).parentNode).removeChild(node);
        }
      }
      /**
       * Overrides default `TemplateStamp` implementation to add support for
       * parsing bindings from `TextNode`'s' `textContent`.  A `bindings`
       * array is added to `nodeInfo` and populated with binding metadata
       * with information capturing the binding target, and a `parts` array
       * with one or more metadata objects capturing the source(s) of the
       * binding.
       *
       * @param {Node} node Node to parse
       * @param {TemplateInfo} templateInfo Template metadata for current template
       * @param {NodeInfo} nodeInfo Node metadata for current template node
       * @return {boolean} `true` if the visited node added node-specific
       *   metadata to `nodeInfo`
       * @protected
       * @suppress {missingProperties} Interfaces in closure do not inherit statics, but classes do
       * @nocollapse
       */
      static _parseTemplateNode(node, templateInfo, nodeInfo) {
        let noted = propertyEffectsBase._parseTemplateNode.call(
          this,
          node,
          templateInfo,
          nodeInfo
        );
        if (node.nodeType === Node.TEXT_NODE) {
          let parts = this._parseBindings(node.textContent, templateInfo);
          if (parts) {
            node.textContent = literalFromParts(parts) || " ";
            addBinding(
              this,
              templateInfo,
              nodeInfo,
              "text",
              "textContent",
              parts
            );
            noted = true;
          }
        }
        return noted;
      }
      /**
       * Overrides default `TemplateStamp` implementation to add support for
       * parsing bindings from attributes.  A `bindings`
       * array is added to `nodeInfo` and populated with binding metadata
       * with information capturing the binding target, and a `parts` array
       * with one or more metadata objects capturing the source(s) of the
       * binding.
       *
       * @param {Element} node Node to parse
       * @param {TemplateInfo} templateInfo Template metadata for current template
       * @param {NodeInfo} nodeInfo Node metadata for current template node
       * @param {string} name Attribute name
       * @param {string} value Attribute value
       * @return {boolean} `true` if the visited node added node-specific
       *   metadata to `nodeInfo`
       * @protected
       * @suppress {missingProperties} Interfaces in closure do not inherit statics, but classes do
       * @nocollapse
       */
      static _parseTemplateNodeAttribute(
        node,
        templateInfo,
        nodeInfo,
        name,
        value
      ) {
        let parts = this._parseBindings(value, templateInfo);
        if (parts) {
          let origName = name;
          let kind = "property";
          if (capitalAttributeRegex.test(name)) {
            kind = "attribute";
          } else if (name[name.length - 1] == "$") {
            name = name.slice(0, -1);
            kind = "attribute";
          }
          let literal = literalFromParts(parts);
          if (literal && kind == "attribute") {
            if (name == "class" && node.hasAttribute("class")) {
              literal += " " + node.getAttribute(name);
            }
            node.setAttribute(name, literal);
          }
          if (kind == "attribute" && origName == "disable-upgrade$") {
            node.setAttribute(name, "");
          }
          if (node.localName === "input" && origName === "value") {
            node.setAttribute(origName, "");
          }
          node.removeAttribute(origName);
          if (kind === "property") {
            name = dashToCamelCase(name);
          }
          addBinding(this, templateInfo, nodeInfo, kind, name, parts, literal);
          return true;
        } else {
          return propertyEffectsBase._parseTemplateNodeAttribute.call(
            this,
            node,
            templateInfo,
            nodeInfo,
            name,
            value
          );
        }
      }
      /**
       * Overrides default `TemplateStamp` implementation to add support for
       * binding the properties that a nested template depends on to the template
       * as `_host_<property>`.
       *
       * @param {Node} node Node to parse
       * @param {TemplateInfo} templateInfo Template metadata for current template
       * @param {NodeInfo} nodeInfo Node metadata for current template node
       * @return {boolean} `true` if the visited node added node-specific
       *   metadata to `nodeInfo`
       * @protected
       * @suppress {missingProperties} Interfaces in closure do not inherit statics, but classes do
       * @nocollapse
       */
      static _parseTemplateNestedTemplate(node, templateInfo, nodeInfo) {
        let noted = propertyEffectsBase._parseTemplateNestedTemplate.call(
          this,
          node,
          templateInfo,
          nodeInfo
        );
        const parent = node.parentNode;
        const nestedTemplateInfo = nodeInfo.templateInfo;
        const isDomIf = parent.localName === "dom-if";
        const isDomRepeat = parent.localName === "dom-repeat";
        if (removeNestedTemplates && (isDomIf || isDomRepeat)) {
          parent.removeChild(node);
          nodeInfo = nodeInfo.parentInfo;
          nodeInfo.templateInfo = nestedTemplateInfo;
          nodeInfo.noted = true;
          noted = false;
        }
        let hostProps = nestedTemplateInfo.hostProps;
        if (fastDomIf && isDomIf) {
          if (hostProps) {
            templateInfo.hostProps = Object.assign(
              templateInfo.hostProps || {},
              hostProps
            );
            if (!removeNestedTemplates) {
              nodeInfo.parentInfo.noted = true;
            }
          }
        } else {
          let mode = "{";
          for (let source in hostProps) {
            let parts = [
              { mode, source, dependencies: [source], hostProp: true },
            ];
            addBinding(
              this,
              templateInfo,
              nodeInfo,
              "property",
              "_host_" + source,
              parts
            );
          }
        }
        return noted;
      }
      /**
       * Called to parse text in a template (either attribute values or
       * textContent) into binding metadata.
       *
       * Any overrides of this method should return an array of binding part
       * metadata  representing one or more bindings found in the provided text
       * and any "literal" text in between.  Any non-literal parts will be passed
       * to `_evaluateBinding` when any dependencies change.  The only required
       * fields of each "part" in the returned array are as follows:
       *
       * - `dependencies` - Array containing trigger metadata for each property
       *   that should trigger the binding to update
       * - `literal` - String containing text if the part represents a literal;
       *   in this case no `dependencies` are needed
       *
       * Additional metadata for use by `_evaluateBinding` may be provided in
       * each part object as needed.
       *
       * The default implementation handles the following types of bindings
       * (one or more may be intermixed with literal strings):
       * - Property binding: `[[prop]]`
       * - Path binding: `[[object.prop]]`
       * - Negated property or path bindings: `[[!prop]]` or `[[!object.prop]]`
       * - Two-way property or path bindings (supports negation):
       *   `{{prop}}`, `{{object.prop}}`, `{{!prop}}` or `{{!object.prop}}`
       * - Inline computed method (supports negation):
       *   `[[compute(a, 'literal', b)]]`, `[[!compute(a, 'literal', b)]]`
       *
       * The default implementation uses a regular expression for best
       * performance. However, the regular expression uses a white-list of
       * allowed characters in a data-binding, which causes problems for
       * data-bindings that do use characters not in this white-list.
       *
       * Instead of updating the white-list with all allowed characters,
       * there is a StrictBindingParser (see lib/mixins/strict-binding-parser)
       * that uses a state machine instead. This state machine is able to handle
       * all characters. However, it is slightly less performant, therefore we
       * extracted it into a separate optional mixin.
       *
       * @param {string} text Text to parse from attribute or textContent
       * @param {Object} templateInfo Current template metadata
       * @return {Array<!BindingPart>} Array of binding part metadata
       * @protected
       * @nocollapse
       */
      static _parseBindings(text, templateInfo) {
        let parts = [];
        let lastIndex = 0;
        let m;
        while ((m = bindingRegex.exec(text)) !== null) {
          if (m.index > lastIndex) {
            parts.push({ literal: text.slice(lastIndex, m.index) });
          }
          let mode = m[1][0];
          let negate = Boolean(m[2]);
          let source = m[3].trim();
          let customEvent = false,
            notifyEvent = "",
            colon = -1;
          if (mode == "{" && (colon = source.indexOf("::")) > 0) {
            notifyEvent = source.substring(colon + 2);
            source = source.substring(0, colon);
            customEvent = true;
          }
          let signature = parseMethod(source);
          let dependencies = [];
          if (signature) {
            let { args, methodName } = signature;
            for (let i = 0; i < args.length; i++) {
              let arg = args[i];
              if (!arg.literal) {
                dependencies.push(arg);
              }
            }
            let dynamicFns = templateInfo.dynamicFns;
            if ((dynamicFns && dynamicFns[methodName]) || signature.static) {
              dependencies.push(methodName);
              signature.dynamicFn = true;
            }
          } else {
            dependencies.push(source);
          }
          parts.push({
            source,
            mode,
            negate,
            customEvent,
            signature,
            dependencies,
            event: notifyEvent,
          });
          lastIndex = bindingRegex.lastIndex;
        }
        if (lastIndex && lastIndex < text.length) {
          let literal = text.substring(lastIndex);
          if (literal) {
            parts.push({
              literal,
            });
          }
        }
        if (parts.length) {
          return parts;
        } else {
          return null;
        }
      }
      /**
       * Called to evaluate a previously parsed binding part based on a set of
       * one or more changed dependencies.
       *
       * @param {!Polymer_PropertyEffects} inst Element that should be used as
       *     scope for binding dependencies
       * @param {BindingPart} part Binding part metadata
       * @param {string} path Property/path that triggered this effect
       * @param {Object} props Bag of current property changes
       * @param {Object} oldProps Bag of previous values for changed properties
       * @param {boolean} hasPaths True with `props` contains one or more paths
       * @return {*} Value the binding part evaluated to
       * @protected
       * @nocollapse
       */
      static _evaluateBinding(inst, part, path, props, oldProps, hasPaths) {
        let value;
        if (part.signature) {
          value = runMethodEffect(inst, path, props, oldProps, part.signature);
        } else if (path != part.source) {
          value = get(inst, part.source);
        } else {
          if (hasPaths && isPath(path)) {
            value = get(inst, path);
          } else {
            value = inst.__data[path];
          }
        }
        if (part.negate) {
          value = !value;
        }
        return value;
      }
    }
    return PropertyEffects2;
  });
  var hostStack = [];

  // node_modules/.pnpm/@polymer+polymer@3.5.1/node_modules/@polymer/polymer/lib/utils/telemetry.js
  var instanceCount = 0;
  function incrementInstanceCount() {
    instanceCount++;
  }
  var registrations = [];
  function register(prototype) {
    registrations.push(prototype);
  }

  // node_modules/.pnpm/@polymer+polymer@3.5.1/node_modules/@polymer/polymer/lib/mixins/properties-mixin.js
  function normalizeProperties(props) {
    const output = {};
    for (let p2 in props) {
      const o = props[p2];
      output[p2] = typeof o === "function" ? { type: o } : o;
    }
    return output;
  }
  var PropertiesMixin = dedupingMixin((superClass) => {
    const base = PropertiesChanged(superClass);
    function superPropertiesClass(constructor) {
      const superCtor = Object.getPrototypeOf(constructor);
      return superCtor.prototype instanceof PropertiesMixin2
        ? /** @type {!PropertiesMixinConstructor} */
          superCtor
        : null;
    }
    function ownProperties(constructor) {
      if (
        !constructor.hasOwnProperty(
          JSCompiler_renameProperty("__ownProperties", constructor)
        )
      ) {
        let props = null;
        if (
          constructor.hasOwnProperty(
            JSCompiler_renameProperty("properties", constructor)
          )
        ) {
          const properties = constructor.properties;
          if (properties) {
            props = normalizeProperties(properties);
          }
        }
        constructor.__ownProperties = props;
      }
      return constructor.__ownProperties;
    }
    class PropertiesMixin2 extends base {
      /**
       * Implements standard custom elements getter to observes the attributes
       * listed in `properties`.
       * @suppress {missingProperties} Interfaces in closure do not inherit statics, but classes do
       * @nocollapse
       */
      static get observedAttributes() {
        if (
          !this.hasOwnProperty(
            JSCompiler_renameProperty("__observedAttributes", this)
          )
        ) {
          register(this.prototype);
          const props = this._properties;
          this.__observedAttributes = props
            ? Object.keys(props).map((p2) =>
                this.prototype._addPropertyToAttributeMap(p2)
              )
            : [];
        }
        return this.__observedAttributes;
      }
      /**
       * Finalizes an element definition, including ensuring any super classes
       * are also finalized. This includes ensuring property
       * accessors exist on the element prototype. This method calls
       * `_finalizeClass` to finalize each constructor in the prototype chain.
       * @return {void}
       * @nocollapse
       */
      static finalize() {
        if (
          !this.hasOwnProperty(JSCompiler_renameProperty("__finalized", this))
        ) {
          const superCtor = superPropertiesClass(
            /** @type {!PropertiesMixinConstructor} */
            this
          );
          if (superCtor) {
            superCtor.finalize();
          }
          this.__finalized = true;
          this._finalizeClass();
        }
      }
      /**
       * Finalize an element class. This includes ensuring property
       * accessors exist on the element prototype. This method is called by
       * `finalize` and finalizes the class constructor.
       *
       * @protected
       * @nocollapse
       */
      static _finalizeClass() {
        const props = ownProperties(
          /** @type {!PropertiesMixinConstructor} */
          this
        );
        if (props) {
          this.createProperties(props);
        }
      }
      /**
       * Returns a memoized version of all properties, including those inherited
       * from super classes. Properties not in object format are converted to
       * at least {type}.
       *
       * @return {Object} Object containing properties for this class
       * @protected
       * @nocollapse
       */
      static get _properties() {
        if (
          !this.hasOwnProperty(JSCompiler_renameProperty("__properties", this))
        ) {
          const superCtor = superPropertiesClass(
            /** @type {!PropertiesMixinConstructor} */
            this
          );
          this.__properties = Object.assign(
            {},
            superCtor && superCtor._properties,
            ownProperties(
              /** @type {PropertiesMixinConstructor} */
              this
            )
          );
        }
        return this.__properties;
      }
      /**
       * Overrides `PropertiesChanged` method to return type specified in the
       * static `properties` object for the given property.
       * @param {string} name Name of property
       * @return {*} Type to which to deserialize attribute
       *
       * @protected
       * @nocollapse
       */
      static typeForProperty(name) {
        const info = this._properties[name];
        return info && info.type;
      }
      /**
       * Overrides `PropertiesChanged` method and adds a call to
       * `finalize` which lazily configures the element's property accessors.
       * @override
       * @return {void}
       */
      _initializeProperties() {
        incrementInstanceCount();
        this.constructor.finalize();
        super._initializeProperties();
      }
      /**
       * Called when the element is added to a document.
       * Calls `_enableProperties` to turn on property system from
       * `PropertiesChanged`.
       * @suppress {missingProperties} Super may or may not implement the callback
       * @return {void}
       * @override
       */
      connectedCallback() {
        if (super.connectedCallback) {
          super.connectedCallback();
        }
        this._enableProperties();
      }
      /**
       * Called when the element is removed from a document
       * @suppress {missingProperties} Super may or may not implement the callback
       * @return {void}
       * @override
       */
      disconnectedCallback() {
        if (super.disconnectedCallback) {
          super.disconnectedCallback();
        }
      }
    }
    return PropertiesMixin2;
  });

  // node_modules/.pnpm/@polymer+polymer@3.5.1/node_modules/@polymer/polymer/lib/mixins/element-mixin.js
  var version = "3.5.1";
  var builtCSS = window.ShadyCSS && window.ShadyCSS["cssBuild"];
  var ElementMixin = dedupingMixin((base) => {
    const polymerElementBase = PropertiesMixin(PropertyEffects(base));
    function propertyDefaults(constructor) {
      if (
        !constructor.hasOwnProperty(
          JSCompiler_renameProperty("__propertyDefaults", constructor)
        )
      ) {
        constructor.__propertyDefaults = null;
        let props = constructor._properties;
        for (let p2 in props) {
          let info = props[p2];
          if ("value" in info) {
            constructor.__propertyDefaults =
              constructor.__propertyDefaults || {};
            constructor.__propertyDefaults[p2] = info;
          }
        }
      }
      return constructor.__propertyDefaults;
    }
    function ownObservers(constructor) {
      if (
        !constructor.hasOwnProperty(
          JSCompiler_renameProperty("__ownObservers", constructor)
        )
      ) {
        constructor.__ownObservers = constructor.hasOwnProperty(
          JSCompiler_renameProperty("observers", constructor)
        )
          ? /** @type {PolymerElementConstructor} */
            constructor.observers
          : null;
      }
      return constructor.__ownObservers;
    }
    function createPropertyFromConfig(proto2, name, info, allProps) {
      if (info.computed) {
        info.readOnly = true;
      }
      if (info.computed) {
        if (proto2._hasReadOnlyEffect(name)) {
          console.warn(`Cannot redefine computed property '${name}'.`);
        } else {
          proto2._createComputedProperty(name, info.computed, allProps);
        }
      }
      if (info.readOnly && !proto2._hasReadOnlyEffect(name)) {
        proto2._createReadOnlyProperty(name, !info.computed);
      } else if (info.readOnly === false && proto2._hasReadOnlyEffect(name)) {
        console.warn(`Cannot make readOnly property '${name}' non-readOnly.`);
      }
      if (info.reflectToAttribute && !proto2._hasReflectEffect(name)) {
        proto2._createReflectedProperty(name);
      } else if (
        info.reflectToAttribute === false &&
        proto2._hasReflectEffect(name)
      ) {
        console.warn(`Cannot make reflected property '${name}' non-reflected.`);
      }
      if (info.notify && !proto2._hasNotifyEffect(name)) {
        proto2._createNotifyingProperty(name);
      } else if (info.notify === false && proto2._hasNotifyEffect(name)) {
        console.warn(`Cannot make notify property '${name}' non-notify.`);
      }
      if (info.observer) {
        proto2._createPropertyObserver(
          name,
          info.observer,
          allProps[info.observer]
        );
      }
      proto2._addPropertyToAttributeMap(name);
    }
    function processElementStyles(klass, template4, is, baseURI) {
      if (!builtCSS) {
        const templateStyles = template4.content.querySelectorAll("style");
        const stylesWithImports = stylesFromTemplate(template4);
        const linkedStyles = stylesFromModuleImports(is);
        const firstTemplateChild = template4.content.firstElementChild;
        for (let idx = 0; idx < linkedStyles.length; idx++) {
          let s = linkedStyles[idx];
          s.textContent = klass._processStyleText(s.textContent, baseURI);
          template4.content.insertBefore(s, firstTemplateChild);
        }
        let templateStyleIndex = 0;
        for (let i = 0; i < stylesWithImports.length; i++) {
          let s = stylesWithImports[i];
          let templateStyle = templateStyles[templateStyleIndex];
          if (templateStyle !== s) {
            s = s.cloneNode(true);
            templateStyle.parentNode.insertBefore(s, templateStyle);
          } else {
            templateStyleIndex++;
          }
          s.textContent = klass._processStyleText(s.textContent, baseURI);
        }
      }
      if (window.ShadyCSS) {
        window.ShadyCSS.prepareTemplate(template4, is);
      }
      if (
        useAdoptedStyleSheetsWithBuiltCSS &&
        builtCSS &&
        supportsAdoptingStyleSheets
      ) {
        const styles = template4.content.querySelectorAll("style");
        if (styles) {
          let css = "";
          Array.from(styles).forEach((s) => {
            css += s.textContent;
            s.parentNode.removeChild(s);
          });
          klass._styleSheet = new CSSStyleSheet();
          klass._styleSheet.replaceSync(css);
        }
      }
    }
    function getTemplateFromDomModule(is) {
      let template4 = null;
      if (is && (!strictTemplatePolicy || allowTemplateFromDomModule)) {
        template4 =
          /** @type {?HTMLTemplateElement} */
          DomModule.import(is, "template");
        if (strictTemplatePolicy && !template4) {
          throw new Error(
            `strictTemplatePolicy: expecting dom-module or null template for ${is}`
          );
        }
      }
      return template4;
    }
    class PolymerElement2 extends polymerElementBase {
      /**
       * Current Polymer version in Semver notation.
       * @type {string} Semver notation of the current version of Polymer.
       * @nocollapse
       */
      static get polymerElementVersion() {
        return version;
      }
      /**
       * Override of PropertiesMixin _finalizeClass to create observers and
       * find the template.
       * @return {void}
       * @protected
       * @suppress {missingProperties} Interfaces in closure do not inherit statics, but classes do
       * @nocollapse
       */
      static _finalizeClass() {
        polymerElementBase._finalizeClass.call(this);
        const observers = ownObservers(this);
        if (observers) {
          this.createObservers(observers, this._properties);
        }
        this._prepareTemplate();
      }
      /** @nocollapse */
      static _prepareTemplate() {
        let template4 =
          /** @type {PolymerElementConstructor} */
          this.template;
        if (template4) {
          if (typeof template4 === "string") {
            console.error("template getter must return HTMLTemplateElement");
            template4 = null;
          } else if (!legacyOptimizations) {
            template4 = template4.cloneNode(true);
          }
        }
        this.prototype._template = template4;
      }
      /**
       * Override of PropertiesChanged createProperties to create accessors
       * and property effects for all of the properties.
       * @param {!Object} props .
       * @return {void}
       * @protected
       * @nocollapse
       */
      static createProperties(props) {
        for (let p2 in props) {
          createPropertyFromConfig(
            /** @type {?} */
            this.prototype,
            p2,
            props[p2],
            props
          );
        }
      }
      /**
       * Creates observers for the given `observers` array.
       * Leverages `PropertyEffects` to create observers.
       * @param {Object} observers Array of observer descriptors for
       *   this class
       * @param {Object} dynamicFns Object containing keys for any properties
       *   that are functions and should trigger the effect when the function
       *   reference is changed
       * @return {void}
       * @protected
       * @nocollapse
       */
      static createObservers(observers, dynamicFns) {
        const proto2 = this.prototype;
        for (let i = 0; i < observers.length; i++) {
          proto2._createMethodObserver(observers[i], dynamicFns);
        }
      }
      /**
       * Returns the template that will be stamped into this element's shadow root.
       *
       * If a `static get is()` getter is defined, the default implementation will
       * return the first `<template>` in a `dom-module` whose `id` matches this
       * element's `is` (note that a `_template` property on the class prototype
       * takes precedence over the `dom-module` template, to maintain legacy
       * element semantics; a subclass will subsequently fall back to its super
       * class template if neither a `prototype._template` or a `dom-module` for
       * the class's `is` was found).
       *
       * Users may override this getter to return an arbitrary template
       * (in which case the `is` getter is unnecessary). The template returned
       * must be an `HTMLTemplateElement`.
       *
       * Note that when subclassing, if the super class overrode the default
       * implementation and the subclass would like to provide an alternate
       * template via a `dom-module`, it should override this getter and
       * return `DomModule.import(this.is, 'template')`.
       *
       * If a subclass would like to modify the super class template, it should
       * clone it rather than modify it in place.  If the getter does expensive
       * work such as cloning/modifying a template, it should memoize the
       * template for maximum performance:
       *
       *   let memoizedTemplate;
       *   class MySubClass extends MySuperClass {
       *     static get template() {
       *       if (!memoizedTemplate) {
       *         memoizedTemplate = super.template.cloneNode(true);
       *         let subContent = document.createElement('div');
       *         subContent.textContent = 'This came from MySubClass';
       *         memoizedTemplate.content.appendChild(subContent);
       *       }
       *       return memoizedTemplate;
       *     }
       *   }
       *
       * @return {!HTMLTemplateElement|string} Template to be stamped
       * @nocollapse
       */
      static get template() {
        if (
          !this.hasOwnProperty(JSCompiler_renameProperty("_template", this))
        ) {
          let protoTemplate = this.prototype.hasOwnProperty(
            JSCompiler_renameProperty("_template", this.prototype)
          )
            ? this.prototype._template
            : void 0;
          if (typeof protoTemplate === "function") {
            protoTemplate = protoTemplate();
          }
          this._template = // If user has put template on prototype (e.g. in legacy via registered
            // callback or info object), prefer that first. Note that `null` is
            // used as a sentinel to indicate "no template" and can be used to
            // override a super template, whereas `undefined` is used as a
            // sentinel to mean "fall-back to default template lookup" via
            // dom-module and/or super.template.
            protoTemplate !== void 0
              ? protoTemplate
              : // Look in dom-module associated with this element's is
                (this.hasOwnProperty(JSCompiler_renameProperty("is", this)) &&
                  getTemplateFromDomModule(
                    /** @type {PolymerElementConstructor}*/
                    this.is
                  )) || // Next look for superclass template (call the super impl this
                // way so that `this` points to the superclass)
                Object.getPrototypeOf(
                  /** @type {PolymerElementConstructor}*/
                  this.prototype
                ).constructor.template;
        }
        return this._template;
      }
      /**
       * Set the template.
       *
       * @param {!HTMLTemplateElement|string} value Template to set.
       * @nocollapse
       */
      static set template(value) {
        this._template = value;
      }
      /**
       * Path matching the url from which the element was imported.
       *
       * This path is used to resolve url's in template style cssText.
       * The `importPath` property is also set on element instances and can be
       * used to create bindings relative to the import path.
       *
       * For elements defined in ES modules, users should implement
       * `static get importMeta() { return import.meta; }`, and the default
       * implementation of `importPath` will  return `import.meta.url`'s path.
       * For elements defined in HTML imports, this getter will return the path
       * to the document containing a `dom-module` element matching this
       * element's static `is` property.
       *
       * Note, this path should contain a trailing `/`.
       *
       * @return {string} The import path for this element class
       * @suppress {missingProperties}
       * @nocollapse
       */
      static get importPath() {
        if (
          !this.hasOwnProperty(JSCompiler_renameProperty("_importPath", this))
        ) {
          const meta = this.importMeta;
          if (meta) {
            this._importPath = pathFromUrl(meta.url);
          } else {
            const module = DomModule.import(
              /** @type {PolymerElementConstructor} */
              this.is
            );
            this._importPath =
              (module && module.assetpath) ||
              Object.getPrototypeOf(
                /** @type {PolymerElementConstructor}*/
                this.prototype
              ).constructor.importPath;
          }
        }
        return this._importPath;
      }
      constructor() {
        super();
        this._template;
        this._importPath;
        this.rootPath;
        this.importPath;
        this.root;
        this.$;
      }
      /**
       * Overrides the default `PropertyAccessors` to ensure class
       * metaprogramming related to property accessors and effects has
       * completed (calls `finalize`).
       *
       * It also initializes any property defaults provided via `value` in
       * `properties` metadata.
       *
       * @return {void}
       * @override
       * @suppress {invalidCasts,missingProperties} go/missingfnprops
       */
      _initializeProperties() {
        this.constructor.finalize();
        this.constructor._finalizeTemplate(
          /** @type {!HTMLElement} */
          this.localName
        );
        super._initializeProperties();
        this.rootPath = rootPath;
        this.importPath = this.constructor.importPath;
        let p$ = propertyDefaults(this.constructor);
        if (!p$) {
          return;
        }
        for (let p2 in p$) {
          let info = p$[p2];
          if (this._canApplyPropertyDefault(p2)) {
            let value =
              typeof info.value == "function"
                ? info.value.call(this)
                : info.value;
            if (this._hasAccessor(p2)) {
              this._setPendingProperty(p2, value, true);
            } else {
              this[p2] = value;
            }
          }
        }
      }
      /**
       * Determines if a property dfeault can be applied. For example, this
       * prevents a default from being applied when a property that has no
       * accessor is overridden by its host before upgrade (e.g. via a binding).
       * @override
       * @param {string} property Name of the property
       * @return {boolean} Returns true if the property default can be applied.
       */
      _canApplyPropertyDefault(property) {
        return !this.hasOwnProperty(property);
      }
      /**
       * Gather style text for a style element in the template.
       *
       * @param {string} cssText Text containing styling to process
       * @param {string} baseURI Base URI to rebase CSS paths against
       * @return {string} The processed CSS text
       * @protected
       * @nocollapse
       */
      static _processStyleText(cssText, baseURI) {
        return resolveCss(cssText, baseURI);
      }
      /**
       * Configures an element `proto` to function with a given `template`.
       * The element name `is` and extends `ext` must be specified for ShadyCSS
       * style scoping.
       *
       * @param {string} is Tag name (or type extension name) for this element
       * @return {void}
       * @protected
       * @nocollapse
       */
      static _finalizeTemplate(is) {
        const template4 = this.prototype._template;
        if (template4 && !template4.__polymerFinalized) {
          template4.__polymerFinalized = true;
          const importPath = this.importPath;
          const baseURI = importPath ? resolveUrl(importPath) : "";
          processElementStyles(this, template4, is, baseURI);
          this.prototype._bindTemplate(template4);
        }
      }
      /**
       * Provides a default implementation of the standard Custom Elements
       * `connectedCallback`.
       *
       * The default implementation enables the property effects system and
       * flushes any pending properties, and updates shimmed CSS properties
       * when using the ShadyCSS scoping/custom properties polyfill.
       *
       * @override
       * @suppress {missingProperties, invalidCasts} Super may or may not
       *     implement the callback
       * @return {void}
       */
      connectedCallback() {
        if (window.ShadyCSS && this._template) {
          window.ShadyCSS.styleElement(
            /** @type {!HTMLElement} */
            this
          );
        }
        super.connectedCallback();
      }
      /**
       * Stamps the element template.
       *
       * @return {void}
       * @override
       */
      ready() {
        if (this._template) {
          this.root = this._stampTemplate(this._template);
          this.$ = this.root.$;
        }
        super.ready();
      }
      /**
       * Implements `PropertyEffects`'s `_readyClients` call. Attaches
       * element dom by calling `_attachDom` with the dom stamped from the
       * element's template via `_stampTemplate`. Note that this allows
       * client dom to be attached to the element prior to any observers
       * running.
       *
       * @return {void}
       * @override
       */
      _readyClients() {
        if (this._template) {
          this.root = this._attachDom(
            /** @type {StampedTemplate} */
            this.root
          );
        }
        super._readyClients();
      }
      /**
       * Attaches an element's stamped dom to itself. By default,
       * this method creates a `shadowRoot` and adds the dom to it.
       * However, this method may be overridden to allow an element
       * to put its dom in another location.
       *
       * @override
       * @throws {Error}
       * @suppress {missingReturn}
       * @param {StampedTemplate} dom to attach to the element.
       * @return {ShadowRoot} node to which the dom has been attached.
       */
      _attachDom(dom2) {
        const n = wrap2(this);
        if (n.attachShadow) {
          if (dom2) {
            if (!n.shadowRoot) {
              n.attachShadow({ mode: "open", shadyUpgradeFragment: dom2 });
              n.shadowRoot.appendChild(dom2);
              if (this.constructor._styleSheet) {
                n.shadowRoot.adoptedStyleSheets = [
                  this.constructor._styleSheet,
                ];
              }
            }
            if (syncInitialRender && window.ShadyDOM) {
              window.ShadyDOM.flushInitial(n.shadowRoot);
            }
            return n.shadowRoot;
          }
          return null;
        } else {
          throw new Error(
            "ShadowDOM not available. PolymerElement can create dom as children instead of in ShadowDOM by setting `this.root = this;` before `ready`."
          );
        }
      }
      /**
       * When using the ShadyCSS scoping and custom property shim, causes all
       * shimmed styles in this element (and its subtree) to be updated
       * based on current custom property values.
       *
       * The optional parameter overrides inline custom property styles with an
       * object of properties where the keys are CSS properties, and the values
       * are strings.
       *
       * Example: `this.updateStyles({'--color': 'blue'})`
       *
       * These properties are retained unless a value of `null` is set.
       *
       * Note: This function does not support updating CSS mixins.
       * You can not dynamically change the value of an `@apply`.
       *
       * @override
       * @param {Object=} properties Bag of custom property key/values to
       *   apply to this element.
       * @return {void}
       * @suppress {invalidCasts}
       */
      updateStyles(properties) {
        if (window.ShadyCSS) {
          window.ShadyCSS.styleSubtree(
            /** @type {!HTMLElement} */
            this,
            properties
          );
        }
      }
      /**
       * Rewrites a given URL relative to a base URL. The base URL defaults to
       * the original location of the document containing the `dom-module` for
       * this element. This method will return the same URL before and after
       * bundling.
       *
       * Note that this function performs no resolution for URLs that start
       * with `/` (absolute URLs) or `#` (hash identifiers).  For general purpose
       * URL resolution, use `window.URL`.
       *
       * @override
       * @param {string} url URL to resolve.
       * @param {string=} base Optional base URL to resolve against, defaults
       * to the element's `importPath`
       * @return {string} Rewritten URL relative to base
       */
      resolveUrl(url, base2) {
        if (!base2 && this.importPath) {
          base2 = resolveUrl(this.importPath);
        }
        return resolveUrl(url, base2);
      }
      /**
       * Overrides `PropertyEffects` to add map of dynamic functions on
       * template info, for consumption by `PropertyEffects` template binding
       * code. This map determines which method templates should have accessors
       * created for them.
       *
       * @param {!HTMLTemplateElement} template Template
       * @param {!TemplateInfo} templateInfo Template metadata for current template
       * @param {!NodeInfo} nodeInfo Node metadata for current template.
       * @return {boolean} .
       * @suppress {missingProperties} Interfaces in closure do not inherit statics, but classes do
       * @nocollapse
       */
      static _parseTemplateContent(template4, templateInfo, nodeInfo) {
        templateInfo.dynamicFns = templateInfo.dynamicFns || this._properties;
        return polymerElementBase._parseTemplateContent.call(
          this,
          template4,
          templateInfo,
          nodeInfo
        );
      }
      /**
       * Overrides `PropertyEffects` to warn on use of undeclared properties in
       * template.
       *
       * @param {Object} templateInfo Template metadata to add effect to
       * @param {string} prop Property that should trigger the effect
       * @param {Object=} effect Effect metadata object
       * @return {void}
       * @protected
       * @suppress {missingProperties} Interfaces in closure do not inherit statics, but classes do
       * @nocollapse
       */
      static _addTemplatePropertyEffect(templateInfo, prop, effect) {
        if (
          legacyWarnings &&
          !(prop in this._properties) && // Methods used in templates with no dependencies (or only literal
          // dependencies) become accessors with template effects; ignore these
          !(effect.info.part.signature && effect.info.part.signature.static) && // Warnings for bindings added to nested templates are handled by
          // templatizer so ignore both the host-to-template bindings
          // (`hostProp`) and TemplateInstance-to-child bindings
          // (`nestedTemplate`)
          !effect.info.part.hostProp &&
          !templateInfo.nestedTemplate
        ) {
          console.warn(
            `Property '${prop}' used in template but not declared in 'properties'; attribute will not be observed.`
          );
        }
        return polymerElementBase._addTemplatePropertyEffect.call(
          this,
          templateInfo,
          prop,
          effect
        );
      }
    }
    return PolymerElement2;
  });

  // node_modules/.pnpm/@polymer+polymer@3.5.1/node_modules/@polymer/polymer/lib/utils/debounce.js
  var Debouncer = class _Debouncer {
    constructor() {
      this._asyncModule = null;
      this._callback = null;
      this._timer = null;
    }
    /**
     * Sets the scheduler; that is, a module with the Async interface,
     * a callback and optional arguments to be passed to the run function
     * from the async module.
     *
     * @param {!AsyncInterface} asyncModule Object with Async interface.
     * @param {function()} callback Callback to run.
     * @return {void}
     */
    setConfig(asyncModule, callback) {
      this._asyncModule = asyncModule;
      this._callback = callback;
      this._timer = this._asyncModule.run(() => {
        this._timer = null;
        debouncerQueue.delete(this);
        this._callback();
      });
    }
    /**
     * Cancels an active debouncer and returns a reference to itself.
     *
     * @return {void}
     */
    cancel() {
      if (this.isActive()) {
        this._cancelAsync();
        debouncerQueue.delete(this);
      }
    }
    /**
     * Cancels a debouncer's async callback.
     *
     * @return {void}
     */
    _cancelAsync() {
      if (this.isActive()) {
        this._asyncModule.cancel(
          /** @type {number} */
          this._timer
        );
        this._timer = null;
      }
    }
    /**
     * Flushes an active debouncer and returns a reference to itself.
     *
     * @return {void}
     */
    flush() {
      if (this.isActive()) {
        this.cancel();
        this._callback();
      }
    }
    /**
     * Returns true if the debouncer is active.
     *
     * @return {boolean} True if active.
     */
    isActive() {
      return this._timer != null;
    }
    /**
     * Creates a debouncer if no debouncer is passed as a parameter
     * or it cancels an active debouncer otherwise. The following
     * example shows how a debouncer can be called multiple times within a
     * microtask and "debounced" such that the provided callback function is
     * called once. Add this method to a custom element:
     *
     * ```js
     * import {microTask} from '@polymer/polymer/lib/utils/async.js';
     * import {Debouncer} from '@polymer/polymer/lib/utils/debounce.js';
     * // ...
     *
     * _debounceWork() {
     *   this._debounceJob = Debouncer.debounce(this._debounceJob,
     *       microTask, () => this._doWork());
     * }
     * ```
     *
     * If the `_debounceWork` method is called multiple times within the same
     * microtask, the `_doWork` function will be called only once at the next
     * microtask checkpoint.
     *
     * Note: In testing it is often convenient to avoid asynchrony. To accomplish
     * this with a debouncer, you can use `enqueueDebouncer` and
     * `flush`. For example, extend the above example by adding
     * `enqueueDebouncer(this._debounceJob)` at the end of the
     * `_debounceWork` method. Then in a test, call `flush` to ensure
     * the debouncer has completed.
     *
     * @param {Debouncer?} debouncer Debouncer object.
     * @param {!AsyncInterface} asyncModule Object with Async interface
     * @param {function()} callback Callback to run.
     * @return {!Debouncer} Returns a debouncer object.
     */
    static debounce(debouncer, asyncModule, callback) {
      if (debouncer instanceof _Debouncer) {
        debouncer._cancelAsync();
      } else {
        debouncer = new _Debouncer();
      }
      debouncer.setConfig(asyncModule, callback);
      return debouncer;
    }
  };
  var debouncerQueue = /* @__PURE__ */ new Set();
  var enqueueDebouncer = function (debouncer) {
    debouncerQueue.add(debouncer);
  };
  var flushDebouncers = function () {
    const didFlush = Boolean(debouncerQueue.size);
    debouncerQueue.forEach((debouncer) => {
      try {
        debouncer.flush();
      } catch (e) {
        setTimeout(() => {
          throw e;
        });
      }
    });
    return didFlush;
  };

  // node_modules/.pnpm/@polymer+polymer@3.5.1/node_modules/@polymer/polymer/lib/utils/gestures.js
  var HAS_NATIVE_TA = typeof document.head.style.touchAction === "string";
  var GESTURE_KEY = "__polymerGestures";
  var HANDLED_OBJ = "__polymerGesturesHandled";
  var TOUCH_ACTION = "__polymerGesturesTouchAction";
  var TAP_DISTANCE = 25;
  var TRACK_DISTANCE = 5;
  var TRACK_LENGTH = 2;
  var MOUSE_TIMEOUT = 2500;
  var MOUSE_EVENTS = ["mousedown", "mousemove", "mouseup", "click"];
  var MOUSE_WHICH_TO_BUTTONS = [0, 1, 4, 2];
  var MOUSE_HAS_BUTTONS = (function () {
    try {
      return new MouseEvent("test", { buttons: 1 }).buttons === 1;
    } catch (e) {
      return false;
    }
  })();
  function isMouseEvent(name) {
    return MOUSE_EVENTS.indexOf(name) > -1;
  }
  var supportsPassive = false;
  (function () {
    try {
      let opts = Object.defineProperty({}, "passive", {
        get() {
          supportsPassive = true;
        },
      });
      window.addEventListener("test", null, opts);
      window.removeEventListener("test", null, opts);
    } catch (e) {}
  })();
  function PASSIVE_TOUCH(eventName) {
    if (isMouseEvent(eventName) || eventName === "touchend") {
      return;
    }
    if (HAS_NATIVE_TA && supportsPassive && passiveTouchGestures) {
      return { passive: true };
    } else {
      return;
    }
  }
  var IS_TOUCH_ONLY = navigator.userAgent.match(/iP(?:[oa]d|hone)|Android/);
  var clickedLabels = [];
  var labellable = {
    button: true,
    input: true,
    keygen: true,
    meter: true,
    output: true,
    textarea: true,
    progress: true,
    select: true,
  };
  var canBeDisabled = {
    button: true,
    command: true,
    fieldset: true,
    input: true,
    keygen: true,
    optgroup: true,
    option: true,
    select: true,
    textarea: true,
  };
  function canBeLabelled(el) {
    return labellable[el.localName] || false;
  }
  function matchingLabels(el) {
    let labels = Array.prototype.slice.call(
      /** @type {HTMLInputElement} */
      el.labels || []
    );
    if (!labels.length) {
      labels = [];
      try {
        let root2 = el.getRootNode();
        if (el.id) {
          let matching = root2.querySelectorAll(`label[for = '${el.id}']`);
          for (let i = 0; i < matching.length; i++) {
            labels.push(
              /** @type {!HTMLLabelElement} */
              matching[i]
            );
          }
        }
      } catch (e) {}
    }
    return labels;
  }
  var mouseCanceller = function (mouseEvent) {
    let sc = mouseEvent.sourceCapabilities;
    if (sc && !sc.firesTouchEvents) {
      return;
    }
    mouseEvent[HANDLED_OBJ] = { skip: true };
    if (mouseEvent.type === "click") {
      let clickFromLabel = false;
      let path = getComposedPath(mouseEvent);
      for (let i = 0; i < path.length; i++) {
        if (path[i].nodeType === Node.ELEMENT_NODE) {
          if (path[i].localName === "label") {
            clickedLabels.push(
              /** @type {!HTMLLabelElement} */
              path[i]
            );
          } else if (
            canBeLabelled(
              /** @type {!HTMLElement} */
              path[i]
            )
          ) {
            let ownerLabels = matchingLabels(
              /** @type {!HTMLElement} */
              path[i]
            );
            for (let j = 0; j < ownerLabels.length; j++) {
              clickFromLabel =
                clickFromLabel || clickedLabels.indexOf(ownerLabels[j]) > -1;
            }
          }
        }
        if (path[i] === POINTERSTATE.mouse.target) {
          return;
        }
      }
      if (clickFromLabel) {
        return;
      }
      mouseEvent.preventDefault();
      mouseEvent.stopPropagation();
    }
  };
  function setupTeardownMouseCanceller(setup) {
    let events = IS_TOUCH_ONLY ? ["click"] : MOUSE_EVENTS;
    for (let i = 0, en; i < events.length; i++) {
      en = events[i];
      if (setup) {
        clickedLabels.length = 0;
        document.addEventListener(en, mouseCanceller, true);
      } else {
        document.removeEventListener(en, mouseCanceller, true);
      }
    }
  }
  function ignoreMouse(e) {
    if (!cancelSyntheticClickEvents) {
      return;
    }
    if (!POINTERSTATE.mouse.mouseIgnoreJob) {
      setupTeardownMouseCanceller(true);
    }
    let unset = function () {
      setupTeardownMouseCanceller();
      POINTERSTATE.mouse.target = null;
      POINTERSTATE.mouse.mouseIgnoreJob = null;
    };
    POINTERSTATE.mouse.target = getComposedPath(e)[0];
    POINTERSTATE.mouse.mouseIgnoreJob = Debouncer.debounce(
      POINTERSTATE.mouse.mouseIgnoreJob,
      timeOut.after(MOUSE_TIMEOUT),
      unset
    );
  }
  function hasLeftMouseButton(ev) {
    let type = ev.type;
    if (!isMouseEvent(type)) {
      return false;
    }
    if (type === "mousemove") {
      let buttons = ev.buttons === void 0 ? 1 : ev.buttons;
      if (ev instanceof window.MouseEvent && !MOUSE_HAS_BUTTONS) {
        buttons = MOUSE_WHICH_TO_BUTTONS[ev.which] || 0;
      }
      return Boolean(buttons & 1);
    } else {
      let button = ev.button === void 0 ? 0 : ev.button;
      return button === 0;
    }
  }
  function isSyntheticClick(ev) {
    if (ev.type === "click") {
      if (ev.detail === 0) {
        return true;
      }
      let t = _findOriginalTarget(ev);
      if (
        !t.nodeType ||
        /** @type {Element} */
        t.nodeType !== Node.ELEMENT_NODE
      ) {
        return true;
      }
      let bcr =
        /** @type {Element} */
        t.getBoundingClientRect();
      let x = ev.pageX,
        y = ev.pageY;
      return !(
        x >= bcr.left &&
        x <= bcr.right &&
        y >= bcr.top &&
        y <= bcr.bottom
      );
    }
    return false;
  }
  var POINTERSTATE = {
    mouse: {
      target: null,
      mouseIgnoreJob: null,
    },
    touch: {
      x: 0,
      y: 0,
      id: -1,
      scrollDecided: false,
    },
  };
  function firstTouchAction(ev) {
    let ta = "auto";
    let path = getComposedPath(ev);
    for (let i = 0, n; i < path.length; i++) {
      n = path[i];
      if (n[TOUCH_ACTION]) {
        ta = n[TOUCH_ACTION];
        break;
      }
    }
    return ta;
  }
  function trackDocument(stateObj, movefn, upfn) {
    stateObj.movefn = movefn;
    stateObj.upfn = upfn;
    document.addEventListener("mousemove", movefn);
    document.addEventListener("mouseup", upfn);
  }
  function untrackDocument(stateObj) {
    document.removeEventListener("mousemove", stateObj.movefn);
    document.removeEventListener("mouseup", stateObj.upfn);
    stateObj.movefn = null;
    stateObj.upfn = null;
  }
  if (cancelSyntheticClickEvents) {
    document.addEventListener(
      "touchend",
      ignoreMouse,
      supportsPassive ? { passive: true } : false
    );
  }
  var getComposedPath =
    window.ShadyDOM && window.ShadyDOM.noPatch
      ? window.ShadyDOM.composedPath
      : (event) => (event.composedPath && event.composedPath()) || [];
  var gestures = {};
  var recognizers = [];
  function deepTargetFind(x, y) {
    let node = document.elementFromPoint(x, y);
    let next = node;
    while (next && next.shadowRoot && !window.ShadyDOM) {
      let oldNext = next;
      next = next.shadowRoot.elementFromPoint(x, y);
      if (oldNext === next) {
        break;
      }
      if (next) {
        node = next;
      }
    }
    return node;
  }
  function _findOriginalTarget(ev) {
    const path = getComposedPath(
      /** @type {?Event} */
      ev
    );
    return path.length > 0 ? path[0] : ev.target;
  }
  function _handleNative(ev) {
    let handled;
    let type = ev.type;
    let node = ev.currentTarget;
    let gobj = node[GESTURE_KEY];
    if (!gobj) {
      return;
    }
    let gs = gobj[type];
    if (!gs) {
      return;
    }
    if (!ev[HANDLED_OBJ]) {
      ev[HANDLED_OBJ] = {};
      if (type.slice(0, 5) === "touch") {
        ev = /** @type {TouchEvent} */ ev;
        let t = ev.changedTouches[0];
        if (type === "touchstart") {
          if (ev.touches.length === 1) {
            POINTERSTATE.touch.id = t.identifier;
          }
        }
        if (POINTERSTATE.touch.id !== t.identifier) {
          return;
        }
        if (!HAS_NATIVE_TA) {
          if (type === "touchstart" || type === "touchmove") {
            _handleTouchAction(ev);
          }
        }
      }
    }
    handled = ev[HANDLED_OBJ];
    if (handled.skip) {
      return;
    }
    for (let i = 0, r; i < recognizers.length; i++) {
      r = recognizers[i];
      if (gs[r.name] && !handled[r.name]) {
        if (r.flow && r.flow.start.indexOf(ev.type) > -1 && r.reset) {
          r.reset();
        }
      }
    }
    for (let i = 0, r; i < recognizers.length; i++) {
      r = recognizers[i];
      if (gs[r.name] && !handled[r.name]) {
        handled[r.name] = true;
        r[type](ev);
      }
    }
  }
  function _handleTouchAction(ev) {
    let t = ev.changedTouches[0];
    let type = ev.type;
    if (type === "touchstart") {
      POINTERSTATE.touch.x = t.clientX;
      POINTERSTATE.touch.y = t.clientY;
      POINTERSTATE.touch.scrollDecided = false;
    } else if (type === "touchmove") {
      if (POINTERSTATE.touch.scrollDecided) {
        return;
      }
      POINTERSTATE.touch.scrollDecided = true;
      let ta = firstTouchAction(ev);
      let shouldPrevent = false;
      let dx = Math.abs(POINTERSTATE.touch.x - t.clientX);
      let dy = Math.abs(POINTERSTATE.touch.y - t.clientY);
      if (!ev.cancelable) {
      } else if (ta === "none") {
        shouldPrevent = true;
      } else if (ta === "pan-x") {
        shouldPrevent = dy > dx;
      } else if (ta === "pan-y") {
        shouldPrevent = dx > dy;
      }
      if (shouldPrevent) {
        ev.preventDefault();
      } else {
        prevent("track");
      }
    }
  }
  function addListener(node, evType, handler) {
    if (gestures[evType]) {
      _add(node, evType, handler);
      return true;
    }
    return false;
  }
  function removeListener(node, evType, handler) {
    if (gestures[evType]) {
      _remove(node, evType, handler);
      return true;
    }
    return false;
  }
  function _add(node, evType, handler) {
    let recognizer = gestures[evType];
    let deps = recognizer.deps;
    let name = recognizer.name;
    let gobj = node[GESTURE_KEY];
    if (!gobj) {
      node[GESTURE_KEY] = gobj = {};
    }
    for (let i = 0, dep, gd; i < deps.length; i++) {
      dep = deps[i];
      if (IS_TOUCH_ONLY && isMouseEvent(dep) && dep !== "click") {
        continue;
      }
      gd = gobj[dep];
      if (!gd) {
        gobj[dep] = gd = { _count: 0 };
      }
      if (gd._count === 0) {
        node.addEventListener(dep, _handleNative, PASSIVE_TOUCH(dep));
      }
      gd[name] = (gd[name] || 0) + 1;
      gd._count = (gd._count || 0) + 1;
    }
    node.addEventListener(evType, handler);
    if (recognizer.touchAction) {
      setTouchAction(node, recognizer.touchAction);
    }
  }
  function _remove(node, evType, handler) {
    let recognizer = gestures[evType];
    let deps = recognizer.deps;
    let name = recognizer.name;
    let gobj = node[GESTURE_KEY];
    if (gobj) {
      for (let i = 0, dep, gd; i < deps.length; i++) {
        dep = deps[i];
        gd = gobj[dep];
        if (gd && gd[name]) {
          gd[name] = (gd[name] || 1) - 1;
          gd._count = (gd._count || 1) - 1;
          if (gd._count === 0) {
            node.removeEventListener(dep, _handleNative, PASSIVE_TOUCH(dep));
          }
        }
      }
    }
    node.removeEventListener(evType, handler);
  }
  function register2(recog) {
    recognizers.push(recog);
    for (let i = 0; i < recog.emits.length; i++) {
      gestures[recog.emits[i]] = recog;
    }
  }
  function _findRecognizerByEvent(evName) {
    for (let i = 0, r; i < recognizers.length; i++) {
      r = recognizers[i];
      for (let j = 0, n; j < r.emits.length; j++) {
        n = r.emits[j];
        if (n === evName) {
          return r;
        }
      }
    }
    return null;
  }
  function setTouchAction(node, value) {
    if (HAS_NATIVE_TA && node instanceof HTMLElement) {
      microTask.run(() => {
        node.style.touchAction = value;
      });
    }
    node[TOUCH_ACTION] = value;
  }
  function _fire(target, type, detail) {
    let ev = new Event(type, {
      bubbles: true,
      cancelable: true,
      composed: true,
    });
    ev.detail = detail;
    wrap2(
      /** @type {!Node} */
      target
    ).dispatchEvent(ev);
    if (ev.defaultPrevented) {
      let preventer = detail.preventer || detail.sourceEvent;
      if (preventer && preventer.preventDefault) {
        preventer.preventDefault();
      }
    }
  }
  function prevent(evName) {
    let recognizer = _findRecognizerByEvent(evName);
    if (recognizer.info) {
      recognizer.info.prevent = true;
    }
  }
  register2({
    name: "downup",
    deps: ["mousedown", "touchstart", "touchend"],
    flow: {
      start: ["mousedown", "touchstart"],
      end: ["mouseup", "touchend"],
    },
    emits: ["down", "up"],
    info: {
      movefn: null,
      upfn: null,
    },
    /**
     * @this {GestureRecognizer}
     * @return {void}
     */
    reset: function () {
      untrackDocument(this.info);
    },
    /**
     * @this {GestureRecognizer}
     * @param {MouseEvent} e
     * @return {void}
     */
    mousedown: function (e) {
      if (!hasLeftMouseButton(e)) {
        return;
      }
      let t = _findOriginalTarget(e);
      let self = this;
      let movefn = function movefn2(e2) {
        if (!hasLeftMouseButton(e2)) {
          downupFire("up", t, e2);
          untrackDocument(self.info);
        }
      };
      let upfn = function upfn2(e2) {
        if (hasLeftMouseButton(e2)) {
          downupFire("up", t, e2);
        }
        untrackDocument(self.info);
      };
      trackDocument(this.info, movefn, upfn);
      downupFire("down", t, e);
    },
    /**
     * @this {GestureRecognizer}
     * @param {TouchEvent} e
     * @return {void}
     */
    touchstart: function (e) {
      downupFire("down", _findOriginalTarget(e), e.changedTouches[0], e);
    },
    /**
     * @this {GestureRecognizer}
     * @param {TouchEvent} e
     * @return {void}
     */
    touchend: function (e) {
      downupFire("up", _findOriginalTarget(e), e.changedTouches[0], e);
    },
  });
  function downupFire(type, target, event, preventer) {
    if (!target) {
      return;
    }
    _fire(target, type, {
      x: event.clientX,
      y: event.clientY,
      sourceEvent: event,
      preventer,
      prevent: function (e) {
        return prevent(e);
      },
    });
  }
  register2({
    name: "track",
    touchAction: "none",
    deps: ["mousedown", "touchstart", "touchmove", "touchend"],
    flow: {
      start: ["mousedown", "touchstart"],
      end: ["mouseup", "touchend"],
    },
    emits: ["track"],
    info: {
      x: 0,
      y: 0,
      state: "start",
      started: false,
      moves: [],
      /** @this {GestureInfo} */
      addMove: function (move) {
        if (this.moves.length > TRACK_LENGTH) {
          this.moves.shift();
        }
        this.moves.push(move);
      },
      movefn: null,
      upfn: null,
      prevent: false,
    },
    /**
     * @this {GestureRecognizer}
     * @return {void}
     */
    reset: function () {
      this.info.state = "start";
      this.info.started = false;
      this.info.moves = [];
      this.info.x = 0;
      this.info.y = 0;
      this.info.prevent = false;
      untrackDocument(this.info);
    },
    /**
     * @this {GestureRecognizer}
     * @param {MouseEvent} e
     * @return {void}
     */
    mousedown: function (e) {
      if (!hasLeftMouseButton(e)) {
        return;
      }
      let t = _findOriginalTarget(e);
      let self = this;
      let movefn = function movefn2(e2) {
        let x = e2.clientX,
          y = e2.clientY;
        if (trackHasMovedEnough(self.info, x, y)) {
          self.info.state = self.info.started
            ? e2.type === "mouseup"
              ? "end"
              : "track"
            : "start";
          if (self.info.state === "start") {
            prevent("tap");
          }
          self.info.addMove({ x, y });
          if (!hasLeftMouseButton(e2)) {
            self.info.state = "end";
            untrackDocument(self.info);
          }
          if (t) {
            trackFire(self.info, t, e2);
          }
          self.info.started = true;
        }
      };
      let upfn = function upfn2(e2) {
        if (self.info.started) {
          movefn(e2);
        }
        untrackDocument(self.info);
      };
      trackDocument(this.info, movefn, upfn);
      this.info.x = e.clientX;
      this.info.y = e.clientY;
    },
    /**
     * @this {GestureRecognizer}
     * @param {TouchEvent} e
     * @return {void}
     */
    touchstart: function (e) {
      let ct = e.changedTouches[0];
      this.info.x = ct.clientX;
      this.info.y = ct.clientY;
    },
    /**
     * @this {GestureRecognizer}
     * @param {TouchEvent} e
     * @return {void}
     */
    touchmove: function (e) {
      let t = _findOriginalTarget(e);
      let ct = e.changedTouches[0];
      let x = ct.clientX,
        y = ct.clientY;
      if (trackHasMovedEnough(this.info, x, y)) {
        if (this.info.state === "start") {
          prevent("tap");
        }
        this.info.addMove({ x, y });
        trackFire(this.info, t, ct);
        this.info.state = "track";
        this.info.started = true;
      }
    },
    /**
     * @this {GestureRecognizer}
     * @param {TouchEvent} e
     * @return {void}
     */
    touchend: function (e) {
      let t = _findOriginalTarget(e);
      let ct = e.changedTouches[0];
      if (this.info.started) {
        this.info.state = "end";
        this.info.addMove({ x: ct.clientX, y: ct.clientY });
        trackFire(this.info, t, ct);
      }
    },
  });
  function trackHasMovedEnough(info, x, y) {
    if (info.prevent) {
      return false;
    }
    if (info.started) {
      return true;
    }
    let dx = Math.abs(info.x - x);
    let dy = Math.abs(info.y - y);
    return dx >= TRACK_DISTANCE || dy >= TRACK_DISTANCE;
  }
  function trackFire(info, target, touch) {
    if (!target) {
      return;
    }
    let secondlast = info.moves[info.moves.length - 2];
    let lastmove = info.moves[info.moves.length - 1];
    let dx = lastmove.x - info.x;
    let dy = lastmove.y - info.y;
    let ddx,
      ddy = 0;
    if (secondlast) {
      ddx = lastmove.x - secondlast.x;
      ddy = lastmove.y - secondlast.y;
    }
    _fire(target, "track", {
      state: info.state,
      x: touch.clientX,
      y: touch.clientY,
      dx,
      dy,
      ddx,
      ddy,
      sourceEvent: touch,
      hover: function () {
        return deepTargetFind(touch.clientX, touch.clientY);
      },
    });
  }
  register2({
    name: "tap",
    deps: ["mousedown", "click", "touchstart", "touchend"],
    flow: {
      start: ["mousedown", "touchstart"],
      end: ["click", "touchend"],
    },
    emits: ["tap"],
    info: {
      x: NaN,
      y: NaN,
      prevent: false,
    },
    /**
     * @this {GestureRecognizer}
     * @return {void}
     */
    reset: function () {
      this.info.x = NaN;
      this.info.y = NaN;
      this.info.prevent = false;
    },
    /**
     * @this {GestureRecognizer}
     * @param {MouseEvent} e
     * @return {void}
     */
    mousedown: function (e) {
      if (hasLeftMouseButton(e)) {
        this.info.x = e.clientX;
        this.info.y = e.clientY;
      }
    },
    /**
     * @this {GestureRecognizer}
     * @param {MouseEvent} e
     * @return {void}
     */
    click: function (e) {
      if (hasLeftMouseButton(e)) {
        trackForward(this.info, e);
      }
    },
    /**
     * @this {GestureRecognizer}
     * @param {TouchEvent} e
     * @return {void}
     */
    touchstart: function (e) {
      const touch = e.changedTouches[0];
      this.info.x = touch.clientX;
      this.info.y = touch.clientY;
    },
    /**
     * @this {GestureRecognizer}
     * @param {TouchEvent} e
     * @return {void}
     */
    touchend: function (e) {
      trackForward(this.info, e.changedTouches[0], e);
    },
  });
  function trackForward(info, e, preventer) {
    let dx = Math.abs(e.clientX - info.x);
    let dy = Math.abs(e.clientY - info.y);
    let t = _findOriginalTarget(preventer || e);
    if (
      !t ||
      (canBeDisabled[
        /** @type {!HTMLElement} */
        t.localName
      ] &&
        t.hasAttribute("disabled"))
    ) {
      return;
    }
    if (
      isNaN(dx) ||
      isNaN(dy) ||
      (dx <= TAP_DISTANCE && dy <= TAP_DISTANCE) ||
      isSyntheticClick(e)
    ) {
      if (!info.prevent) {
        _fire(t, "tap", {
          x: e.clientX,
          y: e.clientY,
          sourceEvent: e,
          preventer,
        });
      }
    }
  }

  // node_modules/.pnpm/@polymer+polymer@3.5.1/node_modules/@polymer/polymer/lib/mixins/gesture-event-listeners.js
  var GestureEventListeners = dedupingMixin((superClass) => {
    class GestureEventListeners2 extends superClass {
      /**
       * Add the event listener to the node if it is a gestures event.
       *
       * @param {!EventTarget} node Node to add event listener to
       * @param {string} eventName Name of event
       * @param {function(!Event):void} handler Listener function to add
       * @return {void}
       * @override
       */
      _addEventListenerToNode(node, eventName, handler) {
        if (!addListener(node, eventName, handler)) {
          super._addEventListenerToNode(node, eventName, handler);
        }
      }
      /**
       * Remove the event listener to the node if it is a gestures event.
       *
       * @param {!EventTarget} node Node to remove event listener from
       * @param {string} eventName Name of event
       * @param {function(!Event):void} handler Listener function to remove
       * @return {void}
       * @override
       */
      _removeEventListenerFromNode(node, eventName, handler) {
        if (!removeListener(node, eventName, handler)) {
          super._removeEventListenerFromNode(node, eventName, handler);
        }
      }
    }
    return GestureEventListeners2;
  });

  // node_modules/.pnpm/@polymer+polymer@3.5.1/node_modules/@polymer/polymer/lib/mixins/dir-mixin.js
  var HOST_DIR = /:host\(:dir\((ltr|rtl)\)\)/g;
  var HOST_DIR_REPLACMENT = ':host([dir="$1"])';
  var EL_DIR = /([\s\w-#\.\[\]\*]*):dir\((ltr|rtl)\)/g;
  var EL_DIR_REPLACMENT = ':host([dir="$2"]) $1';
  var DIR_CHECK = /:dir\((?:ltr|rtl)\)/;
  var SHIM_SHADOW = Boolean(window["ShadyDOM"] && window["ShadyDOM"]["inUse"]);
  var DIR_INSTANCES = [];
  var observer = null;
  var documentDir = "";
  function getRTL() {
    documentDir = document.documentElement.getAttribute("dir");
  }
  function setRTL(instance) {
    if (!instance.__autoDirOptOut) {
      const el =
        /** @type {!HTMLElement} */
        instance;
      el.setAttribute("dir", documentDir);
    }
  }
  function updateDirection() {
    getRTL();
    documentDir = document.documentElement.getAttribute("dir");
    for (let i = 0; i < DIR_INSTANCES.length; i++) {
      setRTL(DIR_INSTANCES[i]);
    }
  }
  function takeRecords() {
    if (observer && observer.takeRecords().length) {
      updateDirection();
    }
  }
  var DirMixin = dedupingMixin((base) => {
    if (!SHIM_SHADOW) {
      if (!observer) {
        getRTL();
        observer = new MutationObserver(updateDirection);
        observer.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ["dir"],
        });
      }
    }
    const elementBase = PropertyAccessors(base);
    class Dir extends elementBase {
      /**
       * @param {string} cssText .
       * @param {string} baseURI .
       * @return {string} .
       * @suppress {missingProperties} Interfaces in closure do not inherit statics, but classes do
       * @nocollapse
       */
      static _processStyleText(cssText, baseURI) {
        cssText = elementBase._processStyleText.call(this, cssText, baseURI);
        if (!SHIM_SHADOW && DIR_CHECK.test(cssText)) {
          cssText = this._replaceDirInCssText(cssText);
          this.__activateDir = true;
        }
        return cssText;
      }
      /**
       * Replace `:dir` in the given CSS text
       *
       * @param {string} text CSS text to replace DIR
       * @return {string} Modified CSS
       * @nocollapse
       */
      static _replaceDirInCssText(text) {
        let replacedText = text;
        replacedText = replacedText.replace(HOST_DIR, HOST_DIR_REPLACMENT);
        replacedText = replacedText.replace(EL_DIR, EL_DIR_REPLACMENT);
        return replacedText;
      }
      constructor() {
        super();
        this.__autoDirOptOut = false;
      }
      /**
       * @override
       * @suppress {invalidCasts} Closure doesn't understand that `this` is an
       *     HTMLElement
       * @return {void}
       */
      ready() {
        super.ready();
        this.__autoDirOptOut =
          /** @type {!HTMLElement} */
          this.hasAttribute("dir");
      }
      /**
       * @override
       * @suppress {missingProperties} If it exists on elementBase, it can be
       *   super'd
       * @return {void}
       */
      connectedCallback() {
        if (elementBase.prototype.connectedCallback) {
          super.connectedCallback();
        }
        if (this.constructor.__activateDir) {
          takeRecords();
          DIR_INSTANCES.push(this);
          setRTL(this);
        }
      }
      /**
       * @override
       * @suppress {missingProperties} If it exists on elementBase, it can be
       *   super'd
       * @return {void}
       */
      disconnectedCallback() {
        if (elementBase.prototype.disconnectedCallback) {
          super.disconnectedCallback();
        }
        if (this.constructor.__activateDir) {
          const idx = DIR_INSTANCES.indexOf(this);
          if (idx > -1) {
            DIR_INSTANCES.splice(idx, 1);
          }
        }
      }
    }
    Dir.__activateDir = false;
    return Dir;
  });

  // node_modules/.pnpm/@polymer+polymer@3.5.1/node_modules/@polymer/polymer/lib/utils/render-status.js
  var scheduled = false;
  var beforeRenderQueue = [];
  var afterRenderQueue = [];
  function schedule() {
    scheduled = true;
    requestAnimationFrame(function () {
      scheduled = false;
      flushQueue(beforeRenderQueue);
      setTimeout(function () {
        runQueue(afterRenderQueue);
      });
    });
  }
  function flushQueue(queue) {
    while (queue.length) {
      callMethod(queue.shift());
    }
  }
  function runQueue(queue) {
    for (let i = 0, l = queue.length; i < l; i++) {
      callMethod(queue.shift());
    }
  }
  function callMethod(info) {
    const context = info[0];
    const callback = info[1];
    const args = info[2];
    try {
      callback.apply(context, args);
    } catch (e) {
      setTimeout(() => {
        throw e;
      });
    }
  }
  function afterNextRender(context, callback, args) {
    if (!scheduled) {
      schedule();
    }
    afterRenderQueue.push([context, callback, args]);
  }

  // node_modules/.pnpm/@polymer+polymer@3.5.1/node_modules/@polymer/polymer/lib/utils/unresolved.js
  function resolve() {
    document.body.removeAttribute("unresolved");
  }
  if (
    document.readyState === "interactive" ||
    document.readyState === "complete"
  ) {
    resolve();
  } else {
    window.addEventListener("DOMContentLoaded", resolve);
  }

  // node_modules/.pnpm/@polymer+polymer@3.5.1/node_modules/@polymer/polymer/lib/utils/array-splice.js
  function newSplice(index, removed, addedCount) {
    return {
      index,
      removed,
      addedCount,
    };
  }
  var EDIT_LEAVE = 0;
  var EDIT_UPDATE = 1;
  var EDIT_ADD = 2;
  var EDIT_DELETE = 3;
  function calcEditDistances(
    current,
    currentStart,
    currentEnd,
    old,
    oldStart,
    oldEnd
  ) {
    let rowCount = oldEnd - oldStart + 1;
    let columnCount = currentEnd - currentStart + 1;
    let distances = new Array(rowCount);
    for (let i = 0; i < rowCount; i++) {
      distances[i] = new Array(columnCount);
      distances[i][0] = i;
    }
    for (let j = 0; j < columnCount; j++) distances[0][j] = j;
    for (let i = 1; i < rowCount; i++) {
      for (let j = 1; j < columnCount; j++) {
        if (equals(current[currentStart + j - 1], old[oldStart + i - 1]))
          distances[i][j] = distances[i - 1][j - 1];
        else {
          let north = distances[i - 1][j] + 1;
          let west = distances[i][j - 1] + 1;
          distances[i][j] = north < west ? north : west;
        }
      }
    }
    return distances;
  }
  function spliceOperationsFromEditDistances(distances) {
    let i = distances.length - 1;
    let j = distances[0].length - 1;
    let current = distances[i][j];
    let edits = [];
    while (i > 0 || j > 0) {
      if (i == 0) {
        edits.push(EDIT_ADD);
        j--;
        continue;
      }
      if (j == 0) {
        edits.push(EDIT_DELETE);
        i--;
        continue;
      }
      let northWest = distances[i - 1][j - 1];
      let west = distances[i - 1][j];
      let north = distances[i][j - 1];
      let min;
      if (west < north) min = west < northWest ? west : northWest;
      else min = north < northWest ? north : northWest;
      if (min == northWest) {
        if (northWest == current) {
          edits.push(EDIT_LEAVE);
        } else {
          edits.push(EDIT_UPDATE);
          current = northWest;
        }
        i--;
        j--;
      } else if (min == west) {
        edits.push(EDIT_DELETE);
        i--;
        current = west;
      } else {
        edits.push(EDIT_ADD);
        j--;
        current = north;
      }
    }
    edits.reverse();
    return edits;
  }
  function calcSplices(
    current,
    currentStart,
    currentEnd,
    old,
    oldStart,
    oldEnd
  ) {
    let prefixCount = 0;
    let suffixCount = 0;
    let splice;
    let minLength = Math.min(currentEnd - currentStart, oldEnd - oldStart);
    if (currentStart == 0 && oldStart == 0)
      prefixCount = sharedPrefix(current, old, minLength);
    if (currentEnd == current.length && oldEnd == old.length)
      suffixCount = sharedSuffix(current, old, minLength - prefixCount);
    currentStart += prefixCount;
    oldStart += prefixCount;
    currentEnd -= suffixCount;
    oldEnd -= suffixCount;
    if (currentEnd - currentStart == 0 && oldEnd - oldStart == 0) return [];
    if (currentStart == currentEnd) {
      splice = newSplice(currentStart, [], 0);
      while (oldStart < oldEnd) splice.removed.push(old[oldStart++]);
      return [splice];
    } else if (oldStart == oldEnd)
      return [newSplice(currentStart, [], currentEnd - currentStart)];
    let ops = spliceOperationsFromEditDistances(
      calcEditDistances(
        current,
        currentStart,
        currentEnd,
        old,
        oldStart,
        oldEnd
      )
    );
    splice = void 0;
    let splices = [];
    let index = currentStart;
    let oldIndex = oldStart;
    for (let i = 0; i < ops.length; i++) {
      switch (ops[i]) {
        case EDIT_LEAVE:
          if (splice) {
            splices.push(splice);
            splice = void 0;
          }
          index++;
          oldIndex++;
          break;
        case EDIT_UPDATE:
          if (!splice) splice = newSplice(index, [], 0);
          splice.addedCount++;
          index++;
          splice.removed.push(old[oldIndex]);
          oldIndex++;
          break;
        case EDIT_ADD:
          if (!splice) splice = newSplice(index, [], 0);
          splice.addedCount++;
          index++;
          break;
        case EDIT_DELETE:
          if (!splice) splice = newSplice(index, [], 0);
          splice.removed.push(old[oldIndex]);
          oldIndex++;
          break;
      }
    }
    if (splice) {
      splices.push(splice);
    }
    return splices;
  }
  function sharedPrefix(current, old, searchLength) {
    for (let i = 0; i < searchLength; i++)
      if (!equals(current[i], old[i])) return i;
    return searchLength;
  }
  function sharedSuffix(current, old, searchLength) {
    let index1 = current.length;
    let index2 = old.length;
    let count = 0;
    while (count < searchLength && equals(current[--index1], old[--index2]))
      count++;
    return count;
  }
  function calculateSplices(current, previous) {
    return calcSplices(
      current,
      0,
      current.length,
      previous,
      0,
      previous.length
    );
  }
  function equals(currentValue, previousValue) {
    return currentValue === previousValue;
  }

  // node_modules/.pnpm/@polymer+polymer@3.5.1/node_modules/@polymer/polymer/lib/utils/flattened-nodes-observer.js
  function isSlot(node) {
    return node.localName === "slot";
  }
  var FlattenedNodesObserver = class {
    /**
     * Returns the list of flattened nodes for the given `node`.
     * This list consists of a node's children and, for any children
     * that are `<slot>` elements, the expanded flattened list of `assignedNodes`.
     * For example, if the observed node has children `<a></a><slot></slot><b></b>`
     * and the `<slot>` has one `<div>` assigned to it, then the flattened
     * nodes list is `<a></a><div></div><b></b>`. If the `<slot>` has other
     * `<slot>` elements assigned to it, these are flattened as well.
     *
     * @param {!HTMLElement|!HTMLSlotElement} node The node for which to
     *      return the list of flattened nodes.
     * @return {!Array<!Node>} The list of flattened nodes for the given `node`.
     * @nocollapse See https://github.com/google/closure-compiler/issues/2763
     */
    // eslint-disable-next-line
    static getFlattenedNodes(node) {
      const wrapped = wrap2(node);
      if (isSlot(node)) {
        node = /** @type {!HTMLSlotElement} */ node;
        return wrapped.assignedNodes({ flatten: true });
      } else {
        return Array.from(wrapped.childNodes)
          .map((node2) => {
            if (isSlot(node2)) {
              node2 = /** @type {!HTMLSlotElement} */ node2;
              return wrap2(node2).assignedNodes({ flatten: true });
            } else {
              return [node2];
            }
          })
          .reduce((a, b) => a.concat(b), []);
      }
    }
    /**
     * @param {!HTMLElement} target Node on which to listen for changes.
     * @param {?function(this: Element, { target: !HTMLElement, addedNodes: !Array<!Element>, removedNodes: !Array<!Element> }):void} callback Function called when there are additions
     * or removals from the target's list of flattened nodes.
     */
    // eslint-disable-next-line
    constructor(target, callback) {
      this._shadyChildrenObserver = null;
      this._nativeChildrenObserver = null;
      this._connected = false;
      this._target = target;
      this.callback = callback;
      this._effectiveNodes = [];
      this._observer = null;
      this._scheduled = false;
      this._boundSchedule = () => {
        this._schedule();
      };
      this.connect();
      this._schedule();
    }
    /**
     * Activates an observer. This method is automatically called when
     * a `FlattenedNodesObserver` is created. It should only be called to
     * re-activate an observer that has been deactivated via the `disconnect` method.
     *
     * @return {void}
     */
    connect() {
      if (isSlot(this._target)) {
        this._listenSlots([this._target]);
      } else if (wrap2(this._target).children) {
        this._listenSlots(
          /** @type {!NodeList<!Node>} */
          wrap2(this._target).children
        );
        if (window.ShadyDOM) {
          this._shadyChildrenObserver = window.ShadyDOM.observeChildren(
            this._target,
            (mutations) => {
              this._processMutations(mutations);
            }
          );
        } else {
          this._nativeChildrenObserver = new MutationObserver((mutations) => {
            this._processMutations(mutations);
          });
          this._nativeChildrenObserver.observe(this._target, {
            childList: true,
          });
        }
      }
      this._connected = true;
    }
    /**
     * Deactivates the flattened nodes observer. After calling this method
     * the observer callback will not be called when changes to flattened nodes
     * occur. The `connect` method may be subsequently called to reactivate
     * the observer.
     *
     * @return {void}
     * @override
     */
    disconnect() {
      if (isSlot(this._target)) {
        this._unlistenSlots([this._target]);
      } else if (wrap2(this._target).children) {
        this._unlistenSlots(
          /** @type {!NodeList<!Node>} */
          wrap2(this._target).children
        );
        if (window.ShadyDOM && this._shadyChildrenObserver) {
          window.ShadyDOM.unobserveChildren(this._shadyChildrenObserver);
          this._shadyChildrenObserver = null;
        } else if (this._nativeChildrenObserver) {
          this._nativeChildrenObserver.disconnect();
          this._nativeChildrenObserver = null;
        }
      }
      this._connected = false;
    }
    /**
     * @return {void}
     * @private
     */
    _schedule() {
      if (!this._scheduled) {
        this._scheduled = true;
        microTask.run(() => this.flush());
      }
    }
    /**
     * @param {Array<MutationRecord>} mutations Mutations signaled by the mutation observer
     * @return {void}
     * @private
     */
    _processMutations(mutations) {
      this._processSlotMutations(mutations);
      this.flush();
    }
    /**
     * @param {Array<MutationRecord>} mutations Mutations signaled by the mutation observer
     * @return {void}
     * @private
     */
    _processSlotMutations(mutations) {
      if (mutations) {
        for (let i = 0; i < mutations.length; i++) {
          let mutation = mutations[i];
          if (mutation.addedNodes) {
            this._listenSlots(mutation.addedNodes);
          }
          if (mutation.removedNodes) {
            this._unlistenSlots(mutation.removedNodes);
          }
        }
      }
    }
    /**
     * Flushes the observer causing any pending changes to be immediately
     * delivered the observer callback. By default these changes are delivered
     * asynchronously at the next microtask checkpoint.
     *
     * @return {boolean} Returns true if any pending changes caused the observer
     * callback to run.
     */
    flush() {
      if (!this._connected) {
        return false;
      }
      if (window.ShadyDOM) {
        ShadyDOM.flush();
      }
      if (this._nativeChildrenObserver) {
        this._processSlotMutations(this._nativeChildrenObserver.takeRecords());
      } else if (this._shadyChildrenObserver) {
        this._processSlotMutations(this._shadyChildrenObserver.takeRecords());
      }
      this._scheduled = false;
      let info = {
        target: this._target,
        addedNodes: [],
        removedNodes: [],
      };
      let newNodes = this.constructor.getFlattenedNodes(this._target);
      let splices = calculateSplices(newNodes, this._effectiveNodes);
      for (let i = 0, s; i < splices.length && (s = splices[i]); i++) {
        for (let j = 0, n; j < s.removed.length && (n = s.removed[j]); j++) {
          info.removedNodes.push(n);
        }
      }
      for (let i = 0, s; i < splices.length && (s = splices[i]); i++) {
        for (let j = s.index; j < s.index + s.addedCount; j++) {
          info.addedNodes.push(newNodes[j]);
        }
      }
      this._effectiveNodes = newNodes;
      let didFlush = false;
      if (info.addedNodes.length || info.removedNodes.length) {
        didFlush = true;
        this.callback.call(this._target, info);
      }
      return didFlush;
    }
    /**
     * @param {!Array<!Node>|!NodeList<!Node>} nodeList Nodes that could change
     * @return {void}
     * @private
     */
    _listenSlots(nodeList) {
      for (let i = 0; i < nodeList.length; i++) {
        let n = nodeList[i];
        if (isSlot(n)) {
          n.addEventListener("slotchange", this._boundSchedule);
        }
      }
    }
    /**
     * @param {!Array<!Node>|!NodeList<!Node>} nodeList Nodes that could change
     * @return {void}
     * @private
     */
    _unlistenSlots(nodeList) {
      for (let i = 0; i < nodeList.length; i++) {
        let n = nodeList[i];
        if (isSlot(n)) {
          n.removeEventListener("slotchange", this._boundSchedule);
        }
      }
    }
  };

  // node_modules/.pnpm/@polymer+polymer@3.5.1/node_modules/@polymer/polymer/lib/utils/flush.js
  var flush = function () {
    let shadyDOM, debouncers;
    do {
      shadyDOM = window.ShadyDOM && ShadyDOM.flush();
      if (window.ShadyCSS && window.ShadyCSS.ScopingShim) {
        window.ShadyCSS.ScopingShim.flush();
      }
      debouncers = flushDebouncers();
    } while (shadyDOM || debouncers);
  };

  // node_modules/.pnpm/@polymer+polymer@3.5.1/node_modules/@polymer/polymer/lib/legacy/polymer.dom.js
  var p = Element.prototype;
  var normalizedMatchesSelector =
    p.matches ||
    p.matchesSelector ||
    p.mozMatchesSelector ||
    p.msMatchesSelector ||
    p.oMatchesSelector ||
    p.webkitMatchesSelector;
  var matchesSelector = function (node, selector) {
    return normalizedMatchesSelector.call(node, selector);
  };
  var DomApiNative = class {
    /**
     * @param {!Node} node Node for which to create a Polymer.dom helper object.
     */
    constructor(node) {
      if (window["ShadyDOM"] && window["ShadyDOM"]["inUse"]) {
        window["ShadyDOM"]["patch"](node);
      }
      this.node = node;
    }
    /**
     * Returns an instance of `FlattenedNodesObserver` that
     * listens for node changes on this element.
     *
     * @param {function(this:HTMLElement, { target: !HTMLElement, addedNodes: !Array<!Element>, removedNodes: !Array<!Element> }):void} callback Called when direct or distributed children
     *   of this element changes
     * @return {!PolymerDomApi.ObserveHandle} Observer instance
     * @override
     */
    observeNodes(callback) {
      return new FlattenedNodesObserver(
        /** @type {!HTMLElement} */
        this.node,
        callback
      );
    }
    /**
     * Disconnects an observer previously created via `observeNodes`
     *
     * @param {!PolymerDomApi.ObserveHandle} observerHandle Observer instance
     *   to disconnect.
     * @return {void}
     * @override
     */
    unobserveNodes(observerHandle) {
      observerHandle.disconnect();
    }
    /**
     * Provided as a backwards-compatible API only.  This method does nothing.
     * @return {void}
     */
    notifyObserver() {}
    /**
     * Returns true if the provided node is contained with this element's
     * light-DOM children or shadow root, including any nested shadow roots
     * of children therein.
     *
     * @param {Node} node Node to test
     * @return {boolean} Returns true if the given `node` is contained within
     *   this element's light or shadow DOM.
     * @override
     */
    deepContains(node) {
      if (wrap2(this.node).contains(node)) {
        return true;
      }
      let n = node;
      let doc = node.ownerDocument;
      while (n && n !== doc && n !== this.node) {
        n = wrap2(n).parentNode || wrap2(n).host;
      }
      return n === this.node;
    }
    /**
     * Returns the root node of this node.  Equivalent to `getRootNode()`.
     *
     * @return {!Node} Top most element in the dom tree in which the node
     * exists. If the node is connected to a document this is either a
     * shadowRoot or the document; otherwise, it may be the node
     * itself or a node or document fragment containing it.
     * @override
     */
    getOwnerRoot() {
      return wrap2(this.node).getRootNode();
    }
    /**
     * For slot elements, returns the nodes assigned to the slot; otherwise
     * an empty array. It is equivalent to `<slot>.addignedNodes({flatten:true})`.
     *
     * @return {!Array<!Node>} Array of assigned nodes
     * @override
     */
    getDistributedNodes() {
      return this.node.localName === "slot"
        ? wrap2(this.node).assignedNodes({ flatten: true })
        : [];
    }
    /**
     * Returns an array of all slots this element was distributed to.
     *
     * @return {!Array<!HTMLSlotElement>} Description
     * @override
     */
    getDestinationInsertionPoints() {
      let ip$ = [];
      let n = wrap2(this.node).assignedSlot;
      while (n) {
        ip$.push(n);
        n = wrap2(n).assignedSlot;
      }
      return ip$;
    }
    /**
     * Calls `importNode` on the `ownerDocument` for this node.
     *
     * @param {!Node} node Node to import
     * @param {boolean} deep True if the node should be cloned deeply during
     *   import
     * @return {Node} Clone of given node imported to this owner document
     */
    importNode(node, deep) {
      let doc =
        this.node instanceof Document ? this.node : this.node.ownerDocument;
      return wrap2(doc).importNode(node, deep);
    }
    /**
     * @return {!Array<!Node>} Returns a flattened list of all child nodes and
     * nodes assigned to child slots.
     * @override
     */
    getEffectiveChildNodes() {
      return FlattenedNodesObserver.getFlattenedNodes(
        /** @type {!HTMLElement} */
        this.node
      );
    }
    /**
     * Returns a filtered list of flattened child elements for this element based
     * on the given selector.
     *
     * @param {string} selector Selector to filter nodes against
     * @return {!Array<!HTMLElement>} List of flattened child elements
     * @override
     */
    queryDistributedElements(selector) {
      let c$ = this.getEffectiveChildNodes();
      let list = [];
      for (let i = 0, l = c$.length, c; i < l && (c = c$[i]); i++) {
        if (c.nodeType === Node.ELEMENT_NODE && matchesSelector(c, selector)) {
          list.push(c);
        }
      }
      return list;
    }
    /**
     * For shadow roots, returns the currently focused element within this
     * shadow root.
     *
     * return {Node|undefined} Currently focused element
     * @override
     */
    get activeElement() {
      let node = this.node;
      return node._activeElement !== void 0
        ? node._activeElement
        : node.activeElement;
    }
  };
  function forwardMethods(proto2, methods) {
    for (let i = 0; i < methods.length; i++) {
      let method = methods[i];
      proto2[method] =
        /** @this {DomApiNative} */
        function () {
          return this.node[method].apply(this.node, arguments);
        };
    }
  }
  function forwardReadOnlyProperties(proto2, properties) {
    for (let i = 0; i < properties.length; i++) {
      let name = properties[i];
      Object.defineProperty(proto2, name, {
        get: function () {
          const domApi =
            /** @type {DomApiNative} */
            this;
          return domApi.node[name];
        },
        configurable: true,
      });
    }
  }
  function forwardProperties(proto2, properties) {
    for (let i = 0; i < properties.length; i++) {
      let name = properties[i];
      Object.defineProperty(proto2, name, {
        /**
         * @this {DomApiNative}
         * @return {*} .
         */
        get: function () {
          return this.node[name];
        },
        /**
         * @this {DomApiNative}
         * @param {*} value .
         */
        set: function (value) {
          this.node[name] = value;
        },
        configurable: true,
      });
    }
  }
  var EventApi = class {
    constructor(event) {
      this.event = event;
    }
    /**
     * Returns the first node on the `composedPath` of this event.
     *
     * @return {!EventTarget} The node this event was dispatched to
     */
    get rootTarget() {
      return this.path[0];
    }
    /**
     * Returns the local (re-targeted) target for this event.
     *
     * @return {!EventTarget} The local (re-targeted) target for this event.
     */
    get localTarget() {
      return this.event.target;
    }
    /**
     * Returns the `composedPath` for this event.
     * @return {!Array<!EventTarget>} The nodes this event propagated through
     */
    get path() {
      return this.event.composedPath();
    }
  };
  DomApiNative.prototype.cloneNode;
  DomApiNative.prototype.appendChild;
  DomApiNative.prototype.insertBefore;
  DomApiNative.prototype.removeChild;
  DomApiNative.prototype.replaceChild;
  DomApiNative.prototype.setAttribute;
  DomApiNative.prototype.removeAttribute;
  DomApiNative.prototype.querySelector;
  DomApiNative.prototype.querySelectorAll;
  DomApiNative.prototype.parentNode;
  DomApiNative.prototype.firstChild;
  DomApiNative.prototype.lastChild;
  DomApiNative.prototype.nextSibling;
  DomApiNative.prototype.previousSibling;
  DomApiNative.prototype.firstElementChild;
  DomApiNative.prototype.lastElementChild;
  DomApiNative.prototype.nextElementSibling;
  DomApiNative.prototype.previousElementSibling;
  DomApiNative.prototype.childNodes;
  DomApiNative.prototype.children;
  DomApiNative.prototype.classList;
  DomApiNative.prototype.textContent;
  DomApiNative.prototype.innerHTML;
  var DomApiImpl = DomApiNative;
  if (
    window["ShadyDOM"] &&
    window["ShadyDOM"]["inUse"] &&
    window["ShadyDOM"]["noPatch"] &&
    window["ShadyDOM"]["Wrapper"]
  ) {
    class Wrapper extends window["ShadyDOM"]["Wrapper"] {}
    Object.getOwnPropertyNames(DomApiNative.prototype).forEach((prop) => {
      if (prop != "activeElement") {
        Wrapper.prototype[prop] = DomApiNative.prototype[prop];
      }
    });
    forwardReadOnlyProperties(Wrapper.prototype, ["classList"]);
    DomApiImpl = Wrapper;
    Object.defineProperties(EventApi.prototype, {
      // Returns the "lowest" node in the same root as the event's currentTarget.
      // When in `noPatch` mode, this must be calculated by walking the event's
      // path.
      localTarget: {
        get() {
          const current = this.event.currentTarget;
          const currentRoot = current && dom(current).getOwnerRoot();
          const p$ = this.path;
          for (let i = 0; i < p$.length; i++) {
            const e = p$[i];
            if (dom(e).getOwnerRoot() === currentRoot) {
              return e;
            }
          }
        },
        configurable: true,
      },
      path: {
        get() {
          return window["ShadyDOM"]["composedPath"](this.event);
        },
        configurable: true,
      },
    });
  } else {
    forwardMethods(DomApiNative.prototype, [
      "cloneNode",
      "appendChild",
      "insertBefore",
      "removeChild",
      "replaceChild",
      "setAttribute",
      "removeAttribute",
      "querySelector",
      "querySelectorAll",
      "attachShadow",
    ]);
    forwardReadOnlyProperties(DomApiNative.prototype, [
      "parentNode",
      "firstChild",
      "lastChild",
      "nextSibling",
      "previousSibling",
      "firstElementChild",
      "lastElementChild",
      "nextElementSibling",
      "previousElementSibling",
      "childNodes",
      "children",
      "classList",
      "shadowRoot",
    ]);
    forwardProperties(DomApiNative.prototype, [
      "textContent",
      "innerHTML",
      "className",
    ]);
  }
  var dom = function (obj) {
    obj = obj || document;
    if (obj instanceof DomApiImpl) {
      return (
        /** @type {!DomApi} */
        obj
      );
    }
    if (obj instanceof EventApi) {
      return (
        /** @type {!EventApi} */
        obj
      );
    }
    let helper = obj["__domApi"];
    if (!helper) {
      if (obj instanceof Event) {
        helper = new EventApi(obj);
      } else {
        helper = new DomApiImpl(
          /** @type {Node} */
          obj
        );
      }
      obj["__domApi"] = helper;
    }
    return helper;
  };

  // node_modules/.pnpm/@polymer+polymer@3.5.1/node_modules/@polymer/polymer/lib/utils/scope-subtree.js
  var ShadyDOM2 = window.ShadyDOM;
  var ShadyCSS = window.ShadyCSS;
  function sameScope(node, scope) {
    return wrap2(node).getRootNode() === scope;
  }
  function scopeSubtree(container, shouldObserve = false) {
    if (!ShadyDOM2 || !ShadyCSS) {
      return null;
    }
    if (!ShadyDOM2["handlesDynamicScoping"]) {
      return null;
    }
    const ScopingShim = ShadyCSS["ScopingShim"];
    if (!ScopingShim) {
      return null;
    }
    const containerScope = ScopingShim["scopeForNode"](container);
    const root2 = wrap2(container).getRootNode();
    const scopify = (node) => {
      if (!sameScope(node, root2)) {
        return;
      }
      const elements = Array.from(
        ShadyDOM2["nativeMethods"]["querySelectorAll"].call(node, "*")
      );
      elements.push(node);
      for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        if (!sameScope(el, root2)) {
          continue;
        }
        const currentScope = ScopingShim["currentScopeForNode"](el);
        if (currentScope !== containerScope) {
          if (currentScope !== "") {
            ScopingShim["unscopeNode"](el, currentScope);
          }
          ScopingShim["scopeNode"](el, containerScope);
        }
      }
    };
    scopify(container);
    if (shouldObserve) {
      const mo = new MutationObserver((mxns) => {
        for (let i = 0; i < mxns.length; i++) {
          const mxn = mxns[i];
          for (let j = 0; j < mxn.addedNodes.length; j++) {
            const addedNode = mxn.addedNodes[j];
            if (addedNode.nodeType === Node.ELEMENT_NODE) {
              scopify(addedNode);
            }
          }
        }
      });
      mo.observe(container, { childList: true, subtree: true });
      return mo;
    } else {
      return null;
    }
  }

  // node_modules/.pnpm/@polymer+polymer@3.5.1/node_modules/@polymer/polymer/lib/mixins/disable-upgrade-mixin.js
  var DISABLED_ATTR = "disable-upgrade";
  var findObservedAttributesGetter = (ctor) => {
    while (ctor) {
      const desc = Object.getOwnPropertyDescriptor(ctor, "observedAttributes");
      if (desc) {
        return desc.get;
      }
      ctor = Object.getPrototypeOf(ctor.prototype).constructor;
    }
    return () => [];
  };
  var DisableUpgradeMixin = dedupingMixin((base) => {
    const superClass = ElementMixin(base);
    let observedAttributesGetter = findObservedAttributesGetter(superClass);
    class DisableUpgradeClass extends superClass {
      constructor() {
        super();
        this.__isUpgradeDisabled;
      }
      static get observedAttributes() {
        return observedAttributesGetter.call(this).concat(DISABLED_ATTR);
      }
      // Prevent element from initializing properties when it's upgrade disabled.
      /** @override */
      _initializeProperties() {
        if (this.hasAttribute(DISABLED_ATTR)) {
          this.__isUpgradeDisabled = true;
        } else {
          super._initializeProperties();
        }
      }
      // Prevent element from enabling properties when it's upgrade disabled.
      // Normally overriding connectedCallback would be enough, but dom-* elements
      /** @override */
      _enableProperties() {
        if (!this.__isUpgradeDisabled) {
          super._enableProperties();
        }
      }
      // If the element starts upgrade-disabled and a property is set for
      // which an accessor exists, the default should not be applied.
      // This additional check is needed because defaults are applied via
      // `_initializeProperties` which is called after initial properties
      // have been set when the element starts upgrade-disabled.
      /** @override */
      _canApplyPropertyDefault(property) {
        return (
          super._canApplyPropertyDefault(property) &&
          !(this.__isUpgradeDisabled && this._isPropertyPending(property))
        );
      }
      /**
       * @override
       * @param {string} name Attribute name.
       * @param {?string} old The previous value for the attribute.
       * @param {?string} value The new value for the attribute.
       * @param {?string} namespace The XML namespace for the attribute.
       * @return {void}
       */
      attributeChangedCallback(name, old, value, namespace) {
        if (name == DISABLED_ATTR) {
          if (this.__isUpgradeDisabled && value == null) {
            super._initializeProperties();
            this.__isUpgradeDisabled = false;
            if (wrap2(this).isConnected) {
              super.connectedCallback();
            }
          }
        } else {
          super.attributeChangedCallback(
            name,
            old,
            value,
            /** @type {null|string} */
            namespace
          );
        }
      }
      // Prevent element from connecting when it's upgrade disabled.
      // This prevents user code in `attached` from being called.
      /** @override */
      connectedCallback() {
        if (!this.__isUpgradeDisabled) {
          super.connectedCallback();
        }
      }
      // Prevent element from disconnecting when it's upgrade disabled.
      // This avoids allowing user code `detached` from being called without a
      // paired call to `attached`.
      /** @override */
      disconnectedCallback() {
        if (!this.__isUpgradeDisabled) {
          super.disconnectedCallback();
        }
      }
    }
    return DisableUpgradeClass;
  });

  // node_modules/.pnpm/@polymer+polymer@3.5.1/node_modules/@polymer/polymer/lib/legacy/legacy-element-mixin.js
  var DISABLED_ATTR2 = "disable-upgrade";
  var styleInterface = window.ShadyCSS;
  var LegacyElementMixin = dedupingMixin((base) => {
    const GesturesElement = GestureEventListeners(ElementMixin(base));
    const legacyElementBase = builtCSS
      ? GesturesElement
      : DirMixin(GesturesElement);
    const observedAttributesGetter =
      findObservedAttributesGetter(legacyElementBase);
    const DIRECTION_MAP = {
      x: "pan-x",
      y: "pan-y",
      none: "none",
      all: "auto",
    };
    class LegacyElement2 extends legacyElementBase {
      constructor() {
        super();
        this.isAttached;
        this.__boundListeners;
        this._debouncers;
        this.__isUpgradeDisabled;
        this.__needsAttributesAtConnected;
        this._legacyForceObservedAttributes;
      }
      /**
       * Forwards `importMeta` from the prototype (i.e. from the info object
       * passed to `Polymer({...})`) to the static API.
       *
       * @return {!Object} The `import.meta` object set on the prototype
       * @suppress {missingProperties} `this` is always in the instance in
       *  closure for some reason even in a static method, rather than the class
       * @nocollapse
       */
      static get importMeta() {
        return this.prototype.importMeta;
      }
      /**
       * Legacy callback called during the `constructor`, for overriding
       * by the user.
       * @override
       * @return {void}
       */
      created() {}
      /**
       * Processes an attribute reaction when the `legacyNoObservedAttributes`
       * setting is in use.
       * @param {string} name Name of attribute that changed
       * @param {?string} old Old attribute value
       * @param {?string} value New attribute value
       * @return {void}
       */
      __attributeReaction(name, old, value) {
        if (
          (this.__dataAttributes && this.__dataAttributes[name]) ||
          name === DISABLED_ATTR2
        ) {
          this.attributeChangedCallback(name, old, value, null);
        }
      }
      /**
       * Sets the value of an attribute.
       * @override
       */
      setAttribute(name, value) {
        if (
          legacyNoObservedAttributes &&
          !this._legacyForceObservedAttributes
        ) {
          const oldValue = this.getAttribute(name);
          super.setAttribute(name, value);
          this.__attributeReaction(name, oldValue, String(value));
        } else {
          super.setAttribute(name, value);
        }
      }
      /**
       * Removes an attribute.
       * @override
       */
      removeAttribute(name) {
        if (
          legacyNoObservedAttributes &&
          !this._legacyForceObservedAttributes
        ) {
          const oldValue = this.getAttribute(name);
          super.removeAttribute(name);
          this.__attributeReaction(name, oldValue, null);
        } else {
          super.removeAttribute(name);
        }
      }
      // NOTE: Inlined for perf from version of DisableUpgradeMixin.
      static get observedAttributes() {
        if (
          legacyNoObservedAttributes &&
          !this.prototype._legacyForceObservedAttributes
        ) {
          if (
            !this.hasOwnProperty(
              JSCompiler_renameProperty("__observedAttributes", this)
            )
          ) {
            this.__observedAttributes = [];
            register(this.prototype);
          }
          return this.__observedAttributes;
        } else {
          return observedAttributesGetter.call(this).concat(DISABLED_ATTR2);
        }
      }
      // NOTE: Inlined for perf from version of DisableUpgradeMixin.
      // Prevent element from enabling properties when it's upgrade disabled.
      // Normally overriding connectedCallback would be enough, but dom-* elements
      /** @override */
      _enableProperties() {
        if (!this.__isUpgradeDisabled) {
          super._enableProperties();
        }
      }
      // NOTE: Inlined for perf from version of DisableUpgradeMixin.
      // If the element starts upgrade-disabled and a property is set for
      // which an accessor exists, the default should not be applied.
      // This additional check is needed because defaults are applied via
      // `_initializeProperties` which is called after initial properties
      // have been set when the element starts upgrade-disabled.
      /** @override */
      _canApplyPropertyDefault(property) {
        return (
          super._canApplyPropertyDefault(property) &&
          !(this.__isUpgradeDisabled && this._isPropertyPending(property))
        );
      }
      /**
       * Provides an implementation of `connectedCallback`
       * which adds Polymer legacy API's `attached` method.
       * @return {void}
       * @override
       */
      connectedCallback() {
        if (this.__needsAttributesAtConnected) {
          this._takeAttributes();
        }
        if (!this.__isUpgradeDisabled) {
          super.connectedCallback();
          this.isAttached = true;
          this.attached();
        }
      }
      /**
       * Legacy callback called during `connectedCallback`, for overriding
       * by the user.
       * @override
       * @return {void}
       */
      attached() {}
      /**
       * Provides an implementation of `disconnectedCallback`
       * which adds Polymer legacy API's `detached` method.
       * @return {void}
       * @override
       */
      disconnectedCallback() {
        if (!this.__isUpgradeDisabled) {
          super.disconnectedCallback();
          this.isAttached = false;
          this.detached();
        }
      }
      /**
       * Legacy callback called during `disconnectedCallback`, for overriding
       * by the user.
       * @override
       * @return {void}
       */
      detached() {}
      /**
       * Provides an override implementation of `attributeChangedCallback`
       * which adds the Polymer legacy API's `attributeChanged` method.
       * @param {string} name Name of attribute.
       * @param {?string} old Old value of attribute.
       * @param {?string} value Current value of attribute.
       * @param {?string} namespace Attribute namespace.
       * @return {void}
       * @override
       */
      attributeChangedCallback(name, old, value, namespace) {
        if (old !== value) {
          if (name == DISABLED_ATTR2) {
            if (this.__isUpgradeDisabled && value == null) {
              this._initializeProperties();
              this.__isUpgradeDisabled = false;
              if (wrap2(this).isConnected) {
                this.connectedCallback();
              }
            }
          } else {
            super.attributeChangedCallback(name, old, value, namespace);
            this.attributeChanged(name, old, value);
          }
        }
      }
      /**
       * Legacy callback called during `attributeChangedChallback`, for overriding
       * by the user.
       * @param {string} name Name of attribute.
       * @param {?string} old Old value of attribute.
       * @param {?string} value Current value of attribute.
       * @return {void}
       * @override
       */
      attributeChanged(name, old, value) {}
      // eslint-disable-line no-unused-vars
      /**
       * Overrides the default `Polymer.PropertyEffects` implementation to
       * add support for class initialization via the `_registered` callback.
       * This is called only when the first instance of the element is created.
       *
       * @return {void}
       * @override
       * @suppress {invalidCasts}
       */
      _initializeProperties() {
        if (legacyOptimizations && this.hasAttribute(DISABLED_ATTR2)) {
          this.__isUpgradeDisabled = true;
        } else {
          let proto2 = Object.getPrototypeOf(this);
          if (
            !proto2.hasOwnProperty(
              JSCompiler_renameProperty("__hasRegisterFinished", proto2)
            )
          ) {
            this._registered();
            proto2.__hasRegisterFinished = true;
          }
          super._initializeProperties();
          this.root = /** @type {HTMLElement} */ this;
          this.created();
          if (
            legacyNoObservedAttributes &&
            !this._legacyForceObservedAttributes
          ) {
            if (this.hasAttributes()) {
              this._takeAttributes();
            } else if (!this.parentNode) {
              this.__needsAttributesAtConnected = true;
            }
          }
          this._applyListeners();
        }
      }
      _takeAttributes() {
        const a = this.attributes;
        for (let i = 0, l = a.length; i < l; i++) {
          const attr2 = a[i];
          this.__attributeReaction(attr2.name, null, attr2.value);
        }
      }
      /**
       * Called automatically when an element is initializing.
       * Users may override this method to perform class registration time
       * work. The implementation should ensure the work is performed
       * only once for the class.
       * @protected
       * @return {void}
       * @override
       */
      _registered() {}
      /**
       * Overrides the default `Polymer.PropertyEffects` implementation to
       * add support for installing `hostAttributes` and `listeners`.
       *
       * @return {void}
       * @override
       */
      ready() {
        this._ensureAttributes();
        super.ready();
      }
      /**
       * Ensures an element has required attributes. Called when the element
       * is being readied via `ready`. Users should override to set the
       * element's required attributes. The implementation should be sure
       * to check and not override existing attributes added by
       * the user of the element. Typically, setting attributes should be left
       * to the element user and not done here; reasonable exceptions include
       * setting aria roles and focusability.
       * @protected
       * @return {void}
       * @override
       */
      _ensureAttributes() {}
      /**
       * Adds element event listeners. Called when the element
       * is being readied via `ready`. Users should override to
       * add any required element event listeners.
       * In performance critical elements, the work done here should be kept
       * to a minimum since it is done before the element is rendered. In
       * these elements, consider adding listeners asynchronously so as not to
       * block render.
       * @protected
       * @return {void}
       * @override
       */
      _applyListeners() {}
      /**
       * Converts a typed JavaScript value to a string.
       *
       * Note this method is provided as backward-compatible legacy API
       * only.  It is not directly called by any Polymer features. To customize
       * how properties are serialized to attributes for attribute bindings and
       * `reflectToAttribute: true` properties as well as this method, override
       * the `_serializeValue` method provided by `Polymer.PropertyAccessors`.
       *
       * @param {*} value Value to deserialize
       * @return {string | undefined} Serialized value
       * @override
       */
      serialize(value) {
        return this._serializeValue(value);
      }
      /**
       * Converts a string to a typed JavaScript value.
       *
       * Note this method is provided as backward-compatible legacy API
       * only.  It is not directly called by any Polymer features.  To customize
       * how attributes are deserialized to properties for in
       * `attributeChangedCallback`, override `_deserializeValue` method
       * provided by `Polymer.PropertyAccessors`.
       *
       * @param {string} value String to deserialize
       * @param {*} type Type to deserialize the string to
       * @return {*} Returns the deserialized value in the `type` given.
       * @override
       */
      deserialize(value, type) {
        return this._deserializeValue(value, type);
      }
      /**
       * Serializes a property to its associated attribute.
       *
       * Note this method is provided as backward-compatible legacy API
       * only.  It is not directly called by any Polymer features.
       *
       * @param {string} property Property name to reflect.
       * @param {string=} attribute Attribute name to reflect.
       * @param {*=} value Property value to reflect.
       * @return {void}
       * @override
       */
      reflectPropertyToAttribute(property, attribute, value) {
        this._propertyToAttribute(property, attribute, value);
      }
      /**
       * Sets a typed value to an HTML attribute on a node.
       *
       * Note this method is provided as backward-compatible legacy API
       * only.  It is not directly called by any Polymer features.
       *
       * @param {*} value Value to serialize.
       * @param {string} attribute Attribute name to serialize to.
       * @param {Element} node Element to set attribute to.
       * @return {void}
       * @override
       */
      serializeValueToAttribute(value, attribute, node) {
        this._valueToNodeAttribute(
          /** @type {Element} */
          node || this,
          value,
          attribute
        );
      }
      /**
       * Copies own properties (including accessor descriptors) from a source
       * object to a target object.
       *
       * @param {Object} prototype Target object to copy properties to.
       * @param {Object} api Source object to copy properties from.
       * @return {Object} prototype object that was passed as first argument.
       * @override
       */
      extend(prototype, api) {
        if (!(prototype && api)) {
          return prototype || api;
        }
        let n$ = Object.getOwnPropertyNames(api);
        for (let i = 0, n; i < n$.length && (n = n$[i]); i++) {
          let pd = Object.getOwnPropertyDescriptor(api, n);
          if (pd) {
            Object.defineProperty(prototype, n, pd);
          }
        }
        return prototype;
      }
      /**
       * Copies props from a source object to a target object.
       *
       * Note, this method uses a simple `for...in` strategy for enumerating
       * properties.  To ensure only `ownProperties` are copied from source
       * to target and that accessor implementations are copied, use `extend`.
       *
       * @param {!Object} target Target object to copy properties to.
       * @param {!Object} source Source object to copy properties from.
       * @return {!Object} Target object that was passed as first argument.
       * @override
       */
      mixin(target, source) {
        for (let i in source) {
          target[i] = source[i];
        }
        return target;
      }
      /**
       * Sets the prototype of an object.
       *
       * Note this method is provided as backward-compatible legacy API
       * only.  It is not directly called by any Polymer features.
       * @param {Object} object The object on which to set the prototype.
       * @param {Object} prototype The prototype that will be set on the given
       * `object`.
       * @return {Object} Returns the given `object` with its prototype set
       * to the given `prototype` object.
       * @override
       */
      chainObject(object, prototype) {
        if (object && prototype && object !== prototype) {
          object.__proto__ = prototype;
        }
        return object;
      }
      /* **** Begin Template **** */
      /**
       * Calls `importNode` on the `content` of the `template` specified and
       * returns a document fragment containing the imported content.
       *
       * @param {HTMLTemplateElement} template HTML template element to instance.
       * @return {!DocumentFragment} Document fragment containing the imported
       *   template content.
       * @override
       * @suppress {missingProperties} go/missingfnprops
       */
      instanceTemplate(template4) {
        let content = this.constructor._contentForTemplate(template4);
        let dom2 =
          /** @type {!DocumentFragment} */
          document.importNode(content, true);
        return dom2;
      }
      /* **** Begin Events **** */
      /**
       * Dispatches a custom event with an optional detail value.
       *
       * @param {string} type Name of event type.
       * @param {*=} detail Detail value containing event-specific
       *   payload.
       * @param {{ bubbles: (boolean|undefined), cancelable: (boolean|undefined),
       *     composed: (boolean|undefined) }=}
       *  options Object specifying options.  These may include:
       *  `bubbles` (boolean, defaults to `true`),
       *  `cancelable` (boolean, defaults to false), and
       *  `node` on which to fire the event (HTMLElement, defaults to `this`).
       * @return {!Event} The new event that was fired.
       * @override
       */
      fire(type, detail, options) {
        options = options || {};
        detail = detail === null || detail === void 0 ? {} : detail;
        let event = new Event(type, {
          bubbles: options.bubbles === void 0 ? true : options.bubbles,
          cancelable: Boolean(options.cancelable),
          composed: options.composed === void 0 ? true : options.composed,
        });
        event.detail = detail;
        let node = options.node || this;
        wrap2(node).dispatchEvent(event);
        return event;
      }
      /**
       * Convenience method to add an event listener on a given element,
       * late bound to a named method on this element.
       *
       * @param {?EventTarget} node Element to add event listener to.
       * @param {string} eventName Name of event to listen for.
       * @param {string} methodName Name of handler method on `this` to call.
       * @return {void}
       * @override
       */
      listen(node, eventName, methodName) {
        node = /** @type {!EventTarget} */ node || this;
        let hbl =
          this.__boundListeners ||
          (this.__boundListeners = /* @__PURE__ */ new WeakMap());
        let bl = hbl.get(node);
        if (!bl) {
          bl = {};
          hbl.set(node, bl);
        }
        let key = eventName + methodName;
        if (!bl[key]) {
          bl[key] = this._addMethodEventListenerToNode(
            /** @type {!Node} */
            node,
            eventName,
            methodName,
            this
          );
        }
      }
      /**
         * Convenience method to remove an event listener from a given element,
         * late bound to a named method on this element.
         *
         * @param {?EventTarget} node Element to remove event listener from.
         * @param {string} eventName Name of event to stop listening to.
         * @param {string} methodName Name of handler method on `this` to not call
         anymore.
         * @return {void}
         * @override
         */
      unlisten(node, eventName, methodName) {
        node = /** @type {!EventTarget} */ node || this;
        let bl =
          this.__boundListeners &&
          this.__boundListeners.get(
            /** @type {!Element} */
            node
          );
        let key = eventName + methodName;
        let handler = bl && bl[key];
        if (handler) {
          this._removeEventListenerFromNode(
            /** @type {!Node} */
            node,
            eventName,
            handler
          );
          bl[key] = /** @type {?} */ null;
        }
      }
      /**
       * Override scrolling behavior to all direction, one direction, or none.
       *
       * Valid scroll directions:
       *   - 'all': scroll in any direction
       *   - 'x': scroll only in the 'x' direction
       *   - 'y': scroll only in the 'y' direction
       *   - 'none': disable scrolling for this node
       *
       * @param {string=} direction Direction to allow scrolling
       * Defaults to `all`.
       * @param {Element=} node Element to apply scroll direction setting.
       * Defaults to `this`.
       * @return {void}
       * @override
       */
      setScrollDirection(direction, node) {
        setTouchAction(
          /** @type {!Element} */
          node || this,
          DIRECTION_MAP[direction] || "auto"
        );
      }
      /* **** End Events **** */
      /**
       * Convenience method to run `querySelector` on this local DOM scope.
       *
       * This function calls `Polymer.dom(this.root).querySelector(slctr)`.
       *
       * @param {string} slctr Selector to run on this local DOM scope
       * @return {Element} Element found by the selector, or null if not found.
       * @override
       */
      $$(slctr) {
        return this.root.querySelector(slctr);
      }
      /**
       * Return the element whose local dom within which this element
       * is contained. This is a shorthand for
       * `this.getRootNode().host`.
       * @this {Element}
       * @return {?Node} The element whose local dom within which this element is
       * contained.
       * @override
       */
      get domHost() {
        let root2 = wrap2(this).getRootNode();
        return root2 instanceof DocumentFragment
          ? /** @type {ShadowRoot} */
            root2.host
          : root2;
      }
      /**
       * Force this element to distribute its children to its local dom.
       * This should not be necessary as of Polymer 2.0.2 and is provided only
       * for backwards compatibility.
       * @return {void}
       * @override
       */
      distributeContent() {
        const thisEl =
          /** @type {Element} */
          this;
        const domApi =
          /** @type {PolymerDomApi} */
          dom(thisEl);
        if (window.ShadyDOM && domApi.shadowRoot) {
          ShadyDOM.flush();
        }
      }
      /**
       * Returns a list of nodes that are the effective childNodes. The effective
       * childNodes list is the same as the element's childNodes except that
       * any `<content>` elements are replaced with the list of nodes distributed
       * to the `<content>`, the result of its `getDistributedNodes` method.
       * @return {!Array<!Node>} List of effective child nodes.
       * @suppress {invalidCasts} LegacyElementMixin must be applied to an
       *     HTMLElement
       * @override
       */
      getEffectiveChildNodes() {
        const thisEl =
          /** @type {Element} */
          this;
        const domApi =
          /** @type {PolymerDomApi} */
          dom(thisEl);
        return domApi.getEffectiveChildNodes();
      }
      /**
       * Returns a list of nodes distributed within this element that match
       * `selector`. These can be dom children or elements distributed to
       * children that are insertion points.
       * @param {string} selector Selector to run.
       * @return {!Array<!Node>} List of distributed elements that match selector.
       * @suppress {invalidCasts} LegacyElementMixin must be applied to an
       * HTMLElement
       * @override
       */
      queryDistributedElements(selector) {
        const thisEl =
          /** @type {Element} */
          this;
        const domApi =
          /** @type {PolymerDomApi} */
          dom(thisEl);
        return domApi.queryDistributedElements(selector);
      }
      /**
       * Returns a list of elements that are the effective children. The effective
       * children list is the same as the element's children except that
       * any `<content>` elements are replaced with the list of elements
       * distributed to the `<content>`.
       *
       * @return {!Array<!Node>} List of effective children.
       * @override
       */
      getEffectiveChildren() {
        let list = this.getEffectiveChildNodes();
        return list.filter(function (n) {
          return n.nodeType === Node.ELEMENT_NODE;
        });
      }
      /**
       * Returns a string of text content that is the concatenation of the
       * text content's of the element's effective childNodes (the elements
       * returned by <a href="#getEffectiveChildNodes>getEffectiveChildNodes</a>.
       *
       * @return {string} List of effective children.
       * @override
       */
      getEffectiveTextContent() {
        let cn = this.getEffectiveChildNodes();
        let tc = [];
        for (let i = 0, c; (c = cn[i]); i++) {
          if (c.nodeType !== Node.COMMENT_NODE) {
            tc.push(c.textContent);
          }
        }
        return tc.join("");
      }
      /**
       * Returns the first effective childNode within this element that
       * match `selector`. These can be dom child nodes or elements distributed
       * to children that are insertion points.
       * @param {string} selector Selector to run.
       * @return {Node} First effective child node that matches selector.
       * @override
       */
      queryEffectiveChildren(selector) {
        let e$ = this.queryDistributedElements(selector);
        return e$ && e$[0];
      }
      /**
       * Returns a list of effective childNodes within this element that
       * match `selector`. These can be dom child nodes or elements distributed
       * to children that are insertion points.
       * @param {string} selector Selector to run.
       * @return {!Array<!Node>} List of effective child nodes that match
       *     selector.
       * @override
       */
      queryAllEffectiveChildren(selector) {
        return this.queryDistributedElements(selector);
      }
      /**
       * Returns a list of nodes distributed to this element's `<slot>`.
       *
       * If this element contains more than one `<slot>` in its local DOM,
       * an optional selector may be passed to choose the desired content.
       *
       * @param {string=} slctr CSS selector to choose the desired
       *   `<slot>`.  Defaults to `content`.
       * @return {!Array<!Node>} List of distributed nodes for the `<slot>`.
       * @override
       */
      getContentChildNodes(slctr) {
        let content = this.root.querySelector(slctr || "slot");
        return content
          ? /** @type {PolymerDomApi} */
            dom(content).getDistributedNodes()
          : [];
      }
      /**
       * Returns a list of element children distributed to this element's
       * `<slot>`.
       *
       * If this element contains more than one `<slot>` in its
       * local DOM, an optional selector may be passed to choose the desired
       * content.  This method differs from `getContentChildNodes` in that only
       * elements are returned.
       *
       * @param {string=} slctr CSS selector to choose the desired
       *   `<content>`.  Defaults to `content`.
       * @return {!Array<!HTMLElement>} List of distributed nodes for the
       *   `<slot>`.
       * @suppress {invalidCasts}
       * @override
       */
      getContentChildren(slctr) {
        let children =
          /** @type {!Array<!HTMLElement>} */
          this.getContentChildNodes(slctr).filter(function (n) {
            return n.nodeType === Node.ELEMENT_NODE;
          });
        return children;
      }
      /**
       * Checks whether an element is in this element's light DOM tree.
       *
       * @param {?Node} node The element to be checked.
       * @return {boolean} true if node is in this element's light DOM tree.
       * @suppress {invalidCasts} LegacyElementMixin must be applied to an
       * HTMLElement
       * @override
       */
      isLightDescendant(node) {
        const thisNode =
          /** @type {Node} */
          this;
        return (
          thisNode !== node &&
          wrap2(thisNode).contains(node) &&
          wrap2(thisNode).getRootNode() === wrap2(node).getRootNode()
        );
      }
      /**
       * Checks whether an element is in this element's local DOM tree.
       *
       * @param {!Element} node The element to be checked.
       * @return {boolean} true if node is in this element's local DOM tree.
       * @override
       */
      isLocalDescendant(node) {
        return this.root === wrap2(node).getRootNode();
      }
      /**
       * No-op for backwards compatibility. This should now be handled by
       * ShadyCss library.
       * @param  {!Element} container Container element to scope
       * @param  {boolean=} shouldObserve if true, start a mutation observer for added nodes to the container
       * @return {?MutationObserver} Returns a new MutationObserver on `container` if `shouldObserve` is true.
       * @override
       */
      scopeSubtree(container, shouldObserve = false) {
        return scopeSubtree(container, shouldObserve);
      }
      /**
       * Returns the computed style value for the given property.
       * @param {string} property The css property name.
       * @return {string} Returns the computed css property value for the given
       * `property`.
       * @suppress {invalidCasts} LegacyElementMixin must be applied to an
       *     HTMLElement
       * @override
       */
      getComputedStyleValue(property) {
        return styleInterface.getComputedStyleValue(
          /** @type {!Element} */
          this,
          property
        );
      }
      // debounce
      /**
       * Call `debounce` to collapse multiple requests for a named task into
       * one invocation which is made after the wait time has elapsed with
       * no new request.  If no wait time is given, the callback will be called
       * at microtask timing (guaranteed before paint).
       *
       *     debouncedClickAction(e) {
       *       // will not call `processClick` more than once per 100ms
       *       this.debounce('click', function() {
       *        this.processClick();
       *       } 100);
       *     }
       *
       * @param {string} jobName String to identify the debounce job.
       * @param {function():void} callback Function that is called (with `this`
       *   context) when the wait time elapses.
       * @param {number=} wait Optional wait time in milliseconds (ms) after the
       *   last signal that must elapse before invoking `callback`
       * @return {!Object} Returns a debouncer object on which exists the
       * following methods: `isActive()` returns true if the debouncer is
       * active; `cancel()` cancels the debouncer if it is active;
       * `flush()` immediately invokes the debounced callback if the debouncer
       * is active.
       * @override
       */
      debounce(jobName, callback, wait) {
        this._debouncers = this._debouncers || {};
        return (this._debouncers[jobName] = Debouncer.debounce(
          this._debouncers[jobName],
          wait > 0 ? timeOut.after(wait) : microTask,
          callback.bind(this)
        ));
      }
      /**
       * Returns whether a named debouncer is active.
       *
       * @param {string} jobName The name of the debouncer started with `debounce`
       * @return {boolean} Whether the debouncer is active (has not yet fired).
       * @override
       */
      isDebouncerActive(jobName) {
        this._debouncers = this._debouncers || {};
        let debouncer = this._debouncers[jobName];
        return !!(debouncer && debouncer.isActive());
      }
      /**
       * Immediately calls the debouncer `callback` and inactivates it.
       *
       * @param {string} jobName The name of the debouncer started with `debounce`
       * @return {void}
       * @override
       */
      flushDebouncer(jobName) {
        this._debouncers = this._debouncers || {};
        let debouncer = this._debouncers[jobName];
        if (debouncer) {
          debouncer.flush();
        }
      }
      /**
       * Cancels an active debouncer.  The `callback` will not be called.
       *
       * @param {string} jobName The name of the debouncer started with `debounce`
       * @return {void}
       * @override
       */
      cancelDebouncer(jobName) {
        this._debouncers = this._debouncers || {};
        let debouncer = this._debouncers[jobName];
        if (debouncer) {
          debouncer.cancel();
        }
      }
      /**
       * Runs a callback function asynchronously.
       *
       * By default (if no waitTime is specified), async callbacks are run at
       * microtask timing, which will occur before paint.
       *
       * @param {!Function} callback The callback function to run, bound to
       *     `this`.
       * @param {number=} waitTime Time to wait before calling the
       *   `callback`.  If unspecified or 0, the callback will be run at microtask
       *   timing (before paint).
       * @return {number} Handle that may be used to cancel the async job.
       * @override
       */
      async(callback, waitTime) {
        return waitTime > 0
          ? timeOut.run(callback.bind(this), waitTime)
          : ~microTask.run(callback.bind(this));
      }
      /**
       * Cancels an async operation started with `async`.
       *
       * @param {number} handle Handle returned from original `async` call to
       *   cancel.
       * @return {void}
       * @override
       */
      cancelAsync(handle) {
        handle < 0 ? microTask.cancel(~handle) : timeOut.cancel(handle);
      }
      // other
      /**
       * Convenience method for creating an element and configuring it.
       *
       * @param {string} tag HTML element tag to create.
       * @param {Object=} props Object of properties to configure on the
       *    instance.
       * @return {!Element} Newly created and configured element.
       * @override
       */
      create(tag, props) {
        let elt = document.createElement(tag);
        if (props) {
          if (elt.setProperties) {
            elt.setProperties(props);
          } else {
            for (let n in props) {
              elt[n] = props[n];
            }
          }
        }
        return elt;
      }
      /**
       * Polyfill for Element.prototype.matches, which is sometimes still
       * prefixed.
       *
       * @param {string} selector Selector to test.
       * @param {!Element=} node Element to test the selector against.
       * @return {boolean} Whether the element matches the selector.
       * @override
       */
      elementMatches(selector, node) {
        return matchesSelector(node || this, selector);
      }
      /**
       * Toggles an HTML attribute on or off.
       *
       * @param {string} name HTML attribute name
       * @param {boolean=} bool Boolean to force the attribute on or off.
       *    When unspecified, the state of the attribute will be reversed.
       * @return {boolean} true if the attribute now exists
       * @override
       */
      toggleAttribute(name, bool) {
        let node =
          /** @type {Element} */
          this;
        if (arguments.length === 3) {
          node = /** @type {Element} */ arguments[2];
        }
        if (arguments.length == 1) {
          bool = !node.hasAttribute(name);
        }
        if (bool) {
          wrap2(node).setAttribute(name, "");
          return true;
        } else {
          wrap2(node).removeAttribute(name);
          return false;
        }
      }
      /**
       * Toggles a CSS class on or off.
       *
       * @param {string} name CSS class name
       * @param {boolean=} bool Boolean to force the class on or off.
       *    When unspecified, the state of the class will be reversed.
       * @param {Element=} node Node to target.  Defaults to `this`.
       * @return {void}
       * @override
       */
      toggleClass(name, bool, node) {
        node = /** @type {Element} */ node || this;
        if (arguments.length == 1) {
          bool = !node.classList.contains(name);
        }
        if (bool) {
          node.classList.add(name);
        } else {
          node.classList.remove(name);
        }
      }
      /**
       * Cross-platform helper for setting an element's CSS `transform` property.
       *
       * @param {string} transformText Transform setting.
       * @param {Element=} node Element to apply the transform to.
       * Defaults to `this`
       * @return {void}
       * @override
       */
      transform(transformText, node) {
        node = /** @type {Element} */ node || this;
        node.style.webkitTransform = transformText;
        node.style.transform = transformText;
      }
      /**
       * Cross-platform helper for setting an element's CSS `translate3d`
       * property.
       *
       * @param {number|string} x X offset.
       * @param {number|string} y Y offset.
       * @param {number|string} z Z offset.
       * @param {Element=} node Element to apply the transform to.
       * Defaults to `this`.
       * @return {void}
       * @override
       */
      translate3d(x, y, z, node) {
        node = /** @type {Element} */ node || this;
        this.transform("translate3d(" + x + "," + y + "," + z + ")", node);
      }
      /**
       * Removes an item from an array, if it exists.
       *
       * If the array is specified by path, a change notification is
       * generated, so that observers, data bindings and computed
       * properties watching that path can update.
       *
       * If the array is passed directly, **no change
       * notification is generated**.
       *
       * @param {string | !Array<number|string>} arrayOrPath Path to array from
       *     which to remove the item
       *   (or the array itself).
       * @param {*} item Item to remove.
       * @return {Array} Array containing item removed.
       * @override
       */
      arrayDelete(arrayOrPath, item) {
        let index;
        if (Array.isArray(arrayOrPath)) {
          index = arrayOrPath.indexOf(item);
          if (index >= 0) {
            return arrayOrPath.splice(index, 1);
          }
        } else {
          let arr = get(this, arrayOrPath);
          index = arr.indexOf(item);
          if (index >= 0) {
            return this.splice(arrayOrPath, index, 1);
          }
        }
        return null;
      }
      // logging
      /**
       * Facades `console.log`/`warn`/`error` as override point.
       *
       * @param {string} level One of 'log', 'warn', 'error'
       * @param {Array} args Array of strings or objects to log
       * @return {void}
       * @override
       */
      _logger(level, args) {
        if (
          Array.isArray(args) &&
          args.length === 1 &&
          Array.isArray(args[0])
        ) {
          args = args[0];
        }
        switch (level) {
          case "log":
          case "warn":
          case "error":
            console[level](...args);
        }
      }
      /**
       * Facades `console.log` as an override point.
       *
       * @param {...*} args Array of strings or objects to log
       * @return {void}
       * @override
       */
      _log(...args) {
        this._logger("log", args);
      }
      /**
       * Facades `console.warn` as an override point.
       *
       * @param {...*} args Array of strings or objects to log
       * @return {void}
       * @override
       */
      _warn(...args) {
        this._logger("warn", args);
      }
      /**
       * Facades `console.error` as an override point.
       *
       * @param {...*} args Array of strings or objects to log
       * @return {void}
       * @override
       */
      _error(...args) {
        this._logger("error", args);
      }
      /**
       * Formats a message using the element type an a method name.
       *
       * @param {string} methodName Method name to associate with message
       * @param {...*} args Array of strings or objects to log
       * @return {!Array} Array with formatting information for `console`
       *   logging.
       * @override
       */
      _logf(methodName, ...args) {
        return ["[%s::%s]", this.is, methodName, ...args];
      }
    }
    LegacyElement2.prototype.is = "";
    return LegacyElement2;
  });

  // node_modules/.pnpm/@polymer+polymer@3.5.1/node_modules/@polymer/polymer/lib/legacy/class.js
  var lifecycleProps = {
    attached: true,
    detached: true,
    ready: true,
    created: true,
    beforeRegister: true,
    registered: true,
    attributeChanged: true,
    listeners: true,
    hostAttributes: true,
  };
  var excludeOnInfo = {
    attached: true,
    detached: true,
    ready: true,
    created: true,
    beforeRegister: true,
    registered: true,
    attributeChanged: true,
    behaviors: true,
    _noAccessors: true,
  };
  var excludeOnBehaviors = Object.assign(
    {
      listeners: true,
      hostAttributes: true,
      properties: true,
      observers: true,
    },
    excludeOnInfo
  );
  function copyProperties(source, target, excludeProps) {
    const noAccessors = source._noAccessors;
    const propertyNames = Object.getOwnPropertyNames(source);
    for (let i = 0; i < propertyNames.length; i++) {
      let p2 = propertyNames[i];
      if (p2 in excludeProps) {
        continue;
      }
      if (noAccessors) {
        target[p2] = source[p2];
      } else {
        let pd = Object.getOwnPropertyDescriptor(source, p2);
        if (pd) {
          pd.configurable = true;
          Object.defineProperty(target, p2, pd);
        }
      }
    }
  }
  function applyBehaviors(proto2, behaviors, lifecycle) {
    for (let i = 0; i < behaviors.length; i++) {
      applyInfo(proto2, behaviors[i], lifecycle, excludeOnBehaviors);
    }
  }
  function applyInfo(proto2, info, lifecycle, excludeProps) {
    copyProperties(info, proto2, excludeProps);
    for (let p2 in lifecycleProps) {
      if (info[p2]) {
        lifecycle[p2] = lifecycle[p2] || [];
        lifecycle[p2].push(info[p2]);
      }
    }
  }
  function flattenBehaviors(behaviors, list, exclude) {
    list = list || [];
    for (let i = behaviors.length - 1; i >= 0; i--) {
      let b = behaviors[i];
      if (b) {
        if (Array.isArray(b)) {
          flattenBehaviors(b, list);
        } else {
          if (list.indexOf(b) < 0 && (!exclude || exclude.indexOf(b) < 0)) {
            list.unshift(b);
          }
        }
      } else {
        console.warn("behavior is null, check for missing or 404 import");
      }
    }
    return list;
  }
  function mergeProperties(target, source) {
    for (const p2 in source) {
      const targetInfo = target[p2];
      const sourceInfo = source[p2];
      if (!("value" in sourceInfo) && targetInfo && "value" in targetInfo) {
        target[p2] = Object.assign({ value: targetInfo.value }, sourceInfo);
      } else {
        target[p2] = sourceInfo;
      }
    }
  }
  var LegacyElement = LegacyElementMixin(HTMLElement);
  function GenerateClassFromInfo(info, Base2, behaviors) {
    let behaviorList;
    const lifecycle = {};
    class PolymerGenerated extends Base2 {
      // explicitly not calling super._finalizeClass
      /** @nocollapse */
      static _finalizeClass() {
        if (
          !this.hasOwnProperty(JSCompiler_renameProperty("generatedFrom", this))
        ) {
          Base2._finalizeClass.call(this);
        } else {
          if (behaviorList) {
            for (let i = 0, b; i < behaviorList.length; i++) {
              b = behaviorList[i];
              if (b.properties) {
                this.createProperties(b.properties);
              }
              if (b.observers) {
                this.createObservers(b.observers, b.properties);
              }
            }
          }
          if (info.properties) {
            this.createProperties(info.properties);
          }
          if (info.observers) {
            this.createObservers(info.observers, info.properties);
          }
          this._prepareTemplate();
        }
      }
      /** @nocollapse */
      static get properties() {
        const properties = {};
        if (behaviorList) {
          for (let i = 0; i < behaviorList.length; i++) {
            mergeProperties(properties, behaviorList[i].properties);
          }
        }
        mergeProperties(properties, info.properties);
        return properties;
      }
      /** @nocollapse */
      static get observers() {
        let observers = [];
        if (behaviorList) {
          for (let i = 0, b; i < behaviorList.length; i++) {
            b = behaviorList[i];
            if (b.observers) {
              observers = observers.concat(b.observers);
            }
          }
        }
        if (info.observers) {
          observers = observers.concat(info.observers);
        }
        return observers;
      }
      /**
       * @return {void}
       */
      created() {
        super.created();
        const list = lifecycle.created;
        if (list) {
          for (let i = 0; i < list.length; i++) {
            list[i].call(this);
          }
        }
      }
      /**
       * @return {void}
       */
      _registered() {
        const generatedProto = PolymerGenerated.prototype;
        if (
          !generatedProto.hasOwnProperty(
            JSCompiler_renameProperty("__hasRegisterFinished", generatedProto)
          )
        ) {
          generatedProto.__hasRegisterFinished = true;
          super._registered();
          if (legacyOptimizations) {
            copyPropertiesToProto(generatedProto);
          }
          const proto2 = Object.getPrototypeOf(this);
          let list = lifecycle.beforeRegister;
          if (list) {
            for (let i = 0; i < list.length; i++) {
              list[i].call(proto2);
            }
          }
          list = lifecycle.registered;
          if (list) {
            for (let i = 0; i < list.length; i++) {
              list[i].call(proto2);
            }
          }
        }
      }
      /**
       * @return {void}
       */
      _applyListeners() {
        super._applyListeners();
        const list = lifecycle.listeners;
        if (list) {
          for (let i = 0; i < list.length; i++) {
            const listeners = list[i];
            if (listeners) {
              for (let l in listeners) {
                this._addMethodEventListenerToNode(this, l, listeners[l]);
              }
            }
          }
        }
      }
      // note: exception to "super then me" rule;
      // do work before calling super so that super attributes
      // only apply if not already set.
      /**
       * @return {void}
       */
      _ensureAttributes() {
        const list = lifecycle.hostAttributes;
        if (list) {
          for (let i = list.length - 1; i >= 0; i--) {
            const hostAttributes = list[i];
            for (let a in hostAttributes) {
              this._ensureAttribute(a, hostAttributes[a]);
            }
          }
        }
        super._ensureAttributes();
      }
      /**
       * @return {void}
       */
      ready() {
        super.ready();
        let list = lifecycle.ready;
        if (list) {
          for (let i = 0; i < list.length; i++) {
            list[i].call(this);
          }
        }
      }
      /**
       * @return {void}
       */
      attached() {
        super.attached();
        let list = lifecycle.attached;
        if (list) {
          for (let i = 0; i < list.length; i++) {
            list[i].call(this);
          }
        }
      }
      /**
       * @return {void}
       */
      detached() {
        super.detached();
        let list = lifecycle.detached;
        if (list) {
          for (let i = 0; i < list.length; i++) {
            list[i].call(this);
          }
        }
      }
      /**
       * Implements native Custom Elements `attributeChangedCallback` to
       * set an attribute value to a property via `_attributeToProperty`.
       *
       * @param {string} name Name of attribute that changed
       * @param {?string} old Old attribute value
       * @param {?string} value New attribute value
       * @return {void}
       */
      attributeChanged(name, old, value) {
        super.attributeChanged();
        let list = lifecycle.attributeChanged;
        if (list) {
          for (let i = 0; i < list.length; i++) {
            list[i].call(this, name, old, value);
          }
        }
      }
    }
    if (behaviors) {
      if (!Array.isArray(behaviors)) {
        behaviors = [behaviors];
      }
      let superBehaviors = Base2.prototype.behaviors;
      behaviorList = flattenBehaviors(behaviors, null, superBehaviors);
      PolymerGenerated.prototype.behaviors = superBehaviors
        ? superBehaviors.concat(behaviors)
        : behaviorList;
    }
    const copyPropertiesToProto = (proto2) => {
      if (behaviorList) {
        applyBehaviors(proto2, behaviorList, lifecycle);
      }
      applyInfo(proto2, info, lifecycle, excludeOnInfo);
    };
    if (!legacyOptimizations) {
      copyPropertiesToProto(PolymerGenerated.prototype);
    }
    PolymerGenerated.generatedFrom = info;
    return PolymerGenerated;
  }
  var Class = function (info, mixin) {
    if (!info) {
      console.warn("Polymer.Class requires `info` argument");
    }
    let klass = mixin ? mixin(LegacyElement) : LegacyElement;
    klass = GenerateClassFromInfo(info, klass, info.behaviors);
    klass.is = klass.prototype.is = info.is;
    return klass;
  };

  // node_modules/.pnpm/@polymer+polymer@3.5.1/node_modules/@polymer/polymer/lib/legacy/polymer-fn.js
  var Polymer = function (info) {
    let klass;
    if (typeof info === "function") {
      klass = info;
    } else {
      klass = Polymer.Class(info);
    }
    if (info._legacyForceObservedAttributes) {
      klass.prototype._legacyForceObservedAttributes =
        info._legacyForceObservedAttributes;
    }
    customElements.define(
      klass.is,
      /** @type {!HTMLElement} */
      klass
    );
    return klass;
  };
  Polymer.Class = Class;

  // node_modules/.pnpm/@polymer+polymer@3.5.1/node_modules/@polymer/polymer/lib/mixins/mutable-data.js
  function mutablePropertyChange(inst, property, value, old, mutableData) {
    let isObject;
    if (mutableData) {
      isObject = typeof value === "object" && value !== null;
      if (isObject) {
        old = inst.__dataTemp[property];
      }
    }
    let shouldChange = old !== value && (old === old || value === value);
    if (isObject && shouldChange) {
      inst.__dataTemp[property] = value;
    }
    return shouldChange;
  }
  var MutableData = dedupingMixin((superClass) => {
    class MutableData2 extends superClass {
      /**
       * Overrides `PropertyEffects` to provide option for skipping
       * strict equality checking for Objects and Arrays.
       *
       * This method pulls the value to dirty check against from the `__dataTemp`
       * cache (rather than the normal `__data` cache) for Objects.  Since the temp
       * cache is cleared at the end of a turn, this implementation allows
       * side-effects of deep object changes to be processed by re-setting the
       * same object (using the temp cache as an in-turn backstop to prevent
       * cycles due to 2-way notification).
       *
       * @param {string} property Property name
       * @param {*} value New property value
       * @param {*} old Previous property value
       * @return {boolean} Whether the property should be considered a change
       * @protected
       */
      _shouldPropertyChange(property, value, old) {
        return mutablePropertyChange(this, property, value, old, true);
      }
    }
    return MutableData2;
  });
  var OptionalMutableData = dedupingMixin((superClass) => {
    class OptionalMutableData2 extends superClass {
      /** @nocollapse */
      static get properties() {
        return {
          /**
           * Instance-level flag for configuring the dirty-checking strategy
           * for this element.  When true, Objects and Arrays will skip dirty
           * checking, otherwise strict equality checking will be used.
           */
          mutableData: Boolean,
        };
      }
      /**
       * Overrides `PropertyEffects` to provide option for skipping
       * strict equality checking for Objects and Arrays.
       *
       * When `this.mutableData` is true on this instance, this method
       * pulls the value to dirty check against from the `__dataTemp` cache
       * (rather than the normal `__data` cache) for Objects.  Since the temp
       * cache is cleared at the end of a turn, this implementation allows
       * side-effects of deep object changes to be processed by re-setting the
       * same object (using the temp cache as an in-turn backstop to prevent
       * cycles due to 2-way notification).
       *
       * @param {string} property Property name
       * @param {*} value New property value
       * @param {*} old Previous property value
       * @return {boolean} Whether the property should be considered a change
       * @protected
       */
      _shouldPropertyChange(property, value, old) {
        return mutablePropertyChange(
          this,
          property,
          value,
          old,
          this.mutableData
        );
      }
    }
    return OptionalMutableData2;
  });
  MutableData._mutablePropertyChange = mutablePropertyChange;

  // node_modules/.pnpm/@polymer+polymer@3.5.1/node_modules/@polymer/polymer/lib/utils/templatize.js
  var newInstance = null;
  function HTMLTemplateElementExtension() {
    return newInstance;
  }
  HTMLTemplateElementExtension.prototype = Object.create(
    HTMLTemplateElement.prototype,
    {
      constructor: {
        value: HTMLTemplateElementExtension,
        writable: true,
      },
    }
  );
  var DataTemplate = PropertyEffects(HTMLTemplateElementExtension);
  var MutableDataTemplate = MutableData(DataTemplate);
  function upgradeTemplate(template4, constructor) {
    newInstance = template4;
    Object.setPrototypeOf(template4, constructor.prototype);
    new constructor();
    newInstance = null;
  }
  var templateInstanceBase = PropertyEffects(class {});
  function showHideChildren(hide, children) {
    for (let i = 0; i < children.length; i++) {
      let n = children[i];
      if (Boolean(hide) != Boolean(n.__hideTemplateChildren__)) {
        if (n.nodeType === Node.TEXT_NODE) {
          if (hide) {
            n.__polymerTextContent__ = n.textContent;
            n.textContent = "";
          } else {
            n.textContent = n.__polymerTextContent__;
          }
        } else if (n.localName === "slot") {
          if (hide) {
            n.__polymerReplaced__ = document.createComment("hidden-slot");
            wrap2(wrap2(n).parentNode).replaceChild(n.__polymerReplaced__, n);
          } else {
            const replace = n.__polymerReplaced__;
            if (replace) {
              wrap2(wrap2(replace).parentNode).replaceChild(n, replace);
            }
          }
        } else if (n.style) {
          if (hide) {
            n.__polymerDisplay__ = n.style.display;
            n.style.display = "none";
          } else {
            n.style.display = n.__polymerDisplay__;
          }
        }
      }
      n.__hideTemplateChildren__ = hide;
      if (n._showHideChildren) {
        n._showHideChildren(hide);
      }
    }
  }
  var TemplateInstanceBase = class extends templateInstanceBase {
    constructor(props) {
      super();
      this._configureProperties(props);
      this.root = this._stampTemplate(this.__dataHost);
      let children = [];
      this.children = /** @type {!NodeList} */ children;
      for (let n = this.root.firstChild; n; n = n.nextSibling) {
        children.push(n);
        n.__templatizeInstance = this;
      }
      if (
        this.__templatizeOwner &&
        this.__templatizeOwner.__hideTemplateChildren__
      ) {
        this._showHideChildren(true);
      }
      let options = this.__templatizeOptions;
      if ((props && options.instanceProps) || !options.instanceProps) {
        this._enableProperties();
      }
    }
    /**
     * Configure the given `props` by calling `_setPendingProperty`. Also
     * sets any properties stored in `__hostProps`.
     * @private
     * @param {Object} props Object of property name-value pairs to set.
     * @return {void}
     */
    _configureProperties(props) {
      let options = this.__templatizeOptions;
      if (options.forwardHostProp) {
        for (let hprop in this.__hostProps) {
          this._setPendingProperty(hprop, this.__dataHost["_host_" + hprop]);
        }
      }
      for (let iprop in props) {
        this._setPendingProperty(iprop, props[iprop]);
      }
    }
    /**
     * Forwards a host property to this instance.  This method should be
     * called on instances from the `options.forwardHostProp` callback
     * to propagate changes of host properties to each instance.
     *
     * Note this method enqueues the change, which are flushed as a batch.
     *
     * @param {string} prop Property or path name
     * @param {*} value Value of the property to forward
     * @return {void}
     */
    forwardHostProp(prop, value) {
      if (this._setPendingPropertyOrPath(prop, value, false, true)) {
        this.__dataHost._enqueueClient(this);
      }
    }
    /**
     * Override point for adding custom or simulated event handling.
     *
     * @override
     * @param {!Node} node Node to add event listener to
     * @param {string} eventName Name of event
     * @param {function(!Event):void} handler Listener function to add
     * @return {void}
     */
    _addEventListenerToNode(node, eventName, handler) {
      if (this._methodHost && this.__templatizeOptions.parentModel) {
        this._methodHost._addEventListenerToNode(node, eventName, (e) => {
          e.model = this;
          handler(e);
        });
      } else {
        let templateHost = this.__dataHost.__dataHost;
        if (templateHost) {
          templateHost._addEventListenerToNode(node, eventName, handler);
        }
      }
    }
    /**
     * Shows or hides the template instance top level child elements. For
     * text nodes, `textContent` is removed while "hidden" and replaced when
     * "shown."
     * @param {boolean} hide Set to true to hide the children;
     * set to false to show them.
     * @return {void}
     * @protected
     */
    _showHideChildren(hide) {
      showHideChildren(hide, this.children);
    }
    /**
     * Overrides default property-effects implementation to intercept
     * textContent bindings while children are "hidden" and cache in
     * private storage for later retrieval.
     *
     * @override
     * @param {!Node} node The node to set a property on
     * @param {string} prop The property to set
     * @param {*} value The value to set
     * @return {void}
     * @protected
     */
    _setUnmanagedPropertyToNode(node, prop, value) {
      if (
        node.__hideTemplateChildren__ &&
        node.nodeType == Node.TEXT_NODE &&
        prop == "textContent"
      ) {
        node.__polymerTextContent__ = value;
      } else {
        super._setUnmanagedPropertyToNode(node, prop, value);
      }
    }
    /**
     * Find the parent model of this template instance.  The parent model
     * is either another templatize instance that had option `parentModel: true`,
     * or else the host element.
     *
     * @return {!Polymer_PropertyEffects} The parent model of this instance
     */
    get parentModel() {
      let model = this.__parentModel;
      if (!model) {
        let options;
        model = this;
        do {
          model = model.__dataHost.__dataHost;
        } while ((options = model.__templatizeOptions) && !options.parentModel);
        this.__parentModel = model;
      }
      return model;
    }
    /**
     * Stub of HTMLElement's `dispatchEvent`, so that effects that may
     * dispatch events safely no-op.
     *
     * @param {Event} event Event to dispatch
     * @return {boolean} Always true.
     * @override
     */
    dispatchEvent(event) {
      return true;
    }
  };
  TemplateInstanceBase.prototype.__dataHost;
  TemplateInstanceBase.prototype.__templatizeOptions;
  TemplateInstanceBase.prototype._methodHost;
  TemplateInstanceBase.prototype.__templatizeOwner;
  TemplateInstanceBase.prototype.__hostProps;
  var MutableTemplateInstanceBase = MutableData(
    // This cast shouldn't be neccessary, but Closure doesn't understand that
    // TemplateInstanceBase is a constructor function.
    /** @type {function(new:TemplateInstanceBase)} */
    TemplateInstanceBase
  );
  function findMethodHost(template4) {
    let templateHost = template4.__dataHost;
    return (templateHost && templateHost._methodHost) || templateHost;
  }
  function createTemplatizerClass(template4, templateInfo, options) {
    let templatizerBase = options.mutableData
      ? MutableTemplateInstanceBase
      : TemplateInstanceBase;
    if (templatize.mixin) {
      templatizerBase = templatize.mixin(templatizerBase);
    }
    let klass = class extends templatizerBase {};
    klass.prototype.__templatizeOptions = options;
    klass.prototype._bindTemplate(template4);
    addNotifyEffects(klass, template4, templateInfo, options);
    return klass;
  }
  function addPropagateEffects(target, templateInfo, options, methodHost) {
    let userForwardHostProp = options.forwardHostProp;
    if (userForwardHostProp && templateInfo.hasHostProps) {
      const isTemplate = target.localName == "template";
      let klass = templateInfo.templatizeTemplateClass;
      if (!klass) {
        if (isTemplate) {
          let templatizedBase = options.mutableData
            ? MutableDataTemplate
            : DataTemplate;
          class TemplatizedTemplate extends templatizedBase {}
          klass = templateInfo.templatizeTemplateClass = TemplatizedTemplate;
        } else {
          const templatizedBase = target.constructor;
          class TemplatizedTemplateExtension extends templatizedBase {}
          klass = templateInfo.templatizeTemplateClass =
            TemplatizedTemplateExtension;
        }
        let hostProps = templateInfo.hostProps;
        for (let prop in hostProps) {
          klass.prototype._addPropertyEffect(
            "_host_" + prop,
            klass.prototype.PROPERTY_EFFECT_TYPES.PROPAGATE,
            { fn: createForwardHostPropEffect(prop, userForwardHostProp) }
          );
          klass.prototype._createNotifyingProperty("_host_" + prop);
        }
        if (legacyWarnings && methodHost) {
          warnOnUndeclaredProperties(templateInfo, options, methodHost);
        }
      }
      if (target.__dataProto) {
        Object.assign(target.__data, target.__dataProto);
      }
      if (isTemplate) {
        upgradeTemplate(target, klass);
        target.__dataTemp = {};
        target.__dataPending = null;
        target.__dataOld = null;
        target._enableProperties();
      } else {
        Object.setPrototypeOf(target, klass.prototype);
        const hostProps = templateInfo.hostProps;
        for (let prop in hostProps) {
          prop = "_host_" + prop;
          if (prop in target) {
            const val = target[prop];
            delete target[prop];
            target.__data[prop] = val;
          }
        }
      }
    }
  }
  function createForwardHostPropEffect(hostProp, userForwardHostProp) {
    return function forwardHostProp(template4, prop, props) {
      userForwardHostProp.call(
        template4.__templatizeOwner,
        prop.substring("_host_".length),
        props[prop]
      );
    };
  }
  function addNotifyEffects(klass, template4, templateInfo, options) {
    let hostProps = templateInfo.hostProps || {};
    for (let iprop in options.instanceProps) {
      delete hostProps[iprop];
      let userNotifyInstanceProp = options.notifyInstanceProp;
      if (userNotifyInstanceProp) {
        klass.prototype._addPropertyEffect(
          iprop,
          klass.prototype.PROPERTY_EFFECT_TYPES.NOTIFY,
          { fn: createNotifyInstancePropEffect(iprop, userNotifyInstanceProp) }
        );
      }
    }
    if (options.forwardHostProp && template4.__dataHost) {
      for (let hprop in hostProps) {
        if (!templateInfo.hasHostProps) {
          templateInfo.hasHostProps = true;
        }
        klass.prototype._addPropertyEffect(
          hprop,
          klass.prototype.PROPERTY_EFFECT_TYPES.NOTIFY,
          { fn: createNotifyHostPropEffect() }
        );
      }
    }
  }
  function createNotifyInstancePropEffect(instProp, userNotifyInstanceProp) {
    return function notifyInstanceProp(inst, prop, props) {
      userNotifyInstanceProp.call(
        inst.__templatizeOwner,
        inst,
        prop,
        props[prop]
      );
    };
  }
  function createNotifyHostPropEffect() {
    return function notifyHostProp(inst, prop, props) {
      inst.__dataHost._setPendingPropertyOrPath(
        "_host_" + prop,
        props[prop],
        true,
        true
      );
    };
  }
  function templatize(template4, owner, options) {
    if (strictTemplatePolicy && !findMethodHost(template4)) {
      throw new Error("strictTemplatePolicy: template owner not trusted");
    }
    options = /** @type {!TemplatizeOptions} */ options || {};
    if (template4.__templatizeOwner) {
      throw new Error("A <template> can only be templatized once");
    }
    template4.__templatizeOwner = owner;
    const ctor = owner ? owner.constructor : TemplateInstanceBase;
    let templateInfo = ctor._parseTemplate(template4);
    let baseClass = templateInfo.templatizeInstanceClass;
    if (!baseClass) {
      baseClass = createTemplatizerClass(template4, templateInfo, options);
      templateInfo.templatizeInstanceClass = baseClass;
    }
    const methodHost = findMethodHost(template4);
    addPropagateEffects(template4, templateInfo, options, methodHost);
    let klass = class TemplateInstance extends baseClass {};
    klass.prototype._methodHost = methodHost;
    klass.prototype.__dataHost = /** @type {!DataTemplate} */ template4;
    klass.prototype.__templatizeOwner = /** @type {!Object} */ owner;
    klass.prototype.__hostProps = templateInfo.hostProps;
    klass = /** @type {function(new:TemplateInstanceBase)} */ klass;
    return klass;
  }
  function warnOnUndeclaredProperties(templateInfo, options, methodHost) {
    const declaredProps = methodHost.constructor._properties;
    const { propertyEffects } = templateInfo;
    const { instanceProps } = options;
    for (let prop in propertyEffects) {
      if (!declaredProps[prop] && !(instanceProps && instanceProps[prop])) {
        const effects = propertyEffects[prop];
        for (let i = 0; i < effects.length; i++) {
          const { part } = effects[i].info;
          if (!(part.signature && part.signature.static)) {
            console.warn(
              `Property '${prop}' used in template but not declared in 'properties'; attribute will not be observed.`
            );
            break;
          }
        }
      }
    }
  }
  function modelForElement(template4, node) {
    let model;
    while (node) {
      if ((model = node.__dataHost ? node : node.__templatizeInstance)) {
        if (model.__dataHost != template4) {
          node = model.__dataHost;
        } else {
          return model;
        }
      } else {
        node = wrap2(node).parentNode;
      }
    }
    return null;
  }

  // node_modules/.pnpm/@polymer+polymer@3.5.1/node_modules/@polymer/polymer/lib/utils/hide-template-controls.js
  var elementsHidden = false;
  function hideElementsGlobally() {
    if (legacyOptimizations && !useShadow) {
      if (!elementsHidden) {
        elementsHidden = true;
        const style = document.createElement("style");
        style.textContent = "dom-bind,dom-if,dom-repeat{display:none;}";
        document.head.appendChild(style);
      }
      return true;
    }
    return false;
  }

  // node_modules/.pnpm/@polymer+polymer@3.5.1/node_modules/@polymer/polymer/lib/elements/dom-bind.js
  var domBindBase = GestureEventListeners(
    OptionalMutableData(PropertyEffects(HTMLElement))
  );
  var DomBind = class extends domBindBase {
    static get observedAttributes() {
      return ["mutable-data"];
    }
    constructor() {
      super();
      if (strictTemplatePolicy) {
        throw new Error(`strictTemplatePolicy: dom-bind not allowed`);
      }
      this.root = null;
      this.$ = null;
      this.__children = null;
    }
    /* eslint-disable no-unused-vars */
    /**
     * @override
     * @param {string} name Name of attribute that changed
     * @param {?string} old Old attribute value
     * @param {?string} value New attribute value
     * @param {?string} namespace Attribute namespace.
     * @return {void}
     */
    attributeChangedCallback(name, old, value, namespace) {
      this.mutableData = true;
    }
    /**
     * @override
     * @return {void}
     */
    connectedCallback() {
      if (!hideElementsGlobally()) {
        this.style.display = "none";
      }
      this.render();
    }
    /**
     * @override
     * @return {void}
     */
    disconnectedCallback() {
      this.__removeChildren();
    }
    __insertChildren() {
      wrap2(wrap2(this).parentNode).insertBefore(this.root, this);
    }
    __removeChildren() {
      if (this.__children) {
        for (let i = 0; i < this.__children.length; i++) {
          this.root.appendChild(this.__children[i]);
        }
      }
    }
    /**
     * Forces the element to render its content. This is typically only
     * necessary to call if HTMLImports with the async attribute are used.
     * @return {void}
     */
    render() {
      let template4;
      if (!this.__children) {
        template4 =
          /** @type {?HTMLTemplateElement} */
          template4 || this.querySelector("template");
        if (!template4) {
          let observer2 = new MutationObserver(() => {
            template4 =
              /** @type {HTMLTemplateElement} */
              this.querySelector("template");
            if (template4) {
              observer2.disconnect();
              this.render();
            } else {
              throw new Error("dom-bind requires a <template> child");
            }
          });
          observer2.observe(this, { childList: true });
          return;
        }
        this.root = this._stampTemplate(
          /** @type {!HTMLTemplateElement} */
          template4
        );
        this.$ = this.root.$;
        this.__children = [];
        for (let n = this.root.firstChild; n; n = n.nextSibling) {
          this.__children[this.__children.length] = n;
        }
        this._enableProperties();
      }
      this.__insertChildren();
      this.dispatchEvent(
        new CustomEvent("dom-change", {
          bubbles: true,
          composed: true,
        })
      );
    }
  };
  customElements.define("dom-bind", DomBind);

  // node_modules/.pnpm/@polymer+polymer@3.5.1/node_modules/@polymer/polymer/lib/utils/html-tag.js
  var policy =
    window.trustedTypes &&
    trustedTypes.createPolicy("polymer-html-literal", { createHTML: (s) => s });
  var LiteralString = class {
    /**
     * @param {!ITemplateArray} strings Constant parts of tagged template literal
     * @param {!Array<*>} values Variable parts of tagged template literal
     */
    constructor(strings, values) {
      assertValidTemplateStringParameters(strings, values);
      const string = values.reduce(
        (acc, v, idx) => acc + literalValue(v) + strings[idx + 1],
        strings[0]
      );
      this.value = string.toString();
    }
    /**
     * @return {string} LiteralString string value
     * @override
     */
    toString() {
      return this.value;
    }
  };
  function literalValue(value) {
    if (value instanceof LiteralString) {
      return (
        /** @type {!LiteralString} */
        value.value
      );
    } else {
      throw new Error(
        `non-literal value passed to Polymer's htmlLiteral function: ${value}`
      );
    }
  }
  function htmlValue(value) {
    if (value instanceof HTMLTemplateElement) {
      return (
        /** @type {!HTMLTemplateElement } */
        value.innerHTML
      );
    } else if (value instanceof LiteralString) {
      return literalValue(value);
    } else {
      throw new Error(
        `non-template value passed to Polymer's html function: ${value}`
      );
    }
  }
  var html = function html2(strings, ...values) {
    assertValidTemplateStringParameters(strings, values);
    const template4 =
      /** @type {!HTMLTemplateElement} */
      document.createElement("template");
    let value = values.reduce(
      (acc, v, idx) => acc + htmlValue(v) + strings[idx + 1],
      strings[0]
    );
    if (policy) {
      value = policy.createHTML(value);
    }
    template4.innerHTML = value;
    return template4;
  };
  var assertValidTemplateStringParameters = (strings, values) => {
    if (
      !Array.isArray(strings) ||
      !Array.isArray(strings.raw) ||
      values.length !== strings.length - 1
    ) {
      throw new TypeError("Invalid call to the html template tag");
    }
  };

  // node_modules/.pnpm/@polymer+polymer@3.5.1/node_modules/@polymer/polymer/polymer-element.js
  var PolymerElement = ElementMixin(HTMLElement);

  // node_modules/.pnpm/@polymer+polymer@3.5.1/node_modules/@polymer/polymer/lib/elements/dom-repeat.js
  var domRepeatBase = OptionalMutableData(PolymerElement);
  var DomRepeat = class extends domRepeatBase {
    // Not needed to find template; can be removed once the analyzer
    // can find the tag name from customElements.define call
    static get is() {
      return "dom-repeat";
    }
    static get template() {
      return null;
    }
    static get properties() {
      return {
        /**
         * An array containing items determining how many instances of the template
         * to stamp and that that each template instance should bind to.
         */
        items: {
          type: Array,
        },
        /**
         * The name of the variable to add to the binding scope for the array
         * element associated with a given template instance.
         */
        as: {
          type: String,
          value: "item",
        },
        /**
         * The name of the variable to add to the binding scope with the index
         * of the instance in the sorted and filtered list of rendered items.
         * Note, for the index in the `this.items` array, use the value of the
         * `itemsIndexAs` property.
         */
        indexAs: {
          type: String,
          value: "index",
        },
        /**
         * The name of the variable to add to the binding scope with the index
         * of the instance in the `this.items` array. Note, for the index of
         * this instance in the sorted and filtered list of rendered items,
         * use the value of the `indexAs` property.
         */
        itemsIndexAs: {
          type: String,
          value: "itemsIndex",
        },
        /**
         * A function that should determine the sort order of the items.  This
         * property should either be provided as a string, indicating a method
         * name on the element's host, or else be an actual function.  The
         * function should match the sort function passed to `Array.sort`.
         * Using a sort function has no effect on the underlying `items` array.
         */
        sort: {
          type: Function,
          observer: "__sortChanged",
        },
        /**
         * A function that can be used to filter items out of the view.  This
         * property should either be provided as a string, indicating a method
         * name on the element's host, or else be an actual function.  The
         * function should match the sort function passed to `Array.filter`.
         * Using a filter function has no effect on the underlying `items` array.
         */
        filter: {
          type: Function,
          observer: "__filterChanged",
        },
        /**
         * When using a `filter` or `sort` function, the `observe` property
         * should be set to a space-separated list of the names of item
         * sub-fields that should trigger a re-sort or re-filter when changed.
         * These should generally be fields of `item` that the sort or filter
         * function depends on.
         */
        observe: {
          type: String,
          observer: "__observeChanged",
        },
        /**
         * When using a `filter` or `sort` function, the `delay` property
         * determines a debounce time in ms after a change to observed item
         * properties that must pass before the filter or sort is re-run.
         * This is useful in rate-limiting shuffling of the view when
         * item changes may be frequent.
         */
        delay: Number,
        /**
         * Count of currently rendered items after `filter` (if any) has been applied.
         * If "chunking mode" is enabled, `renderedItemCount` is updated each time a
         * set of template instances is rendered.
         *
         */
        renderedItemCount: {
          type: Number,
          notify: !suppressTemplateNotifications,
          readOnly: true,
        },
        /**
         * When greater than zero, defines an initial count of template instances
         * to render after setting the `items` array, before the next paint, and
         * puts the `dom-repeat` into "chunking mode".  The remaining items (and
         * any future items as a result of pushing onto the array) will be created
         * and rendered incrementally at each animation frame thereof until all
         * instances have been rendered.
         */
        initialCount: {
          type: Number,
        },
        /**
         * When `initialCount` is used, this property defines a frame rate (in
         * fps) to target by throttling the number of instances rendered each
         * frame to not exceed the budget for the target frame rate.  The
         * framerate is effectively the number of `requestAnimationFrame`s that
         * it tries to allow to actually fire in a given second. It does this
         * by measuring the time between `rAF`s and continuously adjusting the
         * number of items created each `rAF` to maintain the target framerate.
         * Setting this to a higher number allows lower latency and higher
         * throughput for event handlers and other tasks, but results in a
         * longer time for the remaining items to complete rendering.
         */
        targetFramerate: {
          type: Number,
          value: 20,
        },
        _targetFrameTime: {
          type: Number,
          computed: "__computeFrameTime(targetFramerate)",
        },
        /**
         * When the global `suppressTemplateNotifications` setting is used, setting
         * `notifyDomChange: true` will enable firing `dom-change` events on this
         * element.
         */
        notifyDomChange: {
          type: Boolean,
        },
        /**
         * When chunking is enabled via `initialCount` and the `items` array is
         * set to a new array, this flag controls whether the previously rendered
         * instances are reused or not.
         *
         * When `true`, any previously rendered template instances are updated in
         * place to their new item values synchronously in one shot, and then any
         * further items (if any) are chunked out.  When `false`, the list is
         * returned back to its `initialCount` (any instances over the initial
         * count are discarded) and the remainder of the list is chunked back in.
         * Set this to `true` to avoid re-creating the list and losing scroll
         * position, although note that when changing the list to completely
         * different data the render thread will be blocked until all existing
         * instances are updated to their new data.
         */
        reuseChunkedInstances: {
          type: Boolean,
        },
      };
    }
    static get observers() {
      return ["__itemsChanged(items.*)"];
    }
    constructor() {
      super();
      this.__instances = [];
      this.__renderDebouncer = null;
      this.__itemsIdxToInstIdx = {};
      this.__chunkCount = null;
      this.__renderStartTime = null;
      this.__itemsArrayChanged = false;
      this.__shouldMeasureChunk = false;
      this.__shouldContinueChunking = false;
      this.__chunkingId = 0;
      this.__sortFn = null;
      this.__filterFn = null;
      this.__observePaths = null;
      this.__ctor = null;
      this.__isDetached = true;
      this.template = null;
      this._templateInfo;
    }
    /**
     * @override
     * @return {void}
     */
    disconnectedCallback() {
      super.disconnectedCallback();
      this.__isDetached = true;
      for (let i = 0; i < this.__instances.length; i++) {
        this.__detachInstance(i);
      }
      if (this.__chunkingId) {
        cancelAnimationFrame(this.__chunkingId);
      }
    }
    /**
     * @override
     * @return {void}
     */
    connectedCallback() {
      super.connectedCallback();
      if (!hideElementsGlobally()) {
        this.style.display = "none";
      }
      if (this.__isDetached) {
        this.__isDetached = false;
        let wrappedParent = wrap2(wrap2(this).parentNode);
        for (let i = 0; i < this.__instances.length; i++) {
          this.__attachInstance(i, wrappedParent);
        }
        if (this.__chunkingId) {
          this.__render();
        }
      }
    }
    __ensureTemplatized() {
      if (!this.__ctor) {
        const thisAsTemplate =
          /** @type {!HTMLTemplateElement} */
          /** @type {!HTMLElement} */
          this;
        let template4 = (this.template = thisAsTemplate._templateInfo
          ? thisAsTemplate
          : /** @type {!HTMLTemplateElement} */
            this.querySelector("template"));
        if (!template4) {
          let observer2 = new MutationObserver(() => {
            if (this.querySelector("template")) {
              observer2.disconnect();
              this.__render();
            } else {
              throw new Error("dom-repeat requires a <template> child");
            }
          });
          observer2.observe(this, { childList: true });
          return false;
        }
        let instanceProps = {};
        instanceProps[this.as] = true;
        instanceProps[this.indexAs] = true;
        instanceProps[this.itemsIndexAs] = true;
        this.__ctor = templatize(template4, this, {
          mutableData: this.mutableData,
          parentModel: true,
          instanceProps,
          /**
           * @this {DomRepeat}
           * @param {string} prop Property to set
           * @param {*} value Value to set property to
           */
          forwardHostProp: function (prop, value) {
            let i$ = this.__instances;
            for (let i = 0, inst; i < i$.length && (inst = i$[i]); i++) {
              inst.forwardHostProp(prop, value);
            }
          },
          /**
           * @this {DomRepeat}
           * @param {Object} inst Instance to notify
           * @param {string} prop Property to notify
           * @param {*} value Value to notify
           */
          notifyInstanceProp: function (inst, prop, value) {
            if (matches(this.as, prop)) {
              let idx = inst[this.itemsIndexAs];
              if (prop == this.as) {
                this.items[idx] = value;
              }
              let path = translate(
                this.as,
                `${JSCompiler_renameProperty("items", this)}.${idx}`,
                prop
              );
              this.notifyPath(path, value);
            }
          },
        });
      }
      return true;
    }
    __getMethodHost() {
      return this.__dataHost._methodHost || this.__dataHost;
    }
    __functionFromPropertyValue(functionOrMethodName) {
      if (typeof functionOrMethodName === "string") {
        let methodName = functionOrMethodName;
        let obj = this.__getMethodHost();
        return function () {
          return obj[methodName].apply(obj, arguments);
        };
      }
      return functionOrMethodName;
    }
    __sortChanged(sort) {
      this.__sortFn = this.__functionFromPropertyValue(sort);
      if (this.items) {
        this.__debounceRender(this.__render);
      }
    }
    __filterChanged(filter) {
      this.__filterFn = this.__functionFromPropertyValue(filter);
      if (this.items) {
        this.__debounceRender(this.__render);
      }
    }
    __computeFrameTime(rate) {
      return Math.ceil(1e3 / rate);
    }
    __observeChanged() {
      this.__observePaths =
        this.observe && this.observe.replace(".*", ".").split(" ");
    }
    __handleObservedPaths(path) {
      if (this.__sortFn || this.__filterFn) {
        if (!path) {
          this.__debounceRender(this.__render, this.delay);
        } else if (this.__observePaths) {
          let paths = this.__observePaths;
          for (let i = 0; i < paths.length; i++) {
            if (path.indexOf(paths[i]) === 0) {
              this.__debounceRender(this.__render, this.delay);
            }
          }
        }
      }
    }
    __itemsChanged(change) {
      if (this.items && !Array.isArray(this.items)) {
        console.warn(
          "dom-repeat expected array for `items`, found",
          this.items
        );
      }
      if (!this.__handleItemPath(change.path, change.value)) {
        if (change.path === "items") {
          this.__itemsArrayChanged = true;
        }
        this.__debounceRender(this.__render);
      }
    }
    /**
     * @param {function(this:DomRepeat)} fn Function to debounce.
     * @param {number=} delay Delay in ms to debounce by.
     */
    __debounceRender(fn, delay = 0) {
      this.__renderDebouncer = Debouncer.debounce(
        this.__renderDebouncer,
        delay > 0 ? timeOut.after(delay) : microTask,
        fn.bind(this)
      );
      enqueueDebouncer(this.__renderDebouncer);
    }
    /**
     * Forces the element to render its content. Normally rendering is
     * asynchronous to a provoking change. This is done for efficiency so
     * that multiple changes trigger only a single render. The render method
     * should be called if, for example, template rendering is required to
     * validate application state.
     * @return {void}
     */
    render() {
      this.__debounceRender(this.__render);
      flush();
    }
    __render() {
      if (!this.__ensureTemplatized()) {
        return;
      }
      let items = this.items || [];
      const isntIdxToItemsIdx = this.__sortAndFilterItems(items);
      const limit = this.__calculateLimit(isntIdxToItemsIdx.length);
      this.__updateInstances(items, limit, isntIdxToItemsIdx);
      if (
        this.initialCount &&
        (this.__shouldMeasureChunk || this.__shouldContinueChunking)
      ) {
        cancelAnimationFrame(this.__chunkingId);
        this.__chunkingId = requestAnimationFrame(() => {
          this.__chunkingId = null;
          this.__continueChunking();
        });
      }
      this._setRenderedItemCount(this.__instances.length);
      if (!suppressTemplateNotifications || this.notifyDomChange) {
        this.dispatchEvent(
          new CustomEvent("dom-change", {
            bubbles: true,
            composed: true,
          })
        );
      }
    }
    __sortAndFilterItems(items) {
      let isntIdxToItemsIdx = new Array(items.length);
      for (let i = 0; i < items.length; i++) {
        isntIdxToItemsIdx[i] = i;
      }
      if (this.__filterFn) {
        isntIdxToItemsIdx = isntIdxToItemsIdx.filter((i, idx, array) =>
          this.__filterFn(items[i], idx, array)
        );
      }
      if (this.__sortFn) {
        isntIdxToItemsIdx.sort((a, b) => this.__sortFn(items[a], items[b]));
      }
      return isntIdxToItemsIdx;
    }
    __calculateLimit(filteredItemCount) {
      let limit = filteredItemCount;
      const currentCount = this.__instances.length;
      if (this.initialCount) {
        let newCount;
        if (
          !this.__chunkCount ||
          (this.__itemsArrayChanged && !this.reuseChunkedInstances)
        ) {
          limit = Math.min(filteredItemCount, this.initialCount);
          newCount = Math.max(limit - currentCount, 0);
          this.__chunkCount = newCount || 1;
        } else {
          newCount = Math.min(
            Math.max(filteredItemCount - currentCount, 0),
            this.__chunkCount
          );
          limit = Math.min(currentCount + newCount, filteredItemCount);
        }
        this.__shouldMeasureChunk = newCount === this.__chunkCount;
        this.__shouldContinueChunking = limit < filteredItemCount;
        this.__renderStartTime = performance.now();
      }
      this.__itemsArrayChanged = false;
      return limit;
    }
    __continueChunking() {
      if (this.__shouldMeasureChunk) {
        const renderTime = performance.now() - this.__renderStartTime;
        const ratio = this._targetFrameTime / renderTime;
        this.__chunkCount = Math.round(this.__chunkCount * ratio) || 1;
      }
      if (this.__shouldContinueChunking) {
        this.__debounceRender(this.__render);
      }
    }
    __updateInstances(items, limit, isntIdxToItemsIdx) {
      const itemsIdxToInstIdx = (this.__itemsIdxToInstIdx = {});
      let instIdx;
      for (instIdx = 0; instIdx < limit; instIdx++) {
        let inst = this.__instances[instIdx];
        let itemIdx = isntIdxToItemsIdx[instIdx];
        let item = items[itemIdx];
        itemsIdxToInstIdx[itemIdx] = instIdx;
        if (inst) {
          inst._setPendingProperty(this.as, item);
          inst._setPendingProperty(this.indexAs, instIdx);
          inst._setPendingProperty(this.itemsIndexAs, itemIdx);
          inst._flushProperties();
        } else {
          this.__insertInstance(item, instIdx, itemIdx);
        }
      }
      for (let i = this.__instances.length - 1; i >= instIdx; i--) {
        this.__detachAndRemoveInstance(i);
      }
    }
    __detachInstance(idx) {
      let inst = this.__instances[idx];
      const wrappedRoot = wrap2(inst.root);
      for (let i = 0; i < inst.children.length; i++) {
        let el = inst.children[i];
        wrappedRoot.appendChild(el);
      }
      return inst;
    }
    __attachInstance(idx, parent) {
      let inst = this.__instances[idx];
      parent.insertBefore(inst.root, this);
    }
    __detachAndRemoveInstance(idx) {
      this.__detachInstance(idx);
      this.__instances.splice(idx, 1);
    }
    __stampInstance(item, instIdx, itemIdx) {
      let model = {};
      model[this.as] = item;
      model[this.indexAs] = instIdx;
      model[this.itemsIndexAs] = itemIdx;
      return new this.__ctor(model);
    }
    __insertInstance(item, instIdx, itemIdx) {
      const inst = this.__stampInstance(item, instIdx, itemIdx);
      let beforeRow = this.__instances[instIdx + 1];
      let beforeNode = beforeRow ? beforeRow.children[0] : this;
      wrap2(wrap2(this).parentNode).insertBefore(inst.root, beforeNode);
      this.__instances[instIdx] = inst;
      return inst;
    }
    // Implements extension point from Templatize mixin
    /**
     * Shows or hides the template instance top level child elements. For
     * text nodes, `textContent` is removed while "hidden" and replaced when
     * "shown."
     * @param {boolean} hidden Set to true to hide the children;
     * set to false to show them.
     * @return {void}
     * @protected
     */
    _showHideChildren(hidden) {
      for (let i = 0; i < this.__instances.length; i++) {
        this.__instances[i]._showHideChildren(hidden);
      }
    }
    // Called as a side effect of a host items.<key>.<path> path change,
    // responsible for notifying item.<path> changes to inst for key
    __handleItemPath(path, value) {
      let itemsPath = path.slice(6);
      let dot = itemsPath.indexOf(".");
      let itemsIdx = dot < 0 ? itemsPath : itemsPath.substring(0, dot);
      if (itemsIdx == parseInt(itemsIdx, 10)) {
        let itemSubPath = dot < 0 ? "" : itemsPath.substring(dot + 1);
        this.__handleObservedPaths(itemSubPath);
        let instIdx = this.__itemsIdxToInstIdx[itemsIdx];
        let inst = this.__instances[instIdx];
        if (inst) {
          let itemPath = this.as + (itemSubPath ? "." + itemSubPath : "");
          inst._setPendingPropertyOrPath(itemPath, value, false, true);
          inst._flushProperties();
        }
        return true;
      }
    }
    /**
     * Returns the item associated with a given element stamped by
     * this `dom-repeat`.
     *
     * Note, to modify sub-properties of the item,
     * `modelForElement(el).set('item.<sub-prop>', value)`
     * should be used.
     *
     * @param {!HTMLElement} el Element for which to return the item.
     * @return {*} Item associated with the element.
     */
    itemForElement(el) {
      let instance = this.modelForElement(el);
      return instance && instance[this.as];
    }
    /**
     * Returns the inst index for a given element stamped by this `dom-repeat`.
     * If `sort` is provided, the index will reflect the sorted order (rather
     * than the original array order).
     *
     * @param {!HTMLElement} el Element for which to return the index.
     * @return {?number} Row index associated with the element (note this may
     *   not correspond to the array index if a user `sort` is applied).
     */
    indexForElement(el) {
      let instance = this.modelForElement(el);
      return instance && instance[this.indexAs];
    }
    /**
     * Returns the template "model" associated with a given element, which
     * serves as the binding scope for the template instance the element is
     * contained in. A template model
     * should be used to manipulate data associated with this template instance.
     *
     * Example:
     *
     *   let model = modelForElement(el);
     *   if (model.index < 10) {
     *     model.set('item.checked', true);
     *   }
     *
     * @param {!HTMLElement} el Element for which to return a template model.
     * @return {TemplateInstanceBase} Model representing the binding scope for
     *   the element.
     */
    modelForElement(el) {
      return modelForElement(this.template, el);
    }
  };
  customElements.define(DomRepeat.is, DomRepeat);

  // node_modules/.pnpm/@polymer+polymer@3.5.1/node_modules/@polymer/polymer/lib/elements/dom-if.js
  var DomIfBase = class extends PolymerElement {
    // Not needed to find template; can be removed once the analyzer
    // can find the tag name from customElements.define call
    static get is() {
      return "dom-if";
    }
    static get template() {
      return null;
    }
    static get properties() {
      return {
        /**
         * Fired whenever DOM is added or removed/hidden by this template (by
         * default, rendering occurs lazily).  To force immediate rendering, call
         * `render`.
         *
         * @event dom-change
         */
        /**
         * A boolean indicating whether this template should stamp.
         */
        if: {
          type: Boolean,
          observer: "__debounceRender",
        },
        /**
         * When true, elements will be removed from DOM and discarded when `if`
         * becomes false and re-created and added back to the DOM when `if`
         * becomes true.  By default, stamped elements will be hidden but left
         * in the DOM when `if` becomes false, which is generally results
         * in better performance.
         */
        restamp: {
          type: Boolean,
          observer: "__debounceRender",
        },
        /**
         * When the global `suppressTemplateNotifications` setting is used, setting
         * `notifyDomChange: true` will enable firing `dom-change` events on this
         * element.
         */
        notifyDomChange: {
          type: Boolean,
        },
      };
    }
    constructor() {
      super();
      this.__renderDebouncer = null;
      this._lastIf = false;
      this.__hideTemplateChildren__ = false;
      this.__template;
      this._templateInfo;
    }
    __debounceRender() {
      this.__renderDebouncer = Debouncer.debounce(
        this.__renderDebouncer,
        microTask,
        () => this.__render()
      );
      enqueueDebouncer(this.__renderDebouncer);
    }
    /**
     * @override
     * @return {void}
     */
    disconnectedCallback() {
      super.disconnectedCallback();
      const parent = wrap2(this).parentNode;
      if (
        !parent ||
        (parent.nodeType == Node.DOCUMENT_FRAGMENT_NODE && !wrap2(parent).host)
      ) {
        this.__teardownInstance();
      }
    }
    /**
     * @override
     * @return {void}
     */
    connectedCallback() {
      super.connectedCallback();
      if (!hideElementsGlobally()) {
        this.style.display = "none";
      }
      if (this.if) {
        this.__debounceRender();
      }
    }
    /**
     * Ensures a template has been assigned to `this.__template`.  If it has not
     * yet been, it querySelectors for it in its children and if it does not yet
     * exist (e.g. in parser-generated case), opens a mutation observer and
     * waits for it to appear (returns false if it has not yet been found,
     * otherwise true).  In the `removeNestedTemplates` case, the "template" will
     * be the `dom-if` element itself.
     *
     * @return {boolean} True when a template has been found, false otherwise
     */
    __ensureTemplate() {
      if (!this.__template) {
        const thisAsTemplate =
          /** @type {!HTMLTemplateElement} */
          /** @type {!HTMLElement} */
          this;
        let template4 = thisAsTemplate._templateInfo
          ? thisAsTemplate
          : /** @type {!HTMLTemplateElement} */
            wrap2(thisAsTemplate).querySelector("template");
        if (!template4) {
          let observer2 = new MutationObserver(() => {
            if (wrap2(this).querySelector("template")) {
              observer2.disconnect();
              this.__render();
            } else {
              throw new Error("dom-if requires a <template> child");
            }
          });
          observer2.observe(this, { childList: true });
          return false;
        }
        this.__template = template4;
      }
      return true;
    }
    /**
     * Ensures a an instance of the template has been created and inserted. This
     * method may return false if the template has not yet been found or if
     * there is no `parentNode` to insert the template into (in either case,
     * connection or the template-finding mutation observer firing will queue
     * another render, causing this method to be called again at a more
     * appropriate time).
     *
     * Subclasses should implement the following methods called here:
     * - `__hasInstance`
     * - `__createAndInsertInstance`
     * - `__getInstanceNodes`
     *
     * @return {boolean} True if the instance was created, false otherwise.
     */
    __ensureInstance() {
      let parentNode = wrap2(this).parentNode;
      if (!this.__hasInstance()) {
        if (!parentNode) {
          return false;
        }
        if (!this.__ensureTemplate()) {
          return false;
        }
        this.__createAndInsertInstance(parentNode);
      } else {
        let children = this.__getInstanceNodes();
        if (children && children.length) {
          let lastChild = wrap2(this).previousSibling;
          if (lastChild !== children[children.length - 1]) {
            for (let i = 0, n; i < children.length && (n = children[i]); i++) {
              wrap2(parentNode).insertBefore(n, this);
            }
          }
        }
      }
      return true;
    }
    /**
     * Forces the element to render its content. Normally rendering is
     * asynchronous to a provoking change. This is done for efficiency so
     * that multiple changes trigger only a single render. The render method
     * should be called if, for example, template rendering is required to
     * validate application state.
     *
     * @return {void}
     */
    render() {
      flush();
    }
    /**
     * Performs the key rendering steps:
     * 1. Ensure a template instance has been stamped (when true)
     * 2. Remove the template instance (when false and restamp:true)
     * 3. Sync the hidden state of the instance nodes with the if/restamp state
     * 4. Fires the `dom-change` event when necessary
     *
     * @return {void}
     */
    __render() {
      if (this.if) {
        if (!this.__ensureInstance()) {
          return;
        }
      } else if (this.restamp) {
        this.__teardownInstance();
      }
      this._showHideChildren();
      if (
        (!suppressTemplateNotifications || this.notifyDomChange) &&
        this.if != this._lastIf
      ) {
        this.dispatchEvent(
          new CustomEvent("dom-change", {
            bubbles: true,
            composed: true,
          })
        );
        this._lastIf = this.if;
      }
    }
    // Ideally these would be annotated as abstract methods in an abstract class,
    // but closure compiler is finnicky
    /* eslint-disable valid-jsdoc */
    /**
     * Abstract API to be implemented by subclass: Returns true if a template
     * instance has been created and inserted.
     *
     * @protected
     * @return {boolean} True when an instance has been created.
     */
    __hasInstance() {}
    /**
     * Abstract API to be implemented by subclass: Returns the child nodes stamped
     * from a template instance.
     *
     * @protected
     * @return {Array<Node>} Array of child nodes stamped from the template
     * instance.
     */
    __getInstanceNodes() {}
    /**
     * Abstract API to be implemented by subclass: Creates an instance of the
     * template and inserts it into the given parent node.
     *
     * @protected
     * @param {Node} parentNode The parent node to insert the instance into
     * @return {void}
     */
    __createAndInsertInstance(parentNode) {}
    // eslint-disable-line no-unused-vars
    /**
     * Abstract API to be implemented by subclass: Removes nodes created by an
     * instance of a template and any associated cleanup.
     *
     * @protected
     * @return {void}
     */
    __teardownInstance() {}
    /**
     * Abstract API to be implemented by subclass: Shows or hides any template
     * instance childNodes based on the `if` state of the element and its
     * `__hideTemplateChildren__` property.
     *
     * @protected
     * @return {void}
     */
    _showHideChildren() {}
    /* eslint-enable valid-jsdoc */
  };
  var DomIfFast = class extends DomIfBase {
    constructor() {
      super();
      this.__instance = null;
      this.__syncInfo = null;
    }
    /**
     * Implementation of abstract API needed by DomIfBase.
     *
     * @override
     * @return {boolean} True when an instance has been created.
     */
    __hasInstance() {
      return Boolean(this.__instance);
    }
    /**
     * Implementation of abstract API needed by DomIfBase.
     *
     * @override
     * @return {Array<Node>} Array of child nodes stamped from the template
     * instance.
     */
    __getInstanceNodes() {
      return this.__instance.templateInfo.childNodes;
    }
    /**
     * Implementation of abstract API needed by DomIfBase.
     *
     * Stamps the template by calling `_stampTemplate` on the `__dataHost` of this
     * element and then inserts the resulting nodes into the given `parentNode`.
     *
     * @override
     * @param {Node} parentNode The parent node to insert the instance into
     * @return {void}
     */
    __createAndInsertInstance(parentNode) {
      const host = this.__dataHost || this;
      if (strictTemplatePolicy) {
        if (!this.__dataHost) {
          throw new Error("strictTemplatePolicy: template owner not trusted");
        }
      }
      const templateInfo = host._bindTemplate(
        /** @type {!HTMLTemplateElement} */
        this.__template,
        true
      );
      templateInfo.runEffects = (runEffects2, changedProps, hasPaths) => {
        let syncInfo = this.__syncInfo;
        if (this.if) {
          if (syncInfo) {
            this.__syncInfo = null;
            this._showHideChildren();
            changedProps = Object.assign(syncInfo.changedProps, changedProps);
          }
          runEffects2(changedProps, hasPaths);
        } else {
          if (this.__instance) {
            if (!syncInfo) {
              syncInfo = this.__syncInfo = {
                runEffects: runEffects2,
                changedProps: {},
              };
            }
            if (hasPaths) {
              for (const p2 in changedProps) {
                const rootProp = root(p2);
                syncInfo.changedProps[rootProp] = this.__dataHost[rootProp];
              }
            } else {
              Object.assign(syncInfo.changedProps, changedProps);
            }
          }
        }
      };
      this.__instance = host._stampTemplate(
        /** @type {!HTMLTemplateElement} */
        this.__template,
        templateInfo
      );
      wrap2(parentNode).insertBefore(this.__instance, this);
    }
    /**
     * Run effects for any properties that changed while the `if` was false.
     *
     * @return {void}
     */
    __syncHostProperties() {
      const syncInfo = this.__syncInfo;
      if (syncInfo) {
        this.__syncInfo = null;
        syncInfo.runEffects(syncInfo.changedProps, false);
      }
    }
    /**
     * Implementation of abstract API needed by DomIfBase.
     *
     * Remove the instance and any nodes it created.  Uses the `__dataHost`'s
     * runtime `_removeBoundDom` method.
     *
     * @override
     * @return {void}
     */
    __teardownInstance() {
      const host = this.__dataHost || this;
      if (this.__instance) {
        host._removeBoundDom(this.__instance);
        this.__instance = null;
        this.__syncInfo = null;
      }
    }
    /**
     * Implementation of abstract API needed by DomIfBase.
     *
     * Shows or hides the template instance top level child nodes. For
     * text nodes, `textContent` is removed while "hidden" and replaced when
     * "shown."
     *
     * @override
     * @return {void}
     * @protected
     * @suppress {visibility}
     */
    _showHideChildren() {
      const hidden = this.__hideTemplateChildren__ || !this.if;
      if (this.__instance && Boolean(this.__instance.__hidden) !== hidden) {
        this.__instance.__hidden = hidden;
        showHideChildren(hidden, this.__instance.templateInfo.childNodes);
      }
      if (!hidden) {
        this.__syncHostProperties();
      }
    }
  };
  var DomIfLegacy = class extends DomIfBase {
    constructor() {
      super();
      this.__ctor = null;
      this.__instance = null;
      this.__invalidProps = null;
    }
    /**
     * Implementation of abstract API needed by DomIfBase.
     *
     * @override
     * @return {boolean} True when an instance has been created.
     */
    __hasInstance() {
      return Boolean(this.__instance);
    }
    /**
     * Implementation of abstract API needed by DomIfBase.
     *
     * @override
     * @return {Array<Node>} Array of child nodes stamped from the template
     * instance.
     */
    __getInstanceNodes() {
      return this.__instance.children;
    }
    /**
     * Implementation of abstract API needed by DomIfBase.
     *
     * Stamps the template by creating a new instance of the templatized
     * constructor (which is created lazily if it does not yet exist), and then
     * inserts its resulting `root` doc fragment into the given `parentNode`.
     *
     * @override
     * @param {Node} parentNode The parent node to insert the instance into
     * @return {void}
     */
    __createAndInsertInstance(parentNode) {
      if (!this.__ctor) {
        this.__ctor = templatize(
          /** @type {!HTMLTemplateElement} */
          this.__template,
          this,
          {
            // dom-if templatizer instances require `mutable: true`, as
            // `__syncHostProperties` relies on that behavior to sync objects
            mutableData: true,
            /**
             * @param {string} prop Property to forward
             * @param {*} value Value of property
             * @this {DomIfLegacy}
             */
            forwardHostProp: function (prop, value) {
              if (this.__instance) {
                if (this.if) {
                  this.__instance.forwardHostProp(prop, value);
                } else {
                  this.__invalidProps =
                    this.__invalidProps || /* @__PURE__ */ Object.create(null);
                  this.__invalidProps[root(prop)] = true;
                }
              }
            },
          }
        );
      }
      this.__instance = new this.__ctor();
      wrap2(parentNode).insertBefore(this.__instance.root, this);
    }
    /**
     * Implementation of abstract API needed by DomIfBase.
     *
     * Removes the instance and any nodes it created.
     *
     * @override
     * @return {void}
     */
    __teardownInstance() {
      if (this.__instance) {
        let c$ = this.__instance.children;
        if (c$ && c$.length) {
          let parent = wrap2(c$[0]).parentNode;
          if (parent) {
            parent = wrap2(parent);
            for (let i = 0, n; i < c$.length && (n = c$[i]); i++) {
              parent.removeChild(n);
            }
          }
        }
        this.__invalidProps = null;
        this.__instance = null;
      }
    }
    /**
     * Forwards any properties that changed while the `if` was false into the
     * template instance and flushes it.
     *
     * @return {void}
     */
    __syncHostProperties() {
      let props = this.__invalidProps;
      if (props) {
        this.__invalidProps = null;
        for (let prop in props) {
          this.__instance._setPendingProperty(prop, this.__dataHost[prop]);
        }
        this.__instance._flushProperties();
      }
    }
    /**
     * Implementation of abstract API needed by DomIfBase.
     *
     * Shows or hides the template instance top level child elements. For
     * text nodes, `textContent` is removed while "hidden" and replaced when
     * "shown."
     *
     * @override
     * @protected
     * @return {void}
     * @suppress {visibility}
     */
    _showHideChildren() {
      const hidden = this.__hideTemplateChildren__ || !this.if;
      if (this.__instance && Boolean(this.__instance.__hidden) !== hidden) {
        this.__instance.__hidden = hidden;
        this.__instance._showHideChildren(hidden);
      }
      if (!hidden) {
        this.__syncHostProperties();
      }
    }
  };
  var DomIf = fastDomIf ? DomIfFast : DomIfLegacy;
  customElements.define(DomIf.is, DomIf);

  // node_modules/.pnpm/@polymer+polymer@3.5.1/node_modules/@polymer/polymer/lib/elements/array-selector.js
  var ArraySelectorMixin = dedupingMixin((superClass) => {
    let elementBase = ElementMixin(superClass);
    class ArraySelectorMixin2 extends elementBase {
      static get properties() {
        return {
          /**
           * An array containing items from which selection will be made.
           */
          items: {
            type: Array,
          },
          /**
           * When `true`, multiple items may be selected at once (in this case,
           * `selected` is an array of currently selected items).  When `false`,
           * only one item may be selected at a time.
           */
          multi: {
            type: Boolean,
            value: false,
          },
          /**
           * When `multi` is true, this is an array that contains any selected.
           * When `multi` is false, this is the currently selected item, or `null`
           * if no item is selected.
           * @type {?Object|?Array<!Object>}
           */
          selected: { type: Object, notify: true },
          /**
           * When `multi` is false, this is the currently selected item, or `null`
           * if no item is selected.
           * @type {?Object}
           */
          selectedItem: { type: Object, notify: true },
          /**
           * When `true`, calling `select` on an item that is already selected
           * will deselect the item.
           */
          toggle: { type: Boolean, value: false },
        };
      }
      static get observers() {
        return ["__updateSelection(multi, items.*)"];
      }
      constructor() {
        super();
        this.__lastItems = null;
        this.__lastMulti = null;
        this.__selectedMap = null;
      }
      __updateSelection(multi, itemsInfo) {
        let path = itemsInfo.path;
        if (path == JSCompiler_renameProperty("items", this)) {
          let newItems = itemsInfo.base || [];
          let lastItems = this.__lastItems;
          let lastMulti = this.__lastMulti;
          if (multi !== lastMulti) {
            this.clearSelection();
          }
          if (lastItems) {
            let splices = calculateSplices(newItems, lastItems);
            this.__applySplices(splices);
          }
          this.__lastItems = newItems;
          this.__lastMulti = multi;
        } else if (
          itemsInfo.path ==
          `${JSCompiler_renameProperty("items", this)}.splices`
        ) {
          this.__applySplices(itemsInfo.value.indexSplices);
        } else {
          let part = path.slice(
            `${JSCompiler_renameProperty("items", this)}.`.length
          );
          let idx = parseInt(part, 10);
          if (part.indexOf(".") < 0 && part == idx) {
            this.__deselectChangedIdx(idx);
          }
        }
      }
      __applySplices(splices) {
        let selected = this.__selectedMap;
        for (let i = 0; i < splices.length; i++) {
          let s = splices[i];
          selected.forEach((idx, item) => {
            if (idx < s.index) {
            } else if (idx >= s.index + s.removed.length) {
              selected.set(item, idx + s.addedCount - s.removed.length);
            } else {
              selected.set(item, -1);
            }
          });
          for (let j = 0; j < s.addedCount; j++) {
            let idx = s.index + j;
            if (selected.has(this.items[idx])) {
              selected.set(this.items[idx], idx);
            }
          }
        }
        this.__updateLinks();
        let sidx = 0;
        selected.forEach((idx, item) => {
          if (idx < 0) {
            if (this.multi) {
              this.splice(JSCompiler_renameProperty("selected", this), sidx, 1);
            } else {
              this.selected = this.selectedItem = null;
            }
            selected.delete(item);
          } else {
            sidx++;
          }
        });
      }
      __updateLinks() {
        this.__dataLinkedPaths = {};
        if (this.multi) {
          let sidx = 0;
          this.__selectedMap.forEach((idx) => {
            if (idx >= 0) {
              this.linkPaths(
                `${JSCompiler_renameProperty("items", this)}.${idx}`,
                `${JSCompiler_renameProperty("selected", this)}.${sidx++}`
              );
            }
          });
        } else {
          this.__selectedMap.forEach((idx) => {
            this.linkPaths(
              JSCompiler_renameProperty("selected", this),
              `${JSCompiler_renameProperty("items", this)}.${idx}`
            );
            this.linkPaths(
              JSCompiler_renameProperty("selectedItem", this),
              `${JSCompiler_renameProperty("items", this)}.${idx}`
            );
          });
        }
      }
      /**
       * Clears the selection state.
       * @override
       * @return {void}
       */
      clearSelection() {
        this.__dataLinkedPaths = {};
        this.__selectedMap = /* @__PURE__ */ new Map();
        this.selected = this.multi ? [] : null;
        this.selectedItem = null;
      }
      /**
       * Returns whether the item is currently selected.
       *
       * @override
       * @param {*} item Item from `items` array to test
       * @return {boolean} Whether the item is selected
       */
      isSelected(item) {
        return this.__selectedMap.has(item);
      }
      /**
       * Returns whether the item is currently selected.
       *
       * @override
       * @param {number} idx Index from `items` array to test
       * @return {boolean} Whether the item is selected
       */
      isIndexSelected(idx) {
        return this.isSelected(this.items[idx]);
      }
      __deselectChangedIdx(idx) {
        let sidx = this.__selectedIndexForItemIndex(idx);
        if (sidx >= 0) {
          let i = 0;
          this.__selectedMap.forEach((idx2, item) => {
            if (sidx == i++) {
              this.deselect(item);
            }
          });
        }
      }
      __selectedIndexForItemIndex(idx) {
        let selected =
          this.__dataLinkedPaths[
            `${JSCompiler_renameProperty("items", this)}.${idx}`
          ];
        if (selected) {
          return parseInt(
            selected.slice(
              `${JSCompiler_renameProperty("selected", this)}.`.length
            ),
            10
          );
        }
      }
      /**
       * Deselects the given item if it is already selected.
       *
       * @override
       * @param {*} item Item from `items` array to deselect
       * @return {void}
       */
      deselect(item) {
        let idx = this.__selectedMap.get(item);
        if (idx >= 0) {
          this.__selectedMap.delete(item);
          let sidx;
          if (this.multi) {
            sidx = this.__selectedIndexForItemIndex(idx);
          }
          this.__updateLinks();
          if (this.multi) {
            this.splice(JSCompiler_renameProperty("selected", this), sidx, 1);
          } else {
            this.selected = this.selectedItem = null;
          }
        }
      }
      /**
       * Deselects the given index if it is already selected.
       *
       * @override
       * @param {number} idx Index from `items` array to deselect
       * @return {void}
       */
      deselectIndex(idx) {
        this.deselect(this.items[idx]);
      }
      /**
       * Selects the given item.  When `toggle` is true, this will automatically
       * deselect the item if already selected.
       *
       * @override
       * @param {*} item Item from `items` array to select
       * @return {void}
       */
      select(item) {
        this.selectIndex(this.items.indexOf(item));
      }
      /**
       * Selects the given index.  When `toggle` is true, this will automatically
       * deselect the item if already selected.
       *
       * @override
       * @param {number} idx Index from `items` array to select
       * @return {void}
       */
      selectIndex(idx) {
        let item = this.items[idx];
        if (!this.isSelected(item)) {
          if (!this.multi) {
            this.__selectedMap.clear();
          }
          this.__selectedMap.set(item, idx);
          this.__updateLinks();
          if (this.multi) {
            this.push(JSCompiler_renameProperty("selected", this), item);
          } else {
            this.selected = this.selectedItem = item;
          }
        } else if (this.toggle) {
          this.deselectIndex(idx);
        }
      }
    }
    return ArraySelectorMixin2;
  });
  var baseArraySelector = ArraySelectorMixin(PolymerElement);
  var ArraySelector = class extends baseArraySelector {
    // Not needed to find template; can be removed once the analyzer
    // can find the tag name from customElements.define call
    static get is() {
      return "array-selector";
    }
    static get template() {
      return null;
    }
  };
  customElements.define(ArraySelector.is, ArraySelector);

  // node_modules/.pnpm/@webcomponents+shadycss@1.11.2/node_modules/@webcomponents/shadycss/entrypoints/custom-style-interface.js
  var customStyleInterface = new CustomStyleInterface();
  if (!window.ShadyCSS) {
    window.ShadyCSS = {
      /**
       * @param {!HTMLTemplateElement} template
       * @param {string} elementName
       * @param {string=} elementExtends
       */
      prepareTemplate(template4, elementName, elementExtends) {},
      // eslint-disable-line @typescript-eslint/no-unused-vars
      /**
       * @param {!HTMLTemplateElement} template
       * @param {string} elementName
       */
      prepareTemplateDom(template4, elementName) {},
      // eslint-disable-line @typescript-eslint/no-unused-vars
      /**
       * @param {!HTMLTemplateElement} template
       * @param {string} elementName
       * @param {string=} elementExtends
       */
      prepareTemplateStyles(template4, elementName, elementExtends) {},
      // eslint-disable-line @typescript-eslint/no-unused-vars
      /**
       * @param {Element} element
       * @param {Object=} properties
       */
      styleSubtree(element, properties) {
        customStyleInterface.processStyles();
        updateNativeProperties(element, properties);
      },
      /**
       * @param {Element} element
       */
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      styleElement(element) {
        customStyleInterface.processStyles();
      },
      /**
       * @param {Object=} properties
       */
      styleDocument(properties) {
        customStyleInterface.processStyles();
        updateNativeProperties(document.body, properties);
      },
      /**
       * @param {Element} element
       * @param {string} property
       * @return {string}
       */
      getComputedStyleValue(element, property) {
        return getComputedStyleValue(element, property);
      },
      flushCustomStyles() {},
      nativeCss: nativeCssVariables,
      nativeShadow,
      cssBuild,
      disableRuntime,
    };
  }
  window.ShadyCSS.CustomStyleInterface = customStyleInterface;

  // node_modules/.pnpm/@polymer+polymer@3.5.1/node_modules/@polymer/polymer/lib/elements/custom-style.js
  var attr = "include";
  var CustomStyleInterface2 = window.ShadyCSS.CustomStyleInterface;
  var CustomStyle = class extends HTMLElement {
    constructor() {
      super();
      this._style = null;
      CustomStyleInterface2.addCustomStyle(this);
    }
    /**
     * Returns the light-DOM `<style>` child this element wraps.  Upon first
     * call any style modules referenced via the `include` attribute will be
     * concatenated to this element's `<style>`.
     *
     * @export
     * @return {HTMLStyleElement} This element's light-DOM `<style>`
     */
    getStyle() {
      if (this._style) {
        return this._style;
      }
      const style =
        /** @type {HTMLStyleElement} */
        this.querySelector("style");
      if (!style) {
        return null;
      }
      this._style = style;
      const include = style.getAttribute(attr);
      if (include) {
        style.removeAttribute(attr);
        style.textContent = cssFromModules(include) + style.textContent;
      }
      if (this.ownerDocument !== window.document) {
        window.document.head.appendChild(this);
      }
      return this._style;
    }
  };
  window.customElements.define("custom-style", CustomStyle);

  // node_modules/.pnpm/@polymer+polymer@3.5.1/node_modules/@polymer/polymer/lib/legacy/mutable-data-behavior.js
  var mutablePropertyChange2;
  (() => {
    mutablePropertyChange2 = MutableData._mutablePropertyChange;
  })();

  // node_modules/.pnpm/@polymer+polymer@3.5.1/node_modules/@polymer/polymer/polymer-legacy.js
  var Base = LegacyElementMixin(HTMLElement).prototype;

  // node_modules/.pnpm/@polymer+paper-styles@3.0.1/node_modules/@polymer/paper-styles/color.js
  var template = html`
    <custom-style>
      <style is="custom-style">
        html {
          /* Material Design color palette for Google products */

          --google-red-100: #f4c7c3;
          --google-red-300: #e67c73;
          --google-red-500: #db4437;
          --google-red-700: #c53929;

          --google-blue-100: #c6dafc;
          --google-blue-300: #7baaf7;
          --google-blue-500: #4285f4;
          --google-blue-700: #3367d6;

          --google-green-100: #b7e1cd;
          --google-green-300: #57bb8a;
          --google-green-500: #0f9d58;
          --google-green-700: #0b8043;

          --google-yellow-100: #fce8b2;
          --google-yellow-300: #f7cb4d;
          --google-yellow-500: #f4b400;
          --google-yellow-700: #f09300;

          --google-grey-100: #f5f5f5;
          --google-grey-300: #e0e0e0;
          --google-grey-500: #9e9e9e;
          --google-grey-700: #616161;

          /* Material Design color palette from online spec document */

          --paper-red-50: #ffebee;
          --paper-red-100: #ffcdd2;
          --paper-red-200: #ef9a9a;
          --paper-red-300: #e57373;
          --paper-red-400: #ef5350;
          --paper-red-500: #f44336;
          --paper-red-600: #e53935;
          --paper-red-700: #d32f2f;
          --paper-red-800: #c62828;
          --paper-red-900: #b71c1c;
          --paper-red-a100: #ff8a80;
          --paper-red-a200: #ff5252;
          --paper-red-a400: #ff1744;
          --paper-red-a700: #d50000;

          --paper-pink-50: #fce4ec;
          --paper-pink-100: #f8bbd0;
          --paper-pink-200: #f48fb1;
          --paper-pink-300: #f06292;
          --paper-pink-400: #ec407a;
          --paper-pink-500: #e91e63;
          --paper-pink-600: #d81b60;
          --paper-pink-700: #c2185b;
          --paper-pink-800: #ad1457;
          --paper-pink-900: #880e4f;
          --paper-pink-a100: #ff80ab;
          --paper-pink-a200: #ff4081;
          --paper-pink-a400: #f50057;
          --paper-pink-a700: #c51162;

          --paper-purple-50: #f3e5f5;
          --paper-purple-100: #e1bee7;
          --paper-purple-200: #ce93d8;
          --paper-purple-300: #ba68c8;
          --paper-purple-400: #ab47bc;
          --paper-purple-500: #9c27b0;
          --paper-purple-600: #8e24aa;
          --paper-purple-700: #7b1fa2;
          --paper-purple-800: #6a1b9a;
          --paper-purple-900: #4a148c;
          --paper-purple-a100: #ea80fc;
          --paper-purple-a200: #e040fb;
          --paper-purple-a400: #d500f9;
          --paper-purple-a700: #aa00ff;

          --paper-deep-purple-50: #ede7f6;
          --paper-deep-purple-100: #d1c4e9;
          --paper-deep-purple-200: #b39ddb;
          --paper-deep-purple-300: #9575cd;
          --paper-deep-purple-400: #7e57c2;
          --paper-deep-purple-500: #673ab7;
          --paper-deep-purple-600: #5e35b1;
          --paper-deep-purple-700: #512da8;
          --paper-deep-purple-800: #4527a0;
          --paper-deep-purple-900: #311b92;
          --paper-deep-purple-a100: #b388ff;
          --paper-deep-purple-a200: #7c4dff;
          --paper-deep-purple-a400: #651fff;
          --paper-deep-purple-a700: #6200ea;

          --paper-indigo-50: #e8eaf6;
          --paper-indigo-100: #c5cae9;
          --paper-indigo-200: #9fa8da;
          --paper-indigo-300: #7986cb;
          --paper-indigo-400: #5c6bc0;
          --paper-indigo-500: #3f51b5;
          --paper-indigo-600: #3949ab;
          --paper-indigo-700: #303f9f;
          --paper-indigo-800: #283593;
          --paper-indigo-900: #1a237e;
          --paper-indigo-a100: #8c9eff;
          --paper-indigo-a200: #536dfe;
          --paper-indigo-a400: #3d5afe;
          --paper-indigo-a700: #304ffe;

          --paper-blue-50: #e3f2fd;
          --paper-blue-100: #bbdefb;
          --paper-blue-200: #90caf9;
          --paper-blue-300: #64b5f6;
          --paper-blue-400: #42a5f5;
          --paper-blue-500: #2196f3;
          --paper-blue-600: #1e88e5;
          --paper-blue-700: #1976d2;
          --paper-blue-800: #1565c0;
          --paper-blue-900: #0d47a1;
          --paper-blue-a100: #82b1ff;
          --paper-blue-a200: #448aff;
          --paper-blue-a400: #2979ff;
          --paper-blue-a700: #2962ff;

          --paper-light-blue-50: #e1f5fe;
          --paper-light-blue-100: #b3e5fc;
          --paper-light-blue-200: #81d4fa;
          --paper-light-blue-300: #4fc3f7;
          --paper-light-blue-400: #29b6f6;
          --paper-light-blue-500: #03a9f4;
          --paper-light-blue-600: #039be5;
          --paper-light-blue-700: #0288d1;
          --paper-light-blue-800: #0277bd;
          --paper-light-blue-900: #01579b;
          --paper-light-blue-a100: #80d8ff;
          --paper-light-blue-a200: #40c4ff;
          --paper-light-blue-a400: #00b0ff;
          --paper-light-blue-a700: #0091ea;

          --paper-cyan-50: #e0f7fa;
          --paper-cyan-100: #b2ebf2;
          --paper-cyan-200: #80deea;
          --paper-cyan-300: #4dd0e1;
          --paper-cyan-400: #26c6da;
          --paper-cyan-500: #00bcd4;
          --paper-cyan-600: #00acc1;
          --paper-cyan-700: #0097a7;
          --paper-cyan-800: #00838f;
          --paper-cyan-900: #006064;
          --paper-cyan-a100: #84ffff;
          --paper-cyan-a200: #18ffff;
          --paper-cyan-a400: #00e5ff;
          --paper-cyan-a700: #00b8d4;

          --paper-teal-50: #e0f2f1;
          --paper-teal-100: #b2dfdb;
          --paper-teal-200: #80cbc4;
          --paper-teal-300: #4db6ac;
          --paper-teal-400: #26a69a;
          --paper-teal-500: #009688;
          --paper-teal-600: #00897b;
          --paper-teal-700: #00796b;
          --paper-teal-800: #00695c;
          --paper-teal-900: #004d40;
          --paper-teal-a100: #a7ffeb;
          --paper-teal-a200: #64ffda;
          --paper-teal-a400: #1de9b6;
          --paper-teal-a700: #00bfa5;

          --paper-green-50: #e8f5e9;
          --paper-green-100: #c8e6c9;
          --paper-green-200: #a5d6a7;
          --paper-green-300: #81c784;
          --paper-green-400: #66bb6a;
          --paper-green-500: #4caf50;
          --paper-green-600: #43a047;
          --paper-green-700: #388e3c;
          --paper-green-800: #2e7d32;
          --paper-green-900: #1b5e20;
          --paper-green-a100: #b9f6ca;
          --paper-green-a200: #69f0ae;
          --paper-green-a400: #00e676;
          --paper-green-a700: #00c853;

          --paper-light-green-50: #f1f8e9;
          --paper-light-green-100: #dcedc8;
          --paper-light-green-200: #c5e1a5;
          --paper-light-green-300: #aed581;
          --paper-light-green-400: #9ccc65;
          --paper-light-green-500: #8bc34a;
          --paper-light-green-600: #7cb342;
          --paper-light-green-700: #689f38;
          --paper-light-green-800: #558b2f;
          --paper-light-green-900: #33691e;
          --paper-light-green-a100: #ccff90;
          --paper-light-green-a200: #b2ff59;
          --paper-light-green-a400: #76ff03;
          --paper-light-green-a700: #64dd17;

          --paper-lime-50: #f9fbe7;
          --paper-lime-100: #f0f4c3;
          --paper-lime-200: #e6ee9c;
          --paper-lime-300: #dce775;
          --paper-lime-400: #d4e157;
          --paper-lime-500: #cddc39;
          --paper-lime-600: #c0ca33;
          --paper-lime-700: #afb42b;
          --paper-lime-800: #9e9d24;
          --paper-lime-900: #827717;
          --paper-lime-a100: #f4ff81;
          --paper-lime-a200: #eeff41;
          --paper-lime-a400: #c6ff00;
          --paper-lime-a700: #aeea00;

          --paper-yellow-50: #fffde7;
          --paper-yellow-100: #fff9c4;
          --paper-yellow-200: #fff59d;
          --paper-yellow-300: #fff176;
          --paper-yellow-400: #ffee58;
          --paper-yellow-500: #ffeb3b;
          --paper-yellow-600: #fdd835;
          --paper-yellow-700: #fbc02d;
          --paper-yellow-800: #f9a825;
          --paper-yellow-900: #f57f17;
          --paper-yellow-a100: #ffff8d;
          --paper-yellow-a200: #ffff00;
          --paper-yellow-a400: #ffea00;
          --paper-yellow-a700: #ffd600;

          --paper-amber-50: #fff8e1;
          --paper-amber-100: #ffecb3;
          --paper-amber-200: #ffe082;
          --paper-amber-300: #ffd54f;
          --paper-amber-400: #ffca28;
          --paper-amber-500: #ffc107;
          --paper-amber-600: #ffb300;
          --paper-amber-700: #ffa000;
          --paper-amber-800: #ff8f00;
          --paper-amber-900: #ff6f00;
          --paper-amber-a100: #ffe57f;
          --paper-amber-a200: #ffd740;
          --paper-amber-a400: #ffc400;
          --paper-amber-a700: #ffab00;

          --paper-orange-50: #fff3e0;
          --paper-orange-100: #ffe0b2;
          --paper-orange-200: #ffcc80;
          --paper-orange-300: #ffb74d;
          --paper-orange-400: #ffa726;
          --paper-orange-500: #ff9800;
          --paper-orange-600: #fb8c00;
          --paper-orange-700: #f57c00;
          --paper-orange-800: #ef6c00;
          --paper-orange-900: #e65100;
          --paper-orange-a100: #ffd180;
          --paper-orange-a200: #ffab40;
          --paper-orange-a400: #ff9100;
          --paper-orange-a700: #ff6500;

          --paper-deep-orange-50: #fbe9e7;
          --paper-deep-orange-100: #ffccbc;
          --paper-deep-orange-200: #ffab91;
          --paper-deep-orange-300: #ff8a65;
          --paper-deep-orange-400: #ff7043;
          --paper-deep-orange-500: #ff5722;
          --paper-deep-orange-600: #f4511e;
          --paper-deep-orange-700: #e64a19;
          --paper-deep-orange-800: #d84315;
          --paper-deep-orange-900: #bf360c;
          --paper-deep-orange-a100: #ff9e80;
          --paper-deep-orange-a200: #ff6e40;
          --paper-deep-orange-a400: #ff3d00;
          --paper-deep-orange-a700: #dd2c00;

          --paper-brown-50: #efebe9;
          --paper-brown-100: #d7ccc8;
          --paper-brown-200: #bcaaa4;
          --paper-brown-300: #a1887f;
          --paper-brown-400: #8d6e63;
          --paper-brown-500: #795548;
          --paper-brown-600: #6d4c41;
          --paper-brown-700: #5d4037;
          --paper-brown-800: #4e342e;
          --paper-brown-900: #3e2723;

          --paper-grey-50: #fafafa;
          --paper-grey-100: #f5f5f5;
          --paper-grey-200: #eeeeee;
          --paper-grey-300: #e0e0e0;
          --paper-grey-400: #bdbdbd;
          --paper-grey-500: #9e9e9e;
          --paper-grey-600: #757575;
          --paper-grey-700: #616161;
          --paper-grey-800: #424242;
          --paper-grey-900: #212121;

          --paper-blue-grey-50: #eceff1;
          --paper-blue-grey-100: #cfd8dc;
          --paper-blue-grey-200: #b0bec5;
          --paper-blue-grey-300: #90a4ae;
          --paper-blue-grey-400: #78909c;
          --paper-blue-grey-500: #607d8b;
          --paper-blue-grey-600: #546e7a;
          --paper-blue-grey-700: #455a64;
          --paper-blue-grey-800: #37474f;
          --paper-blue-grey-900: #263238;

          /* opacity for dark text on a light background */
          --dark-divider-opacity: 0.12;
          --dark-disabled-opacity: 0.38; /* or hint text or icon */
          --dark-secondary-opacity: 0.54;
          --dark-primary-opacity: 0.87;

          /* opacity for light text on a dark background */
          --light-divider-opacity: 0.12;
          --light-disabled-opacity: 0.3; /* or hint text or icon */
          --light-secondary-opacity: 0.7;
          --light-primary-opacity: 1;
        }
      </style>
    </custom-style>
  `;
  template.setAttribute("style", "display: none;");
  document.head.appendChild(template.content);

  // node_modules/.pnpm/@polymer+paper-styles@3.0.1/node_modules/@polymer/paper-styles/default-theme.js
  var template2 = html` <custom-style>
    <style is="custom-style">
      html {
        /*
         * You can use these generic variables in your elements for easy theming.
         * For example, if all your elements use \`--primary-text-color\` as its main
         * color, then switching from a light to a dark theme is just a matter of
         * changing the value of \`--primary-text-color\` in your application.
         */
        --primary-text-color: var(--light-theme-text-color);
        --primary-background-color: var(--light-theme-background-color);
        --secondary-text-color: var(--light-theme-secondary-color);
        --disabled-text-color: var(--light-theme-disabled-color);
        --divider-color: var(--light-theme-divider-color);
        --error-color: var(--paper-deep-orange-a700);

        /*
         * Primary and accent colors. Also see color.js for more colors.
         */
        --primary-color: var(--paper-indigo-500);
        --light-primary-color: var(--paper-indigo-100);
        --dark-primary-color: var(--paper-indigo-700);

        --accent-color: var(--paper-pink-a200);
        --light-accent-color: var(--paper-pink-a100);
        --dark-accent-color: var(--paper-pink-a400);

        /*
         * Material Design Light background theme
         */
        --light-theme-background-color: #ffffff;
        --light-theme-base-color: #000000;
        --light-theme-text-color: var(--paper-grey-900);
        --light-theme-secondary-color: #737373; /* for secondary text and icons */
        --light-theme-disabled-color: #9b9b9b; /* disabled/hint text */
        --light-theme-divider-color: #dbdbdb;

        /*
         * Material Design Dark background theme
         */
        --dark-theme-background-color: var(--paper-grey-900);
        --dark-theme-base-color: #ffffff;
        --dark-theme-text-color: #ffffff;
        --dark-theme-secondary-color: #bcbcbc; /* for secondary text and icons */
        --dark-theme-disabled-color: #646464; /* disabled/hint text */
        --dark-theme-divider-color: #3c3c3c;

        /*
         * Deprecated values because of their confusing names.
         */
        --text-primary-color: var(--dark-theme-text-color);
        --default-primary-color: var(--primary-color);
      }
    </style>
  </custom-style>`;
  template2.setAttribute("style", "display: none;");
  document.head.appendChild(template2.content);

  // node_modules/.pnpm/@polymer+iron-form-element-behavior@3.0.1/node_modules/@polymer/iron-form-element-behavior/iron-form-element-behavior.js
  var IronFormElementBehavior = {
    properties: {
      /**
       * The name of this element.
       */
      name: { type: String },
      /**
       * The value for this element.
       * @type {*}
       */
      value: { notify: true, type: String },
      /**
       * Set to true to mark the input as required. If used in a form, a
       * custom element that uses this behavior should also use
       * IronValidatableBehavior and define a custom validation method.
       * Otherwise, a `required` element will always be considered valid.
       * It's also strongly recommended to provide a visual style for the element
       * when its value is invalid.
       */
      required: { type: Boolean, value: false },
    },
    // Empty implementations for backcompatibility.
    attached: function () {},
    detached: function () {},
  };

  // node_modules/.pnpm/@polymer+iron-meta@3.0.1/node_modules/@polymer/iron-meta/iron-meta.js
  var IronMeta = class _IronMeta {
    /**
     * @param {{
     *   type: (string|null|undefined),
     *   key: (string|null|undefined),
     *   value: *,
     * }=} options
     */
    constructor(options) {
      _IronMeta[" "](options);
      this.type = (options && options.type) || "default";
      this.key = options && options.key;
      if (options && "value" in options) {
        this.value = options.value;
      }
    }
    /** @return {*} */
    get value() {
      var type = this.type;
      var key = this.key;
      if (type && key) {
        return _IronMeta.types[type] && _IronMeta.types[type][key];
      }
    }
    /** @param {*} value */
    set value(value) {
      var type = this.type;
      var key = this.key;
      if (type && key) {
        type = _IronMeta.types[type] = _IronMeta.types[type] || {};
        if (value == null) {
          delete type[key];
        } else {
          type[key] = value;
        }
      }
    }
    /** @return {!Array<*>} */
    get list() {
      var type = this.type;
      if (type) {
        var items = _IronMeta.types[this.type];
        if (!items) {
          return [];
        }
        return Object.keys(items).map(function (key) {
          return metaDatas[this.type][key];
        }, this);
      }
    }
    /**
     * @param {string} key
     * @return {*}
     */
    byKey(key) {
      this.key = key;
      return this.value;
    }
  };
  IronMeta[" "] = function () {};
  IronMeta.types = {};
  var metaDatas = IronMeta.types;
  Polymer({
    is: "iron-meta",
    properties: {
      /**
       * The type of meta-data.  All meta-data of the same type is stored
       * together.
       * @type {string}
       */
      type: {
        type: String,
        value: "default",
      },
      /**
       * The key used to store `value` under the `type` namespace.
       * @type {?string}
       */
      key: {
        type: String,
      },
      /**
       * The meta-data to store or retrieve.
       * @type {*}
       */
      value: {
        type: String,
        notify: true,
      },
      /**
       * If true, `value` is set to the iron-meta instance itself.
       */
      self: { type: Boolean, observer: "_selfChanged" },
      __meta: { type: Boolean, computed: "__computeMeta(type, key, value)" },
    },
    hostAttributes: { hidden: true },
    __computeMeta: function (type, key, value) {
      var meta = new IronMeta({ type, key });
      if (value !== void 0 && value !== meta.value) {
        meta.value = value;
      } else if (this.value !== meta.value) {
        this.value = meta.value;
      }
      return meta;
    },
    get list() {
      return this.__meta && this.__meta.list;
    },
    _selfChanged: function (self) {
      if (self) {
        this.value = this;
      }
    },
    /**
     * Retrieves meta data value by key.
     *
     * @method byKey
     * @param {string} key The key of the meta-data to be returned.
     * @return {*}
     */
    byKey: function (key) {
      return new IronMeta({ type: this.type, key }).value;
    },
  });

  // node_modules/.pnpm/@polymer+iron-validatable-behavior@3.0.1/node_modules/@polymer/iron-validatable-behavior/iron-validatable-behavior.js
  var IronValidatableBehaviorMeta = null;
  var IronValidatableBehavior = {
    properties: {
      /**
       * Name of the validator to use.
       */
      validator: { type: String },
      /**
       * True if the last call to `validate` is invalid.
       */
      invalid: {
        notify: true,
        reflectToAttribute: true,
        type: Boolean,
        value: false,
        observer: "_invalidChanged",
      },
    },
    registered: function () {
      IronValidatableBehaviorMeta = new IronMeta({ type: "validator" });
    },
    _invalidChanged: function () {
      if (this.invalid) {
        this.setAttribute("aria-invalid", "true");
      } else {
        this.removeAttribute("aria-invalid");
      }
    },
    /* Recompute this every time it's needed, because we don't know if the
     * underlying IronValidatableBehaviorMeta has changed. */
    get _validator() {
      return (
        IronValidatableBehaviorMeta &&
        IronValidatableBehaviorMeta.byKey(this.validator)
      );
    },
    /**
     * @return {boolean} True if the validator `validator` exists.
     */
    hasValidator: function () {
      return this._validator != null;
    },
    /**
         * Returns true if the `value` is valid, and updates `invalid`. If you want
         * your element to have custom validation logic, do not override this method;
         * override `_getValidity(value)` instead.
      
         * @param {Object} value Deprecated: The value to be validated. By default,
         * it is passed to the validator's `validate()` function, if a validator is
         set.
         * If this argument is not specified, then the element's `value` property
         * is used, if it exists.
         * @return {boolean} True if `value` is valid.
         */
    validate: function (value) {
      if (value === void 0 && this.value !== void 0)
        this.invalid = !this._getValidity(this.value);
      else this.invalid = !this._getValidity(value);
      return !this.invalid;
    },
    /**
     * Returns true if `value` is valid.  By default, it is passed
     * to the validator's `validate()` function, if a validator is set. You
     * should override this method if you want to implement custom validity
     * logic for your element.
     *
     * @param {Object} value The value to be validated.
     * @return {boolean} True if `value` is valid.
     */
    _getValidity: function (value) {
      if (this.hasValidator()) {
        return this._validator.validate(value);
      }
      return true;
    },
  };

  // node_modules/.pnpm/@polymer+iron-checked-element-behavior@3.0.1/node_modules/@polymer/iron-checked-element-behavior/iron-checked-element-behavior.js
  var IronCheckedElementBehaviorImpl = {
    properties: {
      /**
       * Fired when the checked state changes.
       *
       * @event iron-change
       */
      /**
       * Gets or sets the state, `true` is checked and `false` is unchecked.
       */
      checked: {
        type: Boolean,
        value: false,
        reflectToAttribute: true,
        notify: true,
        observer: "_checkedChanged",
      },
      /**
       * If true, the button toggles the active state with each tap or press
       * of the spacebar.
       */
      toggles: { type: Boolean, value: true, reflectToAttribute: true },
      /* Overriden from IronFormElementBehavior */
      value: { type: String, value: "on", observer: "_valueChanged" },
    },
    observers: ["_requiredChanged(required)"],
    created: function () {
      this._hasIronCheckedElementBehavior = true;
    },
    /**
     * Returns false if the element is required and not checked, and true
     * otherwise.
     * @param {*=} _value Ignored.
     * @return {boolean} true if `required` is false or if `checked` is true.
     */
    _getValidity: function (_value) {
      return this.disabled || !this.required || this.checked;
    },
    /**
     * Update the aria-required label when `required` is changed.
     */
    _requiredChanged: function () {
      if (this.required) {
        this.setAttribute("aria-required", "true");
      } else {
        this.removeAttribute("aria-required");
      }
    },
    /**
     * Fire `iron-changed` when the checked state changes.
     */
    _checkedChanged: function () {
      this.active = this.checked;
      this.fire("iron-change");
    },
    /**
     * Reset value to 'on' if it is set to `undefined`.
     */
    _valueChanged: function () {
      if (this.value === void 0 || this.value === null) {
        this.value = "on";
      }
    },
  };
  var IronCheckedElementBehavior = [
    IronFormElementBehavior,
    IronValidatableBehavior,
    IronCheckedElementBehaviorImpl,
  ];

  // node_modules/.pnpm/@polymer+iron-behaviors@3.0.1/node_modules/@polymer/iron-behaviors/iron-control-state.js
  var IronControlState = {
    properties: {
      /**
       * If true, the element currently has focus.
       */
      focused: {
        type: Boolean,
        value: false,
        notify: true,
        readOnly: true,
        reflectToAttribute: true,
      },
      /**
       * If true, the user cannot interact with this element.
       */
      disabled: {
        type: Boolean,
        value: false,
        notify: true,
        observer: "_disabledChanged",
        reflectToAttribute: true,
      },
      /**
       * Value of the `tabindex` attribute before `disabled` was activated.
       * `null` means the attribute was not present.
       * @type {?string|undefined}
       */
      _oldTabIndex: { type: String },
      _boundFocusBlurHandler: {
        type: Function,
        value: function () {
          return this._focusBlurHandler.bind(this);
        },
      },
    },
    observers: ["_changedControlState(focused, disabled)"],
    /**
     * @return {void}
     */
    ready: function () {
      this.addEventListener("focus", this._boundFocusBlurHandler, true);
      this.addEventListener("blur", this._boundFocusBlurHandler, true);
    },
    _focusBlurHandler: function (event) {
      this._setFocused(event.type === "focus");
      return;
    },
    _disabledChanged: function (disabled, old) {
      this.setAttribute("aria-disabled", disabled ? "true" : "false");
      this.style.pointerEvents = disabled ? "none" : "";
      if (disabled) {
        this._oldTabIndex = this.getAttribute("tabindex");
        this._setFocused(false);
        this.tabIndex = -1;
        this.blur();
      } else if (this._oldTabIndex !== void 0) {
        if (this._oldTabIndex === null) {
          this.removeAttribute("tabindex");
        } else {
          this.setAttribute("tabindex", this._oldTabIndex);
        }
      }
    },
    _changedControlState: function () {
      if (this._controlStateChanged) {
        this._controlStateChanged();
      }
    },
  };

  // node_modules/.pnpm/@polymer+iron-a11y-keys-behavior@3.0.1/node_modules/@polymer/iron-a11y-keys-behavior/iron-a11y-keys-behavior.js
  var KEY_IDENTIFIER = {
    "U+0008": "backspace",
    "U+0009": "tab",
    "U+001B": "esc",
    "U+0020": "space",
    "U+007F": "del",
  };
  var KEY_CODE = {
    8: "backspace",
    9: "tab",
    13: "enter",
    27: "esc",
    33: "pageup",
    34: "pagedown",
    35: "end",
    36: "home",
    32: "space",
    37: "left",
    38: "up",
    39: "right",
    40: "down",
    46: "del",
    106: "*",
  };
  var MODIFIER_KEYS = {
    shift: "shiftKey",
    ctrl: "ctrlKey",
    alt: "altKey",
    meta: "metaKey",
  };
  var KEY_CHAR = /[a-z0-9*]/;
  var IDENT_CHAR = /U\+/;
  var ARROW_KEY = /^arrow/;
  var SPACE_KEY = /^space(bar)?/;
  var ESC_KEY = /^escape$/;
  function transformKey(key, noSpecialChars) {
    var validKey = "";
    if (key) {
      var lKey = key.toLowerCase();
      if (lKey === " " || SPACE_KEY.test(lKey)) {
        validKey = "space";
      } else if (ESC_KEY.test(lKey)) {
        validKey = "esc";
      } else if (lKey.length == 1) {
        if (!noSpecialChars || KEY_CHAR.test(lKey)) {
          validKey = lKey;
        }
      } else if (ARROW_KEY.test(lKey)) {
        validKey = lKey.replace("arrow", "");
      } else if (lKey == "multiply") {
        validKey = "*";
      } else {
        validKey = lKey;
      }
    }
    return validKey;
  }
  function transformKeyIdentifier(keyIdent) {
    var validKey = "";
    if (keyIdent) {
      if (keyIdent in KEY_IDENTIFIER) {
        validKey = KEY_IDENTIFIER[keyIdent];
      } else if (IDENT_CHAR.test(keyIdent)) {
        keyIdent = parseInt(keyIdent.replace("U+", "0x"), 16);
        validKey = String.fromCharCode(keyIdent).toLowerCase();
      } else {
        validKey = keyIdent.toLowerCase();
      }
    }
    return validKey;
  }
  function transformKeyCode(keyCode) {
    var validKey = "";
    if (Number(keyCode)) {
      if (keyCode >= 65 && keyCode <= 90) {
        validKey = String.fromCharCode(32 + keyCode);
      } else if (keyCode >= 112 && keyCode <= 123) {
        validKey = "f" + (keyCode - 112 + 1);
      } else if (keyCode >= 48 && keyCode <= 57) {
        validKey = String(keyCode - 48);
      } else if (keyCode >= 96 && keyCode <= 105) {
        validKey = String(keyCode - 96);
      } else {
        validKey = KEY_CODE[keyCode];
      }
    }
    return validKey;
  }
  function normalizedKeyForEvent(keyEvent, noSpecialChars) {
    if (keyEvent.key) {
      return transformKey(keyEvent.key, noSpecialChars);
    }
    if (keyEvent.detail && keyEvent.detail.key) {
      return transformKey(keyEvent.detail.key, noSpecialChars);
    }
    return (
      transformKeyIdentifier(keyEvent.keyIdentifier) ||
      transformKeyCode(keyEvent.keyCode) ||
      ""
    );
  }
  function keyComboMatchesEvent(keyCombo, event) {
    var keyEvent = normalizedKeyForEvent(event, keyCombo.hasModifiers);
    return (
      keyEvent === keyCombo.key &&
      (!keyCombo.hasModifiers ||
        (!!event.shiftKey === !!keyCombo.shiftKey &&
          !!event.ctrlKey === !!keyCombo.ctrlKey &&
          !!event.altKey === !!keyCombo.altKey &&
          !!event.metaKey === !!keyCombo.metaKey))
    );
  }
  function parseKeyComboString(keyComboString) {
    if (keyComboString.length === 1) {
      return { combo: keyComboString, key: keyComboString, event: "keydown" };
    }
    return keyComboString.split("+").reduce(
      function (parsedKeyCombo, keyComboPart) {
        var eventParts = keyComboPart.split(":");
        var keyName = eventParts[0];
        var event = eventParts[1];
        if (keyName in MODIFIER_KEYS) {
          parsedKeyCombo[MODIFIER_KEYS[keyName]] = true;
          parsedKeyCombo.hasModifiers = true;
        } else {
          parsedKeyCombo.key = keyName;
          parsedKeyCombo.event = event || "keydown";
        }
        return parsedKeyCombo;
      },
      { combo: keyComboString.split(":").shift() }
    );
  }
  function parseEventString(eventString) {
    return eventString
      .trim()
      .split(" ")
      .map(function (keyComboString) {
        return parseKeyComboString(keyComboString);
      });
  }
  var IronA11yKeysBehavior = {
    properties: {
      /**
       * The EventTarget that will be firing relevant KeyboardEvents. Set it to
       * `null` to disable the listeners.
       * @type {?EventTarget}
       */
      keyEventTarget: {
        type: Object,
        value: function () {
          return this;
        },
      },
      /**
       * If true, this property will cause the implementing element to
       * automatically stop propagation on any handled KeyboardEvents.
       */
      stopKeyboardEventPropagation: { type: Boolean, value: false },
      _boundKeyHandlers: {
        type: Array,
        value: function () {
          return [];
        },
      },
      // We use this due to a limitation in IE10 where instances will have
      // own properties of everything on the "prototype".
      _imperativeKeyBindings: {
        type: Object,
        value: function () {
          return {};
        },
      },
    },
    observers: ["_resetKeyEventListeners(keyEventTarget, _boundKeyHandlers)"],
    /**
     * To be used to express what combination of keys  will trigger the relative
     * callback. e.g. `keyBindings: { 'esc': '_onEscPressed'}`
     * @type {!Object}
     */
    keyBindings: {},
    registered: function () {
      this._prepKeyBindings();
    },
    attached: function () {
      this._listenKeyEventListeners();
    },
    detached: function () {
      this._unlistenKeyEventListeners();
    },
    /**
     * Can be used to imperatively add a key binding to the implementing
     * element. This is the imperative equivalent of declaring a keybinding
     * in the `keyBindings` prototype property.
     *
     * @param {string} eventString
     * @param {string} handlerName
     */
    addOwnKeyBinding: function (eventString, handlerName) {
      this._imperativeKeyBindings[eventString] = handlerName;
      this._prepKeyBindings();
      this._resetKeyEventListeners();
    },
    /**
     * When called, will remove all imperatively-added key bindings.
     */
    removeOwnKeyBindings: function () {
      this._imperativeKeyBindings = {};
      this._prepKeyBindings();
      this._resetKeyEventListeners();
    },
    /**
     * Returns true if a keyboard event matches `eventString`.
     *
     * @param {KeyboardEvent} event
     * @param {string} eventString
     * @return {boolean}
     */
    keyboardEventMatchesKeys: function (event, eventString) {
      var keyCombos = parseEventString(eventString);
      for (var i = 0; i < keyCombos.length; ++i) {
        if (keyComboMatchesEvent(keyCombos[i], event)) {
          return true;
        }
      }
      return false;
    },
    _collectKeyBindings: function () {
      var keyBindings = this.behaviors.map(function (behavior) {
        return behavior.keyBindings;
      });
      if (keyBindings.indexOf(this.keyBindings) === -1) {
        keyBindings.push(this.keyBindings);
      }
      return keyBindings;
    },
    _prepKeyBindings: function () {
      this._keyBindings = {};
      this._collectKeyBindings().forEach(function (keyBindings) {
        for (var eventString2 in keyBindings) {
          this._addKeyBinding(eventString2, keyBindings[eventString2]);
        }
      }, this);
      for (var eventString in this._imperativeKeyBindings) {
        this._addKeyBinding(
          eventString,
          this._imperativeKeyBindings[eventString]
        );
      }
      for (var eventName in this._keyBindings) {
        this._keyBindings[eventName].sort(function (kb1, kb2) {
          var b1 = kb1[0].hasModifiers;
          var b2 = kb2[0].hasModifiers;
          return b1 === b2 ? 0 : b1 ? -1 : 1;
        });
      }
    },
    _addKeyBinding: function (eventString, handlerName) {
      parseEventString(eventString).forEach(function (keyCombo) {
        this._keyBindings[keyCombo.event] =
          this._keyBindings[keyCombo.event] || [];
        this._keyBindings[keyCombo.event].push([keyCombo, handlerName]);
      }, this);
    },
    _resetKeyEventListeners: function () {
      this._unlistenKeyEventListeners();
      if (this.isAttached) {
        this._listenKeyEventListeners();
      }
    },
    _listenKeyEventListeners: function () {
      if (!this.keyEventTarget) {
        return;
      }
      Object.keys(this._keyBindings).forEach(function (eventName) {
        var keyBindings = this._keyBindings[eventName];
        var boundKeyHandler = this._onKeyBindingEvent.bind(this, keyBindings);
        this._boundKeyHandlers.push([
          this.keyEventTarget,
          eventName,
          boundKeyHandler,
        ]);
        this.keyEventTarget.addEventListener(eventName, boundKeyHandler);
      }, this);
    },
    _unlistenKeyEventListeners: function () {
      var keyHandlerTuple;
      var keyEventTarget;
      var eventName;
      var boundKeyHandler;
      while (this._boundKeyHandlers.length) {
        keyHandlerTuple = this._boundKeyHandlers.pop();
        keyEventTarget = keyHandlerTuple[0];
        eventName = keyHandlerTuple[1];
        boundKeyHandler = keyHandlerTuple[2];
        keyEventTarget.removeEventListener(eventName, boundKeyHandler);
      }
    },
    _onKeyBindingEvent: function (keyBindings, event) {
      if (this.stopKeyboardEventPropagation) {
        event.stopPropagation();
      }
      if (event.defaultPrevented) {
        return;
      }
      for (var i = 0; i < keyBindings.length; i++) {
        var keyCombo = keyBindings[i][0];
        var handlerName = keyBindings[i][1];
        if (keyComboMatchesEvent(keyCombo, event)) {
          this._triggerKeyHandler(keyCombo, handlerName, event);
          if (event.defaultPrevented) {
            return;
          }
        }
      }
    },
    _triggerKeyHandler: function (keyCombo, handlerName, keyboardEvent) {
      var detail = Object.create(keyCombo);
      detail.keyboardEvent = keyboardEvent;
      var event = new CustomEvent(keyCombo.event, { detail, cancelable: true });
      this[handlerName].call(this, event);
      if (event.defaultPrevented) {
        keyboardEvent.preventDefault();
      }
    },
  };

  // node_modules/.pnpm/@polymer+iron-behaviors@3.0.1/node_modules/@polymer/iron-behaviors/iron-button-state.js
  var IronButtonStateImpl = {
    properties: {
      /**
       * If true, the user is currently holding down the button.
       */
      pressed: {
        type: Boolean,
        readOnly: true,
        value: false,
        reflectToAttribute: true,
        observer: "_pressedChanged",
      },
      /**
       * If true, the button toggles the active state with each tap or press
       * of the spacebar.
       */
      toggles: { type: Boolean, value: false, reflectToAttribute: true },
      /**
       * If true, the button is a toggle and is currently in the active state.
       */
      active: {
        type: Boolean,
        value: false,
        notify: true,
        reflectToAttribute: true,
      },
      /**
       * True if the element is currently being pressed by a "pointer," which
       * is loosely defined as mouse or touch input (but specifically excluding
       * keyboard input).
       */
      pointerDown: { type: Boolean, readOnly: true, value: false },
      /**
       * True if the input device that caused the element to receive focus
       * was a keyboard.
       */
      receivedFocusFromKeyboard: { type: Boolean, readOnly: true },
      /**
       * The aria attribute to be set if the button is a toggle and in the
       * active state.
       */
      ariaActiveAttribute: {
        type: String,
        value: "aria-pressed",
        observer: "_ariaActiveAttributeChanged",
      },
    },
    listeners: { down: "_downHandler", up: "_upHandler", tap: "_tapHandler" },
    observers: [
      "_focusChanged(focused)",
      "_activeChanged(active, ariaActiveAttribute)",
    ],
    /**
     * @type {!Object}
     */
    keyBindings: {
      "enter:keydown": "_asyncClick",
      "space:keydown": "_spaceKeyDownHandler",
      "space:keyup": "_spaceKeyUpHandler",
    },
    _mouseEventRe: /^mouse/,
    _tapHandler: function () {
      if (this.toggles) {
        this._userActivate(!this.active);
      } else {
        this.active = false;
      }
    },
    _focusChanged: function (focused) {
      this._detectKeyboardFocus(focused);
      if (!focused) {
        this._setPressed(false);
      }
    },
    _detectKeyboardFocus: function (focused) {
      this._setReceivedFocusFromKeyboard(!this.pointerDown && focused);
    },
    // to emulate native checkbox, (de-)activations from a user interaction fire
    // 'change' events
    _userActivate: function (active) {
      if (this.active !== active) {
        this.active = active;
        this.fire("change");
      }
    },
    _downHandler: function (event) {
      this._setPointerDown(true);
      this._setPressed(true);
      this._setReceivedFocusFromKeyboard(false);
    },
    _upHandler: function () {
      this._setPointerDown(false);
      this._setPressed(false);
    },
    /**
     * @param {!KeyboardEvent} event .
     */
    _spaceKeyDownHandler: function (event) {
      var keyboardEvent = event.detail.keyboardEvent;
      var target = dom(keyboardEvent).localTarget;
      if (
        this.isLightDescendant(
          /** @type {Node} */
          target
        )
      )
        return;
      keyboardEvent.preventDefault();
      keyboardEvent.stopImmediatePropagation();
      this._setPressed(true);
    },
    /**
     * @param {!KeyboardEvent} event .
     */
    _spaceKeyUpHandler: function (event) {
      var keyboardEvent = event.detail.keyboardEvent;
      var target = dom(keyboardEvent).localTarget;
      if (
        this.isLightDescendant(
          /** @type {Node} */
          target
        )
      )
        return;
      if (this.pressed) {
        this._asyncClick();
      }
      this._setPressed(false);
    },
    // trigger click asynchronously, the asynchrony is useful to allow one
    // event handler to unwind before triggering another event
    _asyncClick: function () {
      this.async(function () {
        this.click();
      }, 1);
    },
    // any of these changes are considered a change to button state
    _pressedChanged: function (pressed) {
      this._changedButtonState();
    },
    _ariaActiveAttributeChanged: function (value, oldValue) {
      if (oldValue && oldValue != value && this.hasAttribute(oldValue)) {
        this.removeAttribute(oldValue);
      }
    },
    _activeChanged: function (active, ariaActiveAttribute) {
      if (this.toggles) {
        this.setAttribute(this.ariaActiveAttribute, active ? "true" : "false");
      } else {
        this.removeAttribute(this.ariaActiveAttribute);
      }
      this._changedButtonState();
    },
    _controlStateChanged: function () {
      if (this.disabled) {
        this._setPressed(false);
      } else {
        this._changedButtonState();
      }
    },
    // provide hook for follow-on behaviors to react to button-state
    _changedButtonState: function () {
      if (this._buttonStateChanged) {
        this._buttonStateChanged();
      }
    },
  };
  var IronButtonState = [IronA11yKeysBehavior, IronButtonStateImpl];

  // node_modules/.pnpm/@polymer+paper-ripple@3.0.2/node_modules/@polymer/paper-ripple/paper-ripple.js
  var Utility = {
    distance: function (x1, y1, x2, y2) {
      var xDelta = x1 - x2;
      var yDelta = y1 - y2;
      return Math.sqrt(xDelta * xDelta + yDelta * yDelta);
    },
    now:
      window.performance && window.performance.now
        ? window.performance.now.bind(window.performance)
        : Date.now,
  };
  function ElementMetrics(element) {
    this.element = element;
    this.width = this.boundingRect.width;
    this.height = this.boundingRect.height;
    this.size = Math.max(this.width, this.height);
  }
  ElementMetrics.prototype = {
    get boundingRect() {
      return this.element.getBoundingClientRect();
    },
    furthestCornerDistanceFrom: function (x, y) {
      var topLeft = Utility.distance(x, y, 0, 0);
      var topRight = Utility.distance(x, y, this.width, 0);
      var bottomLeft = Utility.distance(x, y, 0, this.height);
      var bottomRight = Utility.distance(x, y, this.width, this.height);
      return Math.max(topLeft, topRight, bottomLeft, bottomRight);
    },
  };
  function Ripple(element) {
    this.element = element;
    this.color = window.getComputedStyle(element).color;
    this.wave = document.createElement("div");
    this.waveContainer = document.createElement("div");
    this.wave.style.backgroundColor = this.color;
    this.wave.classList.add("wave");
    this.waveContainer.classList.add("wave-container");
    dom(this.waveContainer).appendChild(this.wave);
    this.resetInteractionState();
  }
  Ripple.MAX_RADIUS = 300;
  Ripple.prototype = {
    get recenters() {
      return this.element.recenters;
    },
    get center() {
      return this.element.center;
    },
    get mouseDownElapsed() {
      var elapsed;
      if (!this.mouseDownStart) {
        return 0;
      }
      elapsed = Utility.now() - this.mouseDownStart;
      if (this.mouseUpStart) {
        elapsed -= this.mouseUpElapsed;
      }
      return elapsed;
    },
    get mouseUpElapsed() {
      return this.mouseUpStart ? Utility.now() - this.mouseUpStart : 0;
    },
    get mouseDownElapsedSeconds() {
      return this.mouseDownElapsed / 1e3;
    },
    get mouseUpElapsedSeconds() {
      return this.mouseUpElapsed / 1e3;
    },
    get mouseInteractionSeconds() {
      return this.mouseDownElapsedSeconds + this.mouseUpElapsedSeconds;
    },
    get initialOpacity() {
      return this.element.initialOpacity;
    },
    get opacityDecayVelocity() {
      return this.element.opacityDecayVelocity;
    },
    get radius() {
      var width2 = this.containerMetrics.width * this.containerMetrics.width;
      var height2 = this.containerMetrics.height * this.containerMetrics.height;
      var waveRadius =
        Math.min(Math.sqrt(width2 + height2), Ripple.MAX_RADIUS) * 1.1 + 5;
      var duration = 1.1 - 0.2 * (waveRadius / Ripple.MAX_RADIUS);
      var timeNow = this.mouseInteractionSeconds / duration;
      var size = waveRadius * (1 - Math.pow(80, -timeNow));
      return Math.abs(size);
    },
    get opacity() {
      if (!this.mouseUpStart) {
        return this.initialOpacity;
      }
      return Math.max(
        0,
        this.initialOpacity -
          this.mouseUpElapsedSeconds * this.opacityDecayVelocity
      );
    },
    get outerOpacity() {
      var outerOpacity = this.mouseUpElapsedSeconds * 0.3;
      var waveOpacity = this.opacity;
      return Math.max(0, Math.min(outerOpacity, waveOpacity));
    },
    get isOpacityFullyDecayed() {
      return (
        this.opacity < 0.01 &&
        this.radius >= Math.min(this.maxRadius, Ripple.MAX_RADIUS)
      );
    },
    get isRestingAtMaxRadius() {
      return (
        this.opacity >= this.initialOpacity &&
        this.radius >= Math.min(this.maxRadius, Ripple.MAX_RADIUS)
      );
    },
    get isAnimationComplete() {
      return this.mouseUpStart
        ? this.isOpacityFullyDecayed
        : this.isRestingAtMaxRadius;
    },
    get translationFraction() {
      return Math.min(
        1,
        ((this.radius / this.containerMetrics.size) * 2) / Math.sqrt(2)
      );
    },
    get xNow() {
      if (this.xEnd) {
        return (
          this.xStart + this.translationFraction * (this.xEnd - this.xStart)
        );
      }
      return this.xStart;
    },
    get yNow() {
      if (this.yEnd) {
        return (
          this.yStart + this.translationFraction * (this.yEnd - this.yStart)
        );
      }
      return this.yStart;
    },
    get isMouseDown() {
      return this.mouseDownStart && !this.mouseUpStart;
    },
    resetInteractionState: function () {
      this.maxRadius = 0;
      this.mouseDownStart = 0;
      this.mouseUpStart = 0;
      this.xStart = 0;
      this.yStart = 0;
      this.xEnd = 0;
      this.yEnd = 0;
      this.slideDistance = 0;
      this.containerMetrics = new ElementMetrics(this.element);
    },
    draw: function () {
      var scale;
      var dx;
      var dy;
      this.wave.style.opacity = this.opacity;
      scale = this.radius / (this.containerMetrics.size / 2);
      dx = this.xNow - this.containerMetrics.width / 2;
      dy = this.yNow - this.containerMetrics.height / 2;
      this.waveContainer.style.webkitTransform =
        "translate(" + dx + "px, " + dy + "px)";
      this.waveContainer.style.transform =
        "translate3d(" + dx + "px, " + dy + "px, 0)";
      this.wave.style.webkitTransform = "scale(" + scale + "," + scale + ")";
      this.wave.style.transform = "scale3d(" + scale + "," + scale + ",1)";
    },
    /** @param {Event=} event */
    downAction: function (event) {
      var xCenter = this.containerMetrics.width / 2;
      var yCenter = this.containerMetrics.height / 2;
      this.resetInteractionState();
      this.mouseDownStart = Utility.now();
      if (this.center) {
        this.xStart = xCenter;
        this.yStart = yCenter;
        this.slideDistance = Utility.distance(
          this.xStart,
          this.yStart,
          this.xEnd,
          this.yEnd
        );
      } else {
        this.xStart = event
          ? event.detail.x - this.containerMetrics.boundingRect.left
          : this.containerMetrics.width / 2;
        this.yStart = event
          ? event.detail.y - this.containerMetrics.boundingRect.top
          : this.containerMetrics.height / 2;
      }
      if (this.recenters) {
        this.xEnd = xCenter;
        this.yEnd = yCenter;
        this.slideDistance = Utility.distance(
          this.xStart,
          this.yStart,
          this.xEnd,
          this.yEnd
        );
      }
      this.maxRadius = this.containerMetrics.furthestCornerDistanceFrom(
        this.xStart,
        this.yStart
      );
      this.waveContainer.style.top =
        (this.containerMetrics.height - this.containerMetrics.size) / 2 + "px";
      this.waveContainer.style.left =
        (this.containerMetrics.width - this.containerMetrics.size) / 2 + "px";
      this.waveContainer.style.width = this.containerMetrics.size + "px";
      this.waveContainer.style.height = this.containerMetrics.size + "px";
    },
    /** @param {Event=} event */
    upAction: function (event) {
      if (!this.isMouseDown) {
        return;
      }
      this.mouseUpStart = Utility.now();
    },
    remove: function () {
      dom(dom(this.waveContainer).parentNode).removeChild(this.waveContainer);
    },
  };
  Polymer({
    /** @override */
    _template: html`
      <style>
        :host {
          display: block;
          position: absolute;
          border-radius: inherit;
          overflow: hidden;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;

          /* See PolymerElements/paper-behaviors/issues/34. On non-Chrome browsers,
           * creating a node (with a position:absolute) in the middle of an event
           * handler "interrupts" that event handler (which happens when the
           * ripple is created on demand) */
          pointer-events: none;
        }

        :host([animating]) {
          /* This resolves a rendering issue in Chrome (as of 40) where the
             ripple is not properly clipped by its parent (which may have
             rounded corners). See: http://jsbin.com/temexa/4
  
             Note: We only apply this style conditionally. Otherwise, the browser
             will create a new compositing layer for every ripple element on the
             page, and that would be bad. */
          -webkit-transform: translate(0, 0);
          transform: translate3d(0, 0, 0);
        }

        #background,
        #waves,
        .wave-container,
        .wave {
          pointer-events: none;
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        #background,
        .wave {
          opacity: 0;
        }

        #waves,
        .wave {
          overflow: hidden;
        }

        .wave-container,
        .wave {
          border-radius: 50%;
        }

        :host(.circle) #background,
        :host(.circle) #waves {
          border-radius: 50%;
        }

        :host(.circle) .wave-container {
          overflow: hidden;
        }
      </style>

      <div id="background"></div>
      <div id="waves"></div>
    `,
    is: "paper-ripple",
    behaviors: [IronA11yKeysBehavior],
    properties: {
      /**
       * The initial opacity set on the wave.
       * @type number
       * @default 0.25
       */
      initialOpacity: { type: Number, value: 0.25 },
      /**
       * How fast (opacity per second) the wave fades out.
       *
       * @type number
       * @default 0.8
       */
      opacityDecayVelocity: { type: Number, value: 0.8 },
      /**
       * If true, ripples will exhibit a gravitational pull towards
       * the center of their container as they fade away.
       *
       * @type boolean
       * @default false
       */
      recenters: { type: Boolean, value: false },
      /**
       * If true, ripples will center inside its container
       *
       * @type boolean
       * @default false
       */
      center: { type: Boolean, value: false },
      /**
       * A list of the visual ripples.
       *
       * @type Array
       * @default []
       */
      ripples: {
        type: Array,
        value: function () {
          return [];
        },
      },
      /**
       * True when there are visible ripples animating within the
       * element.
       */
      animating: {
        type: Boolean,
        readOnly: true,
        reflectToAttribute: true,
        value: false,
      },
      /**
       * If true, the ripple will remain in the "down" state until `holdDown`
       * is set to false again.
       */
      holdDown: { type: Boolean, value: false, observer: "_holdDownChanged" },
      /**
       * If true, the ripple will not generate a ripple effect
       * via pointer interaction.
       * Calling ripple's imperative api like `simulatedRipple` will
       * still generate the ripple effect.
       */
      noink: { type: Boolean, value: false },
      _animating: { type: Boolean },
      _boundAnimate: {
        type: Function,
        value: function () {
          return this.animate.bind(this);
        },
      },
    },
    get target() {
      return this.keyEventTarget;
    },
    /**
     * @type {!Object}
     */
    keyBindings: {
      "enter:keydown": "_onEnterKeydown",
      "space:keydown": "_onSpaceKeydown",
      "space:keyup": "_onSpaceKeyup",
    },
    /** @override */
    attached: function () {
      if (dom(this).parentNode.nodeType == 11) {
        this.keyEventTarget = dom(this).getOwnerRoot().host;
      } else {
        this.keyEventTarget = dom(this).parentNode;
      }
      var keyEventTarget =
        /** @type {!EventTarget} */
        this.keyEventTarget;
      this.listen(keyEventTarget, "up", "uiUpAction");
      this.listen(keyEventTarget, "down", "uiDownAction");
    },
    /** @override */
    detached: function () {
      this.unlisten(this.keyEventTarget, "up", "uiUpAction");
      this.unlisten(this.keyEventTarget, "down", "uiDownAction");
      this.keyEventTarget = null;
    },
    get shouldKeepAnimating() {
      for (var index = 0; index < this.ripples.length; ++index) {
        if (!this.ripples[index].isAnimationComplete) {
          return true;
        }
      }
      return false;
    },
    simulatedRipple: function () {
      this.downAction(null);
      this.async(function () {
        this.upAction();
      }, 1);
    },
    /**
     * Provokes a ripple down effect via a UI event,
     * respecting the `noink` property.
     * @param {Event=} event
     */
    uiDownAction: function (event) {
      if (!this.noink) {
        this.downAction(event);
      }
    },
    /**
     * Provokes a ripple down effect via a UI event,
     * *not* respecting the `noink` property.
     * @param {Event=} event
     */
    downAction: function (event) {
      if (this.holdDown && this.ripples.length > 0) {
        return;
      }
      var ripple = this.addRipple();
      ripple.downAction(event);
      if (!this._animating) {
        this._animating = true;
        this.animate();
      }
    },
    /**
     * Provokes a ripple up effect via a UI event,
     * respecting the `noink` property.
     * @param {Event=} event
     */
    uiUpAction: function (event) {
      if (!this.noink) {
        this.upAction(event);
      }
    },
    /**
     * Provokes a ripple up effect via a UI event,
     * *not* respecting the `noink` property.
     * @param {Event=} event
     */
    upAction: function (event) {
      if (this.holdDown) {
        return;
      }
      this.ripples.forEach(function (ripple) {
        ripple.upAction(event);
      });
      this._animating = true;
      this.animate();
    },
    onAnimationComplete: function () {
      this._animating = false;
      this.$.background.style.backgroundColor = "";
      this.fire("transitionend");
    },
    addRipple: function () {
      var ripple = new Ripple(this);
      dom(this.$.waves).appendChild(ripple.waveContainer);
      this.$.background.style.backgroundColor = ripple.color;
      this.ripples.push(ripple);
      this._setAnimating(true);
      return ripple;
    },
    removeRipple: function (ripple) {
      var rippleIndex = this.ripples.indexOf(ripple);
      if (rippleIndex < 0) {
        return;
      }
      this.ripples.splice(rippleIndex, 1);
      ripple.remove();
      if (!this.ripples.length) {
        this._setAnimating(false);
      }
    },
    /**
     * Deprecated. Please use animateRipple() instead.
     *
     * This method name conflicts with Element#animate().
     * https://developer.mozilla.org/en-US/docs/Web/API/Element/animate.
     *
     * @suppress {checkTypes}
     * @override
     */
    animate: function () {
      if (!this._animating) {
        return;
      }
      var index;
      var ripple;
      for (index = 0; index < this.ripples.length; ++index) {
        ripple = this.ripples[index];
        ripple.draw();
        this.$.background.style.opacity = ripple.outerOpacity;
        if (ripple.isOpacityFullyDecayed && !ripple.isRestingAtMaxRadius) {
          this.removeRipple(ripple);
        }
      }
      if (!this.shouldKeepAnimating && this.ripples.length === 0) {
        this.onAnimationComplete();
      } else {
        window.requestAnimationFrame(this._boundAnimate);
      }
    },
    /**
     * An alias for animate() whose name does not conflict with the platform
     * Element.animate() method.
     */
    animateRipple: function () {
      return this.animate();
    },
    _onEnterKeydown: function () {
      this.uiDownAction();
      this.async(this.uiUpAction, 1);
    },
    _onSpaceKeydown: function () {
      this.uiDownAction();
    },
    _onSpaceKeyup: function () {
      this.uiUpAction();
    },
    // note: holdDown does not respect noink since it can be a focus based
    // effect.
    _holdDownChanged: function (newVal, oldVal) {
      if (oldVal === void 0) {
        return;
      }
      if (newVal) {
        this.downAction();
      } else {
        this.upAction();
      }
    },
    /**
        Fired when the animation finishes.
        This is useful if you want to wait until
        the ripple animation finishes to perform some action.
      
        @event transitionend
        @param {{node: Object}} detail Contains the animated node.
        */
  });

  // node_modules/.pnpm/@polymer+paper-behaviors@3.0.1/node_modules/@polymer/paper-behaviors/paper-ripple-behavior.js
  var PaperRippleBehavior = {
    properties: {
      /**
       * If true, the element will not produce a ripple effect when interacted
       * with via the pointer.
       */
      noink: { type: Boolean, observer: "_noinkChanged" },
      /**
       * @type {Element|undefined}
       */
      _rippleContainer: {
        type: Object,
      },
    },
    /**
     * Ensures a `<paper-ripple>` element is available when the element is
     * focused.
     */
    _buttonStateChanged: function () {
      if (this.focused) {
        this.ensureRipple();
      }
    },
    /**
     * In addition to the functionality provided in `IronButtonState`, ensures
     * a ripple effect is created when the element is in a `pressed` state.
     */
    _downHandler: function (event) {
      IronButtonStateImpl._downHandler.call(this, event);
      if (this.pressed) {
        this.ensureRipple(event);
      }
    },
    /**
     * Ensures this element contains a ripple effect. For startup efficiency
     * the ripple effect is dynamically on demand when needed.
     * @param {!Event=} optTriggeringEvent (optional) event that triggered the
     * ripple.
     */
    ensureRipple: function (optTriggeringEvent) {
      if (!this.hasRipple()) {
        this._ripple = this._createRipple();
        this._ripple.noink = this.noink;
        var rippleContainer = this._rippleContainer || this.root;
        if (rippleContainer) {
          dom(rippleContainer).appendChild(this._ripple);
        }
        if (optTriggeringEvent) {
          var domContainer = dom(this._rippleContainer || this);
          var target = dom(optTriggeringEvent).rootTarget;
          if (
            domContainer.deepContains(
              /** @type {Node} */
              target
            )
          ) {
            this._ripple.uiDownAction(optTriggeringEvent);
          }
        }
      }
    },
    /**
     * Returns the `<paper-ripple>` element used by this element to create
     * ripple effects. The element's ripple is created on demand, when
     * necessary, and calling this method will force the
     * ripple to be created.
     */
    getRipple: function () {
      this.ensureRipple();
      return this._ripple;
    },
    /**
     * Returns true if this element currently contains a ripple effect.
     * @return {boolean}
     */
    hasRipple: function () {
      return Boolean(this._ripple);
    },
    /**
     * Create the element's ripple effect via creating a `<paper-ripple>`.
     * Override this method to customize the ripple element.
     * @return {!PaperRippleElement} Returns a `<paper-ripple>` element.
     */
    _createRipple: function () {
      var element =
        /** @type {!PaperRippleElement} */
        document.createElement("paper-ripple");
      return element;
    },
    _noinkChanged: function (noink) {
      if (this.hasRipple()) {
        this._ripple.noink = noink;
      }
    },
  };

  // node_modules/.pnpm/@polymer+paper-behaviors@3.0.1/node_modules/@polymer/paper-behaviors/paper-inky-focus-behavior.js
  var PaperInkyFocusBehaviorImpl = {
    observers: ["_focusedChanged(receivedFocusFromKeyboard)"],
    _focusedChanged: function (receivedFocusFromKeyboard) {
      if (receivedFocusFromKeyboard) {
        this.ensureRipple();
      }
      if (this.hasRipple()) {
        this._ripple.holdDown = receivedFocusFromKeyboard;
      }
    },
    _createRipple: function () {
      var ripple = PaperRippleBehavior._createRipple();
      ripple.id = "ink";
      ripple.setAttribute("center", "");
      ripple.classList.add("circle");
      return ripple;
    },
  };
  var PaperInkyFocusBehavior = [
    IronButtonState,
    IronControlState,
    PaperRippleBehavior,
    PaperInkyFocusBehaviorImpl,
  ];

  // node_modules/.pnpm/@polymer+paper-behaviors@3.0.1/node_modules/@polymer/paper-behaviors/paper-checked-element-behavior.js
  var PaperCheckedElementBehaviorImpl = {
    /**
     * Synchronizes the element's checked state with its ripple effect.
     */
    _checkedChanged: function () {
      IronCheckedElementBehaviorImpl._checkedChanged.call(this);
      if (this.hasRipple()) {
        if (this.checked) {
          this._ripple.setAttribute("checked", "");
        } else {
          this._ripple.removeAttribute("checked");
        }
      }
    },
    /**
     * Synchronizes the element's `active` and `checked` state.
     */
    _buttonStateChanged: function () {
      PaperRippleBehavior._buttonStateChanged.call(this);
      if (this.disabled) {
        return;
      }
      if (this.isAttached) {
        this.checked = this.active;
      }
    },
  };
  var PaperCheckedElementBehavior = [
    PaperInkyFocusBehavior,
    IronCheckedElementBehavior,
    PaperCheckedElementBehaviorImpl,
  ];

  // node_modules/.pnpm/@polymer+paper-checkbox@3.1.0/node_modules/@polymer/paper-checkbox/paper-checkbox.js
  var template3 = html`<style>
      :host {
        display: inline-block;
        white-space: nowrap;
        cursor: pointer;
        --calculated-paper-checkbox-size: var(--paper-checkbox-size, 18px);
        /* -1px is a sentinel for the default and is replaced in \`attached\`. */
        --calculated-paper-checkbox-ink-size: var(
          --paper-checkbox-ink-size,
          -1px
        );
        @apply --paper-font-common-base;
        line-height: 0;
        -webkit-tap-highlight-color: transparent;
      }

      :host([hidden]) {
        display: none !important;
      }

      :host(:focus) {
        outline: none;
      }

      .hidden {
        display: none;
      }

      #checkboxContainer {
        display: inline-block;
        position: relative;
        width: var(--calculated-paper-checkbox-size);
        height: var(--calculated-paper-checkbox-size);
        min-width: var(--calculated-paper-checkbox-size);
        margin: var(--paper-checkbox-margin, initial);
        vertical-align: var(--paper-checkbox-vertical-align, middle);
        background-color: var(
          --paper-checkbox-unchecked-background-color,
          transparent
        );
      }

      #ink {
        position: absolute;

        /* Center the ripple in the checkbox by negative offsetting it by
       * (inkWidth - rippleWidth) / 2 */
        top: calc(
          0px -
            (
              var(--calculated-paper-checkbox-ink-size) -
                var(--calculated-paper-checkbox-size)
            ) / 2
        );
        left: calc(
          0px -
            (
              var(--calculated-paper-checkbox-ink-size) -
                var(--calculated-paper-checkbox-size)
            ) / 2
        );
        width: var(--calculated-paper-checkbox-ink-size);
        height: var(--calculated-paper-checkbox-ink-size);
        color: var(
          --paper-checkbox-unchecked-ink-color,
          var(--primary-text-color)
        );
        opacity: 0.6;
        pointer-events: none;
      }

      #ink:dir(rtl) {
        right: calc(
          0px -
            (
              var(--calculated-paper-checkbox-ink-size) -
                var(--calculated-paper-checkbox-size)
            ) / 2
        );
        left: auto;
      }

      #ink[checked] {
        color: var(--paper-checkbox-checked-ink-color, var(--primary-color));
      }

      #checkbox {
        position: relative;
        box-sizing: border-box;
        height: 100%;
        border: solid 2px;
        border-color: var(
          --paper-checkbox-unchecked-color,
          var(--primary-text-color)
        );
        border-radius: 2px;
        pointer-events: none;
        -webkit-transition: background-color 140ms, border-color 140ms;
        transition: background-color 140ms, border-color 140ms;

        -webkit-transition-duration: var(
          --paper-checkbox-animation-duration,
          140ms
        );
        transition-duration: var(--paper-checkbox-animation-duration, 140ms);
      }

      /* checkbox checked animations */
      #checkbox.checked #checkmark {
        -webkit-animation: checkmark-expand 140ms ease-out forwards;
        animation: checkmark-expand 140ms ease-out forwards;

        -webkit-animation-duration: var(
          --paper-checkbox-animation-duration,
          140ms
        );
        animation-duration: var(--paper-checkbox-animation-duration, 140ms);
      }

      @-webkit-keyframes checkmark-expand {
        0% {
          -webkit-transform: scale(0, 0) rotate(45deg);
        }
        100% {
          -webkit-transform: scale(1, 1) rotate(45deg);
        }
      }

      @keyframes checkmark-expand {
        0% {
          transform: scale(0, 0) rotate(45deg);
        }
        100% {
          transform: scale(1, 1) rotate(45deg);
        }
      }

      #checkbox.checked {
        background-color: var(
          --paper-checkbox-checked-color,
          var(--primary-color)
        );
        border-color: var(--paper-checkbox-checked-color, var(--primary-color));
      }

      #checkmark {
        position: absolute;
        width: 36%;
        height: 70%;
        border-style: solid;
        border-top: none;
        border-left: none;
        border-right-width: calc(
          2 / 15 * var(--calculated-paper-checkbox-size)
        );
        border-bottom-width: calc(
          2 / 15 * var(--calculated-paper-checkbox-size)
        );
        border-color: var(--paper-checkbox-checkmark-color, white);
        -webkit-transform-origin: 97% 86%;
        transform-origin: 97% 86%;
        box-sizing: content-box; /* protect against page-level box-sizing */
      }

      #checkmark:dir(rtl) {
        -webkit-transform-origin: 50% 14%;
        transform-origin: 50% 14%;
      }

      /* label */
      #checkboxLabel {
        position: relative;
        display: inline-block;
        vertical-align: middle;
        padding-left: var(--paper-checkbox-label-spacing, 8px);
        white-space: normal;
        line-height: normal;
        color: var(--paper-checkbox-label-color, var(--primary-text-color));
        @apply --paper-checkbox-label;
      }

      :host([checked]) #checkboxLabel {
        color: var(
          --paper-checkbox-label-checked-color,
          var(--paper-checkbox-label-color, var(--primary-text-color))
        );
        @apply --paper-checkbox-label-checked;
      }

      #checkboxLabel:dir(rtl) {
        padding-right: var(--paper-checkbox-label-spacing, 8px);
        padding-left: 0;
      }

      #checkboxLabel[hidden] {
        display: none;
      }

      /* disabled state */

      :host([disabled]) #checkbox {
        opacity: 0.5;
        border-color: var(
          --paper-checkbox-unchecked-color,
          var(--primary-text-color)
        );
      }

      :host([disabled][checked]) #checkbox {
        background-color: var(
          --paper-checkbox-unchecked-color,
          var(--primary-text-color)
        );
        opacity: 0.5;
      }

      :host([disabled]) #checkboxLabel {
        opacity: 0.65;
      }

      /* invalid state */
      #checkbox.invalid:not(.checked) {
        border-color: var(--paper-checkbox-error-color, var(--error-color));
      }
    </style>

    <div id="checkboxContainer">
      <div id="checkbox" class$="[[_computeCheckboxClass(checked, invalid)]]">
        <div id="checkmark" class$="[[_computeCheckmarkClass(checked)]]"></div>
      </div>
    </div>

    <div id="checkboxLabel"><slot></slot></div>`;
  template3.setAttribute("strip-whitespace", "");
  Polymer({
    _template: template3,
    is: "paper-checkbox",
    behaviors: [PaperCheckedElementBehavior],
    /** @private */
    hostAttributes: { role: "checkbox", "aria-checked": false, tabindex: 0 },
    properties: {
      /**
       * Fired when the checked state changes due to user interaction.
       *
       * @event change
       */
      /**
       * Fired when the checked state changes.
       *
       * @event iron-change
       */
      ariaActiveAttribute: { type: String, value: "aria-checked" },
    },
    attached: function () {
      afterNextRender(this, function () {
        var inkSize = this.getComputedStyleValue(
          "--calculated-paper-checkbox-ink-size"
        ).trim();
        if (inkSize === "-1px") {
          var checkboxSizeText = this.getComputedStyleValue(
            "--calculated-paper-checkbox-size"
          ).trim();
          var units = "px";
          var unitsMatches = checkboxSizeText.match(/[A-Za-z]+$/);
          if (unitsMatches !== null) {
            units = unitsMatches[0];
          }
          var checkboxSize = parseFloat(checkboxSizeText);
          var defaultInkSize = (8 / 3) * checkboxSize;
          if (units === "px") {
            defaultInkSize = Math.floor(defaultInkSize);
            if (defaultInkSize % 2 !== checkboxSize % 2) {
              defaultInkSize++;
            }
          }
          this.updateStyles({
            "--paper-checkbox-ink-size": defaultInkSize + units,
          });
        }
      });
    },
    _computeCheckboxClass: function (checked, invalid) {
      var className = "";
      if (checked) {
        className += "checked ";
      }
      if (invalid) {
        className += "invalid";
      }
      return className;
    },
    _computeCheckmarkClass: function (checked) {
      return checked ? "" : "hidden";
    },
    // create ripple inside the checkboxContainer
    _createRipple: function () {
      this._rippleContainer = this.$.checkboxContainer;
      return PaperInkyFocusBehaviorImpl._createRipple.call(this);
    },
  });
})();
/*! Bundled license information:
  
  @webcomponents/shadycss/src/style-settings.js:
    (**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    *)
  
  @webcomponents/shadycss/src/css-parse.js:
    (**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    *)
  
  @webcomponents/shadycss/src/common-regex.js:
    (**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    *)
  
  @webcomponents/shadycss/src/unscoped-style-handler.js:
    (**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    *)
  
  @webcomponents/shadycss/src/style-util.js:
    (**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    *)
  
  @webcomponents/shadycss/src/common-utils.js:
    (**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    *)
  
  @webcomponents/shadycss/src/apply-shim.js:
    (**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    *)
  
  @webcomponents/shadycss/src/template-map.js:
    (**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    *)
  
  @webcomponents/shadycss/src/apply-shim-utils.js:
    (**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    *)
  
  @webcomponents/shadycss/src/document-wait.js:
    (**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    *)
  
  @webcomponents/shadycss/src/custom-style-interface.js:
    (**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    *)
  
  @webcomponents/shadycss/entrypoints/apply-shim.js:
    (**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    *)
  
  @polymer/polymer/lib/utils/boot.js:
    (**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    *)
  
  @polymer/polymer/lib/utils/resolve-url.js:
    (**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    *)
  
  @polymer/polymer/lib/utils/settings.js:
    (**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    *)
  
  @polymer/polymer/lib/utils/mixin.js:
    (**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    *)
  
  @polymer/polymer/lib/elements/dom-module.js:
    (**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    *)
  
  @polymer/polymer/lib/utils/style-gather.js:
    (**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    *)
  
  @polymer/polymer/lib/utils/wrap.js:
    (**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    *)
  
  @polymer/polymer/lib/utils/path.js:
    (**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    *)
  
  @polymer/polymer/lib/utils/case-map.js:
    (**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    *)
  
  @polymer/polymer/lib/utils/async.js:
    (**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    *)
  
  @polymer/polymer/lib/mixins/properties-changed.js:
    (**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    *)
  
  @polymer/polymer/lib/mixins/property-accessors.js:
    (**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    *)
  
  @polymer/polymer/lib/mixins/template-stamp.js:
    (**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    *)
  
  @polymer/polymer/lib/mixins/property-effects.js:
    (**
     * @fileoverview
     * @suppress {checkPrototypalTypes}
     * @license Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt The complete set of authors may be found
     * at http://polymer.github.io/AUTHORS.txt The complete set of contributors may
     * be found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by
     * Google as part of the polymer project is also subject to an additional IP
     * rights grant found at http://polymer.github.io/PATENTS.txt
     *)
  
  @polymer/polymer/lib/utils/telemetry.js:
    (**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    *)
  
  @polymer/polymer/lib/mixins/properties-mixin.js:
    (**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    *)
  
  @polymer/polymer/lib/mixins/element-mixin.js:
    (**
     * @fileoverview
     * @suppress {checkPrototypalTypes}
     * @license Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt The complete set of authors may be found
     * at http://polymer.github.io/AUTHORS.txt The complete set of contributors may
     * be found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by
     * Google as part of the polymer project is also subject to an additional IP
     * rights grant found at http://polymer.github.io/PATENTS.txt
     *)
  
  @polymer/polymer/lib/utils/debounce.js:
    (**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    *)
  
  @polymer/polymer/lib/utils/gestures.js:
    (**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    *)
  
  @polymer/polymer/lib/mixins/gesture-event-listeners.js:
    (**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    *)
  
  @polymer/polymer/lib/mixins/dir-mixin.js:
    (**
     * @fileoverview
     * @suppress {checkPrototypalTypes}
     * @license Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt The complete set of authors may be found
     * at http://polymer.github.io/AUTHORS.txt The complete set of contributors may
     * be found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by
     * Google as part of the polymer project is also subject to an additional IP
     * rights grant found at http://polymer.github.io/PATENTS.txt
     *)
  
  @polymer/polymer/lib/utils/render-status.js:
    (**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    *)
  
  @polymer/polymer/lib/utils/unresolved.js:
    (**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    *)
  
  @polymer/polymer/lib/utils/array-splice.js:
    (**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    *)
  
  @polymer/polymer/lib/utils/flattened-nodes-observer.js:
    (**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    *)
  
  @polymer/polymer/lib/utils/flush.js:
    (**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    *)
  
  @polymer/polymer/lib/legacy/polymer.dom.js:
    (**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    *)
  
  @polymer/polymer/lib/utils/scope-subtree.js:
    (**
    @license
    Copyright (c) 2019 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    *)
  
  @polymer/polymer/lib/mixins/disable-upgrade-mixin.js:
    (**
     * @fileoverview
     * @suppress {checkPrototypalTypes}
     * @license Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt The complete set of authors may be found
     * at http://polymer.github.io/AUTHORS.txt The complete set of contributors may
     * be found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by
     * Google as part of the polymer project is also subject to an additional IP
     * rights grant found at http://polymer.github.io/PATENTS.txt
     *)
  
  @polymer/polymer/lib/legacy/legacy-element-mixin.js:
    (**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    *)
  
  @polymer/polymer/lib/legacy/class.js:
    (**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    *)
  
  @polymer/polymer/lib/legacy/polymer-fn.js:
    (**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    *)
  
  @polymer/polymer/lib/mixins/mutable-data.js:
    (**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    *)
  
  @polymer/polymer/lib/utils/templatize.js:
    (**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    *)
  
  @polymer/polymer/lib/legacy/templatizer-behavior.js:
    (**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    *)
  
  @polymer/polymer/lib/utils/hide-template-controls.js:
    (**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    *)
  
  @polymer/polymer/lib/elements/dom-bind.js:
    (**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    *)
  
  @polymer/polymer/lib/utils/html-tag.js:
    (**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    *)
  
  @polymer/polymer/polymer-element.js:
    (**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    *)
  
  @polymer/polymer/lib/elements/dom-repeat.js:
    (**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    *)
  
  @polymer/polymer/lib/elements/dom-if.js:
    (**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    *)
  
  @polymer/polymer/lib/elements/array-selector.js:
    (**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    *)
  
  @webcomponents/shadycss/entrypoints/custom-style-interface.js:
    (**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    *)
  
  @polymer/polymer/lib/elements/custom-style.js:
    (**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    *)
  
  @polymer/polymer/lib/legacy/mutable-data-behavior.js:
    (**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    *)
  
  @polymer/polymer/polymer-legacy.js:
    (**
    @license
    Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    *)
  
  @polymer/paper-styles/color.js:
    (**
    @license
    Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at
    http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
    http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
    found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
    part of the polymer project is also subject to an additional IP rights grant
    found at http://polymer.github.io/PATENTS.txt
    *)
  
  @polymer/paper-styles/default-theme.js:
    (**
    @license
    Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at
    http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
    http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
    found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
    part of the polymer project is also subject to an additional IP rights grant
    found at http://polymer.github.io/PATENTS.txt
    *)
  
  @polymer/iron-form-element-behavior/iron-form-element-behavior.js:
    (**
    @license
    Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at
    http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
    http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
    found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
    part of the polymer project is also subject to an additional IP rights grant
    found at http://polymer.github.io/PATENTS.txt
    *)
  
  @polymer/iron-meta/iron-meta.js:
    (**
    @license
    Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at
    http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
    http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
    found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
    part of the polymer project is also subject to an additional IP rights grant
    found at http://polymer.github.io/PATENTS.txt
    *)
  
  @polymer/iron-validatable-behavior/iron-validatable-behavior.js:
    (**
    @license
    Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at
    http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
    http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
    found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
    part of the polymer project is also subject to an additional IP rights grant
    found at http://polymer.github.io/PATENTS.txt
    *)
  
  @polymer/iron-checked-element-behavior/iron-checked-element-behavior.js:
    (**
    @license
    Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at
    http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
    http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
    found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
    part of the polymer project is also subject to an additional IP rights grant
    found at http://polymer.github.io/PATENTS.txt
    *)
  
  @polymer/iron-behaviors/iron-control-state.js:
    (**
    @license
    Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at
    http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
    http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
    found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
    part of the polymer project is also subject to an additional IP rights grant
    found at http://polymer.github.io/PATENTS.txt
    *)
  
  @polymer/iron-a11y-keys-behavior/iron-a11y-keys-behavior.js:
    (**
    @license
    Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at
    http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
    http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
    found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
    part of the polymer project is also subject to an additional IP rights grant
    found at http://polymer.github.io/PATENTS.txt
    *)
  
  @polymer/iron-behaviors/iron-button-state.js:
    (**
    @license
    Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at
    http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
    http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
    found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
    part of the polymer project is also subject to an additional IP rights grant
    found at http://polymer.github.io/PATENTS.txt
    *)
  
  @polymer/paper-ripple/paper-ripple.js:
    (**
    @license
    Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at
    http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
    http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
    found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
    part of the polymer project is also subject to an additional IP rights grant
    found at http://polymer.github.io/PATENTS.txt
    *)
  
  @polymer/paper-behaviors/paper-ripple-behavior.js:
    (**
    @license
    Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at
    http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
    http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
    found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
    part of the polymer project is also subject to an additional IP rights grant
    found at http://polymer.github.io/PATENTS.txt
    *)
  
  @polymer/paper-behaviors/paper-inky-focus-behavior.js:
    (**
    @license
    Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at
    http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
    http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
    found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
    part of the polymer project is also subject to an additional IP rights grant
    found at http://polymer.github.io/PATENTS.txt
    *)
  
  @polymer/paper-behaviors/paper-checked-element-behavior.js:
    (**
    @license
    Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at
    http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
    http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
    found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
    part of the polymer project is also subject to an additional IP rights grant
    found at http://polymer.github.io/PATENTS.txt
    *)
  
  @polymer/paper-checkbox/paper-checkbox.js:
    (**
    @license
    Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
    The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
    The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
    Code distributed by Google as part of the polymer project is also
    subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
    *)
  */
