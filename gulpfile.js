var gulp = require('gulp');
var ts = require('gulp-typescript');
var bower = require('gulp-bower');

gulp.task('compile-lib', function () {
  var tsResult = gulp.src('src/lib/*.ts')
    .pipe(ts({
        noImplicitAny: true,
        out: 'streamalicious.js',
        module: 'amd'
      }));
  return tsResult.js.pipe(gulp.dest('bin/lib'));
});

gulp.task('compile-test', ['bower-test'], function () {
  var tsResult = gulp.src('src/test/*.ts')
    .pipe(ts({
        noImplicitAny: true,
        out: 'streamalicious.js',
        module: 'amd'
      }));
  return tsResult.js.pipe(gulp.dest('bin/test'));
});

gulp.task('bower-test', function() {
  return bower({ directory: 'bin/test/bower_components', cwd: 'src/test' })
    .pipe(gulp.dest('bin/test/bower_components'));
});

gulp.task('verify', ['compile-test'], function () {
});

gulp.task('watch', ['verify'], function() {
    gulp.watch('src/*.ts', ['verify']);
});
