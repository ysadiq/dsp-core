function alertErr(response) {

    alert(getErrorString(response));
}

function isErrorString(responseText) {

    var result = null;

    if (responseText && responseText != '') {
        try {
            result = JSON.parse(responseText);
        } catch(e) {

        }
    }
    if (result && result.error) {
        return true;
    }
    return false;
}

function getErrorString(response) {

    var code = null;
    var value = null;
    var result = null;

    if (response) {
        value = response.status;
        if (value) {
            code = value;
        }
        value = response.responseText;
        if (value && value != '') {
            try {
                result = JSON.parse(value);
            } catch(e) {

            }
        } else {
            result = response.data;
        }
        if (result && result.error) {
            value = xml2text(result.error[0].message);
            if (value && value != '') {
                return value;
            }
            value = result.error[0].code;
            if (value) {
                code = value;
            }
        }
        if (code !== null) {
            return 'Server returned error code ' + code + '.';
        }
    }
    return 'Server returned an unknown error.';
}

function text2xml(value) {

    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/\'/g, '&apos;');
}

function xml2text(value) {

    return value.replace(/&quot;/g, '"').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&').replace(/&apos;/g, '\''); ;
}
removeByAttr = function (arr, attr, value) {
    if(!arr){
        return false;
    }
    var i = arr.length;
    while (i--) {
        if (arr[i] && arr[i][attr] && (arguments.length > 2 && arr[i][attr] === value )) {
            arr.splice(i, 1);
        }
    }
    return arr;
};
removeByAttrs = function(arr, attr1, value1, attr2, value2){
    if(!arr){
        return false;
    }
    var i = arr.length;
    while(i--){
        if(arr[i] && arr[i][attr1] && (arguments.length > 2 && arr[i][attr1] === value1 )){
            if(arr[i][attr2] && (arguments.length > 2 && arr[i][attr2] === value2)){
                arr.splice(i,1);
            }

        }
    }
    return arr;
};
updateByAttr = function(arr, attr1, value1, newRecord){
    if(!arr){
        return false;
    }
    var i = arr.length;
    while(i--){
        if(arr[i] && arr[i][attr1] && (arguments.length > 2 && arr[i][attr1] === value1 )){

            //arr.splice(i,1);
            arr[i] = newRecord;


        }
    }
    return arr;
};
checkForDuplicates = function(arr, attr1, value1, attr2, value2){
    if(!arr){
        return false;
    }
    var i = arr.length;
    var found=false;
    while(i--){
        if(arr[i] && arr[i][attr1] && (arguments.length > 2 && arr[i][attr1] === value1 )){
            if(arr[i][attr2] && (arguments.length > 2 && arr[i][attr2] === value2)){
                found=true;
            }

        }
    }
    return found;
};
checkForDuplicate = function(arr, attr1, value1){
    if(!arr){
        return false;
    }
    var i = arr.length;
    var found=false;
    while(i--){
        if(arr[i] && arr[i][attr1] && (arguments.length > 2 && arr[i][attr1] === value1 )){

            found=true;


        }
    }
    return found;
};
CurrentServer = location.protocol + '//' + location.host ;