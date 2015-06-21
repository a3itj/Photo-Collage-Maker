module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        less: {

            options: {
                paths: ["app/css"]
            },

            src: {
                // no need for files, the config below should work
                expand: true,
                cwd: 'app/css/',
                src: [
                    '**/*.less'
                ],
                ext: '.css',
                dest: 'app/css/'
            }
        },
        cssmin: {
            target: {
                files: [{
                    expand: true,
                    cwd: 'app/css',
                    src: ['**/*.css', '!**/*.min.css'],
                    dest: 'app/css',
                    ext: '.min.css'
                }]
            }
        },
        uglify: {
            my_target: {
                files: {
                    'app/js/gallery.min.js': ['app/js/gallery.js']
                }
            }
        },
        watch: {
            scripts: {
                files: ['**/*.less'],
                tasks: ['less', 'cssmin'],
                options: {
                    spawn: false,
                },
            },
        }

    });

    // Load the plugins
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Default task(s).
    grunt.registerTask('default', ['less', 'cssmin', 'uglify']);
    //grunt.registerTask('watch', [ 'watch' ]);

};
