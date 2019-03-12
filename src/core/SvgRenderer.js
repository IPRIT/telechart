import { clampNumber, createElement, getElementHeight, getElementWidth, resolveElement } from "../utils";

export class SvgRenderer {

  static NS = 'http://www.w3.org/2000/svg';

  /**
   * @type {Element}
   * @private
   */
  _parentContainer = null;

  /**
   * @type {Element}
   * @private
   */
  _svgContainer = null;

  /**
   * @type {number[]}
   * @private
   */
  _viewBox = null;

  /**
   * @type {number}
   * @private
   */
  _minHeight = 400;

  /**
   * @type {boolean}
   * @private
   */
  _isInitialized = false;

  /**
   * @param {Element|string} contextElement
   */
  constructor (contextElement) {
    this._parentContainer = resolveElement( contextElement );

    this._init();
  }

  _init () {
    if (this._isInitialized) {
      return;
    }

    this._svgContainer = this._createSvgContainer();
    this._insertSvgContainer();

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

    const width = getElementWidth( parentContainer );
    const height = clampNumber(
      getElementHeight( parentContainer ),
      this._minHeight
    );
    const viewBox = this._viewBox = [ 0, 0, width, height ];

    return createElement('svg', {
      attrs: {
        version: '1.1',
        xmlns: SvgRenderer.NS,
        width, height,
        viewBox: viewBox.join( ' ' )
      }
    }, [], SvgRenderer.NS);
  }

  /**
   * @private
   */
  _insertSvgContainer () {
    // clears the child content
    this._parentContainer.innerHTML = '';
    this._parentContainer.appendChild( this._svgContainer );
  }
}
