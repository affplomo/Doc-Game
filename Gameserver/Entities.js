//Monster
(function () {
    function Monster(x, y) {
        this.startX = x;
        this.startY = y;
        this.x = this.startX;
        this.y = this.startY;
        this.speed = 50;
        this.width = 32;
        this.height = 32;
        this.direction = "left";
        
        this.lastMove = Date.now() / 1000;
        this.giveExp = parseInt(((Math.random() * 50) + 1));
        this.isAlive = true;
        this.spawnTime = parseInt(((Math.random() * 60) + 30));
        this.spawnTimer = 0;
    }
    Monster.prototype.update = function (dt) {
        var now = Date.now();
        var movable = (now - this.lastMove) / 1000;
        var mRand = Math.floor((Math.random() * 4) + 1);
        if (movable > 2) {
            switch (mRand) {
                case 1:
                    this.direction = "right";
                    break;
                case 2:
                    this.direction = "left";
                    break;
                case 3:
                    this.direction = "up";
                    break;
                case 4:
                    this.direction = "down";
                    break;
            }
            this.lastMove = Date.now();
        }
        switch (this.direction) {
            case "left":
                //if (!isColliding(this.x - 1, this.y, this.width, this.height)) {
                    this.x -= parseInt(this.speed * dt);
                //}
                break;
            case "right":
                //if (!isColliding(this.x + 1, this.y, this.width, this.height)) {
                    this.x += parseInt(this.speed * dt);
                //}
                break;
            case "up":
                //if (!isColliding(this.x, this.y - 1, this.width, this.height)) {
                    this.y -= parseInt(this.speed * dt);
                //}
                break;
            case "down":
                //if (!isColliding(this.x, this.y + 1, this.width, this.height)) {
                    this.y += parseInt(this.speed * dt);
                //}
                break;
        }
    }
    exports.Monster = Monster;
})();

//Player
(function () {
    function Player(x, y) {
        this.id = null;
        this.name = "";
        this.startX = x;
        this.startY = y;
        this.x = this.startX;
        this.y = this.startY;
        this.direction = "right";
        this.width = 32;
        this.height = 32;
        this.speed = 100;
        this.experiencePoints = 5234;
        this.experienceTable = {
            "table": [
                [0],
                [100],
                [200],
                [400],
                [800],
                [1600],
                [3200],
                [6400],
                [12800],
                [25600],
                [51200],
                [102400],
                [202800],
                [405600],
                [811200],
                [1622000],
                [3244000],
                [6488000],
                [12976000],
                [25000000]]
        }
        this.calcLevel = function () {
            for (var i = 0; i < this.experienceTable.table.length; i++) {
                if (this.experiencePoints >= this.experienceTable.table[i] && this.experiencePoints < this.experienceTable.table[i + 1]) {
                    return i + 1;
                }
            }
        }
        this.level = this.calcLevel() || 1;
        this.exptolevel = function (percent) {
            var stageExp = this.experiencePoints - this.experienceTable.table[this.level-1];
            var difference = this.experienceTable.table[this.level] - this.experienceTable.table[this.level - 1];
            var percentage = parseInt(1 - (stageExp / difference));
            if (percent) {
                return percentage;
            } else {
                return this.experienceTable.table[this.level] - this.experiencePoints;
            }
        }
        this.startHealth = 100;
        this.health = this.startHealth;
        this.startEnergy = this.level * 15;
        this.energy = this.startEnergy;
        this.strength = 10;
        this.vitality = 10;
        this.intelligence = 10;
        this.lastDamage = null;
        this.isAlive = true;
        this.immovable = false;
        this.invincible = false;        
        //this.sprite = new Game.Sprite("img/models/playersprites.png", [0, 0], [32, 32], 4, [0, 1]);
        this.inventory = [];
        this.lookingDirection = 0;
        this.lastAttack = 0;
        this.atkPos = [];        
        this.equipment = {
            "currEquipped": {
                "head": null,
                "lefthand": null,
                "righthand": null,
                "armor": null,
                "legs": null,
                "leftring": null,
                "rightring": null,
                "amulet": null,
                "scarf": null,
            },
            "itemPositions:":{
                "head": [186, 651],
                "lefthand": [153, 684],
                "righthand": [219, 684],
                "armor": [186, 684],
                "legs": [186, 717],
                "leftring": [153, 717],
                "rightring": [219, 717],
                "amulet": [153, 651],
                "scarf": [219, 651],
            },
            "inventoryPositions": {
                "length": 32,
                1: [870, 617],
                2: [903, 617],
                3: [936, 617],
                4: [969, 617],
                5: [1002, 617],
                6: [1035, 617],
                7: [1068, 617],
                8: [1101, 617],
                9: [870, 650],
                10: [903, 650],
                11: [936, 650],
                12: [969, 650],
                13: [1002, 650],
                14: [1035, 650],
                15: [1068, 650],
                16: [1101, 650],
                17: [870, 683],
                18: [903, 683],
                19: [936, 683],
                20: [969, 683],
                21: [1002, 683],
                22: [1035, 683],
                23: [1068, 683],
                24: [1101, 683],
                25: [870, 716],
                26: [903, 716],
                27: [936, 716],
                28: [969, 716],
                29: [1002, 716],
                30: [1035, 716],
                31: [1068, 716],
                32: [1101, 716],                
            }
        }
        
    }
    Player.prototype.update = function (dt) {
        if (!this.immovable) {
            if (Game.controls.left) {
                //if (!isColliding(this.x - parseInt(this.speed * dt), this.y, this.width, this.height)) {
                    this.x -= parseInt(this.speed * dt);
                //}
            }

            if (Game.controls.right) {
                //if (!isColliding(this.x + parseInt(this.speed * dt), this.y, this.width, this.height)) {
                    this.x += parseInt(this.speed * dt);
                //}

            }

            if (Game.controls.up) {
                //if (!isColliding(this.x, this.y - parseInt(this.speed * dt), this.width, this.height)) {
                    this.y -= parseInt(this.speed * dt);
                //}
            }
            if (Game.controls.down) {
                //if (!isColliding(this.x, this.y + parseInt(this.speed * dt), this.width, this.height)) {
                    this.y += parseInt(this.speed * dt);
                //}
            }
        }
    }
    Player.prototype.takeDamage = function () {
        this.immovable = true;
        this.invincible = true;

        var damageInterval = 0.3;
        var now = Date.now();
        var timeSince = (now - this.lastDamage) / 1000;
        
        switch (this.direction) {
            case "left":                
                if (timeSince < damageInterval) {
                    //if (!isColliding(this.x + 1, this.y, this.width, this.height)) {
                        this.x += 1;
                    //}
                }            
                break;
            case "right":
                if (timeSince < damageInterval) {
                    //if (!isColliding(this.x - 1, this.y, this.width, this.height)) {
                        this.x -= 1;
                    //}
                }
                break;
            case "up":
                if (timeSince < damageInterval) {
                    //if (!isColliding(this.x, this.y + 1, this.width, this.height)) {
                        this.y += 1;
                    //}
                }
                break;
            case "down":
                if (timeSince < damageInterval) {
                    //if (!isColliding(this.x, this.y - 1, this.width, this.height)) {
                        this.y -= 1;
                    //}
                }
                break;
        }
        if (timeSince > 1.3) {
            this.immovable = false;
            this.invincible = false;
        }
    }


    exports.Player = Player;
})();


//Item
(function () {
    function Item(x,y, gX, gY, name, desc, minMax) {
        //this.sprite = new Image;
        //this.sprite.src = "img/sprites.png";
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
    exports.Item = Item;
})();

//Projectile
(function(){
    function Projectile(x,y,type, angle, startX, startY){
        this.x = x+8;
        this.y = y+8;
        this.startX = startX;
        this.startY = startY;
        this.type = type || "arrow";
//        this.arrowImg = new Image();
//        this.arrowImg.src = "img/arrow.png";
//        this.fballImg = new Image();
//        this.fballImg.src = "img/fireball.png";
        this.created = Date.now();
        this.angle = angle;
        this.speed = this.type === "arrow" ? 5 : 3;
        this.rads = angle * Math.PI  / 180;
    }
    Projectile.prototype.update = function(){
        this.x += Math.sin(this.rads)*this.speed;
        this.y += Math.cos(this.rads)*this.speed;
    }
//    Projectile.prototype.draw = function(){
//        Game.ctx.save();
//        Game.ctx.translate((this.x - ((Game.player.x - ((Game.view[0] * Game.tileSize / 2)))))-16, (this.y - ((Game.player.y - ((Game.view[1] * Game.tileSize / 2))) )));
//
//        Game.ctx.rotate((this.angle * Math.PI / 180)*-1);
//        if(this.type === "arrow"){
//            Game.ctx.drawImage(this.arrowImg, this.arrowImg.width / -2, this.arrowImg.height / -2);
//        } else if(this.type === "fireball"){
//            Game.ctx.drawImage(this.fballImg, this.fballImg.width / -2, this.fballImg.height / -2);
//        }
//        Game.ctx.restore();
//    }
    exports.Projectile = Projectile;
})();