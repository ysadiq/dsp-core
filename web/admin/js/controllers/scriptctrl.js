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
var ScriptCtrl = function( $scope, Event, Script, Config ) {
	var editor;
	(
		function() {
			$scope.Config = Config.get(
				function( response ) {
					if ( response.is_private || !response.is_hosted ) {
						editor = ace.edit( "editor" );
					}
				}
			);
			//get ALL events
			Event.get( {"all_events": "true"} ).$promise.then(
				function( response ) {
					$scope.Events = response.record;
					// $scope.Events.forEach(
					// 	function( event ) {
					// 		event.paths.forEach(
					// 			function( path ) {
					// 				var preEvent, postEvent, preObj, postObj;
					// 				var pathIndex = path.path.lastIndexOf( "/" ) + 1;
					// 				var pathName = path.path.substr( pathIndex );
					// 				path.verbs.forEach(
					// 					function( verb ) {
          //
					// 						preEvent = pathName + "." + verb.type + "." + "pre_process";
					// 						preObj = {"type": verb.type, "event": preEvent, "scripts": []};
					// 						postEvent = pathName + "." + verb.type + "." + "post_process";
					// 						postObj = {"type": verb.type, "event": postEvent, "scripts": []};
					// 						path.verbs.push( preObj );
					// 						path.verbs.push( postObj );
					// 					}
					// 				)
          //
					// 			}
					// 		)
          //
					// 	}
					// )
				}
			);

		}()
	);

	$scope.loadScript = function() {
		editor.setValue( '' );
		$scope.currentScript = this.verb.event;
		$scope.script = this.verb.scripts;
        $scope.hasContent = false;
		var script_id = {"script_id": $scope.currentScript};
		Script.get( script_id ).$promise.then(
			function( response ) {
				editor.setValue( response.script_body );
                $scope.hasContent = true;
                $.pnotify(
                    {
                        title: $scope.currentScript,
                        type:  'success',
                        text:  'Loaded Successfully'
                    }
                );

			},
            function(){
                $scope.hasContent = false;
                $.pnotify(
                    {
                        title: $scope.currentScript,
                        type:  'error',
                        text:  'No Script found, enter a new one when ready.'
                    }
                );
            }
		);
	};
	$scope.loadEvent = function() {
		if ( $scope.currentEvent === this.event.name ) {
			$scope.currentEvent = null;
		}
		else {
			$scope.currentEvent = this.event.name;
		}

	};
	$scope.saveScript = function() {
		var script_id = {"script_id": $scope.currentScript};
		var post_body = editor.getValue() || " ";

		Script.update( script_id, post_body ).$promise.then(
			function( response ) {
				$.pnotify(
					{
						title: $scope.currentScript,
						type:  'success',
						text:  'Saved Successfully'
					}
				);
        $scope.hasContent = true;
			}
		);

	};
  $scope.deleteScript = function() {
    var script_id = {"script_id": $scope.currentScript};
    editor.setValue("");


    Script.delete( script_id).$promise.then(
      function( response ) {
        $.pnotify(
          {
            title: $scope.currentScript,
            type:  'success',
            text:  'Deleted Successfully'
          }
        );
      }
    );

  };
	$scope.loadPath = function() {
		if ( $scope.currentPath === this.path.path ) {
			$scope.currentPath = null;
		}
		else {
			$scope.currentPath = this.path.path;
		}
	}

};
