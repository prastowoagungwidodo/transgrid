<?php
define('DS', DIRECTORY_SEPARATOR);
$GLOBALS ['base'] = dirname(__FILE__);
$base_url = ((isset ( $_SERVER ['HTTPS'] ) && $_SERVER ['HTTPS'] == "on") ? "https" : "http");
$base_url .= "://" . $_SERVER ['HTTP_HOST'];
$base_url .= str_replace ( basename ( $_SERVER ['SCRIPT_NAME'] ), "", $_SERVER ['SCRIPT_NAME'] );

define ( 'BASE_URL', $base_url );
function path($path) {
	return $GLOBALS [$path];
}

require_once path('base').'config.php';
Config::init();

require_once path('base').'loader.php';

load::library('fn');
load::library('db');

switch (@$_GET['action']) {
    case 'load':
        $offset = ($_POST['page'] - 1) * $_POST['limit'];
        $arr_field = explode(',', $_POST['field']);
        
        $additionalSQL = array();
        if(!empty($_POST['search_field'])){
        	$search_field = explode(',',$_POST['search_field']);
	        foreach ($search_field as $key) {
	        	if($key != $_POST['primary_key']){
	            	$additionalSQL[] = ' ' . $key . ' LIKE \'%' . $_POST['keyword'] . '%\' ';
	        	}
	        }
        }
        if ($_POST['status_field'] == '') {
            $where = 'WHERE ' . implode(' OR ', $additionalSQL);
        } else {
            $where = ' WHERE ' . $_POST['status_field'] . ' != \'d\'';
			if(count($additionalSQL) > 0){
            	$where .=  'AND  (' . implode(' OR ', $additionalSQL) . ') ';
			}
        }
        
        if ($_POST['sortable'] == 'false' || empty($_POST['sortable'])) {
            $orderBy = $_POST['primary_key'];
        } else {
            $orderBy = $_POST['order_field'];
        }
        $where .= ' ORDER BY '.$orderBy;
        $where .= ' LIMIT '.$_POST['limit'].' OFFSET '.$offset.' ';
        $data = db::recordList($_POST['table'], $_POST['field'], $where);
        
        echo json_encode($data);
        break;
    case 'edit':
//        $_POST['edit_by'] = $_SESSION['user_id'];
//        $_POST['edit_date'] = date('Y-m-d H:i:s');
        $exe = db::update($_GET['table'], $_POST, 'WHERE ' . $_GET['primary_key'] . ' = \'' . $_POST[$_GET['primary_key']] . '\'');
        if ($exe) {
            echo 'success';
        } else {
            echo 'error';
        }
        break;
    case 'addnew':
//        $_POST['entry_by'] = $_SESSION['user_id'];
//        $_POST['entry_date'] = date('Y-m-d H:i:s');
        $_POST[$_GET['primary_key']] = fn::getId();
        if ($_GET['sortable'] == 'true') {
            $cek = db::record($_GET['table'],"MAX(" . $_GET['order_field'] . ") AS maks",'');
            $maks = $cek['maks'];
            $_POST[$_GET['order_field']] = (int) $maks + 1;
        }

        $exe = db::insert($_GET['table'], $_POST);
        if ($exe) {
            echo 'success';
        } else {
            echo 'error';
        }
        break;
    case 'delete':
        $datas[$_GET['status_field']] = 'd';
        $exe = db::update($_GET['table'], $datas, 'WHERE  ' . $_GET['primary_key'] . ' = \'' . $_POST[$_GET['primary_key']] . '\'');
        if ($exe) {
            echo 'success';
        } else {
            echo 'error';
        }
        break;
    case 'reorder':
        $array = $_POST['reCord'.$_POST['unique_id']];
        $page = $_POST['page'];
        $limit = $_POST['limit'];
        foreach ($array as $key => $val) {
            if ($page == 1) {
                $reOrder = (int) ($key + 1);
            } else {
                $reOrder = (int) ($key + ((int) (($page - 1) * $limit) + 1));
            }
            $exe = db::query("UPDATE " . $_GET['table'] . " SET " . $_GET['order_field'] . " = '" . $reOrder . "' WHERE " . $_GET['primary_key'] . " = '" . $val . "'");
        }
        break;
}
?>
