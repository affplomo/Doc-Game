window.Game = {};

window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };
})();
    
Game.ctx = document.getElementById("myCanvas").getContext("2d");  

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

Game.dimensions = [64, 64];

Game.Inspecting = {};
Game.Inspecting.timer = 0;
Game.Inspecting.showText = null;

Game.tileName = {
    176: "a tree",
    350: "a lamp post",
    889: "a clock",
    1299: "a well",
    605: "grass"
};


//Monster
(function () {
    function Monster(x, y) {
        this.x = x;
        this.y = y;
        this.speed = 50;
        this.width = Game.dimensions[0];
        this.height = Game.dimensions[1];
        this.direction = "left";
        this.sprite = new Game.Sprite("img/models/monstersprites.png", [0, 0], [Game.dimensions[0], Game.dimensions[1]], 2, [0, 1]);
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
        this.width = Game.dimensions[0];
        this.height = Game.dimensions[1];
        this.speed = 100;
        this.health = 500;
        this.startHealth = 500;
        this.strength = 10;
        this.lastDamage = null;
        this.isAlive = true;
        this.immovable = false;
        this.invincible = false;        
        this.sprite = new Game.Sprite("img/models/playersprites.png", [0, 256], [Game.dimensions[0], Game.dimensions[1]], 4, [0, 1]);
        this.inventory = [];
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
        this.mapData.sprite.src = "img/sprites64.png";
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
        var tilesetGidWidth = this.mapData.tileSets[0].imagewidth / Game.dimensions[0];
        ctx.canvas.width = mapSize[0] * Game.dimensions[0];
        ctx.canvas.height = mapSize[1] * Game.dimensions[1];

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
                        ctx.drawImage(this.mapData.sprite, ((currGid - 1) % tilesetGidWidth) * Game.dimensions[0], (parseInt(currGid / tilesetGidWidth)) * Game.dimensions[0], tileSize[0], tileSize[1], x * Game.dimensions[0], y * Game.dimensions[0], Game.dimensions[0], Game.dimensions[0]);
                        if (this.mapData.layerName[i] === "Top") {
                            ctxTop.drawImage(this.mapData.sprite, ((currGid - 1) % tilesetGidWidth) * Game.dimensions[0], (parseInt(currGid / tilesetGidWidth)) * Game.dimensions[0], tileSize[0], tileSize[1], x * Game.dimensions[0], y * Game.dimensions[0], Game.dimensions[0], Game.dimensions[0]);
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

//Sprite
(function () {
    function Sprite(url, pos, size, speed, frames, dir, once) {
        this.pos = pos;
        this.size = size;
        this.speed = typeof speed === 'number' ? speed : 0;
        this.frames = frames;
        this._index = 0;
        this.url = url;
        this.dir = dir;
        this.once = once;
    };

    Sprite.prototype = {
        update: function (dt) {
            this._index += this.speed * dt;
        },

        render: function (ctx, dir, input, isPlayer, lastDamage) {
            var now = Date.now();
            var timeSince = (now - lastDamage) / 1000;
            var takingDamage = false;
            var damageTime = 2;

            if (timeSince < damageTime) {
                takingDamage = true;
            }
            else {
                takingDamage = false;
            }
            var frame;
            var idle = false;
            var isFighting = true;

            if (isPlayer) {
                if (input[Object.keys(input)[0]] || input[Object.keys(input)[1]] || input[Object.keys(input)[2]] || input[Object.keys(input)[3]]) {
                    idle = false;
                } else {
                    idle = true;
                }

                if (input[Object.keys(input)[4]]) {
                    isFighting = true;
                } else {
                    isFighting = false;
                }
            }
            if (this.speed > 0 && (!idle) || isFighting) {
                var max = this.frames.length;
                var idx = Math.floor(this._index);
                frame = this.frames[idx % max];

                if (this.once && idx >= max) {
                    this.done = true;
                    return;
                }
            }
            else {

                frame = 0;
            }

            var x = this.pos[0];
            var y = this.pos[1];

            if (isPlayer) {
                if (isFighting) {
                    y += Game.dimensions[0];
                }
            }
            if (isPlayer) {
                switch (dir) {
                    case "left":
                        x += frame * this.size[0] + (Game.dimensions[0] * 10);
                        break;
                    case "right":
                        x += frame * this.size[0] + (Game.dimensions[0] * 3);
                        break;
                    case "up":
                        x += frame * this.size[0] + (Game.dimensions[0] * 0);
                        break;
                    case "down":
                        x += frame * this.size[0] + (Game.dimensions[0] * 7);
                        break;
                }
            } else {
                switch (dir) {
                    case "left":
                        x += frame * this.size[0];
                        break;
                    case "right":
                        x += frame * this.size[0] + 64;
                        break;
                    case "up":
                        x += frame * this.size[0] + 128;
                        break;
                    case "down":
                        x += frame * this.size[0] + 194;
                        break;
                }
            }
            if (takingDamage) {
                if (timeSince < 0.3) { }
                else if (timeSince > 0.3 && timeSince < 0.6) {
                    ctx.drawImage(Game.resources.get(this.url),
                              x, y,
                              this.size[0], this.size[1],
                              0, 0,
                              this.size[0], this.size[1]);
                } else if (timeSince > 0.6 && timeSince < 0.9) { }
                else if (timeSince > 0.9 && timeSince < 1.2) {
                    ctx.drawImage(Game.resources.get(this.url),
                             x, y,
                             this.size[0], this.size[1],
                             0, 0,
                             this.size[0], this.size[1]);
                } else if (timeSince > 1.2 && timeSince < 1.5) { }
                else if (timeSince > 1.5 && timeSince < 1.8) {
                    ctx.drawImage(Game.resources.get(this.url),
                             x, y,
                             this.size[0], this.size[1],
                             0, 0,
                             this.size[0], this.size[1]);
                }
            } else {
                ctx.drawImage(Game.resources.get(this.url),
                              x, y,
                              this.size[0], this.size[1],
                              0, 0,
                              this.size[0], this.size[1]);
            }
        }
    };

    Game.Sprite = Sprite;
})();

//Resources
(function () {
    var resourceCache = {};
    var loading = [];
    var readyCallbacks = [];

    function load(urlOrArr) {
        if (urlOrArr instanceof Array) {
            urlOrArr.forEach(function (url) {
                _load(url);
            });
        }
        else {
            _load(urlOrArr);
        }
    }

    function _load(url) {
        if (resourceCache[url]) {
            return resourceCache[url];
        }
        else {
            var img = new Image();
            img.onload = function () {
                resourceCache[url] = img;

                if (isReady()) {
                    readyCallbacks.forEach(function (func) { func(); });
                }
            };
            resourceCache[url] = false;
            img.src = url;
        }
    }

    function get(url) {
        return resourceCache[url];
    }

    function isReady() {
        var ready = true;
        for (var k in resourceCache) {
            if (resourceCache.hasOwnProperty(k) &&
               !resourceCache[k]) {
                ready = false;
            }
        }
        return ready;
    }

    function onReady(func) {
        readyCallbacks.push(func);
    }

    Game.resources = {
        load: load,
        get: get,
        onReady: onReady,
        isReady: isReady
    };
})();

//Item
(function () {
    function Item(x,y, gX, gY, name, desc, minMax) {
        this.sprite = new Image;
        this.sprite.src = "img/sprites64.png";
        this.x = x;
        this.y = y;
        this.gX = gX;
        this.gY = gY;        
        this.name = name;
        this.description = desc;
        this.minMax = minMax;
        this.size = [Game.dimensions[0], Game.dimensions[1]];
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

//Mainloop
(function () {
    var player = new Game.Player("Axel", 640, 640);
    var jsonLoader = new Game.jsonLoader("img/map/map.json");
    var theMap = new Game.Map();
    var viewX = 26;
    var viewY = 16;
    var collisionMap;
    var lastTime;
    var monsters = [];
    var items = [];
    var mapCoords = [];

    Game.init = function () {
        var count;
        document.getElementById("newgame").addEventListener('click', function () { player.reset(); game(); }, false);
        Game.ctx.canvas.addEventListener("mousedown", function (e) { mouseDown(e, player, viewX, viewY) }, false);
        Game.ctx.canvas.addEventListener("mouseup", function (e) { mouseUp(e, player, viewX, viewY) }, false);
        jsonLoader.loadMap();
        
        theMap.createMap(jsonLoader.obj);
        theMap.renderMap();

        initCanvas();
        
        count = 0;
        for (var y = 0; y < theMap.mapData.tilecount[1]; y++) {
            for (var x = 0; x < theMap.mapData.tilecount[0]; x++) {
                if (theMap.monsterSpawns.data[count] != 0) {
                    if (theMap.monsterSpawns.data[count] === 44) {
                        monsters.push(new Game.Monster(x * Game.dimensions[0], y * Game.dimensions[1]));
                    }                 
                }
                mapCoords[count] = [x * Game.dimensions[0], y * Game.dimensions[1]];
                count++;
            }
        }
        var tilesetGidWidth = theMap.mapData.tileSets[0].imagewidth / Game.dimensions[0];
       
        count = 0;
        for (var y = 0; y < theMap.mapData.tilecount[1]; y++) {
            for (var x = 0; x < theMap.mapData.tilecount[0]; x++) {
                if (theMap.itemMap.data[count] != 0) {
                    var currGid = theMap.itemMap.data[count];
                    var gx = (((currGid - 1) % tilesetGidWidth) * Game.dimensions[0]);
                    var gy = ((parseInt(currGid / tilesetGidWidth)) * Game.dimensions[0]);
                    items.push(new Game.Item(x * Game.dimensions[0], y * Game.dimensions[1], gx, gy, "osten" + count, "yeez", [10, 20]));
                }
                count++;
            }
        }
                        
        lastTime = Date.now();
        game();
    }

    function initCanvas() {        
        Game.ctx.canvas.width = viewX * Game.dimensions[0];
        Game.ctx.canvas.height = viewY * Game.dimensions[1];
    }

    function game() {
        var now = Date.now();
        var dt = (now - lastTime) / 1000.0;
        document.getElementById("debugtext").innerHTML = "px: " + player.x + ". py: " + player.y + ".";

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
        var clickPos = [Game.mousePosition.xClick, Game.mousePosition.yClick];
        var bgLayer = theMap.mapData.layers[0];
        var fgLayer = theMap.mapData.layers[1];
        var topLayer = theMap.mapData.layers[2];
        var itemMatched = false;

        player.isAlive = player.health > 0 ? true : false;

        if ((Date.now() - player.lastDamage) / 1000 < 3) {
            player.takeDamage();
        }

        player.update(dt);
        player.sprite.update(dt);

        if (monsters.length>0) {
            for (var i = 0; i < monsters.length; i++) {
                monsters[i].update(dt);
                monsters[i].sprite.update(dt);
            }
        }       
        if (Game.mousePosition.leftClick && Game.mousePosition.rightClick) {
            Game.mousePosition.leftClick = false;
            Game.mousePosition.rightClick = false;
                                  
            if (!itemMatched) {//toplayer                 
                itemMatched = playerLooking(clickPos, mapCoords, topLayer);
            }
            if (!itemMatched) {//itemlayer              
               itemMatched = playerLooking(clickPos, mapCoords, items, true);
            }
            
            if (!itemMatched) {//fglayer
                itemMatched = playerLooking(clickPos, mapCoords, fgLayer);
            }
           if (!itemMatched) {//bglayer
               itemMatched = playerLooking(clickPos, mapCoords, bgLayer);
           }           
        } else if (!Game.mousePosition.leftClick && Game.mousePosition.rightClick) {
            Game.mousePosition.rightClick = false;
            if (itemMatched = playerLooking(clickPos, mapCoords, items, true, true)) {                
                for (var i = 0; i < items.length; i++) {
                    if (boxCollides(clickPos[0], clickPos[1], 1, 1, items[i].x, items[i].y, Game.dimensions[0], Game.dimensions[1])) {
                        console.log(items[i].x, items[i].y, player.x, player.y);
                        if ((player.x > (items[i].x - Game.dimensions[0]) && player.x < (items[i].x + Game.dimensions[0])) && (player.y > (items[i].y - Game.dimensions[1]) && player.y < (items[i].y + Game.dimensions[1]))) {
                            Game.Inspecting.showText = "You picked up " + items[i].name + ". Attack: " + items[i].minMax[0] + "-" + items[i].minMax[1];
                            player.inventory[player.inventory.length] = items[i];
                            items.splice(i, 1);
                            console.log("New item in inventory: " + player.inventory[player.inventory.length - 1].name);                            
                        }
                    }
                }

            }

        }
    }

    function render() {
        Game.ctx.clearRect(0, 0, Game.ctx.canvas.width, Game.ctx.canvas.height);

        Game.ctx.drawImage(theMap.img, player.x + (Game.dimensions[0] / 2) - (Game.ctx.canvas.width / 2), player.y + (Game.dimensions[1] / 2) - (Game.ctx.canvas.height / 2), theMap.img.width, theMap.img.height, 0, 0, theMap.img.width, theMap.img.height);

        for (var i in monsters) {
            var currMonster = monsters[i];
            if (isInsideCanvas(currMonster, player, viewX, viewY)) {
                if (!isColliding(currMonster.x, currMonster.y, currMonster.width, currMonster.height)) {
                    Game.ctx.save();
                    Game.ctx.translate(currMonster.x - ((player.x - ((viewX * Game.dimensions[0] / 2))) + (Game.dimensions[0] / 2)), currMonster.y - ((player.y - ((viewY * Game.dimensions[1] / 2))) + (Game.dimensions[1] / 2)));
                    currMonster.sprite.render(Game.ctx, currMonster.direction, Game.controls, false);
                    Game.ctx.restore();
                } else {
                    monsters.splice(i, 1);
                }
            }
        }

        for (var i = 0; i < items.length; i++) {
            var currItem = items[i];
            if (isInsideCanvas(currItem, player, viewX, viewY)) {
                Game.ctx.save();
                Game.ctx.translate(currItem.x - ((player.x - ((viewX * Game.dimensions[0] / 2))) + (Game.dimensions[0] / 2)), currItem.y - ((player.y - ((viewY * Game.dimensions[1] / 2))) + (Game.dimensions[1] / 2)));
                currItem.draw();
                Game.ctx.restore();
            }
        }

        if (player.isAlive) {            
            Game.ctx.save(); 
            Game.ctx.translate((Game.ctx.canvas.width / 2) - (Game.dimensions[0] / 2), (Game.ctx.canvas.height / 2) - (Game.dimensions[1] / 2));
            player.sprite.render(Game.ctx, player.direction, Game.controls, true, player.lastDamage);
            Game.ctx.textAlign = 'center';
            Game.ctx.fillStyle = 'white';
            Game.ctx.lineWidth = 0.2;
            Game.ctx.strokeStyle = 'black';
            Game.ctx.font = 'bold 10pt Verdana';
            Game.ctx.fillText(player.name, 16, 0);
            Game.ctx.strokeText(player.name, 16, 0);
            Game.ctx.restore();
        }

        //draw the top-layer, which has to be rendered after all entities to appear above
        Game.ctx.drawImage(theMap.topLayerImg, player.x + (Game.dimensions[0] / 2) - (Game.ctx.canvas.width / 2), player.y + (Game.dimensions[1] / 2) - (Game.ctx.canvas.height / 2), theMap.img.width, theMap.img.height, 0, 0, theMap.img.width, theMap.img.height);
        
        if (Game.Inspecting.timer > 0 && Game.Inspecting.showText !== null) {
            Game.ctx.textAlign = 'center';
            Game.ctx.fillStyle = 'green';
            Game.ctx.lineWidth = 0.3;
            Game.ctx.strokeStyle = 'black';
            Game.ctx.font = 'bold 10pt Verdana';
            Game.ctx.fillText(Game.Inspecting.showText, (Game.ctx.canvas.width / 2), (Game.ctx.canvas.height / 2) - 30);
            Game.ctx.strokeText(Game.Inspecting.showText, (Game.ctx.canvas.width / 2), (Game.ctx.canvas.height / 2) - 30);
        }
        if (Game.Inspecting.timer > 0) {
            Game.Inspecting.timer -= 0.01;
            if (Game.Inspecting.timer < 0) {
                Game.Inspecting.timer = 0;
            }
        }
    }
})();

function playerLooking(clickPos, mapCoords, layer, isItem, pickup) {
    if (!isItem) {
        for (var i = 0; i < layer.length; i++) {
            if (layer[i] > 0) {
                if (boxCollides(clickPos[0], clickPos[1], 1, 1, mapCoords[i][0], mapCoords[i][1], Game.dimensions[0], Game.dimensions[1])) {
                    Game.Inspecting.showText = "You see " + Game.tileName[layer[i]] + ". position: " + mapCoords[i];
                    Game.Inspecting.timer = 2;
                    return true;
                }
            }
        }
    } else {
        for (var i = 0; i < layer.length; i++) {
            if (boxCollides(clickPos[0], clickPos[1], 1, 1, layer[i].x, layer[i].y, Game.dimensions[0], Game.dimensions[1])) {
                Game.Inspecting.showText = "You see " + layer[i].name + ". Attack: " + layer[i].minMax[0] + "-" + layer[i].minMax[1];
                Game.Inspecting.timer = 2;
                return true;
            }
        }
    }
    return false;
}
function isInsideCanvas(monster, player, viewX, viewY) {
    var leftSideX = (player.x - ((viewX * Game.dimensions[0] / 2))) + (Game.dimensions[0] / 2);
    var RightSideX = (player.x + ((viewX * Game.dimensions[0] / 2))) + (Game.dimensions[0] / 2);
    var TopSideY = (player.y - ((viewY * Game.dimensions[1] / 2))) + (Game.dimensions[1] / 2);
    var BottomSideY = (player.y + ((viewY * Game.dimensions[1] / 2))) + (Game.dimensions[1] / 2);
    return ((monster.x + Game.dimensions[0]) > leftSideX && monster.x < RightSideX && (monster.y + Game.dimensions[1]) > TopSideY && monster.y < BottomSideY);
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
                        if (boxCollides(player.x - Game.dimensions[0], player.y, player.width, player.height, currMonster.x, currMonster.y, currMonster.width, currMonster.height)) {
                            monsters.splice(i, 1);                            
                        }
                        break;
                    case "right":
                        if (boxCollides(player.x + Game.dimensions[0], player.y, player.width, player.height, currMonster.x, currMonster.y, currMonster.width, currMonster.height)) {
                            monsters.splice(i, 1);
                        }
                        break;
                    case "up":
                        if (boxCollides(player.x, player.y - Game.dimensions[1], player.width, player.height, currMonster.x, currMonster.y, currMonster.width, currMonster.height)) {
                            monsters.splice(i, 1);
                        }
                        break;
                    case "down":
                        if (boxCollides(player.x, player.y + Game.dimensions[1], player.width, player.height, currMonster.x, currMonster.y, currMonster.width, currMonster.height)) {
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
function isColliding(x, y, w, h) {
    for (var i = 0; i < collisionMap.length; i++) {
        var currObj = collisionMap[i];
        if (boxCollides(x, y, w, h, currObj.x, currObj.y, currObj.width, currObj.height)) {
            return true;
        }
    }
}
function playerDeath() {
    document.getElementById("shadowbackground").className = "show";
    document.getElementById("dead").className = "show";
}
function mouseDown(e, player, viewX, viewY) {
    if (e.button === 1) {//middle mouse button
        event.preventDefault();
    } else {
        var leftSideX = (player.x - ((viewX * Game.dimensions[0] / 2))) + (Game.dimensions[0] / 2);
        var RightSideX = (player.x + ((viewX * Game.dimensions[0] / 2))) + (Game.dimensions[0] / 2);
        var TopSideY = (player.y - ((viewY * Game.dimensions[1] / 2))) + (Game.dimensions[1] / 2);
        var BottomSideY = (player.y + ((viewY * Game.dimensions[1] / 2))) + (Game.dimensions[1] / 2);
        var x = e.x;
        var y = e.y;

        Game.mousePosition.xClick = (x - Game.ctx.canvas.offsetLeft) + leftSideX;
        Game.mousePosition.yClick = (y - Game.ctx.canvas.offsetTop) + TopSideY;

        if (e.button === 0) {
            Game.mousePosition.leftClick = true;
        }
        if (e.button === 2) {
            Game.mousePosition.rightClick = true;
        }
        //console.log("mousex: " + Game.mousePosition.x + ". mouseY: " + Game.mousePosition.y + ".  mouseclick=" + Game.mousePosition.leftClick);      
    }       
}

//if y or x value incorrect, canvas is probably zoomed in or out
function mouseUp(e, player, viewX, viewY) {
    if (e.button === 1) {//middle mouse button
        event.preventDefault();
    } else {
        var leftSideX = (player.x - ((viewX * Game.dimensions[0] / 2))) + (Game.dimensions[0] / 2);
        var RightSideX = (player.x + ((viewX * Game.dimensions[0] / 2))) + (Game.dimensions[0] / 2);
        var TopSideY = (player.y - ((viewY * Game.dimensions[1] / 2))) + (Game.dimensions[1] / 2);
        var BottomSideY = (player.y + ((viewY * Game.dimensions[1] / 2))) + (Game.dimensions[1] / 2);
        var x = e.x;
        var y = e.y;

        Game.mousePosition.xRelease = (x - Game.ctx.canvas.offsetLeft) + leftSideX;
        Game.mousePosition.yRelease = (y - Game.ctx.canvas.offsetTop) + TopSideY;

        if (e.button === 0) {
            Game.mousePosition.leftClick = false;
        }
        if (e.button === 2) {
            Game.mousePosition.rightClick = false;
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

Game.resources.load([
    'img/sprites.png',
    'img/sprites64.png',
    'img/models/playersprites.png',
    'img/models/monstersprites.png',
    'img/lcpsprites.png'
]);
Game.resources.onReady(Game.init);

window.oncontextmenu = function (event) {
    event.preventDefault();
    event.stopPropagation();
    return false;
};