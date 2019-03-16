import { EventEmitter } from '../misc/EventEmitter';
import { ChartTypes } from './ChartTypes';
import { Series } from '../series/Series';
import { binarySearchIndexes, isDate, TimeRanges } from '../../utils';

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
   * @type {Element}
   * @private
   */
  _seriesGroup = null;

  /**
   * @type {Array<number>}
   * @private
   */
  _viewportRange = [];

  /**
   * @type {Array<number>}
   * @private
   */
  _viewportRangeIndexes = [];

  /**
   * @type {number}
   * @private
   */
  _globalMinY = 0;

  /**
   * @type {number}
   * @private
   */
  _globalMaxY = 0;

  /**
   * @type {number}
   * @private
   */
  _localMinY = 0;

  /**
   * @type {number}
   * @private
   */
  _localMaxY = 0;

  /**
   * @type {number}
   * @private
   */
  _localYScale = 1;

  /**
   * @type {number}
   * @private
   */
  _currentYScale = null;

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
   * @param {number} deltaTime
   */
  update (deltaTime) {
  }

  /**
   * Draws initial chart
   */
  firstRender () {
    this._eachSeries(line => line.firstRender());
  }

  /**
   * @param {number|Date} minX
   * @param {number|Date} maxX
   */
  setRange (minX, maxX) {
    const xAxis = this._xAxis;

    const actualMinX = xAxis[ 0 ];
    const actualMaxX = xAxis[ xAxis.length - 1 ];

    if (isDate( minX )) {
      minX = minX.getTime();
    }
    if (isDate( maxX )) {
      maxX = maxX.getTime();
    }

    minX = Math.max( minX, actualMinX );
    maxX = Math.min( maxX, actualMaxX );

    this._viewportRange = [ minX, maxX ];

    // recompute points boundaries
    this._updateViewportIndexes();

    this._eachSeries(line => {
      // set X viewport interval for line
      line.setViewportRange( this._viewportRange, this._viewportRangeIndexes );

      // slice only visible points
      line.updateViewportPoints();
    });

    // update global and local extremes
    this._updateExtremes();

    // update scales for each line
    this._updateSeriesScale();
  }

  /**
   * @return {Array<number>}
   */
  get viewportRange () {
    return this._viewportRange;
  }

  /**
   * @return {Array<number>}
   */
  get viewportRangeIndexes () {
    return this._viewportRangeIndexes;
  }

  /**
   * @return {number}
   */
  get globalExtremeDifference () {
    return this._globalMaxY - this._globalMinY;
  }

  /**
   * @return {number}
   */
  get localExtremeDifference () {
    return this._localMaxY - this._localMinY;
  }

  /**
   * @private
   */
  _initialize () {
    this._createSeriesGroup();
    this._createSeries();
  }

  /**
   * @private
   */
  _createSeriesGroup () {
    this._seriesGroup = this._renderer.createGroup({
      class: 'telechart-series-group',
      transform: `translate(0, 70) scale(1 1)`
    });
  }

  /**
   * @private
   */
  _createSeries () {
    const {
      series: data,
      seriesOptions: options = {}
    } = this._options || {};

    const {
      columns,
      types,
      colors,
      names
    } = data;

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
        xAxis, yAxis, label, type,
        color, name, options
      };

      const series = new Series( this._renderer, this._seriesGroup, settings );

      series.on('visibleChange', _ => {
        this._onSeriesVisibleChange( series );
      });

      this._series.push( series );
    }

    const minX = xAxis[ 0 ];
    const maxX = xAxis[ xAxis.length - 1 ];
    const initialViewport = Math.floor( ( maxX - minX ) * .25 );

    // set initial range
    this.setRange( maxX - initialViewport, maxX );
  }

  /**
   * @private
   */
  _updateViewportIndexes () {
    const [ rangeStart, rangeEnd ] = this._viewportRange;
    const [ minLowerIndex, minUpperIndex ] = binarySearchIndexes( this._xAxis, rangeStart );
    const [ maxLowerIndex, maxUpperIndex ] = binarySearchIndexes( this._xAxis, rangeEnd );

    this._viewportRangeIndexes = [ minUpperIndex, maxLowerIndex ];
  }

  /**
   * @param {Series} series
   * @private
   */
  _onSeriesVisibleChange (series) {
    // find new extremes and scale
    this._updateExtremes();

    // setup new scale for each line
    this._updateSeriesScale();
  }

  /**
   * @private
   */
  _updateExtremes () {
    let localMinY = 0;
    let localMaxY = 0;
    let globalMinY = 0;
    let globalMaxY = 0;

    this._eachSeries(line => {
      if (!line.isVisible) {
        return;
      }

      if (localMinY > line.localMinY) {
        localMinY = line.localMinY;
      }
      if (localMaxY < line.localMaxY) {
        localMaxY = line.localMaxY;
      }

      if (globalMinY > line.globalMinY) {
        globalMinY = line.globalMinY;
      }
      if (globalMaxY < line.globalMaxY) {
        globalMaxY = line.globalMaxY;
      }
    });

    this._localMinY = localMinY;
    this._localMaxY = localMaxY;

    this._globalMinY = globalMinY;
    this._globalMaxY = globalMaxY;

    this._localYScale = this._computeYScale();

    if (typeof this._currentYScale !== 'number') {
      // set initial scale
      this._currentYScale = this._localYScale;
    }
  }

  /**
   * @private
   */
  _updateSeriesScale () {
    this._eachSeries(line => {
      line.setScale( this._currentYScale, this._localYScale );
    });
  }

  /**
   * @return {number}
   * @private
   */
  _computeYScale () {
    const globalHeight = this.globalExtremeDifference;
    const localHeight = this.localExtremeDifference;

    // prevent dividing by zero
    if (!globalHeight) {
      return 1;
    }

    return localHeight / globalHeight;
  }

  /**
   * @param {Function} fn
   * @private
   */
  _eachSeries (fn = () => {}) {
    for (let i = 0; i < this._series.length; ++i) {
      fn( this._series[ i ] );
    }
  }
}
