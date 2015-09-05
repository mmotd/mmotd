var Crafty = require('craftyjs');
var primus = Primus.connect();

Crafty.c('Hero', {
    init: function(){
        this.id = Math.random();
        this.addComponent("2D, Canvas, Collision, Fourway, Solid");
        this.addComponent("2D, DOM, Text");
        
        this.x = 640/2;
        this.y = 480/2;
        this.w = 20;
        this.h = 20;
        //this.color = 'black';
        //this.fourway = 3;
        //this.id = '';
        
        this.bind('Moved', function(pos){
            primus.write({
                event: 'heroMoved',
                id: this.id,
                x: pos.x,
                y: pos.y
            });
        });
        
        primus.write({
            id: this.id,
            x : this.x,
            y : this.y
        });
    },
    
    xy: function(x, y) {
        this.x = x;
        this.y = y;
        return this; // return entity allows method chaining
    },
    
    setId: function(id) {
        this.id = id;
        return this; // return entity allows method chaining
    },
    
    setText: function(mytext) {
        this.text(mytext);
        return this; // return entity allows method chaining
    },
    
    // Tell server new Hero has been created
    sendHero: function() {
        primus.write({
            id: this.id,
            x : this.e.x,
            y : this.e.y
        });
    }
});