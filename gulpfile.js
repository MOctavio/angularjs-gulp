const CacheBuster = require('gulp-cachebust'),
    del = require('del'),
    gulp = require('gulp'),
    karma = require('karma').Server,
    mainBowerFiles = require('main-bower-files'),
    plugins = require('gulp-load-plugins')(),
    sequence = require('run-sequence');

const cachebust = new CacheBuster();

const PATH = {
    assets: {
        images: ['src/assets/**/*.jpg', 'src/assets/**/*.jpeg', 'src/assets/**/*.png', 'src/assets/**/*.ico', 'src/assets/**/*.gif'],
        styles: ['src/assets/**/*.css', 'src/assets/**/*.scss']
    },
    distDev: 'public',
    distProd: 'dist',
    entry: 'src/js/app.js',
    index: 'src/index.html',
    partials: ['src/**/*.html', '!src/index.html'],
    scripts: ['src/**/*.js', 'src/*.js'],
    styles: ['src/js/directives/**/*.scss'],
    testFiles: 'test/unit/*.js'
};

// Pipe segments
const pipes = {};

// Eslint
pipes.eslint = function() {
    return gulp.src(PATH.scripts)
        .pipe(plugins.eslint())
        .pipe(plugins.plumber())
        .pipe(plugins.eslint.format())
        .pipe(plugins.eslint.failAfterError());
};

// Htmlhint
pipes.htmlhint = function() {
    return gulp.src(PATH.partials)
        .pipe(plugins.htmlhint({
            'doctype-first': false
        }))
        .pipe(plugins.htmlhint.reporter());
};

// Build js
pipes.buildJsDev = function() {
    return pipes.eslint()
        .pipe(plugins.babel({
            presets: ['es2015']
        }))
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.angularFilesort())
        .pipe(plugins.concat('scripts.js'))
        .pipe(plugins.uglify())
        .pipe(plugins.sourcemaps.write())
        .pipe(gulp.dest(`${PATH.distDev}/js`));
};
pipes.buildJsProd = function() {
    return pipes.eslint()
        .pipe(plugins.babel({
            presets: ['es2015']
        }))
        .pipe(plugins.angularFilesort())
        .pipe(plugins.concat('scripts.js'))
        .pipe(cachebust.resources())
        .pipe(plugins.uglify())
        .pipe(gulp.dest(`${PATH.distProd}/js`));
};

// Styles
pipes.buildStylesDev = function() {
    return gulp.src(PATH.assets.styles)
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.plumber())
        .pipe(plugins.sass({
            includePaths: PATH.styles
        }))
        .pipe(plugins.sourcemaps.write())
        .pipe(gulp.dest(`${PATH.distDev}/assets`));
};
pipes.buildStylesProd = function() {
    return gulp.src(PATH.assets.styles)
        .pipe(plugins.sass({
            includePaths: PATH.styles
        }))
        .pipe(cachebust.resources())
        .pipe(plugins.cleanCss())
        .pipe(gulp.dest(`${PATH.distProd}/assets`));
};

// Partials
pipes.buildPartialsDev = function() {
    return pipes.htmlhint()
        .pipe(gulp.dest(PATH.distDev));
};
pipes.buildPartialsProd = function() {
    return pipes.htmlhint()
        .pipe(plugins.htmlmin({
            collapseWhitespace: true,
            removeComments: true
        }))
        .pipe(gulp.dest(PATH.distProd));
};

// Assets
pipes.processAssets = function(_path) {
    return gulp.src(PATH.assets.images)
        .pipe(gulp.dest(`${_path}/assets`));
};

// Bower files
pipes.bowerFiles = function(_path) {
    return gulp.src(mainBowerFiles())
        .pipe(plugins.concat('vendor.js'))
        .pipe(plugins.uglify())
        .pipe(gulp.dest(`${_path}/js`));
};

// Unit test
pipes.test = function(done) {
    return new karma({
        configFile: __dirname + '/karma.conf.js'
    }, function() {
        done();
    }).start();
};

// Clean
pipes.clean = function(_path = PATH.distDev) {
    return del(_path);
};

// Build index
pipes.buildIndex = function(_inject) {
    return gulp.src(PATH.index)
        .pipe(plugins.inject(_inject.bowerFiles, {
            name: 'bower',
            ignorePath: _inject.path
        }))
        .pipe(plugins.inject(_inject.buildJs, {
            ignorePath: _inject.path
        }))
        .pipe(plugins.inject(_inject.buildStyles, {
            ignorePath: _inject.path
        }))
        .pipe(plugins.inject(_inject.buildPartials, {
            ignorePath: _inject.path
        }))
        .pipe(gulp.dest(_inject.path));
};

// Build
pipes.buildDev = function() {
    let build = {};
    build.path = PATH.distDev;

    pipes.processAssets(build.path);

    build.buildJs = pipes.buildJsDev();
    build.buildStyles = pipes.buildStylesDev();
    build.buildPartials = pipes.buildPartialsDev();
    build.bowerFiles = pipes.bowerFiles(build.path);

    return pipes.buildIndex(build);
};
pipes.buildProd = function() {
    let build = {};
    build.path = PATH.distProd;

    pipes.processAssets(build.path);

    build.buildJs = pipes.buildJsProd();
    build.buildStyles = pipes.buildStylesProd();
    build.buildPartials = pipes.buildPartialsProd();
    build.bowerFiles = pipes.bowerFiles(build.path);

    return pipes.buildIndex(build);
};

// Gulp tasks

// Unit test
gulp.task('test', pipes.test);

// Lint
gulp.task('lint', pipes.eslint);

// Clean
gulp.task('clean-dev', function() {
    return pipes.clean();
});
gulp.task('clean-prod', function() {
    return pipes.clean(PATH.distProd);
});

// Build
gulp.task('build-dev', ['clean-dev'], pipes.buildDev);
gulp.task('build-prod', ['clean-prod'], pipes.buildProd);


// Watch
gulp.task('watch', function() {
    gulp.watch([PATH.scripts], function(event) {
        console.log(`[${event.type}] ${event.path}`);
        pipes.buildJsDev().pipe(plugins.connect.reload())
    });
    gulp.watch([PATH.styles, PATH.assets.styles], function(event) {
        console.log(`[${event.type}] ${event.path}`);
        pipes.buildStylesDev().pipe(plugins.connect.reload())
    });
    gulp.watch([PATH.partials], function(event) {
        console.log(`[${event.type}] ${event.path}`);
        pipes.buildPartialsDev().pipe(plugins.connect.reload())
    });
});

// Development server
gulp.task('local-server', function() {
    return plugins.connect.server({
        root: PATH.distDev,
        port: 8000,
        livereload: true
    });
});

// Development
gulp.task('dev', ['watch'], function(done) {
    sequence('build-dev', 'test', 'local-server', done);
});

// Production
gulp.task('prod', ['build-prod'], function() {
    return plugins.connect.server({
        root: PATH.distProd,
        port: 8000
    });
});

// Default task builds for prod
gulp.task('build', ['build-prod']);
