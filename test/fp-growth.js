// Include the testing library
var chai = require('chai');
var should = chai.should();

// Include our module
var fpgrowth = require('../lib/fp-growth');

// Support Percent related tests
describe('SupportPercentTests', function() {
  it('should throw an error because no support percentage was provided', function() {
    (function() {
        new fpgrowth();
    }).should.throw("Pass a support percent");
  });

  it('should not throw an error because the support percentage was provided', function() {
    (function() {
        new fpgrowth(5);
    }).should.not.throw("Pass a support percent");
  });
});

// Baskets related tests
describe('BasketsTests', function() {
  it('should throw an error because no baskets were provided', function() {
    (function() {
        new fpgrowth(5).main();
    }).should.throw("Baskets is not an array");
  });

    describe('FileTests', function() {
          it('should throw an error because the filename was not provided', function() {
            (function() {
                new fpgrowth(5).fromFile().main();
            }).should.throw("Pass a filename");
          });

          it('should throw an error because the file does not exist', function() {
            (function() {
                new fpgrowth(5).fromFile("./basketss.json").main();
            }).should.throw("File does not exist");
          });

          it('should throw an error because the file contains invalid json', function() {
            (function() {
                new fpgrowth(5).fromFile("./test/invalid.json").main();
            }).should.throw("Unexpected end of input");
          });

          it('should not throw an error because the file contains valid json', function() {
            (function() {
                new fpgrowth(5).fromFile("./test/baskets.json").main();
            }).should.not.throw();
          });
    });

    describe('ArrayTests', function() {
           it('should throw an error because the baskets array is not provided', function() {
            (function() {
                new fpgrowth(5).fromArray().main();
            }).should.throw("Pass the json array");
          });

          it('should throw an error because the baskets array is an object', function() {
            (function() {
                new fpgrowth(5).fromArray({}).main();
            }).should.throw("Baskets is not an array");
          });

          it('should not throw an error because the baskets is an empty array', function() {
            (function() {
                new fpgrowth(5).fromArray([]).main();
            }).should.not.throw("Baskets is not an array");
          });

          it('should not throw an error because the baskets array is an array of objects', function() {
            (function() {
                console.log(new fpgrowth(5).fromArray([{1: 1}, {2: 2}]).main());
            }).should.not.throw("Baskets is not an array");
          });
    });
});