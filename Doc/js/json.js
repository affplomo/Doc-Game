"use strict";
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