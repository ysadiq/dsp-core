/**
 * Created with JetBrains PhpStorm.
 * User: jasonsykes
 * Date: 1/7/13
 * Time: 11:37 AM
 * To change this template use File | Settings | File Templates.
 */
var Templates = {
	thumbPanel:     "<h1>{{name}}</h1><br/>{{desc}}",
	alertMessage: '<div class="alert">' +
				  '<a class="close" data-dismiss="alert">x</a>' +
				  '{{message}}' +
				  '</div>',
	gridTemplate: '<table id="db-tables" class="table table-bordered table-striped">' +
				  '<thead>' +
				  '<tr>' +
				  '<th class="table-names-header">Table Name</th>' +
				  '</tr>' +
				  '</thead>' +
				  '<tbody>' +
				  '{{#table}}' +
				  '<tr>' +
				  '<td onclick = "Actions.loadSchema(\'{{name}}\')")>{{name}}</td>' +
				  '</tr> ' +
				  '{{/table}}' +
				  '</tbody>' +
				  '</table>',
	appTemplate: '<table id="db-tables" class="table table-bordered table-striped">' +
				 '<thead>' +
				 '<tr>' +
				 '<th class="table-names-header">Applications</th>' +
				 '</tr>' +
				 '</thead>' +
				 '<tbody>' +
				 '{{#record}}' +
				 '<tr>' +
				 '<td>{{fields.label}}</td>' +
				 '</tr> ' +
				 '{{/record}}' +
				 '</tbody>' +
				 '</table>',
	appIconTemplate: '<div class="accordion" id="app-groups-container">' +
					 '{{#Applications.app_groups}}' +
					 '<div class="accordion-group">' +
					 '<div class="accordion-heading">' +
					 '<a class="accordion-toggle" data-toggle="collapse" data-parent="#app-groups-container" href="#collapse-{{id}}">' +
					 '<div class="make-inline">' +
					 '<div class="group-icon pull-left">' +
					 '<i class="icon-chevron-right group-icon-position"></i>' +
					 '</div>' +

					 '<h3 class="group-title pull-left">{{name}}</h3>' +
					 //'<p class="group-description">{{description}}</p>' +
					 '</div>' +
					 '</a>' +
					 '</div>' +
					 '<div id="collapse-{{id}}" class="accordion-body collapse">' +
					 '<div class="accordion-inner group-items">' +
					 '<ul>' +
					 '{{#apps}}' +

					 '<li>' +
					 '<a onclick = "Actions.showApp(\'{{api_name}}\',\'{{launch_url}}\',\'{{is_url_external}}\',{{requires_fullscreen}})">' +
					 '<h4>{{name}}</h4>' +
					 '<p>{{description}}</p>' +
					 '</a>' +
					 '</li>' +
					 '{{/apps}}' +
					 '</ul>' +
					 '</div>' +
					 '</div>' +
					 '</div>' +
					 '{{/Applications.app_groups}}' +
					 '{{#Applications.mnm_ng_apps}}' +
					 '<div class="accordion-group">' +
					 '<div class="accordion-heading">' +
					 '<a class="accordion-toggle" data-toggle="collapse" data-parent="#app-groups-container" href="#collapse-no-group">' +
					 '<div class="make-inline">' +
					 '<div class="group-icon pull-left">' +
					 '<i class="icon-chevron-right group-icon-position"></i>' +
					 '</div>' +
					 '<h3 class="group-title pull-left">Default Group</h3>' +
					 //'<p class="group-description">{{description}}</p>' +
					 '</div>' +
					 '</a>' +
					 '</div>' +
					 '<div id="collapse-no-group" class="accordion-body in collapse">' +
					 '<div class="accordion-inner group-items">' +
					 '<ul>' +
					 '{{#apps}}' +
					 '<li>' +
					 '<a onclick = "Actions.showApp(\'{{api_name}}\',\'{{launch_url}}\',\'{{is_url_external}}\',{{requires_fullscreen}}, {{allow_fullscreen_toggle}})">' +
					 '<h4>{{name}}</h4>' +
					 '<p>{{description}}</p>' +
					 '</a>' +
					 '</li>' +
					 '{{/apps}}' +
					 '</ul>' +
					 '</div>' +
					 '</div>' +
					 '</div>' +
					 '{{/Applications.mnm_ng_apps}}' +
					 '</div>',
	errorTemplate: '{{#error}}' +
				   '<div class="alert alert-dismissable">' +
				   '	<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' +
				   '	<strong>{{message}}</strong>' +
				   '</div>' +
				   '{{/error}}',
	loadTemplate:   function(template, data, renderTo) {
		var processTpl;
		processTpl = Mustache.to_html(template, data);
		$('#' + renderTo).html(processTpl);
	}
};
