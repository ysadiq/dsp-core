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
'use strict';

/**
 * Angular module declaration
 */
angular.module(
	'AdminApp',
	['ngRoute', 'ngResource', 'ngGrid', 'AdminApp.controllers', 'AdminApp.apisdk']
).config(
	[
		'$routeProvider',
		'$locationProvider',
		'$httpProvider',
		function($routeProvider, $locationProvider, $httpProvider) {
			$routeProvider.when('/', { controller: QuickStartCtrl, templateUrl: 'quick-start.html' });
			$routeProvider.when('/app', { controller: AppCtrl, templateUrl: 'applications.html' });
			$routeProvider.when('/user', { controller: UserCtrl, templateUrl: 'users.html' });
			$routeProvider.when('/role', { controller: RoleCtrl, templateUrl: 'roles.html' });
			$routeProvider.when('/group', { controller: GroupCtrl, templateUrl: 'groups.html' });
			$routeProvider.when('/schema', { controller: SchemaCtrl, templateUrl: 'schema.html' });
			$routeProvider.when('/service', { controller: ServiceCtrl, templateUrl: 'services.html' });
			$routeProvider.when('/import', { controller: FileCtrl, templateUrl: 'import.html' });
			$routeProvider.when('/file', { controller: FileCtrl, templateUrl: 'files.html' });
			$routeProvider.when('/package', { controller: PackageCtrl, templateUrl: 'package.html' });
			$routeProvider.when('/config', { controller: ConfigCtrl, templateUrl: 'config.html' });
			$routeProvider.when('/data', { controller: DataCtrl, templateUrl: 'data.html' });
//		$routeProvider.when('/plugins', { controller: PluginCtrl, templateUrl: 'plugins.html' });
//		$routeProvider.when('/scripts', { controller: ScriptCtrl, templateUrl: 'scripts.html' });
			$routeProvider.when('/api', { controller: 'ApiSDKCtrl', templateUrl: 'apisdk.html' });

			var interceptor = [
				'$location', '$q', function($location, $q) {
					/**
					 * Success handler
					 *
					 * @param response
					 * @returns {*}
					 */
					function success(response) {
						return response;
					}

					/**
					 * Error handler
					 * @param response
					 * @returns {*}
					 */
					function error(response) {
						if (401 === response.status) {
							//$location.path('/login');
							showLogin();
							return $q.reject(response);
						} else {
							return $q.reject(response);
						}
					}

					/**
					 * Promise factory
					 */
					return function(promise) {
						return promise.then(success, error);
					}
				}
			];

			$httpProvider.responseInterceptors.push(interceptor);
		}
	]
);

/**
 * Module factory
 */
angular.module('AdminApp').factory(
	'AppsRelated', function($resource) {
		return $resource(
			'/rest/system/app/:id/?app_name=admin&fields=*&related=roles', {}, { update: { method: 'PUT' }, query: {
				method:  'GET',
				isArray: false
			} }
		);
	}
).factory(
	'AppsRelatedToService', function($resource) {
		return $resource(
			'/rest/system/app/:id/?app_name=admin&fields=*&related=app_service_relations', {}, { update: { method: 'PUT' }, query: {
				method:  'GET',
				isArray: false
			} }
		);
	}
).factory(
	'App', function($resource) {
		return $resource(
			'/rest/system/app/:id/?app_name=admin&fields=*', {},
			{
				update: {
					method: 'PUT'
				},
				query:  {
					method:  'GET',
					isArray: false
				}
			}
		);
	}
).factory(
	'User', function($resource) {
		return $resource(
			'/rest/system/user/:id/?app_name=admin&fields=*&related=lookup_keys&order=display_name%20ASC',
			{send_invite: false},
			{ update: { method: 'PUT' }, query: {
				method:  'GET',
				isArray: false
			} }
		);
	}
).factory(
	'Role', function($resource) {
		return $resource(
			'/rest/system/role/:id/?app_name=admin&fields=*', {}, { update: { method: 'PUT' }, query: {
				method:  'GET',
				isArray: false
			} }
		)
	}
).factory(
	'RolesRelated', function($resource) {
		return $resource(
			'/rest/system/role/:id/?app_name=admin&fields=*&related=users,apps,role_service_accesses,role_system_accesses,lookup_keys',
			{},
			{ update: { method: 'PUT' }, query: {
				method:  'GET',
				isArray: false
			} }
		);
	}
).factory(
	'Service', function($resource) {
		return $resource(
			'/rest/system/service/:id/?app_name=admin&fields=*', {}, { update: { method: 'PUT' }, query: {
				method:  'GET',
				isArray: false
			} }
		);
	}
).factory(
	'Schema', function($resource) {
		return $resource(
			'/rest/schema/:name/?app_name=admin&fields=*', {}, { update: { method: 'PUT' }, query: {
				method:  'GET',
				isArray: false
			} }
		);
	}
).factory(
	'DB', function($resource) {
		return $resource(
			'/rest/db/:name/?app_name=admin&fields=*&include_schema=true', {}, { update: { method: 'PUT' }, query: {
				method:  'GET',
				isArray: false
			} }
		);
	}
).factory(
	'Group', function($resource) {
		return $resource(
			'/rest/system/app_group/:id/?app_name=admin&fields=*&related=apps', {}, { update: { method: 'PUT' }, query: {
				method:  'GET',
				isArray: false
			} }
		);
	}
).factory(
	'Config', function($resource) {
		return $resource(
			'/rest/system/config/?app_name=admin', {}, { update: { method: 'PUT' }, query: {
				method:  'GET',
				isArray: false
			} }
		);
	}
).factory(
	'EmailTemplates', function($resource) {
		return $resource(
			'/rest/system/email_template/:id/?app_name=admin&fields=*', {}, { update: { method: 'PUT' }
			}
		);
	}
).factory(
	'Session', function($resource) {
		return $resource(
			'/rest/user/session/:id/?app_name=admin&fields=*', {}, { update: { method: 'PUT' }
			}
		);
	}
);

/**
 * Set the currently active application
 *
 * @param currentApp
 */
var setCurrentApp = function(currentApp) {
	$('.active').removeClass('active');
	$('#nav_' + currentApp).addClass('active');
};

var showFileManager = function() {
	$('#root-file-manager').find('iframe').css('height', $(window).height() - 200).attr('src', CurrentServer + '/filemanager/').show();

};

var loginFrame = $('#login-frame');
var loginPage = $('#login-page');
var angularContent = $('#angular-content');

var showLogin = function() {
	angularContent.hide();
	loginFrame.attr('src', '');
	loginFrame.attr('src', '../web/login');
	loginPage.show();
};

var checkLogin = function() {
	var loginLocation = document.getElementById('login-frame').contentWindow.location;
	loginLocation = loginLocation.toString();
	if (loginLocation.indexOf('launchpad') != -1) {
		hideLogin();
	}
};

var hideLogin = function() {
	angularContent.show();
	loginPage.hide();
};

window.onresize = resize;
window.onload = resize;

function resize() {
	$('#grid-table').css('height', $(window).height() - 60);
}