var util = require("util"),
    io = require("socket.io"),
    Player = require("./Entities").Player,
    Monster = require("./Entities").Monster,
    GameMap = require("./Entities").GameMap,
    Item = require("./Entities").Item,
    Projectile = require("./Entities").Projectile;

    var socket,
        players,
        oldPlayers,
        theMap,
        mapCoords,
        monsterList,
        itemList,
        collisionList,
        socketList,
        clients,
        view,
        tileSize,
        projectileList;

function init(){
    util.log("Init.js");
    existingPlayers = [];
    players = [];
    mapCoords = [];
    socketList = [];
    clients = {};
    view = [36, 24];
    tileSize = 32;

    monsterList = [];
    itemList = [];
    projectileList = [];
    collisionMap = require("./map/collisionmap.json");

    loadUtilities();

    socket = io.listen(8000);

    socket.configure(function() {
    socket.set("transports", ["websocket"]);
    socket.set("log level", 1);
    });

    setEventHandlers();
}

var setEventHandlers = function() {
    util.log("Seteventhandlers");
    socket.sockets.on("connection", onSocketConnection);
};




//Main function, socket-handling (socket receiver) ("name of socket transmit", followed by what function to call)
function onSocketConnection(client) {
    util.log("onSocketConnection"+client);
    //Todo: Receive information about the player, new or old, and set it up
    util.log("New player has connected: " + client.id);
    //
    client.on("createplayer", createPlayer);
    client.on("disconnect", onClientDisconnect);
    client.on("new player", onNewPlayer);
    client.on("move player", onMovePlayer);
    client.on("itemtaken", itemTaken);
    client.on("itemdropped", itemDropped);
    client.on("attacked", playerAttacked);
    client.on("getplayerhealth", getPlayerHealth);
    client.on("player pickup", playerPickup);
    client.on("remove item", removeItem);
    client.on("new projectile", newProjectile);
    client.on("ping", latencyTimer);
};
function latencyTimer(data){
    this.emit("pong", {pong: data.ping});
}
function playerPickup(data){
util.log(socketList);
}

function newProjectile(data){
    projectileList.push(new Projectile(data.startX, data.startY, data.type, data.angle, data.startX, data.startY));
    this.broadcast.emit("foreign projectile", {x:data.startX, y:data.startY, type:data.type, angle:data.angle, startX:data.startX, startY:data.startY});
}
function removeItem(data){
    itemList.splice(getItemByName(data.itemName), 1);
    this.broadcast.emit("remove item", {itemName: data.itemName});
}
function createPlayer(name) {
    /*todo: check if player is on existing account*/
    var createnewPlayer = new Player(960, 960);
    createnewPlayer.id = this.id;
    createnewPlayer.name = name;
    createnewPlayer.startHealth = 350;
    createnewPlayer.health = 350;

    this.emit("createplayer", createnewPlayer);
    this.emit("createitemlist", {itemlist: itemList});
    this.broadcast.emit("new player", { id: createnewPlayer.id, name: createnewPlayer.name, x: createnewPlayer.x, y: createnewPlayer.y, starthealth: createnewPlayer.startHealth, health: createnewPlayer.health });

    if (players.length > 0) {
        var i, existingPlayer;
        for (i = 0; i < players.length; i++) {
                existingPlayer = players[i];
                this.emit("new player", { id: existingPlayer.id, name: existingPlayer.name, x: existingPlayer.x, y: existingPlayer.y, starthealth: existingPlayer.startHealth, health: existingPlayer.health });
        };
    }
    players.push(createnewPlayer);
    socketList.push(this);
    util.log("id" +this.id);
}

function getPlayerHealth(data){
    if(players.length>0){
    var i, existingPlayer;
    for (i = 0; i < players.length; i++) {
        existingPlayer = players[i];
        this.emit("returnplayerhealth", {health: existingPlayer.health});
    };
    }else{
        util.log("Player not found: "+this.id);
    }
}

function playerAttacked(data){
    if(data.attackType === "melee") {
        var atkPos = data.pos;
        if (players.length > 0) {
            var existingPlayer;
            for (var i = 0; i < players.length; i++) {
                existingPlayer = players[i];
                if (boxCollides(existingPlayer.x, existingPlayer.y, 32, 32, atkPos[0], atkPos[1], 16, 16)) {
                    var damage = parseInt((Math.random() * 50) + 10);
                    existingPlayer.health -= damage;
                    try {
                        for (var i = 0; i < socketList.length; i += 1) {
                            if (existingPlayer.health >= 1) {
                                socketList[i].emit("playerattacked", { id: existingPlayer.id, dmg: damage, isalive: existingPlayer.isAlive });
                            } else {
                                socketList[i].emit("playerkilled", { id: existingPlayer.id });
                                players.splice(i, 1);
                            }
                        }
                    } catch (ex) {
                        util.log(ex);
                    }
                }
            }
        } else {
            util.log("Player not found: " + this.id);
        }
    }else if(data.attackType==="ranged"){
        var damage = parseInt((Math.random() * 50) + 10);
        playerById(data.playerId).health -= damage;
        try {
            for (var i = 0; i < socketList.length; i += 1) {
                if (playerById(data.playerId).health >= 1) {
                    socketList[i].emit("playerattacked", { id: data.playerId, dmg: damage, isalive: playerById(data.playerId).isAlive });
                    util.log("player ranged attacked id:" + data.playerId +". dmg: "+ damage);
                } else {
                    socketList[i].emit("playerkilled", { id: data.playerId });
                    for(var pl in players) {
                        if(players[pl].id === data.playerId) {
                            players.splice(pl, 1);
                        }
                    }
                }
            }
        } catch (ex) {
            util.log(ex);
        }
    }
}

function itemTaken(data){
    util.log(this.id + " picked up item: "+data.name +" "+ data.x+" "+ data.y+" "+ data.gx+" "+ data.gy+" "+ data.minmax);
}

function itemDropped(data){
    util.log(this.name + " dropped item: "+data.name +" "+ data.x+" "+ data.y+" "+ data.gx+" "+ data.gy+" "+ data.minmax);
}

function onClientDisconnect() {
    var removePlayer = playerById(this.id);

    if (!removePlayer) {
        util.log("Player not found: " + this.id);
        return;
    }

    players.splice(players.indexOf(removePlayer), 1);
    this.broadcast.emit("remove player", {id: this.id});
    socketList.splice(this, 1);
};

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

function onNewPlayer(data) {
    var newPlayer = new Player(630,1150);
    newPlayer.id = this.id;
    newPlayer.name = "olle";
    newPlayer.startHealth = 350;

    this.broadcast.emit("new player", { id: newPlayer.id, name: newPlayer.name, x: newPlayer.x, y: newPlayer.y });
    this.emit("new player", { id: newPlayer.id, name: newPlayer.name, x: newPlayer.x, y: newPlayer.y });

    players.push(newPlayer);
    socketList.push(this);
};

function onMovePlayer(data) {
    var movePlayer = playerById(this.id);
    var currPlayer;
    if (!movePlayer) {
        util.log("OnMovePlayer; Player not found: " + this.id);
        return;
    }

    //todo add server-sided collisiontesting to avoid cheating
    movePlayer.x = data.x;
    movePlayer.y = data.y;
//    try {
//        for (var i = 0; i < socketList.length; i += 1) {
//            if (movePlayer.id === socketList[i].id) {
//                currPlayer = socketList[i];
//            }
//
//
////        for (var i = 0; i < itemList.length; i++) {
////            var currItem = itemList[i];
////            if (isInsideCanvas(movePlayer, currItem)) {
////                currPlayer.emit("renderitem", currItem);
////            }
////        }
////        currPlayer.emit("renderitem", itemList);
//        }
//    } catch (ex) {
//        util.log("Error with socketlist. Exception: " + ex);
//    }
    this.broadcast.emit("move player", { id: movePlayer.id, x: movePlayer.x, y: movePlayer.y });
};

function playerById(id){
    for(var i = 0; i < players.length; i++){
        if(players[i].id === id){
            return players[i];
        }
    }
    return false;
}

function playerBySID(id) {
    for (var i = 0; i < socketList.length; i++) {
        if (socketList[i].id === id) {
            return i;
        }
    }
    return false;
}

function getItemByName(itemname) {
    for (var i = 0; i < itemList.length; i++) {
        if (itemList[i].name === itemname) {
            return i;
        }
    }
    return false;
}

function loadUtilities(){
    var monsterJSON = require("./map/monstermap.json");
    var itemJSON = require("./map/itemmap.json");

    var monsterMap = monsterJSON.layers[0].data;
    var itemMap = itemJSON.layers[0].data;

     loadMonsters(monsterMap);
     loadItems(itemMap);
}

function loadMonsters(map) {
    var mapTilesXY = [200,200];
    var mapTileDimension = [32,32];
    var spriteDimensions = [2048, 1024];
    var count = 0;
   for (var y = 0; y < mapTilesXY[1]; y++) {
        for (var x = 0; x < mapTilesXY[0]; x++) {
            if (map[count] !== 0) {
                if (map[count] === 2011) {
                     monsterList.push(new Monster(x * mapTileDimension[0], y * mapTileDimension[1]));
                }
            }
            mapCoords[count] = [x * mapTileDimension[0], y * mapTileDimension[1]];
            count++;
        }
    }
}

function loadItems(map) {
    //TODO: create a jsonfile with unique item information
    var mapTilesXY = [200,200];
    var mapTileDimension = [32,32];
    var spriteDimensions = [2048, 1024];
    var count = 0;
    for (var y = 0; y < mapTilesXY[1]; y++) {
        for (var x = 0; x < mapTilesXY[0]; x++) {
            if (map[count] != 0) {
                var currGid = map[count];
                var gx = (((currGid - 1) % (spriteDimensions[0] / mapTileDimension[0])) * mapTileDimension[0]);
                var gy = ((parseInt(currGid / (spriteDimensions[0] / mapTileDimension[0]))) * mapTileDimension[0]);
                itemList.push(new Item(x * mapTileDimension[0], y * mapTileDimension[1], gx, gy, "osten" + count, "yeez", [10, 20]));
            }
            count++;
        }
    }
}

function isInsideCanvas(player, entity) {
    var leftSideX = (player.x - ((view[0] * tileSize / 2))) + 16;
    var RightSideX = (player.x + ((view[0] * tileSize / 2))) + 16;
    var TopSideY = (player.y - ((view[1] * tileSize / 2))) + 16;
    var BottomSideY = (player.y + ((view[1] * tileSize / 2))) + 16;
    return ((entity.x + 31) > leftSideX && entity.x < RightSideX && (entity.y + 31) > TopSideY && entity.y < BottomSideY);
}


init();
