import { EventEmitter } from "./misc/EventEmitter";
import {
  capitalize,
  clampNumber,
  createElement,
  getElementWidth,
  resolveElement,
  setAttributes,
  setAttributesNS
} from "../utils";

const telechartTitle = `${capitalize( TELECHART_NAME )} ${TELECHART_VERSION} (c) ${TELECHART_AUTHOR}`;

let INTERNAL_AUTOINCREMENT = 1;

export class SvgRenderer extends EventEmitter {

  static NS = 'http://www.w3.org/2000/svg';

  /**
   * @type {number}
   * @private
   */
  _id = INTERNAL_AUTOINCREMENT++;

  /**
   * @type {Element}
   * @private
   */
  _parentContainer = null;

  /**
   * @type {SVGElement}
   * @private
   */
  _svgContainer = null;

  /**
   * @type {number}
   * @private
   */
  _minHeight = 400;

  /**
   * @type {number}
   * @private
   */
  _minWidth = 10;

  /**
   * @type {number}
   * @private
   */
  _width = null;

  /**
   * @type {number}
   * @private
   */
  _height = null;

  /**
   * @type {boolean}
   * @private
   */
  _isInitialized = false;

  /**
   * @param {Element|string} contextElement
   */
  constructor (contextElement) {
    super();

    this._parentContainer = resolveElement( contextElement );
    this._init();
  }

  /**
   * @param {*} attrs
   * @param {Array<Element>} children
   * @param {Element} parent
   * @return {Element}
   */
  createGroup (attrs = {}, children = [], parent = this._svgContainer) {
    const group = createElement('g', {
      useNS: true,
      attrs
    }, children, SvgRenderer.NS);
    parent.appendChild( group );

    return group;
  }

  /**
   * @param {string} text
   * @param {Element} parent
   * @return {SVGDescElement}
   */
  createDesc (text = '', parent = this._svgContainer) {
    const group = createElement('desc', {
      useNS: true
    }, text, SvgRenderer.NS);
    parent.appendChild( group );

    return group;
  }

  /**
   * @param {string} text
   * @param {Object} attrs
   * @param {Element} parent
   * @return {SVGTextElement}
   */
  createText (text = '', attrs = {}, parent = this._svgContainer) {
    const tspan = createElement('tspan', {
      useNS: true
    }, text, SvgRenderer.NS);

    const textElement = createElement('text', {
      useNS: true,
      attrs
    }, tspan, SvgRenderer.NS);

    parent.appendChild( textElement );

    return textElement;
  }

  /**
   * @param {Element[]} defs
   * @param {Element} parent
   * @return {SVGDefsElement}
   */
  createDefs (defs = [], parent = this._svgContainer) {
    defs = [].concat( defs );

    const element = createElement('defs', {
      useNS: true
    }, defs, SvgRenderer.NS);
    parent.appendChild( element );

    return element;
  }

  /**
   * @param {string} pathText
   * @param {Object} attrs
   * @param {Element} parent
   * @return {SVGPathElement}
   */
  createPath (pathText, attrs = {}, parent = this._svgContainer) {
    Object.assign(attrs, { d: pathText });

    const pathElement = createElement('path', {
      useNS: true,
      attrs
    }, [], SvgRenderer.NS);
    parent.appendChild( pathElement );

    return pathElement;
  }

  /**
   * @param {SVGPathElement} pathElement
   * @param {Object} updatingAttrs
   */
  updatePath (pathElement, pathText, updatingAttrs = {}) {
    updatingAttrs.d = pathText;
    setAttributesNS( pathElement, updatingAttrs, null );
  }

  /**
   * @param {number} width
   * @param {number} height
   * @param {*} attrs
   * @param {SVGElement | Element} parent
   * @return {SVGRectElement}
   */
  createRect (width, height, attrs = {}, parent = this._svgContainer) {
    Object.assign(attrs, {
      width, height
    });

    const rectElement = createElement('rect', {
      useNS: true,
      attrs
    }, [], SvgRenderer.NS);

    parent.appendChild( rectElement );

    return rectElement;
  }

  /**
   * @param {string} selector
   * @return {Element}
   */
  querySelector (selector) {
    return this._svgContainer.querySelector( selector );
  }

  /**
   * @param {string} selector
   * @return {Array<Element>}
   */
  querySelectorAll (selector) {
    return Array.from( this._svgContainer.querySelectorAll( selector ) );
  }

  /**
   * Destroy the renderer
   */
  destroy () {
    this._detachEvents();
    this._clearParentContainer();
  }

  /**
   * @return {number}
   */
  get id () {
    return this._id;
  }

  /**
   * @return {Element}
   */
  get parentContainer () {
    return this._parentContainer;
  }

  /**
   * @return {SVGElement}
   */
  get svgContainer () {
    return this._svgContainer;
  }

  /**
   * @return {number}
   */
  get width () {
    return this._width;
  }

  /**
   * @return {number}
   */
  get height () {
    return this._height;
  }

  /**
   * @return {string}
   */
  get viewBox () {
    return [ 0, 0, this._width, this._height ].join( ' ' );
  }

  /**
   * @private
   */
  _init () {
    if (this._isInitialized) {
      return;
    }

    this._updateDimensions();
    this._svgContainer = this._createSvgContainer();
    this._insertSvgContainer();

    this.createDesc( telechartTitle );

    this._attachEvents();

    this._isInitialized = true;
  }

  /**
   * @return {Element}
   * @private
   */
  _createSvgContainer () {
    const parentContainer = this._parentContainer;

    if (!parentContainer) {
      throw new Error( 'Parent container is not provided' );
    }

    return createElement('svg', {
      useNS: false,
      attrs: {
        xmlns: SvgRenderer.NS,
        version: '1.1',
        width: this._width,
        height: this._height,
        viewBox: this.viewBox,
        class: 'telechart-render'
      }
    }, [], SvgRenderer.NS);
  }

  /**
   * @private
   */
  _insertSvgContainer () {
    this._clearParentContainer();
    this._parentContainer.appendChild( this._svgContainer );
  }

  /**
   * @private
   */
  _updateDimensions () {
    this._width = clampNumber(
      getElementWidth( this._parentContainer ),
      this._minWidth
    );
    this._height = this._minHeight;

    if (this._svgContainer) {
      setAttributes(this._svgContainer, {
        width: this._width,
        height: this._height,
        viewBox: this.viewBox
      });
    }
  }

  /**
   * @private
   */
  _clearParentContainer () {
    // clears the child content
    this._parentContainer.innerHTML = '';
  }

  /**
   * @private
   */
  _onResize (ev) {
    this._updateDimensions();
    this.emit( 'resize', ev );
  }

  /**
   * @private
   */
  _attachEvents () {
    this._attachResizeListener();
  }

  /**
   * @private
   */
  _detachEvents () {
    this._detachResizeListener();
  }

  /**
   * @private
   */
  _attachResizeListener () {
    if (this._resizeListener) {
      this._detachResizeListener();
    }

    this._resizeListener = this._onResize.bind( this );
    window.addEventListener( 'resize', this._resizeListener );
  }

  /**
   * @private
   */
  _detachResizeListener () {
    if (!this._resizeListener) {
      return;
    }

    window.removeEventListener( 'resize', this._resizeListener );
    this._resizeListener = null;
  }
}
