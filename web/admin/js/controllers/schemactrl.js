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
    //$scope.service = {;
    $scope.advanced = false;
    //var service;
    editor = ace.edit("schema-editor");
    editor.getSession().setMode("ace/mode/json");
    $scope.dbServices = getSchemaServices.data.record;
    //console.log($scope.dbServices);
    $scope.loadServices = function(){
        if($scope.service_index){
            $http.get(DSP_URL + "/rest/" + $scope.service + "?include_schema=true").then(function(response){
                console.log( $scope.dbServices[$scope.service]);
                $scope.dbServices[$scope.service_index].tables = [];
                response.data.resource.forEach(function(table){

                    $scope.dbServices[$scope.service_index].tables.push(table);
                })
            });
        }else{
            $scope.dbServices.forEach(function(service, index){
                $http.get(DSP_URL + "/rest/" + service.api_name + "?include_schema=true").then(function(response){

                    service.tables = [];

                    service.service_index = index;
                    response.data.resource.forEach(function(table){

                        service.tables.push(table);
                    })
                });
            })
        }

    }
    $scope.loadServices();
    $scope.loadSchema = function(advanced){
        $scope.import = false;
        $scope.table = this.table;
        $scope.currentTable = $scope.table.name;
        $scope.service = this.service.api_name;
        $scope.service_index = this.service.service_index;
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
    $scope.showImport = function(){
        editor.setValue("");
        $scope.advanced = true;
        $scope.import = true;
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
       $scope.table.schema.data.field.unshift($scope.newColumn)
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
        $http.put(CurrentServer + "/rest/" + $scope.service , editor.getValue()).then(function(response){
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
        $http.put(CurrentServer + "/rest/" + $scope.service , $scope.table.schema.data).then(function(response){
            $(function(){
                new PNotify({
                    title: 'Schema',
                    text: 'Updated Successfully',
                    type: 'success'
                });
            });
        })
    }
    $scope.postJSONSchema = function(){
        $http.post(CurrentServer + "/rest/" + $scope.service, editor.getValue()).then(function(response){
            $(function(){
                new PNotify({
                    title: 'Schema',
                    text: 'Posted Successfully',
                    type: 'success'
                });
            });
            $scope.loadServices();
        })
    }
    $scope.createTable = function(){
        var name = this.newTableName;
        this.newTableName = "";
        var requestObject = {
            name : name,
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
    $scope.setService = function(){
        $scope.service = this.service.api_name;
    }
    $scope.validateJSON = function() {
        try {
            var result = JSON.parse( editor.getValue() );
            if ( result ) {
                $(function(){
                    new PNotify({
                        title: 'Schema',
                        text: 'JSON is valid',
                        type: 'success'
                    });
                });
            editor.setValue(angular.toJson(result, true), -1);
            }
        }
        catch ( e ) {
            $(function(){
                new PNotify({
                    title: 'Schema',
                    text: e,
                    type: 'error'
                });
            });
        }
    };
};

