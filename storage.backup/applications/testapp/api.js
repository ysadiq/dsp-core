var createdRecords, recordCount;

function initApi() {

    createdRecords = [];
    recordCount = 0;
}

function login(params) {

    var result = {"error":null, "data":null};
	$.ajax({
        beforeSend: setHeaders,
        type: 'POST',
		dataType:'json',
        url: hostUrl + '/rest/user/session',
        data: JSON.stringify(params.data),
        cache:false,
        async: false,
		success:function (response) {
			result.data = response;
        },
        error:function (response) {
			result.error = getErrorString(response);
        }
    });
	return result;
}

function logout() {

    var result = {"error":null, "data":null};
	$.ajax({
        beforeSend: setHeaders,
        type: 'DELETE',
		dataType:'json',
        url: hostUrl + '/rest/user/session',
        cache:false,
        async: false,
		success:function (response) {
            result.data = response;
        },
        error:function (response) {
		   result.error = getErrorString(response);
        }
    });
    return result;
}

function getApps() {

    var result = {"error":null, "data":null};
    $.ajax({
	    beforeSend: setHeaders,
        dataType:'json',
        url: hostUrl + '/rest/system/app',
        cache:false,
        async: false,
		success:function (response) {
		    result.data = response;
        },
        error:function (response) {
		   result.error = getErrorString(response);
        }
    });
	return result;
}

function createParams(method, data) {

    queryParams = "fields=*";
    return {"data":data, "queryParams":queryParams, "method":method};
}

function createRecords(params) {

    var result = {"error":null, "rawError": null, "data":null};
    $.ajax({
        beforeSend: setHeaders,
        type: 'POST',
        dataType:  'json',
        url: hostUrl + "/rest/" + dbInfo.dbService + "/testobject?" + params.queryParams,
        data: JSON.stringify(params.data),
        cache: false,
        async: false,
        success: function (response) {
            result.data = response;
            switch (params.method) {
                case "data_record_array":
                    $.each(response.record, function(index, record) {
                        createdRecords.push(record);
                    });
                    break;
                case "data_record_object":
                    createdRecords.push(response);
                    break;
            }
        },
        error: function (response) {
            result.rawError = getErrorObject(response);
            result.error = getErrorString(response);
        }
    });
    return result;
}

function getParamsByIds(method, indices) {

    var data = null;
    var queryParams = "";
    var url = "/rest/" + dbInfo.dbService + "/testobject";
    var ids = getIdArray(indices);
    if (ids.length > 0) {
        switch (method) {
            case "data_record_array":
                data = {"record": []};
                $.each(ids, function(index, record) {
                    var newRec = {};
                    newRec[dbInfo.idField] = record;
                    data.record.push(newRec);
                });
                break;
            case "data_record_object":
                data = {};
                data[dbInfo.idField] = ids.join(",");
                break;
            case "data_idlist_array":
                data = {
                    "ids": ids
                };
                break;
            case "data_idlist_string":
                data = {
                    "ids": ids.join(",")
                };
                break;
            case "param_idlist_string":
                queryParams = "&ids=" + ids.join(",");
                break;
            case "url_id":
                url += "/" + ids.join(",");
                break;
            default:
                throw "Bad method=" + method;
        }
    }
    var reqType = (data === null ? "GET" :"POST");
    if (reqType !== "GET") {
        queryParams += "&method=GET";
    }
    return {"data":data, "queryParams":queryParams, "reqType":reqType, "url":url, "method":method};
}

function getParamsByFilter(method, filter) {

    var data = null;
    var queryParams = "";
    var url = "/rest/" + dbInfo.dbService + "/testobject";
    if (filter.cond.length > 0) {
        switch (method) {
            case "data_filter":
                data = {
                    "filter": ""
                };
                $.each(filter.cond, function(index, c) {
                    if (data.filter != "") {
                        data.filter += " " + filter.logic + " ";
                    }
                    data.filter += c.field + c.op + c.value;
                });
                break;
            case "data_filter_replace":
                data = {
                    "filter": "",
                    "params": {}
                };
                $.each(filter.cond, function(index, c) {
                    if (data.filter != "") {
                        data.filter += " " + filter.logic + " ";
                    }
                    data.filter += c.field + c.op + ":value" + index;
                    data.params[":value" + index] = c.value;
                });
                break;
            case "param_filter":
                $.each(filter.cond, function(index, c) {
                    if (queryParams != "") {
                        queryParams += " " + filter.logic + " ";
                    }
                    queryParams += c.field + c.op + c.value;
                });
                queryParams = "&filter=" + encodeURIComponent(queryParams);
                break;
            case "param_filter_replace":
                data = {
                    "params": {}
                };
                $.each(filter.cond, function(index, c) {
                    if (queryParams != "") {
                        queryParams +=  " " + filter.logic + " ";
                    }
                    queryParams += c.field + c.op + ":value" + index;
                    data.params[":value" + index] = c.value;
                });
                queryParams = "&filter=" + encodeURIComponent(queryParams);
                break;
            default:
                throw "Bad method=" + method;
        }
    }
    var reqType = (data === null ? "GET" :"POST");
    if (reqType !== "GET") {
        queryParams += "&method=GET";
    }
    return {"data":data, "queryParams":queryParams, "reqType":reqType, "url":url, "method":method};
}

function getRecords(params) {

    var result = {"error":null, "data":null};
    $.ajax({
        beforeSend: setHeaders,
        type: params.reqType,
        dataType: 'json',
        url: hostUrl + params.url + '?' + params.queryParams,
        data: params.data ? JSON.stringify(params.data) : null,
        cache: false,
        async: false,
        success: function (response) {
            result.data = response;
        },
        error: function (response) {
            result.error = getErrorString(response);
        }
    });
    return result;
}

function updateParamsByIds(method, newData, indices) {

    var queryParams = "";
    var url = "/rest/" + dbInfo.dbService + "/testobject";
    var ids = getIdArray(indices);
    switch (method) {
        case "data_record_batch":
            data = newData;
            break;
        case "data_record_array":
            data = {"record": []};
            $.each(ids, function(index, record) {
                var rec = cloneObject(newData);
                rec[dbInfo.idField] = record;
                data.record.push(rec);
            });
            break;
        case "data_record_object":
            data = newData;
            data[dbInfo.idField] = ids.join(",");
            break;
        case "data_idlist_array":
            data = {
                "ids": ids,
                "record": newData
            };
            break;
        case "data_idlist_string":
            data = {
                "ids": ids.join(","),
                "record": newData
            };
            break;
        case "param_idlist_string":
            queryParams = "&ids=" + ids.join(",");
            data = {
                "record": newData
            };
            break;
        case "url_id":
            url += "/" + ids.join(",");
            data = {
                "record": newData
            };
            break;
        default:
            throw "Bad method=" + method;
    }
    return {"data":data, "queryParams":queryParams, "url":url, "method":method};
}

function updateParamsByFilter(method, newData, filter) {

    var queryParams = "";
    var url = "/rest/" + dbInfo.dbService + "/testobject";
    switch (method) {
        case "data_filter":
            data = {
                "filter": "",
                "record": newData
            };
            $.each(filter.cond, function(index, c) {
                if (data.filter != "") {
                    data.filter += " " + filter.logic + " ";
                }
                data.filter += c.field + c.op + c.value;
            });
            break;
        case "data_filter_replace":
            data = {
                "filter": "",
                "params": {},
                "record": newData
            };
            $.each(filter.cond, function(index, c) {
                if (data.filter != "") {
                    data.filter += " " + filter.logic + " ";
                }
                data.filter += c.field + c.op + ":value" + index;
                data.params[":value" + index] = c.value;
            });
            break;
        case "param_filter":
            $.each(filter.cond, function(index, c) {
                if (queryParams != "") {
                    queryParams += " " + filter.logic + " ";
                }
                queryParams += c.field + c.op + c.value;
            });
            queryParams = "&filter=" + encodeURIComponent(queryParams);
            data = {
                "record": newData
            };
            break;
        case "param_filter_replace":
            data = {
                "params": {},
                "record": newData
            };
            $.each(filter.cond, function(index, c) {
                if (queryParams != "") {
                    queryParams += " " + filter.logic + " ";
                }
                queryParams += c.field + c.op + ":value" + index;
                data.params[":value" + index] = c.value;
            });
            queryParams = "&filter=" + encodeURIComponent(queryParams);
            break;
        default:
            throw "Bad method=" + method;
    }
    return {"data":data, "queryParams":queryParams, "url":url, "method":method};
}

function updateRecords(params) {

    var result = {"error":null, "data":null};
    $.ajax({
        beforeSend: setHeaders,
        type: params.put ? "PUT" : "PATCH",
        dataType: 'json',
        url: hostUrl + params.url + '?' + params.queryParams,
        data: JSON.stringify(params.data),
        cache: false,
        async: false,
        success: function (response) {
            result.data = response;
        },
        error: function (response) {
            result.error = getErrorString(response);
        }
    });
    return result;
}

function deleteParamsByIds(method, indices) {

    var data = null;
    var queryParams = "";
    var url = "/rest/" + dbInfo.dbService + "/testobject";
    var ids = getIdArray(indices);
    switch (method) {
        case "data_record_array":
            data = {"record": []};
            $.each(ids, function(index, record) {
                var newRec = {};
                newRec[dbInfo.idField] = record;
                data.record.push(newRec);
            });
            break;
        case "data_record_object":
            data = {};
            data[dbInfo.idField] = ids.join(",");
            break;
        case "data_idlist_array":
            data = {"ids": ids};
            break;
        case "data_idlist_string":
            data = {"ids": ids.join(",")};
            break;
        case "param_idlist_string":
            queryParams = "&ids=" + ids.join(",");
            break;
        case "url_id":
            url += "/" + ids.join(",");
            break;
        default:
            throw "Bad method=" + method;
    }
    return {"data":data, "queryParams":queryParams, "url":url, "method":method};
}

function deleteParamsByFilter(method, filter) {

    var data = null;
    var queryParams = "";
    var url = "/rest/" + dbInfo.dbService + "/testobject";
    switch (method) {
        case "data_filter":
            data = {"filter": ""};
            $.each(filter.cond, function(index, c) {
                if (data.filter != "") {
                    data.filter += " " + filter.logic + " ";
                }
                data.filter += c.field + c.op + c.value;
            });
            break;
        case "data_filter_replace":
            data = {
                "filter": "",
                "params": {}
            };
            $.each(filter.cond, function(index, c) {
                if (data.filter != "") {
                    data.filter += " " + filter.logic + " ";
                }
                data.filter += c.field + c.op + ":value" + index;
                data.params[":value" + index] = c.value;
            });
            break;
        case "param_filter":
            $.each(filter.cond, function(index, c) {
                if (queryParams != "") {
                    queryParams += " " + filter.logic + " ";
                }
                queryParams += c.field + c.op + c.value;
            });
            queryParams = "&filter=" + encodeURIComponent(queryParams);
            break;
        case "param_filter_replace":
            data = {
                "params": {}
            };
            $.each(filter.cond, function(index, c) {
                if (queryParams != "") {
                    queryParams += " " + filter.logic + " ";
                }
                queryParams += c.field + c.op + ":value" + index;
                data.params[":value" + index] = c.value;
            });
            queryParams = "&filter=" + encodeURIComponent(queryParams);
            break;
        default:
            throw "Bad method=" + method;
    }
    return {"data":data, "queryParams":queryParams, "url":url, "method":method};
}

function deleteRecords(params) {

    var result = {"error":null, "data":null};
    $.ajax({
        beforeSend: setHeaders,
        type: 'DELETE',
        dataType: 'json',
        url: hostUrl + params.url + '?' + params.queryParams,
        data: JSON.stringify(params.data),
        cache: false,
        async: false,
        success: function (response) {
            result.data = response;
        },
        error: function (response) {
            result.error = getErrorString(response);
        }
    });
    return result;
}

function createTable() {

    var result = {"error":null, "data":null};
    $.ajax({
        beforeSend: setHeaders,
        type: 'POST',
        dataType:'json',
        url: hostUrl + '/rest/' + dbInfo.schemaService,
        data: getSchema(),
        cache:false,
        async: false,
        success:function (response) {
            result.data = response;
        },
        error:function (response) {
            result.error = getErrorString(response);
        }
    });
    return result;
}

function tableExists(name) {

    var result = {"error":null, "data":null};
	$.ajax({
	    beforeSend: setHeaders,
        dataType:'json',
        url: hostUrl + '/rest/' + dbInfo.dbService + "?names=" + name,
        cache:false,
        async: false,
		success:function (response) {
			result.data = response;
        },
        error:function (response) {
		   result.error = getErrorString(response);
        }
    });
	return result.data !== null;
}

function deleteTable() {

    var result = {"error":null, "data":null};
    $.ajax({
        beforeSend: setHeaders,
        type: 'DELETE',
        dataType:'json',
        url: serviceData.record[0].type === 'NoSQL DB' ?
            hostUrl + '/rest/' + dbInfo.schemaService + '?names=testobject' :
            hostUrl + '/rest/' + dbInfo.schemaService + '/testobject',
        data: "",
        cache:false,
        async: false,
        success:function (response) {
            result.data = response;
            createdRecords = [];
            recordCount = 0;
        },
        error:function (response) {
            result.error = getErrorString(response);
        }
    });
    return result;
}

function dropLocalTable() {

    $.ajax({
        beforeSend: setHeaders,
        type: 'DELETE',
        dataType:'json',
        url: hostUrl + '/rest/db/testobject?force=true',
        data: "",
        cache:false,
        async: false,
        success:function (response) {
            result.data = response;
        },
        error:function (response) {
            result.error = getErrorString(response);
        }
    });

    return result;
}

// drop table for configured service

function dropTable() {

    $.ajax({
        beforeSend: setHeaders,
        type: 'DELETE',
        dataType:'json',
        url: hostUrl + '/rest/' + dbInfo.dbService + '/testobject?force=true',
        data: "",
        cache:false,
        async: false,
        success:function (response) {
            result.data = response;
            createdRecords = [];
            recordCount = 0;
        },
        error:function (response) {
            result.error = getErrorString(response);
        }
    });

    return result;
}

function getSchema() {

    return JSON.stringify(
        {
            "table": [
                {
                    "name": "testobject",
                    "label": "TestObject",
                    "plural": "TestObjects",
                    "field": [
                        {
                            "name": "id",
                            "label": "Id",
                            "type": "id"
                        },
                        {
                            "name": "name",
                            "label": "Name",
                            "type": "string",
                            "size": 80,
                            "allow_null": false
                        },
                        {
                            "name": "bool",
                            "label": "bool",
                            "type": "boolean"
                        },
                        {
                            "name": "updated",
                            "label": "updated",
                            "type": "boolean"
                        },
                        {
                            "name":       "pick",
                            "label":      "pick",
                            "type":       "string",
                            "validation": "picklist",
                            "values":     [
                                "New", "In Process", "Closed"
                            ]
                        },
                        {
                            "name":   "str",
                            "label":  "str",
                            "type":   "string",
                            "length": 40
                        },
                        {
                            "name":     "curr",
                            "label":    "curr",
                            "type":     "money",
                            "decimals": 0
                        },
                        {
                            "name": "CreatedById",
                            "label": "Created By ID",
                            "type": "user_id_on_create",
                            "api_read_only": true
                        },
                        {
                            "name": "CreatedDate",
                            "label": "Created Date",
                            "type": "timestamp_on_create",
                            "api_read_only": true
                        },
                        {
                            "name": "LastModifiedById",
                            "label": "Last Modified By ID",
                            "type": "user_id_on_update",
                            "api_read_only": true
                        },
                        {
                            "name": "LastModifiedDate",
                            "label": "Last Modified Date",
                            "type": "timestamp_on_update",
                            "api_read_only": true
                        },
                        {
                            "name": "OwnerId",
                            "label": "OwnerID",
                            "type": "reference",
                            "ref_table": "df_sys_user",
                            "ref_field": "Id",
                            "allow_null": false
                        }
                    ]
                }
            ]
        });
}

function createUsers() {

    var data = {"record":[]};
    for (i = 0; i < 2; i++) {
        data.record.push(
            {
                "email": "testuser" + (i + 1) + "@dreamfactory.com",
                "display_name": "Test User " + (i + 1),
                "first_name": "Test",
                "last_name": "User",
                "confirmed": true,
                "is_active": true,
                "is_sys_admin": false,
                "password": "slimjim"
            }
        );
    }
    var result = {"error":null, "data":null};
    $.ajax({
        beforeSend: setHeaders,
        type: 'POST',
        dataType:'json',
        url: hostUrl + '/rest/system/user?fields=email',
        data:JSON.stringify(data),
        cache:false,
        async: false,
        success:function (response) {
            result.data = response;
        },
        error:function (response) {
            result.error = getErrorString(response);
        }
    });
    return result;
}

function getUsers() {

    var result = {"error":null, "data":null};
	$.ajax({
	    beforeSend: setHeaders,
        dataType:'json',
        url: hostUrl + '/rest/system/user?filter=email%20like%20%27%25testuser%25%27',
        cache:false,
        async: false,
		success:function (response) {
			result.data = response;
        },
        error:function (response) {
		   result.error = getErrorString(response);
        }
    });
	return result;
}

function deleteUsers() {

    var result = {"error":null, "data":null};
	$.ajax({
	    beforeSend: setHeaders,
        type: 'DELETE',
		dataType:'json',
        url: hostUrl + '/rest/system/user',
        data:JSON.stringify(userData),
        cache:false,
        async: false,
		success:function (response) {
            result.data = response;
        },
        error:function (response) {
		   result.error = getErrorString(response);
        }
    });
	return result;
}

function createRoles() {

    var data = {"record":[]};

    data.record.push(
        {
            "name": "testrole0",
            "is_active": true,
            "users": {"record": userData.record[0]},
            "apps": appData.record,
            "role_service_accesses": [
                {
                    "access": "Full Access",
                    "component": "testobject",
                    "service_id": serviceData.record[0].id,
                    "filters": [],
                    "filter_op": "AND"
                }
            ],
            "role_system_accesses": [],
            "lookup_keys":[]
        }
    );
    data.record.push(
        {
            "name": "testrole1",
            "is_active": true,
            "users": {"record": userData.record[1]},
            "apps": appData.record,
            "role_service_accesses": [
                {
                    "access": "Full Access",
                    "component": "testobject",
                    "service_id": serviceData.record[0].id,
                    "filters": [],
                    "filter_op": "AND"
                }
            ],
            "role_system_accesses": [],
            "lookup_keys":[]
        }
    );

    var result = {"error":null, "data":null};
    $.ajax({
        beforeSend: setHeaders,
        type: 'POST',
        dataType:'json',
        url: hostUrl + '/rest/system/role?fields=*&related=users,apps,role_service_accesses,role_system_accesses',
        data:JSON.stringify(data),
        cache:false,
        async: false,
        success:function (response) {
            result.data = response;
        },
        error:function (response) {
            result.error = getErrorString(response);
        }
    });
    return result;
}

function getRoles() {

    var result = {"error":null, "data":null};
	$.ajax({
	    beforeSend: setHeaders,
        dataType:'json',
        url: hostUrl + '/rest/system/role?filter=name%20like%20%27%25testrole%25%27&fields=*&related=users,apps,role_service_accesses,role_system_accesses',
        cache:false,
        async: false,
		success:function (response) {
			result.data = response;
        },
        error:function (response) {
		   result.error = getErrorString(response);
        }
    });
	return result;
}

function updateRoles(mode) {

    roleData.record[0].role_service_accesses[0].filters = [];
    roleData.record[1].role_service_accesses[0].filters = [];
    if (mode === "value") {
        roleData.record[0].role_service_accesses[0].filters.push(
            {
                "name": "curr",
                "operator": "<",
                "value": 2000
            }
        );
        roleData.record[1].role_service_accesses[0].filters.push(
            {
                "name": "curr",
                "operator": ">=",
                "value": 2000
            },
            {
                "name": "curr",
                "operator": "<",
                "value": 3000
            }
        );
    }
    if (mode === "ownerid") {
        roleData.record[0].role_service_accesses[0].filters.push(
            {
                "name": "OwnerId",
                "operator": "=",
                "value": "user.id"
            }
        );
        roleData.record[1].role_service_accesses[0].filters.push(
            {
                "name": "OwnerId",
                "operator": "=",
                "value": "user.id"
            }
        );
    }

    var result = {"error":null, "data":null};
    $.ajax({
        beforeSend: setHeaders,
        type: 'PATCH',
        dataType:'json',
        url: hostUrl + '/rest/system/role?fields=*&related=users,apps,role_service_accesses,role_system_accesses',
        data:JSON.stringify(roleData),
        cache:false,
        async: false,
        success:function (response) {
            result.data = response;
        },
        error:function (response) {
            result.error = getErrorString(response);
        }
    });
    return result;
}

function deleteRoles() {

    var result = {"error":null, "data":null};
	$.ajax({
	    beforeSend: setHeaders,
        type: 'DELETE',
		dataType:'json',
        url: hostUrl + '/rest/system/role',
        data:JSON.stringify(roleData),
        cache:false,
        async: false,
		success:function (response) {
            result.data = response;
        },
        error:function (response) {
		   result.error = getErrorString(response);
        }
    });
	return result;
}

function getServices(num) {

    var result = {"error":null, "data":null};
    $.ajax({
        beforeSend: setHeaders,
        dataType:'json',
        url: hostUrl + '/rest/system/service?filter=api_name%3D%27' + dbInfo.dbService + '%27',
        cache:false,
        async: false,
        success:function (response) {
            result.data = response;
        },
        error:function (response) {
            result.error = getErrorString(response);
        }
    });
    return result;
}

function setHeaders(request)
{
    if (sessionData) {
        request.setRequestHeader("X-DreamFactory-Session-Token", sessionData.session_id);
    }
    request.setRequestHeader("X-DreamFactory-Application-Name", "testapp");
}