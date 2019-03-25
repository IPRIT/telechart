import { AxisElementState, ChartAxis } from './ChartAxis';
import { arrayDiff, clampNumber, cssText, setAttributeNS, setAttributesNS } from '../../../utils';

export class ChartAxisX extends ChartAxis {

  /**
   * @type {*}
   */
  axesValuesMapping = {};

  /**
   * @type {number}
   */
  labelWidth = 37;

  /**
   * @type {number|null}
   * @private
   */
  _interval = null;

  /**
   * Update values positions
   */
  updatePositions () {
    this.eachElement(element => {
      const { valueElement, value } = element;

      this._updateValueElementPosition( valueElement, this.axesValuesMapping[ value ] );
    });
  }

  createValuesGroup () {
    this.valuesGroup = this.renderer.createGroup({
      class: 'telechart-chart-axes-values-x',
      transform: `translate(0, ${this.chart.seriesGroupTop + this.chart.chartHeight + 18}) scale(1 1)`
    }, []);
  }

  createAxesGroup () {
  }

  computeAxisValues () {
    const chart = this.chart;
    const chartWidth = chart.chartWidth;
    const minLabelWidth = 70;
    const pixelX = this.chart.viewportPixelX;
    const viewportMinX = chart.viewportRange[ 0 ];
    const viewportMaxX = chart.viewportRange[ 1 ];
    const distance = viewportMaxX - viewportMinX;

    if (!distance) {
      return [];
    }

    const maxAvailableLabels = chartWidth / minLabelWidth;

    if (this._interval == null) {
      this._interval = pixelX * chartWidth / maxAvailableLabels;
    }

    const pixelInterval = this._interval / pixelX;
    if (pixelInterval < minLabelWidth) {
      this._interval *= 2;
    } else if (pixelInterval > minLabelWidth * 2) {
      this._interval *= .5;
    }

    let currentValue = viewportMaxX;

    if (this.axesValues.length > 0) {
      const currentLastDate = this.axesValues[ this.axesValues.length - 1 ];
      const currentLastValue = this.axesValuesMapping[ currentLastDate ];

      const prevValue = currentLastValue - this._interval;
      const nextValue = currentLastValue + this._interval;

      const toLeft = this._lastMaxX > viewportMaxX;

      if (viewportMaxX > prevValue && viewportMaxX < nextValue) {
        currentValue = currentLastValue;
      } else if (toLeft) {
        currentValue = currentLastValue - this._interval;
      } else {
        currentValue = currentLastValue + this._interval;
      }
    }

    this._lastMaxX = viewportMaxX;

    let result = [];

    while (currentValue >= viewportMinX) {
      result.unshift( currentValue );
      currentValue -= this._interval;
    }

    return result;
  }

  create () {
    const values = this.axesValues;

    for (let i = 0; i < values.length; ++i) {
      const element = this.createNewElement( values[ i ], true );

      // without animation
      element.state = AxisElementState.pending;
      element.opacity = 1;

      this.elements.push( element );
    }
  }

  /**
   * @param value
   * @param {boolean} initial
   * @return {{axisElement: SVGPathElement, valueElement: SVGTextElement, state: number, opacity: number, value: *}}
   */
  createNewElement (value, initial = false) {
    const valueElement = this._createValueElement( value, initial );

    return {
      value,
      opacity: 0,
      animation: null,
      state: AxisElementState.showing,
      axisElement: null,
      valueElement
    };
  }

  onChartResize () {
    super.onChartResize();
  }

  updateValues () {
    super.updateValues();

    const dates = this.axesValues.map(value => {
      return this._toDateString( value );
    });

    for (let i = 0; i < dates.length; ++i) {
      this.axesValuesMapping[ dates[ i ] ] = this.axesValues[ i ];
    }

    this.axesValues = dates;
  }

  /**
   * @param value
   * @param initial
   * @return {SVGTextElement}
   * @private
   */
  _createValueElement (value, initial = false) {
    const timestamp = this.axesValuesMapping[ value ];
    const svgX = this._computeValuePosition( timestamp );

    const text = this.renderer.createText(value, {
      class: 'telechart-chart-axis-value',
      x: svgX,
      y: 0,
      textAnchor: 'start',
      opacity: initial ? 1 : 0,
      style: initial
        ? cssText({
          opacity: 0,
        }) : ''
    }, this.valuesGroup);

    // initial font load glitch workaround
    if (initial) {
      setTimeout(_ => {
        setAttributeNS(text, 'style', cssText({
          opacity: 1,
          transitionDuration: '.3s',
          transitionProperty: 'all'
        }), null);

        setTimeout(_ => {
          setAttributeNS( text, 'style', '', null );
        }, 300);
      }, 200);
    }

    return text;
  }

  /**
   * @param value
   * @param lastValue
   * @return {number}
   * @private
   */
  _computeValuePosition (value, lastValue = false) {
    return this.chart.projectXToSvg( value ) - this.labelWidth;
  }

  /**
   * @param valueElement
   * @param value
   * @private
   */
  _updateValueElementPosition (valueElement, value) {
    setAttributeNS( valueElement, 'x', this._computeValuePosition( value ), null );
  }

  /**
   * @param {number} value
   * @return {string}
   * @private
   */
  _toDateString (value) {
    const date = new Date( value );
    const datePart = date.toUTCString().split( ' ' );

    return `${datePart[ 2 ]} ${datePart[ 1 ]}`;
  }
}

