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

//*************************************************************************
//	Objects
//*************************************************************************

if ('undefined' == typeof DreamFactory) {
	DreamFactory = {
		/** @type {*} */
		api:     null,
		/** @type {*} */
		actions: null,
		/** @type {array|boolean} */
		config:  false,
		/** @type {string} */
		dspHost: $.url().attr['base'],
		/** @type {array} */
		session: null,
		/** @type {integer|boolean} */
		user:    false
	};
}

/**
 * LaunchPad actions object
 * @type {{_apps: {}, $_toolbar: null, $_error: null, $_appFrame: null, errorFadeDuration: number, successFadeDuration: number, init: Function, getConfig: Function, autoRunApp: Function, updateToolbar: Function, createAccount: Function, getApps: Function, toggleFullScreen: Function, showApp: Function, animateNavBarClose: Function, showAppList: Function, showAdmin: Function, appGrouper: Function, updateSession: Function, doSignInDialog: Function, doProfileDialog: Function, doChangePasswordDialog: Function, doSignOutDialog: Function, signOut: Function, showStatus: Function, _buildAppList: Function, _runApp: Function, _setButtonState: Function}}
 */
DreamFactory.actions = {

	//*************************************************************************
	//	Properties
	//*************************************************************************

	/** @var {*} */
	_apps:               {},
	/** @var {*|boolean} */
	defaultApp:          false,
	/** @var {int} The number of ms to keep errors on the screen */
	errorFadeDuration:   8000,
	/** @var {int} The number of ms to keep messages on the screen */
	successFadeDuration: 4000,
	/** @var {jQuery} The #app-container reference */
	$_appFrame:          null,
	/** @var {jQuery} The #app-list-container reference */
	$_appList:           null,
	/** @var {jQuery} */
	$_error:             null,
	/** @var {jQuery} */
	$_fsToggle:          null,
	/** @var {jQuery} */
	$_toolbar:           null,

	//*************************************************************************
	//    Methods
	//*************************************************************************

	/**
	 * Initialize
	 * @returns {DreamFactory.actions}
	 */
	init: function() {
		//	Get some frequently used jQuery refs
		this.$_toolbar = $('#main-nav');
		this.$_error = $('#error-container');
		this.$_appFrame = $('#app-container');
		this.$_appList = $('#app-list-container');
		this.$_fsToggle = $('#fs_toggle');

		//	Initialize the API
		this.api = DreamFactory.api.init();

		//	Load the configuration
		this.getConfig();

		return this;
	},

	/**
	 * Retrieve the DSP configuration
	 * @returns {*}
	 */
	getConfig: function() {
		var _this = this;

		if (!Config) {
			this.api.async(false).get(
				'system/config'
			).done(
				function(response) {
					if (!response) {
						throw 'Invalid configuration information received from server.';
					}

					//	Set up the page now
					Config = response;
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
		var _appToRun = $.url().param('run');

		if (_appToRun && this._apps.length) {
			_appToRun = decodeURIComponent(_appToRun.replace(/\+/g, '%20'));

			if (this._apps[_appToRun]) {
				return this.loadApp(this._apps[_appToRun]);
			}
		}

		return false;
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
				this.$_fsToggle.addClass('disabled').off('click');
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
		this.api.redirect('web/register?return_url=' + encodeURI(window.top.location));
	},

	/**
	 * Get my DSP's apps
	 * @param {*} data
	 * @param {string} action
	 */
	getApps: function(data, action) {
		var _this = this, $_defaultApps = $('#default_app'), _options = '';
		var _appToRun = false, _groups = data.app_groups, _noGroups = data.no_group_apps;

		this.$_error.hide().empty();

		//	Clear out existing defaults and reload the app list
		this._apps = this._buildAppList(data);

		var _defaultAppId = this._getDefaultApp();

		$_defaultApps.empty();

		$.each(
			this._apps, function(appName, app) {
				_options += '<option value="' + app.id + '">' + app.name + '</option>';
			}
		);

		$_defaultApps.append(_options + '<option value="">None</option>');

		if (_defaultAppId) {
			this.loadApp(this._apps[_defaultAppId]);
		}

		//	Update only or Non-admin with a default app? Bail
		if ('update' == action || (!data.is_sys_admin && _defaultAppId)) {
			return true;
		}

		//	Show admin if not default
		if (data.is_sys_admin) {
			if ('admin' == _defaultAppId) {
				_this.showAdmin();
			}
		}

		if (!_groups.length && !_noGroups.length) {
			this.$_error.html('You have no available applications.  Please contact your system administrator').show('fast');
		}
		else {
			if (1 == _groups.length && 1 == _groups[0].apps.length && !_noGroups.length) {
				_appToRun = _groups[0].apps[0];
			} else if (!_groups.length && 1 == _noGroups.length) {
				_appToRun = _noGroups[0];
			}
		}

		if (_appToRun) {
			return this.loadApp(_appToRun);
		}

		this.showAppList();

		return true;
	},

	/**
	 * Full screen button toggler
	 * @param [disable]
	 *
	 * @private
	 */
	toggleFullScreen: function(disable) {
		if (disable) {
			$('#app-container, #navbar-container').removeClass('full-screen');
			this.$_fsToggle.addClass('disabled').off('click');
			$('#rocket').hide();
		} else {
			this.$_fsToggle.removeClass('disabled').on(
				'click', function() {
					$('#app-container, #navbar-container').addClass('full-screen');
					$('#rocket').show('fast');
				}
			);
		}
	},

	/**
	 * Hides the navbar
	 * @param callback
	 */
	animateNavBarClose: function(callback) {
		$('#navbar-container').slideUp('fast', callback);
	},

	/**
	 * Show the application list
	 */
	showAppList: function() {
		var _this = this;

		//	Enable full-screen
		this._setButtonState('#fs_toggle', true);

		//	Enable admin
		this._setButtonState(
			'#adminLink', false, function() {
				_this.showAdmin();
			}
		);

		//	Show the apps list...
		this.$_appList.show();

		//	Disable app list
		this._setButtonState('#apps-list-btn', true);
	},

	/**
	 * Shows the Admin Console
	 */
	showAdmin: function() {
		var _adminApp = {
			api_name:                'admin',
			name:                    'admin',
			url:                     '/admin/#/',
			allow_fullscreen_toggle: 0,
			requires_fullscreen:     0
		};

		if (this.loadApp(_adminApp)) {
			var _this = this;

			this._setButtonState('#adminLink, #fs_toggle', true);
			this._setButtonState(
				'#apps-list-btn', false, function() {
					_this.$_appList.show();
				}
			);
		}
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

			// **Note** I'm doing all this to mimic how the app_groups are returned
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

		document.title = 'LaunchPad ' + window.Config.dsp_version;

		this.api.get('user/session').done(
			function(sessionInfo) {
				window.CurrentSession = sessionInfo;
				_this.appGrouper(sessionInfo);

				window.CurrentUserID = sessionInfo.id;

				if (window.CurrentUserID) {
					window.Config.active_session = true;
					sessionInfo.activeSession = true;
				}

				sessionInfo.allow_open_registration = window.Config.allow_open_registration;
				sessionInfo.allow_guest_user = window.Config.allow_guest_user;

				_this.updateToolbar(window.Config, sessionInfo);

				Templates.loadTemplate(
					Templates.appIconTemplate,
					{Applications: sessionInfo},
					'app-list-container'
				);

				if (sessionInfo.is_sys_admin) {
					_this._setButtonState('#adminLink', true);
					_this._setButtonState('#fs_toggle', true);
					_this._setButtonState(
						'#apps-list-btn', false, function() {
							_this.showAppList();
						}
					);
				}

				if ('init' == action) {
					_this.getApps(sessionInfo, action);
					_this.autoRunApp();
				}
			}
		).fail(
			function(response) {
				if (401 == response.status || 403 == response.status) {
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

	doSignInDialog: function() {
		this.api.redirect('/web/login?redirected=1');
	},

	//*************************************************************************
	//* Profile
	//*************************************************************************

	doProfileDialog: function() {
		this.api.redirect('/web/profile');
	},

	//*************************************************************************
	//* Password Changing
	//*************************************************************************

	doChangePasswordDialog: function() {
		this.api.redirect('/web/password');
	},

	//*************************************************************************
	//* Logout Functions
	//*************************************************************************

	doSignOutDialog: function() {
		$('#dlg-logout').modal('show');
	},

	/**
	 * Perform a logout
	 */
	signOut: function() {
		var _this = this;

		this.api.post('user/session', null, {'method': 'DELETE'})
			.done(
			function() {
				$('#dlg-logout').modal('hide');
				$('#app-container, #app-list-container').empty().addClass('hide');
				_this.updateSession('init');
			}
		)
			.fail(
			function(response) {
				if (401 == response.status) {
					_this.api.redirect('web/login?fail=epic');
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
		).show('fast').fadeOut(_duration);
	},

	/**
	 * Runs an "app"
	 * @param {*} app
	 * @param {boolean} [adminFullOff] If true, full-screen not allowed in admin app
	 * @returns {jQuery}
	 * @private
	 */
	loadApp: function(app, adminFullOff) {
		//	Not created yet? Make it
		var $_newApp = $('#' + app.name), _adminForce = ( 'admin' == app.name && (adminFullOff || true));

		if (!$_newApp || !$_newApp.length) {
			//	Create the app
			$_newApp = $(
				'<iframe data-app-id="' +
				app.id +
				'" id="' +
				app.name +
				'" name="' +
				app.name +
				'" seamless="seamless" class="app-loader" src="' +
				CurrentServer +
				('admin' == name ? app.url : replaceParams(app.url, name)) +
				'" style="display: none;">'
			);

			this.$_appFrame.append($_newApp);
			this._apps[app.api_name] = app;
		}

		var _this = this;

		this.$_appList.hide(
			function() {
				_this.$_appFrame.show();
				_this.toggleFullScreen('admin' != app.name && app.allow_fullscreen_toggle && app.requires_fullscreen);
				$_newApp.show().css({'z-index': 10500 + app.id});
			}
		);

		return $_newApp;
	},

	/**
	 *
	 * @param data
	 * @returns {[]}
	 * @private
	 */
	_buildAppList: function(data) {
		var _apps = this._apps;

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
	 * Locate, if any, the default app for a session
	 * @private
	 */
	_getDefaultApp: function() {
		if (this._apps.length) {
			var _this = this;

			$.each(
				this._apps, function(appName, app) {
					if (app.is_default) {
						_this.defaultApp = app;
						return false;
					}
				}
			);
		}
	},

	/**
	 * Generic button state setter
	 * @param {string} selector
	 * @param {boolean} [disable]
	 * @param {function} [callback]
	 * @private
	 */
	_setButtonState: function(selector, disable, callback) {
		this._setButtonClass(selector, !disable);

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
	 * Gets the correct class for the button state
	 * @param {string} selector
	 * @param {boolean} [enable] Defaults to true
	 * @private
	 */
	_setButtonClass: function(selector, enable) {
		var $_btn = $(selector);
		var _classes = {
			'#fs_toggle':       ['fa-expand', 'fa-compress'],
			'#apps-list-btn':   ['fa-list-ul', 'fa-list-ul'],
			'#lp-sign-in':      ['fa-sign-in', 'fa-sign-out'],
			'#lp-register':     [ 'fa-user', 'fa-user'],
			'#lp-edit-profile': [ 'fa-user', 'fa-user']
		};

		if (!$_btn.length) {
			return;
		}

		if (_classes.hasOwnProperty(selector)) {
			var _on = _classes[selector][enable ? 1 : 0];
			var _off = _classes[selector][enable ? 1 : 0];
			return $(selector).removeClass(_on).addClass(_off);
		}

		return false;
	}

};

/**
 * A simple API object
 * @type {*}
 */
DreamFactory.api = {

	//*************************************************************************
	//	Properties
	//*************************************************************************

	/** @var {boolean} async False for synchronous ajax */
	_ajaxAsync: true,
	/** @var {string} The API server with the endpoints */
	server:     null,

	//*************************************************************************
	//	Methods
	//*************************************************************************

	/**
	 * Controls async setting for next call only. Resets to TRUE after every call
	 * @param onOff
	 */
	async: function(onOff) {
		this._ajaxAsync = onOff || true;
		return this;
	},

	/**
	 * Init the object
	 * @param {string} [location]
	 * @returns {DreamFactory.api}
	 */
	init: function(location) {
		this.server = location || $.url().attr['base'];

		return this;
	},

	/** API get */
	'get': function(resource, payload, query, appName) {
		return this._call('GET', resource, query, appName);
	},

	/** API post */
	'post': function(resource, payload, query, appName) {
		return this._call('POST', resource, query, appName);
	},

	/** API put */
	'put': function(resource, payload, query, appName) {
		return this._call('PUT', resource, query, appName);
	},

	/** API delete */
	'delete': function(resource, payload, query, appName) {
		return this._call('DELETE', resource, query, appName);
	},

	/** API patch */
	'patch': function(resource, payload, query, appName) {
		return this._call('PATCH', resource, query, appName);
	},

	/** API merge */
	'merge': function(resource, payload, query, appName) {
		return this._call('MERGE', resource, query, appName);
	},

	/**
	 * DnD redirect
	 * @param {string} url
	 */
	redirect: function(url) {
		if (window.top) {
			window.top.location.href = url;
		}
		else {
			window.location.href = url;
		}
	},

	//*************************************************************************
	//	Internal Methods
	//*************************************************************************

	/**
	 * Retrieves the full URL to the current server including the API key and resource
	 * @param resource
	 * @param [query]
	 * @param [appName]
	 * @returns {string}
	 * @private
	 */
	_getEndpoint: function(resource, query, appName) {
		var _appName = 'app_name=' + (appName || 'launchpad');
		var _query = (query ? '&' : '?') + _appName;
		return ( this.server || CurrentServer ) + '/rest/' + resource.replace(/^\/+|\/+$/gm, '') + _query;
	},

	/**
	 * API generic call
	 * Retrieves the full URL to the current server including the API key and resource
	 * @param {string} method
	 * @param {string} resource
	 * @param {*} [payload]
	 * @param {*} [query]
	 * @param {string} [appName]
	 * @private
	 */
	_call: function(method, resource, payload, query, appName) {
		var $_promise = $.ajax(
			{
				url:      this._getEndpoint(resource, query, appName),
				method:   method,
				data:     payload,
				dataType: 'json',
				async:    this._ajaxAsync
			}
		);

		//	Reset the async flag back to default
		this.async();

		return $_promise;
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

//	Initialize actions
window.Actions = DreamFactory.actions.init();
