var config = require('../game_config.json');
var stage = config.stage;
/* global primus */

module.exports = {
    init: function(){
        this.addComponent('2D, Canvas, Text');
        this.x = 10;
        this.y = 10;
        
        this.textFont({ size: '16px' });
    },
    
    setText: function(newText) {
        this.text(newText);
        return this;
    }
}