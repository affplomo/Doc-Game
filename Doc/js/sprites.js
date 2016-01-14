"use strict";
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
                var frame = this.frames[idx % max];

                if (this.once && idx >= max) {
                    this.done = true;
                    return;
                }
            }
            else {
                frame = 0;
            }

            var x = this.pos[0] + frame * this.size[0];
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