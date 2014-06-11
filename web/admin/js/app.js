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
var loginFrame = $("#login-frame");
var loginPage = $("#login-page");
var container = $("#container");

/**
 * Angular module declaration
 */
angular.module(
        "AdminApp", [
            "ngRoute", "ngResource", "ui.bootstrap.accordion", "ngGrid", "AdminApp.controllers", "AdminApp.apisdk", "dfTable", "dfUtility"
        ]
    )
    .constant("DSP_URL", CurrentServer)
    .constant("API_KEY", "admin")
    .config(
        function($httpProvider, API_KEY){
            $httpProvider.defaults.headers.common["X-DREAMFACTORY-APPLICATION-NAME"] = API_KEY;
        }
    )
    .config(
        [
            '$routeProvider', '$locationProvider', '$httpProvider', function ($routeProvider, $locationProvider, $httpProvider) {

            $routeProvider.when(
                '/', {
                    controller: QuickStartCtrl,
                    templateUrl: 'quick-start.html'
                }
            );
            $routeProvider.when(
                '/app', {
                    controller: AppCtrl,
                    templateUrl: 'applications.html'
                }
            );
            $routeProvider.when(
                '/user', {
                    controller: UserCtrl,
                    templateUrl: 'users.html'
                }
            );
            $routeProvider.when(
                '/role', {
                    controller: RoleCtrl,
                    templateUrl: 'roles.html'
                }
            );
            $routeProvider.when(
                '/group', {
                    controller: GroupCtrl,
                    templateUrl: 'groups.html'
                }
            );
            $routeProvider.when(
                '/schema', {
                    controller: SchemaCtrl,
                    templateUrl: 'schema.html',
                    resolve : {
                        getSchemaServices: ['DSP_URL', '$http', function (DSP_URL, $http) {

                            var requestDataObj = {
                                filter: 'type_id in (8,4104)'
                            };

                            return $http.get(DSP_URL + '/rest/system/service', {params: requestDataObj});
                        }]
                    }
                }
            );
            $routeProvider.when(
                '/service', {
                    controller: ServiceCtrl,
                    templateUrl: 'services.html'
                }
            );
            $routeProvider.when(
                '/import', {
                    controller: FileCtrl,
                    templateUrl: 'import.html'
                }
            );
            $routeProvider.when(
                '/file', {
                    controller: FileCtrl,
                    templateUrl: 'files.html'
                }
            );
            $routeProvider.when(
                '/package', {
                    controller: PackageCtrl,
                    templateUrl: 'package.html'
                }
            );
            $routeProvider.when(
                '/config', {
                    controller: ConfigCtrl,
                    templateUrl: 'config.html'
                }
            );
            $routeProvider.when(
                '/data', {
                    controller: DataCtrl,
                    templateUrl: 'data.html',
                    resolve : {
                        getDataServices: ['DSP_URL', '$http', function (DSP_URL, $http) {

                            var requestDataObj = {
                                include_schema: true,
                                filter: 'type_id in (4,4100)'
                            };

                            return $http.get(DSP_URL + '/rest/system/service', {params: requestDataObj});
                        }]
                    }
                }
            );
            $routeProvider.when(
                '/scripts', {
                    controller: ScriptCtrl,
                    templateUrl: 'scripts.html',
                    resolve : {
                        getDataServices: ['DSP_URL', '$http', function (DSP_URL, $http) {

                            var requestDataObj = {
                                filter: 'type_id in (4,16,4100)'
                            };

                            return $http.get(DSP_URL + '/rest/system/service', {params: requestDataObj});
                        }]
                    }
                }

            );
            $routeProvider.when(
                '/api', {
                    controller: 'ApiSDKCtrl',
                    templateUrl: 'apisdk.html'
                }
            );

            var interceptor = [
                '$location', '$q', '$rootScope', function ($location, $q, $rootScope) {
                    function success(response) {

                        return response;
                    }

                    function error(response) {

                        if (response.status === 401 || response.status === 403) {
                            if (response.config.method === "GET") {
                                $rootScope.$broadcast(
                                    "error:401", function () {
                                        window.location.reload(true);
                                    }
                                );
                            }
                            else {
                                $rootScope.$broadcast("error:401", null);
                            }

                            return $q.reject(response);
                        }
                        else if (response.status === 404) {
                            return $q.reject(response);
                        }
                        else {
                            $(function(){
                                new PNotify({
                                    title: 'API Error',
                                    text: getErrorString(response),
                                    type: 'error'
                                });
                            });

                            return $q.reject(response);
                        }
                    }

                    return function (promise) {
                        return promise.then(success, error);
                    }
                }
            ];

            $httpProvider.responseInterceptors.push(interceptor);
        }
        ]
    ).factory(
    'AppsRelated',function ($resource) {
        return $resource(
            '/rest/system/app/:id/?app_name=admin&fields=*&related=roles', {}, {
                update: {
                    method: 'PUT'
                },
                query: {
                    method: 'GET',
                    isArray: false
                }
            }
        );
    }
).factory(
    'AppsRelatedToService',function ($resource) {
        return $resource(
            '/rest/system/app/:id/?app_name=admin&fields=*&related=app_service_relations', {}, {
                update: {
                    method: 'PUT'
                },
                query: {
                    method: 'GET',
                    isArray: false
                }
            }
        );
    }
).factory(
    'App',function ($resource) {
        return $resource(
            '/rest/system/app/:id/?app_name=admin&fields=*', {}, {
                update: {
                    method: 'PUT'
                },
                query: {
                    method: 'GET',
                    isArray: false
                }
            }
        );
    }
).factory(
    'User',function ($resource) {
        return $resource(
            '/rest/system/user/:id/?app_name=admin&fields=*&related=lookup_keys&order=display_name%20ASC', {
                send_invite: false
            }, {
                update: {
                    method: 'PUT'
                },
                query: {
                    method: 'GET',
                    isArray: false
                }
            }
        );
    }
).factory(
    'Role',function ($resource) {
        return $resource(
            '/rest/system/role/:id/?app_name=admin&fields=*', {}, {
                update: {
                    method: 'PUT'
                },
                query: {
                    method: 'GET',
                    isArray: false
                }
            }
        )
    }
).factory(
    'RolesRelated',function ($resource) {
        return $resource(
            '/rest/system/role/:id/?app_name=admin&fields=*&related=users,apps,role_service_accesses,role_system_accesses,lookup_keys', {}, {
                update: {
                    method: 'PUT'
                },
                query: {
                    method: 'GET',
                    isArray: false
                }
            }
        );
    }
).factory(
    'Service',function ($resource) {
        return $resource(
            "/rest/system/service/:id/?app_name=admin&fields=*&filter=type!='Local Portal Service'", {}, {
                update: {
                    method: 'PUT'
                },
                query: {
                    method: 'GET',
                    isArray: false
                }
            }
        );
    }
).factory(
    'Schema',function ($resource) {
        return $resource(
            '/rest/schema/:name/?app_name=admin&fields=*', {}, {
                update: {
                    method: 'PUT'
                },
                query: {
                    method: 'GET',
                    isArray: false
                }
            }
        );
    }
).factory(
    'DB',function ($resource) {
        return $resource(
            '/rest/db/:name/?app_name=admin&fields=*&include_schema=true', {}, {
                update: {
                    method: 'PUT'
                },
                query: {
                    method: 'GET',
                    isArray: false
                }
            }
        );
    }
).factory(
    'Group',function ($resource) {
        return $resource(
            '/rest/system/app_group/:id/?app_name=admin&fields=*&related=apps', {}, {
                update: {
                    method: 'PUT'
                },
                query: {
                    method: 'GET',
                    isArray: false
                }
            }
        );
    }
).factory(
    'Config',function ($resource) {
        return $resource(
            '/rest/system/config/?app_name=admin', {}, {
                update: {
                    method: 'PUT'
                },
                query: {
                    method: 'GET',
                    isArray: false
                }
            }
        );
    }
).factory(
    'Event',function ($resource) {
        return $resource(
            '/rest/system/event/?app_name=admin', {}, {
                update: {
                    method: 'PUT'
                },
                query: {
                    method: 'GET',
                    isArray: false
                }
            }
        );
    }
).factory(
    'Script',function ($resource) {
        return $resource(
            '/rest/system/script/:script_id/?app_name=admin', {}, {
                update: {
                    method: 'PUT'
                },
                query: {
                    method: 'GET',
                    isArray: false,
                    headers:{'Content-Type':'text/plain'}
                }
            }
        );
    }
).factory(
    'EmailTemplates',function ($resource) {
        return $resource(
            '/rest/system/email_template/:id/?app_name=admin&fields=*', {}, {
                update: {
                    method: 'PUT'
                }
            }
        );
    }
).run(
    function ($rootScope) {
        $rootScope.$on(
            "error:401", function (message, data) {
                $rootScope.showLogin();
                $rootScope.onReturn = function () {

                    if (data) {
                        data();
                    }
                };

            }
        );
        $rootScope.showLogin = function () {
            container.hide();
            loginFrame.attr("src", "");
            loginFrame.attr("src", "../web/login");
            loginFrame.load(
                function () {
                    $rootScope.checkLogin();
                }
            );
            loginPage.show();
        };
        $rootScope.hideLogin = function () {
            container.show();
            loginPage.hide();
            $rootScope.onReturn();

        };
        $rootScope.checkLogin = function () {
            var loginLocation = document.getElementById("login-frame").contentWindow.location;
            loginLocation = loginLocation.toString();
            if (loginLocation.indexOf("launchpad") != -1) {
                $rootScope.hideLogin();
            }
        };

    }
);

var setCurrentApp = function (currentApp) {
    $('.active').removeClass('active');
    $("#nav_" + currentApp).addClass("active");
};

var showFileManager = function () {
    $("#root-file-manager").find("iframe").css('height', $(window).height() - 200).attr("src", CurrentServer + '/filemanager/').show();

};

//window.onresize = resize;
//window.onload = resize;
//
//function resize() {
//    $("#grid-table").css('height', $(window).height() - 60);
//}
