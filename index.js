
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("lodash-lodash/index.js", Function("exports, require, module",
"module.exports = require('./dist/lodash.compat.js');//@ sourceURL=lodash-lodash/index.js"
));
require.register("lodash-lodash/dist/lodash.compat.js", Function("exports, require, module",
"/**\n\
 * @license\n\
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>\n\
 * Build: `lodash -o ./dist/lodash.compat.js`\n\
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>\n\
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>\n\
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors\n\
 * Available under MIT license <http://lodash.com/license>\n\
 */\n\
;(function() {\n\
\n\
  /** Used as a safe reference for `undefined` in pre ES5 environments */\n\
  var undefined;\n\
\n\
  /** Used to pool arrays and objects used internally */\n\
  var arrayPool = [],\n\
      objectPool = [];\n\
\n\
  /** Used to generate unique IDs */\n\
  var idCounter = 0;\n\
\n\
  /** Used internally to indicate various things */\n\
  var indicatorObject = {};\n\
\n\
  /** Used to prefix keys to avoid issues with `__proto__` and properties on `Object.prototype` */\n\
  var keyPrefix = +new Date + '';\n\
\n\
  /** Used as the size when optimizations are enabled for large arrays */\n\
  var largeArraySize = 75;\n\
\n\
  /** Used as the max size of the `arrayPool` and `objectPool` */\n\
  var maxPoolSize = 40;\n\
\n\
  /** Used to detect and test whitespace */\n\
  var whitespace = (\n\
    // whitespace\n\
    ' \\t\\x0B\\f\\xA0\\ufeff' +\n\
\n\
    // line terminators\n\
    '\\n\
\\r\\u2028\\u2029' +\n\
\n\
    // unicode category \"Zs\" space separators\n\
    '\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000'\n\
  );\n\
\n\
  /** Used to match empty string literals in compiled template source */\n\
  var reEmptyStringLeading = /\\b__p \\+= '';/g,\n\
      reEmptyStringMiddle = /\\b(__p \\+=) '' \\+/g,\n\
      reEmptyStringTrailing = /(__e\\(.*?\\)|\\b__t\\)) \\+\\n\
'';/g;\n\
\n\
  /**\n\
   * Used to match ES6 template delimiters\n\
   * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-literals-string-literals\n\
   */\n\
  var reEsTemplate = /\\$\\{([^\\\\}]*(?:\\\\.[^\\\\}]*)*)\\}/g;\n\
\n\
  /** Used to match regexp flags from their coerced string values */\n\
  var reFlags = /\\w*$/;\n\
\n\
  /** Used to detected named functions */\n\
  var reFuncName = /^\\s*function[ \\n\
\\r\\t]+\\w/;\n\
\n\
  /** Used to match \"interpolate\" template delimiters */\n\
  var reInterpolate = /<%=([\\s\\S]+?)%>/g;\n\
\n\
  /** Used to match leading whitespace and zeros to be removed */\n\
  var reLeadingSpacesAndZeros = RegExp('^[' + whitespace + ']*0+(?=.$)');\n\
\n\
  /** Used to ensure capturing order of template delimiters */\n\
  var reNoMatch = /($^)/;\n\
\n\
  /** Used to detect functions containing a `this` reference */\n\
  var reThis = /\\bthis\\b/;\n\
\n\
  /** Used to match unescaped characters in compiled string literals */\n\
  var reUnescapedString = /['\\n\
\\r\\t\\u2028\\u2029\\\\]/g;\n\
\n\
  /** Used to assign default `context` object properties */\n\
  var contextProps = [\n\
    'Array', 'Boolean', 'Date', 'Error', 'Function', 'Math', 'Number', 'Object',\n\
    'RegExp', 'String', '_', 'attachEvent', 'clearTimeout', 'isFinite', 'isNaN',\n\
    'parseInt', 'setTimeout'\n\
  ];\n\
\n\
  /** Used to fix the JScript [[DontEnum]] bug */\n\
  var shadowedProps = [\n\
    'constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable',\n\
    'toLocaleString', 'toString', 'valueOf'\n\
  ];\n\
\n\
  /** Used to make template sourceURLs easier to identify */\n\
  var templateCounter = 0;\n\
\n\
  /** `Object#toString` result shortcuts */\n\
  var argsClass = '[object Arguments]',\n\
      arrayClass = '[object Array]',\n\
      boolClass = '[object Boolean]',\n\
      dateClass = '[object Date]',\n\
      errorClass = '[object Error]',\n\
      funcClass = '[object Function]',\n\
      numberClass = '[object Number]',\n\
      objectClass = '[object Object]',\n\
      regexpClass = '[object RegExp]',\n\
      stringClass = '[object String]';\n\
\n\
  /** Used to identify object classifications that `_.clone` supports */\n\
  var cloneableClasses = {};\n\
  cloneableClasses[funcClass] = false;\n\
  cloneableClasses[argsClass] = cloneableClasses[arrayClass] =\n\
  cloneableClasses[boolClass] = cloneableClasses[dateClass] =\n\
  cloneableClasses[numberClass] = cloneableClasses[objectClass] =\n\
  cloneableClasses[regexpClass] = cloneableClasses[stringClass] = true;\n\
\n\
  /** Used as an internal `_.debounce` options object */\n\
  var debounceOptions = {\n\
    'leading': false,\n\
    'maxWait': 0,\n\
    'trailing': false\n\
  };\n\
\n\
  /** Used as the property descriptor for `__bindData__` */\n\
  var descriptor = {\n\
    'configurable': false,\n\
    'enumerable': false,\n\
    'value': null,\n\
    'writable': false\n\
  };\n\
\n\
  /** Used as the data object for `iteratorTemplate` */\n\
  var iteratorData = {\n\
    'args': '',\n\
    'array': null,\n\
    'bottom': '',\n\
    'firstArg': '',\n\
    'init': '',\n\
    'keys': null,\n\
    'loop': '',\n\
    'shadowedProps': null,\n\
    'support': null,\n\
    'top': '',\n\
    'useHas': false\n\
  };\n\
\n\
  /** Used to determine if values are of the language type Object */\n\
  var objectTypes = {\n\
    'boolean': false,\n\
    'function': true,\n\
    'object': true,\n\
    'number': false,\n\
    'string': false,\n\
    'undefined': false\n\
  };\n\
\n\
  /** Used to escape characters for inclusion in compiled string literals */\n\
  var stringEscapes = {\n\
    '\\\\': '\\\\',\n\
    \"'\": \"'\",\n\
    '\\n\
': 'n',\n\
    '\\r': 'r',\n\
    '\\t': 't',\n\
    '\\u2028': 'u2028',\n\
    '\\u2029': 'u2029'\n\
  };\n\
\n\
  /** Used as a reference to the global object */\n\
  var root = (objectTypes[typeof window] && window) || this;\n\
\n\
  /** Detect free variable `exports` */\n\
  var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;\n\
\n\
  /** Detect free variable `module` */\n\
  var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;\n\
\n\
  /** Detect the popular CommonJS extension `module.exports` */\n\
  var moduleExports = freeModule && freeModule.exports === freeExports && freeExports;\n\
\n\
  /** Detect free variable `global` from Node.js or Browserified code and use it as `root` */\n\
  var freeGlobal = objectTypes[typeof global] && global;\n\
  if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {\n\
    root = freeGlobal;\n\
  }\n\
\n\
  /*--------------------------------------------------------------------------*/\n\
\n\
  /**\n\
   * The base implementation of `_.indexOf` without support for binary searches\n\
   * or `fromIndex` constraints.\n\
   *\n\
   * @private\n\
   * @param {Array} array The array to search.\n\
   * @param {*} value The value to search for.\n\
   * @param {number} [fromIndex=0] The index to search from.\n\
   * @returns {number} Returns the index of the matched value or `-1`.\n\
   */\n\
  function baseIndexOf(array, value, fromIndex) {\n\
    var index = (fromIndex || 0) - 1,\n\
        length = array ? array.length : 0;\n\
\n\
    while (++index < length) {\n\
      if (array[index] === value) {\n\
        return index;\n\
      }\n\
    }\n\
    return -1;\n\
  }\n\
\n\
  /**\n\
   * An implementation of `_.contains` for cache objects that mimics the return\n\
   * signature of `_.indexOf` by returning `0` if the value is found, else `-1`.\n\
   *\n\
   * @private\n\
   * @param {Object} cache The cache object to inspect.\n\
   * @param {*} value The value to search for.\n\
   * @returns {number} Returns `0` if `value` is found, else `-1`.\n\
   */\n\
  function cacheIndexOf(cache, value) {\n\
    var type = typeof value;\n\
    cache = cache.cache;\n\
\n\
    if (type == 'boolean' || value == null) {\n\
      return cache[value] ? 0 : -1;\n\
    }\n\
    if (type != 'number' && type != 'string') {\n\
      type = 'object';\n\
    }\n\
    var key = type == 'number' ? value : keyPrefix + value;\n\
    cache = (cache = cache[type]) && cache[key];\n\
\n\
    return type == 'object'\n\
      ? (cache && baseIndexOf(cache, value) > -1 ? 0 : -1)\n\
      : (cache ? 0 : -1);\n\
  }\n\
\n\
  /**\n\
   * Adds a given value to the corresponding cache object.\n\
   *\n\
   * @private\n\
   * @param {*} value The value to add to the cache.\n\
   */\n\
  function cachePush(value) {\n\
    var cache = this.cache,\n\
        type = typeof value;\n\
\n\
    if (type == 'boolean' || value == null) {\n\
      cache[value] = true;\n\
    } else {\n\
      if (type != 'number' && type != 'string') {\n\
        type = 'object';\n\
      }\n\
      var key = type == 'number' ? value : keyPrefix + value,\n\
          typeCache = cache[type] || (cache[type] = {});\n\
\n\
      if (type == 'object') {\n\
        (typeCache[key] || (typeCache[key] = [])).push(value);\n\
      } else {\n\
        typeCache[key] = true;\n\
      }\n\
    }\n\
  }\n\
\n\
  /**\n\
   * Used by `_.max` and `_.min` as the default callback when a given\n\
   * collection is a string value.\n\
   *\n\
   * @private\n\
   * @param {string} value The character to inspect.\n\
   * @returns {number} Returns the code unit of given character.\n\
   */\n\
  function charAtCallback(value) {\n\
    return value.charCodeAt(0);\n\
  }\n\
\n\
  /**\n\
   * Used by `sortBy` to compare transformed `collection` elements, stable sorting\n\
   * them in ascending order.\n\
   *\n\
   * @private\n\
   * @param {Object} a The object to compare to `b`.\n\
   * @param {Object} b The object to compare to `a`.\n\
   * @returns {number} Returns the sort order indicator of `1` or `-1`.\n\
   */\n\
  function compareAscending(a, b) {\n\
    var ac = a.criteria,\n\
        bc = b.criteria,\n\
        index = -1,\n\
        length = ac.length;\n\
\n\
    while (++index < length) {\n\
      var value = ac[index],\n\
          other = bc[index];\n\
\n\
      if (value !== other) {\n\
        if (value > other || typeof value == 'undefined') {\n\
          return 1;\n\
        }\n\
        if (value < other || typeof other == 'undefined') {\n\
          return -1;\n\
        }\n\
      }\n\
    }\n\
    // Fixes an `Array#sort` bug in the JS engine embedded in Adobe applications\n\
    // that causes it, under certain circumstances, to return the same value for\n\
    // `a` and `b`. See https://github.com/jashkenas/underscore/pull/1247\n\
    //\n\
    // This also ensures a stable sort in V8 and other engines.\n\
    // See http://code.google.com/p/v8/issues/detail?id=90\n\
    return a.index - b.index;\n\
  }\n\
\n\
  /**\n\
   * Creates a cache object to optimize linear searches of large arrays.\n\
   *\n\
   * @private\n\
   * @param {Array} [array=[]] The array to search.\n\
   * @returns {null|Object} Returns the cache object or `null` if caching should not be used.\n\
   */\n\
  function createCache(array) {\n\
    var index = -1,\n\
        length = array.length,\n\
        first = array[0],\n\
        mid = array[(length / 2) | 0],\n\
        last = array[length - 1];\n\
\n\
    if (first && typeof first == 'object' &&\n\
        mid && typeof mid == 'object' && last && typeof last == 'object') {\n\
      return false;\n\
    }\n\
    var cache = getObject();\n\
    cache['false'] = cache['null'] = cache['true'] = cache['undefined'] = false;\n\
\n\
    var result = getObject();\n\
    result.array = array;\n\
    result.cache = cache;\n\
    result.push = cachePush;\n\
\n\
    while (++index < length) {\n\
      result.push(array[index]);\n\
    }\n\
    return result;\n\
  }\n\
\n\
  /**\n\
   * Used by `template` to escape characters for inclusion in compiled\n\
   * string literals.\n\
   *\n\
   * @private\n\
   * @param {string} match The matched character to escape.\n\
   * @returns {string} Returns the escaped character.\n\
   */\n\
  function escapeStringChar(match) {\n\
    return '\\\\' + stringEscapes[match];\n\
  }\n\
\n\
  /**\n\
   * Gets an array from the array pool or creates a new one if the pool is empty.\n\
   *\n\
   * @private\n\
   * @returns {Array} The array from the pool.\n\
   */\n\
  function getArray() {\n\
    return arrayPool.pop() || [];\n\
  }\n\
\n\
  /**\n\
   * Gets an object from the object pool or creates a new one if the pool is empty.\n\
   *\n\
   * @private\n\
   * @returns {Object} The object from the pool.\n\
   */\n\
  function getObject() {\n\
    return objectPool.pop() || {\n\
      'array': null,\n\
      'cache': null,\n\
      'criteria': null,\n\
      'false': false,\n\
      'index': 0,\n\
      'null': false,\n\
      'number': null,\n\
      'object': null,\n\
      'push': null,\n\
      'string': null,\n\
      'true': false,\n\
      'undefined': false,\n\
      'value': null\n\
    };\n\
  }\n\
\n\
  /**\n\
   * Checks if `value` is a DOM node in IE < 9.\n\
   *\n\
   * @private\n\
   * @param {*} value The value to check.\n\
   * @returns {boolean} Returns `true` if the `value` is a DOM node, else `false`.\n\
   */\n\
  function isNode(value) {\n\
    // IE < 9 presents DOM nodes as `Object` objects except they have `toString`\n\
    // methods that are `typeof` \"string\" and still can coerce nodes to strings\n\
    return typeof value.toString != 'function' && typeof (value + '') == 'string';\n\
  }\n\
\n\
  /**\n\
   * Releases the given array back to the array pool.\n\
   *\n\
   * @private\n\
   * @param {Array} [array] The array to release.\n\
   */\n\
  function releaseArray(array) {\n\
    array.length = 0;\n\
    if (arrayPool.length < maxPoolSize) {\n\
      arrayPool.push(array);\n\
    }\n\
  }\n\
\n\
  /**\n\
   * Releases the given object back to the object pool.\n\
   *\n\
   * @private\n\
   * @param {Object} [object] The object to release.\n\
   */\n\
  function releaseObject(object) {\n\
    var cache = object.cache;\n\
    if (cache) {\n\
      releaseObject(cache);\n\
    }\n\
    object.array = object.cache = object.criteria = object.object = object.number = object.string = object.value = null;\n\
    if (objectPool.length < maxPoolSize) {\n\
      objectPool.push(object);\n\
    }\n\
  }\n\
\n\
  /**\n\
   * Slices the `collection` from the `start` index up to, but not including,\n\
   * the `end` index.\n\
   *\n\
   * Note: This function is used instead of `Array#slice` to support node lists\n\
   * in IE < 9 and to ensure dense arrays are returned.\n\
   *\n\
   * @private\n\
   * @param {Array|Object|string} collection The collection to slice.\n\
   * @param {number} start The start index.\n\
   * @param {number} end The end index.\n\
   * @returns {Array} Returns the new array.\n\
   */\n\
  function slice(array, start, end) {\n\
    start || (start = 0);\n\
    if (typeof end == 'undefined') {\n\
      end = array ? array.length : 0;\n\
    }\n\
    var index = -1,\n\
        length = end - start || 0,\n\
        result = Array(length < 0 ? 0 : length);\n\
\n\
    while (++index < length) {\n\
      result[index] = array[start + index];\n\
    }\n\
    return result;\n\
  }\n\
\n\
  /*--------------------------------------------------------------------------*/\n\
\n\
  /**\n\
   * Create a new `lodash` function using the given context object.\n\
   *\n\
   * @static\n\
   * @memberOf _\n\
   * @category Utilities\n\
   * @param {Object} [context=root] The context object.\n\
   * @returns {Function} Returns the `lodash` function.\n\
   */\n\
  function runInContext(context) {\n\
    // Avoid issues with some ES3 environments that attempt to use values, named\n\
    // after built-in constructors like `Object`, for the creation of literals.\n\
    // ES5 clears this up by stating that literals must use built-in constructors.\n\
    // See http://es5.github.io/#x11.1.5.\n\
    context = context ? _.defaults(root.Object(), context, _.pick(root, contextProps)) : root;\n\
\n\
    /** Native constructor references */\n\
    var Array = context.Array,\n\
        Boolean = context.Boolean,\n\
        Date = context.Date,\n\
        Error = context.Error,\n\
        Function = context.Function,\n\
        Math = context.Math,\n\
        Number = context.Number,\n\
        Object = context.Object,\n\
        RegExp = context.RegExp,\n\
        String = context.String,\n\
        TypeError = context.TypeError;\n\
\n\
    /**\n\
     * Used for `Array` method references.\n\
     *\n\
     * Normally `Array.prototype` would suffice, however, using an array literal\n\
     * avoids issues in Narwhal.\n\
     */\n\
    var arrayRef = [];\n\
\n\
    /** Used for native method references */\n\
    var errorProto = Error.prototype,\n\
        objectProto = Object.prototype,\n\
        stringProto = String.prototype;\n\
\n\
    /** Used to restore the original `_` reference in `noConflict` */\n\
    var oldDash = context._;\n\
\n\
    /** Used to resolve the internal [[Class]] of values */\n\
    var toString = objectProto.toString;\n\
\n\
    /** Used to detect if a method is native */\n\
    var reNative = RegExp('^' +\n\
      String(toString)\n\
        .replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')\n\
        .replace(/toString| for [^\\]]+/g, '.*?') + '$'\n\
    );\n\
\n\
    /** Native method shortcuts */\n\
    var ceil = Math.ceil,\n\
        clearTimeout = context.clearTimeout,\n\
        floor = Math.floor,\n\
        fnToString = Function.prototype.toString,\n\
        getPrototypeOf = isNative(getPrototypeOf = Object.getPrototypeOf) && getPrototypeOf,\n\
        hasOwnProperty = objectProto.hasOwnProperty,\n\
        push = arrayRef.push,\n\
        propertyIsEnumerable = objectProto.propertyIsEnumerable,\n\
        setTimeout = context.setTimeout,\n\
        splice = arrayRef.splice,\n\
        unshift = arrayRef.unshift;\n\
\n\
    /** Used to set meta data on functions */\n\
    var defineProperty = (function() {\n\
      // IE 8 only accepts DOM elements\n\
      try {\n\
        var o = {},\n\
            func = isNative(func = Object.defineProperty) && func,\n\
            result = func(o, o, o) && func;\n\
      } catch(e) { }\n\
      return result;\n\
    }());\n\
\n\
    /* Native method shortcuts for methods with the same name as other `lodash` methods */\n\
    var nativeCreate = isNative(nativeCreate = Object.create) && nativeCreate,\n\
        nativeIsArray = isNative(nativeIsArray = Array.isArray) && nativeIsArray,\n\
        nativeIsFinite = context.isFinite,\n\
        nativeIsNaN = context.isNaN,\n\
        nativeKeys = isNative(nativeKeys = Object.keys) && nativeKeys,\n\
        nativeMax = Math.max,\n\
        nativeMin = Math.min,\n\
        nativeParseInt = context.parseInt,\n\
        nativeRandom = Math.random;\n\
\n\
    /** Used to lookup a built-in constructor by [[Class]] */\n\
    var ctorByClass = {};\n\
    ctorByClass[arrayClass] = Array;\n\
    ctorByClass[boolClass] = Boolean;\n\
    ctorByClass[dateClass] = Date;\n\
    ctorByClass[funcClass] = Function;\n\
    ctorByClass[objectClass] = Object;\n\
    ctorByClass[numberClass] = Number;\n\
    ctorByClass[regexpClass] = RegExp;\n\
    ctorByClass[stringClass] = String;\n\
\n\
    /** Used to avoid iterating non-enumerable properties in IE < 9 */\n\
    var nonEnumProps = {};\n\
    nonEnumProps[arrayClass] = nonEnumProps[dateClass] = nonEnumProps[numberClass] = { 'constructor': true, 'toLocaleString': true, 'toString': true, 'valueOf': true };\n\
    nonEnumProps[boolClass] = nonEnumProps[stringClass] = { 'constructor': true, 'toString': true, 'valueOf': true };\n\
    nonEnumProps[errorClass] = nonEnumProps[funcClass] = nonEnumProps[regexpClass] = { 'constructor': true, 'toString': true };\n\
    nonEnumProps[objectClass] = { 'constructor': true };\n\
\n\
    (function() {\n\
      var length = shadowedProps.length;\n\
      while (length--) {\n\
        var key = shadowedProps[length];\n\
        for (var className in nonEnumProps) {\n\
          if (hasOwnProperty.call(nonEnumProps, className) && !hasOwnProperty.call(nonEnumProps[className], key)) {\n\
            nonEnumProps[className][key] = false;\n\
          }\n\
        }\n\
      }\n\
    }());\n\
\n\
    /*--------------------------------------------------------------------------*/\n\
\n\
    /**\n\
     * Creates a `lodash` object which wraps the given value to enable intuitive\n\
     * method chaining.\n\
     *\n\
     * In addition to Lo-Dash methods, wrappers also have the following `Array` methods:\n\
     * `concat`, `join`, `pop`, `push`, `reverse`, `shift`, `slice`, `sort`, `splice`,\n\
     * and `unshift`\n\
     *\n\
     * Chaining is supported in custom builds as long as the `value` method is\n\
     * implicitly or explicitly included in the build.\n\
     *\n\
     * The chainable wrapper functions are:\n\
     * `after`, `assign`, `bind`, `bindAll`, `bindKey`, `chain`, `compact`,\n\
     * `compose`, `concat`, `countBy`, `create`, `createCallback`, `curry`,\n\
     * `debounce`, `defaults`, `defer`, `delay`, `difference`, `filter`, `flatten`,\n\
     * `forEach`, `forEachRight`, `forIn`, `forInRight`, `forOwn`, `forOwnRight`,\n\
     * `functions`, `groupBy`, `indexBy`, `initial`, `intersection`, `invert`,\n\
     * `invoke`, `keys`, `map`, `max`, `memoize`, `merge`, `min`, `object`, `omit`,\n\
     * `once`, `pairs`, `partial`, `partialRight`, `pick`, `pluck`, `pull`, `push`,\n\
     * `range`, `reject`, `remove`, `rest`, `reverse`, `shuffle`, `slice`, `sort`,\n\
     * `sortBy`, `splice`, `tap`, `throttle`, `times`, `toArray`, `transform`,\n\
     * `union`, `uniq`, `unshift`, `unzip`, `values`, `where`, `without`, `wrap`,\n\
     * and `zip`\n\
     *\n\
     * The non-chainable wrapper functions are:\n\
     * `clone`, `cloneDeep`, `contains`, `escape`, `every`, `find`, `findIndex`,\n\
     * `findKey`, `findLast`, `findLastIndex`, `findLastKey`, `has`, `identity`,\n\
     * `indexOf`, `isArguments`, `isArray`, `isBoolean`, `isDate`, `isElement`,\n\
     * `isEmpty`, `isEqual`, `isFinite`, `isFunction`, `isNaN`, `isNull`, `isNumber`,\n\
     * `isObject`, `isPlainObject`, `isRegExp`, `isString`, `isUndefined`, `join`,\n\
     * `lastIndexOf`, `mixin`, `noConflict`, `parseInt`, `pop`, `random`, `reduce`,\n\
     * `reduceRight`, `result`, `shift`, `size`, `some`, `sortedIndex`, `runInContext`,\n\
     * `template`, `unescape`, `uniqueId`, and `value`\n\
     *\n\
     * The wrapper functions `first` and `last` return wrapped values when `n` is\n\
     * provided, otherwise they return unwrapped values.\n\
     *\n\
     * Explicit chaining can be enabled by using the `_.chain` method.\n\
     *\n\
     * @name _\n\
     * @constructor\n\
     * @category Chaining\n\
     * @param {*} value The value to wrap in a `lodash` instance.\n\
     * @returns {Object} Returns a `lodash` instance.\n\
     * @example\n\
     *\n\
     * var wrapped = _([1, 2, 3]);\n\
     *\n\
     * // returns an unwrapped value\n\
     * wrapped.reduce(function(sum, num) {\n\
     *   return sum + num;\n\
     * });\n\
     * // => 6\n\
     *\n\
     * // returns a wrapped value\n\
     * var squares = wrapped.map(function(num) {\n\
     *   return num * num;\n\
     * });\n\
     *\n\
     * _.isArray(squares);\n\
     * // => false\n\
     *\n\
     * _.isArray(squares.value());\n\
     * // => true\n\
     */\n\
    function lodash(value) {\n\
      // don't wrap if already wrapped, even if wrapped by a different `lodash` constructor\n\
      return (value && typeof value == 'object' && !isArray(value) && hasOwnProperty.call(value, '__wrapped__'))\n\
       ? value\n\
       : new lodashWrapper(value);\n\
    }\n\
\n\
    /**\n\
     * A fast path for creating `lodash` wrapper objects.\n\
     *\n\
     * @private\n\
     * @param {*} value The value to wrap in a `lodash` instance.\n\
     * @param {boolean} chainAll A flag to enable chaining for all methods\n\
     * @returns {Object} Returns a `lodash` instance.\n\
     */\n\
    function lodashWrapper(value, chainAll) {\n\
      this.__chain__ = !!chainAll;\n\
      this.__wrapped__ = value;\n\
    }\n\
    // ensure `new lodashWrapper` is an instance of `lodash`\n\
    lodashWrapper.prototype = lodash.prototype;\n\
\n\
    /**\n\
     * An object used to flag environments features.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @type Object\n\
     */\n\
    var support = lodash.support = {};\n\
\n\
    (function() {\n\
      var ctor = function() { this.x = 1; },\n\
          object = { '0': 1, 'length': 1 },\n\
          props = [];\n\
\n\
      ctor.prototype = { 'valueOf': 1, 'y': 1 };\n\
      for (var key in new ctor) { props.push(key); }\n\
      for (key in arguments) { }\n\
\n\
      /**\n\
       * Detect if an `arguments` object's [[Class]] is resolvable (all but Firefox < 4, IE < 9).\n\
       *\n\
       * @memberOf _.support\n\
       * @type boolean\n\
       */\n\
      support.argsClass = toString.call(arguments) == argsClass;\n\
\n\
      /**\n\
       * Detect if `arguments` objects are `Object` objects (all but Narwhal and Opera < 10.5).\n\
       *\n\
       * @memberOf _.support\n\
       * @type boolean\n\
       */\n\
      support.argsObject = arguments.constructor == Object && !(arguments instanceof Array);\n\
\n\
      /**\n\
       * Detect if `name` or `message` properties of `Error.prototype` are\n\
       * enumerable by default. (IE < 9, Safari < 5.1)\n\
       *\n\
       * @memberOf _.support\n\
       * @type boolean\n\
       */\n\
      support.enumErrorProps = propertyIsEnumerable.call(errorProto, 'message') || propertyIsEnumerable.call(errorProto, 'name');\n\
\n\
      /**\n\
       * Detect if `prototype` properties are enumerable by default.\n\
       *\n\
       * Firefox < 3.6, Opera > 9.50 - Opera < 11.60, and Safari < 5.1\n\
       * (if the prototype or a property on the prototype has been set)\n\
       * incorrectly sets a function's `prototype` property [[Enumerable]]\n\
       * value to `true`.\n\
       *\n\
       * @memberOf _.support\n\
       * @type boolean\n\
       */\n\
      support.enumPrototypes = propertyIsEnumerable.call(ctor, 'prototype');\n\
\n\
      /**\n\
       * Detect if functions can be decompiled by `Function#toString`\n\
       * (all but PS3 and older Opera mobile browsers & avoided in Windows 8 apps).\n\
       *\n\
       * @memberOf _.support\n\
       * @type boolean\n\
       */\n\
      support.funcDecomp = !isNative(context.WinRTError) && reThis.test(runInContext);\n\
\n\
      /**\n\
       * Detect if `Function#name` is supported (all but IE).\n\
       *\n\
       * @memberOf _.support\n\
       * @type boolean\n\
       */\n\
      support.funcNames = typeof Function.name == 'string';\n\
\n\
      /**\n\
       * Detect if `arguments` object indexes are non-enumerable\n\
       * (Firefox < 4, IE < 9, PhantomJS, Safari < 5.1).\n\
       *\n\
       * @memberOf _.support\n\
       * @type boolean\n\
       */\n\
      support.nonEnumArgs = key != 0;\n\
\n\
      /**\n\
       * Detect if properties shadowing those on `Object.prototype` are non-enumerable.\n\
       *\n\
       * In IE < 9 an objects own properties, shadowing non-enumerable ones, are\n\
       * made non-enumerable as well (a.k.a the JScript [[DontEnum]] bug).\n\
       *\n\
       * @memberOf _.support\n\
       * @type boolean\n\
       */\n\
      support.nonEnumShadows = !/valueOf/.test(props);\n\
\n\
      /**\n\
       * Detect if own properties are iterated after inherited properties (all but IE < 9).\n\
       *\n\
       * @memberOf _.support\n\
       * @type boolean\n\
       */\n\
      support.ownLast = props[0] != 'x';\n\
\n\
      /**\n\
       * Detect if `Array#shift` and `Array#splice` augment array-like objects correctly.\n\
       *\n\
       * Firefox < 10, IE compatibility mode, and IE < 9 have buggy Array `shift()`\n\
       * and `splice()` functions that fail to remove the last element, `value[0]`,\n\
       * of array-like objects even though the `length` property is set to `0`.\n\
       * The `shift()` method is buggy in IE 8 compatibility mode, while `splice()`\n\
       * is buggy regardless of mode in IE < 9 and buggy in compatibility mode in IE 9.\n\
       *\n\
       * @memberOf _.support\n\
       * @type boolean\n\
       */\n\
      support.spliceObjects = (arrayRef.splice.call(object, 0, 1), !object[0]);\n\
\n\
      /**\n\
       * Detect lack of support for accessing string characters by index.\n\
       *\n\
       * IE < 8 can't access characters by index and IE 8 can only access\n\
       * characters by index on string literals.\n\
       *\n\
       * @memberOf _.support\n\
       * @type boolean\n\
       */\n\
      support.unindexedChars = ('x'[0] + Object('x')[0]) != 'xx';\n\
\n\
      /**\n\
       * Detect if a DOM node's [[Class]] is resolvable (all but IE < 9)\n\
       * and that the JS engine errors when attempting to coerce an object to\n\
       * a string without a `toString` function.\n\
       *\n\
       * @memberOf _.support\n\
       * @type boolean\n\
       */\n\
      try {\n\
        support.nodeClass = !(toString.call(document) == objectClass && !({ 'toString': 0 } + ''));\n\
      } catch(e) {\n\
        support.nodeClass = true;\n\
      }\n\
    }(1));\n\
\n\
    /**\n\
     * By default, the template delimiters used by Lo-Dash are similar to those in\n\
     * embedded Ruby (ERB). Change the following template settings to use alternative\n\
     * delimiters.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @type Object\n\
     */\n\
    lodash.templateSettings = {\n\
\n\
      /**\n\
       * Used to detect `data` property values to be HTML-escaped.\n\
       *\n\
       * @memberOf _.templateSettings\n\
       * @type RegExp\n\
       */\n\
      'escape': /<%-([\\s\\S]+?)%>/g,\n\
\n\
      /**\n\
       * Used to detect code to be evaluated.\n\
       *\n\
       * @memberOf _.templateSettings\n\
       * @type RegExp\n\
       */\n\
      'evaluate': /<%([\\s\\S]+?)%>/g,\n\
\n\
      /**\n\
       * Used to detect `data` property values to inject.\n\
       *\n\
       * @memberOf _.templateSettings\n\
       * @type RegExp\n\
       */\n\
      'interpolate': reInterpolate,\n\
\n\
      /**\n\
       * Used to reference the data object in the template text.\n\
       *\n\
       * @memberOf _.templateSettings\n\
       * @type string\n\
       */\n\
      'variable': '',\n\
\n\
      /**\n\
       * Used to import variables into the compiled template.\n\
       *\n\
       * @memberOf _.templateSettings\n\
       * @type Object\n\
       */\n\
      'imports': {\n\
\n\
        /**\n\
         * A reference to the `lodash` function.\n\
         *\n\
         * @memberOf _.templateSettings.imports\n\
         * @type Function\n\
         */\n\
        '_': lodash\n\
      }\n\
    };\n\
\n\
    /*--------------------------------------------------------------------------*/\n\
\n\
    /**\n\
     * The template used to create iterator functions.\n\
     *\n\
     * @private\n\
     * @param {Object} data The data object used to populate the text.\n\
     * @returns {string} Returns the interpolated text.\n\
     */\n\
    var iteratorTemplate = function(obj) {\n\
\n\
      var __p = 'var index, iterable = ' +\n\
      (obj.firstArg) +\n\
      ', result = ' +\n\
      (obj.init) +\n\
      ';\\n\
if (!iterable) return result;\\n\
' +\n\
      (obj.top) +\n\
      ';';\n\
       if (obj.array) {\n\
      __p += '\\n\
var length = iterable.length; index = -1;\\n\
if (' +\n\
      (obj.array) +\n\
      ') {  ';\n\
       if (support.unindexedChars) {\n\
      __p += '\\n\
  if (isString(iterable)) {\\n\
    iterable = iterable.split(\\'\\')\\n\
  }  ';\n\
       }\n\
      __p += '\\n\
  while (++index < length) {\\n\
    ' +\n\
      (obj.loop) +\n\
      ';\\n\
  }\\n\
}\\n\
else {  ';\n\
       } else if (support.nonEnumArgs) {\n\
      __p += '\\n\
  var length = iterable.length; index = -1;\\n\
  if (length && isArguments(iterable)) {\\n\
    while (++index < length) {\\n\
      index += \\'\\';\\n\
      ' +\n\
      (obj.loop) +\n\
      ';\\n\
    }\\n\
  } else {  ';\n\
       }\n\
\n\
       if (support.enumPrototypes) {\n\
      __p += '\\n\
  var skipProto = typeof iterable == \\'function\\';\\n\
  ';\n\
       }\n\
\n\
       if (support.enumErrorProps) {\n\
      __p += '\\n\
  var skipErrorProps = iterable === errorProto || iterable instanceof Error;\\n\
  ';\n\
       }\n\
\n\
          var conditions = [];    if (support.enumPrototypes) { conditions.push('!(skipProto && index == \"prototype\")'); }    if (support.enumErrorProps)  { conditions.push('!(skipErrorProps && (index == \"message\" || index == \"name\"))'); }\n\
\n\
       if (obj.useHas && obj.keys) {\n\
      __p += '\\n\
  var ownIndex = -1,\\n\
      ownProps = objectTypes[typeof iterable] && keys(iterable),\\n\
      length = ownProps ? ownProps.length : 0;\\n\
\\n\
  while (++ownIndex < length) {\\n\
    index = ownProps[ownIndex];\\n\
';\n\
          if (conditions.length) {\n\
      __p += '    if (' +\n\
      (conditions.join(' && ')) +\n\
      ') {\\n\
  ';\n\
       }\n\
      __p +=\n\
      (obj.loop) +\n\
      ';    ';\n\
       if (conditions.length) {\n\
      __p += '\\n\
    }';\n\
       }\n\
      __p += '\\n\
  }  ';\n\
       } else {\n\
      __p += '\\n\
  for (index in iterable) {\\n\
';\n\
          if (obj.useHas) { conditions.push(\"hasOwnProperty.call(iterable, index)\"); }    if (conditions.length) {\n\
      __p += '    if (' +\n\
      (conditions.join(' && ')) +\n\
      ') {\\n\
  ';\n\
       }\n\
      __p +=\n\
      (obj.loop) +\n\
      ';    ';\n\
       if (conditions.length) {\n\
      __p += '\\n\
    }';\n\
       }\n\
      __p += '\\n\
  }    ';\n\
       if (support.nonEnumShadows) {\n\
      __p += '\\n\
\\n\
  if (iterable !== objectProto) {\\n\
    var ctor = iterable.constructor,\\n\
        isProto = iterable === (ctor && ctor.prototype),\\n\
        className = iterable === stringProto ? stringClass : iterable === errorProto ? errorClass : toString.call(iterable),\\n\
        nonEnum = nonEnumProps[className];\\n\
      ';\n\
       for (k = 0; k < 7; k++) {\n\
      __p += '\\n\
    index = \\'' +\n\
      (obj.shadowedProps[k]) +\n\
      '\\';\\n\
    if ((!(isProto && nonEnum[index]) && hasOwnProperty.call(iterable, index))';\n\
              if (!obj.useHas) {\n\
      __p += ' || (!nonEnum[index] && iterable[index] !== objectProto[index])';\n\
       }\n\
      __p += ') {\\n\
      ' +\n\
      (obj.loop) +\n\
      ';\\n\
    }      ';\n\
       }\n\
      __p += '\\n\
  }    ';\n\
       }\n\
\n\
       }\n\
\n\
       if (obj.array || support.nonEnumArgs) {\n\
      __p += '\\n\
}';\n\
       }\n\
      __p +=\n\
      (obj.bottom) +\n\
      ';\\n\
return result';\n\
\n\
      return __p\n\
    };\n\
\n\
    /*--------------------------------------------------------------------------*/\n\
\n\
    /**\n\
     * The base implementation of `_.bind` that creates the bound function and\n\
     * sets its meta data.\n\
     *\n\
     * @private\n\
     * @param {Array} bindData The bind data array.\n\
     * @returns {Function} Returns the new bound function.\n\
     */\n\
    function baseBind(bindData) {\n\
      var func = bindData[0],\n\
          partialArgs = bindData[2],\n\
          thisArg = bindData[4];\n\
\n\
      function bound() {\n\
        // `Function#bind` spec\n\
        // http://es5.github.io/#x15.3.4.5\n\
        if (partialArgs) {\n\
          // avoid `arguments` object deoptimizations by using `slice` instead\n\
          // of `Array.prototype.slice.call` and not assigning `arguments` to a\n\
          // variable as a ternary expression\n\
          var args = slice(partialArgs);\n\
          push.apply(args, arguments);\n\
        }\n\
        // mimic the constructor's `return` behavior\n\
        // http://es5.github.io/#x13.2.2\n\
        if (this instanceof bound) {\n\
          // ensure `new bound` is an instance of `func`\n\
          var thisBinding = baseCreate(func.prototype),\n\
              result = func.apply(thisBinding, args || arguments);\n\
          return isObject(result) ? result : thisBinding;\n\
        }\n\
        return func.apply(thisArg, args || arguments);\n\
      }\n\
      setBindData(bound, bindData);\n\
      return bound;\n\
    }\n\
\n\
    /**\n\
     * The base implementation of `_.clone` without argument juggling or support\n\
     * for `thisArg` binding.\n\
     *\n\
     * @private\n\
     * @param {*} value The value to clone.\n\
     * @param {boolean} [isDeep=false] Specify a deep clone.\n\
     * @param {Function} [callback] The function to customize cloning values.\n\
     * @param {Array} [stackA=[]] Tracks traversed source objects.\n\
     * @param {Array} [stackB=[]] Associates clones with source counterparts.\n\
     * @returns {*} Returns the cloned value.\n\
     */\n\
    function baseClone(value, isDeep, callback, stackA, stackB) {\n\
      if (callback) {\n\
        var result = callback(value);\n\
        if (typeof result != 'undefined') {\n\
          return result;\n\
        }\n\
      }\n\
      // inspect [[Class]]\n\
      var isObj = isObject(value);\n\
      if (isObj) {\n\
        var className = toString.call(value);\n\
        if (!cloneableClasses[className] || (!support.nodeClass && isNode(value))) {\n\
          return value;\n\
        }\n\
        var ctor = ctorByClass[className];\n\
        switch (className) {\n\
          case boolClass:\n\
          case dateClass:\n\
            return new ctor(+value);\n\
\n\
          case numberClass:\n\
          case stringClass:\n\
            return new ctor(value);\n\
\n\
          case regexpClass:\n\
            result = ctor(value.source, reFlags.exec(value));\n\
            result.lastIndex = value.lastIndex;\n\
            return result;\n\
        }\n\
      } else {\n\
        return value;\n\
      }\n\
      var isArr = isArray(value);\n\
      if (isDeep) {\n\
        // check for circular references and return corresponding clone\n\
        var initedStack = !stackA;\n\
        stackA || (stackA = getArray());\n\
        stackB || (stackB = getArray());\n\
\n\
        var length = stackA.length;\n\
        while (length--) {\n\
          if (stackA[length] == value) {\n\
            return stackB[length];\n\
          }\n\
        }\n\
        result = isArr ? ctor(value.length) : {};\n\
      }\n\
      else {\n\
        result = isArr ? slice(value) : assign({}, value);\n\
      }\n\
      // add array properties assigned by `RegExp#exec`\n\
      if (isArr) {\n\
        if (hasOwnProperty.call(value, 'index')) {\n\
          result.index = value.index;\n\
        }\n\
        if (hasOwnProperty.call(value, 'input')) {\n\
          result.input = value.input;\n\
        }\n\
      }\n\
      // exit for shallow clone\n\
      if (!isDeep) {\n\
        return result;\n\
      }\n\
      // add the source value to the stack of traversed objects\n\
      // and associate it with its clone\n\
      stackA.push(value);\n\
      stackB.push(result);\n\
\n\
      // recursively populate clone (susceptible to call stack limits)\n\
      (isArr ? baseEach : forOwn)(value, function(objValue, key) {\n\
        result[key] = baseClone(objValue, isDeep, callback, stackA, stackB);\n\
      });\n\
\n\
      if (initedStack) {\n\
        releaseArray(stackA);\n\
        releaseArray(stackB);\n\
      }\n\
      return result;\n\
    }\n\
\n\
    /**\n\
     * The base implementation of `_.create` without support for assigning\n\
     * properties to the created object.\n\
     *\n\
     * @private\n\
     * @param {Object} prototype The object to inherit from.\n\
     * @returns {Object} Returns the new object.\n\
     */\n\
    function baseCreate(prototype, properties) {\n\
      return isObject(prototype) ? nativeCreate(prototype) : {};\n\
    }\n\
    // fallback for browsers without `Object.create`\n\
    if (!nativeCreate) {\n\
      baseCreate = (function() {\n\
        function Object() {}\n\
        return function(prototype) {\n\
          if (isObject(prototype)) {\n\
            Object.prototype = prototype;\n\
            var result = new Object;\n\
            Object.prototype = null;\n\
          }\n\
          return result || context.Object();\n\
        };\n\
      }());\n\
    }\n\
\n\
    /**\n\
     * The base implementation of `_.createCallback` without support for creating\n\
     * \"_.pluck\" or \"_.where\" style callbacks.\n\
     *\n\
     * @private\n\
     * @param {*} [func=identity] The value to convert to a callback.\n\
     * @param {*} [thisArg] The `this` binding of the created callback.\n\
     * @param {number} [argCount] The number of arguments the callback accepts.\n\
     * @returns {Function} Returns a callback function.\n\
     */\n\
    function baseCreateCallback(func, thisArg, argCount) {\n\
      if (typeof func != 'function') {\n\
        return identity;\n\
      }\n\
      // exit early for no `thisArg` or already bound by `Function#bind`\n\
      if (typeof thisArg == 'undefined' || !('prototype' in func)) {\n\
        return func;\n\
      }\n\
      var bindData = func.__bindData__;\n\
      if (typeof bindData == 'undefined') {\n\
        if (support.funcNames) {\n\
          bindData = !func.name;\n\
        }\n\
        bindData = bindData || !support.funcDecomp;\n\
        if (!bindData) {\n\
          var source = fnToString.call(func);\n\
          if (!support.funcNames) {\n\
            bindData = !reFuncName.test(source);\n\
          }\n\
          if (!bindData) {\n\
            // checks if `func` references the `this` keyword and stores the result\n\
            bindData = reThis.test(source);\n\
            setBindData(func, bindData);\n\
          }\n\
        }\n\
      }\n\
      // exit early if there are no `this` references or `func` is bound\n\
      if (bindData === false || (bindData !== true && bindData[1] & 1)) {\n\
        return func;\n\
      }\n\
      switch (argCount) {\n\
        case 1: return function(value) {\n\
          return func.call(thisArg, value);\n\
        };\n\
        case 2: return function(a, b) {\n\
          return func.call(thisArg, a, b);\n\
        };\n\
        case 3: return function(value, index, collection) {\n\
          return func.call(thisArg, value, index, collection);\n\
        };\n\
        case 4: return function(accumulator, value, index, collection) {\n\
          return func.call(thisArg, accumulator, value, index, collection);\n\
        };\n\
      }\n\
      return bind(func, thisArg);\n\
    }\n\
\n\
    /**\n\
     * The base implementation of `createWrapper` that creates the wrapper and\n\
     * sets its meta data.\n\
     *\n\
     * @private\n\
     * @param {Array} bindData The bind data array.\n\
     * @returns {Function} Returns the new function.\n\
     */\n\
    function baseCreateWrapper(bindData) {\n\
      var func = bindData[0],\n\
          bitmask = bindData[1],\n\
          partialArgs = bindData[2],\n\
          partialRightArgs = bindData[3],\n\
          thisArg = bindData[4],\n\
          arity = bindData[5];\n\
\n\
      var isBind = bitmask & 1,\n\
          isBindKey = bitmask & 2,\n\
          isCurry = bitmask & 4,\n\
          isCurryBound = bitmask & 8,\n\
          key = func;\n\
\n\
      function bound() {\n\
        var thisBinding = isBind ? thisArg : this;\n\
        if (partialArgs) {\n\
          var args = slice(partialArgs);\n\
          push.apply(args, arguments);\n\
        }\n\
        if (partialRightArgs || isCurry) {\n\
          args || (args = slice(arguments));\n\
          if (partialRightArgs) {\n\
            push.apply(args, partialRightArgs);\n\
          }\n\
          if (isCurry && args.length < arity) {\n\
            bitmask |= 16 & ~32;\n\
            return baseCreateWrapper([func, (isCurryBound ? bitmask : bitmask & ~3), args, null, thisArg, arity]);\n\
          }\n\
        }\n\
        args || (args = arguments);\n\
        if (isBindKey) {\n\
          func = thisBinding[key];\n\
        }\n\
        if (this instanceof bound) {\n\
          thisBinding = baseCreate(func.prototype);\n\
          var result = func.apply(thisBinding, args);\n\
          return isObject(result) ? result : thisBinding;\n\
        }\n\
        return func.apply(thisBinding, args);\n\
      }\n\
      setBindData(bound, bindData);\n\
      return bound;\n\
    }\n\
\n\
    /**\n\
     * The base implementation of `_.difference` that accepts a single array\n\
     * of values to exclude.\n\
     *\n\
     * @private\n\
     * @param {Array} array The array to process.\n\
     * @param {Array} [values] The array of values to exclude.\n\
     * @returns {Array} Returns a new array of filtered values.\n\
     */\n\
    function baseDifference(array, values) {\n\
      var index = -1,\n\
          indexOf = getIndexOf(),\n\
          length = array ? array.length : 0,\n\
          isLarge = length >= largeArraySize && indexOf === baseIndexOf,\n\
          result = [];\n\
\n\
      if (isLarge) {\n\
        var cache = createCache(values);\n\
        if (cache) {\n\
          indexOf = cacheIndexOf;\n\
          values = cache;\n\
        } else {\n\
          isLarge = false;\n\
        }\n\
      }\n\
      while (++index < length) {\n\
        var value = array[index];\n\
        if (indexOf(values, value) < 0) {\n\
          result.push(value);\n\
        }\n\
      }\n\
      if (isLarge) {\n\
        releaseObject(values);\n\
      }\n\
      return result;\n\
    }\n\
\n\
    /**\n\
     * The base implementation of `_.flatten` without support for callback\n\
     * shorthands or `thisArg` binding.\n\
     *\n\
     * @private\n\
     * @param {Array} array The array to flatten.\n\
     * @param {boolean} [isShallow=false] A flag to restrict flattening to a single level.\n\
     * @param {boolean} [isStrict=false] A flag to restrict flattening to arrays and `arguments` objects.\n\
     * @param {number} [fromIndex=0] The index to start from.\n\
     * @returns {Array} Returns a new flattened array.\n\
     */\n\
    function baseFlatten(array, isShallow, isStrict, fromIndex) {\n\
      var index = (fromIndex || 0) - 1,\n\
          length = array ? array.length : 0,\n\
          result = [];\n\
\n\
      while (++index < length) {\n\
        var value = array[index];\n\
\n\
        if (value && typeof value == 'object' && typeof value.length == 'number'\n\
            && (isArray(value) || isArguments(value))) {\n\
          // recursively flatten arrays (susceptible to call stack limits)\n\
          if (!isShallow) {\n\
            value = baseFlatten(value, isShallow, isStrict);\n\
          }\n\
          var valIndex = -1,\n\
              valLength = value.length,\n\
              resIndex = result.length;\n\
\n\
          result.length += valLength;\n\
          while (++valIndex < valLength) {\n\
            result[resIndex++] = value[valIndex];\n\
          }\n\
        } else if (!isStrict) {\n\
          result.push(value);\n\
        }\n\
      }\n\
      return result;\n\
    }\n\
\n\
    /**\n\
     * The base implementation of `_.isEqual`, without support for `thisArg` binding,\n\
     * that allows partial \"_.where\" style comparisons.\n\
     *\n\
     * @private\n\
     * @param {*} a The value to compare.\n\
     * @param {*} b The other value to compare.\n\
     * @param {Function} [callback] The function to customize comparing values.\n\
     * @param {Function} [isWhere=false] A flag to indicate performing partial comparisons.\n\
     * @param {Array} [stackA=[]] Tracks traversed `a` objects.\n\
     * @param {Array} [stackB=[]] Tracks traversed `b` objects.\n\
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.\n\
     */\n\
    function baseIsEqual(a, b, callback, isWhere, stackA, stackB) {\n\
      // used to indicate that when comparing objects, `a` has at least the properties of `b`\n\
      if (callback) {\n\
        var result = callback(a, b);\n\
        if (typeof result != 'undefined') {\n\
          return !!result;\n\
        }\n\
      }\n\
      // exit early for identical values\n\
      if (a === b) {\n\
        // treat `+0` vs. `-0` as not equal\n\
        return a !== 0 || (1 / a == 1 / b);\n\
      }\n\
      var type = typeof a,\n\
          otherType = typeof b;\n\
\n\
      // exit early for unlike primitive values\n\
      if (a === a &&\n\
          !(a && objectTypes[type]) &&\n\
          !(b && objectTypes[otherType])) {\n\
        return false;\n\
      }\n\
      // exit early for `null` and `undefined` avoiding ES3's Function#call behavior\n\
      // http://es5.github.io/#x15.3.4.4\n\
      if (a == null || b == null) {\n\
        return a === b;\n\
      }\n\
      // compare [[Class]] names\n\
      var className = toString.call(a),\n\
          otherClass = toString.call(b);\n\
\n\
      if (className == argsClass) {\n\
        className = objectClass;\n\
      }\n\
      if (otherClass == argsClass) {\n\
        otherClass = objectClass;\n\
      }\n\
      if (className != otherClass) {\n\
        return false;\n\
      }\n\
      switch (className) {\n\
        case boolClass:\n\
        case dateClass:\n\
          // coerce dates and booleans to numbers, dates to milliseconds and booleans\n\
          // to `1` or `0` treating invalid dates coerced to `NaN` as not equal\n\
          return +a == +b;\n\
\n\
        case numberClass:\n\
          // treat `NaN` vs. `NaN` as equal\n\
          return (a != +a)\n\
            ? b != +b\n\
            // but treat `+0` vs. `-0` as not equal\n\
            : (a == 0 ? (1 / a == 1 / b) : a == +b);\n\
\n\
        case regexpClass:\n\
        case stringClass:\n\
          // coerce regexes to strings (http://es5.github.io/#x15.10.6.4)\n\
          // treat string primitives and their corresponding object instances as equal\n\
          return a == String(b);\n\
      }\n\
      var isArr = className == arrayClass;\n\
      if (!isArr) {\n\
        // unwrap any `lodash` wrapped values\n\
        var aWrapped = hasOwnProperty.call(a, '__wrapped__'),\n\
            bWrapped = hasOwnProperty.call(b, '__wrapped__');\n\
\n\
        if (aWrapped || bWrapped) {\n\
          return baseIsEqual(aWrapped ? a.__wrapped__ : a, bWrapped ? b.__wrapped__ : b, callback, isWhere, stackA, stackB);\n\
        }\n\
        // exit for functions and DOM nodes\n\
        if (className != objectClass || (!support.nodeClass && (isNode(a) || isNode(b)))) {\n\
          return false;\n\
        }\n\
        // in older versions of Opera, `arguments` objects have `Array` constructors\n\
        var ctorA = !support.argsObject && isArguments(a) ? Object : a.constructor,\n\
            ctorB = !support.argsObject && isArguments(b) ? Object : b.constructor;\n\
\n\
        // non `Object` object instances with different constructors are not equal\n\
        if (ctorA != ctorB &&\n\
              !(isFunction(ctorA) && ctorA instanceof ctorA && isFunction(ctorB) && ctorB instanceof ctorB) &&\n\
              ('constructor' in a && 'constructor' in b)\n\
            ) {\n\
          return false;\n\
        }\n\
      }\n\
      // assume cyclic structures are equal\n\
      // the algorithm for detecting cyclic structures is adapted from ES 5.1\n\
      // section 15.12.3, abstract operation `JO` (http://es5.github.io/#x15.12.3)\n\
      var initedStack = !stackA;\n\
      stackA || (stackA = getArray());\n\
      stackB || (stackB = getArray());\n\
\n\
      var length = stackA.length;\n\
      while (length--) {\n\
        if (stackA[length] == a) {\n\
          return stackB[length] == b;\n\
        }\n\
      }\n\
      var size = 0;\n\
      result = true;\n\
\n\
      // add `a` and `b` to the stack of traversed objects\n\
      stackA.push(a);\n\
      stackB.push(b);\n\
\n\
      // recursively compare objects and arrays (susceptible to call stack limits)\n\
      if (isArr) {\n\
        // compare lengths to determine if a deep comparison is necessary\n\
        length = a.length;\n\
        size = b.length;\n\
        result = size == length;\n\
\n\
        if (result || isWhere) {\n\
          // deep compare the contents, ignoring non-numeric properties\n\
          while (size--) {\n\
            var index = length,\n\
                value = b[size];\n\
\n\
            if (isWhere) {\n\
              while (index--) {\n\
                if ((result = baseIsEqual(a[index], value, callback, isWhere, stackA, stackB))) {\n\
                  break;\n\
                }\n\
              }\n\
            } else if (!(result = baseIsEqual(a[size], value, callback, isWhere, stackA, stackB))) {\n\
              break;\n\
            }\n\
          }\n\
        }\n\
      }\n\
      else {\n\
        // deep compare objects using `forIn`, instead of `forOwn`, to avoid `Object.keys`\n\
        // which, in this case, is more costly\n\
        forIn(b, function(value, key, b) {\n\
          if (hasOwnProperty.call(b, key)) {\n\
            // count the number of properties.\n\
            size++;\n\
            // deep compare each property value.\n\
            return (result = hasOwnProperty.call(a, key) && baseIsEqual(a[key], value, callback, isWhere, stackA, stackB));\n\
          }\n\
        });\n\
\n\
        if (result && !isWhere) {\n\
          // ensure both objects have the same number of properties\n\
          forIn(a, function(value, key, a) {\n\
            if (hasOwnProperty.call(a, key)) {\n\
              // `size` will be `-1` if `a` has more properties than `b`\n\
              return (result = --size > -1);\n\
            }\n\
          });\n\
        }\n\
      }\n\
      stackA.pop();\n\
      stackB.pop();\n\
\n\
      if (initedStack) {\n\
        releaseArray(stackA);\n\
        releaseArray(stackB);\n\
      }\n\
      return result;\n\
    }\n\
\n\
    /**\n\
     * The base implementation of `_.merge` without argument juggling or support\n\
     * for `thisArg` binding.\n\
     *\n\
     * @private\n\
     * @param {Object} object The destination object.\n\
     * @param {Object} source The source object.\n\
     * @param {Function} [callback] The function to customize merging properties.\n\
     * @param {Array} [stackA=[]] Tracks traversed source objects.\n\
     * @param {Array} [stackB=[]] Associates values with source counterparts.\n\
     */\n\
    function baseMerge(object, source, callback, stackA, stackB) {\n\
      (isArray(source) ? forEach : forOwn)(source, function(source, key) {\n\
        var found,\n\
            isArr,\n\
            result = source,\n\
            value = object[key];\n\
\n\
        if (source && ((isArr = isArray(source)) || isPlainObject(source))) {\n\
          // avoid merging previously merged cyclic sources\n\
          var stackLength = stackA.length;\n\
          while (stackLength--) {\n\
            if ((found = stackA[stackLength] == source)) {\n\
              value = stackB[stackLength];\n\
              break;\n\
            }\n\
          }\n\
          if (!found) {\n\
            var isShallow;\n\
            if (callback) {\n\
              result = callback(value, source);\n\
              if ((isShallow = typeof result != 'undefined')) {\n\
                value = result;\n\
              }\n\
            }\n\
            if (!isShallow) {\n\
              value = isArr\n\
                ? (isArray(value) ? value : [])\n\
                : (isPlainObject(value) ? value : {});\n\
            }\n\
            // add `source` and associated `value` to the stack of traversed objects\n\
            stackA.push(source);\n\
            stackB.push(value);\n\
\n\
            // recursively merge objects and arrays (susceptible to call stack limits)\n\
            if (!isShallow) {\n\
              baseMerge(value, source, callback, stackA, stackB);\n\
            }\n\
          }\n\
        }\n\
        else {\n\
          if (callback) {\n\
            result = callback(value, source);\n\
            if (typeof result == 'undefined') {\n\
              result = source;\n\
            }\n\
          }\n\
          if (typeof result != 'undefined') {\n\
            value = result;\n\
          }\n\
        }\n\
        object[key] = value;\n\
      });\n\
    }\n\
\n\
    /**\n\
     * The base implementation of `_.random` without argument juggling or support\n\
     * for returning floating-point numbers.\n\
     *\n\
     * @private\n\
     * @param {number} min The minimum possible value.\n\
     * @param {number} max The maximum possible value.\n\
     * @returns {number} Returns a random number.\n\
     */\n\
    function baseRandom(min, max) {\n\
      return min + floor(nativeRandom() * (max - min + 1));\n\
    }\n\
\n\
    /**\n\
     * The base implementation of `_.uniq` without support for callback shorthands\n\
     * or `thisArg` binding.\n\
     *\n\
     * @private\n\
     * @param {Array} array The array to process.\n\
     * @param {boolean} [isSorted=false] A flag to indicate that `array` is sorted.\n\
     * @param {Function} [callback] The function called per iteration.\n\
     * @returns {Array} Returns a duplicate-value-free array.\n\
     */\n\
    function baseUniq(array, isSorted, callback) {\n\
      var index = -1,\n\
          indexOf = getIndexOf(),\n\
          length = array ? array.length : 0,\n\
          result = [];\n\
\n\
      var isLarge = !isSorted && length >= largeArraySize && indexOf === baseIndexOf,\n\
          seen = (callback || isLarge) ? getArray() : result;\n\
\n\
      if (isLarge) {\n\
        var cache = createCache(seen);\n\
        indexOf = cacheIndexOf;\n\
        seen = cache;\n\
      }\n\
      while (++index < length) {\n\
        var value = array[index],\n\
            computed = callback ? callback(value, index, array) : value;\n\
\n\
        if (isSorted\n\
              ? !index || seen[seen.length - 1] !== computed\n\
              : indexOf(seen, computed) < 0\n\
            ) {\n\
          if (callback || isLarge) {\n\
            seen.push(computed);\n\
          }\n\
          result.push(value);\n\
        }\n\
      }\n\
      if (isLarge) {\n\
        releaseArray(seen.array);\n\
        releaseObject(seen);\n\
      } else if (callback) {\n\
        releaseArray(seen);\n\
      }\n\
      return result;\n\
    }\n\
\n\
    /**\n\
     * Creates a function that aggregates a collection, creating an object composed\n\
     * of keys generated from the results of running each element of the collection\n\
     * through a callback. The given `setter` function sets the keys and values\n\
     * of the composed object.\n\
     *\n\
     * @private\n\
     * @param {Function} setter The setter function.\n\
     * @returns {Function} Returns the new aggregator function.\n\
     */\n\
    function createAggregator(setter) {\n\
      return function(collection, callback, thisArg) {\n\
        var result = {};\n\
        callback = lodash.createCallback(callback, thisArg, 3);\n\
\n\
        if (isArray(collection)) {\n\
          var index = -1,\n\
              length = collection.length;\n\
\n\
          while (++index < length) {\n\
            var value = collection[index];\n\
            setter(result, value, callback(value, index, collection), collection);\n\
          }\n\
        } else {\n\
          baseEach(collection, function(value, key, collection) {\n\
            setter(result, value, callback(value, key, collection), collection);\n\
          });\n\
        }\n\
        return result;\n\
      };\n\
    }\n\
\n\
    /**\n\
     * Creates a function that, when called, either curries or invokes `func`\n\
     * with an optional `this` binding and partially applied arguments.\n\
     *\n\
     * @private\n\
     * @param {Function|string} func The function or method name to reference.\n\
     * @param {number} bitmask The bitmask of method flags to compose.\n\
     *  The bitmask may be composed of the following flags:\n\
     *  1 - `_.bind`\n\
     *  2 - `_.bindKey`\n\
     *  4 - `_.curry`\n\
     *  8 - `_.curry` (bound)\n\
     *  16 - `_.partial`\n\
     *  32 - `_.partialRight`\n\
     * @param {Array} [partialArgs] An array of arguments to prepend to those\n\
     *  provided to the new function.\n\
     * @param {Array} [partialRightArgs] An array of arguments to append to those\n\
     *  provided to the new function.\n\
     * @param {*} [thisArg] The `this` binding of `func`.\n\
     * @param {number} [arity] The arity of `func`.\n\
     * @returns {Function} Returns the new function.\n\
     */\n\
    function createWrapper(func, bitmask, partialArgs, partialRightArgs, thisArg, arity) {\n\
      var isBind = bitmask & 1,\n\
          isBindKey = bitmask & 2,\n\
          isCurry = bitmask & 4,\n\
          isCurryBound = bitmask & 8,\n\
          isPartial = bitmask & 16,\n\
          isPartialRight = bitmask & 32;\n\
\n\
      if (!isBindKey && !isFunction(func)) {\n\
        throw new TypeError;\n\
      }\n\
      if (isPartial && !partialArgs.length) {\n\
        bitmask &= ~16;\n\
        isPartial = partialArgs = false;\n\
      }\n\
      if (isPartialRight && !partialRightArgs.length) {\n\
        bitmask &= ~32;\n\
        isPartialRight = partialRightArgs = false;\n\
      }\n\
      var bindData = func && func.__bindData__;\n\
      if (bindData && bindData !== true) {\n\
        // clone `bindData`\n\
        bindData = slice(bindData);\n\
        if (bindData[2]) {\n\
          bindData[2] = slice(bindData[2]);\n\
        }\n\
        if (bindData[3]) {\n\
          bindData[3] = slice(bindData[3]);\n\
        }\n\
        // set `thisBinding` is not previously bound\n\
        if (isBind && !(bindData[1] & 1)) {\n\
          bindData[4] = thisArg;\n\
        }\n\
        // set if previously bound but not currently (subsequent curried functions)\n\
        if (!isBind && bindData[1] & 1) {\n\
          bitmask |= 8;\n\
        }\n\
        // set curried arity if not yet set\n\
        if (isCurry && !(bindData[1] & 4)) {\n\
          bindData[5] = arity;\n\
        }\n\
        // append partial left arguments\n\
        if (isPartial) {\n\
          push.apply(bindData[2] || (bindData[2] = []), partialArgs);\n\
        }\n\
        // append partial right arguments\n\
        if (isPartialRight) {\n\
          unshift.apply(bindData[3] || (bindData[3] = []), partialRightArgs);\n\
        }\n\
        // merge flags\n\
        bindData[1] |= bitmask;\n\
        return createWrapper.apply(null, bindData);\n\
      }\n\
      // fast path for `_.bind`\n\
      var creater = (bitmask == 1 || bitmask === 17) ? baseBind : baseCreateWrapper;\n\
      return creater([func, bitmask, partialArgs, partialRightArgs, thisArg, arity]);\n\
    }\n\
\n\
    /**\n\
     * Creates compiled iteration functions.\n\
     *\n\
     * @private\n\
     * @param {...Object} [options] The compile options object(s).\n\
     * @param {string} [options.array] Code to determine if the iterable is an array or array-like.\n\
     * @param {boolean} [options.useHas] Specify using `hasOwnProperty` checks in the object loop.\n\
     * @param {Function} [options.keys] A reference to `_.keys` for use in own property iteration.\n\
     * @param {string} [options.args] A comma separated string of iteration function arguments.\n\
     * @param {string} [options.top] Code to execute before the iteration branches.\n\
     * @param {string} [options.loop] Code to execute in the object loop.\n\
     * @param {string} [options.bottom] Code to execute after the iteration branches.\n\
     * @returns {Function} Returns the compiled function.\n\
     */\n\
    function createIterator() {\n\
      // data properties\n\
      iteratorData.shadowedProps = shadowedProps;\n\
\n\
      // iterator options\n\
      iteratorData.array = iteratorData.bottom = iteratorData.loop = iteratorData.top = '';\n\
      iteratorData.init = 'iterable';\n\
      iteratorData.useHas = true;\n\
\n\
      // merge options into a template data object\n\
      for (var object, index = 0; object = arguments[index]; index++) {\n\
        for (var key in object) {\n\
          iteratorData[key] = object[key];\n\
        }\n\
      }\n\
      var args = iteratorData.args;\n\
      iteratorData.firstArg = /^[^,]+/.exec(args)[0];\n\
\n\
      // create the function factory\n\
      var factory = Function(\n\
          'baseCreateCallback, errorClass, errorProto, hasOwnProperty, ' +\n\
          'indicatorObject, isArguments, isArray, isString, keys, objectProto, ' +\n\
          'objectTypes, nonEnumProps, stringClass, stringProto, toString',\n\
        'return function(' + args + ') {\\n\
' + iteratorTemplate(iteratorData) + '\\n\
}'\n\
      );\n\
\n\
      // return the compiled function\n\
      return factory(\n\
        baseCreateCallback, errorClass, errorProto, hasOwnProperty,\n\
        indicatorObject, isArguments, isArray, isString, iteratorData.keys, objectProto,\n\
        objectTypes, nonEnumProps, stringClass, stringProto, toString\n\
      );\n\
    }\n\
\n\
    /**\n\
     * Used by `escape` to convert characters to HTML entities.\n\
     *\n\
     * @private\n\
     * @param {string} match The matched character to escape.\n\
     * @returns {string} Returns the escaped character.\n\
     */\n\
    function escapeHtmlChar(match) {\n\
      return htmlEscapes[match];\n\
    }\n\
\n\
    /**\n\
     * Gets the appropriate \"indexOf\" function. If the `_.indexOf` method is\n\
     * customized this method returns the custom method, otherwise it returns\n\
     * the `baseIndexOf` function.\n\
     *\n\
     * @private\n\
     * @returns {Function} Returns the \"indexOf\" function.\n\
     */\n\
    function getIndexOf() {\n\
      var result = (result = lodash.indexOf) === indexOf ? baseIndexOf : result;\n\
      return result;\n\
    }\n\
\n\
    /**\n\
     * Checks if `value` is a native function.\n\
     *\n\
     * @private\n\
     * @param {*} value The value to check.\n\
     * @returns {boolean} Returns `true` if the `value` is a native function, else `false`.\n\
     */\n\
    function isNative(value) {\n\
      return typeof value == 'function' && reNative.test(value);\n\
    }\n\
\n\
    /**\n\
     * Sets `this` binding data on a given function.\n\
     *\n\
     * @private\n\
     * @param {Function} func The function to set data on.\n\
     * @param {Array} value The data array to set.\n\
     */\n\
    var setBindData = !defineProperty ? noop : function(func, value) {\n\
      descriptor.value = value;\n\
      defineProperty(func, '__bindData__', descriptor);\n\
    };\n\
\n\
    /**\n\
     * A fallback implementation of `isPlainObject` which checks if a given value\n\
     * is an object created by the `Object` constructor, assuming objects created\n\
     * by the `Object` constructor have no inherited enumerable properties and that\n\
     * there are no `Object.prototype` extensions.\n\
     *\n\
     * @private\n\
     * @param {*} value The value to check.\n\
     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.\n\
     */\n\
    function shimIsPlainObject(value) {\n\
      var ctor,\n\
          result;\n\
\n\
      // avoid non Object objects, `arguments` objects, and DOM elements\n\
      if (!(value && toString.call(value) == objectClass) ||\n\
          (ctor = value.constructor, isFunction(ctor) && !(ctor instanceof ctor)) ||\n\
          (!support.argsClass && isArguments(value)) ||\n\
          (!support.nodeClass && isNode(value))) {\n\
        return false;\n\
      }\n\
      // IE < 9 iterates inherited properties before own properties. If the first\n\
      // iterated property is an object's own property then there are no inherited\n\
      // enumerable properties.\n\
      if (support.ownLast) {\n\
        forIn(value, function(value, key, object) {\n\
          result = hasOwnProperty.call(object, key);\n\
          return false;\n\
        });\n\
        return result !== false;\n\
      }\n\
      // In most environments an object's own properties are iterated before\n\
      // its inherited properties. If the last iterated property is an object's\n\
      // own property then there are no inherited enumerable properties.\n\
      forIn(value, function(value, key) {\n\
        result = key;\n\
      });\n\
      return typeof result == 'undefined' || hasOwnProperty.call(value, result);\n\
    }\n\
\n\
    /**\n\
     * Used by `unescape` to convert HTML entities to characters.\n\
     *\n\
     * @private\n\
     * @param {string} match The matched character to unescape.\n\
     * @returns {string} Returns the unescaped character.\n\
     */\n\
    function unescapeHtmlChar(match) {\n\
      return htmlUnescapes[match];\n\
    }\n\
\n\
    /*--------------------------------------------------------------------------*/\n\
\n\
    /**\n\
     * Checks if `value` is an `arguments` object.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Objects\n\
     * @param {*} value The value to check.\n\
     * @returns {boolean} Returns `true` if the `value` is an `arguments` object, else `false`.\n\
     * @example\n\
     *\n\
     * (function() { return _.isArguments(arguments); })(1, 2, 3);\n\
     * // => true\n\
     *\n\
     * _.isArguments([1, 2, 3]);\n\
     * // => false\n\
     */\n\
    function isArguments(value) {\n\
      return value && typeof value == 'object' && typeof value.length == 'number' &&\n\
        toString.call(value) == argsClass || false;\n\
    }\n\
    // fallback for browsers that can't detect `arguments` objects by [[Class]]\n\
    if (!support.argsClass) {\n\
      isArguments = function(value) {\n\
        return value && typeof value == 'object' && typeof value.length == 'number' &&\n\
          hasOwnProperty.call(value, 'callee') && !propertyIsEnumerable.call(value, 'callee') || false;\n\
      };\n\
    }\n\
\n\
    /**\n\
     * Checks if `value` is an array.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @type Function\n\
     * @category Objects\n\
     * @param {*} value The value to check.\n\
     * @returns {boolean} Returns `true` if the `value` is an array, else `false`.\n\
     * @example\n\
     *\n\
     * (function() { return _.isArray(arguments); })();\n\
     * // => false\n\
     *\n\
     * _.isArray([1, 2, 3]);\n\
     * // => true\n\
     */\n\
    var isArray = nativeIsArray || function(value) {\n\
      return value && typeof value == 'object' && typeof value.length == 'number' &&\n\
        toString.call(value) == arrayClass || false;\n\
    };\n\
\n\
    /**\n\
     * A fallback implementation of `Object.keys` which produces an array of the\n\
     * given object's own enumerable property names.\n\
     *\n\
     * @private\n\
     * @type Function\n\
     * @param {Object} object The object to inspect.\n\
     * @returns {Array} Returns an array of property names.\n\
     */\n\
    var shimKeys = createIterator({\n\
      'args': 'object',\n\
      'init': '[]',\n\
      'top': 'if (!(objectTypes[typeof object])) return result',\n\
      'loop': 'result.push(index)'\n\
    });\n\
\n\
    /**\n\
     * Creates an array composed of the own enumerable property names of an object.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Objects\n\
     * @param {Object} object The object to inspect.\n\
     * @returns {Array} Returns an array of property names.\n\
     * @example\n\
     *\n\
     * _.keys({ 'one': 1, 'two': 2, 'three': 3 });\n\
     * // => ['one', 'two', 'three'] (property order is not guaranteed across environments)\n\
     */\n\
    var keys = !nativeKeys ? shimKeys : function(object) {\n\
      if (!isObject(object)) {\n\
        return [];\n\
      }\n\
      if ((support.enumPrototypes && typeof object == 'function') ||\n\
          (support.nonEnumArgs && object.length && isArguments(object))) {\n\
        return shimKeys(object);\n\
      }\n\
      return nativeKeys(object);\n\
    };\n\
\n\
    /** Reusable iterator options shared by `each`, `forIn`, and `forOwn` */\n\
    var eachIteratorOptions = {\n\
      'args': 'collection, callback, thisArg',\n\
      'top': \"callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3)\",\n\
      'array': \"typeof length == 'number'\",\n\
      'keys': keys,\n\
      'loop': 'if (callback(iterable[index], index, collection) === false) return result'\n\
    };\n\
\n\
    /** Reusable iterator options for `assign` and `defaults` */\n\
    var defaultsIteratorOptions = {\n\
      'args': 'object, source, guard',\n\
      'top':\n\
        'var args = arguments,\\n\
' +\n\
        '    argsIndex = 0,\\n\
' +\n\
        \"    argsLength = typeof guard == 'number' ? 2 : args.length;\\n\
\" +\n\
        'while (++argsIndex < argsLength) {\\n\
' +\n\
        '  iterable = args[argsIndex];\\n\
' +\n\
        '  if (iterable && objectTypes[typeof iterable]) {',\n\
      'keys': keys,\n\
      'loop': \"if (typeof result[index] == 'undefined') result[index] = iterable[index]\",\n\
      'bottom': '  }\\n\
}'\n\
    };\n\
\n\
    /** Reusable iterator options for `forIn` and `forOwn` */\n\
    var forOwnIteratorOptions = {\n\
      'top': 'if (!objectTypes[typeof iterable]) return result;\\n\
' + eachIteratorOptions.top,\n\
      'array': false\n\
    };\n\
\n\
    /**\n\
     * Used to convert characters to HTML entities:\n\
     *\n\
     * Though the `>` character is escaped for symmetry, characters like `>` and `/`\n\
     * don't require escaping in HTML and have no special meaning unless they're part\n\
     * of a tag or an unquoted attribute value.\n\
     * http://mathiasbynens.be/notes/ambiguous-ampersands (under \"semi-related fun fact\")\n\
     */\n\
    var htmlEscapes = {\n\
      '&': '&amp;',\n\
      '<': '&lt;',\n\
      '>': '&gt;',\n\
      '\"': '&quot;',\n\
      \"'\": '&#39;'\n\
    };\n\
\n\
    /** Used to convert HTML entities to characters */\n\
    var htmlUnescapes = invert(htmlEscapes);\n\
\n\
    /** Used to match HTML entities and HTML characters */\n\
    var reEscapedHtml = RegExp('(' + keys(htmlUnescapes).join('|') + ')', 'g'),\n\
        reUnescapedHtml = RegExp('[' + keys(htmlEscapes).join('') + ']', 'g');\n\
\n\
    /**\n\
     * A function compiled to iterate `arguments` objects, arrays, objects, and\n\
     * strings consistenly across environments, executing the callback for each\n\
     * element in the collection. The callback is bound to `thisArg` and invoked\n\
     * with three arguments; (value, index|key, collection). Callbacks may exit\n\
     * iteration early by explicitly returning `false`.\n\
     *\n\
     * @private\n\
     * @type Function\n\
     * @param {Array|Object|string} collection The collection to iterate over.\n\
     * @param {Function} [callback=identity] The function called per iteration.\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\n\
     * @returns {Array|Object|string} Returns `collection`.\n\
     */\n\
    var baseEach = createIterator(eachIteratorOptions);\n\
\n\
    /*--------------------------------------------------------------------------*/\n\
\n\
    /**\n\
     * Assigns own enumerable properties of source object(s) to the destination\n\
     * object. Subsequent sources will overwrite property assignments of previous\n\
     * sources. If a callback is provided it will be executed to produce the\n\
     * assigned values. The callback is bound to `thisArg` and invoked with two\n\
     * arguments; (objectValue, sourceValue).\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @type Function\n\
     * @alias extend\n\
     * @category Objects\n\
     * @param {Object} object The destination object.\n\
     * @param {...Object} [source] The source objects.\n\
     * @param {Function} [callback] The function to customize assigning values.\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\n\
     * @returns {Object} Returns the destination object.\n\
     * @example\n\
     *\n\
     * _.assign({ 'name': 'fred' }, { 'employer': 'slate' });\n\
     * // => { 'name': 'fred', 'employer': 'slate' }\n\
     *\n\
     * var defaults = _.partialRight(_.assign, function(a, b) {\n\
     *   return typeof a == 'undefined' ? b : a;\n\
     * });\n\
     *\n\
     * var object = { 'name': 'barney' };\n\
     * defaults(object, { 'name': 'fred', 'employer': 'slate' });\n\
     * // => { 'name': 'barney', 'employer': 'slate' }\n\
     */\n\
    var assign = createIterator(defaultsIteratorOptions, {\n\
      'top':\n\
        defaultsIteratorOptions.top.replace(';',\n\
          ';\\n\
' +\n\
          \"if (argsLength > 3 && typeof args[argsLength - 2] == 'function') {\\n\
\" +\n\
          '  var callback = baseCreateCallback(args[--argsLength - 1], args[argsLength--], 2);\\n\
' +\n\
          \"} else if (argsLength > 2 && typeof args[argsLength - 1] == 'function') {\\n\
\" +\n\
          '  callback = args[--argsLength];\\n\
' +\n\
          '}'\n\
        ),\n\
      'loop': 'result[index] = callback ? callback(result[index], iterable[index]) : iterable[index]'\n\
    });\n\
\n\
    /**\n\
     * Creates a clone of `value`. If `isDeep` is `true` nested objects will also\n\
     * be cloned, otherwise they will be assigned by reference. If a callback\n\
     * is provided it will be executed to produce the cloned values. If the\n\
     * callback returns `undefined` cloning will be handled by the method instead.\n\
     * The callback is bound to `thisArg` and invoked with one argument; (value).\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Objects\n\
     * @param {*} value The value to clone.\n\
     * @param {boolean} [isDeep=false] Specify a deep clone.\n\
     * @param {Function} [callback] The function to customize cloning values.\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\n\
     * @returns {*} Returns the cloned value.\n\
     * @example\n\
     *\n\
     * var characters = [\n\
     *   { 'name': 'barney', 'age': 36 },\n\
     *   { 'name': 'fred',   'age': 40 }\n\
     * ];\n\
     *\n\
     * var shallow = _.clone(characters);\n\
     * shallow[0] === characters[0];\n\
     * // => true\n\
     *\n\
     * var deep = _.clone(characters, true);\n\
     * deep[0] === characters[0];\n\
     * // => false\n\
     *\n\
     * _.mixin({\n\
     *   'clone': _.partialRight(_.clone, function(value) {\n\
     *     return _.isElement(value) ? value.cloneNode(false) : undefined;\n\
     *   })\n\
     * });\n\
     *\n\
     * var clone = _.clone(document.body);\n\
     * clone.childNodes.length;\n\
     * // => 0\n\
     */\n\
    function clone(value, isDeep, callback, thisArg) {\n\
      // allows working with \"Collections\" methods without using their `index`\n\
      // and `collection` arguments for `isDeep` and `callback`\n\
      if (typeof isDeep != 'boolean' && isDeep != null) {\n\
        thisArg = callback;\n\
        callback = isDeep;\n\
        isDeep = false;\n\
      }\n\
      return baseClone(value, isDeep, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 1));\n\
    }\n\
\n\
    /**\n\
     * Creates a deep clone of `value`. If a callback is provided it will be\n\
     * executed to produce the cloned values. If the callback returns `undefined`\n\
     * cloning will be handled by the method instead. The callback is bound to\n\
     * `thisArg` and invoked with one argument; (value).\n\
     *\n\
     * Note: This method is loosely based on the structured clone algorithm. Functions\n\
     * and DOM nodes are **not** cloned. The enumerable properties of `arguments` objects and\n\
     * objects created by constructors other than `Object` are cloned to plain `Object` objects.\n\
     * See http://www.w3.org/TR/html5/infrastructure.html#internal-structured-cloning-algorithm.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Objects\n\
     * @param {*} value The value to deep clone.\n\
     * @param {Function} [callback] The function to customize cloning values.\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\n\
     * @returns {*} Returns the deep cloned value.\n\
     * @example\n\
     *\n\
     * var characters = [\n\
     *   { 'name': 'barney', 'age': 36 },\n\
     *   { 'name': 'fred',   'age': 40 }\n\
     * ];\n\
     *\n\
     * var deep = _.cloneDeep(characters);\n\
     * deep[0] === characters[0];\n\
     * // => false\n\
     *\n\
     * var view = {\n\
     *   'label': 'docs',\n\
     *   'node': element\n\
     * };\n\
     *\n\
     * var clone = _.cloneDeep(view, function(value) {\n\
     *   return _.isElement(value) ? value.cloneNode(true) : undefined;\n\
     * });\n\
     *\n\
     * clone.node == view.node;\n\
     * // => false\n\
     */\n\
    function cloneDeep(value, callback, thisArg) {\n\
      return baseClone(value, true, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 1));\n\
    }\n\
\n\
    /**\n\
     * Creates an object that inherits from the given `prototype` object. If a\n\
     * `properties` object is provided its own enumerable properties are assigned\n\
     * to the created object.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Objects\n\
     * @param {Object} prototype The object to inherit from.\n\
     * @param {Object} [properties] The properties to assign to the object.\n\
     * @returns {Object} Returns the new object.\n\
     * @example\n\
     *\n\
     * function Shape() {\n\
     *   this.x = 0;\n\
     *   this.y = 0;\n\
     * }\n\
     *\n\
     * function Circle() {\n\
     *   Shape.call(this);\n\
     * }\n\
     *\n\
     * Circle.prototype = _.create(Shape.prototype, { 'constructor': Circle });\n\
     *\n\
     * var circle = new Circle;\n\
     * circle instanceof Circle;\n\
     * // => true\n\
     *\n\
     * circle instanceof Shape;\n\
     * // => true\n\
     */\n\
    function create(prototype, properties) {\n\
      var result = baseCreate(prototype);\n\
      return properties ? assign(result, properties) : result;\n\
    }\n\
\n\
    /**\n\
     * Assigns own enumerable properties of source object(s) to the destination\n\
     * object for all destination properties that resolve to `undefined`. Once a\n\
     * property is set, additional defaults of the same property will be ignored.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @type Function\n\
     * @category Objects\n\
     * @param {Object} object The destination object.\n\
     * @param {...Object} [source] The source objects.\n\
     * @param- {Object} [guard] Allows working with `_.reduce` without using its\n\
     *  `key` and `object` arguments as sources.\n\
     * @returns {Object} Returns the destination object.\n\
     * @example\n\
     *\n\
     * var object = { 'name': 'barney' };\n\
     * _.defaults(object, { 'name': 'fred', 'employer': 'slate' });\n\
     * // => { 'name': 'barney', 'employer': 'slate' }\n\
     */\n\
    var defaults = createIterator(defaultsIteratorOptions);\n\
\n\
    /**\n\
     * This method is like `_.findIndex` except that it returns the key of the\n\
     * first element that passes the callback check, instead of the element itself.\n\
     *\n\
     * If a property name is provided for `callback` the created \"_.pluck\" style\n\
     * callback will return the property value of the given element.\n\
     *\n\
     * If an object is provided for `callback` the created \"_.where\" style callback\n\
     * will return `true` for elements that have the properties of the given object,\n\
     * else `false`.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Objects\n\
     * @param {Object} object The object to search.\n\
     * @param {Function|Object|string} [callback=identity] The function called per\n\
     *  iteration. If a property name or object is provided it will be used to\n\
     *  create a \"_.pluck\" or \"_.where\" style callback, respectively.\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\n\
     * @returns {string|undefined} Returns the key of the found element, else `undefined`.\n\
     * @example\n\
     *\n\
     * var characters = {\n\
     *   'barney': {  'age': 36, 'blocked': false },\n\
     *   'fred': {    'age': 40, 'blocked': true },\n\
     *   'pebbles': { 'age': 1,  'blocked': false }\n\
     * };\n\
     *\n\
     * _.findKey(characters, function(chr) {\n\
     *   return chr.age < 40;\n\
     * });\n\
     * // => 'barney' (property order is not guaranteed across environments)\n\
     *\n\
     * // using \"_.where\" callback shorthand\n\
     * _.findKey(characters, { 'age': 1 });\n\
     * // => 'pebbles'\n\
     *\n\
     * // using \"_.pluck\" callback shorthand\n\
     * _.findKey(characters, 'blocked');\n\
     * // => 'fred'\n\
     */\n\
    function findKey(object, callback, thisArg) {\n\
      var result;\n\
      callback = lodash.createCallback(callback, thisArg, 3);\n\
      forOwn(object, function(value, key, object) {\n\
        if (callback(value, key, object)) {\n\
          result = key;\n\
          return false;\n\
        }\n\
      });\n\
      return result;\n\
    }\n\
\n\
    /**\n\
     * This method is like `_.findKey` except that it iterates over elements\n\
     * of a `collection` in the opposite order.\n\
     *\n\
     * If a property name is provided for `callback` the created \"_.pluck\" style\n\
     * callback will return the property value of the given element.\n\
     *\n\
     * If an object is provided for `callback` the created \"_.where\" style callback\n\
     * will return `true` for elements that have the properties of the given object,\n\
     * else `false`.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Objects\n\
     * @param {Object} object The object to search.\n\
     * @param {Function|Object|string} [callback=identity] The function called per\n\
     *  iteration. If a property name or object is provided it will be used to\n\
     *  create a \"_.pluck\" or \"_.where\" style callback, respectively.\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\n\
     * @returns {string|undefined} Returns the key of the found element, else `undefined`.\n\
     * @example\n\
     *\n\
     * var characters = {\n\
     *   'barney': {  'age': 36, 'blocked': true },\n\
     *   'fred': {    'age': 40, 'blocked': false },\n\
     *   'pebbles': { 'age': 1,  'blocked': true }\n\
     * };\n\
     *\n\
     * _.findLastKey(characters, function(chr) {\n\
     *   return chr.age < 40;\n\
     * });\n\
     * // => returns `pebbles`, assuming `_.findKey` returns `barney`\n\
     *\n\
     * // using \"_.where\" callback shorthand\n\
     * _.findLastKey(characters, { 'age': 40 });\n\
     * // => 'fred'\n\
     *\n\
     * // using \"_.pluck\" callback shorthand\n\
     * _.findLastKey(characters, 'blocked');\n\
     * // => 'pebbles'\n\
     */\n\
    function findLastKey(object, callback, thisArg) {\n\
      var result;\n\
      callback = lodash.createCallback(callback, thisArg, 3);\n\
      forOwnRight(object, function(value, key, object) {\n\
        if (callback(value, key, object)) {\n\
          result = key;\n\
          return false;\n\
        }\n\
      });\n\
      return result;\n\
    }\n\
\n\
    /**\n\
     * Iterates over own and inherited enumerable properties of an object,\n\
     * executing the callback for each property. The callback is bound to `thisArg`\n\
     * and invoked with three arguments; (value, key, object). Callbacks may exit\n\
     * iteration early by explicitly returning `false`.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @type Function\n\
     * @category Objects\n\
     * @param {Object} object The object to iterate over.\n\
     * @param {Function} [callback=identity] The function called per iteration.\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\n\
     * @returns {Object} Returns `object`.\n\
     * @example\n\
     *\n\
     * function Shape() {\n\
     *   this.x = 0;\n\
     *   this.y = 0;\n\
     * }\n\
     *\n\
     * Shape.prototype.move = function(x, y) {\n\
     *   this.x += x;\n\
     *   this.y += y;\n\
     * };\n\
     *\n\
     * _.forIn(new Shape, function(value, key) {\n\
     *   console.log(key);\n\
     * });\n\
     * // => logs 'x', 'y', and 'move' (property order is not guaranteed across environments)\n\
     */\n\
    var forIn = createIterator(eachIteratorOptions, forOwnIteratorOptions, {\n\
      'useHas': false\n\
    });\n\
\n\
    /**\n\
     * This method is like `_.forIn` except that it iterates over elements\n\
     * of a `collection` in the opposite order.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Objects\n\
     * @param {Object} object The object to iterate over.\n\
     * @param {Function} [callback=identity] The function called per iteration.\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\n\
     * @returns {Object} Returns `object`.\n\
     * @example\n\
     *\n\
     * function Shape() {\n\
     *   this.x = 0;\n\
     *   this.y = 0;\n\
     * }\n\
     *\n\
     * Shape.prototype.move = function(x, y) {\n\
     *   this.x += x;\n\
     *   this.y += y;\n\
     * };\n\
     *\n\
     * _.forInRight(new Shape, function(value, key) {\n\
     *   console.log(key);\n\
     * });\n\
     * // => logs 'move', 'y', and 'x' assuming `_.forIn ` logs 'x', 'y', and 'move'\n\
     */\n\
    function forInRight(object, callback, thisArg) {\n\
      var pairs = [];\n\
\n\
      forIn(object, function(value, key) {\n\
        pairs.push(key, value);\n\
      });\n\
\n\
      var length = pairs.length;\n\
      callback = baseCreateCallback(callback, thisArg, 3);\n\
      while (length--) {\n\
        if (callback(pairs[length--], pairs[length], object) === false) {\n\
          break;\n\
        }\n\
      }\n\
      return object;\n\
    }\n\
\n\
    /**\n\
     * Iterates over own enumerable properties of an object, executing the callback\n\
     * for each property. The callback is bound to `thisArg` and invoked with three\n\
     * arguments; (value, key, object). Callbacks may exit iteration early by\n\
     * explicitly returning `false`.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @type Function\n\
     * @category Objects\n\
     * @param {Object} object The object to iterate over.\n\
     * @param {Function} [callback=identity] The function called per iteration.\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\n\
     * @returns {Object} Returns `object`.\n\
     * @example\n\
     *\n\
     * _.forOwn({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {\n\
     *   console.log(key);\n\
     * });\n\
     * // => logs '0', '1', and 'length' (property order is not guaranteed across environments)\n\
     */\n\
    var forOwn = createIterator(eachIteratorOptions, forOwnIteratorOptions);\n\
\n\
    /**\n\
     * This method is like `_.forOwn` except that it iterates over elements\n\
     * of a `collection` in the opposite order.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Objects\n\
     * @param {Object} object The object to iterate over.\n\
     * @param {Function} [callback=identity] The function called per iteration.\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\n\
     * @returns {Object} Returns `object`.\n\
     * @example\n\
     *\n\
     * _.forOwnRight({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {\n\
     *   console.log(key);\n\
     * });\n\
     * // => logs 'length', '1', and '0' assuming `_.forOwn` logs '0', '1', and 'length'\n\
     */\n\
    function forOwnRight(object, callback, thisArg) {\n\
      var props = keys(object),\n\
          length = props.length;\n\
\n\
      callback = baseCreateCallback(callback, thisArg, 3);\n\
      while (length--) {\n\
        var key = props[length];\n\
        if (callback(object[key], key, object) === false) {\n\
          break;\n\
        }\n\
      }\n\
      return object;\n\
    }\n\
\n\
    /**\n\
     * Creates a sorted array of property names of all enumerable properties,\n\
     * own and inherited, of `object` that have function values.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @alias methods\n\
     * @category Objects\n\
     * @param {Object} object The object to inspect.\n\
     * @returns {Array} Returns an array of property names that have function values.\n\
     * @example\n\
     *\n\
     * _.functions(_);\n\
     * // => ['all', 'any', 'bind', 'bindAll', 'clone', 'compact', 'compose', ...]\n\
     */\n\
    function functions(object) {\n\
      var result = [];\n\
      forIn(object, function(value, key) {\n\
        if (isFunction(value)) {\n\
          result.push(key);\n\
        }\n\
      });\n\
      return result.sort();\n\
    }\n\
\n\
    /**\n\
     * Checks if the specified property name exists as a direct property of `object`,\n\
     * instead of an inherited property.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Objects\n\
     * @param {Object} object The object to inspect.\n\
     * @param {string} key The name of the property to check.\n\
     * @returns {boolean} Returns `true` if key is a direct property, else `false`.\n\
     * @example\n\
     *\n\
     * _.has({ 'a': 1, 'b': 2, 'c': 3 }, 'b');\n\
     * // => true\n\
     */\n\
    function has(object, key) {\n\
      return object ? hasOwnProperty.call(object, key) : false;\n\
    }\n\
\n\
    /**\n\
     * Creates an object composed of the inverted keys and values of the given\n\
     * object. If the given object contains duplicate values, subsequent values\n\
     * will overwrite property assignments of previous values unless `multiValue`\n\
     * is `true`.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Objects\n\
     * @param {Object} object The object to invert.\n\
     * @param {boolean} [multiValue=false] Allow multiple values per key.\n\
     * @returns {Object} Returns the created inverted object.\n\
     * @example\n\
     *\n\
     * _.invert({ 'first': 'fred', 'second': 'barney' });\n\
     * // => { 'fred': 'first', 'barney': 'second' }\n\
     *\n\
     * // without `multiValue`\n\
     * _.invert({ 'first': 'fred', 'second': 'barney', 'third': 'fred' });\n\
     * // => { 'fred': 'third', 'barney': 'second' }\n\
     *\n\
     * // with `multiValue`\n\
     * _.invert({ 'first': 'fred', 'second': 'barney', 'third': 'fred' }, true);\n\
     * // => { 'fred': ['first', 'third'], 'barney': 'second' }\n\
     */\n\
    function invert(object, multiValue) {\n\
      var index = -1,\n\
          props = keys(object),\n\
          length = props.length,\n\
          result = {};\n\
\n\
      while (++index < length) {\n\
        var key = props[index],\n\
            value = object[key];\n\
\n\
        if (multiValue && hasOwnProperty.call(result, value)) {\n\
          if (typeof result[value] == 'string') {\n\
            result[value] = [result[value]];\n\
          }\n\
          result[value].push(key);\n\
        }\n\
        else {\n\
          result[value] = key;\n\
        }\n\
      }\n\
      return result;\n\
    }\n\
\n\
    /**\n\
     * Checks if `value` is a boolean value.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Objects\n\
     * @param {*} value The value to check.\n\
     * @returns {boolean} Returns `true` if the `value` is a boolean value, else `false`.\n\
     * @example\n\
     *\n\
     * _.isBoolean(null);\n\
     * // => false\n\
     */\n\
    function isBoolean(value) {\n\
      return value === true || value === false ||\n\
        value && typeof value == 'object' && toString.call(value) == boolClass || false;\n\
    }\n\
\n\
    /**\n\
     * Checks if `value` is a date.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Objects\n\
     * @param {*} value The value to check.\n\
     * @returns {boolean} Returns `true` if the `value` is a date, else `false`.\n\
     * @example\n\
     *\n\
     * _.isDate(new Date);\n\
     * // => true\n\
     */\n\
    function isDate(value) {\n\
      return value && typeof value == 'object' && toString.call(value) == dateClass || false;\n\
    }\n\
\n\
    /**\n\
     * Checks if `value` is a DOM element.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Objects\n\
     * @param {*} value The value to check.\n\
     * @returns {boolean} Returns `true` if the `value` is a DOM element, else `false`.\n\
     * @example\n\
     *\n\
     * _.isElement(document.body);\n\
     * // => true\n\
     */\n\
    function isElement(value) {\n\
      return value && value.nodeType === 1 || false;\n\
    }\n\
\n\
    /**\n\
     * Checks if `value` is empty. Arrays, strings, or `arguments` objects with a\n\
     * length of `0` and objects with no own enumerable properties are considered\n\
     * \"empty\".\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Objects\n\
     * @param {Array|Object|string} value The value to inspect.\n\
     * @returns {boolean} Returns `true` if the `value` is empty, else `false`.\n\
     * @example\n\
     *\n\
     * _.isEmpty([1, 2, 3]);\n\
     * // => false\n\
     *\n\
     * _.isEmpty({});\n\
     * // => true\n\
     *\n\
     * _.isEmpty('');\n\
     * // => true\n\
     */\n\
    function isEmpty(value) {\n\
      var result = true;\n\
      if (!value) {\n\
        return result;\n\
      }\n\
      var className = toString.call(value),\n\
          length = value.length;\n\
\n\
      if ((className == arrayClass || className == stringClass ||\n\
          (support.argsClass ? className == argsClass : isArguments(value))) ||\n\
          (className == objectClass && typeof length == 'number' && isFunction(value.splice))) {\n\
        return !length;\n\
      }\n\
      forOwn(value, function() {\n\
        return (result = false);\n\
      });\n\
      return result;\n\
    }\n\
\n\
    /**\n\
     * Performs a deep comparison between two values to determine if they are\n\
     * equivalent to each other. If a callback is provided it will be executed\n\
     * to compare values. If the callback returns `undefined` comparisons will\n\
     * be handled by the method instead. The callback is bound to `thisArg` and\n\
     * invoked with two arguments; (a, b).\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Objects\n\
     * @param {*} a The value to compare.\n\
     * @param {*} b The other value to compare.\n\
     * @param {Function} [callback] The function to customize comparing values.\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\n\
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.\n\
     * @example\n\
     *\n\
     * var object = { 'name': 'fred' };\n\
     * var copy = { 'name': 'fred' };\n\
     *\n\
     * object == copy;\n\
     * // => false\n\
     *\n\
     * _.isEqual(object, copy);\n\
     * // => true\n\
     *\n\
     * var words = ['hello', 'goodbye'];\n\
     * var otherWords = ['hi', 'goodbye'];\n\
     *\n\
     * _.isEqual(words, otherWords, function(a, b) {\n\
     *   var reGreet = /^(?:hello|hi)$/i,\n\
     *       aGreet = _.isString(a) && reGreet.test(a),\n\
     *       bGreet = _.isString(b) && reGreet.test(b);\n\
     *\n\
     *   return (aGreet || bGreet) ? (aGreet == bGreet) : undefined;\n\
     * });\n\
     * // => true\n\
     */\n\
    function isEqual(a, b, callback, thisArg) {\n\
      return baseIsEqual(a, b, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 2));\n\
    }\n\
\n\
    /**\n\
     * Checks if `value` is, or can be coerced to, a finite number.\n\
     *\n\
     * Note: This is not the same as native `isFinite` which will return true for\n\
     * booleans and empty strings. See http://es5.github.io/#x15.1.2.5.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Objects\n\
     * @param {*} value The value to check.\n\
     * @returns {boolean} Returns `true` if the `value` is finite, else `false`.\n\
     * @example\n\
     *\n\
     * _.isFinite(-101);\n\
     * // => true\n\
     *\n\
     * _.isFinite('10');\n\
     * // => true\n\
     *\n\
     * _.isFinite(true);\n\
     * // => false\n\
     *\n\
     * _.isFinite('');\n\
     * // => false\n\
     *\n\
     * _.isFinite(Infinity);\n\
     * // => false\n\
     */\n\
    function isFinite(value) {\n\
      return nativeIsFinite(value) && !nativeIsNaN(parseFloat(value));\n\
    }\n\
\n\
    /**\n\
     * Checks if `value` is a function.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Objects\n\
     * @param {*} value The value to check.\n\
     * @returns {boolean} Returns `true` if the `value` is a function, else `false`.\n\
     * @example\n\
     *\n\
     * _.isFunction(_);\n\
     * // => true\n\
     */\n\
    function isFunction(value) {\n\
      return typeof value == 'function';\n\
    }\n\
    // fallback for older versions of Chrome and Safari\n\
    if (isFunction(/x/)) {\n\
      isFunction = function(value) {\n\
        return typeof value == 'function' && toString.call(value) == funcClass;\n\
      };\n\
    }\n\
\n\
    /**\n\
     * Checks if `value` is the language type of Object.\n\
     * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Objects\n\
     * @param {*} value The value to check.\n\
     * @returns {boolean} Returns `true` if the `value` is an object, else `false`.\n\
     * @example\n\
     *\n\
     * _.isObject({});\n\
     * // => true\n\
     *\n\
     * _.isObject([1, 2, 3]);\n\
     * // => true\n\
     *\n\
     * _.isObject(1);\n\
     * // => false\n\
     */\n\
    function isObject(value) {\n\
      // check if the value is the ECMAScript language type of Object\n\
      // http://es5.github.io/#x8\n\
      // and avoid a V8 bug\n\
      // http://code.google.com/p/v8/issues/detail?id=2291\n\
      return !!(value && objectTypes[typeof value]);\n\
    }\n\
\n\
    /**\n\
     * Checks if `value` is `NaN`.\n\
     *\n\
     * Note: This is not the same as native `isNaN` which will return `true` for\n\
     * `undefined` and other non-numeric values. See http://es5.github.io/#x15.1.2.4.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Objects\n\
     * @param {*} value The value to check.\n\
     * @returns {boolean} Returns `true` if the `value` is `NaN`, else `false`.\n\
     * @example\n\
     *\n\
     * _.isNaN(NaN);\n\
     * // => true\n\
     *\n\
     * _.isNaN(new Number(NaN));\n\
     * // => true\n\
     *\n\
     * isNaN(undefined);\n\
     * // => true\n\
     *\n\
     * _.isNaN(undefined);\n\
     * // => false\n\
     */\n\
    function isNaN(value) {\n\
      // `NaN` as a primitive is the only value that is not equal to itself\n\
      // (perform the [[Class]] check first to avoid errors with some host objects in IE)\n\
      return isNumber(value) && value != +value;\n\
    }\n\
\n\
    /**\n\
     * Checks if `value` is `null`.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Objects\n\
     * @param {*} value The value to check.\n\
     * @returns {boolean} Returns `true` if the `value` is `null`, else `false`.\n\
     * @example\n\
     *\n\
     * _.isNull(null);\n\
     * // => true\n\
     *\n\
     * _.isNull(undefined);\n\
     * // => false\n\
     */\n\
    function isNull(value) {\n\
      return value === null;\n\
    }\n\
\n\
    /**\n\
     * Checks if `value` is a number.\n\
     *\n\
     * Note: `NaN` is considered a number. See http://es5.github.io/#x8.5.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Objects\n\
     * @param {*} value The value to check.\n\
     * @returns {boolean} Returns `true` if the `value` is a number, else `false`.\n\
     * @example\n\
     *\n\
     * _.isNumber(8.4 * 5);\n\
     * // => true\n\
     */\n\
    function isNumber(value) {\n\
      return typeof value == 'number' ||\n\
        value && typeof value == 'object' && toString.call(value) == numberClass || false;\n\
    }\n\
\n\
    /**\n\
     * Checks if `value` is an object created by the `Object` constructor.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Objects\n\
     * @param {*} value The value to check.\n\
     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.\n\
     * @example\n\
     *\n\
     * function Shape() {\n\
     *   this.x = 0;\n\
     *   this.y = 0;\n\
     * }\n\
     *\n\
     * _.isPlainObject(new Shape);\n\
     * // => false\n\
     *\n\
     * _.isPlainObject([1, 2, 3]);\n\
     * // => false\n\
     *\n\
     * _.isPlainObject({ 'x': 0, 'y': 0 });\n\
     * // => true\n\
     */\n\
    var isPlainObject = !getPrototypeOf ? shimIsPlainObject : function(value) {\n\
      if (!(value && toString.call(value) == objectClass) || (!support.argsClass && isArguments(value))) {\n\
        return false;\n\
      }\n\
      var valueOf = value.valueOf,\n\
          objProto = isNative(valueOf) && (objProto = getPrototypeOf(valueOf)) && getPrototypeOf(objProto);\n\
\n\
      return objProto\n\
        ? (value == objProto || getPrototypeOf(value) == objProto)\n\
        : shimIsPlainObject(value);\n\
    };\n\
\n\
    /**\n\
     * Checks if `value` is a regular expression.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Objects\n\
     * @param {*} value The value to check.\n\
     * @returns {boolean} Returns `true` if the `value` is a regular expression, else `false`.\n\
     * @example\n\
     *\n\
     * _.isRegExp(/fred/);\n\
     * // => true\n\
     */\n\
    function isRegExp(value) {\n\
      return value && objectTypes[typeof value] && toString.call(value) == regexpClass || false;\n\
    }\n\
\n\
    /**\n\
     * Checks if `value` is a string.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Objects\n\
     * @param {*} value The value to check.\n\
     * @returns {boolean} Returns `true` if the `value` is a string, else `false`.\n\
     * @example\n\
     *\n\
     * _.isString('fred');\n\
     * // => true\n\
     */\n\
    function isString(value) {\n\
      return typeof value == 'string' ||\n\
        value && typeof value == 'object' && toString.call(value) == stringClass || false;\n\
    }\n\
\n\
    /**\n\
     * Checks if `value` is `undefined`.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Objects\n\
     * @param {*} value The value to check.\n\
     * @returns {boolean} Returns `true` if the `value` is `undefined`, else `false`.\n\
     * @example\n\
     *\n\
     * _.isUndefined(void 0);\n\
     * // => true\n\
     */\n\
    function isUndefined(value) {\n\
      return typeof value == 'undefined';\n\
    }\n\
\n\
    /**\n\
     * Creates an object with the same keys as `object` and values generated by\n\
     * running each own enumerable property of `object` through the callback.\n\
     * The callback is bound to `thisArg` and invoked with three arguments;\n\
     * (value, key, object).\n\
     *\n\
     * If a property name is provided for `callback` the created \"_.pluck\" style\n\
     * callback will return the property value of the given element.\n\
     *\n\
     * If an object is provided for `callback` the created \"_.where\" style callback\n\
     * will return `true` for elements that have the properties of the given object,\n\
     * else `false`.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Objects\n\
     * @param {Object} object The object to iterate over.\n\
     * @param {Function|Object|string} [callback=identity] The function called\n\
     *  per iteration. If a property name or object is provided it will be used\n\
     *  to create a \"_.pluck\" or \"_.where\" style callback, respectively.\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\n\
     * @returns {Array} Returns a new object with values of the results of each `callback` execution.\n\
     * @example\n\
     *\n\
     * _.mapValues({ 'a': 1, 'b': 2, 'c': 3} , function(num) { return num * 3; });\n\
     * // => { 'a': 3, 'b': 6, 'c': 9 }\n\
     *\n\
     * var characters = {\n\
     *   'fred': { 'name': 'fred', 'age': 40 },\n\
     *   'pebbles': { 'name': 'pebbles', 'age': 1 }\n\
     * };\n\
     *\n\
     * // using \"_.pluck\" callback shorthand\n\
     * _.mapValues(characters, 'age');\n\
     * // => { 'fred': 40, 'pebbles': 1 }\n\
     */\n\
    function mapValues(object, callback, thisArg) {\n\
      var result = {};\n\
      callback = lodash.createCallback(callback, thisArg, 3);\n\
\n\
      forOwn(object, function(value, key, object) {\n\
        result[key] = callback(value, key, object);\n\
      });\n\
      return result;\n\
    }\n\
\n\
    /**\n\
     * Recursively merges own enumerable properties of the source object(s), that\n\
     * don't resolve to `undefined` into the destination object. Subsequent sources\n\
     * will overwrite property assignments of previous sources. If a callback is\n\
     * provided it will be executed to produce the merged values of the destination\n\
     * and source properties. If the callback returns `undefined` merging will\n\
     * be handled by the method instead. The callback is bound to `thisArg` and\n\
     * invoked with two arguments; (objectValue, sourceValue).\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Objects\n\
     * @param {Object} object The destination object.\n\
     * @param {...Object} [source] The source objects.\n\
     * @param {Function} [callback] The function to customize merging properties.\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\n\
     * @returns {Object} Returns the destination object.\n\
     * @example\n\
     *\n\
     * var names = {\n\
     *   'characters': [\n\
     *     { 'name': 'barney' },\n\
     *     { 'name': 'fred' }\n\
     *   ]\n\
     * };\n\
     *\n\
     * var ages = {\n\
     *   'characters': [\n\
     *     { 'age': 36 },\n\
     *     { 'age': 40 }\n\
     *   ]\n\
     * };\n\
     *\n\
     * _.merge(names, ages);\n\
     * // => { 'characters': [{ 'name': 'barney', 'age': 36 }, { 'name': 'fred', 'age': 40 }] }\n\
     *\n\
     * var food = {\n\
     *   'fruits': ['apple'],\n\
     *   'vegetables': ['beet']\n\
     * };\n\
     *\n\
     * var otherFood = {\n\
     *   'fruits': ['banana'],\n\
     *   'vegetables': ['carrot']\n\
     * };\n\
     *\n\
     * _.merge(food, otherFood, function(a, b) {\n\
     *   return _.isArray(a) ? a.concat(b) : undefined;\n\
     * });\n\
     * // => { 'fruits': ['apple', 'banana'], 'vegetables': ['beet', 'carrot] }\n\
     */\n\
    function merge(object) {\n\
      var args = arguments,\n\
          length = 2;\n\
\n\
      if (!isObject(object)) {\n\
        return object;\n\
      }\n\
      // allows working with `_.reduce` and `_.reduceRight` without using\n\
      // their `index` and `collection` arguments\n\
      if (typeof args[2] != 'number') {\n\
        length = args.length;\n\
      }\n\
      if (length > 3 && typeof args[length - 2] == 'function') {\n\
        var callback = baseCreateCallback(args[--length - 1], args[length--], 2);\n\
      } else if (length > 2 && typeof args[length - 1] == 'function') {\n\
        callback = args[--length];\n\
      }\n\
      var sources = slice(arguments, 1, length),\n\
          index = -1,\n\
          stackA = getArray(),\n\
          stackB = getArray();\n\
\n\
      while (++index < length) {\n\
        baseMerge(object, sources[index], callback, stackA, stackB);\n\
      }\n\
      releaseArray(stackA);\n\
      releaseArray(stackB);\n\
      return object;\n\
    }\n\
\n\
    /**\n\
     * Creates a shallow clone of `object` excluding the specified properties.\n\
     * Property names may be specified as individual arguments or as arrays of\n\
     * property names. If a callback is provided it will be executed for each\n\
     * property of `object` omitting the properties the callback returns truey\n\
     * for. The callback is bound to `thisArg` and invoked with three arguments;\n\
     * (value, key, object).\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Objects\n\
     * @param {Object} object The source object.\n\
     * @param {Function|...string|string[]} [callback] The properties to omit or the\n\
     *  function called per iteration.\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\n\
     * @returns {Object} Returns an object without the omitted properties.\n\
     * @example\n\
     *\n\
     * _.omit({ 'name': 'fred', 'age': 40 }, 'age');\n\
     * // => { 'name': 'fred' }\n\
     *\n\
     * _.omit({ 'name': 'fred', 'age': 40 }, function(value) {\n\
     *   return typeof value == 'number';\n\
     * });\n\
     * // => { 'name': 'fred' }\n\
     */\n\
    function omit(object, callback, thisArg) {\n\
      var result = {};\n\
      if (typeof callback != 'function') {\n\
        var props = [];\n\
        forIn(object, function(value, key) {\n\
          props.push(key);\n\
        });\n\
        props = baseDifference(props, baseFlatten(arguments, true, false, 1));\n\
\n\
        var index = -1,\n\
            length = props.length;\n\
\n\
        while (++index < length) {\n\
          var key = props[index];\n\
          result[key] = object[key];\n\
        }\n\
      } else {\n\
        callback = lodash.createCallback(callback, thisArg, 3);\n\
        forIn(object, function(value, key, object) {\n\
          if (!callback(value, key, object)) {\n\
            result[key] = value;\n\
          }\n\
        });\n\
      }\n\
      return result;\n\
    }\n\
\n\
    /**\n\
     * Creates a two dimensional array of an object's key-value pairs,\n\
     * i.e. `[[key1, value1], [key2, value2]]`.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Objects\n\
     * @param {Object} object The object to inspect.\n\
     * @returns {Array} Returns new array of key-value pairs.\n\
     * @example\n\
     *\n\
     * _.pairs({ 'barney': 36, 'fred': 40 });\n\
     * // => [['barney', 36], ['fred', 40]] (property order is not guaranteed across environments)\n\
     */\n\
    function pairs(object) {\n\
      var index = -1,\n\
          props = keys(object),\n\
          length = props.length,\n\
          result = Array(length);\n\
\n\
      while (++index < length) {\n\
        var key = props[index];\n\
        result[index] = [key, object[key]];\n\
      }\n\
      return result;\n\
    }\n\
\n\
    /**\n\
     * Creates a shallow clone of `object` composed of the specified properties.\n\
     * Property names may be specified as individual arguments or as arrays of\n\
     * property names. If a callback is provided it will be executed for each\n\
     * property of `object` picking the properties the callback returns truey\n\
     * for. The callback is bound to `thisArg` and invoked with three arguments;\n\
     * (value, key, object).\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Objects\n\
     * @param {Object} object The source object.\n\
     * @param {Function|...string|string[]} [callback] The function called per\n\
     *  iteration or property names to pick, specified as individual property\n\
     *  names or arrays of property names.\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\n\
     * @returns {Object} Returns an object composed of the picked properties.\n\
     * @example\n\
     *\n\
     * _.pick({ 'name': 'fred', '_userid': 'fred1' }, 'name');\n\
     * // => { 'name': 'fred' }\n\
     *\n\
     * _.pick({ 'name': 'fred', '_userid': 'fred1' }, function(value, key) {\n\
     *   return key.charAt(0) != '_';\n\
     * });\n\
     * // => { 'name': 'fred' }\n\
     */\n\
    function pick(object, callback, thisArg) {\n\
      var result = {};\n\
      if (typeof callback != 'function') {\n\
        var index = -1,\n\
            props = baseFlatten(arguments, true, false, 1),\n\
            length = isObject(object) ? props.length : 0;\n\
\n\
        while (++index < length) {\n\
          var key = props[index];\n\
          if (key in object) {\n\
            result[key] = object[key];\n\
          }\n\
        }\n\
      } else {\n\
        callback = lodash.createCallback(callback, thisArg, 3);\n\
        forIn(object, function(value, key, object) {\n\
          if (callback(value, key, object)) {\n\
            result[key] = value;\n\
          }\n\
        });\n\
      }\n\
      return result;\n\
    }\n\
\n\
    /**\n\
     * An alternative to `_.reduce` this method transforms `object` to a new\n\
     * `accumulator` object which is the result of running each of its own\n\
     * enumerable properties through a callback, with each callback execution\n\
     * potentially mutating the `accumulator` object. The callback is bound to\n\
     * `thisArg` and invoked with four arguments; (accumulator, value, key, object).\n\
     * Callbacks may exit iteration early by explicitly returning `false`.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Objects\n\
     * @param {Array|Object} object The object to iterate over.\n\
     * @param {Function} [callback=identity] The function called per iteration.\n\
     * @param {*} [accumulator] The custom accumulator value.\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\n\
     * @returns {*} Returns the accumulated value.\n\
     * @example\n\
     *\n\
     * var squares = _.transform([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function(result, num) {\n\
     *   num *= num;\n\
     *   if (num % 2) {\n\
     *     return result.push(num) < 3;\n\
     *   }\n\
     * });\n\
     * // => [1, 9, 25]\n\
     *\n\
     * var mapped = _.transform({ 'a': 1, 'b': 2, 'c': 3 }, function(result, num, key) {\n\
     *   result[key] = num * 3;\n\
     * });\n\
     * // => { 'a': 3, 'b': 6, 'c': 9 }\n\
     */\n\
    function transform(object, callback, accumulator, thisArg) {\n\
      var isArr = isArray(object);\n\
      if (accumulator == null) {\n\
        if (isArr) {\n\
          accumulator = [];\n\
        } else {\n\
          var ctor = object && object.constructor,\n\
              proto = ctor && ctor.prototype;\n\
\n\
          accumulator = baseCreate(proto);\n\
        }\n\
      }\n\
      if (callback) {\n\
        callback = lodash.createCallback(callback, thisArg, 4);\n\
        (isArr ? baseEach : forOwn)(object, function(value, index, object) {\n\
          return callback(accumulator, value, index, object);\n\
        });\n\
      }\n\
      return accumulator;\n\
    }\n\
\n\
    /**\n\
     * Creates an array composed of the own enumerable property values of `object`.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Objects\n\
     * @param {Object} object The object to inspect.\n\
     * @returns {Array} Returns an array of property values.\n\
     * @example\n\
     *\n\
     * _.values({ 'one': 1, 'two': 2, 'three': 3 });\n\
     * // => [1, 2, 3] (property order is not guaranteed across environments)\n\
     */\n\
    function values(object) {\n\
      var index = -1,\n\
          props = keys(object),\n\
          length = props.length,\n\
          result = Array(length);\n\
\n\
      while (++index < length) {\n\
        result[index] = object[props[index]];\n\
      }\n\
      return result;\n\
    }\n\
\n\
    /*--------------------------------------------------------------------------*/\n\
\n\
    /**\n\
     * Creates an array of elements from the specified indexes, or keys, of the\n\
     * `collection`. Indexes may be specified as individual arguments or as arrays\n\
     * of indexes.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Collections\n\
     * @param {Array|Object|string} collection The collection to iterate over.\n\
     * @param {...(number|number[]|string|string[])} [index] The indexes of `collection`\n\
     *   to retrieve, specified as individual indexes or arrays of indexes.\n\
     * @returns {Array} Returns a new array of elements corresponding to the\n\
     *  provided indexes.\n\
     * @example\n\
     *\n\
     * _.at(['a', 'b', 'c', 'd', 'e'], [0, 2, 4]);\n\
     * // => ['a', 'c', 'e']\n\
     *\n\
     * _.at(['fred', 'barney', 'pebbles'], 0, 2);\n\
     * // => ['fred', 'pebbles']\n\
     */\n\
    function at(collection) {\n\
      var args = arguments,\n\
          index = -1,\n\
          props = baseFlatten(args, true, false, 1),\n\
          length = (args[2] && args[2][args[1]] === collection) ? 1 : props.length,\n\
          result = Array(length);\n\
\n\
      if (support.unindexedChars && isString(collection)) {\n\
        collection = collection.split('');\n\
      }\n\
      while(++index < length) {\n\
        result[index] = collection[props[index]];\n\
      }\n\
      return result;\n\
    }\n\
\n\
    /**\n\
     * Checks if a given value is present in a collection using strict equality\n\
     * for comparisons, i.e. `===`. If `fromIndex` is negative, it is used as the\n\
     * offset from the end of the collection.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @alias include\n\
     * @category Collections\n\
     * @param {Array|Object|string} collection The collection to iterate over.\n\
     * @param {*} target The value to check for.\n\
     * @param {number} [fromIndex=0] The index to search from.\n\
     * @returns {boolean} Returns `true` if the `target` element is found, else `false`.\n\
     * @example\n\
     *\n\
     * _.contains([1, 2, 3], 1);\n\
     * // => true\n\
     *\n\
     * _.contains([1, 2, 3], 1, 2);\n\
     * // => false\n\
     *\n\
     * _.contains({ 'name': 'fred', 'age': 40 }, 'fred');\n\
     * // => true\n\
     *\n\
     * _.contains('pebbles', 'eb');\n\
     * // => true\n\
     */\n\
    function contains(collection, target, fromIndex) {\n\
      var index = -1,\n\
          indexOf = getIndexOf(),\n\
          length = collection ? collection.length : 0,\n\
          result = false;\n\
\n\
      fromIndex = (fromIndex < 0 ? nativeMax(0, length + fromIndex) : fromIndex) || 0;\n\
      if (isArray(collection)) {\n\
        result = indexOf(collection, target, fromIndex) > -1;\n\
      } else if (typeof length == 'number') {\n\
        result = (isString(collection) ? collection.indexOf(target, fromIndex) : indexOf(collection, target, fromIndex)) > -1;\n\
      } else {\n\
        baseEach(collection, function(value) {\n\
          if (++index >= fromIndex) {\n\
            return !(result = value === target);\n\
          }\n\
        });\n\
      }\n\
      return result;\n\
    }\n\
\n\
    /**\n\
     * Creates an object composed of keys generated from the results of running\n\
     * each element of `collection` through the callback. The corresponding value\n\
     * of each key is the number of times the key was returned by the callback.\n\
     * The callback is bound to `thisArg` and invoked with three arguments;\n\
     * (value, index|key, collection).\n\
     *\n\
     * If a property name is provided for `callback` the created \"_.pluck\" style\n\
     * callback will return the property value of the given element.\n\
     *\n\
     * If an object is provided for `callback` the created \"_.where\" style callback\n\
     * will return `true` for elements that have the properties of the given object,\n\
     * else `false`.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Collections\n\
     * @param {Array|Object|string} collection The collection to iterate over.\n\
     * @param {Function|Object|string} [callback=identity] The function called\n\
     *  per iteration. If a property name or object is provided it will be used\n\
     *  to create a \"_.pluck\" or \"_.where\" style callback, respectively.\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\n\
     * @returns {Object} Returns the composed aggregate object.\n\
     * @example\n\
     *\n\
     * _.countBy([4.3, 6.1, 6.4], function(num) { return Math.floor(num); });\n\
     * // => { '4': 1, '6': 2 }\n\
     *\n\
     * _.countBy([4.3, 6.1, 6.4], function(num) { return this.floor(num); }, Math);\n\
     * // => { '4': 1, '6': 2 }\n\
     *\n\
     * _.countBy(['one', 'two', 'three'], 'length');\n\
     * // => { '3': 2, '5': 1 }\n\
     */\n\
    var countBy = createAggregator(function(result, value, key) {\n\
      (hasOwnProperty.call(result, key) ? result[key]++ : result[key] = 1);\n\
    });\n\
\n\
    /**\n\
     * Checks if the given callback returns truey value for **all** elements of\n\
     * a collection. The callback is bound to `thisArg` and invoked with three\n\
     * arguments; (value, index|key, collection).\n\
     *\n\
     * If a property name is provided for `callback` the created \"_.pluck\" style\n\
     * callback will return the property value of the given element.\n\
     *\n\
     * If an object is provided for `callback` the created \"_.where\" style callback\n\
     * will return `true` for elements that have the properties of the given object,\n\
     * else `false`.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @alias all\n\
     * @category Collections\n\
     * @param {Array|Object|string} collection The collection to iterate over.\n\
     * @param {Function|Object|string} [callback=identity] The function called\n\
     *  per iteration. If a property name or object is provided it will be used\n\
     *  to create a \"_.pluck\" or \"_.where\" style callback, respectively.\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\n\
     * @returns {boolean} Returns `true` if all elements passed the callback check,\n\
     *  else `false`.\n\
     * @example\n\
     *\n\
     * _.every([true, 1, null, 'yes']);\n\
     * // => false\n\
     *\n\
     * var characters = [\n\
     *   { 'name': 'barney', 'age': 36 },\n\
     *   { 'name': 'fred',   'age': 40 }\n\
     * ];\n\
     *\n\
     * // using \"_.pluck\" callback shorthand\n\
     * _.every(characters, 'age');\n\
     * // => true\n\
     *\n\
     * // using \"_.where\" callback shorthand\n\
     * _.every(characters, { 'age': 36 });\n\
     * // => false\n\
     */\n\
    function every(collection, callback, thisArg) {\n\
      var result = true;\n\
      callback = lodash.createCallback(callback, thisArg, 3);\n\
\n\
      if (isArray(collection)) {\n\
        var index = -1,\n\
            length = collection.length;\n\
\n\
        while (++index < length) {\n\
          if (!(result = !!callback(collection[index], index, collection))) {\n\
            break;\n\
          }\n\
        }\n\
      } else {\n\
        baseEach(collection, function(value, index, collection) {\n\
          return (result = !!callback(value, index, collection));\n\
        });\n\
      }\n\
      return result;\n\
    }\n\
\n\
    /**\n\
     * Iterates over elements of a collection, returning an array of all elements\n\
     * the callback returns truey for. The callback is bound to `thisArg` and\n\
     * invoked with three arguments; (value, index|key, collection).\n\
     *\n\
     * If a property name is provided for `callback` the created \"_.pluck\" style\n\
     * callback will return the property value of the given element.\n\
     *\n\
     * If an object is provided for `callback` the created \"_.where\" style callback\n\
     * will return `true` for elements that have the properties of the given object,\n\
     * else `false`.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @alias select\n\
     * @category Collections\n\
     * @param {Array|Object|string} collection The collection to iterate over.\n\
     * @param {Function|Object|string} [callback=identity] The function called\n\
     *  per iteration. If a property name or object is provided it will be used\n\
     *  to create a \"_.pluck\" or \"_.where\" style callback, respectively.\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\n\
     * @returns {Array} Returns a new array of elements that passed the callback check.\n\
     * @example\n\
     *\n\
     * var evens = _.filter([1, 2, 3, 4, 5, 6], function(num) { return num % 2 == 0; });\n\
     * // => [2, 4, 6]\n\
     *\n\
     * var characters = [\n\
     *   { 'name': 'barney', 'age': 36, 'blocked': false },\n\
     *   { 'name': 'fred',   'age': 40, 'blocked': true }\n\
     * ];\n\
     *\n\
     * // using \"_.pluck\" callback shorthand\n\
     * _.filter(characters, 'blocked');\n\
     * // => [{ 'name': 'fred', 'age': 40, 'blocked': true }]\n\
     *\n\
     * // using \"_.where\" callback shorthand\n\
     * _.filter(characters, { 'age': 36 });\n\
     * // => [{ 'name': 'barney', 'age': 36, 'blocked': false }]\n\
     */\n\
    function filter(collection, callback, thisArg) {\n\
      var result = [];\n\
      callback = lodash.createCallback(callback, thisArg, 3);\n\
\n\
      if (isArray(collection)) {\n\
        var index = -1,\n\
            length = collection.length;\n\
\n\
        while (++index < length) {\n\
          var value = collection[index];\n\
          if (callback(value, index, collection)) {\n\
            result.push(value);\n\
          }\n\
        }\n\
      } else {\n\
        baseEach(collection, function(value, index, collection) {\n\
          if (callback(value, index, collection)) {\n\
            result.push(value);\n\
          }\n\
        });\n\
      }\n\
      return result;\n\
    }\n\
\n\
    /**\n\
     * Iterates over elements of a collection, returning the first element that\n\
     * the callback returns truey for. The callback is bound to `thisArg` and\n\
     * invoked with three arguments; (value, index|key, collection).\n\
     *\n\
     * If a property name is provided for `callback` the created \"_.pluck\" style\n\
     * callback will return the property value of the given element.\n\
     *\n\
     * If an object is provided for `callback` the created \"_.where\" style callback\n\
     * will return `true` for elements that have the properties of the given object,\n\
     * else `false`.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @alias detect, findWhere\n\
     * @category Collections\n\
     * @param {Array|Object|string} collection The collection to iterate over.\n\
     * @param {Function|Object|string} [callback=identity] The function called\n\
     *  per iteration. If a property name or object is provided it will be used\n\
     *  to create a \"_.pluck\" or \"_.where\" style callback, respectively.\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\n\
     * @returns {*} Returns the found element, else `undefined`.\n\
     * @example\n\
     *\n\
     * var characters = [\n\
     *   { 'name': 'barney',  'age': 36, 'blocked': false },\n\
     *   { 'name': 'fred',    'age': 40, 'blocked': true },\n\
     *   { 'name': 'pebbles', 'age': 1,  'blocked': false }\n\
     * ];\n\
     *\n\
     * _.find(characters, function(chr) {\n\
     *   return chr.age < 40;\n\
     * });\n\
     * // => { 'name': 'barney', 'age': 36, 'blocked': false }\n\
     *\n\
     * // using \"_.where\" callback shorthand\n\
     * _.find(characters, { 'age': 1 });\n\
     * // =>  { 'name': 'pebbles', 'age': 1, 'blocked': false }\n\
     *\n\
     * // using \"_.pluck\" callback shorthand\n\
     * _.find(characters, 'blocked');\n\
     * // => { 'name': 'fred', 'age': 40, 'blocked': true }\n\
     */\n\
    function find(collection, callback, thisArg) {\n\
      callback = lodash.createCallback(callback, thisArg, 3);\n\
\n\
      if (isArray(collection)) {\n\
        var index = -1,\n\
            length = collection.length;\n\
\n\
        while (++index < length) {\n\
          var value = collection[index];\n\
          if (callback(value, index, collection)) {\n\
            return value;\n\
          }\n\
        }\n\
      } else {\n\
        var result;\n\
        baseEach(collection, function(value, index, collection) {\n\
          if (callback(value, index, collection)) {\n\
            result = value;\n\
            return false;\n\
          }\n\
        });\n\
        return result;\n\
      }\n\
    }\n\
\n\
    /**\n\
     * This method is like `_.find` except that it iterates over elements\n\
     * of a `collection` from right to left.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Collections\n\
     * @param {Array|Object|string} collection The collection to iterate over.\n\
     * @param {Function|Object|string} [callback=identity] The function called\n\
     *  per iteration. If a property name or object is provided it will be used\n\
     *  to create a \"_.pluck\" or \"_.where\" style callback, respectively.\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\n\
     * @returns {*} Returns the found element, else `undefined`.\n\
     * @example\n\
     *\n\
     * _.findLast([1, 2, 3, 4], function(num) {\n\
     *   return num % 2 == 1;\n\
     * });\n\
     * // => 3\n\
     */\n\
    function findLast(collection, callback, thisArg) {\n\
      var result;\n\
      callback = lodash.createCallback(callback, thisArg, 3);\n\
      forEachRight(collection, function(value, index, collection) {\n\
        if (callback(value, index, collection)) {\n\
          result = value;\n\
          return false;\n\
        }\n\
      });\n\
      return result;\n\
    }\n\
\n\
    /**\n\
     * Iterates over elements of a collection, executing the callback for each\n\
     * element. The callback is bound to `thisArg` and invoked with three arguments;\n\
     * (value, index|key, collection). Callbacks may exit iteration early by\n\
     * explicitly returning `false`.\n\
     *\n\
     * Note: As with other \"Collections\" methods, objects with a `length` property\n\
     * are iterated like arrays. To avoid this behavior `_.forIn` or `_.forOwn`\n\
     * may be used for object iteration.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @alias each\n\
     * @category Collections\n\
     * @param {Array|Object|string} collection The collection to iterate over.\n\
     * @param {Function} [callback=identity] The function called per iteration.\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\n\
     * @returns {Array|Object|string} Returns `collection`.\n\
     * @example\n\
     *\n\
     * _([1, 2, 3]).forEach(function(num) { console.log(num); }).join(',');\n\
     * // => logs each number and returns '1,2,3'\n\
     *\n\
     * _.forEach({ 'one': 1, 'two': 2, 'three': 3 }, function(num) { console.log(num); });\n\
     * // => logs each number and returns the object (property order is not guaranteed across environments)\n\
     */\n\
    function forEach(collection, callback, thisArg) {\n\
      if (callback && typeof thisArg == 'undefined' && isArray(collection)) {\n\
        var index = -1,\n\
            length = collection.length;\n\
\n\
        while (++index < length) {\n\
          if (callback(collection[index], index, collection) === false) {\n\
            break;\n\
          }\n\
        }\n\
      } else {\n\
        baseEach(collection, callback, thisArg);\n\
      }\n\
      return collection;\n\
    }\n\
\n\
    /**\n\
     * This method is like `_.forEach` except that it iterates over elements\n\
     * of a `collection` from right to left.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @alias eachRight\n\
     * @category Collections\n\
     * @param {Array|Object|string} collection The collection to iterate over.\n\
     * @param {Function} [callback=identity] The function called per iteration.\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\n\
     * @returns {Array|Object|string} Returns `collection`.\n\
     * @example\n\
     *\n\
     * _([1, 2, 3]).forEachRight(function(num) { console.log(num); }).join(',');\n\
     * // => logs each number from right to left and returns '3,2,1'\n\
     */\n\
    function forEachRight(collection, callback, thisArg) {\n\
      var iterable = collection,\n\
          length = collection ? collection.length : 0;\n\
\n\
      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);\n\
      if (isArray(collection)) {\n\
        while (length--) {\n\
          if (callback(collection[length], length, collection) === false) {\n\
            break;\n\
          }\n\
        }\n\
      } else {\n\
        if (typeof length != 'number') {\n\
          var props = keys(collection);\n\
          length = props.length;\n\
        } else if (support.unindexedChars && isString(collection)) {\n\
          iterable = collection.split('');\n\
        }\n\
        baseEach(collection, function(value, key, collection) {\n\
          key = props ? props[--length] : --length;\n\
          return callback(iterable[key], key, collection);\n\
        });\n\
      }\n\
      return collection;\n\
    }\n\
\n\
    /**\n\
     * Creates an object composed of keys generated from the results of running\n\
     * each element of a collection through the callback. The corresponding value\n\
     * of each key is an array of the elements responsible for generating the key.\n\
     * The callback is bound to `thisArg` and invoked with three arguments;\n\
     * (value, index|key, collection).\n\
     *\n\
     * If a property name is provided for `callback` the created \"_.pluck\" style\n\
     * callback will return the property value of the given element.\n\
     *\n\
     * If an object is provided for `callback` the created \"_.where\" style callback\n\
     * will return `true` for elements that have the properties of the given object,\n\
     * else `false`\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Collections\n\
     * @param {Array|Object|string} collection The collection to iterate over.\n\
     * @param {Function|Object|string} [callback=identity] The function called\n\
     *  per iteration. If a property name or object is provided it will be used\n\
     *  to create a \"_.pluck\" or \"_.where\" style callback, respectively.\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\n\
     * @returns {Object} Returns the composed aggregate object.\n\
     * @example\n\
     *\n\
     * _.groupBy([4.2, 6.1, 6.4], function(num) { return Math.floor(num); });\n\
     * // => { '4': [4.2], '6': [6.1, 6.4] }\n\
     *\n\
     * _.groupBy([4.2, 6.1, 6.4], function(num) { return this.floor(num); }, Math);\n\
     * // => { '4': [4.2], '6': [6.1, 6.4] }\n\
     *\n\
     * // using \"_.pluck\" callback shorthand\n\
     * _.groupBy(['one', 'two', 'three'], 'length');\n\
     * // => { '3': ['one', 'two'], '5': ['three'] }\n\
     */\n\
    var groupBy = createAggregator(function(result, value, key) {\n\
      (hasOwnProperty.call(result, key) ? result[key] : result[key] = []).push(value);\n\
    });\n\
\n\
    /**\n\
     * Creates an object composed of keys generated from the results of running\n\
     * each element of the collection through the given callback. The corresponding\n\
     * value of each key is the last element responsible for generating the key.\n\
     * The callback is bound to `thisArg` and invoked with three arguments;\n\
     * (value, index|key, collection).\n\
     *\n\
     * If a property name is provided for `callback` the created \"_.pluck\" style\n\
     * callback will return the property value of the given element.\n\
     *\n\
     * If an object is provided for `callback` the created \"_.where\" style callback\n\
     * will return `true` for elements that have the properties of the given object,\n\
     * else `false`.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Collections\n\
     * @param {Array|Object|string} collection The collection to iterate over.\n\
     * @param {Function|Object|string} [callback=identity] The function called\n\
     *  per iteration. If a property name or object is provided it will be used\n\
     *  to create a \"_.pluck\" or \"_.where\" style callback, respectively.\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\n\
     * @returns {Object} Returns the composed aggregate object.\n\
     * @example\n\
     *\n\
     * var keys = [\n\
     *   { 'dir': 'left', 'code': 97 },\n\
     *   { 'dir': 'right', 'code': 100 }\n\
     * ];\n\
     *\n\
     * _.indexBy(keys, 'dir');\n\
     * // => { 'left': { 'dir': 'left', 'code': 97 }, 'right': { 'dir': 'right', 'code': 100 } }\n\
     *\n\
     * _.indexBy(keys, function(key) { return String.fromCharCode(key.code); });\n\
     * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }\n\
     *\n\
     * _.indexBy(characters, function(key) { this.fromCharCode(key.code); }, String);\n\
     * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }\n\
     */\n\
    var indexBy = createAggregator(function(result, value, key) {\n\
      result[key] = value;\n\
    });\n\
\n\
    /**\n\
     * Invokes the method named by `methodName` on each element in the `collection`\n\
     * returning an array of the results of each invoked method. Additional arguments\n\
     * will be provided to each invoked method. If `methodName` is a function it\n\
     * will be invoked for, and `this` bound to, each element in the `collection`.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Collections\n\
     * @param {Array|Object|string} collection The collection to iterate over.\n\
     * @param {Function|string} methodName The name of the method to invoke or\n\
     *  the function invoked per iteration.\n\
     * @param {...*} [arg] Arguments to invoke the method with.\n\
     * @returns {Array} Returns a new array of the results of each invoked method.\n\
     * @example\n\
     *\n\
     * _.invoke([[5, 1, 7], [3, 2, 1]], 'sort');\n\
     * // => [[1, 5, 7], [1, 2, 3]]\n\
     *\n\
     * _.invoke([123, 456], String.prototype.split, '');\n\
     * // => [['1', '2', '3'], ['4', '5', '6']]\n\
     */\n\
    function invoke(collection, methodName) {\n\
      var args = slice(arguments, 2),\n\
          index = -1,\n\
          isFunc = typeof methodName == 'function',\n\
          length = collection ? collection.length : 0,\n\
          result = Array(typeof length == 'number' ? length : 0);\n\
\n\
      forEach(collection, function(value) {\n\
        result[++index] = (isFunc ? methodName : value[methodName]).apply(value, args);\n\
      });\n\
      return result;\n\
    }\n\
\n\
    /**\n\
     * Creates an array of values by running each element in the collection\n\
     * through the callback. The callback is bound to `thisArg` and invoked with\n\
     * three arguments; (value, index|key, collection).\n\
     *\n\
     * If a property name is provided for `callback` the created \"_.pluck\" style\n\
     * callback will return the property value of the given element.\n\
     *\n\
     * If an object is provided for `callback` the created \"_.where\" style callback\n\
     * will return `true` for elements that have the properties of the given object,\n\
     * else `false`.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @alias collect\n\
     * @category Collections\n\
     * @param {Array|Object|string} collection The collection to iterate over.\n\
     * @param {Function|Object|string} [callback=identity] The function called\n\
     *  per iteration. If a property name or object is provided it will be used\n\
     *  to create a \"_.pluck\" or \"_.where\" style callback, respectively.\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\n\
     * @returns {Array} Returns a new array of the results of each `callback` execution.\n\
     * @example\n\
     *\n\
     * _.map([1, 2, 3], function(num) { return num * 3; });\n\
     * // => [3, 6, 9]\n\
     *\n\
     * _.map({ 'one': 1, 'two': 2, 'three': 3 }, function(num) { return num * 3; });\n\
     * // => [3, 6, 9] (property order is not guaranteed across environments)\n\
     *\n\
     * var characters = [\n\
     *   { 'name': 'barney', 'age': 36 },\n\
     *   { 'name': 'fred',   'age': 40 }\n\
     * ];\n\
     *\n\
     * // using \"_.pluck\" callback shorthand\n\
     * _.map(characters, 'name');\n\
     * // => ['barney', 'fred']\n\
     */\n\
    function map(collection, callback, thisArg) {\n\
      var index = -1,\n\
          length = collection ? collection.length : 0,\n\
          result = Array(typeof length == 'number' ? length : 0);\n\
\n\
      callback = lodash.createCallback(callback, thisArg, 3);\n\
      if (isArray(collection)) {\n\
        while (++index < length) {\n\
          result[index] = callback(collection[index], index, collection);\n\
        }\n\
      } else {\n\
        baseEach(collection, function(value, key, collection) {\n\
          result[++index] = callback(value, key, collection);\n\
        });\n\
      }\n\
      return result;\n\
    }\n\
\n\
    /**\n\
     * Retrieves the maximum value of a collection. If the collection is empty or\n\
     * falsey `-Infinity` is returned. If a callback is provided it will be executed\n\
     * for each value in the collection to generate the criterion by which the value\n\
     * is ranked. The callback is bound to `thisArg` and invoked with three\n\
     * arguments; (value, index, collection).\n\
     *\n\
     * If a property name is provided for `callback` the created \"_.pluck\" style\n\
     * callback will return the property value of the given element.\n\
     *\n\
     * If an object is provided for `callback` the created \"_.where\" style callback\n\
     * will return `true` for elements that have the properties of the given object,\n\
     * else `false`.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Collections\n\
     * @param {Array|Object|string} collection The collection to iterate over.\n\
     * @param {Function|Object|string} [callback=identity] The function called\n\
     *  per iteration. If a property name or object is provided it will be used\n\
     *  to create a \"_.pluck\" or \"_.where\" style callback, respectively.\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\n\
     * @returns {*} Returns the maximum value.\n\
     * @example\n\
     *\n\
     * _.max([4, 2, 8, 6]);\n\
     * // => 8\n\
     *\n\
     * var characters = [\n\
     *   { 'name': 'barney', 'age': 36 },\n\
     *   { 'name': 'fred',   'age': 40 }\n\
     * ];\n\
     *\n\
     * _.max(characters, function(chr) { return chr.age; });\n\
     * // => { 'name': 'fred', 'age': 40 };\n\
     *\n\
     * // using \"_.pluck\" callback shorthand\n\
     * _.max(characters, 'age');\n\
     * // => { 'name': 'fred', 'age': 40 };\n\
     */\n\
    function max(collection, callback, thisArg) {\n\
      var computed = -Infinity,\n\
          result = computed;\n\
\n\
      // allows working with functions like `_.map` without using\n\
      // their `index` argument as a callback\n\
      if (typeof callback != 'function' && thisArg && thisArg[callback] === collection) {\n\
        callback = null;\n\
      }\n\
      if (callback == null && isArray(collection)) {\n\
        var index = -1,\n\
            length = collection.length;\n\
\n\
        while (++index < length) {\n\
          var value = collection[index];\n\
          if (value > result) {\n\
            result = value;\n\
          }\n\
        }\n\
      } else {\n\
        callback = (callback == null && isString(collection))\n\
          ? charAtCallback\n\
          : lodash.createCallback(callback, thisArg, 3);\n\
\n\
        baseEach(collection, function(value, index, collection) {\n\
          var current = callback(value, index, collection);\n\
          if (current > computed) {\n\
            computed = current;\n\
            result = value;\n\
          }\n\
        });\n\
      }\n\
      return result;\n\
    }\n\
\n\
    /**\n\
     * Retrieves the minimum value of a collection. If the collection is empty or\n\
     * falsey `Infinity` is returned. If a callback is provided it will be executed\n\
     * for each value in the collection to generate the criterion by which the value\n\
     * is ranked. The callback is bound to `thisArg` and invoked with three\n\
     * arguments; (value, index, collection).\n\
     *\n\
     * If a property name is provided for `callback` the created \"_.pluck\" style\n\
     * callback will return the property value of the given element.\n\
     *\n\
     * If an object is provided for `callback` the created \"_.where\" style callback\n\
     * will return `true` for elements that have the properties of the given object,\n\
     * else `false`.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Collections\n\
     * @param {Array|Object|string} collection The collection to iterate over.\n\
     * @param {Function|Object|string} [callback=identity] The function called\n\
     *  per iteration. If a property name or object is provided it will be used\n\
     *  to create a \"_.pluck\" or \"_.where\" style callback, respectively.\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\n\
     * @returns {*} Returns the minimum value.\n\
     * @example\n\
     *\n\
     * _.min([4, 2, 8, 6]);\n\
     * // => 2\n\
     *\n\
     * var characters = [\n\
     *   { 'name': 'barney', 'age': 36 },\n\
     *   { 'name': 'fred',   'age': 40 }\n\
     * ];\n\
     *\n\
     * _.min(characters, function(chr) { return chr.age; });\n\
     * // => { 'name': 'barney', 'age': 36 };\n\
     *\n\
     * // using \"_.pluck\" callback shorthand\n\
     * _.min(characters, 'age');\n\
     * // => { 'name': 'barney', 'age': 36 };\n\
     */\n\
    function min(collection, callback, thisArg) {\n\
      var computed = Infinity,\n\
          result = computed;\n\
\n\
      // allows working with functions like `_.map` without using\n\
      // their `index` argument as a callback\n\
      if (typeof callback != 'function' && thisArg && thisArg[callback] === collection) {\n\
        callback = null;\n\
      }\n\
      if (callback == null && isArray(collection)) {\n\
        var index = -1,\n\
            length = collection.length;\n\
\n\
        while (++index < length) {\n\
          var value = collection[index];\n\
          if (value < result) {\n\
            result = value;\n\
          }\n\
        }\n\
      } else {\n\
        callback = (callback == null && isString(collection))\n\
          ? charAtCallback\n\
          : lodash.createCallback(callback, thisArg, 3);\n\
\n\
        baseEach(collection, function(value, index, collection) {\n\
          var current = callback(value, index, collection);\n\
          if (current < computed) {\n\
            computed = current;\n\
            result = value;\n\
          }\n\
        });\n\
      }\n\
      return result;\n\
    }\n\
\n\
    /**\n\
     * Retrieves the value of a specified property from all elements in the collection.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @type Function\n\
     * @category Collections\n\
     * @param {Array|Object|string} collection The collection to iterate over.\n\
     * @param {string} property The name of the property to pluck.\n\
     * @returns {Array} Returns a new array of property values.\n\
     * @example\n\
     *\n\
     * var characters = [\n\
     *   { 'name': 'barney', 'age': 36 },\n\
     *   { 'name': 'fred',   'age': 40 }\n\
     * ];\n\
     *\n\
     * _.pluck(characters, 'name');\n\
     * // => ['barney', 'fred']\n\
     */\n\
    var pluck = map;\n\
\n\
    /**\n\
     * Reduces a collection to a value which is the accumulated result of running\n\
     * each element in the collection through the callback, where each successive\n\
     * callback execution consumes the return value of the previous execution. If\n\
     * `accumulator` is not provided the first element of the collection will be\n\
     * used as the initial `accumulator` value. The callback is bound to `thisArg`\n\
     * and invoked with four arguments; (accumulator, value, index|key, collection).\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @alias foldl, inject\n\
     * @category Collections\n\
     * @param {Array|Object|string} collection The collection to iterate over.\n\
     * @param {Function} [callback=identity] The function called per iteration.\n\
     * @param {*} [accumulator] Initial value of the accumulator.\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\n\
     * @returns {*} Returns the accumulated value.\n\
     * @example\n\
     *\n\
     * var sum = _.reduce([1, 2, 3], function(sum, num) {\n\
     *   return sum + num;\n\
     * });\n\
     * // => 6\n\
     *\n\
     * var mapped = _.reduce({ 'a': 1, 'b': 2, 'c': 3 }, function(result, num, key) {\n\
     *   result[key] = num * 3;\n\
     *   return result;\n\
     * }, {});\n\
     * // => { 'a': 3, 'b': 6, 'c': 9 }\n\
     */\n\
    function reduce(collection, callback, accumulator, thisArg) {\n\
      var noaccum = arguments.length < 3;\n\
      callback = lodash.createCallback(callback, thisArg, 4);\n\
\n\
      if (isArray(collection)) {\n\
        var index = -1,\n\
            length = collection.length;\n\
\n\
        if (noaccum) {\n\
          accumulator = collection[++index];\n\
        }\n\
        while (++index < length) {\n\
          accumulator = callback(accumulator, collection[index], index, collection);\n\
        }\n\
      } else {\n\
        baseEach(collection, function(value, index, collection) {\n\
          accumulator = noaccum\n\
            ? (noaccum = false, value)\n\
            : callback(accumulator, value, index, collection)\n\
        });\n\
      }\n\
      return accumulator;\n\
    }\n\
\n\
    /**\n\
     * This method is like `_.reduce` except that it iterates over elements\n\
     * of a `collection` from right to left.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @alias foldr\n\
     * @category Collections\n\
     * @param {Array|Object|string} collection The collection to iterate over.\n\
     * @param {Function} [callback=identity] The function called per iteration.\n\
     * @param {*} [accumulator] Initial value of the accumulator.\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\n\
     * @returns {*} Returns the accumulated value.\n\
     * @example\n\
     *\n\
     * var list = [[0, 1], [2, 3], [4, 5]];\n\
     * var flat = _.reduceRight(list, function(a, b) { return a.concat(b); }, []);\n\
     * // => [4, 5, 2, 3, 0, 1]\n\
     */\n\
    function reduceRight(collection, callback, accumulator, thisArg) {\n\
      var noaccum = arguments.length < 3;\n\
      callback = lodash.createCallback(callback, thisArg, 4);\n\
      forEachRight(collection, function(value, index, collection) {\n\
        accumulator = noaccum\n\
          ? (noaccum = false, value)\n\
          : callback(accumulator, value, index, collection);\n\
      });\n\
      return accumulator;\n\
    }\n\
\n\
    /**\n\
     * The opposite of `_.filter` this method returns the elements of a\n\
     * collection that the callback does **not** return truey for.\n\
     *\n\
     * If a property name is provided for `callback` the created \"_.pluck\" style\n\
     * callback will return the property value of the given element.\n\
     *\n\
     * If an object is provided for `callback` the created \"_.where\" style callback\n\
     * will return `true` for elements that have the properties of the given object,\n\
     * else `false`.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Collections\n\
     * @param {Array|Object|string} collection The collection to iterate over.\n\
     * @param {Function|Object|string} [callback=identity] The function called\n\
     *  per iteration. If a property name or object is provided it will be used\n\
     *  to create a \"_.pluck\" or \"_.where\" style callback, respectively.\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\n\
     * @returns {Array} Returns a new array of elements that failed the callback check.\n\
     * @example\n\
     *\n\
     * var odds = _.reject([1, 2, 3, 4, 5, 6], function(num) { return num % 2 == 0; });\n\
     * // => [1, 3, 5]\n\
     *\n\
     * var characters = [\n\
     *   { 'name': 'barney', 'age': 36, 'blocked': false },\n\
     *   { 'name': 'fred',   'age': 40, 'blocked': true }\n\
     * ];\n\
     *\n\
     * // using \"_.pluck\" callback shorthand\n\
     * _.reject(characters, 'blocked');\n\
     * // => [{ 'name': 'barney', 'age': 36, 'blocked': false }]\n\
     *\n\
     * // using \"_.where\" callback shorthand\n\
     * _.reject(characters, { 'age': 36 });\n\
     * // => [{ 'name': 'fred', 'age': 40, 'blocked': true }]\n\
     */\n\
    function reject(collection, callback, thisArg) {\n\
      callback = lodash.createCallback(callback, thisArg, 3);\n\
      return filter(collection, function(value, index, collection) {\n\
        return !callback(value, index, collection);\n\
      });\n\
    }\n\
\n\
    /**\n\
     * Retrieves a random element or `n` random elements from a collection.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Collections\n\
     * @param {Array|Object|string} collection The collection to sample.\n\
     * @param {number} [n] The number of elements to sample.\n\
     * @param- {Object} [guard] Allows working with functions like `_.map`\n\
     *  without using their `index` arguments as `n`.\n\
     * @returns {Array} Returns the random sample(s) of `collection`.\n\
     * @example\n\
     *\n\
     * _.sample([1, 2, 3, 4]);\n\
     * // => 2\n\
     *\n\
     * _.sample([1, 2, 3, 4], 2);\n\
     * // => [3, 1]\n\
     */\n\
    function sample(collection, n, guard) {\n\
      if (collection && typeof collection.length != 'number') {\n\
        collection = values(collection);\n\
      } else if (support.unindexedChars && isString(collection)) {\n\
        collection = collection.split('');\n\
      }\n\
      if (n == null || guard) {\n\
        return collection ? collection[baseRandom(0, collection.length - 1)] : undefined;\n\
      }\n\
      var result = shuffle(collection);\n\
      result.length = nativeMin(nativeMax(0, n), result.length);\n\
      return result;\n\
    }\n\
\n\
    /**\n\
     * Creates an array of shuffled values, using a version of the Fisher-Yates\n\
     * shuffle. See http://en.wikipedia.org/wiki/Fisher-Yates_shuffle.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Collections\n\
     * @param {Array|Object|string} collection The collection to shuffle.\n\
     * @returns {Array} Returns a new shuffled collection.\n\
     * @example\n\
     *\n\
     * _.shuffle([1, 2, 3, 4, 5, 6]);\n\
     * // => [4, 1, 6, 3, 5, 2]\n\
     */\n\
    function shuffle(collection) {\n\
      var index = -1,\n\
          length = collection ? collection.length : 0,\n\
          result = Array(typeof length == 'number' ? length : 0);\n\
\n\
      forEach(collection, function(value) {\n\
        var rand = baseRandom(0, ++index);\n\
        result[index] = result[rand];\n\
        result[rand] = value;\n\
      });\n\
      return result;\n\
    }\n\
\n\
    /**\n\
     * Gets the size of the `collection` by returning `collection.length` for arrays\n\
     * and array-like objects or the number of own enumerable properties for objects.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Collections\n\
     * @param {Array|Object|string} collection The collection to inspect.\n\
     * @returns {number} Returns `collection.length` or number of own enumerable properties.\n\
     * @example\n\
     *\n\
     * _.size([1, 2]);\n\
     * // => 2\n\
     *\n\
     * _.size({ 'one': 1, 'two': 2, 'three': 3 });\n\
     * // => 3\n\
     *\n\
     * _.size('pebbles');\n\
     * // => 7\n\
     */\n\
    function size(collection) {\n\
      var length = collection ? collection.length : 0;\n\
      return typeof length == 'number' ? length : keys(collection).length;\n\
    }\n\
\n\
    /**\n\
     * Checks if the callback returns a truey value for **any** element of a\n\
     * collection. The function returns as soon as it finds a passing value and\n\
     * does not iterate over the entire collection. The callback is bound to\n\
     * `thisArg` and invoked with three arguments; (value, index|key, collection).\n\
     *\n\
     * If a property name is provided for `callback` the created \"_.pluck\" style\n\
     * callback will return the property value of the given element.\n\
     *\n\
     * If an object is provided for `callback` the created \"_.where\" style callback\n\
     * will return `true` for elements that have the properties of the given object,\n\
     * else `false`.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @alias any\n\
     * @category Collections\n\
     * @param {Array|Object|string} collection The collection to iterate over.\n\
     * @param {Function|Object|string} [callback=identity] The function called\n\
     *  per iteration. If a property name or object is provided it will be used\n\
     *  to create a \"_.pluck\" or \"_.where\" style callback, respectively.\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\n\
     * @returns {boolean} Returns `true` if any element passed the callback check,\n\
     *  else `false`.\n\
     * @example\n\
     *\n\
     * _.some([null, 0, 'yes', false], Boolean);\n\
     * // => true\n\
     *\n\
     * var characters = [\n\
     *   { 'name': 'barney', 'age': 36, 'blocked': false },\n\
     *   { 'name': 'fred',   'age': 40, 'blocked': true }\n\
     * ];\n\
     *\n\
     * // using \"_.pluck\" callback shorthand\n\
     * _.some(characters, 'blocked');\n\
     * // => true\n\
     *\n\
     * // using \"_.where\" callback shorthand\n\
     * _.some(characters, { 'age': 1 });\n\
     * // => false\n\
     */\n\
    function some(collection, callback, thisArg) {\n\
      var result;\n\
      callback = lodash.createCallback(callback, thisArg, 3);\n\
\n\
      if (isArray(collection)) {\n\
        var index = -1,\n\
            length = collection.length;\n\
\n\
        while (++index < length) {\n\
          if ((result = callback(collection[index], index, collection))) {\n\
            break;\n\
          }\n\
        }\n\
      } else {\n\
        baseEach(collection, function(value, index, collection) {\n\
          return !(result = callback(value, index, collection));\n\
        });\n\
      }\n\
      return !!result;\n\
    }\n\
\n\
    /**\n\
     * Creates an array of elements, sorted in ascending order by the results of\n\
     * running each element in a collection through the callback. This method\n\
     * performs a stable sort, that is, it will preserve the original sort order\n\
     * of equal elements. The callback is bound to `thisArg` and invoked with\n\
     * three arguments; (value, index|key, collection).\n\
     *\n\
     * If a property name is provided for `callback` the created \"_.pluck\" style\n\
     * callback will return the property value of the given element.\n\
     *\n\
     * If an array of property names is provided for `callback` the collection\n\
     * will be sorted by each property value.\n\
     *\n\
     * If an object is provided for `callback` the created \"_.where\" style callback\n\
     * will return `true` for elements that have the properties of the given object,\n\
     * else `false`.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Collections\n\
     * @param {Array|Object|string} collection The collection to iterate over.\n\
     * @param {Array|Function|Object|string} [callback=identity] The function called\n\
     *  per iteration. If a property name or object is provided it will be used\n\
     *  to create a \"_.pluck\" or \"_.where\" style callback, respectively.\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\n\
     * @returns {Array} Returns a new array of sorted elements.\n\
     * @example\n\
     *\n\
     * _.sortBy([1, 2, 3], function(num) { return Math.sin(num); });\n\
     * // => [3, 1, 2]\n\
     *\n\
     * _.sortBy([1, 2, 3], function(num) { return this.sin(num); }, Math);\n\
     * // => [3, 1, 2]\n\
     *\n\
     * var characters = [\n\
     *   { 'name': 'barney',  'age': 36 },\n\
     *   { 'name': 'fred',    'age': 40 },\n\
     *   { 'name': 'barney',  'age': 26 },\n\
     *   { 'name': 'fred',    'age': 30 }\n\
     * ];\n\
     *\n\
     * // using \"_.pluck\" callback shorthand\n\
     * _.map(_.sortBy(characters, 'age'), _.values);\n\
     * // => [['barney', 26], ['fred', 30], ['barney', 36], ['fred', 40]]\n\
     *\n\
     * // sorting by multiple properties\n\
     * _.map(_.sortBy(characters, ['name', 'age']), _.values);\n\
     * // = > [['barney', 26], ['barney', 36], ['fred', 30], ['fred', 40]]\n\
     */\n\
    function sortBy(collection, callback, thisArg) {\n\
      var index = -1,\n\
          isArr = isArray(callback),\n\
          length = collection ? collection.length : 0,\n\
          result = Array(typeof length == 'number' ? length : 0);\n\
\n\
      if (!isArr) {\n\
        callback = lodash.createCallback(callback, thisArg, 3);\n\
      }\n\
      forEach(collection, function(value, key, collection) {\n\
        var object = result[++index] = getObject();\n\
        if (isArr) {\n\
          object.criteria = map(callback, function(key) { return value[key]; });\n\
        } else {\n\
          (object.criteria = getArray())[0] = callback(value, key, collection);\n\
        }\n\
        object.index = index;\n\
        object.value = value;\n\
      });\n\
\n\
      length = result.length;\n\
      result.sort(compareAscending);\n\
      while (length--) {\n\
        var object = result[length];\n\
        result[length] = object.value;\n\
        if (!isArr) {\n\
          releaseArray(object.criteria);\n\
        }\n\
        releaseObject(object);\n\
      }\n\
      return result;\n\
    }\n\
\n\
    /**\n\
     * Converts the `collection` to an array.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Collections\n\
     * @param {Array|Object|string} collection The collection to convert.\n\
     * @returns {Array} Returns the new converted array.\n\
     * @example\n\
     *\n\
     * (function() { return _.toArray(arguments).slice(1); })(1, 2, 3, 4);\n\
     * // => [2, 3, 4]\n\
     */\n\
    function toArray(collection) {\n\
      if (collection && typeof collection.length == 'number') {\n\
        return (support.unindexedChars && isString(collection))\n\
          ? collection.split('')\n\
          : slice(collection);\n\
      }\n\
      return values(collection);\n\
    }\n\
\n\
    /**\n\
     * Performs a deep comparison of each element in a `collection` to the given\n\
     * `properties` object, returning an array of all elements that have equivalent\n\
     * property values.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @type Function\n\
     * @category Collections\n\
     * @param {Array|Object|string} collection The collection to iterate over.\n\
     * @param {Object} props The object of property values to filter by.\n\
     * @returns {Array} Returns a new array of elements that have the given properties.\n\
     * @example\n\
     *\n\
     * var characters = [\n\
     *   { 'name': 'barney', 'age': 36, 'pets': ['hoppy'] },\n\
     *   { 'name': 'fred',   'age': 40, 'pets': ['baby puss', 'dino'] }\n\
     * ];\n\
     *\n\
     * _.where(characters, { 'age': 36 });\n\
     * // => [{ 'name': 'barney', 'age': 36, 'pets': ['hoppy'] }]\n\
     *\n\
     * _.where(characters, { 'pets': ['dino'] });\n\
     * // => [{ 'name': 'fred', 'age': 40, 'pets': ['baby puss', 'dino'] }]\n\
     */\n\
    var where = filter;\n\
\n\
    /*--------------------------------------------------------------------------*/\n\
\n\
    /**\n\
     * Creates an array with all falsey values removed. The values `false`, `null`,\n\
     * `0`, `\"\"`, `undefined`, and `NaN` are all falsey.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Arrays\n\
     * @param {Array} array The array to compact.\n\
     * @returns {Array} Returns a new array of filtered values.\n\
     * @example\n\
     *\n\
     * _.compact([0, 1, false, 2, '', 3]);\n\
     * // => [1, 2, 3]\n\
     */\n\
    function compact(array) {\n\
      var index = -1,\n\
          length = array ? array.length : 0,\n\
          result = [];\n\
\n\
      while (++index < length) {\n\
        var value = array[index];\n\
        if (value) {\n\
          result.push(value);\n\
        }\n\
      }\n\
      return result;\n\
    }\n\
\n\
    /**\n\
     * Creates an array excluding all values of the provided arrays using strict\n\
     * equality for comparisons, i.e. `===`.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Arrays\n\
     * @param {Array} array The array to process.\n\
     * @param {...Array} [values] The arrays of values to exclude.\n\
     * @returns {Array} Returns a new array of filtered values.\n\
     * @example\n\
     *\n\
     * _.difference([1, 2, 3, 4, 5], [5, 2, 10]);\n\
     * // => [1, 3, 4]\n\
     */\n\
    function difference(array) {\n\
      return baseDifference(array, baseFlatten(arguments, true, true, 1));\n\
    }\n\
\n\
    /**\n\
     * This method is like `_.find` except that it returns the index of the first\n\
     * element that passes the callback check, instead of the element itself.\n\
     *\n\
     * If a property name is provided for `callback` the created \"_.pluck\" style\n\
     * callback will return the property value of the given element.\n\
     *\n\
     * If an object is provided for `callback` the created \"_.where\" style callback\n\
     * will return `true` for elements that have the properties of the given object,\n\
     * else `false`.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Arrays\n\
     * @param {Array} array The array to search.\n\
     * @param {Function|Object|string} [callback=identity] The function called\n\
     *  per iteration. If a property name or object is provided it will be used\n\
     *  to create a \"_.pluck\" or \"_.where\" style callback, respectively.\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\n\
     * @returns {number} Returns the index of the found element, else `-1`.\n\
     * @example\n\
     *\n\
     * var characters = [\n\
     *   { 'name': 'barney',  'age': 36, 'blocked': false },\n\
     *   { 'name': 'fred',    'age': 40, 'blocked': true },\n\
     *   { 'name': 'pebbles', 'age': 1,  'blocked': false }\n\
     * ];\n\
     *\n\
     * _.findIndex(characters, function(chr) {\n\
     *   return chr.age < 20;\n\
     * });\n\
     * // => 2\n\
     *\n\
     * // using \"_.where\" callback shorthand\n\
     * _.findIndex(characters, { 'age': 36 });\n\
     * // => 0\n\
     *\n\
     * // using \"_.pluck\" callback shorthand\n\
     * _.findIndex(characters, 'blocked');\n\
     * // => 1\n\
     */\n\
    function findIndex(array, callback, thisArg) {\n\
      var index = -1,\n\
          length = array ? array.length : 0;\n\
\n\
      callback = lodash.createCallback(callback, thisArg, 3);\n\
      while (++index < length) {\n\
        if (callback(array[index], index, array)) {\n\
          return index;\n\
        }\n\
      }\n\
      return -1;\n\
    }\n\
\n\
    /**\n\
     * This method is like `_.findIndex` except that it iterates over elements\n\
     * of a `collection` from right to left.\n\
     *\n\
     * If a property name is provided for `callback` the created \"_.pluck\" style\n\
     * callback will return the property value of the given element.\n\
     *\n\
     * If an object is provided for `callback` the created \"_.where\" style callback\n\
     * will return `true` for elements that have the properties of the given object,\n\
     * else `false`.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Arrays\n\
     * @param {Array} array The array to search.\n\
     * @param {Function|Object|string} [callback=identity] The function called\n\
     *  per iteration. If a property name or object is provided it will be used\n\
     *  to create a \"_.pluck\" or \"_.where\" style callback, respectively.\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\n\
     * @returns {number} Returns the index of the found element, else `-1`.\n\
     * @example\n\
     *\n\
     * var characters = [\n\
     *   { 'name': 'barney',  'age': 36, 'blocked': true },\n\
     *   { 'name': 'fred',    'age': 40, 'blocked': false },\n\
     *   { 'name': 'pebbles', 'age': 1,  'blocked': true }\n\
     * ];\n\
     *\n\
     * _.findLastIndex(characters, function(chr) {\n\
     *   return chr.age > 30;\n\
     * });\n\
     * // => 1\n\
     *\n\
     * // using \"_.where\" callback shorthand\n\
     * _.findLastIndex(characters, { 'age': 36 });\n\
     * // => 0\n\
     *\n\
     * // using \"_.pluck\" callback shorthand\n\
     * _.findLastIndex(characters, 'blocked');\n\
     * // => 2\n\
     */\n\
    function findLastIndex(array, callback, thisArg) {\n\
      var length = array ? array.length : 0;\n\
      callback = lodash.createCallback(callback, thisArg, 3);\n\
      while (length--) {\n\
        if (callback(array[length], length, array)) {\n\
          return length;\n\
        }\n\
      }\n\
      return -1;\n\
    }\n\
\n\
    /**\n\
     * Gets the first element or first `n` elements of an array. If a callback\n\
     * is provided elements at the beginning of the array are returned as long\n\
     * as the callback returns truey. The callback is bound to `thisArg` and\n\
     * invoked with three arguments; (value, index, array).\n\
     *\n\
     * If a property name is provided for `callback` the created \"_.pluck\" style\n\
     * callback will return the property value of the given element.\n\
     *\n\
     * If an object is provided for `callback` the created \"_.where\" style callback\n\
     * will return `true` for elements that have the properties of the given object,\n\
     * else `false`.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @alias head, take\n\
     * @category Arrays\n\
     * @param {Array} array The array to query.\n\
     * @param {Function|Object|number|string} [callback] The function called\n\
     *  per element or the number of elements to return. If a property name or\n\
     *  object is provided it will be used to create a \"_.pluck\" or \"_.where\"\n\
     *  style callback, respectively.\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\n\
     * @returns {*} Returns the first element(s) of `array`.\n\
     * @example\n\
     *\n\
     * _.first([1, 2, 3]);\n\
     * // => 1\n\
     *\n\
     * // returns the first two elements\n\
     * _.first([1, 2, 3], 2);\n\
     * // => [1, 2]\n\
     *\n\
     * // returns elements from the beginning until the callback result is falsey\n\
     * _.first([1, 2, 3], function(num) {\n\
     *   return num < 3;\n\
     * });\n\
     * // => [1, 2]\n\
     *\n\
     * var characters = [\n\
     *   { 'name': 'barney',  'blocked': true,  'employer': 'slate' },\n\
     *   { 'name': 'fred',    'blocked': false, 'employer': 'slate' },\n\
     *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }\n\
     * ];\n\
     *\n\
     * // using \"_.pluck\" callback shorthand\n\
     * _.first(characters, 'blocked');\n\
     * // => [{ 'name': 'barney', 'blocked': true, 'employer': 'slate' }]\n\
     *\n\
     * // using \"_.where\" callback shorthand\n\
     * _.pluck(_.first(characters, { 'employer': 'slate' }), 'name');\n\
     * // => ['barney', 'fred']\n\
     */\n\
    function first(array, callback, thisArg) {\n\
      var n = 0,\n\
          length = array ? array.length : 0;\n\
\n\
      if (typeof callback != 'number' && callback != null) {\n\
        var index = -1;\n\
        callback = lodash.createCallback(callback, thisArg, 3);\n\
        while (++index < length && callback(array[index], index, array)) {\n\
          n++;\n\
        }\n\
      } else {\n\
        n = callback;\n\
        if (n == null || thisArg) {\n\
          return array ? array[0] : undefined;\n\
        }\n\
      }\n\
      return slice(array, 0, nativeMin(nativeMax(0, n), length));\n\
    }\n\
\n\
    /**\n\
     * Flattens a nested array (the nesting can be to any depth). If `isShallow`\n\
     * is truey, the array will only be flattened a single level. If a callback\n\
     * is provided each element of the array is passed through the callback before\n\
     * flattening. The callback is bound to `thisArg` and invoked with three\n\
     * arguments; (value, index, array).\n\
     *\n\
     * If a property name is provided for `callback` the created \"_.pluck\" style\n\
     * callback will return the property value of the given element.\n\
     *\n\
     * If an object is provided for `callback` the created \"_.where\" style callback\n\
     * will return `true` for elements that have the properties of the given object,\n\
     * else `false`.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Arrays\n\
     * @param {Array} array The array to flatten.\n\
     * @param {boolean} [isShallow=false] A flag to restrict flattening to a single level.\n\
     * @param {Function|Object|string} [callback=identity] The function called\n\
     *  per iteration. If a property name or object is provided it will be used\n\
     *  to create a \"_.pluck\" or \"_.where\" style callback, respectively.\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\n\
     * @returns {Array} Returns a new flattened array.\n\
     * @example\n\
     *\n\
     * _.flatten([1, [2], [3, [[4]]]]);\n\
     * // => [1, 2, 3, 4];\n\
     *\n\
     * // using `isShallow`\n\
     * _.flatten([1, [2], [3, [[4]]]], true);\n\
     * // => [1, 2, 3, [[4]]];\n\
     *\n\
     * var characters = [\n\
     *   { 'name': 'barney', 'age': 30, 'pets': ['hoppy'] },\n\
     *   { 'name': 'fred',   'age': 40, 'pets': ['baby puss', 'dino'] }\n\
     * ];\n\
     *\n\
     * // using \"_.pluck\" callback shorthand\n\
     * _.flatten(characters, 'pets');\n\
     * // => ['hoppy', 'baby puss', 'dino']\n\
     */\n\
    function flatten(array, isShallow, callback, thisArg) {\n\
      // juggle arguments\n\
      if (typeof isShallow != 'boolean' && isShallow != null) {\n\
        thisArg = callback;\n\
        callback = (typeof isShallow != 'function' && thisArg && thisArg[isShallow] === array) ? null : isShallow;\n\
        isShallow = false;\n\
      }\n\
      if (callback != null) {\n\
        array = map(array, callback, thisArg);\n\
      }\n\
      return baseFlatten(array, isShallow);\n\
    }\n\
\n\
    /**\n\
     * Gets the index at which the first occurrence of `value` is found using\n\
     * strict equality for comparisons, i.e. `===`. If the array is already sorted\n\
     * providing `true` for `fromIndex` will run a faster binary search.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Arrays\n\
     * @param {Array} array The array to search.\n\
     * @param {*} value The value to search for.\n\
     * @param {boolean|number} [fromIndex=0] The index to search from or `true`\n\
     *  to perform a binary search on a sorted array.\n\
     * @returns {number} Returns the index of the matched value or `-1`.\n\
     * @example\n\
     *\n\
     * _.indexOf([1, 2, 3, 1, 2, 3], 2);\n\
     * // => 1\n\
     *\n\
     * // using `fromIndex`\n\
     * _.indexOf([1, 2, 3, 1, 2, 3], 2, 3);\n\
     * // => 4\n\
     *\n\
     * // performing a binary search\n\
     * _.indexOf([1, 1, 2, 2, 3, 3], 2, true);\n\
     * // => 2\n\
     */\n\
    function indexOf(array, value, fromIndex) {\n\
      if (typeof fromIndex == 'number') {\n\
        var length = array ? array.length : 0;\n\
        fromIndex = (fromIndex < 0 ? nativeMax(0, length + fromIndex) : fromIndex || 0);\n\
      } else if (fromIndex) {\n\
        var index = sortedIndex(array, value);\n\
        return array[index] === value ? index : -1;\n\
      }\n\
      return baseIndexOf(array, value, fromIndex);\n\
    }\n\
\n\
    /**\n\
     * Gets all but the last element or last `n` elements of an array. If a\n\
     * callback is provided elements at the end of the array are excluded from\n\
     * the result as long as the callback returns truey. The callback is bound\n\
     * to `thisArg` and invoked with three arguments; (value, index, array).\n\
     *\n\
     * If a property name is provided for `callback` the created \"_.pluck\" style\n\
     * callback will return the property value of the given element.\n\
     *\n\
     * If an object is provided for `callback` the created \"_.where\" style callback\n\
     * will return `true` for elements that have the properties of the given object,\n\
     * else `false`.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Arrays\n\
     * @param {Array} array The array to query.\n\
     * @param {Function|Object|number|string} [callback=1] The function called\n\
     *  per element or the number of elements to exclude. If a property name or\n\
     *  object is provided it will be used to create a \"_.pluck\" or \"_.where\"\n\
     *  style callback, respectively.\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\n\
     * @returns {Array} Returns a slice of `array`.\n\
     * @example\n\
     *\n\
     * _.initial([1, 2, 3]);\n\
     * // => [1, 2]\n\
     *\n\
     * // excludes the last two elements\n\
     * _.initial([1, 2, 3], 2);\n\
     * // => [1]\n\
     *\n\
     * // excludes elements from the end until the callback fails\n\
     * _.initial([1, 2, 3], function(num) {\n\
     *   return num > 1;\n\
     * });\n\
     * // => [1]\n\
     *\n\
     * var characters = [\n\
     *   { 'name': 'barney',  'blocked': false, 'employer': 'slate' },\n\
     *   { 'name': 'fred',    'blocked': true,  'employer': 'slate' },\n\
     *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }\n\
     * ];\n\
     *\n\
     * // using \"_.pluck\" callback shorthand\n\
     * _.initial(characters, 'blocked');\n\
     * // => [{ 'name': 'barney',  'blocked': false, 'employer': 'slate' }]\n\
     *\n\
     * // using \"_.where\" callback shorthand\n\
     * _.pluck(_.initial(characters, { 'employer': 'na' }), 'name');\n\
     * // => ['barney', 'fred']\n\
     */\n\
    function initial(array, callback, thisArg) {\n\
      var n = 0,\n\
          length = array ? array.length : 0;\n\
\n\
      if (typeof callback != 'number' && callback != null) {\n\
        var index = length;\n\
        callback = lodash.createCallback(callback, thisArg, 3);\n\
        while (index-- && callback(array[index], index, array)) {\n\
          n++;\n\
        }\n\
      } else {\n\
        n = (callback == null || thisArg) ? 1 : callback || n;\n\
      }\n\
      return slice(array, 0, nativeMin(nativeMax(0, length - n), length));\n\
    }\n\
\n\
    /**\n\
     * Creates an array of unique values present in all provided arrays using\n\
     * strict equality for comparisons, i.e. `===`.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Arrays\n\
     * @param {...Array} [array] The arrays to inspect.\n\
     * @returns {Array} Returns an array of shared values.\n\
     * @example\n\
     *\n\
     * _.intersection([1, 2, 3], [5, 2, 1, 4], [2, 1]);\n\
     * // => [1, 2]\n\
     */\n\
    function intersection() {\n\
      var args = [],\n\
          argsIndex = -1,\n\
          argsLength = arguments.length,\n\
          caches = getArray(),\n\
          indexOf = getIndexOf(),\n\
          trustIndexOf = indexOf === baseIndexOf,\n\
          seen = getArray();\n\
\n\
      while (++argsIndex < argsLength) {\n\
        var value = arguments[argsIndex];\n\
        if (isArray(value) || isArguments(value)) {\n\
          args.push(value);\n\
          caches.push(trustIndexOf && value.length >= largeArraySize &&\n\
            createCache(argsIndex ? args[argsIndex] : seen));\n\
        }\n\
      }\n\
      var array = args[0],\n\
          index = -1,\n\
          length = array ? array.length : 0,\n\
          result = [];\n\
\n\
      outer:\n\
      while (++index < length) {\n\
        var cache = caches[0];\n\
        value = array[index];\n\
\n\
        if ((cache ? cacheIndexOf(cache, value) : indexOf(seen, value)) < 0) {\n\
          argsIndex = argsLength;\n\
          (cache || seen).push(value);\n\
          while (--argsIndex) {\n\
            cache = caches[argsIndex];\n\
            if ((cache ? cacheIndexOf(cache, value) : indexOf(args[argsIndex], value)) < 0) {\n\
              continue outer;\n\
            }\n\
          }\n\
          result.push(value);\n\
        }\n\
      }\n\
      while (argsLength--) {\n\
        cache = caches[argsLength];\n\
        if (cache) {\n\
          releaseObject(cache);\n\
        }\n\
      }\n\
      releaseArray(caches);\n\
      releaseArray(seen);\n\
      return result;\n\
    }\n\
\n\
    /**\n\
     * Gets the last element or last `n` elements of an array. If a callback is\n\
     * provided elements at the end of the array are returned as long as the\n\
     * callback returns truey. The callback is bound to `thisArg` and invoked\n\
     * with three arguments; (value, index, array).\n\
     *\n\
     * If a property name is provided for `callback` the created \"_.pluck\" style\n\
     * callback will return the property value of the given element.\n\
     *\n\
     * If an object is provided for `callback` the created \"_.where\" style callback\n\
     * will return `true` for elements that have the properties of the given object,\n\
     * else `false`.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Arrays\n\
     * @param {Array} array The array to query.\n\
     * @param {Function|Object|number|string} [callback] The function called\n\
     *  per element or the number of elements to return. If a property name or\n\
     *  object is provided it will be used to create a \"_.pluck\" or \"_.where\"\n\
     *  style callback, respectively.\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\n\
     * @returns {*} Returns the last element(s) of `array`.\n\
     * @example\n\
     *\n\
     * _.last([1, 2, 3]);\n\
     * // => 3\n\
     *\n\
     * // returns the last two elements\n\
     * _.last([1, 2, 3], 2);\n\
     * // => [2, 3]\n\
     *\n\
     * // returns elements from the end until the callback fails\n\
     * _.last([1, 2, 3], function(num) {\n\
     *   return num > 1;\n\
     * });\n\
     * // => [2, 3]\n\
     *\n\
     * var characters = [\n\
     *   { 'name': 'barney',  'blocked': false, 'employer': 'slate' },\n\
     *   { 'name': 'fred',    'blocked': true,  'employer': 'slate' },\n\
     *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }\n\
     * ];\n\
     *\n\
     * // using \"_.pluck\" callback shorthand\n\
     * _.pluck(_.last(characters, 'blocked'), 'name');\n\
     * // => ['fred', 'pebbles']\n\
     *\n\
     * // using \"_.where\" callback shorthand\n\
     * _.last(characters, { 'employer': 'na' });\n\
     * // => [{ 'name': 'pebbles', 'blocked': true, 'employer': 'na' }]\n\
     */\n\
    function last(array, callback, thisArg) {\n\
      var n = 0,\n\
          length = array ? array.length : 0;\n\
\n\
      if (typeof callback != 'number' && callback != null) {\n\
        var index = length;\n\
        callback = lodash.createCallback(callback, thisArg, 3);\n\
        while (index-- && callback(array[index], index, array)) {\n\
          n++;\n\
        }\n\
      } else {\n\
        n = callback;\n\
        if (n == null || thisArg) {\n\
          return array ? array[length - 1] : undefined;\n\
        }\n\
      }\n\
      return slice(array, nativeMax(0, length - n));\n\
    }\n\
\n\
    /**\n\
     * Gets the index at which the last occurrence of `value` is found using strict\n\
     * equality for comparisons, i.e. `===`. If `fromIndex` is negative, it is used\n\
     * as the offset from the end of the collection.\n\
     *\n\
     * If a property name is provided for `callback` the created \"_.pluck\" style\n\
     * callback will return the property value of the given element.\n\
     *\n\
     * If an object is provided for `callback` the created \"_.where\" style callback\n\
     * will return `true` for elements that have the properties of the given object,\n\
     * else `false`.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Arrays\n\
     * @param {Array} array The array to search.\n\
     * @param {*} value The value to search for.\n\
     * @param {number} [fromIndex=array.length-1] The index to search from.\n\
     * @returns {number} Returns the index of the matched value or `-1`.\n\
     * @example\n\
     *\n\
     * _.lastIndexOf([1, 2, 3, 1, 2, 3], 2);\n\
     * // => 4\n\
     *\n\
     * // using `fromIndex`\n\
     * _.lastIndexOf([1, 2, 3, 1, 2, 3], 2, 3);\n\
     * // => 1\n\
     */\n\
    function lastIndexOf(array, value, fromIndex) {\n\
      var index = array ? array.length : 0;\n\
      if (typeof fromIndex == 'number') {\n\
        index = (fromIndex < 0 ? nativeMax(0, index + fromIndex) : nativeMin(fromIndex, index - 1)) + 1;\n\
      }\n\
      while (index--) {\n\
        if (array[index] === value) {\n\
          return index;\n\
        }\n\
      }\n\
      return -1;\n\
    }\n\
\n\
    /**\n\
     * Removes all provided values from the given array using strict equality for\n\
     * comparisons, i.e. `===`.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Arrays\n\
     * @param {Array} array The array to modify.\n\
     * @param {...*} [value] The values to remove.\n\
     * @returns {Array} Returns `array`.\n\
     * @example\n\
     *\n\
     * var array = [1, 2, 3, 1, 2, 3];\n\
     * _.pull(array, 2, 3);\n\
     * console.log(array);\n\
     * // => [1, 1]\n\
     */\n\
    function pull(array) {\n\
      var args = arguments,\n\
          argsIndex = 0,\n\
          argsLength = args.length,\n\
          length = array ? array.length : 0;\n\
\n\
      while (++argsIndex < argsLength) {\n\
        var index = -1,\n\
            value = args[argsIndex];\n\
        while (++index < length) {\n\
          if (array[index] === value) {\n\
            splice.call(array, index--, 1);\n\
            length--;\n\
          }\n\
        }\n\
      }\n\
      return array;\n\
    }\n\
\n\
    /**\n\
     * Creates an array of numbers (positive and/or negative) progressing from\n\
     * `start` up to but not including `end`. If `start` is less than `stop` a\n\
     * zero-length range is created unless a negative `step` is specified.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Arrays\n\
     * @param {number} [start=0] The start of the range.\n\
     * @param {number} end The end of the range.\n\
     * @param {number} [step=1] The value to increment or decrement by.\n\
     * @returns {Array} Returns a new range array.\n\
     * @example\n\
     *\n\
     * _.range(4);\n\
     * // => [0, 1, 2, 3]\n\
     *\n\
     * _.range(1, 5);\n\
     * // => [1, 2, 3, 4]\n\
     *\n\
     * _.range(0, 20, 5);\n\
     * // => [0, 5, 10, 15]\n\
     *\n\
     * _.range(0, -4, -1);\n\
     * // => [0, -1, -2, -3]\n\
     *\n\
     * _.range(1, 4, 0);\n\
     * // => [1, 1, 1]\n\
     *\n\
     * _.range(0);\n\
     * // => []\n\
     */\n\
    function range(start, end, step) {\n\
      start = +start || 0;\n\
      step = typeof step == 'number' ? step : (+step || 1);\n\
\n\
      if (end == null) {\n\
        end = start;\n\
        start = 0;\n\
      }\n\
      // use `Array(length)` so engines like Chakra and V8 avoid slower modes\n\
      // http://youtu.be/XAqIpGU8ZZk#t=17m25s\n\
      var index = -1,\n\
          length = nativeMax(0, ceil((end - start) / (step || 1))),\n\
          result = Array(length);\n\
\n\
      while (++index < length) {\n\
        result[index] = start;\n\
        start += step;\n\
      }\n\
      return result;\n\
    }\n\
\n\
    /**\n\
     * Removes all elements from an array that the callback returns truey for\n\
     * and returns an array of removed elements. The callback is bound to `thisArg`\n\
     * and invoked with three arguments; (value, index, array).\n\
     *\n\
     * If a property name is provided for `callback` the created \"_.pluck\" style\n\
     * callback will return the property value of the given element.\n\
     *\n\
     * If an object is provided for `callback` the created \"_.where\" style callback\n\
     * will return `true` for elements that have the properties of the given object,\n\
     * else `false`.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Arrays\n\
     * @param {Array} array The array to modify.\n\
     * @param {Function|Object|string} [callback=identity] The function called\n\
     *  per iteration. If a property name or object is provided it will be used\n\
     *  to create a \"_.pluck\" or \"_.where\" style callback, respectively.\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\n\
     * @returns {Array} Returns a new array of removed elements.\n\
     * @example\n\
     *\n\
     * var array = [1, 2, 3, 4, 5, 6];\n\
     * var evens = _.remove(array, function(num) { return num % 2 == 0; });\n\
     *\n\
     * console.log(array);\n\
     * // => [1, 3, 5]\n\
     *\n\
     * console.log(evens);\n\
     * // => [2, 4, 6]\n\
     */\n\
    function remove(array, callback, thisArg) {\n\
      var index = -1,\n\
          length = array ? array.length : 0,\n\
          result = [];\n\
\n\
      callback = lodash.createCallback(callback, thisArg, 3);\n\
      while (++index < length) {\n\
        var value = array[index];\n\
        if (callback(value, index, array)) {\n\
          result.push(value);\n\
          splice.call(array, index--, 1);\n\
          length--;\n\
        }\n\
      }\n\
      return result;\n\
    }\n\
\n\
    /**\n\
     * The opposite of `_.initial` this method gets all but the first element or\n\
     * first `n` elements of an array. If a callback function is provided elements\n\
     * at the beginning of the array are excluded from the result as long as the\n\
     * callback returns truey. The callback is bound to `thisArg` and invoked\n\
     * with three arguments; (value, index, array).\n\
     *\n\
     * If a property name is provided for `callback` the created \"_.pluck\" style\n\
     * callback will return the property value of the given element.\n\
     *\n\
     * If an object is provided for `callback` the created \"_.where\" style callback\n\
     * will return `true` for elements that have the properties of the given object,\n\
     * else `false`.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @alias drop, tail\n\
     * @category Arrays\n\
     * @param {Array} array The array to query.\n\
     * @param {Function|Object|number|string} [callback=1] The function called\n\
     *  per element or the number of elements to exclude. If a property name or\n\
     *  object is provided it will be used to create a \"_.pluck\" or \"_.where\"\n\
     *  style callback, respectively.\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\n\
     * @returns {Array} Returns a slice of `array`.\n\
     * @example\n\
     *\n\
     * _.rest([1, 2, 3]);\n\
     * // => [2, 3]\n\
     *\n\
     * // excludes the first two elements\n\
     * _.rest([1, 2, 3], 2);\n\
     * // => [3]\n\
     *\n\
     * // excludes elements from the beginning until the callback fails\n\
     * _.rest([1, 2, 3], function(num) {\n\
     *   return num < 3;\n\
     * });\n\
     * // => [3]\n\
     *\n\
     * var characters = [\n\
     *   { 'name': 'barney',  'blocked': true,  'employer': 'slate' },\n\
     *   { 'name': 'fred',    'blocked': false,  'employer': 'slate' },\n\
     *   { 'name': 'pebbles', 'blocked': true, 'employer': 'na' }\n\
     * ];\n\
     *\n\
     * // using \"_.pluck\" callback shorthand\n\
     * _.pluck(_.rest(characters, 'blocked'), 'name');\n\
     * // => ['fred', 'pebbles']\n\
     *\n\
     * // using \"_.where\" callback shorthand\n\
     * _.rest(characters, { 'employer': 'slate' });\n\
     * // => [{ 'name': 'pebbles', 'blocked': true, 'employer': 'na' }]\n\
     */\n\
    function rest(array, callback, thisArg) {\n\
      if (typeof callback != 'number' && callback != null) {\n\
        var n = 0,\n\
            index = -1,\n\
            length = array ? array.length : 0;\n\
\n\
        callback = lodash.createCallback(callback, thisArg, 3);\n\
        while (++index < length && callback(array[index], index, array)) {\n\
          n++;\n\
        }\n\
      } else {\n\
        n = (callback == null || thisArg) ? 1 : nativeMax(0, callback);\n\
      }\n\
      return slice(array, n);\n\
    }\n\
\n\
    /**\n\
     * Uses a binary search to determine the smallest index at which a value\n\
     * should be inserted into a given sorted array in order to maintain the sort\n\
     * order of the array. If a callback is provided it will be executed for\n\
     * `value` and each element of `array` to compute their sort ranking. The\n\
     * callback is bound to `thisArg` and invoked with one argument; (value).\n\
     *\n\
     * If a property name is provided for `callback` the created \"_.pluck\" style\n\
     * callback will return the property value of the given element.\n\
     *\n\
     * If an object is provided for `callback` the created \"_.where\" style callback\n\
     * will return `true` for elements that have the properties of the given object,\n\
     * else `false`.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Arrays\n\
     * @param {Array} array The array to inspect.\n\
     * @param {*} value The value to evaluate.\n\
     * @param {Function|Object|string} [callback=identity] The function called\n\
     *  per iteration. If a property name or object is provided it will be used\n\
     *  to create a \"_.pluck\" or \"_.where\" style callback, respectively.\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\n\
     * @returns {number} Returns the index at which `value` should be inserted\n\
     *  into `array`.\n\
     * @example\n\
     *\n\
     * _.sortedIndex([20, 30, 50], 40);\n\
     * // => 2\n\
     *\n\
     * var dict = {\n\
     *   'wordToNumber': { 'twenty': 20, 'thirty': 30, 'fourty': 40, 'fifty': 50 }\n\
     * };\n\
     *\n\
     * // using `callback`\n\
     * _.sortedIndex(['twenty', 'thirty', 'fifty'], 'fourty', function(word) {\n\
     *   return dict.wordToNumber[word];\n\
     * });\n\
     * // => 2\n\
     *\n\
     * // using `callback` with `thisArg`\n\
     * _.sortedIndex(['twenty', 'thirty', 'fifty'], 'fourty', function(word) {\n\
     *   return this.wordToNumber[word];\n\
     * }, dict);\n\
     * // => 2\n\
     *\n\
     * // using \"_.pluck\" callback shorthand\n\
     * _.sortedIndex([{ 'x': 20 }, { 'x': 30 }, { 'x': 50 }], { 'x': 40 }, 'x');\n\
     * // => 2\n\
     */\n\
    function sortedIndex(array, value, callback, thisArg) {\n\
      var low = 0,\n\
          high = array ? array.length : low;\n\
\n\
      // explicitly reference `identity` for better inlining in Firefox\n\
      callback = callback ? lodash.createCallback(callback, thisArg, 1) : identity;\n\
      value = callback(value);\n\
\n\
      while (low < high) {\n\
        var mid = (low + high) >>> 1;\n\
        (callback(array[mid]) < value)\n\
          ? low = mid + 1\n\
          : high = mid;\n\
      }\n\
      return low;\n\
    }\n\
\n\
    /**\n\
     * Creates an array of unique values, in order, of the provided arrays using\n\
     * strict equality for comparisons, i.e. `===`.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Arrays\n\
     * @param {...Array} [array] The arrays to inspect.\n\
     * @returns {Array} Returns an array of combined values.\n\
     * @example\n\
     *\n\
     * _.union([1, 2, 3], [5, 2, 1, 4], [2, 1]);\n\
     * // => [1, 2, 3, 5, 4]\n\
     */\n\
    function union() {\n\
      return baseUniq(baseFlatten(arguments, true, true));\n\
    }\n\
\n\
    /**\n\
     * Creates a duplicate-value-free version of an array using strict equality\n\
     * for comparisons, i.e. `===`. If the array is sorted, providing\n\
     * `true` for `isSorted` will use a faster algorithm. If a callback is provided\n\
     * each element of `array` is passed through the callback before uniqueness\n\
     * is computed. The callback is bound to `thisArg` and invoked with three\n\
     * arguments; (value, index, array).\n\
     *\n\
     * If a property name is provided for `callback` the created \"_.pluck\" style\n\
     * callback will return the property value of the given element.\n\
     *\n\
     * If an object is provided for `callback` the created \"_.where\" style callback\n\
     * will return `true` for elements that have the properties of the given object,\n\
     * else `false`.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @alias unique\n\
     * @category Arrays\n\
     * @param {Array} array The array to process.\n\
     * @param {boolean} [isSorted=false] A flag to indicate that `array` is sorted.\n\
     * @param {Function|Object|string} [callback=identity] The function called\n\
     *  per iteration. If a property name or object is provided it will be used\n\
     *  to create a \"_.pluck\" or \"_.where\" style callback, respectively.\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\n\
     * @returns {Array} Returns a duplicate-value-free array.\n\
     * @example\n\
     *\n\
     * _.uniq([1, 2, 1, 3, 1]);\n\
     * // => [1, 2, 3]\n\
     *\n\
     * // using `isSorted`\n\
     * _.uniq([1, 1, 2, 2, 3], true);\n\
     * // => [1, 2, 3]\n\
     *\n\
     * // using `callback`\n\
     * _.uniq(['A', 'b', 'C', 'a', 'B', 'c'], function(letter) { return letter.toLowerCase(); });\n\
     * // => ['A', 'b', 'C']\n\
     *\n\
     * // using `callback` with `thisArg`\n\
     * _.uniq([1, 2.5, 3, 1.5, 2, 3.5], function(num) { return this.floor(num); }, Math);\n\
     * // => [1, 2.5, 3]\n\
     *\n\
     * // using \"_.pluck\" callback shorthand\n\
     * _.uniq([{ 'x': 1 }, { 'x': 2 }, { 'x': 1 }], 'x');\n\
     * // => [{ 'x': 1 }, { 'x': 2 }]\n\
     */\n\
    function uniq(array, isSorted, callback, thisArg) {\n\
      // juggle arguments\n\
      if (typeof isSorted != 'boolean' && isSorted != null) {\n\
        thisArg = callback;\n\
        callback = (typeof isSorted != 'function' && thisArg && thisArg[isSorted] === array) ? null : isSorted;\n\
        isSorted = false;\n\
      }\n\
      if (callback != null) {\n\
        callback = lodash.createCallback(callback, thisArg, 3);\n\
      }\n\
      return baseUniq(array, isSorted, callback);\n\
    }\n\
\n\
    /**\n\
     * Creates an array excluding all provided values using strict equality for\n\
     * comparisons, i.e. `===`.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Arrays\n\
     * @param {Array} array The array to filter.\n\
     * @param {...*} [value] The values to exclude.\n\
     * @returns {Array} Returns a new array of filtered values.\n\
     * @example\n\
     *\n\
     * _.without([1, 2, 1, 0, 3, 1, 4], 0, 1);\n\
     * // => [2, 3, 4]\n\
     */\n\
    function without(array) {\n\
      return baseDifference(array, slice(arguments, 1));\n\
    }\n\
\n\
    /**\n\
     * Creates an array that is the symmetric difference of the provided arrays.\n\
     * See http://en.wikipedia.org/wiki/Symmetric_difference.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Arrays\n\
     * @param {...Array} [array] The arrays to inspect.\n\
     * @returns {Array} Returns an array of values.\n\
     * @example\n\
     *\n\
     * _.xor([1, 2, 3], [5, 2, 1, 4]);\n\
     * // => [3, 5, 4]\n\
     *\n\
     * _.xor([1, 2, 5], [2, 3, 5], [3, 4, 5]);\n\
     * // => [1, 4, 5]\n\
     */\n\
    function xor() {\n\
      var index = -1,\n\
          length = arguments.length;\n\
\n\
      while (++index < length) {\n\
        var array = arguments[index];\n\
        if (isArray(array) || isArguments(array)) {\n\
          var result = result\n\
            ? baseUniq(baseDifference(result, array).concat(baseDifference(array, result)))\n\
            : array;\n\
        }\n\
      }\n\
      return result || [];\n\
    }\n\
\n\
    /**\n\
     * Creates an array of grouped elements, the first of which contains the\n\
     * first elements of the given arrays, the second of which contains the second\n\
     * elements of the given arrays, and so on. If a zipped value is provided its\n\
     * corresponding unzipped value will be returned.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @alias unzip\n\
     * @category Arrays\n\
     * @param {...Array} [array] Arrays to process.\n\
     * @returns {Array} Returns a new array of grouped elements.\n\
     * @example\n\
     *\n\
     * _.zip(['fred', 'barney'], [30, 40], [true, false]);\n\
     * // => [['fred', 30, true], ['barney', 40, false]]\n\
     *\n\
     * _.unzip([['fred', 30, true], ['barney', 40, false]]);\n\
     * // => [['fred', 'barney'], [30, 40], [true, false]]\n\
     */\n\
    function zip() {\n\
      var array = arguments.length > 1 ? arguments : arguments[0],\n\
          index = -1,\n\
          length = array ? max(pluck(array, 'length')) : 0,\n\
          result = Array(length < 0 ? 0 : length);\n\
\n\
      while (++index < length) {\n\
        result[index] = pluck(array, index);\n\
      }\n\
      return result;\n\
    }\n\
\n\
    /**\n\
     * Creates an object composed from arrays of `keys` and `values`. Provide\n\
     * either a single two dimensional array, i.e. `[[key1, value1], [key2, value2]]`\n\
     * or two arrays, one of `keys` and one of corresponding `values`.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @alias object\n\
     * @category Arrays\n\
     * @param {Array} keys The array of keys.\n\
     * @param {Array} [values=[]] The array of values.\n\
     * @returns {Object} Returns an object composed of the given keys and\n\
     *  corresponding values.\n\
     * @example\n\
     *\n\
     * _.zipObject(['fred', 'barney'], [30, 40]);\n\
     * // => { 'fred': 30, 'barney': 40 }\n\
     */\n\
    function zipObject(keys, values) {\n\
      var index = -1,\n\
          length = keys ? keys.length : 0,\n\
          result = {};\n\
\n\
      if (!values && length && !isArray(keys[0])) {\n\
        values = [];\n\
      }\n\
      while (++index < length) {\n\
        var key = keys[index];\n\
        if (values) {\n\
          result[key] = values[index];\n\
        } else if (key) {\n\
          result[key[0]] = key[1];\n\
        }\n\
      }\n\
      return result;\n\
    }\n\
\n\
    /*--------------------------------------------------------------------------*/\n\
\n\
    /**\n\
     * Creates a function that executes `func`, with  the `this` binding and\n\
     * arguments of the created function, only after being called `n` times.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Functions\n\
     * @param {number} n The number of times the function must be called before\n\
     *  `func` is executed.\n\
     * @param {Function} func The function to restrict.\n\
     * @returns {Function} Returns the new restricted function.\n\
     * @example\n\
     *\n\
     * var saves = ['profile', 'settings'];\n\
     *\n\
     * var done = _.after(saves.length, function() {\n\
     *   console.log('Done saving!');\n\
     * });\n\
     *\n\
     * _.forEach(saves, function(type) {\n\
     *   asyncSave({ 'type': type, 'complete': done });\n\
     * });\n\
     * // => logs 'Done saving!', after all saves have completed\n\
     */\n\
    function after(n, func) {\n\
      if (!isFunction(func)) {\n\
        throw new TypeError;\n\
      }\n\
      return function() {\n\
        if (--n < 1) {\n\
          return func.apply(this, arguments);\n\
        }\n\
      };\n\
    }\n\
\n\
    /**\n\
     * Creates a function that, when called, invokes `func` with the `this`\n\
     * binding of `thisArg` and prepends any additional `bind` arguments to those\n\
     * provided to the bound function.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Functions\n\
     * @param {Function} func The function to bind.\n\
     * @param {*} [thisArg] The `this` binding of `func`.\n\
     * @param {...*} [arg] Arguments to be partially applied.\n\
     * @returns {Function} Returns the new bound function.\n\
     * @example\n\
     *\n\
     * var func = function(greeting) {\n\
     *   return greeting + ' ' + this.name;\n\
     * };\n\
     *\n\
     * func = _.bind(func, { 'name': 'fred' }, 'hi');\n\
     * func();\n\
     * // => 'hi fred'\n\
     */\n\
    function bind(func, thisArg) {\n\
      return arguments.length > 2\n\
        ? createWrapper(func, 17, slice(arguments, 2), null, thisArg)\n\
        : createWrapper(func, 1, null, null, thisArg);\n\
    }\n\
\n\
    /**\n\
     * Binds methods of an object to the object itself, overwriting the existing\n\
     * method. Method names may be specified as individual arguments or as arrays\n\
     * of method names. If no method names are provided all the function properties\n\
     * of `object` will be bound.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Functions\n\
     * @param {Object} object The object to bind and assign the bound methods to.\n\
     * @param {...string} [methodName] The object method names to\n\
     *  bind, specified as individual method names or arrays of method names.\n\
     * @returns {Object} Returns `object`.\n\
     * @example\n\
     *\n\
     * var view = {\n\
     *   'label': 'docs',\n\
     *   'onClick': function() { console.log('clicked ' + this.label); }\n\
     * };\n\
     *\n\
     * _.bindAll(view);\n\
     * jQuery('#docs').on('click', view.onClick);\n\
     * // => logs 'clicked docs', when the button is clicked\n\
     */\n\
    function bindAll(object) {\n\
      var funcs = arguments.length > 1 ? baseFlatten(arguments, true, false, 1) : functions(object),\n\
          index = -1,\n\
          length = funcs.length;\n\
\n\
      while (++index < length) {\n\
        var key = funcs[index];\n\
        object[key] = createWrapper(object[key], 1, null, null, object);\n\
      }\n\
      return object;\n\
    }\n\
\n\
    /**\n\
     * Creates a function that, when called, invokes the method at `object[key]`\n\
     * and prepends any additional `bindKey` arguments to those provided to the bound\n\
     * function. This method differs from `_.bind` by allowing bound functions to\n\
     * reference methods that will be redefined or don't yet exist.\n\
     * See http://michaux.ca/articles/lazy-function-definition-pattern.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Functions\n\
     * @param {Object} object The object the method belongs to.\n\
     * @param {string} key The key of the method.\n\
     * @param {...*} [arg] Arguments to be partially applied.\n\
     * @returns {Function} Returns the new bound function.\n\
     * @example\n\
     *\n\
     * var object = {\n\
     *   'name': 'fred',\n\
     *   'greet': function(greeting) {\n\
     *     return greeting + ' ' + this.name;\n\
     *   }\n\
     * };\n\
     *\n\
     * var func = _.bindKey(object, 'greet', 'hi');\n\
     * func();\n\
     * // => 'hi fred'\n\
     *\n\
     * object.greet = function(greeting) {\n\
     *   return greeting + 'ya ' + this.name + '!';\n\
     * };\n\
     *\n\
     * func();\n\
     * // => 'hiya fred!'\n\
     */\n\
    function bindKey(object, key) {\n\
      return arguments.length > 2\n\
        ? createWrapper(key, 19, slice(arguments, 2), null, object)\n\
        : createWrapper(key, 3, null, null, object);\n\
    }\n\
\n\
    /**\n\
     * Creates a function that is the composition of the provided functions,\n\
     * where each function consumes the return value of the function that follows.\n\
     * For example, composing the functions `f()`, `g()`, and `h()` produces `f(g(h()))`.\n\
     * Each function is executed with the `this` binding of the composed function.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Functions\n\
     * @param {...Function} [func] Functions to compose.\n\
     * @returns {Function} Returns the new composed function.\n\
     * @example\n\
     *\n\
     * var realNameMap = {\n\
     *   'pebbles': 'penelope'\n\
     * };\n\
     *\n\
     * var format = function(name) {\n\
     *   name = realNameMap[name.toLowerCase()] || name;\n\
     *   return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();\n\
     * };\n\
     *\n\
     * var greet = function(formatted) {\n\
     *   return 'Hiya ' + formatted + '!';\n\
     * };\n\
     *\n\
     * var welcome = _.compose(greet, format);\n\
     * welcome('pebbles');\n\
     * // => 'Hiya Penelope!'\n\
     */\n\
    function compose() {\n\
      var funcs = arguments,\n\
          length = funcs.length;\n\
\n\
      while (length--) {\n\
        if (!isFunction(funcs[length])) {\n\
          throw new TypeError;\n\
        }\n\
      }\n\
      return function() {\n\
        var args = arguments,\n\
            length = funcs.length;\n\
\n\
        while (length--) {\n\
          args = [funcs[length].apply(this, args)];\n\
        }\n\
        return args[0];\n\
      };\n\
    }\n\
\n\
    /**\n\
     * Creates a function which accepts one or more arguments of `func` that when\n\
     * invoked either executes `func` returning its result, if all `func` arguments\n\
     * have been provided, or returns a function that accepts one or more of the\n\
     * remaining `func` arguments, and so on. The arity of `func` can be specified\n\
     * if `func.length` is not sufficient.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Functions\n\
     * @param {Function} func The function to curry.\n\
     * @param {number} [arity=func.length] The arity of `func`.\n\
     * @returns {Function} Returns the new curried function.\n\
     * @example\n\
     *\n\
     * var curried = _.curry(function(a, b, c) {\n\
     *   console.log(a + b + c);\n\
     * });\n\
     *\n\
     * curried(1)(2)(3);\n\
     * // => 6\n\
     *\n\
     * curried(1, 2)(3);\n\
     * // => 6\n\
     *\n\
     * curried(1, 2, 3);\n\
     * // => 6\n\
     */\n\
    function curry(func, arity) {\n\
      arity = typeof arity == 'number' ? arity : (+arity || func.length);\n\
      return createWrapper(func, 4, null, null, null, arity);\n\
    }\n\
\n\
    /**\n\
     * Creates a function that will delay the execution of `func` until after\n\
     * `wait` milliseconds have elapsed since the last time it was invoked.\n\
     * Provide an options object to indicate that `func` should be invoked on\n\
     * the leading and/or trailing edge of the `wait` timeout. Subsequent calls\n\
     * to the debounced function will return the result of the last `func` call.\n\
     *\n\
     * Note: If `leading` and `trailing` options are `true` `func` will be called\n\
     * on the trailing edge of the timeout only if the the debounced function is\n\
     * invoked more than once during the `wait` timeout.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Functions\n\
     * @param {Function} func The function to debounce.\n\
     * @param {number} wait The number of milliseconds to delay.\n\
     * @param {Object} [options] The options object.\n\
     * @param {boolean} [options.leading=false] Specify execution on the leading edge of the timeout.\n\
     * @param {number} [options.maxWait] The maximum time `func` is allowed to be delayed before it's called.\n\
     * @param {boolean} [options.trailing=true] Specify execution on the trailing edge of the timeout.\n\
     * @returns {Function} Returns the new debounced function.\n\
     * @example\n\
     *\n\
     * // avoid costly calculations while the window size is in flux\n\
     * var lazyLayout = _.debounce(calculateLayout, 150);\n\
     * jQuery(window).on('resize', lazyLayout);\n\
     *\n\
     * // execute `sendMail` when the click event is fired, debouncing subsequent calls\n\
     * jQuery('#postbox').on('click', _.debounce(sendMail, 300, {\n\
     *   'leading': true,\n\
     *   'trailing': false\n\
     * });\n\
     *\n\
     * // ensure `batchLog` is executed once after 1 second of debounced calls\n\
     * var source = new EventSource('/stream');\n\
     * source.addEventListener('message', _.debounce(batchLog, 250, {\n\
     *   'maxWait': 1000\n\
     * }, false);\n\
     */\n\
    function debounce(func, wait, options) {\n\
      var args,\n\
          maxTimeoutId,\n\
          result,\n\
          stamp,\n\
          thisArg,\n\
          timeoutId,\n\
          trailingCall,\n\
          lastCalled = 0,\n\
          maxWait = false,\n\
          trailing = true;\n\
\n\
      if (!isFunction(func)) {\n\
        throw new TypeError;\n\
      }\n\
      wait = nativeMax(0, wait) || 0;\n\
      if (options === true) {\n\
        var leading = true;\n\
        trailing = false;\n\
      } else if (isObject(options)) {\n\
        leading = options.leading;\n\
        maxWait = 'maxWait' in options && (nativeMax(wait, options.maxWait) || 0);\n\
        trailing = 'trailing' in options ? options.trailing : trailing;\n\
      }\n\
      var delayed = function() {\n\
        var remaining = wait - (now() - stamp);\n\
        if (remaining <= 0) {\n\
          if (maxTimeoutId) {\n\
            clearTimeout(maxTimeoutId);\n\
          }\n\
          var isCalled = trailingCall;\n\
          maxTimeoutId = timeoutId = trailingCall = undefined;\n\
          if (isCalled) {\n\
            lastCalled = now();\n\
            result = func.apply(thisArg, args);\n\
            if (!timeoutId && !maxTimeoutId) {\n\
              args = thisArg = null;\n\
            }\n\
          }\n\
        } else {\n\
          timeoutId = setTimeout(delayed, remaining);\n\
        }\n\
      };\n\
\n\
      var maxDelayed = function() {\n\
        if (timeoutId) {\n\
          clearTimeout(timeoutId);\n\
        }\n\
        maxTimeoutId = timeoutId = trailingCall = undefined;\n\
        if (trailing || (maxWait !== wait)) {\n\
          lastCalled = now();\n\
          result = func.apply(thisArg, args);\n\
          if (!timeoutId && !maxTimeoutId) {\n\
            args = thisArg = null;\n\
          }\n\
        }\n\
      };\n\
\n\
      return function() {\n\
        args = arguments;\n\
        stamp = now();\n\
        thisArg = this;\n\
        trailingCall = trailing && (timeoutId || !leading);\n\
\n\
        if (maxWait === false) {\n\
          var leadingCall = leading && !timeoutId;\n\
        } else {\n\
          if (!maxTimeoutId && !leading) {\n\
            lastCalled = stamp;\n\
          }\n\
          var remaining = maxWait - (stamp - lastCalled),\n\
              isCalled = remaining <= 0;\n\
\n\
          if (isCalled) {\n\
            if (maxTimeoutId) {\n\
              maxTimeoutId = clearTimeout(maxTimeoutId);\n\
            }\n\
            lastCalled = stamp;\n\
            result = func.apply(thisArg, args);\n\
          }\n\
          else if (!maxTimeoutId) {\n\
            maxTimeoutId = setTimeout(maxDelayed, remaining);\n\
          }\n\
        }\n\
        if (isCalled && timeoutId) {\n\
          timeoutId = clearTimeout(timeoutId);\n\
        }\n\
        else if (!timeoutId && wait !== maxWait) {\n\
          timeoutId = setTimeout(delayed, wait);\n\
        }\n\
        if (leadingCall) {\n\
          isCalled = true;\n\
          result = func.apply(thisArg, args);\n\
        }\n\
        if (isCalled && !timeoutId && !maxTimeoutId) {\n\
          args = thisArg = null;\n\
        }\n\
        return result;\n\
      };\n\
    }\n\
\n\
    /**\n\
     * Defers executing the `func` function until the current call stack has cleared.\n\
     * Additional arguments will be provided to `func` when it is invoked.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Functions\n\
     * @param {Function} func The function to defer.\n\
     * @param {...*} [arg] Arguments to invoke the function with.\n\
     * @returns {number} Returns the timer id.\n\
     * @example\n\
     *\n\
     * _.defer(function(text) { console.log(text); }, 'deferred');\n\
     * // logs 'deferred' after one or more milliseconds\n\
     */\n\
    function defer(func) {\n\
      if (!isFunction(func)) {\n\
        throw new TypeError;\n\
      }\n\
      var args = slice(arguments, 1);\n\
      return setTimeout(function() { func.apply(undefined, args); }, 1);\n\
    }\n\
\n\
    /**\n\
     * Executes the `func` function after `wait` milliseconds. Additional arguments\n\
     * will be provided to `func` when it is invoked.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Functions\n\
     * @param {Function} func The function to delay.\n\
     * @param {number} wait The number of milliseconds to delay execution.\n\
     * @param {...*} [arg] Arguments to invoke the function with.\n\
     * @returns {number} Returns the timer id.\n\
     * @example\n\
     *\n\
     * _.delay(function(text) { console.log(text); }, 1000, 'later');\n\
     * // => logs 'later' after one second\n\
     */\n\
    function delay(func, wait) {\n\
      if (!isFunction(func)) {\n\
        throw new TypeError;\n\
      }\n\
      var args = slice(arguments, 2);\n\
      return setTimeout(function() { func.apply(undefined, args); }, wait);\n\
    }\n\
\n\
    /**\n\
     * Creates a function that memoizes the result of `func`. If `resolver` is\n\
     * provided it will be used to determine the cache key for storing the result\n\
     * based on the arguments provided to the memoized function. By default, the\n\
     * first argument provided to the memoized function is used as the cache key.\n\
     * The `func` is executed with the `this` binding of the memoized function.\n\
     * The result cache is exposed as the `cache` property on the memoized function.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Functions\n\
     * @param {Function} func The function to have its output memoized.\n\
     * @param {Function} [resolver] A function used to resolve the cache key.\n\
     * @returns {Function} Returns the new memoizing function.\n\
     * @example\n\
     *\n\
     * var fibonacci = _.memoize(function(n) {\n\
     *   return n < 2 ? n : fibonacci(n - 1) + fibonacci(n - 2);\n\
     * });\n\
     *\n\
     * fibonacci(9)\n\
     * // => 34\n\
     *\n\
     * var data = {\n\
     *   'fred': { 'name': 'fred', 'age': 40 },\n\
     *   'pebbles': { 'name': 'pebbles', 'age': 1 }\n\
     * };\n\
     *\n\
     * // modifying the result cache\n\
     * var get = _.memoize(function(name) { return data[name]; }, _.identity);\n\
     * get('pebbles');\n\
     * // => { 'name': 'pebbles', 'age': 1 }\n\
     *\n\
     * get.cache.pebbles.name = 'penelope';\n\
     * get('pebbles');\n\
     * // => { 'name': 'penelope', 'age': 1 }\n\
     */\n\
    function memoize(func, resolver) {\n\
      if (!isFunction(func)) {\n\
        throw new TypeError;\n\
      }\n\
      var memoized = function() {\n\
        var cache = memoized.cache,\n\
            key = resolver ? resolver.apply(this, arguments) : keyPrefix + arguments[0];\n\
\n\
        return hasOwnProperty.call(cache, key)\n\
          ? cache[key]\n\
          : (cache[key] = func.apply(this, arguments));\n\
      }\n\
      memoized.cache = {};\n\
      return memoized;\n\
    }\n\
\n\
    /**\n\
     * Creates a function that is restricted to execute `func` once. Repeat calls to\n\
     * the function will return the value of the first call. The `func` is executed\n\
     * with the `this` binding of the created function.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Functions\n\
     * @param {Function} func The function to restrict.\n\
     * @returns {Function} Returns the new restricted function.\n\
     * @example\n\
     *\n\
     * var initialize = _.once(createApplication);\n\
     * initialize();\n\
     * initialize();\n\
     * // `initialize` executes `createApplication` once\n\
     */\n\
    function once(func) {\n\
      var ran,\n\
          result;\n\
\n\
      if (!isFunction(func)) {\n\
        throw new TypeError;\n\
      }\n\
      return function() {\n\
        if (ran) {\n\
          return result;\n\
        }\n\
        ran = true;\n\
        result = func.apply(this, arguments);\n\
\n\
        // clear the `func` variable so the function may be garbage collected\n\
        func = null;\n\
        return result;\n\
      };\n\
    }\n\
\n\
    /**\n\
     * Creates a function that, when called, invokes `func` with any additional\n\
     * `partial` arguments prepended to those provided to the new function. This\n\
     * method is similar to `_.bind` except it does **not** alter the `this` binding.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Functions\n\
     * @param {Function} func The function to partially apply arguments to.\n\
     * @param {...*} [arg] Arguments to be partially applied.\n\
     * @returns {Function} Returns the new partially applied function.\n\
     * @example\n\
     *\n\
     * var greet = function(greeting, name) { return greeting + ' ' + name; };\n\
     * var hi = _.partial(greet, 'hi');\n\
     * hi('fred');\n\
     * // => 'hi fred'\n\
     */\n\
    function partial(func) {\n\
      return createWrapper(func, 16, slice(arguments, 1));\n\
    }\n\
\n\
    /**\n\
     * This method is like `_.partial` except that `partial` arguments are\n\
     * appended to those provided to the new function.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Functions\n\
     * @param {Function} func The function to partially apply arguments to.\n\
     * @param {...*} [arg] Arguments to be partially applied.\n\
     * @returns {Function} Returns the new partially applied function.\n\
     * @example\n\
     *\n\
     * var defaultsDeep = _.partialRight(_.merge, _.defaults);\n\
     *\n\
     * var options = {\n\
     *   'variable': 'data',\n\
     *   'imports': { 'jq': $ }\n\
     * };\n\
     *\n\
     * defaultsDeep(options, _.templateSettings);\n\
     *\n\
     * options.variable\n\
     * // => 'data'\n\
     *\n\
     * options.imports\n\
     * // => { '_': _, 'jq': $ }\n\
     */\n\
    function partialRight(func) {\n\
      return createWrapper(func, 32, null, slice(arguments, 1));\n\
    }\n\
\n\
    /**\n\
     * Creates a function that, when executed, will only call the `func` function\n\
     * at most once per every `wait` milliseconds. Provide an options object to\n\
     * indicate that `func` should be invoked on the leading and/or trailing edge\n\
     * of the `wait` timeout. Subsequent calls to the throttled function will\n\
     * return the result of the last `func` call.\n\
     *\n\
     * Note: If `leading` and `trailing` options are `true` `func` will be called\n\
     * on the trailing edge of the timeout only if the the throttled function is\n\
     * invoked more than once during the `wait` timeout.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Functions\n\
     * @param {Function} func The function to throttle.\n\
     * @param {number} wait The number of milliseconds to throttle executions to.\n\
     * @param {Object} [options] The options object.\n\
     * @param {boolean} [options.leading=true] Specify execution on the leading edge of the timeout.\n\
     * @param {boolean} [options.trailing=true] Specify execution on the trailing edge of the timeout.\n\
     * @returns {Function} Returns the new throttled function.\n\
     * @example\n\
     *\n\
     * // avoid excessively updating the position while scrolling\n\
     * var throttled = _.throttle(updatePosition, 100);\n\
     * jQuery(window).on('scroll', throttled);\n\
     *\n\
     * // execute `renewToken` when the click event is fired, but not more than once every 5 minutes\n\
     * jQuery('.interactive').on('click', _.throttle(renewToken, 300000, {\n\
     *   'trailing': false\n\
     * }));\n\
     */\n\
    function throttle(func, wait, options) {\n\
      var leading = true,\n\
          trailing = true;\n\
\n\
      if (!isFunction(func)) {\n\
        throw new TypeError;\n\
      }\n\
      if (options === false) {\n\
        leading = false;\n\
      } else if (isObject(options)) {\n\
        leading = 'leading' in options ? options.leading : leading;\n\
        trailing = 'trailing' in options ? options.trailing : trailing;\n\
      }\n\
      debounceOptions.leading = leading;\n\
      debounceOptions.maxWait = wait;\n\
      debounceOptions.trailing = trailing;\n\
\n\
      return debounce(func, wait, debounceOptions);\n\
    }\n\
\n\
    /**\n\
     * Creates a function that provides `value` to the wrapper function as its\n\
     * first argument. Additional arguments provided to the function are appended\n\
     * to those provided to the wrapper function. The wrapper is executed with\n\
     * the `this` binding of the created function.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Functions\n\
     * @param {*} value The value to wrap.\n\
     * @param {Function} wrapper The wrapper function.\n\
     * @returns {Function} Returns the new function.\n\
     * @example\n\
     *\n\
     * var p = _.wrap(_.escape, function(func, text) {\n\
     *   return '<p>' + func(text) + '</p>';\n\
     * });\n\
     *\n\
     * p('Fred, Wilma, & Pebbles');\n\
     * // => '<p>Fred, Wilma, &amp; Pebbles</p>'\n\
     */\n\
    function wrap(value, wrapper) {\n\
      return createWrapper(wrapper, 16, [value]);\n\
    }\n\
\n\
    /*--------------------------------------------------------------------------*/\n\
\n\
    /**\n\
     * Creates a function that returns `value`.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Utilities\n\
     * @param {*} value The value to return from the new function.\n\
     * @returns {Function} Returns the new function.\n\
     * @example\n\
     *\n\
     * var object = { 'name': 'fred' };\n\
     * var getter = _.constant(object);\n\
     * getter() === object;\n\
     * // => true\n\
     */\n\
    function constant(value) {\n\
      return function() {\n\
        return value;\n\
      };\n\
    }\n\
\n\
    /**\n\
     * Produces a callback bound to an optional `thisArg`. If `func` is a property\n\
     * name the created callback will return the property value for a given element.\n\
     * If `func` is an object the created callback will return `true` for elements\n\
     * that contain the equivalent object properties, otherwise it will return `false`.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Utilities\n\
     * @param {*} [func=identity] The value to convert to a callback.\n\
     * @param {*} [thisArg] The `this` binding of the created callback.\n\
     * @param {number} [argCount] The number of arguments the callback accepts.\n\
     * @returns {Function} Returns a callback function.\n\
     * @example\n\
     *\n\
     * var characters = [\n\
     *   { 'name': 'barney', 'age': 36 },\n\
     *   { 'name': 'fred',   'age': 40 }\n\
     * ];\n\
     *\n\
     * // wrap to create custom callback shorthands\n\
     * _.createCallback = _.wrap(_.createCallback, function(func, callback, thisArg) {\n\
     *   var match = /^(.+?)__([gl]t)(.+)$/.exec(callback);\n\
     *   return !match ? func(callback, thisArg) : function(object) {\n\
     *     return match[2] == 'gt' ? object[match[1]] > match[3] : object[match[1]] < match[3];\n\
     *   };\n\
     * });\n\
     *\n\
     * _.filter(characters, 'age__gt38');\n\
     * // => [{ 'name': 'fred', 'age': 40 }]\n\
     */\n\
    function createCallback(func, thisArg, argCount) {\n\
      var type = typeof func;\n\
      if (func == null || type == 'function') {\n\
        return baseCreateCallback(func, thisArg, argCount);\n\
      }\n\
      // handle \"_.pluck\" style callback shorthands\n\
      if (type != 'object') {\n\
        return property(func);\n\
      }\n\
      var props = keys(func),\n\
          key = props[0],\n\
          a = func[key];\n\
\n\
      // handle \"_.where\" style callback shorthands\n\
      if (props.length == 1 && a === a && !isObject(a)) {\n\
        // fast path the common case of providing an object with a single\n\
        // property containing a primitive value\n\
        return function(object) {\n\
          var b = object[key];\n\
          return a === b && (a !== 0 || (1 / a == 1 / b));\n\
        };\n\
      }\n\
      return function(object) {\n\
        var length = props.length,\n\
            result = false;\n\
\n\
        while (length--) {\n\
          if (!(result = baseIsEqual(object[props[length]], func[props[length]], null, true))) {\n\
            break;\n\
          }\n\
        }\n\
        return result;\n\
      };\n\
    }\n\
\n\
    /**\n\
     * Converts the characters `&`, `<`, `>`, `\"`, and `'` in `string` to their\n\
     * corresponding HTML entities.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Utilities\n\
     * @param {string} string The string to escape.\n\
     * @returns {string} Returns the escaped string.\n\
     * @example\n\
     *\n\
     * _.escape('Fred, Wilma, & Pebbles');\n\
     * // => 'Fred, Wilma, &amp; Pebbles'\n\
     */\n\
    function escape(string) {\n\
      return string == null ? '' : String(string).replace(reUnescapedHtml, escapeHtmlChar);\n\
    }\n\
\n\
    /**\n\
     * This method returns the first argument provided to it.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Utilities\n\
     * @param {*} value Any value.\n\
     * @returns {*} Returns `value`.\n\
     * @example\n\
     *\n\
     * var object = { 'name': 'fred' };\n\
     * _.identity(object) === object;\n\
     * // => true\n\
     */\n\
    function identity(value) {\n\
      return value;\n\
    }\n\
\n\
    /**\n\
     * Adds function properties of a source object to the destination object.\n\
     * If `object` is a function methods will be added to its prototype as well.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Utilities\n\
     * @param {Function|Object} [object=lodash] object The destination object.\n\
     * @param {Object} source The object of functions to add.\n\
     * @param {Object} [options] The options object.\n\
     * @param {boolean} [options.chain=true] Specify whether the functions added are chainable.\n\
     * @example\n\
     *\n\
     * function capitalize(string) {\n\
     *   return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();\n\
     * }\n\
     *\n\
     * _.mixin({ 'capitalize': capitalize });\n\
     * _.capitalize('fred');\n\
     * // => 'Fred'\n\
     *\n\
     * _('fred').capitalize().value();\n\
     * // => 'Fred'\n\
     *\n\
     * _.mixin({ 'capitalize': capitalize }, { 'chain': false });\n\
     * _('fred').capitalize();\n\
     * // => 'Fred'\n\
     */\n\
    function mixin(object, source, options) {\n\
      var chain = true,\n\
          methodNames = source && functions(source);\n\
\n\
      if (!source || (!options && !methodNames.length)) {\n\
        if (options == null) {\n\
          options = source;\n\
        }\n\
        ctor = lodashWrapper;\n\
        source = object;\n\
        object = lodash;\n\
        methodNames = functions(source);\n\
      }\n\
      if (options === false) {\n\
        chain = false;\n\
      } else if (isObject(options) && 'chain' in options) {\n\
        chain = options.chain;\n\
      }\n\
      var ctor = object,\n\
          isFunc = isFunction(ctor);\n\
\n\
      forEach(methodNames, function(methodName) {\n\
        var func = object[methodName] = source[methodName];\n\
        if (isFunc) {\n\
          ctor.prototype[methodName] = function() {\n\
            var chainAll = this.__chain__,\n\
                value = this.__wrapped__,\n\
                args = [value];\n\
\n\
            push.apply(args, arguments);\n\
            var result = func.apply(object, args);\n\
            if (chain || chainAll) {\n\
              if (value === result && isObject(result)) {\n\
                return this;\n\
              }\n\
              result = new ctor(result);\n\
              result.__chain__ = chainAll;\n\
            }\n\
            return result;\n\
          };\n\
        }\n\
      });\n\
    }\n\
\n\
    /**\n\
     * Reverts the '_' variable to its previous value and returns a reference to\n\
     * the `lodash` function.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Utilities\n\
     * @returns {Function} Returns the `lodash` function.\n\
     * @example\n\
     *\n\
     * var lodash = _.noConflict();\n\
     */\n\
    function noConflict() {\n\
      context._ = oldDash;\n\
      return this;\n\
    }\n\
\n\
    /**\n\
     * A no-operation function.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Utilities\n\
     * @example\n\
     *\n\
     * var object = { 'name': 'fred' };\n\
     * _.noop(object) === undefined;\n\
     * // => true\n\
     */\n\
    function noop() {\n\
      // no operation performed\n\
    }\n\
\n\
    /**\n\
     * Gets the number of milliseconds that have elapsed since the Unix epoch\n\
     * (1 January 1970 00:00:00 UTC).\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Utilities\n\
     * @example\n\
     *\n\
     * var stamp = _.now();\n\
     * _.defer(function() { console.log(_.now() - stamp); });\n\
     * // => logs the number of milliseconds it took for the deferred function to be called\n\
     */\n\
    var now = isNative(now = Date.now) && now || function() {\n\
      return new Date().getTime();\n\
    };\n\
\n\
    /**\n\
     * Converts the given value into an integer of the specified radix.\n\
     * If `radix` is `undefined` or `0` a `radix` of `10` is used unless the\n\
     * `value` is a hexadecimal, in which case a `radix` of `16` is used.\n\
     *\n\
     * Note: This method avoids differences in native ES3 and ES5 `parseInt`\n\
     * implementations. See http://es5.github.io/#E.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Utilities\n\
     * @param {string} value The value to parse.\n\
     * @param {number} [radix] The radix used to interpret the value to parse.\n\
     * @returns {number} Returns the new integer value.\n\
     * @example\n\
     *\n\
     * _.parseInt('08');\n\
     * // => 8\n\
     */\n\
    var parseInt = nativeParseInt(whitespace + '08') == 8 ? nativeParseInt : function(value, radix) {\n\
      // Firefox < 21 and Opera < 15 follow the ES3 specified implementation of `parseInt`\n\
      return nativeParseInt(isString(value) ? value.replace(reLeadingSpacesAndZeros, '') : value, radix || 0);\n\
    };\n\
\n\
    /**\n\
     * Creates a \"_.pluck\" style function, which returns the `key` value of a\n\
     * given object.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Utilities\n\
     * @param {string} key The name of the property to retrieve.\n\
     * @returns {Function} Returns the new function.\n\
     * @example\n\
     *\n\
     * var characters = [\n\
     *   { 'name': 'fred',   'age': 40 },\n\
     *   { 'name': 'barney', 'age': 36 }\n\
     * ];\n\
     *\n\
     * var getName = _.property('name');\n\
     *\n\
     * _.map(characters, getName);\n\
     * // => ['barney', 'fred']\n\
     *\n\
     * _.sortBy(characters, getName);\n\
     * // => [{ 'name': 'barney', 'age': 36 }, { 'name': 'fred',   'age': 40 }]\n\
     */\n\
    function property(key) {\n\
      return function(object) {\n\
        return object[key];\n\
      };\n\
    }\n\
\n\
    /**\n\
     * Produces a random number between `min` and `max` (inclusive). If only one\n\
     * argument is provided a number between `0` and the given number will be\n\
     * returned. If `floating` is truey or either `min` or `max` are floats a\n\
     * floating-point number will be returned instead of an integer.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Utilities\n\
     * @param {number} [min=0] The minimum possible value.\n\
     * @param {number} [max=1] The maximum possible value.\n\
     * @param {boolean} [floating=false] Specify returning a floating-point number.\n\
     * @returns {number} Returns a random number.\n\
     * @example\n\
     *\n\
     * _.random(0, 5);\n\
     * // => an integer between 0 and 5\n\
     *\n\
     * _.random(5);\n\
     * // => also an integer between 0 and 5\n\
     *\n\
     * _.random(5, true);\n\
     * // => a floating-point number between 0 and 5\n\
     *\n\
     * _.random(1.2, 5.2);\n\
     * // => a floating-point number between 1.2 and 5.2\n\
     */\n\
    function random(min, max, floating) {\n\
      var noMin = min == null,\n\
          noMax = max == null;\n\
\n\
      if (floating == null) {\n\
        if (typeof min == 'boolean' && noMax) {\n\
          floating = min;\n\
          min = 1;\n\
        }\n\
        else if (!noMax && typeof max == 'boolean') {\n\
          floating = max;\n\
          noMax = true;\n\
        }\n\
      }\n\
      if (noMin && noMax) {\n\
        max = 1;\n\
      }\n\
      min = +min || 0;\n\
      if (noMax) {\n\
        max = min;\n\
        min = 0;\n\
      } else {\n\
        max = +max || 0;\n\
      }\n\
      if (floating || min % 1 || max % 1) {\n\
        var rand = nativeRandom();\n\
        return nativeMin(min + (rand * (max - min + parseFloat('1e-' + ((rand +'').length - 1)))), max);\n\
      }\n\
      return baseRandom(min, max);\n\
    }\n\
\n\
    /**\n\
     * Resolves the value of property `key` on `object`. If `key` is a function\n\
     * it will be invoked with the `this` binding of `object` and its result returned,\n\
     * else the property value is returned. If `object` is falsey then `undefined`\n\
     * is returned.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Utilities\n\
     * @param {Object} object The object to inspect.\n\
     * @param {string} key The name of the property to resolve.\n\
     * @returns {*} Returns the resolved value.\n\
     * @example\n\
     *\n\
     * var object = {\n\
     *   'cheese': 'crumpets',\n\
     *   'stuff': function() {\n\
     *     return 'nonsense';\n\
     *   }\n\
     * };\n\
     *\n\
     * _.result(object, 'cheese');\n\
     * // => 'crumpets'\n\
     *\n\
     * _.result(object, 'stuff');\n\
     * // => 'nonsense'\n\
     */\n\
    function result(object, key) {\n\
      if (object) {\n\
        var value = object[key];\n\
        return isFunction(value) ? object[key]() : value;\n\
      }\n\
    }\n\
\n\
    /**\n\
     * A micro-templating method that handles arbitrary delimiters, preserves\n\
     * whitespace, and correctly escapes quotes within interpolated code.\n\
     *\n\
     * Note: In the development build, `_.template` utilizes sourceURLs for easier\n\
     * debugging. See http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl\n\
     *\n\
     * For more information on precompiling templates see:\n\
     * http://lodash.com/custom-builds\n\
     *\n\
     * For more information on Chrome extension sandboxes see:\n\
     * http://developer.chrome.com/stable/extensions/sandboxingEval.html\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Utilities\n\
     * @param {string} text The template text.\n\
     * @param {Object} data The data object used to populate the text.\n\
     * @param {Object} [options] The options object.\n\
     * @param {RegExp} [options.escape] The \"escape\" delimiter.\n\
     * @param {RegExp} [options.evaluate] The \"evaluate\" delimiter.\n\
     * @param {Object} [options.imports] An object to import into the template as local variables.\n\
     * @param {RegExp} [options.interpolate] The \"interpolate\" delimiter.\n\
     * @param {string} [sourceURL] The sourceURL of the template's compiled source.\n\
     * @param {string} [variable] The data object variable name.\n\
     * @returns {Function|string} Returns a compiled function when no `data` object\n\
     *  is given, else it returns the interpolated text.\n\
     * @example\n\
     *\n\
     * // using the \"interpolate\" delimiter to create a compiled template\n\
     * var compiled = _.template('hello <%= name %>');\n\
     * compiled({ 'name': 'fred' });\n\
     * // => 'hello fred'\n\
     *\n\
     * // using the \"escape\" delimiter to escape HTML in data property values\n\
     * _.template('<b><%- value %></b>', { 'value': '<script>' });\n\
     * // => '<b>&lt;script&gt;</b>'\n\
     *\n\
     * // using the \"evaluate\" delimiter to generate HTML\n\
     * var list = '<% _.forEach(people, function(name) { %><li><%- name %></li><% }); %>';\n\
     * _.template(list, { 'people': ['fred', 'barney'] });\n\
     * // => '<li>fred</li><li>barney</li>'\n\
     *\n\
     * // using the ES6 delimiter as an alternative to the default \"interpolate\" delimiter\n\
     * _.template('hello ${ name }', { 'name': 'pebbles' });\n\
     * // => 'hello pebbles'\n\
     *\n\
     * // using the internal `print` function in \"evaluate\" delimiters\n\
     * _.template('<% print(\"hello \" + name); %>!', { 'name': 'barney' });\n\
     * // => 'hello barney!'\n\
     *\n\
     * // using a custom template delimiters\n\
     * _.templateSettings = {\n\
     *   'interpolate': /{{([\\s\\S]+?)}}/g\n\
     * };\n\
     *\n\
     * _.template('hello {{ name }}!', { 'name': 'mustache' });\n\
     * // => 'hello mustache!'\n\
     *\n\
     * // using the `imports` option to import jQuery\n\
     * var list = '<% jq.each(people, function(name) { %><li><%- name %></li><% }); %>';\n\
     * _.template(list, { 'people': ['fred', 'barney'] }, { 'imports': { 'jq': jQuery } });\n\
     * // => '<li>fred</li><li>barney</li>'\n\
     *\n\
     * // using the `sourceURL` option to specify a custom sourceURL for the template\n\
     * var compiled = _.template('hello <%= name %>', null, { 'sourceURL': '/basic/greeting.jst' });\n\
     * compiled(data);\n\
     * // => find the source of \"greeting.jst\" under the Sources tab or Resources panel of the web inspector\n\
     *\n\
     * // using the `variable` option to ensure a with-statement isn't used in the compiled template\n\
     * var compiled = _.template('hi <%= data.name %>!', null, { 'variable': 'data' });\n\
     * compiled.source;\n\
     * // => function(data) {\n\
     *   var __t, __p = '', __e = _.escape;\n\
     *   __p += 'hi ' + ((__t = ( data.name )) == null ? '' : __t) + '!';\n\
     *   return __p;\n\
     * }\n\
     *\n\
     * // using the `source` property to inline compiled templates for meaningful\n\
     * // line numbers in error messages and a stack trace\n\
     * fs.writeFileSync(path.join(cwd, 'jst.js'), '\\\n\
     *   var JST = {\\\n\
     *     \"main\": ' + _.template(mainText).source + '\\\n\
     *   };\\\n\
     * ');\n\
     */\n\
    function template(text, data, options) {\n\
      // based on John Resig's `tmpl` implementation\n\
      // http://ejohn.org/blog/javascript-micro-templating/\n\
      // and Laura Doktorova's doT.js\n\
      // https://github.com/olado/doT\n\
      var settings = lodash.templateSettings;\n\
      text = String(text || '');\n\
\n\
      // avoid missing dependencies when `iteratorTemplate` is not defined\n\
      options = defaults({}, options, settings);\n\
\n\
      var imports = defaults({}, options.imports, settings.imports),\n\
          importsKeys = keys(imports),\n\
          importsValues = values(imports);\n\
\n\
      var isEvaluating,\n\
          index = 0,\n\
          interpolate = options.interpolate || reNoMatch,\n\
          source = \"__p += '\";\n\
\n\
      // compile the regexp to match each delimiter\n\
      var reDelimiters = RegExp(\n\
        (options.escape || reNoMatch).source + '|' +\n\
        interpolate.source + '|' +\n\
        (interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + '|' +\n\
        (options.evaluate || reNoMatch).source + '|$'\n\
      , 'g');\n\
\n\
      text.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {\n\
        interpolateValue || (interpolateValue = esTemplateValue);\n\
\n\
        // escape characters that cannot be included in string literals\n\
        source += text.slice(index, offset).replace(reUnescapedString, escapeStringChar);\n\
\n\
        // replace delimiters with snippets\n\
        if (escapeValue) {\n\
          source += \"' +\\n\
__e(\" + escapeValue + \") +\\n\
'\";\n\
        }\n\
        if (evaluateValue) {\n\
          isEvaluating = true;\n\
          source += \"';\\n\
\" + evaluateValue + \";\\n\
__p += '\";\n\
        }\n\
        if (interpolateValue) {\n\
          source += \"' +\\n\
((__t = (\" + interpolateValue + \")) == null ? '' : __t) +\\n\
'\";\n\
        }\n\
        index = offset + match.length;\n\
\n\
        // the JS engine embedded in Adobe products requires returning the `match`\n\
        // string in order to produce the correct `offset` value\n\
        return match;\n\
      });\n\
\n\
      source += \"';\\n\
\";\n\
\n\
      // if `variable` is not specified, wrap a with-statement around the generated\n\
      // code to add the data object to the top of the scope chain\n\
      var variable = options.variable,\n\
          hasVariable = variable;\n\
\n\
      if (!hasVariable) {\n\
        variable = 'obj';\n\
        source = 'with (' + variable + ') {\\n\
' + source + '\\n\
}\\n\
';\n\
      }\n\
      // cleanup code by stripping empty strings\n\
      source = (isEvaluating ? source.replace(reEmptyStringLeading, '') : source)\n\
        .replace(reEmptyStringMiddle, '$1')\n\
        .replace(reEmptyStringTrailing, '$1;');\n\
\n\
      // frame code as the function body\n\
      source = 'function(' + variable + ') {\\n\
' +\n\
        (hasVariable ? '' : variable + ' || (' + variable + ' = {});\\n\
') +\n\
        \"var __t, __p = '', __e = _.escape\" +\n\
        (isEvaluating\n\
          ? ', __j = Array.prototype.join;\\n\
' +\n\
            \"function print() { __p += __j.call(arguments, '') }\\n\
\"\n\
          : ';\\n\
'\n\
        ) +\n\
        source +\n\
        'return __p\\n\
}';\n\
\n\
      // Use a sourceURL for easier debugging.\n\
      // http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl\n\
      var sourceURL = '\\n\
/*\\n\
//# sourceURL=' + (options.sourceURL || '/lodash/template/source[' + (templateCounter++) + ']') + '\\n\
*/';\n\
\n\
      try {\n\
        var result = Function(importsKeys, 'return ' + source + sourceURL).apply(undefined, importsValues);\n\
      } catch(e) {\n\
        e.source = source;\n\
        throw e;\n\
      }\n\
      if (data) {\n\
        return result(data);\n\
      }\n\
      // provide the compiled function's source by its `toString` method, in\n\
      // supported environments, or the `source` property as a convenience for\n\
      // inlining compiled templates during the build process\n\
      result.source = source;\n\
      return result;\n\
    }\n\
\n\
    /**\n\
     * Executes the callback `n` times, returning an array of the results\n\
     * of each callback execution. The callback is bound to `thisArg` and invoked\n\
     * with one argument; (index).\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Utilities\n\
     * @param {number} n The number of times to execute the callback.\n\
     * @param {Function} callback The function called per iteration.\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\n\
     * @returns {Array} Returns an array of the results of each `callback` execution.\n\
     * @example\n\
     *\n\
     * var diceRolls = _.times(3, _.partial(_.random, 1, 6));\n\
     * // => [3, 6, 4]\n\
     *\n\
     * _.times(3, function(n) { mage.castSpell(n); });\n\
     * // => calls `mage.castSpell(n)` three times, passing `n` of `0`, `1`, and `2` respectively\n\
     *\n\
     * _.times(3, function(n) { this.cast(n); }, mage);\n\
     * // => also calls `mage.castSpell(n)` three times\n\
     */\n\
    function times(n, callback, thisArg) {\n\
      n = (n = +n) > -1 ? n : 0;\n\
      var index = -1,\n\
          result = Array(n);\n\
\n\
      callback = baseCreateCallback(callback, thisArg, 1);\n\
      while (++index < n) {\n\
        result[index] = callback(index);\n\
      }\n\
      return result;\n\
    }\n\
\n\
    /**\n\
     * The inverse of `_.escape` this method converts the HTML entities\n\
     * `&amp;`, `&lt;`, `&gt;`, `&quot;`, and `&#39;` in `string` to their\n\
     * corresponding characters.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Utilities\n\
     * @param {string} string The string to unescape.\n\
     * @returns {string} Returns the unescaped string.\n\
     * @example\n\
     *\n\
     * _.unescape('Fred, Barney &amp; Pebbles');\n\
     * // => 'Fred, Barney & Pebbles'\n\
     */\n\
    function unescape(string) {\n\
      if (string == null) {\n\
        return '';\n\
      }\n\
      string = String(string);\n\
      return string.indexOf(';') < 0 ? string : string.replace(reEscapedHtml, unescapeHtmlChar);\n\
    }\n\
\n\
    /**\n\
     * Generates a unique ID. If `prefix` is provided the ID will be appended to it.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Utilities\n\
     * @param {string} [prefix] The value to prefix the ID with.\n\
     * @returns {string} Returns the unique ID.\n\
     * @example\n\
     *\n\
     * _.uniqueId('contact_');\n\
     * // => 'contact_104'\n\
     *\n\
     * _.uniqueId();\n\
     * // => '105'\n\
     */\n\
    function uniqueId(prefix) {\n\
      var id = ++idCounter;\n\
      return String(prefix == null ? '' : prefix) + id;\n\
    }\n\
\n\
    /*--------------------------------------------------------------------------*/\n\
\n\
    /**\n\
     * Creates a `lodash` object that wraps the given value with explicit\n\
     * method chaining enabled.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Chaining\n\
     * @param {*} value The value to wrap.\n\
     * @returns {Object} Returns the wrapper object.\n\
     * @example\n\
     *\n\
     * var characters = [\n\
     *   { 'name': 'barney',  'age': 36 },\n\
     *   { 'name': 'fred',    'age': 40 },\n\
     *   { 'name': 'pebbles', 'age': 1 }\n\
     * ];\n\
     *\n\
     * var youngest = _.chain(characters)\n\
     *     .sortBy('age')\n\
     *     .map(function(chr) { return chr.name + ' is ' + chr.age; })\n\
     *     .first()\n\
     *     .value();\n\
     * // => 'pebbles is 1'\n\
     */\n\
    function chain(value) {\n\
      value = new lodashWrapper(value);\n\
      value.__chain__ = true;\n\
      return value;\n\
    }\n\
\n\
    /**\n\
     * Invokes `interceptor` with the `value` as the first argument and then\n\
     * returns `value`. The purpose of this method is to \"tap into\" a method\n\
     * chain in order to perform operations on intermediate results within\n\
     * the chain.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @category Chaining\n\
     * @param {*} value The value to provide to `interceptor`.\n\
     * @param {Function} interceptor The function to invoke.\n\
     * @returns {*} Returns `value`.\n\
     * @example\n\
     *\n\
     * _([1, 2, 3, 4])\n\
     *  .tap(function(array) { array.pop(); })\n\
     *  .reverse()\n\
     *  .value();\n\
     * // => [3, 2, 1]\n\
     */\n\
    function tap(value, interceptor) {\n\
      interceptor(value);\n\
      return value;\n\
    }\n\
\n\
    /**\n\
     * Enables explicit method chaining on the wrapper object.\n\
     *\n\
     * @name chain\n\
     * @memberOf _\n\
     * @category Chaining\n\
     * @returns {*} Returns the wrapper object.\n\
     * @example\n\
     *\n\
     * var characters = [\n\
     *   { 'name': 'barney', 'age': 36 },\n\
     *   { 'name': 'fred',   'age': 40 }\n\
     * ];\n\
     *\n\
     * // without explicit chaining\n\
     * _(characters).first();\n\
     * // => { 'name': 'barney', 'age': 36 }\n\
     *\n\
     * // with explicit chaining\n\
     * _(characters).chain()\n\
     *   .first()\n\
     *   .pick('age')\n\
     *   .value();\n\
     * // => { 'age': 36 }\n\
     */\n\
    function wrapperChain() {\n\
      this.__chain__ = true;\n\
      return this;\n\
    }\n\
\n\
    /**\n\
     * Produces the `toString` result of the wrapped value.\n\
     *\n\
     * @name toString\n\
     * @memberOf _\n\
     * @category Chaining\n\
     * @returns {string} Returns the string result.\n\
     * @example\n\
     *\n\
     * _([1, 2, 3]).toString();\n\
     * // => '1,2,3'\n\
     */\n\
    function wrapperToString() {\n\
      return String(this.__wrapped__);\n\
    }\n\
\n\
    /**\n\
     * Extracts the wrapped value.\n\
     *\n\
     * @name valueOf\n\
     * @memberOf _\n\
     * @alias value\n\
     * @category Chaining\n\
     * @returns {*} Returns the wrapped value.\n\
     * @example\n\
     *\n\
     * _([1, 2, 3]).valueOf();\n\
     * // => [1, 2, 3]\n\
     */\n\
    function wrapperValueOf() {\n\
      return this.__wrapped__;\n\
    }\n\
\n\
    /*--------------------------------------------------------------------------*/\n\
\n\
    // add functions that return wrapped values when chaining\n\
    lodash.after = after;\n\
    lodash.assign = assign;\n\
    lodash.at = at;\n\
    lodash.bind = bind;\n\
    lodash.bindAll = bindAll;\n\
    lodash.bindKey = bindKey;\n\
    lodash.chain = chain;\n\
    lodash.compact = compact;\n\
    lodash.compose = compose;\n\
    lodash.constant = constant;\n\
    lodash.countBy = countBy;\n\
    lodash.create = create;\n\
    lodash.createCallback = createCallback;\n\
    lodash.curry = curry;\n\
    lodash.debounce = debounce;\n\
    lodash.defaults = defaults;\n\
    lodash.defer = defer;\n\
    lodash.delay = delay;\n\
    lodash.difference = difference;\n\
    lodash.filter = filter;\n\
    lodash.flatten = flatten;\n\
    lodash.forEach = forEach;\n\
    lodash.forEachRight = forEachRight;\n\
    lodash.forIn = forIn;\n\
    lodash.forInRight = forInRight;\n\
    lodash.forOwn = forOwn;\n\
    lodash.forOwnRight = forOwnRight;\n\
    lodash.functions = functions;\n\
    lodash.groupBy = groupBy;\n\
    lodash.indexBy = indexBy;\n\
    lodash.initial = initial;\n\
    lodash.intersection = intersection;\n\
    lodash.invert = invert;\n\
    lodash.invoke = invoke;\n\
    lodash.keys = keys;\n\
    lodash.map = map;\n\
    lodash.mapValues = mapValues;\n\
    lodash.max = max;\n\
    lodash.memoize = memoize;\n\
    lodash.merge = merge;\n\
    lodash.min = min;\n\
    lodash.omit = omit;\n\
    lodash.once = once;\n\
    lodash.pairs = pairs;\n\
    lodash.partial = partial;\n\
    lodash.partialRight = partialRight;\n\
    lodash.pick = pick;\n\
    lodash.pluck = pluck;\n\
    lodash.property = property;\n\
    lodash.pull = pull;\n\
    lodash.range = range;\n\
    lodash.reject = reject;\n\
    lodash.remove = remove;\n\
    lodash.rest = rest;\n\
    lodash.shuffle = shuffle;\n\
    lodash.sortBy = sortBy;\n\
    lodash.tap = tap;\n\
    lodash.throttle = throttle;\n\
    lodash.times = times;\n\
    lodash.toArray = toArray;\n\
    lodash.transform = transform;\n\
    lodash.union = union;\n\
    lodash.uniq = uniq;\n\
    lodash.values = values;\n\
    lodash.where = where;\n\
    lodash.without = without;\n\
    lodash.wrap = wrap;\n\
    lodash.xor = xor;\n\
    lodash.zip = zip;\n\
    lodash.zipObject = zipObject;\n\
\n\
    // add aliases\n\
    lodash.collect = map;\n\
    lodash.drop = rest;\n\
    lodash.each = forEach;\n\
    lodash.eachRight = forEachRight;\n\
    lodash.extend = assign;\n\
    lodash.methods = functions;\n\
    lodash.object = zipObject;\n\
    lodash.select = filter;\n\
    lodash.tail = rest;\n\
    lodash.unique = uniq;\n\
    lodash.unzip = zip;\n\
\n\
    // add functions to `lodash.prototype`\n\
    mixin(assign({}, lodash));\n\
\n\
    /*--------------------------------------------------------------------------*/\n\
\n\
    // add functions that return unwrapped values when chaining\n\
    lodash.clone = clone;\n\
    lodash.cloneDeep = cloneDeep;\n\
    lodash.contains = contains;\n\
    lodash.escape = escape;\n\
    lodash.every = every;\n\
    lodash.find = find;\n\
    lodash.findIndex = findIndex;\n\
    lodash.findKey = findKey;\n\
    lodash.findLast = findLast;\n\
    lodash.findLastIndex = findLastIndex;\n\
    lodash.findLastKey = findLastKey;\n\
    lodash.has = has;\n\
    lodash.identity = identity;\n\
    lodash.indexOf = indexOf;\n\
    lodash.isArguments = isArguments;\n\
    lodash.isArray = isArray;\n\
    lodash.isBoolean = isBoolean;\n\
    lodash.isDate = isDate;\n\
    lodash.isElement = isElement;\n\
    lodash.isEmpty = isEmpty;\n\
    lodash.isEqual = isEqual;\n\
    lodash.isFinite = isFinite;\n\
    lodash.isFunction = isFunction;\n\
    lodash.isNaN = isNaN;\n\
    lodash.isNull = isNull;\n\
    lodash.isNumber = isNumber;\n\
    lodash.isObject = isObject;\n\
    lodash.isPlainObject = isPlainObject;\n\
    lodash.isRegExp = isRegExp;\n\
    lodash.isString = isString;\n\
    lodash.isUndefined = isUndefined;\n\
    lodash.lastIndexOf = lastIndexOf;\n\
    lodash.mixin = mixin;\n\
    lodash.noConflict = noConflict;\n\
    lodash.noop = noop;\n\
    lodash.now = now;\n\
    lodash.parseInt = parseInt;\n\
    lodash.random = random;\n\
    lodash.reduce = reduce;\n\
    lodash.reduceRight = reduceRight;\n\
    lodash.result = result;\n\
    lodash.runInContext = runInContext;\n\
    lodash.size = size;\n\
    lodash.some = some;\n\
    lodash.sortedIndex = sortedIndex;\n\
    lodash.template = template;\n\
    lodash.unescape = unescape;\n\
    lodash.uniqueId = uniqueId;\n\
\n\
    // add aliases\n\
    lodash.all = every;\n\
    lodash.any = some;\n\
    lodash.detect = find;\n\
    lodash.findWhere = find;\n\
    lodash.foldl = reduce;\n\
    lodash.foldr = reduceRight;\n\
    lodash.include = contains;\n\
    lodash.inject = reduce;\n\
\n\
    mixin(function() {\n\
      var source = {}\n\
      forOwn(lodash, function(func, methodName) {\n\
        if (!lodash.prototype[methodName]) {\n\
          source[methodName] = func;\n\
        }\n\
      });\n\
      return source;\n\
    }(), false);\n\
\n\
    /*--------------------------------------------------------------------------*/\n\
\n\
    // add functions capable of returning wrapped and unwrapped values when chaining\n\
    lodash.first = first;\n\
    lodash.last = last;\n\
    lodash.sample = sample;\n\
\n\
    // add aliases\n\
    lodash.take = first;\n\
    lodash.head = first;\n\
\n\
    forOwn(lodash, function(func, methodName) {\n\
      var callbackable = methodName !== 'sample';\n\
      if (!lodash.prototype[methodName]) {\n\
        lodash.prototype[methodName]= function(n, guard) {\n\
          var chainAll = this.__chain__,\n\
              result = func(this.__wrapped__, n, guard);\n\
\n\
          return !chainAll && (n == null || (guard && !(callbackable && typeof n == 'function')))\n\
            ? result\n\
            : new lodashWrapper(result, chainAll);\n\
        };\n\
      }\n\
    });\n\
\n\
    /*--------------------------------------------------------------------------*/\n\
\n\
    /**\n\
     * The semantic version number.\n\
     *\n\
     * @static\n\
     * @memberOf _\n\
     * @type string\n\
     */\n\
    lodash.VERSION = '2.4.1';\n\
\n\
    // add \"Chaining\" functions to the wrapper\n\
    lodash.prototype.chain = wrapperChain;\n\
    lodash.prototype.toString = wrapperToString;\n\
    lodash.prototype.value = wrapperValueOf;\n\
    lodash.prototype.valueOf = wrapperValueOf;\n\
\n\
    // add `Array` functions that return unwrapped values\n\
    baseEach(['join', 'pop', 'shift'], function(methodName) {\n\
      var func = arrayRef[methodName];\n\
      lodash.prototype[methodName] = function() {\n\
        var chainAll = this.__chain__,\n\
            result = func.apply(this.__wrapped__, arguments);\n\
\n\
        return chainAll\n\
          ? new lodashWrapper(result, chainAll)\n\
          : result;\n\
      };\n\
    });\n\
\n\
    // add `Array` functions that return the existing wrapped value\n\
    baseEach(['push', 'reverse', 'sort', 'unshift'], function(methodName) {\n\
      var func = arrayRef[methodName];\n\
      lodash.prototype[methodName] = function() {\n\
        func.apply(this.__wrapped__, arguments);\n\
        return this;\n\
      };\n\
    });\n\
\n\
    // add `Array` functions that return new wrapped values\n\
    baseEach(['concat', 'slice', 'splice'], function(methodName) {\n\
      var func = arrayRef[methodName];\n\
      lodash.prototype[methodName] = function() {\n\
        return new lodashWrapper(func.apply(this.__wrapped__, arguments), this.__chain__);\n\
      };\n\
    });\n\
\n\
    // avoid array-like object bugs with `Array#shift` and `Array#splice`\n\
    // in IE < 9, Firefox < 10, Narwhal, and RingoJS\n\
    if (!support.spliceObjects) {\n\
      baseEach(['pop', 'shift', 'splice'], function(methodName) {\n\
        var func = arrayRef[methodName],\n\
            isSplice = methodName == 'splice';\n\
\n\
        lodash.prototype[methodName] = function() {\n\
          var chainAll = this.__chain__,\n\
              value = this.__wrapped__,\n\
              result = func.apply(value, arguments);\n\
\n\
          if (value.length === 0) {\n\
            delete value[0];\n\
          }\n\
          return (chainAll || isSplice)\n\
            ? new lodashWrapper(result, chainAll)\n\
            : result;\n\
        };\n\
      });\n\
    }\n\
\n\
    return lodash;\n\
  }\n\
\n\
  /*--------------------------------------------------------------------------*/\n\
\n\
  // expose Lo-Dash\n\
  var _ = runInContext();\n\
\n\
  // some AMD build optimizers like r.js check for condition patterns like the following:\n\
  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {\n\
    // Expose Lo-Dash to the global object even when an AMD loader is present in\n\
    // case Lo-Dash is loaded with a RequireJS shim config.\n\
    // See http://requirejs.org/docs/api.html#config-shim\n\
    root._ = _;\n\
\n\
    // define as an anonymous module so, through path mapping, it can be\n\
    // referenced as the \"underscore\" module\n\
    define(function() {\n\
      return _;\n\
    });\n\
  }\n\
  // check for `exports` after `define` in case a build optimizer adds an `exports` object\n\
  else if (freeExports && freeModule) {\n\
    // in Node.js or RingoJS\n\
    if (moduleExports) {\n\
      (freeModule.exports = _)._ = _;\n\
    }\n\
    // in Narwhal or Rhino -require\n\
    else {\n\
      freeExports._ = _;\n\
    }\n\
  }\n\
  else {\n\
    // in a browser or Rhino\n\
    root._ = _;\n\
  }\n\
}.call(this));\n\
//@ sourceURL=lodash-lodash/dist/lodash.compat.js"
));
require.register("notablemind-keys/index.js", Function("exports, require, module",
"\n\
var keyCodeNames = {\n\
  8:  'backspace',\n\
  9:  'tab',\n\
  13: 'return',\n\
  16: 'shift',\n\
  17: 'ctrl',\n\
  18: 'alt',\n\
  20: 'caps',\n\
  27: 'escape',\n\
  32: 'space',\n\
  33: 'page up',\n\
  34: 'page down',\n\
  35: 'end',\n\
  36: 'home',\n\
  37: 'left',\n\
  38: 'up',\n\
  39: 'right',\n\
  40: 'down',\n\
  45: 'insert',\n\
  46: 'delete',\n\
  91: 'meta'\n\
};\n\
\n\
var nameCodeKeys = {};\n\
Object.keys(keyCodeNames).forEach(function(name){\n\
  nameCodeKeys[keyCodeNames[name]] = name;\n\
});\n\
\n\
var keyname = function(e){\n\
  var b = keyCodeNames[e.keyCode] || String.fromCharCode(e.keyCode);\n\
  var name = b;\n\
  if (e.shiftKey && b !== 'shift') name = 'shift ' + name;\n\
  if (e.altKey && b !== 'alt') name = 'alt ' + name;\n\
  if (e.ctrlKey && b !== 'ctrl') name = 'ctrl ' + name;\n\
  if (e.metaKey && b !== 'meta') name = 'meta ' + name;\n\
  return name;\n\
};\n\
\n\
var keys = module.exports = function (config) {\n\
  var names = Object.keys(config);\n\
  for (var i=0; i<names.length; i++) {\n\
    if (names[i].indexOf('|') !== -1) {\n\
      var val = config[names[i]];\n\
      delete config[names[i]];\n\
      var parts = names[i].split('|');\n\
      for (var j=0; j<parts.length; j++) {\n\
        config[parts[j]] = val;\n\
      }\n\
    }\n\
  }\n\
  return function (e) {\n\
    var name = keyname(e);\n\
    if (config[name]) {\n\
      var res = config[name].call(this, e)\n\
      if (!res) {\n\
        e.preventDefault();\n\
        e.stopPropagation();\n\
        return false;\n\
      }\n\
      return res;\n\
    }\n\
  };\n\
};\n\
\n\
module.exports.normalize = function (value) {\n\
  var parts = value.split('|')\n\
    , normal = [];\n\
  for (var i=0; i<parts.length; i++) {\n\
    if (!parts[i].trim()) continue;\n\
    var one = normalize(parts[i]);\n\
    if (one.value) normal.push(one.value);\n\
    else normal.push(parts[i]);\n\
    if (one.error) {\n\
      return {error: one.error, value: normal.concat(parts.slice(i+1)).join('|')};\n\
    }\n\
  }\n\
  return {value: normal.join('|')};\n\
};\n\
\n\
/**\n\
 * name = a key\n\
 *\n\
 * If it's invalid: {error: message, [value: normalized]}\n\
 * If it's valid: {value: normalized}\n\
 */\n\
var normalize = function(name){\n\
  var parts = name.replace(/^\\s+/, '')\n\
                  .replace(/\\s+$/, '').toLowerCase().split(/\\s+/);\n\
  var mods = {ctrl:false, shift:false, alt:false, meta:false};\n\
  for (var i=0; i<parts.length - 1; i++) {\n\
    if (typeof mods[parts[i]] === 'undefined') {\n\
      // invalid modifiers\n\
      return {error: 'Unknown modifier'};\n\
    } else {\n\
      mods[parts[i]] = true;\n\
    }\n\
  }\n\
  var pre = [];\n\
  if (mods.meta)  pre.push('meta');\n\
  if (mods.ctrl)  pre.push('ctrl');\n\
  if (mods.alt)   pre.push('alt');\n\
  if (mods.shift) pre.push('shift');\n\
  pre.push('');\n\
  pre = pre.join(' ');\n\
  var main = parts[parts.length - 1];\n\
  if (!nameCodeKeys[main] && main.length > 1) {\n\
    // invalid final\n\
    return {error: 'Unknown key', value: pre + main};\n\
  }\n\
  if (!nameCodeKeys[main]) {\n\
    main = main.toUpperCase();\n\
  }\n\
  return {value: pre + main};\n\
};\n\
\n\
var serialize = function (name) {\n\
  var parts = name.replace(/^\\s+/, '')\n\
                  .replace(/\\s+$/, '').toLowerCase().split(/\\s+/);\n\
  var mods = {ctrlKey:false, shiftKey:false, altKey:false, metaKey:false};\n\
  for (var i=0; i<parts.length - 1; i++) {\n\
    if (typeof mods[parts[i] + 'Key'] === 'undefined') {\n\
      // invalid modifiers\n\
      return false;\n\
    } else {\n\
      mods[parts[i] + 'Key'] = true;\n\
    }\n\
  }\n\
  var main = parts[parts.length - 1];\n\
  if (!nameCodeKeys[main] && main.length > 1) {\n\
    // invalid final\n\
    return false;\n\
  }\n\
  if (nameCodeKeys[main]) {\n\
    mods.keyCode = nameCodeKeys[main];\n\
  } else {\n\
    mods.keyCode = main.charCodeAt(0);\n\
  }\n\
  return mods;\n\
};\n\
\n\
module.exports.serialize = serialize;\n\
module.exports.keyname = keyname;\n\
\n\
//@ sourceURL=notablemind-keys/index.js"
));
require.register("tags/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Require the given path.\n\
 *\n\
 * @param {String} path\n\
 * @return {Object} exports\n\
 * @api public\n\
 */\n\
\n\
function require(path, parent, orig) {\n\
  var resolved = require.resolve(path);\n\
\n\
  // lookup failed\n\
  if (null == resolved) {\n\
    orig = orig || path;\n\
    parent = parent || 'root';\n\
    var err = new Error('Failed to require \"' + orig + '\" from \"' + parent + '\"');\n\
    err.path = orig;\n\
    err.parent = parent;\n\
    err.require = true;\n\
    throw err;\n\
  }\n\
\n\
  var module = require.modules[resolved];\n\
\n\
  // perform real require()\n\
  // by invoking the module's\n\
  // registered function\n\
  if (!module._resolving && !module.exports) {\n\
    var mod = {};\n\
    mod.exports = {};\n\
    mod.client = mod.component = true;\n\
    module._resolving = true;\n\
    module.call(this, mod.exports, require.relative(resolved), mod);\n\
    delete module._resolving;\n\
    module.exports = mod.exports;\n\
  }\n\
\n\
  return module.exports;\n\
}\n\
\n\
/**\n\
 * Registered modules.\n\
 */\n\
\n\
require.modules = {};\n\
\n\
/**\n\
 * Registered aliases.\n\
 */\n\
\n\
require.aliases = {};\n\
\n\
/**\n\
 * Resolve `path`.\n\
 *\n\
 * Lookup:\n\
 *\n\
 *   - PATH/index.js\n\
 *   - PATH.js\n\
 *   - PATH\n\
 *\n\
 * @param {String} path\n\
 * @return {String} path or null\n\
 * @api private\n\
 */\n\
\n\
require.resolve = function(path) {\n\
  if (path.charAt(0) === '/') path = path.slice(1);\n\
\n\
  var paths = [\n\
    path,\n\
    path + '.js',\n\
    path + '.json',\n\
    path + '/index.js',\n\
    path + '/index.json'\n\
  ];\n\
\n\
  for (var i = 0; i < paths.length; i++) {\n\
    var path = paths[i];\n\
    if (require.modules.hasOwnProperty(path)) return path;\n\
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];\n\
  }\n\
};\n\
\n\
/**\n\
 * Normalize `path` relative to the current path.\n\
 *\n\
 * @param {String} curr\n\
 * @param {String} path\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
require.normalize = function(curr, path) {\n\
  var segs = [];\n\
\n\
  if ('.' != path.charAt(0)) return path;\n\
\n\
  curr = curr.split('/');\n\
  path = path.split('/');\n\
\n\
  for (var i = 0; i < path.length; ++i) {\n\
    if ('..' == path[i]) {\n\
      curr.pop();\n\
    } else if ('.' != path[i] && '' != path[i]) {\n\
      segs.push(path[i]);\n\
    }\n\
  }\n\
\n\
  return curr.concat(segs).join('/');\n\
};\n\
\n\
/**\n\
 * Register module at `path` with callback `definition`.\n\
 *\n\
 * @param {String} path\n\
 * @param {Function} definition\n\
 * @api private\n\
 */\n\
\n\
require.register = function(path, definition) {\n\
  require.modules[path] = definition;\n\
};\n\
\n\
/**\n\
 * Alias a module definition.\n\
 *\n\
 * @param {String} from\n\
 * @param {String} to\n\
 * @api private\n\
 */\n\
\n\
require.alias = function(from, to) {\n\
  if (!require.modules.hasOwnProperty(from)) {\n\
    throw new Error('Failed to alias \"' + from + '\", it does not exist');\n\
  }\n\
  require.aliases[to] = from;\n\
};\n\
\n\
/**\n\
 * Return a require function relative to the `parent` path.\n\
 *\n\
 * @param {String} parent\n\
 * @return {Function}\n\
 * @api private\n\
 */\n\
\n\
require.relative = function(parent) {\n\
  var p = require.normalize(parent, '..');\n\
\n\
  /**\n\
   * lastIndexOf helper.\n\
   */\n\
\n\
  function lastIndexOf(arr, obj) {\n\
    var i = arr.length;\n\
    while (i--) {\n\
      if (arr[i] === obj) return i;\n\
    }\n\
    return -1;\n\
  }\n\
\n\
  /**\n\
   * The relative require() itself.\n\
   */\n\
\n\
  function localRequire(path) {\n\
    var resolved = localRequire.resolve(path);\n\
    return require(resolved, parent, path);\n\
  }\n\
\n\
  /**\n\
   * Resolve relative to the parent.\n\
   */\n\
\n\
  localRequire.resolve = function(path) {\n\
    var c = path.charAt(0);\n\
    if ('/' == c) return path.slice(1);\n\
    if ('.' == c) return require.normalize(p, path);\n\
\n\
    // resolve deps by returning\n\
    // the dep in the nearest \"deps\"\n\
    // directory\n\
    var segs = parent.split('/');\n\
    var i = lastIndexOf(segs, 'deps') + 1;\n\
    if (!i) i = 0;\n\
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;\n\
    return path;\n\
  };\n\
\n\
  /**\n\
   * Check if module is defined at `path`.\n\
   */\n\
\n\
  localRequire.exists = function(path) {\n\
    return require.modules.hasOwnProperty(localRequire.resolve(path));\n\
  };\n\
\n\
  return localRequire;\n\
};\n\
require.register(\"lodash-lodash/index.js\", Function(\"exports, require, module\",\n\
\"module.exports = require('./dist/lodash.compat.js');//@ sourceURL=lodash-lodash/index.js\"\n\
));\n\
require.register(\"lodash-lodash/dist/lodash.compat.js\", Function(\"exports, require, module\",\n\
\"/**\\n\
\\\n\
 * @license\\n\
\\\n\
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>\\n\
\\\n\
 * Build: `lodash -o ./dist/lodash.compat.js`\\n\
\\\n\
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>\\n\
\\\n\
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>\\n\
\\\n\
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors\\n\
\\\n\
 * Available under MIT license <http://lodash.com/license>\\n\
\\\n\
 */\\n\
\\\n\
;(function() {\\n\
\\\n\
\\n\
\\\n\
  /** Used as a safe reference for `undefined` in pre ES5 environments */\\n\
\\\n\
  var undefined;\\n\
\\\n\
\\n\
\\\n\
  /** Used to pool arrays and objects used internally */\\n\
\\\n\
  var arrayPool = [],\\n\
\\\n\
      objectPool = [];\\n\
\\\n\
\\n\
\\\n\
  /** Used to generate unique IDs */\\n\
\\\n\
  var idCounter = 0;\\n\
\\\n\
\\n\
\\\n\
  /** Used internally to indicate various things */\\n\
\\\n\
  var indicatorObject = {};\\n\
\\\n\
\\n\
\\\n\
  /** Used to prefix keys to avoid issues with `__proto__` and properties on `Object.prototype` */\\n\
\\\n\
  var keyPrefix = +new Date + '';\\n\
\\\n\
\\n\
\\\n\
  /** Used as the size when optimizations are enabled for large arrays */\\n\
\\\n\
  var largeArraySize = 75;\\n\
\\\n\
\\n\
\\\n\
  /** Used as the max size of the `arrayPool` and `objectPool` */\\n\
\\\n\
  var maxPoolSize = 40;\\n\
\\\n\
\\n\
\\\n\
  /** Used to detect and test whitespace */\\n\
\\\n\
  var whitespace = (\\n\
\\\n\
    // whitespace\\n\
\\\n\
    ' \\\\t\\\\x0B\\\\f\\\\xA0\\\\ufeff' +\\n\
\\\n\
\\n\
\\\n\
    // line terminators\\n\
\\\n\
    '\\\\n\
\\\n\
\\\\r\\\\u2028\\\\u2029' +\\n\
\\\n\
\\n\
\\\n\
    // unicode category \\\"Zs\\\" space separators\\n\
\\\n\
    '\\\\u1680\\\\u180e\\\\u2000\\\\u2001\\\\u2002\\\\u2003\\\\u2004\\\\u2005\\\\u2006\\\\u2007\\\\u2008\\\\u2009\\\\u200a\\\\u202f\\\\u205f\\\\u3000'\\n\
\\\n\
  );\\n\
\\\n\
\\n\
\\\n\
  /** Used to match empty string literals in compiled template source */\\n\
\\\n\
  var reEmptyStringLeading = /\\\\b__p \\\\+= '';/g,\\n\
\\\n\
      reEmptyStringMiddle = /\\\\b(__p \\\\+=) '' \\\\+/g,\\n\
\\\n\
      reEmptyStringTrailing = /(__e\\\\(.*?\\\\)|\\\\b__t\\\\)) \\\\+\\\\n\
\\\n\
'';/g;\\n\
\\\n\
\\n\
\\\n\
  /**\\n\
\\\n\
   * Used to match ES6 template delimiters\\n\
\\\n\
   * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-literals-string-literals\\n\
\\\n\
   */\\n\
\\\n\
  var reEsTemplate = /\\\\$\\\\{([^\\\\\\\\}]*(?:\\\\\\\\.[^\\\\\\\\}]*)*)\\\\}/g;\\n\
\\\n\
\\n\
\\\n\
  /** Used to match regexp flags from their coerced string values */\\n\
\\\n\
  var reFlags = /\\\\w*$/;\\n\
\\\n\
\\n\
\\\n\
  /** Used to detected named functions */\\n\
\\\n\
  var reFuncName = /^\\\\s*function[ \\\\n\
\\\n\
\\\\r\\\\t]+\\\\w/;\\n\
\\\n\
\\n\
\\\n\
  /** Used to match \\\"interpolate\\\" template delimiters */\\n\
\\\n\
  var reInterpolate = /<%=([\\\\s\\\\S]+?)%>/g;\\n\
\\\n\
\\n\
\\\n\
  /** Used to match leading whitespace and zeros to be removed */\\n\
\\\n\
  var reLeadingSpacesAndZeros = RegExp('^[' + whitespace + ']*0+(?=.$)');\\n\
\\\n\
\\n\
\\\n\
  /** Used to ensure capturing order of template delimiters */\\n\
\\\n\
  var reNoMatch = /($^)/;\\n\
\\\n\
\\n\
\\\n\
  /** Used to detect functions containing a `this` reference */\\n\
\\\n\
  var reThis = /\\\\bthis\\\\b/;\\n\
\\\n\
\\n\
\\\n\
  /** Used to match unescaped characters in compiled string literals */\\n\
\\\n\
  var reUnescapedString = /['\\\\n\
\\\n\
\\\\r\\\\t\\\\u2028\\\\u2029\\\\\\\\]/g;\\n\
\\\n\
\\n\
\\\n\
  /** Used to assign default `context` object properties */\\n\
\\\n\
  var contextProps = [\\n\
\\\n\
    'Array', 'Boolean', 'Date', 'Error', 'Function', 'Math', 'Number', 'Object',\\n\
\\\n\
    'RegExp', 'String', '_', 'attachEvent', 'clearTimeout', 'isFinite', 'isNaN',\\n\
\\\n\
    'parseInt', 'setTimeout'\\n\
\\\n\
  ];\\n\
\\\n\
\\n\
\\\n\
  /** Used to fix the JScript [[DontEnum]] bug */\\n\
\\\n\
  var shadowedProps = [\\n\
\\\n\
    'constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable',\\n\
\\\n\
    'toLocaleString', 'toString', 'valueOf'\\n\
\\\n\
  ];\\n\
\\\n\
\\n\
\\\n\
  /** Used to make template sourceURLs easier to identify */\\n\
\\\n\
  var templateCounter = 0;\\n\
\\\n\
\\n\
\\\n\
  /** `Object#toString` result shortcuts */\\n\
\\\n\
  var argsClass = '[object Arguments]',\\n\
\\\n\
      arrayClass = '[object Array]',\\n\
\\\n\
      boolClass = '[object Boolean]',\\n\
\\\n\
      dateClass = '[object Date]',\\n\
\\\n\
      errorClass = '[object Error]',\\n\
\\\n\
      funcClass = '[object Function]',\\n\
\\\n\
      numberClass = '[object Number]',\\n\
\\\n\
      objectClass = '[object Object]',\\n\
\\\n\
      regexpClass = '[object RegExp]',\\n\
\\\n\
      stringClass = '[object String]';\\n\
\\\n\
\\n\
\\\n\
  /** Used to identify object classifications that `_.clone` supports */\\n\
\\\n\
  var cloneableClasses = {};\\n\
\\\n\
  cloneableClasses[funcClass] = false;\\n\
\\\n\
  cloneableClasses[argsClass] = cloneableClasses[arrayClass] =\\n\
\\\n\
  cloneableClasses[boolClass] = cloneableClasses[dateClass] =\\n\
\\\n\
  cloneableClasses[numberClass] = cloneableClasses[objectClass] =\\n\
\\\n\
  cloneableClasses[regexpClass] = cloneableClasses[stringClass] = true;\\n\
\\\n\
\\n\
\\\n\
  /** Used as an internal `_.debounce` options object */\\n\
\\\n\
  var debounceOptions = {\\n\
\\\n\
    'leading': false,\\n\
\\\n\
    'maxWait': 0,\\n\
\\\n\
    'trailing': false\\n\
\\\n\
  };\\n\
\\\n\
\\n\
\\\n\
  /** Used as the property descriptor for `__bindData__` */\\n\
\\\n\
  var descriptor = {\\n\
\\\n\
    'configurable': false,\\n\
\\\n\
    'enumerable': false,\\n\
\\\n\
    'value': null,\\n\
\\\n\
    'writable': false\\n\
\\\n\
  };\\n\
\\\n\
\\n\
\\\n\
  /** Used as the data object for `iteratorTemplate` */\\n\
\\\n\
  var iteratorData = {\\n\
\\\n\
    'args': '',\\n\
\\\n\
    'array': null,\\n\
\\\n\
    'bottom': '',\\n\
\\\n\
    'firstArg': '',\\n\
\\\n\
    'init': '',\\n\
\\\n\
    'keys': null,\\n\
\\\n\
    'loop': '',\\n\
\\\n\
    'shadowedProps': null,\\n\
\\\n\
    'support': null,\\n\
\\\n\
    'top': '',\\n\
\\\n\
    'useHas': false\\n\
\\\n\
  };\\n\
\\\n\
\\n\
\\\n\
  /** Used to determine if values are of the language type Object */\\n\
\\\n\
  var objectTypes = {\\n\
\\\n\
    'boolean': false,\\n\
\\\n\
    'function': true,\\n\
\\\n\
    'object': true,\\n\
\\\n\
    'number': false,\\n\
\\\n\
    'string': false,\\n\
\\\n\
    'undefined': false\\n\
\\\n\
  };\\n\
\\\n\
\\n\
\\\n\
  /** Used to escape characters for inclusion in compiled string literals */\\n\
\\\n\
  var stringEscapes = {\\n\
\\\n\
    '\\\\\\\\': '\\\\\\\\',\\n\
\\\n\
    \\\"'\\\": \\\"'\\\",\\n\
\\\n\
    '\\\\n\
\\\n\
': 'n',\\n\
\\\n\
    '\\\\r': 'r',\\n\
\\\n\
    '\\\\t': 't',\\n\
\\\n\
    '\\\\u2028': 'u2028',\\n\
\\\n\
    '\\\\u2029': 'u2029'\\n\
\\\n\
  };\\n\
\\\n\
\\n\
\\\n\
  /** Used as a reference to the global object */\\n\
\\\n\
  var root = (objectTypes[typeof window] && window) || this;\\n\
\\\n\
\\n\
\\\n\
  /** Detect free variable `exports` */\\n\
\\\n\
  var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;\\n\
\\\n\
\\n\
\\\n\
  /** Detect free variable `module` */\\n\
\\\n\
  var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;\\n\
\\\n\
\\n\
\\\n\
  /** Detect the popular CommonJS extension `module.exports` */\\n\
\\\n\
  var moduleExports = freeModule && freeModule.exports === freeExports && freeExports;\\n\
\\\n\
\\n\
\\\n\
  /** Detect free variable `global` from Node.js or Browserified code and use it as `root` */\\n\
\\\n\
  var freeGlobal = objectTypes[typeof global] && global;\\n\
\\\n\
  if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {\\n\
\\\n\
    root = freeGlobal;\\n\
\\\n\
  }\\n\
\\\n\
\\n\
\\\n\
  /*--------------------------------------------------------------------------*/\\n\
\\\n\
\\n\
\\\n\
  /**\\n\
\\\n\
   * The base implementation of `_.indexOf` without support for binary searches\\n\
\\\n\
   * or `fromIndex` constraints.\\n\
\\\n\
   *\\n\
\\\n\
   * @private\\n\
\\\n\
   * @param {Array} array The array to search.\\n\
\\\n\
   * @param {*} value The value to search for.\\n\
\\\n\
   * @param {number} [fromIndex=0] The index to search from.\\n\
\\\n\
   * @returns {number} Returns the index of the matched value or `-1`.\\n\
\\\n\
   */\\n\
\\\n\
  function baseIndexOf(array, value, fromIndex) {\\n\
\\\n\
    var index = (fromIndex || 0) - 1,\\n\
\\\n\
        length = array ? array.length : 0;\\n\
\\\n\
\\n\
\\\n\
    while (++index < length) {\\n\
\\\n\
      if (array[index] === value) {\\n\
\\\n\
        return index;\\n\
\\\n\
      }\\n\
\\\n\
    }\\n\
\\\n\
    return -1;\\n\
\\\n\
  }\\n\
\\\n\
\\n\
\\\n\
  /**\\n\
\\\n\
   * An implementation of `_.contains` for cache objects that mimics the return\\n\
\\\n\
   * signature of `_.indexOf` by returning `0` if the value is found, else `-1`.\\n\
\\\n\
   *\\n\
\\\n\
   * @private\\n\
\\\n\
   * @param {Object} cache The cache object to inspect.\\n\
\\\n\
   * @param {*} value The value to search for.\\n\
\\\n\
   * @returns {number} Returns `0` if `value` is found, else `-1`.\\n\
\\\n\
   */\\n\
\\\n\
  function cacheIndexOf(cache, value) {\\n\
\\\n\
    var type = typeof value;\\n\
\\\n\
    cache = cache.cache;\\n\
\\\n\
\\n\
\\\n\
    if (type == 'boolean' || value == null) {\\n\
\\\n\
      return cache[value] ? 0 : -1;\\n\
\\\n\
    }\\n\
\\\n\
    if (type != 'number' && type != 'string') {\\n\
\\\n\
      type = 'object';\\n\
\\\n\
    }\\n\
\\\n\
    var key = type == 'number' ? value : keyPrefix + value;\\n\
\\\n\
    cache = (cache = cache[type]) && cache[key];\\n\
\\\n\
\\n\
\\\n\
    return type == 'object'\\n\
\\\n\
      ? (cache && baseIndexOf(cache, value) > -1 ? 0 : -1)\\n\
\\\n\
      : (cache ? 0 : -1);\\n\
\\\n\
  }\\n\
\\\n\
\\n\
\\\n\
  /**\\n\
\\\n\
   * Adds a given value to the corresponding cache object.\\n\
\\\n\
   *\\n\
\\\n\
   * @private\\n\
\\\n\
   * @param {*} value The value to add to the cache.\\n\
\\\n\
   */\\n\
\\\n\
  function cachePush(value) {\\n\
\\\n\
    var cache = this.cache,\\n\
\\\n\
        type = typeof value;\\n\
\\\n\
\\n\
\\\n\
    if (type == 'boolean' || value == null) {\\n\
\\\n\
      cache[value] = true;\\n\
\\\n\
    } else {\\n\
\\\n\
      if (type != 'number' && type != 'string') {\\n\
\\\n\
        type = 'object';\\n\
\\\n\
      }\\n\
\\\n\
      var key = type == 'number' ? value : keyPrefix + value,\\n\
\\\n\
          typeCache = cache[type] || (cache[type] = {});\\n\
\\\n\
\\n\
\\\n\
      if (type == 'object') {\\n\
\\\n\
        (typeCache[key] || (typeCache[key] = [])).push(value);\\n\
\\\n\
      } else {\\n\
\\\n\
        typeCache[key] = true;\\n\
\\\n\
      }\\n\
\\\n\
    }\\n\
\\\n\
  }\\n\
\\\n\
\\n\
\\\n\
  /**\\n\
\\\n\
   * Used by `_.max` and `_.min` as the default callback when a given\\n\
\\\n\
   * collection is a string value.\\n\
\\\n\
   *\\n\
\\\n\
   * @private\\n\
\\\n\
   * @param {string} value The character to inspect.\\n\
\\\n\
   * @returns {number} Returns the code unit of given character.\\n\
\\\n\
   */\\n\
\\\n\
  function charAtCallback(value) {\\n\
\\\n\
    return value.charCodeAt(0);\\n\
\\\n\
  }\\n\
\\\n\
\\n\
\\\n\
  /**\\n\
\\\n\
   * Used by `sortBy` to compare transformed `collection` elements, stable sorting\\n\
\\\n\
   * them in ascending order.\\n\
\\\n\
   *\\n\
\\\n\
   * @private\\n\
\\\n\
   * @param {Object} a The object to compare to `b`.\\n\
\\\n\
   * @param {Object} b The object to compare to `a`.\\n\
\\\n\
   * @returns {number} Returns the sort order indicator of `1` or `-1`.\\n\
\\\n\
   */\\n\
\\\n\
  function compareAscending(a, b) {\\n\
\\\n\
    var ac = a.criteria,\\n\
\\\n\
        bc = b.criteria,\\n\
\\\n\
        index = -1,\\n\
\\\n\
        length = ac.length;\\n\
\\\n\
\\n\
\\\n\
    while (++index < length) {\\n\
\\\n\
      var value = ac[index],\\n\
\\\n\
          other = bc[index];\\n\
\\\n\
\\n\
\\\n\
      if (value !== other) {\\n\
\\\n\
        if (value > other || typeof value == 'undefined') {\\n\
\\\n\
          return 1;\\n\
\\\n\
        }\\n\
\\\n\
        if (value < other || typeof other == 'undefined') {\\n\
\\\n\
          return -1;\\n\
\\\n\
        }\\n\
\\\n\
      }\\n\
\\\n\
    }\\n\
\\\n\
    // Fixes an `Array#sort` bug in the JS engine embedded in Adobe applications\\n\
\\\n\
    // that causes it, under certain circumstances, to return the same value for\\n\
\\\n\
    // `a` and `b`. See https://github.com/jashkenas/underscore/pull/1247\\n\
\\\n\
    //\\n\
\\\n\
    // This also ensures a stable sort in V8 and other engines.\\n\
\\\n\
    // See http://code.google.com/p/v8/issues/detail?id=90\\n\
\\\n\
    return a.index - b.index;\\n\
\\\n\
  }\\n\
\\\n\
\\n\
\\\n\
  /**\\n\
\\\n\
   * Creates a cache object to optimize linear searches of large arrays.\\n\
\\\n\
   *\\n\
\\\n\
   * @private\\n\
\\\n\
   * @param {Array} [array=[]] The array to search.\\n\
\\\n\
   * @returns {null|Object} Returns the cache object or `null` if caching should not be used.\\n\
\\\n\
   */\\n\
\\\n\
  function createCache(array) {\\n\
\\\n\
    var index = -1,\\n\
\\\n\
        length = array.length,\\n\
\\\n\
        first = array[0],\\n\
\\\n\
        mid = array[(length / 2) | 0],\\n\
\\\n\
        last = array[length - 1];\\n\
\\\n\
\\n\
\\\n\
    if (first && typeof first == 'object' &&\\n\
\\\n\
        mid && typeof mid == 'object' && last && typeof last == 'object') {\\n\
\\\n\
      return false;\\n\
\\\n\
    }\\n\
\\\n\
    var cache = getObject();\\n\
\\\n\
    cache['false'] = cache['null'] = cache['true'] = cache['undefined'] = false;\\n\
\\\n\
\\n\
\\\n\
    var result = getObject();\\n\
\\\n\
    result.array = array;\\n\
\\\n\
    result.cache = cache;\\n\
\\\n\
    result.push = cachePush;\\n\
\\\n\
\\n\
\\\n\
    while (++index < length) {\\n\
\\\n\
      result.push(array[index]);\\n\
\\\n\
    }\\n\
\\\n\
    return result;\\n\
\\\n\
  }\\n\
\\\n\
\\n\
\\\n\
  /**\\n\
\\\n\
   * Used by `template` to escape characters for inclusion in compiled\\n\
\\\n\
   * string literals.\\n\
\\\n\
   *\\n\
\\\n\
   * @private\\n\
\\\n\
   * @param {string} match The matched character to escape.\\n\
\\\n\
   * @returns {string} Returns the escaped character.\\n\
\\\n\
   */\\n\
\\\n\
  function escapeStringChar(match) {\\n\
\\\n\
    return '\\\\\\\\' + stringEscapes[match];\\n\
\\\n\
  }\\n\
\\\n\
\\n\
\\\n\
  /**\\n\
\\\n\
   * Gets an array from the array pool or creates a new one if the pool is empty.\\n\
\\\n\
   *\\n\
\\\n\
   * @private\\n\
\\\n\
   * @returns {Array} The array from the pool.\\n\
\\\n\
   */\\n\
\\\n\
  function getArray() {\\n\
\\\n\
    return arrayPool.pop() || [];\\n\
\\\n\
  }\\n\
\\\n\
\\n\
\\\n\
  /**\\n\
\\\n\
   * Gets an object from the object pool or creates a new one if the pool is empty.\\n\
\\\n\
   *\\n\
\\\n\
   * @private\\n\
\\\n\
   * @returns {Object} The object from the pool.\\n\
\\\n\
   */\\n\
\\\n\
  function getObject() {\\n\
\\\n\
    return objectPool.pop() || {\\n\
\\\n\
      'array': null,\\n\
\\\n\
      'cache': null,\\n\
\\\n\
      'criteria': null,\\n\
\\\n\
      'false': false,\\n\
\\\n\
      'index': 0,\\n\
\\\n\
      'null': false,\\n\
\\\n\
      'number': null,\\n\
\\\n\
      'object': null,\\n\
\\\n\
      'push': null,\\n\
\\\n\
      'string': null,\\n\
\\\n\
      'true': false,\\n\
\\\n\
      'undefined': false,\\n\
\\\n\
      'value': null\\n\
\\\n\
    };\\n\
\\\n\
  }\\n\
\\\n\
\\n\
\\\n\
  /**\\n\
\\\n\
   * Checks if `value` is a DOM node in IE < 9.\\n\
\\\n\
   *\\n\
\\\n\
   * @private\\n\
\\\n\
   * @param {*} value The value to check.\\n\
\\\n\
   * @returns {boolean} Returns `true` if the `value` is a DOM node, else `false`.\\n\
\\\n\
   */\\n\
\\\n\
  function isNode(value) {\\n\
\\\n\
    // IE < 9 presents DOM nodes as `Object` objects except they have `toString`\\n\
\\\n\
    // methods that are `typeof` \\\"string\\\" and still can coerce nodes to strings\\n\
\\\n\
    return typeof value.toString != 'function' && typeof (value + '') == 'string';\\n\
\\\n\
  }\\n\
\\\n\
\\n\
\\\n\
  /**\\n\
\\\n\
   * Releases the given array back to the array pool.\\n\
\\\n\
   *\\n\
\\\n\
   * @private\\n\
\\\n\
   * @param {Array} [array] The array to release.\\n\
\\\n\
   */\\n\
\\\n\
  function releaseArray(array) {\\n\
\\\n\
    array.length = 0;\\n\
\\\n\
    if (arrayPool.length < maxPoolSize) {\\n\
\\\n\
      arrayPool.push(array);\\n\
\\\n\
    }\\n\
\\\n\
  }\\n\
\\\n\
\\n\
\\\n\
  /**\\n\
\\\n\
   * Releases the given object back to the object pool.\\n\
\\\n\
   *\\n\
\\\n\
   * @private\\n\
\\\n\
   * @param {Object} [object] The object to release.\\n\
\\\n\
   */\\n\
\\\n\
  function releaseObject(object) {\\n\
\\\n\
    var cache = object.cache;\\n\
\\\n\
    if (cache) {\\n\
\\\n\
      releaseObject(cache);\\n\
\\\n\
    }\\n\
\\\n\
    object.array = object.cache = object.criteria = object.object = object.number = object.string = object.value = null;\\n\
\\\n\
    if (objectPool.length < maxPoolSize) {\\n\
\\\n\
      objectPool.push(object);\\n\
\\\n\
    }\\n\
\\\n\
  }\\n\
\\\n\
\\n\
\\\n\
  /**\\n\
\\\n\
   * Slices the `collection` from the `start` index up to, but not including,\\n\
\\\n\
   * the `end` index.\\n\
\\\n\
   *\\n\
\\\n\
   * Note: This function is used instead of `Array#slice` to support node lists\\n\
\\\n\
   * in IE < 9 and to ensure dense arrays are returned.\\n\
\\\n\
   *\\n\
\\\n\
   * @private\\n\
\\\n\
   * @param {Array|Object|string} collection The collection to slice.\\n\
\\\n\
   * @param {number} start The start index.\\n\
\\\n\
   * @param {number} end The end index.\\n\
\\\n\
   * @returns {Array} Returns the new array.\\n\
\\\n\
   */\\n\
\\\n\
  function slice(array, start, end) {\\n\
\\\n\
    start || (start = 0);\\n\
\\\n\
    if (typeof end == 'undefined') {\\n\
\\\n\
      end = array ? array.length : 0;\\n\
\\\n\
    }\\n\
\\\n\
    var index = -1,\\n\
\\\n\
        length = end - start || 0,\\n\
\\\n\
        result = Array(length < 0 ? 0 : length);\\n\
\\\n\
\\n\
\\\n\
    while (++index < length) {\\n\
\\\n\
      result[index] = array[start + index];\\n\
\\\n\
    }\\n\
\\\n\
    return result;\\n\
\\\n\
  }\\n\
\\\n\
\\n\
\\\n\
  /*--------------------------------------------------------------------------*/\\n\
\\\n\
\\n\
\\\n\
  /**\\n\
\\\n\
   * Create a new `lodash` function using the given context object.\\n\
\\\n\
   *\\n\
\\\n\
   * @static\\n\
\\\n\
   * @memberOf _\\n\
\\\n\
   * @category Utilities\\n\
\\\n\
   * @param {Object} [context=root] The context object.\\n\
\\\n\
   * @returns {Function} Returns the `lodash` function.\\n\
\\\n\
   */\\n\
\\\n\
  function runInContext(context) {\\n\
\\\n\
    // Avoid issues with some ES3 environments that attempt to use values, named\\n\
\\\n\
    // after built-in constructors like `Object`, for the creation of literals.\\n\
\\\n\
    // ES5 clears this up by stating that literals must use built-in constructors.\\n\
\\\n\
    // See http://es5.github.io/#x11.1.5.\\n\
\\\n\
    context = context ? _.defaults(root.Object(), context, _.pick(root, contextProps)) : root;\\n\
\\\n\
\\n\
\\\n\
    /** Native constructor references */\\n\
\\\n\
    var Array = context.Array,\\n\
\\\n\
        Boolean = context.Boolean,\\n\
\\\n\
        Date = context.Date,\\n\
\\\n\
        Error = context.Error,\\n\
\\\n\
        Function = context.Function,\\n\
\\\n\
        Math = context.Math,\\n\
\\\n\
        Number = context.Number,\\n\
\\\n\
        Object = context.Object,\\n\
\\\n\
        RegExp = context.RegExp,\\n\
\\\n\
        String = context.String,\\n\
\\\n\
        TypeError = context.TypeError;\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Used for `Array` method references.\\n\
\\\n\
     *\\n\
\\\n\
     * Normally `Array.prototype` would suffice, however, using an array literal\\n\
\\\n\
     * avoids issues in Narwhal.\\n\
\\\n\
     */\\n\
\\\n\
    var arrayRef = [];\\n\
\\\n\
\\n\
\\\n\
    /** Used for native method references */\\n\
\\\n\
    var errorProto = Error.prototype,\\n\
\\\n\
        objectProto = Object.prototype,\\n\
\\\n\
        stringProto = String.prototype;\\n\
\\\n\
\\n\
\\\n\
    /** Used to restore the original `_` reference in `noConflict` */\\n\
\\\n\
    var oldDash = context._;\\n\
\\\n\
\\n\
\\\n\
    /** Used to resolve the internal [[Class]] of values */\\n\
\\\n\
    var toString = objectProto.toString;\\n\
\\\n\
\\n\
\\\n\
    /** Used to detect if a method is native */\\n\
\\\n\
    var reNative = RegExp('^' +\\n\
\\\n\
      String(toString)\\n\
\\\n\
        .replace(/[.*+?^${}()|[\\\\]\\\\\\\\]/g, '\\\\\\\\$&')\\n\
\\\n\
        .replace(/toString| for [^\\\\]]+/g, '.*?') + '$'\\n\
\\\n\
    );\\n\
\\\n\
\\n\
\\\n\
    /** Native method shortcuts */\\n\
\\\n\
    var ceil = Math.ceil,\\n\
\\\n\
        clearTimeout = context.clearTimeout,\\n\
\\\n\
        floor = Math.floor,\\n\
\\\n\
        fnToString = Function.prototype.toString,\\n\
\\\n\
        getPrototypeOf = isNative(getPrototypeOf = Object.getPrototypeOf) && getPrototypeOf,\\n\
\\\n\
        hasOwnProperty = objectProto.hasOwnProperty,\\n\
\\\n\
        push = arrayRef.push,\\n\
\\\n\
        propertyIsEnumerable = objectProto.propertyIsEnumerable,\\n\
\\\n\
        setTimeout = context.setTimeout,\\n\
\\\n\
        splice = arrayRef.splice,\\n\
\\\n\
        unshift = arrayRef.unshift;\\n\
\\\n\
\\n\
\\\n\
    /** Used to set meta data on functions */\\n\
\\\n\
    var defineProperty = (function() {\\n\
\\\n\
      // IE 8 only accepts DOM elements\\n\
\\\n\
      try {\\n\
\\\n\
        var o = {},\\n\
\\\n\
            func = isNative(func = Object.defineProperty) && func,\\n\
\\\n\
            result = func(o, o, o) && func;\\n\
\\\n\
      } catch(e) { }\\n\
\\\n\
      return result;\\n\
\\\n\
    }());\\n\
\\\n\
\\n\
\\\n\
    /* Native method shortcuts for methods with the same name as other `lodash` methods */\\n\
\\\n\
    var nativeCreate = isNative(nativeCreate = Object.create) && nativeCreate,\\n\
\\\n\
        nativeIsArray = isNative(nativeIsArray = Array.isArray) && nativeIsArray,\\n\
\\\n\
        nativeIsFinite = context.isFinite,\\n\
\\\n\
        nativeIsNaN = context.isNaN,\\n\
\\\n\
        nativeKeys = isNative(nativeKeys = Object.keys) && nativeKeys,\\n\
\\\n\
        nativeMax = Math.max,\\n\
\\\n\
        nativeMin = Math.min,\\n\
\\\n\
        nativeParseInt = context.parseInt,\\n\
\\\n\
        nativeRandom = Math.random;\\n\
\\\n\
\\n\
\\\n\
    /** Used to lookup a built-in constructor by [[Class]] */\\n\
\\\n\
    var ctorByClass = {};\\n\
\\\n\
    ctorByClass[arrayClass] = Array;\\n\
\\\n\
    ctorByClass[boolClass] = Boolean;\\n\
\\\n\
    ctorByClass[dateClass] = Date;\\n\
\\\n\
    ctorByClass[funcClass] = Function;\\n\
\\\n\
    ctorByClass[objectClass] = Object;\\n\
\\\n\
    ctorByClass[numberClass] = Number;\\n\
\\\n\
    ctorByClass[regexpClass] = RegExp;\\n\
\\\n\
    ctorByClass[stringClass] = String;\\n\
\\\n\
\\n\
\\\n\
    /** Used to avoid iterating non-enumerable properties in IE < 9 */\\n\
\\\n\
    var nonEnumProps = {};\\n\
\\\n\
    nonEnumProps[arrayClass] = nonEnumProps[dateClass] = nonEnumProps[numberClass] = { 'constructor': true, 'toLocaleString': true, 'toString': true, 'valueOf': true };\\n\
\\\n\
    nonEnumProps[boolClass] = nonEnumProps[stringClass] = { 'constructor': true, 'toString': true, 'valueOf': true };\\n\
\\\n\
    nonEnumProps[errorClass] = nonEnumProps[funcClass] = nonEnumProps[regexpClass] = { 'constructor': true, 'toString': true };\\n\
\\\n\
    nonEnumProps[objectClass] = { 'constructor': true };\\n\
\\\n\
\\n\
\\\n\
    (function() {\\n\
\\\n\
      var length = shadowedProps.length;\\n\
\\\n\
      while (length--) {\\n\
\\\n\
        var key = shadowedProps[length];\\n\
\\\n\
        for (var className in nonEnumProps) {\\n\
\\\n\
          if (hasOwnProperty.call(nonEnumProps, className) && !hasOwnProperty.call(nonEnumProps[className], key)) {\\n\
\\\n\
            nonEnumProps[className][key] = false;\\n\
\\\n\
          }\\n\
\\\n\
        }\\n\
\\\n\
      }\\n\
\\\n\
    }());\\n\
\\\n\
\\n\
\\\n\
    /*--------------------------------------------------------------------------*/\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Creates a `lodash` object which wraps the given value to enable intuitive\\n\
\\\n\
     * method chaining.\\n\
\\\n\
     *\\n\
\\\n\
     * In addition to Lo-Dash methods, wrappers also have the following `Array` methods:\\n\
\\\n\
     * `concat`, `join`, `pop`, `push`, `reverse`, `shift`, `slice`, `sort`, `splice`,\\n\
\\\n\
     * and `unshift`\\n\
\\\n\
     *\\n\
\\\n\
     * Chaining is supported in custom builds as long as the `value` method is\\n\
\\\n\
     * implicitly or explicitly included in the build.\\n\
\\\n\
     *\\n\
\\\n\
     * The chainable wrapper functions are:\\n\
\\\n\
     * `after`, `assign`, `bind`, `bindAll`, `bindKey`, `chain`, `compact`,\\n\
\\\n\
     * `compose`, `concat`, `countBy`, `create`, `createCallback`, `curry`,\\n\
\\\n\
     * `debounce`, `defaults`, `defer`, `delay`, `difference`, `filter`, `flatten`,\\n\
\\\n\
     * `forEach`, `forEachRight`, `forIn`, `forInRight`, `forOwn`, `forOwnRight`,\\n\
\\\n\
     * `functions`, `groupBy`, `indexBy`, `initial`, `intersection`, `invert`,\\n\
\\\n\
     * `invoke`, `keys`, `map`, `max`, `memoize`, `merge`, `min`, `object`, `omit`,\\n\
\\\n\
     * `once`, `pairs`, `partial`, `partialRight`, `pick`, `pluck`, `pull`, `push`,\\n\
\\\n\
     * `range`, `reject`, `remove`, `rest`, `reverse`, `shuffle`, `slice`, `sort`,\\n\
\\\n\
     * `sortBy`, `splice`, `tap`, `throttle`, `times`, `toArray`, `transform`,\\n\
\\\n\
     * `union`, `uniq`, `unshift`, `unzip`, `values`, `where`, `without`, `wrap`,\\n\
\\\n\
     * and `zip`\\n\
\\\n\
     *\\n\
\\\n\
     * The non-chainable wrapper functions are:\\n\
\\\n\
     * `clone`, `cloneDeep`, `contains`, `escape`, `every`, `find`, `findIndex`,\\n\
\\\n\
     * `findKey`, `findLast`, `findLastIndex`, `findLastKey`, `has`, `identity`,\\n\
\\\n\
     * `indexOf`, `isArguments`, `isArray`, `isBoolean`, `isDate`, `isElement`,\\n\
\\\n\
     * `isEmpty`, `isEqual`, `isFinite`, `isFunction`, `isNaN`, `isNull`, `isNumber`,\\n\
\\\n\
     * `isObject`, `isPlainObject`, `isRegExp`, `isString`, `isUndefined`, `join`,\\n\
\\\n\
     * `lastIndexOf`, `mixin`, `noConflict`, `parseInt`, `pop`, `random`, `reduce`,\\n\
\\\n\
     * `reduceRight`, `result`, `shift`, `size`, `some`, `sortedIndex`, `runInContext`,\\n\
\\\n\
     * `template`, `unescape`, `uniqueId`, and `value`\\n\
\\\n\
     *\\n\
\\\n\
     * The wrapper functions `first` and `last` return wrapped values when `n` is\\n\
\\\n\
     * provided, otherwise they return unwrapped values.\\n\
\\\n\
     *\\n\
\\\n\
     * Explicit chaining can be enabled by using the `_.chain` method.\\n\
\\\n\
     *\\n\
\\\n\
     * @name _\\n\
\\\n\
     * @constructor\\n\
\\\n\
     * @category Chaining\\n\
\\\n\
     * @param {*} value The value to wrap in a `lodash` instance.\\n\
\\\n\
     * @returns {Object} Returns a `lodash` instance.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * var wrapped = _([1, 2, 3]);\\n\
\\\n\
     *\\n\
\\\n\
     * // returns an unwrapped value\\n\
\\\n\
     * wrapped.reduce(function(sum, num) {\\n\
\\\n\
     *   return sum + num;\\n\
\\\n\
     * });\\n\
\\\n\
     * // => 6\\n\
\\\n\
     *\\n\
\\\n\
     * // returns a wrapped value\\n\
\\\n\
     * var squares = wrapped.map(function(num) {\\n\
\\\n\
     *   return num * num;\\n\
\\\n\
     * });\\n\
\\\n\
     *\\n\
\\\n\
     * _.isArray(squares);\\n\
\\\n\
     * // => false\\n\
\\\n\
     *\\n\
\\\n\
     * _.isArray(squares.value());\\n\
\\\n\
     * // => true\\n\
\\\n\
     */\\n\
\\\n\
    function lodash(value) {\\n\
\\\n\
      // don't wrap if already wrapped, even if wrapped by a different `lodash` constructor\\n\
\\\n\
      return (value && typeof value == 'object' && !isArray(value) && hasOwnProperty.call(value, '__wrapped__'))\\n\
\\\n\
       ? value\\n\
\\\n\
       : new lodashWrapper(value);\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * A fast path for creating `lodash` wrapper objects.\\n\
\\\n\
     *\\n\
\\\n\
     * @private\\n\
\\\n\
     * @param {*} value The value to wrap in a `lodash` instance.\\n\
\\\n\
     * @param {boolean} chainAll A flag to enable chaining for all methods\\n\
\\\n\
     * @returns {Object} Returns a `lodash` instance.\\n\
\\\n\
     */\\n\
\\\n\
    function lodashWrapper(value, chainAll) {\\n\
\\\n\
      this.__chain__ = !!chainAll;\\n\
\\\n\
      this.__wrapped__ = value;\\n\
\\\n\
    }\\n\
\\\n\
    // ensure `new lodashWrapper` is an instance of `lodash`\\n\
\\\n\
    lodashWrapper.prototype = lodash.prototype;\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * An object used to flag environments features.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @type Object\\n\
\\\n\
     */\\n\
\\\n\
    var support = lodash.support = {};\\n\
\\\n\
\\n\
\\\n\
    (function() {\\n\
\\\n\
      var ctor = function() { this.x = 1; },\\n\
\\\n\
          object = { '0': 1, 'length': 1 },\\n\
\\\n\
          props = [];\\n\
\\\n\
\\n\
\\\n\
      ctor.prototype = { 'valueOf': 1, 'y': 1 };\\n\
\\\n\
      for (var key in new ctor) { props.push(key); }\\n\
\\\n\
      for (key in arguments) { }\\n\
\\\n\
\\n\
\\\n\
      /**\\n\
\\\n\
       * Detect if an `arguments` object's [[Class]] is resolvable (all but Firefox < 4, IE < 9).\\n\
\\\n\
       *\\n\
\\\n\
       * @memberOf _.support\\n\
\\\n\
       * @type boolean\\n\
\\\n\
       */\\n\
\\\n\
      support.argsClass = toString.call(arguments) == argsClass;\\n\
\\\n\
\\n\
\\\n\
      /**\\n\
\\\n\
       * Detect if `arguments` objects are `Object` objects (all but Narwhal and Opera < 10.5).\\n\
\\\n\
       *\\n\
\\\n\
       * @memberOf _.support\\n\
\\\n\
       * @type boolean\\n\
\\\n\
       */\\n\
\\\n\
      support.argsObject = arguments.constructor == Object && !(arguments instanceof Array);\\n\
\\\n\
\\n\
\\\n\
      /**\\n\
\\\n\
       * Detect if `name` or `message` properties of `Error.prototype` are\\n\
\\\n\
       * enumerable by default. (IE < 9, Safari < 5.1)\\n\
\\\n\
       *\\n\
\\\n\
       * @memberOf _.support\\n\
\\\n\
       * @type boolean\\n\
\\\n\
       */\\n\
\\\n\
      support.enumErrorProps = propertyIsEnumerable.call(errorProto, 'message') || propertyIsEnumerable.call(errorProto, 'name');\\n\
\\\n\
\\n\
\\\n\
      /**\\n\
\\\n\
       * Detect if `prototype` properties are enumerable by default.\\n\
\\\n\
       *\\n\
\\\n\
       * Firefox < 3.6, Opera > 9.50 - Opera < 11.60, and Safari < 5.1\\n\
\\\n\
       * (if the prototype or a property on the prototype has been set)\\n\
\\\n\
       * incorrectly sets a function's `prototype` property [[Enumerable]]\\n\
\\\n\
       * value to `true`.\\n\
\\\n\
       *\\n\
\\\n\
       * @memberOf _.support\\n\
\\\n\
       * @type boolean\\n\
\\\n\
       */\\n\
\\\n\
      support.enumPrototypes = propertyIsEnumerable.call(ctor, 'prototype');\\n\
\\\n\
\\n\
\\\n\
      /**\\n\
\\\n\
       * Detect if functions can be decompiled by `Function#toString`\\n\
\\\n\
       * (all but PS3 and older Opera mobile browsers & avoided in Windows 8 apps).\\n\
\\\n\
       *\\n\
\\\n\
       * @memberOf _.support\\n\
\\\n\
       * @type boolean\\n\
\\\n\
       */\\n\
\\\n\
      support.funcDecomp = !isNative(context.WinRTError) && reThis.test(runInContext);\\n\
\\\n\
\\n\
\\\n\
      /**\\n\
\\\n\
       * Detect if `Function#name` is supported (all but IE).\\n\
\\\n\
       *\\n\
\\\n\
       * @memberOf _.support\\n\
\\\n\
       * @type boolean\\n\
\\\n\
       */\\n\
\\\n\
      support.funcNames = typeof Function.name == 'string';\\n\
\\\n\
\\n\
\\\n\
      /**\\n\
\\\n\
       * Detect if `arguments` object indexes are non-enumerable\\n\
\\\n\
       * (Firefox < 4, IE < 9, PhantomJS, Safari < 5.1).\\n\
\\\n\
       *\\n\
\\\n\
       * @memberOf _.support\\n\
\\\n\
       * @type boolean\\n\
\\\n\
       */\\n\
\\\n\
      support.nonEnumArgs = key != 0;\\n\
\\\n\
\\n\
\\\n\
      /**\\n\
\\\n\
       * Detect if properties shadowing those on `Object.prototype` are non-enumerable.\\n\
\\\n\
       *\\n\
\\\n\
       * In IE < 9 an objects own properties, shadowing non-enumerable ones, are\\n\
\\\n\
       * made non-enumerable as well (a.k.a the JScript [[DontEnum]] bug).\\n\
\\\n\
       *\\n\
\\\n\
       * @memberOf _.support\\n\
\\\n\
       * @type boolean\\n\
\\\n\
       */\\n\
\\\n\
      support.nonEnumShadows = !/valueOf/.test(props);\\n\
\\\n\
\\n\
\\\n\
      /**\\n\
\\\n\
       * Detect if own properties are iterated after inherited properties (all but IE < 9).\\n\
\\\n\
       *\\n\
\\\n\
       * @memberOf _.support\\n\
\\\n\
       * @type boolean\\n\
\\\n\
       */\\n\
\\\n\
      support.ownLast = props[0] != 'x';\\n\
\\\n\
\\n\
\\\n\
      /**\\n\
\\\n\
       * Detect if `Array#shift` and `Array#splice` augment array-like objects correctly.\\n\
\\\n\
       *\\n\
\\\n\
       * Firefox < 10, IE compatibility mode, and IE < 9 have buggy Array `shift()`\\n\
\\\n\
       * and `splice()` functions that fail to remove the last element, `value[0]`,\\n\
\\\n\
       * of array-like objects even though the `length` property is set to `0`.\\n\
\\\n\
       * The `shift()` method is buggy in IE 8 compatibility mode, while `splice()`\\n\
\\\n\
       * is buggy regardless of mode in IE < 9 and buggy in compatibility mode in IE 9.\\n\
\\\n\
       *\\n\
\\\n\
       * @memberOf _.support\\n\
\\\n\
       * @type boolean\\n\
\\\n\
       */\\n\
\\\n\
      support.spliceObjects = (arrayRef.splice.call(object, 0, 1), !object[0]);\\n\
\\\n\
\\n\
\\\n\
      /**\\n\
\\\n\
       * Detect lack of support for accessing string characters by index.\\n\
\\\n\
       *\\n\
\\\n\
       * IE < 8 can't access characters by index and IE 8 can only access\\n\
\\\n\
       * characters by index on string literals.\\n\
\\\n\
       *\\n\
\\\n\
       * @memberOf _.support\\n\
\\\n\
       * @type boolean\\n\
\\\n\
       */\\n\
\\\n\
      support.unindexedChars = ('x'[0] + Object('x')[0]) != 'xx';\\n\
\\\n\
\\n\
\\\n\
      /**\\n\
\\\n\
       * Detect if a DOM node's [[Class]] is resolvable (all but IE < 9)\\n\
\\\n\
       * and that the JS engine errors when attempting to coerce an object to\\n\
\\\n\
       * a string without a `toString` function.\\n\
\\\n\
       *\\n\
\\\n\
       * @memberOf _.support\\n\
\\\n\
       * @type boolean\\n\
\\\n\
       */\\n\
\\\n\
      try {\\n\
\\\n\
        support.nodeClass = !(toString.call(document) == objectClass && !({ 'toString': 0 } + ''));\\n\
\\\n\
      } catch(e) {\\n\
\\\n\
        support.nodeClass = true;\\n\
\\\n\
      }\\n\
\\\n\
    }(1));\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * By default, the template delimiters used by Lo-Dash are similar to those in\\n\
\\\n\
     * embedded Ruby (ERB). Change the following template settings to use alternative\\n\
\\\n\
     * delimiters.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @type Object\\n\
\\\n\
     */\\n\
\\\n\
    lodash.templateSettings = {\\n\
\\\n\
\\n\
\\\n\
      /**\\n\
\\\n\
       * Used to detect `data` property values to be HTML-escaped.\\n\
\\\n\
       *\\n\
\\\n\
       * @memberOf _.templateSettings\\n\
\\\n\
       * @type RegExp\\n\
\\\n\
       */\\n\
\\\n\
      'escape': /<%-([\\\\s\\\\S]+?)%>/g,\\n\
\\\n\
\\n\
\\\n\
      /**\\n\
\\\n\
       * Used to detect code to be evaluated.\\n\
\\\n\
       *\\n\
\\\n\
       * @memberOf _.templateSettings\\n\
\\\n\
       * @type RegExp\\n\
\\\n\
       */\\n\
\\\n\
      'evaluate': /<%([\\\\s\\\\S]+?)%>/g,\\n\
\\\n\
\\n\
\\\n\
      /**\\n\
\\\n\
       * Used to detect `data` property values to inject.\\n\
\\\n\
       *\\n\
\\\n\
       * @memberOf _.templateSettings\\n\
\\\n\
       * @type RegExp\\n\
\\\n\
       */\\n\
\\\n\
      'interpolate': reInterpolate,\\n\
\\\n\
\\n\
\\\n\
      /**\\n\
\\\n\
       * Used to reference the data object in the template text.\\n\
\\\n\
       *\\n\
\\\n\
       * @memberOf _.templateSettings\\n\
\\\n\
       * @type string\\n\
\\\n\
       */\\n\
\\\n\
      'variable': '',\\n\
\\\n\
\\n\
\\\n\
      /**\\n\
\\\n\
       * Used to import variables into the compiled template.\\n\
\\\n\
       *\\n\
\\\n\
       * @memberOf _.templateSettings\\n\
\\\n\
       * @type Object\\n\
\\\n\
       */\\n\
\\\n\
      'imports': {\\n\
\\\n\
\\n\
\\\n\
        /**\\n\
\\\n\
         * A reference to the `lodash` function.\\n\
\\\n\
         *\\n\
\\\n\
         * @memberOf _.templateSettings.imports\\n\
\\\n\
         * @type Function\\n\
\\\n\
         */\\n\
\\\n\
        '_': lodash\\n\
\\\n\
      }\\n\
\\\n\
    };\\n\
\\\n\
\\n\
\\\n\
    /*--------------------------------------------------------------------------*/\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * The template used to create iterator functions.\\n\
\\\n\
     *\\n\
\\\n\
     * @private\\n\
\\\n\
     * @param {Object} data The data object used to populate the text.\\n\
\\\n\
     * @returns {string} Returns the interpolated text.\\n\
\\\n\
     */\\n\
\\\n\
    var iteratorTemplate = function(obj) {\\n\
\\\n\
\\n\
\\\n\
      var __p = 'var index, iterable = ' +\\n\
\\\n\
      (obj.firstArg) +\\n\
\\\n\
      ', result = ' +\\n\
\\\n\
      (obj.init) +\\n\
\\\n\
      ';\\\\n\
\\\n\
if (!iterable) return result;\\\\n\
\\\n\
' +\\n\
\\\n\
      (obj.top) +\\n\
\\\n\
      ';';\\n\
\\\n\
       if (obj.array) {\\n\
\\\n\
      __p += '\\\\n\
\\\n\
var length = iterable.length; index = -1;\\\\n\
\\\n\
if (' +\\n\
\\\n\
      (obj.array) +\\n\
\\\n\
      ') {  ';\\n\
\\\n\
       if (support.unindexedChars) {\\n\
\\\n\
      __p += '\\\\n\
\\\n\
  if (isString(iterable)) {\\\\n\
\\\n\
    iterable = iterable.split(\\\\'\\\\')\\\\n\
\\\n\
  }  ';\\n\
\\\n\
       }\\n\
\\\n\
      __p += '\\\\n\
\\\n\
  while (++index < length) {\\\\n\
\\\n\
    ' +\\n\
\\\n\
      (obj.loop) +\\n\
\\\n\
      ';\\\\n\
\\\n\
  }\\\\n\
\\\n\
}\\\\n\
\\\n\
else {  ';\\n\
\\\n\
       } else if (support.nonEnumArgs) {\\n\
\\\n\
      __p += '\\\\n\
\\\n\
  var length = iterable.length; index = -1;\\\\n\
\\\n\
  if (length && isArguments(iterable)) {\\\\n\
\\\n\
    while (++index < length) {\\\\n\
\\\n\
      index += \\\\'\\\\';\\\\n\
\\\n\
      ' +\\n\
\\\n\
      (obj.loop) +\\n\
\\\n\
      ';\\\\n\
\\\n\
    }\\\\n\
\\\n\
  } else {  ';\\n\
\\\n\
       }\\n\
\\\n\
\\n\
\\\n\
       if (support.enumPrototypes) {\\n\
\\\n\
      __p += '\\\\n\
\\\n\
  var skipProto = typeof iterable == \\\\'function\\\\';\\\\n\
\\\n\
  ';\\n\
\\\n\
       }\\n\
\\\n\
\\n\
\\\n\
       if (support.enumErrorProps) {\\n\
\\\n\
      __p += '\\\\n\
\\\n\
  var skipErrorProps = iterable === errorProto || iterable instanceof Error;\\\\n\
\\\n\
  ';\\n\
\\\n\
       }\\n\
\\\n\
\\n\
\\\n\
          var conditions = [];    if (support.enumPrototypes) { conditions.push('!(skipProto && index == \\\"prototype\\\")'); }    if (support.enumErrorProps)  { conditions.push('!(skipErrorProps && (index == \\\"message\\\" || index == \\\"name\\\"))'); }\\n\
\\\n\
\\n\
\\\n\
       if (obj.useHas && obj.keys) {\\n\
\\\n\
      __p += '\\\\n\
\\\n\
  var ownIndex = -1,\\\\n\
\\\n\
      ownProps = objectTypes[typeof iterable] && keys(iterable),\\\\n\
\\\n\
      length = ownProps ? ownProps.length : 0;\\\\n\
\\\n\
\\\\n\
\\\n\
  while (++ownIndex < length) {\\\\n\
\\\n\
    index = ownProps[ownIndex];\\\\n\
\\\n\
';\\n\
\\\n\
          if (conditions.length) {\\n\
\\\n\
      __p += '    if (' +\\n\
\\\n\
      (conditions.join(' && ')) +\\n\
\\\n\
      ') {\\\\n\
\\\n\
  ';\\n\
\\\n\
       }\\n\
\\\n\
      __p +=\\n\
\\\n\
      (obj.loop) +\\n\
\\\n\
      ';    ';\\n\
\\\n\
       if (conditions.length) {\\n\
\\\n\
      __p += '\\\\n\
\\\n\
    }';\\n\
\\\n\
       }\\n\
\\\n\
      __p += '\\\\n\
\\\n\
  }  ';\\n\
\\\n\
       } else {\\n\
\\\n\
      __p += '\\\\n\
\\\n\
  for (index in iterable) {\\\\n\
\\\n\
';\\n\
\\\n\
          if (obj.useHas) { conditions.push(\\\"hasOwnProperty.call(iterable, index)\\\"); }    if (conditions.length) {\\n\
\\\n\
      __p += '    if (' +\\n\
\\\n\
      (conditions.join(' && ')) +\\n\
\\\n\
      ') {\\\\n\
\\\n\
  ';\\n\
\\\n\
       }\\n\
\\\n\
      __p +=\\n\
\\\n\
      (obj.loop) +\\n\
\\\n\
      ';    ';\\n\
\\\n\
       if (conditions.length) {\\n\
\\\n\
      __p += '\\\\n\
\\\n\
    }';\\n\
\\\n\
       }\\n\
\\\n\
      __p += '\\\\n\
\\\n\
  }    ';\\n\
\\\n\
       if (support.nonEnumShadows) {\\n\
\\\n\
      __p += '\\\\n\
\\\n\
\\\\n\
\\\n\
  if (iterable !== objectProto) {\\\\n\
\\\n\
    var ctor = iterable.constructor,\\\\n\
\\\n\
        isProto = iterable === (ctor && ctor.prototype),\\\\n\
\\\n\
        className = iterable === stringProto ? stringClass : iterable === errorProto ? errorClass : toString.call(iterable),\\\\n\
\\\n\
        nonEnum = nonEnumProps[className];\\\\n\
\\\n\
      ';\\n\
\\\n\
       for (k = 0; k < 7; k++) {\\n\
\\\n\
      __p += '\\\\n\
\\\n\
    index = \\\\'' +\\n\
\\\n\
      (obj.shadowedProps[k]) +\\n\
\\\n\
      '\\\\';\\\\n\
\\\n\
    if ((!(isProto && nonEnum[index]) && hasOwnProperty.call(iterable, index))';\\n\
\\\n\
              if (!obj.useHas) {\\n\
\\\n\
      __p += ' || (!nonEnum[index] && iterable[index] !== objectProto[index])';\\n\
\\\n\
       }\\n\
\\\n\
      __p += ') {\\\\n\
\\\n\
      ' +\\n\
\\\n\
      (obj.loop) +\\n\
\\\n\
      ';\\\\n\
\\\n\
    }      ';\\n\
\\\n\
       }\\n\
\\\n\
      __p += '\\\\n\
\\\n\
  }    ';\\n\
\\\n\
       }\\n\
\\\n\
\\n\
\\\n\
       }\\n\
\\\n\
\\n\
\\\n\
       if (obj.array || support.nonEnumArgs) {\\n\
\\\n\
      __p += '\\\\n\
\\\n\
}';\\n\
\\\n\
       }\\n\
\\\n\
      __p +=\\n\
\\\n\
      (obj.bottom) +\\n\
\\\n\
      ';\\\\n\
\\\n\
return result';\\n\
\\\n\
\\n\
\\\n\
      return __p\\n\
\\\n\
    };\\n\
\\\n\
\\n\
\\\n\
    /*--------------------------------------------------------------------------*/\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * The base implementation of `_.bind` that creates the bound function and\\n\
\\\n\
     * sets its meta data.\\n\
\\\n\
     *\\n\
\\\n\
     * @private\\n\
\\\n\
     * @param {Array} bindData The bind data array.\\n\
\\\n\
     * @returns {Function} Returns the new bound function.\\n\
\\\n\
     */\\n\
\\\n\
    function baseBind(bindData) {\\n\
\\\n\
      var func = bindData[0],\\n\
\\\n\
          partialArgs = bindData[2],\\n\
\\\n\
          thisArg = bindData[4];\\n\
\\\n\
\\n\
\\\n\
      function bound() {\\n\
\\\n\
        // `Function#bind` spec\\n\
\\\n\
        // http://es5.github.io/#x15.3.4.5\\n\
\\\n\
        if (partialArgs) {\\n\
\\\n\
          // avoid `arguments` object deoptimizations by using `slice` instead\\n\
\\\n\
          // of `Array.prototype.slice.call` and not assigning `arguments` to a\\n\
\\\n\
          // variable as a ternary expression\\n\
\\\n\
          var args = slice(partialArgs);\\n\
\\\n\
          push.apply(args, arguments);\\n\
\\\n\
        }\\n\
\\\n\
        // mimic the constructor's `return` behavior\\n\
\\\n\
        // http://es5.github.io/#x13.2.2\\n\
\\\n\
        if (this instanceof bound) {\\n\
\\\n\
          // ensure `new bound` is an instance of `func`\\n\
\\\n\
          var thisBinding = baseCreate(func.prototype),\\n\
\\\n\
              result = func.apply(thisBinding, args || arguments);\\n\
\\\n\
          return isObject(result) ? result : thisBinding;\\n\
\\\n\
        }\\n\
\\\n\
        return func.apply(thisArg, args || arguments);\\n\
\\\n\
      }\\n\
\\\n\
      setBindData(bound, bindData);\\n\
\\\n\
      return bound;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * The base implementation of `_.clone` without argument juggling or support\\n\
\\\n\
     * for `thisArg` binding.\\n\
\\\n\
     *\\n\
\\\n\
     * @private\\n\
\\\n\
     * @param {*} value The value to clone.\\n\
\\\n\
     * @param {boolean} [isDeep=false] Specify a deep clone.\\n\
\\\n\
     * @param {Function} [callback] The function to customize cloning values.\\n\
\\\n\
     * @param {Array} [stackA=[]] Tracks traversed source objects.\\n\
\\\n\
     * @param {Array} [stackB=[]] Associates clones with source counterparts.\\n\
\\\n\
     * @returns {*} Returns the cloned value.\\n\
\\\n\
     */\\n\
\\\n\
    function baseClone(value, isDeep, callback, stackA, stackB) {\\n\
\\\n\
      if (callback) {\\n\
\\\n\
        var result = callback(value);\\n\
\\\n\
        if (typeof result != 'undefined') {\\n\
\\\n\
          return result;\\n\
\\\n\
        }\\n\
\\\n\
      }\\n\
\\\n\
      // inspect [[Class]]\\n\
\\\n\
      var isObj = isObject(value);\\n\
\\\n\
      if (isObj) {\\n\
\\\n\
        var className = toString.call(value);\\n\
\\\n\
        if (!cloneableClasses[className] || (!support.nodeClass && isNode(value))) {\\n\
\\\n\
          return value;\\n\
\\\n\
        }\\n\
\\\n\
        var ctor = ctorByClass[className];\\n\
\\\n\
        switch (className) {\\n\
\\\n\
          case boolClass:\\n\
\\\n\
          case dateClass:\\n\
\\\n\
            return new ctor(+value);\\n\
\\\n\
\\n\
\\\n\
          case numberClass:\\n\
\\\n\
          case stringClass:\\n\
\\\n\
            return new ctor(value);\\n\
\\\n\
\\n\
\\\n\
          case regexpClass:\\n\
\\\n\
            result = ctor(value.source, reFlags.exec(value));\\n\
\\\n\
            result.lastIndex = value.lastIndex;\\n\
\\\n\
            return result;\\n\
\\\n\
        }\\n\
\\\n\
      } else {\\n\
\\\n\
        return value;\\n\
\\\n\
      }\\n\
\\\n\
      var isArr = isArray(value);\\n\
\\\n\
      if (isDeep) {\\n\
\\\n\
        // check for circular references and return corresponding clone\\n\
\\\n\
        var initedStack = !stackA;\\n\
\\\n\
        stackA || (stackA = getArray());\\n\
\\\n\
        stackB || (stackB = getArray());\\n\
\\\n\
\\n\
\\\n\
        var length = stackA.length;\\n\
\\\n\
        while (length--) {\\n\
\\\n\
          if (stackA[length] == value) {\\n\
\\\n\
            return stackB[length];\\n\
\\\n\
          }\\n\
\\\n\
        }\\n\
\\\n\
        result = isArr ? ctor(value.length) : {};\\n\
\\\n\
      }\\n\
\\\n\
      else {\\n\
\\\n\
        result = isArr ? slice(value) : assign({}, value);\\n\
\\\n\
      }\\n\
\\\n\
      // add array properties assigned by `RegExp#exec`\\n\
\\\n\
      if (isArr) {\\n\
\\\n\
        if (hasOwnProperty.call(value, 'index')) {\\n\
\\\n\
          result.index = value.index;\\n\
\\\n\
        }\\n\
\\\n\
        if (hasOwnProperty.call(value, 'input')) {\\n\
\\\n\
          result.input = value.input;\\n\
\\\n\
        }\\n\
\\\n\
      }\\n\
\\\n\
      // exit for shallow clone\\n\
\\\n\
      if (!isDeep) {\\n\
\\\n\
        return result;\\n\
\\\n\
      }\\n\
\\\n\
      // add the source value to the stack of traversed objects\\n\
\\\n\
      // and associate it with its clone\\n\
\\\n\
      stackA.push(value);\\n\
\\\n\
      stackB.push(result);\\n\
\\\n\
\\n\
\\\n\
      // recursively populate clone (susceptible to call stack limits)\\n\
\\\n\
      (isArr ? baseEach : forOwn)(value, function(objValue, key) {\\n\
\\\n\
        result[key] = baseClone(objValue, isDeep, callback, stackA, stackB);\\n\
\\\n\
      });\\n\
\\\n\
\\n\
\\\n\
      if (initedStack) {\\n\
\\\n\
        releaseArray(stackA);\\n\
\\\n\
        releaseArray(stackB);\\n\
\\\n\
      }\\n\
\\\n\
      return result;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * The base implementation of `_.create` without support for assigning\\n\
\\\n\
     * properties to the created object.\\n\
\\\n\
     *\\n\
\\\n\
     * @private\\n\
\\\n\
     * @param {Object} prototype The object to inherit from.\\n\
\\\n\
     * @returns {Object} Returns the new object.\\n\
\\\n\
     */\\n\
\\\n\
    function baseCreate(prototype, properties) {\\n\
\\\n\
      return isObject(prototype) ? nativeCreate(prototype) : {};\\n\
\\\n\
    }\\n\
\\\n\
    // fallback for browsers without `Object.create`\\n\
\\\n\
    if (!nativeCreate) {\\n\
\\\n\
      baseCreate = (function() {\\n\
\\\n\
        function Object() {}\\n\
\\\n\
        return function(prototype) {\\n\
\\\n\
          if (isObject(prototype)) {\\n\
\\\n\
            Object.prototype = prototype;\\n\
\\\n\
            var result = new Object;\\n\
\\\n\
            Object.prototype = null;\\n\
\\\n\
          }\\n\
\\\n\
          return result || context.Object();\\n\
\\\n\
        };\\n\
\\\n\
      }());\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * The base implementation of `_.createCallback` without support for creating\\n\
\\\n\
     * \\\"_.pluck\\\" or \\\"_.where\\\" style callbacks.\\n\
\\\n\
     *\\n\
\\\n\
     * @private\\n\
\\\n\
     * @param {*} [func=identity] The value to convert to a callback.\\n\
\\\n\
     * @param {*} [thisArg] The `this` binding of the created callback.\\n\
\\\n\
     * @param {number} [argCount] The number of arguments the callback accepts.\\n\
\\\n\
     * @returns {Function} Returns a callback function.\\n\
\\\n\
     */\\n\
\\\n\
    function baseCreateCallback(func, thisArg, argCount) {\\n\
\\\n\
      if (typeof func != 'function') {\\n\
\\\n\
        return identity;\\n\
\\\n\
      }\\n\
\\\n\
      // exit early for no `thisArg` or already bound by `Function#bind`\\n\
\\\n\
      if (typeof thisArg == 'undefined' || !('prototype' in func)) {\\n\
\\\n\
        return func;\\n\
\\\n\
      }\\n\
\\\n\
      var bindData = func.__bindData__;\\n\
\\\n\
      if (typeof bindData == 'undefined') {\\n\
\\\n\
        if (support.funcNames) {\\n\
\\\n\
          bindData = !func.name;\\n\
\\\n\
        }\\n\
\\\n\
        bindData = bindData || !support.funcDecomp;\\n\
\\\n\
        if (!bindData) {\\n\
\\\n\
          var source = fnToString.call(func);\\n\
\\\n\
          if (!support.funcNames) {\\n\
\\\n\
            bindData = !reFuncName.test(source);\\n\
\\\n\
          }\\n\
\\\n\
          if (!bindData) {\\n\
\\\n\
            // checks if `func` references the `this` keyword and stores the result\\n\
\\\n\
            bindData = reThis.test(source);\\n\
\\\n\
            setBindData(func, bindData);\\n\
\\\n\
          }\\n\
\\\n\
        }\\n\
\\\n\
      }\\n\
\\\n\
      // exit early if there are no `this` references or `func` is bound\\n\
\\\n\
      if (bindData === false || (bindData !== true && bindData[1] & 1)) {\\n\
\\\n\
        return func;\\n\
\\\n\
      }\\n\
\\\n\
      switch (argCount) {\\n\
\\\n\
        case 1: return function(value) {\\n\
\\\n\
          return func.call(thisArg, value);\\n\
\\\n\
        };\\n\
\\\n\
        case 2: return function(a, b) {\\n\
\\\n\
          return func.call(thisArg, a, b);\\n\
\\\n\
        };\\n\
\\\n\
        case 3: return function(value, index, collection) {\\n\
\\\n\
          return func.call(thisArg, value, index, collection);\\n\
\\\n\
        };\\n\
\\\n\
        case 4: return function(accumulator, value, index, collection) {\\n\
\\\n\
          return func.call(thisArg, accumulator, value, index, collection);\\n\
\\\n\
        };\\n\
\\\n\
      }\\n\
\\\n\
      return bind(func, thisArg);\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * The base implementation of `createWrapper` that creates the wrapper and\\n\
\\\n\
     * sets its meta data.\\n\
\\\n\
     *\\n\
\\\n\
     * @private\\n\
\\\n\
     * @param {Array} bindData The bind data array.\\n\
\\\n\
     * @returns {Function} Returns the new function.\\n\
\\\n\
     */\\n\
\\\n\
    function baseCreateWrapper(bindData) {\\n\
\\\n\
      var func = bindData[0],\\n\
\\\n\
          bitmask = bindData[1],\\n\
\\\n\
          partialArgs = bindData[2],\\n\
\\\n\
          partialRightArgs = bindData[3],\\n\
\\\n\
          thisArg = bindData[4],\\n\
\\\n\
          arity = bindData[5];\\n\
\\\n\
\\n\
\\\n\
      var isBind = bitmask & 1,\\n\
\\\n\
          isBindKey = bitmask & 2,\\n\
\\\n\
          isCurry = bitmask & 4,\\n\
\\\n\
          isCurryBound = bitmask & 8,\\n\
\\\n\
          key = func;\\n\
\\\n\
\\n\
\\\n\
      function bound() {\\n\
\\\n\
        var thisBinding = isBind ? thisArg : this;\\n\
\\\n\
        if (partialArgs) {\\n\
\\\n\
          var args = slice(partialArgs);\\n\
\\\n\
          push.apply(args, arguments);\\n\
\\\n\
        }\\n\
\\\n\
        if (partialRightArgs || isCurry) {\\n\
\\\n\
          args || (args = slice(arguments));\\n\
\\\n\
          if (partialRightArgs) {\\n\
\\\n\
            push.apply(args, partialRightArgs);\\n\
\\\n\
          }\\n\
\\\n\
          if (isCurry && args.length < arity) {\\n\
\\\n\
            bitmask |= 16 & ~32;\\n\
\\\n\
            return baseCreateWrapper([func, (isCurryBound ? bitmask : bitmask & ~3), args, null, thisArg, arity]);\\n\
\\\n\
          }\\n\
\\\n\
        }\\n\
\\\n\
        args || (args = arguments);\\n\
\\\n\
        if (isBindKey) {\\n\
\\\n\
          func = thisBinding[key];\\n\
\\\n\
        }\\n\
\\\n\
        if (this instanceof bound) {\\n\
\\\n\
          thisBinding = baseCreate(func.prototype);\\n\
\\\n\
          var result = func.apply(thisBinding, args);\\n\
\\\n\
          return isObject(result) ? result : thisBinding;\\n\
\\\n\
        }\\n\
\\\n\
        return func.apply(thisBinding, args);\\n\
\\\n\
      }\\n\
\\\n\
      setBindData(bound, bindData);\\n\
\\\n\
      return bound;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * The base implementation of `_.difference` that accepts a single array\\n\
\\\n\
     * of values to exclude.\\n\
\\\n\
     *\\n\
\\\n\
     * @private\\n\
\\\n\
     * @param {Array} array The array to process.\\n\
\\\n\
     * @param {Array} [values] The array of values to exclude.\\n\
\\\n\
     * @returns {Array} Returns a new array of filtered values.\\n\
\\\n\
     */\\n\
\\\n\
    function baseDifference(array, values) {\\n\
\\\n\
      var index = -1,\\n\
\\\n\
          indexOf = getIndexOf(),\\n\
\\\n\
          length = array ? array.length : 0,\\n\
\\\n\
          isLarge = length >= largeArraySize && indexOf === baseIndexOf,\\n\
\\\n\
          result = [];\\n\
\\\n\
\\n\
\\\n\
      if (isLarge) {\\n\
\\\n\
        var cache = createCache(values);\\n\
\\\n\
        if (cache) {\\n\
\\\n\
          indexOf = cacheIndexOf;\\n\
\\\n\
          values = cache;\\n\
\\\n\
        } else {\\n\
\\\n\
          isLarge = false;\\n\
\\\n\
        }\\n\
\\\n\
      }\\n\
\\\n\
      while (++index < length) {\\n\
\\\n\
        var value = array[index];\\n\
\\\n\
        if (indexOf(values, value) < 0) {\\n\
\\\n\
          result.push(value);\\n\
\\\n\
        }\\n\
\\\n\
      }\\n\
\\\n\
      if (isLarge) {\\n\
\\\n\
        releaseObject(values);\\n\
\\\n\
      }\\n\
\\\n\
      return result;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * The base implementation of `_.flatten` without support for callback\\n\
\\\n\
     * shorthands or `thisArg` binding.\\n\
\\\n\
     *\\n\
\\\n\
     * @private\\n\
\\\n\
     * @param {Array} array The array to flatten.\\n\
\\\n\
     * @param {boolean} [isShallow=false] A flag to restrict flattening to a single level.\\n\
\\\n\
     * @param {boolean} [isStrict=false] A flag to restrict flattening to arrays and `arguments` objects.\\n\
\\\n\
     * @param {number} [fromIndex=0] The index to start from.\\n\
\\\n\
     * @returns {Array} Returns a new flattened array.\\n\
\\\n\
     */\\n\
\\\n\
    function baseFlatten(array, isShallow, isStrict, fromIndex) {\\n\
\\\n\
      var index = (fromIndex || 0) - 1,\\n\
\\\n\
          length = array ? array.length : 0,\\n\
\\\n\
          result = [];\\n\
\\\n\
\\n\
\\\n\
      while (++index < length) {\\n\
\\\n\
        var value = array[index];\\n\
\\\n\
\\n\
\\\n\
        if (value && typeof value == 'object' && typeof value.length == 'number'\\n\
\\\n\
            && (isArray(value) || isArguments(value))) {\\n\
\\\n\
          // recursively flatten arrays (susceptible to call stack limits)\\n\
\\\n\
          if (!isShallow) {\\n\
\\\n\
            value = baseFlatten(value, isShallow, isStrict);\\n\
\\\n\
          }\\n\
\\\n\
          var valIndex = -1,\\n\
\\\n\
              valLength = value.length,\\n\
\\\n\
              resIndex = result.length;\\n\
\\\n\
\\n\
\\\n\
          result.length += valLength;\\n\
\\\n\
          while (++valIndex < valLength) {\\n\
\\\n\
            result[resIndex++] = value[valIndex];\\n\
\\\n\
          }\\n\
\\\n\
        } else if (!isStrict) {\\n\
\\\n\
          result.push(value);\\n\
\\\n\
        }\\n\
\\\n\
      }\\n\
\\\n\
      return result;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * The base implementation of `_.isEqual`, without support for `thisArg` binding,\\n\
\\\n\
     * that allows partial \\\"_.where\\\" style comparisons.\\n\
\\\n\
     *\\n\
\\\n\
     * @private\\n\
\\\n\
     * @param {*} a The value to compare.\\n\
\\\n\
     * @param {*} b The other value to compare.\\n\
\\\n\
     * @param {Function} [callback] The function to customize comparing values.\\n\
\\\n\
     * @param {Function} [isWhere=false] A flag to indicate performing partial comparisons.\\n\
\\\n\
     * @param {Array} [stackA=[]] Tracks traversed `a` objects.\\n\
\\\n\
     * @param {Array} [stackB=[]] Tracks traversed `b` objects.\\n\
\\\n\
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.\\n\
\\\n\
     */\\n\
\\\n\
    function baseIsEqual(a, b, callback, isWhere, stackA, stackB) {\\n\
\\\n\
      // used to indicate that when comparing objects, `a` has at least the properties of `b`\\n\
\\\n\
      if (callback) {\\n\
\\\n\
        var result = callback(a, b);\\n\
\\\n\
        if (typeof result != 'undefined') {\\n\
\\\n\
          return !!result;\\n\
\\\n\
        }\\n\
\\\n\
      }\\n\
\\\n\
      // exit early for identical values\\n\
\\\n\
      if (a === b) {\\n\
\\\n\
        // treat `+0` vs. `-0` as not equal\\n\
\\\n\
        return a !== 0 || (1 / a == 1 / b);\\n\
\\\n\
      }\\n\
\\\n\
      var type = typeof a,\\n\
\\\n\
          otherType = typeof b;\\n\
\\\n\
\\n\
\\\n\
      // exit early for unlike primitive values\\n\
\\\n\
      if (a === a &&\\n\
\\\n\
          !(a && objectTypes[type]) &&\\n\
\\\n\
          !(b && objectTypes[otherType])) {\\n\
\\\n\
        return false;\\n\
\\\n\
      }\\n\
\\\n\
      // exit early for `null` and `undefined` avoiding ES3's Function#call behavior\\n\
\\\n\
      // http://es5.github.io/#x15.3.4.4\\n\
\\\n\
      if (a == null || b == null) {\\n\
\\\n\
        return a === b;\\n\
\\\n\
      }\\n\
\\\n\
      // compare [[Class]] names\\n\
\\\n\
      var className = toString.call(a),\\n\
\\\n\
          otherClass = toString.call(b);\\n\
\\\n\
\\n\
\\\n\
      if (className == argsClass) {\\n\
\\\n\
        className = objectClass;\\n\
\\\n\
      }\\n\
\\\n\
      if (otherClass == argsClass) {\\n\
\\\n\
        otherClass = objectClass;\\n\
\\\n\
      }\\n\
\\\n\
      if (className != otherClass) {\\n\
\\\n\
        return false;\\n\
\\\n\
      }\\n\
\\\n\
      switch (className) {\\n\
\\\n\
        case boolClass:\\n\
\\\n\
        case dateClass:\\n\
\\\n\
          // coerce dates and booleans to numbers, dates to milliseconds and booleans\\n\
\\\n\
          // to `1` or `0` treating invalid dates coerced to `NaN` as not equal\\n\
\\\n\
          return +a == +b;\\n\
\\\n\
\\n\
\\\n\
        case numberClass:\\n\
\\\n\
          // treat `NaN` vs. `NaN` as equal\\n\
\\\n\
          return (a != +a)\\n\
\\\n\
            ? b != +b\\n\
\\\n\
            // but treat `+0` vs. `-0` as not equal\\n\
\\\n\
            : (a == 0 ? (1 / a == 1 / b) : a == +b);\\n\
\\\n\
\\n\
\\\n\
        case regexpClass:\\n\
\\\n\
        case stringClass:\\n\
\\\n\
          // coerce regexes to strings (http://es5.github.io/#x15.10.6.4)\\n\
\\\n\
          // treat string primitives and their corresponding object instances as equal\\n\
\\\n\
          return a == String(b);\\n\
\\\n\
      }\\n\
\\\n\
      var isArr = className == arrayClass;\\n\
\\\n\
      if (!isArr) {\\n\
\\\n\
        // unwrap any `lodash` wrapped values\\n\
\\\n\
        var aWrapped = hasOwnProperty.call(a, '__wrapped__'),\\n\
\\\n\
            bWrapped = hasOwnProperty.call(b, '__wrapped__');\\n\
\\\n\
\\n\
\\\n\
        if (aWrapped || bWrapped) {\\n\
\\\n\
          return baseIsEqual(aWrapped ? a.__wrapped__ : a, bWrapped ? b.__wrapped__ : b, callback, isWhere, stackA, stackB);\\n\
\\\n\
        }\\n\
\\\n\
        // exit for functions and DOM nodes\\n\
\\\n\
        if (className != objectClass || (!support.nodeClass && (isNode(a) || isNode(b)))) {\\n\
\\\n\
          return false;\\n\
\\\n\
        }\\n\
\\\n\
        // in older versions of Opera, `arguments` objects have `Array` constructors\\n\
\\\n\
        var ctorA = !support.argsObject && isArguments(a) ? Object : a.constructor,\\n\
\\\n\
            ctorB = !support.argsObject && isArguments(b) ? Object : b.constructor;\\n\
\\\n\
\\n\
\\\n\
        // non `Object` object instances with different constructors are not equal\\n\
\\\n\
        if (ctorA != ctorB &&\\n\
\\\n\
              !(isFunction(ctorA) && ctorA instanceof ctorA && isFunction(ctorB) && ctorB instanceof ctorB) &&\\n\
\\\n\
              ('constructor' in a && 'constructor' in b)\\n\
\\\n\
            ) {\\n\
\\\n\
          return false;\\n\
\\\n\
        }\\n\
\\\n\
      }\\n\
\\\n\
      // assume cyclic structures are equal\\n\
\\\n\
      // the algorithm for detecting cyclic structures is adapted from ES 5.1\\n\
\\\n\
      // section 15.12.3, abstract operation `JO` (http://es5.github.io/#x15.12.3)\\n\
\\\n\
      var initedStack = !stackA;\\n\
\\\n\
      stackA || (stackA = getArray());\\n\
\\\n\
      stackB || (stackB = getArray());\\n\
\\\n\
\\n\
\\\n\
      var length = stackA.length;\\n\
\\\n\
      while (length--) {\\n\
\\\n\
        if (stackA[length] == a) {\\n\
\\\n\
          return stackB[length] == b;\\n\
\\\n\
        }\\n\
\\\n\
      }\\n\
\\\n\
      var size = 0;\\n\
\\\n\
      result = true;\\n\
\\\n\
\\n\
\\\n\
      // add `a` and `b` to the stack of traversed objects\\n\
\\\n\
      stackA.push(a);\\n\
\\\n\
      stackB.push(b);\\n\
\\\n\
\\n\
\\\n\
      // recursively compare objects and arrays (susceptible to call stack limits)\\n\
\\\n\
      if (isArr) {\\n\
\\\n\
        // compare lengths to determine if a deep comparison is necessary\\n\
\\\n\
        length = a.length;\\n\
\\\n\
        size = b.length;\\n\
\\\n\
        result = size == length;\\n\
\\\n\
\\n\
\\\n\
        if (result || isWhere) {\\n\
\\\n\
          // deep compare the contents, ignoring non-numeric properties\\n\
\\\n\
          while (size--) {\\n\
\\\n\
            var index = length,\\n\
\\\n\
                value = b[size];\\n\
\\\n\
\\n\
\\\n\
            if (isWhere) {\\n\
\\\n\
              while (index--) {\\n\
\\\n\
                if ((result = baseIsEqual(a[index], value, callback, isWhere, stackA, stackB))) {\\n\
\\\n\
                  break;\\n\
\\\n\
                }\\n\
\\\n\
              }\\n\
\\\n\
            } else if (!(result = baseIsEqual(a[size], value, callback, isWhere, stackA, stackB))) {\\n\
\\\n\
              break;\\n\
\\\n\
            }\\n\
\\\n\
          }\\n\
\\\n\
        }\\n\
\\\n\
      }\\n\
\\\n\
      else {\\n\
\\\n\
        // deep compare objects using `forIn`, instead of `forOwn`, to avoid `Object.keys`\\n\
\\\n\
        // which, in this case, is more costly\\n\
\\\n\
        forIn(b, function(value, key, b) {\\n\
\\\n\
          if (hasOwnProperty.call(b, key)) {\\n\
\\\n\
            // count the number of properties.\\n\
\\\n\
            size++;\\n\
\\\n\
            // deep compare each property value.\\n\
\\\n\
            return (result = hasOwnProperty.call(a, key) && baseIsEqual(a[key], value, callback, isWhere, stackA, stackB));\\n\
\\\n\
          }\\n\
\\\n\
        });\\n\
\\\n\
\\n\
\\\n\
        if (result && !isWhere) {\\n\
\\\n\
          // ensure both objects have the same number of properties\\n\
\\\n\
          forIn(a, function(value, key, a) {\\n\
\\\n\
            if (hasOwnProperty.call(a, key)) {\\n\
\\\n\
              // `size` will be `-1` if `a` has more properties than `b`\\n\
\\\n\
              return (result = --size > -1);\\n\
\\\n\
            }\\n\
\\\n\
          });\\n\
\\\n\
        }\\n\
\\\n\
      }\\n\
\\\n\
      stackA.pop();\\n\
\\\n\
      stackB.pop();\\n\
\\\n\
\\n\
\\\n\
      if (initedStack) {\\n\
\\\n\
        releaseArray(stackA);\\n\
\\\n\
        releaseArray(stackB);\\n\
\\\n\
      }\\n\
\\\n\
      return result;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * The base implementation of `_.merge` without argument juggling or support\\n\
\\\n\
     * for `thisArg` binding.\\n\
\\\n\
     *\\n\
\\\n\
     * @private\\n\
\\\n\
     * @param {Object} object The destination object.\\n\
\\\n\
     * @param {Object} source The source object.\\n\
\\\n\
     * @param {Function} [callback] The function to customize merging properties.\\n\
\\\n\
     * @param {Array} [stackA=[]] Tracks traversed source objects.\\n\
\\\n\
     * @param {Array} [stackB=[]] Associates values with source counterparts.\\n\
\\\n\
     */\\n\
\\\n\
    function baseMerge(object, source, callback, stackA, stackB) {\\n\
\\\n\
      (isArray(source) ? forEach : forOwn)(source, function(source, key) {\\n\
\\\n\
        var found,\\n\
\\\n\
            isArr,\\n\
\\\n\
            result = source,\\n\
\\\n\
            value = object[key];\\n\
\\\n\
\\n\
\\\n\
        if (source && ((isArr = isArray(source)) || isPlainObject(source))) {\\n\
\\\n\
          // avoid merging previously merged cyclic sources\\n\
\\\n\
          var stackLength = stackA.length;\\n\
\\\n\
          while (stackLength--) {\\n\
\\\n\
            if ((found = stackA[stackLength] == source)) {\\n\
\\\n\
              value = stackB[stackLength];\\n\
\\\n\
              break;\\n\
\\\n\
            }\\n\
\\\n\
          }\\n\
\\\n\
          if (!found) {\\n\
\\\n\
            var isShallow;\\n\
\\\n\
            if (callback) {\\n\
\\\n\
              result = callback(value, source);\\n\
\\\n\
              if ((isShallow = typeof result != 'undefined')) {\\n\
\\\n\
                value = result;\\n\
\\\n\
              }\\n\
\\\n\
            }\\n\
\\\n\
            if (!isShallow) {\\n\
\\\n\
              value = isArr\\n\
\\\n\
                ? (isArray(value) ? value : [])\\n\
\\\n\
                : (isPlainObject(value) ? value : {});\\n\
\\\n\
            }\\n\
\\\n\
            // add `source` and associated `value` to the stack of traversed objects\\n\
\\\n\
            stackA.push(source);\\n\
\\\n\
            stackB.push(value);\\n\
\\\n\
\\n\
\\\n\
            // recursively merge objects and arrays (susceptible to call stack limits)\\n\
\\\n\
            if (!isShallow) {\\n\
\\\n\
              baseMerge(value, source, callback, stackA, stackB);\\n\
\\\n\
            }\\n\
\\\n\
          }\\n\
\\\n\
        }\\n\
\\\n\
        else {\\n\
\\\n\
          if (callback) {\\n\
\\\n\
            result = callback(value, source);\\n\
\\\n\
            if (typeof result == 'undefined') {\\n\
\\\n\
              result = source;\\n\
\\\n\
            }\\n\
\\\n\
          }\\n\
\\\n\
          if (typeof result != 'undefined') {\\n\
\\\n\
            value = result;\\n\
\\\n\
          }\\n\
\\\n\
        }\\n\
\\\n\
        object[key] = value;\\n\
\\\n\
      });\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * The base implementation of `_.random` without argument juggling or support\\n\
\\\n\
     * for returning floating-point numbers.\\n\
\\\n\
     *\\n\
\\\n\
     * @private\\n\
\\\n\
     * @param {number} min The minimum possible value.\\n\
\\\n\
     * @param {number} max The maximum possible value.\\n\
\\\n\
     * @returns {number} Returns a random number.\\n\
\\\n\
     */\\n\
\\\n\
    function baseRandom(min, max) {\\n\
\\\n\
      return min + floor(nativeRandom() * (max - min + 1));\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * The base implementation of `_.uniq` without support for callback shorthands\\n\
\\\n\
     * or `thisArg` binding.\\n\
\\\n\
     *\\n\
\\\n\
     * @private\\n\
\\\n\
     * @param {Array} array The array to process.\\n\
\\\n\
     * @param {boolean} [isSorted=false] A flag to indicate that `array` is sorted.\\n\
\\\n\
     * @param {Function} [callback] The function called per iteration.\\n\
\\\n\
     * @returns {Array} Returns a duplicate-value-free array.\\n\
\\\n\
     */\\n\
\\\n\
    function baseUniq(array, isSorted, callback) {\\n\
\\\n\
      var index = -1,\\n\
\\\n\
          indexOf = getIndexOf(),\\n\
\\\n\
          length = array ? array.length : 0,\\n\
\\\n\
          result = [];\\n\
\\\n\
\\n\
\\\n\
      var isLarge = !isSorted && length >= largeArraySize && indexOf === baseIndexOf,\\n\
\\\n\
          seen = (callback || isLarge) ? getArray() : result;\\n\
\\\n\
\\n\
\\\n\
      if (isLarge) {\\n\
\\\n\
        var cache = createCache(seen);\\n\
\\\n\
        indexOf = cacheIndexOf;\\n\
\\\n\
        seen = cache;\\n\
\\\n\
      }\\n\
\\\n\
      while (++index < length) {\\n\
\\\n\
        var value = array[index],\\n\
\\\n\
            computed = callback ? callback(value, index, array) : value;\\n\
\\\n\
\\n\
\\\n\
        if (isSorted\\n\
\\\n\
              ? !index || seen[seen.length - 1] !== computed\\n\
\\\n\
              : indexOf(seen, computed) < 0\\n\
\\\n\
            ) {\\n\
\\\n\
          if (callback || isLarge) {\\n\
\\\n\
            seen.push(computed);\\n\
\\\n\
          }\\n\
\\\n\
          result.push(value);\\n\
\\\n\
        }\\n\
\\\n\
      }\\n\
\\\n\
      if (isLarge) {\\n\
\\\n\
        releaseArray(seen.array);\\n\
\\\n\
        releaseObject(seen);\\n\
\\\n\
      } else if (callback) {\\n\
\\\n\
        releaseArray(seen);\\n\
\\\n\
      }\\n\
\\\n\
      return result;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Creates a function that aggregates a collection, creating an object composed\\n\
\\\n\
     * of keys generated from the results of running each element of the collection\\n\
\\\n\
     * through a callback. The given `setter` function sets the keys and values\\n\
\\\n\
     * of the composed object.\\n\
\\\n\
     *\\n\
\\\n\
     * @private\\n\
\\\n\
     * @param {Function} setter The setter function.\\n\
\\\n\
     * @returns {Function} Returns the new aggregator function.\\n\
\\\n\
     */\\n\
\\\n\
    function createAggregator(setter) {\\n\
\\\n\
      return function(collection, callback, thisArg) {\\n\
\\\n\
        var result = {};\\n\
\\\n\
        callback = lodash.createCallback(callback, thisArg, 3);\\n\
\\\n\
\\n\
\\\n\
        if (isArray(collection)) {\\n\
\\\n\
          var index = -1,\\n\
\\\n\
              length = collection.length;\\n\
\\\n\
\\n\
\\\n\
          while (++index < length) {\\n\
\\\n\
            var value = collection[index];\\n\
\\\n\
            setter(result, value, callback(value, index, collection), collection);\\n\
\\\n\
          }\\n\
\\\n\
        } else {\\n\
\\\n\
          baseEach(collection, function(value, key, collection) {\\n\
\\\n\
            setter(result, value, callback(value, key, collection), collection);\\n\
\\\n\
          });\\n\
\\\n\
        }\\n\
\\\n\
        return result;\\n\
\\\n\
      };\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Creates a function that, when called, either curries or invokes `func`\\n\
\\\n\
     * with an optional `this` binding and partially applied arguments.\\n\
\\\n\
     *\\n\
\\\n\
     * @private\\n\
\\\n\
     * @param {Function|string} func The function or method name to reference.\\n\
\\\n\
     * @param {number} bitmask The bitmask of method flags to compose.\\n\
\\\n\
     *  The bitmask may be composed of the following flags:\\n\
\\\n\
     *  1 - `_.bind`\\n\
\\\n\
     *  2 - `_.bindKey`\\n\
\\\n\
     *  4 - `_.curry`\\n\
\\\n\
     *  8 - `_.curry` (bound)\\n\
\\\n\
     *  16 - `_.partial`\\n\
\\\n\
     *  32 - `_.partialRight`\\n\
\\\n\
     * @param {Array} [partialArgs] An array of arguments to prepend to those\\n\
\\\n\
     *  provided to the new function.\\n\
\\\n\
     * @param {Array} [partialRightArgs] An array of arguments to append to those\\n\
\\\n\
     *  provided to the new function.\\n\
\\\n\
     * @param {*} [thisArg] The `this` binding of `func`.\\n\
\\\n\
     * @param {number} [arity] The arity of `func`.\\n\
\\\n\
     * @returns {Function} Returns the new function.\\n\
\\\n\
     */\\n\
\\\n\
    function createWrapper(func, bitmask, partialArgs, partialRightArgs, thisArg, arity) {\\n\
\\\n\
      var isBind = bitmask & 1,\\n\
\\\n\
          isBindKey = bitmask & 2,\\n\
\\\n\
          isCurry = bitmask & 4,\\n\
\\\n\
          isCurryBound = bitmask & 8,\\n\
\\\n\
          isPartial = bitmask & 16,\\n\
\\\n\
          isPartialRight = bitmask & 32;\\n\
\\\n\
\\n\
\\\n\
      if (!isBindKey && !isFunction(func)) {\\n\
\\\n\
        throw new TypeError;\\n\
\\\n\
      }\\n\
\\\n\
      if (isPartial && !partialArgs.length) {\\n\
\\\n\
        bitmask &= ~16;\\n\
\\\n\
        isPartial = partialArgs = false;\\n\
\\\n\
      }\\n\
\\\n\
      if (isPartialRight && !partialRightArgs.length) {\\n\
\\\n\
        bitmask &= ~32;\\n\
\\\n\
        isPartialRight = partialRightArgs = false;\\n\
\\\n\
      }\\n\
\\\n\
      var bindData = func && func.__bindData__;\\n\
\\\n\
      if (bindData && bindData !== true) {\\n\
\\\n\
        // clone `bindData`\\n\
\\\n\
        bindData = slice(bindData);\\n\
\\\n\
        if (bindData[2]) {\\n\
\\\n\
          bindData[2] = slice(bindData[2]);\\n\
\\\n\
        }\\n\
\\\n\
        if (bindData[3]) {\\n\
\\\n\
          bindData[3] = slice(bindData[3]);\\n\
\\\n\
        }\\n\
\\\n\
        // set `thisBinding` is not previously bound\\n\
\\\n\
        if (isBind && !(bindData[1] & 1)) {\\n\
\\\n\
          bindData[4] = thisArg;\\n\
\\\n\
        }\\n\
\\\n\
        // set if previously bound but not currently (subsequent curried functions)\\n\
\\\n\
        if (!isBind && bindData[1] & 1) {\\n\
\\\n\
          bitmask |= 8;\\n\
\\\n\
        }\\n\
\\\n\
        // set curried arity if not yet set\\n\
\\\n\
        if (isCurry && !(bindData[1] & 4)) {\\n\
\\\n\
          bindData[5] = arity;\\n\
\\\n\
        }\\n\
\\\n\
        // append partial left arguments\\n\
\\\n\
        if (isPartial) {\\n\
\\\n\
          push.apply(bindData[2] || (bindData[2] = []), partialArgs);\\n\
\\\n\
        }\\n\
\\\n\
        // append partial right arguments\\n\
\\\n\
        if (isPartialRight) {\\n\
\\\n\
          unshift.apply(bindData[3] || (bindData[3] = []), partialRightArgs);\\n\
\\\n\
        }\\n\
\\\n\
        // merge flags\\n\
\\\n\
        bindData[1] |= bitmask;\\n\
\\\n\
        return createWrapper.apply(null, bindData);\\n\
\\\n\
      }\\n\
\\\n\
      // fast path for `_.bind`\\n\
\\\n\
      var creater = (bitmask == 1 || bitmask === 17) ? baseBind : baseCreateWrapper;\\n\
\\\n\
      return creater([func, bitmask, partialArgs, partialRightArgs, thisArg, arity]);\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Creates compiled iteration functions.\\n\
\\\n\
     *\\n\
\\\n\
     * @private\\n\
\\\n\
     * @param {...Object} [options] The compile options object(s).\\n\
\\\n\
     * @param {string} [options.array] Code to determine if the iterable is an array or array-like.\\n\
\\\n\
     * @param {boolean} [options.useHas] Specify using `hasOwnProperty` checks in the object loop.\\n\
\\\n\
     * @param {Function} [options.keys] A reference to `_.keys` for use in own property iteration.\\n\
\\\n\
     * @param {string} [options.args] A comma separated string of iteration function arguments.\\n\
\\\n\
     * @param {string} [options.top] Code to execute before the iteration branches.\\n\
\\\n\
     * @param {string} [options.loop] Code to execute in the object loop.\\n\
\\\n\
     * @param {string} [options.bottom] Code to execute after the iteration branches.\\n\
\\\n\
     * @returns {Function} Returns the compiled function.\\n\
\\\n\
     */\\n\
\\\n\
    function createIterator() {\\n\
\\\n\
      // data properties\\n\
\\\n\
      iteratorData.shadowedProps = shadowedProps;\\n\
\\\n\
\\n\
\\\n\
      // iterator options\\n\
\\\n\
      iteratorData.array = iteratorData.bottom = iteratorData.loop = iteratorData.top = '';\\n\
\\\n\
      iteratorData.init = 'iterable';\\n\
\\\n\
      iteratorData.useHas = true;\\n\
\\\n\
\\n\
\\\n\
      // merge options into a template data object\\n\
\\\n\
      for (var object, index = 0; object = arguments[index]; index++) {\\n\
\\\n\
        for (var key in object) {\\n\
\\\n\
          iteratorData[key] = object[key];\\n\
\\\n\
        }\\n\
\\\n\
      }\\n\
\\\n\
      var args = iteratorData.args;\\n\
\\\n\
      iteratorData.firstArg = /^[^,]+/.exec(args)[0];\\n\
\\\n\
\\n\
\\\n\
      // create the function factory\\n\
\\\n\
      var factory = Function(\\n\
\\\n\
          'baseCreateCallback, errorClass, errorProto, hasOwnProperty, ' +\\n\
\\\n\
          'indicatorObject, isArguments, isArray, isString, keys, objectProto, ' +\\n\
\\\n\
          'objectTypes, nonEnumProps, stringClass, stringProto, toString',\\n\
\\\n\
        'return function(' + args + ') {\\\\n\
\\\n\
' + iteratorTemplate(iteratorData) + '\\\\n\
\\\n\
}'\\n\
\\\n\
      );\\n\
\\\n\
\\n\
\\\n\
      // return the compiled function\\n\
\\\n\
      return factory(\\n\
\\\n\
        baseCreateCallback, errorClass, errorProto, hasOwnProperty,\\n\
\\\n\
        indicatorObject, isArguments, isArray, isString, iteratorData.keys, objectProto,\\n\
\\\n\
        objectTypes, nonEnumProps, stringClass, stringProto, toString\\n\
\\\n\
      );\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Used by `escape` to convert characters to HTML entities.\\n\
\\\n\
     *\\n\
\\\n\
     * @private\\n\
\\\n\
     * @param {string} match The matched character to escape.\\n\
\\\n\
     * @returns {string} Returns the escaped character.\\n\
\\\n\
     */\\n\
\\\n\
    function escapeHtmlChar(match) {\\n\
\\\n\
      return htmlEscapes[match];\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Gets the appropriate \\\"indexOf\\\" function. If the `_.indexOf` method is\\n\
\\\n\
     * customized this method returns the custom method, otherwise it returns\\n\
\\\n\
     * the `baseIndexOf` function.\\n\
\\\n\
     *\\n\
\\\n\
     * @private\\n\
\\\n\
     * @returns {Function} Returns the \\\"indexOf\\\" function.\\n\
\\\n\
     */\\n\
\\\n\
    function getIndexOf() {\\n\
\\\n\
      var result = (result = lodash.indexOf) === indexOf ? baseIndexOf : result;\\n\
\\\n\
      return result;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Checks if `value` is a native function.\\n\
\\\n\
     *\\n\
\\\n\
     * @private\\n\
\\\n\
     * @param {*} value The value to check.\\n\
\\\n\
     * @returns {boolean} Returns `true` if the `value` is a native function, else `false`.\\n\
\\\n\
     */\\n\
\\\n\
    function isNative(value) {\\n\
\\\n\
      return typeof value == 'function' && reNative.test(value);\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Sets `this` binding data on a given function.\\n\
\\\n\
     *\\n\
\\\n\
     * @private\\n\
\\\n\
     * @param {Function} func The function to set data on.\\n\
\\\n\
     * @param {Array} value The data array to set.\\n\
\\\n\
     */\\n\
\\\n\
    var setBindData = !defineProperty ? noop : function(func, value) {\\n\
\\\n\
      descriptor.value = value;\\n\
\\\n\
      defineProperty(func, '__bindData__', descriptor);\\n\
\\\n\
    };\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * A fallback implementation of `isPlainObject` which checks if a given value\\n\
\\\n\
     * is an object created by the `Object` constructor, assuming objects created\\n\
\\\n\
     * by the `Object` constructor have no inherited enumerable properties and that\\n\
\\\n\
     * there are no `Object.prototype` extensions.\\n\
\\\n\
     *\\n\
\\\n\
     * @private\\n\
\\\n\
     * @param {*} value The value to check.\\n\
\\\n\
     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.\\n\
\\\n\
     */\\n\
\\\n\
    function shimIsPlainObject(value) {\\n\
\\\n\
      var ctor,\\n\
\\\n\
          result;\\n\
\\\n\
\\n\
\\\n\
      // avoid non Object objects, `arguments` objects, and DOM elements\\n\
\\\n\
      if (!(value && toString.call(value) == objectClass) ||\\n\
\\\n\
          (ctor = value.constructor, isFunction(ctor) && !(ctor instanceof ctor)) ||\\n\
\\\n\
          (!support.argsClass && isArguments(value)) ||\\n\
\\\n\
          (!support.nodeClass && isNode(value))) {\\n\
\\\n\
        return false;\\n\
\\\n\
      }\\n\
\\\n\
      // IE < 9 iterates inherited properties before own properties. If the first\\n\
\\\n\
      // iterated property is an object's own property then there are no inherited\\n\
\\\n\
      // enumerable properties.\\n\
\\\n\
      if (support.ownLast) {\\n\
\\\n\
        forIn(value, function(value, key, object) {\\n\
\\\n\
          result = hasOwnProperty.call(object, key);\\n\
\\\n\
          return false;\\n\
\\\n\
        });\\n\
\\\n\
        return result !== false;\\n\
\\\n\
      }\\n\
\\\n\
      // In most environments an object's own properties are iterated before\\n\
\\\n\
      // its inherited properties. If the last iterated property is an object's\\n\
\\\n\
      // own property then there are no inherited enumerable properties.\\n\
\\\n\
      forIn(value, function(value, key) {\\n\
\\\n\
        result = key;\\n\
\\\n\
      });\\n\
\\\n\
      return typeof result == 'undefined' || hasOwnProperty.call(value, result);\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Used by `unescape` to convert HTML entities to characters.\\n\
\\\n\
     *\\n\
\\\n\
     * @private\\n\
\\\n\
     * @param {string} match The matched character to unescape.\\n\
\\\n\
     * @returns {string} Returns the unescaped character.\\n\
\\\n\
     */\\n\
\\\n\
    function unescapeHtmlChar(match) {\\n\
\\\n\
      return htmlUnescapes[match];\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /*--------------------------------------------------------------------------*/\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Checks if `value` is an `arguments` object.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Objects\\n\
\\\n\
     * @param {*} value The value to check.\\n\
\\\n\
     * @returns {boolean} Returns `true` if the `value` is an `arguments` object, else `false`.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * (function() { return _.isArguments(arguments); })(1, 2, 3);\\n\
\\\n\
     * // => true\\n\
\\\n\
     *\\n\
\\\n\
     * _.isArguments([1, 2, 3]);\\n\
\\\n\
     * // => false\\n\
\\\n\
     */\\n\
\\\n\
    function isArguments(value) {\\n\
\\\n\
      return value && typeof value == 'object' && typeof value.length == 'number' &&\\n\
\\\n\
        toString.call(value) == argsClass || false;\\n\
\\\n\
    }\\n\
\\\n\
    // fallback for browsers that can't detect `arguments` objects by [[Class]]\\n\
\\\n\
    if (!support.argsClass) {\\n\
\\\n\
      isArguments = function(value) {\\n\
\\\n\
        return value && typeof value == 'object' && typeof value.length == 'number' &&\\n\
\\\n\
          hasOwnProperty.call(value, 'callee') && !propertyIsEnumerable.call(value, 'callee') || false;\\n\
\\\n\
      };\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Checks if `value` is an array.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @type Function\\n\
\\\n\
     * @category Objects\\n\
\\\n\
     * @param {*} value The value to check.\\n\
\\\n\
     * @returns {boolean} Returns `true` if the `value` is an array, else `false`.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * (function() { return _.isArray(arguments); })();\\n\
\\\n\
     * // => false\\n\
\\\n\
     *\\n\
\\\n\
     * _.isArray([1, 2, 3]);\\n\
\\\n\
     * // => true\\n\
\\\n\
     */\\n\
\\\n\
    var isArray = nativeIsArray || function(value) {\\n\
\\\n\
      return value && typeof value == 'object' && typeof value.length == 'number' &&\\n\
\\\n\
        toString.call(value) == arrayClass || false;\\n\
\\\n\
    };\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * A fallback implementation of `Object.keys` which produces an array of the\\n\
\\\n\
     * given object's own enumerable property names.\\n\
\\\n\
     *\\n\
\\\n\
     * @private\\n\
\\\n\
     * @type Function\\n\
\\\n\
     * @param {Object} object The object to inspect.\\n\
\\\n\
     * @returns {Array} Returns an array of property names.\\n\
\\\n\
     */\\n\
\\\n\
    var shimKeys = createIterator({\\n\
\\\n\
      'args': 'object',\\n\
\\\n\
      'init': '[]',\\n\
\\\n\
      'top': 'if (!(objectTypes[typeof object])) return result',\\n\
\\\n\
      'loop': 'result.push(index)'\\n\
\\\n\
    });\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Creates an array composed of the own enumerable property names of an object.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Objects\\n\
\\\n\
     * @param {Object} object The object to inspect.\\n\
\\\n\
     * @returns {Array} Returns an array of property names.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.keys({ 'one': 1, 'two': 2, 'three': 3 });\\n\
\\\n\
     * // => ['one', 'two', 'three'] (property order is not guaranteed across environments)\\n\
\\\n\
     */\\n\
\\\n\
    var keys = !nativeKeys ? shimKeys : function(object) {\\n\
\\\n\
      if (!isObject(object)) {\\n\
\\\n\
        return [];\\n\
\\\n\
      }\\n\
\\\n\
      if ((support.enumPrototypes && typeof object == 'function') ||\\n\
\\\n\
          (support.nonEnumArgs && object.length && isArguments(object))) {\\n\
\\\n\
        return shimKeys(object);\\n\
\\\n\
      }\\n\
\\\n\
      return nativeKeys(object);\\n\
\\\n\
    };\\n\
\\\n\
\\n\
\\\n\
    /** Reusable iterator options shared by `each`, `forIn`, and `forOwn` */\\n\
\\\n\
    var eachIteratorOptions = {\\n\
\\\n\
      'args': 'collection, callback, thisArg',\\n\
\\\n\
      'top': \\\"callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3)\\\",\\n\
\\\n\
      'array': \\\"typeof length == 'number'\\\",\\n\
\\\n\
      'keys': keys,\\n\
\\\n\
      'loop': 'if (callback(iterable[index], index, collection) === false) return result'\\n\
\\\n\
    };\\n\
\\\n\
\\n\
\\\n\
    /** Reusable iterator options for `assign` and `defaults` */\\n\
\\\n\
    var defaultsIteratorOptions = {\\n\
\\\n\
      'args': 'object, source, guard',\\n\
\\\n\
      'top':\\n\
\\\n\
        'var args = arguments,\\\\n\
\\\n\
' +\\n\
\\\n\
        '    argsIndex = 0,\\\\n\
\\\n\
' +\\n\
\\\n\
        \\\"    argsLength = typeof guard == 'number' ? 2 : args.length;\\\\n\
\\\n\
\\\" +\\n\
\\\n\
        'while (++argsIndex < argsLength) {\\\\n\
\\\n\
' +\\n\
\\\n\
        '  iterable = args[argsIndex];\\\\n\
\\\n\
' +\\n\
\\\n\
        '  if (iterable && objectTypes[typeof iterable]) {',\\n\
\\\n\
      'keys': keys,\\n\
\\\n\
      'loop': \\\"if (typeof result[index] == 'undefined') result[index] = iterable[index]\\\",\\n\
\\\n\
      'bottom': '  }\\\\n\
\\\n\
}'\\n\
\\\n\
    };\\n\
\\\n\
\\n\
\\\n\
    /** Reusable iterator options for `forIn` and `forOwn` */\\n\
\\\n\
    var forOwnIteratorOptions = {\\n\
\\\n\
      'top': 'if (!objectTypes[typeof iterable]) return result;\\\\n\
\\\n\
' + eachIteratorOptions.top,\\n\
\\\n\
      'array': false\\n\
\\\n\
    };\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Used to convert characters to HTML entities:\\n\
\\\n\
     *\\n\
\\\n\
     * Though the `>` character is escaped for symmetry, characters like `>` and `/`\\n\
\\\n\
     * don't require escaping in HTML and have no special meaning unless they're part\\n\
\\\n\
     * of a tag or an unquoted attribute value.\\n\
\\\n\
     * http://mathiasbynens.be/notes/ambiguous-ampersands (under \\\"semi-related fun fact\\\")\\n\
\\\n\
     */\\n\
\\\n\
    var htmlEscapes = {\\n\
\\\n\
      '&': '&amp;',\\n\
\\\n\
      '<': '&lt;',\\n\
\\\n\
      '>': '&gt;',\\n\
\\\n\
      '\\\"': '&quot;',\\n\
\\\n\
      \\\"'\\\": '&#39;'\\n\
\\\n\
    };\\n\
\\\n\
\\n\
\\\n\
    /** Used to convert HTML entities to characters */\\n\
\\\n\
    var htmlUnescapes = invert(htmlEscapes);\\n\
\\\n\
\\n\
\\\n\
    /** Used to match HTML entities and HTML characters */\\n\
\\\n\
    var reEscapedHtml = RegExp('(' + keys(htmlUnescapes).join('|') + ')', 'g'),\\n\
\\\n\
        reUnescapedHtml = RegExp('[' + keys(htmlEscapes).join('') + ']', 'g');\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * A function compiled to iterate `arguments` objects, arrays, objects, and\\n\
\\\n\
     * strings consistenly across environments, executing the callback for each\\n\
\\\n\
     * element in the collection. The callback is bound to `thisArg` and invoked\\n\
\\\n\
     * with three arguments; (value, index|key, collection). Callbacks may exit\\n\
\\\n\
     * iteration early by explicitly returning `false`.\\n\
\\\n\
     *\\n\
\\\n\
     * @private\\n\
\\\n\
     * @type Function\\n\
\\\n\
     * @param {Array|Object|string} collection The collection to iterate over.\\n\
\\\n\
     * @param {Function} [callback=identity] The function called per iteration.\\n\
\\\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\\n\
\\\n\
     * @returns {Array|Object|string} Returns `collection`.\\n\
\\\n\
     */\\n\
\\\n\
    var baseEach = createIterator(eachIteratorOptions);\\n\
\\\n\
\\n\
\\\n\
    /*--------------------------------------------------------------------------*/\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Assigns own enumerable properties of source object(s) to the destination\\n\
\\\n\
     * object. Subsequent sources will overwrite property assignments of previous\\n\
\\\n\
     * sources. If a callback is provided it will be executed to produce the\\n\
\\\n\
     * assigned values. The callback is bound to `thisArg` and invoked with two\\n\
\\\n\
     * arguments; (objectValue, sourceValue).\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @type Function\\n\
\\\n\
     * @alias extend\\n\
\\\n\
     * @category Objects\\n\
\\\n\
     * @param {Object} object The destination object.\\n\
\\\n\
     * @param {...Object} [source] The source objects.\\n\
\\\n\
     * @param {Function} [callback] The function to customize assigning values.\\n\
\\\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\\n\
\\\n\
     * @returns {Object} Returns the destination object.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.assign({ 'name': 'fred' }, { 'employer': 'slate' });\\n\
\\\n\
     * // => { 'name': 'fred', 'employer': 'slate' }\\n\
\\\n\
     *\\n\
\\\n\
     * var defaults = _.partialRight(_.assign, function(a, b) {\\n\
\\\n\
     *   return typeof a == 'undefined' ? b : a;\\n\
\\\n\
     * });\\n\
\\\n\
     *\\n\
\\\n\
     * var object = { 'name': 'barney' };\\n\
\\\n\
     * defaults(object, { 'name': 'fred', 'employer': 'slate' });\\n\
\\\n\
     * // => { 'name': 'barney', 'employer': 'slate' }\\n\
\\\n\
     */\\n\
\\\n\
    var assign = createIterator(defaultsIteratorOptions, {\\n\
\\\n\
      'top':\\n\
\\\n\
        defaultsIteratorOptions.top.replace(';',\\n\
\\\n\
          ';\\\\n\
\\\n\
' +\\n\
\\\n\
          \\\"if (argsLength > 3 && typeof args[argsLength - 2] == 'function') {\\\\n\
\\\n\
\\\" +\\n\
\\\n\
          '  var callback = baseCreateCallback(args[--argsLength - 1], args[argsLength--], 2);\\\\n\
\\\n\
' +\\n\
\\\n\
          \\\"} else if (argsLength > 2 && typeof args[argsLength - 1] == 'function') {\\\\n\
\\\n\
\\\" +\\n\
\\\n\
          '  callback = args[--argsLength];\\\\n\
\\\n\
' +\\n\
\\\n\
          '}'\\n\
\\\n\
        ),\\n\
\\\n\
      'loop': 'result[index] = callback ? callback(result[index], iterable[index]) : iterable[index]'\\n\
\\\n\
    });\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Creates a clone of `value`. If `isDeep` is `true` nested objects will also\\n\
\\\n\
     * be cloned, otherwise they will be assigned by reference. If a callback\\n\
\\\n\
     * is provided it will be executed to produce the cloned values. If the\\n\
\\\n\
     * callback returns `undefined` cloning will be handled by the method instead.\\n\
\\\n\
     * The callback is bound to `thisArg` and invoked with one argument; (value).\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Objects\\n\
\\\n\
     * @param {*} value The value to clone.\\n\
\\\n\
     * @param {boolean} [isDeep=false] Specify a deep clone.\\n\
\\\n\
     * @param {Function} [callback] The function to customize cloning values.\\n\
\\\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\\n\
\\\n\
     * @returns {*} Returns the cloned value.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * var characters = [\\n\
\\\n\
     *   { 'name': 'barney', 'age': 36 },\\n\
\\\n\
     *   { 'name': 'fred',   'age': 40 }\\n\
\\\n\
     * ];\\n\
\\\n\
     *\\n\
\\\n\
     * var shallow = _.clone(characters);\\n\
\\\n\
     * shallow[0] === characters[0];\\n\
\\\n\
     * // => true\\n\
\\\n\
     *\\n\
\\\n\
     * var deep = _.clone(characters, true);\\n\
\\\n\
     * deep[0] === characters[0];\\n\
\\\n\
     * // => false\\n\
\\\n\
     *\\n\
\\\n\
     * _.mixin({\\n\
\\\n\
     *   'clone': _.partialRight(_.clone, function(value) {\\n\
\\\n\
     *     return _.isElement(value) ? value.cloneNode(false) : undefined;\\n\
\\\n\
     *   })\\n\
\\\n\
     * });\\n\
\\\n\
     *\\n\
\\\n\
     * var clone = _.clone(document.body);\\n\
\\\n\
     * clone.childNodes.length;\\n\
\\\n\
     * // => 0\\n\
\\\n\
     */\\n\
\\\n\
    function clone(value, isDeep, callback, thisArg) {\\n\
\\\n\
      // allows working with \\\"Collections\\\" methods without using their `index`\\n\
\\\n\
      // and `collection` arguments for `isDeep` and `callback`\\n\
\\\n\
      if (typeof isDeep != 'boolean' && isDeep != null) {\\n\
\\\n\
        thisArg = callback;\\n\
\\\n\
        callback = isDeep;\\n\
\\\n\
        isDeep = false;\\n\
\\\n\
      }\\n\
\\\n\
      return baseClone(value, isDeep, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 1));\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Creates a deep clone of `value`. If a callback is provided it will be\\n\
\\\n\
     * executed to produce the cloned values. If the callback returns `undefined`\\n\
\\\n\
     * cloning will be handled by the method instead. The callback is bound to\\n\
\\\n\
     * `thisArg` and invoked with one argument; (value).\\n\
\\\n\
     *\\n\
\\\n\
     * Note: This method is loosely based on the structured clone algorithm. Functions\\n\
\\\n\
     * and DOM nodes are **not** cloned. The enumerable properties of `arguments` objects and\\n\
\\\n\
     * objects created by constructors other than `Object` are cloned to plain `Object` objects.\\n\
\\\n\
     * See http://www.w3.org/TR/html5/infrastructure.html#internal-structured-cloning-algorithm.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Objects\\n\
\\\n\
     * @param {*} value The value to deep clone.\\n\
\\\n\
     * @param {Function} [callback] The function to customize cloning values.\\n\
\\\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\\n\
\\\n\
     * @returns {*} Returns the deep cloned value.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * var characters = [\\n\
\\\n\
     *   { 'name': 'barney', 'age': 36 },\\n\
\\\n\
     *   { 'name': 'fred',   'age': 40 }\\n\
\\\n\
     * ];\\n\
\\\n\
     *\\n\
\\\n\
     * var deep = _.cloneDeep(characters);\\n\
\\\n\
     * deep[0] === characters[0];\\n\
\\\n\
     * // => false\\n\
\\\n\
     *\\n\
\\\n\
     * var view = {\\n\
\\\n\
     *   'label': 'docs',\\n\
\\\n\
     *   'node': element\\n\
\\\n\
     * };\\n\
\\\n\
     *\\n\
\\\n\
     * var clone = _.cloneDeep(view, function(value) {\\n\
\\\n\
     *   return _.isElement(value) ? value.cloneNode(true) : undefined;\\n\
\\\n\
     * });\\n\
\\\n\
     *\\n\
\\\n\
     * clone.node == view.node;\\n\
\\\n\
     * // => false\\n\
\\\n\
     */\\n\
\\\n\
    function cloneDeep(value, callback, thisArg) {\\n\
\\\n\
      return baseClone(value, true, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 1));\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Creates an object that inherits from the given `prototype` object. If a\\n\
\\\n\
     * `properties` object is provided its own enumerable properties are assigned\\n\
\\\n\
     * to the created object.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Objects\\n\
\\\n\
     * @param {Object} prototype The object to inherit from.\\n\
\\\n\
     * @param {Object} [properties] The properties to assign to the object.\\n\
\\\n\
     * @returns {Object} Returns the new object.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * function Shape() {\\n\
\\\n\
     *   this.x = 0;\\n\
\\\n\
     *   this.y = 0;\\n\
\\\n\
     * }\\n\
\\\n\
     *\\n\
\\\n\
     * function Circle() {\\n\
\\\n\
     *   Shape.call(this);\\n\
\\\n\
     * }\\n\
\\\n\
     *\\n\
\\\n\
     * Circle.prototype = _.create(Shape.prototype, { 'constructor': Circle });\\n\
\\\n\
     *\\n\
\\\n\
     * var circle = new Circle;\\n\
\\\n\
     * circle instanceof Circle;\\n\
\\\n\
     * // => true\\n\
\\\n\
     *\\n\
\\\n\
     * circle instanceof Shape;\\n\
\\\n\
     * // => true\\n\
\\\n\
     */\\n\
\\\n\
    function create(prototype, properties) {\\n\
\\\n\
      var result = baseCreate(prototype);\\n\
\\\n\
      return properties ? assign(result, properties) : result;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Assigns own enumerable properties of source object(s) to the destination\\n\
\\\n\
     * object for all destination properties that resolve to `undefined`. Once a\\n\
\\\n\
     * property is set, additional defaults of the same property will be ignored.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @type Function\\n\
\\\n\
     * @category Objects\\n\
\\\n\
     * @param {Object} object The destination object.\\n\
\\\n\
     * @param {...Object} [source] The source objects.\\n\
\\\n\
     * @param- {Object} [guard] Allows working with `_.reduce` without using its\\n\
\\\n\
     *  `key` and `object` arguments as sources.\\n\
\\\n\
     * @returns {Object} Returns the destination object.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * var object = { 'name': 'barney' };\\n\
\\\n\
     * _.defaults(object, { 'name': 'fred', 'employer': 'slate' });\\n\
\\\n\
     * // => { 'name': 'barney', 'employer': 'slate' }\\n\
\\\n\
     */\\n\
\\\n\
    var defaults = createIterator(defaultsIteratorOptions);\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * This method is like `_.findIndex` except that it returns the key of the\\n\
\\\n\
     * first element that passes the callback check, instead of the element itself.\\n\
\\\n\
     *\\n\
\\\n\
     * If a property name is provided for `callback` the created \\\"_.pluck\\\" style\\n\
\\\n\
     * callback will return the property value of the given element.\\n\
\\\n\
     *\\n\
\\\n\
     * If an object is provided for `callback` the created \\\"_.where\\\" style callback\\n\
\\\n\
     * will return `true` for elements that have the properties of the given object,\\n\
\\\n\
     * else `false`.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Objects\\n\
\\\n\
     * @param {Object} object The object to search.\\n\
\\\n\
     * @param {Function|Object|string} [callback=identity] The function called per\\n\
\\\n\
     *  iteration. If a property name or object is provided it will be used to\\n\
\\\n\
     *  create a \\\"_.pluck\\\" or \\\"_.where\\\" style callback, respectively.\\n\
\\\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\\n\
\\\n\
     * @returns {string|undefined} Returns the key of the found element, else `undefined`.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * var characters = {\\n\
\\\n\
     *   'barney': {  'age': 36, 'blocked': false },\\n\
\\\n\
     *   'fred': {    'age': 40, 'blocked': true },\\n\
\\\n\
     *   'pebbles': { 'age': 1,  'blocked': false }\\n\
\\\n\
     * };\\n\
\\\n\
     *\\n\
\\\n\
     * _.findKey(characters, function(chr) {\\n\
\\\n\
     *   return chr.age < 40;\\n\
\\\n\
     * });\\n\
\\\n\
     * // => 'barney' (property order is not guaranteed across environments)\\n\
\\\n\
     *\\n\
\\\n\
     * // using \\\"_.where\\\" callback shorthand\\n\
\\\n\
     * _.findKey(characters, { 'age': 1 });\\n\
\\\n\
     * // => 'pebbles'\\n\
\\\n\
     *\\n\
\\\n\
     * // using \\\"_.pluck\\\" callback shorthand\\n\
\\\n\
     * _.findKey(characters, 'blocked');\\n\
\\\n\
     * // => 'fred'\\n\
\\\n\
     */\\n\
\\\n\
    function findKey(object, callback, thisArg) {\\n\
\\\n\
      var result;\\n\
\\\n\
      callback = lodash.createCallback(callback, thisArg, 3);\\n\
\\\n\
      forOwn(object, function(value, key, object) {\\n\
\\\n\
        if (callback(value, key, object)) {\\n\
\\\n\
          result = key;\\n\
\\\n\
          return false;\\n\
\\\n\
        }\\n\
\\\n\
      });\\n\
\\\n\
      return result;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * This method is like `_.findKey` except that it iterates over elements\\n\
\\\n\
     * of a `collection` in the opposite order.\\n\
\\\n\
     *\\n\
\\\n\
     * If a property name is provided for `callback` the created \\\"_.pluck\\\" style\\n\
\\\n\
     * callback will return the property value of the given element.\\n\
\\\n\
     *\\n\
\\\n\
     * If an object is provided for `callback` the created \\\"_.where\\\" style callback\\n\
\\\n\
     * will return `true` for elements that have the properties of the given object,\\n\
\\\n\
     * else `false`.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Objects\\n\
\\\n\
     * @param {Object} object The object to search.\\n\
\\\n\
     * @param {Function|Object|string} [callback=identity] The function called per\\n\
\\\n\
     *  iteration. If a property name or object is provided it will be used to\\n\
\\\n\
     *  create a \\\"_.pluck\\\" or \\\"_.where\\\" style callback, respectively.\\n\
\\\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\\n\
\\\n\
     * @returns {string|undefined} Returns the key of the found element, else `undefined`.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * var characters = {\\n\
\\\n\
     *   'barney': {  'age': 36, 'blocked': true },\\n\
\\\n\
     *   'fred': {    'age': 40, 'blocked': false },\\n\
\\\n\
     *   'pebbles': { 'age': 1,  'blocked': true }\\n\
\\\n\
     * };\\n\
\\\n\
     *\\n\
\\\n\
     * _.findLastKey(characters, function(chr) {\\n\
\\\n\
     *   return chr.age < 40;\\n\
\\\n\
     * });\\n\
\\\n\
     * // => returns `pebbles`, assuming `_.findKey` returns `barney`\\n\
\\\n\
     *\\n\
\\\n\
     * // using \\\"_.where\\\" callback shorthand\\n\
\\\n\
     * _.findLastKey(characters, { 'age': 40 });\\n\
\\\n\
     * // => 'fred'\\n\
\\\n\
     *\\n\
\\\n\
     * // using \\\"_.pluck\\\" callback shorthand\\n\
\\\n\
     * _.findLastKey(characters, 'blocked');\\n\
\\\n\
     * // => 'pebbles'\\n\
\\\n\
     */\\n\
\\\n\
    function findLastKey(object, callback, thisArg) {\\n\
\\\n\
      var result;\\n\
\\\n\
      callback = lodash.createCallback(callback, thisArg, 3);\\n\
\\\n\
      forOwnRight(object, function(value, key, object) {\\n\
\\\n\
        if (callback(value, key, object)) {\\n\
\\\n\
          result = key;\\n\
\\\n\
          return false;\\n\
\\\n\
        }\\n\
\\\n\
      });\\n\
\\\n\
      return result;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Iterates over own and inherited enumerable properties of an object,\\n\
\\\n\
     * executing the callback for each property. The callback is bound to `thisArg`\\n\
\\\n\
     * and invoked with three arguments; (value, key, object). Callbacks may exit\\n\
\\\n\
     * iteration early by explicitly returning `false`.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @type Function\\n\
\\\n\
     * @category Objects\\n\
\\\n\
     * @param {Object} object The object to iterate over.\\n\
\\\n\
     * @param {Function} [callback=identity] The function called per iteration.\\n\
\\\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\\n\
\\\n\
     * @returns {Object} Returns `object`.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * function Shape() {\\n\
\\\n\
     *   this.x = 0;\\n\
\\\n\
     *   this.y = 0;\\n\
\\\n\
     * }\\n\
\\\n\
     *\\n\
\\\n\
     * Shape.prototype.move = function(x, y) {\\n\
\\\n\
     *   this.x += x;\\n\
\\\n\
     *   this.y += y;\\n\
\\\n\
     * };\\n\
\\\n\
     *\\n\
\\\n\
     * _.forIn(new Shape, function(value, key) {\\n\
\\\n\
     *   console.log(key);\\n\
\\\n\
     * });\\n\
\\\n\
     * // => logs 'x', 'y', and 'move' (property order is not guaranteed across environments)\\n\
\\\n\
     */\\n\
\\\n\
    var forIn = createIterator(eachIteratorOptions, forOwnIteratorOptions, {\\n\
\\\n\
      'useHas': false\\n\
\\\n\
    });\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * This method is like `_.forIn` except that it iterates over elements\\n\
\\\n\
     * of a `collection` in the opposite order.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Objects\\n\
\\\n\
     * @param {Object} object The object to iterate over.\\n\
\\\n\
     * @param {Function} [callback=identity] The function called per iteration.\\n\
\\\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\\n\
\\\n\
     * @returns {Object} Returns `object`.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * function Shape() {\\n\
\\\n\
     *   this.x = 0;\\n\
\\\n\
     *   this.y = 0;\\n\
\\\n\
     * }\\n\
\\\n\
     *\\n\
\\\n\
     * Shape.prototype.move = function(x, y) {\\n\
\\\n\
     *   this.x += x;\\n\
\\\n\
     *   this.y += y;\\n\
\\\n\
     * };\\n\
\\\n\
     *\\n\
\\\n\
     * _.forInRight(new Shape, function(value, key) {\\n\
\\\n\
     *   console.log(key);\\n\
\\\n\
     * });\\n\
\\\n\
     * // => logs 'move', 'y', and 'x' assuming `_.forIn ` logs 'x', 'y', and 'move'\\n\
\\\n\
     */\\n\
\\\n\
    function forInRight(object, callback, thisArg) {\\n\
\\\n\
      var pairs = [];\\n\
\\\n\
\\n\
\\\n\
      forIn(object, function(value, key) {\\n\
\\\n\
        pairs.push(key, value);\\n\
\\\n\
      });\\n\
\\\n\
\\n\
\\\n\
      var length = pairs.length;\\n\
\\\n\
      callback = baseCreateCallback(callback, thisArg, 3);\\n\
\\\n\
      while (length--) {\\n\
\\\n\
        if (callback(pairs[length--], pairs[length], object) === false) {\\n\
\\\n\
          break;\\n\
\\\n\
        }\\n\
\\\n\
      }\\n\
\\\n\
      return object;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Iterates over own enumerable properties of an object, executing the callback\\n\
\\\n\
     * for each property. The callback is bound to `thisArg` and invoked with three\\n\
\\\n\
     * arguments; (value, key, object). Callbacks may exit iteration early by\\n\
\\\n\
     * explicitly returning `false`.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @type Function\\n\
\\\n\
     * @category Objects\\n\
\\\n\
     * @param {Object} object The object to iterate over.\\n\
\\\n\
     * @param {Function} [callback=identity] The function called per iteration.\\n\
\\\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\\n\
\\\n\
     * @returns {Object} Returns `object`.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.forOwn({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {\\n\
\\\n\
     *   console.log(key);\\n\
\\\n\
     * });\\n\
\\\n\
     * // => logs '0', '1', and 'length' (property order is not guaranteed across environments)\\n\
\\\n\
     */\\n\
\\\n\
    var forOwn = createIterator(eachIteratorOptions, forOwnIteratorOptions);\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * This method is like `_.forOwn` except that it iterates over elements\\n\
\\\n\
     * of a `collection` in the opposite order.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Objects\\n\
\\\n\
     * @param {Object} object The object to iterate over.\\n\
\\\n\
     * @param {Function} [callback=identity] The function called per iteration.\\n\
\\\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\\n\
\\\n\
     * @returns {Object} Returns `object`.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.forOwnRight({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {\\n\
\\\n\
     *   console.log(key);\\n\
\\\n\
     * });\\n\
\\\n\
     * // => logs 'length', '1', and '0' assuming `_.forOwn` logs '0', '1', and 'length'\\n\
\\\n\
     */\\n\
\\\n\
    function forOwnRight(object, callback, thisArg) {\\n\
\\\n\
      var props = keys(object),\\n\
\\\n\
          length = props.length;\\n\
\\\n\
\\n\
\\\n\
      callback = baseCreateCallback(callback, thisArg, 3);\\n\
\\\n\
      while (length--) {\\n\
\\\n\
        var key = props[length];\\n\
\\\n\
        if (callback(object[key], key, object) === false) {\\n\
\\\n\
          break;\\n\
\\\n\
        }\\n\
\\\n\
      }\\n\
\\\n\
      return object;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Creates a sorted array of property names of all enumerable properties,\\n\
\\\n\
     * own and inherited, of `object` that have function values.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @alias methods\\n\
\\\n\
     * @category Objects\\n\
\\\n\
     * @param {Object} object The object to inspect.\\n\
\\\n\
     * @returns {Array} Returns an array of property names that have function values.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.functions(_);\\n\
\\\n\
     * // => ['all', 'any', 'bind', 'bindAll', 'clone', 'compact', 'compose', ...]\\n\
\\\n\
     */\\n\
\\\n\
    function functions(object) {\\n\
\\\n\
      var result = [];\\n\
\\\n\
      forIn(object, function(value, key) {\\n\
\\\n\
        if (isFunction(value)) {\\n\
\\\n\
          result.push(key);\\n\
\\\n\
        }\\n\
\\\n\
      });\\n\
\\\n\
      return result.sort();\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Checks if the specified property name exists as a direct property of `object`,\\n\
\\\n\
     * instead of an inherited property.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Objects\\n\
\\\n\
     * @param {Object} object The object to inspect.\\n\
\\\n\
     * @param {string} key The name of the property to check.\\n\
\\\n\
     * @returns {boolean} Returns `true` if key is a direct property, else `false`.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.has({ 'a': 1, 'b': 2, 'c': 3 }, 'b');\\n\
\\\n\
     * // => true\\n\
\\\n\
     */\\n\
\\\n\
    function has(object, key) {\\n\
\\\n\
      return object ? hasOwnProperty.call(object, key) : false;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Creates an object composed of the inverted keys and values of the given\\n\
\\\n\
     * object. If the given object contains duplicate values, subsequent values\\n\
\\\n\
     * will overwrite property assignments of previous values unless `multiValue`\\n\
\\\n\
     * is `true`.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Objects\\n\
\\\n\
     * @param {Object} object The object to invert.\\n\
\\\n\
     * @param {boolean} [multiValue=false] Allow multiple values per key.\\n\
\\\n\
     * @returns {Object} Returns the created inverted object.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.invert({ 'first': 'fred', 'second': 'barney' });\\n\
\\\n\
     * // => { 'fred': 'first', 'barney': 'second' }\\n\
\\\n\
     *\\n\
\\\n\
     * // without `multiValue`\\n\
\\\n\
     * _.invert({ 'first': 'fred', 'second': 'barney', 'third': 'fred' });\\n\
\\\n\
     * // => { 'fred': 'third', 'barney': 'second' }\\n\
\\\n\
     *\\n\
\\\n\
     * // with `multiValue`\\n\
\\\n\
     * _.invert({ 'first': 'fred', 'second': 'barney', 'third': 'fred' }, true);\\n\
\\\n\
     * // => { 'fred': ['first', 'third'], 'barney': 'second' }\\n\
\\\n\
     */\\n\
\\\n\
    function invert(object, multiValue) {\\n\
\\\n\
      var index = -1,\\n\
\\\n\
          props = keys(object),\\n\
\\\n\
          length = props.length,\\n\
\\\n\
          result = {};\\n\
\\\n\
\\n\
\\\n\
      while (++index < length) {\\n\
\\\n\
        var key = props[index],\\n\
\\\n\
            value = object[key];\\n\
\\\n\
\\n\
\\\n\
        if (multiValue && hasOwnProperty.call(result, value)) {\\n\
\\\n\
          if (typeof result[value] == 'string') {\\n\
\\\n\
            result[value] = [result[value]];\\n\
\\\n\
          }\\n\
\\\n\
          result[value].push(key);\\n\
\\\n\
        }\\n\
\\\n\
        else {\\n\
\\\n\
          result[value] = key;\\n\
\\\n\
        }\\n\
\\\n\
      }\\n\
\\\n\
      return result;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Checks if `value` is a boolean value.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Objects\\n\
\\\n\
     * @param {*} value The value to check.\\n\
\\\n\
     * @returns {boolean} Returns `true` if the `value` is a boolean value, else `false`.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.isBoolean(null);\\n\
\\\n\
     * // => false\\n\
\\\n\
     */\\n\
\\\n\
    function isBoolean(value) {\\n\
\\\n\
      return value === true || value === false ||\\n\
\\\n\
        value && typeof value == 'object' && toString.call(value) == boolClass || false;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Checks if `value` is a date.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Objects\\n\
\\\n\
     * @param {*} value The value to check.\\n\
\\\n\
     * @returns {boolean} Returns `true` if the `value` is a date, else `false`.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.isDate(new Date);\\n\
\\\n\
     * // => true\\n\
\\\n\
     */\\n\
\\\n\
    function isDate(value) {\\n\
\\\n\
      return value && typeof value == 'object' && toString.call(value) == dateClass || false;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Checks if `value` is a DOM element.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Objects\\n\
\\\n\
     * @param {*} value The value to check.\\n\
\\\n\
     * @returns {boolean} Returns `true` if the `value` is a DOM element, else `false`.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.isElement(document.body);\\n\
\\\n\
     * // => true\\n\
\\\n\
     */\\n\
\\\n\
    function isElement(value) {\\n\
\\\n\
      return value && value.nodeType === 1 || false;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Checks if `value` is empty. Arrays, strings, or `arguments` objects with a\\n\
\\\n\
     * length of `0` and objects with no own enumerable properties are considered\\n\
\\\n\
     * \\\"empty\\\".\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Objects\\n\
\\\n\
     * @param {Array|Object|string} value The value to inspect.\\n\
\\\n\
     * @returns {boolean} Returns `true` if the `value` is empty, else `false`.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.isEmpty([1, 2, 3]);\\n\
\\\n\
     * // => false\\n\
\\\n\
     *\\n\
\\\n\
     * _.isEmpty({});\\n\
\\\n\
     * // => true\\n\
\\\n\
     *\\n\
\\\n\
     * _.isEmpty('');\\n\
\\\n\
     * // => true\\n\
\\\n\
     */\\n\
\\\n\
    function isEmpty(value) {\\n\
\\\n\
      var result = true;\\n\
\\\n\
      if (!value) {\\n\
\\\n\
        return result;\\n\
\\\n\
      }\\n\
\\\n\
      var className = toString.call(value),\\n\
\\\n\
          length = value.length;\\n\
\\\n\
\\n\
\\\n\
      if ((className == arrayClass || className == stringClass ||\\n\
\\\n\
          (support.argsClass ? className == argsClass : isArguments(value))) ||\\n\
\\\n\
          (className == objectClass && typeof length == 'number' && isFunction(value.splice))) {\\n\
\\\n\
        return !length;\\n\
\\\n\
      }\\n\
\\\n\
      forOwn(value, function() {\\n\
\\\n\
        return (result = false);\\n\
\\\n\
      });\\n\
\\\n\
      return result;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Performs a deep comparison between two values to determine if they are\\n\
\\\n\
     * equivalent to each other. If a callback is provided it will be executed\\n\
\\\n\
     * to compare values. If the callback returns `undefined` comparisons will\\n\
\\\n\
     * be handled by the method instead. The callback is bound to `thisArg` and\\n\
\\\n\
     * invoked with two arguments; (a, b).\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Objects\\n\
\\\n\
     * @param {*} a The value to compare.\\n\
\\\n\
     * @param {*} b The other value to compare.\\n\
\\\n\
     * @param {Function} [callback] The function to customize comparing values.\\n\
\\\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\\n\
\\\n\
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * var object = { 'name': 'fred' };\\n\
\\\n\
     * var copy = { 'name': 'fred' };\\n\
\\\n\
     *\\n\
\\\n\
     * object == copy;\\n\
\\\n\
     * // => false\\n\
\\\n\
     *\\n\
\\\n\
     * _.isEqual(object, copy);\\n\
\\\n\
     * // => true\\n\
\\\n\
     *\\n\
\\\n\
     * var words = ['hello', 'goodbye'];\\n\
\\\n\
     * var otherWords = ['hi', 'goodbye'];\\n\
\\\n\
     *\\n\
\\\n\
     * _.isEqual(words, otherWords, function(a, b) {\\n\
\\\n\
     *   var reGreet = /^(?:hello|hi)$/i,\\n\
\\\n\
     *       aGreet = _.isString(a) && reGreet.test(a),\\n\
\\\n\
     *       bGreet = _.isString(b) && reGreet.test(b);\\n\
\\\n\
     *\\n\
\\\n\
     *   return (aGreet || bGreet) ? (aGreet == bGreet) : undefined;\\n\
\\\n\
     * });\\n\
\\\n\
     * // => true\\n\
\\\n\
     */\\n\
\\\n\
    function isEqual(a, b, callback, thisArg) {\\n\
\\\n\
      return baseIsEqual(a, b, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 2));\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Checks if `value` is, or can be coerced to, a finite number.\\n\
\\\n\
     *\\n\
\\\n\
     * Note: This is not the same as native `isFinite` which will return true for\\n\
\\\n\
     * booleans and empty strings. See http://es5.github.io/#x15.1.2.5.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Objects\\n\
\\\n\
     * @param {*} value The value to check.\\n\
\\\n\
     * @returns {boolean} Returns `true` if the `value` is finite, else `false`.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.isFinite(-101);\\n\
\\\n\
     * // => true\\n\
\\\n\
     *\\n\
\\\n\
     * _.isFinite('10');\\n\
\\\n\
     * // => true\\n\
\\\n\
     *\\n\
\\\n\
     * _.isFinite(true);\\n\
\\\n\
     * // => false\\n\
\\\n\
     *\\n\
\\\n\
     * _.isFinite('');\\n\
\\\n\
     * // => false\\n\
\\\n\
     *\\n\
\\\n\
     * _.isFinite(Infinity);\\n\
\\\n\
     * // => false\\n\
\\\n\
     */\\n\
\\\n\
    function isFinite(value) {\\n\
\\\n\
      return nativeIsFinite(value) && !nativeIsNaN(parseFloat(value));\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Checks if `value` is a function.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Objects\\n\
\\\n\
     * @param {*} value The value to check.\\n\
\\\n\
     * @returns {boolean} Returns `true` if the `value` is a function, else `false`.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.isFunction(_);\\n\
\\\n\
     * // => true\\n\
\\\n\
     */\\n\
\\\n\
    function isFunction(value) {\\n\
\\\n\
      return typeof value == 'function';\\n\
\\\n\
    }\\n\
\\\n\
    // fallback for older versions of Chrome and Safari\\n\
\\\n\
    if (isFunction(/x/)) {\\n\
\\\n\
      isFunction = function(value) {\\n\
\\\n\
        return typeof value == 'function' && toString.call(value) == funcClass;\\n\
\\\n\
      };\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Checks if `value` is the language type of Object.\\n\
\\\n\
     * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Objects\\n\
\\\n\
     * @param {*} value The value to check.\\n\
\\\n\
     * @returns {boolean} Returns `true` if the `value` is an object, else `false`.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.isObject({});\\n\
\\\n\
     * // => true\\n\
\\\n\
     *\\n\
\\\n\
     * _.isObject([1, 2, 3]);\\n\
\\\n\
     * // => true\\n\
\\\n\
     *\\n\
\\\n\
     * _.isObject(1);\\n\
\\\n\
     * // => false\\n\
\\\n\
     */\\n\
\\\n\
    function isObject(value) {\\n\
\\\n\
      // check if the value is the ECMAScript language type of Object\\n\
\\\n\
      // http://es5.github.io/#x8\\n\
\\\n\
      // and avoid a V8 bug\\n\
\\\n\
      // http://code.google.com/p/v8/issues/detail?id=2291\\n\
\\\n\
      return !!(value && objectTypes[typeof value]);\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Checks if `value` is `NaN`.\\n\
\\\n\
     *\\n\
\\\n\
     * Note: This is not the same as native `isNaN` which will return `true` for\\n\
\\\n\
     * `undefined` and other non-numeric values. See http://es5.github.io/#x15.1.2.4.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Objects\\n\
\\\n\
     * @param {*} value The value to check.\\n\
\\\n\
     * @returns {boolean} Returns `true` if the `value` is `NaN`, else `false`.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.isNaN(NaN);\\n\
\\\n\
     * // => true\\n\
\\\n\
     *\\n\
\\\n\
     * _.isNaN(new Number(NaN));\\n\
\\\n\
     * // => true\\n\
\\\n\
     *\\n\
\\\n\
     * isNaN(undefined);\\n\
\\\n\
     * // => true\\n\
\\\n\
     *\\n\
\\\n\
     * _.isNaN(undefined);\\n\
\\\n\
     * // => false\\n\
\\\n\
     */\\n\
\\\n\
    function isNaN(value) {\\n\
\\\n\
      // `NaN` as a primitive is the only value that is not equal to itself\\n\
\\\n\
      // (perform the [[Class]] check first to avoid errors with some host objects in IE)\\n\
\\\n\
      return isNumber(value) && value != +value;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Checks if `value` is `null`.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Objects\\n\
\\\n\
     * @param {*} value The value to check.\\n\
\\\n\
     * @returns {boolean} Returns `true` if the `value` is `null`, else `false`.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.isNull(null);\\n\
\\\n\
     * // => true\\n\
\\\n\
     *\\n\
\\\n\
     * _.isNull(undefined);\\n\
\\\n\
     * // => false\\n\
\\\n\
     */\\n\
\\\n\
    function isNull(value) {\\n\
\\\n\
      return value === null;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Checks if `value` is a number.\\n\
\\\n\
     *\\n\
\\\n\
     * Note: `NaN` is considered a number. See http://es5.github.io/#x8.5.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Objects\\n\
\\\n\
     * @param {*} value The value to check.\\n\
\\\n\
     * @returns {boolean} Returns `true` if the `value` is a number, else `false`.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.isNumber(8.4 * 5);\\n\
\\\n\
     * // => true\\n\
\\\n\
     */\\n\
\\\n\
    function isNumber(value) {\\n\
\\\n\
      return typeof value == 'number' ||\\n\
\\\n\
        value && typeof value == 'object' && toString.call(value) == numberClass || false;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Checks if `value` is an object created by the `Object` constructor.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Objects\\n\
\\\n\
     * @param {*} value The value to check.\\n\
\\\n\
     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * function Shape() {\\n\
\\\n\
     *   this.x = 0;\\n\
\\\n\
     *   this.y = 0;\\n\
\\\n\
     * }\\n\
\\\n\
     *\\n\
\\\n\
     * _.isPlainObject(new Shape);\\n\
\\\n\
     * // => false\\n\
\\\n\
     *\\n\
\\\n\
     * _.isPlainObject([1, 2, 3]);\\n\
\\\n\
     * // => false\\n\
\\\n\
     *\\n\
\\\n\
     * _.isPlainObject({ 'x': 0, 'y': 0 });\\n\
\\\n\
     * // => true\\n\
\\\n\
     */\\n\
\\\n\
    var isPlainObject = !getPrototypeOf ? shimIsPlainObject : function(value) {\\n\
\\\n\
      if (!(value && toString.call(value) == objectClass) || (!support.argsClass && isArguments(value))) {\\n\
\\\n\
        return false;\\n\
\\\n\
      }\\n\
\\\n\
      var valueOf = value.valueOf,\\n\
\\\n\
          objProto = isNative(valueOf) && (objProto = getPrototypeOf(valueOf)) && getPrototypeOf(objProto);\\n\
\\\n\
\\n\
\\\n\
      return objProto\\n\
\\\n\
        ? (value == objProto || getPrototypeOf(value) == objProto)\\n\
\\\n\
        : shimIsPlainObject(value);\\n\
\\\n\
    };\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Checks if `value` is a regular expression.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Objects\\n\
\\\n\
     * @param {*} value The value to check.\\n\
\\\n\
     * @returns {boolean} Returns `true` if the `value` is a regular expression, else `false`.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.isRegExp(/fred/);\\n\
\\\n\
     * // => true\\n\
\\\n\
     */\\n\
\\\n\
    function isRegExp(value) {\\n\
\\\n\
      return value && objectTypes[typeof value] && toString.call(value) == regexpClass || false;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Checks if `value` is a string.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Objects\\n\
\\\n\
     * @param {*} value The value to check.\\n\
\\\n\
     * @returns {boolean} Returns `true` if the `value` is a string, else `false`.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.isString('fred');\\n\
\\\n\
     * // => true\\n\
\\\n\
     */\\n\
\\\n\
    function isString(value) {\\n\
\\\n\
      return typeof value == 'string' ||\\n\
\\\n\
        value && typeof value == 'object' && toString.call(value) == stringClass || false;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Checks if `value` is `undefined`.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Objects\\n\
\\\n\
     * @param {*} value The value to check.\\n\
\\\n\
     * @returns {boolean} Returns `true` if the `value` is `undefined`, else `false`.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.isUndefined(void 0);\\n\
\\\n\
     * // => true\\n\
\\\n\
     */\\n\
\\\n\
    function isUndefined(value) {\\n\
\\\n\
      return typeof value == 'undefined';\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Creates an object with the same keys as `object` and values generated by\\n\
\\\n\
     * running each own enumerable property of `object` through the callback.\\n\
\\\n\
     * The callback is bound to `thisArg` and invoked with three arguments;\\n\
\\\n\
     * (value, key, object).\\n\
\\\n\
     *\\n\
\\\n\
     * If a property name is provided for `callback` the created \\\"_.pluck\\\" style\\n\
\\\n\
     * callback will return the property value of the given element.\\n\
\\\n\
     *\\n\
\\\n\
     * If an object is provided for `callback` the created \\\"_.where\\\" style callback\\n\
\\\n\
     * will return `true` for elements that have the properties of the given object,\\n\
\\\n\
     * else `false`.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Objects\\n\
\\\n\
     * @param {Object} object The object to iterate over.\\n\
\\\n\
     * @param {Function|Object|string} [callback=identity] The function called\\n\
\\\n\
     *  per iteration. If a property name or object is provided it will be used\\n\
\\\n\
     *  to create a \\\"_.pluck\\\" or \\\"_.where\\\" style callback, respectively.\\n\
\\\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\\n\
\\\n\
     * @returns {Array} Returns a new object with values of the results of each `callback` execution.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.mapValues({ 'a': 1, 'b': 2, 'c': 3} , function(num) { return num * 3; });\\n\
\\\n\
     * // => { 'a': 3, 'b': 6, 'c': 9 }\\n\
\\\n\
     *\\n\
\\\n\
     * var characters = {\\n\
\\\n\
     *   'fred': { 'name': 'fred', 'age': 40 },\\n\
\\\n\
     *   'pebbles': { 'name': 'pebbles', 'age': 1 }\\n\
\\\n\
     * };\\n\
\\\n\
     *\\n\
\\\n\
     * // using \\\"_.pluck\\\" callback shorthand\\n\
\\\n\
     * _.mapValues(characters, 'age');\\n\
\\\n\
     * // => { 'fred': 40, 'pebbles': 1 }\\n\
\\\n\
     */\\n\
\\\n\
    function mapValues(object, callback, thisArg) {\\n\
\\\n\
      var result = {};\\n\
\\\n\
      callback = lodash.createCallback(callback, thisArg, 3);\\n\
\\\n\
\\n\
\\\n\
      forOwn(object, function(value, key, object) {\\n\
\\\n\
        result[key] = callback(value, key, object);\\n\
\\\n\
      });\\n\
\\\n\
      return result;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Recursively merges own enumerable properties of the source object(s), that\\n\
\\\n\
     * don't resolve to `undefined` into the destination object. Subsequent sources\\n\
\\\n\
     * will overwrite property assignments of previous sources. If a callback is\\n\
\\\n\
     * provided it will be executed to produce the merged values of the destination\\n\
\\\n\
     * and source properties. If the callback returns `undefined` merging will\\n\
\\\n\
     * be handled by the method instead. The callback is bound to `thisArg` and\\n\
\\\n\
     * invoked with two arguments; (objectValue, sourceValue).\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Objects\\n\
\\\n\
     * @param {Object} object The destination object.\\n\
\\\n\
     * @param {...Object} [source] The source objects.\\n\
\\\n\
     * @param {Function} [callback] The function to customize merging properties.\\n\
\\\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\\n\
\\\n\
     * @returns {Object} Returns the destination object.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * var names = {\\n\
\\\n\
     *   'characters': [\\n\
\\\n\
     *     { 'name': 'barney' },\\n\
\\\n\
     *     { 'name': 'fred' }\\n\
\\\n\
     *   ]\\n\
\\\n\
     * };\\n\
\\\n\
     *\\n\
\\\n\
     * var ages = {\\n\
\\\n\
     *   'characters': [\\n\
\\\n\
     *     { 'age': 36 },\\n\
\\\n\
     *     { 'age': 40 }\\n\
\\\n\
     *   ]\\n\
\\\n\
     * };\\n\
\\\n\
     *\\n\
\\\n\
     * _.merge(names, ages);\\n\
\\\n\
     * // => { 'characters': [{ 'name': 'barney', 'age': 36 }, { 'name': 'fred', 'age': 40 }] }\\n\
\\\n\
     *\\n\
\\\n\
     * var food = {\\n\
\\\n\
     *   'fruits': ['apple'],\\n\
\\\n\
     *   'vegetables': ['beet']\\n\
\\\n\
     * };\\n\
\\\n\
     *\\n\
\\\n\
     * var otherFood = {\\n\
\\\n\
     *   'fruits': ['banana'],\\n\
\\\n\
     *   'vegetables': ['carrot']\\n\
\\\n\
     * };\\n\
\\\n\
     *\\n\
\\\n\
     * _.merge(food, otherFood, function(a, b) {\\n\
\\\n\
     *   return _.isArray(a) ? a.concat(b) : undefined;\\n\
\\\n\
     * });\\n\
\\\n\
     * // => { 'fruits': ['apple', 'banana'], 'vegetables': ['beet', 'carrot] }\\n\
\\\n\
     */\\n\
\\\n\
    function merge(object) {\\n\
\\\n\
      var args = arguments,\\n\
\\\n\
          length = 2;\\n\
\\\n\
\\n\
\\\n\
      if (!isObject(object)) {\\n\
\\\n\
        return object;\\n\
\\\n\
      }\\n\
\\\n\
      // allows working with `_.reduce` and `_.reduceRight` without using\\n\
\\\n\
      // their `index` and `collection` arguments\\n\
\\\n\
      if (typeof args[2] != 'number') {\\n\
\\\n\
        length = args.length;\\n\
\\\n\
      }\\n\
\\\n\
      if (length > 3 && typeof args[length - 2] == 'function') {\\n\
\\\n\
        var callback = baseCreateCallback(args[--length - 1], args[length--], 2);\\n\
\\\n\
      } else if (length > 2 && typeof args[length - 1] == 'function') {\\n\
\\\n\
        callback = args[--length];\\n\
\\\n\
      }\\n\
\\\n\
      var sources = slice(arguments, 1, length),\\n\
\\\n\
          index = -1,\\n\
\\\n\
          stackA = getArray(),\\n\
\\\n\
          stackB = getArray();\\n\
\\\n\
\\n\
\\\n\
      while (++index < length) {\\n\
\\\n\
        baseMerge(object, sources[index], callback, stackA, stackB);\\n\
\\\n\
      }\\n\
\\\n\
      releaseArray(stackA);\\n\
\\\n\
      releaseArray(stackB);\\n\
\\\n\
      return object;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Creates a shallow clone of `object` excluding the specified properties.\\n\
\\\n\
     * Property names may be specified as individual arguments or as arrays of\\n\
\\\n\
     * property names. If a callback is provided it will be executed for each\\n\
\\\n\
     * property of `object` omitting the properties the callback returns truey\\n\
\\\n\
     * for. The callback is bound to `thisArg` and invoked with three arguments;\\n\
\\\n\
     * (value, key, object).\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Objects\\n\
\\\n\
     * @param {Object} object The source object.\\n\
\\\n\
     * @param {Function|...string|string[]} [callback] The properties to omit or the\\n\
\\\n\
     *  function called per iteration.\\n\
\\\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\\n\
\\\n\
     * @returns {Object} Returns an object without the omitted properties.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.omit({ 'name': 'fred', 'age': 40 }, 'age');\\n\
\\\n\
     * // => { 'name': 'fred' }\\n\
\\\n\
     *\\n\
\\\n\
     * _.omit({ 'name': 'fred', 'age': 40 }, function(value) {\\n\
\\\n\
     *   return typeof value == 'number';\\n\
\\\n\
     * });\\n\
\\\n\
     * // => { 'name': 'fred' }\\n\
\\\n\
     */\\n\
\\\n\
    function omit(object, callback, thisArg) {\\n\
\\\n\
      var result = {};\\n\
\\\n\
      if (typeof callback != 'function') {\\n\
\\\n\
        var props = [];\\n\
\\\n\
        forIn(object, function(value, key) {\\n\
\\\n\
          props.push(key);\\n\
\\\n\
        });\\n\
\\\n\
        props = baseDifference(props, baseFlatten(arguments, true, false, 1));\\n\
\\\n\
\\n\
\\\n\
        var index = -1,\\n\
\\\n\
            length = props.length;\\n\
\\\n\
\\n\
\\\n\
        while (++index < length) {\\n\
\\\n\
          var key = props[index];\\n\
\\\n\
          result[key] = object[key];\\n\
\\\n\
        }\\n\
\\\n\
      } else {\\n\
\\\n\
        callback = lodash.createCallback(callback, thisArg, 3);\\n\
\\\n\
        forIn(object, function(value, key, object) {\\n\
\\\n\
          if (!callback(value, key, object)) {\\n\
\\\n\
            result[key] = value;\\n\
\\\n\
          }\\n\
\\\n\
        });\\n\
\\\n\
      }\\n\
\\\n\
      return result;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Creates a two dimensional array of an object's key-value pairs,\\n\
\\\n\
     * i.e. `[[key1, value1], [key2, value2]]`.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Objects\\n\
\\\n\
     * @param {Object} object The object to inspect.\\n\
\\\n\
     * @returns {Array} Returns new array of key-value pairs.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.pairs({ 'barney': 36, 'fred': 40 });\\n\
\\\n\
     * // => [['barney', 36], ['fred', 40]] (property order is not guaranteed across environments)\\n\
\\\n\
     */\\n\
\\\n\
    function pairs(object) {\\n\
\\\n\
      var index = -1,\\n\
\\\n\
          props = keys(object),\\n\
\\\n\
          length = props.length,\\n\
\\\n\
          result = Array(length);\\n\
\\\n\
\\n\
\\\n\
      while (++index < length) {\\n\
\\\n\
        var key = props[index];\\n\
\\\n\
        result[index] = [key, object[key]];\\n\
\\\n\
      }\\n\
\\\n\
      return result;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Creates a shallow clone of `object` composed of the specified properties.\\n\
\\\n\
     * Property names may be specified as individual arguments or as arrays of\\n\
\\\n\
     * property names. If a callback is provided it will be executed for each\\n\
\\\n\
     * property of `object` picking the properties the callback returns truey\\n\
\\\n\
     * for. The callback is bound to `thisArg` and invoked with three arguments;\\n\
\\\n\
     * (value, key, object).\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Objects\\n\
\\\n\
     * @param {Object} object The source object.\\n\
\\\n\
     * @param {Function|...string|string[]} [callback] The function called per\\n\
\\\n\
     *  iteration or property names to pick, specified as individual property\\n\
\\\n\
     *  names or arrays of property names.\\n\
\\\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\\n\
\\\n\
     * @returns {Object} Returns an object composed of the picked properties.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.pick({ 'name': 'fred', '_userid': 'fred1' }, 'name');\\n\
\\\n\
     * // => { 'name': 'fred' }\\n\
\\\n\
     *\\n\
\\\n\
     * _.pick({ 'name': 'fred', '_userid': 'fred1' }, function(value, key) {\\n\
\\\n\
     *   return key.charAt(0) != '_';\\n\
\\\n\
     * });\\n\
\\\n\
     * // => { 'name': 'fred' }\\n\
\\\n\
     */\\n\
\\\n\
    function pick(object, callback, thisArg) {\\n\
\\\n\
      var result = {};\\n\
\\\n\
      if (typeof callback != 'function') {\\n\
\\\n\
        var index = -1,\\n\
\\\n\
            props = baseFlatten(arguments, true, false, 1),\\n\
\\\n\
            length = isObject(object) ? props.length : 0;\\n\
\\\n\
\\n\
\\\n\
        while (++index < length) {\\n\
\\\n\
          var key = props[index];\\n\
\\\n\
          if (key in object) {\\n\
\\\n\
            result[key] = object[key];\\n\
\\\n\
          }\\n\
\\\n\
        }\\n\
\\\n\
      } else {\\n\
\\\n\
        callback = lodash.createCallback(callback, thisArg, 3);\\n\
\\\n\
        forIn(object, function(value, key, object) {\\n\
\\\n\
          if (callback(value, key, object)) {\\n\
\\\n\
            result[key] = value;\\n\
\\\n\
          }\\n\
\\\n\
        });\\n\
\\\n\
      }\\n\
\\\n\
      return result;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * An alternative to `_.reduce` this method transforms `object` to a new\\n\
\\\n\
     * `accumulator` object which is the result of running each of its own\\n\
\\\n\
     * enumerable properties through a callback, with each callback execution\\n\
\\\n\
     * potentially mutating the `accumulator` object. The callback is bound to\\n\
\\\n\
     * `thisArg` and invoked with four arguments; (accumulator, value, key, object).\\n\
\\\n\
     * Callbacks may exit iteration early by explicitly returning `false`.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Objects\\n\
\\\n\
     * @param {Array|Object} object The object to iterate over.\\n\
\\\n\
     * @param {Function} [callback=identity] The function called per iteration.\\n\
\\\n\
     * @param {*} [accumulator] The custom accumulator value.\\n\
\\\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\\n\
\\\n\
     * @returns {*} Returns the accumulated value.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * var squares = _.transform([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function(result, num) {\\n\
\\\n\
     *   num *= num;\\n\
\\\n\
     *   if (num % 2) {\\n\
\\\n\
     *     return result.push(num) < 3;\\n\
\\\n\
     *   }\\n\
\\\n\
     * });\\n\
\\\n\
     * // => [1, 9, 25]\\n\
\\\n\
     *\\n\
\\\n\
     * var mapped = _.transform({ 'a': 1, 'b': 2, 'c': 3 }, function(result, num, key) {\\n\
\\\n\
     *   result[key] = num * 3;\\n\
\\\n\
     * });\\n\
\\\n\
     * // => { 'a': 3, 'b': 6, 'c': 9 }\\n\
\\\n\
     */\\n\
\\\n\
    function transform(object, callback, accumulator, thisArg) {\\n\
\\\n\
      var isArr = isArray(object);\\n\
\\\n\
      if (accumulator == null) {\\n\
\\\n\
        if (isArr) {\\n\
\\\n\
          accumulator = [];\\n\
\\\n\
        } else {\\n\
\\\n\
          var ctor = object && object.constructor,\\n\
\\\n\
              proto = ctor && ctor.prototype;\\n\
\\\n\
\\n\
\\\n\
          accumulator = baseCreate(proto);\\n\
\\\n\
        }\\n\
\\\n\
      }\\n\
\\\n\
      if (callback) {\\n\
\\\n\
        callback = lodash.createCallback(callback, thisArg, 4);\\n\
\\\n\
        (isArr ? baseEach : forOwn)(object, function(value, index, object) {\\n\
\\\n\
          return callback(accumulator, value, index, object);\\n\
\\\n\
        });\\n\
\\\n\
      }\\n\
\\\n\
      return accumulator;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Creates an array composed of the own enumerable property values of `object`.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Objects\\n\
\\\n\
     * @param {Object} object The object to inspect.\\n\
\\\n\
     * @returns {Array} Returns an array of property values.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.values({ 'one': 1, 'two': 2, 'three': 3 });\\n\
\\\n\
     * // => [1, 2, 3] (property order is not guaranteed across environments)\\n\
\\\n\
     */\\n\
\\\n\
    function values(object) {\\n\
\\\n\
      var index = -1,\\n\
\\\n\
          props = keys(object),\\n\
\\\n\
          length = props.length,\\n\
\\\n\
          result = Array(length);\\n\
\\\n\
\\n\
\\\n\
      while (++index < length) {\\n\
\\\n\
        result[index] = object[props[index]];\\n\
\\\n\
      }\\n\
\\\n\
      return result;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /*--------------------------------------------------------------------------*/\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Creates an array of elements from the specified indexes, or keys, of the\\n\
\\\n\
     * `collection`. Indexes may be specified as individual arguments or as arrays\\n\
\\\n\
     * of indexes.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Collections\\n\
\\\n\
     * @param {Array|Object|string} collection The collection to iterate over.\\n\
\\\n\
     * @param {...(number|number[]|string|string[])} [index] The indexes of `collection`\\n\
\\\n\
     *   to retrieve, specified as individual indexes or arrays of indexes.\\n\
\\\n\
     * @returns {Array} Returns a new array of elements corresponding to the\\n\
\\\n\
     *  provided indexes.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.at(['a', 'b', 'c', 'd', 'e'], [0, 2, 4]);\\n\
\\\n\
     * // => ['a', 'c', 'e']\\n\
\\\n\
     *\\n\
\\\n\
     * _.at(['fred', 'barney', 'pebbles'], 0, 2);\\n\
\\\n\
     * // => ['fred', 'pebbles']\\n\
\\\n\
     */\\n\
\\\n\
    function at(collection) {\\n\
\\\n\
      var args = arguments,\\n\
\\\n\
          index = -1,\\n\
\\\n\
          props = baseFlatten(args, true, false, 1),\\n\
\\\n\
          length = (args[2] && args[2][args[1]] === collection) ? 1 : props.length,\\n\
\\\n\
          result = Array(length);\\n\
\\\n\
\\n\
\\\n\
      if (support.unindexedChars && isString(collection)) {\\n\
\\\n\
        collection = collection.split('');\\n\
\\\n\
      }\\n\
\\\n\
      while(++index < length) {\\n\
\\\n\
        result[index] = collection[props[index]];\\n\
\\\n\
      }\\n\
\\\n\
      return result;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Checks if a given value is present in a collection using strict equality\\n\
\\\n\
     * for comparisons, i.e. `===`. If `fromIndex` is negative, it is used as the\\n\
\\\n\
     * offset from the end of the collection.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @alias include\\n\
\\\n\
     * @category Collections\\n\
\\\n\
     * @param {Array|Object|string} collection The collection to iterate over.\\n\
\\\n\
     * @param {*} target The value to check for.\\n\
\\\n\
     * @param {number} [fromIndex=0] The index to search from.\\n\
\\\n\
     * @returns {boolean} Returns `true` if the `target` element is found, else `false`.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.contains([1, 2, 3], 1);\\n\
\\\n\
     * // => true\\n\
\\\n\
     *\\n\
\\\n\
     * _.contains([1, 2, 3], 1, 2);\\n\
\\\n\
     * // => false\\n\
\\\n\
     *\\n\
\\\n\
     * _.contains({ 'name': 'fred', 'age': 40 }, 'fred');\\n\
\\\n\
     * // => true\\n\
\\\n\
     *\\n\
\\\n\
     * _.contains('pebbles', 'eb');\\n\
\\\n\
     * // => true\\n\
\\\n\
     */\\n\
\\\n\
    function contains(collection, target, fromIndex) {\\n\
\\\n\
      var index = -1,\\n\
\\\n\
          indexOf = getIndexOf(),\\n\
\\\n\
          length = collection ? collection.length : 0,\\n\
\\\n\
          result = false;\\n\
\\\n\
\\n\
\\\n\
      fromIndex = (fromIndex < 0 ? nativeMax(0, length + fromIndex) : fromIndex) || 0;\\n\
\\\n\
      if (isArray(collection)) {\\n\
\\\n\
        result = indexOf(collection, target, fromIndex) > -1;\\n\
\\\n\
      } else if (typeof length == 'number') {\\n\
\\\n\
        result = (isString(collection) ? collection.indexOf(target, fromIndex) : indexOf(collection, target, fromIndex)) > -1;\\n\
\\\n\
      } else {\\n\
\\\n\
        baseEach(collection, function(value) {\\n\
\\\n\
          if (++index >= fromIndex) {\\n\
\\\n\
            return !(result = value === target);\\n\
\\\n\
          }\\n\
\\\n\
        });\\n\
\\\n\
      }\\n\
\\\n\
      return result;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Creates an object composed of keys generated from the results of running\\n\
\\\n\
     * each element of `collection` through the callback. The corresponding value\\n\
\\\n\
     * of each key is the number of times the key was returned by the callback.\\n\
\\\n\
     * The callback is bound to `thisArg` and invoked with three arguments;\\n\
\\\n\
     * (value, index|key, collection).\\n\
\\\n\
     *\\n\
\\\n\
     * If a property name is provided for `callback` the created \\\"_.pluck\\\" style\\n\
\\\n\
     * callback will return the property value of the given element.\\n\
\\\n\
     *\\n\
\\\n\
     * If an object is provided for `callback` the created \\\"_.where\\\" style callback\\n\
\\\n\
     * will return `true` for elements that have the properties of the given object,\\n\
\\\n\
     * else `false`.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Collections\\n\
\\\n\
     * @param {Array|Object|string} collection The collection to iterate over.\\n\
\\\n\
     * @param {Function|Object|string} [callback=identity] The function called\\n\
\\\n\
     *  per iteration. If a property name or object is provided it will be used\\n\
\\\n\
     *  to create a \\\"_.pluck\\\" or \\\"_.where\\\" style callback, respectively.\\n\
\\\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\\n\
\\\n\
     * @returns {Object} Returns the composed aggregate object.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.countBy([4.3, 6.1, 6.4], function(num) { return Math.floor(num); });\\n\
\\\n\
     * // => { '4': 1, '6': 2 }\\n\
\\\n\
     *\\n\
\\\n\
     * _.countBy([4.3, 6.1, 6.4], function(num) { return this.floor(num); }, Math);\\n\
\\\n\
     * // => { '4': 1, '6': 2 }\\n\
\\\n\
     *\\n\
\\\n\
     * _.countBy(['one', 'two', 'three'], 'length');\\n\
\\\n\
     * // => { '3': 2, '5': 1 }\\n\
\\\n\
     */\\n\
\\\n\
    var countBy = createAggregator(function(result, value, key) {\\n\
\\\n\
      (hasOwnProperty.call(result, key) ? result[key]++ : result[key] = 1);\\n\
\\\n\
    });\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Checks if the given callback returns truey value for **all** elements of\\n\
\\\n\
     * a collection. The callback is bound to `thisArg` and invoked with three\\n\
\\\n\
     * arguments; (value, index|key, collection).\\n\
\\\n\
     *\\n\
\\\n\
     * If a property name is provided for `callback` the created \\\"_.pluck\\\" style\\n\
\\\n\
     * callback will return the property value of the given element.\\n\
\\\n\
     *\\n\
\\\n\
     * If an object is provided for `callback` the created \\\"_.where\\\" style callback\\n\
\\\n\
     * will return `true` for elements that have the properties of the given object,\\n\
\\\n\
     * else `false`.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @alias all\\n\
\\\n\
     * @category Collections\\n\
\\\n\
     * @param {Array|Object|string} collection The collection to iterate over.\\n\
\\\n\
     * @param {Function|Object|string} [callback=identity] The function called\\n\
\\\n\
     *  per iteration. If a property name or object is provided it will be used\\n\
\\\n\
     *  to create a \\\"_.pluck\\\" or \\\"_.where\\\" style callback, respectively.\\n\
\\\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\\n\
\\\n\
     * @returns {boolean} Returns `true` if all elements passed the callback check,\\n\
\\\n\
     *  else `false`.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.every([true, 1, null, 'yes']);\\n\
\\\n\
     * // => false\\n\
\\\n\
     *\\n\
\\\n\
     * var characters = [\\n\
\\\n\
     *   { 'name': 'barney', 'age': 36 },\\n\
\\\n\
     *   { 'name': 'fred',   'age': 40 }\\n\
\\\n\
     * ];\\n\
\\\n\
     *\\n\
\\\n\
     * // using \\\"_.pluck\\\" callback shorthand\\n\
\\\n\
     * _.every(characters, 'age');\\n\
\\\n\
     * // => true\\n\
\\\n\
     *\\n\
\\\n\
     * // using \\\"_.where\\\" callback shorthand\\n\
\\\n\
     * _.every(characters, { 'age': 36 });\\n\
\\\n\
     * // => false\\n\
\\\n\
     */\\n\
\\\n\
    function every(collection, callback, thisArg) {\\n\
\\\n\
      var result = true;\\n\
\\\n\
      callback = lodash.createCallback(callback, thisArg, 3);\\n\
\\\n\
\\n\
\\\n\
      if (isArray(collection)) {\\n\
\\\n\
        var index = -1,\\n\
\\\n\
            length = collection.length;\\n\
\\\n\
\\n\
\\\n\
        while (++index < length) {\\n\
\\\n\
          if (!(result = !!callback(collection[index], index, collection))) {\\n\
\\\n\
            break;\\n\
\\\n\
          }\\n\
\\\n\
        }\\n\
\\\n\
      } else {\\n\
\\\n\
        baseEach(collection, function(value, index, collection) {\\n\
\\\n\
          return (result = !!callback(value, index, collection));\\n\
\\\n\
        });\\n\
\\\n\
      }\\n\
\\\n\
      return result;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Iterates over elements of a collection, returning an array of all elements\\n\
\\\n\
     * the callback returns truey for. The callback is bound to `thisArg` and\\n\
\\\n\
     * invoked with three arguments; (value, index|key, collection).\\n\
\\\n\
     *\\n\
\\\n\
     * If a property name is provided for `callback` the created \\\"_.pluck\\\" style\\n\
\\\n\
     * callback will return the property value of the given element.\\n\
\\\n\
     *\\n\
\\\n\
     * If an object is provided for `callback` the created \\\"_.where\\\" style callback\\n\
\\\n\
     * will return `true` for elements that have the properties of the given object,\\n\
\\\n\
     * else `false`.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @alias select\\n\
\\\n\
     * @category Collections\\n\
\\\n\
     * @param {Array|Object|string} collection The collection to iterate over.\\n\
\\\n\
     * @param {Function|Object|string} [callback=identity] The function called\\n\
\\\n\
     *  per iteration. If a property name or object is provided it will be used\\n\
\\\n\
     *  to create a \\\"_.pluck\\\" or \\\"_.where\\\" style callback, respectively.\\n\
\\\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\\n\
\\\n\
     * @returns {Array} Returns a new array of elements that passed the callback check.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * var evens = _.filter([1, 2, 3, 4, 5, 6], function(num) { return num % 2 == 0; });\\n\
\\\n\
     * // => [2, 4, 6]\\n\
\\\n\
     *\\n\
\\\n\
     * var characters = [\\n\
\\\n\
     *   { 'name': 'barney', 'age': 36, 'blocked': false },\\n\
\\\n\
     *   { 'name': 'fred',   'age': 40, 'blocked': true }\\n\
\\\n\
     * ];\\n\
\\\n\
     *\\n\
\\\n\
     * // using \\\"_.pluck\\\" callback shorthand\\n\
\\\n\
     * _.filter(characters, 'blocked');\\n\
\\\n\
     * // => [{ 'name': 'fred', 'age': 40, 'blocked': true }]\\n\
\\\n\
     *\\n\
\\\n\
     * // using \\\"_.where\\\" callback shorthand\\n\
\\\n\
     * _.filter(characters, { 'age': 36 });\\n\
\\\n\
     * // => [{ 'name': 'barney', 'age': 36, 'blocked': false }]\\n\
\\\n\
     */\\n\
\\\n\
    function filter(collection, callback, thisArg) {\\n\
\\\n\
      var result = [];\\n\
\\\n\
      callback = lodash.createCallback(callback, thisArg, 3);\\n\
\\\n\
\\n\
\\\n\
      if (isArray(collection)) {\\n\
\\\n\
        var index = -1,\\n\
\\\n\
            length = collection.length;\\n\
\\\n\
\\n\
\\\n\
        while (++index < length) {\\n\
\\\n\
          var value = collection[index];\\n\
\\\n\
          if (callback(value, index, collection)) {\\n\
\\\n\
            result.push(value);\\n\
\\\n\
          }\\n\
\\\n\
        }\\n\
\\\n\
      } else {\\n\
\\\n\
        baseEach(collection, function(value, index, collection) {\\n\
\\\n\
          if (callback(value, index, collection)) {\\n\
\\\n\
            result.push(value);\\n\
\\\n\
          }\\n\
\\\n\
        });\\n\
\\\n\
      }\\n\
\\\n\
      return result;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Iterates over elements of a collection, returning the first element that\\n\
\\\n\
     * the callback returns truey for. The callback is bound to `thisArg` and\\n\
\\\n\
     * invoked with three arguments; (value, index|key, collection).\\n\
\\\n\
     *\\n\
\\\n\
     * If a property name is provided for `callback` the created \\\"_.pluck\\\" style\\n\
\\\n\
     * callback will return the property value of the given element.\\n\
\\\n\
     *\\n\
\\\n\
     * If an object is provided for `callback` the created \\\"_.where\\\" style callback\\n\
\\\n\
     * will return `true` for elements that have the properties of the given object,\\n\
\\\n\
     * else `false`.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @alias detect, findWhere\\n\
\\\n\
     * @category Collections\\n\
\\\n\
     * @param {Array|Object|string} collection The collection to iterate over.\\n\
\\\n\
     * @param {Function|Object|string} [callback=identity] The function called\\n\
\\\n\
     *  per iteration. If a property name or object is provided it will be used\\n\
\\\n\
     *  to create a \\\"_.pluck\\\" or \\\"_.where\\\" style callback, respectively.\\n\
\\\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\\n\
\\\n\
     * @returns {*} Returns the found element, else `undefined`.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * var characters = [\\n\
\\\n\
     *   { 'name': 'barney',  'age': 36, 'blocked': false },\\n\
\\\n\
     *   { 'name': 'fred',    'age': 40, 'blocked': true },\\n\
\\\n\
     *   { 'name': 'pebbles', 'age': 1,  'blocked': false }\\n\
\\\n\
     * ];\\n\
\\\n\
     *\\n\
\\\n\
     * _.find(characters, function(chr) {\\n\
\\\n\
     *   return chr.age < 40;\\n\
\\\n\
     * });\\n\
\\\n\
     * // => { 'name': 'barney', 'age': 36, 'blocked': false }\\n\
\\\n\
     *\\n\
\\\n\
     * // using \\\"_.where\\\" callback shorthand\\n\
\\\n\
     * _.find(characters, { 'age': 1 });\\n\
\\\n\
     * // =>  { 'name': 'pebbles', 'age': 1, 'blocked': false }\\n\
\\\n\
     *\\n\
\\\n\
     * // using \\\"_.pluck\\\" callback shorthand\\n\
\\\n\
     * _.find(characters, 'blocked');\\n\
\\\n\
     * // => { 'name': 'fred', 'age': 40, 'blocked': true }\\n\
\\\n\
     */\\n\
\\\n\
    function find(collection, callback, thisArg) {\\n\
\\\n\
      callback = lodash.createCallback(callback, thisArg, 3);\\n\
\\\n\
\\n\
\\\n\
      if (isArray(collection)) {\\n\
\\\n\
        var index = -1,\\n\
\\\n\
            length = collection.length;\\n\
\\\n\
\\n\
\\\n\
        while (++index < length) {\\n\
\\\n\
          var value = collection[index];\\n\
\\\n\
          if (callback(value, index, collection)) {\\n\
\\\n\
            return value;\\n\
\\\n\
          }\\n\
\\\n\
        }\\n\
\\\n\
      } else {\\n\
\\\n\
        var result;\\n\
\\\n\
        baseEach(collection, function(value, index, collection) {\\n\
\\\n\
          if (callback(value, index, collection)) {\\n\
\\\n\
            result = value;\\n\
\\\n\
            return false;\\n\
\\\n\
          }\\n\
\\\n\
        });\\n\
\\\n\
        return result;\\n\
\\\n\
      }\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * This method is like `_.find` except that it iterates over elements\\n\
\\\n\
     * of a `collection` from right to left.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Collections\\n\
\\\n\
     * @param {Array|Object|string} collection The collection to iterate over.\\n\
\\\n\
     * @param {Function|Object|string} [callback=identity] The function called\\n\
\\\n\
     *  per iteration. If a property name or object is provided it will be used\\n\
\\\n\
     *  to create a \\\"_.pluck\\\" or \\\"_.where\\\" style callback, respectively.\\n\
\\\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\\n\
\\\n\
     * @returns {*} Returns the found element, else `undefined`.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.findLast([1, 2, 3, 4], function(num) {\\n\
\\\n\
     *   return num % 2 == 1;\\n\
\\\n\
     * });\\n\
\\\n\
     * // => 3\\n\
\\\n\
     */\\n\
\\\n\
    function findLast(collection, callback, thisArg) {\\n\
\\\n\
      var result;\\n\
\\\n\
      callback = lodash.createCallback(callback, thisArg, 3);\\n\
\\\n\
      forEachRight(collection, function(value, index, collection) {\\n\
\\\n\
        if (callback(value, index, collection)) {\\n\
\\\n\
          result = value;\\n\
\\\n\
          return false;\\n\
\\\n\
        }\\n\
\\\n\
      });\\n\
\\\n\
      return result;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Iterates over elements of a collection, executing the callback for each\\n\
\\\n\
     * element. The callback is bound to `thisArg` and invoked with three arguments;\\n\
\\\n\
     * (value, index|key, collection). Callbacks may exit iteration early by\\n\
\\\n\
     * explicitly returning `false`.\\n\
\\\n\
     *\\n\
\\\n\
     * Note: As with other \\\"Collections\\\" methods, objects with a `length` property\\n\
\\\n\
     * are iterated like arrays. To avoid this behavior `_.forIn` or `_.forOwn`\\n\
\\\n\
     * may be used for object iteration.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @alias each\\n\
\\\n\
     * @category Collections\\n\
\\\n\
     * @param {Array|Object|string} collection The collection to iterate over.\\n\
\\\n\
     * @param {Function} [callback=identity] The function called per iteration.\\n\
\\\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\\n\
\\\n\
     * @returns {Array|Object|string} Returns `collection`.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _([1, 2, 3]).forEach(function(num) { console.log(num); }).join(',');\\n\
\\\n\
     * // => logs each number and returns '1,2,3'\\n\
\\\n\
     *\\n\
\\\n\
     * _.forEach({ 'one': 1, 'two': 2, 'three': 3 }, function(num) { console.log(num); });\\n\
\\\n\
     * // => logs each number and returns the object (property order is not guaranteed across environments)\\n\
\\\n\
     */\\n\
\\\n\
    function forEach(collection, callback, thisArg) {\\n\
\\\n\
      if (callback && typeof thisArg == 'undefined' && isArray(collection)) {\\n\
\\\n\
        var index = -1,\\n\
\\\n\
            length = collection.length;\\n\
\\\n\
\\n\
\\\n\
        while (++index < length) {\\n\
\\\n\
          if (callback(collection[index], index, collection) === false) {\\n\
\\\n\
            break;\\n\
\\\n\
          }\\n\
\\\n\
        }\\n\
\\\n\
      } else {\\n\
\\\n\
        baseEach(collection, callback, thisArg);\\n\
\\\n\
      }\\n\
\\\n\
      return collection;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * This method is like `_.forEach` except that it iterates over elements\\n\
\\\n\
     * of a `collection` from right to left.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @alias eachRight\\n\
\\\n\
     * @category Collections\\n\
\\\n\
     * @param {Array|Object|string} collection The collection to iterate over.\\n\
\\\n\
     * @param {Function} [callback=identity] The function called per iteration.\\n\
\\\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\\n\
\\\n\
     * @returns {Array|Object|string} Returns `collection`.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _([1, 2, 3]).forEachRight(function(num) { console.log(num); }).join(',');\\n\
\\\n\
     * // => logs each number from right to left and returns '3,2,1'\\n\
\\\n\
     */\\n\
\\\n\
    function forEachRight(collection, callback, thisArg) {\\n\
\\\n\
      var iterable = collection,\\n\
\\\n\
          length = collection ? collection.length : 0;\\n\
\\\n\
\\n\
\\\n\
      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);\\n\
\\\n\
      if (isArray(collection)) {\\n\
\\\n\
        while (length--) {\\n\
\\\n\
          if (callback(collection[length], length, collection) === false) {\\n\
\\\n\
            break;\\n\
\\\n\
          }\\n\
\\\n\
        }\\n\
\\\n\
      } else {\\n\
\\\n\
        if (typeof length != 'number') {\\n\
\\\n\
          var props = keys(collection);\\n\
\\\n\
          length = props.length;\\n\
\\\n\
        } else if (support.unindexedChars && isString(collection)) {\\n\
\\\n\
          iterable = collection.split('');\\n\
\\\n\
        }\\n\
\\\n\
        baseEach(collection, function(value, key, collection) {\\n\
\\\n\
          key = props ? props[--length] : --length;\\n\
\\\n\
          return callback(iterable[key], key, collection);\\n\
\\\n\
        });\\n\
\\\n\
      }\\n\
\\\n\
      return collection;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Creates an object composed of keys generated from the results of running\\n\
\\\n\
     * each element of a collection through the callback. The corresponding value\\n\
\\\n\
     * of each key is an array of the elements responsible for generating the key.\\n\
\\\n\
     * The callback is bound to `thisArg` and invoked with three arguments;\\n\
\\\n\
     * (value, index|key, collection).\\n\
\\\n\
     *\\n\
\\\n\
     * If a property name is provided for `callback` the created \\\"_.pluck\\\" style\\n\
\\\n\
     * callback will return the property value of the given element.\\n\
\\\n\
     *\\n\
\\\n\
     * If an object is provided for `callback` the created \\\"_.where\\\" style callback\\n\
\\\n\
     * will return `true` for elements that have the properties of the given object,\\n\
\\\n\
     * else `false`\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Collections\\n\
\\\n\
     * @param {Array|Object|string} collection The collection to iterate over.\\n\
\\\n\
     * @param {Function|Object|string} [callback=identity] The function called\\n\
\\\n\
     *  per iteration. If a property name or object is provided it will be used\\n\
\\\n\
     *  to create a \\\"_.pluck\\\" or \\\"_.where\\\" style callback, respectively.\\n\
\\\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\\n\
\\\n\
     * @returns {Object} Returns the composed aggregate object.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.groupBy([4.2, 6.1, 6.4], function(num) { return Math.floor(num); });\\n\
\\\n\
     * // => { '4': [4.2], '6': [6.1, 6.4] }\\n\
\\\n\
     *\\n\
\\\n\
     * _.groupBy([4.2, 6.1, 6.4], function(num) { return this.floor(num); }, Math);\\n\
\\\n\
     * // => { '4': [4.2], '6': [6.1, 6.4] }\\n\
\\\n\
     *\\n\
\\\n\
     * // using \\\"_.pluck\\\" callback shorthand\\n\
\\\n\
     * _.groupBy(['one', 'two', 'three'], 'length');\\n\
\\\n\
     * // => { '3': ['one', 'two'], '5': ['three'] }\\n\
\\\n\
     */\\n\
\\\n\
    var groupBy = createAggregator(function(result, value, key) {\\n\
\\\n\
      (hasOwnProperty.call(result, key) ? result[key] : result[key] = []).push(value);\\n\
\\\n\
    });\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Creates an object composed of keys generated from the results of running\\n\
\\\n\
     * each element of the collection through the given callback. The corresponding\\n\
\\\n\
     * value of each key is the last element responsible for generating the key.\\n\
\\\n\
     * The callback is bound to `thisArg` and invoked with three arguments;\\n\
\\\n\
     * (value, index|key, collection).\\n\
\\\n\
     *\\n\
\\\n\
     * If a property name is provided for `callback` the created \\\"_.pluck\\\" style\\n\
\\\n\
     * callback will return the property value of the given element.\\n\
\\\n\
     *\\n\
\\\n\
     * If an object is provided for `callback` the created \\\"_.where\\\" style callback\\n\
\\\n\
     * will return `true` for elements that have the properties of the given object,\\n\
\\\n\
     * else `false`.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Collections\\n\
\\\n\
     * @param {Array|Object|string} collection The collection to iterate over.\\n\
\\\n\
     * @param {Function|Object|string} [callback=identity] The function called\\n\
\\\n\
     *  per iteration. If a property name or object is provided it will be used\\n\
\\\n\
     *  to create a \\\"_.pluck\\\" or \\\"_.where\\\" style callback, respectively.\\n\
\\\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\\n\
\\\n\
     * @returns {Object} Returns the composed aggregate object.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * var keys = [\\n\
\\\n\
     *   { 'dir': 'left', 'code': 97 },\\n\
\\\n\
     *   { 'dir': 'right', 'code': 100 }\\n\
\\\n\
     * ];\\n\
\\\n\
     *\\n\
\\\n\
     * _.indexBy(keys, 'dir');\\n\
\\\n\
     * // => { 'left': { 'dir': 'left', 'code': 97 }, 'right': { 'dir': 'right', 'code': 100 } }\\n\
\\\n\
     *\\n\
\\\n\
     * _.indexBy(keys, function(key) { return String.fromCharCode(key.code); });\\n\
\\\n\
     * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }\\n\
\\\n\
     *\\n\
\\\n\
     * _.indexBy(characters, function(key) { this.fromCharCode(key.code); }, String);\\n\
\\\n\
     * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }\\n\
\\\n\
     */\\n\
\\\n\
    var indexBy = createAggregator(function(result, value, key) {\\n\
\\\n\
      result[key] = value;\\n\
\\\n\
    });\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Invokes the method named by `methodName` on each element in the `collection`\\n\
\\\n\
     * returning an array of the results of each invoked method. Additional arguments\\n\
\\\n\
     * will be provided to each invoked method. If `methodName` is a function it\\n\
\\\n\
     * will be invoked for, and `this` bound to, each element in the `collection`.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Collections\\n\
\\\n\
     * @param {Array|Object|string} collection The collection to iterate over.\\n\
\\\n\
     * @param {Function|string} methodName The name of the method to invoke or\\n\
\\\n\
     *  the function invoked per iteration.\\n\
\\\n\
     * @param {...*} [arg] Arguments to invoke the method with.\\n\
\\\n\
     * @returns {Array} Returns a new array of the results of each invoked method.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.invoke([[5, 1, 7], [3, 2, 1]], 'sort');\\n\
\\\n\
     * // => [[1, 5, 7], [1, 2, 3]]\\n\
\\\n\
     *\\n\
\\\n\
     * _.invoke([123, 456], String.prototype.split, '');\\n\
\\\n\
     * // => [['1', '2', '3'], ['4', '5', '6']]\\n\
\\\n\
     */\\n\
\\\n\
    function invoke(collection, methodName) {\\n\
\\\n\
      var args = slice(arguments, 2),\\n\
\\\n\
          index = -1,\\n\
\\\n\
          isFunc = typeof methodName == 'function',\\n\
\\\n\
          length = collection ? collection.length : 0,\\n\
\\\n\
          result = Array(typeof length == 'number' ? length : 0);\\n\
\\\n\
\\n\
\\\n\
      forEach(collection, function(value) {\\n\
\\\n\
        result[++index] = (isFunc ? methodName : value[methodName]).apply(value, args);\\n\
\\\n\
      });\\n\
\\\n\
      return result;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Creates an array of values by running each element in the collection\\n\
\\\n\
     * through the callback. The callback is bound to `thisArg` and invoked with\\n\
\\\n\
     * three arguments; (value, index|key, collection).\\n\
\\\n\
     *\\n\
\\\n\
     * If a property name is provided for `callback` the created \\\"_.pluck\\\" style\\n\
\\\n\
     * callback will return the property value of the given element.\\n\
\\\n\
     *\\n\
\\\n\
     * If an object is provided for `callback` the created \\\"_.where\\\" style callback\\n\
\\\n\
     * will return `true` for elements that have the properties of the given object,\\n\
\\\n\
     * else `false`.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @alias collect\\n\
\\\n\
     * @category Collections\\n\
\\\n\
     * @param {Array|Object|string} collection The collection to iterate over.\\n\
\\\n\
     * @param {Function|Object|string} [callback=identity] The function called\\n\
\\\n\
     *  per iteration. If a property name or object is provided it will be used\\n\
\\\n\
     *  to create a \\\"_.pluck\\\" or \\\"_.where\\\" style callback, respectively.\\n\
\\\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\\n\
\\\n\
     * @returns {Array} Returns a new array of the results of each `callback` execution.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.map([1, 2, 3], function(num) { return num * 3; });\\n\
\\\n\
     * // => [3, 6, 9]\\n\
\\\n\
     *\\n\
\\\n\
     * _.map({ 'one': 1, 'two': 2, 'three': 3 }, function(num) { return num * 3; });\\n\
\\\n\
     * // => [3, 6, 9] (property order is not guaranteed across environments)\\n\
\\\n\
     *\\n\
\\\n\
     * var characters = [\\n\
\\\n\
     *   { 'name': 'barney', 'age': 36 },\\n\
\\\n\
     *   { 'name': 'fred',   'age': 40 }\\n\
\\\n\
     * ];\\n\
\\\n\
     *\\n\
\\\n\
     * // using \\\"_.pluck\\\" callback shorthand\\n\
\\\n\
     * _.map(characters, 'name');\\n\
\\\n\
     * // => ['barney', 'fred']\\n\
\\\n\
     */\\n\
\\\n\
    function map(collection, callback, thisArg) {\\n\
\\\n\
      var index = -1,\\n\
\\\n\
          length = collection ? collection.length : 0,\\n\
\\\n\
          result = Array(typeof length == 'number' ? length : 0);\\n\
\\\n\
\\n\
\\\n\
      callback = lodash.createCallback(callback, thisArg, 3);\\n\
\\\n\
      if (isArray(collection)) {\\n\
\\\n\
        while (++index < length) {\\n\
\\\n\
          result[index] = callback(collection[index], index, collection);\\n\
\\\n\
        }\\n\
\\\n\
      } else {\\n\
\\\n\
        baseEach(collection, function(value, key, collection) {\\n\
\\\n\
          result[++index] = callback(value, key, collection);\\n\
\\\n\
        });\\n\
\\\n\
      }\\n\
\\\n\
      return result;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Retrieves the maximum value of a collection. If the collection is empty or\\n\
\\\n\
     * falsey `-Infinity` is returned. If a callback is provided it will be executed\\n\
\\\n\
     * for each value in the collection to generate the criterion by which the value\\n\
\\\n\
     * is ranked. The callback is bound to `thisArg` and invoked with three\\n\
\\\n\
     * arguments; (value, index, collection).\\n\
\\\n\
     *\\n\
\\\n\
     * If a property name is provided for `callback` the created \\\"_.pluck\\\" style\\n\
\\\n\
     * callback will return the property value of the given element.\\n\
\\\n\
     *\\n\
\\\n\
     * If an object is provided for `callback` the created \\\"_.where\\\" style callback\\n\
\\\n\
     * will return `true` for elements that have the properties of the given object,\\n\
\\\n\
     * else `false`.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Collections\\n\
\\\n\
     * @param {Array|Object|string} collection The collection to iterate over.\\n\
\\\n\
     * @param {Function|Object|string} [callback=identity] The function called\\n\
\\\n\
     *  per iteration. If a property name or object is provided it will be used\\n\
\\\n\
     *  to create a \\\"_.pluck\\\" or \\\"_.where\\\" style callback, respectively.\\n\
\\\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\\n\
\\\n\
     * @returns {*} Returns the maximum value.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.max([4, 2, 8, 6]);\\n\
\\\n\
     * // => 8\\n\
\\\n\
     *\\n\
\\\n\
     * var characters = [\\n\
\\\n\
     *   { 'name': 'barney', 'age': 36 },\\n\
\\\n\
     *   { 'name': 'fred',   'age': 40 }\\n\
\\\n\
     * ];\\n\
\\\n\
     *\\n\
\\\n\
     * _.max(characters, function(chr) { return chr.age; });\\n\
\\\n\
     * // => { 'name': 'fred', 'age': 40 };\\n\
\\\n\
     *\\n\
\\\n\
     * // using \\\"_.pluck\\\" callback shorthand\\n\
\\\n\
     * _.max(characters, 'age');\\n\
\\\n\
     * // => { 'name': 'fred', 'age': 40 };\\n\
\\\n\
     */\\n\
\\\n\
    function max(collection, callback, thisArg) {\\n\
\\\n\
      var computed = -Infinity,\\n\
\\\n\
          result = computed;\\n\
\\\n\
\\n\
\\\n\
      // allows working with functions like `_.map` without using\\n\
\\\n\
      // their `index` argument as a callback\\n\
\\\n\
      if (typeof callback != 'function' && thisArg && thisArg[callback] === collection) {\\n\
\\\n\
        callback = null;\\n\
\\\n\
      }\\n\
\\\n\
      if (callback == null && isArray(collection)) {\\n\
\\\n\
        var index = -1,\\n\
\\\n\
            length = collection.length;\\n\
\\\n\
\\n\
\\\n\
        while (++index < length) {\\n\
\\\n\
          var value = collection[index];\\n\
\\\n\
          if (value > result) {\\n\
\\\n\
            result = value;\\n\
\\\n\
          }\\n\
\\\n\
        }\\n\
\\\n\
      } else {\\n\
\\\n\
        callback = (callback == null && isString(collection))\\n\
\\\n\
          ? charAtCallback\\n\
\\\n\
          : lodash.createCallback(callback, thisArg, 3);\\n\
\\\n\
\\n\
\\\n\
        baseEach(collection, function(value, index, collection) {\\n\
\\\n\
          var current = callback(value, index, collection);\\n\
\\\n\
          if (current > computed) {\\n\
\\\n\
            computed = current;\\n\
\\\n\
            result = value;\\n\
\\\n\
          }\\n\
\\\n\
        });\\n\
\\\n\
      }\\n\
\\\n\
      return result;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Retrieves the minimum value of a collection. If the collection is empty or\\n\
\\\n\
     * falsey `Infinity` is returned. If a callback is provided it will be executed\\n\
\\\n\
     * for each value in the collection to generate the criterion by which the value\\n\
\\\n\
     * is ranked. The callback is bound to `thisArg` and invoked with three\\n\
\\\n\
     * arguments; (value, index, collection).\\n\
\\\n\
     *\\n\
\\\n\
     * If a property name is provided for `callback` the created \\\"_.pluck\\\" style\\n\
\\\n\
     * callback will return the property value of the given element.\\n\
\\\n\
     *\\n\
\\\n\
     * If an object is provided for `callback` the created \\\"_.where\\\" style callback\\n\
\\\n\
     * will return `true` for elements that have the properties of the given object,\\n\
\\\n\
     * else `false`.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Collections\\n\
\\\n\
     * @param {Array|Object|string} collection The collection to iterate over.\\n\
\\\n\
     * @param {Function|Object|string} [callback=identity] The function called\\n\
\\\n\
     *  per iteration. If a property name or object is provided it will be used\\n\
\\\n\
     *  to create a \\\"_.pluck\\\" or \\\"_.where\\\" style callback, respectively.\\n\
\\\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\\n\
\\\n\
     * @returns {*} Returns the minimum value.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.min([4, 2, 8, 6]);\\n\
\\\n\
     * // => 2\\n\
\\\n\
     *\\n\
\\\n\
     * var characters = [\\n\
\\\n\
     *   { 'name': 'barney', 'age': 36 },\\n\
\\\n\
     *   { 'name': 'fred',   'age': 40 }\\n\
\\\n\
     * ];\\n\
\\\n\
     *\\n\
\\\n\
     * _.min(characters, function(chr) { return chr.age; });\\n\
\\\n\
     * // => { 'name': 'barney', 'age': 36 };\\n\
\\\n\
     *\\n\
\\\n\
     * // using \\\"_.pluck\\\" callback shorthand\\n\
\\\n\
     * _.min(characters, 'age');\\n\
\\\n\
     * // => { 'name': 'barney', 'age': 36 };\\n\
\\\n\
     */\\n\
\\\n\
    function min(collection, callback, thisArg) {\\n\
\\\n\
      var computed = Infinity,\\n\
\\\n\
          result = computed;\\n\
\\\n\
\\n\
\\\n\
      // allows working with functions like `_.map` without using\\n\
\\\n\
      // their `index` argument as a callback\\n\
\\\n\
      if (typeof callback != 'function' && thisArg && thisArg[callback] === collection) {\\n\
\\\n\
        callback = null;\\n\
\\\n\
      }\\n\
\\\n\
      if (callback == null && isArray(collection)) {\\n\
\\\n\
        var index = -1,\\n\
\\\n\
            length = collection.length;\\n\
\\\n\
\\n\
\\\n\
        while (++index < length) {\\n\
\\\n\
          var value = collection[index];\\n\
\\\n\
          if (value < result) {\\n\
\\\n\
            result = value;\\n\
\\\n\
          }\\n\
\\\n\
        }\\n\
\\\n\
      } else {\\n\
\\\n\
        callback = (callback == null && isString(collection))\\n\
\\\n\
          ? charAtCallback\\n\
\\\n\
          : lodash.createCallback(callback, thisArg, 3);\\n\
\\\n\
\\n\
\\\n\
        baseEach(collection, function(value, index, collection) {\\n\
\\\n\
          var current = callback(value, index, collection);\\n\
\\\n\
          if (current < computed) {\\n\
\\\n\
            computed = current;\\n\
\\\n\
            result = value;\\n\
\\\n\
          }\\n\
\\\n\
        });\\n\
\\\n\
      }\\n\
\\\n\
      return result;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Retrieves the value of a specified property from all elements in the collection.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @type Function\\n\
\\\n\
     * @category Collections\\n\
\\\n\
     * @param {Array|Object|string} collection The collection to iterate over.\\n\
\\\n\
     * @param {string} property The name of the property to pluck.\\n\
\\\n\
     * @returns {Array} Returns a new array of property values.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * var characters = [\\n\
\\\n\
     *   { 'name': 'barney', 'age': 36 },\\n\
\\\n\
     *   { 'name': 'fred',   'age': 40 }\\n\
\\\n\
     * ];\\n\
\\\n\
     *\\n\
\\\n\
     * _.pluck(characters, 'name');\\n\
\\\n\
     * // => ['barney', 'fred']\\n\
\\\n\
     */\\n\
\\\n\
    var pluck = map;\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Reduces a collection to a value which is the accumulated result of running\\n\
\\\n\
     * each element in the collection through the callback, where each successive\\n\
\\\n\
     * callback execution consumes the return value of the previous execution. If\\n\
\\\n\
     * `accumulator` is not provided the first element of the collection will be\\n\
\\\n\
     * used as the initial `accumulator` value. The callback is bound to `thisArg`\\n\
\\\n\
     * and invoked with four arguments; (accumulator, value, index|key, collection).\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @alias foldl, inject\\n\
\\\n\
     * @category Collections\\n\
\\\n\
     * @param {Array|Object|string} collection The collection to iterate over.\\n\
\\\n\
     * @param {Function} [callback=identity] The function called per iteration.\\n\
\\\n\
     * @param {*} [accumulator] Initial value of the accumulator.\\n\
\\\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\\n\
\\\n\
     * @returns {*} Returns the accumulated value.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * var sum = _.reduce([1, 2, 3], function(sum, num) {\\n\
\\\n\
     *   return sum + num;\\n\
\\\n\
     * });\\n\
\\\n\
     * // => 6\\n\
\\\n\
     *\\n\
\\\n\
     * var mapped = _.reduce({ 'a': 1, 'b': 2, 'c': 3 }, function(result, num, key) {\\n\
\\\n\
     *   result[key] = num * 3;\\n\
\\\n\
     *   return result;\\n\
\\\n\
     * }, {});\\n\
\\\n\
     * // => { 'a': 3, 'b': 6, 'c': 9 }\\n\
\\\n\
     */\\n\
\\\n\
    function reduce(collection, callback, accumulator, thisArg) {\\n\
\\\n\
      var noaccum = arguments.length < 3;\\n\
\\\n\
      callback = lodash.createCallback(callback, thisArg, 4);\\n\
\\\n\
\\n\
\\\n\
      if (isArray(collection)) {\\n\
\\\n\
        var index = -1,\\n\
\\\n\
            length = collection.length;\\n\
\\\n\
\\n\
\\\n\
        if (noaccum) {\\n\
\\\n\
          accumulator = collection[++index];\\n\
\\\n\
        }\\n\
\\\n\
        while (++index < length) {\\n\
\\\n\
          accumulator = callback(accumulator, collection[index], index, collection);\\n\
\\\n\
        }\\n\
\\\n\
      } else {\\n\
\\\n\
        baseEach(collection, function(value, index, collection) {\\n\
\\\n\
          accumulator = noaccum\\n\
\\\n\
            ? (noaccum = false, value)\\n\
\\\n\
            : callback(accumulator, value, index, collection)\\n\
\\\n\
        });\\n\
\\\n\
      }\\n\
\\\n\
      return accumulator;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * This method is like `_.reduce` except that it iterates over elements\\n\
\\\n\
     * of a `collection` from right to left.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @alias foldr\\n\
\\\n\
     * @category Collections\\n\
\\\n\
     * @param {Array|Object|string} collection The collection to iterate over.\\n\
\\\n\
     * @param {Function} [callback=identity] The function called per iteration.\\n\
\\\n\
     * @param {*} [accumulator] Initial value of the accumulator.\\n\
\\\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\\n\
\\\n\
     * @returns {*} Returns the accumulated value.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * var list = [[0, 1], [2, 3], [4, 5]];\\n\
\\\n\
     * var flat = _.reduceRight(list, function(a, b) { return a.concat(b); }, []);\\n\
\\\n\
     * // => [4, 5, 2, 3, 0, 1]\\n\
\\\n\
     */\\n\
\\\n\
    function reduceRight(collection, callback, accumulator, thisArg) {\\n\
\\\n\
      var noaccum = arguments.length < 3;\\n\
\\\n\
      callback = lodash.createCallback(callback, thisArg, 4);\\n\
\\\n\
      forEachRight(collection, function(value, index, collection) {\\n\
\\\n\
        accumulator = noaccum\\n\
\\\n\
          ? (noaccum = false, value)\\n\
\\\n\
          : callback(accumulator, value, index, collection);\\n\
\\\n\
      });\\n\
\\\n\
      return accumulator;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * The opposite of `_.filter` this method returns the elements of a\\n\
\\\n\
     * collection that the callback does **not** return truey for.\\n\
\\\n\
     *\\n\
\\\n\
     * If a property name is provided for `callback` the created \\\"_.pluck\\\" style\\n\
\\\n\
     * callback will return the property value of the given element.\\n\
\\\n\
     *\\n\
\\\n\
     * If an object is provided for `callback` the created \\\"_.where\\\" style callback\\n\
\\\n\
     * will return `true` for elements that have the properties of the given object,\\n\
\\\n\
     * else `false`.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Collections\\n\
\\\n\
     * @param {Array|Object|string} collection The collection to iterate over.\\n\
\\\n\
     * @param {Function|Object|string} [callback=identity] The function called\\n\
\\\n\
     *  per iteration. If a property name or object is provided it will be used\\n\
\\\n\
     *  to create a \\\"_.pluck\\\" or \\\"_.where\\\" style callback, respectively.\\n\
\\\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\\n\
\\\n\
     * @returns {Array} Returns a new array of elements that failed the callback check.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * var odds = _.reject([1, 2, 3, 4, 5, 6], function(num) { return num % 2 == 0; });\\n\
\\\n\
     * // => [1, 3, 5]\\n\
\\\n\
     *\\n\
\\\n\
     * var characters = [\\n\
\\\n\
     *   { 'name': 'barney', 'age': 36, 'blocked': false },\\n\
\\\n\
     *   { 'name': 'fred',   'age': 40, 'blocked': true }\\n\
\\\n\
     * ];\\n\
\\\n\
     *\\n\
\\\n\
     * // using \\\"_.pluck\\\" callback shorthand\\n\
\\\n\
     * _.reject(characters, 'blocked');\\n\
\\\n\
     * // => [{ 'name': 'barney', 'age': 36, 'blocked': false }]\\n\
\\\n\
     *\\n\
\\\n\
     * // using \\\"_.where\\\" callback shorthand\\n\
\\\n\
     * _.reject(characters, { 'age': 36 });\\n\
\\\n\
     * // => [{ 'name': 'fred', 'age': 40, 'blocked': true }]\\n\
\\\n\
     */\\n\
\\\n\
    function reject(collection, callback, thisArg) {\\n\
\\\n\
      callback = lodash.createCallback(callback, thisArg, 3);\\n\
\\\n\
      return filter(collection, function(value, index, collection) {\\n\
\\\n\
        return !callback(value, index, collection);\\n\
\\\n\
      });\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Retrieves a random element or `n` random elements from a collection.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Collections\\n\
\\\n\
     * @param {Array|Object|string} collection The collection to sample.\\n\
\\\n\
     * @param {number} [n] The number of elements to sample.\\n\
\\\n\
     * @param- {Object} [guard] Allows working with functions like `_.map`\\n\
\\\n\
     *  without using their `index` arguments as `n`.\\n\
\\\n\
     * @returns {Array} Returns the random sample(s) of `collection`.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.sample([1, 2, 3, 4]);\\n\
\\\n\
     * // => 2\\n\
\\\n\
     *\\n\
\\\n\
     * _.sample([1, 2, 3, 4], 2);\\n\
\\\n\
     * // => [3, 1]\\n\
\\\n\
     */\\n\
\\\n\
    function sample(collection, n, guard) {\\n\
\\\n\
      if (collection && typeof collection.length != 'number') {\\n\
\\\n\
        collection = values(collection);\\n\
\\\n\
      } else if (support.unindexedChars && isString(collection)) {\\n\
\\\n\
        collection = collection.split('');\\n\
\\\n\
      }\\n\
\\\n\
      if (n == null || guard) {\\n\
\\\n\
        return collection ? collection[baseRandom(0, collection.length - 1)] : undefined;\\n\
\\\n\
      }\\n\
\\\n\
      var result = shuffle(collection);\\n\
\\\n\
      result.length = nativeMin(nativeMax(0, n), result.length);\\n\
\\\n\
      return result;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Creates an array of shuffled values, using a version of the Fisher-Yates\\n\
\\\n\
     * shuffle. See http://en.wikipedia.org/wiki/Fisher-Yates_shuffle.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Collections\\n\
\\\n\
     * @param {Array|Object|string} collection The collection to shuffle.\\n\
\\\n\
     * @returns {Array} Returns a new shuffled collection.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.shuffle([1, 2, 3, 4, 5, 6]);\\n\
\\\n\
     * // => [4, 1, 6, 3, 5, 2]\\n\
\\\n\
     */\\n\
\\\n\
    function shuffle(collection) {\\n\
\\\n\
      var index = -1,\\n\
\\\n\
          length = collection ? collection.length : 0,\\n\
\\\n\
          result = Array(typeof length == 'number' ? length : 0);\\n\
\\\n\
\\n\
\\\n\
      forEach(collection, function(value) {\\n\
\\\n\
        var rand = baseRandom(0, ++index);\\n\
\\\n\
        result[index] = result[rand];\\n\
\\\n\
        result[rand] = value;\\n\
\\\n\
      });\\n\
\\\n\
      return result;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Gets the size of the `collection` by returning `collection.length` for arrays\\n\
\\\n\
     * and array-like objects or the number of own enumerable properties for objects.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Collections\\n\
\\\n\
     * @param {Array|Object|string} collection The collection to inspect.\\n\
\\\n\
     * @returns {number} Returns `collection.length` or number of own enumerable properties.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.size([1, 2]);\\n\
\\\n\
     * // => 2\\n\
\\\n\
     *\\n\
\\\n\
     * _.size({ 'one': 1, 'two': 2, 'three': 3 });\\n\
\\\n\
     * // => 3\\n\
\\\n\
     *\\n\
\\\n\
     * _.size('pebbles');\\n\
\\\n\
     * // => 7\\n\
\\\n\
     */\\n\
\\\n\
    function size(collection) {\\n\
\\\n\
      var length = collection ? collection.length : 0;\\n\
\\\n\
      return typeof length == 'number' ? length : keys(collection).length;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Checks if the callback returns a truey value for **any** element of a\\n\
\\\n\
     * collection. The function returns as soon as it finds a passing value and\\n\
\\\n\
     * does not iterate over the entire collection. The callback is bound to\\n\
\\\n\
     * `thisArg` and invoked with three arguments; (value, index|key, collection).\\n\
\\\n\
     *\\n\
\\\n\
     * If a property name is provided for `callback` the created \\\"_.pluck\\\" style\\n\
\\\n\
     * callback will return the property value of the given element.\\n\
\\\n\
     *\\n\
\\\n\
     * If an object is provided for `callback` the created \\\"_.where\\\" style callback\\n\
\\\n\
     * will return `true` for elements that have the properties of the given object,\\n\
\\\n\
     * else `false`.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @alias any\\n\
\\\n\
     * @category Collections\\n\
\\\n\
     * @param {Array|Object|string} collection The collection to iterate over.\\n\
\\\n\
     * @param {Function|Object|string} [callback=identity] The function called\\n\
\\\n\
     *  per iteration. If a property name or object is provided it will be used\\n\
\\\n\
     *  to create a \\\"_.pluck\\\" or \\\"_.where\\\" style callback, respectively.\\n\
\\\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\\n\
\\\n\
     * @returns {boolean} Returns `true` if any element passed the callback check,\\n\
\\\n\
     *  else `false`.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.some([null, 0, 'yes', false], Boolean);\\n\
\\\n\
     * // => true\\n\
\\\n\
     *\\n\
\\\n\
     * var characters = [\\n\
\\\n\
     *   { 'name': 'barney', 'age': 36, 'blocked': false },\\n\
\\\n\
     *   { 'name': 'fred',   'age': 40, 'blocked': true }\\n\
\\\n\
     * ];\\n\
\\\n\
     *\\n\
\\\n\
     * // using \\\"_.pluck\\\" callback shorthand\\n\
\\\n\
     * _.some(characters, 'blocked');\\n\
\\\n\
     * // => true\\n\
\\\n\
     *\\n\
\\\n\
     * // using \\\"_.where\\\" callback shorthand\\n\
\\\n\
     * _.some(characters, { 'age': 1 });\\n\
\\\n\
     * // => false\\n\
\\\n\
     */\\n\
\\\n\
    function some(collection, callback, thisArg) {\\n\
\\\n\
      var result;\\n\
\\\n\
      callback = lodash.createCallback(callback, thisArg, 3);\\n\
\\\n\
\\n\
\\\n\
      if (isArray(collection)) {\\n\
\\\n\
        var index = -1,\\n\
\\\n\
            length = collection.length;\\n\
\\\n\
\\n\
\\\n\
        while (++index < length) {\\n\
\\\n\
          if ((result = callback(collection[index], index, collection))) {\\n\
\\\n\
            break;\\n\
\\\n\
          }\\n\
\\\n\
        }\\n\
\\\n\
      } else {\\n\
\\\n\
        baseEach(collection, function(value, index, collection) {\\n\
\\\n\
          return !(result = callback(value, index, collection));\\n\
\\\n\
        });\\n\
\\\n\
      }\\n\
\\\n\
      return !!result;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Creates an array of elements, sorted in ascending order by the results of\\n\
\\\n\
     * running each element in a collection through the callback. This method\\n\
\\\n\
     * performs a stable sort, that is, it will preserve the original sort order\\n\
\\\n\
     * of equal elements. The callback is bound to `thisArg` and invoked with\\n\
\\\n\
     * three arguments; (value, index|key, collection).\\n\
\\\n\
     *\\n\
\\\n\
     * If a property name is provided for `callback` the created \\\"_.pluck\\\" style\\n\
\\\n\
     * callback will return the property value of the given element.\\n\
\\\n\
     *\\n\
\\\n\
     * If an array of property names is provided for `callback` the collection\\n\
\\\n\
     * will be sorted by each property value.\\n\
\\\n\
     *\\n\
\\\n\
     * If an object is provided for `callback` the created \\\"_.where\\\" style callback\\n\
\\\n\
     * will return `true` for elements that have the properties of the given object,\\n\
\\\n\
     * else `false`.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Collections\\n\
\\\n\
     * @param {Array|Object|string} collection The collection to iterate over.\\n\
\\\n\
     * @param {Array|Function|Object|string} [callback=identity] The function called\\n\
\\\n\
     *  per iteration. If a property name or object is provided it will be used\\n\
\\\n\
     *  to create a \\\"_.pluck\\\" or \\\"_.where\\\" style callback, respectively.\\n\
\\\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\\n\
\\\n\
     * @returns {Array} Returns a new array of sorted elements.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.sortBy([1, 2, 3], function(num) { return Math.sin(num); });\\n\
\\\n\
     * // => [3, 1, 2]\\n\
\\\n\
     *\\n\
\\\n\
     * _.sortBy([1, 2, 3], function(num) { return this.sin(num); }, Math);\\n\
\\\n\
     * // => [3, 1, 2]\\n\
\\\n\
     *\\n\
\\\n\
     * var characters = [\\n\
\\\n\
     *   { 'name': 'barney',  'age': 36 },\\n\
\\\n\
     *   { 'name': 'fred',    'age': 40 },\\n\
\\\n\
     *   { 'name': 'barney',  'age': 26 },\\n\
\\\n\
     *   { 'name': 'fred',    'age': 30 }\\n\
\\\n\
     * ];\\n\
\\\n\
     *\\n\
\\\n\
     * // using \\\"_.pluck\\\" callback shorthand\\n\
\\\n\
     * _.map(_.sortBy(characters, 'age'), _.values);\\n\
\\\n\
     * // => [['barney', 26], ['fred', 30], ['barney', 36], ['fred', 40]]\\n\
\\\n\
     *\\n\
\\\n\
     * // sorting by multiple properties\\n\
\\\n\
     * _.map(_.sortBy(characters, ['name', 'age']), _.values);\\n\
\\\n\
     * // = > [['barney', 26], ['barney', 36], ['fred', 30], ['fred', 40]]\\n\
\\\n\
     */\\n\
\\\n\
    function sortBy(collection, callback, thisArg) {\\n\
\\\n\
      var index = -1,\\n\
\\\n\
          isArr = isArray(callback),\\n\
\\\n\
          length = collection ? collection.length : 0,\\n\
\\\n\
          result = Array(typeof length == 'number' ? length : 0);\\n\
\\\n\
\\n\
\\\n\
      if (!isArr) {\\n\
\\\n\
        callback = lodash.createCallback(callback, thisArg, 3);\\n\
\\\n\
      }\\n\
\\\n\
      forEach(collection, function(value, key, collection) {\\n\
\\\n\
        var object = result[++index] = getObject();\\n\
\\\n\
        if (isArr) {\\n\
\\\n\
          object.criteria = map(callback, function(key) { return value[key]; });\\n\
\\\n\
        } else {\\n\
\\\n\
          (object.criteria = getArray())[0] = callback(value, key, collection);\\n\
\\\n\
        }\\n\
\\\n\
        object.index = index;\\n\
\\\n\
        object.value = value;\\n\
\\\n\
      });\\n\
\\\n\
\\n\
\\\n\
      length = result.length;\\n\
\\\n\
      result.sort(compareAscending);\\n\
\\\n\
      while (length--) {\\n\
\\\n\
        var object = result[length];\\n\
\\\n\
        result[length] = object.value;\\n\
\\\n\
        if (!isArr) {\\n\
\\\n\
          releaseArray(object.criteria);\\n\
\\\n\
        }\\n\
\\\n\
        releaseObject(object);\\n\
\\\n\
      }\\n\
\\\n\
      return result;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Converts the `collection` to an array.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Collections\\n\
\\\n\
     * @param {Array|Object|string} collection The collection to convert.\\n\
\\\n\
     * @returns {Array} Returns the new converted array.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * (function() { return _.toArray(arguments).slice(1); })(1, 2, 3, 4);\\n\
\\\n\
     * // => [2, 3, 4]\\n\
\\\n\
     */\\n\
\\\n\
    function toArray(collection) {\\n\
\\\n\
      if (collection && typeof collection.length == 'number') {\\n\
\\\n\
        return (support.unindexedChars && isString(collection))\\n\
\\\n\
          ? collection.split('')\\n\
\\\n\
          : slice(collection);\\n\
\\\n\
      }\\n\
\\\n\
      return values(collection);\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Performs a deep comparison of each element in a `collection` to the given\\n\
\\\n\
     * `properties` object, returning an array of all elements that have equivalent\\n\
\\\n\
     * property values.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @type Function\\n\
\\\n\
     * @category Collections\\n\
\\\n\
     * @param {Array|Object|string} collection The collection to iterate over.\\n\
\\\n\
     * @param {Object} props The object of property values to filter by.\\n\
\\\n\
     * @returns {Array} Returns a new array of elements that have the given properties.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * var characters = [\\n\
\\\n\
     *   { 'name': 'barney', 'age': 36, 'pets': ['hoppy'] },\\n\
\\\n\
     *   { 'name': 'fred',   'age': 40, 'pets': ['baby puss', 'dino'] }\\n\
\\\n\
     * ];\\n\
\\\n\
     *\\n\
\\\n\
     * _.where(characters, { 'age': 36 });\\n\
\\\n\
     * // => [{ 'name': 'barney', 'age': 36, 'pets': ['hoppy'] }]\\n\
\\\n\
     *\\n\
\\\n\
     * _.where(characters, { 'pets': ['dino'] });\\n\
\\\n\
     * // => [{ 'name': 'fred', 'age': 40, 'pets': ['baby puss', 'dino'] }]\\n\
\\\n\
     */\\n\
\\\n\
    var where = filter;\\n\
\\\n\
\\n\
\\\n\
    /*--------------------------------------------------------------------------*/\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Creates an array with all falsey values removed. The values `false`, `null`,\\n\
\\\n\
     * `0`, `\\\"\\\"`, `undefined`, and `NaN` are all falsey.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Arrays\\n\
\\\n\
     * @param {Array} array The array to compact.\\n\
\\\n\
     * @returns {Array} Returns a new array of filtered values.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.compact([0, 1, false, 2, '', 3]);\\n\
\\\n\
     * // => [1, 2, 3]\\n\
\\\n\
     */\\n\
\\\n\
    function compact(array) {\\n\
\\\n\
      var index = -1,\\n\
\\\n\
          length = array ? array.length : 0,\\n\
\\\n\
          result = [];\\n\
\\\n\
\\n\
\\\n\
      while (++index < length) {\\n\
\\\n\
        var value = array[index];\\n\
\\\n\
        if (value) {\\n\
\\\n\
          result.push(value);\\n\
\\\n\
        }\\n\
\\\n\
      }\\n\
\\\n\
      return result;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Creates an array excluding all values of the provided arrays using strict\\n\
\\\n\
     * equality for comparisons, i.e. `===`.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Arrays\\n\
\\\n\
     * @param {Array} array The array to process.\\n\
\\\n\
     * @param {...Array} [values] The arrays of values to exclude.\\n\
\\\n\
     * @returns {Array} Returns a new array of filtered values.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.difference([1, 2, 3, 4, 5], [5, 2, 10]);\\n\
\\\n\
     * // => [1, 3, 4]\\n\
\\\n\
     */\\n\
\\\n\
    function difference(array) {\\n\
\\\n\
      return baseDifference(array, baseFlatten(arguments, true, true, 1));\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * This method is like `_.find` except that it returns the index of the first\\n\
\\\n\
     * element that passes the callback check, instead of the element itself.\\n\
\\\n\
     *\\n\
\\\n\
     * If a property name is provided for `callback` the created \\\"_.pluck\\\" style\\n\
\\\n\
     * callback will return the property value of the given element.\\n\
\\\n\
     *\\n\
\\\n\
     * If an object is provided for `callback` the created \\\"_.where\\\" style callback\\n\
\\\n\
     * will return `true` for elements that have the properties of the given object,\\n\
\\\n\
     * else `false`.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Arrays\\n\
\\\n\
     * @param {Array} array The array to search.\\n\
\\\n\
     * @param {Function|Object|string} [callback=identity] The function called\\n\
\\\n\
     *  per iteration. If a property name or object is provided it will be used\\n\
\\\n\
     *  to create a \\\"_.pluck\\\" or \\\"_.where\\\" style callback, respectively.\\n\
\\\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\\n\
\\\n\
     * @returns {number} Returns the index of the found element, else `-1`.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * var characters = [\\n\
\\\n\
     *   { 'name': 'barney',  'age': 36, 'blocked': false },\\n\
\\\n\
     *   { 'name': 'fred',    'age': 40, 'blocked': true },\\n\
\\\n\
     *   { 'name': 'pebbles', 'age': 1,  'blocked': false }\\n\
\\\n\
     * ];\\n\
\\\n\
     *\\n\
\\\n\
     * _.findIndex(characters, function(chr) {\\n\
\\\n\
     *   return chr.age < 20;\\n\
\\\n\
     * });\\n\
\\\n\
     * // => 2\\n\
\\\n\
     *\\n\
\\\n\
     * // using \\\"_.where\\\" callback shorthand\\n\
\\\n\
     * _.findIndex(characters, { 'age': 36 });\\n\
\\\n\
     * // => 0\\n\
\\\n\
     *\\n\
\\\n\
     * // using \\\"_.pluck\\\" callback shorthand\\n\
\\\n\
     * _.findIndex(characters, 'blocked');\\n\
\\\n\
     * // => 1\\n\
\\\n\
     */\\n\
\\\n\
    function findIndex(array, callback, thisArg) {\\n\
\\\n\
      var index = -1,\\n\
\\\n\
          length = array ? array.length : 0;\\n\
\\\n\
\\n\
\\\n\
      callback = lodash.createCallback(callback, thisArg, 3);\\n\
\\\n\
      while (++index < length) {\\n\
\\\n\
        if (callback(array[index], index, array)) {\\n\
\\\n\
          return index;\\n\
\\\n\
        }\\n\
\\\n\
      }\\n\
\\\n\
      return -1;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * This method is like `_.findIndex` except that it iterates over elements\\n\
\\\n\
     * of a `collection` from right to left.\\n\
\\\n\
     *\\n\
\\\n\
     * If a property name is provided for `callback` the created \\\"_.pluck\\\" style\\n\
\\\n\
     * callback will return the property value of the given element.\\n\
\\\n\
     *\\n\
\\\n\
     * If an object is provided for `callback` the created \\\"_.where\\\" style callback\\n\
\\\n\
     * will return `true` for elements that have the properties of the given object,\\n\
\\\n\
     * else `false`.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Arrays\\n\
\\\n\
     * @param {Array} array The array to search.\\n\
\\\n\
     * @param {Function|Object|string} [callback=identity] The function called\\n\
\\\n\
     *  per iteration. If a property name or object is provided it will be used\\n\
\\\n\
     *  to create a \\\"_.pluck\\\" or \\\"_.where\\\" style callback, respectively.\\n\
\\\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\\n\
\\\n\
     * @returns {number} Returns the index of the found element, else `-1`.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * var characters = [\\n\
\\\n\
     *   { 'name': 'barney',  'age': 36, 'blocked': true },\\n\
\\\n\
     *   { 'name': 'fred',    'age': 40, 'blocked': false },\\n\
\\\n\
     *   { 'name': 'pebbles', 'age': 1,  'blocked': true }\\n\
\\\n\
     * ];\\n\
\\\n\
     *\\n\
\\\n\
     * _.findLastIndex(characters, function(chr) {\\n\
\\\n\
     *   return chr.age > 30;\\n\
\\\n\
     * });\\n\
\\\n\
     * // => 1\\n\
\\\n\
     *\\n\
\\\n\
     * // using \\\"_.where\\\" callback shorthand\\n\
\\\n\
     * _.findLastIndex(characters, { 'age': 36 });\\n\
\\\n\
     * // => 0\\n\
\\\n\
     *\\n\
\\\n\
     * // using \\\"_.pluck\\\" callback shorthand\\n\
\\\n\
     * _.findLastIndex(characters, 'blocked');\\n\
\\\n\
     * // => 2\\n\
\\\n\
     */\\n\
\\\n\
    function findLastIndex(array, callback, thisArg) {\\n\
\\\n\
      var length = array ? array.length : 0;\\n\
\\\n\
      callback = lodash.createCallback(callback, thisArg, 3);\\n\
\\\n\
      while (length--) {\\n\
\\\n\
        if (callback(array[length], length, array)) {\\n\
\\\n\
          return length;\\n\
\\\n\
        }\\n\
\\\n\
      }\\n\
\\\n\
      return -1;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Gets the first element or first `n` elements of an array. If a callback\\n\
\\\n\
     * is provided elements at the beginning of the array are returned as long\\n\
\\\n\
     * as the callback returns truey. The callback is bound to `thisArg` and\\n\
\\\n\
     * invoked with three arguments; (value, index, array).\\n\
\\\n\
     *\\n\
\\\n\
     * If a property name is provided for `callback` the created \\\"_.pluck\\\" style\\n\
\\\n\
     * callback will return the property value of the given element.\\n\
\\\n\
     *\\n\
\\\n\
     * If an object is provided for `callback` the created \\\"_.where\\\" style callback\\n\
\\\n\
     * will return `true` for elements that have the properties of the given object,\\n\
\\\n\
     * else `false`.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @alias head, take\\n\
\\\n\
     * @category Arrays\\n\
\\\n\
     * @param {Array} array The array to query.\\n\
\\\n\
     * @param {Function|Object|number|string} [callback] The function called\\n\
\\\n\
     *  per element or the number of elements to return. If a property name or\\n\
\\\n\
     *  object is provided it will be used to create a \\\"_.pluck\\\" or \\\"_.where\\\"\\n\
\\\n\
     *  style callback, respectively.\\n\
\\\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\\n\
\\\n\
     * @returns {*} Returns the first element(s) of `array`.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.first([1, 2, 3]);\\n\
\\\n\
     * // => 1\\n\
\\\n\
     *\\n\
\\\n\
     * // returns the first two elements\\n\
\\\n\
     * _.first([1, 2, 3], 2);\\n\
\\\n\
     * // => [1, 2]\\n\
\\\n\
     *\\n\
\\\n\
     * // returns elements from the beginning until the callback result is falsey\\n\
\\\n\
     * _.first([1, 2, 3], function(num) {\\n\
\\\n\
     *   return num < 3;\\n\
\\\n\
     * });\\n\
\\\n\
     * // => [1, 2]\\n\
\\\n\
     *\\n\
\\\n\
     * var characters = [\\n\
\\\n\
     *   { 'name': 'barney',  'blocked': true,  'employer': 'slate' },\\n\
\\\n\
     *   { 'name': 'fred',    'blocked': false, 'employer': 'slate' },\\n\
\\\n\
     *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }\\n\
\\\n\
     * ];\\n\
\\\n\
     *\\n\
\\\n\
     * // using \\\"_.pluck\\\" callback shorthand\\n\
\\\n\
     * _.first(characters, 'blocked');\\n\
\\\n\
     * // => [{ 'name': 'barney', 'blocked': true, 'employer': 'slate' }]\\n\
\\\n\
     *\\n\
\\\n\
     * // using \\\"_.where\\\" callback shorthand\\n\
\\\n\
     * _.pluck(_.first(characters, { 'employer': 'slate' }), 'name');\\n\
\\\n\
     * // => ['barney', 'fred']\\n\
\\\n\
     */\\n\
\\\n\
    function first(array, callback, thisArg) {\\n\
\\\n\
      var n = 0,\\n\
\\\n\
          length = array ? array.length : 0;\\n\
\\\n\
\\n\
\\\n\
      if (typeof callback != 'number' && callback != null) {\\n\
\\\n\
        var index = -1;\\n\
\\\n\
        callback = lodash.createCallback(callback, thisArg, 3);\\n\
\\\n\
        while (++index < length && callback(array[index], index, array)) {\\n\
\\\n\
          n++;\\n\
\\\n\
        }\\n\
\\\n\
      } else {\\n\
\\\n\
        n = callback;\\n\
\\\n\
        if (n == null || thisArg) {\\n\
\\\n\
          return array ? array[0] : undefined;\\n\
\\\n\
        }\\n\
\\\n\
      }\\n\
\\\n\
      return slice(array, 0, nativeMin(nativeMax(0, n), length));\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Flattens a nested array (the nesting can be to any depth). If `isShallow`\\n\
\\\n\
     * is truey, the array will only be flattened a single level. If a callback\\n\
\\\n\
     * is provided each element of the array is passed through the callback before\\n\
\\\n\
     * flattening. The callback is bound to `thisArg` and invoked with three\\n\
\\\n\
     * arguments; (value, index, array).\\n\
\\\n\
     *\\n\
\\\n\
     * If a property name is provided for `callback` the created \\\"_.pluck\\\" style\\n\
\\\n\
     * callback will return the property value of the given element.\\n\
\\\n\
     *\\n\
\\\n\
     * If an object is provided for `callback` the created \\\"_.where\\\" style callback\\n\
\\\n\
     * will return `true` for elements that have the properties of the given object,\\n\
\\\n\
     * else `false`.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Arrays\\n\
\\\n\
     * @param {Array} array The array to flatten.\\n\
\\\n\
     * @param {boolean} [isShallow=false] A flag to restrict flattening to a single level.\\n\
\\\n\
     * @param {Function|Object|string} [callback=identity] The function called\\n\
\\\n\
     *  per iteration. If a property name or object is provided it will be used\\n\
\\\n\
     *  to create a \\\"_.pluck\\\" or \\\"_.where\\\" style callback, respectively.\\n\
\\\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\\n\
\\\n\
     * @returns {Array} Returns a new flattened array.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.flatten([1, [2], [3, [[4]]]]);\\n\
\\\n\
     * // => [1, 2, 3, 4];\\n\
\\\n\
     *\\n\
\\\n\
     * // using `isShallow`\\n\
\\\n\
     * _.flatten([1, [2], [3, [[4]]]], true);\\n\
\\\n\
     * // => [1, 2, 3, [[4]]];\\n\
\\\n\
     *\\n\
\\\n\
     * var characters = [\\n\
\\\n\
     *   { 'name': 'barney', 'age': 30, 'pets': ['hoppy'] },\\n\
\\\n\
     *   { 'name': 'fred',   'age': 40, 'pets': ['baby puss', 'dino'] }\\n\
\\\n\
     * ];\\n\
\\\n\
     *\\n\
\\\n\
     * // using \\\"_.pluck\\\" callback shorthand\\n\
\\\n\
     * _.flatten(characters, 'pets');\\n\
\\\n\
     * // => ['hoppy', 'baby puss', 'dino']\\n\
\\\n\
     */\\n\
\\\n\
    function flatten(array, isShallow, callback, thisArg) {\\n\
\\\n\
      // juggle arguments\\n\
\\\n\
      if (typeof isShallow != 'boolean' && isShallow != null) {\\n\
\\\n\
        thisArg = callback;\\n\
\\\n\
        callback = (typeof isShallow != 'function' && thisArg && thisArg[isShallow] === array) ? null : isShallow;\\n\
\\\n\
        isShallow = false;\\n\
\\\n\
      }\\n\
\\\n\
      if (callback != null) {\\n\
\\\n\
        array = map(array, callback, thisArg);\\n\
\\\n\
      }\\n\
\\\n\
      return baseFlatten(array, isShallow);\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Gets the index at which the first occurrence of `value` is found using\\n\
\\\n\
     * strict equality for comparisons, i.e. `===`. If the array is already sorted\\n\
\\\n\
     * providing `true` for `fromIndex` will run a faster binary search.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Arrays\\n\
\\\n\
     * @param {Array} array The array to search.\\n\
\\\n\
     * @param {*} value The value to search for.\\n\
\\\n\
     * @param {boolean|number} [fromIndex=0] The index to search from or `true`\\n\
\\\n\
     *  to perform a binary search on a sorted array.\\n\
\\\n\
     * @returns {number} Returns the index of the matched value or `-1`.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.indexOf([1, 2, 3, 1, 2, 3], 2);\\n\
\\\n\
     * // => 1\\n\
\\\n\
     *\\n\
\\\n\
     * // using `fromIndex`\\n\
\\\n\
     * _.indexOf([1, 2, 3, 1, 2, 3], 2, 3);\\n\
\\\n\
     * // => 4\\n\
\\\n\
     *\\n\
\\\n\
     * // performing a binary search\\n\
\\\n\
     * _.indexOf([1, 1, 2, 2, 3, 3], 2, true);\\n\
\\\n\
     * // => 2\\n\
\\\n\
     */\\n\
\\\n\
    function indexOf(array, value, fromIndex) {\\n\
\\\n\
      if (typeof fromIndex == 'number') {\\n\
\\\n\
        var length = array ? array.length : 0;\\n\
\\\n\
        fromIndex = (fromIndex < 0 ? nativeMax(0, length + fromIndex) : fromIndex || 0);\\n\
\\\n\
      } else if (fromIndex) {\\n\
\\\n\
        var index = sortedIndex(array, value);\\n\
\\\n\
        return array[index] === value ? index : -1;\\n\
\\\n\
      }\\n\
\\\n\
      return baseIndexOf(array, value, fromIndex);\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Gets all but the last element or last `n` elements of an array. If a\\n\
\\\n\
     * callback is provided elements at the end of the array are excluded from\\n\
\\\n\
     * the result as long as the callback returns truey. The callback is bound\\n\
\\\n\
     * to `thisArg` and invoked with three arguments; (value, index, array).\\n\
\\\n\
     *\\n\
\\\n\
     * If a property name is provided for `callback` the created \\\"_.pluck\\\" style\\n\
\\\n\
     * callback will return the property value of the given element.\\n\
\\\n\
     *\\n\
\\\n\
     * If an object is provided for `callback` the created \\\"_.where\\\" style callback\\n\
\\\n\
     * will return `true` for elements that have the properties of the given object,\\n\
\\\n\
     * else `false`.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Arrays\\n\
\\\n\
     * @param {Array} array The array to query.\\n\
\\\n\
     * @param {Function|Object|number|string} [callback=1] The function called\\n\
\\\n\
     *  per element or the number of elements to exclude. If a property name or\\n\
\\\n\
     *  object is provided it will be used to create a \\\"_.pluck\\\" or \\\"_.where\\\"\\n\
\\\n\
     *  style callback, respectively.\\n\
\\\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\\n\
\\\n\
     * @returns {Array} Returns a slice of `array`.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.initial([1, 2, 3]);\\n\
\\\n\
     * // => [1, 2]\\n\
\\\n\
     *\\n\
\\\n\
     * // excludes the last two elements\\n\
\\\n\
     * _.initial([1, 2, 3], 2);\\n\
\\\n\
     * // => [1]\\n\
\\\n\
     *\\n\
\\\n\
     * // excludes elements from the end until the callback fails\\n\
\\\n\
     * _.initial([1, 2, 3], function(num) {\\n\
\\\n\
     *   return num > 1;\\n\
\\\n\
     * });\\n\
\\\n\
     * // => [1]\\n\
\\\n\
     *\\n\
\\\n\
     * var characters = [\\n\
\\\n\
     *   { 'name': 'barney',  'blocked': false, 'employer': 'slate' },\\n\
\\\n\
     *   { 'name': 'fred',    'blocked': true,  'employer': 'slate' },\\n\
\\\n\
     *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }\\n\
\\\n\
     * ];\\n\
\\\n\
     *\\n\
\\\n\
     * // using \\\"_.pluck\\\" callback shorthand\\n\
\\\n\
     * _.initial(characters, 'blocked');\\n\
\\\n\
     * // => [{ 'name': 'barney',  'blocked': false, 'employer': 'slate' }]\\n\
\\\n\
     *\\n\
\\\n\
     * // using \\\"_.where\\\" callback shorthand\\n\
\\\n\
     * _.pluck(_.initial(characters, { 'employer': 'na' }), 'name');\\n\
\\\n\
     * // => ['barney', 'fred']\\n\
\\\n\
     */\\n\
\\\n\
    function initial(array, callback, thisArg) {\\n\
\\\n\
      var n = 0,\\n\
\\\n\
          length = array ? array.length : 0;\\n\
\\\n\
\\n\
\\\n\
      if (typeof callback != 'number' && callback != null) {\\n\
\\\n\
        var index = length;\\n\
\\\n\
        callback = lodash.createCallback(callback, thisArg, 3);\\n\
\\\n\
        while (index-- && callback(array[index], index, array)) {\\n\
\\\n\
          n++;\\n\
\\\n\
        }\\n\
\\\n\
      } else {\\n\
\\\n\
        n = (callback == null || thisArg) ? 1 : callback || n;\\n\
\\\n\
      }\\n\
\\\n\
      return slice(array, 0, nativeMin(nativeMax(0, length - n), length));\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Creates an array of unique values present in all provided arrays using\\n\
\\\n\
     * strict equality for comparisons, i.e. `===`.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Arrays\\n\
\\\n\
     * @param {...Array} [array] The arrays to inspect.\\n\
\\\n\
     * @returns {Array} Returns an array of shared values.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.intersection([1, 2, 3], [5, 2, 1, 4], [2, 1]);\\n\
\\\n\
     * // => [1, 2]\\n\
\\\n\
     */\\n\
\\\n\
    function intersection() {\\n\
\\\n\
      var args = [],\\n\
\\\n\
          argsIndex = -1,\\n\
\\\n\
          argsLength = arguments.length,\\n\
\\\n\
          caches = getArray(),\\n\
\\\n\
          indexOf = getIndexOf(),\\n\
\\\n\
          trustIndexOf = indexOf === baseIndexOf,\\n\
\\\n\
          seen = getArray();\\n\
\\\n\
\\n\
\\\n\
      while (++argsIndex < argsLength) {\\n\
\\\n\
        var value = arguments[argsIndex];\\n\
\\\n\
        if (isArray(value) || isArguments(value)) {\\n\
\\\n\
          args.push(value);\\n\
\\\n\
          caches.push(trustIndexOf && value.length >= largeArraySize &&\\n\
\\\n\
            createCache(argsIndex ? args[argsIndex] : seen));\\n\
\\\n\
        }\\n\
\\\n\
      }\\n\
\\\n\
      var array = args[0],\\n\
\\\n\
          index = -1,\\n\
\\\n\
          length = array ? array.length : 0,\\n\
\\\n\
          result = [];\\n\
\\\n\
\\n\
\\\n\
      outer:\\n\
\\\n\
      while (++index < length) {\\n\
\\\n\
        var cache = caches[0];\\n\
\\\n\
        value = array[index];\\n\
\\\n\
\\n\
\\\n\
        if ((cache ? cacheIndexOf(cache, value) : indexOf(seen, value)) < 0) {\\n\
\\\n\
          argsIndex = argsLength;\\n\
\\\n\
          (cache || seen).push(value);\\n\
\\\n\
          while (--argsIndex) {\\n\
\\\n\
            cache = caches[argsIndex];\\n\
\\\n\
            if ((cache ? cacheIndexOf(cache, value) : indexOf(args[argsIndex], value)) < 0) {\\n\
\\\n\
              continue outer;\\n\
\\\n\
            }\\n\
\\\n\
          }\\n\
\\\n\
          result.push(value);\\n\
\\\n\
        }\\n\
\\\n\
      }\\n\
\\\n\
      while (argsLength--) {\\n\
\\\n\
        cache = caches[argsLength];\\n\
\\\n\
        if (cache) {\\n\
\\\n\
          releaseObject(cache);\\n\
\\\n\
        }\\n\
\\\n\
      }\\n\
\\\n\
      releaseArray(caches);\\n\
\\\n\
      releaseArray(seen);\\n\
\\\n\
      return result;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Gets the last element or last `n` elements of an array. If a callback is\\n\
\\\n\
     * provided elements at the end of the array are returned as long as the\\n\
\\\n\
     * callback returns truey. The callback is bound to `thisArg` and invoked\\n\
\\\n\
     * with three arguments; (value, index, array).\\n\
\\\n\
     *\\n\
\\\n\
     * If a property name is provided for `callback` the created \\\"_.pluck\\\" style\\n\
\\\n\
     * callback will return the property value of the given element.\\n\
\\\n\
     *\\n\
\\\n\
     * If an object is provided for `callback` the created \\\"_.where\\\" style callback\\n\
\\\n\
     * will return `true` for elements that have the properties of the given object,\\n\
\\\n\
     * else `false`.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Arrays\\n\
\\\n\
     * @param {Array} array The array to query.\\n\
\\\n\
     * @param {Function|Object|number|string} [callback] The function called\\n\
\\\n\
     *  per element or the number of elements to return. If a property name or\\n\
\\\n\
     *  object is provided it will be used to create a \\\"_.pluck\\\" or \\\"_.where\\\"\\n\
\\\n\
     *  style callback, respectively.\\n\
\\\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\\n\
\\\n\
     * @returns {*} Returns the last element(s) of `array`.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.last([1, 2, 3]);\\n\
\\\n\
     * // => 3\\n\
\\\n\
     *\\n\
\\\n\
     * // returns the last two elements\\n\
\\\n\
     * _.last([1, 2, 3], 2);\\n\
\\\n\
     * // => [2, 3]\\n\
\\\n\
     *\\n\
\\\n\
     * // returns elements from the end until the callback fails\\n\
\\\n\
     * _.last([1, 2, 3], function(num) {\\n\
\\\n\
     *   return num > 1;\\n\
\\\n\
     * });\\n\
\\\n\
     * // => [2, 3]\\n\
\\\n\
     *\\n\
\\\n\
     * var characters = [\\n\
\\\n\
     *   { 'name': 'barney',  'blocked': false, 'employer': 'slate' },\\n\
\\\n\
     *   { 'name': 'fred',    'blocked': true,  'employer': 'slate' },\\n\
\\\n\
     *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }\\n\
\\\n\
     * ];\\n\
\\\n\
     *\\n\
\\\n\
     * // using \\\"_.pluck\\\" callback shorthand\\n\
\\\n\
     * _.pluck(_.last(characters, 'blocked'), 'name');\\n\
\\\n\
     * // => ['fred', 'pebbles']\\n\
\\\n\
     *\\n\
\\\n\
     * // using \\\"_.where\\\" callback shorthand\\n\
\\\n\
     * _.last(characters, { 'employer': 'na' });\\n\
\\\n\
     * // => [{ 'name': 'pebbles', 'blocked': true, 'employer': 'na' }]\\n\
\\\n\
     */\\n\
\\\n\
    function last(array, callback, thisArg) {\\n\
\\\n\
      var n = 0,\\n\
\\\n\
          length = array ? array.length : 0;\\n\
\\\n\
\\n\
\\\n\
      if (typeof callback != 'number' && callback != null) {\\n\
\\\n\
        var index = length;\\n\
\\\n\
        callback = lodash.createCallback(callback, thisArg, 3);\\n\
\\\n\
        while (index-- && callback(array[index], index, array)) {\\n\
\\\n\
          n++;\\n\
\\\n\
        }\\n\
\\\n\
      } else {\\n\
\\\n\
        n = callback;\\n\
\\\n\
        if (n == null || thisArg) {\\n\
\\\n\
          return array ? array[length - 1] : undefined;\\n\
\\\n\
        }\\n\
\\\n\
      }\\n\
\\\n\
      return slice(array, nativeMax(0, length - n));\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Gets the index at which the last occurrence of `value` is found using strict\\n\
\\\n\
     * equality for comparisons, i.e. `===`. If `fromIndex` is negative, it is used\\n\
\\\n\
     * as the offset from the end of the collection.\\n\
\\\n\
     *\\n\
\\\n\
     * If a property name is provided for `callback` the created \\\"_.pluck\\\" style\\n\
\\\n\
     * callback will return the property value of the given element.\\n\
\\\n\
     *\\n\
\\\n\
     * If an object is provided for `callback` the created \\\"_.where\\\" style callback\\n\
\\\n\
     * will return `true` for elements that have the properties of the given object,\\n\
\\\n\
     * else `false`.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Arrays\\n\
\\\n\
     * @param {Array} array The array to search.\\n\
\\\n\
     * @param {*} value The value to search for.\\n\
\\\n\
     * @param {number} [fromIndex=array.length-1] The index to search from.\\n\
\\\n\
     * @returns {number} Returns the index of the matched value or `-1`.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.lastIndexOf([1, 2, 3, 1, 2, 3], 2);\\n\
\\\n\
     * // => 4\\n\
\\\n\
     *\\n\
\\\n\
     * // using `fromIndex`\\n\
\\\n\
     * _.lastIndexOf([1, 2, 3, 1, 2, 3], 2, 3);\\n\
\\\n\
     * // => 1\\n\
\\\n\
     */\\n\
\\\n\
    function lastIndexOf(array, value, fromIndex) {\\n\
\\\n\
      var index = array ? array.length : 0;\\n\
\\\n\
      if (typeof fromIndex == 'number') {\\n\
\\\n\
        index = (fromIndex < 0 ? nativeMax(0, index + fromIndex) : nativeMin(fromIndex, index - 1)) + 1;\\n\
\\\n\
      }\\n\
\\\n\
      while (index--) {\\n\
\\\n\
        if (array[index] === value) {\\n\
\\\n\
          return index;\\n\
\\\n\
        }\\n\
\\\n\
      }\\n\
\\\n\
      return -1;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Removes all provided values from the given array using strict equality for\\n\
\\\n\
     * comparisons, i.e. `===`.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Arrays\\n\
\\\n\
     * @param {Array} array The array to modify.\\n\
\\\n\
     * @param {...*} [value] The values to remove.\\n\
\\\n\
     * @returns {Array} Returns `array`.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * var array = [1, 2, 3, 1, 2, 3];\\n\
\\\n\
     * _.pull(array, 2, 3);\\n\
\\\n\
     * console.log(array);\\n\
\\\n\
     * // => [1, 1]\\n\
\\\n\
     */\\n\
\\\n\
    function pull(array) {\\n\
\\\n\
      var args = arguments,\\n\
\\\n\
          argsIndex = 0,\\n\
\\\n\
          argsLength = args.length,\\n\
\\\n\
          length = array ? array.length : 0;\\n\
\\\n\
\\n\
\\\n\
      while (++argsIndex < argsLength) {\\n\
\\\n\
        var index = -1,\\n\
\\\n\
            value = args[argsIndex];\\n\
\\\n\
        while (++index < length) {\\n\
\\\n\
          if (array[index] === value) {\\n\
\\\n\
            splice.call(array, index--, 1);\\n\
\\\n\
            length--;\\n\
\\\n\
          }\\n\
\\\n\
        }\\n\
\\\n\
      }\\n\
\\\n\
      return array;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Creates an array of numbers (positive and/or negative) progressing from\\n\
\\\n\
     * `start` up to but not including `end`. If `start` is less than `stop` a\\n\
\\\n\
     * zero-length range is created unless a negative `step` is specified.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Arrays\\n\
\\\n\
     * @param {number} [start=0] The start of the range.\\n\
\\\n\
     * @param {number} end The end of the range.\\n\
\\\n\
     * @param {number} [step=1] The value to increment or decrement by.\\n\
\\\n\
     * @returns {Array} Returns a new range array.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.range(4);\\n\
\\\n\
     * // => [0, 1, 2, 3]\\n\
\\\n\
     *\\n\
\\\n\
     * _.range(1, 5);\\n\
\\\n\
     * // => [1, 2, 3, 4]\\n\
\\\n\
     *\\n\
\\\n\
     * _.range(0, 20, 5);\\n\
\\\n\
     * // => [0, 5, 10, 15]\\n\
\\\n\
     *\\n\
\\\n\
     * _.range(0, -4, -1);\\n\
\\\n\
     * // => [0, -1, -2, -3]\\n\
\\\n\
     *\\n\
\\\n\
     * _.range(1, 4, 0);\\n\
\\\n\
     * // => [1, 1, 1]\\n\
\\\n\
     *\\n\
\\\n\
     * _.range(0);\\n\
\\\n\
     * // => []\\n\
\\\n\
     */\\n\
\\\n\
    function range(start, end, step) {\\n\
\\\n\
      start = +start || 0;\\n\
\\\n\
      step = typeof step == 'number' ? step : (+step || 1);\\n\
\\\n\
\\n\
\\\n\
      if (end == null) {\\n\
\\\n\
        end = start;\\n\
\\\n\
        start = 0;\\n\
\\\n\
      }\\n\
\\\n\
      // use `Array(length)` so engines like Chakra and V8 avoid slower modes\\n\
\\\n\
      // http://youtu.be/XAqIpGU8ZZk#t=17m25s\\n\
\\\n\
      var index = -1,\\n\
\\\n\
          length = nativeMax(0, ceil((end - start) / (step || 1))),\\n\
\\\n\
          result = Array(length);\\n\
\\\n\
\\n\
\\\n\
      while (++index < length) {\\n\
\\\n\
        result[index] = start;\\n\
\\\n\
        start += step;\\n\
\\\n\
      }\\n\
\\\n\
      return result;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Removes all elements from an array that the callback returns truey for\\n\
\\\n\
     * and returns an array of removed elements. The callback is bound to `thisArg`\\n\
\\\n\
     * and invoked with three arguments; (value, index, array).\\n\
\\\n\
     *\\n\
\\\n\
     * If a property name is provided for `callback` the created \\\"_.pluck\\\" style\\n\
\\\n\
     * callback will return the property value of the given element.\\n\
\\\n\
     *\\n\
\\\n\
     * If an object is provided for `callback` the created \\\"_.where\\\" style callback\\n\
\\\n\
     * will return `true` for elements that have the properties of the given object,\\n\
\\\n\
     * else `false`.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Arrays\\n\
\\\n\
     * @param {Array} array The array to modify.\\n\
\\\n\
     * @param {Function|Object|string} [callback=identity] The function called\\n\
\\\n\
     *  per iteration. If a property name or object is provided it will be used\\n\
\\\n\
     *  to create a \\\"_.pluck\\\" or \\\"_.where\\\" style callback, respectively.\\n\
\\\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\\n\
\\\n\
     * @returns {Array} Returns a new array of removed elements.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * var array = [1, 2, 3, 4, 5, 6];\\n\
\\\n\
     * var evens = _.remove(array, function(num) { return num % 2 == 0; });\\n\
\\\n\
     *\\n\
\\\n\
     * console.log(array);\\n\
\\\n\
     * // => [1, 3, 5]\\n\
\\\n\
     *\\n\
\\\n\
     * console.log(evens);\\n\
\\\n\
     * // => [2, 4, 6]\\n\
\\\n\
     */\\n\
\\\n\
    function remove(array, callback, thisArg) {\\n\
\\\n\
      var index = -1,\\n\
\\\n\
          length = array ? array.length : 0,\\n\
\\\n\
          result = [];\\n\
\\\n\
\\n\
\\\n\
      callback = lodash.createCallback(callback, thisArg, 3);\\n\
\\\n\
      while (++index < length) {\\n\
\\\n\
        var value = array[index];\\n\
\\\n\
        if (callback(value, index, array)) {\\n\
\\\n\
          result.push(value);\\n\
\\\n\
          splice.call(array, index--, 1);\\n\
\\\n\
          length--;\\n\
\\\n\
        }\\n\
\\\n\
      }\\n\
\\\n\
      return result;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * The opposite of `_.initial` this method gets all but the first element or\\n\
\\\n\
     * first `n` elements of an array. If a callback function is provided elements\\n\
\\\n\
     * at the beginning of the array are excluded from the result as long as the\\n\
\\\n\
     * callback returns truey. The callback is bound to `thisArg` and invoked\\n\
\\\n\
     * with three arguments; (value, index, array).\\n\
\\\n\
     *\\n\
\\\n\
     * If a property name is provided for `callback` the created \\\"_.pluck\\\" style\\n\
\\\n\
     * callback will return the property value of the given element.\\n\
\\\n\
     *\\n\
\\\n\
     * If an object is provided for `callback` the created \\\"_.where\\\" style callback\\n\
\\\n\
     * will return `true` for elements that have the properties of the given object,\\n\
\\\n\
     * else `false`.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @alias drop, tail\\n\
\\\n\
     * @category Arrays\\n\
\\\n\
     * @param {Array} array The array to query.\\n\
\\\n\
     * @param {Function|Object|number|string} [callback=1] The function called\\n\
\\\n\
     *  per element or the number of elements to exclude. If a property name or\\n\
\\\n\
     *  object is provided it will be used to create a \\\"_.pluck\\\" or \\\"_.where\\\"\\n\
\\\n\
     *  style callback, respectively.\\n\
\\\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\\n\
\\\n\
     * @returns {Array} Returns a slice of `array`.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.rest([1, 2, 3]);\\n\
\\\n\
     * // => [2, 3]\\n\
\\\n\
     *\\n\
\\\n\
     * // excludes the first two elements\\n\
\\\n\
     * _.rest([1, 2, 3], 2);\\n\
\\\n\
     * // => [3]\\n\
\\\n\
     *\\n\
\\\n\
     * // excludes elements from the beginning until the callback fails\\n\
\\\n\
     * _.rest([1, 2, 3], function(num) {\\n\
\\\n\
     *   return num < 3;\\n\
\\\n\
     * });\\n\
\\\n\
     * // => [3]\\n\
\\\n\
     *\\n\
\\\n\
     * var characters = [\\n\
\\\n\
     *   { 'name': 'barney',  'blocked': true,  'employer': 'slate' },\\n\
\\\n\
     *   { 'name': 'fred',    'blocked': false,  'employer': 'slate' },\\n\
\\\n\
     *   { 'name': 'pebbles', 'blocked': true, 'employer': 'na' }\\n\
\\\n\
     * ];\\n\
\\\n\
     *\\n\
\\\n\
     * // using \\\"_.pluck\\\" callback shorthand\\n\
\\\n\
     * _.pluck(_.rest(characters, 'blocked'), 'name');\\n\
\\\n\
     * // => ['fred', 'pebbles']\\n\
\\\n\
     *\\n\
\\\n\
     * // using \\\"_.where\\\" callback shorthand\\n\
\\\n\
     * _.rest(characters, { 'employer': 'slate' });\\n\
\\\n\
     * // => [{ 'name': 'pebbles', 'blocked': true, 'employer': 'na' }]\\n\
\\\n\
     */\\n\
\\\n\
    function rest(array, callback, thisArg) {\\n\
\\\n\
      if (typeof callback != 'number' && callback != null) {\\n\
\\\n\
        var n = 0,\\n\
\\\n\
            index = -1,\\n\
\\\n\
            length = array ? array.length : 0;\\n\
\\\n\
\\n\
\\\n\
        callback = lodash.createCallback(callback, thisArg, 3);\\n\
\\\n\
        while (++index < length && callback(array[index], index, array)) {\\n\
\\\n\
          n++;\\n\
\\\n\
        }\\n\
\\\n\
      } else {\\n\
\\\n\
        n = (callback == null || thisArg) ? 1 : nativeMax(0, callback);\\n\
\\\n\
      }\\n\
\\\n\
      return slice(array, n);\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Uses a binary search to determine the smallest index at which a value\\n\
\\\n\
     * should be inserted into a given sorted array in order to maintain the sort\\n\
\\\n\
     * order of the array. If a callback is provided it will be executed for\\n\
\\\n\
     * `value` and each element of `array` to compute their sort ranking. The\\n\
\\\n\
     * callback is bound to `thisArg` and invoked with one argument; (value).\\n\
\\\n\
     *\\n\
\\\n\
     * If a property name is provided for `callback` the created \\\"_.pluck\\\" style\\n\
\\\n\
     * callback will return the property value of the given element.\\n\
\\\n\
     *\\n\
\\\n\
     * If an object is provided for `callback` the created \\\"_.where\\\" style callback\\n\
\\\n\
     * will return `true` for elements that have the properties of the given object,\\n\
\\\n\
     * else `false`.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Arrays\\n\
\\\n\
     * @param {Array} array The array to inspect.\\n\
\\\n\
     * @param {*} value The value to evaluate.\\n\
\\\n\
     * @param {Function|Object|string} [callback=identity] The function called\\n\
\\\n\
     *  per iteration. If a property name or object is provided it will be used\\n\
\\\n\
     *  to create a \\\"_.pluck\\\" or \\\"_.where\\\" style callback, respectively.\\n\
\\\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\\n\
\\\n\
     * @returns {number} Returns the index at which `value` should be inserted\\n\
\\\n\
     *  into `array`.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.sortedIndex([20, 30, 50], 40);\\n\
\\\n\
     * // => 2\\n\
\\\n\
     *\\n\
\\\n\
     * var dict = {\\n\
\\\n\
     *   'wordToNumber': { 'twenty': 20, 'thirty': 30, 'fourty': 40, 'fifty': 50 }\\n\
\\\n\
     * };\\n\
\\\n\
     *\\n\
\\\n\
     * // using `callback`\\n\
\\\n\
     * _.sortedIndex(['twenty', 'thirty', 'fifty'], 'fourty', function(word) {\\n\
\\\n\
     *   return dict.wordToNumber[word];\\n\
\\\n\
     * });\\n\
\\\n\
     * // => 2\\n\
\\\n\
     *\\n\
\\\n\
     * // using `callback` with `thisArg`\\n\
\\\n\
     * _.sortedIndex(['twenty', 'thirty', 'fifty'], 'fourty', function(word) {\\n\
\\\n\
     *   return this.wordToNumber[word];\\n\
\\\n\
     * }, dict);\\n\
\\\n\
     * // => 2\\n\
\\\n\
     *\\n\
\\\n\
     * // using \\\"_.pluck\\\" callback shorthand\\n\
\\\n\
     * _.sortedIndex([{ 'x': 20 }, { 'x': 30 }, { 'x': 50 }], { 'x': 40 }, 'x');\\n\
\\\n\
     * // => 2\\n\
\\\n\
     */\\n\
\\\n\
    function sortedIndex(array, value, callback, thisArg) {\\n\
\\\n\
      var low = 0,\\n\
\\\n\
          high = array ? array.length : low;\\n\
\\\n\
\\n\
\\\n\
      // explicitly reference `identity` for better inlining in Firefox\\n\
\\\n\
      callback = callback ? lodash.createCallback(callback, thisArg, 1) : identity;\\n\
\\\n\
      value = callback(value);\\n\
\\\n\
\\n\
\\\n\
      while (low < high) {\\n\
\\\n\
        var mid = (low + high) >>> 1;\\n\
\\\n\
        (callback(array[mid]) < value)\\n\
\\\n\
          ? low = mid + 1\\n\
\\\n\
          : high = mid;\\n\
\\\n\
      }\\n\
\\\n\
      return low;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Creates an array of unique values, in order, of the provided arrays using\\n\
\\\n\
     * strict equality for comparisons, i.e. `===`.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Arrays\\n\
\\\n\
     * @param {...Array} [array] The arrays to inspect.\\n\
\\\n\
     * @returns {Array} Returns an array of combined values.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.union([1, 2, 3], [5, 2, 1, 4], [2, 1]);\\n\
\\\n\
     * // => [1, 2, 3, 5, 4]\\n\
\\\n\
     */\\n\
\\\n\
    function union() {\\n\
\\\n\
      return baseUniq(baseFlatten(arguments, true, true));\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Creates a duplicate-value-free version of an array using strict equality\\n\
\\\n\
     * for comparisons, i.e. `===`. If the array is sorted, providing\\n\
\\\n\
     * `true` for `isSorted` will use a faster algorithm. If a callback is provided\\n\
\\\n\
     * each element of `array` is passed through the callback before uniqueness\\n\
\\\n\
     * is computed. The callback is bound to `thisArg` and invoked with three\\n\
\\\n\
     * arguments; (value, index, array).\\n\
\\\n\
     *\\n\
\\\n\
     * If a property name is provided for `callback` the created \\\"_.pluck\\\" style\\n\
\\\n\
     * callback will return the property value of the given element.\\n\
\\\n\
     *\\n\
\\\n\
     * If an object is provided for `callback` the created \\\"_.where\\\" style callback\\n\
\\\n\
     * will return `true` for elements that have the properties of the given object,\\n\
\\\n\
     * else `false`.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @alias unique\\n\
\\\n\
     * @category Arrays\\n\
\\\n\
     * @param {Array} array The array to process.\\n\
\\\n\
     * @param {boolean} [isSorted=false] A flag to indicate that `array` is sorted.\\n\
\\\n\
     * @param {Function|Object|string} [callback=identity] The function called\\n\
\\\n\
     *  per iteration. If a property name or object is provided it will be used\\n\
\\\n\
     *  to create a \\\"_.pluck\\\" or \\\"_.where\\\" style callback, respectively.\\n\
\\\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\\n\
\\\n\
     * @returns {Array} Returns a duplicate-value-free array.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.uniq([1, 2, 1, 3, 1]);\\n\
\\\n\
     * // => [1, 2, 3]\\n\
\\\n\
     *\\n\
\\\n\
     * // using `isSorted`\\n\
\\\n\
     * _.uniq([1, 1, 2, 2, 3], true);\\n\
\\\n\
     * // => [1, 2, 3]\\n\
\\\n\
     *\\n\
\\\n\
     * // using `callback`\\n\
\\\n\
     * _.uniq(['A', 'b', 'C', 'a', 'B', 'c'], function(letter) { return letter.toLowerCase(); });\\n\
\\\n\
     * // => ['A', 'b', 'C']\\n\
\\\n\
     *\\n\
\\\n\
     * // using `callback` with `thisArg`\\n\
\\\n\
     * _.uniq([1, 2.5, 3, 1.5, 2, 3.5], function(num) { return this.floor(num); }, Math);\\n\
\\\n\
     * // => [1, 2.5, 3]\\n\
\\\n\
     *\\n\
\\\n\
     * // using \\\"_.pluck\\\" callback shorthand\\n\
\\\n\
     * _.uniq([{ 'x': 1 }, { 'x': 2 }, { 'x': 1 }], 'x');\\n\
\\\n\
     * // => [{ 'x': 1 }, { 'x': 2 }]\\n\
\\\n\
     */\\n\
\\\n\
    function uniq(array, isSorted, callback, thisArg) {\\n\
\\\n\
      // juggle arguments\\n\
\\\n\
      if (typeof isSorted != 'boolean' && isSorted != null) {\\n\
\\\n\
        thisArg = callback;\\n\
\\\n\
        callback = (typeof isSorted != 'function' && thisArg && thisArg[isSorted] === array) ? null : isSorted;\\n\
\\\n\
        isSorted = false;\\n\
\\\n\
      }\\n\
\\\n\
      if (callback != null) {\\n\
\\\n\
        callback = lodash.createCallback(callback, thisArg, 3);\\n\
\\\n\
      }\\n\
\\\n\
      return baseUniq(array, isSorted, callback);\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Creates an array excluding all provided values using strict equality for\\n\
\\\n\
     * comparisons, i.e. `===`.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Arrays\\n\
\\\n\
     * @param {Array} array The array to filter.\\n\
\\\n\
     * @param {...*} [value] The values to exclude.\\n\
\\\n\
     * @returns {Array} Returns a new array of filtered values.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.without([1, 2, 1, 0, 3, 1, 4], 0, 1);\\n\
\\\n\
     * // => [2, 3, 4]\\n\
\\\n\
     */\\n\
\\\n\
    function without(array) {\\n\
\\\n\
      return baseDifference(array, slice(arguments, 1));\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Creates an array that is the symmetric difference of the provided arrays.\\n\
\\\n\
     * See http://en.wikipedia.org/wiki/Symmetric_difference.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Arrays\\n\
\\\n\
     * @param {...Array} [array] The arrays to inspect.\\n\
\\\n\
     * @returns {Array} Returns an array of values.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.xor([1, 2, 3], [5, 2, 1, 4]);\\n\
\\\n\
     * // => [3, 5, 4]\\n\
\\\n\
     *\\n\
\\\n\
     * _.xor([1, 2, 5], [2, 3, 5], [3, 4, 5]);\\n\
\\\n\
     * // => [1, 4, 5]\\n\
\\\n\
     */\\n\
\\\n\
    function xor() {\\n\
\\\n\
      var index = -1,\\n\
\\\n\
          length = arguments.length;\\n\
\\\n\
\\n\
\\\n\
      while (++index < length) {\\n\
\\\n\
        var array = arguments[index];\\n\
\\\n\
        if (isArray(array) || isArguments(array)) {\\n\
\\\n\
          var result = result\\n\
\\\n\
            ? baseUniq(baseDifference(result, array).concat(baseDifference(array, result)))\\n\
\\\n\
            : array;\\n\
\\\n\
        }\\n\
\\\n\
      }\\n\
\\\n\
      return result || [];\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Creates an array of grouped elements, the first of which contains the\\n\
\\\n\
     * first elements of the given arrays, the second of which contains the second\\n\
\\\n\
     * elements of the given arrays, and so on. If a zipped value is provided its\\n\
\\\n\
     * corresponding unzipped value will be returned.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @alias unzip\\n\
\\\n\
     * @category Arrays\\n\
\\\n\
     * @param {...Array} [array] Arrays to process.\\n\
\\\n\
     * @returns {Array} Returns a new array of grouped elements.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.zip(['fred', 'barney'], [30, 40], [true, false]);\\n\
\\\n\
     * // => [['fred', 30, true], ['barney', 40, false]]\\n\
\\\n\
     *\\n\
\\\n\
     * _.unzip([['fred', 30, true], ['barney', 40, false]]);\\n\
\\\n\
     * // => [['fred', 'barney'], [30, 40], [true, false]]\\n\
\\\n\
     */\\n\
\\\n\
    function zip() {\\n\
\\\n\
      var array = arguments.length > 1 ? arguments : arguments[0],\\n\
\\\n\
          index = -1,\\n\
\\\n\
          length = array ? max(pluck(array, 'length')) : 0,\\n\
\\\n\
          result = Array(length < 0 ? 0 : length);\\n\
\\\n\
\\n\
\\\n\
      while (++index < length) {\\n\
\\\n\
        result[index] = pluck(array, index);\\n\
\\\n\
      }\\n\
\\\n\
      return result;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Creates an object composed from arrays of `keys` and `values`. Provide\\n\
\\\n\
     * either a single two dimensional array, i.e. `[[key1, value1], [key2, value2]]`\\n\
\\\n\
     * or two arrays, one of `keys` and one of corresponding `values`.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @alias object\\n\
\\\n\
     * @category Arrays\\n\
\\\n\
     * @param {Array} keys The array of keys.\\n\
\\\n\
     * @param {Array} [values=[]] The array of values.\\n\
\\\n\
     * @returns {Object} Returns an object composed of the given keys and\\n\
\\\n\
     *  corresponding values.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.zipObject(['fred', 'barney'], [30, 40]);\\n\
\\\n\
     * // => { 'fred': 30, 'barney': 40 }\\n\
\\\n\
     */\\n\
\\\n\
    function zipObject(keys, values) {\\n\
\\\n\
      var index = -1,\\n\
\\\n\
          length = keys ? keys.length : 0,\\n\
\\\n\
          result = {};\\n\
\\\n\
\\n\
\\\n\
      if (!values && length && !isArray(keys[0])) {\\n\
\\\n\
        values = [];\\n\
\\\n\
      }\\n\
\\\n\
      while (++index < length) {\\n\
\\\n\
        var key = keys[index];\\n\
\\\n\
        if (values) {\\n\
\\\n\
          result[key] = values[index];\\n\
\\\n\
        } else if (key) {\\n\
\\\n\
          result[key[0]] = key[1];\\n\
\\\n\
        }\\n\
\\\n\
      }\\n\
\\\n\
      return result;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /*--------------------------------------------------------------------------*/\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Creates a function that executes `func`, with  the `this` binding and\\n\
\\\n\
     * arguments of the created function, only after being called `n` times.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Functions\\n\
\\\n\
     * @param {number} n The number of times the function must be called before\\n\
\\\n\
     *  `func` is executed.\\n\
\\\n\
     * @param {Function} func The function to restrict.\\n\
\\\n\
     * @returns {Function} Returns the new restricted function.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * var saves = ['profile', 'settings'];\\n\
\\\n\
     *\\n\
\\\n\
     * var done = _.after(saves.length, function() {\\n\
\\\n\
     *   console.log('Done saving!');\\n\
\\\n\
     * });\\n\
\\\n\
     *\\n\
\\\n\
     * _.forEach(saves, function(type) {\\n\
\\\n\
     *   asyncSave({ 'type': type, 'complete': done });\\n\
\\\n\
     * });\\n\
\\\n\
     * // => logs 'Done saving!', after all saves have completed\\n\
\\\n\
     */\\n\
\\\n\
    function after(n, func) {\\n\
\\\n\
      if (!isFunction(func)) {\\n\
\\\n\
        throw new TypeError;\\n\
\\\n\
      }\\n\
\\\n\
      return function() {\\n\
\\\n\
        if (--n < 1) {\\n\
\\\n\
          return func.apply(this, arguments);\\n\
\\\n\
        }\\n\
\\\n\
      };\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Creates a function that, when called, invokes `func` with the `this`\\n\
\\\n\
     * binding of `thisArg` and prepends any additional `bind` arguments to those\\n\
\\\n\
     * provided to the bound function.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Functions\\n\
\\\n\
     * @param {Function} func The function to bind.\\n\
\\\n\
     * @param {*} [thisArg] The `this` binding of `func`.\\n\
\\\n\
     * @param {...*} [arg] Arguments to be partially applied.\\n\
\\\n\
     * @returns {Function} Returns the new bound function.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * var func = function(greeting) {\\n\
\\\n\
     *   return greeting + ' ' + this.name;\\n\
\\\n\
     * };\\n\
\\\n\
     *\\n\
\\\n\
     * func = _.bind(func, { 'name': 'fred' }, 'hi');\\n\
\\\n\
     * func();\\n\
\\\n\
     * // => 'hi fred'\\n\
\\\n\
     */\\n\
\\\n\
    function bind(func, thisArg) {\\n\
\\\n\
      return arguments.length > 2\\n\
\\\n\
        ? createWrapper(func, 17, slice(arguments, 2), null, thisArg)\\n\
\\\n\
        : createWrapper(func, 1, null, null, thisArg);\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Binds methods of an object to the object itself, overwriting the existing\\n\
\\\n\
     * method. Method names may be specified as individual arguments or as arrays\\n\
\\\n\
     * of method names. If no method names are provided all the function properties\\n\
\\\n\
     * of `object` will be bound.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Functions\\n\
\\\n\
     * @param {Object} object The object to bind and assign the bound methods to.\\n\
\\\n\
     * @param {...string} [methodName] The object method names to\\n\
\\\n\
     *  bind, specified as individual method names or arrays of method names.\\n\
\\\n\
     * @returns {Object} Returns `object`.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * var view = {\\n\
\\\n\
     *   'label': 'docs',\\n\
\\\n\
     *   'onClick': function() { console.log('clicked ' + this.label); }\\n\
\\\n\
     * };\\n\
\\\n\
     *\\n\
\\\n\
     * _.bindAll(view);\\n\
\\\n\
     * jQuery('#docs').on('click', view.onClick);\\n\
\\\n\
     * // => logs 'clicked docs', when the button is clicked\\n\
\\\n\
     */\\n\
\\\n\
    function bindAll(object) {\\n\
\\\n\
      var funcs = arguments.length > 1 ? baseFlatten(arguments, true, false, 1) : functions(object),\\n\
\\\n\
          index = -1,\\n\
\\\n\
          length = funcs.length;\\n\
\\\n\
\\n\
\\\n\
      while (++index < length) {\\n\
\\\n\
        var key = funcs[index];\\n\
\\\n\
        object[key] = createWrapper(object[key], 1, null, null, object);\\n\
\\\n\
      }\\n\
\\\n\
      return object;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Creates a function that, when called, invokes the method at `object[key]`\\n\
\\\n\
     * and prepends any additional `bindKey` arguments to those provided to the bound\\n\
\\\n\
     * function. This method differs from `_.bind` by allowing bound functions to\\n\
\\\n\
     * reference methods that will be redefined or don't yet exist.\\n\
\\\n\
     * See http://michaux.ca/articles/lazy-function-definition-pattern.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Functions\\n\
\\\n\
     * @param {Object} object The object the method belongs to.\\n\
\\\n\
     * @param {string} key The key of the method.\\n\
\\\n\
     * @param {...*} [arg] Arguments to be partially applied.\\n\
\\\n\
     * @returns {Function} Returns the new bound function.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * var object = {\\n\
\\\n\
     *   'name': 'fred',\\n\
\\\n\
     *   'greet': function(greeting) {\\n\
\\\n\
     *     return greeting + ' ' + this.name;\\n\
\\\n\
     *   }\\n\
\\\n\
     * };\\n\
\\\n\
     *\\n\
\\\n\
     * var func = _.bindKey(object, 'greet', 'hi');\\n\
\\\n\
     * func();\\n\
\\\n\
     * // => 'hi fred'\\n\
\\\n\
     *\\n\
\\\n\
     * object.greet = function(greeting) {\\n\
\\\n\
     *   return greeting + 'ya ' + this.name + '!';\\n\
\\\n\
     * };\\n\
\\\n\
     *\\n\
\\\n\
     * func();\\n\
\\\n\
     * // => 'hiya fred!'\\n\
\\\n\
     */\\n\
\\\n\
    function bindKey(object, key) {\\n\
\\\n\
      return arguments.length > 2\\n\
\\\n\
        ? createWrapper(key, 19, slice(arguments, 2), null, object)\\n\
\\\n\
        : createWrapper(key, 3, null, null, object);\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Creates a function that is the composition of the provided functions,\\n\
\\\n\
     * where each function consumes the return value of the function that follows.\\n\
\\\n\
     * For example, composing the functions `f()`, `g()`, and `h()` produces `f(g(h()))`.\\n\
\\\n\
     * Each function is executed with the `this` binding of the composed function.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Functions\\n\
\\\n\
     * @param {...Function} [func] Functions to compose.\\n\
\\\n\
     * @returns {Function} Returns the new composed function.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * var realNameMap = {\\n\
\\\n\
     *   'pebbles': 'penelope'\\n\
\\\n\
     * };\\n\
\\\n\
     *\\n\
\\\n\
     * var format = function(name) {\\n\
\\\n\
     *   name = realNameMap[name.toLowerCase()] || name;\\n\
\\\n\
     *   return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();\\n\
\\\n\
     * };\\n\
\\\n\
     *\\n\
\\\n\
     * var greet = function(formatted) {\\n\
\\\n\
     *   return 'Hiya ' + formatted + '!';\\n\
\\\n\
     * };\\n\
\\\n\
     *\\n\
\\\n\
     * var welcome = _.compose(greet, format);\\n\
\\\n\
     * welcome('pebbles');\\n\
\\\n\
     * // => 'Hiya Penelope!'\\n\
\\\n\
     */\\n\
\\\n\
    function compose() {\\n\
\\\n\
      var funcs = arguments,\\n\
\\\n\
          length = funcs.length;\\n\
\\\n\
\\n\
\\\n\
      while (length--) {\\n\
\\\n\
        if (!isFunction(funcs[length])) {\\n\
\\\n\
          throw new TypeError;\\n\
\\\n\
        }\\n\
\\\n\
      }\\n\
\\\n\
      return function() {\\n\
\\\n\
        var args = arguments,\\n\
\\\n\
            length = funcs.length;\\n\
\\\n\
\\n\
\\\n\
        while (length--) {\\n\
\\\n\
          args = [funcs[length].apply(this, args)];\\n\
\\\n\
        }\\n\
\\\n\
        return args[0];\\n\
\\\n\
      };\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Creates a function which accepts one or more arguments of `func` that when\\n\
\\\n\
     * invoked either executes `func` returning its result, if all `func` arguments\\n\
\\\n\
     * have been provided, or returns a function that accepts one or more of the\\n\
\\\n\
     * remaining `func` arguments, and so on. The arity of `func` can be specified\\n\
\\\n\
     * if `func.length` is not sufficient.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Functions\\n\
\\\n\
     * @param {Function} func The function to curry.\\n\
\\\n\
     * @param {number} [arity=func.length] The arity of `func`.\\n\
\\\n\
     * @returns {Function} Returns the new curried function.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * var curried = _.curry(function(a, b, c) {\\n\
\\\n\
     *   console.log(a + b + c);\\n\
\\\n\
     * });\\n\
\\\n\
     *\\n\
\\\n\
     * curried(1)(2)(3);\\n\
\\\n\
     * // => 6\\n\
\\\n\
     *\\n\
\\\n\
     * curried(1, 2)(3);\\n\
\\\n\
     * // => 6\\n\
\\\n\
     *\\n\
\\\n\
     * curried(1, 2, 3);\\n\
\\\n\
     * // => 6\\n\
\\\n\
     */\\n\
\\\n\
    function curry(func, arity) {\\n\
\\\n\
      arity = typeof arity == 'number' ? arity : (+arity || func.length);\\n\
\\\n\
      return createWrapper(func, 4, null, null, null, arity);\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Creates a function that will delay the execution of `func` until after\\n\
\\\n\
     * `wait` milliseconds have elapsed since the last time it was invoked.\\n\
\\\n\
     * Provide an options object to indicate that `func` should be invoked on\\n\
\\\n\
     * the leading and/or trailing edge of the `wait` timeout. Subsequent calls\\n\
\\\n\
     * to the debounced function will return the result of the last `func` call.\\n\
\\\n\
     *\\n\
\\\n\
     * Note: If `leading` and `trailing` options are `true` `func` will be called\\n\
\\\n\
     * on the trailing edge of the timeout only if the the debounced function is\\n\
\\\n\
     * invoked more than once during the `wait` timeout.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Functions\\n\
\\\n\
     * @param {Function} func The function to debounce.\\n\
\\\n\
     * @param {number} wait The number of milliseconds to delay.\\n\
\\\n\
     * @param {Object} [options] The options object.\\n\
\\\n\
     * @param {boolean} [options.leading=false] Specify execution on the leading edge of the timeout.\\n\
\\\n\
     * @param {number} [options.maxWait] The maximum time `func` is allowed to be delayed before it's called.\\n\
\\\n\
     * @param {boolean} [options.trailing=true] Specify execution on the trailing edge of the timeout.\\n\
\\\n\
     * @returns {Function} Returns the new debounced function.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * // avoid costly calculations while the window size is in flux\\n\
\\\n\
     * var lazyLayout = _.debounce(calculateLayout, 150);\\n\
\\\n\
     * jQuery(window).on('resize', lazyLayout);\\n\
\\\n\
     *\\n\
\\\n\
     * // execute `sendMail` when the click event is fired, debouncing subsequent calls\\n\
\\\n\
     * jQuery('#postbox').on('click', _.debounce(sendMail, 300, {\\n\
\\\n\
     *   'leading': true,\\n\
\\\n\
     *   'trailing': false\\n\
\\\n\
     * });\\n\
\\\n\
     *\\n\
\\\n\
     * // ensure `batchLog` is executed once after 1 second of debounced calls\\n\
\\\n\
     * var source = new EventSource('/stream');\\n\
\\\n\
     * source.addEventListener('message', _.debounce(batchLog, 250, {\\n\
\\\n\
     *   'maxWait': 1000\\n\
\\\n\
     * }, false);\\n\
\\\n\
     */\\n\
\\\n\
    function debounce(func, wait, options) {\\n\
\\\n\
      var args,\\n\
\\\n\
          maxTimeoutId,\\n\
\\\n\
          result,\\n\
\\\n\
          stamp,\\n\
\\\n\
          thisArg,\\n\
\\\n\
          timeoutId,\\n\
\\\n\
          trailingCall,\\n\
\\\n\
          lastCalled = 0,\\n\
\\\n\
          maxWait = false,\\n\
\\\n\
          trailing = true;\\n\
\\\n\
\\n\
\\\n\
      if (!isFunction(func)) {\\n\
\\\n\
        throw new TypeError;\\n\
\\\n\
      }\\n\
\\\n\
      wait = nativeMax(0, wait) || 0;\\n\
\\\n\
      if (options === true) {\\n\
\\\n\
        var leading = true;\\n\
\\\n\
        trailing = false;\\n\
\\\n\
      } else if (isObject(options)) {\\n\
\\\n\
        leading = options.leading;\\n\
\\\n\
        maxWait = 'maxWait' in options && (nativeMax(wait, options.maxWait) || 0);\\n\
\\\n\
        trailing = 'trailing' in options ? options.trailing : trailing;\\n\
\\\n\
      }\\n\
\\\n\
      var delayed = function() {\\n\
\\\n\
        var remaining = wait - (now() - stamp);\\n\
\\\n\
        if (remaining <= 0) {\\n\
\\\n\
          if (maxTimeoutId) {\\n\
\\\n\
            clearTimeout(maxTimeoutId);\\n\
\\\n\
          }\\n\
\\\n\
          var isCalled = trailingCall;\\n\
\\\n\
          maxTimeoutId = timeoutId = trailingCall = undefined;\\n\
\\\n\
          if (isCalled) {\\n\
\\\n\
            lastCalled = now();\\n\
\\\n\
            result = func.apply(thisArg, args);\\n\
\\\n\
            if (!timeoutId && !maxTimeoutId) {\\n\
\\\n\
              args = thisArg = null;\\n\
\\\n\
            }\\n\
\\\n\
          }\\n\
\\\n\
        } else {\\n\
\\\n\
          timeoutId = setTimeout(delayed, remaining);\\n\
\\\n\
        }\\n\
\\\n\
      };\\n\
\\\n\
\\n\
\\\n\
      var maxDelayed = function() {\\n\
\\\n\
        if (timeoutId) {\\n\
\\\n\
          clearTimeout(timeoutId);\\n\
\\\n\
        }\\n\
\\\n\
        maxTimeoutId = timeoutId = trailingCall = undefined;\\n\
\\\n\
        if (trailing || (maxWait !== wait)) {\\n\
\\\n\
          lastCalled = now();\\n\
\\\n\
          result = func.apply(thisArg, args);\\n\
\\\n\
          if (!timeoutId && !maxTimeoutId) {\\n\
\\\n\
            args = thisArg = null;\\n\
\\\n\
          }\\n\
\\\n\
        }\\n\
\\\n\
      };\\n\
\\\n\
\\n\
\\\n\
      return function() {\\n\
\\\n\
        args = arguments;\\n\
\\\n\
        stamp = now();\\n\
\\\n\
        thisArg = this;\\n\
\\\n\
        trailingCall = trailing && (timeoutId || !leading);\\n\
\\\n\
\\n\
\\\n\
        if (maxWait === false) {\\n\
\\\n\
          var leadingCall = leading && !timeoutId;\\n\
\\\n\
        } else {\\n\
\\\n\
          if (!maxTimeoutId && !leading) {\\n\
\\\n\
            lastCalled = stamp;\\n\
\\\n\
          }\\n\
\\\n\
          var remaining = maxWait - (stamp - lastCalled),\\n\
\\\n\
              isCalled = remaining <= 0;\\n\
\\\n\
\\n\
\\\n\
          if (isCalled) {\\n\
\\\n\
            if (maxTimeoutId) {\\n\
\\\n\
              maxTimeoutId = clearTimeout(maxTimeoutId);\\n\
\\\n\
            }\\n\
\\\n\
            lastCalled = stamp;\\n\
\\\n\
            result = func.apply(thisArg, args);\\n\
\\\n\
          }\\n\
\\\n\
          else if (!maxTimeoutId) {\\n\
\\\n\
            maxTimeoutId = setTimeout(maxDelayed, remaining);\\n\
\\\n\
          }\\n\
\\\n\
        }\\n\
\\\n\
        if (isCalled && timeoutId) {\\n\
\\\n\
          timeoutId = clearTimeout(timeoutId);\\n\
\\\n\
        }\\n\
\\\n\
        else if (!timeoutId && wait !== maxWait) {\\n\
\\\n\
          timeoutId = setTimeout(delayed, wait);\\n\
\\\n\
        }\\n\
\\\n\
        if (leadingCall) {\\n\
\\\n\
          isCalled = true;\\n\
\\\n\
          result = func.apply(thisArg, args);\\n\
\\\n\
        }\\n\
\\\n\
        if (isCalled && !timeoutId && !maxTimeoutId) {\\n\
\\\n\
          args = thisArg = null;\\n\
\\\n\
        }\\n\
\\\n\
        return result;\\n\
\\\n\
      };\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Defers executing the `func` function until the current call stack has cleared.\\n\
\\\n\
     * Additional arguments will be provided to `func` when it is invoked.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Functions\\n\
\\\n\
     * @param {Function} func The function to defer.\\n\
\\\n\
     * @param {...*} [arg] Arguments to invoke the function with.\\n\
\\\n\
     * @returns {number} Returns the timer id.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.defer(function(text) { console.log(text); }, 'deferred');\\n\
\\\n\
     * // logs 'deferred' after one or more milliseconds\\n\
\\\n\
     */\\n\
\\\n\
    function defer(func) {\\n\
\\\n\
      if (!isFunction(func)) {\\n\
\\\n\
        throw new TypeError;\\n\
\\\n\
      }\\n\
\\\n\
      var args = slice(arguments, 1);\\n\
\\\n\
      return setTimeout(function() { func.apply(undefined, args); }, 1);\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Executes the `func` function after `wait` milliseconds. Additional arguments\\n\
\\\n\
     * will be provided to `func` when it is invoked.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Functions\\n\
\\\n\
     * @param {Function} func The function to delay.\\n\
\\\n\
     * @param {number} wait The number of milliseconds to delay execution.\\n\
\\\n\
     * @param {...*} [arg] Arguments to invoke the function with.\\n\
\\\n\
     * @returns {number} Returns the timer id.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.delay(function(text) { console.log(text); }, 1000, 'later');\\n\
\\\n\
     * // => logs 'later' after one second\\n\
\\\n\
     */\\n\
\\\n\
    function delay(func, wait) {\\n\
\\\n\
      if (!isFunction(func)) {\\n\
\\\n\
        throw new TypeError;\\n\
\\\n\
      }\\n\
\\\n\
      var args = slice(arguments, 2);\\n\
\\\n\
      return setTimeout(function() { func.apply(undefined, args); }, wait);\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Creates a function that memoizes the result of `func`. If `resolver` is\\n\
\\\n\
     * provided it will be used to determine the cache key for storing the result\\n\
\\\n\
     * based on the arguments provided to the memoized function. By default, the\\n\
\\\n\
     * first argument provided to the memoized function is used as the cache key.\\n\
\\\n\
     * The `func` is executed with the `this` binding of the memoized function.\\n\
\\\n\
     * The result cache is exposed as the `cache` property on the memoized function.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Functions\\n\
\\\n\
     * @param {Function} func The function to have its output memoized.\\n\
\\\n\
     * @param {Function} [resolver] A function used to resolve the cache key.\\n\
\\\n\
     * @returns {Function} Returns the new memoizing function.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * var fibonacci = _.memoize(function(n) {\\n\
\\\n\
     *   return n < 2 ? n : fibonacci(n - 1) + fibonacci(n - 2);\\n\
\\\n\
     * });\\n\
\\\n\
     *\\n\
\\\n\
     * fibonacci(9)\\n\
\\\n\
     * // => 34\\n\
\\\n\
     *\\n\
\\\n\
     * var data = {\\n\
\\\n\
     *   'fred': { 'name': 'fred', 'age': 40 },\\n\
\\\n\
     *   'pebbles': { 'name': 'pebbles', 'age': 1 }\\n\
\\\n\
     * };\\n\
\\\n\
     *\\n\
\\\n\
     * // modifying the result cache\\n\
\\\n\
     * var get = _.memoize(function(name) { return data[name]; }, _.identity);\\n\
\\\n\
     * get('pebbles');\\n\
\\\n\
     * // => { 'name': 'pebbles', 'age': 1 }\\n\
\\\n\
     *\\n\
\\\n\
     * get.cache.pebbles.name = 'penelope';\\n\
\\\n\
     * get('pebbles');\\n\
\\\n\
     * // => { 'name': 'penelope', 'age': 1 }\\n\
\\\n\
     */\\n\
\\\n\
    function memoize(func, resolver) {\\n\
\\\n\
      if (!isFunction(func)) {\\n\
\\\n\
        throw new TypeError;\\n\
\\\n\
      }\\n\
\\\n\
      var memoized = function() {\\n\
\\\n\
        var cache = memoized.cache,\\n\
\\\n\
            key = resolver ? resolver.apply(this, arguments) : keyPrefix + arguments[0];\\n\
\\\n\
\\n\
\\\n\
        return hasOwnProperty.call(cache, key)\\n\
\\\n\
          ? cache[key]\\n\
\\\n\
          : (cache[key] = func.apply(this, arguments));\\n\
\\\n\
      }\\n\
\\\n\
      memoized.cache = {};\\n\
\\\n\
      return memoized;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Creates a function that is restricted to execute `func` once. Repeat calls to\\n\
\\\n\
     * the function will return the value of the first call. The `func` is executed\\n\
\\\n\
     * with the `this` binding of the created function.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Functions\\n\
\\\n\
     * @param {Function} func The function to restrict.\\n\
\\\n\
     * @returns {Function} Returns the new restricted function.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * var initialize = _.once(createApplication);\\n\
\\\n\
     * initialize();\\n\
\\\n\
     * initialize();\\n\
\\\n\
     * // `initialize` executes `createApplication` once\\n\
\\\n\
     */\\n\
\\\n\
    function once(func) {\\n\
\\\n\
      var ran,\\n\
\\\n\
          result;\\n\
\\\n\
\\n\
\\\n\
      if (!isFunction(func)) {\\n\
\\\n\
        throw new TypeError;\\n\
\\\n\
      }\\n\
\\\n\
      return function() {\\n\
\\\n\
        if (ran) {\\n\
\\\n\
          return result;\\n\
\\\n\
        }\\n\
\\\n\
        ran = true;\\n\
\\\n\
        result = func.apply(this, arguments);\\n\
\\\n\
\\n\
\\\n\
        // clear the `func` variable so the function may be garbage collected\\n\
\\\n\
        func = null;\\n\
\\\n\
        return result;\\n\
\\\n\
      };\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Creates a function that, when called, invokes `func` with any additional\\n\
\\\n\
     * `partial` arguments prepended to those provided to the new function. This\\n\
\\\n\
     * method is similar to `_.bind` except it does **not** alter the `this` binding.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Functions\\n\
\\\n\
     * @param {Function} func The function to partially apply arguments to.\\n\
\\\n\
     * @param {...*} [arg] Arguments to be partially applied.\\n\
\\\n\
     * @returns {Function} Returns the new partially applied function.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * var greet = function(greeting, name) { return greeting + ' ' + name; };\\n\
\\\n\
     * var hi = _.partial(greet, 'hi');\\n\
\\\n\
     * hi('fred');\\n\
\\\n\
     * // => 'hi fred'\\n\
\\\n\
     */\\n\
\\\n\
    function partial(func) {\\n\
\\\n\
      return createWrapper(func, 16, slice(arguments, 1));\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * This method is like `_.partial` except that `partial` arguments are\\n\
\\\n\
     * appended to those provided to the new function.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Functions\\n\
\\\n\
     * @param {Function} func The function to partially apply arguments to.\\n\
\\\n\
     * @param {...*} [arg] Arguments to be partially applied.\\n\
\\\n\
     * @returns {Function} Returns the new partially applied function.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * var defaultsDeep = _.partialRight(_.merge, _.defaults);\\n\
\\\n\
     *\\n\
\\\n\
     * var options = {\\n\
\\\n\
     *   'variable': 'data',\\n\
\\\n\
     *   'imports': { 'jq': $ }\\n\
\\\n\
     * };\\n\
\\\n\
     *\\n\
\\\n\
     * defaultsDeep(options, _.templateSettings);\\n\
\\\n\
     *\\n\
\\\n\
     * options.variable\\n\
\\\n\
     * // => 'data'\\n\
\\\n\
     *\\n\
\\\n\
     * options.imports\\n\
\\\n\
     * // => { '_': _, 'jq': $ }\\n\
\\\n\
     */\\n\
\\\n\
    function partialRight(func) {\\n\
\\\n\
      return createWrapper(func, 32, null, slice(arguments, 1));\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Creates a function that, when executed, will only call the `func` function\\n\
\\\n\
     * at most once per every `wait` milliseconds. Provide an options object to\\n\
\\\n\
     * indicate that `func` should be invoked on the leading and/or trailing edge\\n\
\\\n\
     * of the `wait` timeout. Subsequent calls to the throttled function will\\n\
\\\n\
     * return the result of the last `func` call.\\n\
\\\n\
     *\\n\
\\\n\
     * Note: If `leading` and `trailing` options are `true` `func` will be called\\n\
\\\n\
     * on the trailing edge of the timeout only if the the throttled function is\\n\
\\\n\
     * invoked more than once during the `wait` timeout.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Functions\\n\
\\\n\
     * @param {Function} func The function to throttle.\\n\
\\\n\
     * @param {number} wait The number of milliseconds to throttle executions to.\\n\
\\\n\
     * @param {Object} [options] The options object.\\n\
\\\n\
     * @param {boolean} [options.leading=true] Specify execution on the leading edge of the timeout.\\n\
\\\n\
     * @param {boolean} [options.trailing=true] Specify execution on the trailing edge of the timeout.\\n\
\\\n\
     * @returns {Function} Returns the new throttled function.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * // avoid excessively updating the position while scrolling\\n\
\\\n\
     * var throttled = _.throttle(updatePosition, 100);\\n\
\\\n\
     * jQuery(window).on('scroll', throttled);\\n\
\\\n\
     *\\n\
\\\n\
     * // execute `renewToken` when the click event is fired, but not more than once every 5 minutes\\n\
\\\n\
     * jQuery('.interactive').on('click', _.throttle(renewToken, 300000, {\\n\
\\\n\
     *   'trailing': false\\n\
\\\n\
     * }));\\n\
\\\n\
     */\\n\
\\\n\
    function throttle(func, wait, options) {\\n\
\\\n\
      var leading = true,\\n\
\\\n\
          trailing = true;\\n\
\\\n\
\\n\
\\\n\
      if (!isFunction(func)) {\\n\
\\\n\
        throw new TypeError;\\n\
\\\n\
      }\\n\
\\\n\
      if (options === false) {\\n\
\\\n\
        leading = false;\\n\
\\\n\
      } else if (isObject(options)) {\\n\
\\\n\
        leading = 'leading' in options ? options.leading : leading;\\n\
\\\n\
        trailing = 'trailing' in options ? options.trailing : trailing;\\n\
\\\n\
      }\\n\
\\\n\
      debounceOptions.leading = leading;\\n\
\\\n\
      debounceOptions.maxWait = wait;\\n\
\\\n\
      debounceOptions.trailing = trailing;\\n\
\\\n\
\\n\
\\\n\
      return debounce(func, wait, debounceOptions);\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Creates a function that provides `value` to the wrapper function as its\\n\
\\\n\
     * first argument. Additional arguments provided to the function are appended\\n\
\\\n\
     * to those provided to the wrapper function. The wrapper is executed with\\n\
\\\n\
     * the `this` binding of the created function.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Functions\\n\
\\\n\
     * @param {*} value The value to wrap.\\n\
\\\n\
     * @param {Function} wrapper The wrapper function.\\n\
\\\n\
     * @returns {Function} Returns the new function.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * var p = _.wrap(_.escape, function(func, text) {\\n\
\\\n\
     *   return '<p>' + func(text) + '</p>';\\n\
\\\n\
     * });\\n\
\\\n\
     *\\n\
\\\n\
     * p('Fred, Wilma, & Pebbles');\\n\
\\\n\
     * // => '<p>Fred, Wilma, &amp; Pebbles</p>'\\n\
\\\n\
     */\\n\
\\\n\
    function wrap(value, wrapper) {\\n\
\\\n\
      return createWrapper(wrapper, 16, [value]);\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /*--------------------------------------------------------------------------*/\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Creates a function that returns `value`.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Utilities\\n\
\\\n\
     * @param {*} value The value to return from the new function.\\n\
\\\n\
     * @returns {Function} Returns the new function.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * var object = { 'name': 'fred' };\\n\
\\\n\
     * var getter = _.constant(object);\\n\
\\\n\
     * getter() === object;\\n\
\\\n\
     * // => true\\n\
\\\n\
     */\\n\
\\\n\
    function constant(value) {\\n\
\\\n\
      return function() {\\n\
\\\n\
        return value;\\n\
\\\n\
      };\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Produces a callback bound to an optional `thisArg`. If `func` is a property\\n\
\\\n\
     * name the created callback will return the property value for a given element.\\n\
\\\n\
     * If `func` is an object the created callback will return `true` for elements\\n\
\\\n\
     * that contain the equivalent object properties, otherwise it will return `false`.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Utilities\\n\
\\\n\
     * @param {*} [func=identity] The value to convert to a callback.\\n\
\\\n\
     * @param {*} [thisArg] The `this` binding of the created callback.\\n\
\\\n\
     * @param {number} [argCount] The number of arguments the callback accepts.\\n\
\\\n\
     * @returns {Function} Returns a callback function.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * var characters = [\\n\
\\\n\
     *   { 'name': 'barney', 'age': 36 },\\n\
\\\n\
     *   { 'name': 'fred',   'age': 40 }\\n\
\\\n\
     * ];\\n\
\\\n\
     *\\n\
\\\n\
     * // wrap to create custom callback shorthands\\n\
\\\n\
     * _.createCallback = _.wrap(_.createCallback, function(func, callback, thisArg) {\\n\
\\\n\
     *   var match = /^(.+?)__([gl]t)(.+)$/.exec(callback);\\n\
\\\n\
     *   return !match ? func(callback, thisArg) : function(object) {\\n\
\\\n\
     *     return match[2] == 'gt' ? object[match[1]] > match[3] : object[match[1]] < match[3];\\n\
\\\n\
     *   };\\n\
\\\n\
     * });\\n\
\\\n\
     *\\n\
\\\n\
     * _.filter(characters, 'age__gt38');\\n\
\\\n\
     * // => [{ 'name': 'fred', 'age': 40 }]\\n\
\\\n\
     */\\n\
\\\n\
    function createCallback(func, thisArg, argCount) {\\n\
\\\n\
      var type = typeof func;\\n\
\\\n\
      if (func == null || type == 'function') {\\n\
\\\n\
        return baseCreateCallback(func, thisArg, argCount);\\n\
\\\n\
      }\\n\
\\\n\
      // handle \\\"_.pluck\\\" style callback shorthands\\n\
\\\n\
      if (type != 'object') {\\n\
\\\n\
        return property(func);\\n\
\\\n\
      }\\n\
\\\n\
      var props = keys(func),\\n\
\\\n\
          key = props[0],\\n\
\\\n\
          a = func[key];\\n\
\\\n\
\\n\
\\\n\
      // handle \\\"_.where\\\" style callback shorthands\\n\
\\\n\
      if (props.length == 1 && a === a && !isObject(a)) {\\n\
\\\n\
        // fast path the common case of providing an object with a single\\n\
\\\n\
        // property containing a primitive value\\n\
\\\n\
        return function(object) {\\n\
\\\n\
          var b = object[key];\\n\
\\\n\
          return a === b && (a !== 0 || (1 / a == 1 / b));\\n\
\\\n\
        };\\n\
\\\n\
      }\\n\
\\\n\
      return function(object) {\\n\
\\\n\
        var length = props.length,\\n\
\\\n\
            result = false;\\n\
\\\n\
\\n\
\\\n\
        while (length--) {\\n\
\\\n\
          if (!(result = baseIsEqual(object[props[length]], func[props[length]], null, true))) {\\n\
\\\n\
            break;\\n\
\\\n\
          }\\n\
\\\n\
        }\\n\
\\\n\
        return result;\\n\
\\\n\
      };\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Converts the characters `&`, `<`, `>`, `\\\"`, and `'` in `string` to their\\n\
\\\n\
     * corresponding HTML entities.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Utilities\\n\
\\\n\
     * @param {string} string The string to escape.\\n\
\\\n\
     * @returns {string} Returns the escaped string.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.escape('Fred, Wilma, & Pebbles');\\n\
\\\n\
     * // => 'Fred, Wilma, &amp; Pebbles'\\n\
\\\n\
     */\\n\
\\\n\
    function escape(string) {\\n\
\\\n\
      return string == null ? '' : String(string).replace(reUnescapedHtml, escapeHtmlChar);\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * This method returns the first argument provided to it.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Utilities\\n\
\\\n\
     * @param {*} value Any value.\\n\
\\\n\
     * @returns {*} Returns `value`.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * var object = { 'name': 'fred' };\\n\
\\\n\
     * _.identity(object) === object;\\n\
\\\n\
     * // => true\\n\
\\\n\
     */\\n\
\\\n\
    function identity(value) {\\n\
\\\n\
      return value;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Adds function properties of a source object to the destination object.\\n\
\\\n\
     * If `object` is a function methods will be added to its prototype as well.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Utilities\\n\
\\\n\
     * @param {Function|Object} [object=lodash] object The destination object.\\n\
\\\n\
     * @param {Object} source The object of functions to add.\\n\
\\\n\
     * @param {Object} [options] The options object.\\n\
\\\n\
     * @param {boolean} [options.chain=true] Specify whether the functions added are chainable.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * function capitalize(string) {\\n\
\\\n\
     *   return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();\\n\
\\\n\
     * }\\n\
\\\n\
     *\\n\
\\\n\
     * _.mixin({ 'capitalize': capitalize });\\n\
\\\n\
     * _.capitalize('fred');\\n\
\\\n\
     * // => 'Fred'\\n\
\\\n\
     *\\n\
\\\n\
     * _('fred').capitalize().value();\\n\
\\\n\
     * // => 'Fred'\\n\
\\\n\
     *\\n\
\\\n\
     * _.mixin({ 'capitalize': capitalize }, { 'chain': false });\\n\
\\\n\
     * _('fred').capitalize();\\n\
\\\n\
     * // => 'Fred'\\n\
\\\n\
     */\\n\
\\\n\
    function mixin(object, source, options) {\\n\
\\\n\
      var chain = true,\\n\
\\\n\
          methodNames = source && functions(source);\\n\
\\\n\
\\n\
\\\n\
      if (!source || (!options && !methodNames.length)) {\\n\
\\\n\
        if (options == null) {\\n\
\\\n\
          options = source;\\n\
\\\n\
        }\\n\
\\\n\
        ctor = lodashWrapper;\\n\
\\\n\
        source = object;\\n\
\\\n\
        object = lodash;\\n\
\\\n\
        methodNames = functions(source);\\n\
\\\n\
      }\\n\
\\\n\
      if (options === false) {\\n\
\\\n\
        chain = false;\\n\
\\\n\
      } else if (isObject(options) && 'chain' in options) {\\n\
\\\n\
        chain = options.chain;\\n\
\\\n\
      }\\n\
\\\n\
      var ctor = object,\\n\
\\\n\
          isFunc = isFunction(ctor);\\n\
\\\n\
\\n\
\\\n\
      forEach(methodNames, function(methodName) {\\n\
\\\n\
        var func = object[methodName] = source[methodName];\\n\
\\\n\
        if (isFunc) {\\n\
\\\n\
          ctor.prototype[methodName] = function() {\\n\
\\\n\
            var chainAll = this.__chain__,\\n\
\\\n\
                value = this.__wrapped__,\\n\
\\\n\
                args = [value];\\n\
\\\n\
\\n\
\\\n\
            push.apply(args, arguments);\\n\
\\\n\
            var result = func.apply(object, args);\\n\
\\\n\
            if (chain || chainAll) {\\n\
\\\n\
              if (value === result && isObject(result)) {\\n\
\\\n\
                return this;\\n\
\\\n\
              }\\n\
\\\n\
              result = new ctor(result);\\n\
\\\n\
              result.__chain__ = chainAll;\\n\
\\\n\
            }\\n\
\\\n\
            return result;\\n\
\\\n\
          };\\n\
\\\n\
        }\\n\
\\\n\
      });\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Reverts the '_' variable to its previous value and returns a reference to\\n\
\\\n\
     * the `lodash` function.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Utilities\\n\
\\\n\
     * @returns {Function} Returns the `lodash` function.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * var lodash = _.noConflict();\\n\
\\\n\
     */\\n\
\\\n\
    function noConflict() {\\n\
\\\n\
      context._ = oldDash;\\n\
\\\n\
      return this;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * A no-operation function.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Utilities\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * var object = { 'name': 'fred' };\\n\
\\\n\
     * _.noop(object) === undefined;\\n\
\\\n\
     * // => true\\n\
\\\n\
     */\\n\
\\\n\
    function noop() {\\n\
\\\n\
      // no operation performed\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Gets the number of milliseconds that have elapsed since the Unix epoch\\n\
\\\n\
     * (1 January 1970 00:00:00 UTC).\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Utilities\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * var stamp = _.now();\\n\
\\\n\
     * _.defer(function() { console.log(_.now() - stamp); });\\n\
\\\n\
     * // => logs the number of milliseconds it took for the deferred function to be called\\n\
\\\n\
     */\\n\
\\\n\
    var now = isNative(now = Date.now) && now || function() {\\n\
\\\n\
      return new Date().getTime();\\n\
\\\n\
    };\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Converts the given value into an integer of the specified radix.\\n\
\\\n\
     * If `radix` is `undefined` or `0` a `radix` of `10` is used unless the\\n\
\\\n\
     * `value` is a hexadecimal, in which case a `radix` of `16` is used.\\n\
\\\n\
     *\\n\
\\\n\
     * Note: This method avoids differences in native ES3 and ES5 `parseInt`\\n\
\\\n\
     * implementations. See http://es5.github.io/#E.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Utilities\\n\
\\\n\
     * @param {string} value The value to parse.\\n\
\\\n\
     * @param {number} [radix] The radix used to interpret the value to parse.\\n\
\\\n\
     * @returns {number} Returns the new integer value.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.parseInt('08');\\n\
\\\n\
     * // => 8\\n\
\\\n\
     */\\n\
\\\n\
    var parseInt = nativeParseInt(whitespace + '08') == 8 ? nativeParseInt : function(value, radix) {\\n\
\\\n\
      // Firefox < 21 and Opera < 15 follow the ES3 specified implementation of `parseInt`\\n\
\\\n\
      return nativeParseInt(isString(value) ? value.replace(reLeadingSpacesAndZeros, '') : value, radix || 0);\\n\
\\\n\
    };\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Creates a \\\"_.pluck\\\" style function, which returns the `key` value of a\\n\
\\\n\
     * given object.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Utilities\\n\
\\\n\
     * @param {string} key The name of the property to retrieve.\\n\
\\\n\
     * @returns {Function} Returns the new function.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * var characters = [\\n\
\\\n\
     *   { 'name': 'fred',   'age': 40 },\\n\
\\\n\
     *   { 'name': 'barney', 'age': 36 }\\n\
\\\n\
     * ];\\n\
\\\n\
     *\\n\
\\\n\
     * var getName = _.property('name');\\n\
\\\n\
     *\\n\
\\\n\
     * _.map(characters, getName);\\n\
\\\n\
     * // => ['barney', 'fred']\\n\
\\\n\
     *\\n\
\\\n\
     * _.sortBy(characters, getName);\\n\
\\\n\
     * // => [{ 'name': 'barney', 'age': 36 }, { 'name': 'fred',   'age': 40 }]\\n\
\\\n\
     */\\n\
\\\n\
    function property(key) {\\n\
\\\n\
      return function(object) {\\n\
\\\n\
        return object[key];\\n\
\\\n\
      };\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Produces a random number between `min` and `max` (inclusive). If only one\\n\
\\\n\
     * argument is provided a number between `0` and the given number will be\\n\
\\\n\
     * returned. If `floating` is truey or either `min` or `max` are floats a\\n\
\\\n\
     * floating-point number will be returned instead of an integer.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Utilities\\n\
\\\n\
     * @param {number} [min=0] The minimum possible value.\\n\
\\\n\
     * @param {number} [max=1] The maximum possible value.\\n\
\\\n\
     * @param {boolean} [floating=false] Specify returning a floating-point number.\\n\
\\\n\
     * @returns {number} Returns a random number.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.random(0, 5);\\n\
\\\n\
     * // => an integer between 0 and 5\\n\
\\\n\
     *\\n\
\\\n\
     * _.random(5);\\n\
\\\n\
     * // => also an integer between 0 and 5\\n\
\\\n\
     *\\n\
\\\n\
     * _.random(5, true);\\n\
\\\n\
     * // => a floating-point number between 0 and 5\\n\
\\\n\
     *\\n\
\\\n\
     * _.random(1.2, 5.2);\\n\
\\\n\
     * // => a floating-point number between 1.2 and 5.2\\n\
\\\n\
     */\\n\
\\\n\
    function random(min, max, floating) {\\n\
\\\n\
      var noMin = min == null,\\n\
\\\n\
          noMax = max == null;\\n\
\\\n\
\\n\
\\\n\
      if (floating == null) {\\n\
\\\n\
        if (typeof min == 'boolean' && noMax) {\\n\
\\\n\
          floating = min;\\n\
\\\n\
          min = 1;\\n\
\\\n\
        }\\n\
\\\n\
        else if (!noMax && typeof max == 'boolean') {\\n\
\\\n\
          floating = max;\\n\
\\\n\
          noMax = true;\\n\
\\\n\
        }\\n\
\\\n\
      }\\n\
\\\n\
      if (noMin && noMax) {\\n\
\\\n\
        max = 1;\\n\
\\\n\
      }\\n\
\\\n\
      min = +min || 0;\\n\
\\\n\
      if (noMax) {\\n\
\\\n\
        max = min;\\n\
\\\n\
        min = 0;\\n\
\\\n\
      } else {\\n\
\\\n\
        max = +max || 0;\\n\
\\\n\
      }\\n\
\\\n\
      if (floating || min % 1 || max % 1) {\\n\
\\\n\
        var rand = nativeRandom();\\n\
\\\n\
        return nativeMin(min + (rand * (max - min + parseFloat('1e-' + ((rand +'').length - 1)))), max);\\n\
\\\n\
      }\\n\
\\\n\
      return baseRandom(min, max);\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Resolves the value of property `key` on `object`. If `key` is a function\\n\
\\\n\
     * it will be invoked with the `this` binding of `object` and its result returned,\\n\
\\\n\
     * else the property value is returned. If `object` is falsey then `undefined`\\n\
\\\n\
     * is returned.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Utilities\\n\
\\\n\
     * @param {Object} object The object to inspect.\\n\
\\\n\
     * @param {string} key The name of the property to resolve.\\n\
\\\n\
     * @returns {*} Returns the resolved value.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * var object = {\\n\
\\\n\
     *   'cheese': 'crumpets',\\n\
\\\n\
     *   'stuff': function() {\\n\
\\\n\
     *     return 'nonsense';\\n\
\\\n\
     *   }\\n\
\\\n\
     * };\\n\
\\\n\
     *\\n\
\\\n\
     * _.result(object, 'cheese');\\n\
\\\n\
     * // => 'crumpets'\\n\
\\\n\
     *\\n\
\\\n\
     * _.result(object, 'stuff');\\n\
\\\n\
     * // => 'nonsense'\\n\
\\\n\
     */\\n\
\\\n\
    function result(object, key) {\\n\
\\\n\
      if (object) {\\n\
\\\n\
        var value = object[key];\\n\
\\\n\
        return isFunction(value) ? object[key]() : value;\\n\
\\\n\
      }\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * A micro-templating method that handles arbitrary delimiters, preserves\\n\
\\\n\
     * whitespace, and correctly escapes quotes within interpolated code.\\n\
\\\n\
     *\\n\
\\\n\
     * Note: In the development build, `_.template` utilizes sourceURLs for easier\\n\
\\\n\
     * debugging. See http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl\\n\
\\\n\
     *\\n\
\\\n\
     * For more information on precompiling templates see:\\n\
\\\n\
     * http://lodash.com/custom-builds\\n\
\\\n\
     *\\n\
\\\n\
     * For more information on Chrome extension sandboxes see:\\n\
\\\n\
     * http://developer.chrome.com/stable/extensions/sandboxingEval.html\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Utilities\\n\
\\\n\
     * @param {string} text The template text.\\n\
\\\n\
     * @param {Object} data The data object used to populate the text.\\n\
\\\n\
     * @param {Object} [options] The options object.\\n\
\\\n\
     * @param {RegExp} [options.escape] The \\\"escape\\\" delimiter.\\n\
\\\n\
     * @param {RegExp} [options.evaluate] The \\\"evaluate\\\" delimiter.\\n\
\\\n\
     * @param {Object} [options.imports] An object to import into the template as local variables.\\n\
\\\n\
     * @param {RegExp} [options.interpolate] The \\\"interpolate\\\" delimiter.\\n\
\\\n\
     * @param {string} [sourceURL] The sourceURL of the template's compiled source.\\n\
\\\n\
     * @param {string} [variable] The data object variable name.\\n\
\\\n\
     * @returns {Function|string} Returns a compiled function when no `data` object\\n\
\\\n\
     *  is given, else it returns the interpolated text.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * // using the \\\"interpolate\\\" delimiter to create a compiled template\\n\
\\\n\
     * var compiled = _.template('hello <%= name %>');\\n\
\\\n\
     * compiled({ 'name': 'fred' });\\n\
\\\n\
     * // => 'hello fred'\\n\
\\\n\
     *\\n\
\\\n\
     * // using the \\\"escape\\\" delimiter to escape HTML in data property values\\n\
\\\n\
     * _.template('<b><%- value %></b>', { 'value': '<script>' });\\n\
\\\n\
     * // => '<b>&lt;script&gt;</b>'\\n\
\\\n\
     *\\n\
\\\n\
     * // using the \\\"evaluate\\\" delimiter to generate HTML\\n\
\\\n\
     * var list = '<% _.forEach(people, function(name) { %><li><%- name %></li><% }); %>';\\n\
\\\n\
     * _.template(list, { 'people': ['fred', 'barney'] });\\n\
\\\n\
     * // => '<li>fred</li><li>barney</li>'\\n\
\\\n\
     *\\n\
\\\n\
     * // using the ES6 delimiter as an alternative to the default \\\"interpolate\\\" delimiter\\n\
\\\n\
     * _.template('hello ${ name }', { 'name': 'pebbles' });\\n\
\\\n\
     * // => 'hello pebbles'\\n\
\\\n\
     *\\n\
\\\n\
     * // using the internal `print` function in \\\"evaluate\\\" delimiters\\n\
\\\n\
     * _.template('<% print(\\\"hello \\\" + name); %>!', { 'name': 'barney' });\\n\
\\\n\
     * // => 'hello barney!'\\n\
\\\n\
     *\\n\
\\\n\
     * // using a custom template delimiters\\n\
\\\n\
     * _.templateSettings = {\\n\
\\\n\
     *   'interpolate': /{{([\\\\s\\\\S]+?)}}/g\\n\
\\\n\
     * };\\n\
\\\n\
     *\\n\
\\\n\
     * _.template('hello {{ name }}!', { 'name': 'mustache' });\\n\
\\\n\
     * // => 'hello mustache!'\\n\
\\\n\
     *\\n\
\\\n\
     * // using the `imports` option to import jQuery\\n\
\\\n\
     * var list = '<% jq.each(people, function(name) { %><li><%- name %></li><% }); %>';\\n\
\\\n\
     * _.template(list, { 'people': ['fred', 'barney'] }, { 'imports': { 'jq': jQuery } });\\n\
\\\n\
     * // => '<li>fred</li><li>barney</li>'\\n\
\\\n\
     *\\n\
\\\n\
     * // using the `sourceURL` option to specify a custom sourceURL for the template\\n\
\\\n\
     * var compiled = _.template('hello <%= name %>', null, { 'sourceURL': '/basic/greeting.jst' });\\n\
\\\n\
     * compiled(data);\\n\
\\\n\
     * // => find the source of \\\"greeting.jst\\\" under the Sources tab or Resources panel of the web inspector\\n\
\\\n\
     *\\n\
\\\n\
     * // using the `variable` option to ensure a with-statement isn't used in the compiled template\\n\
\\\n\
     * var compiled = _.template('hi <%= data.name %>!', null, { 'variable': 'data' });\\n\
\\\n\
     * compiled.source;\\n\
\\\n\
     * // => function(data) {\\n\
\\\n\
     *   var __t, __p = '', __e = _.escape;\\n\
\\\n\
     *   __p += 'hi ' + ((__t = ( data.name )) == null ? '' : __t) + '!';\\n\
\\\n\
     *   return __p;\\n\
\\\n\
     * }\\n\
\\\n\
     *\\n\
\\\n\
     * // using the `source` property to inline compiled templates for meaningful\\n\
\\\n\
     * // line numbers in error messages and a stack trace\\n\
\\\n\
     * fs.writeFileSync(path.join(cwd, 'jst.js'), '\\\\\\n\
\\\n\
     *   var JST = {\\\\\\n\
\\\n\
     *     \\\"main\\\": ' + _.template(mainText).source + '\\\\\\n\
\\\n\
     *   };\\\\\\n\
\\\n\
     * ');\\n\
\\\n\
     */\\n\
\\\n\
    function template(text, data, options) {\\n\
\\\n\
      // based on John Resig's `tmpl` implementation\\n\
\\\n\
      // http://ejohn.org/blog/javascript-micro-templating/\\n\
\\\n\
      // and Laura Doktorova's doT.js\\n\
\\\n\
      // https://github.com/olado/doT\\n\
\\\n\
      var settings = lodash.templateSettings;\\n\
\\\n\
      text = String(text || '');\\n\
\\\n\
\\n\
\\\n\
      // avoid missing dependencies when `iteratorTemplate` is not defined\\n\
\\\n\
      options = defaults({}, options, settings);\\n\
\\\n\
\\n\
\\\n\
      var imports = defaults({}, options.imports, settings.imports),\\n\
\\\n\
          importsKeys = keys(imports),\\n\
\\\n\
          importsValues = values(imports);\\n\
\\\n\
\\n\
\\\n\
      var isEvaluating,\\n\
\\\n\
          index = 0,\\n\
\\\n\
          interpolate = options.interpolate || reNoMatch,\\n\
\\\n\
          source = \\\"__p += '\\\";\\n\
\\\n\
\\n\
\\\n\
      // compile the regexp to match each delimiter\\n\
\\\n\
      var reDelimiters = RegExp(\\n\
\\\n\
        (options.escape || reNoMatch).source + '|' +\\n\
\\\n\
        interpolate.source + '|' +\\n\
\\\n\
        (interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + '|' +\\n\
\\\n\
        (options.evaluate || reNoMatch).source + '|$'\\n\
\\\n\
      , 'g');\\n\
\\\n\
\\n\
\\\n\
      text.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {\\n\
\\\n\
        interpolateValue || (interpolateValue = esTemplateValue);\\n\
\\\n\
\\n\
\\\n\
        // escape characters that cannot be included in string literals\\n\
\\\n\
        source += text.slice(index, offset).replace(reUnescapedString, escapeStringChar);\\n\
\\\n\
\\n\
\\\n\
        // replace delimiters with snippets\\n\
\\\n\
        if (escapeValue) {\\n\
\\\n\
          source += \\\"' +\\\\n\
\\\n\
__e(\\\" + escapeValue + \\\") +\\\\n\
\\\n\
'\\\";\\n\
\\\n\
        }\\n\
\\\n\
        if (evaluateValue) {\\n\
\\\n\
          isEvaluating = true;\\n\
\\\n\
          source += \\\"';\\\\n\
\\\n\
\\\" + evaluateValue + \\\";\\\\n\
\\\n\
__p += '\\\";\\n\
\\\n\
        }\\n\
\\\n\
        if (interpolateValue) {\\n\
\\\n\
          source += \\\"' +\\\\n\
\\\n\
((__t = (\\\" + interpolateValue + \\\")) == null ? '' : __t) +\\\\n\
\\\n\
'\\\";\\n\
\\\n\
        }\\n\
\\\n\
        index = offset + match.length;\\n\
\\\n\
\\n\
\\\n\
        // the JS engine embedded in Adobe products requires returning the `match`\\n\
\\\n\
        // string in order to produce the correct `offset` value\\n\
\\\n\
        return match;\\n\
\\\n\
      });\\n\
\\\n\
\\n\
\\\n\
      source += \\\"';\\\\n\
\\\n\
\\\";\\n\
\\\n\
\\n\
\\\n\
      // if `variable` is not specified, wrap a with-statement around the generated\\n\
\\\n\
      // code to add the data object to the top of the scope chain\\n\
\\\n\
      var variable = options.variable,\\n\
\\\n\
          hasVariable = variable;\\n\
\\\n\
\\n\
\\\n\
      if (!hasVariable) {\\n\
\\\n\
        variable = 'obj';\\n\
\\\n\
        source = 'with (' + variable + ') {\\\\n\
\\\n\
' + source + '\\\\n\
\\\n\
}\\\\n\
\\\n\
';\\n\
\\\n\
      }\\n\
\\\n\
      // cleanup code by stripping empty strings\\n\
\\\n\
      source = (isEvaluating ? source.replace(reEmptyStringLeading, '') : source)\\n\
\\\n\
        .replace(reEmptyStringMiddle, '$1')\\n\
\\\n\
        .replace(reEmptyStringTrailing, '$1;');\\n\
\\\n\
\\n\
\\\n\
      // frame code as the function body\\n\
\\\n\
      source = 'function(' + variable + ') {\\\\n\
\\\n\
' +\\n\
\\\n\
        (hasVariable ? '' : variable + ' || (' + variable + ' = {});\\\\n\
\\\n\
') +\\n\
\\\n\
        \\\"var __t, __p = '', __e = _.escape\\\" +\\n\
\\\n\
        (isEvaluating\\n\
\\\n\
          ? ', __j = Array.prototype.join;\\\\n\
\\\n\
' +\\n\
\\\n\
            \\\"function print() { __p += __j.call(arguments, '') }\\\\n\
\\\n\
\\\"\\n\
\\\n\
          : ';\\\\n\
\\\n\
'\\n\
\\\n\
        ) +\\n\
\\\n\
        source +\\n\
\\\n\
        'return __p\\\\n\
\\\n\
}';\\n\
\\\n\
\\n\
\\\n\
      // Use a sourceURL for easier debugging.\\n\
\\\n\
      // http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl\\n\
\\\n\
      var sourceURL = '\\\\n\
\\\n\
/*\\\\n\
\\\n\
//# sourceURL=' + (options.sourceURL || '/lodash/template/source[' + (templateCounter++) + ']') + '\\\\n\
\\\n\
*/';\\n\
\\\n\
\\n\
\\\n\
      try {\\n\
\\\n\
        var result = Function(importsKeys, 'return ' + source + sourceURL).apply(undefined, importsValues);\\n\
\\\n\
      } catch(e) {\\n\
\\\n\
        e.source = source;\\n\
\\\n\
        throw e;\\n\
\\\n\
      }\\n\
\\\n\
      if (data) {\\n\
\\\n\
        return result(data);\\n\
\\\n\
      }\\n\
\\\n\
      // provide the compiled function's source by its `toString` method, in\\n\
\\\n\
      // supported environments, or the `source` property as a convenience for\\n\
\\\n\
      // inlining compiled templates during the build process\\n\
\\\n\
      result.source = source;\\n\
\\\n\
      return result;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Executes the callback `n` times, returning an array of the results\\n\
\\\n\
     * of each callback execution. The callback is bound to `thisArg` and invoked\\n\
\\\n\
     * with one argument; (index).\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Utilities\\n\
\\\n\
     * @param {number} n The number of times to execute the callback.\\n\
\\\n\
     * @param {Function} callback The function called per iteration.\\n\
\\\n\
     * @param {*} [thisArg] The `this` binding of `callback`.\\n\
\\\n\
     * @returns {Array} Returns an array of the results of each `callback` execution.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * var diceRolls = _.times(3, _.partial(_.random, 1, 6));\\n\
\\\n\
     * // => [3, 6, 4]\\n\
\\\n\
     *\\n\
\\\n\
     * _.times(3, function(n) { mage.castSpell(n); });\\n\
\\\n\
     * // => calls `mage.castSpell(n)` three times, passing `n` of `0`, `1`, and `2` respectively\\n\
\\\n\
     *\\n\
\\\n\
     * _.times(3, function(n) { this.cast(n); }, mage);\\n\
\\\n\
     * // => also calls `mage.castSpell(n)` three times\\n\
\\\n\
     */\\n\
\\\n\
    function times(n, callback, thisArg) {\\n\
\\\n\
      n = (n = +n) > -1 ? n : 0;\\n\
\\\n\
      var index = -1,\\n\
\\\n\
          result = Array(n);\\n\
\\\n\
\\n\
\\\n\
      callback = baseCreateCallback(callback, thisArg, 1);\\n\
\\\n\
      while (++index < n) {\\n\
\\\n\
        result[index] = callback(index);\\n\
\\\n\
      }\\n\
\\\n\
      return result;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * The inverse of `_.escape` this method converts the HTML entities\\n\
\\\n\
     * `&amp;`, `&lt;`, `&gt;`, `&quot;`, and `&#39;` in `string` to their\\n\
\\\n\
     * corresponding characters.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Utilities\\n\
\\\n\
     * @param {string} string The string to unescape.\\n\
\\\n\
     * @returns {string} Returns the unescaped string.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.unescape('Fred, Barney &amp; Pebbles');\\n\
\\\n\
     * // => 'Fred, Barney & Pebbles'\\n\
\\\n\
     */\\n\
\\\n\
    function unescape(string) {\\n\
\\\n\
      if (string == null) {\\n\
\\\n\
        return '';\\n\
\\\n\
      }\\n\
\\\n\
      string = String(string);\\n\
\\\n\
      return string.indexOf(';') < 0 ? string : string.replace(reEscapedHtml, unescapeHtmlChar);\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Generates a unique ID. If `prefix` is provided the ID will be appended to it.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Utilities\\n\
\\\n\
     * @param {string} [prefix] The value to prefix the ID with.\\n\
\\\n\
     * @returns {string} Returns the unique ID.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _.uniqueId('contact_');\\n\
\\\n\
     * // => 'contact_104'\\n\
\\\n\
     *\\n\
\\\n\
     * _.uniqueId();\\n\
\\\n\
     * // => '105'\\n\
\\\n\
     */\\n\
\\\n\
    function uniqueId(prefix) {\\n\
\\\n\
      var id = ++idCounter;\\n\
\\\n\
      return String(prefix == null ? '' : prefix) + id;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /*--------------------------------------------------------------------------*/\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Creates a `lodash` object that wraps the given value with explicit\\n\
\\\n\
     * method chaining enabled.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Chaining\\n\
\\\n\
     * @param {*} value The value to wrap.\\n\
\\\n\
     * @returns {Object} Returns the wrapper object.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * var characters = [\\n\
\\\n\
     *   { 'name': 'barney',  'age': 36 },\\n\
\\\n\
     *   { 'name': 'fred',    'age': 40 },\\n\
\\\n\
     *   { 'name': 'pebbles', 'age': 1 }\\n\
\\\n\
     * ];\\n\
\\\n\
     *\\n\
\\\n\
     * var youngest = _.chain(characters)\\n\
\\\n\
     *     .sortBy('age')\\n\
\\\n\
     *     .map(function(chr) { return chr.name + ' is ' + chr.age; })\\n\
\\\n\
     *     .first()\\n\
\\\n\
     *     .value();\\n\
\\\n\
     * // => 'pebbles is 1'\\n\
\\\n\
     */\\n\
\\\n\
    function chain(value) {\\n\
\\\n\
      value = new lodashWrapper(value);\\n\
\\\n\
      value.__chain__ = true;\\n\
\\\n\
      return value;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Invokes `interceptor` with the `value` as the first argument and then\\n\
\\\n\
     * returns `value`. The purpose of this method is to \\\"tap into\\\" a method\\n\
\\\n\
     * chain in order to perform operations on intermediate results within\\n\
\\\n\
     * the chain.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Chaining\\n\
\\\n\
     * @param {*} value The value to provide to `interceptor`.\\n\
\\\n\
     * @param {Function} interceptor The function to invoke.\\n\
\\\n\
     * @returns {*} Returns `value`.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _([1, 2, 3, 4])\\n\
\\\n\
     *  .tap(function(array) { array.pop(); })\\n\
\\\n\
     *  .reverse()\\n\
\\\n\
     *  .value();\\n\
\\\n\
     * // => [3, 2, 1]\\n\
\\\n\
     */\\n\
\\\n\
    function tap(value, interceptor) {\\n\
\\\n\
      interceptor(value);\\n\
\\\n\
      return value;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Enables explicit method chaining on the wrapper object.\\n\
\\\n\
     *\\n\
\\\n\
     * @name chain\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Chaining\\n\
\\\n\
     * @returns {*} Returns the wrapper object.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * var characters = [\\n\
\\\n\
     *   { 'name': 'barney', 'age': 36 },\\n\
\\\n\
     *   { 'name': 'fred',   'age': 40 }\\n\
\\\n\
     * ];\\n\
\\\n\
     *\\n\
\\\n\
     * // without explicit chaining\\n\
\\\n\
     * _(characters).first();\\n\
\\\n\
     * // => { 'name': 'barney', 'age': 36 }\\n\
\\\n\
     *\\n\
\\\n\
     * // with explicit chaining\\n\
\\\n\
     * _(characters).chain()\\n\
\\\n\
     *   .first()\\n\
\\\n\
     *   .pick('age')\\n\
\\\n\
     *   .value();\\n\
\\\n\
     * // => { 'age': 36 }\\n\
\\\n\
     */\\n\
\\\n\
    function wrapperChain() {\\n\
\\\n\
      this.__chain__ = true;\\n\
\\\n\
      return this;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Produces the `toString` result of the wrapped value.\\n\
\\\n\
     *\\n\
\\\n\
     * @name toString\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @category Chaining\\n\
\\\n\
     * @returns {string} Returns the string result.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _([1, 2, 3]).toString();\\n\
\\\n\
     * // => '1,2,3'\\n\
\\\n\
     */\\n\
\\\n\
    function wrapperToString() {\\n\
\\\n\
      return String(this.__wrapped__);\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * Extracts the wrapped value.\\n\
\\\n\
     *\\n\
\\\n\
     * @name valueOf\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @alias value\\n\
\\\n\
     * @category Chaining\\n\
\\\n\
     * @returns {*} Returns the wrapped value.\\n\
\\\n\
     * @example\\n\
\\\n\
     *\\n\
\\\n\
     * _([1, 2, 3]).valueOf();\\n\
\\\n\
     * // => [1, 2, 3]\\n\
\\\n\
     */\\n\
\\\n\
    function wrapperValueOf() {\\n\
\\\n\
      return this.__wrapped__;\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    /*--------------------------------------------------------------------------*/\\n\
\\\n\
\\n\
\\\n\
    // add functions that return wrapped values when chaining\\n\
\\\n\
    lodash.after = after;\\n\
\\\n\
    lodash.assign = assign;\\n\
\\\n\
    lodash.at = at;\\n\
\\\n\
    lodash.bind = bind;\\n\
\\\n\
    lodash.bindAll = bindAll;\\n\
\\\n\
    lodash.bindKey = bindKey;\\n\
\\\n\
    lodash.chain = chain;\\n\
\\\n\
    lodash.compact = compact;\\n\
\\\n\
    lodash.compose = compose;\\n\
\\\n\
    lodash.constant = constant;\\n\
\\\n\
    lodash.countBy = countBy;\\n\
\\\n\
    lodash.create = create;\\n\
\\\n\
    lodash.createCallback = createCallback;\\n\
\\\n\
    lodash.curry = curry;\\n\
\\\n\
    lodash.debounce = debounce;\\n\
\\\n\
    lodash.defaults = defaults;\\n\
\\\n\
    lodash.defer = defer;\\n\
\\\n\
    lodash.delay = delay;\\n\
\\\n\
    lodash.difference = difference;\\n\
\\\n\
    lodash.filter = filter;\\n\
\\\n\
    lodash.flatten = flatten;\\n\
\\\n\
    lodash.forEach = forEach;\\n\
\\\n\
    lodash.forEachRight = forEachRight;\\n\
\\\n\
    lodash.forIn = forIn;\\n\
\\\n\
    lodash.forInRight = forInRight;\\n\
\\\n\
    lodash.forOwn = forOwn;\\n\
\\\n\
    lodash.forOwnRight = forOwnRight;\\n\
\\\n\
    lodash.functions = functions;\\n\
\\\n\
    lodash.groupBy = groupBy;\\n\
\\\n\
    lodash.indexBy = indexBy;\\n\
\\\n\
    lodash.initial = initial;\\n\
\\\n\
    lodash.intersection = intersection;\\n\
\\\n\
    lodash.invert = invert;\\n\
\\\n\
    lodash.invoke = invoke;\\n\
\\\n\
    lodash.keys = keys;\\n\
\\\n\
    lodash.map = map;\\n\
\\\n\
    lodash.mapValues = mapValues;\\n\
\\\n\
    lodash.max = max;\\n\
\\\n\
    lodash.memoize = memoize;\\n\
\\\n\
    lodash.merge = merge;\\n\
\\\n\
    lodash.min = min;\\n\
\\\n\
    lodash.omit = omit;\\n\
\\\n\
    lodash.once = once;\\n\
\\\n\
    lodash.pairs = pairs;\\n\
\\\n\
    lodash.partial = partial;\\n\
\\\n\
    lodash.partialRight = partialRight;\\n\
\\\n\
    lodash.pick = pick;\\n\
\\\n\
    lodash.pluck = pluck;\\n\
\\\n\
    lodash.property = property;\\n\
\\\n\
    lodash.pull = pull;\\n\
\\\n\
    lodash.range = range;\\n\
\\\n\
    lodash.reject = reject;\\n\
\\\n\
    lodash.remove = remove;\\n\
\\\n\
    lodash.rest = rest;\\n\
\\\n\
    lodash.shuffle = shuffle;\\n\
\\\n\
    lodash.sortBy = sortBy;\\n\
\\\n\
    lodash.tap = tap;\\n\
\\\n\
    lodash.throttle = throttle;\\n\
\\\n\
    lodash.times = times;\\n\
\\\n\
    lodash.toArray = toArray;\\n\
\\\n\
    lodash.transform = transform;\\n\
\\\n\
    lodash.union = union;\\n\
\\\n\
    lodash.uniq = uniq;\\n\
\\\n\
    lodash.values = values;\\n\
\\\n\
    lodash.where = where;\\n\
\\\n\
    lodash.without = without;\\n\
\\\n\
    lodash.wrap = wrap;\\n\
\\\n\
    lodash.xor = xor;\\n\
\\\n\
    lodash.zip = zip;\\n\
\\\n\
    lodash.zipObject = zipObject;\\n\
\\\n\
\\n\
\\\n\
    // add aliases\\n\
\\\n\
    lodash.collect = map;\\n\
\\\n\
    lodash.drop = rest;\\n\
\\\n\
    lodash.each = forEach;\\n\
\\\n\
    lodash.eachRight = forEachRight;\\n\
\\\n\
    lodash.extend = assign;\\n\
\\\n\
    lodash.methods = functions;\\n\
\\\n\
    lodash.object = zipObject;\\n\
\\\n\
    lodash.select = filter;\\n\
\\\n\
    lodash.tail = rest;\\n\
\\\n\
    lodash.unique = uniq;\\n\
\\\n\
    lodash.unzip = zip;\\n\
\\\n\
\\n\
\\\n\
    // add functions to `lodash.prototype`\\n\
\\\n\
    mixin(assign({}, lodash));\\n\
\\\n\
\\n\
\\\n\
    /*--------------------------------------------------------------------------*/\\n\
\\\n\
\\n\
\\\n\
    // add functions that return unwrapped values when chaining\\n\
\\\n\
    lodash.clone = clone;\\n\
\\\n\
    lodash.cloneDeep = cloneDeep;\\n\
\\\n\
    lodash.contains = contains;\\n\
\\\n\
    lodash.escape = escape;\\n\
\\\n\
    lodash.every = every;\\n\
\\\n\
    lodash.find = find;\\n\
\\\n\
    lodash.findIndex = findIndex;\\n\
\\\n\
    lodash.findKey = findKey;\\n\
\\\n\
    lodash.findLast = findLast;\\n\
\\\n\
    lodash.findLastIndex = findLastIndex;\\n\
\\\n\
    lodash.findLastKey = findLastKey;\\n\
\\\n\
    lodash.has = has;\\n\
\\\n\
    lodash.identity = identity;\\n\
\\\n\
    lodash.indexOf = indexOf;\\n\
\\\n\
    lodash.isArguments = isArguments;\\n\
\\\n\
    lodash.isArray = isArray;\\n\
\\\n\
    lodash.isBoolean = isBoolean;\\n\
\\\n\
    lodash.isDate = isDate;\\n\
\\\n\
    lodash.isElement = isElement;\\n\
\\\n\
    lodash.isEmpty = isEmpty;\\n\
\\\n\
    lodash.isEqual = isEqual;\\n\
\\\n\
    lodash.isFinite = isFinite;\\n\
\\\n\
    lodash.isFunction = isFunction;\\n\
\\\n\
    lodash.isNaN = isNaN;\\n\
\\\n\
    lodash.isNull = isNull;\\n\
\\\n\
    lodash.isNumber = isNumber;\\n\
\\\n\
    lodash.isObject = isObject;\\n\
\\\n\
    lodash.isPlainObject = isPlainObject;\\n\
\\\n\
    lodash.isRegExp = isRegExp;\\n\
\\\n\
    lodash.isString = isString;\\n\
\\\n\
    lodash.isUndefined = isUndefined;\\n\
\\\n\
    lodash.lastIndexOf = lastIndexOf;\\n\
\\\n\
    lodash.mixin = mixin;\\n\
\\\n\
    lodash.noConflict = noConflict;\\n\
\\\n\
    lodash.noop = noop;\\n\
\\\n\
    lodash.now = now;\\n\
\\\n\
    lodash.parseInt = parseInt;\\n\
\\\n\
    lodash.random = random;\\n\
\\\n\
    lodash.reduce = reduce;\\n\
\\\n\
    lodash.reduceRight = reduceRight;\\n\
\\\n\
    lodash.result = result;\\n\
\\\n\
    lodash.runInContext = runInContext;\\n\
\\\n\
    lodash.size = size;\\n\
\\\n\
    lodash.some = some;\\n\
\\\n\
    lodash.sortedIndex = sortedIndex;\\n\
\\\n\
    lodash.template = template;\\n\
\\\n\
    lodash.unescape = unescape;\\n\
\\\n\
    lodash.uniqueId = uniqueId;\\n\
\\\n\
\\n\
\\\n\
    // add aliases\\n\
\\\n\
    lodash.all = every;\\n\
\\\n\
    lodash.any = some;\\n\
\\\n\
    lodash.detect = find;\\n\
\\\n\
    lodash.findWhere = find;\\n\
\\\n\
    lodash.foldl = reduce;\\n\
\\\n\
    lodash.foldr = reduceRight;\\n\
\\\n\
    lodash.include = contains;\\n\
\\\n\
    lodash.inject = reduce;\\n\
\\\n\
\\n\
\\\n\
    mixin(function() {\\n\
\\\n\
      var source = {}\\n\
\\\n\
      forOwn(lodash, function(func, methodName) {\\n\
\\\n\
        if (!lodash.prototype[methodName]) {\\n\
\\\n\
          source[methodName] = func;\\n\
\\\n\
        }\\n\
\\\n\
      });\\n\
\\\n\
      return source;\\n\
\\\n\
    }(), false);\\n\
\\\n\
\\n\
\\\n\
    /*--------------------------------------------------------------------------*/\\n\
\\\n\
\\n\
\\\n\
    // add functions capable of returning wrapped and unwrapped values when chaining\\n\
\\\n\
    lodash.first = first;\\n\
\\\n\
    lodash.last = last;\\n\
\\\n\
    lodash.sample = sample;\\n\
\\\n\
\\n\
\\\n\
    // add aliases\\n\
\\\n\
    lodash.take = first;\\n\
\\\n\
    lodash.head = first;\\n\
\\\n\
\\n\
\\\n\
    forOwn(lodash, function(func, methodName) {\\n\
\\\n\
      var callbackable = methodName !== 'sample';\\n\
\\\n\
      if (!lodash.prototype[methodName]) {\\n\
\\\n\
        lodash.prototype[methodName]= function(n, guard) {\\n\
\\\n\
          var chainAll = this.__chain__,\\n\
\\\n\
              result = func(this.__wrapped__, n, guard);\\n\
\\\n\
\\n\
\\\n\
          return !chainAll && (n == null || (guard && !(callbackable && typeof n == 'function')))\\n\
\\\n\
            ? result\\n\
\\\n\
            : new lodashWrapper(result, chainAll);\\n\
\\\n\
        };\\n\
\\\n\
      }\\n\
\\\n\
    });\\n\
\\\n\
\\n\
\\\n\
    /*--------------------------------------------------------------------------*/\\n\
\\\n\
\\n\
\\\n\
    /**\\n\
\\\n\
     * The semantic version number.\\n\
\\\n\
     *\\n\
\\\n\
     * @static\\n\
\\\n\
     * @memberOf _\\n\
\\\n\
     * @type string\\n\
\\\n\
     */\\n\
\\\n\
    lodash.VERSION = '2.4.1';\\n\
\\\n\
\\n\
\\\n\
    // add \\\"Chaining\\\" functions to the wrapper\\n\
\\\n\
    lodash.prototype.chain = wrapperChain;\\n\
\\\n\
    lodash.prototype.toString = wrapperToString;\\n\
\\\n\
    lodash.prototype.value = wrapperValueOf;\\n\
\\\n\
    lodash.prototype.valueOf = wrapperValueOf;\\n\
\\\n\
\\n\
\\\n\
    // add `Array` functions that return unwrapped values\\n\
\\\n\
    baseEach(['join', 'pop', 'shift'], function(methodName) {\\n\
\\\n\
      var func = arrayRef[methodName];\\n\
\\\n\
      lodash.prototype[methodName] = function() {\\n\
\\\n\
        var chainAll = this.__chain__,\\n\
\\\n\
            result = func.apply(this.__wrapped__, arguments);\\n\
\\\n\
\\n\
\\\n\
        return chainAll\\n\
\\\n\
          ? new lodashWrapper(result, chainAll)\\n\
\\\n\
          : result;\\n\
\\\n\
      };\\n\
\\\n\
    });\\n\
\\\n\
\\n\
\\\n\
    // add `Array` functions that return the existing wrapped value\\n\
\\\n\
    baseEach(['push', 'reverse', 'sort', 'unshift'], function(methodName) {\\n\
\\\n\
      var func = arrayRef[methodName];\\n\
\\\n\
      lodash.prototype[methodName] = function() {\\n\
\\\n\
        func.apply(this.__wrapped__, arguments);\\n\
\\\n\
        return this;\\n\
\\\n\
      };\\n\
\\\n\
    });\\n\
\\\n\
\\n\
\\\n\
    // add `Array` functions that return new wrapped values\\n\
\\\n\
    baseEach(['concat', 'slice', 'splice'], function(methodName) {\\n\
\\\n\
      var func = arrayRef[methodName];\\n\
\\\n\
      lodash.prototype[methodName] = function() {\\n\
\\\n\
        return new lodashWrapper(func.apply(this.__wrapped__, arguments), this.__chain__);\\n\
\\\n\
      };\\n\
\\\n\
    });\\n\
\\\n\
\\n\
\\\n\
    // avoid array-like object bugs with `Array#shift` and `Array#splice`\\n\
\\\n\
    // in IE < 9, Firefox < 10, Narwhal, and RingoJS\\n\
\\\n\
    if (!support.spliceObjects) {\\n\
\\\n\
      baseEach(['pop', 'shift', 'splice'], function(methodName) {\\n\
\\\n\
        var func = arrayRef[methodName],\\n\
\\\n\
            isSplice = methodName == 'splice';\\n\
\\\n\
\\n\
\\\n\
        lodash.prototype[methodName] = function() {\\n\
\\\n\
          var chainAll = this.__chain__,\\n\
\\\n\
              value = this.__wrapped__,\\n\
\\\n\
              result = func.apply(value, arguments);\\n\
\\\n\
\\n\
\\\n\
          if (value.length === 0) {\\n\
\\\n\
            delete value[0];\\n\
\\\n\
          }\\n\
\\\n\
          return (chainAll || isSplice)\\n\
\\\n\
            ? new lodashWrapper(result, chainAll)\\n\
\\\n\
            : result;\\n\
\\\n\
        };\\n\
\\\n\
      });\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    return lodash;\\n\
\\\n\
  }\\n\
\\\n\
\\n\
\\\n\
  /*--------------------------------------------------------------------------*/\\n\
\\\n\
\\n\
\\\n\
  // expose Lo-Dash\\n\
\\\n\
  var _ = runInContext();\\n\
\\\n\
\\n\
\\\n\
  // some AMD build optimizers like r.js check for condition patterns like the following:\\n\
\\\n\
  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {\\n\
\\\n\
    // Expose Lo-Dash to the global object even when an AMD loader is present in\\n\
\\\n\
    // case Lo-Dash is loaded with a RequireJS shim config.\\n\
\\\n\
    // See http://requirejs.org/docs/api.html#config-shim\\n\
\\\n\
    root._ = _;\\n\
\\\n\
\\n\
\\\n\
    // define as an anonymous module so, through path mapping, it can be\\n\
\\\n\
    // referenced as the \\\"underscore\\\" module\\n\
\\\n\
    define(function() {\\n\
\\\n\
      return _;\\n\
\\\n\
    });\\n\
\\\n\
  }\\n\
\\\n\
  // check for `exports` after `define` in case a build optimizer adds an `exports` object\\n\
\\\n\
  else if (freeExports && freeModule) {\\n\
\\\n\
    // in Node.js or RingoJS\\n\
\\\n\
    if (moduleExports) {\\n\
\\\n\
      (freeModule.exports = _)._ = _;\\n\
\\\n\
    }\\n\
\\\n\
    // in Narwhal or Rhino -require\\n\
\\\n\
    else {\\n\
\\\n\
      freeExports._ = _;\\n\
\\\n\
    }\\n\
\\\n\
  }\\n\
\\\n\
  else {\\n\
\\\n\
    // in a browser or Rhino\\n\
\\\n\
    root._ = _;\\n\
\\\n\
  }\\n\
\\\n\
}.call(this));\\n\
\\\n\
//@ sourceURL=lodash-lodash/dist/lodash.compat.js\"\n\
));\n\
require.register(\"notablemind-keys/index.js\", Function(\"exports, require, module\",\n\
\"\\n\
\\\n\
var keyCodeNames = {\\n\
\\\n\
  8:  'backspace',\\n\
\\\n\
  9:  'tab',\\n\
\\\n\
  13: 'return',\\n\
\\\n\
  16: 'shift',\\n\
\\\n\
  17: 'ctrl',\\n\
\\\n\
  18: 'alt',\\n\
\\\n\
  20: 'caps',\\n\
\\\n\
  27: 'escape',\\n\
\\\n\
  32: 'space',\\n\
\\\n\
  33: 'page up',\\n\
\\\n\
  34: 'page down',\\n\
\\\n\
  35: 'end',\\n\
\\\n\
  36: 'home',\\n\
\\\n\
  37: 'left',\\n\
\\\n\
  38: 'up',\\n\
\\\n\
  39: 'right',\\n\
\\\n\
  40: 'down',\\n\
\\\n\
  45: 'insert',\\n\
\\\n\
  46: 'delete',\\n\
\\\n\
  91: 'meta'\\n\
\\\n\
};\\n\
\\\n\
\\n\
\\\n\
var nameCodeKeys = {};\\n\
\\\n\
Object.keys(keyCodeNames).forEach(function(name){\\n\
\\\n\
  nameCodeKeys[keyCodeNames[name]] = name;\\n\
\\\n\
});\\n\
\\\n\
\\n\
\\\n\
var keyname = function(e){\\n\
\\\n\
  var b = keyCodeNames[e.keyCode] || String.fromCharCode(e.keyCode);\\n\
\\\n\
  var name = b;\\n\
\\\n\
  if (e.shiftKey && b !== 'shift') name = 'shift ' + name;\\n\
\\\n\
  if (e.altKey && b !== 'alt') name = 'alt ' + name;\\n\
\\\n\
  if (e.ctrlKey && b !== 'ctrl') name = 'ctrl ' + name;\\n\
\\\n\
  if (e.metaKey && b !== 'meta') name = 'meta ' + name;\\n\
\\\n\
  return name;\\n\
\\\n\
};\\n\
\\\n\
\\n\
\\\n\
var keys = module.exports = function (config) {\\n\
\\\n\
  var names = Object.keys(config);\\n\
\\\n\
  for (var i=0; i<names.length; i++) {\\n\
\\\n\
    if (names[i].indexOf('|') !== -1) {\\n\
\\\n\
      var val = config[names[i]];\\n\
\\\n\
      delete config[names[i]];\\n\
\\\n\
      var parts = names[i].split('|');\\n\
\\\n\
      for (var j=0; j<parts.length; j++) {\\n\
\\\n\
        config[parts[j]] = val;\\n\
\\\n\
      }\\n\
\\\n\
    }\\n\
\\\n\
  }\\n\
\\\n\
  return function (e) {\\n\
\\\n\
    var name = keyname(e);\\n\
\\\n\
    if (config[name]) {\\n\
\\\n\
      var res = config[name].call(this, e)\\n\
\\\n\
      if (!res) {\\n\
\\\n\
        e.preventDefault();\\n\
\\\n\
        e.stopPropagation();\\n\
\\\n\
        return false;\\n\
\\\n\
      }\\n\
\\\n\
      return res;\\n\
\\\n\
    }\\n\
\\\n\
  };\\n\
\\\n\
};\\n\
\\\n\
\\n\
\\\n\
module.exports.normalize = function (value) {\\n\
\\\n\
  var parts = value.split('|')\\n\
\\\n\
    , normal = [];\\n\
\\\n\
  for (var i=0; i<parts.length; i++) {\\n\
\\\n\
    if (!parts[i].trim()) continue;\\n\
\\\n\
    var one = normalize(parts[i]);\\n\
\\\n\
    if (one.value) normal.push(one.value);\\n\
\\\n\
    else normal.push(parts[i]);\\n\
\\\n\
    if (one.error) {\\n\
\\\n\
      return {error: one.error, value: normal.concat(parts.slice(i+1)).join('|')};\\n\
\\\n\
    }\\n\
\\\n\
  }\\n\
\\\n\
  return {value: normal.join('|')};\\n\
\\\n\
};\\n\
\\\n\
\\n\
\\\n\
/**\\n\
\\\n\
 * name = a key\\n\
\\\n\
 *\\n\
\\\n\
 * If it's invalid: {error: message, [value: normalized]}\\n\
\\\n\
 * If it's valid: {value: normalized}\\n\
\\\n\
 */\\n\
\\\n\
var normalize = function(name){\\n\
\\\n\
  var parts = name.replace(/^\\\\s+/, '')\\n\
\\\n\
                  .replace(/\\\\s+$/, '').toLowerCase().split(/\\\\s+/);\\n\
\\\n\
  var mods = {ctrl:false, shift:false, alt:false, meta:false};\\n\
\\\n\
  for (var i=0; i<parts.length - 1; i++) {\\n\
\\\n\
    if (typeof mods[parts[i]] === 'undefined') {\\n\
\\\n\
      // invalid modifiers\\n\
\\\n\
      return {error: 'Unknown modifier'};\\n\
\\\n\
    } else {\\n\
\\\n\
      mods[parts[i]] = true;\\n\
\\\n\
    }\\n\
\\\n\
  }\\n\
\\\n\
  var pre = [];\\n\
\\\n\
  if (mods.meta)  pre.push('meta');\\n\
\\\n\
  if (mods.ctrl)  pre.push('ctrl');\\n\
\\\n\
  if (mods.alt)   pre.push('alt');\\n\
\\\n\
  if (mods.shift) pre.push('shift');\\n\
\\\n\
  pre.push('');\\n\
\\\n\
  pre = pre.join(' ');\\n\
\\\n\
  var main = parts[parts.length - 1];\\n\
\\\n\
  if (!nameCodeKeys[main] && main.length > 1) {\\n\
\\\n\
    // invalid final\\n\
\\\n\
    return {error: 'Unknown key', value: pre + main};\\n\
\\\n\
  }\\n\
\\\n\
  if (!nameCodeKeys[main]) {\\n\
\\\n\
    main = main.toUpperCase();\\n\
\\\n\
  }\\n\
\\\n\
  return {value: pre + main};\\n\
\\\n\
};\\n\
\\\n\
\\n\
\\\n\
var serialize = function (name) {\\n\
\\\n\
  var parts = name.replace(/^\\\\s+/, '')\\n\
\\\n\
                  .replace(/\\\\s+$/, '').toLowerCase().split(/\\\\s+/);\\n\
\\\n\
  var mods = {ctrlKey:false, shiftKey:false, altKey:false, metaKey:false};\\n\
\\\n\
  for (var i=0; i<parts.length - 1; i++) {\\n\
\\\n\
    if (typeof mods[parts[i] + 'Key'] === 'undefined') {\\n\
\\\n\
      // invalid modifiers\\n\
\\\n\
      return false;\\n\
\\\n\
    } else {\\n\
\\\n\
      mods[parts[i] + 'Key'] = true;\\n\
\\\n\
    }\\n\
\\\n\
  }\\n\
\\\n\
  var main = parts[parts.length - 1];\\n\
\\\n\
  if (!nameCodeKeys[main] && main.length > 1) {\\n\
\\\n\
    // invalid final\\n\
\\\n\
    return false;\\n\
\\\n\
  }\\n\
\\\n\
  if (nameCodeKeys[main]) {\\n\
\\\n\
    mods.keyCode = nameCodeKeys[main];\\n\
\\\n\
  } else {\\n\
\\\n\
    mods.keyCode = main.charCodeAt(0);\\n\
\\\n\
  }\\n\
\\\n\
  return mods;\\n\
\\\n\
};\\n\
\\\n\
\\n\
\\\n\
module.exports.serialize = serialize;\\n\
\\\n\
module.exports.keyname = keyname;\\n\
\\\n\
\\n\
\\\n\
//@ sourceURL=notablemind-keys/index.js\"\n\
));\n\
require.register(\"tags/index.js\", Function(\"exports, require, module\",\n\
\"/** @jsx React.DOM */\\n\
\\\n\
\\n\
\\\n\
var _ = require('lodash')\\n\
\\\n\
  , keys = require('keys')\\n\
\\\n\
\\n\
\\\n\
  , states = require('./states')\\n\
\\\n\
\\n\
\\\n\
var Tags = React.createClass({displayName: 'Tags',\\n\
\\\n\
\\n\
\\\n\
  getInitialState: function () {\\n\
\\\n\
    var defaultValue = this.props.defaultValue\\n\
\\\n\
      , value = defaultValue || []\\n\
\\\n\
      , editing = this.props.editing\\n\
\\\n\
      , input = ''\\n\
\\\n\
    editing = 'undefined' === typeof editing ? false : editing\\n\
\\\n\
    return {\\n\
\\\n\
      value: value,\\n\
\\\n\
      editing: editing,\\n\
\\\n\
      focused: this.props.focused || false,\\n\
\\\n\
      input: input\\n\
\\\n\
    }\\n\
\\\n\
  },\\n\
\\\n\
\\n\
\\\n\
  // loading data\\n\
\\\n\
  componentWillMount: function () {\\n\
\\\n\
    this.load()\\n\
\\\n\
  },\\n\
\\\n\
  load: function () {\\n\
\\\n\
    if (!this.props.load) return;\\n\
\\\n\
    this.props.load(function (tags) {\\n\
\\\n\
      this.setState({value: tags})\\n\
\\\n\
    }.bind(this))\\n\
\\\n\
  },\\n\
\\\n\
\\n\
\\\n\
  // all about the focus\\n\
\\\n\
  componentDidMount: function () {\\n\
\\\n\
    if (this.state.focused) {\\n\
\\\n\
      this.refs.input.getDOMNode().focus()\\n\
\\\n\
    }\\n\
\\\n\
  },\\n\
\\\n\
  componentWillReceiveProps: function (props) {\\n\
\\\n\
    if (props.focused) {\\n\
\\\n\
      this.setState({focused: true})\\n\
\\\n\
    }\\n\
\\\n\
  },\\n\
\\\n\
  componentDidUpdate: function () {\\n\
\\\n\
    if (this.state.focused) {\\n\
\\\n\
      this.refs.input.getDOMNode().focus()\\n\
\\\n\
    }\\n\
\\\n\
  },\\n\
\\\n\
\\n\
\\\n\
  // events\\n\
\\\n\
  inputChange: function (e) {\\n\
\\\n\
    this.setState({input: e.target.value})\\n\
\\\n\
  },\\n\
\\\n\
\\n\
\\\n\
  stateChange: function (name) {\\n\
\\\n\
    var tags = this.state.value.slice()\\n\
\\\n\
    var nstate = states[name](this.state, this.props)\\n\
\\\n\
    if (!nstate) return\\n\
\\\n\
    this.setState(nstate)\\n\
\\\n\
    if (!nstate.value) return\\n\
\\\n\
    if (!_.isEqual(tags, nstate.value) && this.props.save) {\\n\
\\\n\
      this.props.save(nstate.value, function (tags) {\\n\
\\\n\
        this.setState({value: tags})\\n\
\\\n\
      }.bind(this))\\n\
\\\n\
    }\\n\
\\\n\
  },\\n\
\\\n\
\\n\
\\\n\
  keyDown: keys({\\n\
\\\n\
    'backspace': function (e) {\\n\
\\\n\
      if (this.state.input.length !== 0) return true\\n\
\\\n\
      this.stateChange('backspace')\\n\
\\\n\
    },\\n\
\\\n\
    'escape': function (e) {\\n\
\\\n\
      this.stateChange('blur')\\n\
\\\n\
    },\\n\
\\\n\
    'return': function (e) {\\n\
\\\n\
      this.stateChange('return')\\n\
\\\n\
    },\\n\
\\\n\
    'tab': function (e) {\\n\
\\\n\
      this.stateChange('tab')\\n\
\\\n\
    },\\n\
\\\n\
    'shift tab': function (e) {\\n\
\\\n\
      this.stateChange('shift tab')\\n\
\\\n\
    }\\n\
\\\n\
  }), \\n\
\\\n\
\\n\
\\\n\
  blur: function () {\\n\
\\\n\
    this.stateChange('blur')\\n\
\\\n\
  },\\n\
\\\n\
  focus: function () {\\n\
\\\n\
    this.setState({\\n\
\\\n\
      input: '',\\n\
\\\n\
      focused: true,\\n\
\\\n\
      editing: false\\n\
\\\n\
    })\\n\
\\\n\
  },\\n\
\\\n\
  edit: function (i) {\\n\
\\\n\
    this.setState({\\n\
\\\n\
      input: this.state.value[i],\\n\
\\\n\
      focused: true,\\n\
\\\n\
      editing: i\\n\
\\\n\
    })\\n\
\\\n\
  },\\n\
\\\n\
  remove: function (i) {\\n\
\\\n\
    var tags = this.state.value\\n\
\\\n\
    tags.splice(i, 1)\\n\
\\\n\
    this.setState({\\n\
\\\n\
      input: '',\\n\
\\\n\
      focused: false,\\n\
\\\n\
      editing: false,\\n\
\\\n\
      tags: tags\\n\
\\\n\
    })\\n\
\\\n\
    if (this.props.save) {\\n\
\\\n\
      this.props.save(tags, function (tags) {\\n\
\\\n\
        this.setState({value: tags})\\n\
\\\n\
      }.bind(this))\\n\
\\\n\
    }\\n\
\\\n\
  },\\n\
\\\n\
\\n\
\\\n\
  // and the render!\\n\
\\\n\
  render: function () {\\n\
\\\n\
    var ln = this.state.input.length\\n\
\\\n\
      , children = this.state.value.map(function (tag, i) {\\n\
\\\n\
          return (\\n\
\\\n\
            React.DOM.div( {className:\\\"tag\\\"}, \\n\
\\\n\
              React.DOM.span( {className:\\\"text\\\", onClick:this.edit.bind(this, i)}, tag),\\n\
\\\n\
              React.DOM.div( {className:\\\"remove-tag small-btn\\\",\\n\
\\\n\
              onClick:this.remove.bind(this, i)}, \\\"×\\\")\\n\
\\\n\
            )\\n\
\\\n\
          )\\n\
\\\n\
        }.bind(this))\\n\
\\\n\
\\n\
\\\n\
    if (this.state.focused) {\\n\
\\\n\
      var input = (\\n\
\\\n\
        React.DOM.input( {ref:\\\"input\\\",\\n\
\\\n\
          onBlur:this.blur,\\n\
\\\n\
          style:{\\n\
\\\n\
            width: (ln > 3 ? ln : 3)*7 + 20\\n\
\\\n\
          },\\n\
\\\n\
          onKeyDown:this.keyDown,\\n\
\\\n\
          onChange:this.inputChange,\\n\
\\\n\
          value:this.state.input})\\n\
\\\n\
      )\\n\
\\\n\
\\n\
\\\n\
      if (this.state.editing !== false) {\\n\
\\\n\
        children.splice(this.state.editing, 1, input)\\n\
\\\n\
      } else {\\n\
\\\n\
        children.push(input)\\n\
\\\n\
      }\\n\
\\\n\
    }\\n\
\\\n\
\\n\
\\\n\
    return (\\n\
\\\n\
      React.DOM.div( {className:'tags ' + this.props.className}, \\n\
\\\n\
        children,\\n\
\\\n\
        React.DOM.span( {className:\\\"plus small-btn\\\",\\n\
\\\n\
              style:{display: (this.state.focused && false === this.state.editing) ? 'none' : 'inline-block'},\\n\
\\\n\
              onClick:this.focus}, \\\"+\\\")\\n\
\\\n\
      )\\n\
\\\n\
    )\\n\
\\\n\
  }\\n\
\\\n\
})\\n\
\\\n\
\\n\
\\\n\
module.exports = Tags\\n\
\\\n\
//@ sourceURL=tags/index.js\"\n\
));\n\
require.register(\"tags/states.js\", Function(\"exports, require, module\",\n\
\"\\n\
\\\n\
var _ = require('lodash')\\n\
\\\n\
\\n\
\\\n\
module.exports = {\\n\
\\\n\
  backspace: backspace,\\n\
\\\n\
  blur: blur,\\n\
\\\n\
  'return': return_,\\n\
\\\n\
  'shift tab': shiftTab,\\n\
\\\n\
  tab: tab\\n\
\\\n\
}\\n\
\\\n\
\\n\
\\\n\
function stateMe(cur, state) {\\n\
\\\n\
  var full = _.extend({}, cur, state)\\n\
\\\n\
  if (false !== full.editing) {\\n\
\\\n\
    if (full.editing < 0) state.editing = full.editing = 0\\n\
\\\n\
    if (full.editing > full.value.length - 1) state.editing = full.editing = false\\n\
\\\n\
    if (full.editing !== false) state.input = full.value[state.editing]\\n\
\\\n\
  }\\n\
\\\n\
  return state\\n\
\\\n\
}\\n\
\\\n\
\\n\
\\\n\
function shiftTab(state, props) {\\n\
\\\n\
  var tags = state.value\\n\
\\\n\
  if (state.editing === false) {\\n\
\\\n\
    if (state.input.trim() === '') {\\n\
\\\n\
      return stateMe(state, {\\n\
\\\n\
        editing: state.value.length ? state.value.length - 1 : false,\\n\
\\\n\
      })\\n\
\\\n\
    }\\n\
\\\n\
    tags.push(state.input)\\n\
\\\n\
    return stateMe(state, {\\n\
\\\n\
      value: tags,\\n\
\\\n\
      editing: tags.length - 2\\n\
\\\n\
    })\\n\
\\\n\
  }\\n\
\\\n\
  if (state.input.trim() === '') {\\n\
\\\n\
    if (state.editing > 0)\\n\
\\\n\
      tags.splice(state.editing, 1)\\n\
\\\n\
    else\\n\
\\\n\
      tags[0] = ''\\n\
\\\n\
  } else {\\n\
\\\n\
    tags[state.editing] = state.input\\n\
\\\n\
  }\\n\
\\\n\
  if (state.editing === 0 && props && props.prev && props.prev()) {\\n\
\\\n\
    return {focused: false, value: tags, input: ''}\\n\
\\\n\
  }\\n\
\\\n\
  return stateMe(state, {\\n\
\\\n\
    value: tags,\\n\
\\\n\
    editing: state.editing - 1\\n\
\\\n\
  })\\n\
\\\n\
}\\n\
\\\n\
\\n\
\\\n\
function tab(state, props) {\\n\
\\\n\
  var tags = state.value\\n\
\\\n\
  if (state.editing === false) {\\n\
\\\n\
    if (state.input.trim() === '') {\\n\
\\\n\
      if (props && props.next && props.next()) {\\n\
\\\n\
        return {focused: false, input: ''}\\n\
\\\n\
      }\\n\
\\\n\
      return\\n\
\\\n\
    }\\n\
\\\n\
    tags.push(state.input)\\n\
\\\n\
    return {\\n\
\\\n\
      value: tags,\\n\
\\\n\
      input: ''\\n\
\\\n\
    }\\n\
\\\n\
  }\\n\
\\\n\
  if (state.input.trim() === '') {\\n\
\\\n\
    tags.splice(state.editing, 1)\\n\
\\\n\
  } else {\\n\
\\\n\
    tags[state.editing] = state.input\\n\
\\\n\
    state.editing += 1\\n\
\\\n\
  }\\n\
\\\n\
  return stateMe(state, {\\n\
\\\n\
    value: tags,\\n\
\\\n\
    editing: state.editing,\\n\
\\\n\
    input: ''\\n\
\\\n\
  })\\n\
\\\n\
}\\n\
\\\n\
\\n\
\\\n\
function backspace(state) {\\n\
\\\n\
  var editing = state.editing\\n\
\\\n\
    , tags = state.value\\n\
\\\n\
  if (editing === false) {\\n\
\\\n\
    if (tags.length > 0) {\\n\
\\\n\
      editing = tags.length - 1\\n\
\\\n\
    } else {\\n\
\\\n\
      return\\n\
\\\n\
    }\\n\
\\\n\
  } else if (editing > 0) {\\n\
\\\n\
    tags.splice(editing, 1)\\n\
\\\n\
      editing -= 1\\n\
\\\n\
  } else {\\n\
\\\n\
    return\\n\
\\\n\
  }\\n\
\\\n\
  return stateMe(state, {\\n\
\\\n\
    value: tags,\\n\
\\\n\
    editing: editing\\n\
\\\n\
  })\\n\
\\\n\
}\\n\
\\\n\
\\n\
\\\n\
function return_(state) {\\n\
\\\n\
  var tags = state.value\\n\
\\\n\
  if (state.editing !== false) {\\n\
\\\n\
    tags[state.editing] = state.input\\n\
\\\n\
  } else {\\n\
\\\n\
    tags.push(state.input)\\n\
\\\n\
  }\\n\
\\\n\
  return {\\n\
\\\n\
    value: tags,\\n\
\\\n\
    input: '',\\n\
\\\n\
    editing: false\\n\
\\\n\
  }\\n\
\\\n\
}\\n\
\\\n\
\\n\
\\\n\
function blur(state) {\\n\
\\\n\
  if (state.editing === false) {\\n\
\\\n\
    if (state.input.trim() === '') {\\n\
\\\n\
      return {focused: false, input: ''}\\n\
\\\n\
    }\\n\
\\\n\
    return {\\n\
\\\n\
      value: state.value.concat(state.input),\\n\
\\\n\
      focused: false,\\n\
\\\n\
      input: ''\\n\
\\\n\
    }\\n\
\\\n\
  }\\n\
\\\n\
  var tags = state.value\\n\
\\\n\
  if (state.input.trim() === '') {\\n\
\\\n\
    tags.splice(state.editing, 1)\\n\
\\\n\
  } else {\\n\
\\\n\
    tags[state.editing] = state.input\\n\
\\\n\
  }\\n\
\\\n\
  return {\\n\
\\\n\
    value: tags,\\n\
\\\n\
    focused: false,\\n\
\\\n\
    editing: false,\\n\
\\\n\
    input: ''\\n\
\\\n\
  }\\n\
\\\n\
}\\n\
\\\n\
\\n\
\\\n\
//@ sourceURL=tags/states.js\"\n\
));\n\
\n\
\n\
\n\
\n\
require.alias(\"lodash-lodash/index.js\", \"tags/deps/lodash/index.js\");\n\
require.alias(\"lodash-lodash/dist/lodash.compat.js\", \"tags/deps/lodash/dist/lodash.compat.js\");\n\
require.alias(\"lodash-lodash/index.js\", \"lodash/index.js\");\n\
\n\
require.alias(\"notablemind-keys/index.js\", \"tags/deps/keys/index.js\");\n\
require.alias(\"notablemind-keys/index.js\", \"tags/deps/keys/index.js\");\n\
require.alias(\"notablemind-keys/index.js\", \"keys/index.js\");\n\
require.alias(\"notablemind-keys/index.js\", \"notablemind-keys/index.js\");\n\
require.alias(\"tags/index.js\", \"tags/index.js\");//@ sourceURL=tags/index.js"
));
require.register("tags/states.js", Function("exports, require, module",
"\n\
var _ = require('lodash')\n\
\n\
module.exports = {\n\
  backspace: backspace,\n\
  blur: blur,\n\
  'return': return_,\n\
  'shift tab': shiftTab,\n\
  tab: tab\n\
}\n\
\n\
function stateMe(cur, state) {\n\
  var full = _.extend({}, cur, state)\n\
  if (false !== full.editing) {\n\
    if (full.editing < 0) state.editing = full.editing = 0\n\
    if (full.editing > full.value.length - 1) state.editing = full.editing = false\n\
    if (full.editing !== false) state.input = full.value[state.editing]\n\
  }\n\
  return state\n\
}\n\
\n\
function shiftTab(state, props) {\n\
  var tags = state.value\n\
  if (state.editing === false) {\n\
    if (state.input.trim() === '') {\n\
      return stateMe(state, {\n\
        editing: state.value.length ? state.value.length - 1 : false,\n\
      })\n\
    }\n\
    tags.push(state.input)\n\
    return stateMe(state, {\n\
      value: tags,\n\
      editing: tags.length - 2\n\
    })\n\
  }\n\
  if (state.input.trim() === '') {\n\
    if (state.editing > 0)\n\
      tags.splice(state.editing, 1)\n\
    else\n\
      tags[0] = ''\n\
  } else {\n\
    tags[state.editing] = state.input\n\
  }\n\
  if (state.editing === 0 && props && props.prev && props.prev()) {\n\
    return {focused: false, value: tags, input: ''}\n\
  }\n\
  return stateMe(state, {\n\
    value: tags,\n\
    editing: state.editing - 1\n\
  })\n\
}\n\
\n\
function tab(state, props) {\n\
  var tags = state.value\n\
  if (state.editing === false) {\n\
    if (state.input.trim() === '') {\n\
      if (props && props.next && props.next()) {\n\
        return {focused: false, input: ''}\n\
      }\n\
      return\n\
    }\n\
    tags.push(state.input)\n\
    return {\n\
      value: tags,\n\
      input: ''\n\
    }\n\
  }\n\
  if (state.input.trim() === '') {\n\
    tags.splice(state.editing, 1)\n\
  } else {\n\
    tags[state.editing] = state.input\n\
    state.editing += 1\n\
  }\n\
  return stateMe(state, {\n\
    value: tags,\n\
    editing: state.editing,\n\
    input: ''\n\
  })\n\
}\n\
\n\
function backspace(state) {\n\
  var editing = state.editing\n\
    , tags = state.value\n\
  if (editing === false) {\n\
    if (tags.length > 0) {\n\
      editing = tags.length - 1\n\
    } else {\n\
      return\n\
    }\n\
  } else if (editing > 0) {\n\
    tags.splice(editing, 1)\n\
      editing -= 1\n\
  } else {\n\
    return\n\
  }\n\
  return stateMe(state, {\n\
    value: tags,\n\
    editing: editing\n\
  })\n\
}\n\
\n\
function return_(state) {\n\
  var tags = state.value\n\
  if (state.editing !== false) {\n\
    tags[state.editing] = state.input\n\
  } else {\n\
    tags.push(state.input)\n\
  }\n\
  return {\n\
    value: tags,\n\
    input: '',\n\
    editing: false\n\
  }\n\
}\n\
\n\
function blur(state) {\n\
  if (state.editing === false) {\n\
    if (state.input.trim() === '') {\n\
      return {focused: false, input: ''}\n\
    }\n\
    return {\n\
      value: state.value.concat(state.input),\n\
      focused: false,\n\
      input: ''\n\
    }\n\
  }\n\
  var tags = state.value\n\
  if (state.input.trim() === '') {\n\
    tags.splice(state.editing, 1)\n\
  } else {\n\
    tags[state.editing] = state.input\n\
  }\n\
  return {\n\
    value: tags,\n\
    focused: false,\n\
    editing: false,\n\
    input: ''\n\
  }\n\
}\n\
\n\
//@ sourceURL=tags/states.js"
));




require.alias("lodash-lodash/index.js", "tags/deps/lodash/index.js");
require.alias("lodash-lodash/dist/lodash.compat.js", "tags/deps/lodash/dist/lodash.compat.js");
require.alias("lodash-lodash/index.js", "lodash/index.js");

require.alias("notablemind-keys/index.js", "tags/deps/keys/index.js");
require.alias("notablemind-keys/index.js", "tags/deps/keys/index.js");
require.alias("notablemind-keys/index.js", "keys/index.js");
require.alias("notablemind-keys/index.js", "notablemind-keys/index.js");
require.alias("tags/index.js", "tags/index.js");