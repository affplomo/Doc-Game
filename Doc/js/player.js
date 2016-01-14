"use strict";
//Player
(function () {
    function Player(name, x, y, starthealth, id, health) {
        this.id = id;
        this.name = name;
        this.startX = x;
        this.startY = y;
        this.x = this.startX;
        this.y = this.startY;
        this.direction = "right";
        this.width = 32;
        this.height = 32;
        this.speed = 100;
        this.currAction = "arrow";
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
            var stageExp = this.experiencePoints - this.experienceTable.table[this.level - 1];
            var difference = this.experienceTable.table[this.level] - this.experienceTable.table[this.level - 1];
            var percentage = parseInt(1 - (stageExp / difference));
            if (percent) {
                return percentage;
            } else {
                return this.experienceTable.table[this.level] - this.experiencePoints;
            }
        }
        this.startHealth = starthealth;
        this.health = health;
        this.startEnergy = this.level * 15;
        this.energy = this.startEnergy;
        this.strength = 10;
        this.vitality = 10;
        this.intelligence = 10;
        this.lastDamage = null;
        this.isAlive = true;
        this.immovable = false;
        this.invincible = false;
        this.sprite = new Game.Sprite("img/models/playermodel.png", [0, 0], [32, 32], 4, [0, 0]);
        this.inventory = [];
        this.lookingDirection = 0;
        this.lastAttack = 0;
        this.lastSecondAttack = Date.now();
        this.atkPos = [];
        this.aimPos = [];
        this.weaponImage = new Image(),
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
                "scarf": null
            },
            "itemPositions:": {
                "head": [186, 651],
                "lefthand": [153, 684],
                "righthand": [219, 684],
                "armor": [186, 684],
                "legs": [186, 717],
                "leftring": [153, 717],
                "rightring": [219, 717],
                "amulet": [153, 651],
                "scarf": [219, 651]
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
                32: [1101, 716]
            }
        }

    }
    Player.prototype.update = function (dt) {

        var prevX = this.x,
            prevY = this.y;
        if (!this.immovable) {
            if (Game.controls.left) {
                if (!isColliding(this.x - parseInt(this.speed * dt), this.y, this.width, this.height)) {
                    this.x -= parseInt(this.speed * dt);
                }
            }

            if (Game.controls.right) {
                if (!isColliding(this.x + parseInt(this.speed * dt), this.y, this.width, this.height)) {
                    this.x += parseInt(this.speed * dt);
                }

            }

            if (Game.controls.up) {
                if (!isColliding(this.x, this.y - parseInt(this.speed * dt), this.width, this.height)) {
                    this.y -= parseInt(this.speed * dt);
                }
            }
            if (Game.controls.down) {
                if (!isColliding(this.x, this.y + parseInt(this.speed * dt), this.width, this.height)) {
                    this.y += parseInt(this.speed * dt);
                }
            }
        }
        return (prevX !== this.x || prevY !== this.y) ? true : false;
    }
    Player.prototype.takeDamage = function () {
        this.immovable = true;

        var damageInterval = 0.05;
        var now = Date.now();
        var timeSince = (now - this.lastDamage) / 1000;

//        switch (this.direction) {
//            case "left":
//                if (timeSince < damageInterval) {
//                    if (!isColliding(this.x + 1, this.y, this.width, this.height)) {
//                        this.x += 1;
//                    }
//                }
//                break;
//            case "right":
//                if (timeSince < damageInterval) {
//                    if (!isColliding(this.x - 1, this.y, this.width, this.height)) {
//                        this.x -= 1;
//                    }
//                }
//                break;
//            case "up":
//                if (timeSince < damageInterval) {
//                    if (!isColliding(this.x, this.y + 1, this.width, this.height)) {
//                        this.y += 1;
//                    }
//                }
//                break;
//            case "down":
//                if (timeSince < damageInterval) {
//                    if (!isColliding(this.x, this.y - 1, this.width, this.height)) {
//                        this.y -= 1;
//                    }
//                }
//                break;
//        }
        if (timeSince > 1.3) {
            this.immovable = false;
            this.invincible = false;
        }
    }

    Player.prototype.attack = function () {
        if (this.lastAttack > 1) {
            this.atkPos = this.aimPos;
            this.lastAttack = 0;
            Game.socket.emit("attacked", { pos: this.atkPos, time: Date.now(), attackType: "melee"});
        }
    }

    Player.prototype.reset = function () {
        document.getElementById("shadowbackground").className = "hidden";
        this.isAlive = true;
        this.health = this.startHealth;
        this.x = this.startX;
        this.y = this.startY;
    }

    Player.prototype.draw = function (ctx) {
        this.sprite.render(ctx);
        ctx.fillStyle = "white";
        ctx.font = "12px";
        ctx.textAlign = "center";
        ctx.fillText(this.name, 16, -16);
        ctx.fillStyle = "red";
        ctx.fillRect(-1, -10, parseInt((this.health / this.startHealth) * 100) / 3, 6);
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = 'black';
        ctx.strokeRect(-1.5, -10.5, 33, 6);
    }
    Game.Player = Player;
})();