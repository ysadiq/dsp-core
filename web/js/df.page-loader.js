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
;
(function ($) {

	defaults: {
		'content': "',"
			'targetDiv': '#loading-screen'
	}
}

	.
	service('dfLoadingScreen', [
				function () {

					var loadingScreenText = $('');

					var _startLoadingScreen = function () {

						elem.append($(loadingScreenText).css({
																 'position': 'absolute',
																 'top': ($(elem).height() / 2) - ($(loadingScreenText).height() / 2) - 50,
																 'left': ($(elem).width() / 2) - ($(loadingScreenText).width() / 2),
																 'zIndex':   99999,
																 'color':    'white'
															 }));

						elem.fadeIn();
					};

					var _stopLoadingScreen = function () {

						elem.fadeOut();
						loadingScreenText.remove();
					};

					return {

						start: function () {

							_startLoadingScreen();
						},

						stop: function () {

							_stopLoadingScreen();
						}
					}
				}
			])
})
(jQuery);
