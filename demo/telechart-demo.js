import sourceData from '../samples/chart_data.json';
import { Telechart } from '../src';
import { ChartThemes } from '../src/utils';

const chartData = sourceData[ 0 ];

console.log( chartData );

const container = document.querySelector( '#telechart' );

const chart = Telechart.create(container, {
  title: 'Followers',
  series: {
    columns: chartData.columns,
    names: chartData.names,
    types: chartData.types,
    colors: chartData.colors,
  }
});

setTimeout(_ => {
  chart.setTheme( ChartThemes.dark );
}, 5000);
