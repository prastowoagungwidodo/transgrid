<?php

class Config{
   	static $database = '';
	static function init(){
		$TCONF['dbtype']      = 'mysql';
		$TCONF['dbhost']      = 'localhost';
		$TCONF['dbport']      = '3306';
		$TCONF['dbuser']      = 'root';
		$TCONF['dbpass']      = 'password';
		$TCONF['dbname']      = 'dbname';
		self::$database = $TCONF;
	}
}

