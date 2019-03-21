import { EventEmitter } from '../misc/EventEmitter';
import { ChartTypes } from './ChartTypes';
import { Series } from '../series/Series';
import { arraysEqual, binarySearchIndexes, clampNumber, cssText, ensureNumber, isDate, TimeRanges } from '../../utils';
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
   * @type {Array<number>}
   * @private
   */
  _viewportPointsIndexes = [ 0, 0 ];

  /**
   * @type {boolean}
   * @private
   */
  _useViewportPointsInterval = false;

  /**
   * @type {number}
   * @private
   */
  _viewportDistance = 0;

  /**
   * @type {number}
   * @private
   */
  _viewportPixelX = 0;

  /**
   * @type {number}
   * @private
   */
  _viewportPixelY = 0;

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
   * @type {boolean}
   * @private
   */
  _viewportPointsGroupingNeeded = false;

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
   * @type {number}
   * @private
   * @default 2
   */
  _groupingPixels = 2;

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

    if (this._viewportPointsGroupingNeeded) {
      this._approximateViewportPoints();

      this._viewportPointsGroupingNeeded = false;
    }

    if (extremesUpdated) {
      this._updateViewportPixel();
    }

    this._eachSeries(line => {
      if (extremesUpdated) {
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
   * @param {boolean} skipExtremes
   * @param {boolean} preservePadding
   */
  setViewportRange (minX, maxX, { skipExtremes = false, preservePadding = false } = {}) {
    // recompute X boundaries
    this._setViewportRange( minX, maxX, preservePadding );

    // remember last indexes
    const oldRangeIndexes = this._viewportRangeIndexes;

    // recompute indexes range
    this._updateViewportIndexes();

    let localExtremesUpdateRequested = false;

    if (!arraysEqual( this._viewportRangeIndexes, oldRangeIndexes )) {
      // do not recompute groups while first render
      if (oldRangeIndexes.length > 0) {
        // recompute approximation in next animation update
        this._viewportPointsGroupingNeeded = true;
      }

      localExtremesUpdateRequested = true;
    }

    const updateExtremes = !skipExtremes && localExtremesUpdateRequested;

    this._eachSeries(line => {
      // update local extremes only if indexes range changed
      if (updateExtremes) {
        // update minY and maxY local values for each line
        line.updateLocalExtremes();
      }

      // recompute and repaint path in next animation update
      line.requestPathUpdate();
    });

    if (updateExtremes) {
      // update local extremes on chart level
      this._updateLocalExtremes();
    }

    // recompute pixel value (e.g. for animation)
    this._updateViewportPixel();
  }

  /**
   * Recompute key variables for viewport range
   */
  updateViewportRange () {
    // recompute X boundaries
    this.setViewportRange(
      this._viewportRange[ 0 ],
      this._viewportRange[ 1 ], {
        skipExtremes: true,
        preservePadding: true
      }
    );
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
    this._approximateViewportPoints();
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

    const groupingOptions = options.grouping;
    if (groupingOptions) {
      if (groupingOptions.pixels) {
        this._groupingPixels = ensureNumber( groupingOptions.pixels );
      }
    }

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
   * Approximate points for better performance
   */
  _approximateViewportPoints () {
    let [ startIndex, endIndex ] = this._viewportRangeIndexes;

    startIndex = Math.max( 0, startIndex - 1 );
    endIndex = Math.min( this._xAxis.length - 1, endIndex + 1 );

    // if we have no enough points
    // then we don't need to approximate
    if (endIndex - startIndex < 400) {
      // just save indexes of points for increase performance
      // [ startIndex, endIndex ]
      this._viewportPointsIndexes[ 0 ] = startIndex;
      this._viewportPointsIndexes[ 1 ] = endIndex;
      this._useViewportPointsInterval = true;

      // all work done here
      return;
    }

    const boostLimit = 500;
    const boostScale = 1 + this._xAxis.length > boostLimit
      ? Math.max(0, ( endIndex - startIndex ) / this._xAxis.length ) * 2
      : 0;

    let groupingDistanceLimitX = boostScale * this._groupingPixels * this._viewportPixelX;

    let viewportIndexes = [];
    let groupStartIndex = startIndex;

    for (let i = startIndex + 1; i <= endIndex; ++i) {
      const pointX = this._xAxis[ i ];

      const groupStartDifferenceX = pointX - this._xAxis[ groupStartIndex ];

      if (groupStartDifferenceX >= groupingDistanceLimitX || i === endIndex) {
        if (groupStartIndex !== i - 1) {
          // we have 2 or more points to group
          // [ startIndex, lastIndex ] all indexes inclusive
          const endIndex = i - 1;
          const middleIndex = ( groupStartIndex + endIndex ) >> 1;
          viewportIndexes.push( middleIndex );
        } else {
          if (startIndex === i - 1) {
            // add first point
            viewportIndexes.push( startIndex );
          }

          viewportIndexes.push( i );
        }

        groupStartIndex = i;
      }
    }

    this._viewportPointsIndexes = viewportIndexes;
    this._useViewportPointsInterval = false;
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
  _updateLocalExtremes () {
    let localMinY = 0;
    let localMaxY = 0;

    this._eachSeries(line => {
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
      if (this._minMaxYAnimation) {
        this._patchMinMaxYAnimation();
      } else {
        this._createMinMaxYAnimation();
      }
    }
  }

  /**
   * Updates pixel value for each axis
   */
  _updateViewportPixel () {
    this._viewportPixelX = this._viewportDistance / this.chartWidth;
    this._viewportPixelY = this.currentLocalExtremeDifference / this.chartHeight;
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
    this._viewportDistance = newMaxX - newMinX;
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
      this._minMaxYAnimation.cancel();
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

    this._minMaxYAnimation.on(TweenEvents.CANCELLED, _ => {
      // console.log( this._minMaxYAnimation.id, 'cancelled' );
      this._minMaxYAnimation = null;
    });
  }

  /**
   * @private
   */
  _patchMinMaxYAnimation () {
    // todo: workaround for now
    this._createMinMaxYAnimation();
  }

  /**
   * @private
   */
  _onRendererResize () {
    // making request for future animation update
    this._viewportRangeUpdateNeeded = true;
    this._viewportPointsGroupingNeeded = true;
  }

  /**
   * @param {Series} line
   * @private
   */
  _onSeriesVisibleChange (line) {
    // find new extremes and scale
    this._updateLocalExtremes();
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
