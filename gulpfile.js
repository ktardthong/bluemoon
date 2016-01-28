//https://medium.com/@dickeyxxx/best-practices-for-building-angular-js-apps-266c1a4a6917#.r749impdo
//http://blog.carbonfive.com/2014/05/05/roll-your-own-asset-pipeline-with-gulp/

var gulp = require('gulp');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps')
var uglify = require('gulp-uglify');
var ngAnnotate = require('gulp-ng-annotate');


//JS
gulp.task('js', function () {
  gulp.src(['app/app.js',
            'app/auth/*.js',
            'app/category/*.js',
            'app/dashboard/*.js',
            'app/directives/*.js',
            'app/home/*.js',
            'app/lang/*.js',
            'app/notification/*.js',
            'app/place/*.js',
            'app/profile/*.js',
            'app/services/*.js',
            'app/tag/*.js',
            'app/tag/*.js',
            'app/topics/*.js',
            'app/users/*.js',
            '!app/build/'
            ])
    .pipe(sourcemaps.init())
      .pipe(concat('build.js'))
      .pipe(ngAnnotate())
      .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('app/build/'))
});

//Watch - run grunt watch to monitor js changes
gulp.task('watch', ['js'], function () {
  gulp.watch('app/**/*.js', ['js'])
});
