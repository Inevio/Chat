
// Modules
var async = require('async');
var fs = require('fs-extra');
var gulp = require('gulp');
var concat = require('gulp-concat');
var gulpsync = require('gulp-sync')( gulp );

// Tasks
gulp.task( 'emptyBuild', function(){

  fs.removeSync('./static/script/build');
  fs.mkdirSync('./static/script/build');
  fs.emptyDirSync('./static/script/build');

});

gulp.task( 'desktop', function( cb ){

  gulp.src([

    './static/script/view.desktop.js',
    './static/script/model.js',
    './static/script/controller.desktop.js'

  ])
  .pipe( concat('desktop.js') )
  .pipe( gulp.dest('./static/script/build') )
  .on( 'end', function(){
    cb()
  })

});

gulp.task( 'mobile', function( cb ){

  gulp.src([

    './static/script/view.mobile.js',
    './static/script/model.js',
    './static/script/controller.mobile.js'

  ])
  .pipe( concat('mobile.js') )
  .pipe( gulp.dest('./static/script/build') )
  .on( 'end', function(){
    cb()
  })

});

gulp.task( 'tablet', function( cb ){

  gulp.src([

    './static/script/view.mobile.js',
    './static/script/model.js',
    './static/script/controller.mobile.js'

  ])
  .pipe( concat('tablet.js') )
  .pipe( gulp.dest('./static/script/build') )
  .on( 'end', function(){
    cb()
  })

});

gulp.task( 'default', gulpsync.sync( [ 'emptyBuild', 'desktop', 'mobile', 'tablet' ] ) );

gulp.task( 'watch', function(){

  var watcher = gulp.watch( './static/script/**/*.*', [ 'default' ] );

  watcher.on('change', function(event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
  });

});
