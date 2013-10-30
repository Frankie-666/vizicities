module.exports = function(grunt) {
	var port = grunt.option('port') || 8000;

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			options: {
				banner: '/*! ViziCities <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			build: {
				src: 'build/vizi.js',
				dest: 'build/vizi.min.js'
			}
		},
		concat: {
			options: {},
			dist: {
				// src: ['src/shared/vendor/underscore.js', 'src/shared/vendor/three.js', 'src/client/*'],
				src: [
					'src/shared/vendor/underscore.js',
					'src/shared/vendor/three.js',
					'src/client/Vizi.js',
					'src/client/Log.js',
					'src/client/Mediator.js',
					'src/client/City.js',
					'src/client/Loop.js',
					'src/client/webgl/WebGL.js',
					'src/client/webgl/Scene.js',
					'src/client/webgl/Camera.js'
				],
				dest: 'build/vizi.js'
			}
		},
		jshint: {
			options: {
				curly: false,
				eqeqeq: true,
				immed: true,
				latedef: true,
				newcap: true,
				noarg: true,
				sub: true,
				undef: true,
				eqnull: true,
				browser: true,
				expr: true,
				globals: {
					head: false,
					module: false,
					console: false
				},
				ignores: ['src/shared/vendor/**']
			},
			files: [ 'Gruntfile.js', 'src/**' ]
		},
		watch: {
			main: {
				files: [ 'Gruntfile.js', 'src/**', 'examples/**' ],
				tasks: 'default',
				options: {
					livereload: true
				}
			}
		},
		connect: {
			server: {
				options: {
					port: port,
					base: '.'
				}
			}
		},
		notify: {
			connect: {
				options: {
					// title: 'Watching files',  // optional
					message: 'Watching for changes' //required
				}
			},
			finish: {
				options: {
					// title: 'Watching files',  // optional
					message: 'Build complete' //required
				}
			}
		},
		notify_hooks: {
			options: {
				enabled: true,
				max_jshint_notifications: 5,
				title: "ViziCities"
			}
		}
	});

	// Load the plugins
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-notify');

	// Default task(s).
	grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'notify:finish']);

	// Serve examples locally
	grunt.registerTask('serve', ['connect', 'notify:connect', 'watch']);

	grunt.task.run('notify_hooks');

};