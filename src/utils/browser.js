/**
 * @returns {boolean}
 */
export function isBrowserSafari () {
  return /^((?!chrome|android|crios|fxios).)*safari/i.test( navigator.userAgent );
}
