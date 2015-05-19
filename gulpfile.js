var gulp = require('gulp');
var ts = require('gulp-typescript');
var bower = require('gulp-bower');
var uglify = require('gulp-uglify');
var jasmine = require('gulp-jasmine');
var cover = require('gulp-coverage');

gulp.task('compile-lib', function () {
  var tsResult = gulp.src('src/lib/*.ts')
    .pipe(ts({
    noImplicitAny: true,
    out: 'streamalicious.js',
    module: 'amd'
  }));
  return tsResult.js.pipe(gulp.dest('bin/lib'));
});

gulp.task('compress-lib', ['compile-lib'], function () {
  return gulp.src('bin/lib/streamalicious.js')
    .pipe(uglify())
    .pipe(gulp.dest('bin/lib.min'));
});

gulp.task('compile-tests', function () {
  var tsResult = gulp.src('src/test/*.ts')
    .pipe(ts({
    noImplicitAny: true,
    out: 'streamalicious.tests.js',
    module: 'amd'
  }));
  return tsResult.js.pipe(gulp.dest('bin/test'));
});

gulp.task('run-tests', ['compile-tests'], function () {
  return gulp.src(['bin/test/streamalicious.tests.js'])
    .pipe(cover.instrument({ pattern: ['**/*.tests.js'], debugDirectory: 'debug' }))
    .pipe(jasmine())
    .pipe(cover.gather())
    .pipe(cover.format())
    .pipe(gulp.dest('reports'));

});

gulp.task('verify', ['run-tests'], function () {
});

gulp.task('dist', ['verify', 'compress-lib'], function () {
});

gulp.task('watch', function () {
  gulp.watch('src/**/*.ts', ['verify']);
});

