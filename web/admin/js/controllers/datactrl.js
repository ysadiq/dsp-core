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
var DataCtrl = function( $scope, Schema, DB, $http ) {
	$scope.$on(
		'$routeChangeSuccess', function() {
			$( window ).resize();
			setDataTableSize();
		}
	);

	jQuery( window ).resize(
		function() {
			setDataTableSize();
		}
	);

	var setDataTableSize = function() {

		var parentHeight = $( window ).height() - 150;

		$( '#schema-main' ).css(
			{
				'height': parentHeight
			}
		)
	};

	$( "#grid-container" ).hide();
	Scope = $scope;
	Scope.tableData = [];
	Scope.selectedRow = [];
	Scope.booleanOptions = [
		{value: true, text: 'true'},
		{value: false, text: 'false'}
	];
	Scope.typeOptions = [
		{value: "id", text: "id"},
		{value: "string", text: "string"},
		{value: "integer", text: "integer"},
		{value: "text", text: "text"},
		{value: "boolean", text: "boolean"},
		{value: "binary", text: "binary"},
		{value: "blob", text: "blob"},
		{value: "float", text: "float"},
		{value: "decimal", text: "decimal"},
		{value: "datetime", text: "datetime"},
		{value: "date", text: "date"},
		{value: "time", text: "time"}
	];
	//var booleanTemplate = '<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{COL_FIELD CUSTOM_FILTERS}}</span></div>';
	var booleanTemplate = '<select class="ngCellText"  ng-class="col.colIndex()" ng-options="option.value as option.text for option in booleanOptions" ng-model="row.entity[col.field]" ng-change="enableSave()">{{COL_FIELD CUSTOM_FILTERS}}</select>';
	var inputTemplate = '<input class="ngCellText" ng-class="col.colIndex()" ng-model="row.entity[col.field]" ng-change="enableSave()" />';
	//var inputTemplate = '<div class="ngCellText" ng-class="col.colIndex()"><input class="ngCellText colt{{$index}}" ng-change="enableSave()"/></div>';
	var schemaInputTemplate = '<input class="ngCellText" ng-class="col.colIndex()" ng-change="enableSchemaSave()" />';
	var customHeaderTemplate = '<div class="ngHeaderCell">&nbsp;</div><div ng-style="{\'z-index\': col.zIndex()}" ng-repeat="col in visibleColumns()" class="ngHeaderCell col{{$index}}" ng-header-cell></div>';
	var buttonTemplate = '<div><button id="save_{{row.rowIndex}}" class="btn btn-small btn-inverse"  ng-click="saveRow()"><li class="icon-save"></li></button><button class="btn btn-small btn-danger" ng-disabled="this.row.entity.dfnew == true" ng-click="deleteRow()"><li class="icon-remove"></li></button></div>';
	var schemaButtonTemplate = '<div ><button id="add_{{row.rowIndex}}" class="btn btn-small btn-primary" disabled=true ng-show="this.row.entity.dfnew" ng-click="schemaAddField()"><li class="icon-save"></li></button>' +
							   '<button id="save_{{row.rowIndex}}" ng-show="!this.row.entity.dfnew" class="btn btn-small btn-inverse" disabled=true ng-click="schemaSaveRow()"><li class="icon-save"></li></button>' +
							   '<button class="btn btn-small btn-danger" ng-show="!this.row.entity.dfnew" ng-click="schemaDeleteField()"><li class="icon-remove"></li></button>' +
							   '<button class="btn btn-small btn-danger" ng-show="this.row.entity.dfnew" disabled=true ng-click="schemaDeleteField(true)"><li class="icon-remove"></li></button></div>';
	var typeTemplate = '<select class="ngCellText colt{{$index}}" ng-options="option.value as option.text for option in typeOptions" ng-model="row.entity[col.field]" ng-change="enableSave()"></select>';
	Scope.columnDefs = [];
	Scope.browseOptions = {};
	Scope.browseOptions =
	{data: 'tableData', enableCellSelection: false, selectedItems: Scope.selectedRow, enableCellEditOnFocus: true, enableRowSelection: false, multiSelect: false, displaySelectionCheckbox: false, columnDefs: 'columnDefs'};
	Scope.Schemas = Schema.get(
		function( data ) {
			Scope.schemaData = data.resource;
		}
	);
	Scope.showData = function() {
		$( "#grid-container" ).show();
		$( ".detail-view" ).show();
		$( "#splash" ).hide();
		Scope.currentTable = this.table.name;
		Scope.browseOptions = {};
		Scope.tableData = [];
		Scope.columnDefs = [];
		Scope.currentSchema = [];

		DB.get(
			{name: Scope.currentTable}, function( data ) {

				Scope.tableData = data.record;
				Scope.tableData.unshift( {"dfnew": true} );

				Scope.relatedOptions = data.meta.schema.related;
				Scope.currentSchema = data.meta.schema.field;
				Scope.currentIdentity = data.meta.schema.primary_key;
				Scope.buildColumns();

			}
		);

		$( "tr.info" ).removeClass( 'info' );
		$( '#row_' + Scope.currentTable ).addClass( 'info' );

	};
	Scope.showRelated = function() {
		var ref_table = this.option.ref_table;
		var ref_field = this.option.ref_field;
		var field = this.option.field;
		var type = this.option.type;

		var related_url;
		if ( type == "has_many" ) {
			related_url = "/" + ref_table + "?app_name=admin&include_schema=true&filter=" + ref_field + "=" + Scope.selectedRow[0][field]
		}
		else if ( type == "belongs_to" ) {
			related_url = "/" + ref_table + "?filter=" + ref_field + "=" + Scope.selectedRow[0][field] + "&app_name=admin&include_schema=true";
		}
		Scope.currentTable = ref_table;
		Scope.browseOptions = {};
		Scope.tableData = [];
		Scope.columnDefs = [];
		Scope.currentSchema = [];
		Scope.relatedOptions = null;

		$http( {method: 'GET', url: '/rest/db' + related_url} ).success(
			function( data, status, headers, config ) {
				Scope.tableData = data.record;
				Scope.tableData.unshift( {"dfnew": true} );
				Scope.currentSchema = data.meta.schema.field;
				Scope.buildColumns();
				$( "tr.info" ).removeClass( 'info' );
				$( '#row_' + Scope.currentTable ).addClass( 'info' );
			}
		);

	};
	Scope.buildColumns = function() {
		var columnDefs = [];
		var saveColumn = {};
		saveColumn.field = '';
		saveColumn.cellTemplate = buttonTemplate;
		saveColumn.enableCellEdit = false;
		saveColumn.width = '70px';
		columnDefs.push( saveColumn );
		var column = {};
		Scope.currentSchema.forEach(
			function( field ) {
				column.field = field.name;
				switch ( field.type ) {
					case "boolean":
						column.cellTemplate = booleanTemplate;
						//column.enableFocusedCellEdit = true;
						column.enableCellEdit = false;
						column.minWidth = '100px';
						column.width = '50px';
						column.resizable = true;
						break;
					case "id":
						column.width = '50px';
						column.enableCellEdit = false;
						break;
					case "string":
						column.editableCellTemplate = inputTemplate;
						column.enableCellEdit = true;
						column.width = '100px';
						break;
					default:
						column.editableCellTemplate = inputTemplate;
						column.enableCellEdit = true;
						column.width = '100px';
				}
				columnDefs.push( column );
				column = {};
			}
		);

		Scope.columnDefs = columnDefs;
		Scope.browseOptions.data = Scope.tableData;

	};
	Scope.showForm = function() {
		$( "#grid-container" ).hide();
		$( "#create-form" ).show();
		$( "tr.info" ).removeClass( 'info' );
		$( window ).scrollTop( 0 );
	};

	Scope.newTable = {};
	Scope.newTable.table = {};
	Scope.newTable.table.field = [];
	Scope.addField = function() {

		Scope.newTable.table.name = Scope.schema.table.name;
		Scope.newTable.table.field.push( Scope.schema.table.field );
		Scope.schema.table.field = {};
	};
	Scope.removeField = function() {
		Scope.newTable.table.field = removeByAttr( Scope.newTable.table.field, 'name', this.field.name );

	};
	Scope.schemaAddField = function() {
		var table = this.tableSchema.name;
		var row = this.row.entity;
		$http.put( '/rest/schema/' + table + '/?app_name=admin', row ).success(
			function( data ) {
				Scope.tableData = removeByAttr( Scope.tableData, 'dfnew', true );
				Scope.tableData.unshift( data );
				Scope.tableData.unshift( {"dfnew": true} );
			}
		);

	};
	Scope.schemaDeleteField = function( gridOnly ) {
		var table = this.tableSchema.name;
		var name = this.row.entity.name;
		var which = name;
		if ( !which || which == '' ) {
			which = "the field?";
		}
		else {
			which = "the field '" + which + "'?";
		}
		if ( !confirm( "Are you sure you want to delete " + which ) ) {
			return;
		}
		if ( !gridOnly ) {
			$http.delete( '/rest/schema/' + table + '/' + name + '?app_name=admin' );
		}
		Scope.tableData = removeByAttr( Scope.tableData, 'name', name );

	};

	Scope.create = function() {
		Schema.save(
			Scope.newTable, function( data ) {
				$.pnotify(
					{
						title: Scope.newTable.table.name,
						type:  'success',
						text:  'Created Successfully'
					}
				);
				Scope.showForm();
				Scope.schemaData.push( Scope.newTable.table );
			}
		);
	};
	//noinspection ReservedWordAsName
	Scope.delete = function() {
		var name = this.table.name;
		which = name;
		if ( !which || which == '' ) {
			which = "the table?";
		}
		else {
			which = "the table '" + which + "'?";
		}
		if ( !confirm( "Are you sure you want to drop " + which ) ) {
			return;
		}
		Schema.delete(
			{ name: name }, function() {
				$.pnotify(
					{
						title: name,
						type:  'success',
						text:  'Dropped Successfully'
					}
				);
				Scope.showForm();
				//window.top.Actions.showStatus("Deleted Successfully");
				$( "#row_" + name ).fadeOut();
			}
		);
	};

	Scope.validateJSON = function() {
		try {
			var result = jsonlint.parse( document.getElementById( "source" ).value );
			if ( result ) {
				document.getElementById( "result" ).innerHTML = "JSON is valid!";
				document.getElementById( "result" ).className = "pass";
				if ( document.getElementById( "reformat" ).checked ) {
					document.getElementById( "source" ).value = JSON.stringify( result, null, "  " );
				}
			}
		}
		catch ( e ) {
			document.getElementById( "result" ).innerHTML = e;
			document.getElementById( "result" ).className = "fail";
		}
	};
	Scope.showJSON = function() {
		$( ".detail-view" ).hide();
		$( "#json_upload" ).show();
	};
	Scope.postJSON = function() {
		var json = $( '#source' ).val();
		Schema.save(
			json, function( data ) {
				if ( !data.table ) {
					Scope.schemaData.push( data );
				}
				else {
					data.table.forEach(
						function( table ) {
							Scope.schemaData.push( table );
						}
					)
				}

			}
		);

	};
	Scope.enableSave = function() {
		$( "#save_" + this.row.rowIndex ).attr( 'disabled', false );

	};
	Scope.enableSchemaSave = function() {
		$( "#add_" + this.row.rowIndex ).attr( 'disabled', false );
		$( "#delete_" + this.row.rowIndex ).attr( 'disabled', false );
		$( "#save_" + this.row.rowIndex ).attr( 'disabled', false );

	};
	Scope.saveRow = function() {

		var index = this.row.rowIndex;

		var newRecord = this.row.entity;
		if ( newRecord.dfnew ) {
			// delete newRecord.dfnew;
			DB.save(
				{name: Scope.currentTable}, newRecord, function( data ) {
					$( "#save_" + index ).attr( 'disabled', true );
					Scope.tableData = removeByAttr( Scope.tableData, 'dfnew', true );
					Scope.tableData.unshift( data );
					Scope.tableData.unshift( {"dfnew": true} );
				}
			);
		}
		else {
			DB.update(
				{name: Scope.currentTable}, newRecord, function() {
					$( "#save_" + index ).attr( 'disabled', true );
				}
			);
		}

	};
	Scope.deleteRow = function() {
		var id = this.row.entity[Scope.currentIdentity];
		$http.delete( '/rest/db/' + Scope.currentTable + '/' + id + '?app_name=admin' ).success(
			function() {
				//Scope.tableData = DB.get({name: Scope.currentTable});
				Scope.tableData = removeByAttr( Scope.tableData, Scope.currentIdentity, id );

			}
		);//

	}
};


