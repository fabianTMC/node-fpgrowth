"use strict";
var fs = require('fs');
/*
inspired by
http://hareenlaks.blogspot.com.br/2011/10/how-to-identify-frequent-patterns-from.html
*/

/* @param support support in %
*/
function fpgrowth(support) {
    // Check if we got valid parameters
    if(support == undefined) {
        throw "Pass a support percent";
    } else {
        this.supportPercent = support;
    }

    //items of the main basket
    this.items = {};

    //root of the main fp-tree
    this.root = {};

    //transformed support to be used in calculation
    this.support = 0;

    //array with the results of fp-grow
    this.patterns = [];

    return this;
};

/* Set the contents of the basket to be the JSONArray passed 
 * @param JSONArray the array of arrays to be used */
fpgrowth.prototype.fromArray = function(JSONArray) {
    if(JSONArray == undefined) {
        throw "Pass the json array";
    } else {
        this.baskets = JSONArray;
    }

    return this;
}

/* Set the contents of the basket to be the contents of the file passed
 * @param filename the name of the file to read and parse as JSON */
fpgrowth.prototype.fromFile = function(filename) {
    if(filename == undefined) {
        throw "Pass a filename";
    } else {    
        //verify if the file exists
        if(fs.existsSync(filename)) {
            var content = fs.readFileSync(filename);
            try {
                this.baskets = JSON.parse(content);
            } catch(e) {
                throw "A JSON exception occurred while trying to parse the contents of " + filename + ": " + e.toString();
            }
        } else{
            throw 'File does not exist - ' + filename;
        }
    }

    return this;
}

fpgrowth.prototype.breakInItems = function(baskets){
        
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
//order by count. if count is the same for two itens, the functio uses 
fpgrowth.prototype.resort = function(baskets, items){

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

    return baskets;
}

//build the main fp-tree
fpgrowth.prototype.buildTree = function(baskets){

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

fpgrowth.prototype.makeBasket = function(node){

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

fpgrowth.prototype.conditionalTree = function(id, root){

    var item = this.items[id];
    var baskets = [];
    for(var i in root.nodes[id]){

        var node = root.nodes[id][i];

        for(var j = 0;j<node.count;j++){
            var basket = this.makeBasket(node);
            if(basket){
                baskets.push(basket);   
            }
        }
    }
    
    var itemsinside = this.breakInItems(baskets);
    this.resort(baskets, itemsinside);
    var rootinside = this.buildTree(baskets);

    

    if(root.id === 'empty'){
        rootinside.id = id;
    }else{
        rootinside.id = root.id+','+id;
    }

    for(var i in itemsinside){
        if(itemsinside[i].count >= this.support){

            this.patterns.push({
                basket: rootinside.id+','+itemsinside[i].id,
                count: itemsinside[i].count
            });

            this.conditionalTree(itemsinside[i].id,rootinside);
        }
    }
}


fpgrowth.prototype.main = function() {
    if(Object.prototype.toString.call(this.baskets) !== '[object Array]') {
        throw "Baskets is not an array."
    }


    //find itens
    this.items = this.breakInItems(this.baskets);

    //order by frequency desc
    this.baskets = this.resort(this.baskets, this.items);

    //calculate the support
    this.support = Math.ceil((this.supportPercent/100) * this.baskets.length);

    //start the tree
    this.root = this.buildTree(this.baskets);

    //make the tree
    for(var i in this.items){

        if(this.items[i].count >= this.support){
            this.patterns.push(
            {
                basket: this.items[i].id,
                count: this.items[i].count
            }
            );
        }

        this.conditionalTree(this.items[i].id, this.root);
    }

    return this.patterns;
}

module.exports = fpgrowth;