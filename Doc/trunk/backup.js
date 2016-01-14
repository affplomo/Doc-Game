
window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };
})();
var ctx = document.createElement("canvas").getContext("2d");
var c = document.getElementById("canvas");
ctx.canvas.width = 800;
ctx.canvas.height = 640;
ctx.canvas.id = "myCanvas";
ctx.canvas.tabIndex = "1";
c.appendChild(ctx.canvas);
var canvas = ctx.canvas;

window.Game = {};

Game.controls = {
    left: false,
    up: false,
    right: false,
    down: false,
    hit: false,
};

Game.mousePosition = {
    xClick: 0,
    yClick: 0,
    xRelease: 0,
    yRelease: 0,
    leftClick: false,
    rightClick: false,
};

//Monster
(function () {
    function Monster(x, y) {
        this.x = x;
        this.y = y;
        this.speed = 50;
        this.width = 32;
        this.height = 32;
        this.direction = "left";
        this.sprite = new Sprite("img/models/monstersprites.png", [0, 0], [32, 32], 2, [0, 1]);
        this.lastMove = Date.now() / 1000;
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

//Player
(function () {
    function Player(name, x, y) {
        this.name = name;
        this.startX = x;
        this.startY = y;
        this.x = this.startX;
        this.y = this.startY;
        this.direction = "right";
        this.width = 32;
        this.height = 32;
        this.speed = 100;
        this.health = 500;
        this.startHealth = 500;
        this.strength = 10;
        this.lastDamage = null;
        this.isAlive = true;
        this.immovable = false;
        this.invincible = false;
        this.sprite = new Sprite("img/models/playersprites.png", [0, 0], [32, 32], 4, [0, 1]);
    }
    Player.prototype.update = function (dt) {
        if (!this.immovable) {
            if (Game.controls.left) {
                if (!isColliding(this.x - parseInt(this.speed * dt), this.y, this.width, this.height)) {
                    this.direction = "left";
                    this.x -= parseInt(this.speed * dt);
                }
            }

            if (Game.controls.right) {
                if (!isColliding(this.x + parseInt(this.speed * dt), this.y, this.width, this.height)) {
                    this.direction = "right";
                    this.x += parseInt(this.speed * dt);
                }

            }

            if (Game.controls.up) {
                if (!isColliding(this.x, this.y - parseInt(this.speed * dt), this.width, this.height)) {
                    this.direction = "up";
                    this.y -= parseInt(this.speed * dt);
                }
            }
            if (Game.controls.down) {
                if (!isColliding(this.x, this.y + parseInt(this.speed * dt), this.width, this.height)) {
                    this.direction = "down";
                    this.y += parseInt(this.speed * dt);
                }
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
                    if (!isColliding(this.x + 1, this.y, this.width, this.height)) {
                        this.x += 1;
                    }
                }
                break;
            case "right":
                if (timeSince < damageInterval) {
                    if (!isColliding(this.x - 1, this.y, this.width, this.height)) {
                        this.x -= 1;
                    }
                }
                break;
            case "up":
                if (timeSince < damageInterval) {
                    if (!isColliding(this.x, this.y + 1, this.width, this.height)) {
                        this.y += 1;
                    }
                }
                break;
            case "down":
                if (timeSince < damageInterval) {
                    if (!isColliding(this.x, this.y - 1, this.width, this.height)) {
                        this.y -= 1;
                    }
                }
                break;
        }
        if (timeSince > 1.3) {
            this.immovable = false;
            this.invincible = false;
        }
    }
    Player.prototype.reset = function () {
        document.getElementById("shadowbackground").className = "hidden";
        this.isAlive = true;
        this.health = this.startHealth;
        this.x = this.startX;
        this.y = this.startY;
    }
    Game.Player = Player;
})();

//Map
(function () {
    function Map() {
        this.width = 0;
        this.height = 0;
        this.layers = 0;
        this.img = null;
        this.topLayerImg = null;
        this.mapInfo = {};
        this.mapData = {};
        this.jsonObj;
        this.isRendered = false;
        this.isCreated = false;
        this.monsterSpawns = null;
        this.itemMap = null;
    }
    Map.prototype.createMap = function (json) {
        this.isCreated = true;
        this.width = 1250;
        this.jsonObj = json;
        this.mapInfo.mapDimensions = [this.jsonObj.width * 32, this.jsonObj.height * 32];
        this.mapInfo.tileDimensions = [this.jsonObj.tilewidth, this.jsonObj.tileheight];
        this.mapData.sprite = new Image();
        this.mapData.sprite.src = "img/sprites.png";
        this.mapData.tilecount = [this.jsonObj.layers[0].width, this.jsonObj.layers[0].height];
        this.mapData.tilesize = [this.jsonObj.tilesets[0].tilewidth, this.jsonObj.tilesets[0].tileheight];
        this.mapData.tileSets = this.jsonObj.tilesets;

        var layerCount = 0;

        for (var i = 0; i < this.jsonObj.layers.length; i++) {
            if (this.jsonObj.layers[i].type === "tilelayer") {
                if (this.jsonObj.layers[i].name === "Monsterspawns") {
                    this.monsterSpawns = this.jsonObj.layers[i];
                }
                else if (this.jsonObj.layers[i].name === "Items") {
                    this.itemMap = this.jsonObj.layers[i];
                } else {
                    layerCount++;
                }
            }
            if (this.jsonObj.layers[i].type === "objectgroup") {
                if (this.jsonObj.layers[i].name === "Collision") {
                    collisionMap = this.jsonObj.layers[i].objects;
                }
            }
        }

        this.mapData.layers = new Array(layerCount);
        this.mapData.layerName = new Array(layerCount);

        for (var i = 0, count = 0; i < this.jsonObj.layers.length; i++) {
            if (this.jsonObj.layers[i].type === "tilelayer") {
                if (this.jsonObj.layers[i].name != "Items" && this.jsonObj.layers[i].name != "Monsterspawns") {
                    this.mapData.layers[count] = this.jsonObj.layers[i].data;
                    this.mapData.layerName[count] = this.jsonObj.layers[i].name;
                    count++;
                }
            } else if (this.jsonObj.layers[i].type === "objectgroup") {
                this.mapData.collisionMap = this.jsonObj.layers[i].objects;
            }
        }
    }

    Map.prototype.renderMap = function () {
        this.rendered = true;
        var ctx = document.createElement("canvas").getContext("2d");
        var ctxTop = document.createElement("canvas").getContext("2d");
        var tileSize = this.mapData.tilesize;
        var mapSize = this.mapData.tilecount;
        var layers = this.mapData.layers.length;
        var tilesetGidWidth = this.mapData.tileSets[0].imagewidth / 32;
        ctx.canvas.width = mapSize[0] * 32;
        ctx.canvas.height = mapSize[1] * 32;

        ctxTop.canvas.width = ctx.canvas.width;
        ctxTop.canvas.height = ctx.canvas.height;

        for (var i = 0; i < this.mapData.layers.length; i++) {
            var count = 0;
            var currGid;
            var currLayer = this.mapData.layers[i];
            for (var y = 0; y <= mapSize[1]; y++) {
                for (var x = 0; x < mapSize[0]; x++) {
                    currGid = this.mapData.layers[i][count];
                    if (currGid > 0) {
                        ctx.drawImage(this.mapData.sprite, ((currGid - 1) % tilesetGidWidth) * 32, (parseInt(currGid / tilesetGidWidth)) * 32, tileSize[0], tileSize[1], x * 32, y * 32, 32, 32);
                        if (this.mapData.layerName[i] === "Top") {
                            ctxTop.drawImage(this.mapData.sprite, ((currGid - 1) % tilesetGidWidth) * 32, (parseInt(currGid / tilesetGidWidth)) * 32, tileSize[0], tileSize[1], x * 32, y * 32, 32, 32);
                        };
                    }
                    count++;
                }
            }
        }
        this.img = new Image();
        this.img.src = ctx.canvas.toDataURL();
        this.topLayerImg = new Image();
        this.topLayerImg.src = ctxTop.canvas.toDataURL();
    }
    Game.Map = Map;
})();

//JSONloader
(function () {
    function jsonLoader(url) {
        this.obj = null;
        this.url = url;
    }

    jsonLoader.prototype.loadMap = function () {
        var xhr = new XMLHttpRequest();
        that = this;

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
                    that.obj = JSON.parse(xhr.responseText);
                }
                else {
                    console.log("Läsfel, status: " + xhr.status);
                }
            }
        }
        xhr.open("GET", this.url + '?ts=' + (Math.random() * 10000000, 10), false);
        xhr.send(null);
    }
    Game.jsonLoader = jsonLoader;
})();

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
        ctx.drawImage(this.sprite,
                              this.gX, this.gY,
                              this.size[0], this.size[1],
                              0, 0,
                              this.size[0], this.size[1]);
    }
    Game.Item = Item;
})();

//Mainloop
(function () {
    var player = new Game.Player("Axel", 640, 640);
    var jsonLoader = new Game.jsonLoader("img/map/map.json");
    var spriteSource = new Image();
    spriteSource.src = "img/sprites.png";
    var theMap = new Game.Map();
    var mapImg = new Image();
    var mapInfo = {};
    var viewX = 26;
    var viewY = 16;
    var gameMap;
    var collisionMap;
    var lastTime;
    var playerMelee = [];
    var difficulty = 1;
    var monsters = [];
    var items = [];
    var maxMonsters = 1;
    var mapCoords = [];

    Game.init = function () {
        document.getElementById("newgame").addEventListener('click', function () { player.reset(); game(); }, false);
        canvas.addEventListener("mousedown", function (e) { mouseDown(e, player, viewX, viewY) }, false);
        canvas.addEventListener("mouseup", function (e) { mouseUp(e, player, viewX, viewY) }, false);
        jsonLoader.loadMap();

        theMap.createMap(jsonLoader.obj);
        theMap.renderMap();

        initCanvas();

        var count = 0;
        for (var y = 0; y < theMap.mapData.tilecount[1]; y++) {
            for (var x = 0; x < theMap.mapData.tilecount[0]; x++) {
                if (theMap.monsterSpawns.data[count] != 0) {
                    if (theMap.monsterSpawns.data[count] === 44) {
                        monsters.push(new Game.Monster(x * 32, y * 32));
                    }
                }
                mapCoords[count] = [x * 32, y * 32];
                count++;
            }
        }
        var tilesetGidWidth = theMap.mapData.tileSets[0].imagewidth / 32;

        var count = 0;
        for (var y = 0; y < theMap.mapData.tilecount[1]; y++) {
            for (var x = 0; x < theMap.mapData.tilecount[0]; x++) {
                if (theMap.itemMap.data[count] != 0) {
                    var currGid = theMap.itemMap.data[count];
                    var gx = (((currGid - 1) % tilesetGidWidth) * 32);
                    var gy = ((parseInt(currGid / tilesetGidWidth)) * 32);
                    items.push(new Game.Item(x * 32, y * 32, gx, gy, "osten" + count, "yeez", [10, 20]));
                }
                count++;
            }
        }

        lastTime = Date.now();
        game();
    }

    function initCanvas() {
        ctx.canvas.width = viewX * 32;
        ctx.canvas.height = viewY * 32;
    }

    function game() {
        var now = Date.now();
        var dt = (now - lastTime) / 1000.0;
        document.getElementById("debugtext").innerHTML = "px: " + player.x + ". py: " + player.y + ". inpt: " + Game.controls.left + Game.controls.right + Game.controls.up + Game.controls.down +
            ". dir: " + player.direction;

        update(dt);
        render();

        checkCollisions(monsters, player);
        lastTime = now;

        if (player.isAlive) {
            requestAnimFrame(game);
        } else if (!player.isAlive) {
            playerDeath();
        }
    }

    function update(dt) {
        player.isAlive = player.health > 0 ? true : false;

        if ((Date.now() - player.lastDamage) / 1000 < 3) {
            player.takeDamage();
        }
        player.update(dt);
        player.sprite.update(dt);
        if (monsters.length > 0) {
            for (var i = 0; i < monsters.length; i++) {
                monsters[i].update(dt);
                monsters[i].sprite.update(dt);
            }
        }
        var itemMatched = false;
        if (Game.mousePosition.leftClick && Game.mousePosition.rightClick) {
            var TILENAME = {
                176: "Tree",
                350: "Lamp post",
                889: "Clock",
                1299: "Well",
                0: "Grass",

            }
            var clickPos = [Game.mousePosition.xClick, Game.mousePosition.yClick];
            var bgLayer = theMap.mapData.layers[0];
            var fgLayer = theMap.mapData.layers[1];
            var topLayer = theMap.mapData.layers[2];
            Game.mousePosition.leftClick = false;
            Game.mousePosition.rightClick = false;

            if (!itemMatched) {//toplayer
                for (var i = 0; i < topLayer.length; i++) {
                    if (topLayer[i] > 0) {
                        if (boxCollides(clickPos[0], clickPos[1], 1, 1, mapCoords[i][0], mapCoords[i][1], 32, 32)) {
                            console.log("You see " + TILENAME[topLayer[i]] + ". position: " + mapCoords[i]);
                            console.log("Gid: " + topLayer[i]);
                            itemMatched = true;
                        }
                    }
                }
            }
            if (!itemMatched) {//itemlayer
                for (var i = 0; i < items.length; i++) {
                    if (boxCollides(clickPos[0], clickPos[1], 1, 1, items[i].x, items[i].y, 32, 32)) {
                        console.log("You see " + items[i].name + ". Attack: " + items[i].minMax[0] + "-" + items[i].minMax[1]);
                        itemMatched = true;
                    }
                }
            }
            if (!itemMatched) {//fglayer
                for (var i = 0; i < fgLayer.length; i++) {
                    if (fgLayer[i] > 0) {
                        if (boxCollides(clickPos[0], clickPos[1], 1, 1, mapCoords[i][0], mapCoords[i][1], 32, 32)) {
                            console.log("You see " + TILENAME[fgLayer[i]] + ". position: " + mapCoords[i]);
                            console.log("Gid: " + fgLayer[i]);
                            itemMatched = true;
                        }
                    }
                }
            }
            if (!itemMatched) {//bglayer
                for (var i = 0; i < bgLayer.length; i++) {
                    if (bgLayer[i] > 0) {
                        if (boxCollides(clickPos[0], clickPos[1], 1, 1, mapCoords[i][0], mapCoords[i][1], 32, 32)) {
                            console.log("You see " + TILENAME[bgLayer[i]] + ". position: " + mapCoords[i]);
                            console.log("Gid: " + bgLayer[i]);
                            itemMatched = true;
                        }
                    }
                }
            }
        }
    }

    function render() {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.drawImage(theMap.img, player.x + 16 - (canvas.width / 2), player.y + 16 - (canvas.height / 2), theMap.img.width, theMap.img.height, 0, 0, theMap.img.width, theMap.img.height);

        for (var i in monsters) {
            var currMonster = monsters[i];
            if (isInsideCanvas(currMonster, player, viewX, viewY)) {
                if (!isColliding(currMonster.x, currMonster.y, currMonster.width, currMonster.height)) {
                    ctx.save();
                    ctx.translate(currMonster.x - ((player.x - ((viewX * 32 / 2))) + 16), currMonster.y - ((player.y - ((viewY * 32 / 2))) + 16));
                    currMonster.sprite.render(ctx, currMonster.direction, Game.controls, false);
                    ctx.restore();
                } else {
                    monsters.splice(i, 1);
                }
            }
        }

        for (var i = 0; i < items.length; i++) {
            var currItem = items[i];
            if (isInsideCanvas(currItem, player, viewX, viewY)) {
                ctx.save();
                ctx.translate(currItem.x - ((player.x - ((viewX * 32 / 2))) + 16), currItem.y - ((player.y - ((viewY * 32 / 2))) + 16));
                currItem.draw();
                ctx.restore();
            }
        }

        if (player.isAlive) {
            ctx.save();
            ctx.translate((canvas.width / 2) - 16, (canvas.height / 2) - 16);
            player.sprite.render(ctx, player.direction, Game.controls, true, player.lastDamage);
            ctx.fillStyle = 'white';
            ctx.font = 'bold 10pt Verdana';
            ctx.fillText(player.name, 0, 0);
            ctx.restore();
        }

        //draw the top-layer, which has to be rendered after all entities to appear above
        ctx.drawImage(theMap.topLayerImg, player.x + 16 - (canvas.width / 2), player.y + 16 - (canvas.height / 2), theMap.img.width, theMap.img.height, 0, 0, theMap.img.width, theMap.img.height);
    }
})();



function isInsideCanvas(monster, player, viewX, viewY) {
    var leftSideX = (player.x - ((viewX * 32 / 2))) + 16;
    var RightSideX = (player.x + ((viewX * 32 / 2))) + 16;
    var TopSideY = (player.y - ((viewY * 32 / 2))) + 16;
    var BottomSideY = (player.y + ((viewY * 32 / 2))) + 16;
    return ((monster.x + 31) > leftSideX && monster.x < RightSideX && (monster.y + 31) > TopSideY && monster.y < BottomSideY);
}


function checkCollisions(monsters, player) {
    if (monsters.length > 0) {
        for (var i in monsters) {
            var currMonster = monsters[i];
            if (!player.invincible) {
                if (boxCollides(player.x, player.y, player.width, player.height, currMonster.x, currMonster.y, currMonster.width, currMonster.height)) {
                    player.health -= parseInt((Math.random() * 25) + 1);
                    player.lastDamage = Date.now();
                    console.log(player.health);
                    console.log(player.isAlive);
                }
            }
            if (Game.controls.hit) {
                switch (player.direction) {
                    case "left":
                        if (boxCollides(player.x - 32, player.y, player.width, player.height, currMonster.x, currMonster.y, currMonster.width, currMonster.height)) {
                            monsters.splice(i, 1);
                        }
                        break;
                    case "right":
                        if (boxCollides(player.x + 32, player.y, player.width, player.height, currMonster.x, currMonster.y, currMonster.width, currMonster.height)) {
                            monsters.splice(i, 1);
                        }
                        break;
                    case "up":
                        if (boxCollides(player.x, player.y - 32, player.width, player.height, currMonster.x, currMonster.y, currMonster.width, currMonster.height)) {
                            monsters.splice(i, 1);
                        }
                        break;
                    case "down":
                        if (boxCollides(player.x, player.y + 32, player.width, player.height, currMonster.x, currMonster.y, currMonster.width, currMonster.height)) {
                            monsters.splice(i, 1);
                        }
                        break;
                }
            }
        }
    }
}
function collides(x, y, r, b, x2, y2, r2, b2) {
    return !(r <= x2 || x > r2 ||
             b <= y2 || y > b2);
}

function boxCollides(x1, y1, w1, h1, x2, y2, w2, h2) {
    return collides(x1, y1,
                    x1 + w1, y1 + h1,
                    x2, y2,
                    x2 + w2, y2 + h2);
}

function playerDeath() {
    document.getElementById("shadowbackground").className = "show";
    document.getElementById("dead").className = "show";
}

function isColliding(x, y, w, h) {
    for (var i = 0; i < collisionMap.length; i++) {
        var currObj = collisionMap[i];
        if (boxCollides(x, y, w, h, currObj.x, currObj.y, currObj.width, currObj.height)) {
            return true;
        }
    }
}

window.addEventListener("keydown", function (e) {
    switch (e.keyCode) {
        case 65:
        case 37:
            Game.controls.left = true;
            e.preventDefault();
            break;
        case 87:
        case 38:
            Game.controls.up = true;
            e.preventDefault();
            break;
        case 68:
        case 39:
            Game.controls.right = true;
            e.preventDefault();
            break;
        case 83:
        case 40:
            Game.controls.down = true;
            e.preventDefault();
            break;
        case 17:
        case 32:
            Game.controls.hit = true;
            e.preventDefault();
            break;
    }
}, false);
window.addEventListener("keyup", function (e) {
    switch (e.keyCode) {
        case 65:
        case 37:
            Game.controls.left = false;
            break;
        case 87:
        case 38:
            Game.controls.up = false;
            break;
        case 68:
        case 39:
            Game.controls.right = false;
            break;
        case 83:
        case 40:
            Game.controls.down = false;
            break;
        case 17:
        case 32:
            Game.controls.hit = false;
            break;
    }
}, false);

function mouseDown(e, player, viewX, viewY) {
    if (e.button === 1) {//middle mouse button
        event.preventDefault();
    } else {
        var leftSideX = (player.x - ((viewX * 32 / 2))) + 16;
        var RightSideX = (player.x + ((viewX * 32 / 2))) + 16;
        var TopSideY = (player.y - ((viewY * 32 / 2))) + 16;
        var BottomSideY = (player.y + ((viewY * 32 / 2))) + 16;
        var x = e.x;
        var y = e.y;

        Game.mousePosition.xClick = (x - canvas.offsetLeft) + leftSideX;
        Game.mousePosition.yClick = (y - canvas.offsetTop) + TopSideY;

        if (e.button === 0) {
            Game.mousePosition.leftClick = true;
        }
        if (e.button === 2) {
            Game.mousePosition.rightClick = true;
        }
        //console.log("mousex: " + Game.mousePosition.x + ". mouseY: " + Game.mousePosition.y + ".  mouseclick=" + Game.mousePosition.leftClick);      
    }
}

//if y or x value incorrect, canvas is not in the correct size(zoomed in or out)
function mouseUp(e, player, viewX, viewY) {
    if (e.button === 1) {//middle mouse button
        event.preventDefault();
    } else {
        var leftSideX = (player.x - ((viewX * 32 / 2))) + 16;
        var RightSideX = (player.x + ((viewX * 32 / 2))) + 16;
        var TopSideY = (player.y - ((viewY * 32 / 2))) + 16;
        var BottomSideY = (player.y + ((viewY * 32 / 2))) + 16;
        var x = e.x;
        var y = e.y;

        Game.mousePosition.xRelease = (x - canvas.offsetLeft) + leftSideX;
        Game.mousePosition.yRelease = (y - canvas.offsetTop) + TopSideY;

        if (e.button === 0) {
            Game.mousePosition.leftClick = false;
        }
        if (e.button === 2) {
            Game.mousePosition.rightClick = false;
        }
    }
}


resources.load([
    'img/sprites.png',
    'img/models/playersprites.png',
    'img/models/monstersprites.png'
]);
resources.onReady(Game.init);

window.oncontextmenu = function (event) {
    event.preventDefault();
    event.stopPropagation();
    return false;
};