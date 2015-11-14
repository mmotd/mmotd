/* global primus */

module.exports = {
    init: function(){
        this.name = prompt("enter hero name");
        primus.write({
            event: 'heroMoved',
            id: this.id,
            x : this.x,
            y : this.y
        });
        
        this.addComponent("Fourway, HeroUI");
        this.fourway(200);
        this.color('blue');
        
        this.bind('Moved', function(pos){
            primus.write({
                event: 'heroMoved',
                id: this.id,
                x: this.x,
                y: this.y
            });
        });
    }
}