(function() {
    'use strict';

    var color = require('colors/safe'),
        fs = require('fs'),
        logger = require('gulplog'),
        through = require('through2')
    ;

    var symlink = through.obj(function(file, encoding, cb) {
        if (!file.src) {
            return cb();
        }
        fs.symlink(file.src, file.path, function(e) {
            if (e) {
                if (e.errno !== 'EEXIST') {
                    logger.error(color.red('Failed to create link %s to %s: %s'),
                        file.path, file.src, e);
                }
                return cb();
            }
            logger.info(color.gray('Flattening dependency: Linked %s to %s'),
                file.path, file.src);
            return cb(null, file);
        });
    });

    module.exports = symlink;
})();