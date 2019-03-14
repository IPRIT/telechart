import './style/telechart.scss';
import {
  addClass,
  interpolateThemeClass,
  removeClass,
  resolveElement,
  ChartThemes,
  setAttributesNS,
  cssText, setAttributes
} from "./utils";
import { SvgRenderer } from "./core/SvgRenderer";
import { Chart } from './core/Chart';

export class Telechart {

  /**
   * @type {Object}
   * @private
   */
  _options = null;

  /**
   * @type {Element}
   * @private
   */
  _rootElement = null;

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
   * @type {string}
   * @private
   */
  _themeName = ChartThemes.default.name;

  /**
   * @static
   * @param {Element | string} mountTo Element or selector
   * @param {Object} options
   */
  static create (mountTo, options = {}) {
    const chart = new Telechart();

    chart.setOptions( options );
    chart.mount( resolveElement( mountTo ) );
    chart.initialize();

    return chart;
  }

  /**
   * @param {Object} options
   */
  setOptions (options = {}) {
    this._options = options;
  }

  /**
   * @param {Element} root
   */
  mount (root) {
    this._rootElement = root;
    this._renderer = new SvgRenderer( root );

    this.setTheme( this._options.theme || ChartThemes.default );
  }

  /**
   * Initialize the chart
   */
  initialize () {
    this._createTitle();
    this._createChart();
  }

  /**
   * @param {string} themeName
   */
  setTheme (themeName) {
    const renderRoot = this._renderer.svgContainer;

    removeClass(
      renderRoot,
      Object.keys( ChartThemes )
        .map( interpolateThemeClass )
    );

    addClass(
      renderRoot,
      interpolateThemeClass( themeName )
    );

    this._themeName = themeName;
  }

  /**
   * Destroys the chart instance
   */
  destroy () {
    this._renderer && this._renderer.destroy();
    this._rootElement = null;
    this._renderer = null;
  }

  /**
   * @private
   */
  _createTitle () {
    const title = this._options.title;
    if (!title) {
      return;
    }

    const text = this._renderer.createText(title, {
      class: 'telechart-title',
      x: 16,
      y: 36,
      textAnchor: 'start',
      style: cssText({
        opacity: 0
      })
    });

    setTimeout(_ => {
      setAttributesNS(text, {
        style: cssText({
          opacity: 1
        })
      });
    }, 100);
  }

  /**
   * @private
   */
  _createChart () {
    this._chart = new Chart(
      this._renderer,
      this._options
    );
  }
}
