var fpgrowth = require('../lib/fp-growth');

var baskets = [
["e","a","d","b"],
["d","a","c","e","b"],
["c","a","b","e"],
["b","a","d"],
["d"],
["d","b"],
["a","d","e"],
["b","c"]
];

console.log(new fpgrowth(5, baskets).main());