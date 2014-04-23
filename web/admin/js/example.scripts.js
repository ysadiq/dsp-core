//Here are a few examples to get you started.

//*******Working with System Events********

//	users.list.js
//	The file contains a script to be run when the event 'users.list' is triggered by a
//  GET on /rest/system/user

var ENABLE_ADD_PROPERTY = true;

_.each(event.data.record, function (record) {
    record.banned_for_life = (ENABLE_ADD_PROPERTY && (record.email == 'scripts@dreamfactory.com'));
    print(record.email + ' is ' + ( record.banned_for_life ? '' : 'not') + ' banned for life.      ');
});

//apps.create.js  ## this is a post to /rest/system/app
//First lets make sure it was just one app sent to be created.
//We'll do that by seeing if there is a record wrapper object
if ( event.record ) {
    //loop through the record array and modify the data before it gets to the database.
    _.each( event.record, function( record, index, list ) {
        record.api_name = 'user_' + record.api_name;
    });
//Now then, if there is only one, lets modify the data before it gets to the database.
} else if ( event.api_name ) {
    event.api_name = 'user_' + event.api_name;
//We expect api_name to exist in the event object, if its not there, lets throw back an exception
} else {
    throw "Unrecognized Data";
}
