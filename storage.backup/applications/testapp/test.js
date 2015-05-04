var testCounter;
var sessionData, userData, roleData, serviceData, appData;

function initTest() {

    var result;

    testCounter = 0;
    sessionData = null;
    userData = null;
    roleData = null;
    serviceData = null;
    appData = null;

    adminLogin();

    dropLocalTable();

    // get apps
    result = getApps();
    checkResult(result.error === null, "Get all apps", result);
    appData = result.data;

    // get service
    result = getServices();
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 1, "Get db service", result);
    serviceData = result.data;

    // delete table
    if (tableExists("testobject")) {
        result = deleteTable();
        checkResult(result.error === null, "Delete db table", result);
    }
    result = tableExists("testobject");
    checkResult(result === false, "Verify db table deleted", "Table not deleted");

    // delete roles
    result = getRoles();
    checkResult(result.error === null, "Get roles", result);
    roleData = result.data;
    if (result.data && result.data.record && result.data.record.length > 0) {
        result = deleteRoles();
        checkResult(result.error === null, "Delete roles", result);
    }
    result = getRoles();
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 0, "Verify roles deleted", result);
    roleData = result.data;

    // delete users
    result = getUsers();
    checkResult(result.error === null, "Get users", result);
    userData = result.data;
    if (result.data && result.data.record && result.data.record.length > 0) {
        result = deleteUsers();
        checkResult(result.error === null, "Delete users", result);
    }
    result = getUsers();
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 0, "Verify users deleted", result);
    userData = result.data;

	// create table
    result = createTable();
    checkResult(result.error === null, "Create table", result);
    result = tableExists("testobject");
    checkResult(result === true, "Verify db table created", "Table not created");

	// create users
    result = createUsers();
    checkResult(result.error === null, "Create users", result);
    result = getUsers();
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Verify users created", result);
    userData = result.data;

    // create roles
    result = createRoles();
    checkResult(result.error === null, "Create roles", result);
    result = getRoles();
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Verify roles created", result);
    roleData = result.data;

    userLogout();
}

function createOne(offset, amt) {

    recordCount++;
    var record = {
        "name": "test record #" + recordCount + ", userid=" + sessionData.id,
        "OwnerId": sessionData.id
    };
    record.curr = amt + offset;
    if (dbInfo.generateIds) {
        var id = recordCount;
        record[dbInfo.idField] = formatId(id);
    }
    return record;
}

function createBatch(num, amt) {

    if (!amt) {
        amt = 3000;
    }
    data = {"record":[]};
    for (i = 0; i < num; i++) {
        data.record.push(createOne(i, amt));
    }
    return data;
}

function crudTest() {

    console.log("Starting crudTest()");
    adminLogin();
    simpleCreateTest();
    simpleGetTest();
    simpleUpdateTest();
    if (serviceData.record[0].type === "NoSQL DB") {
        simplePutTest();
    }
    simpleDeleteTest();
    userLogout();
}

// create records as admin using various methods, role filters do not apply

function simpleCreateTest() {

    var result, params;

    deleteAllRecords();
    checkRecordCount(0);

    params = createParams("data_record_array", createBatch(10));
    result = createRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 10, "Create 10 records (data_record_array)", result);
    checkRecordCount(10);

    params = createParams("data_record_array", createBatch(1));
    result = createRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 1, "Create 1 record (data_record_array)", result);
    checkRecordCount(11);

    params = createParams("data_record_object", createOne(0, 3000));
    result = createRecords(params);
    checkResult(result.error === null && result.data, "Create 1 record (data_record_object)", result);
    checkRecordCount(12);

    var data = createOne(0, 3000);
    delete data.OwnerId;
    params = createParams("data_record_object", data);
    result = createRecords(params);
    checkResult(result.error, "Try to create 1 record with no OwnerId (data_record_object)", result);
    checkRecordCount(12);

    var data = createOne(0, 3000);
    data.OwnerId = userData.record[0].id;
    params = createParams("data_record_object", data);
    result = createRecords(params);
    checkResult(result.error === null && result.data, "Create 1 record with another user's OwnerId (data_record_object)", result);
    checkRecordCount(13);
}

// get records as admin using various methods, role filters do not apply

function simpleGetTest() {

    deleteAllRecords();
    checkRecordCount(0);

    // create records
    params = createParams("data_record_array", createBatch(20));
    result = createRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 20, "Create 20 records (data_record_array)", result);
    checkRecordCount(20);

    // get records using various methods
    params = getParamsByIds("data_record_array", [0,1]);
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Get 2 records (data_record_array)", result);

    params = getParamsByIds("data_record_object", [2]);
    result = getRecords(params);
    checkResult(result.error === null && result.data, "Get 1 record (data_record_object)", result);

    params = getParamsByIds("data_idlist_array", [3,4]);
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Get 2 records (data_idlist_array)", result);

    params = getParamsByIds("data_idlist_string", [5,6]);
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Get 2 records (data_idlist_string)", result);

    params = getParamsByIds("param_idlist_string", [7,8]);
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Get 2 records (param_idlist_string)", result);

    params = getParamsByIds("url_id", [9]);
    result = getRecords(params);
    checkResult(result.error === null && result.data, "Get 1 record (url_id)", result);

    // AND filter
    params = getParamsByFilter("data_filter", {"cond":[{"field": "curr","op": ">=","value": 3000},{"field": "curr","op": "<=","value": 3004}],"logic":"and"});
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 5, "Get records with AND filter", result);
    $.each(result.data.record, function(index, record) {
        checkResult(record.curr >= 3000 && record.curr <= 3004, "Verify 3000 <= " + record.curr + " <= 3004", result);
    });

    if (serviceData.record[0].storage_type !== "aws dynamodb") {
        params = getParamsByFilter("data_filter", idFilter([10,11]));
        result = getRecords(params);
        checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Get 2 records (data_filter)", result);

        params = getParamsByFilter("param_filter", idFilter([12,13]));
        result = getRecords(params);
        checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Get 2 records (param_filter)", result);

        params = getParamsByFilter("data_filter_replace", idFilter([14,15]));
        result = getRecords(params);
        checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Get 2 records (data_filter_replace)", result);

        params = getParamsByFilter("param_filter_replace", idFilter([16,17,18,19]));
        result = getRecords(params);
        checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 4, "Get 4 records (param_filter_replace)", result);
    }
}

// update a single field (patch)

function updateOne() {

    var record = {
        "updated": true
    };
    return record;
}

// update records as admin using various methods, role filters do not apply

function simpleUpdateTest() {

    deleteAllRecords();
    checkRecordCount(0);

    // create records
    params = createParams("data_record_array", createBatch(20));
    result = createRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 20, "Create 20 records (data_record_array)", result);
    checkRecordCount(20);

    // update records using various methods
    params = updateParamsByIds("data_record_array", updateOne(), [0,1]);
    result = updateRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "PATCH 2 records (data_record_array)", result);

    params = updateParamsByIds("data_record_object", updateOne(), [2]);
    result = updateRecords(params);
    checkResult(result.error === null && result.data, "PATCH 1 record (data_record_object)", result);

    params = updateParamsByIds("data_idlist_array", updateOne(), [3,4]);
    result = updateRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "PATCH 2 records (data_idlist_array)", result);

    params = updateParamsByIds("data_idlist_string", updateOne(), [5,6]);
    result = updateRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "PATCH 2 records (data_idlist_string)", result);

    params = updateParamsByIds("param_idlist_string", updateOne(), [7,8]);
    result = updateRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "PATCH 2 records (param_idlist_string)", result);

    params = updateParamsByIds("url_id", updateOne(), [9]);
    result = updateRecords(params);
    checkResult(result.error === null && result.data, "PATCH 1 record (url_id)", result);

    if (serviceData.record[0].storage_type !== "aws dynamodb") {
        params = updateParamsByFilter("data_filter", updateOne(), idFilter([10,11]));
        result = updateRecords(params);
        checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "PATCH 2 records (data_filter)", result);

        params = updateParamsByFilter("param_filter", updateOne(), idFilter([12,13]));
        result = updateRecords(params);
        checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "PATCH 2 records (param_filter)", result);

        params = updateParamsByFilter("data_filter_replace", updateOne(), idFilter([14,15]));
        result = updateRecords(params);
        checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "PATCH 2 records (data_filter_replace)", result);

        params = updateParamsByFilter("param_filter_replace", updateOne(), idFilter([16,17,18,19]));
        result = updateRecords(params);
        checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 4, "PATCH 4 records (param_filter_replace)", result);
    }
}

function batchByIds(data, ids) {

    var result = {"record": []};
    $.each(ids, function(index, id) {
        var match = oneById(data, id);
        if (match) {
            result.record.push(match);
        }
    });
    console.log(result);
    return result;
}

function oneById(data, id) {

    var result = null;
    data = cloneObject(data);
    $.each(data.record, function(index, record) {
        if (record[dbInfo.idField] === id) {
            record.updated = true;
            result = record;
        }
    });
    return result;
}

// update all fields (put)

function simplePutTest() {

    var saveData;

    deleteAllRecords();
    checkRecordCount(0);

    // create records
    params = createParams("data_record_array", createBatch(20));
    params.verb = verb;
    result = createRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 20, "Create 20 records (data_record_array)", result);
    checkRecordCount(20);
    saveData = result.data;

    checkResult(saveData.record[0].updated === undefined && saveData.record[1].updated === undefined, "Verify 'updated' field not present", result);

    params = updateParamsByIds("data_record_batch", batchByIds(saveData, [0,1]), [0,1]);
    params.put = true;
    params.queryParams += encodeURIComponent("&order=" + dbInfo.idField + " asc");
    result = updateRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "PUT 2 records (data_record_batch)", result);

    params = getParamsByIds("data_record_array", [0,1]);
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Get updated records", result);
    checkResult(result.data.record[0].updated === true && result.data.record[1].updated === true, "Verify 'updated' field", result);
    checkResult(result.data.record[0].name === saveData.record[0].name && result.data.record[1].name === saveData.record[1].name, "Verify 'name' field", result);
    checkResult(result.data.record[0].curr === saveData.record[0].curr && result.data.record[1].curr === saveData.record[1].curr, "Verify 'curr' field", result);
}

// delete records as admin using various methods, role filters do not apply

function simpleDeleteTest() {

    deleteAllRecords();
    checkRecordCount(0);

    // create records
    params = createParams("data_record_array", createBatch(20));
    result = createRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 20, "Create 20 records (data_record_array)", result);
    checkRecordCount(20);

    // delete records using various methods
    params = deleteParamsByIds("data_record_array", [0,1]);
    result = deleteRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Delete 2 records", result);
    checkRecordCount(18);

    params = deleteParamsByIds("data_record_object", [2]);
    result = deleteRecords(params);
    checkResult(result.error === null && result.data, "Delete 1 record", result);
    checkRecordCount(17);

    params = deleteParamsByIds("data_idlist_array", [3,4]);
    result = deleteRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Delete 2 records", result);
    checkRecordCount(15);

    params = deleteParamsByIds("data_idlist_string", [5,6]);
    result = deleteRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Delete 2 records", result);
    checkRecordCount(13);

    params = deleteParamsByIds("param_idlist_string", [7,8]);
    result = deleteRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Delete 2 records", result);
    checkRecordCount(11);

    params = deleteParamsByIds("url_id", [9]);
    result = deleteRecords(params);
    checkResult(result.error === null && result.data , "Delete 1 record", result);
    checkRecordCount(10);

    if (serviceData.record[0].storage_type !== "aws dynamodb") {
        params = deleteParamsByFilter("data_filter", idFilter([10,11]));
        result = deleteRecords(params);
        checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Delete 2 records (data_filter)", result);
        checkRecordCount(8);

        params = deleteParamsByFilter("param_filter", idFilter([12,13]));
        result = deleteRecords(params);
        checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Delete 2 records (param_filter)", result);
        checkRecordCount(6);

        params = deleteParamsByFilter("data_filter_replace", idFilter([14,15]));
        result = deleteRecords(params);
        checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 2, "Delete 2 records (data_filter_replace)", result);
        checkRecordCount(4);

        params = deleteParamsByFilter("param_filter_replace", idFilter([16,17,18,19]));
        result = deleteRecords(params);
        checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 4, "Delete 4 records (param_filter_replace)", result);
        checkRecordCount(0);
    }
}

function ownerIdTest() {

    console.log("Starting ownerIdTest()");

    adminLogin();
    deleteAllRecords();
    checkRecordCount(0);
    result = updateRoles('ownerid');
    checkResult(result.error === null, "Set roles to OwnerId mode", result);

    params = createParams("data_record_array", createBatch(10));
    result = createRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 10, "Create 10 records as admin", result);
    checkRecordCount(10);

    userLogout();
    user1Login();

    checkRecordCount(0);
    params = createParams("data_record_array", createBatch(5));
    result = createRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 5, "Create 5 records as user 1", result);
    checkRecordCount(5);

    params = updateParamsByIds("data_record_array", updateOne(), [10,11,12,13,14]);
    result = updateRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 5, "Update 5 records as user 1", result);

    userLogout();
    user2Login();

    checkRecordCount(0);
    params = createParams("data_record_array", createBatch(5));
    result = createRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 5, "Create 5 records as user 2", result);
    checkRecordCount(5);

    params = updateParamsByIds("data_record_array", updateOne(), [15,16,17,18,19]);
    result = updateRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 5, "Update 5 records as user 2", result);

    userLogout();
    user1Login();

    params = deleteParamsByIds("data_record_array", [0,1,2,3,4,5,6,7,8,9]);
    result = deleteRecords(params);
    checkResult(result.error !== null, "Try to delete admin records as user 1", result);

    params = deleteParamsByIds("data_record_array", [15,16,17,18,19]);
    result = deleteRecords(params);
    checkResult(result.error !== null, "Try to delete user 2 records as user 1", result);

    // delete records as user 1
    checkRecordCount(5);
    params = deleteParamsByIds("data_record_array", [10,11,12,13,14]);
    result = deleteRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 5, "Delete 5 records as user 1", result);
    checkRecordCount(0);

    userLogout();
    user2Login();

    // delete records as user 2
    checkRecordCount(5);
    params = deleteParamsByIds("data_record_array", [15,16,17,18,19]);
    result = deleteRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 5, "Delete 5 records as user 2", result);
    checkRecordCount(0);

    userLogout();
    adminLogin();

    checkRecordCount(10);
    params = deleteParamsByIds("data_record_array", [0,1,2,3,4,5,6,7,8,9]);
    result = deleteRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 10, "Delete 10 records as admin", result);
    checkRecordCount(0);

    userLogout();
}

function valueTest() {

    console.log("Starting valueTest()");

    adminLogin();
    deleteAllRecords();
    checkRecordCount(0);
    result = updateRoles('value');
    checkResult(result.error === null, "Set roles to value mode", result);

    params = createParams("data_record_array", createBatch(3, 1000));
    result = createRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 3, "Create 3 records as admin for user 1", result);
    checkRecordCount(3);

    params = createParams("data_record_array", createBatch(4, 2000));
    result = createRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 4, "Create 4 records as admin for user 2", result);
    checkRecordCount(7);

    params = createParams("data_record_array", createBatch(3, 3000));
    result = createRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 3, "Create 3 records as admin for admin", result);
    checkRecordCount(10);

    userLogout();
    user1Login();

    params = getParamsByIds("data_record_array", []);
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 3, "Verify 3 records for user 1", result);
    $.each(result.data.record, function(index, record) {
        checkResult(record.curr < 2000, "Verify " + record.curr, result);
    });

    params = createParams("data_record_object", createOne(0, 3000));
    result = createRecords(params);
    checkResult(result.error, "Try to create admin record as user 1", result);

    params = updateParamsByIds("data_record_object", updateOne(), [9]);
    result = updateRecords(params);
    checkResult(result.error, "Try to update admin record as user 1", result);

    params = deleteParamsByIds("data_record_object", [9]);
    result = deleteRecords(params);
    checkResult(result.error, "Try to delete admin record as user 1", result);

    params = createParams("data_record_object", createOne(5));
    result = createRecords(params);
    checkResult(result.error, "Try to create user 2 record as user 1", result);

    params = updateParamsByIds("data_record_object", updateOne(), [5]);
    result = updateRecords(params);
    checkResult(result.error, "Try to update user 2 record as user 1", result);

    params = deleteParamsByIds("data_record_object", [5]);
    result = deleteRecords(params);
    checkResult(result.error, "Try to delete user 2 record as user 1", result);

    userLogout();
    user2Login();

    params = getParamsByIds("data_record_array", []);
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === 4, "Verify 4 records for user 2", result);
    $.each(result.data.record, function(index, record) {
        checkResult(record.curr >= 2000 && record.curr < 3000, "Verify " + record.curr, result);
    });

    userLogout();
}

function rollbackTest() {

    console.log("Starting rollbackTest()");

    adminLogin();
    deleteAllRecords();
    checkRecordCount(0);
    result = updateRoles('value');
    checkResult(result.error === null, "Set roles to value mode", result);

    userLogout();
    user1Login();

    // create 10 records as user 1, index 4 and 7 are bad, all should be rolled back
    params = createParams("data_record_array", createBatch(10, 1000));
    params.data.record[4].curr = 3000;
    params.data.record[7].curr = 3000;
    params.queryParams += "&rollback=true";
    result = createRecords(params);
    checkResult(result.rawError && result.rawError.error && result.rawError.error[0].context && result.rawError.error[0].context.error && result.rawError.error[0].context.error.join(",") === "4", "Create 10 records with rollback, 2 bad records", result);
    checkRecordCount(0);

    // create 10 records as user 1, only index 4 and 7 should fail
    params = createParams("data_record_array", createBatch(10, 1000));
    params.data.record[4].curr = 3000;
    params.data.record[7].curr = 3000;
    params.queryParams += "&continue=true";
    result = createRecords(params);
    checkResult(result.rawError && result.rawError.error && result.rawError.error[0].context && result.rawError.error[0].context.error && result.rawError.error[0].context.error.join(",") === "4,7", "Create 10 records with continue, 2 bad records", result);
    checkRecordCount(8);

    userLogout();
}

function adminLogin() {

    params = {"data": {"email":"tester@dreamfactory.com", "password":"slimjim"}};
    result = login(params);
    checkResult(result.error === null, "Admin login", result);
    sessionData = result.data;
}

function user1Login() {

    params = {"data": {"email":"testuser1@dreamfactory.com", "password":"slimjim"}};
    result = login(params);
    checkResult(result.error === null, "User 1 login", result);
    sessionData = result.data;
}

function user2Login() {

    params = {"data": {"email":"testuser2@dreamfactory.com", "password":"slimjim"}};
    result = login(params);
    checkResult(result.error === null, "User 2 login", result);
    sessionData = result.data;
}

function userLogout() {

    result = logout();
    checkResult(result.error === null, "Logout", result);
    sessionData = null;
}

function checkRecordCount(num) {

    params = getParamsByIds("data_record_array", []);
    result = getRecords(params);
    checkResult(result.error === null && result.data && result.data.record && result.data.record.length === num, "Check for " + num + " records", result);
}

function deleteAllRecords() {

    result = dropTable();
    checkResult(result.error === null && result.data && result.data.success === true, "Delete all records", result);
}