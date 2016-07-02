'use strict';

const psv2csv = require('../index.js');
const expect = require('chai').expect;
const fs = require('fs');

function createCsv(psv, options) {
  return new Promise((resolve, reject)=> {
    let csv = psv.substring(0, psv.length - 4) + '.csv';
    let psvStream = fs.createReadStream(psv, { encoding: 'utf8' });
    let csvStream = fs.createWriteStream(csv);
    psvStream.pipe(psv2csv(options)).pipe(csvStream)
      .on('close', resolve)
      .on('error', reject);
  });
}

describe('psv2csv', function() {

  it('should transform psv to csv', function(done) {
    let psv = __dirname + '/data/Authority_Code_LOCALITY_CLASS_AUT_psv.psv';
    createCsv(psv).then(()=> {
      fs.readFile(__dirname + '/data/Authority_Code_LOCALITY_CLASS_AUT_psv.csv', 'utf8', (err, csv)=> {
        if (err) { return done(err); }
        expect(csv.indexOf('"CODE","NAME","DESCRIPTION"')).to.equal(0);
        expect(csv.indexOf('"V","UNOFFICIAL TOPOGRAPHIC FEATURE","UNOFFICIAL TOPOGRAPHIC FEATURE"')).to.be.greaterThan(0);
        done();
      });
    })
  });

  it('should allow the header to be transformed by some function', function(done) {
    let options = { transformHeader: (header => header.toLowerCase()) };
    let psv = __dirname + '/data/Authority_Code_LEVEL_TYPE_AUT_psv.psv';
    createCsv(psv, options).then(()=> {
      fs.readFile(__dirname + '/data/Authority_Code_LEVEL_TYPE_AUT_psv.csv', 'utf8', (err, csv)=> {
        if (err) { return done(err); }
        expect(csv.indexOf('"code","name","description"')).to.equal(0);
        done();
      });
    })
  });

  it('should escape double quotes with another double quote', function(done) {
    let psv = __dirname + '/data/double_quote_test.psv';
    createCsv(psv).then(()=> {
      fs.readFile(__dirname + '/data/double_quote_test.csv', 'utf8', (err, csv)=> {
        if (err) { return done(err); }
        expect(csv.indexOf('"Arnie said ""I\'ll be back"""')).to.be.greaterThan(0);
        done();
      });
    })
  });

});
