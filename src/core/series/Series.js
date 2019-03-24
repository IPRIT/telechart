import { EventEmitter } from '../misc/EventEmitter';
import { arrayMinMax, arraysEqual, setAttributeNS, setAttributesNS } from '../../utils';
import { Point } from '../point/Point';
import { PointGroup } from '../point/PointGroup';
import { Tween, TweenEvents } from '../animation/Tween';
import { ChartTypes } from '../chart/ChartTypes';

let SERIES_AUTOINCREMENT = 1;

export const OpacityAnimationType = {
  hiding: 1,
  showing: 2
};

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
   * @type {boolean}
   * @private
   */
  _isSimpleChart = false;

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
   * @type {number}
   * @private
   */
  _strokeWidth = 1;

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
   * @type {SVGCircleElement}
   * @private
   */
  _marker = null;

  /**
   * @type {Element}
   * @private
   */
  _markersGroup = null;

  /**
   * @type {boolean}
   * @private
   */
  _markerVisible = false;

  /**
   * @type {Tween}
   * @private
   */
  _markerAnimation = null;

  /**
   * @type {number}
   * @private
   */
  _markerRadius = 0;

  /**
   * @type {number}
   * @private
   */
  _maxMarkerRadius = 4;

  /**
   * @type {number}
   * @private
   */
  _markerPointIndex = 0;

  /**
   * @type {boolean}
   * @private
   */
  _markerPositionUpdateNeeded = false;

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
   * @type {number}
   * @private
   */
  _opacity = 1;

  /**
   * @type {Tween}
   * @private
   */
  _opacityAnimation = null;

  /**
   * @type {string}
   * @private
   */
  _opacityAnimationType = null;

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
    let pathUpdated = false;

    if (this._pathUpdateNeeded) {
      this.updateViewportPoints();
      this.updatePath();

      this._pathUpdateNeeded = false;
      pathUpdated = true;
    }

    if (this._opacityAnimation
      && this._opacityAnimation.isRunning) {
      this._opacityAnimation.update( deltaTime );
      this.updatePathOpacity();
    }

    // only base charts has markers
    if (this._isSimpleChart) {
      if (this._markerPositionUpdateNeeded || pathUpdated) {
        this._updateMarkerPosition();

        this._markerPositionUpdateNeeded = false;
      }

      const markerAnimation = this._markerAnimation;
      const hasMarkerAnimation = markerAnimation && markerAnimation.isRunning;
      if (hasMarkerAnimation) {
        markerAnimation.update( deltaTime );

        this.updateMarkerRadius();
      }
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

    if (this._isSimpleChart) {
      this._createMarker();
    }
  }

  /**
   * @param {Chart | NavigatorChart | BaseChart} chart
   */
  setChart (chart) {
    this._chart = chart;
    this._isSimpleChart = chart.chartType === ChartTypes.chart;
  }

  /**
   * Shows series on the chart
   */
  setVisible () {
    this._visible = true;
    this._createShowAnimation();

    this.emit( 'visibleChange', this._visible );
  }

  /**
   * Hides series from the chart
   */
  setInvisible () {
    this._visible = false;
    this._createHideAnimation();

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

  showMarker () {
    this._createMarkerShowAnimation();
    this._markerVisible = true;
  }

  hideMarker () {
    this._createMarkerHideAnimation();
    this._markerVisible = false;
  }

  toggleMarker () {
    this._markerVisible
      ? this.hideMarker()
      : this.showMarker();
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
        this._chart.projectXToSvg( point.x ),
        this._chart.projectYToSvg( point.y ),
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
        this._chart.projectXToSvg( point.x ),
        this._chart.projectYToSvg( point.y ),
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
   * Recompute path text
   */
  updatePathOpacity () {
    setAttributeNS( this._pathElement, 'opacity', this._opacity, null );
  }

  /**
   * Recompute path text
   */
  updateMarkerRadius () {
    setAttributeNS( this._marker, 'r', this._markerRadius, null );
  }

  /**
   * Mark to update path in next animation frame
   */
  requestPathUpdate () {
    this._pathUpdateNeeded = true;
  }

  /**
   * Mark to update marker in next animation frame
   */
  setMarkerPointIndex (index) {
    this._markerPointIndex = index;
    this._markerPositionUpdateNeeded = true;
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
  get label () {
    return this._label;
  }

  /**
   * @return {string}
   */
  get color () {
    return this._color;
  }

  /**
   * @return {string}
   */
  get name () {
    return this._name;
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
   * @return {string}
   */
  get opacityAnimationType () {
    return this._opacityAnimationType;
  }

  /**
   * @return {boolean}
   */
  get isShowing () {
    return this._opacityAnimationType === OpacityAnimationType.showing;
  }

  /**
   * @return {boolean}
   */
  get isHiding () {
    return this._opacityAnimationType === OpacityAnimationType.hiding;
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

    const {
      strokeWidth = 1
    } = options;

    this._strokeWidth = strokeWidth;

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
      strokeWidth: this._strokeWidth,
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
   * @private
   */
  _createMarker () {
    if (!this._markerGroup) {
      this._markerGroup = this._resolveMarkersGroup();
    }

    this._marker = this._renderer.createCircle(0, 0, this._markerRadius, {
      class: 'telechart-chart-marker',
      stroke: this._color,
      strokeWidth: 2,
      fill: 'white'
    }, this._markerGroup);
  }

  /**
   * @return {Element}
   * @private
   */
  _resolveMarkersGroup () {
    const markersGroupClass = 'telechart-chart-markers';
    const markersGroup = this._renderer.svgContainer.querySelector( `.${markersGroupClass}` );

    if (markersGroup) {
      return markersGroup;
    }

    return this._renderer.createGroup({
      class: markersGroupClass,
      transform: `translate(0, ${this._chart._seriesGroupTop}) scale(1 1)`,
    });
  }

  /**
   * @private
   */
  _updateMarkerPosition () {
    const x = this._xAxis[ this._markerPointIndex ];
    const y = this._yAxis[ this._markerPointIndex ];

    const svgX = this._chart.projectXToSvg( x );
    const svgY = this._chart.projectYToSvg( y );

    setAttributesNS(this._marker, {
      cx: svgX,
      cy: svgY
    });
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

  /**
   * @private
   */
  _createShowAnimation () {
    if (this._opacityAnimation
      && this._opacityAnimationType === OpacityAnimationType.showing) {
      return;
    }
    this._createOpacityAnimation( 1 );
    this._opacityAnimationType = OpacityAnimationType.showing;
  }

  /**
   * @private
   */
  _createHideAnimation () {
    if (this._opacityAnimation
      && this._opacityAnimationType === OpacityAnimationType.hiding) {
      return;
    }
    this._createOpacityAnimation( 0 );
    this._opacityAnimationType = OpacityAnimationType.hiding;
  }

  /**
   * @param {number} opacity
   * @private
   */
  _createOpacityAnimation (opacity) {
    this._opacityAnimation = new Tween(this, '_opacity', opacity, {
      duration: 300,
      timingFunction: 'easeInOutQuad'
    });

    const onFinished = _ => {
      this._opacityAnimation = null;
      this._opacityAnimationType = null;
      this.requestPathUpdate();
    };

    this._opacityAnimation.on( TweenEvents.COMPLETE, onFinished );
    this._opacityAnimation.on( TweenEvents.CANCELLED, onFinished );

    this._opacityAnimation.start();
  }

  /**
   * @private
   */
  _createMarkerShowAnimation () {
    if (this._markerAnimation && this._markerVisible) {
      // already have animation
      return;
    }

    this._createMarkerAnimation( this._maxMarkerRadius );
  }

  /**
   * @private
   */
  _createMarkerHideAnimation () {
    if (this._markerAnimation && !this._markerVisible) {
      // already have animation
      return;
    }

    this._createMarkerAnimation( 0 );
  }

  /**
   * @param {number} radius
   * @private
   */
  _createMarkerAnimation (radius) {
    this._markerAnimation = new Tween(this, '_markerRadius', radius, {
      duration: this._markerVisible ? 300 : 100,
      timingFunction: 'easeInOutCubic'
    });

    const onFinished = _ => {
      this._markerAnimation = null;
    };

    this._markerAnimation.on( TweenEvents.COMPLETE, onFinished );
    this._markerAnimation.on( TweenEvents.CANCELLED, onFinished );

    this._markerAnimation.start();
  }
}
