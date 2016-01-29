var gulp = require("gulp"),
	autoprefixer = require("gulp-autoprefixer"),
	minifycss = require("gulp-minify-css"),
	jshint = require("gulp-jshint"),
	uglify = require("gulp-uglify"),
	imagemin = require("gulp-imagemin"),
	rename = require("gulp-rename"),
	clean = require("gulp-clean"),
	concat = require("gulp-concat"),
	notify = require("gulp-notify"),
	cache = require("gulp-cache"),
	compass = require("gulp-compass"),
	livereload = require("gulp-livereload"),
	gulpSequence = require('gulp-sequence'),
	connect = require("gulp-connect")
;

var src = "./", //开发根目录
	src_css = src + "sass", //开发目录下的sass目录
	src_image = src + "images", //开发目录下的图片目录
	src_scripts = src + "scripts",//开发目录下的脚本目录
	dest = "./dist/", //生产根目录
	dest_css = dest + "css",  // 生产目录下的css目录
	dest_image = dest + "images", //生产目录下的图片目录
	dest_scripts = dest + "scripts"; //生产目录下的脚本目录

gulp.task("default",["clean"],function(){
	gulp.start("compass","cssmin","imagemin");
});
//清理生产环境下的css,images
gulp.task("clean",function(){
	return gulp.src([dest_css,dest_scripts],{read:false}).pipe(clean());
});
//压缩图片
gulp.task("imagemin",function(){
	gulp.src(src_image+'/**/*')
	.pipe(cache(imagemin({
		optimizationLevel:5,//类型：Number  默认：3  取值范围：0-7（优化等级）
		progressive:true,//类型：Boolean 默认：false 无损压缩jpg图片
		interlaced:true,//类型：Boolean 默认：false 隔行扫描gif进行渲染
		multipass:true //类型：Boolean 默认：false 多次优化svg直到完全优化
	})))
	.pipe(gulp.dest(dest_image))
	//.pipe(connect.reload())
	.pipe(notify({message:"Images complete"}));
});
//脚本的校验,压缩,合并
gulp.task("scripts",function(){
	gulp.src(src_scripts+"/**/*.js")
	.pipe(jshint())
	.pipe(jshint.reporter("default"))
	.pipe(concat("all.js"))
	.pipe(rename({suffix:".min"}))
	.pipe(gulp.dest(dest_scripts))
	.pipe(connect.reload())
	.pipe(notify({message:"scripts complete"}));
});
gulp.task("build-scripts",function(){
	gulp.src(dest_scripts+"/**/*.js")
	.pipe(uglify())
	.pipe(gulp.dest(dest_scripts))
	.pipe(notify({message:"build-scripts complete"}));
});
//compass
gulp.task("compass",function(){
	gulp.src(src_css+"/*.scss")
	.pipe(compass({
		config_file:"./config.rb",
		css:dest_css,
		sass:"sass"
	}))
	.pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
	.pipe(concat("global.css"))
	.pipe(rename({suffix:".min"}))
	.pipe(gulp.dest(dest_css))
	.pipe(connect.reload())
	.pipe(notify({message:"Compass complete"}));
});
//给生产环境添加前缀
gulp.task("autoprefixer",function(){
	gulp.src(dest_css+"/**/*.css")
	.pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
	.pipe(gulp.dest(dest_css))
	.pipe(notify({message:"autoprefixer complete"}));
});
//css minify css压缩
gulp.task("cssmin",function(){
	gulp.src(dest_css+"/*.css")
	.pipe(minifycss())
	.pipe(gulp.dest(dest_css))
	.pipe(notify({message:"css minify ended"}));
});
//build
gulp.task("release",function(cb){
	gulpSequence("clean","compass","cssmin","scripts","build-scripts","imagemin")(cb);
});
//connect
gulp.task('connect', function() {
  connect.server({
    root: 'dist',
    livereload: true
  });
});
//watch
gulp.task("watch",function(){
	//watch sass
	gulp.watch(src_css+"/*.scss",["compass"]);
	//image min
	gulp.watch(src_image+'/**/*',["imagemin"]);
	//scripts
	gulp.watch(src_scripts+"/**/*.js",["scripts"]);
});
//connect and watch task
gulp.task("quickdev",["connect","watch"]);