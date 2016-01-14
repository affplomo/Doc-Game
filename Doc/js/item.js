"use strict";
//Item
(function () {
    function Item(x, y, gX, gY, name, desc, minMax) {
        this.sprite = new Image;
        this.sprite.src = "img/sprites.png";
        this.x = x;
        this.y = y;
        this.gX = gX;
        this.gY = gY;
        this.name = name;
        this.description = desc;
        this.minMax = minMax;
        this.size = [32, 32];
    }
    Item.prototype.draw = function () {
        Game.ctx.drawImage(this.sprite,
                              this.gX, this.gY,
                              this.size[0], this.size[1],
                              0, 0,
                              this.size[0], this.size[1]);
    }
    Game.Item = Item;
})();