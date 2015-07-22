// mwahahahaha jshint i mock thee
/* jshint asi: true, laxcomma: true */

var gulp      = require("gulp")
  , gJade     = require("gulp-jade")
  , gServe    = require("gulp-webserver")
  ;

gulp.task("default", ["jed", "src", "vendor", "serve"], function () {
  gulp.watch("kodama.js", ["src"])
  gulp.watch("test/index.jade", ["jed"])
  gulp.watch("test/vendor/**", ["vendor"])
})

// cemehl deh jed fuyls!
gulp.task("jed", function () {
  gulp.src("test/index.jade")
    .pipe(gJade({ pretty: true }))
    .pipe(gulp.dest("test/dist"))
})

gulp.task("src", function () {
  gulp.src("kodama.js")
    .pipe(gulp.dest("test/dist/js"))
})

gulp.task("vendor", function () {
  gulp.src("test/vendor/**/*.css")
  .pipe(gulp.dest("test/dist"))

  gulp.src("test/vendor/**/*.js")
  .pipe(gulp.dest("test/dist"))
})

gulp.task("serve", function () {
  gulp.src("test/dist")
    .pipe(gServe({
      port: 3000,
      livereload: true
    }))
})
