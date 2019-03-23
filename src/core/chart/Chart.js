import { BaseChart } from './BaseChart';
import { binarySearchIndexes, cssText, getElementOffset, setAttributeNS } from '../../utils';
import { ChartTypes } from './ChartTypes';

export class Chart extends BaseChart {

  /**
   * @type {string}
   * @private
   */
  _type = ChartTypes.chart;

  /**
   * @type {number}
   * @private
   */
  _chartHeight = 280;

  /**
   * @type {number}
   * @private
   */
  _chartMaskPadding = 20;

  /**
   * @type {Element}
   * @private
   */
  _seriesGroup = null;

  /**
   * @type {number}
   * @private
   */
  _seriesGroupTop = 70;

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
   * Initializes chart
   */
  initialize () {
    super.initialize();

    this._initializeAxisCursor();
  }

  /**
   * @param {number} deltaTime
   */
  update (deltaTime) {
    super.update(deltaTime);

    if (this._axisCursorUpdateNeeded) {
      this._updateAxisCursor();

      this._axisCursorUpdateNeeded = false;
    }
  }

  /**
   * Creates SVG group for storing series paths
   */
  createSeriesGroup () {
    this._seriesGroup = this.renderer.createGroup({
      class: 'telechart-series-group',
      transform: `translate(0, ${this._seriesGroupTop}) scale(1 1)`,
      mask: `url(#${this.chartMaskId})`
    });

    this.renderer.createRect(this.renderer.width, '1px', {
      fill: '#ccc',
      y: 1,
      style: cssText({
        shapeRendering: 'crispEdges'
      })
    }, this._seriesGroup);

    this.renderer.createRect(this.renderer.width, '1px', {
      fill: '#ccc',
      y: this.chartHeight,
      style: cssText({
        shapeRendering: 'crispEdges'
      })
    }, this._seriesGroup);
  }

  /**
   * @param {number} min
   * @param {number} max
   */
  setNavigationRange (min, max) {
    const [ minX, maxX ] = this._resolveNavigationRange( min, max );

    this.setViewportRange( minX, maxX );
  }

  /**
   * @param {number} min
   * @param {number} max
   */
  animateNavigationRangeTo (min, max) {
    const [ minX, maxX ] = this._resolveNavigationRange( min, max );

    this.animateViewportRangeTo( minX, maxX );
  }

  /**
   * Sets initial viewport range for the chart
   */
  setInitialRange () {
    const globalMinX = this.xAxis[ 0 ];
    const globalMaxX = this.xAxis[ this.xAxis.length - 1 ];
    const initialViewport = Math.floor( ( globalMaxX - globalMinX ) * .3 );
    const viewportPadding = this.computeViewportPadding(
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
   * @param {*} options
   * @return {*}
   */
  extendSeriesOptions (options) {
    return Object.assign({}, options, {
      strokeWidth: 2
    });
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

  onRendererResize () {
    super.onRendererResize();

    this._axisCursorUpdateNeeded = true;
  }

  /**
   * @return {number}
   */
  get chartHeight () {
    return this._chartHeight;
  }

  /**
   * @param {number} min
   * @param {number} max
   * @private
   */
  _resolveNavigationRange (min, max) {
    const globalMinX = this.xAxis[ 0 ];
    const globalMaxX = this.xAxis[ this.xAxis.length - 1 ];

    const globalDistance = globalMaxX - globalMinX;

    let minX = globalMinX + min * globalDistance;
    let maxX = globalMinX + max * globalDistance;

    const padding = this.computeViewportPadding( minX, maxX );

    return [ minX - padding, maxX + padding ];
  }

  /**
   * @private
   */
  _initializeAxisCursor () {
    this._createAxisCursor();
    this._addAxisCursorEvents();
  }

  /**
   * @private
   */
  _createAxisCursor () {
    const pathText = this._computeAxisCursorPath();

    this._axisCursor = this.renderer.createPath(pathText, {
      class: 'telechart-chart-cursor',
      strokeWidth: 1,
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
    this._onCursorMove( targetTouch );

    if (this._cursorInsideChart) {
      ev.preventDefault();
    }
  }

  /**
   * @param {TouchEvent} ev
   * @private
   */
  _onTouchMove (ev) {
    const targetTouch = ev.targetTouches[ 0 ];
    this._onCursorMove( targetTouch );

    if (this._cursorInsideChart) {
      ev.preventDefault();
    }
  }

  /**
   * @param {TouchEvent} ev
   * @private
   */
  _onTouchEnd (ev) {
    this._onCursorLeave();
  }

  /**
   * @param cursorPosition
   * @private
   */
  _onCursorMove (cursorPosition) {
    this._setInsideChartState(
      this._insideChart( cursorPosition )
    );

    if (!this._cursorInsideChart) {
      return;
    }

    this._axisCursorPositionX = this.projectCursorToX( cursorPosition );
    this._axisCursorPointIndex = this._findPointIndexByCursor( this._axisCursorPositionX );
    this._axisCursorUpdateNeeded = true;

    this.eachSeries(line => {
      line.setMarkerPointIndex( this._axisCursorPointIndex );
    });
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
    this._onCursorInsideChartChanged( isInside );
  }

  /**
   * @param {boolean} isInside
   * @private
   */
  _onCursorInsideChartChanged (isInside) {
    if (isInside) {
      this._showMarkers();
      this._showCursor();
    } else {
      this._hideMarkers();
      this._hideCursor();
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
}
