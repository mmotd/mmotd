var express = require('express')();
var server = require('http').Server(express);
var Primus = require('primus');
var Moonboots = require('moonboots-express');
var Crafty = require('craftyjs')();
var Components = require('./components');
var _ = require('lodash');

var config = require('./game_config.json');

var primus = new Primus(server, {
    transformer: 'engine.io'
});

//Load base components
_.forEach(Components, function(v,k){ 
    if(!/UI$/.test(k)){ Crafty.c(k,v) }
});


/**
 * World
 */
var world = {
    entities: []
};

/** World Update Loop **/
// This is mostly handled by Crafty?

function makeMob() {
    world.entities.push({
        'type' : 'mob',
        'object' : Crafty.e('Mob').xy(
            Math.floor(Math.random() * config.stage.width),
            Math.floor(Math.random() * config.stage.height)
        )
    });
}

var newMobInterval = setInterval(function() {
    var mob_count = _.countBy(world.entities, function(entity) {
        return entity['type'] == 'mob';
    })['true'];
    mob_count = parseInt(mob_count ? mob_count : 0);
    
    if (mob_count < 10) {
        world.entities.push({
            'type' : 'mob',
            'object' : Crafty.e('Mob').xy(
                Math.floor(Math.random() * config.stage.width),
                Math.floor(Math.random() * config.stage.height)
            )
    });
    }
    
}, 1000);
    
/** Server Update Loop **/
// Process queue of messages from clients:
// processQueue();
    
/** Client Update Loop **/
// Send world update to clients
var updateLoop = setInterval(function(){
    var worldUpdate = _.cloneDeep(world);
    
    worldUpdate.entities.forEach(function(el, index, obj) {
        if (el.type == 'mob') {
           el.object = _.pick(el.object, 'id', 'x', 'y');
        }
        obj[index] = el;
    });
    
    primus.write({
        world: worldUpdate
    });
     
 }, 14);
 
 var scoreboard = {};
 function updateScoreboard(userid, score) {
     scoreboard[userid] = { "userid":userid, "score":score };
 }

//Should this logic even happen after a 'connection' event?
primus.on('connection', function(spark){
    
    
    
    /** Process Spark from Clients **/
    spark.on('data', function(data){

        switch (data.event) {
            
            /**
             * Hero Events
             */
            case 'heroDisconnect':
                primus.write({
                    worldEvent: 'heroDisconnect',
                    hero: data
                });
                break;
                
            case 'heroHitMob':
                updateScoreboard(data.id,data.score);
                primus.write({
                    "worldEvent": "scoreboardUpdate",
                    "scoreboard": scoreboard
                });
                break;
            
            case 'heroMoved':
                primus.write({
                    worldEvent: 'heroMoved',
                    hero: data
                });
                break;
            
            /**
             * Mob Events
             */
            case 'mobHit':
                world.entities.forEach(function(el, index, array) {
                    if (el.type === 'mob') {
                        if (data.id == el.object.id) {
                            array[index].object.destroy();
                            array.splice(index,1);
                            primus.write({
                                worldEvent:'deadMob',
                                id : el.object.id
                            });
                        }    
                    }
                });
                
                break;
                
        }

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
            __dirname + '/client/primus.js'
        ]
    }
});

server.listen(process.env.PORT || 3000, function (){
    primus.save(__dirname +'/client/primus.js'); //In case any transformer config stuff changed, re-compile the client library
    console.log('Server is running');
})
.on('error', function(err) {
        console.log(err);
});