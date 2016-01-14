"use strict";
function initCharacter() {
    var myString = document.getElementById("playerName").value;
    var re = /^[a-zA-Z]+$/;
    if (re.test(myString)) {
        document.getElementById("shadowbackground").className = "hidden";
        Game.socket.emit("createplayer", myString);
    } else {
        document.getElementById("nameerror").className = "show";
    }
}
function activeAction() {
    var skillPic = new Image();
    skillPic.src ="img/arrow.png";
    if (Game.player.currAction === "arrow") {
        Game.ctx.save();
        Game.ctx.translate(580, 636);
        Game.ctx.rotate(225*(Math.PI/180));
        Game.ctx.drawImage(skillPic, skillPic.width / -2, skillPic.height / -2);
        Game.ctx.restore();
    } else if (Game.player.currAction === "fireball") {
        skillPic.src ="img/fireball.png";
        Game.ctx.save();
        Game.ctx.translate(560, 626);
        Game.ctx.drawImage(skillPic, 0, 0);
        Game.ctx.restore();
    }
}
function drawAim() {
    var swordWidth = Game.player.weaponImage.width;
    var sinAngle = Math.sin(Game.mousePosition.degrees() * (Math.PI * 2) / 360);
    var cosAngle = Math.cos(Game.mousePosition.degrees() * (Math.PI * 2) / 360);
    var radAngle = Game.mousePosition.degrees() * (Math.PI * 2 / 360);
    var canvasWidth = Game.ctx.canvas.width;
    var canvasHeight = Game.ctx.canvas.height;


    //document.getElementById("sincos").innerHTML = "sinAngle: " + parseInt(sinAngle * 40) + " cosAngle: " + parseInt(cosAngle * 40) + "radAngle: " + radAngle;
    Game.ctx.save();
    Game.ctx.translate(canvasWidth / 2, canvasHeight / 2);
    Game.ctx.rotate(-radAngle);
    Game.ctx.drawImage(Game.player.weaponImage, -16, -16);

    //document.getElementById("sincos").innerHTML = "sinAngle: "+ parseInt(sinAngle*40)+" cosAngle: "+parseInt(cosAngle*40)+ "radAngle: "+radAngle;


    Game.ctx.restore();
}
function setAimPos() {
    var sinAngle = Math.sin(Game.mousePosition.degrees() * Math.PI / 180);
    var cosAngle = Math.cos(Game.mousePosition.degrees() * Math.PI / 180);
    Game.player.aimPos = [Game.player.x + parseInt(sinAngle * 45), Game.player.y + parseInt(cosAngle * 45)];

}
function checkProjectileCollision(){
    if(Game.foreignProjectiles.length > 0){
        for(var i in Game.foreignProjectiles){
            if (boxCollides(Game.player.x, Game.player.y, Game.player.width, Game.player.height, Game.foreignProjectiles[i].x, Game.foreignProjectiles[i].y, Game.foreignProjectiles[i].width(), Game.foreignProjectiles[i].height())) {
                Game.player.health -= parseInt((Math.random() * 25) + 1);
                console.log("projectile damage");
                Game.player.lastDamage = Date.now();
                //remove projectile after being hit
                Game.foreignProjectiles.splice(i, 1);
                Game.socket.emit("attacked", {attackType: "ranged", playerId: Game.player.id});
            }
        }
    }
}
function checkProjectiles(arr, type) {
    if (arr.length > 0){
        for (var i in arr) {
            if (isInsideCanvas(arr[i])) {
                arr[i].update();
            } else {
                arr.splice(i, 1);
                continue;
            }
            if(type === "local") {
                if (Game.remotePlayers.length > 0) {
                    for (var p in Game.remotePlayers) {
                        if (boxCollides(Game.remotePlayers[p].x, Game.remotePlayers[p].y, Game.remotePlayers[p].width, Game.remotePlayers[p].height, arr[i].x, arr[i].y, arr[i].width(), arr[i].height())) {
                            arr.splice(i, 1);
                        }
                    }
                }
            }
        }
    }
}
function playerById(id) {
    for (var i = 0; i < Game.remotePlayers.length; i++) {
        if (Game.remotePlayers[i].id == id) {
            return Game.remotePlayers[i];
        }
    };
    return false;
};
//function checkExamining() {
//    if (Game.Inspecting.timer > 0 && Game.Inspecting.showText !== null) {
//        Game.ctx.save();
//        Game.ctx.textAlign = 'center';
//        Game.ctx.fillStyle = 'white';
//        Game.ctx.lineWidth = 0.3;
//        Game.ctx.strokeStyle = 'black';
//        Game.ctx.font = 'bold 12pt Verdana';
//        Game.ctx.fillText(Game.Inspecting.showText, (Game.ctx.canvas.width / 2), (Game.ctx.canvas.height / 2) - 30);
//        Game.ctx.strokeText(Game.Inspecting.showText, (Game.ctx.canvas.width / 2), (Game.ctx.canvas.height / 2) - 30);
//        Game.ctx.restore();
//    }
//    if (Game.Inspecting.timer > 0) {
//        Game.Inspecting.timer -= 0.01;
//        if (Game.Inspecting.timer < 0) {
//            Game.Inspecting.timer = 0;
//        }
//    }
//}
//function rClickMenu() {
    //if ((!Game.mousePosition.leftClick && Game.mousePosition.rightClick)) {
    //    if (Game.mousePosition.pos[1] > 600) {
    //        Game.menu.showMenu(Game.mousePosition.pos);
    //        Game.menu.menuType = Game.menu.menuChoices[1];
    //        Game.menu.menuPosCurr = Game.mousePosition.pos;
    //    } else {
    //        Game.menu.showMenu(Game.mousePosition.pos)
    //        Game.menu.menuType = Game.menu.menuChoices[0];
    //        Game.menu.menuPosCurr = Game.mousePosition.pos;
    //    }
    //    Game.mousePosition.rightClick = false;
    //    Game.menu.focused = true;
    //}
    //if (Game.menu.focused) {
    //    var menuHover;
    //    if (Game.mousePosition.pos[0] > (Game.menu.menuPos[0] + Game.menu.lineWidth) && Game.mousePosition.pos[0] < ((Game.menu.menuPos[0] + Game.menu.menuSize[0])) - Game.menu.lineWidth) {
    //        if (Game.mousePosition.pos[1] > (Game.menu.menuPos[1] + Game.menu.lineWidth) && Game.mousePosition.pos[1] < ((Game.menu.menuPos[1] + Game.menu.menuSize[1])) - Game.menu.lineWidth) {
    //            if (Game.mousePosition.pos[1] > (Game.menu.menuPos[1] + Game.menu.lineWidth) && Game.mousePosition.pos[1] < ((Game.menu.menuPos[1] + Game.menu.lineWidth) + Game.menu.menuItemSize)) {
    //                menuHover = 1;
    //            } else if (Game.mousePosition.pos[1] > ((Game.menu.menuPos[1] + Game.menu.lineWidth) + (Game.menu.menuItemSize)) && Game.mousePosition.pos[1] < (((Game.menu.menuPos[1] + Game.menu.lineWidth) + Game.menu.menuItemSize) + (Game.menu.menuItemSize))) {
    //                menuHover = 2;
    //            } else if (Game.mousePosition.pos[1] > ((Game.menu.menuPos[1] + Game.menu.lineWidth) + (Game.menu.menuItemSize * 2)) && Game.mousePosition.pos[1] < (((Game.menu.menuPos[1] + Game.menu.lineWidth) + Game.menu.menuItemSize) + (Game.menu.menuItemSize * 2))) {
    //                menuHover = 3;
    //            }
    //        }
    //    }
    //    Game.menu.showMenu(Game.menu.menuPosCurr, menuHover);
    //}
//}
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
            } else if (count === 16) {
                invPos = [871, 683];
            } else if (count === 24) {
                invPos = [871, 716];
            } else if (count === 32) {
                return false;
            }

            Game.ctx.drawImage(Game.sprite, Game.player.inventory[i].gX, Game.player.inventory[i].gY, 32, 32, invPos[0] + (pos * 33), invPos[1], 32, 32);
            count += 1;
            pos = pos === 7 ? 0 : pos + 1;
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
function renderAttacks(){
    if(Game.player.lastAttack > 0 && Game.player.lastAttack < 0.2) {
        Game.ctx.save();
        Game.ctx.translate(Game.player.atkPos[0] - ((Game.player.x - ((Game.view[0] * Game.tileSize / 2))) + (Game.tileSize / 2)), Game.player.atkPos[1] - ((Game.player.y - ((Game.view[1] * Game.tileSize / 2))) + (Game.tileSize / 2)));

        Game.ctx.drawImage(Game.swingImg, 16, 16);
        Game.ctx.restore();
    }
    else if(Game.player.lastAttack > 1){
        Game.player.atkPos = [];
    }
}
function weaponTooltip(x,y, item){
    Game.ctx.save();
    Game.ctx.translate(x+15,y);
    Game.ctx.fillStyle = "black";
    Game.ctx.fillRect(0,0, 110, 110);

    Game.ctx.strokeStyle ="white";
    Game.ctx.beginPath();
    Game.ctx.lineTo(0,0);
    Game.ctx.lineTo(110,0);
    Game.ctx.lineTo(110,110);
    Game.ctx.lineTo(0,110);
    Game.ctx.closePath();
    Game.ctx.stroke();
    Game.ctx.fillStyle = "white";
    Game.ctx.fillText(item.name, 5,15);
    Game.ctx.fillText(item.desc, 5,30);
    Game.ctx.fillText(item.minMax, 5,45);
    if(insideSquare(Game.player, [item.x, item.y])){
        Game.ctx.fillStyle = "yellow";
        Game.ctx.fillText("Pick up item (E)", 18, 105);
        if(Game.controls.use){
            //add to inventory
            Game.socket.emit("player pickup", { itemName: item.name, playerId: Game.player.id });
            Game.player.inventory.push(Game.items[getItemByName(item.name)]);
            //then splice from in-game item array
            Game.socket.emit("remove item", { itemName: item.name });
            Game.items.splice(getItemByName(item.name, 1));
        }
    }
    Game.ctx.restore();
}
function mouseActions() {
    for(var i in Game.items){
        if((Game.mousePosition.igPos[0] >= Game.items[i].x && Game.mousePosition.igPos[0] <= Game.items[i].x+32) && (Game.mousePosition.igPos[1] >= Game.items[i].y && Game.mousePosition.igPos[1] <= Game.items[i].y+32)){
            weaponTooltip(Game.mousePosition.pos[0], Game.mousePosition.pos[1], Game.items[i]);
        }
    }
    if(Game.mousePosition.rightClick){

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
//function playerLooking(clickPos, mapCoords, layer, isItem, pickup) {
//    if (!isItem) {
//        for (var i = 0; i < layer.length; i++) {
//            if (layer[i] > 0) {
//                if (boxCollides(clickPos[0], clickPos[1], 1, 1, Game.mapCoords[i][0], Game.mapCoords[i][1], 32, 32)) {
//                    Game.Inspecting.showText = "You see " + Game.tileName[layer[i]] + ". position: " + Game.mapCoords[i];
//                    Game.Inspecting.timer = 2;
//                    return true;
//                }
//            }
//        }
//    } else {
//        for (var i = 0; i < layer.length; i++) {
//            if (boxCollides(clickPos[0], clickPos[1], 1, 1, layer[i].x, layer[i].y, 32, 32)) {
//                if (!pickup) {
//                    Game.Inspecting.showText = "You see " + layer[i].name + ". Attack: " + layer[i].minMax[0] + "-" + layer[i].minMax[1];
//                    Game.Inspecting.timer = 2;
//                }
//                return true;
//            }
//        }
//    }
//    return false;
//}
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
    if(Game.items.length > 0) {
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
//function loadItems() { MOVED TO SERVER-SIDE
//    var count = 0;
//    for (var y = 0; y < Game.theMap.mapData.tilecount[1]; y++) {
//        for (var x = 0; x < Game.theMap.mapData.tilecount[0]; x++) {
//            if (Game.theMap.itemMap.data[count] != 0) {
//                var currGid = Game.theMap.itemMap.data[count];
//                var gx = (((currGid - 1) % (Game.theMap.mapData.tileSets[0].imagewidth / Game.tileSize)) * Game.tileSize);
//                var gy = ((parseInt(currGid / (Game.theMap.mapData.tileSets[0].imagewidth / Game.tileSize))) * Game.tileSize);
//                Game.items.push(new Game.Item(x * Game.tileSize, y * Game.tileSize, gx, gy, "osten" + count, "yeez", [10, 20]));
//            }
//            count++;
//        }
//    }
//}
function insideSquare(obj, XY, checkSize) {
    var numTiles = checkSize || 1;
    var sqW = Game.tileSize;
    var sqH = Game.tileSize;
    var north = [XY[0], XY[1] - (sqH * numTiles)];
    var northeast = [XY[0] + (sqW * numTiles), XY[1] - (sqH * numTiles)];
    var east = [XY[0] + (sqW * numTiles), XY[1]];
    var southeast = [XY[0] + (sqW * numTiles), XY[1] + (sqH * numTiles)];
    var south = [XY[0], XY[1] + (sqH * numTiles)];
    var southwest = [XY[0] - (sqW * numTiles), XY[1] + (sqH * numTiles)];
    var west = [XY[0] - (sqW * numTiles), XY[1]];
    var northwest = [XY[0] - (sqW * numTiles), XY[1] - (sqH * numTiles)];
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
            Game.mousePosition.rightClick = true;
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
            Game.mousePosition.rightClick = false;
        }
    }
}
//todo
function updateEquipment() { };
//todo
function updateInventory() { };