"use strict";

//Socket receivers


//Socket functions
(function () {

    Game.createItemList = function (data){
        console.log("copying itemlist"+data.itemlist);
//        Game.items = data;
        for(var i in data.itemlist){
            Game.items.push(new Game.Item(data.itemlist[i].x, data.itemlist[i].y, data.itemlist[i].gX, data.itemlist[i].gY, data.itemlist[i].name, data.itemlist[i].desc, data.itemlist[i].minMax));
        }
    }

    Game.deleteItem = function (data){
        console.log("splice item"+getItemByName(data.itemName));
        Game.items.splice(getItemByName(data.itemName), 1);
    }
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
        Game.socket.emit({ health: Game.player.health });
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
            console.log("I have died");
            delete Game.player;
            //initCharacter();
            playerDeath();
        } else {
            Game.remotePlayers.splice(Game.remotePlayers.indexOf(data.id), 1);
        }
    }
    Game.renderItem = function (data) {
//        var newItem = new Game.Item(data.x, data.y, data.gX, data.gY, data.name, data.desc, data.minMax)

    }
    Game.unrenderItem = function (data) {
        var itemNumber = getItemByName(data.name)
        Game.items.splice(itemNumber, 1);
    }

    Game.enemyProjectile = function (data) {
        Game.foreignProjectiles.push(new Game.Projectiled(data.startX, data.startY, data.type, data.angle, data.startX, data.startY));
    }

    Game.pingTime = function(data){
        document.getElementById("latency").innerHTML = Date.now() - data.pong + "ms";
    }
})();
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
    Game.socket.on("remove item", Game.deleteItem);
    Game.socket.on("createitemlist", Game.createItemList);
    Game.socket.on("foreign projectile", Game.enemyProjectile);
    Game.socket.on("pong", Game.pingTime);
})();
