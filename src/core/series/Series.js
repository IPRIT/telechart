import { EventEmitter } from '../misc/EventEmitter';
import { arrayMinMax } from '../../utils';
import { Point } from '../point/Point';

export class Series extends EventEmitter {

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
   * @type {Array}
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
      options
    } = this._settings;

    this._xAxis = xAxis;
    this._yAxis = yAxis;
    this._label = label;
    this._color = color;
    this._name = name;

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
}
