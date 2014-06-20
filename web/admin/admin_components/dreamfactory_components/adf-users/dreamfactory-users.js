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
    .run(['DSP_URL', '$templateCache', function (DSP_URL, $templateCache) {

        $templateCache.put('confirmed-template.html', '<df-confirm-user></df-confirm-user>');
        $templateCache.put('df-input-password.html', '<df-set-user-password></df-set-user-password>');
        $templateCache.put('df-input-lookup-keys.html', '<df-user-lookup-keys></df-user-lookup-keys>');
        $templateCache.put('df-input-role-picker.html', '<df-role-picker></df-role-picker>');
        $templateCache.put('df-input-app-picker.html', '<df-app-picker></df-app-picker>');
        $templateCache.put('df-input-sys-admin.html', '<df-sys-admin-user></df-sys-admin-user>');
        $templateCache.put('df-input-active-user.html', '<df-active-user></df-active-user>');



    }])
    .controller('UsersCtrl', ['DSP_URL', '$scope', 'getUsersData', 'getRolesData', 'getAppsData', 'dfUserManagementEventService', function(DSP_URL, $scope, getUsersData, getRolesData, getAppsData, dfUserManagementEventService){

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


        $scope.es = dfUserManagementEventService;


        // PUBLIC VARS

        $scope.activeView = 'manage';

        $scope.open = function (viewStr) {

            $scope.activeView = viewStr
        };


        // PRIVATE API
        $scope._alertSuccess = function (message) {

            $(function(){
                new PNotify({
                    title: 'Users',
                    type:  'success',
                    text:  message
                });
            });
        };

        // MESSAGES




        $scope.$on($scope.es.alertSuccess, function (e, messageObj) {

            $scope._alertSuccess(messageObj.message)
        });



    }])
    .directive('dfManageUsers', ['MODUSER_ASSET_PATH', 'DSP_URL', 'dfUserManagementEventService', function(MODUSER_ASSET_PATH, DSP_URL, dfUserManagementEventService) {

        return {
            restrict: 'E',
            scope: true,
            templateUrl: MODUSER_ASSET_PATH + 'views/manage-users.html',
            link: function(scope, elem, attrs) {


                scope.es = dfUserManagementEventService;

                scope.options = {
                    service: 'system',
                    table: 'user',
                    url: DSP_URL + '/rest/system/user',
                    // Load data on demand instead of resolving b/c of relatedData field
                   /* data: scope.__users__,*/
                    defaultFields:{
                        id: true,
                        email: true,
                        display_name: true,
                        is_active: true,
                        confirmed: true,
                        user_data: 'private',
                        user_source: 'private'
                    },
                    excludeFields: [
                        {
                            name: 'id',
                            fields: {
                                create: true,
                                edit: true
                            }
                        },
                        {
                            name: 'created_by_id',
                            fields: {
                                create: true,
                                edit: true
                            }
                        },
                        {
                            name: 'last_modified_by_id',
                            fields: {
                                create: true,
                                edit: true
                            }
                        },
                        {
                            name: 'created_date',
                            fields: {
                                create: true,
                                edit: true
                            }
                        },
                        {
                            name: 'last_modified_date',
                            fields: {
                                create: true,
                                edit: true
                            }
                        }
                    ],
                    overrideFields: [
                        {
                            field: 'role_id',
                            record: scope.__roles__,
                            editable: true,
                            display: {
                                type: 'custom',
                                template: 'df-input-role-picker.html',
                                label: 'name',
                                value: 'id',
                                dependent: 'is_sys_admin'
                            }
                        },
                        {
                            field: 'default_app_id',
                            record: scope.__apps__,
                            editable: true,
                            display: {
                                type: 'custom',
                                template: 'df-input-app-picker.html',
                                label: 'name',
                                value: 'id'
                            }
                        },
                        {
                            field: 'is_sys_admin',
                            editable: true,
                            display: {
                                type: 'custom',
                                template: 'df-input-sys-admin.html'
                            }
                        },
                        {
                            field: 'is_active',
                            editable: true,
                            display: {
                                type: 'custom',
                                template: 'df-input-active-user.html'
                            }
                        },
                        {
                            field: 'confirmed',
                            display: {
                                type: 'custom',
                                template: 'confirmed-template.html'
                            }
                        },
                        {
                            field: 'password',
                            display: {
                                type: 'custom',
                                template: 'df-input-password.html'
                            }
                        },
                        {
                            field: 'lookup_keys',
                            display: {
                                type: 'custom',
                                template: 'df-input-lookup-keys.html'
                            }
                        }
                    ],
                    extendData: [
                        {
                            name: 'password'
                        }
                    ],
                    extendSchema: [
                        {
                            name: 'confirmed',
                            label: 'Confirmed',
                            type: 'boolean'
                        },
                        {
                            name: 'lookup_keys',
                            label: 'Lookup Keys',
                            type: 'custom'
                        }
                    ],
                    extendFieldTypes: [],
                    relatedData: ["lookup_keys"],
                    groupFields: {
                        1: {
                            name: 'User Info',
                            fields: ['email', 'first_name', 'last_name', 'display_name', 'phone'],
                            dividers: false
                        },
                        2: {
                            name: 'User Config',
                            fields: ['is_sys_admin', 'role_id', 'is_active', 'password', 'confirmed', 'lookup_keys'],
                            dividers: true
                        }
                    }
                };
            }
        }
    }])
    .directive('dfCreateUser', ['MODUSER_ASSET_PATH', 'DSP_URL', '$http', '$anchorScroll', 'dfUserManagementEventService', function(MODUSER_ASSET_PATH, DSP_URL, $http, $anchorScroll, dfUserManagementEventService) {
        return {
            restrict: 'E',
            scope: true,
            templateUrl: MODUSER_ASSET_PATH + 'views/create-user.html',
            link: function (scope, elem, attrs) {


                // Create alias
                scope.es = dfUserManagementEventService;

                scope.currentEditRecord = null;

                scope.inProgress = false;

                // PUBLIC API
                scope.createUser = function () {

                    scope._createUser();
                };

                scope.clearForm = function () {

                    scope._clearForm();
                };


                // PRIVATE API
                scope._saveUserToSystem = function (requestDataObj) {

                    requestDataObj = requestDataObj || {};

                    return $http({
                        method: 'POST',
                        url: DSP_URL + '/rest/system/user',
                        data: scope.currentEditRecord,
                        params: requestDataObj
                    });
                };

                scope._createUserModel = function () {

                    return {
                        email: null,
                        first_name: null,
                        last_name: null,
                        display_name: null,
                        phone: null,
                        is_sys_admin: false,
                        role_id: null,
                        password: '',
                        active: false,
                        lookup_keys: []
                    };
                };

                scope._setInProgress = function (stateBool) {

                    scope.inProgress = stateBool;
                };

                scope._resetForm = function () {
                    scope.currentEditRecord = scope._createUserModel();
                    scope.userForm.$setPristine();

                    // Scrolls to top of the page
                    $anchorScroll();

                    scope.$broadcast(scope.es.resetUserForm);
                };


                // COMPLEX IMPLEMENTATION
                scope._createUser = function () {

                    scope._setInProgress(true);
                    scope._saveUserToSystem().then(
                        function(result) {

                            scope._resetForm();
                            scope.$emit(scope.es.createUserSuccess, result);
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

                scope._clearForm = function () {

                    scope._resetForm();
                };




                // WATCHERS AND INIT

                scope.$watch('activeView', function(newValue, oldValue) {

                    if (newValue === 'create') {
                        scope._resetForm();
                    }
                });

            }
        }
    }])
    .directive('dfConfirmUser', ['DSP_URL', 'MODUSER_ASSET_PATH', '$http', 'dfUserManagementEventService', function(DSP_URL, MODUSER_ASSET_PATH, $http, dfUserManagementEventService) {

        return {
            restrict: 'E',
            scope: false,
            templateUrl: MODUSER_ASSET_PATH + 'views/df-input-confirm-user.html',
            link: function(scope, elem, attrs) {


                scope.es = dfUserManagementEventService;


                scope.invite = function() {

                    scope._invite();
                };

                scope._sendInvite = function () {

                    return  $http({
                        url: DSP_URL + '/rest/system/user',
                        method: 'PATCH',
                        params: {
                            send_invite: true
                        },
                        data: {
                            id: scope.currentEditRecord.id
                        }
                    })
                };

                scope._invite = function () {


                    scope._sendInvite().then(
                        function(result) {

                            scope.$emit(scope.es.alertSuccess, {message: 'Invite sent successfully.'});
                        },
                        function (reject) {

                            throw {
                                module: 'DreamFactory Users Management Module',
                                type: 'error',
                                provider: 'dreamfactory',
                                exception: reject
                            }
                        }
                    );
                }

            }
        }
    }])
    .directive('dfActiveUser', ['MODUSER_ASSET_PATH', function(MODUSER_ASSET_PATH) {

        return {
            restrict: 'E',
            scope: false,
            templateUrl: MODUSER_ASSET_PATH + 'views/df-input-active-user.html',
            link: function (scope, elem, attrs) {}

        }
    }])
    .directive('dfSetUserPassword', ['MODUSER_ASSET_PATH', '$compile', 'dfStringService', 'dfUserManagementEventService', function(MODUSER_ASSET_PATH, $compile,dfStringService, dfUserManagementEventService) {

        return {
            restrict: 'E',
            scope: false,
            templateUrl: MODUSER_ASSET_PATH + 'views/df-input-manual-password.html',
            link: function(scope, elem, attrs) {

                scope.es = dfUserManagementEventService;

                scope.verifyPassword = '';

                scope.identical = true;

                // Test if our entered passwords are identical
                scope._verifyPassword = function () {
                    scope.identical = dfStringService.areIdentical(scope.currentEditRecord.password, scope.verifyPassword);
                };


                // WATCHERS AND INIT
                var watchSetPassword = scope.$watch('setPassword', function (newValue, oldValue) {

                    if (!newValue) return false;

                    var html =  '<div class="form-group" data-ng-class="{\'has-error\' : identical === false}">' +
                                '<input type="password" id="password" name="password" placeholder="Enter Password" data-ng-model="currentEditRecord.password" class="form-control" data-ng-required="true" data-ng-keyup="_verifyPassword()" >' +
                                '</div>' +
                                '<div class="form-group" data-ng-class="{\'has-error\' : identical === false}">' +
                                '<input type="password" id="verify-password" name="verify-password" placeholder="Verify Password" data-ng-model="verifyPassword" class="form-control" data-ng-required="true" data-ng-keyup="_verifyPassword()" >' +
                                '</div>';


                    var el = $compile(html)(scope);

                    angular.element('#set-password').append(el);

                });


                // MESSAGES
                // Listen for userForm clear message
                scope.$on(scope.es.resetUserForm, function (e) {
                    scope.verifyPassword = '';
                    scope.setPassword = false;
                });

                scope.$on('$destroy', function (e) {

                    watchSetPassword();
                });
            }
        }
    }])
    .directive('dfSysAdminUser', ['MODUSER_ASSET_PATH',function(MODUSER_ASSET_PATH) {

        return {
            restrict: 'E',
            scope: false,
            templateUrl: MODUSER_ASSET_PATH + 'views/df-input-sys-admin.html',
            link: function (scope, elem, attrs) {}
        }
    }])
    .directive('dfRolePicker', ['MODUSER_ASSET_PATH', '$http', function(MODUSER_ASSET_PATH, $http) {

        return {
            restrict: 'E',
            scope: false,
            templateUrl:MODUSER_ASSET_PATH + 'views/df-input-role-picker.html',
            link: function(scope, elem, attrs) {}
        }
    }])
    .directive('dfAppPicker', ['MODUSER_ASSET_PATH', '$http', function(MODUSER_ASSET_PATH, $http) {

        return {
            restrict: 'E',
            scope: false,
            templateUrl:MODUSER_ASSET_PATH + 'views/df-input-app-picker.html',
            link: function(scope, elem, attrs) {}
        }
    }])
    .directive('dfUserLookupKeys', ['MODUSER_ASSET_PATH', function(MODUSER_ASSET_PATH) {

        return {
            restrict: 'E',
            scope: false,
            templateUrl: MODUSER_ASSET_PATH + 'views/df-input-lookup-keys.html',
            link: function(scope, elem, attrs) {


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
                        private: false,
                        allow_user_update: false
                    };
                };



                scope._isUniqueKey = function() {

                    var size = scope.currentEditRecord.lookup_keys.length - 1;
                    for ( var i = 0; i < size; i++ ) {
                        var key = scope.currentEditRecord.lookup_keys[i];
                        var matches = scope.currentEditRecord.lookup_keys.filter(
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

                    scope.currentEditRecord.lookup_keys.push(scope._createLookupKeyModel());
                };

                scope._removeKey = function () {

                    scope.currentEditRecord.lookup_keys.splice( this.$index, 1 );
                };



                // WATCHERS AND INIT




                // MESSAGES

            }
        }
    }])
    .service('dfUserManagementEventService', [function() {

        return {
            resetUserForm: 'reset:userForm',
            createUserSuccess: 'create:user:success',
            alertSuccess: 'alert:success'
        }
    }]);
