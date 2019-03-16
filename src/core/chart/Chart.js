import { EventEmitter } from '../../lib/EventEmitter';
import { ChartTypes } from './ChartTypes';
import { Series } from '../series/Series';
import { clampNumber, TimeRanges } from '../../utils';

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
  _options = null;

  /**
   * @type {number}
   * @private
   */
  _height = 250;

  /**
   * @type {Array<number>}
   */
  _xAxis = [];

  /**
   * @type {Array<Series>}
   * @private
   */
  _series = [];

  /**
   * @type {Array<number>}
   * @private
   */
  _range = [];

  /**
   * @param {SvgRenderer} renderer
   * @param {Object} options
   */
  constructor (renderer, options = {}) {
    super();

    this._renderer = renderer;
    this._options = options;

    this._initialize();
  }

  /**
   * @param {number} minX
   * @param {number} maxX
   */
  setRange (minX, maxX) {
    const xAxis = this._xAxis;

    const actualMinX = xAxis[ 0 ];
    const actualMaxX = xAxis[ xAxis.length - 1 ];

    minX = Math.max( minX, actualMinX );
    maxX = Math.max( maxX, actualMaxX );

    this._range = [ minX, maxX ];
  }

  /**
   * @return {Array<number>}
   */
  get range () {
    return this._range;
  }

  /**
   * @private
   */
  _initialize () {
    this._createSeries();
  }

  /**
   * @private
   */
  _createSeries () {
    const {
      series,
      seriesOptions: options = {}
    } = this._options || {};

    const {
      columns,
      types,
      colors,
      names
    } = series;

    const xAxisIndex = columns.findIndex(column => {
      return types[ column[ 0 ] ] === ChartTypes.x;
    });
    const xAxis = this._xAxis = columns[ xAxisIndex ].slice( 1 );

    let yAxes = columns.slice(); // copy an array to change later
    yAxes.splice( xAxisIndex, 1 ); // remove x axis from the array

    for (let i = 0; i < yAxes.length; ++i) {
      const yAxis = yAxes[ i ];
      const label = yAxis.shift();
      const type = types[ label ];
      const color = colors[ label ];
      const name = names[ label ];

      const settings = {
        xAxis, yAxis,
        label, type,
        color, name,
        options
      };

      this._series.push(
        new Series( this._renderer, settings )
      );
    }

    const maxX = xAxis[ xAxis.length - 1 ];
    const twoWeeks = 2 * TimeRanges.week;

    // set initial range
    this.setRange( maxX - twoWeeks, maxX );
  }
}
