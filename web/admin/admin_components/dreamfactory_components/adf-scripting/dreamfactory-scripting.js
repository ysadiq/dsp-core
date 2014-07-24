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
'use strict';

angular.module('dfSystemConfig', ['ngRoute', 'dfUtility'])
    .constant('MODSCRIPTING_ROUTER_PATH', '/scripts')
    .constant('MODSCRIPTING_ASSET_PATH', 'admin_components/dreamfactory_components/adf-scripting/')
    .config(['$routeProvider', 'MODSCRIPTING_ROUTER_PATH', 'MODSCRIPTING_ASSET_PATH',
        function ($routeProvider, MODSCRIPTING_ROUTER_PATH, MODSCRIPTING_ASSET_PATH) {
            $routeProvider
                .when(MODSCRIPTING_ROUTER_PATH, {
                    templateUrl: MODSCRIPTING_ASSET_PATH + 'views/main.html',
                    controller: 'ScriptingCtrl',
                    resolve: {
                        startLoadingScreen: ['dfLoadingScreen', function (dfLoadingScreen) {

                            // start the loading screen
                            dfLoadingScreen.start();
                        }],

                        getEventList: ['DSP_URL', '$http', function(DSP_URL, $http) {

                            return $http({
                                method: 'GET',
                                url: DSP_URL + '/rest/system/event',
                                params: {
                                    all_events: true
                                }
                            });
                        }],

                        getRecentScripts: ['DSP_URL', '$http', function(DSP_URL, $http) {

                            return $http({
                                method: 'GET',
                                url: DSP_URL + '/rest/system/script'
                            });
                        }],

                        getSampleScripts: ['DSP_URL', '$http', function(DSP_URL, $http) {

                            return $http({
                                method: 'GET',
                                url: 'js/example.scripts.js',
                                dataType: "text"
                            });
                        }]

                    }
                });
        }])
    .run(['DSP_URL', '$http', function (DSP_URL, $http) {

    }])
    .controller('ScriptingCtrl', ['DSP_URL', '$scope', '$http', 'getEventList', 'getRecentScripts', 'getSampleScripts', 'dfLoadingScreen', function (DSP_URL, $scope, $http, getEventList, getRecentScripts, getSampleScripts, dfLoadingScreen) {


        $scope.__getDataFromHttpResponse = function (httpResponseObj) {

            if (httpResponseObj.hasOwnProperty('data')) {

                if (httpResponseObj.data.hasOwnProperty('record')) {

                    return httpResponseObj.data.record;

                }else if (httpResponseObj.data.hasOwnProperty('resource')) {

                    return httpResponseObj.data.resource;

                }else {

                    //console.log("Take a look at the response.  Can't parse.")
                    //console.log(httpResponseObj);
                }
            }else {

                //console.log("No data prop in response");
            }
        };


        dfLoadingScreen.stop();

        // @TODO: Problem with parsing email.  Nothing returned at the momment.  Need to fix httpresp func to deal with that scenario.


        // PUBLIC VARS
        $scope.events = $scope.__getDataFromHttpResponse(getEventList);
        $scope.recentScripts = $scope.__getDataFromHttpResponse(getRecentScripts);

        $scope.sampleScripts = getSampleScripts.data;

        $scope.serviceName = '/system/script';

        $scope.currentEvent = '';
        $scope.currentEventType = '';

        $scope.currentScript = '';
        $scope.currentScriptPath = '';

        $scope.eventList = [];

        $scope.staticEventName = 'static';
        $scope.preprocessEventName = "pre_process";
        $scope.postprocessEventName = "post_process";


        $scope.eventTypes = {
            staticEvent: {
                name: 'static',
                label: "Static"
            },
            preprocessEvent: {
                name: 'pre_process',
                label: 'Pre-Process'
            },
            postprocessEvent: {
                name: 'post_process',
                label: 'Post-Process'
            }
        };

        $scope.menuOpen = true;
        $scope.menuEventType = '';
        $scope.menuEventPath = '';
        $scope.menuLevel = 0;

        $scope.breadcrumbs = [];

        $scope.isClean = true;

        $scope.pathFilter = '';

        // PUBLIC API
        $scope.toggleMenu = function () {

            $scope._toggleMenu();
        };

        $scope.setEvent = function (event) {

            $scope._setEvent(event);
        };

        $scope.setEventType = function (eventType) {

            $scope._setEventType(eventType);
        };

        $scope.setEventPath = function (eventPath) {

            $scope._setEventPath(eventPath);
        };

        $scope.setScript = function (path, event) {

            $scope._setScript(path, event);
        };

        $scope.openRecent = function (scriptNameStr) {

            $scope._openRecent(scriptNameStr);
        }

        $scope.menuBack = function () {

            $scope._menuBack();
        };

        $scope.save = function () {

            $scope._save();
        };

        $scope.delete = function () {

            if ($scope._confirmDeleteScript()) {
                $scope._delete();
            }
        };

        $scope.loadSamples = function () {

            $scope._loadSamples();
        };


        // PRIVATE API

        $scope._setCurrentScriptPath = function(currentEventPathStr) {

            $scope.currentScriptPath = currentEventPathStr;
        };

        $scope._setCurrentScript = function (scriptNameStr) {

            $scope.currentScript = scriptNameStr;
        };

        $scope._getEventPathByName = function (eventPathNameStr) {


            //console.log(eventPathNameStr);

            var found = false,
                i = 0;


            while (!found && i < $scope.eventList.paths.length) {

                if ($scope.eventList.paths[i].path === eventPathNameStr) {


                    found = true;
                    return $scope.eventList.paths[i];
                }

                i++;
            }

            return false;
        }

        $scope._getServiceFromServer = function (requestDataObj) {

            return $http({
                method: 'GET',
                url: DSP_URL + '/rest/' + requestDataObj.event.name
            })
        };

        $scope._stripLeadingSlash = function (path) {

            if (path.path.substring(0,1) === '/') {
                path.path = path.path.slice(1, path.path.length);

            }
        };

        $scope._createEvents = function(event, associatedData) {

            if (event.paths[1].path.indexOf("table_name") != "-1" ) {
                angular.forEach(event.paths, function (path) {


                    $scope._stripLeadingSlash(path);


                    var preEvent, postEvent, preObj, postObj, deleteEvent, selectEvent, updateEvent, insertEvent;
                    var pathIndex = path.path.lastIndexOf("/") + 1;
                    var pathName = path.path.substr(pathIndex);

                    angular.forEach(associatedData, function(obj) {

                        var newpath = {};
                        updateEvent = {"type": "put",
                            "event": [
                                event.name + "." + obj.name + ".update"
                            ]};
                        deleteEvent = {"type": "delete",
                            "event": [
                                event.name + "." + obj.name + ".delete"
                            ]};
                        insertEvent = {"type": "post",
                            "event": [
                                event.name + "." + obj.name + ".insert"
                            ]};
                        selectEvent = {"type": "get",
                            "event": [
                                event.name + "." + obj.name + ".select"
                            ]};
                        newpath.verbs = [];
                        newpath.path = "/" + event.name + "/" + obj.name;

                        path.verbs.forEach(function (verb) {
                            preEvent = event.name + "." + obj.name + "." + verb.type + "." + "pre_process";
                            preObj = {"type": verb.type, "event": [preEvent]};
                            postEvent = event.name + "." + obj.name + "." + verb.type + "." + "post_process";
                            postObj = {"type": verb.type, "event": [postEvent]};


                            newpath.verbs.push(preObj);
                            newpath.verbs.push(postObj);

                        });

                        var found = false;
                        event.paths.forEach(function (pathObj) {

                            if (pathObj.path === newpath.path) {
                                found = true;
                            }

                        });

                        if (!found) {
                            //                                            newpath.verbs.push(selectEvent);
                            //                                            newpath.verbs.push(insertEvent);
                            //                                            newpath.verbs.push(updateEvent);
                            //                                            newpath.verbs.push(deleteEvent);
                            event.paths.push(newpath)
                        }
                    })
                })
            }
            else if (event.paths[1].path.indexOf("container") != "-1") {

                angular.forEach(event.paths, function (path) {

                    $scope._stripLeadingSlash(path);


                    var preEvent, postEvent, preObj, postObj, deleteEvent, selectEvent, updateEvent, insertEvent;
                    var pathIndex = path.path.lastIndexOf("/") + 1;
                    var pathName = path.path.substr(pathIndex);

                    var newpath = {};
                    angular.forEach(associatedData, function(obj) {
                        newpath = {};
                        updateEvent = {"type": "put",
                            "event": [
                                event.name + "." + obj.name + ".update"
                            ]};
                        deleteEvent = {"type": "delete",
                            "event": [
                                event.name + "." + obj.name + ".delete"
                            ]};
                        insertEvent = {"type": "post",
                            "event": [
                                event.name + "." + obj.name + ".insert"
                            ]};
                        selectEvent = {"type": "get",
                            "event": [
                                event.name + "." + obj.name + ".select"
                            ]};
                        newpath.verbs = [];
                        newpath.path = "/" + event.name + "/" + obj.name;

                        path.verbs.forEach(function (verb) {
                            preEvent = event.name + "." + obj.name + "." + verb.type + "." + "pre_process";
                            preObj = {"type": verb.type, "event": [preEvent]};
                            postEvent = event.name + "." + obj.name + "." + verb.type + "." + "post_process";
                            postObj = {"type": verb.type, "event": [postEvent]};


                            newpath.verbs.push(preObj);
                            newpath.verbs.push(postObj);

                        });
                        var found = false;
                        event.paths.forEach(function (pathObj) {

                            if (pathObj.path === newpath.path) {
                                found = true;
                            }

                        });
                        if (!found) {
                            //                                                newpath.verbs.push(selectEvent);
                            //                                                newpath.verbs.push(insertEvent);
                            //                                                newpath.verbs.push(updateEvent);
                            //                                                newpath.verbs.push(deleteEvent);
                            event.paths.push(newpath)
                        }

                    });
                });
            }
            else {
                angular.forEach(event.paths, function (path) {

                    $scope._stripLeadingSlash(path);

                    var preEvent, postEvent, preObj, postObj, deleteEvent, selectEvent, updateEvent, insertEvent;
                    var pathIndex = path.path.lastIndexOf("/") + 1;
                    var pathName = path.path.substr(pathIndex);

                    angular.forEach(path.verbs, function(verb){

                        if (event.name !== pathName) {
                            preEvent = event.name + "." + pathName + "." + verb.type + "." + "pre_process";
                            postEvent = event.name + "." + pathName + "." + verb.type + "." + "post_process";
                        } else {
                            preEvent = pathName + "." + verb.type + "." + "pre_process";
                            postEvent = pathName + "." + verb.type + "." + "post_process";
                        }
                        preObj = {"type": verb.type, "event": [preEvent]};
                        postObj = {"type": verb.type, "event": [postEvent]};

                        path.verbs.push(preObj);
                        path.verbs.push(postObj);

                    });
                });
            }
        };

        $scope._confirmCloseScript = function () {

            return confirm('Save script before closing?');
        };

        $scope._confirmDeleteScript = function () {

            return confirm("Delete script?");
        }

        $scope._closeScript = function () {

            if (!$scope.isClean) {
                if ($scope._confirmCloseScript()) {
                    $scope.save();
                }
            }
        };

        $scope._getEventByName = function (event) {

            var eventFound = false,
                i = 0;

            while(!eventFound && i < $scope.events.length) {

                // $scope.events[i] becomes undefined inside of our .then()
                // So we'll store it here

                if ($scope.events[i].name === event ) {

                    eventFound = true;


                    return $scope.events[i];

                }
                i++
            }

            return false;
        };


        // Menu Control
        $scope._setMenuToggle = function (stateBool) {

            $scope.menuOpen = stateBool;
        };

        $scope._toggleMenuState = function () {

            $scope.menuOpen = !$scope.menuOpen;
        };

        $scope._setCurrentEvent = function (event) {

            $scope.currentEvent = event;
        };

        $scope._setCurrentEventType = function (eventType) {

            $scope.menuEventType = eventType;
        };

        $scope._setCurrentEventPath = function (eventPath) {

            $scope.menuEventPath = eventPath;
        };

        $scope._incrementMenuLevel = function () {

            $scope.menuLevel++;
        };

        $scope._decrementMenuLevel = function () {

            $scope.menuLevel--;
        };

        $scope._setMenuLevel = function (levelInt) {

            $scope.menuLevel = levelInt;
        };

        $scope._jumpToMenu = function (index) {


            index = index || null;

            switch($scope.menuLevel) {

                case 0:
                    $scope._setCurrentEventType('');
                    $scope._setCurrentEventPath('');
                    $scope._setCurrentScript('');

                    if (index) {
                        $scope._bcRemovePaths(index);
                    }else {
                        $scope._bcRemovePath();
                    }

                    $scope._clearFilter();
                    break;

                case 1:
                    $scope._setCurrentEventType('');
                    $scope._setCurrentEventPath('');
                    $scope._setCurrentScript('');

                    if (index) {
                        $scope._bcRemovePaths(index);
                    }else {
                        $scope._bcRemovePath();
                    }

                    $scope._clearFilter();
                    break;

                case 2:
                    $scope._setCurrentEventPath('');
                    $scope._setCurrentScript('');

                    if (index) {
                        $scope._bcRemovePaths(index);
                    }else {
                        $scope._bcRemovePath();
                    }

                    $scope._clearFilter();
                    break;

                case 3:
                    $scope._closeScript();
                    $scope._setCurrentScript('');
                    $scope._bcRemovePath();
                    $scope._clearFilter();
                    break;

                default:
            }
        };

        $scope._parseScriptPathFromName = function (_nameStr) {
            /*
             var pathObj = {
             event: null,
             eventType: null,
             eventPath: null,
             scriptName: null
             };


             var path;

             path = _nameStr.split('.'); // Make array from string
             path.pop(); // Remove script suffix

             // build path obj
             switch (path.length) {


             case 0:
             case 1:
             break;
             case 2:
             pathObj.event = path[0];
             pathObj.eventType = $scope.staticEventName;
             pathObj.eventPath = path[0];

             break;

             case 3:

             switch(path[0]) {

             case 'user':

             switch(path[1]) {


             case 'settings':

             pathObj.event = path[0];
             pathObj.eventType = $scope.staticEventName;
             pathObj.eventPath = path[0] + '/custom';
             break;

             case 'devices':

             pathObj.event = path[0];
             pathObj.eventType = $scope.staticEventName;

             // REMOVE 'S' at end.
             var pathSansS = path[1].slice(0, -1);
             pathObj.eventPath = path[0] + '/' + pathSansS;

             break;


             default:
             console.log('default user case')

             pathObj.event = path[0];
             pathObj.eventType = $scope.staticEventName;
             pathObj.eventPath = path[0] + '/' + path[1];

             }
             break;


             case 'system':

             pathObj.event = path[0];
             pathObj.eventType = $scope.staticEventName;

             // REMOVE 'S' at end.
             var pathSansS = path[1].slice(0, -1);

             pathObj.eventPath = path[0] + '/' + pathSansS;

             break;


             case 'files':

             pathObj.event = path[0];
             pathObj.eventType = $scope.staticEventName;
             pathObj.eventPath = path[0]
             break;

             default:
             pathObj.event = path[0];
             pathObj.eventType = $scope.staticEventName;
             pathObj.eventPath = path[0] + '/' + path[1];
             }

             break;

             case 4:

             pathObj.event = path[0];
             pathObj.eventType = path[3];
             pathObj.eventPath = path[1];
             break;

             }


             // Add script name
             pathObj.scriptName = path.join('.');

             console.log(pathObj);

             return pathObj;*/
        };


        // Breadcrumbs
        $scope._bcAddPath = function (bcPathStr) {

            $scope.breadcrumbs.push(bcPathStr);
        };

        $scope._bcRemovePath = function () {

            $scope.breadcrumbs.pop();
        };

        $scope._bcRemovePaths = function (index) {

            $scope.breadcrumbs.splice(index, $scope.breadcrumbs.length - index);
        };

        $scope._bcReplaceLastPath = function(newPathStr) {

            $scope.breadcrumbs[$scope.breadcrumbs.length - 1] = newPathStr;
        };

        $scope._bcJumpTo = function (index) {

            $scope._closeScript();
            $scope._setMenuToggle(true);
            $scope._setMenuLevel(index + 1);
            $scope._jumpToMenu(index + 1);
        };


        // Event Sorting
        $scope._isStaticEvent = function (verb) {

            if(verb.event[0].substr(verb.event[0].length - $scope.preprocessEventName.length, $scope.preprocessEventName.length) === $scope.preprocessEventName
                || verb.event[0].substr(verb.event[0].length - $scope.postprocessEventName.length, $scope.postprocessEventName.length) === $scope.postprocessEventName){

                return false;
            }

            return true;
        };

        $scope._isPreprocessEvent = function (verb) {

            if(verb.event[0].substr(verb.event[0].length - $scope.preprocessEventName.length, $scope.preprocessEventName.length) === $scope.preprocessEventName) {
                return true;
            }

            return false;
        };

        $scope._isPostprocessEvent = function (verb) {

            if (verb.event[0].substr(verb.event[0].length - $scope.postprocessEventName.length, $scope.postprocessEventName.length) === $scope.postprocessEventName) {

                return true;
            }

            return false;
        };

        $scope._isVariablePath = function (path) {

            if (path.path.indexOf("}") != "-1") {

                return true;
            }

            return false;
        }

        $scope._hasStaticEvent = function (path) {

            var hasStaticEvent = false,
                i = 0;

            while (!hasStaticEvent && i < path.verbs.length ) {

                if ($scope._isStaticEvent(path.verbs[i])) {

                    hasStaticEvent = true;
                }

                i++;
            }

            return hasStaticEvent;
        };

        $scope._hasPreprocessEvent = function (path) {

            var hasPreprocessEvent = false,
                i = path.verbs.length - 1;

            while (!hasPreprocessEvent && i >= 0) {

                if ($scope._isPreprocessEvent(path.verbs[i])) {

                    hasPreprocessEvent = true;
                }

                i--
            }

            return hasPreprocessEvent;
        };

        $scope._hasPostprocessEvent = function (path) {

            var hasPostprocessEvent = false,
                i = path.verbs.length - 1;


            while (!hasPostprocessEvent && i >= 0) {

                if ($scope._isPostprocessEvent(path.verbs[i])) {

                    hasPostprocessEvent = true;

                }

                i--
            }

            return hasPostprocessEvent;
        };


        // Filtering
        $scope._clearFilter = function () {

            $scope.pathFilter = '';
        };

        // Reset all
        $scope._resetAll = function () {

            $scope._closeScript();
            $scope.menuLevel = 0;
            $scope.breadcrumbs = [];
            $scope.eventList = [];
            $scope._setCurrentEventType('');
            $scope._setCurrentEventPath('');
            $scope._setCurrentScript('');
        };



        // COMPLEX IMPLEMENTATION
        $scope._toggleMenu = function() {

            $scope._toggleMenuState();
        };

        $scope._setEvent = function (event) {

            if ($scope.currentScript === 'samples') {
                $scope._resetAll();
            }

            if ($scope.currentEvent.name !== event.name) {

                var requestDataObj = {

                    event: event
                };

                $scope._getServiceFromServer(requestDataObj).then(
                    function (result) {

                        var records = $scope.__getDataFromHttpResponse(result);

                        if (records) {
                            $scope._createEvents(event, records);
                            $scope._setCurrentEvent(event);
                            $scope.eventList = event;
                            $scope._bcAddPath(event.name);
                            $scope._clearFilter();
                            $scope._incrementMenuLevel();
                        }
                    },
                    function (reject) {

                        throw {
                            module: 'DreamFactory Scripting Module',
                            type: 'error',
                            provider: 'dreamfactory',
                            exception: reject
                        }
                    }
                );
            }else {

                $scope._setCurrentEvent(event);
                $scope.eventList = event;
                $scope._bcAddPath(event.name);
                $scope._clearFilter();
                $scope._incrementMenuLevel();

            }

        };

        $scope._setEventType = function (eventType)  {

            $scope._setCurrentEventType(eventType);
            $scope._bcAddPath(eventType.name);
            $scope._clearFilter();
            $scope._incrementMenuLevel();

        };

        $scope._setEventPath = function (eventPath) {

            $scope._setCurrentEventPath(eventPath);
            $scope._bcAddPath(eventPath.path);
            $scope._clearFilter();
            $scope._incrementMenuLevel();

        };

        $scope._setScript = function (currentEventPathStr, currentScriptStr) {

            if (!$scope.currentScript || $scope.currentScript === 'samples') {

                $scope._bcAddPath(currentScriptStr);
                $scope._incrementMenuLevel();
            }else {

                if ($scope.isClean) {

                    $scope._bcReplaceLastPath(currentScriptStr);

                }else {
                    $scope._closeScript()
                    $scope._bcReplaceLastPath(currentScriptStr);
                }
            }

            $scope._setCurrentScript(currentScriptStr);
            $scope._setCurrentScriptPath(currentEventPathStr);

        };

        $scope._menuBack = function () {

            if ($scope.menuLevel === 0) return false;

            $scope._decrementMenuLevel();
            $scope._jumpToMenu();
        };

        $scope._save = function () {

            $scope.$broadcast('save:script');
        };

        $scope._delete = function () {

            $scope.$broadcast('delete:script');
        };

        $scope._loadSamples = function () {

            $scope._resetAll();
            $scope._setCurrentScript('samples');
            $scope._bcAddPath('Sample Scripts');
            $scope.$broadcast('load:direct', $scope.sampleScripts);
        }

        $scope._openRecent = function (scriptNameStr) {

            var pathObj = $scope._parseScriptPathFromName(scriptNameStr);
            var event =  $scope._getEventByName(pathObj.event)

            console.log($scope.currentEvent.name + ' = ' + event.name);

            if ($scope.currentEvent.name !== event.name) {

                var requestDataObj = {

                    event: event
                };

                $scope._getServiceFromServer(requestDataObj).then(
                    function (result) {

                        var records = $scope.__getDataFromHttpResponse(result);

                        if (records) {
                            $scope._createEvents(event, records);
                            $scope._setCurrentEvent(event);
                            $scope.eventList = event;
                            $scope._bcAddPath(event.name);
                            $scope._clearFilter();
                            $scope._incrementMenuLevel();
                            $scope._setEventType($scope.eventTypes[pathObj.eventType + 'Event']);
                            $scope._setEventPath($scope._getEventPathByName(pathObj.eventPath));
                            $scope._setScript('', pathObj.scriptName);
                        }
                    },
                    function (reject) {

                        throw {
                            module: 'DreamFactory System Config Module',
                            type: 'error',
                            provider: 'dreamfactory',
                            exception: reject
                        }

                    }
                );
            }else {

                $scope._setCurrentEvent(event);
                $scope.eventList = event;
                $scope._bcAddPath(event.name);
                $scope._clearFilter();
                $scope._incrementMenuLevel();
                $scope._setEventType($scope.eventTypes[pathObj.eventType + 'Event']);
                $scope._setEventPath($scope._getEventPathByName(pathObj.eventPath));
                $scope._setScript('', pathObj.scriptName);
            }
        };


        // WATCHERS AND INIT


        // MESSAGES
        $scope.$on('$destroy', function (e) {});

    }])
    .directive('dfAceEditor', ['DSP_URL', 'MODSCRIPTING_ASSET_PATH', '$http', function (DSP_URL, MODSCRIPTING_ASSET_PATH, $http) {

        return {
            restrict: 'E',
            scope: {
                serviceName: '=',
                fileName: '=',
                filePath: '=',
                isClean: '='
            },
            templateUrl: MODSCRIPTING_ASSET_PATH + 'views/df-ace-editor.html',
            link: function (scope, elem, attrs) {



                scope.editor = null;
                scope.currentScriptObj = '';


                // PRIVATE API
                scope._getFileFromServer = function (requestDataObj) {

                    return $http({
                        method: 'GET',
                        url: DSP_URL + '/rest' + requestDataObj.serviceName + '/' + requestDataObj.fileName,
                        cache: false
                    })
                };

                scope._saveFileOnServer = function (requestDataObj) {

                    return $http({
                        method: 'PUT',
                        url: DSP_URL + '/rest' + requestDataObj.serviceName + '/' + requestDataObj.fileName,
                        headers: {
                            'Content-Type': 'text/plain'
                        },
                        data: {
                            post_body: requestDataObj.body
                        }
                    })
                };

                scope._deleteFileOnServer = function (requestDataObj) {

                    return $http({

                        method: 'DELETE',
                        url: DSP_URL + '/rest' + requestDataObj.serviceName + '/' + requestDataObj.fileName,
                        params: {
                            script_id:requestDataObj.scriptId
                        }
                    })
                };

                scope._setEditorInactive = function (stateBool) {

                    if (stateBool) {

                        scope.editor.setOptions({
                            readOnly: true,
                            highlightActiveLine: false,
                            highlightGutterLine: false
                        })
                        scope.editor.renderer.$cursorLayer.element.style.opacity=0;
                    }else {
                        scope.editor.setOptions({
                            readOnly: false,
                            highlightActiveLine: true,
                            highlightGutterLine: true
                        })
                        scope.editor.renderer.$cursorLayer.element.style.opacity=100;
                    }
                };

                scope._loadEditor = function (contents, mode, inactive) {

                    inactive = inactive || false;

                    scope.editor = ace.edit('ide');

                    //scope.editor.setTheme("ace/theme/twilight");

                    if(mode){
                        scope.editor.session.setMode("ace/mode/json");
                    }else{
                        scope.editor.session.setMode("ace/mode/javascript");
                    }

                    scope._setEditorInactive(inactive);


                    scope.editor.session.setValue(contents);

                    scope.editor.focus();

                    scope.editor.on('input', function() {
                        scope.$apply(function() {
                            scope.isClean = scope.editor.session.getUndoManager().isClean();

                        })
                    });
                };

                scope._cleanEditor = function () {

                    scope.editor.session.getUndoManager().reset();
                    scope.editor.session.getUndoManager().markClean();
                };


                // WATCHERS AND INIT
                var watchScriptFileName = scope.$watch('fileName', function (newValue, oldValue) {

                    if (newValue === 'samples') return false;

                    if (!newValue) {
                        scope._loadEditor('', false, true);
                        return false;
                    }

                    var requestDataObj = {
                        serviceName: scope.serviceName,
                        fileName: newValue
                    };

                    scope._getFileFromServer(requestDataObj).then(
                        function(result) {

                            scope.currentScript = result.data;
                            scope._loadEditor(result.data.script_body, false);
                        },
                        function(reject) {

                            scope._loadEditor('', false);
                        }
                    )
                });


                // MESSAGES
                scope.$on('$destroy', function (e) {

                    watchScriptFileName();
                });

                scope.$on('save:script', function(e) {

                    var requestDataObj = {
                        serviceName: scope.serviceName,
                        fileName: scope.fileName,
                        body:  scope.editor.getValue() || " "
                    };

                    scope._saveFileOnServer(requestDataObj).then(
                        function(result) {

                            scope._cleanEditor();

                        },
                        function(reject) {

                            throw {
                                module: 'DreamFactory System Config Module',
                                type: 'error',
                                provider: 'dreamfactory',
                                exception: reject
                            }
                        }
                    )
                });

                scope.$on('delete:script', function (e) {

                    var requestDataObj = {
                        serviceName: scope.serviceName,
                        fileName: scope.fileName,
                        scriptId:  scope.currentScriptObj.script_id
                    };

                    scope._deleteFileOnServer(requestDataObj).then(
                        function(result) {

                            scope.editor.setValue('', false);
                            scope._cleanEditor();
                        },
                        function(reject) {

                            throw {
                                module: 'DreamFactory System Config Module',
                                type: 'error',
                                provider: 'dreamfactory',
                                exception: reject
                            }
                        }
                    )
                });

                scope.$on('load:direct', function (e, dataObj) {

                    scope._loadEditor(dataObj, false);
                })
            }
        }
    }]);