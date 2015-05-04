var _url = 'http://requestb.in/qxvtceqx';
var _payload = JSON.stringify({"name":"test"});
var _curlOptions = {'CURLOPT_HTTPHEADER':['Content-Type: application/json']};

try { 
    _result = platform.api.post( _url, _payload, _curlOptions );
} catch ( _ex ) {
    print('Exception: ' + _ex.message);
}

print('Result = ' + _result);