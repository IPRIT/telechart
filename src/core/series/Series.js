import { EventEmitter } from '../../lib/EventEmitter';

export class Series extends EventEmitter {

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
   * @type {SvgRenderer}
   * @private
   */
  _renderer = null;

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
   * @type {Array<Point>}
   * @private
   */
  _points = [];

  /**
   * @type {Array}
   * @private
   */
  _visiblePoints = [];

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
   * @param {SvgRenderer} renderer
   * @param {*} settings
   */
  constructor (renderer, settings = {}) {
    super();

    this._renderer = renderer;
    this._settings = settings;
    this._parseSettings();

    this.initialize();
  }

  /**
   * Initializes series with options
   */
  initialize () {
    // console.log( this._settings, this._xAxis, this._yAxis );
  }

  /**
   * @param {number} deltaTimeMs
   */
  update (deltaTimeMs) {
  }

  /**
   * @param {string} pathText
   */
  setPathText (pathText) {
    this._pathText = pathText;
  }

  /**
   * @param {SVGPathElement} pathElement
   */
  setPathElement (pathElement) {
    this._pathElement = pathElement;
  }

  /**
   * @return {Array<number>}
   */
  get xAxis () {
    return this._xAxis;
  }

  /**
   * @return {Array<number>}
   */
  get yAxis () {
    return this._yAxis;
  }

  /**
   * @return {string}
   */
  get pathText () {
    return this._pathText;
  }

  /**
   * @return {SVGPathElement}
   */
  get pathElement () {
    return this._pathElement;
  }

  /**
   * @return {{xAxis: Array<number>, yAxis: Array<number>, label: string, type: string, name: string, color: string, options: *}}
   */
  get settings () {
    return this._settings;
  }

  /**
   * @private
   */
  _parseSettings () {
    const {
      xAxis, yAxis,
      label, type,
      color, name,
      options
    } = this._settings;

    this._xAxis = xAxis;
    this._yAxis = yAxis;
    this._label = label;
    this._color = color;
    this._name = name;

    this._seriesOptions = options;
  }
}
