var Crafty = require('craftyjs');
var Components = require('./components');
var config = require('./game_config.json');
var stage = config.stage;

var _ = require('lodash');
/* global primus */
//require('./components/heroUI_test')();

module.exports = function(){
    
    // Initialize Crafty
    Crafty.init(stage.width, stage.height);
    Crafty.background('#00FF00 url(http://fc02.deviantart.net/fs70/f/2013/162/0/1/grass_tile_1_by_blackyinwolf1234-d68mmht.png) repeat');
    //Crafty.load()
    //Load component definitions (keep eye on this to make sure it loads all base compoenents before UI)
    _.forEach(Components, function(v,k){
        Crafty.c(k,v);
    });

    var heros = [];
    var mobs = [];

    var myHero = Crafty.e('MyHero');
    var myScoreboard = Crafty.e('Scoreboard');
    
    Crafty.viewport.clampToEntities = false
    Crafty.viewport.follow(myHero, -60, 0);
    
    //console.log(Crafty.settings.get('autoPause'));
    
    window.addEventListener('beforeunload', function(){
        primus.write({
            event: 'heroDisconnect',
            id: myHero.id
        });
    });
    
    primus.on('data', function(data){
        // process worldState updateLoop from server
        if (typeof data.world != 'undefined') {
            //console.log("client received updateLoop from server");
            
            worldMobs = _.filter(data.world.entities, function(entity) {
                return entity.type === 'mob';
            });
            worldMobObjects = _.pluck(worldMobs, 'object');
                
            /*** Mobs Update ***/
            worldMobObjects.forEach(function(worldMob) {
                var inClientMobs = null;
                mobs.forEach(function(clientMob) {
                    if (clientMob.id == worldMob.id) {
                        inClientMobs = true;
                    }
                });
                if (!inClientMobs) {
                    mobs.push(Crafty.e('MobUI').setId(worldMob.id).xy(worldMob.x,worldMob.y));
                }

            });
        }
        
        switch (data.worldEvent) {
            
            case 'heroDisconnect':
                heros.forEach(function(hero) {
                        if (hero.id == data.hero.id) {
                            hero.destroy();
                        }
                    });
                break;
                
            case 'heroMoved':
                //console.log('hero moved' + data.hero);
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
                        //console.log('new hero from server has id:'+ data.hero.id);
                        heros.push(Crafty.e('HeroUI')
                                .setId(data.hero.id)
                                .xy(data.hero.x,data.hero.y)
                        );
                    }
                }
                break;
                
            /*case 'updateMobs':
                data.mobs.forEach(function(serverMob) {
                    var inClientMobs = null;
                    mobs.forEach(function(clientMob) {
                        if (clientMob.id == serverMob.id) {
                            inClientMobs = true;
                        }
                    });
                    if (!inClientMobs) {
                        mobs.push(Crafty.e('MobUI').setId(serverMob.id).xy(serverMob.x,serverMob.y));
                    }

                });
                break;*/
            
            case 'deadMob':
                mobs.forEach(function(element, index, array) {
                    if (data.id == element.id) {
                        element.destroy();
                    }
                });
                break;
                
            case 'scoreboardUpdate':
                var leaderboard = _.sortBy(data.scoreboard,"score").reverse();
                var leaderboardView = _.map(leaderboard,function(user) {
                    return {"user":user.userid.toString().substr(0,6), "score":user.score};
                });
                console.log(leaderboardView);
                myScoreboard.setText(JSON.stringify(leaderboardView,null,2));
                break;
        }
        
    });
    
};