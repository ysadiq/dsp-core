var UserCtrl = function ($scope, Config, User, Role, Service) {
    $scope.$on('$routeChangeSuccess', function () {
        $(window).resize();
    });
    Scope = $scope;
    Scope.defaultEmailService = null;
    Scope.Services = Service.get(function(data){
            data.record.forEach(function(service){
                if(service.type.indexOf("Email Service") != -1){
                    Scope.defaultEmailService = service.api_name;
                }
            })
        }

    );
    Scope.Config = Config.get();
    Scope.Users = User.get();
    Scope.action = "Create";
    Scope.Roles = Role.get();
    Scope.passwordEdit = false;
    Scope.user = {};
    Scope.user.password = '';
    Scope.passwordRepeat = '';
    Scope.supportedExportFormats = ['CSV', 'JSON', 'XML'];
    Scope.selectedExportFormat = 'CSV';
    // keys
    Scope.user.lookup_keys = [];
    Scope.removeKey = function () {

        var rows = Scope.user.lookup_keys;
        rows.splice(this.$index, 1);
    };
    Scope.newKey = function () {

        var newKey = {"name": "", "value": "", "private": false, "allow_user_update": false};
        Scope.user.lookup_keys.push(newKey);
    }
    Scope.uniqueKey = function () {
        var size = Scope.user.lookup_keys.length;
        for (i = 0; i < size; i++) {
            var key = Scope.user.lookup_keys[i];
            var matches = Scope.user.lookup_keys.filter(function(itm){return itm.name === key.name;});
            if (matches.length > 1) {
                return false;
            }
        }
        return true;
    }
    Scope.emptyKey = function () {

        var matches = Scope.user.lookup_keys.filter(function(itm){return itm.name === '';});
        return matches.length > 0;
    }
    Scope.formChanged = function () {

        $('#save_' + this.user.id).removeClass('disabled');
    };

    Scope.save = function () {

        if (Scope.emptyKey()) {
            $.pnotify({
                title: 'Users',
                type: 'error',
                text: 'Empty key names are not allowed.'
            });
            return;
        }
        if (!Scope.uniqueKey()) {
            $.pnotify({
                title: 'Users',
                type: 'error',
                text: 'Duplicate key names are not allowed.'
            });
            return;
        }
        if(!this.user.display_name){
            this.user.display_name = this.user.first_name + ' ' + this.user.last_name;
        }
        if (this.passwordEdit) {
            if (this.user.password == '' || this.user.password != this.passwordRepeat) {
                $.pnotify({
                    title: 'Users',
                    type: 'error',
                    text: 'Please enter matching passwords.'
                });
                return;
            }
        } else {
            delete this.user.password;
        }
        var id = Scope.user.id;
        User.update({id:id}, Scope.user, function(response) {
            Scope.user.lookup_keys = angular.copy(response.lookup_keys);
            updateByAttr(Scope.Users.record, 'id', id, Scope.user);
            Scope.promptForNew();
            $.pnotify({
                title: 'Users',
                type: 'success',
                text: 'Updated Successfully'
            });
        }, function(response) {
            Scope.user.password = '';
            Scope.passwordRepeat = '';
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

        if (Scope.emptyKey()) {
            $.pnotify({
                title: 'Users',
                type: 'error',
                text: 'Empty key names are not allowed.'
            });
            return;
        }
        if (!Scope.uniqueKey()) {
            $.pnotify({
                title: 'Users',
                type: 'error',
                text: 'Duplicate key names are not allowed.'
            });
            return;
        }
        var newRec = this.user;
        if (this.passwordEdit) {
            if (newRec.password == '' || newRec.password != this.passwordRepeat) {
                $.pnotify({
                    title: 'Error',
                    type: 'error',
                    text: 'Please enter matching passwords.'
                });
                return;
            }
        } else {
            delete newRec.password;
        }
        if(!newRec.display_name){
            newRec.display_name = newRec.first_name + ' ' + newRec.last_name;
        }

        var send_invite = Scope.sendInvite ? "true" : "false";
        User.save({send_invite: send_invite}, newRec,
            function(response) {

                Scope.Users.record.push(response);
                $.pnotify({
                    title: 'Users',
                    type: 'success',
                    text: 'Created Successfully'
                });

                Scope.promptForNew();
            },
            function(response) {

                Scope.user.password = '';
                Scope.passwordRepeat = '';
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

    Scope.invite = function() {

        $.ajax({
            dataType: 'json',
            type: 'PATCH',
            url: CurrentServer + '/rest/system/user/' + this.user.id + '?app_name=admin&send_invite=true',
            data: {},
            cache: false,
            success: function(response) {

                $.pnotify({
                    title: 'Users',
                    type: 'success',
                    text: 'Invite sent!'
                });
            },
            error: function(response) {

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
                    text: 'Unable to send invite. ' + getErrorString(response)
                });
            }
        });
    };

    Scope.promptForNew = function () {

        Scope.action = "Create";
        Scope.passwordEdit = false;
        Scope.user = {};
        Scope.user.password = '';
        Scope.passwordRepeat = '';
        Scope.user.lookup_keys = [];
        $("tr.info").removeClass('info');
        $(window).scrollTop(0);
        Scope.userform.$setPristine();
    };

    Scope.delete = function () {

        var which = this.user.display_name;
        if (!which || which == '') {
            which = "the user?";
        } else {
            which = "the user '" + which + "'?";
        }
        if(!confirm("Are you sure you want to delete " + which)) {
            return;
        }
        var id = this.user.id;
        User.delete({ id:id }, function () {
            Scope.promptForNew();
            $("#row_" + id).fadeOut();
            $.pnotify({
                title: 'Users',
                type: 'success',
                text: 'Deleted Successfully.'
            });
        }, function(response) {
            var code = response.status;
            if (code == 401) {
                window.top.Actions.doSignInDialog("stay");
                return;
            }
            var error = response.error;
            $.pnotify({
                title: 'Error',
                type: 'error',
                hide: false,
                addclass: "stack-bottomright",
                text: getErrorString(response)
            });

        });
    };

    Scope.showDetails = function(){

        Scope.action = "Edit";
        Scope.passwordEdit = false;
        Scope.user = angular.copy(this.user);
        Scope.user.password = '';
        Scope.passwordRepeat = '';
        $("tr.info").removeClass('info');
        $('#row_' + Scope.user.id).addClass('info');
        Scope.userform.$setPristine();
    }

    Scope.toggleRoleSelect = function (checked) {

        if(checked == true){
            $('#role_select').prop('disabled', true);
        }else{
            $('#role_select').prop('disabled', false);
        }
    };

    Scope.showImportModal = function() {

        $('#importUsersModal').modal('toggle');
    };

    Scope.importUsers = function() {

        var params = 'app_name=admin';
        var filename = $('#userInput').val();
        if (filename == '') {
            $.pnotify({
                title: 'Error',
                type: 'error',
                hide: false,
                addclass: "stack-bottomright",
                text: 'Please specify a file to import.'
            });
            return;
        }
        var fmt = getFileExtension(filename);
        fmt = fmt.toUpperCase();
        if (fmt !== 'CSV' && fmt !== 'JSON' && fmt !== 'XML') {
            $.pnotify({
                title: 'Error',
                type: 'error',
                hide: false,
                addclass: "stack-bottomright",
                text: 'Supported file types are CSV, JSON, and XML.'
            });
            return;
        }
        $("#importUsersForm").attr('action','/rest/system/user?' + params);
        $("#importUsersForm").submit();
    };

    Scope.showExportModal = function() {

        $('#exportUsersModal').modal('toggle');
    };

    Scope.exportUsers = function() {

        var fmt = Scope.selectedExportFormat;
        fmt = fmt.toLowerCase();
        var params = 'app_name=admin&file=true&format=' + fmt;
        var url = CurrentServer + '/rest/system/user?' + params;
        $('#exportUsersFrame').attr('src', url);
        $('#exportUsersModal').modal('toggle');
    };

    window.checkImportResults = function(iframe) {

        var str = $(iframe).contents().text();
        if(str && str.length > 0) {
            if (isErrorString(str)) {
                var response = {};
                response.responseText = str;
                $.pnotify({
                    title: 'Error',
                    type: 'error',
                    hide: false,
                    addclass: "stack-bottomright",
                    text: getErrorString(response)
                });
            } else {
                $.pnotify({
                    title: 'User Import',
                    type: 'success',
                    text: 'Users Imported Successfully'
                });
            }
            Scope.Users = User.get();
            Scope.promptForNew();
            $('#importUsersModal').modal('toggle');
        }
    };
};

window.checkImportResults = function(iframe) {};