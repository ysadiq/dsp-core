var ScriptCtrl = function($scope, $http){

    $http.get('https://next.cloud.dreamfactory.com/rest/script').then(function(result){
        console.log(result)
    })

}