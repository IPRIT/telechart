import sourceData from '../samples/chart_data.json';
import { SvgRenderer } from "../src/core/SvgRenderer";

console.log( sourceData );

const container = document.createElement('div');
document.body.appendChild( container );

const svgRenderer = new SvgRenderer( container );

console.log( svgRenderer );
