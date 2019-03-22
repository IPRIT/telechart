import { BaseChart } from './BaseChart';
import { cssText } from '../../utils';
import { ChartTypes } from './ChartTypes';
import { ChartEvents } from './ChartEvents';

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
   * Creates SVG group for storing series paths
   */
  createSeriesGroup () {
    this._seriesGroup = this.renderer.createGroup({
      class: 'telechart-series-group',
      transform: `translate(0, 70) scale(1 1)`,
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
   * Sets initial viewport range for the chart
   */
  setInitialRange () {
    const globalMinX = this.xAxis[ 0 ];
    const globalMaxX = this.xAxis[ this.xAxis.length - 1 ];
    const initialViewport = Math.floor( ( globalMaxX - globalMinX ) * .15 );
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
   * @return {number}
   */
  get chartHeight () {
    return this._chartHeight;
  }
}
