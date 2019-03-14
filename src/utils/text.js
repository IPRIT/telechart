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
