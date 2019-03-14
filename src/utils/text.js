/**
 * @param {string} text
 * @return {string}
 */
export function capitalize (text) {
  if (!text) {
    return '';
  }
  text = String( text );
  return text[ 0 ].toUpperCase() + text.substr(1);
}

/**
 * @param {Object} styleObject
 * @returns {string}
 */
export function cssText (styleObject) {
  return Object.keys( styleObject ).reduce((css, prop) => {
    return `${css ? css + ' ' : ''}${camelToKebabCase( prop )}: ${styleObject[ prop ]};`;
  }, '');
}

/**
 * @param {string} text
 * @returns {string}
 */
export function camelToKebabCase (text) {
  if (!text) {
    return '';
  }
  text = String( text );
  return (
    text[ 0 ].toLowerCase() + text.substr( 1 )
  ).replace( /([A-Z])/g, '-$1' ).toLowerCase();
}
