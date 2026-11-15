# miniAlert

[![CI](https://github.com/fxding/miniAlert/actions/workflows/ci.yml/badge.svg)](https://github.com/fxding/miniAlert/actions/workflows/ci.yml)

A lightweight, dependency-free JavaScript alert notification plugin. Add dismissible alert messages to your page with smooth animations, accessibility support, and zero dependencies.

## Version

v2.0.0

## Features

- **Zero dependencies** — no jQuery, pure vanilla JS (~4 KB minified)
- **Accessible** — `role="alert"`, `aria-label`, keyboard-focusable close button
- **Smooth animations** — CSS transitions for `fade`, `slide`, and `basic` effects
- **Easing support** — configurable `easing` option (e.g. `ease-in`, `ease-out`, `cubic-bezier(...)`)
- **Auto-dismiss** — set `autoDismiss: true` with a `timeout` to auto-close
- **Public API** — `hide()`, `show()`, `destroy()`, `getState()`
- **Dynamic creation** — `MiniAlert.show({ title, message, ... })` creates alerts on the fly
- **CSS variables** — customizable via `--mini-alert-*` custom properties
- **Semantic modifier classes** — `mini-alert--info`, `--warning`, `--error`, `--success`
- **Event cleanup** — listeners are properly removed to prevent memory leaks
- **UMD + ESM builds** — works via `<script>`, CommonJS, or ES module import

## Installation

```bash
npm install mini-alert
```

Or include directly:

```html
<link rel="stylesheet" href="css/miniAlert.css">
<script src="dist/miniAlert.umd.js"></script>
```

## Usage

```html
<div class="mini-alert mini-alert--info">
  <h2>Information</h2>
  <p>Read this before dismissing.</p>
</div>

<script>
  // Initialize on existing elements
  MiniAlert.create('.mini-alert');

  // With options
  MiniAlert.create('#my-alert', {
    text: 'close',
    position: 'after',
    effect: 'fade',
    duration: 300,
    easing: 'ease-in-out',
    autoDismiss: true,
    timeout: 5000,
    onLoad: function (element, button) { /* ... */ },
    onHide: function (element, button) { /* ... */ },
    onHidden: function () { /* ... */ }
  });

  // Dynamic creation
  MiniAlert.show({
    title: 'Saved!',
    message: 'Your changes have been saved.',
    container: '#main',
    effect: 'slide',
    autoDismiss: true,
    timeout: 3000
  });
</script>
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `text` | `string` | `'×'` | Close button text |
| `cssClass` | `string` | `'close'` | Close button CSS class |
| `position` | `'before' \| 'after'` | `'before'` | Button position relative to content |
| `effect` | `'basic' \| 'fade' \| 'slide'` | `'basic'` | Hide animation effect |
| `duration` | `number` | `200` | Animation duration in ms |
| `easing` | `string` | `'ease'` | CSS transition timing function |
| `autoDismiss` | `boolean` | `false` | Auto-close after timeout |
| `timeout` | `number` | `0` | Auto-dismiss delay in ms |
| `ariaLabel` | `string` | `'Close'` | aria-label for close button |
| `onLoad` | `function` | `noop` | Called after button is added |
| `onHide` | `function` | `noop` | Called when hide begins |
| `onHidden` | `function` | `noop` | Called after element is removed |

## API

- `MiniAlert.create(element, options)` — Initialize on an element (or selector). Returns instance. Prevents double-init.
- `MiniAlert.show(options)` — Dynamically create and show an alert. Returns instance.
- `instance.hide()` — Hide the alert with animation.
- `instance.show()` — Restore a previously hidden alert.
- `instance.destroy()` — Remove button, clean up listeners, remove instance reference.
- `instance.getState()` — Returns current state: `'loaded'`, `'hiding'`, `'hidden'`.

## CSS Customization

```css
.mini-alert {
  --mini-alert-radius: 12px;
  --mini-alert-padding: 10px 24px;
  --mini-alert-margin: 16px 0;
}
```

## Development

```bash
npm install
npm test          # run tests (Vitest + jsdom)
npm run build     # build UMD + ESM + minified
```

## Bug Tracker

[Issues on GitHub](https://github.com/fxding/miniAlert/issues)

## License

MIT
