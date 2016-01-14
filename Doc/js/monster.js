"use strict";
//Monster
(function () {
    function Monster(x, y, health, strength) {
        this.startX = x;
        this.startY = y;
        this.x = this.startX;
        this.y = this.startY;
        this.speed = 50;
        this.width = 32;
        this.height = 32;
        this.direction = "left";
        this.sprite = new Game.Sprite("img/models/monstersprites.png", [0, 0], [32, 32], 2, [0, 1]);
        this.lastMove = Date.now() / 1000;
        this.giveExp = parseInt(((Math.random() * 50) + 1));
        this.isAlive = true;
        this.spawnTime = parseInt(((Math.random() * 60) + 30));
        this.spawnTimer = 0;
        this.health = health;
        this.strength = strength;
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
                if (!isColliding(this.x - 1, this.y, this.width, this.height)) {
                    this.x -= parseInt(this.speed * dt);
                }
                break;
            case "right":
                if (!isColliding(this.x + 1, this.y, this.width, this.height)) {
                    this.x += parseInt(this.speed * dt);
                }
                break;
            case "up":
                if (!isColliding(this.x, this.y - 1, this.width, this.height)) {
                    this.y -= parseInt(this.speed * dt);
                }
                break;
            case "down":
                if (!isColliding(this.x, this.y + 1, this.width, this.height)) {
                    this.y += parseInt(this.speed * dt);
                }
                break;
        }
    }
    Game.Monster = Monster;
})();