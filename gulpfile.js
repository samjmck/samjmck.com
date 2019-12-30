const gulp = require('gulp');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const exec = require('child_process').exec;

function css() {
    return gulp.src(`${__dirname}/static/styles/**/*.scss`)
        .pipe(sourcemaps.init())
        .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(sourcemaps.write('')) // empty string so it writes to the same path as gulp.dest
        .pipe(gulp.dest(`${__dirname}/public/static/`));
}

function js() {
    return new Promise(resolve => exec('webpack --config webpack.prod.js', (err, stdout, stderr) => {
        console.log(stdout);
        console.log(stderr);
        resolve();
    }));
}

function html() {
    return new Promise(resolve => exec('hugo', (err, stdout, stderr) => {
        console.log(stdout);
        console.log(stderr);
        resolve();
    }));
}

function build() {
    return gulp.series(
        gulp.parallel(css, js),
        html,
    );
}

exports.default = build();
