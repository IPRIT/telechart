import { EventEmitter } from '../lib/EventEmitter';

export class Chart extends EventEmitter {

  /**
   * @type {SvgRenderer}
   * @private
   */
  _renderer = null;

  /**
   * @type {Object}
   * @private
   */
  _chartOptions = null;

  /**
   * @type {number}
   * @private
   */
  _height = 250;

  /**
   * @param {SvgRenderer} renderer
   * @param {Object} options
   */
  constructor (renderer, options = {}) {
    super();

    this._renderer = renderer;
    this._chartOptions = options;

    this._initialize();
  }

  /**
   * @private
   */
  _initialize () {
    this._createSeries();
  }

  _createSeries () {

  }
}
