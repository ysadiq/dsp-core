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
Actions = {
	/** @type {*} */
	_config:    {},
	/** @type {*}[] */
	_apps:      [],
	/** @type {jQuery} */
	$_error:    null,
	/** @type {jQuery} */
	$_fsToggle: null,

	//-------------------------------------------------------------------------
	//	Functions
	//-------------------------------------------------------------------------

	/**
	 * Initialize the component
	 */
	init: function() {
		this.$_error = $('#error-container');
		//this.$_fsToggle = $('#fs_toggle');
		this.getConfig();
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
			if (-1 != (
					_pos = _appToRun.indexOf('#')
				)) {
				_appToRun = _appToRun.substr(0, _pos);
			}

			this._apps.forEach(
				function(app) {
					if (app.api_name == _appToRun) {
						if (app.is_sys_admin) {
							app.requires_fullscreen = false;
						}
						Actions.showApp(
							app.api_name,
							app.launch_url,
							app.is_url_external,
							app.requires_fullscreen,
							app.allow_fullscreen_toggle
						);
						return false;
					}

					return true;
				}
			);
		}
	},

	getConfig: function() {
		if (this._config.length) {
			return this._config;
		}

		var that = this;

		$.getJSON(CurrentServer + '/rest/system/config?app_name=launchpad', {async: false}).done(
			function(configInfo) {
				Config = that._config = configInfo;
				document.title = 'LaunchPad ' + configInfo.dsp_version;
				that.updateSession('init');

				var data = {
					allow_open_registration: Config.allow_open_registration,
					allow_guest_user:        Config.allow_guest_user
				};

				Templates.loadTemplate(
					Templates.navBarTemplate,
					{User: data},
					'navbar-container'
				);
			}
		).fail(
			function(response) {
				alertErr(response);
			}
		);

		return false;
	},

	createAccount: function() {
		window.top.location.href = '/web/register?return_url=' + encodeURI(window.top.location);
	},

	getApps: function(data, action) {
		var _apps = [], _defaultShown = false, $_defaultApps = $('#default_app'), _options;

		this.$_error.hide().empty();
		$_defaultApps.empty();

		if (data && data.no_group_apps) {
			_apps = data.no_group_apps;
		}

		data.app_groups.forEach(
			function(group) {
				group.apps.forEach(
					function(app) {
						_apps.push(app);
					}
				);
			}
		);

		this._apps = _apps;

		_options = "";

		_apps.forEach(
			function(app) {
				if (app.is_default && !data.is_sys_admin) {
					Actions.showApp(
						app.api_name,
						app.launch_url,
						app.is_url_external,
						app.requires_fullscreen,
						app.allow_fullscreen_toggle
					);

					//window.defaultApp = app.id;
					_defaultShown = true;

				}

				else if (app.is_default && data.is_sys_admin) {
					app.requires_fullscreen = false;

					Actions.showApp(
						app.api_name,
						app.launch_url,
						app.is_url_external,
						app.requires_fullscreen,
						app.allow_fullscreen_toggle
					);

					//window.defaultApp = app.id;
					_defaultShown = true;

					$('#adminLink').on(
						'click', function() {
							Actions.showAdmin()
						}
					);
				}

				_options += '<option value="' + app.id + '">' + app.name + '</option>';
			}
		);

		$_defaultApps.append(_options + '<option value>None</option>');

		if ('update' == action) {
			return;
		}

		if (data.is_sys_admin && _defaultShown) {
			return;
		}

		if (data.is_sys_admin && !_defaultShown) {
			this.showApp('admin', '/admin/#/', '0', false);
			$('#adminLink').off('click');
			$('#fs_toggle').off('click');
		} else if (1 == data.app_groups.length && 1 == data.app_groups[0].apps.length && !data.no_group_apps.length) {
			$('#app-list-container').hide();
			this.showApp(
				data.app_groups[0].apps[0].api_name,
				data.app_groups[0].apps[0].launch_url,
				data.app_groups[0].apps[0].is_url_external,
				data.app_groups[0].apps[0].requires_fullscreen,
				data.app_groups[0].apps[0].allow_fullscreen_toggle
			);
		} else if (!data.app_groups.length && data.no_group_apps.length) {
			$('#app-list-container').hide();
			this.showApp(
				data.no_group_apps[0].api_name,
				data.no_group_apps[0].launch_url,
				data.no_group_apps[0].is_url_external,
				data.no_group_apps[0].requires_fullscreen,
				data.no_group_apps[0].allow_fullscreen_toggle
			);
		} else if (!data.app_groups.length && !data.no_group_apps.length) {
			this.$_error.html("Sorry, it appears you have no active applications.  Please contact your system administrator").show();
		} else {
			Actions.showAppList();
		}
	},

	showApp: function(name, url, type, fullscreen, allowfullscreentoggle) {



		$('#fs_toggle').addClass('disabled');

		$('#app-list-container').hide();
		$('#apps-list-btn').removeClass('disabled');
		$('iframe').hide();

		//	Show the admin if your an admin
		if ('admin' == name) {
			var $_admin = $('#admin');

			var $_adminApp = this.buildAppFrame(name, CurrentServer + '/admin/index.html?dsp_ver=' + Config.dsp_version + '#/');

			if ($_admin.length) {
				$_admin.replaceWith($_adminApp);
			}

			$('#adminLink').addClass('disabled');
			return;
		}

		$('#adminLink').removeClass('disabled');

		var $_app = $('#' + name);

		//	Check if there is an element with this id
		if (!$_app.length) {
			var _url = replaceParams(url, name);
			$_app.appendTo(this.buildAppFrame(name, url));
		}

		//check if that element requires fullscreen
		if (fullscreen) {
			this.requireFullScreen();
		}

		// Show the app
		if (allowfullscreentoggle) {
            $('#fs_toggle').on(
				'click', function() {
                    Actions.toggleFullScreen(true);
				}
			).removeClass('disabled');
		} else {
			$('#fs_toggle').off(
				'click', function() {
					Actions.toggleFullScreen(false);
				}
			).addClass('disabled');
		}

		$_app.show();
	},

	/**
	 * Builds a standard iframe
	 * @param {string} name
	 * @param {string} url
	 * @param {boolean} [doNotAppend]
	 * @returns {*|jQuery|HTMLElement}
	 */
	buildAppFrame: function(name, url, doNotAppend) {
		var $_frame = $(
			'<iframe seamless="seamless" id="' +
			name +
			'" name="' +
			name +
			'" class="app-loader" src="' +
			url +
			'"></iframe>'
		);

		if (!doNotAppend) {
			$_frame.appendTo('#app-container');
		}

		return $_frame;
	},

	animateNavBarClose: function(callback) {

		var navbarH = $('#main-nav').height();
		$('#main-nav').animate(
			{
				height: 0
			}
		).removeClass('in');

		if (typeof callback == 'function') {
			callback.call(this);
		}
	},

	showAppList: function() {
		$('#adminLink').on(
			'click', function() {
				Actions.showAdmin()
			}
		);
		$('#adminLink').removeClass('disabled');
		$('#fs_toggle').off('click');
		$('#fs_toggle').addClass('disabled');
		$('app-container').css({"z-index": 1});
		$('#app-list-container').show();
		$('#app-list-container').css({"z-index": 998});
		$('#apps-list-btn').addClass('disabled');
		this.animateNavBarClose();

	},
	showAdmin:   function() {

		$('#adminLink').off('click');
		$('#fs_toggle').off('click');

		var name = 'admin', url = '/admin/index.html?dsp_ver=' + Config.dsp_version + '#/', type = 0, fullscreen = 0, allowfullscreentoggle = 0;

		this.animateNavBarClose(
			function() {
				this.showApp(name, url, type, fullscreen, allowfullscreentoggle);

			}
		);

	},

	appGrouper: function(sessionInfo) {
		// Check if sessionInfo has any apps in the no_group_apps array
		if (sessionInfo.no_group_apps == 0) {
			// It doesn't have any apps
			// Fail silently
			//console.log('fail');
		} else {
			// It does have apps!

			//create an array variable to store these apps
			sessionInfo.mnm_ng_apps = [];

			// Fire up an new object
			var apps = {};

			// create the property 'apps' on our new object
			apps.apps = sessionInfo.no_group_apps;

			var no_url_apps = [];

			$.each(
				apps.apps, function(k, v) {
					if (v.launch_url === '') {
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

	updateSession: function(action) {
		var that = this;
		$.getJSON(CurrentServer + '/rest/user/session?app_name=launchpad', {async: false}).done(
			function(sessionInfo) {
				//$.data(document.body, 'session', data);
				//var sessionInfo = $.data(document.body, 'session');
				CurrentSession = sessionInfo;
				Actions.appGrouper(sessionInfo);

				CurrentUserID = sessionInfo.id;
				if (CurrentUserID) {
					sessionInfo.activeSession = true;
				}
				sessionInfo.allow_open_registration = Config.allow_open_registration;
				sessionInfo.allow_guest_user = Config.allow_guest_user;

				Templates.loadTemplate(Templates.navBarTemplate, {User: sessionInfo}, 'navbar-container');
				Templates.loadTemplate(Templates.appIconTemplate, {Applications: sessionInfo}, 'app-list-container');

				if (sessionInfo.is_sys_admin) {
					$('#adminLink').addClass('disabled');
					that.$_fsToggle.addClass('disabled');
					$('#apps-list-btn').removeClass('disabled');
					that.$_fsToggle.off('click');
				}

				if (action == "init") {
					that.getApps(sessionInfo, action);
					that.autoRunApp();
				}
			}
		).fail(
			function(response) {
				if (response.status == 401 || response.status == 403) {
					var data = {
						allow_open_registration: Config.allow_open_registration,
						allow_guest_user:        Config.allow_guest_user
					};
					Templates.loadTemplate(Templates.navBarTemplate, {User: data}, 'navbar-container');
					that.doSignInDialog();
				} else if (response.status == 500) {
					that.showStatus(response.statusText, "error");
				}
			}
		);
	},

	//*************************************************************************
	//* Login
	//*************************************************************************

	doSignInDialog: function(stay) {
		window.top.location = '/web/login?redirected=1';
	},

	//*************************************************************************
	//* Profile
	//*************************************************************************

	doProfileDialog: function() {
		window.top.location.href = '/web/profile';
	},

	//*************************************************************************
	//* Password Changing
	//*************************************************************************

	doChangePasswordDialog: function() {
		window.top.location.href = '/web/password';
	},

	//*************************************************************************
	//* Logout Functions
	//*************************************************************************

	doSignOutDialog: function() {
		$("#logoffDialog").modal('show');
	},

	signOut: function() {
		var that = this;
		$.ajax(
			{
				dataType: 'json',
				type:     'POST',
				url: CurrentServer + '/rest/user/session/?app_name=launchpad&method=DELETE',
				cache:    false,
				async:    false,
				success:  function(response) {
					$('#app-container, #app-list-container').empty();
					$('#logoffDialog').modal('hide');

					that.updateSession('init');
				},
				error:    function(response) {
					if (401 == response.status) {
//						var data = {
//							allow_open_registration: Config.allow_open_registration,
//							allow_guest_user:        Config.allow_guest_user
//						};
//
//						Templates.loadTemplate(Templates.navBarTemplate, {User: data}, 'navbar-container');
						that.doSignInDialog();
					}
				}
			}
		);
	},

	showStatus: function(message, type) {
		if ('error' == type) {
			this.$_error.html(message).removeClass().addClass('alert alert-danger center').show().fadeOut(10000);
		} else {
			this.$_error.html(message).removeClass().addClass('alert alert-success center').show().fadeOut(5000);
		}
	},

	toggleFullScreen: function(toggle) {
		if (toggle) {
			this.animateNavBarClose(
				function() {
					$('#app-container').css({"top": "0px", "z-index": 998});
					$('#navbar-container').css({"z-index": 10});
					$('#rocket').show();
                }
			);

		} else {
			$('#app-container').css({"top": "50px", "z-index": 997});
			$('#navbar-container').css({"z-index": 999});
			$('#fs_toggle').removeClass('disabled');
			$('#rocket').hide();
		}
	},

	requireFullScreen: function() {
		$('#app-container').css({"top": "0px", "z-index": 998});
	}
};

/**
 * DocReady
 */
jQuery(
	function($) {
		var $_body = $('body');

		$_body.on(
			'touchstart.dropdown', '.dropdown-menu', function(e) {
				e.stopPropagation();
			}
		);
	}
);

Actions.init();

