export class Clock {

  /**
   * @type {number}
   * @private
   */
  _lastUpdateMs = 0;

  constructor () {
    this._lastUpdateMs = this.now;
  }

  /**
   * @return {number}
   */
  getDelta () {
    const now = this.now;
    const delta = now - this._lastUpdateMs;
    this._lastUpdateMs = now;

    return delta;
  }

  /**
   * @return {number}
   */
  get now () {
    return (performance || Date).now();
  }
}
