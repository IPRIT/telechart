import sourceData from '../samples/chart_data.json';
import { Telechart } from '../src';
import {
  addClass,
  ChartThemes,
  createElement,
  cssText,
  parseQueryString,
  removeClass,
  setAttributes
} from '../src/utils';

const chartData = sourceData[ 0 ];

const query = parseQueryString( location.search );

const initialTheme = query && query.theme || 'default';

const container = document.querySelector( '#telechart-1' );

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
console.log( chart, performance.now() - start );

// set initial theme
chart.setTheme( initialTheme );
updatePageTheme();

let buttonContent = chart.themeName === ChartThemes.dark
  ? 'Switch to Day Mode'
  : 'Switch to Night Mode';

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
    const isDefaultTheme = chart.themeName === ChartThemes.default;
    const newTheme = isDefaultTheme
      ? ChartThemes.dark
      : ChartThemes.default;

    chart.setTheme( newTheme );

    updateThemeButton();
  });

  setTimeout(_ => {
    setAttributes(themeButton, {
      style: cssText({
        opacity: 1
      })
    });
  }, 100);
});

function updatePageTheme () {
  addClass( document.body, `${chart.themeName}-theme` );
}

function updateThemeButton () {
  buttonContent = chart.themeName === ChartThemes.dark
    ? 'Switch to Day Mode'
    : 'Switch to Night Mode';

  removeClass( document.body, [ 'default-theme', 'dark-theme' ] );
  addClass( document.body, `${chart.themeName}-theme` );

  themeButton.innerHTML = buttonContent;
}
