"use strict";
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