import { Point } from './Point';
import { arrayAvg } from '../../utils/index';

export class PointGroup extends Point {

  /**
   * @type {Array<Point>}
   * @private
   */
  _pointsGroup = [];

  /**
   * @type {arrayAvg}
   * @private
   */
  _approximationFn = arrayAvg;

  /**
   * @param {number} x
   * @param {number} y
   * @param {Array<Point>} points
   */
  constructor (x = 0, y = 0, points = []) {
    super( x, y );
    this.setPointsGroup( points );
  }

  /**
   * @param {Array<Point>} points
   */
  setPointsGroup (points) {
    this._pointsGroup = points;
    this._approximate();
  }

  /**
   * @private
   */
  _approximate () {
    this.setX( this._approximateX() );
    this.setY( this._approximateY() );
  }

  /**
   * @return {number}
   * @private
   */
  _approximateX () {
    return this._approximationFn(
      this._pointsGroup.map(p => p.x)
    );
  }

  /**
   * @return {number}
   * @private
   */
  _approximateY () {
    return this._approximationFn(
      this._pointsGroup.map(p => p.y)
    );
  }
}
