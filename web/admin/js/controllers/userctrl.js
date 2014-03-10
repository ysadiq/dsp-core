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
    Scope.keyData = [];
    var keyInputTemplate = '<input class="ngCellText colt{{$index}}" ng-model="row.entity[col.field]" ng-change="enableKeySave()" />';
    var keyCheckTemplate = '<div style="text-align:center;"><input style="vertical-align: middle;" type="checkbox" ng-model="row.entity[col.field]" ng-change="enableKeySave()"/></div>';
    var keyButtonTemplate = '<div><button id="key_save_{{row.rowIndex}}" class="btn btn-small btn-inverse" disabled=true ng-click="saveKeyRow()"><li class="icon-save"></li></button><button class="btn btn-small btn-danger" ng-click="deleteKeyRow()"><li class="icon-remove"></li></button></div>';
    Scope.keyColumnDefs = [
        {field:'name', width:100},
        {field:'value', enableFocusedCellEdit:true, width:200, enableCellSelection:true, editableCellTemplate:keyInputTemplate },
        {field:'private', cellTemplate:keyCheckTemplate, width:75},
        {field:'Update', cellTemplate:keyButtonTemplate, width:80}
    ];
    Scope.keyOptions = {data:'keyData', width:500, columnDefs:'keyColumnDefs', canSelectRows:false, displaySelectionCheckbox:false};
    Scope.updateKeys = function () {
        $("#key-error-container").hide();
        if (!Scope.key) {
            return false;
        }
        if (!Scope.key.name || !Scope.key.value) {
            $("#key-error-container").html("Both name and value are required").show();
            return false;
        }
        if (checkForDuplicate(Scope.keyData, 'name', Scope.key.name)) {
            $("#key-error-container").html("Key already exists").show();
            $('#key-name, #key-value').val('');
            return false;
        }
        var newRecord = {};
        newRecord.name = Scope.key.name;
        newRecord.value = Scope.key.value;
        newRecord.private = !!Scope.key.private;
        Scope.keyData.push(newRecord);
        Scope.key = null;
        $('#key-name, #key-value').val('');
    }
    Scope.deleteKeyRow = function () {
        var name = this.row.entity.name;
        Scope.keyData = removeByAttr(Scope.keyData, 'name', name);

    }
    Scope.saveKeyRow = function () {
        var index = this.row.rowIndex;
        var newRecord = this.row.entity;
        var name = this.row.entity.name;
        updateByAttr(Scope.keyData, "name", name, newRecord);
        $("#key_save_" + index).prop('disabled', true);
    };
    Scope.enableKeySave = function () {
        $("#key_save_" + this.row.rowIndex).prop('disabled', false);
    };

    Scope.formChanged = function () {

        $('#save_' + this.user.id).removeClass('disabled');
    };

    Scope.save = function () {

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
        Scope.user.lookup_keys = Scope.keyData;
        User.update({id:id}, Scope.user, function() {
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
        newRec.lookup_keys = Scope.keyData;
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
        Scope.keyData = [];
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
        Scope.keyData = Scope.user.lookup_keys;
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

    $("#key-value").keyup(function (event) {
        if (event.keyCode == 13) {

            $("#key-update").click();
        }
    });
};

window.checkImportResults = function(iframe) {};