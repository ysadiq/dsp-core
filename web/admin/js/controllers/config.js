var ConfigCtrl = function ($scope, Config, Role, EmailTemplates, Service) {
    Scope = $scope;
    Scope.allVerbs = ["GET","POST", "PUT", "MERGE", "PATCH", "DELETE", "COPY"];
    // convert between null and empty string for menus
    Scope.fixValues = function (data, fromVal, toVal) {
        if (data.guest_role_id === fromVal) data.guest_role_id = toVal;
        if (data.open_reg_role_id === fromVal) data.open_reg_role_id = toVal;
        if (data.open_reg_email_service_id === fromVal) data.open_reg_email_service_id = toVal;
        if (data.open_reg_email_template_id === fromVal) data.open_reg_email_template_id = toVal;
        if (data.invite_email_service_id === fromVal) data.invite_email_service_id = toVal;
        if (data.invite_email_template_id === fromVal) data.invite_email_template_id = toVal;
        if (data.password_email_service_id === fromVal) data.password_email_service_id = toVal;
        if (data.password_email_template_id === fromVal) data.password_email_template_id = toVal;
    }
    Scope.Config = Config.get(function (response) {
        Scope.fixValues(response, null, '');
        Scope.keyData = Scope.Config.lookup_keys;
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
    // keys
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
    // roles
    Scope.Roles = Role.get(function () {
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
    Scope.Service = Service.get(function () {
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
    Scope.addHost = function () {
        Scope.Config.allowed_hosts.push(Scope.CORS.host);
        Scope.CORS.host = "";
    }
    Scope.save = function () {
        Scope.Config.lookup_keys = Scope.keyData;
        var data = angular.copy(Scope.Config);
        Scope.fixValues(data, '', null);
        Config.update(data, function () {
                $.pnotify({
                    title: 'Configuration',
                    type: 'success',
                    text: 'Updated Successfully'
                });
            },
            function (response) {
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
    Scope.upgrade = function () {

        window.top.location = CurrentServer + '/web/upgrade';
    }
    Scope.removeHost = function () {
        var index = this.$index;
        Scope.Config.allowed_hosts.splice(index, 1);
    }
    Scope.selectAll = function($event){

        if($event.target.checked){
            this.host.verbs = Scope.allVerbs;
        }else{
            this.host.verbs = [];
        }

    }
    Scope.toggleVerb = function () {

        var index = this.$parent.$index;
        if (Scope.Config.allowed_hosts[index].verbs.indexOf(this.verb) === -1) {
            Scope.Config.allowed_hosts[index].verbs.push(this.verb);
        } else {
            Scope.Config.allowed_hosts[index].verbs.splice(Scope.Config.allowed_hosts[index].verbs.indexOf(this.verb), 1);
        }
    };
    Scope.promptForNew = function(){
        var newhost = {};
        newhost.verbs = Scope.allVerbs;
        newhost.host = "";
        newhost.is_enabled = true;
        Scope.Config.allowed_hosts.unshift(newhost);
    }

    $("#key-value").keyup(function (event) {
        if (event.keyCode == 13) {

            $("#key-update").click();
        }
    });

    // EMAIL TEMPLATES
    // ------------------------------------

    // Store current user
    Scope.currentUser = window.CurrentUserID;

    // Store the id of an email template we have selected
    Scope.selectedEmailTemplateId = '';

    // Stores a copy email template that is currently being created or edited
    Scope.getSelectedEmailTemplate = {};

    // Stores email templates
    Scope.emailTemplates = EmailTemplates.get(function(){});

    // Facade: determines whether an email should be updated or created
    // and calls the appropriate function
    Scope.saveEmailTemplate = function(templateParams) {

        if ((templateParams.id === '') || (templateParams.id === undefined)) {

            Scope._saveNewEmailTemplate(templateParams);
        }
        else {
            Scope._updateEmailTemplate(templateParams);
        }
    };

    // Updates an existing email
    Scope._updateEmailTemplate = function(templateParams) {

        templateParams.last_modified_by_id = Scope.currentUser;


        EmailTemplates.update({id: templateParams.id}, templateParams, function () {
                $.pnotify({
                    title: 'Email Template',
                    type: 'success',
                    text: 'Updated Successfully'
                });
            },
            function (response) {
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

        Scope.$emit('updateTemplateListExisting');

    };

    // Creates a new email in the database
    Scope._saveNewEmailTemplate = function(templateParams) {

        templateParams.created_by_id = Scope.currentUser;
        templateParams.last_modified_by_id = Scope.currentUser;

        EmailTemplates.save({}, templateParams, function(data) {


                var emitArgs,
                    d = {},
                    key;

                for (key in data) {
                    if (data.hasOwnProperty(key)) {
                        d[key] = data[key];
                    }
                }

                emitArgs = d;

                Scope.$emit('updateTemplateListNew', emitArgs);

                $.pnotify({
                    title: 'Email Template',
                    type: 'success',
                    text: 'Created Successfully'
                });
            },
            function (response) {
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

    // Deletes and email from the database
    Scope.deleteEmailTemplate = function(templateId) {

        if(!confirm('Delete Email Template: \n\n' + Scope.getSelectedEmailTemplate.name)) {
            return;
        }

        EmailTemplates.delete({id: templateId}, function() {
                $.pnotify({
                    title: 'Email Templates',
                    type: 'success',
                    text: 'Template Deleted'
                });
            },
            function (response) {
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

        Scope.$emit('templateDeleted');

    };

    // Special Functions
    // Duplicates an email template for editing
    Scope.duplicateEmailTemplate = function() {

        var templateCopy;

        if ((Scope.getSelectedEmailTemplate.id === '') || (Scope.getSelectedEmailTemplate.id === undefined) || (Scope.getSelectedEmailTemplate === null)) {
            console.log('No email template Selected');

            $.pnotify({
                title: 'Email Templates',
                type: 'error',
                text: 'No template selected.'
            });
        }
        else {
            templateCopy = angular.copy(Scope.getSelectedEmailTemplate);

            templateCopy.id = '';
            templateCopy.name = 'Clone of ' + templateCopy.name;
            templateCopy.created_date = '';
            templateCopy.created_by_id = '';

            Scope.getSelectedEmailTemplate = angular.copy(templateCopy);
        }
    };

    // Events
    // Update existing Scope.emailTemplates.record entry
    Scope.$on('updateTemplateListExisting', function() {

        // Loop through emailTemplates.record to find our currently selected
        // email template by its id
        angular.forEach(Scope.emailTemplates.record, function(v, i) {
            if (v.id === Scope.selectedEmailTemplateId) {

                // replace that email template with the one we are currently working on
                Scope.emailTemplates.record.splice(i, 1, Scope.getSelectedEmailTemplate);
            }
        });
    });

    // Add a newly created email template to Scope.emailTemplates.record
    Scope.$on('updateTemplateListNew', function(event, emitArgs) {

        Scope.emailTemplates.record.push(emitArgs);
        Scope.newEmailTemplate();

    });

    // Delete email template from Scope.emailTemplates.record
    Scope.$on('templateDeleted', function() {

        var templateIndex = null;

        // Loop through Scope.emailTemplates.record
        angular.forEach(Scope.emailTemplates.record, function(v, i) {

            // If we find a template id that matches our currently selected
            // template id, store the index of that template object
            if (v.id === Scope.selectedEmailTemplateId) {
                templateIndex = i;
            }
        });


        // Check to make sure our template exists
        if ((templateIndex != '') && (templateIndex != undefined) && (templateIndex != null)) {

            // If it does splice it out
            Scope.emailTemplates.record.splice(templateIndex, 1);
        }

        // Reset Scope.getSelectedEmailTemplate and Scope.selectedEmailTemplateId
        Scope.newEmailTemplate();
    });

    // UI Functions
    // Reset Scope.selectedEmailTemplateId and Scope.getSelectedEmailTemplate
    Scope.newEmailTemplate = function() {
        // set selected email template to none and clear fields
        Scope.getSelectedEmailTemplate = {};
        Scope.selectedEmailTemplateId = '';
        Scope.showCreateEmailTab('template-info-pane');
    };

    // Create Email Nav
    // Store the nav tab we are currently on
    Scope.currentCreateEmailTab = 'template-info-pane';

    // Set the nav tab to the one we clicked
    Scope.showCreateEmailTab = function(id) {
        Scope.currentCreateEmailTab = id;
    };

    // Watch email template selection and assign proper template
    Scope.$watch('selectedEmailTemplateId', function() {

        // Store our found emailTemplate
        // Initialize with an empty record
        var result = [];

        // Loop through Scope.emailTemplates..record
        angular.forEach(Scope.emailTemplates.record, function(value, index) {

            // If we find our email template
            if (value.id === Scope.selectedEmailTemplateId) {

                // Store it
                result.push(value);
            }
        });

        // the result array should contain a single element
        if (result.length !== 1) {
            //console.log(result.length + 'templates found');
            return;
        }

        Scope.getSelectedEmailTemplate = angular.copy(result[0]);
    });
}
