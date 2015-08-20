//Old Mob from the client
rafty.c('Mob',{
        init: function() {
            this.addComponent("2D, Canvas, Color, Collision");
            this.w = 10;
            this.h = 10;
            this.id = '';
            
            this.onHit("hero_element", function() {
                primus.write({
                    event:'mobHit',
                    id: this.id
                });
                this.destroy();
            });
            
            this.bind("EnterFrame", function(eventData) {
                // Y
                if (this.y < STAGE_Y/2) { this.y = this.y + 10 * (eventData.dt / 1000); }
                else if (this.y > STAGE_Y/2) { this.y = this.y - 10 * (eventData.dt / 1000); }
                // X
                if (this.x < STAGE_X/2) { this.x = this.x + 10 * (eventData.dt / 1000); }
                else if (this.x > STAGE_X/2) { this.x = this.x - 10 * (eventData.dt / 1000); }
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
        }
    });
    
//Old Hero
  Crafty.e('2D, Canvas, Hero, Color, Fourway, Solid, Collision')
            .attr({x: STAGE_X/2, y: STAGE_Y/2, w: 20, h: 20})
            .color('blue')
            .fourway(3)
            .collision();
            
/*myHero.e.bind('Moved', function(pos){
        primus.write({
            id:myHero.id,
            x:pos.x,
            y:pos.y
        });
    });*/
    
//Mob from server
Crafty.c('Mob',{
    init: function() {
        this.addComponent("2D, Canvas, Collision");
        this.w = 10;
        this.h = 10;
        this.id = Math.random();
        
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


//Example dispath stuff
primus.on('data', parseData);
    
    parseData = function(data){
        switch(data.event){
            case 'mobHit': moveMob();
            case 'newPlayer': addHero();
        }
    }
    
    var dispatch = {
        mobHit: moveMob,
        newPlayer: addHero
    };
    
    if (dispatch.hasOwnProperty(data.event)){
        dispatch[data.event];
    }