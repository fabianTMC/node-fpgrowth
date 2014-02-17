"use strict";

/*
inspired by
http://hareenlaks.blogspot.com.br/2011/10/how-to-identify-frequent-patterns-from.html
*/

function fpgrow(){

//itens of the main basket
var items = {};

//root of the main fp-tree
var root = {};

//support in % passed as an argument
var supportPercent = Number(process.argv[2]);

//transformed support to be used in calculation
var support = Math.ceil((supportPercent/100) * baskets.length);

//array with the results of fp-grow
var patterns = [];


var baskets = [
{ id: 1,
	items: ['e','a','d','b']
},
{ id: 2,
	items: ['d','a','c','e','b']
},
{ id: 3,
	items: ['c','a','b','e']
},
{ id: 4,
	items: ['b','a','d']
},
{ id: 5,
	items: ['d']
},
{ id: 6,
	items: ['d','b']
},
{ id: 7,
	items: ['a','d','e']
},
{ id: 8,
	items: ['b','c']
}
];



function breakInItems(baskets){

	var items = {};

	for(var i in baskets){
		for(var j in baskets[i].items){
			var item = baskets[i].items[j];
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

function resort(baskets,items){
	for(var i in baskets){
		baskets[i].items.sort(function(a,b){

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

		for(var j in baskets[i].items){

			var itemFromBasket = baskets[i].items[j];
			
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
		var id = '';
		var basket = {
			id: 'basket',
			items: []
		};

		while(current.last){
			basket.items.push(current.id);
			id+=current.id;
			current = current.last;
		}
		basket.id = id;
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
		rootinside.id = root.id+id;
	}

	for(var i in itemsinside){
		if(itemsinside[i].count >= support){

			patterns.push({
				id: rootinside.id+itemsinside[i].id,
				count: itemsinside[i].count
			});

			conditionalTree(itemsinside[i].id,rootinside);
		}
	}
}

items = breakInItems(baskets);

resort(baskets,items);

root = buildTree(baskets);

for(var i in items){

	if(items[i].count >= support){
		patterns.push(
		{
			id: items[i].id,
			count: items[i].count
		}
		);
	}

	conditionalTree(items[i].id,root);
}

console.log(patterns);
};

exports.convert = fpgrow;