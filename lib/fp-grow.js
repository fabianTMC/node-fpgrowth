"use strict";
var fs = require('fs');
/*
inspired by
http://hareenlaks.blogspot.com.br/2011/10/how-to-identify-frequent-patterns-from.html
*/

//main function
function fpgrow(){

//itens of the main basket
var items = {};

//root of the main fp-tree
var root = {};

//transformed support to be used in calculation
var support = 0;

//array with the results of fp-grow
var patterns = [];

//support in % passed as an argument
var supportPercent;

//var to hold the file with the baskets
var file;

//var to hold the file content
var content;

//var to hold the input baskets
var baskets;

//init function - it should handle the args
function init(){

	// process.argv[1] is the name, so we start at 2
	// seccond param should be the suport value (percent)
	if(process.argv.length > 2){
		supportPercent = Number(process.argv[2]);
	}else{
		throw 'Pass on a support value';
	}

	//third value is the input file with the baskets
	if(process.argv.length > 3){

		//set file as the input file
		file = process.argv[3];
		
		//verify if the file exists
		if(fs.existsSync(file)) {
			content = fs.readFileSync(file);
		}else{
			throw 'File does not exist - ' + file;
		}
	}else{
		throw 'Pass on a file name/path');
	}
}


function breakInItems(baskets){
	
	var items = {};

	for(var i in baskets){
		for(var j in baskets[i]){
			var item = baskets[i][j];
			if(!items[item]){
				items[item] = { 
					id:item,
					count:1,
					nodes:[]
				};
			}else{
				items[item].count++;
			}
		}
	}
	return items;
}

//sort an array of baskets using an item array as reference.
//order by count. if count is the same for two itens, the function uses 
function resort(baskets,items){

	for(var i in baskets){
		baskets[i].sort(function(a,b){

			if(items[b].count === items[a].count){
				if (items[a].id < items[b].id){
					return -1;
				}
				if (items[a].id > items[b].id){
					return 1;
				}
			}else{
				return (items[b].count-items[a].count);				
			}
		});
	}
}

//build the main fp-tree
function buildTree(baskets){

	var root = { 
		id:'empty',
		next:{},
		nodes:{}
	};

	for(var i in baskets){

		var last = root;

		for(var j in baskets[i]){

			var itemFromBasket = baskets[i][j];

			if(last.next[itemFromBasket]){

				last.next[itemFromBasket].count++;
				last = last.next[itemFromBasket];

			}else{
				var node = {
					id: itemFromBasket,
					count:1, 
					next:{},
					last: null
				};

				if(!root.nodes[itemFromBasket]){
					root.nodes[itemFromBasket] = [];
				}	
				root.nodes[itemFromBasket].push(node);

				last.next[itemFromBasket] = node;
				node.last = last;
				last = node;
			}
		}
	}
	

	return root;
}

function makeBasket(node){

	var current = node.last;
	
	if(current.last){
		var basket = [];

		while(current.last){
			basket.push(current.id);
			current = current.last;
		}
		return basket;
	}else{
		return false;
	}	
	
}



function conditionalTree(id,root){

	var item = items[id];
	var baskets = [];
	for(var i in root.nodes[id]){

		var node = root.nodes[id][i];

		for(var j = 0;j<node.count;j++){
			var basket = makeBasket(node);
			if(basket){
				baskets.push(basket);	
			}
		}
	}
	
	var itemsinside = breakInItems(baskets);
	resort(baskets,itemsinside);
	var rootinside = buildTree(baskets);

	

	if(root.id === 'empty'){
		rootinside.id = id;
	}else{
		rootinside.id = root.id+','+id;
	}

	for(var i in itemsinside){
		if(itemsinside[i].count >= support){

			patterns.push({
				basket: rootinside.id+','+itemsinside[i].id,
				count: itemsinside[i].count
			});

			conditionalTree(itemsinside[i].id,rootinside);
		}
	}
}


function main(){

	//handle the inputs
	init();

	//transform
	baskets = JSON.parse(content);

	//find itens
	items = breakInItems(baskets);

	//order by frequency desc
	resort(baskets,items);

	//calculate the support
	support = Math.ceil((supportPercent/100) * baskets.length);

	//start the tree
	root = buildTree(baskets);

	//make the tree
	for(var i in items){

		if(items[i].count >= support){
			patterns.push(
			{
				basket: items[i].id,
				count: items[i].count
			}
			);
		}

		conditionalTree(items[i].id,root);
	}
}


main();
return patterns;

};
exports.convert = fpgrow;