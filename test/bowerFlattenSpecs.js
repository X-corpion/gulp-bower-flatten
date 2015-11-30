(function() {
    'use strict';

    var createSymlinkVinylFiles = require('../lib/createSymlinkVinylFiles'),
        File = require('vinyl'),
        mock = require('mock-fs')
    ;

    require('should');

    describe('create symlink vinyl files', function() {

        beforeEach(function() {
            mock({
                'bower_components/foo': {
                    'bar.txt': 'bar'
                }
            });
        });

        afterEach(function() {
            mock.restore();
        });

        it('should ignore the root directory of each dependency by default', function(done) {
            var stream = createSymlinkVinylFiles({
                skipDepRootDir: true
            });

            stream.write(new File({
                cwd: '.',
                base: './bower_components',
                path: './bower_components/foo/bar.txt'
            }));

            stream.on('data', function(file) {
                file.path.should.equal('bar.txt');
                file.src.should.equal('bower_components/foo/bar.txt');
                done();
            });
        });

        it('should preserve the root directory of each dependency if skip is turned off', function(done) {
            var stream = createSymlinkVinylFiles({
                skipDepRootDir: false
            });

            stream.write(new File({
                cwd: '.',
                base: './bower_components',
                path: './bower_components/foo/bar.txt'
            }));

            stream.on('data', function(file) {
                file.path.should.equal('foo');
                file.src.should.equal('bower_components/foo');
                done();
            });
        });


        it('should recursively find the toppest possible parent directory' +
            ' to create the symlink if part of the path is already there', function(done) {

            mock({
                'foo': {}
            });

            var stream = createSymlinkVinylFiles({
                skipDepRootDir: false
            });

            stream.write(new File({
                cwd: '.',
                base: './bower_components',
                path: './bower_components/foo/bar.txt'
            }));

            stream.on('data', function(file) {
                file.path.should.equal('foo/bar.txt');
                file.src.should.equal('../bower_components/foo/bar.txt');
                done();
            });

        });

    });
})();
