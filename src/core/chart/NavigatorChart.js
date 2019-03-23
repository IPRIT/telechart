import { BaseChart } from './BaseChart';
import { ChartTypes } from './ChartTypes';
import {
  clampNumber,
  cssText,
  getElementOffset,
  isPassiveEventSupported, passiveIfSupported,
  setAttributeNS,
  setAttributesNS
} from '../../utils';
import { NavigatorChartEvents } from './events/NavigatorChartEvents';
import { Tween, TweenEvents } from '../animation/Tween';

export class NavigatorChart extends BaseChart {

  /**
   * @type {string}
   * @private
   */
  _type = ChartTypes.navigatorChart;

  /**
   * @type {number}
   * @private
   */
  _chartHeight = 45;

  /**
   * @type {number}
   * @private
   */
  _offsetY = 388;

  /**
   * @type {number}
   * @private
   */
  _paddingTopBottom = 2;

  /**
   * @type {number}
   * @private
   */
  _paddingLeftRight = 11;

  /**
   * @type {number}
   * @private
   * @readonly
   */
  _chartMaskPadding = 1;

  /**
   * @type {Element}
   * @private
   */
  _seriesGroup = null;

  /**
   * @type {Element}
   * @private
   */
  _navigatorGroup = null;

  /**
   * @type {Element}
   * @private
   */
  _sliderGroup = null;

  /**
   * @type {Element}
   * @private
   */
  _slider = null;

  /**
   * @type {Element}
   * @private
   */
  _sliderControllerLeft = null;

  /**
   * @type {Element}
   * @private
   */
  _sliderControllerRight = null;

  /**
   * @type {number}
   * @private
   */
  _sliderControllerWidth = 30;

  /**
   * @type {number}
   * @private
   */
  _sliderControllerOffset = 20;

  /**
   * @type {number}
   * @private
   */
  _sliderWidth = 0;

  /**
   * @type {number}
   * @private
   */
  _sliderLeftRightBorderWidth = 5;

  /**
   * @type {Element}
   * @private
   */
  _overlayLeft = null;

  /**
   * @type {Element}
   * @private
   */
  _overlayRight = null;

  /**
   * @type {number}
   * @private
   */
  _overlayLeftWidth = 0;

  /**
   * @type {number}
   * @private
   */
  _overlayRightWidth = 0;

  /**
   * @type {string}
   * @private
   */
  _overlayColor = 'rgba(240, 246, 249, 0.75)';

  /**
   * @type {boolean}
   * @private
   */
  _sliderUpdateNeeded = false;

  /**
   * @type {Array<number>}
   * @private
   */
  _navigatorRange = [ .7, 1 ];

  /**
   * @type {Tween}
   * @private
   */
  _navigatorRangeAnimation = null;

  /**
   * @type {*}
   * @private
   */
  _navigationRangeAnimationObject = null;

  /**
   * @type {number}
   * @private
   */
  _navigatorMinRangeDistance = .05;

  /**
   * @type {string}
   * @private
   */
  _navigatorChangeDirection = 'right';

  /**
   * Initializes navigator chart
   */
  initialize () {
    super.initialize();

    this._updateNavigatorDimensions();
    this._createNavigatorGroup();
    this._createOverlays();

    this._createSliderEventsListeners();
  }

  update (deltaTime) {
    super.update( deltaTime );

    const hasRangeAnimation = this._navigatorRangeAnimation && this._navigatorRangeAnimation.isRunning;
    if (hasRangeAnimation) {
      this._navigatorRangeAnimation.update( deltaTime );

      this.updateNavigationRange(
        ...[ this._navigationRangeAnimationObject.from, this._navigationRangeAnimationObject.to ]
      )
    }

    if (this._sliderUpdateNeeded) {
      this._updateNavigatorElements();

      this._sliderUpdateNeeded = false;
    }
  }

  /**
   * @param {number} min
   * @param {number} max
   * @param {*} options
   */
  animateNavigationRangeTo (min = 0, max = 1, options = {}) {
    const {
      duration = 300,
      timingFunction = 'easeInOutQuad'
    } = options;

    const [ newMin, newMax ] = this._clampNavigationRange( min, max );

    if (this._navigatorRangeAnimation) {
      return this._navigatorRangeAnimation.patchAnimation( [ newMin, newMax ] );
    }

    this._navigationRangeAnimationObject = {
      from: this._navigatorRange[ 0 ],
      to: this._navigatorRange[ 1 ]
    };

    this._navigatorRangeAnimation = new Tween(this._navigationRangeAnimationObject, [ 'from', 'to' ], [
      newMin, newMax
    ], {
      duration, timingFunction
    });

    const onFinished = _ => {
      this._navigatorRangeAnimation = null;
    };

    this._navigatorRangeAnimation.on( TweenEvents.COMPLETE, onFinished );
    this._navigatorRangeAnimation.on( TweenEvents.CANCELLED, onFinished );

    this._navigatorRangeAnimation.start();

    this.emit( NavigatorChartEvents.ANIMATE_RANGE, [ newMin, newMax ] );
  }

  /**
   * @param {number} min
   * @param {number} max
   * @param {boolean} emitChange
   */
  setNavigationRange (min = 0, max = 1, { emitChange = true } = {}) {
    [ min, max ] = this._clampNavigationRange( min, max );
    this._navigatorRange = [ min, max ];

    this._updateNavigatorDimensions();
    this._sliderUpdateNeeded = true;

    if (emitChange) {
      this.emit( NavigatorChartEvents.RANGE_CHANGED, this._navigatorRange );
    }
  }


  /**
   * @param {number} min
   * @param {number} max
   */
  updateNavigationRange (min, max) {
    this.setNavigationRange( min, max, { emitChange: false } );
  }

  /**
   * Creates SVG group for storing series paths
   */
  createSeriesGroup () {
    this._seriesGroup = this.renderer.createGroup({
      class: 'telechart-navigator-series-group',
      transform: `translate(0, ${this._offsetY}) scale(1 1)`,
      mask: `url(#${this.chartMaskId})`
    });
  }

  onRendererResize () {
    super.onRendererResize();

    this._updateNavigatorDimensions();
    this._sliderUpdateNeeded = true;
  }

  /**
   * @return {number}
   */
  get chartHeight () {
    return this._chartHeight;
  }

  /**
   * @return {number}
   */
  get navigatorWidth () {
    return this.chartWidth - this._paddingLeftRight * 2;
  }

  /**
   * @return {number}
   */
  get navigatorHeight () {
    return this._chartHeight + this._paddingTopBottom * 2;
  }

  /**
   * @private
   */
  _updateNavigatorDimensions () {
    const overlayLeftScale = this._navigatorRange[ 0 ];
    const overlayRightScale = ( 1 - this._navigatorRange[ 1 ] );
    const navigatorWidth = this.navigatorWidth;

    this._overlayLeftWidth = navigatorWidth * overlayLeftScale;
    this._overlayRightWidth = navigatorWidth * overlayRightScale;
    this._sliderWidth = navigatorWidth - this._overlayLeftWidth - this._overlayRightWidth;
  }

  /**
   * @private
   */
  _createNavigatorGroup () {
    const offsetY = this._offsetY - this._paddingTopBottom;

    this._navigatorGroup = this.renderer.createGroup({
      class: 'telechart-navigator',
      transform: `translate(${this._paddingLeftRight}, ${offsetY}) scale(1 1)`,
    });
  }

  /**
   * @private
   */
  _createOverlays () {
    this._overlayLeft = this.renderer.createRect(this._overlayLeftWidth, this.navigatorHeight, {
      class: 'telechart-navigator-overlay',
      x: 0,
      y: 0,
      style: cssText({
        fill: this._overlayColor
      })
    }, this._navigatorGroup);

    this._overlayRight = this.renderer.createRect(this._overlayRightWidth, this.navigatorHeight, {
      class: 'telechart-navigator-overlay',
      x: this.navigatorWidth - this._overlayRightWidth,
      y: 0,
      style: cssText({
        fill: this._overlayColor
      })
    }, this._navigatorGroup);

    // creating slider
    this._sliderGroup = this.renderer.createGroup({
      class: 'telechart-navigator-slider-group',
      transform: `translate(${this._overlayLeftWidth}, 0) scale(1 1)`,
      fill: 'none'
    }, [], this._navigatorGroup);

    this._slider = this.renderer.createRect(this._sliderWidth, this.navigatorHeight, {
      class: 'telechart-navigator-slider',
      x: 0,
      y: 0,
      fill: 'rgba(163, 196, 220, 0.47)'
    }, this._sliderGroup);

    this._sliderControllerLeft = this.renderer.createRect(this._sliderControllerWidth, this.navigatorHeight, {
      class: 'telechart-navigator-slider-controller left',
      x: -this._sliderControllerOffset,
      y: 0,
      fill: 'rgba(255,255,255,.0001)'
    }, this._sliderGroup);

    this._sliderControllerRight = this.renderer.createRect(this._sliderControllerWidth, this.navigatorHeight, {
      class: 'telechart-navigator-slider-controller right',
      x: this._sliderWidth - this._sliderControllerWidth + this._sliderControllerOffset,
      y: 0,
      fill: 'rgba(255,255,255,.0001)'
    }, this._sliderGroup);

    // creating mask
    const maskId = `telechart-navigator-slider-mask-${this.id}`;
    this._sliderMask = this.renderer.createMask({
      id: maskId
    }, [], this.defs);

    this._sliderMaskOuter = this.renderer.createRect(this._sliderWidth, this.navigatorHeight, {
      x: 0,
      y: 0,
      fill: 'white'
    }, this._sliderMask);

    this._sliderMaskInner = this.renderer.createRect(this._sliderWidth - 2 * this._sliderLeftRightBorderWidth, this.navigatorHeight - 2, {
      x: this._sliderLeftRightBorderWidth,
      y: 1,
      fill: 'black'
    }, this._sliderMask);

    // connect mask to slider
    setAttributeNS( this._sliderGroup, 'mask', `url(#${maskId})`, null );
  }

  /**
   * @private
   */
  _updateNavigatorElements () {
    // left overlay
    setAttributeNS( this._overlayLeft, 'width', this._overlayLeftWidth, null );

    // right overlay
    setAttributeNS( this._overlayRight, 'width', this._overlayRightWidth, null );
    setAttributeNS( this._overlayRight, 'x', this.navigatorWidth - this._overlayRightWidth, null );

    // slider
    setAttributeNS( this._sliderGroup, 'transform', `translate(${this._overlayLeftWidth}, 0) scale(1 1)`, null );
    setAttributeNS( this._slider, 'width', this._sliderWidth, null );
    setAttributeNS( this._sliderControllerRight, 'x', this._sliderWidth - this._sliderControllerWidth + this._sliderControllerOffset, null );

    // mask
    setAttributeNS( this._sliderMaskOuter, 'width', this._sliderWidth, null );
    setAttributesNS(this._sliderMaskInner, {
      width: Math.max( 0, this._sliderWidth - 2 * this._sliderLeftRightBorderWidth ),
      height: this.navigatorHeight - 2,
      x: this._sliderLeftRightBorderWidth
    });
  }

  /**
   * @param {number} min
   * @param {number} max
   * @param {boolean} preserveDistance
   * @return {Array<number>}
   * @private
   */
  _clampNavigationRange (min = 0, max = 1, preserveDistance = false) {
    const preservedDistance = clampNumber( max - min, this._navigatorMinRangeDistance, 1 );

    min = clampNumber( min, 0, 1 );
    max = clampNumber( max, 0, 1 );

    const isRightController = this._navigatorChangeDirection === 'right';

    const distance = max - min;
    const minDistance = preserveDistance
      ? preservedDistance
      : this._navigatorMinRangeDistance;

    if (distance < minDistance) {
      if (isRightController) {
        if (max - minDistance >= 0) {
          min = max - minDistance;
        } else {
          min = 0;
          max = minDistance;
        }
      } else {
        if (min + minDistance <= 1) {
          max = min + minDistance;
        } else {
          max = 1;
          min = 1 - minDistance;
        }
      }
    }

    return [ min, max ];
  }

  /**
   * @private
   */
  _createSliderEventsListeners () {
    this._sliderTouchStartListener = this._onSliderTouchStart.bind( this );
    this._sliderTouchMoveListener = this._onSliderTouchMove.bind( this );
    this._sliderMouseDownListener = this._onSliderMouseDown.bind( this );

    this._slider.addEventListener( 'touchstart', this._sliderTouchStartListener, passiveIfSupported );
    this._slider.addEventListener( 'touchmove', this._sliderTouchMoveListener, passiveIfSupported );

    this._slider.addEventListener( 'mousedown', this._sliderMouseDownListener );
  }

  /**
   * @param {TouchEvent} ev
   * @private
   */
  _onSliderTouchStart (ev) {
    const {
      pageX, pageY
    } = ev.targetTouches[ 0 ];

    this._sliderTouchStartEvent = {
      pageX, pageY
    };

    this._sliderTouchStartPosition = this._navigatorRange.slice();
  }

  /**
   * @param {TouchEvent} ev
   * @private
   */
  _onSliderTouchMove (ev) {
    const targetTouch = ev.targetTouches[ 0 ];

    const {
      pageX: startPageX
    } = this._sliderTouchStartEvent;

    const {
      pageX = 0
    } = targetTouch;

    const positionDelta = ( startPageX - pageX ) / this.navigatorWidth;

    let [ min, max ] = this._clampNavigationRange(
      this._sliderTouchStartPosition[ 0 ] - positionDelta,
      this._sliderTouchStartPosition[ 1 ] - positionDelta,
      true
    );

    this.setNavigationRange( min, max );
  }

  /**
   * @param {MouseEvent} ev
   * @private
   */
  _onSliderMouseDown (ev) {
    const sliderStartPosition = this._navigatorRange.slice();
    const sliderMouseMoveListener = this._onSliderMouseMove.bind( this, ev, sliderStartPosition );

    const lastBodyStyle = document.body.getAttribute( 'style' );
    setAttributeNS( document.body, 'style', cssText({ cursor: 'grabbing' }), null );
    setAttributeNS( this._slider, 'style', cssText({ cursor: 'grabbing' }), null );

    document.addEventListener('mousemove', sliderMouseMoveListener);
    document.addEventListener('mouseup', ev => {
      if (lastBodyStyle) {
        setAttributeNS( document.body, 'style', lastBodyStyle, null );
      } else {
        document.body.removeAttribute( 'style' );
      }
      setAttributeNS( this._slider, 'style', cssText({ cursor: 'grab' }), null );

      document.removeEventListener( 'mousemove', sliderMouseMoveListener )
    });
  }

  /**
   * @param {Event} downEvent
   * @param {number} startPosition
   * @param {Event} ev
   * @private
   */
  _onSliderMouseMove (downEvent, startPosition, ev) {
    ev.preventDefault();

    const {
      pageX: startPageX
    } = downEvent;

    const {
      pageX = 0
    } = ev;

    const positionDelta = ( startPageX - pageX ) / this.navigatorWidth;

    let [ min, max ] = this._clampNavigationRange(
      startPosition[ 0 ] - positionDelta,
      startPosition[ 1 ] - positionDelta,
      true
    );

    this.setNavigationRange( min, max );
  }

  /**
   * @param {number} pageX
   * @param {number} pageY
   * @private
   */
  _resolveNavigatorPosition ({ pageX, pageY }) {
    const { left } = getElementOffset( this._navigatorGroup );
    return ( pageX - left ) / this.navigatorWidth;
  }
}
