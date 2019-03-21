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
