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
		
		var file_arr = {//准备上传的文件列表 动静分离
				dynamic : [],
				static : []
			},
			success_file_arr = {//上传成功的文件列表
				dynamic : [],
				static : []
			},
			fail_file_arr = {//上传失败的文件列表
				dynamic : [],
				static : []
			};
			
		grunt.file.recurse(options.from,function(a, b, c, d){
			/*
			a => 完整路径＋文件名＋后缀
			b => 父级以上的文件路径 不包含父级
			c => 父级目录名
			d => 纯粹文件名＋后缀
			
			关系表达式
			a = b+c+"/"+d;
			*/
			if(grunt.file.isFile(a) && d != ".DS_Store"){//mac文件过滤
				var file_type = d.substr(d.lastIndexOf(".") + 1);//截取文件后缀
				if(file_type == "js" || file_type == "css" || file_type == "png" || file_type == "jpg" || file_type == "gif"){
					file_arr.static.push(a);
				}
				else{
					file_arr.dynamic.push(a);
				}
			}
		});
		console.log(file_arr);
		
		var file_arr_dynamic_l = file_arr.dynamic.length,
			file_arr_static_l = file_arr.static.length;
		
		__upload(0,file_arr.dynamic,0);//开始执行上传 从动态文件开始 后边会自动检测动态是否完毕 完毕后自动执行静态上传
		
		function __upload(i,file_arr,is_static){
			var filepath = file_arr[i];
			
			if(grunt.file.exists(filepath)){
				//get file size (necessary for multipart upload)
				fs.stat(filepath,function(err,stats){
					if(err){
						grunt.fail.warn("Error: " + err);
						if(is_static){
							fail_file_arr.static.push(filepath);
						}
						else{
							fail_file_arr.dynamic.push(filepath);
						}

						__continue(i,is_static);
					}
					else if(stats.isFile()){
						var fileSize = stats.size,
							to = (is_static ? (options.static_to || options.to) : options.to) +"/"+ (filepath.replace(options.from,""));
						
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
									
						rest.request(is_static ? (options.static_receiver || options.receiver) : options.receiver,{
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
								if(is_static){
									success_file_arr.static.push(filepath);
								}
								else{
									success_file_arr.dynamic.push(filepath);
								}
							}
							else if(response !== null) {
								grunt.fail.warn("Failed status code: "+ response.statusCode);
								if(is_static){
									fail_file_arr.static.push(filepath);
								}
								else{
									fail_file_arr.dynamic.push(filepath);
								}
							}
							else{
								grunt.fail.warn("Failed status code: null");
								if(is_static){
									fail_file_arr.static.push(filepath);
								}
								else{
									fail_file_arr.dynamic.push(filepath);
								}
							}
							
							__continue(i,is_static);
						}).on("error",function(e){
							grunt.fail.warn("Failed error code: "+ e.message);
							if(is_static){
								fail_file_arr.static.push(filepath);
							}
							else{
								fail_file_arr.dynamic.push(filepath);
							}
							
							__continue(i,is_static);
						});
					}
				});
			}
			else{
				grunt.fail.warn("file " + filepath + " not found.");
				if(is_static){
					fail_file_arr.static.push(filepath);
				}
				else{
					fail_file_arr.dynamic.push(filepath);
				}
				__continue(i,is_static);
			}
		}
		
		function __continue(i,is_static){
			i++;
			if(is_static === 1 && i >= file_arr_static_l){
				//callback once upload is done
				done();
				
				console.log("上传成功的静态文件 => "+ success_file_arr.static.join(", "));
				console.log("上传失败的静态文件 => "+ fail_file_arr.static.join(", "));
				
				console.log("------任务执行完毕,成功上传"+ Number(success_file_arr.dynamic.length + success_file_arr.static.length) +"个文件");
				return;
			}
			
			if(is_static === 0 && i >= file_arr_dynamic_l){
				console.log("上传成功的动态文件 => "+ success_file_arr.dynamic.join(", "));
				console.log("上传失败的动态文件 => "+ fail_file_arr.dynamic.join(", "));
				
				//动态文件上传完毕 开始静态 恢复索引为0 恢复静态标示为true
				i = 0;
				is_static = 1;
			}
			
			__upload(i,is_static ? file_arr.static : file_arr.dynamic,is_static);
		}
	});
};