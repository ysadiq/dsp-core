angular.module('dfNavBar', ['ngRoute', 'dfUtility'])
    .constant('MODSIDEBARNAV_ROUTER_PATH', '/sidebar')
    .constant('MODSIDEBARNAV_ASSET_PATH', 'admin_components/dreamfactory_components/adf-navbar/')
    .config(['$routeProvider', 'MODSIDEBARNAV_ROUTER_PATH', 'MODSIDEBARNAV_ASSET_PATH',
        function ($routeProvider, MODSIDEBARNAV_ROUTER_PATH, MODSIDEBARNAV_ASSET_PATH) {
            $routeProvider
                .when(MODSIDEBARNAV_ROUTER_PATH, {
                    templateUrl: MODSIDEBARNAV_ASSET_PATH + 'views/main.html',
                    controller: 'SideBarNavCtrl',
                    resolve: {}  
                });
        }])
    .controller('NavBarCtrl', ['$scope', '$location', function ($scope, $location) {

        $scope.links = [
            {
                name: 'quickstart',
                label: 'Quickstart',
                active: true,
                url: '/',
                icon: 'fa fa-info-circle'
            },
            {
                name: 'apps',
                label: 'Apps',
                active: true,
                url: '/app',
                icon: 'fa fa-cloud'
            },
            {
                name: 'app-groups',
                label: 'App Groups',
                active: true,
                url: '/group',
                icon: 'fa fa-sitemap'
            },
            {
                name: 'user',
                label: 'Users',
                active: true,
                url: '/user',
                icon: 'fa fa-user'
            },
            {
                name: 'roles',
                label: 'Roles',
                active: true,
                url: '/role',
                icon: 'fa fa-group'
            },
            {
                name: 'data',
                label: 'Data',
                active: true,
                url: '/data',
                icon: 'fa fa-database'
            },
            {
                name: 'services',
                label: 'Services',
                active: true,
                url: '/service',
                icon: 'fa fa-exchange'
            },
            {
                name: 'schema',
                label: 'Schema',
                active: true,
                url: '/schema',
                icon: 'fa fa-table'
            },
            {
                name: 'api-sdk',
                label: 'API Docs',
                active: true,
                url: '/api#swagger',
                icon: 'fa fa-institution'
            },
            {
                name: 'packages',
                label: 'Packages',
                active: true,
                url: '/package',
                icon: 'fa fa-gift'
            },
            {
                name: 'config',
                label: 'Config',
                active: true,
                url: '/config',
                icon: 'fa fa-cog'
            },
            {
                name: 'scripts',
                label: 'Scripts',
                active: true,
                url: '/scripts',
                icon: 'fa fa-file-text'
            }
        ];

        $scope.currentPage = null ;

        $scope.navigateTo = function(linkObj) {

            if ($location.$$path === '/import') {
                $scope._navigateTo(linkObj);
            }else if (linkObj.url === $scope.currentPage.url) return false;


            $scope._navigateTo(linkObj);
        };

        $scope._setCurrentPage = function (linkObj) {

            $scope.currentPage = linkObj;
        };

        $scope._navigateTo = function (linkObj) {

            $location.url(linkObj.url);
            $scope._setCurrentPage(linkObj);
        };

        $scope.$watch('currentPage', function (newValue, oldValue) {

            if (newValue == null ) {

                var link = $scope.links[0],
                    i = 0;

                while ((link.url !== $location.$$path) && (i < $scope.links.length - 1)) {

                    link = $scope.links[i];

                    i++
                }

                $scope._setCurrentPage(link);

                return false;
            }




        })

    }])
    .directive('sidebarNavOne', ['MODSIDEBARNAV_ASSET_PATH', function (MODSIDEBARNAV_ASSET_PATH) {

        return {
            restrict: 'E',
            scope: false,
            templateUrl: MODSIDEBARNAV_ASSET_PATH + 'views/sidebar-nav-one.html',
            link: function (scope, elem, attrs) {}
        }
    }])
    .directive('topbarNavOne', ['MODSIDEBARNAV_ASSET_PATH', function (MODSIDEBARNAV_ASSET_PATH) {

        return {
            restrict: 'E',
            scope: false,
            templateUrl: MODSIDEBARNAV_ASSET_PATH + 'views/topbar-nav-one.html',
            link: function (scope, elem, attrs) {}
        }
    }]);