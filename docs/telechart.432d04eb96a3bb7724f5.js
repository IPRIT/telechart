!function(e){var t={};function n(r){if(t[r])return t[r].exports;var i=t[r]={i:r,l:!1,exports:{}};return e[r].call(i.exports,i,i.exports,n),i.l=!0,i.exports}n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var i in e)n.d(r,i,function(t){return e[t]}.bind(null,i));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=11)}([function(e,t,n){"use strict";var r=n(3);n.d(t,"TimeRanges",function(){return r.a});var i=n(4);n.o(i,"ChartThemes")&&n.d(t,"ChartThemes",function(){return i.ChartThemes}),n.o(i,"ROOT_CLASS_NAME")&&n.d(t,"ROOT_CLASS_NAME",function(){return i.ROOT_CLASS_NAME}),n.o(i,"addClass")&&n.d(t,"addClass",function(){return i.addClass}),n.o(i,"capitalize")&&n.d(t,"capitalize",function(){return i.capitalize}),n.o(i,"clampNumber")&&n.d(t,"clampNumber",function(){return i.clampNumber}),n.o(i,"createElement")&&n.d(t,"createElement",function(){return i.createElement}),n.o(i,"cssText")&&n.d(t,"cssText",function(){return i.cssText}),n.o(i,"ensureNumber")&&n.d(t,"ensureNumber",function(){return i.ensureNumber}),n.o(i,"getElementWidth")&&n.d(t,"getElementWidth",function(){return i.getElementWidth}),n.o(i,"interpolateThemeClass")&&n.d(t,"interpolateThemeClass",function(){return i.interpolateThemeClass}),n.o(i,"removeClass")&&n.d(t,"removeClass",function(){return i.removeClass}),n.o(i,"resolveElement")&&n.d(t,"resolveElement",function(){return i.resolveElement}),n.o(i,"setAttributes")&&n.d(t,"setAttributes",function(){return i.setAttributes}),n.o(i,"setAttributesNS")&&n.d(t,"setAttributesNS",function(){return i.setAttributesNS});var o=n(1);n.d(t,"clampNumber",function(){return o.a}),n.d(t,"ensureNumber",function(){return o.b});n(5);var u=n(6);n.d(t,"addClass",function(){return u.a}),n.d(t,"createElement",function(){return u.b}),n.d(t,"getElementWidth",function(){return u.c}),n.d(t,"removeClass",function(){return u.d}),n.d(t,"resolveElement",function(){return u.e}),n.d(t,"setAttributes",function(){return u.f}),n.d(t,"setAttributesNS",function(){return u.g});n(7),n(8);var s=n(2);n.d(t,"capitalize",function(){return s.b}),n.d(t,"cssText",function(){return s.c});var a=n(9);n.d(t,"ChartThemes",function(){return a.a}),n.d(t,"ROOT_CLASS_NAME",function(){return a.b}),n.d(t,"interpolateThemeClass",function(){return a.c});n(10)},function(e,t,n){"use strict";function r(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:function(){};Object.keys(e).forEach(t)}function i(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:-1/0,n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:1/0;if(t>n){var r=[n,t];t=r[0],n=r[1]}return Math.min(Math.max(o(e),t),n)}function o(e){return e=Number(e),Number.isNaN(e)?0:e}n.d(t,"c",function(){return r}),n.d(t,"a",function(){return i}),n.d(t,"b",function(){return o})},function(e,t,n){"use strict";function r(e){return e?(e=String(e))[0].toUpperCase()+e.substr(1):""}function i(e){return Object.keys(e).reduce(function(t,n){return"".concat(t?t+" ":"").concat(o(n),": ").concat(e[n],";")},"")}function o(e){return e?((e=String(e))[0].toLowerCase()+e.substr(1)).replace(/([A-Z])/g,"-$1").toLowerCase():""}n.d(t,"b",function(){return r}),n.d(t,"c",function(){return i}),n.d(t,"a",function(){return o})},function(e,t,n){"use strict";n.d(t,"a",function(){return r});var r={second:1e3,minute:6e4,hour:36e5,day:864e5,week:6048e5,month:2592e6,year:31536e6}},function(e,t){},function(e,t,n){"use strict"},function(e,t,n){"use strict";n.d(t,"b",function(){return u}),n.d(t,"e",function(){return s}),n.d(t,"c",function(){return a}),n.d(t,"f",function(){return l}),n.d(t,"g",function(){return f}),n.d(t,"a",function(){return v}),n.d(t,"d",function(){return d});var r=n(1),i=n(2);function o(e){return function(e){if(Array.isArray(e)){for(var t=0,n=new Array(e.length);t<e.length;t++)n[t]=e[t];return n}}(e)||function(e){if(Symbol.iterator in Object(e)||"[object Arguments]"===Object.prototype.toString.call(e))return Array.from(e)}(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance")}()}function u(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:[],r=arguments.length>3&&void 0!==arguments[3]?arguments[3]:null,i=r?document.createElementNS(r,e):document.createElement(e);return t.attrs&&(t.useNS?f(i,t.attrs,t.attrsNS||null):l(i,t.attrs)),(n||Array.isArray(n))&&(n=[].concat(n)).forEach(function(e){"string"==typeof e&&(e=document.createTextNode(e)),i.appendChild(e)}),i}function s(e){return"string"!=typeof e?e:document.querySelector(e)}function a(e){return e.innerWidth||e.clientWidth}var c=["viewBox"];function l(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};e=s(e),Object(r.c)(t,function(n){var r=c.includes(n)?n:Object(i.a)(n);e.setAttribute(r,t[n])})}function f(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null;e=s(e),Object(r.c)(t,function(r){var o=c.includes(r)?r:Object(i.a)(r);e.setAttributeNS(n,o,t[r])})}function h(e,t){return e.classList?e.classList.contains(t):new RegExp("(\\s|^)"+t+"(\\s|$)").test(e.className)}function v(e){var t,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:[];if(n=[].concat(n),e.classList)return(t=e.classList).add.apply(t,o(n));for(var r=e.className,i=0;i<n.length;++i)h(e,n[i])||(r+=" ".concat(n[i]));e.className=r.trim()}function d(e){var t,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:[];if(n=[].concat(n),e.classList)return(t=e.classList).remove.apply(t,o(n));for(var r=e.className.split(" "),i=new Set(n),u="",s=0;s<r.length;++s)i.has(r[s])||(u+=" ".concat(r[s]));e.className=u.trim()}},function(e,t,n){"use strict"},function(e,t,n){"use strict";n(0)},function(e,t,n){"use strict";n.d(t,"b",function(){return r}),n.d(t,"c",function(){return i}),n.d(t,"a",function(){return o});var r="telechart-root";function i(e){return"".concat(r,"_theme_").concat(e)}var o={default:"default",dark:"dark"}},function(e,t,n){"use strict"},function(e,t,n){"use strict";n.r(t);n(13);var r=n(0);function i(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){var n=[],r=!0,i=!1,o=void 0;try{for(var u,s=e[Symbol.iterator]();!(r=(u=s.next()).done)&&(n.push(u.value),!t||n.length!==t);r=!0);}catch(e){i=!0,o=e}finally{try{r||null==s.return||s.return()}finally{if(i)throw o}}return n}(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance")}()}function o(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}var u=function(){function e(){var t,n,r;!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),r={},(n="_eventListeners")in(t=this)?Object.defineProperty(t,n,{value:r,enumerable:!0,configurable:!0,writable:!0}):t[n]=r}var t,n,r;return t=e,(n=[{key:"emit",value:function(e){for(var t=arguments.length,n=new Array(t>1?t-1:0),r=1;r<t;r++)n[r-1]=arguments[r];this._fireEvent.apply(this,[e].concat(n))}},{key:"on",value:function(e,t){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null;this.addEventListener(e,t,n)}},{key:"once",value:function(e,t){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null;this.addEventListenerOnce(e,t,n)}},{key:"addEventListener",value:function(e,t){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null;t&&this._subscribeEvent(e,t,n)}},{key:"addEventListenerOnce",value:function(e,t){var n=this,r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:null;if(t){this.addEventListener(e,function i(){for(var o=arguments.length,u=new Array(o),s=0;s<o;s++)u[s]=arguments[s];t.apply(r,u),n.removeEventListener(e,i)})}}},{key:"removeEventListener",value:function(e,t){if(this._eventListeners[e]){var n=this._eventListeners[e].findIndex(function(e){var n=i(e,1)[0];return t===n});n<0||this._eventListeners[e].splice(n,1)}}},{key:"removeAllListeners",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null;e?this._eventListeners[e]&&(this._eventListeners[e]=null,delete this._eventListeners[e]):this._eventListeners={}}},{key:"_allocateEvent",value:function(e){this._eventListeners[e]=this._eventListeners[e]||[]}},{key:"_subscribeEvent",value:function(e,t,n){this._allocateEvent(e),this._eventListeners[e].push([t,n])}},{key:"_fireEvent",value:function(e){for(var t=this._eventListeners[e]||[],n=arguments.length,r=new Array(n>1?n-1:0),o=1;o<n;o++)r[o-1]=arguments[o];for(var u=0;u<t.length;++u){var s=i(t[u],2),a=s[0],c=s[1];a.apply(c,r)}}}])&&o(t.prototype,n),r&&o(t,r),e}();function s(e){return(s="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function a(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function c(e){return(c=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function l(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function f(e,t){return(f=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function h(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}var v="".concat(Object(r.capitalize)("telechart")," ").concat("1.0.0"," (c) ").concat("Alexander Belov"),d=1,p=function(e){function t(e){var n,i,o;return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),i=this,n=!(o=c(t).call(this))||"object"!==s(o)&&"function"!=typeof o?l(i):o,h(l(n),"_id",d++),h(l(n),"_parentContainer",null),h(l(n),"_svgContainer",null),h(l(n),"_minHeight",400),h(l(n),"_minWidth",300),h(l(n),"_width",null),h(l(n),"_height",null),h(l(n),"_isInitialized",!1),n._parentContainer=Object(r.resolveElement)(e),n._init(),n}var n,i,o;return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&f(e,t)}(t,u),n=t,(i=[{key:"createGroup",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:[],i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:this._svgContainer,o=Object(r.createElement)("g",{useNS:!0,attrs:e},n,t.NS);return i.appendChild(o),o}},{key:"createDesc",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:this._svgContainer,i=Object(r.createElement)("desc",{useNS:!0},e,t.NS);return n.appendChild(i),i}},{key:"createText",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:this._svgContainer,o=Object(r.createElement)("tspan",{useNS:!0},e,t.NS),u=Object(r.createElement)("text",{useNS:!0,attrs:n},o,t.NS);return i.appendChild(u),u}},{key:"createDefs",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[],n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:this._svgContainer;e=[].concat(e);var i=Object(r.createElement)("defs",{useNS:!0},e,t.NS);return n.appendChild(i),i}},{key:"createPath",value:function(e){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:this._svgContainer;Object.assign(n,{d:e});var o=Object(r.createElement)("path",{useNS:!0,attrs:n},[],t.NS);return i.appendChild(o),o}},{key:"updatePath",value:function(e,t){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};n.d=t,Object(r.setAttributesNS)(e,n,null)}},{key:"destroy",value:function(){this._detachEvents(),this._clearParentContainer()}},{key:"_init",value:function(){this._isInitialized||(this._updateDimensions(),this._svgContainer=this._createSvgContainer(),this._insertSvgContainer(),this.createDesc(v),this._attachEvents(),this._isInitialized=!0)}},{key:"_createSvgContainer",value:function(){if(!this._parentContainer)throw new Error("Parent container is not provided");return Object(r.createElement)("svg",{useNS:!1,attrs:{xmlns:t.NS,version:"1.1",width:this._width,height:this._height,viewBox:this.viewBox,class:r.ROOT_CLASS_NAME}},[],t.NS)}},{key:"_insertSvgContainer",value:function(){this._clearParentContainer(),this._parentContainer.appendChild(this._svgContainer)}},{key:"_updateDimensions",value:function(){this._width=Object(r.clampNumber)(Object(r.getElementWidth)(this._parentContainer),this._minWidth),this._height=this._minHeight,this._svgContainer&&Object(r.setAttributes)(this._svgContainer,{width:this._width,height:this._height,viewBox:this.viewBox})}},{key:"_clearParentContainer",value:function(){this._parentContainer.innerHTML=""}},{key:"_onResize",value:function(e){this.emit("resize",e),this._updateDimensions()}},{key:"_attachEvents",value:function(){this._attachResizeListener()}},{key:"_detachEvents",value:function(){this._detachResizeListener()}},{key:"_attachResizeListener",value:function(){this._resizeListener&&this._detachResizeListener(),this._resizeListener=this._onResize.bind(this),window.addEventListener("resize",this._resizeListener)}},{key:"_detachResizeListener",value:function(){this._resizeListener&&window.removeEventListener("resize",this._resizeListener)}},{key:"id",get:function(){return this._id}},{key:"parentContainer",get:function(){return this._parentContainer}},{key:"svgContainer",get:function(){return this._svgContainer}},{key:"viewBox",get:function(){return[0,0,this._width,this._height].join(" ")}}])&&a(n.prototype,i),o&&a(n,o),t}();h(p,"NS","http://www.w3.org/2000/svg");var y="x";function _(e){return(_="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function b(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function m(e){return(m=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function g(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function O(e,t){return(O=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function w(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}var E=function(e){function t(e){var n,r,i,o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),r=this,n=!(i=m(t).call(this))||"object"!==_(i)&&"function"!=typeof i?g(r):i,w(g(n),"_pathText",null),w(g(n),"_pathElement",null),w(g(n),"_renderer",null),w(g(n),"_xAxis",[]),w(g(n),"_yAxis",[]),w(g(n),"_name",null),w(g(n),"_label",null),w(g(n),"_color","#31a8dc"),w(g(n),"_points",[]),w(g(n),"_visiblePoints",[]),w(g(n),"_settings",{}),w(g(n),"_seriesOptions",{}),n._renderer=e,n._settings=o,n._parseSettings(),n.initialize(),n}var n,r,i;return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&O(e,t)}(t,u),n=t,(r=[{key:"initialize",value:function(){}},{key:"update",value:function(e){}},{key:"setPathText",value:function(e){this._pathText=e}},{key:"setPathElement",value:function(e){this._pathElement=e}},{key:"_parseSettings",value:function(){var e=this._settings,t=e.xAxis,n=e.yAxis,r=e.label,i=(e.type,e.color),o=e.name,u=e.options;this._xAxis=t,this._yAxis=n,this._label=r,this._color=i,this._name=o,this._seriesOptions=u}},{key:"xAxis",get:function(){return this._xAxis}},{key:"yAxis",get:function(){return this._yAxis}},{key:"pathText",get:function(){return this._pathText}},{key:"pathElement",get:function(){return this._pathElement}},{key:"settings",get:function(){return this._settings}}])&&b(n.prototype,r),i&&b(n,i),t}();function S(e){return(S="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function C(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function j(e){return(j=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function k(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function x(e,t){return(x=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function T(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}var A=function(e){function t(e){var n,r,i,o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),r=this,n=!(i=j(t).call(this))||"object"!==S(i)&&"function"!=typeof i?k(r):i,T(k(n),"_renderer",null),T(k(n),"_options",null),T(k(n),"_height",250),T(k(n),"_xAxis",[]),T(k(n),"_series",[]),T(k(n),"_range",[]),n._renderer=e,n._options=o,n._initialize(),n}var n,i,o;return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&x(e,t)}(t,u),n=t,(i=[{key:"setRange",value:function(e,t){var n=this._xAxis,r=n[0],i=n[n.length-1];e=Math.max(e,r),t=Math.max(t,i),this._range=[e,t]}},{key:"_initialize",value:function(){this._createSeries()}},{key:"_createSeries",value:function(){var e=this._options||{},t=e.series,n=e.seriesOptions,i=void 0===n?{}:n,o=t.columns,u=t.types,s=t.colors,a=t.names,c=o.findIndex(function(e){return u[e[0]]===y}),l=this._xAxis=o[c].slice(1),f=o.slice();f.splice(c,1);for(var h=0;h<f.length;++h){var v=f[h],d=v.shift(),p={xAxis:l,yAxis:v,label:d,type:u[d],color:s[d],name:a[d],options:i};this._series.push(new E(this._renderer,p))}var _=l[l.length-1],b=2*r.TimeRanges.week;this.setRange(_-b,_)}},{key:"range",get:function(){return this._range}}])&&C(n.prototype,i),o&&C(n,o),t}();function N(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function L(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}var P=function(){function e(){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),L(this,"_options",null),L(this,"_rootElement",null),L(this,"_renderer",null),L(this,"_chart",null),L(this,"_themeName",r.ChartThemes.default.name),L(this,"_title",""),L(this,"_titleElement",null)}var t,n,i;return t=e,i=[{key:"create",value:function(t){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},i=new e;return i.setOptions(n),i.mount(Object(r.resolveElement)(t)),i.initialize(),i}}],(n=[{key:"setOptions",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};this._options=e}},{key:"mount",value:function(e){this._rootElement=e,this._renderer=new p(e)}},{key:"initialize",value:function(){this.setTheme(this._options.theme||r.ChartThemes.default),this.setTitle(this._options.title),this._createChart()}},{key:"setTheme",value:function(e){var t=this._renderer.svgContainer;Object(r.removeClass)(t,Object.keys(r.ChartThemes).map(r.interpolateThemeClass)),Object(r.addClass)(t,Object(r.interpolateThemeClass)(e)),this._themeName=e}},{key:"setTitle",value:function(e){this._title=e,this._titleElement?this._updateTitle(e):this._createTitle(e)}},{key:"destroy",value:function(){this._renderer&&this._renderer.destroy(),this._rootElement=null,this._renderer=null}},{key:"_createTitle",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:this._options.title;if(e){var t=this._renderer.createText(e,{class:"telechart-title",x:16,y:36,textAnchor:"start",style:Object(r.cssText)({opacity:0})});setTimeout(function(e){Object(r.setAttributesNS)(t,{style:Object(r.cssText)({opacity:1})})},200),this._titleElement=t}}},{key:"_updateTitle",value:function(e){this._titleElement&&(this._titleElement.querySelector("tspan").innerHTML=e)}},{key:"_createChart",value:function(){this._chart=new A(this._renderer,this._options)}}])&&N(t.prototype,n),i&&N(t,i),e}();n.d(t,"Telechart",function(){return P})},,function(e,t,n){}]);
//# sourceMappingURL=telechart.432d04eb96a3bb7724f5.js.map