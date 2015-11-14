var config = require('../game_config.json');
var stage = config.stage;
/* global primus */

module.exports = {
    init: function() {
        this.addComponent("2D, Collision");
        
        this.id = Math.random();
        this.alive = true;
        
        this.w = 10;
        this.h = 10;
        
        this.collision();
        this.onHit('Hero', function(data) {
            /*data.forEach(function(object) {
                console.log("mob.js onHit Hero: " + object);
            });*/
            //console.log('mob.js: mobHit id: ' + this.id);
            primus.write({
                event: 'mobHit',
                id: this.id
            });
            this.alive = false;
            this.destroy();
        });
        
         this.bind("EnterFrame", function(eventData) {
            // Y
            if (this.y < stage.height/2) { this.y = this.y + 10 * (eventData.dt / 1000); }
            else if (this.y > stage.height/2) { this.y = this.y - 10 * (eventData.dt / 1000); }
            // X
            if (this.x < stage.width/2) { this.x = this.x + 10 * (eventData.dt / 1000); }
            else if (this.x > stage.width/2) { this.x = this.x - 10 * (eventData.dt / 1000); }
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
}