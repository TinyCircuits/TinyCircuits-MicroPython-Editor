var fileinclude = require('gulp-file-include');
var gulp = require('gulp');
 
gulp.src(['./src/html/**/*.html'])
.pipe(fileinclude({
    prefix: '@@',
    basepath: '@file'
}))
.pipe(gulp.dest('./dist/html'));