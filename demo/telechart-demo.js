import sourceData from '../samples/chart_data.json';
import { SvgRenderer } from "../src/core/SvgRenderer";
import { parseSimplePathText, segmentsToPathText } from "../src/utils";

console.log( sourceData );

const container = document.createElement('div');
document.body.appendChild( container );

const renderer = new SvgRenderer( container );
console.log( renderer );

renderer.on( 'resize', ev => console.log( 'resize' ) );

const originPath = 'M -17.8555555555556 130.345 L -7.8555555555556 130.345 L 0 171.14 L 7.8555555555556 166.165 L 15.711111111111 115.42 L 23.566666666667 134.325 L 31.422222222222 143.28 L 39.277777777778 157.21 L 47.133333333333 155.22 L 54.988888888889 173.13 L 62.844444444444 165.17000000000002 L 70.7 154.225 L 78.555555555556 150.245 L 86.411111111111 116.415 L 94.266666666667 116.415 L 102.12222222222 133.32999999999998 L 109.97777777778 168.155 L 117.83333333333 156.215 L 125.68888888889 144.275 L 133.54444444444 142.285 L 141.4 144.275 L 149.25555555556 145.27 L 157.11111111111 154.225 L 164.96666666667 148.255 L 172.82222222222 135.32 L 180.67777777778 172.135 L 188.53333333333 180.095 L 196.38888888889 161.19 L 204.24444444444 161.19 L 212.1 155.22 L 219.95555555556 150.245 L 227.81111111111 157.21 L 235.66666666667 149.25 L 243.52222222222 139.3 L 251.37777777778 126.365 L 259.23333333333 113.43 L 267.08888888889 134.325 L 274.94444444444 148.255 L 282.8 145.27 L 290.65555555556 151.24 L 298.51111111111 138.305 L 306.36666666667 117.41 L 314.22222222222 116.415 L 322.07777777778 146.265 L 329.93333333333 147.26 L 337.78888888889 151.24 L 345.64444444444 135.32 L 353.5 103.48 L 361.35555555556 96.515 L 369.21111111111 131.34 L 377.06666666667 126.365 L 384.92222222222 141.29 L 392.77777777778 157.21 L 400.63333333333 118.405 L 408.48888888889 119.4 L 416.34444444444 123.38 L 424.2 93.53 L 432.05555555556 106.465 L 439.91111111111 134.325 L 447.76666666667 130.345 L 455.62222222222 95.52 L 463.47777777778 124.375 L 471.33333333333 120.395 L 479.18888888889 107.46 L 487.04444444444 126.365 L 494.9 150.245 L 502.75555555556 136.315 L 510.61111111111 123.38 L 518.46666666667 120.395 L 526.32222222222 116.415 L 534.17777777778 129.35 L 542.03333333333 144.275 L 549.88888888889 152.235 L 557.74444444444 157.21 L 565.6 88.555 L 573.45555555556 106.465 L 581.31111111111 125.37 L 589.16666666667 100.495 L 597.02222222222 92.535 L 604.87777777778 147.26 L 612.73333333333 134.325 L 620.58888888889 119.4 L 628.44444444444 117.41 L 636.3 125.37 L 644.15555555556 45.77000000000001 L 652.01111111111 93.53 L 659.86666666667 160.195 L 667.72222222222 159.2 L 675.57777777778 122.385 L 683.43333333333 114.425 L 691.28888888889 133.32999999999998 L 699.14444444444 147.26 L 707 174.125 L 717 174.125';

function getPathByScale (segments, scale) {
  const newSegments = [];

  for (let i = 0; i < segments.length; ++i) {
    const segment = segments[ i ];
    const newSegment = [];

    for (let j = 0; j < segment.length; ++j) {
      newSegment.push([
        segments[ i ][ j ][ 0 ],
        segments[ i ][ j ][ 1 ] + (400 - segments[ i ][ j ][ 1 ]) * ( 1 - scale )
      ]);
    }

    newSegments.push( newSegment );
  }

  return segmentsToPathText( newSegments );
}

function demo () {
  const path = renderer.createPath(
    originPath, {
      stroke: 'red',
      visibility: 'visible',
      fill: 'none',
      'stroke-linejoin': 'round',
      'stroke-linecap': 'round',
      'stroke-width': 2,
    }
  );

  const segments = parseSimplePathText( originPath );

  let scale = 1;
  let dScale = -1e-2;
  let ddSign = 1;
  let ddScale = ddSign * 1e-4;

  function update () {
    scale += dScale;
    dScale += ddScale;

    if (scale > 1 || scale < 0) {
      scale -= dScale;
      dScale = ddSign * -1e-2;
      ddSign = -ddSign;
      ddScale = ddSign * 1e-4;
    }
    renderer.updatePath(path, getPathByScale( segments, scale ));

    requestAnimationFrame( update );
  }

  requestAnimationFrame( update );
}

demo();
setTimeout(_ => {
  demo();
  setTimeout(_ => {
    demo();
    setTimeout(_ => {
      demo();
    }, 1000);
  }, 1000);
}, 1000);
