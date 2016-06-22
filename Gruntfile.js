/*
 * grunt-http-post-deploy
 * https://github.com/biaohou/grunt-http-post-deploy
 *
 * Copyright (c) 2016 biaohou
 * Licensed under the MIT license.
 */

"use strict";

module.exports = function(grunt){
  // Project configuration.
  grunt.initConfig({
    // Configuration to be run (and then tested).
	http_post_deploy : {
		default_options : {
			options : {
				//headers : {Authorization : "Token 1234"},//写在header里的信息，可选项
				from : "src/",//将该目录下（该目录通常为dist之后的目录）的文件发布线上（测试）环境
				
				to : "",//服务器上的部署路径，会保持原有文件的目录结构；如果static_to没有指定，则全部都移到该目录下
				receiver : "",//服务器上receiver脚本地址 如果static_receiver没有指定 则都用这个 请保证要上传的目录和该文件在同一台服务器上或同一个域名内
				
				static_to : "",//同上to，可选项，专门给静态资源分配的路径，静态文件包括*.{js,css,png,jpg,gif} 如果没有则用上边的to
				static_receiver : "",//同上receiver，可选项，专门接收静态资源文件的服务器脚本 如果没有则用上边的receiver
				
				rejectUnauthorized : false,//验证服务器证书，如果需要绕过SSL验证，设置为false
				success : function(data) {}//成功回调，可选项，每次（每个文件）上传成功 就会触发一次
			}
		}
    },
  });

  //Actually load this plugin's task(s).
  grunt.loadTasks("tasks");

  //These plugins provide necessary tasks.
  grunt.loadNpmTasks("grunt-contrib-nodeunit");

  grunt.registerTask("test", ["http_post_deploy:default_options"]);
  grunt.registerTask("default", ["http_post_deploy:default_options"]);
};