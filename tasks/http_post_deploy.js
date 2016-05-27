/*
 * grunt-http-post-deploy
 * https://github.com/biaohou/grunt-http-post-deploy
 *
 * Copyright (c) 2016 biaohou
 * Licensed under the MIT license.
 */

"use strict";

module.exports = function(grunt){
	var fs = require("fs");
	var rest = require("restler");
	
	grunt.registerMultiTask("http_post_deploy","grunt-http-post-deploy",function(){
		// Tell Grunt this task is asynchronous.
		var done = this.async();
		
		//Merge task-specific and/or target-specific options with these defaults.
		var options = this.data.options;
		
		grunt.verbose.writeflags(options,"Options");
		//Iterate over all specified file groups.
		//this.files[0].orig.src[0]
		
		var file_arr = [],//准备上传的文件列表
			success_file_arr = [],//上传成功的文件列表
			fail_file_arr = [];//上传失败的文件列表
			
		grunt.file.recurse(options.from,function(a, b, c, d){
			if(grunt.file.isFile(a)){
				file_arr.push(a);
			}
		});
		
		var file_arr_l = file_arr.length;
		
		__upload(0);//开始执行上传
		
		function __upload(i){
			//grunt.log.ok(file_arr[i]);
			var filepath = file_arr[i];
			
			if(grunt.file.exists(filepath)){
				//get file size (necessary for multipart upload)
				fs.stat(filepath,function(err,stats){
					if(err){
						grunt.fail.warn("Error: " + err);
						fail_file_arr.push(filepath);

						__continue(i);
					}
					else if(stats.isFile()){
						/*
						判断是否区分static上传
						判断文件是不是static
						*/
						var fileSize = stats.size,
							to = options.to +"/"+ (filepath.replace(options.from,""));
						
						if(options.static_to){
							//console.log("需要针对静态资源进行单独部署");
							var file_type = filepath.substr(filepath.lastIndexOf(".") + 1);//截取文件后缀
							if(file_type == "js" || file_type == "css" || file_type == "png" || file_type == "jpg"){
								//console.log("当前文件为静态资源，需要将上传路径更换为静态路径");
								to = options.static_to +"/"+ (filepath.replace(options.from,""));
							}
						}
						else{
							//console.log("不需要针对静态资源单独部署");
						}
						
						console.log("Uploading "+ filepath +" to "+ to);
						//console.log("fileSize "+ fileSize);
						
						/*
						console.log(rest.file(filepath, null, fileSize, null, null));
						return => {
							path: "xx.jpg",
							filename: "xx.jpg",
							fileSize: 216421,
							encoding: "binary",
							contentType: "application/octet-stream"
						}
						*/
									
						rest.request(options.receiver,{
							rejectUnauthorized : options.rejectUnauthorized,
							headers : options.headers,
							multipart : true,
							method : "POST",
							data : {
								to : to,//路径＋具体文件名
								file : rest.file(filepath, null, fileSize, null, null)
							}
						}).on("complete",function(data,response){
							if(response !== null && response.statusCode >= 200 && response.statusCode < 300) {
								grunt.log.ok("successful");
								options.success && options.success(data);
								success_file_arr.push(filepath);
							}
							else if(response !== null) {
								grunt.fail.warn("Failed status code: "+ response.statusCode);
								fail_file_arr.push(filepath);
							}
							else{
								grunt.fail.warn("Failed status code: null");
								fail_file_arr.push(filepath);
							}
							
							__continue(i);
						}).on("error",function(e){
							grunt.fail.warn("Failed error code: "+ e.message);
							fail_file_arr.push(filepath);
							
							__continue(i);
						});
					}
				});
			}
			else{
				grunt.fail.warn("file " + filepath + " not found.");
				fail_file_arr.push(filepath);
				__continue(i);
			}
		}
		
		function __continue(i){
			i++;
			if(i >= file_arr_l){
				//callback once upload is done
				done();
				
				console.log("上传成功的列表 => "+ success_file_arr.join(", "));
				console.log("上传失败的列表 => "+ fail_file_arr.join(", "));
				grunt.log.ok("此次共上传"+ file_arr_l +"个文件");
			}
			else{
				__upload(i);
			}
		}
	});
};