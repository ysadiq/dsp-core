var ScriptCtrl = function ($scope, Event, Script) {
    var editor = ace.edit("editor");
    (function () {
        //get ALL events
        Event.get({"all_events": "true"})
            .$promise.then(function (response) {
                $scope.Events = response.record;
            }
        );
    }());

    $scope.loadScript = function(){
        editor.setValue("");
        $scope.currentScript = this.verb.event;
        $scope.script = this.verb.scripts;
        var script_id = {"script_id":$scope.currentScript};
        Script.get(script_id)
            .$promise.then(function (response) {
                editor.setValue(response.script_body);
            }
        );
    }
    $scope.loadEvent = function(){
        if($scope.currentEvent === this.event.name){
            $scope.currentEvent = null;
        }else{
            $scope.currentEvent = this.event.name;
        }
    }
    $scope.saveScript = function(){
        var script_id = {"script_id":$scope.currentScript};
        var post_body = editor.getValue();
        Script.update(script_id, post_body)
            .$promise.then(function (response) {
                console.log(response);
            }
        );
    };
    $scope.loadPath = function(){
        if($scope.currentPath === this.path.path){
            $scope.currentPath= null;
        }else{
            $scope.currentPath = this.path.path;
        }
        console.log(this);
    }


};