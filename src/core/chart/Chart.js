import { EventEmitter } from '../misc/EventEmitter';
import { ChartTypes } from './ChartTypes';
import { Series } from '../series/Series';
import { binarySearchIndexes, clampNumber, cssText, isDate, TimeRanges } from '../../utils';
import { Tween, TweenEvents } from '../animation/Tween';

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
  _chartHeight = 250; // chart height will be constant

  /**
   * @type {Array<number>}
   * @private
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
  _viewportLeftPaddingScale = 0;

  /**
   * @type {number}
   * @private
   */
  _viewportRightPaddingScale = 0;

  /**
   * @type {boolean}
   * @private
   */
  _viewportRangeUpdateNeeded = false;

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
  _currentLocalMinY = null;

  /**
   * @type {number}
   * @private
   */
  _currentLocalMaxY = null;

  /**
   * @type {Tween}
   * @private
   */
  _minMaxYAnimation = null;

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
    let extremesUpdated = false;

    if (this._minMaxYAnimation && this._minMaxYAnimation.isRunning) {
      this._minMaxYAnimation.update( deltaTime );

      extremesUpdated = true;
    }

    if (this._viewportRangeUpdateNeeded) {
      this.updateViewportRange();

      this._viewportRangeUpdateNeeded = false;
    }

    this._eachSeries(line => {
      if (extremesUpdated) {
        line.updateViewportPixel();
        line.requestPathUpdate();
      }

      line.update( deltaTime );
    });
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
  setViewportRange (minX, maxX) {
    // recompute X boundaries
    this._setViewportRange( minX, maxX );

    // recompute indexes range
    this._updateViewportIndexes();

    this._eachSeries(line => {
      // set X viewport interval for line
      line.setViewportRange( this._viewportRange, this._viewportRangeIndexes );
    });

    // update global and local extremes
    this._updateExtremes();

    // recompute pixel value
    this._eachSeries(line => {
      line.updateViewportPixel();
    });
  }

  /**
   * Recompute key variables for viewport range
   */
  updateViewportRange () {
    // recompute X boundaries
    this._setViewportRange( this._viewportRange[ 0 ], this._viewportRange[ 1 ], true );

    this._eachSeries(line => {
      // update X viewport interval for line
      line.setViewportRange( this._viewportRange, this._viewportRangeIndexes, false );

      // update X pixel value
      line.updateViewportPixel();
    });
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
   * @return {number}
   */
  get currentLocalExtremeDifference () {
    return this._currentLocalMaxY - this._currentLocalMinY;
  }

  /**
   * @return {number}
   */
  get localMinY () {
    return this._localMinY;
  }

  /**
   * @return {number}
   */
  get localMaxY () {
    return this._localMaxY;
  }

  /**
   * @return {number}
   */
  get currentLocalMinY () {
    return this._currentLocalMinY;
  }

  /**
   * @return {number}
   */
  get currentLocalMaxY () {
    return this._currentLocalMaxY;
  }

  /**
   * @return {number}
   */
  get globalMinY () {
    return this._globalMinY;
  }

  /**
   * @return {number}
   */
  get globalMaxY () {
    return this._globalMaxY;
  }

  /**
   * @return {number}
   */
  get chartWidth () {
    return this._renderer.width;
  }

  /**
   * @return {number}
   */
  get chartHeight () {
    return this._chartHeight;
  }

  /**
   * @return {Tween}
   */
  get minMaxYAnimation () {
    return this._minMaxYAnimation;
  }

  /**
   * @private
   */
  _initialize () {
    this._createSeriesGroup();
    this._createSeries();
    this._addEvents();
    this._setInitialRange();
  }

  /**
   * @private
   */
  _createSeriesGroup () {
    this._seriesGroup = this._renderer.createGroup({
      class: 'telechart-series-group',
      transform: `translate(0, 70) scale(1 1)`
    });

    this._test = this._renderer.createRect(this._renderer.width, '1px', {
      fill: '#ccc',
      y: 1,
      style: cssText({
        shapeRendering: 'crispEdges'
      })
    }, this._seriesGroup);
    this._test2 = this._renderer.createRect(this._renderer.width, '1px', {
      fill: '#ccc',
      y: this.chartHeight / 2,
      style: cssText({
        shapeRendering: 'crispEdges'
      })
    }, this._seriesGroup);
    this._test3 = this._renderer.createRect(this._renderer.width, '1px', {
      fill: '#ccc',
      y: this.chartHeight,
      style: cssText({
        shapeRendering: 'crispEdges'
      })
    }, this._seriesGroup);
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

      // prepare series settings
      const settings = {
        xAxis, yAxis, label, type,
        color, name, options
      };

      // create instance
      const series = new Series( this._renderer, this._seriesGroup, settings );

      // provide context for each series
      series.setChart( this );

      this._series.push( series );
    }
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
   * @private
   */
  _updateExtremes () {
    let localMinY = 0;
    let localMaxY = 0;
    let globalMinY = 0;
    let globalMaxY = 0;

    this._eachSeries(line => {
      // todo: unnecessary
      if (globalMinY > line.globalMinY) {
        globalMinY = line.globalMinY;
      }
      if (globalMaxY < line.globalMaxY) {
        globalMaxY = line.globalMaxY;
      }

      if (!line.isVisible) {
        // filter only visible series
        return;
      }

      if (localMinY > line.localMinY) {
        localMinY = line.localMinY;
      }
      if (localMaxY < line.localMaxY) {
        localMaxY = line.localMaxY;
      }
    });

    let oldLocalMinY = this._localMinY;
    let oldLocalMaxY = this._localMaxY;

    this._localMinY = localMinY;
    this._localMaxY = localMaxY;

    this._globalMinY = globalMinY;
    this._globalMaxY = globalMaxY;

    let updateAnimation = false;

    if (typeof this._currentLocalMinY !== 'number') {
      // set initial local min y
      this._currentLocalMinY = this._localMinY;
    } else if (this._localMinY !== oldLocalMinY) {
      updateAnimation = true;
    }

    if (typeof this._currentLocalMaxY !== 'number') {
      // set initial local max y
      this._currentLocalMaxY = this._localMaxY;
    } else if (this._localMaxY !== oldLocalMaxY) {
      updateAnimation = true;
    }

    if (updateAnimation) {
      this._createMinMaxYAnimation();
    }
  }

  /**
   * @param {number | Date} minX
   * @param {number | Date} maxX
   * @param {boolean} preservePadding
   * @private
   */
  _setViewportRange (minX, maxX, preservePadding = false) {
    const xAxis = this._xAxis;

    const globalMinX = xAxis[ 0 ];
    const globalMaxX = xAxis[ xAxis.length - 1 ];

    if (isDate( minX )) {
      minX = minX.getTime();
    }
    if (isDate( maxX )) {
      maxX = maxX.getTime();
    }

    let newMinX = Math.max( minX, globalMinX );
    let newMaxX = Math.min( maxX, globalMaxX );

    const actualPaddingX = this._computeViewportPadding( newMinX, newMaxX );

    const receivedLeftPaddingX = clampNumber( newMinX - minX, 0, actualPaddingX );
    const receivedRightPaddingX = clampNumber( maxX - newMaxX, 0, actualPaddingX );

    if (!preservePadding) {
      this._viewportLeftPaddingScale = receivedLeftPaddingX / actualPaddingX;
    }
    if (this._viewportLeftPaddingScale > 0) {
      newMinX -= actualPaddingX * this._viewportLeftPaddingScale;
    }

    if (!preservePadding) {
      this._viewportRightPaddingScale = receivedRightPaddingX / actualPaddingX;
    }
    if (this._viewportRightPaddingScale > 0) {
      newMaxX += actualPaddingX * this._viewportRightPaddingScale;
    }

    this._viewportRange = [ newMinX, newMaxX ];
  }

  /**
   * @private
   */
  _addEvents () {
    this._renderer.on('resize', _ => {
      this._onRendererResize();
    });

    this._eachSeries(line => {
      line.on('visibleChange', _ => {
        this._onSeriesVisibleChange( line );
      });
    });
  }

  /**
   * @private
   */
  _setInitialRange () {
    const globalMinX = this._xAxis[ 0 ];
    const globalMaxX = this._xAxis[ this._xAxis.length - 1 ];
    const difference = globalMaxX - globalMinX;
    const initialViewport = Math.floor( difference * .15 );
    const viewportPadding = this._computeViewportPadding(
      globalMaxX - initialViewport,
      globalMaxX
    );

    // set initial range
    this.setViewportRange(
      globalMaxX - initialViewport - viewportPadding,
      globalMaxX + viewportPadding
    );
  }

  /**
   * @private
   */
  _createMinMaxYAnimation () {
    if (this._minMaxYAnimation) {
      console.log( this._minMaxYAnimation.id, 'cancelled' );
      this._minMaxYAnimation.cancel();
      this._minMaxYAnimation = null;
    }

    this._minMaxYAnimation = new Tween(this, [
      '_currentLocalMinY',
      '_currentLocalMaxY'
    ], [
      this._localMinY - this._currentLocalMinY,
      this._localMaxY - this._currentLocalMaxY
    ], {
      duration: 300,
      timingFunction: 'easeInOutQuad'
    });

    this._minMaxYAnimation.start();

    // console.log(this._minMaxYAnimation.id, 'local deltas (min, max):', this._minMaxYAnimation._deltaValues);

    this._minMaxYAnimation.on(TweenEvents.COMPLETE, _ => {
      // console.log( this._minMaxYAnimation.id, 'complete' );
      this._minMaxYAnimation = null;
    });
  }

  /**
   * @private
   */
  _onRendererResize () {
    // request for future animation update
    this._viewportRangeUpdateNeeded = true;
  }

  /**
   * @param {Series} line
   * @private
   */
  _onSeriesVisibleChange (line) {
    // find new extremes and scale
    this._updateExtremes();
  }

  /**
   * @param {number} minX
   * @param {number} maxX
   * @return {number}
   * @private
   */
  _computeViewportPixelX (minX = this._viewportRange[ 0 ], maxX = this._viewportRange[ 1 ]) {
    return ( maxX - minX ) / this.chartWidth;
  }

  /**
   * @param {number} localMinX
   * @param {number} localMaxX
   * @return {number}
   * @private
   */
  _computeViewportPadding (localMinX, localMaxX) {
    return this._computeViewportPixelX( localMinX, localMaxX ) * 16;
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
