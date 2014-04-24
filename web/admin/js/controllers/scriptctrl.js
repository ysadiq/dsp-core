/**
 * This file is part of the DreamFactory Services Platform(tm) (DSP)
 *
 * DreamFactory Services Platform(tm) <http://github.com/dreamfactorysoftware/dsp-core>
 * Copyright 2012-2014 DreamFactory Software, Inc. <support@dreamfactory.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var ScriptCtrl = function ($scope, Event, Script, DB, Config, $http) {
Scope = $scope;
    var editor;
    (
        function () {
            DB.get().$promise.then(
                function (response) {
                    $scope.tables = response.resource;
                    $scope.buildEventList();
                }
            )
            $scope.Config = Config.get(
                function (response) {
                    if (response.is_private || !response.is_hosted) {
                        editor = ace.edit("editor");
                        editor.getSession().setMode("ace/mode/javascript");

                        $scope.loadSamples();

                    }
                }
            );
            //get ALL events

            $scope.buildEventList = function () {
                Event.get({"all_events": "true"}).$promise.then(
                    function (response) {
                        $scope.Events = response.record;
                        $scope.Events.forEach(function (event) {
                            if (event.name === "db") {
                                $scope.tables.forEach(
                                    function (table) {
                                        var newPath = {};
                                        newPath.path = "/db/" + table.name;
                                        newPath.verbs = [
                                            {"type": "get",
                                            "event": ["db." + table.name + ".select"]},
                                            {"type": "put",
                                            "event": [
                                                "db." + table.name + ".update"
                                            ]},
                                            {"type": "post",
                                            "event": [
                                                "db." + table.name + ".insert"
                                            ]},
                                            {"type": "delete",
                                            "event": [
                                                "db." + table.name + ".delete"
                                            ]}
                                        ];
                                        event.paths.push(newPath);
                                    }
                                );
                            }
                        })


                    }
                );
            }


        }()
        );

    $scope.loadSamples = function () {

        $http.defaults.headers.common['Accept'] = 'text/plain';
        $http({
            method: 'GET',
            url: 'js/example.scripts.js',
            dataType: "text"
        }).success(function (response) {
            $scope.currentScript = null;
            $scope.hasContent = false;
            $scope.exampleScripts = response;
            editor.setValue(response);
        });

    };
    $scope.showSamples = function () {
        $scope.currentScript = null;
        $scope.hasContent = false;
        editor.setValue($scope.exampleScripts);
    };
    $scope.loadScript = function () {
        editor.setValue('');
        $scope.currentScript = this.event;
        $scope.script = this.verb.scripts;
        $scope.hasContent = false;
        var script_id = {"script_id": $scope.currentScript};
        Script.get(script_id).$promise.then(
            function (response) {
                editor.setValue(response.script_body);
                $scope.hasContent = true;
                $.pnotify(
                    {
                        title: $scope.currentScript,
                        type: 'success',
                        text: 'Loaded Successfully'
                    }
                );

            },
            function () {
                $scope.hasContent = false;

            }

        );


    };
    $scope.loadEvent = function () {
        if ($scope.currentEvent === this.event.name) {
            $scope.currentEvent = null;
        }
        else {
            $scope.currentEvent = this.event.name;
        }

    };
    $scope.saveScript = function () {
        var script_id = {"script_id": $scope.currentScript};
        var post_body = editor.getValue() || " ";

        Script.update(script_id, post_body).$promise.then(
            function (response) {
                $.pnotify(
                    {
                        title: $scope.currentScript,
                        type: 'success',
                        text: 'Saved Successfully'
                    }
                );
                $scope.hasContent = true;
            }
        );

    };
    $scope.deleteScript = function () {
        var script_id = {"script_id": $scope.currentScript};
        editor.setValue("");


        Script.delete(script_id).$promise.then(
            function (response) {
                $.pnotify(
                    {
                        title: $scope.currentScript,
                        type: 'success',
                        text: 'Deleted Successfully'
                    }
                );
            }
        );

    };
    $scope.loadPath = function () {
        $scope.path = this.path.path;
        if ($scope.currentPath === this.path.path) {
            $scope.currentPath = null;
        }
        else {
            $scope.currentPath = this.path.path;
        }
    }

};
