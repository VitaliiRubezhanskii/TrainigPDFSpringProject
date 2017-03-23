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

gulp.task('static-viewer-lib-copy', function() {
    return gulp.src(static.src + '/viewer/lib/**/*', {base: static.src + '/viewer'})
        .pipe(gulp.dest(static.build + '/viewer'));
});

gulp.task('templates-copy', function() {
    return gulp.src(templates.src + '/*.html', {base: templates.src})
        .pipe(gulp.dest(templates.build));
});

gulp.task('static-viewer-revision', function() {
    return gulp.src([
            static.src + '/viewer/css/*.css',
            static.src + '/viewer/js/*.js',
            static.src + '/viewer/images/*.+(gif|jpg|png|svg)',
        ], {base: static.src + '/viewer'})
        .pipe(gulpIf('*.css', cssnano()))
        .pipe(gulpIf('*.js', uglify()))
        .pipe(gulpIf('*.+(gif|jpg|png|svg)', imagemin()))
        .pipe(rev())
        .pipe(revFormat({suffix: '.min'}))
        .pipe(gulp.dest(static.build + '/viewer'))
        .pipe(rev.manifest())
        .pipe(gulp.dest(static.build + '/viewer'));
});

gulp.task('templates-viewer-replace', function() {
    var manifest = gulp.src(static.build + '/viewer/rev-manifest.json');

    return gulp.src(templates.src + '/viewer/viewer.html')
        .pipe(replace('src/viewer', 'build/viewer'))
        .pipe(revReplace({manifest: manifest}))
        .pipe(gulp.dest(templates.build + '/viewer'));
});

gulp.task('static-viewer-revision-clean', function() {
    return del(static.build + '/viewer/rev-manifest.json');
});

gulp.task('build', gulp.series(
    'static-clean',
    'templates-clean',
    'static-viewer-lib-copy',
    'templates-copy',
    'static-viewer-revision',
    'templates-viewer-replace',
    'static-viewer-revision-clean'
));
