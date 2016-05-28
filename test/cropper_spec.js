var path = require('path');
var fs = require('fs');
var assert = require('chai').assert;
var Cropper = require('../cropper.js');
var sizeOf = require('image-size');

// yes, I use Windows, but it defaults to 'convert', so you may comment
// this line, if you run tests on *nix
var IMPath = path.normalize('D:/www/util/ImageMagick/convert.exe');

// source image, 1080x897px jpeg
var source = path.normalize(__dirname + '/img/sample.jpg');

// target image
var target = path.normalize(__dirname + '/img/resized.jpg');

function get() {
    return (new Cropper())
        .setIMPath(IMPath)
        .setSource(source)
        .setTarget(target)
    ;
}

afterEach(function() {
    try {
        fs.unlinkSync(target);
    } catch (e) {}
});

describe('Crop images', () => {
    it ('Generates right command', function () {
        var instance = get().resize(100, 100);

        assert.equal(
            instance._buildCommand(),
            '"' + IMPath + '" -quality 100 -geometry 100x100 "' + source + '" "' + target + '"'
        );
    });

    it('Resizes to 100px proportionally', function (done) {
        var instance = get();

        instance
            .resize(100, 100)
            .commit()
            .then(function (target) {
                var dimensions = sizeOf(target);

                assert.deepEqual(dimensions, {
                    width: 100,
                    height: 83,
                    type: 'jpg'
                });

                done();
            }).catch(function (error) {
                done(error);
            });
    });

    it('Resizes to 100px height, reducing width proportionally', function (done) {
        var instance = get();

        return instance
            .resize(100, 100, instance.RESIZE_HEIGHT)
            .commit()
            .then(function (target) {
                var dimensions = sizeOf(target);

                assert.deepEqual(dimensions, {
                    width: 120,
                    height: 100,
                    type: 'jpg'
                });

                done();
            }).catch(function (error) {
                done(error);
            });
    });

    it('Resizes to 100px strict, distorting proportions', function (done) {
        var instance = get();

        return instance
            .resize(100, 100, instance.RESIZE_STRICT)
            .commit()
            .then(function (target) {
                var dimensions = sizeOf(target);

                assert.deepEqual(dimensions, {
                    width: 100,
                    height: 100,
                    type: 'jpg'
                });

                done();
            }).catch(function (error) {
                done(error);
            });
    });

    it('Crops 300x300px portion of an image starting at x = 50 and y = 50', function (done) {
        var instance = get();

        return instance
            .crop(50, 50, 300, 300)
            .commit()
            .then(function (target) {
                var dimensions = sizeOf(target);

                assert.deepEqual(dimensions, {
                    width: 300,
                    height: 300,
                    type: 'jpg'
                });

                done();
            }).catch(function (error) {
                done(error);
            });
    });

    it('Cuts image to 100px square, removing portions of an image', function (done) {
        var instance = get();

        return instance
            .square(100)
            .commit()
            .then(function (target) {
                var dimensions = sizeOf(target);

                assert.deepEqual(dimensions, {
                    width: 100,
                    height: 100,
                    type: 'jpg'
                });

                done();
            }).catch(function (error) {
                done(error);
            });
    });

    it('Puts image into to 100px square adding white background', function (done) {
        var instance = get();

        return instance
            .putIntoSquare(100)
            .commit()
            .then(function (target) {
                var dimensions = sizeOf(target);

                assert.deepEqual(dimensions, {
                    width: 100,
                    height: 100,
                    type: 'jpg'
                });

                done();
            }).catch(function (error) {
                done(error);
            });
    });

    it('Puts image into to size of 300x400px, adding white background', function (done) {
        var instance = get();

        return instance
            .putIntoSize(300, 400)
            .commit()
            .then(function (target) {
                var dimensions = sizeOf(target);

                assert.deepEqual(dimensions, {
                    width: 300,
                    height: 400,
                    type: 'jpg'
                });

                done();
            }).catch(function (error) {
                done(error);
            });
    });

    it('Cuts image into to size of 300x400px removing portions of an image', function (done) {
        var instance = get();

        return instance
            .cutIntoSize(300, 400)
            .commit()
            .then(function (target) {
                var dimensions = sizeOf(target);

                assert.deepEqual(dimensions, {
                    width: 300,
                    height: 400,
                    type: 'jpg'
                });

                done();
            }).catch(function (error) {
                done(error);
            });
    });

    it('Removes percentage of and image from each size, might be used to remove unnecessary borders from an image', function (done) {
        var instance = get();

        return instance
            .cutEdgesByPercentage(10, 10, 10, 10)
            .commit()
            .then(function (target) {
                var dimensions = sizeOf(target);

                assert.deepEqual(dimensions, {
                    width: 864,
                    height: 718,
                    type: 'jpg'
                });

                done();
            }).catch(function (error) {
                done(error);
            });
    });
});