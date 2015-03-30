module.exports = (grunt) ->
    grunt.config.init
        compass:
            example:
                options:
                    sassDir: 'example'
                    cssDir: 'example'
                    outputStyle: 'compressed'
            src:
                options:
                    sassDir: 'src'
                    cssDir: 'dist'
                    outputStyle: 'compressed'

        coffee:
            source:
                files:
                    'dist/angular-form-builder.js': ['src/builder/module.coffee', 'src/form/module.coffee','src/**/*.coffee']
            lightSource:
                files:
                    'dist/angular-form-builder-light.js': ['src/form/module.coffee', 'src/provider.coffee', 'src/services.coffee', 'src/form/*.coffee']
            components:
                files:
                    'dist/angular-form-builder-components.js': ['components/*.coffee']
            demo:
                files:
                    'example/demo.js': 'example/demo.coffee'

        uglify:
            build:
                files:
                    'dist/angular-form-builder.min.js': 'dist/angular-form-builder.js'
                    'dist/angular-form-builder-light.min.js': 'dist/angular-form-builder-light.js'
                    'dist/angular-form-builder-components.min.js': 'dist/angular-form-builder-components.js'

        watch:
            options:
                spawn: no
#                livereload: yes
            compass:
                files: ['example/*.scss', 'src/*.scss']
                tasks: ['compass']
            coffee:
                files: ['src/**/*.coffee', 'components/*.coffee', 'example/*.coffee']
                tasks: ['coffee']

        connect:
            server:
                options:
                    protocol: 'http'
                    hostname: '*'
                    port: 8000
                    base: '.'
#                    keepalive: yes
#                    livereload: yes

        karma:
            min:
                configFile: 'test/karma-min.config.coffee'
            source:
                configFile: 'test/karma.config.coffee'

    # -----------------------------------
    # register task
    # -----------------------------------
    grunt.registerTask 'dev', [
#        'compass'
        'coffee'
        'connect'
        'watch'
    ]
    grunt.registerTask 'build', [
#        'compass'
        'coffee'
        'uglify'
    ]
    grunt.registerTask 'test', ['karma']

    # -----------------------------------
    # Plugins
    # -----------------------------------
    grunt.loadNpmTasks 'grunt-contrib-compass'
    grunt.loadNpmTasks 'grunt-contrib-coffee'
    grunt.loadNpmTasks 'grunt-contrib-watch'
    grunt.loadNpmTasks 'grunt-contrib-connect'
    grunt.loadNpmTasks 'grunt-karma'
    grunt.loadNpmTasks 'grunt-contrib-uglify'