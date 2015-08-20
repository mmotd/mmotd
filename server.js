var express = require('express')();
var server = require('http').Server(express);
var Primus = require('primus');
var Moonboots = require('moonboots-express');
var Crafty = require('Crafty-develop')();
var _ = require('lodash');

var WORLD_SIZE_X = 640;
var WORLD_SIZE_Y = 480;

var primus = new Primus(server, {
    transformer: 'engine.io'
});

/**
 * Mobs
 */
var mobs = [];

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

var newMobInterval = setInterval(function() {
    if (mobs.length < 100) {
        var new_mob = Crafty.e('Mob').xy(
            Math.floor(Math.random() * WORLD_SIZE_X),
            Math.floor(Math.random() * WORLD_SIZE_Y)
        );
        mobs.push(new_mob);
            
        primus.write({
             worldEvent: 'newMob',
             data: {
                 id: new_mob.id,
                 x: new_mob.x,
                 y: new_mob.y
             }
        });
    }
 }, 3000);
 
 // Broadcast world update
var updateMobsInterval = setInterval(function() {
    primus.write({
        worldEvent: 'updateMobs',
        mobs: _.map(mobs, function(mob) { return _.pick(mob, 'id', 'x', 'y'); })
    });
    console.log('server.js: sent updateMobs mobs.length:' + mobs.length);
 }, 1000);


//Should this logic even happen after a 'connection' event?
primus.on('connection', function(spark){
    
    /**
     * New client connection
     *
    // Send all mobs info to all clients for every on same page
    primus.write({
        action: 'updateMobs',
        mobs: 'mobsdatahere' //@todo doesn't like when I try to send mobs array here at 'mobsdatahere'
    })*/
    
    //When a client sends data to the server, a "spark", do stuff:
    spark.on('data', function(data){

        switch (data.event) {
            
            case 'heroMoved':
                //console.log('server.js: received event: ' + data.event + ' id: ' + data.id);
                primus.write({
                    worldEvent: 'heroMoved',
                    hero: data
                });
                break;
                
            case 'mobHit':
                //console.log('server.js: mob hit! id: ' + data.id);
                mobs.forEach(function(element, index, array) {
                    if (data.id == element.id) {
                        element.destroy();
                        array.splice(index,1);
                        //console.log('server.js: destroyed mobs[id=' + index + ']');
                        primus.write({
                            worldEvent:'deadMob',
                            id : element.id
                        })
                    }
                });
                break;
                
        }//switch

    });
    
});

primus.on('disconnection', function (spark) {

});


/**
 * Non game stuff
 */
var moonboots = new Moonboots({
    server: express,
    moonboots: {
        main: __dirname + '/client/app.js',
        developmentMode: true,
        /*stylesheets: [
            __dirname + '/public/css/app.css'
        ],*/
        libraries: [
            __dirname + '/client/lib/primus.js'
        ]
    }
});

server.listen(8080, function (){
    primus.save(__dirname +'/client/lib/primus.js'); //In case any transformer config stuff changed, re-compile the client library
    console.log('Server is running');
})
.on('error', function(err) {
        console.log(err);
});