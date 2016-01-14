"use strict";
window.Game = {};

Game.lastTime = Date.now();
Game.fps = 60;
Game.ival = 1000 / Game.fps;
Game.since = 0;
Game.msTimer = Date.now();
//Game.projectiles = [];
try {
    //Game.socket = io.connect("http://localhost", { port: 8000, transports: ["websocket"] });
    //Game.socket = io.connect("http://85.226.127.203", {
    Game.socket = io.connect("http://localhost", {
        port: 8000,
        transports: ["websocket"],
        'reconnect': true,
        'reconnection delay': 500,
        'max reconnection attempts': 10 });
    console.log("connection established.");
} catch (ex) {
    console.log("Could not connect to the server or the server is offline. Please try again later.");
}

window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };
})();

//event-handlers
var setEventHandlers = function () {
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
            case 69:
                Game.controls.use = true;
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
            case 69:
                Game.controls.use = false;
                e.preventDefault();
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
            if (Game.player.currAction === "arrow") {
                Game.player.currAction = "fireball";
            } else {
                Game.player.currAction = "arrow";
            }
        } else {
            if (Game.player.currAction === "arrow") {
                Game.player.currAction = "fireball";
            } else {
                Game.player.currAction = "arrow";
            }
        }
    }, false);

};
