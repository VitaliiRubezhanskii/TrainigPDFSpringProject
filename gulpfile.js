var gulp = require('gulp');
var cssnano = require('gulp-cssnano');
var del = require('del') ;
var gulpIf = require('gulp-if');
var imagemin = require('gulp-imagemin');
var uglify = require('gulp-uglify');
var replace = require('gulp-replace');
var rev = require("gulp-rev");
var revFormat = require('gulp-rev-format');
var revReplace = require("gulp-rev-replace");

var static = {
    src: 'src/main/webapp/static/src',
    build: 'src/main/webapp/static/build'
};

var templates = {
    src: 'src/main/resources/templates/src',
    build: 'src/main/resources/templates/build'
};

gulp.task('static-clean', function() {
    return del(static.build);
});

gulp.task('templates-clean', function() {
    return del(templates.build);
});

gulp.task('static-copy', function() {
    return gulp.src(static.src + '/*/lib/**/*', {base: static.src})
        .pipe(gulp.dest(static.build));
});

gulp.task('templates-copy', function() {
    return gulp.src(templates.src + '/*.html', {base: templates.src})
        .pipe(gulp.dest(templates.build));
});

gulp.task('static-revision', function() {
    return gulp.src([
            static.src + '/*/css/*.css',
            static.src + '/*/js/*.js',
            static.src + '/*/images/*.+(gif|jpg|png|svg)',
        ], {base: static.src})
        .pipe(gulpIf('*.css', cssnano()))
        .pipe(gulpIf('*.js', uglify()))
        .pipe(gulpIf('*.+(gif|jpg|png|svg)', imagemin()))
        .pipe(rev())
        .pipe(revFormat({suffix: '.min'}))
        .pipe(gulp.dest(static.build))
        .pipe(rev.manifest())
        .pipe(gulp.dest(static.build));
});

gulp.task('templates-replace', function() {
    var manifest = gulp.src(static.build + '/rev-manifest.json');

    return gulp.src(templates.src + '/*/*.html', {base: templates.src})
        .pipe(replace('static/src', 'static/build'))
        .pipe(revReplace({manifest: manifest}))
        .pipe(gulp.dest(templates.build));
});

gulp.task('static-revision-clean', function() {
    return del(static.build + '/rev-manifest.json');
});

gulp.task('build', gulp.series(
    'static-clean',
    'templates-clean',
    'static-copy',
    'templates-copy',
    'static-revision',
    'templates-replace',
    'static-revision-clean'
));
