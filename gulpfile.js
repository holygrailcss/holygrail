const gulp = require("gulp"),
    sass = require("gulp-sass"),
    postcss = require("gulp-postcss"),
    autoprefixer = require("autoprefixer"),
    cssnano = require("cssnano"),
    rename = require("gulp-rename"),
    sourcemaps = require("gulp-sourcemaps"),
    browserSync = require("browser-sync").create();

const { series } = require("gulp");



// Task for compile styles
function style() {
    return gulp
        .src("./scss/style.scss")
        .pipe(sourcemaps.init())
        .pipe(sass())
        .on("error", sass.logError)
        .pipe(postcss([autoprefixer(), cssnano()]))
        .pipe(sourcemaps.write())
        .pipe(rename("style.css")) //  .pipe(rename('style.min.css'))
        .pipe(gulp.dest("./dist"));
}
function guide() {
    //donde esta mi scss
    return (
        gulp
            .src("./doc/**/*.scss")
            //pasamos el archivo y lo compilamos
            .pipe(sass())
            .pipe(postcss([autoprefixer(), cssnano()]))
            .on("error", sass.logError)
            .pipe(gulp.dest("./doc"))
    );
}
function buildServer() {
    console.log("Launching BUILDING server...");
    browserSync.init({
        server: {
            baseDir: "./doc",
            index: "guide.html",
        },
    });
    // Watch tasks
    gulp.watch("./doc/**/*.scss", series('start')).on("change", browserSync.reload);
    gulp.watch("./doc/**/*.html", series('start')).on("change", browserSync.reload);
}

exports.style = style;


// primero gulp guide y luego gulp build

exports.guide = guide;
exports.build = buildServer;


exports.start = series(guide, buildServer) ;