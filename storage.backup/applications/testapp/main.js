
$(document).ready(function() {

    runApp();
});

function runApp() {

    initTest();
    initApi();
    crudTest();
    ownerIdTest();
    valueTest();
    rollbackTest();
    console.log("All tests passed!");
}