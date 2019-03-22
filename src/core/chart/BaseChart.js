import { EventEmitter } from '../misc/EventEmitter';
import { SeriesTypes } from '../series/SeriesTypes';
import { Series } from '../series/Series';
import { arraysEqual, binarySearchIndexes, clampNumber, ensureNumber, isDate } from '../../utils';
import { Tween, TweenEvents } from '../animation/Tween';
import { ChartTypes } from './ChartTypes';
import { ChartEvents } from './ChartEvents';

let CHART_ID = 1;

export class BaseChart extends EventEmitter {

  /**
   * @type {number}
   * @private
   */
  _id = CHART_ID++;

  /**
   * @type {string}
   * @private
   */
  _type = '';

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
  _chartHeight = 250;

  /**
   * @type {number}
   * @private
   * @default 2
   */
  _groupingPixels = 2;

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
   * @type {SVGDefsElement}
   * @private
   */
  _defs = null;

  /**
   * @type {SVGMaskElement}
   * @private
   */
  _chartMask = null;

  /**
   * @type {string}
   * @private
   */
  _chartMaskId = null;

  /**
   * @type {number}
   * @private
   */
  _chartMaskPadding = 0;

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
   * @param {SvgRenderer} renderer
   * @param {Object} options
   */
  constructor (renderer, options = {}) {
    super();

    this._renderer = renderer;
    this._options = options;
  }

  initialize () {
    this.resolveDefs();
    this.createChartMask();

    this.createSeriesGroup();
    this.createSeries();

    this.addEvents();

    this.setInitialRange();
    this.approximateViewportPoints();
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
      this.approximateViewportPoints();

      this._viewportPointsGroupingNeeded = false;
    }

    if (extremesUpdated) {
      this.updateViewportPixel();
    }

    this.eachSeries(line => {
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
    this.eachSeries(line => line.firstRender());
  }

  /**
   * Creates SVG group for storing series paths
   * @abstract
   */
  createSeriesGroup () {
  }

  /**
   * Creates array of series
   */
  createSeries () {
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
      return types[ column[ 0 ] ] === SeriesTypes.x;
    });
    const xAxis = this._xAxis = columns[ xAxisIndex ].slice( 1 );

    let yAxes = columns.slice(); // copy an array to change later
    yAxes.splice( xAxisIndex, 1 ); // remove x axis from the array

    for (let i = 0; i < yAxes.length; ++i) {
      const yAxis = yAxes[ i ].slice();
      const label = yAxis.shift();
      const type = types[ label ];
      const color = colors[ label ];
      const name = names[ label ];

      // prepare series settings
      const settings = {
        xAxis, yAxis, label, type,
        color, name, options: this.extendSeriesOptions( options )
      };

      // create instance
      const series = new Series( this._renderer, this._seriesGroup, settings );
      series.initialize();

      // provide context for each series
      series.setChart( this );

      this._series.push( series );
    }
  }

  /**
   * Creates or resolves defs element in SVG container
   */
  resolveDefs () {
    if (this._defs) {
      return;
    }
    const defs = this._renderer.svgContainer.querySelector( 'defs' );
    this._defs = !defs
      ? this._renderer.createDefs()
      : defs;
  }

  /**
   * Creates clip mask for the chart and top-bottom shadow mask
   */
  createChartMask () {
    const padding = this._chartMaskPadding;

    this._chartMaskId = `telechart-mask-${this.id}`;

    this._chartMask = this.renderer.createMask({
      id: this._chartMaskId
    }, [], this.defs);

    const gradientId = `telechart-mask-gradient-${this.id}`;
    const sharpGradient = this._type === ChartTypes.navigatorChart;

    // create gradient for rectangle
    this.renderer.createLinearGradient({
      id: gradientId,
      gradientTransform: 'rotate(90)'
    }, [
      { offset: '0', stopColor: 'white', stopOpacity: 0 },
      { offset: sharpGradient ? '0.1%' : '5%', stopColor: 'white', stopOpacity: 1 },
      { offset: '99.9%', stopColor: 'white', stopOpacity: 1 },
      { offset: '100%', stopColor: 'white', stopOpacity: 0 },
    ], this.defs);

    // create rectangle with gradient and append to mask
    this.renderer.createRect(this.chartWidth, this.chartHeight + padding + 1, {
      fill: `url(#${gradientId})`,
      x: 0,
      y: -padding,
    }, this._chartMask);
  }

  /**
   * Sets initial viewport range for the chart
   */
  setInitialRange () {
    this.setViewportRange();
  }

  /**
   * @param {number|Date} minX
   * @param {number|Date} maxX
   * @param {boolean} skipExtremes
   * @param {boolean} preservePadding
   */
  setViewportRange (minX = -Infinity, maxX = Infinity, { skipExtremes = false, preservePadding = false } = {}) {
    // recompute X boundaries
    this._clampViewportRange( minX, maxX, preservePadding );

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

    this.eachSeries(line => {
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
      this.updateLocalExtremes();
    }

    // recompute pixel value (e.g. for animation)
    this.updateViewportPixel();
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
   * Approximate points for better performance
   */
  approximateViewportPoints () {
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
   * Find new local min and max extremes among visible series
   */
  updateLocalExtremes () {
    let localMinY = 0;
    let localMaxY = 0;

    this.eachSeries(line => {
      if (!line.isVisible) {
        // find among visible series
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
   * @param {number} minX
   * @param {number} maxX
   * @return {number}
   */
  computeViewportPixelX (minX = this._viewportRange[ 0 ], maxX = this._viewportRange[ 1 ]) {
    return ( maxX - minX ) / this.chartWidth;
  }

  /**
   * Updates pixel value for each axis
   */
  updateViewportPixel () {
    this._viewportPixelX = this._viewportDistance / this.chartWidth;
    this._viewportPixelY = this.currentLocalExtremeDifference / this.chartHeight;
  }

  /**
   * @param {number} localMinX
   * @param {number} localMaxX
   * @return {number}
   */
  computeViewportPadding (localMinX, localMaxX) {
    return this.computeViewportPixelX( localMinX, localMaxX ) * 12;
  }

  /**
   * Initialize chart events
   */
  addEvents () {
    this._renderer.on('resize', _ => {
      this.onRendererResize();
    });

    this.eachSeries(line => {
      line.on('visibleChange', _ => {
        this.onSeriesVisibleChange( line );
      });
    });
  }

  /**
   * Resize event handler
   */
  onRendererResize () {
    // making request for future animation update
    this._viewportRangeUpdateNeeded = true;
    this._viewportPointsGroupingNeeded = true;
  }

  /**
   * @param {Series} line
   */
  onSeriesVisibleChange (line) {
    // find new extremes and scale
    this.updateLocalExtremes();
    
    this.emit( ChartEvents.SERIES_VISIBLE_CHANGE, line );
  }

  /**
   * @param {string} label
   * @return {Series}
   */
  getSeriesByLabel (label) {
    return this.findSeries(line => {
      return line.label === label;
    });
  }

  /**
   * @param {string} label
   */
  setSeriesVisible (label) {
    const series = this.getSeriesByLabel( label );
    if (series) {
      series.setVisible();
    }
  }

  /**
   * @param {string} label
   */
  setSeriesInvisible (label) {
    const series = this.getSeriesByLabel( label );
    if (series) {
      series.setInvisible();
    }
  }

  /**
   * @param {string} label
   */
  toggleSeriesInvisible (label) {
    const series = this.getSeriesByLabel( label );
    if (series) {
      series.toggleVisible();
    }
  }

  /**
   * @param {Function} predicate
   * @return {Series}
   */
  findSeries (predicate) {
    for (let i = 0; i < this._series.length; ++i) {
      if (predicate( this._series[ i ] )) {
        return this._series[ i ];
      }
    }
  }

  /**
   * @param {Function} fn
   */
  eachSeries (fn = () => {}) {
    for (let i = 0; i < this._series.length; ++i) {
      fn( this._series[ i ] );
    }
  }

  /**
   * @param {Object} options
   * @return {*}
   */
  extendSeriesOptions (options) {
    return options;
  }

  /**
   * @param {string} type
   */
  setChartType (type) {
    this._type = type;
  }

  /**
   * @return {number}
   */
  get id () {
    return this._id;
  }

  /**
   * @return {string}
   */
  get chartType () {
    return this._type;
  }

  /**
   * @return {SvgRenderer}
   */
  get renderer () {
    return this._renderer;
  }

  /**
   * @return {Array<number>}
   */
  get xAxis () {
    return this._xAxis;
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
   * @return {string}
   */
  get chartMaskId () {
    return this._chartMaskId;
  }

  /**
   * @return {Tween}
   */
  get minMaxYAnimation () {
    return this._minMaxYAnimation;
  }

  /**
   * @return {SVGDefsElement}
   */
  get defs () {
    return this._defs;
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
   * @param {number | Date} minX
   * @param {number | Date} maxX
   * @param {boolean} preservePadding
   * @private
   */
  _clampViewportRange (minX, maxX, preservePadding = false) {
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

    const actualPaddingX = this.computeViewportPadding( newMinX, newMaxX );

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
    // console.log(this._minMaxYAnimation.id, 'local deltas (min, max):', this._minMaxYAnimation._deltaValues);

    this._createMinMaxYAnimation();

    /*this._minMaxYAnimation.patchAnimation([
      this._localMinY - this._currentLocalMinY,
      this._localMaxY - this._currentLocalMaxY
    ]);*/
  }
}
