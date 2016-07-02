# psv2csv
Convert psv (pipe separated) files to csv (commma separated) files.

## Usage
	const psv2csv = require('psv2csv');

	let psvStream = fs.createReadStream('my/psv/file', { encoding: 'utf8' });
	let csvStream = fs.createWriteStream('my/csv/file');

	psvStream.pipe(psv2csv()).pipe(csvStream);
