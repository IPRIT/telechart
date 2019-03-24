import { EventEmitter } from '../../misc/EventEmitter';
import { arrayDiff, removeElement, setAttributeNS, setAttributes } from '../../../utils';
import { Tween, TweenEvents } from '../../animation/Tween';

export const AxisElementState = {
  pending: 1,
  showing: 2,
  hiding: 3
};

export class ChartAxis extends EventEmitter {

  /**
   * @type {SvgRenderer}
   */
  renderer = null;

  /**
   * @type {Chart | BaseChart}
   */
  chart = null;

  /**
   * @type {Element}
   */
  valuesGroup = null;

  /**
   * @type {Element}
   */
  axesGroup = null;

  /**
   * @type {Array<string | number>}
   */
  axesValues = [];

  /**
   * Active elements (current + showing)
   * @type {Array<{state: *, value: *, valueElement: Element, axisElement: Element}>}
   */
  elements = [];

  /**
   * @type {boolean}
   */
  positionUpdateNeeded = false;

  /**
   * @param {SvgRenderer} renderer
   */
  constructor (renderer) {
    super();

    this.renderer = renderer;
  }

  initialize () {
    this.createAxesGroup();
    this.createValuesGroup();

    this.updateValues();

    this.createAxes();
  }

  /**
   * @param {number} deltaTime
   */
  update (deltaTime) {
    this._updateAnimations( deltaTime );

    if (this.positionUpdateNeeded) {
      this.updatePositions();

      this.positionUpdateNeeded = false;
    }
  }

  /**
   * Update position in next animation frame
   */
  requestUpdatePosition () {
    this.positionUpdateNeeded = true;
  }

  updatePositions () {
  }

  updateAnimations () {
    const oldValues = this.axesValues;
    this.updateValues();

    const valuesToDelete = arrayDiff( this.axesValues, oldValues );
    const valuesToCreate = this.axesValues.filter(value => {
      return oldValues.indexOf( value ) === -1;
    });

    this.createNewElements( valuesToCreate );
    this.deleteOldElements( valuesToDelete );
  }

  /**
   * @param valuesToCreate
   */
  createNewElements (valuesToCreate) {
    for (let i = 0; i < valuesToCreate.length; ++i) {
      const value = valuesToCreate[ i ];
      let element = this._getElementByValue( value );
      let created = false;

      if (element) {
        if (element.state === AxisElementState.pending) {
          // already attached
          continue;
        }

        if (element.state === AxisElementState.hiding) {
          // prevent from searching element again
          element.hiddenFromSearch = true;
          element = null;
        }
      }

      if (!element) {
        element = this.createNewElement( value );
        created = true;
      }

      this.createShowingAnimation( element );

      if (created) {
        this.elements.push( element );
      }
    }
  }

  /**
   * @param value
   */
  createNewElement (value) {
  }

  /**
   * @param valuesToDelete
   */
  deleteOldElements (valuesToDelete) {
    for (let i = 0; i < valuesToDelete.length; ++i) {
      const value = valuesToDelete[ i ];
      let element = this._getElementByValue( value );

      if (!element
        || element.state === AxisElementState.hiding) {
        // already hiding or deleted
        continue;
      }

      if (element.state === AxisElementState.showing) {
        const { animation: showing } = element;
        showing && showing.cancel();
      }

      this.createHidingAnimation( element );
    }
  }

  /**
   * @param {*} element
   * @return {number}
   */
  createShowingAnimation (element) {
    if (element.opacity === 1) {
      return ( element.state = AxisElementState.pending );
    }

    const onComplete = _ => {
      element.animation = null;
      element.state = AxisElementState.pending;
    };

    const animation = new Tween(element, 'opacity', 1, {
      duration: 300,
      timingFunction: 'easeInOutQuad'
    });
    animation.on( TweenEvents.COMPLETE, onComplete );
    animation.start();

    element.animation = animation;
    element.state = AxisElementState.showing;
  }

  /**
   * @param {*} element
   */
  createHidingAnimation (element) {
    const onComplete = _ => {
      this.detachElement( element );
    };

    const animation = new Tween(element, 'opacity', 0, {
      duration: 300,
      timingFunction: 'easeInOutQuad'
    });

    animation.on( TweenEvents.COMPLETE, onComplete );
    animation.start();

    element.animation = animation;
    element.state = AxisElementState.hiding;
  }

  /**
   * @param {{state: *, value: *, valueElement: Element, axisElement: Element}} element
   */
  detachElement (element) {
    const { value, valueElement, axisElement } = element;
    const indexToDelete = this._getElementIndexByValue( element.value );

    if (indexToDelete < 0) {
      return;
    }

    valueElement && removeElement( valueElement );
    axisElement && removeElement( axisElement );

    this.elements.splice( indexToDelete, 1 );
  }

  /**
   * @param {Chart | BaseChart} chart
   */
  setChart (chart) {
    this.chart = chart;
  }

  /**
   * @abstract
   */
  createValuesGroup () {
  }

  /**
   * @abstract
   */
  createAxesGroup () {
  }

  createAxes () {
  }

  /**
   * @return {Array<string | number>}
   */
  computeAxisValues () {
    return [];
  }

  /**
   * Updates axes values
   */
  updateValues () {
    this.axesValues = this.computeAxisValues();
  }

  onChartResize () {
  }

  /**
   * @param {Function} fn
   */
  eachElement (fn = () => {}) {
    for (let i = 0; i < this.elements.length; ++i) {
      fn( this.elements[ i ] );
    }
  }

  /**
   * @param value
   * @return {{state: *, value: *, valueElement: Element, axisElement: Element}}
   * @private
   */
  _getElementByValue (value) {
    for (let i = 0; i < this.elements.length; ++i) {
      const { value: elementValue, hiddenFromSearch = false } = this.elements[ i ];
      if (value === elementValue && !hiddenFromSearch) {
        return this.elements[ i ];
      }
    }
  }

  /**
   * @param value
   * @return {number}
   * @private
   */
  _getElementIndexByValue (value) {
    for (let i = 0; i < this.elements.length; ++i) {
      if (value === this.elements[ i ].value) {
        return i;
      }
    }
  }

  /**
   * @param {number} deltaTime
   * @private
   */
  _updateAnimations (deltaTime) {
    for (let i = 0; i < this.elements.length; ++i) {
      const element = this.elements[ i ];

      if (element.animation) {
        const { axisElement, valueElement, animation } = element;

        animation.update( deltaTime );

        setAttributeNS( axisElement, 'stroke-opacity', element.opacity, null );
        setAttributeNS( valueElement, 'opacity', element.opacity, null );
      }
    }
  }
}
