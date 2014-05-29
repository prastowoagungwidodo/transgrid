<?php
if ( strpos(strtolower($_SERVER['SCRIPT_NAME']),strtolower(basename(__FILE__))) ){ die(header('HTTP/1.0 403 Forbidden')); }
class db {
	static $error;
	static $sql;
	static $bind;
	static $errorMsgFormat = 'html';
	static $debug = true;
	static $dsn = '';
	static $user = '';
	static $passwd = '';
	static $TPDO = null;
	static $pdostmt;
	static $backtrace = true;
    static $dbBeginTransaction = false;
	public static function connect() {
		if (!self::$TPDO) {
			$dsn               = Config::$database['dbtype'] . ":host=" . Config::$database['dbhost'] . ";port=" . Config::$database['dbport'] . ";dbname=" . Config::$database['dbname'];
			self::$user        = !empty(self::$user) ? self::$user : Config::$database['dbuser'];
			self::$passwd      = !empty(self::$passwd) ? self::$passwd : Config::$database['dbpass'];
			self::$dsn         = !empty(self::$dsn) ? self::$dsn : $dsn;
			$options           = array(
				PDO::ATTR_PERSISTENT => true,
				PDO::ATTR_ERRMODE    => PDO::ERRMODE_EXCEPTION
			);
			try{
				self::$TPDO = new PDO(self::$dsn, self::$user, self::$passwd, $options);
				return self::$TPDO;
			}
			catch(PDOException $e){
                header('location:'.BASE_URL.'install.php');
                exit();
				//die($e->getMessage());
			}
		}
	}
	static function close(){
		self::$TPDO = null;
		//echo '<script>console.log("Koneksi Terputus");</script>';
	}
	static function beginTransaction(){
		self::connect();
		$begin = self::$TPDO->beginTransaction();
		if($begin){
			self::$dbBeginTransaction = true;
			return true;
		}else{
			return false;
		}
	}
	static function commit(){
		$commit = self::$TPDO->commit();
		if($commit){
			self::$dbBeginTransaction = false;
			return true;	
		}else{
			return false;
		}
	}
	static function rollback(){
		$rollback = self::$TPDO->rollBack();
		if($rollback){
			self::$dbBeginTransaction = false;
			return true;	
		}else{
			return false;
		}
	}
	static function dbDebug() {
		if (self::$debug == true) {
			$error = array("Error" => self::$error);
			if (!empty(self::$sql)) {
				$error["SQL Statement"] = self::$sql;
			}
			if (!empty(self::$bind)) {
				$error["Bind Parameters"] = trim(print_r(self::$bind, true));
			}
			if (self::$backtrace == true) {
				$aTrace = debug_backtrace();
				for ($sFile = '', $iLine = 0, $i = count($aTrace); $i--;) {
					$aTrace[$i] = array_merge(array(
							'function' => '',
							'type'     => '',
							'class'    => '',
							'object'   => array(),
							'args'     => array(),
							'file'     => $sFile,
							'line'     => $iLine
						),
						$aTrace[$i]
					);

					$aTrace[$i]['call'] = $aTrace[$i]['class'] . $aTrace[$i]['type'] . $aTrace[$i]['function'];
					$sFile              = $aTrace[$i]['file'];
					$iLine              = $aTrace[$i]['line'];
				}
				array_shift($aTrace);
				$error["Backtrace"] = $sFile . " at line " . $iLine;
			}
			$msg = "";
			if (self::$errorMsgFormat == "html") {
				if (!empty($error["Bind Parameters"])) {
					$error["Bind Parameters"] = "<pre>" . $error["Bind Parameters"] . "</pre>";
				}
				//$css = trim(file_get_contents(BASE_URL . "assets/css/error.css"));
				//$msg .= '<style type="text/css">' . "\n" . $css . "\n</style>";
				$css = <<<CSS
				.db-error, .db-error pre  {
					font: 12px Arial, Helvetica, sans-serif; 
				}
				.db-error {
					padding: 0.75em;
					margin: 0.75em;
					border: 1px solid #990000;
					max-width: 400px;
					color: #990000;
					background-color: #FDF0EB;
					-moz-border-radius: 0.5em;
					-webkit-border-radius: 0.5em;
				}
				.db-error h3 {
					margin: 0;
					padding-bottom: 0.25em;
					border-bottom: 1px solid #990000;
				}
				.db-error label {
					display: block;
					padding-top: 1em;
					font-weight: bold;
				}
				.db-error pre {
					margin: 0;
				}
CSS;
				$msg .= '<style type="text/css">' . "\n" . $css . "\n</style>";
				$msg .= "\n" . '<div class="db-error">' . "\n\t<h3>SQL Error</h3>";
				foreach ($error as $key => $val) {
					$msg .= "\n\t<label>" . $key . ":</label>" . $val;
				}
				$msg .= "\n\t</div>\n";
			} elseif (self::$errorMsgFormat == "text") {
				$msg .= "SQL Error\n" . str_repeat("-", 50);
				foreach ($error as $key => $val) {
					$msg .= "\n\n$key:\n$val";
				}
			}
			echo $msg;
		}
	}

	private static function cleanup($bind) {
		if (!is_array($bind)) {
			if (!empty($bind)) {
				$bind = array($bind);
			} else {
				$bind = array();
			}
		}
		return $bind;
	}

	static function run($sql, $bind = "") {
        load::library('fn');
		self::connect();
		self::$sql  = trim($sql);

		self::$bind = self::cleanup($bind);
		try {
			if(self::$dbBeginTransaction == false){
				self::$TPDO->beginTransaction();	
			}
			$pdostmt = self::$TPDO->prepare(self::$sql);
			if ($pdostmt->execute(self::$bind) !== false) {

				if (preg_match("/^(" . implode("|", array("select", "describe", "pragma")) . ") /i", self::$sql)) {
					if(self::$dbBeginTransaction == false){
						self::$TPDO->commit();
						return $pdostmt->fetchAll(PDO::FETCH_ASSOC);	
					}else{
						return true;
					}
				} elseif (preg_match("/^(" . implode("|", array("delete", "insert", "update")) . ") /i", self::$sql)) {
					if(self::$dbBeginTransaction == false){
						self::$TPDO->commit();
						return $pdostmt->rowCount();	
					}else{
						return true;
					}
				}
			}
		} catch (PDOException $e) {
			if(self::$dbBeginTransaction == false){
				self::$TPDO->rollback();	
				self::dbDebug();
			}
			self::$error = $e->getMessage();
            $log_error = 'Failed execute sql [ '.self::$sql.']'.' ERROR :'.self::$error;
            fn::log_error($log_error);
			return false;
		}
		//self::close();
	}

	static function recordList($table, $fields = "*", $additionalSQL = "", $bind = "") {
		$sql = "SELECT " . $fields . " FROM " . $table;
		if (!empty($additionalSQL)) {
			$sql .= " " . $additionalSQL;
		}
		$sql .= ";";
		return self::run($sql, $bind);
	}

	static function query($sql, $bind = "") {
		self::connect();
		self::$sql  = trim($sql);
		self::$bind = self::cleanup($bind);
		//$writeData = true;
		try {
			if(self::$dbBeginTransaction == false){
				self::$TPDO->beginTransaction();	
			}

			self::$pdostmt = self::$TPDO->prepare(self::$sql);
			if (self::$pdostmt->execute(self::$bind) !== false) {
				if (preg_match("/^(" . implode("|", array("select", "describe", "pragma")) . ") /i", self::$sql)) {
					//$writeData = false;
				} elseif (preg_match("/^(" . implode("|", array("delete", "insert", "update")) . ") /i", self::$sql)) {
					//$writeData = true;
				}
				if(self::$dbBeginTransaction == false){
					self::$TPDO->commit();
                    return true;
				}
			}
		} catch (PDOException $e) {
			if(self::$dbBeginTransaction == false){
				self::$TPDO->rollback();
				self::$error = $e->getMessage();
				self::dbDebug();
			}
			return false;
		}
		//if($writeData){
			//self::close();
		//}
	}

	static function fetchArray($result) {
		return self::$pdostmt->fetchAll(PDO::FETCH_ASSOC);
	}

	static function fetchAssoc($result) {
		return self::$pdostmt->fetch(PDO::FETCH_ASSOC);
	}

	static function numRows($result) {
		return self::$pdostmt->rowCount();
	}

	static function dbError() {
		return self::$error;
	}

	static function insert($table, $datas, $bind = "") {

		if(self::$dbBeginTransaction == false){
			$fields = self::filter($table, $datas);	
		}else{
			$fields = array();
			foreach($datas as $k=>$v){
				$fields[] = $k;
			}
		}
		
		$sql    = "INSERT INTO " . $table . " (" . implode($fields, ", ") . ") VALUES (:" . implode($fields, ", :") . ");";
        $bind = self::cleanup($bind);
		foreach ($fields as $field)
			$bind[":$field"] = $datas[$field];
		$result = self::run($sql, $bind);
		// echo $sql.'\n<br>'; //exit();

        /*
         * Need fn library.
         */


        load::library('fn');
		if (!$result) {
			// echo $sql.'\n<br>'; //exit();
			fn::log('ERROR # DB INSERT, USER = ' . session::get('user_id') . ', TABLE = ' . $table . ', QUERY STRING = ' . $sql . ' #SERVER MSG ' . self::dbError());
			fn::log_error('ERROR # DB INSERT, USER = ' . session::get('user_id') . ', TABLE = ' . $table . ', QUERY STRING = ' . $sql . ' #SERVER MSG ' . self::dbError());
		} else {
			fn::log('SUCCESS # DB INSERT, USER = ' . session::get('user_id') . ', TABLE = ' . $table . ', QUERY STRING = ' . $sql);
		}

		return $result;
	}

	private static function filter($table, $info) {
		$driver = Config::$database['dbtype'];
		if ($driver == 'sqlite') {
			$sql = "PRAGMA table_info('" . $table . "');";
			$key = "name";
		} elseif ($driver == 'mysql') {
			$sql = "DESCRIBE " . $table . ";";
			$key = "Field";
		} else {
			$sql = "SELECT column_name FROM information_schema.columns WHERE table_name = '" . $table . "';";
			$key = "column_name";
		}

		if (false !== ($list = self::run($sql))) {
			$fields = array();
			foreach ($list as $record)
				$fields[] = $record[$key];
			return array_values(array_intersect($fields, array_keys($info)));
		}
		return array();
	}

	static function update($table, $datas, $parameter = '', $bind = "") {
		if(self::$dbBeginTransaction == false){
			$fields = self::filter($table, $datas);	
		}else{
			$fields = array();
			foreach($datas as $k=>$v){
				$fields[] = $k;
			}
		}
		//$fields    = self::filter($table, $datas);
		$fieldSize = sizeof($fields);

		$sql = "UPDATE " . $table . " SET ";
		for ($f = 0; $f < $fieldSize; ++$f) {
			if ($f > 0)
				$sql .= ", ";
			$sql .= $fields[$f] . " = :update_" . $fields[$f];
		}
		$sql .= " " . $parameter . ";";

		$bind = self::cleanup($bind);
		foreach ($fields as $field) {
			$bind[":update_$field"] = $datas[$field];
		}
		$result = self::run($sql, $bind);

        /*
         * Need fn library
         * Uncomment if you have fn library
         */


        load::library('fn');
        if (!$result) {
			// echo $sql.'\n<br>'; //exit();
			fn::log('ERROR # DB UPDATE, USER = ' . session::get('user_id') . ', TABLE = ' . $table . ', QUERY STRING = ' . $sql . ' #SERVER MSG ' . self::dbError());
			fn::log_error('ERROR # DB UPDATE, USER = ' . session::get('user_id') . ', TABLE = ' . $table . ', QUERY STRING = ' . $sql . ' #SERVER MSG ' . self::dbError());
		} else {
			fn::log('SUCCESS # DB UPDATE, USER = ' . session::get('user_id') . ', TABLE = ' . $table . ', QUERY STRING = ' . $sql);
		}

		return $result;
	}

	static function delete($table, $parameter = '', $bind = "") {
		$sql = 'DELETE FROM ' . $table . ' ' . $parameter;
		// echo $sql.'<br>';
		$result = self::run($sql, $bind);

        /*
         * Need fn library
         * Uncomment if you have fn library
         */


        load::library('fn');
        if (!$result) {
			// echo $sql.'\n<br>'; //exit();
			fn::log('ERROR # DB DELETE, USER = ' . session::get('user_id') . ', TABLE = ' . $table . ', QUERY STRING = ' . $sql . ' #SERVER MSG ' . self::dbError());
			fn::log_error('ERROR # DB DELETE, USER = ' . session::get('user_id') . ', TABLE = ' . $table . ', QUERY STRING = ' . $sql . ' #SERVER MSG ' . self::dbError());
		} else {
			fn::log('SUCCESS # DB DELETE, USER = ' . session::get('user_id') . ', TABLE = ' . $table . ', QUERY STRING = ' . $sql);
		}

		return $result;
	}

	static function record($table, $field = '*', $additionalSQL = '') { // get single record
		$record = '';
		if (empty($field)) {
			$field = '*';
		}
		$sql = 'SELECT ' . $field . ' FROM ' . $table . ' ' . $additionalSQL;
		// echo $sql;
		$res = self::query($sql);

        /*
         * Need fn library
         * Uncomment if you have fn library
         */


        load::library('fn');
		if (!$res) {
			// echo $sql.'\n<br>'; //exit();
			fn::log('ERROR # DB QUERY, USER = ' . session::get('user_id') . ', TABLE = ' . $table . ', QUERY STRING = ' . $sql . ' #SERVER MSG ' . self::dbError());
		} else {
			fn::log('SUCCESS # DB QUERY, USER = ' . session::get('user_id') . ', TABLE = ' . $table . ', QUERY STRING = ' . $sql);
		}

		if (self::numRows($res) >= 1) {
			$record = self::fetchAssoc($res);
		}

		return $record;
	}

	public static function count($table, $additionalSQL = '') {
		@$res = self::record($table, 'COUNT(*) AS jumlah', $additionalSQL);
		if(is_array($res)){
			return (int)$res['jumlah'];
		}else{
			return 0;
		}
	}
    public static function getFields($table=''){
        $driver = Config::$database['dbtype'];
        if ($driver == 'sqlite') {
            $sql = "PRAGMA table_info('" . $table . "');";
            $key = "name";
        } elseif ($driver == 'mysql') {
            $sql = "DESCRIBE " . $table . ";";
            $key = "Field";
        } else {
            $sql = "SELECT column_name FROM information_schema.columns WHERE table_name = '" . $table . "';";
            $key = "column_name";
        }

        if (false !== ($list = self::run($sql))) {
            $fields = array();
            foreach ($list as $record)
                $fields[] = $record[$key];
            return $fields;
        }else{
            return array();
        }
    }
}
register_shutdown_function(array('db', 'close'));