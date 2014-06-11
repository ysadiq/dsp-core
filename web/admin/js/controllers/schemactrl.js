/**
 * This file is part of the DreamFactory Services Platform(tm) (DSP)
 *
 * DreamFactory Services Platform(tm) <http://github.com/dreamfactorysoftware/dsp-core>
 * Copyright 2012-2014 DreamFactory Software, Inc. <support@dreamfactory.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var SchemaCtrl = function( $scope, Schema, DSP_URL, DB, $http, getSchemaServices ) {
//	$( "#grid-container" ).hide();
////	$scope.$on(
////		'$routeChangeSuccess', function() {
////			$( window ).resize();
////		}
////	);
//	Scope = $scope;
//	Scope.tableData = [];
//	Scope.booleanOptions = [
//		{value: true, text: 'true'},
//		{value: false, text: 'false'}
//	];

//	var schemaInputTemplate = '<input class="ngCellText" ng-class="\'colt\' + col.index" data-ng-input="COL_FIELD" data-ng-model="COL_FIELD"  data-ng-change="enableSchemaSave()" />';
//	var schemaButtonTemplate = '<div ><button id="add_{{row.rowIndex}}" class="btn btn-sm btn-primary"  ng-show="this.row.entity.new" ng-click="schemaAddField()"><li class="icon-save"></li></button>' +
//							   '<button id="save_{{row.rowIndex}}" ng-show="!this.row.entity.new" class="btn btn-sm btn-primary"  ng-click="schemaUpdateField()"><li class="icon-save"></li></button>' +
//							   '<button class="btn btn-sm btn-danger" ng-show="!this.row.entity.new" ng-click="schemaDeleteField()"><li class="icon-remove"></li></button>' +
//							   '<button class="btn btn-sm btn-danger" ng-show="this.row.entity.new"  ng-click="schemaDeleteField(true)"><li class="icon-remove"></li></button></div>';
//	var typeTemplate = '<select class="ngCellText"  ng-class="col.colIndex()" ng-options="option.value as option.text for option in typeOptions" ng-model="row.entity[col.field]" data-ng-change="enableSchemaSave()">{{COL_FIELD CUSTOM_FILTERS}}</select>';
//	Scope.columnDefs = [];
//	Scope.browseOptions = {};
//	Scope.browseOptions =
//    {data: 'tableData', enableColumnResize: true, enableCellSelection: true, selectedItems: Scope.selectedRow, enableCellEditOnFocus: true, enableRowSelection: false, multiSelect: false, displaySelectionCheckbox: false, columnDefs: 'columnDefs'};
//    Scope.Schemas = Schema.get(
//		function( data ) {
//			Scope.schemaData = data.resource;
//		}
//	);
//	Scope.showForm = function() {
//        Scope.currentTable = '';
//		$( "#grid-container" ).hide();
//		$( "#json_upload" ).hide();
//		$( ".detail-view" ).show();
//		$( "#create-form" ).show();
//		$( "tr.info" ).removeClass( 'info' );
//		$( window ).scrollTop( 0 );
//	};
//	Scope.showSchema = function() {
//		$( "#create-form" ).hide();
//		$( "#json_upload" ).hide();
//		$( ".detail-view" ).show();
//		var columnDefs = [];
//		Scope.browseOptions = {};
//		Scope.tableData = [];
//		Scope.columnDefs = [];
//		Scope.currentSchema = [];
//        Scope.currentTable = this.table.name;
//		Schema.get(
//			{ name: this.table.name }, function( data ) {
//				Scope.tableSchema = data;
//                Scope.editableSchema = JSON.stringify(Scope.tableSchema, null, "  " );
//				var saveColumn = {};
//				saveColumn.field = '';
//				saveColumn.enableCellEdit = false;
//				saveColumn.cellTemplate = schemaButtonTemplate;
//				saveColumn.width = '70px';
//				columnDefs.push( saveColumn );
//				var column = {};
//				var keys = Object.keys( Scope.tableSchema.field[0] );
//				keys.forEach(
//					function( key ) {
//						if ( key === 'type' ) {
//                            column.cellTemplate = typeTemplate;
//							column.enableCellEdit = false;
//
//						}
//						else {
//                            column.editableCellTemplate = schemaInputTemplate;
//                            column.enableCellEdit = true;
//						}
//
//						//column.enableFocusedCellEdit = true;
//						column.width = '100px';
//						column.field = key;
//						columnDefs.push( column );
//						column = {};
//					}
//				);
//				Scope.columnDefs = columnDefs;
//				Scope.tableData = Scope.tableSchema.field;
//				Scope.tableData.unshift( {"new": true} );
//
//			}
//		);
//
//		//console.log(this);
//		Scope.action = "Alter";
//		$( "#grid-container" ).show();
//
//		$( "tr.info" ).removeClass( 'info' );
//		$( '#row_' + this.table.name ).addClass( 'info' );
//		//console.log(this);
//	};
//	Scope.newTable = {};
//	Scope.newTable.table = {};
//	Scope.newTable.table.field = [];
//	Scope.addField = function() {
//
//		Scope.newTable.table.name = Scope.schema.table.name;
//		Scope.newTable.table.field.push( Scope.schema.table.field );
//		Scope.schema.table.field = {};
//	};
//	Scope.removeField = function() {
//		Scope.newTable.table.field = removeByAttr( Scope.newTable.table.field, 'name', this.field.name );
//
//	};
//	Scope.schemaAddField = function() {
//		var table = this.tableSchema.name;
//		var row = this.row.entity;
//		$http.put( '/rest/schema/' + table + '/?app_name=admin', row ).success(
//			function( data ) {
//				Scope.tableData = removeByAttr( Scope.tableData, 'new', true );
//				Scope.tableData.unshift( data );
//				Scope.tableData.unshift( {"new": true} );
//			}
//		);
//
//	};
//	Scope.schemaUpdateField = function() {
//		var table = this.tableSchema.name;
//		var row = this.row.entity;
//		var index = this.row.rowIndex;
//		$http.put( '/rest/schema/' + table + '/' + row.name + '/?app_name=admin', row ).success(
//			function( data ) {
//				$( "#save_" + index ).attr( 'disabled', true );
//			}
//		);
//
//	};
//	Scope.schemaDeleteField = function( gridOnly ) {
//		var table = this.tableSchema.name;
//		var name = this.row.entity.name;
//		which = name;
//		if ( !which || which == '' ) {
//			which = "the field?";
//		}
//		else {
//			which = "the field '" + which + "'?";
//		}
//		if ( !confirm( "Are you sure you want to delete " + which ) ) {
//			return;
//		}
//		if ( !gridOnly ) {
//			$http.delete( '/rest/schema/' + table + '/' + name + '?app_name=admin' );
//		}
//		Scope.tableData = removeByAttr( Scope.tableData, 'name', name );
//		//Scope.tableData.shift();
//		//Scope.tableData.unshift({"new":true});
//	};
//
//	Scope.create = function() {
//		Schema.save(
//			Scope.newTable, function( data ) {
//				$.pnotify(
//					{
//						title: Scope.newTable.table.name,
//						type:  'success',
//						text:  'Created Successfully'
//					}
//				);
//				Scope.showForm();
//				//window.top.Actions.showStatus("Created Successfully");
//				Scope.schemaData.push( Scope.newTable.table );
//				Scope.schema.table = {};
//				Scope.newTable = {};
//				Scope.newTable.table = {};
//				Scope.newTable.table.field = [];
//
//			}
//		);
//	};
//	//noinspection ReservedWordAsName
//	Scope.delete = function() {
//		var name = this.table.name;
//		which = name;
//		if ( !which || which == '' ) {
//			which = "the table?";
//		}
//		else {
//			which = "the table '" + which + "'?";
//		}
//		if ( !confirm( "Are you sure you want to drop " + which ) ) {
//			return;
//		}
//		Schema.delete(
//			{ name: name }, function() {
//				$.pnotify(
//					{
//						title: name,
//						type:  'success',
//						text:  'Dropped Successfully'
//					}
//				);
//				Scope.showForm();
//				//window.top.Actions.showStatus("Deleted Successfully");
//				$( "#row_" + name ).fadeOut();
//			}
//		);
//	};
//
//	Scope.validateJSON = function() {
//		try {
//			var result = jsonlint.parse( document.getElementById( "source" ).value );
//			if ( result ) {
//				document.getElementById( "result" ).innerHTML = "JSON is valid!";
//				document.getElementById( "result" ).className = "pass";
//				if ( document.getElementById( "reformat" ).checked ) {
//					document.getElementById( "source" ).value = JSON.stringify( result, null, "  " );
//				}
//			}
//		}
//		catch ( e ) {
//			document.getElementById( "result" ).innerHTML = e;
//			document.getElementById( "result" ).className = "fail";
//		}
//	};
//	Scope.showJSON = function() {
//        $( "#create-form" ).hide();
//        $( "#grid-container" ).hide();
//		$( "#json_upload" ).show();
//	};
//	Scope.postJSON = function() {
//		var json = $( '#source' ).val();
//		Schema.save(
//			json, function( data ) {
//				if ( !data.table ) {
//					Scope.schemaData.push( data );
//				}
//				else {
//					data.table.forEach(
//						function( table ) {
//							Scope.schemaData.push( table );
//						}
//					)
//				}
//
//			}
//		);
//
//	};
//	Scope.enableSave = function() {
//		$( "#save_" + this.row.rowIndex ).attr( 'disabled', false );
//		//console.log(this);
//	};
//	Scope.enableSchemaSave = function() {
//		$( "#add_" + this.row.rowIndex ).attr( 'disabled', false );
//		$( "#delete_" + this.row.rowIndex ).attr( 'disabled', false );
//		$( "#save_" + this.row.rowIndex ).attr( 'disabled', false );
//		//console.log(this);
//	};
//
//	Scope.saveRow = function() {
//
//		var index = this.row.rowIndex;
//		var newRecord = this.row.entity;
//		if ( !newRecord.id ) {
//			DB.save(
//				{name: Scope.currentTable}, newRecord, function( data ) {
//					$( "#save_" + index ).attr( 'disabled', true );
//					Scope.tableData.push( data );
//				}
//			);
//		}
//		else {
//			DB.update(
//				{name: Scope.currentTable}, newRecord, function() {
//					$( "#save_" + index ).attr( 'disabled', true );
//				}
//			);
//		}
//
//	};
//	Scope.schemaSaveRow = function() {
//
//		var table = this.tableSchema.name;
//		var row = this.row.entity;
//
//		$http.put( '/rest/schema/' + table + '/?app_name=admin', row ).success(
//			function( data ) {
//				Scope.tableData = removeByAttr( Scope.tableData, 'new', true );
//				Scope.tableData.unshift( data );
//				Scope.tableData.unshift( {"new": true} );
//			}
//		);
//
//	};
//	Scope.deleteRow = function() {
//		var id = this.row.entity.id;
//		DB.delete( {name: Scope.currentTable}, {id: id} );
//		Scope.tableData = removeByAttr( Scope.tableData, 'id', id );
//
//	}
    Scope = $scope;
    $scope.typeOptions = [
        {value: "id"},
        {value: "string"},
        {value: "integer"},
        {value: "text"},
        {value: "boolean"},
        {value: "binary"},
        {value: "float"},
        {value: "decimal"},
        {value: "datetime"},
        {value: "date"},
        {value: "time"},
        {value: "reference"},
        {value: "user_id"},
        {value: "user_id_on_create"},
        {value: "user_id_on_update"},
        {value: "timestamp_on_create"},
        {value: "timestamp_on_update"}
    ];
    var editor;
    $scope.table = {};
    $scope.service = {};
    $scope.advanced = false;
    var service;
    editor = ace.edit("schema-editor");
    editor.getSession().setMode("ace/mode/json");
    $scope.dbServices = getSchemaServices.data.record;
    //console.log($scope.dbServices);
    $scope.loadServices = function(){
        $scope.dbServices.forEach(function(service){
            $http.get(DSP_URL + "/rest/" + service.api_name + "?include_schema=true").then(function(response){

                service.tables = [];
                response.data.resource.forEach(function(table){

                    service.tables.push(table);
                })
            });
        })
    }
    $scope.loadServices();
    $scope.loadSchema = function(advanced){
        $scope.table = this.table;
        $scope.service = this.service.api_name;
        $http.get(CurrentServer + "/rest/" + this.service.api_name + "/" + this.table.name)
            .then(function(response){
                $scope.table.schema = response;
                //console.log(table.schema);
                if(advanced){
                    $scope.advanced = true;
                    editor.setValue(angular.toJson($scope.table.schema.data, true), -1);
                }else{
                    $scope.advanced = false;
                }

            })
    }
    $scope.toggleJSON = function(){
        if($scope.advanced){
            $scope.table.schema.data = JSON.parse(editor.getValue());
            $scope.advanced = false;
        }else{
            $scope.advanced = true;
            editor.setValue(angular.toJson($scope.table.schema.data, true), -1);
        }
    }
    $scope.addColumn = function(){
       $scope.newColumn = {
           name : "New Column"
       }
       $scope.table.schema.data.field.push($scope.newColumn)
    }
    $scope.deleteColumn = function(){
        console.log(this);
        if ( !confirm( "Are you sure you want to delete " + this.column.name) ) {
            return;
        }
        $scope.table.schema.data.field.splice(this.$index, 1);
        $(function(){
            new PNotify({
                title: 'Schema',
                text: 'Column removed from working set, press Update Schema to save changes',
                type: 'warning'
            });
        });

    }
    $scope.updateJSONSchema = function(){
        $http.put(CurrentServer + "/rest/" + $scope.service + "/" + $scope.table.name, editor.getValue()).then(function(response){
            $(function(){
                new PNotify({
                    title: 'Schema',
                    text: 'Updated Successfully',
                    type: 'success'
                });
            });
        })
    }
    $scope.updateSchema = function(){
        $http.put(CurrentServer + "/rest/" + $scope.service + "/" + $scope.table.name, $scope.table.schema.data).then(function(response){
            $(function(){
                new PNotify({
                    title: 'Schema',
                    text: 'Updated Successfully',
                    type: 'success'
                });
            });
        })
    }
    $scope.createTable = function(){
        var requestObject = {
            name : this.newTableName,
            field: [
                {name : "id",
                 type : "id"
                }
            ]
        };
        $http.post(CurrentServer + "/rest/" + this.service.api_name , requestObject).then(function(response){
            $scope.loadServices();
        })
    }

    $scope.dropTable = function(){
        if ( !confirm( "Are you sure you want to delete " + this.table.name) ) {
            return;
        }
        $http.delete(CurrentServer + "/rest/" + this.service.api_name + "/" + this.table.name).then(function(response){
            $scope.loadServices();
        })
    }
};

