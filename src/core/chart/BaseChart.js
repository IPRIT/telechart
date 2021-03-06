import { EventEmitter } from '../misc/EventEmitter';
import { SeriesTypes } from '../series/SeriesTypes';
import { Series } from '../series/Series';
import { Tween, TweenEvents } from '../animation/Tween';
import { ChartTypes } from './ChartTypes';
import { ChartEvents } from './events/ChartEvents';
import { Label } from './Label';

import {
  arraysEqual,
  binarySearchIndexes,
  clampNumber,
  ensureNumber,
  getElementOffset,
  isDate,
  setAttributeNS
} from '../../utils';
import { ChartAxisY } from './axis/ChartAxisY';
import { ChartAxisX } from './axis/ChartAxisX';

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
  _chartHeight = 280;

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
  _viewportPadding = 13;

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
   */
  _minMaxYAnimationSign = null;

  /**
   * @type {Tween}
   * @private
   */
  _rangeAnimation = null;

  /**
   * @type {*}
   * @private
   */
  _rangeAnimationObject = {};

  /**
   * @type {boolean}
   * @private
   */
  _cursorInsideChart = false;

  /**
   * @type {SVGPathElement}
   * @private
   */
  _axisCursor = null;

  /**
   * @type {number}
   * @private
   */
  _axisCursorPositionX = 0;

  /**
   * @type {number}
   * @private
   */
  _axisCursorPointIndex = 0;

  /**
   * @type {boolean}
   * @private
   */
  _axisCursorUpdateNeeded = false;

  /**
   * @type {Label}
   * @private
   */
  _label = null;

  /**
   * @type {ChartAxisY}
   * @private
   */
  _yAxisView = null;

  /**
   * @type {ChartAxisX}
   * @private
   */
  _xAxisView = null;

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

    if (this.isChart) {
      this.initializeAxisCursor();
      this.initializeLabel();

      this.initializeAxisY();
      this.initializeAxisX();
    }
  }

  /**
   * @param {number} deltaTime
   */
  update (deltaTime) {
    const minMaxYAnimation = this._minMaxYAnimation;
    const extremesUpdated = minMaxYAnimation && minMaxYAnimation.isRunning;

    if (extremesUpdated) {
      this._minMaxYAnimation.update( deltaTime );
    }

    const hasRangeAnimation = this._rangeAnimation && this._rangeAnimation.isRunning;

    if (this._viewportRangeUpdateNeeded || hasRangeAnimation) {
      if (hasRangeAnimation) {
        this._rangeAnimation.update( deltaTime );

        this.updateViewportRange([
          this._rangeAnimationObject.from,
          this._rangeAnimationObject.to
        ], { skipExtremes: false });

      } else {
        this.updateViewportRange();
      }

      this._viewportRangeUpdateNeeded = false;
    }

    if (this._viewportPointsGroupingNeeded) {
      this.approximateViewportPoints();

      this._viewportPointsGroupingNeeded = false;
    }

    if (extremesUpdated) {
      this.updateViewportPixel();
    }

    // cursor updating
    if (this._axisCursorUpdateNeeded && this.isChart) {
      this._updateAxisCursor();

      this._axisCursorUpdateNeeded = false;
    }

    this.eachSeries(line => {
      const hasOpacityAnimation = line.isHiding;
      const isNavigatorPath = this._type === ChartTypes.navigatorChart;

      if (extremesUpdated && !(isNavigatorPath && hasOpacityAnimation)) {
        line.requestPathUpdate();
      }

      line.update( deltaTime );
    });

    if (this._label) {
      this._label.update( deltaTime );
    }

    if (this._yAxisView) {
      if (extremesUpdated) {
        this._yAxisView.requestUpdatePosition();
      }

      this._yAxisView.update( deltaTime );
    }

    if (this._xAxisView) {
      this._xAxisView.update( deltaTime );
    }
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
      // provide context for each series
      series.setChart( this );
      series.initialize();

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
      { offset: sharpGradient ? '0.1%' : '2%', stopColor: 'white', stopOpacity: 1 },
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
   * Creates chart cursor
   */
  initializeAxisCursor () {
    this._createAxisCursor();
    this._addAxisCursorEvents();
  }

  /**
   * Creates label
   */
  initializeLabel () {
    const label = new Label( this._renderer );

    label.setChart( this );
    label.initialize();

    this._label = label;
  }

  /**
   * Creates y axis
   */
  initializeAxisY () {
    const yAxisView = new ChartAxisY( this._renderer );

    yAxisView.setChart( this );
    yAxisView.initialize();

    this._yAxisView = yAxisView;
  }

  /**
   * Creates y axis
   */
  initializeAxisX () {
    const xAxisView = new ChartAxisX( this._renderer );

    xAxisView.setChart( this );
    xAxisView.initialize();

    this._xAxisView = xAxisView;
  }

  /**
   * Sets initial viewport range for the chart
   */
  setInitialRange () {
    this.setViewportRange();
  }

  /**
   * @param {number} minX
   * @param {number} maxX
   * @param {*} options
   */
  animateViewportRangeTo (minX = -Infinity, maxX = Infinity, options = {}) {
    const {
      duration = 300,
      timingFunction = 'easeInOutQuad',
      preservePadding = false
    } = options;

    const [ newMinX, newMaxX ] = this._clampViewportRange( minX, maxX, preservePadding );

    if (this._rangeAnimation) {
      return this._rangeAnimation.patchAnimation( [ newMinX, newMaxX ] );
    }

    this._rangeAnimationObject = {
      from: this._viewportRange[ 0 ],
      to: this._viewportRange[ 1 ]
    };

    this._rangeAnimation = new Tween(this._rangeAnimationObject, [ 'from', 'to' ], [
      newMinX, newMaxX
    ], {
      duration, timingFunction
    });

    const onFinished = _ => {
      this._rangeAnimation = null;
    };

    this._rangeAnimation.on( TweenEvents.COMPLETE, onFinished );
    this._rangeAnimation.on( TweenEvents.CANCELLED, onFinished );

    this._rangeAnimation.start();
  }

  /**
   * @param {number|Date} minX
   * @param {number|Date} maxX
   * @param {boolean} skipExtremes
   * @param {boolean} preservePadding
   */
  setViewportRange (minX = -Infinity, maxX = Infinity, { skipExtremes = false, preservePadding = false } = {}) {
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

      if (this._xAxisView) {
        this._xAxisView.requestUpdateAnimations();
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

    // recompute pixel values
    this.updateViewportPixel();

    // update cursor in next animation frame
    this._axisCursorUpdateNeeded = true;

    if (this._xAxisView) {
      this._xAxisView.requestUpdatePosition();
    }
  }

  /**
   * Recompute key variables for viewport range
   *
   * @param {Array<number>} viewportRange
   * @param {*} options
   */
  updateViewportRange (viewportRange = this._viewportRange, options = {}) {
    const {
      skipExtremes = true,
      preservePadding = true
    } = options;

    // recompute X boundaries
    this.setViewportRange(
      viewportRange[ 0 ],
      viewportRange[ 1 ], {
        skipExtremes,
        preservePadding
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
    if (endIndex - startIndex < 400 && !this.isNavigatorChart) {
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
      : 1;

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
      this._updateOrCreateMinMaxYAnimation();

      if (this._yAxisView) {
        this._yAxisView.requestUpdateAnimations();
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
    return this.computeViewportPixelX( localMinX, localMaxX ) * this._viewportPadding;
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
    // making requests for future animation update
    this._viewportRangeUpdateNeeded = true;
    this._viewportPointsGroupingNeeded = true;
    this._axisCursorUpdateNeeded = true;

    this._updateMaskDimensions();

    if (this._yAxisView) {
      this._yAxisView.onChartResize();
    }

    if (this._xAxisView) {
      this._xAxisView.onChartResize();
    }
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
  toggleSeries (label) {
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
      fn( this._series[ i ], i );
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
   * @param {number} x
   * @return {number}
   */
  projectXToSvg (x) {
    return this.toRelativeX( x ) / this._viewportPixelX;
  }

  /**
   * @param {number} y
   * @return {number}
   */
  projectYToSvg (y) {
    const svgY = this.chartHeight - ( y - this._currentLocalMinY ) / this._viewportPixelY;
    return clampNumber( svgY || 0, -1e6, 1e6 );
  }

  /**
   * @param {number} pageX
   * @param {number} pageY
   * @return {number}
   */
  projectCursorToX ({ pageX = 0, pageY = 0 }) {
    const { left } = getElementOffset( this.renderer.svgContainer );
    const chartLeft = pageX - left;

    return this.viewportRange[ 0 ] + chartLeft * this.viewportPixelX;
  }

  /**
   * @param {number} x
   * @return {number}
   * @private
   */
  toRelativeX (x) {
    return x - this._viewportRange[ 0 ];
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
   * @return {boolean}
   */
  get isChart () {
    return this._type === ChartTypes.chart;
  }

  /**
   * @return {boolean}
   */
  get isNavigatorChart () {
    return this._type === ChartTypes.navigatorChart;
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
  get viewportPixelX () {
    return this._viewportPixelX;
  }

  /**
   * @return {number}
   */
  get viewportPixelY () {
    return this._viewportPixelY;
  }

  /**
   * @return {number}
   */
  get viewportPadding () {
    return this._viewportPadding;
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
   * @return {number}
   */
  get seriesGroupTop () {
    return this._seriesGroupTop;
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
   * @param {number} minX
   * @param {number} maxX
   * @param {boolean} preservePadding
   * @private
   */
  _setViewportRange (minX, maxX, preservePadding = false) {
    const [ newMinX, newMaxX ] = this._clampViewportRange( minX, maxX, preservePadding );

    this._viewportRange = [ newMinX, newMaxX ];
    this._viewportDistance = newMaxX - newMinX;
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

    if (minX > maxX) {
      [ minX, maxX ] = [ maxX, minX ];
    }

    let newMinX = clampNumber( minX, globalMinX, globalMaxX );
    let newMaxX = clampNumber( maxX, globalMinX, globalMaxX );

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

    return [ newMinX, newMaxX ];
  }

  /**
   * @private
   */
  _updateOrCreateMinMaxYAnimation () {
    if (!this._minMaxYAnimation) {
      return this._createMinMaxYAnimation();
    }

    const currentLocalExtremeDifference = this.currentLocalExtremeDifference;
    const newLocalExtremeDifference = this.localExtremeDifference;
    const animationSign = currentLocalExtremeDifference < newLocalExtremeDifference;

    if (animationSign !== this._minMaxYAnimationSign) {
      return this._createMinMaxYAnimation();
    }

    this._patchMinMaxYAnimation();
  }

  /**
   * @private
   */
  _createMinMaxYAnimation () {
    if (this._minMaxYAnimation) {
      this._minMaxYAnimation.cancel();
    }

    this._updateMinMaxAnimationSign();

    this._minMaxYAnimation = new Tween(this, [
      '_currentLocalMinY',
      '_currentLocalMaxY'
    ], [
      this._localMinY,
      this._localMaxY
    ], {
      duration: 300,
      timingFunction: 'easeInOutQuad'
    });

    const onFinished = _ => {
      this._minMaxYAnimation = null;
    };

    this._minMaxYAnimation.on( TweenEvents.COMPLETE, onFinished );
    this._minMaxYAnimation.on( TweenEvents.CANCELLED, onFinished );

    this._minMaxYAnimation.start();
  }

  /**
   * @private
   */
  _patchMinMaxYAnimation () {
    this._minMaxYAnimation.patchAnimation([
      this._localMinY,
      this._localMaxY
    ]);
  }

  /**
   * @private
   */
  _updateMinMaxAnimationSign () {
    this._minMaxYAnimationSign = this.currentLocalExtremeDifference < this.localExtremeDifference;
  }

  /**
   * @private
   */
  _updateMaskDimensions () {
    if (!this._chartMask) {
      return;
    }
    const rect = this._chartMask.querySelector( 'rect' );
    setAttributeNS( rect, 'width', this.chartWidth, null );
  }

  /**
   * @private
   */
  _createAxisCursor () {
    const pathText = this._computeAxisCursorPath();

    this._axisCursor = this.renderer.createPath(pathText, {
      class: 'telechart-chart-cursor',
      strokeWidth: 1,
      strokeOpacity: 0,
      stroke: '#ccc'
    }, this._axisCursorGroup);

    this._axisCursorGroup = this.renderer.createGroup({
      class: 'telechart-chart-cursor-group',
      transform: `translate(0, ${this._seriesGroupTop}) scale(1 1)`
    }, this._axisCursor);

    this.renderer.svgContainer.insertBefore( this._axisCursorGroup, this._seriesGroup );
  }

  /**
   * @private
   */
  _updateAxisCursor () {
    this.renderer.updatePath( this._axisCursor, this._computeAxisCursorPath() );
  }

  /**
   * @return {string}
   * @private
   */
  _computeAxisCursorPath () {
    const x = this.xAxis[ this._axisCursorPointIndex ];
    const svgX = this.projectXToSvg( x );

    return `M${svgX} 0L${svgX} ${this.chartHeight}`;
  }

  /**
   * @private
   */
  _addAxisCursorEvents () {
    const mouseMoveListener = this._onMouseMove.bind( this );
    const mouseLeaveListener = this._onMouseLeave.bind( this );

    const touchStartListener = this._onTouchStart.bind( this );
    const touchMoveListener = this._onTouchMove.bind( this );
    const touchEndListener = this._onTouchEnd.bind( this );

    this.renderer.svgContainer.addEventListener( 'touchstart', touchStartListener, { passive: false } );
    this.renderer.svgContainer.addEventListener( 'touchmove', touchMoveListener, { passive: false } );
    this.renderer.svgContainer.addEventListener( 'touchend', touchEndListener );

    this.renderer.svgContainer.addEventListener( 'mousemove', mouseMoveListener );
    this.renderer.svgContainer.addEventListener( 'mouseleave', mouseLeaveListener );
  }

  /**
   * @param {MouseEvent} ev
   * @private
   */
  _onMouseMove (ev) {
    this._onCursorMove( ev );
  }

  /**
   * @param {MouseEvent} ev
   * @private
   */
  _onMouseLeave (ev) {
    this._onCursorLeave();
  }

  /**
   * @param {TouchEvent} ev
   * @private
   */
  _onTouchStart (ev) {
    const targetTouch = ev.targetTouches[ 0 ];

    this._touchStartPosition = {
      pageX: targetTouch.pageX,
      pageY: targetTouch.pageY
    };

    this._onCursorMove( targetTouch );
  }

  /**
   * @param {TouchEvent} ev
   * @private
   */
  _onTouchMove (ev) {
    const targetTouch = ev.targetTouches[ 0 ];

    this._onCursorMove( targetTouch );

    if (this._isScrollingAction === null) {
      const {
        pageX: startPageX,
        pageY: startPageY
      } = this._touchStartPosition;

      const deltaY = Math.abs( startPageY - targetTouch.pageY );
      const deltaX = Math.abs( startPageX - targetTouch.pageX );

      this._isScrollingAction = deltaY >= deltaX;
    }

    if (this._cursorInsideChart
      && !this._isScrollingAction) {
      ev.preventDefault();
    }
  }

  /**
   * @param {TouchEvent} ev
   * @private
   */
  _onTouchEnd (ev) {
    if (this._cursorInsideChart && ev.cancelable) {
      ev.preventDefault();
    }

    this._isScrollingAction = null;
    this._onCursorLeave();
  }

  /**
   * @param cursorPosition
   * @private
   */
  _onCursorMove (cursorPosition) {
    const insideChart = this._insideChart( cursorPosition );

    this._setInsideChartState(
      insideChart
    );

    if (!insideChart) {
      return;
    }

    const oldIndex = this._axisCursorPointIndex;

    this._axisCursorPositionX = this.projectCursorToX( cursorPosition );
    this._axisCursorPointIndex = this._findPointIndexByCursor( this._axisCursorPositionX );
    this._axisCursorUpdateNeeded = true;

    this.eachSeries(line => {
      line.setMarkerPointIndex( this._axisCursorPointIndex );
    });

    this._updateLabel( this._axisCursorPointIndex !== oldIndex );
  }

  /**
   * @private
   */
  _updateLabel (changed = true) {
    this._label.setData(
      this._prepareLabelData()
    );

    const date1 = new Date( this._viewportRange[ 0 ] );
    const date2 = new Date( this._viewportRange[ 1 ] );
    if (date1.getFullYear() !== date2.getFullYear()) {
      this._label.showYear();
    } else {
      this._label.hideYear();
    }

    if (changed) {
      this._label.requestUpdatePosition();
    }
  }

  /**
   * @param {number} cursorX
   * @return {number}
   * @private
   */
  _findPointIndexByCursor (cursorX) {
    const [ lowerIndex, upperIndex ] = binarySearchIndexes( this.xAxis, cursorX );

    let index = null;
    if (lowerIndex < 0 && upperIndex >= 0) {
      index = upperIndex;
    } else if (lowerIndex >= 0 && upperIndex >= this.xAxis.length) {
      index = lowerIndex;
    } else {
      const lowerDistance = Math.abs( cursorX - this.xAxis[ lowerIndex ] );
      const upperDistance = Math.abs( cursorX - this.xAxis[ upperIndex ] );
      const isLowerCloser = lowerDistance <= upperDistance;

      const isLowerVisible = this.xAxis[ lowerIndex ] >= this.viewportRange[ 0 ];
      const isUpperVisible = this.xAxis[ upperIndex ] <= this.viewportRange[ 1 ];

      index = isLowerCloser
        ? ( isLowerVisible ? lowerIndex : upperIndex )
        : ( isUpperVisible ? upperIndex : lowerIndex );
    }

    return index;
  }

  /**
   * @private
   */
  _onCursorLeave () {
    this._setInsideChartState( false );
  }

  /**
   * @param {boolean} isInside
   * @private
   */
  _setInsideChartState (isInside) {
    const changed = this._cursorInsideChart !== isInside;
    if (!changed) {
      return;
    }

    this._cursorInsideChart = isInside;

    if (this._markerHideTimeout) {
      clearTimeout( this._markerHideTimeout );
      this._markerHideTimeout = null;
    }

    const change = _ => {
      this._onCursorInsideChartChanged( isInside );
    };

    if (!isInside) {
      // create short delay for cursor & markers hiding
      this._markerHideTimeout = setTimeout( change , 1000 );
    } else {
      change();
    }
  }

  /**
   * @param {boolean} isInside
   * @private
   */
  _onCursorInsideChartChanged (isInside) {
    if (isInside) {
      this._showMarkers();
      this._showCursor();
      this._label.showLabel();
    } else {
      this._hideMarkers();
      this._hideCursor();
      this._label.hideLabel();
    }
  }

  /**
   * @private
   */
  _showMarkers () {
    this.eachSeries(line => {
      if (line.isVisible) {
        line.showMarker();
      }
    });
  }

  /**
   * @private
   */
  _hideMarkers () {
    this.eachSeries(line => {
      line.hideMarker();
    });
  }

  /**
   * @private
   */
  _showCursor () {
    setAttributeNS( this._axisCursor, 'stroke-opacity', 1, null );
  }

  /**
   * @private
   */
  _hideCursor () {
    setAttributeNS( this._axisCursor, 'stroke-opacity', 0, null );
  }

  /**
   * @param {number} pageX
   * @param {number} pageY
   * @return {boolean}
   * @private
   */
  _insideChart ({ pageX, pageY }) {
    const { top, left } = getElementOffset( this.renderer.svgContainer );
    const chartTop = pageY - top - this._seriesGroupTop;
    const chartLeft = pageX - left;

    return chartTop >= 0 && chartTop <= this.chartHeight
      && chartLeft >= 0 && chartLeft <= this.chartWidth;
  }

  /**
   * @return {Array}
   * @private
   */
  _prepareLabelData () {
    const data = [];

    const index = this._axisCursorPointIndex;
    const x = this._xAxis[ index ];

    this.eachSeries(line => {
      data.push({
        color: line.color,
        label: line.label,
        name: line.name,
        visible: line.isVisible,
        x,
        y: line._yAxis[ index ],
        svgY: this.projectYToSvg( line._yAxis[ index ] ),
        svgX: this.projectXToSvg( line._xAxis[ index ] )
      });
    });

    return data;
  }
}
