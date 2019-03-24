import sourceData from '../samples/chart_data.json';
import { Telechart } from '../src';
import {
  addClass, animationTimeout,
  ChartThemes, ChartThemesColors, clampNumber,
  createElement,
  cssText, isBrowserSafari,
  parseQueryString,
  removeClass,
  setAttributes
} from '../src/utils';

const query = parseQueryString( location.search );
let currentThemeName = query && query.theme || 'default';

const charts = window.charts = [];

const from = 0;
const count = 6;

// initialize charts using requestAnimationFrame
// for better user experience
sourceData
  .slice(from, from + count)
  .map((chartData, index) => {
    return animationTimeout( 0, [ chartData, index ] );
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
  let curDate = endDate - (endDate - startDate) * .03;
  const tickDelta = (endDate - startDate) * .005;
  let sign = -1;

  function animate () {
    curDate += sign * tickDelta;
    chart._chart.setViewportRange( curDate, clampNumber(curDate + tickDelta * 30, startDate + tickDelta ) );

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
