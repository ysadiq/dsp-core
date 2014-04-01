var ScriptCtrl = function ($scope, Event) {
    //get all events
    Event.get({"all_events": "true"})
        .$promise.then(function (response) {
            $scope.Events = response.record;
        }

    )

};