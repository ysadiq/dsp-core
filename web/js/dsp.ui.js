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

/**
 * Our main DSP settings and cache
 * @private
 */
Platform = {
	/**
	 * General Settings
	 */
	settings: {
		bgCurrent:   0,
		bgLast:      0,
		backgrounds: ['default', 'blue', 'orange', 'purple', 'red', 'yellow']
	},
	/**
	 * Event Settings
	 */
	events:   {
		/**
		 * Constants
		 */
		DSP_EVENT:    'dsp.event',
		/**
		 * Members
		 */
		enabled:      !!window.EventSource,
		source:       null,
		stream_id:    null,
		url:          '/rest/system/event_stream?app_name=launchpad',
		/**
		 * Methods
		 */
		/**
		 * Routes messages to jQuery
		 *
		 * @param eventType
		 * @param eventData
		 */
		jqueryRouter: function(eventType, eventData) {
			jQuery(window).trigger(eventType, eventData);
			console.log('ROUTED event to jQuery: ' + eventType + ' -> ' + JSON.stringify(eventData));
		},
		/**
		 * Message Handler
		 * @param event
		 */
		message:      function(event) {
			var _data = JSON.parse(event.data);
			console.log('MESSAGE event received: ' + _data.details.type + ' -> ' + event.data);

			//	Route message if wanted
			if (Platform.events.DSP_EVENT == _data.details.type && $.isFunction(Platform.events.jqueryRouter)) {
				Platform.events.jqueryRouter(_data.details.type, _data);
			}
		},
		/**
		 * Open Handler
		 * @param event
		 */
		open:         function(event) {
			console.log('OPEN event received: ' + JSON.stringify(event));
		},
		/**
		 * Error Handler
		 * @param event
		 */
		error:        function(event) {
			console.log('ERROR event received: ' + JSON.stringify(event));
		},
		/**
		 * Initializes the event stream
		 */
		init:         function() {
			if (!Platform.events.enabled) {
				return null;
			}

			if (!Platform.events.source) {
				Platform.events.source = new EventSource(Platform.events.url);
				Platform.events.source.addEventListener('message', Platform.events.message);
				Platform.events.source.addEventListener('dsp.event', Platform.events.message);
				Platform.events.source.addEventListener('open', Platform.events.open);
				Platform.events.source.addEventListener('error', Platform.events.error);
				Platform.events.enabled = true;
			}

			return Platform.events.source

		}
	}
};

/**
 * Rotate the background splash on the web pages
 *
 * @param {int} timeout If specified, a timer will be created to rotate the background
 * @private
 */
var _rotateBackground = function(timeout) {
	var _size = Platform.settings.backgrounds.length;
	Platform.settings.bgLast = !timeout ? 0 : Platform.settings.bgCurrent;

	if (++Platform.settings.bgCurrent >= _size) {
		Platform.settings.bgCurrent = 0;
	}

	$('body').removeClass('body-starburst-' + Platform.settings.backgrounds[Platform.settings.bgLast]).addClass('body-starburst-' + Platform.settings.backgrounds[Platform.settings.bgCurrent]);

	if (timeout) {
		window.setTimeout('_rotateBackground(' + timeout + ')', timeout);
	}
};
