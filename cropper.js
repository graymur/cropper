var exec = require('child_process').exec;

function Cropper() {
    this.command = [];
    this.source = undefined;
    this.target = undefined;
    this.quality = 100;
    this.imageMagicPath = 'convert';
}

Cropper.prototype.RESIZE_PROPORTIONAL = 1;
Cropper.prototype.RESIZE_STRICT = 2;
Cropper.prototype.RESIZE_HEIGHT = 3;
Cropper.prototype.RESIZE_WIDTH = 4;

/**
 * @param path
 * @returns {Cropper}
 */
Cropper.prototype.setIMPath = function (path) {
    this.imageMagicPath = String(path);
    return this;
};

/**
 * @param source
 * @returns {Cropper}
 */
Cropper.prototype.setSource = function (source) {
    this.source = String(source);
    return this;
};

/**
 * @param target
 * @returns {Cropper}
 */
Cropper.prototype.setTarget = function (target) {
    this.target = String(target);
    return this;
};

/**
 * @param quality
 * @returns {Cropper}
 */
Cropper.prototype.setQuality = function (quality) {
    this.quality = Number(quality);
    return this;
};

/**
 * @returns {Promise}
 */
Cropper.prototype.commit = function () {
    return new Promise((resolve, reject) => {
        if (!this.source) {
            reject('No source specified');
        }

        if (!this.target) {
            reject('No target specified');
        }

        var command = this._buildCommand();

        exec(command, (error, stdout, stderr) => {
            if (error || stderr.length > 0) {
                reject(error);
            } else {
                resolve(this.target);
            }
        });
    });
};

/* ------------------- */

/**
 * @param width
 * @param height
 * @param mode
 * @returns {Cropper}
 */
Cropper.prototype.resize = function (width, height, mode) {
    mode = mode || this.RESIZE_PROPORTIONAL;

    switch (mode) {
        default:
        case this.RESIZE_PROPORTIONAL:
            this._addCommand('-geometry ' + width + 'x' + height);
        break;

        case this.RESIZE_STRICT:
            this._addCommand('-geometry ' + width + 'x' + height + '!');
        break;

        case this.RESIZE_HEIGHT:
            this._addCommand('-geometry x' + height);
        break;

        case this.RESIZE_WIDTH:
            this._addCommand('-geometry ' + width + 'x');
        break;
    }

    return this;
};

/**
 * @param x
 * @param y
 * @param width
 * @param height
 * @returns {Cropper}
 */
Cropper.prototype.crop = function (x, y, width, height) {
    this._addCommand('-crop ' + width + 'x' + height + '+' + x + '+' + y);
    return this;
};

/**
 * @param size
 * @returns {Cropper}
 */
Cropper.prototype.square = function(size) {
    return this.cutIntoSize(size, size);
};

/**
 * @param size
 * @param bgColor
 * @returns {*}
 */
Cropper.prototype.putIntoSquare = function (size, bgColor) {
    return this.putIntoSize(size, size, bgColor);
};

/**
 * @param width
 * @param height
 * @param bgColor
 * @returns {Cropper}
 */
Cropper.prototype.putIntoSize = function(width, height, bgColor) {
    this._addCommand('-resize ' + width + 'x' + height + '^');
    this._addCommand('-gravity center -extent ' + width + 'x' + height);
    return this;
};

/**
 * @param width
 * @param height
 * @returns {Cropper}
 */
Cropper.prototype.cutIntoSize = function(width, height) {
    this._addCommand('-resize "' + width + 'x' + height + '^" -gravity center -crop ' + width + 'x' + height + '+0+0 +repage');

    return this;
};

/**
 * @param amount
 * @returns {Cropper}
 */
Cropper.prototype.sharpen = function(amount) {
    amount = amount || 1;
    this._addCommand('-sharpen ' + amount + 'x' + amount);
    return this;
};

/**
 * @param top
 * @param right
 * @param bottom
 * @param left
 * @returns {Cropper}
 */
Cropper.prototype.cutEdgesByPercentage = function(top, right, bottom, left) {
    top = top || 0;
    right = right || 0;
    bottom = bottom || 0;
    left = left || 0;

    let xCrop = 100 - top - bottom;
    let yCrop = 100 - left - right;

    this._addCommand('-gravity Center -crop ' + xCrop + '%x' + yCrop + '%+0+0');
    return this;
};

Cropper.prototype.grayscale = function () {
    this._addCommand('-colorspace gray');
    return this;
};

/* ------------------- */

/**
 * @param command
 * @param clear
 * @private
 */
Cropper.prototype._addCommand = function (command, clear) {
    if (clear) {
        this.command = [];
    }

    this.command.push(String(command));
};

/**
 * @returns {string}
 * @private
 */
Cropper.prototype._buildCommand = function () {
    let cloned = this.command.slice();

    cloned.push('"' + this.source + '" "' + this.target + '"');
    cloned.unshift('-quality ' + this.quality);
    cloned.unshift('"' + this.imageMagicPath + '"');

    return cloned.join(' ');
};

module.exports = Cropper;