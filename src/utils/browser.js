/**
 * @returns {boolean}
 */
export function isBrowserSafari () {
  return /^((?!chrome|android|crios|fxios).)*safari/i.test( navigator.userAgent );
}

/**
 * @return {boolean}
 */
export function isTouchEventsSupported () {
  return 'ontouchstart' in document.documentElement;
}

let passiveSupported = false;

try {
  const options = {
    get passive() { // This function will be called when the browser
      //   attempts to access the passive property.
      passiveSupported = true;
    }
  };

  window.addEventListener('test', options, options);
  window.removeEventListener('test', options, options);
} catch(err) {
  passiveSupported = false;
}

export const isPassiveEventSupported = passiveSupported;
export const passiveIfSupported = passiveSupported ? { passive: true } : false;
export const passiveIfSupportedFn = (passive = true) => passiveSupported ? { passive } : false;

/**
 * @return {*}
 */
export function getSupportedTransform () {
  const prefixes = 'transform WebkitTransform MozTransform OTransform msTransform'.split(' ');
  const div = document.createElement('div');
  for (let i = 0; i < prefixes.length; ++i) {
    if (div && div.style[prefixes[i]] !== undefined) {
      return prefixes[i];
    }
  }
  return false;
}

export const isTransformSupported = !!getSupportedTransform();
