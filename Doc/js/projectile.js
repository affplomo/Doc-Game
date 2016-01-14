"use strict";
(function(){
     function Projectile(x,y,type, angle, startX, startY){
         this.x = x+8;
         this.y = y+8;
         this.startX = startX;
         this.startY = startY;
         this.type = type || "arrow";
         this.arrowImg = new Image();
         this.arrowImg.src = "img/arrow.png";
         this.fballImg = new Image();
         this.fballImg.src = "img/fireball.png";
         this.created = Date.now();
         this.angle = angle;
         this.speed = this.type === "arrow" ? 6 : 5;
         this.rads = angle * Math.PI  / 180;
         this.width = function(){
             switch(this.type){
                 case "arrow":
                     return this.arrowImg.width;
                     break;
                 case "fireball":
                     return this.fballImg.width;
                     break;
                 default:
                     break;
             }
         };
         this.height = function(){
             switch(this.type){
                 case "arrow":
                     return this.arrowImg.height;
                     break;
                 case "fireball":
                     return this.fballImg.height;
                     break;
                 default:
                     break;
             }
         }
     }
    Projectile.prototype.update = function(){
        this.x += Math.sin(this.rads)*this.speed;
        this.y += Math.cos(this.rads)*this.speed;
    }
    Projectile.prototype.draw = function(){
        Game.ctx.save();
        Game.ctx.translate((this.x - ((Game.player.x - ((Game.view[0] * Game.tileSize / 2)))))-16, (this.y - ((Game.player.y - ((Game.view[1] * Game.tileSize / 2))) )));

        Game.ctx.rotate((this.angle * Math.PI / 180)*-1);
        if(this.type === "arrow"){
            Game.ctx.drawImage(this.arrowImg, this.arrowImg.width / -2, this.arrowImg.height / -2);
        } else if(this.type === "fireball"){
            Game.ctx.drawImage(this.fballImg, this.fballImg.width / -2, this.fballImg.height / -2);
        }
        Game.ctx.restore();
    }
    Game.Projectiled = Projectile;
})();