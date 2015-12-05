var Mob = require('./components/mob');
var Hero = require('./components/hero');
var HeroUI = require('./components/heroUI');
var MyHero = require('./components/myhero');
var MobUI = require('./components/mobUI');
//var _ = require('lodash');

module.exports = {
    Mob: Mob,
    Hero: Hero,
    MobUI: MobUI,
    HeroUI: HeroUI, //_.mixin(HeroUI, Hero)
    MyHero: MyHero
}