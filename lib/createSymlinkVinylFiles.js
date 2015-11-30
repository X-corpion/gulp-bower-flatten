(function() {
    'use strict';

    var color = require('colors/safe'),
        fs = require('fs'),
        File = require('vinyl'),
        logger = require('gulplog'),
        path = require('path'),
        through = require('through2')
    ;

    var createSymlinkVinylFiles = function(opts) {
        return through.obj(function(file, encoding, cb) {
            if (file.isStream()) {
                return cb();
            }

            var projectHome = file.cwd;                                         // current repo home (.)
            var depHome = file.base;                                            // bower_components
            var pathRelativeToDepHome = path.relative(depHome, file.path);      // bower_components/foo/bar -> foo/bar
            var depPathComponents = pathRelativeToDepHome.split(path.sep);

            var findCommonAncestor = function(depPathComponents, index, currentPathInBowerDir, currentPathInProjectHome) {
                if (index >= depPathComponents.length) {
                    return cb();
                }

                // traverse the dependency path and the path in project home simutaneously until the common ancester is found
                currentPathInBowerDir = path.join(currentPathInBowerDir, depPathComponents[index]);
                currentPathInProjectHome = path.join(currentPathInProjectHome, depPathComponents[index]);
                var src = path.join(projectHome, depHome, currentPathInBowerDir);
                var target = path.join(projectHome, currentPathInProjectHome);
                fs.lstat(target, function(e, stat) {
                    // compute the src path that the symlink should use
                    // need to grab the parent dir of target otherwise node will treat the leaf as the base directory
                    var linkSrc = path.relative(path.dirname(target), src);
                    if (e) {
                        // target doesn't exist so let's create the symlink here
                        var symlink = new File({
                            cwd: opts.cwd,
                            base: opts.base,
                            path: target
                        });
                        symlink.src = linkSrc;
                        return cb(null, symlink);
                    }
                    // link/file already exists
                    if (!stat.isSymbolicLink()) {
                        return findCommonAncestor(depPathComponents, index + 1, currentPathInBowerDir, currentPathInProjectHome);
                    }
                    fs.readlink(target, function(e, linkString) {
                        if (!e && linkString !== linkSrc) {
                            logger.warn(color.yellow('Attempt to link %s failed: %s already exists and is linked to %s.' +
                                ' This indicates a conflict and the attempt is ignored.'),
                                linkSrc, target, linkString);
                        }
                        cb();
                    });
                });
            };

            var initialProjectHomePathIndex = opts.skipDepRootDir ? 1 : 0;
            var initialDepPath = opts.skipDepRootDir ? depPathComponents[0] : '.';
            findCommonAncestor(depPathComponents, initialProjectHomePathIndex, initialDepPath, '.');
        });
    };


    module.exports = createSymlinkVinylFiles;
})();