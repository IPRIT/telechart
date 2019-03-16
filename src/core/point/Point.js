let POINT_AUTOINCREMENT = 1;

export class Point {

  /**
   * @type {number}
   * @private
   */
  _id = POINT_AUTOINCREMENT++;

  /**
   * @enum 'point' | 'group'
   * @type {string}
   * @private
   */
  _type = 'point';

  /**
   * @type {number}
   * @private
   */
  _x = 0;

  /**
   * @type {number}
   * @private
   */
  _y = 0;

  /**
   * @param {number} x
   * @param {number} y
   */
  constructor (x = 0, y = 0) {
    this._x = x;
    this._y = y;
  }

  /**
   * @param {string} pointType
   */
  setType (pointType = 'point') {
    this._type = pointType;
  }

  /**
   * @param {number} x
   */
  setX (x) {
    this._x = x;
  }

  /**
   * @param {number} y
   */
  setY (y) {
    this._y = y;
  }

  /**
   * @param {number} x
   */
  addX (x) {
    this._x += x;
  }

  /**
   * @param {number} y
   */
  addY (y) {
    this._y += y;
  }

  /**
   * @return {number}
   */
  get id () {
    return this._id;
  }

  /**
   * @returns {number}
   */
  get x () {
    return this._x;
  }

  /**
   * @returns {number}
   */
  get y () {
    return this._y;
  }

  /**
   * @returns {string}
   */
  get type () {
    return this._type;
  }
}
