# grunt-http-post-deploy

> grunt-http-post-deploy

## Getting Started
This plugin requires Grunt `0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-http-post-deploy --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-http-post-deploy');
```

## The "http_post_deploy" task

### Overview
In your project's Gruntfile, add a section named `http_post_deploy` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
	http_post_deploy : {
		default_options : {
			options : {
				headers : {Authorization : "Token 1234"},
				from : "src/pic/",
				to : "",
				static_to : "",
				receiver : "",
				rejectUnauthorized : false,
				success : function(data) {}
			}
		}
    }
});
```

### Options

#### options.headers
Type: `String`
写在header里的信息，可选项

#### options.from
Type: `String`
将该目录下（该目录通常为dist之后的目录）的文件发布线上（测试）环境

#### options.to
Type: `String`
服务器上的部署路径，会保持原有文件的目录结构；如果static_to没有指定，则全部都移到该目录下

#### options.static_to
Type: `String`
同上，可选项，专门给静态资源分配的路径，用于cdn，静态文件包括*.{js,css,png,jpg}

#### options.receiver
Type: `String`
服务器上receiver脚本地址，本例中使用php版本，直接读取文件流$_FILES和to路径$_POST["to"]即可

#### options.rejectUnauthorized
Type: `Boolean`
验证服务器证书，如果需要绕过SSL验证，设置为false

#### options.success
Type: `Function`
成功回调，可选项，每次（每个文件）上传成功 就会触发一次

### PHP=>receiver.php

```js
@error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
function mkdirs($path, $mod = 0777) {
    if(is_dir($path)){
        return chmod($path, $mod);
    }
    else{
        $old = umask(0);
        if(mkdir($path, $mod, true) && is_dir($path)){
            umask($old);
            return true;
        }
        else{
            umask($old);
        }
    }
    return false;
}
 
if($_POST['to']){
    $to = $_POST['to'];
    if(file_exists($to)){
        echo "有同名文件，删除！";
        unlink($to);
    }
    else{
        echo "没有同名文件";
        $dir = dirname($to);
        if(!file_exists($dir)){
            echo $dir."路径不存在，创建！";
            mkdirs($dir);
        }           
    }               
    echo move_uploaded_file($_FILES["file"]["tmp_name"], $to) ? $_FILES["file"]["name"]."上传成功" : $_FILES["file"]["name"]."上传失败";
}                   
else{               
    echo "are you ready?";
}
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_
