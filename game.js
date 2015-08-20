var Crafty = require('craftyjs');
var primus = Primus.connect();
require('./components/mob');
require('./components/hero');
//var _ = require('lodash');
//ar UUID = require('node-uuid');

module.exports = function(){

    var STAGE_X = 640;
    var STAGE_Y = 480;
    
    var clients = [];
    var heros = [];
    var mobs = [];
    
    // Initialize Crafty
    Crafty.init(STAGE_X, STAGE_Y);
    Crafty.background('#00FF00 url(http://fc02.deviantart.net/fs70/f/2013/162/0/1/grass_tile_1_by_blackyinwolf1234-d68mmht.png) repeat');

    var myHero = Crafty.e('Hero').fourway(3).addComponent('Color').color('blue').collision();
    var self = this;
    primus.on('data', function(data){
        console.log(data);
        
        // worldEvent received from server so update client.
        switch (data.worldEvent) {
            case 'heroMoved':
                if (data.hero.id != myHero.id) {
                    var inHeros = null;
                    heros.forEach(function(hero) {
                        if (hero.id == data.hero.id) {
                            inHeros = true;
                            hero.x = data.hero.x;
                            hero.y = data.hero.y;
                        }
                    });
                    if (!inHeros) {
                        heros.push(Crafty.e('Hero')
                                .setId(data.hero.id)
                                .xy(data.hero.x,data.hero.y)
                                .addComponent('Color') 
                                .color('grey')
                        );
                    }
                }
                break;
                
            case 'newMob':
                mobs.push(Crafty.e('Mob').setId(data.data.id).xy(data.data.x,data.data.y).addComponent('Color').color('orange'));
                break;
            
            case 'updateMobs':
                console.log('game.js: client received worldEvent:updateMobs mobs: ' + data.mobs);
                data.mobs.forEach(function(serverMob) {
                    var inClientMobs = null;
                    mobs.forEach(function(clientMob) {
                        if (clientMob.id == serverMob.id) {
                            inClientMobs = true;
                            //clientMob.x = serverMob.x;
                            //clientMob.y = serverMob.y;
                        }
                    });
                    if (!inClientMobs) {
                        mobs.push(Crafty.e('Mob').setId(serverMob.id).xy(serverMob.x,serverMob.y).addComponent('Color').color('orange'));
                    }

                });
                break;
            
            case 'deadMob':
                mobs.forEach(function(element, index, array) {
                    if (data.id == element.id) {
                        element.destroy();
                    }
                });
                break;
        }
        
    });//primus on data
    
};