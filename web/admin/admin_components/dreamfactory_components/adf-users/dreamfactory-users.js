'use strict';




angular.module('dfUsers', ['ngRoute', 'dfUtility'])
    .constant('MODUSER_ROUTER_PATH', '/user')
    .constant('MODUSER_ASSET_PATH', 'admin_components/dreamfactory_components/adf-users/')
    .config(['$routeProvider', 'MODUSER_ROUTER_PATH', 'MODUSER_ASSET_PATH',
        function ($routeProvider, MODUSER_ROUTER_PATH, MODUSER_ASSET_PATH) {
            $routeProvider
                .when(MODUSER_ROUTER_PATH, {
                    templateUrl: MODUSER_ASSET_PATH + 'views/main.html',
                    controller: 'UsersCtrl',
                    resolve: {
                        getRolesData: ['DSP_URL', '$http', function (DSP_URL, $http) {

                            var requestDataObj = {
                                limit: 100,
                                include_count: true,
                                include_schema: true
                            };


                            return $http.get(DSP_URL + '/rest/system/role', {params: requestDataObj})
                                .success(function (data) {

                                    return data
                                })
                                .error(function (error) {

                                    throw {
                                        module: 'DreamFactory Access Management Module',
                                        type: 'error',
                                        provider: 'dreamfactory',
                                        exception: error
                                    }
                                })
                        }],
                        getUsersData: ['DSP_URL', '$http', function (DSP_URL, $http) {

                            var requestDataObj = {
                                limit: 100,
                                include_count: true,
                                include_schema: true
                            };


                            return $http.get(DSP_URL + '/rest/system/user', {params: requestDataObj})
                                .success(function (data) {

                                    return data
                                })
                                .error(function (error) {

                                    throw {
                                        module: 'DreamFactory Access Management Module',
                                        type: 'error',
                                        provider: 'dreamfactory',
                                        exception: error
                                    }
                                })
                        }],
                        getAppsData: ['DSP_URL', '$http', function (DSP_URL, $http) {

                            var requestDataObj = {
                                limit: 100,
                                related: null,
                                include_count: true,
                                include_schema: true
                            };

                            return $http.get(DSP_URL + '/rest/system/app', {params: requestDataObj})
                                .success(function (data) {
                                    return data
                                })
                                .error(function (error) {

                                    throw {
                                        module: 'DreamFactory Access Management Module',
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
    .controller('UsersCtrl', ['DSP_URL', '$scope', 'getUsersData', 'getRolesData', 'getAppsData', function(DSP_URL, $scope, getUsersData, getRolesData, getAppsData){

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

        $scope.__users__ = getUsersData;
        $scope.__roles__ = getRolesData;
        $scope.__apps__ = getAppsData;


        $scope.roles = $scope.__getDataFromResponse($scope.__roles__);
        $scope.apps = $scope.__getDataFromResponse($scope.__apps__);


        // PUBLIC VARS

        $scope.activeView = 'create';

        $scope.open = function (viewStr) {

            $scope.activeView = viewStr
        };
    }])
    .directive('dfManageUsers', ['MODUSER_ASSET_PATH', 'DSP_URL', function(MODUSER_ASSET_PATH, DSP_URL) {

        return {
            restrict: 'E',
            scope: true,
            templateUrl: MODUSER_ASSET_PATH + 'views/manage-users.html',
            link: function(scope, elem, attrs) {

                scope.options = {
                    service: 'system',
                    table: 'user',
                    url: DSP_URL + '/rest/system/user',
                    data: scope.__users__,
                    defaultFields:{
                        id: true,
                        email: true,
                        first_name: true,
                        last_name: true,
                        user_data: 'private',
                        user_source: 'private'
                    },
                    relatedData: [
                        {
                            field: 'role_id',
                            record: scope.__roles__,
                            editable: true,
                            display: {
                                type: 'select',
                                value: 'id',
                                label: 'name',
                                dependent: 'is_sys_admin'
                            }
                        },
                        {
                            field: 'default_app_id',
                            record: scope.__apps__,
                            editable: true,
                            display: {
                                type: 'select',
                                value: 'id',
                                label: 'name'
                            }
                        }
                    ],
                    extendedData: [
                        {
                            name: 'password'
                        }
                    ],
                    extendFieldTypes: []
                }
            }
        }
    }])
    .directive('dfCreateUser', ['MODUSER_ASSET_PATH', 'DSP_URL', '$http', function(MODUSER_ASSET_PATH, DSP_URL, $http) {



        return {
            restrict: 'E',
            scope: {
                roles: "="
            },
            templateUrl: MODUSER_ASSET_PATH + 'views/create-user.html',
            link: function (scope, elem, attrs) {


                scope.user = {
                    email: null,
                    first_name: null,
                    last_name: null,
                    display_name: null,
                    phone: null,
                    is_sys_admin: false,
                    role_id: null,
                    active: false,
                    lookup_keys: []
                };





                scope.inProgress = false;



                // PUBLIC API
                scope.createUser = function () {

                    scope._createUser();
                };


                // PRIVATE API
                scope._saveUserToSystem = function (requestDataObj) {

                    requestDataObj = requestDataObj || {};

                    return $http({
                        method: 'POST',
                        url: DSP_URL + '/rest/system/user',
                        data: scope.user,
                        params: requestDataObj
                    });
                };

                scope._setInProgress = function (stateBool) {

                    scope.inProgress = stateBool;
                };


                // COMPLEX IMPLEMENTATION
                scope._createUser = function () {

                    scope._setInProgress(true);
                    scope._saveUserToSystem().then(
                        function(result) {

                            console.log(result);

                        },

                        function(reject) {

                            throw {
                                module: 'DreamFactory Table Module',
                                type: 'error',
                                provider: 'dreamfactory',
                                exception: reject
                            }

                        }
                    ).finally(
                        function () {
                            scope._setInProgress(false)
                        },
                        function () {
                            scope._setInProgress(false);
                        });
                };



                // WATCHERS AND INIT








            }
        }
    }])



/*
 relatedData: [
 {
 field: 'role_id',
 record: scope.__roles__,
 editable: true,
 display: {
 type: 'select',
 value: 'id',
 label: 'name'
 }
 }
 ],
 extendFieldTypes: [
 {
 db_type: 'reference',
 template: 'my-custom-template.html',
 type: 'custom',
 editable: false
 }
 ]
 }*/

