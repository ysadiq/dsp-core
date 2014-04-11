var ScriptCtrl = function ($scope, Event, Script, Config) {
var editor;
    (function () {
        $scope.Config = Config.get( function(response){
            if(response.is_private || !response.is_hosted){
                editor = ace.edit("editor");
            }else{
                return;
            }
        })
        //get ALL events
        Event.get({"all_events": "true"})
            .$promise.then(function (response) {
                $scope.Events = response.record;
                $scope.Events.forEach(function(event){
                  var name=event.name;

                  event.paths.forEach(function(path){
                    var preEvent, postEvent, preObj, postObj;
                    var pathIndex = path.path.lastIndexOf("/") + 1;
                    var pathName = path.path.substr(pathIndex);
                     path.verbs.forEach(function(verb){

                       preEvent = pathName + "." + verb.type + "." + "pre_process";
                       preObj = {"type":verb.type, "event":preEvent, "scripts":[]};
                       postEvent = pathName + "." + verb.type + "." + "post_process";
                       postObj = {"type":verb.type, "event":postEvent, "scripts":[]};
                       path.verbs.push(preObj);
                       path.verbs.push(postObj);
                     })

                  })

                })
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
        var post_body = editor.getValue() || " ";

          Script.update(script_id, post_body)
              .$promise.then(function (response) {
                $.pnotify({
                   title: $scope.currentScript,
                   type: 'success',
                   text: 'Saved Successfully'
               });
              }
          );


    };
    $scope.loadPath = function(){
        if($scope.currentPath === this.path.path){
            $scope.currentPath= null;
        }else{
            $scope.currentPath = this.path.path;
        }
    }


};
