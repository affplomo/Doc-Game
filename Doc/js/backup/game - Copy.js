window.Game = {};

try{
    Game.socket = io.connect("http://localhost", { port: 8000, transports: ["websocket"] });
    //Game.socket = io.connect("http://85.226.121.72/", { port: 8000, transports: ["websocket"] });

    console.log("connection established.");
    
} catch (ex) {
    console.log("Could not connect to the server or the server is offline. Try again.");
}

window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };
})();
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
        this.currAction = "red";
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
        this.sprite = new Game.Sprite("img/models/playermodel.png", [0, 0], [32, 32], 4, [1, 2]);
        this.inventory = [];
        this.lookingDirection = 0;
        this.lastAttack = 0;
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

    Player.prototype.attack = function () {       
        if (this.lastAttack > 1) {           
            this.atkPos = this.aimPos;
            this.lastAttack = 0;
            if (Game.debug) {
                Game.ctx.save();
                Game.ctx.translate(this.atkPos[0] - ((this.x - ((Game.view[0] * Game.tileSize / 2))) + (Game.tileSize / 2)), this.atkPos[1] - ((this.y - ((Game.view[1] * Game.tileSize / 2))) + (Game.tileSize / 2)));
                
                Game.ctx.drawImage(Game.swingImg, 16, 16);
                Game.ctx.restore();                             
            }
            Game.socket.emit("attacked", { pos: this.atkPos, time: Date.now() });
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
//Map
(function () {
    function Map() {
        this.width = 0;
        this.height = 0;
        this.layers = 0;
        this.img = null;        
        this.topLayerImg = null;
        this.top2LayerImg = null;
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
        this.mapData.sprite.src = "sprites.png";
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
                collisionMap = this.jsonObj.layers[i].objects;
            }
        }
    }

    Map.prototype.renderMap = function () {
        this.rendered = true;
        var ctx = document.createElement("canvas").getContext("2d");
        var ctxTop = document.createElement("canvas").getContext("2d");
        var ctxTop2 = document.createElement("canvas").getContext("2d");
        var tileSize = this.mapData.tilesize;
        var mapSize = this.mapData.tilecount;
        var layers = this.mapData.layers.length;
        var tilesetGidWidth = this.mapData.tileSets[0].imagewidth / 32;
        ctx.canvas.width = mapSize[0] * 32;
        ctx.canvas.height = mapSize[1] * 32;

        ctxTop.canvas.width = ctx.canvas.width;
        ctxTop.canvas.height = ctx.canvas.height;

        ctxTop2.canvas.width = ctx.canvas.width;
        ctxTop2.canvas.height = ctx.canvas.height;
                
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
                        if (this.mapData.layerName[i] === "Top2") {
                            ctxTop2.drawImage(this.mapData.sprite, ((currGid - 1) % tilesetGidWidth) * 32, (parseInt(currGid / tilesetGidWidth)) * 32, tileSize[0], tileSize[1], x * 32, y * 32, 32, 32);
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
        this.top2LayerImg = new Image();
        this.top2LayerImg.src = ctxTop2.canvas.toDataURL();
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
        var that = this;

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
        this.idle = false;
    };

    Sprite.prototype = {
        update: function (dt, idle) {
            this._index += this.speed * dt;
            
                this.idle = idle;
            
        },

        render: function (ctx, dir, input, isPlayer, lastDamage) {
            var now = Date.now();
            var timeSince = (now - lastDamage) / 1000;
            var takingDamage = false;
            var damageTime = 2;
                       
            if (this.speed > 0 && !this.idle) {
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

            var x = this.pos[0]+ frame * this.size[0];
            var y = this.pos[1];

            ctx.drawImage(Game.resources.get(this.url),
                          x, y,
                          this.size[0], this.size[1],
                          0, 0,
                          this.size[0], this.size[1]);
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
//Right-click menu
(function () {
    function Menu() {
        this.lineWidth = 1;
        this.menuSize = [53, 44];
        this.menuPos = [];
        this.menuPosCurr = [];
        this.borderColor = "rgba(0,0,0,1)";
        this.menuColor = "rgba(255,255,255,0.2)";
        this.menuItemSize = 15;
        this.numMenuChoices = 3;
        this.menuChoices = [["Use", "Pick up", "Examine"], ["Equip", "Examine", "Drop"]];
        this.menuType = [];
        this.focused = false;
        this.itemHovered = {
            1: false,
            2: false,
            3: false
        }
        this.itemClicked = null;
        this.menuClicked = null;
    }
    Menu.prototype.renderMenu = function (menuHover) {
        ctx = document.getElementById("myCanvas").getContext("2d");

        ctx.save();
        ctx.fillStyle = this.borderColor;
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.shadowBlur = 5;
        ctx.fillRect(this.menuPos[0], this.menuPos[1], this.menuSize[0] + (this.lineWidth * 2), this.menuSize[1] + (this.lineWidth * 2));
        ctx.restore();

        ctx.fillStyle = this.menuColor;
        ctx.fillRect(this.menuPos[0] + this.lineWidth, this.menuPos[1] + this.lineWidth, this.menuSize[0], this.menuSize[1]);
        ctx.save();
        ctx.fillStyle = "white";
        ctx.lineWidth = 1;
        for (var i = 1; i < this.menuType.length; i++) {
            ctx.beginPath();
            ctx.moveTo(this.menuPos[0], this.menuPos[1] + (this.menuItemSize * i));
            ctx.lineTo((this.menuPos[0] + this.lineWidth) + this.menuSize[0], this.menuPos[1] + (this.menuItemSize * i));
            ctx.stroke();
        }
        ctx.restore();
        ctx.save();
        ctx.textAlign = "left";
        for (var i = 0; i < this.menuType.length; i++) {
            if ((menuHover - 1) === i) {
                this.itemHovered[1] = false;
                this.itemHovered[2] = false;
                this.itemHovered[3] = false;
                this.itemHovered[i+1] = true;
                ctx.fillStyle = "rgba(255,255,255,0.7)";
                ctx.fillRect(((this.menuPos[0] + this.lineWidth)), ((this.menuPos[1] + this.lineWidth) + (this.menuItemSize * i)), this.menuSize[0], this.menuItemSize-this.lineWidth);
                ctx.fillStyle = "black";
            } else {
                ctx.fillStyle = "white";
            }
            ctx.fillText(this.menuType[i], (this.menuPos[0] + this.lineWidth) + 5, (this.menuPos[1] + this.lineWidth) + (this.menuItemSize * i) + 10);            
        }
        ctx.restore();
    }

    Menu.prototype.showMenu = function (XY, menuHover) {
        this.menuPos = [XY[0], XY[1]];      
        this.renderMenu(menuHover);
    }
    Game.CreateMenu = Menu;
})();
//Main game-loop
(function () {    
    Game.init = function () {
        Game.collisionMap = null;
        Game.sprite = new Image();
        Game.sprite.src = "img/sprites.png";
        Game.swingImg = new Image();
        Game.swingImg.src = "img/swing.png";

        loadUtilities();
        
        initCanvas();                           
        lastTime = Date.now();

        setEventHandlers();

        game();        
    }
    function initCanvas() {        
        Game.ctx.canvas.width = Game.view[0] * Game.tileSize;
        Game.ctx.canvas.height = Game.view[1] * Game.tileSize;
    }
    function loadUtilities() {
        Game.backgroundMap = new Image();
        Game.backgroundMap.src = "map/map.png";
        Game.topLayerMap1 = new Image();
        Game.topLayerMap1.src = "map/top1.png";
        Game.topLayerMap2 = new Image();
        Game.topLayerMap2.src = "map/top2.png";
        Game.remotePlayers = [];
        Game.loadJSON = new Game.jsonLoader("map/map.json");

        Game.collisionMap = new Game.jsonLoader("map/collisionmap.json");
        Game.collisionMap.loadMap();
        Game.collisionMap = Game.collisionMap.obj.layers[0].objects;
        
        var lastTime;

        Game.player.weaponImage.src = "img/sword.png";
        Game.theMap = new Game.Map();
        Game.menu = new Game.CreateMenu();
        Game.monsterList = [];
        Game.items = [];
        Game.mapCoords = [];

        document.getElementById("loadimg").className = "hidden";
        Game.ctx = document.getElementById("myCanvas").getContext("2d");

        //Game.socket = null;
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
        
        Game.view = [36, 24];
        Game.tileSize = 32;
        Game.debug = true;

        Game.mousePosition.pos = [0, 0];
        Game.mousePosition.igPos = [0, 0];
        Game.ui = new Image();
        Game.ui.src = "img/playerui.png";
        Game.glassOverlay = new Image();
        Game.glassOverlay.src = "img/glassoverlayUI.png";


        Game.mousePosition.degrees = function () {
            var radian = Math.atan2(Game.mousePosition.pos[0] - (Game.ctx.canvas.width / 2), Game.mousePosition.pos[1] - (Game.ctx.canvas.height / 2));
            if (radian < 0) {
                radian += Math.PI * 2;
            }
            return parseInt((radian / (Math.PI / 360)) / 2);
        }
    }
    function game() {        
        var now = Date.now();        
        var dt = (now - lastTime) / 1000.0;           
        
        if (Game.debug) {
            document.getElementById("debugtext").innerHTML = "px: " + Game.player.x + ". py: " + Game.player.y + ". mousepos: " + Game.mousePosition.igPos +
                ". grader: " + Game.player.lookingDirection + ". test: "+Game.player.aimPos;
        }

        update(dt);
        render();

        checkCollisions(Game.monsterList, Game.player);
        lastTime = now;

        //if (Game.player.isAlive) {
            requestAnimFrame(game);
        //} 
    }
    function update(dt) {
        Game.socket.emit()
        //Game.player.isAlive = Game.player.health > 0 ? true : false;
        Game.player.lastAttack += dt;
        Game.player.lookingDirection = Game.mousePosition.degrees();
        if ((Date.now() - Game.player.lastDamage) / 1000 < 3) {
            Game.player.takeDamage();
        }
        updateEquipment();
        updateInventory();

        var lDir = Game.player.lookingDirection;
       
        mouseActions();

        if (Game.player.update(dt)) {
            Game.socket.emit("move player", { x: Game.player.x, y: Game.player.y });
        }

        if (Game.controls.down || Game.controls.up || Game.controls.left || Game.controls.right) {
            Game.player.sprite.update(dt, false);
        } else {
            Game.player.sprite.update(dt, true);
        }

        checkMonsters(dt);
        Game.player.atkPos = [];
    }
    function render() {
        Game.ctx.clearRect(0, 0, Game.ctx.canvas.width, Game.ctx.canvas.height);
        //Game.ctx.drawImage(Game.theMap.img, Game.player.x + 16 - (Game.ctx.canvas.width / 2), Game.player.y + 16 - (Game.ctx.canvas.height / 2), Game.theMap.img.width, Game.theMap.img.height, 0, 0, Game.theMap.img.width, Game.theMap.img.height);
        Game.ctx.drawImage(Game.backgroundMap, Game.player.x + 16 - (Game.ctx.canvas.width / 2), Game.player.y + 16 - (Game.ctx.canvas.height / 2), Game.backgroundMap.width, Game.backgroundMap.height, 0, 0, Game.backgroundMap.width, Game.backgroundMap.height);
        
        renderMonsters();
        renderItems();
        drawAim();
        renderPlayer();
        renderRemotePlayers();
        
        if (Game.mousePosition.leftClick && !Game.mousePosition.rightClick) {
            if (!((Game.mousePosition.pos[0] > (Game.menu.menuPos[0] + Game.menu.lineWidth) && Game.mousePosition.pos[0] < ((Game.menu.menuPos[0] + Game.menu.menuSize[0])) - Game.menu.lineWidth) && (Game.mousePosition.pos[1] > (Game.menu.menuPos[1] + Game.menu.lineWidth) && Game.mousePosition.pos[1] < ((Game.menu.menuPos[1] + Game.menu.menuSize[1])) - Game.menu.lineWidth))) {
                    Game.menu.focused = false;
                    Game.player.attack();
            }
        }

        //Game.ctx.drawImage(Game.theMap.topLayerImg, Game.player.x + 16 - (Game.ctx.canvas.width / 2), Game.player.y + 16 - (Game.ctx.canvas.height / 2), Game.theMap.img.width, Game.theMap.img.height, 0, 0, Game.theMap.img.width, Game.theMap.img.height);
        //Game.ctx.drawImage(Game.theMap.top2LayerImg, Game.player.x + 16 - (Game.ctx.canvas.width / 2), Game.player.y + 16 - (Game.ctx.canvas.height / 2), Game.theMap.img.width, Game.theMap.img.height, 0, 0, Game.theMap.img.width, Game.theMap.img.height);
        Game.ctx.drawImage(Game.topLayerMap1, Game.player.x + 16 - (Game.ctx.canvas.width / 2), Game.player.y + 16 - (Game.ctx.canvas.height / 2), Game.topLayerMap1.width, Game.topLayerMap1.height, 0, 0, Game.topLayerMap1.width, Game.topLayerMap1.height);
        Game.ctx.drawImage(Game.topLayerMap2, Game.player.x + 16 - (Game.ctx.canvas.width / 2), Game.player.y + 16 - (Game.ctx.canvas.height / 2), Game.topLayerMap2.width, Game.topLayerMap2.height, 0, 0, Game.topLayerMap2.width, Game.topLayerMap2.height);


        checkExamining();
        renderInterface();
        rClickMenu();
        
        setAimPos();
    }    
})();
//event-handlers
var setEventHandlers = function () {
    console.log("eventhandlers");
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
    
    Game.ctx.canvas.addEventListener("mousedown", function (e) {
        mouseDown(e, Game.player, Game.view[0], Game.view[1])
    }, false);
    Game.ctx.canvas.addEventListener("mouseup", function (e) {
        mouseUp(e, Game.player, Game.view[0], Game.view[1])
    }, false);
    Game.ctx.canvas.addEventListener("mousemove", function (e) {
        var leftSideX = (Game.player.x - ((Game.view[0] * Game.tileSize / 2))) + 16;
        var RightSideX = (Game.player.x + ((Game.view[0] * Game.tileSize / 2))) + 16;
        var TopSideY = (Game.player.y - ((Game.view[1] * Game.tileSize / 2))) + 16;
        var BottomSideY = (Game.player.y + ((Game.view[1] * Game.tileSize / 2))) + 16;

        Game.mousePosition.pos = [e.x - Game.ctx.canvas.offsetLeft, e.y - Game.ctx.canvas.offsetTop];
        Game.mousePosition.igPos = [(e.x - Game.ctx.canvas.offsetLeft) + leftSideX, (e.y - Game.ctx.canvas.offsetTop) + TopSideY];

                      

    }, false);
    Game.ctx.canvas.addEventListener("mousewheel", function (e) {
        if (e.wheelDelta > 0) {
            if (Game.player.currAction === "red") {
                Game.player.currAction = "blue";
            } else {
                Game.player.currAction = "red";
            }
        } else {
            if (Game.player.currAction === "red") {
                Game.player.currAction = "blue";
            } else {
                Game.player.currAction = "red";
            }
        }
    }, false);

};
//Socket functions
(function () {
    
    //on new socket connection
    Game.onSocketConnected = function () {
        document.getElementById("button_new").addEventListener('click', initCharacter, false);
        //if (Game.player) {
        //    document.getElementById("shadowbackground").className = "hidden";
        //    Game.player.reset();
        //    Game.init();
        //    /*..byid("shadowbackground").className="hidden"*/
        //}        
    }

    Game.onSocketDisconnect = function () {
        console.log("Disconnected from socket server");
    };

    Game.createPlayer = function (data) {
        console.log(data);
        Game.player = new Game.Player(data.name, data.x, data.y, data.startHealth, data.id, data.startHealth);
        Game.player.isAlive = true;
        Game.init();
    }

    Game.onNewPlayer = function (data) {
        if (data.id !== Game.player.id) {
            console.log("new player. id: " + data.id + ". my id: " + Game.player.id);
            var newPlayer = new Game.Player(data.name, data.x, data.y, data.starthealth, data.id, data.starthealth);
            newPlayer.id = data.id;
            newPlayer.health = data.health;
            Game.remotePlayers.push(newPlayer);
        }
    };
    Game.onMovePlayer = function (data) {
        var movePlayer = playerById(data.id);

        if (!movePlayer) {
            console.log("Player not found: " + data.id);
            return;
        };

        movePlayer.x = data.x;
        movePlayer.y = data.y;
    };
    Game.onRemovePlayer = function (data) {
        var removePlayer = playerById(data.id);

        if (!removePlayer) {
            console.log("Player not found: " + data.id);
            return;
        };

        Game.remotePlayers.splice(Game.remotePlayers.indexOf(removePlayer), 1);
    };
    Game.getPlayerHealth = function (data) {
        Game.socket.emit({health: Game.player.health });
    }
    Game.playerCurrentHealth = function (data) {
        Game.player.health = data.health;
    }
    Game.playerAttacked = function (data) {
        if (data.id === Game.player.id) {
            Game.player.health -= data.dmg;
            console.log(Game.player.health);
            //if (Game.player.health <= 0) {
            //    Game.player.isAlive = false;
            //}
        } else {
            var player = playerById(data.id);
            player.health -= data.dmg;
            if (player.health <= 0) {
                Game.remotePlayers.splice(Game.remotePlayers.indexOf(player), 1);
            }
        }        
        console.log(data.id, data.dmg, Game.player.id);
    }
    Game.playerKilled = function (data) {
        if (data.id === Game.player.id) {
            delete Game.player;
            //initCharacter();
            playerDeath();
        } else {
            Game.remotePlayers.splice(Game.remotePlayers.indexOf(data.id), 1);
        }
    }
    Game.renderItem = function (data) {
        var newItem = new Game.Item(data.x, data.y, data.gX, data.gY, data.name, data.desc, data.minMax)
        
        Game.items.push(newItem);
    }
    Game.unrenderItem = function (data) {
        var itemNumber = getItemByName(data.name)
        Game.items.splice(itemNumber, 1);
    }

})();
//Socket receivers
(function () {    
    Game.socket.on("connect", Game.onSocketConnected);
    Game.socket.on("createplayer", Game.createPlayer);
    Game.socket.on("disconnect", Game.onSocketDisconnect);    
    Game.socket.on("new player", Game.onNewPlayer);
    Game.socket.on("move player", Game.onMovePlayer);
    Game.socket.on("remove player", Game.onRemovePlayer);
    Game.socket.on("returnplayerhealth", Game.playerCurrentHealth);
    Game.socket.on("playerattacked", Game.playerAttacked);
    Game.socket.on("playerkilled", Game.playerKilled);
    Game.socket.on("renderitem", Game.renderItem);
    Game.socket.on("unrenderitem", Game.unrenderItem);
})();
function initCharacter() {
    var myString = document.getElementById("playerName").value;
    var re = /^[a-zA-Z]+$/;
    //if (!Game.player) {
    //    console.log("ost");
    //    document.getElementById("shadowbackground").className = "show";
    //}
    if (re.test(myString)) {
        document.getElementById("shadowbackground").className="hidden";
        Game.socket.emit("createplayer", myString);
    } else {
        document.getElementById("nameerror").className = "show";
    }
}
function activeAction() {
    if (Game.player.currAction === "red") {
        Game.ctx.save();
        Game.ctx.translate(560, 626);
        Game.ctx.fillStyle = "red";
        Game.ctx.fillRect(0, 0, 32, 32);
        Game.ctx.restore();
    } else if (Game.player.currAction === "blue") {
        Game.ctx.save();
        Game.ctx.translate(560, 626);
        Game.ctx.fillStyle = "blue";
        Game.ctx.fillRect(0, 0, 32, 32);
        Game.ctx.restore();
    }
}
function drawAim() {
    var swordWidth = Game.player.weaponImage.width;
    var sinAngle = Math.sin(Game.mousePosition.degrees() * (Math.PI*2) / 360);
    var cosAngle = Math.cos(Game.mousePosition.degrees() * (Math.PI*2) / 360);
    var radAngle = Game.mousePosition.degrees() * (Math.PI *2 / 360);
    var canvasWidth = Game.ctx.canvas.width;
    var canvasHeight = Game.ctx.canvas.height;
    
    
    //document.getElementById("sincos").innerHTML = "sinAngle: " + parseInt(sinAngle * 40) + " cosAngle: " + parseInt(cosAngle * 40) + "radAngle: " + radAngle;
    Game.ctx.save();
    Game.ctx.translate(canvasWidth / 2, canvasHeight / 2);
    Game.ctx.rotate(-radAngle);
    Game.ctx.drawImage(Game.player.weaponImage, -16,-16);

    //document.getElementById("sincos").innerHTML = "sinAngle: "+ parseInt(sinAngle*40)+" cosAngle: "+parseInt(cosAngle*40)+ "radAngle: "+radAngle;

    
    Game.ctx.restore();
}
function setAimPos() {
    var sinAngle = Math.sin(Game.mousePosition.degrees() * Math.PI / 180);
    var cosAngle = Math.cos(Game.mousePosition.degrees() * Math.PI / 180);
    Game.player.aimPos = [Game.player.x + parseInt(sinAngle * 45), Game.player.y + parseInt(cosAngle * 45)];
    
}
function playerById(id) {
    for (var i = 0; i < Game.remotePlayers.length; i++) {
        if (Game.remotePlayers[i].id == id) {
            return Game.remotePlayers[i];
        }
    };
    return false;
};
function checkExamining() {
    if (Game.Inspecting.timer > 0 && Game.Inspecting.showText !== null) {
        Game.ctx.save();
        Game.ctx.textAlign = 'center';
        Game.ctx.fillStyle = 'white';
        Game.ctx.lineWidth = 0.3;
        Game.ctx.strokeStyle = 'black';
        Game.ctx.font = 'bold 12pt Verdana';
        Game.ctx.fillText(Game.Inspecting.showText, (Game.ctx.canvas.width / 2), (Game.ctx.canvas.height / 2) - 30);
        Game.ctx.strokeText(Game.Inspecting.showText, (Game.ctx.canvas.width / 2), (Game.ctx.canvas.height / 2) - 30);
        Game.ctx.restore();
    }
    if (Game.Inspecting.timer > 0) {
        Game.Inspecting.timer -= 0.01;
        if (Game.Inspecting.timer < 0) {
            Game.Inspecting.timer = 0;
        }
    }
}
function rClickMenu() {
    if ((!Game.mousePosition.leftClick && Game.mousePosition.rightClick)) {
        if (Game.mousePosition.pos[1] > 600) {
            Game.menu.showMenu(Game.mousePosition.pos);
            Game.menu.menuType = Game.menu.menuChoices[1];
            Game.menu.menuPosCurr = Game.mousePosition.pos;
        } else {
            Game.menu.showMenu(Game.mousePosition.pos)
            Game.menu.menuType = Game.menu.menuChoices[0];
            Game.menu.menuPosCurr = Game.mousePosition.pos;
        }
        Game.mousePosition.rightClick = false;
        Game.menu.focused = true;
    }
    if (Game.menu.focused) {
        var menuHover;
        if (Game.mousePosition.pos[0] > (Game.menu.menuPos[0] + Game.menu.lineWidth) && Game.mousePosition.pos[0] < ((Game.menu.menuPos[0] + Game.menu.menuSize[0])) - Game.menu.lineWidth) {
            if (Game.mousePosition.pos[1] > (Game.menu.menuPos[1] + Game.menu.lineWidth) && Game.mousePosition.pos[1] < ((Game.menu.menuPos[1] + Game.menu.menuSize[1])) - Game.menu.lineWidth) {
                if (Game.mousePosition.pos[1] > (Game.menu.menuPos[1] + Game.menu.lineWidth) && Game.mousePosition.pos[1] < ((Game.menu.menuPos[1] + Game.menu.lineWidth) + Game.menu.menuItemSize)) {
                    menuHover = 1;
                } else if (Game.mousePosition.pos[1] > ((Game.menu.menuPos[1] + Game.menu.lineWidth) + (Game.menu.menuItemSize)) && Game.mousePosition.pos[1] < (((Game.menu.menuPos[1] + Game.menu.lineWidth) + Game.menu.menuItemSize) + (Game.menu.menuItemSize))) {
                    menuHover = 2;
                } else if (Game.mousePosition.pos[1] > ((Game.menu.menuPos[1] + Game.menu.lineWidth) + (Game.menu.menuItemSize * 2)) && Game.mousePosition.pos[1] < (((Game.menu.menuPos[1] + Game.menu.lineWidth) + Game.menu.menuItemSize) + (Game.menu.menuItemSize * 2))) {
                    menuHover = 3;
                }
            }
        }
        Game.menu.showMenu(Game.menu.menuPosCurr, menuHover);
    }
}
function renderInterface() {
    Game.ctx.drawImage(Game.ui, 0, 0);
    var position = [28, 638];
    Game.ctx.save();
    Game.ctx.textAlign = 'left';
    Game.ctx.fillStyle = 'white';
    Game.ctx.font = '12pt Century';
    Game.ctx.fillText("Lv. " + Game.player.level, position[0], position[1]);
    position = [200, 638];
    Game.ctx.textAlign = 'center';
    Game.ctx.fillText(Game.player.name, position[0], position[1]);
    position = [112, 663];
    Game.ctx.textAlign = 'right';
    Game.ctx.font = '8pt Century';
    Game.ctx.fillText(Game.player.strength, position[0], position[1]);
    position = [112, 677];
    Game.ctx.fillText(Game.player.vitality, position[0], position[1]);
    position = [112, 691];
    Game.ctx.fillText(Game.player.intelligence, position[0], position[1]);
    position = [28, 729];
    Game.ctx.textAlign = 'left';
    Game.ctx.fillText(Game.player.experiencePoints, position[0], position[1]);
    position = [56, 741];
    Game.ctx.fillText(Game.player.experiencePoints, position[0], position[1]);
    Game.ctx.restore();

    if (Game.player.inventory.length > 0) {
        var invPos = [871, 617];
        var inventoryX = 8;
        var count = 0;
        var pos = 0;
        for (var i = 0; i < Game.player.inventory.length; i++) {
            if (count === 8) {
                invPos = [871, 650];
            }else if (count === 16) {
                invPos = [871, 683];
            } else if (count === 24) {
                invPos = [871, 716];
            } else if (count === 32) {
                return false;
            }
            
            Game.ctx.drawImage(Game.sprite, Game.player.inventory[i].gX, Game.player.inventory[i].gY, 32, 32, invPos[0] + (pos * 33), invPos[1], 32, 32);
            count += 1;
            pos = pos === 7 ? 0 : pos+1;
        }
    }
    //health bar
    Game.ctx.save();
    Game.ctx.fillStyle = "#790000";
    var percHealth = parseInt((Game.player.health / Game.player.startHealth) * 100);
    var healthMeterHeight = 113;
    var onePerc = 113 / 100;
    var toFill = parseInt(percHealth * onePerc);
    Game.ctx.translate(310, 738 - toFill);
    Game.ctx.fillRect(0, 0, 30, toFill);
    Game.ctx.restore();
    //energy bar
    Game.ctx.save();
    Game.ctx.fillStyle = "#007236";
    var percEnergy = parseInt((Game.player.energy / Game.player.startEnergy) * 100);
    var energyMeterHeight = 113;
    var onePercEn = 113 / 100;
    var toFill = parseInt(percEnergy * onePercEn);
    Game.ctx.translate(346, 738 - toFill);
    Game.ctx.fillRect(0, 0, 30, toFill);
    Game.ctx.restore();

    //currspell
    activeAction();
    //last add the glass overlay layer    
    Game.ctx.drawImage(Game.glassOverlay, 0, 0);
}
function mouseActions() {
    if (Game.controls.down || Game.controls.up || Game.controls.left || Game.controls.right) {
        Game.menu.focused = false;
        Game.menu.itemClicked = null;
    }
    if (!Game.menu.focused) {
        Game.menu.itemClicked = null;
    } else {
        if (Game.mousePosition.leftClick && !Game.mousePosition.rightClick) {
            if (Game.menu.menuType === Game.menu.menuChoices[0]) {
                if (Game.mousePosition.pos[0] > (Game.menu.menuPos[0] + Game.menu.lineWidth) && Game.mousePosition.pos[0] < ((Game.menu.menuPos[0] + Game.menu.menuSize[0])) - Game.menu.lineWidth) {
                    if (Game.mousePosition.pos[1] > (Game.menu.menuPos[1] + Game.menu.lineWidth) && Game.mousePosition.pos[1] < ((Game.menu.menuPos[1] + Game.menu.menuSize[1])) - Game.menu.lineWidth) {
                        if (Game.mousePosition.pos[1] > (Game.menu.menuPos[1] + Game.menu.lineWidth) && Game.mousePosition.pos[1] < ((Game.menu.menuPos[1] + Game.menu.lineWidth) + Game.menu.menuItemSize)) {
                            Game.menu.menuClicked = "use";
                        } else if (Game.mousePosition.pos[1] > ((Game.menu.menuPos[1] + Game.menu.lineWidth) + (Game.menu.menuItemSize)) && Game.mousePosition.pos[1] < (((Game.menu.menuPos[1] + Game.menu.lineWidth) + Game.menu.menuItemSize) + (Game.menu.menuItemSize))) {
                            Game.menu.menuClicked = "pickup";
                        } else if (Game.mousePosition.pos[1] > ((Game.menu.menuPos[1] + Game.menu.lineWidth) + (Game.menu.menuItemSize * 2)) && Game.mousePosition.pos[1] < (((Game.menu.menuPos[1] + Game.menu.lineWidth) + Game.menu.menuItemSize) + (Game.menu.menuItemSize * 2))) {
                            Game.menu.menuClicked = "examine";
                        }
                    }
                }
                Game.menu.focused = false;
            } else if (Game.menu.menuType === Game.menu.menuChoices[1]) {
                if (Game.mousePosition.pos[0] > (Game.menu.menuPos[0] + Game.menu.lineWidth) && Game.mousePosition.pos[0] < ((Game.menu.menuPos[0] + Game.menu.menuSize[0])) - Game.menu.lineWidth) {
                    if (Game.mousePosition.pos[1] > (Game.menu.menuPos[1] + Game.menu.lineWidth) && Game.mousePosition.pos[1] < ((Game.menu.menuPos[1] + Game.menu.menuSize[1])) - Game.menu.lineWidth) {
                        if (Game.mousePosition.pos[1] > (Game.menu.menuPos[1] + Game.menu.lineWidth) && Game.mousePosition.pos[1] < ((Game.menu.menuPos[1] + Game.menu.lineWidth) + Game.menu.menuItemSize)) {
                            Game.menu.menuClicked = "equip";
                        } else if (Game.mousePosition.pos[1] > ((Game.menu.menuPos[1] + Game.menu.lineWidth) + (Game.menu.menuItemSize)) && Game.mousePosition.pos[1] < (((Game.menu.menuPos[1] + Game.menu.lineWidth) + Game.menu.menuItemSize) + (Game.menu.menuItemSize))) {
                            Game.menu.menuClicked = "examine";
                        } else if (Game.mousePosition.pos[1] > ((Game.menu.menuPos[1] + Game.menu.lineWidth) + (Game.menu.menuItemSize * 2)) && Game.mousePosition.pos[1] < (((Game.menu.menuPos[1] + Game.menu.lineWidth) + Game.menu.menuItemSize) + (Game.menu.menuItemSize * 2))) {
                            Game.menu.menuClicked = "drop";
                        }
                    }
                }
                Game.menu.focused = false;
            }
        }
    }

    var itemMatched = false;
    if (Game.menu.menuClicked === "use") {
        console.log("use item");
        Game.menu.menuClicked = null;
    } else if (Game.menu.menuClicked === "pickup") {
        if (Game.menu.itemClicked === "item") {
            for (var i = 0; i < Game.items.length; i++) {
                if ((Game.player.x > (Game.items[i].x - Game.tileSize) && Game.player.x < (Game.items[i].x + Game.tileSize)) && (Game.player.y > (Game.items[i].y - Game.tileSize) && Game.player.y < (Game.items[i].y + Game.tileSize))) {
                    if (Game.player.inventory.length <= 31) {
                        Game.Inspecting.showText = "You picked up " + Game.items[i].name + ". Attack: " + Game.items[i].minMax[0] + "-" + Game.items[i].minMax[1];
                        Game.player.inventory[Game.player.inventory.length] = Game.items[i];
                        var currentItem = Game.items[i];
                        Game.socket.emit("itemtaken", { "name": currentItem.name, "x": currentItem.x, "y": currentItem.y, "gx": currentItem.gX, "gy": currentItem.gY, "minmax": currentItem.minMax });
                        Game.items.splice(i, 1);
                        Game.menu.itemClicked = null;
                        Game.menu.menuClicked = null;
                        return;
                    } else {
                        Game.menu.itemClicked = null;
                        Game.menu.menuClicked = null;
                        return false;
                    }
                } else {
                    Game.menu.menuClicked = null;
                }
            }
        }
    } else if (Game.menu.menuClicked === "equip") {
        console.log("equip item");
        Game.menu.menuClicked = null;
    } else if (Game.menu.menuClicked === "examine") {
        console.log("examine item");
        Game.menu.menuClicked = null;
    } else if (Game.menu.menuClicked === "drop") {
        if (Game.menu.itemClicked === "inventory") {
            Game.items.push(Game.menu.inventoryItem);
            Game.items[Game.items.length-1].x = Game.player.x;
            Game.items[Game.items.length - 1].y = Game.player.y;

            var currentItem = Game.items[Game.items.length - 1];
            Game.socket.emit("itemdropped", { "name": currentItem.name, "x": currentItem.x, "y": currentItem.y, "gx": currentItem.gX, "gy": currentItem.gY, "minmax": currentItem.minMax });

            Game.menu.inventoryItem = null;
            Game.player.inventory.splice(Game.menu.inventoryItemPlace, 1);
        }        
        Game.menu.menuClicked = null;
    }  
        
    

    //if (Game.mousePosition.leftClick && Game.mousePosition.rightClick) {
    //    Game.mousePosition.leftClick = false;
    //    Game.mousePosition.rightClick = false;
    //    Game.menu.focused = false;

    //    if (!itemMatched) {//toplayer                 
    //        itemMatched = playerLooking([Game.mousePosition.xClick, Game.mousePosition.yClick], Game.mapCoords, Game.theMap.mapData.layers[2]);
    //    }
    //    if (!itemMatched) {//itemlayer              
    //        itemMatched = playerLooking([Game.mousePosition.xClick, Game.mousePosition.yClick], Game.mapCoords, Game.items, true);
    //    }

    //    if (!itemMatched) {//fglayer
    //        itemMatched = playerLooking([Game.mousePosition.xClick, Game.mousePosition.yClick], Game.mapCoords, Game.theMap.mapData.layers[1]);
    //    }
    //    if (!itemMatched) {//bglayer
    //        itemMatched = playerLooking([Game.mousePosition.xClick, Game.mousePosition.yClick], Game.mapCoords, Game.theMap.mapData.layers[0]);
    //    }
    //}

    if (!Game.mousePosition.leftClick && Game.mousePosition.rightClick) {
        if (itemMatched = playerLooking([Game.mousePosition.xClick, Game.mousePosition.yClick], Game.mapCoords, Game.items, true, true)) {
            Game.menu.itemClicked = "item";
        }
        if ((Game.mousePosition.canvasXclick > 869 && Game.mousePosition.canvasXclick < 1133) && (Game.mousePosition.canvasYclick > 616 && Game.mousePosition.canvasYclick < 748)) {
            Game.menu.itemClicked = "inventory";
            if (Game.player.inventory.length > 0) {
                for (var i = 1; i <= Game.player.equipment.inventoryPositions.length; i++) {
                    var currInv = Game.player.equipment.inventoryPositions[i];
                    if (i <= Game.player.inventory.length) {
                        if ((Game.mousePosition.canvasXclick > currInv[0] && Game.mousePosition.canvasXclick < currInv[0] + Game.tileSize) && (Game.mousePosition.canvasYclick > currInv[1] && Game.mousePosition.canvasYclick < currInv[1] + Game.tileSize)) {
                            Game.menu.inventoryItem = Game.player.inventory[i - 1];
                            Game.menu.inventoryItemPlace = i - 1;
                        }
                    }
                }
            }
        }
    }
}
function equipItem(iXY, posXY, itemObj) {
    
}
function checkMonsters(dt) {
    if (Game.monsterList.length > 0) {
        for (var i = 0; i < Game.monsterList.length; i++) {
            if (Game.monsterList[i].isAlive) {
                //update monsters
                Game.monsterList[i].update(dt);
                Game.monsterList[i].sprite.update(dt);
                //check if monster has been attacked, and take action if thats the case (damage monster, and yield exp (TODO: add loot)
                if (Game.player.atkPos[0] !== undefined) {
                    if (boxCollides(Game.monsterList[i].x, Game.monsterList[i].y, Game.monsterList[i].width, Game.monsterList[i].height, Game.player.atkPos[0], Game.player.atkPos[1], 32, 32)) {
                        //TODO: add monster health 
                        Game.player.experiencePoints += Game.monsterList[i].giveExp;
                        console.log("monster killed. playerexp +: " + Game.monsterList[i].giveExp);
                        Game.monsterList[i].isAlive = false;
                        Game.monsterList[i].spawnTimer += dt;
                    }
                }
            } else {
                if (Game.monsterList[i].spawnTimer > 0) {
                    if (Game.monsterList[i].spawnTimer > Game.monsterList[i].spawnTime) {
                        Game.monsterList[i].isAlive = true;
                        Game.monsterList[i].spawnTimer = 0;
                        Game.monsterList[i].x = Game.monsterList[i].startX;
                        Game.monsterList[i].y = Game.monsterList[i].startY;
                    } else {
                        Game.monsterList[i].spawnTimer += dt;
                    }
                }
            }
        }
    }
}
function playerLooking(clickPos, mapCoords, layer, isItem, pickup) {
    if (!isItem) {
        for (var i = 0; i < layer.length; i++) {
            if (layer[i] > 0) {                
                if (boxCollides(clickPos[0], clickPos[1], 1, 1, Game.mapCoords[i][0], Game.mapCoords[i][1], 32, 32)) {
                    Game.Inspecting.showText = "You see " + Game.tileName[layer[i]] + ". position: " + Game.mapCoords[i];
                    Game.Inspecting.timer = 2;
                    return true;
                }
            }
        }
    } else  {
        for (var i = 0; i < layer.length; i++) {
            if (boxCollides(clickPos[0], clickPos[1], 1, 1, layer[i].x, layer[i].y, 32, 32)) {
                if (!pickup) {
                    Game.Inspecting.showText = "You see " + layer[i].name + ". Attack: " + layer[i].minMax[0] + "-" + layer[i].minMax[1];
                    Game.Inspecting.timer = 2;
                }
                return true;
            }
        }
    }
    return false;
}
function renderRemotePlayers() {   
    for (var i = 0; i < Game.remotePlayers.length; i++) {
        if (Game.remotePlayers[i].isAlive) {
            if (isInsideCanvas(Game.remotePlayers[i])) {
                Game.ctx.save();
                Game.ctx.translate(Game.remotePlayers[i].x - ((Game.player.x - ((Game.view[0] * Game.tileSize / 2))) + 16), Game.remotePlayers[i].y - ((Game.player.y - ((Game.view[1] * Game.tileSize / 2))) + 16));
                Game.remotePlayers[i].draw(Game.ctx);
                Game.ctx.restore();
            }
        }
    }
}
function renderMonsters() {
    for (var i in Game.monsterList) {
        if (Game.monsterList[i].isAlive) {
            if (isInsideCanvas(Game.monsterList[i], Game.player, Game.view[0], Game.view[1])) {
                if (!isColliding(Game.monsterList[i].x, Game.monsterList[i].y, Game.monsterList[i].width, Game.monsterList[i].height)) {
                    Game.ctx.save();
                    Game.ctx.translate(Game.monsterList[i].x - ((Game.player.x - ((Game.view[0] * Game.tileSize / 2))) + 16), Game.monsterList[i].y - ((Game.player.y - ((Game.view[1] * Game.tileSize / 2))) + 16));
                    Game.monsterList[i].sprite.render(Game.ctx, Game.monsterList[i].direction, Game.controls, false);
                    Game.ctx.restore();
                } else {
                    Game.monsterList.splice(i, 1);
                }
            }
        }
    }
}
function renderItems() {
    for (var i = 0; i < Game.items.length; i++) {
        var currItem = Game.items[i];
        if (isInsideCanvas(currItem, Game.player, Game.view[0], Game.view[1])) {
            Game.ctx.save();
            Game.ctx.translate(currItem.x - ((Game.player.x - ((Game.view[0] * Game.tileSize / 2))) + 16), currItem.y - ((Game.player.y - ((Game.view[1] * Game.tileSize / 2))) + 16));
            currItem.draw();
            Game.ctx.restore();
        }
    }
}
function getItemByName(itemname) {
    for (var i = 0; i < Game.items.length; i++) {
        if (Game.items[i].name === itemname) {
            return i;
        }
    }
    return false;
}
function renderPlayer() {
    if (Game.player.isAlive) {
        Game.ctx.save();
        Game.ctx.translate((Game.ctx.canvas.width / 2) - 16, (Game.ctx.canvas.height / 2) - 16);
        Game.player.sprite.render(Game.ctx, Game.player.direction, Game.controls, true, Game.player.lastDamage);
        Game.ctx.textAlign = 'center';
        Game.ctx.fillStyle = 'white';
        Game.ctx.lineWidth = 0.2;
        Game.ctx.strokeStyle = 'black';
        Game.ctx.font = 'bold 10pt Verdana';
        Game.ctx.fillText(Game.player.name, 16, 0);
        Game.ctx.strokeText(Game.player.name, 16, 0);
        Game.ctx.restore();
    }
}
function loadMonsters() {
    var count = 0;
    for (var y = 0; y < Game.theMap.mapData.tilecount[1]; y++) {
        for (var x = 0; x < Game.theMap.mapData.tilecount[0]; x++) {
            if (Game.theMap.monsterSpawns.data[count] != 0) {
                if (Game.theMap.monsterSpawns.data[count] === 2011) {
                    Game.monsterList.push(new Game.Monster(x * Game.tileSize, y * Game.tileSize));
                }
            }
            Game.mapCoords[count] = [x * Game.tileSize, y * Game.tileSize];
            count++;
        }
    }
}
function loadItems() {
    var count = 0;
    for (var y = 0; y < Game.theMap.mapData.tilecount[1]; y++) {
        for (var x = 0; x < Game.theMap.mapData.tilecount[0]; x++) {
            if (Game.theMap.itemMap.data[count] != 0) {
                var currGid = Game.theMap.itemMap.data[count];
                var gx = (((currGid - 1) % (Game.theMap.mapData.tileSets[0].imagewidth / Game.tileSize)) * Game.tileSize);
                var gy = ((parseInt(currGid / (Game.theMap.mapData.tileSets[0].imagewidth / Game.tileSize))) * Game.tileSize);
                Game.items.push(new Game.Item(x * Game.tileSize, y * Game.tileSize, gx, gy, "osten" + count, "yeez", [10, 20]));
            }
            count++;
        }
    }
}
function insideSquare(obj, XY, checkSize) {
    var numTiles = checkSize || 1;
    var sqW = Game.theMap.mapData.tilesize[0];
    var sqH = Game.theMap.mapData.tilesize[1];
    var north       = [XY[0], XY[1] - (sqH*numTiles)];
    var northeast   = [XY[0] + (sqW*numTiles), XY[1] - (sqH*numTiles)];
    var east        = [XY[0] + (sqW*numTiles), XY[1]];
    var southeast   = [XY[0] + (sqW*numTiles), XY[1] + (sqH*numTiles)];
    var south       = [XY[0], XY[1] + (sqH*numTiles)];
    var southwest   = [XY[0] - (sqW*numTiles), XY[1] + (sqH*numTiles)];
    var west        = [XY[0] - (sqW*numTiles), XY[1]];
    var northwest   = [XY[0] - (sqW * numTiles), XY[1] - (sqH * numTiles)];
    return ((obj.x > northwest[0] && obj.x < northeast[0]) && (obj.y > north[1] && obj.y < south[1]));
}
function isInsideCanvas(entity) {
    var leftSideX = (Game.player.x - ((Game.view[0] * Game.tileSize / 2))) + 16;
    var RightSideX = (Game.player.x + ((Game.view[0] * Game.tileSize / 2))) + 16;
    var TopSideY = (Game.player.y - ((Game.view[1] * Game.tileSize / 2))) + 16;
    var BottomSideY = (Game.player.y + ((Game.view[1] * Game.tileSize / 2))) + 16;
    return ((entity.x + 31) > leftSideX && entity.x < RightSideX && (entity.y + 31) > TopSideY && entity.y < BottomSideY);
}
function checkCollisions() {
    if (Game.monsterList.length > 0) {
        for (var i in Game.monsterList) {
            if (Game.monsterList[i].isAlive) {
                if (!Game.player.invincible) {
                    if (boxCollides(Game.player.x, Game.player.y, Game.player.width, Game.player.height, Game.monsterList[i].x, Game.monsterList[i].y, Game.monsterList[i].width, Game.monsterList[i].height)) {
                        Game.player.health -= parseInt((Math.random() * 25) + 1);
                        Game.player.lastDamage = Date.now();                        
                    }
                }
                //todo fix
                if (Game.controls.hit) {
                    switch (Game.player.direction) {
                        case "left":
                            if (boxCollides(Game.player.x - 32, Game.player.y, Game.player.width, Game.player.height, Game.monsterList[i].x, Game.monsterList[i].y, Game.monsterList[i].width, Game.monsterList[i].height)) {
                                Game.monsterList.splice(i, 1);
                            }
                            break;
                        case "right":
                            if (boxCollides(Game.player.x + 32, Game.player.y, Game.player.width, Game.player.height, Game.monsterList[i].x, Game.monsterList[i].y, Game.monsterList[i].width, Game.monsterList[i].height)) {
                                Game.monsterList.splice(i, 1);
                            }
                            break;
                        case "up":
                            if (boxCollides(Game.player.x, Game.player.y - 32, Game.player.width, Game.player.height, Game.monsterList[i].x, Game.monsterList[i].y, Game.monsterList[i].width, Game.monsterList[i].height)) {
                                Game.monsterList.splice(i, 1);
                            }
                            break;
                        case "down":
                            if (boxCollides(Game.player.x, Game.player.y + 32, Game.player.width, Game.player.height, Game.monsterList[i].x, Game.monsterList[i].y, Game.monsterList[i].width, Game.monsterList[i].height)) {
                                Game.monsterList.splice(i, 1);
                            }
                            break;
                    }
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
    for (var i = 0; i < Game.collisionMap.length; i++) {
        var currObj = Game.collisionMap[i];
        if (boxCollides(x, y, w, h, currObj.x, currObj.y, currObj.width, currObj.height)) {
            return true;
        }
    }
}
function playerDeath() {
    document.getElementById("shadowbackground").className = "show";
    document.getElementById("dead").className = "show";
}
function mouseDown(e) {    
    if (e.button === 1) {//middle mouse button
        event.preventDefault();
    } else {
        var leftSideX = (Game.player.x - ((Game.view[0] * Game.tileSize / 2))) + 16;
        var RightSideX = (Game.player.x + ((Game.view[0] * Game.tileSize / 2))) + 16;
        var TopSideY = (Game.player.y - ((Game.view[1] * Game.tileSize / 2))) + 16;
        var BottomSideY = (Game.player.y + ((Game.view[1] * Game.tileSize / 2))) + 16;
        var x = e.x;
        var y = e.y;
        
        Game.mousePosition.xClick = (x - Game.ctx.canvas.offsetLeft) + leftSideX;
        Game.mousePosition.yClick = (y - Game.ctx.canvas.offsetTop) + TopSideY;

        Game.mousePosition.canvasXclick = Game.mousePosition.pos[0];
        Game.mousePosition.canvasYclick = Game.mousePosition.pos[1];

        if (e.button === 0) {
            Game.mousePosition.leftClick = true;
        }
        if (e.button === 2) {
            //Game.mousePosition.rightClick = true;
        }
        //console.log("mousex: " + Game.mousePosition.x + ". mouseY: " + Game.mousePosition.y + ".  mouseclick=" + Game.mousePosition.leftClick);      
    }       
}
function mouseUp(e) {
    if (e.button === 1) {//middle mouse button
        event.preventDefault();
    } else {
        var leftSideX = (Game.player.x - ((Game.view[0] * Game.tileSize / 2))) + 16;
        var RightSideX = (Game.player.x + ((Game.view[0] * Game.tileSize / 2))) + 16;
        var TopSideY = (Game.player.y - ((Game.view[1] * Game.tileSize / 2))) + 16;
        var BottomSideY = (Game.player.y + ((Game.view[1] * Game.tileSize / 2))) + 16;
        var x = e.x;
        var y = e.y;

        Game.mousePosition.xRelease = (x - Game.ctx.canvas.offsetLeft) + leftSideX;
        Game.mousePosition.yRelease = (y - Game.ctx.canvas.offsetTop) + TopSideY;

        if (e.button === 0) {
            Game.mousePosition.leftClick = false;
        }
        if (e.button === 2) {
            //Game.mousePosition.rightClick = false;
        }
    }
}
//todo
function updateEquipment() { };
//todo
function updateInventory() { };
Game.resources.load([
    'img/sprites.png',
    'img/models/playersprites.png',
    'img/models/monstersprites.png',
    'img/playerui.png',
    "img/models/playermodel.png"
]);
//Game.resources.onReady(Game.init);

window.oncontextmenu = function (event) {
    event.preventDefault();
    event.stopPropagation();
    return false;
};
