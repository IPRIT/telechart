import { EventEmitter } from '../misc/EventEmitter';
import { arrayMinMax, arraysEqual, ensureNumber } from '../../utils';
import { Point } from '../point/Point';
import { PointGroup } from '../point/PointGroup';

let SERIES_AUTOINCREMENT = 1;

export class Series extends EventEmitter {

  /**
   * @type {number}
   * @private
   */
  _id = SERIES_AUTOINCREMENT++;

  /**
   * @type {Element}
   * @private
   */
  _group = null;

  /**
   * @type {string}
   * @private
   */
  _pathText = null;

  /**
   * @type {SVGPathElement}
   * @private
   */
  _pathElement = null;

  /**
   * @type {boolean}
   * @private
   */
  _pathUpdateNeeded = false;

  /**
   * @type {SvgRenderer}
   * @private
   */
  _renderer = null;

  /**
   * @type {Element}
   * @private
   */
  _parent = null;

  /**
   * @type {Array<number>}
   * @private
   */
  _xAxis = [];

  /**
   * @type {Array<number>}
   * @private
   */
  _yAxis = [];

  /**
   * @type {string}
   * @private
   */
  _name = null;

  /**
   * @type {string}
   * @private
   */
  _label = null;

  /**
   * @type {string}
   * @private
   */
  _color = '#31a8dc';

  /**
   * @type {boolean}
   * @private
   */
  _visible = true;

  /**
   * @type {Array<Point>}
   * @private
   */
  _points = [];

  /**
   * @type {{xAxis: Array<number>, yAxis: Array<number>, label: string, type: string, name: string, color: string, options: *}}
   * @private
   */
  _settings = {};

  /**
   * @type {*}
   * @private
   */
  _seriesOptions = {};

  /**
   * @type {number}
   * @private
   */
  _groupingPixels = 2;

  /**
   * @type {Chart}
   * @private
   */
  _chart = null;

  /**
   * @type {number}
   * @private
   */
  _chartWidth = null;

  /**
   * @type {number}
   * @private
   */
  _chartHeight = null;

  /**
   * @type {Array<number>}
   * @private
   */
  _viewportRange = [];

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
   * @type {boolean}
   * @private
   */
  _viewportPixelUpdateNeeded = true;

  /**
   * @type {Array<number>}
   * @private
   */
  _viewportRangeIndexes = [];

  /**
   * @type {Array<Point | PointGroup>}
   * @private
   */
  _viewportPoints = [];

  /**
   * @type {boolean}
   * @private
   */
  _viewportPointsGroupingNeeded = true;

  /**
   * @type {number}
   * @private
   */
  _globalMaxY = 0;

  /**
   * @type {number}
   * @private
   */
  _globalMinY = 0;

  /**
   * @type {number}
   * @private
   */
  _localMaxY = 0;

  /**
   * @type {number}
   * @private
   */
  _localMinY = 0;

  /**
   * @type {number}
   * @private
   */
  _currentYScale = 1;

  /**
   * @type {number}
   * @private
   */
  _localYScale = 1;

  /**
   * @param {SvgRenderer} renderer
   * @param {Element} parent
   * @param {*} settings
   */
  constructor (renderer, parent, settings = {}) {
    super();

    this._renderer = renderer;
    this._parent = parent;
    this._settings = settings;
    this._parseSettings();

    this.initialize();
  }

  /**
   * Initializes series with options
   */
  initialize () {
    this._createPoints();
    this._updateGlobalExtremes();
    this._addEvents();
  }

  /**
   * @param {number} deltaTime
   */
  update (deltaTime) {
    if (this._viewportPointsGroupingNeeded) {
      this.regroupViewportPoints();

      this._viewportPointsGroupingNeeded = false;
    }

    if (this._pathUpdateNeeded) {
      this.updateViewportPoints();
      this.updatePath();

      this._pathUpdateNeeded = false;
    }
  }

  /**
   * Creates path
   */
  firstRender () {
    if (this._pathElement) {
      return;
    }

    // approximate viewport points for large data set
    this.regroupViewportPoints();

    // update svgX & svgY for each point
    this.updateViewportPoints();

    // creates and stores wrapper for following path element
    this._createGroup();

    // creates and stores initial path element
    this._createPath();
  }

  /**
   * @param {Chart} chart
   */
  setChart (chart) {
    this._chart = chart;
  }

  /**
   * @param {string} pathText
   */
  setPathText (pathText) {
    this._pathText = pathText;
  }

  /**
   * @param {SVGPathElement} pathElement
   */
  setPathElement (pathElement) {
    this._pathElement = pathElement;
  }

  /**
   * Shows series on the chart
   */
  setVisible () {
    this._visible = true;

    this.emit( 'visibleChange', this._visible );
  }

  /**
   * Hides series from the chart
   */
  setInvisible () {
    this._visible = false;

    this.emit( 'visibleChange', this._visible );
  }

  /**
   * Toggles series
   */
  toggleVisible () {
    this._visible
      ? this.setInvisible()
      : this.setVisible();
  }

  /**
   * @param {Array<number>} range
   * @param {Array<number>} rangeIndexes
   */
  setViewportRange (range, rangeIndexes) {
    const oldRangeIndexes = this._viewportRangeIndexes;

    this._viewportRange = range;
    this._viewportRangeIndexes = rangeIndexes;
    this._viewportDistance = this._viewportRange[ 1 ] - this._viewportRange[ 0 ];

    if (!arraysEqual( rangeIndexes, oldRangeIndexes )) {
      // mark to re-compute approximation in next animation update
      this._viewportPointsGroupingNeeded = true;
    }

    this._pathUpdateNeeded = true;

    // update minY and maxY local values
    this._updateLocalExtremes();
  }

  /**
   * Updates points array of viewport
   */
  updateViewportPoints () {
    for (let i = 0; i < this._viewportPoints.length; ++i) {
      const point = this._viewportPoints[ i ];
      point.setSvgXY(
        this._projectXToSvg( point.x ),
        this._projectYToSvg( point.y ),
      );
    }
  }

  /**
   * Approximate points for better performance
   */
  regroupViewportPoints () {
    let [ startIndex, endIndex ] = this._viewportRangeIndexes;

    startIndex = Math.max( 0, startIndex - 1 );
    endIndex = Math.min( this._points.length - 1, endIndex + 1 );

    // if we have no enough points
    // then we don't need to approximate
    if (endIndex - startIndex < 100) {
      // just slice points from the original array
      // [ startIndex, endIndex ]
      this._viewportPoints = this._points.slice(
        startIndex,
        endIndex + 1
      );

      // all work done here
      return;
    }

    let viewportPoints = [];
    let groupingLimitValue = this._groupingPixels * this._viewportPixelX;
    let groupStartIndex = startIndex;

    for (let i = startIndex + 1; i <= endIndex; ++i) {
      const point = this._points[ i ];

      const groupStartDifference = point.x - this._points[ groupStartIndex ].x;
      if (groupStartDifference >= groupingLimitValue || i === endIndex) {
        if (groupStartIndex !== i - 1) {
          // we have 2 or more points to group
          // [ startIndex, lastIndex ] all indexes inclusive
          const group = this._points.slice( groupStartIndex, i );
          const pointGroup = new PointGroup( group, true );
          viewportPoints.push( pointGroup );
        } else {
          if (startIndex === i - 1) {
            // add first point
            viewportPoints.push( this._points[ startIndex ] );
          }
          viewportPoints.push( point );
        }

        groupStartIndex = i;
      }
    }

    this._viewportPoints = viewportPoints;
  }

  /**
   * @param {number} currentYScale
   * @param {number} desiredYScale
   */
  setScale (currentYScale, desiredYScale) {
    this._currentYScale = currentYScale;
    this._localYScale = desiredYScale;
  }

  /**
   * Updates pixel value for each axis
   */
  updateViewportPixel () {
    this._viewportPixelX = this._viewportDistance / this._chartWidth;
    this._viewportPixelY = this._chart.globalExtremeDifference / this._chartHeight;
  }

  /**
   * Recompute path text
   */
  updatePath () {
    this._pathText = this._computePathText( this._viewportPoints );
    this._renderer.updatePath( this._pathElement, this._pathText );
  }

  /**
   * @return {number}
   */
  get id () {
    return this._id;
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
  get yAxis () {
    return this._yAxis;
  }

  /**
   * @return {string}
   */
  get pathText () {
    return this._pathText;
  }

  /**
   * @return {SVGPathElement}
   */
  get pathElement () {
    return this._pathElement;
  }

  /**
   * @return {{xAxis: Array<number>, yAxis: Array<number>, label: string, type: string, name: string, color: string, options: *}}
   */
  get settings () {
    return this._settings;
  }

  /**
   * @return {boolean}
   */
  get isVisible () {
    return this._visible;
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
   * @return {boolean}
   */
  get viewportPixelUpdateNeeded () {
    return this._viewportPixelUpdateNeeded;
  }

  /**
   * @private
   */
  _parseSettings () {
    const {
      xAxis, yAxis,
      label, type,
      color, name,
      width, height,
      options = {}
    } = this._settings;

    this._xAxis = xAxis;
    this._yAxis = yAxis;
    this._label = label;
    this._color = color;
    this._name = name;

    this._chartWidth = width;
    this._chartHeight = height;

    const groupingOptions = options.grouping;
    if (groupingOptions) {
      if (groupingOptions.pixels) {
        this._groupingPixels = ensureNumber( groupingOptions.pixels );
      }
    }

    this._seriesOptions = options;
  }

  /**
   * @private
   */
  _createGroup () {
    this._group = this._renderer.createGroup({
      class: 'telechart-series-path-group',
      id: `telechart-path-${this._id}`,
      x: 0,
      y: 0
    }, [], this._parent);
  }

  /**
   * @private
   */
  _createPath () {
    this._pathText = this._computePathText( this._viewportPoints );

    this._pathElement = this._renderer.createPath(this._pathText, {
      class: 'telechart-series-path',
      d: this._pathText,
      fill: 'none',
      stroke: this._color,
      strokeWidth: '2',
      strokeLinejoin: 'round',
      strokeLinecap: 'round'
    }, this._group);
  }

  /**
   * @private
   */
  _createPoints () {
    const xAxis = this._xAxis;
    const yAxis = this._yAxis;

    for (let i = 0; i < xAxis.length; ++i) {
      this._points.push(
        new Point( xAxis[ i ], yAxis[ i ] )
      );
    }
  }

  /**
   * @private
   */
  _updateGlobalExtremes () {
    const [ minValue, maxValue ] = arrayMinMax( this._yAxis );

    this._globalMinY = Math.min( 0, minValue );
    this._globalMaxY = maxValue;
  }

  /**
   * @private
   */
  _updateLocalExtremes () {
    const [ rangeStartIndex, rangeEndIndex ] = this._viewportRangeIndexes;

    const [ minValue, maxValue ] = arrayMinMax(
      this._yAxis, rangeStartIndex, rangeEndIndex
    );

    this._localMinY = Math.min( 0, minValue );
    this._localMaxY = maxValue;
  }

  /**
   * @param {number} x
   * @return {number}
   * @private
   */
  _projectXToSvg (x) {
    return this._toRelativeX( x ) / this._viewportPixelX;
  }

  /**
   * @param {number} y
   * @return {number}
   * @private
   */
  _projectYToSvg (y) {
    return this._chartHeight
      - (
        y - this._chart.localMinY
      ) / (
        this._viewportPixelY * this._currentYScale
      );
  }

  /**
   * @private
   */
  _addEvents () {
    this._renderer.on('resize', _ => {
      this._onRendererResize();
    });
  }

  /**
   * @private
   */
  _onRendererResize () {
    this._updateDimensions();

    this._pathUpdateNeeded = true;
    this._viewportPointsGroupingNeeded = true;
  }

  /**
   * @private
   */
  _updateDimensions () {
    this._chartWidth = this._renderer.width;

    // update value-per-pixel and min-max distance
    this.updateViewportPixel();
  }

  /**
   * @param {number} x
   * @return {number}
   * @private
   */
  _toRelativeX (x) {
    return x - this._viewportRange[ 0 ];
  }

  /**
   * @param {Array<Point | PointGroup>} points
   * @return {string}
   * @private
   */
  _computePathText (points = []) {
    let result = '';

    if (!points.length) {
      return result;
    }

    result += 'M';

    for (let i = 0; i < points.length; ++i) {
      const point = points[ i ];

      if (i !== 0) {
        result += 'L';
      }

      result += [ point.svgX, point.svgY ].join(' ') + ' ';
    }

    return result;
  }
}
