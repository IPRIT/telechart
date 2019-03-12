import sourceData from '../samples/chart_data.json';

console.log( sourceData );

const script = document.createElement('script');
const container = document.createElement('div');

// container
container.setAttribute('id', 'container');
document.body.appendChild( container );

// script loader
script.async = true;
script.onload = initDemo;
script.src = 'https://code.highcharts.com/stock/highstock.js';
document.head.appendChild( script );

const sample = sourceData[ 3 ];
const columns = sample.columns;

const yColumns = columns.filter(column => {
  const chartLabel = column[ 0 ];
  return sample.types[ chartLabel ] === 'line';
});

const xColumn = columns.filter(column => {
  const chartLabel = column[ 0 ];
  return sample.types[ chartLabel ] === 'x';
})[0].slice( 1 );

const series = yColumns.map(column => {
  const chartLabel = column[ 0 ];
  const chartType = sample.types[ chartLabel ];
  const chartName = sample.names[ chartLabel ];
  const chartData = column.slice( 1 ).map((value, index) => {
    return [
      xColumn[ index ],
      value
    ];
  });

  return {
    name: chartName,
    data: chartData,
    tooltip: {
      valueDecimals: 2
    }
  };
});

function initDemo () {
  Highcharts.stockChart('container', {
    rangeSelector: {
      selected: 1
    },

    title: {
      text: 'Followers'
    },

    series
  });
}
