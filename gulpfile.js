// VARIABLES & PATHS

const preprocessorCSS  = 'scss', // CSS preprocessor (sass, scss)
      preprocessorHTML = 'pug', // HTML preprocessor (htmlmin, pug)
      fileswatch       = 'txt,json,md,woff2', // List of files extensions for watching & hard reload (comma separated)
      imageswatch      = 'jpg,jpeg,png,webp,svg', // List of images extensions for watching & compression (comma separated)
      devDir           = 'dev', // Base directory path without «/» at the end
      buildDir         = 'build', // Base directory path without «/» at the end
      online           = true; // If «false» - Browsersync will work offline without internet connection

const paths = {

    scripts: {
        src: [
            '../node_modules/bootstrap/dist/js/bootstrap.bundle.min', // Bootstrap bundle
            devDir + '/js/app.js' // app.js. Always at the end
        ],
        dest: buildDir + '/js', // Deploy js folder
    },

    template: {
        src:   devDir + '/assets/' + preprocessorHTML + '/index.pug',
        dest: buildDir + '/', // Deploy html folder
    },

    styles: {
        src:   devDir + '/assets/' + preprocessorCSS + '/style.scss',
        dest: buildDir + '/css', // Deploy css folder
    },

    images: {
        src:   devDir + '/assets/images/**/*',
        dest: buildDir + '/images', // Deploy images folder
    },

    deploy: {
        hostname:    'login@yousite.com', // Deploy hostname
        destination: 'yousite/public_html/', // Deploy destination
        include:     [/* 'some.file' */], // Included files to deploy
        exclude:     [ '**/Thumbs.db', '**/*.DS_Store' ], // Excluded files from deploy
    },

    cssOutputName:      'style.min.css',
    jsOutputName:       'app.min.js',

}

// LOGIC

const { src, dest, parallel, series, watch } = require('gulp'),
    // Template
    plumber       = require('gulp-plumber'), // pipe error fix
    pug           = require('gulp-pug'), // HTML preprocessor
    pugLinter     = require('gulp-pug-linter'), // Pug linter
    htmlValidator = require('gulp-w3c-html-validator'), // HTML validator
    htmlmin       = require('gulp-htmlmin') // HTML minifier

    // Styles
    scss          = require('gulp-sass'), // CSS preprocessor
    cleancss      = require('gulp-clean-css'), // CSS cleaner

    // JS

    browserSync   = require('browser-sync').create(),
    autoprefixer  = require('gulp-autoprefixer'),
    imagemin      = require('gulp-imagemin'),
    newer         = require('gulp-newer'),
    rsyncGulp     = require('gulp-rsync'),
    delFiles      = require('del');

function browsersync() {
    browserSync.init({
        server: { baseDir: buildDir + '/' },
        notify: false,
        online: online
    })
}

function scripts() {
    return src(paths.scripts.src)
        .pipe(concat(paths.jsOutputName))
        .pipe(uglify())
        .pipe(dest(paths.scripts.dest))
        .pipe(browserSync.stream())
}

function styles() {
    return src(paths.styles.src)
        .pipe(pugLinter())
        .pipe(gulp-sourcemaps(init()))
        .pipe(eval(preprocessorCSS)())
        .pipe(concat(paths.cssOutputName))
        .pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true }))
        .pipe(cleancss( {level: { 1: { specialComments: 0 } },/* format: 'beautify' */ }))
        .pipe(dest(paths.styles.dest))
        .pipe(browserSync.stream())
}

function template() {
    return src(paths.template.src)
        .pipe(pugLinter())
        .pipe(eval(preprocessorHTML)())
        .pipe(htmlValidator({ reporter: 'default' }))
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true
        }))
        .pipe(dest(paths.template.dest))
        .pipe(browserSync.stream())
}

function images() {
    return src(paths.images.src)
        .pipe(newer(paths.images.dest))
        .pipe(imagemin())
        .pipe(dest(paths.images.dest))
}

function cleanimg() {
    return del('' + paths.images.dest + '/**/*', { force: true })
}

function deploy() {
    return src(buildDir + '/')
        .pipe(rsyncGulp({
            root: buildDir + '/',
            hostname: paths.deploy.hostname,
            destination: paths.deploy.destination,
            include: paths.deploy.include,
            exclude: paths.deploy.exclude,
            recursive: true,
            archive: true,
            silent: false,
            compress: true
        }))
}

function startwatch() {
    watch(devDir    + '/' + preprocessorHTML + '/**/*', {usePolling: true}, template);
    watch(devDir    + '/' + preprocessorCSS + '/**/*', {usePolling: true}, styles);
    watch(devDir    + '/images/**/*.{' + imageswatch + '}', {usePolling: true}, images);
    watch(buildDir  + '/**/*.{' + fileswatch + '}', {usePolling: true}).on('change', browserSync.reload);
    watch([devDir   + '/js/**/*.js', '!' + paths.scripts.dest + '/*.min.js'], {usePolling: true}, scripts);
}

exports.browsersync = browsersync;
exports.assets      = series(cleanimg, template, styles, scripts, images);
exports.template    = template;
exports.styles      = styles;
exports.scripts     = scripts;
exports.images      = images;
exports.cleanimg    = cleanimg;
exports.deploy      = deploy;
exports.default     = parallel(images, template, styles, scripts, browsersync, startwatch);