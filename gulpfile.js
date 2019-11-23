/**
 * @author  Igus Aleksei Ivanovich
 * @package Gulpfile
 * @version 1.0
 * 
 */

/**
 * Параметры для gulp-autoprefixer
 * @type {Array}
 */
var autoprefixerList = [
    'Chrome >= 45',
	'Firefox ESR',
	'Edge >= 12',
	'Explorer >= 10',
	'iOS >= 9',
	'Safari >= 9',
	'Android >= 4.4',
	'Opera >= 30'
];

/**
 * пути к исходным файлам (src), к готовым файлам (build), а также к тем, за изменениями которых нужно наблюдать (watch)
 * @type {Object}
 */
var path = {
    build: {
        html:    'build/',
        js:      'build/js/',
        css:     'build/css/',
        img:     'build/img/',
        fonts:   'build/fonts/'
    },
    src: {
        html:    'src/',
        temp:    'src/template/*.html',
        js:      'src/js/main.js',
        src_js : 'src/rjs/',
        style:   'src/style/main.scss',
        css:     'src/css/',
        img:     'src/img/**/*.*',
        fonts:   'src/fonts/**/*.*'
    },
    watch: {
        html:    'src/*.html',
        temp:    'src/template/*.html',
        js:      'src/js/**/*.js',
        css:     'src/style/**/*.scss',
        img:     'src/img/**/*.*',
        fonts:   'srs/fonts/**/*.*'
    },
    clean:       './build'
};

/**
 * Настройки сервера
 * @type {Object}
 */
var config = {
    server: {
        baseDir: 'src'
    },
    notify: false
};

/**
 * Подключение Gulp и плагинов
 *
 * gulp-sass                - модуль для компиляции SASS (SCSS) в CSS
 * gulp-sourcemaps          - модуль для генерации карты исходных файлов
 * gulp-plumber             - модуль для отслеживания ошибок
 * gulp-autoprefixer        - модуль для автоматической установки автопрефиксов
 * browser-sync             - сервер для работы и автоматического обновления страниц
 * gulp-rigger              - модуль для импорта содержимого одного файла в другой
 * gulp-preprocess          - модуль для препроцессинга
 * gulp-rename              - модуль для переименования файлов
 * gulp-clean-css           - модуль для минимизации css
 * gulp-uncss               - модуль для удаления из css файлов неиспользуемых селекторов
 * gulp-uglify              - модуль для минимизации JavaScript
 * gulp-imagemin            - плагин для сжатия PNG, JPEG, GIF и SVG изображений
 * imagemin-jpeg-recompress - плагин для сжатия jpeg
 * imagemin-pngquant        - плагин для сжатия png
 * gulp-cache               - модуль для кэширования
 */
var gulp           = require('gulp'),
	sass           = require('gulp-sass'),
	sourcemaps     = require('gulp-sourcemaps'),
	plumber        = require('gulp-plumber'),
	autoprefixer   = require('gulp-autoprefixer'),
	webserver      = require('browser-sync'),
	rigger         = require('gulp-rigger'),
	preprocess     = require('gulp-preprocess'),
	rename         = require('gulp-rename'),
	cleancss       = require('gulp-clean-css'),
	uncss          = require('gulp-uncss'),
	uglify         = require('gulp-uglify'),
	concat         = require('gulp-concat'),
	del            = require('del'),
	imagemin       = require('gulp-imagemin'),
	jpegrecompress = require('imagemin-jpeg-recompress'),
	pngquant       = require('imagemin-pngquant'),
	cache          = require('gulp-cache');

/**
 * Запуск сервера
 */
gulp.task('webserver', function () {
    webserver(config)
});

/**
 * Очистка фильной версии проекта
 */
gulp.task('clean', function (done) {
    del.sync(path.clean);
    done();
});

/**
 * Сборка рабочего css файла проекта
 */
gulp.task('styles:dev', function() {
	return gulp.src(path.src.style)
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(sass())
		.pipe(autoprefixer(['last 15 versions']))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(path.src.css))
		.pipe(webserver.stream())
});

/**
 * Сборка финального css файла проекта
 */
gulp.task('styles:prod', function() {
	return gulp.src(path.src.style)
		.pipe(plumber())
		.pipe(sass())
		.pipe(autoprefixer(['last 15 versions']))
		.pipe(rename('style.min.css'))
		.pipe(cleancss( {level: { 1: { specialComments: 0 } } }))
		.pipe(uncss({
			html: ['http://localhost:3000/*']
		}))
		.pipe(gulp.dest(path.build.css))
});

/**
 * Сборка рабочего js файла проекта
 */
gulp.task('js:dev', function (done) {
    gulp.src(path.src.js)
        .pipe(plumber())
        .pipe(rigger())
        .pipe(sourcemaps.init())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(path.src.src_js))
        .pipe(webserver.stream());
    done();
});

/**
 * Сборка финального js файла проекта
 */
gulp.task('js:prod', function (done) {
    gulp.src(path.src.js)
        .pipe(rigger())
        .pipe(uglify())
        .pipe(rename({ suffix: '.min', prefix : '' }))
        .pipe(gulp.dest(path.build.js));
    done();
});

/**
 * Очистка кэша
 */
gulp.task('cache:clear', function (done) {
  cache.clearAll();
  done();
});

/**
 * Перенос шрифтов в финальныу версию проекта
 */
gulp.task('fonts:prod', function(done) {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts));
    done();
});

/**
 * Сборка рабочего html файла проекта
 */
gulp.task('html:dev', function(done) {
    gulp.src(path.src.temp)
		.pipe(plumber())
		.pipe(rigger())
	    .pipe(preprocess({context: {NODE_ENV: 'development', DEBUG: true}}))
	    .pipe(gulp.dest(path.src.html))
	    .pipe(webserver.stream());
    done();
});

/**
 * Сборка финального html файла проекта
 */
gulp.task('html:prod', function(done) {
    gulp.src(path.src.temp)
    	.pipe(plumber())
    	.pipe(rigger())
        .pipe(preprocess({context: {NODE_ENV: 'development', DEBUG: true}}))
        .pipe(gulp.dest(path.build.html));
    done();
});

/**
 * Сжатие картинок
 */
gulp.task('img:prod', function (done) {
    gulp.src(path.src.img)
        .pipe(cache(imagemin([
		    imagemin.gifsicle({interlaced: true}),
            jpegrecompress({
                progressive: true,
                max: 90,
                min: 80
            }),
            pngquant(),
            imagemin.svgo({plugins: [{removeViewBox: false}]})
		])))
        .pipe(gulp.dest(path.build.img));
    done();
});

/**
 * Финальная сборка проекта
 */
gulp.task('prod', gulp.series('clean', gulp.parallel('html:prod', 'styles:prod', 'js:prod', 'img:prod', 'fonts:prod')));

/**
 * Отслеживание изменений файлов и пересборка проекта
 */
gulp.task('watch', function() {
    gulp.watch(path.watch.temp, gulp.parallel('html:dev'));
    gulp.watch(path.watch.css, gulp.parallel('styles:dev'));
    gulp.watch(path.watch.js, gulp.parallel('js:dev'));
    //gulp.watch(path.watch.img, ['image:dev']);
    //gulp.watch(path.watch.fonts, ['fonts:dev']);
});

/**
 * Запуск по умолчанию
 */
gulp.task('default', gulp.parallel('webserver','watch'));