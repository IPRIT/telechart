import { objectEachKey } from "./base";

/**
 * @param {string} tagName
 * @param {*} options
 * @param {*} children
 * @param {boolean|string} ns
 * @return {Element}
 */
export function createElement (tagName, options, children, ns = false) {
  const element = ns
    ? document.createElementNS( ns, tagName )
    : document.createElement( tagName );

  if (options.attrs) {
    objectEachKey(options.attrs, key => {
      console.log( options.attrs[ key ] );
      element.setAttribute( key, options.attrs[ key ] );
    });
  }

  if (children || Array.isArray( children )) {
    children = [].concat( children );
    children.forEach(node => element.appendChild( node ));
  }

  return element;
}

/**
 * @param {Element|string} elementOrSelector
 * @return {Element | null}
 */
export function resolveElement (elementOrSelector) {
  if (typeof elementOrSelector === 'string') {
    return document.querySelector( elementOrSelector );
  }
  return elementOrSelector;
}

/**
 * @param {Element} element
 * @return {{top: number, left: number}}
 */
export function getElementOffset (element) {
  if (!element) {
    return { top: 0, left: 0 };
  }

  // Return zeros for disconnected and hidden (display: none) elements
  // Support: IE <= 11 only
  // Running getBoundingClientRect on a
  // disconnected node in IE throws an error
  if (element.getClientRects && !element.getClientRects().length) {
    return { top: 0, left: 0 };
  }

  // Get document-relative position by adding viewport scroll to viewport-relative gBCR
  const rect = element.getBoundingClientRect();
  const win = element.ownerDocument.defaultView;
  return {
    top: rect.top + win.pageYOffset,
    left: rect.left + win.pageXOffset
  };
}

/**
 * @param {Element} targetElement
 * @param {Element} relativeElement
 * @return {{ top: number, left: number }}
 */
export function getElementRelativeOffset (targetElement, relativeElement) {
  const targetOffset = getElementOffset(targetElement);
  const relativeOffset = getElementOffset(relativeElement);

  return {
    top: targetOffset.top - relativeOffset.top + relativeElement.scrollTop,
    left: targetOffset.left - relativeOffset.left + relativeElement.scrollLeft
  };
}

/**
 * @returns {number}
 */
export function getDocumentHeight () {
  return Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.offsetHeight,
    document.body.clientHeight,
    document.documentElement.clientHeight
  );
}

/**
 * @returns {number}
 */
export function getWindowHeight () {
  return window.innerHeight ||
    (document.documentElement || document.body).clientHeight;
}

/**
 * @param {Element} element
 * @returns {number}
 */
export function getElementHeight (element) {
  return element.innerHeight || element.clientHeight;
}

/**
 * @param {Element} element
 * @returns {number}
 */
export function getElementWidth (element) {
  return element.innerWidth || element.clientWidth;
}

/**
 * @param {Element} element
 * @returns {number}
 */
export function getElementScrollHeight (element) {
  return Math.max(
    element.scrollHeight,
    element.offsetHeight,
    element.clientHeight
  );
}

/**
 * @param {Element} element
 * @returns {number}
 */
export function getElementScrollWidth (element) {
  return Math.max(
    element.scrollWidth,
    element.offsetWidth,
    element.clientWidth
  );
}
