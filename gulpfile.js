const gulp = require('gulp'),
    sass = require('gulp-sass'),
    postcss = require('gulp-postcss'),
    autoprefixer = require('autoprefixer'),
    cssnano = require('cssnano'),
    rename = require('gulp-rename')
    sourcemaps = require('gulp-sourcemaps');

// Task for compile styles
function style()
{
    return (
        gulp
            .src('./scss/style.scss')
            .pipe(sourcemaps.init())
            .pipe(sass())
            .on('error', sass.logError) 
            .pipe(postcss([autoprefixer(), cssnano()]))
            .pipe(sourcemaps.write())
            .pipe(rename('style.css')) //  .pipe(rename('style.min.css'))
            .pipe(gulp.dest('./dist'))
    );
}


function guide() {

    //donde esta mi scss 
    return gulp.src('./scss/**/*.scss')

        //pasamos el archivo y lo compilamos
        .pipe(sass())
        .pipe(postcss([autoprefixer(), cssnano()]))
        .on('error', sass.logError) 
        .pipe(gulp.dest('./dist'))


}
 
// Expose the task by exporting it
exports.style = style;
exports.guide = guide;