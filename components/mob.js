var Crafty = require('craftyjs');
var primus = Primus.connect();

var WORLD_SIZE_X = 640;
var WORLD_SIZE_Y = 480;

Crafty.c('Mob',{
    init: function() {
        this.addComponent("2D, Canvas, Collision");
        this.w = 10;
        this.h = 10;
        
        this.id = Math.random();
        
        this.onHit('Hero', function() {
            console.log('mob.js: mobHit id: ' + this.id);
            primus.write({
                event: 'mobHit',
                id: this.id
            });
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
    
    // Our two entities had different positions, 
    // so we define a method for setting the position
    xy: function(x, y) {
        this.x = x;
        this.y = y;
        return this; // return entity allows method chaining
    },
    
    setId: function(id) {
        this.id = id;
        return this; // return entity allows method chaining
    }
});