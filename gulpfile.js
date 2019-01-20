var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    del = require('del'),
    cleanCSS = require('gulp-clean-css'),
    cssnano = require("gulp-cssnano"),
    browser = require('browser-sync').create(),
    plumber = require("gulp-plumber"),
    rigger = require("gulp-rigger"),
    removeComments = require('gulp-strip-css-comments'),
    autoprefixer = require("gulp-autoprefixer"),
    sass = require("gulp-sass"),
    cssbeautify = require("gulp-cssbeautify"),
    imagemin = require("gulp-imagemin");

var port = process.env.SERVER_PORT || 3000;

var path = {
    build: {
        html: "build/",
        js: "build/assets/js/",
        css: "build/assets/css/",
        img: "build/assets/i/",
        fonts: "build/assets/fonts/"
    },
    src: {
        html: "src/*.{htm,html}",
        js: "src/assets/js/*.js",
        css: "src/assets/sass/**/*.scss",
        img: "src/assets/i/**/*.*",
        fonts: "src/assets/fonts/**/*.*"
    },
    watch: {
        html: "src/**/*.{htm,html}",
        js: "src/assets/js/**/*.js",
        css: "src/assets/sass/**/*.scss",
        img: "src/assets/i/**/*.*",
        fonts: "src/assets/fonts/**/*.*"
    },
    clean: "./build"
};

// Tasks
//удаление сборочной директории
gulp.task('clean', function() {
  return del(path.clean); // rm -rf
});

gulp.task('copyFont', function() {
  return gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

gulp.task('html', function() {
    return gulp.src(path.src.html)
        .pipe(plumber())
        .pipe(rigger())
        .pipe(gulp.dest(path.build.html));
});

gulp.task('scripts', function() {
    return gulp.src(path.src.js)
    .pipe(plumber())
        .pipe(rigger())
        .pipe(gulp.dest(path.build.js))
        .pipe(uglify())
        .pipe(removeComments())
        .pipe(rename("main.min.js"))
        .pipe(gulp.dest(path.build.js));
});

gulp.task('stylesheets', function() {
    return gulp.src(path.src.css)
        .pipe(plumber())
        .pipe(sass())
        .pipe(autoprefixer({
            browsers: ["last 5 versions"],
            cascade: true
        }))
        .pipe(removeComments())
        .pipe(cssbeautify())
        .pipe(gulp.dest(path.build.css))
        .pipe(cleanCSS({debug: true}, (details) => {
            //console.log(`${details.name}: ${details.stats.originalSize}`);
            //console.log(`${details.name}: ${details.stats.minifiedSize}`);
          }))
          /*
        .pipe(cssnano({
            zindex: false,
            discardComments: {
                removeAll: true
            }
        }))
        */
        //.pipe(concat('all.css'))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(path.build.css));
});

gulp.task('image', function() {
    return gulp.src(path.src.img)
        .pipe(imagemin({
            optimizationLevel: 3,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img));
});

gulp.task('browser', function() {
  browser.init({
    server: 'build/',
    port: port,
  });

  gulp.watch(path.watch.js, gulp.parallel('scripts'))
    .on('change', browser.reload);

  gulp.watch(path.watch.css, gulp.parallel('stylesheets'))
    .on('change', browser.reload);

  gulp.watch(path.watch.html, gulp.parallel('html'))
    .on('change', browser.reload);

    gulp.watch(path.watch.img, gulp.parallel('image'))
        .on('change', browser.reload);
});

gulp.task('serve', gulp.series('clean',
    gulp.parallel(
        'html',
        'scripts',
        'stylesheets',
        'copyFont',
        'image'),
    'browser')
);

gulp.task('default', gulp.series('serve'));