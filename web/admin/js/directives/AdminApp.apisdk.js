'use strict';

angular.module('AdminApp.apisdk', []).
    directive('apisdk', ['$window', function($window) {

        return {
            restrict: 'E',
            replace:true,
            controller: function($scope, $element) {


                $scope.activeTab = 'swagger';


                $scope.init = function() {
                    console.log('swagger init');
                  $scope.activateTab('swagger');
                    $scope.getCurrentServer();
                };





                $scope.activateTab = function(tabIdStr) {

                    console.log('activate called');
                    $scope.activeTab = tabIdStr;
                    $scope.$broadcast('tab:activate:tab', tabIdStr);
                };

                $scope.getActiveTab = function() {
                    return $scope.activeTab;
                };


                $scope.getCurrentServer = function() {

                    return $window.location.protocol + '\/\/' + $window.location.host;
                };






                $scope.$on('tab:active', function(e) {

                    $scope.$broadcast('tab:active:tab', $scope.getActiveTab());
                });


                $scope.$on('get:server', function(e) {

                    $scope.$broadcast('get:server:address', $scope.getCurrentServer());
                });


                $scope.init();


            },
            templateUrl: 'views/directives/apisdk/main.html',
            link: function(scope, elem, attrs) {

            }
        }
    }])
    .directive('swagger', [function() {

        return {
            restrict: 'E',
            require: '^apisdk',
            replace: true,
            scope: {},
            templateUrl: 'views/directives/apisdk/swagger.html',
            link: function(scope, elem, attrs) {

                scope.active = false;
                scope.id = 'swagger';
                scope.iframeUrl = null;

                scope.init = function() {

                    scope.$emit('tab:active');
                    scope.$emit('get:server');
                };



                scope.$on('tab:activate:tab', function(e, tabIdStr) {

                    scope.active = scope.id === tabIdStr;
                    console.log('swagger respond to activate ' + scope.active);

                });

                scope.$on('tab:active:tab', function(e, tabIdStr) {

                    console.log('asdf');
                    scope.active = scope.id === tabIdStr;
                    console.log(scope.active);
                });

                scope.$on('get:server:address', function(e, addressStr) {

                    console.log('setting iframe address')

                    scope.iframeUrl = addressStr + '/swagger/';
                    console.log(scope.iframeUrl);
                });


                scope.init();
            }
        }
    }])
    .directive('sdk', [function() {

        return {
            restrict: 'E',
            require: '^apisdk',
            replace: true,
            scope: {},
            templateUrl: 'views/directives/apisdk/sdk.html',
            link: function(scope, elem, attrs) {

                scope.active = false;
                scope.id = 'sdk';
                scope.iframeUrl = null;

                scope.init = function() {

                    scope.$emit('tab:active');
                    scope.$emit('get:server');
                };

                scope.$on('tab:activate:tab', function(e, tabIdStr) {

                    scope.active = scope.id === tabIdStr;
                    console.log('sdk respond to activate ' + scope.active);

                });

                scope.$on('tab:active:tab', function(e, tabIdStr) {

                    scope.active = scope.id === tabIdStr
                });

                scope.$on('get:server:address', function(e, addressStr) {

                    console.log('setting iframe address');
                    scope.iframeUrl = addressStr + '/docs/';
                });
            }
        }
    }])
    .service('ApiSDKPageData', [function() {

        var pageData = {};


        return {

        }


    }]);

