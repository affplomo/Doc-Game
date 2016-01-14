
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
    };

    Sprite.prototype = {
        update: function (dt) {
            this._index += this.speed * dt;
        },

        render: function (ctx, dir, input, isPlayer, lastDamage) {
            var now = Date.now();
            var timeSince = (now - lastDamage) / 1000;
            var takingDamage = false;
            var damageTime = 2;

            if (timeSince < damageTime) {
                takingDamage = true;
            }
            else {
                takingDamage = false;
            }
            var frame;

            if (this.speed > 0) {
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

            var x = this.pos[0];
            var y = this.pos[1];
                        
                switch (dir) {
                    case "left":
                        x += frame * this.size[0] + 288;
                        break;
                    case "right":
                        x += frame * this.size[0] + 96;
                        break;
                    case "up":
                        x += frame * this.size[0];
                        break;
                    case "down":
                        x += frame * this.size[0] + 60;
                        break;
            }

            if (takingDamage) {
                if (timeSince < 0.3) { }
                else if (timeSince > 0.3 && timeSince < 0.6) {
                    ctx.drawImage(resources.get(this.url),
                              x, y,
                              this.size[0], this.size[1],
                              0, 0,
                              this.size[0], this.size[1]);
                } else if (timeSince > 0.6 && timeSince < 0.9) { }
                else if (timeSince > 0.9 && timeSince < 1.2) {
                    ctx.drawImage(resources.get(this.url),
                             x, y,
                             this.size[0], this.size[1],
                             0, 0,
                             this.size[0], this.size[1]);
                } else if (timeSince > 1.2 && timeSince < 1.5) { }
                else if (timeSince > 1.5 && timeSince < 1.8) {
                    ctx.drawImage(resources.get(this.url),
                             x, y,
                             this.size[0], this.size[1],
                             0, 0,
                             this.size[0], this.size[1]);
                }
            } else {
                ctx.drawImage(resources.get(this.url),
                              x, y,
                              this.size[0], this.size[1],
                              0, 0,
                              this.size[0], this.size[1]);
            }
        }
    };

    window.Sprite = Sprite;
})();