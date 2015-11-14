/* global Primus */
var game = require('../game');

window.onload = function(){

    window.primus = Primus.connect();
    game();
    
}