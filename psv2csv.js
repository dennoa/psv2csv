'use strict';

const psv2csv = require('./index.js');
const fs = require('fs');
const path = require('path');

function createCsv(psv, csv, options) {
  return new Promise((resolve, reject)=> {
    console.log('Processing ' + csv);
    let psvStream = fs.createReadStream(psv, { encoding: 'utf8' });
    let csvStream = fs.createWriteStream(csv);
    psvStream.pipe(psv2csv(options)).pipe(csvStream)
      .on('close', resolve)
      .on('error', reject);
  });
}

function sanitizeDirname(dirname) {
  let normalized = path.normalize(dirname);
  return (normalized.charAt(normalized.length - 1) === '/') ? normalized : normalized + '/';
}

function getCsvDir() {
  let pos = process.argv.indexOf('--csvdir');
  return (pos > 2 && pos < (process.argv.length - 1)) ? sanitizeDirname(process.argv[pos+1]) : null;
}

function exit(err) {
  if (err) {
    console.log('Failed!');
    console.log(err);
    return process.exit(1);
  }
  console.log('Completed sucessfully!');
}

if (process.argv.length < 3) {
  console.log('Usage:\n\n\tnode psv2csv psv/dir [options]\n');
  console.log('Where psv/dir is the path to the directory holding the psv files to be transformed.\n');
  console.log('Options:');
  console.log('\t--csvdir dirname\tOutput the csv files to dirname. If not specified, the csv files will be written to the same directory as the psv files.');
  console.log('\t--lowercaseheader\tTransform the first line of each file to lowercase.')
  process.exit(1);
}

const psvdir = sanitizeDirname(process.argv[2]);
const csvdir = getCsvDir() || psvdir;
const options = (process.argv.indexOf('--lowercaseheader') > 2) ? { transformHeader: (header => header.toLowerCase()) } : null;

fs.readdir(psvdir, (err, psvPaths)=> {
  if (err) { return exit(err); }
  let csvs = [];
  for (let psvPath of psvPaths.filter(name => name.lastIndexOf('.psv') === name.length - 4)) {
    let psv = psvdir + psvPath;
    let csv = csvdir + psvPath.substring(0, psvPath.length - 4) + '.csv';
    csvs.push(createCsv(psv, csv, options));
  }
  Promise.all(csvs).then(()=> {
    exit(); 
  }).catch(exit);
});
