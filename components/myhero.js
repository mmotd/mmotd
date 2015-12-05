/* global primus */

module.exports = {
    init: function(){
        this.name = prompt("enter hero name");
        
        this.addComponent("Fourway, HeroUI");
        this.fourway(200);
        this.color('blue');
        
        // announce location on creation
        primus.write({
            event: 'heroMoved',
            id: this.id,
            x : this.x,
            y : this.y
        });
        
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