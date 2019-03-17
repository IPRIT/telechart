import { EventEmitter } from '../misc/EventEmitter';
import { arrayMinMax } from '../../utils';
import { Point } from '../point/Point';

export class Series extends EventEmitter {

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
  _viewportPixel = 0;

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
  }

  /**
   * Creates path
   */
  firstRender () {
    if (this._pathElement) {
      return;
    }

    // todo: create path into group and then append it to parent
    this.updateSvgCoordinates();
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
    this._viewportRange = range;
    this._viewportRangeIndexes = rangeIndexes;
    this._viewportDistance = this._viewportRange[ 1 ] - this._viewportRange[ 0 ];

    // pre-compute pixel to increase performance
    this._updateViewportPixel();

    // update minY and maxY local values
    this._updateLocalExtremes();
  }

  /**
   * Updates points array of viewport
   */
  updateViewportPoints () {
    const [ startIndex, endIndex ] = this._viewportRangeIndexes;
    this._viewportPoints = this._points.slice( startIndex, endIndex + 1 );
  }

  /**
   * @param {number} currentYScale
   * @param {number} desiredYScale
   */
  setScale (currentYScale, desiredYScale) {
    this._currentYScale = currentYScale;
    this._localYScale = desiredYScale;
  }

  updateSvgCoordinates () {
    console.log( this._projectXToSvg( this._viewportPoints[0].x ) );
    console.log( this._projectXToSvg( this._viewportPoints[10].x ) );
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
   * @private
   */
  _parseSettings () {
    const {
      xAxis, yAxis,
      label, type,
      color, name,
      width, height,
      options
    } = this._settings;

    this._xAxis = xAxis;
    this._yAxis = yAxis;
    this._label = label;
    this._color = color;
    this._name = name;

    this._chartWidth = width;
    this._chartHeight = height;

    this._seriesOptions = options;
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
    return this._toRelativeX( x ) / this._viewportPixel;
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
  }

  /**
   * @private
   */
  _updateDimensions () {
    this._chartWidth = this._renderer.width;

    // update value-per-pixel and min-max distance
    this._updateViewportPixel();
  }

  /**
   * @private
   */
  _updateViewportPixel () {
    this._viewportPixel = this._viewportDistance / this._chartWidth;
  }

  /**
   * @param {number} x
   * @return {number}
   * @private
   */
  _toRelativeX (x) {
    return x - this._viewportRange[ 0 ];
  }
}
