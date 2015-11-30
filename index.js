(function() {
    'use strict';

    var shell = require('gulp-shell'),

        bowerSrc = require('./lib/bowerSrc'),
        createSymlinkVinyl = require('./lib/createSymlinkVinylFiles'),
        symlink = require('./lib/symlink')
    ;

    var flatten = {};

    flatten.link = function(opts) {
        opts = opts || {
            skipDepRootDir: true
        };
        return function() {
            return bowerSrc(opts)
                .pipe(createSymlinkVinyl(opts))
                .pipe(symlink)
            ;
        };
    };

    flatten.unlink = function(opts) {
        opts = opts || {
            base: '.'
        };
        // TODO: windows support?
        return shell.task(['find ' + opts.base + ' -type l | xargs rm']);
    };

    module.exports = flatten;
})();
