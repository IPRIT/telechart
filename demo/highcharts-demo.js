import sourceData from '../samples/chart_data.json';

const script = document.createElement('script');

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
  Highcharts.stockChart('highchart', {
    rangeSelector: {
      selected: 1
    },

    title: {
      text: 'Followers'
    },

    series
  });
}
