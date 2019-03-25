import { AxisElementState, ChartAxis } from './ChartAxis';
import { cssText, setAttributeNS, setAttributesNS } from '../../../utils';

export class ChartAxisY extends ChartAxis {

  updatePositions () {
    this.eachElement(element => {
      const { valueElement, axisElement, value } = element;

      this._updatePathElementPosition( axisElement, value );
      this._updateValueElementPosition( valueElement, value );
    });
  }

  createValuesGroup () {
    this.valuesGroup = this.renderer.createGroup({
      class: 'telechart-chart-axes-values-y',
      transform: `translate(0, ${this.chart.seriesGroupTop}) scale(1 1)`,
      mask: `url(#${this.chart.chartMaskId})`
    }, []);
  }

  createAxesGroup () {
    this.axesGroup = this.renderer.createGroup({
      class: 'telechart-chart-axes-y',
      transform: `translate(0, ${this.chart.seriesGroupTop}) scale(1 1)`,
      mask: `url(#${this.chart.chartMaskId})`
    }, []);

    this.renderer.svgContainer.insertBefore( this.axesGroup, this.chart._seriesGroup );
  }

  computeAxisValues () {
    const chart = this.chart;
    const viewportMinY = chart.localMinY;
    const viewportMaxY = chart.localMaxY;
    const distance = viewportMaxY - viewportMinY;

    if (!distance) {
      return [];
    }

    let deltaY = distance / 5;
    let divider = Math.pow(10, Math.max(0, ( distance | 0 ).toString().length - 2) );
    deltaY = Math.floor( deltaY / divider ) * divider;

    let currentValue = 0;
    let result = [ currentValue ];

    while (currentValue + deltaY <= viewportMaxY) {
      result.unshift( currentValue + deltaY );
      currentValue += deltaY;
    }

    const maxLength = 6;
    if (result.length < maxLength) {
      currentValue = 0;
      while (currentValue - deltaY >= viewportMinY) {
        result.push( currentValue - deltaY );
        currentValue -= deltaY;
      }
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
    const axisElement = this._createAxisElement( value, initial );
    const valueElement = this._createValueElement( value, initial );

    return {
      value,
      opacity: 0,
      animation: null,
      state: AxisElementState.showing,
      axisElement,
      valueElement
    };
  }

  onChartResize () {
    super.onChartResize();

    this._updateDimensions();
  }

  /**
   * @param value
   * @param {boolean} initial
   * @return {SVGPathElement}
   * @private
   */
  _createAxisElement (value, initial = false) {
    const pathText = this._computePathText( value );

    return this.renderer.createPath(pathText, {
      class: 'telechart-chart-axis-path',
      dataValue: value,
      stroke: 'rgba(163, 196, 220, 0.2)',
      strokeWidth: 1,
      strokeOpacity: initial ? 1 : 0,
      strokeLinejoin: 'round',
      strokeLinecap: 'round'
    }, this.axesGroup);
  }

  /**
   * @param value
   * @param initial
   * @return {SVGTextElement}
   * @private
   */
  _createValueElement (value, initial = false) {
    const valueText = String( value );
    const svgY = this._computeValuePosition( value );

    const text = this.renderer.createText(valueText, {
      class: 'telechart-chart-axis-value',
      x: this.chart.viewportPadding,
      y: svgY,
      textAnchor: 'start',
      opacity: initial ? 1 : 0,
      style: initial
        ? cssText({
          opacity: 0,
        }) : ''
    }, this.valuesGroup);

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
   * @return {number}
   * @private
   */
  _computeValuePosition (value) {
    const fontOffsetY = 6;
    return ( this.chart.projectYToSvg( value ) || 1e6 ) - fontOffsetY;
  }

  /**
   * @param {number} value
   * @return {string}
   * @private
   */
  _computePathText (value) {
    const svgY = this.chart.projectYToSvg( value ) || 1e6;
    const startSvgX = this.chart.viewportPadding;
    const endSvgX = this.chart.chartWidth - this.chart.viewportPadding;

    return `M${startSvgX} ${svgY}L${endSvgX} ${svgY}`;
  }

  /**
   * @private
   */
  _updateDimensions () {
    for (let i = 0; i < this.elements.length; ++i) {
      const { axisElement, value } = this.elements[ i ];
      this._updatePathElementPosition( axisElement, value );
    }
  }

  /**
   * @param axisElement
   * @param value
   * @private
   */
  _updatePathElementPosition (axisElement, value) {
    const pathText = this._computePathText( value );
    this.renderer.updatePath( axisElement, pathText );
  }

  /**
   * @param valueElement
   * @param value
   * @private
   */
  _updateValueElementPosition (valueElement, value) {
    const svgY = this._computeValuePosition( value );

    setAttributeNS( valueElement, 'y', svgY, null );
  }
}

