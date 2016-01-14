//---------
//RequestAnimFrame for IE, CHROME, FF
//---------
window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };
})();
var canvas = document.createElement("canvas");
var c = document.getElementById("canvas");
canvas.width = 800;
canvas.height = 640;
canvas.id = "myCanvas";
canvas.tabIndex = "1";
c.appendChild(canvas);
var ctx = canvas.getContext("2d");
//---------
//---------



//
//
//-----------------------
// GAME VARIABLES
//-----------------------
//
//
window.Game = {};
var player = new player("Axel");
var mapImg = new Image();
var mapInfo = {};
var viewX = 12;
var viewY = 10;
    var gameMap;
    var collisionMap;
    var debug = true;
    var speed = 1;
    var mapSizeX = canvas.width / 32;
    var mapSizeY = canvas.height / 32;
    var map = [mapSizeY];
    var running = true;
    var lastTime;
    var input = { left: false, right: false, up: false, down: false, hit: false };
    var playerSpeed = 100;
    var monsterSpeed = 75;
    var playerMelee = [];
    var difficulty = 1;
    var maxMonsters = 5;
        if (difficulty === 1) {
            maxMonsters = 1;
        } else if (difficulty === 2) {
            maxMonsters = 10;
        } else if (difficulty === 3) {
            maxMonsters = 15;
        }
    var KEY = {
        BACKSPACE: 8,
        TAB: 9,
        RETURN: 13,
        ESC: 27,
        SPACE: 32,
        PAGEUP: 33,
        PAGEDOWN: 34,
        END: 35,
        HOME: 36,
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40,
        INSERT: 45,
        DELETE: 46,
        ZERO: 48, ONE: 49, TWO: 50, THREE: 51, FOUR: 52, FIVE: 53, SIX: 54, SEVEN: 55, EIGHT: 56, NINE: 57,
        A: 65, B: 66, C: 67, D: 68, E: 69, F: 70, G: 71, H: 72, I: 73, J: 74, K: 75, L: 76, M: 77, N: 78, O: 79, P: 80, Q: 81, R: 82, S: 83, T: 84, U: 85, V: 86, W: 87, X: 88, Y: 89, Z: 90,
        TILDA: 192
    };
    var monsters = [];
    //var tileType = {
    //    GRASS: 0,
    //    TREE: 1,
    //    ROCK: 2,
    //    FOREST:3,
    //}
    
    var playerState = {
        ALIVE: 0,
        DEAD: 1,
    }
//
//
//-----------------------
// MAIN FUNCTIONS; INIT() DRAW() RENDER() UPDATE()
//-----------------------
//
// 
    //INIT()
    function init() {
        if (debug) {
            player.isAlive = true;
        } else {
            player.isAlive = false;
            document.getElementById("shadowbackground").className = "show";
        }
        createMap();
        initCanvas();
        lastTime = Date.now();
        game();
    }

    function initCanvas() {
        canvas.width = viewX * 32;
        canvas.height = viewY * 32;
    }

    //GAME()
    function game() {
        var now = Date.now();
        var dt = (now - lastTime) / 1000.0;

        if (monsters.length < maxMonsters) {
            if (Math.random() > 0.996) {
                monsters.push(new monster);
                
            }
        }
        
        update(dt);
        render();
        lastTime = now;
        if (player.isAlive) {
            requestAnimFrame(game);
        } else if (!player.isAlive) {
            playerDeath();
        }
    }

    //UPDATE()
    function update(dt) {

        handleInput(dt);
        handleMonsters();
        playerMelee = [];
        player.sprite.update(dt);
        
    }

    //RENDER
    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        document.getElementById("debugtext").innerHTML = "px: " + player.x + ". py: " + player.y;

        ctx.drawImage(mapImg, player.x + 16 - (canvas.width / 2), player.y + 16 - (canvas.height / 2), mapImg.width, mapImg.height, 0, 0, mapImg.width, mapImg.height);

        for (var i in monsters) {
            var currMonster = monsters[i];
            if (!isColliding(currMonster.x, currMonster.y, currMonster.width, currMonster.height)) {
                ctx.save();
                ctx.translate(currMonster.x, currMonster.y);
                currMonster.sprite.render(ctx, currMonster.direction, input, false);
                ctx.restore();
            } else {
                monsters.splice(i, 1);
            }
        }
        if (player.isAlive) {
            ctx.save();
            ctx.translate((canvas.width/2)-16, (canvas.height/2)-16);
            player.sprite.render(ctx, player.direction, input, true);
            ctx.restore();
        }
    }

    //HANDLEINPUT()
    function handleInput(dt) {
        if (input.left) {
            if (!isColliding(player.x - parseInt(playerSpeed * dt), player.y, player.width, player.height)) {
                player.direction = "left";
                player.x -= parseInt(playerSpeed * dt);
            } 
        }

        if (input.right) {
            if (!isColliding(player.x + parseInt(playerSpeed * dt), player.y, player.width, player.height)) {
                player.direction = "right";
                player.x += parseInt(playerSpeed * dt);
            }
                
        }

        if (input.up) {
            if (!isColliding(player.x,player.y - parseInt(playerSpeed * dt), player.width, player.height)) {
                player.direction = "up";
                player.y -= parseInt(playerSpeed * dt);
            }
        }
            if (input.down) {
                if (!isColliding(player.x,player.y + parseInt(playerSpeed * dt), player.width, player.height)) {
                player.direction = "down";
                player.y += parseInt(playerSpeed * dt);
           }
        }
        if (input.hit) {
            switch (player.direction) {
                case "left":
                    playerMelee.push([player.x - 10, player.y + 14, 16, 16]);
                    break;
                case "right":
                    playerMelee.push([player.x + 30, player.y + 16, 16, 16]);
                    break;
                case "up":
                    playerMelee.push([player.x + 8, player.y - 12, 16, 16]);
                    break;
                case "down":
                    playerMelee.push([player.x + 5, player.y + 32, 16, 16]);
                    break;
            }
        }
        player.lastPos = [player.x, player.y];
    }

    function checkCollisions() {
        //monster-player collision
        for (var i in monsters) {
            var currMonster = monsters[i];
            if (boxCollides(player.x, player.y, player.width, player.height, currMonster.x, currMonster.y, currMonster.width, currMonster.height)) {                
                player.isAlive = false;
            }
            if (playerMelee.length > 0) {
                if (boxCollides(playerMelee[0][0], playerMelee[0][1], 16, 16, currMonster.x, currMonster.y, currMonster.width, currMonster.height)) {
                    monsters.splice(i, 1);
                }
            }            
        }

    }

    //HANDLEMONSTERS
    function handleMonsters() {
        for (var i in monsters) {
            var dir = monsters[i].direction;
            var currMonster = monsters[i];
            var now = Date.now();
            var movable = (now - currMonster.lastMove) / 1000;
            var mRand = Math.floor((Math.random() * 4) + 1);
            if (movable > 2) {
                switch (mRand) {
                    case 1:
                        currMonster.direction = "right";
                        break;
                    case 2:
                        currMonster.direction = "left";
                        break;
                    case 3:
                        currMonster.direction = "up";
                        break;
                    case 4:
                        currMonster.direction = "down";
                        break;
                }
                currMonster.lastMove = Date.now();
            }

            switch (dir) {
                case "left":
                    if (!isColliding(currMonster.x - 1, currMonster.y, currMonster.width, currMonster.height)) {
                        currMonster.x -= 0.5;
                    }
                    break;
                case "right":
                    if (!isColliding(currMonster.x + 1, currMonster.y, currMonster.width, currMonster.height)) {
                        currMonster.x += 0.5;
                    }
                    break;
                case "up":
                    if (!isColliding(currMonster.x, currMonster.y - 1, currMonster.width, currMonster.height)) {
                        currMonster.y -= 0.5;
                    }
                    break;
                case "down":
                    if (!isColliding(currMonster.x, currMonster.y + 1, currMonster.width, currMonster.height)) {
                        currMonster.y += 0.5;
                    }
                    break;
            }
        }
    }

    

    

//
//
//-----------------------
// COLLISION ETC
//-----------------------
//
//

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

//
//
//-----------------------
// MONSTER & PLAYER CLASS
//-----------------------
//
//


    //monster
    function monster() {
        this.x = Math.floor((Math.random() * (canvas.width - 32)) + 1);
        this.y = Math.floor((Math.random() * (canvas.height - 32)) + 1);
        this.width = 32;
        this.height = 32;
        this.direction = "left";
        this.sprite = new Sprite("img/monstersprites.png", [0, 0], [32, 32], 14, [0, 1]);
        this.lastMove = Date.now() / 1000;
    }
    //player
    function player(name) {
        this.name= name;
        this.isAlive= false;
        this.x = 320;
        this.y = 288;
        this.startX = 128;
        this.startY = 258;
        this.direction = "right";
        this.width = 32;
        this.height = 32;
        this.sprite = new Sprite("img/playersprites.png", [0, 0], [32, 32], 4, [0, 1]);
    }
    //death
    function playerDeath() {
        document.getElementById("shadowbackground").className = "show";
        document.getElementById("dead").className = "show";
    }
    //reset
    function reset() {
        document.getElementById("shadowbackground").className = "hidden";
        player.isAlive = true;
        player.x = player.startX;
        player.y = player.startY;
        monsters = [];
        game();
    }
   
//
//
//-----------------------
// MAP & SPRITES
//-----------------------
//
//
    
    function renderMap(mapData) {
        var ctx = document.createElement("canvas").getContext("2d");
        var tileSize = mapData.tilesize;
        var mapSize = mapData.tilecount;
        var layers = mapData.layers.length;
        ctx.canvas.width = mapSize[0] * 32;
        ctx.canvas.height = mapSize[1] * 32;
        console.log("tilesize"+tileSize+" mapsize"+mapSize+" layers"+layers);
        for (var i = 0; i < mapData.layers.length; i++) {
            var count = 0;
            var currGid;
            var currLayer = mapData.layers[i];
            for (var y = 0; y <= mapSize[1]; y++) {
                for (var x = 0; x < mapSize[0]; x++) {            
                    
                    currGid = mapData.layers[i][count];
                    if (currGid>0) {
                        ctx.drawImage(mapData.sprite, ((currGid - 1) % 12) * 32, (parseInt(currGid/ 12)) * 32, tileSize[0], tileSize[1], x * 32, y * 32, 32, 32);
                    }
                    count++;
                }
            }
        }
        mapImg.src = ctx.canvas.toDataURL();

        console.log(mapImg.width + " " + mapImg.height);
     }    
    
         var interval;
         var result = null;

         httpobj = new XMLHttpRequest();
         httpobj.open('get', 'img/map/map.json', true);
         httpobj.send(null);
         httpobj.onreadystatechange = function () {
             if (httpobj.readyState == 4 && httpobj.status == 200) {
                 result = httpobj.responseText;

             }
             return false;
         }
         interval = setInterval(getResult(), 1000);
         
         function getResult() {

             if (result != null) {
                 interval = clearInterval(interval);
             }
         }
         
     
         function createMap() {
         var mapData = {};
         localStorage.setItem("result", result);
         var jsonObj = JSON.parse(result);
         mapInfo.mapDimensions = [jsonObj.width * 32, jsonObj.height * 32];
         mapInfo.tileDimensions = [jsonObj.tilewidth, jsonObj.tileheight];
         mapData.sprite = new Image();
         mapData.sprite.src = "img/sprites.png";
         mapData.tilecount = [jsonObj.layers[0].width, jsonObj.layers[0].height];
         mapData.tilesize = [jsonObj.tilesets[0].tilewidth, jsonObj.tilesets[0].tileheight];

         var cLayer = jsonObj.layers.length;
         var cTileset = jsonObj.tilesets.length;
         var layerCount = 0;

         for (var i = 0; i < jsonObj.layers.length; i++) {
             if (jsonObj.layers[i].type === "tilelayer") {
                 layerCount++;
             }
             if (jsonObj.layers[i].type === "objectgroup") {
                 if (jsonObj.layers[i].name === "Collision") {
                     collisionMap = jsonObj.layers[i].objects;
                 }
             }
         }
         mapData.layers = new Array(layerCount);

         for (var i = 0; i < mapData.layers.length; i++) {
             if (jsonObj.layers[i].type === "tilelayer") {
                 mapData.layers[i] = jsonObj.layers[i].data;
             } else if (jsonObj.layers[i].type === "objectgroup") {
                 mapData.collisionMap = jsonObj.layers[i].objects;
             }
         }
         renderMap(mapData);
         gameMap = mapData;
    }

    function isColliding(x,y,w,h) {
        for (var i = 0; i < collisionMap.length; i++) {
            var currObj = collisionMap[i];            
            if (boxCollides(x, y, w, h, currObj.x, currObj.y, currObj.width, currObj.height)) {
                return true;
            }
        }
    }

//
//
//-----------------------
// INPUT/EVENTLISTENERS
//-----------------------
//
//

    document.addEventListener('keydown', function (e) {
        switch (e.keyCode) {
            case KEY.LEFT:
                input.left = true;
                e.preventDefault();
                break;
            case KEY.RIGHT:
                input.right = true;
                e.preventDefault();
                break;
            case KEY.UP:
                input.up = true;
                e.preventDefault();
                break;
            case KEY.DOWN:
                input.down = true;
                e.preventDefault();
                break;
            case KEY.SPACE:
                input.hit = true;
                e.preventDefault();
                break;
        }
    }, false);
    document.addEventListener('keyup', function (e) {
        switch (e.keyCode) {
            case KEY.LEFT:
                input.left = false;
                break;
            case KEY.RIGHT:
                input.right = false;
                break;
            case KEY.UP:
                input.up = false;
                break;
            case KEY.DOWN:
                input.down = false;
                break;
            case KEY.SPACE:
                input.hit = false;
                break;
        }
    }, false);

    document.getElementById("newgame").addEventListener('click', function () {
        reset();
    }, false)

    
    resources.load([
        'img/sprites.png',
        'img/playersprites.png',
        'img/monstersprites.png'
    ]);
    resources.onReady(init);