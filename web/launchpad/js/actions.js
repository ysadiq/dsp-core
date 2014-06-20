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
 * LaunchPad actions
 */
/**
 * @type {{_apps: {}, $_toolbar: null, $_error: null, errorFadeDuration: number, successFadeDuration: number, init: Function, _getEndpoint: Function, _redirect: Function, getConfig: Function, autoRunApp: Function, _runApp: Function, updateToolbar: Function, createAccount: Function, _buildAppList: Function, getApps: Function, toggleFullScreen: Function, showApp: Function, animateNavBarClose: Function, _setButtonState: Function, showAppList: Function, showAdmin: Function, appGrouper: Function, updateSession: Function, doSignInDialog: Function, doProfileDialog: Function, doChangePasswordDialog: Function, doSignOutDialog: Function, signOut: Function, showStatus: Function}}
 */
var Actions = {

	//*************************************************************************
	//	Properties
	//*************************************************************************

	/** @var {*} */
	_apps:               {},
	/** @var {$} */
	$_toolbar:           null,
	/** @var {$} */
	$_error:             null,
	/** @var {int} The number of ms to keep errors on the screen */
	errorFadeDuration:   8000,
	/** @var {int} The number of ms to keep messages on the screen */
	successFadeDuration: 4000,

	//*************************************************************************
	//    Methods
	//*************************************************************************

	/**
	 * Initialize
	 */
	init: function() {
		//	Get some jQuery refs
		this.$_toolbar = $('#main-nav');
		this.$_error = $('#error-container');

		//	Load the configuration
		this.getConfig();
	},

	/**
	 * Retrieves the full URL to the current server including the API key and resource
	 * @param resource
	 * @param [query]
	 * @param [appName]
	 * @returns {string}
	 */
	_getEndpoint: function(resource, query, appName) {
		var _appName = 'app_name=' + (appName || 'launchpad');
		var _query = (query ? '&' : '?') + _appName;
		return CurrentServer + '/rest/' + resource.replace(/^\/+|\/+$/gm, '') + _query;
	},

	/**
	 * DnD redirect
	 * @param {string} url
	 * @private
	 */
	_redirect: function(url) {
		window.top.location.href = url;
	},

	/**
	 * Retrieve the DSP configuration
	 * @returns {*}
	 */
	getConfig: function() {
		var _this = this;

		if (!Config) {
			$.ajax(
				{
					url: this._getEndpoint('system/config'), async: false, dataType: 'json'
				}
			).done(
				function(data) {
					if (!data) {
						throw 'Invalid configuration information received from server.';
					}

					//	Set up the page now
					Config = data;
					_this.updateSession('init');
				}
			).fail(
				function(data) {
					alertErr(data);
					Config = false;
				}
			);
		}

		return Config;
	},

	/**
	 * Auto run an app passed in on the command line:
	 *
	 *    https://dsp-awesome.cloud.dreamfactory.com/?run=app-xyz
	 */
	autoRunApp: function() {
		//	Auto-run an app?
		var _appToRun = $.QueryString('run'), _pos = -1;

		if (_appToRun && this._apps.length) {

			_appToRun = decodeURIComponent(_appToRun.replace(/\+/g, '%20'));

			//	Strip off any hash
			if (-1 != (_pos = _appToRun.indexOf('#'))) {
				_appToRun = _appToRun.substr(0, _pos);
			}

			if (this._apps && this._apps.hasOwnProperty(_appToRun)) {
				return this._runApp(this._apps[_appToRun], true);
			}
		}

		return false;
	},

	/**
	 * Runs an "app"
	 * @param {*} app
	 * @param {boolean} [noAdminFullScreen] If true, and user is sys-admin, fullscreen is disabled
	 * @returns {boolean}
	 * @private
	 */
	_runApp: function(app, noAdminFullScreen) {
		$('#app-list-container').slideDown('fast');

		if (noAdminFullScreen && app.is_sys_admin) {
			app.requires_fullscreen = false;
		}

		this.showApp(
			app.api_name,
			app.launch_url,
			app.is_url_external,
			app.requires_fullscreen,
			app.allow_fullscreen_toggle
		);

		return true;
	},

	/**
	 * Updates the toolbar buttons accordingly
	 * @param {*} config copy of Config
	 * @param {*} [session] the session info
	 */
	updateToolbar: function(config, session) {
		if (config.active_session) {
			$('#lp-sign-out, #lp-edit-profile, #lp-change-password, #apps-list-btn').removeClass('hide disabled');
			$('#lp-sign-in, #lp-register').addClass('hide disabled');

			if (session && session.is_sys_admin) {
				$('#adminLink').addClass('disabled');
				$('#fs_toggle').addClass('disabled').off('click');
				$('#apps-list-btn').removeClass('disabled');
			}
		} else {
			$('#adminLink').addClass('disabled').off('click');

			if (config.allow_guest_user) {
				$('#apps-list-btn').addClass('disabled');
				$('#lp-sign-out').removeClass('hide disabled');
				$('#lp-sign-in').addClass('hide disabled');
			}

			if (config.allow_open_registration) {
				$('#lp-register').removeClass('hide disabled');
			}
		}
	},

	/**
	 * Create a new account
	 */
	createAccount: function() {
		this._redirect('web/register?return_url=' + encodeURI(window.top.location));
	},

	/**
	 *
	 * @param data
	 * @param action
	 * @returns {*}
	 * @private
	 */
	_buildAppList: function(data, action) {
		var _apps = this._apps, _defaultShown, _options;

		//	Build the application object
		if (data) {
			if (data.no_group_apps) {
				$.each(
					data.no_group_apps, function(index, app) {
						_apps[app.api_name] = app;
					}
				);
			}

			if (data.app_groups) {
				$.each(
					data.app_groups, function(index, group) {
						if (group.apps) {
							$.each(
								group.apps, function(index, app) {
									_apps[app.api_name] = app;
								}
							);
						}
					}
				);
			}
		}

		return _apps;
	},

	/**
	 * Get my DSP's apps
	 * @param {array} data
	 * @param {string} action
	 */
	getApps: function(data, action) {
		var _this = this, _defaultToShow = false, $_defaultApps = $('#default_app'), _options;
		var _appToRun = false, _groups = data.app_groups, _noGroups = data.no_group_apps;

		//	Clear out existing defaults and reload the app list
		this.$_error.hide().empty();
		this._apps = this._buildAppList(data, action);

		_options = '';
		$_defaultApps.empty();

		$.each(
			this._apps, function(appName, app) {
				if (!_defaultToShow && app.is_default) {
					_defaultToShow = app;
				}

				_options += '<option value="' + app.id + '">' + app.name + '</option>';
			}
		);

		$_defaultApps.append(_options + '<option value>None</option>');

		if (_defaultToShow) {
			this._runApp(_defaultToShow, !data.is_sys_admin);
		}

		//	Update only or Non-admin with a default app? Bail
		if ('update' == action || (!data.is_sys_admin && _defaultToShow)) {
			return true;
		}

		//	Show admin if not default
		if (data.is_sys_admin) {
			$('#adminLink').on(
				'click', function() {
					_this.showAdmin()
				}
			);

			if (!_defaultToShow && 'admin' != _defaultToShow.name) {
				_this.showAdmin();
			}
		}

		if (!_groups.length && !_noGroups.length) {
			this.$_error.html('You have no available applications.  Please contact your system administrator').show();
		}
		else {
			if (1 == _groups.length && 1 == _groups[0].apps.length && !_noGroups.length) {
				_appToRun = _groups[0].apps[0];
			} else if (!_groups.length && 1 == _noGroups.length) {
				_appToRun = _noGroups[0];
			}
		}

		if (_appToRun) {
			return this._runApp(_appToRun);
		}

		this.showAppList();

		return true;
	},

	/**
	 * Full screen button toggler
	 * @param [disable]
	 * @param [fullScreen]
	 *
	 * @private
	 */
	toggleFullScreen: function(disable, fullScreen) {
		var _this = this;

		if (disable) {
			$('#app-container, #navbar-container').removeClass('full-screen');
			$('#fs_toggle').addClass('disabled').off('click');
			$('#rocket').hide();
		} else {
			$('#fs_toggle').removeClass('disabled').on(
				'click', function() {
					$('#app-container, #navbar-container').addClass('full-screen');
					$('#rocket').show();
				}
			);
		}
	},

	/**
	 * Shows an app
	 * @param {string} name
	 * @param {string} url
	 * @param {number|boolean} type
	 * @param {number|boolean} fullscreen
	 * @param {number|boolean} allowFullScreenToggle
	 */
	showApp: function(name, url, type, fullscreen, allowFullScreenToggle) {
		var $_app = $('#' + name);

		$('#app-list-container').removeClass('full-screen').slideDown(
			'fast',
			function() {
				$('#apps-list-btn').removeClass('disabled').off('click');
			}
		).css({'z-index': 998});

		$('#app-container').slideDown('fast').css({'z-index': -1});

		var _html = '<iframe id="' + name + '" name="' + name + '" seamless="seamless" class="app-loader" src="' +
					CurrentServer + ('admin' == name ? url : replaceParams(url, name)) + '">';

		if ($_app.length) {
			$_app.show();
		} else {
			$(_html).appendTo('#app-container');
		}

		this.toggleFullScreen('admin' == name ? false : ( allowFullScreenToggle ? fullscreen : 0 ));
	},

	/**
	 * Hides the navbar
	 * @param callback
	 */
	animateNavBarClose: function(callback) {
		$('#main-nav').slideDown('fast', callback);
	},

	/**
	 * Generic button state setter
	 * @param {string} selector
	 * @param {boolean} [disable]
	 * @param {function} [callback]
	 * @private
	 */
	_setButtonState: function(selector, disable, callback) {
		if (disable) {
			$(selector).addClass('disabled').off('click');
		} else {
			$(selector).removeClass('disabled').on(
				'click', callback || function(e) {
				}
			);
		}
	},

	/**
	 * Show the application list
	 */
	showAppList: function() {
		var _this = this;

		this._setButtonState(
			'#adminLink', false, function(e) {
				_this.showAdmin();
			}
		);

		this._setButtonState(
			'#apps-list-btn', true, function(e) {
				$('#app-list-container').slideDown('fast').css({'z-index': 998});
			}
		);

		this._setButtonState('#fs_toggle', true);
		this._setButtonState('#apps-list-btn', false);

		this.animateNavBarClose();
	},

	/**
	 * Shows the Admin Console
	 */
	showAdmin: function() {
		$('#adminLink').addClass('disabled').off('click');
		$('#fs_toggle').addClass('disabled').off('click');

		var name = 'admin', url = '/admin/#/', type = 0, fullScreen = 0, allowFullScreen = 0;
		return this.showApp(name, url, type, fullScreen, allowFullScreen);
	},

	appGrouper: function(sessionInfo) {
		// Check if sessionInfo has any apps in the no_group_apps array
		if (sessionInfo.no_group_apps) {
			//create an array variable to store these apps
			sessionInfo.mnm_ng_apps = [];

			// Fire up an new object
			var apps = {};

			// create the property 'apps' on our new object
			apps.apps = sessionInfo.no_group_apps;

			var no_url_apps = [];

			$.each(
				apps.apps, function(k, v) {
					if ('' === v.launch_url) {
						no_url_apps.push(k);

					}
				}
			);

			no_url_apps.reverse();

			$.each(
				no_url_apps, function(k, v) {
					apps.apps.splice(v, 1);
				}
			);

			// push this new app object onto our array
			sessionInfo.mnm_ng_apps.push(apps);

			return false;

			// **Note** I'm doing all this to mimick how the app_groups are returned
			// in order to put ungrouped apps into a group for display.
			// I know there is a better way...
		}
	},

	/**
	 * Update the session information
	 * @param action
	 */
	updateSession: function(action) {
		var _this = this;

		document.title = 'LaunchPad ' + Config.dsp_version;

		$.ajax({url: this._getEndpoint('user/session'), dataType: 'json', async: false}).done(
			function(sessionInfo) {
				CurrentSession = sessionInfo;
				Actions.appGrouper(sessionInfo);

				CurrentUserID = sessionInfo.id;

				if (CurrentUserID) {
					Config.active_session = true;
					sessionInfo.activeSession = true;
				}

				sessionInfo.allow_open_registration = Config.allow_open_registration;
				sessionInfo.allow_guest_user = Config.allow_guest_user;

				_this.updateToolbar(Config, sessionInfo);

				Templates.loadTemplate(
					Templates.appIconTemplate,
					{Applications: sessionInfo},
					'app-list-container'
				);

				if (sessionInfo.is_sys_admin) {
					_this._setButtonState('#adminLink', true);
					_this._setButtonState('#fs_toggle', true);
					_this._setButtonState('#apps-list-btn');
				}

				if ('init' == action) {
					_this.getApps(sessionInfo, action);
					_this.autoRunApp();
				}
			}
		).fail(
			function(response) {
				if (401 == response.status || 403 == response.status) {
					var data = {
						allow_open_registration: Config.allow_open_registration,
						allow_guest_user:        Config.allow_guest_user
					};
					_this.doSignInDialog();
				} else if (500 == response.status) {
					_this.showStatus(response.statusText, 'error');
				}
			}
		);
	},

	//*************************************************************************
	//* Login
	//*************************************************************************

	doSignInDialog: function(stay) {
		this._redirect('/web/login?redirected=1');
	},

	//*************************************************************************
	//* Profile
	//*************************************************************************

	doProfileDialog: function() {
		this._redirect('/web/profile');
	},

	//*************************************************************************
	//* Password Changing
	//*************************************************************************

	doChangePasswordDialog: function() {
		this._redirect('/web/password');
	},

	//*************************************************************************
	//* Logout Functions
	//*************************************************************************

	doSignOutDialog: function() {
		$('#logoffDialog').modal('show');
	},

	/**
	 * Perform a logout
	 */
	signOut: function() {
		var _this = this;

		$.ajax(
			{
				dataType: 'json',
				type:     'POST',
				url:      this._getEndpoint('user/session', '?method=DELETE'),
				async:    false,
				cache:    false
			}
		).done(
			function(response) {
				$('#app-container').slideDown('fast').empty();
				$('#app-list-container').slideDown('fast').empty();
				$('#logoffDialog').modal('hide');

				_this.updateSession('init');
			}
		).fail(
			function(response) {
				if (401 == response.status) {
					_this.redirect('web/login');
				}
			}
		);
	},

	/**
	 * Shows an alert message on the screen
	 * @param {string} message
	 * @param {string} [type] Set to "error" or "danger" for error colors.
	 * Also can be any bootstrap alert banner color: 'danger', 'success', 'info', etc...
	 */
	showStatus: function(message, type) {
		var _class = 'alert-success', _duration = this.successFadeDuration;

		if ('error' == type) {
			_class = 'alert-danger';
			_duration = this.errorFadeDuration;
		} else if ('string' == typeof type) {
			_class = 'alert-' + type;
		}

		this.$_error.html(message).removeClass().addClass(
			'alert ' +
			_class +
			' center'
		).stop().show().fadeOut(_duration);
	}
};

/**
 * DocReady
 */
jQuery(
	function($) {
		$('body').on(
			'touchstart.dropdown', '.dropdown-menu', function(e) {
				e.stopPropagation();
			}
		);
	}
);

Actions.init();
