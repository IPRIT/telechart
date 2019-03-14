import { ensureNumber } from "./index";

/**
 * Returns path segments
 *
 * @param {string} pathText
 * @return {Array<Array<Array<number>>>}
 */
export function parseSimplePathText (pathText) {
  const parseRegex = /([ML])\s?(-?\d+\.?(?:\d+)?)\s(-?\d+\.?(?:\d+)?)/gi;

  const segments = [];
  let m;

  while ((m = parseRegex.exec( pathText )) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === parseRegex.lastIndex) {
      parseRegex.lastIndex++;
    }

    const type = m[ 1 ];
    const x = ensureNumber( m[2] );
    const y = ensureNumber( m[3] );

    if (type === 'm' || !segments.length) {
      segments.push([ [ x, y ] ]);
    } else {
      const lastSegment = segments[ segments.length - 1 ];
      lastSegment.push([ x, y ]);
    }
  }

  return segments;
}

/**
 * @param {Array<Array<Array<number>>>} segments
 * @return {string}
 */
export function segmentsToPathText (segments) {
  let result = '';

  for (let i = 0; i < segments.length; ++i) {
    result += 'M ';
    for (let j = 0; j < segments[ i ].length; ++j) {
      const coordinates = segments[ i ][ j ];
      if (j !== 0) {
        result += 'L ';
      }
      result += coordinates.join(' ') + ' ';
    }
  }

  return result;
}
