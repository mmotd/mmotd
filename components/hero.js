/* global primus */
var stage = require('../game_config.json').stage;

/*
One problem here is that we're executing a primus.write even on "Moved", which would also be used by the server.
That's probably a better event to have on the UI side of things, though that makes the suffix UI perhaps misleading.
Maybe change heroUI to heroClient
*/

module.exports = {
    init: function(){
        this.addComponent("2D, Collision, Solid");
        
        this.id = Math.random();
        console.log('new hero created with id: '+this.id);
        
        this.x = stage.width/2;
        this.y = stage.height/2;
        
        this.w = 20;
        this.h = 20;
        
        this.score = 0;
        
        this.collision();
        this.onHit('Mob', function(data) {
            /*data.forEach(function(object) {
                console.log("hero.js onHit Mob: " + object);
            });*/
            this.score++;
            primus.write({
                event: 'heroHitMob',
                id: this.id,
                score: this.score
            });
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
    
    // Tell server new Hero has been created
    sendHero: function() {
        primus.write({
            id: this.id,
            x : this.e.x,
            y : this.e.y
        });
    }
}