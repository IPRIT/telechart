!function(e){var t={};function n(i){if(t[i])return t[i].exports;var r=t[i]={i:i,l:!1,exports:{}};return e[i].call(r.exports,r,r.exports,n),r.l=!0,r.exports}n.m=e,n.c=t,n.d=function(e,t,i){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:i})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var i=Object.create(null);if(n.r(i),Object.defineProperty(i,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)n.d(i,r,function(t){return e[t]}.bind(null,r));return i},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=1)}([function(e,t,n){"use strict";function i(){for(var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,t=arguments.length,n=new Array(t>1?t-1:0),i=1;i<t;i++)n[i-1]=arguments[i];return new Promise(function(t){var i=t.bind.apply(t,[null].concat(n)),r=function(){return requestAnimationFrame(i)};e?setTimeout(function(e){return r()},e):r()})}function r(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:function(){};Object.keys(e).forEach(t)}function o(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:-1/0,n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:1/0;if(t>n){var i=[n,t];t=i[0],n=i[1]}return Math.min(Math.max(a(e),t),n)}function a(e){return e=Number(e),Number.isNaN(e)?0:e}function u(e){return e instanceof Date&&!isNaN(e.valueOf())}function s(e){return e?(e=String(e))[0].toUpperCase()+e.substr(1):""}function l(e){return Object.keys(e).reduce(function(t,n){return"".concat(t?t+" ":"").concat(c(n),": ").concat(e[n],";")},"")}function c(e){return e?((e=String(e))[0].toLowerCase()+e.substr(1)).replace(/([A-Z])/g,"-$1").toLowerCase():""}function h(e){var t=e.split("?").slice(1);return t.length?t[0].split("&").map(function(e){var t,n,i,r=e.split("=");return t={},n=r[0],i=r[1],n in t?Object.defineProperty(t,n,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[n]=i,t}).reduce(function(e,t){return Object.assign(e,t)}):{}}function f(e){return function(e){if(Array.isArray(e)){for(var t=0,n=new Array(e.length);t<e.length;t++)n[t]=e[t];return n}}(e)||function(e){if(Symbol.iterator in Object(e)||"[object Arguments]"===Object.prototype.toString.call(e))return Array.from(e)}(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance")}()}function v(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:[],i=arguments.length>3&&void 0!==arguments[3]?arguments[3]:null,r=i?document.createElementNS(i,e):document.createElement(e);return t.attrs&&(t.useNS?g(r,t.attrs,t.attrsNS||null):d(r,t.attrs)),(n||Array.isArray(n))&&(n=[].concat(n)).forEach(function(e){"string"==typeof e?r.innerHTML+=e:r.appendChild(e)}),r}function p(e){return"string"!=typeof e?e:document.querySelector(e)}function _(e){return e.innerWidth||e.clientWidth}var y=["viewBox"];function d(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};e=p(e),r(t,function(n){var i=y.includes(n)?n:c(n);e.setAttribute(i,t[n])})}function g(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null;e=p(e),r(t,function(i){var r=y.includes(i)?i:c(i);e.setAttributeNS(n,r,t[i])})}function b(e,t){return e.classList?e.classList.contains(t):new RegExp("(\\s|^)"+t+"(\\s|$)").test(e.className)}function m(e){var t,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:[];if(n=[].concat(n),e.classList)return(t=e.classList).add.apply(t,f(n));for(var i=e.className,r=0;r<n.length;++r)b(e,n[r])||(i+=" ".concat(n[r]));e.className=i.trim()}function w(e){var t,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:[];if(n=[].concat(n),e.classList)return(t=e.classList).remove.apply(t,f(n));for(var i=e.className.split(" "),r=new Set(n),o="",a=0;a<i.length;++a)r.has(i[a])||(o+=" ".concat(i[a]));e.className=o.trim()}var x="telechart-root";function k(e){return"".concat(x,"_theme_").concat(e)}var S={default:"default",dark:"dark"},O={default:"#ffffff",dark:"#242F3E"};function j(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){var n=[],i=!0,r=!1,o=void 0;try{for(var a,u=e[Symbol.iterator]();!(i=(a=u.next()).done)&&(n.push(a.value),!t||n.length!==t);i=!0);}catch(e){r=!0,o=e}finally{try{i||null==u.return||u.return()}finally{if(r)throw o}}return n}(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance")}()}function P(e,t){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null;if(!Array.isArray(e)||!Array.isArray(t)||e.length!==t.length)return!1;for(var i=0;i<e.length;++i)if(n){if(e[i][n]!==t[i][n])return!1}else if(e[i]!==t[i])return!1;return!0}function E(e){var t=j(function(e){for(var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:e.length-1,i=t,r=t,o=t+1;o<=n;++o)e[r]<e[o]&&(r=o),e[i]>e[o]&&(i=o);return[i,r]}(e,arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,arguments.length>2&&void 0!==arguments[2]?arguments[2]:e.length-1),2),n=t[0],i=t[1];return[e[n],e[i]]}function Y(e){var t=e.length,n=function(e){for(var t=e.length,n=0;t--;)n+=e[t];return n}(e);return t&&(n/=t),n}function M(e,t){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:1,i=0,r=e.length-1;if(!e.length||n*t<n*e[i])return[-1,0];if(n*t>n*e[r])return[r,r+1];for(;r-i>1;){var o=i+(r-i>>1);n*t<=n*e[o]?r=o:i=o}return e[r]===t?i=r:e[i]===t&&(r=i),[i,r]}n.d(t,"c",function(){return 60}),n.d(t,"f",function(){return i}),n.d(t,"l",function(){return o}),n.d(t,"o",function(){return a}),n.d(t,"r",function(){return u}),n.d(t,"m",function(){return v}),n.d(t,"u",function(){return p}),n.d(t,"p",function(){return _}),n.d(t,"v",function(){return d}),n.d(t,"w",function(){return g}),n.d(t,"e",function(){return m}),n.d(t,"t",function(){return w}),n.d(t,"k",function(){return s}),n.d(t,"n",function(){return l}),n.d(t,"s",function(){return h}),n.d(t,"d",function(){return x}),n.d(t,"q",function(){return k}),n.d(t,"a",function(){return S}),n.d(t,"b",function(){return O}),n.d(t,"i",function(){return P}),n.d(t,"h",function(){return E}),n.d(t,"g",function(){return Y}),n.d(t,"j",function(){return M})},function(e,t,n){"use strict";n.r(t);n(2);function i(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){var n=[],i=!0,r=!1,o=void 0;try{for(var a,u=e[Symbol.iterator]();!(i=(a=u.next()).done)&&(n.push(a.value),!t||n.length!==t);i=!0);}catch(e){r=!0,o=e}finally{try{i||null==u.return||u.return()}finally{if(r)throw o}}return n}(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance")}()}function r(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}var o=function(){function e(){var t,n,i;!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),i={},(n="_eventListeners")in(t=this)?Object.defineProperty(t,n,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[n]=i}var t,n,o;return t=e,(n=[{key:"emit",value:function(e){for(var t=arguments.length,n=new Array(t>1?t-1:0),i=1;i<t;i++)n[i-1]=arguments[i];this._fireEvent.apply(this,[e].concat(n))}},{key:"on",value:function(e,t){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null;this.addEventListener(e,t,n)}},{key:"once",value:function(e,t){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null;this.addEventListenerOnce(e,t,n)}},{key:"addEventListener",value:function(e,t){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null;t&&this._subscribeEvent(e,t,n)}},{key:"addEventListenerOnce",value:function(e,t){var n=this,i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null;if(t){this.addEventListener(e,function r(){for(var o=arguments.length,a=new Array(o),u=0;u<o;u++)a[u]=arguments[u];t.apply(i,a),n.removeEventListener(e,r)})}}},{key:"removeEventListener",value:function(e,t){if(this._eventListeners[e]){var n=this._eventListeners[e].findIndex(function(e){var n=i(e,1)[0];return t===n});n<0||this._eventListeners[e].splice(n,1)}}},{key:"removeAllListeners",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null;e?this._eventListeners[e]&&(this._eventListeners[e]=null,delete this._eventListeners[e]):this._eventListeners={}}},{key:"_allocateEvent",value:function(e){this._eventListeners[e]=this._eventListeners[e]||[]}},{key:"_subscribeEvent",value:function(e,t,n){this._allocateEvent(e),this._eventListeners[e].push([t,n])}},{key:"_fireEvent",value:function(e){for(var t=this._eventListeners[e]||[],n=arguments.length,r=new Array(n>1?n-1:0),o=1;o<n;o++)r[o-1]=arguments[o];for(var a=0;a<t.length;++a){var u=i(t[a],2),s=u[0],l=u[1];s.apply(l,r)}}}])&&r(t.prototype,n),o&&r(t,o),e}(),a=n(0);function u(e){return(u="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function s(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}function l(e){return(l=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function c(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function h(e,t){return(h=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function f(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}var v="update",p=function(e){function t(){var e,n,i,r=arguments.length>0&&void 0!==arguments[0]?arguments[0]:60,o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:1;return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),n=this,e=!(i=l(t).call(this))||"object"!==u(i)&&"function"!=typeof i?c(n):i,f(c(e),"_timeElapsed",0),f(c(e),"_timeScale",1),f(c(e),"_updateInvokes",0),f(c(e),"_updatesPerSecond",60),f(c(e),"_updateEach",1),f(c(e),"_lastUpdateAt",0),f(c(e),"_paused",!1),e._updatesPerSecond=Math.min(60,Math.max(1e-8,r)),e._updateEach=a.c/e._updatesPerSecond,e._timeScale=o,e}var n,i,r;return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&h(e,t)}(t,o),n=t,(i=[{key:"update",value:function(e){this._paused||(this._timeElapsed+=e,this._updateInvokes++,this._updateInvokes%this._updateEach<1&&(this._callUpdate((this._timeElapsed-this._lastUpdateAt)*this._timeScale),this._lastUpdateAt=this._timeElapsed))}},{key:"dispose",value:function(){this._paused=!0,this.removeAllListeners()}},{key:"_callUpdate",value:function(e){this.emit(v,e)}},{key:"isPaused",get:function(){return this._paused}},{key:"isRunning",get:function(){return!this._paused}},{key:"timeScale",get:function(){return this._timeScale},set:function(e){this._timeScale=e}}])&&s(n.prototype,i),r&&s(n,r),t}();function _(e){return(_="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function y(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}function d(e){return(d=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function g(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function b(e,t){return(b=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function m(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}var w="".concat(Object(a.k)("telechart")," ").concat("1.0.0"," (c) ").concat("Alexander Belov"),x=1,k=function(e){function t(e){var n,i,r;return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),i=this,n=!(r=d(t).call(this))||"object"!==_(r)&&"function"!=typeof r?g(i):r,m(g(n),"_id",x++),m(g(n),"_parentContainer",null),m(g(n),"_svgContainer",null),m(g(n),"_minHeight",400),m(g(n),"_minWidth",300),m(g(n),"_width",null),m(g(n),"_height",null),m(g(n),"_isInitialized",!1),n._parentContainer=Object(a.u)(e),n._init(),n}var n,i,r;return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&b(e,t)}(t,o),n=t,(i=[{key:"createGroup",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:[],i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:this._svgContainer,r=Object(a.m)("g",{useNS:!0,attrs:e},n,t.NS);return i.appendChild(r),r}},{key:"createDesc",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:this._svgContainer,i=Object(a.m)("desc",{useNS:!0},e,t.NS);return n.appendChild(i),i}},{key:"createText",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:this._svgContainer,r=Object(a.m)("tspan",{useNS:!0},e,t.NS),o=Object(a.m)("text",{useNS:!0,attrs:n},r,t.NS);return i.appendChild(o),o}},{key:"createDefs",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[],n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:this._svgContainer;e=[].concat(e);var i=Object(a.m)("defs",{useNS:!0},e,t.NS);return n.appendChild(i),i}},{key:"createPath",value:function(e){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:this._svgContainer;Object.assign(n,{d:e});var r=Object(a.m)("path",{useNS:!0,attrs:n},[],t.NS);return i.appendChild(r),r}},{key:"updatePath",value:function(e,t){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};n.d=t,Object(a.w)(e,n,null)}},{key:"createRect",value:function(e,n){var i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},r=arguments.length>3&&void 0!==arguments[3]?arguments[3]:this._svgContainer;Object.assign(i,{width:e,height:n});var o=Object(a.m)("rect",{useNS:!0,attrs:i},[],t.NS);return r.appendChild(o),o}},{key:"querySelector",value:function(e){return this._svgContainer.querySelector(e)}},{key:"querySelectorAll",value:function(e){return Array.from(this._svgContainer.querySelectorAll(e))}},{key:"destroy",value:function(){this._detachEvents(),this._clearParentContainer()}},{key:"_init",value:function(){this._isInitialized||(this._updateDimensions(),this._svgContainer=this._createSvgContainer(),this._insertSvgContainer(),this.createDesc(w),this._attachEvents(),this._isInitialized=!0)}},{key:"_createSvgContainer",value:function(){if(!this._parentContainer)throw new Error("Parent container is not provided");return Object(a.m)("svg",{useNS:!1,attrs:{xmlns:t.NS,version:"1.1",width:this._width,height:this._height,viewBox:this.viewBox,class:"telechart-render"}},[],t.NS)}},{key:"_insertSvgContainer",value:function(){this._clearParentContainer(),this._parentContainer.appendChild(this._svgContainer)}},{key:"_updateDimensions",value:function(){this._width=Object(a.l)(Object(a.p)(this._parentContainer),this._minWidth),this._height=this._minHeight,this._svgContainer&&Object(a.v)(this._svgContainer,{width:this._width,height:this._height,viewBox:this.viewBox})}},{key:"_clearParentContainer",value:function(){this._parentContainer.innerHTML=""}},{key:"_onResize",value:function(e){this.emit("resize",e),this._updateDimensions()}},{key:"_attachEvents",value:function(){this._attachResizeListener()}},{key:"_detachEvents",value:function(){this._detachResizeListener()}},{key:"_attachResizeListener",value:function(){this._resizeListener&&this._detachResizeListener(),this._resizeListener=this._onResize.bind(this),window.addEventListener("resize",this._resizeListener)}},{key:"_detachResizeListener",value:function(){this._resizeListener&&(window.removeEventListener("resize",this._resizeListener),this._resizeListener=null)}},{key:"id",get:function(){return this._id}},{key:"parentContainer",get:function(){return this._parentContainer}},{key:"svgContainer",get:function(){return this._svgContainer}},{key:"width",get:function(){return this._width}},{key:"height",get:function(){return this._height}},{key:"viewBox",get:function(){return[0,0,this._width,this._height].join(" ")}}])&&y(n.prototype,i),r&&y(n,r),t}();m(k,"NS","http://www.w3.org/2000/svg");var S="x";function O(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}function j(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}var P={point:"point",group:"group"},E=1,Y=function(){function e(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0;!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),j(this,"_id",E++),j(this,"_type","point"),j(this,"_x",0),j(this,"_y",0),j(this,"_svgX",0),j(this,"_svgY",0),this._x=t,this._y=n}var t,n,i;return t=e,(n=[{key:"setType",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"point";this._type=e}},{key:"setX",value:function(e){this._x=e}},{key:"setY",value:function(e){this._y=e}},{key:"setXY",value:function(e,t){this.setX(e),this.setY(t)}},{key:"addX",value:function(e){this._x+=e}},{key:"addY",value:function(e){this._y+=e}},{key:"addXY",value:function(e,t){this.addX(e),this.addY(t)}},{key:"setSvgX",value:function(e){this._svgX=e}},{key:"setSvgY",value:function(e){this._svgY=e}},{key:"setSvgXY",value:function(e,t){this._svgX=e,this._svgY=t}},{key:"id",get:function(){return this._id}},{key:"x",get:function(){return this._x}},{key:"y",get:function(){return this._y}},{key:"svgX",get:function(){return this._svgX}},{key:"svgY",get:function(){return this._svgY}},{key:"type",get:function(){return this._type}}])&&O(t.prototype,n),i&&O(t,i),e}();function M(e){return(M="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function A(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}function C(e){return(C=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function R(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function T(e,t){return(T=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function L(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}var N=function(e){function t(){var e,n,i,r=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[],o=!(arguments.length>1&&void 0!==arguments[1])||arguments[1];return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),n=this,e=!(i=C(t).call(this))||"object"!==M(i)&&"function"!=typeof i?R(n):i,L(R(e),"_pointsGroup",[]),L(R(e),"_approximationFn",a.g),e.setType(P.group),e.setPointsGroup(r,o),e}var n,i,r;return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&T(e,t)}(t,Y),n=t,(i=[{key:"setPointsGroup",value:function(e){var t=!(arguments.length>1&&void 0!==arguments[1])||arguments[1];this._pointsGroup=e,t&&this.approximate()}},{key:"approximate",value:function(){this.setX(this._approximateX()),this.setY(this._approximateY())}},{key:"_approximateX",value:function(){return this._approximationFn(this._pointsGroup.map(function(e){return e.x}))}},{key:"_approximateY",value:function(){return this._approximationFn(this._pointsGroup.map(function(e){return e.y}))}}])&&A(n.prototype,i),r&&A(n,r),t}();function z(e){return(z="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function I(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){var n=[],i=!0,r=!1,o=void 0;try{for(var a,u=e[Symbol.iterator]();!(i=(a=u.next()).done)&&(n.push(a.value),!t||n.length!==t);i=!0);}catch(e){r=!0,o=e}finally{try{i||null==u.return||u.return()}finally{if(r)throw o}}return n}(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance")}()}function X(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}function D(e){return(D=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function V(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function G(e,t){return(G=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function U(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}var q=function(e){function t(e,n){var i,r,o,a=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),r=this,i=!(o=D(t).call(this))||"object"!==z(o)&&"function"!=typeof o?V(r):o,U(V(i),"_group",null),U(V(i),"_pathText",null),U(V(i),"_pathElement",null),U(V(i),"_renderer",null),U(V(i),"_parent",null),U(V(i),"_xAxis",[]),U(V(i),"_yAxis",[]),U(V(i),"_name",null),U(V(i),"_label",null),U(V(i),"_color","#31a8dc"),U(V(i),"_visible",!0),U(V(i),"_points",[]),U(V(i),"_settings",{}),U(V(i),"_seriesOptions",{}),U(V(i),"_groupingPixels",2),U(V(i),"_chart",null),U(V(i),"_chartWidth",null),U(V(i),"_chartHeight",null),U(V(i),"_viewportRange",[]),U(V(i),"_viewportDistance",0),U(V(i),"_viewportPixelX",0),U(V(i),"_viewportPixelY",0),U(V(i),"_viewportPixelUpdateNeeded",!0),U(V(i),"_viewportRangeIndexes",[]),U(V(i),"_viewportPoints",[]),U(V(i),"_viewportPointsGroupingNeeded",!0),U(V(i),"_globalMaxY",0),U(V(i),"_globalMinY",0),U(V(i),"_localMaxY",0),U(V(i),"_localMinY",0),U(V(i),"_currentYScale",1),U(V(i),"_localYScale",1),i._renderer=e,i._parent=n,i._settings=a,i._parseSettings(),i.initialize(),i}var n,i,r;return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&G(e,t)}(t,o),n=t,(i=[{key:"initialize",value:function(){this._createPoints(),this._updateGlobalExtremes(),this._addEvents()}},{key:"update",value:function(e){}},{key:"firstRender",value:function(){this._pathElement||(this.regroupViewportPoints(),this.updateViewportPoints())}},{key:"setChart",value:function(e){this._chart=e}},{key:"setPathText",value:function(e){this._pathText=e}},{key:"setPathElement",value:function(e){this._pathElement=e}},{key:"setVisible",value:function(){this._visible=!0,this.emit("visibleChange",this._visible)}},{key:"setInvisible",value:function(){this._visible=!1,this.emit("visibleChange",this._visible)}},{key:"toggleVisible",value:function(){this._visible?this.setInvisible():this.setVisible()}},{key:"setViewportRange",value:function(e,t){var n=this._viewportRangeIndexes;this._viewportRange=e,this._viewportRangeIndexes=t,this._viewportDistance=this._viewportRange[1]-this._viewportRange[0],Object(a.i)(t,n)||(this._viewportPixelUpdateNeeded=!0),this._updateLocalExtremes()}},{key:"updateViewportPoints",value:function(){for(var e=0;e<this._viewportPoints.length;++e){var t=this._viewportPoints[e];t.setSvgXY(this._projectXToSvg(t.x),this._projectYToSvg(t.y))}}},{key:"regroupViewportPoints",value:function(){if(this._viewportPointsGroupingNeeded){var e=I(this._viewportRangeIndexes,2),t=e[0],n=e[1];if(n-t<100)this._viewportPoints=this._points.slice(t,n+1);else{for(var i=[],r=this._groupingPixels*this._viewportPixelX,o=t,a=t+1;a<=n;++a){var u=this._points[a];if(u.x-this._points[o].x>=r||a===n){if(o!==a-1){var s=this._points.slice(o,a),l=new N(s,!0);i.push(l)}else t===a-1&&i.push(this._points[t]),i.push(u);o=a}}this._viewportPointsGroupingNeeded=!1,this._viewportPoints=i}}}},{key:"setScale",value:function(e,t){this._currentYScale=e,this._localYScale=t}},{key:"updateViewportPixel",value:function(){this._viewportPixelX=this._viewportDistance/this._chartWidth,this._viewportPixelY=this._chart.globalExtremeDifference/this._chartHeight}},{key:"_parseSettings",value:function(){var e=this._settings,t=e.xAxis,n=e.yAxis,i=e.label,r=(e.type,e.color),o=e.name,u=e.width,s=e.height,l=e.options,c=void 0===l?{}:l;this._xAxis=t,this._yAxis=n,this._label=i,this._color=r,this._name=o,this._chartWidth=u,this._chartHeight=s;var h=c.grouping;h&&h.pixels&&(this._groupingPixels=Object(a.o)(h.pixels)),this._seriesOptions=c}},{key:"_createPoints",value:function(){for(var e=this._xAxis,t=this._yAxis,n=0;n<e.length;++n)this._points.push(new Y(e[n],t[n]))}},{key:"_updateGlobalExtremes",value:function(){var e=I(Object(a.h)(this._yAxis),2),t=e[0],n=e[1];this._globalMinY=Math.min(0,t),this._globalMaxY=n}},{key:"_updateLocalExtremes",value:function(){var e=I(this._viewportRangeIndexes,2),t=e[0],n=e[1],i=I(Object(a.h)(this._yAxis,t,n),2),r=i[0],o=i[1];this._localMinY=Math.min(0,r),this._localMaxY=o}},{key:"_projectXToSvg",value:function(e){return this._toRelativeX(e)/this._viewportPixelX}},{key:"_projectYToSvg",value:function(e){return this._chartHeight-(e-this._chart.localMinY)/(this._viewportPixelY*this._currentYScale)}},{key:"_addEvents",value:function(){var e=this;this._renderer.on("resize",function(t){e._onRendererResize()})}},{key:"_onRendererResize",value:function(){this._updateDimensions()}},{key:"_updateDimensions",value:function(){this._chartWidth=this._renderer.width,this.updateViewportPixel()}},{key:"_toRelativeX",value:function(e){return e-this._viewportRange[0]}},{key:"xAxis",get:function(){return this._xAxis}},{key:"yAxis",get:function(){return this._yAxis}},{key:"pathText",get:function(){return this._pathText}},{key:"pathElement",get:function(){return this._pathElement}},{key:"settings",get:function(){return this._settings}},{key:"isVisible",get:function(){return this._visible}},{key:"globalMinY",get:function(){return this._globalMinY}},{key:"globalMaxY",get:function(){return this._globalMaxY}},{key:"localMinY",get:function(){return this._localMinY}},{key:"localMaxY",get:function(){return this._localMaxY}},{key:"viewportPixelUpdateNeeded",get:function(){return this._viewportPixelUpdateNeeded}}])&&X(n.prototype,i),r&&X(n,r),t}();function H(e){return(H="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function W(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){var n=[],i=!0,r=!1,o=void 0;try{for(var a,u=e[Symbol.iterator]();!(i=(a=u.next()).done)&&(n.push(a.value),!t||n.length!==t);i=!0);}catch(e){r=!0,o=e}finally{try{i||null==u.return||u.return()}finally{if(r)throw o}}return n}(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance")}()}function B(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}function F(e){return(F=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function $(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function Z(e,t){return(Z=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function J(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}var K=function(e){function t(e){var n,i,r,o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),i=this,n=!(r=F(t).call(this))||"object"!==H(r)&&"function"!=typeof r?$(i):r,J($(n),"_renderer",null),J($(n),"_options",null),J($(n),"_height",250),J($(n),"_xAxis",[]),J($(n),"_series",[]),J($(n),"_seriesGroup",null),J($(n),"_viewportRange",[]),J($(n),"_viewportRangeIndexes",[]),J($(n),"_globalMinY",0),J($(n),"_globalMaxY",0),J($(n),"_localMinY",0),J($(n),"_localMaxY",0),J($(n),"_localYScale",1),J($(n),"_currentYScale",null),n._renderer=e,n._options=o,n._initialize(),n}var n,i,r;return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&Z(e,t)}(t,o),n=t,(i=[{key:"update",value:function(e){}},{key:"firstRender",value:function(){this._eachSeries(function(e){return e.firstRender()})}},{key:"setViewportRange",value:function(e,t){var n=this,i=this._xAxis,r=i[0],o=i[i.length-1];Object(a.r)(e)&&(e=e.getTime()),Object(a.r)(t)&&(t=t.getTime());var u=.05*(t-e);e=Math.max(e,r-u),t=Math.min(t,o+u),this._viewportRange=[e,t],this._updateViewportIndexes(),this._eachSeries(function(e){e.setViewportRange(n._viewportRange,n._viewportRangeIndexes)}),this._updateExtremes(),this._updateSeriesScale()}},{key:"_initialize",value:function(){this._createSeriesGroup(),this._createSeries(),this._addEvents(),this._setInitialRange()}},{key:"_createSeriesGroup",value:function(){this._seriesGroup=this._renderer.createGroup({class:"telechart-series-group",transform:"translate(0, 70) scale(1 1)"})}},{key:"_createSeries",value:function(){var e=this._options||{},t=e.series,n=e.seriesOptions,i=void 0===n?{}:n,r=t.columns,o=t.types,a=t.colors,u=t.names,s=r.findIndex(function(e){return o[e[0]]===S}),l=this._xAxis=r[s].slice(1),c=r.slice();c.splice(s,1);for(var h=0;h<c.length;++h){var f=c[h],v=f.shift(),p={xAxis:l,yAxis:f,label:v,type:o[v],color:a[v],name:u[v],options:i,width:this.chartWidth,height:this.chartHeight},_=new q(this._renderer,this._seriesGroup,p);_.setChart(this),this._series.push(_)}}},{key:"_updateViewportIndexes",value:function(){var e=W(this._viewportRange,2),t=e[0],n=e[1],i=W(Object(a.j)(this._xAxis,t),2),r=(i[0],i[1]),o=W(Object(a.j)(this._xAxis,n),2),u=o[0];o[1];this._viewportRangeIndexes=[r,u]}},{key:"_updateExtremes",value:function(){var e=0,t=0,n=0,i=0;this._eachSeries(function(r){r.isVisible&&(e>r.localMinY&&(e=r.localMinY),t<r.localMaxY&&(t=r.localMaxY),n>r.globalMinY&&(n=r.globalMinY),i<r.globalMaxY&&(i=r.globalMaxY))}),this._localMinY=e,this._localMaxY=t,this._globalMinY=n,this._globalMaxY=i,this._localYScale=this._computeYScale(),"number"!=typeof this._currentYScale&&(this._currentYScale=this._localYScale)}},{key:"_updateSeriesScale",value:function(){var e=this;this._eachSeries(function(t){t.setScale(e._currentYScale,e._localYScale),t.updateViewportPixel()})}},{key:"_addEvents",value:function(){var e=this;this._renderer.on("resize",function(t){e._onRendererResize()}),this._eachSeries(function(t){t.on("visibleChange",function(n){e._onSeriesVisibleChange(t)})})}},{key:"_setInitialRange",value:function(){var e=this._xAxis[0],t=this._xAxis[this._xAxis.length-1],n=t-e,i=Math.floor(n),r=Math.floor(.05*i);this.setViewportRange(t-i-r,t+r)}},{key:"_onRendererResize",value:function(){}},{key:"_onSeriesVisibleChange",value:function(e){this._updateExtremes(),this._updateSeriesScale()}},{key:"_computeYScale",value:function(){var e=this.globalExtremeDifference,t=this.localExtremeDifference;return e?t/e:1}},{key:"_eachSeries",value:function(){for(var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:function(){},t=0;t<this._series.length;++t)e(this._series[t])}},{key:"viewportRange",get:function(){return this._viewportRange}},{key:"viewportRangeIndexes",get:function(){return this._viewportRangeIndexes}},{key:"globalExtremeDifference",get:function(){return this._globalMaxY-this._globalMinY}},{key:"localExtremeDifference",get:function(){return this._localMaxY-this._localMinY}},{key:"localMinY",get:function(){return this._localMinY}},{key:"localMaxY",get:function(){return this._localMaxY}},{key:"globalMinY",get:function(){return this._globalMinY}},{key:"globalMaxY",get:function(){return this._globalMaxY}},{key:"chartWidth",get:function(){return this._renderer.width}},{key:"chartHeight",get:function(){return this._height}}])&&B(n.prototype,i),r&&B(n,r),t}();function Q(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}var ee=function(){function e(){var t,n,i;!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),i=0,(n="_lastUpdateMs")in(t=this)?Object.defineProperty(t,n,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[n]=i,this._lastUpdateMs=this.now}var t,n,i;return t=e,(n=[{key:"getDelta",value:function(){var e=this.now,t=e-this._lastUpdateMs;return this._lastUpdateMs=e,t}},{key:"now",get:function(){return(performance||Date).now()}}])&&Q(t.prototype,n),i&&Q(t,i),e}();function te(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}function ne(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}var ie=function(){function e(){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),ne(this,"_options",null),ne(this,"_rootElement",null),ne(this,"_renderer",null),ne(this,"_chart",null),ne(this,"_themeName",a.a.default),ne(this,"_title",""),ne(this,"_titleElement",null),ne(this,"_clock",null),ne(this,"_animationSource",null)}var t,n,i;return t=e,i=[{key:"create",value:function(t){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},i=new e;return i.setOptions(n),i.mount(Object(a.u)(t)),i.initialize(),i.firstRender(),i}}],(n=[{key:"setOptions",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};this._options=e}},{key:"mount",value:function(e){var t=Object(a.m)("div",{attrs:{class:a.d}});e.appendChild(t),this._rootElement=t,this._renderer=new k(t)}},{key:"initialize",value:function(){var e=this;this.setTheme(this._options.theme||a.a.default),this.setTitle(this._options.title),this._createChart(),this._clock=new ee,this._animationSource=new p(60,1),this._animationSource.on(v,function(t){e.update(t)}),requestAnimationFrame(function(t){e.animate()})}},{key:"firstRender",value:function(){this._chart.firstRender()}},{key:"animate",value:function(){var e=this,t=this._clock.getDelta();this._animationSource.update(t),requestAnimationFrame(function(t){return e.animate()})}},{key:"update",value:function(e){this._chart.update(e)}},{key:"setTheme",value:function(e){var t=this._rootElement;Object(a.t)(t,Object.keys(a.a).map(a.q)),Object(a.e)(t,Object(a.q)(e)),this._themeName=e}},{key:"setTitle",value:function(e){this._title=e,this._titleElement?this._updateTitle(e):this._createTitle(e)}},{key:"destroy",value:function(){this._renderer&&this._renderer.destroy(),this._rootElement=null,this._renderer=null}},{key:"_createTitle",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:this._options.title;if(e){var t=this._renderer.createText(e,{class:"telechart-title",x:16,y:36,textAnchor:"start",style:Object(a.n)({opacity:0})});setTimeout(function(e){Object(a.w)(t,{style:Object(a.n)({opacity:1})})},200),this._titleElement=t}}},{key:"_updateTitle",value:function(e){this._titleElement&&(this._titleElement.querySelector("tspan").innerHTML=e)}},{key:"_createChart",value:function(){this._chart=new K(this._renderer,this._options)}},{key:"themeName",get:function(){return this._themeName}}])&&te(t.prototype,n),i&&te(t,i),e}();n.d(t,"Telechart",function(){return ie})},function(e,t,n){}]);
//# sourceMappingURL=telechart.12089229823bdbeb6126.js.map