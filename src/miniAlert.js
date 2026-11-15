/**
 * miniAlert — A lightweight, dependency-free alert plugin
 * @version 2.0.0
 * @license MIT
 * @see https://github.com/fxding/miniAlert
 */
(function (global, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    global.MiniAlert = factory();
  }
})(typeof window !== 'undefined' ? window : typeof globalThis !== 'undefined' ? globalThis : {}, function () {
  'use strict';

  var DEFAULTS = {
    text: '×',
    cssClass: 'close',
    position: 'before',
    effect: 'basic',
    duration: 200,
    easing: 'ease',
    autoDismiss: false,
    timeout: 0,
    ariaLabel: 'Close',
    onLoad: function () {},
    onHide: function () {},
    onHidden: function () {}
  };

  var STATE = {
    LOADING: 'loading',
    LOADED: 'loaded',
    HIDING: 'hiding',
    HIDDEN: 'hidden'
  };

  function mergeOptions(defaults, options) {
    var result = {};
    for (var k in defaults) {
      if (defaults.hasOwnProperty(k)) result[k] = defaults[k];
    }
    if (options) {
      for (var k2 in options) {
        if (options.hasOwnProperty(k2)) result[k2] = options[k2];
      }
    }
    return result;
  }

  var raf =
    typeof requestAnimationFrame !== 'undefined'
      ? requestAnimationFrame
      : function (cb) { return setTimeout(cb, 0); };

  function MiniAlert(element, options) {
    this.element = element;
    this.defaults = DEFAULTS;
    this.settings = mergeOptions(DEFAULTS, options);
    this.state = '';
    this.button = null;
    this._timeoutId = null;
    this._clickHandler = null;
    this._originalParent = null;
    this._originalNextSibling = null;
    this._init();
  }

  MiniAlert.prototype = {
    constructor: MiniAlert,

    _init: function () {
      this._setState(STATE.LOADING);
      this.element.setAttribute('role', 'alert');
      this._addButton();
      this._bindEvents();
      this._setState(STATE.LOADED);
      this._callCallback('onLoad');
      if (this.settings.autoDismiss && this.settings.timeout > 0) {
        this._startAutoDismiss();
      }
    },

    _setState: function (s) {
      this.state = s;
    },

    getState: function () {
      return this.state;
    },

    getSetting: function (key) {
      return this.settings[key];
    },

    _callCallback: function (name, args) {
      if (typeof this.settings[name] === 'function') {
        this.settings[name].apply(this, args || [this.element, this.button]);
      }
    },

    _addButton: function () {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = this.settings.cssClass;
      btn.textContent = this.settings.text;
      btn.setAttribute('aria-label', this.settings.ariaLabel);

      if (this.settings.position === 'after') {
        this.element.appendChild(btn);
      } else {
        this.element.insertBefore(btn, this.element.firstChild);
      }
      this.button = btn;
    },

    _bindEvents: function () {
      var self = this;
      this._clickHandler = function (e) {
        e.preventDefault();
        self.hide();
      };
      this.button.addEventListener('click', this._clickHandler);
    },

    _startAutoDismiss: function () {
      var self = this;
      this._timeoutId = setTimeout(function () {
        self.hide();
      }, this.settings.timeout);
    },

    hide: function () {
      if (this.state === STATE.HIDING || this.state === STATE.HIDDEN) return;
      if (this._timeoutId) {
        clearTimeout(this._timeoutId);
        this._timeoutId = null;
      }
      this._setState(STATE.HIDING);
      this._callCallback('onHide');

      var self = this;
      var effect = this.settings.effect;

      if (effect === 'fade') {
        this._animate({ opacity: '0' }, this.settings.duration, this.settings.easing, function () {
          self._removeElement();
        });
      } else if (effect === 'slide') {
        var h = this.element.offsetHeight;
        this.element.style.height = h + 'px';
        void this.element.offsetHeight; // force reflow
        this.element.style.overflow = 'hidden';
        this._animate(
          { height: '0', paddingTop: '0', paddingBottom: '0', marginTop: '0', marginBottom: '0', opacity: '0' },
          this.settings.duration,
          this.settings.easing,
          function () { self._removeElement(); }
        );
      } else {
        this._removeElement();
      }
    },

    show: function () {
      if (this.state !== STATE.HIDDEN) return;
      var style = this.element.style;
      style.display = '';
      style.opacity = '';
      style.height = '';
      style.paddingTop = '';
      style.paddingBottom = '';
      style.marginTop = '';
      style.marginBottom = '';
      style.overflow = '';
      style.transition = '';

      if (this._originalParent) {
        if (this._originalNextSibling && this._originalNextSibling.parentNode === this._originalParent) {
          this._originalParent.insertBefore(this.element, this._originalNextSibling);
        } else {
          this._originalParent.appendChild(this.element);
        }
      }
      this._setState(STATE.LOADED);
      this._bindEvents();
    },

    _removeElement: function () {
      this._originalParent = this.element.parentNode;
      this._originalNextSibling = this.element.nextSibling;
      if (this._clickHandler) {
        this.button.removeEventListener('click', this._clickHandler);
        this._clickHandler = null;
      }
      if (this.element.remove) {
        this.element.remove();
      } else if (this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }
      this._setState(STATE.HIDDEN);
      this._callCallback('onHidden', []);
    },

    destroy: function () {
      if (this._timeoutId) {
        clearTimeout(this._timeoutId);
        this._timeoutId = null;
      }
      if (this.button && this._clickHandler) {
        this.button.removeEventListener('click', this._clickHandler);
        this._clickHandler = null;
      }
      if (this.button && this.button.parentNode) {
        this.button.parentNode.removeChild(this.button);
      }
      this.element.removeAttribute('role');
      if (this.element._miniAlert) {
        delete this.element._miniAlert;
      }
      this._setState('');
      this.button = null;
    },

    _animate: function (properties, duration, easing, callback) {
      var el = this.element;
      var style = el.style;
      var propNames = Object.keys(properties);

      style.transition = propNames
        .map(function (p) { return p + ' ' + duration + 'ms ' + easing; })
        .join(', ');

      var self = this;
      raf(function () {
        propNames.forEach(function (p) {
          style[p] = properties[p];
        });

        var done = false;
        var cleanup = function () {
          if (done) return;
          done = true;
          el.removeEventListener('transitionend', cleanup);
          style.transition = '';
          if (callback) callback.call(self);
        };

        if (duration <= 0) {
          cleanup();
          return;
        }
        el.addEventListener('transitionend', cleanup);
        setTimeout(cleanup, duration + 50);
      });
    }
  };

  MiniAlert.create = function (element, options) {
    if (typeof element === 'string') {
      var els = document.querySelectorAll(element);
      var instances = [];
      for (var i = 0; i < els.length; i++) {
        instances.push(MiniAlert.create(els[i], options));
      }
      return instances;
    }
    if (element._miniAlert) {
      return element._miniAlert;
    }
    var instance = new MiniAlert(element, options);
    element._miniAlert = instance;
    return instance;
  };

  MiniAlert.show = function (options) {
    var opts = mergeOptions(DEFAULTS, options);
    var div = document.createElement('div');
    div.className = 'mini-alert';

    if (opts.title) {
      var h2 = document.createElement('h2');
      h2.textContent = opts.title;
      div.appendChild(h2);
    }
    if (opts.message) {
      var p = document.createElement('p');
      p.textContent = opts.message;
      div.appendChild(p);
    }

    var container = opts.container
      ? document.querySelector(opts.container)
      : document.body;
    container.appendChild(div);
    return MiniAlert.create(div, opts);
  };

  MiniAlert.defaults = DEFAULTS;

  return MiniAlert;
});
