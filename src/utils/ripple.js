import { isTouchEventsSupported, isTransformSupported } from './browser';

function style (el, value) {
  el.style['transform'] = value;
  el.style['webkitTransform'] = value;
}

const rippleAttribute = 'data-ripple';

const ripple = {
  show: (e, el, { value = {} } = {}) => {
    if (el.getAttribute(rippleAttribute) !== 'true') {
      return;
    }

    const container = document.createElement('span');
    const animation = document.createElement('span');

    container.appendChild(animation);
    container.className = 'telechart-ripple__container';

    const size = el.clientWidth > el.clientHeight
      ? el.clientWidth
      : el.clientHeight;
    animation.className = 'telechart-ripple__animation';
    animation.style.width = `${size * (value.center ? 1 : 2)}px`;
    animation.style.height = animation.style.width;

    el.appendChild(container);

    const computed = window.getComputedStyle(el);
    if (computed.position !== 'absolute' &&
      computed.position !== 'fixed') {
      el.style.position = 'relative';
    }

    const offset = el.getBoundingClientRect();
    const x = value.center ? '50%' : `${e.clientX - offset.left}px`;
    const y = value.center ? '50%' : `${e.clientY - offset.top}px`;

    animation.classList.add('telechart-ripple__animation_enter');
    animation.classList.add('telechart-ripple__animation_visible');
    style(animation, `translate(-50%, -50%) translate(${x}, ${y}) scale3d(0.01,0.01,0.01)`);
    animation.dataset.activated = Date.now();

    setTimeout(() => {
      animation.classList.remove('telechart-ripple__animation_enter');
      style(animation, `translate(-50%, -50%) translate(${x}, ${y})  scale3d(0.99,0.99,0.99)`);
    }, 0);
  },

  hide: (el) => {
    if (el.getAttribute(rippleAttribute) !== 'true') {
      return;
    }

    const ripples = el.getElementsByClassName('telechart-ripple__animation');

    if (ripples.length === 0) {
      return;
    }

    const animation = ripples[ripples.length - 1];
    const diff = Date.now() - Number(animation.dataset.activated);
    let delay = 400 - diff;

    delay = delay < 0 ? 0 : delay;

    setTimeout(() => {
      animation.classList.remove('telechart-ripple__animation_visible');

      setTimeout(() => {
        // Need to figure out a new way to do this
        try {
          if (ripples.length < 1) {
            el.style.position = null;
          }
          animation.parentNode && el.removeChild(animation.parentNode);
        } catch (e) {}
      }, 300);
    }, delay);
  }
};

/**
 * @param el
 * @param binding
 */
export function attachRipple (el, binding) {
  if (!isTransformSupported) {
    return;
  }

  el.setAttribute( rippleAttribute, true );

  if (isTouchEventsSupported()) {
    el.addEventListener('touchend', () => ripple.hide(el), false);
    el.addEventListener('touchcancel', () => ripple.hide(el), false);
  }

  el.addEventListener('mousedown', e => ripple.show(e, el, binding), false);
  el.addEventListener('mouseup', () => ripple.hide(el), false);
  el.addEventListener('mouseleave', () => ripple.hide(el), false);
  el.addEventListener('dragstart', () => ripple.hide(el), false);
}

/**
 * @param el
 * @param binding
 */
export function detachRipple (el, binding) {
  el.removeEventListener('touchstart', e => ripple.show(e, el, binding), false);
  el.removeEventListener('mousedown', e => ripple.show(e, el, binding), false);
  el.removeEventListener('touchend', () => ripple.hide(el), false);
  el.removeEventListener('touchcancel', () => ripple.hide(el), false);
  el.removeEventListener('mouseup', () => ripple.hide(el), false);
  el.removeEventListener('mouseleave', () => ripple.hide(el), false);
  el.removeEventListener('dragstart', () => ripple.hide(el), false);
}
