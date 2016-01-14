"use strict";

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

        Game.collisionMap = new Game.jsonLoader("map/collisionmap.json");
        Game.collisionMap.loadMap();
        Game.collisionMap = Game.collisionMap.obj.layers[0].objects;

        Game.player.weaponImage.src = "img/sword.png";
        Game.theMap = new Game.Map();

        Game.monsterList = [];
        Game.items = [];
        Game.mapCoords = [];

        document.getElementById("loadimg").className = "hidden";
        Game.ctx = document.getElementById("myCanvas").getContext("2d");

        Game.controls = {
            left: false,
            up: false,
            right: false,
            down: false,
            hit: false,
            use: false
        };
        Game.mousePosition = {
            xClick: 0,
            yClick: 0,
            xRelease: 0,
            yRelease: 0,
            leftClick: false,
            rightClick: false
        };
        Game.projectiles = [];
        Game.foreignProjectiles = [];
        Game.view = [18, 12];
        Game.tileSize = 64;
        Game.debug = false;

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
        var dt = (now - Game.lastTime) / 1000.0;
        Game.since += (now - Game.lastTime);

        if(Game.since > Game.ival){
            if (Game.debug) {
                document.getElementById("debugtext").innerHTML = "px: " + Game.player.x + ". py: " + Game.player.y + ". mousepos: " + Game.mousePosition.igPos +
                    ". grader: " + Game.player.lookingDirection + ". test: "+Game.player.aimPos+ ". <br><br><br><br>"+
                    Game.player.name + "<br>" + Game.player.id + "<br>"+Game.player.health+"<br>"+Game.player.currAction+"<br>"+Math.sin(Game.player.lookingDirection)+"<br>"+Math.cos(Game.player.lookingDirection)+
                "<br>"+"up: "+Game.controls.up +"<br>"+"down: "+Game.controls.down +"<br>"+"left: "+Game.controls.left +"<br>"+"right: "+Game.controls.right +"<br>"
                +"hit: "+Game.controls.hit +"<br>"+"use: "+Game.controls.use +"<br>";
            }
        update(dt);
        render();

        checkCollisions();

        Game.lastTime = now;
        Game.since = 0;
        }
        if(Date.now() - Game.msTimer > 1000){
            Game.socket.emit("ping", {ping: Date.now()});
            Game.msTimer = Date.now();
        }
        requestAnimFrame(game);
    }
    function update(dt) {
        Game.socket.emit();

        Game.player.lastAttack += dt;
        Game.player.lookingDirection = Game.mousePosition.degrees();
        if ((Date.now() - Game.player.lastDamage) / 1000 < 3) {
            Game.player.takeDamage();
        }
        updateEquipment();
        updateInventory();

        var lDir = Game.player.lookingDirection;

        if (Game.player.update(dt)) {
            Game.socket.emit("move player", { x: Game.player.x, y: Game.player.y });
        }

        if (Game.controls.down || Game.controls.up || Game.controls.left || Game.controls.right) {
            Game.player.sprite.update(dt, false);
        } else {
            Game.player.sprite.update(dt, true);
        }

        if (Game.mousePosition.leftClick && !Game.mousePosition.rightClick) {
            Game.player.attack();
        }else if(!Game.mousePosition.leftClick && Game.mousePosition.rightClick){
            if(Date.now() - Game.player.lastSecondAttack > 400) {
                Game.player.lastSecondAttack = Date.now();
                Game.projectiles.push(new Game.Projectiled(Game.player.x, Game.player.y, Game.player.currAction, Game.player.lookingDirection));
                Game.socket.emit("new projectile", {startX: Game.player.x, startY: Game.player.y, type: Game.player.currAction, angle:Game.player.lookingDirection});
            }
        }
        checkMonsters(dt);

        //check if foreign projectiles are hitting the player
        checkProjectileCollision();
        //check if projectiles are within the canvas or hitting a remote player
        checkProjectiles(Game.projectiles, "local");
        //check if foreign projectiles are withing the canvas
        if(Game.foreignProjectiles.length > 0){
            checkProjectiles(Game.foreignProjectiles);
        }
    }
    function render() {
        Game.ctx.clearRect(0, 0, Game.ctx.canvas.width, Game.ctx.canvas.height);
        Game.ctx.drawImage(Game.backgroundMap, Game.player.x + 16 - (Game.ctx.canvas.width / 2), Game.player.y + 16 - (Game.ctx.canvas.height / 2), Game.ctx.canvas.width, Game.ctx.canvas.height, 0, 0, Game.ctx.canvas.width, Game.ctx.canvas.height);
        
        renderMonsters();
        renderItems();
        drawAim();
        renderPlayer();
        renderRemotePlayers();
        mouseActions();
        renderAttacks();
        if(Game.projectiles.length > 0){
            for(var p in Game.projectiles){
                Game.projectiles[p].draw();
            }
        }

        if(Game.foreignProjectiles.length > 0){
            for(var p in Game.foreignProjectiles){
                Game.foreignProjectiles[p].draw();
            }
        }

//        Game.ctx.drawImage(Game.topLayerMap1, Game.player.x + 16 - (Game.ctx.canvas.width / 2), Game.player.y + 16 - (Game.ctx.canvas.height / 2), Game.ctx.canvas.width, Game.ctx.canvas.height, 0, 0, Game.ctx.canvas.width, Game.ctx.canvas.height);
//        Game.ctx.drawImage(Game.topLayerMap2, Game.player.x + 16 - (Game.ctx.canvas.width / 2), Game.player.y + 16 - (Game.ctx.canvas.height / 2), Game.ctx.canvas.width, Game.ctx.canvas.height, 0, 0, Game.ctx.canvas.width, Game.ctx.canvas.height);

        renderInterface();
        setAimPos();
    }    
})();

Game.resources.load([
    "img/sprites.png",
    "img/models/playersprites.png",
    "img/models/monstersprites.png",
    "img/playerui.png",
    "img/models/playermodel.png",
    "img/models/playermodel64.png"
]);
//Game.resources.onReady(Game.init);

window.oncontextmenu = function (event) {
    event.preventDefault();
    event.stopPropagation();
    return false;
};
