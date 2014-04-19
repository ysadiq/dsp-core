# DreamFactory Services Platform&trade; Change Log

## v1.5.0 (Release 2014-04-19)
### New!
* New DSP-level persistent storage mechanism interfaces with redis, xcache, memcache(d), etc.
* Added support for [libv8](https://github.com/v8) for server-side Javascript support
* Server-side event scripting with Javascript (Scripts live in /path/to/dsp/.private/scripts)
 * Server-side events are now live and being generated
  * Client event handler registration via new /rest/system/event API. See Live API for more info.
 * Server-side scripts now supported for REST events
  * Client event script registration via new /rest/system/script API. See Live API for more info.
* Lookup Key System
* Local configuration file support (/path/to/dsp/.private/config)
* New configuration options for events and event logging control

### Fixes, Updates, and Upgrades
* Upgraded dependencies abound
* Session bug fix for validation with ticket
* Restored PEAR repository to composer.json because it is again required :(
* Myriad Javascript SDK and Admin application changes and fixes
* Returned data from GET `/rest/system/config` now includes more information about the environment
* **Azure** bug fixes and updates
* **DynamoDB** bug fixes
* **MongoDB** Full support added for rollback and continue options, batch error handling, and server-side filtering

#### Core Changes
* Standardized code formatting style based on a slightly modified PSR-1/2. One notable change is that we have dropped tabs for spaces.
* Leverage the [Symfony HttpFoundation](http://symfony.org) components in processing inbound requests in a drive towards framework neutrality.

#### Swagger Changes
* Event, Provider, ProviderUser, and Script resources added to Live API

#### Miscellaneous
* More code cleanup

## v1.4.0 (Released 2014-02-28)
### Major Foundational Changes
* Restructure of the project tree
	* The config/schema and contained files have been moved to the lib-php-common-platform library
	* Added bin/ directory
* More back-end-served pages have been upgraded to use Bootstrap v3.x
* Change Password, Registration and Confirmation pages moved from web/launchpad to PHP controlled views
* Collapse launchpad/img directory to web/img
* Moved common.config.php constants to their own file

### New Features
* Added -i|--interactive flag to installer.sh
* Added new directory /storage/plugins in preparation for our plugin system release.
* Updated aliases to be PSR-4 aware.
* Upgraded logging system to use Monolog
* Added schema, models, and API for device management, UI coming soon

### Bug Fixes
* Updated and corrected many css and code issues for forms and views
* Moved load of aliases and constants to bootstrapper so caching works
* Added local storage of DSP config so it is not constantly requested (disabled by default for now).

### Miscellaneous
* Changed help url, developer page will link to github.
* New text for welcome/support page
* Installer text change, set ownership of composer cache properly

## v1.3.3 (Released 2014-01-03)
* Installer and composer bug fixes

## v1.3.2 (Released 2013-12-31)
* Continued refactoring of Launchpad application into PHP core
* Login page now handled by PHP core
* Admin welcome screen and support registration added
* Portal service updated to allow for multiple portals to the same provider
* Bug fixes

## v1.2.3 (Released 2013-12-11)

### Major Foundational Changes
* Restructure of the project tree
	* The web/document root has been moved from `/web/public` to `/web`
	* `/web` now contains only publicly accessible code
	* All back-end server code has been moved from `/web/protected` to `/app`

* Management apps **app-launchpad** and **app-admin** have been merged into the core
	* Duplicate code removed
	* Libraries updated
	* Removed directory `/shared` and all associated links

* Back-end-served pages have been upgraded to use Bootstrap v3.x

### New Features
* User import/export available in the admin panel
* Support for CSV MIME type
* Import/export from/to file in JSON or XML
* Admin configuration support for default email template.
* Added remote database caching feature
* Application auto-start. Automatically loads an app when a session is active and the user has access
* System-wide maintenance notification added

### Bug Fixes
* Fix for SQL Server spatial/geography types. Return as strings and corrections for MS SQL connections
* Server will now send invite on user creation with **send_invite** url parameter, also supported on batch import.

### Miscellaneous
* `/app/controllers/RestController.php` refactored/simplified

## v1.1.3 (Released 2013-10-31)
* Portal and remote authentication support
* Bug fixes
* More to come

## v1.1.2
* Bug fixes

## v1.1.0

### Major Bug Fixes
* Add description to AppGroup and Role models
* Current user can no longer change their own role(s)
* Permission issues when saving new data
* All remaining open issues from version 1.0.6 fixed

### Major New Features
* Removed most DSP-specific code from Yii routing engine
* Most, if not all, resource access moved to a single class "ResourceStore"
* "/rest/system/constant" call to return system constants for list building
* Swagger annotations removed from code an placed into their own files
* Take "Accept" header into account for determination of content
* Config call now returns any available remote authentication providers
* Added new service to retrieve and update data from Salesforce
* New authentication provider service using the Oasys library
* Remote login services added to core and app-launchpad
* Added support for "global" authentication providers for enterprise customers
* Added ability to control CRUD access to system resources (User, App, etc.) through the Roles Admin Settings.

### Major Foundational Changes
* Most system types (i.e. service, storage, etc.) are now numeric instead of hard-coded strings
* Services now configured from /config/services.config.php instead of being hard-coded
* /src tree removed, replaced by new Composer libraries (lib-php-common-platform)
* Prep work for new "portal" service (future release)
* Prep work for moving to Bootstrap v3.x (future release)
* Prep work for new administration dashboard (future release)
