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
                    // Load data on demand instead of resolving b/c of relatedData field
                   /* data: scope.__users__,*/
                    defaultFields:{
                        id: true,
                        email: true,
                        display: true,
                        is_active: true,
                        confirmed: true,
                        user_data: 'private',
                        user_source: 'private'
                    },
                    overrideFields: [
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
                    extendedData: [
                        {
                            name: 'password'
                        }
                    ],
                    extendedSchema: [
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
                    relatedData: ["lookup_keys"]
                }
            }
        }
    }])
    .directive('dfCreateUser', ['MODUSER_ASSET_PATH', 'DSP_URL', '$http', function(MODUSER_ASSET_PATH, DSP_URL, $http) {
        return {
            restrict: 'E',
            scope: true,
            templateUrl: MODUSER_ASSET_PATH + 'views/create-user.html',
            link: function (scope, elem, attrs) {


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
                };


                // COMPLEX IMPLEMENTATION
                scope._createUser = function () {

                    scope._setInProgress(true);
                    scope._saveUserToSystem().then(
                        function(result) {

                            scope._resetForm();
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
                })
            }
        }
    }])
    .directive('dfConfirmUser', ['DSP_URL', function(DSP_URL) {

        return {
            restrict: 'E',
            scope: false,
            template: '<div data-ng-if="currentEditRecord.confirmed"><p>Confirmed</p></div>'+
                        '<div data-ng-if="!currentEditRecord.confirmed">' +
                        ' <button type="button" class="btn btn-default" data-ng-click="invite()"><i class="icon-envelope"></i> Send Invite</button>' +
                      '</div>',
            link: function(scope, elem, attrs) {

                scope.invite = function() {

                    scope._invite();
                };


                scope._invite = function () {

                    // Old ajax function....don't feel like rewriting right now.
                    // @TODO: Update this email unconfirmed/new user function
                    $.ajax(
                        {
                            dataType: 'json',
                            type:     'PATCH',
                            url: DSP_URL + '/rest/system/user/' + scope.currentEditRecord.id + '?app_name=admin&send_invite=true',
                            data:     {},
                            cache:    false,
                            success:  function() {

                                $(function(){
                                    new PNotify({
                                        title: 'Users',
                                        text: "Invite Sent",
                                        type: 'success'
                                    });
                                });
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
            template:
                '<label>' +
                    'Active ' +
                    '<input type="checkbox" data-ng-model="currentEditRecord.is_active" data-ng-checked="currentEditRecord.is_active" />' +
                '</label>',

            link: function (scope, elem, attrs) {}

        }
    }])
    .directive('dfSetUserPassword', [function() {

        return {
            restrict: 'E',
            scope: false,
            template:'<p>Set Password Manually <input type="checkbox" data-ng-model="setPassword" data-ng-checked="setPassword"></p>' +
                        '<div data-ng-if="setPassword" class="form-group">' +
                            '<p data-ng-class="{\'has-error\' : identical === false}">' +
                                '<input type="password" id="password" name="password" placeholder="Enter Password" data-ng-model="currentEditRecord[field.name]" class="form-control" required data-ng-keyup="_verifyPassword()" >' +
                            '</p>' +
                            '<p data-ng-class="{\'has-error\' : identical === false}">' +
                                '<input type="password" id="verify-password" name="verify-password" placeholder="Verify Password" data-ng-model="verifyPassword" class="form-control" required data-ng-keyup="_verifyPassword()" >' +
                            '</p>' +
                      '</div>',
            link: function(scope, elem, attrs) {

                scope.verifyPassword = '';

                scope.identical = true;

                // Test if our entered passwords are identical
                scope._verifyPassword = function () {

                    scope.identical = dfStringService.areIdentical(scope.currentEditRecord.password, scope.verifyPassword);
                };
            }
        }
    }])
    .directive('dfSysAdminUser', [function() {

        return {
            restrict: 'E',
            scope: false,
            template:
                '<label>' +
                    'System Administrator &nbsp;' +
                    '<input data-ng-click="toggleRoleSelect($event.target.checked)" data-ng-checked="currentEditRecord.is_sys_admin" type="checkbox" data-ng-model="currentEditRecord.is_sys_admin"/>' +
                '</label>',
            link: function (scope, elem, attrs) {}
        }
    }])
    .directive('dfRolePicker', ['$http', function($http) {

        return {
            restrict: 'E',
            scope: false,
            template:
                '<select data-ng-disabled="currentEditRecord.is_sys_admin" class="form-control" data-ng-model="currentEditRecord.role_id" data-ng-options="role.id as role.name for role in roles">' +
                    '<option value="">-- None --</option>' +
                '</select>',
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
    }]);
