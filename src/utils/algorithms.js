/**
 * @param {Array<number>} array
 * @return {number}
 */
export function arrayMinIndex (array) {
  let minIndex = 0;
  for (let i = 1; i < array.length; ++i) {
    if (array[ minIndex ] > array[ i ]) {
      minIndex = i;
    }
  }
  return minIndex;
}

/**
 * @param {Array<number>} array
 * @return {number}
 */
export function arrayMin (array) {
  return array[ arrayMinIndex( array ) ];
}

/**
 * @param {Array<number>} array
 * @return {number}
 */
export function arrayMaxIndex (array) {
  let maxIndex = 0;
  for (let i = 1; i < array.length; ++i) {
    if (array[ maxIndex ] < array[ i ]) {
      maxIndex = i;
    }
  }
  return maxIndex;
}

/**
 * @param {Array<number>} array
 * @return {number}
 */
export function arrayMax (array) {
  return array[ arrayMaxIndex( array ) ];
}

/**
 * @param {Array<number>} array
 * @return {number}
 */
export function arraySum (array) {
  let length = array.length;
  let sum = 0;

  while (length--) {
    sum += array[ length ];
  }

  return sum;
}

/**
 * @param {Array<number>} array
 * @return {number}
 */
export function arrayAvg (array) {
  let length = array.length;
  let result = arraySum( array );

  if (length) {
    result = result / length;
  }

  return result;
}
