'use strict';


angular.module('dfSystemConfig', ['ngRoute', 'dfUtility'])
    .constant('MODSYSCONFIG_ROUTER_PATH', '/config')
    .constant('MODSYSCONFIG_ASSET_PATH', 'admin_components/dreamfactory_components/adf-system-config/')
    .config(['$routeProvider', 'MODSYSCONFIG_ROUTER_PATH', 'MODSYSCONFIG_ASSET_PATH',
        function ($routeProvider, MODSYSCONFIG_ROUTER_PATH, MODSYSCONFIG_ASSET_PATH) {
            $routeProvider
                .when(MODSYSCONFIG_ROUTER_PATH, {
                    templateUrl: MODSYSCONFIG_ASSET_PATH + 'views/main.html',
                    controller: 'SystemConfigurationCtrl',
                    resolve: {
                        getSystemConfigData: ['DSP_URL', '$http', function(DSP_URL, $http) {

                            return $http.get(DSP_URL + '/rest/system/config')
                                .success(function (data) {
                                    return data
                                })
                                .error(function (error) {

                                    throw {
                                        module: 'DreamFactory System Config Module',
                                        type: 'error',
                                        provider: 'dreamfactory',
                                        exception: error
                                    }
                                })
                        }],

                        getRolesData: ['DSP_URL', '$http', function (DSP_URL, $http) {

                            return $http.get(DSP_URL + '/rest/system/role')
                                .success(function (data) {
                                    return data
                                })
                                .error(function (error) {

                                    throw {
                                        module: 'DreamFactory System Config Module',
                                        type: 'error',
                                        provider: 'dreamfactory',
                                        exception: error
                                    }
                                })

                        }],

                        getEmailTemplatesData: ['DSP_URL', '$http', function(DSP_URL, $http) {

                            return $http.get(DSP_URL + '/rest/system/email_template')
                                .success(function (data) {
                                    return data
                                })
                                .error(function (error) {

                                    throw {
                                        module: 'DreamFactory System Config Module',
                                        type: 'error',
                                        provider: 'dreamfactory',
                                        exception: error
                                    }
                                })

                        }],

                        getServicesData: ['DSP_URL', '$http', function (DSP_URL, $http) {

                            return $http.get(DSP_URL + '/rest/system/service')
                                .success(function (data) {
                                    return data
                                })
                                .error(function(error) {

                                    throw {
                                        module: 'DreamFactory System Config Module',
                                        type: 'error',
                                        provider: 'dreamfactory',
                                        exception: error
                                    }
                                })

                        }]
                    }
                });
        }])
    .run(['DSP_URL', '$http', 'SystemConfigDataService', function (DSP_URL, $http, SystemConfigDataService) {

    }])
    .controller('SystemConfigurationCtrl', ['DSP_URL', '$scope', '$http', 'SystemConfigDataService','SystemConfigEventsService', 'getRolesData', 'getEmailTemplatesData', 'getServicesData', 'getSystemConfigData',
        function (DSP_URL, $scope, $http, SystemConfigDataService, SystemConfigEventsService, getRolesData, getEmailTemplatesData, getServicesData, getSystemConfigData) {

            // PRE-PROCESS API
            $scope.__setNullToEmptyString = function (systemConfigDataObj) {

                angular.forEach(systemConfigDataObj, function(value, key) {

                    if (systemConfigDataObj[key] == null) {

                        systemConfigDataObj[key] = '';
                    }
                });

                return systemConfigDataObj;

            };

            $scope.__getDataFromResponse = function (httpResponseObj) {
                return httpResponseObj.data.record;
            };



            // CREATE SHORT NAMES
            $scope.es = SystemConfigEventsService.systemConfigController;

            // PUBLIC API

            $scope.systemConfig = $scope.__setNullToEmptyString(getSystemConfigData.data);
            $scope.rolesDataObj = $scope.__getDataFromResponse(getRolesData);
            $scope.emailTemplatesDataObj = $scope.__getDataFromResponse(getEmailTemplatesData);
            $scope.servicesDataObj = $scope.__getDataFromResponse(getServicesData);


            $scope.updateConfig = function () {

                $scope._updateConfig();
            };


            // PRIVATE API
            $scope._updateConfigData = function (systemConfigDataObj) {

                return $http.put(DSP_URL + '/rest/system/config', systemConfigDataObj)
            };

            $scope._updateSystemConfigService = function (systemConfigDataObj) {

                SystemConfigDataService.setSystemConfig(systemConfigDataObj);
            };



            // COMPLEX IMPLEMENTATION
            $scope._updateConfig = function () {

                $scope._updateConfigData($scope.systemConfig).then(
                    function(result) {

                        var systemConfigDataObj = result.data;

                        // We no longer store the system config in the SystemConfigDataService
                        // You can only get the config and then use as necessary.  The point
                        // being that you always have a fresh config in the event of a refresh.
                        // We used to store in a cookie for refresh.  Now we just get it and
                        // return the promise.

                        //$scope._updateCookie(systemConfigDataObj);
                        $scope._updateSystemConfigService(systemConfigDataObj);


                        $scope.$emit($scope.es.updateSystemConfigSuccess, systemConfigDataObj);
                    },
                    function(reject) {

                        throw {
                            module: 'DreamFactory System Config Module',
                            type: 'error',
                            provider: 'dreamfactory',
                            exception: reject
                        }
                    }
                )
            }
    }])
    .directive('dreamfactorySystemInfo', ['MODSYSCONFIG_ASSET_PATH', function (MODSYSCONFIG_ASSET_PATH) {

        return {
            restrict: 'E',
            templateUrl: MODSYSCONFIG_ASSET_PATH + 'views/system-info.html'
        }

    }])
    .directive('dreamfactoryCorsConfig', ['MODSYSCONFIG_ASSET_PATH', 'SystemConfigDataService',
        function (MODSYSCONFIG_ASSET_PATH, SystemConfigDataService) {

            return {
                restrict: 'E',
                templateUrl: MODSYSCONFIG_ASSET_PATH + 'views/cors-config.html',
                scope: true,
                link: function (scope, elem, attrs) {

                    scope.allowedHosts = scope.systemConfig.allowed_hosts;

                    scope.supportedVerbs = [
                        'GET',
                        'POST',
                        'PUT',
                        'PATCH',
                        'MERGE',
                        'DELETE',
                        'COPY'
                    ];


                    // PUBLIC API
                    scope.addNewHost = function () {

                        scope._addNewHost();
                    };

                    scope.removeHost = function (hostDataObjIndex) {

                        scope._confirmRemoveHost(hostDataObjIndex) ? scope._removeHost(hostDataObjIndex) : false;
                    };


                    // PRIVATE API
                    scope._createNewHostModel = function () {

                        return {
                            host: null,
                            is_enabled: true,
                            verbs: []
                        }
                    };

                    scope._addNewHostData = function () {

                        scope.allowedHosts.push(scope._createNewHostModel());
                    };

                    scope._removeHostData = function (hostDataObjIndex) {

                        scope.allowedHosts.splice(hostDataObjIndex, 1);
                    };

                    scope._confirmRemoveHost = function (hostDataObjIndex) {

                        return confirm('Delete Host: ' + scope.allowedHosts[hostDataObjIndex].host)
                    };


                    // COMPLEX IMPLEMENTATION
                    scope._addNewHost = function () {

                        scope._addNewHostData();
                    };

                    scope._removeHost = function (hostDataObjIndex) {

                        scope._removeHostData(hostDataObjIndex);
                    };


                    // WATCHERS AND INIT

                }
            }
        }])
    .directive('dreamfactoryCorsVerbSelector', ['MODSYSCONFIG_ASSET_PATH', function(MODSYSCONFIG_ASSET_PATH) {

        return {
            restrict: 'E',
            templateUrl: MODSYSCONFIG_ASSET_PATH + 'views/cors-verb-selector.html',
            scope: {
                host: '='
            },
            link: function (scope, elem, attrs) {


                scope.toggleState = false;

                scope.hostVerbs = scope.host.verbs;

                scope.verbs = {
                    "GET": false,
                    "POST": false,
                    "PUT": false,
                    "PATCH": false,
                    "MERGE": false,
                    "DELETE": false,
                    "COPY": false
                };


                // PUBLIC API

                scope.toggleAllVerbs = function () {

                    scope._toggleAllVerbs();
                };

                scope.getToggleState = function () {

                    scope._getToggleState();
                };


                // PRIVATE API

                scope._toggleEachProperty = function () {

                    scope.toggleState = !scope.toggleState;

                    angular.forEach(scope.verbs, function(value, key) {
                        scope.verbs[key] = scope.toggleState;
                    });
                };

                scope._verbsToArray = function (verbsDataObj) {

                    var verbsArr = [];

                    angular.forEach(verbsDataObj, function (value, key) {

                        if (value != false) {
                            verbsArr.push(key);
                        }
                    });

                    return verbsArr;
                };



                //COMPLEX IMPLEMENTATION

                scope._toggleAllVerbs = function () {

                    scope._toggleEachProperty();
                };

                scope._getToggleState = function () {

                    return scope.toggleState;
                };



                // WATCHERS AND INIT
                // Watch verbs obj for change
                scope.$watchCollection('verbs', function(newValue, oldValue) {

                    // On change calculate new arr
                    scope.host.verbs = scope._verbsToArray(newValue);
                });

                scope.$watchCollection('hostVerbs', function(newValue, oldValue) {

                    angular.forEach(newValue, function(value, index) {
                        scope.verbs[value] = true;
                    });
                })

            }
        }

    }])
    .directive('dreamfactoryGuestUsersConfig', ['MODSYSCONFIG_ASSET_PATH',
        function (MODSYSCONFIG_ASSET_PATH) {

            return {
                restrict: 'E',
                templateUrl: MODSYSCONFIG_ASSET_PATH + 'views/guest-users-config.html',
                scope: true
            }
    }])
    .directive('dreamfactoryOpenRegistrationConfig', ['MODSYSCONFIG_ASSET_PATH', function(MODSYSCONFIG_ASSET_PATH) {

        return {
            restrict: 'E',
            templateUrl: MODSYSCONFIG_ASSET_PATH + 'views/open-registration-config.html',
            scope: true
        }
    }])
    .directive('dreamfactoryUserInvitesConfig', ['MODSYSCONFIG_ASSET_PATH', function(MODSYSCONFIG_ASSET_PATH) {

        return {
            restrict: 'E',
            templateUrl: MODSYSCONFIG_ASSET_PATH + 'views/user-invites-config.html',
            scope: true

        }
    }])
    .directive('dreamfactoryPasswordResetConfig', ['MODSYSCONFIG_ASSET_PATH', function(MODSYSCONFIG_ASSET_PATH) {

        return {

            restrict: 'E',
            templateUrl: MODSYSCONFIG_ASSET_PATH + 'views/password-reset-config.html',
            scope: true

        }


    }])
    .directive('dreamfactoryGlobalLookupKeysConfig', ['MODSYSCONFIG_ASSET_PATH', function(MODSYSCONFIG_ASSET_PATH) {

        return {
            restrict: 'E',
            templateUrl: MODSYSCONFIG_ASSET_PATH + 'views/global-lookup-keys-config.html',
            scope: false,
            link: function (scope, elem, attrs) {

                // PUBLIC API
                scope.newKey = function () {

                    scope._newKey();
                };

                scope.removeKey = function() {

                    scope._removeKey();
                };


                // PRIVATE API
                scope._createLookupKeyModel = function () {

                    return {
                        name: "",
                        value: "",
                        private: false
                    };
                };


                scope._isUniqueKey = function() {

                    var size = scope.systemConfig.lookup_keys.length - 1;
                    for ( var i = 0; i < size; i++ ) {
                        var key = scope.systemConfig.lookup_keys[i];
                        var matches = scope.systemConfig.lookup_keys.filter(
                            function( itm ) {
                                return itm.name === key.name;
                            }
                        );
                        if ( matches.length > 1 ) {
                            return false;
                        }
                    }
                    return true;
                };



                // COMPLEX IMPLEMENTATION
                scope._newKey = function () {

                    scope.systemConfig.lookup_keys.push(scope._createLookupKeyModel());
                };

                scope._removeKey = function () {

                    scope.systemConfig.lookup_keys.splice( this.$index, 1 );
                };

            }
        }


    }])
    .service('SystemConfigEventsService', [function() {

        return {
            systemConfigController: {
                updateSystemConfigRequest: 'update:systemconfig:request',
                updateSystemConfigSuccess: 'update:systemconfig:success',
                updateSystemConfigError: 'update:systemconfig:error'
            }
        }
    }])
    .service('SystemConfigDataService', ['DSP_URL', 'API_KEY', '$http', function (DSP_URL, API_KEY, $http) {

        var systemConfig = {};

        function _getSystemConfigFromServer() {

            var xhr;

            if (window.XMLHttpRequest)
            {// code for IE7+, Firefox, Chrome, Opera, Safari
                xhr=new XMLHttpRequest();
            }
            else
            {// code for IE6, IE5
                xhr=new ActiveXObject("Microsoft.XMLHTTP");
            }

            xhr.open("GET", DSP_URL + '/rest/system/config', false);
            xhr.setRequestHeader("X-DreamFactory-Application-Name", "admin");
            xhr.overrideMimeType("application/json");

            xhr.send();

            if (xhr.readyState==4 && xhr.status==200) {
                return angular.fromJson(xhr.responseText);
            }else {
                throw {
                    module: 'DreamFactory System Config Module',
                    type: 'error',
                    provider: 'dreamfactory',
                    exception: 'XMLHTTPRequest Failure:  _getSystemConfigFromServer() Failed retrieve config.  Please contact your system administrator.'
                }
            }

        }

        function _getSystemConfig() {

            return systemConfig;
        }

        function _setSystemConfig(userDataObj) {

            systemConfig = userDataObj;
        }


        return {

            getSystemConfigFromServer: function () {

                return _getSystemConfigFromServer();
            },

            getSystemConfig: function () {

                return _getSystemConfig();
            },

            setSystemConfig: function (systemConfigDataObj) {

                _setSystemConfig(systemConfigDataObj);
            }
        }
    }]);
