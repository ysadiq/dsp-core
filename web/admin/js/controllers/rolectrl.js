var RoleCtrl = function ($scope, RolesRelated, User, App, Service, $http) {
    $scope.$on('$routeChangeSuccess', function () {
        $(window).resize();
    });
    Scope = $scope;
    Scope.role = {users: [], apps: [], role_service_accesses: [], role_system_accesses:[], lookup_keys: []};
    Scope.action = "Create new ";
    Scope.actioned = "Created";
    $('#update_button').hide();
    //$("#alert-container").empty().hide();
    //$("#success-container").empty().hide();

    Scope.AllUsers = User.get();
    Scope.Apps = App.get();
    // service access
    Scope.ServiceComponents = {};
    Scope.Services = Service.get(function (data) {
        var services = data.record;
        services.unshift({id: 0, name: "All", type: ""});
        services.forEach(function (service, index) {
            Scope.ServiceComponents[index] = [];
            var allRecord = {name: '*', label: 'All', plural: 'All'};
            Scope.ServiceComponents[index].push(allRecord);
            if(service.id > 0) {
                $http.get('/rest/' + service.api_name + '?app_name=admin&fields=*').success(function (data) {
                    // some services return no resource array
                    if (data.resource != undefined) {
                        Scope.ServiceComponents[index] = Scope.ServiceComponents[index].concat(data.resource);
                    }
                }).error(function(){});
            }
        });
    });
    Scope.uniqueServiceAccess = function () {
        var size = Scope.role.role_service_accesses.length;
        for (i = 0; i < size; i++) {
            var access = Scope.role.role_service_accesses[i];
            var matches = Scope.role.role_service_accesses.filter(function(itm){return itm.service_id === access.service_id && itm.component === access.component;});
            if (matches.length > 1) {
                return false;
            }
        }
        return true;
    }
    Scope.cleanServiceAccess = function () {
        var size = Scope.role.role_service_accesses.length;
        for (i = 0; i < size; i++) {
            delete Scope.role.role_service_accesses[i].show_filters;
        }
    }
    // system access
    Scope.SystemComponents = [];
    var allRecord = {name: '*', label: 'All', plural: 'All'};
    Scope.SystemComponents.push(allRecord);
    $http.get('/rest/system?app_name=admin&fields=*').success(function (data) {
        Scope.SystemComponents = Scope.SystemComponents.concat(data.resource);
    }).error(function(){});
    Scope.uniqueSystemAccess = function () {
        var size = Scope.role.role_system_accesses.length;
        for (i = 0; i < size; i++) {
            var access = Scope.role.role_system_accesses[i];
            var matches = Scope.role.role_system_accesses.filter(function(itm){return itm.component === access.component;});
            if (matches.length > 1) {
                return false;
            }
        }
        return true;
    }
    Scope.cleanSystemAccess = function () {
        var size = Scope.role.role_system_accesses.length;
        for (i = 0; i < size; i++) {
            delete Scope.role.role_system_accesses[i].show_filters;
        }
    }
    Scope.FilterOps = ["=", "!=",">","<",">=","<=", "in", "not in", "starts with", "ends with", "contains"];

    Scope.Roles = RolesRelated.get();

    Scope.save = function () {

        if (!Scope.uniqueServiceAccess()) {
            $.pnotify({
                title: 'Roles',
                type: 'error',
                text: 'Duplicate service access entries are not allowed.'
            });
            return;
        }
        if (!Scope.uniqueSystemAccess()) {
            $.pnotify({
                title: 'Roles',
                type: 'error',
                text: 'Duplicate system access entries are not allowed.'
            });
            return;
        }
        if (Scope.emptyKey()) {
            $.pnotify({
                title: 'Roles',
                type: 'error',
                text: 'Empty key names are not allowed.'
            });
            return;
        }
        if (!Scope.uniqueKey()) {
            $.pnotify({
                title: 'Roles',
                type: 'error',
                text: 'Duplicate key names are not allowed.'
            });
            return;
        }
        Scope.cleanServiceAccess();
        Scope.cleanSystemAccess();

        var id = this.role.id;
        RolesRelated.update({id: id}, Scope.role, function (response) {
            Scope.role.lookup_keys = angular.copy(response.lookup_keys);
            updateByAttr(Scope.Roles.record, 'id', id, Scope.role);
            Scope.promptForNew();
            //window.top.Actions.showStatus("Updated Successfully");

            // Success Message
            $.pnotify({
                title: 'Roles',
                type: 'success',
                text: 'Role Updated Successfully'
            });
        }, function (response) {
            var code = response.status;
            if (code == 401) {
                window.top.Actions.doSignInDialog("stay");
                return;
            }
            $.pnotify({
                title: 'Error',
                type: 'error',
                hide: false,
                addclass: "stack-bottomright",
                text: getErrorString(response)
            });
        });
    };
    Scope.create = function () {

        if (!Scope.uniqueServiceAccess()) {
            $.pnotify({
                title: 'Roles',
                type: 'error',
                text: 'Duplicate service access entries are not allowed.'
            });
            return;
        }
        if (!Scope.uniqueSystemAccess()) {
            $.pnotify({
                title: 'Roles',
                type: 'error',
                text: 'Duplicate system access entries are not allowed.'
            });
            return;
        }
        if (Scope.emptyKey()) {
            $.pnotify({
                title: 'Roles',
                type: 'error',
                text: 'Empty key names are not allowed.'
            });
            return;
        }
        if (!Scope.uniqueKey()) {
            $.pnotify({
                title: 'Roles',
                type: 'error',
                text: 'Duplicate key names are not allowed.'
            });
            return;
        }
        Scope.cleanServiceAccess();
        Scope.cleanSystemAccess();
		RolesRelated.save(Scope.role, function (data) {
            Scope.Roles.record.push(data);
            //window.top.Actions.showStatus("Created Successfully");
            Scope.promptForNew();

            // Success Message
            $.pnotify({
                title: 'Roles',
                type: 'success',
                text: 'Role Created Successfully'
            });

        }, function (response) {
            var code = response.status;
            if (code == 401) {
                window.top.Actions.doSignInDialog("stay");
                return;
            }
            $.pnotify({
                title: 'Error',
                type: 'error',
                hide: false,
                addclass: "stack-bottomright",
                text: getErrorString(response)
            });
        });
    };

    Scope.isUserInRole = function () {
        var currentUser = this.user;
        var inRole = false;
        if (Scope.role.users) {
            angular.forEach(Scope.role.users, function (user) {
                if (angular.equals(user.id, currentUser.id)) {
                    inRole = true;
                }
            });
        }
        return inRole;
    };

    Scope.isAppInRole = function () {

        var currentApp = this.app;
        var inRole = false;
        if (Scope.role.apps) {
            angular.forEach(Scope.role.apps, function (app) {
                if (angular.equals(app.id, currentApp.id)) {
                    inRole = true;
                }
            });
        }
        return inRole;
    };
    Scope.addAppToRole = function () {
        if (checkForDuplicate(Scope.role.apps, 'id', this.app.id)) {
            Scope.role.apps = removeByAttr(Scope.role.apps, 'id', this.app.id);
        } else {
            Scope.role.apps.push(this.app);
        }
    };
    $scope.updateUserToRole = function () {
        if (checkForDuplicate(Scope.role.users, 'id', this.user.id)) {
            Scope.role.users = removeByAttr(Scope.role.users, 'id', this.user.id);
        } else {
            Scope.role.users.push(this.user);
        }
    };

    // service access

    Scope.removeServiceAccess = function () {

        var rows = Scope.role.role_service_accesses;
        rows.splice(this.$index, 1);
    };

    Scope.newServiceAccess = function () {

        var newAccess = {"access": "Full Access", "component": "*", "service_id": 0};
        newAccess.filters = [];
        newAccess.filter_op = "AND";
        newAccess.show_filters = false;
        Scope.role.role_service_accesses.push(newAccess);
    }

    Scope.newServiceAccessFilter = function () {

        var newFilter = {"name": "", "operator": "=", "value": ""};
        this.service_access.filters.push(newFilter);
    }

    Scope.removeServiceAccessFilter = function () {

        var rows = this.service_access.filters;
        rows.splice(this.$index, 1);
    };

    Scope.selectService = function () {

        this.service_access.component = "*";
        if (!Scope.allowFilters(this.service_access.service_id)) {
            this.service_access.filter_op = "AND";
            this.service_access.filters = [];
        }
    }

    Scope.serviceId2Index = function (id) {

        var size = Scope.Services.record.length;
        for (i = 0; i < size; i++) {
            if (Scope.Services.record[i].id === id) {
                return i;
            }
        }
        return -1;
    };

    Scope.allowFilters = function (id) {

        var size = Scope.Services.record.length;
        for (i = 0; i < size; i++) {
            if (Scope.Services.record[i].id === id) {
                switch (Scope.Services.record[i].type) {
                    case "Local SQL DB":
                    case "Remote SQL DB":
                    case "NoSQL DB":
                    case "Salesforce":
                        return true;
                    default:
                        return false;
                }
            }
        }
        return false;
    };

    Scope.toggleServiceAccessFilter = function () {

        this.service_access.show_filters = !this.service_access.show_filters;
    };

    Scope.toggleServiceAccessOp = function () {

        if (this.service_access.filter_op === "AND") {
            this.service_access.filter_op = "OR";
        } else {
            this.service_access.filter_op = "AND";
        }
    };

    // system access

    Scope.removeSystemAccess = function () {

        var rows = Scope.role.role_system_accesses;
        rows.splice(this.$index, 1);
    };

    Scope.newSystemAccess = function () {

        var newAccess = {"access": "Read Only", "component": "user"};
        newAccess.filters = [];
        newAccess.filter_op = "AND";
        newAccess.show_filters = false;
        Scope.role.role_system_accesses.push(newAccess);
    }

    Scope.newSystemAccessFilter = function () {

        var newFilter = {"name": "", "operator": "=", "value": ""};
        this.system_access.filters.push(newFilter);
    }

    Scope.removeSystemAccessFilter = function () {

        var rows = this.system_access.filters;
        rows.splice(this.$index, 1);
    };

    Scope.toggleSystemAccessFilter = function () {

        this.system_access.show_filters = !this.system_access.show_filters;
    };

    Scope.toggleSystemAccessOp = function () {

        if (this.system_access.filter_op === "AND") {
            this.system_access.filter_op = "OR";
        } else {
            this.system_access.filter_op = "AND";
        }
    };

    // keys

    Scope.removeKey = function () {

        var rows = Scope.role.lookup_keys;
        rows.splice(this.$index, 1);
    };

    Scope.newKey = function () {

        var newKey = {"name": "", "value": "", "private": false};
        Scope.role.lookup_keys.push(newKey);
    }

    Scope.uniqueKey = function () {
        var size = Scope.role.lookup_keys.length;
        for (i = 0; i < size; i++) {
            var key = Scope.role.lookup_keys[i];
            var matches = Scope.role.lookup_keys.filter(function(itm){return itm.name === key.name;});
            if (matches.length > 1) {
                return false;
            }
        }
        return true;
    }

    Scope.emptyKey = function () {

        var matches = Scope.role.lookup_keys.filter(function(itm){return itm.name === '';});
        return matches.length > 0;
    }

    //ADDED PNOTIFY
    $scope.delete = function () {
        var which = this.role.name;
        if (!which || which == '') {
            which = "the role?";
        } else {
            which = "the role '" + which + "'?";
        }
        if (!confirm("Are you sure you want to delete " + which)) {
            return;
        }
        var id = this.role.id;
        RolesRelated.delete({ id: id }, function () {
            Scope.promptForNew();

            //window.top.Actions.showStatus("Deleted Successfully");
            $("#row_" + id).fadeOut();

            // Success message
            $.pnotify({
                title: 'Roles',
                type: 'success',
                text: 'Role deleted.'
            });
        }, function(response) {

            var code = response.status;
            if (code == 401) {
                window.top.Actions.doSignInDialog("stay");
                return;
            }
            $.pnotify({
                title: 'Error',
                type: 'error',
                hide: false,
                addclass: "stack-bottomright",
                text: getErrorString(response)
            });
        });

        // Shouldn't prompt for new on failure
        //Scope.promptForNew();
    };
    $scope.promptForNew = function () {
        angular.element(":checkbox").attr('checked', false);
        Scope.action = "Create new";
        Scope.actioned = "Created";
        Scope.role = {users: [], apps: [], role_service_accesses: [], role_system_accesses:[], lookup_keys: []};
        $('#save_button').show();
        $('#update_button').hide();
        //$("#alert-container").empty().hide();
        $("tr.info").removeClass('info');
        $(window).scrollTop(0);
    };
    $scope.showDetails = function () {
        //angular.element(":checkbox").attr('checked',false);
        Scope.action = "Edit this ";
        Scope.actioned = "Updated";
        Scope.role = angular.copy(this.role);
        Scope.users = angular.copy(Scope.role.users);
        Scope.apps = angular.copy(Scope.role.apps);
        $('#save_button').hide();
        $('#update_button').show();
        $("tr.info").removeClass('info');
        $('#row_' + Scope.role.id).addClass('info');
    }
    $scope.makeDefault = function(){
        Scope.role.default_app_id = this.app.id;
    };
    $scope.clearDefault = function(){
        Scope.role.default_app_id = null;
    };
};