import sourceData from '../samples/chart_data.json';
import { Telechart } from '../src';
import {
  addClass, animationTimeout,
  ChartThemes, ChartThemesColors, clampNumber,
  createElement,
  cssText, isBrowserSafari,
  parseQueryString,
  removeClass,
  setAttributes, TimeRanges
} from '../src/utils';

const query = parseQueryString( location.search );
let currentThemeName = query && query.theme || 'default';

const largeAxisX = [ 'x' ];
const largeAxisY1 = [ 'y0' ];
const largeAxisY2 = [ 'y1' ];
const size = 1e3;
const initialDate = Date.now() - TimeRanges.year * 5;
const endDate = Date.now();
const dateTick = (endDate - initialDate) / size;

for (let i = 0; i < size; ++i) {
  largeAxisX.push( Math.floor( initialDate + dateTick * i + dateTick * (Math.random() * .5 - .5 / 2) ) );
  largeAxisY1.push( Math.sin( i * .04 ) * 1000 + Math.random() * 10 - 10 / 2 );
  largeAxisY2.push( Math.cos( i * .04 ) * 600 + Math.random() * 20 - 20 / 2 );
}

sourceData.push({
  columns: [
    largeAxisX,
    largeAxisY1,
    largeAxisY2
  ],
  names: Object.assign( {}, sourceData[ 0 ].names ),
  types: Object.assign( {}, sourceData[ 0 ].types ),
  colors: Object.assign( {}, sourceData[ 0 ].colors )
});

const charts = window.charts = [];

const from = 0;
const count = 6;

// initialize charts using requestAnimationFrame
// for better user experience
sourceData
  .slice(from, from + count)
  .map((chartData, index) => {
    return animationTimeout( 0 * 20 * index, [ chartData, index ] );
  })
  .map(animation => {
    animation.then(([ chartData, index ]) => createChart( chartData, index )).catch( console.error );
    return animation;
  });

updatePageTheme();

let buttonContent = `
  <span class="text-switcher">
    <span>Switch to </span>
    <span class="text-switcher__switcher">
      <span>Night</span>
      <span>Day</span>
    </span>
    <span> Mode</span>
  </span>
`;

const themeButton = createElement('button', {
  attrs: {
    class: 'demo-theme-button',
    style: cssText({
      opacity: 0
    })
  }
}, buttonContent);

window.addEventListener('load', _ => {
  document.body.appendChild( themeButton );

  themeButton.addEventListener('click', ev => {
    updateChartsTheme();
    updatePageTheme();
  });

  setTimeout(_ => {
    setAttributes(themeButton, {
      style: cssText({
        opacity: 1
      })
    });
  }, 100);
});

function updateChartsTheme () {
  const isDefaultTheme = currentThemeName === ChartThemes.default;
  const newTheme = isDefaultTheme
    ? ChartThemes.dark
    : ChartThemes.default;
  currentThemeName = newTheme;

  charts.forEach(chart => {
    chart.setTheme( newTheme );
  });
}

function updatePageTheme () {
  removeClass( document.body, [ 'default-theme', 'dark-theme' ] );
  addClass( document.body, `${currentThemeName}-theme` );

  if (isBrowserSafari()) {
    addClass( document.body, 'browser-safari' );
  }

  setTimeout(_ => {
    updatePageThemeColor();
  }, 300);
}

function updatePageThemeColor () {
  const themeColor = ChartThemesColors[ currentThemeName ];

  let metaTheme = document.querySelector( '[name="theme-color"]' );

  if (!metaTheme) {
    metaTheme = createElement('meta', {
      attrs: {
        name: 'theme-color',
        content: themeColor
      }
    });
    document.head.appendChild( metaTheme );
  } else {
    metaTheme.setAttribute( 'content', themeColor );
  }
}

function createChart (chartData, index) {
  const container = document.querySelector( `#telechart-${index + 1}` );

  const start = performance.now();
  const chart = Telechart.create(container, {
    title: 'Followers',
    series: {
      columns: chartData.columns,
      names: chartData.names,
      types: chartData.types,
      colors: chartData.colors,
    },
    seriesOptions: {
      grouping: {
        pixels: 2
      }
    }
  });

  console.log( `#${index}`, performance.now() - start, chart );

  // set initial theme
  chart.setTheme( currentThemeName );

  charts.push( chart );
}

const animations = [];

function runAnimation (index) {
  const chart = charts[ index ];
  let startDate = chart._chart._xAxis[ 0 ];
  let endDate = chart._chart._xAxis[ chart._chart._xAxis.length - 1 ];
  let curDate = endDate - (endDate - startDate) * .23;
  const tickDelta = (endDate - startDate) * .001;
  let sign = -1;

  function animate () {
    curDate += sign * tickDelta;
    chart._chart.setViewportRange( curDate, clampNumber(curDate + tickDelta * 60, startDate + tickDelta ) );

    if (curDate < startDate + 2 * tickDelta) {
      sign *= -1;
    } else if (curDate > endDate - tickDelta * 2) {
      sign *= -1;
    }

    // stop animation
    if (!animations.includes( index )) {
      return;
    }

    requestAnimationFrame( animate );
  }

  animations.push( index );

  animate();
}

function stopAnimation (index) {
  const i = animations.indexOf( index );
  animations.splice( i, 1 );
}

function toggleAnimation (index) {
  animations.includes( index )
    ? stopAnimation( index )
    : runAnimation( index );
}

window.toggleAnimation = toggleAnimation;
