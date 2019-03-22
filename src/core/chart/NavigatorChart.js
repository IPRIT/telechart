import { BaseChart } from './BaseChart';
import { cssText } from '../../utils';
import { ChartTypes } from './ChartTypes';

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
  _chartMaskPadding = 1;

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
      class: 'telechart-navigator-series-group',
      transform: `translate(0, 358) scale(1 1)`,
      mask: `url(#${this.chartMaskId})`
    });

    this.renderer.createRect(this.renderer.width, '1px', {
      fill: '#ccc',
      y: 0,
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
   * @return {number}
   */
  get chartHeight () {
    return this._chartHeight;
  }
}
