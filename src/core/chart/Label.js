import { EventEmitter } from '../misc/EventEmitter';
import { createElement, cssText, getElementHeight, getElementWidth } from '../../utils';

let LABEL_ID = 1;

export class Label extends EventEmitter {

  /**
   * @type {number}
   * @private
   */
  _id = LABEL_ID++;

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
   * @type {Element}
   * @private
   */
  _container = null;

  /**
   * @type {Element}
   * @private
   */
  _dateElement = null;

  /**
   * @type {Element}
   * @private
   */
  _tableElement = null;

  /**
   * @type {number}
   * @private
   */
  _width = 0;

  /**
   * @type {number}
   * @private
   */
  _height = 0;

  /**
   * @type {Array}
   * @private
   */
  _dataArray = [];

  /**
   * @param {SvgRenderer} renderer
   */
  constructor (renderer) {
    super();

    this._renderer = renderer;
  }

  /**
   * @param {Chart | BaseChart} chart
   */
  setChart (chart) {
    this._chart = chart;
  }

  initialize () {
    this._createContainer();
    this._createContent();
  }

  update () {

  }

  /**
   * @param {Array} data
   */
  setData (data = []) {
    this._dataArray = data;

    this._updateContent();
  }

  updateDimensions () {
    this._width = getElementWidth( this._container );
    this._height = getElementHeight( this._container );
  }

  /**
   * @private
   */
  _createContainer () {
    const parent = this._renderer.parentContainer;
    const container = createElement('div', {
      attrs: {
        class: 'telechart-chart-label'
      }
    });

    parent.appendChild( container );

    this._container = container;
  }

  /**
   * @private
   */
  _createContent () {
    this._dateElement = createElement('div', {
      attrs: {
        class: 'telechart-chart-label__date'
      }
    });

    this._tableElement = createElement('div', {
      attrs: {
        class: 'telechart-chart-label__table'
      }
    }, this._generateTable());

    this._container.appendChild( this._dateElement );
    this._container.appendChild( this._tableElement );
  }

  /**
   * @private
   */
  _generateTable () {
    const items = [];

    for (let i = 0; i < this._dataArray.length; ++i) {
      const dataItem = this._dataArray[ i ];
      items.push( this._createTableItem( dataItem ) );
    }

    return items;
  }

  /**
   * @param {*} dataItem
   * @return {Element}
   * @private
   */
  _createTableItem (dataItem) {
    const title = createElement('div', {
      attrs: {
        class: 'telechart-chart-label__table-item-title'
      }
    }, dataItem.name);

    const value = createElement('div', {
      attrs: {
        class: 'telechart-chart-label__table-item-value'
      }
    }, String( 1 * dataItem.y.toFixed( 2 ) ));

    return createElement('div', {
      attrs: {
        class: 'telechart-chart-label__table-item',
        id: this._getTableItemId( dataItem ),
        style: cssText({
          color: dataItem.color,
          display: dataItem.visible ? 'block' : 'none'
        })
      }
    }, [ title, value ]);
  }

  /**
   * @param {*} dataItem
   * @return {string}
   * @private
   */
  _getTableItemId (dataItem) {
    return `telechart-chart-label-${this._id}-${dataItem.label}`;
  }

  /**
   * @private
   */
  _updateContent () {
    // update inner content
    this._tableElement.innerHTML = '';
    const items = this._generateTable();

    for (let i = 0; i < items.length; ++i) {
      this._tableElement.appendChild( items[ i ] );
    }
  }
}
