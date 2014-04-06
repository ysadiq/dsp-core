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
var _bgs = ['default', 'blue', 'orange', 'purple', 'red', 'yellow'];
var _bgCurrent = 0;

var _rotateBackground = function(firstTime) {
	var _size = _bgs.length, _bgLast = firstTime ? 0 : _bgCurrent;

	if (++_bgCurrent >= _size) {
		_bgCurrent = 0;
	}

	$('body').removeClass('body-starburst-' + _bgs[_bgLast]).addClass('body-starburst-' + _bgs[_bgCurrent]);
	console.log('Rotation complete.');

	window.setTimeout('_rotateBackground()', 15000);
};
jQuery(function($) {
	_rotateBackground(-1);
});