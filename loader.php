<?php

class load{
	public static function library($class){
        if(is_array($class)){
            foreach($class as $v){
                if(class_exists($v) || class_exists($v.'_library')){
                    // Do Nothing :D
                }else{
                    $filename = path('base').DS.'libs'.DS.$v.'.php';
                    if(file_exists($filename)){
                        require_once $filename;
                    }
                }
            }
        }else{
            if(class_exists($class) || class_exists($class.'_library')){
                return false;
            }else{
                $filename = path('base').DS.'libs'.DS.$class.'.php';
                if(file_exists($filename)){
                    require_once $filename;
                }
            }
        }
    }	
}
