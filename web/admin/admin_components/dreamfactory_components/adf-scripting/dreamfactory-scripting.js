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

angular.module('dfScripting', ['ngRoute', 'dfUtility'])
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

        $scope.currentScript = '';
        $scope.currentScriptPath = '';

        $scope.eventList = [];

        $scope.staticEventName = 'static';
        $scope.preprocessEventName = "pre_process";
        $scope.postprocessEventName = "post_process";

        $scope.menuOpen = true;
        $scope.menuEventPath = '';
        $scope.menuLevel = 0;

        $scope.breadcrumbs = [];

        $scope.isClean = true;

        $scope.pathFilter = '';

        $scope.staticEventsOn = true;
        $scope.preprocessEventsOn = true;
        $scope.postprocessEventsOn = true;
        $scope.uppercaseVerbs = false;
        $scope.uppercaseVerbLabels = true;

        // PUBLIC API
        $scope.toggleMenu = function () {

            $scope._toggleMenu();
        };

        $scope.setEvent = function (event) {

            $scope._setEvent(event);
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

            // returns an empty Path Object
            function PathObj() {

                return {
                    path: null,
                    verbs: []
                }
            }

            // returns an empty Verb Object
            function VerbObj() {

                return {
                    event: [],
                    type: null
                };
            }

            // builds a Verb Object
            function buildVerbObj(eventName, pathRefName, verb, operation, includeVerbInFileName) {

                includeVerbInFileName = includeVerbInFileName || false;


                var nvo = new VerbObj(),
                    eventString;

                eventString = eventName ? eventName + '.' : '';
                eventString += pathRefName ? pathRefName + '.' : '';
                eventString += includeVerbInFileName ? verb + '.' : '';
                eventString += operation ? operation : '';

                nvo.event.push(eventString);

                nvo.type = verb;

                return nvo;
            }

            // Are we dealing with a table
            function isTable() {

                return event.paths[1].path.indexOf("table_name") != '-1';
            }

            // Are we dealing with a container
            function isContainer() {

                return event.paths[1].path.indexOf("container") != '-1';
            }

            // change verbs to uppercase

            if ($scope.uppercaseVerbs) {
                angular.forEach(event.paths[0].verbs, function(verb) {
                    verb.type = verb.type.toUpperCase();
                });
            }


            // Is this a database service
            if (isTable() || isContainer()) {

                // place to store static events
                var staticEvents;

                // Loop through the associated data (tables returned from 'GET' on the service name)
                angular.forEach(associatedData, function(pathRef) {

                    // Set our staticEvents empty
                    staticEvents = [];

                    // Create a new empty Path Object
                    var npo = new PathObj();

                    // Set the path in the Path Obj
                    npo.path = '/' + event.name + '/' + pathRef.name;

                    // Store the verbs from the associated data. if !associatedData assign array.
                    var verbs;
                    if ($scope.uppercaseVerbs) {

                        verbs = pathRef.access || ['GET', 'POST', 'PATCH', 'DELETE'];

                    }else {

                        angular.forEach(pathRef.access, function (verb) {
                            verb.toLowerCase();
                        });

                        verbs = pathRef.access || ['get', 'post', 'patch', 'delete'];
                    }



                    // Loop through the verbs and create Verb Objects
                    angular.forEach(verbs, function (verb, index) {

                        // Do we want static events
                        if ($scope.staticEventsOn) {

                            // What everb are we dealing with
                            switch (verb) {

                                case "GET":

                                    // build Verb Object and store in static events
                                    staticEvents.push(buildVerbObj(event.name, pathRef.name, verb, 'select'));
                                    break;

                                case "POST":

                                    // SAO
                                    staticEvents.push(buildVerbObj(event.name, pathRef.name, verb, 'insert'));
                                    break;

                                case "PUT":

                                    // SAO
                                    staticEvents.push(buildVerbObj(event.name, pathRef.name, verb, 'update'));
                                    break;

                                case "PATCH":

                                    // SAO
                                    staticEvents.push(buildVerbObj(event.name, pathRef.name, verb, 'update'));
                                    break;

                                case "MERGE":

                                    // No support for a static merge event at this time
                                    break;

                                case "DELETE":

                                    // SAO
                                    staticEvents.push(buildVerbObj(event.name, pathRef.name, verb, 'delete'));
                                    break;
                            }
                        }

                        // Do we want pre-process events
                        if ($scope.preprocessEventsOn) {

                            // Yep.  Build Verb Object and store in our Path Object verbs array
                            npo.verbs.push(buildVerbObj(event.name, pathRef.name, verb, $scope.preprocessEventName, true))
                        }

                        // Do we want post-process events
                        if ($scope.postprocessEventsOn) {
                            // Yep.  Build Verb Object and store in our Path Object verbs array
                            npo.verbs.push(buildVerbObj(event.name, pathRef.name, verb, $scope.postprocessEventName, true))
                        }

                    });

                    // Do we want static events
                    if ($scope.staticEventsOn) {

                        // Yes.  Loop through the array
                        // array reverse to get events in proper order
                        angular.forEach(staticEvents.reverse(), function(event) {

                            // put events at the front of the verbs array in the Path Object
                            npo.verbs.unshift(event);
                        })
                    }

                    // push our Path Object back to our event
                    event.paths.push(npo);
                });

            }

            else {
                angular.forEach(event.paths, function (pathRef) {

                    angular.forEach(pathRef.verbs, function (verb) {

                        if ($scope.uppercaseVerbs) {
                            verb.type = verb.type.toUpperCase();
                        }

                        // Do we want pre-process events
                        if ($scope.preprocessEventsOn) {

                            // Yep.  Build Verb Object and store in our Path Object verbs array
                            pathRef.verbs.push(buildVerbObj(event.name, null, verb.type, $scope.preprocessEventName, true))
                        }

                        // Do we want post-process events
                        if ($scope.postprocessEventsOn) {
                            // Yep.  Build Verb Object and store in our Path Object verbs array
                            pathRef.verbs.push(buildVerbObj(event.name, null, verb.type, $scope.postprocessEventName, true))
                        }
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
                    $scope._closeScript();
                    $scope._setCurrentScript('');
                    $scope._bcRemovePath();
                    $scope._clearFilter();
                    break;

                default:
            }
        };

        /*$scope._parseScriptPathFromName = function (_nameStr) {

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

             return pathObj;
        };*/


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

       /* $scope._openRecent = function (scriptNameStr) {

            var pathObj = $scope._parseScriptPathFromName(scriptNameStr);
            var event =  $scope._getEventByName(pathObj.event)

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
                $scope._setEventPath($scope._getEventPathByName(pathObj.eventPath));
                $scope._setScript('', pathObj.scriptName);
            }
        };*/


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
    }])
