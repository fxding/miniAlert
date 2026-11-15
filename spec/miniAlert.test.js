import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import MiniAlert from '../src/miniAlert.js';

describe('MiniAlert', () => {
  let element;

  beforeEach(() => {
    element = document.createElement('div');
    element.className = 'mini-alert';
    element.innerHTML = '<h2>Title</h2><p>Some text</p>';
    document.body.appendChild(element);
  });

  afterEach(() => {
    if (element && element.parentNode) element.parentNode.removeChild(element);
  });

  describe('availability', () => {
    it('should be a constructor', () => {
      expect(typeof MiniAlert).toBe('function');
    });

    it('should expose defaults', () => {
      expect(MiniAlert.defaults).toBeDefined();
      expect(MiniAlert.defaults.text).toBe('×');
      expect(MiniAlert.defaults.position).toBe('before');
      expect(MiniAlert.defaults.effect).toBe('basic');
    });
  });

  describe('create()', () => {
    it('should create an instance and store it on the element', () => {
      var inst = MiniAlert.create(element);
      expect(inst).toBeInstanceOf(MiniAlert);
      expect(element._miniAlert).toBe(inst);
    });

    it('should return existing instance on re-create', () => {
      var inst1 = MiniAlert.create(element);
      var inst2 = MiniAlert.create(element);
      expect(inst1).toBe(inst2);
    });

    it('should support selector strings', () => {
      element.id = 'test-alert';
      var instances = MiniAlert.create('#test-alert');
      expect(instances.length).toBe(1);
      expect(instances[0]).toBeInstanceOf(MiniAlert);
    });
  });

  describe('button', () => {
    it('should add a close button', () => {
      var inst = new MiniAlert(element);
      expect(inst.button).toBeTruthy();
      expect(inst.button.tagName).toBe('BUTTON');
    });

    it('should prepend button by default (position: before)', () => {
      new MiniAlert(element);
      var btn = element.querySelector('button');
      expect(btn.nextSibling).toBe(element.querySelector('h2'));
    });

    it('should append button when position is after', () => {
      new MiniAlert(element, { position: 'after' });
      var btn = element.querySelector('button');
      expect(btn.previousSibling.textContent).toContain('Some text');
    });

    it('should use custom text', () => {
      new MiniAlert(element, { text: 'close' });
      expect(element.querySelector('button').textContent).toBe('close');
    });

    it('should use custom css class', () => {
      new MiniAlert(element, { cssClass: 'hide' });
      expect(element.querySelector('button').className).toBe('hide');
    });
  });

  describe('accessibility', () => {
    it('should set role="alert" on the element', () => {
      new MiniAlert(element);
      expect(element.getAttribute('role')).toBe('alert');
    });

    it('should set aria-label on the close button', () => {
      new MiniAlert(element, { ariaLabel: 'Dismiss' });
      expect(element.querySelector('button').getAttribute('aria-label')).toBe('Dismiss');
    });

    it('should use default aria-label', () => {
      new MiniAlert(element);
      expect(element.querySelector('button').getAttribute('aria-label')).toBe('Close');
    });
  });

  describe('state', () => {
    it('should start in loading then set to loaded', () => {
      var inst = new MiniAlert(element);
      expect(inst.getState()).toBe('loaded');
    });

    it('should transition to hiding then hidden on hide', () => {
      var inst = new MiniAlert(element, { effect: 'basic' });
      inst.hide();
      expect(inst.getState()).toBe('hidden');
    });

    it('should not hide twice', () => {
      var inst = new MiniAlert(element, { effect: 'basic' });
      inst.hide();
      expect(inst.getState()).toBe('hidden');
      inst.hide();
      expect(inst.getState()).toBe('hidden');
    });
  });

  describe('callbacks', () => {
    it('should call onLoad on init', () => {
      var spy = vi.fn();
      var inst = new MiniAlert(element, { onLoad: spy });
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0][0]).toBe(element);
      expect(spy.mock.calls[0][1]).toBe(inst.button);
    });

    it('should call onHide when hide() is called', () => {
      var spy = vi.fn();
      var inst = new MiniAlert(element, { effect: 'basic', onHide: spy });
      expect(spy).not.toHaveBeenCalled();
      inst.hide();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should call onHidden after element is removed', () => {
      var spy = vi.fn();
      var inst = new MiniAlert(element, { effect: 'basic', onHidden: spy });
      inst.hide();
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0].length).toBe(0);
    });
  });

  describe('destroy()', () => {
    it('should remove the button and clean up', () => {
      var inst = new MiniAlert(element);
      expect(element.querySelector('button')).toBeTruthy();
      inst.destroy();
      expect(element.querySelector('button')).toBeNull();
      expect(element._miniAlert).toBeUndefined();
    });

    it('should clear auto-dismiss timer', () => {
      var inst = new MiniAlert(element, { autoDismiss: true, timeout: 999999 });
      inst.destroy();
      expect(inst._timeoutId).toBeNull();
    });
  });

  describe('show() (dynamic creation)', () => {
    it('should create and append a new alert to the DOM', () => {
      var inst = MiniAlert.show({
        title: 'Test Title',
        message: 'Test Message',
        container: 'body'
      });
      expect(inst).toBeInstanceOf(MiniAlert);
      expect(inst.element.querySelector('h2').textContent).toBe('Test Title');
      expect(inst.element.querySelector('p').textContent).toBe('Test Message');
      inst.destroy();
    });
  });
});
