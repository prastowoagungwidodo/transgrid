/* Data Grid (Open Source Datagrid plugin)
 * Example : $('#element').TransGrid({ url:'file_ajax.php' });
 * agung@transformatika.com
 */
$.fn.TransGrid = function(options){
    //setting default value 
    var element = this;
    var currentUrl = window.location.pathname;
    var defaults = {
        url : currentUrl, // return nya harus json
        ajaxtipe: 'post',
        data :'',
        tablehead:'',
        editable:false,
        url_edit:'',
        url_delete:'',
        url_insert:'',
        url_order:'',
        edit_field:'',
        custom_edit:false,
        insert_field:'',
        custom_insert:false,
        search_field:'',
        status_field:'',
        base_url :'',
        path:'',
        limit:20,
        total_data:0,
        width:'100%',
        keyword:'',
        title:'Transformatika Data Grid',
        arr_val:'',
        arr_idx:'',
        sortable:false,
        order_field:'',
        link:'',
        pkey : '', // Primary Key
		custom_button :'',
        uniqueID : '___'
    },
    settings = $.extend({}, defaults, options);
    var tot_page = Math.ceil(settings.total_data / settings.limit);
    if(tot_page == 0){
        tot_page = 1;
    }
//    console.log(tot_page);
    Tgridreload(1);
    function Tgridreload(page){
        var respon = '';
        $.ajax({
            url:settings.url,
            type:settings.ajaxtipe,
            data:settings.data+'&page='+page+'&keyword='+settings.keyword,
            dataType:'json',
            beforeSend: function() {
                WriteStatus('loading','Loading. Please Wait');
            },
            success: function(res){
                remove_element('theTrueMsg');
                // HITUNG PAGING NYA
                //var tot_data = res.length;
                
                var mulai;
                var no;
                var akhir;
                if(page == 1){
                    mulai = 0;
                    akhir = settings.limit - 1;
                    no = 1;
                }else{
                    mulai = parseInt((parseInt(page) -1 ) * settings.limit);
                    akhir = mulai + settings.limit;
                    no = mulai + 1;
                }
                if(settings.editable == true){
                    respon += '<div class="btn-toolbar" role="toolbar" style="margin-bottom:10px;">';
                    respon += '<div class="btn-group btn-group-sm">';
                    respon += '<a class="btn btn-sm btn-default middle btn-enable" id="AddTGrid'+settings.uniqueID+'" href="#" data-page="'+page+'"><span class="glyphicon glyphicon-plus"></span> Add New</a>';
                    respon += '<a class="btn btn-sm btn-default middle btn-disable" id="SaveGrid'+settings.uniqueID+'" href="#" data-id="" data-op="none" data-page="'+page+'"><span class="glyphicon glyphicon-floppy-disk"></span> Save</a>';
		            respon += settings.custom_button;
                    respon += '</div>';
	                respon += '<div class="input-group col-md-2 pull-right">';
                    respon += '<input type="text" id="searchkey'+settings.uniqueID+'" class="form-control input-sm" placeholder="Search" value="'+settings.keyword+'"><span class="input-group-addon input-sm"><i class="glyphicon glyphicon-search"></i></span>';
                    respon += '</div>';
                    respon += '</div>';
                }
                respon += '<div class="panel panel-default">';
                //respon += '<div class="window-header">'+settings.title+'<a href="#" class="right_button" data-toggle="false"><i class="control-icon collapse-top"></i></a></div>';

                respon += '<div class="table-responsive">';
                respon +='<table id="TransGrid'+settings.uniqueID+'" class="table">';
                if(res.length == 0){
                    var cols;
                    respon += '<thead>';
                    if(settings.tablehead != ''){
                        respon +='<tr><th width="24px">No</th>';
                        $.each(settings.tablehead, function(key, val) {
                            respon += '<th>'+val+'</th>';
                        });
                        if(settings.editable == true){
                            respon += '<th width="20"><span class="ui-icon ui-icon-trash" style="width:16px"></span></th>';
                            cols = parseInt(settings.tablehead.length) + 2;
                        }else{
                            cols = parseInt(settings.tablehead.length) + 1;
                        }
                        respon +='</tr>';
                    }else{
                        cols = 1;
                    }
                    respon +='</thead>';
                    respon +='<tbody class="kontene">';
                    respon += '<tr><td colspan="'+cols+'">Data not found</td></tr></tbody></table>';
                    respon += '</div>';
                    respon += '</div>';
                }else{
                    respon += '<thead>';
                    if(settings.tablehead == ''){
                        respon +='<tr><th width="24px">No</th>';
                        $.each(res, function(key, val) {
                            if(key == 0){
                                $.each(val,function(i,value){
                                    if(i != settings.pkey){
                                        respon += '<th>'+i+'</th>';
                                    }
                                });
                            }
                        });
                        if(settings.editable == true){
                            respon += '<th style="width:60px;" class="text-center"><span class="glyphicon glyphicon-trash"></span></th>';
                        }
                        respon +='</tr>';
                    }else{
                        respon +='<tr><th width="24px">No</th>';
                        $.each(settings.tablehead, function(key, val) {
                            respon += '<th>'+val+'</th>';
                        });
                        if(settings.editable == true){
                            respon += '<th style="width:60px;" class="text-center"><i class="glyphicon glyphicon-trash"></i></th>';
                        }
                        respon +='</tr>';
                    }
                    respon +='</thead>';
                    respon +='<tbody class="kontene">';
                    $.each(res, function(keys, vals) {
                        //if(keys >= mulai && keys <= akhir){
                            var editId;
                            var trClass = '';
                            var viewClass = '';
                            var array_field;
                            if(settings.edit_field == ''){
                                array_field = [];
                            }else{
                                array_field = settings.edit_field;
                            }
                            $.each(vals,function(iii,valuess){
                                if(iii == settings.pkey){
                                    editId = valuess;
                                }else{
                                    if(settings.edit_field == ''){
                                        array_field.push(iii);
                                    }
                                }
                            });
                            if(settings.editable == true){
                                trClass = 'editThis'+settings.uniqueID;
                                viewClass = 'view'+settings.uniqueID;
                            }else{
                                trClass = 'linkThis'+settings.uniqueID;
                                viewClass = '';
                            }
                            respon +='<tr class="'+trClass+'" data-id="'+editId+'" id="reCord'+settings.uniqueID+'_'+editId+'" data-page="'+page+'">';
                            respon +='<td class="levelonehandle" id="reCord'+settings.uniqueID+editId+'" width="24px" style="text-align:center;cursor:move"><span id="reCord'+settings.uniqueID+editId+'">'+no+'</span></td>';
                              
                            $.each(vals,function(ii,values){
                                if(ii != settings.pkey){
                                    respon += '<td><span id="'+viewClass+editId+'" class="viewData'+settings.uniqueID+'">';
                                    if($.inArray(values,settings.arr_idx) >= 0){
                                        $.each(settings.arr_val,function(kval,vval){
                                            $.each(vval,function(kkval,vvval){
                                                if(kkval == values){
                                                    respon += vvval;
                                                }
                                            });
                                        });    
                                    }else{
                                        if(ii == settings.status_field){
                                            if(values.toUpperCase() == 'Y'){
                                                respon += 'Active';
                                            }else if(values.toUpperCase() == 'N'){
                                                respon += 'Not Active';
                                            }else if(values.toUpperCase() == 'D'){
                                                respon += 'Deleted';
                                            }
                                        } else if(isNaN(values) && (values.toUpperCase() === 'Y' || values.toUpperCase() === 'N')){
                                            if(values.toUpperCase() === 'Y'){
                                                respon += 'Yes';
                                            }else if(values.toUpperCase() === 'N'){
                                                respon += 'No';
                                            }
                                        }else{
                                            respon += values;
                                        }
                                    }
                                    
                                    respon +=' </span>';
                                    if(settings.editable==true){
                                        respon += '<span style="display:none;" id="edit'+settings.uniqueID+editId+'" class="editData'+settings.uniqueID+'">';
                                        if(settings.custom_edit == false){
                                            $.each(settings.edit_field,function(kk,vv){
                                                if($.inArray(ii,vv)){
                                                $.each(vv,function(vk,vvv){
                                                    if(ii == vk){
                                                        if(vvv == 'varchar'){
                                                            respon += '<input type="text" name="'+vk+'" class="form-control input-sm" value="'+values+'">';
                                                        }else if(vvv == 'text'){
                                                            respon += '<textarea name="'+vk+'"  class="form-control input-sm">'+values+'</textarea>';
                                                        }else if(vvv == 'date'){
                                                            respon += '<input class="datepickers form-control input-sm" name="'+vk+'" value="'+values+'">';
                                                        }else if(vvv == 'datetime'){
                                                            respon += '<input class="datetimepickers form-control input-sm" name="'+vk+'" value="'+values+'">';
                                                        }else if(vvv == 'int' || vvv == 'bigint'){
                                                            respon += '<input type="text" name="'+vk+'" class="form-control input-sm" value="'+values+'">';
                                                        }else if(vvv =='radio'){
                                                            respon += '<input type="radio" name="'+editId+'_'+vk+'" value="y"';
                                                            if(values == 'y'){
                                                                respon += ' checked="checked"'
                                                            }    
                                                            respon += '> Active&nbsp;';
                                                            respon += '<input type="radio" name="'+editId+'_'+vk+'" value="n"';
                                                            if(values == 'n'){
                                                                respon += ' checked="checked"'
                                                            } 
                                                            respon += '> Not Active';
                                                        }else if(vvv =='yesno'){
                                                            respon += '<input type="radio" name="'+editId+'_'+vk+'" value="y"';
                                                            if(values == 'y'){
                                                                respon += ' checked="checked"'
                                                            }    
                                                            respon += '> Yes&nbsp;';
                                                            respon += '<input type="radio" name="'+editId+'_'+vk+'" value="n"';
                                                            if(values == 'n'){
                                                                respon += ' checked="checked"'
                                                            } 
                                                            respon += '> No';
                                                        }else if(vvv == 'selectYear'){
                                                            var currentTime = new Date()
                                                            var year = currentTime.getFullYear()
                                                            var nextYear = parseInt(year) + 5;
                                                            respon += '<select name="'+vk+'" classs="form-control input-sm">';
                                                            for(i=year;i<=nextYear;i++){
                                                                respon += '<option value="'+i+'"'
                                                                if(i == values){
                                                                    respon += ' selected="selected"';
                                                                }    
                                                                respon += '>'+i+'</option>';
                                                            }
                                                            respon += '</select>';
                                                        }else{
                                                            respon += '<input type="text" name="'+vk+'" class="form-control input-sm" value="'+values+'">';
                                                        }
                                                    }
                                                });
                                                }else{
                                                    respon += values;
                                                }
                                            });
                                        }else{
                                            $.each(settings.edit_field,function(kk,vv){
                                                if($.inArray(ii,vv)){
                                                    $.each(vv,function(vk,vvv){
                                                        if(ii == vk){
                                                            var htm = vvv;
                                                            var html = htm.replace('id="'+vk+'"','');
                                                            var htmls;
                                                            if(html.indexOf('<input type="text"') >= 0){
                                                                htmls = html.replace('value','value="'+values+'"');
                                                            }else if (html.indexOf('<select name') >= 0){
                                                                htmls = html.replace('<option value="'+values.toUpperCase()+'"','<option value="'+values.toUpperCase()+'" selected="selected"');
                                                            }else{
                                                                htmls = html;
                                                            }
                                                            respon += htmls;
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                        
                                        respon += '</span>';
                                    }
                                    respon += '</td>';
                                }
                            });
                            no++;
                            if(settings.editable==true){
                                respon += '<td style="width:60px;" class="text-center"><span data-id="'+editId+'" data-page="'+page+'" class=" RemoveData'+settings.uniqueID+' glyphicon glyphicon-trash" style="width:16px;cursor:pointer;"></span></td>';
                            }
                            respon +='</tr>';
                       // }
                    });
                    respon +='</tbody>';
                    respon +='</table>';
                    respon += '</div>';
                    respon += '</div>';
                    respon +='<div class="row">';
                    respon += '<div class="col-md-6">';
                    respon += '<div class="btn-group btn-group-sm">';
                    respon += '<a href="#" ';
                    if(page > 1){
                        var prev = parseInt(page) - 1;
                        respon += ' class="Treload'+settings.uniqueID+' btn btn-default" data-id="'+prev+'"';
                    }else{
                        respon += ' class="btn btn-default disabled" ';
                    }    
                    respon += '><i class="fa fa-arrow-left"></i> Prev</a>';
                    respon += '<button class="btn btn-default">';
                    respon += 'Page: '+page+' of '+tot_page;
                    respon += '</button>';
                    respon += '<a href="#" ';
                    if(page < tot_page){
                        var next = parseInt(page) + 1;
                        respon += ' class="Treload'+settings.uniqueID+' btn btn-default" data-id="'+next+'"';
                    }else{
                        respon += ' class="btn btn-default disabled" ';
                    }      
                    respon += '>Next <i class="fa fa-arrow-right"></i></a>';
                    respon +='</div>';
                    respon +='</div>';
                    respon += '<div class="col-md-6 text-right">';
                    var urutan = Math.ceil((page - 1) * settings.limit) + 1;
                    respon +='Menampilkan '+urutan+' - '+(no - 1)+' dari '+parseInt(settings.total_data);
                    respon +='</div>';
                    respon +='</div>';
                }

                element.html(respon);
                if(settings.sortable == true){
                    enableSortable(page);
                }
                //$('.window-header.collapsible').prepend('<a href="#" class="right_button" data-toggle="false"><i class="control-icon collapse-top"></i></a>');
            }
        });
        return false;
    }
    function WriteStatus(tipe,pesan){
        var str;
        if(tipe == 'success'){
            str = '<div id="theTrueMsg" onclick="javascript:$(\'#theTrueMsg\').remove();" title="Click to close" style="position:fixed;width:300px;height:70px;bottom:30px;right:25px;z-index:99999;">'
            	+'<div class="alert alert-success">'
                +'<p syle="font-weight:bold;">SUKSES</p>'
            	+'<p>'
            	+pesan
            	+'</div>'+
            	'</div>';
            $('body').prepend(str);
            setTimeout('$(\'#theTrueMsg\').remove();',2000);
        }else if(tipe == 'error'){
            str = '<div id="theTrueMsg" onclick="javascript:$(\'#theTrueMsg\').remove();" title="Click to close" style="position:fixed;width:300px;height:70px;bottom:30px;right:25px;z-index:99999;">'
                +'<div class="alert alert-danger">'
                +'<p syle="font-weight:bold;">ERROR!</p>'
                +'<p>'
                +pesan
                +'</div>'+
                '</div>';
            $('body').prepend(str);
            setTimeout('$(\'#theTrueMsg\').remove();',2000);
        }else if(tipe == 'loading'){
            str = '<div id="theTrueMsg" onclick="javascript:$(\'#theTrueMsg\').remove();" title="Click to close" style="position:fixed;width:300px;height:70px;bottom:30px;right:25px;z-index:99999;">'
                +'<div class="alert alert-info">'
                +'<p syle="font-weight:bold;">Loading...</p>'
                +'<p>'
                +pesan
                +'</div>'+
                '</div>';
            $('body').prepend(str);
            setTimeout('$(\'#theTrueMsg\').remove();',2000);
        }
    }
    function remove_element(eId){
        return(EObj=document.getElementById(eId))?EObj.parentNode.removeChild(EObj):false;
    }
    $(document).on('click',".Treload"+settings.uniqueID,function(){
        var datanya = $(this).attr('data-id');
        Tgridreload(datanya);
    });
    $(document).on('click','#AddTGrid'+settings.uniqueID,function(){
        if ($("#SaveNewGrid"+settings.uniqueID).length > 0){
            $('#SaveNewGrid'+settings.uniqueID).remove();
            $('#SaveGrid'+settings.uniqueID).attr('data-op','none');
            $('#SaveGrid'+settings.uniqueID).removeClass('btn-enable');
            $('#SaveGrid'+settings.uniqueID).addClass('btn-disable');
            $("#AddTGrid"+settings.uniqueID).html('<span class="glyphicon glyphicon-plus"></span> Add New');
        }else{
            
            var pages = $(this).attr('data-page');
            var appends = '';
            if(settings.tablehead == '' || settings.insert_field == ''){
                alert('insert_field or tablehead not define');
                $("#AddTGrid"+settings.uniqueID).html('<span class="glyphicon glyphicon-plus"></span> Add New');
                $("#SaveGrid"+settings.uniqueID).attr('data-op','none');
                $("#SaveGrid"+settings.uniqueID).removeClass('btn-enable');
                $("#SaveGrid"+settings.uniqueID).addClass('btn-disable');
            }else{
                $('#SaveGrid'+settings.uniqueID).removeClass('btn-disable');
                $('#SaveGrid'+settings.uniqueID).addClass('btn-enable');
                $('#SaveGrid'+settings.uniqueID).attr('data-op','addnew');
                appends += '<tr id="SaveNewGrid'+settings.uniqueID+'" data-page="'+pages+'">';
                appends += '<td width="24" style="text-align:center;">+</td>';
                if(settings.custom_insert == false){
                    $.each(settings.insert_field,function(kk,vv){
                        $.each(vv,function(vk,vvv){
                            if(vvv == 'varchar' || vvv == 'character varying'){
                                appends += '<td><input type="text" name="'+vk+'" class="form-control input-sm"></td>';
                            }else if(vvv == 'text'){
                                appends += '<td><textarea name="'+vk+'" class="form-control input-sm"></textarea></td>';
                            }else if(vvv == 'date'){
                                appends += '<td><input class="datepickers form-control input-sm" id="datepicker'+kk+'" name="'+vk+'"></td>';
                                //bind_datepicker('datepicker'+kk);
                            }else if(vvv == 'datetime'){
                                appends += '<td><input class="datetimepickers form-control input-sm" name="'+vk+'"></td>';
                            }else if(vvv == 'int' || vvv == 'bigint'){
                                appends += '<td><input type="text" name="'+vk+'" class="form-control input-sm"></td>';
                            }else if(vvv =='radio'){
                                appends += '<td><input type="radio" name="'+vk+'" value="y" checked="checked"> Active&nbsp;';
                                appends += '<input type="radio" name="'+vk+'" value="n"> Not Active</td>';
                            }else if(vvv == 'selectYear'){
                                var currentTime = new Date()
                                var year = currentTime.getFullYear()
                                var nextYear = parseInt(year) + 5;
                                appends += '<td>';
                                appends += '<select name="'+vk+'" class="form-control input-sm">';
                                for(i=year;i<=nextYear;i++){
                                    appends += '<option value="'+i+'"'
                                    if(i == year){
                                        appends += ' selected="selected"';
                                    }    
                                    appends += '>'+i+'</option>';
                                }
                                appends += '</select></td>';
                            }else{
                                appends += '<td><input type="text" name="'+vk+'" class="form-control input-sm"></td>';
                            }
                        });
                    });
                }else{
                    $.each(settings.insert_field,function(kk,vv){
                        $.each(vv,function(vk,vvv){
                            appends += '<td>'+vvv+'</td>';
                        });
                    });
                }
                
                appends += '<td width="24"></td>';
                appends += '</tr>';
            }
            $("#AddTGrid"+settings.uniqueID).html('<span class="fa fa-undo"></span> Cancel');
            $("#TransGrid"+settings.uniqueID).append(appends);
            //bind_datepicker();
        }
    });
    
//    $("tr#SaveNewGrid").live('change',function(){
//        var fields = {};
//        var pages = $(this).attr('data-page');
//        $('tr#SaveNewGrid input,select,textarea').each(function(){
//            var el = $(this);
//            if(el.attr('type') == 'radio'){
//                var nam = el.attr('name');
//                fields[nam] = $('input[name='+nam+']:checked').val(); 
//            }else{
//                fields[el.attr('name')] = el.val(); 
//            }
//        });
//        var ErrorCek = 0;
//        $.each(fields,function(kkk,vvv){
//            if(vvv.length < 1){
//                ErrorCek = 1;
//            }
//        });
//        if(ErrorCek == 0){
//            if(confirm('Are you sure want to save this data?')){
//                $.ajax({
//                    type:'post',
//                    url: settings.url_insert,
//                    data:fields,
//                    beforeSend: function() { WriteStatus('loading','Loading. Please Wait...'); },
//                    success:function(){
//                        Tgridreload(pages);
//                    }
//                });
//            }
//        }
//    });
    $(document).on('click','.RemoveData'+settings.uniqueID,function(e){
        e.preventDefault();
        var id = $(this).attr('data-id');
        var pages = $(this).attr('data-page');
        if(confirm('Apakah Anda yakin akan menghapus data ni?')){
            $.ajax({
                type:'post',
                url:settings.url_delete,
                data:settings.pkey+'='+id,
                beforeSend:function(){
                    WriteStatus('loading','Mohon tunggu. Sedang memproses data');
                },
                success:function(res){
                    if(res == 'success'){
                        WriteStatus('success','Data berhasil dihapus');
                        var tmpp = parseInt(settings.total_data);
                        settings.total_data = tmpp - 1;
                    }else{
                        WriteStatus('error','Data gagal dihapus');
                    }
                    tot_page = Math.ceil(settings.total_data / settings.limit);
                    if(tot_page == 0){
                        tot_page = 1;
                    }
                    if(pages > tot_page){
                        Tgridreload(tot_page);
                    }else{
                        Tgridreload(pages);
                    }

                }
            });
        }
        return false;
    })
    $(document).on('click','.editThis'+settings.uniqueID,function(e){
        
            var ID = $(this).attr('data-id');
            var pages = $(this).attr('data-page');
            $("#TransGrid tr").children('td').css('background','#FAFAFA');
            $(this).children('td').css('background','#F5F5F5');
            $('.viewData'+settings.uniqueID).show();
            $('.editData'+settings.uniqueID).hide();
            $('span#view'+settings.uniqueID+ID).hide();
            $('span#edit'+settings.uniqueID+ID).show();
            $('#SaveGrid'+settings.uniqueID).attr('data-id',ID);
            $('#SaveGrid'+settings.uniqueID).attr('data-op','edit');
            $('#SaveGrid'+settings.uniqueID).removeClass('btn-disable');
            $('#SaveGrid'+settings.uniqueID).addClass('btn-enable');
            
    });
    $(document).on('click','.linkThis'+settings.uniqueID,function(){
        var ID = $(this).attr('data-id');
        window.location.href= settings.link+'&id='+ID;
    });
    $(document).on('keypress','.integerInput',function(e){
        var a = [];
        var k = e.which;
        for (i = 48; i < 58; i++)
            a.push(i);

        if (!(a.indexOf(k)>=0))
            e.preventDefault();
    });
    $(document).on('keyup',"#searchkey"+settings.uniqueID,function(e){
        if(e.keyCode == 13){
            var keys = $(this).val();
            settings.keyword = keys;
            Tgridreload(1);
        }
    });
    $(document).on("click",'#SaveGrid'+settings.uniqueID,function(e){
        e.preventDefault();
        var fields = {};
        var ID = $(this).attr('data-id');
        var op = $(this).attr('data-op');
        var pages = $(this).attr('data-page');
        if(op == 'edit'){
            $('tr#reCord'+settings.uniqueID+'_'+ID+' :input').each(function(){
                var el = $(this);
                if(el.attr('type') == 'radio'){
                    var nam = el.attr('name');
                    var new_nam = nam.replace(ID+'_','');
                    fields[new_nam] = $('input[name='+nam+']:checked').val(); 
                }else{
                    fields[el.attr('name')] = el.val(); 
                }
            });
            fields[settings.pkey] = ID;
            $.ajax({
                type:'post',
                url: settings.url_edit,
                data:fields,
                beforeSend:function(){
                    WriteStatus('loading','Mohon tunggu. Sedang memproses data');
                },
                success:function(res){
                    if(res == 'success'){
                        WriteStatus('success','Data berhasil disimpan');
                    }else{
                        WriteStatus('error','Data gagal disimpan');
                    }
                    Tgridreload(pages);
                    $('#SaveGrid'+settings.uniqueID).removeClass('btn-enable');
                    $('#SaveGrid'+settings.uniqueID).addClass('btn-disable');
                }
            });
        }else if(op == 'addnew'){
            $('tr#SaveNewGrid'+settings.uniqueID+' :input').each(function(){
                var el = $(this);
                if(el.attr('type') == 'radio'){
                    var nam = el.attr('name');
                    fields[nam] = $('input[name='+nam+']:checked').val(); 
                }else{
                    fields[el.attr('name')] = el.val(); 
                }
            });
            var ErrorCek = 0;
            $.each(fields,function(kkk,vvv){
                if(vvv.length < 1){
                    ErrorCek = 1;
                }
            });
            if(ErrorCek == 0){
                //if(confirm('Are you sure want to save this data?')){
                    $.ajax({
                        type:'post',
                        url: settings.url_insert,
                        data:fields,
                        beforeSend:function(){
                            WriteStatus('loading','Mohon tunggu. Sedang memproses data');
                        },
                        //beforeSend: function() { WriteStatus('loading','Loading. Please Wait...'); },
                        success:function(res){
                            var tmpp = parseInt(settings.total_data);
                            settings.total_data = tmpp + 1;
                            tot_page = Math.ceil(settings.total_data / settings.limit);
                            if(tot_page == 0){
                                tot_page = 1;
                            }
                            Tgridreload(tot_page); // Redirect ke halaman terakhir
                            $('#SaveGrid'+settings.uniqueID).removeClass('btn-enable');
                            $('#SaveGrid'+settings.uniqueID).addClass('btn-disable');
                            if(res == 'success'){
                                WriteStatus('success','Data berhasil disimpan');
                            }else{
                                WriteStatus('error','Data gagal disimpan');
                            }
                            
                        }
                    });
                //}
            }
        }
    });
//    $(".editThis").live("mouseup",function(e){
//        if(!$(e.target).is('.levelonehandle')) {
//            return false
//        }
//    });
    
    $(document).on("mouseup","select",function(){
        return false
    });
    $(document).on("click","select",function(){
        return false;
    });
    
    $(document).on("mouseup",function(e){
        if ($("#SaveNewGrid"+settings.uniqueID).length == 0){
            if(!$(e.target).is('a#SaveGrid'+settings.uniqueID)) {
                $(".editData"+settings.uniqueID).hide();
                $(".viewData"+settings.uniqueID).show();
                $("#TransGrid"+settings.uniqueID+" tr").children('td').css('background','transparent');
                $('#SaveGrid'+settings.uniqueID).attr('data-op','none');
                $('#SaveGrid'+settings.uniqueID).removeClass('btn-enable');
                $('#SaveGrid'+settings.uniqueID).addClass('btn-disable');
            }
        }
    });

    function bind_datepicker(){
        $('input.datepickers').datetimepicker({
            pickTime: false,
            format:'YYYY-MM-DD'
        });

        //$("input.datepickers").datepicker({dateFormat: 'yy-mm-dd',showAnim: 'clip'});
        //$("input.datetimepickers").datetimepicker({dateFormat: 'yy-mm-dd',showAnim: 'clip'});
    }
    function enableSortable(page){
        $('#TransGrid'+settings.uniqueID+' tbody.kontene').sortable({
            handle:'.levelonehandle',
            update: function(){
                var order = $('table#TransGrid'+settings.uniqueID+' tbody.kontene').sortable().sortable('serialize');
                //console.log(order);
                $.ajax({
                    url:settings.url_order,
                    data:order+'&page='+page+'&limit='+settings.limit+'&unique_id='+settings.uniqueID,
                    type:'post',
                    success:function(){
                        Tgridreload(page);
                    }
                });
            }
        });
        $('#TransGrid'+settings.uniqueID+' tbody.kontene').disableSelection({handle:'.levelonehandle'});
    }
};
