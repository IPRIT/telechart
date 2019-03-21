import { EventEmitter } from '../misc/EventEmitter';
import { arrayMinMax, arraysEqual } from '../../utils';
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
  _parent = null;

  /**
   * @type {SvgRenderer}
   * @private
   */
  _renderer = null;

  /**
   * @type {Chart}
   * @private
   */
  _chart = null;

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
   * @type {Array<Point>}
   * @private
   */
  _points = [];

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
    this._addEvents();
  }

  /**
   * @param {number} deltaTime
   */
  update (deltaTime) {
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
   * @private
   */
  updateLocalExtremes () {
    const [ rangeStartIndex, rangeEndIndex ] = this._chart._viewportRangeIndexes;

    const [ minValue, maxValue ] = arrayMinMax(
      this._yAxis, rangeStartIndex, rangeEndIndex
    );

    this._localMinY = minValue;
    this._localMaxY = maxValue;
  }

  /**
   * Updates viewport points
   */
  updateViewportPoints () {
    this._chart._useViewportPointsInterval
      ? this.updateViewportPointsByInterval()
      : this.updateViewportPointsByArray();
  }

  /**
   * Updates points by array of points
   */
  updateViewportPointsByArray () {
    const indexes = this._chart._viewportPointsIndexes;

    for (let i = 0; i < indexes.length; ++i) {
      const pointIndex = indexes[ i ];
      const point = this._points[ pointIndex ];
      point.setSvgXY(
        this._projectXToSvg( point.x ),
        this._projectYToSvg( point.y ),
      );
    }
  }

  /**
   * Updates points by interval
   */
  updateViewportPointsByInterval () {
    const [ startIndex, endIndex ] = this._chart._viewportPointsIndexes;
    for (let i = startIndex; i <= endIndex; ++i) {
      const point = this._points[ i ];
      point.setSvgXY(
        this._projectXToSvg( point.x ),
        this._projectYToSvg( point.y ),
      );
    }
  }

  /**
   * Recompute path text
   */
  updatePath () {
    this._updatePathText();
    this._renderer.updatePath( this._pathElement, this._pathText );
  }

  /**
   * Mark to update path in next animation frame
   */
  requestPathUpdate () {
    this._pathUpdateNeeded = true;
  }

  /**
   * @return {number}
   */
  get id () {
    return this._id;
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
      options = {}
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
    this._updatePathText();

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
  _updatePathText () {
    this._pathText = this._chart._useViewportPointsInterval
      ? this._computePathTextByInterval( this._chart._viewportPointsIndexes )
      : this._computePathTextByArray( this._chart._viewportPointsIndexes );
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
   * @param {number} x
   * @return {number}
   * @private
   */
  _projectXToSvg (x) {
    return this._toRelativeX( x ) / this._chart._viewportPixelX;
  }

  /**
   * @param {number} y
   * @return {number}
   * @private
   */
  _projectYToSvg (y) {
    return this._chart.chartHeight - ( y - this._chart.currentLocalMinY ) / this._chart._viewportPixelY;
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
    this._pathUpdateNeeded = true;
  }

  /**
   * @param {number} x
   * @return {number}
   * @private
   */
  _toRelativeX (x) {
    return x - this._chart._viewportRange[ 0 ];
  }

  /**
   * @param {Array<number>} indexes
   * @return {string}
   * @private
   */
  _computePathTextByArray (indexes) {
    let result = '';

    if (!indexes.length) {
      return result;
    }

    result += 'M';

    let point;

    for (let i = 0; i < indexes.length; ++i) {
      if (i !== 0) {
        result += 'L';
      }

      point = this._points[ indexes[ i ] ];

      result += point.svgX + ' ' + point.svgY;
    }

    return result;
  }

  /**
   * @param {Array<number>} interval
   * @return {string}
   * @private
   */
  _computePathTextByInterval (interval) {
    let result = '';

    if (!interval.length
      || interval[ 1 ] - interval[ 0 ] <= 0) {
      return result;
    }

    result += 'M';

    const [ startIndex, endIndex ] = interval;

    for (let i = startIndex; i <= endIndex; ++i) {
      const point = this._points[ i ];

      if (i !== startIndex) {
        result += 'L';
      }

      result += point.svgX + ' ' + point.svgY;
    }

    return result;
  }
}
