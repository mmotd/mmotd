var Crafty = require('Crafty-develop')();

var WORLD_SIZE_X = 640;
var WORLD_SIZE_Y = 480;

Crafty.c('Mob',{
    init: function() {
        console.log('hi?');
        this.addComponent("2D, Canvas, Collision");
        this.w = 10;
        this.h = 10;
        this.id = Math.random();
        //this.x = Math.floor(Math.random() * WORLD_SIZE_X);
        //this.y = Math.floor(Math.random() * WORLD_SIZE_Y);
        
        this.onHit("Hero", function() {
            primus.write({ event:'mobHit' });
            this.destroy();
        });
        
        this.bind("EnterFrame", function(eventData) {
            // Y
            if (this.y < WORLD_SIZE_Y/2) { this.y = this.y + 10 * (eventData.dt / 1000); }
            else if (this.y > WORLD_SIZE_Y/2) { this.y = this.y - 10 * (eventData.dt / 1000); }
            // X
            if (this.x < WORLD_SIZE_X/2) { this.x = this.x + 10 * (eventData.dt / 1000); }
            else if (this.x > WORLD_SIZE_X/2) { this.x = this.x - 10 * (eventData.dt / 1000); }
        });
        
    },
    
    xy: function(x, y) {
        this.x = x;
        this.y = y;
        return this; // return entity allows method chaining
    }
});