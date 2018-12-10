const fs = require( 'fs' );
const LineByLineReader = require('line-by-line');

const inputPath = process.argv[2];
const outputPath = inputPath + '.pcd';

const lr = new LineByLineReader( inputPath );
const os = fs.createWriteStream( outputPath );

let PCDHeader = {
	VERSION: '0.7',			// fixed as 0.7
	FIELDS: 'x y z rgb',	// fixed as 'x y z rgb'
	SIZE: '4 4 4',			// fixed as float '4 4 4'
    TYPE: 'F F F',			// fixed as float 'F F F'
    COUNT: '1 1 1',			// fixed as '1 1 1'
    WIDTH: 0,				// equals with POINTS header
    HEIGHT: 1,				// fixed as 1
    VIEWPOINT: '0 0 0 1 0 0 0',	// fixed as '0 0 0 1 0 0 0'
    POINTS: 0,				// equals with first line of pts file
    DATA: 'ascii',			// fixed as 'ascii'
}
let lineCount = 0;


lr.on('error', function (err) {

	console.log( err );

});


lr.on('line', function (line) {

	line = line.trim().split( ' ' );
	if (line[0] !== '') {

		if (lineCount === 0) {

			PCDHeader.WIDTH = line[0];
			PCDHeader.POINTS = line[0];
			writePCDHeader();

		} else {

			writePoint( line );

		}

		if (lineCount % 1000000 === 0) {
			console.log( `Proceeded until ${lineCount}...` );
		}
		++lineCount;

	}

});


lr.on('end', function () {

	os.end();

	console.log( 'The converting is ended' );

});


function writePCDHeader() {

	// pcd header entries should follow its order
	const HeaderOrder = [
		'VERSION',
		'FIELDS',
		'SIZE',
		'TYPE',
		'COUNT',
		'WIDTH',
		'HEIGHT',
		'VIEWPOINT',
		'POINTS',
		'DATA',
	];

	let headerString = '';
	HeaderOrder.forEach( entry => {
		headerString += entry + ' ' + PCDHeader[entry].toString() + '\n';
	});

	os.write( headerString, 'ascii' );

}


function writePoint( line ) {

	let xyz = line.slice( 0, 3 );
	let [r, g, b] = line.slice( 4, line.length ).map( element => parseInt(element) );

	const intensity = (line[3] + 2048) / 4096	// normalize ranging in 0 to 1, unused property
	const rgb = ((r & 0x0000ff) << 16) | ((g & 0x0000ff) << 8) | (b & 0x0000ff);
	const point = xyz.join(' ') + ' ' + rgb + '\n';

	os.write( point, 'ascii' );

}





